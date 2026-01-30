import axios from 'axios';

const DEDUST_API = 'https://api.dedust.io/v2';

// DeDust Router contract (mainnet)
const DEDUST_ROUTER = 'EQBfBWT7X2BHg9tXAxzhz2aKiNTU1tpt5NsiK0uSDW_YAJ67';

// Token addresses
const TOKENS = {
  TON: 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c',
  USDT: 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
};

interface SwapQuote {
  fromAmount: string;
  toAmount: string;
  rate: number;
  priceImpact: number;
  fee: number;
  minimumReceived: string;
}

export class DedustService {
  /**
   * Get swap quote from DeDust
   */
  async getSwapQuote(
    fromToken: string,
    toToken: string,
    amount: number
  ): Promise<SwapQuote> {
    try {
      // Fetch pools from DeDust
      const response = await axios.get(`${DEDUST_API}/pools`, {
        timeout: 5000,
      });

      const pools = response.data;

      // Find TON/USDT pool
      const pool = this.findPool(pools, fromToken, toToken);

      if (!pool) {
        throw new Error(`Pool for ${fromToken}/${toToken} not found`);
      }

      // Calculate swap output
      const { outputAmount, priceImpact, fee } = this.calculateSwap(
        pool,
        fromToken,
        toToken,
        amount
      );

      const rate = outputAmount / amount;

      return {
        fromAmount: amount.toString(),
        toAmount: outputAmount.toFixed(6),
        rate,
        priceImpact,
        fee,
        minimumReceived: (outputAmount * 0.995).toFixed(6), // 0.5% slippage
      };
    } catch (error) {
      console.error('Failed to get swap quote:', error);

      // Fallback to manual rate if DeDust API fails
      const fallbackRate = this.getFallbackRate(fromToken, toToken);
      const outputAmount = amount * fallbackRate;

      return {
        fromAmount: amount.toString(),
        toAmount: outputAmount.toFixed(6),
        rate: fallbackRate,
        priceImpact: 0.1,
        fee: outputAmount * 0.003,
        minimumReceived: (outputAmount * 0.995).toFixed(6),
      };
    }
  }

  /**
   * Get current exchange rate
   */
  async getExchangeRate(fromToken: string, toToken: string): Promise<number> {
    try {
      const quote = await this.getSwapQuote(fromToken, toToken, 1);
      return parseFloat(quote.toAmount);
    } catch (error) {
      console.error('Failed to get exchange rate:', error);
      return this.getFallbackRate(fromToken, toToken);
    }
  }

  /**
   * Build swap transaction for TON Connect
   */
  async buildSwapTransaction(
    fromToken: string,
    toToken: string,
    amount: number,
    userWallet: string,
    slippage: number = 0.5
  ) {
    const quote = await this.getSwapQuote(fromToken, toToken, amount);
    
    // Calculate minimum output with slippage tolerance
    const minOutput = parseFloat(quote.toAmount) * (1 - slippage / 100);

    // Convert amount to smallest units
    const amountInNano = Math.floor(amount * 1e9); // For TON (9 decimals)

    // Build transaction for TON Connect
    // Valid for 5 minutes to give user time to review and confirm
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
      messages: [
        {
          address: DEDUST_ROUTER,
          amount: amountInNano.toString(),
          payload: this.buildSwapPayload(
            fromToken,
            toToken,
            amountInNano,
            Math.floor(minOutput * 1e6), // USDT has 6 decimals
            userWallet
          ),
        },
      ],
    };

    return {
      transaction,
      quote,
      minOutput: minOutput.toFixed(6),
      estimatedGas: '0.05', // Estimated gas in TON - actual cost may vary
    };
  }

  /**
   * Build swap payload (cell for DeDust)
   * NOTE: This is a placeholder implementation. In production, you MUST use @dedust/sdk
   * to build proper BOC (Bag of Cells) payloads that DeDust smart contracts can process.
   * Current implementation returns empty string which means native TON transfer without payload.
   * For actual swaps, integrate @dedust/sdk and use proper Cell serialization.
   */
  private buildSwapPayload(
    fromToken: string,
    toToken: string,
    amountInNano: number,
    minOutputInNano: number,
    recipient: string
  ): string {
    // TODO: Implement proper DeDust swap payload using @dedust/sdk
    // Example: Use ton-core's beginCell() to build proper BOC payload
    // For now, return empty string (native TON transfer)
    console.warn('Swap payload building not implemented - requires @dedust/sdk integration');
    return '';
  }

  /**
   * Find pool for token pair
   */
  private findPool(pools: any[], fromToken: string, toToken: string): any {
    return pools.find(
      (p: any) =>
        (p.assets?.includes(fromToken) && p.assets?.includes(toToken)) ||
        (p.token0 === fromToken && p.token1 === toToken) ||
        (p.token1 === fromToken && p.token0 === toToken)
    );
  }

  /**
   * Calculate swap using constant product formula
   */
  private calculateSwap(
    pool: any,
    fromToken: string,
    toToken: string,
    amountIn: number
  ): { outputAmount: number; priceImpact: number; fee: number } {
    // Get reserves
    const reserves = this.getPoolReserves(pool, fromToken, toToken);
    const { reserveIn, reserveOut } = reserves;

    // Constant product formula: x * y = k
    const FEE = 0.003; // 0.3% fee
    const amountInWithFee = amountIn * (1 - FEE);

    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn + amountInWithFee;
    const outputAmount = numerator / denominator;

    // Calculate price impact
    const spotPrice = reserveOut / reserveIn;
    const executionPrice = outputAmount / amountIn;
    const priceImpact = Math.abs((executionPrice - spotPrice) / spotPrice) * 100;

    const fee = amountIn * FEE;

    return { outputAmount, priceImpact, fee };
  }

  /**
   * Get pool reserves
   */
  private getPoolReserves(pool: any, fromToken: string, toToken: string) {
    // Handle different API response formats
    if (pool.reserves) {
      return {
        reserveIn: pool.reserves[fromToken] || 1000000,
        reserveOut: pool.reserves[toToken] || 5200000,
      };
    } else if (pool.reserve0 && pool.reserve1) {
      const isToken0 = pool.token0 === fromToken;
      return {
        reserveIn: isToken0 ? pool.reserve0 : pool.reserve1,
        reserveOut: isToken0 ? pool.reserve1 : pool.reserve0,
      };
    }

    // Fallback to estimated liquidity (approximate TON/USDT pool values)
    // These are placeholder values: ~1M TON and ~5.2M USDT based on typical pool ratios
    return {
      reserveIn: 1000000,
      reserveOut: 5200000,
    };
  }

  /**
   * Fallback rates if API fails
   */
  private getFallbackRate(fromToken: string, toToken: string): number {
    const rates: Record<string, number> = {
      'TON-USDT': 5.2,
      'USDT-TON': 0.192,
    };

    return rates[`${fromToken}-${toToken}`] || 1;
  }

  /**
   * Get supported tokens
   */
  getSupportedTokens() {
    return [
      {
        symbol: 'TON',
        name: 'Toncoin',
        address: TOKENS.TON,
        decimals: 9,
        icon: '💎',
      },
      {
        symbol: 'USDT',
        name: 'Tether USD',
        address: TOKENS.USDT,
        decimals: 6,
        icon: '💵',
      },
    ];
  }
}

export const dedustService = new DedustService();
