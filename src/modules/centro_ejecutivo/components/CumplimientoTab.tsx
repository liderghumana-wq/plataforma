import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  FileCheck2, 
  ArrowRight, 
  Layers 
} from 'lucide-react';
import { onboardingService } from '../../onboarding/services/onboardingService';
import { CentroEjecutivoTab } from '../types/centroEjecutivo.types';

interface CumplimientoTabProps {
  activeCompanyId: string;
  onNavigateTab: (tab: CentroEjecutivoTab) => void;
}

export const CumplimientoTab: React.FC<CumplimientoTabProps> = ({
  activeCompanyId,
  onNavigateTab
}) => {
  const stages = onboardingService.getImplementationStages(activeCompanyId);
  const checklist = onboardingService.getActivationChecklist(activeCompanyId);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 mb-2 border border-indigo-100">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Matriz de Cumplimiento Normativo SG-SST</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Estado de Implementación & Requisitos Legales
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Seguimiento a los estándares del Decreto 1072 de 2015 y la Resolución 0312 de 2019.
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl sm:text-3xl font-black text-emerald-600">
            {checklist.porcentajeAvance}%
          </span>
          <span className="text-xs text-slate-400 block font-semibold">
            {checklist.completados} de {checklist.totalItems} hitos completados
          </span>
        </div>
      </div>

      {/* 9 Stages Timeline Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          Ruta de Madurez SG-SST (9 Etapas Oficiales)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stages.map((stage) => (
            <div 
              key={stage.id}
              className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                stage.status === 'COMPLETADO'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : stage.status === 'EN_PROGRESO'
                  ? 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                  : 'bg-slate-50 border-slate-200/80 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                  Etapa {stage.order}
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  stage.status === 'COMPLETADO'
                    ? 'bg-emerald-100 text-emerald-800'
                    : stage.status === 'EN_PROGRESO'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {stage.status}
                </span>
              </div>

              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                {stage.nombre}
              </h4>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                {stage.descripcion}
              </p>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span>Evidencia:</span>
                <span className="font-bold text-slate-900 truncate max-w-[140px] text-right">{stage.evidencia}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activation Checklist */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Checklist de Requisitos para Entrada en Producción
        </h3>

        <div className="divide-y divide-slate-100">
          {checklist.items.map((item) => (
            <div key={item.id} className="py-3.5 flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {item.completado ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.titulo}</h4>
                  <p className="text-xs text-slate-500">{item.descripcion}</p>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                item.completado ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
              }`}>
                {item.completado ? 'Completado' : 'Pendiente'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
