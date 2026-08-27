import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Edit3,
  ShieldAlert,
  FileSpreadsheet,
  Link,
  Users,
  Check,
  Info,
  Clock,
  Layers,
  Sparkles,
  Search,
  Lock,
  Globe,
  Mail,
  Phone,
  FileText,
  Copy,
  Download,
  AlertCircle,
  Eye,
  CheckSquare,
  Building,
  SlidersHorizontal,
  Activity,
  HeartPulse
} from 'lucide-react';
import {
  WizardState,
  SurveyQuestionConfig,
  QuestionType,
  UserRole,
  CompanyStatus,
  ExcelImportPreview,
  ColumnMappingResult,
  CustomCatalogConfig
} from '../newCompanyWizard.types';
import { newCompanyWizardService, SYSTEM_QUALITY_STATUSES } from '../newCompanyWizard.service';
import { companyAdminService } from '../companyAdmin.service';
import { searchCIIU } from '../../empresa/utils/ciiuLibrary';

interface NewCompanyWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyCreated?: (companyId: string) => void;
  initialCompanyId?: string;
}

export const NewCompanyWizardModal: React.FC<NewCompanyWizardModalProps> = ({
  isOpen,
  onClose,
  onCompanyCreated,
  initialCompanyId
}) => {
  const [wizardState, setWizardState] = useState<WizardState>(() => {
    const draft = newCompanyWizardService.loadDraft(initialCompanyId);
    return draft || newCompanyWizardService.createInitialState(initialCompanyId);
  });

  const [activeOrgSubTab, setActiveOrgSubTab] = useState<
    'sedes' | 'areas' | 'proyectos' | 'cargos' | 'modalidades' | 'turnos' | 'contratos' | 'centros'
  >('sedes');

  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Auto-save on state change
  useEffect(() => {
    if (wizardState) {
      newCompanyWizardService.saveDraft(wizardState);
    }
  }, [wizardState]);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  if (!isOpen) return null;

  const currentStep = wizardState.step;

  const handleNextStep = () => {
    if (currentStep < 8) {
      setWizardState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setWizardState(prev => ({ ...prev, step: prev.step - 1 }));
    }
  };

  const stepsList = [
    { num: 1, name: 'Información' },
    { num: 2, name: 'Estructura' },
    { num: 3, name: 'Catálogos' },
    { num: 4, name: 'Encuesta' },
    { num: 5, name: 'Fuentes' },
    { num: 6, name: 'Usuarios' },
    { num: 7, name: 'Revisión' },
    { num: 8, name: 'Activación' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-3 md:p-6 overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/30 border border-indigo-400/30 rounded-xl">
              <Building2 className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Asistente de Configuración de Empresa</h2>
              <p className="text-xs text-indigo-200 flex items-center gap-2">
                <span>Configuración Guiada Progresiva sin código</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] text-emerald-300 font-mono">Borrador Autoguardado</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            title="Cerrar Asistente"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px]">
            {stepsList.map((st, idx) => {
              const isActive = st.num === currentStep;
              const isCompleted = st.num < currentStep;
              return (
                <div key={st.num} className="flex items-center flex-1">
                  <button
                    onClick={() => setWizardState(prev => ({ ...prev, step: st.num }))}
                    className={`flex items-center space-x-2 text-xs font-semibold px-2 py-1.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : isCompleted
                        ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? 'bg-white text-indigo-600'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3" /> : st.num}
                    </span>
                    <span className="whitespace-nowrap">{st.name}</span>
                  </button>
                  {idx < stepsList.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        st.num < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="px-6 pt-3">
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                toast.type === 'error'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : toast.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{toast.text}</span>
              </div>
              <button onClick={() => setToast(null)} className="hover:opacity-75">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Body: Render Current Step Component */}
        <div className="p-6 overflow-y-auto flex-1">
          {currentStep === 1 && (
            <Step1CompanyInfo
              state={wizardState}
              onChange={state => setWizardState(state)}
              showToast={showToast}
            />
          )}

          {currentStep === 2 && (
            <Step2OrgStructure
              state={wizardState}
              onChange={state => setWizardState(state)}
              activeSubTab={activeOrgSubTab}
              setActiveSubTab={setActiveOrgSubTab}
              showToast={showToast}
            />
          )}

          {currentStep === 3 && (
            <Step3Catalogs
              state={wizardState}
              onChange={state => setWizardState(state)}
              showToast={showToast}
            />
          )}

          {currentStep === 4 && (
            <Step4Survey
              state={wizardState}
              onChange={state => setWizardState(state)}
              showToast={showToast}
            />
          )}

          {currentStep === 5 && (
            <Step5DataSources
              state={wizardState}
              onChange={state => setWizardState(state)}
              showToast={showToast}
            />
          )}

          {currentStep === 6 && (
            <Step6Users
              state={wizardState}
              onChange={state => setWizardState(state)}
              showToast={showToast}
            />
          )}

          {currentStep === 7 && (
            <Step7Review
              state={wizardState}
              onChange={state => setWizardState(state)}
              onJumpToStep={stepNum => setWizardState(prev => ({ ...prev, step: stepNum }))}
              showToast={showToast}
            />
          )}

          {currentStep === 8 && (
            <Step8Activation
              state={wizardState}
              onCloseModal={onClose}
              onCompanyCreated={onCompanyCreated}
              showToast={showToast}
            />
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <div className="text-xs text-slate-500 font-medium">
            Paso {currentStep} de 8
          </div>

          {currentStep < 8 ? (
            <button
              onClick={handleNextStep}
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 flex items-center space-x-2 transition-all shadow-md"
            >
              <span>Siguiente</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              Listo para la activación final
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// STEP 1: INFORMACIÓN DE LA EMPRESA
// ==========================================
const Step1CompanyInfo: React.FC<{
  state: WizardState;
  onChange: (updated: WizardState) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}> = ({ state, onChange, showToast }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ciiuSearch, setCiiuSearch] = useState('');
  const [showCiiuModal, setShowCiiuModal] = useState(false);

  const handleInfoChange = (field: keyof WizardState['info'], value: any) => {
    onChange({
      ...state,
      info: {
        ...state.info,
        [field]: value
      }
    });
  };

  const handleLogoFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('error', 'El logo no debe superar los 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        handleInfoChange('logo', e.target.result as string);
        showToast('success', 'Logo cargado exitosamente.');
      }
    };
    reader.readAsDataURL(file);
  };

  const ciiuResults = searchCIIU(ciiuSearch);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <span>Paso 1: Información de la Empresa</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Ingrese los datos corporativos iniciales. El logo y estado se pueden actualizar en cualquier momento.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Nombre Comercial <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={state.info.nombreComercial}
            onChange={e => handleInfoChange('nombreComercial', e.target.value)}
            className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Ej. BPO Solutions SAS"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Razón Social <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={state.info.razonSocial}
            onChange={e => handleInfoChange('razonSocial', e.target.value)}
            className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Ej. BPO & Customer Services Colombia S.A.S."
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            NIT / Identificación Tributaria <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={state.info.nit}
            onChange={e => handleInfoChange('nit', e.target.value)}
            className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Ej. 900.123.456-7"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">
            Correo Administrativo de Contacto <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            value={state.info.correoAdmin}
            onChange={e => handleInfoChange('correoAdmin', e.target.value)}
            className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="ej. sst@empresa.com"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono Corporativo</label>
          <input
            type="text"
            value={state.info.telefono}
            onChange={e => handleInfoChange('telefono', e.target.value)}
            className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Ej. +57 601 555 1234"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Periodo Inicial de Operación</label>
          <input
            type="text"
            value={state.info.periodoInicial}
            onChange={e => handleInfoChange('periodoInicial', e.target.value)}
            className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="Ej. 2026-01"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Estado Inicial</label>
          <select
            value={state.info.estado}
            onChange={e => handleInfoChange('estado', e.target.value as CompanyStatus)}
            className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="DRAFT">DRAFT (Borrador - Inexistente para operativos)</option>
            <option value="CONFIGURING">CONFIGURING (En proceso de configuración)</option>
            <option value="ACTIVE">ACTIVE (Empresa Activa)</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 block mb-1">Código / Actividad CIIU</label>
          <div className="flex space-x-2">
            <input
              type="text"
              readOnly
              value={state.info.codigoCIIU ? `${state.info.codigoCIIU} - ${state.info.sectorEconomico}` : 'Seleccionar CIIU...'}
              className="w-full bg-slate-50 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 font-medium text-slate-800"
            />
            <button
              type="button"
              onClick={() => setShowCiiuModal(true)}
              className="px-3 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl hover:bg-slate-800 flex items-center space-x-1"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logo Upload Box */}
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <label className="text-xs font-bold text-slate-800 block mb-2">Logo Corporativo de la Empresa</label>
        <div className="flex items-center space-x-4">
          {state.info.logo ? (
            <div className="relative group">
              <img
                src={state.info.logo}
                alt="Logo preview"
                className="w-20 h-20 object-contain p-2 bg-white rounded-xl border border-slate-300 shadow-sm"
              />
              <button
                type="button"
                onClick={() => handleInfoChange('logo', '')}
                className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow-md hover:bg-rose-700"
                title="Quitar logo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-white text-slate-400">
              <Building className="w-8 h-8" />
            </div>
          )}

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && handleLogoFile(e.target.files[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Cargar Imagen de Logo</span>
            </button>
            <p className="text-[11px] text-slate-500 mt-1">
              Archivos permitidos: PNG, JPG, SVG (Máximo 2MB). No se asigna logo ficticio predeterminado.
            </p>
          </div>
        </div>
      </div>

      {/* CIIU Selector Modal */}
      {showCiiuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-5 shadow-xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="text-sm font-bold text-slate-900">Buscador de Actividades CIIU</h4>
              <button onClick={() => setShowCiiuModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              value={ciiuSearch}
              onChange={e => setCiiuSearch(e.target.value)}
              placeholder="Buscar por código o descripción (ej. 8220, Call Center)..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none"
            />
            <div className="max-h-60 overflow-y-auto space-y-2">
              {ciiuResults.slice(0, 10).map(item => (
                <div
                  key={item.codigo}
                  onClick={() => {
                    handleInfoChange('codigoCIIU', item.codigo);
                    handleInfoChange('sectorEconomico', item.actividad);
                    setShowCiiuModal(false);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 cursor-pointer transition-all text-xs"
                >
                  <span className="font-mono font-bold text-indigo-700 mr-2">[{item.codigo}]</span>
                  <span className="text-slate-800 font-medium">{item.actividad}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// STEP 2: ESTRUCTURA ORGANIZACIONAL (PROGRESIVA)
// ==========================================
const Step2OrgStructure: React.FC<{
  state: WizardState;
  onChange: (updated: WizardState) => void;
  activeSubTab: string;
  setActiveSubTab: (tab: any) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}> = ({ state, onChange, activeSubTab, setActiveSubTab, showToast }) => {
  const [showImportModal, setShowImportModal] = useState(false);
  const [excelText, setExcelText] = useState('');
  const [importPreview, setImportPreview] = useState<ExcelImportPreview | null>(null);

  const [newItemName, setNewItemName] = useState('');
  const [newItemCode, setNewItemCode] = useState('');

  const org = state.orgStructure;

  const handleToggleSkip = (field: 'skipSites' | 'skipProjects' | 'skipCostCenters') => {
    onChange({
      ...state,
      orgStructure: {
        ...org,
        [field]: !org[field]
      }
    });
    showToast('info', 'Configuración progresiva actualizada. No se crearán registros ficticios.');
  };

  const handleAddItem = (listKey: keyof typeof org) => {
    if (!newItemName.trim() || !newItemCode.trim()) {
      showToast('error', 'El nombre y código son obligatorios.');
      return;
    }
    const list = [...(org[listKey] as any[])];
    const exists = list.some(item => item.code?.toUpperCase() === newItemCode.trim().toUpperCase());
    if (exists) {
      showToast('error', `El código "${newItemCode}" ya existe en este catálogo.`);
      return;
    }

    const newItem = {
      id: `${String(listKey)}-${Date.now()}`,
      companyId: state.companyId,
      name: newItemName.trim(),
      code: newItemCode.trim().toUpperCase(),
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.push(newItem);
    onChange({
      ...state,
      orgStructure: {
        ...org,
        [listKey]: list
      }
    });

    setNewItemName('');
    setNewItemCode('');
    showToast('success', 'Registro agregado correctamente.');
  };

  const handleRemoveItem = (listKey: keyof typeof org, itemId: string) => {
    const list = (org[listKey] as any[]).filter(item => item.id !== itemId);
    onChange({
      ...state,
      orgStructure: {
        ...org,
        [listKey]: list
      }
    });
  };

  // Mass Import Parsing Simulation
  const handleParseImport = () => {
    // Parse simulated simple text / TSV rows
    const lines = excelText.split('\n').map(l => l.trim()).filter(Boolean);
    const mockSites: any[] = [];
    const mockAreas: any[] = [];
    const mockProjects: any[] = [];

    lines.forEach(line => {
      const parts = line.split(/[\t,|]/).map(p => p.trim());
      if (parts[0]?.toUpperCase() === 'SEDE') {
        mockSites.push({ code: parts[1], name: parts[2], city: parts[3], address: parts[4] });
      } else if (parts[0]?.toUpperCase() === 'AREA') {
        mockAreas.push({ code: parts[1], name: parts[2], siteCode: parts[3] });
      } else if (parts[0]?.toUpperCase() === 'PROYECTO') {
        mockProjects.push({ code: parts[1], name: parts[2], client: parts[3], siteCode: parts[4], areaCode: parts[5] });
      }
    });

    const preview = newCompanyWizardService.parseAndValidateOrgExcel(mockSites, mockAreas, mockProjects);
    setImportPreview(preview);
  };

  const handleApplyImport = () => {
    if (!importPreview || !importPreview.isValid) return;

    const newSites = importPreview.sites.map(s => ({
      id: `site-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      companyId: state.companyId,
      name: s.name!,
      code: s.code!,
      city: s.city || 'Bogotá D.C.',
      address: s.address || '',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const newAreas = importPreview.areas.map(a => ({
      id: `area-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      companyId: state.companyId,
      name: a.name!,
      code: a.code!,
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    const newProjects = importPreview.projects.map(p => ({
      id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      companyId: state.companyId,
      name: p.name!,
      code: p.code!,
      client: p.client || '',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    onChange({
      ...state,
      orgStructure: {
        ...org,
        sites: [...org.sites, ...newSites],
        areas: [...org.areas, ...newAreas],
        projects: [...org.projects, ...newProjects]
      }
    });

    setShowImportModal(false);
    showToast('success', `Se importaron ${newSites.length} Sedes, ${newAreas.length} Áreas y ${newProjects.length} Proyectos.`);
  };

  const currentListKey =
    activeSubTab === 'sedes' ? 'sites' :
    activeSubTab === 'areas' ? 'areas' :
    activeSubTab === 'proyectos' ? 'projects' :
    activeSubTab === 'cargos' ? 'positions' :
    activeSubTab === 'modalidades' ? 'workModalities' :
    activeSubTab === 'turnos' ? 'shifts' :
    activeSubTab === 'contratos' ? 'contractTypes' : 'costCenters';

  const currentList = (org[currentListKey] as any[]) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Paso 2: Estructura Organizacional</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure sedes, áreas, cargos, modalidades, turnos y proyectos. Omita los niveles que su empresa no requiera.
          </p>
        </div>

        <button
          onClick={() => setShowImportModal(true)}
          className="px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 flex items-center space-x-2"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Importar Excel Masivo</span>
        </button>
      </div>

      {/* Toggles de Configuración Progresiva */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
        <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Configuración Progresiva (No obligar elementos no utilizados)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
          <label className="flex items-center space-x-2 cursor-pointer bg-white p-2.5 rounded-xl border border-amber-200 font-medium text-amber-950">
            <input
              type="checkbox"
              checked={org.skipProjects}
              onChange={() => handleToggleSkip('skipProjects')}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>Esta empresa no utiliza Proyectos</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer bg-white p-2.5 rounded-xl border border-amber-200 font-medium text-amber-950">
            <input
              type="checkbox"
              checked={org.skipSites}
              onChange={() => handleToggleSkip('skipSites')}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>Esta empresa no utiliza Sedes (Sede única)</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer bg-white p-2.5 rounded-xl border border-amber-200 font-medium text-amber-950">
            <input
              type="checkbox"
              checked={org.skipCostCenters}
              onChange={() => handleToggleSkip('skipCostCenters')}
              className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
            />
            <span>Esta empresa no utiliza Centros de Costo</span>
          </label>
        </div>
      </div>

      {/* Sub-tabs Selector */}
      <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto pb-2">
        {[
          { id: 'sedes', label: `Sedes (${org.sites.length})`, skip: org.skipSites },
          { id: 'areas', label: `Áreas (${org.areas.length})` },
          { id: 'proyectos', label: `Proyectos (${org.projects.length})`, skip: org.skipProjects },
          { id: 'cargos', label: `Cargos (${org.positions.length})` },
          { id: 'modalidades', label: `Modalidades (${org.workModalities.length})` },
          { id: 'turnos', label: `Turnos (${org.shifts.length})` },
          { id: 'contratos', label: `Contratos (${org.contractTypes.length})` },
          { id: 'centros', label: `Centros Costo (${org.costCenters.length})`, skip: org.skipCostCenters }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1 ${
              activeSubTab === tab.id
                ? 'bg-slate-900 text-white shadow'
                : tab.skip
                ? 'bg-slate-100 text-slate-400 line-through'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.skip && <span className="text-[10px] no-underline font-normal text-rose-500 ml-1">(Omitido)</span>}
          </button>
        ))}
      </div>

      {/* Form add item */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col md:flex-row items-end gap-3">
        <div className="flex-1 w-full">
          <label className="text-xs font-bold text-slate-700 block mb-1">Nombre del Registro</label>
          <input
            type="text"
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            placeholder={`Ej. ${activeSubTab === 'sedes' ? 'Sede Principal Norte' : activeSubTab === 'areas' ? 'Gestión Humana' : 'Nombre'}`}
            className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-medium focus:outline-none"
          />
        </div>
        <div className="w-full md:w-48">
          <label className="text-xs font-bold text-slate-700 block mb-1">Código Interno</label>
          <input
            type="text"
            value={newItemCode}
            onChange={e => setNewItemCode(e.target.value)}
            placeholder="Ej. SED-001"
            className="w-full bg-white text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold focus:outline-none"
          />
        </div>
        <button
          onClick={() => handleAddItem(currentListKey)}
          className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar</span>
        </button>
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
        {currentList.map(item => (
          <div
            key={item.id}
            className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-all shadow-sm"
          >
            <div>
              <span className="font-bold text-xs text-slate-900 block">{item.name}</span>
              <span className="font-mono text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {item.code}
              </span>
            </div>
            <button
              onClick={() => handleRemoveItem(currentListKey, item.id)}
              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {currentList.length === 0 && (
          <div className="col-span-2 text-center py-6 text-xs text-slate-400 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No hay registros creados para este catálogo. Agregue uno arriba o importe desde Excel.
          </div>
        )}
      </div>

      {/* Mass Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <span>Importación Masiva de Estructura Organizacional</span>
              </h4>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Pegue las líneas con formato tabulado o delimitado por comas (|).
              Ejemplos:
              <br />
              <code className="text-[11px] font-mono text-indigo-700 bg-slate-100 p-1 rounded block mt-1">
                SEDE | SED-01 | Sede Norte | Bogotá | Calle 100
                <br />
                AREA | ARE-01 | Gestión Humana | SED-01
                <br />
                PROYECTO | PRJ-01 | Proyecto Bancario | Banco X | SED-01 | ARE-01
              </code>
            </p>

            <textarea
              rows={5}
              value={excelText}
              onChange={e => setExcelText(e.target.value)}
              placeholder="Pegue aquí el contenido delimitado..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs font-mono focus:outline-none"
            />

            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleParseImport}
                className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 rounded-xl hover:bg-indigo-100"
              >
                Validar y Generar Previsualización
              </button>
            </div>

            {/* Preview Results */}
            {importPreview && (
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Sedes a importar: {importPreview.sites.length}</span>
                  <span>Áreas a importar: {importPreview.areas.length}</span>
                  <span>Proyectos a importar: {importPreview.projects.length}</span>
                </div>

                {/* Errors display */}
                {importPreview.errors.length > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl max-h-36 overflow-y-auto space-y-1">
                    <span className="text-xs font-bold text-rose-800 block">Errores de Validación Detectados:</span>
                    {importPreview.errors.map((err, i) => (
                      <div key={i} className="text-[11px] text-rose-700">
                        [{err.sheet} - Línea {err.row}] {err.message}
                      </div>
                    ))}
                  </div>
                )}

                {importPreview.isValid && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
                    ✓ Todos los registros y relaciones son válidos. Puede importar con seguridad.
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={!importPreview.isValid}
                    onClick={handleApplyImport}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 disabled:opacity-40 shadow-sm"
                  >
                    Confirmar e Importar Estructura
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// STEP 3: CATÁLOGOS (SISTEMA VS PERSONALIZADOS)
// ==========================================
const Step3Catalogs: React.FC<{
  state: WizardState;
  onChange: (updated: WizardState) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}> = ({ state, onChange, showToast }) => {
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const [selectedCatId, setSelectedCatId] = useState<string>(state.customCatalogs[1]?.id || state.customCatalogs[0]?.id);
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemCode, setNewItemCode] = useState('');

  const handleCreateCustomCatalog = () => {
    if (!newCatName.trim() || !newCatCode.trim()) {
      showToast('error', 'El nombre y código del catálogo son obligatorios.');
      return;
    }
    const cleanCode = newCatCode.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '_');
    const newCat: CustomCatalogConfig = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      code: cleanCode,
      description: newCatDesc.trim(),
      status: 'ACTIVE',
      order: state.customCatalogs.length + 1,
      isSystemProtected: false,
      items: []
    };

    onChange({
      ...state,
      customCatalogs: [...state.customCatalogs, newCat]
    });

    setNewCatName('');
    setNewCatCode('');
    setNewCatDesc('');
    setSelectedCatId(newCat.id);
    showToast('success', `Catálogo personalizado "${newCat.name}" creado.`);
  };

  const selectedCatalog = state.customCatalogs.find(c => c.id === selectedCatId);

  const handleAddItemToCatalog = () => {
    if (!selectedCatalog) return;
    if (selectedCatalog.isSystemProtected) {
      showToast('error', 'Los catálogos nativos del sistema no pueden modificarse.');
      return;
    }
    if (!newItemLabel.trim() || !newItemCode.trim()) {
      showToast('error', 'La etiqueta y código del ítem son obligatorios.');
      return;
    }

    const cleanCode = newItemCode.trim().toUpperCase();
    const updatedCatalogs = state.customCatalogs.map(cat => {
      if (cat.id === selectedCatId) {
        return {
          ...cat,
          items: [
            ...cat.items,
            { id: `item-${Date.now()}`, code: cleanCode, label: newItemLabel.trim(), active: true }
          ]
        };
      }
      return cat;
    });

    onChange({
      ...state,
      customCatalogs: updatedCatalogs
    });

    setNewItemLabel('');
    setNewItemCode('');
    showToast('success', 'Opción agregada al catálogo.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Paso 3: Catálogos del Sistema y Personalizables</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Los catálogos del sistema garantizan la coherencia de calidad de datos. Puede crear catálogos propios como líneas de negocio u operaciones.
        </p>
      </div>

      {/* System Quality Statuses Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs font-bold text-slate-100">Catálogo de Estados de Calidad (Protegido por el Sistema)</h4>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-amber-300 bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30">
            Protegido
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          {SYSTEM_QUALITY_STATUSES.map(s => (
            <div key={s.code} className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="font-mono font-bold text-amber-300 block">{s.code}</span>
                <span className="text-[11px] text-slate-300">{s.label}</span>
              </div>
              <Check className="w-4 h-4 text-emerald-400" />
            </div>
          ))}
        </div>
      </div>

      {/* Create Custom Catalog Form */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-slate-800">Crear Nuevo Catálogo Personalizable</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={newCatName}
            onChange={e => setNewCatName(e.target.value)}
            placeholder="Nombre (ej. Tipo de Operación)"
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
          />
          <input
            type="text"
            value={newCatCode}
            onChange={e => setNewCatCode(e.target.value)}
            placeholder="Código Key (ej. TIPO_OPERACION)"
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none"
          />
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCatDesc}
              onChange={e => setNewCatDesc(e.target.value)}
              placeholder="Descripción opcional"
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none flex-1"
            />
            <button
              onClick={handleCreateCustomCatalog}
              className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 whitespace-nowrap"
            >
              Crear
            </button>
          </div>
        </div>
      </div>

      {/* Catalogs Item Editor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Catalog Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 block">Catálogos Existentes</label>
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {state.customCatalogs.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border ${
                  selectedCatId === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                    : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 font-medium'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{cat.name}</span>
                  {cat.isSystemProtected && (
                    <Lock className="w-3 h-3 text-amber-300" />
                  )}
                </div>
                <span className={`text-[10px] font-mono block mt-0.5 ${selectedCatId === cat.id ? 'text-indigo-200' : 'text-slate-500'}`}>
                  {cat.code} ({cat.items.length} ítems)
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Items detail */}
        <div className="md:col-span-2 p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
          {selectedCatalog ? (
            <>
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{selectedCatalog.name}</h4>
                  <span className="text-[10px] font-mono text-indigo-600">{selectedCatalog.code}</span>
                </div>
                {selectedCatalog.isSystemProtected && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    Sistema Protegido
                  </span>
                )}
              </div>

              {!selectedCatalog.isSystemProtected && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    value={newItemLabel}
                    onChange={e => setNewItemLabel(e.target.value)}
                    placeholder="Etiqueta (ej. Inbound)"
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none flex-1"
                  />
                  <input
                    type="text"
                    value={newItemCode}
                    onChange={e => setNewItemCode(e.target.value)}
                    placeholder="Código (INBOUND)"
                    className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold focus:outline-none w-32"
                  />
                  <button
                    onClick={handleAddItemToCatalog}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                  >
                    + Agregar
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 max-h-40 overflow-y-auto">
                {selectedCatalog.items.map(item => (
                  <div key={item.id} className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                    <span className="font-medium text-slate-800">{item.label}</span>
                    <span className="font-mono font-bold text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                      {item.code}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-xs text-slate-400 py-8 text-center">Seleccione un catálogo a la izquierda</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// STEP 4: ENCUESTA Y PROTECCIÓN DE VARIABLES
// ==========================================
const Step4Survey: React.FC<{
  state: WizardState;
  onChange: (updated: WizardState) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}> = ({ state, onChange, showToast }) => {
  const [criticalWarningModal, setCriticalWarningModal] = useState<{ open: boolean; questionKey: string } | null>(null);

  const [newQText, setNewQText] = useState('');
  const [newQType, setNewQType] = useState<QuestionType>('SHORT_TEXT');

  const questions = state.survey.questions;

  const handleToggleActive = (questionId: string, currentActive: boolean, fieldKey: string) => {
    // Si se intenta desactivar una variable crítica (peso o estatura), mostrar advertencia explícita
    if (currentActive && (fieldKey === 'peso' || fieldKey === 'estatura')) {
      setCriticalWarningModal({ open: true, questionKey: fieldKey });
      return;
    }

    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        return { ...q, active: !q.active };
      }
      return q;
    });

    onChange({
      ...state,
      survey: {
        ...state.survey,
        questions: updatedQuestions
      }
    });
  };

  const handleConfirmDeactivateCritical = () => {
    if (!criticalWarningModal) return;

    const updatedQuestions = questions.map(q => {
      if (q.fieldKey === criticalWarningModal.questionKey) {
        return { ...q, active: false };
      }
      return q;
    });

    onChange({
      ...state,
      survey: {
        ...state.survey,
        questions: updatedQuestions
      }
    });

    setCriticalWarningModal(null);
    showToast('info', 'Variable desactivada. Recuerde que afectará los indicadores de IMC.');
  };

  const handleToggleQuestionProp = (questionId: string, prop: 'required' | 'allowOther' | 'allowPreferNotToAnswer') => {
    const updatedQuestions = questions.map(q => {
      if (q.id === questionId) {
        return { ...q, [prop]: !q[prop] };
      }
      return q;
    });

    onChange({
      ...state,
      survey: {
        ...state.survey,
        questions: updatedQuestions
      }
    });
  };

  const handleAddCustomQuestion = () => {
    if (!newQText.trim()) {
      showToast('error', 'El enunciado de la pregunta es obligatorio.');
      return;
    }

    const cleanKey = `custom_${Date.now()}_${newQText.slice(0, 10).replace(/[^a-zA-Z0-9]/g, '_')}`;
    const newQuestion: SurveyQuestionConfig = {
      id: `q-cust-${Date.now()}`,
      fieldKey: cleanKey,
      text: newQText.trim(),
      category: 'PERSONALIZADO',
      type: newQType,
      required: false,
      active: true,
      allowOther: true,
      allowPreferNotToAnswer: true,
      isCustom: true
    };

    onChange({
      ...state,
      survey: {
        ...state.survey,
        questions: [...questions, newQuestion]
      }
    });

    setNewQText('');
    showToast('success', 'Pregunta personalizada agregada.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Paso 4: Configuración de Encuesta y Variables</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Active o desactive preguntas de la encuesta estándar, configure "Otro" y "Prefiero no responder", o agregue preguntas personalizadas.
        </p>
      </div>

      {/* Sensitive Health Notice Banner */}
      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-xs text-rose-900">
        <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Advertencia Administrativa de Privacidad de Salud:</span>
          Las variables de salud contienen información altamente sensible. Deben gestionarse conforme a los permisos y controles de privacidad definidos para la plataforma.
        </div>
      </div>

      {/* Variable Dependency Map Diagram */}
      <div className="p-4 bg-indigo-950 text-white rounded-2xl border border-indigo-900/60 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-300">
          <Activity className="w-4 h-4 text-indigo-400" />
          <span>Diagrama de Dependencia para Indicadores Críticos</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium pt-1">
          <span className="px-3 py-1 bg-indigo-900/80 rounded-lg border border-indigo-700 text-indigo-200 font-bold">
            Peso corporal
          </span>
          <span className="text-indigo-400 font-extrabold">+</span>
          <span className="px-3 py-1 bg-indigo-900/80 rounded-lg border border-indigo-700 text-indigo-200 font-bold">
            Estatura
          </span>
          <span className="text-indigo-400 font-extrabold">➔</span>
          <span className="px-3 py-1 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded-lg font-bold">
            Índice de Masa Corporal (IMC)
          </span>
          <span className="text-indigo-400 font-extrabold">➔</span>
          <span className="px-3 py-1 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded-lg font-bold">
            Clasificación Nutricional
          </span>
        </div>
      </div>

      {/* Add Custom Question Form */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-slate-800">Agregar Pregunta Personalizada</h4>
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <input
            type="text"
            value={newQText}
            onChange={e => setNewQText(e.target.value)}
            placeholder="Escriba el enunciado de la pregunta..."
            className="bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none flex-1 w-full"
          />
          <select
            value={newQType}
            onChange={e => setNewQType(e.target.value as QuestionType)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none w-full sm:w-48"
          >
            <option value="SHORT_TEXT">Texto corto</option>
            <option value="LONG_TEXT">Texto largo</option>
            <option value="NUMBER">Número</option>
            <option value="DATE">Fecha</option>
            <option value="YES_NO">Sí / No</option>
            <option value="SINGLE_SELECT">Selección Única</option>
            <option value="MULTI_SELECT">Selección Múltiple</option>
            <option value="SCALE">Escala</option>
            <option value="PERCENTAGE">Porcentaje</option>
          </select>
          <button
            onClick={handleAddCustomQuestion}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 whitespace-nowrap shadow-sm"
          >
            + Agregar Pregunta
          </button>
        </div>
      </div>

      {/* Question List with Controls */}
      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {questions.map(q => (
          <div
            key={q.id}
            className={`p-3.5 rounded-2xl border transition-all ${
              q.active
                ? 'bg-white border-slate-200 shadow-sm'
                : 'bg-slate-50 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={q.active}
                  onChange={() => handleToggleActive(q.id, q.active, q.fieldKey)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">{q.text}</span>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-medium mt-0.5">
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {q.fieldKey}
                    </span>
                    <span>Categoría: {q.category}</span>
                    <span>Tipo: {q.type}</span>
                    {q.sensitive && (
                      <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                        Sensible
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Toggles for options */}
              <div className="flex items-center space-x-3 text-xs pl-7 sm:pl-0">
                <label className="flex items-center space-x-1 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={q.required}
                    onChange={() => handleToggleQuestionProp(q.id, 'required')}
                    className="rounded text-indigo-600 w-3.5 h-3.5"
                  />
                  <span className="text-[11px]">Obligatoria</span>
                </label>

                <label className="flex items-center space-x-1 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={q.allowOther}
                    onChange={() => handleToggleQuestionProp(q.id, 'allowOther')}
                    className="rounded text-indigo-600 w-3.5 h-3.5"
                  />
                  <span className="text-[11px]">Permitir "Otro"</span>
                </label>

                <label className="flex items-center space-x-1 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={q.allowPreferNotToAnswer}
                    onChange={() => handleToggleQuestionProp(q.id, 'allowPreferNotToAnswer')}
                    className="rounded text-indigo-600 w-3.5 h-3.5"
                  />
                  <span className="text-[11px]">Prefiero no responder</span>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Critical Variable Warning Modal */}
      {criticalWarningModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-rose-200">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertTriangle className="w-8 h-8" />
              <h4 className="text-sm font-bold">Desactivación de Variable Crítica</h4>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Esta variable (<strong className="text-slate-900 font-mono">{criticalWarningModal.questionKey}</strong>) alimenta
              directamente los indicadores de <strong className="text-indigo-700">Índice de Masa Corporal (IMC) y Clasificación Nutricional</strong>.
              <br /><br />
              Si la desactiva, estos indicadores dejarán de calcularse para esta empresa. ¿Desea continuar?
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setCriticalWarningModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Cancelar (Mantener activa)
              </button>
              <button
                onClick={handleConfirmDeactivateCritical}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 shadow-sm"
              >
                Sí, Desactivar Variable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// STEP 5: FUENTES DE DATOS Y EXCEL DINÁMICO
// ==========================================
const Step5DataSources: React.FC<{
  state: WizardState;
  onChange: (updated: WizardState) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}> = ({ state, onChange, showToast }) => {
  const [testHeadersText, setTestHeadersText] = useState('Documento, Nombre, FechaNacimiento, Peso, Estatura, Cargo, InexistenteCol');
  const [mappingPreview, setMappingPreview] = useState<ColumnMappingResult[]>([]);

  const handleModeChange = (mode: WizardState['dataSource']['mode']) => {
    onChange({
      ...state,
      dataSource: {
        ...state.dataSource,
        mode
      }
    });
  };

  const handleTestAutoMap = () => {
    const headers = testHeadersText.split(/[,|\t\n]/).map(h => h.trim()).filter(Boolean);
    const results = newCompanyWizardService.autoMapExcelColumns(headers, state.survey.questions);
    setMappingPreview(results);
    showToast('info', 'Simulación de mapeo completada.');
  };

  const handleDownloadTemplatePreview = () => {
    const cols = newCompanyWizardService.generateDynamicExcelTemplateColumns(state);
    const csvContent = cols.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Plantilla_Empresa_${state.info.nombreComercial || 'Nueva'}_v1.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Plantilla descargada con columnas de variables activas.');
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Paso 5: Fuentes de Datos y Plantilla Dinámica</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Seleccione las vías de recolección de datos y descargue la plantilla Excel configurada dinámicamente según variables activas.
        </p>
      </div>

      {/* Data Source Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            id: 'DIGITAL_SURVEY',
            title: 'Encuesta Digital',
            desc: 'Portal web autogestionado con enlace seguro aislado por companyId',
            icon: Globe
          },
          {
            id: 'EXCEL_UPLOAD',
            title: 'Carga Excel Masiva',
            desc: 'Carga mediante archivo de plantilla estandarizado',
            icon: FileSpreadsheet
          },
          {
            id: 'BOTH',
            title: 'Ambas Fuentes (Híbrido)',
            desc: 'Permite captura directa por enlace y consolidación en Excel',
            icon: Layers
          }
        ].map(item => {
          const Icon = item.icon;
          const isSelected = state.dataSource.mode === item.id;
          return (
            <div
              key={item.id}
              onClick={() => handleModeChange(item.id as any)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-slate-900">{item.title}</h4>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Digital Survey Link Section */}
      {(state.dataSource.mode === 'DIGITAL_SURVEY' || state.dataSource.mode === 'BOTH') && (
        <div className="p-4 bg-indigo-900 text-white rounded-2xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-200 flex items-center space-x-2">
              <Link className="w-4 h-4 text-indigo-400" />
              <span>Enlace Aislado de Encuesta Digital</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
              companyId={state.companyId}
            </span>
          </div>
          <div className="flex items-center space-x-2 pt-1">
            <input
              type="text"
              readOnly
              value={state.dataSource.digitalSurveyUrl}
              className="bg-indigo-950 border border-indigo-700/80 rounded-xl px-3 py-2 text-xs font-mono text-indigo-200 w-full"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(state.dataSource.digitalSurveyUrl);
                showToast('success', 'Enlace copiado al portapapeles.');
              }}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
              title="Copiar enlace"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Dynamic Excel Download */}
      {(state.dataSource.mode === 'EXCEL_UPLOAD' || state.dataSource.mode === 'BOTH') && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-emerald-950">Plantilla Excel Oficial de esta Empresa</h4>
              <p className="text-[11px] text-emerald-800">
                Generada dinámicamente con las columnas de las preguntas activas. No incluye columnas desactivadas.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplatePreview}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center space-x-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Plantilla CSV</span>
            </button>
          </div>
        </div>
      )}

      {/* Auto-Mapping Column Simulator */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-slate-800">Simulador de Mapeo Automático de Columnas Excel</h4>
        <div className="flex space-x-2">
          <input
            type="text"
            value={testHeadersText}
            onChange={e => setTestHeadersText(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none flex-1"
            placeholder="Pegue encabezados de Excel separados por coma..."
          />
          <button
            onClick={handleTestAutoMap}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
          >
            Probar Mapeo
          </button>
        </div>

        {mappingPreview.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
            {mappingPreview.map((m, i) => (
              <div key={i} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">{m.excelHeader}</span>
                  {m.mappedFieldKey ? (
                    <span className="text-[10px] text-indigo-600 font-mono">➔ {m.mappedFieldKey} ({m.mappedFieldLabel})</span>
                  ) : (
                    <span className="text-[10px] text-rose-500 font-bold">➔ Variable no disponible</span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    m.confidence === 'HIGH'
                      ? 'bg-emerald-100 text-emerald-800'
                      : m.confidence === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {m.confidence}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// STEP 6: USUARIOS Y ROLES (RBAC)
// ==========================================
const Step6Users: React.FC<{
  state: WizardState;
  onChange: (updated: WizardState) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}> = ({ state, onChange, showToast }) => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('COMPANY_ADMIN');

  const handleAddUser = () => {
    if (!userName.trim() || !userEmail.trim()) {
      showToast('error', 'El nombre y correo del usuario son obligatorios.');
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      name: userName.trim(),
      email: userEmail.trim().toLowerCase(),
      role: userRole,
      status: 'ACTIVE' as const
    };

    onChange({
      ...state,
      users: [...state.users, newUser]
    });

    setUserName('');
    setUserEmail('');
    showToast('success', `Usuario ${newUser.name} agregado con rol ${newUser.role}.`);
  };

  const handleRemoveUser = (userId: string) => {
    if (state.users.length <= 1) {
      showToast('error', 'Debe mantenerse al menos un usuario administrador.');
      return;
    }
    onChange({
      ...state,
      users: state.users.filter(u => u.id !== userId)
    });
  };

  const rolesDescription = [
    { role: 'SUPER_ADMIN', desc: 'Acceso total multitenant y administración global del sistema.' },
    { role: 'COMPANY_ADMIN', desc: 'Administración total de la empresa, estructura, encuestas y usuarios.' },
    { role: 'HR_ADMIN', desc: 'Gestión de encuestas, indicadores sociodemográficos e informes autorizados.' },
    { role: 'SST_ADMIN', desc: 'Acceso a variables de salud SG-SST, indicadores nutricionales y diagnósticos.' },
    { role: 'ANALYST', desc: 'Consulta de analítica, filtros y exportación de datos sin cambios de configuración.' },
    { role: 'VIEWER', desc: 'Acceso de solo lectura a tableros ejecutivos consolidados.' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Paso 6: Usuarios y Asignación de Roles (RBAC)</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Asigne los administradores y analistas autorizados para operar esta empresa.
        </p>
      </div>

      {/* Add User Form */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <h4 className="text-xs font-bold text-slate-800">Agregar Usuario a esta Empresa</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={userName}
            onChange={e => setUserName(e.target.value)}
            placeholder="Nombre Completo"
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
          />
          <input
            type="email"
            value={userEmail}
            onChange={e => setUserEmail(e.target.value)}
            placeholder="Correo Electrónico Corporativo"
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none"
          />
          <div className="flex space-x-2">
            <select
              value={userRole}
              onChange={e => setUserRole(e.target.value as UserRole)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none flex-1"
            >
              <option value="COMPANY_ADMIN">COMPANY_ADMIN</option>
              <option value="HR_ADMIN">HR_ADMIN</option>
              <option value="SST_ADMIN">SST_ADMIN</option>
              <option value="ANALYST">ANALYST</option>
              <option value="VIEWER">VIEWER</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
            <button
              onClick={handleAddUser}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shadow-sm"
            >
              + Agregar
            </button>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-800">Usuarios Registrados ({state.users.length})</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {state.users.map(usr => (
            <div key={usr.id} className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <span className="font-bold text-xs text-slate-900 block">{usr.name}</span>
                <span className="text-[11px] text-slate-500 font-medium">{usr.email}</span>
                <span className="inline-block font-mono font-bold text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 mt-1">
                  {usr.role}
                </span>
              </div>
              <button
                onClick={() => handleRemoveUser(usr.id)}
                className="text-slate-400 hover:text-rose-600 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Roles Breakdown Box */}
      <div className="p-4 bg-slate-100 rounded-2xl space-y-2 border border-slate-200">
        <h4 className="text-xs font-bold text-slate-800">Matriz de Permisos por Rol</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          {rolesDescription.map(r => (
            <div key={r.role} className="p-2 bg-white rounded-xl border border-slate-200">
              <span className="font-bold text-indigo-700 block">{r.role}</span>
              <span className="text-slate-600">{r.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// STEP 7: REVISIÓN, CHECKLIST Y ALERTAS
// ==========================================
const Step7Review: React.FC<{
  state: WizardState;
  onChange: (updated: WizardState) => void;
  onJumpToStep: (stepNum: number) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}> = ({ state, onJumpToStep }) => {
  const audit = newCompanyWizardService.validateCompanyForActivation(state);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-bold text-slate-900">Paso 7: Resumen y Auditoría de Configuración</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Revise el checklist antes de proceder a la activación definitiva de la empresa.
        </p>
      </div>

      {/* Company Resumen Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs">
          <span className="text-slate-500 block font-medium">Empresa</span>
          <span className="font-bold text-indigo-950 text-sm truncate block">{state.info.nombreComercial || 'Sin nombre'}</span>
          <span className="text-[10px] font-mono text-indigo-700">{state.info.nit || 'Sin NIT'}</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="text-slate-500 block font-medium">Estructura</span>
          <span className="font-bold text-slate-900 text-sm block">
            {state.orgStructure.sites.length} Sedes | {state.orgStructure.areas.length} Áreas
          </span>
          <span className="text-[10px] text-slate-500">{state.orgStructure.positions.length} Cargos</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="text-slate-500 block font-medium">Encuesta y Preguntas</span>
          <span className="font-bold text-slate-900 text-sm block">
            {state.survey.questions.filter(q => q.active).length} Preguntas Activas
          </span>
          <span className="text-[10px] text-slate-500">Versión: {state.survey.versionName}</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <span className="text-slate-500 block font-medium">Usuarios Registrados</span>
          <span className="font-bold text-slate-900 text-sm block">{state.users.length} Usuarios</span>
          <span className="text-[10px] text-emerald-700 font-bold">RBAC Configurado</span>
        </div>
      </div>

      {/* Checklist */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-sm">
        <h4 className="text-xs font-bold text-slate-900">Checklist de Verificación Pre-Activación</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {audit.checklist.map((item, idx) => (
            <div key={idx} className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                {item.ok ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                )}
                <span className="font-bold text-slate-800">{item.label}</span>
              </div>
              <span className="text-[10px] font-medium text-slate-500">{item.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Critical Indicator Warnings */}
      {audit.criticalVariableWarnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold text-amber-900 flex items-center space-x-2">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
            <span>Advertencia de Indicadores Desactivados</span>
          </h4>
          {audit.criticalVariableWarnings.map((warn, i) => (
            <p key={i} className="text-xs text-amber-800 leading-relaxed">
              {warn}
            </p>
          ))}
        </div>
      )}

      {/* Errors box */}
      {audit.errors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
          <h4 className="text-xs font-bold text-rose-900">Errores Críticos que impiden la activación:</h4>
          <ul className="list-disc list-inside text-xs text-rose-800 space-y-1">
            {audit.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// ==========================================
// STEP 8: ACTIVACIÓN FINAL Y VERSIONAMIENTO
// ==========================================
const Step8Activation: React.FC<{
  state: WizardState;
  onCloseModal: () => void;
  onCompanyCreated?: (companyId: string) => void;
  showToast: (type: 'success' | 'error' | 'info', text: string) => void;
}> = ({ state, onCloseModal, onCompanyCreated, showToast }) => {
  const [isActivating, setIsActivating] = useState(false);
  const audit = newCompanyWizardService.validateCompanyForActivation(state);

  const handleFinalActivation = async () => {
    setIsActivating(true);
    const result = await newCompanyWizardService.activateCompany(state);
    setIsActivating(false);

    if (result.success) {
      showToast('success', `¡Empresa ${state.info.nombreComercial} activada exitosamente!`);
      if (onCompanyCreated) {
        onCompanyCreated(state.companyId);
      }
      setTimeout(() => {
        onCloseModal();
      }, 1000);
    } else {
      showToast('error', result.error || 'Error al activar empresa.');
    }
  };

  return (
    <div className="space-y-6 text-center py-4">
      <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
        <Sparkles className="w-8 h-8" />
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">Activación Final de la Empresa</h3>
        <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
          Al activar la empresa, cambiará de estado <strong className="font-mono text-amber-700">DRAFT</strong> a <strong className="font-mono text-emerald-700">ACTIVE</strong>.
          Se registrará la versión de configuración v{state.configurationVersion} y la versión de encuesta v{state.surveyVersion}.
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-lg mx-auto text-left space-y-2 text-xs">
        <div className="flex justify-between border-b pb-1.5">
          <span className="text-slate-500">ID Empresa:</span>
          <span className="font-mono font-bold text-indigo-700">{state.companyId}</span>
        </div>
        <div className="flex justify-between border-b pb-1.5">
          <span className="text-slate-500">Versión de Configuración:</span>
          <span className="font-mono font-bold text-slate-900">ConfigurationVersion v{state.configurationVersion}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Versión de Encuesta:</span>
          <span className="font-mono font-bold text-slate-900">SurveyVersion v{state.surveyVersion}</span>
        </div>
      </div>

      <div className="pt-2">
        <button
          disabled={!audit.isValid || isActivating}
          onClick={handleFinalActivation}
          className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg transition-all"
        >
          {isActivating ? 'Activando Empresa...' : '🚀 Activar Empresa Definitivamente'}
        </button>
      </div>
    </div>
  );
};
