import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  Printer, 
  ShieldAlert, 
  Users, 
  DollarSign, 
  Calendar, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Compass, 
  ArrowRight,
  RefreshCw,
  Sliders,
  Info,
  Maximize2,
  Minimize2,
  ChevronRight,
  FileText
} from 'lucide-react';
import { DemographicsData } from '../types';
import { runSimulation, SimulationVariables, PredictionMetrics, ImpactMatrixItem } from '../utils/predictiveEngine';
import { useEmpresa } from '../modules/configuracion/useEmpresa';

interface PredictiveIntelligenceSectionProps {
  data: DemographicsData;
}

export default function PredictiveIntelligenceSection({ data }: PredictiveIntelligenceSectionProps) {
  const { config } = useEmpresa();
  const companyName = config?.nombreEmpresa || 'la empresa';
  
  // 1. Interactive Sliders / Toggles state
  const [variables, setVariables] = useState<SimulationVariables>({
    aumentoPersonal: 15, // default simulation of 15% growth
    disminucionRotacion: -20, // default target -20% rotation reduction
    incrementoAntiguedad: 0.8, // 0.8 years retention increase
    porcentajeTeletrabajo: 45, // 45% virtual
    contratacionJoven: 35, // 35% younger hires
    contratacionMayores50: 12, // 12% elder hires
    aumentoHijos: 42, // 42% kids
    nivelEducativo: 'profesional',
    nuevasSedes: 'intermedias'
  });

  const [activeTab, setActiveTab] = useState<'indicadores' | 'matriz' | 'recomendaciones'>('indicadores');
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  // 2. Recalculate simulation dynamically
  const simulation = useMemo(() => {
    return runSimulation(data, variables);
  }, [data, variables]);

  const { metrics, matrix, recommendations, financial, totalEmployeesCurrent, totalEmployeesSimulated } = simulation;

  // 3. Reset Handler
  const handleReset = () => {
    setVariables({
      aumentoPersonal: 0,
      disminucionRotacion: 0,
      incrementoAntiguedad: 0,
      porcentajeTeletrabajo: 30, // baseline
      contratacionJoven: 30,
      contratacionMayores50: 5,
      aumentoHijos: data.hasChildrenPercentage || 38,
      nivelEducativo: 'básico',
      nuevasSedes: 'grandes'
    });
  };

  // Helper for formatting COP Currency
  const formatCOP = (num: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(num);
  };

  // Modern Export / Print PDF Handler
  const handlePrintPDF = () => {
    const printStyle = document.createElement('style');
    printStyle.id = 'print-predictive-style';
    printStyle.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #predictive-print-content, #predictive-print-content * {
          visibility: visible;
        }
        #predictive-print-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background: white !important;
          color: black !important;
          font-family: Arial, sans-serif;
          padding: 20px;
        }
        .no-print {
          display: none !important;
        }
        .print-matrix-cell {
          border: 1px solid #ddd !important;
          background-color: #fcfcfc !important;
        }
        .print-card {
          border: 1px solid #eee !important;
          padding: 15px !important;
          margin-bottom: 15px !important;
          page-break-inside: avoid;
        }
      }
    `;
    document.head.appendChild(printStyle);
    window.print();
    setTimeout(() => {
      const existing = document.getElementById('print-predictive-style');
      if (existing) existing.remove();
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* 1. Header and Meta Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Sparkles className="w-4.5 h-4.5" />
            </span>
            <span className="text-[10px] uppercase font-black tracking-wider text-indigo-600">Simulación Inteligente</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display text-slate-900 tracking-tight">
            🔮 Inteligencia Predictiva SG-SST
          </h2>
          <p className="text-[11px] text-slate-400 font-semibold">
            Modifica las variables operativas de tu BPO para simular el impacto en ausentismo, bienestar, accidentalidad y riesgos psicosociales en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black rounded-xl cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Baseline</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-2xs cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Exportar Simulación a PDF</span>
          </button>
        </div>
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-6 mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase">{companyName}</h1>
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Informe de Simulación y Análisis Predictivo de Riesgos SG-SST</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500">FECHA GENERACIÓN: {new Date().toLocaleDateString()}</p>
            <p className="text-[10px] font-bold text-slate-500">PROYECTADO CON BASE EN EXCEL CARGADO</p>
          </div>
        </div>
      </div>

      {/* Main Print Wrapper */}
      <div id="predictive-print-content" className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* ==================== 2. LEFT COLUMN: CONTROLS & SLIDERS (NO PRINT) ==================== */}
        <div className="xl:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-2xs space-y-6 no-print">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <h3 className="font-extrabold text-sm text-slate-900 font-display">Variables del Escenario</h3>
          </div>

          <div className="space-y-5">
            {/* Slide 1: Aumento de personal */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Aumento de Personal:</span>
                <span className="font-mono font-extrabold text-indigo-600">{variables.aumentoPersonal > 0 ? `+${variables.aumentoPersonal}%` : `${variables.aumentoPersonal}%`}</span>
              </div>
              <input
                type="range"
                min="-50"
                max="100"
                step="5"
                value={variables.aumentoPersonal}
                onChange={(e) => setVariables({ ...variables, aumentoPersonal: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>Disminución (-50%)</span>
                <span>Estable (0%)</span>
                <span>Duplicar (+100%)</span>
              </div>
            </div>

            {/* Slide 2: Disminución de rotación */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Disminución de Rotación:</span>
                <span className="font-mono font-extrabold text-indigo-600">{variables.disminucionRotacion}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="0"
                step="5"
                value={variables.disminucionRotacion}
                onChange={(e) => setVariables({ ...variables, disminucionRotacion: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>Mitigar Rotación (-50%)</span>
                <span>Mantener Actual (0%)</span>
              </div>
            </div>

            {/* Slide 3: Incremento de antigüedad */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Retención de Talento (Años):</span>
                <span className="font-mono font-extrabold text-indigo-600">+{variables.incrementoAntiguedad} años</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.2"
                value={variables.incrementoAntiguedad}
                onChange={(e) => setVariables({ ...variables, incrementoAntiguedad: parseFloat(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>0 años (Actual)</span>
                <span>+5 años de antigüedad promedio</span>
              </div>
            </div>

            {/* Slide 4: Mayor porcentaje de teletrabajo */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Porcentaje en Teletrabajo:</span>
                <span className="font-mono font-extrabold text-indigo-600">{variables.porcentajeTeletrabajo}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={variables.porcentajeTeletrabajo}
                onChange={(e) => setVariables({ ...variables, porcentajeTeletrabajo: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>Presencial (0%)</span>
                <span>Híbrido</span>
                <span>100% Virtual</span>
              </div>
            </div>

            {/* Slide 5: Personal joven */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Contratación Joven (&lt;24):</span>
                <span className="font-mono font-extrabold text-indigo-600">{variables.contratacionJoven}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={variables.contratacionJoven}
                onChange={(e) => setVariables({ ...variables, contratacionJoven: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>Baja (0%)</span>
                <span>Alta (100%)</span>
              </div>
            </div>

            {/* Slide 6: Personal mayor de 50 */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-600">Contratación Mayor (&gt;50):</span>
                <span className="font-mono font-extrabold text-indigo-600">{variables.contratacionMayores50}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={variables.contratacionMayores50}
                onChange={(e) => setVariables({ ...variables, contratacionMayores50: parseInt(e.target.value) })}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                <span>0%</span>
                <span>Foco Senior (100%)</span>
              </div>
            </div>

            {/* Dropdown Options */}
            <div className="grid grid-cols-1 gap-3.5 pt-3 border-t border-slate-100">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Ajuste Nivel Educativo</label>
                <select
                  value={variables.nivelEducativo}
                  onChange={(e: any) => setVariables({ ...variables, nivelEducativo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="básico">Básico (Bachiller/Técnicos predominantemente)</option>
                  <option value="profesional">Profesional (Profesionales/Especializados)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Distribución Geográfica (Sedes)</label>
                <select
                  value={variables.nuevasSedes}
                  onChange={(e: any) => setVariables({ ...variables, nuevasSedes: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="grandes">Grandes Urbes (Bogotá, Medellín - Mayor congestión)</option>
                  <option value="intermedias">Ciudades Intermedias (Menor desplazamiento y estrés)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== 3. RIGHT COLUMN: PREDICTIONS, MATRIX, RECOMMENDATIONS ==================== */}
        <div className="xl:col-span-8 space-y-8">
          
          {/* A. Financial Executive Panel Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs flex flex-col justify-between print-card">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Ahorro Estimado</span>
              <div className="my-2 text-sm md:text-base font-black text-emerald-600 font-mono tracking-tight">
                {formatCOP(financial.ahorroEstimado)}
              </div>
              <span className="text-[9px] text-slate-400 font-bold">Retención & ausencias</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs flex flex-col justify-between print-card">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Retorno ROI</span>
              <div className="my-2 text-base font-black text-indigo-600 font-mono tracking-tight">
                {financial.retornoEsperado}x
              </div>
              <span className="text-[9px] text-slate-400 font-bold">Por peso invertido</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs flex flex-col justify-between print-card">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Nivel Impacto</span>
              <div className="my-2">
                <span className={`inline-flex px-2 py-0.5 text-[9px] font-black uppercase rounded-md border ${
                  financial.nivelImpacto === 'Alto' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-700 border-slate-100'
                }`}>
                  {financial.nivelImpacto}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-bold">Estrategia anual</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs flex flex-col justify-between print-card">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Prioridad</span>
              <div className="my-2">
                <span className={`inline-flex px-2 py-0.5 text-[9px] font-black uppercase rounded-md border ${
                  financial.prioridad === 'Crítica' || financial.prioridad === 'Alta' 
                    ? 'bg-red-50 text-red-700 border-red-100' 
                    : 'bg-amber-50 text-amber-700 border-amber-100'
                }`}>
                  {financial.prioridad}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-bold">Acción requerida</span>
            </div>

            <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/60 shadow-2xs flex flex-col justify-between print-card">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Implementación</span>
              <div className="my-2 text-xs font-black text-slate-800">
                {financial.tiempoImplementacion}
              </div>
              <span className="text-[9px] text-slate-400 font-bold">Planificación</span>
            </div>

          </div>

          {/* Tab Selection (No print) */}
          <div className="flex border-b border-slate-100 gap-1.5 no-print">
            <button
              onClick={() => setActiveTab('indicadores')}
              className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider relative cursor-pointer ${
                activeTab === 'indicadores' ? 'text-indigo-600 font-black' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>Predicción de Impacto</span>
              {activeTab === 'indicadores' && (
                <motion.div layoutId="activePredictiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('matriz')}
              className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider relative cursor-pointer ${
                activeTab === 'matriz' ? 'text-indigo-600 font-black' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>Matriz de Clasificación</span>
              {activeTab === 'matriz' && (
                <motion.div layoutId="activePredictiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('recomendaciones')}
              className={`pb-2.5 px-4 text-xs font-bold uppercase tracking-wider relative cursor-pointer ${
                activeTab === 'recomendaciones' ? 'text-indigo-600 font-black' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <span>Recomendaciones de IA</span>
              {activeTab === 'recomendaciones' && (
                <motion.div layoutId="activePredictiveTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />
              )}
            </button>
          </div>

          {/* ==================== CONTENT SECTIONS ==================== */}
          <div className="space-y-6">
            
            {/* Tab 1: PREDICCIÓN DE IMPACTO (Always visible in print) */}
            <div className={`space-y-6 ${activeTab === 'indicadores' ? 'block' : 'hidden print:block'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {Object.entries(metrics).map(([key, item]: [string, any]) => {
                  const isPositive = key === 'bienestar' || key === 'estabilidadLaboral' || key === 'climaLaboral' 
                    ? item.diff >= 0 
                    : item.diff <= 0;

                  return (
                    <div 
                      key={key}
                      onMouseEnter={() => setHoveredMetric(key)}
                      onMouseLeave={() => setHoveredMetric(null)}
                      className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-2xs hover:border-indigo-100 transition-colors flex flex-col justify-between print-card"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                            {key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                          </h4>
                          <p className="text-xs text-slate-800 font-extrabold mt-1">{item.text}</p>
                        </div>

                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded-lg border ${
                          isPositive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                        }`}>
                          {item.diff > 0 ? `+${item.diff}` : item.diff}
                          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        </span>
                      </div>

                      {/* Meter bar comparison */}
                      <div className="mt-4 pt-3 border-t border-slate-50 space-y-2">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>Actual: <b className="font-mono">{item.current}%</b></span>
                          <span className="text-indigo-600">Proyectado: <b className="font-mono">{item.simulated}%</b></span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden relative">
                          {/* Baseline marker */}
                          <div 
                            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10" 
                            style={{ left: `${item.current}%` }}
                          />
                          {/* Simulated bar */}
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              isPositive ? 'bg-indigo-500' : 'bg-slate-500'
                            }`}
                            style={{ width: `${item.simulated}%` }}
                          />
                        </div>
                      </div>

                    </div>
                  );
                })}

              </div>
            </div>

            {/* Tab 2: MATRIZ DE IMPACTO (Always visible in print) */}
            <div className={`space-y-6 ${activeTab === 'matriz' ? 'block' : 'hidden print:block'}`}>
              <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-2xs space-y-6 print-card">
                <div>
                  <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">Matriz de Probabilidad e Impacto del Escenario</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">
                    Visualización y clasificación matricial automática de los riesgos del escenario modelado actualmente.
                  </p>
                </div>

                {/* 3x3 Matrix Grid Layout */}
                <div className="grid grid-cols-12 gap-2">
                  
                  {/* Y-Axis Label */}
                  <div className="col-span-1 flex flex-col justify-around items-center text-[10px] font-black uppercase text-slate-400 tracking-wider select-none shrink-0 border-r border-slate-100 pr-1 py-4">
                    <span className="transform -rotate-90 origin-center text-center whitespace-nowrap">Impacto</span>
                  </div>

                  {/* Matrix Content Area */}
                  <div className="col-span-11 grid grid-cols-3 gap-2 text-center text-xs">
                    
                    {/* Header Probability Labels */}
                    <div className="col-span-3 grid grid-cols-3 gap-2 text-[10px] font-black uppercase text-slate-400 tracking-wider select-none mb-1">
                      <span>Probabilidad Baja</span>
                      <span>Probabilidad Media</span>
                      <span>Probabilidad Alta</span>
                    </div>

                    {/* Matrix Cells */}
                    {/* Row 1: High Impact */}
                    <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-4 min-h-24 flex flex-col justify-center items-center print-matrix-cell relative">
                      <span className="absolute top-1 left-2 text-[8px] uppercase text-slate-300 font-black">Impacto Alto</span>
                      {matrix.filter(m => m.impacto === 'Alta' && m.probabilidad === 'Baja').map((m, idx) => (
                        <span key={idx} className="bg-amber-100 text-amber-800 border border-amber-200 font-extrabold text-[9px] px-2 py-0.5 rounded-full mt-1">{m.scenarioName}</span>
                      ))}
                    </div>
                    <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-4 min-h-24 flex flex-col justify-center items-center print-matrix-cell relative">
                      <span className="absolute top-1 left-2 text-[8px] uppercase text-slate-300 font-black">Impacto Alto</span>
                      {matrix.filter(m => m.impacto === 'Alta' && m.probabilidad === 'Media').map((m, idx) => (
                        <span key={idx} className="bg-orange-100 text-orange-800 border border-orange-200 font-extrabold text-[9px] px-2 py-0.5 rounded-full mt-1">{m.scenarioName}</span>
                      ))}
                    </div>
                    <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 min-h-24 flex flex-col justify-center items-center print-matrix-cell relative">
                      <span className="absolute top-1 left-2 text-[8px] uppercase text-red-300 font-black">Impacto Alto</span>
                      {matrix.filter(m => m.impacto === 'Alta' && m.probabilidad === 'Alta').map((m, idx) => (
                        <span key={idx} className="bg-red-600 text-white font-extrabold text-[9px] px-2 py-1 rounded-xl shadow-2xs mt-1 animate-pulse">{m.scenarioName}</span>
                      ))}
                    </div>

                    {/* Row 2: Medium Impact */}
                    <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-4 min-h-24 flex flex-col justify-center items-center print-matrix-cell relative">
                      <span className="absolute top-1 left-2 text-[8px] uppercase text-slate-300 font-black">Impacto Medio</span>
                      {matrix.filter(m => m.impacto === 'Media' && m.probabilidad === 'Baja').map((m, idx) => (
                        <span key={idx} className="bg-slate-200 text-slate-700 font-extrabold text-[9px] px-2 py-0.5 rounded-full mt-1">{m.scenarioName}</span>
                      ))}
                    </div>
                    <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-4 min-h-24 flex flex-col justify-center items-center print-matrix-cell relative">
                      <span className="absolute top-1 left-2 text-[8px] uppercase text-slate-300 font-black">Impacto Medio</span>
                      {matrix.filter(m => m.impacto === 'Media' && m.probabilidad === 'Media').map((m, idx) => (
                        <span key={idx} className="bg-indigo-100 text-indigo-800 border border-indigo-200 font-extrabold text-[9px] px-2 py-0.5 rounded-full mt-1">{m.scenarioName}</span>
                      ))}
                    </div>
                    <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-4 min-h-24 flex flex-col justify-center items-center print-matrix-cell relative">
                      <span className="absolute top-1 left-2 text-[8px] uppercase text-slate-300 font-black">Impacto Medio</span>
                      {matrix.filter(m => m.impacto === 'Media' && m.probabilidad === 'Alta').map((m, idx) => (
                        <span key={idx} className="bg-indigo-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-full mt-1">{m.scenarioName}</span>
                      ))}
                    </div>

                    {/* Row 3: Low Impact */}
                    <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-4 min-h-24 flex flex-col justify-center items-center print-matrix-cell relative">
                      <span className="absolute top-1 left-2 text-[8px] uppercase text-slate-300 font-black">Impacto Bajo</span>
                      {matrix.filter(m => m.impacto === 'Baja' && m.probabilidad === 'Baja').map((m, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 font-extrabold text-[9px] px-2 py-0.5 rounded-full mt-1">{m.scenarioName}</span>
                      ))}
                    </div>
                    <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-4 min-h-24 flex flex-col justify-center items-center print-matrix-cell relative">
                      <span className="absolute top-1 left-2 text-[8px] uppercase text-slate-300 font-black">Impacto Bajo</span>
                      {matrix.filter(m => m.impacto === 'Baja' && m.probabilidad === 'Media').map((m, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 font-extrabold text-[9px] px-2 py-0.5 rounded-full mt-1">{m.scenarioName}</span>
                      ))}
                    </div>
                    <div className="bg-slate-50 border border-slate-100/80 rounded-xl p-4 min-h-24 flex flex-col justify-center items-center print-matrix-cell relative">
                      <span className="absolute top-1 left-2 text-[8px] uppercase text-slate-300 font-black">Impacto Bajo</span>
                      {matrix.filter(m => m.impacto === 'Baja' && m.probabilidad === 'Alta').map((m, idx) => (
                        <span key={idx} className="bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-[9px] px-2 py-0.5 rounded-full mt-1">{m.scenarioName}</span>
                      ))}
                    </div>

                  </div>
                </div>

                {/* Footnote details */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3 text-xs font-semibold text-slate-500">
                  <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0 mt-0.5" />
                  <p>
                    La matriz clasifica los riesgos dinámicos en base a correlaciones estadísticas calculadas directamente del Excel. Los escenarios críticos (zona roja) demandan acciones de remediación inmediatas incluidas en el Plan Anual SG-SST.
                  </p>
                </div>
              </div>
            </div>

            {/* Tab 3: RECOMENDACIONES ESTRATÉGICAS (Always visible in print) */}
            <div className={`space-y-6 ${activeTab === 'recomendaciones' ? 'block' : 'hidden print:block'}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Fortalecer */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs space-y-4 print-card">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>Programas a Fortalecer</span>
                  </div>
                  <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
                    {recommendations.fortalecer.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Eliminar / Rediseñar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs space-y-4 print-card">
                  <div className="flex items-center gap-2 text-slate-500 font-black text-xs uppercase tracking-wider">
                    <TrendingDown className="w-4.5 h-4.5" />
                    <span>Programas a Reemplazar / Optimizar</span>
                  </div>
                  <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
                    {recommendations.eliminar.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Inversión de Recursos */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs space-y-4 print-card">
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-wider">
                    <DollarSign className="w-4.5 h-4.5" />
                    <span>Dónde Invertir Recursos</span>
                  </div>
                  <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
                    {recommendations.invertirRecursos.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 4. Indicadores a Vigilar */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs space-y-4 print-card">
                  <div className="flex items-center gap-2 text-amber-600 font-black text-xs uppercase tracking-wider">
                    <Activity className="w-4.5 h-4.5" />
                    <span>Indicadores de Alerta Temprana</span>
                  </div>
                  <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
                    {recommendations.vigilarIndicadores.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 5. Riesgos Incrementados */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs space-y-4 print-card">
                  <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4.5 h-4.5" />
                    <span>Riesgos Proyectados al Alza</span>
                  </div>
                  <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
                    {recommendations.riesgosAumentaran.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 6. Beneficios Obtenidos */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-2xs space-y-4 print-card">
                  <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>Beneficios Organizacionales Clave</span>
                  </div>
                  <ul className="space-y-2.5 text-xs font-semibold text-slate-600">
                    {recommendations.beneficiosObtenidos.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Printable Footer Signatures (Print Only) */}
      <div className="hidden print:grid grid-cols-2 gap-12 mt-16 pt-12 border-t-2 border-slate-200 text-center text-xs font-bold text-slate-700">
        <div className="space-y-12">
          <div className="h-0.5 bg-slate-300 w-48 mx-auto" />
          <div>
            <p className="uppercase">Director de Seguridad y Salud en el Trabajo</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase">Firma del Simulador Predictivo IA</p>
          </div>
        </div>
        <div className="space-y-12">
          <div className="h-0.5 bg-slate-300 w-48 mx-auto" />
          <div>
            <p className="uppercase">Gerente General de {companyName}</p>
            <p className="text-[10px] font-medium text-slate-400 uppercase">Firma de conformidad y aprobación del escenario</p>
          </div>
        </div>
      </div>

    </div>
  );
}
