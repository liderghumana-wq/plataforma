/**
 * SERVICIO CENTRAL DE ALERTAS EJECUTIVAS 360 (Fase 9)
 * Agrega, normaliza y persiste el estado de alertas de todos los módulos del sistema
 * respetando el aislamiento estricto por activeCompanyId.
 */

import { 
  ExecutiveAlert, 
  AlertCategory, 
  AlertSeverity, 
  AlertStatus,
  Executive360AuditLog
} from '../types/centroEjecutivo.types';
import { masterDataModelService } from '../../../core/master_data_model/service';
import { DataQualityEnginePrompt29 } from '../../../core/data_quality/dataQualityEngine';
import { licenseService } from '../../administracion_saas/services/licenseService';
import { onboardingService } from '../../onboarding/services/onboardingService';
import { IndicatorEngineService } from '../../../core/indicator_engine/indicatorEngineService';
import { alertasPreventivasService } from '../../planes_accion/services/alertasPreventivasService';

const STORAGE_ALERTS_KEY_PREFIX = 'insight_executive_alerts_';
const STORAGE_AUDIT_KEY_PREFIX = 'insight_executive_audit_';

export class AlertasService {
  private static instance: AlertasService;

  public static getInstance(): AlertasService {
    if (!AlertasService.instance) {
      AlertasService.instance = new AlertasService();
    }
    return AlertasService.instance;
  }

  // ==========================================
  // CONSULTA DE ALERTAS
  // ==========================================

