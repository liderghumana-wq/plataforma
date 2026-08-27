import { 
  BusinessCanvasItem, 
  ClientSegmentItem, 
  MonetizationModelItem, 
  CommercialPlanItem, 
  FinancialScenarioParams, 
  ClientROICalculatorParams, 
  ViabilityMatrixDimension, 
  CompetitiveAdvantageItem, 
  ScalabilityDimensionItem, 
  CommercialRoadmapPhase, 
  FinancialAuditChangeLog 
} from '../types/viabilidad.types';

export class ViabilidadService {

  private static getStorageKey(companyId?: string): string {
    return `insight_viabilidad_v1_${companyId || 'default'}`;
  }

  // 1. Business Model Canvas Inicial
  public static getBusinessCanvas(): BusinessCanvasItem[] {
    return [
      {
        id: 'bc-prob',
        category: 'PROBLEMA',
        title: 'Fragmentación y lentitud en SG-SST',
        description: 'Procesamiento manual en múltiples hojas de Excel, dificultad para cruzar morbilidad con sedes y demora de semanas en generar informes para comités y gerencia.',
        dataClassification: '[A] Dato real'
      },
      {
        id: 'bc-seg',
        category: 'SEGMENTOS',
        title: 'Empresas medianas/grandes y BPO',
        description: 'Organizaciones con más de 100 colaboradores, empresas de contact center con turnos rotativos y consultoras de gestión humana con múltiples clientes.',
        dataClassification: '[B] Supuesto'
      },
      {
        id: 'bc-prop',
        category: 'PROPUESTA_VALOR',
        title: 'Analítica integrada + IA con supervisión humana',
        description: 'Plataforma unificada de Capital Humano y SG-SST que integra censo, encuesta, cálculo matemático determinista y recomendaciones consultivas auditables.',
        dataClassification: '[A] Dato real'
      },
      {
        id: 'bc-act',
        category: 'ACTIVIDADES_CLAVE',
        title: 'Desarrollo de software y calibración de motores',
        description: 'Mantenimiento del motor CentralIndicatorEngine, actualización normativa (Decreto 1072, Res 0312), seguridad de datos y soporte al cliente.',
        dataClassification: '[A] Dato real'
      },
      {
        id: 'bc-rec',
        category: 'RECURSOS_CLAVE',
        title: 'Arquitectura tecnológica e IP analítica',
        description: 'Plataforma web React/TypeScript, base de datos aislada multiempresa, motor Prompt38 de reportes y algoritmos de clustering ergonómico.',
        dataClassification: '[A] Dato real'
      },
      {
        id: 'bc-can',
        category: 'CANALES',
        title: 'Venta consultiva B2B y alianzas con ARL',
        description: 'Demostraciones técnicas directas a gerentes de talento y SG-SST, webinars de actualización legal y convenios con aseguradoras laborales.',
        dataClassification: '[B] Supuesto'
      },
      {
        id: 'bc-rel',
        category: 'RELACION_CLIENTES',
        title: 'Acompañamiento técnico y autoservicio asistido',
        description: 'Onboarding guiado para carga de censo, soporte especializado en parametrización y auditoría de gobernanza ética.',
        dataClassification: '[B] Supuesto'
      },
      {
        id: 'bc-soc',
        category: 'SOCIOS_CLAVE',
        title: 'ARLs, médicos laborales y firmas consultoras',
        description: 'Proveedores de exámenes médicos ocupacionales, aseguradoras de riesgos laborales y consultores jurídicos en derecho laboral.',
        dataClassification: '[B] Supuesto'
      },
      {
        id: 'bc-cost',
        category: 'ESTRUCTURA_COSTOS',
        title: 'Infraestructura cloud, IA y talento técnico',
        description: 'Servidores cloud, consumo de tokens de API de IA, equipo de ingeniería de software, soporte al cliente y costos comerciales.',
        dataClassification: '[B] Supuesto'
      },
      {
        id: 'bc-ing',
        category: 'FUENTES_INGRESOS',
        title: 'Suscripción mensual SaaS y servicios de onboarding',
        description: 'Tarifas recurrentes por empresa o por volumen de colaboradores, implementación inicial y parametrización de catálogos avanzados.',
        dataClassification: '[C] Escenario'
      }
    ];
  }

