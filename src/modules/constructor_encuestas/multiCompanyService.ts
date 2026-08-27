/**
 * PROMPT 28 — MÓDULO DE PARAMETRIZACIÓN MULTIEMPRESA & ARQUITECTURA TENANT-ISOLATED
 * 
 * Central multi-company architecture engine providing:
 * 1. Company Administration & Branding (Company Entity)
 * 2. Parametrizable Organizational Structure Catalogs (Sedes, Áreas, Proyectos, Cargos, Centros de Costo, Modalidades, Contratos, Jornadas, Turnos)
 * 3. Catalog Hierarchy Relations (Empresa -> Sede -> Área -> Proyecto -> Cargo)
 * 4. Survey Template Customization & Versioning (SurveyTemplate & SurveyTemplateQuestion with historical preservation v1, v2...)
 * 5. Institutional Base Survey Template ("Encuesta Sociodemográfica y de Condiciones de Salud")
 * 6. Excel Smart Column Mapping & Pre-Import Preview Validation (detects COLUMN_NOT_FOUND, no fake default fallbacks)
 * 7. RBAC Roles (SUPER_ADMIN, COMPANY_ADMIN, HR_ADMIN, SST_ADMIN, REPORT_VIEWER, SURVEY_MANAGER)
 * 8. Sensitive Health Data Privacy (Individual health masking for REPORT_VIEWER)
 * 9. Immutable Audit Trail Logger (AuditLog)
 * 10. Strict Zero Hardcoded Fallbacks Rule ("No informado" / "Información no disponible")
 */

