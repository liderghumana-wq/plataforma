import { 
  IAStrategicPillar, 
  IAUseCaseItem, 
  IAAutonomyLevel, 
  IAStakeholder, 
  IAMaturityAssessment, 
  IAStrategyMetrics 
} from '../types/iaStrategy.types';
import { IAGovernanceService } from './iaGovernanceService';

export class IAStrategyService {

  // 1. Propósito Estratégico Oficial
  public static getStrategicPurpose(): { statement: string; valueChainSteps: { step: number; title: string; desc: string; role: string }[] } {
    return {
      statement: 'Transformar datos de Capital Humano y SG-SST en información analítica, patrones, recomendaciones y conocimiento accionable, manteniendo siempre la decisión final bajo responsabilidad humana.',
      valueChainSteps: [
        { step: 1, title: 'DATOS', desc: 'Recolección de encuestas sociodemográficas, censo laboral y nómina', role: 'Ingesta' },
        { step: 2, title: 'CALIDAD DE DATOS', desc: 'Validación de 17 dimensiones, normalización y detección de anomalías', role: 'Auditoría' },
        { step: 3, title: 'INDICADORES', desc: 'Cálculo matemático determinista por CentralIndicatorEngine (fórmulas oficiales)', role: 'Matemático' },
        { step: 4, title: 'ANÁLISIS', desc: 'Segmentación poblacional por sedes, áreas, turnos y grupos de edad', role: 'Analítica' },
        { step: 5, title: 'IA', desc: 'Inferencia de correlaciones, análisis de severidad y contraste normativo', role: 'Motor IA' },
        { step: 6, title: 'INSIGHT', desc: 'Detección de patrones ocultos y correlaciones entre fatiga y ausentismo', role: 'Cognitivo' },
        { step: 7, title: 'RECOMENDACIÓN', desc: 'Propuestas consultivas de intervención y pausas ergonómicas dirigidas', role: 'Consultivo' },
        { step: 8, title: 'VALIDACIÓN HUMANA', desc: 'Revisión formal obligatoria por Líder SG-SST o COPASST (Human-in-the-loop)', role: 'Humano' },
        { step: 9, title: 'DECISIÓN', desc: 'Aprobación formal e incorporación en el Plan de Trabajo Anual', role: 'Dirección' },
        { step: 10, title: 'ACCIÓN', desc: 'Ejecución operativa en campo de programas de promoción y prevención', role: 'Operación' },
        { step: 11, title: 'SEGUIMIENTO', desc: 'Medición de impacto periódico y re-evaluación de indicadores', role: 'Mejora' }
      ]
    };
  }

  // 2. Cinco Pilares de la Estrategia de IA
  public static getStrategicPillars(): IAStrategicPillar[] {
    return [
      {
        id: 'pilar-1',
        number: 1,
        name: 'Inteligencia Analítica',
        objective: 'Identificar patrones de riesgo, focos de atención y correlaciones en salud y clima que superan la inspección visual manual.',
        applicationInApp: 'Procesamiento de variables sociodemográficas y de morbilidad con cruces multidimensionales por área y sede.',
        businessBenefit: 'Detección temprana de patologías osteomusculares y reducción preventiva de ausentismo laboral.',
        trackingKpi: 'Índice de precisión de diagnósticos poblacionales y cobertura de variables analizadas.',
        iconName: 'Brain'
      },
      {
        id: 'pilar-2',
        number: 2,
        name: 'Automatización Responsable',
        objective: 'Optimizar tareas analíticas repetitivas garantizando control ético y supervisión humana sin decisiones desatendidas.',
        applicationInApp: 'Generación asistida de resúmenes ejecutivos, borradores de planes de acción y pre-clasificación de alertas.',
        businessBenefit: 'Ahorro de hasta un 60% en horas-hombre de consolidación de informes para la alta gerencia.',
        trackingKpi: 'Tasa de revisión humana obligatoria (100% de recomendaciones auditadas antes de ejecución).',
        iconName: 'ShieldCheck'
      },
      {
        id: 'pilar-3',
        number: 3,
        name: 'Toma de Decisiones Basada en Datos',
        objective: 'Sustentar las inversiones del Plan Anual de SG-SST en evidencia estadística rigurosa y no en percepciones aisladas.',
        applicationInApp: 'Articulación directa entre métricas auditadas del CentralIndicatorEngine y justificaciones técnicas de intervención.',
        businessBenefit: 'Asignación eficiente del presupuesto de prevención en las áreas con mayor exposición real.',
        trackingKpi: '% de planes de intervención sustentados en indicadores validados.',
        iconName: 'TrendingUp'
      },
      {
        id: 'pilar-4',
        number: 4,
        name: 'Experiencia del Usuario',
        objective: 'Hacer comprensibles y accesibles los hallazgos técnicos de SG-SST para directivos, especialistas y líderes de proceso.',
        applicationInApp: 'Lenguaje claro, interfaz intuitiva, visualizaciones comparativas e interacción conversacional con Copilot IA.',
        businessBenefit: 'Mayor involucramiento de los comités de convivencia, COPASST y gerentes de área.',
        trackingKpi: 'Tasa de adopción de módulos analíticos y satisfacción del usuario consultor.',
        iconName: 'Users'
      },
      {
        id: 'pilar-5',
        number: 5,
        name: 'Innovación y Mejora Continua',
        objective: 'Evolucionar la plataforma con capacidades predictivas y adaptativas conforme a la madurez de los datos corporativos.',
        applicationInApp: 'Retroalimentación continua del ciclo de dictámenes humanos (aprobadas/rechazadas) para calibrar modelos.',
        businessBenefit: 'Constante actualización normativa (Decreto 1072, Res. 0312, ISO 45001) y resiliencia organizacional.',
        trackingKpi: 'Tasa de recomendaciones implementadas con impacto positivo medible.',
        iconName: 'Sparkles'
      }
    ];
  }

