import React, { useState, useRef, useEffect } from 'react';
import {
  Building,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Palette,
  User,
  Shield,
  FileText,
  Upload,
  Trash2,
  Globe,
  Phone,
  MapPin,
  Bookmark,
  Award,
  Eye,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useEmpresa } from '../modules/configuracion/useEmpresa';
import { EmpresaConfig } from '../modules/configuracion/empresa.types';
import { empresaService } from '../modules/configuracion/empresa.service';

interface SetupWizardProps {
  onClose?: () => void;
}

export default function SetupWizard({ onClose }: SetupWizardProps) {
  const { config, updateConfig, refreshConfig } = useEmpresa();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<EmpresaConfig>({
    id: 'default-company',
    nombreEmpresa: '',
    nit: '',
    logo: '',
    colorPrimario: '#4f46e5',
    colorSecundario: '#06b6d4',
    correo: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    pais: 'Colombia',
    sectorEconomico: 'Servicios de Tecnología / Contact Center',
    numeroTrabajadores: 0,
    nivelRiesgoARL: 1,
    representanteLegal: '',
    cargoRepresentante: '',
    responsableInforme: '',
    cargoResponsable: '',
    sitioWeb: '',
    eslogan: ''
  });

  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with existing config if any fields are already populated (safety)
  useEffect(() => {
    if (config && config.nombreEmpresa) {
      setFormData(prev => ({
        ...prev,
        ...config
      }));
    }
  }, [config]);

  // Set default colors if none present
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      colorPrimario: prev.colorPrimario || '#4f46e5',
      colorSecundario: prev.colorSecundario || '#06b6d4'
    }));
  }, []);

  const handleChange = (field: keyof EmpresaConfig, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  // Base64 Logo Upload
  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen de logo es demasiado grande. El tamaño máximo permitido es de 2 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleChange('logo', e.target.result as string);
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
    handleChange('logo', '');
  };

  // Step-by-Step Validation
  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 2) {
      if (!formData.nombreEmpresa.trim()) {
        newErrors.nombreEmpresa = 'La razón social es obligatoria.';
      }
      if (!formData.nit.trim()) {
        newErrors.nit = 'El NIT es obligatorio.';
      } else if (!/^[0-9.-]+$/.test(formData.nit.trim())) {
        newErrors.nit = 'El NIT contiene caracteres no permitidos (solo números, puntos y guión).';
      }
      if (!formData.ciudad.trim()) {
        newErrors.ciudad = 'La ciudad es obligatoria.';
      }
      if (!formData.pais.trim()) {
        newErrors.pais = 'El país es obligatorio.';
      }
      if (!formData.direccion.trim()) {
        newErrors.direccion = 'La dirección es obligatoria.';
      }
      if (!formData.telefono.trim()) {
        newErrors.telefono = 'El teléfono de contacto es obligatorio.';
      }
    }

    if (step === 4) {
      if (!formData.representanteLegal.trim()) {
        newErrors.representanteLegal = 'El nombre del representante legal es obligatorio.';
      }
      if (!formData.cargoRepresentante.trim()) {
        newErrors.cargoRepresentante = 'El cargo del representante legal es obligatorio.';
      }
      if (!formData.responsableInforme.trim()) {
        newErrors.responsableInforme = 'El nombre del responsable del informe es obligatorio.';
      }
      if (!formData.cargoResponsable.trim()) {
        newErrors.cargoResponsable = 'El cargo del responsable del informe es obligatorio.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
  };

  const handleFinalize = async () => {
    if (validateStep()) {
      try {
        // Save the full configuration
        await updateConfig(formData);
        // Mark wizard as completed
        localStorage.setItem('happy_insight_wizard_completed', 'true');
        // Refresh values globally
        await refreshConfig();
        if (onClose) onClose();
      } catch (e) {
        console.error("Error finalizing company wizard:", e);
        alert("Hubo un error al guardar la configuración inicial. Por favor revisa los campos.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200/80 max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[580px] max-h-[90vh] animate-scale-up text-left">
        
        {/* Sidebar Status Steps */}
        <div className="md:w-72 bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white p-6 flex flex-col justify-between border-r border-slate-800">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Building className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="text-xs font-black tracking-wider uppercase block text-blue-400">Setup Assistant</span>
                <span className="text-sm font-black font-display text-white">Configuración Inicial</span>
              </div>
            </div>

            {/* Steps timeline indicators */}
            <div className="space-y-4 pt-4">
              {[
                { s: 1, label: 'Bienvenida', desc: 'Introducción de marca' },
                { s: 2, label: 'Datos de la Empresa', desc: 'Identificación y contacto' },
                { s: 3, label: 'Identidad Visual', desc: 'Logotipo y colores' },
                { s: 4, label: 'Responsables', desc: 'Firmas y cargos' },
                { s: 5, label: 'Confirmación', desc: 'Resumen corporativo' }
              ].map(item => (
                <div key={item.s} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[11px] font-black border transition-all ${
                      step > item.s 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : step === item.s 
                          ? 'bg-indigo-600/30 text-blue-400 border-blue-500 font-extrabold ring-4 ring-blue-500/10' 
                          : 'bg-transparent text-slate-500 border-slate-800'
                    }`}>
                      {step > item.s ? <Check className="w-3.5 h-3.5" /> : item.s}
                    </div>
                    {item.s < 5 && <div className={`w-0.5 h-6 my-1 ${step > item.s ? 'bg-blue-500' : 'bg-slate-800'}`} />}
                  </div>
                  <div className="text-left -mt-0.5">
                    <p className={`text-[11px] font-extrabold leading-tight ${step === item.s ? 'text-white' : step > item.s ? 'text-slate-300' : 'text-slate-500'}`}>
                      {item.label}
                    </p>
                    <p className="text-[9px] text-slate-500 font-medium leading-none mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80">
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              People Insight IA • Conexión de motor segura. Cumple con normatividad de protección de datos SG-SST.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex flex-col justify-between bg-slate-50/50 p-6 md:p-8 overflow-y-auto">
          
          <div className="space-y-6 flex-1">
            
            {/* STEP 1: WELCOME SCREEN */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                    <span>Plataforma Inteligente</span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">
                    ¡Te damos la bienvenida a People Insight IA!
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold">
                    Un entorno de análisis automatizado y optimización de talento para tu organización.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-4 shadow-3xs leading-relaxed text-slate-600">
                  <p className="text-xs font-medium">
                    People Insight IA actúa como un **consultor y analista estratégico** en Seguridad y Salud en el Trabajo (SG-SST) y Desarrollo Organizacional. 
                    A través de esta plataforma, podrás:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 h-9 w-9 flex items-center justify-center">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-800">Diagnóstico Sociodemográfico</p>
                        <p className="text-[10px] text-slate-400 font-medium leading-snug">Caracteriza tu nómina con variables en tiempo real.</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 h-9 w-9 flex items-center justify-center">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-800">Recomendaciones de IA</p>
                        <p className="text-[10px] text-slate-400 font-medium leading-snug">Acciones de bienestar contextualizadas por Gemini.</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0 h-9 w-9 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-800">Planes de Trabajo Anuales</p>
                        <p className="text-[10px] text-slate-400 font-medium leading-snug">Cronograma estructurado según normatividad legal.</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex gap-3">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0 h-9 w-9 flex items-center justify-center">
                        <Palette className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-800">Identidad Corporativa</p>
                        <p className="text-[10px] text-slate-400 font-medium leading-snug">Informes personalizados con tus colores y logo.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-amber-50/50 border border-amber-150 rounded-xl flex gap-2.5 items-start text-amber-900 text-xs font-semibold">
                    <Info className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                    <p className="leading-normal">
                      Para garantizar la consistencia en los encabezados, firmas de informes oficiales y paletas de color en el aplicativo, iniciaremos este **Asistente de Configuración Rápida**. Te tomará menos de 2 minutos.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: COMPANY INFORMATION */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 font-display">Información de la Empresa</h2>
                  <p className="text-xs text-slate-500 font-semibold">Introduce los parámetros legales y canales oficiales de tu organización.</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-4.5 shadow-3xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Razón social */}
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Razón Social o Nombre Legal *</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.nombreEmpresa}
                          onChange={(e) => handleChange('nombreEmpresa', e.target.value)}
                          placeholder="Ej: InnovaTech Solutions S.A.S."
                          className={`w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border ${
                            errors.nombreEmpresa ? 'border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'
                          } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all`}
                        />
                      </div>
                      {errors.nombreEmpresa && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.nombreEmpresa}</p>}
                    </div>

                    {/* NIT */}
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">NIT *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">N</span>
                        <input
                          type="text"
                          value={formData.nit}
                          onChange={(e) => handleChange('nit', e.target.value)}
                          placeholder="Ej: 900.123.456-7"
                          className={`w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border ${
                            errors.nit ? 'border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'
                          } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all`}
                        />
                      </div>
                      {errors.nit ? (
                        <p className="text-red-600 text-[10px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.nit}</p>
                      ) : (
                        <p className="text-[9px] text-slate-400 font-medium">Con guión y dígito de verificación.</p>
                      )}
                    </div>

                    {/* Dirección */}
                    <div className="space-y-1 text-left sm:col-span-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Dirección Principal *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.direccion}
                          onChange={(e) => handleChange('direccion', e.target.value)}
                          placeholder="Ej: Calle 100 # 15-23, Oficina 502"
                          className={`w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border ${
                            errors.direccion ? 'border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'
                          } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all`}
                        />
                      </div>
                      {errors.direccion && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.direccion}</p>}
                    </div>

                    {/* Ciudad */}
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Ciudad *</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.ciudad}
                          onChange={(e) => handleChange('ciudad', e.target.value)}
                          placeholder="Ej: Bogotá D.C."
                          className={`w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border ${
                            errors.ciudad ? 'border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'
                          } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all`}
                        />
                      </div>
                      {errors.ciudad && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.ciudad}</p>}
                    </div>

                    {/* País */}
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">País *</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.pais}
                          onChange={(e) => handleChange('pais', e.target.value)}
                          placeholder="Ej: Colombia"
                          className={`w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border ${
                            errors.pais ? 'border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'
                          } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all`}
                        />
                      </div>
                      {errors.pais && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.pais}</p>}
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Teléfono de Contacto *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.telefono}
                          onChange={(e) => handleChange('telefono', e.target.value)}
                          placeholder="Ej: (601) 555-0199"
                          className={`w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border ${
                            errors.telefono ? 'border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'
                          } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all`}
                        />
                      </div>
                      {errors.telefono && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.telefono}</p>}
                    </div>

                    {/* Sitio web */}
                    <div className="space-y-1 text-left">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Sitio Web Corporativo</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.sitioWeb}
                          onChange={(e) => handleChange('sitioWeb', e.target.value)}
                          placeholder="Ej: www.innovatech.com"
                          className="w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CORPORATE IDENTITY */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 font-display">Identidad Corporativa</h2>
                  <p className="text-xs text-slate-500 font-semibold">Sube el logo de la empresa, escoge tu paleta de color y define el eslogan oficial.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  
                  {/* Forms input column */}
                  <div className="md:col-span-3 bg-white rounded-2xl border border-slate-200/60 p-5 space-y-4.5 shadow-3xs">
                    
                    {/* Logo Uploader */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Logotipo Corporativo</label>
                      {formData.logo ? (
                        <div className="relative border border-slate-150 rounded-xl p-3 flex flex-col items-center justify-center bg-slate-50/50 group transition-all">
                          <img
                            src={formData.logo}
                            alt="Logo de la empresa"
                            className="max-h-20 max-w-full object-contain rounded shadow-xs"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all rounded-xl">
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg shadow-md hover:scale-105 transition-all flex items-center gap-1 text-[10px] font-extrabold cursor-pointer"
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
                          onClick={() => fileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                            dragActive
                              ? 'border-indigo-500 bg-indigo-50/20'
                              : 'border-slate-200 hover:border-slate-350 bg-slate-50/40'
                          }`}
                        >
                          <Upload className="w-6 h-6 mb-1.5 text-slate-400" />
                          <p className="text-[11px] font-black text-slate-700">Arrastra tu logo aquí o busca un archivo</p>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">PNG, JPG o SVG. Máx 2MB.</p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            id="logo-upload-wizard"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>

                    {/* Colors Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Color Principal</label>
                        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2 py-1.5 bg-slate-50">
                          <input
                            type="color"
                            value={formData.colorPrimario}
                            onChange={(e) => handleChange('colorPrimario', e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer border-0 p-0 overflow-hidden shrink-0"
                          />
                          <input
                            type="text"
                            value={formData.colorPrimario}
                            onChange={(e) => handleChange('colorPrimario', e.target.value)}
                            placeholder="#4f46e5"
                            className="w-full text-[11px] font-mono font-bold text-slate-700 border-0 focus:ring-0 p-0 outline-none bg-transparent"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Color Secundario</label>
                        <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2 py-1.5 bg-slate-50">
                          <input
                            type="color"
                            value={formData.colorSecundario}
                            onChange={(e) => handleChange('colorSecundario', e.target.value)}
                            className="w-7 h-7 rounded cursor-pointer border-0 p-0 overflow-hidden shrink-0"
                          />
                          <input
                            type="text"
                            value={formData.colorSecundario}
                            onChange={(e) => handleChange('colorSecundario', e.target.value)}
                            placeholder="#06b6d4"
                            className="w-full text-[11px] font-mono font-bold text-slate-700 border-0 focus:ring-0 p-0 outline-none bg-transparent"
                          />
                        </div>
                      </div>

                    </div>

                    {/* Slogan */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">Eslogan Corporativo</label>
                      <div className="relative">
                        <Bookmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.eslogan}
                          onChange={(e) => handleChange('eslogan', e.target.value)}
                          placeholder="Ej: Liderazgo, Seguridad y Bienestar"
                          className="w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                        />
                      </div>
                    </div>

                  </div>

                  {/* Realtime preview column */}
                  <div className="md:col-span-2 space-y-3.5">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-3xs space-y-4">
                      
                      <div className="flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                        <Eye className="w-4 h-4 text-indigo-600" />
                        <div>
                          <h4 className="font-extrabold text-[11px] text-slate-900">Vista Previa</h4>
                          <span className="text-[8px] font-bold text-slate-400 uppercase leading-none">Así se verá tu cabecera</span>
                        </div>
                      </div>

                      {/* Header Widget Simulation */}
                      <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-900 text-white shadow-sm text-left">
                        <div className="bg-slate-950 px-2 py-1 flex items-center justify-between">
                          <span className="text-[6px] font-bold font-mono tracking-widest text-slate-500 uppercase">PLATAFORMA</span>
                          <div className="flex gap-0.5">
                            <span className="w-1 h-1 rounded-full bg-red-500" />
                            <span className="w-1 h-1 rounded-full bg-yellow-500" />
                            <span className="w-1 h-1 rounded-full bg-emerald-500" />
                          </div>
                        </div>

                        <div className="p-3 flex items-center justify-between gap-2.5 bg-gradient-to-r from-slate-900 to-slate-950 min-h-[60px]">
                          <div className="flex items-center gap-2 overflow-hidden">
                            {formData.logo ? (
                              <img
                                src={formData.logo}
                                alt="Logo Preview"
                                className="w-7 h-7 object-contain rounded bg-white/5 p-0.5 border border-white/10 shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center shrink-0" style={{ color: formData.colorSecundario }}>
                                <Building className="w-3.5 h-3.5" />
                              </div>
                            )}
                            <div className="overflow-hidden">
                              <span className="text-[9px] font-black tracking-tight block truncate text-white">
                                {formData.nombreEmpresa || 'Mi Empresa S.A.S.'}
                              </span>
                              <p className="text-[7px] font-bold leading-none truncate mt-0.5" style={{ color: formData.colorSecundario }}>
                                {formData.eslogan || 'People & Insight'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-slate-950/80 p-2 text-[8px] border-t border-slate-850 flex justify-between text-slate-400">
                          <div>
                            <span className="block font-bold text-white text-[7px]">Sede Principal</span>
                            <span className="text-[7px] truncate block">{formData.ciudad || 'Bogotá D.C.'}</span>
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-white text-[7px]">NIT</span>
                            <span className="text-[7px] block">{formData.nit || '---'}</span>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 4: RESPONSIBLES */}
            {step === 4 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 font-display">Responsables y Firmas</h2>
                  <p className="text-xs text-slate-500 font-semibold">Configura las firmas para la aprobación y expedición de los informes del SG-SST.</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 space-y-4.5 shadow-3xs">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
                    
                    {/* Representante Legal Name */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Representante Legal *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.representanteLegal}
                          onChange={(e) => handleChange('representanteLegal', e.target.value)}
                          placeholder="Ej: Carlos Alberto Gómez"
                          className={`w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border ${
                            errors.representanteLegal ? 'border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'
                          } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all`}
                        />
                      </div>
                      {errors.representanteLegal && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.representanteLegal}</p>}
                    </div>

                    {/* Representante Legal Cargo */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Cargo Representante Legal *</label>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.cargoRepresentante}
                          onChange={(e) => handleChange('cargoRepresentante', e.target.value)}
                          placeholder="Ej: Gerente General / Representante Legal"
                          className={`w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border ${
                            errors.cargoRepresentante ? 'border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'
                          } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all`}
                        />
                      </div>
                      {errors.cargoRepresentante && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cargoRepresentante}</p>}
                    </div>

                    {/* Responsable del Informe Name */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Responsable del Informe SG-SST *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.responsableInforme}
                          onChange={(e) => handleChange('responsableInforme', e.target.value)}
                          placeholder="Ej: Diana Patricia Herrera"
                          className={`w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border ${
                            errors.responsableInforme ? 'border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'
                          } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all`}
                        />
                      </div>
                      {errors.responsableInforme && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.responsableInforme}</p>}
                    </div>

                    {/* Responsable del Informe Cargo */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">Cargo Responsable del Informe *</label>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          value={formData.cargoResponsable}
                          onChange={(e) => handleChange('cargoResponsable', e.target.value)}
                          placeholder="Ej: Directora de Gestión Humana / Coordinadora SST"
                          className={`w-full pl-9 pr-4 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 bg-slate-50 border ${
                            errors.cargoResponsable ? 'border-red-400 bg-red-50/10' : 'border-slate-200 focus:border-blue-500'
                          } rounded-xl outline-none focus:ring-2 focus:ring-blue-500/10 transition-all`}
                        />
                      </div>
                      {errors.cargoResponsable && <p className="text-red-600 text-[10px] font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cargoResponsable}</p>}
                    </div>

                  </div>

                  <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100 flex gap-2.5 items-start text-blue-900 text-xs font-semibold text-left">
                    <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="leading-normal text-[11px]">
                      Estos nombres y cargos se auto-completarán en la sección de **Firmas Digitales de los Reportes Ejecutivos** (Análisis de Caracterización, Plan Anual de Trabajo y Cuadro de Indicadores) garantizando que los PDF exportables cuenten con las firmas y autorizaciones debidas ante entes reguladores.
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* STEP 5: CONFIRMATION SUMMARY */}
            {step === 5 && (
              <div className="space-y-5 animate-fade-in text-left">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900 font-display">Resumen y Confirmación</h2>
                  <p className="text-xs text-slate-500 font-semibold">Por favor valida la información registrada antes de finalizar el proceso de configuración.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Left Column: Details Box */}
                  <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-4 shadow-3xs">
                    <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      <Building className="w-4 h-4" />
                      <span>Información General de la Empresa</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-extrabold uppercase leading-none">Razón Social</span>
                        <span className="font-extrabold text-slate-800 mt-1 block">{formData.nombreEmpresa}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-extrabold uppercase leading-none">NIT</span>
                        <span className="font-extrabold text-slate-800 mt-1 block">{formData.nit}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="block text-[10px] text-slate-400 font-extrabold uppercase leading-none">Dirección Sede</span>
                        <span className="font-bold text-slate-700 mt-1 block">{formData.direccion} — {formData.ciudad}, {formData.pais}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-extrabold uppercase leading-none">Teléfono</span>
                        <span className="font-bold text-slate-700 mt-1 block">{formData.telefono}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400 font-extrabold uppercase leading-none">Sitio Web</span>
                        <span className="font-bold text-slate-700 mt-1 block">{formData.sitioWeb || 'No especificado'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Visual & Responsibles Box */}
                  <div className="space-y-4">
                    
                    {/* Responsibles Summary */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-3 shadow-3xs text-xs">
                      <h3 className="text-[11px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <User className="w-4 h-4" />
                        <span>Responsables Asignados</span>
                      </h3>

                      <div className="space-y-2.5">
                        <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Representante Legal</span>
                            <span className="font-extrabold text-slate-800 mt-0.5 block">{formData.representanteLegal}</span>
                          </div>
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black px-2 py-0.5 rounded-md border border-indigo-150 uppercase tracking-widest shrink-0 max-w-[120px] truncate">
                            {formData.cargoRepresentante}
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <div>
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">Responsable Informe</span>
                            <span className="font-extrabold text-slate-800 mt-0.5 block">{formData.responsableInforme}</span>
                          </div>
                          <span className="text-[10px] bg-blue-50 text-blue-700 font-black px-2 py-0.5 rounded-md border border-blue-150 uppercase tracking-widest shrink-0 max-w-[120px] truncate">
                            {formData.cargoResponsable}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Branding Identity Check */}
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-3xs text-xs flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-slate-150 flex items-center justify-center overflow-hidden bg-slate-50 p-1 shrink-0">
                          {formData.logo ? (
                            <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                          ) : (
                            <Building className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-800">Marca y Eslogan</p>
                          <p className="text-[10px] text-slate-500 font-medium italic mt-0.5">"{formData.eslogan || 'People & Insight'}"</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="flex flex-col items-center">
                          <span className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: formData.colorPrimario }} />
                          <span className="text-[8px] text-slate-400 font-semibold mt-1">Primario</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="w-5 h-5 rounded-full border border-white shadow-xs" style={{ backgroundColor: formData.colorSecundario }} />
                          <span className="text-[8px] text-slate-400 font-semibold mt-1">Secundario</span>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

                {/* Final Success Banner */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex gap-3 text-emerald-950 text-xs font-medium">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-extrabold text-emerald-900">¡Listo para guardar la configuración!</p>
                    <p className="text-emerald-700/90 leading-relaxed font-semibold">
                      Al presionar **"Finalizar"**, los datos corporativos, logotipos y firmas de la empresa se registrarán localmente de manera segura. Se habilitarán de forma inmediata las pestañas del Sistema de Control Analítico de SG-SST y la Biblioteca Inteligente de Documentos.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Wizard Footer Actions */}
          <div className="mt-8 pt-4 border-t border-slate-200/60 flex items-center justify-between shrink-0">
            <div>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
              ) : (
                <div className="w-10" />
              )}
            </div>

            <div className="flex gap-2">
              {step < 5 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Siguiente</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalize}
                  className="px-6 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Finalizar</span>
                </button>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
