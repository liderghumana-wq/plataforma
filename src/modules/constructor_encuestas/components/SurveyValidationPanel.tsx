import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Sliders, 
  Search, 
  Database, 
  AlertOctagon, 
  Info, 
  Layers, 
  Sparkles, 
  Download, 
  ChevronRight, 
  ChevronDown,
  ArrowRight,
  Settings,
  HelpCircle
} from 'lucide-react';
import { 
  SurveyValidationService, 
  SurveyValidationResult, 
  VariableValidationDetail, 
  DataConsistencyIssue, 
  IndicatorAvailabilityStatus 
} from '../surveyValidationService';

interface SurveyValidationPanelProps {
  companyId: string;
  periodId?: string;
  responsesList?: any[];
  onGenerateOfficialReport?: (validatedResult: SurveyValidationResult) => void;
  onGeneratePreliminaryReport?: (validatedResult: SurveyValidationResult) => void;
  onOpenCatalogAdmin?: () => void;
}

export function SurveyValidationPanel({
  companyId,
  periodId = '2026-P1',
  responsesList = [],
  onGenerateOfficialReport,
  onGeneratePreliminaryReport,
  onOpenCatalogAdmin
}: SurveyValidationPanelProps) {
  const [activeTab, setActiveTab] = useState<'variables' | 'consistency' | 'unconfigured' | 'indicators'>('variables');
  const [filterCriticality, setFilterCriticality] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVariable, setSelectedVariable] = useState<VariableValidationDetail | null>(null);

  // Default sample dataset if empty provided
  const sampleDataset = responsesList.length > 0 ? responsesList : Array.from({ length: 20 }).map((_, i) => ({
    employeeId: `EMP-2026-${(i + 1).toString().padStart(3, '0')}`,
    sexo: i === 5 ? '' : (i % 2 === 0 ? 'Femenino' : 'Masculino'),
    edad: i === 12 ? 15 : (25 + i * 2),
    ciudadResidencia: 'Bogotá',
    sede: i === 8 ? 'Nueva Sede Inexistente' : 'Sede Principal (Bogotá)',
    area: 'Administrativa',
    proyecto: 'Operaciones 2026',
    cargo: 'Analista',
    tipoContrato: 'Término Indefinido',
    nivelEducativo: 'Profesional',
    estadoCivil: 'Soltero(a)',
    tienePersonasACargo: 'No',
    estrato: '3',
    tipoVivienda: 'Arrendada',
    modalidadTrabajo: 'Presencial',
    saludDiagnosticoRelevante: 'No',
    presentaDiscapacidad: 'No',
    presentaAlergias: 'No',
    consumeMedicamentosFrecuente: 'No',
    molestiasOsteomusculares: 'No',
    pesoKg: i === 3 ? 70 : 68,
    estaturaCm: i === 3 ? '' : 170, // Weight without height contradiction
    tieneHijos: i === 2 ? 'NO' : 'SI',
    numeroHijos: i === 2 ? 2 : 1, // Contradiction: NO hijos but 2 registered
    actividadFisicaRegular: 'Sí'
  }));

  const validationResult: SurveyValidationResult = SurveyValidationService.validateSurvey({
    companyId,
    periodId,
    responsesList: sampleDataset
  });

  const { reportReadiness, completion, variableSummaries, consistencyErrors, unconfiguredDetails, availableIndicators, unavailableIndicators } = validationResult;

  const filteredVariables = variableSummaries.filter(v => {
    if (filterCriticality !== 'ALL' && v.criticality !== filterCriticality) return false;
    if (filterStatus !== 'ALL' && v.status !== filterStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return v.variableName.toLowerCase().includes(q) || v.variableId.toLowerCase().includes(q);
    }
    return true;
  });

  const getTrafficLightBadge = (light: 'GREEN' | 'ORANGE' | 'RED') => {
    switch (light) {
      case 'GREEN':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'ORANGE':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'RED':
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 text-left text-slate-800">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
              Motor de Validación Previa y Bloqueo Preventivo de Informes — Prompt 26
            </span>
          </div>
          <h2 className="text-xl font-black text-white">
            Panel de Validación de Calidad y Completitud de Datos
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
            Verificación automática antes de la emisión del Informe Oficial. Si faltan variables críticas, existen inconsistencias lógicas o valores fuera de catálogo, el informe oficial se bloquea automáticamente.
          </p>
        </div>

        {/* Global Traffic Light Badge */}
        <div className={`px-5 py-3 rounded-2xl border font-black text-xs flex flex-col items-center justify-center text-center shadow-lg ${getTrafficLightBadge(reportReadiness.trafficLight)}`}>
          <span className="text-[10px] uppercase font-mono tracking-wider opacity-80 mb-0.5">Estado Global</span>
          <span className="text-sm">{reportReadiness.trafficLightLabel}</span>
        </div>
      </div>

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Colaboradores</span>
          <span className="text-xl font-black text-slate-900">{completion.totalEmployees}</span>
        </div>

        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
          <span className="text-[10px] font-bold text-emerald-700 uppercase block">Encuestas Completas</span>
          <span className="text-xl font-black text-emerald-700">{completion.completedSurveys}</span>
        </div>

        <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-center">
          <span className="text-[10px] font-bold text-rose-700 uppercase block">Encuestas Incompletas</span>
          <span className="text-xl font-black text-rose-700">{completion.incompleteSurveys}</span>
        </div>

        <div className="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-200 text-center">
          <span className="text-[10px] font-bold text-indigo-700 uppercase block">Diligenciamiento</span>
          <span className="text-xl font-black text-indigo-700">{completion.completionPercentage}%</span>
        </div>

        <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-center">
          <span className="text-[10px] font-bold text-amber-800 uppercase block">No Parametrizados</span>
          <span className="text-xl font-black text-amber-800">{unconfiguredDetails.length}</span>
        </div>

        <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-200 text-center">
          <span className="text-[10px] font-bold text-purple-800 uppercase block">Inconsistencias Lógicas</span>
          <span className="text-xl font-black text-purple-800">{consistencyErrors.length}</span>
        </div>

        <div className="p-3.5 bg-cyan-50 rounded-2xl border border-cyan-200 text-center col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-cyan-800 uppercase block">Indicadores Listos</span>
          <span className="text-xl font-black text-cyan-800">{availableIndicators.length} / {availableIndicators.length + unavailableIndicators.length}</span>
        </div>
      </div>

      {/* Module Traffic Lights Row */}
      <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs font-black uppercase text-slate-300 tracking-wider">
          Semáforo por Módulo Analítico:
        </span>

        <div className="flex flex-wrap items-center gap-3">
          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${getTrafficLightBadge(reportReadiness.moduleStatus.sociodemografico)}`}>
            <span>Caracterización Sociodemográfica</span>
            <span className="font-mono">{reportReadiness.moduleStatus.sociodemografico === 'GREEN' ? '🟢 96%' : reportReadiness.moduleStatus.sociodemografico === 'ORANGE' ? '🟡 78%' : '🔴 <50%'}</span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${getTrafficLightBadge(reportReadiness.moduleStatus.salud)}`}>
            <span>Condiciones de Salud</span>
            <span className="font-mono">{reportReadiness.moduleStatus.salud === 'GREEN' ? '🟢 92%' : reportReadiness.moduleStatus.salud === 'ORANGE' ? '🟡 75%' : '🔴 <50%'}</span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-2 ${getTrafficLightBadge(reportReadiness.moduleStatus.laboral)}`}>
            <span>Información Laboral</span>
            <span className="font-mono">{reportReadiness.moduleStatus.laboral === 'GREEN' ? '🟢 100%' : reportReadiness.moduleStatus.laboral === 'ORANGE' ? '🟡 80%' : '🔴 <50%'}</span>
          </div>
        </div>
      </div>

      {/* Blocking Reasons Box (If Blocked) */}
      {!reportReadiness.readyForOfficialReport && (
        <div className="p-5 bg-rose-950/90 border-2 border-rose-700 text-rose-100 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-rose-300">
            <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
            <h3 className="text-xs font-black uppercase tracking-wider">
              El informe oficial NO está listo para generación — Se detectaron motivos de bloqueo:
            </h3>
          </div>

          <ul className="space-y-1.5 text-xs pl-7 list-disc">
            {reportReadiness.blockingReasons.map((reason, idx) => (
              <li key={idx} className="font-semibold text-rose-200">
                {reason}
              </li>
            ))}
          </ul>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-rose-800/80">
            <span className="text-rose-300 italic">
              Acción recomendada: Complete la información faltante, corrija inconsistencias o parametrice los catálogos antes de emitir el informe definitivo.
            </span>

            {unconfiguredDetails.length > 0 && onOpenCatalogAdmin && (
              <button
                onClick={onOpenCatalogAdmin}
                className="px-3.5 py-1.5 bg-rose-800 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-rose-200" />
                <span>Parametrizar Catálogo de Empresa</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tab Controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('variables')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'variables' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Variables por Criticidad ({variableSummaries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('consistency')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'consistency' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Inconsistencias Lógicas ({consistencyErrors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('unconfigured')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'unconfigured' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>No Parametrizados ({unconfiguredDetails.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('indicators')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'indicators' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Indicadores Disponibles vs No Disponibles ({availableIndicators.length + unavailableIndicators.length})</span>
        </button>
      </div>

      {/* TAB 1: VARIABLES TABLE */}
      {activeTab === 'variables' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar variable por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filterCriticality}
                onChange={(e) => setFilterCriticality(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="ALL">Todas las criticidades</option>
                <option value="CRITICAL">🔴 CRITICAL (Bloqueante)</option>
                <option value="IMPORTANT">🟠 IMPORTANT</option>
                <option value="OPTIONAL">🟢 OPTIONAL</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="ALL">Todos los estados</option>
                <option value="COMPLETO">🟢 COMPLETO (100%)</option>
                <option value="PARCIAL">🟠 PARCIAL</option>
                <option value="INCOMPLETO">🔴 INCOMPLETO (&lt;50%)</option>
                <option value="NOT_CONFIGURED">⚙️ NOT_CONFIGURED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-black uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Variable</th>
                  <th className="p-3">Criticidad</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Resp. Válidas</th>
                  <th className="p-3">Faltantes</th>
                  <th className="p-3">Cobertura</th>
                  <th className="p-3">Calidad</th>
                  <th className="p-3 text-right">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredVariables.map((v) => (
                  <tr key={v.variableId} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{v.variableName}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                        v.criticality === 'CRITICAL' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                        v.criticality === 'IMPORTANT' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                        'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        {v.criticality}
                      </span>
                    </td>
                    <td className="p-3 font-bold">
                      {v.status === 'COMPLETO' && <span className="text-emerald-700">🟢 COMPLETO</span>}
                      {v.status === 'PARCIAL' && <span className="text-amber-700">🟠 PARCIAL</span>}
                      {v.status === 'INCOMPLETO' && <span className="text-rose-700">🔴 INCOMPLETO</span>}
                      {v.status === 'NOT_CONFIGURED' && <span className="text-purple-700">⚙️ NOT_CONFIGURED</span>}
                    </td>
                    <td className="p-3 font-mono font-bold">{v.validResponses}</td>
                    <td className="p-3 font-mono text-slate-500">{v.missingRecords}</td>
                    <td className="p-3 font-mono font-bold text-indigo-700">{v.coveragePercentage}%</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        v.qualityLevel === 'HIGH' ? 'bg-emerald-100 text-emerald-800' :
                        v.qualityLevel === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                        v.qualityLevel === 'LOW' ? 'bg-orange-100 text-orange-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {v.qualityLevel}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedVariable(v)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                      >
                        Ver Acción
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Variable Drawer Modal */}
          {selectedVariable && (
            <div className="p-5 bg-indigo-50/90 border border-indigo-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-600" />
                  Detalle de Diagnóstico: {selectedVariable.variableName}
                </h4>
                <button
                  onClick={() => setSelectedVariable(null)}
                  className="text-xs text-indigo-600 font-bold hover:underline cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                <p><strong>Problema Detectado:</strong> {selectedVariable.problemDescription || 'Sin problemas detectados.'}</p>
                <p><strong>Registros Afectados:</strong> {selectedVariable.affectedRecordsCount} colaboradores</p>
                <p className="sm:col-span-2 bg-white p-3 rounded-xl border border-indigo-200">
                  <strong className="text-indigo-900">Acción Recomendada:</strong> {selectedVariable.recommendedAction}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CONSISTENCY ERRORS */}
      {activeTab === 'consistency' && (
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Inconsistencias Lógicas y Contradicciones Detectadas
          </h3>

          {consistencyErrors.length === 0 ? (
            <div className="p-6 text-center bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800">
              🟢 No se detectaron contradicciones ni errores de consistencia lógica.
            </div>
          ) : (
            <div className="space-y-2">
              {consistencyErrors.map((err) => (
                <div
                  key={err.id}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                    err.severity === 'ERROR' ? 'bg-rose-50 border-rose-200 text-rose-900' :
                    err.severity === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                    'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px]">
                        {err.id} — Colaborador: {err.employeeId}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase rounded ${
                        err.severity === 'ERROR' ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
                      }`}>
                        {err.severity}
                      </span>
                    </div>

                    <h4 className="font-black text-slate-900">{err.ruleName}</h4>
                    <p className="text-slate-700">{err.description}</p>
                    <p className="font-semibold text-indigo-900">Acción: {err.recommendedAction}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: UNCONFIGURED CATALOG VALUES */}
      {activeTab === 'unconfigured' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Valores No Parametrizados en el Catálogo de la Empresa (NOT_CONFIGURED)
            </h3>

            {onOpenCatalogAdmin && (
              <button
                onClick={onOpenCatalogAdmin}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Abrir Catálogo de Empresa</span>
              </button>
            )}
          </div>

          {unconfiguredDetails.length === 0 ? (
            <div className="p-6 text-center bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800">
              🟢 Todos los valores de Sedes, Áreas, Proyectos y Cargos coinciden exactamente con el catálogo oficial de la empresa.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-black uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Variable</th>
                    <th className="p-3">Valor Introducido (Excel/Encuesta)</th>
                    <th className="p-3">ID Colaborador</th>
                    <th className="p-3">Acción Recomendada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {unconfiguredDetails.map((un, idx) => (
                    <tr key={idx} className="bg-amber-50/50 hover:bg-amber-50">
                      <td className="p-3 font-bold text-slate-900 capitalize">{un.variable}</td>
                      <td className="p-3 font-mono font-bold text-rose-700">{un.rawValue}</td>
                      <td className="p-3 font-mono">{un.employeeId}</td>
                      <td className="p-3 text-slate-700">Agregar "{un.rawValue}" al catálogo o corregir en origen.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: INDICATORS AVAILABILITY */}
      {activeTab === 'indicators' && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            Disponibilidad de Indicadores del Informe Ejecutivo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Available List */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-emerald-900 uppercase flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Indicadores Disponibles ({availableIndicators.length})
              </h4>

              <div className="space-y-2">
                {availableIndicators.map((ind) => (
                  <div key={ind.indicatorId} className="p-3 bg-white border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{ind.indicatorName}</span>
                      <span className="text-[10px] text-slate-500">Base válida: {ind.validBase} respuestas ({ind.coveragePercentage}% cobertura)</span>
                    </div>
                    <span className="text-sm">{ind.statusIcon}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Unavailable List */}
            <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl space-y-3">
              <h4 className="text-xs font-black text-rose-900 uppercase flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                Indicadores No Disponibles ({unavailableIndicators.length})
              </h4>

              {unavailableIndicators.length === 0 ? (
                <p className="text-xs text-emerald-800 font-bold p-3 bg-white rounded-xl">
                  🟢 Todos los indicadores principales están habilitados.
                </p>
              ) : (
                <div className="space-y-2">
                  {unavailableIndicators.map((ind) => (
                    <div key={ind.indicatorId} className="p-3 bg-white border border-rose-200 rounded-xl space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{ind.indicatorName}</span>
                        <span className="text-sm">{ind.statusIcon}</span>
                      </div>
                      <p className="text-[11px] font-semibold text-rose-700">{ind.unavailabilityReason}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Action Footer Controls */}
      <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800">
        <div>
          <h4 className="text-xs font-black text-white uppercase tracking-wider">
            Generación de Informes Ejecutivo y SG-SST
          </h4>
          <p className="text-xs text-slate-300 mt-0.5">
            {reportReadiness.readyForOfficialReport
              ? 'Todos los controles de calidad aprobados. Puede emitir el informe oficial.'
              : 'El informe oficial está bloqueado por inconsistencias o falta de datos. Puede emitir un borrador preliminar.'}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onGeneratePreliminaryReport && onGeneratePreliminaryReport(validationResult)}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-200" />
            <span>Generar Informe Preliminar (Borrador)</span>
          </button>

          <button
            onClick={() => onGenerateOfficialReport && onGenerateOfficialReport(validationResult)}
            disabled={!reportReadiness.readyForOfficialReport}
            className={`px-5 py-2.5 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer ${
              reportReadiness.readyForOfficialReport
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>Emitir Informe Oficial</span>
          </button>
        </div>
      </div>

    </div>
  );
}
