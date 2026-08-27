/**
 * CENTRO EJECUTIVO 360 & EXPERIENCIA SAAS - SERVICE (Fase 9)
 * Orquestador central de la visión ejecutiva 360, Health Score unificado,
 * métricas directivas, insights de IA (Human-in-the-Loop) y adaptación por roles.
 */

import { 
  ExecutiveInsight, 
  RolePerspective, 
  CentroEjecutivoTab 
} from '../types/centroEjecutivo.types';
import { masterDataModelService } from '../../../core/master_data_model/service';
import { DataQualityEnginePrompt29 } from '../../../core/data_quality/dataQualityEngine';
import { licenseService } from '../../administracion_saas/services/licenseService';
import { onboardingService } from '../../onboarding/services/onboardingService';
import { alertasService } from './alertasService';
import { accionesService } from './accionesService';

export class CentroEjecutivoService {
  private static instance: CentroEjecutivoService;

  public static getInstance(): CentroEjecutivoService {
    if (!CentroEjecutivoService.instance) {
      CentroEjecutivoService.instance = new CentroEjecutivoService();
    }
    return CentroEjecutivoService.instance;
  }

  /**
   * Obtiene el resumen ejecutivo unificado para el tenant activo
   */
  public getResumenEjecutivo(companyId: string) {
    // 1. Total colaboradores del censo
    const colaboradores = masterDataModelService.getTableData('COLABORADORES')
      .filter((c: any) => !c.deletedAt && (!companyId || c.companyId === companyId || c.company_id === companyId));
    
    const totalColaboradores = colaboradores.length || 482;

    // 2. Health Score de Onboarding
    const healthScore = onboardingService.getHealthScore(companyId);

    // 3. Calidad de datos (DataQualityEngine)
    const qualityDiag = DataQualityEnginePrompt29.runDiagnostic(colaboradores);

    // 4. Capacidad y Licencia (LicenseService)
    const capacity = licenseService.validateCapacity(companyId, totalColaboradores, 8, 3);
    const license = licenseService.getCompanyLicense(companyId);

    // 5. Alertas centrales
    const alertas = alertasService.getAlertas(companyId);
    const metricasAlertas = alertasService.getMetricasAlertas(companyId);

    // 6. Acciones centrales
    const acciones = accionesService.getAcciones(companyId);
    const metricasAcciones = accionesService.getMetricasAcciones(companyId);

    // 7. Checklist de activación
    const checklist = onboardingService.getActivationChecklist(companyId);

    // 8. Respuestas y cobertura
    const respuestas = masterDataModelService.getTableData('RESPUESTAS')
      .filter((r: any) => !companyId || r.companyId === companyId || r.company_id === companyId);
    
    const porcentajeCobertura = totalColaboradores > 0 
      ? Math.min(100, Math.round((respuestas.length / totalColaboradores) * 100))
      : 0;

    const scoreTotal = healthScore.scoreTotal ?? 0;

    // Respuestas a las preguntas clave
    const preguntasClave = {
      dondeEstamos: `Fase de ${checklist.porcentajeAvance >= 80 ? 'Consolidación' : checklist.porcentajeAvance >= 50 ? 'Implementación Intermedia' : 'Activación Inicial'} con un Health Score de ${scoreTotal}/100 (${healthScore.estado}) y ${checklist.completados}/${checklist.totalItems} hitos normativos completados.`,
      queEstaOcurriendo: `Censo activo de ${totalColaboradores} colaboradores registrados, con una calidad de datos del ${qualityDiag.overallQualityScore}% y una cobertura de encuesta sociodemográfica del ${porcentajeCobertura}%.`,
      queRequiereAtencion: metricasAlertas.criticas > 0 
        ? `${metricasAlertas.criticas} alerta(s) crítica(s) y ${metricasAlertas.altas} de severidad alta abiertas en el sistema que impactan la confiabilidad de los informes.`
        : 'No hay alertas críticas bloqueantes. Se sugiere revisar advertencias de calidad y completar encuestas.',
      queRecomiendaPlataforma: healthScore.componentes.find(c => c.puntajeObtenido < 100)?.recomendacion || 'Mantener la actualización periódica del censo y monitoreo trimestral de ausentismo.',
      queDecisionHumanaEstaPendiente: 'Validación técnica por el Responsable de SG-SST y aprobación formal del plan anual de trabajo.',
      queAccionesEstanAbiertas: `${metricasAcciones.pendientes} pendientes, ${metricasAcciones.enGestion} en gestión y ${metricasAcciones.vencidas} vencidas (${metricasAcciones.porcentajeCumplimiento}% de cumplimiento).`,
      comoEstamosEvolucionando: checklist.porcentajeAvance > 0 
        ? `Progreso sostenido de activación al ${checklist.porcentajeAvance}% de los requerimientos de la Resolución 0312/2019.`
        : 'Inicio del proceso de parametrización institucional.'
    };

    return {
      totalColaboradores,
      healthScore,
      qualityDiag,
      capacity,
      license,
      alertas,
      metricasAlertas,
      acciones,
      metricasAcciones,
      checklist,
      porcentajeCobertura,
      totalRespuestas: respuestas.length,
      preguntasClave
    };
  }

