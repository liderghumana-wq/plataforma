import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  FileSpreadsheet, 
  RefreshCw, 
  Search, 
  Filter, 
  Building2, 
  MapPin, 
  Briefcase, 
  FolderGit2, 
  ShieldCheck, 
  FolderOpen, 
  Edit3, 
  Trash2, 
  RotateCcw, 
  ClipboardList, 
  FileText, 
  CheckCircle2, 
  LayoutGrid, 
  Table as TableIcon,
  Eye,
  Sparkles,
  Download,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { colaboradoresService } from './colaboradoresService';
import { ColaboradorExtendido } from './types';
import { ColaboradorFormModal } from './components/ColaboradorFormModal';
import { ExpedienteDigitalModal } from './components/ExpedienteDigitalModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { ActualizarDesdeEncuestaModal } from './components/ActualizarDesdeEncuestaModal';

interface ColaboradoresModuleProps {
  currentCompanyId?: string;
}

export function ColaboradoresModule({ currentCompanyId = 'empresa_main_001' }: ColaboradoresModuleProps) {
  
  // Data State
  const [colaboradores, setColaboradores] = useState<ColaboradorExtendido[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [viewMode, setViewMode] = useState<'TABLE' | 'GRID'>('TABLE');

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSede, setSelectedSede] = useState('ALL');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [selectedCargo, setSelectedCargo] = useState('ALL');
  const [selectedContrato, setSelectedContrato] = useState('ALL');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [collaboratorToEdit, setCollaboratorToEdit] = useState<ColaboradorExtendido | null>(null);

  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [selectedDossierId, setSelectedDossierId] = useState<string | null>(null);

  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isSurveySyncModalOpen, setIsSurveySyncModalOpen] = useState(false);

  // Load collaborators
  const reloadData = () => {
    const data = colaboradoresService.getColaboradores(currentCompanyId, true);
    setColaboradores(data);
  };

  useEffect(() => {
    reloadData();
  }, [currentCompanyId]);

  // Lookup options for filter dropdowns
  const sedes = useMemo(() => colaboradoresService.getSedes(currentCompanyId), [currentCompanyId]);
  const areas = useMemo(() => colaboradoresService.getAreas(currentCompanyId), [currentCompanyId]);
  const cargos = useMemo(() => colaboradoresService.getCargos(currentCompanyId), [currentCompanyId]);
  const tiposContrato = useMemo(() => colaboradoresService.getTiposContrato(currentCompanyId), [currentCompanyId]);

  // Filtered List
  const filteredColaboradores = useMemo(() => {
    return colaboradores.filter(c => {
      // Soft Delete Filter
      if (!showDeleted && (!c.isActive || c.deletedAt !== null)) {
        return false;
      }
      if (showDeleted && c.isActive && c.deletedAt === null) {
        return false;
      }

      // Search Filter
      const term = searchTerm.toLowerCase();
      const matchesSearch = 
        c.nombres.toLowerCase().includes(term) ||
        c.apellidos.toLowerCase().includes(term) ||
        c.numeroIdentificacion.toLowerCase().includes(term) ||
        (c.correoCorporativo && c.correoCorporativo.toLowerCase().includes(term)) ||
        (c.cargoNombre && c.cargoNombre.toLowerCase().includes(term));

      if (!matchesSearch) return false;

      // Dropdown Filters
      if (selectedSede !== 'ALL' && c.sedeId !== selectedSede) return false;
      if (selectedArea !== 'ALL' && c.areaId !== selectedArea) return false;
      if (selectedCargo !== 'ALL' && c.cargoId !== selectedCargo) return false;
      if (selectedContrato !== 'ALL' && c.tipoContratoId !== selectedContrato) return false;

      return true;
    });
  }, [colaboradores, showDeleted, searchTerm, selectedSede, selectedArea, selectedCargo, selectedContrato]);

  // Stats Counters
  const totalActivos = colaboradores.filter(c => c.isActive && !c.deletedAt).length;
  const totalEliminados = colaboradores.filter(c => !c.isActive || c.deletedAt !== null).length;
  const totalConEncuestas = colaboradores.filter(c => (c.totalEncuestasDiligenciadas || 0) > 0).length;

  // Handlers
  const handleOpenCreate = () => {
    setCollaboratorToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (colab: ColaboradorExtendido) => {
    setCollaboratorToEdit(colab);
    setIsFormModalOpen(true);
  };

  const handleOpenDossier = (id: string) => {
    setSelectedDossierId(id);
    setIsDossierModalOpen(true);
  };

  const handleSoftDelete = (colab: ColaboradorExtendido) => {
    if (confirm(`¿Está seguro de eliminar (soft delete) al colaborador ${colab.nombres} ${colab.apellidos} (${colab.numeroIdentificacion})? Podrá ser restaurado en cualquier momento.`)) {
      colaboradoresService.softDeleteColaborador(colab.id, 'usr_lider_ghumana');
      reloadData();
    }
  };

  const handleRestore = (colab: ColaboradorExtendido) => {
    if (confirm(`¿Desea restaurar al colaborador ${colab.nombres} ${colab.apellidos}?`)) {
      colaboradoresService.restoreColaborador(colab.id, 'usr_lider_ghumana');
      reloadData();
    }
  };

  const handleExportCSV = () => {
    const csvHeader = "Identificación,TipoDoc,Nombres,Apellidos,Empresa,Sede,Área,Cargo,Proyecto,CentroTrabajo,TipoContrato,Correo,Estado\n";
    const csvRows = filteredColaboradores.map(c => 
      `"${c.numeroIdentificacion}","${c.tipoIdentificacion}","${c.nombres}","${c.apellidos}","${c.empresaNombre}","${c.sedeNombre}","${c.areaNombre}","${c.cargoNombre}","${c.proyectoNombre || ''}","${c.centroTrabajoNombre}","${c.tipoContratoNombre}","${c.correoCorporativo || ''}","${c.isActive ? 'Activo' : 'Inactivo'}"`
    ).join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Maestro_Colaboradores_Export_${new Date().toISOString().substring(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 text-slate-900 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-md">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Maestro de Colaboradores
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-700 border border-indigo-200">
                  Módulo Enterprise 3NF
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Gestión centralizada de empleados, expedientes digitales, trazabilidad relacional y auditoría.
              </p>
            </div>
          </div>
        </div>

        {/* PRIMARY ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Colaborador</span>
          </button>

          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Importar desde Excel</span>
          </button>

          <button
            onClick={() => setIsSurveySyncModalOpen(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-purple-300" />
            <span>Actualizar desde Encuesta</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-extrabold uppercase tracking-wider block">Total Expedientes Activos</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalActivos}</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              100% 3NF Linked
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-extrabold uppercase tracking-wider block">Con Encuestas Asociadas</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-indigo-600 font-mono">{totalConEncuestas}</span>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Auto-Asociados
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-extrabold uppercase tracking-wider block">Sedes & Áreas Activas</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 font-mono">{sedes.length} / {areas.length}</span>
            <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
              Estructura
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-extrabold uppercase tracking-wider block">Expedientes Eliminados (Soft)</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-600 font-mono">{totalEliminados}</span>
            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className="text-[11px] font-bold text-slate-700 underline hover:text-slate-900 cursor-pointer"
            >
              {showDeleted ? 'Ver Activos' : 'Ver Eliminados'}
            </button>
          </div>
        </div>

      </div>

      {/* SEARCH AND MULTI-FIELD FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cédula, nombres, correo corporativo, cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Controls & Mode Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => setShowDeleted(!showDeleted)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                showDeleted ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-100 border-slate-200 text-slate-700'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{showDeleted ? 'Mostrando Eliminados (Soft)' : 'Papelera (Soft Delete)'}</span>
            </button>

            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'TABLE' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500'
                }`}
              >
                <TableIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'GRID' ? 'bg-white text-indigo-600 shadow-2xs font-bold' : 'text-slate-500'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Relational Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs font-bold">
          
          <div>
            <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Filtrar por Sede</label>
            <select
              value={selectedSede}
              onChange={(e) => setSelectedSede(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="ALL">Todas las Sedes ({sedes.length})</option>
              {sedes.map(s => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Filtrar por Área</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="ALL">Todas las Áreas ({areas.length})</option>
              {areas.map(a => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Filtrar por Cargo</label>
            <select
              value={selectedCargo}
              onChange={(e) => setSelectedCargo(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="ALL">Todos los Cargos ({cargos.length})</option>
              {cargos.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-extrabold text-slate-400 block mb-1">Tipo de Contrato</label>
            <select
              value={selectedContrato}
              onChange={(e) => setSelectedContrato(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
            >
              <option value="ALL">Todos los Contratos ({tiposContrato.length})</option>
              {tiposContrato.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

        </div>

      </div>

      {/* COLLABORATORS CONTENT LIST VIEW */}
      {filteredColaboradores.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-extrabold text-sm text-slate-800">No se encontraron colaboradores</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Ajuste los filtros de búsqueda o registre un nuevo colaborador.
          </p>
          <button
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            + Registrar Colaborador
          </button>
        </div>
      ) : viewMode === 'TABLE' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="p-4">Colaborador / Identificación</th>
                  <th className="p-4">Sede & Área</th>
                  <th className="p-4">Cargo & Proyecto</th>
                  <th className="p-4">Centro & Contrato</th>
                  <th className="p-4">Expediente Digital</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredColaboradores.map(colab => (
                  <tr key={colab.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Colaborador & ID */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                          {colab.nombres.charAt(0)}{colab.apellidos.charAt(0)}
                        </div>
                        <div className="space-y-0.5">
                          <button
                            onClick={() => handleOpenDossier(colab.id)}
                            className="font-black text-slate-900 hover:text-indigo-600 transition-colors text-left text-xs cursor-pointer block"
                          >
                            {colab.nombres} {colab.apellidos}
                          </button>
                          <div className="flex items-center gap-2 text-[11px]">
                            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              {colab.tipoIdentificacion}: {colab.numeroIdentificacion}
                            </span>
                            <span className="text-slate-400">{colab.genero}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Sede & Area */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-900 block">{colab.sedeNombre}</span>
                        <span className="text-slate-500 text-[11px] block">{colab.areaNombre}</span>
                      </div>
                    </td>

                    {/* Cargo & Proyecto */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-indigo-700 block">{colab.cargoNombre}</span>
                        <span className="text-slate-400 text-[11px] block">{colab.proyectoNombre || 'Sin proyecto'}</span>
                      </div>
                    </td>

                    {/* Centro & Contrato */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block">{colab.centroTrabajoNombre}</span>
                        <span className="text-emerald-700 text-[11px] font-bold block">{colab.tipoContratoNombre}</span>
                      </div>
                    </td>

                    {/* Expediente Digital Stats */}
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg text-[10px] font-bold flex items-center gap-1">
                          <ClipboardList className="w-3 h-3 text-indigo-600" />
                          <span>{colab.totalEncuestasDiligenciadas || 0} Encuestas</span>
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        
                        {/* Expediente Digital Trigger */}
                        <button
                          onClick={() => handleOpenDossier(colab.id)}
                          title="Ver Expediente Digital"
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer border border-indigo-200"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Expediente</span>
                        </button>

                        {!showDeleted ? (
                          <>
                            <button
                              onClick={() => handleOpenEdit(colab)}
                              title="Editar Colaborador"
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg cursor-pointer transition-all"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleSoftDelete(colab)}
                              title="Eliminar (Soft Delete)"
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestore(colab)}
                            title="Restaurar Expediente"
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restaurar</span>
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID CARD VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredColaboradores.map(colab => (
            <div key={colab.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4">
              
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-black text-base flex items-center justify-center shrink-0 shadow-xs">
                    {colab.nombres.charAt(0)}{colab.apellidos.charAt(0)}
                  </div>

                  <div className="space-y-0.5">
                    <button
                      onClick={() => handleOpenDossier(colab.id)}
                      className="font-black text-slate-900 hover:text-indigo-600 transition-colors text-left text-sm cursor-pointer block line-clamp-1"
                    >
                      {colab.nombres} {colab.apellidos}
                    </button>
                    <span className="font-mono font-bold text-xs text-amber-700">
                      {colab.tipoIdentificacion}: {colab.numeroIdentificacion}
                    </span>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                  colab.isActive && !colab.deletedAt ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {colab.isActive && !colab.deletedAt ? 'Activo' : 'Soft Deleted'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
                <div>
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">Sede</span>
                  <span className="font-bold text-slate-800 block truncate">{colab.sedeNombre}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">Área</span>
                  <span className="font-bold text-slate-800 block truncate">{colab.areaNombre}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">Cargo</span>
                  <span className="font-bold text-indigo-700 block truncate">{colab.cargoNombre}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] font-bold uppercase">Contrato</span>
                  <span className="font-bold text-emerald-700 block truncate">{colab.tipoContratoNombre}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  onClick={() => handleOpenDossier(colab.id)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Expediente Digital</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(colab)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleSoftDelete(colab)}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* FORM MODAL (CREATE / EDIT) */}
      <ColaboradorFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        collaboratorToEdit={collaboratorToEdit}
        onSuccess={reloadData}
        currentCompanyId={currentCompanyId}
      />

      {/* EXPEDIENTE DIGITAL MODAL */}
      <ExpedienteDigitalModal
        isOpen={isDossierModalOpen}
        onClose={() => setIsDossierModalOpen(false)}
        collaboratorId={selectedDossierId}
      />

      {/* EXCEL IMPORT MODAL */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={reloadData}
        currentCompanyId={currentCompanyId}
      />

      {/* SURVEY SYNC MODAL */}
      <ActualizarDesdeEncuestaModal
        isOpen={isSurveySyncModalOpen}
        onClose={() => setIsSurveySyncModalOpen(false)}
        onSuccess={reloadData}
        currentCompanyId={currentCompanyId}
      />

    </div>
  );
}
