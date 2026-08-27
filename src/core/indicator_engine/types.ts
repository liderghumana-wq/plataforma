/**
 * SG-SST CENTRAL INDICATOR ENGINE TYPES
 * PROMPT 37 SPECIFICATION
 * 
 * Strict Architecture:
 * DATASET VALIDADO -> INDICATOR ENGINE -> DASHBOARD -> INFORME
 */

export type IndicatorCategoryPrompt37 = 
  | 'ANTROPOMETRIA'
  | 'SOCIODEMOGRAFICO'
  | 'SALUD'
  | 'ESTILO_VIDA'
  | 'SOCIOLABORAL'
  | 'ORGANIZACIONAL'
  | 'BIENESTAR_AUSENTISMO';

// Backward compatibility category type
export type IndicatorCategory = 
  | 'SOCIODEMOGRAPHIC'
  | 'HEALTH'
  | 'ANTHROPOMETRY'
  | 'LIFESTYLE'
  | 'SOCIOLABOR'
  | 'ANTROPOMETRIA'
  | 'SOCIODEMOGRAFICO'
  | 'SALUD'
  | 'ESTILO_VIDA'
  | 'SOCIOLABORAL'
  | 'ORGANIZACIONAL'
  | 'BIENESTAR_AUSENTISMO';

export type CalculationMethod = 
  | 'COUNT'
  | 'PERCENTAGE'
  | 'AVERAGE'
  | 'MEDIAN'
  | 'MIN'
  | 'MAX'
  | 'DISTRIBUTION'
  | 'RATE'
  | 'RATIO'
  | 'SCORE'
  | 'PERIOD_COMPARISON';

/**
 * 5 Standard Indicator States defined in Section 4:
 * CALCULATED, NOT_CALCULABLE, INSUFFICIENT_DATA, NO_DATA, INVALID_SOURCE
 */
export type IndicatorStatusPrompt37 = 
  | 'CALCULATED'
  | 'NOT_CALCULABLE'
  | 'INSUFFICIENT_DATA'
  | 'NO_DATA'
  | 'INVALID_SOURCE';

// Backward compatibility status type
export type IndicatorStatus = 
  | 'COMPLETE'
  | 'PARTIAL'
  | 'NO_DATA'
  | 'INVALID'
  | 'CALCULATED'
  | 'NOT_CALCULABLE'
  | 'INSUFFICIENT_DATA'
  | 'INVALID_SOURCE'
  | 'VALID'
  | 'VALID_WITH_LIMITATIONS';

export type IndicatorDataSource = 'SURVEY' | 'EXCEL' | 'MIXED' | 'API';

export interface IndicatorThresholds {
  green: { min?: number; max?: number; label?: string };
  yellow: { min?: number; max?: number; label?: string };
  red: { min?: number; max?: number; label?: string };
}

/**
 * Section 2: IndicatorDefinition Entity
 */
export interface IndicatorDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: IndicatorCategoryPrompt37;
  formula: string;
  unit: string;
  numerator: string;
  denominator: string;
  requiredFields: string[];
  aggregationType: CalculationMethod;
  minimumCoverage: number; // e.g. 70 or 80 (%)
  status: 'ACTIVE' | 'DEPRECATED' | 'DRAFT';
  version: string;
  thresholds?: IndicatorThresholds;
  notes?: string;
}

export interface ExcludedRecordInfo {
  recordId: string;
  fieldKey: string;
  status: string; // 'MISSING' | 'INVALID' | 'OUT_OF_RANGE' | 'PREFER_NOT_TO_ANSWER' | 'NOT_APPLICABLE' | 'INCONSISTENT'
  reason: string;
}

export interface DistributionItemPrompt37 {
  label: string;
  count: number;
  percentage: number; // calculated relative to VALID denominator (1 decimal)
  isMissingOrUnreported?: boolean;
}

export interface IndicatorTraceability {
  formulaUsed: string;
  dataPointsUsed: number;
  dataPointsExcluded: number;
  denominatorExplanation: string;
  coverageExplanation: string;
  dataSourceComposition?: Record<string, number>;
  filterApplied?: string;
}

/**
 * Section 3: IndicatorResult Structure
 */
export interface IndicatorResultPrompt37 {
  indicatorId: string;
  code: string;
  name: string;
  value: number | string | null;
  unit: string;
  numerator: number;
  denominator: number;
  coverage: number; // 0.0 to 100.0 (1 decimal)
  status: IndicatorStatusPrompt37;
  calculatedAt: string;
  dataSource: IndicatorDataSource;
  limitations: string[];
  
  // Additional rich analytics
  distribution?: DistributionItemPrompt37[];
  average?: number | null;
  median?: number | null;
  totalPopulation: number;
  validRecordsCount: number;
  missingOrExcludedCount: number;
  trafficLight?: 'GREEN' | 'YELLOW' | 'RED' | 'GRAY';
  
  // Section 40 & 42: Traceability & Exclusions
  companyId: string;
  period: string;
  surveyVersion: string;
  datasetVersion: string;
  isComparable: boolean;
  comparabilityNote?: string;
  excludedRecords: ExcludedRecordInfo[];
  traceability: IndicatorTraceability;
  
  // Sub-breakdowns by organizational catalogs (Sections 29-33)
  bySede?: Record<string, IndicatorResultPrompt37>;
  byArea?: Record<string, IndicatorResultPrompt37>;
  byProyecto?: Record<string, IndicatorResultPrompt37>;
  byCargo?: Record<string, IndicatorResultPrompt37>;
}

// Backward compatible distribution item
export interface DistributionItem {
  label: string;
  count: number;
  percentage: number;
  status?: string;
  isMissingOrUnreported?: boolean;
}

// Backward compatible IndicatorMetadata
export interface IndicatorMetadata {
  indicatorId: string;
  category: IndicatorCategory;
  name: string;
  description: string;
  companyId: string;
  surveyId?: string;
  surveyVersion?: string;
  sourceQuestionId?: string;
  sourceField: string;
  calculationMethod: CalculationMethod;
  unit: string;
  
  totalRecords: number;
  validRecords: number;
  missingRecords: number;
  coveragePercentage: number;
  
  value: number | string | null;
  distribution?: DistributionItem[];
  
  previousValue?: number | null;
  period?: string;
  previousPeriod?: string;
  comparisonDelta?: number | null;
  
  status: IndicatorStatus;
  calculatedAt: string;
  warning?: string;
}

export interface IndicatorFilterOptions {
  companyId: string;
  period?: 'mes' | 'trimestre' | 'semestre' | 'anio' | 'todos' | string;
  periodYear?: number;
  periodQuarter?: number;
  compareWithPreviousPeriod?: boolean;
  
  surveyId?: string;
  surveyVersion?: string;
  
  sedeId?: string;
  areaId?: string;
  proyectoId?: string;
  cargoId?: string;
  
  sexo?: string;
  ageRange?: string;
  modalidad?: string;
  tipoContrato?: string;
  turno?: string;
  jornada?: string;
}

export interface CategorySummary {
  category: IndicatorCategory;
  categoryLabel: string;
  totalIndicators: number;
  completeCount: number;
  partialCount: number;
  noDataCount: number;
  averageCoverage: number;
}
