export type RiskLevel = 'Muy Bajo' | 'Bajo' | 'Medio' | 'Alto' | 'Muy Alto';
export type BatteryType = 'Intralaboral A' | 'Intralaboral B' | 'Extralaboral' | 'Estrés' | 'Resultados Consolidados';

export interface PsicosocialDimension {
  id: string;
  name: string;
  description: string;
  category: 'Intralaboral' | 'Extralaboral' | 'Estrés';
}

export interface PsicosocialDimensionScore {
  dimensionId: string;
  name: string;
  category: 'Intralaboral' | 'Extralaboral' | 'Estrés';
  score: number; // 0 - 100
  riskLevel: RiskLevel;
  description: string;
}

export interface PsicosocialRanking {
  name: string;
  score: number;
  riskLevel: RiskLevel;
  count: number;
}

export interface PsicosocialEmployee {
  id: string;
  area: string;
  sede: string;
  proyecto: string;
  cargo: string;
  score: number;
  riskLevel: RiskLevel;
  batteryType: BatteryType;
  dimensionScores: Record<string, number>; // dimensionId -> score (0-100)
}

export interface PsicosocialMatrixCell {
  x: string; // Likelihood or Extralaboral Risk
  y: string; // Impact or Intralaboral Risk
  value: number; // percentage or count of employees
  level: RiskLevel;
}

export interface PsicosocialData {
  totalParticipants: number;
  globalScore: number; // 0-100 scale (high score means high risk in psychosocial risk context)
  globalRiskLevel: RiskLevel;
  batteryType: BatteryType;
  dimensions: PsicosocialDimensionScore[];
  employees: PsicosocialEmployee[];
  rankings: {
    areas: PsicosocialRanking[];
    sedes: PsicosocialRanking[];
    proyectos: PsicosocialRanking[];
    cargos: PsicosocialRanking[];
  };
  distribution: {
    muyBajo: number;
    bajo: number;
    medio: number;
    alto: number;
    muyAlto: number;
  };
  matrix: PsicosocialMatrixCell[];
}

export interface PsicosocialActionPlanItem {
  id: string;
  factor: string;
  objective: string;
  activity: string;
  responsible: string;
  date: string;
  indicator: string;
  cost: number;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Planificada' | 'En Proceso' | 'Completada';
}

export interface PsicosocialAlert {
  id: string;
  type: 'area' | 'project' | 'sede' | 'boss' | 'factor' | 'stress' | 'workload' | 'leadership' | 'communication';
  title: string;
  description: string;
  severity: 'Alta' | 'Media' | 'Baja';
  target: string;
}

export interface PsicosocialAIAnalysis {
  executiveSummary: string;
  riskInterpretation: string;
  protectiveFactors: string[];
  criticalFactors: string[];
  priorityFactors: string[];
  alerts: PsicosocialAlert[];
  findings: string[];
  conclusions: string[];
  recommendations: string[];
  plan: PsicosocialActionPlanItem[];
}
