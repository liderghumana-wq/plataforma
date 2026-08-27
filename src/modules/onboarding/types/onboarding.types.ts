/**
 * ONBOARDING & ACTIVATION TYPES (Fase 9)
 * Definiciones de tipos para el flujo guiado de configuración empresarial,
 * checklist de activación, Health Score, centro de tareas y asistente de activación.
 */

import { CompanyTenant } from '../../administracion_saas/types/saas.types';

export type OnboardingStepId = 
  | 'bienvenida'
  | 'empresa'
  | 'estructura'
  | 'colaboradores'
  | 'calidad_datos'
  | 'encuesta'
  | 'indicadores';

export type ImplementationStageId =
  | 'etapa_1_configuracion'
  | 'etapa_2_datos'
  | 'etapa_3_calidad'
  | 'etapa_4_encuesta'
  | 'etapa_5_indicadores'
  | 'etapa_6_diagnostico'
  | 'etapa_7_ia'
  | 'etapa_8_plan_accion'
  | 'etapa_9_seguimiento';

export type StageStatus = 'COMPLETADO' | 'EN_PROGRESO' | 'PENDIENTE' | 'BLOQUEADO';

export interface ImplementationStage {
  id: ImplementationStageId;
  order: number;
  nombre: string;
  descripcion: string;
  status: StageStatus;
  evidencia: string;
  fechaCompletado?: string;
  siguienteAccion: string;
  moduloDestino: string;
  tipoDato: '[A] Real' | '[B] Supuesto' | '[C] Escenario' | '[D] Proyección';
}

export type HealthScoreStatus = 'OPTIMO' | 'BUENO' | 'EN_RIESGO' | 'CRITICO' | 'SIN_EVIDENCIA';

export interface HealthScoreComponent {
  id: string;
  nombre: string;
  pesoPct: number; // Ej: 15%
  puntajeObtenido: number; // 0 - 100
  puntajePonderado: number; // puntajeObtenido * (pesoPct / 100)
  estado: 'COMPLETO' | 'PARCIAL' | 'INCOMPLETO' | 'SIN_DATOS';
  evidenciaReal: string;
  recomendacion: string;
  tipoDato: '[A] Real' | '[C] Escenario';
}

export interface ImplementationHealthScore {
  companyId: string;
  scoreTotal: number | null; // 0-100 o null si falta evidencia
  estado: HealthScoreStatus;
  interpretacion: string;
  evaluadoEn: string;
  componentes: HealthScoreComponent[];
  tipoDato: '[A] Real' | '[C] Escenario';
}

export type TaskPriority = 'ALTA' | 'MEDIA' | 'BAJA';
export type TaskCategory = 'ACCION_REQUERIDA' | 'REVISION_RECOMENDADA' | 'COMPLETADO';

export interface OnboardingTask {
  id: string;
  companyId: string;
  titulo: string;
  descripcion: string;
  categoria: TaskCategory;
  prioridad: TaskPriority;
  estado: 'PENDIENTE' | 'EN_PROGRESO' | 'RESUELTA';
  impactoEnHealthScore: number; // Puntos
  moduloRelacionado: string;
  accionLabel: string;
  accionHandlerKey: string;
  fechaDeteccion: string;
  fechaResolucion?: string;
  tipoDato: '[A] Real';
}

export interface ActivationChecklistItem {
  id: string;
  titulo: string;
  descripcion: string;
  completado: boolean;
  evidencia: string;
  fecha?: string;
  requeridoParaSiguiente: boolean;
}

export interface ActivationChecklistSummary {
  companyId: string;
  totalItems: number;
  completados: number;
  porcentajeAvance: number; // Calculado dinámicamente
  estadoGeneral: 'LISTO_PARA_OPERAR' | 'EN_CONFIGURACION' | 'INICIAL';
  items: ActivationChecklistItem[];
}

export interface OnboardingIndicatorCheckItem {
  id: string;
  nombre: string;
  categoria: 'CENSO' | 'CALIDAD' | 'SOCIODEMOGRAFICO' | 'SST' | 'OSTEOMUSCULAR' | 'AUSENTISMO' | 'CLIMA_BIENESTAR';
  estado: 'DISPONIBLE' | 'SIN_INFORMACION' | 'REQUIERE_DATOS' | 'PROCESADO';
  evidenciaNumerica?: string;
  descripcion: string;
}

export interface OnboardingSmartAlert {
  id: string;
  tipo: 'CRITICA' | 'ADVERTENCIA' | 'INFORMATIVA';
  titulo: string;
  mensaje: string;
  evidencia: string;
  sugerenciaAccion: string;
  moduloSugerido: string;
}

export interface AssistantFAQItem {
  id: string;
  pregunta: string;
  categoria: 'CONFIGURACION' | 'DATOS' | 'INDICADORES' | 'DIAGNOSTICO' | 'SIGUIENTE_PASO';
}

export interface OnboardingState {
  currentStep: OnboardingStepId;
  completedSteps: OnboardingStepId[];
  lastVisitedStep: OnboardingStepId;
  isCompleted: boolean;
  updatedAt: string;
}
