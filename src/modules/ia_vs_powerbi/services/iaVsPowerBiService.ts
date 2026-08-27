import {
  ComparisonCriterionItem,
  DifferentialItem,
  ComplementarityItem,
  UsageScenarioItem,
  CostComparisonItem,
  DecisionCriterionWeight,
  TraceabilityLogEntry,
  AcademicConclusionConfig,
  IaVsPowerBiModuleState
} from '../types/iaVsPowerBi.types';

export const DEFAULT_CRITERIA_MATRIX: ComparisonCriterionItem[] = [
  {
    id: 'crit_recoleccion_encuestas',
    category: 'RECOLECCION_DATOS',
    name: 'Recolección de Encuestas',
    insightPeopleVal: 'Módulo nativo integrado con constructor dinámico de preguntas, validación de obligatoriedad, guardado incremental y firma digital.',
    powerBiVal: 'No posee módulo de captura nativo; requiere herramientas externas como Microsoft Forms, Power Apps o Typeform para ingesta de datos.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/encuesta_sociodemografica / constructor_encuestas',
    notes: 'Insight People captura y estructura en el punto de origen sin intermediarios.'
  },
  {
    id: 'crit_carga_excel',
    category: 'RECOLECCION_DATOS',
    name: 'Carga e Ingesta de Excel',
    insightPeopleVal: 'Parser especializado con autodetector de encabezados, mapeo inteligente de columnas SG-SST y vista previa con validación de tipos.',
    powerBiVal: 'Power Query ofrece conectividad robusta a Excel, pero requiere configuración manual de transformaciones y tipos de datos por un analista.',
    diferencialScope: 'EQUIVALENTE',
    verifiedInCode: true,
    codeReference: 'src/utils/excelParser.ts / validador_excel',
    notes: 'Power BI es más flexible para cualquier formato; Insight People IA está pre-calibrado específicamente para plantillas de Gestión Humana.'
  },
  {
    id: 'crit_validacion_datos',
    category: 'VALIDACION_CALIDAD',
    name: 'Validación de Calidad de Datos',
    insightPeopleVal: 'Motor de 17 dimensiones de calidad (integridad de cédula, edad vs. fecha nacimiento, coherencia salarial, morbilidad sentida, completitud).',
    powerBiVal: 'Requiere escribir código manual en Power Query (M) o DAX con columnas calculadas para detectar anomalías específicas de SST.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/validador_excel/services/excelValidationService.ts',
    notes: 'Validación de negocio automática sin requerir desarrollo de reglas en M.'
  },
  {
    id: 'crit_indicadores_sgsst',
    category: 'INDICADORES_SST',
    name: 'Indicadores SG-SST (Decreto 1072 / Res. 0312)',
    insightPeopleVal: 'Motor determinista CentralIndicatorEngine con fórmulas legales estandarizadas: Severidad, Frecuencia, ILI, Morbilidad Osteomuscular y Cobertura.',
    powerBiVal: 'Permite formular cualquier indicador mediante medidas DAX, pero la responsabilidad de la exactitud legal y matemática recae en el desarrollador.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/indicadores/services/CentralIndicatorEngine.ts',
    notes: 'Fórmulas auditadas y pre-construidas que previenen sesgos de cálculo manual.'
  },
  {
    id: 'crit_indicadores_gh',
    category: 'INDICADORES_SST',
    name: 'Indicadores de Gestión Humana',
    insightPeopleVal: 'Cálculo de pirámide demográfica, distribución por género, nivel de escolaridad, estratificación, antigüedad y matriz de riesgo psicosocial.',
    powerBiVal: 'Requiere modelado dimensional (Star Schema), tablas de hechos y medidas DAX complejas para cálculos demográficos.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/analisis/components/CaracterizacionTab.tsx',
    notes: 'Pre-configurado con segmentación automática por sede, área y tipo de contrato.'
  },
  {
    id: 'crit_dashboard',
    category: 'ANALITICA_VISUALIZACION',
    name: 'Dashboard Operativo & Estratégico',
    insightPeopleVal: 'Dashboard pre-estructurado con KPIs automáticos, tarjetas de estado, alertas tempranas de morbilidad y filtros vinculados al censo.',
    powerBiVal: 'Lienzo en blanco con capacidad ilimitada de diseño de tableros, reportes paginados y dashboards para múltiples áreas corporativas.',
    diferencialScope: 'EQUIVALENTE',
    verifiedInCode: true,
    codeReference: 'src/modules/dashboard/components/DashboardModule.tsx',
    notes: 'Insight People ofrece inmediatez especializada; Power BI ofrece personalización visual generalista.'
  },
  {
    id: 'crit_visualizacion',
    category: 'ANALITICA_VISUALIZACION',
    name: 'Capacidad de Visualización de Datos',
    insightPeopleVal: 'Gráficos interactivos orientados a SST (pirámides poblacionales, mapas de calor anatómico de síntomas, barras y pastel por sede/área).',
    powerBiVal: 'Ecosistema líder mundial en visualización con más de 200 objetos visuales nativos y del AppSource, personalización de temas y micro-interacciones.',
    diferencialScope: 'VENTAJA_POWERBI',
    verifiedInCode: true,
    codeReference: 'src/components/ui/charts',
    notes: 'Power BI lidera en variedad de gráficos genéricos y cross-filtering visual avanzado.'
  },
  {
    id: 'crit_analitica_avanzada',
    category: 'ANALITICA_VISUALIZACION',
    name: 'Analítica Multidimensional y Drill-Down',
    insightPeopleVal: 'Segmentación nativa multidimensional por Sede, Área, Cargo, Proceso, Nivel de Riesgo y Rango Etario en tiempo real.',
    powerBiVal: 'Capacidad de drill-down, drill-through, parámetros What-If, agregaciones complejas y análisis de series de tiempo de alto volumen.',
    diferencialScope: 'VENTAJA_POWERBI',
    verifiedInCode: true,
    codeReference: 'src/modules/analisis/services/analisisService.ts',
    notes: 'Power BI destaca en profundidad analítica general; Insight destaca en contexto semántico de SST.'
  },
  {
    id: 'crit_ia_generativa',
    category: 'IA_GOBERNANZA',
    name: 'IA Generativa Consultiva & Contextual',
    insightPeopleVal: 'Copilot nativo y Centro de Inteligencia conectado al censo real y al motor de indicadores con prompts contextuales de SST.',
    powerBiVal: 'Copilot for Power BI disponible en capacidades Premium/Fabric, enfocado en generar medidas DAX, resúmenes de texto o gráficos sugeridos.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/copilot/services/copilotService.ts / server.ts',
    notes: 'La IA de Insight People razona sobre la normativa colombiana de SST y patologías laborales de forma nativa.'
  },
  {
    id: 'crit_recomendaciones_auto',
    category: 'IA_GOBERNANZA',
    name: 'Recomendaciones Automatizadas y Planes',
    insightPeopleVal: 'Generador de intervenciones preventivas priorizadas por severidad con planes de acción asignables y medibles en el tiempo.',
    powerBiVal: 'Power BI es una herramienta de lectura y visualización; no genera flujos de planes de acción accionables nativamente.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/planes_accion/services/planesAccionService.ts',
    notes: 'Insight People cierra la brecha entre el insight analítico y la ejecución operativa del plan.'
  },
  {
    id: 'crit_gobernanza_ia',
    category: 'IA_GOBERNANZA',
    name: 'Gobernanza de IA & Principios Éticos',
    insightPeopleVal: 'Módulo formal de Gobernanza con inventario de modelos, matriz de riesgos de IA, principios éticos y registro de trazabilidad.',
    powerBiVal: 'Microsoft Responsible AI aplica a nivel de Azure/Fabric, pero no provee un panel de gobernanza ética editable dentro del reporte de usuario.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/ia/components/IAGovernanceModule.tsx',
    notes: 'Insight People expone la gobernanza al líder de SST y auditor de cumplimiento.'
  },
  {
    id: 'crit_human_in_loop',
    category: 'IA_GOBERNANZA',
    name: 'Supervisión Humana (Human-in-the-loop)',
    insightPeopleVal: 'Flujo formal de aprobación, rechazo o modificación de dictámenes emitidos por la IA antes de convertirse en planes oficiales.',
    powerBiVal: 'No aplica; Power BI no emite dictámenes prescriptivos de salud o riesgos que requieran flujo de firma humana.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/ia/services/iaGovernanceService.ts',
    notes: 'Garantiza que ningún diagnóstico o acción correctiva se ejecute sin aval de un profesional calificado.'
  },
  {
    id: 'crit_gestion_riesgos_ia',
    category: 'IA_GOBERNANZA',
    name: 'Gestión de Riesgos Específicos de IA',
    insightPeopleVal: 'Matriz de riesgo de alucinación, sesgo demográfico, fuga de datos médicos y pérdida de explicabilidad con mitigaciones activas.',
    powerBiVal: 'Políticas corporativas de Microsoft Cloud gestionadas a nivel de tenant IT/Administrador de Microsoft 365.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/ia/types/iaGovernance.types.ts',
    notes: 'Enfoque de gestión de riesgos adaptado a la confidencialidad de la historia clínica ocupacional.'
  },
  {
    id: 'crit_informe_ejecutivo',
    category: 'INFORMES_AUTOMATIZACION',
    name: 'Informe Ejecutivo Automatizado (Prompt 38 / ISO 45001)',
    insightPeopleVal: 'Generador automatizado de informe gerencial bajo estándar Prompt 38 con paridad matemática exacta y exportación ejecutiva.',
    powerBiVal: 'Permite exportar páginas a PDF o PowerPoint, pero no redacta un informe gerencial estructurado con narrativa clínica y legal completa.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/informes/services/Prompt38ReportEngine.ts',
    notes: 'Ahorra semanas de redacción y consolidación de informes de fin de año o auditorías de ARL.'
  },
  {
    id: 'crit_parametrizacion_empresa',
    category: 'PARAMETRIZACION_MULTIEMPRESA',
    name: 'Parametrización por Empresa',
    insightPeopleVal: 'Configuración personalizada de logo, colores, NIT, ARL, nivel de riesgo, jornada laboral y umbrales de alerta de SST.',
    powerBiVal: 'Altamente parametrizable mediante temas JSON y variables de entorno, pero requiere conocimientos técnicos de BI para ajustar.',
    diferencialScope: 'EQUIVALENTE',
    verifiedInCode: true,
    codeReference: 'src/modules/configuracion/useEmpresa.ts',
    notes: 'Insight People ofrece UI lista para usuarios finales de Gestión Humana.'
  },
  {
    id: 'crit_sede_area_proyecto',
    category: 'PARAMETRIZACION_MULTIEMPRESA',
    name: 'Gestión de Sedes, Áreas, Cargos y Proyectos',
    insightPeopleVal: 'Catálogos organizacionales normalizados que vinculan automáticamente a colaboradores, encuestas, informes e indicadores.',
    powerBiVal: 'Depende de las tablas de dimensiones creadas en el modelo de datos relacional y de la calidad del ERP de origen.',
    diferencialScope: 'EQUIVALENTE',
    verifiedInCode: true,
    codeReference: 'src/modules/catalogos_organizacionales/services/catalogosService.ts',
    notes: 'Insight People asegura integridad referencial en tiempo de ejecución.'
  },
  {
    id: 'crit_multiempresa',
    category: 'PARAMETRIZACION_MULTIEMPRESA',
    name: 'Aislamiento Multiempresa (Multi-Tenant)',
    insightPeopleVal: 'Aislamiento estricto de datos, configuraciones, encuestas y auditoría por activeCompanyId con cambio instantáneo de tenant.',
    powerBiVal: 'Soporta Multi-Tenant mediante Row-Level Security (RLS) y áreas de trabajo (Workspaces) independientes, requiriendo configuración de IT.',
    diferencialScope: 'EQUIVALENTE',
    verifiedInCode: true,
    codeReference: 'src/modules/administracion_empresas/services/empresasService.ts',
    notes: 'Power BI escala mediante Azure Active Directory; Insight People ofrece gestión nativa de empresas sin depender de IT.'
  },
  {
    id: 'crit_trazabilidad_auditoria',
    category: 'PARAMETRIZACION_MULTIEMPRESA',
    name: 'Trazabilidad y Auditoría de Cambios',
    insightPeopleVal: 'Logs inmutables de modificaciones en encuestas, roles, gobernanza, estrategia y viabilidad con usuario, fecha y justificación.',
    powerBiVal: 'Audit Logs disponibles en Microsoft Purview / Power BI Admin Portal para consultas de acceso, vistas y exportaciones de reportes.',
    diferencialScope: 'EQUIVALENTE',
    verifiedInCode: true,
    codeReference: 'src/core/audit/auditLogger.ts',
    notes: 'Insight People audita la lógica de negocio y edición de datos; Power BI audita el acceso a la plataforma.'
  },
  {
    id: 'crit_gestion_encuestas',
    category: 'RECOLECCION_DATOS',
    name: 'Gestión de Campañas y Convocatorias',
    insightPeopleVal: 'Monitoreo de tasa de respuesta en vivo, envío de recordatorios, enlaces anónimos y cálculo automático de representatividad.',
    powerBiVal: 'No aplica; Power BI solo lee la tabla de respuestas una vez cargada en el repositorio de base de datos.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/constructor_encuestas/services/surveyBuilderService.ts',
    notes: 'Control del ciclo de vida de la recolección en tiempo real.'
  },
  {
    id: 'crit_datos_sociodemograficos',
    category: 'INDICADORES_SST',
    name: 'Gestión de Datos Sociodemográficos',
    insightPeopleVal: 'Modelo de datos maestro 3NF con normalización de censo de 482 colaboradores, perfiles de salud y antecedentes laborales.',
    powerBiVal: 'Almacena y procesa cualquier volumen de datos en memoria (VertiPaq engine), excelente para millones de registros.',
    diferencialScope: 'COMPLEMENTARIO',
    verifiedInCode: true,
    codeReference: 'src/modules/colaboradores/services/colaboradoresService.ts',
    notes: 'Insight People estructura los datos de entrada; Power BI puede consumirlos para análisis de Big Data.'
  },
  {
    id: 'crit_riesgos_laborales',
    category: 'INDICADORES_SST',
    name: 'Gestión Integral de Riesgos Laborales',
    insightPeopleVal: 'Matriz de Peligros integrada con clasificación GTC 45, morbilidad osteomuscular sentida y alertas preventivas.',
    powerBiVal: 'Capaz de visualizar matrices de riesgo mediante scatter charts y matrices visuales si se construyen los datasets y medidas.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/mapa_riesgos/services/mapaRiesgosService.ts',
    notes: 'Reglas de severidad y clasificación de riesgos integradas de fábrica.'
  },
  {
    id: 'crit_escalabilidad',
    category: 'ESCALABILIDAD_DESPLIEGUE',
    name: 'Escalabilidad Tecnológica y Volumetría',
    insightPeopleVal: 'Arquitectura web modular basada en estándares cloud, óptima para organizaciones de hasta decenas de miles de colaboradores.',
    powerBiVal: 'Escalabilidad masiva de nivel empresarial global, procesando terabytes de información corporativa en Microsoft Fabric / Azure.',
    diferencialScope: 'VENTAJA_POWERBI',
    verifiedInCode: true,
    codeReference: 'src/modules/arquitectura_datos/services/MasterDataModelService.ts',
    notes: 'Power BI es insuperable para consolidaciones masivas de datos multi-fuente heterogéneas.'
  },
  {
    id: 'crit_integraciones',
    category: 'ESCALABILIDAD_DESPLIEGUE',
    name: 'Ecosistema de Integraciones & Conectores',
    insightPeopleVal: 'Exportación a Excel/CSV estructurado, API endpoints REST y esquemas dimensionales 3NF compatibles para conexión externa.',
    powerBiVal: 'Más de 300 conectores nativos (SAP, Oracle, Salesforce, SQL Server, Dataverse, Excel, APIs, Webhooks, Azure Synapse).',
    diferencialScope: 'VENTAJA_POWERBI',
    verifiedInCode: true,
    codeReference: 'src/modules/arquitectura_datos/components/DataModelExplorer.tsx',
    notes: 'Power BI conecta con cualquier infraestructura existente; Insight People provee los datos de SST ya procesados.'
  },
  {
    id: 'crit_personalizacion',
    category: 'ESCALABILIDAD_DESPLIEGUE',
    name: 'Personalización Visual y Layout Libre',
    insightPeopleVal: 'Diseño UX/UI pre-diseñado y optimizado para flujos ergonómicos de Gestión Humana sin requerir maquetación por el usuario.',
    powerBiVal: 'Libertad absoluta de diagramación visual, formato condicional libre, bookmarks, tooltips personalizados y navegación por botones.',
    diferencialScope: 'VENTAJA_POWERBI',
    verifiedInCode: true,
    codeReference: 'src/App.tsx / Sidebar.tsx',
    notes: 'Power BI permite crear cualquier reporte a medida; Insight People ofrece una experiencia lista para usar sin curva de diseño.'
  },
  {
    id: 'crit_facilidad_implementacion',
    category: 'ESCALABILIDAD_DESPLIEGUE',
    name: 'Facilidad y Velocidad de Implementación (Time-to-Value)',
    insightPeopleVal: 'Inmediata: sin necesidad de modelar tablas, escribir DAX, diseñar dashboards ni programar fórmulas de SST. Se carga y funciona.',
    powerBiVal: 'Requiere proyecto de BI: modelado ETL, diseño de medidas DAX, validación con usuarios clave y mantenimiento técnico continuo.',
    diferencialScope: 'VENTAJA_INSIGHT',
    verifiedInCode: true,
    codeReference: 'src/modules/validador_excel/services/excelValidationService.ts',
    notes: 'Insight People reduce el tiempo de puesta en marcha de meses a horas.'
  }
];

