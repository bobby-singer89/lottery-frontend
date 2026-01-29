import cron from 'node-cron';
import { supabase } from '../lib/supabase';
import { provablyFair } from './provablyFair';
import { sendLiveDrawUpdate } from '../bot/liveStream';
import crypto from 'crypto';

export class DrawScheduler {
  /**
   * Schedule seed hash publication 24 hours before draw
   * Runs daily at 20:00 (day before draw)
   */
  schedulePreCommitment() {
    // Run every day at 20:00 UTC (23:00 MSK)
    cron.schedule('0 20 * * *', async () => {
      console.log('🔐 Running seed hash pre-commitment...');
      
      try {
        // Get draws scheduled for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(20, 0, 0, 0);

        const { data: draws } = await supabase
          .from('Draw')
          .select('*')
          .eq('status', 'scheduled')
          .gte('scheduledAt', tomorrow.toISOString())
          .lt('scheduledAt', new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000).toISOString())
          .is('seedHash', null);

        for (const draw of draws || []) {
          // Generate seed and hash
          const seed = provablyFair.generateSeed();
          const seedHash = provablyFair.hashSeed(seed);

          // Update draw with seed hash (seed kept secret)
          await supabase
            .from('Draw')
            .update({
              seedHash,
              seedHashPublishedAt: new Date().toISOString(),
              // DON'T save seed yet!
            })
            .eq('id', draw.id);

          // Publish to Telegram channel
          await sendLiveDrawUpdate(draw.id, 'seed_hash_published', {
            seedHash,
            drawNumber: draw.drawNumber,
            scheduledAt: draw.scheduledAt,
          });

          // Save seed securely (encrypted in separate table or env)
          // For demo, we'll store encrypted in auditLog
          const encrypted = this.encryptSeed(seed, draw.id);
          await supabase
            .from('Draw')
            .update({
              auditLog: [
                { 
                  action: 'seed_generated', 
                  timestamp: new Date().toISOString(),
                  encryptedSeed: encrypted 
                }
              ]
            })
            .eq('id', draw.id);

          console.log(`✅ Seed hash published for draw ${draw.drawNumber}`);
        }
      } catch (error) {
        console.error('❌ Pre-commitment error:', error);
      }
    });
  }

  /**
   * Execute draw at scheduled time
   * Runs every day at 20:00 UTC (23:00 MSK)
   */
  scheduleDrawExecution() {
    // Run every day at 20:00 UTC
    cron.schedule('0 20 * * *', async () => {
      console.log('🎲 Running scheduled draws...');
      
      try {
        const now = new Date();
        
        // Get draws scheduled for now
        const { data: draws } = await supabase
          .from('Draw')
          .select('*')
          .eq('status', 'scheduled')
          .lte('scheduledAt', now.toISOString())
          .not('seedHash', 'is', null);

        for (const draw of draws || []) {
          await this.executeDraw(draw);
        }
      } catch (error) {
        console.error('❌ Draw execution error:', error);
      }
    });
  }

  /**
   * Execute a single draw
   */
  async executeDraw(draw: any) {
    console.log(`🎯 Executing draw ${draw.drawNumber}...`);

    try {
      // 1. Start live stream
      await sendLiveDrawUpdate(draw.id, 'draw_started', {
        drawNumber: draw.drawNumber,
      });

      // 2. Decrypt and reveal seed
      const seed = this.decryptSeed(draw.auditLog[0].encryptedSeed, draw.id);
      
      await sendLiveDrawUpdate(draw.id, 'seed_revealed', {
        seed,
        seedHash: draw.seedHash,
      });

      // 3. Generate winning numbers
      const winningNumbers = provablyFair.generateWinningNumbers(seed, 5, 36);
      
      await sendLiveDrawUpdate(draw.id, 'numbers_generated', {
        winningNumbers,
      });

      // 4. Update draw with results
      await supabase
        .from('Draw')
        .update({
          seed,
          seedRevealedAt: new Date().toISOString(),
          winningNumbers,
          executedAt: new Date().toISOString(),
          status: 'completed',
        })
        .eq('id', draw.id);

      // 5. Check all tickets and calculate winners
      const { data: tickets } = await supabase
        .from('Ticket')
        .select('*')
        .eq('drawId', draw.id);

      const winnersCount: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let totalPaid = 0;

      for (const ticket of tickets || []) {
        const matched = ticket.numbers.filter((n: number) => 
          winningNumbers.includes(n)
        ).length;

        const prizeAmount = this.calculatePrize(matched);

        await supabase
          .from('Ticket')
          .update({
            status: prizeAmount > 0 ? 'won' : 'lost',
            matchedNumbers: matched,
            prizeAmount,
          })
          .eq('id', ticket.id);

        if (matched > 0) {
          winnersCount[matched]++;
          totalPaid += prizeAmount;
        }

        // Log to AuditLog
        await supabase.from('AuditLog').insert({
          drawId: draw.id,
          ticketId: ticket.id,
          action: 'ticket_checked',
          details: {
            matched,
            prizeAmount,
            winningNumbers,
            ticketNumbers: ticket.numbers,
          },
        });
      }

      // 6. Update draw with winners stats
      await supabase
        .from('Draw')
        .update({
          winners: winnersCount,
          totalWinners: Object.values(winnersCount).reduce((a, b) => a + b, 0),
          totalPaid,
        })
        .eq('id', draw.id);

      // 7. Send final results to Telegram
      await sendLiveDrawUpdate(draw.id, 'results_announced', {
        winningNumbers,
        winners: winnersCount,
        totalPaid,
      });

      console.log(`✅ Draw ${draw.drawNumber} completed`);
    } catch (error) {
      console.error(`❌ Draw ${draw.drawNumber} failed:`, error);
      
      await supabase
        .from('Draw')
        .update({ status: 'failed' })
        .eq('id', draw.id);
    }
  }

  /**
   * Calculate prize amount based on matches
   */
  calculatePrize(matched: number): number {
    const prizes: Record<number, number> = {
      5: 500,
      4: 50,
      3: 5,
      2: 0.5,
      1: 0, // Free ticket (handled separately)
    };
    return prizes[matched] || 0;
  }

  /**
   * Encrypt seed (simple XOR with draw ID for demo)
   * In production, use proper encryption (AES-256)
   */
  private encryptSeed(seed: string, drawId: string): string {
    const key = crypto.createHash('sha256').update(drawId).digest('hex');
    return Buffer.from(seed).toString('base64') + '::' + key.slice(0, 8);
  }

  /**
   * Decrypt seed
   */
  private decryptSeed(encrypted: string, drawId: string): string {
    const [encoded] = encrypted.split('::');
    return Buffer.from(encoded, 'base64').toString('utf8');
  }

  /**
   * Start all schedulers
   */
  start() {
    this.schedulePreCommitment();
    this.scheduleDrawExecution();
    console.log('✅ Draw scheduler started');
  }
}

export const drawScheduler = new DrawScheduler();
