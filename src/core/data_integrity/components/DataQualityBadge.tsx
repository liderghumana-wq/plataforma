import React from 'react';
import { ShieldCheck, AlertCircle, HelpCircle, CheckCircle2 } from 'lucide-react';
import { FieldQualityStatus, IndicatorTraceability } from '../types';

interface DataQualityBadgeProps {
  validRecords: number;
  totalRecords: number;
  coveragePercentage: number;
  statusText?: string;
  size?: 'sm' | 'md' | 'lg';
  traceability?: IndicatorTraceability;
  onInspectTraceability?: (trace: IndicatorTraceability) => void;
}

export function DataQualityBadge({
  validRecords,
  totalRecords,
  coveragePercentage,
  statusText,
  size = 'sm',
  traceability,
  onInspectTraceability
}: DataQualityBadgeProps) {
  if (totalRecords === 0 || validRecords === 0) {
    return (
      <span 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-300"
        title="Sin registros válidos suficientes para calcular este indicador"
      >
        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        <span>Sin datos suficientes</span>
      </span>
    );
  }

  let badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;

  if (coveragePercentage < 50) {
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
    icon = <AlertCircle className="w-3.5 h-3.5 text-rose-600" />;
  } else if (coveragePercentage < 80) {
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    icon = <AlertCircle className="w-3.5 h-3.5 text-amber-600" />;
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span 
        onClick={() => traceability && onInspectTraceability && onInspectTraceability(traceability)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${badgeColor} ${traceability ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
        title={`Cobertura del dato: ${coveragePercentage}% (${validRecords} válidos de ${totalRecords} esperados)`}
      >
        {icon}
        <span>
          Registros válidos: {validRecords} / {totalRecords} ({coveragePercentage}%)
        </span>
      </span>

      {traceability && onInspectTraceability && (
        <button
          onClick={() => onInspectTraceability(traceability)}
          className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer text-[10px] font-mono flex items-center gap-1 border border-slate-200"
          title="Trazabilidad y Origen del Dato"
        >
          <ShieldCheck className="w-3 h-3 text-indigo-600" />
          <span>Trazabilidad</span>
        </button>
      )}
    </div>
  );
}
