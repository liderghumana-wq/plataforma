import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Save, 
  AlertCircle, 
  HelpCircle, 
  Calendar, 
  User, 
  Layers, 
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { 
  PlanAccionItem, 
  NuevoPlanPayload, 
  OrigenHallazgo, 
  CategoriaPlan, 
  PrioridadPlan 
} from '../types/planesAccion.types';
import { planesAccionService } from '../services/planesAccionService';

interface ModalCrearEditarPlanProps {
  isOpen: boolean;
  onClose: () => void;
  onGuardar: (payload: NuevoPlanPayload) => void;
  companyId: string;
  planEditar?: PlanAccionItem | null;
}

const ORIGENES: Array<{ value: OrigenHallazgo; label: string }> = [
  { value: 'ALERTA_SST', label: 'Alerta del Sistema SG-SST' },
  { value: 'AUTOEVALUACION_0312', label: 'Autoevaluación Res. 0312/2019' },
  { value: 'CALIDAD_DATOS', label: 'Diagnóstico Calidad de Datos' },
  { value: 'AUDITORIA_INTERNA', label: 'Auditoría Interna SG-SST' },
  { value: 'INVESTIGACION_ACCIDENTE', label: 'Investigación de Accidente/Incidente' },
  { value: 'COMITE_COPASST', label: 'Comité COPASST' },
  { value: 'COMITE_CONVIVENCIA', label: 'Comité de Convivencia Laboral' },
  { value: 'INSPECCION_SEGURIDAD', label: 'Inspección de Seguridad / Puesto' },
  { value: 'ONBOARDING_NORMATIVO', label: 'Onboarding y Activación Normativa' },
  { value: 'DIAGNOSTICO_SOCIODEMOGRAFICO', label: 'Diagnóstico Sociodemográfico' },
  { value: 'SUGERENCIA_IA', label: 'Sugerencia de Inteligencia Artificial' }
];

