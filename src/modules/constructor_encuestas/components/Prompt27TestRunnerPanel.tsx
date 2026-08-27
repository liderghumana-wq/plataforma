import React, { useState } from 'react';
import { 
  Play, CheckCircle2, XCircle, Clock, ShieldCheck, Cpu, 
  Layers, ChevronDown, ChevronUp, FileCode2, Sparkles, RefreshCw 
} from 'lucide-react';
import { Prompt27TestRunner, TestResultP27 } from '../prompt27TestRunner';

export const Prompt27TestRunnerPanel: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<TestResultP27[]>([]);
  const [stats, setStats] = useState<{ passed: number; failed: number; totalMs: number } | null>(null);
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null);

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setStats(null);

    // Short simulated delay for smooth UI transition
    await new Promise(r => setTimeout(r, 400));

    const { results, passedCount, failedCount, totalMs } = await Prompt27TestRunner.runAllTests('emp-p27-suite');

    setTestResults(results);
    setStats({ passed: passedCount, failed: failedCount, totalMs });
    setIsRunning(false);
  };

  const toggleExpand = (id: number) => {
    setExpandedTestId(expandedTestId === id ? null : id);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-6 shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full uppercase tracking-wider">
              SUITE DE PRUEBAS AUTOMATIZADAS (PROMPT 27)
            </span>
            <span className="text-slate-400 text-xs font-mono">
              15 Pruebas Unitarias e Integradas
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Verificación de Encuesta Maestra, Banco de Preguntas y Normalización
          </h2>
          <p className="text-xs text-slate-400">
            Valida los 11 módulos, cálculos automáticos de edad y antigüedad, reglas biométricas, flags sensibles y compatibilidad de pipeline.
          </p>
        </div>

        <div>
          <button
            type="button"
            disabled={isRunning}
            onClick={handleRunTests}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Ejecutando Suite...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Ejecutar Suite 15 Pruebas (P27)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono">Pasadas</span>
              <p className="text-lg font-black text-emerald-400">{stats.passed} / 15</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono">Fallidas</span>
              <p className="text-lg font-black text-rose-400">{stats.failed}</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono">Tiempo Total</span>
              <p className="text-lg font-black text-sky-400">{stats.totalMs} ms</p>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono">Estado Global</span>
              <p className="text-xs font-bold text-white">
                {stats.failed === 0 ? '100% CUMPLIMIENTO' : 'REVISIÓN REQUERIDA'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS LIST */}
      <div className="space-y-3">
        {testResults.length > 0 ? (
          testResults.map(test => {
            const isExpanded = expandedTestId === test.id;
            return (
              <div
                key={test.id}
                className={`bg-slate-950/60 rounded-2xl border transition-all ${
                  test.status === 'PASSED' ? 'border-slate-800/80 hover:border-emerald-500/30' : 'border-rose-500/50 bg-rose-950/10'
                }`}
              >
                <div
                  onClick={() => toggleExpand(test.id)}
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-400">
                      #{test.id}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{test.name}</h4>
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-400 text-[9px] rounded-md font-mono">
                          {test.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{test.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-[10px] text-slate-500 font-mono">{test.durationMs} ms</span>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      test.status === 'PASSED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    }`}>
                      {test.status}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {isExpanded && test.details && (
                  <div className="px-4 pb-4 border-t border-slate-900 pt-3">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300">
                      <span className="text-emerald-400 font-bold block mb-1">Detalle del Test:</span>
                      {test.details}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="bg-slate-950/40 p-10 rounded-2xl border border-slate-800 text-center space-y-3">
            <Cpu className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">Suite de Pruebas Prompt 27 Lista para Ejecución</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Haga clic en el botón superior "Ejecutar Suite 15 Pruebas (P27)" para correr la validación integral automatizada.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