export const VERIFIED_DIFFERENTIALS: DifferentialItem[] = [
  {
    id: 'diff_1',
    number: 1,
    name: 'Encuesta Sociodemográfica Integrada',
    category: 'CAPTURA',
    description: 'Captura digital directa sin herramientas intermedias, garantizando integridad referencial con el maestro de colaboradores.',
    technicalVerification: 'Verificable en /src/modules/encuesta_sociodemografica y constructor_encuestas.',
    businessImpact: 'Elimina la duplicidad de captura y la pérdida de consistencia entre formatos aislados.'
  },
  {
    id: 'diff_2',
    number: 2,
    name: 'Carga y Validador Inteligente de Excel',
    category: 'CAPTURA',
    description: 'Parser con detección de esquemas, normalización de campos y visualización previa de inconsistencias antes de impactar el censo.',
    technicalVerification: 'Verificable en /src/utils/excelParser.ts y excelValidationService.ts.',
    businessImpact: 'Ahorra hasta un 85% del tiempo que los analistas dedican a limpiar archivos de Excel.'
  },
  {
    id: 'diff_3',
    number: 3,
    name: 'Validación Automatizada de Calidad (17 Dimensiones)',
    category: 'CAPTURA',
    description: 'Verificación de completitud, unicidad, tipos de datos, coherencia lógica (ej. edad vs. tiempo de servicio) y consistencia salarial.',
    technicalVerification: 'Verificable en /src/modules/validador_excel.',
    businessImpact: 'Asegura que las decisiones gerenciales se tomen sobre datos 100% auditados y limpios.'
  },
  {
    id: 'diff_4',
    number: 4,
    name: 'Indicadores Especializados Deterministas de SG-SST',
    category: 'MOTOR_CALCULO',
    description: 'CentralIndicatorEngine codificado con fórmulas exactas según normativa colombiana (Decreto 1072/2015, Res. 0312/2019).',
    technicalVerification: 'Verificable en /src/modules/indicadores/services/CentralIndicatorEngine.ts.',
    businessImpact: 'Evita errores humanos y discrepancias de cálculo en auditorías del Ministerio de Trabajo o ARL.'
  },
  {
    id: 'diff_5',
    number: 5,
    name: 'Analítica Sociodemográfica y Demográfica',
    category: 'MOTOR_CALCULO',
    description: 'Segmentación cruzada por género, rangos etarios, nivel educativo, estrato socioeconómico y tipo de contratación.',
    technicalVerification: 'Verificable en /src/modules/analisis.',
    businessImpact: 'Permite diseñar planes de bienestar focalizados en las necesidades reales del personal.'
  },
  {
    id: 'diff_6',
    number: 6,
    name: 'Indicadores de Morbilidad Osteomuscular Sentida',
    category: 'MOTOR_CALCULO',
    description: 'Mapeo anatómico segmentado por segmentos corporales (cuello, espalda dorsal/lumbar, hombros, muñecas, miembros inferiores).',
    technicalVerification: 'Verificable en /src/modules/analisis/components/MorbilidadTab.tsx.',
    businessImpact: 'Identificación temprana de desórdenes musculoesqueléticos antes de convertirse en enfermedades laborales.'
  },
  {
    id: 'diff_7',
    number: 7,
    name: 'Informe Ejecutivo Automatizado (Prompt 38 / ISO 45001)',
    category: 'MOTOR_CALCULO',
    description: 'Motor generador de informes de paridad matemática completa que redacta la estructura de diagnóstico gerencial.',
    technicalVerification: 'Verificable en /src/modules/informes/services/Prompt38ReportEngine.ts.',
    businessImpact: 'Disminuye de 15 días a 1 minuto el tiempo de consolidación del informe anual de SST.'
  },
  {
    id: 'diff_8',
    number: 8,
    name: 'IA Consultiva Especializada en SG-SST',
    category: 'IA_ETICA',
    description: 'Agente conversacional y centro de inteligencia contextualizado con el censo y la normativa de seguridad y salud en el trabajo.',
    technicalVerification: 'Verificable en /src/modules/copilot y centro_inteligencia.',
    businessImpact: 'Brinda respuestas y análisis normativos inmediatos al equipo de Gestión Humana.'
  },
  {
    id: 'diff_9',
    number: 9,
    name: 'Gobernanza de IA y Principios Éticos',
    category: 'IA_ETICA',
    description: 'Framework visible de principios de transparencia, equidad, privacidad médica y no discriminación en algoritmos de IA.',
    technicalVerification: 'Verificable en /src/modules/ia/components/IAGovernanceModule.tsx.',
    businessImpact: 'Cumplimiento con directrices éticas internacionales y protección de datos sensibles (Ley 1581).'
  },
  {
    id: 'diff_10',
    number: 10,
    name: 'Supervisión Humana Obligatoria (Human-in-the-Loop)',
    category: 'IA_ETICA',
    description: 'Flujo formal que requiere validación por el Líder de SST o Médico Laboral antes de aplicar recomendaciones de IA.',
    technicalVerification: 'Verificable en /src/modules/ia/services/iaGovernanceService.ts.',
    businessImpact: 'Garantiza responsabilidad legal y ética humana sobre cualquier decisión que afecte a los trabajadores.'
  },
  {
    id: 'diff_11',
    number: 11,
    name: 'Matriz de Gestión de Riesgos de IA',
    category: 'IA_ETICA',
    description: 'Mapeo sistemático de riesgos tecnológicos y algorítmicos con protocolos de mitigación específicos para salud ocupacional.',
    technicalVerification: 'Verificable en /src/modules/ia/types/iaGovernance.types.ts.',
    businessImpact: 'Previene alucinaciones, sesgos de evaluación y vulnerabilidades de seguridad.'
  },
  {
    id: 'diff_12',
    number: 12,
    name: 'Estrategia y Mapa de Casos de Uso de IA',
    category: 'IA_ETICA',
    description: 'Alineación de iniciativas de IA con pilares estratégicos de retención, prevención y madurez organizacional.',
    technicalVerification: 'Verificable en /src/modules/ia/components/IAStrategyModule.tsx.',
    businessImpact: 'Asegura que la IA genere retorno sobre la inversión y no sea un mero experimento tecnológico.'
  },
  {
    id: 'diff_13',
    number: 13,
    name: 'Viabilidad Empresarial y Simulador de ROI',
    category: 'GESTION_EMPRESARIAL',
    description: 'Simulador financiero integrado que proyecta ahorros de horas-hombre, costos operativos y retorno económico de la prevención.',
    technicalVerification: 'Verificable en /src/modules/viabilidad_negocio.',
    businessImpact: 'Demuestra con números ante la Junta Directiva el valor financiero de la gestión preventiva.'
  },
  {
    id: 'diff_14',
    number: 14,
    name: 'Aislamiento Multiempresa Seguro (Multi-Tenant)',
    category: 'GESTION_EMPRESARIAL',
    description: 'Particionamiento estricto de base de datos, censo y analítica por tenant corporativo.',
    technicalVerification: 'Verificable en /src/modules/administracion_empresas.',
    businessImpact: 'Permite a holdings o consultoras gestionar múltiples empresas de forma totalmente confidencial e independiente.'
  },
  {
    id: 'diff_15',
    number: 15,
    name: 'Parametrización Jerárquica de Sede, Área y Proyecto',
    category: 'GESTION_EMPRESARIAL',
    description: 'Estructura organizativa multinivel que permite focalizar indicadores y planes de acción en centros de trabajo específicos.',
    technicalVerification: 'Verificable en /src/modules/catalogos_organizacionales.',
    businessImpact: 'Visibilidad granular de la siniestralidad y bienestar por unidad de negocio.'
  }
];