  // 2. Segmentos de Clientes
  public static getDefaultClientSegments(): ClientSegmentItem[] {
    return [
      {
        id: 'seg-1',
        name: 'BPO / Contact Center / Servicios Compartidos',
        profileDescription: 'Empresas con poblaciones de 300 a 5,000+ agentes, alta rotación, turnos continuos y fuerte prevalencia de sintomatología osteomuscular.',
        painPoint: 'Dificultad extrema para consolidar encuestas en turnos 24/7 y justificar inversiones ergonómicas ante la operación.',
        valueDelivered: 'Censo interactivo masivo, detección temprana de fatiga por puesto y reportes automáticos por supervisor.',
        marketSizeEstimated: '1,200+ empresas en la región',
        fitScore: 'MUY ALTO',
        status: 'PRIORITARIO'
      },
      {
        id: 'seg-2',
        name: 'Empresas Medianas (100 a 500 colaboradores)',
        profileDescription: 'Empresas en sectores manufactura, logística, tecnología o comercio que requieren cumplir Resolución 0312 / Decreto 1072.',
        painPoint: 'Equipo de SG-SST de 1 a 2 personas desbordado por tareas operativas en hojas de cálculo.',
        valueDelivered: 'Centralización total, cálculo matemático instantáneo y generación de informes ejecutivos en minutos.',
        marketSizeEstimated: '15,000+ empresas en Colombia / LATAM',
        fitScore: 'MUY ALTO',
        status: 'PRIORITARIO'
      },
      {
        id: 'seg-3',
        name: 'Grandes Corporaciones Multisede (500+ colaboradores)',
        profileDescription: 'Organizaciones con plantas, bodegas y oficinas distribuidas en múltiples ciudades o países.',
        painPoint: 'Falta de consolidación homogénea entre sedes y disparidad de criterios en la recolección de datos.',
        valueDelivered: 'Catálogos parametrizables por sede/área, comparativas cruzadas y aislamiento de datos por centro de trabajo.',
        marketSizeEstimated: '2,500+ corporativos',
        fitScore: 'ALTO',
        status: 'PRIORITARIO'
      },
      {
        id: 'seg-4',
        name: 'Consultoras de Gestión Humana y SG-SST',
        profileDescription: 'Firmas especializadas que prestan servicios de asesoría a decenas de empresas clientes.',
        painPoint: 'Horas infinitas consumidas tabulando diagnósticos y redactando informes en Word para cada cliente.',
        valueDelivered: 'Gestión multi-tenant (multiempresa), marcas blancas y exportación estandarizada bajo ISO 45001.',
        marketSizeEstimated: '800+ firmas consultoras',
        fitScore: 'ALTO',
        status: 'SECUNDARIO'
      },
      {
        id: 'seg-5',
        name: 'ARL / Aseguradoras de Riesgos Laborales',
        profileDescription: 'Aseguradoras que buscan herramientas tecnológicas para monitorear a sus empresas afiliadas.',
        painPoint: 'Poco conocimiento preventivo en tiempo real de las condiciones ergonómicas de la población asegurada.',
        valueDelivered: 'Vigilancia epidemiológica agregada, semáforos de riesgo biomecánico y trazabilidad de intervenciones.',
        marketSizeEstimated: '10 ARLs principales',
        fitScore: 'MEDIO',
        status: 'PROSPECTO'
      }
    ];
  }

  // 3. Modelos de Monetización Evaluados
  public static getMonetizationModels(): MonetizationModelItem[] {
    return [
      {
        id: 'mm-a',
        code: 'SAAS_MENSUAL',
        name: 'A. Suscripción Mensual SaaS por Empresa',
        description: 'Cobro de una cuota fija mensual recurrente por empresa que da acceso a la plataforma base.',
        pricingLogic: 'Monto fijo mensual según rango de tamaño de empresa.',
        pros: 'Flujo de caja predecible (MRR), baja fricción de contratación y fácil facturación.',
        challenges: 'Requiere controlar límites de uso para evitar que empresas muy grandes paguen lo mismo que pequeñas.',
        recommendationLevel: 'RECOMENDADO PRIMARIO'
      },
      {
        id: 'mm-b',
        code: 'PER_EMPLOYEE',
        name: 'B. Cobro por Número de Colaboradores Activos (Per-Seat/Per-Worker)',
        description: 'Tarifa mensual calculada por colaborador censado o evaluado en el periodo (ej. $1,000 - $3,000 COP / colaborador).',
        pricingLogic: 'Precio unitario x total de colaboradores en nómina activa.',
        pros: 'Escalamiento natural del ingreso conforme el cliente crece; alineado directamente con el valor entregado.',
        challenges: 'Puede generar resistencia si la nómina fluctúa ampliamente en contratos temporales.',
        recommendationLevel: 'RECOMENDADO PRIMARIO'
      },
      {
        id: 'mm-c',
        code: 'TIERED_PLANS',
        name: 'C. Planes Escalonados por Empresa (Básico, Profesional, Empresarial)',
        description: 'Paquetes de características empaquetadas con límites de sedes, áreas, colaboradores y módulos.',
        pricingLogic: 'Plan Básico ($), Plan Profesional ($$), Plan Empresarial ($$$).',
        pros: 'Claridad en la oferta comercial y facilita el upselling progresivo hacia planes superiores.',
        challenges: 'Requiere definir barreras claras entre funcionalidades esenciales y avanzadas.',
        recommendationLevel: 'RECOMENDADO PRIMARIO'
      },
      {
        id: 'mm-d',
        code: 'ONBOARDING_SETUP',
        name: 'D. Tarifa de Implementación Inicial (Setup Fee)',
        description: 'Cobro único al inicio para configuración de catálogos, carga y limpieza de datos iniciales y capacitación.',
        pricingLogic: 'Pago único al firmar el contrato de servicio.',
        pros: 'Cubre los costos iniciales de soporte y mejora el flujo de caja del primer mes.',
        challenges: 'Aumenta la fricción comercial de entrada si la tarifa es excesivamente alta.',
        recommendationLevel: 'COMPLEMENTARIO'
      },
      {
        id: 'mm-e',
        code: 'PARAMETRIZACION',
        name: 'E. Servicios de Parametrización y Personalización',
        description: 'Configuración a la medida de preguntas de encuesta, matrices de riesgo personalizadas y diseño de reportes ad-hoc.',
        pricingLogic: 'Bolsa de horas de consultoría técnica o paquete cerrado de parametrización.',
        pros: 'Permite capturar clientes corporativos con requerimientos particulares.',
        challenges: 'Menor margen que el software puro y demanda tiempo de ingenieros.',
        recommendationLevel: 'COMPLEMENTARIO'
      },
      {
        id: 'mm-f',
        code: 'CONSULTORIA_SST',
        name: 'F. Servicios de Consultoría Acompañada con Especialista',
        description: 'Servicio conjunto de software + interpretación de resultados por médico laboral o ergónomo aliado.',
        pricingLogic: 'Paquete de consultoría mensual o por informe trimestral.',
        pros: 'Alto ticket promedio y alto valor percibido por clientes sin especialista interno.',
        challenges: 'Requiere red de especialistas y no es puramente escalable.',
        recommendationLevel: 'COMPLEMENTARIO'
      },
      {
        id: 'mm-g',
        code: 'MODULOS_PREMIUM',
        name: 'G. Módulos Adicionales Add-On (Gobernanza IA, Copilot Avanzado)',
        description: 'Activación opcional de módulos de alta sofisticación técnica para empresas con requerimientos de cumplimiento estricto.',
        pricingLogic: 'Tarifa adicional mensual por módulo activado.',
        pros: 'Maximiza el ingreso promedio por usuario (ARPU) en cuentas maduras.',
        challenges: 'Complejidad técnica en licenciamiento y activación modular.',
        recommendationLevel: 'COMPLEMENTARIO'
      },
      {
        id: 'mm-h',
        code: 'ANALITICA_AVANZADA',
        name: 'H. Analítica Predictiva y Modelos Multivariables',
        description: 'Acceso a predicción de ausentismo, correlación de clima vs incapacidades y gemelos digitales de salud.',
        pricingLogic: 'Suscripción Enterprise o pago por informe predictivo anual.',
        pros: 'Diferenciador competitivo insuperable frente a herramientas tradicionales de encuestas.',
        challenges: 'Requiere madurez de datos históricos en la empresa cliente.',
        recommendationLevel: 'EVALUACIÓN FUTURA'
      },
      {
        id: 'mm-i',
        code: 'INTEGRACIONES',
        name: 'I. Integraciones Empresariales (ERP, Nómina, SAP, Workday, Power BI API)',
        description: 'Conectores en tiempo real para sincronización automática de altas y bajas de nómina e incapacidades.',
        pricingLogic: 'Costo de conector único + mantenimiento anual de API.',
        pros: 'Fidelización extrema del cliente y reducción del riesgo de cancelación (churn).',
        challenges: 'Requiere soporte técnico a interfaces de terceros.',
        recommendationLevel: 'EVALUACIÓN FUTURA'
      }
    ];
  }

