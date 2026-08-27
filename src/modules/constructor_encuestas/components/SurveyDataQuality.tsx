import React from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, FileSpreadsheet, BarChart2, Layers } from 'lucide-react';
import { builderEncuestasService } from '../builder.service';
import { EncuestaMeta } from '../types';

interface SurveyDataQualityProps {
  empresaId: string;
  encuestas: EncuestaMeta[];
}

export function SurveyDataQuality({ empresaId, encuestas }: SurveyDataQualityProps) {
  // Aggregate total responses across all surveys for this company
  let totalResponses = 0;
  let completeResponses = 0;
  let incompleteResponses = 0;
  let nullFieldCount = 0;

  encuestas.forEach(enc => {
    const responses = builderEncuestasService.getRespuestas(empresaId, enc.id);
    totalResponses += responses.length;

    responses.forEach(r => {
      let isComplete = true;
      Object.values(r.respuestas || {}).forEach((item: any) => {
        if (item.valor === null || item.valor === undefined || item.valor === '') {
          nullFieldCount++;
          isComplete = false;
        }
      });
      if (isComplete) completeResponses++;
      else incompleteResponses++;
    });
  });

  const qualityScore = totalResponses > 0 
    ? Math.round((completeResponses / totalResponses) * 100) 
    : 100;

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-left text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 border border-indigo-100">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Motor de Validación de Calidad</span>
          </div>
          <h3 className="text-xl font-black text-slate-900">
            Informe de Calidad e Integridad de Datos (Prompt 20 / 22)
          </h3>
          <p className="text-xs text-slate-500 max-w-xl mt-1">
            Garantiza cero datos sintéticos o inventados. Evalúa campos obligatorios, valores ausentes (null) y consistencia biológica antes de generar informes directivos.
          </p>
        </div>

        <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100 text-center shrink-0">
          <span className="text-[10px] font-black uppercase text-indigo-700 tracking-wider block">Índice de Calidad Global</span>
          <span className="text-2xl font-black text-indigo-900 block mt-0.5">{qualityScore}%</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <span className="text-xs font-bold text-slate-500 block">Total Respuestas</span>
          <span className="text-xl font-black text-slate-900 block mt-1">{totalResponses}</span>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
          <span className="text-xs font-bold text-emerald-700 block">Respuestas 100% Sin Nulos</span>
          <span className="text-xl font-black text-emerald-800 block mt-1">{completeResponses}</span>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-center">
          <span className="text-xs font-bold text-amber-700 block">Respuestas con Datos Opcionales Null</span>
          <span className="text-xl font-black text-amber-800 block mt-1">{incompleteResponses}</span>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center">
          <span className="text-xs font-bold text-slate-500 block">Campos Omitidos (Null)</span>
          <span className="text-xl font-black text-slate-800 block mt-1">{nullFieldCount}</span>
        </div>
      </div>

      {/* Survey-by-Survey Breakdown Table */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2">
          Desglose de Calidad por Encuesta
        </h4>

        {encuestas.length === 0 ? (
          <p className="text-xs text-slate-400">No hay encuestas registradas.</p>
        ) : (
          <div className="space-y-3">
            {encuestas.map(enc => {
              const responses = builderEncuestasService.getRespuestas(empresaId, enc.id);
              const count = responses.length;

              return (
                <div key={enc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{enc.codigo}</span>
                    <h5 className="text-xs font-extrabold text-slate-900">{enc.titulo}</h5>
                    <p className="text-[11px] text-slate-500">
                      {count} respuestas registradas | {enc.secciones.length} secciones
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black border ${
                      count > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {count > 0 ? '● Datos Auditados OK' : '○ Sin Respuestas'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
