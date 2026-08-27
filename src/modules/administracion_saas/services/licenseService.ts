/**
 * LICENSE SERVICE
 * Manages tenant licenses, plan permissions, dynamic module access, and capacity validation.
 */

import { 
  License, 
  PlanTier, 
  LicenseStatus, 
  CapacityReport, 
  CommercialPlan, 
  CompanyModuleAssignment,
  ModuleCatalogItem,
  SaasAuditLog
} from '../types/saas.types';

export const STORAGE_PREFIX = 'insight_people_saas_';

export const DEFAULT_PLANS: CommercialPlan[] = [
  {
    id: 'BASICO',
    nombre: 'Plan Básico SST',
    tag: 'PYMES & Operaciones Esenciales',
    descripcion: 'Cumplimiento normativo estricto del Decreto 1072/2015 y Resolución 0312/2019 para empresas de hasta 100 colaboradores.',
    precioMensualCopEscenario: 1250000,
    precioAnualCopEscenario: 12750000,
    descuentoAnualPorcentaje: 15,
    maxColaboradores: 100,
    maxUsuarios: 3,
    maxEmpresas: 1,
    maxSedes: 2,
    modulosDisponibles: [
      'CENSO_COLABORADORES',
      'ENCUESTA_SOCIODEMOGRAFICA',
      'INDICADORES_SST',
      'DASHBOARD_EJECUTIVO',
      'INFORME_EJECUTIVO'
    ],
    soporte: 'Estándar en horario hábil (8x5) vía tickets',
    incluyeIa: false,
    incluyeCopilot: false,
    incluyeGobernanzaIa: false,
    incluyeInformesPdf: true,
    incluyeIntegraciones: false,
    color: 'border-slate-300 bg-white text-slate-800'
  },
  {
    id: 'PROFESIONAL',
    nombre: 'Plan Profesional IA',
    tag: 'Empresas Medianas en Crecimiento',
    descripcion: 'Diagnóstico automatizado con Inteligencia Artificial, analítica multidimensional y copilot asistido para hasta 350 colaboradores.',
    precioMensualCopEscenario: 2850000,
    precioAnualCopEscenario: 29070000,
    descuentoAnualPorcentaje: 15,
    maxColaboradores: 350,
    maxUsuarios: 8,
    maxEmpresas: 1,
    maxSedes: 5,
    modulosDisponibles: [
      'CENSO_COLABORADORES',
      'ENCUESTA_SOCIODEMOGRAFICA',
      'INDICADORES_SST',
      'DASHBOARD_EJECUTIVO',
      'INFORME_EJECUTIVO',
      'IA_SST',
      'COPILOT',
      'ANALITICA_AVANZADA'
    ],
    soporte: 'Prioritario (12x5) con SLA < 4 horas',
    incluyeIa: true,
    incluyeCopilot: true,
    incluyeGobernanzaIa: false,
    incluyeInformesPdf: true,
    incluyeIntegraciones: false,
    color: 'border-indigo-500 bg-indigo-50/30 text-indigo-950 shadow-md',
    badgePopular: true
  },
  {
    id: 'EMPRESARIAL',
    nombre: 'Plan Empresarial Enterprise',
    tag: 'Corporaciones & Multi-Sede',
    descripcion: 'Suite completa de Inteligencia Artificial, marco de Gobernanza Ética, Estrategia, Viabilidad, Sinergia Power BI y soporte 24/7 para hasta 1,000 colaboradores.',
    precioMensualCopEscenario: 5450000,
    precioAnualCopEscenario: 55590000,
    descuentoAnualPorcentaje: 15,
    maxColaboradores: 1000,
    maxUsuarios: 25,
    maxEmpresas: 3,
    maxSedes: 15,
    modulosDisponibles: [
      'CENSO_COLABORADORES',
      'ENCUESTA_SOCIODEMOGRAFICA',
      'INDICADORES_SST',
      'DASHBOARD_EJECUTIVO',
      'INFORME_EJECUTIVO',
      'IA_SST',
      'COPILOT',
      'GOBERNANZA_IA',
      'ESTRATEGIA_IA',
      'VIABILIDAD_NEGOCIO',
      'IA_VS_POWERBI',
      'ANALITICA_AVANZADA',
      'PREDICTIVO',
      'INTEGRACIONES'
    ],
    soporte: 'Dedicado VIP 24/7 con Gerente Técnico de Cuenta Asignado',
    incluyeIa: true,
    incluyeCopilot: true,
    incluyeGobernanzaIa: true,
    incluyeInformesPdf: true,
    incluyeIntegraciones: true,
    color: 'border-purple-500 bg-purple-50/20 text-purple-950 shadow-lg'
  }
];

