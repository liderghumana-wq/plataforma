import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  Download,
  Tag,
  FileText,
  FileSpreadsheet,
  File,
  ExternalLink,
  Trash2,
  Filter,
  Layers,
  ShieldAlert,
  Users,
  Smile,
  HeartHandshake,
  Brain,
  Activity,
  Sparkles,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  Calendar,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import { Recurso, RecursoCategoria, RecursoTipo } from '../biblioteca.types';
import { CATEGORIAS_LIB, MOCK_RECURSOS } from '../data/mockRecursos';
import BibliotecaSgSstTab from './BibliotecaSgSstTab';

// Helper to match icons to file types
const getFileTypeIcon = (tipo: RecursoTipo) => {
  switch (tipo) {
    case 'pdf':
      return <FileText className="w-5 h-5 text-rose-500" />;
    case 'excel':
      return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    case 'word':
      return <FileText className="w-5 h-5 text-blue-500" />;
    case 'video':
      return <Activity className="w-5 h-5 text-purple-500" />;
    case 'imagen':
      return <Activity className="w-5 h-5 text-indigo-500" />;
    default:
      return <File className="w-5 h-5 text-slate-500" />;
  }
};

export default function BibliotecaInteligente() {
  const [activeMainTab, setActiveMainTab] = useState<'ciiu_library' | 'templates'>('ciiu_library');
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<RecursoCategoria | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<RecursoTipo | 'all'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New resource form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<RecursoCategoria>('sg_sst');
  const [newDescription, setNewDescription] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [newFileSize, setNewFileSize] = useState('');
  const [newFileType, setNewFileType] = useState<RecursoTipo>('pdf');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize from localStorage or mock
  useEffect(() => {
    const cached = localStorage.getItem('happy_insight_biblioteca_v1');
    if (cached) {
      try {
        setRecursos(JSON.parse(cached));
      } catch (e) {
        setRecursos(MOCK_RECURSOS);
      }
    } else {
      setRecursos(MOCK_RECURSOS);
    }
  }, []);

  // Save changes to localStorage
  const saveRecursos = (updated: Recurso[]) => {
    setRecursos(updated);
    localStorage.setItem('happy_insight_biblioteca_v1', JSON.stringify(updated));
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Handle mock download
  const handleDownload = (id: string, titulo: string, archivo: string) => {
    const updated = recursos.map(r => {
      if (r.id === id) {
        return { ...r, descargas: r.descargas + 1 };
      }
      return r;
    });
    saveRecursos(updated);
    showToast(`Descargando recurso: "${archivo}"`);

    // Simulate standard browser download triggers
    const dummyContent = `Happy Insight Library File Mock - ${titulo}`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = archivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle mock file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processSelectedFile(files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setNewFileName(file.name);
    // Format size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB < 0.1) {
      setNewFileSize(`${Math.round(file.size / 1024)} KB`);
    } else {
      setNewFileSize(`${sizeInMB.toFixed(1)} MB`);
    }

    // Guess type from extension
    const ext = file.name.split('.').pop()?.toLowerCase();
    let guessedType: RecursoTipo = 'pdf';
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      guessedType = 'excel';
    } else if (ext === 'docx' || ext === 'doc') {
      guessedType = 'word';
    } else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'svg') {
      guessedType = 'imagen';
    } else if (ext === 'mp4' || ext === 'mov' || ext === 'avi') {
      guessedType = 'video';
    } else {
      guessedType = 'pdf';
    }
    setNewFileType(guessedType);

    // Pre-fill Title with file name without extension
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    // Capitalize first letter and replace underscores/dashes
    const cleanTitle = baseName
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    setNewTitle(cleanTitle);
  };

  // Drag & Drop handlers
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
      processSelectedFile(files[0]);
    }
  };

  // Save new resource form
  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newFileName) {
      showToast('Por favor completa el título y selecciona un archivo');
      return;
    }

    const tagsArr = newTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newlyCreated: Recurso = {
      id: 'rec-' + Date.now(),
      titulo: newTitle.trim(),
      categoria: newCategory,
      descripcion: newDescription.trim() || 'Recurso guardado por el usuario.',
      tipo: newFileType,
      archivo: newFileName,
      archivoSize: newFileSize || '150 KB',
      etiquetas: tagsArr.length > 0 ? tagsArr : ['Documento Externo', 'Carga Local'],
      fechaCarga: new Date().toLocaleDateString(),
      descargas: 0
    };

    const updatedList = [newlyCreated, ...recursos];
    saveRecursos(updatedList);
    showToast(`Recurso "${newTitle}" cargado temporalmente con éxito.`);

    // Reset Form
    setNewTitle('');
    setNewCategory('sg_sst');
    setNewDescription('');
    setNewTags('');
    setNewFileName('');
    setNewFileSize('');
    setShowUploadModal(false);
  };

  const handleDeleteResource = (id: string, name: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el recurso "${name}" de la biblioteca?`)) {
      const updated = recursos.filter(r => r.id !== id);
      saveRecursos(updated);
      showToast('Recurso eliminado de la biblioteca.');
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('¿Deseas restaurar la biblioteca con los recursos de referencia por defecto?')) {
      saveRecursos(MOCK_RECURSOS);
      showToast('Biblioteca restablecida a valores por defecto.');
    }
  };

  // Filtering Logic
  const filteredRecursos = recursos.filter(recurso => {
    const matchesCategory = selectedCategory === 'all' || recurso.categoria === selectedCategory;
    const matchesType = selectedType === 'all' || recurso.tipo === selectedType;
    
    const query = searchQuery.toLowerCase();
    const matchesSearch = recurso.titulo.toLowerCase().includes(query) ||
      recurso.descripcion.toLowerCase().includes(query) ||
      recurso.etiquetas.some(tag => tag.toLowerCase().includes(query)) ||
      recurso.archivo.toLowerCase().includes(query);

    return matchesCategory && matchesType && matchesSearch;
  });

  const featuredRecursos = filteredRecursos.filter(r => r.esDestacado);
  const standardRecursos = filteredRecursos.filter(r => !r.esDestacado);

  return (
    <div className="space-y-6 animate-fade-in text-left pb-12">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-slate-800 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MODULE HEADER */}
      <div className="bg-white rounded-3xl border border-slate-200/60 p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-indigo-500/5 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shadow-3xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 font-display tracking-tight leading-none">
                  Biblioteca Inteligente
                </h1>
                <span className="bg-amber-50 text-amber-700 font-black text-[9px] px-2 py-0.5 rounded-md border border-amber-200 uppercase tracking-widest">
                  Gestor de Conocimiento
                </span>
              </div>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                Almacena, organiza y consulta recursos técnicos de SG-SST, Normatividad, ISO y Gestión Humana.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls (Only shown for templates tab) */}
        {activeMainTab === 'templates' && (
          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              onClick={handleResetToDefault}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Restaurar Valores</span>
            </button>
            
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Subir Recurso</span>
            </button>
          </div>
        )}
      </div>

      {/* MAIN MODULE TABS */}
      <div className="bg-slate-100/60 p-1.5 rounded-3xl border border-slate-200/50 flex gap-2">
        <button
          onClick={() => setActiveMainTab('ciiu_library')}
          className={`flex-1 py-3 text-xs font-black transition-all rounded-2xl flex items-center justify-center gap-2 cursor-pointer ${
            activeMainTab === 'ciiu_library'
              ? 'bg-white text-indigo-700 shadow-3xs border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Biblioteca de Relacionamiento CIIU (SG-SST)</span>
        </button>
        <button
          onClick={() => setActiveMainTab('templates')}
          className={`flex-1 py-3 text-xs font-black transition-all rounded-2xl flex items-center justify-center gap-2 cursor-pointer ${
            activeMainTab === 'templates'
              ? 'bg-white text-indigo-700 shadow-3xs border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Repositorio de Plantillas y Documentos</span>
        </button>
      </div>

      {/* CONDITIONALLY RENDER CONTENT */}
      {activeMainTab === 'ciiu_library' ? (
        <BibliotecaSgSstTab />
      ) : (
        <div className="space-y-6 animate-fade-in">
          {/* Filter and Search Bar */}
          <div className="bg-white rounded-3xl border border-slate-200/60 p-4 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por título, descripción, archivo o etiquetas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all"
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

            {/* Extra Filters */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5 self-center mr-2">
                <Filter className="w-3.5 h-3.5" />
                <span>Formato:</span>
              </span>
              
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as RecursoTipo | 'all')}
                className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="all">Todos los formatos</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="word">Word (.docx)</option>
                <option value="excel">Excel (.xlsx)</option>
                <option value="video">Video (.mp4)</option>
                <option value="imagen">Imagen (.png/jpg)</option>
              </select>
            </div>
          </div>

          {/* Category Horizontal Filter Buttons */}
          <div className="space-y-2 text-left">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest block pl-1">
              Filtrar por Categoría de Recursos ({filteredRecursos.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                Todas las categorías
              </button>
              
              {CATEGORIAS_LIB.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-transparent shadow-xs'
                        : `${cat.bg} ${cat.text} ${cat.border} hover:opacity-85`
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Informative Banner about Local Architecture */}
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-4 flex gap-3.5 items-start text-left">
            <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-indigo-950">Arquitectura de Biblioteca Preparada</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Este módulo define la interfaz gráfica y los esquemas de datos estructurados para el gestor documental del SG-SST. En la fase de producción, las cargas de documentos se conectarán con Google Cloud Storage para el almacenamiento seguro y persistente de PDFs, plantillas de Excel e informes corporativos.
              </p>
            </div>
          </div>

          {/* RENDER RESOURCES */}
          {filteredRecursos.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/60 p-12 text-center max-w-xl mx-auto shadow-2xs space-y-4">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-black text-slate-900 font-display">No se encontraron recursos</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                No encontramos ningún recurso que coincida con la categoría o filtros de búsqueda seleccionados. Intenta cambiar de categoría o limpiar los filtros.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedType('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all cursor-pointer"
              >
                Limpiar Filtros
              </button>
            </div>
          ) : (
            <div className="space-y-8 text-left">
              
              {/* SECTION 1: DESTACADOS / CRITICAL RESOURCES */}
              {featuredRecursos.length > 0 && (
                <div className="space-y-3.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-amber-500 fill-amber-500" />
                    <h2 className="text-xs uppercase font-black tracking-widest text-slate-900 font-display">
                      Recursos Destacados y Obligatorios ({featuredRecursos.length})
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredRecursos.map((rec) => (
                      <ResourceCard 
                        key={rec.id} 
                        recurso={rec} 
                        onDownload={handleDownload}
                        onDelete={handleDeleteResource}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: TODOS LOS DOCUMENTOS */}
              <div className="space-y-3.5">
                <h2 className="text-xs uppercase font-black tracking-widest text-slate-900 font-display pl-1">
                  Todos los recursos documentales ({standardRecursos.length})
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {standardRecursos.map((rec) => (
                    <ResourceCard 
                      key={rec.id} 
                      recurso={rec} 
                      onDownload={handleDownload}
                      onDelete={handleDeleteResource}
                    />
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/60 max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up text-left">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between relative">
              <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-indigo-500/15 rounded-full blur-[40px] pointer-events-none" />
              <div className="flex items-center gap-2.5 z-10">
                <Upload className="w-5.5 h-5.5 text-indigo-400" />
                <div>
                  <h3 className="font-black text-sm md:text-base font-display">Cargar Nuevo Recurso</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sube plantillas, resoluciones o manuales al sistema.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1.5 rounded-xl hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateResource} className="p-6 space-y-4">
              
              {/* FILE DRAG & DROP FIELD */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Seleccionar Archivo (Requerido)
                </label>
                
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center gap-2 ${
                    isDragOver 
                      ? 'border-indigo-600 bg-indigo-50/50' 
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
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.mp4"
                  />
                  
                  {newFileName ? (
                    <>
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                        {getFileTypeIcon(newFileType)}
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-900 truncate max-w-[280px]">{newFileName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{newFileSize} • Formato {newFileType.toUpperCase()}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400" />
                      <div>
                        <p className="text-xs font-black text-slate-800">Arrastra y suelta tu archivo aquí</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">O haz clic para explorar tus carpetas locales</p>
                      </div>
                      <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded border border-slate-200/50">
                        PDF, DOCX, XLSX, PNG, MP4 (Soportados)
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Title Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Título del Recurso
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Matriz de Peligros Locativos y Químicos 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* Grid 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Category Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Categoría
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as RecursoCategoria)}
                    className="w-full px-3 py-2.5 text-xs font-bold text-slate-700 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                  >
                    {CATEGORIAS_LIB.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Tags Field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Etiquetas
                  </label>
                  <input
                    type="text"
                    placeholder="Separadas por comas (Ej. sgsst, legal, eNPS)"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Description Field */}
              <div className="space-y-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  Descripción
                </label>
                <textarea
                  placeholder="Describe brevemente el contenido de este recurso o instructivo para guiar al equipo laboral..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              {/* Informative Note */}
              <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl p-3 flex gap-2 items-start text-[10px] leading-relaxed font-semibold">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  Los archivos subidos se procesan localmente y se almacenan temporalmente en tu navegador. El almacenamiento en la nube se habilitará en la etapa de despliegue productivo.
                </span>
              </div>

              {/* Modal Actions */}
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
                      ? 'bg-indigo-600 hover:bg-indigo-700' 
                      : 'bg-slate-150 text-slate-450 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>Cargar Recurso</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

/* SUBCOMPONENT: RESOURCE CARD */
interface ResourceCardProps {
  recurso: Recurso;
  onDownload: (id: string, titulo: string, archivo: string) => void;
  onDelete: (id: string, name: string) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ recurso, onDownload, onDelete }) => {
  const catConfig = CATEGORIAS_LIB.find(c => c.id === recurso.categoria) || CATEGORIAS_LIB[0];
  const isCustomUploaded = recurso.id.startsWith('rec-') && parseInt(recurso.id.replace('rec-', '')) > 1000000000000;

  return (
    <div className={`bg-white rounded-3xl border transition-all p-5 flex flex-col justify-between relative group shadow-2xs hover:shadow-xs hover:-translate-y-0.5 ${
      recurso.esDestacado 
        ? 'border-indigo-200 ring-1 ring-indigo-100 bg-linear-to-tr from-white to-indigo-50/15' 
        : 'border-slate-200/70 hover:border-slate-350'
    }`}>
      
      {/* Category header */}
      <div className="flex justify-between items-start gap-2 mb-3">
        <span className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider border ${catConfig.bg} ${catConfig.text} ${catConfig.border}`}>
          {catConfig.label}
        </span>
        
        {recurso.esDestacado && (
          <span className="bg-amber-50 text-amber-700 font-extrabold text-[8px] px-2 py-0.5 rounded border border-amber-200 uppercase tracking-widest flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            <span>Crítico</span>
          </span>
        )}

        {isCustomUploaded && (
          <button 
            onClick={() => onDelete(recurso.id, recurso.titulo)}
            className="p-1 text-slate-350 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer opacity-0 group-hover:opacity-100"
            title="Eliminar de la biblioteca"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Title & Description */}
      <div className="space-y-2 flex-1">
        <div className="flex gap-2.5 items-start">
          <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl shrink-0 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
            {getFileTypeIcon(recurso.tipo)}
          </div>
          <h3 className="text-xs md:text-sm font-black text-slate-800 group-hover:text-slate-950 transition-colors line-clamp-2 leading-snug">
            {recurso.titulo}
          </h3>
        </div>

        <p className="text-xs text-slate-500 font-medium line-clamp-3 leading-relaxed pl-1">
          {recurso.descripcion}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2 pl-1">
          {recurso.etiquetas.map((tag, tIdx) => (
            <span key={tIdx} className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 border border-slate-100 rounded">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Footer metadata & action */}
      <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-2 shrink-0">
        <div className="space-y-0.5 text-left">
          <p className="text-[10px] font-extrabold text-slate-800 flex items-center gap-1">
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>{recurso.descargas} descargas</span>
          </p>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-400" />
            <span>{recurso.fechaCarga} • {recurso.archivoSize || '120 KB'}</span>
          </p>
        </div>

        <button
          onClick={() => onDownload(recurso.id, recurso.titulo, recurso.archivo)}
          className={`py-1.5 px-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
            recurso.esDestacado
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-3xs'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100'
          }`}
        >
          <span>Descargar</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
