import { 
  IAPrinciple, 
  IAUseScope, 
  IAModelRegistryItem, 
  IARiskMatrixItem, 
  IARecommendationAuditLog,
  IAGovernanceSummary 
} from '../types/iaGovernance.types';

const STORAGE_KEY_LOGS = 'insight_ia_governance_logs_v1';
const STORAGE_KEY_MODELS = 'insight_ia_governance_models_v1';
const STORAGE_KEY_RISKS = 'insight_ia_governance_risks_v1';

export class IAGovernanceService {
  
  // 1. Principios de IA Responsable
  public static getPrinciples(): IAPrinciple[] {
    return [
      {
        id: 'princ-1',
        name: '1. Transparencia',
        shortDescription: 'Claridad total sobre el rol, capacidades y limitaciones de los modelos analíticos.',
        businessImplication: 'Toda métrica generada por algoritmos de IA indica su fuente y método de derivación.',
        iconName: 'Eye',
        category: 'Etica'
      },
      {
        id: 'princ-2',
        name: '2. Responsabilidad',
        shortDescription: 'La organización asume la titularidad y responsabilidad legal de las decisiones adoptadas.',
        businessImplication: 'La IA no es sujeto de imputación legal; los líderes de SG-SST y Talento Humano responden por sus decisiones.',
        iconName: 'ShieldCheck',
        category: 'Etica'
      },
      {
        id: 'princ-3',
        name: '3. Supervisión Humana (Human-in-the-loop)',
        shortDescription: 'Ninguna acción laboral o disciplinaria se ejecuta de forma autónoma o desatendida.',
        businessImplication: 'Protocolo formal obligatorio: Resultado IA → Revisión → Validación → Decisión → Acción.',
        iconName: 'UserCheck',
        category: 'Operativa'
      },
      {
        id: 'princ-4',
        name: '4. Privacidad y Protección de Datos',
        shortDescription: 'Minimización de datos y anonimización estricta bajo Ley 1581 de 2012 y normatividad internacional.',
        businessImplication: 'No se envían identificadores directos (cédulas, nombres, correos) a prompts ni APIs de modelos fundacionales.',
        iconName: 'Lock',
        category: 'Seguridad'
      },
      {
        id: 'princ-5',
        name: '5. Seguridad',
        shortDescription: 'Protección integral contra inyecciones de prompts, fugas de contexto y accesos no autorizados.',
        businessImplication: 'Cifrado de canal, aislamiento de bases de datos por tenant y autenticación con roles RBAC.',
        iconName: 'ShieldAlert',
        category: 'Seguridad'
      },
      {
        id: 'princ-6',
        name: '6. No Discriminación y Equidad',
        shortDescription: 'Prevención activa de sesgos por género, edad, etnia, estrato o estado de salud.',
        businessImplication: 'Los algoritmos de recomendación no penalizan ni filtran grupos poblacionales vulnerables.',
        iconName: 'HeartHandshake',
        category: 'Etica'
      },
      {
        id: 'princ-7',
        name: '7. Explicabilidad',
        shortDescription: 'Capacidad de justificar racionalmente por qué la IA formuló un hallazgo o sugerencia.',
        businessImplication: 'Cada recomendación expone los indicadores sustentantes, limitaciones y aspectos a corroborar.',
        iconName: 'HelpCircle',
        category: 'Operativa'
      },
      {
        id: 'princ-8',
        name: '8. Trazabilidad y Auditoría',
        shortDescription: 'Registro inmutable de interacciones, versiones de modelo y dictámenes de validación humana.',
        businessImplication: 'Logs detallados con timestamp, usuario, función invocada y estado de revisión.',
        iconName: 'FileText',
        category: 'Seguridad'
      },
      {
        id: 'princ-9',
        name: '9. Calidad de Datos Originarios',
        shortDescription: 'La IA solo procesa información previamente auditada y normalizada por motores de validación.',
        businessImplication: 'Flujo canónico: Datos brutos → Data Quality → CentralIndicatorEngine → IA → Validación Humana.',
        iconName: 'CheckCircle',
        category: 'Operativa'
      },
      {
        id: 'princ-10',
        name: '10. Uso Proporcional de IA',
        shortDescription: 'Aplicar IA únicamente donde agregue valor cognitivo sin sustituir cálculos aritméticos deterministas.',
        businessImplication: 'Los indicadores y porcentajes oficiales son calculados por motores matemáticos, no alucinados por LLMs.',
        iconName: 'Sliders',
        category: 'Operativa'
      }
    ];
  }

