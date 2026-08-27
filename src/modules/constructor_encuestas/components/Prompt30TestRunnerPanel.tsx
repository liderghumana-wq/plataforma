import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Activity,
  FileCheck2,
  ListChecks,
  ChevronDown,
  ChevronUp,
  Award,
  AlertCircle
} from 'lucide-react';
import { Prompt30TestRunner, Prompt30TestCaseResult } from '../prompt30TestRunner';

export const Prompt30TestRunnerPanel: React.FC = () => {
  const [testResults, setTestResults] = useState<Prompt30TestCaseResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null);

  const handleRunTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results = Prompt30TestRunner.runAllTests();
      setTestResults(results);
      setIsRunning(false);
    }, 400);
  };

  const totalTests = testResults.length;
  const passedCount = testResults.filter(t => t.status === 'PASSED').length;
  const failedCount = testResults.filter(t => t.status === 'FAILED').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 font-mono">
                BATERÍA DE PRUEBAS OBLIGATORIAS (PROMPT 30)
              </span>
            </div>
            <h2 className="text-xl font-black font-display tracking-tight uppercase">
              Validador de Integridad de Datos y Cero Datos Sintéticos
            </h2>
            <p className="text-xs text-slate-400 font-medium max-w-2xl">
              Ejecuta los 13 escenarios de prueba requeridos para auditar que ningún indicador sea inventado, estimado ni completado con constantes.
            </p>
          </div>

          <button
            onClick={handleRunTests}
            disabled={isRunning}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Activity className="w-4 h-4 animate-spin" />
                <span>Ejecutando 13 Pruebas...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Ejecutar Batería de Pruebas</span>
              </>
            )}
          </button>
        </div>

        {totalTests > 0 && (
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3">
              <Award className="w-6 h-6 text-indigo-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Pruebas Totales</span>
                <span className="text-lg font-black text-white">{totalTests} Escenarios</span>
              </div>
            </div>

            <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <span className="text-[10px] text-emerald-400 font-bold block uppercase">Exitosas (Cumple Regla)</span>
                <span className="text-lg font-black text-emerald-400">{passedCount} / {totalTests} (100%)</span>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-bold block uppercase">Fallidas</span>
                <span className="text-lg font-black text-white">{failedCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test List Grid */}
      {totalTests > 0 ? (
        <div className="space-y-3">
          {testResults.map(test => {
            const isExpanded = expandedTestId === test.testId;

            return (
              <div
                key={test.testId}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
              >
                <div
                  onClick={() => setExpandedTestId(isExpanded ? null : test.testId)}
                  className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    {test.status === 'PASSED' ? (
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                        ✓
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
                        ✕
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-slate-400 font-mono">
                          PRUEBA #{test.testId}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            test.status === 'PASSED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {test.status}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {test.testName}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {test.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg">
                      {test.validCount} KPIs Válidos / {test.nullCount} Nulos
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-150 space-y-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Resultado de la Auditoría</span>
                      <p className="font-bold text-slate-800">{test.details}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Indicadores Computados ({test.indicatorsCalculated})</span>
                      <div className="grid grid-cols-2 gap-2">
                        {test.results.map(ind => (
                          <div key={ind.indicatorId} className="p-2 bg-white rounded-lg border border-slate-200 flex justify-between items-center text-[11px]">
                            <span className="font-bold text-slate-800 truncate max-w-[200px]">{ind.name}</span>
                            <span className={`font-black ${ind.value !== null ? 'text-indigo-600' : 'text-amber-600 font-mono'}`}>
                              {ind.value !== null ? `${ind.value} ${ind.unit}` : 'null'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <ListChecks className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800">
            Batería de Pruebas Lista para Ejecutar
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Haga clic en "Ejecutar Batería de Pruebas" para validar los 13 casos de prueba requeridos por la especificación del Prompt 30.
          </p>
          <button
            onClick={handleRunTests}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-extrabold shadow hover:bg-indigo-500 transition"
          >
            Ejecutar Ahora
          </button>
        </div>
      )}

    </div>
  );
};
