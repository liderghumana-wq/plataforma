import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, ShieldCheck, RefreshCw, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { runPrompt22TestSuite, TestSuiteSummaryP22, TestResultP22 } from '../prompt22TestRunner';

export function Prompt22TestRunnerPanel() {
  const [summary, setSummary] = useState<TestSuiteSummaryP22 | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runPrompt22TestSuite();
      setSummary(res);
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 text-left text-slate-800">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
              Suite de Pruebas Automatizadas — Prompt 22
            </span>
          </div>
          <h2 className="text-lg font-black text-white">
            Auditoría de Calidad y Cumplimiento Normativo (17 Escenarios)
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Verificación automática de reglas de oro: completitud de encuestas, parametrización de catálogos por empresa, preguntas condicionales, tratamiento de "Prefiero no responder", cálculo determinístico de IMC, rangos fisiológicos, autoguardado, exportación estandarizada y aislamiento multi-tenant.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
              <span>Ejecutando suite...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 text-emerald-300 fill-emerald-300" />
              <span>Ejecutar 17 Pruebas</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Stat Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <span className="text-xs font-bold text-slate-500 block">Total Pruebas</span>
            <span className="text-2xl font-black text-slate-900">{summary.total}</span>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
            <span className="text-xs font-bold text-emerald-700 block">Pruebas Exitosas</span>
            <span className="text-2xl font-black text-emerald-700">{summary.passedCount}</span>
          </div>

          <div className={`p-4 rounded-2xl border text-center ${
            summary.failedCount === 0 ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200'
          }`}>
            <span className={`text-xs font-bold block ${summary.failedCount === 0 ? 'text-slate-500' : 'text-rose-700'}`}>
              Pruebas Fallidas
            </span>
            <span className={`text-2xl font-black ${summary.failedCount === 0 ? 'text-slate-900' : 'text-rose-700'}`}>
              {summary.failedCount}
            </span>
          </div>

          <div className={`p-4 rounded-2xl border text-center ${
            summary.allPassed ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-amber-500 text-white border-amber-500'
          }`}>
            <span className="text-xs font-extrabold uppercase tracking-wider block opacity-90">Resultado Global</span>
            <span className="text-lg font-black block mt-0.5">
              {summary.allPassed ? '✓ 100% APROBADO' : '⚠ ATENCIÓN'}
            </span>
          </div>
        </div>
      )}

      {/* Test List */}
      {summary && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
            Detalle de Resultados ({summary.results.length} Casos de Prueba)
          </h3>

          <div className="space-y-2">
            {summary.results.map((test) => {
              const isExpanded = expandedTestId === test.id;

              return (
                <div
                  key={test.id}
                  className={`rounded-2xl border transition-all ${
                    test.passed ? 'bg-white border-slate-200/80 hover:border-slate-300' : 'bg-rose-50/50 border-rose-200'
                  }`}
                >
                  <div
                    onClick={() => setExpandedTestId(isExpanded ? null : test.id)}
                    className="p-4 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {test.passed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-600" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">
                            {test.id}
                          </span>
                          <h4 className="text-xs font-extrabold text-slate-900">
                            {test.title}
                          </h4>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {test.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                        test.passed
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {test.passed ? 'APROBADO' : 'FALLIDO'}
                      </span>

                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs space-y-2 bg-slate-50/50 rounded-b-2xl">
                      <div>
                        <span className="font-bold text-slate-700 block">Detalles de Ejecución:</span>
                        <p className="text-slate-600 font-mono text-[11px] bg-white p-2.5 rounded-xl border border-slate-200 mt-1">
                          {test.details}
                        </p>
                      </div>

                      {test.observedOutput && (
                        <div>
                          <span className="font-bold text-slate-700 block">Salida Observada:</span>
                          <pre className="text-[10px] font-mono bg-slate-900 text-cyan-300 p-2.5 rounded-xl overflow-x-auto mt-1">
                            {JSON.stringify(test.observedOutput, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      )}

      {!summary && !isRunning && (
        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
          <Play className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-xs font-bold text-slate-800">Pruebas Automatizadas Listas</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Haga clic en "Ejecutar 17 Pruebas" para validar la totalidad de los requerimientos de calidad de datos, dinamicidad de catálogos y aislamiento de empresas exigidos por el PROMPT 22.
          </p>
        </div>
      )}

    </div>
  );
}
