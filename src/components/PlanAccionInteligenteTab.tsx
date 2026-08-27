import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Brain, 
  Activity, 
  ShieldAlert, 
  Smile, 
  Baby, 
  RefreshCw,
  Clock,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Scale,
  Award,
  Heart,
  TrendingUp,
  ClipboardList,
  GraduationCap,
  Calendar,
  Check,
  Target,
  UserCheck,
  Zap,
  BookOpen,
  Apple
} from 'lucide-react';
import { DemographicsData } from '../types';
import { extractStats } from '../utils/aiRecommender';

interface PlanAccionInteligenteTabProps {
  data: DemographicsData | null;
}

export interface PlanItem {
  program: 'Ergonomía' | 'Riesgo Psicosocial' | 'Medicina Preventiva' | 'Hábitos Saludables' | 'Escuela de Padres' | 'Prevención de Consumo de Sustancias' | 'Liderazgo' | 'Capacitación' | 'Bienestar';
  finding: string;
  objective: string;
  activity: string;
  responsible: string;
  frequency: string;
  indicator: string;
  goal: string;
  priority: 'Alta' | 'Media' | 'Baja';
  estimatedTime: string;
}

export default function PlanAccionInteligenteTab({ data }: PlanAccionInteligenteTabProps) {
  const [selectedProgramFilter, setSelectedProgramFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm max-w-2xl mx-auto my-12 animate-fade-in">
        <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
          <HeartHandshake className="w-8 h-8 text-indigo-500 animate-pulse" />
        </div>
        <h3 className="text-xl font-black text-slate-900 font-display">Esperando base de datos activa</h3>
        <p className="text-xs text-slate-500 font-semibold max-w-md mt-2 leading-relaxed">
          Por favor, carga el archivo Excel sociodemográfico en la sección correspondiente para activar el motor automático de generación del Plan de Acción Inteligente.
        </p>
      </div>
    );
  }

  // Extract real metrics from uploaded Excel
  const stats = extractStats(data);

  // Generate the 9 mandated programs with real Excel data
  const generatePlan = (): PlanItem[] => {
    // Pain parts
    const painPart = stats.primaryPain?.bodyPart || 'Cuello / Hombros';
    const painPercentage = stats.primaryPain?.percentage || 0;
    
    // Kids and families
    const kidsPct = stats.kidsPct || 0;
    const estimatedParentsCount = Math.round((stats.total * kidsPct) / 100);

    // Physical activity
    const sedentaryPct = stats.sedentary || 0;

    // Overweight
    const excessWeightPct = stats.totalExcessWeight || 0;
    const overweightCount = Math.round((stats.total * excessWeightPct) / 100);

    // Free time
    const primaryFreeTimeActivity = stats.primaryFreeTime?.activity || 'Compartir en familia';
    const participationPct = stats.activeParticipationPct || 0;

    // Primary Educational Level
    const primaryEduLevel = stats.primaryEdu?.level || 'Tecnólogo';
    const primaryEduCount = stats.primaryEdu?.count || 0;

    return [
      {
        program: 'Ergonomía',
        finding: `El ${painPercentage}% de la población reporta molestias musculoesqueléticas severas localizadas en la zona de ${painPart}, asociado a posturas sedentarias prolongadas.`,
        objective: `Disminuir y prevenir los trastornos osteomusculares en la zona de ${painPart} del personal operativo.`,
        activity: `Implementar pausas biomecánicas dirigidas de 8 minutos enfocadas en ${painPart}, junto con inspecciones ergonómicas y ajustes en puestos de trabajo de agentes sintomáticos.`,
        responsible: 'Fisioterapeuta Especialista en SST (ARL) & COPASST',
        frequency: 'Diario (2 veces por turno)',
        indicator: '% de reducción en quejas y sintomatología osteomuscular',
        goal: `Reducir a menos del 15% el reporte de molestias en la zona de ${painPart} en un plazo de 6 meses.`,
        priority: painPercentage > 35 ? 'Alta' : 'Media',
        estimatedTime: '3 meses'
      },
      {
        program: 'Riesgo Psicosocial',
        finding: `La nómina reporta un Índice Global de Bienestar del ${stats.wellbeing}% con altos niveles de fatiga laboral por AHT y un ${kidsPct}% asumiendo doble rol por cuidado familiar.`,
        objective: 'Disminuir la prevalencia de fatiga cognitiva, estrés laboral y optimizar el equilibrio trabajo-familia.',
        activity: 'Aplicar la Batería oficial de Riesgo Psicosocial, dictar talleres de primeros auxilios psicológicos y configurar micro-pausas cognitivas virtuales.',
        responsible: 'Psicólogo Especialista en SST & Dirección de Gestión Humana',
        frequency: 'Mensual (Seguimiento continuo)',
        indicator: 'Índice de Clima y Bienestar Organizacional',
        goal: `Elevar el Índice Global de Bienestar al 90% y mitigar las alertas críticas por estrés de operaciones.`,
        priority: stats.wellbeing < 85 ? 'Alta' : 'Media',
        estimatedTime: '4 meses'
      },
      {
        program: 'Medicina Preventiva',
        finding: `Un total de ${overweightCount} colaboradores (${excessWeightPct}% de la nómina) presentan sobrepeso u obesidad, con un promedio general de IMC de ${stats.avgImc.toFixed(1)}.`,
        objective: 'Controlar el riesgo cardiovascular y cardiometabólico de los colaboradores con IMC elevado.',
        activity: 'Campañas de tamizaje clínico presencial (medición de tensión arterial, perfil lipídico y perímetro abdominal de cohorte intervenida) y exámenes médicos periódicos.',
        responsible: 'Médico del Trabajo Especialista en SST / EPS aliada',
        frequency: 'Semestral',
        indicator: '% de colaboradores con tamizaje completo y remisión médica',
        goal: `Asegurar el control médico y metabólico del 100% de los ${overweightCount} colaboradores identificados con riesgo nutricional.`,
        priority: excessWeightPct > 35 ? 'Alta' : 'Media',
        estimatedTime: '6 meses'
      },
      {
        program: 'Hábitos Saludables',
        finding: `El ${sedentaryPct}% de los colaboradores encuestados admite nula o insuficiente actividad física semanal, catalogándolos como población sedentaria.`,
        objective: 'Fomentar la adopción de estilos de vida activos y reducir el sedentarismo en la nómina corporativa.',
        activity: 'Desafío corporativo gamificado "Paso a Paso" de caminatas semanales con podómetro, convenios con gimnasios y torneos lúdico-deportivos de fin de semana.',
        responsible: 'Coordinador de Bienestar & Caja de Compensación Familiar',
        frequency: 'Semanal',
        indicator: 'Tasa de participación en el desafío deportivo de pasos',
        goal: `Activar de forma regular al menos al 35% de los colaboradores sedentarios actuales (${sedentaryPct}% de la población).`,
        priority: sedentaryPct > 45 ? 'Alta' : 'Media',
        estimatedTime: '5 meses'
      },
      {
        program: 'Escuela de Padres',
        finding: `El ${kidsPct}% de los colaboradores tiene hijos o dependientes directos, reportando la actividad familiar como la de mayor preferencia en tiempo libre (${primaryFreeTimeActivity}).`,
        objective: 'Fortalecer el rol de los cuidadores, brindando herramientas de crianza positiva y balance familiar.',
        activity: 'Dictar conferencias y círculos de apoyo virtual interactivos de "Crianza con Amor", pautas de comportamiento infantil y redes de cuidado familiar.',
        responsible: 'Trabajadora Social / Caja de Compensación Familiar',
        frequency: 'Mensual',
        indicator: 'Nivel de asistencia de colaboradores con hijos y calificación del espacio',
        goal: `Alcanzar una cobertura del 45% del total de padres de la nómina (aprox. ${estimatedParentsCount} colaboradores).`,
        priority: kidsPct > 40 ? 'Alta' : 'Media',
        estimatedTime: '3 meses'
      },
      {
        program: 'Prevención de Consumo de Sustancias',
        finding: `La nómina cuenta con un promedio de edad joven de ${stats.avgAge.toFixed(1)} años, caracterizándose epidemiológicamente como un grupo con alta vulnerabilidad a riesgos de consumo social.`,
        objective: 'Prevenir de forma proactiva la exposición a adicciones, tabaquismo, vapeo y SPA, manteniendo ambientes de trabajo seguros.',
        activity: 'Talleres educativos sobre los mitos y realidades de los vapeadores electrónicos y consumo de alcohol, integrados con canales confidenciales de teleorientación en salud.',
        responsible: 'Comité de Convivencia Laboral & Enfermero de SST',
        frequency: 'Trimestral',
        indicator: 'Número de colaboradores formados y firmas de compromiso de autocuidado',
        goal: `Sensibilizar al 100% de los ${stats.total} colaboradores de la empresa en la política corporativa de no consumo.`,
        priority: stats.avgAge < 28 ? 'Alta' : 'Media',
        estimatedTime: '6 meses'
      },
      {
        program: 'Liderazgo',
        finding: `La antigüedad promedio en la organización es de ${stats.avgSeniority.toFixed(1)} años y en el cargo es de ${stats.avgSeniorityRole?.toFixed(1) || '1.1'} años, evidenciando líderes de equipo jóvenes en formación de habilidades directivas.`,
        objective: 'Capacitar a los mandos medios en liderazgo empático, retroalimentación asertiva y resolución pacífica de conflictos de campaña.',
        activity: 'Estructurar la Escuela de Supervisores de 16 horas académicas virtuales/presenciales y diseñar una caja de herramientas para resolución rápida de roces laborales.',
        responsible: 'Dirección de Gestión Humana / Consultor Organizacional',
        frequency: 'Semestral',
        indicator: 'Disminución de quejas de acoso percibido y favorabilidad del supervisor',
        goal: `Capacitar al 100% de supervisores de campaña y lograr un índice de favorabilidad superior al 82% en la encuesta anual.`,
        priority: 'Alta',
        estimatedTime: '5 meses'
      },
      {
        program: 'Capacitación',
        finding: `El nivel educativo más prevalente en la organización corresponde a ${primaryEduLevel} con ${primaryEduCount} colaboradores categorizados en esta dimensión formativa.`,
        objective: 'Asegurar que el personal operativo cuente con el conocimiento normativo y de autocuidado obligatorio de SST.',
        activity: 'Jornadas dinámicas de inducción y reinducción en SG-SST, higiene visual ante pantallas, y prevención del dolor lumbar adaptados al perfil sociodemográfico.',
        responsible: 'Coordinador de Seguridad y Salud en el Trabajo / ARL',
        frequency: 'Mensual',
        indicator: '% de cumplimiento del plan anual de capacitación obligatoria',
        goal: `Alcanzar una cobertura del 95% de la nómina capacitada en los estándares del Decreto 1072.`,
        priority: 'Media',
        estimatedTime: '12 meses'
      },
      {
        program: 'Bienestar',
        finding: `La participación en actividades opcionales de la empresa se sitúa en el ${participationPct}%, existiendo una preferencia mayoritaria de ocio orientada a "${primaryFreeTimeActivity}".`,
        objective: 'Elevar el sentido de pertenencia, la motivación interna y la tasa de participación en actividades de la compañía.',
        activity: `Diseñar un calendario de bienestar integrativo de fin de semana enfocado en "${primaryFreeTimeActivity}" y programas de reconocimiento a las metas operativas.`,
        responsible: 'Líder de Bienestar de Talento Humano / Comité de Bienestar',
        frequency: 'Mensual',
        indicator: '% de participación registrada en actividades de bienestar',
        goal: `Incrementar la tasa de participación activa del ${participationPct}% actual a un 75% de la población general.`,
        priority: 'Media',
        estimatedTime: '4 meses'
      }
    ];
  };

  const planItems = generatePlan();

  // Filter items based on selected program
  const filteredPlanItems = selectedProgramFilter === 'todos' 
    ? planItems 
    : planItems.filter(item => item.program.toLowerCase() === selectedProgramFilter.toLowerCase());

  // Count priorities
  const totalAlta = planItems.filter(item => item.priority === 'Alta').length;
  const totalMedia = planItems.filter(item => item.priority === 'Media').length;
  const totalBaja = planItems.filter(item => item.priority === 'Baja').length;

  const toggleItemCompletion = (program: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [program]: !prev[program]
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper colors for programs
  const getProgramBadgeStyle = (prog: string) => {
    switch (prog) {
      case 'Ergonomía': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Riesgo Psicosocial': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medicina Preventiva': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Hábitos Saludables': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Escuela de Padres': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Prevención de Consumo de Sustancias': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Liderazgo': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Capacitación': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'Bienestar': return 'bg-pink-50 text-pink-700 border-pink-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getProgramIcon = (prog: string, className = "w-5 h-5") => {
    switch (prog) {
      case 'Ergonomía': return <Scale className={`${className} text-teal-600`} />;
      case 'Riesgo Psicosocial': return <ShieldAlert className={`${className} text-rose-600`} />;
      case 'Medicina Preventiva': return <Activity className={`${className} text-blue-600`} />;
      case 'Hábitos Saludables': return <Apple className={`${className} text-emerald-600`} />;
      case 'Escuela de Padres': return <Baby className={`${className} text-purple-600`} />;
      case 'Prevención de Consumo de Sustancias': return <Zap className={`${className} text-amber-600`} />;
      case 'Liderazgo': return <Award className={`${className} text-indigo-600`} />;
      case 'Capacitación': return <GraduationCap className={`${className} text-sky-600`} />;
      case 'Bienestar': return <Smile className={`${className} text-pink-600`} />;
      default: return <ClipboardList className={`${className} text-slate-600`} />;
    }
  };

  const getPriorityStyle = (priority: 'Alta' | 'Media' | 'Baja') => {
    switch (priority) {
      case 'Alta': return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      case 'Media': return 'bg-amber-100 text-amber-800 border-amber-200 font-bold';
      case 'Baja': return 'bg-slate-100 text-slate-700 border-slate-200 font-bold';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Summary Callout (No-Print) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
        <div className="space-y-2 max-w-2xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/15 text-cyan-300 border border-cyan-400/20">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>Motor de Intervención Automatizado SG-SST</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight leading-none text-white">
            Plan de Acción Inteligente
          </h2>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            Diagnóstico ejecutado de forma cruzada sobre <b>{stats.total} colaboradores</b> activos. Hemos procesado e integrado las 17 variables demográficas del Excel para construir un plan corporativo de intervención estructurado en 9 dimensiones obligatorias.
          </p>
        </div>

        {/* Priority Counts Dashboard (No-Print) */}
        <div className="flex gap-3 shrink-0">
          <div className="bg-slate-950/50 border border-slate-800/80 px-4 py-2.5 rounded-2xl text-center min-w-[75px]">
            <p className="text-[9px] text-rose-400 font-extrabold uppercase tracking-widest">ALTA</p>
            <p className="text-xl font-black text-white font-mono">{totalAlta}</p>
          </div>
          <div className="bg-slate-950/50 border border-slate-800/80 px-4 py-2.5 rounded-2xl text-center min-w-[75px]">
            <p className="text-[9px] text-amber-400 font-extrabold uppercase tracking-widest">MEDIA</p>
            <p className="text-xl font-black text-white font-mono">{totalMedia}</p>
          </div>
          <div className="bg-slate-950/50 border border-slate-800/80 px-4 py-2.5 rounded-2xl text-center min-w-[75px]">
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest">BAJA</p>
            <p className="text-xl font-black text-white font-mono">{totalBaja}</p>
          </div>
        </div>
      </div>

      {/* Control Navigation Bar (No-Print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm no-print">
        
        {/* Left Side: Mode Selection */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'cards' 
                ? 'bg-white text-slate-900 shadow-xs font-black' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Mosaico de Programas
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'table' 
                ? 'bg-white text-slate-900 shadow-xs font-black' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Matriz de Seguimiento
          </button>
        </div>

        {/* Right Side: Print/PDF Action */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-cyan-300" />
            <span>Imprimir Plan Completo</span>
          </button>
        </div>
      </div>

      {/* Program Selector Filter Bar (No-Print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm no-print overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-1">
          <button
            onClick={() => setSelectedProgramFilter('todos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedProgramFilter === 'todos'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/50'
            }`}
          >
            Todos los Programas ({planItems.length})
          </button>
          {planItems.map((item) => (
            <button
              key={item.program}
              onClick={() => setSelectedProgramFilter(item.program)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border ${
                selectedProgramFilter.toLowerCase() === item.program.toLowerCase()
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200/50'
              }`}
            >
              {getProgramIcon(item.program, "w-3.5 h-3.5")}
              <span>{item.program}</span>
            </button>
          ))}
        </div>
      </div>

      {/* VIEW: 1. MOSAICO DE PROGRAMAS (CARDS) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in text-left">
          {filteredPlanItems.map((item) => {
            const isCompleted = completedItems[item.program] || false;
            return (
              <div 
                key={item.program}
                className={`bg-white rounded-3xl border border-slate-150 shadow-xs overflow-hidden hover:shadow-md transition-all flex flex-col justify-between relative ${
                  isCompleted ? 'border-emerald-200 bg-emerald-50/5' : ''
                }`}
              >
                {/* Completed Badge Indicator */}
                {isCompleted && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Ejecutado</span>
                  </div>
                )}

                {/* Card Header */}
                <div className="p-6 border-b border-slate-100 space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        {getProgramIcon(item.program, "w-5 h-5")}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-950 text-sm tracking-tight font-display">{item.program}</h4>
                        <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider mt-0.5 ${getProgramBadgeStyle(item.program)}`}>
                          Programa SST
                        </span>
                      </div>
                    </div>
                    
                    {!isCompleted && (
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${getPriorityStyle(item.priority)}`}>
                        Prioridad {item.priority}
                      </span>
                    )}
                  </div>

                  {/* Hallazgo Real */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      <span>Hallazgo de la Encuesta Real</span>
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      {item.finding}
                    </p>
                  </div>
                </div>

                {/* Card Body - Content */}
                <div className="p-6 space-y-4.5 flex-1">
                  
                  {/* Objetivo */}
                  <div className="space-y-1">
                    <p className="text-[9px] uppercase font-black text-indigo-500 tracking-wider flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" />
                      <span>Objetivo Estratégico</span>
                    </p>
                    <p className="text-xs text-slate-800 leading-normal font-bold">
                      {item.objective}
                    </p>
                  </div>

                  {/* Actividad */}
                  <div className="space-y-1 bg-indigo-50/25 p-3.5 rounded-2xl border border-indigo-100/30">
                    <p className="text-[9px] uppercase font-black text-indigo-600 tracking-wider flex items-center gap-1">
                      <ClipboardList className="w-3.5 h-3.5" />
                      <span>Actividad Operativa</span>
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      {item.activity}
                    </p>
                  </div>

                  {/* Operational details grid */}
                  <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                    <div className="space-y-0.5">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        <span>Responsable</span>
                      </p>
                      <p className="font-bold text-slate-800 truncate" title={item.responsible}>
                        {item.responsible}
                      </p>
                    </div>
                    
                    <div className="space-y-0.5">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Frecuencia</span>
                      </p>
                      <p className="font-bold text-slate-800">
                        {item.frequency}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Tiempo Estimado</span>
                      </p>
                      <p className="font-bold text-slate-800">
                        {item.estimatedTime}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                        <Target className="w-3 h-3 text-slate-400" />
                        <span>Meta de Impacto</span>
                      </p>
                      <p className="font-bold text-slate-800 truncate" title={item.goal}>
                        {item.goal}
                      </p>
                    </div>
                  </div>

                  {/* Indicador */}
                  <div className="pt-3 border-t border-slate-100 space-y-1">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Indicador de Seguimiento</p>
                    <p className="text-xs font-mono font-bold text-indigo-700 leading-snug">
                      {item.indicator}
                    </p>
                  </div>

                </div>

                {/* Card Footer Actions (No-Print) */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between no-print">
                  <span className="text-[10px] font-semibold text-slate-400">Estado de Ejecución</span>
                  <button
                    onClick={() => toggleItemCompletion(item.program)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-300" />}
                    <span>{isCompleted ? 'Marcar Pendiente' : 'Marcar Ejecutado'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: 2. MATRIZ DE SEGUIMIENTO (TABLE VIEW / OPTIMIZED FOR PRINT) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-150 shadow-sm overflow-hidden animate-fade-in text-left">
          <div className="p-6 border-b border-slate-100 no-print">
            <h3 className="font-extrabold text-slate-950 text-sm tracking-tight font-display">Matriz Técnica de Intervención Completa</h3>
            <p className="text-xs text-slate-500 font-medium">Cronograma, metas y responsables estructurados formalmente para auditorías del SG-SST.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-wider">
                  <th className="py-4 px-4.5 rounded-tl-3xl">Programa</th>
                  <th className="py-4 px-4.5">Hallazgo Real (Origen Excel)</th>
                  <th className="py-4 px-4.5">Objetivo Estratégico</th>
                  <th className="py-4 px-4.5">Actividad Planteada</th>
                  <th className="py-4 px-4.5">Prioridad</th>
                  <th className="py-4 px-4.5">Responsable</th>
                  <th className="py-4 px-4.5">Plazo</th>
                  <th className="py-4 px-4.5">Indicador de Control</th>
                  <th className="py-4 px-4.5 rounded-tr-3xl">Meta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs text-slate-700 bg-white">
                {filteredPlanItems.map((item, index) => {
                  const isCompleted = completedItems[item.program] || false;
                  return (
                    <tr 
                      key={item.program}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        isCompleted ? 'bg-emerald-50/10' : ''
                      }`}
                    >
                      {/* Programa */}
                      <td className="py-4.5 px-4.5 font-bold text-slate-950 flex items-center gap-2">
                        <div className="p-1.5 bg-slate-100 rounded-lg shrink-0">
                          {getProgramIcon(item.program, "w-4 h-4")}
                        </div>
                        <span className="truncate max-w-[110px]">{item.program}</span>
                      </td>

                      {/* Hallazgo */}
                      <td className="py-4.5 px-4.5 text-slate-500 font-medium leading-relaxed max-w-[180px]">
                        {item.finding}
                      </td>

                      {/* Objetivo */}
                      <td className="py-4.5 px-4.5 font-bold text-slate-800 leading-normal max-w-[180px]">
                        {item.objective}
                      </td>

                      {/* Actividad */}
                      <td className="py-4.5 px-4.5 font-semibold text-slate-700 leading-relaxed max-w-[200px]">
                        {item.activity}
                      </td>

                      {/* Prioridad */}
                      <td className="py-4.5 px-4.5">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase ${getPriorityStyle(item.priority)}`}>
                          {item.priority}
                        </span>
                      </td>

                      {/* Responsable */}
                      <td className="py-4.5 px-4.5 text-slate-900 font-bold max-w-[120px] truncate" title={item.responsible}>
                        {item.responsible}
                      </td>

                      {/* Plazo */}
                      <td className="py-4.5 px-4.5 text-slate-500 font-mono font-bold">
                        {item.estimatedTime}
                      </td>

                      {/* Indicador */}
                      <td className="py-4.5 px-4.5 text-indigo-700 font-extrabold max-w-[150px] leading-tight font-mono">
                        {item.indicator}
                      </td>

                      {/* Meta */}
                      <td className="py-4.5 px-4.5 font-semibold text-slate-900 leading-snug max-w-[150px]">
                        {item.goal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PRINT-ONLY SECTION (Styles for clean layout when printing) */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          table {
            border: 1px solid #cbd5e1 !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #e2e8f0 !important;
            padding: 8px !important;
            font-size: 9px !important;
          }
          thead {
            background-color: #0f172a !important;
            color: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

    </div>
  );
}
