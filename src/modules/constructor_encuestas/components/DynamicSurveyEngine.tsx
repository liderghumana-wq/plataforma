import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  PenTool, 
  Upload, 
  Image as ImageIcon, 
  Calendar, 
  Clock, 
  Info, 
  HelpCircle, 
  Sparkles, 
  Send, 
  RotateCcw,
  AlertCircle,
  Save,
  BookmarkCheck,
  RefreshCw,
  FileCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EncuestaMeta, PreguntaConfig, RespuestaEncuestaItem } from '../types';
import { builderEncuestasService } from '../builder.service';
import { catalogosService } from '../../configuracion/catalogos.service';
import { parseOtroValue, isOtroOption } from '../otroHelper';

interface DynamicSurveyEngineProps {
  encuesta: EncuestaMeta | string; // Object or JSON string
  empresaId: string;
  onBack?: () => void;
  onSubmitSuccess?: (registro: any) => void;
  isTestMode?: boolean;
}

export function DynamicSurveyEngine({ 
  encuesta: rawEncuesta, 
  empresaId, 
  onBack, 
  onSubmitSuccess,
  isTestMode = false 
}: DynamicSurveyEngineProps) {

  // Parse JSON definition if string
  const encuesta: EncuestaMeta = typeof rawEncuesta === 'string' 
    ? JSON.parse(rawEncuesta) 
    : rawEncuesta;

  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [draftRestored, setDraftRestored] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Signature Canvas Refs
  const canvasRefs = useRef<Record<string, HTMLCanvasElement | null>>({});
  const [drawingState, setDrawingState] = useState<Record<string, boolean>>({});

  const currentSection = encuesta.secciones[currentSectionIdx] || encuesta.secciones[0];

  // 1. Check & Restore Auto-Save Draft on Mount
  useEffect(() => {
    const borrador = builderEncuestasService.getBorrador(empresaId, encuesta.id);
    if (borrador && borrador.respuestas && Object.keys(borrador.respuestas).length > 0) {
      setRespuestas(borrador.respuestas);
      if (borrador.currentSectionIdx < encuesta.secciones.length) {
        setCurrentSectionIdx(borrador.currentSectionIdx);
      }
      setLastSavedTime(borrador.lastSaved);
      setDraftRestored(true);
    }
  }, [empresaId, encuesta.id]);

  // 2. Auto-Save Progress to Draft on State Change
  useEffect(() => {
    if (Object.keys(respuestas).length > 0 && !isSubmitted) {
      const nowStr = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      builderEncuestasService.saveBorrador(empresaId, encuesta.id, {
        respuestas,
        currentSectionIdx,
        lastSaved: nowStr
      });
      setLastSavedTime(nowStr);
    }
  }, [respuestas, currentSectionIdx, empresaId, encuesta.id, isSubmitted]);

  // Handle value change for a question
  const handleAnswerChange = (preguntaId: string, value: any) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: value }));
    if (errors[preguntaId]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[preguntaId];
        return copy;
      });
    }
  };

  // Clear draft & start fresh
  const handleResetDraft = () => {
    if (confirm('¿Desea reiniciar todas las respuestas de este formulario?')) {
      builderEncuestasService.clearBorrador(empresaId, encuesta.id);
      setRespuestas({});
      setCurrentSectionIdx(0);
      setErrors({});
      setDraftRestored(false);
      setLastSavedTime(null);
    }
  };

  // GPS Capture Handler
  const handleCaptureGPS = (preguntaId: string) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude.toFixed(6);
          const lng = pos.coords.longitude.toFixed(6);
          handleAnswerChange(preguntaId, {
            latitude: lat,
            longitude: lng,
            address: `Lat: ${lat}, Lng: ${lng}`,
            timestamp: new Date().toISOString()
          });
        },
        () => {
          // Geolocation permission denied or unavailable
          handleAnswerChange(preguntaId, {
            latitude: null,
            longitude: null,
            address: "Ubicación GPS no autorizada o no disponible",
            timestamp: new Date().toISOString()
          });
        }
      );
    } else {
      handleAnswerChange(preguntaId, {
        latitude: null,
        longitude: null,
        address: "Dispositivo sin soporte para Geolocalización GPS",
        timestamp: new Date().toISOString()
      });
    }
  };

  // Canvas Signature Mouse/Touch Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, pregId: string) => {
    const canvas = canvasRefs.current[pregId];
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setDrawingState(prev => ({ ...prev, [pregId]: true }));
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, pregId: string) => {
    if (!drawingState[pregId]) return;
    const canvas = canvasRefs.current[pregId];
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = (pregId: string) => {
    setDrawingState(prev => ({ ...prev, [pregId]: false }));
    const canvas = canvasRefs.current[pregId];
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      handleAnswerChange(pregId, dataUrl);
    }
  };

  const clearCanvas = (pregId: string) => {
    const canvas = canvasRefs.current[pregId];
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      handleAnswerChange(pregId, null);
    }
  };

  // Comprehensive Dynamic Validation Engine
  const validateCurrentSection = () => {
    const newErrors: Record<string, string> = {};
    if (!currentSection) return true;

    for (const preg of currentSection.preguntas) {
      // Evaluate visibility & rules dynamically
      const ruleState = builderEncuestasService.evaluarReglasPregunta(preg, respuestas);
      if (!ruleState.visible) continue;

      const val = respuestas[preg.id];

      // Obligatoria check
      if (ruleState.obligatoria) {
        if (
          val === undefined || 
          val === null || 
          val === '' || 
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === 'object' && !val.fileName && !val.latitude && !val.length && !val.option)
        ) {
          newErrors[preg.id] = 'Esta pregunta es obligatoria.';
          continue;
        }
      }

      // Prompt 22: "Otro" option specification validation
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          for (const item of val) {
            const parsedOtro = parseOtroValue(item);
            if (parsedOtro.isOtro && (!parsedOtro.otherValue || parsedOtro.otherValue.trim() === '')) {
              newErrors[preg.id] = 'Debe especificar el detalle en el campo obligatorio "¿Cuál?" al seleccionar "Otro".';
              break;
            }
          }
        } else {
          const parsedOtro = parseOtroValue(val);
          if (parsedOtro.isOtro && (!parsedOtro.otherValue || parsedOtro.otherValue.trim() === '')) {
            newErrors[preg.id] = 'Debe especificar el detalle en el campo obligatorio "¿Cuál?" al seleccionar "Otro".';
          }
        }
      }

      // Skip format checks if empty and optional
      if (val === undefined || val === null || val === '') continue;

      // Numeric range check
      if (preg.tipo === 'numero') {
        const num = parseFloat(val);
        if (preg.valorMinimo !== undefined && num < preg.valorMinimo) {
          newErrors[preg.id] = `El valor mínimo permitido es ${preg.valorMinimo}.`;
        } else if (preg.valorMaximo !== undefined && num > preg.valorMaximo) {
          newErrors[preg.id] = `El valor máximo permitido es ${preg.valorMaximo}.`;
        }
      }

      // Text length check
      if ((preg.tipo === 'texto' || preg.tipo === 'texto_largo') && typeof val === 'string') {
        if (preg.longitudMinima !== undefined && val.length < preg.longitudMinima) {
          newErrors[preg.id] = `Debe ingresar mínimo ${preg.longitudMinima} caracteres.`;
        } else if (preg.longitudMaxima !== undefined && val.length > preg.longitudMaxima) {
          newErrors[preg.id] = `No puede exceder los ${preg.longitudMaxima} caracteres.`;
        }
      }

      // Email format check
      if (preg.tipo === 'correo' && typeof val === 'string') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          newErrors[preg.id] = 'Ingrese una dirección de correo electrónico válida (ej. usuario@dominio.com).';
        }
      }

      // Custom Regex pattern check
      const pattern = preg.patronRegex || preg.expresionValidacion;
      if (pattern && typeof val === 'string') {
        try {
          const reg = new RegExp(pattern);
          if (!reg.test(val)) {
            newErrors[preg.id] = preg.mensajeErrorRegex || preg.mensajeValidacionError || 'El formato ingresado no es válido.';
          }
        } catch (e) {
          // Invalid regex string ignore
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateCurrentSection()) {
      if (currentSectionIdx < encuesta.secciones.length - 1) {
        setCurrentSectionIdx(prev => prev + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmitFinal();
      }
    }
  };

  const handlePrev = () => {
    if (currentSectionIdx > 0) {
      setCurrentSectionIdx(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final submission processing
  const handleSubmitFinal = () => {
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    const mappedResponses: Record<string, RespuestaEncuestaItem> = {};
    encuesta.secciones.forEach(sec => {
      sec.preguntas.forEach(preg => {
        if (respuestas[preg.id] !== undefined) {
          mappedResponses[preg.id] = {
            preguntaId: preg.id,
            preguntaTitulo: preg.titulo,
            tipo: preg.tipo,
            valor: respuestas[preg.id],
            categoria: preg.categoria,
            factorEpidemiologico: preg.factorEpidemiologico
          };
        }
      });
    });

    const registroGuardado = builderEncuestasService.saveRespuesta(empresaId, {
      encuestaId: encuesta.id,
      versionEncuesta: encuesta.version || 1,
      versionLabel: `v${encuesta.version || 1}.0`,
      empresaId,
      tiempoCompletadoSegundos: durationSeconds,
      respuestas: mappedResponses,
      usuarioNombre: respuestas['preg-1-nombre'] || 'Usuario Evaluado',
      usuarioIdentificacion: respuestas['preg-2-documento'] || 'No especificado'
    });

    // Clear auto-save draft after successful completion
    builderEncuestasService.clearBorrador(empresaId, encuesta.id);

    setIsSubmitted(true);
    if (onSubmitSuccess) {
      onSubmitSuccess(registroGuardado);
    }
  };

  // Submission Completed View
  if (isSubmitted) {
    return (
      <div className="max-w-xl mx-auto my-12 text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6 animate-scale-up text-slate-800">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-black text-slate-900">
            ¡Encuesta Diligenciada con Éxito!
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Sus respuestas han sido procesadas dinámicamente y consolidadas en los indicadores institucionales de la empresa.
          </p>
        </div>

        <div className="pt-4 flex justify-center gap-3">
          <button
            onClick={() => {
              setIsSubmitted(false);
              setRespuestas({});
              setCurrentSectionIdx(0);
              setDraftRestored(false);
              setLastSavedTime(null);
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Responder Nuevamente</span>
          </button>

          {onBack && (
            <button
              onClick={onBack}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer"
            >
              Volver al Módulo
            </button>
          )}
        </div>
      </div>
    );
  }

  // Resolve dynamic options from company catalogs if variable system matches catalog
  const getResolvedOptions = (preg: PreguntaConfig) => {
    if (preg.nombreVariableSistema) {
      const sysVar = preg.nombreVariableSistema.toLowerCase().trim();
      const catalogs = catalogosService.getCatalogsSync(empresaId);
      
      let catalogItems: any[] = [];
      if (sysVar === 'sede' || sysVar === 'sedes') catalogItems = catalogs.sedes || [];
      else if (sysVar === 'area' || sysVar === 'areas') catalogItems = catalogs.areas || [];
      else if (sysVar === 'proceso' || sysVar === 'procesos') catalogItems = catalogs.procesos || [];
      else if (sysVar === 'subproceso' || sysVar === 'subprocesos') catalogItems = catalogs.subprocesos || [];
      else if (sysVar === 'proyecto' || sysVar === 'proyectos') catalogItems = catalogs.proyectos || [];
      else if (sysVar === 'cargo' || sysVar === 'cargos') catalogItems = catalogs.cargos || [];
      else if (sysVar === 'tipo_contrato' || sysVar === 'tiposcontrato') catalogItems = catalogs.tiposContrato || [];
      else if (sysVar === 'modalidad' || sysVar === 'modalidadestrabajo') catalogItems = catalogs.modalidadesTrabajo || [];
      else if (sysVar === 'jornada' || sysVar === 'jornadas') catalogItems = catalogs.jornadas || [];
      else if (sysVar === 'turno' || sysVar === 'turnos') catalogItems = catalogs.turnos || [];
      else if (sysVar === 'ciudad' || sysVar === 'ciudades') catalogItems = catalogs.ciudades || [];
      else if (sysVar === 'departamento' || sysVar === 'departamentos') catalogItems = catalogs.departamentos || [];

      if (catalogItems.length > 0) {
        return catalogItems.map(item => ({
          id: item.id || item.codigo || item.nombre,
          label: item.nombre,
          value: item.nombre
        }));
      }
    }
    return preg.opciones || [];
  };

  const progressPct = Math.round(((currentSectionIdx + 1) / encuesta.secciones.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left text-slate-800">
      
      {/* Dynamic Survey Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/20 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-300" />
              <span>{isTestMode ? 'Modo Simulación / Pruebas' : 'Ejecución Dinámica'}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono font-bold">
              {encuesta.codigo}
            </span>
          </div>

          <h2 className="text-lg font-black text-white tracking-tight">
            {encuesta.titulo}
          </h2>

          <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
            {encuesta.descripcion}
          </p>
        </div>

        {onBack && (
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Auto-Save & Draft Restored Toast Bar */}
      {lastSavedTime && (
        <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-2xl flex items-center justify-between text-xs text-indigo-950">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-4 h-4 text-indigo-600" />
            <span>
              <strong>Guardado Automático Activo:</strong> borrador sincronizado a las {lastSavedTime}
            </span>
          </div>

          <button
            onClick={handleResetDraft}
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 underline cursor-pointer"
          >
            Reiniciar Respuestas
          </button>
        </div>
      )}

      {/* Dynamic Progress Bar & Stepper */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Sección {currentSectionIdx + 1} de {encuesta.secciones.length}: <strong className="text-slate-900">{currentSection?.titulo}</strong></span>
          <span className="text-indigo-600 font-extrabold">{progressPct}%</span>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Dynamic Questions Renderer Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-8">
        <div>
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
            {currentSection?.titulo}
          </h3>
          {currentSection?.descripcion && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {currentSection.descripcion}
            </p>
          )}
        </div>

        <div className="space-y-6">
          {currentSection?.preguntas.map((preg) => {
            
            // Dynamic Dependency Rule Evaluator Engine
            const ruleState = builderEncuestasService.evaluarReglasPregunta(preg, respuestas);
            if (!ruleState.visible) return null; // Hide if dependency rule requires hidden

            const value = respuestas[preg.id];
            const error = errors[preg.id];

            return (
              <motion.div
                key={preg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  error ? 'bg-rose-50/40 border-rose-300 ring-2 ring-rose-200' : 'bg-slate-50/50 border-slate-200/80 hover:border-slate-300'
                }`}
              >
                {/* Question Label Header */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <label className="text-xs font-extrabold text-slate-900 leading-snug block">
                      {preg.titulo}
                      {ruleState.obligatoria && (
                        <span className="text-rose-500 ml-1 font-bold">*</span>
                      )}
                    </label>

                    {preg.tooltip && (
                      <span className="p-1 text-slate-400 hover:text-indigo-600 cursor-help" title={preg.tooltip}>
                        <Info className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {preg.descripcion && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      {preg.descripcion}
                    </p>
                  )}
                </div>

                {/* 19 Question Types Dynamic Input Controls */}
                <div>
                  
                  {/* TEXTO */}
                  {preg.tipo === 'texto' && (
                    <input
                      type="text"
                      disabled={!ruleState.habilitada}
                      placeholder={preg.placeholder || 'Escriba su respuesta...'}
                      value={value || ''}
                      onChange={(e) => handleAnswerChange(preg.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  )}

                  {/* NUMERO */}
                  {preg.tipo === 'numero' && (
                    <input
                      type="number"
                      disabled={!ruleState.habilitada}
                      min={preg.valorMinimo}
                      max={preg.valorMaximo}
                      placeholder={preg.placeholder || 'Ingrese valor numérico'}
                      value={value || ''}
                      onChange={(e) => handleAnswerChange(preg.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  )}

                  {/* FECHA */}
                  {preg.tipo === 'fecha' && (
                    <input
                      type="date"
                      disabled={!ruleState.habilitada}
                      value={value || ''}
                      onChange={(e) => handleAnswerChange(preg.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  )}

                  {/* HORA */}
                  {preg.tipo === 'hora' && (
                    <input
                      type="time"
                      disabled={!ruleState.habilitada}
                      value={value || ''}
                      onChange={(e) => handleAnswerChange(preg.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  )}

                  {/* CORREO */}
                  {preg.tipo === 'correo' && (
                    <input
                      type="email"
                      disabled={!ruleState.habilitada}
                      placeholder={preg.placeholder || 'correo@ejemplo.com'}
                      value={value || ''}
                      onChange={(e) => handleAnswerChange(preg.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  )}

                  {/* TELEFONO */}
                  {preg.tipo === 'telefono' && (
                    <input
                      type="tel"
                      disabled={!ruleState.habilitada}
                      placeholder={preg.placeholder || 'Ej. 3001234567'}
                      value={value || ''}
                      onChange={(e) => handleAnswerChange(preg.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  )}

                  {/* LISTA (SELECT) */}
                  {preg.tipo === 'lista' && (() => {
                    const parsed = parseOtroValue(value);
                    const options = getResolvedOptions(preg);
                    const selectedOptionValue = parsed.isOtro ? (options.find(o => isOtroOption(o.value) || isOtroOption(o.label))?.value || 'OTRO') : (typeof value === 'object' ? value.option : (value || ''));

                    return (
                      <div className="space-y-2">
                        <select
                          disabled={!ruleState.habilitada}
                          value={selectedOptionValue}
                          onChange={(e) => {
                            const selectedVal = e.target.value;
                            const isSelectedOtro = isOtroOption(selectedVal) || options.some(o => o.value === selectedVal && (isOtroOption(o.value) || isOtroOption(o.label)));
                            if (isSelectedOtro) {
                              handleAnswerChange(preg.id, { option: selectedVal || 'OTRO', otherValue: parsed.otherValue || '' });
                            } else {
                              handleAnswerChange(preg.id, selectedVal);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                        >
                          <option value="">-- Seleccionar Opción --</option>
                          {options.map(op => (
                            <option key={op.id} value={op.value}>{op.label}</option>
                          ))}
                        </select>

                        {parsed.isOtro && (
                          <div className="space-y-1 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                            <label className="text-[11px] font-extrabold text-amber-950 flex items-center justify-between">
                              <span>¿Cuál? <span className="text-rose-500 font-bold">*</span></span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {parsed.otherValue.length} / {preg.limiteCaracteresOtro || 250}
                              </span>
                            </label>
                            <input
                              type="text"
                              disabled={!ruleState.habilitada}
                              maxLength={preg.limiteCaracteresOtro || 250}
                              placeholder="Especifique detalladamente su respuesta..."
                              value={parsed.otherValue}
                              onChange={(e) => {
                                handleAnswerChange(preg.id, {
                                  option: selectedOptionValue || 'OTRO',
                                  otherValue: e.target.value
                                });
                              }}
                              className="w-full px-3.5 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* RADIO */}
                  {preg.tipo === 'radio' && (
                    <div className="space-y-2">
                      {getResolvedOptions(preg).map(op => {
                        const parsed = parseOtroValue(value);
                        const isThisOtroOption = isOtroOption(op.value) || isOtroOption(op.label);
                        const isChecked = isThisOtroOption
                          ? parsed.isOtro
                          : (value === op.value || (typeof value === 'object' && value?.option === op.value));

                        return (
                          <div key={op.id} className="space-y-2">
                            <label className={`flex items-center gap-2.5 p-2.5 bg-white rounded-xl border transition-all cursor-pointer ${
                              isChecked ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-200/80 hover:border-indigo-300'
                            }`}>
                              <input
                                type="radio"
                                name={preg.id}
                                disabled={!ruleState.habilitada}
                                checked={isChecked}
                                onChange={() => {
                                  if (isThisOtroOption) {
                                    handleAnswerChange(preg.id, { option: op.value || 'OTRO', otherValue: parsed.otherValue || '' });
                                  } else {
                                    handleAnswerChange(preg.id, op.value);
                                  }
                                }}
                                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                              />
                              <span className="text-xs font-bold text-slate-800">{op.label}</span>
                            </label>

                            {isThisOtroOption && isChecked && (
                              <div className="ml-6 space-y-1 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                                <label className="text-[11px] font-extrabold text-amber-950 flex items-center justify-between">
                                  <span>¿Cuál? <span className="text-rose-500 font-bold">*</span></span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {parsed.otherValue.length} / {preg.limiteCaracteresOtro || 250}
                                  </span>
                                </label>
                                <input
                                  type="text"
                                  disabled={!ruleState.habilitada}
                                  maxLength={preg.limiteCaracteresOtro || 250}
                                  placeholder="Especifique detalladamente su respuesta..."
                                  value={parsed.otherValue}
                                  onChange={(e) => {
                                    handleAnswerChange(preg.id, {
                                      option: op.value || 'OTRO',
                                      otherValue: e.target.value
                                    });
                                  }}
                                  className="w-full px-3.5 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* CHECKBOX SINGLE */}
                  {preg.tipo === 'checkbox' && (
                    <label className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        disabled={!ruleState.habilitada}
                        checked={!!value}
                        onChange={(e) => handleAnswerChange(preg.id, e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-800">{preg.placeholder || 'Acepto y confirmo'}</span>
                    </label>
                  )}

                  {/* SINO (YES/NO) */}
                  {preg.tipo === 'sino' && (
                    <div className="flex items-center gap-3">
                      {['Sí', 'No'].map(optionVal => (
                        <button
                          key={optionVal}
                          type="button"
                          disabled={!ruleState.habilitada}
                          onClick={() => handleAnswerChange(preg.id, optionVal)}
                          className={`flex-1 py-2.5 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                            value === optionVal
                              ? optionVal === 'Sí' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-rose-600 text-white border-rose-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {optionVal}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* MULTIPLE SELECCION (CHIPS) */}
                  {preg.tipo === 'multiple_seleccion' && (() => {
                    const selectedList: any[] = Array.isArray(value) ? value : [];
                    const options = getResolvedOptions(preg);

                    const otroInSelection = selectedList.find(item => {
                      if (typeof item === 'object') return isOtroOption(item.option);
                      return isOtroOption(item);
                    });

                    const parsedOtro = parseOtroValue(otroInSelection);

                    return (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {options.map(op => {
                            const isThisOtro = isOtroOption(op.value) || isOtroOption(op.label);
                            const isSelected = selectedList.some(item => {
                              if (isThisOtro) {
                                return typeof item === 'object' ? isOtroOption(item.option) : isOtroOption(item);
                              }
                              return (typeof item === 'object' ? item.option : item) === op.value;
                            });

                            return (
                              <button
                                key={op.id}
                                type="button"
                                disabled={!ruleState.habilitada}
                                onClick={() => {
                                  if (isSelected) {
                                    const newList = selectedList.filter(item => {
                                      if (isThisOtro) {
                                        return !(typeof item === 'object' ? isOtroOption(item.option) : isOtroOption(item));
                                      }
                                      return (typeof item === 'object' ? item.option : item) !== op.value;
                                    });
                                    handleAnswerChange(preg.id, newList);
                                  } else {
                                    if (isThisOtro) {
                                      const newList = [...selectedList, { option: op.value || 'OTRO', otherValue: '' }];
                                      handleAnswerChange(preg.id, newList);
                                    } else {
                                      const newList = [...selectedList, op.value];
                                      handleAnswerChange(preg.id, newList);
                                    }
                                  }
                                }}
                                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                {isSelected ? '✓ ' : '+ '}{op.label}
                              </button>
                            );
                          })}
                        </div>

                        {otroInSelection !== undefined && (
                          <div className="space-y-1 p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                            <label className="text-[11px] font-extrabold text-amber-950 flex items-center justify-between">
                              <span>¿Cuál? (Especificar Opción "Otro") <span className="text-rose-500 font-bold">*</span></span>
                              <span className="text-[10px] font-mono text-slate-500">
                                {parsedOtro.otherValue.length} / {preg.limiteCaracteresOtro || 250}
                              </span>
                            </label>
                            <input
                              type="text"
                              disabled={!ruleState.habilitada}
                              maxLength={preg.limiteCaracteresOtro || 250}
                              placeholder="Especifique detalladamente su respuesta..."
                              value={parsedOtro.otherValue}
                              onChange={(e) => {
                                const updatedText = e.target.value;
                                const newList = selectedList.map(item => {
                                  const isItemOtro = typeof item === 'object' ? isOtroOption(item.option) : isOtroOption(item);
                                  if (isItemOtro) {
                                    const optVal = typeof item === 'object' ? item.option : 'OTRO';
                                    return { option: optVal, otherValue: updatedText };
                                  }
                                  return item;
                                });
                                handleAnswerChange(preg.id, newList);
                              }}
                              className="w-full px-3.5 py-2 bg-white rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* TEXTO LARGO */}
                  {preg.tipo === 'texto_largo' && (
                    <textarea
                      rows={3}
                      disabled={!ruleState.habilitada}
                      placeholder={preg.placeholder || 'Escriba sus observaciones detalladas...'}
                      value={value || ''}
                      onChange={(e) => handleAnswerChange(preg.id, e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  )}

                  {/* ESCALA LIKERT */}
                  {preg.tipo === 'escala_likert' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-5 gap-2">
                        {(preg.opciones || [
                          { id: '1', label: '1', value: '1' },
                          { id: '2', label: '2', value: '2' },
                          { id: '3', label: '3', value: '3' },
                          { id: '4', label: '4', value: '4' },
                          { id: '5', label: '5', value: '5' }
                        ]).map(op => (
                          <button
                            key={op.id}
                            type="button"
                            disabled={!ruleState.habilitada}
                            onClick={() => handleAnswerChange(preg.id, op.value)}
                            className={`py-3 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                              value === op.value
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-xs font-black block">{op.value}</span>
                            <span className="text-[9px] font-semibold block truncate mt-0.5 opacity-90">{op.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ESCALA NUMERICA (0-10) */}
                  {preg.tipo === 'escala_numerica' && (
                    <div className="grid grid-cols-11 gap-1">
                      {Array.from({ length: 11 }, (_, i) => String(i)).map(valStr => (
                        <button
                          key={valStr}
                          type="button"
                          disabled={!ruleState.habilitada}
                          onClick={() => handleAnswerChange(preg.id, valStr)}
                          className={`py-2 rounded-lg border text-xs font-black transition-all cursor-pointer ${
                            value === valStr
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {valStr}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* NPS (0-10) */}
                  {preg.tipo === 'nps' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-11 gap-1">
                        {Array.from({ length: 11 }, (_, i) => String(i)).map(valStr => {
                          const num = parseInt(valStr);
                          let colorClass = 'bg-rose-50 text-rose-700 border-rose-200';
                          if (num >= 7 && num <= 8) colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
                          if (num >= 9) colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';

                          if (value === valStr) {
                            colorClass = 'bg-indigo-600 text-white border-indigo-600 ring-2 ring-indigo-300';
                          }

                          return (
                            <button
                              key={valStr}
                              type="button"
                              disabled={!ruleState.habilitada}
                              onClick={() => handleAnswerChange(preg.id, valStr)}
                              className={`py-2.5 rounded-lg border text-xs font-black transition-all cursor-pointer ${colorClass}`}
                            >
                              {valStr}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-[10px] font-extrabold text-slate-400 px-1">
                        <span className="text-rose-600">0 - 6: Detractores</span>
                        <span className="text-amber-600">7 - 8: Pasivos</span>
                        <span className="text-emerald-600">9 - 10: Promotores</span>
                      </div>
                    </div>
                  )}

                  {/* ARCHIVO / IMAGEN */}
                  {(preg.tipo === 'archivo' || preg.tipo === 'imagen') && (
                    <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 text-center space-y-2">
                      <Upload className="w-6 h-6 text-indigo-500 mx-auto" />
                      <div className="text-xs">
                        <span className="font-bold text-slate-800">Cargar {preg.tipo === 'imagen' ? 'Fotografía' : 'Documento'}</span>
                        <p className="text-[10px] text-slate-400">PDF, PNG, JPG, Word (Máx 10MB)</p>
                      </div>
                      <input
                        type="file"
                        accept={preg.tipo === 'imagen' ? 'image/*' : '*/*'}
                        disabled={!ruleState.habilitada}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleAnswerChange(preg.id, {
                              fileName: file.name,
                              fileSize: `${(file.size / 1024).toFixed(1)} KB`,
                              fileType: file.type
                            });
                          }
                        }}
                        className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 cursor-pointer"
                      />
                      {value && typeof value === 'object' && value.fileName && (
                        <div className="p-2 bg-indigo-50 rounded-xl text-xs font-bold text-indigo-900 inline-block">
                          ✓ Adjuntado: {value.fileName} ({value.fileSize})
                        </div>
                      )}
                    </div>
                  )}

                  {/* FIRMA DIGITAL */}
                  {preg.tipo === 'firma' && (
                    <div className="space-y-2">
                      <div className="bg-white p-2 rounded-2xl border border-slate-300 relative">
                        <canvas
                          ref={(el) => { canvasRefs.current[preg.id] = el; }}
                          width={450}
                          height={120}
                          onMouseDown={(e) => startDrawing(e, preg.id)}
                          onMouseMove={(e) => draw(e, preg.id)}
                          onMouseUp={() => stopDrawing(preg.id)}
                          onTouchStart={(e) => startDrawing(e, preg.id)}
                          onTouchMove={(e) => draw(e, preg.id)}
                          onTouchEnd={() => stopDrawing(preg.id)}
                          className="w-full h-28 bg-slate-50 rounded-xl touch-none cursor-crosshair border border-slate-200"
                        />
                        <div className="absolute top-3 left-4 pointer-events-none text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                          Lienzo de Firma Táctil / Mouse
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium">
                          {value ? '✓ Firma Capturada' : 'Dibuje su firma en el recuadro superior'}
                        </span>
                        <button
                          type="button"
                          onClick={() => clearCanvas(preg.id)}
                          className="px-2.5 py-1 text-[10px] font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 cursor-pointer"
                        >
                          Limpiar Firma
                        </button>
                      </div>
                    </div>
                  )}

                  {/* UBICACION GPS */}
                  {preg.tipo === 'ubicacion_gps' && (
                    <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            {value ? `Ubicación: ${value.address}` : 'Geolocalización Inactiva'}
                          </span>
                          <span className="text-[10px] text-slate-500 block">
                            {value ? `Coordenadas: ${value.latitude}, ${value.longitude}` : 'Presione para registrar coordenadas GPS'}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCaptureGPS(preg.id)}
                        className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                      >
                        {value ? 'Recapturar GPS' : 'Obtener GPS'}
                      </button>
                    </div>
                  )}

                </div>

                {/* Question Helper Text */}
                {preg.textoAyuda && (
                  <p className="text-[10px] text-slate-500 font-medium">
                    {preg.textoAyuda}
                  </p>
                )}

                {/* Error Message */}
                {error && (
                  <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{error}</span>
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentSectionIdx === 0}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
              currentSectionIdx === 0
                ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>{currentSectionIdx === encuesta.secciones.length - 1 ? 'Finalizar Encuesta' : 'Siguiente Sección'}</span>
            {currentSectionIdx === encuesta.secciones.length - 1 ? (
              <Send className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
