/**
 * ADAPTADOR DE ACCIONES EJECUTIVAS (CENTRO EJECUTIVO 360 - FASE 9 & 10)
 * 
 * Este servicio actúa estrictamente como FACHADA / ADAPTADOR de lectura y delegación
 * hacia planesAccionService (FUENTE ÚNICA DE VERDAD).
 * 
 * Regla de No Regresión: NO mantiene almacenamiento paralelo ni contadores duplicados.
 */

import { ExecutiveAction, ActionStatus, ActionPriority } from '../types/centroEjecutivo.types';
import { planesAccionService } from '../../planes_accion/services/planesAccionService';
import { PlanAccionItem, EstadoPlanAccion } from '../../planes_accion/types/planesAccion.types';

export class AccionesService {

  /**
   * Retorna todas las acciones ejecutivas mapeadas en tiempo real desde planesAccionService
   */
  public getAcciones(companyId: string): ExecutiveAction[] {
    const planes = planesAccionService.getPlanes(companyId);
    return planes.map(p => this.mapPlanToExecutiveAction(p));
  }

  /**
   * Cambia el estado de una acción delegando en planesAccionService
   */
  public cambiarEstadoAccion(
    companyId: string,
    accionId: string,
    nuevoEstado: ActionStatus,
    usuario: string,
    nota?: string
  ): ExecutiveAction | null {
    const plan = planesAccionService.getPlanById(companyId, accionId);
    if (!plan) return null;

    const userSession = {
      nombre: usuario || 'Líder SG-SST',
      rol: 'ALTA_DIRECCION'
    };

    let mappedState: EstadoPlanAccion = plan.estado;
    if (nuevoEstado === 'EN_GESTION') {
      if (plan.estado === 'BORRADOR' || plan.estado === 'PENDIENTE_APROBACION') {
        planesAccionService.cambiarEstadoPlan(companyId, plan.id, 'APROBADA', userSession, nota);
        mappedState = 'EN_EJECUCION';
      } else {
        mappedState = 'EN_EJECUCION';
      }
    } else if (nuevoEstado === 'PENDIENTE') {
      mappedState = 'PENDIENTE_APROBACION';
    } else if (nuevoEstado === 'COMPLETADA') {
      // Registrar avance 100%
      planesAccionService.actualizarPlan(companyId, plan.id, { porcentajeAvance: 100 }, userSession, nota);
      mappedState = plan.estado === 'EFICAZ' ? 'CERRADA' : 'EN_VERIFICACION';
    } else if (nuevoEstado === 'VENCIDA') {
      mappedState = 'VENCIDA';
    }

    planesAccionService.cambiarEstadoPlan(companyId, plan.id, mappedState, userSession, nota);
    const updated = planesAccionService.getPlanById(companyId, accionId);
    return updated ? this.mapPlanToExecutiveAction(updated) : null;
  }

  /**
   * Crea una nueva acción en planesAccionService
   */
  public crearAccion(
    companyId: string,
    accion: Omit<ExecutiveAction, 'id' | 'companyId' | 'historial'>,
    usuario: string
  ): ExecutiveAction {
    const now = new Date();
    const targetDate = accion.fechaLimite || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let prioridad: 'ALTA' | 'MEDIA' | 'BAJA' = 'MEDIA';
    if (accion.prioridad === 'ALTA') prioridad = 'ALTA';
    else if (accion.prioridad === 'BAJA') prioridad = 'BAJA';

    const created = planesAccionService.crearPlan(
      companyId,
      {
        titulo: accion.titulo,
        descripcion: accion.descripcion,
        origen: 'ALERTA_SST',
        hallazgoDetalle: accion.descripcion,
        categoria: 'CORRECTIVA',
        prioridad,
        moduloRelacionado: accion.moduloRelacionado || 'Centro Ejecutivo 360',
        responsableNombre: accion.responsable || 'Líder SG-SST',
        responsableCargo: 'Coordinador SG-SST',
        fechaInicio: now.toISOString().split('T')[0],
        fechaObjetivo: targetDate
      },
      {
        nombre: usuario || 'Líder SG-SST',
        rol: 'ALTA_DIRECCION'
      }
    );

    return this.mapPlanToExecutiveAction(created);
  }

  /**
   * Métricas de avance de acciones calculadas desde planesAccionService
   */
  public getMetricasAcciones(companyId: string) {
    const metricas = planesAccionService.getMetricas(companyId);
    const pendientes = metricas.borrador + metricas.pendientesAprobacion;
    const enGestion = metricas.aprobadas + metricas.enEjecucion + metricas.enVerificacion;
    const vencidas = metricas.vencidas + metricas.noEficaces;
    const completadas = metricas.eficaces + metricas.cerradas;
    const total = metricas.total;
    const porcentajeCumplimiento = metricas.porcentajeCumplimientoEjecucion;

    return {
      total,
      pendientes,
      enGestion,
      vencidas,
      completadas,
      porcentajeCumplimiento
    };
  }

  // =========================================================================
  // MAPPER INTERNO
  // =========================================================================

  private mapPlanToExecutiveAction(plan: PlanAccionItem): ExecutiveAction {
    let estado: ActionStatus = 'PENDIENTE';
    if (plan.estado === 'APROBADA' || plan.estado === 'EN_EJECUCION' || plan.estado === 'EN_VERIFICACION') {
      estado = 'EN_GESTION';
    } else if (plan.estado === 'VENCIDA' || plan.estado === 'NO_EFICAZ') {
      estado = 'VENCIDA';
    } else if (plan.estado === 'EFICAZ' || plan.estado === 'CERRADA') {
      estado = 'COMPLETADA';
    }

    let prioridad: ActionPriority = 'MEDIA';
    if (plan.prioridad === 'ALTA') prioridad = 'ALTA';
    else if (plan.prioridad === 'BAJA') prioridad = 'BAJA';

    const evidenciaTexto = plan.evidencias && plan.evidencias.length > 0
      ? `${plan.evidencias.length} evidencias cargadas (${plan.evidencias.map(e => e.tipoDocumento).join(', ')})`
      : `Avance físico: ${plan.porcentajeAvance}%. Sin evidencias aún.`;

    return {
      id: plan.id,
      companyId: plan.companyId,
      titulo: plan.titulo,
      descripcion: plan.descripcion,
      origen: plan.origen,
      responsable: plan.responsableNombre,
      prioridad,
      fechaLimite: plan.fechaObjetivo,
      evidencia: evidenciaTexto,
      estado,
      moduloRelacionado: plan.moduloRelacionado,
      impactoHealthScore: plan.prioridad === 'ALTA' ? 5 : 2,
      historial: plan.historialCambios?.map(h => ({
        fecha: h.fecha,
        usuario: h.usuario,
        accion: h.accion,
        nota: h.comentario
      }))
    };
  }
}

export const accionesService = new AccionesService();