  // 4. Planes Comerciales Editables (con clasificación [C] Escenario editable)
  public static getDefaultCommercialPlans(): CommercialPlanItem[] {
    return [
      {
        id: 'plan-basico',
        code: 'BASICO',
        name: 'Plan Básico',
        tagline: 'Para empresas medianas que inician la digitalización de su SG-SST',
        badgeColor: 'border-slate-300 bg-slate-50 text-slate-900',
        monthlyPriceRef: 650000, // COP referencia
        annualPriceRef: 6500000,
        priceClassification: '[C] Escenario',
        maxColaboradores: 200,
        maxEmpresas: 1,
        maxSedes: 2,
        maxAreas: 10,
        maxProyectos: 5,
        features: {
          encuestas: 'Ilimitadas (plantilla estándar)',
          excelImport: 'Hasta 5 cargas/mes con validador',
          dashboard: 'Indicadores sociodemográficos y de salud',
          informesPrompt38: 'Resumen ejecutivo estándar',
          iaCopilot: 'Asistente básico (50 consultas/mes)',
          gobernanzaIA: 'Decálogo ético de solo lectura',
          estrategiaIA: 'Visualización de pilares',
          soporte: 'Email (tiempo respuesta 48h)',
          integraciones: 'Exportación Excel / CSV'
        }
      },
      {
        id: 'plan-profesional',
        code: 'PROFESIONAL',
        name: 'Plan Profesional',
        tagline: 'Para organizaciones consolidadas con comités y multisede activa',
        badgeColor: 'border-indigo-300 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-400/30',
        monthlyPriceRef: 1450000, // COP referencia
        annualPriceRef: 14500000,
        priceClassification: '[C] Escenario',
        maxColaboradores: 600,
        maxEmpresas: 1,
        maxSedes: 6,
        maxAreas: 30,
        maxProyectos: 15,
        features: {
          encuestas: 'Ilimitadas (personalizables)',
          excelImport: 'Ilimitadas con auditoría de 17 dimensiones',
          dashboard: 'Indicadores avanzados, cruces por sede/área',
          informesPrompt38: 'Informe Ejecutivo completo ISO 45001 / Dec 1072',
          iaCopilot: 'Copilot ilimitado + Planes de intervención IA',
          gobernanzaIA: 'Registro de auditoría y dictámenes humanos (HITL)',
          estrategiaIA: 'Matriz de casos de uso y evaluación de madurez',
          soporte: 'Email y chat prioritario (24h)',
          integraciones: 'Exportación Excel, CSV, PDF ejecutivo'
        }
      },
      {
        id: 'plan-empresarial',
        code: 'EMPRESARIAL',
        name: 'Plan Empresarial / Corporativo',
        tagline: 'Para corporaciones, BPO y consultoras que requieren control total',
        badgeColor: 'border-cyan-300 bg-slate-900 text-cyan-300',
        monthlyPriceRef: 3200000, // COP referencia
        annualPriceRef: 32000000,
        priceClassification: '[C] Escenario',
        maxColaboradores: 'Ilimitados (escala por volumen)',
        maxEmpresas: 'Multiempresa (hasta 5 tenants)',
        maxSedes: 'Ilimitadas',
        maxAreas: 'Ilimitadas',
        maxProyectos: 'Ilimitados',
        features: {
          encuestas: 'Ilimitadas con constructor visual personalizado',
          excelImport: 'Carga masiva sin límite con reconciliación 3NF',
          dashboard: 'Dashboard corporativo + benchmark consolidado',
          informesPrompt38: 'Informes con marca blanca y logo personalizado',
          iaCopilot: 'IA avanzada + prompts sectoriales a la medida',
          gobernanzaIA: 'Gobernanza completa con logs inmutables y RBAC',
          estrategiaIA: 'Roadmap personalizado y trazabilidad financiera',
          soporte: 'Gerente de cuenta dedicado + SLA 4h',
          integraciones: 'API REST + Conectores Power BI / ERP'
        }
      }
    ];
  }

