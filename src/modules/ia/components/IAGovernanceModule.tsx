import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  UserCheck, 
  Lock, 
  Eye, 
  FileText, 
  Sliders, 
  Activity, 
  Database, 
  HelpCircle, 
  Scale, 
  ShieldAlert, 
  Clock, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Info,
  Check,
  X,
  PlayCircle
} from 'lucide-react';
import { useEmpresa } from '../../configuracion/useEmpresa';
import { IAGovernanceService } from '../services/iaGovernanceService';
import { 
  IAPrinciple, 
  IAUseScope, 
  IAModelRegistryItem, 
  IARiskMatrixItem, 
  IARecommendationAuditLog,
  IAGovernanceSummary 
} from '../types/iaGovernance.types';

export default function IAGovernanceModule() {
  const { config, activeCompanyId } = useEmpresa();
  const companyName = config.nombreEmpresa || 'Mi Empresa';

  const [activeTab, setActiveTab] = useState<
    'resumen' | 'principios' | 'usos' | 'modelos' | 'riesgos' | 'trazabilidad' | 'roles' | 'privacidad'
  >('resumen');

  const [principles, setPrinciples] = useState<IAPrinciple[]>([]);
  const [scopes, setScopes] = useState<IAUseScope[]>([]);
  const [models, setModels] = useState<IAModelRegistryItem[]>([]);
  const [risks, setRisks] = useState<IARiskMatrixItem[]>([]);
  const [logs, setLogs] = useState<IARecommendationAuditLog[]>([]);
  const [summary, setSummary] = useState<IAGovernanceSummary | null>(null);

  // Estados para modal o edición de revisión humana
  const [selectedLog, setSelectedLog] = useState<IARecommendationAuditLog | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'Validada' | 'Rechazada' | 'Implementada'>('Validada');
  const [reviewObservations, setReviewObservations] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>(config.responsableInforme || 'Responsable SG-SST');
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  const loadData = () => {
    setPrinciples(IAGovernanceService.getPrinciples());
    setScopes(IAGovernanceService.getUsageScopes());
    setModels(IAGovernanceService.getModelRegistry());
    setRisks(IAGovernanceService.getRiskMatrix());
    const auditLogs = IAGovernanceService.getAuditLogs(activeCompanyId);
    setLogs(auditLogs);
    setSummary(IAGovernanceService.getGovernanceSummary(activeCompanyId));
  };

  useEffect(() => {
    loadData();
  }, [activeCompanyId]);

  const handleSaveReview = () => {
    if (!selectedLog) return;
    IAGovernanceService.updateAuditLogStatus(
      selectedLog.id,
      reviewStatus,
      reviewerName,
      'Líder SG-SST / Talento Humano',
      reviewObservations
    );
    setIsReviewing(false);
    setSelectedLog(null);
    setReviewObservations('');
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in text-left">
      
      {/* 1. Cabezote Ejecutivo del Módulo */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span>Marco Ético & Normativo SG-SST</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2.5">
              Gobernanza de Inteligencia Artificial
            </h1>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed max-w-2xl">
              Lineamientos de uso ético, supervisión humana obligatoria (Human-in-the-loop), minimización de datos sensibles y control auditable de recomendaciones de IA para <strong className="text-cyan-300 font-black">{companyName}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <div className="bg-slate-950/60 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-black text-slate-400 block">IA Responsable</span>
                <span className="text-xs font-black text-emerald-400">100% Conforme</span>
              </div>
            </div>
          </div>
        </div>

        {/* Advertencia Mandatoria de Supervisión Humana */}
        <div className="mt-5 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-start gap-3 text-amber-200 text-xs">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="font-bold leading-relaxed">
            <strong className="text-amber-300 uppercase tracking-wide">Directriz Mandatoria:</strong> Las recomendaciones generadas por IA constituyen <u>apoyo analítico consultivo</u> y requieren validación humana formal antes de la toma de decisiones laborales, operativas o de salud ocupacional.
          </p>
        </div>
      </div>

      {/* 2. Sub-navegación de Gobernanza */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/60 shadow-2xs flex gap-1.5 overflow-x-auto">
        {[
          { id: 'resumen', label: 'Panel Resumen', icon: Activity },
          { id: 'principios', label: '10 Principios Éticos', icon: Scale },
          { id: 'usos', label: 'Usos Permitidos y No Permitidos', icon: ShieldAlert },
          { id: 'modelos', label: 'Inventario de Modelos', icon: Database },
          { id: 'riesgos', label: 'Matriz de Riesgos IA', icon: AlertTriangle },
          { id: 'trazabilidad', label: 'Historial de Auditoría', icon: FileText },
          { id: 'privacidad', label: 'Privacidad & Minimización', icon: Lock },
          { id: 'roles', label: 'Roles & Responsabilidades', icon: UserCheck }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. VISTAS SEGÚN SUB-TAB */}

      {/* SUB-TAB 1: PANEL RESUMEN EJECUTIVO */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Métricas KPI de Gobernanza Reales */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Modelos Registrados</span>
              <p className="text-2xl font-black text-slate-900 font-display">
                {summary ? summary.registeredModelsCount : 0}
              </p>
              <span className="text-[9px] text-emerald-600 font-bold">Verificados en Código</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Funciones IA Activas</span>
              <p className="text-2xl font-black text-indigo-600 font-display">
                {summary ? summary.activeAIFunctionsCount : 0}
              </p>
              <span className="text-[9px] text-slate-500 font-bold">Diagnóstico & Copilot</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Rec. Pendientes</span>
              <p className="text-2xl font-black text-amber-500 font-display">
                {summary ? summary.pendingRecommendationsCount : 0}
              </p>
              <span className="text-[9px] text-amber-600 font-bold">Revisión Humana Requerida</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Rec. Validadas</span>
              <p className="text-2xl font-black text-emerald-600 font-display">
                {summary ? summary.validatedRecommendationsCount : 0}
              </p>
              <span className="text-[9px] text-emerald-600 font-bold">Aprobadas por Especialista</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Riesgos Controlados</span>
              <p className="text-2xl font-black text-cyan-600 font-display">
                {summary ? summary.mitigatedRisksCount : 0}/{summary ? summary.mitigatedRisksCount + summary.openRisksCount : 0}
              </p>
              <span className="text-[9px] text-cyan-600 font-bold">Matriz Metodológica</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Salud de Gobernanza</span>
              <p className="text-2xl font-black text-indigo-600 font-display">
                {summary ? summary.complianceHealthScore : 100}%
              </p>
              <span className="text-[9px] text-indigo-600 font-bold">Índice de Madurez Ética</span>
            </div>
          </div>

          {/* Diagrama de Flujo Canónico: Human-in-the-loop */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm font-display">
                  Flujo de Arquitectura y Supervisión Humana (Human-in-the-Loop)
                </h3>
                <p className="text-xs text-slate-500 font-medium">Secuencia estricta de procesamiento y aprobación de información analítica.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-2 pt-2">
              {[
                { step: '1. Datos Origen', desc: 'Encuesta sociodemográfica o nómina bruta', role: 'Ingesta', color: 'bg-slate-100 text-slate-800' },
                { step: '2. Data Quality', desc: 'Validación de 17 dimensiones y normalización', role: 'Auditoría', color: 'bg-indigo-50 text-indigo-900 border border-indigo-200' },
                { step: '3. Indicator Engine', desc: 'Cálculo matemático determinista de KPIs', role: 'Matemático', color: 'bg-indigo-100 text-indigo-950 border border-indigo-300' },
                { step: '4. Análisis IA', desc: 'Minimización de datos e inferencia de patrones', role: 'Consultivo', color: 'bg-cyan-50 text-cyan-900 border border-cyan-200' },
                { step: '5. Revisión Humana', desc: 'Validación por Especialista SG-SST / COPASST', role: 'Humano', color: 'bg-amber-50 text-amber-900 border border-amber-300' },
                { step: '6. Decisión & Acción', desc: 'Aprobación e incorporación al Plan Anual', role: 'Dirección', color: 'bg-emerald-50 text-emerald-900 border border-emerald-300' }
              ].map((item, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl ${item.color} space-y-1 text-center relative`}>
                  <span className="text-[9px] uppercase font-black tracking-wider opacity-70 block">{item.role}</span>
                  <p className="text-xs font-black">{item.step}</p>
                  <p className="text-[10px] opacity-80 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de Principios Clave */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-3xl border border-indigo-800/60 shadow-md space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>IA como Sistema de Apoyo a la Decisión</span>
              </div>
              <h4 className="text-lg font-black font-display tracking-tight">Autoridad Final Exclusivamente Humana</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Ninguna funcionalidad de IA dentro de Insight People IA posee privilegios de ejecución autónoma sobre la relación laboral, el régimen disciplinario, la aptitud médica o la continuidad de los contratos. La IA sintetiza, agrupa y contextualiza; el profesional decide.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Privacidad y Minimización por Diseño</span>
              </div>
              <h4 className="text-lg font-black text-slate-900 font-display tracking-tight">Protección de Datos Sensibles de Salud</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Las variables médicas, osteomusculares y psicosociales son tratadas bajo anonimización poblacional agregada. Los identificadores directos (cédula, nombres, teléfonos) son filtrados previamente para impedir su transferencia a modelos de lenguaje externos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: 10 PRINCIPIOS DE GOBERNANZA */}
      {activeTab === 'principios' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs">
            <h3 className="font-black text-slate-900 text-base font-display mb-1">
              Decálogo de Principios de IA Responsable para SG-SST
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-6">
              Marco de referencia ético-empresarial aplicable a todos los módulos analíticos y asistenciales de Insight People IA.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {principles.map(p => (
                <div key={p.id} className="p-4 rounded-2xl border border-slate-250/60 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 font-display">{p.name}</h4>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      p.category === 'Seguridad' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      p.category === 'Operativa' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {p.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-semibold leading-snug">{p.shortDescription}</p>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-600 leading-snug">
                    <strong className="text-slate-900">Aplicación Empresarial:</strong> {p.businessImplication}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: USOS PERMITIDOS Y NO PERMITIDOS */}
      {activeTab === 'usos' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* USOS PERMITIDOS */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-emerald-100 pb-4">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm font-display">
                  Usos Permitidos de Inteligencia Artificial
                </h3>
                <p className="text-xs text-emerald-700 font-semibold">Casos de uso autorizados como soporte analítico y consultivo.</p>
              </div>
            </div>

            <div className="space-y-3">
              {scopes.filter(s => s.type === 'PERMITIDO').map(s => (
                <div key={s.id} className="p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-100/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900">{s.title}</h4>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      Riesgo: {s.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{s.description}</p>
                  <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-emerald-100/60">
                    <span><strong>Justificación:</strong> {s.justification}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* USOS NO PERMITIDOS (LÍMITES INFRANQUEABLES) */}
          <div className="bg-white p-6 rounded-3xl border border-rose-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-rose-100 pb-4">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm font-display">
                  Usos NO Permitidos (Límites Infranqueables)
                </h3>
                <p className="text-xs text-rose-700 font-semibold">Prohibiciones absolutas para salvaguardar derechos laborales y de salud.</p>
              </div>
            </div>

            <div className="space-y-3">
              {scopes.filter(s => s.type === 'NO_PERMITIDO').map(s => (
                <div key={s.id} className="p-3.5 bg-rose-50/40 rounded-2xl border border-rose-100/80 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-rose-950">{s.title}</h4>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-rose-200 text-rose-900 rounded-md">
                      {s.riskLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">{s.description}</p>
                  <div className="text-[10px] text-rose-800/80 flex justify-between pt-1 border-t border-rose-100/60">
                    <span><strong>Motivo:</strong> {s.justification}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: INVENTARIO DE MODELOS DE IA */}
      {activeTab === 'modelos' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">
                Inventario Verificado de Modelos y Motores de IA
              </h3>
              <p className="text-xs text-slate-500 font-medium">Registro formal de componentes computacionales y algoritmos activos en la arquitectura.</p>
            </div>
            <span className="text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
              {models.length} Modelos Operativos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[9px] font-black border-y border-slate-200">
                  <th className="p-3">Nombre del Modelo</th>
                  <th className="p-3">Proveedor / Motor</th>
                  <th className="p-3">Versión</th>
                  <th className="p-3">Propósito & Datos</th>
                  <th className="p-3">Riesgo</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">Verificación Código</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {models.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-extrabold text-slate-900">{m.name}</td>
                    <td className="p-3 font-semibold text-slate-700">{m.provider}</td>
                    <td className="p-3 font-mono font-bold text-indigo-600">{m.version}</td>
                    <td className="p-3 text-slate-600 max-w-xs leading-snug">
                      <p className="font-bold text-slate-800">{m.purpose}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5"><strong>Datos:</strong> {m.dataProcessed}</p>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        m.riskLevel === 'Alto' ? 'bg-rose-100 text-rose-800' :
                        m.riskLevel === 'Medio' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {m.riskLevel}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-bold text-[10px]">
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-500 truncate max-w-[150px]" title={m.sourceVerification}>
                      {m.sourceVerification}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: MATRIZ DE RIESGOS DE IA */}
      {activeTab === 'riesgos' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base font-display">
              Matriz Metodológica de Riesgos de Inteligencia Artificial
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Controles preventivos y mitigaciones técnicas frente a riesgos algorítmicos. <em>(Referencia metodológica corporativa)</em>.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[9px] font-black border-y border-slate-200">
                  <th className="p-3">Riesgo Metodológico</th>
                  <th className="p-3">Descripción</th>
                  <th className="p-3">Prob. / Impacto</th>
                  <th className="p-3">Nivel</th>
                  <th className="p-3">Control Mitigante</th>
                  <th className="p-3">Responsable</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {risks.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-black text-slate-900">{r.risk}</td>
                    <td className="p-3 text-slate-600 max-w-xs leading-snug">{r.description}</td>
                    <td className="p-3 font-semibold text-slate-700 whitespace-nowrap">
                      {r.probability} / {r.impact}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                        r.level === 'Crítico' || r.level === 'Alto' ? 'bg-rose-100 text-rose-800' :
                        r.level === 'Medio' ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {r.level}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 max-w-sm font-medium leading-snug">{r.control}</td>
                    <td className="p-3 text-slate-600 whitespace-nowrap font-bold">{r.responsible}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md font-bold text-[10px]">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: HISTORIAL DE AUDITORÍA Y TRAZABILIDAD */}
      {activeTab === 'trazabilidad' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">
                Registro de Trazabilidad y Dictámenes de Validación Humana
              </h3>
              <p className="text-xs text-slate-500 font-medium">Auditoría inmutable de interacciones relevantes de IA y decisiones humanas adoptadas.</p>
            </div>
            <button
              onClick={() => {
                // Registrar un evento de prueba representativo si está vacío
                IAGovernanceService.addAuditLog({
                  companyId: activeCompanyId,
                  userId: 'user_sg_sst_001',
                  userName: config.responsableInforme || 'Responsable SG-SST',
                  userRole: 'Responsable SG-SST',
                  iaFunction: 'Diagnóstico Sociodemográfico & Plan de Intervención',
                  analysisType: 'Cálculo de Focos de Atención Poblacional',
                  dataSource: 'Encuesta Sociodemográfica 482 Colaboradores',
                  modelVersion: 'AIEngine v3.2 + Prompt38 Engine',
                  confidenceScore: 0.96,
                  generatedOutputSummary: 'Se identificó prevalencia osteomuscular y se recomendó programa de pausas activas dirigidas.',
                  humanReviewStatus: 'Pendiente de revisión',
                  dataMinimizationApplied: true,
                  containsSensitiveData: false
                });
                loadData();
              }}
              className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-black transition-all cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-center"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Registrar Evento de Auditoría</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-black text-slate-700">Sin registros de gobernanza de IA.</p>
              <p className="text-xs text-slate-400">Los eventos se generarán automáticamente cuando interactúes con el Asistente IA o generes diagnósticos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase text-[9px] font-black border-y border-slate-200">
                    <th className="p-3">Fecha / Hora</th>
                    <th className="p-3">Usuario & Rol</th>
                    <th className="p-3">Función IA</th>
                    <th className="p-3">Fuente de Datos</th>
                    <th className="p-3">Resumen Salida IA</th>
                    <th className="p-3">Estado Revisión</th>
                    <th className="p-3">Acción Humana</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-mono text-[10px] text-slate-600 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('es-CO')}
                      </td>
                      <td className="p-3">
                        <p className="font-extrabold text-slate-900">{log.userName}</p>
                        <p className="text-[10px] text-slate-500 font-bold">{log.userRole}</p>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{log.iaFunction}</td>
                      <td className="p-3 text-slate-600">{log.dataSource}</td>
                      <td className="p-3 text-slate-700 max-w-xs leading-snug">{log.generatedOutputSummary}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase inline-block ${
                          log.humanReviewStatus === 'Validada' || log.humanReviewStatus === 'Implementada' ? 'bg-emerald-100 text-emerald-800' :
                          log.humanReviewStatus === 'Rechazada' ? 'bg-rose-100 text-rose-800' :
                          'bg-amber-100 text-amber-800 animate-pulse'
                        }`}>
                          {log.humanReviewStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedLog(log);
                            setReviewStatus(log.humanReviewStatus === 'Pendiente de revisión' ? 'Validada' : log.humanReviewStatus as any);
                            setReviewObservations(log.humanObservations || '');
                            setIsReviewing(true);
                          }}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-black transition-all cursor-pointer whitespace-nowrap"
                        >
                          Revisar Dictamen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 7: PRIVACIDAD Y PROTECCIÓN DE DATOS SENSIBLES */}
      {activeTab === 'privacidad' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-extrabold text-slate-900 text-base font-display">
              Protocolo de Privacidad y Minimización de Datos
            </h3>
            <p className="text-xs text-slate-500 font-medium">Reglas de seguridad y exclusión aplicadas antes de cualquier consumo analítico de IA.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/80 space-y-2">
              <div className="flex items-center gap-2 text-rose-800 font-black text-xs uppercase">
                <XCircle className="w-4 h-4 text-rose-600" />
                <span>Datos Estrictamente Excluidos</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside font-medium">
                <li>Número de Cédula / Identificación</li>
                <li>Nombres y Apellidos de Colaboradores</li>
                <li>Teléfonos y Correos Electrónicos</li>
                <li>Dirección de Residencia</li>
                <li>Diagnósticos Médicos Individuales</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
              <div className="flex items-center gap-2 text-indigo-800 font-black text-xs uppercase">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Datos Agregados Permitidos</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside font-medium">
                <li>Porcentajes poblacionales por área o sede</li>
                <li>Promedios de edad y antigüedad laboral</li>
                <li>Distribución consolidada de IMC (OMS)</li>
                <li>Tasas globales de ausentismo</li>
                <li>Puntajes consolidados de clima laboral</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Garantías de Cumplimiento</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside font-medium">
                <li>Conformidad Ley 1581 de 2012 (Habeas Data)</li>
                <li>Resolución 0312 de 2019 SG-SST</li>
                <li>Cero persistencia de prompts en servidores externos</li>
                <li>Sanitización automática antes de envíos</li>
                <li>Auditoría y trazabilidad completa</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 8: ROLES Y RESPONSABILIDADES EN GOBERNANZA */}
      {activeTab === 'roles' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base font-display">
              Matriz RACI de Roles y Responsabilidades frente a la IA
            </h3>
            <p className="text-xs text-slate-500 font-medium">Articulado directamente con el sistema de control de accesos basado en roles (RBAC) de la plataforma.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                role: 'Administrador de Plataforma',
                desc: 'Control total de configuración, activación de modelos, auditoría técnica y gestión de accesos.',
                perms: ['Configurar Modelos', 'Auditar Logs', 'Gestionar RBAC', 'Ver Gobernanza']
              },
              {
                role: 'Responsable de SG-SST',
                desc: 'Revisión y validación obligatoria de diagnósticos de salud y planes de intervención.',
                perms: ['Generar Análisis IA', 'Validar Recomendaciones', 'Aprobar Planes de Acción']
              },
              {
                role: 'Líder de Talento Humano',
                desc: 'Supervisión de hallazgos de clima, rotación y programas de bienestar sin decisiones autónomas.',
                perms: ['Consultar Diagnósticos', 'Validar Acciones de Clima', 'Supervisar Focos']
              },
              {
                role: 'Analista de Datos / SST',
                desc: 'Ingesta de bases de datos, ejecución de Data Quality y generación de indicadores.',
                perms: ['Cargar Archivos', 'Validar Cobertura', 'Consultar Indicadores']
              },
              {
                role: 'Usuario Consultor / Auditor',
                desc: 'Acceso de solo lectura para veeduría y verificación de cumplimiento normativo.',
                perms: ['Lectura de Informes', 'Ver Principios de IA', 'Ver Ficha Técnica']
              }
            ].map((r, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                <h4 className="text-xs font-black text-slate-900">{r.role}</h4>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{r.desc}</p>
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-[9px] font-black uppercase text-slate-400 block mb-1">Permisos Clave:</span>
                  <div className="flex flex-wrap gap-1">
                    {r.perms.map((p, pIdx) => (
                      <span key={pIdx} className="px-2 py-0.5 bg-white text-indigo-700 border border-indigo-200 rounded text-[9px] font-bold">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL DE REVISIÓN Y DICTAMEN HUMANO */}
      {isReviewing && selectedLog && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white max-w-lg w-full rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm font-display">
                    Dictamen de Supervisión Humana
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium">ID: {selectedLog.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsReviewing(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[9px] uppercase font-black text-slate-500 block">Salida Generada por IA:</span>
                <p className="text-slate-800 font-medium mt-1">{selectedLog.generatedOutputSummary}</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-600">Estado de Dictamen:</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Validada', 'Rechazada', 'Implementada'] as const).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReviewStatus(st)}
                      className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                        reviewStatus === st
                          ? st === 'Validada' || st === 'Implementada' ? 'bg-emerald-600 text-white font-black' : 'bg-rose-600 text-white font-black'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-600">Nombre del Revisor Humano:</label>
                <input 
                  type="text" 
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-600">Observaciones y Justificación Técnica:</label>
                <textarea
                  rows={3}
                  value={reviewObservations}
                  onChange={(e) => setReviewObservations(e.target.value)}
                  placeholder="Ingrese los motivos de la validación o rechazo del dictamen de IA..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsReviewing(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
              >
                Registrar Dictamen
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