  // 3. Matriz Metodológica de Casos de Uso Reales
  public static getUseCases(): IAUseCaseItem[] {
    return [
      {
        id: 'uc-1',
        title: 'Interpretación Cualitativa de Indicadores de Salud',
        problemSolved: 'Dificultad de la gerencia para interpretar matrices numéricas complejas sin narrativa de contexto.',
        targetUser: 'Alta Dirección, Responsable SG-SST',
        inputData: 'Indicadores centrales (IMC, morbilidad, cobertura) calculados por CentralIndicatorEngine.',
        aiTechUsed: 'AIEngine Heurístico + Motor de Narrativas Prompt38',
        outputGenerated: 'Resumen ejecutivo contextualizado con conclusiones de impacto poblacional.',
        humanInterventionRequired: 'Revisión y aprobación por Especialista SST antes de presentación a junta.',
        businessBenefit: 'Comprensión inmediata de la situación epidemiológica laboral.',
        status: 'IMPLEMENTADO',
        category: 'Analítica'
      },
      {
        id: 'uc-2',
        title: 'Identificación de Focos Poblacionales Osteomusculares',
        problemSolved: 'Identificación tardía de áreas operativas con alta prevalencia de molestias ergonómicas.',
        targetUser: 'Especialista SG-SST, Médico Laboral',
        inputData: 'Respuestas de síntomas en encuesta sociodemográfica (cuello, hombros, espalda, manos).',
        aiTechUsed: 'AIEngine Clustering & Reglas Heurísticas SG-SST',
        outputGenerated: 'Alertas tempranas de riesgo biomecánico segmentadas por cargo y área.',
        humanInterventionRequired: 'Inspección ergonómica en puesto de trabajo por profesional calificado.',
        businessBenefit: 'Focalización preventiva antes de la consolidación de enfermedades laborales.',
        status: 'IMPLEMENTADO',
        category: 'SG-SST'
      },
      {
        id: 'uc-3',
        title: 'Generación Consultiva de Planes de Intervención',
        problemSolved: 'Formulación lenta o genérica de planes de prevención de riesgos laborales.',
        targetUser: 'Responsable SG-SST, COPASST',
        inputData: 'Matriz de riesgos, cobertura de censo y dimensiones de salud críticas.',
        aiTechUsed: 'AIEngine Service + Catálogo Normativo Decreto 1072',
        outputGenerated: 'Propuesta de actividades con objetivos, responsables sugeridos y periodicidad.',
        humanInterventionRequired: 'Ajuste, asignación presupuestal y firma por el Responsable SG-SST.',
        businessBenefit: 'Reducción de días a minutos en la formulación del borrador del plan anual.',
        status: 'IMPLEMENTADO',
        category: 'SG-SST'
      },
      {
        id: 'uc-4',
        title: 'Estructuración de Informe Ejecutivo ISO 45001 / Decreto 1072',
        problemSolved: 'Discrepancias entre informes en Word/PDF y las cifras reales del sistema.',
        targetUser: 'Gerencia General, Auditores SG-SST',
        inputData: 'Resultados auditados de los 482 colaboradores y parámetros de empresa.',
        aiTechUsed: 'Prompt38ReportEngine (Motor determinista y semántico)',
        outputGenerated: 'Documento ejecutivo completo con paridad matemática total frente al Dashboard.',
        humanInterventionRequired: 'Validación del Representante Legal y Responsable del Sistema.',
        businessBenefit: 'Garantía de cumplimiento legal ante inspecciones del Ministerio del Trabajo.',
        status: 'IMPLEMENTADO',
        category: 'Gobernanza'
      },
      {
        id: 'uc-5',
        title: 'Asistente Consultivo Conversacional (Copilot SG-SST)',
        problemSolved: 'Consultas puntuales sobre estadísticas o normatividad requieren cruces manuales de tablas.',
        targetUser: 'Líderes de Talento Humano, Coordinadores de Sede',
        inputData: 'Consultas en lenguaje natural + métricas agregadas anonimizadas.',
        aiTechUsed: 'Gemini Server API + Contexto Sanitarizado RBAC',
        outputGenerated: 'Respuestas analíticas explicativas con sustento en los datos de la empresa.',
        humanInterventionRequired: 'El usuario evalúa la aplicabilidad de la respuesta a su contexto.',
        businessBenefit: 'Acceso inmediato a insights sin depender de ingenieros de datos.',
        status: 'IMPLEMENTADO',
        category: 'Analítica'
      },
      {
        id: 'uc-6',
        title: 'Análisis de Correlación Clima Laboral vs. Ausentismo',
        problemSolved: 'Desconexión entre mediciones de satisfacción y tasas de ausentismo médico.',
        targetUser: 'Dirección de Talento Humano',
        inputData: 'Batería de clima + registros consolidados de días de incapacidad.',
        aiTechUsed: 'Modelo Estadístico Multivariable',
        outputGenerated: 'Coeficientes de correlación y mapas de calor de impacto psicosocial.',
        humanInterventionRequired: 'Interpretación por psicólogo organizacional especializado.',
        businessBenefit: 'Intervención de causas raíz organizacionales del ausentismo.',
        status: 'EN DESARROLLO',
        category: 'Capital Humano'
      },
      {
        id: 'uc-7',
        title: 'Predicción de Riesgo de Rotación Temprana',
        problemSolved: 'Fuga de talento no anticipada en cargos críticos de operaciones.',
        targetUser: 'Líder de Gestión Humana',
        inputData: 'Antigüedad, nivel de estrés percibido, satisfacción y distancia a sede.',
        aiTechUsed: 'Modelo Predictivo de Sobrevivencia Laboral',
        outputGenerated: 'Índice probabilístico de permanencia y factores de retención sugeridos.',
        humanInterventionRequired: 'Entrevista de bienestar humana; prohibición expresa de despidos.',
        businessBenefit: 'Estrategias proactivas de retención de talento clave.',
        status: 'EN DESARROLLO',
        category: 'Capital Humano'
      },
      {
        id: 'uc-8',
        title: 'Simulador Predictivo de Intervenciones SG-SST',
        problemSolved: 'Incertidumbre sobre el retorno o impacto de programas ergonómicos antes de ejecutarlos.',
        targetUser: 'Gerencia Financiera, Líder SG-SST',
        inputData: 'Histórico de eventos, costos de ausentismo y efectividad de medidas previas.',
        aiTechUsed: 'Simulador Monte Carlo / Machine Learning Bayesiano',
        outputGenerated: 'Proyección de reducción de incidentes y retorno de inversión en prevención.',
        humanInterventionRequired: 'Aprobación del comité de inversiones corporativo.',
        businessBenefit: 'Optimización del gasto en salud ocupacional.',
        status: 'FUTURO',
        category: 'SG-SST'
      },
      {
        id: 'uc-9',
        title: 'Detección Automática de Sesgos en Baterías de Encuesta',
        problemSolved: 'Sesgos en redacción de preguntas que inducen respuestas en nuevos instrumentos.',
        targetUser: 'Constructor de Encuestas / Investigador',
        inputData: 'Texto de preguntas y opciones de respuesta formuladas.',
        aiTechUsed: 'Procesamiento de Lenguaje Natural (NLP) Psicométrico',
        outputGenerated: 'Calificación de neutralidad, sugerencias de reformulación y validez de constructo.',
        humanInterventionRequired: 'Aprobación psicométrica por el especialista de diseño.',
        businessBenefit: 'Instrumentos de recolección de datos técnicamente intachables.',
        status: 'FUTURO',
        category: 'Gobernanza'
      }
    ];
  }

