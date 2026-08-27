import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Table, 
  Download, 
  Wrench, 
  Sparkles, 
  RefreshCw, 
  Info, 
  Database, 
  Check, 
  X, 
  Brain, 
  ListFilter,
  Eye,
  Sliders,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  ExcelValidationSummary, 
  RecordValidationDetail, 
  UnrecognizedColumn,
  ManualCorrectionEntry,
  ValidationStatus
} from '../validador.types';
import { validateExcelBuffer, generateErrorReportExcel, CompanyCatalogContext } from '../validadorEngine';
import { generateMandatoryTestExcel } from '../utils/testCasesGenerator';

interface ValidadorExcelModuleProps {
  onImportConfirmed?: (validRecordsOnly: boolean, summary: ExcelValidationSummary) => void;
  companyCatalogs?: CompanyCatalogContext;
}

export function ValidadorExcelModule({ onImportConfirmed, companyCatalogs }: ValidadorExcelModuleProps) {
  const [summary, setSummary] = useState<ExcelValidationSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'ONLY_VALID' | 'ALL'>('ONLY_VALID');
  const [activeTab, setActiveTab] = useState<'matrix' | 'unrecognized' | 'preview' | 'ai'>('matrix');
  
  // Correction modal state
  const [selectedCorrection, setSelectedCorrection] = useState<{
    rowNumber: number;
    fieldKey: string;
    fieldLabel: string;
    originalValue: any;
    suggestedValue: string;
  } | null>(null);
  const [manualCorrectionInput, setManualCorrectionInput] = useState<string>('');

  // Selected test scenario state
  const [testScenarioIdx, setTestScenarioIdx] = useState<number | null>(null);

  // Handle uploading real Excel file
  const handleFileUpload = (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buf = e.target?.result as ArrayBuffer;
        if (!buf) {
          throw new Error('No se pudo cargar el buffer del archivo.');
        }
        const result = validateExcelBuffer(buf, file.name, companyCatalogs);
        setSummary(result);
      } catch (err: any) {
        setErrorMessage(err.message || 'Error al procesar y validar el archivo Excel.');
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Run one of the 14 mandatory test cases (Section 29)
  const handleRunTestCase = (testIdx: number) => {
    setTestScenarioIdx(testIdx);
    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        const { buffer, name } = generateMandatoryTestExcel(testIdx);
        const result = validateExcelBuffer(buffer, name, companyCatalogs);
        setSummary(result);
      } catch (err: any) {
        setErrorMessage(`Error ejecutando escenario de prueba: ${err.message}`);
      } finally {
        setIsProcessing(false);
      }
    }, 400);
  };

  // Download Error Report Excel (Section 23)
  const handleDownloadErrorReport = () => {
    if (!summary) return;
    const excelBytes = generateErrorReportExcel(summary);
    const blob = new Blob([excelBytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Errores_${summary.fileName.replace('.xlsx', '').replace('.xls', '')}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Confirm manual correction directly in UI (Section 21)
  const handleApplyCorrection = () => {
    if (!selectedCorrection || !summary) return;

    const { rowNumber, fieldKey } = selectedCorrection;
    const newValue = manualCorrectionInput.trim();

    // Update summary in state
    setSummary(prev => {
      if (!prev) return null;
      const updatedRecords = prev.records.map(rec => {
        if (rec.rowNumber === rowNumber) {
          const updatedFields = { ...rec.parsedFields, [fieldKey]: newValue };
          // Remove issues for this field
          const updatedIssues = rec.issues.filter(i => i.columnKey !== fieldKey);
          
          let newStatus: ValidationStatus = rec.status;
          if (updatedIssues.some(i => i.status === 'ERROR')) {
            newStatus = 'ERROR';
          } else if (updatedIssues.some(i => i.status === 'WARNING')) {
            newStatus = 'WARNING';
          } else {
            newStatus = 'VALID';
          }

          return {
            ...rec,
            parsedFields: updatedFields,
            issues: updatedIssues,
            status: newStatus
          };
        }
        return rec;
      });

      // Recalculate summary counts
      const validCount = updatedRecords.filter(r => r.status === 'VALID').length;
      const warnCount = updatedRecords.filter(r => r.status === 'WARNING').length;
      const errCount = updatedRecords.filter(r => r.status === 'ERROR').length;

      return {
        ...prev,
        records: updatedRecords,
        validRecordsCount: validCount,
        warningRecordsCount: warnCount,
        errorRecordsCount: errCount
      };
    });

    setSelectedCorrection(null);
    setManualCorrectionInput('');
  };

  // System status color map
  const getStatusBadge = (status: ValidationStatus) => {
    switch (status) {
      case 'VALID':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">VALID</span>;
      case 'WARNING':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">WARNING</span>;
      case 'ERROR':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">ERROR</span>;
      case 'NO_DATA':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-100 text-slate-700 border border-slate-300">NO_DATA</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-7xl mx-auto pb-12">
      
      {/* Module Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sistemas ETL & Validación SG-SST</span>
            </div>
            <h2 className="text-2xl font-black font-display tracking-tight text-white leading-tight">
              VALIDADOR DE DATOS EXCEL
            </h2>
            <p className="text-xs text-slate-300 font-medium max-w-2xl leading-relaxed">
              Auditoría previa de calidad de datos Excel. Clasificación de registros, mapeo de catálogos y diagnóstico sin alteración sintética.
            </p>
          </div>

          <div className="bg-rose-500/15 border border-rose-400/30 p-3.5 rounded-2xl max-w-xs text-xs space-y-1">
            <span className="font-extrabold text-rose-300 uppercase tracking-wider text-[10px] block flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              REGLA ABSOLUTA ACTIVA
            </span>
            <p className="text-[11px] text-slate-200 font-medium leading-snug">
              El sistema <strong>NUNCA</strong> completa automáticamente datos faltantes. No crea datos artificiales ni utiliza Math.random() o valores prediseñados.
            </p>
          </div>
        </div>

        {/* 1. Import Flow Stepper (Section 1) */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-[10px] font-extrabold uppercase text-slate-400">
          {[
            '1. Seleccionar',
            '2. Leer Excel',
            '3. Encabezados',
            '4. Mapear',
            '5. Estructura',
            '6. Catálogos',
            '7. Calidad',
            '8. Confirmar'
          ].map((step, sIdx) => (
            <div 
              key={sIdx} 
              className={`p-2 rounded-xl text-center border ${
                summary 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                  : sIdx === 0 
                  ? 'bg-indigo-600 text-white border-indigo-500' 
                  : 'bg-slate-800/50 text-slate-500 border-slate-800'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      {/* Upload & Test Scenarios Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Real File Uploader Dropzone */}
        <div className="md:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-indigo-600" />
            Cargar Archivo Excel para Auditoría
          </h3>
          
          <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30 p-8 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all">
            <FileSpreadsheet className="w-10 h-10 text-indigo-500 mb-2 animate-bounce" />
            <span className="text-xs font-black text-slate-800">Haz clic o arrastra aquí tu archivo Excel</span>
            <span className="text-[10px] text-slate-400 mt-1">Soporta formato .xlsx, .xls y .csv</span>
            <input 
              type="file" 
              accept=".xlsx,.xls,.csv" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }} 
            />
          </label>

          {isProcessing && (
            <div className="p-3 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Procesando y auditando calidad de información...
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Section 29: Mandatory Test Scenarios Selector */}
        <div className="md:col-span-6 bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              Pruebas Obligatorias de Calidad (Section 29)
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-100 text-indigo-800">14 Escenarios</span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">
            Prueba el comportamiento del validador ante diferentes tipos de errores y variaciones de datos reales:
          </p>

          <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
            {[
              '1. Excel Completo',
              '2. Parcialmente Diligenciado',
              '3. Sin Columnas Salud',
              '4. Columnas Adicionales',
              '5. Valores Inválidos',
              '6. Registros Duplicados',
              '7. Sedes Inexistentes',
              '8. Áreas Inexistentes',
              '9. Proyectos Inexistentes',
              '10. Pesos Vacíos',
              '11. Estaturas Vacías',
              '12. Sin Actividad Física',
              '13. Sin Tipo Contrato',
              '14. Múltiples Empresas'
            ].map((testName, tIdx) => (
              <button
                key={tIdx}
                onClick={() => handleRunTestCase(tIdx)}
                className={`p-2 rounded-xl text-[11px] font-bold text-left transition-all border cursor-pointer ${
                  testScenarioIdx === tIdx
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                {testName}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* 2. Pantalla de Resultados ("VALIDACIÓN DEL ARCHIVO") (Section 2) */}
      {summary && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden space-y-6 p-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Resumen de Evaluación</span>
              <h3 className="text-xl font-black text-slate-900 font-display">VALIDACIÓN DEL ARCHIVO</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Archivo: <strong className="text-slate-800">{summary.fileName}</strong> ({summary.fileSize})
              </p>
            </div>

            {/* Quality Percentage Badge */}
            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 shrink-0">
              <div className="text-right">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 block">Nivel de Calidad</span>
                <span className="text-xs font-black text-slate-800">{summary.qualityLevel}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-lg font-black font-mono shadow-xs">
                {summary.qualityPercentage}%
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[9px] block">Número de Filas</span>
              <span className="text-base font-black text-slate-900 font-mono">{summary.totalRows}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
              <span className="text-slate-400 font-bold uppercase text-[9px] block">Columnas Detectadas</span>
              <span className="text-base font-black text-indigo-600 font-mono">{summary.detectedColumnsCount}</span>
            </div>
            <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 space-y-1">
              <span className="text-emerald-700 font-bold uppercase text-[9px] block">Registros Válidos</span>
              <span className="text-base font-black text-emerald-800 font-mono">{summary.validRecordsCount}</span>
            </div>
            <div className="bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200 space-y-1">
              <span className="text-amber-700 font-bold uppercase text-[9px] block">Advertencias</span>
              <span className="text-base font-black text-amber-800 font-mono">{summary.warningRecordsCount}</span>
            </div>
            <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-200 space-y-1">
              <span className="text-rose-700 font-bold uppercase text-[9px] block">Errores</span>
              <span className="text-base font-black text-rose-800 font-mono">{summary.errorRecordsCount}</span>
            </div>
            <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-300 space-y-1">
              <span className="text-slate-500 font-bold uppercase text-[9px] block">Sin Datos / NO_DATA</span>
              <span className="text-base font-black text-slate-700 font-mono">{summary.noDataRecordsCount}</span>
            </div>
          </div>

          {/* Tab Controls for detailed breakdown */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 max-w-2xl text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'matrix' ? 'bg-white text-indigo-600 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Matriz de Calidad ({summary.matrix.length})
            </button>
            <button
              onClick={() => setActiveTab('unrecognized')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'unrecognized' ? 'bg-white text-indigo-600 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Col. No Reconocidas ({summary.unrecognizedColumns.length})
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'preview' ? 'bg-white text-indigo-600 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Previsualización 20 Filas
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                activeTab === 'ai' ? 'bg-white text-indigo-600 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Diagnóstico IA (Sec. 28)
            </button>
          </div>

          {/* Tab 1: Matriz de Calidad (Section 18 & 19) */}
          {activeTab === 'matrix' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Table className="w-4 h-4 text-indigo-600" />
                  MATRIZ DE CALIDAD POR VARIABLE (COBERTURA)
                </h4>
                <span className="text-[11px] text-slate-400 font-semibold">VARIABLE | TOTAL | VÁLIDOS | VACÍOS | ERRORES | COBERTURA %</span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                      <th className="p-3">Variable</th>
                      <th className="p-3">Encabezado Excel</th>
                      <th className="p-3 text-center">Total</th>
                      <th className="p-3 text-center">Válidos</th>
                      <th className="p-3 text-center">Vacíos</th>
                      <th className="p-3 text-center">Errores</th>
                      <th className="p-3 text-center">Cobertura</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {summary.matrix.map((row) => (
                      <tr key={row.fieldName} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                          <span>{row.fieldLabel}</span>
                          {row.isMandatory && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-black bg-rose-100 text-rose-800">OBLIGATORIO</span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-500">{row.excelHeaderMapped || '(No mapeada)'}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-700">{row.totalRecords}</td>
                        <td className="p-3 text-center font-mono font-bold text-emerald-700">{row.validRecords}</td>
                        <td className="p-3 text-center font-mono font-bold text-slate-500">{row.emptyRecords}</td>
                        <td className="p-3 text-center font-mono font-bold text-rose-600">{row.errorRecords}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-16 bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${row.coveragePercentage >= 90 ? 'bg-emerald-500' : row.coveragePercentage >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                                style={{ width: `${row.coveragePercentage}%` }} 
                              />
                            </div>
                            <span className="font-mono font-black text-slate-800">{row.coveragePercentage}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Columnas No Reconocidas (Section 5) */}
          {activeTab === 'unrecognized' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  GESTIÓN DE COLUMNAS NO RECONOCIDAS
                </h4>
                <p className="text-xs text-slate-500 font-medium">Permite conservar datos adicionales mapeándolos o creando nuevos campos.</p>
              </div>

              {summary.unrecognizedColumns.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs font-bold text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  ¡Todas las columnas detectadas fueron mapeadas exitosamente!
                </div>
              ) : (
                <div className="space-y-3">
                  {summary.unrecognizedColumns.map((unrec) => (
                    <div key={unrec.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 block">Columna No Mapeada</span>
                        <h5 className="font-extrabold text-slate-900 text-sm">{unrec.excelHeader}</h5>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">Ejemplo de valor: "{unrec.sampleValue || '(Vacío)'}"</p>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs font-bold">
                        <button
                          onClick={() => {
                            setSummary(prev => prev ? ({
                              ...prev,
                              unrecognizedColumns: prev.unrecognizedColumns.map(u => u.id === unrec.id ? { ...u, action: 'ignore' } : u)
                            }) : null);
                          }}
                          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            unrec.action === 'ignore'
                              ? 'bg-slate-800 text-white border-slate-800'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Ignorar
                        </button>
                        <button
                          onClick={() => {
                            setSummary(prev => prev ? ({
                              ...prev,
                              unrecognizedColumns: prev.unrecognizedColumns.map(u => u.id === unrec.id ? { ...u, action: 'map_manual' } : u)
                            }) : null);
                          }}
                          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            unrec.action === 'map_manual'
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
                          }`}
                        >
                          Mapear Manualmente
                        </button>
                        <button
                          onClick={() => {
                            setSummary(prev => prev ? ({
                              ...prev,
                              unrecognizedColumns: prev.unrecognizedColumns.map(u => u.id === unrec.id ? { ...u, action: 'create_field' } : u)
                            }) : null);
                          }}
                          className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                            unrec.action === 'create_field'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          Crear Nuevo Campo
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Previsualización de las Primeras 20 Filas (Section 20 & 21) */}
          {activeTab === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-indigo-600" />
                  PREVISUALIZACIÓN DE REGISTROS Y CORRECCIÓN MANUAL (PRIMERAS 20 FILAS)
                </h4>
                <p className="text-xs text-slate-500 font-medium">Haz clic en cualquier celda con advertencia o error para corregirla manualmente.</p>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-2xs max-h-[400px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200 sticky top-0">
                      <th className="p-3">Fila</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Cédula</th>
                      <th className="p-3">Sede</th>
                      <th className="p-3">Área</th>
                      <th className="p-3">Cargo</th>
                      <th className="p-3">Tipo Contrato</th>
                      <th className="p-3 text-center">Peso (kg)</th>
                      <th className="p-3 text-center">Estatura (m)</th>
                      <th className="p-3 text-center">IMC</th>
                      <th className="p-3">Hallazgos / Motivos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {summary.records.slice(0, 20).map((rec) => (
                      <tr key={rec.rowNumber} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-500">{rec.rowNumber}</td>
                        <td className="p-3">{getStatusBadge(rec.status)}</td>
                        <td className="p-3 font-mono font-bold">{rec.parsedFields.cedula || '(Vacío)'}</td>
                        
                        {/* Interactive Cell Correction for Sede */}
                        <td 
                          onClick={() => {
                            const issue = rec.issues.find(i => i.columnKey === 'sede');
                            setSelectedCorrection({
                              rowNumber: rec.rowNumber,
                              fieldKey: 'sede',
                              fieldLabel: 'Sede',
                              originalValue: rec.parsedFields.sede,
                              suggestedValue: issue?.suggestion ? issue.suggestion.replace('Sugerencia: "', '').replace('"', '') : ''
                            });
                            setManualCorrectionInput(rec.parsedFields.sede || '');
                          }}
                          className={`p-3 cursor-pointer hover:underline ${
                            rec.issues.some(i => i.columnKey === 'sede') ? 'bg-amber-100/80 text-amber-900 font-bold' : ''
                          }`}
                        >
                          {rec.parsedFields.sede || '(Vacío)'}
                        </td>

                        <td className="p-3">{rec.parsedFields.area || '(Vacío)'}</td>
                        <td className="p-3">{rec.parsedFields.cargo || '(Vacío)'}</td>
                        <td className="p-3">{rec.parsedFields.tipoContrato || '(Vacío)'}</td>
                        
                        <td className="p-3 text-center font-mono">{rec.parsedFields.peso ?? '(null)'}</td>
                        <td className="p-3 text-center font-mono">{rec.parsedFields.estatura ?? '(null)'}</td>
                        <td className="p-3 text-center font-mono font-bold text-indigo-700">{rec.parsedFields.imc ?? '(null)'}</td>
                        
                        <td className="p-3 text-slate-600 text-[11px]">
                          {rec.reasons.length > 0 ? rec.reasons.join(' • ') : 'Registro consistente'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 4: AI Diagnostic Box (Section 28) */}
          {activeTab === 'ai' && (
            <div className="bg-indigo-950 text-white p-6 rounded-2xl space-y-4 border border-indigo-900">
              <div className="flex items-center gap-2 text-indigo-300 font-extrabold text-xs uppercase tracking-wider">
                <Brain className="w-4 h-4 text-cyan-400" />
                Diagnóstico de Calidad IA (Section 28)
              </div>

              <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                {summary.aiDiagnosis.narrative}
              </p>

              <div className="p-3.5 bg-indigo-900/60 rounded-xl border border-indigo-800 text-xs text-indigo-200">
                <strong>Análisis Antropométrico:</strong> {summary.aiDiagnosis.anthropometricCoverageText}
              </div>

              <div className="p-3.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-200 font-semibold">
                ⚠️ {summary.aiDiagnosis.disclaimer}
              </div>
            </div>
          )}

          {/* Section 22 & 23: Partial Import & Download Error Report Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="text-slate-500">Configuración de Importación:</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="importMode" 
                  checked={importMode === 'ONLY_VALID'} 
                  onChange={() => setImportMode('ONLY_VALID')} 
                />
                <span>Importar únicamente registros válidos ({summary.validRecordsCount})</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="importMode" 
                  checked={importMode === 'ALL'} 
                  onChange={() => setImportMode('ALL')} 
                />
                <span>Importar todos los registros ({summary.totalRows})</span>
              </label>
            </div>

            <div className="flex gap-3 shrink-0">
              {summary.errorRecordsCount > 0 && (
                <button
                  type="button"
                  onClick={handleDownloadErrorReport}
                  className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Descargar Reporte de Errores Excel (.xlsx)
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (onImportConfirmed) {
                    onImportConfirmed(importMode === 'ONLY_VALID', summary);
                  }
                }}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirmar e Importar Datos
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Section 21: Manual Correction Modal Dialog */}
      {selectedCorrection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Wrench className="w-4 h-4 text-indigo-600" />
                Corrección Manual de Campo (Section 21)
              </h3>
              <button onClick={() => setSelectedCorrection(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p className="text-slate-600">
                Fila <strong>{selectedCorrection.rowNumber}</strong> - Campo: <strong>{selectedCorrection.fieldLabel}</strong>
              </p>
              <div className="p-2.5 bg-slate-50 rounded-xl font-mono text-slate-700">
                Valor Actual leído: <strong>"{selectedCorrection.originalValue || '(Vacío)'}"</strong>
              </div>

              {selectedCorrection.suggestedValue && (
                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-900 flex items-center justify-between">
                  <span>Sugerencia del Catálogo: <strong>"{selectedCorrection.suggestedValue}"</strong></span>
                  <button 
                    onClick={() => setManualCorrectionInput(selectedCorrection.suggestedValue)}
                    className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold"
                  >
                    Usar
                  </button>
                </div>
              )}

              <div className="space-y-1 pt-2">
                <label className="font-bold text-slate-700 text-[11px]">Nuevo valor verificado:</label>
                <input 
                  type="text" 
                  value={manualCorrectionInput}
                  onChange={(e) => setManualCorrectionInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                onClick={() => setSelectedCorrection(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button 
                onClick={handleApplyCorrection}
                className="px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
              >
                Confirmar Corrección
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
