/**
 * Audit Log Service for SG-SST Platform
 * Implements DATA_AUDIT_LOG according to Prompt 19 (Sec. 20 & 21)
 */

import { DataAuditLogEntry, SourceType } from './types';

const AUDIT_STORAGE_KEY = 'sg_sst_data_audit_log_v1';

export class AuditLoggerService {
  private static logs: DataAuditLogEntry[] = [];

  static {
    this.loadFromStorage();
  }

  private static loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch {
      this.logs = [];
    }
  }

  private static saveToStorage(): void {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(this.logs.slice(0, 1000)));
    } catch {
      // Storage limit fallback
    }
  }

  /**
   * Registers a new audit entry into DATA_AUDIT_LOG
   */
  public static logAction(entry: Omit<DataAuditLogEntry, 'id' | 'timestamp'>): DataAuditLogEntry {
    const fullEntry: DataAuditLogEntry = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };

    this.logs.unshift(fullEntry);
    this.saveToStorage();
    return fullEntry;
  }

  /**
   * Logs a data modification (Sec. 21)
   */
  public static logDataModification(params: {
    userId: string;
    companyId: string;
    recordId: string;
    field: string;
    oldValue: any;
    newValue: any;
    reason: string;
    source?: SourceType;
  }): DataAuditLogEntry {
    return this.logAction({
      userId: params.userId,
      companyId: params.companyId,
      action: 'UPDATE',
      source: params.source || 'ENCUESTA',
      recordId: params.recordId,
      field: params.field,
      oldValue: params.oldValue,
      newValue: params.newValue,
      reason: params.reason
    });
  }

  /**
   * Retrieves audit logs filtered by company ID
   */
  public static getAuditLogs(companyId?: string): DataAuditLogEntry[] {
    if (!companyId) return [...this.logs];
    return this.logs.filter(log => log.companyId === companyId || log.companyId === 'GLOBAL');
  }

  /**
   * Clears audit logs for testing purposes
   */
  public static clearLogs(): void {
    this.logs = [];
    localStorage.removeItem(AUDIT_STORAGE_KEY);
  }
}