export const DEFAULT_MODULES_CATALOG: ModuleCatalogItem[] = [
  {
    id: 'CENSO_COLABORADORES',
    nombre: 'Censo & Expediente de Colaboradores',
    categoria: 'CORE',
    descripcion: 'Gestión unificada de personal, cargos, centros de trabajo y tipología contractual.',
    icono: 'Users',
    planesMinimos: ['BASICO', 'PROFESIONAL', 'EMPRESARIAL'],
    isAddon: false
  },
  {
    id: 'ENCUESTA_SOCIODEMOGRAFICA',
    nombre: 'Encuesta Sociodemográfica Dinámica',
    categoria: 'CORE',
    descripcion: 'Captura nativa digital sin intermediarios, con validación de identidad y 17 dimensiones.',
    icono: 'ClipboardList',
    planesMinimos: ['BASICO', 'PROFESIONAL', 'EMPRESARIAL'],
    isAddon: false
  },
  {
    id: 'INDICADORES_SST',
    nombre: 'Motor de Indicadores Normativos',
    categoria: 'CORE',
    descripcion: 'Cálculo matemático exacto de Frecuencia, Severidad, ILI, Mortalidad y Prevalencia.',
    icono: 'BarChart3',
    planesMinimos: ['BASICO', 'PROFESIONAL', 'EMPRESARIAL'],
    isAddon: false
  },
  {
    id: 'DASHBOARD_EJECUTIVO',
    nombre: 'Dashboard Ejecutivo & Analítica Visual',
    categoria: 'CORE',
    descripcion: 'Tableros interactivos con filtros multidimensionales y desglose demográfico.',
    icono: 'Activity',
    planesMinimos: ['BASICO', 'PROFESIONAL', 'EMPRESARIAL'],
    isAddon: false
  },
  {
    id: 'INFORME_EJECUTIVO',
    nombre: 'Generador de Informes Ejecutivos & PDF',
    categoria: 'CORE',
    descripcion: 'Exportación gerencial con hallazgos automáticos y certificación de firma técnica.',
    icono: 'FileText',
    planesMinimos: ['BASICO', 'PROFESIONAL', 'EMPRESARIAL'],
    isAddon: false
  },
  {
    id: 'IA_SST',
    nombre: 'Inteligencia Artificial Diagnóstica SG-SST',
    categoria: 'IA_ESTRATEGIA',
    descripcion: 'Modelos de lenguaje especializados para hallazgos ocupacionales y recomendaciones contextuales.',
    icono: 'Brain',
    planesMinimos: ['PROFESIONAL', 'EMPRESARIAL'],
    isAddon: false,
    requiereSupervisionHumana: true
  },
  {
    id: 'COPILOT',
    nombre: 'Asistente Virtual & Copilot Conversacional',
    categoria: 'IA_ESTRATEGIA',
    descripcion: 'Consultas en lenguaje natural con anclaje normativo y respuesta guiada.',
    icono: 'Sparkles',
    planesMinimos: ['PROFESIONAL', 'EMPRESARIAL'],
    isAddon: false,
    requiereSupervisionHumana: true
  },
  {
    id: 'GOBERNANZA_IA',
    nombre: 'Gobernanza Ética y Supervisión Humana de IA',
    categoria: 'GOBERNANZA_ADMIN',
    descripcion: '10 principios éticos, inventario de modelos, matriz de riesgos y trazabilidad Human-in-the-Loop.',
    icono: 'ShieldCheck',
    planesMinimos: ['EMPRESARIAL'],
    isAddon: true,
    precioAddonMensualCop: 450000
  },
  {
    id: 'ESTRATEGIA_IA',
    nombre: 'Estrategia de IA, Casos de Uso & Roadmap',
    categoria: 'IA_ESTRATEGIA',
    descripcion: '4 pilares estratégicos, matriz de priorización, mapa de valor y nivel de madurez organizacional.',
    icono: 'Compass',
    planesMinimos: ['EMPRESARIAL'],
    isAddon: true,
    precioAddonMensualCop: 450000
  },
  {
    id: 'VIABILIDAD_NEGOCIO',
    nombre: 'Viabilidad de Negocio & Simulador Financiero',
    categoria: 'IA_ESTRATEGIA',
    descripcion: 'Business Model Canvas de 9 bloques, estructura de costos, punto de equilibrio y cálculo de ROI.',
    icono: 'Briefcase',
    planesMinimos: ['EMPRESARIAL'],
    isAddon: true,
    precioAddonMensualCop: 350000
  },
  {
    id: 'IA_VS_POWERBI',
    nombre: 'Análisis Especializado IA vs. Power BI',
    categoria: 'IA_ESTRATEGIA',
    descripcion: 'Matriz comparativa de 26 criterios, TCO, arquitectura de complementariedad y matriz de decisión.',
    icono: 'GitCompare',
    planesMinimos: ['EMPRESARIAL'],
    isAddon: true,
    precioAddonMensualCop: 350000
  },
  {
    id: 'ANALITICA_AVANZADA',
    nombre: 'Analítica Multidimensional & Cruces',
    categoria: 'ANALITICA',
    descripcion: 'Correlación de ausentismo vs jornada laboral, rotación, clima y factores etarios.',
    icono: 'Layers',
    planesMinimos: ['PROFESIONAL', 'EMPRESARIAL'],
    isAddon: false
  },
  {
    id: 'PREDICTIVO',
    nombre: 'Modelos Predictivos de Ausentismo & Riesgo',
    categoria: 'ANALITICA',
    descripcion: 'Predicción temprana de alertas osteomusculares y sobrecarga psicosocial con Gemini.',
    icono: 'LineChart',
    planesMinimos: ['EMPRESARIAL'],
    isAddon: true,
    precioAddonMensualCop: 600000
  },
  {
    id: 'INTEGRACIONES',
    nombre: 'Integraciones REST, Nómina & Power BI',
    categoria: 'GOBERNANZA_ADMIN',
    descripcion: 'Conectores con SAP, Workday, Nómina electrónica y DirectQuery estructurado 3NF.',
    icono: 'Database',
    planesMinimos: ['EMPRESARIAL'],
    isAddon: true,
    precioAddonMensualCop: 750000
  }
];

