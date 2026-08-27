import React, { useState, useMemo } from 'react';
import { 
  Activity, ShieldCheck, AlertTriangle, HelpCircle, CheckCircle2, 
  XCircle, Filter, Search, Eye, Sliders, Layers, ChevronDown, 
  ChevronRight, Play, Database, Scale, Heart, Briefcase, 
  Building, UserCheck, RefreshCw, BarChart3, Info
} from 'lucide-react';
import { 
  CentralIndicatorEngine, 
  IndicatorResultPrompt37, 
  IndicatorDefinition,
  IndicatorCategoryPrompt37,
  MASTER_INDICATOR_DEFINITIONS
} from '../core/indicator_engine';
import { Prompt37TestRunner, Prompt37SuiteReport } from '../core/indicator_engine/prompt37TestRunner';
import { masterDataModelService } from '../core/master_data_model/service';
import { catalogosService } from '../modules/configuracion/catalogos.service';

export default function Prompt37IndicatorPanel() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndicator, setSelectedIndicator] = useState<IndicatorResultPrompt37 | null>(null);
  const [showDefinitionModal, setShowDefinitionModal] = useState<IndicatorDefinition | null>(null);
  const [testReport, setTestReport] = useState<Prompt37SuiteReport | null>(null);
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'CATALOG' | 'TESTS'>('DASHBOARD');

  // Load real dataset from masterDataModelService
  const companyId = 'COMP_DEFAULT';
  const dataset = useMemo(() => {
    const rawColaboradores = masterDataModelService.getTableData('COLABORADORES')
      .filter((c: any) => !c.deletedAt);
    const rawRespuestas = masterDataModelService.getTableData('RESPUESTAS');
    const rawAusentismos = masterDataModelService.getTableData('AUSENTISMOS') || [];
    const rawBienestar = masterDataModelService.getTableData('BIENESTAR') || [];

    const catalogs: any = catalogosService.getCatalogsSync ? catalogosService.getCatalogsSync(companyId) : {};

    return {
      companyId,
      period: '2026-P1',
      surveyVersion: 'v3.0.0',
      datasetVersion: 'v3.0.0',
      dataSource: 'MIXED' as const,
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
  }, []);

  // Calculate all indicators through the Central Engine (Single source of truth)
  const calculatedIndicators = useMemo(() => {
    return CentralIndicatorEngine.calculateAll(dataset);
  }, [dataset]);

  // Filter indicators
  const filteredIndicators = useMemo(() => {
    return calculatedIndicators.filter(ind => {
      const def = CentralIndicatorEngine.getDefinition(ind.indicatorId);
      if (selectedCategory !== 'ALL' && def?.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return ind.name.toLowerCase().includes(q) || 
               ind.code.toLowerCase().includes(q) || 
               (def?.description || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [calculatedIndicators, selectedCategory, searchQuery]);

  // Category counts
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = { ALL: calculatedIndicators.length };
    for (const ind of calculatedIndicators) {
      const def = CentralIndicatorEngine.getDefinition(ind.indicatorId);
      if (def?.category) {
        counts[def.category] = (counts[def.category] || 0) + 1;
      }
    }
    return counts;
  }, [calculatedIndicators]);

  // Overall Coverage & Quality Statistics
  const overallMetrics = useMemo(() => {
    const total = calculatedIndicators.length;
    const calculated = calculatedIndicators.filter(i => i.status === 'CALCULATED').length;
    const insufficient = calculatedIndicators.filter(i => i.status === 'INSUFFICIENT_DATA').length;
    const noData = calculatedIndicators.filter(i => i.status === 'NO_DATA').length;
    const avgCoverage = total > 0 ? 
      parseFloat((calculatedIndicators.reduce((acc, i) => acc + i.coverage, 0) / total).toFixed(1)) : 0;

    return { total, calculated, insufficient, noData, avgCoverage };
  }, [calculatedIndicators]);

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const report = Prompt37TestRunner.runAllTests();
      setTestReport(report);
      setIsRunningTests(false);
      setActiveTab('TESTS');
    }, 400);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CALCULATED':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5" /> CALCULATED</span>;
      case 'INSUFFICIENT_DATA':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300"><AlertTriangle className="w-3.5 h-3.5" /> INSUFFICIENT_DATA</span>;
      case 'NO_DATA':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300"><HelpCircle className="w-3.5 h-3.5" /> NO_DATA</span>;
      case 'NOT_CALCULABLE':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300"><XCircle className="w-3.5 h-3.5" /> NOT_CALCULABLE</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-300">{status}</span>;
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'ANTROPOMETRIA': return <Scale className="w-4 h-4 text-indigo-600" />;
      case 'SOCIODEMOGRAFICO': return <Building className="w-4 h-4 text-blue-600" />;
      case 'SOCIOLABORAL': return <Briefcase className="w-4 h-4 text-amber-600" />;
      case 'ORGANIZACIONAL': return <Building className="w-4 h-4 text-purple-600" />;
      case 'SALUD': return <Heart className="w-4 h-4 text-rose-600" />;
      case 'ESTILO_VIDA': return <Activity className="w-4 h-4 text-teal-600" />;
      case 'BIENESTAR_AUSENTISMO': return <UserCheck className="w-4 h-4 text-emerald-600" />;
      default: return <BarChart3 className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> MOTOR CENTRAL DE INDICADORES (PROMPT 37)
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
              Motor Único de Cálculo y Trazabilidad SG-SST
            </h1>
            <p className="text-slate-300 text-sm max-w-3xl leading-relaxed">
              Fuente central y unificada de cálculo para el Dashboard y los Informes Ejecutivos. 
              Garantiza denominadores matemáticos explícitos, exclusión estricta de datos inválidos y cero estimaciones artificiales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'DASHBOARD'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Dashboard Central
            </button>
            <button
              onClick={() => setActiveTab('CATALOG')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'CATALOG'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              Catálogo de Definiciones ({MASTER_INDICATOR_DEFINITIONS.length})
            </button>
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50"
            >
              {isRunningTests ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Ejecutar Test Suite (Prompt 37)
            </button>
          </div>
        </div>

        {/* Global KPI Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium block">Total Indicadores</span>
            <span className="text-xl font-bold text-white mt-1 block">{overallMetrics.total}</span>
          </div>
          <div className="bg-emerald-950/40 rounded-xl p-3 border border-emerald-800/40">
            <span className="text-xs text-emerald-300 font-medium block">Calculados Válidos</span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">{overallMetrics.calculated}</span>
          </div>
          <div className="bg-amber-950/40 rounded-xl p-3 border border-amber-800/40">
            <span className="text-xs text-amber-300 font-medium block">Cobertura Parcial</span>
            <span className="text-xl font-bold text-amber-400 mt-1 block">{overallMetrics.insufficient}</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <span className="text-xs text-slate-400 font-medium block">Sin Datos (NO_DATA)</span>
            <span className="text-xl font-bold text-slate-300 mt-1 block">{overallMetrics.noData}</span>
          </div>
          <div className="bg-indigo-950/40 rounded-xl p-3 border border-indigo-800/40">
            <span className="text-xs text-indigo-300 font-medium block">Cobertura Promedio</span>
            <span className="text-xl font-bold text-indigo-400 mt-1 block">{overallMetrics.avgCoverage}%</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: DASHBOARD DE INDICADORES CENTRALIZADOS                         */}
      {/* ===================================================================== */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-6">
          {/* Controls Bar: Category Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'ANTROPOMETRIA', label: 'Antropometría' },
                { id: 'SOCIODEMOGRAFICO', label: 'Sociodemográfico' },
                { id: 'SOCIOLABORAL', label: 'Sociolaboral' },
                { id: 'ORGANIZACIONAL', label: 'Organizacional' },
                { id: 'SALUD', label: 'Salud & Dolor' },
                { id: 'ESTILO_VIDA', label: 'Estilo de Vida' },
                { id: 'BIENESTAR_AUSENTISMO', label: 'Bienestar / Ausentismo' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label} ({categoryStats[cat.id] || 0})
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o fórmula..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredIndicators.map(ind => {
              const def = CentralIndicatorEngine.getDefinition(ind.indicatorId);
              return (
                <div
                  key={ind.indicatorId}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-slate-100 border border-slate-200">
                          {getCategoryIcon(def?.category || '')}
                        </div>
                        <div>
                          <span className="text-[11px] font-mono font-semibold text-slate-500 block">
                            {ind.code}
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {def?.category}
                          </span>
                        </div>
                      </div>
                      <div>{getStatusBadge(ind.status)}</div>
                    </div>

                    {/* Indicator Title */}
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                        {ind.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {def?.description}
                      </p>
                    </div>

                    {/* Main Value Display */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-500 block font-medium">Resultado</span>
                        <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                          {ind.value !== null ? (
                            <span>
                              {ind.value}{' '}
                              <span className="text-xs font-medium text-slate-500">{ind.unit}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium text-sm">Sin datos</span>
                          )}
                        </div>
                      </div>

                      {/* Explicit Denominator & Coverage */}
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block font-medium">Denominador / Cobertura</span>
                        <span className="text-xs font-bold text-slate-700">
                          {ind.denominator} <span className="text-slate-400 font-normal">/ {ind.totalPopulation}</span>
                        </span>
                        <span className="text-xs font-semibold text-indigo-600 block">
                          {ind.coverage}% cobertura
                        </span>
                      </div>
                    </div>

                    {/* Distribution Preview (if categorical) */}
                    {ind.distribution && ind.distribution.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-600 block">
                          Distribución ({ind.distribution.length} categorías):
                        </span>
                        <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                          {ind.distribution.slice(0, 4).map((d, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-slate-600 truncate max-w-[160px]">{d.label}</span>
                              <span className="font-semibold text-slate-800">
                                {d.percentage}% <span className="text-slate-400 font-normal">({d.count})</span>
                              </span>
                            </div>
                          ))}
                          {ind.distribution.length > 4 && (
                            <span className="text-[10px] text-slate-400 italic block">
                              + {ind.distribution.length - 4} categorías más...
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Limitations & Warnings */}
                    {ind.limitations.length > 0 && (
                      <div className="bg-amber-50 border border-amber-200/80 rounded-lg p-2 flex items-start gap-1.5 text-xs text-amber-800">
                        <Info className="w-3.5 h-3.5 mt-0.5 text-amber-600 shrink-0" />
                        <span className="text-[11px] leading-tight">{ind.limitations[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => def && setShowDefinitionModal(def)}
                      className="text-xs font-medium text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                    >
                      <Info className="w-3.5 h-3.5" /> Ficha Técnica
                    </button>
                    <button
                      onClick={() => setSelectedIndicator(ind)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      Trazabilidad & Exclusiones <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: CATÁLOGO DE DEFINICIONES MAESTRAS                               */}
      {/* ===================================================================== */}
      {activeTab === 'CATALOG' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Catálogo Maestro de Indicadores Registrados</h2>
            <p className="text-xs text-slate-500 mt-1">
              Definiciones formales del indicador según Prompt 37 con fórmula, unidad, numerador, denominador requerido y umbrales de semáforo.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-y border-slate-200">
                  <th className="py-3 px-3 font-semibold">Código</th>
                  <th className="py-3 px-3 font-semibold">Nombre del Indicador</th>
                  <th className="py-3 px-3 font-semibold">Categoría</th>
                  <th className="py-3 px-3 font-semibold">Fórmula Matemática</th>
                  <th className="py-3 px-3 font-semibold">Unidad</th>
                  <th className="py-3 px-3 font-semibold">Cob. Mínima</th>
                  <th className="py-3 px-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MASTER_INDICATOR_DEFINITIONS.map(def => (
                  <tr key={def.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600">{def.code}</td>
                    <td className="py-3 px-3 font-medium text-slate-900 max-w-[220px]">
                      {def.name}
                      <span className="block text-[11px] text-slate-500 mt-0.5 truncate">{def.description}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {def.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 max-w-[280px] truncate">
                      {def.formula}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{def.unit}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{def.minimumCoverage}%</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setShowDefinitionModal(def)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold text-xs"
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: TEST SUITE EJECUTOR & RESULTADOS                               */}
      {/* ===================================================================== */}
      {activeTab === 'TESTS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Resultados de Pruebas Automáticas (Prompt 37)</h2>
              <p className="text-xs text-slate-500 mt-1">
                Validación de la prueba crítica de 100 colaboradores (80 válidos), prueba de ausencia de datos, protección anti-regresión y reglas de redondeo.
              </p>
            </div>
            <button
              onClick={handleRunTests}
              disabled={isRunningTests}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-all shadow-sm disabled:opacity-50"
            >
              {isRunningTests ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              Re-ejecutar Tests
            </button>
          </div>

          {testReport && (
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border flex items-center justify-between ${
                testReport.allPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center gap-3">
                  {testReport.allPassed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-sm">
                      {testReport.allPassed ? 'Todos los tests pasaron exitosamente (100% éxito)' : 'Existen fallos en la suite de pruebas'}
                    </span>
                    <span className="text-xs block opacity-80">
                      {testReport.passedTests} de {testReport.totalTests} pruebas superadas. Ejecutado el {new Date(testReport.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold">{testReport.successRate}%</span>
                </div>
              </div>

              <div className="space-y-3">
                {testReport.results.map(r => (
                  <div
                    key={r.testId}
                    className={`p-4 rounded-xl border text-xs space-y-1.5 ${
                      r.passed ? 'bg-slate-50 border-slate-200' : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {r.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        )}
                        <span className="font-mono font-bold text-slate-500">{r.testId}</span>
                        <span className="font-semibold text-slate-900">{r.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {r.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6 pt-1 text-[11px]">
                      <div>
                        <span className="text-slate-500 font-medium">Esperado:</span>{' '}
                        <span className="text-slate-800 font-mono">{r.expected}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-medium">Obtenido:</span>{' '}
                        <span className="text-slate-800 font-mono">{r.actual}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: TRAZABILIDAD & EXCLUSIONES                                     */}
      {/* ===================================================================== */}
      {selectedIndicator && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 block">{selectedIndicator.code}</span>
                <h3 className="text-lg font-bold text-slate-900">{selectedIndicator.name}</h3>
              </div>
              <button
                onClick={() => setSelectedIndicator(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Traceability Summary */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-700">Fórmula & Trazabilidad Aplicada</div>
              <div className="font-mono text-indigo-900 bg-white p-2 rounded border border-slate-200">
                {selectedIndicator.traceability.formulaUsed}
              </div>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div>
                  <span className="text-slate-500">Registros Válidos Usados:</span>{' '}
                  <span className="font-bold text-slate-800">{selectedIndicator.traceability.dataPointsUsed}</span>
                </div>
                <div>
                  <span className="text-slate-500">Registros Excluidos:</span>{' '}
                  <span className="font-bold text-rose-600">{selectedIndicator.traceability.dataPointsExcluded}</span>
                </div>
              </div>
              <div className="pt-1 text-slate-600">
                {selectedIndicator.traceability.coverageExplanation}
              </div>
            </div>

            {/* Exclusions Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800">
                  Listado de Registros Excluidos ({selectedIndicator.excludedRecords.length})
                </h4>
                <span className="text-[10px] text-slate-500 italic">No cumplen calidad de datos</span>
              </div>

              {selectedIndicator.excludedRecords.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center">
                  Cero exclusiones: el 100% de los registros evaluados fueron válidos.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-200 text-xs">
                  {selectedIndicator.excludedRecords.map((e, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between hover:bg-slate-50">
                      <div>
                        <span className="font-mono font-semibold text-slate-700">{e.recordId}</span>
                        <span className="text-[11px] text-slate-500 block">{e.reason}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                        {e.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedIndicator(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: FICHA TÉCNICA DE DEFINICIÓN                                    */}
      {/* ===================================================================== */}
      {showDefinitionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 block">{showDefinitionModal.code}</span>
                <h3 className="text-lg font-bold text-slate-900">{showDefinitionModal.name}</h3>
              </div>
              <button
                onClick={() => setShowDefinitionModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-700 block">Descripción:</span>
                <p className="text-slate-600 mt-0.5">{showDefinitionModal.description}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <div>
                  <span className="font-semibold text-slate-700">Fórmula Formal:</span>
                  <p className="font-mono text-indigo-900 text-[11px] mt-0.5">{showDefinitionModal.formula}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Numerador:</span>
                  <p className="text-slate-600 mt-0.5">{showDefinitionModal.numerator}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Denominador:</span>
                  <p className="text-slate-600 mt-0.5">{showDefinitionModal.denominator}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Tipo Agregación:</span>
                  <span className="font-bold text-slate-800">{showDefinitionModal.aggregationType}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Cobertura Mínima:</span>
                  <span className="font-bold text-slate-800">{showDefinitionModal.minimumCoverage}%</span>
                </div>
              </div>

              {showDefinitionModal.thresholds && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-semibold text-slate-700 block">Umbrales de Semáforo:</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-emerald-800">
                      <span className="font-bold block">Verde</span>
                      <span>{showDefinitionModal.thresholds.green?.label || 'Meta Cumplida'}</span>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 p-2 rounded-lg text-amber-800">
                      <span className="font-bold block">Amarillo</span>
                      <span>{showDefinitionModal.thresholds.yellow?.label || 'Alerta'}</span>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 p-2 rounded-lg text-rose-800">
                      <span className="font-bold block">Rojo</span>
                      <span>{showDefinitionModal.thresholds.red?.label || 'Crítico'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setShowDefinitionModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
