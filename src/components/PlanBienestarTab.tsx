import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Check, 
  AlertCircle, 
  Users, 
  Calendar,
  Filter,
  CheckCircle,
  X,
  UserCheck
} from 'lucide-react';
import { Recommendation } from '../types';
import { useEmpresa } from '../modules/configuracion/useEmpresa';

interface PlanBienestarTabProps {
  recommendations: Recommendation[];
  onToggleStatus: (id: string, newStatus: any) => void;
  onAddRecommendation: (rec: Omit<Recommendation, 'id'>) => void;
}

export default function PlanBienestarTab({ 
  recommendations, 
  onToggleStatus,
  onAddRecommendation 
}: PlanBienestarTabProps) {
  const { config } = useEmpresa();
  const companyName = config?.nombreEmpresa || 'la empresa';
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterPriority, setFilterPriority] = useState<'Todas' | 'Alta' | 'Media' | 'Baja'>('Todas');
  
  // Estados para nueva recomendación
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('Salud Mental');
  const [newPriority, setNewPriority] = useState<'Alta' | 'Media' | 'Baja'>('Alta');
  const [newResponsible, setNewResponsible] = useState('Coordinador SG-SST');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    onAddRecommendation({
      category: newCategory,
      title: newTitle,
      desc: newDesc,
      priority: newPriority,
      status: 'Planificada',
      responsible: newResponsible
    });

    // Reset form
    setNewTitle('');
    setNewDesc('');
    setShowAddForm(false);
  };

  const filteredRecs = recommendations.filter(rec => {
    if (filterPriority === 'Todas') return true;
    return rec.priority === filterPriority;
  });

  // Calcular estadísticas simples del plan de bienestar
  const total = recommendations.length;
  const implemented = recommendations.filter(r => r.status === 'Implementada').length;
  const inProgress = recommendations.filter(r => r.status === 'En Progreso').length;
  const planned = recommendations.filter(r => r.status === 'Planificada').length;
  
  const progressPercentage = total > 0 ? Math.round((implemented / total) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Panel Superior de Progreso del Plan */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Progreso */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-5 rounded-2xl text-white space-y-3 shadow-md md:col-span-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-200">Avance del Plan de Bienestar</span>
            <span className="text-xs bg-indigo-500/30 text-cyan-300 font-extrabold px-2.5 py-1 rounded-full border border-indigo-400/25">SG-SST 2026</span>
          </div>

          <div className="flex items-end justify-between pt-2">
            <div>
              <h4 className="text-3xl font-black font-display tracking-tight">{progressPercentage}%</h4>
              <p className="text-[10px] text-indigo-200 font-medium">De actividades ejecutadas o implementadas</p>
            </div>
            
            <div className="text-right text-xs text-indigo-100">
              <span className="font-bold text-white">{implemented}</span> de {total} campañas activas
            </div>
          </div>

          <div className="w-full bg-indigo-950/40 h-3 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {/* Totales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actividades en Progreso</span>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{inProgress} camp.</h3>
          <p className="text-[10px] text-slate-500 font-medium">Requieren monitoreo inmediato del COPASST</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Campañas Planificadas</span>
          <h3 className="text-2xl font-black text-slate-800 mt-2">{planned} camp.</h3>
          <p className="text-[10px] text-slate-500 font-medium">Listas para arranque presupuestal</p>
        </div>

      </div>

      {/* Cabecera del Listado con Filtros y Botón Añadir */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Cronograma de Campañas de Intervención</h3>
            <p className="text-xs text-slate-500">Aprobadas por la gerencia de {companyName} y alineadas con la Batería Psicosocial.</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Filtro Prioridad */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60 w-full sm:w-auto justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Prioridad</span>
            <div className="flex gap-1">
              {(['Todas', 'Alta', 'Media', 'Baja'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(p)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    filterPriority === p 
                      ? 'bg-slate-900 text-white shadow-sm' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(true)}
            className="px-3.5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-700 transition-all shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Campaña</span>
          </button>
        </div>

      </div>

      {/* Formulario Modal Emergente para Crear Campaña */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-950/55 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scale-in">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-indigo-600" />
                <span>Nueva Campaña de Bienestar SST</span>
              </h3>
              <button 
                onClick={() => setShowAddForm(false)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Título de la Campaña / Actividad</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ej: Pausas Auditivas con Diadema de Silencio"
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Descripción de Intervención</label>
                <textarea 
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Detalla cómo se ejecutará, horarios, canales de comunicación..."
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categoría</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Salud Mental">Salud Mental</option>
                    <option value="Ergonomía">Ergonomía</option>
                    <option value="Salud Física">Salud Física</option>
                    <option value="Estilo de Vida">Estilo de Vida</option>
                    <option value="Formación">Formación</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prioridad</label>
                  <select 
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Responsable Interno</label>
                <input 
                  type="text" 
                  value={newResponsible}
                  onChange={(e) => setNewResponsible(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2.5 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/10"
                >
                  Guardar Campaña
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Lista de Campañas y Tarjetas de Intervención */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecs.map((rec) => {
          
          let priorityColor = 'bg-rose-50 text-rose-700 border-rose-100';
          if (rec.priority === 'Media') priorityColor = 'bg-amber-50 text-amber-700 border-amber-100';
          if (rec.priority === 'Baja') priorityColor = 'bg-slate-50 text-slate-600 border-slate-150';

          return (
            <div 
              key={rec.id} 
              className="bg-white p-5 rounded-2xl shadow-sm border border-slate-150 flex flex-col justify-between hover:shadow-md hover:border-indigo-100 transition-all space-y-4"
            >
              <div className="space-y-3">
                
                {/* Cabecera de tarjeta */}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md border border-slate-200/60 uppercase">
                    {rec.category}
                  </span>
                  
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${priorityColor}`}>
                    Prioridad {rec.priority}
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">{rec.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{rec.desc}</p>
                </div>

                {/* Info adicional */}
                <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-[10px] text-slate-500">
                  <div className="flex justify-between">
                    <span>Responsable:</span>
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rec.responsible}</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plazo Ejecución:</span>
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Plan Anual 2026</span>
                    </span>
                  </div>
                </div>

              </div>

              {/* Selector de Estado interactivo */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estado Actual</span>
                
                <div className="flex gap-1.5">
                  {(['Planificada', 'En Progreso', 'Implementada'] as const).map((status) => {
                    const isCurrent = rec.status === status;
                    let btnColor = 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100';
                    
                    if (isCurrent) {
                      if (status === 'Implementada') btnColor = 'bg-emerald-600 text-white font-bold border-emerald-600 shadow-sm shadow-emerald-600/10';
                      if (status === 'En Progreso') btnColor = 'bg-amber-500 text-white font-bold border-amber-500 shadow-sm shadow-amber-500/10';
                      if (status === 'Planificada') btnColor = 'bg-indigo-600 text-white font-bold border-indigo-600 shadow-sm shadow-indigo-600/10';
                    }

                    return (
                      <button
                        key={status}
                        onClick={() => onToggleStatus(rec.id, status)}
                        className={`text-[9px] font-bold px-2 py-1.5 rounded-lg border transition-all cursor-pointer ${btnColor}`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
