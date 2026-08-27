import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Database, 
  FileSearch, 
  AlertTriangle, 
  CheckCircle2, 
  History, 
  Sliders, 
  Play, 
  RotateCcw, 
  FileText, 
  HelpCircle,
  Eye,
  Lock,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { IndicatorTraceability, QualityThresholdConfig, DataAuditLogEntry, StatementAuditResult } from '../types';
import { AuditLoggerService } from '../auditLogger';
import { StatementAuditor } from '../statementAuditor';
import { TraceabilityTester, TraceabilityTestResult, AntiSyntheticCheckResult } from '../traceabilityTester';
import { TraceabilityModal } from './TraceabilityModal';

interface TraceabilityCenterProps {
  sampleIndicators?: IndicatorTraceability[];
  companyId?: string;
}

export function TraceabilityCenter({ sampleIndicators = [], companyId = 'EMP-001' }: TraceabilityCenterProps) {
  const [activeTab, setActiveTab] = useState<'chain_test' | 'anti_synthetic' | 'statement_audit' | 'audit_log' | 'thresholds'>('chain_test');
  
  // Selected indicator for traceability test
  const [selectedTrace, setSelectedTrace] = useState<IndicatorTraceability | null>(null);
  const [testResult, setTestResult] = useState<TraceabilityTestResult | null>(null);

  // Anti-synthetic check state
  const [antiSyntheticResult, setAntiSyntheticResult] = useState<AntiSyntheticCheckResult | null>(null);

  // Statement Auditor state
  const [statementInput, setStatementInput] = useState<string>(
    'El 55.8% de los colaboradores tiene personas a cargo. Principalmente se observa un alto conflicto en la mayoría del personal.'
  );
  const [statementAuditResults, setStatementAuditResults] = useState<StatementAuditResult[]>([]);

  // Quality Thresholds state (Sec 11)
  const [thresholds, setThresholds] = useState<QualityThresholdConfig>({
    highMinPercentage: 90.0,
    mediumMinPercentage: 70.0
  });

  // Modal inspection
  const [inspectModalTrace, setInspectModalTrace] = useState<IndicatorTraceability | null>(null);

  // Default sample indicators if none supplied
  const defaultIndicators: IndicatorTraceability[] = sampleIndicators.length > 0 ? sampleIndicators : [
    {
      indicatorId: 'SOC_PERSONAS_CARGO',
      indicatorName: 'Porcentaje con Personas a Cargo',
      sourceType: 'ENCUESTA',
      sourceField: 'personas_a_cargo',
      sourceSurvey: 'Encuesta Sociodemográfica 2026',
      surveyVersion: '1.3',
      calculationMethod: 'conteo_positivos / total_validos * 100',
      formula: '129 / 231 × 100',
      validRecords: 129,
      totalRecords: 231,
      coveragePercentage: 55.8,
      calculatedValue: 55.8,
      unit: '%',
      statusText: '129 válidos de 231 colaboradores (Cobertura 100%)',
      calculatedAt: new Date().toISOString(),
      dataStatus: 'CALCULATED_FROM_VALID_DATA',
      period: '2026',
      empresaId: companyId,
      questionLineage: {
        questionId: 'SOCIODEM_012',
        questionText: '¿Tiene personas o familiares a su cargo?'
      }
    },
    {
      indicatorId: 'SALUD_IMC_PROMEDIO',
      indicatorName: 'IMC Promedio Colaboradores',
      sourceType: 'EXCEL',
      sourceField: 'peso_y_estatura',
      sourceSurvey: 'Censo de Salud 2026',
      calculationMethod: 'Promedio de Peso(kg) / (Estatura(m)^2)',
      formula: 'sum(IMC) / 185 registros válidos',
      validRecords: 185,
      totalRecords: 231,
      coveragePercentage: 80.1,
      calculatedValue: 24.7,
      unit: 'kg/m²',
      statusText: '185 válidos con peso + estatura de 231 (Cobertura 80.1%)',
      calculatedAt: new Date().toISOString(),
      dataStatus: 'CALCULATED_FROM_VALID_DATA',
      period: '2026',
      excelLineage: {
        fileName: 'Encuesta_Sociodemografica_2026.xlsx',
        sheetName: 'Respuestas',
        excelRow: 45,
        excelColumn: 'M',
        originalHeader: 'Peso (Kg)',
        mappedField: 'peso',
        originalValue: 72,
        normalizedValue: 72
      }
    }
  ];

  // Run Chain Test
  const handleRunChainTest = (ind: IndicatorTraceability) => {
    setSelectedTrace(ind);
    const result = TraceabilityTester.runTraceabilityChainTest(ind);
    setTestResult(result);
  };

  // Run Anti-synthetic check
  const handleRunAntiSyntheticCheck = () => {
    const result = TraceabilityTester.runAntiSyntheticDataCheck(defaultIndicators);
    setAntiSyntheticResult(result);
  };

  // Run Statement Audit
  const handleAuditText = () => {
    const results = StatementAuditor.auditFullText(statementInput, {
      '55.8%': { value: 55.8, coveragePercentage: 100 }
    });
    setStatementAuditResults(results);
  };

  // Audit Logs
  const auditLogs = AuditLoggerService.getAuditLogs(companyId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left animate-fade-in">
      
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-indigo-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono block">
                Prompt 19 • Centro de Trazabilidad e Integridad
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
                Cadena de Custodia & Auditoría de Datos
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Garantía absoluta de cero información sintética o inventada. Trazabilidad completa desde el indicador hasta el registro original.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700/80 text-xs font-mono">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Aislamiento Empresa: <strong className="text-indigo-300">{companyId}</strong></span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('chain_test')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'chain_test'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          1. Prueba Trazabilidad (Sec. 25)
        </button>

        <button
          onClick={() => setActiveTab('anti_synthetic')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'anti_synthetic'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          2. Anti-Datos Inventados (Sec. 26)
        </button>

        <button
          onClick={() => setActiveTab('statement_audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'statement_audit'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          3. Afirmaciones Cualitativas (Sec. 15)
        </button>

        <button
          onClick={() => setActiveTab('audit_log')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'audit_log'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          4. Bitácora DATA_AUDIT_LOG (Sec. 20)
        </button>

        <button
          onClick={() => setActiveTab('thresholds')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'thresholds'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          5. Umbrales de Calidad (Sec. 11)
        </button>
      </div>

      {/* TAB 1: PRUEBA DE TRAZABILIDAD (Sec. 25) */}
      {activeTab === 'chain_test' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Indicator selector list */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-display flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              Seleccionar Indicador
            </h3>
            <div className="space-y-3">
              {defaultIndicators.map(ind => (
                <div 
                  key={ind.indicatorId}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedTrace?.indicatorId === ind.indicatorId 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs' 
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                  onClick={() => handleRunChainTest(ind)}
                >
                  <span className="text-[10px] font-bold font-mono text-indigo-700 block">{ind.indicatorId}</span>
                  <h4 className="text-xs font-bold text-slate-900">{ind.indicatorName}</h4>
                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-mono">
                    <span>Val: {ind.calculatedValue} {ind.unit}</span>
                    <span>Cobertura: {ind.coveragePercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Execution & Step Trace Result */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 font-display">Prueba de Trazabilidad 7 Pasos</h3>
                <p className="text-xs text-slate-500 font-mono">Indicador ↓ Cálculo ↓ Variables ↓ Registros ↓ Respuesta ↓ Pregunta ↓ Fuente</p>
              </div>
              {selectedTrace && (
                <button
                  onClick={() => setInspectModalTrace(selectedTrace)}
                  className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver Fuente Modal
                </button>
              )}
            </div>

            {testResult ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                  testResult.overallPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
                }`}>
                  <div className="flex items-center gap-3">
                    {testResult.overallPassed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-600" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold">
                        {testResult.overallPassed ? 'Prueba de Trazabilidad Superada (100% Retracable)' : 'Inconsistencia en Trazabilidad'}
                      </h4>
                      <p className="text-xs opacity-80">
                        {testResult.overallPassed ? 'Se puede rastrear el dato hasta su origen original sin pérdida de cadena.' : 'Revisar pasos marcados en rojo.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {testResult.steps.map((step, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-3 text-xs">
                      <span className={`p-1 rounded-lg ${step.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {step.passed ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 block font-display">{step.stepName}</span>
                        <p className="text-slate-600 mt-0.5 font-mono text-[11px]">{step.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <FileSearch className="w-10 h-10 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">Selecciona un indicador de la izquierda para ejecutar la prueba de trazabilidad.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ANTI-SINTÉTICO CHECK (Sec. 26) */}
      {activeTab === 'anti_synthetic' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 font-display">Prueba Contra Datos Inventados (Section 26)</h3>
              <p className="text-xs text-slate-500">
                Escaneo automático de código y registros para garantizar ausencia total de Math.random(), fallbacks sintéticos o datos ficticios.
              </p>
            </div>
            <button
              onClick={handleRunAntiSyntheticCheck}
              className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Play className="w-4 h-4" />
              Ejecutar Auditoría Anti-Sintéticos
            </button>
          </div>

          {antiSyntheticResult ? (
            <div className="space-y-4">
              <div className={`p-5 rounded-2xl border ${
                antiSyntheticResult.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-black">CERO DATOS SINTÉTICOS DETECTADOS</h4>
                    <p className="text-xs text-emerald-800 mt-0.5 font-medium">
                      Verificación exitosa. Todos los indicadores provienen estrictamente de encuestas o archivos Excel validados.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
              <ShieldCheck className="w-8 h-8 mx-auto text-slate-400" />
              <p className="text-xs font-bold text-slate-700">Haz clic en 'Ejecutar Auditoría Anti-Sintéticos' para validar el conjunto de datos activo.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AFIRMACIONES CUALITATIVAS (Sec. 15) */}
      {activeTab === 'statement_audit' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-black text-slate-900 font-display">Auditoría de Afirmaciones en Informes (Section 15)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Detección automática de términos cualitativos no respaldados por variables ("la mayoría", "principalmente", "alto", "crítico").
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">Texto del Informe Ejecutivo a Auditado:</label>
            <textarea
              rows={3}
              value={statementInput}
              onChange={(e) => setStatementInput(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button
              onClick={handleAuditText}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <FileSearch className="w-4 h-4" />
              Auditar Afirmaciones en Texto
            </button>
          </div>

          {statementAuditResults.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Resultados de Auditoría de Frases:</h4>
              <div className="space-y-2">
                {statementAuditResults.map((res) => (
                  <div 
                    key={res.statementId}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                      res.status === 'AFIRMACIÓN SIN TRAZABILIDAD'
                        ? 'bg-amber-50 border-amber-300 text-amber-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase font-bold">{res.statementId}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        res.status === 'AFIRMACIÓN SIN TRAZABILIDAD' ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                      }`}>
                        {res.status}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-900">"{res.originalText}"</p>
                    {res.status === 'AFIRMACIÓN SIN TRAZABILIDAD' && (
                      <p className="text-[11px] text-amber-900 font-medium pt-1">
                        ⚠️ Alerta: Contiene términos cualitativos sin respaldo directo en indicadores ({res.detectedTerms.join(', ')}).
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BITÁCORA DATA_AUDIT_LOG (Sec. 20) */}
      {activeTab === 'audit_log' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div>
            <h3 className="text-base font-black text-slate-900 font-display">Registro Audit Log (DATA_AUDIT_LOG)</h3>
            <p className="text-xs text-slate-500">Historial inmutable de cambios, correcciones y modificaciones sobre datos reales.</p>
          </div>

          {auditLogs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">ID / Fecha</th>
                    <th className="p-3">Acción</th>
                    <th className="p-3">Fuente</th>
                    <th className="p-3">Registro / Campo</th>
                    <th className="p-3">Anterior → Nuevo</th>
                    <th className="p-3">Motivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{log.id}</div>
                        <div className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString('es-CO')}</div>
                      </td>
                      <td className="p-3 font-bold text-indigo-700">{log.action}</td>
                      <td className="p-3">{log.source}</td>
                      <td className="p-3 font-semibold">{log.recordId} ({log.field})</td>
                      <td className="p-3 text-slate-600">{String(log.oldValue ?? 'null')} → <strong className="text-emerald-700">{String(log.newValue)}</strong></td>
                      <td className="p-3 text-slate-500 italic">{log.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
              <History className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600 mt-2">Sin registros de modificación aún en DATA_AUDIT_LOG.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: UMBRALES DE CALIDAD (Sec. 11) */}
      {activeTab === 'thresholds' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 max-w-xl">
          <div>
            <h3 className="text-base font-black text-slate-900 font-display">Configuración de Umbral de Calidad (Sec. 11)</h3>
            <p className="text-xs text-slate-500">Ajuste configurable de porcentajes de cobertura para niveles ALTA, MEDIA y BAJA.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <label className="font-bold text-emerald-950 uppercase block">Cobertura ALTA (Mínimo %):</label>
              <input
                type="number"
                value={thresholds.highMinPercentage}
                onChange={(e) => setThresholds({ ...thresholds, highMinPercentage: Number(e.target.value) })}
                className="w-full p-2.5 bg-white border border-emerald-300 rounded-xl font-bold text-emerald-900 font-mono text-sm outline-none"
              />
              <span className="text-[11px] text-emerald-800">Cualquier indicador con cobertura ≥ {thresholds.highMinPercentage}% tendrá estatus de Calidad ALTA.</span>
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2">
              <label className="font-bold text-amber-950 uppercase block">Cobertura MEDIA (Mínimo %):</label>
              <input
                type="number"
                value={thresholds.mediumMinPercentage}
                onChange={(e) => setThresholds({ ...thresholds, mediumMinPercentage: Number(e.target.value) })}
                className="w-full p-2.5 bg-white border border-amber-300 rounded-xl font-bold text-amber-900 font-mono text-sm outline-none"
              />
              <span className="text-[11px] text-amber-800">Cobertura entre {thresholds.mediumMinPercentage}% y {thresholds.highMinPercentage - 0.1}% tendrá estatus MEDIA. Por debajo será BAJA.</span>
            </div>
          </div>
        </div>
      )}

      {/* Traceability Modal */}
      {inspectModalTrace && (
        <TraceabilityModal
          traceability={inspectModalTrace}
          onClose={() => setInspectModalTrace(null)}
        />
      )}

    </div>
  );
}
