import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Copy, 
  MoveUp, 
  MoveDown, 
  Layers, 
  HelpCircle, 
  CheckCircle2, 
  Eye, 
  Save, 
  ArrowLeft, 
  Sliders, 
  Tag, 
  Clock, 
  ShieldCheck, 
  GitBranch, 
  Sparkles, 
  FolderPlus,
  Type
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  EncuestaMeta, 
  SeccionEncuesta, 
  PreguntaConfig, 
  LISTA_TIPOS_PREGUNTA 
} from '../types';
import { QuestionConfigEditor } from './QuestionConfigEditor';

interface SurveyEditorProps {
  encuesta: EncuestaMeta;
  onSave: (updated: EncuestaMeta) => void;
  onCancel: () => void;
  onPreview: (encuesta: EncuestaMeta) => void;
}

export function SurveyEditor({ encuesta, onSave, onCancel, onPreview }: SurveyEditorProps) {
  const [meta, setMeta] = useState<EncuestaMeta>(encuesta);
  const [activeSectionId, setActiveSectionId] = useState<string>(
    encuesta.secciones[0]?.id || ''
  );

  // Question modal state
  const [editingPregunta, setEditingPregunta] = useState<PreguntaConfig | null>(null);
  const [editingSeccionIdForPregunta, setEditingSeccionIdForPregunta] = useState<string>('');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Section modal state
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SeccionEncuesta | null>(null);
  const [sectionTitulo, setSectionTitulo] = useState('');
  const [sectionDescripcion, setSectionDescripcion] = useState('');

  // Collect all questions across sections for dependency referencing
  const allPreguntas = meta.secciones.flatMap(s => s.preguntas);

  // Save changes to survey metadata or sections
  const handleMetaChange = (field: keyof EncuestaMeta, val: any) => {
    setMeta(prev => ({ ...prev, [field]: val }));
  };

  // Add / Edit Section
  const handleOpenSectionModal = (sec?: SeccionEncuesta) => {
    if (sec) {
      setEditingSection(sec);
      setSectionTitulo(sec.titulo);
      setSectionDescripcion(sec.descripcion || '');
    } else {
      setEditingSection(null);
      setSectionTitulo(`Sección ${meta.secciones.length + 1}`);
      setSectionDescripcion('');
    }
    setIsSectionModalOpen(true);
  };

  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitulo.trim()) return;

    if (editingSection) {
      setMeta(prev => ({
        ...prev,
        secciones: prev.secciones.map(s => s.id === editingSection.id ? {
          ...s,
          titulo: sectionTitulo.trim(),
          descripcion: sectionDescripcion.trim() || undefined
        } : s)
      }));
    } else {
      const newSecId = `sec-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const newSec: SeccionEncuesta = {
        id: newSecId,
        encuestaId: meta.id,
        titulo: sectionTitulo.trim(),
        descripcion: sectionDescripcion.trim() || undefined,
        orden: meta.secciones.length + 1,
        preguntas: []
      };
      setMeta(prev => ({ ...prev, secciones: [...prev.secciones, newSec] }));
      setActiveSectionId(newSecId);
    }

    setIsSectionModalOpen(false);
  };

  const handleDeleteSection = (secId: string) => {
    if (meta.secciones.length <= 1) {
      alert('La encuesta debe tener al menos una sección.');
      return;
    }
    if (confirm('¿Está seguro de eliminar esta sección y todas sus preguntas?')) {
      const filtered = meta.secciones.filter(s => s.id !== secId);
      setMeta(prev => ({ ...prev, secciones: filtered }));
      if (activeSectionId === secId) {
        setActiveSectionId(filtered[0]?.id || '');
      }
    }
  };

  // Open Question Modal
  const handleOpenQuestionModal = (seccionId: string, preg?: PreguntaConfig) => {
    setEditingSeccionIdForPregunta(seccionId);
    setEditingPregunta(preg || null);
    setIsQuestionModalOpen(true);
  };

  // Save Question inside Section
  const handleSaveQuestion = (updatedPreg: PreguntaConfig) => {
    setMeta(prev => ({
      ...prev,
      secciones: prev.secciones.map(sec => {
        if (sec.id !== updatedPreg.seccionId) return sec;

        const exists = sec.preguntas.some(p => p.id === updatedPreg.id);
        let newPreguntas: PreguntaConfig[];
        if (exists) {
          newPreguntas = sec.preguntas.map(p => p.id === updatedPreg.id ? updatedPreg : p);
        } else {
          newPreguntas = [...sec.preguntas, updatedPreg];
        }

        return { ...sec, preguntas: newPreguntas };
      })
    }));
  };

  // Duplicate Question
  const handleDuplicateQuestion = (seccionId: string, preg: PreguntaConfig) => {
    const dupPreg: PreguntaConfig = {
      ...preg,
      id: `preg-dup-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      titulo: `${preg.titulo} (Copia)`,
      orden: preg.orden + 1
    };
    handleSaveQuestion(dupPreg);
  };

  // Delete Question
  const handleDeleteQuestion = (seccionId: string, pregId: string) => {
    setMeta(prev => ({
      ...prev,
      secciones: prev.secciones.map(sec => {
        if (sec.id !== seccionId) return sec;
        return {
          ...sec,
          preguntas: sec.preguntas.filter(p => p.id !== pregId)
        };
      })
    }));
  };

  // Move Question Up/Down
  const handleMoveQuestion = (seccionId: string, index: number, direction: 'up' | 'down') => {
    setMeta(prev => ({
      ...prev,
      secciones: prev.secciones.map(sec => {
        if (sec.id !== seccionId) return sec;
        const newPreg = [...sec.preguntas];
        const targetIdx = direction === 'up' ? index - 1 : index + 1;
        if (targetIdx < 0 || targetIdx >= newPreg.length) return sec;

        const temp = newPreg[index];
        newPreg[index] = newPreg[targetIdx];
        newPreg[targetIdx] = temp;

        // update orden
        newPreg.forEach((p, idx) => { p.orden = idx + 1; });

        return { ...sec, preguntas: newPreg };
      })
    }));
  };

  const activeSection = meta.secciones.find(s => s.id === activeSectionId) || meta.secciones[0];

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Header Controls */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            title="Volver a la lista"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Constructor de Encuestas Dinámico
            </span>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Diseñador de Encuesta: {meta.titulo || 'Nueva Encuesta'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPreview(meta)}
            className="px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-2 border border-indigo-200 transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4 text-indigo-600" />
            <span>Vista Previa / Probar</span>
          </button>

          <button
            type="button"
            onClick={() => onSave(meta)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Encuesta</span>
          </button>
        </div>
      </div>

      {/* Survey Metadata Settings Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2">
          Parametrización y Metadatos de la Encuesta
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título de la Encuesta <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={meta.titulo}
              onChange={(e) => handleMetaChange('titulo', e.target.value)}
              placeholder="Ej. Encuesta de Clima Organizacional 2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Código / Referencia Interna
            </label>
            <input
              type="text"
              value={meta.codigo}
              onChange={(e) => handleMetaChange('codigo', e.target.value)}
              placeholder="Ej. ENC-2026-001"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Categoría
            </label>
            <input
              type="text"
              value={meta.categoria}
              onChange={(e) => handleMetaChange('categoria', e.target.value)}
              placeholder="Ej. Sociodemográfica, Clima, Riesgo Psicosocial"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tiempo Estimado (Minutos)
            </label>
            <input
              type="number"
              min={1}
              value={meta.tiempoEstimadoMinutos}
              onChange={(e) => handleMetaChange('tiempoEstimadoMinutos', parseInt(e.target.value) || 5)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center pt-5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={meta.permitirAnonimo}
                onChange={(e) => handleMetaChange('permitirAnonimo', e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <span className="text-xs font-extrabold text-slate-800 block">Permitir Respuestas Anónimas</span>
                <span className="text-[10px] text-slate-500 block">No requiere identificación del trabajador</span>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Descripción u Objetivos
          </label>
          <textarea
            rows={2}
            value={meta.descripcion}
            onChange={(e) => handleMetaChange('descripcion', e.target.value)}
            placeholder="Breve explicación del propósito de esta encuesta..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Sections and Questions Builder Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Sidebar: Sections List */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-extrabold text-slate-900">
                Secciones ({meta.secciones.length})
              </h4>
            </div>

            <button
              type="button"
              onClick={() => handleOpenSectionModal()}
              className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
              title="Nueva Sección"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {meta.secciones.map((sec, idx) => {
              const isSelected = sec.id === activeSectionId;
              const pregCount = sec.preguntas.length;

              return (
                <div
                  key={sec.id}
                  onClick={() => setActiveSectionId(sec.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative group flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-white text-slate-700 border-slate-200/80'
                  }`}
                >
                  <div className="overflow-hidden">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider block opacity-80">
                      Sección {idx + 1}
                    </span>
                    <span className="text-xs font-bold block truncate">
                      {sec.titulo}
                    </span>
                    <span className={`text-[10px] font-medium block truncate mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {pregCount} {pregCount === 1 ? 'pregunta' : 'preguntas'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenSectionModal(sec);
                      }}
                      className={`p-1 rounded-md ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-slate-200 text-slate-600'}`}
                      title="Editar Sección"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {meta.secciones.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(sec.id);
                        }}
                        className={`p-1 rounded-md ${isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-rose-100 text-rose-600'}`}
                        title="Eliminar Sección"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => handleOpenSectionModal()}
            className="w-full py-2.5 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Añadir Sección</span>
          </button>
        </div>

        {/* Main Workspace: Active Section Questions Canvas */}
        <div className="lg:col-span-3 space-y-4">
          {activeSection ? (
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-slate-900">
                      {activeSection.titulo}
                    </h3>
                    <button
                      type="button"
                      onClick={() => handleOpenSectionModal(activeSection)}
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {activeSection.descripcion && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeSection.descripcion}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenQuestionModal(activeSection.id)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Pregunta</span>
                </button>
              </div>

              {/* Questions List */}
              {activeSection.preguntas.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 space-y-3">
                  <Type className="w-10 h-10 text-slate-400 mx-auto" />
                  <h4 className="text-xs font-bold text-slate-700">Esta sección no tiene preguntas aún</h4>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Añada preguntas configurando el tipo de entrada (Texto, Lista, Likert, NPS, Firma, Archivo, etc.).
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenQuestionModal(activeSection.id)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Primera Pregunta</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeSection.preguntas.map((preg, pIdx) => {
                    const tipoMeta = LISTA_TIPOS_PREGUNTA.find(t => t.tipo === preg.tipo);
                    const hasRules = preg.reglasDependencia && preg.reglasDependencia.length > 0;

                    return (
                      <div
                        key={preg.id}
                        className="bg-slate-50/80 hover:bg-white p-4 rounded-2xl border border-slate-200/80 hover:border-indigo-200 transition-all shadow-2xs hover:shadow-md space-y-3 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                              #{pIdx + 1}
                            </span>
                            
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-extrabold text-xs text-slate-900">
                                  {preg.titulo}
                                </span>
                                {preg.obligatoria && (
                                  <span className="text-rose-500 font-bold text-xs" title="Obligatoria">*</span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                                  {tipoMeta?.nombre || preg.tipo}
                                </span>

                                {preg.categoria && (
                                  <span className="text-[10px] bg-slate-200/80 text-slate-700 font-bold px-2 py-0.5 rounded-md">
                                    {preg.categoria}
                                  </span>
                                )}

                                {preg.variableSistema && (
                                  <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-md">
                                    Sistema: {preg.nombreVariableSistema}
                                  </span>
                                )}

                                {preg.variableEpidemiologica && (
                                  <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-md">
                                    SG-SST: {preg.factorEpidemiologico}
                                  </span>
                                )}

                                {hasRules && (
                                  <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <GitBranch className="w-3 h-3 text-amber-600" />
                                    <span>{preg.reglasDependencia.length} {preg.reglasDependencia.length === 1 ? 'regla' : 'reglas'}</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Quick Action Controls */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(activeSection.id, pIdx, 'up')}
                              disabled={pIdx === 0}
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Mover arriba"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveQuestion(activeSection.id, pIdx, 'down')}
                              disabled={pIdx === activeSection.preguntas.length - 1}
                              className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer"
                              title="Mover abajo"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDuplicateQuestion(activeSection.id, preg)}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 cursor-pointer"
                              title="Duplicar pregunta"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenQuestionModal(activeSection.id, preg)}
                              className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 cursor-pointer"
                              title="Editar pregunta"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteQuestion(activeSection.id, preg.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-600 hover:text-rose-600 cursor-pointer"
                              title="Eliminar pregunta"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Options preview if applicable */}
                        {preg.opciones && preg.opciones.length > 0 && (
                          <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex flex-wrap gap-1.5 text-[11px] text-slate-600">
                            <span className="font-bold text-slate-400 mr-1">Opciones:</span>
                            {preg.opciones.map(op => (
                              <span key={op.id} className="bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                                {op.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
              <p className="text-xs text-slate-500">Seleccione una sección a la izquierda para editar sus preguntas.</p>
            </div>
          )}
        </div>
      </div>

      {/* QUESTION CONFIG MODAL */}
      <QuestionConfigEditor
        pregunta={editingPregunta}
        allPreguntas={allPreguntas}
        seccionId={editingSeccionIdForPregunta}
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        onSave={handleSaveQuestion}
      />

      {/* SECTION MODAL */}
      <AnimatePresence>
        {isSectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden text-left"
            >
              <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">
                  {editingSection ? 'Editar Sección' : 'Nueva Sección'}
                </h3>
                <button
                  onClick={() => setIsSectionModalOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-white/70"
                >
                  <Trash2 className="w-4 h-4 hidden" />
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveSection} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título de la Sección <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={sectionTitulo}
                    onChange={(e) => setSectionTitulo(e.target.value)}
                    placeholder="Ej. Sección 2: Hábitos de Vida"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Descripción / Subtítulo
                  </label>
                  <textarea
                    rows={2}
                    value={sectionDescripcion}
                    onChange={(e) => setSectionDescripcion(e.target.value)}
                    placeholder="Instrucciones breves para esta sección..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSectionModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    Guardar Sección
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
