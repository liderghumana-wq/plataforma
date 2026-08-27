/**
 * SG-SST Centralized Indicator Engine Types
 * Prompt 30 Specification
 */

export type DataQualityLevel = 'ALTA' | 'MEDIA' | 'BAJA' | 'SIN_DATOS';

export type IndicatorStatus = 
  | 'VALID'
  | 'VALID_WITH_LIMITATIONS'
  | 'INSUFFICIENT_DATA'
  | 'NO_DATA'
  | 'INVALID_DATA'
  | 'NOT_CALCULABLE';

export interface IndicatorResult {
  indicatorId: string;
  name: string;
  value: number | null;
  unit: string; // '%', 'años', 'kg', 'días', 'casos', 'puntos', etc.
  numerator: number;
  denominator: number;
  coverage: number; // Percentage 0 - 100
  validRecords: number;
  totalRecords: number;
  dataQuality: DataQualityLevel;
  status: IndicatorStatus;
  source: string;
  period: string;
  calculatedAt: string;
  variablesUsed: string[];
  formulaVersion: string; // e.g. 'BMI_V1', 'ABSENTEEISM_V1', 'WELLBEING_V1'
  interpretation: string;
  details?: string;
  warning?: string;
  byArea?: Record<string, IndicatorResult>;
  bySede?: Record<string, IndicatorResult>;
  byProyecto?: Record<string, IndicatorResult>;
}

export interface IndicatorAuditRecord {
  auditId: string;
  indicatorId: string;
  datasetId: string;
  companyId: string;
  source: string;
  calculationVersion: string;
  calculatedAt: string;
  recordsUsed: number;
  recordsExcluded: number;
  formulaVersion: string;
  coveragePercentage: number;
  status: IndicatorStatus;
}

export interface IndicatorCalculationDataset {
  datasetId?: string;
  companyId: string;
  period?: string;
  colaboradores?: any[];
  respuestas?: any[];
  ausentismos?: any[];
  encuestasBienestar?: any[];
  catalogSedes?: any[];
  catalogAreas?: any[];
  catalogProyectos?: any[];
}
