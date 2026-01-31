import cron from 'node-cron';
import { questService } from '../services/questService';
import { streakService } from '../services/streakService';
import { rewardService } from '../services/rewardService';
import { achievementService } from '../services/achievementService';

/**
 * Gamification Background Jobs
 * Handles periodic tasks for the gamification system
 */

export class GamificationJobs {
  /**
   * Start all gamification cron jobs
   */
  start() {
    // Daily quest reset - runs at midnight (00:00)
    cron.schedule('0 0 * * *', async () => {
      console.log('🔄 Running daily quest reset...');
      try {
        await questService.resetDailyQuests();
      } catch (error) {
        console.error('❌ Daily quest reset failed:', error);
      }
    });

    // Weekly quest reset - runs every Monday at midnight
    cron.schedule('0 0 * * 1', async () => {
      console.log('🔄 Running weekly quest reset...');
      try {
        await questService.resetWeeklyQuests();
      } catch (error) {
        console.error('❌ Weekly quest reset failed:', error);
      }
    });

    // Monthly quest reset - runs on the 1st of each month at midnight
    cron.schedule('0 0 1 * *', async () => {
      console.log('🔄 Running monthly quest reset...');
      try {
        await questService.resetMonthlyQuests();
      } catch (error) {
        console.error('❌ Monthly quest reset failed:', error);
      }
    });

    // Streak checker - runs daily at 1 AM to check for broken streaks
    cron.schedule('0 1 * * *', async () => {
      console.log('🔄 Checking for broken streaks...');
      try {
        await streakService.checkBrokenStreaks();
      } catch (error) {
        console.error('❌ Streak check failed:', error);
      }
    });

    // Reward cleanup - runs daily at 2 AM to remove expired rewards
    cron.schedule('0 2 * * *', async () => {
      console.log('🔄 Cleaning up expired rewards...');
      try {
        await rewardService.cleanupExpiredRewards();
      } catch (error) {
        console.error('❌ Reward cleanup failed:', error);
      }
    });

    console.log('✅ Gamification jobs scheduled:');
    console.log('   - Daily quest reset: midnight (00:00)');
    console.log('   - Weekly quest reset: Monday midnight');
    console.log('   - Monthly quest reset: 1st of month midnight');
    console.log('   - Streak checker: daily at 1 AM');
    console.log('   - Reward cleanup: daily at 2 AM');
  }
}

export const gamificationJobs = new GamificationJobs();
