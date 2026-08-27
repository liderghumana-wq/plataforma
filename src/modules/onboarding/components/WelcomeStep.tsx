import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Building2, 
  Users, 
  ShieldCheck, 
  BarChart3, 
  CheckCircle2, 
  FileSpreadsheet,
  Cpu,
  Target
} from 'lucide-react';

interface WelcomeStepProps {
  onStart: () => void;
  onGoToDashboard: () => void;
  companyName: string;
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ onStart, onGoToDashboard, companyName }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      {/* Hero Welcome Box */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 text-white border border-indigo-800/40 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Guía de Activación Empresarial SG-SST
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Bienvenido a <span className="text-indigo-400">Insight People IA</span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-3xl leading-relaxed">
              La plataforma inteligente para la gestión sociodemográfica, prevención de riesgos laborales y analítica predictiva de Seguridad y Salud en el Trabajo para <span className="text-white font-semibold">{companyName}</span>.
            </p>
          </div>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-indigo-800/40">
            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Carga & Calidad</h4>
                <p className="text-xs text-slate-300 mt-0.5">Normalización y validación estricta de datos sin alterar tu nómina.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Indicadores Legales</h4>
                <p className="text-xs text-slate-300 mt-0.5">Cálculo auditado de pirámides etarias, ausentismo y sintomatología.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Diagnóstico e IA</h4>
                <p className="text-xs text-slate-300 mt-0.5">Hallazgos y planes de intervención preventivos bajo estricta gobernanza.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onStart}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Comenzar Configuración Guiada
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onGoToDashboard}
              className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-medium rounded-xl border border-slate-700 transition-colors cursor-pointer text-sm"
            >
              Ver Dashboard de Implementación
            </button>
          </div>
        </div>
      </div>

      {/* 4 Steps Explanation Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box 1: Qué información necesita */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">¿Qué información necesitas?</h3>
              <p className="text-xs text-slate-500">Datos mínimos para habilitar la plataforma</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Datos Corporativos:</strong> Razón social, NIT, actividad económica (CIIU) y representante SG-SST.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Estructura:</strong> Sedes de trabajo, áreas o departamentos y cargos.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Censo de Colaboradores:</strong> Archivo Excel con listado de trabajadores (o carga individual).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Encuesta Sociodemográfica:</strong> Respuestas de salud y hábitos (aplicables desde la app).</span>
            </li>
          </ul>
        </div>

        {/* Box 2: Qué resultados vas a obtener */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">¿Qué resultados obtendrás?</h3>
              <p className="text-xs text-slate-500">Entregables automatizados y auditables</p>
            </div>
          </div>

          <ul className="space-y-2.5 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>Diagnóstico Sociodemográfico:</strong> Pirámides etarias, perfiles de salud y distribución por sede.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>Batería de Indicadores SST:</strong> Tasas de ausentismo, prevalencias osteomusculares y de IMC.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>Informe Ejecutivo Automatizado:</strong> Documento estructurado listo para comités y auditorías.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span><strong>Planes de Intervención Priorizados:</strong> Acciones preventivas con trazabilidad y cronograma.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
