import React from 'react';
import { 
  Brain, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Lock, 
  Info,
  Sliders,
  Scale
} from 'lucide-react';
import { ExecutiveInsight, CentroEjecutivoTab } from '../types/centroEjecutivo.types';

interface InteligenciaIaTabProps {
  insights: ExecutiveInsight[];
  onNavigateTab: (tab: CentroEjecutivoTab) => void;
}

export const InteligenciaIaTab: React.FC<InteligenciaIaTabProps> = ({
  insights,
  onNavigateTab
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Inteligencia Estratégica
              </span>
              <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 rounded-md text-[10px] font-bold border border-amber-500/30">
                HITL Obligatorio
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              ¿Qué Debería Mirar Hoy la Dirección?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Síntesis contextual generada a partir de los patrones matemáticos del censo, ausentismo y salud organizacional.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-3.5 text-right shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Gobernanza Ética
            </span>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5 justify-end">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Consultivo
            </span>
          </div>
        </div>

        {/* Mandatory Human in the loop banner */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 text-amber-200 text-xs leading-relaxed">
          <Scale className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Recomendación consultiva — requiere validación humana:</strong> Conforme al Principio P10 de Gobernanza Ética de IA, los agentes inteligentes no ejecutan sanciones, despidos, contrataciones ni diagnósticos médicos autónomos. Todas las recomendaciones son insumos para la decisión del profesional humano competente.
          </div>
        </div>
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins) => (
          <div 
            key={ins.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-indigo-300 transition-all flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {ins.categoria}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  ins.prioridad === 'ALTA'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : ins.prioridad === 'MEDIA'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  Prioridad {ins.prioridad}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {ins.titulo}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {ins.resumen}
              </p>

              {ins.contextoIndicador && (
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Contexto Métrico:</span>
                  <p className="font-semibold text-slate-800">{ins.contextoIndicador}</p>
                </div>
              )}

              <div className="text-xs text-slate-500 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Evidencia Real:</span>
                <p className="font-medium text-slate-700">{ins.evidenciaReal}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-900">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-0.5">Sugerencia Operativa:</span>
                <p className="font-semibold">{ins.sugerenciaAccion}</p>
              </div>

              <button
                onClick={() => onNavigateTab(ins.moduloDestino as any || 'resumen')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explorar en módulo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
