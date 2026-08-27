import React from 'react';
import { 
  Home, 
  Users, 
  Activity, 
  Sparkles, 
  HeartHandshake, 
  FileText, 
  Settings, 
  LogOut,
  BarChart3,
  ShieldAlert,
  ClipboardList,
  Building,
  LifeBuoy,
  ShieldCheck,
  Building2,
  Calendar,
  Brain,
  Sliders,
  Database,
  UserCheck,
  Compass,
  Briefcase,
  GitCompare
} from 'lucide-react';
import { useEmpresa } from '../modules/configuracion/useEmpresa';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  uploadedFile: { name: string; size: string; date: string } | null;
  totalEmployees: number;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onLogout,
  uploadedFile,
  totalEmployees
}: SidebarProps) {
  const { config, companies, activeCompanyId, switchCompany } = useEmpresa();
  const companyName = config.nombreEmpresa || 'Mi Empresa';
  const logoUrl = config.logo;
  const responsableName = config.responsableInforme || 'Responsable SG-SST';
  const emailResponsable = config.correo || 'lider.ghumana@innovatechit.com.co';

    {/* Main menu items */}
  const menuItems = [
    { id: 'centro_ejecutivo', label: '👑 Centro Ejecutivo 360', icon: Compass, accent: true },
    { id: 'inicio', label: 'Dashboard', icon: Home },
    { id: 'onboarding', label: '🚀 Onboarding & Activación', icon: Sparkles, accent: true },
    { id: 'encuesta_sociodemografica', label: '📋 Encuesta Sociodemográfica', icon: ClipboardList, accent: true },
    { id: 'constructor_encuestas', label: '🛠️ Constructor de Encuestas', icon: Sliders, accent: true },
    { id: 'validador_excel', label: '📊 Validador de Datos Excel', icon: ShieldCheck, accent: true },
    { id: 'centro_inteligencia', label: 'Centro de Inteligencia', icon: Brain, accent: true },
    { id: 'analisis', label: 'Caracterización Sociodemográfica', icon: Users },
    { id: 'calidad_datos', label: 'Calidad de Datos', icon: ShieldCheck },
    { id: 'clima_dashboard', label: 'Clima Organizacional', icon: Activity, isClimaGroup: true },
    { id: 'mapa_riesgos', label: 'Riesgo Psicosocial', icon: ShieldAlert },
    { id: 'ausentismo', label: 'Ausentismo', icon: Calendar },
    { id: 'indicadores', label: 'Indicadores', icon: BarChart3 },
    { id: 'ia', label: 'IA', icon: Sparkles },
    { id: 'gobernanza_ia', label: '⚖️ Gobernanza de IA', icon: ShieldCheck, accent: true },
    { id: 'estrategia_ia', label: '🎯 Estrategia de IA', icon: Compass, accent: true },
    { id: 'viabilidad_negocio', label: '💼 Viabilidad del Negocio', icon: Briefcase, accent: true },
    { id: 'ia_vs_powerbi', label: '⚡ IA vs. Power BI', icon: GitCompare, accent: true },
    { id: 'administracion_saas', label: '⚙️ Centro de Administración', icon: Settings, accent: true },
    { id: 'planes_accion', label: '🎯 Planes de Acción & Eficacia', icon: ClipboardList, accent: true },
    { id: 'informes', label: 'Informe Ejecutivo', icon: FileText },
    { id: 'admin_empresas', label: '🏢 Admin. de Empresas', icon: Building, accent: true },
    { id: 'colaboradores', label: '👥 Maestro de Colaboradores', icon: UserCheck, accent: true },
    { id: 'admin_usuarios', label: '👥 Admin. de Usuarios & Permisos', icon: UserCheck, accent: true },
    { id: 'arquitectura_datos', label: '🗄️ Modelo de Datos Maestro', icon: Database, accent: true },
    { id: 'configuracion', label: '🏢 Configuración de Empresa', icon: Settings },
    { id: 'ayuda', label: 'Ayuda', icon: LifeBuoy }
  ];

  return (
    <aside id="sidebar" className="w-full md:w-80 bg-slate-900 text-slate-200 flex flex-col justify-between border-r border-slate-800 shrink-0 no-print md:h-[calc(100vh-4rem)] select-none">
      
      {/* Top Section: Logo & Company Switcher */}
      <div className="shrink-0">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain rounded-lg bg-white/10 p-1 border border-white/10" 
                  referrerPolicy="no-referrer" 
                />
              ) : (
                <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-lg shadow-sm shrink-0">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="overflow-hidden text-left">
                <span className="text-[10px] text-indigo-400 font-extrabold tracking-widest uppercase font-sans block">INSIGHT PEOPLE IA</span>
                <span className="text-[8px] text-slate-500 font-bold block leading-none truncate">{companyName}</span>
              </div>
            </div>
            
            <button 
              onClick={onLogout}
              className="text-slate-400 hover:text-rose-400 p-1.5 hover:bg-slate-850 rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Cerrar Sesión SaaS"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* SaaS Multi-company selector */}
          <div className="space-y-1">
            <label className="text-[8px] uppercase font-black text-slate-500 tracking-wider text-left block">
              Entorno de Empresa (SaaS)
            </label>
            <div className="relative">
              <select
                value={activeCompanyId}
                onChange={(e) => switchCompany(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none hover:bg-slate-800 transition-all"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100 text-xs py-2">
                    🏢 {c.nombreEmpresa || `Sin Nombre (${c.id.substring(0, 6)})`}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Scrollable Section: Navigation Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        <nav className="space-y-1 text-left">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Support partial matches for active tab groups (e.g. clima sub-tabs)
            const isSelected = activeTab === item.id || 
              (item.id === 'clima_dashboard' && activeTab.startsWith('clima_')) ||
              (item.id === 'ia' && (activeTab === 'asistente_ia' || activeTab === 'people_copilot_ia' || activeTab === 'ai_engine_showcase' || activeTab === 'inteligencia_predictiva')) ||
              (item.id === 'planes_accion' && (activeTab === 'plan_anual' || activeTab === 'recomendaciones' || activeTab === 'plan')) ||
              (item.id === 'informes' && (activeTab === 'informe' || activeTab === 'biblioteca' || activeTab === 'plantillas')) ||
              (item.id === 'configuracion' && (activeTab === 'config_empresa' || activeTab === 'config' || activeTab === 'administracion'));

            return (
              <button
                key={item.id}
                id={`tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10 font-black'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <Icon className={`w-4 h-4 shrink-0 ${item.accent && !isSelected ? 'text-cyan-400 animate-pulse' : ''}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.accent && (
                  <span className="bg-cyan-400/10 text-cyan-300 text-[8px] px-1 py-0.5 rounded font-black tracking-widest border border-cyan-400/20 shrink-0">
                    IA
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Active User / Footer */}
      <div className="p-4 bg-slate-950/40 border-t border-slate-800 text-[10px] text-slate-500 space-y-1 shrink-0 text-left">
        <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-extrabold uppercase tracking-wider text-[9px] text-slate-400">Canal de Datos Seguro</span>
        </div>
        <p className="font-bold text-slate-300 truncate">{responsableName}</p>
        <p className="truncate" title={emailResponsable}>{emailResponsable}</p>
        <p className="text-[9px] text-slate-600 font-mono truncate">{companyName} v3.0 SaaS</p>
      </div>
    </aside>
  );
}
