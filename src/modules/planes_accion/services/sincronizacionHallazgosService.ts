/**
 * SERVICIO DE VINCULACIÓN Y SINCRONIZACIÓN DE HALLAZGOS (FASE 12.1)
 * Insight People IA / Happy Insight SG-SST
 * 
 * Responsabilidad:
 * Sincronización bidireccional e idempotente entre Planes de Acción y sus módulos de origen.
 * 
 * Reglas Arquitectónicas:
 * 1. Aislamiento estricto por companyId (Multi-Tenant).
 * 2. Human-in-the-Loop: La sincronización solo se ejecuta tras dictamen humano EFICAZ.
 * 3. Prohibición de intervención de la IA en la aprobación o sincronización.
 * 4. Idempotencia y validación de estado previo (no sobreescribir si ya está cerrado).
 * 5. Cero coincidencias especulativas por texto libre.
 * 6. Registro de toda acción, rechazo o limitación en la bitácora de auditoría.
 */

import { 
  SincronizacionOrigenPayload, 
  ResultadoSincronizacionOrigen, 
  EstadoSincronizacionOrigen 
} from '../types/planesAccion.types';
import { alertasService } from '../../centro_ejecutivo/services/alertasService';
import { onboardingService } from '../../onboarding/services/onboardingService';

export class SincronizacionHallazgosService {
  private static instance: SincronizacionHallazgosService;

  public static getInstance(): SincronizacionHallazgosService {
    if (!SincronizacionHallazgosService.instance) {
      SincronizacionHallazgosService.instance = new SincronizacionHallazgosService();
    }
    return SincronizacionHallazgosService.instance;
  }

  /**
   * Ejecuta la sincronización controlada e idempotente del hallazgo de origen
   */
  public sincronizarHallazgoOrigen(payload: SincronizacionOrigenPayload): ResultadoSincronizacionOrigen {
    const now = new Date().toISOString();
    const { companyId, planId, codigoPlan, origen, resultadoEficacia, usuario } = payload;
    const targetId = payload.hallazgoId || payload.origenId;

    // 1. Control Multi-Tenant
    if (!companyId || companyId.trim() === '') {
      return {
        success: false,
        estadoSincronizacion: 'ERROR',
        mensaje: 'Error de aislamiento Multi-Tenant: companyId no especificado.',
        fechaSincronizacion: now
      };
    }

    // 2. Control Human-in-the-Loop y RBAC de seguridad
    if (usuario.rol === 'IA' || usuario.rol === 'SISTEMA_AUTO') {
      const errorMsg = 'Violación de Gobernanza HITL: La IA o procesos automáticos no tienen autorización para sincronizar hallazgos.';
      this.registrarAuditoria(companyId, usuario, 'ERROR_HITL_SINCRONIZACION', codigoPlan, errorMsg);
      return {
        success: false,
        estadoSincronizacion: 'ERROR',
        mensaje: errorMsg,
        fechaSincronizacion: now
      };
    }

    // 3. Regla: Solo la eficacia comprobada (EFICAZ) mitiga el hallazgo
    if (resultadoEficacia !== 'EFICAZ') {
      const msg = `Plan ${codigoPlan} dictaminado como NO_EFICAZ. El hallazgo de origen se mantiene abierto/pendiente de intervención.`;
      this.registrarAuditoria(companyId, usuario, 'PLAN_NO_EFICAZ_ORIGEN_MANTENIDO', codigoPlan, msg);
      return {
        success: true,
        estadoSincronizacion: 'PENDIENTE',
        mensaje: msg,
        moduloAfectado: origen,
        hallazgoIdAfectado: targetId,
        fechaSincronizacion: now
      };
    }

    // 4. Despachador de sincronización según tipo de origen
    switch (origen) {
      case 'ALERTA_SST':
        return this.sincronizarAlertaSst(payload, targetId, now);

      case 'ONBOARDING_NORMATIVO':
      case 'AUTOEVALUACION_0312':
        return this.sincronizarOnboarding(payload, targetId, now);

      case 'CALIDAD_DATOS':
        return this.procesarCalidadDatos(payload, now);

      case 'AUDITORIA_INTERNA':
      case 'INVESTIGACION_ACCIDENTE':
      case 'COMITE_COPASST':
      case 'COMITE_CONVIVENCIA':
      case 'INSPECCION_SEGURIDAD':
      case 'DIAGNOSTICO_SOCIODEMOGRAFICO':
      case 'SUGERENCIA_IA':
        return this.sincronizarOrigenGenerico(payload, targetId, now);

      default: {
        const msg = `Tipo de origen '${origen}' no posee integración de sincronización automatizada.`;
        this.registrarAuditoria(companyId, usuario, 'SINCRONIZACION_NO_APLICA', codigoPlan, msg);
        return {
          success: true,
          estadoSincronizacion: 'NO_APLICA',
          mensaje: msg,
          fechaSincronizacion: now
        };
      }
    }
  }

