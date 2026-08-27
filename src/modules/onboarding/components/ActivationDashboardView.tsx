import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  Award, 
  Sparkles, 
  FileText, 
  Download, 
  Building2, 
  Users, 
  ShieldCheck, 
  Clock, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { onboardingService } from '../services/onboardingService';

interface ActivationDashboardViewProps {
  activeCompanyId: string;
  onNavigateStep: (stepNumber: number) => void;
  onNavigateTab: (tabId: string) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const ActivationDashboardView: React.FC<ActivationDashboardViewProps> = ({
  activeCompanyId,
  onNavigateStep,
  onNavigateTab,
  onNavigateSection
}) => {
  const healthScore = onboardingService.getHealthScore(activeCompanyId);
  const checklist = onboardingService.getActivationChecklist(activeCompanyId);
  const tasks = onboardingService.getTasksCenter(activeCompanyId);
  const indicators = onboardingService.getIndicatorsChecklist(activeCompanyId);

  const readyIndicatorsCount = indicators.filter(i => i.estado === 'PROCESADO' || i.estado === 'DISPONIBLE').length;
  const criticalTasks = tasks.filter(t => t.categoria === 'ACCION_REQUERIDA');

  const handleExportReport = () => {
    const reportText = `=====================================================
INFORME DE ACTIVACIÓN Y ESTADO DE IMPLEMENTACIÓN
INSIGHT PEOPLE IA / HAPPY INSIGHT SG-SST
=====================================================
Empresa ID: ${healthScore.companyId}
Fecha de Emisión: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}
Health Score de Implementación: ${healthScore.scoreTotal ?? 'N/A'} / 100 (${healthScore.estado})
Interpretación: ${healthScore.interpretacion}
Progreso de Checklist: ${checklist.porcentajeAvance}% (${checklist.completados}/${checklist.totalItems} pasos)
Indicadores Operativos: ${readyIndicatorsCount} de ${indicators.length}

DESGLOSE PONDERADO DEL HEALTH SCORE:
${healthScore.componentes.map((c, i) => `${i + 1}. ${c.nombre}: ${c.puntajeObtenido}/100 (Ponderado: ${c.puntajePonderado} pts - Peso: ${c.pesoPct}%) [${c.estado}] - Evidencia: ${c.evidenciaReal}`).join('\n')}

TAREAS PENDIENTES PRIORITARIAS:
${tasks.map(t => `- [${t.categoria}] (${t.prioridad}) ${t.titulo}: ${t.descripcion}`).join('\n')}

RECOMENDACIONES POR COMPONENTE:
${healthScore.componentes.map((c, i) => `${i + 1}. ${c.nombre}: ${c.recomendacion}`).join('\n')}

=====================================================
Generado automáticamente con gobernanza de datos estricta.
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Informe_Activacion_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100 uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            Estado Global de Implementación
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Dashboard de Activación & Onboarding
          </h1>
          <p className="text-sm text-slate-500 max-w-xl">
            Resumen ejecutivo del estado de parametrización, calidad de datos y disponibilidad de módulos para la toma de decisiones.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Exportar Informe de Activación
          </button>
          <button
            onClick={() => onNavigateTab('flow')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Abrir Asistente Guiado
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score Card */}
        <div 
          onClick={() => onNavigateTab('health')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Health Score</span>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-indigo-600">{healthScore.scoreTotal ?? 'N/A'}</span>
            <span className="text-sm text-slate-400 font-semibold">/ 100</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${(healthScore.scoreTotal || 0) >= 85 ? 'bg-emerald-500' : (healthScore.scoreTotal || 0) >= 70 ? 'bg-indigo-500' : (healthScore.scoreTotal || 0) >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${healthScore.scoreTotal || 0}%` }}
            />
          </div>
          <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 pt-1">
            Ver desglose ponderado <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Checklist Progress Card */}
        <div 
          onClick={() => onNavigateTab('checklist')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avance Checklist</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">{checklist.porcentajeAvance}%</span>
            <span className="text-sm text-slate-400 font-semibold">({checklist.completados}/{checklist.totalItems})</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${checklist.porcentajeAvance}%` }}
            />
          </div>
          <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 pt-1">
            Ver lista de verificación <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Indicators Ready Card */}
        <div 
          onClick={() => onNavigateTab('flow')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Indicadores Listos</span>
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-900">{readyIndicatorsCount}</span>
            <span className="text-sm text-slate-400 font-semibold">/ {indicators.length}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${indicators.length > 0 ? (readyIndicatorsCount / indicators.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 pt-1">
            Revisar disponibilidad <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Pending Actions Card */}
        <div 
          onClick={() => onNavigateTab('tasks')}
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones Críticas</span>
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-rose-600">{criticalTasks.length}</span>
            <span className="text-sm text-slate-400 font-semibold">pendientes</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-rose-500 rounded-full"
              style={{ width: `${Math.min(100, criticalTasks.length * 25)}%` }}
            />
          </div>
          <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1 pt-1">
            Ver centro de tareas <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Grid: Tareas Críticas & Recomendaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Tasks Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertCircle className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Tareas Prioritarias Requeridas</h3>
            </div>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Ver todas ({tasks.length})
            </button>
          </div>

          <div className="space-y-2.5">
            {tasks.slice(0, 4).map((task) => (
              <div 
                key={task.id}
                className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${task.categoria === 'ACCION_REQUERIDA' ? 'bg-rose-500' : task.categoria === 'REVISION_RECOMENDADA' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                    <h5 className="text-xs font-bold text-slate-900 truncate">{task.titulo}</h5>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{task.descripcion}</p>
                </div>

                <button
                  onClick={() => {
                    if (onNavigateSection) onNavigateSection(task.moduloRelacionado);
                    else onNavigateTab('flow');
                  }}
                  className="px-3 py-1 bg-white hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg border border-slate-200 shrink-0 cursor-pointer"
                >
                  {task.accionLabel}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Health Recommendations Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Recomendaciones del Motor</h3>
            </div>
            <button
              onClick={() => onNavigateTab('health')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
            >
              Ver Health Score
            </button>
          </div>

          <div className="space-y-2.5">
            {healthScore.componentes.slice(0, 3).map((comp, i) => (
              <div key={i} className="p-3.5 bg-indigo-50/40 rounded-2xl border border-indigo-100 flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900">{comp.nombre}</div>
                  <div className="leading-relaxed font-normal text-slate-600">{comp.recomendacion}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
