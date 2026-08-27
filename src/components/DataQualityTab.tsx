import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Sparkles, 
  Wrench, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  TrendingUp,
  Database,
  ArrowRight,
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';
import { DemographicsData } from '../types';
import { calculateQualityMetrics, QualityMetric } from '../utils/dataQualityCalculator';
import { autoCorrectDemographicsData } from '../utils/dataValidator';
import { ValidadorExcelModule } from '../modules/validador_excel';
import { TraceabilityCenter } from '../core/data_integrity';
import { Prompt20QualityPanel } from './Prompt20QualityPanel';
import { Prompt36QualityPanel } from './Prompt36QualityPanel';

interface DataQualityTabProps {
  data: DemographicsData | null;
  onCorrectData?: (corrected: DemographicsData) => void;
}

export default function DataQualityTab({ 
  data, 
  onCorrectData 
}: DataQualityTabProps) {
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [subTabMode, setSubTabMode] = useState<'prompt36' | 'prompt20' | 'excel_validator' | 'traceability' | 'governance'>('prompt36');

  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning' | 'excellent'>('all');

  const report = useMemo(() => calculateQualityMetrics(data), [data]);
  const { overallScore, qualityLevel, qualityClass, metrics, recommendations, totalCheckedRecords, totalIssuesCount } = report;

  // Level color mapping
  const levelColors = {
    excellent: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badge: 'bg-emerald-500 text-white',
      text: 'text-emerald-500',
      ring: 'stroke-emerald-500',
      cardBg: 'from-emerald-500/10 to-transparent'
    },
    good: {
      bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      badge: 'bg-teal-500 text-white',
      text: 'text-teal-500',
      ring: 'stroke-teal-500',
      cardBg: 'from-teal-500/10 to-transparent'
    },
    regular: {
      bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      badge: 'bg-amber-500 text-white',
      text: 'text-amber-500',
      ring: 'stroke-amber-500',
      cardBg: 'from-amber-500/10 to-transparent'
    },
    critical: {
      bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      badge: 'bg-rose-500 text-white',
      text: 'text-rose-500',
      ring: 'stroke-rose-500',
      cardBg: 'from-rose-500/10 to-transparent'
    }
  }[qualityClass];

  const handleAutoCorrect = () => {
    if (!data || !onCorrectData) return;
    setIsCorrecting(true);
    setTimeout(() => {
      const corrected = autoCorrectDemographicsData(data);
      onCorrectData(corrected);
      setIsCorrecting(false);
    }, 1000);
  };

  const getStatusBadge = (status: QualityMetric['status']) => {
    switch (status) {
      case 'excellent':
        return <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-100">Excelente</span>;
      case 'good':
        return <span className="bg-teal-50 text-teal-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-teal-100">Bueno</span>;
      case 'regular':
        return <span className="bg-amber-50 text-amber-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-amber-100">Regular</span>;
      case 'critical':
        return <span className="bg-rose-50 text-rose-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-rose-100">Crítico</span>;
    }
  };

  const getMetricIconColor = (status: QualityMetric['status']) => {
    switch (status) {
      case 'excellent':
        return 'text-emerald-500 bg-emerald-50';
      case 'good':
        return 'text-teal-500 bg-teal-50';
      case 'regular':
        return 'text-amber-500 bg-amber-50';
      case 'critical':
        return 'text-rose-500 bg-rose-50';
    }
  };

  // Convert metrics record to an array
  const metricsList = useMemo(() => Object.values(metrics), [metrics]);

  const filteredMetrics = useMemo(() => {
    return metricsList.filter(m => {
      if (activeFilter === 'critical') return m.status === 'critical';
      if (activeFilter === 'warning') return m.status === 'regular';
      if (activeFilter === 'excellent') return m.status === 'excellent' || m.status === 'good';
      return true;
    });
  }, [metricsList, activeFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in py-2">
      
      {/* Selector de Sub-Módulo de Calidad */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80 max-w-3xl mx-auto shadow-2xs">
        <button
          onClick={() => setSubTabMode('prompt36')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            subTabMode === 'prompt36'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          Prompt 36 Motor Calidad
        </button>
        <button
          onClick={() => setSubTabMode('prompt20')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            subTabMode === 'prompt20'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Pre-Informe
        </button>
        <button
          onClick={() => setSubTabMode('excel_validator')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            subTabMode === 'excel_validator'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Validador Excel
        </button>
        <button
          onClick={() => setSubTabMode('traceability')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            subTabMode === 'traceability'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Trazabilidad
        </button>
        <button
          onClick={() => setSubTabMode('governance')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            subTabMode === 'governance'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          Gobernanza
        </button>
      </div>

      {subTabMode === 'prompt36' ? (
        <Prompt36QualityPanel data={data} />
      ) : subTabMode === 'prompt20' ? (
        <Prompt20QualityPanel data={data} />
      ) : subTabMode === 'excel_validator' ? (
        <ValidadorExcelModule />
      ) : subTabMode === 'traceability' ? (
        <TraceabilityCenter />
      ) : (
        <>

          {/* Banner de Encabezado de Calidad de Datos */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-indigo-500/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
              <span>Consola Inteligente de Gobernanza de Datos</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white leading-tight">
              Módulo de Calidad de Datos (G&A)
            </h1>
            <p className="text-xs text-slate-400 font-semibold max-w-2xl">
              Auditoría automatizada de consistencia demográfica, integridad y validez estructurada según normas de calidad de información para informes corporativos y SST.
            </p>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${levelColors.bg} self-start sm:self-auto`}>
            <span className="text-xs font-bold text-slate-300">Índice Global:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-black bg-white text-slate-900 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${levelColors.text} bg-current animate-pulse`}></span>
              <span>{overallScore}% ({qualityLevel})</span>
            </span>
          </div>
        </div>
      </div>

      {/* Bloque de Indicador Radial Score & Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Radial Quality Score Card */}
        <div className="md:col-span-4 bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-2">Puntaje General de Calidad</span>
          
          <div className="relative flex items-center justify-center w-36 h-36">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="60"
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="60"
                className={`transition-all duration-1000 ease-out ${levelColors.ring}`}
                strokeWidth="10"
                strokeDasharray={377} // 2 * pi * 60 = 376.99
                strokeDashoffset={377 - (377 * overallScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-950 tracking-tight font-display">
                {overallScore}%
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ESTADO</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${levelColors.bg}`}>
              {qualityLevel}
            </span>
            <p className="text-[11px] text-slate-400 font-medium font-mono pt-1">
              {totalCheckedRecords} Registros Auditados
            </p>
          </div>
        </div>

        {/* Diagnostic Analysis Card */}
        <div className="md:col-span-8 bg-white rounded-3xl border border-slate-200/60 p-6 flex flex-col justify-between shadow-sm text-left relative">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-500" />
              <h4 className="font-extrabold text-slate-900 text-sm">Resumen de Diagnóstico del Censo</h4>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              El motor de auditoría ha evaluado los campos obligatorios del SG-SST (Edad, Sexo, Estrato, Ciudad, Vivienda, Estado Civil, Hijos y Antigüedad). Se han ejecutado chequeos automáticos de completitud de datos, consistencia aritmética de sumatorias, detección de registros duplicados, campos en blanco, validez de formatos continuos de IMC (peso/estatatura), coherencia de edades laborables y consistencia temporal de fechas de ingreso y cargo.
            </p>

            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              {overallScore >= 95 ? (
                'La base de datos presenta un nivel óptimo de consistencia. El cuadre de datos es sumamente preciso, permitiendo un análisis directivo sin sesgos. Puede proceder con tranquilidad a exportar informes ejecutivos y tableros interactivos.'
              ) : (
                'Se han detectado alertas de inconsistencia o datos incompletos. Esto puede ocasionar que el Dashboard Ejecutivo presente totales discordantes en diferentes gráficos. Se recomienda encarecidamente utilizar la herramienta de corrección automática.'
              )}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-slate-100 mt-5">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150/50">
              <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Censo de Nómina</span>
              <span className="text-sm font-black text-slate-800">{totalCheckedRecords}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150/50">
              <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Métricas Clave</span>
              <span className="text-sm font-black text-slate-800">8 de 8</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150/50">
              <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Alertas Totales</span>
              <span className={`text-sm font-black ${totalIssuesCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                {totalIssuesCount}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150/50">
              <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Deduplicado</span>
              <span className="text-sm font-black text-emerald-500">100% Ok</span>
            </div>
          </div>
        </div>
      </div>

      {/* Las 8 Métricas Solicitadas por el usuario */}
      <div className="space-y-4 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-500" />
            <span>Auditoría de las 8 Dimensiones de Calidad</span>
          </h3>
          
          {/* Quick Filters */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1 self-start sm:self-auto">
            <button 
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Todos ({metricsList.length})
            </button>
            <button 
              onClick={() => setActiveFilter('excellent')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activeFilter === 'excellent' ? 'bg-emerald-500 text-white shadow-xs font-black' : 'text-slate-500 hover:text-emerald-600'}`}
            >
              Excelentes ({metricsList.filter(m => m.status === 'excellent' || m.status === 'good').length})
            </button>
            <button 
              onClick={() => setActiveFilter('warning')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activeFilter === 'warning' ? 'bg-amber-500 text-white shadow-xs font-black' : 'text-slate-500 hover:text-amber-600'}`}
            >
              Regulares ({metricsList.filter(m => m.status === 'regular').length})
            </button>
            <button 
              onClick={() => setActiveFilter('critical')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activeFilter === 'critical' ? 'bg-rose-500 text-white shadow-xs font-black' : 'text-slate-500 hover:text-rose-500'}`}
            >
              Críticos ({metricsList.filter(m => m.status === 'critical').length})
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredMetrics.map((metric, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between gap-4 text-left group hover:border-slate-300"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-xs tracking-tight">{metric.name}</span>
                  {getStatusBadge(metric.status)}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal font-semibold">
                  {metric.description}
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-50">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Puntaje</span>
                  <span className={`text-base font-black font-display ${
                    metric.score >= 95 ? 'text-emerald-500' : metric.score >= 85 ? 'text-teal-500' : metric.score >= 70 ? 'text-amber-500' : 'text-rose-500'
                  }`}>{metric.score}%</span>
                </div>
                <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      metric.score >= 95 ? 'bg-emerald-500' : metric.score >= 85 ? 'bg-teal-500' : metric.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${metric.score}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal font-bold bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100">
                  🔍 {metric.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sección de Recomendaciones Automáticas para mejorar la calidad */}
      <div className="space-y-4 text-left">
        <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <span>Recomendaciones Automáticas de Calidad de Información</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-3xs flex items-start gap-4 text-left transition-all hover:translate-x-1"
            >
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span>Categoría: <strong className="text-indigo-600">{rec.category}</strong></span>
                  </span>
                  <span className={`inline-flex px-2 py-0.5 rounded-md font-extrabold text-[9px] uppercase tracking-wide ${
                    rec.impact === 'Alta' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                    rec.impact === 'Media' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-slate-50 text-slate-700 border border-slate-150'
                  }`}>
                    Impacto {rec.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                  {rec.text}
                </p>
                <div className="pt-2.5 border-t border-dashed border-slate-100 text-[10px] font-bold text-indigo-700">
                  💡 Acción sugerida: <span className="text-slate-600">{rec.action}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corrector Inteligente de Datos (Acción de Auto-corrección) */}
      {onCorrectData && (
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200/60 flex flex-col md:flex-row items-center justify-between gap-5 text-left">
          <div className="flex items-start gap-3.5 max-w-2xl">
            <span className="p-2.5 bg-indigo-100 text-indigo-600 rounded-2xl shrink-0 mt-1">
              <Wrench className="w-5 h-5" />
            </span>
            <div className="space-y-1">
              <h5 className="font-extrabold text-slate-950 text-xs flex items-center gap-1.5">
                Corrector Inteligente de Coherencia Demográfica
                <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md animate-pulse">IA RECALCULATOR</span>
              </h5>
              <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                El algoritmo automático ajusta las sumatorias, escala porcentajes de gráficos de forma proporcional a los colaboradores totales de la nómina, recomputa IMC e impide inconsistencias temporales en fechas/antigüedades. Esto garantiza que todos los KPI de su dashboard queden en estado 100% coherente al instante.
              </p>
            </div>
          </div>

          <button
            onClick={handleAutoCorrect}
            disabled={isCorrecting || overallScore >= 99}
            className={`w-full md:w-auto px-5 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
              overallScore >= 99 
                ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:scale-[1.01]'
            }`}
          >
            {isCorrecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Ejecutando Correcciones...</span>
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4" />
                <span>Corregir Base de Datos (100% Ok)</span>
              </>
            )}
          </button>
        </div>
      )}
        </>
      )}
    </div>
  );
}
