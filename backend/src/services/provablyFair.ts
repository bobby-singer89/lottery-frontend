import crypto from 'crypto';

export class ProvablyFairService {
  /**
   * Generate random seed (32 bytes)
   */
  generateSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate SHA256 hash of seed
   */
  hashSeed(seed: string): string {
    return crypto.createHash('sha256').update(seed).digest('hex');
  }

  /**
   * Generate winning numbers from seed
   */
  generateWinningNumbers(seed: string, count: number, max: number): number[] {
    const numbers: number[] = [];
    let hash = Buffer.from(seed, 'hex');

    while (numbers.length < count) {
      // Hash the current hash to get next random value
      hash = crypto.createHash('sha256').update(hash).digest();
      
      // Convert first 4 bytes to number
      const num = (hash.readUInt32BE(0) % max) + 1;
      
      // Only add if not duplicate
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }

    return numbers.sort((a, b) => a - b);
  }

  /**
   * Verify that seed matches hash
   */
  verifySeedHash(seed: string, seedHash: string): boolean {
    return this.hashSeed(seed) === seedHash;
  }

  /**
   * Verify that numbers were generated correctly from seed
   */
  verifyNumbers(seed: string, numbers: number[], count: number, max: number): boolean {
    const generatedNumbers = this.generateWinningNumbers(seed, count, max);
    return JSON.stringify(generatedNumbers) === JSON.stringify(numbers);
  }
}

export const provablyFair = new ProvablyFairService();
