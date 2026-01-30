-- =====================================================
-- Finance Model Implementation - Database Migration
-- =====================================================

-- 1. Update Lottery Table with Financial Configuration
-- =====================================================
ALTER TABLE public."Lottery"
  ADD COLUMN IF NOT EXISTS "prizeFundPercentage" DECIMAL DEFAULT 0.50,      -- 50%
  ADD COLUMN IF NOT EXISTS "jackpotPercentage" DECIMAL DEFAULT 0.15,        -- 15% of prizeFund
  ADD COLUMN IF NOT EXISTS "platformPercentage" DECIMAL DEFAULT 0.50,       -- 50%
  ADD COLUMN IF NOT EXISTS "reservePercentage" DECIMAL DEFAULT 0.10;        -- 10% of platform

-- Update existing lotteries with default percentages
UPDATE public."Lottery"
SET 
  "prizeFundPercentage" = 0.50,
  "jackpotPercentage" = 0.15,
  "platformPercentage" = 0.50,
  "reservePercentage" = 0.10
WHERE "prizeFundPercentage" IS NULL;

-- =====================================================
-- 2. Create Prize Distribution Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public."PrizeDistribution" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "lotteryId" TEXT NOT NULL,
  "matchCount" INTEGER NOT NULL CHECK ("matchCount" BETWEEN 1 AND 5),
  "distributionType" TEXT NOT NULL DEFAULT 'dynamic', -- 'dynamic' or 'fixed'
  "percentage" DECIMAL,           -- For dynamic: percentage of payout pool
  "fixedAmount" DECIMAL,          -- For fixed: fixed prize amount
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  
  UNIQUE("lotteryId", "matchCount")
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_prize_distribution_lottery 
ON public."PrizeDistribution"("lotteryId");

-- Insert default distribution for Weekend Special (dynamic)
INSERT INTO public."PrizeDistribution" ("lotteryId", "matchCount", "distributionType", "percentage")
SELECT 
  l."id",
  match_count,
  'dynamic',
  CASE match_count
    WHEN 4 THEN 0.60  -- 60% of payout pool
    WHEN 3 THEN 0.30  -- 30% of payout pool
    WHEN 2 THEN 0.10  -- 10% of payout pool
    WHEN 1 THEN 0     -- Free ticket (handled separately)
  END
FROM public."Lottery" l
CROSS JOIN (SELECT generate_series(1, 4) AS match_count) AS matches
WHERE l."slug" = 'weekend-special'
ON CONFLICT ("lotteryId", "matchCount") DO NOTHING;

-- =====================================================
-- 3. Create Financial Transactions Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public."FinancialTransaction" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "type" TEXT NOT NULL, -- 'ticket_sale', 'prize_payout', 'jackpot_contribution', 'platform_revenue', 'reserve_contribution'
  "lotteryId" TEXT,
  "drawId" TEXT,
  "ticketId" TEXT,
  "amount" DECIMAL NOT NULL,
  "currency" TEXT NOT NULL,
  "category" TEXT, -- 'prize_fund', 'jackpot', 'payout_pool', 'platform', 'reserve', 'revenue'
  "details" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_financial_type ON public."FinancialTransaction"("type");
CREATE INDEX IF NOT EXISTS idx_financial_lottery ON public."FinancialTransaction"("lotteryId");
CREATE INDEX IF NOT EXISTS idx_financial_draw ON public."FinancialTransaction"("drawId");
CREATE INDEX IF NOT EXISTS idx_financial_created ON public."FinancialTransaction"("createdAt");

-- =====================================================
-- 4. Create Reserve Fund Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public."ReserveFund" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "currency" TEXT NOT NULL UNIQUE,
  "balance" DECIMAL NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Initialize for each currency
INSERT INTO public."ReserveFund" ("currency", "balance")
VALUES ('TON', 0), ('USDT', 0)
ON CONFLICT ("currency") DO NOTHING;

-- =====================================================
-- Migration Complete
-- =====================================================
