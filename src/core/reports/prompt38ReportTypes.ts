/**
 * PROMPT 38 - EXECUTIVE REPORT GENERATOR TYPES
 * Types and interfaces for the Characterization and Health Conditions Report
 * 
 * Pipeline:
 * DATASET VALIDADO -> DATA QUALITY ENGINE -> CENTRAL INDICATOR ENGINE -> REPORT ENGINE -> INFORME
 */

import { IndicatorResultPrompt37, IndicatorFilterOptions } from '../indicator_engine/types';
import { Prompt20ValidationReport, FieldValidationDetail } from '../data_integrity/types';

export interface ReportCompanyConfigPrompt38 {
  companyId: string;
  companyName: string;
  logo?: string;
  nit?: string;
  ciudad?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  representanteLegal?: string;
  cargoRepresentante?: string;
  responsableSST?: string;
  cargoResponsableSST?: string;
  licenciaSST?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export interface ReportMetadataPrompt38 {
  reportId: string;
  companyId: string;
  companyName: string;
  nit: string;
  logo: string;
  reportTitle: string;
  period: string;
  surveyVersion: string;
  datasetVersion: string;
  reportVersion: string; // e.g. "v1.0", "v2.0"
  generatedAt: string;
  generatedBy: string;
  isComparative: boolean;
  previousPeriod?: string;
  filtersApplied?: IndicatorFilterOptions;
}

export interface TechnicalSheetPrompt38 {
  companyName: string;
  nit: string;
  period: string;
  totalRegisteredEmployees: number;
  evaluatedEmployeesCount: number;
  informationSource: string;
  surveyVersion: string;
  surveyApplicationDate: string;
  generationDate: string;
  overallCoveragePercentage: number;
  responsibleOfficer: string;
  responsibleRole: string;
  sstLicense: string;
}

export interface QualitySummaryPrompt38 {
  totalEmployees: number;
  validRecords: number;
  completeFieldsCount: number;
  missingFieldsCount: number;
  invalidFieldsCount: number;
  outOfRangeFieldsCount: number;
  notCalculableFieldsCount: number;
  preferNotToAnswerCount: number;
  overallCoveragePercentage: number;
  hasIncompleteWarning: boolean;
  warningMessage?: string;
}

export interface ReportDistributionItemPrompt38 {
  label: string;
  count: number;
  percentage: number; // relative to valid denominator (1 decimal)
  isMissingOrUnreported?: boolean;
}

export interface ReportVariableDataPrompt38 {
  variableKey: string;
  displayName: string;
  category: string;
  totalPopulation: number;
  validCount: number;
  missingCount: number;
  invalidCount: number;
  preferNotToAnswerCount: number;
  notApplicableCount: number;
  coveragePercentage: number;
  isCalculable: boolean;
  messageIfNoData?: string;
  distribution: ReportDistributionItemPrompt38[];
  average?: number | null;
  unit?: string;
}

export interface ReportFindingPrompt38 {
  id: string;
  category: 'SOCIODEMOGRAFICO' | 'SALUD' | 'LABORAL' | 'HABITOS' | 'CALIDAD' | 'OSTEOMUSCULAR';
  indicatorCode?: string;
  title: string;
  description: string;
  evidenceLevel: 'ALTA' | 'MEDIA' | 'BAJA';
  coveragePercentage: number;
  source: string;
  isPreventive: boolean;
  ruleTriggered: string;
}

export interface ReportRecommendationPrompt38 {
  id: string;
  findingId: string;
  dimension: string;
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  proposedAction: string;
  rationale: string;
  targetPopulation: string;
  indicatorEvidence: string;
  isDataAvailable: boolean;
}

export interface NonCalculableIndicatorPrompt38 {
  indicatorCode: string;
  indicatorName: string;
  category: string;
  reason: string;
  missingVariables: string[];
  coveragePercentage: number;
}

export interface QualityAnnexItemPrompt38 {
  variableKey: string;
  displayName: string;
  section: string;
  totalRecords: number;
  validRecords: number;
  missingRecords: number;
  invalidRecords: number;
  outOfRangeRecords: number;
  preferNotToAnswerRecords: number;
  coveragePercentage: number;
  status: 'OPTIMO' | 'ACEPTABLE' | 'CRITICO' | 'SIN_DATOS';
}

export interface TraceabilityItemPrompt38 {
  indicatorCode: string;
  indicatorName: string;
  formula: string;
  datasetId: string;
  source: string;
  variablesUsed: string[];
  numerator: number;
  denominator: number;
  coveragePercentage: number;
  calculatedAt: string;
  version: string;
}

export interface ReportSnapshotPrompt38 {
  metadata: ReportMetadataPrompt38;
  technicalSheet: TechnicalSheetPrompt38;
  methodology: {
    sources: string[];
    validationProcess: string[];
    missingDataTreatment: string;
    invalidDataTreatment: string;
    calculationCriteria: string;
    privacyPolicy: string;
  };
  qualitySummary: QualitySummaryPrompt38;
  variables: Record<string, ReportVariableDataPrompt38>;
  indicators: IndicatorResultPrompt37[];
  nonCalculableIndicators: NonCalculableIndicatorPrompt38[];
  findings: ReportFindingPrompt38[];
  limitations: string[];
  recommendations: ReportRecommendationPrompt38[];
  qualityAnnex: QualityAnnexItemPrompt38[];
  traceability: TraceabilityItemPrompt38[];
  validationChecklist: {
    datasetValidated: boolean;
    singleCompanyVerified: boolean;
    indicatorsCalculatedViaCentralEngine: boolean;
    qualityAvailable: boolean;
    noSyntheticDataVerified: boolean;
    noBannedDefaultsVerified: boolean;
    sensitiveDataProtected: boolean;
    coveragesCalculated: boolean;
    limitationsIdentified: boolean;
  };
}

export interface ReportGenerationInputPrompt38 {
  dataset: {
    companyId: string;
    period?: string;
    surveyVersion?: string;
    datasetVersion?: string;
    colaboradores: any[];
    respuestas?: any[];
    ausentismos?: any[];
    encuestasBienestar?: any[];
    catalogs?: {
      sedes?: Array<{ id: string; nombre: string }>;
      areas?: Array<{ id: string; nombre: string }>;
      cargos?: Array<{ id: string; nombre: string }>;
      proyectos?: Array<{ id: string; nombre: string }>;
    };
  };
  companyConfig: ReportCompanyConfigPrompt38;
  filters?: IndicatorFilterOptions;
  reportVersion?: string;
  generatedBy?: string;
  previousPeriodDataset?: any;
}
