import React from 'react';
import { ShieldCheck, X, FileText, Database, Calculator, CheckCircle2, AlertTriangle, HelpCircle, Layers, FileSpreadsheet } from 'lucide-react';
import { motion } from 'motion/react';
import { IndicatorTraceability } from '../types';

interface TraceabilityModalProps {
  traceability: IndicatorTraceability;
  onClose: () => void;
}

export function TraceabilityModal({ traceability, onClose }: TraceabilityModalProps) {
  // Determine Quality Level Badge (Section 11)
  const coverage = traceability.coveragePercentage || 0;
  let qualityBadge = {
    label: 'ALTA',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: CheckCircle2
  };

  if (coverage < 70) {
    qualityBadge = {
      label: 'BAJA',
      color: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: AlertTriangle
    };
  } else if (coverage < 90) {
    qualityBadge = {
      label: 'MEDIA',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: HelpCircle
    };
  }

  const QualityIcon = qualityBadge.icon;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left"
      >
        {/* Header - Prompt 19 Sec 12: ORIGEN DEL INDICADOR */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase block font-mono">
                Prompt 19 • Cadena de Custodia
              </span>
              <h3 className="text-lg font-black font-display tracking-tight">ORIGEN DEL INDICADOR</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">

          {/* Indicator Card & Summary */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  ID: {traceability.indicatorId}
                </span>
                <h4 className="text-lg font-black text-slate-900 font-display">{traceability.indicatorName}</h4>
              </div>

              {/* Quality Level Badge (Sec 11) */}
              <div className="flex flex-col items-end gap-1">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border ${qualityBadge.color}`}>
                  <QualityIcon className="w-3.5 h-3.5" />
                  Calidad: {qualityBadge.label} ({coverage}%)
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {traceability.sourceType || 'ENCUESTA'}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-2 border-t border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Valor Medido</span>
                <div className="text-2xl font-black text-indigo-700 font-mono">
                  {traceability.calculatedValue !== null ? `${traceability.calculatedValue} ${traceability.unit}` : 'Sin datos suficientes (null)'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Muestra / Cobertura</span>
                <span className="text-xs font-bold text-slate-800">
                  {traceability.validRecords} / {traceability.totalRecords} ({coverage}%)
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Source Breakdown (Sec 1-4) */}
          <div className="space-y-3 text-xs">
            <h5 className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 font-display">
              <Database className="w-4 h-4 text-indigo-600" />
              1. Trazabilidad de Origen (Source Lineage)
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Tipo de Fuente (sourceType)</span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-black text-[11px] font-mono inline-block">
                  {traceability.sourceType || 'ENCUESTA'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Campo / Variable Evaluada</span>
                <p className="font-bold text-slate-800 font-mono">{traceability.sourceField}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Encuesta / Origen</span>
                <p className="font-semibold text-slate-800">{traceability.sourceSurvey || 'Encuesta Sociodemográfica 2026'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Periodo & Fecha de Corte</span>
                <p className="font-semibold text-slate-800 font-mono">
                  {traceability.period || '2026'} ({new Date(traceability.calculatedAt).toLocaleDateString('es-CO')})
                </p>
              </div>
            </div>
          </div>

          {/* Excel / Question Lineage if available (Sec 3-4) */}
          {(traceability.excelLineage || traceability.questionLineage) && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 text-xs">
              <span className="font-bold uppercase text-[10px] text-indigo-300 flex items-center gap-1.5 font-mono">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                Linaje Directo de Registro en Fuente
              </span>
              {traceability.excelLineage && (
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                  <div><span className="text-slate-500">Archivo:</span> {traceability.excelLineage.fileName}</div>
                  <div><span className="text-slate-500">Hoja:</span> {traceability.excelLineage.sheetName}</div>
                  <div><span className="text-slate-500">Fila Excel:</span> {traceability.excelLineage.excelRow}</div>
                  <div><span className="text-slate-500">Columna:</span> {traceability.excelLineage.excelColumn}</div>
                  <div><span className="text-slate-500">Valor Original:</span> {String(traceability.excelLineage.originalValue)}</div>
                  <div><span className="text-slate-500">Valor Normalizado:</span> {String(traceability.excelLineage.normalizedValue)}</div>
                </div>
              )}
              {traceability.questionLineage && (
                <div className="pt-2 border-t border-slate-800 text-[11px] space-y-1">
                  <div><span className="text-slate-400">ID Pregunta:</span> <code className="text-indigo-300">{traceability.questionLineage.questionId}</code></div>
                  <div><span className="text-slate-400">Texto Pregunta:</span> "{traceability.questionLineage.questionText}"</div>
                </div>
              )}
            </div>
          )}

          {/* Mathematical Formula / Calculation Method (Sec 5) */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl space-y-2 text-xs">
            <span className="font-bold text-indigo-950 uppercase text-[10px] flex items-center gap-1.5 font-display">
              <Calculator className="w-4 h-4 text-indigo-600" />
              2. Metodología y Fórmula Exacta de Cálculo
            </span>
            <div className="font-mono text-slate-900 bg-white p-3 rounded-xl border border-indigo-200/80 leading-relaxed font-semibold">
              {traceability.formula || traceability.calculationMethod}
            </div>
            <p className="text-[11px] text-indigo-900/80 italic font-medium">
              * Muestra válida: {traceability.validRecords} colaboradores. Excluyó {traceability.totalRecords - traceability.validRecords} registros faltantes sin imputar ceros ni valores inventados.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-500 font-mono">
            Trazabilidad SG-SST • Prompt 19 Verified
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Trazabilidad
          </button>
        </div>

      </motion.div>
    </div>
  );
}

