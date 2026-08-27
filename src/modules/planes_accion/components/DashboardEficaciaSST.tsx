import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  ShieldCheck, 
  TrendingUp, 
  FileText, 
  Sparkles, 
  Target, 
  Layers, 
  HelpCircle,
  ArrowUpRight,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { MetricasPlanesAccion, PlanAccionItem } from '../types/planesAccion.types';

interface DashboardEficaciaSSTProps {
  metricas: MetricasPlanesAccion;
  planes: PlanAccionItem[];
  onSelectPlan: (plan: PlanAccionItem) => void;
  onOpenNuevoModal: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const DashboardEficaciaSST: React.FC<DashboardEficaciaSSTProps> = ({
  metricas,
  planes,
  onSelectPlan,
  onOpenNuevoModal,
  onNavigateTab
}) => {
  const planesRequierenVerificacion = planes.filter(p => p.estado === 'EN_VERIFICACION');
  const planesVencidos = planes.filter(p => p.estado === 'VENCIDA');
  const planesNoEficaces = planes.filter(p => p.estado === 'NO_EFICAZ');

  return (
    <div className="space-y-6">
      
      {/* 1. BANNER NORMATIVO & REGLA FUNDAMENTAL DE EFICACIA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-[11px] font-black uppercase tracking-wider border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Garantía de Calidad SG-SST • Res. 0312 / Dec. 1072</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-display tracking-tight text-white">
              Tablero Central de Eficacia & Planes de Mejora
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              <strong className="text-amber-400 font-bold">Principio de Cierre Válido:</strong> Una <span className="underline decoration-indigo-400">Acción Ejecutada</span> (100% de avance físico) <strong className="text-white">NO es automáticamente Eficaz</strong>. Solo alcanza la condición de <span className="text-emerald-400 font-bold">EFICAZ</span> tras contrastar evidencias documentales, medir la variación del indicador de línea base y recibir la validación humana explícita del Líder SG-SST.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full lg:w-auto">
            <button
              onClick={onOpenNuevoModal}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Crear Plan de Acción</span>
            </button>
            <button
              onClick={() => onNavigateTab('matriz')}
              className="px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Ver Matriz / Kanban</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. TARJETAS DE KPIS EJECUTIVOS DE EFICACIA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        
        {/* Total Planes */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Planes</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-display">{metricas.total}</span>
            <span className="text-[10px] text-slate-400 font-semibold">activos</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {metricas.borrador + metricas.pendientesAprobacion} por aprobar
          </div>
        </div>

        {/* En Ejecución */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">En Ejecución</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 font-display">{metricas.enEjecucion}</span>
            <span className="text-[10px] text-indigo-600 font-bold">avanzando</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            {metricas.aprobadas} listas para iniciar
          </div>
        </div>

        {/* En Verificación (100% Avance) */}
        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">En Verificación</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 font-display">{metricas.enVerificacion}</span>
            <span className="text-[10px] text-amber-700 font-bold">100% Avance</span>
          </div>
          <div className="text-[10px] text-amber-800 font-medium">
            Requieren dictamen técnico
          </div>
        </div>

        {/* Planes Eficaces */}
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Eficaces</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700 font-display">{metricas.eficaces}</span>
            <span className="text-[10px] text-emerald-700 font-bold">validadas</span>
          </div>
          <div className="text-[10px] text-emerald-800 font-medium">
            Impacto probado en SST
          </div>
        </div>

        {/* No Eficaces */}
        <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">No Eficaces</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-700 font-display">{metricas.noEficaces}</span>
            <span className="text-[10px] text-rose-700 font-bold">replanificar</span>
          </div>
          <div className="text-[10px] text-rose-800 font-medium">
            No lograron meta del KPI
          </div>
        </div>

        {/* Vencidas */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs space-y-2 text-white">
          <div className="flex items-center justify-between text-rose-400">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Vencidas</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-400 font-display">{metricas.vencidas}</span>
            <span className="text-[10px] text-slate-300">fuera de plazo</span>
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            Requieren ajuste de cronograma
          </div>
        </div>

      </div>

      {/* 3. METRICAS CRÍTICAS: CUMPLIMIENTO FÍSICO VS EFICACIA REAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Ratio Cumplimiento Físico */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Avance Operativo</span>
              <h3 className="font-extrabold text-slate-900 text-sm">Cumplimiento de Ejecución Física</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
              %
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black font-display text-slate-900">
              {metricas.porcentajeCumplimientoEjecucion}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              de acciones completadas en físico
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${metricas.porcentajeCumplimientoEjecucion}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Representa las acciones con avance al 100% respecto al total programado.
          </p>
        </div>

        {/* Ratio Eficacia Real */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Calidad & Resultado</span>
              <h3 className="font-extrabold text-slate-900 text-sm">Tasa de Eficacia Técnica Validada</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black font-display text-emerald-600">
              {metricas.porcentajeEficaciaReal}%
            </span>
            <span className="text-xs text-slate-500 font-medium">
              de efectividad comprobada
            </span>
          </div>

          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metricas.porcentajeEficaciaReal}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500">
            Calculado estrictamente sobre las acciones dictaminadas ({metricas.eficaces} eficaces / {metricas.eficaces + metricas.noEficaces} evaluadas).
          </p>
        </div>

        {/* Tiempo Promedio de Cierre y Evidencias */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">Trazabilidad & Agilidad</span>
              <h3 className="font-extrabold text-slate-900 text-sm">Tiempo Promedio de Cierre</h3>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black font-display text-slate-900">
              {metricas.tiempoPromedioCierreDias}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              días calendario por acción
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold">Evidencias documentadas:</span>
            <span className="font-black px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md">
              {metricas.totalEvidenciasCargadas} archivos
            </span>
          </div>
        </div>

      </div>

      {/* 4. ATENCIÓN INMEDIATA: PLANES QUE REQUIEREN ACCIÓN URGENTE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Bandeja de Verificación de Eficacia (100% Avance esperando firma técnica) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Pendientes de Dictamen de Eficacia</h3>
                <p className="text-[11px] text-slate-500">Ejecución 100% completa. Requiere verificación con indicador SST.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-extrabold rounded-full">
              {planesRequierenVerificacion.length} pendientes
            </span>
          </div>

          {planesRequierenVerificacion.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
              No hay planes acumulados en espera de dictamen técnico de eficacia.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {planesRequierenVerificacion.map(plan => (
                <div 
                  key={plan.id}
                  onClick={() => onSelectPlan(plan)}
                  className="p-3.5 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-200/70 hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {plan.codigo}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{plan.origen}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs truncate">{plan.titulo}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{plan.responsableNombre} • {plan.evidencias.length} evidencias</p>
                  </div>

                  <button className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer shadow-2xs">
                    Evaluar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bandeja de Planes No Eficaces & Vencidos (Replanificación) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-sm">Acciones Vencidas o No Eficaces</h3>
                <p className="text-[11px] text-slate-500">Requieren reajuste de causas, plazos o estrategia de intervención.</p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-rose-50 text-rose-800 border border-rose-200 text-xs font-extrabold rounded-full">
              {planesVencidos.length + planesNoEficaces.length} críticas
            </span>
          </div>

          {planesVencidos.length === 0 && planesNoEficaces.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
              Excelente: No se registran acciones vencidas ni dictámenes no eficaces.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {[...planesNoEficaces, ...planesVencidos].map(plan => (
                <div 
                  key={plan.id}
                  onClick={() => onSelectPlan(plan)}
                  className="p-3.5 bg-slate-50 hover:bg-rose-50/50 rounded-2xl border border-slate-200/70 hover:border-rose-300 transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
                        {plan.codigo}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        plan.estado === 'NO_EFICAZ' ? 'bg-rose-100 text-rose-800' : 'bg-slate-900 text-white'
                      }`}>
                        {plan.estado}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs truncate">{plan.titulo}</h4>
                    <p className="text-[11px] text-slate-500 truncate">Objetivo: {plan.fechaObjetivo} • Avance: {plan.porcentajeAvance}%</p>
                  </div>

                  <button className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer shadow-2xs">
                    Revisar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
