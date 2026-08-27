import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Layers, 
  GitBranch, 
  GitCommit, 
  Briefcase, 
  Megaphone, 
  UserCheck, 
  Building, 
  Laptop, 
  FileText, 
  Clock, 
  Calendar, 
  Award, 
  ShieldAlert, 
  HeartPulse, 
  PiggyBank, 
  Users, 
  MapPin, 
  Map, 
  Globe,
  GraduationCap,
  Home,
  Hash,
  User,
  CreditCard,
  ListPlus,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  FileSpreadsheet,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  RefreshCw,
  Info,
  Check,
  X,
  ChevronRight,
  Eye,
  SlidersHorizontal,
  LayoutGrid,
  List,
  History,
  Network,
  ShieldCheck,
  AlertTriangle,
  FolderTree,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEmpresa } from '../configuracion/useEmpresa';
import { 
  CatalogKey, 
  CatalogoItem, 
  CATALOG_METADATA_LIST, 
  CatalogMetadata,
  CustomCatalogDefinition,
  CatalogAuditLog
} from '../configuracion/catalogos.types';
import { catalogosService, ExcelImportValidationResult } from '../configuracion/catalogos.service';

export function CatalogosOrganizacionalesModule() {
  const { 
    activeCompanyId, 
    companies, 
    switchCompany, 
    config, 
    catalogs, 
    customDefinitions,
    auditLogs,
    getCatalogItems,
    addCatalogItem,
    updateCatalogItem,
    deactivateCatalogItem,
    toggleCatalogItem,
    createCustomCatalog,
    validateExcelImport,
    executeValidatedImport,
    hasCatalogPermission
  } = useEmpresa();

  // Selected Catalog Tab
  const [selectedCatalogKey, setSelectedCatalogKey] = useState<string>('sedes');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'estructura' | 'condiciones' | 'demografia' | 'personalizados' | 'jerarquia' | 'historial'>('estructura');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'activos' | 'inactivos'>('todos');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Item Create/Edit Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null);
  const [formNombre, setFormNombre] = useState('');
  const [formCodigo, setFormCodigo] = useState('');
  const [formDescripcion, setFormDescripcion] = useState('');
  const [formSedeId, setFormSedeId] = useState<string>('');
  const [formAreaId, setFormAreaId] = useState<string>('');
  const [formProcesoId, setFormProcesoId] = useState<string>('');
  const [formOrden, setFormOrden] = useState<number>(1);
  const [formActivo, setFormActivo] = useState(true);

  // Deactivation Modal
  const [deactivatingItem, setDeactivatingItem] = useState<CatalogoItem | null>(null);

  // Custom Catalog Modal
  const [isCustomCatModalOpen, setIsCustomCatModalOpen] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customSingular, setCustomSingular] = useState('');
  const [customKey, setCustomKey] = useState('');
  const [customPrefix, setCustomPrefix] = useState('');
  const [customDescription, setCustomDescription] = useState('');

  // Excel Import Modal with 2-step validation flow
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFileName, setImportFileName] = useState<string>('');
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [validationResult, setValidationResult] = useState<ExcelImportValidationResult | null>(null);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper Icon Resolver
  const getIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case 'Building2': return <Building2 className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'GitBranch': return <GitBranch className={className} />;
      case 'GitCommit': return <GitCommit className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'Megaphone': return <Megaphone className={className} />;
      case 'UserCheck': return <UserCheck className={className} />;
      case 'Building': return <Building className={className} />;
      case 'Laptop': return <Laptop className={className} />;
      case 'FileText': return <FileText className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'Calendar': return <Calendar className={className} />;
      case 'Award': return <Award className={className} />;
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'HeartPulse': return <HeartPulse className={className} />;
      case 'PiggyBank': return <PiggyBank className={className} />;
      case 'Users': return <Users className={className} />;
      case 'MapPin': return <MapPin className={className} />;
      case 'Map': return <Map className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'Home': return <Home className={className} />;
      case 'Hash': return <Hash className={className} />;
      case 'User': return <User className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      default: return <ListPlus className={className} />;
    }
  };

  // Build Metadata for all available catalogs (standard + custom)
  const allMetadataList = useMemo(() => {
    const customMeta: CatalogMetadata[] = (customDefinitions || []).map(def => ({
      key: def.key,
      label: def.label,
      singularLabel: def.singularLabel,
      description: def.description || 'Catálogo personalizado configurado por la empresa.',
      iconName: def.iconName || 'ListPlus',
      placeholder: `Ej. ${def.singularLabel} 1`,
      codePrefix: def.codePrefix || 'CST',
      categoryGroup: 'Personalizados',
      examples: [`${def.singularLabel} 1`, `${def.singularLabel} 2`]
    }));

    return [...CATALOG_METADATA_LIST, ...customMeta];
  }, [customDefinitions]);

  // Current selected metadata
  const currentMetadata = useMemo(() => {
    return allMetadataList.find(m => m.key === selectedCatalogKey) || allMetadataList[0];
  }, [allMetadataList, selectedCatalogKey]);

  // Catalog items filtered by search & status
  const currentRawItems = useMemo(() => {
    return catalogs[selectedCatalogKey] || [];
  }, [catalogs, selectedCatalogKey]);

  const displayedItems = useMemo(() => {
    return currentRawItems.filter(item => {
      if (statusFilter === 'activos' && !item.activo) return false;
      if (statusFilter === 'inactivos' && item.activo) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchName = item.nombre.toLowerCase().includes(term);
        const matchCode = (item.codigo || '').toLowerCase().includes(term);
        const matchDesc = (item.descripcion || '').toLowerCase().includes(term);
        return matchName || matchCode || matchDesc;
      }
      return true;
    }).sort((a, b) => (a.orden || 0) - (b.orden || 0));
  }, [currentRawItems, statusFilter, searchTerm]);

  // Parent Catalog options for relations
  const sedesList = useMemo(() => (catalogs.sedes || []).filter(s => s.activo), [catalogs]);
  const areasList = useMemo(() => (catalogs.areas || []).filter(a => a.activo), [catalogs]);
  const procesosList = useMemo(() => (catalogs.procesos || []).filter(p => p.activo), [catalogs]);

  // Handlers for Items
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormNombre('');
    setFormDescripcion('');
    setFormSedeId('');
    setFormAreaId('');
    setFormProcesoId('');
    const count = currentRawItems.length;
    const autoCode = `${currentMetadata.codePrefix}-${(count + 1).toString().padStart(3, '0')}`;
    setFormCodigo(autoCode);
    setFormOrden(count + 1);
    setFormActivo(true);
    setIsItemModalOpen(true);
  };

  const handleOpenEditModal = (item: CatalogoItem) => {
    setEditingItem(item);
    setFormNombre(item.nombre);
    setFormCodigo(item.codigo || '');
    setFormDescripcion(item.descripcion || '');
    setFormSedeId(item.sedeId || '');
    setFormAreaId(item.areaId || '');
    setFormProcesoId(item.procesoId || '');
    setFormOrden(item.orden || 1);
    setFormActivo(item.activo);
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNombre.trim()) {
      showToast('El nombre del elemento es obligatorio.', 'error');
      return;
    }
    if (!formCodigo.trim()) {
      showToast('El código interno es obligatorio.', 'error');
      return;
    }

    try {
      if (editingItem) {
        await updateCatalogItem(selectedCatalogKey, {
          ...editingItem,
          nombre: formNombre.trim(),
          codigo: formCodigo.trim().toUpperCase(),
          descripcion: formDescripcion.trim() || undefined,
          sedeId: formSedeId || undefined,
          areaId: formAreaId || undefined,
          procesoId: formProcesoId || undefined,
          orden: formOrden,
          activo: formActivo,
          status: formActivo ? 'ACTIVE' : 'INACTIVE'
        });
        showToast(`Elemento "${formNombre}" actualizado con éxito.`);
      } else {
        await addCatalogItem(selectedCatalogKey, {
          nombre: formNombre.trim(),
          codigo: formCodigo.trim().toUpperCase(),
          descripcion: formDescripcion.trim() || undefined,
          sedeId: formSedeId || undefined,
          areaId: formAreaId || undefined,
          procesoId: formProcesoId || undefined,
          orden: formOrden,
          activo: true,
          status: 'ACTIVE'
        });
        showToast(`Nuevo elemento "${formNombre}" agregado al catálogo.`);
      }
      setIsItemModalOpen(false);
    } catch (error: any) {
      showToast(error.message || 'Error al guardar elemento del catálogo', 'error');
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivatingItem) return;
    try {
      await deactivateCatalogItem(selectedCatalogKey, deactivatingItem.id);
      showToast(`Elemento "${deactivatingItem.nombre}" desactivado para preservar trazabilidad histórica.`);
      setDeactivatingItem(null);
    } catch (error: any) {
      showToast(error.message || 'Error al desactivar el elemento', 'error');
    }
  };

  // Custom Catalog Creation Handler
  const handleCreateCustomCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLabel.trim() || !customSingular.trim()) {
      showToast('Nombre y etiqueta singular son requeridos.', 'error');
      return;
    }

    const key = (customKey || customLabel).toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    const prefix = (customPrefix || 'CST').toUpperCase().trim();

    try {
      await createCustomCatalog({
        key,
        label: customLabel.trim(),
        singularLabel: customSingular.trim(),
        description: customDescription.trim() || undefined,
        codePrefix: prefix,
        activo: true
      });
      showToast(`Catálogo personalizado "${customLabel}" creado con éxito.`);
      setSelectedCatalogKey(key);
      setSelectedCategoryTab('personalizados');
      setIsCustomCatModalOpen(false);
      setCustomLabel('');
      setCustomSingular('');
      setCustomKey('');
      setCustomPrefix('');
      setCustomDescription('');
    } catch (error: any) {
      showToast(error.message || 'Error al crear catálogo personalizado', 'error');
    }
  };

  // Excel File Select & Parse with Validation
  const handleExcelFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setIsParsingExcel(true);
    setValidationResult(null);

    try {
      const parsedRaw = await catalogosService.parseExcelFile(file);
      const valRes = await validateExcelImport(parsedRaw);
      setValidationResult(valRes);
    } catch (error: any) {
      showToast(`Error al procesar archivo Excel: ${error.message}`, 'error');
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!validationResult || !validationResult.valid) {
      showToast('Corrija los errores de validación antes de importar.', 'error');
      return;
    }

    try {
      await executeValidatedImport(validationResult.validData);
      showToast(`Importación masiva exitosa: ${validationResult.validRows} registros incorporados.`);
      setIsImportModalOpen(false);
      setValidationResult(null);
    } catch (error: any) {
      showToast(`Error al ejecutar importación: ${error.message}`, 'error');
    }
  };

  const currentCompany = companies.find(c => c.id === activeCompanyId) || config;

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 ${
              toastMessage.type === 'error'
                ? 'bg-rose-900/90 text-white border-rose-700/50 backdrop-blur-md'
                : toastMessage.type === 'info'
                ? 'bg-sky-900/90 text-white border-sky-700/50 backdrop-blur-md'
                : 'bg-emerald-900/90 text-white border-emerald-700/50 backdrop-blur-md'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-5 h-5 text-rose-300 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            )}
            <span className="text-xs font-semibold">{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Multi-Tenant Enterprise Selector */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-400/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span>Aislamiento Multiempresa Estricto</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
              companyId: {activeCompanyId}
            </span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Building2 className="w-7 h-7 text-indigo-400" />
            <span>Administrador de Catálogos Parametrizables</span>
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Gestión completa de valores maestros por empresa. Sin valores hardcodeados en el sistema: los filtros, encuestas, indicadores y reportes responden exclusivamente a los catálogos reales de <strong>{currentCompany.nombreEmpresa || 'la organización'}</strong>.
          </p>
        </div>

        {/* Enterprise Switcher Control */}
        <div className="bg-slate-800/90 p-4 rounded-2xl border border-slate-700/80 space-y-2 shrink-0 min-w-[260px]">
          <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-indigo-400" />
            <span>Empresa Activa</span>
          </label>
          <select
            value={activeCompanyId}
            onChange={(e) => switchCompany(e.target.value)}
            className="w-full bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {companies.map(comp => (
              <option key={comp.id} value={comp.id}>
                {comp.nombreEmpresa} ({comp.nit || 'Sin NIT'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => { setSelectedCategoryTab('estructura'); setSelectedCatalogKey('sedes'); }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedCategoryTab === 'estructura'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Estructura Organizacional</span>
        </button>

        <button
          onClick={() => { setSelectedCategoryTab('condiciones'); setSelectedCatalogKey('modalidadesTrabajo'); }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedCategoryTab === 'condiciones'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Condiciones Laborales</span>
        </button>

        <button
          onClick={() => { setSelectedCategoryTab('demografia'); setSelectedCatalogKey('nivelesEducativos'); }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedCategoryTab === 'demografia'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Demografía y Afiliaciones</span>
        </button>

        <button
          onClick={() => {
            setSelectedCategoryTab('personalizados');
            const firstCustomKey = customDefinitions[0]?.key || selectedCatalogKey;
            setSelectedCatalogKey(firstCustomKey);
          }}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedCategoryTab === 'personalizados'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ListPlus className="w-4 h-4 text-amber-500" />
          <span>Listas Personalizadas</span>
          {customDefinitions.length > 0 && (
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-black">
              {customDefinitions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSelectedCategoryTab('jerarquia')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedCategoryTab === 'jerarquia'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Network className="w-4 h-4 text-cyan-500" />
          <span>Jerarquía & Relaciones</span>
        </button>

        <button
          onClick={() => setSelectedCategoryTab('historial')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            selectedCategoryTab === 'historial'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <History className="w-4 h-4 text-emerald-500" />
          <span>Historial & Auditoría</span>
          <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded-full font-black">
            {auditLogs.length}
          </span>
        </button>
      </div>

      {/* Sub-Catalog Quick Selector Pills */}
      {selectedCategoryTab !== 'jerarquia' && selectedCategoryTab !== 'historial' && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {allMetadataList
            .filter(m => {
              if (selectedCategoryTab === 'estructura') return m.categoryGroup === 'Estructura';
              if (selectedCategoryTab === 'condiciones') return m.categoryGroup === 'Condiciones';
              if (selectedCategoryTab === 'demografia') return m.categoryGroup === 'Demografía';
              if (selectedCategoryTab === 'personalizados') return m.categoryGroup === 'Personalizados';
              return true;
            })
            .map(m => {
              const count = (catalogs[m.key] || []).length;
              const isSel = selectedCatalogKey === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setSelectedCatalogKey(m.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
                    isSel
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {getIcon(m.iconName, "w-3.5 h-3.5")}
                  <span>{m.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSel ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}

          {selectedCategoryTab === 'personalizados' && (
            <button
              onClick={() => setIsCustomCatModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 whitespace-nowrap flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Crear Lista Personalizada</span>
            </button>
          )}
        </div>
      )}

      {/* TAB CONTENT: JERARQUÍA & RELACIONES */}
      {selectedCategoryTab === 'jerarquia' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Network className="w-5 h-5 text-indigo-600" />
                <span>Estructura Jerárquica entre Catálogos Empresariales</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Relaciones en cascada para encuestas y filtros dinámicos (Empresa ↓ Sede ↓ Área ↓ Proceso ↓ Subproceso ↓ Proyecto ↓ Cargo).
              </p>
            </div>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100">
              {currentCompany.nombreEmpresa}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 relative text-center">
            {['Empresa', 'Sede', 'Área', 'Proceso', 'Subproceso', 'Proyecto', 'Cargo'].map((step, idx) => (
              <div key={step} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Nivel {idx + 1}
                </span>
                <p className="text-sm font-extrabold text-slate-800">{step}</p>
                <p className="text-[11px] text-slate-500">
                  {idx === 0 ? 'Empresa principal' : `Asociado a ${['Empresa', 'Sede', 'Área', 'Proceso', 'Subproceso', 'Proyecto'][idx - 1]}`}
                </p>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-start gap-3 text-xs text-amber-900">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Filtrado Dinámico en Encuestas:</span>
              <p className="leading-relaxed text-amber-800">
                Al diligenciar encuestas o consultar tableros, si el usuario selecciona <strong>Sede = Bogotá</strong>, la pregunta de <strong>Área</strong> mostrará únicamente las áreas vinculadas a la Sede Bogotá. Igualmente, los <strong>Proyectos</strong> y <strong>Cargos</strong> responderán al filtro previo seleccionado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: HISTORIAL & AUDITORÍA */}
      {selectedCategoryTab === 'historial' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-600" />
                <span>Historial de Auditoría y Trazabilidad de Cambios</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Registro de creaciones, modificaciones, desactivaciones e importaciones masivas por usuario.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
              {auditLogs.length} eventos registrados
            </span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <History className="w-10 h-10 mx-auto stroke-1" />
              <p className="text-xs font-medium">No hay registros de cambios en el historial para esta empresa.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Fecha y Hora</th>
                    <th className="py-3 px-4">Catálogo</th>
                    <th className="py-3 px-4">Acción</th>
                    <th className="py-3 px-4">Código / Nombre</th>
                    <th className="py-3 px-4">Detalle de Cambio</th>
                    <th className="py-3 px-4">Usuario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                        {new Date(log.modifiedAt).toLocaleString('es-CO')}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {log.catalogLabel}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                          log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-800' :
                          log.action === 'UPDATE' ? 'bg-sky-100 text-sky-800' :
                          log.action === 'DEACTIVATE' ? 'bg-rose-100 text-rose-800' :
                          log.action === 'IMPORT' ? 'bg-purple-100 text-purple-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <span className="font-mono text-slate-500 mr-1.5">[{log.itemCode}]</span>
                        {log.itemName}
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-md truncate">
                        {log.changesSummary}
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {log.modifiedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CATALOG LISTING & ACTIONS */}
      {selectedCategoryTab !== 'jerarquia' && selectedCategoryTab !== 'historial' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          
          {/* Header of Selected Catalog */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 shrink-0">
                {getIcon(currentMetadata.iconName, "w-6 h-6")}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                    Catálogo de {currentMetadata.label}
                  </h2>
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
                    {displayedItems.length} registros
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                  {currentMetadata.description}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo {currentMetadata.singularLabel}</span>
              </button>

              <button
                onClick={() => {
                  setValidationResult(null);
                  setImportFileName('');
                  setIsImportModalOpen(true);
                }}
                className="px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all"
              >
                <Upload className="w-4 h-4 text-slate-500" />
                <span>Importar Excel</span>
              </button>

              <button
                onClick={() => catalogosService.downloadCatalogTemplate()}
                className="px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all"
                title="Descargar Plantilla Excel Oficial"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Plantilla</span>
              </button>

              <button
                onClick={() => catalogosService.exportCatalogsToExcel(activeCompanyId, catalogs, selectedCatalogKey)}
                className="px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-all"
                title="Exportar catálogo actual a Excel"
              >
                <Download className="w-4 h-4 text-sky-600" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Search, Status Filter & View Toggle Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Buscar en ${currentMetadata.label.toLowerCase()} por código o nombre...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Active / Inactive */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setStatusFilter('todos')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${statusFilter === 'todos' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setStatusFilter('activos')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${statusFilter === 'activos' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Activos
                </button>
                <button
                  onClick={() => setStatusFilter('inactivos')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${statusFilter === 'inactivos' ? 'bg-rose-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  Inactivos
                </button>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'table' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                  title="Vista Tabla"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-100'}`}
                  title="Vista Tarjetas"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Items Display */}
          {displayedItems.length === 0 ? (
            <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 space-y-3">
              <div className="w-12 h-12 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                {getIcon(currentMetadata.iconName, "w-6 h-6")}
              </div>
              <div className="space-y-1">
                <p className="text-sm font-extrabold text-slate-700">Sin registros en {currentMetadata.label}</p>
                <p className="text-xs text-slate-400">No se encontraron elementos activos o coincidentes con los filtros.</p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Primer Registro</span>
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* Table View */
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Orden</th>
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Nombre / Descripción</th>
                    <th className="py-3 px-4">Relación Padre</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedItems.map(item => {
                    const parentSede = sedesList.find(s => s.id === item.sedeId);
                    const parentArea = areasList.find(a => a.id === item.areaId);

                    return (
                      <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors ${!item.activo ? 'bg-slate-50/50 opacity-75' : ''}`}>
                        <td className="py-3 px-4 font-mono font-bold text-slate-400">
                          #{item.orden}
                        </td>
                        <td className="py-3 px-4 font-mono font-black text-slate-800">
                          <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {item.codigo || 'N/A'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          <div>{item.nombre}</div>
                          {item.descripcion && (
                            <div className="text-[11px] text-slate-400 font-normal">{item.descripcion}</div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {parentSede && (
                            <span className="inline-flex items-center gap-1 bg-sky-50 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-100 mr-1">
                              <Building2 className="w-3 h-3 text-sky-600" />
                              {parentSede.nombre}
                            </span>
                          )}
                          {parentArea && (
                            <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-100">
                              <Layers className="w-3 h-3 text-purple-600" />
                              {parentArea.nombre}
                            </span>
                          )}
                          {!parentSede && !parentArea && (
                            <span className="text-slate-300 font-mono text-[11px]">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleCatalogItem(selectedCatalogKey, item.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                              item.activo
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                            }`}
                          >
                            {item.activo ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>ACTIVO</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3 text-rose-600" />
                                <span>INACTIVO</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                              title="Editar"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeactivatingItem(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                              title="Desactivar (Proteger Histórico)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* Cards View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedItems.map(item => (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                    item.activo ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md' : 'bg-slate-50 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                        {item.codigo || 'N/A'}
                      </span>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${item.activo ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {item.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">{item.nombre}</h3>
                      {item.descripcion && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.descripcion}</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-[11px]">Orden: #{item.orden}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeactivatingItem(item)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                        title="Desactivar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CREATE / EDIT ITEM MODAL */}
      <AnimatePresence>
        {isItemModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-6 text-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    {getIcon(currentMetadata.iconName, "w-5 h-5")}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      {editingItem ? `Editar ${currentMetadata.singularLabel}` : `Nuevo ${currentMetadata.singularLabel}`}
                    </h3>
                    <p className="text-xs text-slate-400">Catálogo: {currentMetadata.label}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsItemModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
                {/* Código */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Código Único Interno *</span>
                    <span className="text-[10px] text-slate-400 font-normal">Único por empresa</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCodigo}
                    onChange={(e) => setFormCodigo(e.target.value.toUpperCase())}
                    placeholder={`Ej. ${currentMetadata.codePrefix}-001`}
                    className="w-full font-mono bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Nombre */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nombre / Etiqueta *</label>
                  <input
                    type="text"
                    required
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    placeholder={currentMetadata.placeholder}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Descripción u Observaciones</label>
                  <textarea
                    rows={2}
                    value={formDescripcion}
                    onChange={(e) => setFormDescripcion(e.target.value)}
                    placeholder="Detalles adicionales del elemento en el catálogo..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Relationships if applicable */}
                {(selectedCatalogKey === 'areas' || selectedCatalogKey === 'proyectos') && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Sede Principal Asociada (Opcional)</label>
                    <select
                      value={formSedeId}
                      onChange={(e) => setFormSedeId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Sin asociación específica de sede --</option>
                      {sedesList.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.nombre} ({s.codigo})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {(selectedCatalogKey === 'procesos' || selectedCatalogKey === 'proyectos' || selectedCatalogKey === 'cargos') && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Área Organizacional Asociada (Opcional)</label>
                    <select
                      value={formAreaId}
                      onChange={(e) => setFormAreaId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Sin asociación específica de área --</option>
                      {areasList.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.nombre} ({a.codigo})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Orden & Activo */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Orden Secuencial</label>
                    <input
                      type="number"
                      min={1}
                      value={formOrden}
                      onChange={(e) => setFormOrden(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Estado de Operación</label>
                    <select
                      value={formActivo ? 'true' : 'false'}
                      onChange={(e) => setFormActivo(e.target.value === 'true')}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="true">Activo</option>
                      <option value="false">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsItemModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DEACTIVATION WARNING MODAL */}
      <AnimatePresence>
        {deactivatingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 text-slate-800"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-3 bg-rose-50 rounded-2xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Desactivar Elemento de Catálogo</h3>
                  <p className="text-xs text-slate-500">Protección de Datos Históricos (status = INACTIVE)</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs text-slate-600">
                <p>
                  Va a desactivar el registro <strong className="text-slate-900">"{deactivatingItem.nombre}"</strong> (Código: {deactivatingItem.codigo}).
                </p>
                <p className="text-slate-500 leading-relaxed">
                  Para no alterar informes o respuestas de encuestas históricas tomadas en el pasado, el registro NO se eliminará físicamente, sino que cambiará su estado a <strong>INACTIVO</strong>.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeactivatingItem(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmDeactivate}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-all"
                >
                  Confirmar Desactivación
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE CUSTOM CATALOG MODAL */}
      <AnimatePresence>
        {isCustomCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-6 text-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                    <ListPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Nueva Lista / Catálogo Personalizado</h3>
                    <p className="text-xs text-slate-400">Parámetros propios sin modificación de código</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCustomCatModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomCatalog} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nombre del Catálogo (Plural) *</label>
                  <input
                    type="text"
                    required
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                    placeholder="Ej. Tipo de Operación, Segmento de Cliente, Tipo de Equipamiento"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Etiqueta en Singular *</label>
                  <input
                    type="text"
                    required
                    value={customSingular}
                    onChange={(e) => setCustomSingular(e.target.value)}
                    placeholder="Ej. Tipo de Operación, Segmento de Cliente"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Prefijo de Código *</label>
                    <input
                      type="text"
                      maxLength={5}
                      required
                      value={customPrefix}
                      onChange={(e) => setCustomPrefix(e.target.value.toUpperCase())}
                      placeholder="Ej. TOP, SEG, EQP"
                      className="w-full uppercase font-mono bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Identificador Clave</label>
                    <input
                      type="text"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      placeholder="Auto-generado si se deja vacío"
                      className="w-full font-mono bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Descripción o Propósito</label>
                  <textarea
                    rows={2}
                    value={customDescription}
                    onChange={(e) => setCustomDescription(e.target.value)}
                    placeholder="Escriba la utilidad de este catálogo en la empresa..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsCustomCatModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all"
                  >
                    Crear Catálogo
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EXCEL IMPORT MODAL WITH PRE-VALIDATION */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl p-6 space-y-6 text-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Importación Masiva con Pre-Validación</h3>
                    <p className="text-xs text-slate-400">Verificación estricta de códigos, duplicados y referencias</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Input */}
              <div className="space-y-3 text-xs">
                <label className="block font-bold text-slate-700">Seleccionar Archivo Excel (.xlsx / .xls)</label>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleExcelFileChange}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />

                {isParsingExcel && (
                  <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-3 text-slate-600">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Analizando y validando estructura y duplicados en el archivo...</span>
                  </div>
                )}

                {/* Validation Results Report */}
                {validationResult && (
                  <div className="space-y-4 pt-2">
                    <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                      validationResult.valid
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}>
                      <div className="flex items-center gap-2 font-bold">
                        {validationResult.valid ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                        <span>
                          {validationResult.valid
                            ? '¡Archivo totalmente válido y listo para importar!'
                            : `Se encontraron ${validationResult.errors.length} errores que impiden la importación.`}
                        </span>
                      </div>
                      <div className="text-right text-[11px] font-mono">
                        <div>Válidos: {validationResult.validRows}</div>
                        <div>Inválidos: {validationResult.invalidRows}</div>
                      </div>
                    </div>

                    {/* List of Validation Errors */}
                    {validationResult.errors.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-bold text-rose-700">Detalle de Inconsistencias Detección:</span>
                        <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 bg-rose-50/50 rounded-2xl border border-rose-200 font-mono text-[11px] text-rose-800">
                          {validationResult.errors.map((err, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                              <span className="font-bold shrink-0">[Fila {err.row}]</span>
                              <span>[{err.catalogKey}] {err.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!validationResult || !validationResult.valid || validationResult.validRows === 0}
                  onClick={handleExecuteImport}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                    validationResult && validationResult.valid
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Confirmar e Importar Registros Válidos
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
