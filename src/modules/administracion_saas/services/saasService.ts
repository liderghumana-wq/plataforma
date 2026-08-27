/**
 * SAAS SERVICE & MULTI-TENANT ENGINE
 * Manages tenant lifecycle, user accounts, audit logging and isolation validations.
 */

import { 
  CompanyTenant, 
  SaasUserAccount, 
  SaasAuditLog, 
  SaasAdminDashboardMetrics,
  PlanTier,
  TenantStatus
} from '../types/saas.types';
import { licenseService, STORAGE_PREFIX } from './licenseService';

export const DEFAULT_TENANTS: CompanyTenant[] = [
  {
    id: 'empresa_main_001',
    razonSocial: 'InnovaTech IT Solutions S.A.S.',
    nombreComercial: 'InnovaTech IT',
    nit: '901.458.789-2',
    logo: '',
    sector: 'Tecnología & Servicios de Software',
    ciudad: 'Bogotá D.C.',
    direccion: 'Cra 15 # 93-47 Oficina 602',
    telefono: '+57 (1) 745-8900',
    estado: 'ACTIVO',
    planId: 'EMPRESARIAL',
    fechaInicio: '2026-01-01',
    fechaVencimiento: '2026-12-31',
    fechaCreacion: '2025-12-15T08:00:00Z',
    fechaActualizacion: new Date().toISOString(),
    colaboradoresCount: 482,
    usuariosCount: 8,
    sedesCount: 3,
    contactoPrincipal: {
      nombre: 'María Fernanda Rodríguez',
      email: 'lider.ghumana@innovatechit.com.co',
      telefono: '+57 310 456 7890',
      cargo: 'Directora de Gestión Humana & SG-SST'
    },
    observaciones: 'Tenant principal de producción con censo maestro de 482 colaboradores y suite de IA completa.'
  },
  {
    id: 'empresa_bpo_002',
    razonSocial: 'ServiContact Global BPO S.A.S.',
    nombreComercial: 'ServiContact BPO',
    nit: '900.876.543-1',
    logo: '',
    sector: 'BPO / Call Center & Contact Center',
    ciudad: 'Medellín',
    direccion: 'Calle 10 # 43E-12 Edificio Ruta N',
    telefono: '+57 (4) 444-1234',
    estado: 'ACTIVO',
    planId: 'PROFESIONAL',
    fechaInicio: '2026-02-01',
    fechaVencimiento: '2027-01-31',
    fechaCreacion: '2026-01-20T10:30:00Z',
    fechaActualizacion: new Date().toISOString(),
    colaboradoresCount: 210,
    usuariosCount: 5,
    sedesCount: 2,
    contactoPrincipal: {
      nombre: 'Carlos Andrés Montoya',
      email: 'cmontoya@servicontactbpo.com',
      telefono: '+57 315 789 1234',
      cargo: 'Coordinador Nacional SG-SST'
    },
    observaciones: 'Operación de Contact Center con alta rotación y monitoreo continuo de riesgo psicosocial.'
  },
  {
    id: 'empresa_manuf_003',
    razonSocial: 'Industrias Andinas del Cauca S.A.',
    nombreComercial: 'Industrias Andinas',
    nit: '890.345.123-8',
    logo: '',
    sector: 'Manufactura & Transformación Industrial',
    ciudad: 'Cali / Yumbo',
    direccion: 'Zona Industrial Acopi Calle 15 # 22-100',
    telefono: '+57 (2) 660-5500',
    estado: 'ACTIVO',
    planId: 'BASICO',
    fechaInicio: '2026-03-01',
    fechaVencimiento: '2026-09-01',
    fechaCreacion: '2026-02-15T14:15:00Z',
    fechaActualizacion: new Date().toISOString(),
    colaboradoresCount: 65,
    usuariosCount: 2,
    sedesCount: 1,
    contactoPrincipal: {
      nombre: 'Claudia Patricia Holguín',
      email: 'sgsst@industriasandinas.com.co',
      telefono: '+57 318 901 2345',
      cargo: 'Jefe de Seguridad Industrial'
    },
    observaciones: 'Planta de producción con énfasis en accidentalidad y ausentismo osteomuscular.'
  }
];

