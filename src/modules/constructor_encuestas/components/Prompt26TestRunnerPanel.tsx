import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  ShieldCheck, 
  Terminal, 
  AlertOctagon, 
  Check, 
  ChevronDown, 
  ChevronRight,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { runPrompt26TestSuite, Prompt26TestSuiteSummary, Prompt26TestResult } from '../prompt26TestRunner';

export function Prompt26TestRunnerPanel() {
  const [testSummary, setTestSummary] = useState<Prompt26TestSuiteSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<string | null>(null);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const summary = runPrompt26TestSuite();
      setTestSummary(summary);
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 text-left text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
              Suite Pruebas de Validación y Bloqueo — Prompt 26
            </span>
          </div>
          <h2 className="text-xl font-black text-white">
            Suite Completa de 15 Pruebas de Validación
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
            Ejecuta verificaciones automatizadas sobre completitud, bloqueo de informe oficial, clasificación de criticidad, catálogo no parametrizado, contradicciones y marcas de borrador.
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-lg transition-all flex items-center gap-2.5 cursor-pointer shrink-0 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Ejecutando Pruebas...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white text-white" />
              <span>Ejecutar Suite (15 Pruebas)</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Box */}
      {testSummary && (
        <div className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
          testSummary.allPassed ? 'bg-emerald-950 text-emerald-100 border-emerald-700' : 'bg-rose-950 text-rose-100 border-rose-700'
        }`}>
          <div className="flex items-center gap-3">
            {testSummary.allPassed ? (
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            ) : (
              <AlertOctagon className="w-8 h-8 text-rose-400 shrink-0" />
            )}
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider">
                {testSummary.allPassed ? '¡Todas las Pruebas Aprobadas Exitosamente (100%)!' : 'Se Detectaron Fallos en la Suite de Pruebas'}
              </h3>
              <p className="text-xs opacity-90 mt-0.5">
                {testSummary.passedCount} de {testSummary.totalTests} escenarios superados. Ejecutado el: {new Date(testSummary.timestamp).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 bg-emerald-900/80 text-emerald-200 border border-emerald-700 font-mono font-black text-xs rounded-xl">
              {testSummary.passedCount} PASS
            </span>
            {testSummary.failedCount > 0 && (
              <span className="px-3 py-1.5 bg-rose-900/80 text-rose-200 border border-rose-700 font-mono font-black text-xs rounded-xl">
                {testSummary.failedCount} FAIL
              </span>
            )}
          </div>
        </div>
      )}

      {/* Test List Table */}
      {testSummary && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center justify-between">
            <span>Resultados Detallados por Escenario:</span>
            <span className="text-slate-400 font-normal">Haga clic en cada prueba para expandir la salida observada</span>
          </h3>

          <div className="space-y-2">
            {testSummary.results.map((res: Prompt26TestResult) => {
              const isExpanded = expandedTestId === res.id;
              return (
                <div
                  key={res.id}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    res.passed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-rose-50/40 border-rose-200'
                  }`}
                >
                  <button
                    onClick={() => setExpandedTestId(isExpanded ? null : res.id)}
                    className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/80"
                  >
                    <div className="flex items-center gap-3">
                      {res.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-xs text-slate-900">{res.id}</span>
                          <span className="font-black text-xs text-slate-900">{res.title}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{res.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase font-mono ${
                        res.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {res.passed ? 'PASSED' : 'FAILED'}
                      </span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </button>

                  {/* Expanded Detail Box */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-900 text-slate-200 border-t border-slate-800 font-mono text-xs space-y-2">
                      <p className="text-emerald-400 font-bold">Detalles: {res.details}</p>
                      {res.observedOutput && (
                        <div>
                          <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">Salida Observada (Estructura Objeto):</span>
                          <pre className="p-3 bg-slate-950 rounded-xl overflow-x-auto text-[11px] text-slate-300 border border-slate-800">
                            {JSON.stringify(res.observedOutput, null, 2)}
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

      {!testSummary && (
        <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 space-y-3">
          <Terminal className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Suite de Pruebas Lista para Ejecución</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Haga clic en "Ejecutar Suite" para validar el motor de verificación pre-informe, las reglas de bloqueo por datos faltantes y la marca de agua de borradores.
          </p>
        </div>
      )}

    </div>
  );
}
