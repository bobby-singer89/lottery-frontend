import { dedustService } from './src/services/dedustService';

async function testSwap() {
  console.log('Testing DeDust Service...\n');

  // Test 1: Get swap quote
  console.log('Test 1: Get swap quote for 10 TON -> USDT');
  try {
    const quote = await dedustService.getSwapQuote('TON', 'USDT', 10);
    console.log('✅ Quote received:', JSON.stringify(quote, null, 2));
  } catch (error: any) {
    console.log('❌ Quote failed:', error.message);
  }

  // Test 2: Get exchange rate
  console.log('\nTest 2: Get exchange rate TON -> USDT');
  try {
    const rate = await dedustService.getExchangeRate('TON', 'USDT');
    console.log('✅ Exchange rate:', rate);
  } catch (error: any) {
    console.log('❌ Rate failed:', error.message);
  }

  // Test 3: Get supported tokens
  console.log('\nTest 3: Get supported tokens');
  const tokens = dedustService.getSupportedTokens();
  console.log('✅ Supported tokens:', JSON.stringify(tokens, null, 2));

  // Test 4: Build swap transaction
  console.log('\nTest 4: Build swap transaction');
  try {
    const tx = await dedustService.buildSwapTransaction(
      'TON',
      'USDT',
      10,
      'EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2',
      0.5
    );
    console.log('✅ Transaction built:', {
      validUntil: tx.transaction.validUntil,
      messageCount: tx.transaction.messages.length,
      amount: tx.transaction.messages[0].amount,
      minOutput: tx.minOutput,
      estimatedGas: tx.estimatedGas,
    });
  } catch (error: any) {
    console.log('❌ Transaction build failed:', error.message);
  }

  console.log('\n✅ All tests completed!');
}

testSwap();
