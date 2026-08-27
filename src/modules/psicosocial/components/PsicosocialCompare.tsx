import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Sliders, RefreshCw, AlertTriangle, CheckCircle, Scale } from 'lucide-react';
import { PsicosocialData } from '../psicosocial.types';
import { PSICOSOCIAL_DIMENSIONS, getRiskColorClass } from '../psicosocial.config';

interface PsicosocialCompareProps {
  data: PsicosocialData;
}

type SegmentKey = 'area' | 'sede' | 'proyecto' | 'cargo';

export const PsicosocialCompare: React.FC<PsicosocialCompareProps> = ({ data }) => {
  const [segType, setSegType] = useState<SegmentKey>('area');
  const [seg1, setSeg1] = useState<string>('');
  const [seg2, setSeg2] = useState<string>('');

  const { employees } = data;

  // Extract unique segment options
  const getOptions = (key: SegmentKey): string[] => {
    const set = new Set(employees.map(e => String(e[key] || '')));
    return (Array.from(set) as string[]).sort();
  };

  const options = getOptions(segType);

  // Set default segments on load or type change
  React.useEffect(() => {
    if (options.length >= 2) {
      setSeg1(options[0]);
      setSeg2(options[1]);
    } else if (options.length > 0) {
      setSeg1(options[0]);
      setSeg2(options[0]);
    } else {
      setSeg1('');
      setSeg2('');
    }
  }, [segType, data]);

  if (options.length === 0) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
        No se encontraron segmentos válidos para comparar.
      </div>
    );
  }

  // Calculate scores for selected segments across the 16 dimensions
  const getSegmentDimensionScores = (val: string): Record<string, number> => {
    const subset = employees.filter(e => e[segType] === val);
    const result: Record<string, number> = {};

    PSICOSOCIAL_DIMENSIONS.forEach(d => {
      const scores = subset.map(e => e.dimensionScores[d.id] || 0);
      result[d.id] = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    });

    return result;
  };

  const scores1 = getSegmentDimensionScores(seg1);
  const scores2 = getSegmentDimensionScores(seg2);

  const getSegmentGlobalAvg = (val: string): number => {
    const subset = employees.filter(e => e[segType] === val);
    return subset.length > 0 ? Math.round(subset.reduce((a, b) => a + b.score, 0) / subset.length) : 0;
  };

  const avg1 = getSegmentGlobalAvg(seg1);
  const avg2 = getSegmentGlobalAvg(seg2);

  // Format data for chart
  const chartData = PSICOSOCIAL_DIMENSIONS.map(d => ({
    name: d.name.length > 20 ? d.name.substring(0, 20) + '...' : d.name,
    [seg1]: scores1[d.id] || 0,
    [seg2]: scores2[d.id] || 0
  }));

  // Find biggest gap
  let biggestGapDim = '';
  let biggestGapVal = -1;
  let gapDirection = '';

  PSICOSOCIAL_DIMENSIONS.forEach(d => {
    const s1 = scores1[d.id] || 0;
    const s2 = scores2[d.id] || 0;
    const gap = Math.abs(s1 - s2);
    if (gap > biggestGapVal) {
      biggestGapVal = gap;
      biggestGapDim = d.name;
      gapDirection = s1 > s2 ? `${seg1} tiene mayor riesgo` : `${seg2} tiene mayor riesgo`;
    }
  });

  return (
    <div id="psicosocial-compare-root" className="space-y-8">
      {/* Selector de Comparación */}
      <div id="compare-selectors" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Sliders className="w-5 h-5 text-indigo-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">Comparador Psicosocial de Segmentos</h3>
            <p className="text-xs text-slate-500 font-medium">Contrasta vulnerabilidades relativas entre áreas, proyectos, sedes u ocupaciones.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">1. Variable de Segmentación</label>
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
              {(['area', 'sede', 'proyecto', 'cargo'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSegType(t)}
                  className={`flex-1 text-center py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                    segType === t
                      ? 'bg-white text-indigo-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {t === 'area' ? 'Áreas' : t === 'sede' ? 'Sedes' : t === 'proyecto' ? 'Proyectos' : 'Cargos'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">2. Comparar Segmento A</label>
            <select
              id="select-seg1"
              value={seg1}
              onChange={(e) => setSeg1(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs font-medium text-slate-700"
            >
              {options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">3. Comparar Segmento B</label>
            <select
              id="select-seg2"
              value={seg2}
              onChange={(e) => setSeg2(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs font-medium text-slate-700"
            >
              {options.filter(o => o !== seg1).map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
              {options.length < 2 && options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Scorecards de Contraste */}
      <div id="compare-scorecards" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Segmento A Score */}
        <div id="score-seg-a" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center">
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-2 inline-block">Grupo A</span>
          <h4 className="text-sm font-semibold text-slate-700 mb-1 max-w-[200px] mx-auto truncate">{seg1}</h4>
          <span className="text-3xl font-black font-mono block mt-2 text-slate-800">{avg1}/100</span>
          <span className="text-xs text-slate-400 font-medium">Índice Promedio de Riesgo</span>
        </div>

        {/* Balance Gaps */}
        <div id="gap-analysis" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center flex flex-col justify-between items-center">
          <Scale className="w-5 h-5 text-indigo-500" />
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Diferencial Global</span>
            <span className="text-2xl font-black font-mono text-indigo-900">{Math.abs(avg1 - avg2)} pts</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {avg1 > avg2 ? `Mayor riesgo en ${seg1}` : avg1 < avg2 ? `Mayor riesgo en ${seg2}` : 'Riesgo equivalente'}
          </span>
        </div>

        {/* Segmento B Score */}
        <div id="score-seg-b" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-center">
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-2 inline-block">Grupo B</span>
          <h4 className="text-sm font-semibold text-slate-700 mb-1 max-w-[200px] mx-auto truncate">{seg2}</h4>
          <span className="text-3xl font-black font-mono block mt-2 text-slate-800">{avg2}/100</span>
          <span className="text-xs text-slate-400 font-medium">Índice Promedio de Riesgo</span>
        </div>
      </div>

      {/* Gráfico y Brecha Crítica */}
      <div id="compare-visuals" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Dual Bar Chart */}
        <div id="card-compare-chart" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm lg:col-span-8">
          <h3 className="text-base font-bold text-slate-800 mb-6">Comparación Detallada por Dimensión</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey={seg1} fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey={seg2} fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gap Alert / Detalle de Brechas */}
        <div id="card-gap-detail" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm lg:col-span-4 flex flex-col justify-between min-h-[350px]">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Mayor Discrepancia</h3>
            <p className="text-xs text-slate-400 mb-6">Dimensión con la brecha más amplia entre ambos grupos</p>
          </div>

          {biggestGapDim && (
            <div className="p-4 bg-indigo-50 border border-indigo-100/50 rounded-2xl space-y-3">
              <AlertTriangle className="w-5 h-5 text-indigo-600" />
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase">Dimensión Afectada:</h4>
                <p className="text-sm font-semibold text-indigo-950">{biggestGapDim}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-xs uppercase">Diferencia Registrada:</h4>
                <p className="text-2xl font-black text-indigo-900 font-mono">{biggestGapVal} puntos</p>
                <span className="text-[11px] text-indigo-700/80 font-medium block mt-1">{gapDirection}</span>
              </div>
            </div>
          )}

          <div className="space-y-2 mt-6 pt-6 border-t border-slate-50 text-xs text-slate-500">
            <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">Prácticas de Mitigación:</h4>
            <p className="leading-relaxed">✔ Diseñar planes de capacitación focalizados en el grupo con mayor riesgo.</p>
            <p className="leading-relaxed">✔ Evitar la homologación homogénea del plan SST; adaptar las acciones a las necesidades de cada segmento.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
