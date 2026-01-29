# Lottery Backend API

Backend API for the lottery application with Provably Fair system, live Telegram draw streams, and public verification.

## Features

- ✅ Provably Fair lottery system with seed hash pre-commitment
- ✅ Automated draw scheduler with cron jobs
- ✅ Live Telegram stream during draws
- ✅ Public verification API endpoints
- ✅ Seed encryption and secure storage
- ✅ Complete audit trail

## Installation

```bash
cd backend
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Telegram Bot
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_LIVE_CHANNEL_ID=-100XXXXXXXXXXXX

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Running

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## API Endpoints

### Public Verification

#### GET `/api/public/draw/:drawId/verify`
Verify the fairness of a draw.

**Response:**
```json
{
  "success": true,
  "drawId": "...",
  "drawNumber": 1,
  "status": "completed",
  "seedHash": "...",
  "seed": "...",
  "winningNumbers": [5, 12, 23, 34, 42],
  "verified": true,
  "proof": {
    "seedHashMatches": true,
    "numbersValid": true,
    "seedHashPublishedBefore": true
  },
  "totalTickets": 100,
  "winners": { "5": 1, "4": 5, "3": 15, "2": 30, "1": 49 },
  "totalPaid": 1000
}
```

#### GET `/api/public/ticket/:ticketId/verify`
Verify an individual ticket.

**Response:**
```json
{
  "success": true,
  "ticket": {
    "id": "...",
    "numbers": [5, 12, 23, 34, 42],
    "status": "won",
    "matchedNumbers": 5,
    "prizeAmount": 500,
    "txHash": "...",
    "purchasedAt": "2026-01-20T12:00:00Z"
  },
  "draw": {
    "drawNumber": 1,
    "winningNumbers": [5, 12, 23, 34, 42],
    "executedAt": "2026-01-26T20:00:00Z"
  }
}
```

## Provably Fair System

### How It Works

1. **Pre-commitment (24h before draw)**
   - Generate random seed
   - Compute SHA256 hash of seed
   - Publish hash to Telegram channel
   - Store encrypted seed securely

2. **Draw Execution**
   - Start live Telegram stream
   - Reveal original seed
   - Verify seed matches published hash
   - Generate winning numbers from seed
   - Check all tickets
   - Announce results

3. **Public Verification**
   - Anyone can verify the draw
   - Compare seed hash with published hash
   - Regenerate numbers from seed
   - Confirm numbers match results

### Verification Process

Users can verify draws by:

1. Visiting `/verify/:drawId` page
2. Checking that `SHA256(seed) === seedHash`
3. Verifying numbers were generated correctly from seed
4. Confirming hash was published before draw

## Scheduler

### Pre-commitment Scheduler
- **Cron:** `0 20 * * *` (20:00 UTC / 23:00 MSK)
- **Action:** Publish seed hash 24h before draw

### Draw Execution Scheduler
- **Cron:** `0 20 * * *` (20:00 UTC / 23:00 MSK)
- **Action:** Execute scheduled draws

## Telegram Live Stream

During each draw, the bot sends updates to the Telegram channel:

1. Seed hash published (24h before)
2. Draw started
3. Seed revealed
4. Winning numbers generated
5. Final results announced

Channel ID: Set via `TELEGRAM_LIVE_CHANNEL_ID` environment variable

## Security

- ✅ Seed hash published BEFORE draw
- ✅ Seed revealed AFTER draw
- ✅ Encrypted seed storage
- ✅ Complete audit trail
- ✅ Public verification API
- ✅ Deterministic number generation

## Database Schema

Required tables:
- `Draw` - Draw information
- `Ticket` - Ticket purchases
- `AuditLog` - Complete audit trail

Required fields in `Draw` table:
- `seedHash` (TEXT) - Published before draw
- `seed` (TEXT) - Revealed after draw
- `seedHashPublishedAt` (TIMESTAMP)
- `seedRevealedAt` (TIMESTAMP)
- `winners` (JSONB)
- `auditLog` (JSONB)

## Development

The backend uses:
- **Express** - Web framework
- **TypeScript** - Type safety
- **Supabase** - Database client
- **node-cron** - Scheduled tasks
- **node-telegram-bot-api** - Telegram integration

## Testing

```bash
# Test verification endpoint
curl http://localhost:3001/api/public/draw/draw-id/verify

# Test health check
curl http://localhost:3001/health
```

## Deployment

1. Set environment variables
2. Run database migrations
3. Build TypeScript: `npm run build`
4. Start server: `npm start`

## License

MIT
