import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  Compass, 
  Cpu
} from 'lucide-react';
import { CentroEjecutivoTab } from '../types/centroEjecutivo.types';

interface ResumenEjecutivoTabProps {
  summary: any;
  onNavigateTab: (tab: CentroEjecutivoTab) => void;
  onOpenAlertsModal: () => void;
}

export const ResumenEjecutivoTab: React.FC<ResumenEjecutivoTabProps> = ({
  summary,
  onNavigateTab,
  onOpenAlertsModal
}) => {
  const { preguntasClave, healthScore, capacity, totalColaboradores } = summary;
  const scoreTotal = healthScore?.scoreTotal ?? 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 7 Core Executive Questions Bento Grid */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-indigo-600" />
              Diagnóstico Estratégico en 60 Segundos
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Respuestas consolidadas a las preguntas fundamentales de la Dirección y el Comité de SST.
            </p>
          </div>

          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Fuente Única de Verdad Activa
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Q1: Dónde estamos */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-300 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">
                1. ¿Dónde estamos?
              </span>
              <button
                onClick={() => onNavigateTab('health_score')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                Ver Score <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              {preguntasClave.dondeEstamos}
            </p>
          </div>

          {/* Q2: Qué está ocurriendo */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-300 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                2. ¿Qué está ocurriendo?
              </span>
              <button
                onClick={() => onNavigateTab('calidad_datos')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                Ver Calidad <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              {preguntasClave.queEstaOcurriendo}
            </p>
          </div>

          {/* Q3: Qué requiere atención */}
          <div className="bg-rose-50/50 border border-rose-200/80 rounded-2xl p-5 hover:border-rose-300 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                3. ¿Qué requiere atención?
              </span>
              <button
                onClick={onOpenAlertsModal}
                className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1 cursor-pointer"
              >
                Ver Alertas <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              {preguntasClave.queRequiereAtencion}
            </p>
          </div>

          {/* Q4: Qué recomienda la plataforma */}
          <div className="bg-indigo-50/40 border border-indigo-200/80 rounded-2xl p-5 hover:border-indigo-300 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                4. ¿Qué recomienda la IA?
              </span>
              <button
                onClick={() => onNavigateTab('inteligencia_ia')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                Ver IA <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              {preguntasClave.queRecomiendaPlataforma}
            </p>
          </div>

          {/* Q5: Qué decisión humana está pendiente */}
          <div className="bg-amber-50/50 border border-amber-200/80 rounded-2xl p-5 hover:border-amber-300 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                5. ¿Decisión humana pendiente?
              </span>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                HITL
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              {preguntasClave.queDecisionHumanaEstaPendiente}
            </p>
          </div>

          {/* Q6: Acciones abiertas & Q7: Evolución */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 hover:border-indigo-300 transition-all space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                6. Acciones & 7. Evolución
              </span>
              <button
                onClick={() => onNavigateTab('acciones')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                Ver Tareas <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              {preguntasClave.queAccionesEstanAbiertas} {preguntasClave.comoEstamosEvolucionando}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Executive Macro Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Health Score Breakdown Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Health Score Empresarial</h3>
                <span className="text-xs text-slate-500">Índice consolidado de los 7 componentes</span>
              </div>
            </div>

            <span className="text-2xl font-black text-indigo-600">
              {scoreTotal}/100
            </span>
          </div>

          <div className="space-y-2.5 pt-2">
            {healthScore?.componentes?.slice(0, 4).map((c: any) => (
              <div key={c.id} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700">{c.nombre}</span>
                  <span className="text-slate-900 font-bold">{c.puntajeObtenido}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      c.puntajeObtenido >= 80 ? 'bg-emerald-500' : c.puntajeObtenido >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${c.puntajeObtenido}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Censo activo: {totalColaboradores} colaboradores
            </span>
            <button
              onClick={() => onNavigateTab('health_score')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              Auditoría completa <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Module 2: Capacity & SaaS License Summary */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Capacidad & Licenciamiento</h3>
                <span className="text-xs text-slate-500">Uso de infraestructura</span>
              </div>
            </div>

            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
              {capacity?.diasParaVencer} días restantes
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Colaboradores</span>
              <span className="text-lg font-black text-slate-900">
                {capacity?.colaboradoresActuales}/{capacity?.colaboradoresLimite}
              </span>
              <span className="text-[10px] text-slate-500 block font-semibold">
                {capacity?.colaboradoresPorcentaje}% cupo
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Usuarios</span>
              <span className="text-lg font-black text-slate-900">
                {capacity?.usuariosActuales}/{capacity?.usuariosLimite}
              </span>
              <span className="text-[10px] text-slate-500 block font-semibold">
                {capacity?.usuariosPorcentaje}% cupo
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 text-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Sedes</span>
              <span className="text-lg font-black text-slate-900">
                {capacity?.sedesActuales}/{capacity?.sedesLimite}
              </span>
              <span className="text-[10px] text-slate-500 block font-semibold">
                {capacity?.sedesPorcentaje}% cupo
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Uso de infraestructura dentro de parámetros óptimos.
            </span>
            <button
              onClick={() => onNavigateTab('licenciamiento')}
              className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer shrink-0"
            >
              Gestionar Plan <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
