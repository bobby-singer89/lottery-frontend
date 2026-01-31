import { supabase } from '../lib/supabase';

export class NotificationService {
  /**
   * Notify winner about their prize
   */
  async notifyWinner(ticketId: string, prizeAmount: number, currency: string): Promise<void> {
    try {
      const { data: ticket } = await supabase
        .from('Ticket')
        .select('*, draw:Draw(*)')
        .eq('id', ticketId)
        .single();

      if (!ticket) {
        console.error('Ticket not found:', ticketId);
        return;
      }

      const message = `🎉 Congratulations! You won ${prizeAmount} ${currency}!`;
      
      console.log(`📧 Notification sent to winner: ${message}`);
      
      // Log notification
      await supabase.from('AuditLog').insert({
        ticketId,
        drawId: ticket.drawId,
        action: 'winner_notified',
        details: {
          prizeAmount,
          currency,
          message,
        },
      });
    } catch (error) {
      console.error('Failed to notify winner:', error);
    }
  }

  /**
   * Notify all participants when draw completes
   */
  async notifyDrawComplete(drawId: string): Promise<void> {
    try {
      const { data: draw } = await supabase
        .from('Draw')
        .select('*, lottery:Lottery(*)')
        .eq('id', drawId)
        .single();

      if (!draw) {
        console.error('Draw not found:', drawId);
        return;
      }

      const { data: tickets } = await supabase
        .from('Ticket')
        .select('*')
        .eq('drawId', drawId);

      console.log(`📧 Draw complete notification sent to ${tickets?.length || 0} participants`);
      
      // Log notification
      await supabase.from('AuditLog').insert({
        drawId,
        action: 'draw_complete_notified',
        details: {
          totalParticipants: tickets?.length || 0,
          winningNumbers: draw.winningNumbers,
          totalWinners: draw.totalWinners,
        },
      });
    } catch (error) {
      console.error('Failed to notify draw completion:', error);
    }
  }

  /**
   * Send notification to user
   */
  async sendNotification(userId: string, title: string, message: string): Promise<void> {
    try {
      console.log(`📧 Notification: ${title} - ${message}`);
      
      // In production, integrate with:
      // - Telegram Bot API
      // - Email service (SendGrid, AWS SES)
      // - Push notifications (Firebase, OneSignal)
      
      // For now, just log to audit
      await supabase.from('AuditLog').insert({
        action: 'notification_sent',
        details: {
          userId,
          title,
          message,
        },
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}

export const notificationService = new NotificationService();
