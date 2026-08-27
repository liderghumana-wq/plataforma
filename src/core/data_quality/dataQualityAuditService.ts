/**
 * PROMPT 29 — DATA QUALITY AUDIT SERVICE (Trazabilidad y Correcciones)
 * Manages immutable correction records (DataQualityAudit) for audited corrections
 * of data fields (originalValue, correctedValue, reason, correctedBy, correctedAt).
 */

import { DataQualityAudit, VariableDataStatus } from './types';

export class DataQualityAuditService {
  private static auditLogs: DataQualityAudit[] = [
    {
      id: 'AUD-001',
      companyId: 'empresa-a',
      datasetId: 'DS-EXCEL-2026-01',
      rowNumber: 12,
      fieldKey: 'estaturaMts',
      originalValue: 175,
      normalizedValue: 1.75,
      status: 'VALID',
      reason: 'Estatura ingresada en cm (175) normalizada automáticamente a metros (1.75m).',
      correctedBy: 'SISTEMA_NORMALIZACION',
      correctedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'AUD-002',
      companyId: 'empresa-a',
      datasetId: 'DS-EXCEL-2026-01',
      rowNumber: 24,
      fieldKey: 'pesoKg',
      originalValue: 250,
      normalizedValue: 250,
      status: 'OUT_OF_RANGE',
      reason: 'Peso marcado fuera de rango (250 kg) preservado para revisión por SST sin eliminación sintética.',
      correctedBy: 'SST_AUDITOR',
      correctedAt: new Date(Date.now() - 1800000).toISOString()
    }
  ];

  public static getAuditLogs(companyId?: string): DataQualityAudit[] {
    if (!companyId) return this.auditLogs;
    return this.auditLogs.filter(l => l.companyId === companyId);
  }

  public static recordCorrection(params: {
    companyId: string;
    datasetId: string;
    rowNumber: number;
    fieldKey: string;
    originalValue: any;
    normalizedValue: any;
    status: VariableDataStatus;
    reason: string;
    correctedBy: string;
  }): DataQualityAudit {
    const newLog: DataQualityAudit = {
      id: `AUD-${Date.now().toString().slice(-6)}`,
      companyId: params.companyId,
      datasetId: params.datasetId,
      rowNumber: params.rowNumber,
      fieldKey: params.fieldKey,
      originalValue: params.originalValue,
      normalizedValue: params.normalizedValue,
      status: params.status,
      reason: params.reason,
      correctedBy: params.correctedBy,
      correctedAt: new Date().toISOString()
    };

    this.auditLogs.unshift(newLog);
    return newLog;
  }
}
