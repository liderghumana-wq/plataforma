import React, { useState, useRef } from 'react';
import { Download, Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';
import { downloadPsicosocialTemplate } from '../psicosocialTemplateGenerator';
import { parsePsicosocialExcelFile } from '../psicosocialParser';
import { PsicosocialData, BatteryType } from '../psicosocial.types';

interface PsicosocialUploadProps {
  onDataLoaded: (data: PsicosocialData) => void;
  currentData: PsicosocialData | null;
}

export const PsicosocialUpload: React.FC<PsicosocialUploadProps> = ({ onDataLoaded, currentData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [batteryType, setBatteryType] = useState<BatteryType>('Resultados Consolidados');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    setSuccess(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(false);
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Por favor, selecciona un archivo válido de Excel (.xlsx o .xls)');
      return;
    }

    setIsLoading(true);
    try {
      const result = await parsePsicosocialExcelFile(file);
      if (result.success && result.data) {
        // Apply selected battery type to overall data for consistency
        const updatedData = {
          ...result.data,
          batteryType: batteryType
        };
        onDataLoaded(updatedData);
        setSuccess(true);
      } else {
        setError(result.error || 'No se pudo procesar el archivo. Revisa el formato.');
      }
    } catch (err: any) {
      setError(`Ocurrió un error inesperado: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div id="psicosocial-upload-container" className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Columna Izquierda: Instrucciones y Descarga */}
      <div id="psicosocial-upload-instructions" className="lg:col-span-1 space-y-6">
        <div id="psicosocial-instructions-card" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 id="inst-title" className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            Batería de Riesgo Psicosocial
          </h3>
          <p id="inst-desc" className="text-sm text-slate-600 mb-6 leading-relaxed">
            Esta sección procesa las dimensiones normativas de riesgo intralaboral, extralaboral y sintomatología de estrés conforme a los estándares de medicina preventiva y del trabajo.
          </p>

          <div id="inst-steps" className="space-y-4 mb-6">
            <div id="step-1" className="flex gap-3">
              <span id="badge-1" className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0">1</span>
              <div>
                <h4 id="h-step-1" className="text-sm font-semibold text-slate-700">Descarga la plantilla</h4>
                <p id="p-step-1" className="text-xs text-slate-500">Obtén la estructura ideal con las 16 dimensiones psicosociales preconfiguradas.</p>
              </div>
            </div>
            <div id="step-2" className="flex gap-3">
              <span id="badge-2" className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0">2</span>
              <div>
                <h4 id="h-step-2" className="text-sm font-semibold text-slate-700">Diligencia tus resultados</h4>
                <p id="p-step-2" className="text-xs text-slate-500">Registra las respuestas o puntajes de cada dimensión de la batería evaluada (0-100).</p>
              </div>
            </div>
            <div id="step-3" className="flex gap-3">
              <span id="badge-3" className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold shrink-0">3</span>
              <div>
                <h4 id="h-step-3" className="text-sm font-semibold text-slate-700">Carga la información</h4>
                <p id="p-step-3" className="text-xs text-slate-500">El sistema procesará automáticamente rankings, mapas de riesgo por sedes, gráficos e informe IA.</p>
              </div>
            </div>
          </div>

          <button
            id="download-template-btn"
            onClick={downloadPsicosocialTemplate}
            className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 border border-indigo-100"
          >
            <Download className="w-4 h-4" />
            Descargar Plantilla Oficial
          </button>
        </div>

        {/* Card de Configuración de Carga */}
        <div id="battery-type-card" className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h4 id="battery-config-title" className="text-sm font-semibold text-slate-700 mb-3">
            Tipo de Instrumento a Analizar
          </h4>
          <div id="battery-radios" className="space-y-2">
            {(['Resultados Consolidados', 'Intralaboral A', 'Intralaboral B', 'Extralaboral', 'Estrés'] as BatteryType[]).map((type) => (
              <label
                key={type}
                id={`label-battery-${type.replace(/\s+/g, '-')}`}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-sm cursor-pointer transition-all ${
                  batteryType === type
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-medium'
                    : 'border-slate-100 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="batteryType"
                  value={type}
                  checked={batteryType === type}
                  onChange={(e) => setBatteryType(e.target.value as BatteryType)}
                  className="w-4 h-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                {type}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Zona de Carga */}
      <div id="psicosocial-upload-zone" className="lg:col-span-2">
        <div
          id="dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileSelect}
          className={`h-full min-h-[350px] bg-white border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
              : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".xlsx, .xls"
          />

          <div id="upload-icon-container" className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 text-indigo-600">
            {isLoading ? (
              <RefreshCw className="w-8 h-8 animate-spin" />
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <h3 id="upload-main-title" className="text-xl font-bold text-slate-800 mb-2">
            {isLoading ? 'Procesando Batería...' : 'Arrastra tu archivo aquí'}
          </h3>
          <p id="upload-sub-title" className="text-slate-500 text-sm mb-6 max-w-md">
            {isLoading
              ? 'Estamos estructurando y recalculando dimensiones, niveles de estrés y rankings demográficos...'
              : 'o haz clic para explorar en tu ordenador. Solo se admiten archivos .xlsx o .xls con estructura de datos.'}
          </p>

          {/* Feedback de Estado */}
          {error && (
            <div id="upload-error" className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm max-w-lg mb-6">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
              <p className="text-left">{error}</p>
            </div>
          )}

          {success && (
            <div id="upload-success" className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 text-sm max-w-lg mb-6">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <p className="text-left">¡Batería de Riesgo Psicosocial cargada y estructurada con éxito!</p>
            </div>
          )}

          {currentData && !isLoading && (
            <div id="active-file-indicator" className="mt-4 px-4 py-2 bg-indigo-50/50 rounded-full border border-indigo-100 text-xs text-indigo-700 font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Archivo activo: {currentData.totalParticipants} registros analizados ({currentData.batteryType})
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
