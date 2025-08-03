import * as vscode from 'vscode';
import * as crypto from 'crypto';

export class PSSTSessionManager {
    private currentSession: string;
    private sessionData: Map<string, any> = new Map();
    private config: vscode.WorkspaceConfiguration;

    constructor() {
        this.config = vscode.workspace.getConfiguration('psst');
        this.currentSession = this.generateSessionId();
    }

    initialize(): void {
        if (this.config.get('sessionManagement', true)) {
            console.log(`PSST: Session initialized - ${this.currentSession}`);
        }
    }

    private generateSessionId(): string {
        return crypto.randomBytes(8).toString('hex');
    }

    getCurrentSession(): string {
        return this.currentSession;
    }

    createNewSession(): string {
        this.currentSession = this.generateSessionId();
        console.log(`PSST: New session created - ${this.currentSession}`);
        return this.currentSession;
    }

    setSessionData(key: string, value: any): void {
        this.sessionData.set(key, value);
    }

    getSessionData(key: string): any {
        return this.sessionData.get(key);
    }

    clearSessionData(): void {
        this.sessionData.clear();
    }

    isSessionManagementEnabled(): boolean {
        return this.config.get('sessionManagement', true);
    }

    async saveSessionToFile(): Promise<void> {
        const sessionData = {
            sessionId: this.currentSession,
            timestamp: new Date().toISOString(),
            data: Object.fromEntries(this.sessionData)
        };

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            const sessionFile = vscode.Uri.joinPath(workspaceFolder.uri, '.psst-session.json');
            
            try {
                await vscode.workspace.fs.writeFile(
                    sessionFile,
                    Buffer.from(JSON.stringify(sessionData, null, 2))
                );
            } catch (error) {
                console.error('PSST: Failed to save session data', error);
            }
        }
    }

    async loadSessionFromFile(): Promise<boolean> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            const sessionFile = vscode.Uri.joinPath(workspaceFolder.uri, '.psst-session.json');
            
            try {
                const data = await vscode.workspace.fs.readFile(sessionFile);
                const sessionData = JSON.parse(data.toString());
                
                this.currentSession = sessionData.sessionId;
                this.sessionData = new Map(Object.entries(sessionData.data));
                
                console.log(`PSST: Session loaded - ${this.currentSession}`);
                return true;
            } catch (error) {
                // Session file doesn't exist or is invalid, create new session
                console.log('PSST: No existing session found, creating new session');
                return false;
            }
        }
        return false;
    }

    getSessionInfo(): any {
        return {
            sessionId: this.currentSession,
            dataSize: this.sessionData.size,
            managementEnabled: this.isSessionManagementEnabled()
        };
    }
} 