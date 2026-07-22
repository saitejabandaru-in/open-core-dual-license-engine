/**
 * Enterprise Audit Logger Plugin
 * Provides compliance-ready structured JSON log exports for enterprise clients.
 */

export interface AuditLogEntry {
  timestamp: Date;
  actor: string;
  action: string;
  resource: string;
  metadata?: Record<string, any>;
}

export class EnterpriseAuditLogger {
  private logs: AuditLogEntry[] = [];

  constructor() {
    console.log('[Enterprise] Audit Logger plugin initialized.');
  }

  public logEvent(actor: string, action: string, resource: string, metadata?: Record<string, any>): void {
    const entry: AuditLogEntry = {
      timestamp: new Date(),
      actor,
      action,
      resource,
      metadata,
    };
    this.logs.push(entry);
    console.log(`[AUDIT LOG] [${entry.timestamp.toISOString()}] User:${actor} Action:${action} Resource:${resource}`);
  }

  public exportLogs(): AuditLogEntry[] {
    return [...this.logs];
  }
}