  // 5. Escenarios Financieros Preconfigurados (Editables)
  public static getDefaultScenarios(): Record<'conservador' | 'base' | 'optimista', FinancialScenarioParams> {
    return {
      conservador: {
        id: 'conservador',
        name: 'Escenario Conservador',
        description: 'Adopción prudente, ciclo de ventas más largo y clientes de tamaño mediano.',
        numClients: 5,
        avgColaboradoresPerClient: 250,
        monthlyBasePricePerClient: 900000, // COP
        monthlyPricePerColaborador: 1200,   // COP por colaborador
        implementationFeePerClient: 1500000, // Setup único
        monthlyInfraCost: 850000,
        monthlyAITokenCost: 400000,
        monthlySupportCost: 1200000,
        monthlyDevCost: 2000000,
        monthlyCommercialCost: 1000000,
        monthlyOtherCost: 350000,
        oneTimeInitialInvestment: 12000000
      },
      base: {
        id: 'base',
        name: 'Escenario Base (Esperado)',
        description: 'Tracción comercial regular con combinación de empresas medianas y 2 cuentas BPO.',
        numClients: 15,
        avgColaboradoresPerClient: 400,
        monthlyBasePricePerClient: 1200000, // COP
        monthlyPricePerColaborador: 1500,   // COP por colaborador
        implementationFeePerClient: 2200000, // Setup único
        monthlyInfraCost: 1600000,
        monthlyAITokenCost: 950000,
        monthlySupportCost: 2800000,
        monthlyDevCost: 4500000,
        monthlyCommercialCost: 2500000,
        monthlyOtherCost: 750000,
        oneTimeInitialInvestment: 20000000
      },
      optimista: {
        id: 'optimista',
        name: 'Escenario Optimista (Escalamiento)',
        description: 'Cierre de alianzas con ARL y consultoras; rápido despliegue en clientes corporativos.',
        numClients: 35,
        avgColaboradoresPerClient: 550,
        monthlyBasePricePerClient: 1500000, // COP
        monthlyPricePerColaborador: 1800,   // COP por colaborador
        implementationFeePerClient: 3000000, // Setup único
        monthlyInfraCost: 3200000,
        monthlyAITokenCost: 2100000,
        monthlySupportCost: 5500000,
        monthlyDevCost: 7000000,
        monthlyCommercialCost: 5000000,
        monthlyOtherCost: 1500000,
        oneTimeInitialInvestment: 35000000
      }
    };
  }

  // 6. Motor de Cálculo Financiero Dinámico (Sin resultados hardcodeados)
  public static calculateFinancialResults(params: FinancialScenarioParams) {
    // Ingreso recurrente mensual (MRR) = Clientes * Precio Base + (Clientes * Colaboradores * Precio por colab)
    const clientBaseMRR = params.numClients * params.monthlyBasePricePerClient;
    const collaboratorMRR = params.numClients * params.avgColaboradoresPerClient * params.monthlyPricePerColaborador;
    const totalMRR = clientBaseMRR + collaboratorMRR;

    // Ingresos por implementación (anualizados según nuevos clientes del periodo)
    const annualImplementationRevenue = params.numClients * params.implementationFeePerClient;

    // Ingreso anual total proyectado (ARR + Setups)
    const totalAnnualRevenue = (totalMRR * 12) + annualImplementationRevenue;

    // Costos operativos mensuales (OPEX)
    const monthlyOPEX = 
      params.monthlyInfraCost + 
      params.monthlyAITokenCost + 
      params.monthlySupportCost + 
      params.monthlyDevCost + 
      params.monthlyCommercialCost + 
      params.monthlyOtherCost;

    const annualOPEX = monthlyOPEX * 12;

    // Utilidad y Márgenes
    const monthlyNetProfit = totalMRR - monthlyOPEX;
    const annualNetProfit = totalAnnualRevenue - annualOPEX;
    const grossMarginPercent = totalMRR > 0 ? ((totalMRR - (params.monthlyInfraCost + params.monthlyAITokenCost)) / totalMRR) * 100 : 0;
    const netProfitMarginPercent = totalAnnualRevenue > 0 ? (annualNetProfit / totalAnnualRevenue) * 100 : 0;

    // Punto de equilibrio (Break-even): Costos fijos mensuales / Ingreso promedio por cliente mensual
    const avgMonthlyRevenuePerClient = params.numClients > 0 ? totalMRR / params.numClients : (params.monthlyBasePricePerClient + (params.avgColaboradoresPerClient * params.monthlyPricePerColaborador));
    const breakEvenClients = avgMonthlyRevenuePerClient > 0 ? Math.ceil(monthlyOPEX / avgMonthlyRevenuePerClient) : 0;
    const breakEvenMonthlyRevenue = breakEvenClients * avgMonthlyRevenuePerClient;

    // ROI estimado anual (%) = ((Ingreso Anual - Costo Anual) / (Costo Anual + Inversión Inicial)) * 100
    const totalInvestmentBase = annualOPEX + params.oneTimeInitialInvestment;
    const estimatedRoiPercent = totalInvestmentBase > 0 ? ((totalAnnualRevenue - annualOPEX) / totalInvestmentBase) * 100 : 0;

    // Periodo de recuperación (Payback en meses) = Inversión Inicial / Utilidad Neta Mensual
    const paybackMonths = monthlyNetProfit > 0 ? Number((params.oneTimeInitialInvestment / monthlyNetProfit).toFixed(1)) : 999;

    return {
      totalMRR,
      totalAnnualRevenue,
      annualImplementationRevenue,
      monthlyOPEX,
      annualOPEX,
      monthlyNetProfit,
      annualNetProfit,
      grossMarginPercent: Number(grossMarginPercent.toFixed(1)),
      netProfitMarginPercent: Number(netProfitMarginPercent.toFixed(1)),
      breakEvenClients,
      breakEvenMonthlyRevenue,
      estimatedRoiPercent: Number(estimatedRoiPercent.toFixed(1)),
      paybackMonths,
      avgRevenuePerClientMonthly: avgMonthlyRevenuePerClient
    };
  }

