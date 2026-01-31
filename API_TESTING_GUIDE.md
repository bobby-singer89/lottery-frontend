# API Testing Guide - Step 9 Draw System

## Prerequisites

1. Backend server running on `http://localhost:3001`
2. Admin API key configured in `.env` as `ADMIN_API_KEY`
3. Database migrations applied (run `009_draw_system.sql`)
4. Test lottery and draw created

---

## Quick Test Scenarios

### Scenario 1: Complete Draw Flow

```bash
# 1. Get list of scheduled draws
curl http://localhost:3001/api/admin/draws \
  -H "x-admin-key: YOUR_ADMIN_KEY"

# 2. Execute a draw (replace LOTTERY_ID)
curl -X POST http://localhost:3001/api/admin/draws/LOTTERY_ID/execute \
  -H "x-admin-key: YOUR_ADMIN_KEY" \
  -H "Content-Type: application/json"

# Response example:
# {
#   "success": true,
#   "draw": {
#     "id": "uuid",
#     "winningNumbers": [5, 12, 23, 31, 36],
#     "totalWinners": 3,
#     "totalPrizePool": 150.00
#   },
#   "winners": [...]
# }

# 3. View public results (replace DRAW_ID)
curl http://localhost:3001/api/draws/DRAW_ID/results

# 4. Verify draw fairness
curl http://localhost:3001/api/draws/DRAW_ID/verify
```

### Scenario 2: View Draw Details

```bash
# Get draw details with winners (replace DRAW_ID)
curl http://localhost:3001/api/admin/draws/DRAW_ID \
  -H "x-admin-key: YOUR_ADMIN_KEY"

# Response includes:
# - Draw information
# - All winning tickets
# - Payout status for each winner
```

### Scenario 3: Check Latest Draw

```bash
# Get latest draw for Weekend Special
curl http://localhost:3001/api/draws/lottery/weekend-special/latest

# Response:
# {
#   "success": true,
#   "draw": {
#     "id": "uuid",
#     "drawDate": "2026-01-31T20:00:00Z",
#     "winningNumbers": [5, 12, 23, 31, 36],
#     "totalWinners": 3,
#     "totalPrizePool": 150.00
#   }
# }
```

---

## Expected Response Formats

### Public Draw Results

```json
{
  "success": true,
  "draw": {
    "id": "uuid",
    "lotteryId": "lottery-id",
    "lotteryName": "Weekend Special",
    "drawDate": "2026-01-31T20:00:00Z",
    "winningNumbers": [5, 12, 23, 31, 36],
    "totalPrizePool": 150.00,
    "totalWinners": 3,
    "status": "completed"
  },
  "winnersByTier": {
    "5": { "count": 1, "totalPrize": 105.00 },
    "4": { "count": 1, "totalPrize": 30.00 },
    "3": { "count": 1, "totalPrize": 15.00 }
  }
}
```

### Verification Data

```json
{
  "success": true,
  "verification": {
    "drawId": "uuid",
    "seed": "abc123...",
    "seedHash": "def456...",
    "winningNumbers": [5, 12, 23, 31, 36],
    "blockHash": "0x789...",
    "blockHeight": 12345
  }
}
```

---

## Error Scenarios

### 1. Draw Not Found
```bash
curl http://localhost:3001/api/draws/invalid-id/results

# Response (404):
# {
#   "error": "Draw not found"
# }
```

### 2. Draw Not Completed
```bash
# Trying to view results of scheduled draw
curl http://localhost:3001/api/draws/DRAW_ID/results

# Response (400):
# {
#   "error": "Draw not completed yet"
# }
```

### 3. Unauthorized Admin Access
```bash
curl http://localhost:3001/api/admin/draws \
  -H "x-admin-key: WRONG_KEY"

# Response (403):
# {
#   "error": "Forbidden"
# }
```

---

## Database Verification

After executing a draw, verify in the database:

