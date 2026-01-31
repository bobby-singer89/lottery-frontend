import prisma from '../lib/prisma';

/**
 * Streak Service
 * Manages daily login streaks and bonuses
 */

export class StreakService {
  /**
   * Get user's current streak
   */
  async getCurrentStreak(userId: string) {
    // Ensure user profile exists
    await this.ensureUserProfile(userId);

    let streak = await prisma.userStreak.findUnique({
      where: { userId }
    });

    if (!streak) {
      streak = await prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          totalCheckIns: 0
        }
      });
    }

    return {
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      lastCheckIn: streak.lastCheckIn,
      totalCheckIns: streak.totalCheckIns,
      streakBonus: streak.streakBonus,
      canCheckIn: this.canCheckIn(streak.lastCheckIn)
    };
  }

  /**
   * Perform daily check-in
   */
  async checkIn(userId: string) {
    // Get or create streak
    let streak = await prisma.userStreak.findUnique({
      where: { userId }
    });

    if (!streak) {
      streak = await prisma.userStreak.create({
        data: {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          totalCheckIns: 0
        }
      });
    }

    // Check if can check in
    if (!this.canCheckIn(streak.lastCheckIn)) {
      throw new Error('Already checked in today');
    }

    // Calculate new streak
    const now = new Date();
    const isConsecutive = this.isConsecutiveDay(streak.lastCheckIn);
    
    let newStreak = 1;
    if (isConsecutive) {
      newStreak = streak.currentStreak + 1;
    }

    const newLongestStreak = Math.max(newStreak, streak.longestStreak);

    // Calculate streak bonus
    const bonusValue = this.calculateStreakBonus(newStreak);

    // Update streak
    await prisma.userStreak.update({
      where: { userId },
      data: {
        currentStreak: newStreak,
        longestStreak: newLongestStreak,
        lastCheckIn: now,
        totalCheckIns: { increment: 1 },
        streakBonus: { increment: bonusValue }
      }
    });

    // Grant XP bonus
    await prisma.userProfile.update({
      where: { userId },
      data: {
        xp: { increment: bonusValue }
      }
    });

    // Check for streak achievements
    const { achievementService } = await import('./achievementService');
    await achievementService.checkAchievements(userId);

    // Grant milestone rewards
    await this.grantStreakMilestoneReward(userId, newStreak);

    return {
      currentStreak: newStreak,
      longestStreak: newLongestStreak,
      bonusEarned: bonusValue,
      totalCheckIns: streak.totalCheckIns + 1
    };
  }

  /**
   * Check all users for broken streaks (called by cron job daily)
   */
  async checkBrokenStreaks() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    twoDaysAgo.setHours(23, 59, 59, 999);

    // Find users who haven't checked in for 2 days
    const brokenStreaks = await prisma.userStreak.findMany({
      where: {
        lastCheckIn: {
          lt: twoDaysAgo
        },
        currentStreak: {
          gt: 0
        }
      }
    });

    // Reset their streaks
    for (const streak of brokenStreaks) {
      await prisma.userStreak.update({
        where: { id: streak.id },
        data: {
          currentStreak: 0
        }
      });
    }

    console.log(`✅ Reset ${brokenStreaks.length} broken streaks`);
  }

  /**
   * Private helper methods
   */

  private canCheckIn(lastCheckIn: Date | null): boolean {
    if (!lastCheckIn) {
      return true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastCheckInDate = new Date(lastCheckIn);
    lastCheckInDate.setHours(0, 0, 0, 0);

    return lastCheckInDate < today;
  }

  private isConsecutiveDay(lastCheckIn: Date | null): boolean {
    if (!lastCheckIn) {
      return false;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const lastCheckInDate = new Date(lastCheckIn);
    lastCheckInDate.setHours(0, 0, 0, 0);

    return lastCheckInDate.getTime() === yesterday.getTime();
  }

  private calculateStreakBonus(streakDays: number): number {
    // Base bonus: 10 XP
    // +5 XP per day up to day 7
    // +10 XP per day from day 8 to 30
    // +20 XP per day from day 31+
    
    if (streakDays <= 7) {
      return 10 + (streakDays - 1) * 5;
    } else if (streakDays <= 30) {
      return 10 + 6 * 5 + (streakDays - 7) * 10;
    } else {
      return 10 + 6 * 5 + 23 * 10 + (streakDays - 30) * 20;
    }
  }

  private async grantStreakMilestoneReward(userId: string, streakDays: number) {
    // Grant special rewards at milestones
    const milestones = [3, 7, 14, 30, 100];
    
    if (milestones.includes(streakDays)) {
      let ticketReward = 0;
      
      switch (streakDays) {
        case 3:
          ticketReward = 1;
          break;
        case 7:
          ticketReward = 2;
          break;
        case 14:
          ticketReward = 3;
          break;
        case 30:
          ticketReward = 5;
          break;
        case 100:
          ticketReward = 20;
          break;
      }

      if (ticketReward > 0) {
        const reward = await prisma.reward.findFirst({
          where: {
            type: 'daily_bonus',
            name: `Streak ${streakDays} days`
          }
        });

        let rewardId = reward?.id;

        if (!rewardId) {
          const newReward = await prisma.reward.create({
            data: {
              type: 'daily_bonus',
              name: `Streak ${streakDays} days`,
              description: `Reward for ${streakDays} day streak`,
              value: ticketReward,
              isActive: true
            }
          });
          rewardId = newReward.id;
        }

        await prisma.userReward.create({
          data: {
            userId,
            rewardId,
            claimed: false,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
          }
        });
      }
    }
  }

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
}

export const streakService = new StreakService();
