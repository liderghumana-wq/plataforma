export type UseCaseStatus = 'IMPLEMENTADO' | 'EN DESARROLLO' | 'FUTURO';

export interface IAStrategicPillar {
  id: string;
  number: number;
  name: string;
  objective: string;
  applicationInApp: string;
  businessBenefit: string;
  trackingKpi: string;
  iconName: string;
}

export interface IAUseCaseItem {
  id: string;
  title: string;
  problemSolved: string;
  targetUser: string;
  inputData: string;
  aiTechUsed: string;
  outputGenerated: string;
  humanInterventionRequired: string;
  businessBenefit: string;
  status: UseCaseStatus;
  category: 'SG-SST' | 'Capital Humano' | 'Analítica' | 'Gobernanza';
}

export interface IAAutonomyLevel {
  level: number;
  name: string;
  tagline: string;
  description: string;
  inInsightPeopleStatus: 'ACTIVO' | 'DESHABILITADO POR SEGURIDAD';
  humanRole: string;
  badgeColor: string;
}

export interface IAStakeholder {
  role: string;
  businessNeed: string;
  requiredData: string;
  aiFeature: string;
  expectedOutcome: string;
  decisionScope: string;
}

export interface IAMaturityAssessment {
  currentLevel: 1 | 2 | 3 | 4 | 5;
  levelName: string;
  description: string;
  evidencesInCode: string[];
  currentGaps: string[];
  nextLevelName: string;
  recommendedActions: string[];
  maturityScorePercent: number;
}

export interface IAStrategyMetrics {
  totalUseCasesCount: number;
  implementedUseCasesCount: number;
  inDevelopmentUseCasesCount: number;
  futureUseCasesCount: number;
  totalAnalysesExecuted: number;
  totalRecommendationsGenerated: number;
  reviewedRecommendationsPercent: number;
  validatedRecommendationsPercent: number;
  rejectedRecommendationsPercent: number;
  implementedRecommendationsPercent: number;
  openAIRisksCount: number;
  controlledAIRisksCount: number;
  humanInterventionRatePercent: number;
}
