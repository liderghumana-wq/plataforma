import React, { useState } from 'react';
import { 
  GitBranch, 
  History, 
  CheckCircle2, 
  Clock, 
  User, 
  Copy, 
  RotateCcw, 
  Eye, 
  ShieldCheck, 
  X, 
  FileText, 
  Layers, 
  HelpCircle, 
  Tag, 
  ArrowRight,
  GitCompare,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EncuestaMeta, VersionEncuestaRecord, AuditoriaVersionEncuesta } from '../types';

interface VersionHistoryModalProps {
  encuesta: EncuestaMeta;
  onClose: () => void;
  onDuplicateVersion: (versionNum: number, comoNuevaEncuesta: boolean) => void;
  onRestoreVersion: (versionNum: number) => void;
  onCompareVersions: (verA: VersionEncuestaRecord | EncuestaMeta, verB: VersionEncuestaRecord | EncuestaMeta) => void;
}

export function VersionHistoryModal({
  encuesta,
  onClose,
  onDuplicateVersion,
  onRestoreVersion,
  onCompareVersions
}: VersionHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<'versiones' | 'auditoria'>('versiones');
  const [previewVersion, setPreviewVersion] = useState<VersionEncuestaRecord | null>(null);

  const historial = encuesta.historialVersiones || [];
  const auditoria = encuesta.auditoriaLog || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left my-8 flex flex-col max-h-[88vh]"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-sans">Historial de Versiones & Auditoría</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {encuesta.codigo}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Trazabilidad inmutable de cambios, versiones publicadas e inspección de estructura
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 pt-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('versiones')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'versiones'
                  ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              Versiones Registradas ({historial.length})
            </button>

            <button
              onClick={() => setActiveTab('auditoria')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
                activeTab === 'auditoria'
                  ? 'bg-white text-indigo-600 border-indigo-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 border-transparent'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Log de Auditoría ({auditoria.length})
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium pb-2 hidden sm:block">
            Versión Activa Actual: <span className="font-bold text-slate-800">v{encuesta.version}.0</span> ({encuesta.estado.toUpperCase()})
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: VERSIONES */}
          {activeTab === 'versiones' && (
            <div className="space-y-4">
              {historial.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <GitBranch className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No hay versiones en el historial.</p>
                </div>
              ) : (
                historial.map((vRecord) => {
                  const isCurrentActive = vRecord.version === encuesta.version && vRecord.estado === encuesta.estado;
                  
                  let badgeBg = 'bg-slate-100 text-slate-700 border-slate-300';
                  if (vRecord.estado === 'publicada') badgeBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  if (vRecord.estado === 'borrador') badgeBg = 'bg-amber-100 text-amber-800 border-amber-300';
                  if (vRecord.estado === 'archivada') badgeBg = 'bg-slate-100 text-slate-600 border-slate-300';

                  return (
                    <div 
                      key={vRecord.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isCurrentActive 
                          ? 'border-indigo-300 bg-indigo-50/40 shadow-xs' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        
                        {/* Left Info */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="text-sm font-black text-indigo-700 font-mono bg-indigo-100/80 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                              v{vRecord.version}.0
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wider ${badgeBg}`}>
                              {vRecord.estado}
                            </span>
                            {isCurrentActive && (
                              <span className="text-[10px] font-extrabold uppercase bg-indigo-600 text-white px-2 py-0.5 rounded-md tracking-wider">
                                Versión en Uso
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-800">{vRecord.titulo}</h4>
                          
                          {vRecord.notasVersion && (
                            <p className="text-xs text-slate-600 bg-slate-100/80 p-2.5 rounded-xl border border-slate-200/80 italic">
                              "{vRecord.notasVersion}"
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Publicación: {vRecord.fechaPublicacion ? new Date(vRecord.fechaPublicacion).toLocaleString('es-CO') : 'Sin publicar'}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              {vRecord.autor}
                            </span>
                            <span className="flex items-center gap-1 font-mono text-slate-400">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              {vRecord.checksum}
                            </span>
                            <span className="text-slate-600 font-semibold">
                              {vRecord.secciones?.length || 0} Secciones • {vRecord.totalPreguntas || 0} Preguntas
                            </span>
                          </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          
                          {/* Preview Snapshot */}
                          <button
                            onClick={() => setPreviewVersion(vRecord)}
                            className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                            title="Ver estructura completa de esta versión"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" />
                            Inspeccionar
                          </button>

                          {/* Compare */}
                          <button
                            onClick={() => onCompareVersions(vRecord, encuesta)}
                            className="px-3 py-1.5 text-xs font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-indigo-200/60"
                            title="Comparar con la estructura actual"
                          >
                            <GitCompare className="w-3.5 h-3.5 text-indigo-600" />
                            Comparar
                          </button>

                          {/* Duplicate as new Version */}
                          <button
                            onClick={() => onDuplicateVersion(vRecord.version, false)}
                            className="px-3 py-1.5 text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-amber-200/60"
                            title="Duplicar esta versión como un nuevo borrador vN+1"
                          >
                            <Copy className="w-3.5 h-3.5 text-amber-600" />
                            Duplicar Versión
                          </button>

                          {/* Restore as new Draft */}
                          {!isCurrentActive && (
                            <button
                              onClick={() => {
                                if (confirm(`¿Desea restaurar la estructura de la versión v${vRecord.version}.0? Se creará un nuevo borrador activo conservando el historial previo.`)) {
                                  onRestoreVersion(vRecord.version);
                                }
                              }}
                              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                              title="Restaurar esta versión histórica como borrador activo"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              Restaurar
                            </button>
                          )}

                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: AUDITORIA LOG */}
          {activeTab === 'auditoria' && (
            <div className="space-y-3">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <span>Trazabilidad de auditoría en formato cronológico para inspección reglamentaria SG-SST</span>
                <span className="font-mono text-indigo-600 font-bold">{auditoria.length} Registros Auditoría</span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3">Fecha & Hora</th>
                      <th className="p-3">Usuario</th>
                      <th className="p-3">Versión</th>
                      <th className="p-3">Acción</th>
                      <th className="p-3">Detalle</th>
                      <th className="p-3 font-mono">Checksum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                    {auditoria.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 text-slate-500 whitespace-nowrap font-mono">
                          {new Date(item.fecha).toLocaleString('es-CO')}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{item.usuario}</td>
                        <td className="p-3 font-mono font-bold text-indigo-600">v{item.version}.0</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-slate-200 text-slate-800">
                            {item.accion}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 max-w-xs truncate">{item.detalles}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">{item.snapshotChecksum || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Las respuestas registradas conservan la versión exacta con la que fueron diligenciadas.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Historial
          </button>
        </div>

      </motion.div>

      {/* Snapshot Inspector Sub-Modal */}
      {previewVersion && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                Estructura Inmutable: Versión v{previewVersion.version}.0
              </h4>
              <button 
                onClick={() => setPreviewVersion(null)}
                className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border">
              <p><strong>Título:</strong> {previewVersion.titulo}</p>
              <p><strong>Descripción:</strong> {previewVersion.descripcion}</p>
              <p><strong>Checksum Hash:</strong> <span className="font-mono text-emerald-700">{previewVersion.checksum}</span></p>
            </div>

            <div className="space-y-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">Secciones y Preguntas ({previewVersion.totalPreguntas})</h5>
              {previewVersion.secciones.map((sec, idx) => (
                <div key={sec.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-indigo-700">Sección {idx + 1}: {sec.titulo}</span>
                  <ul className="pl-4 list-disc text-xs text-slate-700 space-y-1">
                    {sec.preguntas.map(p => (
                      <li key={p.id}>
                        <span className="font-semibold">{p.titulo}</span> <span className="text-slate-400">({p.tipo} - {p.obligatoria ? 'Obligatoria' : 'Opcional'})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setPreviewVersion(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
              >
                Cerrar Vista
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
