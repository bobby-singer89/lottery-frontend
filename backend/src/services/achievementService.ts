import prisma from '../lib/prisma';

/**
 * Achievement Service
 * Manages achievement unlocking and reward distribution
 */

export class AchievementService {
  /**
   * Get all achievements
   */
  async getAllAchievements() {
    return await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [
        { category: 'asc' },
        { tier: 'asc' }
      ]
    });
  }

  /**
   * Get user's achievements
   */
  async getUserAchievements(userId: string) {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: {
        achievement: true
      },
      orderBy: {
        unlockedAt: 'desc'
      }
    });

    return userAchievements.map(ua => ({
      id: ua.id,
      achievementId: ua.achievementId,
      name: ua.achievement.name,
      title: ua.achievement.title,
      description: ua.achievement.description,
      category: ua.achievement.category,
      tier: ua.achievement.tier,
      icon: ua.achievement.icon,
      reward: ua.achievement.reward,
      unlockedAt: ua.unlockedAt,
      rewardClaimed: ua.rewardClaimed,
      claimedAt: ua.claimedAt
    }));
  }

  /**
   * Check and unlock achievements for a user
   */
  async checkAchievements(userId: string) {
    // Get user profile
    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      return [];
    }

    // Get all active achievements
    const achievements = await prisma.achievement.findMany({
      where: { isActive: true }
    });

    // Get user's existing achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId }
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));
    const newlyUnlocked = [];

    for (const achievement of achievements) {
      // Skip if already unlocked
      if (unlockedIds.has(achievement.id)) {
        continue;
      }

      // Check if requirements are met
      const requirement = achievement.requirement as { type: string; value: number };
      let isMet = false;

      switch (requirement.type) {
        case 'tickets_purchased':
          isMet = profile.totalTickets >= requirement.value;
          break;

        case 'level':
          isMet = profile.level >= requirement.value;
          break;

        case 'wins_count':
          // This would need to query the Ticket table
          const winCount = await this.getWinCount(userId);
          isMet = winCount >= requirement.value;
          break;

        case 'referrals_count':
          const refCount = await this.getReferralCount(userId);
          isMet = refCount >= requirement.value;
          break;

        case 'streak_days':
          const streak = await this.getCurrentStreak(userId);
          isMet = streak >= requirement.value;
          break;
      }

      if (isMet) {
        // Unlock the achievement
        const unlocked = await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
            progress: requirement.value
          }
        });

        newlyUnlocked.push({
          ...achievement,
          unlockedAt: unlocked.unlockedAt
        });

        // Grant achievement reward
        await this.grantAchievementReward(userId, achievement);
      }
    }

    return newlyUnlocked;
  }

  /**
   * Claim achievement reward
   */
  async claimAchievementReward(userId: string, achievementId: string) {
    const userAchievement = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId
        }
      },
      include: {
        achievement: true
      }
    });

    if (!userAchievement) {
      throw new Error('Achievement not unlocked');
    }

    if (userAchievement.rewardClaimed) {
      throw new Error('Reward already claimed');
    }

    // Grant the reward
    await this.grantAchievementReward(userId, userAchievement.achievement);

    // Mark as claimed
    await prisma.userAchievement.update({
      where: { id: userAchievement.id },
      data: {
        rewardClaimed: true,
        claimedAt: new Date()
      }
    });

    return true;
  }

  /**
   * Private helper methods
   */

  private async grantAchievementReward(userId: string, achievement: any) {
    const reward = achievement.reward as { type: string; value: number };

    switch (reward.type) {
      case 'xp':
        await prisma.userProfile.update({
          where: { userId },
          data: {
            xp: { increment: reward.value }
          }
        });
        break;

      case 'tickets':
        await prisma.userReward.create({
          data: {
            userId,
            rewardId: await this.getOrCreateReward('achievement_unlock', reward.value),
            claimed: false,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        });
        break;
    }
  }

  private async getOrCreateReward(type: string, value: number): Promise<string> {
    let reward = await prisma.reward.findFirst({
      where: {
        type,
        value
      }
    });

    if (!reward) {
      reward = await prisma.reward.create({
        data: {
          type,
          name: `${type} - ${value}`,
          value,
          isActive: true
        }
      });
    }

    return reward.id;
  }

  private async getWinCount(userId: string): Promise<number> {
    // Query Supabase for win count (using existing Ticket table)
    const { supabase } = await import('../lib/supabase');
    const { count } = await supabase
      .from('Ticket')
      .select('*', { count: 'exact', head: true })
      .eq('userId', userId)
      .gt('prizeAmount', 0);

    return count || 0;
  }

  private async getReferralCount(userId: string): Promise<number> {
    const count = await prisma.referralRelationship.count({
      where: {
        referrerId: userId,
        status: 'active'
      }
    });

    return count;
  }

  private async getCurrentStreak(userId: string): Promise<number> {
    const streak = await prisma.userStreak.findUnique({
      where: { userId }
    });

    return streak?.currentStreak || 0;
  }
}

export const achievementService = new AchievementService();
