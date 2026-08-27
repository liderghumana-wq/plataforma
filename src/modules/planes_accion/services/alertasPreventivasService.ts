// src/modules/planes_accion/services/alertasPreventivasService.ts
/**
 * Servicio de Alertas Preventivas Determinísticas para Planes de Acción SG-SST
 * Implementa las 4 reglas automáticas sin sobreescribir ni duplicar motores centrales:
 * 1. Plan Vencido (fechaObjetivo < hoy && avance < 100% && estado no final)
 * 2. Próximo a Vencer (diasRestantes <= 5 && avance < 100% && estado === 'EN_EJECUCION')
 * 3. Plan Estancado (estado === 'EN_EJECUCION' sin avances en > 15 días)
 * 4. Plan No Eficaz sin Replanificación (> 3 días tras verificación negativa)
 *
 * Incluye deduplicación estricta por clave y persistencia segregada por companyId.
 */

import { PlanAccionItem, EstadoPlanAccion } from '../types/planesAccion.types';
import { planesAccionService } from './planesAccionService';

export type TipoAlertaPreventiva = 
  | 'VENCIDO'
  | 'PROXIMO_A_VENCER'
  | 'ESTANCADO'
  | 'NO_EFICAZ_PENDIENTE_REPLANIFICACION';

export type SeveridadAlertaPreventiva = 'CRITICA' | 'ALTA' | 'MEDIA' | 'INFO';

export interface AlertaPreventivaPlan {
  id: string;
  companyId: string;
  planId: string;
  codigoPlan: string;
  tituloPlan: string;
  severidad: SeveridadAlertaPreventiva;
  tipo: TipoAlertaPreventiva;
  titulo: string;
  mensaje: string;
  diasRestantes?: number;
  diasRetraso?: number;
  diasSinAvance?: number;
  porcentajeAvance: number;
  responsable: string;
  fechaObjetivo?: string;
  fechaGeneracion: string;
  claveDeduplicacion: string;
  accionRecomendada: string;
  requiereIntervencionHumana: true;
}

interface AlertaControlCache {
  claveDeduplicacion: string;
  generadaEn: string;
  fechaObjetivo?: string;
  estado: 'ACTIVA' | 'IGNORADA' | 'ATENDIDA';
}

export class AlertasPreventivasService {
  private getStorageKey(companyId: string): string {
    return `insight_alertas_preventivas_v1_${companyId}`;
  }

