export interface IAIndicator {
  id: string;
  name: string;
  value: number; // typically 0 - 100 score, or general numeric metrics
  dimension?: string; // category, e.g., "Clima", "Liderazgo", "Bienestar", "Finanzas"
  description?: string;
  previousValue?: number; // Optional historical value to compute trends
}

export interface AIActionStep {
  task: string;
  responsible: string;
  timeframe: string; // e.g., "Corto Plazo (15 días)", "Medio Plazo (30 días)"
  priority: 'Alta' | 'Media' | 'Baja';
}

export interface AIEngineResponse {
  resumenEjecutivo: string;
  hallazgos: string[];
  riesgos: string[];
  fortalezas: string[];
  tendencias: string[];
  recomendaciones: string[];
  prioridades: string[];
  planDeAccion: AIActionStep[];
  timestamp: string;
}
