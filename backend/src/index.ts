import express from 'express';
import cors from 'cors';
import { drawScheduler } from './services/drawScheduler';
import { exchangeRateService } from './services/exchangeRates';
import { payoutService } from './services/payoutService';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import swapRoutes from './routes/swap';
import userRoutes from './routes/user';

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

// Swap routes
app.use('/api/swap', swapRoutes);

// User routes
app.use('/api/user', userRoutes);

// Initialize services
async function initializeServices() {
  // Initialize payout wallet
  await payoutService.initializeWallet();

  // Start exchange rate updates
  exchangeRateService.startAutoUpdate();

  // Start draw scheduler
  drawScheduler.start();
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
