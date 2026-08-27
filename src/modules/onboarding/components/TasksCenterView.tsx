import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  Filter, 
  Clock, 
  CheckCheck,
  ListTodo,
  ExternalLink
} from 'lucide-react';
import { onboardingService } from '../services/onboardingService';
import { OnboardingTask } from '../types/onboarding.types';

interface TasksCenterViewProps {
  activeCompanyId: string;
  onNavigateStep: (stepNumber: number) => void;
  onNavigateSection?: (sectionId: string) => void;
}

export const TasksCenterView: React.FC<TasksCenterViewProps> = ({
  activeCompanyId,
  onNavigateStep,
  onNavigateSection
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ACCION_REQUERIDA' | 'REVISION_RECOMENDADA' | 'COMPLETADO'>('ALL');
  const tasks = onboardingService.getTasksCenter(activeCompanyId);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'ALL') return true;
    return t.categoria === filter;
  });

  const countAccion = tasks.filter(t => t.categoria === 'ACCION_REQUERIDA').length;
  const countRevision = tasks.filter(t => t.categoria === 'REVISION_RECOMENDADA').length;
  const countCompletado = tasks.filter(t => t.categoria === 'COMPLETADO').length;

  const stepMapping: Record<string, number> = {
    empresa: 2,
    estructura: 3,
    colaboradores: 4,
    calidad_datos: 5,
    encuesta: 6,
    indicadores: 7
  };

  const handleActionClick = (task: OnboardingTask) => {
    const stepNumber = stepMapping[task.moduloRelacionado];
    if (stepNumber) {
      onNavigateStep(stepNumber);
    } else if (task.moduloRelacionado && onNavigateSection) {
      onNavigateSection(task.moduloRelacionado);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <ListTodo className="w-4 h-4" />
            Centro de Control Operativo
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">Tareas y Pendientes de Activación</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Lista priorizada de acciones requeridas para completar la configuración y asegurar la validez de los datos.
          </p>
        </div>

        <span className="inline-flex items-center px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
          [A] Real State
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filter === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Todas ({tasks.length})
        </button>

        <button
          onClick={() => setFilter('ACCION_REQUERIDA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'ACCION_REQUERIDA'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          🔴 Acción requerida ({countAccion})
        </button>

        <button
          onClick={() => setFilter('REVISION_RECOMENDADA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'REVISION_RECOMENDADA'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          🟡 Revisión recomendada ({countRevision})
        </button>

        <button
          onClick={() => setFilter('COMPLETADO')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'COMPLETADO'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          🟢 Completado ({countCompletado})
        </button>
      </div>

      {/* Task List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No hay tareas en esta categoría.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCritical = task.categoria === 'ACCION_REQUERIDA';
            const isWarning = task.categoria === 'REVISION_RECOMENDADA';
            const isDone = task.categoria === 'COMPLETADO' || task.estado === 'RESUELTA';

            return (
              <div 
                key={task.id}
                className={`p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                  isDone ? 'bg-emerald-50/10' : isCritical ? 'hover:bg-rose-50/20' : 'hover:bg-amber-50/20'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="shrink-0 mt-1">
                    {isDone ? (
                      <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : isCritical ? (
                      <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{task.titulo}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        task.prioridad === 'ALTA'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : task.prioridad === 'MEDIA'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        Prioridad {task.prioridad}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">
                        Módulo: {task.moduloRelacionado}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {task.descripcion}
                    </p>

                    {task.impactoEnHealthScore > 0 && (
                      <div className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 inline-block px-2.5 py-0.5 rounded-md mt-1">
                        Impacto: +{task.impactoEnHealthScore} pts Health Score
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0 w-full sm:w-auto flex justify-end">
                  <button
                    onClick={() => handleActionClick(task)}
                    className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isDone
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : isCritical
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
                        : 'bg-amber-600 hover:bg-amber-500 text-white shadow-xs'
                    }`}
                  >
                    {task.accionLabel || (isDone ? 'Verificar' : 'Resolver Ahora')}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
