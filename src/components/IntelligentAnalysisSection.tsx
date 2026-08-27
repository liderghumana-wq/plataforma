import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Sparkles, 
  Search, 
  Filter, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert,
  Users, 
  Briefcase, 
  Home, 
  GraduationCap, 
  Heart, 
  FileText, 
  Baby, 
  Accessibility, 
  Globe, 
  Layers, 
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { DemographicsData } from '../types';
import { analyzeDemographics, AnalysisCard } from '../utils/intelligentAnalyzer';

interface IntelligentAnalysisSectionProps {
  data: DemographicsData;
}

export default function IntelligentAnalysisSection({ data }: IntelligentAnalysisSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Alto' | 'Medio' | 'Bajo'>('All');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const analysisCards = useMemo(() => {
    return analyzeDemographics(data);
  }, [data]);

  const filteredCards = useMemo(() => {
    return analysisCards.filter(card => {
      const matchesSearch = card.variableName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            card.finding.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'All' || card.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [analysisCards, searchTerm, riskFilter]);

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getVariableIcon = (variable: string) => {
    const v = variable.toLowerCase();
    if (v.includes('edad')) return <Users className="w-5 h-5" />;
    if (v.includes('género') || v.includes('genero')) return <Users className="w-5 h-5" />;
    if (v.includes('antigüedad') || v.includes('antiguedad')) return <Clock className="w-5 h-5" />;
    if (v.includes('educat') || v.includes('escolar')) return <GraduationCap className="w-5 h-5" />;
    if (v.includes('civil')) return <Heart className="w-5 h-5" />;
    if (v.includes('contrato')) return <FileText className="w-5 h-5" />;
    if (v.includes('hijo')) return <Baby className="w-5 h-5" />;
    if (v.includes('discapacidad')) return <Accessibility className="w-5 h-5" />;
    if (v.includes('étnic') || v.includes('etnic')) return <Globe className="w-5 h-5" />;
    if (v.includes('vivienda')) return <Home className="w-5 h-5" />;
    if (v.includes('estrato')) return <Layers className="w-5 h-5" />;
    if (v.includes('departamento') || v.includes('ciudad') || v.includes('geográf')) return <MapPin className="w-5 h-5" />;
    return <Brain className="w-5 h-5" />;
  };

  const getRiskColors = (riskLevel: 'Alto' | 'Medio' | 'Bajo') => {
    switch (riskLevel) {
      case 'Alto':
        return {
          border: 'border-rose-200/80',
          bg: 'bg-rose-50/50 hover:bg-rose-50',
          accent: 'bg-rose-100 text-rose-700',
          iconColor: 'text-rose-600',
          text: 'text-rose-950',
          badge: '🔴 Riesgo Alto',
          glow: 'shadow-rose-100/30'
        };
      case 'Medio':
        return {
          border: 'border-amber-200/80',
          bg: 'bg-amber-50/40 hover:bg-amber-50/60',
          accent: 'bg-amber-100 text-amber-800',
          iconColor: 'text-amber-600',
          text: 'text-amber-950',
          badge: '🟡 Riesgo Medio',
          glow: 'shadow-amber-100/30'
        };
      case 'Bajo':
        return {
          border: 'border-emerald-200/80',
          bg: 'bg-emerald-50/35 hover:bg-emerald-50/50',
          accent: 'bg-emerald-100 text-emerald-700',
          iconColor: 'text-emerald-600',
          text: 'text-emerald-950',
          badge: '🟢 Riesgo Bajo',
          glow: 'shadow-emerald-100/30'
        };
    }
  };

  const getPriorityBadgeColor = (priority: 'Alta' | 'Media' | 'Baja') => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-500 text-white';
      case 'Media':
        return 'bg-amber-500 text-slate-950';
      case 'Baja':
        return 'bg-slate-200 text-slate-800';
    }
  };

  const countsByRisk = useMemo(() => {
    return {
      total: analysisCards.length,
      alto: analysisCards.filter(c => c.riskLevel === 'Alto').length,
      medio: analysisCards.filter(c => c.riskLevel === 'Medio').length,
      bajo: analysisCards.filter(c => c.riskLevel === 'Bajo').length,
    };
  }, [analysisCards]);

  return (
    <div id="analisis-inteligente-container" className="space-y-8 animate-fade-in">
      
      {/* HEADER SECTION: TITULO & CONTROLES */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
        <div className="absolute top-0 right-0 w-[35%] h-[100%] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-400/25">
            <Brain className="w-3.5 h-3.5 text-cyan-400" />
            <span>Motor de Caracterización Avanzada</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-white flex items-center gap-2">
            Análisis Inteligente del Personal
          </h2>
          <p className="text-xs text-slate-300 font-medium max-w-2xl leading-relaxed">
            Evaluación dinámica automatizada de las 12 dimensiones clave sociodemográficas. Identifica de forma autónoma vulnerabilidades, riesgos operacionales e intervenciones prioritarias del SG-SST alimentado exclusivamente de los datos de su nómina.
          </p>
        </div>

        <div className="flex gap-2 shrink-0 flex-wrap">
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-center min-w-[70px]">
            <p className="text-[9px] text-slate-400 uppercase font-black">🔴 Alto</p>
            <p className="text-lg font-black text-rose-400 mt-0.5">{countsByRisk.alto}</p>
          </div>
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-center min-w-[70px]">
            <p className="text-[9px] text-slate-400 uppercase font-black">🟡 Medio</p>
            <p className="text-lg font-black text-amber-400 mt-0.5">{countsByRisk.medio}</p>
          </div>
          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-center min-w-[70px]">
            <p className="text-[9px] text-slate-400 uppercase font-black">🟢 Bajo</p>
            <p className="text-lg font-black text-emerald-400 mt-0.5">{countsByRisk.bajo}</p>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-3xs flex flex-col sm:flex-row justify-between gap-4 items-center">
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por variable, hallazgo o riesgo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-300 focus:bg-white text-xs font-semibold rounded-xl outline-hidden transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto justify-end">
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5" />
            Filtrar:
          </span>
          <button
            onClick={() => setRiskFilter('All')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border ${
              riskFilter === 'All'
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Todos ({countsByRisk.total})
          </button>
          <button
            onClick={() => setRiskFilter('Alto')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border ${
              riskFilter === 'Alto'
                ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                : 'bg-white border-slate-200 text-rose-600 hover:bg-rose-50'
            }`}
          >
            🔴 Alto ({countsByRisk.alto})
          </button>
          <button
            onClick={() => setRiskFilter('Medio')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border ${
              riskFilter === 'Medio'
                ? 'bg-amber-500 border-amber-500 text-slate-950 shadow-xs'
                : 'bg-white border-slate-200 text-amber-700 hover:bg-slate-50'
            }`}
          >
            🟡 Medio ({countsByRisk.medio})
          </button>
          <button
            onClick={() => setRiskFilter('Bajo')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer border ${
              riskFilter === 'Bajo'
                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                : 'bg-white border-slate-200 text-emerald-700 hover:bg-slate-50'
            }`}
          >
            🟢 Bajo ({countsByRisk.bajo})
          </button>
        </div>
      </div>

      {/* GRID DE TARJETAS DE ANÁLISIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCards.length > 0 ? (
            filteredCards.map((card, index) => {
              const colors = getRiskColors(card.riskLevel);
              const isExpanded = !!expandedCards[card.id];
              
              return (
                <motion.div
                  key={card.id}
                  layoutId={`card-${card.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
                  className={`bg-white rounded-3xl border ${colors.border} ${colors.bg} p-6 flex flex-col justify-between shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-350 relative overflow-hidden`}
                >
                  {/* Glowing background hint */}
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none ${
                    card.riskLevel === 'Alto' ? 'bg-rose-500' : card.riskLevel === 'Medio' ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />

                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl bg-white border ${colors.border} ${colors.iconColor} shadow-3xs`}>
                          {getVariableIcon(card.variableName)}
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            {card.categoryName}
                          </span>
                          <h4 className="text-sm font-black text-slate-900 font-display leading-tight">
                            {card.variableName}
                          </h4>
                        </div>
                      </div>
                      
                      {/* Risk Badge */}
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white border ${colors.border} ${colors.iconColor} shadow-3xs`}>
                        {colors.badge}
                      </span>
                    </div>

                    {/* Content Blocks */}
                    <div className="space-y-3 pt-2 text-left">
                      {/* 1. Hallazgo */}
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                          Hallazgo
                        </p>
                        <p className="text-xs text-slate-800 font-bold leading-relaxed">
                          {card.finding}
                        </p>
                      </div>

                      {/* 2. Posible Riesgo */}
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Riesgo Asociado
                        </p>
                        <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                          {card.risk}
                        </p>
                      </div>

                      {/* 3. Oportunidad de Intervención */}
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Oportunidad de Intervención
                        </p>
                        <p className="text-xs text-slate-700 font-semibold leading-relaxed">
                          {card.intervention}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Section & Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-200/50 flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-4">
                      {/* Priority Indicator */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Prioridad:
                        </span>
                        <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest ${getPriorityBadgeColor(card.priority)}`}>
                          {card.priority}
                        </span>
                      </div>

                      {/* Expand / Collapse Details Button */}
                      <button
                        onClick={() => toggleExpand(card.id)}
                        className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>{isExpanded ? 'Ocultar Distribución' : 'Ver Distribución Real'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Expanded Content Drawer */}
                    <AnimatePresence>
                      {isExpanded && card.details && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden bg-slate-50/50 rounded-2xl border border-slate-200/50 p-3 mt-1.5"
                        >
                          <div className="space-y-2 text-left">
                            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">
                              Distribución Porcentual y Métrica en Excel
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {card.details.map((detail, dIdx) => (
                                <div key={dIdx} className="bg-white border border-slate-100 rounded-lg p-2 flex flex-col">
                                  <span className="text-[10px] text-slate-500 font-bold truncate">
                                    {detail.label}
                                  </span>
                                  <span className="text-xs font-black text-slate-800 font-mono">
                                    {detail.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-white border border-slate-200 rounded-3xl space-y-3">
              <Info className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-extrabold text-slate-800">No se encontraron resultados</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                Prueba buscando otra palabra clave o cambia los filtros de nivel de riesgo arriba.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
