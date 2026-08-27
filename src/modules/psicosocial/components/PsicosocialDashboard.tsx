import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Activity, 
  Users, 
  Award, 
  AlertTriangle, 
  TrendingUp, 
  ShieldAlert, 
  Grid, 
  Building2, 
  FileSpreadsheet, 
  Briefcase, 
  Layers 
} from 'lucide-react';
import { PsicosocialData, PsicosocialRanking, PsicosocialDimensionScore, RiskLevel } from '../psicosocial.types';
import { getRiskColorClass, getRiskHexColor } from '../psicosocial.config';

interface PsicosocialDashboardProps {
  data: PsicosocialData;
}

export const PsicosocialDashboard: React.FC<PsicosocialDashboardProps> = ({ data }) => {
  const [rankingTab, setRankingTab] = useState<'areas' | 'sedes' | 'proyectos' | 'cargos'>('areas');

  const { totalParticipants, globalScore, globalRiskLevel, batteryType, dimensions, rankings, distribution, matrix } = data;

  // Pie chart data for risk level distribution
  const pieData = [
    { name: 'Muy Bajo', value: distribution.muyBajo, color: getRiskHexColor('Muy Bajo') },
    { name: 'Bajo', value: distribution.bajo, color: getRiskHexColor('Bajo') },
    { name: 'Medio', value: distribution.medio, color: getRiskHexColor('Medio') },
    { name: 'Alto', value: distribution.alto, color: getRiskHexColor('Alto') },
    { name: 'Muy Alto', value: distribution.muyAlto, color: getRiskHexColor('Muy Alto') }
  ].filter(p => p.value > 0);

  // Radar chart data for dimensions
  const radarData = dimensions.map(d => ({
    subject: d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name,
    score: d.score,
    fullMark: 100
  }));

  // Get active ranking dataset
  const activeRankingData = rankings[rankingTab];

  return (
    <div id="psicosocial-dashboard-root" className="space-y-8">
      {/* 1. KPIs Generales */}
      <div id="psicosocial-kpis" className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div id="kpi-score" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Índice de Riesgo Global</span>
            <span className="text-4xl font-extrabold text-slate-800 font-mono">{globalScore}/100</span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getRiskColorClass(globalRiskLevel)}`}>
              Riesgo {globalRiskLevel}
            </span>
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/30 rounded-full translate-x-8 -translate-y-8 -z-10" />
        </div>

        <div id="kpi-participants" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Participación Evaluada</span>
            <span className="text-4xl font-extrabold text-slate-800 font-mono">{totalParticipants}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-slate-500 text-xs">
            <span>Fuerza de trabajo analizada</span>
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/30 rounded-full translate-x-8 -translate-y-8 -z-10" />
        </div>

        <div id="kpi-instrument" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Tipo de Instrumento</span>
            <span className="text-xl font-bold text-slate-800 leading-tight block">{batteryType}</span>
          </div>
          <div className="mt-4 flex items-center justify-between text-slate-500 text-xs">
            <span>Batería SST Normativa</span>
            <FileSpreadsheet className="w-5 h-5 text-amber-500" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/30 rounded-full translate-x-8 -translate-y-8 -z-10" />
        </div>

        <div id="kpi-high-risk-count" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[140px]">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Población en Alto Riesgo</span>
            <span className="text-4xl font-extrabold text-red-600 font-mono">
              {Math.round(((distribution.alto + distribution.muyAlto) / totalParticipants) * 100)}%
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between text-slate-500 text-xs">
            <span>Nivel Alto + Muy Alto</span>
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50/30 rounded-full translate-x-8 -translate-y-8 -z-10" />
        </div>
      </div>

      {/* 2. Visualizaciones Claves (Radar y Semáforo de Distribución) */}
      <div id="psicosocial-key-viz" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar de Dimensiones */}
        <div id="card-radar" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Mapa Radial de Dimensiones</h3>
              <p className="text-xs text-slate-500">Promedio de riesgo por cada factor de la batería (Valores altos = Mayor riesgo)</p>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">16 Dimensiones</span>
          </div>
          
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8' }} />
                <Radar
                  name="Índice de Riesgo"
                  dataKey="score"
                  stroke="#6366f1"
                  fill="#818cf8"
                  fillOpacity={0.3}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribución de Riesgos */}
        <div id="card-distribution" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Distribución del Nivel de Riesgo</h3>
            <p className="text-xs text-slate-500 mb-6">Proporción de colaboradores según severidad psicométrica</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Pie Chart */}
            <div className="h-[220px] flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} colaboradores`, 'Población']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Progress Legend */}
            <div className="space-y-3">
              {[
                { label: 'Muy Alto', value: distribution.muyAlto, color: 'bg-red-500', text: 'text-red-700' },
                { label: 'Alto', value: distribution.alto, color: 'bg-orange-500', text: 'text-orange-700' },
                { label: 'Medio', value: distribution.medio, color: 'bg-amber-500', text: 'text-amber-700' },
                { label: 'Bajo', value: distribution.bajo, color: 'bg-blue-500', text: 'text-blue-700' },
                { label: 'Muy Bajo', value: distribution.muyBajo, color: 'bg-emerald-500', text: 'text-emerald-700' }
              ].map((item) => {
                const percentage = totalParticipants > 0 ? Math.round((item.value / totalParticipants) * 100) : 0;
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="flex items-center gap-2 text-slate-600">
                        <span className={`w-3 h-3 rounded-full ${item.color}`} />
                        {item.label}
                      </span>
                      <span className="text-slate-800">{item.value} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Rankings Demográficos (Sedes, Áreas, Proyectos, Cargos) */}
      <div id="psicosocial-rankings" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Rankings de Riesgo por Segmentos</h3>
            <p className="text-xs text-slate-500">Segmentación demográfica priorizada por el índice promedio de vulnerabilidad psicosocial</p>
          </div>

          <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 self-start">
            {[
              { id: 'areas', label: 'Áreas', icon: Layers },
              { id: 'sedes', label: 'Sedes', icon: Building2 },
              { id: 'proyectos', label: 'Proyectos', icon: Briefcase },
              { id: 'cargos', label: 'Cargos', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                id={`btn-tab-${tab.id}`}
                onClick={() => setRankingTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  rankingTab === tab.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Gráfico de Barras */}
          <div className="lg:col-span-7 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeRankingData} layout="vertical" margin={{ left: 50, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} />
                <Tooltip formatter={(value) => [`${value} / 100`, 'Índice de Riesgo']} />
                <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                  {activeRankingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getRiskHexColor(entry.riskLevel)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabla de Detalle */}
          <div className="lg:col-span-5 border border-slate-100 rounded-2xl overflow-hidden">
            <div className="max-h-[300px] overflow-y-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider sticky top-0 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Segmento</th>
                    <th className="px-4 py-3 text-center">Riesgo</th>
                    <th className="px-4 py-3 text-right">Población</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeRankingData.map((ranking, index) => (
                    <tr key={`${ranking.name}-${index}`} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-700">{ranking.name}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold border ${getRiskColorClass(ranking.riskLevel)}`}>
                          {ranking.score} ({ranking.riskLevel})
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500 font-mono">{ranking.count} col.</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Matriz de Riesgo Integrada (Intralaboral vs Extralaboral) */}
      <div id="psicosocial-matrix-section" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Matriz 5x5 */}
        <div id="matrix-card" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Grid className="w-5 h-5 text-indigo-500" />
              Matriz de Coexistencia de Riesgo 5x5
            </h3>
            <p className="text-xs text-slate-500">Cruce de riesgo Extralaboral (Eje X) vs Riesgo Intralaboral (Eje Y). Concentración de población en porcentaje.</p>
          </div>

          <div className="grid grid-cols-6 gap-2 text-center text-xs font-semibold text-slate-600">
            {/* Eje Y Label */}
            <div className="col-span-1 flex flex-col justify-between py-8 text-slate-500 text-[10px] uppercase font-bold tracking-wider select-none pr-2 text-right">
              <div>Muy Alto</div>
              <div>Alto</div>
              <div>Medio</div>
              <div>Bajo</div>
              <div>Muy Bajo</div>
            </div>

            {/* Grid 5x5 */}
            <div className="col-span-5 grid grid-cols-5 gap-2.5">
              {(['Muy Alto', 'Alto', 'Medio', 'Bajo', 'Muy Bajo'] as RiskLevel[]).map((yLevel) => {
                return (['Muy Bajo', 'Bajo', 'Medio', 'Alto', 'Muy Alto'] as RiskLevel[]).map((xLevel) => {
                  const cell = matrix.find(c => c.x === xLevel && c.y === yLevel);
                  const percentage = cell ? cell.value : 0;
                  
                  // Color intensities depending on risk and count
                  let bgClass = 'bg-slate-50 border-slate-100 text-slate-400';
                  if (percentage > 0) {
                    if (cell?.level === 'Muy Alto') bgClass = 'bg-red-500 text-white border-red-600 shadow-sm';
                    else if (cell?.level === 'Alto') bgClass = 'bg-orange-400 text-white border-orange-500';
                    else if (cell?.level === 'Medio') bgClass = 'bg-amber-300 text-slate-800 border-amber-400';
                    else bgClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  }

                  return (
                    <div
                      key={`${xLevel}_${yLevel}`}
                      id={`cell-${xLevel}-${yLevel}`}
                      className={`h-12 flex flex-col items-center justify-center rounded-xl border text-[11px] font-mono transition-all ${bgClass}`}
                      title={`Extralaboral: ${xLevel} | Intralaboral: ${yLevel}`}
                    >
                      {percentage > 0 ? (
                        <>
                          <span className="font-bold">{percentage}%</span>
                        </>
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  );
                });
              })}
              
              {/* Eje X Labels */}
              {['Muy Bajo', 'Bajo', 'Medio', 'Alto', 'Muy Alto'].map((lbl) => (
                <div key={lbl} className="text-[10px] text-slate-500 uppercase font-bold py-1 select-none">
                  {lbl}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Eje X: Nivel de Riesgo Extralaboral
          </div>
        </div>

        {/* Listado de Dimensiones con Semáforo Individual */}
        <div id="dimensions-list-card" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Semáforo de Factores</h3>
            <p className="text-xs text-slate-500 mb-4">Clasificación individual de dimensiones</p>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {dimensions.map((dim) => (
              <div
                key={dim.dimensionId}
                id={`dim-semaforo-${dim.dimensionId}`}
                className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 bg-slate-50/40 hover:bg-slate-50 transition-colors"
              >
                <div className="space-y-0.5">
                  <h4 className="text-xs font-semibold text-slate-700 leading-none">{dim.name}</h4>
                  <span className="text-[10px] text-slate-400 font-mono capitalize">{dim.category}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border font-mono ${getRiskColorClass(dim.riskLevel)}`}>
                  {dim.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
