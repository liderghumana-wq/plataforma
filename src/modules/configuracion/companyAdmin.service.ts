import {
  Company,
  CompanyConfiguration,
  CompanySite,
  CompanyArea,
  CompanyProject,
  CompanyPosition,
  CompanyContractType,
  CompanyWorkModality,
  CompanyShift,
  CompanyCostCenter,
  CompanyCustomField,
  SurveyPeriod,
  AuditLog,
  DataQualityStatus,
  ExcelImportValidationResult,
  CompanyStatus
} from './companyAdmin.types';

// Storage keys
const STORAGE_PREFIX = 'happy_insight_p23_';

export class CompanyAdminService {
  private getStorageKey(key: string, companyId?: string): string {
    return companyId ? `${STORAGE_PREFIX}${key}_${companyId}` : `${STORAGE_PREFIX}${key}`;
  }

  private getItem<T>(key: string, companyId?: string): T[] {
    try {
      const raw = localStorage.getItem(this.getStorageKey(key, companyId));
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error(`Error reading ${key}:`, e);
      return [];
    }
  }

  private setItem<T>(key: string, data: T[], companyId?: string): void {
    try {
      localStorage.setItem(this.getStorageKey(key, companyId), JSON.stringify(data));
    } catch (e) {
      console.error(`Error writing ${key}:`, e);
    }
  }

