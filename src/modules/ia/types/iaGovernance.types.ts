export interface IAPrinciple {
  id: string;
  name: string;
  shortDescription: string;
  businessImplication: string;
  iconName: string;
  category: 'Etica' | 'Operativa' | 'Seguridad';
}

export interface IAUseScope {
  id: string;
  type: 'PERMITIDO' | 'NO_PERMITIDO';
  title: string;
  description: string;
  justification: string;
  riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Inadmisible';
  responsibleRole: string;
}

export interface IAModelRegistryItem {
  id: string;
  name: string;
  provider: string;
  version: string;
  purpose: string;
  dataProcessed: string;
  riskLevel: 'Bajo' | 'Medio' | 'Alto';
  responsible: string;
  status: 'Activo' | 'En Evaluación' | 'Deprecado' | 'Restringido';
  lastReviewDate: string;
  notes: string;
  sourceVerification: string;
}

export interface IARiskMatrixItem {
  id: string;
  risk: string;
  description: string;
  probability: 'Baja' | 'Media' | 'Alta';
  impact: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  level: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  control: string;
  responsible: string;
  status: 'Mitigado' | 'En Monitoreo' | 'Control Activo';
}

export interface IARecommendationAuditLog {
  id: string;
  timestamp: string;
  companyId: string;
  userId: string;
  userName: string;
  userRole: string;
  iaFunction: string;
  analysisType: string;
  dataSource: string;
  modelVersion: string;
  confidenceScore?: number;
  generatedOutputSummary: string;
  humanReviewStatus: 'Pendiente de revisión' | 'Validada' | 'Rechazada' | 'Implementada';
  humanReviewerName?: string;
  humanReviewerRole?: string;
  humanReviewTimestamp?: string;
  humanObservations?: string;
  decisionAction?: string;
  dataMinimizationApplied: boolean;
  containsSensitiveData: boolean;
}

export interface IAGovernanceSummary {
  registeredModelsCount: number;
  activeAIFunctionsCount: number;
  pendingRecommendationsCount: number;
  validatedRecommendationsCount: number;
  rejectedRecommendationsCount: number;
  implementedRecommendationsCount: number;
  openRisksCount: number;
  mitigatedRisksCount: number;
  complianceHealthScore: number;
  totalAuditEventsCount: number;
}
