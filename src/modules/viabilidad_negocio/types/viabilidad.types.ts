export type DataClassificationType = '[A] Dato real' | '[B] Supuesto' | '[C] Escenario' | '[D] Proyección';

export interface BusinessCanvasItem {
  id: string;
  category: 'PROBLEMA' | 'SEGMENTOS' | 'CLIENTE_OBJETIVO' | 'PROPUESTA_VALOR' | 'ACTIVIDADES_CLAVE' | 'RECURSOS_CLAVE' | 'CANALES' | 'RELACION_CLIENTES' | 'SOCIOS_CLAVE' | 'ESTRUCTURA_COSTOS' | 'FUENTES_INGRESOS';
  title: string;
  description: string;
  dataClassification: DataClassificationType;
}

export interface ClientSegmentItem {
  id: string;
  name: string;
  profileDescription: string;
  painPoint: string;
  valueDelivered: string;
  marketSizeEstimated: string;
  fitScore: 'MUY ALTO' | 'ALTO' | 'MEDIO';
  status: 'PRIORITARIO' | 'SECUNDARIO' | 'PROSPECTO';
}

export interface MonetizationModelItem {
  id: string;
  code: string;
  name: string;
  description: string;
  pricingLogic: string;
  pros: string;
  challenges: string;
  recommendationLevel: 'RECOMENDADO PRIMARIO' | 'COMPLEMENTARIO' | 'EVALUACIÓN FUTURA';
}

export interface CommercialPlanItem {
  id: string;
  code: 'BASICO' | 'PROFESIONAL' | 'EMPRESARIAL';
  name: string;
  tagline: string;
  badgeColor: string;
  monthlyPriceRef: number;
  annualPriceRef: number;
  priceClassification: DataClassificationType;
  maxColaboradores: number | string;
  maxEmpresas: number | string;
  maxSedes: number | string;
  maxAreas: number | string;
  maxProyectos: number | string;
  features: {
    encuestas: boolean | string;
    excelImport: boolean | string;
    dashboard: boolean | string;
    informesPrompt38: boolean | string;
    iaCopilot: boolean | string;
    gobernanzaIA: boolean | string;
    estrategiaIA: boolean | string;
    soporte: string;
    integraciones: string;
  };
}

export interface FinancialScenarioParams {
  id: 'conservador' | 'base' | 'optimista';
  name: string;
  description: string;
  numClients: number;
  avgColaboradoresPerClient: number;
  monthlyBasePricePerClient: number;
  monthlyPricePerColaborador: number;
  implementationFeePerClient: number;
  monthlyInfraCost: number;
  monthlyAITokenCost: number;
  monthlySupportCost: number;
  monthlyDevCost: number;
  monthlyCommercialCost: number;
  monthlyOtherCost: number;
  oneTimeInitialInvestment: number;
}

export interface ClientROICalculatorParams {
  manualHoursPerCycle: number;
  costPerHourCop: number;
  cyclesPerYear: number;
  teamMembersCount: number;
  platformEstimatedHoursPerCycle: number;
  platformAnnualFeeCop: number;
}

export interface ViabilityMatrixDimension {
  id: string;
  dimensionName: 'VIABILIDAD TÉCNICA' | 'VIABILIDAD OPERATIVA' | 'VIABILIDAD FINANCIERA' | 'VIABILIDAD COMERCIAL' | 'VIABILIDAD LEGAL' | 'VIABILIDAD ÉTICA' | 'VIABILIDAD DE ESCALABILIDAD';
  status: 'ALTA' | 'MEDIA' | 'EN VALIDACIÓN';
  evidenceInPlatform: string;
  strengths: string[];
  risksIdentified: string[];
  requiredActions: string[];
}

export interface CompetitiveAdvantageItem {
  featureOrCriterion: string;
  insightPeopleIA: string;
  excelTraditional: string;
  dashboardTraditional: string;
  powerBiStandalone: string;
  traditionalConsultancy: string;
  isolatedSurveys: string;
}

export interface ScalabilityDimensionItem {
  dimension: string;
  currentState: string;
  projectedCapacity: string;
  scalingRequirement: string;
  bottleneckRisk: 'BAJO' | 'MEDIO' | 'ALTO';
}

export interface CommercialRoadmapPhase {
  phaseNumber: number;
  title: string;
  timeframe: string;
  objective: string;
  keyMilestones: string[];
  targetKpi: string;
  status: 'EN CURSO' | 'PLANIFICADO' | 'VISIÓN';
}

export interface FinancialAuditChangeLog {
  id: string;
  timestamp: string;
  userEmail: string;
  parameterName: string;
  oldValue: string | number;
  newValue: string | number;
  dataClassification: DataClassificationType;
  justification: string;
}
