import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  AlertCircle, 
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Building2,
  Users,
  BarChart3,
  FileSpreadsheet
} from 'lucide-react';
import { onboardingService } from '../services/onboardingService';
import { ActivationChecklistSummary } from '../types/onboarding.types';

interface ActivationChecklistProps {
  activeCompanyId: string;
  onNavigateStep: (stepNumber: number) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const ActivationChecklist: React.FC<ActivationChecklistProps> = ({
  activeCompanyId,
  onNavigateStep,
  onNavigateSection
}) => {
  const summary: ActivationChecklistSummary = onboardingService.getActivationChecklist(activeCompanyId);
  const pendingCount = summary.totalItems - summary.completados;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Checklist de Activación
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tu plataforma está al <span className="text-indigo-600">{summary.porcentajeAvance}%</span>
          </h2>
          <p className="text-sm text-slate-500 max-w-xl">
            {summary.completados} de {summary.totalItems} hitos esenciales completados para la puesta en marcha de la empresa.
          </p>
        </div>

        {/* Progress Circular / Ring presentation */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shrink-0">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-indigo-200">
            {summary.porcentajeAvance}%
          </div>
          <div className="text-xs space-y-1">
            <div className="font-bold text-slate-800">
              {summary.porcentajeAvance === 100 ? '🟢 Activación Completa' : summary.porcentajeAvance >= 50 ? '🟡 En Progreso' : '🔴 Inicial'}
            </div>
            <div className="text-slate-500">{pendingCount} pasos restantes</div>
          </div>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {summary.items.map((item, idx) => (
          <div 
            key={item.id}
            className={`p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
              item.completado ? 'bg-emerald-50/20' : 'hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-4 flex-1">
              <div className="shrink-0 mt-0.5">
                {item.completado ? (
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                    <Circle className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h4 className={`text-base font-bold ${item.completado ? 'text-slate-900' : 'text-slate-700'}`}>
                    {idx + 1}. {item.titulo}
                  </h4>
                  {item.requeridoParaSiguiente && (
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md">
                      Obligatorio
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {item.descripcion}
                </p>
                {item.evidencia && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg mt-1">
                    <span>Evidencia: {item.evidencia}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="shrink-0 w-full sm:w-auto flex justify-end">
              <button
                onClick={() => {
                  onNavigateStep(Math.min(idx + 1, 7));
                }}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  item.completado
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                }`}
              >
                {item.completado ? 'Revisar / Modificar' : 'Completar Paso'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
