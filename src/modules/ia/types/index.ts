// Tipos de datos para prompts de IA, respuestas sintéticas y modelos de riesgos predictivos
export interface AISmartPrompt {
  contextoEmpresa: string;
  variableInteres: string;
  colaboradoresCount: number;
}
export interface AIPredictionResult {
  nivelRiesgo: 'Bajo' | 'Medio' | 'Alto';
  probabilidad: number;
  recomendacionInmediata: string;
}

export * from './aiEngine.types';
