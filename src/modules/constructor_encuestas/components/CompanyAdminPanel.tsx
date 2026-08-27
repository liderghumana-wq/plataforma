import React, { useState } from 'react';
import { 
  Building2, Layers, FileText, FileSpreadsheet, ShieldAlert, History, 
  Plus, Check, X, Edit3, Trash2, Shield, Eye, Lock, ArrowRight, RefreshCw, 
  Sliders, CheckCircle2, AlertCircle, MapPin, Briefcase, UserCheck, Clock,
  Tag, ChevronRight, Sparkles, Database
} from 'lucide-react';
import { 
  MultiCompanyService, Company, CompanyOrganizationalStructure, 
  SurveyTemplate, SurveyTemplateQuestion, AuditLog, UserRole, Sede, Area, Proyecto, Cargo 
} from '../multiCompanyService';

interface CompanyAdminPanelProps {
  currentCompanyId?: string;
  onCompanyChange?: (companyId: string) => void;
}

export const CompanyAdminPanel: React.FC<CompanyAdminPanelProps> = ({
  currentCompanyId = 'empresa-a',
  onCompanyChange
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(currentCompanyId);
  const [activeTab, setActiveTab] = useState<'companies' | 'structure' | 'surveys' | 'excel' | 'rbac' | 'audit'>('companies');

  // Company State
  const companies = MultiCompanyService.getAllCompanies();
  const currentCompany = MultiCompanyService.getCompanyById(selectedCompanyId) || companies[0];

  // Company Form Modal State
  const [showCompanyModal, setShowCompanyModal] = useState<boolean>(false);
  const [companyForm, setCompanyForm] = useState<Partial<Company>>({
    id: '',
    name: '',
    identificationNumber: '',
    primaryColor: '#0284c7',
    secondaryColor: '#0f172a',
    status: 'ACTIVE'
  });

  // Structure Catalogs State
  const structure = MultiCompanyService.getCompanyStructure(selectedCompanyId);
  const [catalogSubTab, setCatalogSubTab] = useState<'sedes' | 'areas' | 'proyectos' | 'cargos' | 'contratos' | 'modalidades' | 'turnos'>('sedes');
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCode, setNewItemCode] = useState<string>('');
  const [selectedSedeForProj, setSelectedSedeForProj] = useState<string>('');
  const [selectedAreaForProj, setSelectedAreaForProj] = useState<string>('');

  // Survey Templates & Versioning State
  const surveyTemplates = MultiCompanyService.getSurveyTemplates(selectedCompanyId);
  const activeTemplate = MultiCompanyService.getActiveSurveyTemplate(selectedCompanyId);

  // Excel Mapping Simulator State
  const [excelHeadersInput, setExcelHeadersInput] = useState<string>(
    'cedula, primer_nombre, primer_apellido, sede_trabajo, departamento, contrato, columna_no_reconocida'
  );
  const [excelPreviewResult, setExcelPreviewResult] = useState<any | null>(null);

  // RBAC Simulator State
  const [activeRole, setActiveRole] = useState<UserRole>('COMPANY_ADMIN');
  const userProfile = MultiCompanyService.getUserProfile('US-TEST', selectedCompanyId, activeRole);

  // Audit Logs State
  const auditLogs = MultiCompanyService.getAuditLogs(selectedCompanyId);

  // Handlers
  const handleSelectCompany = (comp: Company) => {
    setSelectedCompanyId(comp.id);
    if (onCompanyChange) onCompanyChange(comp.id);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.name || !companyForm.identificationNumber) return;

    const id = companyForm.id || `emp-${Date.now()}`;
    const newComp: Company = {
      id,
      name: companyForm.name,
      identificationNumber: companyForm.identificationNumber,
      primaryColor: companyForm.primaryColor || '#0284c7',
      secondaryColor: companyForm.secondaryColor || '#0f172a',
      status: companyForm.status || 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    MultiCompanyService.saveCompany(newComp);
    setShowCompanyModal(false);
    setSelectedCompanyId(id);
  };

  const handleAddCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    if (catalogSubTab === 'sedes') {
      MultiCompanyService.addCatalogItem(selectedCompanyId, 'sedes', {
        name: newItemName,
        code: newItemCode || `SED-${Date.now().toString().slice(-4)}`,
        status: 'ACTIVE',
        order: structure.sedes.length + 1
      });
    } else if (catalogSubTab === 'areas') {
      MultiCompanyService.addCatalogItem(selectedCompanyId, 'areas', {
        name: newItemName,
        code: newItemCode || `AREA-${Date.now().toString().slice(-4)}`,
        status: 'ACTIVE',
        order: structure.areas.length + 1
      });
    } else if (catalogSubTab === 'proyectos') {
      MultiCompanyService.addCatalogItem<any>(selectedCompanyId, 'proyectos', {
        name: newItemName,
        code: newItemCode || `PRJ-${Date.now().toString().slice(-4)}`,
        cliente: 'Cliente BPO',
        sedeId: selectedSedeForProj || structure.sedes[0]?.id || 'S-DEF',
        areaId: selectedAreaForProj || structure.areas[0]?.id || 'A-DEF',
        status: 'ACTIVE',
        order: structure.proyectos.length + 1
      });
    } else if (catalogSubTab === 'cargos') {
      MultiCompanyService.addCatalogItem<any>(selectedCompanyId, 'cargos', {
        name: newItemName,
        code: newItemCode || `CRG-${Date.now().toString().slice(-4)}`,
        areaId: selectedAreaForProj || structure.areas[0]?.id || 'A-DEF',
        status: 'ACTIVE',
        order: structure.cargos.length + 1
      });
    } else if (catalogSubTab === 'contratos') {
      MultiCompanyService.addCatalogItem(selectedCompanyId, 'tiposContrato', {
        name: newItemName,
        code: newItemCode || `TC-${Date.now().toString().slice(-4)}`,
        status: 'ACTIVE',
        order: structure.tiposContrato.length + 1
      });
    } else if (catalogSubTab === 'modalidades') {
      MultiCompanyService.addCatalogItem(selectedCompanyId, 'modalidadesTrabajo', {
        name: newItemName,
        code: newItemCode || `MOD-${Date.now().toString().slice(-4)}`,
        status: 'ACTIVE',
        order: structure.modalidadesTrabajo.length + 1
      });
    } else if (catalogSubTab === 'turnos') {
      MultiCompanyService.addCatalogItem(selectedCompanyId, 'turnosTrabajo', {
        name: newItemName,
        code: newItemCode || `TRN-${Date.now().toString().slice(-4)}`,
        status: 'ACTIVE',
        order: structure.turnosTrabajo.length + 1
      });
    }

    setNewItemName('');
    setNewItemCode('');
  };

  const handlePublishNewSurveyVersion = () => {
    if (!activeTemplate) return;
    const currentQuestions = activeTemplate.questions;
    MultiCompanyService.createNewSurveyTemplateVersion(selectedCompanyId, activeTemplate.id, currentQuestions);
  };

  const handleTestExcelPreview = () => {
    const headers = excelHeadersInput.split(',').map(s => s.trim()).filter(Boolean);
    const sampleRows = [
      { cedula: '1098765432', primer_nombre: 'Laura', primer_apellido: 'Martínez' }
    ];
    const preview = MultiCompanyService.previewExcelImport(selectedCompanyId, headers, sampleRows);
    setExcelPreviewResult(preview);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-6 shadow-2xl">
      {/* HEADER & COMPANY SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold rounded-full uppercase tracking-wider">
              PARAMETRIZACIÓN MULTIEMPRESA & ARQUITECTURA TENANT
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Empresas Activas: {companies.length}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mt-1 flex items-center gap-2">
            <span>Administración de Empresas y Catálogos Organizacionales</span>
          </h2>
          <p className="text-xs text-slate-400">
            Aislamiento multiempresa absoluto. Configura sedes, áreas, proyectos, cargos, contratos, encuestas y reglas RBAC sin modificar código fuente.
          </p>
        </div>

        {/* ACTIVE COMPANY SWITCHER */}
        <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
            <Building2 className="w-4 h-4 text-sky-400" />
            <select
              value={selectedCompanyId}
              onChange={e => setSelectedCompanyId(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} ({c.identificationNumber})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setCompanyForm({ id: '', name: '', identificationNumber: '', primaryColor: '#0284c7', secondaryColor: '#0f172a', status: 'ACTIVE' });
              setShowCompanyModal(true);
            }}
            className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Empresa</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'companies'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>1. Datos de Empresa & Marca</span>
        </button>

        <button
          onClick={() => setActiveTab('structure')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'structure'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2. Estructura Organizacional (Catálogos)</span>
        </button>

        <button
          onClick={() => setActiveTab('surveys')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'surveys'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>3. Cuestionarios & Versiones</span>
        </button>

        <button
          onClick={() => setActiveTab('excel')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'excel'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>4. Mapeo & Previa Excel</span>
        </button>

        <button
          onClick={() => setActiveTab('rbac')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rbac'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>5. Roles & Privacidad RBAC</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>6. Auditoría ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: EMPRESAS & MARCA */}
      {activeTab === 'companies' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CURRENT COMPANY CARD */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-sky-400" />
                  <span>Perfil de la Empresa Seleccionada</span>
                </h3>
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-full uppercase">
                  {currentCompany?.status}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-mono">Nombre o Razón Social</span>
                  <p className="text-white font-bold text-sm">{currentCompany?.name}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">ID de Empresa</span>
                    <p className="text-sky-300 font-mono font-bold">{currentCompany?.id}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">NIT / Identificación</span>
                    <p className="text-slate-200 font-mono font-bold">{currentCompany?.identificationNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Color Primario</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: currentCompany?.primaryColor }} />
                      <span className="font-mono text-slate-300">{currentCompany?.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-mono">Color Secundario</span>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: currentCompany?.secondaryColor }} />
                      <span className="font-mono text-slate-300">{currentCompany?.secondaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* LIST OF ALL REGISTERED COMPANIES */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3">
                Listado de Empresas Registradas en la Plataforma
              </h3>
              <div className="space-y-2">
                {companies.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCompany(c)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      c.id === selectedCompanyId
                        ? 'bg-sky-500/10 border-sky-500/50 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{c.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">NIT: {c.identificationNumber} | ID: {c.id}</p>
                    </div>
                    {c.id === selectedCompanyId && (
                      <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 text-[10px] font-bold rounded-md">
                        Seleccionada
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ESTRUCTURA ORGANIZACIONAL (CATÁLOGOS) */}
      {activeTab === 'structure' && (
        <div className="space-y-6">
          {/* CATALOG SUB-TABS */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
            <button
              onClick={() => setCatalogSubTab('sedes')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                catalogSubTab === 'sedes' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Sedes ({structure.sedes.length})
            </button>
            <button
              onClick={() => setCatalogSubTab('areas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                catalogSubTab === 'areas' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Áreas ({structure.areas.length})
            </button>
            <button
              onClick={() => setCatalogSubTab('proyectos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                catalogSubTab === 'proyectos' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Proyectos BPO ({structure.proyectos.length})
            </button>
            <button
              onClick={() => setCatalogSubTab('cargos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                catalogSubTab === 'cargos' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Cargos ({structure.cargos.length})
            </button>
            <button
              onClick={() => setCatalogSubTab('contratos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                catalogSubTab === 'contratos' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Tipos de Contrato ({structure.tiposContrato.length})
            </button>
            <button
              onClick={() => setCatalogSubTab('modalidades')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                catalogSubTab === 'modalidades' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Modalidades Trabajo ({structure.modalidadesTrabajo.length})
            </button>
            <button
              onClick={() => setCatalogSubTab('turnos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                catalogSubTab === 'turnos' ? 'bg-sky-600 text-white' : 'bg-slate-950 text-slate-400 border border-slate-800'
              }`}
            >
              Turnos ({structure.turnosTrabajo.length})
            </button>
          </div>

          {/* ADD NEW ITEM FORM */}
          <form onSubmit={handleAddCatalogItem} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Nombre del Elemento ({catalogSubTab})
              </label>
              <input
                type="text"
                placeholder={`Ej. ${catalogSubTab === 'sedes' ? 'Sede Norte' : catalogSubTab === 'areas' ? 'Finanzas' : 'Nuevo Item'}`}
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Código Único
              </label>
              <input
                type="text"
                placeholder="Ej. COD-01"
                value={newItemCode}
                onChange={e => setNewItemCode(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar a Catálogo</span>
              </button>
            </div>
          </form>

          {/* CATALOG DISPLAY TABLE */}
          <div className="bg-slate-950/40 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">ID / Código</th>
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Relaciones / Atributos</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(structure[catalogSubTab === 'sedes' ? 'sedes' : catalogSubTab === 'areas' ? 'areas' : catalogSubTab === 'proyectos' ? 'proyectos' : catalogSubTab === 'cargos' ? 'cargos' : catalogSubTab === 'contratos' ? 'tiposContrato' : catalogSubTab === 'modalidades' ? 'modalidadesTrabajo' : 'turnosTrabajo'] as any[]).map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-mono text-sky-400 font-bold">
                      {item.code || item.id}
                    </td>
                    <td className="p-3 font-bold text-white">
                      {item.name}
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {item.cliente && <span>Cliente: {item.cliente} | </span>}
                      {item.sedeId && <span>Sede: {item.sedeId} | </span>}
                      {item.areaId && <span>Área: {item.areaId}</span>}
                      {!item.cliente && !item.sedeId && !item.areaId && <span className="text-slate-600">—</span>}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        type="button"
                        onClick={() => MultiCompanyService.updateCatalogItemStatus(
                          selectedCompanyId, 
                          catalogSubTab === 'sedes' ? 'sedes' : catalogSubTab === 'areas' ? 'areas' : catalogSubTab === 'proyectos' ? 'proyectos' : catalogSubTab === 'cargos' ? 'cargos' : catalogSubTab === 'contratos' ? 'tiposContrato' : catalogSubTab === 'modalidades' ? 'modalidadesTrabajo' : 'turnosTrabajo', 
                          item.id, 
                          item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
                        )}
                        className="text-[11px] font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
                      >
                        {item.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CUESTIONARIOS & VERSIONADO */}
      {activeTab === 'surveys' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold rounded-md">
                  Encuesta Activa v{activeTemplate?.version || 1}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {activeTemplate?.questions.length || 0} Preguntas Parametrizadas
                </span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">{activeTemplate?.name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Cualquier cambio guardado generará inmutablemente la versión v{(activeTemplate?.version || 1) + 1} para preservar la integridad histórica de encuestas ya diligenciadas.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePublishNewSurveyVersion}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Publicar Nueva Versión (v{(activeTemplate?.version || 1) + 1})</span>
            </button>
          </div>

          {/* QUESTIONS LIST IN TEMPLATE */}
          <div className="bg-slate-950/40 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">Orden</th>
                  <th className="p-3">Variable (fieldKey)</th>
                  <th className="p-3">Configuraciones de Captura</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {activeTemplate?.questions.map(q => (
                  <tr key={q.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-400">#{q.order}</td>
                    <td className="p-3 font-mono font-bold text-sky-300">{q.questionId}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {q.required && <span className="px-1.5 py-0.5 bg-sky-500/20 text-sky-300 text-[9px] font-bold rounded">Obligatoria</span>}
                        {q.critical && <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[9px] font-bold rounded">Crítica</span>}
                        {q.sensitive && <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 text-[9px] font-bold rounded">Sensible (Salud)</span>}
                        {q.allowPreferNotToAnswer && <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] rounded">Permite "Prefiero no responder"</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded">
                        {q.enabled ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: MAPEO & PREVIA EXCEL */}
      {activeTab === 'excel' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
              <span>Simulador de Mapeo Inteligente y Vista Previa de Excel</span>
            </h3>

            <div>
              <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                Cabeceras Simuladas de Excel (Separadas por comas)
              </label>
              <textarea
                rows={2}
                value={excelHeadersInput}
                onChange={e => setExcelHeadersInput(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="button"
              onClick={handleTestExcelPreview}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ejecutar Mapeo Inteligente & Validar</span>
            </button>
          </div>

          {/* EXCEL PREVIEW RESULTS */}
          {excelPreviewResult && (
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Columnas Detectadas</span>
                  <p className="text-base font-bold text-white">{excelPreviewResult.totalColumnsDetected}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Reconocidas (🟢)</span>
                  <p className="text-base font-bold text-emerald-400">{excelPreviewResult.recognizedColumnsCount}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">No Reconocidas (🟠)</span>
                  <p className="text-base font-bold text-amber-400">{excelPreviewResult.unrecognizedColumnsCount}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Variables Críticas Faltantes</span>
                  <p className="text-base font-bold text-rose-400">{excelPreviewResult.missingCriticalFields.length}</p>
                </div>
              </div>

              {excelPreviewResult.missingCriticalFields.length > 0 && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>
                    <strong>Advertencia:</strong> Faltan variables críticas ({excelPreviewResult.missingCriticalFields.join(', ')}). No se colocarán valores inventados como "Término Indefinido".
                  </span>
                </div>
              )}

              {/* COLUMN MAPPINGS LIST */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-300">Detalle de Coincidencias de Columnas:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {excelPreviewResult.columnMappings.map((m: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-white font-bold">{m.excelColumn}</span>
                        <p className="text-[10px] text-slate-400">
                          {m.systemFieldKey ? `→ Variable: ${m.systemFieldKey}` : '→ No identificada'}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'RECOGNIZED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {m.status === 'RECOGNIZED' ? '🟢 Reconocida' : '🟠 Revisar Mapeo'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ROLES & PRIVACIDAD RBAC */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-sky-400" />
              <span>Simulador de Matriz de Permisos RBAC & Privacidad de Datos Ocupacionales</span>
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              {(['SUPER_ADMIN', 'COMPANY_ADMIN', 'HR_ADMIN', 'SST_ADMIN', 'REPORT_VIEWER', 'SURVEY_MANAGER'] as UserRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    activeRole === role ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-white">Perfil de Permisos para <span className="text-sky-400 font-mono">{activeRole}</span>:</h4>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>• Ver Salud Individual: <strong className={userProfile.canViewIndividualHealthData ? 'text-emerald-400' : 'text-rose-400'}>{userProfile.canViewIndividualHealthData ? 'PERMITIDO' : 'DENEGADO (PROTEGIDO)'}</strong></div>
                <div>• Editar Estructura: <strong>{userProfile.canEditCompanyStructure ? 'SÍ' : 'NO'}</strong></div>
                <div>• Editar Cuestionarios: <strong>{userProfile.canEditSurveyTemplates ? 'SÍ' : 'NO'}</strong></div>
                <div>• Importar Excel: <strong>{userProfile.canImportExcel ? 'SÍ' : 'NO'}</strong></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AUDITORÍA */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-slate-950/40 rounded-2xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">ID / Fecha</th>
                  <th className="p-3">Usuario / Rol</th>
                  <th className="p-3">Acción / Entidad</th>
                  <th className="p-3">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3 font-mono text-[11px]">
                      <div className="text-sky-400 font-bold">{log.id}</div>
                      <div className="text-slate-500 text-[10px]">{new Date(log.timestamp).toLocaleString()}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-white">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.userId}</div>
                    </td>
                    <td className="p-3 font-mono">
                      <span className="px-1.5 py-0.5 bg-sky-500/20 text-sky-300 font-bold rounded text-[10px] mr-1">
                        {log.action}
                      </span>
                      <span className="text-slate-300 text-[10px]">{log.entity}</span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">
                      Entidad ID: <span className="font-mono text-white">{log.entityId}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT COMPANY */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Registrar Nueva Empresa (Multi-Tenant)</h3>
              <button
                type="button"
                onClick={() => setShowCompanyModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCompany} className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  Nombre o Razón Social
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Empresa C Operaciones S.A.S."
                  value={companyForm.name}
                  onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                  NIT / Identificación
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 901.555.777-2"
                  value={companyForm.identificationNumber}
                  onChange={e => setCompanyForm({ ...companyForm, identificationNumber: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                    Color Primario
                  </label>
                  <input
                    type="color"
                    value={companyForm.primaryColor}
                    onChange={e => setCompanyForm({ ...companyForm, primaryColor: e.target.value })}
                    className="w-full h-8 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-mono block mb-1">
                    Color Secundario
                  </label>
                  <input
                    type="color"
                    value={companyForm.secondaryColor}
                    onChange={e => setCompanyForm({ ...companyForm, secondaryColor: e.target.value })}
                    className="w-full h-8 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Guardar Empresa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
