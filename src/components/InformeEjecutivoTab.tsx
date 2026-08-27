import React, { useState } from 'react';
import { Sparkles, FileText, Layers } from 'lucide-react';
import Prompt38ReportPanel from '../modules/informes/components/Prompt38ReportPanel';
import ExecutiveReportTemplate from './ExecutiveReportTemplate';
import { DemographicsData, AiConclusion, Recommendation } from '../types';
import { generateRecommendations, generateAiConclusions } from '../utils/aiRecommender';
import { useEmpresa } from '../modules/configuracion/useEmpresa';

interface InformeEjecutivoTabProps {
  data?: DemographicsData | null;
  conclusions?: AiConclusion[];
  recommendations?: Recommendation[];
}

export default function InformeEjecutivoTab({ 
  data, 
  conclusions: initialConclusions, 
  recommendations: initialRecommendations 
}: InformeEjecutivoTabProps) {
  const { config } = useEmpresa();
  const [activeEngineView, setActiveEngineView] = useState<'PROMPT38' | 'CLASSIC'>('PROMPT38');

  const rawRecommendations = data ? generateRecommendations(data) : [];
  const aiConclusions = data ? generateAiConclusions(data) : [];

  return (
    <div className="space-y-6">
      {/* Engine Switcher / Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs no-print">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Motor de Informes SG-SST
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Generación de informe basada estrictamente en Data Quality & Central Indicator Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveEngineView('PROMPT38')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeEngineView === 'PROMPT38'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Motor Central (PROMPT 38)</span>
          </button>

          <button
            onClick={() => setActiveEngineView('CLASSIC')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeEngineView === 'CLASSIC'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Plantilla Clásica</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeEngineView === 'PROMPT38' ? (
        <Prompt38ReportPanel />
      ) : (
        <div className="space-y-6">
          {data ? (
            <div className="max-w-4xl mx-auto space-y-6 flex flex-col items-center overflow-auto p-4 bg-slate-100 rounded-3xl border border-slate-200 shadow-inner">
              <ExecutiveReportTemplate
                data={data}
                reportTitle="Informe de Diagnóstico Sociodemográfico y Plan de Intervención SG-SST"
                reportCompany={config.nombreEmpresa || 'Mi Empresa'}
                conclusions={aiConclusions}
                recommendations={rawRecommendations}
              />
            </div>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
              <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">Sin datos de carga previa</h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Utiliza el Motor Central (PROMPT 38) para calcular a partir de las fuentes maestras registradas en la plataforma.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
