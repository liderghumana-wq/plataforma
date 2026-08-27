/**
 * Executive Report Data Models & Snapshot Interfaces
 * Prompt 30 Strict Specification for SG-SST Executive Reporting
 */

import { IndicatorResult } from '../indicators/types';
import { Prompt20ValidationReport } from '../data_integrity/types';

export interface CompanyReportConfig {
  companyId: string;
  companyName: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  nit?: string;
  ciudad?: string;
  representanteLegal?: string;
  cargoRepresentante?: string;
  responsableInforme?: string;
  cargoResponsable?: string;
  catalogSedes?: string[];
  catalogAreas?: string[];
  catalogProyectos?: string[];
}

export interface ReportVariableDistributionItem {
  category: string;
  count: number;
  percentage: number;
}

export interface ReportVariableBreakdown {
  variableName: string;
  totalPopulation: number;
  validResponses: number;
  unreportedResponses: number;
  coveragePercentage: number;
  distribution: ReportVariableDistributionItem[];
  isAvailable: boolean;
  missingMessage?: string;
}

export interface ReportFinding {
  id: string;
  variableName: string;
  resultText: string;
  coveragePercentage: number;
  evidenceLevel: 'ALTA' | 'MEDIA' | 'BAJA';
  source: string;
  description: string;
}

export interface ReportRecommendation {
  id: string;
  associatedFindingId?: string;
  associatedFindingTitle: string;
  evidence: string;
  proposedAction: string;
  priority: 'ALTA' | 'MEDIA' | 'BAJA';
  targetPopulation: string;
  source: string;
}

export interface ReportSnapshot {
  reportId: string;
  datasetId: string;
  companyId: string;
  surveyVersion: string;
  indicatorVersion: string;
  reportVersion: string;
  generatedAt: string;
  qualityReport: Prompt20ValidationReport;
  indicators: IndicatorResult[];
  companyConfig: CompanyReportConfig;
  variables: Record<string, ReportVariableBreakdown>;
  findings: ReportFinding[];
  recommendations: ReportRecommendation[];
  limitations: string[];
  validationPassed: boolean;
  validationWarnings: string[];
}

export interface ReportPreValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ReportPostValidationResult {
  isValid: boolean;
  violations: string[];
}
