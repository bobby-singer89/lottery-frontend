# Finance Model Implementation - Complete Guide

This document provides a complete overview of the finance model implementation for the lottery system.

## Overview

The finance model implements a 50/50 split between prizes and platform revenue, with dynamic prize calculation and financial tracking.

## Financial Distribution Model

```
100% of ticket sales
├─ 50% → Prize Fund
│  ├─ 15% → Jackpot (grows over time)
│  └─ 85% → Dynamic Payouts
│     ├─ 60% → 4/5 match category
│     ├─ 30% → 3/5 match category
│     └─ 10% → 2/5 match category
│
└─ 50% → Platform
   ├─ 10% → Reserve Fund (insurance)
   └─ 90% → Revenue (development, marketing, operations)
```

### Example (1 TON ticket):
```
Total: 1 TON
├─ Prize Fund: 0.5 TON
│  ├─ Jackpot: 0.075 TON (15%)
│  └─ Payouts Pool: 0.425 TON (85%)
│
└─ Platform: 0.5 TON
   ├─ Reserve: 0.05 TON (10%)
   └─ Revenue: 0.45 TON (90%)
```

## Implementation Components

### 1. Database Schema

**Location**: `backend/migrations/001_finance_model.sql`

Four main changes:

1. **Lottery Table Updates**
   - `prizeFundPercentage` (DECIMAL) - Default 0.50 (50%)
   - `jackpotPercentage` (DECIMAL) - Default 0.15 (15%)
   - `platformPercentage` (DECIMAL) - Default 0.50 (50%)
   - `reservePercentage` (DECIMAL) - Default 0.10 (10%)

2. **PrizeDistribution Table**
   - Stores prize distribution rules per lottery
   - Supports dynamic (percentage) or fixed prize amounts
   - Pre-configured for Weekend Special lottery

3. **FinancialTransaction Table**
   - Logs all financial operations
   - Types: ticket_sale, prize_payout, jackpot_contribution, platform_revenue, reserve_contribution
   - Indexed for fast analytics queries

4. **ReserveFund Table**
   - Tracks reserve fund balance by currency
   - Supports TON and USDT

**Installation**: See `backend/migrations/README.md`

### 2. Backend Services

#### FinanceService

**Location**: `backend/src/services/financeService.ts`

**Key Methods**:

```typescript
// Calculate how a ticket price is distributed
calculateTicketDistribution(ticketPrice: number, lotteryId: string): Promise<TicketDistribution>

// Record financial transactions when a ticket is sold
recordTicketSale(ticketId: string, lotteryId: string, drawId: string, ticketPrice: number, currency: string): Promise<TicketDistribution>

// Update lottery jackpot
updateJackpot(lotteryId: string, contribution: number): Promise<number>

// Update reserve fund
updateReserveFund(currency: string, amount: number): Promise<number>

// Calculate dynamic prize for a match category
calculateDynamicPrize(lotteryId: string, matchCount: number, winnersCount: Record<number, number>, totalPayoutPool: number): Promise<number>

// Get financial summary for a draw
getDrawFinancials(drawId: string): Promise<DrawFinancials>

// Get lottery statistics
getLotteryStats(lotteryId: string): Promise<LotteryStats>

// Reset jackpot after win
resetJackpot(lotteryId: string, seedAmount: number): Promise<number>
```

**Usage Example**:

```typescript
import { financeService } from './services/financeService';

// Calculate distribution for a 1 TON ticket
const distribution = await financeService.calculateTicketDistribution(1.0, 'lottery-id');
// Returns:
// {
//   total: 1.0,
//   prizeFund: 0.5,
//   jackpotContribution: 0.075,
//   payoutPool: 0.425,
//   platform: 0.5,
//   reserve: 0.05,
//   revenue: 0.45
// }
```

### 3. Backend Routes

#### Lottery Routes

**Location**: `backend/src/routes/lottery.ts`

**Endpoints**:

1. **POST /api/lottery/:slug/buy-ticket**
   - Purchase a single lottery ticket
   - Automatically records financial transactions
   - Updates jackpot and reserve fund

   ```bash
   curl -X POST http://localhost:3001/api/lottery/weekend-special/buy-ticket \
     -H "Content-Type: application/json" \
     -d '{
       "numbers": [1, 5, 12, 23, 36],
       "txHash": "0x...",
       "walletAddress": "UQ..."
     }'
   ```

2. **POST /api/tickets/purchase-bulk**
   - Purchase multiple tickets in one transaction
   - Batch processing with individual finance recording

   ```bash
   curl -X POST http://localhost:3001/api/tickets/purchase-bulk \
     -H "Content-Type: application/json" \
     -d '{
       "tickets": [
         {"numbers": [1,2,3,4,5], "txHash": "0x...", "walletAddress": "UQ..."},
         {"numbers": [6,7,8,9,10], "txHash": "0x...", "walletAddress": "UQ..."}
       ],
       "lotterySlug": "weekend-special"
     }'
   ```

#### Admin Finance Routes

**Location**: `backend/src/routes/admin/finance.ts`

**Endpoints** (require `X-Admin-Key` header):

1. **GET /api/admin/finance/lottery/:lotteryId/stats**
   - Get financial statistics for a lottery
   - Returns total tickets sold, revenue, prizes paid, etc.

2. **GET /api/admin/finance/draw/:drawId**
   - Get financial summary for a specific draw
   - Returns revenue breakdown, ticket count, etc.

3. **GET /api/admin/finance/reserve**
   - Get current reserve fund balances
   - Returns balance for each currency

4. **GET /api/admin/finance/transactions**
   - List financial transactions
   - Supports filtering by type, pagination

**Example**:

```bash
curl -X GET http://localhost:3001/api/admin/finance/lottery/lottery-id/stats \
  -H "X-Admin-Key: your-admin-key"
```