export const COMPLEMENTARITY_MATRIX: ComplementarityItem[] = [
  {
    id: 'comp_1',
    dimension: 'Captura y Validación de Datos',
    insightRole: 'Aplica encuestas especializadas a los colaboradores, valida 17 reglas de calidad y genera el censo 3NF limpio.',
    powerBiRole: 'Consume los datos sociodemográficos y de salud ya depurados por Insight People IA mediante API o exportación estructurada.',
    synergyOutcome: 'Power BI recibe datos 100% confiables y limpios sin requerir flujos complejos de limpieza en Power Query.',
    practicalWorkflow: 'Colaborador diligencia encuesta en Insight People → Validador limpia inconsistencias → Power BI actualiza dataset corporativo.'
  },
  {
    id: 'comp_2',
    dimension: 'Cálculo de Indicadores vs. Consolidación Corporativa',
    insightRole: 'Calcula indicadores normativos de SG-SST (Severidad, Frecuencia, ILI, Morbilidad) con fórmulas legales auditadas.',
    powerBiRole: 'Combina los KPIs de SST con datos financieros (ERP SAP/Oracle), ventas y nómina en el Balanced Scorecard corporativo.',
    synergyOutcome: 'La empresa mantiene la exactitud legal en SST y la integración financiera global en Power BI.',
    practicalWorkflow: 'Insight People genera indicadores mensuales de SST → Power BI los integra al tablero de control de la Gerencia General.'
  },
  {
    id: 'comp_3',
    dimension: 'Analítica Consultiva e IA vs. Reportes Ejecutivos Masivos',
    insightRole: 'Provee análisis contextual de causas raíz, diagnósticos psicosociales y recomendaciones de intervención con supervisión HITL.',
    powerBiRole: 'Distribuye dashboards interactivos a cientos de gerentes y líderes mediante Microsoft Teams y Power BI Service.',
    synergyOutcome: 'Insight People genera el diagnóstico y la prescripción preventiva; Power BI democratiza la visualización a escala masiva.',
    practicalWorkflow: 'Médico Laboral aprueba recomendación en Insight People → Se publica estado de cumplimiento en el dashboard de Power BI.'
  },
  {
    id: 'comp_4',
    dimension: 'Cierre del Ciclo: Del Insight a la Acción',
    insightRole: 'Gestiona la creación, asignación de responsables, fechas límite y seguimiento a la efectividad de planes de acción SG-SST.',
    powerBiRole: 'Monitorea el porcentaje global de avance de planes de acción junto con proyectos de otras áreas de la compañía.',
    synergyOutcome: 'Trazabilidad operativa completa desde el hallazgo médico hasta el cierre del plan de mejora.',
    practicalWorkflow: 'Plan de acción creado y ejecutado en Insight People → KPI de avance reflejado en el reporte ejecutivo de Power BI.'
  }
];