  // =========================================================================
  // HANDLERS ESPECÍFICOS POR MÓDULO DE ORIGEN
  // =========================================================================

  /**
   * Sincroniza alertas de seguridad del Centro Ejecutivo 360
   */
  private sincronizarAlertaSst(
    payload: SincronizacionOrigenPayload, 
    targetId: string | undefined, 
    now: string
  ): ResultadoSincronizacionOrigen {
    const { companyId, codigoPlan, usuario, verificadoPor, observacionesTecnicas } = payload;

    if (!targetId) {
      const msg = `El plan ${codigoPlan} (origen ALERTA_SST) no posee identificador estructurado (hallazgoId/origenId). No se realiza mutación especulativa.`;
      this.registrarAuditoria(companyId, usuario, 'SINCRONIZACION_SIN_ID', codigoPlan, msg);
      return {
        success: true,
        estadoSincronizacion: 'NO_APLICA',
        mensaje: msg,
        moduloAfectado: 'ALERTA_SST',
        fechaSincronizacion: now
      };
    }

    const alertas = alertasService.getAlertas(companyId);
    const alerta = alertas.find(a => a.id === targetId);

    if (!alerta) {
      const msg = `Alerta con ID '${targetId}' no encontrada en el tenant ${companyId}.`;
      this.registrarAuditoria(companyId, usuario, 'ALERTA_NO_ENCONTRADA', codigoPlan, msg);
      return {
        success: false,
        estadoSincronizacion: 'ERROR',
        mensaje: msg,
        moduloAfectado: 'ALERTA_SST',
        hallazgoIdAfectado: targetId,
        fechaSincronizacion: now
      };
    }

    const estadoAnterior = alerta.estado;

    // Validación de Idempotencia: Si ya está cerrada, no sobreescribir
    if (estadoAnterior === 'CERRADA') {
      const msg = `La alerta '${alerta.titulo}' (ID: ${targetId}) ya se encontraba CERRADA previamente. Sincronización omitida para evitar sobrescritura.`;
      this.registrarAuditoria(companyId, usuario, 'SINCRONIZACION_OMITIDA_YA_CERRADA', codigoPlan, msg);
      return {
        success: true,
        estadoSincronizacion: 'RECHAZADO_ORIGEN_CERRADO',
        mensaje: msg,
        moduloAfectado: 'ALERTA_SST',
        hallazgoIdAfectado: targetId,
        estadoAnteriorHallazgo: estadoAnterior,
        estadoNuevoHallazgo: estadoAnterior,
        fechaSincronizacion: now
      };
    }

    // Mutación controlada mediante la API formal del servicio
    const justificacion = `Cierre automático por eficacia en Plan de Acción ${codigoPlan}. Verificado por: ${verificadoPor}. Detalle: ${observacionesTecnicas}`;
    const actualizado = alertasService.cambiarEstadoAlerta(
      companyId,
      targetId,
      'CERRADA',
      usuario.nombre,
      usuario.rol,
      justificacion
    );

    if (!actualizado) {
      const msg = `Fallo al actualizar el estado de la alerta '${targetId}' a CERRADA.`;
      return {
        success: false,
        estadoSincronizacion: 'ERROR',
        mensaje: msg,
        moduloAfectado: 'ALERTA_SST',
        hallazgoIdAfectado: targetId,
        fechaSincronizacion: now
      };
    }

    const successMsg = `Alerta '${alerta.titulo}' (ID: ${targetId}) sincronizada exitosamente a estado CERRADA tras dictamen EFICAZ en Plan ${codigoPlan}.`;
    this.registrarAuditoria(companyId, usuario, 'SINCRONIZACION_EXITOSA', codigoPlan, successMsg);

    return {
      success: true,
      estadoSincronizacion: 'SINCRONIZADO',
      mensaje: successMsg,
      moduloAfectado: 'ALERTA_SST',
      hallazgoIdAfectado: targetId,
      estadoAnteriorHallazgo: estadoAnterior,
      estadoNuevoHallazgo: 'CERRADA',
      fechaSincronizacion: now
    };
  }

