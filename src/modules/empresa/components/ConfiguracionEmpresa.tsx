import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, 
  Building2,
  Globe, 
  Users, 
  ShieldAlert, 
  Palette, 
  User, 
  Mail, 
  Briefcase, 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle, 
  Info,
  RefreshCw,
  Sparkles,
  Phone,
  MapPin,
  Bookmark,
  Award,
  Eye,
  X,
  FileText,
  FileSpreadsheet,
  Layers,
  Sparkle,
  Search,
  CheckCircle2,
  ShieldCheck,
  LayoutDashboard,
  Cpu
} from 'lucide-react';
import { useEmpresa } from '../../configuracion/useEmpresa';
import { EmpresaConfig } from '../../configuracion/empresa.types';
import { empresaService } from '../../configuracion/empresa.service';
import { CIIU_DATABASE, searchCIIU, CIIUActivity } from '../utils/ciiuLibrary';
import { CatalogosManager } from '../../configuracion/components/CatalogosManager';
import { CompanyConfigurationAdmin } from '../../configuracion/components/CompanyConfigurationAdmin';
import { Prompt23TestRunnerPanel } from '../../configuracion/components/Prompt23TestRunnerPanel';

const PALETAS_PREDEFINIDAS = [
  { name: 'Happy Indigo', primary: '#4f46e5', secondary: '#06b6d4', desc: 'Índigo & Cian' },
  { name: 'Emerald Safety', primary: '#059669', secondary: '#10b981', desc: 'Esmeralda & Menta' },
  { name: 'Classic Slate', primary: '#1e293b', secondary: '#38bdf8', desc: 'Pizarra & Azul Cielo' },
  { name: 'Amber Glow', primary: '#d97706', secondary: '#f43f5e', desc: 'Ámbar & Rosa' }
];

