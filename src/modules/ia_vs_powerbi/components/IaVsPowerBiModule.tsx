import React, { useState, useMemo } from 'react';
import { 
  Scale, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Brain, 
  FileText, 
  Download, 
  RefreshCw, 
  Sliders, 
  Search, 
  Filter, 
  HelpCircle, 
  Building2, 
  UserCheck, 
  BookOpen, 
  TrendingUp, 
  DollarSign, 
  Cpu, 
  Database, 
  Activity, 
  ExternalLink,
  Edit3,
  Save,
  Clock,
  Briefcase,
  GitCompare,
  Workflow,
  Eye,
  Info
} from 'lucide-react';
import { useEmpresa } from '../../configuracion/useEmpresa';
import { usePermissions } from '../../../core/rbac/usePermissions';
import { 
  IaVsPowerBiService, 
  DEFAULT_CRITERIA_MATRIX, 
  VERIFIED_DIFFERENTIALS, 
  COMPLEMENTARITY_MATRIX, 
  USAGE_SCENARIOS, 
  COST_COMPARISON_ITEMS,
  DEFAULT_DECISION_WEIGHTS,
  DEFAULT_ACADEMIC_CONCLUSION
} from '../services/iaVsPowerBiService';
import { 
  ComparisonCriterionItem, 
  DecisionCriterionWeight, 
  IaVsPowerBiModuleState,
  DataClassificationType
} from '../types/iaVsPowerBi.types';

