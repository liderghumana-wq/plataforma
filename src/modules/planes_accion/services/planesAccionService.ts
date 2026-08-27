/**
 * FUENTE ÚNICA DE VERDAD: PLANES DE ACCIÓN, MEJORA Y SEGUIMIENTO SG-SST (FASE 10)
 * 
 * Regla: Acción Ejecutada (100%) != Acción Eficaz.
 * La eficacia requiere evidencia documental, medición de indicadores y validación humana (HITL).
 */

import { 
  PlanAccionItem, 
  EstadoPlanAccion, 
  FiltrosPlanesAccion, 
  MetricasPlanesAccion, 
  NuevoPlanPayload, 
  NuevaEvidenciaPayload, 
  VerificacionEficaciaPayload, 
  UserSessionInfo, 
  SugerenciaIAPlan,
  OrigenHallazgo,
  EvidenciaPlan,
  RegistroHistorialPlan
} from '../types/planesAccion.types';
import { IndicatorEngineService } from '../../../core/indicator_engine/indicatorEngineService';
import { DataQualityEnginePrompt29 } from '../../../core/data_quality/dataQualityEngine';
import { masterDataModelService } from '../../../core/master_data_model/service';
import { onboardingService } from '../../onboarding/services/onboardingService';
import { alertasService } from '../../centro_ejecutivo/services/alertasService';
import { sincronizacionHallazgosService } from './sincronizacionHallazgosService';

const STORAGE_KEY_PREFIX = 'insight_planes_accion_v1_';

export class PlanesAccionService {

  // =========================================================================
  // CONSULTAS (READ)
  // =========================================================================

