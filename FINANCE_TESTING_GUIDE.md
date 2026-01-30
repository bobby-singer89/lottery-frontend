# Finance Model Testing Guide

This document provides test scenarios and verification steps for the finance model implementation.

## Financial Distribution Model

```
100% of ticket sales (1 TON example)
├─ 50% → Prize Fund (0.5 TON)
│  ├─ 15% → Jackpot (0.075 TON)
│  └─ 85% → Dynamic Payouts (0.425 TON)
│     ├─ 60% → 4/5 match category (0.255 TON)
│     ├─ 30% → 3/5 match category (0.1275 TON)
│     └─ 10% → 2/5 match category (0.0425 TON)
│
└─ 50% → Platform (0.5 TON)
   ├─ 10% → Reserve Fund (0.05 TON)
   └─ 90% → Revenue (0.45 TON)
```

## Mathematical Verification

### For 1 TON Ticket Price:

```javascript
Total: 1.00 TON

// Prize Fund (50%)
prizeFund = 1.00 * 0.50 = 0.50 TON

// Jackpot (15% of prize fund)
jackpot = 0.50 * 0.15 = 0.075 TON

// Payout Pool (85% of prize fund)
payoutPool = 0.50 * 0.85 = 0.425 TON

// Platform Share (50%)
platform = 1.00 * 0.50 = 0.50 TON

// Reserve Fund (10% of platform)
reserve = 0.50 * 0.10 = 0.05 TON

// Revenue (90% of platform)
revenue = 0.50 * 0.90 = 0.45 TON

// Verification
prizeFund + platform = 0.50 + 0.50 = 1.00 ✓
jackpot + payoutPool = 0.075 + 0.425 = 0.50 ✓
reserve + revenue = 0.05 + 0.45 = 0.50 ✓
```

### Payout Pool Distribution:

```javascript
payoutPool = 0.425 TON

// 4/5 match (60%)
match4Pool = 0.425 * 0.60 = 0.255 TON

// 3/5 match (30%)
match3Pool = 0.425 * 0.30 = 0.1275 TON

// 2/5 match (10%)
match2Pool = 0.425 * 0.10 = 0.0425 TON

// Verification
0.255 + 0.1275 + 0.0425 = 0.425 ✓
```

## Test Scenarios

### Scenario 1: Single Ticket Purchase (1 TON)

**Expected Results:**
- Total ticket price: 1.00 TON
- Prize fund: 0.50 TON
- Jackpot contribution: 0.075 TON
- Payout pool: 0.425 TON
- Platform revenue: 0.45 TON
- Reserve fund: 0.05 TON

**Database Records:**
- 4 FinancialTransaction records:
  1. ticket_sale (1.00 TON)
  2. jackpot_contribution (0.075 TON)
  3. platform_revenue (0.45 TON)
  4. reserve_contribution (0.05 TON)

### Scenario 2: 100 Tickets Sold

**Input:** 100 tickets × 1 TON = 100 TON

**Expected Results:**
- Total revenue: 100 TON
- Total prize fund: 50 TON
- Total jackpot growth: 7.5 TON
- Total payout pool: 42.5 TON
- Total platform revenue: 45 TON
- Total reserve fund: 5 TON

### Scenario 3: Dynamic Prize Calculation

**Setup:**
- 100 tickets sold = 42.5 TON payout pool
- Winners: 2 with 4/5 match, 5 with 3/5 match, 10 with 2/5 match

**Expected Prizes:**

```javascript
// 4/5 match (60% of pool)
match4Pool = 42.5 * 0.60 = 25.5 TON
prizePerWinner = 25.5 / 2 = 12.75 TON each

// 3/5 match (30% of pool)
match3Pool = 42.5 * 0.30 = 12.75 TON
prizePerWinner = 12.75 / 5 = 2.55 TON each

// 2/5 match (10% of pool)
match2Pool = 42.5 * 0.10 = 4.25 TON
prizePerWinner = 4.25 / 10 = 0.425 TON each
```

### Scenario 4: Jackpot Win

**Setup:**
- Current jackpot: 100 TON
- 1 winner with 5/5 match

**Expected Results:**
- Winner receives: 100 TON
- Jackpot reset to: 1000 TON (seed amount)
- FinancialTransaction record: prize_payout (100 TON)

## API Testing

### 1. Get Draw Financials

```bash
curl -X GET http://localhost:3001/api/admin/finance/draw/{drawId} \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "financials": {
    "totalRevenue": 100,
    "prizeFund": 50,
    "jackpotContribution": 7.5,
    "payoutPool": 42.5,
    "platformRevenue": 45,
    "reserve": 5,
    "ticketsSold": 100,
    "currency": "TON"
  }
}
```

