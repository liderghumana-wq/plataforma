import React from 'react';
import { 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Building2,
  Sliders,
  ChevronDown,
  Brain,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { RolePerspective, CentroEjecutivoTab } from '../types/centroEjecutivo.types';

interface ExecutiveHeaderProps {
  activeCompanyId: string;
  companyName: string;
  role: RolePerspective;
  setRole: (role: RolePerspective) => void;
  activeTab: CentroEjecutivoTab;
  setActiveTab: (tab: CentroEjecutivoTab) => void;
  healthScore: number;
  qualityScore: number;
  totalEmployees: number;
  totalAlerts: number;
  criticalAlerts: number;
  openActions: number;
  onOpenAlertsModal: () => void;
}

const ROLES_LIST: Array<{ id: RolePerspective; label: string; icon: string }> = [
  { id: 'ALTA_DIRECCION', label: 'Alta Dirección', icon: '👑' },
  { id: 'GESTION_HUMANA', label: 'Gestión Humana', icon: '👥' },
  { id: 'SST', label: 'Especialista SG-SST', icon: '🛡️' },
  { id: 'AUDITOR', label: 'Auditor & Control', icon: '⚖️' },
  { id: 'CONSULTOR', label: 'Consultor Externo', icon: '💼' },
  { id: 'USUARIO', label: 'Usuario Asignatario', icon: '👤' }
];

export const ExecutiveHeader: React.FC<ExecutiveHeaderProps> = ({
  activeCompanyId,
  companyName,
  role,
  setRole,
  activeTab,
  setActiveTab,
  healthScore,
  qualityScore,
  totalEmployees,
  totalAlerts,
  criticalAlerts,
  openActions,
  onOpenAlertsModal
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner with Company, Role Switcher and Quick Badges */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Background decorative subtle glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Centro Ejecutivo 360 & Experiencia SaaS
              </span>
              <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-mono border border-slate-700">
                Tenant: {companyName} ({activeCompanyId})
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Consola Ejecutiva Unificada
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Visión holística en tiempo real de salud organizacional, calidad de datos, indicadores normativos y gobernanza ética de IA.
            </p>
          </div>

          {/* Role Perspective Switcher and Alert Trigger */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0 w-full lg:w-auto">
            {/* Role Switcher */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-1.5 flex items-center gap-1 w-full sm:w-auto">
              <span className="text-[11px] font-bold text-slate-400 px-2 uppercase tracking-wider hidden xl:inline">
                Rol:
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RolePerspective)}
                className="bg-slate-900 text-white text-xs font-bold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer w-full sm:w-auto"
              >
                {ROLES_LIST.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.icon} {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Central Alerts Button */}
            <button
              onClick={onOpenAlertsModal}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shrink-0 w-full sm:w-auto ${
                criticalAlerts > 0
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/30 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Alertas Centrales</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-black/30">
                {totalAlerts}
              </span>
            </button>
          </div>
        </div>

        {/* Quick KPI Strip inside Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Health Score</span>
              <span className="text-xl font-black text-white">{healthScore}/100</span>
            </div>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
              healthScore >= 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              healthScore >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {healthScore >= 80 ? 'Óptimo' : healthScore >= 60 ? 'Medio' : 'Crítico'}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Calidad de Datos</span>
              <span className="text-xl font-black text-white">{qualityScore}%</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Censo Poblacional</span>
              <span className="text-xl font-black text-white">{totalEmployees}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-slate-700/60 text-slate-300 border border-slate-600 flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block">Acciones Abiertas</span>
              <span className="text-xl font-black text-amber-400">{openActions}</span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