  public getAlertas(
    companyId: string,
    filtros?: {
      categoria?: AlertCategory;
      severidad?: AlertSeverity;
      estado?: AlertStatus;
      busqueda?: string;
    }
  ): ExecutiveAlert[] {
    const rawAlerts = this.getUnifiedAlertsForCompany(companyId);

    return rawAlerts.filter(alt => {
      if (filtros?.categoria && alt.categoria !== filtros.categoria) return false;
      if (filtros?.severidad && alt.severidad !== filtros.severidad) return false;
      if (filtros?.estado && alt.estado !== filtros.estado) return false;
      if (filtros?.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        const matchTitle = alt.titulo.toLowerCase().includes(q);
        const matchDesc = alt.descripcion.toLowerCase().includes(q);
        const matchMod = alt.moduloOrigen.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchMod) return false;
      }
      return true;
    });
  }

  public getMetricasAlertas(companyId: string): {
    total: number;
    criticas: number;
    altas: number;
    medias: number;
    bajas: number;
    nuevas: number;
    enGestion: number;
    cerradas: number;
  } {
    const alerts = this.getUnifiedAlertsForCompany(companyId);

    return {
      total: alerts.length,
      criticas: alerts.filter(a => a.severidad === 'CRITICA').length,
      altas: alerts.filter(a => a.severidad === 'ALTA').length,
      medias: alerts.filter(a => a.severidad === 'MEDIA').length,
      bajas: alerts.filter(a => a.severidad === 'BAJA').length,
      nuevas: alerts.filter(a => a.estado === 'NUEVA').length,
      enGestion: alerts.filter(a => a.estado === 'EN_GESTION' || a.estado === 'EN_REVISION').length,
      cerradas: alerts.filter(a => a.estado === 'CERRADA').length
    };
  }

  // ==========================================
  // GESTIÓN DE ESTADOS Y HUMAN-IN-THE-LOOP
  // ==========================================

  public cambiarEstadoAlerta(
    companyId: string,
    alertId: string,
    nuevoEstado: AlertStatus,
    usuario: string,
    rol: string,
    justificacion?: string
  ): boolean {
    const alerts = this.getUnifiedAlertsForCompany(companyId);
    const targetIdx = alerts.findIndex(a => a.id === alertId);

    if (targetIdx === -1) return false;

    const alert = alerts[targetIdx];
    const estadoAnterior = alert.estado;

    alert.estado = nuevoEstado;
    if (!alert.historialEstados) alert.historialEstados = [];

    alert.historialEstados.push({
      estadoAnterior,
      estadoNuevo: nuevoEstado,
      fecha: new Date().toISOString(),
      usuario,
      justificacion
    });

    this.saveUserAlertOverrides(companyId, alerts);

    // Register executive audit trail
    this.registerAuditLog(companyId, {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      companyId,
      fecha: new Date().toISOString(),
      usuario,
      rol,
      accion: `CAMBIO_ESTADO_ALERTA`,
      valorAnterior: estadoAnterior,
      valorNuevo: nuevoEstado,
      justificacion: justificacion || `Alerta ${alert.titulo} actualizada a ${nuevoEstado}`
    });

    return true;
  }

  // ==========================================
  // AUDITORÍA
  // ==========================================

  public getAuditLogs(companyId: string): Executive360AuditLog[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_AUDIT_KEY_PREFIX}${companyId}`);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public registerAuditLog(companyId: string, log: Executive360AuditLog): void {
    try {
      const logs = this.getAuditLogs(companyId);
      logs.unshift(log);
      localStorage.setItem(`${STORAGE_AUDIT_KEY_PREFIX}${companyId}`, JSON.stringify(logs.slice(0, 200)));
    } catch (e) {
      console.warn('Error saving executive audit log:', e);
    }
  }

  public registrarAuditLog(companyId: string, log: Executive360AuditLog): void {
    this.registerAuditLog(companyId, log);
  }

  // ==========================================
  // GENERACIÓN BASADA EN EVIDENCIA REAL
  // ==========================================

  private computeRealAlerts(companyId: string): ExecutiveAlert[] {
    const alerts: ExecutiveAlert[] = [];
    const now = new Date().toISOString().split('T')[0];

    // 1. EVIDENCIA DE CALIDAD DE DATOS (DataQualityEngine)
    try {
      const colaboradores = masterDataModelService.getTableData('COLABORADORES')
        .filter((c: any) => !c.deletedAt && (!companyId || c.companyId === companyId || c.company_id === companyId));
      
      const qualityDiag = DataQualityEnginePrompt29.runDiagnostic(colaboradores);

      if (qualityDiag.duplicatesCount > 0) {
        alerts.push({
          id: `alt_qual_dups_${companyId}`,
          companyId,
          categoria: 'CALIDAD_DATOS',
          severidad: qualityDiag.duplicatesCount > 5 ? 'CRITICA' : 'ALTA',
          titulo: 'Registros duplicados detectados en censo',
          descripcion: `Se encontraron ${qualityDiag.duplicatesCount} registros con posibles cédulas o nombres duplicados en el maestro de colaboradores.`,
          evidencia: `${qualityDiag.duplicatesCount} registros observados sobre un total de ${qualityDiag.totalCheckedRecords} colaboradores.`,
          fecha: now,
          estado: 'NUEVA',
          moduloOrigen: 'validador_excel',
          accionRecomendada: 'Auditar el censo en el Validador de Datos Excel y depurar duplicados.'
        });
      }

      if (qualityDiag.missingCriticalFieldsCount > 0) {
        alerts.push({
          id: `alt_qual_crit_${companyId}`,
          companyId,
          categoria: 'CALIDAD_DATOS',
          severidad: 'ALTA',
          titulo: 'Campos críticos incompletos en censo laboral',
          descripcion: `Existen campos obligatorios sin diligenciar (${qualityDiag.missingCriticalFieldsList.join(', ')}).`,
          evidencia: `${qualityDiag.missingCriticalFieldsCount} tipos de campos críticos ausentes en múltiples registros.`,
          fecha: now,
          estado: 'NUEVA',
          moduloOrigen: 'colaboradores',
          accionRecomendada: 'Completar los atributos laborales y sociodemográficos mandatorios.'
        });
      }

      if (qualityDiag.overallQualityScore < 85) {
        alerts.push({
          id: `alt_qual_score_${companyId}`,
          companyId,
          categoria: 'CALIDAD_DATOS',
          severidad: qualityDiag.overallQualityScore < 70 ? 'CRITICA' : 'MEDIA',
          titulo: 'Índice de Calidad de Datos por debajo del estándar óptimo',
          descripcion: `El Score Global de Calidad se encuentra en ${qualityDiag.overallQualityScore}/100.`,
          evidencia: `Completitud: ${qualityDiag.completenessPct}%, Validez: ${qualityDiag.validityPct}%, Consistencia: ${qualityDiag.consistencyPct}%.`,
          fecha: now,
          estado: 'NUEVA',
          moduloOrigen: 'calidad_datos',
          accionRecomendada: 'Subsanar inconsistencias de formato y datos faltantes para habilitar reportes con 100% de confianza.'
        });
      }
    } catch (e) {
      console.warn('Error reading data quality for alerts:', e);
    }

    // 2. EVIDENCIA DE LICENCIAMIENTO Y CAPACIDAD (LicenseService)
    try {
      const colaboradoresCount = masterDataModelService.getTableData('COLABORADORES')
        .filter((c: any) => !c.deletedAt && (!companyId || c.companyId === companyId || c.company_id === companyId)).length;
      
      const capacity = licenseService.validateCapacity(companyId, colaboradoresCount || 482, 8, 3);

      if (capacity.colaboradoresPorcentaje >= 90) {
        alerts.push({
          id: `alt_lic_cap_${companyId}`,
          companyId,
          categoria: 'CAPACIDAD_SAAS',
          severidad: capacity.colaboradoresPorcentaje >= 100 ? 'CRITICA' : 'ALTA',
          titulo: 'Capacidad de colaboradores cercana al límite contratado',
          descripcion: `El tenant ha utilizado el ${capacity.colaboradoresPorcentaje}% del cupo asignado en su licencia (${capacity.colaboradoresActuales}/${capacity.colaboradoresLimite}).`,
          evidencia: `Cupo disponible: ${capacity.colaboradoresLimite - capacity.colaboradoresActuales} colaboradores.`,
          fecha: now,
          estado: 'NUEVA',
          moduloOrigen: 'administracion_saas',
          accionRecomendada: 'Solicitar ampliación de cupo o upgrade de plan comercial antes del próximo cargue.'
        });
      }

      if (capacity.diasParaVencer <= 45 && capacity.diasParaVencer > 0) {
        alerts.push({
          id: `alt_lic_exp_${companyId}`,
          companyId,
          categoria: 'LICENCIAMIENTO',
          severidad: capacity.diasParaVencer <= 15 ? 'CRITICA' : 'MEDIA',
          titulo: 'Vencimiento próximo de la licencia SaaS',
          descripcion: `La suscripción empresarial actual expira en ${capacity.diasParaVencer} días.`,
          evidencia: `Días restantes: ${capacity.diasParaVencer} días.`,
          fecha: now,
          estado: 'NUEVA',
          moduloOrigen: 'administracion_saas',
          accionRecomendada: 'Coordinar con el ejecutivo de cuenta la renovación anual del servicio.'
        });
      }
    } catch (e) {
      console.warn('Error reading capacity for alerts:', e);
    }

    // 3. EVIDENCIA DE ONBOARDING & HEALTH SCORE
    try {
      const health = onboardingService.getHealthScore(companyId);
      const scoreTotal = health.scoreTotal ?? 0;

      if (scoreTotal < 80) {
        alerts.push({
          id: `alt_onb_health_${companyId}`,
          companyId,
          categoria: 'ONBOARDING',
          severidad: scoreTotal < 60 ? 'CRITICA' : 'ALTA',
          titulo: 'Health Score de Activación requiere optimización',
          descripcion: `El índice global de preparación operativa de la empresa se encuentra en ${scoreTotal}/100 (${health.estado}).`,
          evidencia: `Componentes con menor avance: ${health.componentes.filter(c => c.puntajeObtenido < 70).map(c => `${c.nombre} (${c.puntajeObtenido}%)`).join(', ') || 'Varios'}.`,
          fecha: now,
          estado: 'NUEVA',
          moduloOrigen: 'onboarding',
          accionRecomendada: 'Completar los pasos pendientes en el módulo de Onboarding & Activación.'
        });
      }

      const surveyComp = health.componentes.find(c => c.id === 'encuesta');
      if (surveyComp && surveyComp.puntajeObtenido < 50) {
        alerts.push({
          id: `alt_sst_survey_${companyId}`,
          companyId,
          categoria: 'SST',
          severidad: 'ALTA',
          titulo: 'Cobertura de Encuesta Sociodemográfica insuficiente',
          descripcion: 'El porcentaje de colaboradores que han respondido la encuesta está por debajo del umbral mínimo de representatividad estadística.',
          evidencia: `Avance del componente de encuesta: ${surveyComp.puntajeObtenido}%.`,
          fecha: now,
          estado: 'NUEVA',
          moduloOrigen: 'encuesta_sociodemografica',
          accionRecomendada: 'Desplegar campaña de recordatorio y enlace de diligenciamiento a colaboradores pendientes.'
        });
      }
    } catch (e) {
      console.warn('Error reading health score for alerts:', e);
    }

    // 4. EVIDENCIA DE INDICADORES & AUSENTISMO
    try {
      const indicators = IndicatorEngineService.calculateAllIndicators({ companyId });
      const ausentismoInd = indicators.find(i => i.indicatorId?.includes('ausentismo') || i.name?.toLowerCase().includes('ausentismo'));
      
      if (ausentismoInd && ausentismoInd.value && Number(ausentismoInd.value) > 4) {
        alerts.push({
          id: `alt_ind_aus_${companyId}`,
          companyId,
          categoria: 'INDICADORES',
          severidad: 'ALTA',
          titulo: 'Tasa de Ausentismo por encima del umbral esperado',
          descripcion: `La tasa calculada de ausentismo laboral alcanza ${ausentismoInd.value}%, superando el estándar de referencia.`,
          evidencia: `Registros válidos: ${ausentismoInd.validRecords}, Total evaluados: ${ausentismoInd.totalRecords}.`,
          fecha: now,
          estado: 'NUEVA',
          moduloOrigen: 'ausentismo',
          accionRecomendada: 'Revisar matriz de causas de incapacidad médica y focalizar áreas con mayor incidencia.'
        });
      }
    } catch (e) {
      console.warn('Error calculating indicators for alerts:', e);
    }

    // 5. EVIDENCIA DE GOBERNANZA DE IA (Human-in-the-loop requirement)
    alerts.push({
      id: `alt_ia_gov_${companyId}`,
      companyId,
      categoria: 'IA_GOBERNANZA',
      severidad: 'MEDIA',
      titulo: 'Validación humana obligatoria en recomendaciones de IA',
      descripcion: 'Todas las prescripciones y sugerencias generadas por modelos de IA requieren aprobación por el responsable SG-SST antes de incorporarse al Plan Anual.',
      evidencia: 'Principio ético Human-in-the-Loop activo conforme a ISO 42001 y lineamientos SG-SST.',
      fecha: now,
      estado: 'NUEVA',
      moduloOrigen: 'gobernanza_ia',
      accionRecomendada: 'Supervisar las acciones propuestas por el Analista Inteligente y registrar firma de aprobación.'
    });

    // 6. EVIDENCIA DE PLANES DE ACCIÓN Y ALERTAS PREVENTIVAS DETERMINÍSTICAS (Fase 11)
    try {
      const alertasPreventivas = alertasPreventivasService.generarAlertasPreventivas(companyId);
      alertasPreventivas.forEach(ap => {
        const cat: AlertCategory = (ap.tipo === 'VENCIDO' || ap.tipo === 'NO_EFICAZ_PENDIENTE_REPLANIFICACION')
          ? 'SST'
          : 'ACCIONES_PENDIENTES';
        
        const sev: AlertSeverity = ap.severidad === 'INFO' ? 'BAJA' : ap.severidad;

        alerts.push({
          id: ap.id,
          companyId,
          categoria: cat,
          severidad: sev,
          titulo: ap.titulo,
          descripcion: ap.mensaje,
          evidencia: `Plan: ${ap.codigoPlan} | Avance: ${ap.porcentajeAvance}% | Responsable: ${ap.responsable} | F. Objetivo: ${ap.fechaObjetivo || 'N/A'} (Clave: ${ap.claveDeduplicacion})`,
          fecha: ap.fechaGeneracion || now,
          estado: 'NUEVA',
          moduloOrigen: 'planes_accion',
          accionRecomendada: ap.accionRecomendada
        });
      });
    } catch (e) {
      console.warn('Error calculando alertas preventivas para el centro ejecutivo:', e);
    }

    return alerts;
  }

  // ==========================================
  // UNIFICACIÓN Y PERSISTENCIA AISLADA
  // ==========================================

  private getUnifiedAlertsForCompany(companyId: string): ExecutiveAlert[] {
    const realAlerts = this.computeRealAlerts(companyId);
    const overrides = this.getUserAlertOverrides(companyId);

    // Merge overrides (e.g. status changes, dismissals)
    const merged = realAlerts.map(alt => {
      const saved = overrides.find(o => o.id === alt.id);
      if (saved) {
        return {
          ...alt,
          estado: saved.estado,
          historialEstados: saved.historialEstados || alt.historialEstados
        };
      }
      return alt;
    });

    // Add any manual custom alerts created by the user for this company
    const customAlerts = overrides.filter(o => !realAlerts.some(r => r.id === o.id));
    
    return [...merged, ...customAlerts];
  }

  private getUserAlertOverrides(companyId: string): ExecutiveAlert[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_ALERTS_KEY_PREFIX}${companyId}`);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private saveUserAlertOverrides(companyId: string, alerts: ExecutiveAlert[]): void {
    try {
      localStorage.setItem(`${STORAGE_ALERTS_KEY_PREFIX}${companyId}`, JSON.stringify(alerts));
    } catch (e) {
      console.warn('Error saving user alert overrides:', e);
    }
  }
}

export const alertasService = AlertasService.getInstance();
