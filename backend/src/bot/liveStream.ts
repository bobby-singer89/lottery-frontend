import TelegramBot from 'node-telegram-bot-api';
import { supabase } from '../lib/supabase';

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling: false });
const LIVE_CHANNEL_ID = process.env.TELEGRAM_LIVE_CHANNEL_ID!; // -1003861546574

export async function sendLiveDrawUpdate(
  drawId: string,
  event: string,
  data: any
) {
  try {
    let message = '';

    switch (event) {
      case 'seed_hash_published':
        message = `
🔐 <b>ПРЕДВАРИТЕЛЬНОЕ ОБЯЗАТЕЛЬСТВО</b>

Тираж №${data.drawNumber}
Розыгрыш: ${new Date(data.scheduledAt).toLocaleString('ru-RU')}

📜 <b>Seed Hash:</b>
<code>${data.seedHash}</code>

Этот хэш опубликован ДО розыгрыша.
После розыгрыша мы раскроем исходный Seed.
Вы сможете проверить, что результаты честные.

🔗 Проверка честности:
https://lottery-frontend-chi.vercel.app/verify/${drawId}
        `.trim();
        break;

      case 'draw_started':
        message = `
🔴 <b>LIVE: Розыгрыш Weekend Special #${data.drawNumber}</b>

⏰ ${new Date().toLocaleTimeString('ru-RU')} - Розыгрыш начался!

Сейчас будет раскрыт Seed и сгенерированы выигрышные числа...
        `.trim();
        break;

      case 'seed_revealed':
        message = `
🔓 <b>SEED РАСКРЫТ!</b>

📜 <b>Seed:</b>
<code>${data.seed}</code>

🔐 <b>Seed Hash (опубликован ранее):</b>
<code>${data.seedHash}</code>

✅ Проверка: SHA256(seed) === seedHash

Генерируем выигрышные числа из seed...
        `.trim();
        break;

      case 'numbers_generated':
        message = `
🎯 <b>ВЫИГРЫШНЫЕ ЧИСЛА!</b>

🎲 <b>${data.winningNumbers.join(' - ')}</b>

Проверяем все билеты...
        `.trim();
        break;

      case 'results_announced':
        message = `
🎊 <b>РЕЗУЛЬТАТЫ РОЗЫГРЫША</b>

🎲 Выигрышные числа: <b>${data.winningNumbers.join(', ')}</b>

🏆 <b>Победители:</b>
💎 5 из 5: ${data.winners[5]} человек
🥇 4 из 5: ${data.winners[4]} человек
🥈 3 из 5: ${data.winners[3]} человек
🥉 2 из 5: ${data.winners[2]} человек
🎫 1 из 5: ${data.winners[1]} человек

💰 Выплачено призов: <b>${data.totalPaid} TON</b>

🔗 Проверить честность:
https://lottery-frontend-chi.vercel.app/verify/${drawId}

Поздравляем победителей! 🎉
        `.trim();
        break;

      default:
        return;
    }

    await bot.sendMessage(LIVE_CHANNEL_ID, message, {
      parse_mode: 'HTML',
    });

    // Log to audit
    await supabase.from('AuditLog').insert({
      drawId,
      action: `telegram_${event}`,
      details: { event, data, channelId: LIVE_CHANNEL_ID },
    });

  } catch (error) {
    console.error('Failed to send Telegram update:', error);
  }
}
