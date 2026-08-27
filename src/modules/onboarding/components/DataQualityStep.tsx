import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  FileSpreadsheet,
  Layers,
  HelpCircle,
  TrendingUp,
  Info
} from 'lucide-react';
import { onboardingService } from '../services/onboardingService';
import { ALL_BUSINESS_MODULES } from '../../../core/data_quality/types';

interface DataQualityStepProps {
  onNext: () => void;
  onPrev: () => void;
  activeCompanyId: string;
}

export const DataQualityStep: React.FC<DataQualityStepProps> = ({ onNext, onPrev, activeCompanyId }) => {
  const colaboradores = onboardingService.getCompanyColaboradores(activeCompanyId);
  const qualityDiag = onboardingService.getDataQualityDiagnostic(activeCompanyId);

  const hasData = colaboradores.length > 0;
  const score = qualityDiag.overallQualityScore;

  // Semaphore determination
  let semaphore: 'GREEN' | 'YELLOW' | 'RED' | 'NO_DATA' = 'NO_DATA';
  let semaphoreLabel = 'Sin información';
  let semaphoreBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';

  if (!hasData || score === null) {
    semaphore = 'NO_DATA';
    semaphoreLabel = 'Sin Información Suficiente';
    semaphoreBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200';
  } else if (score >= 90) {
    semaphore = 'GREEN';
    semaphoreLabel = '🟢 Óptimo (≥90%)';
    semaphoreBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (score >= 70) {
    semaphore = 'YELLOW';
    semaphoreLabel = '🟡 Requiere Revisión (70-89%)';
    semaphoreBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
  } else {
    semaphore = 'RED';
    semaphoreLabel = '🔴 Requiere Corrección (<70%)';
    semaphoreBadgeClass = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Paso 5 de 7 • Auditoría de Información
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Calidad de Mis Datos</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Diagnóstico automático de completitud, validez y congruencia de los datos del personal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${semaphoreBadgeClass}`}>
            {semaphoreLabel}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
            [A] Real DataQualityEngine
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Sin información suficiente para calcular este indicador</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Aún no se registran colaboradores en la empresa activa. Regresa al paso anterior para cargar el censo vía Excel o registro manual.
          </p>
        </div>
      ) : (
        <>
          {/* Main KPI Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Registros Totales</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{colaboradores.length}</span>
              <span className="text-[11px] text-slate-400">100% evaluados</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Calidad General</span>
              <span className="text-2xl font-bold text-indigo-600 mt-1 block">{score !== null ? `${score}%` : 'N/A'}</span>
              <span className="text-[11px] text-slate-400">Índice ponderado</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Completitud</span>
              <span className="text-2xl font-bold text-emerald-600 mt-1 block">
                {qualityDiag.completenessPct !== null ? `${qualityDiag.completenessPct}%` : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-400">Celdas diligenciadas</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Validez de Formatos</span>
              <span className="text-2xl font-bold text-blue-600 mt-1 block">
                {qualityDiag.validityPct !== null ? `${qualityDiag.validityPct}%` : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-400">Sin errores de tipo</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Duplicados</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">{qualityDiag.duplicatesCount}</span>
              <span className="text-[11px] text-slate-400">Cédulas repetidas</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block">Campos Críticos Faltantes</span>
              <span className={`text-2xl font-bold mt-1 block ${qualityDiag.missingCriticalFieldsCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {qualityDiag.missingCriticalFieldsCount}
              </span>
              <span className="text-[11px] text-slate-400">Bloquean reportes</span>
            </div>
          </div>

          {/* Module Breakdown Cards */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Desglose de Calidad por Dimensión SG-SST</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {ALL_BUSINESS_MODULES.map(moduleName => {
                const scoreMod = qualityDiag.moduleScores[moduleName];
                const pct = scoreMod ? scoreMod.completenessPct : 0;
                const isAlert = scoreMod && scoreMod.criticalMissingCount > 0;

                return (
                  <div key={moduleName} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{moduleName}</span>
                      <span className={`text-xs font-extrabold ${pct >= 90 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {pct}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${pct >= 90 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{scoreMod ? `${scoreMod.totalValidFields}/${scoreMod.totalPossibleFields} válidos` : '0/0'}</span>
                      {isAlert && <span className="text-rose-600 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Crítico</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Observations List */}
          {qualityDiag.problematicFields.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Observaciones y Hallazgos de Calidad ({qualityDiag.problematicFields.length})</h3>
                <span className="text-xs text-slate-500">Mostrando principales alertas</span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {qualityDiag.problematicFields.slice(0, 8).map((prob, idx) => (
                  <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-700 flex-1">
                      <span className="font-bold text-slate-900">Fila {prob.rowNumber} • {prob.variableName}: </span>
                      <span>{prob.reason || 'Dato ausente o inválido'}</span>
                      {prob.isCritical && <span className="ml-2 font-bold text-rose-600">[Campo Crítico]</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Navigation Footer */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Colaboradores
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          Siguiente: Encuesta
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
