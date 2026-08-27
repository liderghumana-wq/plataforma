import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Layers, 
  Kanban, 
  Table as TableIcon, 
  Sparkles, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  FileText, 
  ArrowUpDown, 
  ExternalLink,
  Tag,
  AlertTriangle,
  Flame,
  Award
} from 'lucide-react';
import { 
  PlanAccionItem, 
  EstadoPlanAccion, 
  PrioridadPlan, 
  CategoriaPlan, 
  OrigenHallazgo 
} from '../types/planesAccion.types';

interface MatrizPlanesAccionProps {
  planes: PlanAccionItem[];
  onSelectPlan: (plan: PlanAccionItem) => void;
  onOpenNuevoModal: () => void;
  companyId: string;
}

export const MatrizPlanesAccion: React.FC<MatrizPlanesAccionProps> = ({
  planes,
  onSelectPlan,
  onOpenNuevoModal
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('TODAS');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('TODAS');
  const [filtroOrigen, setFiltroOrigen] = useState<string>('TODOS');
  const [orden, setOrden] = useState<'recientes' | 'vencimiento' | 'avance'>('recientes');

  // Filtrado
  const filteredPlanes = planes.filter(p => {
    if (busqueda) {
      const q = busqueda.toLowerCase();
      const match = 
        p.codigo.toLowerCase().includes(q) ||
        p.titulo.toLowerCase().includes(q) ||
        p.responsableNombre.toLowerCase().includes(q) ||
        p.descripcion.toLowerCase().includes(q) ||
        p.hallazgoDetalle.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (filtroEstado !== 'TODOS' && p.estado !== filtroEstado) return false;
    if (filtroPrioridad !== 'TODAS' && p.prioridad !== filtroPrioridad) return false;
    if (filtroCategoria !== 'TODAS' && p.categoria !== filtroCategoria) return false;
    if (filtroOrigen !== 'TODOS' && p.origen !== filtroOrigen) return false;

    return true;
  });

  // Ordenamiento
  const sortedPlanes = [...filteredPlanes].sort((a, b) => {
    if (orden === 'vencimiento') {
      return a.fechaObjetivo.localeCompare(b.fechaObjetivo);
    }
    if (orden === 'avance') {
      return b.porcentajeAvance - a.porcentajeAvance;
    }
    return b.fechaCreacion.localeCompare(a.fechaCreacion);
  });

  const getStatusBadge = (estado: EstadoPlanAccion) => {
    switch (estado) {
      case 'BORRADOR':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'PENDIENTE_APROBACION':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'APROBADA':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'EN_EJECUCION':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'EN_VERIFICACION':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'EFICAZ':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'NO_EFICAZ':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'CERRADA':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'VENCIDA':
        return 'bg-rose-900 text-white border-rose-950';
      case 'CANCELADA':
        return 'bg-slate-300 text-slate-700 border-slate-400';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getPriorityBadge = (prioridad: PrioridadPlan) => {
    switch (prioridad) {
      case 'ALTA':
        return 'text-rose-600 font-bold bg-rose-50 border border-rose-200';
      case 'MEDIA':
        return 'text-amber-600 font-bold bg-amber-50 border border-amber-200';
      case 'BAJA':
        return 'text-slate-600 font-bold bg-slate-50 border border-slate-200';
    }
  };

  // Kanban Columns
  const kanbanCols = [
    {
      id: 'propuesta',
      title: 'Borrador & Aprobación',
      estados: ['BORRADOR', 'PENDIENTE_APROBACION'],
      color: 'border-amber-200 bg-amber-50/40 text-amber-900'
    },
    {
      id: 'ejecucion',
      title: 'En Ejecución',
      estados: ['APROBADA', 'EN_EJECUCION'],
      color: 'border-indigo-200 bg-indigo-50/40 text-indigo-900'
    },
    {
      id: 'verificacion',
      title: 'En Verificación (100% Avance)',
      estados: ['EN_VERIFICACION'],
      color: 'border-purple-200 bg-purple-50/40 text-purple-900'
    },
    {
      id: 'eficaz',
      title: 'Eficaces & Cerradas',
      estados: ['EFICAZ', 'CERRADA'],
      color: 'border-emerald-200 bg-emerald-50/40 text-emerald-900'
    },
    {
      id: 'criticas',
      title: 'Vencidas & No Eficaces',
      estados: ['VENCIDA', 'NO_EFICAZ', 'CANCELADA'],
      color: 'border-rose-200 bg-rose-50/40 text-rose-900'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Controles de Filtrado & Modo de Vista */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Buscador */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por código, título, responsable o hallazgo..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Switcher Tabla / Kanban & Botón Nuevo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="p-1 bg-slate-100 rounded-xl flex items-center gap-1 border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Matriz</span>
              </button>

              <button
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Tablero Kanban</span>
              </button>
            </div>

            <button
              onClick={onOpenNuevoModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Plan</span>
            </button>
          </div>

        </div>

        {/* Fila de Filtros Desplegables */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-slate-100">
          
          {/* Filtro Estado */}
          <div>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="BORRADOR">Borrador</option>
              <option value="PENDIENTE_APROBACION">Pendiente Aprobación</option>
              <option value="APROBADA">Aprobada</option>
              <option value="EN_EJECUCION">En Ejecución</option>
              <option value="EN_VERIFICACION">En Verificación (100%)</option>
              <option value="EFICAZ">Eficaz</option>
              <option value="NO_EFICAZ">No Eficaz</option>
              <option value="CERRADA">Cerrada</option>
              <option value="VENCIDA">Vencida</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>

          {/* Filtro Prioridad */}
          <div>
            <select
              value={filtroPrioridad}
              onChange={(e) => setFiltroPrioridad(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="TODAS">Todas las Prioridades</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Media</option>
              <option value="BAJA">Baja</option>
            </select>
          </div>

          {/* Filtro Categoría */}
          <div>
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="TODAS">Todas las Categorías</option>
              <option value="CORRECTIVA">Correctiva</option>
              <option value="PREVENTIVA">Preventiva</option>
              <option value="MEJORA">Mejora Continua</option>
              <option value="CUMPLIMIENTO_LEGAL">Cumplimiento Legal</option>
            </select>
          </div>

          {/* Filtro Origen */}
          <div>
            <select
              value={filtroOrigen}
              onChange={(e) => setFiltroOrigen(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="TODOS">Todos los Orígenes</option>
              <option value="ALERTA_SST">Alerta SST</option>
              <option value="AUTOEVALUACION_0312">Res. 0312</option>
              <option value="CALIDAD_DATOS">Calidad Datos</option>
              <option value="AUDITORIA_INTERNA">Auditoría</option>
              <option value="INVESTIGACION_ACCIDENTE">Accidente</option>
              <option value="COMITE_COPASST">COPASST</option>
              <option value="ONBOARDING_NORMATIVO">Onboarding</option>
            </select>
          </div>

          {/* Orden */}
          <div>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="recientes">Más Recientes</option>
              <option value="vencimiento">Por Vencimiento</option>
              <option value="avance">Por % de Avance</option>
            </select>
          </div>

        </div>

      </div>

      {/* CONTENIDO: TABLA VS KANBAN */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Código / Título</th>
                  <th className="py-3 px-4">Origen & Norma</th>
                  <th className="py-3 px-4">Prioridad</th>
                  <th className="py-3 px-4">Responsable</th>
                  <th className="py-3 px-4">Plazo Objetivo</th>
                  <th className="py-3 px-4">Avance Físico</th>
                  <th className="py-3 px-4">Evidencias</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPlanes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                      No se encontraron planes de acción con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  sortedPlanes.map((plan) => (
                    <tr 
                      key={plan.id}
                      onClick={() => onSelectPlan(plan)}
                      className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                              {plan.codigo}
                            </span>
                            {plan.sugeridoPorIa && (
                              <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 rounded text-[9px] font-extrabold" title="Sugerido por IA (HITL)">
                                IA
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-slate-900 text-xs truncate group-hover:text-indigo-600 transition-colors">
                            {plan.titulo}
                          </p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-semibold text-slate-700 block">{plan.origen}</span>
                          {plan.estadoSincronizacionOrigen === 'SINCRONIZADO' && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" title="Sincronizado con módulo de origen" />
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">{plan.normaReferencia || 'SG-SST'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getPriorityBadge(plan.prioridad)}`}>
                          {plan.prioridad}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {plan.responsableNombre}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        {plan.fechaObjetivo}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 min-w-[90px]">
                          <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                plan.porcentajeAvance === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${plan.porcentajeAvance}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold font-mono text-slate-700">
                            {plan.porcentajeAvance}%
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                          {plan.evidencias.length} docs
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${getStatusBadge(plan.estado)}`}>
                          {plan.estado}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPlan(plan);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[11px] cursor-pointer"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* KANBAN VIEW */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto">
          {kanbanCols.map(col => {
            const colPlanes = sortedPlanes.filter(p => col.estados.includes(p.estado));

            return (
              <div key={col.id} className="space-y-3 bg-slate-100/70 p-3.5 rounded-3xl border border-slate-200 flex flex-col min-h-[500px]">
                
                {/* Cabecera Columna */}
                <div className={`p-2.5 rounded-2xl border flex items-center justify-between ${col.color}`}>
                  <span className="text-xs font-black truncate">{col.title}</span>
                  <span className="px-2 py-0.5 bg-white/80 rounded-md text-xs font-mono font-bold">
                    {colPlanes.length}
                  </span>
                </div>

                {/* Lista de Tarjetas */}
                <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
                  {colPlanes.length === 0 ? (
                    <div className="py-12 text-center text-[11px] text-slate-400 font-medium">
                      Sin planes en esta etapa
                    </div>
                  ) : (
                    colPlanes.map(plan => (
                      <div
                        key={plan.id}
                        onClick={() => onSelectPlan(plan)}
                        className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all cursor-pointer space-y-2.5"
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                            {plan.codigo}
                          </span>
                          <span className={`px-2 py-0.5 rounded font-bold ${getPriorityBadge(plan.prioridad)}`}>
                            {plan.prioridad}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-xs line-clamp-2 leading-tight">
                          {plan.titulo}
                        </h4>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                            <span>Avance</span>
                            <span className="font-bold font-mono">{plan.porcentajeAvance}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                plan.porcentajeAvance === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                              }`}
                              style={{ width: `${plan.porcentajeAvance}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span>{plan.evidencias.length} evidencias</span>
                          <span className="font-mono text-slate-700 font-bold">{plan.fechaObjetivo}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
