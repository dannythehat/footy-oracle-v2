/**
 * 24-Hour Prediction Cache
 * 
 * Caches Golden Bets and Value Bets for 24 hours to prevent
 * unnecessary ML API calls and ensure consistent predictions
 * throughout the day.
 */

import { GoldenBet, ValueBet } from './mlService.js';

interface CacheEntry<T> {
  data: T[];
  timestamp: number;
  expiresAt: number;
}

class PredictionCache {
  private goldenBetsCache: CacheEntry<GoldenBet> | null = null;
  private valueBetsCache: CacheEntry<ValueBet> | null = null;
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Get cached Golden Bets if still valid
   */
  getGoldenBets(): GoldenBet[] | null {
    if (!this.goldenBetsCache) {
      return null;
    }

    const now = Date.now();
    if (now > this.goldenBetsCache.expiresAt) {
      console.log('🕐 Golden Bets cache expired');
      this.goldenBetsCache = null;
      return null;
    }

    const age = Math.floor((now - this.goldenBetsCache.timestamp) / 1000 / 60);
    console.log(`✅ Returning cached Golden Bets (${age} minutes old)`);
    return this.goldenBetsCache.data;
  }

  /**
   * Set Golden Bets cache
   */
  setGoldenBets(data: GoldenBet[]): void {
    const now = Date.now();
    this.goldenBetsCache = {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    };
    console.log(`💾 Cached ${data.length} Golden Bets (expires in 24 hours)`);
  }

  /**
   * Get cached Value Bets if still valid
   */
  getValueBets(): ValueBet[] | null {
    if (!this.valueBetsCache) {
      return null;
    }

    const now = Date.now();
    if (now > this.valueBetsCache.expiresAt) {
      console.log('🕐 Value Bets cache expired');
      this.valueBetsCache = null;
      return null;
    }

    const age = Math.floor((now - this.valueBetsCache.timestamp) / 1000 / 60);
    console.log(`✅ Returning cached Value Bets (${age} minutes old)`);
    return this.valueBetsCache.data;
  }

  /**
   * Set Value Bets cache
   */
  setValueBets(data: ValueBet[]): void {
    const now = Date.now();
    this.valueBetsCache = {
      data,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION
    };
    console.log(`💾 Cached ${data.length} Value Bets (expires in 24 hours)`);
  }

  /**
   * Clear all caches (useful for manual refresh)
   */
  clearAll(): void {
    this.goldenBetsCache = null;
    this.valueBetsCache = null;
    console.log('🗑️ All prediction caches cleared');
  }

  /**
   * Get cache status for debugging
   */
  getStatus() {
    const now = Date.now();
    
    return {
      goldenBets: this.goldenBetsCache ? {
        count: this.goldenBetsCache.data.length,
        ageMinutes: Math.floor((now - this.goldenBetsCache.timestamp) / 1000 / 60),
        expiresInMinutes: Math.floor((this.goldenBetsCache.expiresAt - now) / 1000 / 60)
      } : null,
      valueBets: this.valueBetsCache ? {
        count: this.valueBetsCache.data.length,
        ageMinutes: Math.floor((now - this.valueBetsCache.timestamp) / 1000 / 60),
        expiresInMinutes: Math.floor((this.valueBetsCache.expiresAt - now) / 1000 / 60)
      } : null
    };
  }
}

// Export singleton instance
export const predictionCache = new PredictionCache();
