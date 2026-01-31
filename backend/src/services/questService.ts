import prisma from '../lib/prisma';

/**
 * Quest Service
 * Manages quest creation, progress tracking, and completion
 */

export class QuestService {
  /**
   * Get available quests for a user
   */
  async getAvailableQuests(userId: string, type?: string) {
    // Ensure user profile exists
    await this.ensureUserProfile(userId);

    const where: any = {
      isActive: true
    };

    if (type) {
      where.type = type;
    }

    // Get all active quests
    const quests = await prisma.quest.findMany({
      where,
      orderBy: [
        { type: 'asc' },
        { difficulty: 'asc' }
      ]
    });

    // Get user's quest progress
    const userQuests = await prisma.userQuest.findMany({
      where: {
        userId,
        questId: { in: quests.map(q => q.id) }
      }
    });

    // Map quest progress
    const questMap = new Map(userQuests.map(uq => [uq.questId, uq]));

    return quests.map(quest => ({
      ...quest,
      progress: questMap.get(quest.id)?.progress || 0,
      isCompleted: questMap.get(quest.id)?.isCompleted || false,
      rewardClaimed: questMap.get(quest.id)?.rewardClaimed || false
    }));
  }

  /**
   * Get user's active quests
   */
  async getUserQuests(userId: string) {
    const userQuests = await prisma.userQuest.findMany({
      where: { userId },
      include: {
        quest: true
      },
      orderBy: [
        { isCompleted: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return userQuests.map(uq => ({
      id: uq.id,
      questId: uq.questId,
      title: uq.quest.title,
      description: uq.quest.description,
      type: uq.quest.type,
      category: uq.quest.category,
      target: uq.quest.target,
      progress: uq.progress,
      isCompleted: uq.isCompleted,
      completedAt: uq.completedAt,
      reward: uq.quest.reward,
      rewardClaimed: uq.rewardClaimed,
      claimedAt: uq.claimedAt
    }));
  }

  /**
   * Update quest progress
   */
  async updateQuestProgress(
    userId: string,
    category: string,
    increment: number = 1
  ) {
    // Find active quests in this category
    const quests = await prisma.quest.findMany({
      where: {
        category,
        isActive: true
      }
    });

    for (const quest of quests) {
      // Get or create user quest
      let userQuest = await prisma.userQuest.findUnique({
        where: {
          userId_questId: {
            userId,
            questId: quest.id
          }
        }
      });

      if (!userQuest) {
        userQuest = await prisma.userQuest.create({
          data: {
            userId,
            questId: quest.id,
            progress: 0
          }
        });
      }

      // Skip if already completed
      if (userQuest.isCompleted) {
        continue;
      }

      // Update progress
      const newProgress = Math.min(userQuest.progress + increment, quest.target);
      const isCompleted = newProgress >= quest.target;

      await prisma.userQuest.update({
        where: { id: userQuest.id },
        data: {
          progress: newProgress,
          isCompleted,
          completedAt: isCompleted ? new Date() : undefined
        }
      });

      // Grant reward if completed
      if (isCompleted && !userQuest.rewardClaimed) {
        await this.grantQuestReward(userId, quest);
      }
    }
  }

  /**
   * Claim quest reward
   */
  async claimQuestReward(userId: string, questId: string) {
    const userQuest = await prisma.userQuest.findUnique({
      where: {
        userId_questId: {
          userId,
          questId
        }
      },
      include: {
        quest: true
      }
    });

    if (!userQuest) {
      throw new Error('Quest not found');
    }

    if (!userQuest.isCompleted) {
      throw new Error('Quest not completed');
    }

    if (userQuest.rewardClaimed) {
      throw new Error('Reward already claimed');
    }

    // Grant the reward
    await this.grantQuestReward(userId, userQuest.quest);

    // Mark as claimed
    await prisma.userQuest.update({
      where: { id: userQuest.id },
      data: {
        rewardClaimed: true,
        claimedAt: new Date()
      }
    });

    return true;
  }

  /**
   * Reset daily quests (called by cron job)
   */
  async resetDailyQuests() {
    // Delete all user quests for daily quests
    await prisma.userQuest.deleteMany({
      where: {
        quest: {
          type: 'daily'
        }
      }
    });

    console.log('✅ Daily quests reset');
  }

  /**
   * Reset weekly quests (called by cron job)
   */
  async resetWeeklyQuests() {
    await prisma.userQuest.deleteMany({
      where: {
        quest: {
          type: 'weekly'
        }
      }
    });

    console.log('✅ Weekly quests reset');
  }

  /**
   * Reset monthly quests (called by cron job)
   */
  async resetMonthlyQuests() {
    await prisma.userQuest.deleteMany({
      where: {
        quest: {
          type: 'monthly'
        }
      }
    });

    console.log('✅ Monthly quests reset');
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

  private async grantQuestReward(userId: string, quest: any) {
    const reward = quest.reward as { type: string; value: number };

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
        // Create a user reward for free tickets
        await prisma.userReward.create({
          data: {
            userId,
            rewardId: await this.getOrCreateReward('quest_completion', reward.value),
            claimed: false,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        });
        break;

      case 'discount':
        // Create a user reward for discount
        await prisma.userReward.create({
          data: {
            userId,
            rewardId: await this.getOrCreateReward('discount', reward.value),
            claimed: false,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
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
}

export const questService = new QuestService();