export const DEFAULT_USERS: SaasUserAccount[] = [
  {
    id: 'usr_saas_001',
    companyId: 'empresa_main_001',
    nombre: 'María Fernanda Rodríguez',
    correo: 'lider.ghumana@innovatechit.com.co',
    rol: 'ADMIN_EMPRESA',
    estado: 'Activo',
    fechaCreacion: '2026-01-01T08:00:00Z',
    ultimoAcceso: '2026-08-17T07:45:00Z',
    cargo: 'Directora de Gestión Humana & SG-SST',
    telefono: '+57 310 456 7890',
    departamento: 'Talento Humano'
  },
  {
    id: 'usr_saas_002',
    companyId: 'empresa_main_001',
    nombre: 'Dr. Roberto Gómez Mendoza',
    correo: 'medico.laboral@innovatechit.com.co',
    rol: 'MEDICO_LABORAL',
    estado: 'Activo',
    fechaCreacion: '2026-01-05T09:00:00Z',
    ultimoAcceso: '2026-08-16T15:20:00Z',
    cargo: 'Médico Especialista en Salud Ocupacional',
    telefono: '+57 311 234 5678',
    departamento: 'Seguridad y Salud en el Trabajo'
  },
  {
    id: 'usr_saas_003',
    companyId: 'empresa_main_001',
    nombre: 'Dra. Diana Carolina Morales',
    correo: 'psicologia@innovatechit.com.co',
    rol: 'PSICOLOGO',
    estado: 'Activo',
    fechaCreacion: '2026-01-10T10:00:00Z',
    ultimoAcceso: '2026-08-15T11:10:00Z',
    cargo: 'Psicóloga Especialista en Riesgo Psicosocial',
    telefono: '+57 312 345 6789',
    departamento: 'Bienestar y Salud'
  },
  {
    id: 'usr_saas_004',
    companyId: 'empresa_main_001',
    nombre: 'Ing. Javier Hernando Duarte',
    correo: 'auditoria.sgsst@innovatechit.com.co',
    rol: 'AUDITOR',
    estado: 'Activo',
    fechaCreacion: '2026-01-12T14:00:00Z',
    ultimoAcceso: '2026-08-14T16:40:00Z',
    cargo: 'Auditor Líder ISO 45001 / RUC',
    telefono: '+57 314 567 8901',
    departamento: 'Control Interno & Cumplimiento'
  },
  {
    id: 'usr_saas_005',
    companyId: 'empresa_bpo_002',
    nombre: 'Carlos Andrés Montoya',
    correo: 'cmontoya@servicontactbpo.com',
    rol: 'ADMIN_EMPRESA',
    estado: 'Activo',
    fechaCreacion: '2026-02-01T08:00:00Z',
    ultimoAcceso: '2026-08-16T17:00:00Z',
    cargo: 'Coordinador Nacional SG-SST',
    telefono: '+57 315 789 1234',
    departamento: 'SST'
  },
  {
    id: 'usr_saas_006',
    companyId: 'empresa_manuf_003',
    nombre: 'Claudia Patricia Holguín',
    correo: 'sgsst@industriasandinas.com.co',
    rol: 'ADMIN_EMPRESA',
    estado: 'Activo',
    fechaCreacion: '2026-03-01T08:00:00Z',
    ultimoAcceso: '2026-08-15T09:30:00Z',
    cargo: 'Jefe de Seguridad Industrial',
    telefono: '+57 318 901 2345',
    departamento: 'Operaciones'
  }
];

export class SaasService {
  private static instance: SaasService;

  private constructor() {}

