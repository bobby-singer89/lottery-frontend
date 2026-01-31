-- =====================================================
-- Gamification System - Migration 010
-- =====================================================
-- This migration creates all tables needed for the gamification system:
-- - User Profiles
-- - Referral System (codes, relationships, rewards)
-- - Quest System
-- - Achievement System
-- - Streak System
-- - Reward System
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER PROFILE EXTENSION
-- =====================================================

CREATE TABLE IF NOT EXISTS public."UserProfile" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL UNIQUE,
  "walletAddress" TEXT,
  "level" INTEGER NOT NULL DEFAULT 1,
  "xp" INTEGER NOT NULL DEFAULT 0,
  "totalTickets" INTEGER NOT NULL DEFAULT 0,
  "totalWinnings" DECIMAL NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_userprofile_userid ON public."UserProfile"("userId");
CREATE INDEX IF NOT EXISTS idx_userprofile_wallet ON public."UserProfile"("walletAddress");
CREATE INDEX IF NOT EXISTS idx_userprofile_level ON public."UserProfile"("level");

-- =====================================================
-- 2. REFERRAL SYSTEM
-- =====================================================

-- Referral Codes
CREATE TABLE IF NOT EXISTS public."ReferralCode" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL UNIQUE,
  "code" TEXT NOT NULL UNIQUE,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "maxUsage" INTEGER,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMP,
  
  CONSTRAINT fk_referralcode_user FOREIGN KEY ("userId") 
    REFERENCES public."UserProfile"("userId") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_referralcode_code ON public."ReferralCode"("code");
CREATE INDEX IF NOT EXISTS idx_referralcode_userid ON public."ReferralCode"("userId");
CREATE INDEX IF NOT EXISTS idx_referralcode_active ON public."ReferralCode"("isActive");

-- Referral Relationships
CREATE TABLE IF NOT EXISTS public."ReferralRelationship" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "referrerId" TEXT NOT NULL,
  "referredId" TEXT NOT NULL,
  "referralCodeId" UUID NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending', -- pending, active, completed
  "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_referralrel_referrer FOREIGN KEY ("referrerId") 
    REFERENCES public."UserProfile"("userId") ON DELETE CASCADE,
  CONSTRAINT fk_referralrel_referred FOREIGN KEY ("referredId") 
    REFERENCES public."UserProfile"("userId") ON DELETE CASCADE,
  CONSTRAINT fk_referralrel_code FOREIGN KEY ("referralCodeId") 
    REFERENCES public."ReferralCode"("id") ON DELETE CASCADE,
  CONSTRAINT unique_referral_pair UNIQUE ("referrerId", "referredId")
);

CREATE INDEX IF NOT EXISTS idx_referralrel_referrer ON public."ReferralRelationship"("referrerId");
CREATE INDEX IF NOT EXISTS idx_referralrel_referred ON public."ReferralRelationship"("referredId");
CREATE INDEX IF NOT EXISTS idx_referralrel_code ON public."ReferralRelationship"("referralCodeId");
CREATE INDEX IF NOT EXISTS idx_referralrel_status ON public."ReferralRelationship"("status");

-- Referral Rewards
CREATE TABLE IF NOT EXISTS public."ReferralReward" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "relationshipId" UUID NOT NULL,
  "type" TEXT NOT NULL, -- bonus_tickets, xp_boost, discount
  "value" DECIMAL NOT NULL,
  "claimed" BOOLEAN NOT NULL DEFAULT false,
  "claimedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "expiresAt" TIMESTAMP,
  
  CONSTRAINT fk_referralreward_rel FOREIGN KEY ("relationshipId") 
    REFERENCES public."ReferralRelationship"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_referralreward_rel ON public."ReferralReward"("relationshipId");
CREATE INDEX IF NOT EXISTS idx_referralreward_claimed ON public."ReferralReward"("claimed");

-- =====================================================
-- 3. QUEST SYSTEM
-- =====================================================

-- Quests (master list)
CREATE TABLE IF NOT EXISTS public."Quest" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- daily, weekly, monthly, special
  "category" TEXT NOT NULL, -- tickets, referrals, streak, social
  "target" INTEGER NOT NULL,
  "reward" JSONB NOT NULL, -- { type: 'xp' | 'tickets' | 'discount', value: number }
  "difficulty" TEXT NOT NULL DEFAULT 'easy', -- easy, medium, hard
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "startDate" TIMESTAMP,
  "endDate" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quest_type ON public."Quest"("type", "isActive");
CREATE INDEX IF NOT EXISTS idx_quest_category ON public."Quest"("category");
CREATE INDEX IF NOT EXISTS idx_quest_active ON public."Quest"("isActive");

-- User Quest Progress
CREATE TABLE IF NOT EXISTS public."UserQuest" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL,
  "questId" UUID NOT NULL,
  "progress" INTEGER NOT NULL DEFAULT 0,
  "isCompleted" BOOLEAN NOT NULL DEFAULT false,
  "completedAt" TIMESTAMP,
  "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
  "claimedAt" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_userquest_user FOREIGN KEY ("userId") 
    REFERENCES public."UserProfile"("userId") ON DELETE CASCADE,
  CONSTRAINT fk_userquest_quest FOREIGN KEY ("questId") 
    REFERENCES public."Quest"("id") ON DELETE CASCADE,
  CONSTRAINT unique_user_quest UNIQUE ("userId", "questId")
);

CREATE INDEX IF NOT EXISTS idx_userquest_user ON public."UserQuest"("userId");
CREATE INDEX IF NOT EXISTS idx_userquest_quest ON public."UserQuest"("questId");
CREATE INDEX IF NOT EXISTS idx_userquest_completed ON public."UserQuest"("isCompleted");
CREATE INDEX IF NOT EXISTS idx_userquest_claimed ON public."UserQuest"("rewardClaimed");