export const USAGE_SCENARIOS: UsageScenarioItem[] = [
  {
    id: 'scen_1',
    code: 'ESCENARIO_1_EXCEL',
    title: 'Escenario 1: Empresa que Solo Utiliza Excel',
    subtitle: 'Transición de planillas manuales y propensas a errores a una solución especializada llave en mano',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    companyProfile: 'Empresas medianas o grandes donde el equipo de SST gestiona encuestas, censo y reportes en múltiples libros de Excel desconectados.',
    currentPainPoint: 'Fórmulas rotas, discrepancias en cédulas, duplicados, semanas perdidas consolidando informes anuales y riesgo alto en auditorías del Ministerio de Trabajo.',
    powerBiRoleInScenario: 'No implementado o utilizado esporádicamente de forma aislada sin modelo de datos.',
    insightPeopleRoleInScenario: 'Solución integral de punta a punta: captura digital, validación automática, cálculo de indicadores y generación del informe ejecutivo en segundos.',
    recommendedArchitecture: 'Adopción directa de Insight People IA como plataforma principal de gestión analítica de Gestión Humana y SG-SST.',
    businessValueDelivered: [
      'Ahorro del 80% en tiempo de procesamiento y reportería de SST.',
      'Garantía de exactitud matemática en indicadores de Resolución 0312 y Decreto 1072.',
      'Centralización y seguridad de datos sensibles de salud de los colaboradores.',
      'Generación inmediata de planes de acción asistidos por IA y validados por humanos.'
    ]
  },
  {
    id: 'scen_2',
    code: 'ESCENARIO_2_POWERBI',
    title: 'Escenario 2: Empresa que ya Utiliza Power BI',
    subtitle: 'Resolución de la brecha de captura, validación normativa e IA consultiva en entornos con BI existente',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    companyProfile: 'Organizaciones con licencias de Power BI y equipo de BI, pero donde Gestión Humana y SST siguen sufriendo para capturar y limpiar datos.',
    currentPainPoint: 'Power BI solo visualiza lo que se le entrega; si los datos de las encuestas son inconsistentes o manuales, el tablero muestra información errónea (Garbage In, Garbage Out).',
    powerBiRoleInScenario: 'Mantenido como el estándar corporativo para tableros generales de la alta dirección.',
    insightPeopleRoleInScenario: 'Herramienta de dominio para los profesionales de Gestión Humana y SST: captura encuestas, limpia datos, aplica reglas clínicas/legales y genera dictámenes.',
    recommendedArchitecture: 'Insight People IA opera como el sistema operativo de SST y exporta datos depurados o KPIs hacia el repositorio consumido por Power BI.',
    businessValueDelivered: [
      'Eliminación de semanas de desarrollo en DAX y Power Query para crear modelos de SST.',
      'Incorporación de capacidades que Power BI no tiene (captura de encuestas, HITL, planes de acción).',
      'Confianza absoluta de que los datos mostrados en Power BI fueron validados en 17 dimensiones.',
      'Acceso a IA consultiva especializada en normativa colombiana de salud ocupacional.'
    ]
  },
  {
    id: 'scen_3',
    code: 'ESCENARIO_3_HIBRIDO',
    title: 'Escenario 3: Arquitectura Híbrida (Insight People IA + Power BI)',
    subtitle: 'Sinergia de máxima madurez analítica para grandes corporaciones y holdings multisede',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    companyProfile: 'Grandes corporaciones con miles de trabajadores, múltiples sedes y un ecosistema de datos maduro gobernado por TI.',
    currentPainPoint: 'Necesidad de combinar la profundidad normativa y operativa de SST con la visión holística del negocio (costos de ausentismo cruzados con productividad y rentabilidad).',
    powerBiRoleInScenario: 'Capa de visualización macro y gobierno corporativo (Enterprise Business Intelligence).',
    insightPeopleRoleInScenario: 'Motor analítico y de inteligencia operativa especializado en Gestión Humana, SST y Riesgo Laboral.',
    recommendedArchitecture: 'Arquitectura desacoplada: Insight People IA gestiona la captura, validación, auditoría y prescripción de SST, y alimenta el Lakehouse/Data Warehouse corporativo.',
    businessValueDelivered: [
      'Máximo aprovechamiento de las fortalezas individuales de ambas plataformas.',
      'Los especialistas de SST trabajan en una interfaz diseñada para su labor diaria.',
      'La Junta Directiva visualiza KPIs de seguridad integrados con el P&L de la compañía.',
      'Gobernanza ética y cumplimiento legal respaldados con trazabilidad inmutable.'
    ]
  }
];

