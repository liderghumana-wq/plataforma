/**
 * Core Data Integrity & Traceability System Types for SG-SST Platform
 * Prompt 19 Specification - Complete Traceability Model
 */

export type SourceType = 
  | 'ENCUESTA'
  | 'EXCEL'
  | 'CATALOGO'
  | 'CALCULADO'
  | 'IA_INTERPRETACION'
  | 'NO_DISPONIBLE';

export type QualityLevel = 'ALTA' | 'MEDIA' | 'BAJA';

export type DataValueStatus = 
  | 'VALID' 
  | 'CALCULATED_FROM_VALID_DATA' 
  | 'MISSING' 
  | 'INVALID' 
  | 'OUT_OF_RANGE';

export type FieldQualityStatus = 
  | 'COMPLETE'   // 100% coverage
  | 'PARTIAL'    // > 0% and < 100%
  | 'MISSING'    // 0% valid records or column missing
  | 'INVALID';   // High invalid/corrupted records

export interface QualityThresholdConfig {
  highMinPercentage: number;   // default >= 90.0
  mediumMinPercentage: number; // default >= 70.0 and < 90.0
}

export interface RecordLineage {
  employeeId?: string;
  empresaId: string;
  encuestaId?: string;
  periodoId?: string;
  fechaRegistro?: string;
  filaExcel?: number;
}

export interface QuestionLineage {
  questionId: string;
  questionText: string;
  sectionId?: string;
  sectionName?: string;
  responseId?: string;
}

export interface ExcelLineage {
  fileName: string;
  fileId?: string;
  sheetName: string;
  excelRow: number;
  excelColumn: string;
  originalHeader: string;
  mappedField: string;
  originalValue: any;
  normalizedValue: any;
}

export interface CalculationLineage {
  calculationId: string;
  formula: string;
  inputVariables: string[];
  inputValues: Record<string, any>;
  result: any;
  calculationDate: string;
}

export interface FieldQualityMetric {
  fieldName: string;
  fieldLabel: string;
  totalRecords: number;
  validRecords: number;
  missingRecords: number;
  invalidRecords: number;
  outOfRangeRecords: number;
  coveragePercentage: number; // 0.0 - 100.0
  status: FieldQualityStatus;
  sampleValidValue?: any;
}

export interface DataQualityReport {
  datasetName: string;
  totalRecords: number;
  validRecords: number;
  missingRecords: number;
  invalidRecords: number;
  outOfRangeRecords: number;
  duplicatedRecords: number;
  coveragePercentage: number;
  fieldsWithMissingData: string[];
  fieldsWithInvalidData: string[];
  fieldMetrics: Record<string, FieldQualityMetric>;
  columnsFound: string[];
  columnsMissing: string[];
  generatedAt: string;
}

export interface IndicatorTraceability {
  indicatorId: string;
  indicatorName: string;
  sourceType?: SourceType;
  sourceField: string;
  sourceQuestion?: string;
  sourceSurvey?: string;
  surveyVersion?: string;
  calculationMethod: string;
  formula?: string;
  validRecords: number;
  totalRecords: number;
  coveragePercentage: number;
  qualityLevel?: QualityLevel;
  calculatedValue: number | string | null;
  unit: string;
  statusText: string;
  calculatedAt: string;
  dataStatus: DataValueStatus;
  
  // Advanced Prompt 19 Lineages
  recordLineage?: RecordLineage;
  questionLineage?: QuestionLineage;
  excelLineage?: ExcelLineage;
  calculationLineage?: CalculationLineage;
  period?: string;
  cutoffDate?: string;
  empresaId?: string;
}

export interface SafeCalculationResult<T = number> {
  value: T | null;
  validRecords: number;
  totalRecords: number;
  coveragePercentage: number;
  statusText: string;
  dataStatus: DataValueStatus;
  traceability: IndicatorTraceability;
}

export interface DataAuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  companyId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'CORRECT' | 'IMPORT';
  source: SourceType;
  recordId: string;
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
}

export interface StatementAuditResult {
  statementId: string;
  originalText: string;
  indicatorId?: string;
  isBackedByData: boolean;
  containsQualitativeTerm: boolean;
  detectedTerms: string[];
  status: 'TRAZABLE' | 'AFIRMACIÓN SIN TRAZABILIDAD';
  backedValue?: string | number;
  coveragePercentage?: number;
}

export interface RecommendationTraceability {
  recommendationId: string;
  indicatorId: string;
  reason: string;
  sourceData: {
    value: number | string | null;
    coveragePercentage: number;
    sourceType: SourceType;
    sampleCount: number;
  };
  confidence: number; // 0 - 100%
  type: 'PREVENTIVA' | 'CORRECTIVA' | 'MEJORA' | 'SEGUIMIENTO';
  aiInterpretationOnly: boolean;
}

/**
 * PROMPT 20 SPECIFICATION TYPES
 */

export type FieldQualityStatusPrompt20 = 
  | 'COMPLETE'        // 100%
  | 'PARTIAL'         // 1-99.9%
  | 'MISSING'         // 0%
  | 'NOT_APPLICABLE';

export type AlertLevelPrompt20 = 
  | 'CRITICO'             // 🔴
  | 'REQUIERE_COMPLETAR'  // 🟠
  | 'INFORMACION_PARCIAL' // 🟡
  | 'INFORMACION_COMPLETA';// 🟢

export interface FieldValidationDetail {
  fieldId: string;
  fieldName: string;
  section: string;
  required: boolean;
  isCritical: boolean;
  totalRecords: number;
  validRecords: number;
  emptyRecords: number;
  coveragePercentage: number;
  status: FieldQualityStatusPrompt20;
  alertLevel: AlertLevelPrompt20;
  sampleValue?: any;
}

export type IndicatorStatusPrompt20 = 
  | 'DATO_DISPONIBLE'     // 🟢
  | 'DATO_PARCIAL'        // 🟡
  | 'INSUFFICIENT_DATA'   // 🟠
  | 'MISSING';            // 🔴 (NO DISPONIBLE)

export interface IndicatorValidationDetail {
  indicatorId: string;
  indicatorName: string;
  requiredFields: string[];
  validRecords: number;
  totalRecords: number;
  coveragePercentage: number;
  minimumCoverage: number;
  status: IndicatorStatusPrompt20;
  calculatedValue: number | string | null;
  unit: string;
  displayText: string;
  formula: string;
}

export interface Prompt20CompanyConfig {
  companyId: string;
  companyName: string;
  surveyId: string;
  periodId: string;
  mandatoryFields: string[];
  criticalFields: string[];
  minimumCoveragePercentage: number; // e.g. 70.0%
  allowedSections: string[];
}

export interface Prompt20ValidationReport {
  companyId: string;
  surveyId: string;
  period: string;
  totalRecords: number;
  evaluatedFieldsCount: number;
  completeFieldsCount: number;
  partialFieldsCount: number;
  missingFieldsCount: number;
  availableIndicatorsCount: number;
  unavailableIndicatorsCount: number;
  overallCoveragePercentage: number;
  fieldDetails: Record<string, FieldValidationDetail>;
  indicatorDetails: Record<string, IndicatorValidationDetail>;
  criticalIssues: string[];
  warnings: string[];
  validationDate: string;
  canGenerateReport: boolean;
  hasCriticalErrors: boolean;
}

export interface Prompt20TestCaseResult {
  testNumber: number;
  testName: string;
  passed: boolean;
  details: string;
  missingFieldsTested: string[];
  actualOutputs: Record<string, string>;
}


