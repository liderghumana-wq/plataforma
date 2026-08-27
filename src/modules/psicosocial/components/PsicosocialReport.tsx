import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { FileText, FileSpreadsheet, CheckCircle2, Download, Printer, ShieldAlert } from 'lucide-react';
import { PsicosocialData, PsicosocialActionPlanItem } from '../psicosocial.types';

interface PsicosocialReportProps {
  data: PsicosocialData;
}

export const PsicosocialReport: React.FC<PsicosocialReportProps> = ({ data }) => {
  const [plan, setPlan] = useState<PsicosocialActionPlanItem[]>([]);

  useEffect(() => {
    const storageKey = `psicosocial_plan_items_${data.totalParticipants}_${data.globalScore}`;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setPlan(JSON.parse(stored));
      } catch (e) {
        setPlan([]);
      }
    }
  }, [data]);

  const exportPlanToExcel = () => {
    if (plan.length === 0) return;

    const headers = [
      'ID Actividad',
      'Dimensión / Factor',
      'Objetivo de la Intervención',
      'Actividad Concreta',
      'Cargo Responsable',
      'Plazo Estimado',
      'Indicador de Éxito',
      'Presupuesto Estimado (COP)',
      'Prioridad de Ejecución',
      'Estado Actual'
    ];

    const rows = plan.map(item => [
      item.id,
      item.factor,
      item.objective,
      item.activity,
      item.responsible,
      item.date,
      item.indicator,
      item.cost,
      item.priority,
      item.status
    ]);

    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const colWidths = headers.map(() => ({ wch: 20 }));
    colWidths[2] = { wch: 35 }; // Wider column for objective
    colWidths[3] = { wch: 35 }; // Wider column for activity
    ws['!cols'] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Plan de Intervencion");
    
    XLSX.writeFile(wb, `Plan_Intervencion_Psicosocial_${data.totalParticipants}_colaboradores.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="psicosocial-report-root" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Exportar a Excel */}
      <div id="card-export-excel" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col justify-between min-h-[300px]">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Exportar Plan de Acción a Excel</h3>
            <p className="text-sm text-slate-500 leading-relaxed mt-1">
              Descarga un archivo estructurado con todas las actividades preventivas de riesgo psicosocial registradas. Ideal para reportes ante entes normativos, juntas directivas o comités de SST.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium font-mono">{plan.length} acciones listas para exportar</span>
          <button
            id="btn-export-plan-excel"
            onClick={exportPlanToExcel}
            disabled={plan.length === 0}
            className={`py-3 px-5 text-xs font-semibold rounded-xl flex items-center gap-2 transition-all shadow-sm ${
              plan.length === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            Descargar Libro de Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Imprimir Informe Ejecutivo PDF */}
      <div id="card-print-pdf" className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm flex flex-col justify-between min-h-[300px]">
        <div className="space-y-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Imprimir Informe de Diagnóstico</h3>
            <p className="text-sm text-slate-500 leading-relaxed mt-1">
              Genera una versión imprimible limpia con el mapa de calor radial, segmentaciones por cargos, alertas críticas automatizadas y conclusiones consolidadas de la IA para archivar en PDF.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-medium font-mono">Formato optimizado A4</span>
          <button
            id="btn-print-executive"
            onClick={handlePrint}
            className="py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Guardar en PDF
          </button>
        </div>
      </div>
    </div>
  );
};
