import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  HelpCircle,
  Sliders,
  Play,
  FileCheck,
  Database,
  Building2,
  Lock,
  Layers,
  ChevronRight,
  RefreshCw,
  X,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { DemographicsData } from '../types';
import { DataQualityValidationEngine } from '../core/data_integrity/dataQualityValidationEngine';
import { Prompt20ValidationReport, Prompt20CompanyConfig, Prompt20TestCaseResult } from '../core/data_integrity/types';

interface Prompt20QualityPanelProps {
  data: DemographicsData | null;
  companyId?: string;
  onOpenReportBlocker?: () => void;
}

export function Prompt20QualityPanel({ data, companyId = 'EMP-001', onOpenReportBlocker }: Prompt20QualityPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'fields' | 'indicators' | 'config' | 'tests'>('overview');

  // Custom Company Config state (Section 20 & 21)
  const [config, setConfig] = useState<Prompt20CompanyConfig>({
    companyId,
    companyName: 'Empresa SG-SST',
    surveyId: 'SURVEY-SGSST-2026',
    periodId: '2026-Q1',
    minimumCoveragePercentage: 70.0,
    allowedSections: [
      'Identificación',
      'Datos laborales',
      'Condiciones sociodemográficas',
      'Condiciones de salud',
      'Hábitos y estilos de vida',
      'Condiciones de vivienda',
      'Información familiar',
      'Variables de SST'
    ],
    mandatoryFields: ['sexo', 'edad', 'ciudad', 'tipo_contrato', 'peso', 'estatura'],
    criticalFields: ['sexo', 'edad', 'ciudad', 'tipo_contrato', 'peso', 'estatura']
  });

  // Run validation
  const report: Prompt20ValidationReport = DataQualityValidationEngine.validateDataQuality(data, config);

  // Executable tests state
  const [testResults, setTestResults] = useState<Prompt20TestCaseResult[]>([]);
  const [isTestRunning, setIsTestRunning] = useState(false);

  const handleRunTests = () => {
    setIsTestRunning(true);
    setTimeout(() => {
      const results = DataQualityValidationEngine.runPrompt20MandatoryTests();
      setTestResults(results);
      setIsTestRunning(false);
    }, 400);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left animate-fade-in">
      
      {/* Top Banner - CALIDAD DE LA INFORMACIÓN (Section 17) */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl border ${
              report.hasCriticalErrors 
                ? 'bg-rose-500/20 border-rose-500/30 text-rose-400' 
                : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
            }`}>
              {report.hasCriticalErrors ? <ShieldAlert className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono block">
                Prompt 20 • Motor de Validación de Calidad
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                CALIDAD DE LA INFORMACIÓN
              </h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Evaluación automática pre-informe. Cero información estimada o inventada en ausencia de datos reales.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-2xl border border-slate-700 text-xs font-mono">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Empresa: <strong className="text-indigo-300">{config.companyId}</strong></span>
            </div>
            <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
              report.hasCriticalErrors 
                ? 'bg-rose-950 text-rose-300 border-rose-800' 
                : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}>
              {report.hasCriticalErrors ? '🔴 ERRORES CRÍTICOS - INFORME BLOQUEADO' : '🟢 APTO PARA GENERACIÓN DE INFORME'}
            </span>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid - Section 17 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Registros Totales</span>
          <div className="text-xl font-black text-slate-900 font-mono">{report.totalRecords}</div>
          <span className="text-[10px] text-slate-500">Población activa</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase block font-mono">Campos Evaluados</span>
          <div className="text-xl font-black text-slate-900 font-mono">{report.evaluatedFieldsCount}</div>
          <span className="text-[10px] text-slate-500">Variables SST</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-1 bg-emerald-50/30">
          <span className="text-[10px] font-bold text-emerald-700 uppercase block font-mono">Campos Completos</span>
          <div className="text-xl font-black text-emerald-700 font-mono">{report.completeFieldsCount}</div>
          <span className="text-[10px] text-emerald-600">100% Cobertura</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-1 bg-amber-50/30">
          <span className="text-[10px] font-bold text-amber-700 uppercase block font-mono">Campos Parciales</span>
          <div className="text-xl font-black text-amber-700 font-mono">{report.partialFieldsCount}</div>
          <span className="text-[10px] text-amber-600">Información parcial</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs space-y-1 bg-rose-50/30">
          <span className="text-[10px] font-bold text-rose-700 uppercase block font-mono">Sin Información</span>
          <div className="text-xl font-black text-rose-700 font-mono">{report.missingFieldsCount}</div>
          <span className="text-[10px] text-rose-600">0% Cobertura</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-2xs space-y-1 bg-indigo-50/30">
          <span className="text-[10px] font-bold text-indigo-700 uppercase block font-mono">Cobertura General</span>
          <div className="text-xl font-black text-indigo-700 font-mono">{report.overallCoveragePercentage}%</div>
          <span className="text-[10px] text-indigo-600">Promedio general</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          Resumen & Alertas (Sec. 17-18)
        </button>

        <button
          onClick={() => setActiveTab('fields')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'fields' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          Campos Obligatorios (Sec. 3-7)
        </button>

        <button
          onClick={() => setActiveTab('indicators')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'indicators' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Regla para Indicadores (Sec. 8-11)
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'config' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Configuración Empresa (Sec. 20-21)
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'tests' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Play className="w-4 h-4" />
          Pruebas Obligatorias (Sec. 26-27)
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ALERTS (Section 17 & 18) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider font-display flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              Niveles de Alerta por Variable (Section 18)
            </h3>

            <div className="space-y-2.5">
              {Object.values(report.fieldDetails).map(field => {
                let badgeStyle = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                let badgeLabel = '🟢 INFORMACIÓN COMPLETA';

                if (field.alertLevel === 'CRITICO') {
                  badgeStyle = 'bg-rose-100 text-rose-800 border-rose-300';
                  badgeLabel = '🔴 CRÍTICO (SIN DATOS)';
                } else if (field.alertLevel === 'REQUIERE_COMPLETAR') {
                  badgeStyle = 'bg-amber-100 text-amber-800 border-amber-300';
                  badgeLabel = '🟠 REQUIERE COMPLETAR';
                } else if (field.alertLevel === 'INFORMACION_PARCIAL') {
                  badgeStyle = 'bg-yellow-100 text-yellow-800 border-yellow-300';
                  badgeLabel = '🟡 INFORMACIÓN PARCIAL';
                }

                return (
                  <div key={field.fieldId} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block uppercase">{field.section}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{field.fieldName}</h4>
                      <p className="text-slate-500 font-mono text-[11px] mt-0.5">
                        {field.validRecords} válidos / {field.totalRecords} totales ({field.coveragePercentage}% cobertura)
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full font-black text-[10px] uppercase border ${badgeStyle}`}>
                      {badgeLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar Status & Action */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 h-fit">
            <h3 className="text-sm font-black text-slate-900 font-display uppercase tracking-wider">
              Estado de Generación de Informe
            </h3>

            {report.hasCriticalErrors ? (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>INFORME BLOQUEADO (Sec. 24)</span>
                </div>
                <p className="text-xs text-rose-700">
                  Se han detectado campos críticos sin información. El informe no se puede generar con datos sintéticos inventados.
                </p>
                <div className="pt-2 border-t border-rose-200 space-y-1">
                  {report.criticalIssues.map((issue, idx) => (
                    <div key={idx} className="text-[11px] text-rose-900 font-mono font-medium">
                      • {issue}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs text-emerald-900">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Base de Datos Verificada</span>
                </div>
                <p>Todos los campos críticos cumplen con la cobertura mínima requerida. El informe directivo puede ser compilado de forma segura.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MANDATORY FIELDS (Sections 3-7) */}
      {activeTab === 'fields' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 font-display uppercase tracking-wider">
            Detalle de Cobertura por Variable (Section 3)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Variable (fieldId)</th>
                  <th className="p-3">Sección</th>
                  <th className="p-3 text-center">Crítico</th>
                  <th className="p-3 text-right">Válidos</th>
                  <th className="p-3 text-right">Faltantes (null)</th>
                  <th className="p-3 text-right">Cobertura %</th>
                  <th className="p-3">Estado (Status)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px]">
                {Object.values(report.fieldDetails).map(field => (
                  <tr key={field.fieldId} className="hover:bg-slate-50">
                    <td className="p-3 font-bold font-sans text-slate-900">{field.fieldName} <span className="text-slate-400 font-mono text-[10px]">({field.fieldId})</span></td>
                    <td className="p-3 text-slate-500 font-sans">{field.section}</td>
                    <td className="p-3 text-center">
                      {field.isCritical ? <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[10px]">SÍ</span> : <span className="text-slate-400">NO</span>}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-700">{field.validRecords}</td>
                    <td className="p-3 text-right text-rose-600">{field.emptyRecords}</td>
                    <td className="p-3 text-right font-black text-indigo-700">{field.coveragePercentage}%</td>
                    <td className="p-3 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        field.status === 'COMPLETE' ? 'bg-emerald-100 text-emerald-800' :
                        field.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {field.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: INDICATOR RULES (Sections 8-11) */}
      {activeTab === 'indicators' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 font-display uppercase tracking-wider">
            Evaluación de Indicadores SG-SST (Sections 8-11)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(report.indicatorDetails).map(ind => (
              <div key={ind.indicatorId} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">{ind.indicatorId}</span>
                    <h4 className="font-extrabold text-slate-900 text-sm font-display">{ind.indicatorName}</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                    ind.status === 'DATO_DISPONIBLE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                    ind.status === 'DATO_PARCIAL' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    ind.status === 'INSUFFICIENT_DATA' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                    'bg-rose-100 text-rose-800 border-rose-300'
                  }`}>
                    {ind.status === 'MISSING' ? '🔴 NO DISPONIBLE' : ind.status}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block font-mono">Texto de Salida / Cobertura:</span>
                  <p className="font-bold text-slate-800 font-mono text-[11px]">{ind.displayText}</p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>Variables: {ind.requiredFields.join(', ')}</span>
                  <span>Muestra: {ind.validRecords}/{ind.totalRecords} ({ind.coveragePercentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONFIGURATION (Sections 20-21) */}
      {activeTab === 'config' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 max-w-2xl">
          <div>
            <h3 className="text-base font-black text-slate-900 font-display">Configuración por Empresa & Encuesta (Section 21)</h3>
            <p className="text-xs text-slate-500">Ajuste parametrizable sin código duro.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">ID Empresa (companyId):</label>
                <input
                  type="text"
                  value={config.companyId}
                  onChange={(e) => setConfig({ ...config, companyId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">ID Encuesta (surveyId):</label>
                <input
                  type="text"
                  value={config.surveyId}
                  onChange={(e) => setConfig({ ...config, surveyId: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Cobertura Mínima Requerida (%):</label>
              <input
                type="number"
                value={config.minimumCoveragePercentage}
                onChange={(e) => setConfig({ ...config, minimumCoveragePercentage: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AUTOMATED MANDATORY TESTS (Sections 26 & 27) */}
      {activeTab === 'tests' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 font-display">Pruebas Obligatorias de Cero Fallbacks (Sections 26 & 27)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ejecuta la suite automatizada de 12 pruebas para garantizar que la ausencias de datos devuelven `null` / `NO DISPONIBLE`.
              </p>
            </div>
            <button
              onClick={handleRunTests}
              disabled={isTestRunning}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isTestRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Ejecutar Suite de Pruebas (Sec. 26 & 27)
            </button>
          </div>

          {testResults.length > 0 ? (
            <div className="space-y-3">
              {testResults.map(t => (
                <div key={t.testNumber} className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  t.passed ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold text-slate-500">Prueba #{t.testNumber}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      t.passed ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'
                    }`}>
                      {t.passed ? 'PASÓ (0 FALLBACKS)' : 'FALLÓ'}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 font-display">{t.testName}</h4>
                  <p className="font-mono text-[11px] text-slate-700 bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
                    {t.details}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <Play className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-600">Haz clic en 'Ejecutar Suite de Pruebas' para correr las validaciones de Sección 26 y 27.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
