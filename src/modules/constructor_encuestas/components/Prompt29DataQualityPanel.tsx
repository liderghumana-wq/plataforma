/**
 * PROMPT 29 — MOTOR CENTRAL DE CALIDAD DE DATOS (PANEL PRINCIPAL)
 * Complete Data Quality Engine UI with:
 * 1. Data Source Flow
 * 2. Executive Quality Diagnostic Cards (Calidad General, Completitud, Validez, Consistencia, Duplicados, Campos Críticos)
 * 3. Completeness Breakdown by 8 Business Modules with Configurable Thresholds (🟢 90-100%, 🟡 70-89%, 🔴 <70%)
 * 4. Pre-Import Excel Quality Review Card
 * 5. Problem Drilldown Table ("Ver Problemas")
 * 6. Audit Trail & Data Correction Modal (DataQualityAudit)
 * 7. Report Blocking Banner & Warnings (REVISAR DATOS / GENERAR INFORME CON ADVERTENCIAS)
 * 8. Real Denominators & Coverage Engine
 */

import React, { useState, useMemo } from 'react';
import {
  DataQualityDiagnostic,
  BusinessModule,
  ALL_BUSINESS_MODULES,
  FieldValidationRecord,
  CompletenessThresholds,
  DataQualityAudit
} from '../../../core/data_quality/types';
import { DataQualityEnginePrompt29, MASTER_FIELD_DEFINITIONS } from '../../../core/data_quality/dataQualityEngine';
import { MetricCalculatorP29 } from '../../../core/data_quality/metricCalculator';
import { DataQualityAuditService } from '../../../core/data_quality/dataQualityAuditService';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Database,
  SlidersHorizontal,
  XCircle,
  Eye,
  Edit3,
  History,
  Lock,
  ArrowRight,
  Filter,
  RefreshCw,
  Info,
  Layers,
  FileText
} from 'lucide-react';

// Sample Dataset 1: Clean Complete Dataset
const SAMPLE_CLEAN_DATASET = Array.from({ length: 150 }, (_, i) => ({
  numeroIdentificacion: `10100${i + 10}`,
  primerNombre: `Colaborador_${i + 1}`,
  primerApellido: `Apellido_${i + 1}`,
  sexo: i % 2 === 0 ? 'Masculino' : 'Femenino',
  fechaNacimiento: '1992-06-20',
  edad: 34,
  fechaIngreso: '2021-02-01',
  antiguedadAnios: 5.0,
  tipoContrato: 'Término Indefinido',
  modalidadTrabajo: 'Presencial',
  sede: 'Sede Principal Norte',
  area: 'Operaciones BPO',
  proyecto: 'BPO Servicio Cliente',
  pesoKg: 70 + (i % 15),
  estaturaMts: 1.70,
  condicionesSalud: 'Ninguna'
}));

// Sample Dataset 2: Real-World Dataset with Missing, Out of Range & Contradictions
const SAMPLE_ISSUES_DATASET = [
  ...SAMPLE_CLEAN_DATASET.slice(0, 100),
  {
    rowNumber: 101,
    numeroIdentificacion: '10203040',
    primerNombre: 'Ana',
    primerApellido: 'Martínez',
    sexo: 'Femenino',
    fechaNacimiento: '1995-10-10',
    edad: 30,
    fechaIngreso: '2022-01-15',
    tipoContrato: null, // MISSING - Prohibited to invent "Término Indefinido"
    modalidadTrabajo: 'Teletrabajo',
    sede: null, // MISSING - Prohibited to invent "Bogotá"
    area: 'Finanzas',
    pesoKg: 250, // OUT_OF_RANGE (> 180kg) - Preserved for review
    estaturaMts: 175, // Normalizes 175cm -> 1.75m
    tieneHijos: false,
    numeroHijos: 2, // INCONSISTENT CONTRADICTION
    viveSolo: true,
    personasHogar: 4 // INCONSISTENT CONTRADICTION
  },
  {
    rowNumber: 102,
    numeroIdentificacion: '10203040', // DUPLICATE CEDULA
    primerNombre: 'Ana Duplicada',
    primerApellido: 'Martínez',
    sexo: 'PREFIERO NO RESPONDER', // Explicit PREFER_NOT_TO_ANSWER
    fechaIngreso: null, // NOT_PROVIDED - Tenure = null
    pesoKg: null, // MISSING - IMC = null
    estaturaMts: null // MISSING - IMC = null
  },
  {
    rowNumber: 103,
    numeroIdentificacion: '10998877',
    primerNombre: 'Carlos',
    primerApellido: 'Sánchez',
    sexo: 'Masculino',
    fechaNacimiento: '2030-01-01', // INVALID FUTURE DATE
    edad: -4, // INVALID NEGATIVE AGE
    pesoKg: 25, // OUT_OF_RANGE (< 35kg)
    estaturaMts: 3.50 // OUT_OF_RANGE (> 2.30m)
  }
];

