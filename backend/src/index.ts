import express from 'express';
import cors from 'cors';
import { drawScheduler } from './services/drawScheduler';
import { exchangeRateService } from './services/exchangeRates';
import { payoutService } from './services/payoutService';
import { payoutQueue } from './services/payoutQueue';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import swapRoutes from './routes/swap';
import financeRoutes from './routes/admin/finance';
import lotteryRoutes from './routes/lottery';
import adminDrawRoutes from './routes/admin/draws';
import drawRoutes from './routes/draws';
import analyticsRoutes from './routes/analytics';
import cron from 'node-cron';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/public', publicRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Admin finance routes
app.use('/api/admin/finance', financeRoutes);

// Admin draw routes
app.use('/api/admin/draws', adminDrawRoutes);

// Public draw routes
app.use('/api/draws', drawRoutes);

// Lottery routes (ticket purchases)
app.use('/api/lottery', lotteryRoutes);

// Also support /api/tickets for bulk purchases
app.use('/api/tickets', lotteryRoutes);

// Swap routes
app.use('/api/swap', swapRoutes);

// Analytics routes
app.use('/api/analytics', analyticsRoutes);

// Initialize services
async function initializeServices() {
  // Initialize payout wallet
  await payoutService.initializeWallet();

  // Start exchange rate updates
  exchangeRateService.startAutoUpdate();

  // Start draw scheduler
  drawScheduler.start();

  // Start payout queue processor - runs every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔄 Running payout queue processor...');
    await payoutQueue.processPendingPayouts();
  });

  console.log('✅ Payout queue processor scheduled (every 5 minutes)');
}

// Start services and server
initializeServices().then(() => {
  app.listen(PORT, () => {
    console.log(`✅ Backend server running on port ${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api`);
  });
}).catch((error) => {
  console.error('Failed to initialize services:', error);
  process.exit(1);
});

export default app;
