/**
 * MÓDULO DE GESTIÓN DE ACCIONES, PLANES DE MEJORA Y SEGUIMIENTO (FASE 10)
 * DEFINICIÓN DE TIPOS Y MODELO DE DATOS
 * 
 * Regla: Acción Ejecutada (100% avance) != Acción Eficaz (validada con evidencia y métrica).
 */

export type EstadoPlanAccion = 
  | 'BORRADOR'
  | 'PENDIENTE_APROBACION'
  | 'APROBADA'
  | 'EN_EJECUCION'
  | 'EN_VERIFICACION'
  | 'EFICAZ'
  | 'NO_EFICAZ'
  | 'CERRADA'
  | 'VENCIDA'
  | 'CANCELADA';

export type EstadoSincronizacionOrigen = 
  | 'PENDIENTE' 
  | 'SINCRONIZADO' 
  | 'NO_APLICA' 
  | 'RECHAZADO_ORIGEN_CERRADO' 
  | 'ERROR';

export type PrioridadPlan = 'ALTA' | 'MEDIA' | 'BAJA';

export type CategoriaPlan = 
  | 'CORRECTIVA' 
  | 'PREVENTIVA' 
  | 'MEJORA' 
  | 'CUMPLIMIENTO_LEGAL';

export type OrigenHallazgo = 
  | 'AUDITORIA_INTERNA'
  | 'AUTOEVALUACION_0312'
  | 'ALERTA_SST'
  | 'CALIDAD_DATOS'
  | 'INVESTIGACION_ACCIDENTE'
  | 'COMITE_COPASST'
  | 'COMITE_CONVIVENCIA'
  | 'SUGERENCIA_IA'
  | 'INSPECCION_SEGURIDAD'
  | 'ONBOARDING_NORMATIVO'
  | 'DIAGNOSTICO_SOCIODEMOGRAFICO';

export type TipoEvidencia = 
  | 'ACTA'
  | 'INFORME'
  | 'CERTIFICADO'
  | 'REGISTRO_FOTOGRAFICO'
  | 'MATRIZ_ACTUALIZADA'
  | 'OTRO';

export interface EvidenciaPlan {
  id: string;
  nombreArchivo: string;
  tipoDocumento: TipoEvidencia;
  descripcion?: string;
  urlOData: string;
  fechaCarga: string;
  cargadoPor: string;
  pesoBytes?: number;
  // Campos de gestión documental desacoplada (Fase 11)
  storageKey?: string;
  storageProvider?: 'LOCAL_INDEXED_DB' | 'S3_COMPLIANT' | 'GCS_COMPLIANT' | 'AZURE_BLOB';
  mimeType?: string;
  hashIntegridad?: string;
  eliminado?: boolean;
  fechaEliminacion?: string;
  eliminadoPor?: string;
  motivoEliminacion?: string;
}

export interface RegistroHistorialPlan {
  id: string;
  fecha: string;
  usuario: string;
  rol: string;
  accion: string;
  estadoAnterior?: EstadoPlanAccion;
  estadoNuevo?: EstadoPlanAccion;
  comentario?: string;
  justificacion?: string;
}

export interface VerificacionEficaciaData {
  indicadorIdAsociado?: string;
  nombreIndicador?: string;
  fuenteIndicador?: 'CENTRAL_INDICATOR_ENGINE' | 'DATA_QUALITY_ENGINE' | 'CUMPLIMIENTO_NORMATIVO' | 'MANUAL';
  valorLineaBase?: number | string;
  unidadMedida?: string;
  valorPostIntervencion?: number | string;
  criterioEficacia: string;
  resultado: 'EFICAZ' | 'NO_EFICAZ' | 'PARCIALMENTE_EFICAZ';
  fechaVerificacion: string;
  verificadoPor: string;
  cargoVerificador: string;
  licenciaSstVerificador?: string;
  observacionesTecnicas: string;
  validacionHumanaExplicita: true; // Human-in-the-Loop obligatorio
}

export interface PlanAccionItem {
  id: string;
  companyId: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  origen: OrigenHallazgo;
  hallazgoDetalle: string;
  causaRaiz?: string;
  
  // Clasificación
  categoria: CategoriaPlan;
  prioridad: PrioridadPlan;
  moduloRelacionado: string;
  normaReferencia?: string; // Ej: "Res. 0312/2019 Estándar 3.1.2"
  
  // Vinculación y Sincronización Estructurada con Origen (Fase 12.1)
  origenId?: string;
  hallazgoId?: string;
  estadoSincronizacionOrigen?: EstadoSincronizacionOrigen;
  ultimaSincronizacionOrigen?: string;
  detalleSincronizacionOrigen?: string;
  
