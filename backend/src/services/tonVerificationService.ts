const TON_API = 'https://toncenter.com/api/v2';
const LOTTERY_WALLET = 'UQDAy6M4QQRcIy8jLl4n4acb7IxmDnPZiBqz7A_6xvY90NwS';

interface TransactionInfo {
  hash: string;
  from: string;
  to: string;
  value: string; // in nanotons
  timestamp: number;
  success: boolean;
}

/**
 * Verify transaction exists and is valid for ticket purchase
 */
export async function verifyTicketPurchaseTransaction(
  txHash: string,
  expectedAmountTON: number
): Promise<{ valid: boolean; error?: string; transaction?: TransactionInfo }> {
  try {
    console.log(`🔍 Verifying ticket purchase transaction: ${txHash}`);
    
    // TODO: Implement actual transaction query via TON API
    // For now, basic validation
    
    // 1. Check txHash format
    if (!txHash || txHash.length < 20) {
      return { valid: false, error: 'Invalid transaction hash format' };
    }
    
    // 2. Query transaction from blockchain (simplified for now)
    // In production, would query actual transaction details:
    // const response = await axios.get(`${TON_API}/getTransactions`, {
    //   params: { address: LOTTERY_WALLET, limit: 100 }
    // });
    // Then find matching txHash and verify amount
    
    // Mock verification for now
    console.log(`   Expected amount: ${expectedAmountTON} TON`);
    console.log(`   Expected destination: ${LOTTERY_WALLET}`);
    console.log(`   ✅ Transaction assumed valid (mock verification)`);
    
    return {
      valid: true,
      transaction: {
        hash: txHash,
        from: 'UQ...',
        to: LOTTERY_WALLET,
        value: (expectedAmountTON * 1e9).toString(),
        timestamp: Date.now(),
        success: true,
      }
    };
  } catch (error) {
    console.error('Transaction verification failed:', error);
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Verification failed' 
    };
  }
}

/**
 * Check if transaction hash was already used
 */
export async function isTransactionUsed(txHash: string, supabase: any): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('Ticket')
      .select('id')
      .eq('transactionHash', txHash)
      .single();
    
    return !!data && !error;
  } catch (error) {
    return false;
  }
}