  // 4. Niveles de Autonomía de IA
  public static getAutonomyLevels(): IAAutonomyLevel[] {
    return [
      {
        level: 1,
        name: 'NIVEL 1 — ASISTENCIA',
        tagline: 'Interpretación y Explicación',
        description: 'La IA asiste al usuario en la lectura de tablas numéricas, traduce datos a narrativas claras y explica términos técnicos del SG-SST.',
        inInsightPeopleStatus: 'ACTIVO',
        humanRole: 'El usuario formula preguntas y lee la síntesis explicativa.',
        badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      },
      {
        level: 2,
        name: 'NIVEL 2 — RECOMENDACIÓN',
        tagline: 'Sugerencia de Alternativas',
        description: 'La IA detecta patrones demográficos y propone alternativas de intervención preventiva (ej. pausas activas, ajustes de iluminación).',
        inInsightPeopleStatus: 'ACTIVO',
        humanRole: 'El profesional de SST analiza, ajusta o descarta las sugerencias según el contexto real.',
        badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200'
      },
      {
        level: 3,
        name: 'NIVEL 3 — PRIORIZACIÓN',
        tagline: 'Clasificación de Focos de Atención',
        description: 'La IA jerarquiza áreas o grupos etarios según severidad de riesgo combinando sintomatología y cobertura de evaluación.',
        inInsightPeopleStatus: 'ACTIVO',
        humanRole: 'El líder define el orden de intervención y asigna recursos con base en su criterio profesional.',
        badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
      },
      {
        level: 4,
        name: 'NIVEL 4 — DECISIÓN HUMANA',
        tagline: 'Autoridad y Aprobación Formal',
        description: 'Toda decisión con efecto laboral, contractual o de salud es adoptada exclusivamente por seres humanos calificados.',
        inInsightPeopleStatus: 'ACTIVO',
        humanRole: 'Responsabilidad legal y operativa exclusiva de la Alta Dirección y el Responsable SG-SST.',
        badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      },
      {
        level: 5,
        name: 'NIVEL 5 — AUTOMATIZACIÓN AUTÓNOMA',
        tagline: 'Ejecución Desatendida',
        description: 'Toma de decisiones y ejecución automática sin revisión humana previa.',
        inInsightPeopleStatus: 'DESHABILITADO POR SEGURIDAD',
        humanRole: 'Prohibición absoluta en el sistema: la IA jamás ejecutará despidos, sanciones ni dictámenes médicos.',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
      }
    ];
  }

