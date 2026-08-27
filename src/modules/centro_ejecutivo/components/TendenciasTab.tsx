import React from 'react';
import { 
  TrendingUp, 
  Calendar, 
  Info, 
  BarChart2, 
  AlertCircle,
  Clock
} from 'lucide-react';
import { CentroEjecutivoTab } from '../types/centroEjecutivo.types';

interface TendenciasTabProps {
  activeCompanyId: string;
  onNavigateTab: (tab: CentroEjecutivoTab) => void;
}

export const TendenciasTab: React.FC<TendenciasTabProps> = ({
  activeCompanyId,
  onNavigateTab
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" />
            Evolución Temporal
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Tendencias & Series Históricas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoreo comparativo de indicadores SG-SST y madurez a lo largo del tiempo.
          </p>
        </div>

        <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-slate-500" />
          Período Base: 2026-Q1
        </span>
      </div>

      {/* Honest Notice about Historical Trend Depth */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-8 text-center max-w-2xl mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mx-auto">
          <Clock className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">
            Línea Base Inicial Registrada
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Actualmente la plataforma cuenta con la <strong>medición de línea base de la Fase de Activación</strong>. Conforme se completen las evaluaciones periódicas y cierres mensuales, las curvas de tendencia longitudinal se graficarán automáticamente.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600">
          <Info className="w-4 h-4 text-indigo-500" />
          <span>Sin histórico suficiente para proyección trimestral comparada</span>
        </div>
      </div>
    </div>
  );
};
