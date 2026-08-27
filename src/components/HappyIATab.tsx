import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Smile, 
  Clock, 
  TrendingUp, 
  ShieldAlert, 
  ClipboardList, 
  GraduationCap, 
  User, 
  Baby, 
  Activity, 
  Layers, 
  HeartHandshake, 
  Search, 
  Filter, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle, 
  ThumbsUp, 
  Brain, 
  Info,
  ChevronDown,
  ChevronUp,
  Scale,
  FileCheck,
  BookOpen,
  HelpCircle,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { DemographicsData } from '../types';
import { analyzeCompany, IntelligentFinding } from '../utils/happyAI';
import { getComplianceResponse } from '../utils/complianceEngine';
import { useEmpresa } from '../modules/configuracion/useEmpresa';

interface HappyIATabProps {
  data: DemographicsData | null;
}

export default function HappyIATab({ data }: HappyIATabProps) {
  const { config } = useEmpresa();
  const companyName = config.nombreEmpresa || 'Mi Empresa';
  const logoUrl = config.logo;

  const [activeSubTab, setActiveSubTab] = useState<'sociodemografico' | 'normativo'>('sociodemografico');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'Todas' | 'Alta' | 'Media' | 'Baja'>('Todas');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Estados para el modo Cumplimiento Normativo
  const [complianceQuestion, setComplianceQuestion] = useState('¿Qué exige ISO 45001 para estos resultados?');
  const [customQuestionText, setCustomQuestionText] = useState('');

  // Analizar la empresa utilizando los datos del Excel pasados de manera reactiva
  const report = useMemo(() => {
    if (!data) return null;
    return analyzeCompany(data);
  }, [data]);

  // Ejecutar consulta de cumplimiento normativo reactivamente cuando cambia la pregunta o los datos del Excel
  const complianceResult = useMemo(() => {
    if (!data) return null;
    return getComplianceResponse(data, complianceQuestion);
  }, [data, complianceQuestion]);

  if (!data || !report) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-2xl mx-auto my-12">
        <Sparkles className="w-16 h-16 text-indigo-500 mb-4 animate-pulse" />
        <h3 className="text-xl font-black text-slate-900 font-display">Esperando base de datos activa</h3>
        <p className="text-sm text-slate-500 font-semibold max-w-sm mt-2 leading-relaxed">
          Por favor, carga el consolidado sociodemográfico de la encuesta de tu personal en la sección de "Cargar Excel" para activar el Consultor Inteligente de SG-SST (Asistente IA).
        </p>
      </div>
    );
  }

  // Filtrar los hallazgos basados en la búsqueda del usuario y la prioridad seleccionada (para sub-tab sociodemográfico)
  const filteredFindings = report.findings.filter(finding => {
    const matchesSearch = finding.variable.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          finding.finding.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'Todas' || finding.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  // Obtener estadísticas de prioridad para los contadores
  const priorityCounts = report.findings.reduce((acc, curr) => {
    acc[curr.priority] = (acc[curr.priority] || 0) + 1;
    return acc;
  }, { Alta: 0, Media: 0, Baja: 0 });

  // Sugerencias de preguntas para el consultor normativo
  const complianceSuggestions = [
    "¿Qué exige ISO 45001 para estos resultados?",
    "¿Qué numeral debo fortalecer?",
    "¿Qué evidencia debo presentar?",
    "¿Qué programa debo actualizar?"
  ];

  // Manejar el envío de una consulta personalizada
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customQuestionText.trim()) {
      setComplianceQuestion(customQuestionText);
    }
  };

  // Función auxiliar para renderizar los iconos específicos por variable
  const getVariableIcon = (variable: string) => {
    switch (variable) {
      case 'Edad': return <Clock className="w-4 h-4 text-indigo-600" />;
      case 'Sexo': return <User className="w-4 h-4 text-pink-600" />;
      case 'Antigüedad': return <TrendingUp className="w-4 h-4 text-emerald-600" />;
      case 'Escolaridad': return <GraduationCap className="w-4 h-4 text-cyan-600" />;
      case 'Estrato': return <Layers className="w-4 h-4 text-amber-600" />;
      case 'Ciudad': return <Activity className="w-4 h-4 text-purple-600" />;
      case 'Estado civil': return <HeartHandshake className="w-4 h-4 text-rose-600" />;
      case 'Tipo de contrato': return <ClipboardList className="w-4 h-4 text-blue-600" />;
      case 'Hijos': return <Baby className="w-4 h-4 text-violet-600" />;
      case 'Discapacidad': return <ShieldAlert className="w-4 h-4 text-red-600" />;
      case 'Actividad física': return <Activity className="w-4 h-4 text-teal-600" />;
      case 'Participación': return <Smile className="w-4 h-4 text-orange-600" />;
      case 'IMC': return <Info className="w-4 h-4 text-indigo-600" />;
      case 'Enfermedades': return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'Molestias osteomusculares': return <AlertCircle className="w-4 h-4 text-red-600" />;
      default: return <Brain className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* 1. SECCIÓN: BIENVENIDA DEL CONSULTOR */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[35%] h-[100%] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>Consultor Experto en SG-SST</span>
          </div>
          {logoUrl && (
            <img src={logoUrl} alt="Logo Empresa" className="h-10 max-w-[150px] object-contain rounded bg-white/10 p-1 border border-white/10" referrerPolicy="no-referrer" />
          )}
        </div>
        
        <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight leading-tight">
          Asistente de IA: Conclusiones de {companyName}
        </h2>
        <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed max-w-3xl">
          El motor ha analizado en tiempo real el consolidado del censo sociodemográfico de **{companyName}**, cruzando variables clínicas, de salud, familiares, de contratación y hábitos de bienestar. Utiliza este módulo consultivo dinámico para auditar el diagnóstico y verificar el cumplimiento legal.
        </p>

        {/* SUB-TAB SELECTOR (PILLS) */}
        <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-800/60 mt-4">
          <button
            onClick={() => setActiveSubTab('sociodemografico')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'sociodemografico'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/80 border border-slate-850'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Diagnóstico Sociodemográfico</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('normativo')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'normativo'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/80 border border-slate-850'
            }`}
          >
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Cumplimiento Normativo (ISO 45001 / Decreto 1072)</span>
          </button>
        </div>
      </div>

      {/* RENDERIZADO CONDICIONAL DE SUB-TABS */}
      
      {activeSubTab === 'sociodemografico' ? (
        <>
          {/* A. RESUMEN EJECUTIVO DE CONTROL */}
          <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-extrabold text-slate-900 text-sm md:text-base font-display">Resumen Ejecutivo de Indicadores</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Total Colaboradores</span>
                <span className="text-lg md:text-2xl font-black text-slate-900 font-display mt-2">
                  {report.executiveSummary.totalEmployees}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Edad Promedio</span>
                <span className="text-lg md:text-2xl font-black text-slate-900 font-display mt-2">
                  {report.executiveSummary.averageAge} <span className="text-xs font-semibold text-slate-500">años</span>
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Antigüedad Promedio</span>
                <span className="text-lg md:text-2xl font-black text-slate-900 font-display mt-2">
                  {report.executiveSummary.averageSeniority} <span className="text-xs font-semibold text-slate-500">años</span>
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Participación Activa</span>
                <span className="text-lg md:text-2xl font-black text-slate-900 font-display mt-2">
                  {report.executiveSummary.activeParticipation}%
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Ausentismo Médico</span>
                <span className="text-lg md:text-2xl font-black text-slate-900 font-display mt-2 text-rose-600">
                  {report.executiveSummary.absenteeismRate}%
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Índice Bienestar</span>
                <span className="text-lg md:text-2xl font-black text-slate-900 font-display mt-2 text-indigo-600">
                  {report.executiveSummary.wellbeingIndex}%
                </span>
              </div>
            </div>
          </div>

          {/* B. HALLAZGOS INTELIGENTES */}
          <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-2.5">
                <Brain className="w-5 h-5 text-indigo-600" />
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base font-display">Hallazgos Sociodemográficos y Clínicos</h3>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">Diagnóstico sistemático dinámico de las 15 dimensiones clave.</p>
                </div>
              </div>

              {/* Quick Counter Badges */}
              <div className="flex gap-1.5 self-start sm:self-center">
                <span className="bg-rose-50 text-rose-700 font-bold text-[10px] px-2.5 py-1 rounded-full border border-rose-100">
                  {priorityCounts.Alta} Alertas Altas
                </span>
                <span className="bg-amber-50 text-amber-700 font-bold text-[10px] px-2.5 py-1 rounded-full border border-amber-100">
                  {priorityCounts.Media} Medias
                </span>
                <span className="bg-emerald-50 text-emerald-700 font-bold text-[10px] px-2.5 py-1 rounded-full border border-emerald-100">
                  {priorityCounts.Baja} Bajas
                </span>
              </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar variable o hallazgo (ej. IMC, Edad, Dolor...)..."
                  className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400 font-medium"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Filter className="w-4 h-4 text-slate-400" />
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value as any)}
                  className="bg-slate-50 hover:bg-slate-100 text-xs px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-700 cursor-pointer"
                >
                  <option value="Todas">Todas las prioridades</option>
                  <option value="Alta">Prioridad: Alta</option>
                  <option value="Media">Prioridad: Media</option>
                  <option value="Baja">Prioridad: Baja</option>
                </select>
              </div>
            </div>

            {/* Grid of the 15 variables */}
            {filteredFindings.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No se encontraron hallazgos que coincidan con la búsqueda o filtro seleccionado.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredFindings.map((finding) => {
                  const isExpanded = expandedCard === finding.variable;
                  return (
                    <div 
                      key={finding.variable}
                      className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                        isExpanded 
                          ? 'border-indigo-500 bg-indigo-50/10 shadow-sm' 
                          : 'border-slate-150 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="p-5 space-y-4">
                        {/* Card Header */}
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-slate-100 rounded-lg">
                              {getVariableIcon(finding.variable)}
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-sm font-display">{finding.variable}</h4>
                          </div>

                          <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                            finding.priority === 'Alta' 
                              ? 'bg-rose-50 text-rose-700 border-rose-200' 
                              : finding.priority === 'Media'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {finding.priority}
                          </span>
                        </div>

                        {/* Findings content */}
                        <div className="space-y-3 text-xs leading-normal">
                          <div>
                            <span className="block font-black text-[9px] uppercase tracking-wider text-slate-400 mb-1">Hallazgo</span>
                            <p className="text-slate-800 font-semibold">{finding.finding}</p>
                          </div>

                          {/* Collapsible parts for cleaner layout */}
                          {isExpanded && (
                            <div className="space-y-3 pt-2 border-t border-slate-100 animate-fade-in">
                              <div>
                                <span className="block font-black text-[9px] uppercase tracking-wider text-rose-500 mb-1">Riesgo Estimado</span>
                                <p className="text-slate-600 font-medium">{finding.risk}</p>
                              </div>
                              <div>
                                <span className="block font-black text-[9px] uppercase tracking-wider text-emerald-600 mb-1">Oportunidad de Intervención</span>
                                <p className="text-slate-600 font-medium">{finding.opportunity}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Toggle Expand Button */}
                      <div className="px-5 pb-4 pt-1 border-t border-slate-100/60 flex justify-between items-center shrink-0">
                        <button
                          onClick={() => setExpandedCard(isExpanded ? null : finding.variable)}
                          className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>{isExpanded ? 'Ver menos detalles' : 'Ver análisis de riesgos y oportunidades'}</span>
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* C. RECOMENDACIONES AUTORIZADAS (SG-SST) */}
          <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <HeartHandshake className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base font-display">Recomendaciones Automatizadas</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Programas de intervención prioritarios recomendados por el sistema de forma dinámica.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {report.recommendations.map((rec, idx) => (
                <div key={idx} className="bg-slate-50/50 p-5 rounded-2xl border border-slate-150 space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-indigo-100 text-indigo-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                        {rec.category}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        rec.priority === 'Alta' 
                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                          : rec.priority === 'Media'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {rec.priority}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug">{rec.title}</h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">{rec.desc}</p>
                    <div className="pt-2 border-t border-slate-200/50 space-y-1">
                      <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">Justificación Técnica</span>
                      <p className="text-[11px] text-slate-500 font-semibold italic">{rec.justification}</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t border-slate-200/50 flex justify-between items-center text-[11px] text-slate-500">
                    <span className="font-mono">Beneficio: {rec.benefit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* 2. MODO DE CONSULTA: CUMPLIMIENTO NORMATIVO */
        <div className="space-y-8 animate-fade-in">
          
          {/* CONTROL BOX: PREGUNTAS Y CONSULTOR */}
          <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <Scale className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base font-display">Consultorio Legal y Normativo de SG-SST</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Relaciona el Decreto 1072, la Resolución 0312 de 2019 e ISO 45001 con la base de datos de tu organización.</p>
              </div>
            </div>

            {/* SUGGESTION CHIPS (PREGUNTAS SUGERIDAS) */}
            <div className="space-y-2.5">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Preguntas Sugeridas de Auditoría:</span>
              <div className="flex flex-wrap gap-2">
                {complianceSuggestions.map((suggestion, index) => {
                  const isSelected = complianceQuestion === suggestion;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setComplianceQuestion(suggestion);
                        setCustomQuestionText('');
                      }}
                      className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      {suggestion}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CUSTOM INPUT BAR */}
            <form onSubmit={handleCustomSubmit} className="pt-2 border-t border-slate-100">
              <span className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">Realizar Consulta Personalizada sobre Normas de SST:</span>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <HelpCircle className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={customQuestionText}
                    onChange={(e) => setCustomQuestionText(e.target.value)}
                    placeholder="Pregunta libre sobre el Decreto 1072, ISO 45001 o Resolución 0312..."
                    className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white text-xs pl-10 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder-slate-400 font-semibold text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!customQuestionText.trim()}
                  className={`px-5 py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    customQuestionText.trim()
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Consultar Asistente</span>
                </button>
              </div>
            </form>
          </div>

          {/* COMPLIANCE ANSWER CONTAINER */}
          {complianceResult && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              
              {/* LEFT & CENTER: ANSWER AND REFERENCES */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* 1. DIRECT RESPONSE CARD */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-5">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-600" />
                    <span className="bg-indigo-50 text-indigo-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-indigo-100">
                      Análisis Normativo Activo
                    </span>
                  </div>
                  
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pregunta Consultada:</span>
                    <h3 className="font-extrabold text-slate-900 text-base font-display">
                      {complianceResult.question}
                    </h3>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-2 right-2 opacity-5">
                      <Scale className="w-24 h-24 text-slate-900" />
                    </div>
                    <p className="text-xs md:text-sm text-slate-700 font-semibold leading-relaxed whitespace-pre-line relative z-10">
                      {complianceResult.answer}
                    </p>
                  </div>
                </div>

                {/* 2. NORMATIVE REFERENCES GRID */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 md:p-8 shadow-sm space-y-5">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-extrabold text-slate-900 text-sm md:text-base font-display">Correlación de Artículos y Estándares</h4>
                  </div>

                  <div className="space-y-4">
                    {complianceResult.normativeReferences.map((ref, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-150 bg-slate-50/20 hover:border-slate-200 transition-colors space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                            {ref.norm}
                          </span>
                          <span className="text-xs font-extrabold text-indigo-600">
                            {ref.section}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                          {ref.relationship}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* RIGHT SIDEBAR: AUDIT CHECKLISTS */}
              <div className="space-y-6">
                
                {/* 1. ACTIONS */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider font-display">Medidas de Acción Preventiva</h4>
                  </div>
                  <ul className="space-y-3">
                    {complianceResult.actionsToTake.map((action, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 font-semibold leading-relaxed">
                        <span className="bg-emerald-100 text-emerald-800 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. EVIDENCES */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <FileCheck className="w-4.5 h-4.5 text-indigo-600" />
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider font-display">Soportes Exigibles para Auditoría</h4>
                  </div>
                  <ul className="space-y-3">
                    {complianceResult.evidencesToPrepare.map((evidence, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 font-semibold leading-relaxed">
                        <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{evidence}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. PROGRAMS TO UPDATE */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Briefcase className="w-4.5 h-4.5 text-cyan-600" />
                    <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider font-display">Programas de Intervención a Actualizar</h4>
                  </div>
                  <ul className="space-y-3">
                    {complianceResult.programsToUpdate.map((prog, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-slate-600 font-semibold leading-relaxed">
                        <AlertTriangle className="w-4 h-4 text-cyan-500 shrink-0 mt-0.5" />
                        <span className="font-bold text-slate-800">{prog}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