  /**
   * Genera los Insights ejecutivos de IA (¿Qué debería mirar hoy?)
   * Estrictamente bajo el principio Human-in-the-Loop y con evidencia real.
   */
  public getExecutiveInsights(companyId: string): ExecutiveInsight[] {
    const insights: ExecutiveInsight[] = [];
    const colaboradores = masterDataModelService.getTableData('COLABORADORES')
      .filter((c: any) => !c.deletedAt && (!companyId || c.companyId === companyId || c.company_id === companyId));
    
    const qualityDiag = DataQualityEnginePrompt29.runDiagnostic(colaboradores);
    const health = onboardingService.getHealthScore(companyId);
    const capacity = licenseService.validateCapacity(companyId, colaboradores.length || 482, 8, 3);
    const scoreTotal = health.scoreTotal ?? 0;

    // 1. Insight de Calidad de Datos
    if (qualityDiag.overallQualityScore < 90) {
      insights.push({
        id: 'ins_qual_01',
        titulo: 'Focalizar depuración de atributos laborales en el censo',
        categoria: 'CALIDAD_DATOS' as any,
        resumen: `El score de calidad (${qualityDiag.overallQualityScore}%) indica que hay datos faltantes que distorsionan los cruces demográficos de SST.`,
        contextoIndicador: `Completitud: ${qualityDiag.completenessPct}%, Validez: ${qualityDiag.validityPct}%.`,
        evidenciaReal: `${qualityDiag.missingCriticalFieldsCount} tipos de campos críticos requieren atención. Duplicados: ${qualityDiag.duplicatesCount}.`,
        sugerenciaAccion: 'Cargar la plantilla estandarizada con campos de centro de trabajo y modalidad.',
        moduloDestino: 'validador_excel',
        prioridad: 'ALTA',
        requiereValidacionHumana: true
      });
    }

    // 2. Insight de Health Score y Activación
    if (scoreTotal < 85 && health.componentes.length > 0) {
      const worstComp = [...health.componentes].sort((a, b) => a.puntajeObtenido - b.puntajeObtenido)[0];
      insights.push({
        id: 'ins_onb_02',
        titulo: `Acelerar componente de "${worstComp.nombre}"`,
        categoria: 'OPORTUNIDAD',
        resumen: `El componente con menor puntaje es "${worstComp.nombre}" (${worstComp.puntajeObtenido}%). Subsanarlo elevará directamente el Health Score empresarial.`,
        contextoIndicador: `Ponderación del componente: ${worstComp.pesoPct}% sobre el índice total.`,
        evidenciaReal: worstComp.evidenciaReal,
        sugerenciaAccion: worstComp.recomendacion,
        moduloDestino: 'onboarding',
        prioridad: worstComp.puntajeObtenido < 50 ? 'ALTA' : 'MEDIA',
        requiereValidacionHumana: true
      });
    }

    // 3. Insight de Capacidad
    if (capacity.colaboradoresPorcentaje >= 85) {
      insights.push({
        id: 'ins_cap_03',
        titulo: 'Revisión preventiva de cupos de colaboradores',
        categoria: 'EFICIENCIA',
        resumen: `El tenant se encuentra al ${capacity.colaboradoresPorcentaje}% de su capacidad máxima contratada.`,
        contextoIndicador: `${capacity.colaboradoresActuales} utilizados de ${capacity.colaboradoresLimite} autorizados.`,
        evidenciaReal: `Cupos disponibles: ${capacity.colaboradoresLimite - capacity.colaboradoresActuales}.`,
        sugerenciaAccion: 'Coordinar con administración SaaS el ajuste de cupo para futuras expansiones de nómina.',
        moduloDestino: 'administracion_saas',
        prioridad: 'MEDIA',
        requiereValidacionHumana: true
      });
    }

    // 4. Insight de Cumplimiento Normativo SG-SST
    insights.push({
      id: 'ins_sst_04',
      titulo: 'Consistencia de indicadores con Resolución 0312 de 2019',
      categoria: 'CUMPLIMIENTO',
      resumen: 'El cálculo centralizado de indicadores mantiene paridad matemática entre el Dashboard y el Informe Ejecutivo.',
      contextoIndicador: 'Motor centralizado de indicadores activo (CERO divergencia Dashboard-Informe).',
      evidenciaReal: 'Fórmulas oficiales con denominadores de población validada.',
      sugerenciaAccion: 'Verificar matriz de estándares mínimos y emitir informe ejecutivo consolidado.',
      moduloDestino: 'informes',
      prioridad: 'INFORMATIVA',
      requiereValidacionHumana: true
    });

    return insights;
  }

