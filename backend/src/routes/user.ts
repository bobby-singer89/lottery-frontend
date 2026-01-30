import { Router } from 'express';
import { TonClient, Address } from '@ton/ton';

const router = Router();

const tonClient = new TonClient({
  endpoint: 'https://testnet.toncenter.com/api/v2/jsonRPC',
});

/**
 * GET /api/user/balance/:walletAddress
 * Get user's TON and USDT balance
 */
router.get('/balance/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;

  try {
    // Get TON balance
    const tonBalance = await getTonBalance(walletAddress);
    
    // Get USDT balance (Jetton)
    const usdtBalance = await getUsdtBalance(walletAddress);

    res.json({
      success: true,
      balances: {
        TON: tonBalance,
        USDT: usdtBalance,
      },
      wallet: walletAddress,
    });
  } catch (error: any) {
    console.error('Failed to get balances:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

async function getTonBalance(address: string): Promise<number> {
  try {
    const balance = await tonClient.getBalance(Address.parse(address));
    return parseFloat(balance.toString()) / 1e9; // Convert from nanotons
  } catch (error) {
    console.error('TON balance error:', error);
    return 0;
  }
}

async function getUsdtBalance(address: string): Promise<number> {
  // Placeholder for USDT Jetton balance
  // In production, query Jetton wallet contract
  try {
    // TODO: Implement Jetton balance query
    // const jettonWallet = await getJettonWallet(address, USDT_MASTER);
    // const balance = await jettonWallet.getBalance();
    // return balance / 1e6; // USDT has 6 decimals
    
    return 0; // Placeholder
  } catch (error) {
    console.error('USDT balance error:', error);
    return 0;
  }
}

export default router;
