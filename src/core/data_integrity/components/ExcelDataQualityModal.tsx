import React from 'react';
import { 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  HelpCircle, 
  X, 
  ShieldCheck, 
  Layers, 
  Table, 
  ArrowRight,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { DataQualityReport } from '../types';

interface ExcelDataQualityModalProps {
  report: DataQualityReport;
  filename: string;
  onConfirmContinue: () => void;
  onClose: () => void;
}

export function ExcelDataQualityModal({
  report,
  filename,
  onConfirmContinue,
  onClose
}: ExcelDataQualityModalProps) {
  const fieldMetrics = Object.values(report.fieldMetrics || {});

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left my-8 flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-2xl border border-emerald-400/30 text-emerald-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold font-sans">Auditoría de Calidad e Integridad de Datos Excel</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                  {report.coveragePercentage}% Cobertura
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Archivo: <strong className="text-slate-200">{filename}</strong> • {report.totalRecords} Registros Procesados
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Metrics Bar */}
        <div className="bg-slate-100 border-b border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs shrink-0">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Total Registros</span>
            <p className="text-lg font-black text-slate-900 font-mono">{report.totalRecords}</p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Columnas Detectadas</span>
            <p className="text-lg font-black text-indigo-700 font-mono">{report.columnsFound.length}</p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Campos Faltantes</span>
            <p className="text-lg font-black text-amber-600 font-mono">{report.fieldsWithMissingData.length}</p>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-0.5">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Columnas Faltantes</span>
            <p className="text-lg font-black text-rose-600 font-mono">{report.columnsMissing.length}</p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* Missing Columns Notice */}
          {report.columnsMissing.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-600" />
                Columnas no Encontradas en el Archivo ({report.columnsMissing.length})
              </h4>
              <p className="text-xs text-rose-800">
                Las siguientes variables no están presentes en el Excel. El sistema conservará estos indicadores como <strong>null / "Sin dato"</strong> sin inventar datos sintéticos:
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {report.columnsMissing.map((col, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white text-rose-800 border border-rose-300">
                    {col}: NO EXISTE LA COLUMNA ➔ Indicador No Disponible
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Field Quality Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Table className="w-4 h-4 text-indigo-600" />
                Desglose de Cobertura por Variable SG-SST
              </h4>
              <span className="text-xs text-slate-500 font-medium">
                Regla de Trazabilidad Activa (0% no se asume como 0)
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="p-3">Variable / Campo</th>
                    <th className="p-3 text-center">Esperados</th>
                    <th className="p-3 text-center">Válidos</th>
                    <th className="p-3 text-center">Faltantes</th>
                    <th className="p-3 text-center">Cobertura</th>
                    <th className="p-3">Estado de Integridad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                  {fieldMetrics.map((fm) => {
                    let statusBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                    let statusLabel = 'COMPLETO';

                    if (fm.status === 'MISSING') {
                      statusBg = 'bg-slate-100 text-slate-700 border-slate-300';
                      statusLabel = 'SIN DATOS';
                    } else if (fm.status === 'PARTIAL') {
                      statusBg = 'bg-amber-50 text-amber-800 border-amber-200';
                      statusLabel = 'PARCIAL';
                    } else if (fm.status === 'INVALID') {
                      statusBg = 'bg-rose-50 text-rose-800 border-rose-200';
                      statusLabel = 'REGISTROS INVÁLIDOS';
                    }

                    return (
                      <tr key={fm.fieldName} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">
                          {fm.fieldLabel}
                          <span className="block text-[10px] text-slate-400 font-mono">{fm.fieldName}</span>
                        </td>
                        <td className="p-3 text-center font-mono font-bold text-slate-600">{fm.totalRecords}</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700">{fm.validRecords}</td>
                        <td className="p-3 text-center font-mono font-bold text-rose-600">{fm.missingRecords}</td>
                        <td className="p-3 text-center font-mono font-bold text-indigo-700">{fm.coveragePercentage}%</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusBg}`}>
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Compliance & Policy Footer Disclaimer */}
          <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-indigo-950">
            <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block mb-0.5">Garantía de Cero Datos Sintéticos (SG-SST Standard)</strong>
              <p className="text-indigo-900/90 leading-relaxed">
                El sistema procederá a almacenar únicamente la información original verificada. Ningún dato faltante será rellenado con promedios, fórmulas aleatorias o suposiciones demográficas.
              </p>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Cancelar Importación
          </button>
          
          <button
            type="button"
            onClick={onConfirmContinue}
            className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Aceptar Resumen y Procesar Registros Válidos
          </button>
        </div>

      </motion.div>
    </div>
  );
}
