import { CompressionStats } from './psst-compressor';

export class PSSTStats {
    private statsHistory: CompressionStats[] = [];
    private maxHistorySize = 100;

    calculateStats(original: string, compressed: string): CompressionStats {
        const originalTokens = this.estimateTokens(original);
        const compressedTokens = this.estimateTokens(compressed);
        const compressionRatio = ((originalTokens - compressedTokens) / originalTokens) * 100;

        const stats: CompressionStats = {
            originalTokens,
            compressedTokens,
            compressionRatio: Math.round(compressionRatio * 100) / 100,
            originalLength: original.length,
            compressedLength: compressed.length
        };

        this.addToHistory(stats);
        return stats;
    }

    private estimateTokens(text: string): number {
        // Simple estimation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }

    private addToHistory(stats: CompressionStats): void {
        this.statsHistory.push(stats);
        
        // Keep only the last N entries
        if (this.statsHistory.length > this.maxHistorySize) {
            this.statsHistory = this.statsHistory.slice(-this.maxHistorySize);
        }
    }

    getAverageCompressionRatio(): number {
        if (this.statsHistory.length === 0) {
            return 0;
        }

        const totalRatio = this.statsHistory.reduce((sum, stats) => sum + stats.compressionRatio, 0);
        return Math.round((totalRatio / this.statsHistory.length) * 100) / 100;
    }

    getBestCompressionRatio(): number {
        if (this.statsHistory.length === 0) {
            return 0;
        }

        return Math.max(...this.statsHistory.map(stats => stats.compressionRatio));
    }

    getTotalTokensSaved(): number {
        return this.statsHistory.reduce((total, stats) => total + (stats.originalTokens - stats.compressedTokens), 0);
    }

    getStatsHistory(): CompressionStats[] {
        return [...this.statsHistory];
    }

    clearHistory(): void {
        this.statsHistory = [];
    }

    getRecentStats(count: number = 10): CompressionStats[] {
        return this.statsHistory.slice(-count);
    }
} 