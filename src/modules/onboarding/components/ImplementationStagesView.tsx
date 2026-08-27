import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  ArrowRight, 
  Layers, 
  Sparkles,
  Building2,
  FileSpreadsheet,
  ShieldCheck,
  ClipboardList,
  BarChart3,
  Cpu,
  FileText,
  CalendarDays,
  Activity
} from 'lucide-react';
import { onboardingService } from '../services/onboardingService';
import { ImplementationStage } from '../types/onboarding.types';

interface ImplementationStagesViewProps {
  activeCompanyId: string;
  onNavigateStep: (stepNumber: number) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const ImplementationStagesView: React.FC<ImplementationStagesViewProps> = ({
  activeCompanyId,
  onNavigateStep,
  onNavigateSection
}) => {
  const stages: ImplementationStage[] = onboardingService.getImplementationStages(activeCompanyId);

  const getStageIcon = (order: number) => {
    switch (order) {
      case 1: return <Building2 className="w-5 h-5" />;
      case 2: return <FileSpreadsheet className="w-5 h-5" />;
      case 3: return <ShieldCheck className="w-5 h-5" />;
      case 4: return <ClipboardList className="w-5 h-5" />;
      case 5: return <BarChart3 className="w-5 h-5" />;
      case 6: return <Cpu className="w-5 h-5" />;
      case 7: return <FileText className="w-5 h-5" />;
      case 8: return <CalendarDays className="w-5 h-5" />;
      case 9: return <Activity className="w-5 h-5" />;
      default: return <Layers className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (status: ImplementationStage['status']) => {
    switch (status) {
      case 'COMPLETADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Completada
          </span>
        );
      case 'EN_PROGRESO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            En Progreso
          </span>
        );
      case 'BLOQUEADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200">
            <Circle className="w-3.5 h-3.5" />
            Bloqueado
          </span>
        );
      case 'PENDIENTE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold border border-slate-200">
            <Circle className="w-3.5 h-3.5" />
            Pendiente
          </span>
        );
    }
  };

  const handleStageClick = (stage: ImplementationStage) => {
    if (stage.order <= 7) {
      onNavigateStep(stage.order);
    } else if (stage.moduloDestino && onNavigateSection) {
      onNavigateSection(stage.moduloDestino);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            Metodología de Despliegue SG-SST
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">9 Etapas del Proceso de Implementación</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Ruta estructurada desde la parametrización básica hasta el seguimiento continuo de indicadores y planes de acción.
          </p>
        </div>

        <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
          [A] Real Lifecycle
        </span>
      </div>

      {/* 9 Stages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stages.map((stage) => {
          const isDone = stage.status === 'COMPLETADO';
          const isCurrent = stage.status === 'EN_PROGRESO';

          return (
            <div 
              key={stage.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                isDone 
                  ? 'bg-emerald-50/20 border-emerald-200' 
                  : isCurrent 
                  ? 'bg-indigo-50/30 border-indigo-300 ring-2 ring-indigo-500/20' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    isDone ? 'bg-emerald-100 text-emerald-700' : isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {getStageIcon(stage.order)}
                  </div>
                  {getStatusBadge(stage.status)}
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Etapa 0{stage.order}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {stage.nombre}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {stage.descripcion}
                  </p>
                  {stage.evidencia && (
                    <div className="text-[11px] text-slate-600 font-medium bg-slate-50 p-1.5 rounded-lg border border-slate-200 mt-2">
                      Evidencia: {stage.evidencia}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleStageClick(stage)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  {isDone ? 'Ver detalles' : 'Abrir etapa'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
