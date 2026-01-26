# Weekend Special Lottery - Setup Guide

Complete step-by-step guide for setting up the Weekend Special Lottery system.

---

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (we use Supabase)
- Telegram Bot (created via @BotFather)
- TON Testnet wallet

---

## 📦 Part 1: Initial Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd test
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd backend
npm install
cd ..
```

---

## 🔐 Part 2: Environment Configuration

### 1. Create environment file

```bash
cp .env.example .env.local
```

### 2. Configure environment variables

Edit `.env.local` with your actual credentials:

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.yqqwlodfmhlaeepqslyq.supabase.co:5432/postgres"

# Telegram Bot (get from @BotFather)
TELEGRAM_BOT_TOKEN="8356073461:AAGvKE42hZf5611XK13sTaq4kL6WZyq3OQA"
TELEGRAM_BOT_USERNAME="@Lottery_555_bot"

# TON Configuration
TON_NETWORK="testnet"
LOTTERY_WALLET="0QDAy6M4QQRcIy8jLl4n4acb7IxmDnPZiBqz7A_6xvY90GeY"

# Lottery Settings
TICKET_PRICE="1"
DRAW_TIME="18:00"
DRAW_TIMEZONE="Europe/Moscow"

# JWT Secret (MUST GENERATE!)
JWT_SECRET="your-generated-secret-here"

# Admin Telegram IDs (your Telegram user IDs)
ADMIN_TELEGRAM_IDS="123456789,987654321"

# URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 3. Generate JWT Secret

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the output and paste it as `JWT_SECRET` in `.env.local`.

---

## 🗄️ Part 3: Database Setup

### 1. Ensure PostgreSQL is running

If using Supabase, your database is already running. Just make sure the `DATABASE_URL` is correct.

### 2. Generate Prisma Client

```bash
cd backend
npm run db:generate
```

Expected output:
```
✔ Generated Prisma Client (v5.22.0)
```

### 3. Run database migrations

```bash
npm run db:migrate
```

This will create all tables in your database:
- users
- lotteries
- tickets
- draws
- transactions
- notifications
- admin_users

### 4. Seed initial data

```bash
npm run db:seed
```

This creates:
- Weekend Special lottery configuration
- First pending draw scheduled for today at 18:00

Expected output:
```
Created lottery: { id: 1, name: 'Weekend Special', ... }
Created draw: { id: 1, lotteryId: 1, ... }
```

### 5. (Optional) Open Prisma Studio

To visually inspect your database:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:5555`

---

## 🚀 Part 4: Running the Application

### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Backend server running on port 3001
📡 API available at http://localhost:3001/api
💚 Health check: http://localhost:3001/api/health
```

### Terminal 2: Frontend Server

```bash
# From project root
npm run dev
```

Expected output:
```
  VITE v7.2.4  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

---

## ✅ Part 5: Verification

### 1. Check backend health

Open in browser or use curl:

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-01-24T...",
  "uptime": 10
}
```

### 2. Check lottery list

```bash
curl http://localhost:3001/api/lottery/list
```

You should see the Weekend Special lottery in the response.

### 3. Check frontend

Open `http://localhost:3000` in your browser. You should see the lottery application.

---

## 🎮 Part 6: Testing the Flow

### 1. Get your Telegram ID

Open Telegram and send a message to `@userinfobot`. It will reply with your Telegram ID.

### 2. Test authentication

```bash
curl -X POST http://localhost:3001/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "telegramId": YOUR_TELEGRAM_ID,
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "languageCode": "en"
  }'
```

Save the returned `token` for the next steps.

### 3. Connect TON wallet (optional)

```bash
curl -X POST http://localhost:3001/api/auth/connect-wallet \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tonWallet": "EQC..."
  }'
```

### 4. Get current draw

```bash
curl http://localhost:3001/api/draws/current?lotterySlug=weekend-special
```

### 5. Test ticket purchase (requires actual TON transaction)

```bash
curl -X POST http://localhost:3001/api/lottery/weekend-special/buy-ticket \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "selectedNumbers": [5, 12, 18, 24, 31],
    "txHash": "your_transaction_hash"
  }'
```

---

## 🔧 Part 7: Telegram Bot Setup

### 1. Create a bot with @BotFather

1. Open Telegram and search for `@BotFather`
2. Send `/newbot`
3. Follow the prompts to create your bot
4. Copy the bot token

### 2. Set bot webhook (for production)

```bash
curl -X POST https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook \
  -d "url=https://your-domain.com/api/webhooks/telegram"
```

### 3. Test bot notifications

The backend can send Telegram notifications to users. Test this manually in your code or wait for actual events (ticket purchase, draw results, etc.)

---

## 🌐 Part 8: Production Deployment

### Backend (e.g., Railway, Render, Fly.io)

1. Set all environment variables
2. Run migrations: `npm run db:migrate`
3. Build: `npm run build`
4. Start: `npm run start`

### Frontend (e.g., Vercel, Netlify)

1. Set environment variables in your hosting platform
2. Build command: `npm run build`
3. Output directory: `dist`

### Database (Supabase)

Already configured! Just ensure the `DATABASE_URL` is correct.

---

## 📝 Common Issues

### Issue: "Cannot connect to database"

**Solution:** Check that:
- Database is running
- `DATABASE_URL` in `.env.local` is correct
- No firewall blocking the connection
- IP whitelist allows your IP (if using Supabase)

### Issue: "Prisma Client not found"

**Solution:**
```bash
cd backend
npm run db:generate
```

### Issue: "Port 3000 or 3001 already in use"

**Solution:**
- Kill the process using that port
- Or change the port in the code

### Issue: "JWT token invalid"

**Solution:**
- Ensure `JWT_SECRET` is the same on backend and matches what was used to sign the token
- Token might be expired (default 30 days)

---

## 🎯 Next Steps

After successful setup:

1. **Configure Telegram Bot** - Set up bot commands and webhooks
2. **Add Admin Users** - Add admin Telegram IDs to `ADMIN_TELEGRAM_IDS`
3. **Test Draw Execution** - Implement scheduled draw execution
4. **Setup Prize Payouts** - Implement automatic prize distribution
5. **Add Monitoring** - Set up logging and error tracking
6. **Security Hardening** - Add rate limiting, CORS, etc.
7. **Deploy to Production** - Deploy to your hosting platforms

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [TON Documentation](https://docs.ton.org)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Express.js Guide](https://expressjs.com)

---

## 🆘 Getting Help

If you encounter issues:

1. Check the logs for error messages
2. Review this setup guide again
3. Check `backend/README.md` for API documentation
4. Check `backend/API_DOCUMENTATION.md` for endpoint details

---

**Happy Lottery Building! 🎰💰**
