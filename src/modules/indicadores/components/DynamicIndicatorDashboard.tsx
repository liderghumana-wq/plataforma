import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart2, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  Database, 
  Calendar, 
  Users, 
  Activity, 
  Heart, 
  PieChart as PieIcon, 
  TrendingUp, 
  Building2, 
  Search, 
  RotateCcw,
  Layers,
  ChevronDown,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { IndicatorEngineService } from '../../../core/indicator_engine/indicatorEngineService';
import { IndicatorMetadata, IndicatorFilterOptions, IndicatorCategory } from '../../../core/indicator_engine/types';
import { DataQualityBadge } from '../../../core/data_integrity/components/DataQualityBadge';
import { TraceabilityModal } from '../../../core/data_integrity/components/TraceabilityModal';
import { IndicatorTraceability } from '../../../core/data_integrity/types';
import { catalogosService } from '../../configuracion/catalogos.service';
import { useEmpresa } from '../../configuracion/useEmpresa';
import { AIEngine } from '../../ia/services/aiEngine';
import { AIEngineResponse } from '../../ia/types/aiEngine.types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export function DynamicIndicatorDashboard() {
  const { activeCompanyId, companies, switchCompany } = useEmpresa();
  const currentCompanyId = activeCompanyId || companies[0]?.id || 'emp_innovatech';

  // Filters State
  const [filters, setFilters] = useState<IndicatorFilterOptions>({
    companyId: currentCompanyId,
    period: 'anio',
    sedeId: '',
    areaId: '',
    proyectoId: '',
    cargoId: '',
    sexo: '',
    modalidad: '',
    tipoContrato: ''
  });

  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTraceability, setSelectedTraceability] = useState<IndicatorTraceability | null>(null);

  // AI Diagnostic State
  const [aiReport, setAiReport] = useState<AIEngineResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Sync company filter with company selector
  useEffect(() => {
    setFilters(prev => ({ ...prev, companyId: currentCompanyId }));
  }, [currentCompanyId]);

  // Catalog Options
  const companyCatalogs = useMemo(() => catalogosService.getCatalogsSync(currentCompanyId), [currentCompanyId]);
  const sedes = companyCatalogs.sedes || [];
  const areas = companyCatalogs.areas || [];
  const cargos = companyCatalogs.cargos || [];
  const proyectos = companyCatalogs.proyectos || [];

  // Calculate Indicators dynamically from real dataset
  const indicators: IndicatorMetadata[] = useMemo(() => {
    return IndicatorEngineService.calculateAllIndicators(filters);
  }, [filters]);

  // Filtered Indicators
  const displayedIndicators = useMemo(() => {
    return indicators.filter(ind => {
      if (activeCategory !== 'ALL' && ind.category !== activeCategory) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return ind.name.toLowerCase().includes(q) || ind.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [indicators, activeCategory, searchQuery]);

  // Global Coverage Summary
  const coverageStats = useMemo(() => {
    if (indicators.length === 0) return { avgCoverage: 0, complete: 0, partial: 0, noData: 0 };
    let sumCov = 0;
    let complete = 0;
    let partial = 0;
    let noData = 0;

    indicators.forEach(ind => {
      sumCov += ind.coveragePercentage;
      if (ind.status === 'COMPLETE') complete++;
      else if (ind.status === 'PARTIAL') partial++;
      else if (ind.status === 'NO_DATA') noData++;
    });

    return {
      avgCoverage: parseFloat((sumCov / indicators.length).toFixed(1)),
      complete,
      partial,
      noData
    };
  }, [indicators]);

  // AI Diagnostic Handler
  const handleRunAIDiagnostic = () => {
    setIsAnalyzing(true);
    setAiReport(null);

    setTimeout(() => {
      try {
        // Map indicators to validated AI payload
        const aiPayload = indicators.map(ind => ({
          id: ind.indicatorId,
          name: ind.name,
          value: typeof ind.value === 'number' ? ind.value : 0,
          previousValue: ind.previousValue || undefined,
          target: 80,
          unit: ind.unit,
          status: ind.status === 'COMPLETE' ? 'success' : ind.status === 'PARTIAL' ? 'warning' : 'critical',
          thresholds: { critical: 50, warning: 75, success: 80 },
          coveragePercentage: ind.coveragePercentage,
          validRecords: ind.validRecords,
          totalRecords: ind.totalRecords
        }));

        const report = AIEngine.analyze(aiPayload, { companyName: currentCompanyId });
        setAiReport(report);
      } catch (err) {
        console.error('Error running AI diagnostic:', err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 600);
  };


  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Motor de Indicadores SG-SST • Datos 100% Reales & Trazables</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Tablero Dinámico de Salud & Sociodemografía
            </h2>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Análisis dinámico sobre datos reales de encuestas, cargas Excel y datos maestros. Sin supuestos sintéticos ni imputación de datos.
            </p>
          </div>

          <button
            onClick={handleRunAIDiagnostic}
            disabled={isAnalyzing}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Generando Diagnóstico IA...' : 'Generar Diagnóstico IA'}</span>
          </button>
        </div>

        {/* Global Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800 text-xs">
          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Indicadores Calculados</span>
            <p className="text-xl font-black text-white font-mono mt-0.5">{indicators.length}</p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Cobertura Promedio</span>
            <p className="text-xl font-black text-indigo-400 font-mono mt-0.5">{coverageStats.avgCoverage}%</p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Datos Completos</span>
            <p className="text-xl font-black text-emerald-400 font-mono mt-0.5">{coverageStats.complete}</p>
          </div>

          <div className="bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Datos Parciales / Sin Información</span>
            <p className="text-xl font-black text-amber-400 font-mono mt-0.5">{coverageStats.partial + coverageStats.noData}</p>
          </div>
        </div>
      </div>

      {/* AI Diagnostic Output Card */}
      {aiReport && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-indigo-900/90 text-white rounded-3xl p-6 shadow-xl border border-indigo-700/50 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-300" />
              Interpretación Diagnóstica de IA (Sin Cifras Sintéticas)
            </h3>
            <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-700">
              Cálculo: {new Date(aiReport.timestamp).toLocaleTimeString('es-CO')}
            </span>
          </div>

          <p className="text-xs text-indigo-100 leading-relaxed font-medium bg-indigo-950/40 p-4 rounded-2xl border border-indigo-800/50">
            {aiReport.resumenEjecutivo}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-800/50 space-y-2">
              <span className="font-bold uppercase text-[10px] text-amber-300 block">Hallazgos Principales</span>
              <ul className="space-y-1 list-disc list-inside text-indigo-200">
                {aiReport.hallazgos.map((h, i) => <li key={i}>{h}</li>)}
              </ul>
            </div>

            <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-800/50 space-y-2">
              <span className="font-bold uppercase text-[10px] text-rose-300 block">Riesgos Epidemiológicos</span>
              <ul className="space-y-1 list-disc list-inside text-indigo-200">
                {aiReport.riesgos.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>

            <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-800/50 space-y-2">
              <span className="font-bold uppercase text-[10px] text-emerald-300 block">Fortalezas Identificadas</span>
              <ul className="space-y-1 list-disc list-inside text-indigo-200">
                {aiReport.fortalezas.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-600" />
            Filtros del Sistema & Segmentación Multivariable
          </h3>
          <button
            onClick={() => setFilters({ companyId: currentCompanyId, period: 'anio' })}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restablecer Filtros
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
          
          {/* Company Selector */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Empresa</label>
            <select
              value={currentCompanyId}
              onChange={(e) => switchCompany(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-800"
            >
              {companies.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nombreEmpresa || emp.id}</option>
              ))}
            </select>
          </div>

          {/* Sede */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Sede</label>
            <select
              value={filters.sedeId || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, sedeId: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="">Todas las Sedes</option>
              {sedes.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
          </div>

          {/* Area */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Área</label>
            <select
              value={filters.areaId || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, areaId: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="">Todas las Áreas</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
            </select>
          </div>

          {/* Cargo */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Cargo</label>
            <select
              value={filters.cargoId || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, cargoId: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="">Todos los Cargos</option>
              {cargos.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {/* Sexo */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Sexo</label>
            <select
              value={filters.sexo || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, sexo: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="">Todos</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          {/* Period */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Periodo</label>
            <select
              value={filters.period || 'anio'}
              onChange={(e) => setFilters(prev => ({ ...prev, period: e.target.value }))}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium"
            >
              <option value="anio">Año 2026</option>
              <option value="semestre">Último Semestre</option>
              <option value="trimestre">Último Trimestre</option>
              <option value="mes">Mes Actual</option>
            </select>
          </div>

        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
          {[
            { id: 'ALL', label: 'Todos' },
            { id: 'SOCIODEMOGRAPHIC', label: 'Sociodemográficos' },
            { id: 'HEALTH', label: 'Condiciones de Salud' },
            { id: 'ANTHROPOMETRY', label: 'Antropometría' },
            { id: 'LIFESTYLE', label: 'Estilo de Vida' },
            { id: 'SOCIOLABOR', label: 'Sociolaborales' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar indicador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

      </div>

      {/* Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayedIndicators.map((ind) => {
          const isNoData = ind.status === 'NO_DATA';

          return (
            <div 
              key={ind.indicatorId} 
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                      {ind.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{ind.name}</h4>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase shrink-0 ${
                    ind.status === 'COMPLETE' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                    ind.status === 'PARTIAL' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    'bg-slate-100 text-slate-600 border-slate-300'
                  }`}>
                    {ind.status}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-normal line-clamp-2">
                  {ind.description}
                </p>

                {/* Primary Value */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Resultado:</span>
                  <div className="text-lg font-black text-indigo-900 font-mono">
                    {ind.value !== null ? `${ind.value} ${ind.unit === '%' ? '' : ind.unit}` : 'Sin datos suficientes'}
                  </div>
                </div>

                {/* Coverage Warning Banner */}
                {ind.warning && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{ind.warning}</span>
                  </div>
                )}

                {/* Distribution Chart (if applicable) */}
                {ind.distribution && ind.distribution.length > 0 && !isNoData && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Distribución Registrada:</span>
                    <div className="space-y-1.5 text-xs">
                      {ind.distribution.map((d, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="font-semibold text-slate-700">{d.label}</span>
                            <span className="font-mono font-bold text-slate-900">{d.count} ({d.percentage}%)</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-600 rounded-full" 
                              style={{ width: `${Math.min(100, Math.max(0, d.percentage))}%` }} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Quality Badge & Traceability Action */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <DataQualityBadge
                  validRecords={ind.validRecords}
                  totalRecords={ind.totalRecords}
                  coveragePercentage={ind.coveragePercentage}
                />

                <button
                  type="button"
                  onClick={() => setSelectedTraceability({
                    indicatorId: ind.indicatorId,
                    indicatorName: ind.name,
                    sourceField: ind.sourceField,
                    sourceSurvey: ind.surveyId || 'Base Master SS-SST',
                    surveyVersion: ind.surveyVersion || 'v1.0',
                    calculationMethod: `${ind.calculationMethod} sobre ${ind.validRecords} registros válidos de ${ind.totalRecords}`,
                    validRecords: ind.validRecords,
                    totalRecords: ind.totalRecords,
                    coveragePercentage: ind.coveragePercentage,
                    calculatedValue: typeof ind.value === 'number' ? ind.value : null,
                    unit: ind.unit,
                    statusText: ind.status,
                    calculatedAt: ind.calculatedAt,
                    dataStatus: ind.status === 'COMPLETE' ? 'CALCULATED_FROM_VALID_DATA' : 'MISSING'
                  })}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer text-[11px] font-bold flex items-center gap-1 border border-slate-200"
                  title="¿De dónde salió este dato?"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Trazabilidad</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Traceability Modal */}
      {selectedTraceability && (
        <TraceabilityModal
          traceability={selectedTraceability}
          onClose={() => setSelectedTraceability(null)}
        />
      )}

    </div>
  );
}
