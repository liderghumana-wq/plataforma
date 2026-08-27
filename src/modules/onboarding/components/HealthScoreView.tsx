import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  TrendingUp, 
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  Award,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { onboardingService } from '../services/onboardingService';
import { ImplementationHealthScore } from '../types/onboarding.types';

interface HealthScoreViewProps {
  activeCompanyId: string;
  onNavigateStep?: (stepNumber: number) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const HealthScoreView: React.FC<HealthScoreViewProps> = ({
  activeCompanyId,
  onNavigateStep,
  onNavigateSection
}) => {
  const healthData: ImplementationHealthScore = onboardingService.getHealthScore(activeCompanyId);

  const getScoreBadge = () => {
    const score = healthData.scoreTotal || 0;
    if (score >= 85) {
      return {
        label: '🟢 Excelente (Listo para Auditoría)',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        barColor: 'bg-emerald-500'
      };
    }
    if (score >= 70) {
      return {
        label: '🟡 Operativo (Requiere Ajustes)',
        color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        barColor: 'bg-indigo-500'
      };
    }
    if (score >= 40) {
      return {
        label: '🟠 En Riesgo (Datos Incompletos)',
        color: 'text-amber-700 bg-amber-50 border-amber-200',
        barColor: 'bg-amber-500'
      };
    }
    return {
      label: '🔴 Implementación Crítica / Inicial',
      color: 'text-rose-700 bg-rose-50 border-rose-200',
      barColor: 'bg-rose-500'
    };
  };

  const badge = getScoreBadge();

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white border border-indigo-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-xs font-semibold uppercase tracking-wider text-indigo-300">
              <Award className="w-3.5 h-3.5" />
              Índice de Madurez de Implementación
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Health Score: <span className="text-indigo-400">{healthData.scoreTotal ?? 'N/A'}</span> / 100
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              {healthData.interpretacion}
            </p>
            <div className="pt-2">
              <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
          </div>

          {/* Big Score Gauge */}
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center justify-center shrink-0 w-full md:w-56 text-center">
            <div className="text-5xl font-black tracking-tight text-indigo-400">
              {healthData.scoreTotal ?? 0}%
            </div>
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold mt-1">Health Score</span>
            <div className="w-full h-2.5 bg-white/10 rounded-full mt-4 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${badge.barColor}`}
                style={{ width: `${healthData.scoreTotal || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown by 7 Components */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Desglose Ponderado de Componentes (7 Criterios)</h3>
            <p className="text-xs text-slate-500">Cálculo 100% dinámico basado en evidencias reales del sistema</p>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Suma Ponderada: 100%
          </span>
        </div>

        <div className="space-y-3">
          {healthData.componentes.map((comp, idx) => {
            const isFull = comp.puntajeObtenido === 100;
            const isPartial = comp.puntajeObtenido > 0 && comp.puntajeObtenido < 100;

            return (
              <div 
                key={comp.id} 
                className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    isFull ? 'bg-emerald-100 text-emerald-700' : isPartial ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {idx + 1}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">{comp.nombre}</h4>
                      <span className="text-xs font-medium text-slate-400">({comp.pesoPct}% peso)</span>
                    </div>
                    <div className="text-[11px] font-semibold text-slate-600 bg-white inline-block px-2.5 py-0.5 rounded-md border border-slate-200 mt-1">
                      Evidencia: {comp.evidenciaReal}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">{comp.recomendacion}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-slate-900">
                      {comp.puntajePonderado} <span className="text-slate-400 font-normal">/ {comp.pesoPct} pts</span>
                    </span>
                    <div className="text-[10px] text-slate-400">({comp.puntajeObtenido}/100)</div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                    comp.estado === 'COMPLETO' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : comp.estado === 'PARCIAL' 
                      ? 'bg-amber-50 text-amber-700 border-amber-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {comp.estado}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations & Action Plan */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Recomendaciones del Motor de Activación</h3>
            <p className="text-xs text-slate-500">Pasos prioritarios para optimizar la salud de la implementación</p>
          </div>
        </div>

        <div className="space-y-2.5 pt-2">
          {healthData.componentes.map((comp, i) => (
            <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900">{comp.nombre}</div>
                <div className="text-xs text-slate-600 leading-relaxed">{comp.recomendacion}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