  // Responsables y Fechas
  responsableNombre: string;
  responsableCargo: string;
  responsableEmail?: string;
  aprobadoPor?: string;
  fechaAprobacion?: string;
  fechaCreacion: string;
  fechaInicio: string;
  fechaObjetivo: string;
  fechaCierreReal?: string;
  
  // Estado y Avance
  estado: EstadoPlanAccion;
  porcentajeAvance: number; // 0 - 100
  
  // Evidencias e Historial
  evidencias: EvidenciaPlan[];
  historialCambios: RegistroHistorialPlan[];
  
  // Eficacia
  verificacionEficacia?: VerificacionEficaciaData;
  
  // IA HITL Metadata
  sugeridoPorIa: boolean;
  justificacionIa?: string;
  
  // Clasificación de datos
  tipoDato: '[A] Real' | '[C] Escenario';
}

export interface FiltrosPlanesAccion {
  busqueda?: string;
  estado?: EstadoPlanAccion | 'TODOS';
  prioridad?: PrioridadPlan | 'TODAS';
  categoria?: CategoriaPlan | 'TODAS';
  origen?: OrigenHallazgo | 'TODOS';
  responsable?: string;
  soloVencidas?: boolean;
  soloPendientesEficacia?: boolean;
}

export interface MetricasPlanesAccion {
  total: number;
  borrador: number;
  pendientesAprobacion: number;
  aprobadas: number;
  enEjecucion: number;
  enVerificacion: number;
  eficaces: number;
  noEficaces: number;
  cerradas: number;
  vencidas: number;
  canceladas: number;
  
  // Ratios ejecutivos
  porcentajeCumplimientoEjecucion: number; // Acciones en 100% o cerradas / total
  porcentajeEficaciaReal: number; // Acciones EFICAZ / (EFICAZ + NO_EFICAZ)
  tiempoPromedioCierreDias: number;
  totalEvidenciasCargadas: number;
}

export interface NuevoPlanPayload {
  titulo: string;
  descripcion: string;
  origen: OrigenHallazgo;
  hallazgoDetalle: string;
  causaRaiz?: string;
  origenId?: string;
  hallazgoId?: string;
  categoria: CategoriaPlan;
  prioridad: PrioridadPlan;
  moduloRelacionado: string;
  normaReferencia?: string;
  responsableNombre: string;
  responsableCargo: string;
  responsableEmail?: string;
  fechaInicio: string;
  fechaObjetivo: string;
  sugeridoPorIa?: boolean;
  justificacionIa?: string;
}

export interface NuevaEvidenciaPayload {
  nombreArchivo: string;
  tipoDocumento: TipoEvidencia;
  descripcion?: string;
  urlOData: string;
  pesoBytes?: number;
  storageKey?: string;
  storageProvider?: 'LOCAL_INDEXED_DB' | 'S3_COMPLIANT' | 'GCS_COMPLIANT' | 'AZURE_BLOB';
  mimeType?: string;
  hashIntegridad?: string;
}

export interface VerificacionEficaciaPayload {
  indicadorIdAsociado?: string;
  nombreIndicador?: string;
  fuenteIndicador?: 'CENTRAL_INDICATOR_ENGINE' | 'DATA_QUALITY_ENGINE' | 'CUMPLIMIENTO_NORMATIVO' | 'MANUAL';
  valorLineaBase?: number | string;
  unidadMedida?: string;
  valorPostIntervencion: number | string;
  criterioEficacia: string;
  resultado: 'EFICAZ' | 'NO_EFICAZ';
  verificadoPor: string;
  cargoVerificador: string;
  licenciaSstVerificador?: string;
  observacionesTecnicas: string;
}

export interface UserSessionInfo {
  nombre: string;
  email?: string;
  rol: string;
}

export interface SugerenciaIAPlan {
  tituloSugerido: string;
  causaRaizSugerida: string;
  accionesSugeridas: string;
  prioridadSugerida: PrioridadPlan;
  categoriaSugerida: CategoriaPlan;
  plazoDiasRecomendado: number;
  indicadorRecomendado: string;
  normaAsociada: string;
  justificacionTecnica: string;
}

export interface SincronizacionOrigenPayload {
  companyId: string;
  planId: string;
  codigoPlan: string;
  origen: OrigenHallazgo;
  origenId?: string;
  hallazgoId?: string;
  resultadoEficacia: 'EFICAZ' | 'NO_EFICAZ';
  verificadoPor: string;
  cargoVerificador?: string;
  fechaVerificacion: string;
  observacionesTecnicas: string;
  licenciaSstVerificador?: string;
  usuario: UserSessionInfo;
}

export interface ResultadoSincronizacionOrigen {
  success: boolean;
  estadoSincronizacion: EstadoSincronizacionOrigen;
  mensaje: string;
  moduloAfectado?: string;
  hallazgoIdAfectado?: string;
  estadoAnteriorHallazgo?: string;
  estadoNuevoHallazgo?: string;
  fechaSincronizacion: string;
}

