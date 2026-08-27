export type SeverityLevel = 'Critica' | 'Alta' | 'Media' | 'Baja';

export interface IntelligentAlert {
  id: string;
  sourceModule: 'Sociodemográfico' | 'Clima Organizacional' | 'Riesgo Psicosocial' | 'Ausentismo' | 'Accidentes' | 'Bienestar' | 'Capacitación' | 'Desempeño' | 'Rotación';
  title: string;
  description: string;
  severity: SeverityLevel;
  date: string;
  suggestedAction: string;
  status: 'Abierta' | 'En Mitigación' | 'Resuelta';
}

export interface RiskFactorSegment {
  name: string;
  value: number; // 0-100 score of risk
  status: 'Crítico' | 'Alto' | 'Medio' | 'Bajo';
}

export interface CIOExecutiveSummary {
  situation: string;
  findings: string[];
  strengths: string[];
  risks: string[];
  opportunities: string[];
  conclusions: string[];
  priorities: string[];
}
