import prisma from '../lib/prisma';
import { referralService } from './referralService';
import { questService } from './questService';
import { achievementService } from './achievementService';
import { streakService } from './streakService';
import { rewardService } from './rewardService';

/**
 * Gamification Service
 * Main orchestration service for all gamification features
 */

export class GamificationService {
  /**
   * Get complete gamification profile for a user
   */
  async getUserProfile(userId: string) {
    // Ensure profile exists
    await this.ensureUserProfile(userId);

    // Get user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    // Get referral stats
    const referralStats = await referralService.getReferralStats(userId);

    // Get streak info
    const streakInfo = await streakService.getCurrentStreak(userId);

    // Get active quests
    const activeQuests = await questService.getUserQuests(userId);

    // Get achievements
    const achievements = await achievementService.getUserAchievements(userId);

    // Get available rewards
    const availableRewards = await rewardService.getAvailableRewards(userId);

    return {
      profile: {
        userId: profile?.userId,
        level: profile?.level || 1,
        xp: profile?.xp || 0,
        totalTickets: profile?.totalTickets || 0,
        totalWinnings: profile?.totalWinnings || 0,
        nextLevelXp: this.calculateNextLevelXp(profile?.level || 1)
      },
      referral: referralStats,
      streak: streakInfo,
      quests: {
        active: activeQuests.filter(q => !q.isCompleted).length,
        completed: activeQuests.filter(q => q.isCompleted).length,
        recent: activeQuests.slice(0, 5)
      },
      achievements: {
        total: achievements.length,
        recent: achievements.slice(0, 5)
      },
      rewards: {
        available: availableRewards.length,
        totalValue: availableRewards.reduce((sum, r) => sum + Number(r.value), 0)
      }
    };
  }

  /**
   * Handle ticket purchase event (triggers various gamification updates)
   */
  async onTicketPurchase(userId: string, ticketCount: number, totalAmount: number) {
    // Update user profile
    await prisma.userProfile.update({
      where: { userId },
      data: {
        totalTickets: { increment: ticketCount }
      }
    });

    // Grant XP for purchase (10 XP per ticket)
    const xpEarned = ticketCount * 10;
    const updatedProfile = await prisma.userProfile.update({
      where: { userId },
      data: {
        xp: { increment: xpEarned }
      }
    });

    // Check for level up
    const leveledUp = await this.checkLevelUp(userId, updatedProfile.xp);

    // Update quest progress
    await questService.updateQuestProgress(userId, 'tickets', ticketCount);

    // Check achievements
    await achievementService.checkAchievements(userId);

    return {
      xpEarned,
      leveledUp,
      newLevel: updatedProfile.level
    };
  }

  /**
   * Handle win event
   */
  async onWin(userId: string, prizeAmount: number) {
    // Update user profile
    await prisma.userProfile.update({
      where: { userId },
      data: {
        totalWinnings: { increment: prizeAmount }
      }
    });

    // Grant bonus XP for winning (50 XP per win)
    await prisma.userProfile.update({
      where: { userId },
      data: {
        xp: { increment: 50 }
      }
    });

    // Check achievements
    await achievementService.checkAchievements(userId);
  }

  /**
   * Get leaderboard
   */
  async getLeaderboard(type: 'level' | 'xp' | 'tickets' | 'winnings' = 'level', limit: number = 10) {
    const orderBy: any = {};
    
    switch (type) {
      case 'level':
        orderBy.level = 'desc';
        break;
      case 'xp':
        orderBy.xp = 'desc';
        break;
      case 'tickets':
        orderBy.totalTickets = 'desc';
        break;
      case 'winnings':
        orderBy.totalWinnings = 'desc';
        break;
    }

    const profiles = await prisma.userProfile.findMany({
      orderBy,
      take: limit
    });

    return profiles.map((profile, index) => ({
      rank: index + 1,
      userId: profile.userId,
      level: profile.level,
      xp: profile.xp,
      totalTickets: profile.totalTickets,
      totalWinnings: profile.totalWinnings
    }));
  }

  /**
   * Private helper methods
   */

  private async ensureUserProfile(userId: string) {
    const existing = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!existing) {
      await prisma.userProfile.create({
        data: {
          userId,
          level: 1,
          xp: 0
        }
      });
    }
  }

  private calculateNextLevelXp(level: number): number {
    // XP required = 100 * level^1.5
    return Math.floor(100 * Math.pow(level, 1.5));
  }

  private async checkLevelUp(userId: string, currentXp: number): Promise<boolean> {
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return false;
    }

    const nextLevelXp = this.calculateNextLevelXp(profile.level);

    if (currentXp >= nextLevelXp) {
      // Level up!
      await prisma.userProfile.update({
        where: { userId },
        data: {
          level: { increment: 1 }
        }
      });

      // Grant level up reward
      await rewardService.grantReward(userId, 'level_up', 100, 30);

      // Check achievements
      await achievementService.checkAchievements(userId);

      return true;
    }

    return false;
  }
}

export const gamificationService = new GamificationService();
