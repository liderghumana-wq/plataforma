import React from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Activity,
  Calendar,
  Smile,
  HeartPulse
} from 'lucide-react';
import { onboardingService } from '../services/onboardingService';
import { OnboardingIndicatorCheckItem } from '../types/onboarding.types';

interface IndicatorsStepProps {
  onPrev: () => void;
  onGoToDashboard: () => void;
  onNavigateToIndicators: () => void;
  activeCompanyId: string;
}

export const IndicatorsStep: React.FC<IndicatorsStepProps> = ({
  onPrev,
  onGoToDashboard,
  onNavigateToIndicators,
  activeCompanyId
}) => {
  const indicatorsList = onboardingService.getIndicatorsChecklist(activeCompanyId);

  const getStatusBadge = (estado: OnboardingIndicatorCheckItem['estado']) => {
    switch (estado) {
      case 'PROCESADO':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Procesado
          </span>
        );
      case 'DISPONIBLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Disponible
          </span>
        );
      case 'REQUIERE_DATOS':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-bold border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Requiere Datos
          </span>
        );
      case 'SIN_INFORMACION':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold border border-slate-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Sin Información
          </span>
        );
    }
  };

  const getCategoryIcon = (categoria: OnboardingIndicatorCheckItem['categoria']) => {
    switch (categoria) {
      case 'CENSO': return <Activity className="w-4 h-4 text-indigo-600" />;
      case 'CALIDAD': return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'SOCIODEMOGRAFICO': return <TrendingUp className="w-4 h-4 text-blue-600" />;
      case 'SST': return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'OSTEOMUSCULAR': return <Activity className="w-4 h-4 text-amber-600" />;
      case 'AUSENTISMO': return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'CLIMA_BIENESTAR': return <Smile className="w-4 h-4 text-teal-600" />;
    }
  };

  const totalProcessed = indicatorsList.filter(i => i.estado === 'PROCESADO' || i.estado === 'DISPONIBLE').length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Paso 7 de 7 • Verificación de Resultados
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Batería de Indicadores de la Plataforma</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Comprueba la disponibilidad de cada indicador calculado sin datos inventados ni valores simulados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
            {totalProcessed} de {indicatorsList.length} Listos
          </span>
          <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
            [A] Real
          </span>
        </div>
      </div>

      {/* Indicators Checklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Checklist de Disponibilidad de Indicadores
          </span>
          <button
            onClick={onNavigateToIndicators}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            Ver Tablero Completo de Indicadores
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-200">
          {indicatorsList.map((item) => (
            <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-start gap-3.5 flex-1">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getCategoryIcon(item.categoria)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{item.nombre}</h4>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.descripcion}</p>
                  {item.evidenciaNumerica && (
                    <div className="text-[11px] font-semibold text-slate-600 bg-slate-100 inline-block px-2 py-0.5 rounded-md mt-1">
                      Evidencia: {item.evidenciaNumerica}
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                {getStatusBadge(item.estado)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Congratulation Box */}
      <div className="p-6 rounded-2xl bg-linear-to-br from-indigo-900 to-slate-900 text-white border border-indigo-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ¡Proceso de Activación Finalizado!
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Has completado la parametrización de tu empresa. Ahora puedes explorar el Dashboard Ejecutivo, consultar las recomendaciones de Inteligencia Artificial o generar el Informe Ejecutivo oficial.
          </p>
        </div>

        <button
          onClick={onGoToDashboard}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg transition-colors cursor-pointer shrink-0"
        >
          Ir al Dashboard de Implementación
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation Footer */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Encuesta
        </button>

        <button
          type="button"
          onClick={onGoToDashboard}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          Finalizar Onboarding
          <CheckCircle2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
