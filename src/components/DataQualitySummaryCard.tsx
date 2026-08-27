import React, { useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight,
  Database,
  Sparkles
} from 'lucide-react';
import { DemographicsData } from '../types';
import { calculateQualityMetrics } from '../utils/dataQualityCalculator';

interface DataQualitySummaryCardProps {
  data: DemographicsData | null;
  onNavigateToQualityTab: () => void;
}

export default function DataQualitySummaryCard({ 
  data, 
  onNavigateToQualityTab 
}: DataQualitySummaryCardProps) {
  const report = useMemo(() => calculateQualityMetrics(data), [data]);
  const { overallScore, qualityLevel, qualityClass, totalCheckedRecords, totalIssuesCount } = report;

  // Aesthetic styling classes depending on the class
  const classStyles = {
    excellent: {
      border: 'border-emerald-500/20 bg-emerald-500/5',
      text: 'text-emerald-600',
      badge: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
      iconBg: 'bg-emerald-100 text-emerald-600',
      bullet: 'bg-emerald-500'
    },
    good: {
      border: 'border-teal-500/20 bg-teal-500/5',
      text: 'text-teal-600',
      badge: 'bg-teal-500/10 text-teal-700 border-teal-500/20',
      iconBg: 'bg-teal-100 text-teal-600',
      bullet: 'bg-teal-500'
    },
    regular: {
      border: 'border-amber-500/20 bg-amber-500/5',
      text: 'text-amber-600',
      badge: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
      iconBg: 'bg-amber-100 text-amber-600',
      bullet: 'bg-amber-500'
    },
    critical: {
      border: 'border-rose-500/20 bg-rose-500/5',
      text: 'text-rose-600',
      badge: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
      iconBg: 'bg-rose-100 text-rose-600',
      bullet: 'bg-rose-500'
    }
  }[qualityClass];

  return (
    <div 
      id="data-quality-summary-card"
      className={`p-5 rounded-3xl border ${classStyles.border} shadow-xs text-left relative overflow-hidden transition-all duration-300 hover:shadow-md`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
        
        {/* Left column: Score and general rating */}
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${classStyles.iconBg} shadow-2xs`}>
            {overallScore >= 95 ? (
              <ShieldCheck className="w-8 h-8" />
            ) : (
              <ShieldAlert className="w-8 h-8" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100/60">
                Módulo Calidad de Datos
              </span>
              {totalIssuesCount > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded-md">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{totalIssuesCount} alertas</span>
                </span>
              )}
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-display tracking-tight text-slate-950">
                {overallScore}%
              </span>
              <span className={`text-sm font-black uppercase tracking-wide ${classStyles.text}`}>
                {qualityLevel}
              </span>
            </div>
            
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Cálculo heurístico inteligente sobre el censo de <strong className="text-slate-800">{totalCheckedRecords} colaboradores</strong>. Completitud, consistencia y formatos validados.
            </p>
          </div>
        </div>

        {/* Right column: Quick mini metrics and CTA */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center justify-end gap-4 w-full md:w-auto shrink-0 border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
          
          {/* Micro stats table */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-[11px] font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${classStyles.bullet}`} />
              <span>Completitud: <span className="text-slate-900 font-extrabold">{report.metrics.completitud.score}%</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${classStyles.bullet}`} />
              <span>Consistencia: <span className="text-slate-900 font-extrabold">{report.metrics.consistencia.score}%</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${classStyles.bullet}`} />
              <span>Duplicados: <span className="text-slate-900 font-extrabold">{report.metrics.duplicados.score}%</span></span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${classStyles.bullet}`} />
              <span>Formatos: <span className="text-slate-900 font-extrabold">{report.metrics.errores_formato.score}%</span></span>
            </div>
          </div>

          <button
            onClick={onNavigateToQualityTab}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all hover:scale-[1.01]"
          >
            <span>Auditar Calidad</span>
            <ArrowRight className="w-4 h-4 text-cyan-300 animate-pulse" />
          </button>

        </div>

      </div>
    </div>
  );
}