export const COST_COMPARISON_ITEMS: CostComparisonItem[] = [
  {
    id: 'cost_1',
    costCategory: 'Costos de Licenciamiento de Plataforma',
    insightPeopleApproach: 'Suscripción SaaS mensual o anual por empresa/colaboradores que incluye captura, validación, IA y reportería llave en mano.',
    powerBiApproach: 'Licenciamiento Microsoft (Pro, Premium por Usuario o Fabric Capacity) según la cantidad de usuarios visualizadores y creadores.',
    dataClassification: '[B] Supuesto',
    financialImplication: 'El costo de Power BI varía según licenciamiento Microsoft 365, roles y capacidad contratada.',
    riskOrConsideration: 'En Power BI cada visualizador requiere licencia Pro/PPU o una capacidad F64/P1 para visualización masiva.'
  },
  {
    id: 'cost_2',
    costCategory: 'Costos de Desarrollo y Modelado de Datos (DAX / M)',
    insightPeopleApproach: '$0 COP en desarrollo adicional: modelos dimensionales 3NF, fórmulas de Decreto 1072 e informes ya están programados.',
    powerBiApproach: 'Requiere contratar consultoría o asignar ingenieros de BI internos durante 2 a 6 meses para modelar medidas y ETL.',
    dataClassification: '[B] Supuesto',
    financialImplication: 'El costo de consultoría para desarrollar un modelo robusto de SST en Power BI puede superar los $15M-$30M COP.',
    riskOrConsideration: 'Cálculos manuales en DAX pueden contener fallas en la lógica de días perdidos o cálculo de ILI si el consultor no domina SST.'
  },
  {
    id: 'cost_3',
    costCategory: 'Herramientas Complementarias de Captura de Encuestas',
    insightPeopleApproach: '$0 COP: Constructor de encuestas y recolección digital móvil están integrados nativamente.',
    powerBiApproach: 'Requiere licenciamiento adicional de herramientas de recolección (Microsoft Forms Pro, Typeform, SurveyMonkey, Power Apps).',
    dataClassification: '[B] Supuesto',
    financialImplication: 'Costo recurrente adicional de licencias de captura y conectores de datos.',
    riskOrConsideration: 'Desconexión entre el formulario de captura y el repositorio analítico genera fricción operativa.'
  },
  {
    id: 'cost_4',
    costCategory: 'Mantenimiento y Actualizaciones Normativas',
    insightPeopleApproach: 'Incluido en la suscripción: actualizaciones automáticas ante cambios en leyes de SST (Ministerio de Trabajo / MinSalud).',
    powerBiApproach: 'Requiere re-contratación de horas de desarrollo de BI cada vez que cambia una fórmula legal o estructura de reporte.',
    dataClassification: '[B] Supuesto',
    financialImplication: 'Costos de mantenimiento evolutivo impredecibles en Power BI.',
    riskOrConsideration: 'Riesgo de obsolescencia si el analista que construyó el reporte deja la compañía.'
  },
  {
    id: 'cost_5',
    costCategory: 'Consumo de Inteligencia Artificial Generativa',
    insightPeopleApproach: 'IA contextual integrada con gobernanza ética y supervisión humana incluida en el plan profesional/empresarial.',
    powerBiApproach: 'Copilot for Power BI requiere capacidades Microsoft Fabric (F64+) o licencias Copilot específicas de alto valor mensual.',
    dataClassification: '[B] Supuesto',
    financialImplication: 'Acceso a IA corporativa en Power BI exige umbrales mínimos de inversión en infraestructura Azure.',
    riskOrConsideration: 'La IA generalista de Microsoft no tiene pre-entrenamiento en resoluciones específicas de SST colombianas.'
  }
];

