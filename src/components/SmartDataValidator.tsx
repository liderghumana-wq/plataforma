import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Wrench, 
  Info, 
  RefreshCw,
  Database,
  CheckCircle2,
  ListFilter
} from 'lucide-react';
import { DemographicsData } from '../types';
import { auditDemographicsData, autoCorrectDemographicsData, InconsistencyIssue } from '../utils/dataValidator';

interface SmartDataValidatorProps {
  data: DemographicsData | null;
  onCorrectData?: (corrected: DemographicsData) => void;
  title?: string;
}

export default function SmartDataValidator({ 
  data, 
  onCorrectData,
  title = 'Auditoría Inteligente de Consistencia Sociodemográfica'
}: SmartDataValidatorProps) {
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warning'>('all');

  const report = useMemo(() => auditDemographicsData(data), [data]);
  const { isConsistent, qualityPercentage, qualityLevel, issues } = report;

  const handleAutoCorrect = () => {
    if (!data || !onCorrectData) return;
    setIsCorrecting(true);
    setTimeout(() => {
      const corrected = autoCorrectDemographicsData(data);
      onCorrectData(corrected);
      setIsCorrecting(false);
    }, 800);
  };

  // Color config depending on level
  const levelColors = {
    Excelente: {
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      badge: 'bg-emerald-500 text-white',
      text: 'text-emerald-500',
      ring: 'stroke-emerald-500',
      lightBg: 'bg-emerald-50'
    },
    Buena: {
      bg: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      badge: 'bg-teal-500 text-white',
      text: 'text-teal-500',
      ring: 'stroke-teal-500',
      lightBg: 'bg-teal-50'
    },
    Regular: {
      bg: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      badge: 'bg-amber-500 text-white',
      text: 'text-amber-500',
      ring: 'stroke-amber-500',
      lightBg: 'bg-amber-50'
    },
    Deficiente: {
      bg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      badge: 'bg-rose-500 text-white',
      text: 'text-rose-500',
      ring: 'stroke-rose-500',
      lightBg: 'bg-rose-50'
    }
  }[qualityLevel];

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (activeFilter === 'critical') return issue.severity === 'critical';
      if (activeFilter === 'warning') return issue.severity === 'warning';
      return true;
    });
  }, [issues, activeFilter]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl overflow-hidden transition-all duration-300" id="smart-data-validator">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-indigo-500/15 rounded-full blur-[80px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-1.5 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
              <span>Validador Inteligente de Datos</span>
            </div>
            <h3 className="text-xl font-black font-display tracking-tight text-white leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Auditoría heurística en tiempo real antes de la renderización del dashboard e informes directivos.
            </p>
          </div>

          <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${levelColors.bg}`}>
            <span className="text-xs font-bold text-slate-300">Calidad:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-black bg-white text-slate-900 shadow-sm">
              <span className={`w-2 h-2 rounded-full ${levelColors.text} bg-current animate-pulse`}></span>
              <span>{qualityLevel} ({qualityPercentage}%)</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quality Rings and Summary Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Radial score on the left */}
          <div className="md:col-span-4 bg-slate-50 rounded-2xl border border-slate-100 p-5 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Puntaje de Consistencia</span>
            
            <div className="relative flex items-center justify-center w-28 h-28">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className="stroke-slate-200/60"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="48"
                  className={`transition-all duration-1000 ease-out ${levelColors.ring}`}
                  strokeWidth="8"
                  strokeDasharray={301.6} // 2 * pi * 48 = 301.59
                  strokeDashoffset={301.6 - (301.6 * qualityPercentage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800 tracking-tighter">
                  {qualityPercentage}%
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Calidad</span>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-500 leading-snug">
              {isConsistent ? (
                <span className="text-emerald-600 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Base de datos consistente</span>
                </span>
              ) : (
                <span className="text-rose-600 flex items-center justify-center gap-1">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>Inconsistencias críticas</span>
                </span>
              )}
            </div>
          </div>

          {/* Quick analysis diagnostic message */}
          <div className="md:col-span-8 space-y-4 text-left">
            <h4 className="font-extrabold text-slate-900 text-sm">Resumen del Estado de Datos</h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {isConsistent ? (
                'La auditoría no ha encontrado inconsistencias críticas en la estructura de datos. Los Kpis globales de nómina coinciden perfectamente con las variables sociodemográficas mapeadas. Se habilita de manera segura la exportación a PDF y la visualización interactiva de gráficas.'
              ) : (
                'Se han detectado errores de consistencia lógica o cuadre numérico que bloquean la generación de informes y dashboards. Esto previene que se presenten indicadores distorsionados o incorrectos a la alta gerencia. Por favor corrija los datos utilizando el corrector inteligente o el archivo original.'
              )}
            </p>

            <div className="flex flex-wrap gap-2.5">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold flex items-center gap-2">
                <Database className="w-3.5 h-3.5 text-indigo-500" />
                <span>Total Nómina: <span className="font-extrabold text-slate-800">{data?.totalEmployees || 0}</span></span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Alertas Totales: <span className="font-extrabold text-slate-800">{issues.length}</span></span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                <span>Críticos Bloqueantes: <span className="font-extrabold text-rose-600">{issues.filter(i => i.severity === 'critical').length}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Validation issues lists */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-slate-500" />
              <span>Lista de Hallazgos en la Auditoría ({filteredIssues.length})</span>
            </h4>
            
            {/* Filter buttons */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1 self-start sm:self-auto">
              <button 
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Todos ({issues.length})
              </button>
              <button 
                onClick={() => setActiveFilter('critical')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activeFilter === 'critical' ? 'bg-rose-500 text-white shadow-xs font-extrabold' : 'text-slate-500 hover:text-rose-500'}`}
              >
                Críticos ({issues.filter(i => i.severity === 'critical').length})
              </button>
              <button 
                onClick={() => setActiveFilter('warning')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${activeFilter === 'warning' ? 'bg-amber-500 text-white shadow-xs font-extrabold' : 'text-slate-500 hover:text-amber-600'}`}
              >
                Advertencias ({issues.filter(i => i.severity === 'warning').length})
              </button>
            </div>
          </div>

          {filteredIssues.length === 0 ? (
            <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 animate-pulse" />
              <p className="text-xs text-slate-500 font-extrabold">¡No se encontraron inconsistencias en este filtro!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">La estructura cumple perfectamente las validaciones analizadas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredIssues.map((issue, idx) => (
                <div 
                  key={idx}
                  className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all hover:translate-x-1 ${
                    issue.severity === 'critical' 
                      ? 'bg-rose-50/50 border-rose-100 text-rose-950' 
                      : 'bg-amber-50/30 border-amber-100 text-amber-950'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${
                    issue.severity === 'critical' 
                      ? 'bg-rose-100 text-rose-600' 
                      : 'bg-amber-100 text-amber-600'
                  }`}>
                    {issue.severity === 'critical' ? (
                      <ShieldAlert className="w-4.5 h-4.5" />
                    ) : (
                      <AlertTriangle className="w-4.5 h-4.5" />
                    )}
                  </div>
                  
                  <div className="space-y-1.5 text-left flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800"></span>
                        <span>Indicador afectado: <span className="text-indigo-600 font-black">{issue.indicator}</span></span>
                      </span>
                      <span className={`inline-flex px-2 py-0.5 rounded-md font-extrabold text-[9px] uppercase tracking-wide ${
                        issue.severity === 'critical' 
                          ? 'bg-rose-100 text-rose-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {issue.severity === 'critical' ? 'Bloqueante' : 'Sugerencia'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-semibold leading-normal">
                      {issue.cause}
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] font-semibold border-t border-slate-200/50 pt-2.5">
                      <div>
                        <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Origen del Problema</span>
                        <span className="text-slate-700 font-extrabold">{issue.origin}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Registros Afectados</span>
                        <span className="text-slate-700 font-extrabold">{issue.affectedRecords}</span>
                      </div>
                      <div>
                        <span className="text-rose-500/80 block font-bold uppercase tracking-wider text-[9px]">Cantidad Esperada</span>
                        <span className="text-emerald-700 font-black">{issue.expectedCount}</span>
                      </div>
                      <div>
                        <span className="text-rose-500/80 block font-bold uppercase tracking-wider text-[9px]">Cantidad Encontrada</span>
                        <span className="text-rose-700 font-black">{issue.foundCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Panel: Auto-Correct or Upload Option */}
        {onCorrectData && (
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3 text-left">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 mt-0.5">
                <Wrench className="w-4.5 h-4.5" />
              </span>
              <div>
                <h5 className="font-extrabold text-slate-950 text-xs flex items-center gap-1.5">
                  Corrector Inteligente de Consistencia
                  <span className="bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-md animate-pulse">IA FIX</span>
                </h5>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed mt-0.5 max-w-lg">
                  ¿No deseas rehacer la encuesta? El motor de auto-corrección redistribuirá de manera proporcional los conteos, alineará las sumatorias, y truncará tenures y porcentajes para cumplir con el 100% de consistencia exigida por los Kpis.
                </p>
              </div>
            </div>

            <button
              onClick={handleAutoCorrect}
              disabled={isCorrecting}
              className={`w-full sm:w-auto px-5 py-3 text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                isConsistent 
                  ? 'bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed hover:shadow-none' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:scale-101'
              }`}
            >
              {isCorrecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Corrigiendo...</span>
                </>
              ) : (
                <>
                  <Wrench className="w-4 h-4" />
                  <span>Auto-Corregir Base de Datos</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
