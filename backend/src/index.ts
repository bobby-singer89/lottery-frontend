import express from 'express';
import cors from 'cors';
import { drawScheduler } from './services/drawScheduler';
import publicRoutes from './routes/public';

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

// Start draw scheduler
drawScheduler.start();

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
});

export default app;
