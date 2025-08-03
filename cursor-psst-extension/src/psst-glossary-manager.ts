import * as vscode from 'vscode';
import * as path from 'path';

export class PSSTGlossaryManager {
    private config: vscode.WorkspaceConfiguration;

    constructor() {
        this.config = vscode.workspace.getConfiguration('psst');
    }

    async showGlossary(): Promise<void> {
        try {
            const glossaryPath = this.config.get('glossaryPath', '') || 'ultimate_glossary.json';
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            
            let glossaryFile: vscode.Uri;
            if (workspaceFolder) {
                glossaryFile = vscode.Uri.joinPath(workspaceFolder.uri, glossaryPath);
            } else {
                // Fallback to current directory
                glossaryFile = vscode.Uri.file(glossaryPath);
            }

            try {
                const data = await vscode.workspace.fs.readFile(glossaryFile);
                const glossary = JSON.parse(data.toString());
                
                // Create a formatted view of the glossary
                const formattedGlossary = this.formatGlossaryForDisplay(glossary);
                
                const doc = await vscode.workspace.openTextDocument({
                    content: formattedGlossary,
                    language: 'json'
                });
                
                await vscode.window.showTextDocument(doc, vscode.ViewColumn.One);
                
                vscode.window.showInformationMessage(`PSST: Glossary loaded with ${Object.keys(glossary.glossary || {}).length} symbols`);
            } catch (error) {
                vscode.window.showErrorMessage(`PSST: Failed to load glossary - ${error}`);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`PSST: Glossary operation failed - ${error}`);
        }
    }

    async loadCustomGlossary(): Promise<void> {
        const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            openLabel: 'Select Glossary File',
            filters: {
                'JSON files': ['json'],
                'All files': ['*']
            }
        };

        const fileUri = await vscode.window.showOpenDialog(options);
        
        if (fileUri && fileUri.length > 0) {
            try {
                const data = await vscode.workspace.fs.readFile(fileUri[0]);
                const glossary = JSON.parse(data.toString());
                
                // Validate glossary format
                if (!glossary.glossary && !glossary.symbols) {
                    throw new Error('Invalid glossary format');
                }
                
                // Update configuration
                await this.config.update('glossaryPath', fileUri[0].fsPath, vscode.ConfigurationTarget.Workspace);
                
                vscode.window.showInformationMessage(`PSST: Custom glossary loaded from ${path.basename(fileUri[0].fsPath)}`);
            } catch (error) {
                vscode.window.showErrorMessage(`PSST: Failed to load custom glossary - ${error}`);
            }
        }
    }

    async exportGlossary(): Promise<void> {
        const options: vscode.SaveDialogOptions = {
            saveLabel: 'Export Glossary',
            filters: {
                'JSON files': ['json'],
                'All files': ['*']
            }
        };

        const fileUri = await vscode.window.showSaveDialog(options);
        
        if (fileUri) {
            try {
                const glossaryPath = this.config.get('glossaryPath', '') || 'ultimate_glossary.json';
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
                
                let sourceFile: vscode.Uri;
                if (workspaceFolder) {
                    sourceFile = vscode.Uri.joinPath(workspaceFolder.uri, glossaryPath);
                } else {
                    sourceFile = vscode.Uri.file(glossaryPath);
                }

                const data = await vscode.workspace.fs.readFile(sourceFile);
                await vscode.workspace.fs.writeFile(fileUri, data);
                
                vscode.window.showInformationMessage(`PSST: Glossary exported to ${path.basename(fileUri.fsPath)}`);
            } catch (error) {
                vscode.window.showErrorMessage(`PSST: Failed to export glossary - ${error}`);
            }
        }
    }

    async resetToDefault(): Promise<void> {
        const result = await vscode.window.showWarningMessage(
            'PSST: Reset to default glossary?',
            { modal: true },
            'Yes',
            'No'
        );

        if (result === 'Yes') {
            try {
                // Reset glossary path to default
                await this.config.update('glossaryPath', '', vscode.ConfigurationTarget.Workspace);
                
                vscode.window.showInformationMessage('PSST: Reset to default glossary');
            } catch (error) {
                vscode.window.showErrorMessage(`PSST: Failed to reset glossary - ${error}`);
            }
        }
    }

    private formatGlossaryForDisplay(glossary: any): string {
        const symbols = glossary.glossary || glossary.symbols || {};
        
        const formatted = {
            metadata: {
                name: glossary.name || 'PSST Glossary',
                version: glossary.version || '1.0.0',
                description: glossary.description || 'PSST Symbol Standard Technology Glossary',
                symbolCount: Object.keys(symbols).length
            },
            symbols: symbols
        };

        return JSON.stringify(formatted, null, 2);
    }

    async validateGlossary(glossaryPath: string): Promise<boolean> {
        try {
            const data = await vscode.workspace.fs.readFile(vscode.Uri.file(glossaryPath));
            const glossary = JSON.parse(data.toString());
            
            return !!(glossary.glossary || glossary.symbols);
        } catch (error) {
            return false;
        }
    }

    getGlossaryInfo(): any {
        const glossaryPath = this.config.get('glossaryPath', '');
        return {
            path: glossaryPath || 'Default (ultimate_glossary.json)',
            custom: !!glossaryPath
        };
    }
} 