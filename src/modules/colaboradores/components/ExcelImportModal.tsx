import React, { useState } from 'react';
import { X, FileSpreadsheet, Upload, Download, CheckCircle2, AlertTriangle, RefreshCw, FileText, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { colaboradoresService } from '../colaboradoresService';
import { ImportacionExcelResult } from '../types';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentCompanyId?: string;
}

export function ExcelImportModal({
  isOpen,
  onClose,
  onSuccess,
  currentCompanyId = 'empresa_main_001'
}: ExcelImportModalProps) {

  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [fileName, setFileName] = useState('');
  const [importResult, setImportResult] = useState<ImportacionExcelResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csvHeader = "Identificación,TipoDoc,Nombres,Apellidos,Correo,Area,Cargo,Sede,Telefono,Genero,FechaIngreso\n";
    const csvRows = [
      "1020304050,CC,Juan Carlos,Pérez Gómez,juan.perez@empresa.com,Gestión Humana,Analista SST,Sede Principal Bogotá,3101234567,Masculino,2024-01-15",
      "52999888,CC,Laura Marcela,Vargas Ríos,laura.vargas@empresa.com,Operaciones,Coordinador,Sede Medellín,3159876543,Femenino,2023-06-01",
      "1098765432,CE,Robert,Smith,robert.smith@empresa.com,Tecnología,Desarrollador Senior,Sede Remoto,3001112233,Masculino,2025-02-10"
    ].join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'Plantilla_Carga_Masiva_Colaboradores.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const parseCSVText = (content: string) => {
    const lines = content.split(/\r\n|\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows: Record<string, any>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
      if (currentLine.length === headers.length || currentLine.length >= 3) {
        const obj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          obj[h] = currentLine[idx] || '';
        });
        rows.push(obj);
      }
    }

    return rows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      setRawText(text);
      const rows = parseCSVText(text);
      setParsedRows(rows);
      setImportResult(null);
    };

    reader.readAsText(file);
  };

  const handleLoadSampleData = () => {
    const sampleCsv = `Identificación,TipoDoc,Nombres,Apellidos,Correo,Area,Cargo,Sede,Telefono,Genero,FechaIngreso
1019283746,CC,Lina María,Castro Osorio,lina.castro@innovatechit.com.co,Gestión Humana,Analista SST,Sede Principal Bogotá,3124445566,Femenino,2025-03-01
80777666,CC,Guillermo,Mendoza Ruiz,guillermo.mendoza@innovatechit.com.co,Tecnología,Líder de Desarrollo,Sede Principal Bogotá,3189990011,Masculino,2023-11-15
52444333,CC,Sofia,Restrepo Calle,sofia.restrepo@innovatechit.com.co,Operaciones,Coordinador SST,Sede Medellín,3002223344,Femenino,2024-07-20`;

    setFileName('Plantilla_Demo_Colaboradores.csv');
    setRawText(sampleCsv);
    setParsedRows(parseCSVText(sampleCsv));
    setImportResult(null);
  };

  const handleExecuteImport = () => {
    if (parsedRows.length === 0) {
      alert('Por favor seleccione o cargue un archivo con registros válidos.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const res = colaboradoresService.procesarImportacionExcel(parsedRows, currentCompanyId, 'usr_lider_ghumana');
      setImportResult(res);
      setIsProcessing(false);
      if (res.exitosos > 0) {
        onSuccess();
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] text-left text-slate-800"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
              <span>Importar Colaboradores desde Excel / CSV</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Carga masiva homologada con actualización automática de relaciones (Sede, Área, Cargo, Contrato).
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-bold text-slate-700 flex-1">
          
          {/* Top instruction & Template button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <div className="space-y-0.5">
              <span className="font-black text-emerald-950 block">Descargar Plantilla Estándar Excel/CSV</span>
              <p className="text-[11px] text-emerald-800 font-medium">Use nuestra estructura homologada para garantizar la calidad de los datos.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span>Descargar CSV</span>
              </button>

              <button
                type="button"
                onClick={handleLoadSampleData}
                className="px-3.5 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Cargar Demo</span>
              </button>
            </div>
          </div>

          {/* File input drag and drop area */}
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3 hover:border-indigo-500 transition-colors bg-slate-50/50">
            <Upload className="w-8 h-8 text-slate-400 mx-auto" />
            
            <div className="space-y-1">
              <p className="text-xs font-extrabold text-slate-800">Seleccione o arrastre su archivo .CSV o .XLSX</p>
              <p className="text-[10px] text-slate-400">Archivos delimitados por comas o codificación UTF-8</p>
            </div>

            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-input"
            />

            <label
              htmlFor="file-upload-input"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Examinar Archivo</span>
            </label>

            {fileName && (
              <p className="text-xs font-mono font-bold text-indigo-600">
                Archivo Cargado: {fileName} ({parsedRows.length} registros detectados)
              </p>
            )}
          </div>

          {/* Execution Result Banner */}
          {importResult && (
            <div className={`p-4 rounded-2xl border space-y-2 ${
              importResult.fallidos === 0 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}>
              <div className="flex items-center justify-between font-black text-xs">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Resultado de la Importación Masiva</span>
                </span>
                <span className="font-mono">{importResult.exitosos} / {importResult.registrosProcesados} Exitosos</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-200/60 font-medium">
                <div>Nuevos creados: <strong className="font-mono text-emerald-700">{importResult.nuevos}</strong></div>
                <div>Actualizados: <strong className="font-mono text-indigo-700">{importResult.actualizados}</strong></div>
                <div>Errores: <strong className="font-mono text-rose-700">{importResult.fallidos}</strong></div>
              </div>

              {importResult.errores.length > 0 && (
                <div className="pt-2 space-y-1 text-[10.5px]">
                  <span className="font-bold text-rose-700 block">Detalle de Errores:</span>
                  {importResult.errores.map((err, i) => (
                    <div key={i} className="text-rose-800 font-mono">
                      Fila {err.fila} [{err.campo}]: {err.mensaje}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Table Preview */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-slate-900 block">Vista Previa de Registros ({parsedRows.length})</span>
              <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead className="bg-slate-900 text-white font-extrabold uppercase text-[9px]">
                    <tr>
                      <th className="p-2.5">Identificación</th>
                      <th className="p-2.5">Nombres</th>
                      <th className="p-2.5">Apellidos</th>
                      <th className="p-2.5">Correo</th>
                      <th className="p-2.5">Área</th>
                      <th className="p-2.5">Cargo</th>
                      <th className="p-2.5">Sede</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono text-indigo-600 font-bold">{r['Identificación'] || r['Cedula']}</td>
                        <td className="p-2.5">{r['Nombres']}</td>
                        <td className="p-2.5">{r['Apellidos']}</td>
                        <td className="p-2.5 font-mono text-[10px] text-slate-500">{r['Correo']}</td>
                        <td className="p-2.5">{r['Area'] || 'General'}</td>
                        <td className="p-2.5">{r['Cargo'] || 'Analista'}</td>
                        <td className="p-2.5">{r['Sede'] || 'Principal'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 font-bold">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer"
          >
            Cerrar
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0 || isProcessing}
            onClick={handleExecuteImport}
            className={`px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md flex items-center gap-2 cursor-pointer ${
              parsedRows.length === 0 || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            <span>{isProcessing ? 'Procesando Carga...' : `Procesar Importación (${parsedRows.length})`}</span>
          </button>
        </div>

      </motion.div>
    </div>
  );
}
