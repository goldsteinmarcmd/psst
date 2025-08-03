import * as vscode from 'vscode';
import * as child_process from 'child_process';

export interface CompressionStats {
    originalTokens: number;
    compressedTokens: number;
    compressionRatio: number;
    originalLength: number;
    compressedLength: number;
}

export class PSSTCompressor {
    private config: vscode.WorkspaceConfiguration;

    constructor() {
        this.config = vscode.workspace.getConfiguration('psst');
    }

    async compress(text: string): Promise<string> {
        const mode = this.config.get('compressionMode', 'ultimate');
        const command = this.getPSSTCommand(mode, 'compress');
        
        try {
            const result = await this.executePSSTCommand(command, text);
            return result.trim();
        } catch (error) {
            throw new Error(`PSST compression failed: ${error}`);
        }
    }

    async expand(text: string): Promise<string> {
        const mode = this.config.get('compressionMode', 'ultimate');
        const command = this.getPSSTCommand(mode, 'expand');
        
        try {
            const result = await this.executePSSTCommand(command, text);
            return result.trim();
        } catch (error) {
            throw new Error(`PSST expansion failed: ${error}`);
        }
    }

    private getPSSTCommand(mode: string, operation: 'compress' | 'expand'): string {
        const commands = {
            ultimate: 'psst-ultimate',
            enhanced: 'psst-enhanced', 
            dynamic: 'psst-dynamic',
            openai: 'psst-openai'
        };

        const baseCommand = commands[mode as keyof typeof commands] || 'psst-ultimate';
        
        if (operation === 'compress') {
            return `${baseCommand} compress`;
        } else {
            return `${baseCommand} expand`;
        }
    }

    private executePSSTCommand(command: string, input: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const process = child_process.spawn(command, [], {
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });

            let stdout = '';
            let stderr = '';

            process.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            process.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout);
                } else {
                    reject(new Error(`PSST command failed with code ${code}: ${stderr}`));
                }
            });

            process.on('error', (error) => {
                reject(new Error(`Failed to execute PSST command: ${error.message}`));
            });

            // Send input to the process
            process.stdin.write(input);
            process.stdin.end();
        });
    }

    async getCompressionStats(original: string, compressed: string): Promise<CompressionStats> {
        const originalTokens = this.estimateTokens(original);
        const compressedTokens = this.estimateTokens(compressed);
        const compressionRatio = ((originalTokens - compressedTokens) / originalTokens) * 100;

        return {
            originalTokens,
            compressedTokens,
            compressionRatio: Math.round(compressionRatio * 100) / 100,
            originalLength: original.length,
            compressedLength: compressed.length
        };
    }

    private estimateTokens(text: string): number {
        // Simple estimation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }

    async validatePSSTInstallation(): Promise<boolean> {
        try {
            const result = await this.executePSSTCommand('psst-ultimate --version', '');
            return result.includes('PSST') || result.includes('psst');
        } catch (error) {
            return false;
        }
    }
} 