  // 7. Calculadora de ROI para el Cliente (Valor generado para el cliente)
  public static calculateClientROI(params: ClientROICalculatorParams) {
    const totalCurrentAnnualHours = params.manualHoursPerCycle * params.cyclesPerYear * params.teamMembersCount;
    const currentAnnualCostCop = totalCurrentAnnualHours * params.costPerHourCop;

    const totalPlatformAnnualHours = params.platformEstimatedHoursPerCycle * params.cyclesPerYear * params.teamMembersCount;
    const platformAnnualLaborCostCop = totalPlatformAnnualHours * params.costPerHourCop;
    const totalPlatformAnnualCostCop = platformAnnualLaborCostCop + params.platformAnnualFeeCop;

    const annualSavedHours = totalCurrentAnnualHours - totalPlatformAnnualHours;
    const grossAnnualSavingsCop = annualSavedHours * params.costPerHourCop;
    const netAnnualSavingsCop = currentAnnualCostCop - totalPlatformAnnualCostCop;

    const clientEstimatedRoiPercent = params.platformAnnualFeeCop > 0 
      ? Number(((netAnnualSavingsCop / params.platformAnnualFeeCop) * 100).toFixed(1)) 
      : 0;

    const paybackMonths = netAnnualSavingsCop > 0 
      ? Number((params.platformAnnualFeeCop / (grossAnnualSavingsCop / 12)).toFixed(1)) 
      : 0;

    return {
      totalCurrentAnnualHours,
      currentAnnualCostCop,
      totalPlatformAnnualHours,
      totalPlatformAnnualCostCop,
      annualSavedHours,
      grossAnnualSavingsCop,
      netAnnualSavingsCop,
      clientEstimatedRoiPercent,
      paybackMonths
    };
  }

