import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Award, 
  FileCheck, 
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Cpu,
  UserCheck
} from 'lucide-react';
import { PlanAccionItem, VerificacionEficaciaPayload } from '../types/planesAccion.types';

interface VerificacionEficaciaPanelProps {
  plan: PlanAccionItem;
  indicadoresDisponibles: Array<{
    id: string;
    nombre: string;
    valorActual: number | string;
    unidad: string;
    fuente: 'CENTRAL_INDICATOR_ENGINE' | 'DATA_QUALITY_ENGINE' | 'CUMPLIMIENTO_NORMATIVO' | 'MANUAL';
  }>;
  onGuardarVerificacion: (payload: VerificacionEficaciaPayload) => void;
  onCancelar?: () => void;
  currentUser?: { nombre: string; rol: string };
  readOnly?: boolean;
}

export const VerificacionEficaciaPanel: React.FC<VerificacionEficaciaPanelProps> = ({
  plan,
  indicadoresDisponibles,
  onGuardarVerificacion,
  onCancelar,
  currentUser = { nombre: 'Líder SG-SST', rol: 'Líder SG-SST' },
  readOnly = false
}) => {
  const existingVerif = plan.verificacionEficacia;

  const [selectedIndId, setSelectedIndId] = useState<string>(
    existingVerif?.indicadorIdAsociado || indicadoresDisponibles[0]?.id || ''
  );

  const selectedInd = indicadoresDisponibles.find(i => i.id === selectedIndId);

  const [lineaBase, setLineaBase] = useState<string>(
    existingVerif?.valorLineaBase !== undefined 
      ? String(existingVerif.valorLineaBase) 
      : String(selectedInd?.valorActual ?? '0')
  );

  const [postIntervencion, setPostIntervencion] = useState<string>(
    existingVerif?.valorPostIntervencion !== undefined ? String(existingVerif.valorPostIntervencion) : ''
  );

  const [unidadMedida, setUnidadMedida] = useState<string>(
    existingVerif?.unidadMedida || selectedInd?.unidad || '%'
  );

  const [criterio, setCriterio] = useState<string>(
    existingVerif?.criterioEficacia || 'Disminución del indicador de riesgo o incremento en la cobertura normativa.'
  );

  const [resultado, setResultado] = useState<'EFICAZ' | 'NO_EFICAZ'>(
    existingVerif?.resultado === 'NO_EFICAZ' ? 'NO_EFICAZ' : 'EFICAZ'
  );

  const [verificadorNombre, setVerificadorNombre] = useState<string>(
    existingVerif?.verificadoPor || currentUser.nombre
  );

  const [verificadorCargo, setVerificadorCargo] = useState<string>(
    existingVerif?.cargoVerificador || currentUser.rol
  );

  const [licenciaSst, setLicenciaSst] = useState<string>(
    existingVerif?.licenciaSstVerificador || 'LIC-SST-2024-CO'
  );

  const [observaciones, setObservaciones] = useState<string>(
    existingVerif?.observacionesTecnicas || ''
  );

  const [humanCheck, setHumanCheck] = useState<boolean>(
    existingVerif?.validacionHumanaExplicita || false
  );

  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  const handleIndicatorChange = (indId: string) => {
    setSelectedIndId(indId);
    const target = indicadoresDisponibles.find(i => i.id === indId);
    if (target) {
      setLineaBase(String(target.valorActual));
      setUnidadMedida(target.unidad);
    }
  };

  const handleGuardar = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorValidacion(null);

    if (plan.porcentajeAvance < 100) {
      setErrorValidacion('La acción debe tener un 100% de ejecución física antes de emitir un dictamen de eficacia.');
      return;
    }

    if (!plan.evidencias || plan.evidencias.length === 0) {
      setErrorValidacion('Debe existir al menos una evidencia documental cargada antes de verificar la eficacia.');
      return;
    }

    if (!observaciones || observaciones.trim().length < 15) {
      setErrorValidacion('Debe registrar una observación técnica explicativa de al menos 15 caracteres.');
      return;
    }

    if (!humanCheck) {
      setErrorValidacion('Debe marcar la casilla de verificación humana obligatoria (Human-in-the-Loop).');
      return;
    }

    onGuardarVerificacion({
      indicadorIdAsociado: selectedIndId,
      nombreIndicador: selectedInd?.nombre || 'Indicador SG-SST',
      fuenteIndicador: selectedInd?.fuente || 'CENTRAL_INDICATOR_ENGINE',
      valorLineaBase: lineaBase,
      unidadMedida,
      valorPostIntervencion: postIntervencion || lineaBase,
      criterioEficacia: criterio,
      resultado,
      verificadoPor: verificadorNombre,
      cargoVerificador: verificadorCargo,
      licenciaSstVerificador: licenciaSst,
      observacionesTecnicas: observaciones
    });
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
      
      {/* Cabezote del Panel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 font-display">
                Protocolo Técnico de Verificación de Eficacia
              </h3>
              <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-black uppercase">
                Human-In-The-Loop
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluación del impacto real de la medida correctiva sobre los indicadores de Seguridad y Salud.
            </p>
          </div>
        </div>

        {existingVerif && (
          <div className={`px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2 ${
            existingVerif.resultado === 'EFICAZ'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-rose-100 text-rose-800 border border-rose-300'
          }`}>
            {existingVerif.resultado === 'EFICAZ' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>DICTAMEN ACTUAL: {existingVerif.resultado}</span>
          </div>
        )}
      </div>

      {/* Regla de No Automatización por IA */}
      <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200/90 text-xs text-amber-900 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">
            Principio Regulatorio de Validación Humana Indelegable:
          </p>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            La Inteligencia Artificial (Gemini / People Copilot) puede sugerir causas y metas, pero <strong>jamás puede certificar o declarar EFICAZ un plan</strong>. Este dictamen es responsabilidad exclusiva del Líder SG-SST o especialista con licencia vigente.
          </p>
        </div>
      </div>

      {errorValidacion && (
        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2 animate-fade-in">
          <XCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorValidacion}</span>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleGuardar} className="space-y-6">
        
        {/* Selección de Indicador de Línea Base */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Indicador de Control Asociado (Consumido de Central Indicator Engine)
            </label>
            <select
              value={selectedIndId}
              onChange={(e) => handleIndicatorChange(e.target.value)}
              disabled={readOnly}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            >
              {indicadoresDisponibles.map(ind => (
                <option key={ind.id} value={ind.id}>
                  {ind.nombre} (Línea Base: {ind.valorActual}{ind.unidad})
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Fuente de datos: {selectedInd?.fuente || 'CENTRAL_INDICATOR_ENGINE'} (Lectura pura, cero recálculo)
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Criterio Específico de Eficacia
            </label>
            <input
              type="text"
              value={criterio}
              onChange={(e) => setCriterio(e.target.value)}
              disabled={readOnly}
              placeholder="Ej: Reducción del indicador en al menos un 15% o cero reincidencias."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Comparativa Línea Base vs Post Intervención */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/70">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase">
              1. Medición Línea Base (Inicial)
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={lineaBase}
                onChange={(e) => setLineaBase(e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800"
              />
              <span className="text-xs font-bold text-slate-500">{unidadMedida}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-indigo-700 uppercase">
              2. Medición Post-Intervención
            </label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={postIntervencion}
                onChange={(e) => setPostIntervencion(e.target.value)}
                disabled={readOnly}
                placeholder="Valor verificado"
                className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-xs font-mono font-bold text-indigo-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-xs font-bold text-indigo-600">{unidadMedida}</span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase">
              3. Dictamen Final de Eficacia
            </label>
            <div className="flex items-center gap-2 mt-1">
              <button
                type="button"
                onClick={() => setResultado('EFICAZ')}
                disabled={readOnly}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  resultado === 'EFICAZ'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>EFICAZ</span>
              </button>

              <button
                type="button"
                onClick={() => setResultado('NO_EFICAZ')}
                disabled={readOnly}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  resultado === 'NO_EFICAZ'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>NO EFICAZ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Observaciones Técnicas & Datos del Verificador */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Observaciones Técnicas y Justificación del Dictamen <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={readOnly}
              placeholder="Describa los hallazgos tras la intervención, análisis de las evidencias adjuntas y por qué se declara la medida como eficaz o si amerita replanificación."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Verificador Responsable
              </label>
              <input
                type="text"
                value={verificadorNombre}
                onChange={(e) => setVerificadorNombre(e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Cargo / Perfil
              </label>
              <input
                type="text"
                value={verificadorCargo}
                onChange={(e) => setVerificadorCargo(e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Licencia SST (Opcional)
              </label>
              <input
                type="text"
                value={licenciaSst}
                onChange={(e) => setLicenciaSst(e.target.value)}
                disabled={readOnly}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          {/* Checkbox Mandatorio Human-in-the-Loop */}
          <label className="flex items-start gap-3 p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-2xl cursor-pointer select-none">
            <input
              type="checkbox"
              checked={humanCheck}
              onChange={(e) => setHumanCheck(e.target.checked)}
              disabled={readOnly}
              className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
            />
            <div className="text-xs text-slate-800">
              <span className="font-black text-indigo-900 block">
                Declaración Jurada y Certificación Humana de Eficacia (Human-in-the-Loop)
              </span>
              <span className="text-[11px] text-slate-600 leading-tight block mt-0.5">
                Certifico que he revisado las evidencias documentales adjuntas, verificado la línea base del indicador y emitido este dictamen bajo criterio profesional SST.
              </span>
            </div>
          </label>
        </div>

        {/* Botones de Acción */}
        {!readOnly && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            {onCancelar && (
              <button
                type="button"
                onClick={onCancelar}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              className={`px-6 py-2.5 font-black text-xs text-white rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 hover:scale-[1.01] ${
                resultado === 'EFICAZ'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>
                {resultado === 'EFICAZ' ? 'Emitir Dictamen: ACCIÓN EFICAZ' : 'Emitir Dictamen: ACCIÓN NO EFICAZ'}
              </span>
            </button>
          </div>
        )}

      </form>

    </div>
  );
};
