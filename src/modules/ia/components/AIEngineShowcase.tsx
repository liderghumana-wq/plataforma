import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Sliders, Play, TrendingUp, AlertTriangle, CheckCircle, ShieldAlert, Target, ClipboardList, HelpCircle, FileText, Download, Copy, Share2, ClipboardCheck, Layers
} from 'lucide-react';
import { IAIndicator, AIEngineResponse } from '../types/aiEngine.types';
import { AIEngine } from '../services/aiEngine';

// Predefined Simulation templates to showcase the AI engine
const SIMULATION_TEMPLATES = [
  {
    id: 'crisis_liderazgo',
    name: 'Alerta de Liderazgo y Fuga de Talento',
    description: 'Bajo liderazgo y compensaciones deficientes, con riesgo crítico de desvinculación.',
    indicators: [
      { id: 'ind_liderazgo', name: 'Eficacia del Liderazgo de Mandos Medios', value: 48, dimension: 'Liderazgo', description: 'Confianza en supervisores directos.', previousValue: 56 },
      { id: 'ind_comunicacion', name: 'Claridad en Comunicación Estratégica', value: 54, dimension: 'Comunicación', description: 'Entendimiento de metas anuales.', previousValue: 62 },
      { id: 'ind_compensacion', name: 'Equidad en Compensación y Beneficios', value: 42, dimension: 'Compensación', description: 'Competitividad salarial externa.', previousValue: 40 },
      { id: 'ind_psicologia', name: 'Seguridad Psicológica del Equipo', value: 68, dimension: 'Cultura', description: 'Libertad de expresión y fallos cooperativos.', previousValue: 70 },
      { id: 'ind_desarrollo', name: 'Perspectivas de Desarrollo y Plan de Carrera', value: 72, dimension: 'Desarrollo', description: 'Crecimiento interno visible.', previousValue: 65 }
    ]
  },
  {
    id: 'burnout_riesgo',
    name: 'Alto Rendimiento con Riesgo de Burnout',
    description: 'Altos niveles de entrega y metas claras, pero con alarmas críticas en balance de vida.',
    indicators: [
      { id: 'ind_liderazgo', name: 'Eficacia del Liderazgo de Mandos Medios', value: 81, dimension: 'Liderazgo', description: 'Confianza en supervisores directos.', previousValue: 78 },
      { id: 'ind_comunicacion', name: 'Claridad en Comunicación Estratégica', value: 88, dimension: 'Comunicación', description: 'Entendimiento de metas anuales.', previousValue: 80 },
      { id: 'ind_compensacion', name: 'Equidad en Compensación y Beneficios', value: 74, dimension: 'Compensación', description: 'Competitividad salarial externa.', previousValue: 72 },
      { id: 'ind_psicologia', name: 'Seguridad Psicológica del Equipo', value: 75, dimension: 'Cultura', description: 'Libertad de expresión y fallos cooperativos.', previousValue: 77 },
      { id: 'ind_desarrollo', name: 'Equilibrio de Carga y Vida Laboral', value: 45, dimension: 'Bienestar', description: 'Work-life balance y salud mental.', previousValue: 55 }
    ]
  },
  {
    id: 'cultura_saludable',
    name: 'Ambiente de Alto Desempeño y Clima Saludable',
    description: 'Niveles ideales alineados en todas las dimensiones corporativas.',
    indicators: [
      { id: 'ind_liderazgo', name: 'Eficacia del Liderazgo de Mandos Medios', value: 84, dimension: 'Liderazgo', description: 'Confianza en supervisores directos.', previousValue: 80 },
      { id: 'ind_comunicacion', name: 'Claridad en Comunicación Estratégica', value: 82, dimension: 'Comunicación', description: 'Entendimiento de metas anuales.', previousValue: 79 },
      { id: 'ind_compensacion', name: 'Equidad en Compensación y Beneficios', value: 79, dimension: 'Compensación', description: 'Competitividad salarial externa.', previousValue: 75 },
      { id: 'ind_psicologia', name: 'Seguridad Psicológica del Equipo', value: 88, dimension: 'Cultura', description: 'Libertad de expresión y fallos cooperativos.', previousValue: 85 },
      { id: 'ind_desarrollo', name: 'Perspectivas de Desarrollo y Plan de Carrera', value: 81, dimension: 'Desarrollo', description: 'Crecimiento interno visible.', previousValue: 81 }
    ]
  }
];