  // 2. Límites y Alcance de Uso
  public static getUsageScopes(): IAUseScope[] {
    return [
      {
        id: 'use-perm-1',
        type: 'PERMITIDO',
        title: 'Identificación de Patrones Poblacionales',
        description: 'Detección de correlaciones agregadas entre factores sociodemográficos y riesgos de fatiga o ausentismo.',
        justification: 'Optimiza la focalización de programas preventivos del SG-SST sin individualizar represalias.',
        riskLevel: 'Bajo',
        responsibleRole: 'Especialista SG-SST / Analista de Datos'
      },
      {
        id: 'use-perm-2',
        type: 'PERMITIDO',
        title: 'Interpretación Cualitativa de Indicadores',
        description: 'Generación de resúmenes ejecutivos y narrativas analíticas a partir de matrices de indicadores auditados.',
        justification: 'Ahorro de tiempo en la elaboración de informes de rendición de cuentas para la alta gerencia.',
        riskLevel: 'Bajo',
        responsibleRole: 'Responsable SG-SST / Líder Talento Humano'
      },
      {
        id: 'use-perm-3',
        type: 'PERMITIDO',
        title: 'Generación de Recomendaciones y Planes de Intervención',
        description: 'Sugerencia de actividades de promoción de la salud, ergonomía y pausas activas según perfiles de riesgo.',
        justification: 'Sistema consultivo y de apoyo para enriquecer el Plan de Trabajo Anual.',
        riskLevel: 'Medio',
        responsibleRole: 'Coordinador SG-SST / COPASST'
      },
      {
        id: 'use-perm-4',
        type: 'PERMITIDO',
        title: 'Identificación Temprana de Focos de Atención',
        description: 'Alertas tempranas cuando dimensiones de clima o morbilidad sentida superan umbrales de advertencia.',
        justification: 'Permite intervenir oportunamente antes de que se consoliden patologías laborales.',
        riskLevel: 'Medio',
        responsibleRole: 'Responsable SG-SST / Médico Laboral'
      },
      // Usos NO PERMITIDOS (Límites Infranqueables)
      {
        id: 'use-forb-1',
        type: 'NO_PERMITIDO',
        title: 'Desvinculación o Despido de Colaboradores',
        description: 'Utilizar salidas de modelos algorítmicos para sustentar o ejecutar la terminación de contratos.',
        justification: 'Violación directa de derechos fundamentales, debido proceso laboral y principio de dignidad humana.',
        riskLevel: 'Inadmisible',
        responsibleRole: 'Prohibición Absoluta del Sistema'
      },
      {
        id: 'use-forb-2',
        type: 'NO_PERMITIDO',
        title: 'Selección o Rechazo Automatizado de Candidatos',
        description: 'Filtrado autónomo de personal en procesos de selección basado en predicciones algorítmicas.',
        justification: 'Riesgo inaceptable de sesgo discriminatorio en el acceso al empleo.',
        riskLevel: 'Inadmisible',
        responsibleRole: 'Prohibición Absoluta del Sistema'
      },
      {
        id: 'use-forb-3',
        type: 'NO_PERMITIDO',
        title: 'Sanciones o Medidas Disciplinarias',
        description: 'Aplicación de llamados de atención, suspensiones o procesos disciplinarios mediante IA.',
        justification: 'El régimen disciplinario exige contradicción y juicio de valor exclusivamente humano.',
        riskLevel: 'Inadmisible',
        responsibleRole: 'Prohibición Absoluta del Sistema'
      },
      {
        id: 'use-forb-4',
        type: 'NO_PERMITIDO',
        title: 'Diagnósticos Médicos o Dictamen de Incapacidad',
        description: 'Emitir juicios clínicos diagnósticos o calificar origen/pérdida de capacidad laboral sin acto médico.',
        justification: 'Actividad reservada por ley al ejercicio profesional de la medicina y juntas de calificación.',
        riskLevel: 'Inadmisible',
        responsibleRole: 'Prohibición Absoluta del Sistema'
      },
      {
        id: 'use-forb-5',
        type: 'NO_PERMITIDO',
        title: 'Clasificación de Aptitud Laboral Autónoma',
        description: 'Declarar colaboradores como no aptos sin valoración médica ocupacional con énfasis.',
        justification: 'Protección de la privacidad y validez técnico-legal del profesiograma.',
        riskLevel: 'Inadmisible',
        responsibleRole: 'Prohibición Absoluta del Sistema'
      }
    ];
  }

