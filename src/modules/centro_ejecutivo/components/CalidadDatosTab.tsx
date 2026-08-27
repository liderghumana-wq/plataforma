import React from 'react';
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  FileSpreadsheet, 
  AlertTriangle, 
  Database,
  ArrowRight
} from 'lucide-react';
import { DataQualityDiagnostic } from '../../../core/data_quality/types';
import { CentroEjecutivoTab } from '../types/centroEjecutivo.types';

interface CalidadDatosTabProps {
  diagnostic: DataQualityDiagnostic;
  onNavigateTab: (tab: CentroEjecutivoTab) => void;
}

export const CalidadDatosTab: React.FC<CalidadDatosTabProps> = ({
  diagnostic,
  onNavigateTab
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            Auditoría Automática de Datos
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Índice Global de Calidad de Datos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Diagnóstico matemático en tiempo real ejecutado por DataQualityEngine sobre el censo maestro.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`text-2xl sm:text-3xl font-black px-4 py-2 rounded-2xl border ${
            diagnostic.overallQualityScore >= 90
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : diagnostic.overallQualityScore >= 75
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            {diagnostic.overallQualityScore}%
          </div>
        </div>
      </div>

      {/* 4 Core Dimensions Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 block">Completitud</span>
          <span className="text-2xl font-extrabold text-slate-900">{diagnostic.completenessPct}%</span>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${diagnostic.completenessPct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 block">Validez</span>
          <span className="text-2xl font-extrabold text-slate-900">{diagnostic.validityPct}%</span>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-emerald-600 h-1.5 rounded-full" style={{ width: `${diagnostic.validityPct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 block">Consistencia</span>
          <span className="text-2xl font-extrabold text-slate-900">{diagnostic.consistencyPct}%</span>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${diagnostic.consistencyPct}%` }} />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5">
          <span className="text-xs font-semibold text-slate-500 block">Rangos Válidos</span>
          <span className="text-2xl font-extrabold text-slate-900">{diagnostic.rangeAdherencePct}%</span>
          <div className="w-full bg-slate-100 rounded-full h-1.5">
            <div className="bg-amber-600 h-1.5 rounded-full" style={{ width: `${diagnostic.rangeAdherencePct}%` }} />
          </div>
        </div>
      </div>

      {/* Details: Modules & Critical Missing Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-600" />
            Calidad por Módulo de Información
          </h3>

          <div className="space-y-3">
            {diagnostic.moduleScores.map((mod, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">{mod.moduleName}</span>
                  <span className="text-slate-900">{mod.qualityScore}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      mod.qualityScore >= 85 ? 'bg-emerald-500' : mod.qualityScore >= 65 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${mod.qualityScore}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Observations & Actions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Observaciones Críticas
            </h3>

            <div className="space-y-2.5">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Diagnóstico:</span>
                <p className="font-semibold text-slate-800 leading-relaxed">
                  {diagnostic.diagnosticSummaryMessage}
                </p>
              </div>

              {diagnostic.missingCriticalFieldsList.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs space-y-1.5">
                  <span className="text-[10px] font-bold text-rose-700 uppercase block">Campos críticos ausentes:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {diagnostic.missingCriticalFieldsList.map((f, i) => (
                      <span key={i} className="px-2 py-0.5 bg-white text-rose-800 rounded-md font-bold text-[11px] border border-rose-200">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500">
                Total de registros auditados: <strong>{diagnostic.totalCheckedRecords}</strong> | Columnas: <strong>{diagnostic.totalCheckedColumns}</strong> | Duplicados: <strong>{diagnostic.duplicatesCount}</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('acciones')}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              Ver Acciones de Calidad
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