  // 5. Cadena de Valor de IA
  public static getValueChainData() {
    return {
      entrada: [
        'Censo de 482 colaboradores (demografía, turnos, sedes)',
        'Encuesta sociodemográfica y de morbilidad sentida',
        'Registros de ausentismo médico e incapacidades',
        'Dimensiones de clima y factores psicosociales',
        'Archivos Excel cargados y validados'
      ],
      procesamiento: [
        'Motor de Calidad de Datos (17 dimensiones validadas)',
        'CentralIndicatorEngine (cálculo matemático determinista)',
        'Estandarización y agregación multiempresa (RBAC)',
        'Minimización y sanitización de datos sensibles'
      ],
      inteligencia: [
        'AIEngine heurístico y detección de patrones',
        'Gemini Server API para síntesis semántica',
        'Prompt38ReportEngine para informes ISO 45001',
        'Clasificación de focos de atención y semáforos de riesgo'
      ],
      resultado: [
        'Insights explicativos y diagnósticos poblacionales',
        'Recomendaciones consultivas de intervención',
        'Borrador de planes de trabajo anuales para SG-SST',
        'Informe ejecutivo con 100% de paridad matemática'
      ],
      valorEmpresarial: [
        'Información 100% consolidada y trazable',
        'Reducción drástica del tiempo de preparación de informes',
        'Gestión proactiva y preventiva de la salud laboral',
        'Sustentación técnica sólida ante auditorías e inspecciones',
        'Decisiones estratégicas respaldadas en evidencia'
      ]
    };
  }