### 2. Get Lottery Stats

```bash
curl -X GET http://localhost:3001/api/admin/finance/lottery/{lotteryId}/stats \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalTicketsSold": 500,
    "totalRevenue": 500,
    "totalPrizesPaid": 150,
    "totalJackpotGrowth": 37.5,
    "totalReserve": 25
  }
}
```

### 3. Get Reserve Fund Balance

```bash
curl -X GET http://localhost:3001/api/admin/finance/reserve \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"
```

**Expected Response:**
```json
{
  "success": true,
  "reserves": [
    {
      "currency": "TON",
      "balance": 25,
      "updatedAt": "2024-01-30T17:00:00.000Z"
    },
    {
      "currency": "USDT",
      "balance": 0,
      "updatedAt": "2024-01-30T17:00:00.000Z"
    }
  ]
}
```

### 4. Get Financial Transactions

```bash
curl -X GET "http://localhost:3001/api/admin/finance/transactions?limit=10&type=ticket_sale" \
  -H "X-Admin-Key: YOUR_ADMIN_KEY"
```

## Manual Testing Steps

### Step 1: Run Database Migration

1. Open Supabase SQL Editor
2. Execute `backend/migrations/001_finance_model.sql`
3. Verify all tables created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('PrizeDistribution', 'FinancialTransaction', 'ReserveFund');
   ```

### Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

### Step 3: Purchase a Test Ticket

```bash
curl -X POST http://localhost:3001/api/lottery/weekend-special/buy-ticket \
  -H "Content-Type: application/json" \
  -d '{
    "numbers": [1, 5, 12, 23, 36],
    "txHash": "test_tx_hash_123",
    "walletAddress": "UQ..."
  }'
```

### Step 4: Verify Financial Records

```sql
-- Check ticket was created
SELECT * FROM "Ticket" ORDER BY "createdAt" DESC LIMIT 1;

-- Check financial transactions
SELECT * FROM "FinancialTransaction" 
WHERE "ticketId" = '<ticket_id_from_above>'
ORDER BY "createdAt";

-- Check jackpot updated
SELECT "jackpot" FROM "Lottery" 
WHERE "slug" = 'weekend-special';

-- Check reserve fund updated
SELECT * FROM "ReserveFund" 
WHERE "currency" = 'TON';
```

### Step 5: Verify Math

Use the calculator to verify:
```javascript
// In browser console or Node.js REPL
const ticketPrice = 1.00;
const prizeFund = ticketPrice * 0.50;
const jackpot = prizeFund * 0.15;
const payoutPool = prizeFund * 0.85;
const platform = ticketPrice * 0.50;
const reserve = platform * 0.10;
const revenue = platform * 0.90;

console.log({
  total: ticketPrice,
  prizeFund,
  jackpot,
  payoutPool,
  platform,
  reserve,
  revenue,
  sum: prizeFund + platform,
  sumCheck: sum === ticketPrice // should be true
});
```

## Validation Checklist

- [ ] All database tables created successfully
- [ ] Financial transactions recorded for each ticket sale
- [ ] Jackpot increases by 7.5% per ticket (for 1 TON ticket)
- [ ] Reserve fund increases by 5% per ticket
- [ ] Platform revenue increases by 45% per ticket
- [ ] Prize distribution percentages sum to 100%
- [ ] Dynamic prizes calculate correctly
- [ ] Multiple currencies (TON, USDT) supported
- [ ] API endpoints return correct data
- [ ] Math verification: 50% prizes + 50% platform = 100%

## Common Issues and Solutions

### Issue 1: Financial transactions not recorded
**Solution:** Check that financeService.recordTicketSale is called in the ticket purchase route.

### Issue 2: Jackpot not updating
**Solution:** Verify the Lottery table has the new financial configuration columns.

### Issue 3: Reserve fund balance incorrect
**Solution:** Check the ReserveFund table exists and has records for each currency.

### Issue 4: Dynamic prize calculation returns 0
**Solution:** Verify PrizeDistribution table has records for the lottery.

## Performance Considerations

- For high-volume ticket sales, consider batching financial transactions
- Index the FinancialTransaction table on frequently queried columns
- Cache lottery financial configuration to reduce database queries
- Use database triggers for automatic jackpot updates (advanced)

## Security Considerations

- Admin API key must be kept secure
- Financial transactions should be immutable (no updates/deletes)
- Validate all input data before creating financial records
- Log all financial operations for audit trail
- Monitor for unusual patterns (e.g., jackpot manipulation attempts)