export default function ConfiguracionEmpresa() {
  const { config, updateConfig, refreshConfig } = useEmpresa();
  const [settings, setSettings] = useState<EmpresaConfig>({ ...config });
  const [activeTab, setActiveTab] = useState<'catalogos' | 'multiempresa' | 'configuracion_inteligente' | 'firmas' | 'identidad' | 'pdf'>('multiempresa');
  
  // CIIU Smart Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [ciiuResults, setCiiuResults] = useState<CIIUActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<CIIUActivity | null>(null);
  
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Toast notifications states
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showResetToast, setShowResetToast] = useState(false);
  const [showCancelToast, setShowCancelToast] = useState(false);

  // PDF configuration states
  const [pdfConfig, setPdfConfig] = useState({
    incluirPortada: true,
    mostrarGraficosColor: true,
    incluirFirmasDigitales: true,
    tamanoPapel: 'letter',
    orientacion: 'portrait',
    piePagina: 'People Insight IA - Reporte de Gestión Humana y SG-SST'
  });

  // Load and match initial CIIU on mount or config change
  useEffect(() => {
    setSettings({ ...config });
    if (config.codigoCIIU) {
      const match = CIIU_DATABASE.find(item => item.codigo === config.codigoCIIU);
      if (match) {
        setSelectedActivity(match);
      }
    } else {
      setSelectedActivity(null);
    }
  }, [config]);

  // Handle CIIU Search Input
  useEffect(() => {
    if (searchQuery.trim() === '') {
      // Show default popular choices
      setCiiuResults(CIIU_DATABASE.slice(0, 4));
    } else {
      const results = searchCIIU(searchQuery);
      setCiiuResults(results);
    }
  }, [searchQuery]);

  // Load PDF configuration
  useEffect(() => {
    const savedPdf = localStorage.getItem('happy_insight_pdf_config');
    if (savedPdf) {
      try {
        setPdfConfig(JSON.parse(savedPdf));
      } catch (e) {
        console.error('Error al cargar la configuración de PDF:', e);
      }
    }
  }, []);

  // Form validation before save
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!settings.nombreEmpresa?.trim()) {
      newErrors.nombreEmpresa = 'La Razón Social es obligatoria.';
    }

    if (!settings.nit?.trim()) {
      newErrors.nit = 'El NIT es obligatorio.';
    } else if (!/^[0-9.-]+$/.test(settings.nit)) {
      newErrors.nit = 'El NIT contiene caracteres no válidos (solo números, puntos y guión).';
    }

    if (!settings.ciudad?.trim()) {
      newErrors.ciudad = 'La Ciudad es obligatoria.';
    }

    if (!settings.departamento?.trim()) {
      newErrors.departamento = 'El Departamento es obligatorio.';
    }

    if (!settings.correo?.trim()) {
      newErrors.correo = 'El Correo corporativo es obligatorio.';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(settings.correo)) {
        newErrors.correo = 'El formato del correo electrónico no es válido.';
      }
    }

    if (!settings.responsableSST?.trim()) {
      newErrors.responsableSST = 'El Responsable del SG-SST es obligatorio.';
    }

    if (!settings.codigoCIIU) {
      newErrors.codigoCIIU = 'Debe seleccionar una actividad económica CIIU válida.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Select CIIU Activity
  const handleSelectCiiu = (activity: CIIUActivity) => {
    setSelectedActivity(activity);
    setSettings(prev => ({
      ...prev,
      codigoCIIU: activity.codigo,
      descripcionCIIU: activity.actividad,
      claseRiesgo: activity.claseRiesgo,
      sectorEconomico: activity.sector,
      normativaAplicada: activity.normativa,
      riesgosPrioritarios: activity.riesgosPrioritarios,
      modulosActivados: activity.modulosActivados
    }));
    // Clear CIIU error if selected
    if (errors.codigoCIIU) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.codigoCIIU;
        return copy;
      });
    }
  };

  // Save Settings
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Sync older signature fields to remain backwards-compatible
        const enrichedSettings = {
          ...settings,
          responsableInforme: settings.responsableSST || settings.responsableInforme,
          // Sync default workers count if undefined
          numeroTrabajadores: settings.numeroTrabajadores || 120
        };

        await updateConfig(enrichedSettings);
        localStorage.setItem('happy_insight_pdf_config', JSON.stringify(pdfConfig));

        // Fire custom window events so other modules reload state
        window.dispatchEvent(new Event('company_settings_updated'));
        window.dispatchEvent(new Event('empresa_config_updated'));

        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 3000);
      } catch (err) {
        console.error('Error guardando la configuración inteligente:', err);
        alert('Hubo un error al guardar la configuración empresarial.');
      }
    } else {
      // Scroll to first error
      const firstErrorKey = Object.keys(errors)[0];
      if (firstErrorKey) {
        const element = document.getElementById(`input-${firstErrorKey}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // Fallback scroll to top of form
          window.scrollTo({ top: 100, behavior: 'smooth' });
        }
      }
    }
  };

  // Cancel Changes and reload from global config
  const handleCancel = () => {
    setSettings({ ...config });
    if (config.codigoCIIU) {
      const match = CIIU_DATABASE.find(item => item.codigo === config.codigoCIIU);
      if (match) setSelectedActivity(match);
    }
    setErrors({});
    setShowCancelToast(true);
    setTimeout(() => setShowCancelToast(false), 3000);
  };

  // Reset Company Configurations
  const handleResetSettings = async () => {
    if (window.confirm('¿Está seguro de que desea restablecer la configuración? Esto borrará el NIT, CIIU y datos parametrizados para iniciar desde cero.')) {
      try {
        await empresaService.resetEmpresaConfig();
        await refreshConfig();
        setSelectedActivity(null);
        setSearchQuery('');
        setSettings({
          ...settings,
          nombreEmpresa: '',
          nit: '',
          logo: '',
          correo: '',
          telefono: '',
          direccion: '',
          ciudad: '',
          departamento: '',
          sitioWeb: '',
          responsableSST: '',
          codigoCIIU: '',
          claseRiesgo: '',
          descripcionCIIU: '',
          normativaAplicada: '',
          riesgosPrioritarios: [],
          modulosActivados: []
        });

        setShowResetToast(true);
        setTimeout(() => setShowResetToast(false), 3000);
        setErrors({});
      } catch (err) {
        console.error('Error al restablecer:', err);
      }
    }
  };

  // Logo Drag and Drop files handling
  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Seleccione un archivo de imagen válido (PNG, JPG, SVG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen de logo supera el límite seguro de 2MB para almacenamiento persistente.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setSettings(prev => ({
          ...prev,
          logo: e.target!.result as string
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleLogoUpload(e.target.files[0]);
    }
  };

  const handleRemoveLogo = () => {
    setSettings(prev => ({ ...prev, logo: '' }));
  };

  const selectPalette = (palette: typeof PALETAS_PREDEFINIDAS[0]) => {
    setSettings(prev => ({
      ...prev,
      colorPrimario: palette.primary,
      colorSecundario: palette.secondary
    }));
  };

  // Class Risk Badge color picker
  const getRiskColor = (level: string) => {
    switch(level) {
      case 'I': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'II': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'III': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'IV': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'V': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16 px-4 md:px-6">
      
      {/* Toast Notifications */}
      <AnimatePresence>
        {showSavedToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-emerald-950 border border-emerald-500/30 text-emerald-100 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xl z-50 max-w-md text-left"
          >
            <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-md">
              <Check className="w-5 h-5 font-black" />
            </div>
            <div className="text-xs">
              <p className="font-extrabold text-white text-sm">Configuración Inteligente Guardada</p>
              <p className="text-emerald-300 font-semibold mt-0.5">
                La plataforma ya está parametrizada. Todos los perfiles de riesgo y módulos sectoriales se han activado en tiempo real.
              </p>
            </div>
          </motion.div>
        )}

        {showResetToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-red-950 border border-red-500/30 text-red-100 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xl z-50 max-w-md text-left"
          >
            <div className="p-2 bg-red-500 text-white rounded-xl shadow-md">
              <RefreshCw className="w-5 h-5 font-black" />
            </div>
            <div className="text-xs">
              <p className="font-extrabold text-white text-sm">Configuración Restablecida</p>
              <p className="text-red-300 font-semibold mt-0.5">Se han borrado los datos de la empresa para iniciar un nuevo proceso de parametrización.</p>
            </div>
          </motion.div>
        )}

        {showCancelToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 bg-slate-900 border border-slate-700 text-slate-100 p-4 rounded-2xl flex items-center gap-3.5 shadow-2xl z-50 max-w-md text-left"
          >
            <div className="p-2 bg-slate-500 text-white rounded-xl shadow-md">
              <X className="w-5 h-5 font-black" />
            </div>
            <div className="text-xs">
              <p className="font-extrabold text-white text-sm">Cambios Descartados</p>
              <p className="text-slate-300 font-semibold mt-0.5">Se restauraron los valores previamente almacenados en la configuración global.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Premium Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white p-8 md:p-10 rounded-3xl border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[45%] h-[100%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/25 text-indigo-300 border border-indigo-500/25">
            <Cpu className="w-3.5 h-3.5 animate-pulse text-indigo-400" />
            <span>Motor Paramétrico Colombiano SG-SST</span>
          </div>

          <button
            type="button"
            onClick={handleResetSettings}
            className="self-start sm:self-center bg-red-500/10 hover:bg-red-500 hover:text-white text-red-300 border border-red-500/30 px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restablecer Empresa</span>
          </button>
        </div>

        <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight leading-tight text-left">
          Configuración Inteligente de la Empresa
        </h2>
        <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-3xl text-left">
          Defina y parametrice el perfil corporativo legal de su empresa. Este motor de IA asocia automáticamente el código CIIU oficial colombiano, mapea los riesgos laborales prioritarios de ley, y activa de manera inteligente los módulos correspondientes en toda la plataforma.
        </p>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-250/50 shadow-2xs flex gap-1.5 overflow-x-auto text-left">
        {[
          { id: 'multiempresa', label: 'Administrador Multiempresa', icon: Building2 },
          { id: 'catalogos', label: 'Catálogos Simples', icon: Layers },
          { id: 'configuracion_inteligente', label: 'Parametrización Inteligente (SGSST)', icon: Cpu },
          { id: 'firmas', label: 'Representación y Firmas', icon: FileText },
          { id: 'identidad', label: 'Identidad Visual', icon: Palette },
          { id: 'pdf', label: 'Diseño de Reportes PDF', icon: FileSpreadsheet }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 flex items-center gap-2 ${
                isSelected
                  ? 'bg-indigo-600 text-white font-black shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Tab Content */}
      {activeTab === 'multiempresa' && (
        <div className="space-y-8 animate-fade-in">
          <CompanyConfigurationAdmin />
          <Prompt23TestRunnerPanel />
        </div>
      )}

      {activeTab === 'catalogos' && (
        <CatalogosManager />
      )}

      {activeTab !== 'catalogos' && activeTab !== 'multiempresa' && (
        <form onSubmit={handleSave} className="space-y-8 text-left">
          {activeTab === 'configuracion_inteligente' && (
          <div className="space-y-8">
            
            {/* Warning Banner - Mandatory First Step */}
            <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-500 text-white rounded-xl shadow-xs shrink-0 mt-0.5 md:mt-0">
                  <Info className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-indigo-950 text-xs">Paso Obligatorio para Análisis Sociodemográficos y de Clima</h4>
                  <p className="text-[11px] text-indigo-800 font-semibold leading-relaxed mt-0.5">
                    Al parametrizar su empresa, el motor genera la estructura de cumplimiento del Decreto 1072 de 2015 y Resolución 0312 de 2019. Esto habilita y calibra las herramientas predictivas e informes de IA.
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0">
                Basado en Decreto 768 de 2022
              </span>
            </div>

            {/* SECTION 1: IDENTIFICACIÓN DE LA EMPRESA */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-250/50 shadow-xs space-y-6">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm font-display uppercase tracking-tight">Sección 1: Identificación de la Empresa</h3>
                  <p className="text-xs text-slate-500 font-semibold">Registre la información legal e institucional obligatoria</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Logo Drag and Drop area */}
                <div className="md:col-span-1 space-y-2 text-left">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Logotipo de la Empresa <span className="text-red-500">*</span></label>
                  
                  {settings.logo ? (
                    <div className="relative border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 group h-[160px] transition-all">
                      <img 
                        src={settings.logo} 
                        alt="Logotipo de Empresa" 
                        className="max-h-[120px] max-w-full object-contain rounded-lg bg-white p-1 border border-slate-200/50 shadow-2xs"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-2xl">
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl shadow-md hover:scale-105 transition-all flex items-center gap-1.5 text-xs font-black cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remover</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl h-[160px] flex flex-col items-center justify-center text-center p-4 transition-all ${
                        dragActive
                          ? 'border-indigo-500 bg-indigo-50/30'
                          : 'border-slate-250 hover:border-slate-400 bg-slate-50/50'
                      }`}
                    >
                      <Upload className={`w-8 h-8 mb-2 transition-transform ${dragActive ? 'scale-110 text-indigo-500' : 'text-slate-400'}`} />
                      <p className="text-xs font-bold text-slate-800 mb-1">
                        Arrastre su logo aquí o <label htmlFor="logo-form-input" className="text-indigo-600 hover:text-indigo-700 underline cursor-pointer font-black">busque un archivo</label>
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold leading-tight">Formatos: PNG, JPG, SVG. Máx 2MB.</p>
                      <input
                        type="file"
                        id="logo-form-input"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  )}
                  {errors.logo && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{errors.logo}</p>}
                </div>

                {/* Text fields grid */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Razón Social */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Razón Social <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Building className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="input-nombreEmpresa"
                        value={settings.nombreEmpresa || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, nombreEmpresa: e.target.value }))}
                        placeholder="Ej: ColServicios S.A.S."
                        className={`w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.nombreEmpresa ? 'border-red-400 bg-red-50/20' : 'border-slate-200'} rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all`}
                      />
                    </div>
                    {errors.nombreEmpresa && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1 mt-0.5"><AlertCircle className="w-3.5 h-3.5" />{errors.nombreEmpresa}</p>}
                  </div>

                  {/* NIT */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">NIT <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <span className="text-xs font-bold">N</span>
                      </div>
                      <input
                        type="text"
                        id="input-nit"
                        value={settings.nit || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, nit: e.target.value }))}
                        placeholder="Ej: 901.458.122-8"
                        className={`w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.nit ? 'border-red-400 bg-red-50/20' : 'border-slate-200'} rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all`}
                      />
                    </div>
                    {errors.nit ? (
                      <p className="text-red-600 text-[10px] font-bold flex items-center gap-1 mt-0.5"><AlertCircle className="w-3.5 h-3.5" />{errors.nit}</p>
                    ) : (
                      <p className="text-[9px] text-slate-400 font-bold">Incluya guión y dígito de verificación.</p>
                    )}
                  </div>

                  {/* Ciudad */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Ciudad <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="input-ciudad"
                        value={settings.ciudad || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, ciudad: e.target.value }))}
                        placeholder="Ej: Bogotá D.C."
                        className={`w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.ciudad ? 'border-red-400 bg-red-50/20' : 'border-slate-200'} rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all`}
                      />
                    </div>
                    {errors.ciudad && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1 mt-0.5"><AlertCircle className="w-3.5 h-3.5" />{errors.ciudad}</p>}
                  </div>

                  {/* Departamento */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Departamento <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="input-departamento"
                        value={settings.departamento || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, departamento: e.target.value }))}
                        placeholder="Ej: Cundinamarca"
                        className={`w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.departamento ? 'border-red-400 bg-red-50/20' : 'border-slate-200'} rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all`}
                      />
                    </div>
                    {errors.departamento && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1 mt-0.5"><AlertCircle className="w-3.5 h-3.5" />{errors.departamento}</p>}
                  </div>

                  {/* Dirección */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Dirección Principal</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="input-direccion"
                        value={settings.direccion || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, direccion: e.target.value }))}
                        placeholder="Ej: Avenida El Dorado # 68C-24, Oficina 401"
                        className="w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Second row of identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
                
                {/* Teléfono */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Teléfono corporativo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="input-telefono"
                      value={settings.telefono || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, telefono: e.target.value }))}
                      placeholder="Ej: (601) 400-8800"
                      className="w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Correo Corporativo */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Correo Corporativo <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      id="input-correo"
                      value={settings.correo || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, correo: e.target.value }))}
                      placeholder="Ej: sst@colservicios.co"
                      className={`w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.correo ? 'border-red-400 bg-red-50/20' : 'border-slate-200'} rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all`}
                    />
                  </div>
                  {errors.correo && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1 mt-0.5"><AlertCircle className="w-3.5 h-3.5" />{errors.correo}</p>}
                </div>

                {/* Sitio Web */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Sitio Web</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Globe className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="input-sitioWeb"
                      value={settings.sitioWeb || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, sitioWeb: e.target.value }))}
                      placeholder="Ej: www.colservicios.co"
                      className="w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Responsable SG-SST */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Responsable del SG-SST <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="input-responsableSST"
                      value={settings.responsableSST || ''}
                      onChange={(e) => setSettings(prev => ({ ...prev, responsableSST: e.target.value }))}
                      placeholder="Ej: Ing. Martha Lucía Peña"
                      className={`w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border ${errors.responsableSST ? 'border-red-400 bg-red-50/20' : 'border-slate-200'} rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all`}
                    />
                  </div>
                  {errors.responsableSST && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1 mt-0.5"><AlertCircle className="w-3.5 h-3.5" />{errors.responsableSST}</p>}
                </div>

              </div>
            </div>

            {/* SECTION 2 & 3: ACTIVIDAD ECONÓMICA & TARJETA CORPORATIVA */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* SECTION 2: BUSCADOR INTELIGENTE (Left side) */}
              <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-slate-250/50 shadow-xs space-y-6 flex flex-col">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-slate-900 text-sm font-display uppercase tracking-tight">Sección 2: Actividad Económica</h3>
                    <p className="text-xs text-slate-500 font-semibold">Buscador Inteligente CIIU de Colombia</p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-semibold">
                  Escriba una palabra clave o el código directo (ej. <span className="font-mono text-indigo-600 font-black">Call Center</span>, <span className="font-mono text-indigo-600 font-black">BPO</span>, <span className="font-mono text-indigo-600 font-black">8220</span> o <span className="font-mono text-indigo-600 font-black">Software</span>) para identificar la clasificación de ley.
                </p>

                {/* Intelligent Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4 animate-pulse" />
                  </div>
                  <input
                    type="text"
                    id="input-codigoCIIU"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Escriba aquí para buscar: BPO, Call Center, 8220, Software, Salud..."
                    className="w-full text-xs font-black text-slate-800 pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>

                {/* Search Results list */}
                <div className="flex-1 overflow-y-auto max-h-[280px] space-y-2 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Actividades Coincidentes en Biblioteca de Ley</span>
                  
                  {ciiuResults.length > 0 ? (
                    ciiuResults.map((item) => {
                      const isSelected = settings.codigoCIIU === item.codigo;
                      return (
                        <button
                          key={item.codigo}
                          type="button"
                          onClick={() => handleSelectCiiu(item)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50/40 shadow-xs'
                              : 'border-slate-150 hover:border-slate-350 bg-slate-50/20 hover:bg-slate-50'
                          }`}
                        >
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-black text-[10px] rounded-md tracking-wider">
                                CIIU {item.codigo}
                              </span>
                              <span className="text-[10px] font-black text-slate-400 block truncate">{item.sector}</span>
                            </div>
                            <span className="text-xs font-black text-slate-800 block truncate">{item.actividad}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getRiskColor(item.claseRiesgo)}`}>
                              Riesgo {item.claseRiesgo}
                            </span>
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-slate-200 shrink-0 bg-white" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs font-extrabold text-slate-500">No se encontraron actividades de ley con ese criterio</p>
                      <p className="text-[10px] font-semibold mt-0.5 text-slate-400">Intente con palabras clave como "llamadas", "médico", "carga" o "edificios"</p>
                    </div>
                  )}
                </div>
                {errors.codigoCIIU && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1 mt-1"><AlertCircle className="w-3.5 h-3.5" />{errors.codigoCIIU}</p>}
              </div>

              {/* SECTION 3: TARJETA CORPORATIVA (Right side) */}
              <div className="lg:col-span-5 flex flex-col h-full">
                <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-lg space-y-6 flex-1 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                  
                  <div className="space-y-4 text-left">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">Sección 3: Actividad Económica Identificada</span>
                    
                    {selectedActivity ? (
                      <motion.div 
                        key={selectedActivity.codigo}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-5"
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono block">Código CIIU</span>
                            <span className="text-3xl font-black tracking-tight text-white font-mono">{selectedActivity.codigo}</span>
                          </div>
                          <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${getRiskColor(selectedActivity.claseRiesgo)} shadow-sm shrink-0`}>
                            Clase de Riesgo {selectedActivity.claseRiesgo}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Actividad Oficial</span>
                          <span className="text-xs font-black text-slate-150 leading-snug block">{selectedActivity.actividad}</span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Sector Industrial</span>
                          <span className="text-xs font-extrabold text-white block">{selectedActivity.sector}</span>
                        </div>

                        <div className="space-y-1 border-t border-slate-800/80 pt-3">
                          <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Descripción de Ley</span>
                          <p className="text-[10px] text-slate-350 font-medium leading-relaxed">{selectedActivity.descripcionOficial}</p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="py-12 text-center text-slate-500 space-y-3">
                        <ShieldCheck className="w-12 h-12 mx-auto text-slate-600 animate-pulse" />
                        <div>
                          <p className="text-xs font-extrabold text-slate-400">Sin Clasificación Seleccionada</p>
                          <p className="text-[10px] text-slate-500 font-semibold max-w-[240px] mx-auto mt-1">Busque y seleccione una actividad CIIU en el panel izquierdo para cargar la tarjeta legal corporativa.</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedActivity && (
                    <div className="mt-6 border-t border-slate-800 pt-4 flex items-center justify-between text-left">
                      <div>
                        <span className="text-[8px] text-slate-400 font-extrabold uppercase block">Normativa Aplicada</span>
                        <span className="text-[10px] text-emerald-400 font-black">{selectedActivity.normativa}</span>
                      </div>
                      <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 text-[9px] font-extrabold">
                        ✓ Cumplimiento
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* SECTION 4 & 5: RIESGOS PRIORITARIOS & MOTOR PERFIL SECTORIAL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* SECTION 4: RIESGOS PRIORITARIOS */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-250/50 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm font-display uppercase tracking-tight">Sección 4: Riesgos Prioritarios</h3>
                    <p className="text-xs text-slate-500 font-semibold">Riesgos y peligros identificados de ley para su sector</p>
                  </div>
                </div>

                {selectedActivity ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3"
                  >
                    <p className="text-xs text-slate-500 font-semibold">
                      Basado en la actividad económica <span className="font-bold text-slate-800 font-mono">({selectedActivity.codigo})</span>, el sistema diagnostica los siguientes focos críticos prioritarios:
                    </p>
                    <div className="grid grid-cols-1 gap-2.5">
                      {selectedActivity.riesgosPrioritarios.map((riesgo, index) => (
                        <div key={index} className="p-3 bg-rose-50/35 border border-rose-100 rounded-xl flex items-start gap-2.5">
                          <Check className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 leading-tight">{riesgo}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <ShieldAlert className="w-10 h-10 mx-auto opacity-50" />
                    <p className="text-xs font-extrabold text-slate-500">Esperando Selección CIIU</p>
                    <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto">Seleccione la actividad económica para diagnosticar los riesgos priorizados automáticamente.</p>
                  </div>
                )}
              </div>

              {/* SECTION 5: MOTOR INTELIGENTE PERFIL SECTORIAL */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-250/50 shadow-xs space-y-6">
                <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm font-display uppercase tracking-tight">Sección 5: Perfil Sectorial IA</h3>
                    <p className="text-xs text-slate-500 font-semibold">Módulos de control activados en tiempo real</p>
                  </div>
                </div>

                {selectedActivity ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <p className="text-xs text-slate-500 font-semibold">
                      El motor inteligente de perfilación sectorial ha mapeado sus necesidades y ha activado las siguientes consolas del SaaS de manera automática:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {selectedActivity.modulosActivados.map((modulo, index) => (
                        <div key={index} className="p-3 bg-emerald-50/30 border border-emerald-100 rounded-xl flex items-center justify-between gap-2 shadow-2xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <Sparkle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-xs font-black text-slate-800 truncate">{modulo}</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0">
                            <span className="w-1 h-1 bg-emerald-600 rounded-full animate-ping" />
                            Activo
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-8 text-center text-slate-400 space-y-2">
                    <Cpu className="w-10 h-10 mx-auto opacity-50" />
                    <p className="text-xs font-extrabold text-slate-500">Esperando Selección CIIU</p>
                    <p className="text-[10px] text-slate-400 max-w-[280px] mx-auto">El perfil sectorial auto-activará los dashboards de bienestar y SG-SST una vez asocie un código CIIU.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB: REPRESENTACIÓN Y FIRMAS */}
        {activeTab === 'firmas' && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-250/50 shadow-xs space-y-6 animate-fade-in">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm font-display uppercase tracking-tight">Representación Legal y Firmas</h3>
                <p className="text-xs text-slate-500 font-semibold">Configure los responsables que certificarán los reportes del SG-SST</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Representante Legal Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Nombre del Representante Legal</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="input-representanteLegal"
                    value={settings.representanteLegal || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, representanteLegal: e.target.value }))}
                    placeholder="Ej: Carlos Eduardo Restrepo"
                    className="w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Cargo Representante */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Cargo del Representante</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="input-cargoRepresentante"
                    value={settings.cargoRepresentante || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, cargoRepresentante: e.target.value }))}
                    placeholder="Ej: Gerente General / Representante Legal"
                    className="w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Responsable de Emisión / Auditor */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Responsable de Auditoría / Informes</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="input-responsableInforme"
                    value={settings.responsableInforme || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, responsableInforme: e.target.value }))}
                    placeholder="Ej: Dr. Alejandro Muñoz"
                    className="w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Cargo de Responsable de Emisión */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Cargo de Responsable</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="input-cargoResponsable"
                    value={settings.cargoResponsable || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, cargoResponsable: e.target.value }))}
                    placeholder="Ej: Auditor Interno SG-SST"
                    className="w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB: IDENTIDAD VISUAL */}
        {activeTab === 'identidad' && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-250/50 shadow-xs space-y-6 animate-fade-in">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm font-display uppercase tracking-tight">Identidad Visual</h3>
                <p className="text-xs text-slate-500 font-semibold">Configuración de los colores institucionales y eslogan de marca</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Slogan */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Eslogan o Lema Organizacional</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    id="input-eslogan"
                    value={settings.eslogan || ''}
                    onChange={(e) => setSettings(prev => ({ ...prev, eslogan: e.target.value }))}
                    placeholder="Ej: Liderazgo y Talento Humano Seguro"
                    className="w-full text-xs font-bold text-slate-800 pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Brand Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Color Primario</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50">
                    <input 
                      type="color" 
                      value={settings.colorPrimario || '#4f46e5'}
                      onChange={(e) => setSettings(p => ({ ...p, colorPrimario: e.target.value }))}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shrink-0" 
                    />
                    <input 
                      type="text" 
                      value={settings.colorPrimario || ''}
                      placeholder="#4f46e5"
                      onChange={(e) => setSettings(p => ({ ...p, colorPrimario: e.target.value }))}
                      className="w-full text-xs font-mono font-black text-slate-700 border-0 focus:ring-0 p-0 outline-none bg-transparent" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Color Secundario</label>
                  <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50">
                    <input 
                      type="color" 
                      value={settings.colorSecundario || '#06b6d4'}
                      onChange={(e) => setSettings(p => ({ ...p, colorSecundario: e.target.value }))}
                      className="w-8 h-8 rounded-lg cursor-pointer border-0 p-0 overflow-hidden shrink-0" 
                    />
                    <input 
                      type="text" 
                      value={settings.colorSecundario || ''}
                      placeholder="#06b6d4"
                      onChange={(e) => setSettings(p => ({ ...p, colorSecundario: e.target.value }))}
                      className="w-full text-xs font-mono font-black text-slate-700 border-0 focus:ring-0 p-0 outline-none bg-transparent" 
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Recommended Predefined Palettes */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">Paletas de Color Recomendadas</span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PALETAS_PREDEFINIDAS.map((palette, idx) => {
                  const isSelected = settings.colorPrimario === palette.primary && settings.colorSecundario === palette.secondary;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => selectPalette(palette)}
                      className={`flex items-center justify-between p-3 rounded-2xl border text-left text-xs font-extrabold transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 shadow-2xs' 
                          : 'border-slate-200 hover:border-slate-350 bg-slate-50/20'
                      }`}
                    >
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate">{palette.name}</span>
                        <span className="text-[8px] text-slate-400 font-semibold mt-0.5">{palette.desc}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <span className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0" style={{ backgroundColor: palette.primary }} />
                        <span className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0" style={{ backgroundColor: palette.secondary }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB: DISEÑO DE REPORTES PDF */}
        {activeTab === 'pdf' && (
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-250/50 shadow-xs space-y-6 animate-fade-in">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm font-display uppercase tracking-tight">Diseño de Reportes PDF</h3>
                <p className="text-xs text-slate-500 font-semibold">Defina la salida visual de los informes oficiales del SG-SST descargables</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="space-y-4 md:col-span-2 text-left">
                {/* Paper size */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Tamaño del Papel</label>
                  <select
                    value={pdfConfig.tamanoPapel}
                    onChange={(e) => setPdfConfig(prev => ({ ...prev, tamanoPapel: e.target.value }))}
                    className="w-full text-xs font-bold text-slate-800 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                  >
                    <option value="letter">Carta (Letter - 216mm x 279mm) - Estándar Colombia</option>
                    <option value="A4">A4 (210mm x 297mm) - Estándar Internacional</option>
                    <option value="legal">Oficio (Legal - 216mm x 356mm)</option>
                  </select>
                </div>

                {/* Footer Text */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">Texto del Pie de Página</label>
                  <input
                    type="text"
                    value={pdfConfig.piePagina}
                    onChange={(e) => setPdfConfig(prev => ({ ...prev, piePagina: e.target.value }))}
                    placeholder="Escriba el descargo de responsabilidad o texto legal..."
                    className="w-full text-xs font-bold text-slate-800 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white outline-none"
                  />
                </div>

                {/* Checklist options */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <label className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-150 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={pdfConfig.incluirPortada}
                      onChange={(e) => setPdfConfig(prev => ({ ...prev, incluirPortada: e.target.checked }))}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-[11px] font-bold text-slate-700">Incluir Portada</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-150 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={pdfConfig.mostrarGraficosColor}
                      onChange={(e) => setPdfConfig(prev => ({ ...prev, mostrarGraficosColor: e.target.checked }))}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-[11px] font-bold text-slate-700">Gráficos a Color</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-150 cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={pdfConfig.incluirFirmasDigitales}
                      onChange={(e) => setPdfConfig(prev => ({ ...prev, incluirFirmasDigitales: e.target.checked }))}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="text-[11px] font-bold text-slate-700">Incluir Firmas</span>
                  </label>
                </div>
              </div>

              {/* Informative tips box */}
              <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-left space-y-3 md:col-span-1">
                <div className="flex items-center gap-2 text-indigo-600">
                  <Info className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-black uppercase">Consejo para Auditoría</span>
                </div>
                <h4 className="font-extrabold text-xs text-slate-800">Exportación Válida de Ley</h4>
                <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                  Para que los informes descargables de ausentismo, caracterización demográfica o matrices de riesgo tengan validez legal en Colombia, se aconseja marcar la opción de <span className="font-bold">"Incluir Firmas"</span> con las identificaciones diligenciadas en la pestaña de Firmas.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* Buttons Bar (Save / Cancel) */}
        <div className="bg-white p-4 rounded-3xl border border-slate-250/50 shadow-2xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Todos los cambios se guardan localmente para mayor velocidad.</span>
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl text-xs font-black transition-all cursor-pointer"
            >
              Descartar
            </button>
            
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs transition-all shadow-md hover:shadow-indigo-600/10 flex items-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              <Check className="w-4 h-4 font-black" />
              <span>Guardar Configuración</span>
            </button>
          </div>
        </div>

      </form>
      )}

    </div>
  );
}
