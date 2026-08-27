import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileSpreadsheet, 
  Database, 
  Calculator, 
  Info, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sliders,
  Sparkles
} from 'lucide-react';
import { IndicatorTrace, IndicatorQualityLevel, EvidenceService, configureQualityThresholds, getQualityThresholds } from '../evidenceService';

interface IndicatorTraceabilityPanelProps {
  traces: IndicatorTrace[];
  companyId?: string;
  periodId?: string;
  onSelectTrace?: (trace: IndicatorTrace) => void;
}

export function IndicatorTraceabilityPanel({
  traces,
  companyId = 'TALLERES_2026',
  periodId = '2026-P1',
  onSelectTrace
}: IndicatorTraceabilityPanelProps) {
  const [selectedTraceId, setSelectedTraceId] = useState<string | null>(traces[0]?.indicatorId || null);
  const [filterSource, setFilterSource] = useState<string>('ALL');
  const [filterQuality, setFilterQuality] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showThresholdConfig, setShowThresholdConfig] = useState(false);

  const [thresholds, setThresholds] = useState(getQualityThresholds());

  const handleUpdateThresholds = (key: keyof typeof thresholds, val: number) => {
    const updated = { ...thresholds, [key]: val };
    setThresholds(updated);
    configureQualityThresholds(updated);
  };

  const selectedTrace = traces.find(t => t.indicatorId === selectedTraceId) || traces[0];

  const filteredTraces = traces.filter(t => {
    if (filterSource !== 'ALL' && t.sourceType !== filterSource) return false;
    if (filterQuality !== 'ALL' && t.dataQuality !== filterQuality) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return t.indicatorName.toLowerCase().includes(q) || t.indicatorId.toLowerCase().includes(q);
    }
    return true;
  });

  const getBadgeColor = (quality: IndicatorQualityLevel) => {
    switch (quality) {
      case 'HIGH':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'LOW':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'INSUFFICIENT':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const getAlertIcon = (alert: 'GREEN' | 'ORANGE' | 'RED') => {
    switch (alert) {
      case 'GREEN':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'ORANGE':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'RED':
      default:
        return <XCircle className="w-5 h-5 text-rose-600 shrink-0" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 text-left text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
              Panel de Trazabilidad y Confiabilidad — "¿De dónde salió este dato?"
            </span>
          </div>
          <h2 className="text-xl font-black text-white">
            Auditoría Transparente de Indicadores y Evidencia
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Cada KPI reportado mantiene origen verificado, muestra válida, fórmula matemática reproducible y diagnóstico de calidad sin imputaciones sintéticas.
          </p>
        </div>

        <button
          onClick={() => setShowThresholdConfig(!showThresholdConfig)}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <Sliders className="w-4 h-4 text-emerald-400" />
          <span>Configurar Umbrales de Calidad</span>
          {showThresholdConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Threshold Config Panel */}
      {showThresholdConfig && (
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Umbrales Configurables de Cobertura de Calidad
          </h3>
          <p className="text-xs text-slate-500">
            Ajuste las metas de porcentaje de respuestas válidas para clasificar automáticamente cada indicador:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div>
              <label className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">
                HIGH (Suficiente) &ge; %
              </label>
              <input
                type="number"
                value={thresholds.high}
                onChange={(e) => handleUpdateThresholds('high', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                MEDIUM (Parcial) &ge; %
              </label>
              <input
                type="number"
                value={thresholds.medium}
                onChange={(e) => handleUpdateThresholds('medium', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-orange-800 uppercase block mb-1">
                LOW (Baja) &ge; %
              </label>
              <input
                type="number"
                value={thresholds.low}
                onChange={(e) => handleUpdateThresholds('low', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-rose-800 uppercase block mb-1">
                INSUFFICIENT &lt; %
              </label>
              <input
                type="number"
                value={thresholds.insufficient}
                onChange={(e) => handleUpdateThresholds('insufficient', Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Buscar indicador por nombre o código..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterSource}
            onChange={(e) => setFilterSource(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="ALL">Todas las fuentes</option>
            <option value="SURVEY">Encuesta Directa</option>
            <option value="EXCEL">Importación Excel</option>
            <option value="CALCULATED">Dato Calculado</option>
            <option value="CONFIGURATION">Configuración</option>
          </select>

          <select
            value={filterQuality}
            onChange={(e) => setFilterQuality(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <option value="ALL">Todos los niveles</option>
            <option value="HIGH">🟢 Alta Calidad (HIGH)</option>
            <option value="MEDIUM">🟠 Media Calidad (MEDIUM)</option>
            <option value="LOW">🟠 Baja Cobertura (LOW)</option>
            <option value="INSUFFICIENT">🔴 Insuficiente (INSUFFICIENT)</option>
          </select>
        </div>
      </div>

      {/* Main Grid: List on Left, Trace Detail Card on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List of Traces */}
        <div className="lg:col-span-5 space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {filteredTraces.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
              No se encontraron indicadores con los filtros seleccionados.
            </div>
          ) : (
            filteredTraces.map((trace) => {
              const isSelected = trace.indicatorId === selectedTrace?.indicatorId;

              return (
                <div
                  key={trace.indicatorId}
                  onClick={() => {
                    setSelectedTraceId(trace.indicatorId);
                    if (onSelectTrace) onSelectTrace(trace);
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {trace.indicatorId}
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded-full border ${getBadgeColor(trace.dataQuality)}`}>
                      {trace.dataQuality}
                    </span>
                  </div>

                  <h4 className="text-xs font-black text-slate-900 leading-snug">{trace.indicatorName}</h4>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                    <span className="flex items-center gap-1 font-bold">
                      {trace.sourceType === 'EXCEL' && <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
                      {trace.sourceType === 'SURVEY' && <Database className="w-3.5 h-3.5 text-indigo-600" />}
                      {trace.sourceType === 'CALCULATED' && <Calculator className="w-3.5 h-3.5 text-purple-600" />}
                      {trace.sourceType}
                    </span>

                    <span className="font-mono font-bold">
                      {trace.hasSufficientData ? `${trace.result}${typeof trace.result === 'number' ? '%' : ''}` : 'N/A'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Detail Audit Card */}
        {selectedTrace ? (
          <div className="lg:col-span-7 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-5 shadow-lg">
            
            {/* Header Trace */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    ID: {selectedTrace.indicatorId}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    Empresa: {companyId} | Periodo: {periodId}
                  </span>
                </div>
                <h3 className="text-lg font-black text-white">{selectedTrace.indicatorName}</h3>
              </div>

              <div className="flex flex-col items-end gap-1">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getBadgeColor(selectedTrace.dataQuality)}`}>
                  ● {selectedTrace.dataQuality}
                </span>
                <span className="text-[10px] text-slate-400">
                  Auditado: {new Date(selectedTrace.generatedAt).toLocaleTimeString('es-CO')}
                </span>
              </div>
            </div>

            {/* Alert & Phrasing Box */}
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              selectedTrace.alertLevel === 'GREEN' ? 'bg-emerald-950/50 border-emerald-800 text-emerald-200' :
              selectedTrace.alertLevel === 'ORANGE' ? 'bg-amber-950/50 border-amber-800 text-amber-200' :
              'bg-rose-950/50 border-rose-800 text-rose-200'
            }`}>
              {getAlertIcon(selectedTrace.alertLevel)}
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider mb-1">
                  {selectedTrace.alertLevel === 'GREEN' && '🔴 Información Suficiente & Verificada'}
                  {selectedTrace.alertLevel === 'ORANGE' && '🟠 Información Parcial (Muestra Incompleta)'}
                  {selectedTrace.alertLevel === 'RED' && '🔴 Información Insuficiente'}
                </h4>
                <p className="text-xs leading-relaxed font-medium">
                  "{selectedTrace.explanationSentence}"
                </p>
              </div>
            </div>

            {/* Metric Breakdown Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Total Registros</span>
                <span className="text-xl font-black text-white">{selectedTrace.totalRecords}</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
                <span className="text-[10px] font-bold text-emerald-400 block uppercase">Resp. Válidas</span>
                <span className="text-xl font-black text-emerald-300">{selectedTrace.validRecords}</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
                <span className="text-[10px] font-bold text-rose-400 block uppercase">Faltantes (Missing)</span>
                <span className="text-xl font-black text-rose-300">{selectedTrace.missingRecords}</span>
              </div>

              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/80 text-center">
                <span className="text-[10px] font-bold text-indigo-400 block uppercase">Cobertura</span>
                <span className="text-xl font-black text-indigo-300">{selectedTrace.coveragePercentage}%</span>
              </div>
            </div>

            {/* Technical Traceability Details */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2">
                Ficha Técnica de Origen
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Fuente Principal</span>
                  <span className="font-mono text-emerald-300 font-bold">{selectedTrace.sourceType}</span>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Pregunta / Columna Origen</span>
                  <span className="font-mono text-cyan-300 font-bold">{selectedTrace.sourceQuestionId || selectedTrace.sourceColumn || 'N/A'}</span>
                </div>

                <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-800 sm:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Fórmula de Cálculo</span>
                  <pre className="text-[11px] font-mono text-purple-300 font-bold whitespace-pre-wrap">
                    {selectedTrace.calculationFormula || 'Direct Aggregation'}
                  </pre>
                </div>
              </div>
            </div>

            {/* Footer Badge for PDF export trace */}
            <div className="p-3 bg-indigo-950/60 border border-indigo-800/60 rounded-xl flex items-center justify-between text-[11px] text-indigo-200">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Marca de Agua para Informe PDF:</span>
              </div>
              <span className="font-mono font-bold text-white bg-indigo-900 px-2.5 py-1 rounded">
                Fuente: {selectedTrace.sourceType} | Base: {selectedTrace.validRecords} resp. | Cobertura: {selectedTrace.coveragePercentage}%
              </span>
            </div>

          </div>
        ) : (
          <div className="lg:col-span-7 p-12 bg-slate-50 border border-dashed border-slate-300 rounded-3xl text-center space-y-2">
            <Info className="w-8 h-8 text-slate-400 mx-auto" />
            <h4 className="text-xs font-black text-slate-700">Seleccione un Indicador</h4>
            <p className="text-xs text-slate-500">
              Haga clic en un indicador de la lista izquierda para auditar su ficha técnica completa.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
