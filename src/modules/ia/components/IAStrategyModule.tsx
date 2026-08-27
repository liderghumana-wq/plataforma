import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sparkles, 
  Brain, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  Layers, 
  Activity, 
  CheckCircle, 
  Clock, 
  Compass, 
  AlertTriangle, 
  ArrowRight, 
  ChevronRight, 
  Database, 
  FileText, 
  Sliders, 
  Lock, 
  HelpCircle, 
  Cpu, 
  Check, 
  X, 
  Award,
  Zap,
  Briefcase,
  Share2,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useEmpresa } from '../../configuracion/useEmpresa';
import { IAStrategyService } from '../services/iaStrategyService';
import { 
  IAStrategicPillar, 
  IAUseCaseItem, 
  IAAutonomyLevel, 
  IAStakeholder, 
  IAMaturityAssessment, 
  IAStrategyMetrics,
  UseCaseStatus 
} from '../types/iaStrategy.types';

export default function IAStrategyModule() {
  const { config, activeCompanyId } = useEmpresa();
  const companyName = config.nombreEmpresa || 'Mi Empresa';

  const [activeTab, setActiveTab] = useState<
    'resumen' | 'proposito_flujo' | 'pilares' | 'casos_uso' | 'autonomia' | 'cadena_propuesta' | 'stakeholders' | 'madurez_roadmap'
  >('resumen');

  const [selectedCaseStatusFilter, setSelectedCaseStatusFilter] = useState<string>('TODOS');
  const [pillars, setPillars] = useState<IAStrategicPillar[]>([]);
  const [useCases, setUseCases] = useState<IAUseCaseItem[]>([]);
  const [autonomyLevels, setAutonomyLevels] = useState<IAAutonomyLevel[]>([]);
  const [stakeholders, setStakeholders] = useState<IAStakeholder[]>([]);
  const [maturity, setMaturity] = useState<IAMaturityAssessment | null>(null);
  const [metrics, setMetrics] = useState<IAStrategyMetrics | null>(null);

  useEffect(() => {
    setPillars(IAStrategyService.getStrategicPillars());
    setUseCases(IAStrategyService.getUseCases());
    setAutonomyLevels(IAStrategyService.getAutonomyLevels());
    setStakeholders(IAStrategyService.getStakeholders());
    setMaturity(IAStrategyService.getMaturityAssessment());
    setMetrics(IAStrategyService.getStrategyMetrics(activeCompanyId));
  }, [activeCompanyId]);

  const strategicPurpose = IAStrategyService.getStrategicPurpose();
  const valueChain = IAStrategyService.getValueChainData();
  const valueProp = IAStrategyService.getValueProposition();
  const roadmap = IAStrategyService.getAIRoadmap();
  const differentiators = IAStrategyService.getDifferentiators();

  const filteredUseCases = selectedCaseStatusFilter === 'TODOS'
    ? useCases
    : useCases.filter(u => u.status === selectedCaseStatusFilter);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in text-left">
      
      {/* 1. Cabezote Estratégico Principal */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[45%] h-full bg-cyan-500/10 rounded-full blur-[110px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-400/20">
              <Compass className="w-3.5 h-3.5 text-cyan-300" />
              <span>Visión Estratégica & Generación de Valor</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2.5">
              Estrategia de Inteligencia Artificial
            </h1>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed max-w-2xl">
              Marco de generación de valor estratégico, operativo y analítico mediante IA responsable para <strong className="text-cyan-300 font-black">{companyName}</strong>. Articula datos, indicadores matemáticos y juicio humano.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <div className="bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-black text-slate-400 block">Madurez de IA</span>
                <span className="text-xs font-black text-cyan-300">{maturity ? maturity.levelName : 'Nivel 3'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer Permanente Obligatorio: IA como Sistema de Apoyo */}
        <div className="mt-5 p-3.5 bg-indigo-950/60 border border-indigo-500/30 rounded-2xl flex items-start gap-3 text-indigo-200 text-xs">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div className="font-medium leading-relaxed">
            <strong className="text-cyan-300 font-bold uppercase tracking-wide">Principio Rector:</strong> Insight People IA <u>no toma decisiones laborales de manera autónoma</u>. La plataforma proporciona información, análisis y recomendaciones consultivas para apoyar la toma de decisiones humanas. La responsabilidad final permanece en el usuario autorizado.
          </div>
        </div>
      </div>

      {/* 2. Sub-navegación de la Estrategia */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/60 shadow-2xs flex gap-1.5 overflow-x-auto">
        {[
          { id: 'resumen', label: 'Resumen Ejecutivo', icon: Activity },
          { id: 'proposito_flujo', label: 'Propósito & Flujo', icon: Target },
          { id: 'pilares', label: '5 Pilares Estratégicos', icon: Layers },
          { id: 'casos_uso', label: 'Matriz de Casos de Uso', icon: Cpu },
          { id: 'autonomia', label: 'Niveles de Autonomía', icon: Sliders },
          { id: 'cadena_propuesta', label: 'Cadena & Propuesta de Valor', icon: TrendingUp },
          { id: 'stakeholders', label: 'Usuarios & Stakeholders', icon: Users },
          { id: 'madurez_roadmap', label: 'Madurez & Roadmap', icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
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

      {/* SUB-TAB 1: RESUMEN EJECUTIVO */}
      {activeTab === 'resumen' && (
        <div className="space-y-6">
          {/* Tarjetas KPI de la Estrategia */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Casos Totales</span>
              <p className="text-2xl font-black text-slate-900 font-display">
                {metrics ? metrics.totalUseCasesCount : 0}
              </p>
              <span className="text-[9px] text-slate-500 font-bold">Portafolio Estratégico</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Casos Implementados</span>
              <p className="text-2xl font-black text-emerald-600 font-display">
                {metrics ? metrics.implementedUseCasesCount : 0}
              </p>
              <span className="text-[9px] text-emerald-600 font-bold">100% Operativos</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block">En Desarrollo</span>
              <p className="text-2xl font-black text-indigo-600 font-display">
                {metrics ? metrics.inDevelopmentUseCasesCount : 0}
              </p>
              <span className="text-[9px] text-indigo-600 font-bold">En Ciclo Activo</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Casos Futuros</span>
              <p className="text-2xl font-black text-cyan-600 font-display">
                {metrics ? metrics.futureUseCasesCount : 0}
              </p>
              <span className="text-[9px] text-cyan-600 font-bold">Roadmap 2027</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Supervisión Humana</span>
              <p className="text-2xl font-black text-emerald-600 font-display">
                100%
              </p>
              <span className="text-[9px] text-emerald-600 font-bold">Human-in-the-loop</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <span className="text-[10px] uppercase font-black text-slate-400 block">Nivel de Madurez</span>
              <p className="text-2xl font-black text-slate-900 font-display">
                Nivel 3
              </p>
              <span className="text-[9px] text-indigo-600 font-bold">Controlada & Ética</span>
            </div>
          </div>

          {/* Declaración Central de Propósito Estratégico */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-md space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Propósito Central de la Inteligencia Artificial</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-white leading-snug">
              &ldquo;{strategicPurpose.statement}&rdquo;
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-cyan-300 font-black uppercase text-[10px] block">1. No Alucinación de Datos</span>
                <p className="text-slate-300 leading-relaxed font-medium">Los porcentajes e indicadores oficiales son calculados por el motor matemático determinista.</p>
              </div>
              <div className="space-y-1">
                <span className="text-emerald-300 font-black uppercase text-[10px] block">2. Rol Consultivo de Apoyo</span>
                <p className="text-slate-300 leading-relaxed font-medium">La IA interpreta correlaciones y redacta borradores de planes sin imponer decisiones.</p>
              </div>
              <div className="space-y-1">
                <span className="text-amber-300 font-black uppercase text-[10px] block">3. Decisión Humana Ineludible</span>
                <p className="text-slate-300 leading-relaxed font-medium">Toda intervención laboral o disciplinaria requiere validación expresa de los líderes.</p>
              </div>
            </div>
          </div>

          {/* Resumen de Pilares Clave */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm font-display">
                  Inteligencia Analítica & Generación de Insights
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Insight People IA procesa de manera segura los datos demográficos y de morbilidad sentida de los <strong>482 colaboradores</strong> para detectar patrones de fatiga, dolor osteomuscular y sobreexposición biomecánica por área y sede.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm font-display">
                  Automatización Responsable & Gobernanza
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cada sugerencia de la IA genera un registro de auditoría persistente con fecha, usuario, función y estado de revisión humana (Pendiente, Validada, Rechazada o Implementada), garantizando trazabilidad ante auditorías SG-SST.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PROPÓSITO & FLUJO DE 11 PASOS */}
      {activeTab === 'proposito_flujo' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div>
              <h3 className="font-black text-slate-900 text-base font-display mb-1">
                Flujo Integral de Valor: Del Dato Crudo a la Acción y Seguimiento
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Secuencia formal de 11 pasos que garantiza la integridad matemática y el control humano en cada etapa.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-2">
              {strategicPurpose.valueChainSteps.map((s) => (
                <div 
                  key={s.step} 
                  className={`p-4 rounded-2xl border transition-all text-left space-y-1.5 relative ${
                    s.step === 8 
                      ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30' 
                      : s.step === 5 || s.step === 6 || s.step === 7
                      ? 'bg-indigo-50/50 border-indigo-200'
                      : s.step === 3 
                      ? 'bg-cyan-50/60 border-cyan-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-slate-400">PASO {String(s.step).padStart(2, '0')}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      s.role === 'Humano' ? 'bg-amber-200 text-amber-900 font-black' :
                      s.role === 'Motor IA' || s.role === 'Cognitivo' ? 'bg-indigo-100 text-indigo-800' :
                      s.role === 'Matemático' ? 'bg-cyan-100 text-cyan-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {s.role}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 font-display">{s.title}</h4>
                  <p className="text-[11px] text-slate-600 font-medium leading-snug">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong className="text-slate-900">Punto Clave de Arquitectura:</strong> El paso 3 (Indicadores) es 100% determinista. La IA interviene en los pasos 5, 6 y 7 para sintetizar patrones y sugerir recomendaciones. El paso 8 (Validación Humana) es el punto de control obligatorio antes de que cualquier sugerencia se transforme en decisión.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: 5 PILARES ESTRATÉGICOS */}
      {activeTab === 'pilares' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs">
            <h3 className="font-black text-slate-900 text-base font-display mb-1">
              Cinco Pilares Estratégicos de IA en Insight People IA
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-6">
              Ejes que articulan el desarrollo, despliegue y evaluación de capacidades de inteligencia artificial en la organización.
            </p>

            <div className="space-y-4">
              {pillars.map(p => (
                <div key={p.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-black">
                        {p.number}
                      </div>
                      <h4 className="text-sm font-black text-slate-900 font-display">{p.name}</h4>
                    </div>
                    <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full self-start sm:self-center">
                      KPI: {p.trackingKpi}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-[9px] uppercase font-black text-slate-400 block">Objetivo</span>
                      <p className="text-slate-700 font-medium leading-snug">{p.objective}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-[9px] uppercase font-black text-indigo-500 block">Aplicación en Insight People IA</span>
                      <p className="text-slate-700 font-medium leading-snug">{p.applicationInApp}</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
                      <span className="text-[9px] uppercase font-black text-emerald-600 block">Beneficio Empresarial</span>
                      <p className="text-slate-700 font-medium leading-snug">{p.businessBenefit}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: MATRIZ DE CASOS DE USO */}
      {activeTab === 'casos_uso' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">
                Matriz Estratégica de Casos de Uso
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Inventario clasificado de casos de uso reales según su estado de implementación en el código fuente.
              </p>
            </div>

            {/* Filtro por estado */}
            <div className="flex gap-1.5 self-start sm:self-center overflow-x-auto">
              {(['TODOS', 'IMPLEMENTADO', 'EN DESARROLLO', 'FUTURO'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedCaseStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all cursor-pointer ${
                    selectedCaseStatusFilter === st
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[9px] font-black border-y border-slate-200">
                  <th className="p-3">Caso de Uso</th>
                  <th className="p-3">Problema que Resuelve</th>
                  <th className="p-3">Usuario Objetivo</th>
                  <th className="p-3">Datos Utilizados</th>
                  <th className="p-3">IA Utilizada</th>
                  <th className="p-3">Intervención Humana</th>
                  <th className="p-3">Beneficio</th>
                  <th className="p-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUseCases.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3">
                      <p className="font-extrabold text-slate-900">{u.title}</p>
                      <span className="text-[9px] font-black uppercase text-slate-400">{u.category}</span>
                    </td>
                    <td className="p-3 text-slate-600 max-w-xs leading-snug">{u.problemSolved}</td>
                    <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">{u.targetUser}</td>
                    <td className="p-3 text-slate-600 max-w-[150px] leading-snug">{u.inputData}</td>
                    <td className="p-3 font-mono font-bold text-indigo-600 text-[10px]">{u.aiTechUsed}</td>
                    <td className="p-3 text-slate-700 max-w-xs leading-snug">
                      <strong className="text-amber-700 block text-[10px]">Supervisión:</strong> {u.humanInterventionRequired}
                    </td>
                    <td className="p-3 text-emerald-800 font-medium leading-snug">{u.businessBenefit}</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase inline-block ${
                        u.status === 'IMPLEMENTADO' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        u.status === 'EN DESARROLLO' ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                        'bg-slate-100 text-slate-600 border border-slate-300'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: NIVELES DE AUTONOMÍA DE IA */}
      {activeTab === 'autonomia' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div>
              <h3 className="font-black text-slate-900 text-base font-display mb-1">
                Escala de Autonomía y Supervisión Humana
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Delimitación clara del grado de automatización permitido en Insight People IA. El modelo Human-in-the-loop es mandatorio.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {autonomyLevels.map(lvl => (
                <div 
                  key={lvl.level}
                  className={`p-4 rounded-2xl border transition-all ${
                    lvl.level === 5 
                      ? 'bg-rose-50/50 border-rose-200' 
                      : lvl.level === 4
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-black px-2 py-0.5 bg-slate-900 text-white rounded-lg">
                        L{lvl.level}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 font-display">{lvl.name}</h4>
                      <span className="text-xs text-slate-500 font-bold">— {lvl.tagline}</span>
                    </div>

                    <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border self-start sm:self-center ${
                      lvl.inInsightPeopleStatus === 'ACTIVO'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300 font-black'
                    }`}>
                      {lvl.inInsightPeopleStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-medium leading-relaxed mb-2">
                    {lvl.description}
                  </p>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-[11px] text-slate-600 flex items-start gap-2">
                    <strong className="text-slate-900 shrink-0">Rol del Usuario:</strong>
                    <span>{lvl.humanRole}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: CADENA DE VALOR & PROPUESTA DE VALOR */}
      {activeTab === 'cadena_propuesta' && (
        <div className="space-y-6">
          
          {/* CADENA DE VALOR DE IA */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">
                Cadena de Valor de Inteligencia Artificial
              </h3>
              <p className="text-xs text-slate-500 font-medium">De qué manera los datos se convierten progresivamente en valor tangible para la empresa.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
              {[
                { title: '1. ENTRADA', items: valueChain.entrada, color: 'bg-slate-50 border-slate-200 text-slate-800' },
                { title: '2. PROCESAMIENTO', items: valueChain.procesamiento, color: 'bg-cyan-50/60 border-cyan-200 text-cyan-950' },
                { title: '3. INTELIGENCIA', items: valueChain.inteligencia, color: 'bg-indigo-50/60 border-indigo-200 text-indigo-950' },
                { title: '4. RESULTADO', items: valueChain.resultado, color: 'bg-amber-50/60 border-amber-200 text-amber-950' },
                { title: '5. VALOR EMPRESARIAL', items: valueChain.valorEmpresarial, color: 'bg-emerald-50/70 border-emerald-200 text-emerald-950' }
              ].map((col, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${col.color} space-y-2 text-left`}>
                  <span className="text-[10px] font-black uppercase tracking-wider block border-b pb-1.5 opacity-80">
                    {col.title}
                  </span>
                  <ul className="text-[11px] space-y-1.5 list-disc list-inside font-medium leading-snug opacity-90">
                    {col.items.map((it, itIdx) => (
                      <li key={itIdx}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* PROPUESTA DE VALOR: ANTES VS DESPUÉS */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">
                ¿Qué problema resuelve Insight People IA? (Antes vs. Después)
              </h3>
              <p className="text-xs text-slate-500 font-medium">Transformación del modelo analítico tradicional al ecosistema integrado y asistido por IA.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-3">
                <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase border-b border-rose-200 pb-2">
                  <X className="w-4 h-4 text-rose-600" />
                  <span>Antes de Insight People IA</span>
                </div>
                <div className="space-y-2.5">
                  {valueProp.before.map((b, idx) => (
                    <div key={idx} className="text-xs space-y-0.5">
                      <p className="font-bold text-rose-950">{b.title}</p>
                      <p className="text-slate-600 font-medium leading-snug">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-xs uppercase border-b border-emerald-200 pb-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Con Insight People IA</span>
                </div>
                <div className="space-y-2.5">
                  {valueProp.after.map((a, idx) => (
                    <div key={idx} className="text-xs space-y-0.5">
                      <p className="font-bold text-emerald-950">{a.title}</p>
                      <p className="text-slate-600 font-medium leading-snug">{a.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 7: MAPA DE STAKEHOLDERS Y USUARIOS */}
      {activeTab === 'stakeholders' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base font-display">
              Mapa de Usuarios y Stakeholders
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Cómo cada perfil de la organización interactúa con las capacidades de IA según su alcance de decisión.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {stakeholders.map((st, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="text-xs font-black text-slate-900 font-display">{st.role}</h4>
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[9px] uppercase font-black text-slate-400 block">Necesidad</span>
                    <p className="text-slate-700 font-medium leading-snug">{st.businessNeed}</p>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-black text-indigo-500 block">Función IA de Apoyo</span>
                    <p className="text-slate-800 font-bold leading-snug">{st.aiFeature}</p>
                  </div>

                  <div>
                    <span className="text-[9px] uppercase font-black text-emerald-600 block">Resultado Esperado</span>
                    <p className="text-slate-700 font-medium leading-snug">{st.expectedOutcome}</p>
                  </div>

                  <div className="pt-1.5 border-t border-slate-200 text-[10px] text-slate-500">
                    <strong>Alcance de Decisión:</strong> {st.decisionScope}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 8: MADUREZ, INDICADORES, ROADMAP & DIFERENCIADORES */}
      {activeTab === 'madurez_roadmap' && (
        <div className="space-y-6">
          
          {/* 1. EVALUACIÓN DE MADUREZ DE IA */}
          {maturity && (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 mb-1">
                    <Award className="w-3 h-3 text-indigo-600" />
                    <span>Evaluación Basada en Evidencias Reales</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base font-display">
                    Nivel de Madurez Actual: {maturity.levelName}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{maturity.description}</p>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-2xl text-center shrink-0">
                  <span className="text-[9px] uppercase font-black text-cyan-300 block">Puntaje de Madurez</span>
                  <p className="text-2xl font-black font-display text-white">{maturity.maturityScorePercent}/100</p>
                  <span className="text-[9px] text-slate-400">Escala de 5 Niveles</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
                  <span className="text-[10px] font-black uppercase text-emerald-800 block">Evidencias en Código</span>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside font-medium leading-snug">
                    {maturity.evidencesInCode.map((ev, i) => (
                      <li key={i}>{ev}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-800 block">Brechas Actuales</span>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside font-medium leading-snug">
                    {maturity.currentGaps.map((g, i) => (
                      <li key={i}>{g}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-2">
                  <span className="text-[10px] font-black uppercase text-indigo-800 block">Para Alcanzar {maturity.nextLevelName}</span>
                  <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside font-medium leading-snug">
                    {maturity.recommendedActions.map((ac, i) => (
                      <li key={i}>{ac}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* 2. ROADMAP ESTRATÉGICO */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">
                Roadmap Estratégico de Inteligencia Artificial
              </h3>
              <p className="text-xs text-slate-500 font-medium">Evolución planificada de capacidades según viabilidad técnica y prioridades de negocio.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
              {[roadmap.actual, roadmap.cortoPlazo, roadmap.medianoPlazo, roadmap.largoPlazo].map((phase, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${phase.color} space-y-2.5 text-left`}>
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-[10px] font-black uppercase font-mono">{phase.period}</span>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-white/80 rounded-md">
                      {phase.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-black font-display">{phase.title}</h4>
                  <ul className="text-[11px] space-y-1.5 list-disc list-inside font-medium leading-snug">
                    {phase.items.map((it, itIdx) => (
                      <li key={itIdx}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* 3. DIFERENCIADORES ESTRATÉGICOS: ¿POR QUÉ INSIGHT PEOPLE IA? */}
          <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-md space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span>Propuesta Única de Valor</span>
            </div>
            <h3 className="text-xl font-black font-display text-white">¿Por qué Insight People IA?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {differentiators.map((diff, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-left">
                  <h4 className="text-xs font-black text-cyan-300">{diff.title}</h4>
                  <p className="text-xs text-slate-300 font-medium leading-relaxed">{diff.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
