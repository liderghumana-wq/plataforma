import React, { useState, useEffect } from 'react';
import { 
  Smile, 
  Sparkles, 
  Activity, 
  HeartHandshake, 
  ShieldAlert, 
  FileText, 
  Settings, 
  Building, 
  ArrowRight, 
  Users, 
  Calendar, 
  Clock, 
  ChevronRight, 
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  TrendingUp,
  X,
  Target,
  SmilePlus,
  ArrowUpRight,
  Info,
  Database,
  Brain,
  UploadCloud
} from 'lucide-react';
import { DemographicsData } from '../types';
import { useEmpresa } from '../modules/configuracion/useEmpresa';

interface HomeDashboardProps {
  data: DemographicsData | null;
  onNavigate: (tab: string) => void;
  uploadedFile: { name: string; size: string; date: string } | null;
  onSwitchToExecutive?: () => void;
}

export default function HomeDashboard({ data, onNavigate, uploadedFile, onSwitchToExecutive }: HomeDashboardProps) {
  const { config } = useEmpresa();
  const companyName = config.nombreEmpresa || 'Mi Empresa';
  const logoUrl = config.logo;
  const responsableName = config.responsableInforme || 'Responsable SG-SST';
  const nit = config.nit || '901.432.889-4';
  const sector = config.sectorEconomico || 'Servicios de Tecnología / Contact Center';

  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [showClimateModal, setShowClimateModal] = useState(false);
  const [time, setTime] = useState(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));

  // Live timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Welcome message based on hour
  useEffect(() => {
    const currentHour = new Date().getHours();
    let salutation = '¡Hola';
    
    if (currentHour >= 5 && currentHour < 12) {
      salutation = '¡Buenos días';
    } else if (currentHour >= 12 && currentHour < 18) {
      salutation = '¡Buenas tardes';
    } else {
      salutation = '¡Buenas noches';
    }

    const shortName = responsableName ? responsableName.split(' ')[0] : 'Colaborador';
    setWelcomeMessage(`${salutation}, ${shortName}! 👋`);
  }, [responsableName]);

  const currentDate = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in py-2">
      
      {/* 1. SECCIÓN DE BIENVENIDA DINÁMICA */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[35%] h-full bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3.5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/15 text-cyan-300 border border-cyan-400/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>Consola Operativa — Insight People IA</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight leading-none text-white">
              {welcomeMessage}
            </h1>
            
            <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-2xl">
              Bienvenido al portal inteligente **Insight People IA** para la gestión activa de {companyName}. Monitorea el bienestar de tus colaboradores, audita cumplimiento normativo y genera planes con IA.
            </p>
          </div>

          {/* Acciones y Widgets de Cabezote */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-4 shrink-0 items-stretch sm:items-center md:items-stretch">
            {onSwitchToExecutive && (
              <button
                onClick={onSwitchToExecutive}
                className="px-4 py-2.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/20 hover:border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Ver Dashboard Ejecutivo</span>
                <ArrowRight className="w-4 h-4 text-cyan-300" />
              </button>
            )}

            {/* Fecha / Hora widget */}
            <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-black uppercase tracking-widest mb-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>Fecha Actual</span>
              </div>
              <p className="text-xs font-bold text-slate-200 capitalize">{currentDate}</p>
              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-center gap-1.5 text-slate-400 text-xs font-mono font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{time} COT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THE 8 SPECIFIC CARDS (Al iniciar mostrar tarjetas con...) */}
      <div className="space-y-4">
        <div className="text-left">
          <h2 className="text-base font-black text-slate-900 font-display uppercase tracking-wider text-indigo-600">
            Resumen General de Control (KPIs)
          </h2>
          <p className="text-xs text-slate-500">Métricas esenciales en tiempo real de tu espacio de trabajo corporativo.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Total colaboradores */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs text-left flex flex-col justify-between min-h-[125px]">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[9px] uppercase font-black tracking-wider">Total Colaboradores</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2">
              <p className="text-3xl font-black text-slate-900 font-mono leading-none">
                {data ? data.totalEmployees : 482}
              </p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Nómina Activa</p>
            </div>
          </div>

          {/* Card 2: Estado análisis */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs text-left flex flex-col justify-between min-h-[125px]">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[9px] uppercase font-black tracking-wider">Estado Análisis</span>
              <Activity className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="mt-2">
              <p className="text-xl font-black text-slate-900 leading-none">
                {data ? 'Completado' : 'Sin Cargar'}
              </p>
              <p className="text-[10px] text-slate-400 font-bold mt-1.5">Diagnóstico Inteligente</p>
            </div>
          </div>

          {/* Card 3: Última carga */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs text-left flex flex-col justify-between min-h-[125px]">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[9px] uppercase font-black tracking-wider">Última Carga</span>
              <Database className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2">
              <p className="text-xs font-black text-slate-800 leading-tight truncate" title={uploadedFile ? uploadedFile.name : 'Base por defecto'}>
                {uploadedFile ? uploadedFile.name : 'Base demo activa'}
              </p>
              <p className="text-[9px] text-slate-400 font-mono mt-1">
                {uploadedFile ? uploadedFile.date : 'Sincronizado'}
              </p>
            </div>
          </div>

          {/* Card 4: Cantidad de módulos */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs text-left flex flex-col justify-between min-h-[125px]">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[9px] uppercase font-black tracking-wider">Módulos SaaS</span>
              <Settings className="w-4 h-4 text-indigo-500" />
            </div>
            <div className="mt-2">
              <p className="text-3xl font-black text-slate-900 font-mono leading-none">11</p>
              <p className="text-[10px] text-indigo-600 font-bold mt-1">Módulos Activos</p>
            </div>
          </div>

          {/* Card 5: Nivel de riesgo */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs text-left flex flex-col justify-between min-h-[125px]">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[9px] uppercase font-black tracking-wider">Nivel de Riesgo</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="mt-2">
              <p className="text-xl font-black text-slate-900 leading-none">Bajo - Medio</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1.5">Segmentación Estable</p>
            </div>
          </div>

          {/* Card 6: Estado IA */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs text-left flex flex-col justify-between min-h-[125px]">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[9px] uppercase font-black tracking-wider">Estado IA</span>
              <Brain className="w-4 h-4 text-indigo-500 animate-pulse" />
            </div>
            <div className="mt-2">
              <p className="text-xl font-black text-slate-900 leading-none">Activo</p>
              <p className="text-[10px] text-indigo-600 font-bold mt-1.5">Gemini Engine Sync</p>
            </div>
          </div>

          {/* Card 7: Último informe */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs text-left flex flex-col justify-between min-h-[125px]">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[9px] uppercase font-black tracking-wider">Último Informe</span>
              <FileText className="w-4 h-4 text-cyan-500" />
            </div>
            <div className="mt-2">
              <p className="text-xs font-black text-slate-800 truncate">SST & Clima General</p>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Listo para PDF</p>
            </div>
          </div>

          {/* Card 8: Botón cargar nueva base */}
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-3xl border border-indigo-200/60 shadow-xs text-left flex flex-col justify-between min-h-[125px]">
            <div className="flex justify-between items-center text-indigo-600">
              <span className="text-[9px] uppercase font-black tracking-wider">Base de Datos</span>
              <UploadCloud className="w-4.5 h-4.5" />
            </div>
            <div className="mt-2">
              <button
                onClick={() => onNavigate('analisis')}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer text-center"
              >
                Cargar nueva base
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. GRID DE TARJETAS DE ACCESO RÁPIDO */}
      <div className="space-y-4">
        <div className="text-left">
          <h2 className="text-base font-black text-slate-900 font-display uppercase tracking-wider text-indigo-600">
            Módulos de Acceso Rápido
          </h2>
          <p className="text-xs text-slate-500">Ingresa de forma inmediata a las principales áreas funcionales del sistema.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: Caracterización */}
          <div className="bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-indigo-200 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-2xs hover:shadow-md text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  <Users className="w-6 h-6" />
                </div>
                <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  SG-SST Activo
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">Caracterización</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1.5">
                  Análisis demográfico detallado, pirámide poblacional, distribución por cargos, sedes, escolaridad y dimensiones integrales del personal.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-indigo-600 font-bold group-hover:underline flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('analisis')}>
                <span>Ingresar Módulo</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-[10px] text-slate-400 font-mono font-bold">17 variables</span>
            </div>
          </div>

          {/* Card 2: Clima Organizacional */}
          <div className="bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-indigo-200 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-2xs hover:shadow-md text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl group-hover:bg-cyan-600 group-hover:text-white transition-all">
                  <SmilePlus className="w-6 h-6" />
                </div>
                <span className="bg-cyan-50 text-cyan-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Interactiva
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">Clima Organizacional</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1.5">
                  Estudio de ambiente de trabajo, satisfacción laboral, pertenencia organizacional e índice eNPS para control de la experiencia del talento humano.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => setShowClimateModal(true)}
                className="text-xs text-indigo-600 font-bold group-hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Diagnóstico</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-indigo-500" />
              </button>
              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-wider">Estructura Lista</span>
            </div>
          </div>

          {/* Card 3: Bienestar */}
          <div className="bg-white hover:bg-slate-50 border border-slate-200/60 hover:border-indigo-200 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-2xs hover:shadow-md text-left">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <span className="bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Campañas Activas
                </span>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">Bienestar</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1.5">
                  Plan estratégico de bienestar e intervención, retos de hábitos saludables (retos deportivos, nutrición, etc.) y asignación de responsabilidades.
                </p>
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-indigo-600 font-bold group-hover:underline flex items-center gap-1 cursor-pointer" onClick={() => onNavigate('planes_accion')}>
                <span>Planificar Programas</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="text-[10px] text-rose-500 font-bold">Nutrición & Ergonomía</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. MODAL INTERACTIVO DE CLIMA */}
      {showClimateModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up text-left">
            
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-500/20 text-cyan-300 rounded-xl border border-cyan-400/20">
                  <SmilePlus className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base font-display">Clima Organizacional — Vista Previa</h3>
                  <p className="text-[10px] text-slate-300 font-medium">Estructura interactiva de medición de Clima y eNPS para {companyName}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowClimateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-3 text-indigo-800 text-xs font-semibold">
                <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-indigo-950 font-black">Módulo Estructurado Exitosamente</p>
                  <p className="text-slate-600 font-medium mt-1 leading-relaxed">
                    Las encuestas y el procesamiento matemático de satisfacción, comunicación y liderazgo están estructurados para conectarse directamente con la base de datos de colaboradores.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Climate Score Global</span>
                  <div className="text-3xl font-black text-indigo-600 font-mono mt-1">84.2 / 100</div>
                  <span className="inline-block px-2 py-0.5 mt-2 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded-full">Clima Favorable</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Índice eNPS</span>
                  <div className="text-3xl font-black text-cyan-600 font-mono mt-1">+42</div>
                  <span className="inline-block px-2 py-0.5 mt-2 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase rounded-full">Excelente (Promotores)</span>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center">
                  <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Tasa de Participación</span>
                  <div className="text-3xl font-black text-emerald-600 font-mono mt-1">91.4%</div>
                  <span className="inline-block px-2 py-0.5 mt-2 bg-slate-200 text-slate-700 text-[9px] font-black uppercase rounded-full">1,133 Encuestas</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 p-5 flex justify-end gap-3">
              <button 
                onClick={() => setShowClimateModal(false)}
                className="px-5 py-2.5 bg-slate-200 text-slate-800 text-xs font-extrabold rounded-xl hover:bg-slate-250 transition-colors cursor-pointer"
              >
                Cerrar Vista Previa
              </button>
              <button 
                onClick={() => {
                  setShowClimateModal(false);
                  onNavigate('clima_dashboard');
                }}
                className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-extrabold rounded-xl hover:bg-indigo-700 flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
              >
                <span>Ir al Dashboard de Clima</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
