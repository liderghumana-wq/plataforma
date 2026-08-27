/**
 * PROMPT 29 — DATA QUALITY ENGINE TYPES
 * Centralized type definitions for Data Quality Engine, Variable States,
 * Module Completeness, Diagnostics, Audit Trail, and Reliable Metrics.
 */

// 1. Exact 10 Variable Data States (Section 2)
export type VariableDataStatus =
  | 'VALID'
  | 'MISSING'
  | 'INVALID'
  | 'OUT_OF_RANGE'
  | 'NOT_APPLICABLE'
  | 'PREFER_NOT_TO_ANSWER'
  | 'NOT_PROVIDED'
  | 'COLUMN_NOT_FOUND'
  | 'NO_DATA'
  | 'UNMAPPED'
  | 'INCONSISTENT';

// 2. The 8 Mandatory Business Modules (Section 5)
export type BusinessModule =
  | 'Sociodemográfico'
  | 'Laboral'
  | 'Familiar'
  | 'Vivienda'
  | 'Salud'
  | 'Hábitos'
  | 'Osteomuscular'
  | 'Bienestar';

export const ALL_BUSINESS_MODULES: BusinessModule[] = [
  'Sociodemográfico',
  'Laboral',
  'Familiar',
  'Vivienda',
  'Salud',
  'Hábitos',
  'Osteomuscular',
  'Bienestar'
];

// 3. Completeness Alert Levels
export type AlertLevelP29 = 'GREEN' | 'YELLOW' | 'RED';

export interface CompletenessThresholds {
  greenMin: number; // e.g. 90
  yellowMin: number; // e.g. 70
  // < yellowMin is RED
}

// 4. Field Validation Detail for a single cell/variable in a row
export interface FieldValidationRecord {
  rowNumber: number;
  recordId?: string;
  fieldKey: string;
  variableName: string;
  moduleName: BusinessModule;
  originalValue: any;
  normalizedValue: any;
  status: VariableDataStatus;
  isCritical: boolean;
  isOther: boolean;
  otherValue?: string;
  reason?: string;
  correctedBy?: string;
  correctedAt?: string;
}

// 5. Module Quality Summary Score
export interface ModuleQualityScore {
  moduleName: BusinessModule;
  totalPossibleFields: number;
  totalFilledFields: number;
  totalValidFields: number;
  completenessPct: number;
  validityPct: number;
  alertLevel: AlertLevelP29;
  criticalMissingCount: number;
}

// 6. Data Quality Audit Log (Section 24)
export interface DataQualityAudit {
  id: string;
  companyId: string;
  datasetId: string;
  rowNumber: number;
  fieldKey: string;
  originalValue: any;
  normalizedValue: any;
  status: VariableDataStatus;
  reason: string;
  correctedBy: string;
  correctedAt: string;
}

// 7. Duplicate Entry Record
export interface DuplicateRecordGroup {
  id: string;
  identifierKey: string; // e.g. "Cedula 10203040"
  rows: number[];
  recordsCount: number;
  duplicateField: string;
}

// 8. Excel Pre-Import Quality Overview (Section 20)
export interface ExcelPreImportQuality {
  totalRecords: number;
  totalColumns: number;
  recognizedColumnsCount: number;
  unrecognizedColumnsCount: number;
  missingCriticalFields: string[];
  duplicateRecordsCount: number;
  invalidValuesCount: number;
  outOfRangeValuesCount: number;
  emptyCellsCount: number;
  completenessPct: number;
  columnDetails: Array<{
    columnName: string;
    fieldKey?: string;
    isRecognized: boolean;
    isCritical: boolean;
    sampleValues: any[];
  }>;
}

// 9. Overall Global Diagnostic (Section 21)
export interface DataQualityDiagnostic {
  overallQualityScore: number | null; // null if dataset empty
  completenessPct: number | null;
  validityPct: number | null;
  consistencyPct: number | null;
  rangeAdherencePct: number | null;
  duplicatesCount: number;
  missingCriticalFieldsCount: number;
  totalCheckedRecords: number;
  totalCheckedColumns: number;
  moduleScores: Record<BusinessModule, ModuleQualityScore>;
  problematicFields: FieldValidationRecord[];
  duplicateGroups: DuplicateRecordGroup[];
  missingCriticalFieldsList: string[];
  excelPreImport?: ExcelPreImportQuality;
  hasCriticalBlockers: boolean;
  canGenerateReport: boolean;
  diagnosticSummaryMessage: string;
  evaluatedAt: string;
}

// 10. Reliable Metric Result with Denominators & Coverage (Section 28 & 29)
export type MetricQualityLevel = 'ALTA' | 'MEDIA' | 'BAJA' | 'SIN_DATOS';
export type MetricValidityStatus = 'VALID' | 'VALID_WITH_LIMITATIONS' | 'INSUFFICIENT_DATA' | 'NO_DATA';

export interface ReliableMetric<T = number> {
  metricId: string;
  title: string;
  value: T | null; // null if insufficient data
  numerator: number;
  denominator: number;
  coveragePct: number;
  dataQuality: MetricQualityLevel;
  status: MetricValidityStatus;
  displayText: string; // e.g. "26.7% entre quienes respondieron (48/180)"
  executiveSummary: string;
  metadata: {
    source: string;
    period: string;
    analyzedPopulation: number;
    totalTargetPopulation: number;
    updateDate: string;
  };
}
