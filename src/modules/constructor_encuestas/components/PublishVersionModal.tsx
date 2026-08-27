import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck, X, FileText, Sparkles, Tag, GitBranch } from 'lucide-react';
import { motion } from 'motion/react';
import { EncuestaMeta } from '../types';

interface PublishVersionModalProps {
  encuesta: EncuestaMeta;
  onConfirmPublish: (notasVersion: string) => void;
  onClose: () => void;
}

export function PublishVersionModal({ encuesta, onConfirmPublish, onClose }: PublishVersionModalProps) {
  const currentVersion = encuesta.version || 1;
  const isAlreadyPublished = encuesta.estado === 'publicada';
  const targetVersion = isAlreadyPublished ? currentVersion + 1 : currentVersion;

  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notas.trim()) {
      setError('Por favor ingrese las notas de publicación para el registro de auditoría.');
      return;
    }
    onConfirmPublish(notas.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-2xl border border-white/20">
              <CheckCircle2 className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-sans">Publicar Versión {targetVersion}.0</h3>
              <p className="text-emerald-100 text-xs mt-0.5">
                {isAlreadyPublished 
                  ? `Se archivará la v${currentVersion}.0 y se publicará la nueva versión v${targetVersion}.0`
                  : `Habilitación oficial de la versión v${currentVersion}.0`
                }
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-emerald-100 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Version Meta Summary */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Encuesta ID: <strong className="text-slate-800">{encuesta.codigo}</strong></span>
              <span className="flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <GitBranch className="w-3 h-3" /> Versión Objetivo: v{targetVersion}.0
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800">{encuesta.titulo}</p>
            <p className="text-xs text-slate-600 line-clamp-2">{encuesta.descripcion}</p>
          </div>

          {/* Audit & Compliance Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold block mb-0.5">Control de Auditoría e Inmutabilidad</strong>
              <p className="text-amber-800/90 leading-relaxed">
                Al publicar esta versión, la estructura actual quedará congelada con un checksum de seguridad. Las respuestas recolectadas a partir de este momento se asociarán formalmente a la versión <strong>v{targetVersion}.0</strong>.
              </p>
            </div>
          </div>

          {/* Release Notes Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Notas de la Versión / Registro de Cambios (Changelog) <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={notas}
              onChange={(e) => {
                setNotas(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej. Adición de módulo epidemiológico, actualización de opciones de cargo y nuevas reglas de dependencia para ausentismo..."
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {error && <p className="text-xs font-medium text-rose-600 mt-1">{error}</p>}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirmar y Publicar v{targetVersion}.0
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