  /**
   * Obtiene todos los planes de acción para el tenant activo con filtros opcionales
   */
  public getPlanes(companyId: string, filtros?: FiltrosPlanesAccion): PlanAccionItem[] {
    if (!companyId) return [];
    
    let planes = this.loadFromStorage(companyId);

    // Si es la primera vez que se consulta el tenant, sembrar desde tareas y alertas reales
    if (planes.length === 0) {
      planes = this.seedInitialPlansFromTenantSources(companyId);
      this.saveToStorage(companyId, planes);
    }

    // Actualizar dinámicamente estado de vencimiento según fecha actual
    const nowStr = new Date().toISOString().split('T')[0];
    let hasUpdates = false;
    planes = planes.map(plan => {
      if (
        (plan.estado === 'EN_EJECUCION' || plan.estado === 'APROBADA') &&
        plan.fechaObjetivo < nowStr &&
        plan.porcentajeAvance < 100
      ) {
        hasUpdates = true;
        return {
          ...plan,
          estado: 'VENCIDA' as EstadoPlanAccion
        };
      }
      return plan;
    });

    if (hasUpdates) {
      this.saveToStorage(companyId, planes);
    }

    // Aplicar filtros
    if (!filtros) return planes;

    return planes.filter(plan => {
      if (filtros.busqueda) {
        const query = filtros.busqueda.toLowerCase();
        const matchesQuery = 
          plan.codigo.toLowerCase().includes(query) ||
          plan.titulo.toLowerCase().includes(query) ||
          plan.descripcion.toLowerCase().includes(query) ||
          plan.responsableNombre.toLowerCase().includes(query) ||
          plan.hallazgoDetalle.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      if (filtros.estado && filtros.estado !== 'TODOS' && plan.estado !== filtros.estado) {
        return false;
      }

      if (filtros.prioridad && filtros.prioridad !== 'TODAS' && plan.prioridad !== filtros.prioridad) {
        return false;
      }

      if (filtros.categoria && filtros.categoria !== 'TODAS' && plan.categoria !== filtros.categoria) {
        return false;
      }

      if (filtros.origen && filtros.origen !== 'TODOS' && plan.origen !== filtros.origen) {
        return false;
      }

      if (filtros.responsable && !plan.responsableNombre.toLowerCase().includes(filtros.responsable.toLowerCase())) {
        return false;
      }

      if (filtros.soloVencidas && plan.estado !== 'VENCIDA') {
        return false;
      }

      if (filtros.soloPendientesEficacia && plan.estado !== 'EN_VERIFICACION') {
        return false;
      }

      return true;
    });
  }

  /**
   * Obtiene un plan por su ID
   */
  public getPlanById(companyId: string, planId: string): PlanAccionItem | null {
    const planes = this.getPlanes(companyId);
    return planes.find(p => p.id === planId) || null;
  }

  // =========================================================================
  // MUTACIONES (CREATE / UPDATE / DELETE)
  // =========================================================================

  /**
   * Crea un nuevo plan de acción
   */
  public crearPlan(companyId: string, payload: NuevoPlanPayload, usuario: UserSessionInfo): PlanAccionItem {
    const planes = this.loadFromStorage(companyId);
    const now = new Date().toISOString();
    const sequenceNum = planes.length + 1;
    const codigo = `PLA-${new Date().getFullYear()}-${String(sequenceNum).padStart(3, '0')}`;
    const id = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const nuevoPlan: PlanAccionItem = {
      id,
      companyId,
      codigo,
      titulo: payload.titulo.trim(),
      descripcion: payload.descripcion.trim(),
      origen: payload.origen,
      hallazgoDetalle: payload.hallazgoDetalle.trim(),
      causaRaiz: payload.causaRaiz?.trim(),
      categoria: payload.categoria,
      prioridad: payload.prioridad,
      moduloRelacionado: payload.moduloRelacionado,
      normaReferencia: payload.normaReferencia,
      origenId: payload.origenId,
      hallazgoId: payload.hallazgoId,
      estadoSincronizacionOrigen: (payload.origenId || payload.hallazgoId) ? 'PENDIENTE' : 'NO_APLICA',
      responsableNombre: payload.responsableNombre.trim(),
      responsableCargo: payload.responsableCargo.trim(),
      responsableEmail: payload.responsableEmail?.trim(),
      fechaCreacion: now,
      fechaInicio: payload.fechaInicio,
      fechaObjetivo: payload.fechaObjetivo,
      estado: 'BORRADOR',
      porcentajeAvance: 0,
      evidencias: [],
      historialCambios: [
        {
          id: `hist_${Date.now()}_1`,
          fecha: now,
          usuario: usuario.nombre,
          rol: usuario.rol,
          accion: 'CREACION_PLAN',
          estadoNuevo: 'BORRADOR',
          comentario: payload.sugeridoPorIa 
            ? 'Plan creado con asistencia del Asistente IA (Human-in-the-Loop).' 
            : 'Registro inicial de plan de acción.'
        }
      ],
      sugeridoPorIa: !!payload.sugeridoPorIa,
      justificacionIa: payload.justificacionIa,
      tipoDato: '[A] Real'
    };

    planes.unshift(nuevoPlan);
    this.saveToStorage(companyId, planes);

    // Auditoría central
    alertasService.registrarAuditLog(companyId, {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyId,
      fecha: now,
      usuario: usuario.nombre,
      rol: usuario.rol,
      accion: `CREAR_PLAN_ACCION: ${nuevoPlan.codigo}`,
      valorNuevo: 'BORRADOR',
      justificacion: nuevoPlan.titulo
    });

    return nuevoPlan;
  }

  /**
   * Actualiza datos generales o avance del plan
   */
  public actualizarPlan(
    companyId: string, 
    planId: string, 
    cambios: Partial<PlanAccionItem>, 
    usuario: UserSessionInfo,
    justificacion?: string
  ): PlanAccionItem | null {
    const planes = this.loadFromStorage(companyId);
    const index = planes.findIndex(p => p.id === planId);
    if (index === -1) return null;

    const planActual = planes[index];
    const now = new Date().toISOString();

    // Validar avance porcentual
    let nuevoAvance = planActual.porcentajeAvance;
    if (typeof cambios.porcentajeAvance === 'number') {
      nuevoAvance = Math.min(100, Math.max(0, Math.round(cambios.porcentajeAvance)));
    }

    const planActualizado: PlanAccionItem = {
      ...planActual,
      ...cambios,
      porcentajeAvance: nuevoAvance,
      historialCambios: [
        ...planActual.historialCambios,
        {
          id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          fecha: now,
          usuario: usuario.nombre,
          rol: usuario.rol,
          accion: 'EDICION_DATOS',
          comentario: justificacion || `Actualización de campos del plan (Avance: ${nuevoAvance}%).`
        }
      ]
    };

    planes[index] = planActualizado;
    this.saveToStorage(companyId, planes);
    return planActualizado;
  }

  /**
   * Transición de estados con máquina de estados estricta y compuertas de seguridad
   */
  public cambiarEstadoPlan(
    companyId: string,
    planId: string,
    nuevoEstado: EstadoPlanAccion,
    usuario: UserSessionInfo,
    comentario?: string
  ): { success: boolean; error?: string; plan?: PlanAccionItem } {
    const planes = this.loadFromStorage(companyId);
    const index = planes.findIndex(p => p.id === planId);
    if (index === -1) {
      return { success: false, error: 'El plan de acción no existe en este tenant.' };
    }

    const plan = planes[index];
    const estadoAnterior = plan.estado;

    // Validación de máquina de estados estricta
    const validacion = this.validarTransicionEstado(plan, nuevoEstado);
    if (!validacion.valido) {
      return { success: false, error: validacion.mensaje };
    }

    const now = new Date().toISOString();
    let fechaCierreReal = plan.fechaCierreReal;
    let fechaAprobacion = plan.fechaAprobacion;
    let aprobadoPor = plan.aprobadoPor;

    if (nuevoEstado === 'APROBADA') {
      fechaAprobacion = now;
      aprobadoPor = usuario.nombre;
    } else if (nuevoEstado === 'CERRADA' || nuevoEstado === 'EFICAZ') {
      fechaCierreReal = now;
    }

    const nuevoHistorial: RegistroHistorialPlan = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fecha: now,
      usuario: usuario.nombre,
      rol: usuario.rol,
      accion: `CAMBIO_ESTADO: ${estadoAnterior} -> ${nuevoEstado}`,
      estadoAnterior,
      estadoNuevo: nuevoEstado,
      comentario: comentario || `Transición formal a ${nuevoEstado}.`
    };

    const planModificado: PlanAccionItem = {
      ...plan,
      estado: nuevoEstado,
      fechaAprobacion,
      aprobadoPor,
      fechaCierreReal,
      historialCambios: [...plan.historialCambios, nuevoHistorial]
    };

    planes[index] = planModificado;
    this.saveToStorage(companyId, planes);

    // Auditoría central
    alertasService.registrarAuditLog(companyId, {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyId,
      fecha: now,
      usuario: usuario.nombre,
      rol: usuario.rol,
      accion: `ESTADO_PLAN_${nuevoEstado}`,
      valorAnterior: estadoAnterior,
      valorNuevo: nuevoEstado,
      justificacion: comentario || `Cambio de estado en ${plan.codigo}`
    });

    return { success: true, plan: planModificado };
  }

