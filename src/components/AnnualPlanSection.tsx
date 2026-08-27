import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardList, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Calendar, 
  User, 
  Activity as ActivityIcon, 
  Star, 
  AlertCircle,
  Flame,
  Printer,
  FileSpreadsheet,
  Grid,
  List,
  Compass
} from 'lucide-react';
import { DemographicsData } from '../types';
import { generateAnnualPlan, PlanProgram } from '../utils/annualPlanGenerator';
import { useEmpresa } from '../modules/configuracion/useEmpresa';

interface AnnualPlanSectionProps {
  data: DemographicsData;
}

export default function AnnualPlanSection({ data }: AnnualPlanSectionProps) {
  const { config } = useEmpresa();
  const companyName = config?.nombreEmpresa || 'la empresa';
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string>('todos');

  const plan = useMemo(() => {
    return generateAnnualPlan(data);
  }, [data]);

  const { diagnosticoGeneral, objetivoGeneral, objetivosEspecificos, programs } = plan;

  // Filter programs based on priority selector
  const filteredPrograms = useMemo(() => {
    if (selectedPriority === 'todos') return programs;
    return programs.filter(p => p.priority.toLowerCase() === selectedPriority.toLowerCase());
  }, [programs, selectedPriority]);

  const toggleExpandProgram = (name: string) => {
    setExpandedProgramId(prev => (prev === name ? null : name));
  };

  // Color helper for badges and card accents
  const getColorClasses = (color: string) => {
    switch (color) {
      case 'rose':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-100',
          accent: 'border-rose-500',
          text: 'text-rose-600',
          bullet: 'bg-rose-500',
          lightBg: 'bg-rose-50/30'
        };
      case 'indigo':
        return {
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
          accent: 'border-indigo-500',
          text: 'text-indigo-600',
          bullet: 'bg-indigo-500',
          lightBg: 'bg-indigo-50/30'
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
          accent: 'border-emerald-500',
          text: 'text-emerald-600',
          bullet: 'bg-emerald-500',
          lightBg: 'bg-emerald-50/30'
        };
      case 'amber':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-100',
          accent: 'border-amber-500',
          text: 'text-amber-600',
          bullet: 'bg-amber-500',
          lightBg: 'bg-amber-50/30'
        };
      case 'teal':
        return {
          bg: 'bg-teal-50 text-teal-700 border-teal-100',
          accent: 'border-teal-500',
          text: 'text-teal-600',
          bullet: 'bg-teal-500',
          lightBg: 'bg-teal-50/30'
        };
      case 'cyan':
        return {
          bg: 'bg-cyan-50 text-cyan-700 border-cyan-100',
          accent: 'border-cyan-500',
          text: 'text-cyan-600',
          bullet: 'bg-cyan-500',
          lightBg: 'bg-cyan-50/30'
        };
      case 'violet':
        return {
          bg: 'bg-violet-50 text-violet-700 border-violet-100',
          accent: 'border-violet-500',
          text: 'text-violet-600',
          bullet: 'bg-violet-500',
          lightBg: 'bg-violet-50/30'
        };
      case 'orange':
        return {
          bg: 'bg-orange-50 text-orange-700 border-orange-100',
          accent: 'border-orange-500',
          text: 'text-orange-600',
          bullet: 'bg-orange-500',
          lightBg: 'bg-orange-50/30'
        };
      case 'slate':
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-100',
          accent: 'border-slate-500',
          text: 'text-slate-600',
          bullet: 'bg-slate-500',
          lightBg: 'bg-slate-50/30'
        };
      case 'sky':
        return {
          bg: 'bg-sky-50 text-sky-700 border-sky-100',
          accent: 'border-sky-500',
          text: 'text-sky-600',
          bullet: 'bg-sky-500',
          lightBg: 'bg-sky-50/30'
        };
      case 'fuchsia':
        return {
          bg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
          accent: 'border-fuchsia-500',
          text: 'text-fuchsia-600',
          bullet: 'bg-fuchsia-500',
          lightBg: 'bg-fuchsia-50/30'
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-100',
          accent: 'border-slate-500',
          text: 'text-slate-600',
          bullet: 'bg-slate-500',
          lightBg: 'bg-slate-50/30'
        };
    }
  };

  const getPriorityBadge = (prio: 'Alta' | 'Media' | 'Baja') => {
    switch (prio) {
      case 'Alta':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'Media':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Baja':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    }
  };

  // Modern Export / Print PDF Handler
  const handlePrintPDF = () => {
    // We can use native window.print() but styled beautifully via dynamic CSS print media query.
    // Create a special stylesheet for print so the layout looks like a professional SG-SST official document
    const printStyle = document.createElement('style');
    printStyle.id = 'print-sst-style';
    printStyle.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
        }
        #print-content, #print-content * {
          visibility: visible;
        }
        #print-content {
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
        .print-page-break {
          page-break-after: always;
        }
        .print-card {
          border: 1px solid #ddd !important;
          border-radius: 8px !important;
          padding: 15px !important;
          margin-bottom: 20px !important;
          page-break-inside: avoid;
        }
      }
    `;
    document.head.appendChild(printStyle);
    
    // Launch printer
    window.print();
    
    // Cleanup style after print dialog closes
    setTimeout(() => {
      const existing = document.getElementById('print-sst-style');
      if (existing) existing.remove();
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* Printable Area Wrapper */}
      <div id="print-content" className="space-y-8">
        
        {/* 1. Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5 no-print">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <ClipboardList className="w-4.5 h-4.5" />
              </span>
              <span className="text-[10px] uppercase font-black tracking-wider text-indigo-600">Módulo de Planificación</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display text-slate-900 tracking-tight">
              Plan Anual SG-SST Inteligente
            </h2>
            <p className="text-[11px] text-slate-400 font-semibold">
              Estrategia y programas preventivos personalizados creados a partir de la matriz sociodemográfica del BPO.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Exportar Plan a PDF</span>
            </button>
          </div>
        </div>

        {/* PRINT ONLY HEADER */}
        <div className="hidden print:block border-b-2 border-slate-900 pb-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase">{companyName}</h1>
              <p className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Plan Anual de Seguridad y Salud en el Trabajo (SG-SST)</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-500">FECHA GENERACIÓN: {new Date().toLocaleDateString()}</p>
              <p className="text-[10px] font-bold text-slate-500">POBLACIÓN TOTAL: {data.totalEmployees || 1240} colaboradores</p>
            </div>
          </div>
        </div>

        {/* 2. Diagnostic & Objectives Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Diagnostic Card */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-wider">
                <Compass className="w-4.5 h-4.5" />
                <span>Diagnóstico Sociodemográfico Base</span>
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed text-justify">
                {diagnosticoGeneral}
              </p>
            </div>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400 font-bold">
              <AlertCircle className="w-4 h-4 text-indigo-500" />
              <span>Diagnóstico automatizado sin sesgos manuales.</span>
            </div>
          </div>

          {/* Goals Card */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-2xs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-xs uppercase tracking-wider">
                <Target className="w-4.5 h-4.5" />
                <span>Objetivos Generales & Específicos</span>
              </div>
              
              <div className="space-y-3.5">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div className="text-[10px] uppercase font-black tracking-wider text-slate-400 mb-1">Objetivo General</div>
                  <p className="text-xs text-slate-800 font-extrabold leading-relaxed">{objetivoGeneral}</p>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] uppercase font-black tracking-wider text-slate-400">Objetivos Específicos Priorizados</div>
                  <div className="space-y-1.5">
                    {objetivosEspecificos.map((obj, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs font-semibold text-slate-600">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <p className="leading-relaxed">{obj}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* PRINT PAGE BREAK */}
        <div className="print-page-break" />

        {/* 3. Filter and View Control */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 no-print bg-slate-50 border border-slate-100 p-4 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-500">Filtrar por Prioridad:</span>
            <div className="flex gap-1">
              {['todos', 'alta', 'media', 'baja'].map(prio => (
                <button
                  key={prio}
                  onClick={() => setSelectedPriority(prio)}
                  className={`px-3 py-1 text-[10px] font-extrabold uppercase rounded-lg border cursor-pointer transition-all ${
                    selectedPriority === prio
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {prio}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                viewMode === 'grid' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg border cursor-pointer transition-all ${
                viewMode === 'list' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4. Programs Content Grid / List */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 font-display flex items-center gap-2 print:text-lg">
            <Sparkles className="w-4.5 h-4.5 text-amber-500 print:hidden" />
            <span>Portafolio de Programas Priorizados ({filteredPrograms.length})</span>
          </h3>

          {viewMode === 'grid' ? (
            /* Grid View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPrograms.map((prog, idx) => {
                const isExpanded = expandedProgramId === prog.name;
                const colors = getColorClasses(prog.color);

                return (
                  <div 
                    key={idx}
                    className={`bg-white border-t-4 ${colors.accent} border border-slate-200/60 rounded-3xl p-5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-xs print-card print:border-t-2`}
                  >
                    <div className="space-y-4">
                      {/* Badge and Priority */}
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${colors.bg}`}>
                          {prog.name}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${getPriorityBadge(prog.priority)}`}>
                          Prioridad {prog.priority}
                        </span>
                      </div>

                      {/* Header */}
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-slate-900 font-display">{prog.name}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold italic">Justificación: {prog.justification}</p>
                      </div>

                      {/* Objective */}
                      <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                        <span className="text-[9px] uppercase font-bold text-indigo-500 tracking-wider">Objetivo del Programa</span>
                        <p className="text-xs text-slate-700 font-semibold mt-0.5 leading-relaxed">{prog.objective}</p>
                      </div>

                      {/* Expandible Activities & Details (Always visible on print) */}
                      <div className={`space-y-3.5 pt-3 border-t border-slate-50 ${isExpanded ? 'block' : 'hidden print:block'}`}>
                        {/* Activities List */}
                        <div className="space-y-2">
                          <span className="text-[9px] uppercase font-bold text-indigo-500 tracking-wider">Cronograma de Actividades</span>
                          <div className="space-y-1.5">
                            {prog.activities.map((act, aIdx) => (
                              <div key={aIdx} className="flex items-start gap-2 text-xs font-semibold text-slate-600">
                                <span className={`w-1.5 h-1.5 rounded-full ${colors.bullet} mt-1.5 shrink-0`} />
                                <p className="leading-relaxed">{act}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Metadata Details */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600">
                          <div className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">Resp: {prog.responsible}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>Freq: {prog.frequency}</span>
                          </div>
                          <div className="col-span-2 border-t border-slate-200/50 pt-1.5 mt-1">
                            <div className="flex items-center gap-1 text-slate-500">
                              <ActivityIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">Ind: {prog.indicator}</span>
                            </div>
                            <div className="flex justify-between mt-0.5 text-indigo-600 font-extrabold text-[11px]">
                              <span>Meta de Cobertura:</span>
                              <span>{prog.goal}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expand Trigger Button (Hidden in print) */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end no-print">
                      <button
                        onClick={() => toggleExpandProgram(prog.name)}
                        className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                      >
                        <span>{isExpanded ? 'Ocultar Detalles' : 'Ver Detalles'}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            /* List View */
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-2xs overflow-hidden print:border-none">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                      <th className="py-3.5 px-6">Programa</th>
                      <th className="py-3.5 px-6">Prioridad</th>
                      <th className="py-3.5 px-6">Responsable / Frecuencia</th>
                      <th className="py-3.5 px-6">Indicador de Medición</th>
                      <th className="py-3.5 px-6 text-center">Meta</th>
                      <th className="py-3.5 px-6 text-right no-print">Detalles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-600">
                    {filteredPrograms.map((prog, idx) => {
                      const isExpanded = expandedProgramId === prog.name;
                      const colors = getColorClasses(prog.color);

                      return (
                        <React.Fragment key={idx}>
                          <tr 
                            onClick={() => toggleExpandProgram(prog.name)}
                            className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                          >
                            <td className="py-4 px-6 font-bold text-slate-900">
                              <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${colors.bullet}`} />
                                <span>{prog.name}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${getPriorityBadge(prog.priority)}`}>
                                {prog.priority}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-[11px]">
                              <div>{prog.responsible}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase">{prog.frequency}</div>
                            </td>
                            <td className="py-4 px-6 text-[11px] text-slate-500 font-medium max-w-xs truncate">{prog.indicator}</td>
                            <td className="py-4 px-6 text-center font-bold text-indigo-600 font-mono text-[11px]">{prog.goal}</td>
                            <td className="py-4 px-6 text-right no-print">
                              <button className="text-slate-400 hover:text-indigo-600">
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded list view row */}
                          <AnimatePresence>
                            {(isExpanded || window.matchMedia('print').matches) && (
                              <tr className={`${!isExpanded ? 'hidden print:table-row' : ''}`}>
                                <td colSpan={6} className="bg-slate-50/50 p-6 border-t border-b border-slate-100">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                      <div className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">Justificación del Programa</div>
                                      <p className="text-xs text-slate-600 leading-relaxed text-justify">{prog.justification}</p>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="text-[10px] uppercase font-black text-indigo-600 tracking-wider">Plan de Actividades Propuestas</div>
                                      <div className="space-y-1.5">
                                        {prog.activities.map((act, aIdx) => (
                                          <div key={aIdx} className="flex items-center gap-2 font-semibold text-slate-700">
                                            <span className={`w-1.5 h-1.5 rounded-full ${colors.bullet} shrink-0`} />
                                            <span>{act}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </AnimatePresence>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 5. Printable Footer Signatures (Print Only) */}
        <div className="hidden print:grid grid-cols-2 gap-12 mt-16 pt-12 border-t-2 border-slate-200 text-center text-xs font-bold text-slate-700">
          <div className="space-y-12">
            <div className="h-0.5 bg-slate-300 w-48 mx-auto" />
            <div>
              <p className="uppercase">Responsable del SG-SST / COPASST</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase">Firma de conformidad y aprobación</p>
            </div>
          </div>
          <div className="space-y-12">
            <div className="h-0.5 bg-slate-300 w-48 mx-auto" />
            <div>
              <p className="uppercase">Representante Legal / Gerencia</p>
              <p className="text-[10px] font-medium text-slate-400 uppercase">Firma de conformidad y aprobación</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