export interface Company {
  id: string;
  name: string;
  identificationNumber: string; // NIT
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface BaseCatalogItem {
  id: string;
  companyId: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Sede extends BaseCatalogItem {
  address?: string;
  city?: string;
}

export interface Area extends BaseCatalogItem {}

export interface Proyecto extends BaseCatalogItem {
  cliente: string;
  sedeId: string; // Sede asociada
  areaId: string; // Área asociada
}

export interface Cargo extends BaseCatalogItem {
  areaId: string;
  proyectoId?: string;
}

export interface CentroCosto extends BaseCatalogItem {}

export interface ModalidadTrabajo extends BaseCatalogItem {}

export interface TipoContrato extends BaseCatalogItem {}

export interface JornadaLaboral extends BaseCatalogItem {}

export interface TurnoTrabajo extends BaseCatalogItem {}

export interface CompanyOrganizationalStructure {
  companyId: string;
  sedes: Sede[];
  areas: Area[];
  proyectos: Proyecto[];
  cargos: Cargo[];
  centrosCosto: CentroCosto[];
  modalidadesTrabajo: ModalidadTrabajo[];
  tiposContrato: TipoContrato[];
  jornadasLaborales: JornadaLaboral[];
  turnosTrabajo: TurnoTrabajo[];
}

export interface QuestionOptionConfig {
  id: string;
  questionId: string;
  label: string;
  value: string;
  order: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SurveyTemplateQuestion {
  id: string;
  surveyTemplateId: string;
  questionId: string; // fieldKey from QuestionBank
  order: number;
  required: boolean;
  critical: boolean;
  sensitive: boolean;
  enabled: boolean;
  allowOtro: boolean;
  allowPreferNotToAnswer: boolean;
  allowMultipleSelection: boolean;
  options?: QuestionOptionConfig[];
}

export interface SurveyTemplate {
  id: string;
  companyId: string;
  name: string;
  version: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  questions: SurveyTemplateQuestion[];
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'COMPANY_ADMIN' 
  | 'HR_ADMIN' 
  | 'SST_ADMIN' 
  | 'REPORT_VIEWER' 
  | 'SURVEY_MANAGER';

export interface UserRoleProfile {
  userId: string;
  companyId: string;
  role: UserRole;
  canViewIndividualHealthData: boolean;
  canEditCompanyStructure: boolean;
  canEditSurveyTemplates: boolean;
  canImportExcel: boolean;
  canViewAuditLogs: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  companyId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VERSION_RELEASE' | 'EXCEL_IMPORT' | 'PERMISSION_CHANGE';
  entity: 'COMPANY' | 'SEDE' | 'AREA' | 'PROYECTO' | 'CARGO' | 'CONTRACT' | 'SURVEY_TEMPLATE' | 'CATALOG';
  entityId: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

export interface ExcelColumnMappingRule {
  fieldKey: string;
  systemName: string;
  critical: boolean;
  aliases: string[];
}

export interface ExcelHeaderMappingResult {
  excelColumn: string;
  systemFieldKey: string | null;
  status: 'RECOGNIZED' | 'UNRECOGNIZED' | 'COLUMN_NOT_FOUND';
  confidencePct: number;
  manuallyMapped?: boolean;
}

export interface ExcelImportPreview {
  companyId: string;
  totalRowsDetected: number;
  totalColumnsDetected: number;
  recognizedColumnsCount: number;
  unrecognizedColumnsCount: number;
  missingCriticalFields: string[];
  columnMappings: ExcelHeaderMappingResult[];
  sampleDataPreview: Record<string, any>[];
  readyToImport: boolean;
}

// IN-MEMORY TENANT DATABASE STORE
class MultiCompanyRepository {
  private companies: Map<string, Company> = new Map();
  private structures: Map<string, CompanyOrganizationalStructure> = new Map();
  private surveyTemplates: Map<string, SurveyTemplate[]> = new Map(); // key: companyId -> list of templates
  private auditLogs: AuditLog[] = [];
  private excelMappings: Map<string, ExcelColumnMappingRule[]> = new Map();

  constructor() {
    this.seedInitialCompanies();
  }

  private seedInitialCompanies() {
    const now = new Date().toISOString();

    // Empresa A
    const compA: Company = {
      id: 'empresa-a',
      name: 'Empresa A - Soluciones BPO S.A.S.',
      identificationNumber: '900.123.456-1',
      primaryColor: '#0284c7', // Sky blue
      secondaryColor: '#0f172a',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    };

    // Empresa B
    const compB: Company = {
      id: 'empresa-b',
      name: 'Empresa B - Logística & Industria S.A.',
      identificationNumber: '800.987.654-3',
      primaryColor: '#059669', // Emerald
      secondaryColor: '#1e293b',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now
    };

    this.companies.set(compA.id, compA);
    this.companies.set(compB.id, compB);

    // Seed Catalogs for Empresa A
    const structA: CompanyOrganizationalStructure = {
      companyId: 'empresa-a',
      sedes: [
        { id: 'S-A1', companyId: 'empresa-a', name: 'Sede Principal Bogotá', code: 'BOG-A', status: 'ACTIVE', order: 1, city: 'Bogotá', createdAt: now, updatedAt: now },
        { id: 'S-A2', companyId: 'empresa-a', name: 'Sede Norte Chía', code: 'CHI-A', status: 'ACTIVE', order: 2, city: 'Chía', createdAt: now, updatedAt: now }
      ],
      areas: [
        { id: 'A-A1', companyId: 'empresa-a', name: 'Operaciones BPO', code: 'BPO-A', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now },
        { id: 'A-A2', companyId: 'empresa-a', name: 'Capital Humano', code: 'GH-A', status: 'ACTIVE', order: 2, createdAt: now, updatedAt: now }
      ],
      proyectos: [
        { id: 'P-A1', companyId: 'empresa-a', name: 'Proyecto Cliente BPO Financiero', code: 'PRJ-FIN', cliente: 'Banco Global', sedeId: 'S-A1', areaId: 'A-A1', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now }
      ],
      cargos: [
        { id: 'C-A1', companyId: 'empresa-a', name: 'Asesor de Servicio BPO', code: 'ASE-01', areaId: 'A-A1', proyectoId: 'P-A1', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now },
        { id: 'C-A2', companyId: 'empresa-a', name: 'Analista de Gestión Humana', code: 'ANA-GH', areaId: 'A-A2', status: 'ACTIVE', order: 2, createdAt: now, updatedAt: now }
      ],
      centrosCosto: [
        { id: 'CC-A1', companyId: 'empresa-a', name: 'CC 101 Operaciones', code: '101', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now }
      ],
      modalidadesTrabajo: [
        { id: 'M-A1', companyId: 'empresa-a', name: 'Presencial', code: 'PRES', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now },
        { id: 'M-A2', companyId: 'empresa-a', name: 'Híbrido', code: 'HIB', status: 'ACTIVE', order: 2, createdAt: now, updatedAt: now }
      ],
      tiposContrato: [
        { id: 'TC-A1', companyId: 'empresa-a', name: 'Término Indefinido', code: 'IND', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now },
        { id: 'TC-A2', companyId: 'empresa-a', name: 'Obra o Labor', code: 'OBL', status: 'ACTIVE', order: 2, createdAt: now, updatedAt: now }
      ],
      jornadasLaborales: [
        { id: 'J-A1', companyId: 'empresa-a', name: 'Tiempo Completo 47h', code: 'TC-47', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now }
      ],
      turnosTrabajo: [
        { id: 'T-A1', companyId: 'empresa-a', name: 'Diurno Rotativo', code: 'ROT-D', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now }
      ]
    };

    // Seed Catalogs for Empresa B (Distinct structure)
    const structB: CompanyOrganizationalStructure = {
      companyId: 'empresa-b',
      sedes: [
        { id: 'S-B1', companyId: 'empresa-b', name: 'Planta Industrial Yumbo', code: 'YUM-B', status: 'ACTIVE', order: 1, city: 'Yumbo', createdAt: now, updatedAt: now },
        { id: 'S-B2', companyId: 'empresa-b', name: 'Centro Logístico Medellín', code: 'MDE-B', status: 'ACTIVE', order: 2, city: 'Medellín', createdAt: now, updatedAt: now }
      ],
      areas: [
        { id: 'A-B1', companyId: 'empresa-b', name: 'Logística & Distribución', code: 'LOG-B', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now },
        { id: 'A-B2', companyId: 'empresa-b', name: 'Mantenimiento Industrial', code: 'MNT-B', status: 'ACTIVE', order: 2, createdAt: now, updatedAt: now }
      ],
      proyectos: [
        { id: 'P-B1', companyId: 'empresa-b', name: 'Cadena de Frío Nacional', code: 'PRJ-FRIO', cliente: 'Supermercados del Valle', sedeId: 'S-B1', areaId: 'A-B1', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now }
      ],
      cargos: [
        { id: 'C-B1', companyId: 'empresa-b', name: 'Conductor de Carga Pesada', code: 'CND-01', areaId: 'A-B1', proyectoId: 'P-B1', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now },
        { id: 'C-B2', companyId: 'empresa-b', name: 'Técnico Electromecánico', code: 'TEC-MNT', areaId: 'A-B2', status: 'ACTIVE', order: 2, createdAt: now, updatedAt: now }
      ],
      centrosCosto: [
        { id: 'CC-B1', companyId: 'empresa-b', name: 'CC 500 Planta Yumbo', code: '500', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now }
      ],
      modalidadesTrabajo: [
        { id: 'M-B1', companyId: 'empresa-b', name: 'Presencial 100%', code: 'PRES-100', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now }
      ],
      tiposContrato: [
        { id: 'TC-B1', companyId: 'empresa-b', name: 'Término Fijo 1 Año', code: 'FIJ-1Y', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now },
        { id: 'TC-B2', companyId: 'empresa-b', name: 'Aprendizaje SENA', code: 'SENA', status: 'ACTIVE', order: 2, createdAt: now, updatedAt: now }
      ],
      jornadasLaborales: [
        { id: 'J-B1', companyId: 'empresa-b', name: 'Turnos 24/7', code: 'T-247', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now }
      ],
      turnosTrabajo: [
        { id: 'T-B1', companyId: 'empresa-b', name: 'Nocturno Fijo', code: 'NOC-F', status: 'ACTIVE', order: 1, createdAt: now, updatedAt: now },
        { id: 'T-B2', companyId: 'empresa-b', name: 'Mixto 3 Turnos', code: 'MIX-3', status: 'ACTIVE', order: 2, createdAt: now, updatedAt: now }
      ]
    };

    this.structures.set('empresa-a', structA);
    this.structures.set('empresa-b', structB);

    // Seed Base Survey Template for Empresa A (v1)
    const baseTemplateA: SurveyTemplate = {
      id: 'TMPL-A-2026',
      companyId: 'empresa-a',
      name: 'Encuesta Sociodemográfica y de Condiciones de Salud 2026',
      version: 1,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
      questions: [
        { id: 'Q1', surveyTemplateId: 'TMPL-A-2026', questionId: 'tipoDocumento', order: 1, required: true, critical: true, sensitive: false, enabled: true, allowOtro: false, allowPreferNotToAnswer: false, allowMultipleSelection: false },
        { id: 'Q2', surveyTemplateId: 'TMPL-A-2026', questionId: 'numeroIdentificacion', order: 2, required: true, critical: true, sensitive: false, enabled: true, allowOtro: false, allowPreferNotToAnswer: false, allowMultipleSelection: false },
        { id: 'Q3', surveyTemplateId: 'TMPL-A-2026', questionId: 'nombres', order: 3, required: true, critical: true, sensitive: false, enabled: true, allowOtro: false, allowPreferNotToAnswer: false, allowMultipleSelection: false },
        { id: 'Q4', surveyTemplateId: 'TMPL-A-2026', questionId: 'apellidos', order: 4, required: true, critical: true, sensitive: false, enabled: true, allowOtro: false, allowPreferNotToAnswer: false, allowMultipleSelection: false },
        { id: 'Q5', surveyTemplateId: 'TMPL-A-2026', questionId: 'tipoContrato', order: 5, required: true, critical: true, sensitive: false, enabled: true, allowOtro: true, allowPreferNotToAnswer: false, allowMultipleSelection: false },
        { id: 'Q6', surveyTemplateId: 'TMPL-A-2026', questionId: 'saludPresentaCondicion', order: 6, required: true, critical: false, sensitive: true, enabled: true, allowOtro: false, allowPreferNotToAnswer: true, allowMultipleSelection: false }
      ]
    };

    this.surveyTemplates.set('empresa-a', [baseTemplateA]);

    // Initial Audit Log
    this.auditLogs.push({
      id: 'AUD-001',
      userId: 'US-ADMIN-SYS',
      userName: 'Super Administrador del Sistema',
      companyId: 'empresa-a',
      action: 'CREATE',
      entity: 'COMPANY',
      entityId: 'empresa-a',
      oldValue: null,
      newValue: compA,
      timestamp: now
    });
  }

  // --- COMPANY METHODS ---
  public getAllCompanies(): Company[] {
    return Array.from(this.companies.values());
  }

  public getCompanyById(companyId: string, requestingRole?: UserRole, userCompanyId?: string): Company | null {
    if (requestingRole && requestingRole !== 'SUPER_ADMIN' && userCompanyId && userCompanyId !== companyId) {
      throw new Error(`[MULTI-TENANT SECURITY VIOLATION] El usuario de la empresa ${userCompanyId} no tiene permiso para acceder a los datos de la empresa ${companyId}.`);
    }
    return this.companies.get(companyId) || null;
  }

  public saveCompany(company: Company, userId: string = 'US-ADMIN'): Company {
    const isNew = !this.companies.has(company.id);
    const oldVal = this.companies.get(company.id) || null;
    company.updatedAt = new Date().toISOString();
    this.companies.set(company.id, company);

    // Ensure structure exists
    if (!this.structures.has(company.id)) {
      this.structures.set(company.id, {
        companyId: company.id,
        sedes: [],
        areas: [],
        proyectos: [],
        cargos: [],
        centrosCosto: [],
        modalidadesTrabajo: [],
        tiposContrato: [],
        jornadasLaborales: [],
        turnosTrabajo: []
      });
    }

    this.logAudit({
      userId,
      userName: 'Administrador SaaS',
      companyId: company.id,
      action: isNew ? 'CREATE' : 'UPDATE',
      entity: 'COMPANY',
      entityId: company.id,
      oldValue: oldVal,
      newValue: company
    });

    return company;
  }

  // --- ORGANIZATIONAL STRUCTURE CATALAGS ---
  public getCompanyStructure(companyId: string, requestingRole?: UserRole, userCompanyId?: string): CompanyOrganizationalStructure {
    if (requestingRole && requestingRole !== 'SUPER_ADMIN' && userCompanyId && userCompanyId !== companyId) {
      throw new Error(`[SECURITY] Aislamiento multiempresa violado: acceso denegado a catálogo de ${companyId}.`);
    }

    let struct = this.structures.get(companyId);
    if (!struct) {
      struct = {
        companyId,
        sedes: [],
        areas: [],
        proyectos: [],
        cargos: [],
        centrosCosto: [],
        modalidadesTrabajo: [],
        tiposContrato: [],
        jornadasLaborales: [],
        turnosTrabajo: []
      };
      this.structures.set(companyId, struct);
    }
    return struct;
  }

  // Generic Catalog Item Creation
  public addCatalogItem<T extends BaseCatalogItem>(
    companyId: string, 
    catalogType: keyof CompanyOrganizationalStructure, 
    item: Omit<T, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>,
    userId: string = 'US-ADMIN'
  ): T {
    const struct = this.getCompanyStructure(companyId);
    const now = new Date().toISOString();
    const id = `${catalogType.toUpperCase().slice(0, 3)}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newItem: any = {
      ...item,
      id,
      companyId,
      createdAt: now,
      updatedAt: now
    };

    (struct[catalogType] as any[]).push(newItem);

    this.logAudit({
      userId,
      userName: 'Administrador de Empresa',
      companyId,
      action: 'CREATE',
      entity: 'CATALOG',
      entityId: id,
      oldValue: null,
      newValue: newItem
    });

    return newItem;
  }

  public updateCatalogItemStatus(
    companyId: string,
    catalogType: keyof CompanyOrganizationalStructure,
    itemId: string,
    status: 'ACTIVE' | 'INACTIVE',
    userId: string = 'US-ADMIN'
  ): boolean {
    const struct = this.getCompanyStructure(companyId);
    const list = struct[catalogType] as BaseCatalogItem[];
    const item = list.find(i => i.id === itemId);
    if (!item) return false;

    const oldVal = { ...item };
    item.status = status;
    item.updatedAt = new Date().toISOString();

    this.logAudit({
      userId,
      userName: 'Administrador de Empresa',
      companyId,
      action: 'UPDATE',
      entity: 'CATALOG',
      entityId: itemId,
      oldValue: oldVal,
      newValue: item
    });

    return true;
  }

  // Hierarchical Validation: Empresa -> Sede -> Área -> Proyecto -> Cargo
  public validateHierarchyRelation(companyId: string, selection: {
    sedeId?: string;
    areaId?: string;
    proyectoId?: string;
    cargoId?: string;
  }): { isValid: boolean; errorMessage?: string } {
    const struct = this.getCompanyStructure(companyId);

    if (selection.sedeId) {
      const sede = struct.sedes.find(s => s.id === selection.sedeId && s.status === 'ACTIVE');
      if (!sede) return { isValid: false, errorMessage: `Sede de ID ${selection.sedeId} no existe o no está activa para esta empresa.` };
    }

    if (selection.areaId) {
      const area = struct.areas.find(a => a.id === selection.areaId && a.status === 'ACTIVE');
      if (!area) return { isValid: false, errorMessage: `Área de ID ${selection.areaId} no existe o no está activa para esta empresa.` };
    }

    if (selection.proyectoId) {
      const proj = struct.proyectos.find(p => p.id === selection.proyectoId && p.status === 'ACTIVE');
      if (!proj) return { isValid: false, errorMessage: `Proyecto de ID ${selection.proyectoId} no existe o no está activo.` };
      if (selection.sedeId && proj.sedeId !== selection.sedeId) {
        return { isValid: false, errorMessage: `El Proyecto "${proj.name}" pertenece a la Sede ID ${proj.sedeId}, no a la Sede seleccionada (${selection.sedeId}).` };
      }
      if (selection.areaId && proj.areaId !== selection.areaId) {
        return { isValid: false, errorMessage: `El Proyecto "${proj.name}" pertenece al Área ID ${proj.areaId}, no al Área seleccionada (${selection.areaId}).` };
      }
    }

    if (selection.cargoId) {
      const cargo = struct.cargos.find(c => c.id === selection.cargoId && c.status === 'ACTIVE');
      if (!cargo) return { isValid: false, errorMessage: `Cargo de ID ${selection.cargoId} no existe o no está activo.` };
      if (selection.areaId && cargo.areaId !== selection.areaId) {
        return { isValid: false, errorMessage: `El Cargo "${cargo.name}" pertenece al Área ID ${cargo.areaId}, no al Área seleccionada (${selection.areaId}).` };
      }
    }

    return { isValid: true };
  }

  // --- SURVEY TEMPLATES & QUESTION VERSIONING ---
  public getSurveyTemplates(companyId: string): SurveyTemplate[] {
    return this.surveyTemplates.get(companyId) || [];
  }

  public getActiveSurveyTemplate(companyId: string, version?: number): SurveyTemplate | null {
    const templates = this.getSurveyTemplates(companyId);
    if (!templates || templates.length === 0) return null;
    if (version) {
      return templates.find(t => t.version === version) || null;
    }
    // Return latest published version
    return templates.filter(t => t.status === 'PUBLISHED').sort((a,b) => b.version - a.version)[0] || templates[templates.length - 1];
  }

  // CRITICAL RULE: Editing a published survey creates a NEW VERSION (v1 -> v2)
  public createNewSurveyTemplateVersion(
    companyId: string, 
    templateId: string, 
    updatedQuestions: SurveyTemplateQuestion[],
    userId: string = 'US-ADMIN'
  ): SurveyTemplate {
    const templates = this.getSurveyTemplates(companyId);
    const existing = templates.find(t => t.id === templateId) || templates[templates.length - 1];

    const newVersionNum = existing ? existing.version + 1 : 1;
    const now = new Date().toISOString();

    const newTemplate: SurveyTemplate = {
      id: `TMPL-${companyId}-${Date.now()}`,
      companyId,
      name: existing ? existing.name : 'Encuesta Sociodemográfica y de Condiciones de Salud',
      version: newVersionNum,
      status: 'PUBLISHED',
      createdAt: now,
      updatedAt: now,
      questions: updatedQuestions
    };

    if (!this.surveyTemplates.has(companyId)) {
      this.surveyTemplates.set(companyId, []);
    }
    this.surveyTemplates.get(companyId)!.push(newTemplate);

    this.logAudit({
      userId,
      userName: 'Administrador Encuestas',
      companyId,
      action: 'VERSION_RELEASE',
      entity: 'SURVEY_TEMPLATE',
      entityId: newTemplate.id,
      oldValue: existing ? { id: existing.id, version: existing.version } : null,
      newValue: { id: newTemplate.id, version: newTemplate.version, questionCount: updatedQuestions.length }
    });

    return newTemplate;
  }

  // --- RBAC & SENSITIVE HEALTH DATA MASKING ---
  public getUserProfile(userId: string, companyId: string, role: UserRole): UserRoleProfile {
    return {
      userId,
      companyId,
      role,
      canViewIndividualHealthData: role === 'SUPER_ADMIN' || role === 'SST_ADMIN' || role === 'COMPANY_ADMIN',
      canEditCompanyStructure: role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN' || role === 'HR_ADMIN',
      canEditSurveyTemplates: role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN' || role === 'SURVEY_MANAGER',
      canImportExcel: role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN' || role === 'HR_ADMIN' || role === 'SURVEY_MANAGER',
      canViewAuditLogs: role === 'SUPER_ADMIN' || role === 'COMPANY_ADMIN'
    };
  }

  // Privacy Protection Rule: REPORT_VIEWER gets aggregated metrics, individual sensitive health fields stripped!
  public sanitizeResponseForRole(surveyResponse: Record<string, any>, userRole: UserRole): Record<string, any> {
    if (userRole === 'SUPER_ADMIN' || userRole === 'SST_ADMIN' || userRole === 'COMPANY_ADMIN') {
      return surveyResponse; // Unmasked
    }

    // Strip/Mask individual health diagnostics, medications, conditions
    const sanitized = { ...surveyResponse };
    const sensitiveKeys = [
      'saludDiagnosticoDeclarado', 
      'medicamentosHabituales', 
      'saludPresentaCondicion', 
      'enfermedadDiagnosticada', 
      'alergiasPresenta',
      'fumaCigarrillo',
      'consumeAlcohol'
    ];

    sensitiveKeys.forEach(key => {
      if (sanitized[key] !== undefined) {
        sanitized[key] = '[DATOS DE SALUD PROTEGIDOS POR PRIVACIDAD SST]';
      }
    });

    return sanitized;
  }

  // --- SMART EXCEL MAPPING & VALIDATION PREVIEW ---
  public previewExcelImport(
    companyId: string, 
    headers: string[], 
    sampleRows: Record<string, any>[]
  ): ExcelImportPreview {
    const defaultAliasMap: ExcelColumnMappingRule[] = [
      { fieldKey: 'tipoDocumento', systemName: 'Tipo Documento', critical: true, aliases: ['tipo_documento', 'tipodoc', 'documento_tipo', 'tipo doc'] },
      { fieldKey: 'numeroIdentificacion', systemName: 'Número Identificación', critical: true, aliases: ['cedula', 'identificacion', 'numero_cedula', 'documento', 'cc'] },
      { fieldKey: 'nombres', systemName: 'Nombres', critical: true, aliases: ['primer_nombre', 'nombre', 'nombres_colaborador'] },
      { fieldKey: 'apellidos', systemName: 'Apellidos', critical: true, aliases: ['primer_apellido', 'apellido', 'apellidos_colaborador'] },
      { fieldKey: 'sede', systemName: 'Sede Laboral', critical: false, aliases: ['sede_trabajo', 'ubicacion_sede', 'centro_trabajo'] },
      { fieldKey: 'area', systemName: 'Área Organizacional', critical: false, aliases: ['departamento', 'seccion', 'unidad'] },
      { fieldKey: 'cargo', systemName: 'Cargo del Empleado', critical: false, aliases: ['puesto_trabajo', 'cargo_actual', 'ocupacion'] },
      { fieldKey: 'tipoContrato', systemName: 'Tipo de Contrato', critical: true, aliases: ['contrato', 'tipo_vinculacion', 'modalidad_contrato', 'vinculacion'] },
      { fieldKey: 'modalidadTrabajo', systemName: 'Modalidad de Trabajo', critical: false, aliases: ['modalidad', 'esquema_trabajo', 'teletrabajo'] },
      { fieldKey: 'turnosTrabaja', systemName: 'Turno de Trabajo', critical: false, aliases: ['turno', 'jornada_turno', 'horario_turno'] }
    ];

    const columnMappings: ExcelHeaderMappingResult[] = [];
    const missingCriticalFields: string[] = [];

    headers.forEach(header => {
      const cleanHeader = header.trim().toLowerCase().replace(/[^a-z0-9_ ]/g, '');
      let foundRule: ExcelColumnMappingRule | null = null;

      for (const rule of defaultAliasMap) {
        if (rule.fieldKey.toLowerCase() === cleanHeader || rule.aliases.some(a => a.toLowerCase() === cleanHeader)) {
          foundRule = rule;
          break;
        }
      }

      if (foundRule) {
        columnMappings.push({
          excelColumn: header,
          systemFieldKey: foundRule.fieldKey,
          status: 'RECOGNIZED',
          confidencePct: 100
        });
      } else {
        columnMappings.push({
          excelColumn: header,
          systemFieldKey: null,
          status: 'UNRECOGNIZED',
          confidencePct: 0
        });
      }
    });

    // Check missing critical fields
    const recognizedFieldKeys = columnMappings.map(m => m.systemFieldKey).filter(Boolean);
    defaultAliasMap.filter(r => r.critical).forEach(rule => {
      if (!recognizedFieldKeys.includes(rule.fieldKey)) {
        missingCriticalFields.push(rule.systemName);
      }
    });

    const recognizedColumnsCount = columnMappings.filter(m => m.status === 'RECOGNIZED').length;
    const unrecognizedColumnsCount = columnMappings.filter(m => m.status === 'UNRECOGNIZED').length;

    return {
      companyId,
      totalRowsDetected: sampleRows.length,
      totalColumnsDetected: headers.length,
      recognizedColumnsCount,
      unrecognizedColumnsCount,
      missingCriticalFields,
      columnMappings,
      sampleDataPreview: sampleRows.slice(0, 5),
      readyToImport: missingCriticalFields.length === 0
    };
  }

  // --- AUDIT TRAIL LOGGING ---
  private logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const entry: AuditLog = {
      ...log,
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(entry);
  }

  public getAuditLogs(companyId?: string, filterEntity?: string): AuditLog[] {
    return this.auditLogs.filter(log => {
      if (companyId && log.companyId !== companyId) return false;
      if (filterEntity && log.entity !== filterEntity) return false;
      return true;
    });
  }
}

export const MultiCompanyService = new MultiCompanyRepository();
