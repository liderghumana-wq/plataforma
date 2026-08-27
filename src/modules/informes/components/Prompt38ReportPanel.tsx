import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, Printer, Play, CheckCircle2, AlertTriangle, 
  RotateCcw, Sparkles, Sliders, Building, Calendar, Users, Shield, 
  Layers, Check, XCircle, RefreshCw, BarChart2, Eye, HelpCircle,
  FileSpreadsheet, ArrowUpRight
} from 'lucide-react';
import { useEmpresa } from '../../configuracion/useEmpresa';
import { masterDataModelService } from '../../../core/master_data_model/service';
import { catalogosService } from '../../configuracion/catalogos.service';
import { Prompt38ReportEngine } from '../../../core/reports/prompt38ReportEngine';
import { Prompt38TestRunner, Prompt38SuiteReport } from '../../../core/reports/prompt38TestRunner';
import { ReportSnapshotPrompt38, ReportCompanyConfigPrompt38 } from '../../../core/reports/prompt38ReportTypes';
import { CentralIndicatorEngine } from '../../../core/indicator_engine/centralIndicatorEngine';
import Prompt38ExecutiveReport from './Prompt38ExecutiveReport';

export default function Prompt38ReportPanel() {
  const { config, getCatalogItems } = useEmpresa();

  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-P1');
  const [selectedSede, setSelectedSede] = useState<string>('ALL');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedProyecto, setSelectedProyecto] = useState<string>('ALL');
  const [reportVersion, setReportVersion] = useState<string>('v1.0');
  const [activeTab, setActiveTab] = useState<'DOCUMENT' | 'EXECUTIVE_SUMMARY' | 'INDICATORS' | 'FINDINGS_RECS' | 'AUDIT' | 'TESTS'>('DOCUMENT');

  // Test Runner State
  const [testReport, setTestReport] = useState<Prompt38SuiteReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  // Consistency Check State
  const [consistencyResult, setConsistencyResult] = useState<{
    isChecked: boolean;
    isConsistent: boolean;
    totalChecked: number;
    discrepancies: string[];
  } | null>(null);

  // Multiempresa Active Company
  const companyId = config.id || 'COMP_DEFAULT';
  const companyName = config.nombreEmpresa || 'Empresa Principal SG-SST';

  // Construct standard dataset
  const dataset = useMemo(() => {
    const rawColaboradores = masterDataModelService.getTableData('COLABORADORES')
      .filter((c: any) => !c.deletedAt)
      .map((c: any) => ({
        ...c,
        empresaId: companyId
      }));

    const rawRespuestas = masterDataModelService.getTableData('RESPUESTAS')
      .map((r: any) => ({
        ...r,
        empresaId: companyId
      }));

    const rawAusentismos = masterDataModelService.getTableData('AUSENTISMOS') || [];
    const rawBienestar = masterDataModelService.getTableData('BIENESTAR') || [];

    const catalogs: any = catalogosService.getCatalogsSync ? catalogosService.getCatalogsSync(companyId) : {};

    return {
      companyId,
      period: selectedPeriod,
      surveyVersion: 'v3.0.0',
      datasetVersion: 'v3.0.0',
      colaboradores: rawColaboradores,
      respuestas: rawRespuestas,
      ausentismos: rawAusentismos,
      encuestasBienestar: rawBienestar,
      catalogs: {
        sedes: catalogs.sedes || [],
        areas: catalogs.areas || [],
        cargos: catalogs.cargos || [],
        proyectos: catalogs.proyectos || []
      }
    };
  }, [companyId, selectedPeriod]);

  // Company configuration for the report
  const companyConfig: ReportCompanyConfigPrompt38 = useMemo(() => {
    return {
      companyId,
      companyName,
      logo: config.logo || '',
      nit: config.nit || '900.123.456-7',
      ciudad: config.ciudad || 'Bogotá D.C.',
      direccion: config.direccion || 'Calle Principal # 12-34',
      telefono: config.telefono || '601-5550199',
      email: config.correo || 'sst@empresa.com.co',
      representanteLegal: config.representanteLegal || 'Representante Legal',
      cargoRepresentante: config.cargoRepresentante || 'Gerente General',
      responsableSST: config.responsableInforme || 'Especialista en SG-SST',
      cargoResponsableSST: config.cargoResponsable || 'Líder de Seguridad y Salud en el Trabajo',
      licenciaSST: config.normativaAplicada || 'Resolución 0312 de 2019'
    };
  }, [config, companyId, companyName]);

  // Filters object
  const filters = useMemo(() => {
    return {
      companyId,
      sedeId: selectedSede !== 'ALL' ? selectedSede : undefined,
      areaId: selectedArea !== 'ALL' ? selectedArea : undefined,
      proyectoId: selectedProyecto !== 'ALL' ? selectedProyecto : undefined
    };
  }, [companyId, selectedSede, selectedArea, selectedProyecto]);

  // Generate Report Snapshot strictly through Prompt38ReportEngine
  const reportSnapshot: ReportSnapshotPrompt38 = useMemo(() => {
    try {
      return Prompt38ReportEngine.generateReport({
        dataset,
        companyConfig,
        filters,
        reportVersion,
        generatedBy: 'Coordinador SG-SST'
      });
    } catch (e: any) {
      console.error('Error generando informe:', e);
      return null as any;
    }
  }, [dataset, companyConfig, filters, reportVersion]);

  // Execute Consistency Check (Dashboard vs Report)
  const handleRunConsistencyCheck = () => {
    if (!reportSnapshot) return;

    // 1. Calculate directly with CentralIndicatorEngine (used by dashboard)
    const dashboardIndicators = CentralIndicatorEngine.calculateAll(dataset, filters);
    
    // 2. Compare against report snapshot indicators
    let discrepancies: string[] = [];
    for (const dashInd of dashboardIndicators) {
      const repInd = reportSnapshot.indicators.find(i => i.code === dashInd.code);
      if (!repInd) {
        discrepancies.push(`Indicador ${dashInd.code} faltante en informe`);
      } else if (repInd.value !== dashInd.value || repInd.coverage !== dashInd.coverage) {
        discrepancies.push(
          `${dashInd.code}: Dashboard = ${dashInd.value} (${dashInd.coverage}%), Informe = ${repInd.value} (${repInd.coverage}%)`
        );
      }
    }

    setConsistencyResult({
      isChecked: true,
      isConsistent: discrepancies.length === 0,
      totalChecked: dashboardIndicators.length,
      discrepancies
    });
  };

  // Run Test Suite
  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const rep = Prompt38TestRunner.runAllTests();
      setTestReport(rep);
      setIsRunningTests(false);
      setActiveTab('TESTS');
    }, 400);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!reportSnapshot) return;
    const csvData = Prompt38ReportEngine.exportToCSV(reportSnapshot);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Informe_SGSST_${companyId}_${selectedPeriod}_${reportVersion}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Print/PDF
  const handlePrint = () => {
    window.print();
  };

  // Handle New Version Generation
  const handleCreateNewVersion = () => {
    const nextVer = reportVersion === 'v1.0' ? 'v2.0' : reportVersion === 'v2.0' ? 'v3.0' : `v${parseFloat(reportVersion.replace('v', '')) + 1.0}`;
    setReportVersion(nextVer);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Generador Central de Informes SG-SST (PROMPT 38)</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white">
              Informe de Caracterización Sociodemográfica y Condiciones de Salud
            </h1>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              Alimentado exclusivamente por el <strong>Data Quality Engine</strong> y el <strong>Central Indicator Engine</strong>. Cero cálculos dispersos, cero datos sintéticos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleRunConsistencyCheck}
              className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 border border-white/20 cursor-pointer shadow-xs"
              title="Comparar paridad exacta entre Dashboard e Informe"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Verificar Paridad Dashboard</span>
            </button>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>{isRunningTests ? 'Ejecutando Pruebas...' : 'Ejecutar Batería (P38)'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-2 border border-slate-700 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>
          </div>
        </div>

        {/* Consistency Check Banner Result */}
        {consistencyResult && consistencyResult.isChecked && (
          <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between gap-3 ${
            consistencyResult.isConsistent 
              ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200' 
              : 'bg-rose-500/20 border-rose-400/40 text-rose-200'
          }`}>
            <div className="flex items-center gap-2.5">
              {consistencyResult.isConsistent ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <span>
                <strong>Prueba de Consistencia (PROMPT 38):</strong> {
                  consistencyResult.isConsistent
                    ? `Paridad perfecta 1:1 verificada en ${consistencyResult.totalChecked} indicadores. Los valores del Dashboard y del Informe son 100% idénticos.`
                    : `Discrepancias detectadas: ${consistencyResult.discrepancies.join('; ')}`
                }
              </span>
            </div>
            <button 
              onClick={() => setConsistencyResult(null)}
              className="text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>

      {/* Control Bar: Filters, Versions & Parameters */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Filtros y Control de Versión del Informe</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Versión activa:</span>
            <span className="bg-indigo-50 text-indigo-700 font-mono font-bold px-2.5 py-1 rounded-lg border border-indigo-100">
              {reportVersion}
            </span>
            <button
              onClick={handleCreateNewVersion}
              className="text-indigo-600 hover:text-indigo-700 font-bold hover:underline cursor-pointer ml-1"
              title="Crea una nueva versión inmutable del informe"
            >
              + Nueva Versión
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Period Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">Periodo</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="2026-P1">2026 - Primer Semestre (P1)</option>
              <option value="2025-P2">2025 - Segundo Semestre (P2)</option>
              <option value="2025-P1">2025 - Primer Semestre (P1)</option>
            </select>
          </div>

          {/* Sede Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">Sede</label>
            <select
              value={selectedSede}
              onChange={(e) => setSelectedSede(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todas las Sedes</option>
              {(getCatalogItems ? getCatalogItems('sedes') : []).map((s: any) => (
                <option key={s.id} value={s.nombre}>{s.nombre}</option>
              ))}
            </select>
          </div>

          {/* Area Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">Área</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todas las Áreas</option>
              {(getCatalogItems ? getCatalogItems('areas') : []).map((a: any) => (
                <option key={a.id} value={a.nombre}>{a.nombre}</option>
              ))}
            </select>
          </div>

          {/* Proyecto Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-500">Proyecto</label>
            <select
              value={selectedProyecto}
              onChange={(e) => setSelectedProyecto(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">Todos los Proyectos</option>
              {(getCatalogItems ? getCatalogItems('proyectos') : []).map((p: any) => (
                <option key={p.id} value={p.nombre}>{p.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('DOCUMENT')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'DOCUMENT'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Informe Completo (16 Secciones)</span>
        </button>

        <button
          onClick={() => setActiveTab('EXECUTIVE_SUMMARY')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'EXECUTIVE_SUMMARY'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Resumen Ejecutivo Directivo</span>
        </button>

        <button
          onClick={() => setActiveTab('INDICATORS')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'INDICATORS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Indicadores & Calidad</span>
        </button>

        <button
          onClick={() => setActiveTab('FINDINGS_RECS')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'FINDINGS_RECS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Hallazgos & Recomendaciones</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'AUDIT'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Trazabilidad & Anexos</span>
        </button>

        <button
          onClick={() => setActiveTab('TESTS')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'TESTS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Play className="w-4 h-4" />
          <span>Batería de Pruebas (PROMPT 38)</span>
          {testReport && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
              testReport.allPassed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
            }`}>
              {testReport.passedTests}/{testReport.totalTests}
            </span>
          )}
        </button>
      </div>

      {/* Main Tab Content Display */}
      {activeTab === 'DOCUMENT' && reportSnapshot && (
        <Prompt38ExecutiveReport 
          snapshot={reportSnapshot}
          onPrint={handlePrint}
          onExportCSV={handleExportCSV}
        />
      )}

      {/* Resumen Ejecutivo Directivo */}
      {activeTab === 'EXECUTIVE_SUMMARY' && reportSnapshot && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 font-display">Resumen Ejecutivo para Dirección y SST</h3>
            <p className="text-xs text-slate-500 font-medium">Síntesis directa y no técnica de la población laboral evaluada</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-indigo-50/60 border border-indigo-100 p-5 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600">Población & Cobertura</span>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Se evaluaron <strong className="text-indigo-900">{reportSnapshot.qualitySummary.totalEmployees} colaboradores</strong> con una cobertura de información del <strong className="text-indigo-900">{reportSnapshot.qualitySummary.overallCoveragePercentage}%</strong>.
              </p>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 p-5 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Perfil Sociodemográfico</span>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Edad promedio de <strong className="text-emerald-900">{reportSnapshot.variables['edad']?.average || 'N/A'} años</strong>. Distribución por género y contratos consolidada según fuentes maestras de nómina.
              </p>
            </div>

            <div className="bg-amber-50/60 border border-amber-100 p-5 rounded-2xl space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-600">Condición de Salud Reportada</span>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                Seguimiento preventivo a sintomatología musculoesquelética y condición nutricional según IMC calculado de forma rigurosa.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Principales Hallazgos Directivos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportSnapshot.findings.map(f => (
                <div key={f.id} className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-indigo-600">{f.category}</span>
                    <span className="text-slate-500">Evidencia {f.evidenceLevel}</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">{f.title}</h5>
                  <p className="text-xs text-slate-600 font-medium">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Indicadores & Calidad */}
      {activeTab === 'INDICATORS' && reportSnapshot && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 font-display">Matriz de Indicadores Calculados</h3>
            <p className="text-xs text-slate-500 font-medium">Resultados, numeradores y denominadores explícitos</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Código</th>
                  <th className="py-2.5 px-3">Nombre</th>
                  <th className="py-2.5 px-3 text-right">Resultado</th>
                  <th className="py-2.5 px-3 text-right">N</th>
                  <th className="py-2.5 px-3 text-right">Denominador</th>
                  <th className="py-2.5 px-3 text-right">Cobertura</th>
                  <th className="py-2.5 px-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportSnapshot.indicators.map(ind => (
                  <tr key={ind.indicatorId} className="hover:bg-slate-50/60">
                    <td className="py-2 px-3 font-mono font-bold text-indigo-600">{ind.code}</td>
                    <td className="py-2 px-3 font-semibold text-slate-800">{ind.name}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {ind.value !== null ? `${ind.value} ${ind.unit}` : 'SIN DATOS'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{ind.numerator}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{ind.denominator}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-700">{ind.coverage}%</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        ind.status === 'CALCULATED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        ind.status === 'INSUFFICIENT_DATA' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {ind.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Hallazgos & Recomendaciones */}
      {activeTab === 'FINDINGS_RECS' && reportSnapshot && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 font-display">Plan de Acción y Recomendaciones SG-SST</h3>
            <p className="text-xs text-slate-500 font-medium">Recomendaciones preventivas vinculadas a hallazgos basados en evidencia real</p>
          </div>

          <div className="space-y-4">
            {reportSnapshot.recommendations.map(rec => (
              <div key={rec.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{rec.dimension}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                    rec.priority === 'ALTA' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                    rec.priority === 'MEDIA' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    Prioridad {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-bold">{rec.proposedAction}</p>
                <p className="text-xs text-slate-600 font-medium">{rec.rationale}</p>
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 pt-1">
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Destinatarios: {rec.targetPopulation}</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Evidencia: {rec.indicatorEvidence}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trazabilidad & Auditoría */}
      {activeTab === 'AUDIT' && reportSnapshot && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900 font-display">Trazabilidad de Fórmulas y Auditoría de Integridad</h3>
            <p className="text-xs text-slate-500 font-medium">Registro auditable del cálculo de cada indicador</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2 px-2.5">Indicador</th>
                  <th className="py-2 px-2.5">Fórmula Aplicada</th>
                  <th className="py-2 px-2.5">Variables Requeridas</th>
                  <th className="py-2 px-2.5 text-right">Numerador</th>
                  <th className="py-2 px-2.5 text-right">Denominador</th>
                  <th className="py-2 px-2.5 text-right">Cobertura</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportSnapshot.traceability.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-2.5 font-bold text-slate-800">{t.indicatorCode}</td>
                    <td className="py-2 px-2.5 font-mono text-slate-600">{t.formula}</td>
                    <td className="py-2 px-2.5 text-slate-500">{t.variablesUsed.join(', ')}</td>
                    <td className="py-2 px-2.5 text-right font-mono">{t.numerator}</td>
                    <td className="py-2 px-2.5 text-right font-mono">{t.denominator}</td>
                    <td className="py-2 px-2.5 text-right font-mono font-bold text-indigo-600">{t.coveragePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Batería de Pruebas PROMPT 38 */}
      {activeTab === 'TESTS' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 font-display">Batería de Pruebas Automatizadas (PROMPT 38)</h3>
              <p className="text-xs text-slate-500 font-medium">Validación exhaustiva de los 46 requisitos de generación de informes SG-SST</p>
            </div>

            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRunningTests ? 'animate-spin' : ''}`} />
              <span>{isRunningTests ? 'Ejecutando...' : 'Re-ejecutar Pruebas'}</span>
            </button>
          </div>

          {testReport ? (
            <div className="space-y-4">
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                testReport.allPassed 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-3">
                  {testReport.allPassed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-rose-600" />
                  )}
                  <div>
                    <h4 className="text-xs font-extrabold">{testReport.suiteName}</h4>
                    <p className="text-[11px] font-medium opacity-90">
                      {testReport.passedTests} de {testReport.totalTests} pruebas superadas exitosamente ({testReport.allPassed ? '100% éxito' : 'Revisar fallos'})
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold">
                  {new Date(testReport.executedAt).toLocaleTimeString('es-CO')}
                </span>
              </div>

              <div className="space-y-3">
                {testReport.results.map(t => (
                  <div key={t.testId} className={`p-4 rounded-2xl border space-y-1.5 ${
                    t.passed ? 'bg-slate-50/70 border-slate-200/80' : 'bg-rose-50 border-rose-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${t.passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span className="text-xs font-bold text-slate-900">{t.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-slate-400">{t.executionTimeMs}ms</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {t.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 font-medium pl-4">{t.message}</p>
                    {t.details && (
                      <p className="text-[11px] text-slate-400 font-mono pl-4">{t.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Play className="w-8 h-8 mx-auto text-indigo-400" />
              <p className="text-xs font-medium">Haz clic en &quot;Ejecutar Batería&quot; para validar todos los casos de prueba.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
