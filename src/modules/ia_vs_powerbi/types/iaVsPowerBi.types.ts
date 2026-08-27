export type DataClassificationType = '[A] Dato real' | '[B] Supuesto' | '[C] Escenario' | '[D] Proyección';

export interface ComparisonCriterionItem {
  id: string;
  category: 'RECOLECCION_DATOS' | 'VALIDACION_CALIDAD' | 'INDICADORES_SST' | 'ANALITICA_VISUALIZACION' | 'IA_GOBERNANZA' | 'INFORMES_AUTOMATIZACION' | 'PARAMETRIZACION_MULTIEMPRESA' | 'ESCALABILIDAD_DESPLIEGUE';
  name: string;
  insightPeopleVal: string;
  powerBiVal: string;
  diferencialScope: 'VENTAJA_INSIGHT' | 'COMPLEMENTARIO' | 'VENTAJA_POWERBI' | 'EQUIVALENTE';
  verifiedInCode: boolean;
  codeReference?: string;
  notes: string;
}

export interface DifferentialItem {
  id: string;
  number: number;
  name: string;
  category: 'CAPTURA' | 'MOTOR_CALCULO' | 'IA_ETICA' | 'GESTION_EMPRESARIAL';
  description: string;
  technicalVerification: string;
  businessImpact: string;
}

export interface ComplementarityItem {
  id: string;
  dimension: string;
  insightRole: string;
  powerBiRole: string;
  synergyOutcome: string;
  practicalWorkflow: string;
}

export interface UsageScenarioItem {
  id: string;
  code: 'ESCENARIO_1_EXCEL' | 'ESCENARIO_2_POWERBI' | 'ESCENARIO_3_HIBRIDO';
  title: string;
  subtitle: string;
  badgeColor: string;
  companyProfile: string;
  currentPainPoint: string;
  powerBiRoleInScenario: string;
  insightPeopleRoleInScenario: string;
  recommendedArchitecture: string;
  businessValueDelivered: string[];
}

export interface CostComparisonItem {
  id: string;
  costCategory: string;
  insightPeopleApproach: string;
  powerBiApproach: string;
  dataClassification: DataClassificationType;
  financialImplication: string;
  riskOrConsideration: string;
}

export interface DecisionCriterionWeight {
  id: string;
  dimensionName: string;
  description: string;
  userWeight: number; // 1 to 5
  insightFitScore: number; // 0 to 100
  powerBiFitScore: number; // 0 to 100
}

export interface TraceabilityLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  category: 'CRITERIO' | 'PESO' | 'ESCENARIO' | 'CONCLUSION';
  fieldChanged: string;
  previousValue: string;
  newValue: string;
  justification: string;
}

export interface AcademicConclusionConfig {
  version: string;
  lastUpdated: string;
  authorUser: string;
  academicThesis: string;
  technicalSynthesis: string;
  recommendationSummary: string;
  maturityAlignment: {
    governanceConnection: string;
    strategyConnection: string;
    viabilityConnection: string;
  };
}

export interface IaVsPowerBiModuleState {
  criteria: ComparisonCriterionItem[];
  decisionWeights: DecisionCriterionWeight[];
  scenarios: UsageScenarioItem[];
  academicConclusion: AcademicConclusionConfig;
  auditLogs: TraceabilityLogEntry[];
}
