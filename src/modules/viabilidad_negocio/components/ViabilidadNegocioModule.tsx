import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  Layers, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Sliders, 
  Compass, 
  Sparkles, 
  Award, 
  ArrowRight, 
  Check, 
  X, 
  Edit3, 
  Save, 
  RefreshCw, 
  Plus, 
  Info, 
  BarChart3, 
  FileText, 
  Scale, 
  Lock, 
  PieChart, 
  Building, 
  Zap, 
  Calculator, 
  HelpCircle,
  History,
  Tag
} from 'lucide-react';
import { useEmpresa } from '../../configuracion/useEmpresa';
import { ViabilidadService } from '../services/viabilidadService';
import { 
  BusinessCanvasItem, 
  ClientSegmentItem, 
  MonetizationModelItem, 
  CommercialPlanItem, 
  FinancialScenarioParams, 
  ClientROICalculatorParams, 
  ViabilityMatrixDimension, 
  CompetitiveAdvantageItem, 
  ScalabilityDimensionItem, 
  CommercialRoadmapPhase, 
  FinancialAuditChangeLog,
  DataClassificationType 
} from '../types/viabilidad.types';

export default function ViabilidadNegocioModule() {
  const { config, activeCompanyId } = useEmpresa();
  const companyName = config.nombreEmpresa || 'InnovaTech IT S.A.S.';
  const userEmail = 'lider.ghumana@innovatechit.com.co';

  // Sub-tabs
  const [activeTab, setActiveTab] = useState<
    'resumen' | 'canvas' | 'propuesta' | 'segmentos' | 'monetizacion' | 'planes' | 'simulador' | 'escenarios' | 'roi_cliente' | 'viabilidad_matriz' | 'ventaja_competitiva' | 'escalabilidad' | 'roadmap_comercial' | 'trazabilidad'
  >('resumen');

  // State
  const [canvasItems, setCanvasItems] = useState<BusinessCanvasItem[]>([]);
  const [segments, setSegments] = useState<ClientSegmentItem[]>([]);
  const [monetizationModels, setMonetizationModels] = useState<MonetizationModelItem[]>([]);
  const [plans, setPlans] = useState<CommercialPlanItem[]>([]);
  const [scenarios, setScenarios] = useState<Record<'conservador' | 'base' | 'optimista', FinancialScenarioParams>>(ViabilidadService.getDefaultScenarios());
  const [activeScenarioId, setActiveScenarioId] = useState<'conservador' | 'base' | 'optimista'>('base');
  const [viabilityMatrix, setViabilityMatrix] = useState<ViabilityMatrixDimension[]>([]);
  const [competitiveAdvantages, setCompetitiveAdvantages] = useState<CompetitiveAdvantageItem[]>([]);
  const [scalabilityDimensions, setScalabilityDimensions] = useState<ScalabilityDimensionItem[]>([]);
  const [roadmap, setRoadmap] = useState<CommercialRoadmapPhase[]>([]);
  const [auditLogs, setAuditLogs] = useState<FinancialAuditChangeLog[]>([]);

  // Interactive Client ROI calculator params
  const [clientRoiParams, setClientRoiParams] = useState<ClientROICalculatorParams>({
    manualHoursPerCycle: 60,
    costPerHourCop: 45000,
    cyclesPerYear: 4,
    teamMembersCount: 2,
    platformEstimatedHoursPerCycle: 6,
    platformAnnualFeeCop: 14500000
  });

  // Modal states for editing
  const [isEditingScenarioModalOpen, setIsEditingScenarioModalOpen] = useState<boolean>(false);
  const [editScenarioForm, setEditScenarioForm] = useState<FinancialScenarioParams>(ViabilidadService.getDefaultScenarios().base);
  const [scenarioEditJustification, setScenarioEditJustification] = useState<string>('');

  const [isEditingPlansModalOpen, setIsEditingPlansModalOpen] = useState<boolean>(false);
  const [editingPlansList, setEditingPlansList] = useState<CommercialPlanItem[]>([]);
  const [plansEditJustification, setPlansEditJustification] = useState<string>('');

  // Initial load with company isolation
  useEffect(() => {
    setCanvasItems(ViabilidadService.getBusinessCanvas());
    setSegments(ViabilidadService.getDefaultClientSegments());
    setMonetizationModels(ViabilidadService.getMonetizationModels());
    setPlans(ViabilidadService.getSavedPlans(activeCompanyId));
    setScenarios(ViabilidadService.getSavedScenarios(activeCompanyId));
    setViabilityMatrix(ViabilidadService.getViabilityMatrix());
    setCompetitiveAdvantages(ViabilidadService.getCompetitiveAdvantages());
    setScalabilityDimensions(ViabilidadService.getScalabilityDimensions());
    setRoadmap(ViabilidadService.getCommercialRoadmap());
    setAuditLogs(ViabilidadService.getAuditLogs(activeCompanyId));
  }, [activeCompanyId]);

  // Current active scenario calculation
  const currentScenario = scenarios[activeScenarioId] || scenarios.base;
  const currentFinResults = ViabilidadService.calculateFinancialResults(currentScenario);

  // Client ROI calculation
  const clientRoiResults = ViabilidadService.calculateClientROI(clientRoiParams);

  // Currency Formatter COP
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Handler: Save Edited Scenario
  const handleSaveScenarioEdits = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedScenarios = {
      ...scenarios,
      [editScenarioForm.id]: editScenarioForm
    };
    setScenarios(updatedScenarios);
    ViabilidadService.saveScenarios(
      activeCompanyId, 
      updatedScenarios, 
      userEmail, 
      scenarioEditJustification || 'Ajuste de supuestos en simulador financiero'
    );
    setAuditLogs(ViabilidadService.getAuditLogs(activeCompanyId));
    setIsEditingScenarioModalOpen(false);
    setScenarioEditJustification('');
  };

  // Handler: Save Edited Plans
  const handleSavePlansEdits = (e: React.FormEvent) => {
    e.preventDefault();
    setPlans(editingPlansList);
    ViabilidadService.savePlans(
      activeCompanyId, 
      editingPlansList, 
      userEmail, 
      plansEditJustification || 'Actualización de tarifas de referencia'
    );
    setAuditLogs(ViabilidadService.getAuditLogs(activeCompanyId));
    setIsEditingPlansModalOpen(false);
    setPlansEditJustification('');
  };

  // Tag Render Helper
  const renderClassificationTag = (type: DataClassificationType) => {
    const colorMap: Record<DataClassificationType, string> = {
      '[A] Dato real': 'bg-emerald-100 text-emerald-900 border-emerald-300',
      '[B] Supuesto': 'bg-indigo-100 text-indigo-900 border-indigo-300',
      '[C] Escenario': 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
      '[D] Proyección': 'bg-purple-100 text-purple-900 border-purple-300'
    };
    return (
      <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md border ${colorMap[type] || 'bg-slate-100 text-slate-700'}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in text-left">
      
      {/* 1. CABEZOTE EMPRESARIAL PRINCIPAL */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[45%] h-full bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/20">
              <Briefcase className="w-3.5 h-3.5 text-emerald-300" />
              <span>Modelo de Negocio & Monetización Digital</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2.5">
              Viabilidad del Negocio
            </h1>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed max-w-2xl">
              Evaluación académica, técnica y comercial de <strong className="text-cyan-300 font-black">Insight People IA</strong> para <strong className="text-white font-black">{companyName}</strong>. Simulación financiera interactiva, retorno de inversión y escalabilidad como solución SaaS B2B.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 shrink-0">
            <div className="bg-slate-950/70 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <div className="text-left">
                <span className="text-[9px] uppercase font-black text-slate-400 block">Viabilidad General</span>
                <span className="text-xs font-black text-emerald-300">Alta (7 Dimensiones Validadas)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Banner de Clasificación Metodológica de Datos */}
        <div className="mt-5 p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Info className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-medium text-[11px]">
              <strong>Rigor Metodológico:</strong> Los datos financieros se presentan clasificados explícitamente para diferenciar hechos de escenarios:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {renderClassificationTag('[A] Dato real')}
            {renderClassificationTag('[B] Supuesto')}
            {renderClassificationTag('[C] Escenario')}
            {renderClassificationTag('[D] Proyección')}
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVEGACIÓN DE VIABILIDAD */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/60 shadow-2xs flex gap-1.5 overflow-x-auto">
        {[
          { id: 'resumen', label: 'Resumen Ejecutivo', icon: TrendingUp },
          { id: 'canvas', label: 'Business Model Canvas', icon: Layers },
          { id: 'propuesta', label: 'Propuesta de Valor', icon: Target },
          { id: 'segmentos', label: 'Segmentos de Clientes', icon: Users },
          { id: 'monetizacion', label: 'Modelos de Monetización', icon: DollarSign },
          { id: 'planes', label: 'Planes Comerciales', icon: Tag },
          { id: 'simulador', label: 'Simulador Financiero', icon: Calculator },
          { id: 'escenarios', label: 'Comparador de Escenarios', icon: BarChart3 },
          { id: 'roi_cliente', label: 'ROI para el Cliente', icon: Zap },
          { id: 'viabilidad_matriz', label: 'Matriz de Viabilidad', icon: Scale },
          { id: 'ventaja_competitiva', label: 'Ventaja Competitiva', icon: ShieldCheck },
          { id: 'escalabilidad', label: 'Escalabilidad', icon: Sparkles },
          { id: 'roadmap_comercial', label: 'Roadmap Comercial', icon: Compass },
          { id: 'trazabilidad', label: 'Auditoría & Trazabilidad', icon: History }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
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
          {/* Tarjetas KPI de Viabilidad */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-slate-400 block">MRR Simulado</span>
                {renderClassificationTag('[D] Proyección')}
              </div>
              <p className="text-lg font-black text-slate-900 font-display">
                {formatCOP(currentFinResults.totalMRR)}
              </p>
              <span className="text-[9px] text-slate-500 font-bold">Escenario {currentScenario.name.split(' ')[1]}</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-slate-400 block">ARR Proyectado</span>
                {renderClassificationTag('[D] Proyección')}
              </div>
              <p className="text-lg font-black text-emerald-600 font-display">
                {formatCOP(currentFinResults.totalAnnualRevenue)}
              </p>
              <span className="text-[9px] text-emerald-600 font-bold">Anualizado + Setups</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-slate-400 block">Margen Neto</span>
                {renderClassificationTag('[D] Proyección')}
              </div>
              <p className="text-lg font-black text-indigo-600 font-display">
                {currentFinResults.netProfitMarginPercent}%
              </p>
              <span className="text-[9px] text-indigo-600 font-bold">Rentabilidad Neta</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-slate-400 block">Punto Equilibrio</span>
                {renderClassificationTag('[C] Escenario')}
              </div>
              <p className="text-lg font-black text-amber-600 font-display">
                {currentFinResults.breakEvenClients} Clientes
              </p>
              <span className="text-[9px] text-amber-600 font-bold">Para cubrir OPEX</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-slate-400 block">ROI Proyectado</span>
                {renderClassificationTag('[D] Proyección')}
              </div>
              <p className="text-lg font-black text-purple-600 font-display">
                {currentFinResults.estimatedRoiPercent}%
              </p>
              <span className="text-[9px] text-purple-600 font-bold">Retorno sobre OPEX</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-slate-400 block">Payback</span>
                {renderClassificationTag('[D] Proyección')}
              </div>
              <p className="text-lg font-black text-slate-900 font-display">
                {currentFinResults.paybackMonths} Meses
              </p>
              <span className="text-[9px] text-slate-500 font-bold">Recuperación inversión</span>
            </div>
          </div>

          {/* Síntesis Ejecutiva de la Oportunidad */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tesis de Viabilidad Comercial</span>
              </div>
              <span className="text-xs text-slate-400">Escenario Activo: <strong>{currentScenario.name}</strong></span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-white leading-snug">
              Insight People IA combina el cumplimiento legal obligatorio (Decreto 1072 / Res. 0312) con analítica avanzada e IA supervisada, transformando un costo operativo en una solución tecnológica escalable de alto margen.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-cyan-300 font-black uppercase text-[10px] block">1. Alta Retención (Bajo Churn)</span>
                <p className="text-slate-300 leading-relaxed font-medium">La recolección anual de encuestas y el seguimiento de intervenciones crea barreras de salida naturales.</p>
              </div>
              <div className="space-y-1">
                <span className="text-emerald-300 font-black uppercase text-[10px] block">2. Economía Unitaria Saludable</span>
                <p className="text-slate-300 leading-relaxed font-medium">Margen bruto proyectado superior al 75% gracias a la infraestructura Cloud Serverless y bajo costo de tokens.</p>
              </div>
              <div className="space-y-1">
                <span className="text-amber-300 font-black uppercase text-[10px] block">3. Escalabilidad Multi-Tenant</span>
                <p className="text-slate-300 leading-relaxed font-medium">La arquitectura multiempresa permite servir a cientos de clientes sin duplicar infraestructura ni código.</p>
              </div>
            </div>
          </div>

          {/* Comparativa Rápida de Escenarios */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Comparativa Rápida de Escenarios Financieros
                </h3>
                <p className="text-xs text-slate-500 font-medium">Resultados simulados según el nivel de adopción comercial.</p>
              </div>
              <button
                onClick={() => setActiveTab('escenarios')}
                className="text-xs font-black uppercase text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Detalle Completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {(['conservador', 'base', 'optimista'] as const).map(scId => {
                const sc = scenarios[scId];
                const res = ViabilidadService.calculateFinancialResults(sc);
                const isSelected = activeScenarioId === scId;
                return (
                  <div 
                    key={scId}
                    onClick={() => setActiveScenarioId(scId)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer text-left space-y-3 ${
                      isSelected 
                        ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-400/40 shadow-sm' 
                        : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <h4 className="text-xs font-black text-slate-900 font-display">{sc.name}</h4>
                      {isSelected && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-indigo-600 text-white rounded-md">
                          ACTIVO
                        </span>
                      )}
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Clientes:</span>
                        <strong className="text-slate-800">{sc.numClients}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">MRR:</span>
                        <strong className="text-slate-900 font-mono">{formatCOP(res.totalMRR)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">ARR + Setups:</span>
                        <strong className="text-emerald-700 font-mono">{formatCOP(res.totalAnnualRevenue)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Utilidad Neta Anual:</span>
                        <strong className="text-indigo-700 font-mono">{formatCOP(res.annualNetProfit)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Margen Neto:</span>
                        <strong className="text-slate-900">{res.netProfitMarginPercent}%</strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: BUSINESS MODEL CANVAS */}
      {activeTab === 'canvas' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">
                Business Model Canvas — Insight People IA
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Estructura integral del modelo de negocio digital con clasificación metodológica de cada bloque.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3.5 pt-2">
              {canvasItems.map(item => (
                <div key={item.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-black tracking-wider text-indigo-700 font-mono">
                        {item.category.replace('_', ' ')}
                      </span>
                      {renderClassificationTag(item.dataClassification)}
                    </div>
                    <h4 className="text-xs font-black text-slate-900 font-display">{item.title}</h4>
                    <p className="text-[11px] text-slate-600 font-medium leading-snug">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: PROPUESTA DE VALOR */}
      {activeTab === 'propuesta' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-slate-900 text-base font-display">
                Propuesta de Valor: Flujo Tradicional vs. Flujo Insight People IA
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Contraste metodológico y operativo entre la gestión convencional y la arquitectura analítica inteligente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* SITUACIÓN TRADICIONAL */}
              <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-3">
                <div className="flex items-center justify-between border-b border-rose-200 pb-2">
                  <div className="flex items-center gap-2 text-rose-900 font-black text-xs uppercase">
                    <X className="w-4 h-4 text-rose-600" />
                    <span>Situación Tradicional (Sin Plataforma)</span>
                  </div>
                  {renderClassificationTag('[A] Dato real')}
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    '1. Datos dispersos en múltiples correos y formularios en papel',
                    '2. Consolidación en archivos Excel pesados y no vinculados',
                    '3. Procesamiento manual con fórmulas propensas a errores',
                    '4. Cálculo de indicadores sin trazabilidad metodológica',
                    '5. Interpretación subjetiva sin contexto de morbilidad cruzada',
                    '6. Redacción manual de informes en Word cortando y pegando capturas',
                    '7. Toma de decisiones reactiva y demorada semanas después'
                  ].map((step, i) => (
                    <div key={i} className="p-2 bg-white/80 rounded-xl border border-rose-100 text-rose-950 font-medium text-[11px]">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

              {/* INSIGHT PEOPLE IA */}
              <div className="p-5 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-black text-xs uppercase">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Con Insight People IA</span>
                  </div>
                  {renderClassificationTag('[A] Dato real')}
                </div>
                <div className="space-y-1.5 text-xs">
                  {[
                    '1. Ingesta unificada de censo (482 colaboradores) y encuestas',
                    '2. Validación automática de calidad en 17 dimensiones',
                    '3. Cálculo determinista por CentralIndicatorEngine (fórmulas oficiales)',
                    '4. Analítica multidimensional por sede, área, cargo y edad',
                    '5. IA consultiva con detección de patrones osteomusculares',
                    '6. Recomendaciones con supervisión humana obligatoria (HITL)',
                    '7. Generación instantánea de Informe Ejecutivo ISO 45001 (Prompt38)'
                  ].map((step, i) => (
                    <div key={i} className="p-2 bg-white/80 rounded-xl border border-emerald-100 text-emerald-950 font-medium text-[11px]">
                      {step}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Beneficios Empresariales Concretos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1">
                <span className="text-[10px] font-black uppercase text-indigo-700 block">Reducción de Tiempos</span>
                <p className="text-xs text-slate-700 font-medium leading-snug">De semanas de tabulación manual a segundos en generación de diagnósticos.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1">
                <span className="text-[10px] font-black uppercase text-emerald-700 block">Paridad Matemática</span>
                <p className="text-xs text-slate-700 font-medium leading-snug">100% de coherencia entre el Dashboard interactivo y el Informe Ejecutivo.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1">
                <span className="text-[10px] font-black uppercase text-cyan-700 block">Gobernanza Ética</span>
                <p className="text-xs text-slate-700 font-medium leading-snug">Registro inmutable de dictámenes y cero automatización de despidos.</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-1">
                <span className="text-[10px] font-black uppercase text-purple-700 block">Aislamiento Multiempresa</span>
                <p className="text-xs text-slate-700 font-medium leading-snug">Garantía total de privacidad por activeCompanyId con permisos RBAC.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: SEGMENTOS DE CLIENTES */}
      {activeTab === 'segmentos' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Segmentos de Clientes Objetivo
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Matriz parametrizable de perfiles de mercado con mayor potencial de adopción.
                </p>
              </div>
              {renderClassificationTag('[B] Supuesto')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {segments.map(seg => (
                <div key={seg.id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                        seg.status === 'PRIORITARIO' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        seg.status === 'SECUNDARIO' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                        'bg-slate-200 text-slate-700 border-slate-300'
                      }`}>
                        {seg.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">Fit: <strong className="text-slate-800">{seg.fitScore}</strong></span>
                    </div>
                    <h4 className="text-xs font-black text-slate-900 font-display">{seg.name}</h4>
                    <p className="text-xs text-slate-600 font-medium leading-snug">{seg.profileDescription}</p>
                    
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                      <span className="text-[9px] uppercase font-black text-rose-700 block">Dolor Principal</span>
                      <p className="text-slate-700 leading-snug">{seg.painPoint}</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1 text-xs">
                      <span className="text-[9px] uppercase font-black text-emerald-700 block">Valor Entregado</span>
                      <p className="text-slate-700 leading-snug">{seg.valueDelivered}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-semibold">
                    Tamaño de Mercado Est.: <strong className="text-slate-800">{seg.marketSizeEstimated}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: MODELOS DE MONETIZACIÓN */}
      {activeTab === 'monetizacion' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Comparativa de Modelos de Monetización Evaluados
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Análisis estratégico de las 9 alternativas de cobro y captura de valor en el mercado B2B.
                </p>
              </div>
              {renderClassificationTag('[C] Escenario')}
            </div>

            <div className="space-y-3 pt-1">
              {monetizationModels.map(mm => (
                <div key={mm.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-slate-900 font-display">{mm.name}</h4>
                    <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full border self-start sm:self-center ${
                      mm.recommendationLevel === 'RECOMENDADO PRIMARIO' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                      mm.recommendationLevel === 'COMPLEMENTARIO' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                      'bg-slate-100 text-slate-600 border-slate-300'
                    }`}>
                      {mm.recommendationLevel}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-snug">{mm.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-0.5">
                      <span className="text-[9px] uppercase font-black text-slate-400 block">Lógica de Cobro</span>
                      <p className="text-slate-700 font-medium leading-snug">{mm.pricingLogic}</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-0.5">
                      <span className="text-[9px] uppercase font-black text-emerald-700 block">Ventajas</span>
                      <p className="text-slate-700 font-medium leading-snug">{mm.pros}</p>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-0.5">
                      <span className="text-[9px] uppercase font-black text-amber-700 block">Desafíos</span>
                      <p className="text-slate-700 font-medium leading-snug">{mm.challenges}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: PLANES COMERCIALES EDITABLES */}
      {activeTab === 'planes' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Estructura de Planes Comerciales (Valores de Escenario)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Los precios presentados corresponden a valores de referencia configurables para simulación.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {renderClassificationTag('[C] Escenario')}
                <button
                  onClick={() => {
                    setEditingPlansList([...plans]);
                    setIsEditingPlansModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase flex items-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar Tarifas</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {plans.map(plan => (
                <div key={plan.id} className={`p-5 rounded-2xl border ${plan.badgeColor} space-y-4 flex flex-col justify-between`}>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black font-display">{plan.name}</h4>
                      {renderClassificationTag(plan.priceClassification)}
                    </div>
                    <p className="text-xs opacity-80 leading-snug">{plan.tagline}</p>
                    
                    <div className="p-3 bg-white/60 rounded-xl border border-slate-200/60 space-y-1">
                      <span className="text-[9px] uppercase font-black opacity-60 block">Tarifa Referencia Mensual</span>
                      <p className="text-xl font-black font-mono">{formatCOP(plan.monthlyPriceRef)} <span className="text-[10px] font-sans font-normal">/mes</span></p>
                      <span className="text-[10px] opacity-70 block font-semibold">Anual ref: {formatCOP(plan.annualPriceRef)}</span>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-[11px] border-b pb-1">
                        <span className="opacity-70">Límite Colaboradores:</span>
                        <strong>{plan.maxColaboradores}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] border-b pb-1">
                        <span className="opacity-70">Empresas (Tenants):</span>
                        <strong>{plan.maxEmpresas}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] border-b pb-1">
                        <span className="opacity-70">Sedes permitidas:</span>
                        <strong>{plan.maxSedes}</strong>
                      </div>
                      <div className="flex justify-between text-[11px] border-b pb-1">
                        <span className="opacity-70">Áreas permitidas:</span>
                        <strong>{plan.maxAreas}</strong>
                      </div>
                    </div>

                    <div className="space-y-1 pt-2">
                      <span className="text-[9px] uppercase font-black opacity-60 block">Características Incluidas</span>
                      <ul className="text-[11px] space-y-1 list-disc list-inside opacity-90 leading-snug">
                        <li>Encuestas: {String(plan.features.encuestas)}</li>
                        <li>Excel: {String(plan.features.excelImport)}</li>
                        <li>Dashboard: {String(plan.features.dashboard)}</li>
                        <li>Informe Prompt38: {String(plan.features.informesPrompt38)}</li>
                        <li>IA Copilot: {String(plan.features.iaCopilot)}</li>
                        <li>Gobernanza IA: {String(plan.features.gobernanzaIA)}</li>
                        <li>Soporte: {String(plan.features.soporte)}</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t opacity-70 text-[10px] text-center font-bold">
                    Tarifa para Escenario Comercial
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 7: SIMULADOR FINANCIERO INTERACTIVO */}
      {activeTab === 'simulador' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Simulador Financiero Dinámico (Resultados en Vivo)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Modifique las variables operativas y comerciales para evaluar el impacto en rentabilidad y punto de equilibrio.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {renderClassificationTag('[C] Escenario')}
                <button
                  onClick={() => {
                    setEditScenarioForm({ ...currentScenario });
                    setIsEditingScenarioModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-black uppercase flex items-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Ajustar Parámetros</span>
                </button>
              </div>
            </div>

            {/* Selector de Escenario Rápido */}
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
              {(['conservador', 'base', 'optimista'] as const).map(scId => (
                <button
                  key={scId}
                  onClick={() => setActiveScenarioId(scId)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all cursor-pointer ${
                    activeScenarioId === scId
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {scenarios[scId].name}
                </button>
              ))}
            </div>

            {/* Inputs Visuales de Escenario Activo */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div>
                <span className="text-[9px] uppercase font-black text-slate-400 block">Clientes Activos</span>
                <strong className="text-base text-slate-900 font-display">{currentScenario.numClients} empresas</strong>
              </div>
              <div>
                <span className="text-[9px] uppercase font-black text-slate-400 block">Colaboradores / Cliente</span>
                <strong className="text-base text-slate-900 font-display">{currentScenario.avgColaboradoresPerClient} personas</strong>
              </div>
              <div>
                <span className="text-[9px] uppercase font-black text-slate-400 block">Precio Base Mensual</span>
                <strong className="text-base text-slate-900 font-mono">{formatCOP(currentScenario.monthlyBasePricePerClient)}</strong>
              </div>
              <div>
                <span className="text-[9px] uppercase font-black text-slate-400 block">Precio por Colaborador</span>
                <strong className="text-base text-slate-900 font-mono">{formatCOP(currentScenario.monthlyPricePerColaborador)}</strong>
              </div>
            </div>

            {/* Resultados Financieros Calculados Matemáticamente */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-800">Ingresos Totales</span>
                  {renderClassificationTag('[D] Proyección')}
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-black text-emerald-950 font-mono">{formatCOP(currentFinResults.totalMRR)} <span className="text-[10px] font-sans font-normal">/mes</span></p>
                  <p className="text-xs text-emerald-800 font-semibold font-mono">ARR: {formatCOP(currentFinResults.totalAnnualRevenue)}/año</p>
                </div>
                <p className="text-[10px] text-emerald-700 leading-snug">Incluye {formatCOP(currentFinResults.annualImplementationRevenue)} en implementaciones.</p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-rose-800">Costos Operativos (OPEX)</span>
                  {renderClassificationTag('[B] Supuesto')}
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-black text-rose-950 font-mono">{formatCOP(currentFinResults.monthlyOPEX)} <span className="text-[10px] font-sans font-normal">/mes</span></p>
                  <p className="text-xs text-rose-800 font-semibold font-mono">OPEX Anual: {formatCOP(currentFinResults.annualOPEX)}/año</p>
                </div>
                <p className="text-[10px] text-rose-700 leading-snug">Infraestructura cloud, tokens IA, soporte y desarrollo.</p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-indigo-800">Rentabilidad Neta</span>
                  {renderClassificationTag('[D] Proyección')}
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-black text-indigo-950 font-mono">{formatCOP(currentFinResults.annualNetProfit)} <span className="text-[10px] font-sans font-normal">/año</span></p>
                  <p className="text-xs text-indigo-800 font-semibold">Margen Neto: {currentFinResults.netProfitMarginPercent}%</p>
                </div>
                <p className="text-[10px] text-indigo-700 leading-snug">Margen Bruto Operativo: {currentFinResults.grossMarginPercent}%</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-800">Punto de Equilibrio</span>
                  {renderClassificationTag('[D] Proyección')}
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-black text-amber-950 font-mono">{currentFinResults.breakEvenClients} Clientes</p>
                  <p className="text-xs text-amber-800 font-semibold font-mono">{formatCOP(currentFinResults.breakEvenMonthlyRevenue)} /mes</p>
                </div>
                <p className="text-[10px] text-amber-700 leading-snug">ROI Estimado: {currentFinResults.estimatedRoiPercent}%</p>
              </div>

            </div>

            {/* Desglose Detallado de Costos Mensuales */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-black text-slate-500 block">Composición de Costos Mensuales del Escenario</span>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[9px] text-slate-400 block">Infra Cloud:</span>
                  <strong className="text-slate-800 font-mono text-[11px]">{formatCOP(currentScenario.monthlyInfraCost)}</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[9px] text-slate-400 block">Tokens IA:</span>
                  <strong className="text-slate-800 font-mono text-[11px]">{formatCOP(currentScenario.monthlyAITokenCost)}</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[9px] text-slate-400 block">Soporte Técnico:</span>
                  <strong className="text-slate-800 font-mono text-[11px]">{formatCOP(currentScenario.monthlySupportCost)}</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[9px] text-slate-400 block">Ingeniería Dev:</span>
                  <strong className="text-slate-800 font-mono text-[11px]">{formatCOP(currentScenario.monthlyDevCost)}</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[9px] text-slate-400 block">Comercial/Mkt:</span>
                  <strong className="text-slate-800 font-mono text-[11px]">{formatCOP(currentScenario.monthlyCommercialCost)}</strong>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200">
                  <span className="text-[9px] text-slate-400 block">Otros Gastos:</span>
                  <strong className="text-slate-800 font-mono text-[11px]">{formatCOP(currentScenario.monthlyOtherCost)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 8: COMPARADOR DE ESCENARIOS */}
      {activeTab === 'escenarios' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Comparador de Escenarios (Conservador vs. Base vs. Optimista)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Evaluación comparativa de sensibilidad financiera ante diferentes niveles de tracción.
                </p>
              </div>
              {renderClassificationTag('[C] Escenario')}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase text-[9px] font-black border-y border-slate-200">
                    <th className="p-3">Métrica / Variable</th>
                    <th className="p-3">Conservador</th>
                    <th className="p-3 bg-indigo-50/70 text-indigo-950 font-black">Base (Esperado)</th>
                    <th className="p-3">Optimista</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { label: 'Número de Clientes', key: 'numClients', suffix: ' empresas', format: 'num' },
                    { label: 'Colaboradores / Cliente', key: 'avgColaboradoresPerClient', suffix: ' personas', format: 'num' },
                    { label: 'Precio Base Mensual', key: 'monthlyBasePricePerClient', format: 'cop' },
                    { label: 'Precio por Colaborador', key: 'monthlyPricePerColaborador', format: 'cop' },
                    { label: 'Tarifa Setup Inicial', key: 'implementationFeePerClient', format: 'cop' },
                    { label: 'MRR Proyectado', calcKey: 'totalMRR', format: 'cop', bold: true },
                    { label: 'ARR Proyectado + Setups', calcKey: 'totalAnnualRevenue', format: 'cop', bold: true, color: 'text-emerald-700' },
                    { label: 'OPEX Mensual Total', calcKey: 'monthlyOPEX', format: 'cop' },
                    { label: 'OPEX Anual Total', calcKey: 'annualOPEX', format: 'cop' },
                    { label: 'Utilidad Neta Anual', calcKey: 'annualNetProfit', format: 'cop', bold: true, color: 'text-indigo-700' },
                    { label: 'Margen Neto (%)', calcKey: 'netProfitMarginPercent', suffix: '%', format: 'num', bold: true },
                    { label: 'Punto de Equilibrio (Clientes)', calcKey: 'breakEvenClients', suffix: ' clientes', format: 'num' },
                    { label: 'ROI Estimado (%)', calcKey: 'estimatedRoiPercent', suffix: '%', format: 'num' },
                    { label: 'Periodo Recuperación', calcKey: 'paybackMonths', suffix: ' meses', format: 'num' }
                  ].map((row, idx) => {
                    const cRes = ViabilidadService.calculateFinancialResults(scenarios.conservador);
                    const bRes = ViabilidadService.calculateFinancialResults(scenarios.base);
                    const oRes = ViabilidadService.calculateFinancialResults(scenarios.optimista);

                    const getVal = (sc: FinancialScenarioParams, res: any) => {
                      if (row.calcKey) return res[row.calcKey];
                      if (row.key) return (sc as any)[row.key];
                      return 0;
                    };

                    const formatVal = (v: any) => {
                      if (row.format === 'cop') return formatCOP(v);
                      return `${v}${row.suffix || ''}`;
                    };

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className={`p-3 font-semibold text-slate-800 ${row.bold ? 'font-black text-slate-900' : ''}`}>
                          {row.label}
                        </td>
                        <td className="p-3 text-slate-600 font-mono">
                          {formatVal(getVal(scenarios.conservador, cRes))}
                        </td>
                        <td className={`p-3 bg-indigo-50/40 font-mono font-bold ${row.color || 'text-slate-900'}`}>
                          {formatVal(getVal(scenarios.base, bRes))}
                        </td>
                        <td className="p-3 text-slate-600 font-mono">
                          {formatVal(getVal(scenarios.optimista, oRes))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 9: CALCULADORA DE ROI PARA EL CLIENTE */}
      {activeTab === 'roi_cliente' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Calculadora de Valor Generado & ROI para el Cliente
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Estimación de horas ahorradas y retorno de inversión al sustituir la tabulación manual por Insight People IA.
                </p>
              </div>
              {renderClassificationTag('[D] Proyección')}
            </div>

            {/* Sliders / Inputs Interactivos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase text-slate-500 block">1. Tiempo Manual Actual</span>
                
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 flex justify-between font-medium">
                    <span>Horas por ciclo de análisis:</span>
                    <strong className="text-slate-900">{clientRoiParams.manualHoursPerCycle}h</strong>
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    step="5"
                    value={clientRoiParams.manualHoursPerCycle}
                    onChange={e => setClientRoiParams({ ...clientRoiParams, manualHoursPerCycle: Number(e.target.value) })}
                    className="w-full cursor-pointer accent-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 flex justify-between font-medium">
                    <span>Personas involucradas:</span>
                    <strong className="text-slate-900">{clientRoiParams.teamMembersCount}</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={clientRoiParams.teamMembersCount}
                    onChange={e => setClientRoiParams({ ...clientRoiParams, teamMembersCount: Number(e.target.value) })}
                    className="w-full cursor-pointer accent-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 flex justify-between font-medium">
                    <span>Ciclos al año (encuestas/informes):</span>
                    <strong className="text-slate-900">{clientRoiParams.cyclesPerYear}</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={clientRoiParams.cyclesPerYear}
                    onChange={e => setClientRoiParams({ ...clientRoiParams, cyclesPerYear: Number(e.target.value) })}
                    className="w-full cursor-pointer accent-slate-900"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-[10px] font-black uppercase text-indigo-700 block">2. Costo Laboral & Plataforma</span>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 flex justify-between font-medium">
                    <span>Costo promedio hora / especialista:</span>
                    <strong className="text-slate-900 font-mono">{formatCOP(clientRoiParams.costPerHourCop)}</strong>
                  </label>
                  <input
                    type="range"
                    min="25000"
                    max="120000"
                    step="5000"
                    value={clientRoiParams.costPerHourCop}
                    onChange={e => setClientRoiParams({ ...clientRoiParams, costPerHourCop: Number(e.target.value) })}
                    className="w-full cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 flex justify-between font-medium">
                    <span>Horas con Insight People IA por ciclo:</span>
                    <strong className="text-emerald-700 font-bold">{clientRoiParams.platformEstimatedHoursPerCycle}h</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={clientRoiParams.platformEstimatedHoursPerCycle}
                    onChange={e => setClientRoiParams({ ...clientRoiParams, platformEstimatedHoursPerCycle: Number(e.target.value) })}
                    className="w-full cursor-pointer accent-emerald-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 flex justify-between font-medium">
                    <span>Costo Anual Plataforma (Ref):</span>
                    <strong className="text-slate-900 font-mono">{formatCOP(clientRoiParams.platformAnnualFeeCop)}</strong>
                  </label>
                  <input
                    type="range"
                    min="6000000"
                    max="35000000"
                    step="500000"
                    value={clientRoiParams.platformAnnualFeeCop}
                    onChange={e => setClientRoiParams({ ...clientRoiParams, platformAnnualFeeCop: Number(e.target.value) })}
                    className="w-full cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>

              {/* Resultados Calculados para el Cliente */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-900 block border-b border-emerald-200 pb-1">
                    3. Retorno Estimado para la Empresa
                  </span>
                  
                  <div className="space-y-2 pt-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-emerald-800 font-medium">Horas ahorradas al año:</span>
                      <strong className="text-emerald-950 font-black text-sm">{clientRoiResults.annualSavedHours} horas</strong>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-emerald-800 font-medium">Costo manual tradicional:</span>
                      <span className="text-slate-600 font-mono">{formatCOP(clientRoiResults.currentAnnualCostCop)}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-emerald-800 font-medium">Costo total con plataforma:</span>
                      <span className="text-slate-600 font-mono">{formatCOP(clientRoiResults.totalPlatformAnnualCostCop)}</span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-emerald-200">
                      <span className="text-emerald-950 font-bold">Ahorro Neto Estimado:</span>
                      <strong className="text-emerald-900 font-mono text-sm">{formatCOP(clientRoiResults.netAnnualSavingsCop)}</strong>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-center space-y-1">
                  <span className="text-[9px] uppercase font-black text-emerald-700 block">ROI Estimado para el Cliente</span>
                  <p className="text-2xl font-black text-emerald-900 font-display">{clientRoiResults.clientEstimatedRoiPercent}%</p>
                  <span className="text-[10px] text-emerald-800 font-semibold block">Payback estimado: {clientRoiResults.paybackMonths} meses</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 10: MATRIZ DE VIABILIDAD INTEGRAL (7 DIMENSIONES) */}
      {activeTab === 'viabilidad_matriz' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Matriz de Viabilidad Integral (7 Dimensiones)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Evaluación exhaustiva de factibilidad técnica, operativa, financiera, comercial, legal, ética y de escalabilidad.
                </p>
              </div>
              {renderClassificationTag('[A] Dato real')}
            </div>

            <div className="space-y-3 pt-1">
              {viabilityMatrix.map(vm => (
                <div key={vm.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className="text-xs font-black text-slate-900 font-display">{vm.dimensionName}</h4>
                    <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Estado: {vm.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-snug">
                    <strong className="text-slate-900">Evidencia en Plataforma:</strong> {vm.evidenceInPlatform}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 bg-white rounded-xl border border-emerald-200 space-y-1">
                      <span className="text-[9px] uppercase font-black text-emerald-700 block">Fortalezas</span>
                      <ul className="space-y-1 text-slate-700 list-disc list-inside text-[11px] leading-snug">
                        {vm.strengths.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-amber-200 space-y-1">
                      <span className="text-[9px] uppercase font-black text-amber-700 block">Riesgos Identificados</span>
                      <ul className="space-y-1 text-slate-700 list-disc list-inside text-[11px] leading-snug">
                        {vm.risksIdentified.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-indigo-200 space-y-1">
                      <span className="text-[9px] uppercase font-black text-indigo-700 block">Acciones Requeridas</span>
                      <ul className="space-y-1 text-slate-700 list-disc list-inside text-[11px] leading-snug">
                        {vm.requiredActions.map((a, i) => <li key={i}>{a}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 11: VENTAJA COMPETITIVA */}
      {activeTab === 'ventaja_competitiva' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Ventaja Competitiva Frente a Alternativas del Mercado
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Comparación objetiva de capacidades frente a herramientas tradicionales y soluciones aisladas.
                </p>
              </div>
              {renderClassificationTag('[A] Dato real')}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase text-[9px] font-black border-y border-slate-200">
                    <th className="p-3">Criterio / Capacidad</th>
                    <th className="p-3 bg-emerald-50 text-emerald-950 font-black">Insight People IA</th>
                    <th className="p-3">Excel Tradicional</th>
                    <th className="p-3">Power BI Aislado</th>
                    <th className="p-3">Consultoría Clásica</th>
                    <th className="p-3">Encuestas Aisladas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {competitiveAdvantages.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900 whitespace-nowrap">{row.featureOrCriterion}</td>
                      <td className="p-3 bg-emerald-50/40 font-bold text-emerald-900 leading-snug">{row.insightPeopleIA}</td>
                      <td className="p-3 text-slate-600 leading-snug">{row.excelTraditional}</td>
                      <td className="p-3 text-slate-600 leading-snug">{row.powerBiStandalone}</td>
                      <td className="p-3 text-slate-600 leading-snug">{row.traditionalConsultancy}</td>
                      <td className="p-3 text-slate-600 leading-snug">{row.isolatedSurveys}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 12: ESCALABILIDAD */}
      {activeTab === 'escalabilidad' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Capacidad de Crecimiento & Escalabilidad
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Análisis técnico del comportamiento de la plataforma al incrementar volumen de empresas y colaboradores.
                </p>
              </div>
              {renderClassificationTag('[A] Dato real')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
              {scalabilityDimensions.map((sc, idx) => (
                <div key={idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 font-display">{sc.dimension}</h4>
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                      Riesgo: {sc.bottleneckRisk}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-0.5">
                      <span className="text-[9px] uppercase font-black text-slate-400 block">Estado Actual</span>
                      <p className="text-slate-800 font-medium leading-snug">{sc.currentState}</p>
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-0.5">
                      <span className="text-[9px] uppercase font-black text-indigo-700 block">Capacidad Proyectada</span>
                      <p className="text-slate-800 font-medium leading-snug">{sc.projectedCapacity}</p>
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-slate-200 space-y-0.5">
                      <span className="text-[9px] uppercase font-black text-emerald-700 block">Requerimiento para Escalar</span>
                      <p className="text-slate-800 font-medium leading-snug">{sc.scalingRequirement}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 13: ROADMAP COMERCIAL */}
      {activeTab === 'roadmap_comercial' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Roadmap Comercial de 5 Fases
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Ruta estructurada de validación, despliegue de pilotos y escalamiento de mercado.
                </p>
              </div>
              {renderClassificationTag('[B] Supuesto')}
            </div>

            <div className="space-y-3 pt-1">
              {roadmap.map(ph => (
                <div key={ph.phaseNumber} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2 py-0.5 bg-slate-900 text-white rounded-lg">
                        F{ph.phaseNumber}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 font-display">{ph.title}</h4>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center">
                      <span className="text-[10px] font-mono text-slate-500 font-bold">{ph.timeframe}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        ph.status === 'EN CURSO' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                        ph.status === 'PLANIFICADO' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' :
                        'bg-slate-100 text-slate-600 border-slate-300'
                      }`}>
                        {ph.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium leading-snug">{ph.objective}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                      <span className="text-[9px] uppercase font-black text-slate-400 block">Hitos Clave</span>
                      <ul className="text-[11px] space-y-1 list-disc list-inside text-slate-700 leading-snug">
                        {ph.keyMilestones.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>

                    <div className="p-2.5 bg-white rounded-xl border border-indigo-200 space-y-1 flex flex-col justify-center">
                      <span className="text-[9px] uppercase font-black text-indigo-700 block">Meta Principal (KPI)</span>
                      <p className="text-slate-800 font-bold text-xs leading-snug">{ph.targetKpi}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 14: AUDITORÍA & TRAZABILIDAD FINANCIERA */}
      {activeTab === 'trazabilidad' && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Registro de Auditoría & Trazabilidad Financiera
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Historial inmutable de modificaciones de precios, costos, supuestos y escenarios por usuario y fecha.
                </p>
              </div>
              {renderClassificationTag('[A] Dato real')}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 uppercase text-[9px] font-black border-y border-slate-200">
                    <th className="p-3">Fecha / Hora</th>
                    <th className="p-3">Usuario Autorizado</th>
                    <th className="p-3">Parámetro / Cambio</th>
                    <th className="p-3">Tipo de Dato</th>
                    <th className="p-3">Justificación Registrada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('es-CO')}
                      </td>
                      <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">{log.userEmail}</td>
                      <td className="p-3 font-medium text-slate-900">{log.parameterName}</td>
                      <td className="p-3">{renderClassificationTag(log.dataClassification)}</td>
                      <td className="p-3 text-slate-600 max-w-xs leading-snug">{log.justification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL: EDITAR PARÁMETROS DE ESCENARIO FINANCIERO */}
      {isEditingScenarioModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Ajustar Parámetros: {editScenarioForm.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium">Modifique las variables del escenario para recalcular en vivo.</p>
              </div>
              <button 
                onClick={() => setIsEditingScenarioModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScenarioEdits} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Número de Clientes:</label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={editScenarioForm.numClients}
                    onChange={e => setEditScenarioForm({ ...editScenarioForm, numClients: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Colaboradores promedio / Cliente:</label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={editScenarioForm.avgColaboradoresPerClient}
                    onChange={e => setEditScenarioForm({ ...editScenarioForm, avgColaboradoresPerClient: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Base Mensual (COP):</label>
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    value={editScenarioForm.monthlyBasePricePerClient}
                    onChange={e => setEditScenarioForm({ ...editScenarioForm, monthlyBasePricePerClient: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio por Colaborador Mensual (COP):</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={editScenarioForm.monthlyPricePerColaborador}
                    onChange={e => setEditScenarioForm({ ...editScenarioForm, monthlyPricePerColaborador: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarifa Setup / Implementación (COP):</label>
                  <input
                    type="number"
                    min="0"
                    step="100000"
                    value={editScenarioForm.implementationFeePerClient}
                    onChange={e => setEditScenarioForm({ ...editScenarioForm, implementationFeePerClient: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Inversión Inicial One-Time (COP):</label>
                  <input
                    type="number"
                    min="0"
                    step="1000000"
                    value={editScenarioForm.oneTimeInitialInvestment}
                    onChange={e => setEditScenarioForm({ ...editScenarioForm, oneTimeInitialInvestment: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <span className="font-black text-slate-900 text-xs block">Costos Operativos Mensuales (OPEX):</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-[10px] text-slate-600 block">Infraestructura Cloud:</label>
                    <input
                      type="number"
                      value={editScenarioForm.monthlyInfraCost}
                      onChange={e => setEditScenarioForm({ ...editScenarioForm, monthlyInfraCost: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block">Tokens IA API:</label>
                    <input
                      type="number"
                      value={editScenarioForm.monthlyAITokenCost}
                      onChange={e => setEditScenarioForm({ ...editScenarioForm, monthlyAITokenCost: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block">Soporte Técnico:</label>
                    <input
                      type="number"
                      value={editScenarioForm.monthlySupportCost}
                      onChange={e => setEditScenarioForm({ ...editScenarioForm, monthlySupportCost: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block">Ingeniería / Dev:</label>
                    <input
                      type="number"
                      value={editScenarioForm.monthlyDevCost}
                      onChange={e => setEditScenarioForm({ ...editScenarioForm, monthlyDevCost: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block">Comercial / Mkt:</label>
                    <input
                      type="number"
                      value={editScenarioForm.monthlyCommercialCost}
                      onChange={e => setEditScenarioForm({ ...editScenarioForm, monthlyCommercialCost: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-600 block">Otros Gastos:</label>
                    <input
                      type="number"
                      value={editScenarioForm.monthlyOtherCost}
                      onChange={e => setEditScenarioForm({ ...editScenarioForm, monthlyOtherCost: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl border border-slate-200 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-3 space-y-1">
                <label className="font-bold text-slate-700 block">Justificación del Cambio (Auditoría obligatoria):</label>
                <input
                  type="text"
                  placeholder="Ej. Calibración de supuestos tras cotización de servidores cloud"
                  value={scenarioEditJustification}
                  onChange={e => setScenarioEditJustification(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditingScenarioModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar & Auditar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MODAL: EDITAR TARIFAS DE PLANES COMERCIALES */}
      {isEditingPlansModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in text-left">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base font-display">
                  Editar Tarifas de Referencia de Planes Comerciales
                </h3>
                <p className="text-xs text-slate-500 font-medium">Ajuste los valores de referencia para el modelo de monetización.</p>
              </div>
              <button 
                onClick={() => setIsEditingPlansModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlansEdits} className="space-y-4 text-xs">
              {editingPlansList.map((p, idx) => (
                <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-black text-slate-900">{p.name}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">Tarifa Mensual (COP):</label>
                      <input
                        type="number"
                        step="50000"
                        value={p.monthlyPriceRef}
                        onChange={e => {
                          const updated = [...editingPlansList];
                          updated[idx].monthlyPriceRef = Number(e.target.value);
                          setEditingPlansList(updated);
                        }}
                        className="w-full p-2 rounded-xl border border-slate-200 font-mono text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 block">Tarifa Anual (COP):</label>
                      <input
                        type="number"
                        step="100000"
                        value={p.annualPriceRef}
                        onChange={e => {
                          const updated = [...editingPlansList];
                          updated[idx].annualPriceRef = Number(e.target.value);
                          setEditingPlansList(updated);
                        }}
                        className="w-full p-2 rounded-xl border border-slate-200 font-mono text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Justificación del Cambio de Precios:</label>
                <input
                  type="text"
                  placeholder="Ej. Revisión anual de precios por ajuste inflacionario"
                  value={plansEditJustification}
                  onChange={e => setPlansEditJustification(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditingPlansModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Tarifas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
