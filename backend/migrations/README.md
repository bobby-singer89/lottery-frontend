# Database Migration - Finance Model

This directory contains SQL migrations for the lottery finance system.

## Running the Migrations

### Option 1: Using Supabase SQL Editor (Recommended)

1. Log into your Supabase project
2. Go to the SQL Editor
3. Copy the contents of the migration file you want to run
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

### Option 2: Using psql Command Line

```bash
psql -h <your-supabase-host> -U postgres -d postgres -f migrations/<migration_file>.sql
```

---

## Migration: 001_finance_model.sql

### What This Migration Does

#### 1. Updates Lottery Table
- Adds financial configuration columns:
  - `prizeFundPercentage` (50% - Half of ticket sales go to prizes)
  - `jackpotPercentage` (15% - Percentage of prize fund that goes to jackpot)
  - `platformPercentage` (50% - Half of ticket sales go to platform)
  - `reservePercentage` (10% - Percentage of platform revenue for reserve fund)

#### 2. Creates PrizeDistribution Table
- Stores how prizes are distributed for different match counts
- Supports both dynamic (percentage-based) and fixed prize amounts
- Pre-populates Weekend Special lottery with default distribution:
  - 4/5 match: 60% of payout pool
  - 3/5 match: 30% of payout pool
  - 2/5 match: 10% of payout pool

#### 3. Creates FinancialTransaction Table
- Tracks all financial transactions:
  - Ticket sales
  - Prize payouts
  - Jackpot contributions
  - Platform revenue
  - Reserve fund contributions
- Includes indexed columns for fast analytics queries

#### 4. Creates ReserveFund Table
- Tracks reserve fund balance by currency
- Initialized with TON and USDT currencies

### Financial Model Overview

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

---

## Migration: add_test_lotteries.sql

### Add Test Lotteries

Run this SQL to populate the database with test lottery data:

```bash
# Using psql
psql -U your_user -d lottery_db -f migrations/add_test_lotteries.sql

# Using Supabase SQL Editor
# Copy and paste the contents of add_test_lotteries.sql into Supabase SQL Editor and run
```

### Verify Migration

After running, you should see:
- 3 TON lotteries (Mega Jackpot, Weekend Special, Daily Draw)
- 3 USDT lotteries (USDT Mega Pool, USDT Weekend, USDT Quick Draw)

Check with:
```sql
SELECT COUNT(*), currency FROM "Lottery" GROUP BY currency;
```

Expected result:
```
count | currency
------+---------
    3 | TON
    3 | USDT
```

---

## Verification

After running the migration, verify the tables were created:

```sql
-- Check Lottery table columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'Lottery' 
  AND column_name IN ('prizeFundPercentage', 'jackpotPercentage', 'platformPercentage', 'reservePercentage');

-- Check PrizeDistribution table
SELECT * FROM "PrizeDistribution";

-- Check ReserveFund table
SELECT * FROM "ReserveFund";

-- Check FinancialTransaction table structure
\d "FinancialTransaction"
```

## Rollback (If Needed)

If you need to rollback this migration:

```sql
-- Remove added columns from Lottery
ALTER TABLE public."Lottery"
  DROP COLUMN IF EXISTS "prizeFundPercentage",
  DROP COLUMN IF EXISTS "jackpotPercentage",
  DROP COLUMN IF EXISTS "platformPercentage",
  DROP COLUMN IF EXISTS "reservePercentage";

-- Drop new tables
DROP TABLE IF EXISTS public."PrizeDistribution";
DROP TABLE IF EXISTS public."FinancialTransaction";
DROP TABLE IF EXISTS public."ReserveFund";
```

## Notes

- This migration uses `IF NOT EXISTS` and `IF EXISTS` clauses, so it's safe to run multiple times
- All new columns have default values, so existing lottery records will be automatically updated
- The migration is idempotent - running it multiple times won't cause errors or duplicate data

