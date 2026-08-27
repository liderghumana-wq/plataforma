import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, ShieldCheck, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { runPrompt25TestSuite, Prompt25TestSuiteSummary, Prompt25TestResult } from '../prompt25TestRunner';

export function Prompt25TestRunnerPanel() {
  const [summary, setSummary] = useState<Prompt25TestSuiteSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runPrompt25TestSuite();
      setSummary(res);
      setIsRunning(false);
    }, 300);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 text-left text-slate-800">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
              Suite de Pruebas Automatizadas — Prompt 25
            </span>
          </div>
          <h2 className="text-lg font-black text-white">
            Motor de Calidad, Trazabilidad y Confiabilidad del Informe (18 Pruebas)
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Verificación estricta de la regla absoluta: el sistema NO debe inventar, estimar ni completar información ausente. Validación de la trazabilidad completa desde la respuesta hasta la frase ejecutiva, EvidenceService, cálculo de IMC sin promedios y aislamiento por empresa.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
              <span>Ejecutando suite...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-emerald-200 fill-emerald-200" />
              <span>Ejecutar 18 Pruebas (Prompt 25)</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Stat Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 block">Total Pruebas</span>
            <span className="text-2xl font-black text-slate-900">{summary.totalTests}</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <span className="text-xs font-bold text-emerald-700 block">Pruebas Exitosas</span>
            <span className="text-2xl font-black text-emerald-700">{summary.passedCount}</span>
          </div>

          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-center">
            <span className="text-xs font-bold text-rose-700 block">Pruebas Fallidas</span>
            <span className="text-2xl font-black text-rose-700">{summary.failedCount}</span>
          </div>

          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 text-center">
            <span className="text-xs font-bold text-indigo-700 block">Estado Global</span>
            <span className={`text-xs font-black block mt-2 uppercase px-2.5 py-1 rounded-full ${
              summary.allPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {summary.allPassed ? '● 100% APROBADO' : '○ REVISIÓN REQUERIDA'}
            </span>
          </div>
        </div>
      )}

      {/* Test List Breakdown */}
      {summary && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">
              Resultados de Pruebas Unitarias Prompt 25
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              Ejecutado: {new Date(summary.timestamp).toLocaleTimeString('es-CO')}
            </span>
          </div>

          <div className="space-y-2">
            {summary.results.map((test) => {
              const isExpanded = expandedTestId === test.id;

              return (
                <div
                  key={test.id}
                  className={`rounded-2xl border transition-all ${
                    test.passed
                      ? 'bg-emerald-50/40 border-emerald-200/80 hover:bg-emerald-50/70'
                      : 'bg-rose-50/50 border-rose-200 hover:bg-rose-50/80'
                  }`}
                >
                  <div
                    onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                    className="p-4 flex items-start justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      {test.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-white/80 rounded border border-slate-200 text-slate-600">
                            {test.id}
                          </span>
                          <h4 className="text-xs font-black text-slate-900">{test.title}</h4>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1">{test.description}</p>
                        <p className="text-[11px] font-semibold text-slate-800 mt-1">{test.details}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        test.passed ? 'bg-emerald-200/60 text-emerald-900' : 'bg-rose-200/70 text-rose-900'
                      }`}>
                        {test.passed ? 'PASSED' : 'FAILED'}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && test.observedOutput && (
                    <div className="px-4 pb-4 border-t border-slate-200/50 pt-3 mt-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Estructura Observada (Prompt 25 IndicatorTrace / Evidence)
                      </span>
                      <pre className="p-3 bg-slate-900 text-emerald-300 text-[11px] font-mono rounded-xl overflow-x-auto max-h-48">
                        {JSON.stringify(test.observedOutput, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!summary && !isRunning && (
        <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
          <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
          <h4 className="text-xs font-black text-slate-800">Suite Presta para Ejecución</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Haga clic en el botón superior para ejecutar las 18 pruebas automatizadas de la arquitectura de calidad, trazabilidad y confiabilidad del informe de Prompt 25.
          </p>
        </div>
      )}
    </div>
  );
}
