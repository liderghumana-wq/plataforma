import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  UserCheck, 
  Briefcase, 
  Sparkles, 
  Download, 
  Upload, 
  Filter, 
  Layers, 
  Check, 
  X, 
  AlertCircle, 
  Cpu,
  Building,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  SlidersHorizontal,
  LayoutGrid,
  List
} from 'lucide-react';
import { useEmpresa } from '../configuracion/useEmpresa';
import { EmpresaConfig } from '../configuracion/empresa.types';
import { searchCIIU, CIIU_DATABASE } from '../empresa/utils/ciiuLibrary';
import { NewCompanyWizardModal } from '../configuracion/components/NewCompanyWizardModal';

export const AdministracionEmpresasModule: React.FC = () => {
  const { 
    companies, 
    activeCompanyId, 
    switchCompany, 
    createCompany, 
    saveCompany, 
    deleteCompany,
    getCatalogItems
  } = useEmpresa();

  // Filters & View States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activo' | 'inactivo'>('todos');
  const [sectorFilter, setSectorFilter] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showWizardModal, setShowWizardModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<EmpresaConfig | null>(null);

  // Form Fields State
  const [formData, setFormData] = useState<Partial<EmpresaConfig>>({
    nombreEmpresa: '',
    nit: '',
    logo: '',
    sectorEconomico: 'Servicios',
    codigoCIIU: '',
    descripcionCIIU: '',
    tamanoEmpresa: 'Mediana (51-200)',
    direccion: '',
    ciudad: '',
    departamento: '',
    pais: 'Colombia',
    telefono: '',
    correo: '',
    sitioWeb: '',
    personaContacto: '',
    cargoContacto: '',
    estado: 'Activo'
  });

  // CIIU Search modal/dropdown state inside modal
  const [ciiuQuery, setCiiuQuery] = useState('');
  const [showCiiuResults, setShowCiiuResults] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToastNotification = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  // Catalogs for dynamic options
  const ciudadesCatalog = useMemo(() => getCatalogItems('ciudades', true), [getCatalogItems]);
  const departamentosCatalog = useMemo(() => getCatalogItems('departamentos', true), [getCatalogItems]);

  // Unique sectors list for filter
  const sectorsList = useMemo(() => {
    const set = new Set<string>();
    companies.forEach(c => {
      if (c.sectorEconomico) set.add(c.sectorEconomico);
    });
    return Array.from(set);
  }, [companies]);

  // Filtered companies list
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchQuery = 
        company.nombreEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.nit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.ciudad.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.personaContacto && company.personaContacto.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (company.codigoCIIU && company.codigoCIIU.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus = 
        statusFilter === 'todos' ? true :
        statusFilter === 'activo' ? (company.estado !== 'Inactivo') :
        (company.estado === 'Inactivo');

      const matchSector = 
        sectorFilter === 'todos' ? true :
        company.sectorEconomico === sectorFilter;

      return matchQuery && matchStatus && matchSector;
    });
  }, [companies, searchTerm, statusFilter, sectorFilter]);

  // Metrics
  const totalCount = companies.length;
  const activeCount = companies.filter(c => c.estado !== 'Inactivo').length;
  const inactiveCount = companies.filter(c => c.estado === 'Inactivo').length;

  // Open modal for NEW company
  const handleOpenCreateModal = () => {
    setEditingCompany(null);
    setFormData({
      nombreEmpresa: '',
      nit: '',
      logo: '',
      sectorEconomico: 'Servicios',
      codigoCIIU: '8220',
      descripcionCIIU: 'Actividades de Centros de Llamadas (Call Center / BPO)',
      tamanoEmpresa: 'Mediana (51-200)',
      direccion: '',
      ciudad: ciudadesCatalog[0]?.nombre || 'Bogotá D.C.',
      departamento: departamentosCatalog[0]?.nombre || 'Cundinamarca',
      pais: 'Colombia',
      telefono: '',
      correo: '',
      sitioWeb: '',
      personaContacto: '',
      cargoContacto: '',
      estado: 'Activo'
    });
    setCiiuQuery('');
    setShowModal(true);
  };

  // Open modal for EDITING company
  const handleOpenEditModal = (company: EmpresaConfig) => {
    setEditingCompany(company);
    setFormData({
      ...company,
      tamanoEmpresa: company.tamanoEmpresa || 'Mediana (51-200)',
      pais: company.pais || 'Colombia',
      estado: company.estado || 'Activo'
    });
    setCiiuQuery(company.codigoCIIU || '');
    setShowModal(true);
  };

  // Submit create or edit
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombreEmpresa?.trim()) {
      showToastNotification('error', 'El nombre de la empresa es obligatorio.');
      return;
    }
    if (!formData.nit?.trim()) {
      showToastNotification('error', 'El NIT de la empresa es obligatorio.');
      return;
    }

    try {
      if (editingCompany) {
        // Update existing company
        const updatedCompany: EmpresaConfig = {
          ...editingCompany,
          ...formData,
          id: editingCompany.id,
          nombreEmpresa: formData.nombreEmpresa.trim(),
          nit: formData.nit.trim(),
          fechaActualizacion: new Date().toISOString().split('T')[0]
        } as EmpresaConfig;

        await saveCompany(updatedCompany);
        showToastNotification('success', `Empresa "${updatedCompany.nombreEmpresa}" actualizada exitosamente.`);
      } else {
        // Create new company
        const newId = await createCompany(
          formData.nombreEmpresa.trim(),
          formData.nit.trim(),
          {
            ...formData,
            estado: formData.estado || 'Activo',
            fechaCreacion: new Date().toISOString().split('T')[0],
            fechaActualizacion: new Date().toISOString().split('T')[0]
          }
        );

        showToastNotification('success', `Nueva empresa "${formData.nombreEmpresa}" registrada exitosamente.`);
      }

      setShowModal(false);
    } catch (err: any) {
      console.error('Error al guardar empresa:', err);
      showToastNotification('error', err.message || 'Error al guardar la información de la empresa.');
    }
  };

  // Delete company handler
  const handleDeleteCompany = async (company: EmpresaConfig) => {
    if (company.id === 'default-company') {
      showToastNotification('error', 'La empresa principal del sistema no puede ser eliminada.');
      return;
    }

    if (window.confirm(`¿Está seguro de eliminar la empresa "${company.nombreEmpresa}" (NIT: ${company.nit})?\n\nEsta acción eliminará de forma irreversible todos los datos e informes vinculados a este companyId.`)) {
      try {
        await deleteCompany(company.id);
        showToastNotification('success', `Empresa "${company.nombreEmpresa}" eliminada correctamente.`);
      } catch (err: any) {
        showToastNotification('error', err.message || 'No se pudo eliminar la empresa.');
      }
    }
  };

  // Toggle company status
  const handleToggleStatus = async (company: EmpresaConfig) => {
    const newStatus = company.estado === 'Inactivo' ? 'Activo' : 'Inactivo';
    try {
      const updated = {
        ...company,
        estado: newStatus as 'Activo' | 'Inactivo',
        fechaActualizacion: new Date().toISOString().split('T')[0]
      };
      await saveCompany(updated);
      showToastNotification('info', `Empresa "${company.nombreEmpresa}" marcada como ${newStatus}.`);
    } catch (err: any) {
      showToastNotification('error', 'Error al cambiar el estado de la empresa.');
    }
  };

  // CIIU search results
  const ciiuResults = useMemo(() => {
    if (!ciiuQuery || ciiuQuery.length < 2) return [];
    return searchCIIU(ciiuQuery);
  }, [ciiuQuery]);

  // Select CIIU code
  const handleSelectCIIU = (item: any) => {
    setFormData(prev => ({
      ...prev,
      codigoCIIU: item.codigo,
      descripcionCIIU: item.actividad,
      sectorEconomico: prev.sectorEconomico || item.sector,
      claseRiesgo: item.claseRiesgo
    }));
    setCiiuQuery(`${item.codigo} - ${item.actividad}`);
    setShowCiiuResults(false);
  };

  // Export Company Directory to CSV
  const handleExportDirectory = () => {
    try {
      const headers = [
        'ID Empresa',
        'Nombre Empresa',
        'NIT',
        'Estado',
        'Sector Económico',
        'Código CIIU',
        'Actividad CIIU',
        'Tamaño Empresa',
        'Dirección',
        'Ciudad',
        'Departamento',
        'País',
        'Teléfono',
        'Correo',
        'Página Web',
        'Persona Contacto',
        'Cargo Contacto'
      ];

      const rows = companies.map(c => [
        `"${c.id}"`,
        `"${c.nombreEmpresa.replace(/"/g, '""')}"`,
        `"${c.nit}"`,
        `"${c.estado || 'Activo'}"`,
        `"${c.sectorEconomico || ''}"`,
        `"${c.codigoCIIU || ''}"`,
        `"${(c.descripcionCIIU || '').replace(/"/g, '""')}"`,
        `"${c.tamanoEmpresa || ''}"`,
        `"${(c.direccion || '').replace(/"/g, '""')}"`,
        `"${c.ciudad || ''}"`,
        `"${c.departamento || ''}"`,
        `"${c.pais || 'Colombia'}"`,
        `"${c.telefono || ''}"`,
        `"${c.correo || ''}"`,
        `"${c.sitioWeb || ''}"`,
        `"${(c.personaContacto || c.responsableInforme || '').replace(/"/g, '""')}"`,
        `"${(c.cargoContacto || c.cargoResponsable || '').replace(/"/g, '""')}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Directorio_Empresas_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToastNotification('success', 'Directorio de empresas exportado exitosamente.');
    } catch (err) {
      showToastNotification('error', 'Error al exportar el directorio de empresas.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 p-4 rounded-2xl border shadow-2xl z-50 max-w-md flex items-center gap-3 ${
              toast.type === 'success' ? 'bg-emerald-950 border-emerald-500/30 text-emerald-100' :
              toast.type === 'error' ? 'bg-rose-950 border-rose-500/30 text-rose-100' :
              'bg-slate-900 border-indigo-500/30 text-indigo-100'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />}
            <p className="text-xs font-bold">{toast.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header Banner */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Arquitectura Multiempresa & Entidades Autónomas</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white">
              Administración de Empresas
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed font-medium">
              Gestione y parametrice múltiples organizaciones de forma independiente. Cada empresa cuenta con su propio identificador único (<code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">companyId</code>), catálogos personalizados, bases sociodemográficas e informes SG-SST aislados.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleExportDirectory}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              title="Exportar directorio completo a CSV"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => setShowWizardModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/30"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>Asistente Guiado (Wizard 8 Pasos)</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>Registro Rápido</span>
            </button>
          </div>
        </div>

        {/* Metrics Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
              Total Registradas
            </span>
            <span className="text-xl font-black text-white mt-1 block">
              {totalCount} <span className="text-xs font-normal text-slate-400">empresas</span>
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider block">
              Empresas Activas
            </span>
            <span className="text-xl font-black text-emerald-400 mt-1 block">
              {activeCount} <span className="text-xs font-normal text-slate-400">activas</span>
            </span>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] font-extrabold uppercase text-rose-400 tracking-wider block">
              Empresas Inactivas
            </span>
            <span className="text-xl font-black text-rose-400 mt-1 block">
              {inactiveCount} <span className="text-xs font-normal text-slate-400">inactivas</span>
            </span>
          </div>

          <div className="bg-indigo-950/60 p-4 rounded-2xl border border-indigo-500/30">
            <span className="text-[10px] font-extrabold uppercase text-indigo-300 tracking-wider block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Empresa Activa
            </span>
            <span className="text-xs font-black text-white mt-1 block truncate" title={companies.find(c => c.id === activeCompanyId)?.nombreEmpresa}>
              {companies.find(c => c.id === activeCompanyId)?.nombreEmpresa || 'Ninguna'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por Nombre, NIT, Ciudad, CIIU..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
            <button
              onClick={() => setStatusFilter('todos')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'todos' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todas ({totalCount})
            </button>
            <button
              onClick={() => setStatusFilter('activo')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'activo' ? 'bg-emerald-500 text-white shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Activas ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('inactivo')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                statusFilter === 'inactivo' ? 'bg-rose-500 text-white shadow-2xs font-extrabold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Inactivas ({inactiveCount})
            </button>
          </div>

          {/* Sector Filter */}
          {sectorsList.length > 0 && (
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="todos">Todos los sectores</option>
              {sectorsList.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          )}

          {/* View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-slate-600 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'hover:text-slate-900'
              }`}
              title="Vista en Cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs' : 'hover:text-slate-900'
              }`}
              title="Vista en Tabla"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map((company) => {
              const isActiveContext = company.id === activeCompanyId;
              const isInactive = company.estado === 'Inactivo';

              return (
                <div 
                  key={company.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 p-6 flex flex-col justify-between relative shadow-xs hover:shadow-md ${
                    isActiveContext
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/10'
                      : isInactive
                      ? 'border-slate-200 bg-slate-50/50 opacity-80'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {company.logo ? (
                          <img 
                            src={company.logo} 
                            alt={company.nombreEmpresa}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 bg-white shadow-2xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center shrink-0 font-black text-lg">
                            {company.nombreEmpresa.substring(0, 2).toUpperCase() || 'EM'}
                          </div>
                        )}

                        <div>
                          <h3 className="text-sm font-black text-slate-900 font-display line-clamp-1" title={company.nombreEmpresa}>
                            {company.nombreEmpresa}
                          </h3>
                          <p className="text-xs font-mono font-bold text-slate-500">
                            NIT: {company.nit}
                          </p>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isInactive
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {isInactive ? 'Inactivo' : 'Activo'}
                        </span>

                        {isActiveContext && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-600 text-white uppercase tracking-wider">
                            Empresa Activa
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                      {company.sectorEconomico && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                          {company.sectorEconomico}
                        </span>
                      )}
                      {company.tamanoEmpresa && (
                        <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                          {company.tamanoEmpresa}
                        </span>
                      )}
                      {company.codigoCIIU && (
                        <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg border border-amber-200" title={company.descripcionCIIU}>
                          CIIU: {company.codigoCIIU}
                        </span>
                      )}
                    </div>

                    {/* Detailed Info List */}
                    <div className="space-y-2 text-xs text-slate-600 pt-2">
                      {(company.ciudad || company.departamento) && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{company.direccion ? `${company.direccion}, ` : ''}{company.ciudad}{company.departamento ? `, ${company.departamento}` : ''}</span>
                        </div>
                      )}

                      {(company.personaContacto || company.responsableInforme) && (
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="font-bold text-slate-800 truncate">
                            {company.personaContacto || company.responsableInforme}
                            {(company.cargoContacto || company.cargoResponsable) && (
                              <span className="font-normal text-slate-500"> ({company.cargoContacto || company.cargoResponsable})</span>
                            )}
                          </span>
                        </div>
                      )}

                      {company.correo && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a href={`mailto:${company.correo}`} className="text-indigo-600 hover:underline truncate">
                            {company.correo}
                          </a>
                        </div>
                      )}

                      {company.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{company.telefono}</span>
                        </div>
                      )}

                      {company.sitioWeb && (
                        <div className="flex items-center gap-2">
                          <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <a href={company.sitioWeb.startsWith('http') ? company.sitioWeb : `https://${company.sitioWeb}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline truncate flex items-center gap-1">
                            <span>{company.sitioWeb}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => switchCompany(company.id)}
                      disabled={isActiveContext}
                      className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        isActiveContext
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200 cursor-default'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{isActiveContext ? 'Empresa Seleccionada' : 'Seleccionar Empresa'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(company)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          isInactive
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'
                        }`}
                        title={isInactive ? 'Activar Empresa' : 'Inactivar Empresa'}
                      >
                        {isInactive ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(company)}
                        className="p-2 text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                        title="Editar Empresa"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      {company.id !== 'default-company' && (
                        <button
                          onClick={() => handleDeleteCompany(company)}
                          className="p-2 text-slate-400 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                          title="Eliminar Empresa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Identifier Badge */}
                  <div className="absolute top-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-mono bg-slate-900 text-white px-2 py-0.5 rounded shadow-sm">
                      {company.id}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-black text-slate-700">No se encontraron empresas</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No hay coincidencias con los filtros de búsqueda aplicados. Pruebe cambiar los criterios o registre una nueva empresa.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Empresa</th>
                  <th className="py-3.5 px-4">NIT</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4">Sector / CIIU</th>
                  <th className="py-3.5 px-4">Ubicación</th>
                  <th className="py-3.5 px-4">Contacto Directo</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCompanies.map(company => {
                  const isActiveContext = company.id === activeCompanyId;
                  const isInactive = company.estado === 'Inactivo';

                  return (
                    <tr key={company.id} className={`hover:bg-slate-50 transition-colors ${isActiveContext ? 'bg-indigo-50/20' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {company.logo ? (
                            <img src={company.logo} alt="" className="w-8 h-8 rounded-xl object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 font-black text-xs flex items-center justify-center border border-indigo-100">
                              {company.nombreEmpresa.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-extrabold text-slate-900 block">{company.nombreEmpresa}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{company.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {company.nit}
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          isInactive ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isInactive ? 'Inactivo' : 'Activo'}
                        </span>
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        <span className="block font-bold text-slate-800">{company.sectorEconomico || 'Sin sector'}</span>
                        {company.codigoCIIU && (
                          <span className="block text-[10px] font-mono text-slate-500">CIIU {company.codigoCIIU}</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-slate-600">
                        {company.ciudad || 'N/A'}{company.departamento ? `, ${company.departamento}` : ''}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-800 block">{company.personaContacto || company.responsableInforme || 'N/A'}</span>
                        <span className="text-[10px] text-slate-500 block">{company.correo || company.telefono || ''}</span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => switchCompany(company.id)}
                            disabled={isActiveContext}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isActiveContext
                                ? 'bg-indigo-100 text-indigo-700 cursor-default'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs'
                            }`}
                          >
                            {isActiveContext ? 'Activa' : 'Seleccionar'}
                          </button>

                          <button
                            onClick={() => handleOpenEditModal(company)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar Empresa"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {company.id !== 'default-company' && (
                            <button
                              onClick={() => handleDeleteCompany(company)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar Empresa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE / EDIT COMPANY MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full border border-slate-200 shadow-2xl space-y-6 text-left my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-display">
                      {editingCompany ? `Editar Empresa: ${editingCompany.nombreEmpresa}` : 'Registrar Nueva Empresa'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Formulario de administración parametrizada multiempresa.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmitForm} className="space-y-6">
                
                {/* Section 1: Datos Principales */}
                <div className="space-y-4">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block">
                    1. Datos de Identificación Corporativa
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Nombre de la Empresa <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombreEmpresa || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, nombreEmpresa: e.target.value }))}
                        placeholder="Ej: Innovatech IT Colombia S.A.S."
                        className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                      />
                    </div>

                    {/* NIT */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        NIT (Número de Identificación Tributaria) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nit || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, nit: e.target.value }))}
                        placeholder="Ej: 901.432.556-2"
                        className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                      />
                    </div>

                    {/* Logo URL */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        URL del Logo Corporativo
                      </label>
                      <input
                        type="text"
                        value={formData.logo || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                        placeholder="https://ejemplo.com/logo.png"
                        className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                      />
                    </div>

                    {/* Estado */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Estado de Operación
                      </label>
                      <select
                        value={formData.estado || 'Activo'}
                        onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value as 'Activo' | 'Inactivo' }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 cursor-pointer"
                      >
                        <option value="Activo">Activo (Habilitada en la plataforma)</option>
                        <option value="Inactivo">Inactivo (Suspendida temporalmente)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Section 2: Actividad Económica & Clasificación */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block">
                    2. Sector Económico y Actividad CIIU
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Sector Económico */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Sector Económico
                      </label>
                      <select
                        value={formData.sectorEconomico || 'Servicios'}
                        onChange={(e) => setFormData(prev => ({ ...prev, sectorEconomico: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 cursor-pointer"
                      >
                        <option value="Servicios">Servicios & BPO</option>
                        <option value="Servicios de Tecnología">Tecnología & Software</option>
                        <option value="Salud">Salud & Hospitalario</option>
                        <option value="Construcción">Construcción & Infraestructura</option>
                        <option value="Comercio">Comercio & Retail</option>
                        <option value="Manufactura">Manufactura e Industria</option>
                        <option value="Financiero">Financiero & Seguros</option>
                        <option value="Educación">Educación</option>
                        <option value="Transporte">Transporte & Logística</option>
                        <option value="Otro">Otro Sector</option>
                      </select>
                    </div>

                    {/* Tamaño Empresa */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Tamaño de la Empresa
                      </label>
                      <select
                        value={formData.tamanoEmpresa || 'Mediana (51-200)'}
                        onChange={(e) => setFormData(prev => ({ ...prev, tamanoEmpresa: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-250 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 cursor-pointer"
                      >
                        <option value="Microempresa (1-10)">Microempresa (1 a 10 colaboradores)</option>
                        <option value="Pequeña (11-50)">Pequeña Empresa (11 a 50 colaboradores)</option>
                        <option value="Mediana (51-200)">Mediana Empresa (51 a 200 colaboradores)</option>
                        <option value="Grande (>200)">Gran Empresa (Más de 200 colaboradores)</option>
                      </select>
                    </div>

                    {/* Actividad Económica CIIU */}
                    <div className="sm:col-span-2 space-y-1.5 relative">
                      <label className="text-xs font-bold text-slate-700 block">
                        Actividad Económica (Código CIIU)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={ciiuQuery}
                          onChange={(e) => {
                            setCiiuQuery(e.target.value);
                            setShowCiiuResults(true);
                          }}
                          onFocus={() => setShowCiiuResults(true)}
                          placeholder="Buscar código CIIU (Ej: 8220, 6201, Call Center)..."
                          className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-bold font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                        />
                      </div>

                      {/* Dropdown search results */}
                      {showCiiuResults && ciiuResults.length > 0 && (
                        <div className="absolute z-30 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto divide-y divide-slate-100">
                          {ciiuResults.map((item) => (
                            <button
                              key={item.codigo}
                              type="button"
                              onClick={() => handleSelectCIIU(item)}
                              className="w-full p-3 text-left hover:bg-indigo-50 transition-colors flex items-center justify-between cursor-pointer"
                            >
                              <div>
                                <span className="font-mono font-black text-indigo-600 text-xs block">
                                  CIIU {item.codigo}
                                </span>
                                <span className="text-xs font-bold text-slate-800 block">
                                  {item.actividad}
                                </span>
                              </div>
                              <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                Riesgo {item.claseRiesgo}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {formData.codigoCIIU && (
                        <p className="text-[11px] text-indigo-600 font-bold mt-1">
                          Seleccionado: Code {formData.codigoCIIU} — {formData.descripcionCIIU}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Ubicación & Datos de Contacto */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block">
                    3. Ubicación Geográfica y Canales de Contacto
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Dirección */}
                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Dirección Principal</label>
                      <input
                        type="text"
                        value={formData.direccion || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                        placeholder="Calle 100 # 15-20 Edificio Torre Empresarial"
                        className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                      />
                    </div>

                    {/* Ciudad */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Ciudad</label>
                      <input
                        type="text"
                        value={formData.ciudad || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))}
                        placeholder="Bogotá D.C."
                        className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                      />
                    </div>

                    {/* Departamento */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Departamento</label>
                      <input
                        type="text"
                        value={formData.departamento || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                        placeholder="Cundinamarca"
                        className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                      />
                    </div>

                    {/* País */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">País</label>
                      <input
                        type="text"
                        value={formData.pais || 'Colombia'}
                        onChange={(e) => setFormData(prev => ({ ...prev, pais: e.target.value }))}
                        className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                      />
                    </div>

                    {/* Teléfono */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Teléfono de Contacto</label>
                      <input
                        type="tel"
                        value={formData.telefono || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                        placeholder="+57 (601) 745 8900"
                        className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                      />
                    </div>

                    {/* Correo */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Correo Electrónico</label>
                      <input
                        type="email"
                        value={formData.correo || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, correo: e.target.value }))}
                        placeholder="contacto@empresa.com.co"
                        className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                      />
                    </div>

                    {/* Sitio Web */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Página Web</label>
                      <input
                        type="url"
                        value={formData.sitioWeb || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, sitioWeb: e.target.value }))}
                        placeholder="https://www.empresa.com.co"
                        className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Persona de Contacto */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100 inline-block">
                    4. Persona de Contacto & Responsables
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Persona de Contacto */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Persona de Contacto</label>
                      <input
                        type="text"
                        value={formData.personaContacto || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, personaContacto: e.target.value, responsableInforme: e.target.value }))}
                        placeholder="Nombre completo del enlace corporativo"
                        className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                      />
                    </div>

                    {/* Cargo de Contacto */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">Cargo</label>
                      <input
                        type="text"
                        value={formData.cargoContacto || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, cargoContacto: e.target.value, cargoResponsable: e.target.value }))}
                        placeholder="Ej: Director(a) de Gestión Humana / SG-SST"
                        className="w-full px-4 py-2.5 border border-slate-250 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end items-center gap-3 pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingCompany ? 'Guardar Cambios' : 'Registrar Empresa'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <NewCompanyWizardModal
        isOpen={showWizardModal}
        onClose={() => setShowWizardModal(false)}
        onCompanyCreated={() => {
          showToastNotification('success', 'Nueva empresa configurada y activada desde el Asistente.');
        }}
      />

    </div>
  );
};

export default AdministracionEmpresasModule;
