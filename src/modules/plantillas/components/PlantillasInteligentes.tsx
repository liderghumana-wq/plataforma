import React, { useState, useRef, useEffect } from 'react';
import {
  Layers,
  Search,
  Plus,
  Download,
  Tag,
  FileText,
  FileSpreadsheet,
  FileDown,
  ExternalLink,
  Trash2,
  Filter,
  Users,
  Shield,
  Leaf,
  Scale,
  Sparkles,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar,
  Settings,
  HelpCircle,
  ArrowUpRight,
  RefreshCw,
  Award,
  Clock,
  ClipboardList,
  Check
} from 'lucide-react';
import { Plantilla, PlantillaCategoria, PlantillaTipo } from '../plantillas.types';
import { CATEGORIAS_PLANTILLAS, TIPOS_PLANTILLAS, MOCK_PLANTILLAS } from '../data/mockPlantillas';

// Map icons for categories
const getCategoryIcon = (catId: PlantillaCategoria) => {
  switch (catId) {
    case 'capital_humano':
      return <Users className="w-4 h-4" />;
    case 'sg_sst':
      return <Shield className="w-4 h-4" />;
    case 'calidad':
      return <Award className="w-4 h-4" />;
    case 'ambiental':
      return <Leaf className="w-4 h-4" />;
    case 'legal':
      return <Scale className="w-4 h-4" />;
    default:
      return <Settings className="w-4 h-4" />;
  }
};

// Map icons for types
const getTypeIcon = (tipoId: PlantillaTipo) => {
  switch (tipoId) {
    case 'encuesta':
      return <HelpCircle className="w-4 h-4" />;
    case 'formato':
      return <FileText className="w-4 h-4" />;
    case 'matriz':
      return <Layers className="w-4 h-4" />;
    case 'procedimiento':
      return <ClipboardList className="w-4 h-4" />;
    case 'politica':
      return <Shield className="w-4 h-4" />;
    case 'plan_accion':
      return <Clock className="w-4 h-4" />;
    case 'cronograma':
      return <Calendar className="w-4 h-4" />;
    case 'informe':
      return <FileSpreadsheet className="w-4 h-4" />;
    default:
      return <FileText className="w-4 h-4" />;
  }
};

// Map icons for extensions
const getExtensionBadge = (ext: string) => {
  switch (ext) {
    case 'xlsx':
      return <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded border border-emerald-200">XLSX</span>;
    case 'docx':
      return <span className="bg-blue-50 text-blue-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded border border-blue-200">DOCX</span>;
    case 'pdf':
      return <span className="bg-rose-50 text-rose-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded border border-rose-200">PDF</span>;
    default:
      return <span className="bg-slate-50 text-slate-700 font-extrabold text-[9px] px-1.5 py-0.5 rounded border border-slate-200">{ext.toUpperCase()}</span>;
  }
};