export const DEFAULT_DECISION_WEIGHTS: DecisionCriterionWeight[] = [
  {
    id: 'dec_1',
    dimensionName: 'Necesidad de Captura de Encuestas Nativas',
    description: 'Requiere recolectar datos sociodemográficos y de salud directamente de los trabajadores sin usar herramientas externas.',
    userWeight: 5,
    insightFitScore: 98,
    powerBiFitScore: 20
  },
  {
    id: 'dec_2',
    dimensionName: 'Validación Automatizada de Calidad de Datos',
    description: 'Necesidad de auditar y limpiar inconsistencias lógicas en censo y encuestas (17 reglas de calidad de datos).',
    userWeight: 5,
    insightFitScore: 95,
    powerBiFitScore: 40
  },
  {
    id: 'dec_3',
    dimensionName: 'Indicadores Normativos SG-SST (Decreto 1072 / Res. 0312)',
    description: 'Cálculo auditado y estandarizado de Severidad, Frecuencia, ILI y Morbilidad Osteomuscular sin margen de error.',
    userWeight: 5,
    insightFitScore: 99,
    powerBiFitScore: 55
  },
  {
    id: 'dec_4',
    dimensionName: 'IA Consultiva Especializada en Salud y Trabajo',
    description: 'Generación de diagnósticos explicables, resúmenes contextuales y recomendaciones preventivas en lenguaje natural.',
    userWeight: 4,
    insightFitScore: 92,
    powerBiFitScore: 45
  },
  {
    id: 'dec_5',
    dimensionName: 'Gobernanza Ética y Supervisión Humana (HITL)',
    description: 'Control formal sobre dictámenes de IA, mitigación de riesgos de alucinación y protección de datos médicos sensibles.',
    userWeight: 4,
    insightFitScore: 96,
    powerBiFitScore: 30
  },
  {
    id: 'dec_6',
    dimensionName: 'Generación de Informes Ejecutivos Automatizados',
    description: 'Redacción automática del informe anual de SST bajo estructura gerencial lista para firma y entrega a gerencia/ARL.',
    userWeight: 5,
    insightFitScore: 97,
    powerBiFitScore: 35
  },
  {
    id: 'dec_7',
    dimensionName: 'Visualización Multi-Área y Cuadros de Mando Corporativos',
    description: 'Visualización integral de finanzas, operaciones, ventas y mercadeo en tableros consolidados de la compañía.',
    userWeight: 3,
    insightFitScore: 45,
    powerBiFitScore: 98
  },
  {
    id: 'dec_8',
    dimensionName: 'Integración Masiva con Múltiples Fuentes (ERP/CRM/Data Lakes)',
    description: 'Conexión a cientos de bases de datos empresariales simultáneas para modelado de Big Data a gran escala.',
    userWeight: 3,
    insightFitScore: 50,
    powerBiFitScore: 96
  },
  {
    id: 'dec_9',
    dimensionName: 'Velocidad de Puesta en Marcha (Time-to-Value Inmediato)',
    description: 'Deseo de obtener resultados en horas sin atravesar meses de consultoría, modelado DAX y desarrollo de software.',
    userWeight: 4,
    insightFitScore: 95,
    powerBiFitScore: 35
  },
  {
    id: 'dec_10',
    dimensionName: 'Seguimiento y Cierre de Planes de Acción Preventivos',
    description: 'Capacidad de transformar el dato en tareas asignadas, fechas límite y verificación de eficacia en terreno.',
    userWeight: 4,
    insightFitScore: 94,
    powerBiFitScore: 25
  }
];

