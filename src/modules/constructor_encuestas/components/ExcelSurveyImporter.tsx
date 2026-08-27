import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileSpreadsheet, 
  X, 
  Info, 
  ArrowRight, 
  RefreshCw,
  ShieldCheck,
  Check
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { EncuestaMeta, PreguntaConfig } from '../types';
import { builderEncuestasService } from '../builder.service';

interface ExcelSurveyImporterProps {
  encuesta: EncuestaMeta;
  empresaId: string;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
}

interface ColumnMap {
  header: string;
  question: PreguntaConfig | null;
  recognized: boolean;
}

interface RowValidation {
  rowIndex: number;
  data: Record<string, any>;
  errors: Array<{ questionId: string; questionTitle: string; message: string }>;
  warnings: Array<{ questionId: string; questionTitle: string; message: string }>;
  isValid: boolean;
  selectedForImport: boolean;
}

export function ExcelSurveyImporter({
  encuesta,
  empresaId,
  onClose,
  onImportSuccess
}: ExcelSurveyImporterProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'complete'>('upload');
  const [columns, setColumns] = useState<ColumnMap[]>([]);
  const [rowValidations, setRowValidations] = useState<RowValidation[]>([]);
  const [unrecognizedHeaders, setUnrecognizedHeaders] = useState<string[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [fileName, setFileName] = useState('');

  // Extract all questions from survey sections
  const allQuestions = encuesta.secciones.flatMap(s => s.preguntas);

  // 1. Generate & Download Official Excel Template
  const handleDownloadTemplate = () => {
    const headers = ['Identificacion_Colaborador', 'Nombre_Colaborador'];
    allQuestions.forEach(q => {
      headers.push(`[${q.id}] ${q.titulo}`);
    });

    // Sample Row
    const sampleRow: Record<string, string> = {
      'Identificacion_Colaborador': '1018234567',
      'Nombre_Colaborador': 'Juan Carlos Pérez'
    };

    allQuestions.forEach(q => {
      let sampleVal = '';
      if (q.tipo === 'sino') sampleVal = 'Sí';
      else if (q.tipo === 'numero') sampleVal = '35';
      else if (q.tipo === 'fecha') sampleVal = '1990-05-15';
      else if (q.tipo === 'lista' || q.tipo === 'radio') {
        sampleVal = q.opciones?.[0]?.value || 'Opción 1';
      } else if (q.tipo === 'multiple_seleccion') {
        sampleVal = q.opciones?.slice(0, 2).map(o => o.value).join('; ') || 'Opción A; Opción B';
      } else {
        sampleVal = 'Dato de prueba';
      }
      sampleRow[`[${q.id}] ${q.titulo}`] = sampleVal;
    });

    // Instructions Sheet Data
    const instructions = [
      ['INSTRUCCIONES PARA DILIGENCIAR LA PLANTILLA EXCEL DE LA ENCUESTA'],
      ['1. No modifique los encabezados de las columnas (especialmente los códigos [preg-XXX]).'],
      ['2. Las preguntas de tipo Sí/No aceptan únicamente: "Sí", "No" o dejarse vacío si no aplica.'],
      ['3. Las preguntas con opciones múltiples deben separarse con punto y coma (;).'],
      ['4. REGLA DE ORO DE CALIDAD DE DATOS: Si una pregunta no fue respondida, déjela en blanco (null). NUNCA invente respuestas.'],
      ['5. Guarde el archivo en formato .xlsx antes de cargarlo a la plataforma.']
    ];

    const wb = XLSX.utils.book_new();
    const wsData = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);

    XLSX.utils.book_append_sheet(wb, wsData, 'Plantilla Respuestas');
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instrucciones');

    XLSX.writeFile(wb, `Plantilla_Encuesta_${encuesta.codigo}_${Date.now()}.xlsx`);
  };

  // 2. Process Uploaded Excel File
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        
        // Convert to array of JSON objects
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: null });

        if (rawRows.length === 0) {
          alert('El archivo Excel está vacío o no contiene filas de datos.');
          return;
        }

        // Get all headers from first row
        const excelHeaders = Object.keys(rawRows[0]);

        // Map Excel headers to survey questions
        const colMapping: ColumnMap[] = excelHeaders.map(hdr => {
          const matchedQ = allQuestions.find(q => {
            // Match by exact ID tag like [preg-1-nombre]
            if (hdr.includes(`[${q.id}]`)) return true;
            if (hdr.toLowerCase().trim() === q.id.toLowerCase().trim()) return true;
            // Match by exact title
            if (hdr.toLowerCase().trim() === q.titulo.toLowerCase().trim()) return true;
            // Match by system variable
            if (q.nombreVariableSistema && hdr.toLowerCase().trim() === q.nombreVariableSistema.toLowerCase().trim()) return true;
            return false;
          });

          return {
            header: hdr,
            question: matchedQ || null,
            recognized: !!matchedQ || hdr === 'Identificacion_Colaborador' || hdr === 'Nombre_Colaborador'
          };
        });

        const unrec = colMapping.filter(c => !c.recognized).map(c => c.header);
        setColumns(colMapping);
        setUnrecognizedHeaders(unrec);

        // Validate each row according to rules
        const rowValids: RowValidation[] = rawRows.map((row, idx) => {
          const errors: Array<{ questionId: string; questionTitle: string; message: string }> = [];
          const warnings: Array<{ questionId: string; questionTitle: string; message: string }> = [];

          const rowDataMapped: Record<string, any> = {};

          colMapping.forEach(col => {
            const rawVal = row[col.header];

            if (col.question) {
              const q = col.question;
              let cleanVal: any = rawVal;

              // Format cleanVal if null or string
              if (cleanVal === undefined || cleanVal === null || String(cleanVal).trim() === '') {
                cleanVal = null;
              } else {
                cleanVal = String(cleanVal).trim();
              }

              // Check mandatory rule
              if (q.obligatoria && cleanVal === null) {
                errors.push({
                  questionId: q.id,
                  questionTitle: q.titulo,
                  message: `Campo obligatorio sin responder en fila ${idx + 2}.`
                });
              }

              // Check options for select/radio
              if (cleanVal !== null && (q.tipo === 'lista' || q.tipo === 'radio' || q.tipo === 'sino')) {
                if (q.tipo === 'sino') {
                  const norm = cleanVal.toLowerCase();
                  if (norm === 'sí' || norm === 'si' || norm === 's') cleanVal = 'Sí';
                  else if (norm === 'no' || norm === 'n') cleanVal = 'No';
                  else {
                    warnings.push({
                      questionId: q.id,
                      questionTitle: q.titulo,
                      message: `Valor "${rawVal}" ajustado a null por no ser Sí / No.`
                    });
                    cleanVal = null;
                  }
                } else if (q.opciones && q.opciones.length > 0) {
                  const validOpt = q.opciones.find(op => 
                    op.value.toLowerCase() === String(cleanVal).toLowerCase() ||
                    op.label.toLowerCase() === String(cleanVal).toLowerCase()
                  );
                  if (validOpt) {
                    cleanVal = validOpt.value;
                  } else {
                    warnings.push({
                      questionId: q.id,
                      questionTitle: q.titulo,
                      message: `Valor "${rawVal}" no coincide con las opciones del catálogo.`
                    });
                  }
                }
              }

              rowDataMapped[q.id] = cleanVal;
            } else if (col.header === 'Identificacion_Colaborador') {
              rowDataMapped['usuarioIdentificacion'] = rawVal;
            } else if (col.header === 'Nombre_Colaborador') {
              rowDataMapped['usuarioNombre'] = rawVal;
            }
          });

          return {
            rowIndex: idx + 2,
            data: rowDataMapped,
            errors,
            warnings,
            isValid: errors.length === 0,
            selectedForImport: errors.length === 0
          };
        });

        setRowValidations(rowValids);
        setStep('preview');

      } catch (err: any) {
        alert('Error al leer el archivo Excel: ' + (err.message || 'Formato no soportado'));
      }
    };

    reader.readAsBinaryString(file);
  };

  // Toggle row selection
  const toggleRowSelection = (idx: number) => {
    setRowValidations(prev => prev.map(r => r.rowIndex === idx ? { ...r, selectedForImport: !r.selectedForImport } : r));
  };

  // 3. Confirm and Execute Bulk Import
  const handleConfirmImport = () => {
    const selectedRows = rowValidations.filter(r => r.selectedForImport);
    if (selectedRows.length === 0) {
      alert('Seleccione al menos una fila válida para importar.');
      return;
    }

    let imported = 0;
    selectedRows.forEach(rowVal => {
      const mappedResponses: Record<string, any> = {};

      allQuestions.forEach(q => {
        const val = rowVal.data[q.id] !== undefined ? rowVal.data[q.id] : null;
        mappedResponses[q.id] = {
          preguntaId: q.id,
          preguntaTitulo: q.titulo,
          tipo: q.tipo,
          valor: val,
          categoria: q.categoria
        };
      });

      builderEncuestasService.saveRespuesta(empresaId, {
        encuestaId: encuesta.id,
        versionEncuesta: encuesta.version || 1,
        versionLabel: `v${encuesta.version || 1}.0`,
        empresaId,
        tiempoCompletadoSegundos: 120, // Default duration for imported
        respuestas: mappedResponses,
        usuarioNombre: rowVal.data['usuarioNombre'] || 'Colaborador (Excel)',
        usuarioIdentificacion: rowVal.data['usuarioIdentificacion'] || 'Importado'
      });

      imported++;
    });

    setImportedCount(imported);
    setStep('complete');
    onImportSuccess(imported);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto text-slate-800 text-left">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                Módulo de Integración Masiva
              </span>
              <h2 className="text-lg font-black tracking-tight text-white">
                Importación desde Excel — {encuesta.titulo}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* STEP 1: UPLOAD & TEMPLATE DOWNLOAD */}
          {step === 'upload' && (
            <div className="space-y-6">
              
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Garantía de Integridad y Regla de Oro SG-SST</span>
                </div>
                <p>
                  El sistema <strong>NUNCA inventará ni simulará respuestas</strong> para los campos no diligenciados en el Excel. Si una casilla está vacía en el archivo, se guardará como <code>null</code> ("Sin respuesta").
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Download Template Box */}
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 text-center">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center mx-auto">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">1. Descargar Plantilla Oficial</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Descargue el archivo Excel con los encabezados exactos de las {allQuestions.length} preguntas de esta encuesta.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Descargar .XLSX</span>
                  </button>
                </div>

                {/* Upload File Box */}
                <div className="p-6 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-3xl space-y-4 text-center">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">2. Cargar Excel Diligenciado</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Seleccione su archivo diligenciado para procesar y validar las respuestas.
                    </p>
                  </div>

                  <label className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer inline-flex items-center justify-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>Seleccionar Archivo</span>
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

              </div>

            </div>
          )}

          {/* STEP 2: PREVIEW & VALIDATION RESULTS */}
          {step === 'preview' && (
            <div className="space-y-6">
              
              {/* Summary Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Total Filas</span>
                  <span className="text-2xl font-black text-slate-900 block">{rowValidations.length}</span>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase block">Filas Válidas</span>
                  <span className="text-2xl font-black text-emerald-700 block">
                    {rowValidations.filter(r => r.isValid).length}
                  </span>
                </div>

                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200">
                  <span className="text-[10px] font-extrabold text-rose-600 uppercase block">Filas con Inconsistencias</span>
                  <span className="text-2xl font-black text-rose-700 block">
                    {rowValidations.filter(r => !r.isValid).length}
                  </span>
                </div>
              </div>

              {/* Unrecognized Headers Warning */}
              {unrecognizedHeaders.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Columnas no reconocidas e ignoradas:</strong> {unrecognizedHeaders.join(', ')}
                  </div>
                </div>
              )}

              {/* Validation Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                  <span>Previsualización y Selección de Filas a Importar</span>
                  <span className="text-indigo-600">
                    {rowValidations.filter(r => r.selectedForImport).length} de {rowValidations.length} filas seleccionadas
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-600 font-extrabold uppercase text-[10px] sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Importar</th>
                        <th className="py-2.5 px-3">Fila</th>
                        <th className="py-2.5 px-3">Colaborador / ID</th>
                        <th className="py-2.5 px-3">Estado de Validación</th>
                        <th className="py-2.5 px-3">Observaciones / Inconsistencias</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rowValidations.map((rowVal) => (
                        <tr key={rowVal.rowIndex} className={`hover:bg-slate-50 ${!rowVal.isValid ? 'bg-rose-50/20' : ''}`}>
                          <td className="py-2.5 px-3">
                            <input
                              type="checkbox"
                              checked={rowVal.selectedForImport}
                              onChange={() => toggleRowSelection(rowVal.rowIndex)}
                              disabled={!rowVal.isValid}
                              className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                            />
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-500">
                            #{rowVal.rowIndex}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">
                            {rowVal.data['usuarioNombre'] || 'Colaborador'} ({rowVal.data['usuarioIdentificacion'] || 'N/A'})
                          </td>
                          <td className="py-2.5 px-3">
                            {rowVal.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Válida
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                                <XCircle className="w-3 h-3" /> Error ({rowVal.errors.length})
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-600">
                            {rowVal.errors.map((e, idx) => (
                              <span key={idx} className="text-rose-600 font-semibold block">
                                • {e.message}
                              </span>
                            ))}
                            {rowVal.warnings.map((w, idx) => (
                              <span key={idx} className="text-amber-600 block">
                                ⚠ {w.message}
                              </span>
                            ))}
                            {rowVal.errors.length === 0 && rowVal.warnings.length === 0 && (
                              <span className="text-slate-400">Sin observaciones</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setStep('upload')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Cambiar Archivo
                </button>

                <button
                  onClick={handleConfirmImport}
                  disabled={rowValidations.filter(r => r.selectedForImport).length === 0}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer ${
                    rowValidations.filter(r => r.selectedForImport).length === 0
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <span>Confirmar Importación ({rowValidations.filter(r => r.selectedForImport).length} registros)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* STEP 3: SUCCESSFUL IMPORT COMPLETION */}
          {step === 'complete' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  ¡Importación Masiva Completada!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
                  Se importaron exitosamente <strong>{importedCount} registros</strong> al motor de respuestas de la encuesta. Los indicadores sociodemográficos y epidemiológicos han sido actualizados en tiempo real.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-md cursor-pointer"
                >
                  Cerrar y Ver Resultados
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
