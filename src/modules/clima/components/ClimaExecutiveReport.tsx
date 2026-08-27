import React from 'react';
import { FileText, Printer, ShieldAlert, Award, TrendingUp, Sparkles } from 'lucide-react';
import { ClimateData } from '../clima.types';

interface ClimaExecutiveReportProps {
  data: ClimateData;
}

export default function ClimaExecutiveReport({ data }: ClimaExecutiveReportProps) {
  const { totalParticipants, globalAverage, globalFavorability, dimensions } = data;
  const activeDims = dimensions.filter(d => d.average > 0);

  // Sorting
  const sortedByFav = [...activeDims].sort((a, b) => a.favorability - b.favorability);
  const weakDims = sortedByFav.slice(0, 2);
  const strongDims = sortedByFav.slice(-2).reverse();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      
      {/* Botón de impresión (no-print) */}
      <div className="flex justify-end no-print">
        <button
          onClick={handlePrint}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimir / Exportar a PDF</span>
        </button>
      </div>

      {/* Contenedor del informe con estilo formal de impresión */}
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-lg space-y-8 print:p-0 print:border-none print:shadow-none">
        
        {/* Cabezote Formal */}
        <div className="border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 font-display tracking-tight">INFORME EJECUTIVO DE CLIMA ORGANIZACIONAL IA</h1>
            <p className="text-xs font-mono text-indigo-600 uppercase tracking-wider">DIAGNÓSTICO CORPORATIVO Y PLAN DE INTERVENCIÓN</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold text-slate-800">Fecha: {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p className="text-slate-500 mt-0.5">Muestra: <span className="font-bold text-slate-700">{totalParticipants} Participantes</span></p>
          </div>
        </div>

        {/* Declaración de Confidencialidad */}
        <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-[10px] text-slate-500 font-semibold leading-relaxed">
          <span className="font-black text-slate-700">CONFIDENCIALIDAD:</span> Este informe contiene datos estadísticos agregados procedentes de encuestas confidenciales aplicadas a los colaboradores. La información ha sido anonimizada y procesada de conformidad con las directrices de Protección de Datos Personales (Habeas Data) y normativas corporativas de Bienestar.
        </div>

        {/* 1. Resumen Ejecutivo */}
        <div className="space-y-3">
          <h2 className="text-sm font-black text-slate-900 font-display uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
            <TrendingUp className="w-4.5 h-4.5 text-indigo-600" />
            <span>1. Diagnóstico Global del Clima</span>
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed font-semibold">
            Del procesamiento del archivo cargado, se reporta una favorabilidad promedio global del <span className="font-bold text-indigo-600">{globalFavorability}%</span>, con una puntuación Likert media de <span className="font-bold text-indigo-600">{globalAverage} sobre 5.0</span>.
            Esto clasifica el clima organizacional de la empresa en un rango <span className="font-bold text-slate-700">{globalFavorability >= 75 ? 'Excelente / Favorable' : globalFavorability >= 60 ? 'Favorable / Estable con Oportunidades' : 'Alerta de Intervención / Crítico'}</span>.
          </p>
        </div>

        {/* 2. Fortalezas y Oportunidades */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Fortalezas */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100 uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Fortalezas Organizacionales</span>
            </h3>
            <ul className="space-y-2 text-xs">
              {strongDims.map((dim, i) => (
                <li key={i} className="text-slate-600 pl-4 relative">
                  <span className="absolute left-0 top-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <strong className="text-slate-800">{dim.name} ({dim.favorability}%):</strong> {dim.description}
                </li>
              ))}
            </ul>
          </div>

          {/* Oportunidades */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-rose-700 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Oportunidades de Mejora Críticas</span>
            </h3>
            <ul className="space-y-2 text-xs">
              {weakDims.map((dim, i) => (
                <li key={i} className="text-slate-600 pl-4 relative">
                  <span className="absolute left-0 top-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  <strong className="text-slate-800">{dim.name} ({dim.favorability}%):</strong> {dim.description}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. Tabla General de Dimensiones */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-900 font-display uppercase tracking-wider border-b border-slate-100 pb-2">
            2. Matriz General de Desempeño
          </h2>
          <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-wider border-b border-slate-150">
                <tr>
                  <th className="px-5 py-3">Dimensión Evaluada</th>
                  <th className="px-5 py-3 text-center">Respuestas</th>
                  <th className="px-5 py-3 text-center">Promedio (1-5)</th>
                  <th className="px-5 py-3 text-center">Favorabilidad (%)</th>
                  <th className="px-5 py-3 text-right">Estatus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {activeDims.map((dim) => {
                  const isLow = dim.favorability < 60;
                  const isHigh = dim.favorability >= 75;
                  
                  return (
                    <tr key={dim.dimensionId} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3.5">
                        <p className="font-extrabold text-slate-800">{dim.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{dim.description}</p>
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono text-slate-500">{totalParticipants}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold">{dim.average}</td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-900">{dim.favorability}%</td>
                      <td className="px-5 py-3.5 text-right">
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold border ${
                          isHigh ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          isLow ? 'bg-rose-50 text-rose-600 border-rose-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`}>
                          {isHigh ? 'Fuerte' : isLow ? 'Crítico' : 'Estable'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Conclusiones y Firma */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">3. Conclusiones Directivas</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Este diagnóstico constituye la línea base para la planificación estratégica de Recursos Humanos. Se recomienda firmemente estructurar los planes de capacitación de mandos medios basándose en la dimensión de liderazgo, y socializar con el Comité de Convivencia los resultados de clima para trazar un plan co-diseñado y transparente.
            </p>
          </div>
          
          <div className="flex flex-col items-center justify-end text-center space-y-1.5 pt-6 md:pt-0">
            <div className="w-32 border-b border-slate-300 h-10" />
            <p className="text-xs font-extrabold text-slate-800">Director de Gestión Humana</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Líder del Comité de Clima</p>
          </div>
        </div>

      </div>

    </div>
  );
}