  // 8. Matriz de Viabilidad Integral (7 Dimensiones)
  public static getViabilityMatrix(): ViabilityMatrixDimension[] {
    return [
      {
        id: 'viab-tec',
        dimensionName: 'VIABILIDAD TÉCNICA',
        status: 'ALTA',
        evidenceInPlatform: 'Motor CentralIndicatorEngine determinista, arquitectura 3NF, validador de Excel de 17 dimensiones y generación de informes Prompt38 operativos.',
        strengths: [
          'Cero alucinación en cálculo de indicadores matemáticos.',
          'Rendimiento comprobado con datasets de 482 colaboradores.',
          'Generación de informe ejecutivo en menos de 2 segundos.'
        ],
        risksIdentified: [
          'Latencia en llamadas externas de API generativa en horas pico.',
          'Límites de almacenamiento en clientes con millones de registros si no migran a Cloud SQL.'
        ],
        requiredActions: [
          'Mantener fallback determinista offline cuando no haya conexión a Gemini.',
          'Habilitar exportación estructurada de respaldos JSON/SQL periódicos.'
        ]
      },
      {
        id: 'viab-ope',
        dimensionName: 'VIABILIDAD OPERATIVA',
        status: 'ALTA',
        evidenceInPlatform: 'Interfaz intuitiva en React/Tailwind, módulo de censo interactivo, importador de Excel con mapeo dinámico y sub-navegación por procesos.',
        strengths: [
          'Baja curva de aprendizaje para el equipo de SG-SST.',
          'Formulario de encuesta sociodemográfica responsivo y autogestionable.',
          'Aislamiento multiempresa que simplifica la operación simultánea.'
        ],
        risksIdentified: [
          'Resistencia al cambio de usuarios acostumbrados a hojas de cálculo desordenadas.',
          'Carga inicial de datos con formatos inconsistentes.'
        ],
        requiredActions: [
          'Diseñar plantillas descargables de Excel con validación de datos en celdas.',
          'Incluir videos cortos de inducción dentro del centro de ayuda.'
        ]
      },
      {
        id: 'viab-fin',
        dimensionName: 'VIABILIDAD FINANCIERA',
        status: 'ALTA',
        evidenceInPlatform: 'Estructura de costos de infraestructura cloud baja (modelo Serverless / Cloud Run) con márgenes brutos proyectados superiores al 70%.',
        strengths: [
          'Costo marginal por nuevo colaborador sumamente reducido.',
          'Flujo de caja positivo alcanzable con menos de 10 clientes activos.',
          'Baja inversión inicial de capital para escalar.'
        ],
        risksIdentified: [
          'Subestimación del costo de adquisición de clientes (CAC) en etapas tempranas.',
          'Variación imprevista en la tarifa de tokens de modelos de lenguaje.'
        ],
        requiredActions: [
          'Controlar presupuestos máximos de cuota (budgets) en Google Cloud Console.',
          'Cobrar tarifa de setup inicial para asegurar flujo en el mes 1.'
        ]
      },
      {
        id: 'viab-com',
        dimensionName: 'VIABILIDAD COMERCIAL',
        status: 'ALTA',
        evidenceInPlatform: 'Propuesta de valor diferenciada (Capital Humano + SG-SST + IA Ética) en un mercado con obligación legal permanente (Decreto 1072).',
        strengths: [
          'El cumplimiento de SG-SST es obligatorio por ley en Colombia y Latinoamérica.',
          'La alta rotación en sectores como BPO genera necesidad urgente de herramientas analíticas.',
          'Excelente percepción de valor del informe ejecutivo para juntas directivas.'
        ],
        risksIdentified: [
          'Ciclos de venta corporativos largos (2 a 4 meses).',
          'Competencia con software de nómina que incluye módulos básicos de encuestas.'
        ],
        requiredActions: [
          'Ofrecer periodos de prueba piloto con informe ejecutivo gratuito para directivos.',
          'Construir alianzas de referenciación con firmas de consultoría laboral.'
        ]
      },
      {
        id: 'viab-leg',
        dimensionName: 'VIABILIDAD LEGAL',
        status: 'ALTA',
        evidenceInPlatform: 'Cumplimiento estricto del Decreto 1072 de 2015, Resolución 0312 de 2019, Ley 1581 de 2012 (Habeas Data) y Resolución 2346 de 2007 (Custodia médica).',
        strengths: [
          'El sistema no diagnostica clínicamente; mantiene el rol consultivo.',
          'Anonimización y sanitización de variables sensibles en reportes públicos.',
          'Trazabilidad inmutable de quién genera y quién aprueba los informes.'
        ],
        risksIdentified: [
          'Actualizaciones intempestivas en la regulación del Ministerio de Trabajo.',
          'Reclamaciones de colaboradores sobre el uso de datos en clima laboral.'
        ],
        requiredActions: [
          'Incluir cláusula de consentimiento informado explícito al inicio de la encuesta.',
          'Auditar semestralmente los términos y condiciones del software.'
        ]
      },
      {
        id: 'viab-eti',
        dimensionName: 'VIABILIDAD ÉTICA',
        status: 'ALTA',
        evidenceInPlatform: 'Módulo de Gobernanza de IA con 10 principios éticos, supervisión humana obligatoria (HITL) y bloqueo expreso de automatización de despidos/sanciones.',
        strengths: [
          'Transparencia total en el origen de los datos y cálculos.',
          'Registro auditable de recomendaciones aceptadas o rechazadas por humanos.',
          'Mitigación activa de sesgos algorítmicos por género, edad o sede.'
        ],
        risksIdentified: [
          'Uso indebido de insights por líderes de área para presionar metas operativas.',
          'Sobreconfianza del usuario en las sugerencias generativas de IA.'
        ],
        requiredActions: [
          'Mantener visible el disclaimer de que la IA es únicamente un sistema de apoyo.',
          'Exigir justificación obligatoria cuando un dictamen de IA es implementado.'
        ]
      },
      {
        id: 'viab-esc',
        dimensionName: 'VIABILIDAD DE ESCALABILIDAD',
        status: 'ALTA',
        evidenceInPlatform: 'Aislamiento multiempresa nativo por activeCompanyId, parametrización de catálogos y arquitectura modular extensible en TypeScript.',
        strengths: [
          'Capacidad de habilitar nuevos tenants en segundos sin modificar el código base.',
          'Desacoplamiento entre interfaz, lógica analítica y persistencia.',
          'Soporte listo para exportación a entornos de producción en Cloud Run.'
        ],
        risksIdentified: [
          'Volumen masivo concurrente en periodos de encuesta anual.',
          'Necesidad de sincronización bidireccional con bases de datos SQL relacionales.'
        ],
        requiredActions: [
          'Implementar Cloud SQL con Drizzle ORM para clientes enterprise con más de 10,000 colaboradores.',
          'Habilitar caché local de indicadores calculados para evitar recalcular datasets estáticos.'
        ]
      }
    ];
  }

