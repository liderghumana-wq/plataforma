import React, { useState, useMemo, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  Layers, 
  BarChart3, 
  Activity, 
  FileText, 
  Settings, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Download, 
  Shield, 
  ShieldAlert, 
  Check, 
  X, 
  Filter, 
  Info, 
  Sparkles, 
  Brain, 
  Compass, 
  Briefcase, 
  GitCompare, 
  Database, 
  Key, 
  HelpCircle, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { useEmpresa } from '../../configuracion/useEmpresa';
import { usePermissions } from '../../../core/rbac/usePermissions';
import { rbacService } from '../../../core/rbac/rbacService';
import { 
  CompanyTenant, 
  SaasUserAccount, 
  CommercialPlan, 
  ModuleCatalogItem, 
  CompanyModuleAssignment, 
  License, 
  CapacityReport, 
  SaasAuditLog, 
  PlanTier, 
  TenantStatus 
} from '../types/saas.types';
import { licenseService } from '../services/licenseService';
import { saasService } from '../services/saasService';

export default function CentroAdministracionModule() {
  const { config, activeCompanyId, switchCompany } = useEmpresa();
  const { can, isAdmin, isSuperAdmin, role } = usePermissions();

  const canEdit = can('SAAS_ADMIN_EDIT') || can('COMPANY_EDIT') || isSuperAdmin || isAdmin;

  // Active Sub-Tab (9 subsecciones)
  const [activeSubTab, setActiveSubTab] = useState<
    'dashboard' | 
    'empresas' | 
    'usuarios' | 
    'rbac' | 
    'planes' | 
    'modulos' | 
    'licencias' | 
    'capacidad' | 
    'auditoria' | 
    'arquitectura'
  >('dashboard');

  // Local state
  const [tenants, setTenants] = useState<CompanyTenant[]>([]);
  const [users, setUsers] = useState<SaasUserAccount[]>([]);
  const [plans, setPlans] = useState<CommercialPlan[]>([]);
  const [moduleCatalog, setModuleCatalog] = useState<ModuleCatalogItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<SaasAuditLog[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Selected Tenant for Deep View (defaults to active company)
  const [selectedTenantId, setSelectedTenantId] = useState<string>(activeCompanyId || 'empresa_main_001');

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [planFilter, setPlanFilter] = useState<string>('TODOS');

  // Modals
  const [showTenantModal, setShowTenantModal] = useState(false);
  const [editingTenant, setEditingTenant] = useState<CompanyTenant | null>(null);
  const [tenantFormData, setTenantFormData] = useState({
    razonSocial: '',
    nombreComercial: '',
    nit: '',
    sector: 'Tecnología',
    ciudad: 'Bogotá D.C.',
    direccion: '',
    telefono: '',
    planId: 'PROFESIONAL' as PlanTier,
    fechaInicio: '2026-01-01',
    fechaVencimiento: '2026-12-31',
    contactoNombre: '',
    contactoEmail: '',
    contactoTelefono: '',
    contactoCargo: ''
  });

  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SaasUserAccount | null>(null);
  const [userFormData, setUserFormData] = useState({
    nombre: '',
    correo: '',
    rol: 'ADMIN_EMPRESA',
    companyId: selectedTenantId,
    cargo: '',
    telefono: '',
    departamento: ''
  });

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CommercialPlan | null>(null);
  const [planPriceDraft, setPlanPriceDraft] = useState(0);
  const [planPriceJustification, setPlanPriceJustification] = useState('');

  // Load Data
  useEffect(() => {
    setTenants(saasService.getTenants());
    setUsers(saasService.getUsers());
    setPlans(licenseService.getPlans());
    setModuleCatalog(licenseService.getModuleCatalog());
    setAuditLogs(saasService.getAuditLogs());
  }, [refreshKey]);

  // Active Tenant Object
  const currentTenant = useMemo(() => {
    return tenants.find(t => t.id === selectedTenantId) || tenants[0] || null;
  }, [tenants, selectedTenantId]);

  // Capacity Report for Selected Tenant
  const capacityReport = useMemo(() => {
    if (!currentTenant) return null;
    return licenseService.validateCapacity(
      currentTenant.id,
      currentTenant.colaboradoresCount,
      currentTenant.usuariosCount,
      currentTenant.sedesCount
    );
  }, [currentTenant]);

  // Active Modules for Selected Tenant
  const tenantModules = useMemo(() => {
    if (!currentTenant) return [];
    return licenseService.getCompanyModuleAssignments(currentTenant.id, currentTenant.planId);
  }, [currentTenant, refreshKey]);

  // License for Selected Tenant
  const tenantLicense = useMemo(() => {
    if (!currentTenant) return null;
    return licenseService.getCompanyLicense(currentTenant.id, currentTenant.planId);
  }, [currentTenant, refreshKey]);

  // Dashboard Global Metrics
  const globalMetrics = useMemo(() => {
    return saasService.getDashboardMetrics();
  }, [tenants, users, plans, refreshKey]);

  // Handlers
  const handleSaveTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantFormData.razonSocial || !tenantFormData.nit) {
      alert('Por favor complete la Razón Social y el NIT');
      return;
    }

    const author = 'lider.ghumana@innovatechit.com.co';
    const authorRole = role?.code || 'ADMIN_EMPRESA';

    if (editingTenant) {
      saasService.updateTenant(
        {
          ...editingTenant,
          razonSocial: tenantFormData.razonSocial,
          nombreComercial: tenantFormData.nombreComercial || tenantFormData.razonSocial,
          nit: tenantFormData.nit,
          sector: tenantFormData.sector,
          ciudad: tenantFormData.ciudad,
          direccion: tenantFormData.direccion,
          telefono: tenantFormData.telefono,
          planId: tenantFormData.planId,
          fechaInicio: tenantFormData.fechaInicio,
          fechaVencimiento: tenantFormData.fechaVencimiento,
          contactoPrincipal: {
            nombre: tenantFormData.contactoNombre,
            email: tenantFormData.contactoEmail,
            telefono: tenantFormData.contactoTelefono,
            cargo: tenantFormData.contactoCargo
          }
        },
        author,
        authorRole,
        'Actualización de datos corporativos de tenant'
      );
    } else {
      saasService.createTenant(
        {
          razonSocial: tenantFormData.razonSocial,
          nombreComercial: tenantFormData.nombreComercial || tenantFormData.razonSocial,
          nit: tenantFormData.nit,
          sector: tenantFormData.sector,
          ciudad: tenantFormData.ciudad,
          direccion: tenantFormData.direccion,
          telefono: tenantFormData.telefono,
          estado: 'ACTIVO',
          planId: tenantFormData.planId,
          fechaInicio: tenantFormData.fechaInicio,
          fechaVencimiento: tenantFormData.fechaVencimiento,
          contactoPrincipal: {
            nombre: tenantFormData.contactoNombre,
            email: tenantFormData.contactoEmail,
            telefono: tenantFormData.contactoTelefono,
            cargo: tenantFormData.contactoCargo
          }
        },
        author,
        authorRole
      );
    }

    setShowTenantModal(false);
    setEditingTenant(null);
    setRefreshKey(k => k + 1);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.nombre || !userFormData.correo) {
      alert('Por favor complete nombre y correo');
      return;
    }

    const author = 'lider.ghumana@innovatechit.com.co';
    const authorRole = role?.code || 'ADMIN_EMPRESA';

    if (editingUser) {
      saasService.updateUser(
        {
          ...editingUser,
          nombre: userFormData.nombre,
          correo: userFormData.correo,
          rol: userFormData.rol,
          companyId: userFormData.companyId,
          cargo: userFormData.cargo,
          telefono: userFormData.telefono,
          departamento: userFormData.departamento
        },
        author,
        authorRole,
        'Modificación de perfil y rol de usuario'
      );
    } else {
      saasService.createUser(
        {
          nombre: userFormData.nombre,
          correo: userFormData.correo,
          rol: userFormData.rol,
          companyId: userFormData.companyId,
          estado: 'Activo',
          cargo: userFormData.cargo,
          telefono: userFormData.telefono,
          departamento: userFormData.departamento
        },
        author,
        authorRole,
        'Creación manual de usuario en tenant'
      );
    }

    setShowUserModal(false);
    setEditingUser(null);
    setRefreshKey(k => k + 1);
  };

  const handleToggleModule = (moduloId: string, currentStatus: string) => {
    if (!canEdit || !currentTenant) return;
    const author = 'lider.ghumana@innovatechit.com.co';
    const authorRole = role?.code || 'ADMIN_EMPRESA';

    const newStatus = currentStatus === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    const assignments = licenseService.getCompanyModuleAssignments(currentTenant.id, currentTenant.planId);
    const updated = assignments.map(a => {
      if (a.moduloId === moduloId) {
        return {
          ...a,
          estado: newStatus as 'ACTIVO' | 'INACTIVO',
          fechaActivacion: newStatus === 'ACTIVO' ? new Date().toISOString().split('T')[0] : a.fechaActivacion,
          fechaDesactivacion: newStatus === 'INACTIVO' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return a;
    });

    licenseService.saveCompanyModuleAssignments(currentTenant.id, updated);

    saasService.logAudit({
      usuario: author,
      rol: authorRole,
      companyId: currentTenant.id,
      accion: newStatus === 'ACTIVO' ? 'ACTIVAR_MODULO' : 'DESACTIVAR_MODULO',
      entidad: `Módulo ${moduloId} en ${currentTenant.razonSocial}`,
      valorAnterior: `Estado: ${currentStatus}`,
      valorNuevo: `Estado: ${newStatus}`,
      justificacion: 'Ajuste de módulos activos por administración SaaS',
      modulo: 'GESTION_MODULOS',
      tipoDato: '[A] Real'
    });

    setRefreshKey(k => k + 1);
  };

  const handleChangeTenantPlan = (newPlanId: PlanTier) => {
    if (!canEdit || !currentTenant) return;
    const author = 'lider.ghumana@innovatechit.com.co';
    const authorRole = role?.code || 'ADMIN_EMPRESA';

    saasService.changeTenantPlan(
      currentTenant.id,
      newPlanId,
      author,
      authorRole,
      `Actualización de suscripción comercial a ${newPlanId}`
    );

    setRefreshKey(k => k + 1);
  };

  const handleToggleTenantStatus = (targetTenant: CompanyTenant) => {
    if (!canEdit) return;
    const author = 'lider.ghumana@innovatechit.com.co';
    const authorRole = role?.code || 'ADMIN_EMPRESA';

    const nextStatus: TenantStatus = targetTenant.estado === 'ACTIVO' ? 'SUSPENDIDO' : 'ACTIVO';
    saasService.setTenantStatus(
      targetTenant.id,
      nextStatus,
      author,
      authorRole,
      `Cambio de estado administrativo a ${nextStatus}`
    );

    setRefreshKey(k => k + 1);
  };

  const handleSwitchActiveTenant = async (tenantId: string) => {
    setSelectedTenantId(tenantId);
    await switchCompany(tenantId);
  };

  return (
    <div id="centro-administracion-saas-root" className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-6 lg:p-8 space-y-6">
      
      {/* 1. HEADER & TENANT SELECTOR */}
      <header className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-800 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5" /> FASE 7: ARQUITECTURA SaaS & MULTI-TENANT
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> AISLAMIENTO MULTI-EMPRESA VERIFICADO
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-800">
                [A] Real & [C] Escenarios Comerciales
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>⚙️ Centro de Administración SaaS</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-4xl leading-relaxed">
              Consola unificada de gestión multi-tenant, control de licencias, aprovisionamiento de módulos, 
              control de capacidad de colaboradores y gobernanza RBAC para <strong>Insight People IA</strong>.
            </p>
          </div>

          {/* Tenant Quick Switcher Box */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-4 min-w-[320px] shrink-0 space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
              <span>Tenant Seleccionado</span>
              <span className="text-indigo-400 flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Multi-Tenant
              </span>
            </div>

            <select
              value={selectedTenantId}
              onChange={(e) => handleSwitchActiveTenant(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.razonSocial} — Plan {t.planId} ({t.colaboradoresCount} colab)
                </option>
              ))}
            </select>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>NIT: {currentTenant?.nit}</span>
              <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                currentTenant?.estado === 'ACTIVO' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
              }`}>
                {currentTenant?.estado}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (9 Subsecciones) */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
          {[
            { id: 'dashboard', label: '📊 Vista General', icon: BarChart3 },
            { id: 'empresas', label: '🏢 Empresas (Tenants)', icon: Building2 },
            { id: 'usuarios', label: '👥 Usuarios & Accesos', icon: Users },
            { id: 'rbac', label: '🔐 Roles & Permisos', icon: ShieldCheck },
            { id: 'planes', label: '💳 Planes Comerciales', icon: CreditCard },
            { id: 'modulos', label: '🧩 Catálogo de Módulos', icon: Layers },
            { id: 'licencias', label: '📄 Licencias & Cupos', icon: FileText },
            { id: 'capacidad', label: '📈 Capacidad & Límites', icon: Activity },
            { id: 'auditoria', label: '📋 Auditoría & Logs', icon: Clock },
            { id: 'arquitectura', label: '🛠️ Arquitectura & Seguridad', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                    : 'bg-slate-900/90 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* 2. SUB-SECTION CONTENT RENDERER */}
      
      {/* ---------------------------------------------------- */}
      {/* TAB 1: DASHBOARD GENERAL */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Empresas Activas */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Empresas Tenants</span>
                <Building2 className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {globalMetrics.totalEmpresas}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs">
                <span className="text-emerald-400 font-semibold">{globalMetrics.empresasActivas} Activas</span>
                <span className="text-slate-500">•</span>
                <span className="text-rose-400 font-semibold">{globalMetrics.empresasSuspendidas} Suspendidas</span>
              </div>
              <span className="absolute top-2 right-2 text-[9px] font-mono text-slate-600">[A] Real</span>
            </div>

            {/* Card 2: Colaboradores Alojados */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Colaboradores en Censo</span>
                <Users className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white">
                {globalMetrics.totalColaboradoresAlojados.toLocaleString('es-CO')}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                <span>InnovaTech IT: <strong className="text-white">482</strong></span>
                <span className="text-slate-500">•</span>
                <span>Otras: <strong className="text-white">{globalMetrics.totalColaboradoresAlojados - 482}</strong></span>
              </div>
              <span className="absolute top-2 right-2 text-[9px] font-mono text-slate-600">[A] Real</span>
            </div>

            {/* Card 3: MRR Escenario */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>MRR Estimado</span>
                <CreditCard className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-purple-300">
                ${(globalMetrics.mrrEscenarioCop / 1000000).toFixed(2)}M <span className="text-xs font-normal text-slate-400">COP/mes</span>
              </div>
              <div className="mt-3 text-xs text-purple-400 font-medium">
                ARR Proyectado: ${(globalMetrics.arrEscenarioCop / 1000000).toFixed(1)}M COP
              </div>
              <span className="absolute top-2 right-2 text-[9px] font-mono text-purple-400 bg-purple-950/60 px-1 rounded border border-purple-900">[C] Escenario</span>
            </div>

            {/* Card 4: Alertas de Capacidad */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                <span>Alertas de Capacidad</span>
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-black text-amber-300">
                {globalMetrics.empresasCercaDelLimite + globalMetrics.empresasProximasVencer}
              </div>
              <div className="flex items-center gap-2 mt-3 text-xs">
                <span className="text-amber-400 font-semibold">{globalMetrics.empresasCercaDelLimite} cerca de límite</span>
                <span className="text-slate-500">•</span>
                <span className="text-sky-400 font-semibold">{globalMetrics.empresasProximasVencer} por vencer</span>
              </div>
              <span className="absolute top-2 right-2 text-[9px] font-mono text-slate-600">[A] Real</span>
            </div>

          </div>

          {/* Detailed Tenant Status Spotlight */}
          {currentTenant && capacityReport && (
            <div className="bg-slate-950/90 border border-indigo-900/50 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Enfocado en Tenant Activo</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      ID: {currentTenant.id}
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white mt-1">
                    {currentTenant.razonSocial}
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Sector: {currentTenant.sector} • Ciudad: {currentTenant.ciudad} • Plan Actual: <strong className="text-indigo-300">{currentTenant.planId}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Vigencia de Licencia</div>
                    <div className="text-sm font-bold text-white">
                      {currentTenant.fechaVencimiento} ({capacityReport.diasParaVencer} días restantes)
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                    capacityReport.estadoGeneral === 'ACTIVA' ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700' :
                    capacityReport.estadoGeneral === 'CERCA_DEL_LIMITE' ? 'bg-amber-950/80 text-amber-300 border-amber-700' :
                    'bg-rose-950/80 text-rose-300 border-rose-700'
                  }`}>
                    {capacityReport.estadoGeneral}
                  </div>
                </div>
              </div>

              {/* Progress Bars for Limits */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Colaboradores Bar */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">Capacidad Colaboradores</span>
                    <span className="font-bold text-white">
                      {capacityReport.colaboradoresActuales} / {capacityReport.colaboradoresLimite}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        capacityReport.colaboradoresPorcentaje >= 90 ? 'bg-rose-500' :
                        capacityReport.colaboradoresPorcentaje >= 75 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(capacityReport.colaboradoresPorcentaje, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{capacityReport.colaboradoresPorcentaje}% utilizado</span>
                    <span className={capacityReport.colaboradoresStatus === 'ACTIVO' ? 'text-emerald-400' : 'text-amber-400'}>
                      {capacityReport.colaboradoresLimite - capacityReport.colaboradoresActuales} cupos libres
                    </span>
                  </div>
                </div>

                {/* Usuarios Bar */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">Usuarios Administradores</span>
                    <span className="font-bold text-white">
                      {capacityReport.usuariosActuales} / {capacityReport.usuariosLimite}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        capacityReport.usuariosPorcentaje >= 90 ? 'bg-rose-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.min(capacityReport.usuariosPorcentaje, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>{capacityReport.usuariosPorcentaje}% utilizado</span>
                    <span>{capacityReport.usuariosLimite - capacityReport.usuariosActuales} cuentas disponibles</span>
                  </div>
                </div>

                {/* Módulos Activos */}
                <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300">Módulos Habilitados</span>
                    <span className="font-bold text-white">
                      {capacityReport.modulosActivosCount} / {capacityReport.modulosTotalCount}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-purple-500 transition-all duration-500"
                      style={{ width: `${Math.round((capacityReport.modulosActivosCount / capacityReport.modulosTotalCount) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Suite Completa Habilitada</span>
                    <span className="text-purple-300 font-semibold">{capacityReport.modulosActivosCount} activos</span>
                  </div>
                </div>

              </div>

              {/* Alert notifications if any */}
              {capacityReport.alertas.length > 0 && (
                <div className="bg-amber-950/40 border border-amber-800/80 p-3.5 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                    <AlertCircle className="w-4 h-4" /> Alertas Operativas de Tenant
                  </div>
                  <ul className="text-xs text-amber-200/90 list-disc list-inside space-y-0.5">
                    {capacityReport.alertas.map((al, idx) => (
                      <li key={idx}>{al}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          )}

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => {
                setEditingTenant(null);
                setTenantFormData({
                  razonSocial: '',
                  nombreComercial: '',
                  nit: '',
                  sector: 'Servicios',
                  ciudad: 'Bogotá D.C.',
                  direccion: '',
                  telefono: '',
                  planId: 'PROFESIONAL',
                  fechaInicio: new Date().toISOString().split('T')[0],
                  fechaVencimiento: '2027-01-01',
                  contactoNombre: '',
                  contactoEmail: '',
                  contactoTelefono: '',
                  contactoCargo: ''
                });
                setShowTenantModal(true);
              }}
              className="bg-indigo-600/90 hover:bg-indigo-600 border border-indigo-500 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Aprovisionar Nueva Empresa Tenant</span>
            </button>

            <button
              onClick={() => {
                setEditingUser(null);
                setUserFormData({
                  nombre: '',
                  correo: '',
                  rol: 'ADMIN_EMPRESA',
                  companyId: selectedTenantId,
                  cargo: '',
                  telefono: '',
                  departamento: ''
                });
                setShowUserModal(true);
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition-all text-sm"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Crear Cuenta de Usuario</span>
            </button>

            <button
              onClick={() => setActiveSubTab('modulos')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition-all text-sm"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Administrar Módulos Activos</span>
            </button>
          </div>

        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: EMPRESAS (TENANTS) */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'empresas' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>Directorio de Empresas Tenants</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Aislamiento estricto de bases de datos, planes contratados y límites por empresa.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingTenant(null);
                setTenantFormData({
                  razonSocial: '',
                  nombreComercial: '',
                  nit: '',
                  sector: 'Servicios',
                  ciudad: 'Bogotá D.C.',
                  direccion: '',
                  telefono: '',
                  planId: 'PROFESIONAL',
                  fechaInicio: new Date().toISOString().split('T')[0],
                  fechaVencimiento: '2027-01-01',
                  contactoNombre: '',
                  contactoEmail: '',
                  contactoTelefono: '',
                  contactoCargo: ''
                });
                setShowTenantModal(true);
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Empresa Tenant</span>
            </button>
          </div>

          {/* Tenants Cards / Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tenants.map(t => {
              const isSelected = t.id === selectedTenantId;
              const isMain = t.id === 'empresa_main_001';
              return (
                <div 
                  key={t.id}
                  className={`bg-slate-950 border rounded-2xl p-5 shadow-xl transition-all relative space-y-4 ${
                    isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.estado === 'ACTIVO' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                          'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}>
                          {t.estado}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                          Plan {t.planId}
                        </span>
                        {isMain && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            Principal 482
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-white mt-2 leading-snug">
                        {t.razonSocial}
                      </h3>
                      <p className="text-xs text-slate-400">NIT: {t.nit} • {t.ciudad}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800/80 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Colaboradores:</span>
                      <strong className="text-white">{t.colaboradoresCount}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Usuarios Administradores:</span>
                      <strong className="text-white">{t.usuariosCount}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Vencimiento:</span>
                      <strong className="text-white">{t.fechaVencimiento}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                      <span>Contacto:</span>
                      <span className="text-slate-400 truncate">{t.contactoPrincipal.nombre}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => handleSwitchActiveTenant(t.id)}
                      className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isSelected ? 'Tenant Activo' : 'Seleccionar'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingTenant(t);
                        setTenantFormData({
                          razonSocial: t.razonSocial,
                          nombreComercial: t.nombreComercial,
                          nit: t.nit,
                          sector: t.sector,
                          ciudad: t.ciudad,
                          direccion: t.direccion || '',
                          telefono: t.telefono || '',
                          planId: t.planId,
                          fechaInicio: t.fechaInicio,
                          fechaVencimiento: t.fechaVencimiento,
                          contactoNombre: t.contactoPrincipal.nombre,
                          contactoEmail: t.contactoPrincipal.email,
                          contactoTelefono: t.contactoPrincipal.telefono,
                          contactoCargo: t.contactoPrincipal.cargo
                        });
                        setShowTenantModal(true);
                      }}
                      className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs"
                      title="Editar Tenant"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleToggleTenantStatus(t)}
                      className={`p-2 rounded-lg border text-xs ${
                        t.estado === 'ACTIVO' 
                          ? 'bg-rose-950/40 hover:bg-rose-900 text-rose-300 border-rose-800' 
                          : 'bg-emerald-950/40 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                      }`}
                      title={t.estado === 'ACTIVO' ? 'Suspender Tenant' : 'Activar Tenant'}
                    >
                      {t.estado === 'ACTIVO' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: USUARIOS & ACCESOS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'usuarios' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Administración de Cuentas de Usuario</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Gestión de credenciales, roles asignados y trazabilidad de último acceso por tenant.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingUser(null);
                setUserFormData({
                  nombre: '',
                  correo: '',
                  rol: 'ADMIN_EMPRESA',
                  companyId: selectedTenantId,
                  cargo: '',
                  telefono: '',
                  departamento: ''
                });
                setShowUserModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          {/* Security Disclaimer Banner */}
          <div className="bg-amber-950/30 border border-amber-800/80 rounded-xl p-4 text-xs text-amber-200 space-y-1">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <ShieldAlert className="w-4 h-4" />
              <span>AVISO TÉCNICO DE SEGURIDAD & AUTORIZACIÓN:</span>
            </div>
            <p>
              "Persistencia local / prototipo controlado; requiere backend, autenticación robusta (OAuth 2.0 / OIDC) y almacenamiento seguro en base de datos cifrada para producción."
            </p>
          </div>

          {/* Users Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Usuario & Correo</th>
                    <th className="p-4">Tenant Asignado</th>
                    <th className="p-4">Rol en Sistema</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Último Acceso</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map(u => {
                    const userTenant = tenants.find(t => t.id === u.companyId);
                    return (
                      <tr key={u.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 font-medium text-white">
                          <div className="font-bold text-sm text-slate-100">{u.nombre}</div>
                          <div className="text-slate-400 text-xs">{u.correo}</div>
                          {u.cargo && <div className="text-[11px] text-slate-500 mt-0.5">{u.cargo}</div>}
                        </td>
                        <td className="p-4 text-slate-300">
                          <span className="font-semibold text-white">{userTenant?.razonSocial || u.companyId}</span>
                          <div className="text-[10px] text-slate-500">{u.companyId}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                            {u.rol}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.estado === 'Activo' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-rose-950 text-rose-300 border border-rose-800'
                          }`}>
                            {u.estado}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400">
                          {u.ultimoAcceso ? new Date(u.ultimoAcceso).toLocaleString('es-CO') : 'Nunca'}
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUserFormData({
                                nombre: u.nombre,
                                correo: u.correo,
                                rol: u.rol,
                                companyId: u.companyId,
                                cargo: u.cargo || '',
                                telefono: u.telefono || '',
                                departamento: u.departamento || ''
                              });
                              setShowUserModal(true);
                            }}
                            className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700"
                            title="Editar usuario"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const author = 'lider.ghumana@innovatechit.com.co';
                              const authorRole = role?.code || 'ADMIN_EMPRESA';
                              saasService.toggleUserStatus(u.id, author, authorRole, 'Cambio de estado administrativo');
                              setRefreshKey(k => k + 1);
                            }}
                            className={`p-1.5 rounded border ${
                              u.estado === 'Activo' 
                                ? 'bg-rose-950/50 hover:bg-rose-900 text-rose-300 border-rose-800' 
                                : 'bg-emerald-950/50 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                            }`}
                            title={u.estado === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {u.estado === 'Activo' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: ROLES & PERMISOS RBAC */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'rbac' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <span>Matriz de Roles & Privilegios RBAC</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Estructura de mínimo privilegio con roles estratégicos, operativos, especialistas y auditores.
              </p>
            </div>
          </div>

          {/* Roles Catalog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rbacService.getRoles().map(r => (
              <div key={r.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{r.category}</span>
                    <h3 className="text-base font-bold text-white">{r.name}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${r.color}`}>
                    {r.code}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{r.description}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
                  <span>Permisos Otorgados:</span>
                  <strong className="text-indigo-400 font-bold">{r.permissions.length}</strong>
                </div>
              </div>
            ))}
          </div>

          {/* Category Permissions Summary */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-300">
              Permisos Centrales del Sistema (Módulos & Seguridad)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {rbacService.getPermissions().map(p => (
                <div key={p.id} className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{p.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{p.description}</p>
                  <div className="text-[9px] font-mono text-indigo-400 pt-1">{p.code}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: PLANES COMERCIALES */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'planes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                  [C] ESCENARIOS COMERCIALES EDITABLES
                </span>
              </div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <span>Estructura de Planes & Suscripciones</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Catálogo de planes para PYMES, Medianas y Grandes Corporaciones con límites de colaboradores y características.
              </p>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map(p => {
              const isAssigned = currentTenant?.planId === p.id;
              return (
                <div 
                  key={p.id}
                  className={`bg-slate-950 border rounded-2xl p-6 shadow-2xl flex flex-col justify-between space-y-6 relative transition-all ${
                    p.badgePopular ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-slate-800'
                  }`}
                >
                  {p.badgePopular && (
                    <span className="absolute -top-3 right-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                      Recomendado
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">{p.tag}</span>
                      <h3 className="text-2xl font-black text-white mt-1">{p.nombre}</h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">{p.descripcion}</p>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Tarifa Mensual Estimada</div>
                      <div className="text-3xl font-black text-white">
                        ${p.precioMensualCopEscenario.toLocaleString('es-CO')} <span className="text-xs font-normal text-slate-400">COP/mes</span>
                      </div>
                      <div className="text-[11px] text-purple-300">
                        Anual: ${p.precioAnualCopEscenario.toLocaleString('es-CO')} COP ({p.descuentoAnualPorcentaje}% dto.)
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Hasta <strong>{p.maxColaboradores.toLocaleString('es-CO')} colaboradores</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Hasta <strong>{p.maxUsuarios} usuarios</strong> administradores</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Hasta <strong>{p.maxSedes} sedes / centros de trabajo</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.incluyeIa ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <X className="w-4 h-4 text-slate-600 shrink-0" />}
                        <span className={p.incluyeIa ? 'text-slate-200' : 'text-slate-500'}>Inteligencia Artificial SG-SST</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.incluyeCopilot ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <X className="w-4 h-4 text-slate-600 shrink-0" />}
                        <span className={p.incluyeCopilot ? 'text-slate-200' : 'text-slate-500'}>Copilot Conversacional Human-in-the-Loop</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.incluyeGobernanzaIa ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <X className="w-4 h-4 text-slate-600 shrink-0" />}
                        <span className={p.incluyeGobernanzaIa ? 'text-slate-200' : 'text-slate-500'}>Gobernanza, Estrategia & Viabilidad</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {p.incluyeIntegraciones ? <Check className="w-4 h-4 text-emerald-400 shrink-0" /> : <X className="w-4 h-4 text-slate-600 shrink-0" />}
                        <span className={p.incluyeIntegraciones ? 'text-slate-200' : 'text-slate-500'}>Integraciones Power BI & APIs</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => handleChangeTenantPlan(p.id)}
                      disabled={isAssigned}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs md:text-sm flex items-center justify-center gap-2 transition-all ${
                        isAssigned 
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 cursor-default' 
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                      }`}
                    >
                      {isAssigned ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Plan Actual de {currentTenant?.razonSocial}</span>
                        </>
                      ) : (
                        <span>Asignar a Tenant Seleccionado</span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setEditingPlan(p);
                        setPlanPriceDraft(p.precioMensualCopEscenario);
                        setPlanPriceJustification('');
                        setShowPlanModal(true);
                      }}
                      className="w-full py-1.5 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                    >
                      Editar Escenario de Precios [C]
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 6: CATÁLOGO DE MÓDULOS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'modulos' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-400" />
                <span>Catálogo Central de Módulos & Activaciones</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configuración dinámica de módulos disponibles para el tenant: <strong>{currentTenant?.razonSocial}</strong>.
              </p>
            </div>
          </div>

          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {moduleCatalog.map(mod => {
              const assignment = tenantModules.find(a => a.moduloId === mod.id);
              const isActive = assignment?.estado === 'ACTIVO' || assignment?.estado === 'PRUEBA';
              return (
                <div 
                  key={mod.id}
                  className={`bg-slate-950 border rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition-all ${
                    isActive ? 'border-slate-800' : 'border-slate-800/60 opacity-60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                        {mod.categoria}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isActive ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-900 text-slate-500'
                      }`}>
                        {isActive ? 'HABILITADO' : 'DESACTIVADO'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white leading-snug">{mod.nombre}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{mod.descripcion}</p>

                    <div className="text-[11px] text-slate-500 pt-1">
                      Origen: <strong className="text-slate-300">{assignment?.origen || (mod.isAddon ? 'ADD_ON' : 'PLAN_BASE')}</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Planes: {mod.planesMinimos.join(', ')}
                    </span>
                    <button
                      onClick={() => handleToggleModule(mod.id, assignment?.estado || 'INACTIVO')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isActive 
                          ? 'bg-rose-950/40 hover:bg-rose-900 text-rose-300 border border-rose-800' 
                          : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {isActive ? 'Desactivar' : 'Activar Módulo'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 7: LICENCIAS & CUPOS */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'licencias' && tenantLicense && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Licenciamiento del Tenant</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Expediente de contrato y términos de licenciamiento para <strong>{currentTenant?.razonSocial}</strong>.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">ID de Licencia</div>
                <div className="text-sm font-mono font-bold text-white mt-1">{tenantLicense.id}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">Plan Suscrito</div>
                <div className="text-base font-bold text-indigo-300 mt-1">Plan {tenantLicense.planId}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">Vigencia Contratada</div>
                <div className="text-xs font-semibold text-white mt-1">
                  {tenantLicense.fechaInicio} a {tenantLicense.fechaFin}
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400">Estado de Licencia</div>
                <div className="text-sm font-bold text-emerald-400 mt-1">{tenantLicense.estado}</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
                Módulos Amparados por la Licencia
              </h3>
              <div className="flex flex-wrap gap-2">
                {tenantLicense.modulosActivos.map(modId => (
                  <span key={modId} className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-950/80 text-indigo-200 border border-indigo-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                    {modId}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 8: CAPACIDAD & LÍMITES */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'capacidad' && capacityReport && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-amber-400" />
                <span>Control de Capacidad & Límites Operativos</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Monitoreo en tiempo real para evitar suspensiones imprevistas sin alterar datos existentes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Colaboradores Detail Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Colaboradores</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  capacityReport.colaboradoresStatus === 'ACTIVO' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                }`}>
                  {capacityReport.colaboradoresStatus}
                </span>
              </div>
              <div className="text-3xl font-black text-white">
                {capacityReport.colaboradoresActuales} <span className="text-base font-normal text-slate-400">/ {capacityReport.colaboradoresLimite}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    capacityReport.colaboradoresPorcentaje >= 90 ? 'bg-rose-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${capacityReport.colaboradoresPorcentaje}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">
                La plataforma preserva el censo íntegro de <strong>482 colaboradores</strong> sin eliminaciones destructivas.
              </p>
            </div>

            {/* Usuarios Detail Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Usuarios Administradores</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  capacityReport.usuariosStatus === 'ACTIVO' ? 'bg-emerald-950 text-emerald-300' : 'bg-amber-950 text-amber-300'
                }`}>
                  {capacityReport.usuariosStatus}
                </span>
              </div>
              <div className="text-3xl font-black text-white">
                {capacityReport.usuariosActuales} <span className="text-base font-normal text-slate-400">/ {capacityReport.usuariosLimite}</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-teal-500"
                  style={{ width: `${capacityReport.usuariosPorcentaje}%` }}
                />
              </div>
              <p className="text-xs text-slate-400">
                Cuentas de usuario autorizadas con roles RBAC según el principio de mínimo privilegio.
              </p>
            </div>

            {/* Vigencia Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vigencia de Contrato</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  capacityReport.isVencido ? 'bg-rose-950 text-rose-300' : 'bg-emerald-950 text-emerald-300'
                }`}>
                  {capacityReport.isVencido ? 'VENCIDO' : 'VIGENTE'}
                </span>
              </div>
              <div className="text-3xl font-black text-white">
                {capacityReport.diasParaVencer} <span className="text-base font-normal text-slate-400">días restantes</span>
              </div>
              <div className="text-xs text-slate-400">
                Fecha límite de renovación: <strong className="text-white">{currentTenant?.fechaVencimiento}</strong>
              </div>
              <p className="text-xs text-slate-400">
                Notificación automática de renovación programada con 30 días de anticipación.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 9: AUDITORÍA & TRAZABILIDAD */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'auditoria' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span>Trazabilidad & Bitácora de Auditoría Administrativa</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Registro inmutable de cambios de plan, asignación de roles, activación de módulos y justificaciones.
              </p>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-4">Fecha & Hora</th>
                    <th className="p-4">Usuario Responsable</th>
                    <th className="p-4">Acción</th>
                    <th className="p-4">Entidad Afectada</th>
                    <th className="p-4">Valor Anterior / Nuevo</th>
                    <th className="p-4">Justificación Técnica</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-slate-500">
                        No hay eventos de auditoría registrados en la bitácora.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="p-4 font-mono text-slate-400">
                          {new Date(log.timestamp).toLocaleString('es-CO')}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-white">{log.usuario}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{log.rol}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                            {log.accion}
                          </span>
                        </td>
                        <td className="p-4 text-slate-300 font-medium">
                          {log.entidad}
                        </td>
                        <td className="p-4 text-[11px]">
                          <div className="text-rose-400 line-through truncate max-w-xs">{log.valorAnterior}</div>
                          <div className="text-emerald-400 font-semibold truncate max-w-xs">{log.valorNuevo}</div>
                        </td>
                        <td className="p-4 text-slate-300 text-xs italic">
                          "{log.justificacion}"
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 10: ARQUITECTURA & SEGURIDAD */}
      {/* ---------------------------------------------------- */}
      {activeSubTab === 'arquitectura' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <span>Arquitectura Desacoplada Preparada para Backend Productivo</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">
              Insight People IA está estructurado mediante capas de servicios desacopladas que permiten una migración 
              transparente hacia un backend en la nube sin requerir refactorizaciones de las interfaces ni de la lógica matemática de indicadores.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> PostgreSQL / Cloud SQL
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Esquemas normalizados 3NF compatibles con Row Level Security (RLS) para aislamiento estricto por <code>tenant_id</code>.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Key className="w-4 h-4" /> Autenticación OAuth 2.0 & OIDC
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Compatibilidad para Single Sign-On (SSO) empresarial con Microsoft Entra ID (Azure AD), Google Workspace y Okta.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <GitCompare className="w-4 h-4" /> DirectQuery Power BI & REST API
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Endpoints gobernados para alimentar tableros directivos y consumir nómina electrónica sin exponer datos sensibles.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: TENANT (EMPRESA) */}
      {/* ---------------------------------------------------- */}
      {showTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                <span>{editingTenant ? 'Editar Empresa Tenant' : 'Aprovisionar Nueva Empresa Tenant'}</span>
              </h3>
              <button 
                onClick={() => setShowTenantModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTenant} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Razón Social *</label>
                  <input
                    type="text"
                    required
                    value={tenantFormData.razonSocial}
                    onChange={e => setTenantFormData({ ...tenantFormData, razonSocial: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    placeholder="Ej. Acme Logistics S.A.S."
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">NIT / Identificación *</label>
                  <input
                    type="text"
                    required
                    value={tenantFormData.nit}
                    onChange={e => setTenantFormData({ ...tenantFormData, nit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    placeholder="Ej. 901.234.567-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Sector Económico</label>
                  <input
                    type="text"
                    value={tenantFormData.sector}
                    onChange={e => setTenantFormData({ ...tenantFormData, sector: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    placeholder="Ej. Manufactura"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ciudad Principal</label>
                  <input
                    type="text"
                    value={tenantFormData.ciudad}
                    onChange={e => setTenantFormData({ ...tenantFormData, ciudad: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                    placeholder="Ej. Medellín"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Plan Comercial</label>
                  <select
                    value={tenantFormData.planId}
                    onChange={e => setTenantFormData({ ...tenantFormData, planId: e.target.value as PlanTier })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="BASICO">Plan Básico (Hasta 100 colab)</option>
                    <option value="PROFESIONAL">Plan Profesional (Hasta 350 colab)</option>
                    <option value="EMPRESARIAL">Plan Empresarial (Hasta 1,000 colab)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fecha de Inicio</label>
                  <input
                    type="date"
                    value={tenantFormData.fechaInicio}
                    onChange={e => setTenantFormData({ ...tenantFormData, fechaInicio: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fecha de Vencimiento</label>
                  <input
                    type="date"
                    value={tenantFormData.fechaVencimiento}
                    onChange={e => setTenantFormData({ ...tenantFormData, fechaVencimiento: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-slate-300 font-bold mb-2">Contacto Principal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={tenantFormData.contactoNombre}
                      onChange={e => setTenantFormData({ ...tenantFormData, contactoNombre: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={tenantFormData.contactoEmail}
                      onChange={e => setTenantFormData({ ...tenantFormData, contactoEmail: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTenantModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Guardar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: USUARIO */}
      {/* ---------------------------------------------------- */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>{editingUser ? 'Editar Cuenta de Usuario' : 'Crear Cuenta de Usuario'}</span>
              </h3>
              <button 
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={userFormData.nombre}
                  onChange={e => setUserFormData({ ...userFormData, nombre: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  placeholder="Ej. Ana María Torres"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico Corporativo *</label>
                <input
                  type="email"
                  required
                  value={userFormData.correo}
                  onChange={e => setUserFormData({ ...userFormData, correo: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  placeholder="Ej. ana.torres@empresa.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Empresa Tenant</label>
                  <select
                    value={userFormData.companyId}
                    onChange={e => setUserFormData({ ...userFormData, companyId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.razonSocial}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rol RBAC Asignado</label>
                  <select
                    value={userFormData.rol}
                    onChange={e => setUserFormData({ ...userFormData, rol: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  >
                    <option value="ADMIN_EMPRESA">Administrador de Empresa</option>
                    <option value="DIRECTOR_SST">Director de SST</option>
                    <option value="GESTION_HUMANA">Gestión Humana</option>
                    <option value="MEDICO_LABORAL">Médico Laboral</option>
                    <option value="PSICOLOGO">Psicólogo</option>
                    <option value="AUDITOR">Auditor</option>
                    <option value="CONSULTOR">Consultor Externo</option>
                    <option value="USUARIO">Usuario Estándar</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL: EDITAR PRECIO PLAN (ESCENARIO) */}
      {/* ---------------------------------------------------- */}
      {showPlanModal && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                <span>Editar Escenario Tarifario [C]</span>
              </h3>
              <button 
                onClick={() => setShowPlanModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-400 leading-relaxed">
              Modificación de la tarifa estimada para <strong>{editingPlan.nombre}</strong>.
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Precio Mensual COP [C]</label>
                <input
                  type="number"
                  step="50000"
                  value={planPriceDraft}
                  onChange={e => setPlanPriceDraft(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Justificación del Ajuste *</label>
                <textarea
                  rows={2}
                  required
                  value={planPriceJustification}
                  onChange={e => setPlanPriceJustification(e.target.value)}
                  placeholder="Ej. Calibración de costos para mercado colombiano 2026"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowPlanModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const updatedPlans = plans.map(p => {
                    if (p.id === editingPlan.id) {
                      const newAnnual = Math.round(planPriceDraft * 12 * 0.85);
                      return {
                        ...p,
                        precioMensualCopEscenario: planPriceDraft,
                        precioAnualCopEscenario: newAnnual
                      };
                    }
                    return p;
                  });

                  licenseService.savePlans(updatedPlans);

                  saasService.logAudit({
                    usuario: 'lider.ghumana@innovatechit.com.co',
                    rol: role?.code || 'ADMIN_EMPRESA',
                    companyId: 'GLOBAL',
                    accion: 'AJUSTE_PRECIO_ESCENARIO',
                    entidad: `Plan ${editingPlan.nombre}`,
                    valorAnterior: `$${editingPlan.precioMensualCopEscenario}`,
                    valorNuevo: `$${planPriceDraft}`,
                    justificacion: planPriceJustification || 'Ajuste de escenario comercial',
                    modulo: 'PLANES_SAAS',
                    tipoDato: '[C] Escenario'
                  });

                  setShowPlanModal(false);
                  setRefreshKey(k => k + 1);
                }}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
              >
                Guardar Escenario
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
