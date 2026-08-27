import React from 'react';
import { 
  Activity, Users, Percent, Smile, AlertTriangle, ShieldCheck, HelpCircle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { ClimateData, ClimateDimensionScore } from '../clima.types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts';

interface ClimaDashboardProps {
  data: ClimateData;
  onNavigate: (tab: string) => void;
}

export default function ClimaDashboard({ data, onNavigate }: ClimaDashboardProps) {
  const { totalParticipants, globalAverage, globalFavorability, dimensions, dataQuality } = data;

  // Find lowest and highest favorability dimensions
  const activeDims = dimensions.filter(d => d.average > 0);
  const sortedDims = [...activeDims].sort((a, b) => a.favorability - b.favorability);
  const lowestDim = sortedDims[0];
  const highestDim = sortedDims[sortedDims.length - 1];

  // Colors for Likert scores
  const getFavColorClass = (fav: number) => {
    if (fav >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (fav >= 65) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  // Chart data
  const chartData = activeDims.map(d => ({
    name: d.name.split(' y ')[0], // shorten for labels
    'Favorabilidad (%)': d.favorability,
    'Promedio (1-5)': d.average,
  }));

  // Segment colors for charting
  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-6 text-left">
      
      {/* 1. KPIs principales en Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Participantes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Muestra Participante</span>
            <h3 className="text-xl font-black text-slate-800 font-display mt-0.5">{totalParticipants}</h3>
            <p className="text-[10px] text-slate-500 font-semibold">Colaboradores con encuesta</p>
          </div>
        </div>

        {/* KPI 2: Promedio General */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-cyan-50 text-cyan-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Promedio Global</span>
            <h3 className="text-xl font-black text-slate-800 font-display mt-0.5">{globalAverage} <span className="text-xs text-slate-400 font-normal">/ 5.0</span></h3>
            <p className="text-[10px] text-slate-500 font-semibold">Escala Likert general</p>
          </div>
        </div>

        {/* KPI 3: Favorabilidad Global */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Favorabilidad Global</span>
            <h3 className="text-xl font-black text-slate-800 font-display mt-0.5">{globalFavorability}%</h3>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${getFavColorClass(globalFavorability)}`}>
                {globalFavorability >= 75 ? 'Saludable' : globalFavorability >= 60 ? 'Estable' : 'Crítico'}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Calidad del Archivo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-violet-50 text-violet-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Calidad de Estructura</span>
            <h3 className="text-xl font-black text-slate-800 font-display mt-0.5">{dataQuality?.qualityPercentage || 100}%</h3>
            <p className="text-[10px] text-slate-500 font-semibold">Nivel: <span className="font-bold text-violet-600">{dataQuality?.qualityLevel || 'Excelente'}</span></p>
          </div>
        </div>

      </div>

      {/* 2. Puntos Fuertes y Débiles */}
      {lowestDim && highestDim && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fortaleza */}
          <div className="bg-emerald-50/20 border border-emerald-100 p-5 rounded-2xl flex items-start gap-4 text-left">
            <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl mt-1 shrink-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">Mayor Fortaleza Clima</span>
              <h4 className="text-sm font-black text-slate-800 font-display">{highestDim.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">{highestDim.description}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-700">Favorabilidad:</span>
                <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">{highestDim.favorability}%</span>
              </div>
            </div>
          </div>

          {/* Oportunidad */}
          <div className="bg-rose-50/20 border border-rose-100 p-5 rounded-2xl flex items-start gap-4 text-left">
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl mt-1 shrink-0">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-rose-600 font-black uppercase tracking-wider">Foco Crítico de Intervención</span>
              <h4 className="text-sm font-black text-slate-800 font-display">{lowestDim.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-semibold">{lowestDim.description}</p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-700">Favorabilidad:</span>
                <span className="text-xs font-mono font-black text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-lg">{lowestDim.favorability}%</span>
                <button 
                  onClick={() => onNavigate('clima_recomendaciones')}
                  className="text-[10px] text-indigo-600 hover:text-indigo-700 font-black uppercase tracking-wider ml-auto hover:underline"
                >
                  Ver Acción IA &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Gráficos de Dimensiones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gráfico de Barras Principal */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs lg:col-span-2 text-left space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-800 font-display uppercase tracking-wider">Favorabilidad de Dimensiones de Clima</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Comparativa porcentual de favorabilidad general de cada variable.</p>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} stroke="#cbd5e1" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #f1f5f9', fontSize: '11px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} 
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Bar dataKey="Favorabilidad (%)" fill="#6366f1" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => {
                    const fav = entry['Favorabilidad (%)'];
                    let color = '#6366f1'; // Indigo
                    if (fav < 60) color = '#f43f5e'; // Rose for low
                    else if (fav < 75) color = '#f59e0b'; // Amber for mid
                    else color = '#10b981'; // Emerald for high
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Segmentación Demográfica Resumen */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs text-left space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800 font-display uppercase tracking-wider">Clima por Departamentos</h3>
            <p className="text-[11px] text-slate-400 font-semibold">Comparativo de favorabilidad por área operativa de la compañía.</p>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-64 pr-1">
            {data.byDepartment.slice(0, 6).map((dept, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-700 truncate max-w-[140px]">{dept.segmentName}</span>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                    <div 
                      className="h-full bg-indigo-600 rounded-full" 
                      style={{ 
                        width: `${dept.favorability}%`,
                        backgroundColor: dept.favorability >= 75 ? '#10b981' : dept.favorability >= 60 ? '#f59e0b' : '#f43f5e'
                      }} 
                    />
                  </div>
                  <span className="font-mono font-bold text-slate-900 w-10 text-right">{dept.favorability}%</span>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => onNavigate('clima_indicadores')}
            className="w-full text-center py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider border-t border-slate-100 pt-3"
          >
            Ver Detalle Indicadores &rarr;
          </button>
        </div>

      </div>

      {/* 4. Estructura y Validación de Datos (Data Quality Section) */}
      {dataQuality && (
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs text-left space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-800 font-display uppercase tracking-wider">Validación de Estructura de Datos</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Informe técnico de consistencia, integridad de variables y valores de la encuesta.</p>
            </div>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              dataQuality.qualityLevel === 'Excelente' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
              dataQuality.qualityLevel === 'Buena' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
              dataQuality.qualityLevel === 'Regular' ? 'bg-amber-50 text-amber-600 border-amber-100' :
              'bg-rose-50 text-rose-600 border-rose-100'
            }`}>
              {dataQuality.qualityLevel} ({dataQuality.qualityPercentage}%)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="text-center md:text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registros Leídos</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">{dataQuality.recordsRead}</p>
            </div>
            <div className="text-center md:text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Variables Mapeadas</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">{dataQuality.recognizedVariablesCount} <span className="text-xs text-slate-400">/ {dataQuality.totalVariablesCount}</span></p>
            </div>
            <div className="text-center md:text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registros Incompletos</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">{dataQuality.incompleteRecordsCount}</p>
            </div>
            <div className="text-center md:text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Variables Omisibles</span>
              <p className="text-lg font-black text-slate-800 mt-0.5">{dataQuality.missingVariablesCount}</p>
            </div>
          </div>

          {dataQuality.warnings.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Alertas de Calidad de Datos</span>
              <div className="space-y-1.5">
                {dataQuality.warnings.map((warn, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50/50 border border-amber-100 p-2.5 rounded-xl font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>{warn}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
