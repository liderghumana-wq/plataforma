import React from 'react';
import { ShieldAlert, X, AlertTriangle, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Prompt20ValidationReport } from '../core/data_integrity/types';

interface Prompt20ReportBlockerModalProps {
  report: Prompt20ValidationReport;
  onClose: () => void;
  onContinueWithoutIndicators: () => void;
  onGoToUploadData: () => void;
}

export function Prompt20ReportBlockerModal({
  report,
  onClose,
  onContinueWithoutIndicators,
  onGoToUploadData
}: Prompt20ReportBlockerModalProps) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left"
      >
        {/* Header - Blocker (Section 24) */}
        <div className="bg-rose-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 rounded-2xl border border-rose-400/30 text-rose-200">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-rose-300 uppercase block font-mono">
                Prompt 20 • Bloqueo de Generación (Sección 24)
              </span>
              <h3 className="text-base font-black font-display">
                INFORMACIÓN INSUFICIENTE PARA GENERAR EL INFORME
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-xs text-rose-950 space-y-2">
            <p className="font-bold">
              El motor de calidad de datos ha detectado campos críticos sin información suficiente en la empresa <strong className="font-mono">{report.companyId}</strong>.
            </p>
            <p className="text-rose-800">
              Para garantizar el cumplimiento de cero datos sintéticos o inventados, el sistema no formulará afirmaciones artificiales ni asumirá valores predeterminados.
            </p>
          </div>

          {/* Pending Critical Fields List */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider font-display">
              Campos Críticos Pendientes ({report.criticalIssues.length}):
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {report.criticalIssues.map((issue, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-[11px]">
                  <span className="font-bold text-slate-800">{issue}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">0% COBERTURA</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Si decide continuar, los indicadores omitidos se marcarán explícitamente como 'NO DISPONIBLE' en el informe.</span>
          </div>
        </div>

        {/* Action Buttons (Section 24) */}
        <div className="bg-slate-50 p-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3 text-xs">
          <button
            onClick={onContinueWithoutIndicators}
            className="w-full sm:w-auto px-4 py-2.5 text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold transition-colors cursor-pointer text-center"
          >
            Continuar sin estos indicadores
          </button>
          <button
            onClick={onGoToUploadData}
            className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            Completar información
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