  // 9. Ventaja Competitiva Objetiva
  public static getCompetitiveAdvantages(): CompetitiveAdvantageItem[] {
    return [
      {
        featureOrCriterion: 'Cálculo de Indicadores',
        insightPeopleIA: 'Determinista, instantáneo y centralizado (fórmulas oficiales)',
        excelTraditional: 'Manual, propenso a fórmulas rotas y errores humanos',
        dashboardTraditional: 'Rígido, requiere analista de BI para cada ajuste',
        powerBiStandalone: 'Excelente visualmente pero requiere programar DAX y limpiar ETL',
        traditionalConsultancy: 'Manual, demora semanas y depende del consultor',
        isolatedSurveys: 'Solo recopila respuestas; no calcula indicadores SG-SST'
      },
      {
        featureOrCriterion: 'Apoyo con Inteligencia Artificial',
        insightPeopleIA: 'Copilot SG-SST + Interpretación de patrones con gobernanza',
        excelTraditional: 'Ninguno (o plugins genéricos sin contexto SG-SST)',
        dashboardTraditional: 'Ninguno',
        powerBiStandalone: 'Insights genéricos no especializados en salud laboral',
        traditionalConsultancy: 'Criterio humano pero lento y costoso por hora',
        isolatedSurveys: 'Ninguno'
      },
      {
        featureOrCriterion: 'Supervisión Humana (HITL)',
        insightPeopleIA: 'Flujo formal obligatorio de dictámenes y auditoría ética',
        excelTraditional: 'No existe trazabilidad de autoría ni dictamen',
        dashboardTraditional: 'No aplica',
        powerBiStandalone: 'No aplica',
        traditionalConsultancy: '100% humano pero sin registro de auditoría digital',
        isolatedSurveys: 'No aplica'
      },
      {
        featureOrCriterion: 'Informe Ejecutivo de Alta Gerencia',
        insightPeopleIA: 'Generación instantánea con paridad matemática total (Prompt38)',
        excelTraditional: 'Redacción manual en Word cortando y pegando gráficos',
        dashboardTraditional: 'Exportación de capturas de pantalla',
        powerBiStandalone: 'Exportación a PDF con gráficos sin texto narrativo estructurado',
        traditionalConsultancy: 'Documento Word extenso entregado 30 días después',
        isolatedSurveys: 'Tablas de porcentajes simples sin análisis de impacto'
      },
      {
        featureOrCriterion: 'Arquitectura Multiempresa',
        insightPeopleIA: 'Nativo por activeCompanyId con aislamiento y permisos RBAC',
        excelTraditional: 'Archivos separados con riesgo de filtración o sobrescritura',
        dashboardTraditional: 'Requiere desplegar instancias separadas',
        powerBiStandalone: 'Requiere configurar Row-Level Security (RLS) compleja',
        traditionalConsultancy: 'Carpetas de red compartidas con riesgo de seguridad',
        isolatedSurveys: 'Cuentas separadas con cobro independiente'
      }
    ];
  }

  // 10. Dimensiones de Escalabilidad
  public static getScalabilityDimensions(): ScalabilityDimensionItem[] {
    return [
      {
        dimension: 'Número de Empresas (Tenants)',
        currentState: 'Multiempresa probado con persistencia aislada',
        projectedCapacity: '500+ empresas en infraestructura cloud actual',
        scalingRequirement: 'Particionamiento de bases de datos y catálogo de tenants indexado',
        bottleneckRisk: 'BAJO'
      },
      {
        dimension: 'Número de Colaboradores Censados',
        currentState: '482 colaboradores procesados en tiempo real (<50ms)',
        projectedCapacity: '100,000+ colaboradores concurrentes',
        scalingRequirement: 'Paginación en consultas de censo y procesamiento por lotes en servidor',
        bottleneckRisk: 'BAJO'
      },
      {
        dimension: 'Número de Sedes y Áreas',
        currentState: 'Parametrización dinámica por empresa',
        projectedCapacity: 'Ilimitadas sedes y áreas por tenant',
        scalingRequirement: 'Árboles jerárquicos optimizados en memoria',
        bottleneckRisk: 'BAJO'
      },
      {
        dimension: 'Encuestas Simultáneas',
        currentState: 'Encuesta sociodemográfica integrada',
        projectedCapacity: '10,000 respuestas/hora en periodos pico',
        scalingRequirement: 'Colas de ingesta asíncrona y balanceo de carga en API',
        bottleneckRisk: 'MEDIO'
      },
      {
        dimension: 'Módulos Funcionales',
        currentState: 'Dashboard, Indicadores, IA, Gobernanza, Estrategia, Viabilidad, Planes',
        projectedCapacity: 'Arquitectura modular abierta para nuevos plugins',
        scalingRequirement: 'Micro-frontends o carga diferida de componentes (lazy loading)',
        bottleneckRisk: 'BAJO'
      }
    ];
  }