-- =====================================================
-- 4. ACHIEVEMENT SYSTEM
-- =====================================================

-- Achievements (master list)
CREATE TABLE IF NOT EXISTS public."Achievement" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL, -- tickets, wins, referrals, streak, level
  "tier" TEXT NOT NULL DEFAULT 'bronze', -- bronze, silver, gold, diamond, platinum
  "requirement" JSONB NOT NULL, -- { type: string, value: number }
  "reward" JSONB NOT NULL, -- { type: string, value: number }
  "icon" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievement_name ON public."Achievement"("name");
CREATE INDEX IF NOT EXISTS idx_achievement_category ON public."Achievement"("category");
CREATE INDEX IF NOT EXISTS idx_achievement_tier ON public."Achievement"("tier");
CREATE INDEX IF NOT EXISTS idx_achievement_active ON public."Achievement"("isActive");

-- User Achievements
CREATE TABLE IF NOT EXISTS public."UserAchievement" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL,
  "achievementId" UUID NOT NULL,
  "unlockedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "progress" INTEGER NOT NULL DEFAULT 0,
  "rewardClaimed" BOOLEAN NOT NULL DEFAULT false,
  "claimedAt" TIMESTAMP,
  
  CONSTRAINT fk_userachievement_user FOREIGN KEY ("userId") 
    REFERENCES public."UserProfile"("userId") ON DELETE CASCADE,
  CONSTRAINT fk_userachievement_achievement FOREIGN KEY ("achievementId") 
    REFERENCES public."Achievement"("id") ON DELETE CASCADE,
  CONSTRAINT unique_user_achievement UNIQUE ("userId", "achievementId")
);

CREATE INDEX IF NOT EXISTS idx_userachievement_user ON public."UserAchievement"("userId");
CREATE INDEX IF NOT EXISTS idx_userachievement_achievement ON public."UserAchievement"("achievementId");
CREATE INDEX IF NOT EXISTS idx_userachievement_claimed ON public."UserAchievement"("rewardClaimed");

-- =====================================================
-- 5. STREAK SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS public."UserStreak" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL UNIQUE,
  "currentStreak" INTEGER NOT NULL DEFAULT 0,
  "longestStreak" INTEGER NOT NULL DEFAULT 0,
  "lastCheckIn" TIMESTAMP,
  "totalCheckIns" INTEGER NOT NULL DEFAULT 0,
  "streakBonus" DECIMAL NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_userstreak_user FOREIGN KEY ("userId") 
    REFERENCES public."UserProfile"("userId") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_userstreak_userid ON public."UserStreak"("userId");
CREATE INDEX IF NOT EXISTS idx_userstreak_current ON public."UserStreak"("currentStreak");
CREATE INDEX IF NOT EXISTS idx_userstreak_lastcheckin ON public."UserStreak"("lastCheckIn");

-- =====================================================
-- 6. REWARD SYSTEM
-- =====================================================

-- Rewards (master list)
CREATE TABLE IF NOT EXISTS public."Reward" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "type" TEXT NOT NULL, -- daily_bonus, level_up, achievement, quest_completion, referral
  "name" TEXT NOT NULL,
  "description" TEXT,
  "value" DECIMAL NOT NULL,
  "currency" TEXT, -- TON, USDT, null for tickets
  "conditions" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reward_type ON public."Reward"("type");
CREATE INDEX IF NOT EXISTS idx_reward_active ON public."Reward"("isActive");

-- User Rewards
CREATE TABLE IF NOT EXISTS public."UserReward" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "userId" TEXT NOT NULL,
  "rewardId" UUID NOT NULL,
  "claimed" BOOLEAN NOT NULL DEFAULT false,
  "claimedAt" TIMESTAMP,
  "expiresAt" TIMESTAMP,
  "metadata" JSONB,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  
  CONSTRAINT fk_userreward_user FOREIGN KEY ("userId") 
    REFERENCES public."UserProfile"("userId") ON DELETE CASCADE,
  CONSTRAINT fk_userreward_reward FOREIGN KEY ("rewardId") 
    REFERENCES public."Reward"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_userreward_user ON public."UserReward"("userId");
CREATE INDEX IF NOT EXISTS idx_userreward_reward ON public."UserReward"("rewardId");
CREATE INDEX IF NOT EXISTS idx_userreward_claimed ON public."UserReward"("claimed");
CREATE INDEX IF NOT EXISTS idx_userreward_expires ON public."UserReward"("expiresAt");

-- =====================================================
-- Migration Complete
-- =====================================================

COMMENT ON TABLE public."UserProfile" IS 'Extended user profiles for gamification';
COMMENT ON TABLE public."ReferralCode" IS 'Referral codes for user invitations';
COMMENT ON TABLE public."ReferralRelationship" IS 'Tracks referrer-referred relationships';
COMMENT ON TABLE public."ReferralReward" IS 'Rewards earned from referrals';
COMMENT ON TABLE public."Quest" IS 'Available quests for users to complete';
COMMENT ON TABLE public."UserQuest" IS 'User progress on quests';
COMMENT ON TABLE public."Achievement" IS 'Available achievements';
COMMENT ON TABLE public."UserAchievement" IS 'Achievements unlocked by users';
COMMENT ON TABLE public."UserStreak" IS 'Daily login streak tracking';
COMMENT ON TABLE public."Reward" IS 'Available rewards in the system';
COMMENT ON TABLE public."UserReward" IS 'Rewards earned by users';
