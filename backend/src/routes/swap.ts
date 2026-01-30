import { Router } from 'express';
import { dedustService } from '../services/dedustService';

const router = Router();

/**
 * GET /api/swap/quote
 * Get swap quote
 */
router.get('/quote', async (req, res) => {
  const { from, to, amount } = req.query;

  if (!from || !to || !amount) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters: from, to, amount',
    });
  }

  try {
    const quote = await dedustService.getSwapQuote(
      from as string,
      to as string,
      parseFloat(amount as string)
    );

    res.json({
      success: true,
      quote,
    });
  } catch (error: any) {
    console.error('Quote error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * POST /api/swap/build-transaction
 * Build swap transaction for TON Connect
 */
router.post('/build-transaction', async (req, res) => {
  const { from, to, amount, userWallet, slippage } = req.body;

  if (!from || !to || !amount || !userWallet) {
    return res.status(400).json({
      success: false,
      error: 'Missing required parameters',
    });
  }

  try {
    const result = await dedustService.buildSwapTransaction(
      from,
      to,
      parseFloat(amount),
      userWallet,
      slippage || 0.5
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    console.error('Build transaction error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /api/swap/tokens
 * Get supported tokens
 */
router.get('/tokens', (req, res) => {
  res.json({
    success: true,
    tokens: dedustService.getSupportedTokens(),
  });
});

/**
 * GET /api/swap/rate/:from/:to
 * Get exchange rate
 */
router.get('/rate/:from/:to', async (req, res) => {
  const { from, to } = req.params;

  try {
    const rate = await dedustService.getExchangeRate(from, to);

    res.json({
      success: true,
      from,
      to,
      rate,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Rate error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