  // 11. Roadmap Comercial de 5 Fases
  public static getCommercialRoadmap(): CommercialRoadmapPhase[] {
    return [
      {
        phaseNumber: 1,
        title: 'FASE 1: Validación y Consolidación del Producto (MVP)',
        timeframe: 'Q3 2026',
        objective: 'Verificar la exactitud matemática de indicadores, integridad del censo y gobernanza de IA.',
        keyMilestones: [
          'Validación de los 482 colaboradores y motor determinista CentralIndicatorEngine.',
          'Consolidación del Informe Ejecutivo Prompt38 con paridad matemática total.',
          'Implementación de módulos de Gobernanza y Estrategia de IA con supervisión humana.'
        ],
        targetKpi: '100% de paridad matemática y cero defectos críticos en auditoría.',
        status: 'EN CURSO'
      },
      {
        phaseNumber: 2,
        title: 'FASE 2: Programa Piloto Empresarial Controlado',
        timeframe: 'Q4 2026',
        objective: 'Desplegar la plataforma en 3 empresas pioneras (1 BPO, 1 manufactura, 1 servicios).',
        keyMilestones: [
          'Pruebas de recolección de encuesta sociodemográfica en tiempo real.',
          'Ajuste fino de la experiencia de usuario y tiempos de respuesta.',
          'Medición real de horas ahorradas en la preparación del informe de gerencia.'
        ],
        targetKpi: '3 empresas piloto activas y NPS de satisfacción > 80.',
        status: 'PLANIFICADO'
      },
      {
        phaseNumber: 3,
        title: 'FASE 3: Lanzamiento Comercial y Primeros Clientes',
        timeframe: 'Q1 - Q2 2027',
        objective: 'Alcanzar el punto de equilibrio financiero con los primeros 10 a 15 clientes de pago.',
        keyMilestones: [
          'Publicación oficial de planes comerciales y pasarela de suscripción.',
          'Campaña de marketing enfocada en directores de SG-SST y Talento Humano.',
          'Establecimiento de las 2 primeras alianzas con firmas de consultoría laboral.'
        ],
        targetKpi: '15 clientes activos y MRR superior a $18,000,000 COP.',
        status: 'PLANIFICADO'
      },
      {
        phaseNumber: 4,
        title: 'FASE 4: Escalamiento Comercial y Alianzas con ARL',
        timeframe: 'Q3 - Q4 2027',
        objective: 'Multiplicar la base instalada a través de canales institucionales y aseguradoras.',
        keyMilestones: [
          'Homologación técnica para presentación de informes directos ante ARLs.',
          'Lanzamiento del conector automático de nómina y ERP.',
          'Expansión del equipo de soporte técnico y consultoría preventiva.'
        ],
        targetKpi: '40+ clientes corporativos y retención de suscripción > 95%.',
        status: 'VISIÓN'
      },
      {
        phaseNumber: 5,
        title: 'FASE 5: Expansión de Ecosistema y Analítica Predictiva',
        timeframe: '2028+',
        objective: 'Convertir Insight People IA en el estándar regional de analítica en Capital Humano y SG-SST.',
        keyMilestones: [
          'Modelos de predicción epidemiológica avanzados con Machine Learning.',
          'Internacionalización a México, Chile, Perú y Centroamérica.',
          'Benchmarking sectorial anonimizado para empresas suscritas.'
        ],
        targetKpi: '150+ empresas clientes y liderazgo en analítica de salud en el trabajo.',
        status: 'VISIÓN'
      }
    ];
  }

  // 12. Persistencia y Trazabilidad de Cambios Financieros (Auditoría)
  public static getAuditLogs(companyId?: string): FinancialAuditChangeLog[] {
    const key = `${this.getStorageKey(companyId)}_audit`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      const initialLogs: FinancialAuditChangeLog[] = [
        {
          id: 'log-init-1',
          timestamp: new Date().toISOString(),
          userEmail: 'lider.ghumana@innovatechit.com.co',
          parameterName: 'Configuración inicial del simulador de negocio',
          oldValue: 'N/A',
          newValue: 'Escenarios Conservador, Base y Optimista parametrizados',
          dataClassification: '[C] Escenario',
          justification: 'Definición del modelo de monetización y viabilidad financiera para InnovaTech IT S.A.S.'
        }
      ];
      localStorage.setItem(key, JSON.stringify(initialLogs));
      return initialLogs;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  public static addAuditLog(
    companyId: string | undefined, 
    log: Omit<FinancialAuditChangeLog, 'id' | 'timestamp'>
  ): FinancialAuditChangeLog {
    const logs = this.getAuditLogs(companyId);
    const newLog: FinancialAuditChangeLog = {
      ...log,
      id: `log-fin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    localStorage.setItem(`${this.getStorageKey(companyId)}_audit`, JSON.stringify(logs));
    return newLog;
  }

  // 13. Obtención y Guardado de Escenarios Editables
  public static getSavedScenarios(companyId?: string): Record<'conservador' | 'base' | 'optimista', FinancialScenarioParams> {
    const key = `${this.getStorageKey(companyId)}_scenarios`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      const defaults = this.getDefaultScenarios();
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return this.getDefaultScenarios();
    }
  }

  public static saveScenarios(
    companyId: string | undefined, 
    scenarios: Record<'conservador' | 'base' | 'optimista', FinancialScenarioParams>,
    userEmail: string,
    justification: string
  ) {
    const key = `${this.getStorageKey(companyId)}_scenarios`;
    localStorage.setItem(key, JSON.stringify(scenarios));
    this.addAuditLog(companyId, {
      userEmail,
      parameterName: 'Actualización de Parámetros de Escenarios Financieros',
      oldValue: 'Valores previos',
      newValue: 'Nuevos valores de Clientes, Precios o Costos',
      dataClassification: '[C] Escenario',
      justification
    });
  }

  // 14. Obtención y Guardado de Planes Comerciales
  public static getSavedPlans(companyId?: string): CommercialPlanItem[] {
    const key = `${this.getStorageKey(companyId)}_plans`;
    const stored = localStorage.getItem(key);
    if (!stored) {
      const defaults = this.getDefaultCommercialPlans();
      localStorage.setItem(key, JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return this.getDefaultCommercialPlans();
    }
  }

  public static savePlans(
    companyId: string | undefined,
    plans: CommercialPlanItem[],
    userEmail: string,
    justification: string
  ) {
    const key = `${this.getStorageKey(companyId)}_plans`;
    localStorage.setItem(key, JSON.stringify(plans));
    this.addAuditLog(companyId, {
      userEmail,
      parameterName: 'Actualización de Tarifas de Referencia de Planes Comerciales',
      oldValue: 'Precios anteriores',
      newValue: 'Nuevos precios de referencia editables',
      dataClassification: '[C] Escenario',
      justification
    });
  }
}
