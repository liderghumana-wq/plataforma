import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Cpu,
  Shield,
  Stethoscope,
  GraduationCap,
  HardHat,
  Truck,
  Sprout,
  Activity,
  AlertCircle,
  FileText,
  Briefcase,
  Layers,
  Scale,
  Calendar,
  Sparkles,
  ClipboardList,
  Edit2,
  Plus,
  Trash2,
  CheckCircle2,
  Check,
  RotateCcw,
  Clock,
  ChevronRight,
  TrendingUp,
  Info
} from 'lucide-react';
import { useEmpresa } from '../../configuracion/useEmpresa';
import {
  BIBLIOTECA_CIIU_SG_SST,
  SgSstCiiuRelation,
  SgSstNorma,
  SgSstPeligro,
  SgSstCapacitacion,
  SgSstIndicador,
  SgSstPrograma
} from '../data/ciiuLibrarySgSst';

export default function BibliotecaSgSstTab() {
  const { config } = useEmpresa();
  const userCiiu = config?.codigoCIIU || '';
  
  // Local state for the CIIU Database to allow dynamic additions/updates
  const [database, setDatabase] = useState<SgSstCiiuRelation[]>([]);
  const [selectedCiiu, setSelectedCiiu] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubSection, setActiveSubSection] = useState<'general' | 'peligros' | 'programas' | 'indicadores' | 'capacitaciones' | 'legal'>('general');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Legal Matrix Editing State
  const [showEditNormsModal, setShowEditNormsModal] = useState(false);
  const [tempNorms, setTempNorms] = useState<SgSstNorma[]>([]);
  const [newNormName, setNewNormName] = useState('');
  const [newNormDesc, setNewNormDesc] = useState('');
  const [newNormEntidad, setNewNormEntidad] = useState('');
  const [newNormArticulo, setNewNormArticulo] = useState('');

  // Search Results
  const [filteredCiiu, setFilteredCiiu] = useState<SgSstCiiuRelation[]>([]);

  // Initialize from cache or default database
  useEffect(() => {
    const cached = localStorage.getItem('happy_insight_ciiu_library_v1');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setDatabase(parsed);
      } catch (e) {
        setDatabase(BIBLIOTECA_CIIU_SG_SST);
      }
    } else {
      setDatabase(BIBLIOTECA_CIIU_SG_SST);
      localStorage.setItem('happy_insight_ciiu_library_v1', JSON.stringify(BIBLIOTECA_CIIU_SG_SST));
    }
  }, []);

  // Filter list when query changes
  useEffect(() => {
    if (!database || database.length === 0) return;
    
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredCiiu(database);
      return;
    }

    const filtered = database.filter(item => 
      item.codigo.includes(query) ||
      item.nombreOficial.toLowerCase().includes(query) ||
      item.sectorEconomico.toLowerCase().includes(query) ||
      item.riesgosPrioritarios.some(r => r.toLowerCase().includes(query)) ||
      item.descripcion.toLowerCase().includes(query)
    );
    setFilteredCiiu(filtered);
  }, [searchQuery, database]);

  // Set initial selected CIIU based on company config
  useEffect(() => {
    if (database.length > 0) {
      const match = database.find(item => item.codigo === userCiiu);
      if (match) {
        setSelectedCiiu(match.codigo);
      } else {
        setSelectedCiiu(database[0].codigo);
      }
    }
  }, [userCiiu, database]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getCiiuIcon = (code: string) => {
    switch (code) {
      case '8220': return <Cpu className="w-5 h-5 text-indigo-600" />;
      case '6201': return <Cpu className="w-5 h-5 text-sky-600" />;
      case '8544': return <GraduationCap className="w-5 h-5 text-amber-600" />;
      case '8610': return <Stethoscope className="w-5 h-5 text-rose-600" />;
      case '4111': return <HardHat className="w-5 h-5 text-emerald-600" />;
      case '4923': return <Truck className="w-5 h-5 text-violet-600" />;
      case '1011': return <Activity className="w-5 h-5 text-orange-600" />;
      case '8010': return <Shield className="w-5 h-5 text-indigo-700" />;
      case '0111': return <Sprout className="w-5 h-5 text-teal-600" />;
      default: return <Briefcase className="w-5 h-5 text-slate-500" />;
    }
  };

  const activeData = database.find(item => item.codigo === selectedCiiu) || database[0];

  // Open Edit Norms modal
  const handleOpenNormsEditor = () => {
    if (activeData) {
      setTempNorms([...activeData.normatividad]);
      setNewNormName('');
      setNewNormDesc('');
      setNewNormEntidad('');
      setNewNormArticulo('');
      setShowEditNormsModal(true);
    }
  };

  // Add norm locally in modal
  const handleAddNormToTemp = () => {
    if (!newNormName.trim() || !newNormDesc.trim()) {
      showToast('Por favor completa los campos de la norma.');
      return;
    }
    const newNorm: SgSstNorma = {
      norma: newNormName.trim(),
      descripcion: newNormDesc.trim(),
      entidad: newNormEntidad.trim() || 'Colombia',
      articuloClave: newNormArticulo.trim() || 'General'
    };
    setTempNorms([...tempNorms, newNorm]);
    setNewNormName('');
    setNewNormDesc('');
    setNewNormEntidad('');
    setNewNormArticulo('');
    showToast('Norma agregada temporalmente.');
  };

  // Delete norm locally in modal
  const handleDeleteNormFromTemp = (index: number) => {
    const updated = tempNorms.filter((_, idx) => idx !== index);
    setTempNorms(updated);
  };

  // Save norms to the global cached database
  const handleSaveNormsToDatabase = () => {
    if (!activeData) return;

    const updatedDatabase = database.map(item => {
      if (item.codigo === activeData.codigo) {
        return {
          ...item,
          normatividad: tempNorms
        };
      }
      return item;
    });

    setDatabase(updatedDatabase);
    localStorage.setItem('happy_insight_ciiu_library_v1', JSON.stringify(updatedDatabase));
    setShowEditNormsModal(false);
    showToast(`Matriz legal para CIIU ${activeData.codigo} actualizada con éxito.`);
  };

  // Reset to original database
  const handleResetToDefault = () => {
    if (window.confirm('¿Deseas restaurar la base de relacionamiento de la biblioteca a su estado de fábrica?')) {
      setDatabase(BIBLIOTECA_CIIU_SG_SST);
      localStorage.setItem('happy_insight_ciiu_library_v1', JSON.stringify(BIBLIOTECA_CIIU_SG_SST));
      showToast('Biblioteca restablecida a valores originales.');
    }
  };

  return (
    <div className="space-y-6 text-left pb-12 animate-fade-in">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-slate-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-bounce" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* BANNER DE EXPLICACIÓN METODOLÓGICA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl border border-slate-800 p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[45%] h-[120%] bg-indigo-500/10 rounded-full blur-[65px] pointer-events-none" />
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/25 text-indigo-300 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Garantía de Conformidad Legal Colombiana</span>
            </span>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight leading-none text-slate-50">
              Biblioteca de Parametrización Inteligente SG-SST
            </h2>
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              Este módulo relaciona de forma automatizada los códigos de la Clasificación Industrial Internacional Uniforme (<strong className="text-white">CIIU</strong>) de Colombia, con sus respectivos niveles de riesgo ARL, riesgos sectoriales priorizados, programas de epidemiología recomendados, peligros de la <strong className="text-white">GTC 45</strong>, planes de formación y marco legal actualizado.
            </p>
          </div>
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-slate-100 hover:text-white border border-white/15 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start lg:self-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar de Fábrica</span>
          </button>
        </div>
      </div>

      {/* BENTO GRID DE LA BIBLIOTECA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* PANEL IZQUIERDO: SELECTOR DE ACTIVIDAD */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/60 p-4 shadow-2xs space-y-4">
          <div className="space-y-1.5">
            <h3 className="text-xs uppercase font-black text-slate-400 tracking-wider pl-1">
              Buscar Actividad Económica
            </h3>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Escribe CIIU, Sector o Actividad..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs font-semibold text-slate-700 placeholder-slate-400 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                Sectores Disponibles ({filteredCiiu.length})
              </span>
              {userCiiu && (
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded border border-indigo-150">
                  CIIU Empresa: {userCiiu}
                </span>
              )}
            </div>

            {/* List of Activities */}
            <div className="space-y-2 overflow-y-auto max-h-[480px] pr-1 scrollbar-thin">
              {filteredCiiu.map((item) => {
                const isSelected = selectedCiiu === item.codigo;
                const isCompanyCiiu = item.codigo === userCiiu;
                
                return (
                  <button
                    key={item.codigo}
                    onClick={() => {
                      setSelectedCiiu(item.codigo);
                      setActiveSubSection('general');
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative flex gap-3 ${
                      isSelected
                        ? 'bg-indigo-600/5 border-indigo-300 ring-1 ring-indigo-300/30'
                        : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200/70 hover:border-slate-300'
                    }`}
                  >
                    {isCompanyCiiu && (
                      <span className="absolute top-1 right-2 bg-indigo-100 text-indigo-800 text-[8px] font-black uppercase tracking-widest px-1 py-0.2 rounded-md">
                        Mi Empresa
                      </span>
                    )}

                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/50 flex items-center justify-center shadow-3xs shrink-0 self-center">
                      {getCiiuIcon(item.codigo)}
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-800">CIIU {item.codigo}</span>
                        <span className={`px-1.5 py-0.1 rounded text-[8px] font-black border ${
                          item.claseRiesgo === 'V' ? 'bg-red-50 text-red-700 border-red-100' :
                          item.claseRiesgo === 'IV' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          item.claseRiesgo === 'III' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          Riesgo {item.claseRiesgo}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-600 truncate leading-snug">
                        {item.nombreOficial}
                      </p>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider">
                        {item.sectorEconomico}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: INTERACTIVE EXPLORER */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/60 p-6 shadow-2xs space-y-6">
          {activeData ? (
            <>
              {/* Explorer Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                      CIIU {activeData.codigo}
                    </span>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-slate-200">
                      Sector {activeData.sectorEconomico}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      activeData.claseRiesgo === 'V' ? 'bg-red-50 text-red-700 border-red-100 animate-pulse' :
                      activeData.claseRiesgo === 'IV' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      activeData.claseRiesgo === 'III' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                      'bg-slate-150 text-slate-700 border-slate-200'
                    }`}>
                      Clase de Riesgo {activeData.claseRiesgo} ARL
                    </span>
                  </div>
                  <h2 className="text-base font-black font-display text-slate-900 leading-snug">
                    {activeData.nombreOficial}
                  </h2>
                </div>
              </div>

              {/* Sub-Tabs Selector inside the Active Explorer */}
              <div className="bg-slate-50 p-1.5 rounded-2xl border border-slate-150 flex flex-wrap gap-1">
                {[
                  { id: 'general', label: 'Resumen' },
                  { id: 'peligros', label: 'Peligros GTC 45' },
                  { id: 'programas', label: 'Programas SVE' },
                  { id: 'indicadores', label: 'Indicadores' },
                  { id: 'capacitaciones', label: 'Capacitaciones' },
                  { id: 'legal', label: 'Matriz Legal' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubSection(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      activeSubSection === tab.id
                        ? 'bg-white text-indigo-700 shadow-3xs border border-slate-200/50'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SECTION CONTENTS */}
              <div className="space-y-6 pt-2 min-h-[350px]">
                
                {/* 1. GENERAL / RESUMEN */}
                {activeSubSection === 'general' && (
                  <div className="space-y-6 animate-fade-in text-left">
                    <div className="space-y-2">
                      <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider pl-1">
                        Descripción Oficial de la Actividad
                      </h4>
                      <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-2xl text-xs text-slate-600 leading-relaxed font-semibold">
                        {activeData.descripcion}
                      </div>
                    </div>

                    <div className="space-y-3.5">
                      <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider pl-1">
                        Riesgos Laborales Prioritarios Asociados
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeData.riesgosPrioritarios.map((riesgo, index) => (
                          <div
                            key={index}
                            className="bg-white border border-slate-150/70 p-3 rounded-2xl flex gap-3 shadow-3xs"
                          >
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                              <AlertCircle className="w-4 h-4 text-indigo-600" />
                            </div>
                            <div className="space-y-0.5 self-center">
                              <p className="text-xs font-black text-slate-800 leading-tight">
                                {riesgo.split('(')[0].trim()}
                              </p>
                              {riesgo.includes('(') && (
                                <p className="text-[10px] text-slate-500 font-semibold leading-snug">
                                  {riesgo.substring(riesgo.indexOf('(') + 1, riesgo.indexOf(')'))}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Info Note */}
                    <div className="bg-amber-50/50 border border-amber-100/70 rounded-2xl p-4 flex gap-3 text-amber-900 text-xs font-semibold leading-relaxed">
                      <Info className="w-5 h-5 text-amber-500 shrink-0" />
                      <span>
                        El motor de Inteligencia Artificial lee automáticamente esta parametrización según el CIIU de su empresa para personalizar todos los diagnósticos, hallazgos y planes de acción preventivos generados en la consola.
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. PELIGROS GTC 45 */}
                {activeSubSection === 'peligros' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider pl-1">
                        Peligros Representativos (Guía GTC 45)
                      </h4>
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-black px-2 py-0.5 rounded border border-slate-200">
                        Total Mapeados: {activeData.peligrosGtc45.length}
                      </span>
                    </div>

                    <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-3xs">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-wider border-b border-slate-100">
                              <th className="py-3 px-4">Descripción del Peligro</th>
                              <th className="py-3 px-4">Clasificación GTC 45</th>
                              <th className="py-3 px-4 text-center">Prioridad</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {activeData.peligrosGtc45.map((p, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/40">
                                <td className="py-3 px-4 text-slate-900">{p.descripcion}</td>
                                <td className="py-3 px-4">
                                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200 text-[10px]">
                                    {p.clasificacion}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                    p.prioridad === 'Alta' ? 'bg-red-50 text-red-700 border border-red-100' :
                                    p.prioridad === 'Media' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                    'bg-slate-100 text-slate-600 border border-slate-200'
                                  }`}>
                                    {p.prioridad}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. PROGRAMAS SUGERIDOS */}
                {activeSubSection === 'programas' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider pl-1">
                      Programas de Vigilancia Epidemiológica Recomendados (SVE)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeData.programasSugeridos.map((prog, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-150 rounded-2xl p-4 space-y-2 hover:shadow-xs transition-shadow relative"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <h5 className="font-black text-xs text-indigo-950">{prog.nombre}</h5>
                            <span className="bg-indigo-50 text-indigo-700 font-black text-[9px] px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wide">
                              Sugerido
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                            {prog.desc}
                          </p>
                          <div className="pt-2 border-t border-slate-50 text-[10px] font-extrabold text-slate-700 flex gap-1.5 items-center">
                            <span className="text-indigo-600 uppercase tracking-widest text-[8px]">Foco:</span>
                            <span className="text-slate-600">{prog.foco}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. INDICADORES RECOMENDADOS */}
                {activeSubSection === 'indicadores' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider pl-1">
                      Ficha Técnica de Indicadores Sugeridos para el Sector
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeData.indicadoresRecomendados.map((ind, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-150 rounded-2xl p-4 flex flex-col justify-between shadow-3xs"
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-black text-slate-800">{ind.nombre}</span>
                              <span className="bg-emerald-50 text-emerald-700 font-black text-[9px] px-2 py-0.5 rounded border border-emerald-150 uppercase">
                                Meta: {ind.meta}
                              </span>
                            </div>
                            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block mb-0.5">Fórmula:</span>
                              <p className="text-[10px] font-mono text-slate-600 leading-normal">{ind.formula}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center text-[10px] font-extrabold text-slate-500">
                            <span>Medición: {ind.frecuencia}</span>
                            <span className="text-slate-400 text-[9px]">SG-SST Decreto 1072</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. CAPACITACIONES */}
                {activeSubSection === 'capacitaciones' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider pl-1">
                      Plan y Temas de Formación OHS Recomendados
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeData.capacitacionesRecomendadas.map((cap, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-150 rounded-2xl p-3.5 flex gap-3 shadow-3xs"
                        >
                          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 self-start">
                            <Calendar className="w-4 h-4 text-amber-700" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between items-center gap-2">
                              <h5 className="font-black text-xs text-slate-800 leading-tight">{cap.tema}</h5>
                            </div>
                            <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                              {cap.desc}
                            </p>
                            <span className="inline-block text-[9px] font-black text-amber-700 bg-amber-50/50 border border-amber-100 px-1.5 py-0.2 rounded mt-1.5 uppercase tracking-wide">
                              Frecuencia: {cap.frecuencia}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 6. MATRIZ LEGAL / NORMATIVIDAD */}
                {activeSubSection === 'legal' && (
                  <div className="space-y-4 animate-fade-in text-left">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="space-y-0.5">
                        <h4 className="text-xs uppercase font-black text-slate-400 tracking-wider pl-1">
                          Normatividad Colombiana Aplicable
                        </h4>
                        <p className="text-[11px] text-slate-500 font-semibold">Regulaciones nacionales específicas que rigen esta actividad económica.</p>
                      </div>
                      <button
                        onClick={handleOpenNormsEditor}
                        className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 hover:text-indigo-800 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 self-start sm:self-center shadow-3xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Actualizar Normativa</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">
                      {activeData.normatividad.map((norm, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-slate-150 rounded-2xl p-4 space-y-2 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <span className="font-black text-xs text-indigo-950 flex items-center gap-1.5">
                              <Scale className="w-4 h-4 text-indigo-600" />
                              <span>{norm.norma}</span>
                            </span>
                            <span className="bg-slate-100 text-slate-500 font-extrabold text-[9px] px-2 py-0.5 rounded border border-slate-200 uppercase">
                              {norm.entidad}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                            {norm.descripcion}
                          </p>
                          <div className="pt-2 border-t border-slate-100 text-[10px] font-extrabold text-slate-700 flex flex-wrap gap-1 items-center">
                            <span className="text-indigo-600 uppercase tracking-widest text-[8px]">Artículo Crítico de Ley:</span>
                            <span className="text-slate-800">{norm.articuloClave}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
              <AlertCircle className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-xs font-bold">Selecciona una actividad económica en la lista para explorar.</p>
            </div>
          )}
        </div>

      </div>

      {/* DYNAMIC LAW UPDATER MODAL */}
      {showEditNormsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200/60 max-w-2xl w-full overflow-hidden shadow-2xl animate-scale-up text-left">
            
            {/* Modal Header */}
            <div className="bg-slate-950 text-white p-5 flex items-center justify-between relative">
              <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-indigo-500/15 rounded-full blur-[40px] pointer-events-none" />
              <div className="flex items-center gap-2.5 z-10">
                <Scale className="w-5.5 h-5.5 text-indigo-400" />
                <div>
                  <h3 className="font-black text-sm md:text-base font-display">Editor de Normatividad Colombiana</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">CIIU {activeData?.codigo} — {activeData?.nombreOficial.substring(0, 45)}...</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              
              {/* Add New Norm Form */}
              <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl space-y-3">
                <span className="text-[9px] uppercase font-black text-indigo-700 tracking-widest block">
                  Registrar / Añadir Nueva Norma de Ley
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Norma (Nombre Corto)</label>
                    <input
                      type="text"
                      placeholder="Ej. Circular 082 de 2026"
                      value={newNormName}
                      onChange={(e) => setNewNormName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Ente Regulador / Entidad</label>
                    <input
                      type="text"
                      placeholder="Ej. Ministerio de Trabajo"
                      value={newNormEntidad}
                      onChange={(e) => setNewNormEntidad(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Descripción o Resumen OHS</label>
                  <input
                    type="text"
                    placeholder="Ej. Actualiza los parámetros obligatorios de salud mental intralaboral..."
                    value={newNormDesc}
                    onChange={(e) => setNewNormDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-9 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Artículo Clave de Aplicación Directa</label>
                    <input
                      type="text"
                      placeholder="Ej. Artículo 3 (Obligaciones específicas del empleador)"
                      value={newNormArticulo}
                      onChange={(e) => setNewNormArticulo(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <button
                      type="button"
                      onClick={handleAddNormToTemp}
                      className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-1 shadow-xs transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* List of current normatividad */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block pl-1">
                  Listado de Normas de la Matriz ({tempNorms.length})
                </span>

                <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                  {tempNorms.length === 0 ? (
                    <p className="text-center text-xs text-slate-400 font-semibold py-4">No hay normas registradas en este código.</p>
                  ) : (
                    tempNorms.map((n, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 p-3 rounded-xl flex justify-between items-center gap-3 shadow-3xs hover:border-slate-350 transition-colors"
                      >
                        <div className="space-y-1 text-left">
                          <p className="text-xs font-black text-indigo-950">{n.norma} — <span className="text-[10px] text-slate-500 font-bold uppercase">{n.entidad}</span></p>
                          <p className="text-[10px] text-slate-600 font-semibold leading-relaxed truncate max-w-[420px]">{n.descripcion}</p>
                          <p className="text-[9px] font-extrabold text-slate-500"><strong className="text-indigo-600 uppercase text-[8px]">Artículo:</strong> {n.articuloClave}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteNormFromTemp(idx)}
                          className="p-1.5 text-slate-450 hover:text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                          title="Eliminar de la matriz"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditNormsModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Descartar Cambios
                </button>
                <button
                  type="button"
                  onClick={handleSaveNormsToDatabase}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Matriz de Ley</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
