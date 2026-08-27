import React from 'react';
import { 
  ClipboardList, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  Share2, 
  ExternalLink,
  Target,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { onboardingService } from '../services/onboardingService';

interface SurveyStepProps {
  onNext: () => void;
  onPrev: () => void;
  onNavigateToSurvey: () => void;
  activeCompanyId: string;
}

export const SurveyStep: React.FC<SurveyStepProps> = ({ 
  onNext, 
  onPrev, 
  onNavigateToSurvey, 
  activeCompanyId 
}) => {
  const colaboradores = onboardingService.getCompanyColaboradores(activeCompanyId);
  const respuestas = onboardingService.getCompanyRespuestas(activeCompanyId);

  const totalColaboradores = colaboradores.length;
  const totalRespuestas = respuestas.length;
  const coberturaPct = totalColaboradores > 0 ? ((totalRespuestas / totalColaboradores) * 100).toFixed(1) : '0';
  const pendientesCount = Math.max(0, totalColaboradores - totalRespuestas);

  // Status computation
  let status: 'NO_INICIADA' | 'EN_PROGRESO' | 'FINALIZADA' = 'NO_INICIADA';
  let statusBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  let statusLabel = 'No Iniciada';

  if (totalRespuestas === 0) {
    status = 'NO_INICIADA';
    statusLabel = '⚪ No Iniciada';
    statusBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  } else if (Number(coberturaPct) >= 90) {
    status = 'FINALIZADA';
    statusLabel = '🟢 Finalizada / Óptima';
    statusBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else {
    status = 'EN_PROGRESO';
    statusLabel = '🟡 En Progreso';
    statusBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Paso 6 de 7 • Recolección de Datos
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Encuesta Sociodemográfica</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitorea el avance de participación en el formulario sociodemográfico y de condiciones de salud.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${statusBadgeClass}`}>
            {statusLabel}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
            [A] Respuestas Reales
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Población Objetivo</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-3xl font-bold text-slate-900 block">{totalColaboradores}</span>
          <span className="text-xs text-slate-500">Total colaboradores en censo</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Respuestas Recibidas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <span className="text-3xl font-bold text-emerald-600 block">{totalRespuestas}</span>
          <span className="text-xs text-slate-500">Encuestas procesadas</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Porcentaje de Cobertura</span>
            <Target className="w-4 h-4 text-indigo-500" />
          </div>
          <span className="text-3xl font-bold text-indigo-600 block">{coberturaPct}%</span>
          <span className="text-xs text-slate-500">Meta recomendada: ≥80%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Pendientes por Diligenciar</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-3xl font-bold text-slate-900 block">{pendientesCount}</span>
          <span className="text-xs text-slate-500">Colaboradores sin respuesta</span>
        </div>
      </div>

      {/* Progress Bar & Actions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-bold text-slate-800">
            <span>Avance de Campaña Sociodemográfica</span>
            <span>{totalRespuestas} / {totalColaboradores} ({coberturaPct}%)</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-indigo-500 to-indigo-600 rounded-full transition-all"
              style={{ width: `${Math.min(100, Number(coberturaPct))}%` }}
            />
          </div>
        </div>

        {/* Action Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              Acceder al Módulo de Encuestas
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Diligencia encuestas directamente desde la interfaz o visualiza el cuestionario sociodemográfico estandarizado.
            </p>
            <button
              onClick={onNavigateToSurvey}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Abrir Encuesta Sociodemográfica
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-600" />
              Compartir Enlace con Colaboradores
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Los trabajadores pueden responder la encuesta desde cualquier dispositivo móvil o de escritorio sin credenciales complejas.
            </p>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.origin);
                alert('Enlace de recolección copiado al portapapeles.');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
            >
              Copiar Enlace de Encuesta
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Calidad de Datos
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          Siguiente: Indicadores
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