export default function AIEngineShowcase() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('crisis_liderazgo');
  
  // Local state for indicators list to let user customize values with sliders
  const [indicators, setIndicators] = useState<IAIndicator[]>(() => {
    return JSON.parse(JSON.stringify(SIMULATION_TEMPLATES[0].indicators));
  });

  const [companyName, setCompanyName] = useState<string>('TecnoCorp S.A.S.');
  const [segmentName, setSegmentName] = useState<string>('División de Operaciones');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Sync templates selection
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = SIMULATION_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setIndicators(JSON.parse(JSON.stringify(template.indicators)));
    }
  };

  const handleSliderChange = (id: string, value: number) => {
    setIndicators(prev => 
      prev.map(ind => ind.id === id ? { ...ind, value } : ind)
    );
  };

  // Live trigger the AIEngine analysis on indicators updates
  const analysisResult: AIEngineResponse = useMemo(() => {
    return AIEngine.analyze(indicators, { companyName, segment: segmentName });
  }, [indicators, companyName, segmentName]);

  const handleCopyReport = () => {
    try {
      const textToCopy = `=== DIAGNÓSTICO INTELIGENCIA ARTIFICIAL AIENGINE ===
Fecha: ${analysisResult.timestamp}
Organización: ${companyName}
Segmento: ${segmentName}

RESUMEN EJECUTIVO:
${analysisResult.resumenEjecutivo}

HALLAZGOS CLAVE:
${analysisResult.hallazgos.map((h, i) => `${i + 1}. ${h}`).join('\n')}

RIESGOS DETECTADOS:
${analysisResult.riesgos.map((r, i) => `⚠ ${r}`).join('\n')}

FORTALEZAS:
${analysisResult.fortalezas.map((f, i) => `⭐ ${f}`).join('\n')}

RECOMENDACIONES ESTRATÉGICAS:
${analysisResult.recomendaciones.map((rec, i) => `▪ ${rec}`).join('\n')}

PRIORIDADES DE INTERVENCIÓN:
${analysisResult.prioridades.map((p, i) => `${p}`).join('\n')}
`;
      navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction Banner */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1.5 text-left z-10 max-w-2xl">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
              SERVICIOS CENTRALES DE IA
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black font-display tracking-tight">Motor de Inteligencia Artificial (AIEngine)</h1>
          <p className="text-xs text-slate-300 font-semibold leading-relaxed">
            Arquitectura centralizada de IA diseñada para cualquier módulo del sistema. Recibe cualquier conjunto dinámico de indicadores numéricos y genera análisis de hallazgos, fortalezas, riesgos y planes de acción con trazabilidad en tiempo real.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0 z-10">
          <button
            onClick={handleCopyReport}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-3xs text-slate-100 cursor-pointer"
          >
            {isCopied ? (
              <>
                <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Informe</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Two Column Layout: Controllers on left, AI Analysis report on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CONTROL BOARD (SLIDERS & SETTINGS) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Preset Templates */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs text-left space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Escenarios de Simulación</label>
            <div className="flex flex-col gap-2">
              {SIMULATION_TEMPLATES.map(tmpl => (
                <button
                  key={tmpl.id}
                  onClick={() => handleTemplateSelect(tmpl.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedTemplateId === tmpl.id
                      ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900'
                      : 'border-slate-150 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-black">{tmpl.name}</h4>
                    {selectedTemplateId === tmpl.id && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed">
                    {tmpl.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Context metadata settings */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs text-left space-y-4">
            <h3 className="text-xs font-black text-slate-700 font-display uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Metadatos de Contexto</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
              <div>
                <label className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block mb-1">Nombre de Empresa</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[9px] font-bold uppercase tracking-wider block mb-1">Segmento / Filtro</label>
                <input
                  type="text"
                  value={segmentName}
                  onChange={e => setSegmentName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Interactive Sliders list */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs text-left space-y-4">
            <h3 className="text-xs font-black text-slate-700 font-display uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Sliders className="w-4 h-4 text-indigo-500" />
              <span>Consola de Indicadores</span>
            </h3>

            <div className="space-y-4">
              {indicators.map(ind => (
                <div key={ind.id} className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs font-bold">
                    <span className="text-slate-700 truncate max-w-[200px]" title={ind.name}>{ind.name}</span>
                    <span className={`font-mono px-2 py-0.5 rounded text-[10px] font-black ${
                      ind.value < 65 ? 'bg-red-50 text-red-700 border border-red-100' :
                      ind.value < 75 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    }`}>
                      {ind.value}%
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ind.value}
                      onChange={e => handleSliderChange(ind.id, Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                      {ind.dimension}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI REPORT VIEWER */}
        <div className="lg:col-span-7 space-y-6 text-left">
          
          {/* Executive Summary Card */}
          <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-3xs space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-44 h-44 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Resumen Ejecutivo Generativo</span>
              </div>
              <span className="text-[9px] text-slate-400 font-bold font-mono">Generado: {analysisResult.timestamp}</span>
            </div>

            <div className="text-sm font-semibold text-slate-700 leading-relaxed bg-indigo-50/10 p-4 rounded-2xl border border-indigo-50/20">
              {analysisResult.resumenEjecutivo}
            </div>
          </div>

          {/* Strengths & Risks Split */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Fortalezas (Emerald) */}
            <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-3xs space-y-3">
              <h3 className="text-xs font-black text-emerald-800 font-display uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-emerald-50">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Fortalezas Identificadas</span>
              </h3>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                {analysisResult.fortalezas.map((fortaleza, i) => (
                  <li key={i} className="flex gap-2 items-start bg-emerald-50/10 p-2 rounded-xl border border-emerald-50/20">
                    <span className="text-emerald-500 font-black shrink-0">•</span>
                    <span>{fortaleza}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Riesgos (Rose/Red) */}
            <div className="bg-white p-5 rounded-3xl border border-rose-100 shadow-3xs space-y-3">
              <h3 className="text-xs font-black text-rose-800 font-display uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-rose-50">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Riesgos de Desgaste</span>
              </h3>
              <ul className="space-y-2 text-xs font-semibold text-slate-600">
                {analysisResult.riesgos.map((riesgo, i) => (
                  <li key={i} className="flex gap-2 items-start bg-rose-50/10 p-2 rounded-xl border border-rose-50/20">
                    <span className="text-rose-500 font-black shrink-0">⚠</span>
                    <span>{riesgo}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Findings, Trends and Strategic Priorities Tab system */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
            <h3 className="text-xs font-black text-slate-700 font-display uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Target className="w-4 h-4 text-indigo-500" />
              <span>Prioridades y Hallazgos Analíticos</span>
            </h3>

            <div className="space-y-4 text-xs font-semibold">
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Prioridades de Intervención Rápida</span>
                <div className="grid gap-2">
                  {analysisResult.prioridades.map((prioridad, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span>{prioridad}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Hallazgos Operativos</span>
                <ul className="space-y-2 text-slate-600 font-semibold list-disc pl-4">
                  {analysisResult.hallazgos.map((hallazgo, idx) => (
                    <li key={idx} className="leading-relaxed">{hallazgo}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Tendencias y Desviaciones</span>
                <div className="space-y-2">
                  {analysisResult.tendencias.map((tendencia, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-indigo-50/10 border border-indigo-50 text-[11px] text-indigo-950 font-bold flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{tendencia}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Plan Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-3xs space-y-4">
            <h3 className="text-xs font-black text-slate-700 font-display uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <ClipboardList className="w-4 h-4 text-indigo-500" />
              <span>Plan de Acción Sugerido</span>
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-150">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                    <th className="p-3">Tarea de Mitigación</th>
                    <th className="p-3">Responsable</th>
                    <th className="p-3">Plazo</th>
                    <th className="p-3 text-right">Prioridad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {analysisResult.planDeAccion.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-slate-400 font-bold">
                        No hay tareas en el plan de acción actual.
                      </td>
                    </tr>
                  ) : (
                    analysisResult.planDeAccion.map((step, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3 font-bold text-slate-800 text-[11px]">{step.task}</td>
                        <td className="p-3 text-slate-500 text-[11px]">{step.responsible}</td>
                        <td className="p-3 font-mono text-[10px] text-slate-400 font-bold">{step.timeframe}</td>
                        <td className="p-3 text-right">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${
                            step.priority === 'Alta' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                            step.priority === 'Media' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {step.priority}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
