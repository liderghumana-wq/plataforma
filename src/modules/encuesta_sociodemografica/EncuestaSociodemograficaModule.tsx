import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  ArrowRight, 
  FileSpreadsheet, 
  CheckCircle2, 
  ArrowLeft,
  Building,
  Briefcase,
  Users,
  Home,
  Smile,
  Activity,
  Heart,
  Brain,
  Monitor,
  Check,
  RotateCcw,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';
import { SURVEY_SCHEMA } from './schema';
import { SurveyAnswers, SurveyErrors, SurveySection } from './types';
import { FormQuestionRenderer } from './FormQuestionRenderer';
import { 
  loadAnswersFromStorage, 
  saveAnswersToStorage, 
  clearSurveyStorage, 
  validateQuestion,
  validateSection, 
  calculateTotalProgress,
  sanitizeInput
} from './utils';

import { CompanyCatalogAdmin } from '../../components/CompanyCatalogAdmin';
import { Prompt21TestRunnerPanel } from '../../components/Prompt21TestRunnerPanel';

// Icon map for dynamic icon lookup
const ICON_MAP: Record<string, any> = {
  Building,
  Briefcase,
  Users,
  Home,
  Smile,
  Activity,
  Heart,
  Brain,
  Monitor,
  CheckCircle2,
  ShieldCheck
};

