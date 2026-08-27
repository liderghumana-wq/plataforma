import React from 'react';
import { Database, X, Table, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { SourceType } from '../types';

export interface ChartSourceDataItem {
  variable: string;
  value: string | number;
  count: number;
  percentage: number;
  sourceType?: SourceType;
  sourceSurvey?: string;
}

interface ChartTraceabilityModalProps {
  chartTitle: string;
  sourceItems: ChartSourceDataItem[];
  totalPopulation?: number;
  onClose: () => void;
}

export function ChartTraceabilityModal({
  chartTitle,
  sourceItems,
  totalPopulation,
  onClose
}: ChartTraceabilityModalProps) {
  const calculatedTotal = sourceItems.reduce((acc, item) => acc + item.count, 0);
  const total = totalPopulation || calculatedTotal;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left"
      >
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-300">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono block">
                Prompt 19 • Trazabilidad de Gráfica
              </span>
              <h3 className="text-base font-black font-display text-white">Datos de Origen de Gráfica</h3>
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
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-400 block font-mono">Gráfica Evaluada</span>
            <h4 className="text-sm font-black text-slate-900 font-display">{chartTitle}</h4>
            <div className="text-xs text-slate-500 mt-1 font-mono">
              Población Total Evaluada: <strong className="text-indigo-700">{total} colaboradores</strong>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Variable / Categoría</th>
                  <th className="p-3 text-right">Cantidad</th>
                  <th className="p-3 text-right">Porcentaje</th>
                  <th className="p-3">Fuente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono text-[11px] text-slate-800">
                {sourceItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold font-sans">{item.variable}</td>
                    <td className="p-3 text-right font-bold text-slate-900">{item.count}</td>
                    <td className="p-3 text-right font-bold text-indigo-700">{item.percentage}%</td>
                    <td className="p-3 text-slate-500 font-sans">{item.sourceSurvey || item.sourceType || 'ENCUESTA'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-[11px] text-indigo-900 font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Todos los puntos de la gráfica están vinculados con sus registros de origen sin imputación estocástica.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Trazabilidad de Gráfica
          </button>
        </div>
      </motion.div>
    </div>
  );
}
