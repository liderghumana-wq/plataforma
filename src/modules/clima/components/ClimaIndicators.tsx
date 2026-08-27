import React, { useState } from 'react';
import { Layers, Activity, ChevronRight, BarChart3, HelpCircle, Shield, Sparkles, MapPin, Briefcase, User2, Calendar } from 'lucide-react';
import { ClimateData, ClimateDimensionScore } from '../clima.types';

interface ClimaIndicatorsProps {
  data: ClimateData;
}

export default function ClimaIndicators({ data }: ClimaIndicatorsProps) {
  const { dimensions, byCity, byDepartment, byGender, bySeniority } = data;
  const activeDims = dimensions.filter(d => d.average > 0);

  const [selectedDimId, setSelectedDimId] = useState<string>(
    activeDims.length > 0 ? activeDims[0].dimensionId : ''
  );

  const selectedDim = activeDims.find(d => d.dimensionId === selectedDimId);

  // Status badge for scores
  const getScoreBadge = (score: number) => {
    if (score >= 4.0) return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    if (score >= 3.3) return 'bg-amber-50 text-amber-600 border border-amber-100';
    return 'bg-rose-50 text-rose-600 border border-rose-100';
  };

  const getFavorabilityText = (fav: number) => {
    if (fav >= 75) return 'Saludable';
    if (fav >= 60) return 'Por mejorar';
    return 'Crítico';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
      
      {/* Selector de dimensiones lateral */}
      <div className="lg:col-span-1 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-2">Dimensiones</h3>
        <div className="flex flex-col gap-1">
          {activeDims.map((dim) => {
            const isSelected = dim.dimensionId === selectedDimId;
            return (
              <button
                key={dim.dimensionId}
                onClick={() => setSelectedDimId(dim.dimensionId)}
                className={`p-3.5 rounded-xl text-left transition-all flex items-center justify-between group cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-700'
                }`}
              >
                <div className="space-y-0.5 truncate pr-2">
                  <p className="text-xs font-black truncate">{dim.name}</p>
                  <p className={`text-[10px] font-semibold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    Fav: {dim.favorability}%
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? 'translate-x-1' : 'text-slate-300 group-hover:translate-x-0.5'}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel principal de indicadores de la dimensión */}
      <div className="lg:col-span-3 space-y-6">
        {selectedDim ? (
          <>
            {/* Cabezote de dimensión seleccionada */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    Dimensión en Foco
                  </span>
                  <h2 className="text-lg font-black text-slate-900 font-display mt-1">{selectedDim.name}</h2>
                  <p className="text-xs text-slate-500 font-semibold">{selectedDim.description}</p>
                </div>
                
                <div className="flex gap-3">
                  <div className="px-4 py-2.5 rounded-2xl text-center bg-slate-50 border border-slate-100 min-w-[80px]">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Promedio</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{selectedDim.average} <span className="text-[10px] text-slate-400 font-normal">/ 5</span></p>
                  </div>
                  
                  <div className="px-4 py-2.5 rounded-2xl text-center bg-slate-50 border border-slate-100 min-w-[80px]">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Favorabilidad</p>
                    <p className="text-sm font-black text-slate-800 mt-0.5">{selectedDim.favorability}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Análisis detallado de cada pregunta */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-5">
              <div>
                <h3 className="text-sm font-black text-slate-800 font-display uppercase tracking-wider">Desglose de Reactivos (Preguntas)</h3>
                <p className="text-[11px] text-slate-400 font-semibold">Resultados porcentuales exactos por cada pregunta evaluada en esta dimensión.</p>
              </div>

              <div className="space-y-6">
                {selectedDim.questionScores.map((qs, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs font-semibold">
                      <span className="text-slate-800">{qs.text}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 max-w-max ${getScoreBadge(qs.average)}`}>
                        {qs.average} / 5.0 (Fav: {qs.favorability}%)
                      </span>
                    </div>
                    
                    {/* Stacked Progress Bar (Favorable / Neutral / Unfavorable) */}
                    <div className="space-y-1">
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex">
                        {/* Favorable */}
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500" 
                          style={{ width: `${qs.favorability}%` }} 
                          title={`Favorable: ${qs.favorability}%`}
                        />
                        {/* Neutral */}
                        <div 
                          className="h-full bg-slate-300 transition-all duration-500" 
                          style={{ width: `${qs.neutral}%` }} 
                          title={`Neutral: ${qs.neutral}%`}
                        />
                        {/* Desfavorable */}
                        <div 
                          className="h-full bg-rose-400 transition-all duration-500" 
                          style={{ width: `${qs.unfavorability}%` }} 
                          title={`Desfavorable: ${qs.unfavorability}%`}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono font-bold text-slate-400">
                        <span className="text-emerald-600">FAV: {qs.favorability}%</span>
                        <span className="text-slate-500">NEUT: {qs.neutral}%</span>
                        <span className="text-rose-600">DES: {qs.unfavorability}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Segmentación Demográfica Detallada */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Ciudad */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Por Ciudad</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {byCity.map((c, i) => (
                    <div key={i} className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600 truncate max-w-[90px]">{c.segmentName}</span>
                      <span className="text-slate-900 font-mono">{c.favorability}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Departamento */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Por Área</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {byDepartment.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600 truncate max-w-[90px]">{d.segmentName}</span>
                      <span className="text-slate-900 font-mono">{d.favorability}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Género */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <User2 className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Por Género</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {byGender.map((g, i) => (
                    <div key={i} className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600 truncate max-w-[90px]">{g.segmentName}</span>
                      <span className="text-slate-900 font-mono">{g.favorability}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Antigüedad */}
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Por Antigüedad</span>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {bySeniority.map((s, i) => (
                    <div key={i} className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-600 truncate max-w-[90px]">{s.segmentName}</span>
                      <span className="text-slate-900 font-mono">{s.favorability}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        ) : (
          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-2xs text-center">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-extrabold text-slate-800 text-sm">Carga un Excel para ver los Indicadores</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Es necesario cargar resultados válidos de encuesta para segmentar por dimensiones.</p>
          </div>
        )}
      </div>

    </div>
  );
}