  public static getInstance(): SaasService {
    if (!SaasService.instance) {
      SaasService.instance = new SaasService();
    }
    return SaasService.instance;
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
      console.error(`Error saving SaaS data ${key}:`, e);
    }
  }

  // 1. TENANT MANAGEMENT
  public getTenants(): CompanyTenant[] {
    return this.getItem<CompanyTenant[]>('tenants_list_v1', DEFAULT_TENANTS);
  }

  public saveTenants(tenants: CompanyTenant[]): void {
    this.setItem('tenants_list_v1', tenants);
  }

  public getTenantById(id: string): CompanyTenant | null {
    const list = this.getTenants();
    return list.find(t => t.id === id) || null;
  }

  public createTenant(
    tenantData: Omit<CompanyTenant, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'colaboradoresCount' | 'usuariosCount' | 'sedesCount'>,
    author: string,
    authorRole: string
  ): CompanyTenant {
    const tenants = this.getTenants();
    const newId = `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    
    const newTenant: CompanyTenant = {
      ...tenantData,
      id: newId,
      colaboradoresCount: 0,
      usuariosCount: 1,
      sedesCount: 1,
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    tenants.push(newTenant);
    this.saveTenants(tenants);

    // Initialize License
    const plan = licenseService.getPlanById(newTenant.planId);
    licenseService.saveCompanyLicense({
      id: `lic_${newId}`,
      companyId: newId,
      planId: newTenant.planId,
      estado: 'ACTIVA',
      fechaInicio: newTenant.fechaInicio,
      fechaFin: newTenant.fechaVencimiento,
      limiteColaboradores: plan.maxColaboradores,
      limiteUsuarios: plan.maxUsuarios,
      limiteSedes: plan.maxSedes,
      modulosActivos: [...plan.modulosDisponibles],
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    });

    // Create Initial Admin User for Tenant
    this.createUser({
      companyId: newId,
      nombre: newTenant.contactoPrincipal.nombre,
      correo: newTenant.contactoPrincipal.email,
      rol: 'ADMIN_EMPRESA',
      estado: 'Activo',
      cargo: newTenant.contactoPrincipal.cargo,
      telefono: newTenant.contactoPrincipal.telefono
    }, author, authorRole, 'Creación inicial de empresa tenant');

    // Audit
    this.logAudit({
      usuario: author,
      rol: authorRole,
      companyId: newId,
      accion: 'CREAR_EMPRESA',
      entidad: `CompanyTenant (${newTenant.razonSocial})`,
      valorAnterior: 'N/A',
      valorNuevo: `Plan: ${newTenant.planId}, NIT: ${newTenant.nit}`,
      justificacion: 'Aprovisionamiento de nuevo tenant SaaS',
      modulo: 'ADMINISTRACION_SAAS',
      tipoDato: '[A] Real'
    });

    return newTenant;
  }

  public updateTenant(
    tenant: CompanyTenant,
    author: string,
    authorRole: string,
    justificacion: string
  ): void {
    const tenants = this.getTenants();
    const index = tenants.findIndex(t => t.id === tenant.id);
    if (index >= 0) {
      const prev = tenants[index];
      tenants[index] = {
        ...tenant,
        fechaActualizacion: new Date().toISOString()
      };
      this.saveTenants(tenants);

      this.logAudit({
        usuario: author,
        rol: authorRole,
        companyId: tenant.id,
        accion: 'EDITAR_EMPRESA',
        entidad: `CompanyTenant (${tenant.razonSocial})`,
        valorAnterior: `Estado: ${prev.estado}, Plan: ${prev.planId}`,
        valorNuevo: `Estado: ${tenant.estado}, Plan: ${tenant.planId}`,
        justificacion,
        modulo: 'ADMINISTRACION_SAAS',
        tipoDato: '[A] Real'
      });
    }
  }

  public changeTenantPlan(
    companyId: string,
    newPlanId: PlanTier,
    author: string,
    authorRole: string,
    justificacion: string
  ): void {
    const tenants = this.getTenants();
    const target = tenants.find(t => t.id === companyId);
    if (!target) return;

    const oldPlan = target.planId;
    target.planId = newPlanId;
    target.fechaActualizacion = new Date().toISOString();
    this.saveTenants(tenants);

    // Update License
    const plan = licenseService.getPlanById(newPlanId);
    const license = licenseService.getCompanyLicense(companyId);
    license.planId = newPlanId;
    license.limiteColaboradores = plan.maxColaboradores;
    license.limiteUsuarios = plan.maxUsuarios;
    license.limiteSedes = plan.maxSedes;
    license.modulosActivos = [...plan.modulosDisponibles];
    license.fechaActualizacion = new Date().toISOString();
    licenseService.saveCompanyLicense(license);

    // Update Module assignments
    const assignments = licenseService.getCompanyModuleAssignments(companyId, newPlanId);
    const updated = assignments.map(a => {
      const isInc = plan.modulosDisponibles.includes(a.moduloId);
      return {
        ...a,
        estado: (isInc ? 'ACTIVO' : 'INACTIVO') as 'ACTIVO' | 'INACTIVO',
        fechaActivacion: isInc ? (a.fechaActivacion || new Date().toISOString().split('T')[0]) : '',
        origen: (isInc ? 'PLAN_BASE' : a.origen) as 'PLAN_BASE' | 'ADD_ON'
      };
    });
    licenseService.saveCompanyModuleAssignments(companyId, updated);

    this.logAudit({
      usuario: author,
      rol: authorRole,
      companyId,
      accion: 'CAMBIO_PLAN',
      entidad: `Licencia Empresa ${target.razonSocial}`,
      valorAnterior: `Plan: ${oldPlan}`,
      valorNuevo: `Plan: ${newPlanId}`,
      justificacion,
      modulo: 'LICENCIAMIENTO_SAAS',
      tipoDato: '[A] Real'
    });
  }

  public setTenantStatus(
    companyId: string,
    newStatus: TenantStatus,
    author: string,
    authorRole: string,
    justificacion: string
  ): void {
    const tenants = this.getTenants();
    const target = tenants.find(t => t.id === companyId);
    if (!target) return;

    const oldStatus = target.estado;
    target.estado = newStatus;
    target.fechaActualizacion = new Date().toISOString();
    this.saveTenants(tenants);

    const license = licenseService.getCompanyLicense(companyId);
    if (newStatus === 'SUSPENDIDO') {
      license.estado = 'SUSPENDIDA';
    } else if (newStatus === 'ACTIVO') {
      license.estado = 'ACTIVA';
    }
    license.fechaActualizacion = new Date().toISOString();
    licenseService.saveCompanyLicense(license);

    this.logAudit({
      usuario: author,
      rol: authorRole,
      companyId,
      accion: 'SUSPENDER_EMPRESA',
      entidad: `CompanyTenant (${target.razonSocial})`,
      valorAnterior: `Estado: ${oldStatus}`,
      valorNuevo: `Estado: ${newStatus}`,
      justificacion,
      modulo: 'ADMINISTRACION_SAAS',
      tipoDato: '[A] Real'
    });
  }

  // 2. USER MANAGEMENT
  public getUsers(companyId?: string): SaasUserAccount[] {
    const allUsers = this.getItem<SaasUserAccount[]>('users_list_v1', DEFAULT_USERS);
    if (companyId) {
      return allUsers.filter(u => u.companyId === companyId);
    }
    return allUsers;
  }

  public saveUsers(users: SaasUserAccount[]): void {
    this.setItem('users_list_v1', users);
  }

  public createUser(
    userData: Omit<SaasUserAccount, 'id' | 'fechaCreacion'>,
    author: string,
    authorRole: string,
    justificacion: string = 'Alta de usuario'
  ): SaasUserAccount {
    const users = this.getItem<SaasUserAccount[]>('users_list_v1', DEFAULT_USERS);
    const newId = `usr_saas_${Date.now()}_${Math.random().toString(36).substr(2, 3)}`;

    const newUser: SaasUserAccount = {
      ...userData,
      id: newId,
      fechaCreacion: new Date().toISOString()
    };

    users.push(newUser);
    this.saveUsers(users);

    this.logAudit({
      usuario: author,
      rol: authorRole,
      companyId: userData.companyId,
      accion: 'CREAR_USUARIO',
      entidad: `Usuario (${newUser.nombre})`,
      valorAnterior: 'N/A',
      valorNuevo: `Email: ${newUser.correo}, Rol: ${newUser.rol}`,
      justificacion,
      modulo: 'GESTION_USUARIOS',
      tipoDato: '[A] Real'
    });

    return newUser;
  }

  public updateUser(
    user: SaasUserAccount,
    author: string,
    authorRole: string,
    justificacion: string
  ): void {
    const users = this.getItem<SaasUserAccount[]>('users_list_v1', DEFAULT_USERS);
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      const prev = users[idx];
      users[idx] = { ...user };
      this.saveUsers(users);

      this.logAudit({
        usuario: author,
        rol: authorRole,
        companyId: user.companyId,
        accion: 'EDITAR_USUARIO',
        entidad: `Usuario (${user.nombre})`,
        valorAnterior: `Rol: ${prev.rol}, Estado: ${prev.estado}`,
        valorNuevo: `Rol: ${user.rol}, Estado: ${user.estado}`,
        justificacion,
        modulo: 'GESTION_USUARIOS',
        tipoDato: '[A] Real'
      });
    }
  }

  public toggleUserStatus(
    userId: string,
    author: string,
    authorRole: string,
    justificacion: string
  ): void {
    const users = this.getItem<SaasUserAccount[]>('users_list_v1', DEFAULT_USERS);
    const target = users.find(u => u.id === userId);
    if (target) {
      const oldState = target.estado;
      target.estado = target.estado === 'Activo' ? 'Inactivo' : 'Activo';
      this.saveUsers(users);

      this.logAudit({
        usuario: author,
        rol: authorRole,
        companyId: target.companyId,
        accion: 'CAMBIO_ESTADO_USUARIO',
        entidad: `Usuario (${target.nombre})`,
        valorAnterior: `Estado: ${oldState}`,
        valorNuevo: `Estado: ${target.estado}`,
        justificacion,
        modulo: 'GESTION_USUARIOS',
        tipoDato: '[A] Real'
      });
    }
  }

  // 3. AUDIT LOGS
  public logAudit(logData: Omit<SaasAuditLog, 'id' | 'timestamp'>): void {
    const logs = this.getItem<SaasAuditLog[]>('audit_logs_v1', []);
    const newLog: SaasAuditLog = {
      ...logData,
      id: `saas_audit_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString()
    };
    logs.unshift(newLog);
    // Keep max 200 logs in memory
    this.setItem('audit_logs_v1', logs.slice(0, 200));
  }

  public getAuditLogs(companyId?: string): SaasAuditLog[] {
    const logs = this.getItem<SaasAuditLog[]>('audit_logs_v1', []);
    if (companyId) {
      return logs.filter(l => l.companyId === companyId || l.companyId === 'GLOBAL');
    }
    return logs;
  }

  // 4. METRICS DASHBOARD
  public getDashboardMetrics(): SaasAdminDashboardMetrics {
    const tenants = this.getTenants();
    const plans = licenseService.getPlans();
    const users = this.getUsers();

    const activas = tenants.filter(t => t.estado === 'ACTIVO').length;
    const suspendidas = tenants.filter(t => t.estado === 'SUSPENDIDO').length;
    const config = tenants.filter(t => t.estado === 'EN_CONFIGURACION' || t.estado === 'INACTIVO').length;
    const totalColab = tenants.reduce((acc, t) => acc + (t.colaboradoresCount || 0), 0);

    let mrrEscenario = 0;
    tenants.forEach(t => {
      if (t.estado === 'ACTIVO') {
        const p = plans.find(plan => plan.id === t.planId);
        if (p) {
          mrrEscenario += p.precioMensualCopEscenario;
        }
      }
    });

    const arrEscenario = mrrEscenario * 12;

    // Próximas a vencer o cerca de límite
    let proxVencer = 0;
    let cercaLimite = 0;

    tenants.forEach(t => {
      const cap = licenseService.validateCapacity(t.id, t.colaboradoresCount, t.usuariosCount, t.sedesCount);
      if (cap.diasParaVencer <= 30 && cap.diasParaVencer > 0) proxVencer++;
      if (cap.colaboradoresStatus === 'CERCA_DEL_LIMITE' || cap.colaboradoresStatus === 'LIMITE_ALCANZADO') cercaLimite++;
    });

    return {
      totalEmpresas: tenants.length,
      empresasActivas: activas,
      empresasSuspendidas: suspendidas,
      empresasEnConfiguracion: config,
      totalColaboradoresAlojados: totalColab,
      totalUsuariosPlataforma: users.length,
      modulosTotalesDisponibles: licenseService.getModuleCatalog().length,
      empresasProximasVencer: proxVencer,
      empresasCercaDelLimite: cercaLimite,
      mrrEscenarioCop: mrrEscenario,
      arrEscenarioCop: arrEscenario,
      tasaUtilizacionGlobal: Math.round((totalColab / 1450) * 100) // 1450 capacity aggregate
    };
  }

  // 5. TENANT ISOLATION VALIDATOR
  public validateTenantAccess(
    requestedCompanyId: string, 
    userActiveCompanyId: string, 
    userRole: string
  ): { allowed: boolean; reason?: string } {
    if (userRole === 'SUPER_ADMIN') {
      return { allowed: true };
    }
    if (requestedCompanyId === userActiveCompanyId) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: `Violación de aislamiento multi-tenant: El usuario pertenece al tenant '${userActiveCompanyId}' y no puede operar sobre el tenant '${requestedCompanyId}'.`
    };
  }
}

export const saasService = SaasService.getInstance();