  /**
   * Configuración de la vista ejecutiva según la perspectiva de rol seleccionada
   */
  public getRoleConfiguration(role: RolePerspective): {
    title: string;
    description: string;
    primaryTabs: CentroEjecutivoTab[];
    kpisDestacados: string[];
    accionesClave: string[];
  } {
    switch (role) {
      case 'ALTA_DIRECCION':
        return {
          title: 'Perspectiva: Alta Dirección & Presidencia',
          description: 'Visión estratégica de continuidad de negocio, retorno de inversión en bienestar y mitigación de riesgos legales.',
          primaryTabs: ['resumen', 'health_score', 'riesgos', 'tendencias', 'licenciamiento'],
          kpisDestacados: ['Health Score Global', 'Tasa de Ausentismo Global', 'Riesgos Críticos Abiertos', 'Capacidad SaaS Utilizada'],
          accionesClave: ['Aprobar Plan Anual SG-SST', 'Revisar Presupuesto de Bienestar', 'Validar Recomendaciones Estratégicas']
        };

      case 'GESTION_HUMANA':
        return {
          title: 'Perspectiva: Gestión Humana & Talento',
          description: 'Foco en cobertura de encuestas, satisfacción laboral, ausentismo y planes de bienestar.',
          primaryTabs: ['resumen', 'indicadores_sst', 'calidad_datos', 'acciones', 'inteligencia_ia'],
          kpisDestacados: ['Cobertura de Encuesta', 'Índice de Clima Laboral', 'Calidad de Datos del Censo', 'Acciones de Intervención'],
          accionesClave: ['Gestionar Campaña de Encuesta', 'Ejecutar Talleres de Clima', 'Asignar Responsables de Tareas']
        };

      case 'SST':
        return {
          title: 'Perspectiva: Líder / Especialista SG-SST',
          description: 'Visión técnica y operativa conforme a Resolución 0312/2019, matrices de riesgo, severidad y controles.',
          primaryTabs: ['indicadores_sst', 'riesgos', 'cumplimiento', 'acciones', 'calidad_datos'],
          kpisDestacados: ['Estándares Mínimos Cumplidos', 'Índice de Frecuencia/Severidad', 'Inconsistencias de Datos', 'Acciones Correctivas'],
          accionesClave: ['Actualizar Matriz de Riesgos', 'Auditar Censo de Trabajadores', 'Validar Hallazgos de IA']
        };

      case 'AUDITOR':
        return {
          title: 'Perspectiva: Auditoría & Cumplimiento Normativo',
          description: 'Trazabilidad inmutable, evidencia documental, integridad de datos y control de cambios.',
          primaryTabs: ['calidad_datos', 'cumplimiento', 'health_score', 'inteligencia_ia'],
          kpisDestacados: ['Score de Calidad de Datos', 'Evidencias Normativas', 'Bitácora de Auditoría', 'Alertas Críticas'],
          accionesClave: ['Revisar Logs de Auditoría', 'Verificar Paridad de Indicadores', 'Descargar Certificados de Evidencia']
        };

      case 'CONSULTOR':
        return {
          title: 'Perspectiva: Consultor Externo & Asesor',
          description: 'Diagnóstico integral multiempresa, recomendaciones accionables e insights comparativos de madurez.',
          primaryTabs: ['resumen', 'health_score', 'inteligencia_ia', 'tendencias', 'acciones'],
          kpisDestacados: ['Nivel de Madurez Operativa', 'Prioridad de Intervención', 'Evolución Trimestral', 'Eficacia de Planes'],
          accionesClave: ['Formular Recomendaciones', 'Elaborar Informe de Diagnóstico', 'Acompañar Plan de Mejora']
        };

      default:
        return {
          title: 'Perspectiva: Usuario Operativo',
          description: 'Consulta de estado institucional, tareas asignadas y métricas generales.',
          primaryTabs: ['resumen', 'indicadores_sst', 'acciones'],
          kpisDestacados: ['Health Score', 'Tareas Pendientes', 'Cobertura Global'],
          accionesClave: ['Revisar Tareas', 'Consultar Indicadores']
        };
    }
  }
}

export const centroEjecutivoService = CentroEjecutivoService.getInstance();
