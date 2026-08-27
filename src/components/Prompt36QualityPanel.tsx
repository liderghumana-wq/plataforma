import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Play,
  Database,
  RefreshCw,
  FileCheck,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { DemographicsData } from '../types';
import { DataQualityEnginePrompt29 } from '../core/data_quality/dataQualityEngine';
import { ArtificialDataDetector } from '../core/data_quality/artificialDataDetector';
import { runPrompt36TestSuite, Prompt36SuiteSummary } from '../core/data_quality/prompt36TestRunner';

interface Prompt36QualityPanelProps {
  data: DemographicsData | null;
  rawRecords?: Record<string, any>[];
}

export function Prompt36QualityPanel({ data, rawRecords = [] }: Prompt36QualityPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'states' | 'detector' | 'tests'>('overview');
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testSummary, setTestSummary] = useState<Prompt36SuiteSummary | null>(null);

  // Run Prompt 36 Diagnostic
  const recordsToAnalyze = rawRecords.length > 0 ? rawRecords : (data?.rawEmployees || []);
  const diagnostic = DataQualityEnginePrompt29.runDiagnostic(recordsToAnalyze);
  const artificialWarnings = ArtificialDataDetector.detectArtificialData(recordsToAnalyze);

  const handleRunTests = () => {
    setIsTestRunning(true);
    setTimeout(() => {
      const summary = runPrompt36TestSuite();
      setTestSummary(summary);
      setIsTestRunning(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left animate-fade-in select-none">
      
      {/* Header Banner - Prompt 36 Data Quality Engine */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl border ${
              diagnostic.hasCriticalBlockers 
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' 
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}>
              {diagnostic.hasCriticalBlockers ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Prompt 36 • Motor de Calidad, Completitud y Trazabilidad</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                DIAGNÓSTICO CENTRAL DE CALIDAD DE DATOS
              </h2>
              <p className="text-slate-400 text-xs mt-0.5 max-w-2xl">
                Cero información estimación o inventada. Clasificación estricta en 10 estados de calidad antes de llegar al Dashboard o Informe.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex items-center gap-2 bg-slate-800 px-3.5 py-1.5 rounded-2xl border border-slate-700 text-xs font-mono">
              <Database className="w-4 h-4 text-indigo-400" />
              <span>Score de Calidad: <strong className="text-indigo-300">{diagnostic.overallQualityScore !== null ? `${diagnostic.overallQualityScore}%` : 'S/I'}</strong></span>
            </div>
            <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
              diagnostic.canGenerateReport 
                ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                : 'bg-rose-950 text-rose-300 border-rose-800'
            }`}>
              {diagnostic.canGenerateReport ? '🟢 APTO PARA ANÁLISIS DIRECTIVO' : '🔴 REQUIERE REVISIÓN FUENTE'}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Registros Auditados</span>
          <div className="text-xl font-black text-slate-900 font-mono">{diagnostic.totalCheckedRecords}</div>
          <span className="text-[10px] text-slate-500">Colaboradores</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-emerald-700 uppercase block font-mono">Completitud Global</span>
          <div className="text-xl font-black text-emerald-700 font-mono">{diagnostic.completenessPct !== null ? `${diagnostic.completenessPct}%` : '0%'}</div>
          <span className="text-[10px] text-emerald-600">Campos completos</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200 bg-indigo-50/30 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-indigo-700 uppercase block font-mono">Validez de Estructura</span>
          <div className="text-xl font-black text-indigo-700 font-mono">{diagnostic.validityPct !== null ? `${diagnostic.validityPct}%` : '0%'}</div>
          <span className="text-[10px] text-indigo-600">Tipos de dato válidos</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-purple-200 bg-purple-50/30 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-purple-700 uppercase block font-mono">Coherencia Lógica</span>
          <div className="text-xl font-black text-purple-700 font-mono">{diagnostic.consistencyPct !== null ? `${diagnostic.consistencyPct}%` : '0%'}</div>
          <span className="text-[10px] text-purple-600">Sin contradicciones</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-amber-700 uppercase block font-mono">Adherencia Rango</span>
          <div className="text-xl font-black text-amber-700 font-mono">{diagnostic.rangeAdherencePct !== null ? `${diagnostic.rangeAdherencePct}%` : '0%'}</div>
          <span className="text-[10px] text-amber-600">Peso, estatura, edad</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-rose-700 uppercase block font-mono">Duplicados</span>
          <div className="text-xl font-black text-rose-700 font-mono">{diagnostic.duplicatesCount}</div>
          <span className="text-[10px] text-rose-600">Registros idénticos</span>
        </div>
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Resumen de Módulos (8 Módulos)
        </button>

        <button
          onClick={() => setActiveTab('states')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'states' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          10 Estados de Calidad & Hallazgos ({diagnostic.problematicFields.length})
        </button>

        <button
          onClick={() => setActiveTab('detector')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'detector' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Detector de Datos Artificiales ({artificialWarnings.length})
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'tests' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Play className="w-4 h-4" />
          Suite de Pruebas Prompt 36
        </button>
      </div>

      {/* TAB 1: MODULE SCORES OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-900 font-display uppercase tracking-wider">
            Evaluación por Módulo Empresarial (Sección 5)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(diagnostic.moduleScores).map(mod => (
              <div key={mod.moduleName} className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-3xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-slate-900 text-xs">{mod.moduleName}</h4>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                    mod.alertLevel === 'GREEN' ? 'bg-emerald-100 text-emerald-800' :
                    mod.alertLevel === 'YELLOW' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {mod.alertLevel}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 font-mono">
                    <span>Completitud:</span>
                    <span>{mod.completenessPct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${mod.alertLevel === 'GREEN' ? 'bg-emerald-500' : mod.alertLevel === 'YELLOW' ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${mod.completenessPct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-100">
                  <span>Llenos: {mod.totalFilledFields}/{mod.totalPossibleFields}</span>
                  {mod.criticalMissingCount > 0 && (
                    <span className="text-rose-600 font-bold">Críticos: {mod.criticalMissingCount}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: 10 QUALITY STATES & PROBLEMATIC FIELDS */}
      {activeTab === 'states' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 font-display uppercase tracking-wider">
                Auditoría de Celdas & Clasificación de Estado
              </h3>
              <p className="text-xs text-slate-500">Mapeo individual a los 10 estados estandarizados de Prompt 36.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
              {diagnostic.problematicFields.length} Hallazgos Registrados
            </span>
          </div>

          {diagnostic.problematicFields.length > 0 ? (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3">Fila</th>
                    <th className="p-3">Variable</th>
                    <th className="p-3">Módulo</th>
                    <th className="p-3">Valor Original</th>
                    <th className="p-3">Estado Prompt 36</th>
                    <th className="p-3">Observación / Causa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                  {diagnostic.problematicFields.map((field, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-600">#{field.rowNumber}</td>
                      <td className="p-3 font-bold text-slate-900 font-sans">{field.variableName}</td>
                      <td className="p-3 text-slate-500 font-sans">{field.moduleName}</td>
                      <td className="p-3 text-slate-800">{String(field.originalValue ?? 'null')}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          field.status === 'MISSING' ? 'bg-rose-100 text-rose-800' :
                          field.status === 'OUT_OF_RANGE' ? 'bg-amber-100 text-amber-800' :
                          field.status === 'PREFER_NOT_TO_ANSWER' ? 'bg-indigo-100 text-indigo-800' :
                          field.status === 'INCONSISTENT' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {field.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-sans">{field.reason || 'S/D'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-slate-700">¡Excelente! No se detectaron celdas problemáticas ni contradicciones en la base de datos.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ARTIFICIAL DATA DETECTOR */}
      {activeTab === 'detector' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 font-display uppercase tracking-wider">
              Detector de Datos Artificiales & Fallbacks Indeseados
            </h3>
            <p className="text-xs text-slate-500">Escanea patrones de relleno sintético asignados sin respuesta original en fuente.</p>
          </div>

          {artificialWarnings.length > 0 ? (
            <div className="space-y-3">
              {artificialWarnings.map((warn, idx) => (
                <div key={idx} className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 font-display">{warn.variableName} ({warn.fieldKey})</span>
                    <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 rounded-full font-black text-[10px]">
                      {warn.affectedRowsCount} Filas Afectadas
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium leading-relaxed">{warn.reason}</p>
                  <p className="text-amber-900 font-bold text-[11px] bg-white/80 p-2 rounded-xl border border-amber-200/60">
                    💡 Acción Recomendada: {warn.recommendation}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-slate-700">No se detectaron patrones de datos artificiales ni fallbacks sospechosos en el conjunto de datos.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUTOMATED TEST SUITE RUNNER */}
      {activeTab === 'tests' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 font-display">Suite de Pruebas Automatizada Prompt 36</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ejecuta la suite oficial de verificación de 10 pruebas para asegurar que la plataforma cumple estrictamente todas las reglas de calidad y trazabilidad.
              </p>
            </div>
            <button
              onClick={handleRunTests}
              disabled={isTestRunning}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isTestRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Ejecutar Suite Prompt 36
            </button>
          </div>

          {testSummary ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                testSummary.allPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-3">
                  {testSummary.allPassed ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <AlertTriangle className="w-6 h-6 text-rose-600" />}
                  <div>
                    <h4 className="text-xs font-black">
                      {testSummary.allPassed ? '¡Pruebas Prompt 36 Superadas al 100%!' : `Atención: ${testSummary.failedCount} prueba(s) fallaron.`}
                    </h4>
                    <p className="text-[11px] opacity-90">{testSummary.passedCount} de {testSummary.total} escenarios aprobados.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {testSummary.results.map(test => (
                  <div key={test.id} className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    test.passed ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] font-bold uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">{test.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        test.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {test.passed ? 'PASÓ' : 'FALLÓ'}
                      </span>
                    </div>
                    <h5 className="font-extrabold text-slate-900">{test.title}</h5>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{test.description}</p>
                    <div className="p-2 bg-white rounded-xl border border-slate-200/80 font-mono text-[10px] text-slate-700">
                      <strong>Observado:</strong> {test.observedResult}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              <Play className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-bold text-slate-600">Haz clic en 'Ejecutar Suite Prompt 36' para validar la integridad de la plataforma.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
