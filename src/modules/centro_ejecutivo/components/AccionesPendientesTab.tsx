import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  AlertTriangle, 
  ArrowRight, 
  Filter, 
  Plus, 
  Check, 
  ExternalLink,
  User,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import { ExecutiveAction, ActionStatus, ActionPriority } from '../types/centroEjecutivo.types';
import { accionesService } from '../services/accionesService';

interface AccionesPendientesTabProps {
  activeCompanyId: string;
  onNavigateSection?: (sectionId: string) => void;
}

export const AccionesPendientesTab: React.FC<AccionesPendientesTabProps> = ({
  activeCompanyId,
  onNavigateSection
}) => {
  const [filter, setFilter] = useState<'ALL' | ActionStatus>('ALL');
  const [acciones, setAcciones] = useState<ExecutiveAction[]>(() => accionesService.getAcciones(activeCompanyId));
  const [selectedAction, setSelectedAction] = useState<ExecutiveAction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionNote, setActionNote] = useState('');

  const refreshActions = () => {
    setAcciones(accionesService.getAcciones(activeCompanyId));
  };

  const filtered = acciones.filter(a => {
    if (filter === 'ALL') return true;
    return a.estado === filter;
  });

  const countPendiente = acciones.filter(a => a.estado === 'PENDIENTE').length;
  const countGestion = acciones.filter(a => a.estado === 'EN_GESTION').length;
  const countVencida = acciones.filter(a => a.estado === 'VENCIDA').length;
  const countCompletada = acciones.filter(a => a.estado === 'COMPLETADA').length;

  const handleUpdateStatus = (action: ExecutiveAction, newStatus: ActionStatus) => {
    accionesService.cambiarEstadoAccion(
      activeCompanyId,
      action.id,
      newStatus,
      'Responsable Ejecutivo',
      actionNote || undefined
    );
    setActionNote('');
    setModalOpen(false);
    setSelectedAction(null);
    refreshActions();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            Bandeja Unificada de Compromisos
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Centro de Acciones & Seguimiento
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Flujo de trabajo centralizado sin duplicación de tareas de Onboarding ni de planes de intervención SG-SST.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200">
            Total: {acciones.length} Acciones
          </span>
        </div>
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
          Todas ({acciones.length})
        </button>

        <button
          onClick={() => setFilter('PENDIENTE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'PENDIENTE'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          🟡 Pendientes ({countPendiente})
        </button>

        <button
          onClick={() => setFilter('EN_GESTION')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'EN_GESTION'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          🔵 En Gestión ({countGestion})
        </button>

        <button
          onClick={() => setFilter('VENCIDA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'VENCIDA'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          🔴 Vencidas ({countVencida})
        </button>

        <button
          onClick={() => setFilter('COMPLETADA')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filter === 'COMPLETADA'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          🟢 Completadas ({countCompletada})
        </button>
      </div>

      {/* Action Cards List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No hay acciones registradas en esta categoría.
          </div>
        ) : (
          filtered.map((action) => {
            const isDone = action.estado === 'COMPLETADA';
            const isCritical = action.prioridad === 'ALTA';

            return (
              <div 
                key={action.id}
                className={`p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-colors ${
                  isDone ? 'bg-emerald-50/20' : isCritical ? 'hover:bg-rose-50/20' : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="shrink-0 mt-1">
                    {isDone ? (
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        action.estado === 'EN_GESTION'
                          ? 'bg-indigo-100 text-indigo-700'
                          : action.estado === 'VENCIDA'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        <Clock className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900">{action.titulo}</h4>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        action.prioridad === 'ALTA'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : action.prioridad === 'MEDIA'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        Prioridad {action.prioridad}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        Módulo: {action.moduloRelacionado}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {action.descripcion}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <strong>Responsable:</strong> {action.responsable}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <strong>Límite:</strong> {action.fechaLimite}
                      </span>
                      <span>
                        <strong>Origen:</strong> {action.origen}
                      </span>
                    </div>

                    {action.evidencia && (
                      <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 inline-block px-2.5 py-0.5 rounded-md mt-1">
                        Evidencia: {action.evidencia}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status action trigger */}
                <div className="shrink-0 flex items-center gap-2 w-full lg:w-auto justify-end">
                  <button
                    onClick={() => {
                      setSelectedAction(action);
                      setModalOpen(true);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Gestionar Estado ({action.estado})
                  </button>

                  {!isDone && (
                    <button
                      onClick={() => handleUpdateStatus(action, 'COMPLETADA')}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Marcar Completada
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for updating action status and audit note */}
      {modalOpen && selectedAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <h3 className="text-base font-bold text-slate-900">
              Actualizar Estado de Acción
            </h3>
            <p className="text-xs text-slate-500">
              {selectedAction.titulo}
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Seleccione nuevo estado:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['PENDIENTE', 'EN_GESTION', 'VENCIDA', 'COMPLETADA'] as ActionStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleUpdateStatus(selectedAction, st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      selectedAction.estado === st
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Nota de Auditoría / Justificación (Opcional):
              </label>
              <textarea
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
                placeholder="Indique el motivo del cambio o el avance realizado..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none h-20 resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => {
                  setModalOpen(false);
                  setSelectedAction(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
