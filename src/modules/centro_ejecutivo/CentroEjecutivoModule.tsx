import React, { useState } from 'react';
import { 
  Activity, 
  BarChart3, 
  ShieldAlert, 
  ShieldCheck, 
  FileCheck2, 
  Clock, 
  Sparkles, 
  Cpu, 
  TrendingUp, 
  LayoutDashboard,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { 
  CentroEjecutivoTab, 
  RolePerspective 
} from './types/centroEjecutivo.types';
import { centroEjecutivoService } from './services/centroEjecutivoService';
import { alertasService } from './services/alertasService';
import { accionesService } from './services/accionesService';
import { ExecutiveHeader } from './components/ExecutiveHeader';
import { ResumenEjecutivoTab } from './components/ResumenEjecutivoTab';
import { HealthScoreTab } from './components/HealthScoreTab';
import { IndicadoresSstTab } from './components/IndicadoresSstTab';
import { RiesgosPrioritariosTab } from './components/RiesgosPrioritariosTab';
import { CalidadDatosTab } from './components/CalidadDatosTab';
import { CumplimientoTab } from './components/CumplimientoTab';
import { AccionesPendientesTab } from './components/AccionesPendientesTab';
import { InteligenciaIaTab } from './components/InteligenciaIaTab';
import { LicenciamientoCapacidadTab } from './components/LicenciamientoCapacidadTab';
import { TendenciasTab } from './components/TendenciasTab';
import { AlertasPanel } from './components/AlertasPanel';

interface CentroEjecutivoModuleProps {
  activeCompanyId: string;
  onNavigateSection?: (sectionId: string) => void;
}

const TABS: Array<{ id: CentroEjecutivoTab; label: string; icon: any }> = [
  { id: 'resumen', label: 'Resumen Ejecutivo', icon: Compass },
  { id: 'health_score', label: 'Health Score', icon: Activity },
  { id: 'indicadores_sst', label: 'Indicadores SG-SST', icon: BarChart3 },
  { id: 'riesgos', label: 'Riesgos Prioritarios', icon: ShieldAlert },
  { id: 'calidad_datos', label: 'Calidad de Datos', icon: ShieldCheck },
  { id: 'cumplimiento', label: 'Cumplimiento', icon: FileCheck2 },
  { id: 'acciones', label: 'Acciones Pendientes', icon: Clock },
  { id: 'inteligencia_ia', label: 'Inteligencia IA', icon: Sparkles },
  { id: 'licenciamiento', label: 'Licenciamiento', icon: Cpu },
  { id: 'tendencias', label: 'Tendencias', icon: TrendingUp }
];

export const CentroEjecutivoModule: React.FC<CentroEjecutivoModuleProps> = ({
  activeCompanyId,
  onNavigateSection
}) => {
  const [role, setRole] = useState<RolePerspective>('ALTA_DIRECCION');
  const [activeTab, setActiveTab] = useState<CentroEjecutivoTab>('resumen');
  const [alertsModalOpen, setAlertsModalOpen] = useState(false);

  // Consume aggregated data from single source of truth
  const summary = centroEjecutivoService.getResumenEjecutivo(activeCompanyId);
  const insights = centroEjecutivoService.getExecutiveInsights(activeCompanyId);
  const metricasAlertas = alertasService.getMetricasAlertas(activeCompanyId);
  const metricasAcciones = accionesService.getMetricasAcciones(activeCompanyId);
  const roleConfig = centroEjecutivoService.getRoleConfiguration(role);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Executive Header with Quick Stats & Role Switcher */}
      <ExecutiveHeader
        activeCompanyId={activeCompanyId}
        companyName={`Empresa Activa (${activeCompanyId})`}
        role={role}
        setRole={setRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        healthScore={summary.healthScore?.scoreTotal ?? 0}
        qualityScore={summary.qualityDiag.overallQualityScore}
        totalEmployees={summary.totalColaboradores}
        totalAlerts={metricasAlertas.total}
        criticalAlerts={metricasAlertas.criticas}
        openActions={metricasAcciones.pendientes + metricasAcciones.enGestion}
        onOpenAlertsModal={() => setAlertsModalOpen(true)}
      />

      {/* Role Perspective Context Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-indigo-600 block">
            {roleConfig.title}
          </span>
          <p className="text-xs text-slate-500">
            {roleConfig.description}
          </p>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Filtro de Rol Activo:</span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-xs font-mono font-bold">
            {role}
          </span>
        </div>
      </div>

      {/* 10 Navigation Tabs Bar */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto scrollbar-none">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isPrimaryForRole = roleConfig.primaryTabs.includes(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {isPrimaryForRole && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Display */}
      <div className="mt-6">
        {activeTab === 'resumen' && (
          <ResumenEjecutivoTab
            summary={summary}
            onNavigateTab={setActiveTab}
            onOpenAlertsModal={() => setAlertsModalOpen(true)}
          />
        )}

        {activeTab === 'health_score' && (
          <HealthScoreTab
            healthScore={summary.healthScore}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'indicadores_sst' && (
          <IndicadoresSstTab
            activeCompanyId={activeCompanyId}
          />
        )}

        {activeTab === 'riesgos' && (
          <RiesgosPrioritariosTab
            activeCompanyId={activeCompanyId}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'calidad_datos' && (
          <CalidadDatosTab
            diagnostic={summary.qualityDiag}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'cumplimiento' && (
          <CumplimientoTab
            activeCompanyId={activeCompanyId}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'acciones' && (
          <AccionesPendientesTab
            activeCompanyId={activeCompanyId}
            onNavigateSection={onNavigateSection}
          />
        )}

        {activeTab === 'inteligencia_ia' && (
          <InteligenciaIaTab
            insights={insights}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'licenciamiento' && (
          <LicenciamientoCapacidadTab
            activeCompanyId={activeCompanyId}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'tendencias' && (
          <TendenciasTab
            activeCompanyId={activeCompanyId}
            onNavigateTab={setActiveTab}
          />
        )}
      </div>

      {/* Central Alerts Drawer/Modal */}
      <AlertasPanel
        isOpen={alertsModalOpen}
        onClose={() => setAlertsModalOpen(false)}
        activeCompanyId={activeCompanyId}
      />
    </div>
  );
};
