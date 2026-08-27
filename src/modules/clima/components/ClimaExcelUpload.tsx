import React, { useState } from 'react';
import { UploadCloud, AlertCircle, CheckCircle2, FileSpreadsheet, Info, Award, Settings } from 'lucide-react';
import { parseClimaExcelFile } from '../climaParser';
import { ClimateData } from '../clima.types';
import { downloadClimaExcelTemplate } from '../climaTemplateGenerator';

interface ClimaExcelUploadProps {
  onUploadSuccess: (data: ClimateData, fileName: string) => void;
  savedFileName: string | null;
  onClearData: () => void;
}

export default function ClimaExcelUpload({ onUploadSuccess, savedFileName, onClearData }: ClimaExcelUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [missingCols, setMissingCols] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setIsParsing(true);
    setProgress(15);
    setError(null);
    setMissingCols([]);
    setSuccessMsg(null);

    // Simulate parser progress
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    try {
      const result = await parseClimaExcelFile(file);
      clearInterval(timer);
      setProgress(100);

      setTimeout(() => {
        setIsParsing(false);
        if (result.success && result.data) {
          setSuccessMsg(`¡Archivo "${file.name}" cargado y procesado con éxito!`);
          onUploadSuccess(result.data, file.name);
        } else {
          setError(result.error || 'Ocurrió un error procesando el archivo.');
          if (result.missingColumns) {
            setMissingCols(result.missingColumns);
          }
        }
      }, 300);
    } catch (err: any) {
      clearInterval(timer);
      setIsParsing(false);
      setError(`Error inesperado: ${err.message || err}`);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-2xs space-y-6">
      
      {/* Cabezote descriptivo */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <span>Carga de Base de Datos Clima</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">Sube los resultados de la encuesta de clima en formato Excel para analizar dimensiones organizacionales.</p>
        </div>
        
        <button
          onClick={downloadClimaExcelTemplate}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-slate-200 shadow-3xs cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 text-slate-500" />
          <span>Descargar Plantilla Excel</span>
        </button>
      </div>

      {savedFileName ? (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Archivo Activo en Sesión</p>
              <h3 className="text-sm font-black text-slate-800 font-mono mt-0.5">{savedFileName}</h3>
            </div>
          </div>
          
          <button
            onClick={onClearData}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Eliminar y Cargar Otro
          </button>
        </div>
      ) : (
        <>
          {isParsing ? (
            <div className="border border-slate-100 bg-slate-50/50 rounded-2xl p-10 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin flex items-center justify-center">
                <Settings className="w-5 h-5 text-indigo-600 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-slate-800 text-sm">Validando y Calculando Dimensiones...</h4>
                <p className="text-xs text-slate-500 font-medium">Normalizando datos Likert y segregando por segmentos demográficos.</p>
              </div>
              <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600">{progress}%</span>
            </div>
          ) : (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/40 shadow-inner'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
              }`}
            >
              <UploadCloud className={`w-12 h-12 mb-4 transition-transform ${dragActive ? 'scale-110 text-indigo-500' : 'text-slate-400'}`} />
              <p className="text-sm font-extrabold text-slate-800 mb-1">
                Arrastra tu archivo aquí, o <label htmlFor="clima-file-input" className="text-indigo-600 hover:text-indigo-700 underline cursor-pointer font-black">explora en tu equipo</label>
              </p>
              <p className="text-xs text-slate-500 font-medium mb-4">Soporta formatos de Excel (.xlsx, .xls) parametrizables con dimensiones Likert.</p>
              <input
                type="file"
                id="clima-file-input"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}
        </>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5 flex gap-4 text-red-800 text-xs text-left">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="font-extrabold text-red-900 text-sm">Error de Estructura de Archivo</p>
            <p className="font-medium text-red-700 leading-relaxed">{error}</p>
            {missingCols.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-red-100">
                <p className="font-extrabold text-red-800">Preguntas o columnas guía sugeridas no encontradas:</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {missingCols.slice(0, 10).map((col, idx) => (
                    <span key={idx} className="bg-red-100 text-red-700 font-mono font-bold px-2 py-0.5 rounded text-[10px] border border-red-200">
                      {col}
                    </span>
                  ))}
                  {missingCols.length > 10 && (
                    <span className="text-[10px] text-red-500 font-bold self-center">y {missingCols.length - 10} más...</span>
                  )}
                </div>
                <p className="text-slate-500 text-[10px] leading-relaxed pt-1.5">
                  Tip: Para asegurar compatibilidad inmediata, se aconseja descargar la plantilla optimizada de arriba y completarla con los resultados de tu encuesta. El motor mapea dinámicamente según sinónimos habituales.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-emerald-800 text-xs text-left">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="font-extrabold text-emerald-900 text-sm">¡Validación Exitosa!</p>
            <p className="font-medium text-emerald-700 mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Caja de instrucciones de arquitectura */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left space-y-3">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-slate-400" />
          <span>Estructura de Encuesta y Validación de Estructura</span>
        </h4>
        <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
          El Motor Universal de Clima mapea y segmenta de forma automatizada las siguientes dimensiones clave del bienestar organizacional:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {[
            'Liderazgo y Dirección',
            'Canales de Comunicación',
            'Trabajo en Equipo',
            'Compensación y Reconocimiento',
            'Desarrollo de Carrera',
            'Ambiente y Bienestar',
            'Sentido de Pertenencia',
            'Segmentación de Sedes',
            'Áreas y Antigüedad'
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-3xs font-semibold">
              <Award className="w-3.5 h-3.5 text-indigo-500" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
