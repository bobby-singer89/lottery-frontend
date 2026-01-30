# Backend Routes Guide

## Required API Endpoints

### 1. Get All Lotteries

**Endpoint:** `GET /api/public/lotteries`

**Query Parameters:**
- `currency` (optional): Filter by TON or USDT

**Response:**
```json
{
  "success": true,
  "lotteries": [
    {
      "id": 1,
      "name": "Mega Jackpot",
      "slug": "mega-jackpot",
      "currency": "TON",
      "jackpot": 10000,
      "ticketPrice": 10,
      "maxTickets": 1234,
      "soldTickets": 856,
      "drawDate": "2026-02-01T12:00:00Z",
      "description": "Largest TON jackpot",
      "featured": true,
      "active": true
    }
  ]
}
```

**Example Implementation (Express + Prisma):**
```typescript
// routes/public.ts
import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.get('/lotteries', async (req, res) => {
  try {
    const { currency } = req.query;
    
    const where: any = { active: true };
    if (currency === 'TON' || currency === 'USDT') {
      where.currency = currency;
    }
    
    const lotteries = await prisma.lottery.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { jackpot: 'desc' }
      ],
      include: {
        _count: {
          select: { tickets: true }
        }
      }
    });
    
    res.json({ 
      success: true, 
      lotteries: lotteries.map(l => ({
        ...l,
        soldTickets: l._count.tickets
      }))
    });
    
  } catch (error) {
    console.error('Error fetching lotteries:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch lotteries' 
    });
  }
});

export default router;
```

### 2. Get Exchange Rate

**Endpoint:** `GET /api/public/exchange-rates/:from/:to`

**Example:** `GET /api/public/exchange-rates/TON/USDT`

**Response:**
```json
{
  "success": true,
  "rate": 5.2,
  "from": "TON",
  "to": "USDT"
}
```

**Example Implementation:**
```typescript
router.get('/exchange-rates/:from/:to', async (req, res) => {
  try {
    const { from, to } = req.params;
    
    // TODO: Implement real exchange rate fetching
    // For now, return mock rate
    const rate = from === 'TON' && to === 'USDT' ? 5.2 : 1;
    
    res.json({
      success: true,
      rate,
      from,
      to
    });
    
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exchange rate'
    });
  }
});
```

### 3. Mount Routes in Main App

**File:** `src/index.ts` or `src/app.ts`

```typescript
import express from 'express';
import cors from 'cors';
import publicRoutes from './routes/public';

const app = express();

app.use(cors());
app.use(express.json());

// Mount public routes with /api prefix
app.use('/api/public', publicRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
```

## Notes

- All public endpoints should be prefixed with `/api/public`
- Currency filtering should be case-sensitive ('TON' or 'USDT')
- Always return `success` field in response
- Use proper error handling and status codes
- Exchange rates can be fetched from external APIs (e.g., CoinGecko, Binance)