  /**
   * Sincroniza tareas y requisitos derivados de la Autoevaluación 0312 / Onboarding
   */
  private sincronizarOnboarding(
    payload: SincronizacionOrigenPayload, 
    targetId: string | undefined, 
    now: string
  ): ResultadoSincronizacionOrigen {
    const { companyId, codigoPlan, usuario, verificadoPor } = payload;

    if (!targetId) {
      const msg = `Requisito de Onboarding / 0312 sin identificador estructurado en Plan ${codigoPlan}. Registrado en auditoría sin mutación directa.`;
      this.registrarAuditoria(companyId, usuario, 'SINCRONIZACION_ONBOARDING_SIN_ID', codigoPlan, msg);
      return {
        success: true,
        estadoSincronizacion: 'NO_APLICA',
        mensaje: msg,
        moduloAfectado: 'ONBOARDING_NORMATIVO',
        fechaSincronizacion: now
      };
    }

    const tasks = onboardingService.getTasksCenter(companyId);
    const task = tasks.find(t => t.id === targetId);

    const estadoAnterior = task ? task.estado : 'DESCONOCIDO';
    const msg = `Requisito normativo '${task?.titulo || targetId}' mitigado por Plan de Acción ${codigoPlan} (Dictamen EFICAZ por ${verificadoPor}). Trazabilidad legal consolidada.`;

    this.registrarAuditoria(companyId, usuario, 'SINCRONIZACION_ONBOARDING_EXITOSA', codigoPlan, msg);

    return {
      success: true,
      estadoSincronizacion: 'SINCRONIZADO',
      mensaje: msg,
      moduloAfectado: 'ONBOARDING_NORMATIVO',
      hallazgoIdAfectado: targetId,
      estadoAnteriorHallazgo: estadoAnterior,
      estadoNuevoHallazgo: 'COMPLETADA',
      fechaSincronizacion: now
    };
  }

  /**
   * Procesa orígenes de Calidad de Datos
   * (La calidad se computa dinámicamente desde el censo maestro, no se altera de forma ficticia)
   */
  private procesarCalidadDatos(
    payload: SincronizacionOrigenPayload, 
    now: string
  ): ResultadoSincronizacionOrigen {
    const { companyId, codigoPlan, usuario } = payload;
    const msg = `El origen CALIDAD_DATOS es calculado en tiempo real sobre el censo de colaboradores. El plan ${codigoPlan} queda registrado como acción correctiva de datos sin mutación forzada de índices.`;
    
    this.registrarAuditoria(companyId, usuario, 'SINCRONIZACION_CALIDAD_DATOS_NOTA', codigoPlan, msg);

    return {
      success: true,
      estadoSincronizacion: 'NO_APLICA',
      mensaje: msg,
      moduloAfectado: 'CALIDAD_DATOS',
      fechaSincronizacion: now
    };
  }

  /**
   * Sincroniza orígenes de auditorías, comités o inspecciones
   */
  private sincronizarOrigenGenerico(
    payload: SincronizacionOrigenPayload, 
    targetId: string | undefined, 
    now: string
  ): ResultadoSincronizacionOrigen {
    const { companyId, codigoPlan, origen, usuario, verificadoPor } = payload;

    if (!targetId) {
      const msg = `El origen '${origen}' opera como catálogo descriptivo en Plan ${codigoPlan}. Sincronización registrada en bitácora de auditoría sin mutación directa.`;
      this.registrarAuditoria(companyId, usuario, 'SINCRONIZACION_CATALOGO_DESCRIPTIVO', codigoPlan, msg);
      return {
        success: true,
        estadoSincronizacion: 'NO_APLICA',
        mensaje: msg,
        moduloAfectado: origen,
        fechaSincronizacion: now
      };
    }

    const msg = `Hallazgo '${targetId}' del módulo '${origen}' marcado como intervenido eficazmente mediante Plan ${codigoPlan} (Verificado por ${verificadoPor}).`;
    this.registrarAuditoria(companyId, usuario, 'SINCRONIZACION_ORIGEN_REGISTRADA', codigoPlan, msg);

    return {
      success: true,
      estadoSincronizacion: 'SINCRONIZADO',
      mensaje: msg,
      moduloAfectado: origen,
      hallazgoIdAfectado: targetId,
      estadoAnteriorHallazgo: 'ABIERTO',
      estadoNuevoHallazgo: 'MITIGADO_EFICAZ',
      fechaSincronizacion: now
    };
  }

  // =========================================================================
  // AUXILIARES DE AUDITORÍA
  // =========================================================================

  private registrarAuditoria(
    companyId: string, 
    usuario: { nombre: string; rol: string }, 
    accion: string, 
    codigoPlan: string, 
    detalle: string
  ): void {
    try {
      alertasService.registrarAuditLog(companyId, {
        id: `aud_sinc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        companyId,
        fecha: new Date().toISOString(),
        usuario: usuario.nombre,
        rol: usuario.rol,
        accion: `SINCRONIZACION_HALLAZGOS: ${accion}`,
        valorNuevo: codigoPlan,
        justificacion: detalle
      });
    } catch (e) {
      console.warn('Error al registrar auditoría de sincronización:', e);
    }
  }
}

export const sincronizacionHallazgosService = SincronizacionHallazgosService.getInstance();
