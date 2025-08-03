import * as vscode from 'vscode';
import { PSSTCompressor } from './psst-compressor';
import { PSSTStats } from './psst-stats';
import { PSSTSessionManager } from './psst-session-manager';
import { PSSTStatusBar } from './psst-status-bar';
import { PSSTGlossaryManager } from './psst-glossary-manager';

export function activate(context: vscode.ExtensionContext) {
    console.log('PSST Extension is now active!');

    // Initialize PSST components
    const compressor = new PSSTCompressor();
    const stats = new PSSTStats();
    const sessionManager = new PSSTSessionManager();
    const statusBar = new PSSTStatusBar();
    const glossaryManager = new PSSTGlossaryManager();

    // Register commands
    const compressSelection = vscode.commands.registerCommand('psst.compressSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('No text selected');
            return;
        }

        const text = editor.document.getText(selection);
        try {
            statusBar.showLoading();
            const compressed = await compressor.compress(text);
            const compressionStats = stats.calculateStats(text, compressed);
            
            await editor.edit(editBuilder => {
                editBuilder.replace(selection, compressed);
            });

            statusBar.updateStats(compressionStats);
            
            if (vscode.workspace.getConfiguration('psst').get('showTokenStats')) {
                vscode.window.showInformationMessage(
                    `PSST: Compressed ${compressionStats.originalTokens} → ${compressionStats.compressedTokens} tokens (${compressionStats.compressionRatio}% reduction)`
                );
            }
        } catch (error) {
            statusBar.showError();
            vscode.window.showErrorMessage(`PSST Compression failed: ${error}`);
        }
    });

    const expandSelection = vscode.commands.registerCommand('psst.expandSelection', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        const selection = editor.selection;
        if (selection.isEmpty) {
            vscode.window.showErrorMessage('No text selected');
            return;
        }

        const text = editor.document.getText(selection);
        try {
            statusBar.showLoading();
            const expanded = await compressor.expand(text);
            
            await editor.edit(editBuilder => {
                editBuilder.replace(selection, expanded);
            });

            vscode.window.showInformationMessage('PSST: Text expanded successfully');
        } catch (error) {
            statusBar.showError();
            vscode.window.showErrorMessage(`PSST Expansion failed: ${error}`);
        }
    });

    const optimizePrompt = vscode.commands.registerCommand('psst.optimizePrompt', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        // Get the entire document or selected text
        const selection = editor.selection;
        const text = selection.isEmpty 
            ? editor.document.getText() 
            : editor.document.getText(selection);

        try {
            statusBar.showLoading();
            const compressed = await compressor.compress(text);
            const compressionStats = stats.calculateStats(text, compressed);
            
            // Create a new document with the optimized prompt
            const doc = await vscode.workspace.openTextDocument({
                content: compressed,
                language: 'text'
            });
            
            await vscode.window.showTextDocument(doc, vscode.ViewColumn.Beside);
            
            statusBar.updateStats(compressionStats);
            
            vscode.window.showInformationMessage(
                `PSST: Optimized prompt - ${compressionStats.compressionRatio}% token reduction`
            );
        } catch (error) {
            statusBar.showError();
            vscode.window.showErrorMessage(`PSST Optimization failed: ${error}`);
        }
    });

    const showStats = vscode.commands.registerCommand('psst.showStats', () => {
        const currentStats = statusBar.getCurrentStats();
        if (currentStats) {
            const message = `PSST Stats:\n` +
                `Original: ${currentStats.originalTokens} tokens\n` +
                `Compressed: ${currentStats.compressedTokens} tokens\n` +
                `Reduction: ${currentStats.compressionRatio}%\n` +
                `Session: ${sessionManager.getCurrentSession()}`;
            
            vscode.window.showInformationMessage(message);
        } else {
            vscode.window.showInformationMessage('No PSST stats available');
        }
    });

    const manageGlossary = vscode.commands.registerCommand('psst.manageGlossary', async () => {
        const items = [
            { label: 'View Current Glossary', description: 'Show active PSST symbols' },
            { label: 'Load Custom Glossary', description: 'Import custom glossary file' },
            { label: 'Export Glossary', description: 'Save current glossary' },
            { label: 'Reset to Default', description: 'Restore default PSST glossary' }
        ];

        const selection = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select glossary action'
        });

        if (selection) {
            switch (selection.label) {
                case 'View Current Glossary':
                    await glossaryManager.showGlossary();
                    break;
                case 'Load Custom Glossary':
                    await glossaryManager.loadCustomGlossary();
                    break;
                case 'Export Glossary':
                    await glossaryManager.exportGlossary();
                    break;
                case 'Reset to Default':
                    await glossaryManager.resetToDefault();
                    break;
            }
        }
    });

    // Register all commands
    context.subscriptions.push(
        compressSelection,
        expandSelection,
        optimizePrompt,
        showStats,
        manageGlossary
    );

    // Initialize status bar
    statusBar.initialize();

    // Set up session management
    sessionManager.initialize();

    // Auto-optimize chat integration (if enabled)
    const config = vscode.workspace.getConfiguration('psst');
    if (config.get('autoOptimizeChat')) {
        console.log('PSST: Auto-optimize chat enabled');
    }
}

export function deactivate() {
    console.log('PSST Extension deactivated');
} 