### 4. Draw Execution Updates

**Location**: `backend/src/services/drawScheduler.ts`

**Changes**:

- Imported `financeService`
- Added `getDrawFinancials()` call before prize calculation
- Replaced fixed prizes with dynamic calculation using `calculateDynamicPrize()`
- Added jackpot reset after 5/5 match win
- Records prize payout transactions

**Dynamic Prize Flow**:

1. Count winners in each category (5/5, 4/5, 3/5, 2/5, 1/5)
2. Get draw financials (total payout pool)
3. For each winner:
   - Calculate prize using `financeService.calculateDynamicPrize()`
   - Update ticket with prize amount
   - Record financial transaction
   - Queue payout

### 5. Frontend Components

#### FinanceStats Component

**Location**: `src/components/Admin/FinanceStats.tsx`

**Purpose**: Display financial statistics for admin dashboard

**Props**:
```typescript
interface FinanceStatsProps {
  lotteryId: string;
}
```

**Usage**:
```tsx
import FinanceStats from './components/Admin/FinanceStats';

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <FinanceStats lotteryId="lottery-id" />
    </div>
  );
}
```

**Features**:
- Automatic data fetching
- Loading and error states
- Responsive grid layout
- Displays: Total tickets sold, total revenue, total prizes paid, jackpot growth, reserve fund

## Testing

### Automated Tests

**Location**: `backend/tests/financeCalculations.js`

Run tests:
```bash
cd backend
node tests/financeCalculations.js
```

**Expected Output**:
```
All Tests: ✅ PASSED
```

### Manual Testing

See `FINANCE_TESTING_GUIDE.md` for:
- Step-by-step testing scenarios
- API testing examples
- Database verification queries
- Math verification

## Configuration

### Environment Variables

```bash
# Backend (.env)
ADMIN_API_KEY=your-secure-admin-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

```bash
# Frontend (.env)
VITE_ADMIN_API_KEY=your-secure-admin-key
```

### Database Configuration

All percentages are stored in the `Lottery` table and can be customized per lottery:

```sql
UPDATE public."Lottery"
SET 
  "prizeFundPercentage" = 0.50,    -- 50% to prizes
  "jackpotPercentage" = 0.15,       -- 15% of prize fund to jackpot
  "platformPercentage" = 0.50,      -- 50% to platform
  "reservePercentage" = 0.10        -- 10% of platform to reserve
WHERE "slug" = 'weekend-special';
```

## Security Considerations

1. **Admin API Key**: Must be kept secure and not exposed in frontend code
2. **Financial Transactions**: Immutable - never update or delete
3. **Input Validation**: All financial inputs validated before processing
4. **Audit Trail**: All operations logged in FinancialTransaction table
5. **Monitoring**: Set up alerts for unusual patterns

## Performance Optimization

### Database Indexes

The migration creates indexes on:
- `FinancialTransaction.type`
- `FinancialTransaction.lotteryId`
- `FinancialTransaction.drawId`
- `FinancialTransaction.createdAt`
- `PrizeDistribution.lotteryId`

### Query Optimization

- Financial calculations cached in draw execution
- Batch processing for bulk ticket purchases
- Lottery config cached (avoid repeated DB queries)

## Troubleshooting

### Issue: Jackpot not updating

**Solution**: 
1. Check Lottery table has financial config columns
2. Verify financeService.recordTicketSale is called
3. Check FinancialTransaction table for jackpot_contribution records

### Issue: Reserve fund not accumulating

**Solution**:
1. Verify ReserveFund table exists
2. Check currency matches ticket currency
3. Review FinancialTransaction table for reserve_contribution records

### Issue: Dynamic prizes calculating to 0

**Solution**:
1. Verify PrizeDistribution table has records for lottery
2. Check match count is between 1-5
3. Ensure payout pool > 0

## API Reference

### FinanceService API

See inline JSDoc comments in `backend/src/services/financeService.ts`

### REST API

Full API documentation:

**Ticket Purchase**:
- `POST /api/lottery/:slug/buy-ticket` - Buy single ticket
- `POST /api/tickets/purchase-bulk` - Buy multiple tickets

**Admin Finance**:
- `GET /api/admin/finance/lottery/:lotteryId/stats` - Lottery stats
- `GET /api/admin/finance/draw/:drawId` - Draw financials
- `GET /api/admin/finance/reserve` - Reserve fund balance
- `GET /api/admin/finance/transactions` - Transaction history

## Maintenance

### Regular Tasks

1. **Monitor Reserve Fund**: Ensure it's growing appropriately
2. **Review Transactions**: Check for anomalies weekly
3. **Verify Jackpot Growth**: Compare to expected growth rate
4. **Database Cleanup**: Archive old transactions (optional)

### Monitoring Queries

```sql
-- Check daily revenue
SELECT 
  DATE("createdAt") as date,
  SUM("amount") as daily_revenue
FROM "FinancialTransaction"
WHERE "type" = 'ticket_sale'
GROUP BY DATE("createdAt")
ORDER BY date DESC;

-- Check reserve fund growth
SELECT 
  "currency",
  "balance",
  "updatedAt"
FROM "ReserveFund";

-- Check recent jackpot contributions
SELECT 
  DATE("createdAt") as date,
  COUNT(*) as ticket_count,
  SUM("amount") as jackpot_growth
FROM "FinancialTransaction"
WHERE "type" = 'jackpot_contribution'
GROUP BY DATE("createdAt")
ORDER BY date DESC
LIMIT 7;
```

## Support

For issues or questions:
1. Check `FINANCE_TESTING_GUIDE.md`
2. Run automated tests
3. Review database migration logs
4. Check backend server logs

## License

Part of the lottery-frontend project.