```sql
-- Check draw was completed
SELECT id, status, "winningNumbers", "totalWinners", "totalPaid"
FROM "Draw"
WHERE id = 'DRAW_ID';

-- Check winning tickets
SELECT id, numbers, "matchedNumbers", "prizeAmount", status
FROM "Ticket"
WHERE "drawId" = 'DRAW_ID' AND status = 'won';

-- Check payouts queued
SELECT id, "ticketId", amount, status, attempts
FROM "Payout"
WHERE "ticketId" IN (
  SELECT id FROM "Ticket" WHERE "drawId" = 'DRAW_ID' AND status = 'won'
);

-- Check audit log
SELECT action, details, "createdAt"
FROM "AuditLog"
WHERE "drawId" = 'DRAW_ID'
ORDER BY "createdAt" DESC;
```

---

## Frontend Testing

### 1. Navigate to Draw Results
```
http://localhost:5173/draw/DRAW_ID/results
```

**Expected:**
- Lottery name and draw date displayed
- 5 animated number balls with winning numbers
- Prize pool and winner count
- Winners breakdown by tier (5/5, 4/5, 3/5)
- Links to verify and check tickets

### 2. Verify Draw Fairness
```
http://localhost:5173/verify/DRAW_ID
```

**Expected:**
- Seed and seed hash displayed
- Winning numbers shown
- Verification instructions

---

## Common Issues

### Issue 1: Payout Not Processing
**Check:**
- Payout queue cron job is running
- Wallet is initialized
- Wallet has sufficient balance
- No errors in server logs

**Debug:**
```sql
SELECT * FROM "Payout" WHERE status = 'failed';
```

### Issue 2: No Winners Detected
**Check:**
- Tickets exist for the draw
- Winning numbers were generated
- Ticket numbers match winning numbers

**Debug:**
```sql
-- Check tickets for draw
SELECT id, numbers FROM "Ticket" WHERE "drawId" = 'DRAW_ID';

-- Check winning numbers
SELECT "winningNumbers" FROM "Draw" WHERE id = 'DRAW_ID';
```

### Issue 3: Prize Calculation Wrong
**Check:**
- Finance service is configured correctly
- Prize distribution percentages are set
- Payout pool calculation is correct

**Debug:**
```sql
-- Check financial transactions
SELECT * FROM "FinancialTransaction" WHERE "drawId" = 'DRAW_ID';
```

---

## Automated Testing Script

Create `test-draw-system.sh`:

```bash
#!/bin/bash

API_URL="http://localhost:3001"
ADMIN_KEY="your-admin-key-here"
LOTTERY_ID="your-lottery-id"

echo "=== Testing Draw System ==="

echo "\n1. Listing draws..."
curl -s "$API_URL/api/admin/draws" \
  -H "x-admin-key: $ADMIN_KEY" | jq '.draws | length'

echo "\n2. Executing draw..."
RESULT=$(curl -s -X POST "$API_URL/api/admin/draws/$LOTTERY_ID/execute" \
  -H "x-admin-key: $ADMIN_KEY" \
  -H "Content-Type: application/json")

DRAW_ID=$(echo $RESULT | jq -r '.draw.id')
echo "Draw ID: $DRAW_ID"

echo "\n3. Getting public results..."
curl -s "$API_URL/api/draws/$DRAW_ID/results" | jq '.draw.winningNumbers'

echo "\n4. Getting verification data..."
curl -s "$API_URL/api/draws/$DRAW_ID/verify" | jq '.verification | keys'

echo "\n=== Test Complete ==="
```

---

## Performance Testing

### Load Test Draw Execution
```bash
# Execute multiple draws in parallel
for i in {1..5}; do
  curl -X POST http://localhost:3001/api/admin/draws/LOTTERY_ID/execute \
    -H "x-admin-key: YOUR_ADMIN_KEY" &
done
wait
```

### Monitor Payout Processing
```bash
# Watch payout queue
while true; do
  curl -s http://localhost:3001/api/admin/draws/DRAW_ID \
    -H "x-admin-key: YOUR_ADMIN_KEY" \
    | jq '.winners[] | select(.payoutStatus == "pending") | .id'
  sleep 5
done
```

---

## Success Metrics

After testing, verify:
- ✅ Draws execute successfully
- ✅ Winners detected correctly
- ✅ Prizes calculated accurately
- ✅ Payouts queued for all winners
- ✅ Public results accessible
- ✅ Verification data available
- ✅ Frontend displays results properly
- ✅ No errors in server logs
- ✅ Database consistency maintained
