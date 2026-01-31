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


---

## Migration: 010_gamification_system.sql

### NEW Gamification System

This migration adds a complete gamification system to the lottery application.

### What This Migration Does

Creates 11 new tables for gamification features:

#### 1. UserProfile Table
- Extended user profiles with level, XP, and statistics
- Links to the existing User table via userId
- Tracks:
  - User level (starts at 1)
  - Experience points (XP)
  - Total tickets purchased
  - Total winnings

#### 2. Referral System Tables
- **ReferralCode**: User referral codes for invitations
  - Unique 6-character alphanumeric codes
  - Usage tracking and limits
  - Expiration dates
- **ReferralRelationship**: Tracks referrer-referred relationships
  - Status tracking (pending, active, completed)
  - Reward claim status
- **ReferralReward**: Rewards earned from referrals
  - XP boosts, bonus tickets, discounts
  - Expiration tracking

#### 3. Quest System Tables
- **Quest**: Available quests (daily, weekly, monthly, special)
  - Title, description, type, category
  - Target value and reward structure
  - Difficulty levels
- **UserQuest**: User progress on quests
  - Progress tracking
  - Completion and reward claim status

#### 4. Achievement System Tables
- **Achievement**: Available achievements
  - Name, title, description
  - Category and tier (bronze, silver, gold, diamond, platinum)
  - Requirement and reward structure
- **UserAchievement**: Achievements unlocked by users
  - Unlock timestamp
  - Reward claim status

#### 5. Streak System Table
- **UserStreak**: Daily login streak tracking
  - Current and longest streak
  - Last check-in timestamp
  - Total check-ins and accumulated bonuses

#### 6. Reward System Tables
- **Reward**: Available rewards in the system
  - Type, name, description
  - Value and currency
  - Conditions for receiving
- **UserReward**: Rewards earned by users
  - Claim status and timestamp
  - Expiration tracking
  - Metadata for additional information

### Running the Migration

```bash
# Using psql
psql $DATABASE_URL < migrations/010_gamification_system.sql

# Or via Supabase SQL Editor
# Copy contents of 010_gamification_system.sql and execute
```

### Seeding Initial Data

After running the migration, seed initial quests and achievements:

```bash
psql $DATABASE_URL < backend/prisma/seed.ts
```

This seeds:
- 12 default quests (4 daily, 3 weekly, 3 monthly, 2 special)
- 25+ achievements across 5 categories (tickets, wins, referrals, streak, level)
- 7 default reward types

### Verification

Check that tables were created:

```sql
-- List all gamification tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'UserProfile', 'ReferralCode', 'ReferralRelationship', 'ReferralReward',
    'Quest', 'UserQuest', 'Achievement', 'UserAchievement',
    'UserStreak', 'Reward', 'UserReward'
  );

-- Check seed data
SELECT COUNT(*) as quest_count FROM "Quest";
SELECT COUNT(*) as achievement_count FROM "Achievement";
SELECT COUNT(*) as reward_count FROM "Reward";
```

Expected results:
- 11 tables created
- 12 quests seeded
- 25+ achievements seeded
- 7 rewards seeded

### Rollback (If Needed)

```sql
DROP TABLE IF EXISTS public."UserReward" CASCADE;
DROP TABLE IF EXISTS public."Reward" CASCADE;
DROP TABLE IF EXISTS public."UserStreak" CASCADE;
DROP TABLE IF EXISTS public."UserAchievement" CASCADE;
DROP TABLE IF EXISTS public."Achievement" CASCADE;
DROP TABLE IF EXISTS public."UserQuest" CASCADE;
DROP TABLE IF EXISTS public."Quest" CASCADE;
DROP TABLE IF EXISTS public."ReferralReward" CASCADE;
DROP TABLE IF EXISTS public."ReferralRelationship" CASCADE;
DROP TABLE IF EXISTS public."ReferralCode" CASCADE;
DROP TABLE IF EXISTS public."UserProfile" CASCADE;
```

**Warning**: This will delete all gamification data!

### API Endpoints

After migration, these endpoints become available:

- `/api/gamification/profile` - Get user gamification profile
- `/api/gamification/leaderboard` - Get leaderboard
- `/api/gamification/referral/*` - Referral system
- `/api/gamification/quests/*` - Quest system
- `/api/gamification/achievements/*` - Achievement system
- `/api/gamification/streak/*` - Streak tracking
- `/api/gamification/rewards/*` - Reward management

See [GAMIFICATION_API.md](../../GAMIFICATION_API.md) for complete API documentation.

### Background Jobs

The gamification system runs several cron jobs:
- Daily quest reset: Midnight (00:00)
- Weekly quest reset: Monday midnight
- Monthly quest reset: 1st of month midnight
- Streak checker: Daily at 1 AM
- Reward cleanup: Daily at 2 AM

These are automatically started when the backend initializes.

### Notes

- All tables use UUID for primary keys
- Indexes are created for optimal query performance
- Foreign keys ensure data integrity
- Cascade deletes clean up related data
- The migration is idempotent - safe to run multiple times
- Compatible with existing lottery tables (non-breaking)

