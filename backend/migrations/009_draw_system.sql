-- =====================================================
-- Draw System Tables - Migration 009
-- =====================================================

-- =====================================================
-- 1. Ensure Draw Table Exists with All Columns
-- =====================================================
CREATE TABLE IF NOT EXISTS public."Draw" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "lotteryId" TEXT NOT NULL,
  "drawNumber" INTEGER,
  "scheduledAt" TIMESTAMP NOT NULL,
  "executedAt" TIMESTAMP,
  "winningNumbers" INTEGER[],
  "blockHash" TEXT,
  "blockHeight" INTEGER,
  "seed" TEXT,
  "seedHash" TEXT,
  "seedHashPublishedAt" TIMESTAMP,
  "seedRevealedAt" TIMESTAMP,
  "totalPrizePool" DECIMAL DEFAULT 0,
  "totalTickets" INTEGER DEFAULT 0,
  "totalWinners" INTEGER DEFAULT 0,
  "totalPaid" DECIMAL DEFAULT 0,
  "winners" JSONB DEFAULT '{}',
  "status" TEXT DEFAULT 'scheduled', -- scheduled, completed, failed, cancelled
  "ticketSalesOpen" BOOLEAN DEFAULT true,
  "ticketSalesClosedAt" TIMESTAMP,
  "dataFinalized" BOOLEAN,
  "dataFinalizedAt" TIMESTAMP,
  "auditLog" JSONB DEFAULT '[]',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);

-- Add missing columns if table already exists
DO $$ 
BEGIN
  -- Add columns that might be missing
  ALTER TABLE public."Draw" ADD COLUMN IF NOT EXISTS "blockHash" TEXT;
  ALTER TABLE public."Draw" ADD COLUMN IF NOT EXISTS "blockHeight" INTEGER;
  ALTER TABLE public."Draw" ADD COLUMN IF NOT EXISTS "seed" TEXT;
  ALTER TABLE public."Draw" ADD COLUMN IF NOT EXISTS "seedHash" TEXT;
  ALTER TABLE public."Draw" ADD COLUMN IF NOT EXISTS "totalPaid" DECIMAL DEFAULT 0;
  ALTER TABLE public."Draw" ADD COLUMN IF NOT EXISTS "winners" JSONB DEFAULT '{}';
END $$;

-- Indexes for Draw table
CREATE INDEX IF NOT EXISTS idx_draw_lottery ON public."Draw"("lotteryId");
CREATE INDEX IF NOT EXISTS idx_draw_status ON public."Draw"("status");
CREATE INDEX IF NOT EXISTS idx_draw_scheduled ON public."Draw"("scheduledAt");

-- =====================================================
-- 2. Ensure Ticket Table has Draw Columns
-- =====================================================
CREATE TABLE IF NOT EXISTS public."Ticket" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "lotteryId" TEXT NOT NULL,
  "drawId" UUID,
  "userId" TEXT,
  "numbers" INTEGER[] NOT NULL,
  "walletAddress" TEXT NOT NULL,
  "txHash" TEXT,
  "price" DECIMAL NOT NULL,
  "currency" TEXT NOT NULL,
  "status" TEXT DEFAULT 'pending', -- pending, won, lost
  "matchedNumbers" INTEGER DEFAULT 0,
  "prizeAmount" DECIMAL DEFAULT 0,
  "prizeClaimed" BOOLEAN DEFAULT false,
  "prizeClaimedAt" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Add draw-related columns if they don't exist
DO $$
BEGIN
  ALTER TABLE public."Ticket" ADD COLUMN IF NOT EXISTS "drawId" UUID;
  ALTER TABLE public."Ticket" ADD COLUMN IF NOT EXISTS "matchedNumbers" INTEGER DEFAULT 0;
  ALTER TABLE public."Ticket" ADD COLUMN IF NOT EXISTS "prizeAmount" DECIMAL DEFAULT 0;
  ALTER TABLE public."Ticket" ADD COLUMN IF NOT EXISTS "prizeClaimed" BOOLEAN DEFAULT false;
  ALTER TABLE public."Ticket" ADD COLUMN IF NOT EXISTS "prizeClaimedAt" TIMESTAMP;
END $$;

-- Indexes for Ticket table
CREATE INDEX IF NOT EXISTS idx_ticket_draw ON public."Ticket"("drawId");
CREATE INDEX IF NOT EXISTS idx_ticket_wallet ON public."Ticket"("walletAddress");
CREATE INDEX IF NOT EXISTS idx_ticket_status ON public."Ticket"("status");

-- =====================================================
-- 3. Create Winner Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public."Winner" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "drawId" UUID NOT NULL,
  "ticketId" UUID NOT NULL,
  "userId" TEXT,
  "tier" INTEGER NOT NULL, -- 3, 4, or 5 (number of matches)
  "matches" INTEGER NOT NULL,
  "prizeAmount" DECIMAL NOT NULL,
  "paidOut" BOOLEAN DEFAULT false,
  "payoutTxHash" TEXT,
  "notified" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes for Winner table
CREATE INDEX IF NOT EXISTS idx_winner_draw ON public."Winner"("drawId");
CREATE INDEX IF NOT EXISTS idx_winner_ticket ON public."Winner"("ticketId");
CREATE INDEX IF NOT EXISTS idx_winner_tier ON public."Winner"("tier");
CREATE INDEX IF NOT EXISTS idx_winner_paidout ON public."Winner"("paidOut");

-- =====================================================
-- 4. Create Payout Table
-- =====================================================
CREATE TABLE IF NOT EXISTS public."Payout" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "winnerId" UUID,
  "ticketId" UUID,
  "walletAddress" TEXT NOT NULL,
  "amount" DECIMAL NOT NULL,
  "currency" TEXT NOT NULL,
  "status" TEXT DEFAULT 'pending', -- pending, processing, completed, failed
  "txHash" TEXT,
  "attempts" INTEGER DEFAULT 0,
  "lastError" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "processedAt" TIMESTAMP
);

-- Indexes for Payout table
CREATE INDEX IF NOT EXISTS idx_payout_status ON public."Payout"("status");
CREATE INDEX IF NOT EXISTS idx_payout_ticket ON public."Payout"("ticketId");
CREATE INDEX IF NOT EXISTS idx_payout_created ON public."Payout"("createdAt");

-- =====================================================
-- 5. Ensure AuditLog Table Exists
-- =====================================================
CREATE TABLE IF NOT EXISTS public."AuditLog" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "drawId" UUID,
  "ticketId" UUID,
  "action" TEXT NOT NULL,
  "details" JSONB,
  "blockchainTx" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);

-- Indexes for AuditLog table
CREATE INDEX IF NOT EXISTS idx_auditlog_draw ON public."AuditLog"("drawId");
CREATE INDEX IF NOT EXISTS idx_auditlog_ticket ON public."AuditLog"("ticketId");
CREATE INDEX IF NOT EXISTS idx_auditlog_action ON public."AuditLog"("action");
CREATE INDEX IF NOT EXISTS idx_auditlog_created ON public."AuditLog"("createdAt");

-- =====================================================
-- Migration Complete
-- =====================================================
