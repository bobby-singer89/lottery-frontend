import prisma from '../lib/prisma';

/**
 * Reward Service
 * Manages reward distribution and claiming
 */

export class RewardService {
  /**
   * Get available rewards for a user
   */
  async getAvailableRewards(userId: string) {
    const userRewards = await prisma.userReward.findMany({
      where: {
        userId,
        claimed: false,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ]
      },
      include: {
        reward: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return userRewards.map(ur => ({
      id: ur.id,
      rewardId: ur.rewardId,
      type: ur.reward.type,
      name: ur.reward.name,
      description: ur.reward.description,
      value: ur.reward.value,
      currency: ur.reward.currency,
      claimed: ur.claimed,
      expiresAt: ur.expiresAt,
      metadata: ur.metadata
    }));
  }

  /**
   * Get claimed rewards for a user
   */
  async getClaimedRewards(userId: string, limit: number = 20) {
    const userRewards = await prisma.userReward.findMany({
      where: {
        userId,
        claimed: true
      },
      include: {
        reward: true
      },
      orderBy: {
        claimedAt: 'desc'
      },
      take: limit
    });

    return userRewards.map(ur => ({
      id: ur.id,
      rewardId: ur.rewardId,
      type: ur.reward.type,
      name: ur.reward.name,
      description: ur.reward.description,
      value: ur.reward.value,
      currency: ur.reward.currency,
      claimedAt: ur.claimedAt,
      metadata: ur.metadata
    }));
  }

  /**
   * Claim a reward
   */
  async claimReward(userId: string, userRewardId: string) {
    const userReward = await prisma.userReward.findUnique({
      where: { id: userRewardId },
      include: {
        reward: true
      }
    });

    if (!userReward) {
      throw new Error('Reward not found');
    }

    if (userReward.userId !== userId) {
      throw new Error('Unauthorized');
    }

    if (userReward.claimed) {
      throw new Error('Reward already claimed');
    }

    if (userReward.expiresAt && userReward.expiresAt < new Date()) {
      throw new Error('Reward has expired');
    }

    // Mark as claimed
    await prisma.userReward.update({
      where: { id: userRewardId },
      data: {
        claimed: true,
        claimedAt: new Date()
      }
    });

    // Process the reward based on type
    await this.processRewardClaim(userId, userReward.reward);

    return {
      success: true,
      reward: {
        type: userReward.reward.type,
        name: userReward.reward.name,
        value: userReward.reward.value,
        currency: userReward.reward.currency
      }
    };
  }

  /**
   * Clean up expired rewards (called by cron job)
   */
  async cleanupExpiredRewards() {
    const result = await prisma.userReward.deleteMany({
      where: {
        claimed: false,
        expiresAt: {
          lt: new Date()
        }
      }
    });

    console.log(`✅ Cleaned up ${result.count} expired rewards`);
    return result.count;
  }

  /**
   * Grant a reward to a user
   */
  async grantReward(
    userId: string,
    rewardType: string,
    value: number,
    expiresInDays?: number
  ) {
    // Ensure user profile exists
    await this.ensureUserProfile(userId);

    // Find or create reward
    let reward = await prisma.reward.findFirst({
      where: {
        type: rewardType,
        value
      }
    });

    if (!reward) {
      reward = await prisma.reward.create({
        data: {
          type: rewardType,
          name: `${rewardType} - ${value}`,
          value,
          isActive: true
        }
      });
    }

    // Create user reward
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const userReward = await prisma.userReward.create({
      data: {
        userId,
        rewardId: reward.id,
        claimed: false,
        expiresAt
      }
    });

    return userReward;
  }

  /**
   * Private helper methods
   */

  private async processRewardClaim(userId: string, reward: any) {
    switch (reward.type) {
      case 'daily_bonus':
      case 'quest_completion':
      case 'achievement_unlock':
        // These are typically free tickets or XP bonuses
        // The actual application happens in the ticket purchase flow
        // We just log that it was claimed here
        break;

      case 'level_up':
        // Grant XP
        await prisma.userProfile.update({
          where: { userId },
          data: {
            xp: { increment: Number(reward.value) }
          }
        });
        break;

      case 'referral_bonus':
        // Grant tickets or XP
        if (reward.currency) {
          // This would integrate with payment system
          console.log(`Grant ${reward.value} ${reward.currency} to user ${userId}`);
        } else {
          // Free tickets - handled in ticket purchase flow
        }
        break;
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

export const rewardService = new RewardService();