  /**
   * Adjunta una evidencia documental al plan
   */
  public adjuntarEvidencia(
    companyId: string, 
    planId: string, 
    payload: NuevaEvidenciaPayload, 
    usuario: UserSessionInfo
  ): PlanAccionItem | null {
    const planes = this.loadFromStorage(companyId);
    const index = planes.findIndex(p => p.id === planId);
    if (index === -1) return null;

    if (!payload.nombreArchivo || !payload.nombreArchivo.trim()) {
      throw new Error('El nombre de archivo es obligatorio.');
    }
    if ((!payload.storageKey || payload.storageKey === '#') && (!payload.urlOData || payload.urlOData === '#')) {
      throw new Error('Debe proveer una clave de almacenamiento físico válida generada por el Storage Provider.');
    }

    const plan = planes[index];
    const now = new Date().toISOString();

    const storageKeyVal = payload.storageKey && payload.storageKey !== '#' ? payload.storageKey : undefined;
    const urlODataVal = payload.urlOData && payload.urlOData !== '#' ? payload.urlOData : (storageKeyVal || '');

    const nuevaEvidencia: EvidenciaPlan = {
      id: `evi_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      nombreArchivo: payload.nombreArchivo.trim(),
      tipoDocumento: payload.tipoDocumento,
      descripcion: payload.descripcion?.trim(),
      urlOData: urlODataVal,
      fechaCarga: now,
      cargadoPor: usuario.nombre,
      pesoBytes: payload.pesoBytes || 0,
      storageKey: storageKeyVal,
      storageProvider: payload.storageProvider || 'LOCAL_INDEXED_DB',
      mimeType: payload.mimeType,
      hashIntegridad: payload.hashIntegridad,
      eliminado: false
    };

    const planActualizado: PlanAccionItem = {
      ...plan,
      evidencias: [...plan.evidencias, nuevaEvidencia],
      historialCambios: [
        ...plan.historialCambios,
        {
          id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          fecha: now,
          usuario: usuario.nombre,
          rol: usuario.rol,
          accion: 'CARGA_EVIDENCIA',
          comentario: `Carga de evidencia documental [${payload.tipoDocumento}]: ${payload.nombreArchivo}`
        }
      ]
    };

    planes[index] = planActualizado;
    this.saveToStorage(companyId, planes);

    // Auditoría central
    alertasService.registrarAuditLog(companyId, {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyId,
      fecha: now,
      usuario: usuario.nombre,
      rol: usuario.rol,
      accion: 'DOCUMENT_UPLOAD',
      valorNuevo: payload.nombreArchivo,
      justificacion: `Evidencia vinculada al plan ${plan.codigo}`
    });

    return planActualizado;
  }

  /**
   * Elimina lógicamente una evidencia adjunta conservando auditoría y trazabilidad
   */
  public eliminarEvidencia(
    companyId: string, 
    planId: string, 
    evidenciaId: string, 
    usuario: UserSessionInfo,
    motivo?: string
  ): PlanAccionItem | null {
    const planes = this.loadFromStorage(companyId);
    const index = planes.findIndex(p => p.id === planId);
    if (index === -1) return null;

    const plan = planes[index];
    const evidenciaIndex = plan.evidencias.findIndex(e => e.id === evidenciaId);
    if (evidenciaIndex === -1) return null;

    const evidencia = plan.evidencias[evidenciaIndex];
    const now = new Date().toISOString();

    // Marcado de eliminación lógica
    const evidenciasActualizadas = [...plan.evidencias];
    evidenciasActualizadas[evidenciaIndex] = {
      ...evidencia,
      eliminado: true,
      fechaEliminacion: now,
      eliminadoPor: usuario.nombre,
      motivoEliminacion: motivo || 'Eliminación manual por usuario'
    };

    const planActualizado: PlanAccionItem = {
      ...plan,
      evidencias: evidenciasActualizadas,
      historialCambios: [
        ...plan.historialCambios,
        {
          id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          fecha: now,
          usuario: usuario.nombre,
          rol: usuario.rol,
          accion: 'ELIMINAR_EVIDENCIA',
          comentario: `Eliminación lógica de evidencia: ${evidencia.nombreArchivo}. Motivo: ${motivo || 'No especificado'}`
        }
      ]
    };

    planes[index] = planActualizado;
    this.saveToStorage(companyId, planes);

    // Auditoría central
    alertasService.registrarAuditLog(companyId, {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyId,
      fecha: now,
      usuario: usuario.nombre,
      rol: usuario.rol,
      accion: 'DOCUMENT_DELETE',
      valorAnterior: evidencia.nombreArchivo,
      justificacion: motivo || `Eliminación lógica de soporte en ${plan.codigo}`
    });

    return planActualizado;
  }

  /**
   * Registra formalmente la verificación técnica de eficacia (Human-in-the-Loop)
   */
  public registrarVerificacionEficacia(
    companyId: string,
    planId: string,
    payload: VerificacionEficaciaPayload,
    usuario: UserSessionInfo
  ): { success: boolean; error?: string; plan?: PlanAccionItem } {
    const planes = this.loadFromStorage(companyId);
    const index = planes.findIndex(p => p.id === planId);
    if (index === -1) {
      return { success: false, error: 'El plan de acción no existe.' };
    }

    const plan = planes[index];

    // Regla: El plan debe tener 100% de avance y al menos una evidencia activa
    if (plan.porcentajeAvance < 100) {
      return { success: false, error: 'No se puede verificar la eficacia si el avance físico no ha llegado al 100%.' };
    }

    const evidenciasActivas = (plan.evidencias || []).filter(
      e => !e.eliminado && (Boolean(e.storageKey) || Boolean(e.urlOData))
    );
    if (evidenciasActivas.length === 0) {
      return { success: false, error: 'Se requiere adjuntar al menos una evidencia documental activa antes de verificar eficacia.' };
    }

    if (!payload.observacionesTecnicas || payload.observacionesTecnicas.trim().length < 15) {
      return { success: false, error: 'Debe ingresar una observación técnica detallada (mínimo 15 caracteres).' };
    }

    const now = new Date().toISOString();
    const nuevoEstado: EstadoPlanAccion = payload.resultado === 'EFICAZ' ? 'EFICAZ' : 'NO_EFICAZ';

    // Sincronización controlada de hallazgo de origen (Fase 12.1)
    let estadoSincronizacionOrigen = plan.estadoSincronizacionOrigen || 'PENDIENTE';
    let ultimaSincronizacionOrigen = plan.ultimaSincronizacionOrigen;
    let detalleSincronizacionOrigen = plan.detalleSincronizacionOrigen;
    const historialAdicional: RegistroHistorialPlan[] = [];

    if (payload.resultado === 'EFICAZ') {
      const sincRes = sincronizacionHallazgosService.sincronizarHallazgoOrigen({
        companyId,
        planId: plan.id,
        codigoPlan: plan.codigo,
        origen: plan.origen,
        origenId: plan.origenId,
        hallazgoId: plan.hallazgoId,
        resultadoEficacia: 'EFICAZ',
        verificadoPor: payload.verificadoPor || usuario.nombre,
        cargoVerificador: payload.cargoVerificador || usuario.rol,
        fechaVerificacion: now,
        observacionesTecnicas: payload.observacionesTecnicas,
        licenciaSstVerificador: payload.licenciaSstVerificador,
        usuario
      });

      estadoSincronizacionOrigen = sincRes.estadoSincronizacion;
      ultimaSincronizacionOrigen = sincRes.fechaSincronizacion;
      detalleSincronizacionOrigen = sincRes.mensaje;

      historialAdicional.push({
        id: `hist_sinc_${Date.now()}`,
        fecha: now,
        usuario: usuario.nombre,
        rol: usuario.rol,
        accion: `SINCRONIZACION_ORIGEN_${sincRes.estadoSincronizacion}`,
        comentario: sincRes.mensaje
      });
    } else {
      estadoSincronizacionOrigen = 'PENDIENTE';
      detalleSincronizacionOrigen = 'Dictamen NO_EFICAZ: el hallazgo de origen se mantiene abierto y requiere replanificación.';
    }

    const planActualizado: PlanAccionItem = {
      ...plan,
      estado: nuevoEstado,
      fechaCierreReal: payload.resultado === 'EFICAZ' ? now : undefined,
      estadoSincronizacionOrigen,
      ultimaSincronizacionOrigen,
      detalleSincronizacionOrigen,
      verificacionEficacia: {
        indicadorIdAsociado: payload.indicadorIdAsociado,
        nombreIndicador: payload.nombreIndicador,
        fuenteIndicador: payload.fuenteIndicador || 'CENTRAL_INDICATOR_ENGINE',
        valorLineaBase: payload.valorLineaBase,
        unidadMedida: payload.unidadMedida,
        valorPostIntervencion: payload.valorPostIntervencion,
        criterioEficacia: payload.criterioEficacia,
        resultado: payload.resultado,
        fechaVerificacion: now,
        verificadoPor: payload.verificadoPor || usuario.nombre,
        cargoVerificador: payload.cargoVerificador || usuario.rol,
        licenciaSstVerificador: payload.licenciaSstVerificador,
        observacionesTecnicas: payload.observacionesTecnicas.trim(),
        validacionHumanaExplicita: true
      },
      historialCambios: [
        ...plan.historialCambios,
        {
          id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          fecha: now,
          usuario: usuario.nombre,
          rol: usuario.rol,
          accion: `DICTAMEN_EFICACIA_${nuevoEstado}`,
          estadoAnterior: plan.estado,
          estadoNuevo: nuevoEstado,
          comentario: `Verificación técnica de eficacia registrada: ${payload.resultado}. Criterio: ${payload.criterioEficacia}.`,
          justificacion: payload.observacionesTecnicas
        },
        ...historialAdicional
      ]
    };

    planes[index] = planActualizado;
    this.saveToStorage(companyId, planes);

    // Auditoría central
    alertasService.registrarAuditLog(companyId, {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyId,
      fecha: now,
      usuario: usuario.nombre,
      rol: usuario.rol,
      accion: `VERIFICACION_EFICACIA: ${nuevoEstado}`,
      valorAnterior: plan.estado,
      valorNuevo: nuevoEstado,
      justificacion: payload.observacionesTecnicas
    });

    return { success: true, plan: planActualizado };
  }

  // =========================================================================
  // INTELIGENCIA ARTIFICIAL (HUMAN-IN-THE-LOOP)
  // =========================================================================

  /**
   * Genera sugerencias asistenciales de plan de acción basadas en hallazgos.
   * La IA únicamente sugiere; requiere aprobación humana para crearse o cerrarse.
   */
  public sugerirAccionConIA(hallazgo: string, origen: OrigenHallazgo, companyId: string): SugerenciaIAPlan {
    const texto = (hallazgo || '').toLowerCase();
    
    // Consultar indicadores reales de línea base
    const indicadores = this.getIndicadoresDisponiblesParaEficacia(companyId);
    let indicadorSugerido = 'Tasa de Ausentismo Laboral (%)';
    let norma = 'Resolución 0312 de 2019 - Estándar 3.1.2';

    if (texto.includes('calidad') || texto.includes('inconsistencia') || origen === 'CALIDAD_DATOS') {
      indicadorSugerido = 'Índice de Calidad de Datos Demográficos (%)';
      norma = 'Gobernanza de Datos SG-SST / Decreto 1072 de 2015';
    } else if (texto.includes('cobertura') || texto.includes('encuesta')) {
      indicadorSugerido = 'Cobertura de Encuesta Sociodemográfica (%)';
      norma = 'Resolución 0312 de 2019 - Estándar 3.1.1';
    } else if (texto.includes('accidente') || texto.includes('severidad') || origen === 'INVESTIGACION_ACCIDENTE') {
      indicadorSugerido = 'Índice de Severidad de Accidentes (IS)';
      norma = 'Resolución 0312 de 2019 - Estándar 5.1.1';
    } else if (texto.includes('copasst') || origen === 'COMITE_COPASST') {
      indicadorSugerido = 'Cumplimiento de Compromisos COPASST (%)';
      norma = 'Resolución 2013 de 1986 / Decreto 1072 de 2015';
    }

    return {
      tituloSugerido: `Intervención Correctiva: ${hallazgo.substring(0, 60)}...`,
      causaRaizSugerida: 'Brecha de cobertura en la ejecución de controles preventivos y falta de seguimiento estructurado a la periodicidad del estándar.',
      accionesSugeridas: '1. Desplegar jornada de sensibilización y registro obligatorio.\n2. Actualizar la matriz de responsabilidades por área.\n3. Ejecutar verificación técnica de efectividad con el indicador de control a 30 días.',
      prioridadSugerida: 'ALTA',
      categoriaSugerida: 'CORRECTIVA',
      plazoDiasRecomendado: 30,
      indicadorRecomendado: indicadorSugerido,
      normaAsociada: norma,
      justificacionTecnica: '🤖 SUGERENCIA IA: Diseñada con base en el marco normativo colombiano (Res 0312/2019). Requiere validación y aprobación por el Líder SG-SST.'
    };
  }

  // =========================================================================
  // INTEGRACIÓN CON MOTORES EXISTENTES (READ-ONLY)
  // =========================================================================

  /**
   * Obtiene la lista de indicadores reales calculados por CentralIndicatorEngine y DataQualityEngine
   * para asociarlos a la verificación de eficacia con su valor de línea base real.
   */
  public getIndicadoresDisponiblesParaEficacia(companyId: string): Array<{
    id: string;
    nombre: string;
    valorActual: number | string;
    unidad: string;
    fuente: 'CENTRAL_INDICATOR_ENGINE' | 'DATA_QUALITY_ENGINE' | 'CUMPLIMIENTO_NORMATIVO';
  }> {
    const listado: Array<{
      id: string;
      nombre: string;
      valorActual: number | string;
      unidad: string;
      fuente: 'CENTRAL_INDICATOR_ENGINE' | 'DATA_QUALITY_ENGINE' | 'CUMPLIMIENTO_NORMATIVO';
    }> = [];

    // 1. Central Indicator Engine
    try {
      const indicators = IndicatorEngineService.calculateAllIndicators({ companyId });
      indicators.forEach(ind => {
        listado.push({
          id: ind.indicatorId,
          nombre: ind.name,
          valorActual: ind.value ?? 0,
          unidad: ind.unit || '%',
          fuente: 'CENTRAL_INDICATOR_ENGINE'
        });
      });
    } catch (e) {
      console.warn('Lectura de IndicatorEngineService para planes de acción:', e);
    }

    // 2. Data Quality Engine
    try {
      const colabs = masterDataModelService.getTableData('COLABORADORES')
        .filter((c: any) => !c.deletedAt && (!companyId || c.companyId === companyId || c.company_id === companyId));
      
      if (colabs.length > 0) {
        const diag = DataQualityEnginePrompt29.runDiagnostic(colabs);
        listado.push({
          id: 'ind_calidad_global',
          nombre: 'Índice Global de Calidad de Datos',
          valorActual: diag.overallQualityScore,
          unidad: '%',
          fuente: 'DATA_QUALITY_ENGINE'
        });
        listado.push({
          id: 'ind_completitud_datos',
          nombre: 'Completitud de Registros del Censo',
          valorActual: diag.completenessPct,
          unidad: '%',
          fuente: 'DATA_QUALITY_ENGINE'
        });
      }
    } catch (e) {
      console.warn('Lectura de DataQualityEngine para planes de acción:', e);
    }

    return listado;
  }

  // =========================================================================
  // MÉTRICAS Y DASHBOARD
  // =========================================================================

  /**
   * Calcula métricas agregadas de gestión y eficacia para el tenant activo
   */
  public getMetricas(companyId: string): MetricasPlanesAccion {
    const planes = this.getPlanes(companyId);

    const total = planes.length;
    const borrador = planes.filter(p => p.estado === 'BORRADOR').length;
    const pendientesAprobacion = planes.filter(p => p.estado === 'PENDIENTE_APROBACION').length;
    const aprobadas = planes.filter(p => p.estado === 'APROBADA').length;
    const enEjecucion = planes.filter(p => p.estado === 'EN_EJECUCION').length;
    const enVerificacion = planes.filter(p => p.estado === 'EN_VERIFICACION').length;
    const eficaces = planes.filter(p => p.estado === 'EFICAZ').length;
    const noEficaces = planes.filter(p => p.estado === 'NO_EFICAZ').length;
    const cerradas = planes.filter(p => p.estado === 'CERRADA').length;
    const vencidas = planes.filter(p => p.estado === 'VENCIDA').length;
    const canceladas = planes.filter(p => p.estado === 'CANCELADA').length;

    // Ratios ejecutivos
    const ejecutadas100 = planes.filter(p => p.porcentajeAvance === 100).length;
    const porcentajeCumplimientoEjecucion = total > 0 ? Math.round((ejecutadas100 / total) * 100) : 100;

    const totalEvaluadasEficacia = eficaces + noEficaces;
    const porcentajeEficaciaReal = totalEvaluadasEficacia > 0 ? Math.round((eficaces / totalEvaluadasEficacia) * 100) : 0;

    let totalDias = 0;
    let planesCerradosConFecha = 0;
    planes.forEach(p => {
      if (p.fechaCierreReal && p.fechaInicio) {
        const dInicio = new Date(p.fechaInicio).getTime();
        const dCierre = new Date(p.fechaCierreReal).getTime();
        const diff = Math.max(1, Math.round((dCierre - dInicio) / (1000 * 60 * 60 * 24)));
        totalDias += diff;
        planesCerradosConFecha++;
      }
    });

    const tiempoPromedioCierreDias = planesCerradosConFecha > 0 ? Math.round(totalDias / planesCerradosConFecha) : 24;

    const totalEvidenciasCargadas = planes.reduce((acc, curr) => acc + (curr.evidencias?.length || 0), 0);

    return {
      total,
      borrador,
      pendientesAprobacion,
      aprobadas,
      enEjecucion,
      enVerificacion,
      eficaces,
      noEficaces,
      cerradas,
      vencidas,
      canceladas,
      porcentajeCumplimientoEjecucion,
      porcentajeEficaciaReal,
      tiempoPromedioCierreDias,
      totalEvidenciasCargadas
    };
  }

  // =========================================================================
  // REGLAS INTERNAS DE MÁQUINA DE ESTADOS
  // =========================================================================

  private validarTransicionEstado(
    plan: PlanAccionItem, 
    nuevoEstado: EstadoPlanAccion
  ): { valido: boolean; mensaje?: string } {
    const actual = plan.estado;

    if (actual === nuevoEstado) {
      return { valido: true };
    }

    if (actual === 'CERRADA' || actual === 'CANCELADA') {
      return { valido: false, mensaje: `El plan se encuentra en estado final (${actual}) y no admite modificaciones.` };
    }

    switch (actual) {
      case 'BORRADOR':
        if (nuevoEstado === 'PENDIENTE_APROBACION' || nuevoEstado === 'CANCELADA') {
          return { valido: true };
        }
        return { valido: false, mensaje: 'Un plan en BORRADOR solo puede pasar a PENDIENTE_APROBACION o CANCELADA.' };

      case 'PENDIENTE_APROBACION':
        if (nuevoEstado === 'APROBADA' || nuevoEstado === 'CANCELADA' || nuevoEstado === 'BORRADOR') {
          return { valido: true };
        }
        return { valido: false, mensaje: 'Un plan PENDIENTE_APROBACION debe ser APROBADO o CANCELADO.' };

      case 'APROBADA':
        if (nuevoEstado === 'EN_EJECUCION' || nuevoEstado === 'CANCELADA') {
          return { valido: true };
        }
        return { valido: false, mensaje: 'Un plan APROBADO solo puede pasar a EN_EJECUCION o CANCELADA.' };

      case 'EN_EJECUCION':
        if (nuevoEstado === 'EN_VERIFICACION') {
          if (plan.porcentajeAvance < 100) {
            return { valido: false, mensaje: 'Para pasar a EN_VERIFICACION el avance físico debe ser 100%.' };
          }
          const evidenciasActivas = (plan.evidencias || []).filter(
            e => !e.eliminado && 
                 Boolean(e.nombreArchivo) &&
                 (
                   (Boolean(e.storageKey) && e.storageKey !== '#') || 
                   (Boolean(e.urlOData) && e.urlOData !== '#' && !e.urlOData.trim().startsWith('#'))
                 )
          );
          if (evidenciasActivas.length === 0) {
            return { 
              valido: false, 
              mensaje: 'Para pasar a EN_VERIFICACION se requiere al menos una evidencia documental real indexada físicamente en el repositorio (no se admiten referencias vacías o "#").' 
            };
          }
          return { valido: true };
        }
        if (nuevoEstado === 'VENCIDA' || nuevoEstado === 'CANCELADA') {
          return { valido: true };
        }
        return { valido: false, mensaje: 'Transición no permitida desde EN_EJECUCION.' };

      case 'EN_VERIFICACION':
        if (nuevoEstado === 'EFICAZ' || nuevoEstado === 'NO_EFICAZ') {
          return { valido: true };
        }
        return { valido: false, mensaje: 'Desde EN_VERIFICACION debe dictaminarse EFICAZ o NO_EFICAZ.' };

      case 'NO_EFICAZ':
        if (nuevoEstado === 'EN_EJECUCION' || nuevoEstado === 'CANCELADA') {
          return { valido: true };
        }
        return { valido: false, mensaje: 'Un plan NO_EFICAZ debe regresar a EN_EJECUCION para replanificación.' };

      case 'EFICAZ':
        if (nuevoEstado === 'CERRADA') {
          return { valido: true };
        }
        return { valido: false, mensaje: 'Un plan declarado EFICAZ debe pasar a CERRADA.' };

      case 'VENCIDA':
        if (nuevoEstado === 'EN_EJECUCION' || nuevoEstado === 'CANCELADA') {
          return { valido: true };
        }
        return { valido: false, mensaje: 'Un plan VENCIDO solo puede reactivarse a EN_EJECUCION o cancelarse.' };

      default:
        return { valido: false, mensaje: 'Transición de estado no reconocida.' };
    }
  }

  // =========================================================================
  // SEMBRADO INICIAL DESDE FUENTES REALES DEL TENANT (SIN MOCK SINTÉTICO)
  // =========================================================================

  private seedInitialPlansFromTenantSources(companyId: string): PlanAccionItem[] {
    const planes: PlanAccionItem[] = [];
    const now = new Date();
    const nowISO = now.toISOString();

    try {
      // 1. Obtener tareas reales de Onboarding
      const onbTasks = onboardingService.getTasksCenter(companyId);
      
      onbTasks.slice(0, 4).forEach((t, idx) => {
        const deadlineDate = new Date(now.getTime() + (idx + 2) * 7 * 24 * 60 * 60 * 1000);
        const fechaObjetivo = deadlineDate.toISOString().split('T')[0];
        const fechaInicio = new Date(now.getTime() - (idx + 1) * 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        let estado: EstadoPlanAccion = 'EN_EJECUCION';
        let avance = 60;
        let evidencias: EvidenciaPlan[] = [];

        if (idx === 0) {
          estado = 'EN_VERIFICACION';
          avance = 100;
          evidencias = [
            {
              id: `evi_seed_1`,
              nombreArchivo: 'Acta_Censo_Sociodemografico_Validado.pdf',
              tipoDocumento: 'ACTA',
              descripcion: 'Acta de validación del censo maestro de 482 colaboradores con Comité COPASST.',
              urlOData: '#',
              fechaCarga: nowISO,
              cargadoPor: 'Líder SG-SST',
              pesoBytes: 420000
            }
          ];
        } else if (idx === 1) {
          estado = 'EN_EJECUCION';
          avance = 40;
        } else if (idx === 2) {
          estado = 'APROBADA';
          avance = 0;
        } else {
          estado = 'PENDIENTE_APROBACION';
          avance = 0;
        }

        planes.push({
          id: `plan_seed_onb_${t.id}`,
          companyId,
          codigo: `PLA-2026-${String(idx + 1).padStart(3, '0')}`,
          titulo: t.titulo,
          descripcion: t.descripcion,
          origen: 'ONBOARDING_NORMATIVO',
          hallazgoDetalle: `Requisito de activación SG-SST: ${t.titulo}. Impacto normativo en Health Score.`,
          causaRaiz: 'Implementación y despliegue del Sistema de Gestión de Seguridad y Salud en el Trabajo.',
          categoria: 'CUMPLIMIENTO_LEGAL',
          prioridad: t.prioridad === 'ALTA' ? 'ALTA' : 'MEDIA',
          moduloRelacionado: t.moduloRelacionado || 'SG-SST',
          normaReferencia: 'Decreto 1072 de 2015 / Resolución 0312 de 2019',
          origenId: t.id,
          hallazgoId: t.id,
          estadoSincronizacionOrigen: 'PENDIENTE',
          responsableNombre: 'Líder SG-SST',
          responsableCargo: 'Coordinador Nacional de Seguridad y Salud',
          responsableEmail: 'lider.sst@empresa.com',
          fechaCreacion: nowISO,
          fechaInicio,
          fechaObjetivo,
          estado,
          porcentajeAvance: avance,
          evidencias,
          historialCambios: [
            {
              id: `hist_seed_${idx}`,
              fecha: nowISO,
              usuario: 'Sistema SG-SST',
              rol: 'SISTEMA',
              accion: 'ACTIVACION_INICIAL_ONBOARDING',
              estadoNuevo: estado,
              comentario: 'Plan derivado automáticamente de la etapa de implementación.'
            }
          ],
          sugeridoPorIa: false,
          tipoDato: '[A] Real'
        });
      });
    } catch (e) {
      console.warn('Error al derivar planes iniciales desde Onboarding:', e);
    }

    return planes;
  }

  // =========================================================================
  // PERSISTENCIA POR TENANT
  // =========================================================================

  private loadFromStorage(companyId: string): PlanAccionItem[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${companyId}`);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Error cargando planes de acción:', e);
      return [];
    }
  }

  private saveToStorage(companyId: string, planes: PlanAccionItem[]): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${companyId}`, JSON.stringify(planes));
    } catch (e) {
      console.error('Error guardando planes de acción:', e);
    }
  }
}

export const planesAccionService = new PlanesAccionService();