export const Prompt29DataQualityPanel: React.FC = () => {
  // Source Selection
  const [selectedSource, setSelectedSource] = useState<'SURVEY' | 'EXCEL' | 'API'>('EXCEL');
  const [selectedDatasetType, setSelectedDatasetType] = useState<'ISSUES' | 'CLEAN' | 'EMPTY'>('ISSUES');

  // Configurable Completeness Thresholds (Section 4)
  const [thresholds, setThresholds] = useState<CompletenessThresholds>({
    greenMin: 90,
    yellowMin: 70
  });

  const [showConfigModal, setShowConfigModal] = useState(false);

  // Correction Modal state
  const [correctionRecord, setCorrectionRecord] = useState<FieldValidationRecord | null>(null);
  const [correctedVal, setCorrectedVal] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [correctedByUser, setCorrectedByUser] = useState('Analista_SST_Pro');

  // Filter state for Problems Table
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [moduleFilter, setModuleFilter] = useState<string>('ALL');

  // Active Dataset
  const activeRecords = useMemo(() => {
    if (selectedDatasetType === 'CLEAN') return SAMPLE_CLEAN_DATASET;
    if (selectedDatasetType === 'EMPTY') return [];
    return SAMPLE_ISSUES_DATASET;
  }, [selectedDatasetType]);

  // Run Motor Diagnostic
  const diagnostic: DataQualityDiagnostic = useMemo(() => {
    return DataQualityEnginePrompt29.runDiagnostic(activeRecords, undefined, thresholds);
  }, [activeRecords, thresholds]);

  // Audit Trail Logs
  const [auditLogs, setAuditLogs] = useState<DataQualityAudit[]>(DataQualityAuditService.getAuditLogs());

  // Handle Data Correction
  const handleApplyCorrection = () => {
    if (!correctionRecord) return;

    DataQualityAuditService.recordCorrection({
      companyId: 'EMPRESA-DEMO',
      datasetId: 'DATASET-2026-Q1',
      rowNumber: correctionRecord.rowNumber,
      fieldKey: correctionRecord.fieldKey,
      originalValue: correctionRecord.originalValue,
      normalizedValue: correctedVal,
      status: 'VALID',
      reason: correctionReason || 'Corrección manual de inconsistencia/rango en diagnóstico.',
      correctedBy: correctedByUser
    });

    setAuditLogs(DataQualityAuditService.getAuditLogs());
    setCorrectionRecord(null);
    setCorrectedVal('');
    setCorrectionReason('');
  };

  // Filtered Problems
  const filteredProblems = useMemo(() => {
    return diagnostic.problematicFields.filter(p => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      if (moduleFilter !== 'ALL' && p.moduleName !== moduleFilter) return false;
      return true;
    });
  }, [diagnostic.problematicFields, statusFilter, moduleFilter]);

  // Sample Indicator with Real Denominators
  const sampleIndicator = useMemo(() => {
    const validSaludCount = activeRecords.filter(r => r.pesoKg !== null && r.pesoKg !== undefined && r.estaturaMts !== null).length;
    const sobrepesoCount = activeRecords.filter(r => {
      if (!r.pesoKg || !r.estaturaMts) return false;
      const h = Number(r.estaturaMts) > 30 ? Number(r.estaturaMts) / 100 : Number(r.estaturaMts);
      const imc = Number(r.pesoKg) / (h * h);
      return imc >= 25;
    }).length;

    return MetricCalculatorP29.computeMetric({
      metricId: 'M-BMI-OVERWEIGHT',
      title: 'Prevalencia de Sobrepeso y Obesidad',
      numerator: sobrepesoCount,
      denominator: validSaludCount,
      totalTargetPopulation: activeRecords.length
    });
  }, [activeRecords]);

  return (
    <div className="space-y-8 text-slate-800">
      {/* 1. Header Banner & Flow Architecture */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              Prompt 29 — Motor Central de Calidad de Datos
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
              Motor Unificado de Validación, Completitud e Integridad
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-3xl">
              Garantiza que ninguna fuente (Encuestas, Excel o API) genere indicadores ni informes sin antes pasar por el flujo obligatorio de normalización y validación. Cero datos sintéticos inventados.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedDatasetType('ISSUES')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedDatasetType === 'ISSUES' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dataset con Problemas
            </button>
            <button
              onClick={() => setSelectedDatasetType('CLEAN')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedDatasetType === 'CLEAN' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dataset 100% Válido
            </button>
            <button
              onClick={() => setSelectedDatasetType('EMPTY')}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedDatasetType === 'EMPTY' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dataset Vacío
            </button>
          </div>
        </div>

        {/* Mandatory Flow Graphic (Section 1) */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 overflow-x-auto">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Flujo Obligatorio de Datos (Section 1)</div>
          <div className="flex items-center min-w-max gap-2 text-xs font-medium text-slate-300">
            <div className="px-3 py-1.5 bg-indigo-900/60 border border-indigo-700/60 rounded-lg text-indigo-200">FUENTE DE DATOS</div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="px-3 py-1.5 bg-teal-900/60 border border-teal-700/60 rounded-lg text-teal-200">NORMALIZACIÓN</div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="px-3 py-1.5 bg-amber-900/60 border border-amber-700/60 rounded-lg text-amber-200">VALIDACIÓN</div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="px-3 py-1.5 bg-emerald-900/60 border border-emerald-700/60 rounded-lg text-emerald-200 font-bold">CALIDAD DE DATOS</div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="px-3 py-1.5 bg-cyan-900/60 border border-cyan-700/60 rounded-lg text-cyan-200">CLASIFICACIÓN</div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="px-3 py-1.5 bg-blue-900/60 border border-blue-700/60 rounded-lg text-blue-200">INDICATORS</div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="px-3 py-1.5 bg-purple-900/60 border border-purple-700/60 rounded-lg text-purple-200">DASHBOARD</div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
            <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-100">INFORME</div>
          </div>
        </div>
      </div>

      {/* 2. Executive Quality Diagnostic Cards (Section 21) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Diagnóstico de Calidad de Datos (Section 21)
            </h2>
            <p className="text-slate-500 text-xs">Evaluación matemática basada en completitud, validez, consistencia y rangos.</p>
          </div>

          <button
            onClick={() => setShowConfigModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            Configurar Umbrales
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Calidad General</div>
            <div className="text-3xl font-extrabold text-slate-900">
              {diagnostic.overallQualityScore !== null ? `${diagnostic.overallQualityScore}%` : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Puntaje unificado</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Completitud</div>
            <div className="text-3xl font-extrabold text-emerald-600">
              {diagnostic.completenessPct !== null ? `${diagnostic.completenessPct}%` : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Campos diligenciados</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Validez</div>
            <div className="text-3xl font-extrabold text-blue-600">
              {diagnostic.validityPct !== null ? `${diagnostic.validityPct}%` : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Valores conforme norma</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Consistencia</div>
            <div className="text-3xl font-extrabold text-indigo-600">
              {diagnostic.consistencyPct !== null ? `${diagnostic.consistencyPct}%` : 'N/A'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Cero contradicciones</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Duplicados</div>
            <div className="text-3xl font-extrabold text-amber-600">
              {diagnostic.duplicatesCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Registros duplicados</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1">Críticos Faltantes</div>
            <div className="text-3xl font-extrabold text-rose-600">
              {diagnostic.missingCriticalFieldsCount}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Campos obligatorios</div>
          </div>
        </div>
      </div>

      {/* 3. Report Blocking / Warning Banner (Section 25 & 26) */}
      {diagnostic.hasCriticalBlockers && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-6 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-rose-200">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-1">
                  Bloqueo Preventivo Activo (Section 25)
                </div>
                <h3 className="text-lg font-bold text-rose-950">
                  El conjunto de datos requiere revisión antes de generar el informe
                </h3>
                <p className="text-rose-800 text-xs mt-1 max-w-2xl">
                  {diagnostic.diagnosticSummaryMessage} Existen {diagnostic.missingCriticalFieldsCount} campos críticos faltantes o inconformes y {diagnostic.duplicatesCount} duplicados que distorsionarían los indicadores ejecutivos.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  const el = document.getElementById('section-problems-table');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md cursor-pointer transition-colors"
              >
                REVISAR DATOS
              </button>

              <button
                onClick={() => {
                  alert(MetricCalculatorP29.buildQualityWarningBanner(diagnostic.completenessPct || 0, diagnostic.overallQualityScore || 0));
                }}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 font-semibold text-xs cursor-pointer transition-colors"
              >
                GENERAR INFORME CON ADVERTENCIAS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Completeness by 8 Modules Grid (Section 4 & 5) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              Completitud por Módulo de Negocio (Section 5)
            </h2>
            <p className="text-slate-500 text-xs">Monitoreo de completitud sobre los 8 módulos reglamentarios de Gestión Humana y SG-SST.</p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              🟢 90–100%
            </span>
            <span className="flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              🟡 70–89%
            </span>
            <span className="flex items-center gap-1 text-rose-700 bg-rose-50 px-2 py-1 rounded border border-rose-200">
              🔴 &lt;70%
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {ALL_BUSINESS_MODULES.map(moduleName => {
            const score = diagnostic.moduleScores[moduleName];
            const alertBg = score.alertLevel === 'GREEN' ? 'bg-emerald-500' : score.alertLevel === 'YELLOW' ? 'bg-amber-500' : 'bg-rose-500';
            const alertText = score.alertLevel === 'GREEN' ? 'text-emerald-700' : score.alertLevel === 'YELLOW' ? 'text-amber-700' : 'text-rose-700';

            return (
              <div key={moduleName} className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-900 text-sm">{moduleName}</span>
                  <span className={`text-xs font-bold ${alertText}`}>
                    {score.completenessPct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div className={`h-full ${alertBg} transition-all duration-500`} style={{ width: `${score.completenessPct}%` }} />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Validez: {score.validityPct}%</span>
                  <span>{score.totalFilledFields}/{score.totalPossibleFields} campos</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Pre-Import Excel Quality Overview Card (Section 20) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-800">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Análisis de Calidad de Pre-Importación Excel (Section 20)</h3>
              <p className="text-slate-500 text-xs">Visión técnica completa antes de procesar la matriz de datos de origen.</p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
            {diagnostic.totalCheckedRecords} Registros / {MASTER_FIELD_DEFINITIONS.length} Columnas Reconocidas
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500 font-medium">Total Registros</div>
            <div className="text-lg font-bold text-slate-900">{diagnostic.totalCheckedRecords}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-slate-500 font-medium">Columnas Reconocidas</div>
            <div className="text-lg font-bold text-slate-900">{MASTER_FIELD_DEFINITIONS.length}</div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div className="text-amber-700 font-medium">Registros Duplicados</div>
            <div className="text-lg font-bold text-amber-900">{diagnostic.duplicatesCount}</div>
          </div>

          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
            <div className="text-rose-700 font-medium">Campos Críticos Faltantes</div>
            <div className="text-lg font-bold text-rose-900">{diagnostic.missingCriticalFieldsCount}</div>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="text-emerald-700 font-medium">Completitud Global</div>
            <div className="text-lg font-bold text-emerald-900">{diagnostic.completenessPct}%</div>
          </div>
        </div>
      </div>

      {/* 6. Problem Drill-down Table ("Ver problemas") (Section 22) */}
      <div id="section-problems-table" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              Detalle de Inconformidades y Problemas Detectados (Section 22)
            </h2>
            <p className="text-slate-500 text-xs">Explora celdas con valores faltantes, fuera de rango o inconsistencias lógicas.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="MISSING">MISSING (Vacíos)</option>
              <option value="OUT_OF_RANGE">OUT_OF_RANGE (Fuera de Rango)</option>
              <option value="INCONSISTENT">INCONSISTENT (Inconsistencias)</option>
              <option value="PREFER_NOT_TO_ANSWER">PREFER_NOT_TO_ANSWER</option>
            </select>

            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 font-medium cursor-pointer"
            >
              <option value="ALL">Todos los Módulos</option>
              {ALL_BUSINESS_MODULES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredProblems.length === 0 ? (
          <div className="p-8 text-center bg-emerald-50/50 rounded-xl border border-emerald-200 text-emerald-800">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
            <h4 className="font-bold text-sm">No se encontraron inconformidades con los filtros seleccionados</h4>
            <p className="text-xs text-emerald-700 mt-1">Todos los registros evaluados cumplen con las normas de integridad.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <th className="p-3">Fila #</th>
                  <th className="p-3">Variable / Campo</th>
                  <th className="p-3">Módulo</th>
                  <th className="p-3">Valor Reportado</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Diagnóstico / Razón</th>
                  <th className="p-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProblems.map((p, idx) => {
                  const statusBg =
                    p.status === 'OUT_OF_RANGE' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                    p.status === 'MISSING' ? 'bg-rose-100 text-rose-900 border-rose-300' :
                    p.status === 'INCONSISTENT' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                    'bg-slate-100 text-slate-800 border-slate-300';

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono font-bold text-slate-900">Fila {p.rowNumber}</td>
                      <td className="p-3 font-semibold text-slate-900">{p.variableName}</td>
                      <td className="p-3 text-slate-600">{p.moduleName}</td>
                      <td className="p-3 font-mono text-slate-800 bg-slate-50 rounded px-2 py-1 max-w-[150px] truncate">
                        {p.originalValue === null || p.originalValue === undefined ? '<Vacío>' : String(p.originalValue)}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${statusBg}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 max-w-xs">{p.reason}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            setCorrectionRecord(p);
                            setCorrectedVal(String(p.originalValue || ''));
                          }}
                          className="px-2.5 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 cursor-pointer text-xs inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          Corregir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 7. Audit Log Traceability (Section 24 - DataQualityAudit) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            Historial de Correcciones y Trazabilidad (Section 24 — DataQualityAudit)
          </h2>

          <span className="text-xs text-slate-500 font-medium">{auditLogs.length} Correcciones Registradas</span>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-3">ID Auditoría</th>
                <th className="p-3">Fila #</th>
                <th className="p-3">Campo</th>
                <th className="p-3">Valor Original</th>
                <th className="p-3">Valor Corregido</th>
                <th className="p-3">Usuario Auditor</th>
                <th className="p-3">Motivo / Justificación</th>
                <th className="p-3">Fecha Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-slate-700">{log.id}</td>
                  <td className="p-3 font-mono text-slate-900">Fila {log.rowNumber}</td>
                  <td className="p-3 font-semibold text-slate-900">{log.fieldKey}</td>
                  <td className="p-3 font-mono text-rose-700">{String(log.originalValue)}</td>
                  <td className="p-3 font-mono text-emerald-700 font-bold">{String(log.normalizedValue)}</td>
                  <td className="p-3 text-slate-700">{log.correctedBy}</td>
                  <td className="p-3 text-slate-600">{log.reason}</td>
                  <td className="p-3 font-mono text-slate-500">{new Date(log.correctedAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 8. Real Denominators & Coverage Engine Demonstrator (Section 28 & 29) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-300">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Demostrador de Denominadores Reales y Cobertura (Section 28 & 29)</h3>
            <p className="text-slate-400 text-xs">Muestra explícitamente Numerador, Denominador y Cobertura % sin falsos 0% ni estimaciones.</p>
          </div>
        </div>

        <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-3 font-mono text-xs text-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <span className="font-bold text-indigo-300 text-sm">{sampleIndicator.title}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-bold">
              Calidad del Dato: {sampleIndicator.dataQuality}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div>
              <div className="text-slate-500 text-[10px]">Numerador (Casos)</div>
              <div className="text-base font-bold text-emerald-400">{sampleIndicator.numerator} colaboradores</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px]">Denominador Válido</div>
              <div className="text-base font-bold text-blue-400">{sampleIndicator.denominator} evaluados</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px]">Cobertura de Población</div>
              <div className="text-base font-bold text-amber-400">{sampleIndicator.coveragePct}%</div>
            </div>
            <div>
              <div className="text-slate-500 text-[10px]">Resultado Relativo</div>
              <div className="text-base font-bold text-white">{sampleIndicator.value}%</div>
            </div>
          </div>

          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800/80 text-slate-300">
            <strong className="text-teal-400">Texto para Dashboard (Section 30):</strong> "{sampleIndicator.displayText}"
          </div>
        </div>
      </div>

      {/* MODAL: Data Correction Modal */}
      {correctionRecord && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              Corregir Dato — Fila {correctionRecord.rowNumber}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 font-semibold">Variable:</label>
                <div className="font-bold text-slate-900 text-sm">{correctionRecord.variableName}</div>
              </div>

              <div>
                <label className="text-slate-500 font-semibold">Valor Original Reportado:</label>
                <div className="font-mono bg-slate-100 p-2 rounded text-slate-800">{String(correctionRecord.originalValue)}</div>
              </div>

              <div>
                <label className="text-slate-700 font-bold">Nuevo Valor Corregido:</label>
                <input
                  type="text"
                  value={correctedVal}
                  onChange={(e) => setCorrectedVal(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ingrese valor válido..."
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold">Motivo de la Corrección:</label>
                <textarea
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
                  placeholder="Justificación para trazabilidad auditoría..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setCorrectionRecord(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyCorrection}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs cursor-pointer shadow"
              >
                Guardar Corrección Auditada
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Threshold Configuration */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 border-b pb-2">
              Configurar Umbrales de Completitud (Section 4)
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-emerald-700 font-bold">🟢 Mínimo Verde (% Completitud Alta):</label>
                <input
                  type="number"
                  value={thresholds.greenMin}
                  onChange={(e) => setThresholds({ ...thresholds, greenMin: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="text-amber-700 font-bold">🟡 Mínimo Amarillo (% Completitud Media):</label>
                <input
                  type="number"
                  value={thresholds.yellowMin}
                  onChange={(e) => setThresholds({ ...thresholds, yellowMin: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 border rounded-xl font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <button
                onClick={() => setShowConfigModal(false)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs cursor-pointer shadow"
              >
                Aplicar Umbrales
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