export const ModalCrearEditarPlan: React.FC<ModalCrearEditarPlanProps> = ({
  isOpen,
  onClose,
  onGuardar,
  companyId,
  planEditar
}) => {
  if (!isOpen) return null;

  const nowStr = new Date().toISOString().split('T')[0];
  const defaultFutureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [titulo, setTitulo] = useState(planEditar?.titulo || '');
  const [descripcion, setDescripcion] = useState(planEditar?.descripcion || '');
  const [origen, setOrigen] = useState<OrigenHallazgo>(planEditar?.origen || 'ALERTA_SST');
  const [hallazgoDetalle, setHallazgoDetalle] = useState(planEditar?.hallazgoDetalle || '');
  const [causaRaiz, setCausaRaiz] = useState(planEditar?.causaRaiz || '');
  const [categoria, setCategoria] = useState<CategoriaPlan>(planEditar?.categoria || 'CORRECTIVA');
  const [prioridad, setPrioridad] = useState<PrioridadPlan>(planEditar?.prioridad || 'MEDIA');
  const [moduloRelacionado, setModuloRelacionado] = useState(planEditar?.moduloRelacionado || 'Gestión SG-SST');
  const [normaReferencia, setNormaReferencia] = useState(planEditar?.normaReferencia || 'Resolución 0312 de 2019');
  const [responsableNombre, setResponsableNombre] = useState(planEditar?.responsableNombre || 'Líder SG-SST');
  const [responsableCargo, setResponsableCargo] = useState(planEditar?.responsableCargo || 'Coordinador SG-SST');
  const [responsableEmail, setResponsableEmail] = useState(planEditar?.responsableEmail || '');
  const [fechaInicio, setFechaInicio] = useState(planEditar?.fechaInicio || nowStr);
  const [fechaObjetivo, setFechaObjetivo] = useState(planEditar?.fechaObjetivo || defaultFutureDate);

  const [sugeridoPorIa, setSugeridoPorIa] = useState(planEditar?.sugeridoPorIa || false);
  const [justificacionIa, setJustificacionIa] = useState(planEditar?.justificacionIa || '');
  const [iaLoading, setIaLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Asistencia Inteligente (Human-in-the-Loop)
  const handleConsultarIA = () => {
    if (!hallazgoDetalle && !titulo) {
      setErrorMsg('Escriba al menos un título o detalle del hallazgo para que el Asistente IA pueda analizar la causa raíz.');
      return;
    }

    setIaLoading(true);
    setErrorMsg(null);

    setTimeout(() => {
      const sugerencia = planesAccionService.sugerirAccionConIA(
        hallazgoDetalle || titulo,
        origen,
        companyId
      );

      setTitulo(prev => prev ? prev : sugerencia.tituloSugerido);
      setCausaRaiz(sugerencia.causaRaizSugerida);
      setDescripcion(sugerencia.accionesSugeridas);
      setPrioridad(sugerencia.prioridadSugerida);
      setCategoria(sugerencia.categoriaSugerida);
      setNormaReferencia(sugerencia.normaAsociada);
      setSugeridoPorIa(true);
      setJustificacionIa(sugerencia.justificacionTecnica);

      const plazoDate = new Date(Date.now() + sugerencia.plazoDiasRecomendado * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setFechaObjetivo(plazoDate);
      setIaLoading(false);
    }, 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!titulo.trim() || !hallazgoDetalle.trim() || !responsableNombre.trim()) {
      setErrorMsg('Por favor complete los campos obligatorios: Título, Detalle del Hallazgo y Responsable.');
      return;
    }

    if (fechaObjetivo < fechaInicio) {
      setErrorMsg('La fecha límite no puede ser anterior a la fecha de inicio.');
      return;
    }

    onGuardar({
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || hallazgoDetalle.trim(),
      origen,
      hallazgoDetalle: hallazgoDetalle.trim(),
      causaRaiz: causaRaiz.trim(),
      origenId: planEditar?.origenId,
      hallazgoId: planEditar?.hallazgoId,
      categoria,
      prioridad,
      moduloRelacionado,
      normaReferencia,
      responsableNombre: responsableNombre.trim(),
      responsableCargo: responsableCargo.trim(),
      responsableEmail: responsableEmail.trim() || undefined,
      fechaInicio,
      fechaObjetivo,
      sugeridoPorIa,
      justificacionIa
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
        
        {/* Cabecera */}
        <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold font-display">
                {planEditar ? `Editar Plan: ${planEditar.codigo}` : 'Nuevo Plan de Acción SG-SST'}
              </h2>
              <p className="text-xs text-slate-400">
                Ciclo de mejora continua: Hallazgo → Causa Raíz → Ejecución → Eficacia.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensaje de Error */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Banner Sugerencia IA si aplica */}
        {sugeridoPorIa && (
          <div className="mx-6 mt-4 p-3.5 bg-indigo-50/80 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block text-indigo-950">
                🤖 SUGERENCIA IA - REQUIERE VALIDACIÓN HUMANA
              </span>
              <span className="text-[11px] text-indigo-700 block mt-0.5">
                {justificacionIa || 'Campos pre-diligenciados según análisis predictivo. El Líder SG-SST debe revisar y ajustar antes de guardar.'}
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Fila 1: Origen y Asistente IA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Origen del Hallazgo / Alerta <span className="text-rose-500">*</span>
              </label>
              <select
                value={origen}
                onChange={(e) => setOrigen(e.target.value as OrigenHallazgo)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
              >
                {ORIGENES.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleConsultarIA}
                disabled={iaLoading}
                className="w-full py-2 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{iaLoading ? 'Analizando...' : 'Asistente IA (Sugerir Causa & Plan)'}</span>
              </button>
            </div>
          </div>

          {/* Fila 2: Título */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título del Plan de Acción <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Plan de Intervención por Incremento en Ausentismo Laboral"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Fila 3: Detalle del Hallazgo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Descripción del Hallazgo / Condición Insegura <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={hallazgoDetalle}
              onChange={(e) => setHallazgoDetalle(e.target.value)}
              placeholder="Describa la desviación detectada, el estándar no cumplido o el resultado del indicador de riesgo."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Fila 4: Análisis de Causa Raíz */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Análisis de Causa Raíz (5 Porqués / Espina de Pescado)
            </label>
            <input
              type="text"
              value={causaRaiz}
              onChange={(e) => setCausaRaiz(e.target.value)}
              placeholder="Ej: Falta de estandarización en el proceso de reporte y seguimiento oportuno."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Fila 5: Acciones a Desarrollar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Acciones Concretas a Ejecutar
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalle los pasos específicos a implementar (capacitación, inspección, control de ingeniería, etc.)."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Fila 6: Clasificación y Prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Categoría</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as CategoriaPlan)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="CORRECTIVA">Correctiva</option>
                <option value="PREVENTIVA">Preventiva</option>
                <option value="MEJORA">Mejora Continua</option>
                <option value="CUMPLIMIENTO_LEGAL">Cumplimiento Legal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Prioridad</label>
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value as PrioridadPlan)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              >
                <option value="ALTA">Alta (Crítica)</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Norma de Referencia</label>
              <input
                type="text"
                value={normaReferencia}
                onChange={(e) => setNormaReferencia(e.target.value)}
                placeholder="Ej: Res 0312 Est. 3.1.2"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Fila 7: Responsable */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Responsable Nombre <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={responsableNombre}
                onChange={(e) => setResponsableNombre(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cargo</label>
              <input
                type="text"
                value={responsableCargo}
                onChange={(e) => setResponsableCargo(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={responsableEmail}
                onChange={(e) => setResponsableEmail(e.target.value)}
                placeholder="correo@empresa.com"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>

          {/* Fila 8: Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Inicio</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fecha Límite Objetivo</label>
              <input
                type="date"
                value={fechaObjetivo}
                onChange={(e) => setFechaObjetivo(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Footer de Acciones */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{planEditar ? 'Actualizar Plan' : 'Crear Plan de Acción'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