  // 6. Propuesta de Valor: Antes vs. Después
  public static getValueProposition() {
    return {
      before: [
        { title: 'Información Dispersa', desc: 'Datos fragmentados en múltiples hojas de cálculo sin consolidación central.' },
        { title: 'Análisis Manual y Lento', desc: 'Semanas de trabajo manual para calcular promedios, porcentajes y pirámides poblacionales.' },
        { title: 'Dificultad para Ver Patrones', desc: 'Imposibilidad de cruzar variables de síntomas osteomusculares con sedes o áreas operativas.' },
        { title: 'Baja Trazabilidad', desc: 'Falta de registro de quién elaboró los cálculos o bajo qué criterios normativos.' },
        { title: 'Gestión Reactiva', desc: 'Intervenciones posteriores a la ocurrencia de incapacidades o enfermedades consolidadas.' }
      ],
      after: [
        { title: 'Información Integrada', desc: 'Censo de 482 colaboradores y encuestas centralizados en una arquitectura 3NF.' },
        { title: 'Indicadores Dinámicos', desc: 'Cálculo matemático instantáneo con denominadores exactos y consistencia total.' },
        { title: 'Apoyo Analítico con IA', desc: 'Inferencia inmediata de focos de atención y relaciones estadísticas complejas.' },
        { title: 'Recomendaciones Auditables', desc: 'Propuestas consultivas con registro obligatorio de validación humana.' },
        { title: 'Decisiones Basadas en Evidencia', desc: 'Planes de trabajo anuales alineados con el Decreto 1072 e ISO 45001.' }
      ]
    };
  }

  // 7. Mapa de Stakeholders y Usuarios
  public static getStakeholders(): IAStakeholder[] {
    return [
      {
        role: 'Alta Dirección / Junta Directiva',
        businessNeed: 'Conocer el estado global de salud, clima y cumplimiento normativo sin tecnicismos.',
        requiredData: 'Resumen ejecutivo consolidado, índice de salud SG-SST, tasa de cobertura y focos de atención.',
        aiFeature: 'Prompt38 Executive Engine + Resúmenes Estratégicos de IA.',
        expectedOutcome: 'Visión clara para asignación de presupuesto y rendición de cuentas.',
        decisionScope: 'Aprobación de inversiones y políticas corporativas.'
      },
      {
        role: 'Responsable de SG-SST',
        businessNeed: 'Diseñar el Plan de Trabajo Anual, priorizar inspecciones y cumplir Resolución 0312.',
        requiredData: 'Métricas de morbilidad osteomuscular, hábitos de vida, cobertura y alertas tempranas.',
        aiFeature: 'AIEngine Heurístico + Generador de Planes de Acción + Trazabilidad.',
        expectedOutcome: 'Planes de intervención focalizados y sustentados técnicamente.',
        decisionScope: 'Definición de programas de prevención y validación técnica de IA.'
      },
      {
        role: 'Dirección de Capital Humano / Talento',
        businessNeed: 'Monitorear clima, perfil sociodemográfico y bienestar integral del personal.',
        requiredData: 'Distribución por sedes, rangos de edad, nivel de escolaridad y clima laboral.',
        aiFeature: 'Copilot Asistente IA + Análisis de Focos de Clima y Población.',
        expectedOutcome: 'Estrategias de fidelización, programas de bienestar y equilibrio laboral.',
        decisionScope: 'Políticas de bienestar, compensación no salarial y desarrollo humano.'
      },
      {
        role: 'Médico Laboral / Especialista Ocupacional',
        businessNeed: 'Focalizar exámenes periódicos con énfasis biomecánico o cardiovascular.',
        requiredData: 'Distribución de IMC, síntomas referidos y antecedentes osteomusculares agregados.',
        aiFeature: 'Identificación de Patrones Poblacionales (sin individualizar datos sensibles).',
        expectedOutcome: 'Orientación del profesiograma y vigilancia epidemiológica.',
        decisionScope: 'Criterio clínico y recomendaciones ergonómicas especializadas.'
      },
      {
        role: 'Líderes de Proceso y Operaciones',
        businessNeed: 'Entender factores de fatiga o ausentismo en sus cuadrillas o plantas de trabajo.',
        requiredData: 'Indicadores agregados de su departamento específico sin violar privacidad.',
        aiFeature: 'Vistas segmentadas por área y recomendaciones de pausas activas.',
        expectedOutcome: 'Mejora en la continuidad operativa y menor rotación por sobreesfuerzo.',
        decisionScope: 'Implementación operativa de rotaciones y descansos en turnos.'
      },
      {
        role: 'Auditores y Entidades de Control',
        businessNeed: 'Verificar la trazabilidad metodológica, paridad de datos y apego al Decreto 1072.',
        requiredData: 'Fichas técnicas de indicadores, logs de auditoría de IA y Data Quality.',
        aiFeature: 'Módulo de Gobernanza de IA + Registro Inmutable de Dictámenes.',
        expectedOutcome: 'Certificación de cumplimiento legal y madurez en gobierno de datos.',
        decisionScope: 'Dictamen de conformidad en auditorías internas o externas.'
      }
    ];
  }

