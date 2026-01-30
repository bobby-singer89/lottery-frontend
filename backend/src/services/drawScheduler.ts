import cron from 'node-cron';
import { supabase } from '../lib/supabase';
import { provablyFair } from './provablyFair';
import { sendLiveDrawUpdate } from '../bot/liveStream';
import { payoutService } from './payoutService';
import crypto from 'crypto';

// Constants
const WINNING_NUMBERS_COUNT = 5;
const MAX_LOTTERY_NUMBER = 36;

export class DrawScheduler {
  /**
   * Close ticket sales 10 minutes before draw
   * Runs every minute
   */
  scheduleTicketSalesCutoff() {
    cron.schedule('* * * * *', async () => {
      const now = new Date();
      const in10Minutes = new Date(now.getTime() + 10 * 60 * 1000);
      
      const { data: draws } = await supabase
        .from('Draw')
        .select('*, lottery:Lottery(*)')
        .eq('status', 'scheduled')
        .eq('ticketSalesOpen', true)
        .gte('scheduledAt', now.toISOString())
        .lte('scheduledAt', in10Minutes.toISOString());
      
      for (const draw of draws || []) {
        // Close sales
        await supabase
          .from('Draw')
          .update({ 
            ticketSalesOpen: false,
            ticketSalesClosedAt: now.toISOString()
          })
          .eq('id', draw.id);
        
        console.log(`🛑 Sales closed for draw ${draw.drawNumber}`);
        
        // Notify Telegram channel
        await sendLiveDrawUpdate(draw.id, 'sales_closed', {
          drawNumber: draw.drawNumber,
          scheduledAt: draw.scheduledAt,
          totalTickets: draw.totalTickets,
        });
      }
    });
  }

  /**
   * Finalize data 5 minutes before draw
   */
  scheduleDataFinalization() {
    cron.schedule('* * * * *', async () => {
      const now = new Date();
      const in5Minutes = new Date(now.getTime() + 5 * 60 * 1000);
      
      const { data: draws } = await supabase
        .from('Draw')
        .select('*')
        .eq('status', 'scheduled')
        .eq('ticketSalesOpen', false)
        .is('dataFinalized', null)
        .gte('scheduledAt', now.toISOString())
        .lte('scheduledAt', in5Minutes.toISOString());
      
      for (const draw of draws || []) {
        // Count tickets
        const { count: totalTickets } = await supabase
          .from('Ticket')
          .select('*', { count: 'exact', head: true })
          .eq('drawId', draw.id);
        
        // Calculate prize pool
        const { data: tickets } = await supabase
          .from('Ticket')
          .select('price')
          .eq('drawId', draw.id);
        
        const totalPrizePool = tickets?.reduce((sum, t) => sum + parseFloat(t.price), 0) || 0;
        
        // Finalize
        await supabase
          .from('Draw')
          .update({
            totalTickets,
            totalPrizePool,
            dataFinalized: true,
            dataFinalizedAt: now.toISOString(),
          })
          .eq('id', draw.id);
        
        console.log(`✅ Data finalized for draw ${draw.drawNumber}: ${totalTickets} tickets, ${totalPrizePool} in pool`);
      }
    });
  }

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
          
          // Get existing audit log or create new one
          const existingAuditLog = draw.auditLog || [];
          const newAuditEntry = { 
            action: 'seed_generated', 
            timestamp: new Date().toISOString(),
            encryptedSeed: encrypted 
          };
          
          await supabase
            .from('Draw')
            .update({
              auditLog: [...existingAuditLog, newAuditEntry]
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
      if (!draw.auditLog || draw.auditLog.length === 0 || !draw.auditLog[0].encryptedSeed) {
        throw new Error('Seed not found in audit log - pre-commitment may have failed');
      }
      
      const seed = this.decryptSeed(draw.auditLog[0].encryptedSeed, draw.id);
      
      await sendLiveDrawUpdate(draw.id, 'seed_revealed', {
        seed,
        seedHash: draw.seedHash,
      });

      // 3. Generate winning numbers
      const winningNumbers = provablyFair.generateWinningNumbers(seed, WINNING_NUMBERS_COUNT, MAX_LOTTERY_NUMBER);
      
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

        if (prizeAmount > 0) {
          winnersCount[matched]++;
          totalPaid += prizeAmount;
          
          // Queue payout
          await payoutService.queuePayout({
            ticketId: ticket.id,
            userId: ticket.userId,
            walletAddress: ticket.walletAddress,
            amount: prizeAmount,
            currency: ticket.currency || 'TON',
            drawId: draw.id,
          });
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

      // 7. Process payouts
      // Get lottery info to determine currency
      const { data: lottery } = await supabase
        .from('Lottery')
        .select('currency')
        .eq('id', draw.lotteryId)
        .single();
      
      await payoutService.processQueue(lottery?.currency || 'TON');

      // 8. Send final results to Telegram
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
      1: 0, // No prize for 1 match
    };
    return prizes[matched] || 0;
  }

  /**
   * Encrypt seed using AES-256-GCM
   * Note: This is a simplified implementation for demo purposes.
   * In production, use a proper key management system (e.g., AWS KMS, HashiCorp Vault)
   */
  private encryptSeed(seed: string, drawId: string): string {
    // WARNING: This is NOT secure encryption, just base64 encoding for demo
    // In production, implement proper AES-256-GCM encryption with secure key storage
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
    this.scheduleTicketSalesCutoff();
    this.scheduleDataFinalization();
    this.scheduleDrawExecution();
    console.log('✅ Draw scheduler started with sales cutoff');
  }
}

export const drawScheduler = new DrawScheduler();
