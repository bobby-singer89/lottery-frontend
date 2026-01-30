import { TonClient, WalletContractV4, internal } from '@ton/ton';
import { mnemonicToPrivateKey } from '@ton/crypto';
import { supabase } from '../lib/supabase';
import TelegramBot from 'node-telegram-bot-api';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });

const MAX_PAYOUT_PER_TX = 1000; // Maximum per transaction (TON or USDT)
const TX_DELAY = 2000; // 2 seconds between transactions

interface PayoutRequest {
  ticketId: string;
  userId: string;
  walletAddress: string;
  amount: number;
  currency: string;
  drawId: string;
}

export class PayoutService {
  private tonClient: TonClient;
  private wallet: any;
  private payoutQueue: PayoutRequest[] = [];

  constructor() {
    this.tonClient = new TonClient({
      endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
    });
  }

  /**
   * Initialize wallet from mnemonic
   */
  async initializeWallet() {
    if (!process.env.LOTTERY_WALLET_MNEMONIC) {
      console.warn('⚠️ No wallet mnemonic configured. Payouts disabled.');
      return;
    }

    try {
      const mnemonicString = process.env.LOTTERY_WALLET_MNEMONIC;
      const mnemonic = mnemonicString.split(' ');
      
      // Validate mnemonic format (should be 24 words)
      if (mnemonic.length !== 24) {
        throw new Error(`Invalid mnemonic: expected 24 words, got ${mnemonic.length}`);
      }
      
      // Validate each word is non-empty
      const invalidWords = mnemonic.filter(word => !word || word.trim().length === 0);
      if (invalidWords.length > 0) {
        throw new Error('Invalid mnemonic: contains empty words');
      }
      
      const keyPair = await mnemonicToPrivateKey(mnemonic);
      
      this.wallet = WalletContractV4.create({
        workchain: 0,
        publicKey: keyPair.publicKey,
      });

      console.log('✅ Lottery wallet initialized:', this.wallet.address.toString());
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(currency: string = 'TON'): Promise<number> {
    if (!this.wallet) return 0;

    try {
      if (currency === 'TON') {
        const balance = await this.tonClient.getBalance(this.wallet.address);
        return parseFloat(balance.toString()) / 1e9; // Convert from nanotons
      } else {
        // For USDT Jetton, need to query Jetton wallet
        // Placeholder for now
        return 0;
      }
    } catch (error) {
      console.error('Failed to get balance:', error);
      return 0;
    }
  }

  /**
   * Queue payout
   */
  async queuePayout(request: PayoutRequest) {
    this.payoutQueue.push(request);
    
    // Log to database
    await supabase.from('AuditLog').insert({
      ticketId: request.ticketId,
      drawId: request.drawId,
      action: 'payout_queued',
      details: request,
    });
  }

  /**
   * Process payout queue
   */
  async processQueue(currency: string) {
    const queueForCurrency = this.payoutQueue.filter(p => p.currency === currency);
    
    if (queueForCurrency.length === 0) {
      console.log('No payouts to process');
      return;
    }

    console.log(`💰 Processing ${queueForCurrency.length} payouts in ${currency}...`);

    // Check balance
    const balance = await this.getBalance(currency);
    const totalRequired = queueForCurrency.reduce((sum, p) => sum + p.amount, 0);

    if (balance < totalRequired) {
      console.error(`⚠️ Insufficient balance: ${balance} ${currency}, required: ${totalRequired}`);
      
      // Send admin alert
      await this.sendAdminAlert(`
⚠️ НЕДОСТАТОЧНО СРЕДСТВ ДЛЯ ВЫПЛАТ!

Валюта: ${currency}
Баланс: ${balance}
Требуется: ${totalRequired}
Дефицит: ${totalRequired - balance}

Выплат в очереди: ${queueForCurrency.length}

Пожалуйста, пополните кошелёк!
      `);
      
      return;
    }

    // Sort by amount (largest first)
    queueForCurrency.sort((a, b) => b.amount - a.amount);

    // Process each payout
    for (const payout of queueForCurrency) {
      try {
        await this.processPayout(payout);
        
        // Remove from queue
        const index = this.payoutQueue.indexOf(payout);
        if (index > -1) {
          this.payoutQueue.splice(index, 1);
        }
      } catch (error) {
        console.error(`Failed to process payout for ${payout.ticketId}:`, error);
      }
    }
  }

  /**
   * Process single payout (with splitting if needed)
   */
  async processPayout(payout: PayoutRequest) {
    const { ticketId, userId, walletAddress, amount, currency, drawId } = payout;

    console.log(`💸 Paying out ${amount} ${currency} to ${walletAddress}`);

    // Split into transactions if needed
    const txCount = Math.ceil(amount / MAX_PAYOUT_PER_TX);
    const txHashes: string[] = [];

    for (let i = 0; i < txCount; i++) {
      const txAmount = Math.min(
        MAX_PAYOUT_PER_TX,
        amount - (i * MAX_PAYOUT_PER_TX)
      );

      const txHash = await this.sendTransaction(walletAddress, txAmount, currency);
      txHashes.push(txHash);

      // Delay between transactions
      if (i < txCount - 1) {
        await this.sleep(TX_DELAY);
      }
    }

    // Update ticket
    await supabase
      .from('Ticket')
      .update({
        prizeClaimed: true,
        prizeClaimedAt: new Date().toISOString(),
      })
      .eq('id', ticketId);

    // Log to audit
    await supabase.from('AuditLog').insert({
      ticketId,
      drawId,
      action: 'prize_paid',
      details: {
        amount,
        currency,
        txCount,
        txHashes,
      },
      blockchainTx: txHashes[0],
    });

    // Notify user
    await this.notifyWinner(userId, amount, currency, txHashes, txCount);

    console.log(`✅ Payout completed: ${amount} ${currency} in ${txCount} transaction(s)`);
  }

  /**
   * Send transaction
   * TODO: IMPLEMENT ACTUAL TRANSACTION LOGIC BEFORE PRODUCTION USE
   * This is a placeholder implementation that returns a mock transaction hash
   */
  async sendTransaction(to: string, amount: number, currency: string): Promise<string> {
    // WARNING: Placeholder implementation - DO NOT USE IN PRODUCTION
    // Actual implementation needed for:
    // - TON native transfers using wallet.send()
    // - USDT Jetton transfers via Jetton contract
    
    console.warn(`⚠️ MOCK TRANSACTION: ${amount} ${currency} to ${to} (not actually sent)`);
    
    // Mock transaction hash for development/testing only
    return '0x' + Math.random().toString(16).substring(2, 66);
  }

  /**
   * Notify winner
   */
  async notifyWinner(userId: string, amount: number, currency: string, txHashes: string[], txCount: number) {
    const { data: user } = await supabase
      .from('User')
      .select('telegramId, walletAddress')
      .eq('id', userId)
      .single();

    if (!user?.telegramId) return;

    const message = `
🎉 <b>Поздравляем! Вы получили приз!</b>

💰 <b>Сумма:</b> ${amount} ${currency}
${txCount > 1 ? `📦 <b>Транзакций:</b> ${txCount}\n` : ''}

📜 <b>Transaction Hash${txCount > 1 ? 'es' : ''}:</b>
${txHashes.map((hash, i) => `${i + 1}. <code>${hash}</code>`).join('\n')}

💎 Средства отправлены на ваш кошелёк:
<code>${user.walletAddress}</code>

Проверьте баланс в вашем TON кошельке!
    `.trim();

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '🔗 Посмотреть транзакцию',
            url: `https://testnet.tonscan.org/tx/${txHashes[0]}`
          }
        ]
      ]
    };

    await bot.sendMessage(user.telegramId, message, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  }

  /**
   * Send admin alert
   */
  async sendAdminAlert(message: string) {
    const adminTelegramId = process.env.ADMIN_TELEGRAM_ID;
    if (adminTelegramId) {
      await bot.sendMessage(adminTelegramId, message);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const payoutService = new PayoutService();
