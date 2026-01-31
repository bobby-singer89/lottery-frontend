import prisma from '../lib/prisma';
import { supabase } from '../lib/supabase';

/**
 * Referral Service
 * Handles referral code generation, relationship tracking, and reward distribution
 */

export class ReferralService {
  /**
   * Generate a unique referral code for a user
   */
  async generateReferralCode(userId: string): Promise<string> {
    // Check if user already has a code
    const existing = await prisma.referralCode.findUnique({
      where: { userId }
    });

    if (existing) {
      return existing.code;
    }

    // Ensure user profile exists
    await this.ensureUserProfile(userId);

    // Generate a unique code (6 uppercase alphanumeric)
    let code = '';
    let isUnique = false;

    while (!isUnique) {
      code = this.generateCode();
      const exists = await prisma.referralCode.findUnique({
        where: { code }
      });
      isUnique = !exists;
    }

    // Create referral code
    const referralCode = await prisma.referralCode.create({
      data: {
        userId,
        code,
        usageCount: 0,
        isActive: true
      }
    });

    return referralCode.code;
  }

  /**
   * Apply a referral code for a new user
   */
  async applyReferralCode(referredUserId: string, code: string): Promise<boolean> {
    // Find the referral code
    const referralCode = await prisma.referralCode.findUnique({
      where: { code }
    });

    if (!referralCode || !referralCode.isActive) {
      throw new Error('Invalid or inactive referral code');
    }

    // Check if code has expired
    if (referralCode.expiresAt && referralCode.expiresAt < new Date()) {
      throw new Error('Referral code has expired');
    }

    // Check max usage
    if (referralCode.maxUsage && referralCode.usageCount >= referralCode.maxUsage) {
      throw new Error('Referral code has reached maximum usage');
    }

    // Prevent self-referral
    if (referralCode.userId === referredUserId) {
      throw new Error('Cannot use your own referral code');
    }

    // Ensure both users have profiles
    await this.ensureUserProfile(referralCode.userId);
    await this.ensureUserProfile(referredUserId);

    // Check if relationship already exists
    const existing = await prisma.referralRelationship.findUnique({
      where: {
        referrerId_referredId: {
          referrerId: referralCode.userId,
          referredId: referredUserId
        }
      }
    });

    if (existing) {
      throw new Error('Referral relationship already exists');
    }

    // Create referral relationship
    const relationship = await prisma.referralRelationship.create({
      data: {
        referrerId: referralCode.userId,
        referredId: referredUserId,
        referralCodeId: referralCode.id,
        status: 'active'
      }
    });

    // Update code usage count
    await prisma.referralCode.update({
      where: { id: referralCode.id },
      data: {
        usageCount: { increment: 1 }
      }
    });

    // Grant rewards to both users
    await this.grantReferralRewards(relationship.id, referralCode.userId, referredUserId);

    return true;
  }

  /**
   * Get referral statistics for a user
   */
  async getReferralStats(userId: string) {
    const code = await prisma.referralCode.findUnique({
      where: { userId }
    });

    if (!code) {
      return {
        code: null,
        totalReferrals: 0,
        activeReferrals: 0,
        totalRewards: 0,
        claimedRewards: 0
      };
    }

    const relationships = await prisma.referralRelationship.findMany({
      where: { referrerId: userId },
      include: {
        rewards: true
      }
    });

    const totalRewards = relationships.reduce((sum, rel) => sum + rel.rewards.length, 0);
    const claimedRewards = relationships.reduce((sum, rel) => 
      sum + rel.rewards.filter(r => r.claimed).length, 0
    );

    return {
      code: code.code,
      totalReferrals: relationships.length,
      activeReferrals: relationships.filter(r => r.status === 'active').length,
      totalRewards,
      claimedRewards
    };
  }

  /**
   * Get referral tree (up to 3 levels)
   */
  async getReferralTree(userId: string, maxDepth: number = 3) {
    const tree = await this.buildReferralTree(userId, 0, maxDepth);
    return tree;
  }

  /**
   * Private helper methods
   */

  private generateCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
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

  private async grantReferralRewards(
    relationshipId: string,
    referrerId: string,
    referredId: string
  ) {
    // Reward for referrer: 5 bonus XP
    await prisma.referralReward.create({
      data: {
        relationshipId,
        type: 'xp_boost',
        value: 200,
        claimed: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });

    // Reward for referred: 1 bonus ticket
    await prisma.referralReward.create({
      data: {
        relationshipId,
        type: 'bonus_tickets',
        value: 1,
        claimed: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // Update XP for referrer immediately
    await prisma.userProfile.update({
      where: { userId: referrerId },
      data: {
        xp: { increment: 200 }
      }
    });
  }

  private async buildReferralTree(userId: string, currentDepth: number, maxDepth: number): Promise<any> {
    if (currentDepth >= maxDepth) {
      return null;
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId }
    });

    const referrals = await prisma.referralRelationship.findMany({
      where: { referrerId: userId },
      include: {
        referred: true
      }
    });

    const children = await Promise.all(
      referrals.slice(0, 10).map(async (rel) => ({
        userId: rel.referredId,
        level: profile?.level || 1,
        status: rel.status,
        children: await this.buildReferralTree(rel.referredId, currentDepth + 1, maxDepth)
      }))
    );

    return {
      userId,
      level: profile?.level || 1,
      totalReferrals: referrals.length,
      children: children.filter(c => c !== null)
    };
  }
}

export const referralService = new ReferralService();