  // 8. Evaluación de Madurez de IA Basada en Evidencias Reales
  public static getMaturityAssessment(): IAMaturityAssessment {
    return {
      currentLevel: 3,
      levelName: 'NIVEL 3 — CONTROLADA',
      description: 'La Inteligencia Artificial está plenamente articulada con gobernanza ética, supervisión humana obligatoria (Human-in-the-loop), minimización de datos sensibles y motores deterministas.',
      evidencesInCode: [
        'Gobernanza de IA implementada con 10 principios éticos y registro de auditoría persistente.',
        'Supervisión humana mandatoria: flujo formal de dictámenes (Validada / Rechazada / Implementada).',
        'Separación estricta entre cálculo matemático determinista (CentralIndicatorEngine) e interpretación consultiva.',
        'Minimización por diseño: exclusión de identificadores personales en llamadas analíticas.',
        'Matriz de control de acceso basada en roles (RBAC) con permisos específicos de IA.'
      ],
      currentGaps: [
        'Simulación predictiva multivariable aún en fase de conceptualización.',
        'La retroalimentación de dictámenes humanos no auto-ajusta hiperparámetros de modelos en caliente.'
      ],
      nextLevelName: 'NIVEL 4 — ESCALABLE',
      recommendedActions: [
        'Desplegar el módulo de correlación multivariable clima vs. ausentismo.',
        'Integrar telemetría de uso para medir el tiempo real de ahorro en la toma de decisiones.',
        'Habilitar exportación estructurada de trazabilidad de IA en formatos estándar para auditoría externa.'
      ],
      maturityScorePercent: 68 // Nivel 3 consolidado (68/100)
    };
  }

  // 9. Métricas e Indicadores de Estrategia Dinámicos por Empresa
  public static getStrategyMetrics(companyId?: string): IAStrategyMetrics {
    const useCases = this.getUseCases();
    const govSummary = IAGovernanceService.getGovernanceSummary(companyId);

    const implemented = useCases.filter(u => u.status === 'IMPLEMENTADO').length;
    const inDev = useCases.filter(u => u.status === 'EN DESARROLLO').length;
    const future = useCases.filter(u => u.status === 'FUTURO').length;

    const totalLogs = govSummary.totalAuditEventsCount;
    const pending = govSummary.pendingRecommendationsCount;
    const validated = govSummary.validatedRecommendationsCount;
    const rejected = govSummary.rejectedRecommendationsCount;
    const implementedRecs = govSummary.implementedRecommendationsCount;
    const reviewed = validated + rejected + implementedRecs;

    const reviewedPercent = totalLogs > 0 ? Math.round((reviewed / totalLogs) * 100) : 0;
    const validatedPercent = reviewed > 0 ? Math.round((validated / reviewed) * 100) : 0;
    const rejectedPercent = reviewed > 0 ? Math.round((rejected / reviewed) * 100) : 0;
    const implementedPercent = reviewed > 0 ? Math.round((implementedRecs / reviewed) * 100) : 0;

    return {
      totalUseCasesCount: useCases.length,
      implementedUseCasesCount: implemented,
      inDevelopmentUseCasesCount: inDev,
      futureUseCasesCount: future,
      totalAnalysesExecuted: totalLogs,
      totalRecommendationsGenerated: totalLogs,
      reviewedRecommendationsPercent: reviewedPercent,
      validatedRecommendationsPercent: validatedPercent,
      rejectedRecommendationsPercent: rejectedPercent,
      implementedRecommendationsPercent: implementedPercent,
      openAIRisksCount: govSummary.openRisksCount,
      controlledAIRisksCount: govSummary.mitigatedRisksCount,
      humanInterventionRatePercent: 100 // 100% obligatorio por diseño
    };
  }

