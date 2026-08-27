/**
 * CENTRO EJECUTIVO 360 & EXPERIENCIA SAAS - TYPES (Fase 9)
 * Definición de tipos unificada para la visión 360, alertas centrales,
 * centro de acciones, perspectivas por rol (RBAC) e inteligencia ejecutiva.
 */

export type RolePerspective = 
  | 'ALTA_DIRECCION'
  | 'GESTION_HUMANA'
  | 'SST'
  | 'AUDITOR'
  | 'CONSULTOR'
  | 'USUARIO';

export type AlertCategory = 
  | 'SST'
  | 'CALIDAD_DATOS'
  | 'INDICADORES'
  | 'ONBOARDING'
  | 'LICENCIAMIENTO'
  | 'CAPACIDAD_SAAS'
  | 'IA_GOBERNANZA'
  | 'ACCIONES_PENDIENTES'
  | 'CUMPLIMIENTO';

export type AlertSeverity = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';

export type AlertStatus = 'NUEVA' | 'EN_REVISION' | 'EN_GESTION' | 'CERRADA';

export interface ExecutiveAlert {
  id: string;
  companyId: string;
  categoria: AlertCategory;
  severidad: AlertSeverity;
  titulo: string;
  descripcion: string;
  evidencia: string;
  fecha: string;
  estado: AlertStatus;
  moduloOrigen: string;
  accionRecomendada: string;
  historialEstados?: Array<{
    estadoAnterior: AlertStatus;
    estadoNuevo: AlertStatus;
    fecha: string;
    usuario: string;
    justificacion?: string;
  }>;
}

export type ActionStatus = 'PENDIENTE' | 'EN_GESTION' | 'VENCIDA' | 'COMPLETADA';
export type ActionPriority = 'ALTA' | 'MEDIA' | 'BAJA';

export interface ExecutiveAction {
  id: string;
  companyId: string;
  titulo: string;
  descripcion: string;
  origen: string;
  responsable: string;
  prioridad: ActionPriority;
  fechaLimite: string;
  evidencia: string;
  estado: ActionStatus;
  moduloRelacionado: string;
  impactoHealthScore?: number;
  historial?: Array<{
    fecha: string;
    usuario: string;
    accion: string;
    nota?: string;
  }>;
}

export interface ExecutiveInsight {
  id: string;
  titulo: string;
  categoria: 'RIESGO' | 'OPORTUNIDAD' | 'CUMPLIMIENTO' | 'EFICIENCIA';
  resumen: string;
  contextoIndicador?: string;
  evidenciaReal: string;
  sugerenciaAccion: string;
  moduloDestino: string;
  prioridad: 'ALTA' | 'MEDIA' | 'INFORMATIVA';
  requiereValidacionHumana: true; // Human-in-the-loop mandate
}

export interface Executive360AuditLog {
  id: string;
  companyId: string;
  fecha: string;
  usuario: string;
  rol: string;
  accion: string;
  valorAnterior?: string;
  valorNuevo?: string;
  justificacion?: string;
}

export type CentroEjecutivoTab = 
  | 'resumen'
  | 'health_score'
  | 'indicadores_sst'
  | 'riesgos'
  | 'calidad_datos'
  | 'cumplimiento'
  | 'acciones'
  | 'inteligencia_ia'
  | 'licenciamiento'
  | 'tendencias';
