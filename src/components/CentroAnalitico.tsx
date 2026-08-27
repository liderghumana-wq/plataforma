import React, { useState, useMemo } from 'react';
import { 
  Search,
  SlidersHorizontal,
  ChevronRight,
  ClipboardList,
  Sparkles,
  Layers,
  ArrowUpRight,
  Info,
  CheckCircle2,
  Lock,
  PlusCircle,
  HelpCircle,
  TrendingUp,
  Brain,
  Grid
} from 'lucide-react';
import { ANALITICO_MODULES_INITIAL, AnaliticoModule, iconMap } from '../data/centroAnaliticoConfig';

interface CentroAnaliticoProps {
  onNavigate: (tab: string) => void;
  uploadedFile: { name: string; size: string; date: string } | null;
}

export default function CentroAnalitico({ onNavigate, uploadedFile }: CentroAnaliticoProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedStatus, setSelectedStatus] = useState<string>('Todas');
  const [showInfoModal, setShowInfoModal] = useState<string | null>(null);

  // Filter logic
  const filteredModules = useMemo(() => {
    return ANALITICO_MODULES_INITIAL.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
      const matchesStatus = selectedStatus === 'Todas' || item.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  const categories = ['Todas', 'SG-SST', 'Clima y Bienestar', 'Talento Humano', 'Analítica Avanzada'];
  const statuses = ['Todas', 'Disponible', 'Próximamente', 'En Desarrollo'];

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'Disponible':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'En Desarrollo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'Próximamente':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'SG-SST':
        return 'text-rose-600 bg-rose-50';
      case 'Clima y Bienestar':
        return 'text-cyan-600 bg-cyan-50';
      case 'Talento Humano':
        return 'text-amber-600 bg-amber-50';
      case 'Analítica Avanzada':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const handleActionClick = (item: AnaliticoModule) => {
    if (item.status === 'Disponible') {
      onNavigate(item.tabLink);
    } else {
      setShowInfoModal(item.id);
    }
  };

  const currentSelectedModalItem = useMemo(() => {
    return ANALITICO_MODULES_INITIAL.find(item => item.id === showInfoModal) || null;
  }, [showInfoModal]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in py-2">
      
      {/* Centro Inteligente Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 rounded-3xl border border-indigo-950/40 shadow-xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-[45%] h-full bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-200 border border-indigo-400/20 shadow-sm">
            <ClipboardList className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
            <span>Centro Inteligente de Analítica Organizacional</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-black font-display tracking-tight leading-none text-white">
            Centro Analítico
          </h1>
          
          <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-3xl">
            Bienvenido al panel central de mediciones y analítica predictiva. Este módulo interactivo sirve como el punto de entrada unificado para todas las evaluaciones organizacionales, permitiendo evaluar el clima, los riesgos, la capacitación y el bienestar del personal.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-xs flex flex-col lg:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar módulo de evaluación..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-xs font-semibold rounded-xl border border-slate-250 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-col md:flex-row gap-4 w-full justify-end items-stretch md:items-center">
          
          {/* Category Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Categoría:</span>
            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                    selectedCategory === cat 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="h-4 w-px bg-slate-250 hidden md:block" />

          {/* Status Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Estado:</span>
            <div className="flex gap-1">
              {statuses.map((stat) => (
                <button
                  key={stat}
                  onClick={() => setSelectedStatus(stat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer border ${
                    selectedStatus === stat 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {stat === 'Todas' ? 'Estados' : stat}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Grid containing dynamic cards */}
      {filteredModules.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((item) => {
            const IconComponent = iconMap[item.iconName] || Grid;
            const isAvailable = item.status === 'Disponible';
            const catColor = getCategoryColor(item.category);

            return (
              <div 
                key={item.id}
                className="bg-white border border-slate-200/60 hover:border-indigo-200 rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between group shadow-2xs hover:shadow-md text-left"
              >
                <div className="space-y-4">
                  
                  {/* Card Header (Category + Status Badge) */}
                  <div className="flex justify-between items-start">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${catColor}`}>
                      {item.category}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${getStatusBadgeStyles(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-start gap-3.5">
                    <div className={`p-3 rounded-2xl transition-all duration-300 ${
                      isAvailable 
                        ? 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white' 
                        : item.status === 'En Desarrollo'
                          ? 'bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white'
                          : 'bg-slate-100 text-slate-400'
                    }`}>
                      <IconComponent className="w-5.5 h-5.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 font-display leading-tight group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5 uppercase tracking-wider">{item.category}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    {item.description}
                  </p>

                </div>

                {/* Footer action button */}
                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono font-bold">Módulo Desacoplado</span>
                  
                  <button
                    onClick={() => handleActionClick(item)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isAvailable
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md'
                        : item.status === 'En Desarrollo'
                          ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 border border-slate-200'
                    }`}
                  >
                    <span>Ingresar</span>
                    {isAvailable ? (
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 p-12 rounded-3xl text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 text-sm">No se encontraron módulos</h3>
            <p className="text-xs text-slate-500 font-semibold">Pruebe ajustando los filtros o la palabra clave en su búsqueda.</p>
          </div>
          <button 
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Todas');
              setSelectedStatus('Todas');
            }}
            className="px-4 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100/50 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Restablecer Filtros
          </button>
        </div>
      )}

      {/* Info Modal for Coming Soon/Development states */}
      {showInfoModal && currentSelectedModalItem && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in no-print">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up text-left">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-500/20 text-indigo-300 rounded-lg">
                  <Info className="w-4.5 h-4.5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm font-display">Estructura del Módulo</h3>
                  <p className="text-[9px] text-slate-300 uppercase tracking-widest font-black">{currentSelectedModalItem.category}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInfoModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-800 text-sm">{currentSelectedModalItem.name}</h4>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  {currentSelectedModalItem.description}
                </p>
              </div>

              {/* Status information card */}
              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-indigo-950 text-xs font-black">
                  <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>Estado: {currentSelectedModalItem.status}</span>
                </div>
                
                <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
                  La arquitectura y diseño estructural del módulo de **{currentSelectedModalItem.name}** ya se encuentran totalmente preparados para la expansión analítica de **People Insight IA**. Las interfaces gráficas interactivas se habilitarán en una fase posterior sin alterar la compatibilidad del sistema.
                </p>
              </div>

              <div className="flex gap-2 text-[10px] text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                <span>Estructura de tarjetas desacoplada y escalable completada con éxito.</span>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
              <button 
                onClick={() => setShowInfoModal(null)}
                className="px-4 py-2 bg-slate-250 hover:bg-slate-300 text-slate-800 text-xs font-extrabold rounded-lg transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