  // 10. Roadmap Estratégico de IA
  public static getAIRoadmap() {
    return {
      actual: {
        title: 'FASE ACTUAL — CONSOLIDADA',
        period: 'Q3 2026',
        status: 'Completado',
        color: 'border-emerald-300 bg-emerald-50/40 text-emerald-950',
        items: [
          'Gobernanza de IA con decálogo ético y matriz de riesgos metodológica.',
          'Supervisión humana obligatoria (Human-in-the-loop) con auditoría persistente.',
          'Cálculo determinista de indicadores sobre censo de 482 colaboradores.',
          'Generación de informe ejecutivo estructurado ISO 45001 (Prompt38).',
          'Minimización de datos sensibles y control de accesos RBAC.'
        ]
      },
      cortoPlazo: {
        title: 'CORTO PLAZO — EN CURSO',
        period: 'Q4 2026',
        status: 'En Desarrollo',
        color: 'border-indigo-300 bg-indigo-50/40 text-indigo-950',
        items: [
          'Módulo de correlación analítica Clima Organizacional vs. Ausentismo Médico.',
          'Calibración de prompts de recomendaciones según sector económico específico.',
          'Generación guiada de matrices de intervención por sede operativa.',
          'Reporte descargable de trazabilidad ética de IA para comités de convivencia.'
        ]
      },
      medianoPlazo: {
        title: 'MEDIANO PLAZO — PROYECTADO',
        period: 'Q1 - Q2 2027',
        status: 'Planificado',
        color: 'border-cyan-300 bg-cyan-50/40 text-cyan-950',
        items: [
          'Simulador de escenarios de riesgo para proyección de ausentismo.',
          'Asistente predictivo de fatiga laboral en turnos rotativos continuos.',
          'Integración de telemetría de uso para auditorías de eficiencia operativa.',
          'Algoritmos de NLP para validación psicométrica de nuevas encuestas.'
        ]
      },
      largoPlazo: {
        title: 'LARGO PLAZO — VISIÓN ESTRATÉGICA',
        period: '2027+',
        status: 'Visión',
        color: 'border-slate-300 bg-slate-50/60 text-slate-900',
        items: [
          'Ecosistema multiempresa federado con benchmarks anonimizados por industria.',
          'Modelos de IA adaptativos con auto-aprendizaje restringido a políticas SG-SST.',
          'Gemelos digitales de salud ocupacional para simulación de condiciones laborales.',
          'Integración con plataformas de ARL y sistemas nacionales de salud en el trabajo.'
        ]
      }
    };
  }

  // 11. Diferenciadores Estratégicos
  public static getDifferentiators() {
    return [
      {
        title: 'Integración Capital Humano + SG-SST',
        desc: 'Unifica la visión de bienestar organizacional y la gestión técnica de seguridad y salud en el trabajo en una sola plataforma.'
      },
      {
        title: 'Paridad Matemática Total',
        desc: 'La IA no inventa ni alucina cifras: los números provienen de un motor de indicadores determinista con paridad entre Dashboard e Informes.'
      },
      {
        title: 'Gobernanza Ética y Supervisión Humana',
        desc: 'Modelo Human-in-the-loop inquebrantable que prohíbe decisiones autónomas sobre despidos, sanciones o diagnósticos clínicos.'
      },
      {
        title: 'Aislamiento Multiempresa Estricto',
        desc: 'Garantía de privacidad tenant a tenant con parametrización de catálogos, logos y roles de visualización.'
      },
      {
        title: 'Minimización de Datos Sensibles',
        desc: 'Sanitización previa de datos personales para preservar el Habeas Data (Ley 1581) y la confidencialidad médica.'
      }
    ];
  }
}