  private loadControlCache(companyId: string): Record<string, AlertaControlCache> {
    try {
      const raw = localStorage.getItem(this.getStorageKey(companyId));
      if (!raw) return {};
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }

  private saveControlCache(companyId: string, cache: Record<string, AlertaControlCache>): void {
    try {
      localStorage.setItem(this.getStorageKey(companyId), JSON.stringify(cache));
    } catch (e) {
      console.error('Error al guardar control de alertas preventivas:', e);
    }
  }

  /**
   * Evalúa y genera las alertas preventivas determinísticas para una empresa
   */
  generarAlertasPreventivas(companyId: string): AlertaPreventivaPlan[] {
    if (!companyId) return [];

    const planes = planesAccionService.getPlanes(companyId);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const cache = this.loadControlCache(companyId);
    const alertasGeneradas: AlertaPreventivaPlan[] = [];
    let cacheModificado = false;

    for (const plan of planes) {
      const responsable = plan.responsableNombre || 'Responsable SST';
      let alertaPlan: AlertaPreventivaPlan | null = null;

      // 1. PRIORIDAD 1: Plan Vencido (< hoy y avance < 100% y estado no final)
      if (
        plan.fechaObjetivo && 
        plan.porcentajeAvance < 100 && 
        plan.estado !== 'CANCELADA' && 
        plan.estado !== 'CERRADA' && 
        plan.estado !== 'EFICAZ'
      ) {
        const fechaObj = new Date(plan.fechaObjetivo);
        fechaObj.setHours(0, 0, 0, 0);

        const diffTime = fechaObj.getTime() - hoy.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
          const diasRetraso = Math.abs(diffDays);
          const clave = `PLAN_VENCIDO_${companyId}_${plan.id}_${plan.fechaObjetivo}`;
          
          alertaPlan = {
            id: `alt_prev_${plan.id}_vencido`,
            companyId,
            planId: plan.id,
            codigoPlan: plan.codigo,
            tituloPlan: plan.titulo,
            severidad: 'CRITICA',
            tipo: 'VENCIDO',
            titulo: `Plan ${plan.codigo} Vencido (${diasRetraso} ${diasRetraso === 1 ? 'día' : 'días'})`,
            mensaje: `El plan "${plan.titulo}" superó su fecha objetivo del ${plan.fechaObjetivo} con un avance del ${plan.porcentajeAvance}%. Requiere intervención inmediata del responsable (${responsable}).`,
            diasRetraso,
            porcentajeAvance: plan.porcentajeAvance,
            responsable,
            fechaObjetivo: plan.fechaObjetivo,
            fechaGeneracion: new Date().toISOString(),
            claveDeduplicacion: clave,
            accionRecomendada: 'Convocar comité SST extraordinario para justificar reprogramación o acelerar ejecución de evidencias.',
            requiereIntervencionHumana: true
          };
        }
      }

      // 2. PRIORIDAD 2: Plan No Eficaz sin Replanificación (> 3 días con dictamen NO_EFICAZ)
      if (!alertaPlan && plan.estado === 'NO_EFICAZ' && plan.verificacionEficacia) {
        const fechaDictamen = new Date(plan.verificacionEficacia.fechaVerificacion || plan.fechaInicio);
        const diasDictamen = Math.floor((hoy.getTime() - fechaDictamen.getTime()) / (1000 * 60 * 60 * 24));

        if (diasDictamen >= 3) {
          const clave = `PLAN_NO_EFICAZ_${companyId}_${plan.id}_${plan.verificacionEficacia.fechaVerificacion}`;
          
          alertaPlan = {
            id: `alt_prev_${plan.id}_no_eficaz`,
            companyId,
            planId: plan.id,
            codigoPlan: plan.codigo,
            tituloPlan: plan.titulo,
            severidad: 'CRITICA',
            tipo: 'NO_EFICAZ_PENDIENTE_REPLANIFICACION',
            titulo: `Plan ${plan.codigo} No Eficaz sin Replanificación`,
            mensaje: `El plan fue dictaminado como NO EFICAZ hace ${diasDictamen} días. La norma SG-SST exige formular una nueva acción correctiva inmediata.`,
            porcentajeAvance: plan.porcentajeAvance,
            responsable,
            fechaObjetivo: plan.fechaObjetivo || '',
            fechaGeneracion: new Date().toISOString(),
            claveDeduplicacion: clave,
            accionRecomendada: 'Diseñar un nuevo plan de acción correctivo con análisis de causa raíz ajustado.',
            requiereIntervencionHumana: true
          };
        }
      }

      // 3. PRIORIDAD 3: Planes Próximos a Vencer (<= 5 días y avance < 100% en EN_EJECUCION)
      if (!alertaPlan && plan.fechaObjetivo && plan.estado === 'EN_EJECUCION' && plan.porcentajeAvance < 100) {
        const fechaObj = new Date(plan.fechaObjetivo);
        fechaObj.setHours(0, 0, 0, 0);

        const diffTime = fechaObj.getTime() - hoy.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 5) {
          const clave = `PLAN_VENC_${companyId}_${plan.id}_${plan.fechaObjetivo}`;
          const severidad: SeveridadAlertaPreventiva = diffDays <= 2 ? 'ALTA' : 'MEDIA';

          alertaPlan = {
            id: `alt_prev_${plan.id}_proximo`,
            companyId,
            planId: plan.id,
            codigoPlan: plan.codigo,
            tituloPlan: plan.titulo,
            severidad,
            tipo: 'PROXIMO_A_VENCER',
            titulo: `Plan ${plan.codigo} Próximo a Vencer (${diffDays === 0 ? 'Hoy' : `${diffDays} ${diffDays === 1 ? 'día' : 'días'}`})`,
            mensaje: `El plan "${plan.titulo}" vence el ${plan.fechaObjetivo} (${diffDays === 0 ? 'vence hoy' : `quedan ${diffDays} días`}) y se encuentra al ${plan.porcentajeAvance}% de avance.`,
            diasRestantes: diffDays,
            porcentajeAvance: plan.porcentajeAvance,
            responsable,
            fechaObjetivo: plan.fechaObjetivo,
            fechaGeneracion: new Date().toISOString(),
            claveDeduplicacion: clave,
            accionRecomendada: 'Completar las actividades pendientes y cargar los soportes documentales para transicionar a verificación.',
            requiereIntervencionHumana: true
          };
        }
      }

      // 4. PRIORIDAD 4: Planes Estancados (> 15 días en EN_EJECUCION sin variación de avance)
      if (!alertaPlan && plan.estado === 'EN_EJECUCION' && plan.porcentajeAvance < 100) {
        let ultimaFechaAvance = new Date(plan.fechaInicio || new Date().toISOString());
        if (plan.historialCambios && plan.historialCambios.length > 0) {
          const cambiosAvance = plan.historialCambios.filter(h => 
            h.accion.includes('Avance') || h.accion.includes('Actualización') || h.accion.includes('EDICION')
          );
          if (cambiosAvance.length > 0) {
            const ultimoCambio = cambiosAvance[cambiosAvance.length - 1];
            ultimaFechaAvance = new Date(ultimoCambio.fecha);
          }
        }

        const diffEstancado = Math.floor((hoy.getTime() - ultimaFechaAvance.getTime()) / (1000 * 60 * 60 * 24));
        if (diffEstancado >= 15) {
          const clave = `PLAN_ESTANCADO_${companyId}_${plan.id}_${ultimaFechaAvance.toISOString().split('T')[0]}`;
          
          alertaPlan = {
            id: `alt_prev_${plan.id}_estancado`,
            companyId,
            planId: plan.id,
            codigoPlan: plan.codigo,
            tituloPlan: plan.titulo,
            severidad: 'MEDIA',
            tipo: 'ESTANCADO',
            titulo: `Plan ${plan.codigo} Estancado (${diffEstancado} días sin avance)`,
            mensaje: `El plan "${plan.titulo}" permanece en ${plan.porcentajeAvance}% de avance desde hace ${diffEstancado} días continuos sin nuevos registros de gestión.`,
            diasSinAvance: diffEstancado,
            porcentajeAvance: plan.porcentajeAvance,
            responsable,
            fechaObjetivo: plan.fechaObjetivo || '',
            fechaGeneracion: new Date().toISOString(),
            claveDeduplicacion: clave,
            accionRecomendada: 'Solicitar informe de estado al líder responsable o reasignar recursos para reactivar la ejecución.',
            requiereIntervencionHumana: true
          };
        }
      }

      // Si se generó la alerta prioritaria para este plan, incluirla y registrar en cache
      if (alertaPlan) {
        alertasGeneradas.push(alertaPlan);

        if (!cache[alertaPlan.claveDeduplicacion]) {
          cache[alertaPlan.claveDeduplicacion] = {
            claveDeduplicacion: alertaPlan.claveDeduplicacion,
            generadaEn: new Date().toISOString(),
            fechaObjetivo: alertaPlan.fechaObjetivo,
            estado: 'ACTIVA'
          };
          cacheModificado = true;
        }
      }
    }

    if (cacheModificado) {
      this.saveControlCache(companyId, cache);
    }

    return alertasGeneradas;
  }
}

export const alertasPreventivasService = new AlertasPreventivasService();