export default function IaVsPowerBiModule() {
  const { config, activeCompanyId } = useEmpresa();
  const { can, isAdmin, isSuperAdmin, role } = usePermissions();

  const canEdit = can('AI_POWERBI_COMPARISON_EDIT') || isAdmin || isSuperAdmin;

  const [activeSubTab, setActiveSubTab] = useState<
    'posicionamiento' | 
    'matriz_comparativa' | 
    'diferencia_flujo' | 
    'diferenciales' | 
    'complementariedad' | 
    'escenarios' | 
    'costos_tco' | 
    'matriz_decision' | 
    'madurez_tecnologica' | 
    'conclusion_academica' | 
    'trazabilidad_auditoria'
  >('posicionamiento');

  // Module state per tenant
  const [moduleState, setModuleState] = useState<IaVsPowerBiModuleState>(() => {
    return IaVsPowerBiService.getState(activeCompanyId || 'empresa_main_001');
  });

  // Search & Filters for Comparison Matrix
  const [criteriaSearch, setCriteriaSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('TODAS');
  const [selectedScopeFilter, setSelectedScopeFilter] = useState<string>('TODOS');

  // Modal for editing weights
  const [editingWeight, setEditingWeight] = useState<DecisionCriterionWeight | null>(null);
  const [tempWeightVal, setTempWeightVal] = useState<number>(3);
  const [weightJustification, setWeightJustification] = useState('');

  // Modal for editing Academic Conclusion
  const [isEditingConclusion, setIsEditingConclusion] = useState(false);
  const [thesisDraft, setThesisDraft] = useState(moduleState.academicConclusion.academicThesis);
  const [synthesisDraft, setSynthesisDraft] = useState(moduleState.academicConclusion.technicalSynthesis);
  const [conclusionJustification, setConclusionJustification] = useState('');

  // Reload state if activeCompanyId changes
  React.useEffect(() => {
    setModuleState(IaVsPowerBiService.getState(activeCompanyId || 'empresa_main_001'));
  }, [activeCompanyId]);

  // Decision Score calculation
  const decisionResult = useMemo(() => {
    return IaVsPowerBiService.calculateDecisionScore(moduleState.decisionWeights);
  }, [moduleState.decisionWeights]);

  // Filtered criteria
  const filteredCriteria = useMemo(() => {
    return moduleState.criteria.filter(crit => {
      const matchesSearch = crit.name.toLowerCase().includes(criteriaSearch.toLowerCase()) ||
                            crit.insightPeopleVal.toLowerCase().includes(criteriaSearch.toLowerCase()) ||
                            crit.powerBiVal.toLowerCase().includes(criteriaSearch.toLowerCase()) ||
                            crit.notes.toLowerCase().includes(criteriaSearch.toLowerCase());
      
      const matchesCategory = selectedCategoryFilter === 'TODAS' || crit.category === selectedCategoryFilter;
      const matchesScope = selectedScopeFilter === 'TODOS' || crit.diferencialScope === selectedScopeFilter;

      return matchesSearch && matchesCategory && matchesScope;
    });
  }, [moduleState.criteria, criteriaSearch, selectedCategoryFilter, selectedScopeFilter]);

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWeight) return;

    const updated = IaVsPowerBiService.updateDecisionWeight(
      activeCompanyId || 'empresa_main_001',
      editingWeight.id,
      tempWeightVal,
      'lider.ghumana@innovatechit.com.co',
      role?.code || 'ADMIN_EMPRESA',
      weightJustification || 'Ajuste de ponderación en matriz de decisión'
    );

    setModuleState(updated);
    setEditingWeight(null);
    setWeightJustification('');
  };

  const handleSaveConclusion = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = IaVsPowerBiService.updateAcademicConclusion(
      activeCompanyId || 'empresa_main_001',
      {
        academicThesis: thesisDraft,
        technicalSynthesis: synthesisDraft
      },
      'lider.ghumana@innovatechit.com.co',
      role?.code || 'ADMIN_EMPRESA',
      conclusionJustification || 'Revisión técnica de la conclusión académica'
    );

    setModuleState(updated);
    setIsEditingConclusion(false);
    setConclusionJustification('');
  };

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                <GitCompare className="w-3.5 h-3.5" /> FASE 6: ANÁLISIS COMPARATIVO & COEXISTENCIA
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> MARCO ACADÉMICO & EMPRESARIAL VERIFICADO
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Tenant: {config?.nombreEmpresa || 'InnovaTech IT S.A.S.'} (482 Colaboradores)
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>IA vs. Power BI</span>
              <span className="text-sm font-medium px-3 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-700 text-indigo-200">
                Especialización de Dominio vs. BI Generalista
              </span>
            </h1>
            <p className="text-slate-300 text-sm mt-1.5 max-w-4xl leading-relaxed">
              Evaluación técnica, funcional y metodológica objetiva. Insight People IA no busca sustituir a Power BI como estándar corporativo, sino integrar el ciclo de vida especializado de Gestión Humana y SG-SST (captura, validación de 17 dimensiones, cálculo legal de Decreto 1072, IA consultiva, gobernanza ética y supervisión humana).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
              title="Imprimir informe comparativo"
            >
              <Download className="w-4 h-4 text-indigo-400" /> Exportar Informe
            </button>
            <div className="text-right pl-3 border-l border-slate-800 hidden sm:block">
              <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Criterios Auditados</span>
              <span className="text-base font-black text-indigo-400">26 / 26 Verificados</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto mt-6 pt-4 border-t border-slate-800/80 scrollbar-thin scrollbar-thumb-slate-700 pb-1 text-xs">
          {[
            { id: 'posicionamiento', label: '1. ¿Qué es Insight People IA?', icon: HelpCircle },
            { id: 'matriz_comparativa', label: '2. Matriz Comparativa (26 Criterios)', icon: Scale },
            { id: 'diferencia_flujo', label: '3. Diferencia Fundamental de Flujo', icon: Workflow },
            { id: 'diferenciales', label: '4. 15 Diferenciales Clave', icon: CheckCircle2 },
            { id: 'complementariedad', label: '5. Sinergia (Insight + Power BI)', icon: Layers },
            { id: 'escenarios', label: '6. Escenarios de Uso (1, 2 y 3)', icon: Briefcase },
            { id: 'costos_tco', label: '7. Análisis de Costos & TCO', icon: DollarSign },
            { id: 'matriz_decision', label: '8. Matriz de Decisión Interactiva', icon: Sliders },
            { id: 'madurez_tecnologica', label: '9. Madurez & Gobernanza', icon: Cpu },
            { id: 'conclusion_academica', label: '10. Conclusión Académica', icon: BookOpen },
            { id: 'trazabilidad_auditoria', label: '11. Auditoría & Trazabilidad', icon: Clock }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-lg font-medium whitespace-nowrap flex items-center gap-2 transition-all shrink-0 ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 font-semibold' 
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-indigo-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-TAB 1: POSICIONAMIENTO */}
      {activeSubTab === 'posicionamiento' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="max-w-4xl">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Definición y Posicionamiento Estratégico
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                ¿Qué es Insight People IA y cómo se diferencia de una herramienta de BI?
              </h2>
              <p className="text-slate-600 text-sm mt-2 leading-relaxed">
                <strong>Insight People IA</strong> es una plataforma integral y especializada de analítica, caracterización sociodemográfica y apoyo inteligente a la toma de decisiones para las áreas de <strong>Gestión Humana</strong> y <strong>Seguridad y Salud en el Trabajo (SG-SST)</strong>. A diferencia de un motor de visualización en blanco, integra nativamente la recolección de información, validación determinista de calidad de datos (17 dimensiones), cálculo de indicadores normativos bajo el Decreto 1072/2015 y Resolución 0312/2019, inteligencia artificial consultiva, gobernanza ética con supervisión humana obligatoria y gestión de planes de acción.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-slate-100">
              {/* Power BI Definition */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-700 font-black text-sm">
                      PBI
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Power BI</h3>
                      <span className="text-[11px] text-amber-700 font-semibold uppercase">Business Intelligence Horizontal</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Líder Generalista</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2.5 mt-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Propósito:</strong> Ingestión masiva, modelado multidimensional (DAX/M) y tableros interactivos para cualquier industria.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Fortaleza:</strong> Flexibilidad absoluta de visualización y conectividad con más de 300 fuentes de datos.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Límite de dominio:</strong> No recolecta encuestas nativamente, no valida reglas clínicas ni redacta informes de SST sin desarrollo a medida.</span>
                  </li>
                </ul>
              </div>

              {/* Insight People IA Definition */}
              <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5 relative">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
                      IP
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">Insight People IA</h3>
                      <span className="text-[11px] text-indigo-700 font-semibold uppercase">Solución Vertical de Dominio</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">Especialista SG-SST</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-2.5 mt-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Propósito:</strong> Ciclo completo de caracterización, auditoría de calidad, cálculo legal de SST, prescripción y seguimiento de planes.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Fortaleza:</strong> Time-to-Value inmediato, paridad matemática auditada, IA contextualizada y gobernanza ética (HITL).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span><strong>Integrabilidad:</strong> Capaz de entregar datos depurados y modelos 3NF a Power BI para el cuadro de mando corporativo.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Core Principles of the Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Objetividad Técnica</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Se reconocen las ventajas mundiales de Power BI en visualización abierta y escalabilidad de Big Data, sin atribuirle defectos falsos ni afirmar sustitución absoluta.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Workflow className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Especialización vs. Generalismo</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Construir en Power BI lo que Insight People IA hace de forma nativa requiere meses de consultoría, modelado DAX y licencias de captura adicionales.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                <Layers className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Sinergia Tecnológica</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                La arquitectura corporativa más robusta utiliza Insight People IA como motor de captura/calidad en SST y Power BI como vitrina gerencial corporativa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: MATRIZ COMPARATIVA */}
      {activeSubTab === 'matriz_comparativa' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar en los 26 criterios..."
                value={criteriaSearch}
                onChange={e => setCriteriaSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" /> Categoría:
                <select
                  value={selectedCategoryFilter}
                  onChange={e => setSelectedCategoryFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-md py-1 px-2 bg-white focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="TODAS">Todas las Categorías</option>
                  <option value="RECOLECCION_DATOS">Recolección de Datos</option>
                  <option value="VALIDACION_CALIDAD">Validación y Calidad</option>
                  <option value="INDICADORES_SST">Indicadores de SG-SST</option>
                  <option value="ANALITICA_VISUALIZACION">Analítica y Visualización</option>
                  <option value="IA_GOBERNANZA">IA y Gobernanza Ética</option>
                  <option value="INFORMES_AUTOMATIZACION">Informes y Automatización</option>
                  <option value="PARAMETRIZACION_MULTIEMPRESA">Parametrización y Multiempresa</option>
                  <option value="ESCALABILIDAD_DESPLIEGUE">Escalabilidad y Despliegue</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                Alcance:
                <select
                  value={selectedScopeFilter}
                  onChange={e => setSelectedScopeFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-md py-1 px-2 bg-white focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="TODOS">Todos los Alcances</option>
                  <option value="VENTAJA_INSIGHT">Ventaja Insight People IA</option>
                  <option value="EQUIVALENTE">Equivalente / Comparable</option>
                  <option value="VENTAJA_POWERBI">Ventaja Power BI</option>
                  <option value="COMPLEMENTARIO">Complementario</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table of Criteria */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold">
                    <th className="py-3.5 px-4 w-1/4">Criterio Evaluado</th>
                    <th className="py-3.5 px-4 w-1/3 bg-indigo-950/80 border-l border-r border-indigo-800">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Insight People IA (Especializado)</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-4 w-1/3">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>Power BI (Generalista)</span>
                      </div>
                    </th>
                    <th className="py-3.5 px-3 text-center w-24">Alcance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCriteria.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500">
                        No se encontraron criterios que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredCriteria.map(crit => {
                      let badge = (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          Insight
                        </span>
                      );
                      if (crit.diferencialScope === 'VENTAJA_POWERBI') {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Power BI
                          </span>
                        );
                      } else if (crit.diferencialScope === 'EQUIVALENTE') {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300">
                            Equivalente
                          </span>
                        );
                      } else if (crit.diferencialScope === 'COMPLEMENTARIO') {
                        badge = (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                            Sinergia
                          </span>
                        );
                      }

                      return (
                        <tr key={crit.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 align-top">
                            <div className="font-bold text-slate-900">{crit.name}</div>
                            <span className="inline-block mt-1 text-[10px] text-slate-400 font-mono uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                              {crit.category.replace('_', ' ')}
                            </span>
                            {crit.codeReference && (
                              <div className="mt-1.5 text-[10px] text-indigo-600 font-mono flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{crit.codeReference}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4 align-top bg-indigo-50/30 border-l border-r border-indigo-100/60 text-slate-700 leading-relaxed font-medium">
                            {crit.insightPeopleVal}
                          </td>
                          <td className="py-3.5 px-4 align-top text-slate-600 leading-relaxed">
                            {crit.powerBiVal}
                          </td>
                          <td className="py-3.5 px-3 align-top text-center">
                            {badge}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right text-[11px] text-slate-500">
              Mostrando {filteredCriteria.length} de {moduleState.criteria.length} criterios verificados en arquitectura
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: DIFERENCIA FUNDAMENTAL DE FLUJO */}
      {activeSubTab === 'diferencia_flujo' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Arquitectura de Ciclo de Vida de Información
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              Diferencia Fundamental: Flujo Lineal de BI vs. Ciclo Cerrado de Prescripción y Acción
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-4xl leading-relaxed">
              Mientras que Power BI está optimizado para el ciclo clásico de Business Intelligence (transformación y visualización), Insight People IA implementa un ciclo de 13 etapas diseñado para la gestión clínica, legal y preventiva de personas y riesgos laborales.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              
              {/* Power BI Flow (5 Steps) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-black text-xs">
                        PBI
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Flujo Clásico de Power BI</h3>
                        <span className="text-[11px] text-slate-500">5 Pasos Lineales (Visualización Pasiva)</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">
                      Herramienta Descriptiva
                    </span>
                  </div>

                  <div className="space-y-3 relative pl-4 border-l-2 border-amber-300 my-4">
                    {[
                      { step: '1. Datos', desc: 'Conexión a bases de datos, Excel o data lakes existentes.' },
                      { step: '2. Modelado', desc: 'Transformación con Power Query (M) y medidas en DAX.' },
                      { step: '3. Visualización', desc: 'Construcción de gráficos, tablas dinámicas y tableros.' },
                      { step: '4. Análisis', desc: 'El usuario humano explora e interpreta las métricas.' },
                      { step: '5. Decisión', desc: 'El usuario toma decisiones fuera de la plataforma.' }
                    ].map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-amber-500 border-2 border-white"></div>
                        <h4 className="text-xs font-bold text-slate-900">{item.step}</h4>
                        <p className="text-[11px] text-slate-600 mt-0.5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <strong>Limitación de ciclo:</strong> No captura la encuesta inicial, no valida reglas de salud laboral, no redacta planes de acción ni supervisa la ejecución.
                </div>
              </div>

              {/* Insight People IA Flow (13 Steps) */}
              <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-200/80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-sm">
                        IP
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Flujo Especializado de Insight People IA</h3>
                        <span className="text-[11px] text-indigo-700 font-semibold">13 Pasos de Ciclo Cerrado (Prescriptivo y Accionable)</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 rounded">
                      Solución de Dominio
                    </span>
                  </div>

                  <div className="space-y-2.5 relative pl-4 border-l-2 border-indigo-400 my-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin">
                    {[
                      { step: '1. Datos Originarios', desc: 'Maestro de 482 colaboradores normalizado en 3NF.' },
                      { step: '2. Encuesta / Carga Excel', desc: 'Constructor nativo o carga guiada con auto-mapeo.' },
                      { step: '3. Validación Automatizada', desc: '17 reglas de calidad de datos en tiempo real.' },
                      { step: '4. Indicadores SG-SST', desc: 'CentralIndicatorEngine determinista bajo Decreto 1072.' },
                      { step: '5. Analítica Multidimensional', desc: 'Segmentación cruzada por sede, área, cargo y riesgo.' },
                      { step: '6. IA Consultiva Contextual', desc: 'Modelos de lenguaje entrenados con el contexto de la empresa.' },
                      { step: '7. Insight Explicable', desc: 'Detección automática de causas raíz y correlaciones.' },
                      { step: '8. Recomendación Preventiva', desc: 'Propuesta de intervenciones ergonómicas y psicosociales.' },
                      { step: '9. Gobernanza Ética', desc: 'Auditoría contra sesgos, alucinaciones y fuga de datos.' },
                      { step: '10. Validación Humana (HITL)', desc: 'Firma y aprobación formal por el Líder SST / Médico.' },
                      { step: '11. Decisión Formal', desc: 'Adopción de directrices estratégicas de prevención.' },
                      { step: '12. Acción Asignada', desc: 'Planes de acción con responsables, fechas y presupuesto.' },
                      { step: '13. Seguimiento de Eficacia', desc: 'Medición periódica del impacto en reducción de riesgos.' }
                    ].map((item, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white"></div>
                        <h4 className="text-xs font-bold text-indigo-950">{item.step}</h4>
                        <p className="text-[11px] text-slate-600">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-indigo-100/80 border border-indigo-200 rounded-lg text-xs text-indigo-900">
                  <strong>Ventaja de ciclo cerrado:</strong> Transforma el dato en cumplimiento legal, salud del trabajador y retorno financiero sin salir del sistema.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: 15 DIFERENCIALES CLAVE */}
      {activeSubTab === 'diferenciales' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Capacidades Demostrables y Verificadas
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              Los 15 Diferenciales Reales de Insight People IA
            </h2>
            <p className="text-slate-600 text-sm mt-1.5 max-w-4xl leading-relaxed">
              Cada una de estas capacidades está programada en el código fuente de la plataforma. No son promesas de diseño, sino módulos funcionales verificables en la arquitectura activa.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
              {VERIFIED_DIFFERENTIALS.map(diff => (
                <div key={diff.id} className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-all shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                        {diff.number}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {diff.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{diff.name}</h3>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {diff.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-1.5 text-[11px]">
                    <div className="text-indigo-600 font-mono truncate" title={diff.technicalVerification}>
                      <span className="text-slate-400">Ref:</span> {diff.technicalVerification}
                    </div>
                    <div className="text-emerald-700 font-medium">
                      <span className="text-slate-500 font-normal">Impacto:</span> {diff.businessImpact}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: MATRIZ DE COMPLEMENTARIEDAD */}
      {activeSubTab === 'complementariedad' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
              Arquitectura de Coexistencia Sinergica
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              Insight People IA + Power BI: Cómo Coexisten en la Empresa
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-4xl leading-relaxed">
              La estrategia de analítica empresarial más sólida no obliga a elegir entre una solución de dominio y una herramienta de BI. Define roles claros en cada capa para maximizar el valor de ambas inversiones tecnológicas.
            </p>

            <div className="space-y-4 mt-6">
              {COMPLEMENTARITY_MATRIX.map(item => (
                <div key={item.id} className="border border-slate-200 rounded-xl p-5 bg-gradient-to-r from-white via-slate-50/50 to-indigo-50/20 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                    <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      {item.dimension}
                    </h3>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-100/60 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      Sinergia Verificada
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                    <div className="p-3 bg-indigo-50/60 border border-indigo-100 rounded-lg">
                      <div className="font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Rol de Insight People IA:
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.insightRole}</p>
                    </div>

                    <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg">
                      <div className="font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-600" /> Rol de Power BI:
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.powerBiRole}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                    <div className="text-slate-600">
                      <strong>Resultado Sinergico:</strong> {item.synergyOutcome}
                    </div>
                    <div className="text-indigo-600 font-medium shrink-0 flex items-center gap-1">
                      <Workflow className="w-3.5 h-3.5" /> Flujo: {item.practicalWorkflow}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: ESCENARIOS DE USO */}
      {activeSubTab === 'escenarios' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Casos Reales de Implementación
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              3 Escenarios de Decisión Empresarial
            </h2>
            <p className="text-slate-600 text-sm mt-1.5 max-w-4xl leading-relaxed">
              Analice la situación actual de su organización para determinar la ruta óptima de adopción tecnológica y generación de valor.
            </p>

            <div className="space-y-6 mt-6">
              {USAGE_SCENARIOS.map(scenario => (
                <div key={scenario.id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div>
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${scenario.badgeColor}`}>
                        {scenario.code.replace('_', ' ')}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base mt-1.5">{scenario.title}</h3>
                      <p className="text-xs text-slate-500">{scenario.subtitle}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-md">
                      Perfil: {scenario.companyProfile}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                    <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-lg">
                      <div className="font-bold text-red-900 mb-1 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Dolor o Fricción Actual:
                      </div>
                      <p className="text-slate-700 leading-relaxed">{scenario.currentPainPoint}</p>
                    </div>

                    <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                      <div className="font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
                        <Workflow className="w-3.5 h-3.5 text-indigo-600" /> Arquitectura Recomendada:
                      </div>
                      <p className="text-slate-700 leading-relaxed">{scenario.recommendedArchitecture}</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-900 mb-2">Valor de Negocio Entregado en este Escenario:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      {scenario.businessValueDelivered.map((val, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: ANÁLISIS DE COSTOS & TCO */}
      {activeSubTab === 'costos_tco' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Costo Total de Propiedad (TCO) & Esfuerzo de Desarrollo
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                [B] Supuestos de Industria Verificados
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Comparativa Objetiva de Inversión y Esfuerzo Operativo
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-4xl leading-relaxed">
              El costo de Power BI no se limita al licenciamiento de software; incluye el costo de consultores DAX/M, licencias de captura externa, mantenimiento ante reformas legales y hosting. Insight People IA ofrece una solución integral llave en mano pre-configurada.
            </p>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold">
                    <th className="py-3 px-4 w-1/5">Rubro de Costo / Esfuerzo</th>
                    <th className="py-3 px-4 w-1/3 bg-indigo-950 border-l border-r border-indigo-800">Insight People IA (SaaS Vertical)</th>
                    <th className="py-3 px-4 w-1/3">Power BI (Proyecto BI a Medida)</th>
                    <th className="py-3 px-3 text-center">Clasificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {COST_COMPARISON_ITEMS.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900 align-top">
                        {item.costCategory}
                        <div className="text-[11px] text-slate-500 font-normal mt-1">
                          {item.riskOrConsideration}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 align-top bg-indigo-50/20 border-l border-r border-indigo-100 text-slate-700 leading-relaxed font-medium">
                        {item.insightPeopleApproach}
                      </td>
                      <td className="py-3.5 px-4 align-top text-slate-600 leading-relaxed">
                        {item.powerBiApproach}
                        <div className="text-[10px] text-amber-700 font-semibold mt-1">
                          {item.financialImplication}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 align-top text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {item.dataClassification}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-600">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Nota Metodológica de Costos:</strong> El costo exacto de Power BI depende del contrato corporativo Enterprise Agreement con Microsoft, número de usuarios Pro/PPU y capacidad de cómputo en Fabric. Las estimaciones aquí expuestas reflejan el costo promedio de proyectos de Business Intelligence en Colombia para el módulo de Gestión Humana y SST.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 8: MATRIZ DE DECISIÓN INTERACTIVA */}
      {activeSubTab === 'matriz_decision' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Simulador Dinámico de Afinidad Tecnológica
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Ponderador de 1 a 5 estrellas por dimensión
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Matriz de Criterios de Selección y Recomendación
            </h2>
            <p className="text-slate-600 text-sm mt-1.5 max-w-4xl leading-relaxed">
              Ajuste el nivel de importancia (1 = Baja, 5 = Crítica) de cada necesidad organizativa. El algoritmo calculará en tiempo real el ajuste porcentual de cada alternativa y generará una recomendación objetiva.
            </p>

            {/* Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              
              {/* Insight People Fit Card */}
              <div className={`p-5 rounded-xl border transition-all ${
                decisionResult.recommendedOption === 'INSIGHT_PEOPLE_IA'
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-lg shadow-indigo-900/20'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    decisionResult.recommendedOption === 'INSIGHT_PEOPLE_IA' ? 'text-indigo-200' : 'text-indigo-600'
                  }`}>
                    Afinidad Insight People IA
                  </span>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-3xl font-black">{decisionResult.insightWeightedAvg}%</div>
                <p className={`text-xs mt-1 leading-relaxed ${
                  decisionResult.recommendedOption === 'INSIGHT_PEOPLE_IA' ? 'text-indigo-100' : 'text-slate-500'
                }`}>
                  Ajuste ponderado según sus prioridades de captura, calidad, SST e IA ética.
                </p>
              </div>

              {/* Power BI Fit Card */}
              <div className={`p-5 rounded-xl border transition-all ${
                decisionResult.recommendedOption === 'POWER_BI'
                  ? 'bg-amber-600 text-white border-amber-700 shadow-lg shadow-amber-900/20'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    decisionResult.recommendedOption === 'POWER_BI' ? 'text-amber-200' : 'text-amber-600'
                  }`}>
                    Afinidad Power BI
                  </span>
                  <Layers className="w-4 h-4" />
                </div>
                <div className="text-3xl font-black">{decisionResult.powerBiWeightedAvg}%</div>
                <p className={`text-xs mt-1 leading-relaxed ${
                  decisionResult.recommendedOption === 'POWER_BI' ? 'text-amber-100' : 'text-slate-500'
                }`}>
                  Ajuste ponderado según sus prioridades de visualización macro y múltiples fuentes.
                </p>
              </div>

              {/* Final Recommendation Card */}
              <div className="p-5 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                    Recomendación Algorítmica
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">
                    {decisionResult.recommendedOption === 'INSIGHT_PEOPLE_IA' && 'Insight People IA'}
                    {decisionResult.recommendedOption === 'POWER_BI' && 'Power BI'}
                    {decisionResult.recommendedOption === 'ARQUITECTURA_HIBRIDA' && 'Arquitectura Híbrida Sinergica'}
                  </h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    {decisionResult.summaryReason}
                  </p>
                </div>
              </div>
            </div>

            {/* Sliders Table */}
            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Ponderaciones de Criterios (Editables):</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {moduleState.decisionWeights.map(w => (
                  <div key={w.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-slate-900 text-xs">{w.dimensionName}</h4>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          Peso: {w.userWeight} / 5
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{w.description}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            disabled={!canEdit}
                            onClick={() => {
                              if (canEdit) {
                                setEditingWeight(w);
                                setTempWeightVal(star);
                              }
                            }}
                            className={`w-6 h-6 rounded text-xs font-bold transition-all ${
                              star <= w.userWeight
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title={`Asignar peso ${star}`}
                          >
                            {star}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        IP: {w.insightFitScore}% | PBI: {w.powerBiFitScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 9: MADUREZ TECNOLÓGICA & GOBERNANZA */}
      {activeSubTab === 'madurez_tecnologica' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Alineación de Fases y Madurez Empresarial
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              Conexión de IA vs. Power BI con Fases 3, 4 y 5
            </h2>
            <p className="text-slate-600 text-sm mt-1.5 max-w-4xl leading-relaxed">
              El análisis comparativo no existe de forma aislada; se fundamenta en los módulos de Gobernanza de IA, Estrategia de IA y Viabilidad del Negocio ya implementados en la plataforma.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              
              {/* Gobernanza */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold mb-3">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Gobernanza de IA (Fase 3)</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {moduleState.academicConclusion.maturityAlignment.governanceConnection}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-emerald-800 font-semibold">
                  Alineado con ISO 42001 & HITL
                </div>
              </div>

              {/* Estrategia */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold mb-3">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Estrategia de IA (Fase 4)</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {moduleState.academicConclusion.maturityAlignment.strategyConnection}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-indigo-800 font-semibold">
                  Mapa de Casos de Uso y ROI
                </div>
              </div>

              {/* Viabilidad */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold mb-3">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Viabilidad del Negocio (Fase 5)</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {moduleState.academicConclusion.maturityAlignment.viabilityConnection}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-purple-800 font-semibold">
                  SaaS Sostenible & Monetización
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 10: CONCLUSIÓN ACADÉMICA */}
      {activeSubTab === 'conclusion_academica' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                Tesis Académica & Síntesis Técnica Defendible
              </span>
              {canEdit && (
                <button
                  onClick={() => setIsEditingConclusion(true)}
                  className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar Conclusión
                </button>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Conclusión Académica: Dualidad y Complementariedad Tecnológica
            </h2>

            <div className="mt-6 space-y-5 text-sm text-slate-700 leading-relaxed">
              <div className="p-4 bg-indigo-50/60 border-l-4 border-indigo-600 rounded-r-xl">
                <h3 className="font-bold text-indigo-950 text-xs uppercase tracking-wider mb-1">Tesis Principal:</h3>
                <p className="font-medium text-slate-800">
                  "{moduleState.academicConclusion.academicThesis}"
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-base">Síntesis Técnica:</h3>
                <p className="text-slate-600 text-xs sm:text-sm">
                  {moduleState.academicConclusion.technicalSynthesis}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-900 text-base">Recomendación Estratégica:</h3>
                <p className="text-slate-600 text-xs sm:text-sm">
                  {moduleState.academicConclusion.recommendationSummary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>Versión: <strong>{moduleState.academicConclusion.version}</strong></span>
                <span>Última Actualización: {new Date(moduleState.academicConclusion.lastUpdated).toLocaleDateString()}</span>
                <span>Autor: {moduleState.academicConclusion.authorUser}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 11: TRAZABILIDAD & AUDITORÍA */}
      {activeSubTab === 'trazabilidad_auditoria' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
              Registro Inmutable de Modificaciones
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
              Auditoría y Trazabilidad del Análisis Comparativo
            </h2>
            <p className="text-slate-600 text-sm mt-1.5 max-w-4xl leading-relaxed">
              Cualquier cambio en los pesos de la matriz de decisión o en las conclusiones académicas queda registrado con usuario responsable, fecha/hora y justificación.
            </p>

            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold">
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Usuario</th>
                    <th className="py-3 px-4">Rol</th>
                    <th className="py-3 px-4">Campo Modificado</th>
                    <th className="py-3 px-4">Cambio</th>
                    <th className="py-3 px-4">Justificación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {moduleState.auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No hay modificaciones registradas aún. Los valores actuales corresponden a la línea base certificada.
                      </td>
                    </tr>
                  ) : (
                    moduleState.auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">{log.user}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {log.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-indigo-700 font-medium">{log.fieldChanged}</td>
                        <td className="py-3 px-4 font-mono text-[11px]">
                          <span className="text-red-600">{log.previousValue}</span> → <span className="text-emerald-600 font-bold">{log.newValue}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 italic">{log.justification}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT WEIGHT */}
      {editingWeight && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Ajustar Ponderación de Criterio
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {editingWeight.dimensionName}
            </p>

            <form onSubmit={handleSaveWeight} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nivel de Importancia para la Empresa (1 a 5):
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(v => (
                    <button
                      type="button"
                      key={v}
                      onClick={() => setTempWeightVal(v)}
                      className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${
                        tempWeightVal === v
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Justificación del Cambio (Auditoría Obligatoria):
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explique el motivo estratégico o técnico de este cambio de peso..."
                  value={weightJustification}
                  onChange={e => setWeightJustification(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingWeight(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Guardar y Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CONCLUSION */}
      {isEditingConclusion && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-2xl w-full p-6 shadow-2xl animate-scaleUp">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Editar Conclusión Académica & Tesis
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Modifique los fundamentos teóricos del análisis para adecuarlos a su contexto de auditoría.
            </p>

            <form onSubmit={handleSaveConclusion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tesis Principal:
                </label>
                <textarea
                  rows={2}
                  required
                  value={thesisDraft}
                  onChange={e => setThesisDraft(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Síntesis Técnica:
                </label>
                <textarea
                  rows={4}
                  required
                  value={synthesisDraft}
                  onChange={e => setSynthesisDraft(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Justificación de la Modificación:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Motivo de la actualización..."
                  value={conclusionJustification}
                  onChange={e => setConclusionJustification(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditingConclusion(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                >
                  Guardar Conclusión
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