export const DEFAULT_ACADEMIC_CONCLUSION: AcademicConclusionConfig = {
  version: '2.0-ACADEMIC-VERIFIED',
  lastUpdated: new Date().toISOString(),
  authorUser: 'lider.ghumana@innovatechit.com.co',
  academicThesis: 'Power BI y Insight People IA no constituyen soluciones mutuamente excluyentes en la arquitectura analítica moderna; representan niveles de especialización y abstracción funcional diferenciados.',
  technicalSynthesis: 'Power BI es una plataforma generalista de Business Intelligence de clase mundial orientada a la ingestión flexible, modelado multidimensional y visualización abierta de cualquier dataset corporativo. Insight People IA es un sistema vertical especializado de extremo a extremo para Gestión Humana y SG-SST que integra la captura originaria, validación estricta de 17 dimensiones, cálculo determinista de indicadores legales, IA consultiva explicable, gobernanza ética con supervisión humana y gestión de planes de acción.',
  recommendationSummary: 'Para organizaciones en etapas iniciales o intermedias de madurez analítica, Insight People IA entrega valor inmediato sin fricción técnica. Para grandes corporaciones con infraestructura de BI consolidada, la estrategia óptima es la integración sinérgica: Insight People IA actúa como el motor de dominio y calidad de datos de SST, alimentando la capa de visualización macro de Power BI.',
  maturityAlignment: {
    governanceConnection: 'La Gobernanza de IA asegura que el uso de modelos generativos cumpla con principios de equidad, transparencia y validación humana obligatoria en decisiones de salud laboral.',
    strategyConnection: 'La Estrategia de IA sitúa a Insight People IA en el cuadrante de alto valor estratégico para la retención y bienestar del talento humano.',
    viabilityConnection: 'La Viabilidad del Negocio valida la sostenibilidad financiera mediante la reducción drástica de horas-hombre y la prevención de sanciones normativas.'
  }
};

