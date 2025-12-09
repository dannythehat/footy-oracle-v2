"use strict";
/**
 * 24-Hour Prediction Cache
 *
 * Caches Golden Bets and Value Bets for 24 hours to prevent
 * unnecessary ML API calls and ensure consistent predictions
 * throughout the day.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictionCache = void 0;
var PredictionCache = /** @class */ (function () {
    function PredictionCache() {
        this.goldenBetsCache = null;
        this.valueBetsCache = null;
        this.CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    }
    /**
     * Get cached Golden Bets if still valid
     */
    PredictionCache.prototype.getGoldenBets = function () {
        if (!this.goldenBetsCache) {
            return null;
        }
        var now = Date.now();
        if (now > this.goldenBetsCache.expiresAt) {
            console.log('🕐 Golden Bets cache expired');
            this.goldenBetsCache = null;
            return null;
        }
        var age = Math.floor((now - this.goldenBetsCache.timestamp) / 1000 / 60);
        console.log("\u2705 Returning cached Golden Bets (".concat(age, " minutes old)"));
        return this.goldenBetsCache.data;
    };
    /**
     * Set Golden Bets cache
     */
    PredictionCache.prototype.setGoldenBets = function (data) {
        var now = Date.now();
        this.goldenBetsCache = {
            data: data,
            timestamp: now,
            expiresAt: now + this.CACHE_DURATION
        };
        console.log("\uD83D\uDCBE Cached ".concat(data.length, " Golden Bets (expires in 24 hours)"));
    };
    /**
     * Get cached Value Bets if still valid
     */
    PredictionCache.prototype.getValueBets = function () {
        if (!this.valueBetsCache) {
            return null;
        }
        var now = Date.now();
        if (now > this.valueBetsCache.expiresAt) {
            console.log('🕐 Value Bets cache expired');
            this.valueBetsCache = null;
            return null;
        }
        var age = Math.floor((now - this.valueBetsCache.timestamp) / 1000 / 60);
        console.log("\u2705 Returning cached Value Bets (".concat(age, " minutes old)"));
        return this.valueBetsCache.data;
    };
    /**
     * Set Value Bets cache
     */
    PredictionCache.prototype.setValueBets = function (data) {
        var now = Date.now();
        this.valueBetsCache = {
            data: data,
            timestamp: now,
            expiresAt: now + this.CACHE_DURATION
        };
        console.log("\uD83D\uDCBE Cached ".concat(data.length, " Value Bets (expires in 24 hours)"));
    };
    /**
     * Clear all caches (useful for manual refresh)
     */
    PredictionCache.prototype.clearAll = function () {
        this.goldenBetsCache = null;
        this.valueBetsCache = null;
        console.log('🗑️ All prediction caches cleared');
    };
    /**
     * Get cache status for debugging
     */
    PredictionCache.prototype.getStatus = function () {
        var now = Date.now();
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
    };
    return PredictionCache;
}());
// Export singleton instance
exports.predictionCache = new PredictionCache();
