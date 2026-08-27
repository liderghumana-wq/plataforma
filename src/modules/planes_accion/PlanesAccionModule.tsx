import React, { useState } from 'react';
import { 
  Layers, 
  BarChart3, 
  Table as TableIcon, 
  HeartHandshake, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Plus, 
  Filter, 
  RefreshCw,
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { 
  PlanAccionItem, 
  NuevoPlanPayload, 
  UserSessionInfo 
} from './types/planesAccion.types';
import { planesAccionService } from './services/planesAccionService';
import { DashboardEficaciaSST } from './components/DashboardEficaciaSST';
import { MatrizPlanesAccion } from './components/MatrizPlanesAccion';
import { ModalCrearEditarPlan } from './components/ModalCrearEditarPlan';
import { ModalDetallePlan } from './components/ModalDetallePlan';
import { useEmpresa } from '../configuracion/useEmpresa';

// Reutilización armónica de sub-componentes existentes de bienestar y plan anual
import PlanBienestarTab from '../../components/PlanBienestarTab';
import PlanAccionInteligenteTab from '../../components/PlanAccionInteligenteTab';
import AnnualPlanSection from '../../components/AnnualPlanSection';
import { Recommendation, DemographicsData } from '../../types';

interface PlanesAccionModuleProps {
  onNavigateSection?: (sectionId: string) => void;
  activeCompanyId?: string;
  analysisData?: DemographicsData | null;
  recommendations?: Recommendation[];
  onToggleStatus?: (id: string) => void;
  onAddRecommendation?: (rec: any) => void;
}

type PlanesSubTab = 'dashboard' | 'matriz' | 'recomendaciones_ia' | 'bienestar' | 'plan_anual';

export const PlanesAccionModule: React.FC<PlanesAccionModuleProps> = ({
  onNavigateSection,
  activeCompanyId: propCompanyId,
  analysisData = null,
  recommendations = [],
  onToggleStatus,
  onAddRecommendation
}) => {
  const { activeCompanyId } = useEmpresa();
  const companyId = propCompanyId || activeCompanyId || 'demo_company';

  const [activeTab, setActiveTab] = useState<PlanesSubTab>('dashboard');
  const [selectedPlan, setSelectedPlan] = useState<PlanAccionItem | null>(null);
  const [isNuevoModalOpen, setIsNuevoModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<PlanAccionItem | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const currentUser: UserSessionInfo = {
    nombre: 'Líder SG-SST',
    rol: 'LÍDER_SST',
    email: 'lider.sst@empresa.com'
  };

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
    if (selectedPlan) {
      const updated = planesAccionService.getPlanById(companyId, selectedPlan.id);
      setSelectedPlan(updated);
    }
  };

  const planes = planesAccionService.getPlanes(companyId);
  const metricas = planesAccionService.getMetricas(companyId);
  const indicadoresDisponibles = planesAccionService.getIndicadoresDisponiblesParaEficacia(companyId);

  const handleCrearPlan = (payload: NuevoPlanPayload) => {
    const nuevo = planesAccionService.crearPlan(companyId, payload, currentUser);
    refreshData();
    setSelectedPlan(nuevo);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-left">
      
      {/* 1. HEADER DEL MÓDULO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-wider border border-indigo-200">
              Módulo Central de Mejora Continua (Fase 10)
            </span>
            <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-mono font-bold">
              Tenant: {companyId}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 font-display tracking-tight">
            Gestión de Acciones, Planes de Mejora & Eficacia SG-SST
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
            Ciclo completo e integrado: <strong>Hallazgo / Alerta → Causa Raíz → Ejecución → Evidencia → Verificación de Eficacia (HITL) → Cierre.</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              setPlanToEdit(null);
              setIsNuevoModalOpen(true);
            }}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Plan de Acción</span>
          </button>

          <button
            onClick={refreshData}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200"
            title="Refrescar datos del tenant"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. BARRA DE SUB-PESTAÑAS DE NAVEGACIÓN */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs flex gap-1.5 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Tablero de Eficacia', icon: BarChart3 },
          { id: 'matriz', label: 'Matriz & Kanban de Planes', icon: Layers },
          { id: 'recomendaciones_ia', label: 'Recomendaciones Inteligentes IA', icon: Bot },
          { id: 'bienestar', label: 'Bienestar & Intervención', icon: HeartHandshake },
          { id: 'plan_anual', label: 'Plan Anual SG-SST', icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as PlanesSubTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. CONTENIDO DINÁMICO POR SUB-PESTAÑA */}
      {activeTab === 'dashboard' && (
        <DashboardEficaciaSST
          metricas={metricas}
          planes={planes}
          onSelectPlan={(plan) => setSelectedPlan(plan)}
          onOpenNuevoModal={() => {
            setPlanToEdit(null);
            setIsNuevoModalOpen(true);
          }}
          onNavigateTab={(tab) => setActiveTab(tab as PlanesSubTab)}
        />
      )}

      {activeTab === 'matriz' && (
        <MatrizPlanesAccion
          planes={planes}
          onSelectPlan={(plan) => setSelectedPlan(plan)}
          onOpenNuevoModal={() => {
            setPlanToEdit(null);
            setIsNuevoModalOpen(true);
          }}
          companyId={companyId}
        />
      )}

      {activeTab === 'recomendaciones_ia' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <PlanAccionInteligenteTab data={analysisData} />
        </div>
      )}

      {activeTab === 'bienestar' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <PlanBienestarTab
            recommendations={recommendations}
            onToggleStatus={onToggleStatus || (() => {})}
            onAddRecommendation={onAddRecommendation || (() => {})}
          />
        </div>
      )}

      {activeTab === 'plan_anual' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
          <AnnualPlanSection data={analysisData} />
        </div>
      )}

      {/* MODALES */}
      <ModalCrearEditarPlan
        isOpen={isNuevoModalOpen}
        onClose={() => setIsNuevoModalOpen(false)}
        onGuardar={handleCrearPlan}
        companyId={companyId}
        planEditar={planToEdit}
      />

      <ModalDetallePlan
        isOpen={!!selectedPlan}
        plan={selectedPlan}
        onClose={() => setSelectedPlan(null)}
        companyId={companyId}
        onRefresh={refreshData}
        currentUser={currentUser}
        indicadoresDisponibles={indicadoresDisponibles}
      />

    </div>
  );
};