const STORAGE_KEY_PREFIX = 'insight_ia_vs_powerbi_v1_';

export class IaVsPowerBiService {
  private static getStorageKey(companyId: string): string {
    return `${STORAGE_KEY_PREFIX}${companyId}`;
  }

  public static getState(companyId: string): IaVsPowerBiModuleState {
    try {
      const data = localStorage.getItem(this.getStorageKey(companyId));
      if (data) {
        const parsed = JSON.parse(data);
        return {
          criteria: parsed.criteria || DEFAULT_CRITERIA_MATRIX,
          decisionWeights: parsed.decisionWeights || DEFAULT_DECISION_WEIGHTS,
          scenarios: parsed.scenarios || USAGE_SCENARIOS,
          academicConclusion: parsed.academicConclusion || DEFAULT_ACADEMIC_CONCLUSION,
          auditLogs: parsed.auditLogs || []
        };
      }
    } catch (e) {
      console.error('Error loading IA vs PowerBI state:', e);
    }

    return {
      criteria: DEFAULT_CRITERIA_MATRIX,
      decisionWeights: DEFAULT_DECISION_WEIGHTS,
      scenarios: USAGE_SCENARIOS,
      academicConclusion: DEFAULT_ACADEMIC_CONCLUSION,
      auditLogs: []
    };
  }

  public static saveState(companyId: string, state: IaVsPowerBiModuleState): void {
    try {
      localStorage.setItem(this.getStorageKey(companyId), JSON.stringify(state));
    } catch (e) {
      console.error('Error saving IA vs PowerBI state:', e);
    }
  }

  public static updateDecisionWeight(
    companyId: string,
    weightId: string,
    newWeight: number,
    userEmail: string,
    userRole: string,
    justification: string
  ): IaVsPowerBiModuleState {
    const state = this.getState(companyId);
    const itemIndex = state.decisionWeights.findIndex(w => w.id === weightId);
    
    if (itemIndex >= 0) {
      const prevVal = state.decisionWeights[itemIndex].userWeight.toString();
      state.decisionWeights[itemIndex].userWeight = newWeight;

      const logEntry: TraceabilityLogEntry = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toISOString(),
        user: userEmail || 'Usuario Actual',
        role: userRole || 'DIRECTOR_SST',
        category: 'PESO',
        fieldChanged: `Ponderación de '${state.decisionWeights[itemIndex].dimensionName}'`,
        previousValue: prevVal,
        newValue: newWeight.toString(),
        justification: justification || 'Ajuste de relevancia para la matriz de decisión empresarial'
      };

      state.auditLogs.unshift(logEntry);
      this.saveState(companyId, state);
    }

    return state;
  }

  public static updateAcademicConclusion(
    companyId: string,
    updatedConclusion: Partial<AcademicConclusionConfig>,
    userEmail: string,
    userRole: string,
    justification: string
  ): IaVsPowerBiModuleState {
    const state = this.getState(companyId);
    state.academicConclusion = {
      ...state.academicConclusion,
      ...updatedConclusion,
      lastUpdated: new Date().toISOString(),
      authorUser: userEmail || state.academicConclusion.authorUser
    };

    const logEntry: TraceabilityLogEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      user: userEmail || 'Usuario Actual',
      role: userRole || 'DIRECTOR_SST',
      category: 'CONCLUSION',
      fieldChanged: 'Conclusión Académica y Estratégica',
      previousValue: 'Versión previa',
      newValue: state.academicConclusion.version,
      justification: justification || 'Actualización de tesis y síntesis técnica'
    };

    state.auditLogs.unshift(logEntry);
    this.saveState(companyId, state);
    return state;
  }

  public static calculateDecisionScore(weights: DecisionCriterionWeight[]): {
    insightTotalScore: number;
    powerBiTotalScore: number;
    insightWeightedAvg: number;
    powerBiWeightedAvg: number;
    recommendedOption: 'INSIGHT_PEOPLE_IA' | 'POWER_BI' | 'ARQUITECTURA_HIBRIDA';
    summaryReason: string;
  } {
    let totalWeight = 0;
    let insightWeightedSum = 0;
    let powerBiWeightedSum = 0;

    weights.forEach(w => {
      totalWeight += w.userWeight;
      insightWeightedSum += w.insightFitScore * w.userWeight;
      powerBiWeightedSum += w.powerBiFitScore * w.userWeight;
    });

    const insightWeightedAvg = totalWeight > 0 ? Math.round(insightWeightedSum / totalWeight) : 0;
    const powerBiWeightedAvg = totalWeight > 0 ? Math.round(powerBiWeightedSum / totalWeight) : 0;

    let recommendedOption: 'INSIGHT_PEOPLE_IA' | 'POWER_BI' | 'ARQUITECTURA_HIBRIDA' = 'INSIGHT_PEOPLE_IA';
    let summaryReason = '';

    const diff = Math.abs(insightWeightedAvg - powerBiWeightedAvg);

    if (diff <= 12 && insightWeightedAvg >= 65 && powerBiWeightedAvg >= 65) {
      recommendedOption = 'ARQUITECTURA_HIBRIDA';
      summaryReason = 'La organización presenta necesidades críticas en ambos frentes: especialización normativa en Gestión Humana/SST y necesidad de consolidación macro-corporativa.';
    } else if (insightWeightedAvg > powerBiWeightedAvg) {
      recommendedOption = 'INSIGHT_PEOPLE_IA';
      summaryReason = 'Alta prioridad en recolección de encuestas, validación de calidad, cálculo legal determinista de SST, IA consultiva y generación automatizada de informes.';
    } else {
      recommendedOption = 'POWER_BI';
      summaryReason = 'Alta prioridad en visualización transversal multi-departamento, integración con múltiples ERPs y personalización libre de tableros.';
    }

    return {
      insightTotalScore: insightWeightedSum,
      powerBiTotalScore: powerBiWeightedSum,
      insightWeightedAvg,
      powerBiWeightedAvg,
      recommendedOption,
      summaryReason
    };
  }
}