export default function EncuestaSociodemograficaModule() {
  // Navigation view state: 'welcome' | 'wizard' | 'catalogos' | 'pruebas'
  const [view, setView] = useState<'welcome' | 'wizard' | 'catalogos' | 'pruebas'>('welcome');
  
  // Current step index in wizard (0 to 14)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Completed steps tracking
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Global answers state initialized from localStorage
  const [answers, setAnswers] = useState<SurveyAnswers>({});

  // Real-time errors state for current active step
  const [errors, setErrors] = useState<SurveyErrors>({});

  // Auto-save feedback toast
  const [autoSaveToast, setAutoSaveToast] = useState<boolean>(false);

  // Final submission state
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Load answers from localStorage on mount & initialize default date
  useEffect(() => {
    const stored = loadAnswersFromStorage();
    const todayDate = new Date().toISOString().split('T')[0];

    const initialAnswers = stored.answers ? { ...stored.answers } : {};
    if (!initialAnswers.fechaDiligenciamiento) {
      initialAnswers.fechaDiligenciamiento = todayDate;
    }

    setAnswers(initialAnswers);
    if (stored.stepIndex !== undefined && stored.stepIndex >= 0 && stored.stepIndex < SURVEY_SCHEMA.length) {
      setCurrentStepIndex(stored.stepIndex);
    }
  }, []);

  // Guarantee fechaDiligenciamiento is always set to today's date if missing
  useEffect(() => {
    if (!answers.fechaDiligenciamiento) {
      const todayDate = new Date().toISOString().split('T')[0];
      setAnswers(prev => ({ ...prev, fechaDiligenciamiento: todayDate }));
    }
  }, [answers.fechaDiligenciamiento]);

  // Current active section
  const currentSection: SurveySection = SURVEY_SCHEMA[currentStepIndex] || SURVEY_SCHEMA[0];
  const stepNumber = currentStepIndex + 1;
  const totalSteps = SURVEY_SCHEMA.length;

  // Calculation of overall progress
  const { completedCount, totalCount, percentage: totalPercentage } = calculateTotalProgress(SURVEY_SCHEMA, answers);

  // Handle single answer change
  const handleAnswerChange = (questionId: string, value: any) => {
    const sanitizedValue = typeof value === 'string' ? sanitizeInput(value) : value;
    
    const updatedAnswers = {
      ...answers,
      [questionId]: sanitizedValue
    };

    setAnswers(updatedAnswers);

    // Auto-save to localStorage
    saveAnswersToStorage(updatedAnswers, currentStepIndex);

    // Real-time validation for this question
    const currentQSchema = currentSection.questions.find(q => q.id === questionId);
    if (currentQSchema) {
      const qError = validateQuestion(currentQSchema, sanitizedValue, updatedAnswers);
      setErrors(prev => {
        const next = { ...prev };
        if (qError) {
          next[questionId] = qError;
        } else {
          delete next[questionId];
        }
        return next;
      });
    }
  };

  // Trigger brief auto-save indicator
  const triggerAutoSaveToast = () => {
    setAutoSaveToast(true);
    setTimeout(() => setAutoSaveToast(false), 2000);
  };

  // Next Step / Save & Continue button handler
  const handleNext = () => {
    // Validate current section before proceeding (except if in summary step 15)
    if (currentStepIndex < totalSteps - 1) {
      const sectionErrors = validateSection(currentSection, answers);
      
      if (Object.keys(sectionErrors).length > 0) {
        setErrors(sectionErrors);
        window.scrollTo({ top: 200, behavior: 'smooth' });
        return;
      }
    }

    // Clear errors and mark step completed
    setErrors({});
    setCompletedSteps(prev => new Set(prev).add(currentStepIndex));
    
    // Save to storage
    saveAnswersToStorage(answers, currentStepIndex + 1);
    triggerAutoSaveToast();

    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Previous Step handler
  const handlePrev = () => {
    setErrors({});
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setView('welcome');
    }
  };

  // Stepper direct jump handler
  const handleStepClick = (targetIndex: number) => {
    setErrors({});
    setCurrentStepIndex(targetIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset survey form
  const handleResetForm = () => {
    if (window.confirm('¿Está seguro de reiniciar la encuesta? Se borrarán las respuestas actuales no enviadas.')) {
      clearSurveyStorage();
      setAnswers({});
      setCompletedSteps(new Set());
      setCurrentStepIndex(0);
      setIsSubmitted(false);
      setView('welcome');
    }
  };

  // Final Submit Handler
  const handleFinalSubmit = () => {
    // Check required fields in final step 15 (Consent)
    const finalSection = SURVEY_SCHEMA[14]; // Step 15
    const finalErrors = validateSection(finalSection, answers);

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return;
    }

    setIsSubmitted(true);
    saveAnswersToStorage(answers, 14);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in py-2 text-left select-none">
      {view === 'welcome' ? (
        /* ==================== PANTALLA DE BIENVENIDA ==================== */
        <div className="space-y-8">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 rounded-3xl border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/15 text-cyan-300 border border-cyan-400/20">
              <ClipboardList className="w-3.5 h-3.5 text-cyan-300" />
              <span>Encuesta Maestra Sociodemográfica</span>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight leading-tight">
                Encuesta Maestra Sociodemográfica y de Salud
              </h2>
              <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-3xl">
                "Diligencie la información directamente desde la plataforma. Los datos serán utilizados para construir automáticamente los indicadores epidemiológicos, sociodemográficos y los informes ejecutivos."
              </p>
            </div>

            {/* Main CTA Button */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setView('wizard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/40 cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-center gap-2.5"
              >
                <span>Iniciar Encuesta Maestra (15 Secciones)</span>
                <ArrowRight className="w-4.5 h-4.5" />
              </button>

              <button
                type="button"
                onClick={() => setView('catalogos')}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Building className="w-4 h-4 text-emerald-400" />
                <span>Catálogos Empresariales</span>
              </button>

              <button
                type="button"
                onClick={() => setView('pruebas')}
                className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Suite de Pruebas</span>
              </button>

              {Object.keys(answers).length > 0 && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 rounded-2xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-2 cursor-pointer ml-auto"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span>Reiniciar borrador</span>
                </button>
              )}
            </div>
          </div>

          {/* Coexistence Options Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">Fuente 1</span>
                  <h3 className="text-sm font-extrabold text-slate-900">Cargar desde Excel</h3>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Importación masiva mediante archivo Excel estructurado conforme al Diccionario de Datos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-2xs space-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[9px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Fuente 2
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">Fuente 2</span>
                  <h3 className="text-sm font-extrabold text-slate-900">Diligenciamiento Directo</h3>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Asistente web interactivo de 15 secciones parametrizables con autoguardado y validación en tiempo real.
              </p>
            </div>
          </div>
        </div>
      ) : isSubmitted ? (
        /* ==================== CONFIRMACIÓN DE ENVÍO ==================== */
        <div className="bg-white p-10 rounded-3xl border border-slate-200/80 shadow-xl text-center space-y-6 max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">
              Encuesta Registrada Con Éxito
            </span>
            <h3 className="text-2xl font-black text-slate-900 font-display">
              ¡Información Sociodemográfica y de Salud Registrada!
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Los datos diligenciados han sido consolidados de forma segura en la plataforma y están listos para alimentar los análisis epidemiológicos y reportes ejecutivos SG-SST.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs font-semibold text-slate-700 space-y-2">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span>Colaborador:</span>
              <span className="font-extrabold text-slate-900">{answers['nombreCompleto'] || 'No especificado'}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span>Documento:</span>
              <span className="font-extrabold text-slate-900">{answers['tipoDocumento']} {answers['numeroDocumento']}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Campos completados:</span>
              <span className="font-extrabold text-emerald-600">{completedCount} de {totalCount} ({totalPercentage}%)</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setView('welcome');
              }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md"
            >
              Volver al Inicio
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSubmitted(false);
                setCurrentStepIndex(0);
              }}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer"
            >
              Revisar o Editar Respuestas
            </button>
          </div>
        </div>
      ) : view === 'catalogos' ? (
        /* ==================== VISTA DE CATÁLOGOS EMPRESARIALES ==================== */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setView('welcome')}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Bienvenida</span>
            </button>
            <span className="text-xs font-bold text-slate-800">Parametrización por Empresa</span>
          </div>

          <CompanyCatalogAdmin companyId="EMP-001" companyName="Empresa Registrada SG-SST" />
        </div>
      ) : view === 'pruebas' ? (
        /* ==================== VISTA DE PRUEBAS DE CALIDAD PROMPT 21 ==================== */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setView('welcome')}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Bienvenida</span>
            </button>
            <span className="text-xs font-bold text-slate-800">Verificación de Integridad de Datos</span>
          </div>

          <Prompt21TestRunnerPanel />
        </div>
      ) : (
        /* ==================== FORMULARIO WIZARD ==================== */
        <div className="space-y-6">
          
          {/* Top Bar with Navigation & Exit */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => setView('welcome')}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Bienvenida</span>
            </button>

            <div className="flex items-center gap-3">
              {autoSaveToast && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black border border-emerald-200 animate-fade-in">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Guardado automático</span>
                </div>
              )}

              <div className="text-right hidden sm:block">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 block">Encuesta Maestra</span>
                <span className="text-xs font-bold text-slate-800">Formulario Guiado (15 Secciones)</span>
              </div>

              <div className="w-10 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs border border-indigo-100 px-2">
                {stepNumber}/{totalSteps}
              </div>
            </div>
          </div>

          {/* ==================== STEPPER HORIZONTAL (15 SECCIONES) ==================== */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs space-y-4">
            {/* Header progress line */}
            <div className="flex items-center justify-between text-xs font-extrabold flex-wrap gap-2">
              <span className="text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                Paso {stepNumber} de {totalSteps}: <span className="text-indigo-600">{currentSection.title}</span>
              </span>
              <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-[11px] font-black border border-indigo-100">
                {totalPercentage}% completado global ({completedCount}/{totalCount})
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${totalPercentage}%` }}
              />
            </div>

            {/* Stepper Node Items (Horizontal 15 Steps) */}
            <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-15 gap-1 pt-2">
              {SURVEY_SCHEMA.map((sec, idx) => {
                const isCompleted = completedSteps.has(idx);
                const isCurrent = idx === currentStepIndex;

                let badgeStyle = 'bg-slate-100 text-slate-400 border-slate-200';
                let textStyle = 'text-slate-400 font-medium';

                if (isCompleted && !isCurrent) {
                  badgeStyle = 'bg-emerald-500 text-white border-emerald-500 shadow-xs';
                  textStyle = 'text-emerald-700 font-bold';
                } else if (isCurrent) {
                  badgeStyle = 'bg-indigo-600 text-white border-indigo-600 ring-4 ring-indigo-100 shadow-md';
                  textStyle = 'text-indigo-600 font-black';
                }

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleStepClick(idx)}
                    className="flex flex-col items-center gap-1 text-center transition-all cursor-pointer group"
                    title={`${sec.id}. ${sec.title}`}
                  >
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-black transition-all ${badgeStyle}`}>
                      {isCompleted && !isCurrent ? (
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      ) : (
                        sec.id
                      )}
                    </div>
                    <span className={`text-[8.5px] leading-tight truncate max-w-full hidden md:block ${textStyle} group-hover:text-indigo-600 transition-colors`}>
                      {sec.shortTitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ==================== SECCIÓN DE FORMULARIO ACTUAL ==================== */}
          <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200/80 shadow-2xs space-y-8">
            {/* Section Header */}
            <div className="border-b border-slate-100 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                    Sección {stepNumber} de {totalSteps}
                  </span>
                  {completedSteps.has(currentStepIndex) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-100">
                      <Check className="w-3 h-3 text-emerald-600" />
                      Sección Guardada
                    </span>
                  )}
                </div>
                <h3 className="text-xl md:text-2xl font-black text-slate-900 font-display flex items-center gap-3 pt-1">
                  {React.createElement(ICON_MAP[currentSection.iconName] || Building, { className: 'w-6 h-6 text-indigo-600 shrink-0' })}
                  <span>{currentSection.title}</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-3xl">
                  {currentSection.description}
                </p>
              </div>
            </div>

            {/* Optional Section Notice / Disclaimer Banner */}
            {currentSection.notice && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900 text-xs font-semibold">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-[11.5px] font-medium text-amber-800">
                  {currentSection.notice}
                </p>
              </div>
            )}

            {/* Error banner if section validation fails */}
            {Object.keys(errors).length > 0 && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-xs font-semibold animate-headShake">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-extrabold text-rose-900">Por favor corrija los campos marcados antes de continuar:</p>
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 text-rose-700 font-medium">
                    {Object.values(errors).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Step 15: Consent and Final Summary */}
            {currentStepIndex === 14 ? (
              <div className="space-y-6">
                <div className="p-5 bg-indigo-50/60 rounded-2xl border border-indigo-150 space-y-2">
                  <h4 className="text-xs font-black text-indigo-900 uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Resumen Consolidado de Respuestas</span>
                  </h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    A continuación puede revisar la síntesis de los datos ingresados en cada una de las secciones anteriores antes del registro definitivo.
                  </p>
                </div>

                {/* Summary of all 14 previous sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SURVEY_SCHEMA.slice(0, 14).map((sec, idx) => (
                    <div key={sec.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          {React.createElement(ICON_MAP[sec.iconName] || Building, { className: 'w-4 h-4 text-indigo-600' })}
                          <span>{sec.id}. {sec.title}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleStepClick(idx)}
                          className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                        >
                          Editar
                        </button>
                      </div>

                      <div className="space-y-1 text-[11px]">
                        {sec.questions.map(q => {
                          const val = answers[q.id];
                          let displayVal = 'No respondido';
                          if (val !== undefined && val !== null && val !== '') {
                            displayVal = Array.isArray(val) ? val.join(', ') : String(val);
                          }
                          return (
                            <div key={q.id} className="flex justify-between items-center text-slate-600">
                              <span className="truncate max-w-[60%] font-medium">{q.label}:</span>
                              <span className="font-bold text-slate-900 truncate max-w-[40%] text-right">
                                {displayVal}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Step 15 Question: Mandatory Informed Consent */}
                <div className="pt-4 space-y-6 border-t border-slate-200">
                  {currentSection.questions.map(q => (
                    <FormQuestionRenderer
                      key={q.id}
                      question={q}
                      answers={answers}
                      error={errors[q.id]}
                      onChange={handleAnswerChange}
                    />
                  ))}
                </div>
              </div>
            ) : (
              /* Steps 1 to 14: Standard Questions Form */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentSection.questions.map((q) => (
                  <div key={q.id} className={q.type === 'textarea' || q.type === 'checkbox' ? 'md:col-span-2' : ''}>
                    <FormQuestionRenderer
                      question={q}
                      answers={answers}
                      error={errors[q.id]}
                      onChange={handleAnswerChange}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Wizard Navigation Controls */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
              {/* Previous Button */}
              <button
                type="button"
                onClick={handlePrev}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              {/* Action right group */}
              <div className="flex items-center gap-3">
                {currentStepIndex < totalSteps - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-7 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/30 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>Guardar y continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinalSubmit}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/40 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4.5 h-4.5" />
                    <span>Finalizar Encuesta</span>
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
