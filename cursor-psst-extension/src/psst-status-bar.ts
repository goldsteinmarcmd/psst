import * as vscode from 'vscode';
import { CompressionStats } from './psst-compressor';

export class PSSTStatusBar {
    private statusBarItem: vscode.StatusBarItem;
    private currentStats: CompressionStats | null = null;

    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.name = 'PSST Status';
        this.statusBarItem.tooltip = 'PSST - Prompt Symbol Standard Technology';
    }

    initialize(): void {
        this.statusBarItem.text = '$(symbol-color) PSST';
        this.statusBarItem.tooltip = 'PSST: Ready for compression';
        this.statusBarItem.show();
    }

    updateStats(stats: CompressionStats): void {
        this.currentStats = stats;
        
        const compressionText = `${stats.compressionRatio}%`;
        const tokenText = `${stats.originalTokens}→${stats.compressedTokens}`;
        
        this.statusBarItem.text = `$(symbol-color) PSST: ${compressionText} (${tokenText})`;
        this.statusBarItem.tooltip = `PSST Compression Stats:\n` +
            `Original: ${stats.originalTokens} tokens\n` +
            `Compressed: ${stats.compressedTokens} tokens\n` +
            `Reduction: ${stats.compressionRatio}%\n` +
            `Characters: ${stats.originalLength} → ${stats.compressedLength}`;
        
        this.statusBarItem.show();
    }

    getCurrentStats(): CompressionStats | null {
        return this.currentStats;
    }

    showLoading(): void {
        this.statusBarItem.text = '$(loading~spin) PSST: Compressing...';
        this.statusBarItem.tooltip = 'PSST: Processing compression...';
        this.statusBarItem.show();
    }

    showError(): void {
        this.statusBarItem.text = '$(error) PSST: Error';
        this.statusBarItem.tooltip = 'PSST: Compression failed';
        this.statusBarItem.show();
        
        // Reset after 3 seconds
        setTimeout(() => {
            this.reset();
        }, 3000);
    }

    reset(): void {
        this.currentStats = null;
        this.statusBarItem.text = '$(symbol-color) PSST';
        this.statusBarItem.tooltip = 'PSST: Ready for compression';
        this.statusBarItem.show();
    }

    hide(): void {
        this.statusBarItem.hide();
    }

    show(): void {
        this.statusBarItem.show();
    }

    dispose(): void {
        this.statusBarItem.dispose();
    }
} 