import { supabase } from '../lib/supabase';
import { payoutService } from './payoutService';

interface PayoutRequest {
  winnerId?: string; // Optional: Only set when created via Winner table, not for direct ticket payouts
  ticketId: string;
  userId: string;
  walletAddress: string;
  amount: number;
  currency: string;
  drawId: string;
}

export class PayoutQueueService {
  /**
   * Queue a payout for a winner
   */
  async queuePayout(request: PayoutRequest): Promise<void> {
    // Create payout record
    const { data: payout, error } = await supabase
      .from('Payout')
      .insert({
        winnerId: request.winnerId,
        ticketId: request.ticketId,
        walletAddress: request.walletAddress,
        amount: request.amount,
        currency: request.currency,
        status: 'pending',
        attempts: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to queue payout:', error);
      throw error;
    }

    console.log(`✅ Payout queued: ${request.amount} ${request.currency} to ${request.walletAddress}`);

    // Also queue in the legacy payout service
    await payoutService.queuePayout(request);
  }

  /**
   * Process pending payouts
   * Called by cron job every 5 minutes
   */
  async processPendingPayouts(): Promise<void> {
    console.log('💰 Processing pending payouts...');

    const { data: pendingPayouts } = await supabase
      .from('Payout')
      .select('*')
      .eq('status', 'pending')
      .lt('attempts', 3) // Max 3 attempts
      .order('createdAt', { ascending: true })
      .limit(10); // Process 10 at a time

    if (!pendingPayouts || pendingPayouts.length === 0) {
      console.log('No pending payouts');
      return;
    }

    for (const payout of pendingPayouts) {
      try {
        await this.processPayout(payout);
      } catch (error) {
        console.error(`Failed to process payout ${payout.id}:`, error);
      }
    }
  }

  /**
   * Process a single payout
   */
  private async processPayout(payout: any): Promise<void> {
    try {
      // Increment attempts
      await supabase
        .from('Payout')
        .update({
          attempts: payout.attempts + 1,
          status: 'processing',
        })
        .eq('id', payout.id);

      // Send transaction (mock for now)
      const txHash = await payoutService.sendTransaction(
        payout.walletAddress,
        payout.amount,
        payout.currency
      );

      // Update payout as completed
      await supabase
        .from('Payout')
        .update({
          status: 'completed',
          txHash,
          processedAt: new Date().toISOString(),
        })
        .eq('id', payout.id);

      // Update ticket
      if (payout.ticketId) {
        await supabase
          .from('Ticket')
          .update({
            prizeClaimed: true,
            prizeClaimedAt: new Date().toISOString(),
          })
          .eq('id', payout.ticketId);
      }

      console.log(`✅ Payout completed: ${payout.amount} ${payout.currency} - TX: ${txHash}`);
    } catch (error: any) {
      console.error(`Failed to process payout ${payout.id}:`, error);

      // Update payout with error
      await supabase
        .from('Payout')
        .update({
          status: payout.attempts >= 2 ? 'failed' : 'pending',
          lastError: error.message,
        })
        .eq('id', payout.id);
    }
  }

  /**
   * Get payout status
   */
  async getPayoutStatus(ticketId: string) {
    const { data: payout } = await supabase
      .from('Payout')
      .select('*')
      .eq('ticketId', ticketId)
      .order('createdAt', { ascending: false })
      .limit(1)
      .single();

    return payout;
  }

  /**
   * Retry failed payout
   */
  async retryPayout(payoutId: string): Promise<void> {
    await supabase
      .from('Payout')
      .update({
        status: 'pending',
        attempts: 0,
        lastError: null,
      })
      .eq('id', payoutId);

    console.log(`🔄 Payout ${payoutId} queued for retry`);
  }
}

export const payoutQueue = new PayoutQueueService();
