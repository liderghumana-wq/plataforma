import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, Plus, Trash2, Edit2, CheckCircle2, Circle, AlertCircle, Filter, Calendar, Users, FolderKanban, Check, X
} from 'lucide-react';
import { ClimateRecommendation } from '../clima.types';
import { DEFAULT_CLIMA_DIMENSIONS } from '../clima.config';
import { useEmpresa } from '../../configuracion/useEmpresa';

interface ClimaPlanAccionProps {
  synchronizedRecommendations: ClimateRecommendation[];
  onRemoveSyncRec: (id: string) => void;
}

interface ActionTask {
  id: string;
  dimensionId: string;
  title: string;
  description: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Planificada' | 'En Progreso' | 'Completada';
  responsible: string;
  targetDate: string;
}

export default function ClimaPlanAccion({ synchronizedRecommendations, onRemoveSyncRec }: ClimaPlanAccionProps) {
  const { activeCompanyId } = useEmpresa();
  const storageKey = `happyclima_tasks_${activeCompanyId}`;

  const [tasks, setTasks] = useState<ActionTask[]>([]);
  
  // Form states for creating/editing
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [formDimension, setFormDimension] = useState('liderazgo');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState<'Alta' | 'Media' | 'Baja'>('Alta');
  const [formStatus, setFormStatus] = useState<'Planificada' | 'En Progreso' | 'Completada'>('Planificada');
  const [formResponsible, setFormResponsible] = useState('');
  const [formTargetDate, setFormTargetDate] = useState('');

  // Filtering states
  const [filterDimension, setFilterDimension] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Load tasks on mount/company change
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setTasks(JSON.parse(saved));
    } else {
      // Seed initial tasks based on standard climate development if empty
      const defaultTasks: ActionTask[] = [
        {
          id: 'task-1',
          dimensionId: 'liderazgo',
          title: 'Taller de Liderazgo Situacional',
          description: 'Capacitación a mandos medios y directores en metodologías de dirección asertiva y gestión del clima.',
          priority: 'Alta',
          status: 'En Progreso',
          responsible: 'Director de Gestión Humana',
          targetDate: '2026-08-15'
        },
        {
          id: 'task-2',
          dimensionId: 'comunicacion',
          title: 'Implementación del Buzón de Sugerencias Anónimo',
          description: 'Habilitar un canal digital transparente de retroalimentación interna confidencial para todos los hubs operacionales.',
          priority: 'Alta',
          status: 'Planificada',
          responsible: 'Líder de Comunicaciones Internas',
          targetDate: '2026-07-30'
        }
      ];
      setTasks(defaultTasks);
      localStorage.setItem(storageKey, JSON.stringify(defaultTasks));
    }
  }, [activeCompanyId]);

  // Handle addition of synchronized AI recommendations
  useEffect(() => {
    if (synchronizedRecommendations.length > 0) {
      setTasks(prev => {
        const updated = [...prev];
        synchronizedRecommendations.forEach(rec => {
          // Check if already in tasks list to prevent double adding
          const exists = updated.some(t => t.id === rec.id || t.title === rec.title);
          if (!exists) {
            updated.push({
              id: rec.id || `task-sync-${Date.now()}`,
              dimensionId: rec.dimensionId,
              title: rec.title,
              description: rec.description,
              priority: rec.priority,
              status: 'Planificada',
              responsible: rec.responsible || 'Director de Gestión Humana',
              targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30 days from now
            });
            onRemoveSyncRec(rec.id);
          }
        });
        localStorage.setItem(storageKey, JSON.stringify(updated));
        return updated;
      });
    }
  }, [synchronizedRecommendations, activeCompanyId]);

  // Sync to localStorage
  const saveTasks = (newTasks: ActionTask[]) => {
    setTasks(newTasks);
    localStorage.setItem(storageKey, JSON.stringify(newTasks));
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingTaskId) {
      // Editing
      const updated = tasks.map(t => {
        if (t.id === editingTaskId) {
          return {
            ...t,
            dimensionId: formDimension,
            title: formTitle,
            description: formDesc,
            priority: formPriority,
            status: formStatus,
            responsible: formResponsible || 'Sin asignar',
            targetDate: formTargetDate || new Date().toISOString().split('T')[0]
          };
        }
        return t;
      });
      saveTasks(updated);
      setEditingTaskId(null);
    } else {
      // Adding
      const newTask: ActionTask = {
        id: `task-${Date.now()}`,
        dimensionId: formDimension,
        title: formTitle,
        description: formDesc,
        priority: formPriority,
        status: formStatus,
        responsible: formResponsible || 'Sin asignar',
        targetDate: formTargetDate || new Date().toISOString().split('T')[0]
      };
      saveTasks([newTask, ...tasks]);
    }

    // Reset fields
    resetForm();
    setIsAddingTask(false);
  };

  const resetForm = () => {
    setFormDimension('liderazgo');
    setFormTitle('');
    setFormDesc('');
    setFormPriority('Alta');
    setFormStatus('Planificada');
    setFormResponsible('');
    setFormTargetDate('');
  };

  const handleEditClick = (task: ActionTask) => {
    setEditingTaskId(task.id);
    setFormDimension(task.dimensionId);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormPriority(task.priority);
    setFormStatus(task.status);
    setFormResponsible(task.responsible);
    setFormTargetDate(task.targetDate);
    setIsAddingTask(true);
  };

  const handleDeleteTask = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea de tu plan operativo?')) {
      const filtered = tasks.filter(t => t.id !== id);
      saveTasks(filtered);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextStatus: Record<string, 'Planificada' | 'En Progreso' | 'Completada'> = {
          'Planificada': 'En Progreso',
          'En Progreso': 'Completada',
          'Completada': 'Planificada'
        };
        return {
          ...t,
          status: nextStatus[t.status]
        };
      }
      return t;
    });
    saveTasks(updated);
  };

  // Filtering logic
  const filteredTasks = tasks.filter(t => {
    const matchDim = filterDimension === 'all' || t.dimensionId === filterDimension;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchDim && matchStatus;
  });

  const getPriorityColor = (prio: string) => {
    switch (prio) {
      case 'Alta': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'Media': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completada': return 'text-emerald-700 bg-emerald-50 border-emerald-150';
      case 'En Progreso': return 'text-amber-700 bg-amber-50 border-amber-150';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Botón de Agregar y Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs uppercase">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </div>
          
          <select
            value={filterDimension}
            onChange={(e) => setFilterDimension(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="all">Todas las Dimensiones</option>
            {DEFAULT_CLIMA_DIMENSIONS.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-xs font-semibold rounded-xl text-slate-700 focus:outline-none"
          >
            <option value="all">Todos los Estados</option>
            <option value="Planificada">Planificadas</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Completada">Completadas</option>
          </select>
        </div>

        <button
          onClick={() => {
            resetForm();
            setEditingTaskId(null);
            setIsAddingTask(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 self-end sm:self-center cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Tarea</span>
        </button>
      </div>

      {/* Formulario Modal o Colapsable */}
      {isAddingTask && (
        <form onSubmit={handleSaveTask} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-50">
            <h3 className="font-extrabold text-slate-800 text-sm">
              {editingTaskId ? 'Editar Tarea Operativa' : 'Agregar Tarea Operativa al Plan'}
            </h3>
            <button 
              type="button" 
              onClick={() => setIsAddingTask(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
            {/* Título */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-slate-500">Título de la Tarea / Campaña</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Ej: Lanzamiento del Boletín de Comunicación Interna"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            {/* Dimensión */}
            <div className="space-y-1">
              <label className="text-slate-500">Dimensión de Clima Asociada</label>
              <select
                value={formDimension}
                onChange={(e) => setFormDimension(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none"
              >
                {DEFAULT_CLIMA_DIMENSIONS.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div className="md:col-span-3 space-y-1">
              <label className="text-slate-500">Descripción Detallada / Objetivos</label>
              <textarea
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Escribe aquí los objetivos de bienestar, pasos operativos o impacto esperado de esta campaña..."
                rows={3}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            {/* Responsable */}
            <div className="space-y-1">
              <label className="text-slate-500">Persona Responsable</label>
              <input
                type="text"
                value={formResponsible}
                onChange={(e) => setFormResponsible(e.target.value)}
                placeholder="Ej: Líder de Comunicaciones"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            {/* Fecha límite */}
            <div className="space-y-1">
              <label className="text-slate-500">Fecha Límite (Target)</label>
              <input
                type="date"
                value={formTargetDate}
                onChange={(e) => setFormTargetDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500 text-slate-800"
              />
            </div>

            {/* Prioridad y Estado */}
            <div className="grid grid-cols-2 gap-3 md:col-span-1">
              <div className="space-y-1">
                <label className="text-slate-500">Prioridad</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 focus:outline-none"
                >
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-slate-500">Estado</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 focus:outline-none"
                >
                  <option value="Planificada">Planificada</option>
                  <option value="En Progreso">En Progreso</option>
                  <option value="Completada">Completada</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddingTask(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-250 text-slate-600 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl cursor-pointer"
            >
              Guardar Tarea
            </button>
          </div>
        </form>
      )}

      {/* Lista de Tareas en Formato de Tarjetas Operativas */}
      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const associatedDim = DEFAULT_CLIMA_DIMENSIONS.find(d => d.id === task.dimensionId);
            
            return (
              <div 
                key={task.id} 
                className={`bg-white p-5 rounded-3xl border shadow-3xs flex flex-col justify-between space-y-4 transition-all group ${
                  task.status === 'Completada' ? 'border-slate-100 opacity-80' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                {/* Header card */}
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 truncate max-w-[150px]">
                      {associatedDim?.name || 'Dimensión General'}
                    </span>
                    
                    <button
                      onClick={() => handleToggleStatus(task.id)}
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full border cursor-pointer transition-all ${getStatusColor(task.status)}`}
                      title="Clic para cambiar de estado"
                    >
                      {task.status}
                    </button>
                  </div>
                  
                  <div className="flex gap-2.5 items-start">
                    <button 
                      onClick={() => handleToggleStatus(task.id)}
                      className="mt-1 text-slate-400 hover:text-indigo-600 cursor-pointer shrink-0"
                    >
                      {task.status === 'Completada' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                    
                    <h4 className={`text-xs font-black text-slate-800 font-display leading-tight ${task.status === 'Completada' ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h4>
                  </div>
                </div>

                {/* Description */}
                <p className={`text-xs text-slate-500 leading-relaxed font-semibold pl-7 ${task.status === 'Completada' ? 'line-through text-slate-400' : ''}`}>
                  {task.description}
                </p>

                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-50 pl-7 text-[10px] text-slate-400 font-bold">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-300" />
                      <span className="truncate max-w-[100px]">{task.responsible}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-300" />
                      <span>{task.targetDate}</span>
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="p-1 text-slate-300 hover:text-indigo-600 rounded cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-slate-300 hover:text-red-600 rounded cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-2xs text-center">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-extrabold text-slate-800 text-sm">Sin tareas operativas</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">No hay tareas que coincidan con los filtros activos. Añade una nueva tarea o sincroniza recomendaciones de IA para comenzar.</p>
        </div>
      )}

    </div>
  );
}
