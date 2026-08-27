import React, { useState, useMemo } from 'react';
import { 
  GitCompare, 
  PlusCircle, 
  MinusCircle, 
  Edit3, 
  X, 
  FileText, 
  Tag, 
  HelpCircle, 
  Layers, 
  ArrowRight, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { EncuestaMeta, VersionEncuestaRecord } from '../types';
import { builderEncuestasService } from '../builder.service';

interface VersionCompareModalProps {
  encuesta: EncuestaMeta;
  initialVersionA?: VersionEncuestaRecord | EncuestaMeta;
  initialVersionB?: VersionEncuestaRecord | EncuestaMeta;
  onClose: () => void;
}

export function VersionCompareModal({
  encuesta,
  initialVersionA,
  initialVersionB,
  onClose
}: VersionCompareModalProps) {
  const versionsList = useMemo(() => {
    const list = encuesta.historialVersiones || [];
    // Ensure current draft/active state is also selectable if not in list
    const hasCurrentInList = list.some(v => v.version === encuesta.version && v.estado === encuesta.estado);
    if (!hasCurrentInList) {
      return [
        {
          id: `ver-current`,
          encuestaId: encuesta.id,
          version: encuesta.version,
          versionLabel: `v${encuesta.version}.0 (Actual)`,
          titulo: encuesta.titulo,
          descripcion: encuesta.descripcion,
          categoria: encuesta.categoria,
          estado: encuesta.estado,
          fechaCreacion: encuesta.fechaCreacion,
          fechaPublicacion: encuesta.fechaPublicacion,
          autor: encuesta.autor || 'Administrador',
          notasVersion: 'Estructura en edición actual',
          checksum: encuesta.checksum || 'N/A',
          secciones: encuesta.secciones,
          totalPreguntas: encuesta.secciones.reduce((acc, s) => acc + s.preguntas.length, 0)
        } as VersionEncuestaRecord,
        ...list
      ];
    }
    return list;
  }, [encuesta]);

  const [verANum, setVerANum] = useState<number>(
    initialVersionA ? initialVersionA.version : (versionsList[1]?.version || versionsList[0]?.version || 1)
  );

  const [verBNum, setVerBNum] = useState<number>(
    initialVersionB ? initialVersionB.version : (versionsList[0]?.version || 1)
  );

  const recordA = useMemo(() => {
    return versionsList.find(v => v.version === verANum) || versionsList[0] || encuesta;
  }, [versionsList, verANum, encuesta]);

  const recordB = useMemo(() => {
    return versionsList.find(v => v.version === verBNum) || versionsList[0] || encuesta;
  }, [versionsList, verBNum, encuesta]);

  const diffResult = useMemo(() => {
    return builderEncuestasService.compararVersiones(recordA, recordB);
  }, [recordA, recordB]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left my-6 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-sans">Comparador Estructural de Versiones</h3>
              <p className="text-indigo-200 text-xs mt-0.5">
                Análisis comparativo de preguntas, secciones, obligatoriedad y reglas de dependencia
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-indigo-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Version Selectors Bar */}
        <div className="bg-slate-100 p-4 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
          
          {/* Version A Selector */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Versión A (Base de Comparación)
            </label>
            <select
              value={verANum}
              onChange={(e) => setVerANum(Number(e.target.value))}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              {versionsList.map((v) => (
                <option key={`a-${v.id}`} value={v.version}>
                  v{v.version}.0 - {v.estado.toUpperCase()} ({new Date(v.fechaCreacion).toLocaleDateString('es-CO')})
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
              <span>Preguntas: <strong>{diffResult.versionA.totalPreguntas}</strong></span>
              <span>Secciones: <strong>{diffResult.versionA.totalSecciones}</strong></span>
              <span className="font-mono text-slate-400">{recordA.checksum}</span>
            </div>
          </div>

          {/* Version B Selector */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Versión B (Versión Comparada)
            </label>
            <select
              value={verBNum}
              onChange={(e) => setVerBNum(Number(e.target.value))}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            >
              {versionsList.map((v) => (
                <option key={`b-${v.id}`} value={v.version}>
                  v{v.version}.0 - {v.estado.toUpperCase()} ({new Date(v.fechaCreacion).toLocaleDateString('es-CO')})
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-medium">
              <span>Preguntas: <strong>{diffResult.versionB.totalPreguntas}</strong></span>
              <span>Secciones: <strong>{diffResult.versionB.totalSecciones}</strong></span>
              <span className="font-mono text-slate-400">{recordB.checksum}</span>
            </div>
          </div>

        </div>

        {/* Diff Summary Indicators */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between flex-wrap gap-2 text-xs font-semibold shrink-0">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <PlusCircle className="w-4 h-4" />
              {diffResult.preguntasAgregadas.length} Agregadas en B
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              <MinusCircle className="w-4 h-4" />
              {diffResult.preguntasEliminadas.length} Eliminadas en B
            </span>
            <span className="flex items-center gap-1.5 text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
              <Edit3 className="w-4 h-4" />
              {diffResult.preguntasModificadas.length} Modificadas
            </span>
          </div>

          <div className="text-slate-500 font-normal">
            Comparando <strong className="text-indigo-700 font-mono">v{recordA.version}.0</strong> vs <strong className="text-indigo-700 font-mono">v{recordB.version}.0</strong>
          </div>
        </div>

        {/* Diff Results Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Metadata changes if any */}
          {(diffResult.metadatosCambiados.titulo || diffResult.metadatosCambiados.descripcion) && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Cambios en Metadatos Generales
              </h4>
              {diffResult.metadatosCambiados.titulo && (
                <div className="text-xs text-amber-900">
                  <strong>Título:</strong> "{diffResult.metadatosCambiados.titulo.antes}" ➔ "{diffResult.metadatosCambiados.titulo.ahora}"
                </div>
              )}
              {diffResult.metadatosCambiados.descripcion && (
                <div className="text-xs text-amber-900">
                  <strong>Descripción:</strong> Modificada en la versión comparada.
                </div>
              )}
            </div>
          )}

          {/* 1. Modified Questions */}
          {diffResult.preguntasModificadas.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-sky-600" />
                Preguntas Modificadas ({diffResult.preguntasModificadas.length})
              </h4>

              <div className="space-y-2">
                {diffResult.preguntasModificadas.map((mod) => (
                  <div key={mod.id} className="bg-sky-50/50 border border-sky-200 rounded-2xl p-4 space-y-2">
                    <p className="text-xs font-bold text-sky-900">Pregunta ID: {mod.id}</p>
                    <ul className="pl-4 list-disc text-xs text-slate-700 space-y-1">
                      {mod.cambios.map((c, i) => (
                        <li key={i} className="font-medium text-slate-800">{c}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Added Questions */}
          {diffResult.preguntasAgregadas.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                Preguntas Agregadas en v{recordB.version}.0 ({diffResult.preguntasAgregadas.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {diffResult.preguntasAgregadas.map((p) => (
                  <div key={p.id} className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                        {p.tipo}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold">
                        {p.obligatoria ? 'Obligatoria' : 'Opcional'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-emerald-950 line-clamp-2">{p.titulo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Deleted Questions */}
          {diffResult.preguntasEliminadas.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2">
                <MinusCircle className="w-4 h-4 text-rose-600" />
                Preguntas Eliminadas en v{recordB.version}.0 ({diffResult.preguntasEliminadas.length})
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {diffResult.preguntasEliminadas.map((p) => (
                  <div key={p.id} className="bg-rose-50/60 border border-rose-200 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-rose-800 bg-rose-200/60 px-2 py-0.5 rounded-md">
                        {p.tipo}
                      </span>
                      <span className="text-[10px] text-rose-700 font-semibold">
                        {p.obligatoria ? 'Obligatoria' : 'Opcional'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-rose-950 line-clamp-2">{p.titulo}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No changes found */}
          {diffResult.preguntasAgregadas.length === 0 && 
           diffResult.preguntasEliminadas.length === 0 && 
           diffResult.preguntasModificadas.length === 0 && 
           !diffResult.metadatosCambiados.titulo && (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
              <p className="text-sm font-bold text-slate-700">Las versiones v{recordA.version}.0 y v{recordB.version}.0 son idénticas</p>
              <p className="text-xs text-slate-500">No se detectaron diferencias estructurales en las preguntas o metadatos.</p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            Comparación generada en tiempo real sobre los snapshots inmutables del sistema.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Comparador
          </button>
        </div>

      </motion.div>
    </div>
  );
}
