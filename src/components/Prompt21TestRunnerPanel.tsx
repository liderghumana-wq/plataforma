import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, AlertTriangle, RefreshCw, ShieldCheck, FileCheck } from 'lucide-react';
import { runPrompt21TestSuite, TestSuiteSummary } from '../modules/constructor_encuestas/prompt21TestRunner';

export function Prompt21TestRunnerPanel() {
  const [testSummary, setTestSummary] = useState<TestSuiteSummary | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const summary = runPrompt21TestSuite();
      setTestSummary(summary);
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-left select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Verificación de Calidad Prompt 21</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-display">
            Suite de Pruebas de Integridad de Encuestas
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
            Ejecuta de forma automatizada las 12 pruebas obligatorias para validar que la plataforma no inventa datos, procesa campos obligatorios, preserva categorías como "PREFIERO_NO_RESPONDER" y maneja catálogos dinámicos por empresa.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white rounded-2xl text-xs font-black shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all cursor-pointer flex items-center justify-center gap-2.5 shrink-0"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Ejecutando Pruebas...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Ejecutar Suite de Pruebas (12/12)</span>
            </>
          )}
        </button>
      </div>

      {testSummary && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary status header banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between flex-wrap gap-4 ${
            testSummary.allPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}>
            <div className="flex items-center gap-3">
              {testSummary.allPassed ? (
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
              ) : (
                <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-black">
                  {testSummary.allPassed
                    ? '¡Todas las pruebas han sido superadas con éxito! (100% Verificado)'
                    : `Atención: ${testSummary.failedCount} prueba(s) fallaron.`}
                </h4>
                <p className="text-xs opacity-90 font-medium">
                  {testSummary.passedCount} de {testSummary.total} escenarios de prueba validados correctamente.
                </p>
              </div>
            </div>

            <span className={`text-xs font-black px-3 py-1 rounded-full border ${
              testSummary.allPassed ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'
            }`}>
              {testSummary.passedCount} / {testSummary.total} Aprobadas
            </span>
          </div>

          {/* Test Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testSummary.results.map((test) => (
              <div
                key={test.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  test.passed ? 'bg-slate-50/80 border-slate-200/80' : 'bg-rose-50/50 border-rose-200'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider font-mono bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                      {test.id}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      test.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {test.passed ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                      <span>{test.passed ? 'PASÓ' : 'FALLÓ'}</span>
                    </span>
                  </div>

                  <h5 className="text-xs font-extrabold text-slate-900">{test.title}</h5>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{test.description}</p>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-[11px] font-mono text-slate-700 space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Resultado Observado:</p>
                  <p className="truncate text-slate-800 font-semibold">{test.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
