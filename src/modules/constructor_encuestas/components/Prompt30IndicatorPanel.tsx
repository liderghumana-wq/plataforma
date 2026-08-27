import React, { useState } from 'react';
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Info,
  CheckCircle,
  Clock,
  Layers,
  Database,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Percent,
  Hash
} from 'lucide-react';
import { IndicatorResult } from '../../../core/indicators/types';

interface Prompt30IndicatorPanelProps {
  indicators: IndicatorResult[];
  companyName?: string;
  period?: string;
  onRefresh?: () => void;
}

export const Prompt30IndicatorPanel: React.FC<Prompt30IndicatorPanelProps> = ({
  indicators,
  companyName = 'Empresa Demo',
  period = '2026-P1',
  onRefresh
}) => {
  const [selectedTraceability, setSelectedTraceability] = useState<IndicatorResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredIndicators = indicators.filter(ind => {
    const matchesSearch = ind.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ind.indicatorId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || ind.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCalculated = indicators.length;
  const validCount = indicators.filter(i => i.value !== null).length;
  const noDataCount = indicators.filter(i => i.value === null).length;
  const avgCoverage = totalCalculated > 0
    ? (indicators.reduce((acc, i) => acc + i.coverage, 0) / totalCalculated).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      
      {/* Top Banner - Rule Directive */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight uppercase">
                Motor Central de Indicadores SG-SST (Prompt 30)
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Regla Fundamental: Ningún indicador es inventado, estimado ni completado con constantes.
              </p>
            </div>
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>Recalcular Todo</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Indicadores Procesados</span>
            <span className="text-lg font-black text-white">{totalCalculated}</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-emerald-400 font-bold block uppercase">Con Datos Reales</span>
            <span className="text-lg font-black text-emerald-400">{validCount}</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-amber-400 font-bold block uppercase">Sin Información</span>
            <span className="text-lg font-black text-amber-400">{noDataCount}</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/50">
            <span className="text-[10px] text-indigo-300 font-bold block uppercase">Cobertura Promedio</span>
            <span className="text-lg font-black text-indigo-300">{avgCoverage}%</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar indicador por nombre o ID..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="VALID">VÁLIDOS</option>
            <option value="VALID_WITH_LIMITATIONS">CON LIMITACIONES</option>
            <option value="NO_DATA">SIN INFORMACIÓN</option>
          </select>
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredIndicators.map(ind => {
          const hasData = ind.value !== null;
          const isHighQuality = ind.dataQuality === 'ALTA';

          return (
            <div
              key={ind.indicatorId}
              className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                hasData ? 'border-slate-200' : 'border-amber-200 bg-amber-50/20'
              }`}
            >
              <div className="space-y-3">
                
                {/* Header Badge */}
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-black tracking-widest uppercase text-slate-400 font-mono">
                    {ind.formulaVersion}
                  </span>
                  
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      ind.dataQuality === 'ALTA'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : ind.dataQuality === 'MEDIA'
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : ind.dataQuality === 'BAJA'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    CALIDAD: {ind.dataQuality}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {ind.name}
                </h3>

                {/* Value display */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Resultado Calculado
                  </span>
                  {hasData ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-black text-slate-900 font-display">
                        {ind.value}
                      </span>
                      <span className="text-xs font-extrabold text-indigo-600 uppercase">
                        {ind.unit}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs py-1">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
                      <span>Sin información disponible</span>
                    </div>
                  )}
                </div>

                {/* Metrics detail row */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">Cobertura Datos</span>
                    <span className="font-extrabold text-slate-800">{ind.coverage}% ({ind.validRecords}/{ind.totalRecords})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] font-bold uppercase">Fuente Principal</span>
                    <span className="truncate block font-bold text-slate-700" title={ind.source}>{ind.source}</span>
                  </div>
                </div>

                {/* Interpretation */}
                <p className="text-[10px] text-slate-500 leading-relaxed font-medium bg-slate-50/60 p-2 rounded-lg border border-slate-100">
                  {ind.interpretation}
                </p>

              </div>

              {/* Action Footer */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase font-mono">
                  {ind.period}
                </span>

                <button
                  onClick={() => setSelectedTraceability(ind)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-black transition flex items-center gap-1 border border-slate-200"
                >
                  <Info className="w-3 h-3" />
                  <span>Ver Trazabilidad</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal - Traceability Drawer */}
      {selectedTraceability && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 relative">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-[9px] font-black uppercase text-indigo-600 tracking-widest font-mono block">
                  TRAZABILIDAD DE INDICADOR REAL • {selectedTraceability.formulaVersion}
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {selectedTraceability.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTraceability(null)}
                className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              
              <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl space-y-1">
                <span className="text-[9px] font-black text-indigo-700 uppercase tracking-wider block">Fórmula & Interpretación</span>
                <p className="font-semibold text-indigo-950 text-xs">
                  {selectedTraceability.interpretation}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Fuente Original</span>
                  <span className="font-bold text-slate-800">{selectedTraceability.source}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Variables Utilizadas</span>
                  <span className="font-mono text-[10px] text-slate-800 truncate block">{selectedTraceability.variablesUsed.join(', ')}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Numerador (Válidos / Casos)</span>
                  <span className="font-black text-slate-800">{selectedTraceability.numerator}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Denominador (Evaluados)</span>
                  <span className="font-black text-slate-800">{selectedTraceability.denominator}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Cobertura Evaluada</span>
                  <span className="font-black text-indigo-600">{selectedTraceability.coverage}%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                  <span className="text-[9px] text-slate-400 block font-bold uppercase">Fecha de Cálculo</span>
                  <span className="font-bold text-slate-700 text-[10px]">{new Date(selectedTraceability.calculatedAt).toLocaleString('es-CO')}</span>
                </div>
              </div>

              {selectedTraceability.warning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{selectedTraceability.warning}</span>
                </div>
              )}

            </div>

            <div className="pt-2 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedTraceability(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                Cerrar Trazabilidad
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
