import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  ListTodo, 
  Briefcase, 
  Calendar, 
  ChevronDown, 
  SlidersHorizontal 
} from 'lucide-react';
import { PsicosocialActionPlanItem, PsicosocialData } from '../psicosocial.types';

interface PsicosocialInterventionProps {
  data: PsicosocialData;
}

export const PsicosocialIntervention: React.FC<PsicosocialInterventionProps> = ({ data }) => {
  const [items, setItems] = useState<PsicosocialActionPlanItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterPriority, setFilterPriority] = useState<string>('todos');

  // Form states for creating a new action
  const [showAddForm, setShowAddForm] = useState(false);
  const [newFactor, setNewFactor] = useState('');
  const [newObjective, setNewObjective] = useState('');
  const [newActivity, setNewActivity] = useState('');
  const [newResponsible, setNewResponsible] = useState('Gestión Humana');
  const [newDate, setNewDate] = useState('Octubre 2026');
  const [newIndicator, setNewIndicator] = useState('');
  const [newCost, setNewCost] = useState<number>(0);
  const [newPriority, setNewPriority] = useState<'Alta' | 'Media' | 'Baja'>('Media');

  // Load preset actions or stored actions from localStorage
  useEffect(() => {
    const storageKey = `psicosocial_plan_items_${data.totalParticipants}_${data.globalScore}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (e) {
        generateInitialPlan();
      }
    } else {
      generateInitialPlan();
    }
  }, [data]);

  const generateInitialPlan = () => {
    // Generate intelligent default actions based on the actual top risk dimensions
    const sortedDims = [...data.dimensions].sort((a, b) => b.score - a.score);
    const criticalDims = sortedDims.slice(0, 3);

    const initialPlan: PsicosocialActionPlanItem[] = criticalDims.map((dim, idx) => {
      let objective = '';
      let activity = '';
      let indicator = '';
      let cost = 1500000;

      switch (dim.dimensionId) {
        case 'liderazgo':
          objective = 'Capacitar a los líderes de área en comunicación asertiva y liderazgo empático.';
          activity = 'Taller formativo quincenal: "Liderazgo Inspirador y Salud Laboral".';
          indicator = 'Porcentaje de jefes formados / Encuesta de feedback de liderazgo.';
          cost = 3500000;
          break;
        case 'control_trabajo':
          objective = 'Aumentar la autonomía y participación en la toma de decisiones operativas.';
          activity = 'Mesas de co-creación y círculos de calidad para mejoras en procesos del área.';
          indicator = 'Proyectos de mejora implementados / Índice de participación.';
          cost = 800000;
          break;
        case 'demandas_trabajo':
          objective = 'Regularizar los tiempos y volumen de trabajo para disminuir la sobrecarga.';
          activity = 'Estudio de cargas laborales y rediseño de flujos de trabajo en áreas críticas.';
          indicator = 'Horas extra registradas / Tasa de cumplimiento de metas.';
          cost = 4500000;
          break;
        case 'recompensas':
          objective = 'Mejorar el reconocimiento del desempeño e incentivos no monetarios.';
          activity = 'Lanzamiento del programa de salario emocional y reconocimiento al esfuerzo.';
          indicator = 'Índice de retención / Puntaje de favorabilidad en recompensas.';
          cost = 2000000;
          break;
        case 'jornada':
          objective = 'Establecer lineamientos claros de desconexión laboral y balance vida-trabajo.';
          activity = 'Políticas y capacitación en optimización de reuniones y desconexión digital.';
          indicator = 'Horario promedio de salida / Encuesta de satisfacción de jornada.';
          cost = 500000;
          break;
        default:
          objective = `Mitigar los factores desencadenantes del riesgo en la dimensión ${dim.name}.`;
          activity = `Campañas de sensibilización y talleres prácticos enfocados en ${dim.name}.`;
          indicator = `Puntaje promedio en próximas evaluaciones para ${dim.name}.`;
          cost = 1000000;
      }

      return {
        id: `plan-item-${idx + 1}`,
        factor: dim.name,
        objective,
        activity,
        responsible: 'Gestión Humana / Seguridad y Salud en el Trabajo',
        date: 'Plazo Q4 2026',
        indicator,
        cost,
        priority: dim.score >= 60 ? 'Alta' : 'Media',
        status: 'Planificada'
      };
    });

    setItems(initialPlan);
    savePlan(initialPlan);
  };

  const savePlan = (updatedList: PsicosocialActionPlanItem[]) => {
    const storageKey = `psicosocial_plan_items_${data.totalParticipants}_${data.globalScore}`;
    localStorage.setItem(storageKey, JSON.stringify(updatedList));
  };

  const handleStatusChange = (id: string, newStatus: 'Planificada' | 'En Proceso' | 'Completada') => {
    const updated = items.map(item => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    setItems(updated);
    savePlan(updated);
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    savePlan(updated);
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFactor || !newObjective || !newActivity) return;

    const newItem: PsicosocialActionPlanItem = {
      id: `plan-item-custom-${Date.now()}`,
      factor: newFactor,
      objective: newObjective,
      activity: newActivity,
      responsible: newResponsible,
      date: newDate,
      indicator: newIndicator || 'Puntaje de favorabilidad en re-evaluación',
      cost: Number(newCost) || 0,
      priority: newPriority,
      status: 'Planificada'
    };

    const updated = [...items, newItem];
    setItems(updated);
    savePlan(updated);

    // Reset Form
    setShowAddForm(false);
    setNewFactor('');
    setNewObjective('');
    setNewActivity('');
    setNewResponsible('Gestión Humana');
    setNewDate('Octubre 2026');
    setNewIndicator('');
    setNewCost(0);
    setNewPriority('Media');
  };

  // KPIs
  const totalBudget = items.reduce((acc, item) => acc + item.cost, 0);
  const completedCount = items.filter(item => item.status === 'Completada').length;
  const executionRate = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
  const criticalCount = items.filter(item => item.priority === 'Alta').length;

  // Filtered list
  const filteredItems = items.filter(item => {
    const statusMatch = filterStatus === 'todos' || item.status === filterStatus;
    const priorityMatch = filterPriority === 'todos' || item.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  return (
    <div id="psicosocial-intervention-root" className="space-y-8">
      {/* KPIs de Plan de Acción */}
      <div id="intervention-kpis" className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div id="card-total-actions" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Acciones Definidas</span>
            <span className="text-2xl font-bold text-slate-800 font-mono">{items.length}</span>
          </div>
        </div>

        <div id="card-execution-rate" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Tasa de Ejecución</span>
            <span className="text-2xl font-bold text-slate-800 font-mono">{executionRate}%</span>
          </div>
        </div>

        <div id="card-total-budget" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Presupuesto Estimado</span>
            <span className="text-2xl font-bold text-slate-800 font-mono">
              ${new Intl.NumberFormat('es-CO').format(totalBudget)}
            </span>
          </div>
        </div>

        <div id="card-critical-priority" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-slate-500 block">Focos de Alta Prioridad</span>
            <span className="text-2xl font-bold text-slate-800 font-mono">{criticalCount}</span>
          </div>
        </div>
      </div>

      {/* Controles de Filtros e Intervención */}
      <div id="controls-section" className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Filtros */}
        <div id="plan-filters" className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filtrar acciones:</span>
          </div>

          <select
            id="select-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none focus:border-indigo-500"
          >
            <option value="todos">Todos los Estados</option>
            <option value="Planificada">Planificada</option>
            <option value="En Proceso">En Proceso</option>
            <option value="Completada">Completada</option>
          </select>

          <select
            id="select-priority"
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 focus:outline-none focus:border-indigo-500"
          >
            <option value="todos">Todas las Prioridades</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        <button
          id="toggle-add-form-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          Nueva Actividad de Intervención
        </button>
      </div>

      {/* Formulario de Adición (Desplegable) */}
      {showAddForm && (
        <form
          id="add-action-form"
          onSubmit={handleAddAction}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-md grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in"
        >
          <div className="col-span-1 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Dimensión / Factor</label>
              <input
                type="text"
                required
                value={newFactor}
                onChange={(e) => setNewFactor(e.target.value)}
                placeholder="Ej: Liderazgo y Relaciones"
                className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Responsable</label>
              <input
                type="text"
                required
                value={newResponsible}
                onChange={(e) => setNewResponsible(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Plazo Estimado</label>
                <input
                  type="text"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Prioridad</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs"
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
            </div>
          </div>

          <div className="col-span-2 space-y-4 flex flex-col justify-between">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Objetivo del Plan</label>
                <textarea
                  required
                  rows={2}
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Ej: Lograr capacitar a toda la planta en mitigación..."
                  className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Actividad Específica</label>
                <textarea
                  required
                  rows={2}
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="Ej: Tres talleres interactivos de asertividad con líderes..."
                  className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Indicador de Éxito</label>
                <input
                  type="text"
                  value={newIndicator}
                  onChange={(e) => setNewIndicator(e.target.value)}
                  placeholder="Ej: Cobertura del programa > 90%"
                  className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Presupuesto en COP ($)</label>
                <input
                  type="number"
                  value={newCost || ''}
                  onChange={(e) => setNewCost(Number(e.target.value))}
                  placeholder="Ej: 3000000"
                  className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="py-2 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Guardar Actividad
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Listado de Actividades / Grid de Tarjetas */}
      <div id="plan-list-grid" className="grid grid-cols-1 gap-4">
        {filteredItems.length === 0 ? (
          <div id="empty-plan-message" className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
            No se encontraron actividades de intervención para los filtros seleccionados.
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              id={`plan-card-${item.id}`}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              {/* Información General */}
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full capitalize">
                    {item.factor}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    item.priority === 'Alta' 
                      ? 'bg-red-50 text-red-600 border-red-100' 
                      : item.priority === 'Media'
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    Prioridad {item.priority}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Objetivo:</h4>
                    <p>{item.objective}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm mb-1">Actividad Planeada:</h4>
                    <p className="font-medium text-slate-700">{item.activity}</p>
                  </div>
                </div>

                {/* Subdatos */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-slate-50 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Resp: {item.responsible}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Plazo: {item.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <ListTodo className="w-3.5 h-3.5 text-slate-400" />
                    Indicador: {item.indicator}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    Costo: ${new Intl.NumberFormat('es-CO').format(item.cost)}
                  </span>
                </div>
              </div>

              {/* Botones de Control e Interacción */}
              <div className="flex items-center gap-3 shrink-0 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  {(['Planificada', 'En Proceso', 'Completada'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleStatusChange(item.id, st)}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                        item.status === st
                          ? st === 'Completada'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : st === 'En Proceso'
                            ? 'bg-amber-400 text-slate-800 shadow-sm'
                            : 'bg-slate-200 text-slate-700'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                  title="Eliminar Actividad"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
