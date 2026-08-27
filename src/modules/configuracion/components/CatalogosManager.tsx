import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Layers, 
  Briefcase, 
  UserCheck, 
  Building, 
  FileText, 
  Laptop, 
  MapPin, 
  Map, 
  Globe,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Upload,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpDown,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { useEmpresa } from '../useEmpresa';
import { 
  CatalogKey, 
  CatalogoItem, 
  CATALOG_METADATA_LIST, 
  CatalogMetadata 
} from '../catalogos.types';
import { catalogosService } from '../catalogos.service';

const CATALOG_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Building2,
  Layers,
  Briefcase,
  UserCheck,
  Building,
  FileText,
  Laptop,
  MapPin,
  Map,
  Globe
};

export const CatalogosManager: React.FC = () => {
  const { 
    catalogs, 
    addCatalogItem, 
    updateCatalogItem, 
    deleteCatalogItem, 
    toggleCatalogItem,
    importCatalogsFromExcelData
  } = useEmpresa();

  const [activeCatalogKey, setActiveCatalogKey] = useState<CatalogKey>('sedes');
  const [searchTerm, setSearchTerm] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [editingItem, setEditingItem] = useState<CatalogoItem | null>(null);
  
  // Excel Import Modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importingFile, setImportingFile] = useState<File | null>(null);
  const [parsedImportData, setParsedImportData] = useState<Partial<Record<CatalogKey, string[]>> | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [importLoading, setImportLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const activeMetadata = CATALOG_METADATA_LIST.find(m => m.key === activeCatalogKey) || CATALOG_METADATA_LIST[0];
  const IconComponent = CATALOG_ICONS[activeMetadata.iconName] || Building2;

  const currentItems = catalogs[activeCatalogKey] || [];
  const filteredItems = currentItems.filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => (a.orden || 0) - (b.orden || 0));

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    try {
      await addCatalogItem(activeCatalogKey, newItemName);
      setNewItemName('');
      showToast('success', `"${newItemName.trim()}" agregado al catálogo de ${activeMetadata.label}.`);
    } catch (err: any) {
      showToast('error', err.message || 'Error al agregar el elemento.');
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editingItem.nombre.trim()) return;

    try {
      await updateCatalogItem(activeCatalogKey, editingItem);
      setEditingItem(null);
      showToast('success', `Elemento actualizado correctamente.`);
    } catch (err: any) {
      showToast('error', err.message || 'Error al actualizar.');
    }
  };

  const handleDeleteItem = async (item: CatalogoItem) => {
    if (window.confirm(`¿Está seguro de eliminar "${item.nombre}" del catálogo de ${activeMetadata.label}?`)) {
      try {
        await deleteCatalogItem(activeCatalogKey, item.id);
        showToast('success', `"${item.nombre}" eliminado del catálogo.`);
      } catch (err: any) {
        showToast('error', err.message || 'Error al eliminar.');
      }
    }
  };

  const handleToggleActive = async (item: CatalogoItem) => {
    try {
      await toggleCatalogItem(activeCatalogKey, item.id);
      showToast('success', `Estado de "${item.nombre}" modificado.`);
    } catch (err: any) {
      showToast('error', err.message || 'Error al cambiar estado.');
    }
  };

  // Excel Upload handling
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImportingFile(file);
      setImportLoading(true);
      try {
        const parsed = await catalogosService.parseExcelFile(file);
        setParsedImportData(parsed);
      } catch (err) {
        console.error('Error al procesar archivo Excel:', err);
        showToast('error', 'No se pudo leer el archivo Excel. Verifique la estructura.');
      } finally {
        setImportLoading(false);
      }
    }
  };

  const handleExecuteImport = async () => {
    if (!parsedImportData) return;

    setImportLoading(true);
    try {
      await importCatalogsFromExcelData(parsedImportData);
      setShowImportModal(false);
      setImportingFile(null);
      setParsedImportData(null);
      showToast('success', '¡Catálogos importados y parametrizados exitosamente desde Excel!');
    } catch (err: any) {
      showToast('error', err.message || 'Error al importar datos desde Excel.');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-6 right-6 p-4 rounded-2xl border shadow-2xl z-50 max-w-md flex items-center gap-3 ${
              toastMessage.type === 'success' 
                ? 'bg-emerald-950 border-emerald-500/30 text-emerald-100' 
                : 'bg-rose-950 border-rose-500/30 text-rose-100'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <p className="text-xs font-bold">{toastMessage.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Gestión de Catálogos Multiempresa</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-white">
              Parametrización de Listas Organizacionales
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              Cree, modifique o importe los catálogos de Sedes, Áreas, Proyectos, Cargos y demás parámetros corporativos. Todos los formularios de la plataforma consumirán estos datos dinámicamente.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => catalogosService.downloadCatalogTemplate()}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              title="Descargar plantilla de importación en Excel"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Plantilla Excel</span>
            </button>

            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Importar desde Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Catalog Tabs & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Catalogs Selection Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-3 block mb-2">
            Catálogos Parametrizables (10)
          </span>

          <div className="space-y-1.5">
            {CATALOG_METADATA_LIST.map((meta) => {
              const Icon = CATALOG_ICONS[meta.iconName] || Building2;
              const isSelected = activeCatalogKey === meta.key;
              const itemCount = (catalogs[meta.key] || []).length;
              const activeCount = (catalogs[meta.key] || []).filter(i => i.activo).length;

              return (
                <button
                  key={meta.key}
                  onClick={() => {
                    setActiveCatalogKey(meta.key);
                    setSearchTerm('');
                    setEditingItem(null);
                  }}
                  className={`w-full p-3 rounded-2xl transition-all flex items-center justify-between text-left cursor-pointer border ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold'
                      : 'bg-slate-50/60 hover:bg-slate-100/80 text-slate-700 border-slate-100 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-indigo-600 border border-slate-200'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs font-extrabold block truncate">{meta.label}</span>
                      <span className={`text-[10px] block truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {activeCount} activos ({itemCount} total)
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {activeCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Catalog Item Table & Controls (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6 flex flex-col justify-between">
          
          <div className="space-y-6">
            
            {/* Catalog Info Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 font-display">
                    Catálogo de {activeMetadata.label}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{activeMetadata.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                  Total: <strong className="text-slate-900 font-black">{currentItems.length}</strong>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                  Activos: <strong className="text-emerald-800 font-black">{currentItems.filter(i => i.activo).length}</strong>
                </span>
              </div>
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddItem} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider block">
                Agregar nuevo {activeMetadata.singularLabel}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder={activeMetadata.placeholder}
                  className="flex-1 bg-white border border-slate-250 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <button
                  type="submit"
                  disabled={!newItemName.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar</span>
                </button>
              </div>
            </form>

            {/* Filter Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Buscar en ${activeMetadata.label.toLowerCase()}...`}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Catalog Items Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
              <div className="overflow-x-auto max-h-[400px] scrollbar-thin">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">#</th>
                      <th className="py-3 px-4">Nombre</th>
                      <th className="py-3 px-4 w-24 text-center">Estado</th>
                      <th className="py-3 px-4 w-32 hidden md:table-cell">Creación</th>
                      <th className="py-3 px-4 w-28 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item, index) => {
                        const isEditing = editingItem?.id === item.id;
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 text-center font-mono text-[10px] font-bold text-slate-400">
                              {item.orden || index + 1}
                            </td>
                            
                            <td className="py-3 px-4 font-bold">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingItem.nombre}
                                  onChange={(e) => setEditingItem({ ...editingItem, nombre: e.target.value })}
                                  className="w-full bg-white border border-indigo-400 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                  autoFocus
                                />
                              ) : (
                                <span className={!item.activo ? 'line-through text-slate-400 font-normal' : ''}>
                                  {item.nombre}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleToggleActive(item)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer inline-flex items-center gap-1 ${
                                  item.activo
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}
                                title={item.activo ? 'Desactivar elemento' : 'Activar elemento'}
                              >
                                {item.activo ? (
                                  <>
                                    <Eye className="w-3 h-3 text-emerald-600" />
                                    <span>Activo</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="w-3 h-3 text-slate-400" />
                                    <span>Inactivo</span>
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="py-3 px-4 text-[10px] text-slate-400 font-mono hidden md:table-cell">
                              {item.fechaCreacion ? item.fechaCreacion.split('T')[0] : 'N/A'}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={handleSaveEdit}
                                      className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer"
                                      title="Guardar cambio"
                                    >
                                      <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => setEditingItem(null)}
                                      className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                      title="Cancelar"
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setEditingItem(item)}
                                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                      title="Editar elemento"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(item)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                      title="Eliminar elemento"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          <p className="font-extrabold text-xs text-slate-500">No hay elementos registrados en este catálogo</p>
                          <p className="text-[10px] mt-1 text-slate-400">
                            Utilice el formulario superior o la opción "Importar desde Excel" para cargar datos.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
            <span>ID Catálogo: <code className="font-mono text-slate-600">{activeCatalogKey}</code></span>
            <span>Los cambios se guardan automáticamente en la configuración de la empresa activa.</span>
          </div>

        </div>
      </div>

      {/* Excel Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-2xl w-full border border-slate-200 shadow-2xl space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 font-display">
                      Importar Catálogos desde Excel
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Cargue un archivo .xlsx para alimentar sedes, áreas, cargos, etc.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Upload Drop Zone */}
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-250 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100/60 transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-black text-slate-800">
                    {importingFile ? importingFile.name : 'Haz clic o arrastra tu archivo de Excel aquí (.xlsx)'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Formatos soportados: Microsoft Excel (.xlsx, .xls) o CSV
                  </p>
                </div>

                {importLoading && (
                  <div className="p-4 bg-indigo-50 text-indigo-800 rounded-2xl flex items-center justify-center gap-3 text-xs font-bold animate-pulse">
                    <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                    <span>Procesando estructura del archivo Excel...</span>
                  </div>
                )}

                {/* Parsed Preview */}
                {parsedImportData && (
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <span className="text-xs font-black text-slate-800 block">
                      Catálogos detectados en el archivo:
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(parsedImportData) as CatalogKey[]).map(key => {
                        const count = (parsedImportData[key] || []).length;
                        const meta = CATALOG_METADATA_LIST.find(m => m.key === key);
                        return (
                          <div key={key} className="bg-white p-2.5 rounded-xl border border-slate-200 text-xs font-bold flex justify-between items-center">
                            <span className="text-slate-700 truncate">{meta?.label || key}</span>
                            <span className="text-indigo-600 font-black bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">
                              {count} ítems
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Mode selector */}
                    <div className="pt-2 border-t border-slate-200 space-y-2">
                      <span className="text-[11px] font-extrabold text-slate-700 block">Modo de importación:</span>
                      <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                        <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                          importMode === 'merge' ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700'
                        }`}>
                          <input
                            type="radio"
                            name="importMode"
                            checked={importMode === 'merge'}
                            onChange={() => setImportMode('merge')}
                            className="accent-indigo-600"
                          />
                          <span>Combinar (Agregar nuevos)</span>
                        </label>

                        <label className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2 ${
                          importMode === 'overwrite' ? 'border-indigo-600 bg-indigo-50 text-indigo-900' : 'border-slate-200 bg-white text-slate-700'
                        }`}>
                          <input
                            type="radio"
                            name="importMode"
                            checked={importMode === 'overwrite'}
                            onChange={() => setImportMode('overwrite')}
                            className="accent-indigo-600"
                          />
                          <span>Reemplazar completamente</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => catalogosService.downloadCatalogTemplate()}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  Descargar Plantilla de Ejemplo
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!parsedImportData || importLoading}
                    onClick={handleExecuteImport}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Confirmar e Importar</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