  // 3. Inventario Verificado de Modelos de IA
  public static getModelRegistry(): IAModelRegistryItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_MODELS);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* fallback */ }
    }
    // Modelos verificables en la arquitectura de la plataforma
    const baseModels: IAModelRegistryItem[] = [
      {
        id: 'mod-1',
        name: 'AIEngine Heurístico & Estadístico SG-SST',
        provider: 'Insight People Core Engine (Interno)',
        version: 'v3.2.4',
        purpose: 'Generación determinista de diagnósticos, clasificación de alertas y mapeo normativo Decreto 1072.',
        dataProcessed: 'Métricas agregadas, dimensiones de clima y tasas de cobertura.',
        riskLevel: 'Bajo',
        responsible: 'Arquitecto de Solución / Líder SG-SST',
        status: 'Activo',
        lastReviewDate: '2026-08-16',
        notes: 'Motor determinista y auditable con paridad matemática total.',
        sourceVerification: 'src/modules/ia/services/aiEngine.ts'
      },
      {
        id: 'mod-2',
        name: 'Gemini 3.7 Flash Reasoning Server API',
        provider: 'Google Cloud / Google GenAI SDK',
        version: 'gemini-2.5-flash / gemini-3.7-flash',
        purpose: 'Interpretación narrativa de hallazgos, redacción ejecutiva y sugerencia de campañas de bienestar.',
        dataProcessed: 'Payloads agregados y anonimizados (sin cédulas ni datos personales identificables).',
        riskLevel: 'Medio',
        responsible: 'Oficial de Seguridad & Gobernanza IA',
        status: 'Activo',
        lastReviewDate: '2026-08-16',
        notes: 'Ejecución server-side segura; variables de entorno resguardadas.',
        sourceVerification: 'server.ts / Google GenAI SDK'
      },
      {
        id: 'mod-3',
        name: 'Prompt38 Executive Report Generator',
        provider: 'Central Indicator Engine (Interno)',
        version: 'v38.1',
        purpose: 'Estructuración y balanceo de informe ejecutivo de alta gerencia según estándar ISO 45001.',
        dataProcessed: 'Indicadores centrales calculados y validados por Data Quality.',
        riskLevel: 'Bajo',
        responsible: 'Comité de Auditoría SG-SST',
        status: 'Activo',
        lastReviewDate: '2026-08-16',
        notes: 'Garantiza 100% de consistencia entre vista analítica y documento formal.',
        sourceVerification: 'src/core/reports/Prompt38ReportEngine.ts'
      }
    ];
    localStorage.setItem(STORAGE_KEY_MODELS, JSON.stringify(baseModels));
    return baseModels;
  }

  // 4. Matriz Metodológica de Riesgos de IA
  public static getRiskMatrix(): IARiskMatrixItem[] {
    const raw = localStorage.getItem(STORAGE_KEY_RISKS);
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { /* fallback */ }
    }
    const baseRisks: IARiskMatrixItem[] = [
      {
        id: 'risk-1',
        risk: 'Alucinaciones o Generación Ficticia',
        description: 'La IA podría inferir datos o porcentajes numéricos que no corresponden a la realidad de la empresa.',
        probability: 'Media',
        impact: 'Alto',
        level: 'Alto',
        control: 'Los indicadores y porcentajes son calculados deterministamente por CentralIndicatorEngine. La IA solo interpreta.',
        responsible: 'Líder de Desarrollo / Validador Humano',
        status: 'Control Activo'
      },
      {
        id: 'risk-2',
        risk: 'Sesgo Algorítmico o Discriminación',
        description: 'Recomendaciones desproporcionadas basadas en edad, género o nivel socioeconómico.',
        probability: 'Baja',
        impact: 'Crítico',
        level: 'Medio',
        control: 'Auditoría periódica de recomendaciones y directrices de neutralidad en prompts del sistema.',
        responsible: 'Responsable Talento Humano / Especialista SST',
        status: 'En Monitoreo'
      },
      {
        id: 'risk-3',
        risk: 'Uso y Exposición de Información Sensible',
        description: 'Filtración de diagnósticos médicos individuales o cédulas hacia proveedores de LLM.',
        probability: 'Baja',
        impact: 'Crítico',
        level: 'Alto',
        control: 'Filtro de minimización de datos obligatorio antes de cualquier envío a modelos externos.',
        responsible: 'Oficial de Privacidad / DPO',
        status: 'Control Activo'
      },
      {
        id: 'risk-4',
        risk: 'Interpretación Errónea por el Usuario',
        description: 'Asumir una sugerencia consultiva de la IA como un dictamen médico o una directriz obligatoria.',
        probability: 'Media',
        impact: 'Medio',
        level: 'Medio',
        control: 'Disclaimers obligatorios y flujo estricto de validación humana en cada recomendación.',
        responsible: 'Responsable SG-SST',
        status: 'Mitigado'
      },
      {
        id: 'risk-5',
        risk: 'Automatización Indebida de Decisiones Laborales',
        description: 'Toma de decisiones de despido o sanciones basadas en índices predictivos.',
        probability: 'Baja',
        impact: 'Crítico',
        level: 'Alto',
        control: 'Bloqueo a nivel de arquitectura y directriz expresa en términos de gobernanza y RBAC.',
        responsible: 'Dirección General / Gerencia Jurídica',
        status: 'Control Activo'
      },
      {
        id: 'risk-6',
        risk: 'Falta de Trazabilidad',
        description: 'Imposibilidad de auditar quién solicitó un análisis de IA y qué decisión humana derivó.',
        probability: 'Baja',
        impact: 'Medio',
        level: 'Bajo',
        control: 'Registro de auditoría persistente de cada evento de IA en el módulo de Gobernanza.',
        responsible: 'Administrador de Plataforma',
        status: 'Control Activo'
      },
      {
        id: 'risk-7',
        risk: 'Dependencia Tecnológica / Pérdida de Criterio',
        description: 'Delegación pasiva del análisis de riesgos sin juicio crítico del profesional de SST.',
        probability: 'Media',
        impact: 'Medio',
        level: 'Medio',
        control: 'Protocolos de sustentación técnica en comités de convivencia y COPASST.',
        responsible: 'Líder SG-SST',
        status: 'En Monitoreo'
      },
      {
        id: 'risk-8',
        risk: 'Alimentación con Datos de Mala Calidad',
        description: 'Entrenar o consultar la IA con encuestas incompletas o registros corruptos.',
        probability: 'Media',
        impact: 'Alto',
        level: 'Alto',
        control: 'Compuerta previa de Data Quality y Validador Excel con reglas de consistencia.',
        responsible: 'Analista de Datos / Data Quality Engine',
        status: 'Control Activo'
      }
    ];
    localStorage.setItem(STORAGE_KEY_RISKS, JSON.stringify(baseRisks));
    return baseRisks;
  }

  // 5. Registro de Auditoría de Decisiones y Recomendaciones de IA
  public static getAuditLogs(companyId?: string): IARecommendationAuditLog[] {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) return [];
    try {
      const logs: IARecommendationAuditLog[] = JSON.parse(raw);
      if (companyId) {
        return logs.filter(l => l.companyId === companyId);
      }
      return logs;
    } catch (e) {
      return [];
    }
  }

  public static addAuditLog(log: Omit<IARecommendationAuditLog, 'id' | 'timestamp'>): IARecommendationAuditLog {
    const logs = this.getAuditLogs();
    const newLog: IARecommendationAuditLog = {
      ...log,
      id: `ia-audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    return newLog;
  }

  public static updateAuditLogStatus(
    logId: string, 
    status: 'Pendiente de revisión' | 'Validada' | 'Rechazada' | 'Implementada',
    reviewerName: string,
    reviewerRole: string,
    observations?: string,
    decisionAction?: string
  ): boolean {
    const logs = this.getAuditLogs();
    const index = logs.findIndex(l => l.id === logId);
    if (index === -1) return false;

    logs[index].humanReviewStatus = status;
    logs[index].humanReviewerName = reviewerName;
    logs[index].humanReviewerRole = reviewerRole;
    logs[index].humanReviewTimestamp = new Date().toISOString();
    if (observations !== undefined) logs[index].humanObservations = observations;
    if (decisionAction !== undefined) logs[index].decisionAction = decisionAction;

    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    return true;
  }

  // 6. Resumen Ejecutivo Calculado desde Registros Reales
  public static getGovernanceSummary(companyId?: string): IAGovernanceSummary {
    const models = this.getModelRegistry();
    const risks = this.getRiskMatrix();
    const logs = this.getAuditLogs(companyId);

    const pending = logs.filter(l => l.humanReviewStatus === 'Pendiente de revisión').length;
    const validated = logs.filter(l => l.humanReviewStatus === 'Validada').length;
    const rejected = logs.filter(l => l.humanReviewStatus === 'Rechazada').length;
    const implemented = logs.filter(l => l.humanReviewStatus === 'Implementada').length;

    const openRisks = risks.filter(r => r.status === 'En Monitoreo' || r.status === 'Control Activo').length;
    const mitigatedRisks = risks.filter(r => r.status === 'Mitigado').length;

    // Cálculo del índice de salud de gobernanza (0-100)
    let healthScore = 100;
    if (pending > 0 && logs.length > 0) {
      const pendingRatio = pending / logs.length;
      healthScore -= Math.round(pendingRatio * 25);
    }
    const criticalRisksCount = risks.filter(r => r.level === 'Crítico' && r.status !== 'Mitigado').length;
    healthScore -= criticalRisksCount * 10;
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      registeredModelsCount: models.length,
      activeAIFunctionsCount: 4, // Diagnósticos, Copilot, Recomendaciones, Resúmenes
      pendingRecommendationsCount: pending,
      validatedRecommendationsCount: validated,
      rejectedRecommendationsCount: rejected,
      implementedRecommendationsCount: implemented,
      openRisksCount: openRisks,
      mitigatedRisksCount: mitigatedRisks,
      complianceHealthScore: healthScore,
      totalAuditEventsCount: logs.length
    };
  }

  // 7. Sanitizador y Minimizador de Datos para Prompts de IA
  public static sanitizeDataForAI<T extends Record<string, any>>(payload: T): Partial<T> {
    const sensitiveFields = [
      'cedula', 'documento', 'numeroDocumento', 'identificacion', 
      'nombres', 'apellidos', 'nombreCompleto', 'telefono', 'celular', 
      'email', 'correo', 'direccion', 'barrio', 'telefonoEmergencia', 
      'nombreContactoEmergencia', 'eps', 'afp', 'arl'
    ];

    const sanitized: any = Array.isArray(payload) ? [] : {};

    for (const key of Object.keys(payload)) {
      if (sensitiveFields.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
        // Excluir o pseudonimizar
        continue;
      }
      const val = payload[key];
      if (val !== null && typeof val === 'object') {
        sanitized[key] = this.sanitizeDataForAI(val);
      } else {
        sanitized[key] = val;
      }
    }

    return sanitized;
  }
}
