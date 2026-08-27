import React from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Calendar,
  Zap
} from 'lucide-react';
import { ImplementationHealthScore } from '../../onboarding/types/onboarding.types';
import { CentroEjecutivoTab } from '../types/centroEjecutivo.types';

interface HealthScoreTabProps {
  healthScore: ImplementationHealthScore;
  onNavigateTab: (tab: CentroEjecutivoTab) => void;
}

export const HealthScoreTab: React.FC<HealthScoreTabProps> = ({
  healthScore,
  onNavigateTab
}) => {
  const scoreTotal = healthScore.scoreTotal ?? 0;
  const aspectosMejora = healthScore.componentes.filter(c => c.puntajeObtenido < 100);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner with Score Gauge and Status */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center font-black text-2xl shrink-0 shadow-lg ${
            scoreTotal >= 80 
              ? 'bg-emerald-600 text-white shadow-emerald-200' 
              : scoreTotal >= 60 
              ? 'bg-amber-600 text-white shadow-amber-200' 
              : 'bg-rose-600 text-white shadow-rose-200'
          }`}>
            {scoreTotal}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Health Score de Activación Institucional
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                scoreTotal >= 80 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : scoreTotal >= 60 
                  ? 'bg-amber-50 text-amber-700 border-amber-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                Estado: {healthScore.estado}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {healthScore.interpretacion}
            </p>
          </div>
        </div>

        {/* Honest Trend Badge: Explicit "Sin histórico suficiente" */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left sm:text-right shrink-0 w-full lg:w-auto space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Tendencia Histórica:
          </span>
          <div className="flex items-center lg:justify-end gap-2 text-xs font-bold text-slate-600">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Sin histórico suficiente</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            Línea base inicial (Fase 9 en curso)
          </span>
        </div>
      </div>

      {/* 7 Components Detailed Breakdown Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Desglose Oficial por Componente</h3>
            <p className="text-xs text-slate-500">Ponderaciones contractuales sobre 100 puntos totales</p>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            {healthScore.componentes.length} Componentes Auditados
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthScore.componentes.map((c) => (
            <div 
              key={c.id} 
              className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{c.nombre}</h4>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Peso: {c.pesoPct}% | Ponderado: {c.puntajePonderado} pts
                  </span>
                </div>

                <span className={`text-lg font-black ${
                  c.puntajeObtenido >= 80 ? 'text-emerald-600' : c.puntajeObtenido >= 50 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {c.puntajeObtenido}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200/70 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    c.puntajeObtenido >= 80 ? 'bg-emerald-500' : c.puntajeObtenido >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${c.puntajeObtenido}%` }}
                />
              </div>

              {/* Real Evidence */}
              <div className="bg-white border border-slate-200/60 rounded-xl p-2.5 text-xs text-slate-600 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Evidencia Real:</span>
                <p className="font-semibold text-slate-800 leading-relaxed">{c.evidenciaReal}</p>
              </div>

              {/* Recommendation */}
              {c.recomendacion && c.puntajeObtenido < 100 && (
                <div className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{c.recomendacion}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Aspects that have room for improvement */}
      {aspectosMejora.length > 0 && (
        <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Oportunidades de Optimización & Acciones Recomendadas
              </h3>
              <p className="text-xs text-slate-600">
                Plan de priorización técnica para alcanzar el 100% de madurez institucional
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {aspectosMejora.map((item) => (
              <div key={item.id} className="bg-white border border-amber-200 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{item.nombre}</h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                    Avance: {item.puntajeObtenido}%
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Evidencia:</strong> {item.evidenciaReal}
                </p>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-700">💡 {item.recomendacion}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
