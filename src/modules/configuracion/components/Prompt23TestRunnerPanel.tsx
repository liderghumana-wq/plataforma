import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Shield, Building2, RefreshCw, Layers } from 'lucide-react';
import { runPrompt23MultiTenantTests, Prompt23TestResult } from '../prompt23TestRunner';

export function Prompt23TestRunnerPanel() {
  const [isRunning, setIsRunning] = useState(false);
  const [testSummary, setTestSummary] = useState<{
    total: number;
    passed: number;
    failed: number;
    results: Prompt23TestResult[];
  } | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setTimeout(async () => {
      const summary = await runPrompt23MultiTenantTests();
      setTestSummary(summary);
      setIsRunning(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs p-6 md:p-8 space-y-6 text-left select-none">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Suite de Pruebas Multiempresa PROMPT 23</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-display flex items-center gap-2">
            <span>Verificación de Aislamiento, Unicidad y Regla Sin Fallbacks</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Ejecuta las pruebas automatizadas para comprobar que Empresa A y Empresa B están completamente aisladas, que los códigos son únicos por empresa y que los datos no parametrizados se marcan como NOT_CONFIGURED sin inventar datos ni usar fallbacks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRunTests}
          disabled={isRunning}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Ejecutando Pruebas...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Ejecutar Pruebas Multiempresa</span>
            </>
          )}
        </button>
      </div>

      {testSummary && (
        <div className="space-y-4 animate-fade-in">
          {/* Metrics summary */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <span className="text-2xl font-black text-slate-900 block">{testSummary.total}</span>
              <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Total Pruebas</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="text-2xl font-black text-emerald-700 block">{testSummary.passed}</span>
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider">Aprobadas (100%)</span>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-center">
              <span className="text-2xl font-black text-rose-700 block">{testSummary.failed}</span>
              <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider">Fallidas</span>
            </div>
          </div>

          {/* Test results list */}
          <div className="space-y-2.5">
            {testSummary.results.map((r) => (
              <div
                key={r.id}
                className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                  r.passed ? 'bg-emerald-50/40 border-emerald-200/80' : 'bg-rose-50/40 border-rose-200/80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="font-extrabold text-slate-900">{r.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium pl-6">{r.description}</p>
                  <p className="text-[11px] text-slate-800 font-bold pl-6 italic">{r.details}</p>
                </div>

                {r.dataSample && (
                  <pre className="text-[10px] font-mono bg-white p-2.5 rounded-xl border border-slate-200/80 text-slate-700 overflow-x-auto max-w-xs shrink-0">
                    {JSON.stringify(r.dataSample, null, 2)}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
