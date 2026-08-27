import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Info, 
  HelpCircle, 
  SlidersHorizontal, 
  GitBranch, 
  Cpu, 
  HeartPulse, 
  Database,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PreguntaConfig, 
  TipoPregunta, 
  OpcionPregunta, 
  ReglaDependencia, 
  OperadorRegla, 
  AccionRegla 
} from '../types';
import { QuestionTypeSelector } from './QuestionTypeSelector';

interface QuestionConfigEditorProps {
  pregunta: PreguntaConfig | null;
  allPreguntas: PreguntaConfig[]; // For selecting source question in dependency rules
  seccionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pregunta: PreguntaConfig) => void;
}

export function QuestionConfigEditor({
  pregunta,
  allPreguntas,
  seccionId,
  isOpen,
  onClose,
  onSave
}: QuestionConfigEditorProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'opciones' | 'validaciones' | 'mapeo' | 'dependencias'>('general');

  // Form states
  const [tipo, setTipo] = useState<TipoPregunta>('texto');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [obligatoria, setObligatoria] = useState(true);
  const [visible, setVisible] = useState(true);
  const [editable, setEditable] = useState(true);
  
  const [valorPorDefecto, setValorPorDefecto] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [tooltip, setTooltip] = useState('');
  const [textoAyuda, setTextoAyuda] = useState('');
  
  const [expresionValidacion, setExpresionValidacion] = useState('');
  const [mensajeValidacionError, setMensajeValidacionError] = useState('');
  const [valorMinimo, setValorMinimo] = useState<number | undefined>(undefined);
  const [valorMaximo, setValorMaximo] = useState<number | undefined>(undefined);
  const [longitudMinima, setLongitudMinima] = useState<number | undefined>(undefined);
  const [longitudMaxima, setLongitudMaxima] = useState<number | undefined>(undefined);
  const [orden, setOrden] = useState<number>(1);
  const [categoria, setCategoria] = useState('');

  // Flags & Mappings
  const [variableSistema, setVariableSistema] = useState(false);
  const [nombreVariableSistema, setNombreVariableSistema] = useState('');
  
  const [variableEpidemiologica, setVariableEpidemiologica] = useState(false);
  const [factorEpidemiologico, setFactorEpidemiologico] = useState('');
  
  const [variableIA, setVariableIA] = useState(false);
  const [promptContextoIA, setPromptContextoIA] = useState('');

  // Options
  const [opciones, setOpciones] = useState<OpcionPregunta[]>([]);

  // Dependency Rules
  const [reglasDependencia, setReglasDependencia] = useState<ReglaDependencia[]>([]);

  useEffect(() => {
    if (pregunta) {
      setTipo(pregunta.tipo);
      setTitulo(pregunta.titulo);
      setDescripcion(pregunta.descripcion || '');
      setObligatoria(pregunta.obligatoria);
      setVisible(pregunta.visible);
      setEditable(pregunta.editable);
      setValorPorDefecto(pregunta.valorPorDefecto || '');
      setPlaceholder(pregunta.placeholder || '');
      setTooltip(pregunta.tooltip || '');
      setTextoAyuda(pregunta.textoAyuda || '');
      setExpresionValidacion(pregunta.expresionValidacion || '');
      setMensajeValidacionError(pregunta.mensajeValidacionError || '');
      setValorMinimo(pregunta.valorMinimo);
      setValorMaximo(pregunta.valorMaximo);
      setLongitudMinima(pregunta.longitudMinima);
      setLongitudMaxima(pregunta.longitudMaxima);
      setOrden(pregunta.orden || 1);
      setCategoria(pregunta.categoria || '');
      
      setVariableSistema(pregunta.variableSistema || false);
      setNombreVariableSistema(pregunta.nombreVariableSistema || '');
      setVariableEpidemiologica(pregunta.variableEpidemiologica || false);
      setFactorEpidemiologico(pregunta.factorEpidemiologico || '');
      setVariableIA(pregunta.variableIA || false);
      setPromptContextoIA(pregunta.promptContextoIA || '');
      
      setOpciones(pregunta.opciones || []);
      setReglasDependencia(pregunta.reglasDependencia || []);
    } else {
      // Defaults for new question
      setTipo('texto');
      setTitulo('');
      setDescripcion('');
      setObligatoria(true);
      setVisible(true);
      setEditable(true);
      setValorPorDefecto('');
      setPlaceholder('');
      setTooltip('');
      setTextoAyuda('');
      setExpresionValidacion('');
      setMensajeValidacionError('');
      setValorMinimo(undefined);
      setValorMaximo(undefined);
      setLongitudMinima(undefined);
      setLongitudMaxima(undefined);
      setOrden(allPreguntas.length + 1);
      setCategoria('General');
      setVariableSistema(false);
      setNombreVariableSistema('');
      setVariableEpidemiologica(false);
      setFactorEpidemiologico('');
      setVariableIA(true);
      setPromptContextoIA('');
      setOpciones([
        { id: 'op-1', label: 'Opción 1', value: 'Opción 1' },
        { id: 'op-2', label: 'Opción 2', value: 'Opción 2' }
      ]);
      setReglasDependencia([]);
    }
  }, [pregunta, isOpen]);

  // Needs options editor?
  const requiresOptions = ['lista', 'radio', 'checkbox', 'multiple_seleccion', 'escala_likert'].includes(tipo);

  // Add Option
  const handleAddOption = () => {
    const nextNum = opciones.length + 1;
    const newOpt: OpcionPregunta = {
      id: `op-${Date.now()}-${nextNum}`,
      label: `Opción ${nextNum}`,
      value: `Opción ${nextNum}`,
      puntaje: nextNum
    };
    setOpciones([...opciones, newOpt]);
  };

  // Update Option
  const handleUpdateOption = (index: number, field: keyof OpcionPregunta, val: any) => {
    const copy = [...opciones];
    copy[index] = { ...copy[index], [field]: val };
    setOpciones(copy);
  };

  // Remove Option
  const handleRemoveOption = (index: number) => {
    setOpciones(opciones.filter((_, i) => i !== index));
  };

  // Add Dependency Rule
  const handleAddRule = () => {
    const sourcePreg = allPreguntas.find(p => p.id !== (pregunta?.id || ''));
    const newRule: ReglaDependencia = {
      id: `rule-${Date.now()}`,
      preguntaOrigenId: sourcePreg?.id || '',
      operador: 'igual_a',
      valorTarget: 'Sí',
      accion: 'mostrar'
    };
    setReglasDependencia([...reglasDependencia, newRule]);
  };

  // Update Rule
  const handleUpdateRule = (index: number, field: keyof ReglaDependencia, val: any) => {
    const copy = [...reglasDependencia];
    copy[index] = { ...copy[index], [field]: val };
    setReglasDependencia(copy);
  };

  // Remove Rule
  const handleRemoveRule = (index: number) => {
    setReglasDependencia(reglasDependencia.filter((_, i) => i !== index));
  };

  // Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      alert('El título de la pregunta es obligatorio');
      return;
    }

    const updatedPregunta: PreguntaConfig = {
      id: pregunta?.id || `preg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      seccionId,
      tipo,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      obligatoria,
      visible,
      editable,
      valorPorDefecto: valorPorDefecto.trim() || undefined,
      placeholder: placeholder.trim() || undefined,
      tooltip: tooltip.trim() || undefined,
      textoAyuda: textoAyuda.trim() || undefined,
      expresionValidacion: expresionValidacion.trim() || undefined,
      mensajeValidacionError: mensajeValidacionError.trim() || undefined,
      valorMinimo,
      valorMaximo,
      longitudMinima,
      longitudMaxima,
      orden,
      categoria: categoria.trim() || 'General',
      variableSistema,
      nombreVariableSistema: variableSistema ? nombreVariableSistema : undefined,
      variableEpidemiologica,
      factorEpidemiologico: variableEpidemiologica ? factorEpidemiologico : undefined,
      variableIA,
      promptContextoIA: variableIA ? promptContextoIA : undefined,
      opciones: requiresOptions ? opciones : undefined,
      reglasDependencia
    };

    onSave(updatedPregunta);
    onClose();
  };

  if (!isOpen) return null;

  // Filter possible source questions for dependency rules (exclude current question)
  const availableSourceQuestions = allPreguntas.filter(p => p.id !== (pregunta?.id || ''));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl overflow-hidden my-8 text-left"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-1 border border-indigo-400/20">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Configuración Completa de Pregunta</span>
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">
              {pregunta ? 'Editar Pregunta' : 'Nueva Pregunta Personalizada'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header Navigation */}
        <div className="bg-slate-100/80 px-6 pt-3 border-b border-slate-200/80 flex gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-white text-indigo-700 shadow-2xs border-t border-x border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. Básico y Tipo
          </button>

          {requiresOptions && (
            <button
              type="button"
              onClick={() => setActiveTab('opciones')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'opciones'
                  ? 'bg-white text-indigo-700 shadow-2xs border-t border-x border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Opciones de Respuesta ({opciones.length})
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('validaciones')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'validaciones'
                ? 'bg-white text-indigo-700 shadow-2xs border-t border-x border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Validaciones y Rangos
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mapeo')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'mapeo'
                ? 'bg-white text-indigo-700 shadow-2xs border-t border-x border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4. Variables & IA
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('dependencias')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'dependencias'
                ? 'bg-white text-indigo-700 shadow-2xs border-t border-x border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
            <span>5. Lógica Ramificada ({reglasDependencia.length})</span>
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: GENERAL & TYPE */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              
              {/* Question Type Selector Grid */}
              <QuestionTypeSelector 
                selectedTipo={tipo} 
                onSelectTipo={(t) => setTipo(t)} 
              />

              <div className="border-t border-slate-100 pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1">
                    Título / Enunciado de la Pregunta <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej. ¿Consume usted cigarrillos o productos de tabaco?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Descripción / Instrucciones Adicionales
                  </label>
                  <textarea
                    rows={2}
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Explicación detallada para orientar al evaluado..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Placeholder (Texto de Relleno)
                    </label>
                    <input
                      type="text"
                      value={placeholder}
                      onChange={(e) => setPlaceholder(e.target.value)}
                      placeholder="Ej. Escriba su respuesta aquí..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Texto de Ayuda (Debajo del Campo)
                    </label>
                    <input
                      type="text"
                      value={textoAyuda}
                      onChange={(e) => setTextoAyuda(e.target.value)}
                      placeholder="Ej. Marque Sí para desplegar subpreguntas..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tooltip (Información flotante)
                    </label>
                    <input
                      type="text"
                      value={tooltip}
                      onChange={(e) => setTooltip(e.target.value)}
                      placeholder="Icono 'i' informativo"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Valor por Defecto
                    </label>
                    <input
                      type="text"
                      value={valorPorDefecto}
                      onChange={(e) => setValorPorDefecto(e.target.value)}
                      placeholder="Valor inicial opcional"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Categoría / Agrupador
                    </label>
                    <input
                      type="text"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      placeholder="Ej. Sociodemográfico"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Behavioral Switches */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={obligatoria}
                      onChange={(e) => setObligatoria(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">Respuesta Obligatoria</span>
                      <span className="text-[10px] text-slate-500 block">Campos requeridos (*)</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={visible}
                      onChange={(e) => setVisible(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">Visible por Defecto</span>
                      <span className="text-[10px] text-slate-500 block">Se muestra inicialmente</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editable}
                      onChange={(e) => setEditable(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                    />
                    <div>
                      <span className="text-xs font-extrabold text-slate-800 block">Campo Editable</span>
                      <span className="text-[10px] text-slate-500 block">Modificable por usuario</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OPTIONS EDITOR */}
          {activeTab === 'opciones' && requiresOptions && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Opciones de Respuesta ({opciones.length})
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Defina las etiquetas, valores y puntajes numéricos opcionales.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Opción</span>
                </button>
              </div>

              <div className="space-y-2">
                {opciones.map((op, idx) => (
                  <div key={op.id || idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                    <span className="text-xs font-black text-slate-400 w-6">#{idx + 1}</span>
                    
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={op.label}
                        onChange={(e) => handleUpdateOption(idx, 'label', e.target.value)}
                        placeholder="Etiqueta visible"
                        className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-bold text-slate-800"
                      />
                      <input
                        type="text"
                        value={op.value}
                        onChange={(e) => handleUpdateOption(idx, 'value', e.target.value)}
                        placeholder="Valor interno"
                        className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs font-mono text-slate-700"
                      />
                      <input
                        type="number"
                        value={op.puntaje ?? ''}
                        onChange={(e) => handleUpdateOption(idx, 'puntaje', parseFloat(e.target.value) || undefined)}
                        placeholder="Puntaje (ej: 1, 2, 5)"
                        className="px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-800"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: VALIDATIONS & RANGES */}
          {activeTab === 'validaciones' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  Configure límites numéricos, restricciones de longitud o expresiones regulares avanzadas (Regex) para garantizar la calidad e integridad de los datos recibidos.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor Mínimo (Números / Fechas)
                  </label>
                  <input
                    type="number"
                    value={valorMinimo ?? ''}
                    onChange={(e) => setValorMinimo(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Ej. 1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Valor Máximo (Números / Fechas)
                  </label>
                  <input
                    type="number"
                    value={valorMaximo ?? ''}
                    onChange={(e) => setValorMaximo(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Ej. 100"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Longitud Mínima de Caracteres
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={longitudMinima ?? ''}
                    onChange={(e) => setLongitudMinima(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Ej. 5"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Longitud Máxima de Caracteres
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={longitudMaxima ?? ''}
                    onChange={(e) => setLongitudMaxima(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Ej. 500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Expresión de Validación (Regex)
                </label>
                <input
                  type="text"
                  value={expresionValidacion}
                  onChange={(e) => setExpresionValidacion(e.target.value)}
                  placeholder="Ej. ^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mensaje Personalizado en Caso de Error
                </label>
                <input
                  type="text"
                  value={mensajeValidacionError}
                  onChange={(e) => setMensajeValidacionError(e.target.value)}
                  placeholder="Ej. Por favor ingrese un número telefónico válido de 10 dígitos"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>
          )}

          {/* TAB 4: MAPPINGS & AI */}
          {activeTab === 'mapeo' && (
            <div className="space-y-4">
              
              {/* Variable Sistema */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">Variable del Sistema</span>
                      <span className="text-[10px] text-slate-500 block">Vincula la respuesta a variables globales del perfil de empleado</span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={variableSistema}
                      onChange={(e) => setVariableSistema(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
                  </label>
                </div>

                {variableSistema && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre o Identificador de Variable del Sistema
                    </label>
                    <select
                      value={nombreVariableSistema}
                      onChange={(e) => setNombreVariableSistema(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                    >
                      <option value="">-- Seleccionar Variable --</option>
                      <option value="nombre_empleado">nombre_empleado (Nombre Trabajador)</option>
                      <option value="cedula">cedula (Número Identificación)</option>
                      <option value="correo">correo (Email Corporativo)</option>
                      <option value="telefono">telefono (Celular)</option>
                      <option value="fecha_nacimiento">fecha_nacimiento (Fecha Nacimiento)</option>
                      <option value="genero">genero (Sexo / Género)</option>
                      <option value="sede_id">sede_id (Sede Trabajo)</option>
                      <option value="area_id">area_id (Área Organizacional)</option>
                      <option value="cargo_id">cargo_id (Cargo Actual)</option>
                      <option value="coordenadas_gps">coordenadas_gps (Ubicación GPS)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Variable Epidemiologica */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">Variable Epidemiológica / Riesgo SG-SST</span>
                      <span className="text-[10px] text-slate-500 block">Alimenta tableros de morbilidad, estilos de vida y ausentismo</span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={variableEpidemiologica}
                      onChange={(e) => setVariableEpidemiologica(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
                  </label>
                </div>

                {variableEpidemiologica && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Factor Epidemiológico de Control
                    </label>
                    <input
                      type="text"
                      value={factorEpidemiologico}
                      onChange={(e) => setFactorEpidemiologico(e.target.value)}
                      placeholder="Ej. consumo_tabaco, sedentarismo, sintomas_ergonomicos, estres"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Variable IA */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-600" />
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">Habilitada para Análisis por Inteligencia Artificial (IA)</span>
                      <span className="text-[10px] text-slate-500 block">Incluye este campo en la síntesis semántica y diagnósticos automáticos</span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={variableIA}
                      onChange={(e) => setVariableIA(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600" />
                  </label>
                </div>

                {variableIA && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contexto o Instrucción de Análisis para la IA
                    </label>
                    <input
                      type="text"
                      value={promptContextoIA}
                      onChange={(e) => setPromptContextoIA(e.target.value)}
                      placeholder="Ej. Evaluar nivel de satisfacción y clasificar intenciones de renunciar"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white"
                    />
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: DEPENDENCIES / BRANCHING RULES */}
          {activeTab === 'dependencias' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <GitBranch className="w-4 h-4 text-indigo-600" />
                    <span>Reglas de Dependencia Condicional ({reglasDependencia.length})</span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Permite mostrar u ocultar esta pregunta según la respuesta en otra pregunta previa.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddRule}
                  disabled={availableSourceQuestions.length === 0}
                  className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1 transition-all ${
                    availableSourceQuestions.length === 0
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Regla</span>
                </button>
              </div>

              {availableSourceQuestions.length === 0 && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cree más preguntas previas en la encuesta para poder establecer reglas de dependencia entre ellas.</span>
                </div>
              )}

              <div className="space-y-3">
                {reglasDependencia.map((regla, idx) => (
                  <div key={regla.id || idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                      <span className="text-xs font-extrabold text-indigo-700">Regla #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRule(idx)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar Regla</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Si la pregunta origen:
                        </label>
                        <select
                          value={regla.preguntaOrigenId}
                          onChange={(e) => handleUpdateRule(idx, 'preguntaOrigenId', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 font-bold text-slate-800"
                        >
                          <option value="">-- Seleccionar Pregunta --</option>
                          {availableSourceQuestions.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.titulo.substring(0, 45)}... ({p.tipo})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Tiene el operador:
                        </label>
                        <select
                          value={regla.operador}
                          onChange={(e) => handleUpdateRule(idx, 'operador', e.target.value as OperadorRegla)}
                          className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 font-bold text-slate-800"
                        >
                          <option value="igual_a">Igual a (==)</option>
                          <option value="diferente_de">Diferente de (!=)</option>
                          <option value="contiene">Contiene texto / opción</option>
                          <option value="mayor_que">Mayor que (&gt;)</option>
                          <option value="menor_que">Menor que (&lt;)</option>
                          <option value="en_lista">Está en lista (separa con coma)</option>
                          <option value="respondida">Fue Respondida</option>
                          <option value="no_respondida">No ha sido Respondida</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Con el valor esperado:
                        </label>
                        <input
                          type="text"
                          value={regla.valorTarget}
                          onChange={(e) => handleUpdateRule(idx, 'valorTarget', e.target.value)}
                          placeholder="Ej. Sí, 10, Masculino"
                          className="w-full px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Entonces con ESTA pregunta:
                        </label>
                        <select
                          value={regla.accion}
                          onChange={(e) => handleUpdateRule(idx, 'accion', e.target.value as AccionRegla)}
                          className="w-full px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl font-black"
                        >
                          <option value="mostrar">MOSTRAR esta pregunta</option>
                          <option value="ocultar">OCULTAR esta pregunta</option>
                          <option value="requerir">HACER OBLIGATORIA esta pregunta</option>
                          <option value="deshabilitar">DESHABILITAR (Solo Lectura)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Save / Cancel */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Pregunta</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