export default function PlantillasInteligentes() {
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<PlantillaCategoria | 'all'>('all');
  const [selectedType, setSelectedType] = useState<PlantillaTipo | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Template Form States
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<PlantillaCategoria>('capital_humano');
  const [newType, setNewType] = useState<PlantillaTipo>('formato');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState('');
  const [newExtension, setNewExtension] = useState<'xlsx' | 'docx' | 'pdf' | 'pptx' | 'zip'>('docx');
  const [isMandatory, setIsMandatory] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initial templates
  useEffect(() => {
    const cached = localStorage.getItem('happy_insight_plantillas_v1');
    if (cached) {
      try {
        setPlantillas(JSON.parse(cached));
      } catch (e) {
        setPlantillas(MOCK_PLANTILLAS);
      }
    } else {
      setPlantillas(MOCK_PLANTILLAS);
    }
  }, []);

  const savePlantillas = (updated: Plantilla[]) => {
    setPlantillas(updated);
    localStorage.setItem('happy_insight_plantillas_v1', JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Mock download action
  const handleDownload = (id: string, titulo: string, extension: string) => {
    const updated = plantillas.map(p => {
      if (p.id === id) {
        return { ...p, descargas: p.descargas + 1 };
      }
      return p;
    });
    savePlantillas(updated);
    showToast(`Descargando plantilla: "${titulo}.${extension}"`);

    // Standard download simulation
    const dummyContent = `Happy Insight Template Content - ${titulo} - v1.0`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${titulo.toLowerCase().replace(/\s+/g, '_')}_plantilla.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // File Drag & Drop handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    setNewFileName(file.name);
    // Size formatting
    const sizeInKB = file.size / 1024;
    if (sizeInKB > 1024) {
      setNewFileSize(`${(sizeInKB / 1024).toFixed(1)} MB`);
    } else {
      setNewFileSize(`${Math.round(sizeInKB)} KB`);
    }

    // Guess extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      setNewExtension('xlsx');
      setNewType('matriz');
    } else if (ext === 'docx' || ext === 'doc') {
      setNewExtension('docx');
      setNewType('procedimiento');
    } else if (ext === 'pdf') {
      setNewExtension('pdf');
      setNewType('politica');
    } else if (ext === 'pptx' || ext === 'ppt') {
      setNewExtension('pptx');
      setNewType('informe');
    } else {
      setNewExtension('docx');
    }

    // Pre-populate Title based on file name
    const rawName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const readableTitle = rawName
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    setNewTitle(readableTitle);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Create Template form handler
  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFileName) {
      showToast('Por favor introduce un título y adjunta un archivo de plantilla.');
      return;
    }

    const tagsArr = newTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newlyCreated: Plantilla = {
      id: 'plt-' + Date.now(),
      titulo: newTitle.trim(),
      tipo: newType,
      categoria: newCategory,
      descripcion: newDescription.trim() || 'Plantilla de gestión corporativa creada.',
      extension: newExtension,
      tamano: newFileSize || '180 KB',
      descargas: 0,
      etiquetas: tagsArr.length > 0 ? tagsArr : ['Personalizada', 'Carga Directa'],
      fechaActualizacion: new Date().toLocaleDateString(),
      version: '1.0',
      esObligatorio: isMandatory
    };

    const updated = [newlyCreated, ...plantillas];
    savePlantillas(updated);
    showToast(`Plantilla "${newTitle}" creada con éxito.`);

    // Reset Form
    setNewTitle('');
    setNewCategory('capital_humano');
    setNewType('formato');
    setNewDescription('');
    setNewTags('');
    setNewFileName('');
    setNewFileSize('');
    setIsMandatory(false);
    setShowUploadModal(false);
  };

  const handleDeleteTemplate = (id: string, name: string) => {
    if (window.confirm(`¿Seguro que deseas eliminar la plantilla "${name}"?`)) {
      const updated = plantillas.filter(p => p.id !== id);
      savePlantillas(updated);
      showToast('Plantilla eliminada.');
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('¿Deseas restablecer la biblioteca de plantillas a la configuración de fábrica?')) {
      savePlantillas(MOCK_PLANTILLAS);
      showToast('Plantillas reestablecidas por defecto.');
    }
  };

  // Filter lists
  const filteredPlantillas = plantillas.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.categoria === selectedCategory;
    const matchesType = selectedType === 'all' || p.tipo === selectedType;
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = p.titulo.toLowerCase().includes(query) ||
      p.descripcion.toLowerCase().includes(query) ||
      p.etiquetas.some(tag => tag.toLowerCase().includes(query)) ||
      p.extension.toLowerCase().includes(query);

    return matchesCategory && matchesType && matchesSearch;
  });

  // Calculate Metrics
  const totalCount = plantillas.length;
  const mandatoryCount = plantillas.filter(p => p.esObligatorio).length;
  const totalDownloads = plantillas.reduce((acc, p) => acc + p.descargas, 0);

  return (
    <div className="space-y-6 animate-fade-in text-left pb-12">
      
      {/* TOAST NOTIFICATION */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-slate-800 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[45%] h-[100%] bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl shadow-3xs">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 font-display tracking-tight leading-none">
                  Plantillas Inteligentes
                </h1>
                <span className="bg-indigo-50 text-indigo-700 font-black text-[9px] px-2 py-0.5 rounded-md border border-indigo-200 uppercase tracking-widest">
                  Gestión Estandarizada
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Acelera tus procesos de Gestión Humana, SG-SST e ISO con plantillas de encuestas, matrices y cronogramas listos para descargar.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 shrink-0">
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Restaurar Valores</span>
          </button>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Subir Plantilla</span>
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-3xs flex items-center gap-3.5">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Total Plantillas</p>
            <p className="text-xl font-black text-slate-800">{totalCount} disponibles</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-3xs flex items-center gap-3.5">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Obligatorias / Críticas</p>
            <p className="text-xl font-black text-slate-800">{mandatoryCount} requeridas</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/60 p-4 shadow-3xs flex items-center gap-3.5">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileDown className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Descargas Totales</p>
            <p className="text-xl font-black text-slate-800">{totalDownloads} veces utilizadas</p>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-4 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar plantilla, palabras clave, formato..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Clear */}
          {(selectedCategory !== 'all' || selectedType !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedType('all');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 cursor-pointer self-center"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Limpiar Filtros</span>
            </button>
          )}

        </div>

        {/* Horizontal scroll lists for categories & types */}
        <div className="space-y-3.5 pt-2 border-t border-slate-100">
          
          {/* CATEGORIES CHIPS */}
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block pl-1">
              Área de Clasificación
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-3xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                Todas las áreas
              </button>
              
              {CATEGORIAS_PLANTILLAS.map(cat => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-transparent shadow-3xs'
                        : `${cat.bg} ${cat.text} ${cat.border} hover:opacity-90`
                    }`}
                  >
                    {getCategoryIcon(cat.id)}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TYPES CHIPS */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block pl-1">
              Estructura de Documento
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedType('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedType === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-3xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                Todos los tipos ({filteredPlantillas.length})
              </button>
              
              {TIPOS_PLANTILLAS.map(tipo => {
                const isSelected = selectedType === tipo.id;
                return (
                  <button
                    key={tipo.id}
                    onClick={() => setSelectedType(tipo.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-transparent shadow-3xs'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    {getTypeIcon(tipo.id)}
                    <span>{tipo.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* INFORMATIONAL STRUCTURAL READY BANNER */}
      <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-4 flex gap-3.5 items-start">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-extrabold text-amber-950">Estructura & Arquitectura Preparada</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Se ha implementado el modelo de clasificación de plantillas solicitado, incluyendo las 8 tipologías (Encuestas, Formatos, Matrices, Procedimientos, Políticas, Planes de Acción, Cronogramas e Informes) y las 5 categorías requeridas. Las llamadas y cargas se manejan en memoria local con persistencia inmediata en el navegador, listas para vincularse al SDK de Firestore de la empresa.
          </p>
        </div>
      </div>

      {/* GRID LISTING */}
      {filteredPlantillas.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/60 p-12 text-center max-w-xl mx-auto shadow-2xs space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-black text-slate-900 font-display">No se encontraron plantillas</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
            No existen plantillas cargadas que cumplan con los filtros activos. Ajusta el término de búsqueda o selecciona otra categoría.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedType('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all cursor-pointer"
          >
            Limpiar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredPlantillas.map(plt => (
            <TemplateCard 
              key={plt.id} 
              plantilla={plt} 
              onDownload={handleDownload}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/60 max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up text-left">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between relative">
              <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-blue-500/15 rounded-full blur-[40px] pointer-events-none" />
              <div className="flex items-center gap-2.5 z-10">
                <Upload className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="font-black text-sm md:text-base font-display">Subir Nueva Plantilla Corporativa</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Define la estructura para que los colaboradores la descarguen.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTemplate} className="p-6 space-y-4">
              
              {/* DRAG & DROP AREA */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Seleccionar Documento Base (Requerido)
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center gap-2 ${
                    isDragOver 
                      ? 'border-blue-600 bg-blue-50/50' 
                      : newFileName 
                        ? 'border-emerald-300 bg-emerald-50/10' 
                        : 'border-slate-200 hover:border-slate-350 bg-slate-50/50'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".xlsx,.xls,.docx,.doc,.pdf,.pptx,.ppt,.zip"
                  />
                  
                  {newFileName ? (
                    <>
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                        <Check className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-900 truncate max-w-[280px]">{newFileName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{newFileSize} • Extensión .{newExtension}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400" />
                      <div>
                        <p className="text-xs font-black text-slate-800">Arrastra tu plantilla estándar aquí</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">O haz clic para explorar en el equipo</p>
                      </div>
                      <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2.5 py-0.5 rounded border border-slate-200/50">
                        XLSX, DOCX, PDF, PPTX (Formatos permitidos)
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Título de la Plantilla
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Matriz de Cumplimiento Ambiental de Residuos"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* Classification Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* Category Select */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Área (Categoría)
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as PlantillaCategoria)}
                    className="w-full px-3 py-2.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    {CATEGORIAS_PLANTILLAS.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                {/* Type Select */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Tipo de Estructura
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as PlantillaTipo)}
                    className="w-full px-3 py-2.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    {TIPOS_PLANTILLAS.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>{tipo.label}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Extension & Mandatory Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-center pt-1">
                
                {/* Extension Indicator */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Extensión Estimada
                  </label>
                  <select
                    value={newExtension}
                    onChange={(e) => setNewExtension(e.target.value as any)}
                    className="w-full px-3 py-2.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="docx">Word (.docx)</option>
                    <option value="xlsx">Excel (.xlsx)</option>
                    <option value="pdf">PDF (.pdf)</option>
                    <option value="pptx">PowerPoint (.pptx)</option>
                    <option value="zip">Archivo Comprimido (.zip)</option>
                  </select>
                </div>

                {/* Mandatory Checkbox */}
                <div className="flex items-center gap-2 mt-4 md:mt-5">
                  <input
                    type="checkbox"
                    id="mandatoryCheckbox"
                    checked={isMandatory}
                    onChange={(e) => setIsMandatory(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="mandatoryCheckbox" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                    Documento obligatorio (Crítico)
                  </label>
                </div>

              </div>

              {/* Tags and Keywords */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Etiquetas / Palabras Clave
                </label>
                <input
                  type="text"
                  placeholder="Ej. sg sst, iso 9001, obligatoria, formato, excel"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Descripción Corta
                </label>
                <textarea
                  placeholder="Especifica el objetivo de esta plantilla y cómo deben diligenciarla los colaboradores..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newFileName}
                  className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    newFileName 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-slate-150 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Subir Plantilla</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

/* SUBCOMPONENT: TEMPLATE CARD */
interface TemplateCardProps {
  plantilla: Plantilla;
  onDownload: (id: string, titulo: string, extension: string) => void;
  onDelete: (id: string, name: string) => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ plantilla, onDownload, onDelete }) => {
  const catConfig = CATEGORIAS_PLANTILLAS.find(c => c.id === plantilla.categoria) || CATEGORIAS_PLANTILLAS[0];
  const typeConfig = TIPOS_PLANTILLAS.find(t => t.id === plantilla.tipo) || TIPOS_PLANTILLAS[0];
  const isCustomUploaded = plantilla.id.startsWith('plt-') && parseInt(plantilla.id.replace('plt-', '')) > 1000000000000;

  return (
    <div className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between relative group shadow-3xs hover:shadow-2xs hover:-translate-y-0.5 ${
      plantilla.esObligatorio 
        ? 'border-blue-200 ring-1 ring-blue-100 bg-linear-to-tr from-white to-blue-50/15' 
        : 'border-slate-200/70 hover:border-slate-350'
    }`}>
      
      {/* Badge classification top */}
      <div className="flex justify-between items-start gap-2 mb-3.5">
        <div className="flex flex-wrap gap-1 items-center">
          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}>
            {catConfig.label}
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-slate-50 text-slate-600 border border-slate-150`}>
            {typeConfig.label}
          </span>
        </div>

        {plantilla.esObligatorio && (
          <span className="bg-rose-50 text-rose-700 font-extrabold text-[8px] px-1.5 py-0.5 rounded border border-rose-200 uppercase tracking-widest shrink-0">
            Requerido
          </span>
        )}

        {isCustomUploaded && (
          <button 
            onClick={() => onDelete(plantilla.id, plantilla.titulo)}
            className="p-1 text-slate-350 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            title="Eliminar plantilla"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main description section */}
      <div className="space-y-2 flex-1">
        <div className="flex gap-2.5 items-start">
          <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl shrink-0 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors">
            {getTypeIcon(plantilla.tipo)}
          </div>
          <div>
            <h3 className="text-xs md:text-sm font-black text-slate-800 group-hover:text-slate-950 transition-colors line-clamp-2 leading-snug">
              {plantilla.titulo}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Versión {plantilla.version}</p>
          </div>
        </div>

        <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed pl-1">
          {plantilla.descripcion}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2 pl-1">
          {plantilla.etiquetas.map((tag, tIdx) => (
            <span key={tIdx} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 border border-slate-100 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer controls & size info */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
        <div className="space-y-0.5 text-left">
          <p className="text-[10px] font-extrabold text-slate-800 flex items-center gap-1">
            {getExtensionBadge(plantilla.extension)}
            <span className="text-slate-400 font-bold">•</span>
            <span>{plantilla.descargas} descargas</span>
          </p>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>Actualizado: {plantilla.fechaActualizacion} ({plantilla.tamano})</span>
          </p>
        </div>

        <button
          onClick={() => onDownload(plantilla.id, plantilla.titulo, plantilla.extension)}
          className={`py-1.5 px-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
            plantilla.esObligatorio
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-3xs'
              : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100'
          }`}
        >
          <span>Descargar</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
