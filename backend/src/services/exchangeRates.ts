import { supabase } from '../lib/supabase';

export class ExchangeRateService {
  /**
   * Get current exchange rate
   */
  async getRate(from: string, to: string): Promise<number> {
    const { data } = await supabase
      .from('ExchangeRates')
      .select('rate')
      .eq('fromCurrency', from)
      .eq('toCurrency', to)
      .single();

    return data?.rate || 0;
  }

  /**
   * Update exchange rate from DeDust DEX
   */
  async updateFromDeDust() {
    try {
      // Fetch TON/USDT rate from DeDust API
      const response = await fetch('https://api.dedust.io/v2/pools');
      
      if (!response.ok) {
        throw new Error(`DeDust API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      // Validate response structure
      if (!Array.isArray(data)) {
        console.error('Invalid DeDust API response: expected array');
        return;
      }
      
      const pools = data as any[];
      
      // Find TON/USDT pool
      const tonUsdtPool = pools.find((p: any) => 
        p && 
        Array.isArray(p.assets) &&
        p.assets.includes('TON') && 
        p.assets.includes('USDT') &&
        typeof p.price !== 'undefined'
      );

      if (tonUsdtPool && typeof tonUsdtPool.price !== 'undefined') {
        const rate = parseFloat(tonUsdtPool.price);
        
        if (isNaN(rate) || rate <= 0) {
          console.error('Invalid exchange rate from DeDust:', tonUsdtPool.price);
          return;
        }
        
        // Update TON → USDT
        await supabase
          .from('ExchangeRates')
          .upsert({
            fromCurrency: 'TON',
            toCurrency: 'USDT',
            rate: rate,
            source: 'dedust',
            updatedAt: new Date().toISOString(),
          }, {
            onConflict: 'fromCurrency,toCurrency'
          });

        // Update USDT → TON
        await supabase
          .from('ExchangeRates')
          .upsert({
            fromCurrency: 'USDT',
            toCurrency: 'TON',
            rate: 1 / rate,
            source: 'dedust',
            updatedAt: new Date().toISOString(),
          }, {
            onConflict: 'fromCurrency,toCurrency'
          });

        console.log(`✅ Exchange rate updated: 1 TON = ${rate} USDT`);
      }
    } catch (error) {
      console.error('Failed to update exchange rates:', error);
    }
  }

  /**
   * Convert amount between currencies
   */
  async convert(amount: number, from: string, to: string): Promise<number> {
    if (from === to) return amount;
    
    const rate = await this.getRate(from, to);
    return amount * rate;
  }

  /**
   * Start automatic updates (every 5 minutes)
   */
  startAutoUpdate() {
    // Update immediately
    this.updateFromDeDust();
    
    // Then every 5 minutes
    setInterval(() => {
      this.updateFromDeDust();
    }, 5 * 60 * 1000);
    
    console.log('✅ Exchange rate auto-update started');
  }
}

export const exchangeRateService = new ExchangeRateService();
