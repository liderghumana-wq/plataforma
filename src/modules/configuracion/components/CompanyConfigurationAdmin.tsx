import React, { useState, useEffect } from 'react';
import {
  Building2,
  MapPin,
  Layers,
  Briefcase,
  UserCheck,
  FileText,
  Laptop,
  Calendar,
  Settings,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Save,
  AlertCircle,
  Filter,
  History,
  Eye,
  Edit2,
  Trash2,
  Building,
  Sparkles
} from 'lucide-react';
import { NewCompanyWizardModal } from './NewCompanyWizardModal';
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
  CatalogItemStatus
} from '../companyAdmin.types';
import { companyAdminService } from '../companyAdmin.service';

interface CompanyConfigurationAdminProps {
  initialCompanyId?: string;
  onCompanyChange?: (companyId: string) => void;
}

export function CompanyConfigurationAdmin({
  initialCompanyId,
  onCompanyChange
}: CompanyConfigurationAdminProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompanyId, setActiveCompanyId] = useState<string>(initialCompanyId || 'empresa-a');
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    | 'general'
    | 'sedes'
    | 'areas'
    | 'proyectos'
    | 'cargos'
    | 'contratos'
    | 'modalidades'
    | 'turnos'
    | 'centros'
    | 'campos'
    | 'periodos'
    | 'audit'
  >('general');

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Form states
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Loaded entity data
  const [company, setCompany] = useState<Company | null>(null);
  const [config, setConfig] = useState<CompanyConfiguration | null>(null);
  const [sites, setSites] = useState<CompanySite[]>([]);
  const [areas, setAreas] = useState<CompanyArea[]>([]);
  const [projects, setProjects] = useState<CompanyProject[]>([]);
  const [positions, setPositions] = useState<CompanyPosition[]>([]);
  const [contractTypes, setContractTypes] = useState<CompanyContractType[]>([]);
  const [workModalities, setWorkModalities] = useState<CompanyWorkModality[]>([]);
  const [shifts, setShifts] = useState<CompanyShift[]>([]);
  const [costCenters, setCostCenters] = useState<CompanyCostCenter[]>([]);
  const [customFields, setCustomFields] = useState<CompanyCustomField[]>([]);
  const [surveyPeriods, setSurveyPeriods] = useState<SurveyPeriod[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Item Editing Modal or Inline Form states
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    city: '',
    address: '',
    siteId: '',
    areaId: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    fieldKey: '',
    label: '',
    category: 'ORGANIZACIONAL' as const,
    dataType: 'STRING' as const,
    required: false,
    optionsText: '',
    status: 'ACTIVE' as CatalogItemStatus
  });

  // Load companies
  useEffect(() => {
    const list = companyAdminService.getCompanies();
    setCompanies(list);
    if (list.length > 0 && !list.some(c => c.id === activeCompanyId)) {
      setActiveCompanyId(list[0].id);
    }
  }, []);

  // Load active company data
  const reloadData = () => {
    if (!activeCompanyId) return;
    const comp = companyAdminService.getCompanyById(activeCompanyId);
    setCompany(comp);
    setConfig(companyAdminService.getCompanyConfiguration(activeCompanyId));
    setSites(companyAdminService.getSites(activeCompanyId, true));
    setAreas(companyAdminService.getAreas(activeCompanyId, true));
    setProjects(companyAdminService.getProjects(activeCompanyId, true));
    setPositions(companyAdminService.getPositions(activeCompanyId, true));
    setContractTypes(companyAdminService.getContractTypes(activeCompanyId, true));
    setWorkModalities(companyAdminService.getWorkModalities(activeCompanyId, true));
    setShifts(companyAdminService.getShifts(activeCompanyId, true));
    setCostCenters(companyAdminService.getCostCenters(activeCompanyId, true));
    setCustomFields(companyAdminService.getCustomFields(activeCompanyId, true));
    setSurveyPeriods(companyAdminService.getSurveyPeriods(activeCompanyId));
    setAuditLogs(companyAdminService.getAuditLogs(activeCompanyId));
  };

  useEffect(() => {
    reloadData();
    if (onCompanyChange) onCompanyChange(activeCompanyId);
  }, [activeCompanyId]);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectCompany = (id: string) => {
    setActiveCompanyId(id);
    setIsFormOpen(false);
    setEditingItem(null);
  };

  // General Config Save
  const handleSaveGeneralConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company || !config) return;

    companyAdminService.saveCompany({
      id: company.id,
      name: company.name,
      identificationNumber: company.identificationNumber,
      primaryColor: company.primaryColor,
      secondaryColor: company.secondaryColor,
      status: company.status
    });

    companyAdminService.saveCompanyConfiguration(config);
    reloadData();
    showToast('success', 'Configuración general de la empresa actualizada correctamente.');
  };

  // Open Form to Create or Edit
  const handleOpenForm = (item?: any) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || item.label || '',
        code: item.code || '',
        city: item.city || '',
        address: item.address || '',
        siteId: item.siteId || '',
        areaId: item.areaId || '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        startTime: item.startTime || '',
        endTime: item.endTime || '',
        fieldKey: item.fieldKey || '',
        label: item.label || item.name || '',
        category: item.category || 'ORGANIZACIONAL',
        dataType: item.dataType || 'STRING',
        required: item.required || false,
        optionsText: item.options ? item.options.join(', ') : '',
        status: item.status || 'ACTIVE'
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        code: `${activeTab.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
        city: '',
        address: '',
        siteId: '',
        areaId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '17:00',
        fieldKey: '',
        label: '',
        category: 'ORGANIZACIONAL',
        dataType: 'STRING',
        required: false,
        optionsText: '',
        status: 'ACTIVE'
      });
    }
    setIsFormOpen(true);
  };

  // Submit Form for Sub-Catalogs
  const handleSubmitCatalogForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'campos') {
      if (!formData.label.trim() || (!editingItem && !formData.fieldKey.trim())) {
        showToast('error', 'La etiqueta y clave de campo son obligatorias.');
        return;
      }
    } else {
      if (!formData.name.trim()) {
        showToast('error', 'El nombre es obligatorio.');
        return;
      }
      if (activeTab !== 'periodos' && !formData.code.trim()) {
        showToast('error', 'El código interno es obligatorio.');
        return;
      }
    }

    let res: { success: boolean; error?: string } = { success: true };

    if (activeTab === 'sedes') {
      res = companyAdminService.saveSite(activeCompanyId, {
        id: editingItem?.id,
        name: formData.name,
        code: formData.code,
        city: formData.city,
        address: formData.address,
        status: formData.status
      });
    } else if (activeTab === 'areas') {
      res = companyAdminService.saveArea(activeCompanyId, {
        id: editingItem?.id,
        name: formData.name,
        code: formData.code,
        status: formData.status
      });
    } else if (activeTab === 'proyectos') {
      res = companyAdminService.saveProject(activeCompanyId, {
        id: editingItem?.id,
        name: formData.name,
        code: formData.code,
        siteId: formData.siteId || undefined,
        areaId: formData.areaId || undefined,
        status: formData.status
      });
    } else if (activeTab === 'cargos') {
      res = companyAdminService.savePosition(activeCompanyId, {
        id: editingItem?.id,
        name: formData.name,
        code: formData.code,
        areaId: formData.areaId || undefined,
        status: formData.status
      });
    } else if (activeTab === 'contratos') {
      res = companyAdminService.saveContractType(activeCompanyId, {
        id: editingItem?.id,
        name: formData.name,
        code: formData.code,
        status: formData.status
      });
    } else if (activeTab === 'modalidades') {
      res = companyAdminService.saveWorkModality(activeCompanyId, {
        id: editingItem?.id,
        name: formData.name,
        code: formData.code,
        status: formData.status
      });
    } else if (activeTab === 'turnos') {
      res = companyAdminService.saveShift(activeCompanyId, {
        id: editingItem?.id,
        name: formData.name,
        code: formData.code,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: formData.status
      });
    } else if (activeTab === 'centros') {
      res = companyAdminService.saveCostCenter(activeCompanyId, {
        id: editingItem?.id,
        name: formData.name,
        code: formData.code,
        status: formData.status
      });
    } else if (activeTab === 'campos') {
      const opts = formData.optionsText
        ? formData.optionsText.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      res = companyAdminService.saveCustomField(activeCompanyId, {
        id: editingItem?.id,
        fieldKey: formData.fieldKey,
        label: formData.label,
        category: formData.category,
        dataType: formData.dataType,
        required: formData.required,
        options: opts,
        status: formData.status
      });
    } else if (activeTab === 'periodos') {
      companyAdminService.saveSurveyPeriod(activeCompanyId, {
        id: editingItem?.id,
        name: formData.name,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: (formData.status as any) || 'DRAFT'
      });
    }

    if (!res.success) {
      showToast('error', res.error || 'Error al guardar el registro.');
      return;
    }

    reloadData();
    setIsFormOpen(false);
    showToast('success', `Registro guardado exitosamente en ${activeCompanyId}.`);
  };

  // Logical Status Toggle
  const handleToggleStatus = (itemId: string, currentStatus: string) => {
    const nextStatus: CatalogItemStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    if (activeTab === 'sedes') companyAdminService.setSiteStatus(activeCompanyId, itemId, nextStatus);
    if (activeTab === 'areas') companyAdminService.setAreaStatus(activeCompanyId, itemId, nextStatus);
    if (activeTab === 'proyectos') companyAdminService.setProjectStatus(activeCompanyId, itemId, nextStatus);
    if (activeTab === 'cargos') companyAdminService.setPositionStatus(activeCompanyId, itemId, nextStatus);
    if (activeTab === 'contratos') companyAdminService.setContractTypeStatus(activeCompanyId, itemId, nextStatus);
    if (activeTab === 'modalidades') companyAdminService.setWorkModalityStatus(activeCompanyId, itemId, nextStatus);
    if (activeTab === 'turnos') companyAdminService.setShiftStatus(activeCompanyId, itemId, nextStatus);
    if (activeTab === 'centros') companyAdminService.setCostCenterStatus(activeCompanyId, itemId, nextStatus);
    if (activeTab === 'campos') companyAdminService.setCustomFieldStatus(activeCompanyId, itemId, nextStatus);

    reloadData();
    showToast('success', `Estado actualizado a ${nextStatus}. Se conservan los registros históricos.`);
  };

  // Filter List Helper
  const filterItems = <T extends { name: string; code?: string; status: string }>(items: T[]): T[] => {
    return items.filter(item => {
      const matchSearch =
        !searchTerm.trim() ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 md:p-8 space-y-6 text-left select-none">
      {/* Top Banner & Company Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Módulo Multiempresa PROMPT 23</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-display flex items-center gap-2">
            <span>Administrador de Parametrización por Empresa</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Gestión independiente de catálogos, estructura organizacional y reglas para garantizar un aislamiento multiempresa estricto.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowWizardModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl text-xs font-black shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>+ Crear Nueva Empresa (Wizard 8 Pasos)</span>
          </button>

          {/* Company Selector Dropdown */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <Building className="w-4 h-4 text-indigo-600 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Empresa Activa</span>
              <select
                value={activeCompanyId}
                onChange={(e) => handleSelectCompany(e.target.value)}
                className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer pr-4"
              >
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.identificationNumber}) [{c.status}]
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Toast alert */}
      {toastMessage && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-bold border flex items-center gap-2.5 animate-fade-in ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100">
        {[
          { id: 'general', label: 'Información General', icon: Settings },
          { id: 'sedes', label: `Sedes (${sites.length})`, icon: MapPin },
          { id: 'areas', label: `Áreas (${areas.length})`, icon: Layers },
          { id: 'proyectos', label: `Proyectos (${projects.length})`, icon: Briefcase },
          { id: 'cargos', label: `Cargos (${positions.length})`, icon: UserCheck },
          { id: 'contratos', label: `Tipos Contrato (${contractTypes.length})`, icon: FileText },
          { id: 'modalidades', label: `Modalidades (${workModalities.length})`, icon: Laptop },
          { id: 'turnos', label: `Turnos (${shifts.length})`, icon: Clock },
          { id: 'centros', label: `Centros Costo (${costCenters.length})`, icon: Building2 },
          { id: 'campos', label: `Campos Custom (${customFields.length})`, icon: Filter },
          { id: 'periodos', label: `Periodos (${surveyPeriods.length})`, icon: Calendar },
          { id: 'audit', label: 'Auditoría Log', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsFormOpen(false);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INFORMACIÓN GENERAL */}
      {activeTab === 'general' && company && config && (
        <form onSubmit={handleSaveGeneralConfig} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200">
            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-600" />
                <span>Datos Corporativos (Company & Configuration)</span>
              </h3>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nombre Legal de la Empresa</label>
                <input
                  type="text"
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Identificación Tributaria (NIT)</label>
                <input
                  type="text"
                  value={company.identificationNumber}
                  onChange={(e) => setCompany({ ...company, identificationNumber: e.target.value })}
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Nombre Comercial</label>
                <input
                  type="text"
                  value={config.tradeName}
                  onChange={(e) => setConfig({ ...config, tradeName: e.target.value })}
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Color Primario</label>
                  <input
                    type="color"
                    value={company.primaryColor || '#4f46e5'}
                    onChange={(e) => setCompany({ ...company, primaryColor: e.target.value })}
                    className="w-full h-10 bg-white rounded-xl border border-slate-300 cursor-pointer p-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Color Secundario</label>
                  <input
                    type="color"
                    value={company.secondaryColor || '#06b6d4'}
                    onChange={(e) => setCompany({ ...company, secondaryColor: e.target.value })}
                    className="w-full h-10 bg-white rounded-xl border border-slate-300 cursor-pointer p-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Privacidad y Reglas de Encuesta</span>
              </h3>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Zona Horaria</label>
                <input
                  type="text"
                  value={config.timeZone}
                  onChange={(e) => setConfig({ ...config, timeZone: e.target.value })}
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold"
                />
              </div>

              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="requireConsent"
                  checked={config.privacyConfig.requireHealthConsent}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      privacyConfig: { ...config.privacyConfig, requireHealthConsent: e.target.checked }
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="requireConsent" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Exigir consentimiento informado de salud previo a diligenciar encuesta
                </label>
              </div>

              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="autoSaveDraft"
                  checked={config.surveyConfig.autoSaveDraft}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      surveyConfig: { ...config.surveyConfig, autoSaveDraft: e.target.checked }
                    })
                  }
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
                <label htmlFor="autoSaveDraft" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Autoguardado de borrador de encuestas sociodemográficas
                </label>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Estado de Empresa</label>
                <select
                  value={company.status}
                  onChange={(e) => setCompany({ ...company, status: e.target.value as any })}
                  className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold"
                >
                  <option value="ACTIVE">ACTIVE (Activa)</option>
                  <option value="INACTIVE">INACTIVE (Eliminación Lógica)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Configuración General</span>
            </button>
          </div>
        </form>
      )}

      {/* CATALOG TABS (Sedes, Áreas, Proyectos, Cargos, Contratos, Modalidades, Periodos) */}
      {activeTab !== 'general' && activeTab !== 'audit' && (
        <div className="space-y-4">
          {/* Action bar & search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o código..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-bold focus:outline-none cursor-pointer"
              >
                <option value="ALL">Todos los Estados</option>
                <option value="ACTIVE">Solo Activos</option>
                <option value="INACTIVE">Solo Inactivos (Históricos)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => handleOpenForm()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Registro</span>
            </button>
          </div>

          {/* Create/Edit Form Modal / Drawer */}
          {isFormOpen && (
            <form onSubmit={handleSubmitCatalogForm} className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-200 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider">
                  {editingItem ? 'Editar Registro' : 'Crear Registro en ' + activeCompanyId}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-indigo-400 hover:text-indigo-800 text-xs font-black cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Nombre</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none"
                    placeholder="Ej. Sede Norte / Operaciones"
                    required
                  />
                </div>

                {activeTab !== 'periodos' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Código Interno Unico</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold uppercase focus:outline-none"
                      placeholder="Ej. BOG-01"
                      required
                    />
                  </div>
                )}

                {activeTab === 'sedes' && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Ciudad</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium"
                        placeholder="Ej. Bogotá"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Dirección</label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium"
                        placeholder="Ej. Calle 100 #15-20"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'proyectos' && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Sede Asociada</label>
                      <select
                        value={formData.siteId}
                        onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                        className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium"
                      >
                        <option value="">(Sin Sede Especificada)</option>
                        {sites.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Área Asociada</label>
                      <select
                        value={formData.areaId}
                        onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                        className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium"
                      >
                        <option value="">(Sin Área Especificada)</option>
                        {areas.map(a => (
                          <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {activeTab === 'cargos' && (
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Área Perteneciente</label>
                    <select
                      value={formData.areaId}
                      onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                      className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium"
                    >
                      <option value="">(Sin Área Especificada)</option>
                      {areas.map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                {activeTab === 'turnos' && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Hora Inicio</label>
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Hora Fin</label>
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'campos' && (
                  <>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Clave de Campo (Key)</label>
                      <input
                        type="text"
                        value={formData.fieldKey}
                        onChange={(e) => setFormData({ ...formData, fieldKey: e.target.value })}
                        disabled={Boolean(editingItem)}
                        className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none disabled:bg-slate-100"
                        placeholder="ej_centro_operaciones"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Etiqueta (Label)</label>
                      <input
                        type="text"
                        value={formData.label}
                        onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                        className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                        placeholder="Ej. Centro de Operaciones"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Categoría</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium"
                      >
                        <option value="ORGANIZACIONAL">ORGANIZACIONAL</option>
                        <option value="SOCIODEMOGRAFICO">SOCIODEMOGRAFICO</option>
                        <option value="SALUD">SALUD</option>
                        <option value="PERSONALIZADO">PERSONALIZADO</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">Tipo de Dato</label>
                      <select
                        value={formData.dataType}
                        onChange={(e) => setFormData({ ...formData, dataType: e.target.value as any })}
                        className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium"
                      >
                        <option value="STRING">Texto (STRING)</option>
                        <option value="NUMBER">Número (NUMBER)</option>
                        <option value="SELECT">Lista Desplegable (SELECT)</option>
                        <option value="MULTISELECT">Multiselección (MULTISELECT)</option>
                        <option value="DATE">Fecha (DATE)</option>
                        <option value="BOOLEAN">Booleano (Si/No)</option>
                      </select>
                    </div>
                    {(formData.dataType === 'SELECT' || formData.dataType === 'MULTISELECT') && (
                      <div className="md:col-span-2">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Opciones (separadas por coma)</label>
                        <input
                          type="text"
                          value={formData.optionsText}
                          onChange={(e) => setFormData({ ...formData, optionsText: e.target.value })}
                          className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium"
                          placeholder="Opción A, Opción B, Opción C"
                        />
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Estado Lógico</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-semibold"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          )}

          {/* List display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeTab === 'sedes' &&
              filterItems(sites).map((s: CompanySite) => (
                <ItemCard
                  key={s.id}
                  title={s.name}
                  code={s.code}
                  subtitle={s.city ? `${s.city} - ${s.address || ''}` : undefined}
                  status={s.status}
                  onEdit={() => handleOpenForm(s)}
                  onToggleStatus={() => handleToggleStatus(s.id, s.status)}
                />
              ))}

            {activeTab === 'areas' &&
              filterItems(areas).map((a: CompanyArea) => (
                <ItemCard
                  key={a.id}
                  title={a.name}
                  code={a.code}
                  status={a.status}
                  onEdit={() => handleOpenForm(a)}
                  onToggleStatus={() => handleToggleStatus(a.id, a.status)}
                />
              ))}

            {activeTab === 'proyectos' &&
              filterItems(projects).map((p: CompanyProject) => {
                const linkedSite = sites.find(s => s.id === p.siteId);
                const linkedArea = areas.find(a => a.id === p.areaId);
                return (
                  <ItemCard
                    key={p.id}
                    title={p.name}
                    code={p.code}
                    subtitle={`Sede: ${linkedSite?.name || 'N/A'} | Área: ${linkedArea?.name || 'N/A'}`}
                    status={p.status}
                    onEdit={() => handleOpenForm(p)}
                    onToggleStatus={() => handleToggleStatus(p.id, p.status)}
                  />
                );
              })}

            {activeTab === 'cargos' &&
              filterItems(positions).map((pos: CompanyPosition) => {
                const linkedArea = areas.find(a => a.id === pos.areaId);
                return (
                  <ItemCard
                    key={pos.id}
                    title={pos.name}
                    code={pos.code}
                    subtitle={`Área: ${linkedArea?.name || 'General'}`}
                    status={pos.status}
                    onEdit={() => handleOpenForm(pos)}
                    onToggleStatus={() => handleToggleStatus(pos.id, pos.status)}
                  />
                );
              })}

            {activeTab === 'contratos' &&
              filterItems(contractTypes).map((ct: CompanyContractType) => (
                <ItemCard
                  key={ct.id}
                  title={ct.name}
                  code={ct.code}
                  status={ct.status}
                  onEdit={() => handleOpenForm(ct)}
                  onToggleStatus={() => handleToggleStatus(ct.id, ct.status)}
                />
              ))}

            {activeTab === 'modalidades' &&
              filterItems(workModalities).map((wm: CompanyWorkModality) => (
                <ItemCard
                  key={wm.id}
                  title={wm.name}
                  code={wm.code}
                  status={wm.status}
                  onEdit={() => handleOpenForm(wm)}
                  onToggleStatus={() => handleToggleStatus(wm.id, wm.status)}
                />
              ))}

            {activeTab === 'turnos' &&
              filterItems(shifts).map((sh: CompanyShift) => (
                <ItemCard
                  key={sh.id}
                  title={sh.name}
                  code={sh.code}
                  subtitle={sh.startTime && sh.endTime ? `Horario: ${sh.startTime} - ${sh.endTime}` : undefined}
                  status={sh.status}
                  onEdit={() => handleOpenForm(sh)}
                  onToggleStatus={() => handleToggleStatus(sh.id, sh.status)}
                />
              ))}

            {activeTab === 'centros' &&
              filterItems(costCenters).map((cc: CompanyCostCenter) => (
                <ItemCard
                  key={cc.id}
                  title={cc.name}
                  code={cc.code}
                  status={cc.status}
                  onEdit={() => handleOpenForm(cc)}
                  onToggleStatus={() => handleToggleStatus(cc.id, cc.status)}
                />
              ))}

            {activeTab === 'campos' &&
              filterItems(
                customFields.map(cf => ({ ...cf, name: cf.label, code: cf.fieldKey }))
              ).map((cf: any) => (
                <ItemCard
                  key={cf.id}
                  title={cf.label}
                  code={cf.fieldKey}
                  subtitle={`Cat: ${cf.category} | Tipo: ${cf.dataType}${cf.required ? ' | Obligatorio' : ''}`}
                  status={cf.status}
                  onEdit={() => handleOpenForm(cf)}
                  onToggleStatus={() => handleToggleStatus(cf.id, cf.status)}
                />
              ))}

            {activeTab === 'periodos' &&
              filterItems(surveyPeriods).map((per: SurveyPeriod) => (
                <ItemCard
                  key={per.id}
                  title={per.name}
                  code={`[${per.status}]`}
                  subtitle={`Rango: ${per.startDate} al ${per.endDate}`}
                  status={per.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                  onEdit={() => handleOpenForm(per)}
                  onToggleStatus={() => {}}
                />
              ))}
          </div>
        </div>
      )}

      {/* TAB 9: AUDITORÍA LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-600" />
            <span>Trazabilidad de Cambios (Audit Trail) - {activeCompanyId}</span>
          </h3>

          {auditLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              No hay registros de auditoría almacenados para esta empresa.
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900">{log.action}</span>
                      <span className="px-2 py-0.2 bg-indigo-100 text-indigo-800 rounded font-mono text-[10px] font-bold">
                        {log.entity} #{log.entityId}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Modificado por: <strong className="text-slate-700">{log.userId}</strong>
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleString('es-CO')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <NewCompanyWizardModal
        isOpen={showWizardModal}
        onClose={() => setShowWizardModal(false)}
        onCompanyCreated={(newId) => {
          setCompanies(companyAdminService.getCompanies());
          handleSelectCompany(newId);
          reloadData();
          setToastMessage({ type: 'success', text: 'Nueva empresa activada correctamente desde el Asistente.' });
        }}
      />
    </div>
  );
}

// Subcomponent for item cards
function ItemCard({
  title,
  code,
  subtitle,
  status,
  onEdit,
  onToggleStatus
}: {
  key?: React.Key;
  title: string;
  code?: string;
  subtitle?: string;
  status: string;
  onEdit: () => void;
  onToggleStatus: () => void;
}) {
  const isActive = status === 'ACTIVE';

  return (
    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-all">
      <div className="flex items-center gap-3 truncate">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        <div className="truncate">
          <div className="flex items-center gap-2 truncate">
            <span className="text-xs font-extrabold text-slate-900 truncate">{title}</span>
            {code && (
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 font-bold">
                {code}
              </span>
            )}
          </div>
          {subtitle && <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleStatus}
          className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all ${
            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
          }`}
          title="Inactivar / Activar (Eliminación Lógica)"
        >
          {isActive ? 'ACTIVO' : 'INACTIVO'}
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
          title="Editar"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
