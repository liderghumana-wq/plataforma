import React, { useState } from 'react';
import { 
  BarChart3, 
  Filter, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { IndicatorEngineService } from '../../../core/indicator_engine/indicatorEngineService';
import { IndicatorMetadata } from '../../../core/indicator_engine/types';
import { CentroEjecutivoTab } from '../types/centroEjecutivo.types';

interface IndicadoresSstTabProps {
  activeCompanyId: string;
  onNavigateTab: (tab: CentroEjecutivoTab) => void;
}

export const IndicadoresSstTab: React.FC<IndicadoresSstTabProps> = ({
  activeCompanyId,
  onNavigateTab
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const indicators: IndicatorMetadata[] = IndicatorEngineService.calculateAllIndicators({
    companyId: activeCompanyId
  });

  const categories = [
    { id: 'ALL', label: 'Todos los Indicadores' },
    { id: 'DEMOGRAFICO', label: 'Demografía & Censo' },
    { id: 'SST_GENERAL', label: 'SST & Frecuencia' },
    { id: 'AUSENTISMO', label: 'Ausentismo' },
    { id: 'OSTEOMUSCULAR', label: 'Sintomatología' }
  ];

  const filtered = indicators.filter(ind => {
    if (selectedCategory === 'ALL') return true;
    return ind.category === selectedCategory || ind.indicatorId?.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 mb-2 border border-indigo-100">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Motor Centralizado de Indicadores SG-SST</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Batería de Métricas & Trazabilidad Matemática
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Cálculo determinístico sin duplicidad de lógica. Total alineación con la Resolución 0312 de 2019.
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl sm:text-3xl font-black text-indigo-600">
            {indicators.length}
          </span>
          <span className="text-xs text-slate-400 block font-semibold">
            Indicadores activos auditados
          </span>
        </div>
      </div>

      {/* Categories Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((ind) => (
          <div 
            key={ind.indicatorId} 
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4 shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 truncate max-w-[150px]">
                  {ind.indicatorId}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  ind.status === 'COMPLETE' || ind.status === 'VALID' || ind.status === 'CALCULATED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : ind.status === 'PARTIAL' || ind.status === 'VALID_WITH_LIMITATIONS'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {ind.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {ind.name}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2">
                {ind.description}
              </p>
            </div>

            {/* Metric Value Block */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-semibold">Resultado:</span>
                <span className="text-xl font-black text-slate-900">
                  {ind.value !== null && ind.value !== undefined 
                    ? `${ind.value}${ind.unit ? ` ${ind.unit}` : ''}` 
                    : 'Sin datos'}
                </span>
              </div>

              {/* Numerator and Denominator Traceability */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                <span>Válidos (Num): <strong>{ind.validRecords ?? '—'}</strong></span>
                <span>Total (Den): <strong>{ind.totalRecords ?? '—'}</strong></span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-medium">
              Cobertura: {ind.coveragePercentage}% | Base legal: Resolución 0312/2019
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