  // AUDIT LOG
  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const fullLog: AuditLog = {
      ...log,
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString()
    };
    const logs = this.getItem<AuditLog>('audit_logs', log.companyId);
    logs.unshift(fullLog);
    this.setItem('audit_logs', logs, log.companyId);
    return fullLog;
  }

  public getAuditLogs(companyId: string): AuditLog[] {
    return this.getItem<AuditLog>('audit_logs', companyId);
  }

  // 1. COMPANIES (Company)
  public getCompanies(): Company[] {
    const list = this.getItem<Company>('companies');
    if (list.length === 0) {
      // Seed default companies for testing if empty
      const defaultCompanies: Company[] = [
        {
          id: 'empresa-a',
          name: 'Empresa A - Operaciones & BPO',
          identificationNumber: '900.123.456-1',
          status: 'ACTIVE',
          logo: '',
          primaryColor: '#4f46e5',
          secondaryColor: '#06b6d4',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'empresa-b',
          name: 'Empresa B - Manufactura & Servicios',
          identificationNumber: '800.987.654-3',
          status: 'ACTIVE',
          logo: '',
          primaryColor: '#10b981',
          secondaryColor: '#f59e0b',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
      this.setItem('companies', defaultCompanies);
      return defaultCompanies;
    }
    return list;
  }

  public getCompanyById(id: string): Company | null {
    const list = this.getCompanies();
    return list.find(c => c.id === id) || null;
  }

  public saveCompany(company: Partial<Company> & { name: string; identificationNumber: string }): Company {
    const list = this.getCompanies();
    const now = new Date().toISOString();
    let existing = company.id ? list.find(c => c.id === company.id) : null;

    if (existing) {
      const oldVal = { ...existing };
      existing.name = company.name.trim();
      existing.identificationNumber = company.identificationNumber.trim();
      existing.status = company.status || existing.status;
      existing.logo = company.logo ?? existing.logo;
      existing.primaryColor = company.primaryColor ?? existing.primaryColor;
      existing.secondaryColor = company.secondaryColor ?? existing.secondaryColor;
      existing.updatedAt = now;

      this.setItem('companies', list);
      this.logAudit({
        companyId: existing.id,
        userId: 'admin-user',
        action: 'UPDATE',
        entity: 'Company',
        entityId: existing.id,
        oldValue: oldVal,
        newValue: existing
      });
      return existing;
    } else {
      const newCompany: Company = {
        id: company.id || `comp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: company.name.trim(),
        identificationNumber: company.identificationNumber.trim(),
        status: company.status || 'ACTIVE',
        logo: company.logo || '',
        primaryColor: company.primaryColor || '#4f46e5',
        secondaryColor: company.secondaryColor || '#06b6d4',
        createdAt: now,
        updatedAt: now
      };
      list.push(newCompany);
      this.setItem('companies', list);

      // Initialize default seeds for this company
      this.seedDefaultCompanyCatalogs(newCompany.id);

      this.logAudit({
        companyId: newCompany.id,
        userId: 'admin-user',
        action: 'CREATE',
        entity: 'Company',
        entityId: newCompany.id,
        newValue: newCompany
      });
      return newCompany;
    }
  }

  public deleteCompanyLogical(companyId: string): boolean {
    const list = this.getCompanies();
    const company = list.find(c => c.id === companyId);
    if (!company) return false;

    // RULE: Do not physically delete. Use logical deletion status = INACTIVE
    const oldVal = { ...company };
    company.status = 'INACTIVE';
    company.updatedAt = new Date().toISOString();

    this.setItem('companies', list);
    this.logAudit({
      companyId,
      userId: 'admin-user',
      action: 'INACTIVATE',
      entity: 'Company',
      entityId: companyId,
      oldValue: oldVal,
      newValue: company
    });
    return true;
  }

  // 2. COMPANY CONFIGURATION
  public getCompanyConfiguration(companyId: string): CompanyConfiguration {
    const raw = localStorage.getItem(this.getStorageKey('configuration', companyId));
    if (raw) {
      try { return JSON.parse(raw); } catch (e) {}
    }

    const company = this.getCompanyById(companyId);
    const defaultConfig: CompanyConfiguration = {
      companyId,
      tradeName: company?.name || 'Nombre Comercial',
      identification: company?.identificationNumber || '000000000',
      logo: company?.logo || '',
      corporateColors: {
        primary: company?.primaryColor || '#4f46e5',
        secondary: company?.secondaryColor || '#06b6d4'
      },
      timeZone: 'America/Bogota',
      language: 'es-CO',
      privacyConfig: {
        dataRetentionYears: 10,
        requireHealthConsent: true
      },
      surveyConfig: {
        allowAnonymous: false,
        maxAttemptsPerEmployee: 1,
        autoSaveDraft: true
      },
      indicatorConfig: {
        autoRecalculateOnSurveyCompletion: true,
        showIndividualHealthMetricsToAdmins: false
      }
    };
    this.saveCompanyConfiguration(defaultConfig);
    return defaultConfig;
  }

  public saveCompanyConfiguration(config: CompanyConfiguration): void {
    const oldVal = localStorage.getItem(this.getStorageKey('configuration', config.companyId));
    localStorage.setItem(this.getStorageKey('configuration', config.companyId), JSON.stringify(config));
    this.logAudit({
      companyId: config.companyId,
      userId: 'admin-user',
      action: 'UPDATE',
      entity: 'CompanyConfiguration',
      entityId: config.companyId,
      oldValue: oldVal ? JSON.parse(oldVal) : null,
      newValue: config
    });
  }

  // SEED CATALOGS FOR DEMO EMPRESAS
  private seedDefaultCompanyCatalogs(companyId: string) {
    if (companyId === 'empresa-a') {
      this.setItem<CompanySite>('sites', [
        { id: 'site-a-1', companyId, name: 'Sede Norte', code: 'SED-01', city: 'Bogotá', address: 'Calle 100 #15-20', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'site-a-2', companyId, name: 'Sede Centro', code: 'SED-02', city: 'Bogotá', address: 'Carrera 7 #24-89', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);

      this.setItem<CompanyArea>('areas', [
        { id: 'area-a-1', companyId, name: 'Operaciones', code: 'OP-01', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: 'area-a-2', companyId, name: 'Capital Humano', code: 'CH-01', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);

      this.setItem<CompanyProject>('projects', [
        { id: 'proj-a-1', companyId, name: 'Proyecto Alfa', code: 'PRY-ALFA', siteId: 'site-a-1', areaId: 'area-a-1', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);

      this.setItem<CompanyPosition>('positions', [
        { id: 'pos-a-1', companyId, name: 'Agente BPO', code: 'CARG-01', areaId: 'area-a-1', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);

      this.setItem<CompanyContractType>('contract_types', [
        { id: 'ct-a-1', companyId, name: 'Término Indefinido', code: 'CON-01', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);

      this.setItem<CompanyWorkModality>('work_modalities', [
        { id: 'wm-a-1', companyId, name: 'Presencial', code: 'MOD-01', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);

      this.setItem<SurveyPeriod>('survey_periods', [
        { id: 'per-a-1', companyId, name: 'Caracterización 2026', startDate: '2026-01-01', endDate: '2026-12-31', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);
    } else if (companyId === 'empresa-b') {
      this.setItem<CompanySite>('sites', [
        { id: 'site-b-1', companyId, name: 'Planta Principal', code: 'SED-01', city: 'Medellín', address: 'Zona Industrial Autopista Norte', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);

      this.setItem<CompanyArea>('areas', [
        { id: 'area-b-1', companyId, name: 'Producción', code: 'PROD-01', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);

      this.setItem<CompanyProject>('projects', [
        { id: 'proj-b-1', companyId, name: 'Proyecto Beta', code: 'PRY-BETA', siteId: 'site-b-1', areaId: 'area-b-1', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);

      this.setItem<CompanyPosition>('positions', [
        { id: 'pos-b-1', companyId, name: 'Operario de Planta', code: 'CARG-10', areaId: 'area-b-1', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);

      this.setItem<CompanyContractType>('contract_types', [
        { id: 'ct-b-1', companyId, name: 'Obra o Labor', code: 'CON-02', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);

      this.setItem<CompanyWorkModality>('work_modalities', [
        { id: 'wm-b-1', companyId, name: 'Teletrabajo', code: 'MOD-02', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);

      this.setItem<SurveyPeriod>('survey_periods', [
        { id: 'per-b-1', companyId, name: 'Diagnóstico Anual 2026', startDate: '2026-02-01', endDate: '2026-11-30', status: 'ACTIVE', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ], companyId);
    }
  }

  // GENERIC CATALOG METHOD HELPERS (Code uniqueness check within company)
  private checkCodeUniqueness<T extends { id: string; code: string; companyId: string }>(
    list: T[],
    code: string,
    excludeId?: string
  ): boolean {
    const formattedCode = code.trim().toUpperCase();
    return !list.some(item => item.code.trim().toUpperCase() === formattedCode && item.id !== excludeId);
  }

  // 3. SITES (CompanySite)
  public getSites(companyId: string, includeInactive = true): CompanySite[] {
    const list = this.getItem<CompanySite>('sites', companyId);
    if (list.length === 0 && (companyId === 'empresa-a' || companyId === 'empresa-b')) {
      this.seedDefaultCompanyCatalogs(companyId);
      return this.getItem<CompanySite>('sites', companyId);
    }
    return includeInactive ? list : list.filter(s => s.status === 'ACTIVE');
  }

  public saveSite(companyId: string, site: Partial<CompanySite> & { name: string; code: string }): { success: boolean; data?: CompanySite; error?: string } {
    const list = this.getSites(companyId, true);
    if (!this.checkCodeUniqueness(list, site.code, site.id)) {
      return { success: false, error: `El código de sede "${site.code}" ya existe en esta empresa.` };
    }

    const now = new Date().toISOString();
    let existing = site.id ? list.find(s => s.id === site.id) : null;

    if (existing) {
      const oldVal = { ...existing };
      existing.name = site.name.trim();
      existing.code = site.code.trim().toUpperCase();
      existing.city = site.city?.trim();
      existing.address = site.address?.trim();
      existing.status = site.status || existing.status;
      existing.updatedAt = now;

      this.setItem('sites', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'UPDATE', entity: 'CompanySite', entityId: existing.id, oldValue: oldVal, newValue: existing });
      return { success: true, data: existing };
    } else {
      const newSite: CompanySite = {
        id: site.id || `site-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        companyId,
        name: site.name.trim(),
        code: site.code.trim().toUpperCase(),
        city: site.city?.trim() || '',
        address: site.address?.trim() || '',
        status: site.status || 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin'
      };
      list.push(newSite);
      this.setItem('sites', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'CREATE', entity: 'CompanySite', entityId: newSite.id, newValue: newSite });
      return { success: true, data: newSite };
    }
  }

  public setSiteStatus(companyId: string, siteId: string, status: 'ACTIVE' | 'INACTIVE'): boolean {
    const list = this.getSites(companyId, true);
    const site = list.find(s => s.id === siteId);
    if (!site) return false;
    const oldVal = { ...site };
    site.status = status;
    site.updatedAt = new Date().toISOString();
    this.setItem('sites', list, companyId);
    this.logAudit({ companyId, userId: 'admin', action: status === 'ACTIVE' ? 'ACTIVATE' : 'INACTIVATE', entity: 'CompanySite', entityId: siteId, oldValue: oldVal, newValue: site });
    return true;
  }

  // 4. AREAS (CompanyArea)
  public getAreas(companyId: string, includeInactive = true): CompanyArea[] {
    const list = this.getItem<CompanyArea>('areas', companyId);
    if (list.length === 0 && (companyId === 'empresa-a' || companyId === 'empresa-b')) {
      this.seedDefaultCompanyCatalogs(companyId);
      return this.getItem<CompanyArea>('areas', companyId);
    }
    return includeInactive ? list : list.filter(a => a.status === 'ACTIVE');
  }

  public saveArea(companyId: string, area: Partial<CompanyArea> & { name: string; code: string }): { success: boolean; data?: CompanyArea; error?: string } {
    const list = this.getAreas(companyId, true);
    if (!this.checkCodeUniqueness(list, area.code, area.id)) {
      return { success: false, error: `El código de área "${area.code}" ya existe en esta empresa.` };
    }

    const now = new Date().toISOString();
    let existing = area.id ? list.find(a => a.id === area.id) : null;

    if (existing) {
      const oldVal = { ...existing };
      existing.name = area.name.trim();
      existing.code = area.code.trim().toUpperCase();
      existing.status = area.status || existing.status;
      existing.updatedAt = now;

      this.setItem('areas', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'UPDATE', entity: 'CompanyArea', entityId: existing.id, oldValue: oldVal, newValue: existing });
      return { success: true, data: existing };
    } else {
      const newArea: CompanyArea = {
        id: area.id || `area-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        companyId,
        name: area.name.trim(),
        code: area.code.trim().toUpperCase(),
        status: area.status || 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin'
      };
      list.push(newArea);
      this.setItem('areas', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'CREATE', entity: 'CompanyArea', entityId: newArea.id, newValue: newArea });
      return { success: true, data: newArea };
    }
  }

  public setAreaStatus(companyId: string, areaId: string, status: 'ACTIVE' | 'INACTIVE'): boolean {
    const list = this.getAreas(companyId, true);
    const area = list.find(a => a.id === areaId);
    if (!area) return false;
    const oldVal = { ...area };
    area.status = status;
    area.updatedAt = new Date().toISOString();
    this.setItem('areas', list, companyId);
    this.logAudit({ companyId, userId: 'admin', action: status === 'ACTIVE' ? 'ACTIVATE' : 'INACTIVATE', entity: 'CompanyArea', entityId: areaId, oldValue: oldVal, newValue: area });
    return true;
  }

  // 5. PROJECTS (CompanyProject)
  public getProjects(companyId: string, includeInactive = true): CompanyProject[] {
    const list = this.getItem<CompanyProject>('projects', companyId);
    if (list.length === 0 && (companyId === 'empresa-a' || companyId === 'empresa-b')) {
      this.seedDefaultCompanyCatalogs(companyId);
      return this.getItem<CompanyProject>('projects', companyId);
    }
    return includeInactive ? list : list.filter(p => p.status === 'ACTIVE');
  }

  public saveProject(companyId: string, project: Partial<CompanyProject> & { name: string; code: string }): { success: boolean; data?: CompanyProject; error?: string } {
    const list = this.getProjects(companyId, true);
    if (!this.checkCodeUniqueness(list, project.code, project.id)) {
      return { success: false, error: `El código de proyecto "${project.code}" ya existe en esta empresa.` };
    }

    const now = new Date().toISOString();
    let existing = project.id ? list.find(p => p.id === project.id) : null;

    if (existing) {
      const oldVal = { ...existing };
      existing.name = project.name.trim();
      existing.code = project.code.trim().toUpperCase();
      existing.siteId = project.siteId;
      existing.areaId = project.areaId;
      existing.status = project.status || existing.status;
      existing.updatedAt = now;

      this.setItem('projects', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'UPDATE', entity: 'CompanyProject', entityId: existing.id, oldValue: oldVal, newValue: existing });
      return { success: true, data: existing };
    } else {
      const newProj: CompanyProject = {
        id: project.id || `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        companyId,
        name: project.name.trim(),
        code: project.code.trim().toUpperCase(),
        siteId: project.siteId,
        areaId: project.areaId,
        status: project.status || 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin'
      };
      list.push(newProj);
      this.setItem('projects', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'CREATE', entity: 'CompanyProject', entityId: newProj.id, newValue: newProj });
      return { success: true, data: newProj };
    }
  }

  public setProjectStatus(companyId: string, projectId: string, status: 'ACTIVE' | 'INACTIVE'): boolean {
    const list = this.getProjects(companyId, true);
    const proj = list.find(p => p.id === projectId);
    if (!proj) return false;
    const oldVal = { ...proj };
    proj.status = status;
    proj.updatedAt = new Date().toISOString();
    this.setItem('projects', list, companyId);
    this.logAudit({ companyId, userId: 'admin', action: status === 'ACTIVE' ? 'ACTIVATE' : 'INACTIVATE', entity: 'CompanyProject', entityId: projectId, oldValue: oldVal, newValue: proj });
    return true;
  }

  // 6. POSITIONS (CompanyPosition)
  public getPositions(companyId: string, includeInactive = true): CompanyPosition[] {
    const list = this.getItem<CompanyPosition>('positions', companyId);
    if (list.length === 0 && (companyId === 'empresa-a' || companyId === 'empresa-b')) {
      this.seedDefaultCompanyCatalogs(companyId);
      return this.getItem<CompanyPosition>('positions', companyId);
    }
    return includeInactive ? list : list.filter(pos => pos.status === 'ACTIVE');
  }

  public savePosition(companyId: string, position: Partial<CompanyPosition> & { name: string; code: string }): { success: boolean; data?: CompanyPosition; error?: string } {
    const list = this.getPositions(companyId, true);
    if (!this.checkCodeUniqueness(list, position.code, position.id)) {
      return { success: false, error: `El código de cargo "${position.code}" ya existe en esta empresa.` };
    }

    const now = new Date().toISOString();
    let existing = position.id ? list.find(p => p.id === position.id) : null;

    if (existing) {
      const oldVal = { ...existing };
      existing.name = position.name.trim();
      existing.code = position.code.trim().toUpperCase();
      existing.areaId = position.areaId;
      existing.status = position.status || existing.status;
      existing.updatedAt = now;

      this.setItem('positions', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'UPDATE', entity: 'CompanyPosition', entityId: existing.id, oldValue: oldVal, newValue: existing });
      return { success: true, data: existing };
    } else {
      const newPos: CompanyPosition = {
        id: position.id || `pos-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        companyId,
        name: position.name.trim(),
        code: position.code.trim().toUpperCase(),
        areaId: position.areaId,
        status: position.status || 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin'
      };
      list.push(newPos);
      this.setItem('positions', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'CREATE', entity: 'CompanyPosition', entityId: newPos.id, newValue: newPos });
      return { success: true, data: newPos };
    }
  }

  public setPositionStatus(companyId: string, positionId: string, status: 'ACTIVE' | 'INACTIVE'): boolean {
    const list = this.getPositions(companyId, true);
    const pos = list.find(p => p.id === positionId);
    if (!pos) return false;
    const oldVal = { ...pos };
    pos.status = status;
    pos.updatedAt = new Date().toISOString();
    this.setItem('positions', list, companyId);
    this.logAudit({ companyId, userId: 'admin', action: status === 'ACTIVE' ? 'ACTIVATE' : 'INACTIVATE', entity: 'CompanyPosition', entityId: positionId, oldValue: oldVal, newValue: pos });
    return true;
  }

  // 7. CONTRACT TYPES (CompanyContractType)
  public getContractTypes(companyId: string, includeInactive = true): CompanyContractType[] {
    const list = this.getItem<CompanyContractType>('contract_types', companyId);
    if (list.length === 0 && (companyId === 'empresa-a' || companyId === 'empresa-b')) {
      this.seedDefaultCompanyCatalogs(companyId);
      return this.getItem<CompanyContractType>('contract_types', companyId);
    }
    return includeInactive ? list : list.filter(ct => ct.status === 'ACTIVE');
  }

  public saveContractType(companyId: string, ct: Partial<CompanyContractType> & { name: string; code: string }): { success: boolean; data?: CompanyContractType; error?: string } {
    const list = this.getContractTypes(companyId, true);
    if (!this.checkCodeUniqueness(list, ct.code, ct.id)) {
      return { success: false, error: `El código de tipo de contrato "${ct.code}" ya existe en esta empresa.` };
    }

    const now = new Date().toISOString();
    let existing = ct.id ? list.find(item => item.id === ct.id) : null;

    if (existing) {
      const oldVal = { ...existing };
      existing.name = ct.name.trim();
      existing.code = ct.code.trim().toUpperCase();
      existing.status = ct.status || existing.status;
      existing.updatedAt = now;

      this.setItem('contract_types', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'UPDATE', entity: 'CompanyContractType', entityId: existing.id, oldValue: oldVal, newValue: existing });
      return { success: true, data: existing };
    } else {
      const newCt: CompanyContractType = {
        id: ct.id || `ct-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        companyId,
        name: ct.name.trim(),
        code: ct.code.trim().toUpperCase(),
        status: ct.status || 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin'
      };
      list.push(newCt);
      this.setItem('contract_types', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'CREATE', entity: 'CompanyContractType', entityId: newCt.id, newValue: newCt });
      return { success: true, data: newCt };
    }
  }

  public setContractTypeStatus(companyId: string, ctId: string, status: 'ACTIVE' | 'INACTIVE'): boolean {
    const list = this.getContractTypes(companyId, true);
    const ct = list.find(item => item.id === ctId);
    if (!ct) return false;
    const oldVal = { ...ct };
    ct.status = status;
    ct.updatedAt = new Date().toISOString();
    this.setItem('contract_types', list, companyId);
    this.logAudit({ companyId, userId: 'admin', action: status === 'ACTIVE' ? 'ACTIVATE' : 'INACTIVATE', entity: 'CompanyContractType', entityId: ctId, oldValue: oldVal, newValue: ct });
    return true;
  }

  // 8. WORK MODALITIES (CompanyWorkModality)
  public getWorkModalities(companyId: string, includeInactive = true): CompanyWorkModality[] {
    const list = this.getItem<CompanyWorkModality>('work_modalities', companyId);
    if (list.length === 0 && (companyId === 'empresa-a' || companyId === 'empresa-b')) {
      this.seedDefaultCompanyCatalogs(companyId);
      return this.getItem<CompanyWorkModality>('work_modalities', companyId);
    }
    return includeInactive ? list : list.filter(wm => wm.status === 'ACTIVE');
  }

  public saveWorkModality(companyId: string, wm: Partial<CompanyWorkModality> & { name: string; code: string }): { success: boolean; data?: CompanyWorkModality; error?: string } {
    const list = this.getWorkModalities(companyId, true);
    if (!this.checkCodeUniqueness(list, wm.code, wm.id)) {
      return { success: false, error: `El código de modalidad "${wm.code}" ya existe en esta empresa.` };
    }

    const now = new Date().toISOString();
    let existing = wm.id ? list.find(item => item.id === wm.id) : null;

    if (existing) {
      const oldVal = { ...existing };
      existing.name = wm.name.trim();
      existing.code = wm.code.trim().toUpperCase();
      existing.status = wm.status || existing.status;
      existing.updatedAt = now;

      this.setItem('work_modalities', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'UPDATE', entity: 'CompanyWorkModality', entityId: existing.id, oldValue: oldVal, newValue: existing });
      return { success: true, data: existing };
    } else {
      const newWm: CompanyWorkModality = {
        id: wm.id || `wm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        companyId,
        name: wm.name.trim(),
        code: wm.code.trim().toUpperCase(),
        status: wm.status || 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin'
      };
      list.push(newWm);
      this.setItem('work_modalities', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'CREATE', entity: 'CompanyWorkModality', entityId: newWm.id, newValue: newWm });
      return { success: true, data: newWm };
    }
  }

  public setWorkModalityStatus(companyId: string, wmId: string, status: 'ACTIVE' | 'INACTIVE'): boolean {
    const list = this.getWorkModalities(companyId, true);
    const wm = list.find(item => item.id === wmId);
    if (!wm) return false;
    const oldVal = { ...wm };
    wm.status = status;
    wm.updatedAt = new Date().toISOString();
    this.setItem('work_modalities', list, companyId);
    this.logAudit({ companyId, userId: 'admin', action: status === 'ACTIVE' ? 'ACTIVATE' : 'INACTIVATE', entity: 'CompanyWorkModality', entityId: wmId, oldValue: oldVal, newValue: wm });
    return true;
  }

  // 9. SURVEY PERIODS (SurveyPeriod)
  public getSurveyPeriods(companyId: string): SurveyPeriod[] {
    const list = this.getItem<SurveyPeriod>('survey_periods', companyId);
    if (list.length === 0 && (companyId === 'empresa-a' || companyId === 'empresa-b')) {
      this.seedDefaultCompanyCatalogs(companyId);
      return this.getItem<SurveyPeriod>('survey_periods', companyId);
    }
    return list;
  }

  public saveSurveyPeriod(companyId: string, period: Partial<SurveyPeriod> & { name: string; startDate: string; endDate: string }): SurveyPeriod {
    const list = this.getSurveyPeriods(companyId);
    const now = new Date().toISOString();
    let existing = period.id ? list.find(p => p.id === period.id) : null;

    if (existing) {
      const oldVal = { ...existing };
      existing.name = period.name.trim();
      existing.startDate = period.startDate;
      existing.endDate = period.endDate;
      existing.status = period.status || existing.status;
      existing.updatedAt = now;

      this.setItem('survey_periods', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'UPDATE', entity: 'SurveyPeriod', entityId: existing.id, oldValue: oldVal, newValue: existing });
      return existing;
    } else {
      const newPer: SurveyPeriod = {
        id: period.id || `per-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        companyId,
        name: period.name.trim(),
        startDate: period.startDate,
        endDate: period.endDate,
        status: period.status || 'DRAFT',
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin'
      };
      list.push(newPer);
      this.setItem('survey_periods', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'CREATE', entity: 'SurveyPeriod', entityId: newPer.id, newValue: newPer });
      return newPer;
    }
  }

  // 10. EXCEL CATALOG VALIDATOR (PROMPT 23 Section 19, 20 & 21)
  // Strict rule: No fallbacks! If value is not found in the company's catalog, return status = NOT_CONFIGURED.
  public validateExcelCatalogValue(
    companyId: string,
    entityType: 'site' | 'area' | 'project' | 'position' | 'contractType' | 'workModality',
    rawValue: string | null | undefined
  ): ExcelImportValidationResult {
    if (!rawValue || typeof rawValue !== 'string' || !rawValue.trim()) {
      return {
        companyId,
        entityType,
        rawValue,
        matchedId: null,
        matchedName: null,
        qualityStatus: 'MISSING',
        errorMessage: 'Campo ausente (null)'
      };
    }

    const cleanVal = rawValue.trim().toLowerCase();

    if (entityType === 'site') {
      const sites = this.getSites(companyId, true);
      const match = sites.find(s => s.name.toLowerCase() === cleanVal || s.code.toLowerCase() === cleanVal);
      if (match) {
        return { companyId, entityType, rawValue, matchedId: match.id, matchedName: match.name, qualityStatus: 'VALID' };
      }
    } else if (entityType === 'area') {
      const areas = this.getAreas(companyId, true);
      const match = areas.find(a => a.name.toLowerCase() === cleanVal || a.code.toLowerCase() === cleanVal);
      if (match) {
        return { companyId, entityType, rawValue, matchedId: match.id, matchedName: match.name, qualityStatus: 'VALID' };
      }
    } else if (entityType === 'project') {
      const projects = this.getProjects(companyId, true);
      const match = projects.find(p => p.name.toLowerCase() === cleanVal || p.code.toLowerCase() === cleanVal);
      if (match) {
        return { companyId, entityType, rawValue, matchedId: match.id, matchedName: match.name, qualityStatus: 'VALID' };
      }
    } else if (entityType === 'position') {
      const positions = this.getPositions(companyId, true);
      const match = positions.find(pos => pos.name.toLowerCase() === cleanVal || pos.code.toLowerCase() === cleanVal);
      if (match) {
        return { companyId, entityType, rawValue, matchedId: match.id, matchedName: match.name, qualityStatus: 'VALID' };
      }
    } else if (entityType === 'contractType') {
      const contractTypes = this.getContractTypes(companyId, true);
      const match = contractTypes.find(ct => ct.name.toLowerCase() === cleanVal || ct.code.toLowerCase() === cleanVal);
      if (match) {
        return { companyId, entityType, rawValue, matchedId: match.id, matchedName: match.name, qualityStatus: 'VALID' };
      }
    } else if (entityType === 'workModality') {
      const modalities = this.getWorkModalities(companyId, true);
      const match = modalities.find(wm => wm.name.toLowerCase() === cleanVal || wm.code.toLowerCase() === cleanVal);
      if (match) {
        return { companyId, entityType, rawValue, matchedId: match.id, matchedName: match.name, qualityStatus: 'VALID' };
      }
    }

    // RULE 19 & 21: If value does not exist, return status = NOT_CONFIGURED ("Dato no parametrizado")
    // Do NOT create automatically, do NOT substitute with 'Bogotá' or 'Operaciones'
    return {
      companyId,
      entityType,
      rawValue,
      matchedId: null,
      matchedName: null,
      qualityStatus: 'NOT_CONFIGURED',
      errorMessage: `Dato no parametrizado: ${rawValue}`
    };
  }

  // 11. SHIFTS / TURNOS (CompanyShift)
  public getShifts(companyId: string, includeInactive = true): CompanyShift[] {
    const list = this.getItem<CompanyShift>('shifts', companyId);
    return includeInactive ? list : list.filter(s => s.status === 'ACTIVE');
  }

  public saveShift(companyId: string, shift: Partial<CompanyShift> & { name: string; code: string }): { success: boolean; data?: CompanyShift; error?: string } {
    const list = this.getShifts(companyId, true);
    if (!this.checkCodeUniqueness(list, shift.code, shift.id)) {
      return { success: false, error: `El código de turno "${shift.code}" ya existe en esta empresa.` };
    }

    const now = new Date().toISOString();
    let existing = shift.id ? list.find(s => s.id === shift.id) : null;

    if (existing) {
      const oldVal = { ...existing };
      existing.name = shift.name.trim();
      existing.code = shift.code.trim().toUpperCase();
      existing.startTime = shift.startTime;
      existing.endTime = shift.endTime;
      existing.status = shift.status || existing.status;
      existing.updatedAt = now;

      this.setItem('shifts', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'UPDATE', entity: 'CompanyShift', entityId: existing.id, oldValue: oldVal, newValue: existing });
      return { success: true, data: existing };
    } else {
      const newShift: CompanyShift = {
        id: shift.id || `shift-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        companyId,
        name: shift.name.trim(),
        code: shift.code.trim().toUpperCase(),
        startTime: shift.startTime,
        endTime: shift.endTime,
        status: shift.status || 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin'
      };
      list.push(newShift);
      this.setItem('shifts', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'CREATE', entity: 'CompanyShift', entityId: newShift.id, newValue: newShift });
      return { success: true, data: newShift };
    }
  }

  public setShiftStatus(companyId: string, shiftId: string, status: 'ACTIVE' | 'INACTIVE'): boolean {
    const list = this.getShifts(companyId, true);
    const shift = list.find(s => s.id === shiftId);
    if (!shift) return false;
    const oldVal = { ...shift };
    shift.status = status;
    shift.updatedAt = new Date().toISOString();
    this.setItem('shifts', list, companyId);
    this.logAudit({ companyId, userId: 'admin', action: status === 'ACTIVE' ? 'ACTIVATE' : 'INACTIVATE', entity: 'CompanyShift', entityId: shiftId, oldValue: oldVal, newValue: shift });
    return true;
  }

  // 12. COST CENTERS / CENTROS DE COSTO (CompanyCostCenter)
  public getCostCenters(companyId: string, includeInactive = true): CompanyCostCenter[] {
    const list = this.getItem<CompanyCostCenter>('cost_centers', companyId);
    return includeInactive ? list : list.filter(cc => cc.status === 'ACTIVE');
  }

  public saveCostCenter(companyId: string, cc: Partial<CompanyCostCenter> & { name: string; code: string }): { success: boolean; data?: CompanyCostCenter; error?: string } {
    const list = this.getCostCenters(companyId, true);
    if (!this.checkCodeUniqueness(list, cc.code, cc.id)) {
      return { success: false, error: `El código de centro de costo "${cc.code}" ya existe en esta empresa.` };
    }

    const now = new Date().toISOString();
    let existing = cc.id ? list.find(item => item.id === cc.id) : null;

    if (existing) {
      const oldVal = { ...existing };
      existing.name = cc.name.trim();
      existing.code = cc.code.trim().toUpperCase();
      existing.status = cc.status || existing.status;
      existing.updatedAt = now;

      this.setItem('cost_centers', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'UPDATE', entity: 'CompanyCostCenter', entityId: existing.id, oldValue: oldVal, newValue: existing });
      return { success: true, data: existing };
    } else {
      const newCc: CompanyCostCenter = {
        id: cc.id || `cc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        companyId,
        name: cc.name.trim(),
        code: cc.code.trim().toUpperCase(),
        status: cc.status || 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin'
      };
      list.push(newCc);
      this.setItem('cost_centers', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'CREATE', entity: 'CompanyCostCenter', entityId: newCc.id, newValue: newCc });
      return { success: true, data: newCc };
    }
  }

  public setCostCenterStatus(companyId: string, ccId: string, status: 'ACTIVE' | 'INACTIVE'): boolean {
    const list = this.getCostCenters(companyId, true);
    const cc = list.find(item => item.id === ccId);
    if (!cc) return false;
    const oldVal = { ...cc };
    cc.status = status;
    cc.updatedAt = new Date().toISOString();
    this.setItem('cost_centers', list, companyId);
    this.logAudit({ companyId, userId: 'admin', action: status === 'ACTIVE' ? 'ACTIVATE' : 'INACTIVATE', entity: 'CompanyCostCenter', entityId: ccId, oldValue: oldVal, newValue: cc });
    return true;
  }

  // 13. CUSTOM FIELDS / CAMPOS PERSONALIZADOS (CompanyCustomField)
  public getCustomFields(companyId: string, includeInactive = true): CompanyCustomField[] {
    const list = this.getItem<CompanyCustomField>('custom_fields', companyId);
    return includeInactive ? list : list.filter(cf => cf.status === 'ACTIVE');
  }

  public saveCustomField(companyId: string, cf: Partial<CompanyCustomField> & { fieldKey: string; label: string }): { success: boolean; data?: CompanyCustomField; error?: string } {
    const list = this.getCustomFields(companyId, true);
    const cleanKey = cf.fieldKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    if (!cf.id && list.some(item => item.fieldKey === cleanKey)) {
      return { success: false, error: `La clave de campo "${cleanKey}" ya existe para esta empresa.` };
    }

    const now = new Date().toISOString();
    let existing = cf.id ? list.find(item => item.id === cf.id) : null;

    if (existing) {
      const oldVal = { ...existing };
      existing.label = cf.label.trim();
      existing.description = cf.description?.trim();
      existing.category = cf.category || existing.category;
      existing.dataType = cf.dataType || existing.dataType;
      existing.options = cf.options || existing.options;
      existing.required = cf.required ?? existing.required;
      existing.status = cf.status || existing.status;
      existing.updatedAt = now;

      this.setItem('custom_fields', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'UPDATE', entity: 'CompanyCustomField', entityId: existing.id, oldValue: oldVal, newValue: existing });
      return { success: true, data: existing };
    } else {
      const newCf: CompanyCustomField = {
        id: cf.id || `cf-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        companyId,
        fieldKey: cleanKey,
        label: cf.label.trim(),
        description: cf.description?.trim(),
        category: cf.category || 'ORGANIZACIONAL',
        dataType: cf.dataType || 'STRING',
        options: cf.options || [],
        required: cf.required || false,
        status: cf.status || 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        createdBy: 'admin'
      };
      list.push(newCf);
      this.setItem('custom_fields', list, companyId);
      this.logAudit({ companyId, userId: 'admin', action: 'CREATE', entity: 'CompanyCustomField', entityId: newCf.id, newValue: newCf });
      return { success: true, data: newCf };
    }
  }

  public setCustomFieldStatus(companyId: string, cfId: string, status: 'ACTIVE' | 'INACTIVE'): boolean {
    const list = this.getCustomFields(companyId, true);
    const cf = list.find(item => item.id === cfId);
    if (!cf) return false;
    const oldVal = { ...cf };
    cf.status = status;
    cf.updatedAt = new Date().toISOString();
    this.setItem('custom_fields', list, companyId);
    this.logAudit({ companyId, userId: 'admin', action: status === 'ACTIVE' ? 'ACTIVATE' : 'INACTIVATE', entity: 'CompanyCustomField', entityId: cfId, oldValue: oldVal, newValue: cf });
    return true;
  }

  // 14. DATA MIXING PROTECTION & TENANT CONSISTENCY CHECK (PROMPT 33 Section 24)
  public verifyDatasetCompanyConsistency(
    records: Array<{ companyId?: string | null }>,
    expectedCompanyId: string
  ): { isConsistent: boolean; error?: string; detectedCompanyIds: string[] } {
    if (!records || records.length === 0) {
      return { isConsistent: true, detectedCompanyIds: [expectedCompanyId] };
    }

    const detectedCompanyIds = Array.from(
      new Set(records.map(r => r.companyId).filter((id): id is string => Boolean(id)))
    );

    const hasInconsistentCompany = detectedCompanyIds.some(id => id !== expectedCompanyId);

    if (hasInconsistentCompany) {
      return {
        isConsistent: false,
        error: 'Se detectó inconsistencia de empresa en el conjunto de datos.',
        detectedCompanyIds
      };
    }

    return { isConsistent: true, detectedCompanyIds };
  }
}

export const companyAdminService = new CompanyAdminService();
