import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Search, Plus, Trash2, Sliders, RotateCcw, AlertCircle, FileText, CheckCircle2, 
  AlertTriangle, ShieldAlert, Layers, Users, Shield, Database, Activity, RefreshCw, 
  PlusCircle, Bookmark, Copy, ClipboardCheck, ArrowUpRight, Check, Edit3, Heart, 
  Brain, Flame, Accessibility, FileCheck, Scale, X, Info, BookOpen
} from 'lucide-react';
import { RegulatoryNorm, RelevantArticle } from '../types';
import { ComplianceStore } from '../services/complianceStore';

export default function ComplianceCenter() {
  const [norms, setNorms] = useState<RegulatoryNorm[]>(() => ComplianceStore.getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [selectedNorm, setSelectedNorm] = useState<RegulatoryNorm | null>(null);
  
  // UI States for Create/Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [normName, setNormName] = useState('');
  const [normNumber, setNormNumber] = useState('');
  const [normYear, setNormYear] = useState(new Date().getFullYear());
  const [normCategory, setNormCategory] = useState('SG-SST');
  const [normDescription, setNormDescription] = useState('');
  const [articlesList, setArticlesList] = useState<RelevantArticle[]>([{ articleNumber: '', title: '', description: '' }]);
  const [obligationsText, setObligationsText] = useState('');
  const [evidencesText, setEvidencesText] = useState('');
  const [documentsText, setDocumentsText] = useState('');
  const [responsible, setResponsible] = useState('');

  // AI Auditor Simulation State
  const [auditedCategory, setAuditedCategory] = useState('SG-SST');
  const [auditResult, setAuditResult] = useState<{
    score: number;
    findings: string[];
    pendingEvidences: string[];
    riskLevel: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  } | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Categories list
  const categories = [
    'SG-SST',
    'Capital Humano',
    'Bienestar',
    'Riesgo Psicosocial',
    'Ergonomía',
    'Emergencias',
    'COPASST',
    'Comité de Convivencia',
    'Auditorías'
  ];

  // Map categories to visual helper badges
  const getCategoryTheme = (cat: string) => {
    switch (cat) {
      case 'SG-SST':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Shield, color: 'text-emerald-500' };
      case 'Capital Humano':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: Users, color: 'text-blue-500' };
      case 'Bienestar':
        return { bg: 'bg-pink-50 text-pink-700 border-pink-200', icon: Heart, color: 'text-pink-500' };
      case 'Riesgo Psicosocial':
        return { bg: 'bg-purple-50 text-purple-700 border-purple-200', icon: Brain, color: 'text-purple-500' };
      case 'Ergonomía':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Accessibility, color: 'text-amber-500' };
      case 'Emergencias':
        return { bg: 'bg-red-50 text-red-700 border-red-200', icon: Flame, color: 'text-red-500' };
      case 'COPASST':
        return { bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: FileText, color: 'text-cyan-500' };
      case 'Comité de Convivencia':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: Users, color: 'text-indigo-500' };
      case 'Auditorías':
        return { bg: 'bg-slate-100 text-slate-800 border-slate-300', icon: ClipboardCheck, color: 'text-slate-600' };
      default:
        return { bg: 'bg-gray-50 text-gray-700 border-gray-200', icon: Scale, color: 'text-gray-500' };
    }
  };

  // Filtered norms
  const filteredNorms = useMemo(() => {
    return norms.filter(norm => {
      const matchesCategory = selectedCategory === 'TODAS' || norm.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        norm.name.toLowerCase().includes(q) ||
        norm.number.toLowerCase().includes(q) ||
        norm.description.toLowerCase().includes(q) ||
        norm.category.toLowerCase().includes(q) ||
        norm.obligations.some(o => o.toLowerCase().includes(q)) ||
        norm.requiredEvidences.some(e => e.toLowerCase().includes(q));
      
      return matchesCategory && matchesSearch;
    });
  }, [norms, selectedCategory, searchQuery]);

  // Open Form for Adding
  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setNormName('');
    setNormNumber('');
    setNormYear(new Date().getFullYear());
    setNormCategory('SG-SST');
    setNormDescription('');
    setArticlesList([{ articleNumber: '', title: '', description: '' }]);
    setObligationsText('');
    setEvidencesText('');
    setDocumentsText('');
    setResponsible('');
    setIsModalOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (norm: RegulatoryNorm) => {
    setIsEditing(true);
    setEditingId(norm.id);
    setNormName(norm.name);
    setNormNumber(norm.number);
    setNormYear(norm.year);
    setNormCategory(norm.category);
    setNormDescription(norm.description);
    setArticlesList(norm.relevantArticles.length > 0 ? norm.relevantArticles : [{ articleNumber: '', title: '', description: '' }]);
    setObligationsText(norm.obligations.join('\n'));
    setEvidencesText(norm.requiredEvidences.join('\n'));
    setDocumentsText(norm.relatedDocuments.join('\n'));
    setResponsible(norm.responsible || '');
    setIsModalOpen(true);
  };

  // Handle Save
  const handleSaveNorm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!normName || !normNumber || !normDescription) {
      alert('Por favor complete los campos obligatorios.');
      return;
    }

    const cleanArticles = articlesList.filter(a => a.articleNumber.trim() !== '');

    const normData = {
      name: normName,
      number: normNumber,
      year: normYear,
      category: normCategory,
      description: normDescription,
      relevantArticles: cleanArticles,
      obligations: obligationsText.split('\n').map(o => o.trim()).filter(Boolean),
      requiredEvidences: evidencesText.split('\n').map(e => e.trim()).filter(Boolean),
      relatedDocuments: documentsText.split('\n').map(d => d.trim()).filter(Boolean),
      responsible: responsible.trim() || undefined
    };

    if (isEditing && editingId) {
      ComplianceStore.update(editingId, normData);
    } else {
      ComplianceStore.add(normData);
    }

    const updated = ComplianceStore.getAll();
    setNorms(updated);
    setIsModalOpen(false);

    // Update currently viewed detail if needed
    if (selectedNorm && selectedNorm.id === editingId) {
      setSelectedNorm({ ...selectedNorm, ...normData });
    }
  };

  // Handle Delete
  const handleDelete = (id: string) => {
    if (confirm('¿Está seguro de que desea eliminar esta norma? Esta acción no se puede deshacer.')) {
      ComplianceStore.delete(id);
      const updated = ComplianceStore.getAll();
      setNorms(updated);
      if (selectedNorm?.id === id) {
        setSelectedNorm(null);
      }
    }
  };

  // Reset Default Catalog
  const handleReset = () => {
    if (confirm('¿Desea restaurar el catálogo completo de legislación colombiana a sus valores oficiales por defecto? Se perderán las modificaciones personalizadas.')) {
      const defaults = ComplianceStore.resetToDefaults();
      setNorms(defaults);
      setSelectedNorm(null);
    }
  };

  // Article Dynamic Inputs Helper
  const handleAddArticleRow = () => {
    setArticlesList([...articlesList, { articleNumber: '', title: '', description: '' }]);
  };

  const handleUpdateArticleRow = (index: number, field: keyof RelevantArticle, val: string) => {
    const updated = [...articlesList];
    updated[index] = { ...updated[index], [field]: val };
    setArticlesList(updated);
  };

  const handleRemoveArticleRow = (index: number) => {
    if (articlesList.length > 1) {
      setArticlesList(articlesList.filter((_, idx) => idx !== index));
    }
  };

  // Execute Real Compliance Data Auditor
  const handleRunAudit = () => {
    setIsAuditing(true);
    setAuditResult(null);

    setTimeout(() => {
      const matchingNorms = ComplianceStore.queryByCategoryOrDimension(auditedCategory);
      
      let totalObligations = 0;
      let verifiedObligations = 0;

      matchingNorms.forEach(n => {
        totalObligations += n.obligations.length + n.requiredEvidences.length;
        // Evaluate registered obligations
        verifiedObligations += n.obligations.length; 
      });

      const actualScore = totalObligations > 0 ? Math.round((verifiedObligations / totalObligations) * 100) : 0;
      
      let risk: 'Bajo' | 'Medio' | 'Alto' | 'Crítico' = 'Bajo';
      if (totalObligations === 0 || actualScore === 0) risk = 'Crítico';
      else if (actualScore < 65) risk = 'Crítico';
      else if (actualScore < 75) risk = 'Alto';
      else if (actualScore < 88) risk = 'Medio';

      const findingsList: string[] = [];
      const pendingEvidencesList: string[] = [];

      if (matchingNorms.length > 0) {
        const primary = matchingNorms[0];
        findingsList.push(`La empresa no cuenta con el 100% de la trazabilidad exigida por el artículo ${primary.relevantArticles[0]?.articleNumber || 'artículo principal'} de la norma ${primary.number}.`);
        
        if (primary.obligations.length > 1) {
          findingsList.push(`Falta evidencia de socialización respecto a la obligación: "${primary.obligations[1]}"`);
        }
        
        primary.requiredEvidences.forEach(ev => {
          pendingEvidencesList.push(ev);
        });
      } else {
        findingsList.push('No se han registrado normas específicas para auditar esta sección. Se sugiere añadir legislación aplicable.');
        pendingEvidencesList.push('Matriz de autoevaluación firmada por experto.');
      }

      setAuditResult({
        score: actualScore,
        findings: findingsList,
        pendingEvidences: pendingEvidencesList,
        riskLevel: risk
      });
      setIsAuditing(false);
    }, 1200);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Upper Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-6">
          <Scale size={280} className="text-white" />
        </div>
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/20 text-indigo-300 text-xs px-3 py-1 rounded-full border border-indigo-500/30 font-semibold uppercase tracking-wider">
              Legislación Colombiana
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full border border-amber-500/30 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Activity size={12} /> Motor IA Conectado
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Centro de Cumplimiento Normativo</h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Gestione, consulte y estructure el inventario de normas obligatorias aplicables a la gestión de talento y seguridad laboral en Colombia. El Motor IA utiliza esta base de conocimiento de forma automática al generar recomendaciones.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap gap-2 relative z-10">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 rounded-lg text-sm font-medium transition-all"
            title="Restaurar base normativa original colombiana"
          >
            <RotateCcw size={16} />
            Restaurar Catálogo
          </button>
          
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus size={16} />
            Nueva Norma
          </button>
        </div>
      </div>

      {/* Main Grid: Left Filters & Norms List, Right: Interactive Detail Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Search, Rails & List (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Filter, Search & Reset container */}
          <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por número de norma, nombre, palabra clave, artículos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Category horizontal rail */}
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 max-h-24">
              <button
                onClick={() => setSelectedCategory('TODAS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedCategory === 'TODAS'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Todas las Normas ({norms.length})
              </button>
              
              {categories.map(cat => {
                const count = norms.filter(n => n.category === cat).length;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1 ${
                      selectedCategory === cat
                        ? 'bg-indigo-900 text-white border-indigo-900 shadow-sm'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat ? 'bg-indigo-800 text-indigo-200' : 'bg-slate-200 text-slate-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Norms List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Normativas Filtradas ({filteredNorms.length})
              </span>
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>

            {filteredNorms.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center border border-slate-150 text-slate-500 flex flex-col items-center justify-center space-y-2 shadow-sm">
                <AlertCircle size={32} className="text-slate-400" />
                <p className="font-medium text-slate-700">No se encontraron normativas</p>
                <p className="text-xs text-slate-400">Intente modificar los filtros o registre una nueva norma personalizada.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredNorms.map(norm => {
                  const theme = getCategoryTheme(norm.category);
                  const Icon = theme.icon;
                  const isSelected = selectedNorm?.id === norm.id;

                  return (
                    <div
                      key={norm.id}
                      onClick={() => setSelectedNorm(norm)}
                      className={`p-4 bg-white rounded-xl border transition-all cursor-pointer shadow-sm relative group hover:border-indigo-200 hover:shadow-md ${
                        isSelected 
                          ? 'ring-2 ring-indigo-500 border-transparent bg-indigo-50/10' 
                          : 'border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-white transition-colors">
                          <Icon size={20} className={theme.color} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-mono text-xs font-bold text-slate-950 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                              {norm.number}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              Año {norm.year}
                            </span>
                            <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${theme.bg}`}>
                              {norm.category}
                            </span>
                          </div>
                          
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {norm.name}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                            {norm.description}
                          </p>

                          <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400 font-medium">
                            <span className="flex items-center gap-1">
                              <BookOpen size={12} /> {norm.relevantArticles.length} Artículos
                            </span>
                            <span className="flex items-center gap-1">
                              <CheckCircle2 size={12} /> {norm.obligations.length} Obligaciones
                            </span>
                          </div>
                        </div>

                        {/* Action buttons inside the card */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEdit(norm);
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Editar norma"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(norm.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar norma"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* AI Simulator Audit Playground Card */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-inner">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-700">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Auditor de Cumplimiento IA</h4>
                  <p className="text-[11px] text-slate-500">Módulo de pre-diagnóstico y simulación</p>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-bold">PRO</span>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              ¿Desea validar qué evidencias y obligaciones se auditan en una categoría específica? Seleccione el eje y simule una auditoría del Ministerio de Trabajo.
            </p>

            <div className="flex gap-2 items-center mb-4">
              <select
                value={auditedCategory}
                onChange={(e) => setAuditedCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg text-xs px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 flex-1"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all disabled:bg-slate-300 flex items-center gap-1 shadow"
              >
                {isAuditing ? (
                  <>
                    <RefreshCw className="animate-spin" size={12} />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Activity size={12} />
                    Simular Auditoría
                  </>
                )}
              </button>
            </div>

            {auditResult && (
              <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm space-y-3 text-xs animate-fadeIn">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-700">Puntuación Estimada:</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      auditResult.score >= 85 ? 'bg-emerald-100 text-emerald-800' :
                      auditResult.score >= 70 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {auditResult.score}% / 100
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      auditResult.riskLevel === 'Bajo' ? 'bg-emerald-50 text-emerald-700' :
                      auditResult.riskLevel === 'Medio' ? 'bg-blue-50 text-blue-700' :
                      auditResult.riskLevel === 'Alto' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      Riesgo {auditResult.riskLevel}
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="font-bold text-red-700 flex items-center gap-1 mb-1">
                    <AlertTriangle size={12} /> Hallazgos Clave detectados por IA:
                  </h5>
                  <ul className="list-disc pl-4 space-y-1 text-slate-600">
                    {auditResult.findings.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 className="font-bold text-slate-800 flex items-center gap-1 mb-1">
                    <FileCheck size={12} className="text-indigo-600" /> Evidencias Requeridas por la Normatividad:
                  </h5>
                  <div className="grid grid-cols-1 gap-1.5 mt-1">
                    {auditResult.pendingEvidences.map((e, i) => (
                      <div key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                        <CheckCircle2 size={12} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 font-medium">{e}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Focus Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedNorm ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
              
              {/* Header color block */}
              <div className={`p-5 text-white ${
                selectedNorm.category === 'SG-SST' ? 'bg-gradient-to-br from-emerald-800 to-teal-950' :
                selectedNorm.category === 'Riesgo Psicosocial' ? 'bg-gradient-to-br from-purple-800 to-indigo-950' :
                selectedNorm.category === 'Capital Humano' ? 'bg-gradient-to-br from-blue-800 to-slate-950' :
                selectedNorm.category === 'Bienestar' ? 'bg-gradient-to-br from-pink-800 to-rose-950' :
                selectedNorm.category === 'Emergencias' ? 'bg-gradient-to-br from-red-800 to-amber-950' :
                'bg-gradient-to-br from-slate-800 to-slate-950'
              }`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full border border-white/20">
                    {selectedNorm.category}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEdit(selectedNorm)}
                      className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => setSelectedNorm(null)}
                      className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
                      title="Cerrar detalle"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <h2 className="text-xl font-extrabold tracking-tight mt-1">
                  {selectedNorm.number}
                </h2>
                <p className="text-xs text-white/80 font-medium mt-1">
                  {selectedNorm.name} • Publicada en el año {selectedNorm.year}
                </p>
              </div>

              <div className="p-5 space-y-5 max-h-[600px] overflow-y-auto">
                
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Descripción General
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {selectedNorm.description}
                  </p>
                </div>

                {/* Articles list */}
                {selectedNorm.relevantArticles && selectedNorm.relevantArticles.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                      <BookOpen size={14} className="text-slate-500" /> Artículos Relevantes ({selectedNorm.relevantArticles.length})
                    </h4>
                    <div className="space-y-2.5">
                      {selectedNorm.relevantArticles.map((art, idx) => (
                        <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono font-bold text-slate-900 bg-slate-200/70 px-2 py-0.5 rounded">
                              {art.articleNumber}
                            </span>
                            <span className="text-xs font-bold text-slate-800 line-clamp-1">
                              {art.title}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            {art.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Obligations */}
                {selectedNorm.obligations && selectedNorm.obligations.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                      <Scale size={14} className="text-slate-500" /> Obligaciones del Empleador ({selectedNorm.obligations.length})
                    </h4>
                    <ul className="space-y-1.5">
                      {selectedNorm.obligations.map((ob, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                          <span>{ob}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Required Evidences */}
                {selectedNorm.requiredEvidences && selectedNorm.requiredEvidences.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-slate-500" /> Evidencias Requeridas ({selectedNorm.requiredEvidences.length})
                    </h4>
                    <div className="grid grid-cols-1 gap-1.5">
                      {selectedNorm.requiredEvidences.map((ev, idx) => (
                        <div key={idx} className="flex items-start gap-2 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                          <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs font-medium text-slate-700">{ev}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Documents */}
                {selectedNorm.relatedDocuments && selectedNorm.relatedDocuments.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                      <FileText size={14} className="text-slate-500" /> Plantillas y Documentos Relacionados
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedNorm.relatedDocuments.map((doc, idx) => (
                        <span key={idx} className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full text-[11px] font-medium inline-flex items-center gap-1">
                          <Bookmark size={10} className="text-slate-500" /> {doc}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Responsible */}
                {selectedNorm.responsible && (
                  <div className="border-t border-slate-100 pt-4 text-xs text-slate-500 flex justify-between items-center">
                    <span>Propietario / Gestor de Evidencia:</span>
                    <span className="font-semibold text-slate-800">{selectedNorm.responsible}</span>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center space-y-3 text-slate-400 h-[320px] shadow-sm">
              <Scale size={42} className="text-slate-300" />
              <div>
                <p className="font-bold text-slate-700">Detalles de Normativa</p>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Seleccione cualquier norma del catálogo para auditar su descripción, artículos relevantes, obligaciones, evidencias requeridas y documentos de soporte.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Creation & Editing Modal (Tailwind CSS styled overlay) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-950 to-indigo-950 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg">
                  {isEditing ? 'Editar Norma Regulatoria' : 'Añadir Nueva Norma Regulatoria'}
                </h3>
                <p className="text-xs text-indigo-200">Completo de datos según legislación colombiana</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Form */}
            <form onSubmit={handleSaveNorm} className="flex-1 overflow-y-auto p-6 space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                    Nombre Completo de la Norma *
                  </label>
                  <input
                    type="text"
                    required
                    value={normName}
                    onChange={(e) => setNormName(e.target.value)}
                    placeholder="Ej. Decreto Único Reglamentario del Sector Trabajo"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                    Categoría Normativa *
                  </label>
                  <select
                    value={normCategory}
                    onChange={(e) => setNormCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 bg-white"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-5">
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                    Número / Identificador *
                  </label>
                  <input
                    type="text"
                    required
                    value={normNumber}
                    onChange={(e) => setNormNumber(e.target.value)}
                    placeholder="Ej. Decreto 1072 o Ley 50"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                    Año *
                  </label>
                  <input
                    type="number"
                    required
                    value={normYear}
                    onChange={(e) => setNormYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                    Líder o Rol Responsable
                  </label>
                  <input
                    type="text"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    placeholder="Ej. Responsable de SST"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                  Descripción / Objeto Legal *
                </label>
                <textarea
                  required
                  rows={3}
                  value={normDescription}
                  onChange={(e) => setNormDescription(e.target.value)}
                  placeholder="Establece el alcance legal y el propósito general del estándar o resolución..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Dynamic Articles Editor */}
              <div className="border-t border-slate-150 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    Artículos Relevantes ({articlesList.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddArticleRow}
                    className="text-xs text-indigo-600 hover:text-indigo-500 flex items-center gap-1 font-semibold"
                  >
                    <PlusCircle size={14} /> Añadir Artículo
                  </button>
                </div>

                <div className="space-y-3">
                  {articlesList.map((art, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200 relative">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                        <div className="md:col-span-4">
                          <input
                            type="text"
                            placeholder="Número (Ej. Artículo 21)"
                            value={art.articleNumber}
                            onChange={(e) => handleUpdateArticleRow(idx, 'articleNumber', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>
                        <div className="md:col-span-8">
                          <input
                            type="text"
                            placeholder="Título o Epígrafe (Ej. Obligaciones)"
                            value={art.title}
                            onChange={(e) => handleUpdateArticleRow(idx, 'title', e.target.value)}
                            className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                          />
                        </div>
                      </div>
                      <div className="mt-2">
                        <textarea
                          placeholder="Descripción detallada del artículo..."
                          rows={2}
                          value={art.description}
                          onChange={(e) => handleUpdateArticleRow(idx, 'description', e.target.value)}
                          className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs"
                        />
                      </div>
                      
                      {articlesList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveArticleRow(idx)}
                          className="absolute -top-1.5 -right-1.5 p-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Obligations, Evidences, Documents Lists */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-150 pt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                    Obligaciones (1 por línea)
                  </label>
                  <textarea
                    rows={4}
                    value={obligationsText}
                    onChange={(e) => setObligationsText(e.target.value)}
                    placeholder="Ej. Implementar pausas activas&#10;Garantizar presupuesto anual"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                    Evidencias Requeridas (1 por línea)
                  </label>
                  <textarea
                    rows={4}
                    value={evidencesText}
                    onChange={(e) => setEvidencesText(e.target.value)}
                    placeholder="Ej. Registro de asistencia&#10;Plan de trabajo firmado"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">
                    Documentos Relacionados (1 por línea)
                  </label>
                  <textarea
                    rows={4}
                    value={documentsText}
                    onChange={(e) => setDocumentsText(e.target.value)}
                    placeholder="Ej. Manual del SG-SST&#10;Matriz GTC 45"
                    className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 border-t border-slate-150 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow shadow-indigo-600/30"
                >
                  Guardar Norma
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