export class LicenseService {
  private static instance: LicenseService;

  private constructor() {}

  public static getInstance(): LicenseService {
    if (!LicenseService.instance) {
      LicenseService.instance = new LicenseService();
    }
    return LicenseService.instance;
  }

  private getStorageKey(key: string, companyId?: string): string {
    return companyId ? `${STORAGE_PREFIX}${key}_${companyId}` : `${STORAGE_PREFIX}${key}`;
  }

  private getItem<T>(key: string, fallback: T, companyId?: string): T {
    try {
      const raw = localStorage.getItem(this.getStorageKey(key, companyId));
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, data: T, companyId?: string): void {
    try {
      localStorage.setItem(this.getStorageKey(key, companyId), JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving SaaS item ${key}:`, e);
    }
  }

  /**
   * Returns all available commercial plans (editable scenarios)
   */
  public getPlans(): CommercialPlan[] {
    return this.getItem<CommercialPlan[]>('plans_catalog_v1', DEFAULT_PLANS);
  }

  public savePlans(plans: CommercialPlan[]): void {
    this.setItem('plans_catalog_v1', plans);
  }

  public getPlanById(planId: string): CommercialPlan {
    const plans = this.getPlans();
    return plans.find(p => p.id === planId) || plans[0] || DEFAULT_PLANS[0];
  }

  /**
   * Returns master module catalog
   */
  public getModuleCatalog(): ModuleCatalogItem[] {
    return this.getItem<ModuleCatalogItem[]>('modules_catalog_v1', DEFAULT_MODULES_CATALOG);
  }

  /**
   * Returns active license for a company
   */
  public getCompanyLicense(companyId: string, defaultPlan: PlanTier = 'EMPRESARIAL'): License {
    const plan = this.getPlanById(defaultPlan);
    const fallbackLicense: License = {
      id: `lic_${companyId}`,
      companyId: companyId,
      planId: plan.id,
      estado: 'ACTIVA',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-12-31',
      limiteColaboradores: plan.maxColaboradores,
      limiteUsuarios: plan.maxUsuarios,
      limiteSedes: plan.maxSedes,
      modulosActivos: [...plan.modulosDisponibles],
      fechaCreacion: '2026-01-01T00:00:00Z',
      fechaActualizacion: new Date().toISOString()
    };

    const lic = this.getItem<License>(`company_license_${companyId}`, fallbackLicense);
    return lic;
  }

  public saveCompanyLicense(license: License): void {
    this.setItem(`company_license_${license.companyId}`, license);
  }

  /**
   * Returns module assignments for a company
   */
  public getCompanyModuleAssignments(companyId: string, planId: PlanTier = 'EMPRESARIAL'): CompanyModuleAssignment[] {
    const stored = this.getItem<CompanyModuleAssignment[]>(`company_modules_${companyId}`, []);
    if (stored.length > 0) {
      return stored;
    }

    // Initialize from Plan
    const plan = this.getPlanById(planId);
    const catalog = this.getModuleCatalog();
    const initial: CompanyModuleAssignment[] = catalog.map(mod => {
      const isIncluded = plan.modulosDisponibles.includes(mod.id);
      return {
        id: `mod_assign_${companyId}_${mod.id}`,
        companyId,
        moduloId: mod.id,
        estado: isIncluded ? 'ACTIVO' : 'INACTIVO',
        fechaActivacion: isIncluded ? '2026-01-01' : '',
        origen: isIncluded ? 'PLAN_BASE' : 'ADD_ON',
        activadoPor: 'Sistema Provisionador SaaS'
      };
    });

    this.setItem(`company_modules_${companyId}`, initial);
    return initial;
  }

  public saveCompanyModuleAssignments(companyId: string, assignments: CompanyModuleAssignment[]): void {
    this.setItem(`company_modules_${companyId}`, assignments);
  }

  /**
   * Check if a specific module is active for a company
   */
  public isModuleActive(companyId: string, moduloId: string): boolean {
    const license = this.getCompanyLicense(companyId);
    if (license.estado === 'SUSPENDIDA' || license.estado === 'VENCIDA') {
      return false;
    }

    const assignments = this.getCompanyModuleAssignments(companyId, license.planId);
    const target = assignments.find(a => a.moduloId === moduloId);
    return target ? target.estado === 'ACTIVO' || target.estado === 'PRUEBA' : false;
  }

  /**
   * Comprehensive Capacity and Limit Validation Report
   */
  public validateCapacity(
    companyId: string, 
    actualColaboradores: number = 482, 
    actualUsuarios: number = 8, 
    actualSedes: number = 3
  ): CapacityReport {
    const license = this.getCompanyLicense(companyId);
    const plan = this.getPlanById(license.planId);

    const maxColab = license.limiteColaboradores || plan.maxColaboradores;
    const maxUsers = license.limiteUsuarios || plan.maxUsuarios;
    const maxSedes = license.limiteSedes || plan.maxSedes;

    const colabPct = Math.round((actualColaboradores / maxColab) * 100);
    const usersPct = Math.round((actualUsuarios / maxUsers) * 100);
    const sedesPct = Math.round((actualSedes / maxSedes) * 100);

    const getStatus = (pct: number): 'ACTIVO' | 'CERCA_DEL_LIMITE' | 'LIMITE_ALCANZADO' => {
      if (pct >= 100) return 'LIMITE_ALCANZADO';
      if (pct >= 85) return 'CERCA_DEL_LIMITE';
      return 'ACTIVO';
    };

    const colabStatus = getStatus(colabPct);
    const usersStatus = getStatus(usersPct);
    const sedesStatus = getStatus(sedesPct);

    // Date check
    const now = new Date();
    const expDate = new Date(license.fechaFin);
    const diffTime = expDate.getTime() - now.getTime();
    const diasParaVencer = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isVencido = diasParaVencer <= 0;

    const alertas: string[] = [];
    if (isVencido) {
      alertas.push(`La licencia expiró hace ${Math.abs(diasParaVencer)} días.`);
    } else if (diasParaVencer <= 30) {
      alertas.push(`La licencia vencerá en ${diasParaVencer} días.`);
    }

    if (colabStatus === 'LIMITE_ALCANZADO') {
      alertas.push(`Capacidad de colaboradores al 100% (${actualColaboradores}/${maxColab}).`);
    } else if (colabStatus === 'CERCA_DEL_LIMITE') {
      alertas.push(`Colaboradores al ${colabPct}% de la capacidad contratada (${actualColaboradores}/${maxColab}).`);
    }

    if (usersStatus === 'LIMITE_ALCANZADO') {
      alertas.push(`Límite de usuarios administradores alcanzado (${actualUsuarios}/${maxUsers}).`);
    }

    let estadoGeneral: LicenseStatus = license.estado;
    if (isVencido) {
      estadoGeneral = 'VENCIDA';
    } else if (colabStatus === 'LIMITE_ALCANZADO' || usersStatus === 'LIMITE_ALCANZADO') {
      estadoGeneral = 'LIMITE_ALCANZADO';
    } else if (colabStatus === 'CERCA_DEL_LIMITE' || diasParaVencer <= 30) {
      estadoGeneral = 'CERCA_DEL_LIMITE';
    } else {
      estadoGeneral = 'ACTIVA';
    }

    const assignments = this.getCompanyModuleAssignments(companyId, license.planId);
    const modulosActivosCount = assignments.filter(a => a.estado === 'ACTIVO' || a.estado === 'PRUEBA').length;

    return {
      companyId,
      colaboradoresActuales: actualColaboradores,
      colaboradoresLimite: maxColab,
      colaboradoresPorcentaje: colabPct,
      colaboradoresStatus: colabStatus,
      usuariosActuales: actualUsuarios,
      usuariosLimite: maxUsers,
      usuariosPorcentaje: usersPct,
      usuariosStatus: usersStatus,
      sedesActuales: actualSedes,
      sedesLimite: maxSedes,
      sedesPorcentaje: sedesPct,
      sedesStatus: sedesStatus,
      modulosActivosCount,
      modulosTotalCount: DEFAULT_MODULES_CATALOG.length,
      diasParaVencer,
      isVencido,
      estadoGeneral,
      alertas
    };
  }
}

export const licenseService = LicenseService.getInstance();
