import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Database, 
  Search, 
  FileSpreadsheet, 
  Layers, 
  ShieldCheck, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Sparkles, 
  RefreshCw, 
  Filter, 
  Check, 
  AlertCircle, 
  Calculator, 
  Table,
  Cpu,
  FileCode,
  ListFilter
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DATA_DICTIONARY, DATA_DICTIONARY_VERSION } from '../dataDictionary';
import { DataDictionaryDefinition, DictionaryCategory, EquivalenceTestResult } from '../types';
import { getDictionaryField, testEquivalence, parseExcelRow, parseSurveySubmission } from '../dataDictionaryEngine';

export function DataDictionaryManager() {
  const [activeTab, setActiveTab] = useState<'DICCIONARIO' | 'MAPEO_EXCEL' | 'EQUIVALENCIA'>('DICCIONARIO');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [filterSensitive, setFilterSensitive] = useState<boolean | null>(null);
  const [selectedField, setSelectedField] = useState<DataDictionaryDefinition | null>(null);

  // Excel Mapping State
  const [testExcelHeaders, setTestExcelHeaders] = useState<string>(
    "Fecha Nacimiento, Sexo, Estado Civil, Nivel Escolaridad, Sede, Área, Peso Corporal, Estatura (cm), Diagnóstico Médicos, ColumnaDesconocidaXYZ"
  );

  // Equivalence Test State
  const [surveyInput, setSurveyInput] = useState<string>(JSON.stringify({
    fechaNacimiento: "1992-05-14",
    genero: "Femenino",
    estadoCivil: "Casado(a)",
    escolaridad: "Profesional / Pregrado",
    sede: "Sede Principal Bogotá",
    area: "Tecnología & QA",
    peso: 68.5,
    estatura: 168,
    actividadFisica: "Sí"
  }, null, 2));

  const [excelInput, setExcelInput] = useState<string>(JSON.stringify({
    "Fecha Nacimiento": "1992-05-14",
    "Sexo": "Femenino",
    "Estado Civil": "Casado(a)",
    "Nivel de Escolaridad": "Profesional / Pregrado",
    "Sede": "Sede Principal Bogotá",
    "Área": "Tecnología & QA",
    "Peso Corporal": 68.5,
    "Estatura en cm": 168,
    "¿Practicas algún deporte o actividad física de manera regular?": "Sí"
  }, null, 2));

  const [equivalenceResult, setEquivalenceResult] = useState<EquivalenceTestResult | null>(null);

  // Categories count
  const categories: Array<DictionaryCategory | 'TODAS'> = [
    'TODAS',
    'SOCIODEMOGRAPHIC',
    'LABOR',
    'FAMILY',
    'HOUSING',
    'HEALTH',
    'LIFESTYLE',
    'ERGONOMIC',
    'WELLBEING',
    'EMERGENCY',
    'ORGANIZATIONAL'
  ];

  const filteredFields = useMemo(() => {
    return DATA_DICTIONARY.filter(field => {
      const matchesSearch = 
        field.fieldKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        field.aliases.some(a => a.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'TODAS' || field.category === selectedCategory;
      const matchesSens = filterSensitive === null || field.sensitive === filterSensitive;

      return matchesSearch && matchesCat && matchesSens;
    });
  }, [searchTerm, selectedCategory, filterSensitive]);

  // Excel mapping parsing
  const parsedExcelMapping = useMemo(() => {
    const headers = testExcelHeaders.split(',').map(h => h.trim()).filter(Boolean);
    const mockRow: Record<string, any> = {};
    headers.forEach(h => { mockRow[h] = "Valor de prueba"; });
    return parseExcelRow(mockRow, headers);
  }, [testExcelHeaders]);

  const handleRunEquivalenceTest = () => {
    try {
      const sObj = JSON.parse(surveyInput);
      const eObj = JSON.parse(excelInput);
      const res = testEquivalence(sObj, eObj);
      setEquivalenceResult(res);
    } catch (err: any) {
      alert("Error al parsear el JSON de entrada: " + err.message);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-400/20 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-300" />
              <span>Contrato Único de Datos {DATA_DICTIONARY_VERSION}</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-400/20">
              Single Source of Truth
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Diccionario Central de Datos & Mapeo Universal
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Contrato único que conecta Encuesta Digital, Archivos Excel, Motor de Calidad, Motor de Indicadores, Tableros y Reportes Ejecutivos PDF sin fallbacks ni datos sintéticos.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">Variables</span>
            <span className="text-2xl font-black text-white">{DATA_DICTIONARY.length}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">Sensibles</span>
            <span className="text-2xl font-black text-amber-400">
              {DATA_DICTIONARY.filter(f => f.sensitive).length}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('DICCIONARIO')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'DICCIONARIO'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Diccionario de Datos ({filteredFields.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('MAPEO_EXCEL')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'MAPEO_EXCEL'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Mapeo de Columnas Excel</span>
        </button>

        <button
          onClick={() => setActiveTab('EQUIVALENCIA')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'EQUIVALENCIA'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Prueba Equivalencia (Encuesta vs Excel)</span>
        </button>
      </div>

      {/* TAB 1: DICCIONARIO DE DATOS */}
      {activeTab === 'DICCIONARIO' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por fieldKey, etiqueta, descripción o alias..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Category selector */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <ListFilter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="bg-transparent font-medium text-slate-700 focus:outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'TODAS' ? 'Todas las Categorías' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sensitive Toggle */}
              <button
                onClick={() => setFilterSensitive(prev => prev === true ? null : true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  filterSensitive === true
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Solo Sensibles</span>
              </button>
            </div>
          </div>

          {/* Grid of Dictionary Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFields.map(field => (
              <motion.div
                key={field.fieldKey}
                layout
                onClick={() => setSelectedField(field)}
                className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                  field.sensitive 
                    ? 'border-amber-200 bg-amber-50/20 hover:border-amber-400' 
                    : 'border-slate-200 hover:border-indigo-400'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {field.fieldKey}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 mt-1">{field.label}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    {field.sensitive && (
                      <span className="bg-amber-100 text-amber-800 p-1 rounded-lg" title="Dato Sensible de Salud">
                        <ShieldAlert className="w-3.5 h-3.5" />
                      </span>
                    )}
                    {field.sourceType === 'CALCULATED' && (
                      <span className="bg-purple-100 text-purple-800 p-1 rounded-lg" title="Variable Calculada">
                        <Calculator className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {field.description}
                </p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-500">
                  <span className="font-medium bg-slate-100 px-2 py-0.5 rounded-md">
                    {field.category}
                  </span>
                  <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {field.dataType} {field.unit ? `(${field.unit})` : ''}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Modal / Drawer for Selected Field Details */}
          <AnimatePresence>
            {selectedField && (
              <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-5 text-left max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        {selectedField.fieldKey}
                      </span>
                      <h2 className="text-lg font-black text-slate-900 mt-1">{selectedField.label}</h2>
                    </div>

                    <button
                      onClick={() => setSelectedField(null)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-xl"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {selectedField.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Categoría</span>
                      <span className="font-bold text-slate-800">{selectedField.category}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Tipo de Dato</span>
                      <span className="font-bold text-slate-800">{selectedField.dataType}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Fuente</span>
                      <span className="font-bold text-slate-800">{selectedField.sourceType}</span>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Sensibilidad</span>
                      <span className={`font-bold ${selectedField.sensitive ? 'text-amber-600' : 'text-slate-800'}`}>
                        {selectedField.sensitive ? 'DATO SENSIBLE' : 'PÚBLICO / INTERNO'}
                      </span>
                    </div>
                  </div>

                  {selectedField.calculationRule && (
                    <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 text-xs space-y-1">
                      <span className="font-extrabold text-purple-900 flex items-center gap-1.5">
                        <Calculator className="w-4 h-4 text-purple-600" />
                        <span>Regla de Cálculo (Variable Derivada)</span>
                      </span>
                      <p className="text-purple-700 text-[11px]">
                        Depende de: <strong className="font-mono">{selectedField.calculationRule.dependsOn.join(', ')}</strong>
                      </p>
                      <p className="text-purple-800 font-mono text-[10px] bg-white p-2 rounded-lg border border-purple-200 mt-1">
                        {selectedField.calculationRule.formulaDescription}
                      </p>
                    </div>
                  )}

                  {/* Aliases List */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-700 block">Alias de Columna Excel ({selectedField.aliases.length}):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedField.aliases.map(a => (
                        <span key={a} className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 font-mono">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Allowed values */}
                  {selectedField.allowedValues && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700 block">Valores Permitidos:</span>
                      <div className="flex flex-wrap gap-1">
                        {selectedField.allowedValues.map(v => (
                          <span key={v} className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-indigo-100">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Validation Rules */}
                  {selectedField.validationRules && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-700 block mb-1">Reglas de Validación:</span>
                      <pre className="text-[10px] font-mono text-slate-600">
                        {JSON.stringify(selectedField.validationRules, null, 2)}
                      </pre>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setSelectedField(null)}
                      className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700"
                    >
                      Cerrar Detalles
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* TAB 2: MAPEO DE COLUMNAS EXCEL */}
      {activeTab === 'MAPEO_EXCEL' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Probador de Encabezados de Excel</span>
            </h2>

            <p className="text-xs text-slate-500">
              Ingrese los nombres de columnas separados por comas para simular la detección automática mediante los alias registrados en el DataDictionary:
            </p>

            <textarea
              rows={3}
              value={testExcelHeaders}
              onChange={e => setTestExcelHeaders(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {/* Results Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Resultado de Mapeo ({parsedExcelMapping.columnMappings.length} columnas evaluadas)
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mapeadas: {parsedExcelMapping.columnMappings.filter(m => m.status === 'MAPPED').length}
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Sin Mapear: {parsedExcelMapping.columnMappings.filter(m => m.status === 'COLUMN_NOT_FOUND').length}
                </span>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {parsedExcelMapping.columnMappings.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-bold text-slate-800">
                      "{item.excelHeader}"
                    </span>
                    {item.dictionaryMatch && (
                      <p className="text-[11px] text-slate-500">
                        Etiqueta: <strong className="text-slate-700">{item.dictionaryMatch.label}</strong> | Categoría: {item.dictionaryMatch.category}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {item.status === 'MAPPED' ? (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                          {item.fieldKey}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> MAPEO CORRECTO
                        </span>
                      </div>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> COLUMNA NO ENCONTRADA (COLUMN_NOT_FOUND)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRUEBA DE EQUIVALENCIA */}
      {activeTab === 'EQUIVALENCIA' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <span>Verificador de Equivalencia de Datos (Prueba Crítica Requirement #37)</span>
            </h2>

            <p className="text-xs text-slate-500">
              Garantiza que un registro capturado por Encuesta Digital y un registro capturado por Excel produzcan exactamente los mismos datos normalizados, validaciones e indicadores calculados (IMC, Edad, Antigüedad).
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Registro A: Encuesta Digital (JSON raw)
                </span>
                <textarea
                  rows={8}
                  value={surveyInput}
                  onChange={e => setSurveyInput(e.target.value)}
                  className="w-full p-3 bg-slate-900 text-emerald-400 font-mono text-[11px] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 block mb-1">
                  Registro B: Excel Importado (JSON raw)
                </span>
                <textarea
                  rows={8}
                  value={excelInput}
                  onChange={e => setExcelInput(e.target.value)}
                  className="w-full p-3 bg-slate-900 text-cyan-400 font-mono text-[11px] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleRunEquivalenceTest}
                className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs hover:bg-indigo-700 flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ejecutar Prueba de Equivalencia</span>
              </button>
            </div>
          </div>

          {/* Test Results Display */}
          {equivalenceResult && (
            <div className={`bg-white rounded-2xl border p-6 shadow-sm space-y-4 ${
              equivalenceResult.isEquivalent ? 'border-emerald-200' : 'border-amber-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  {equivalenceResult.isEquivalent ? (
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {equivalenceResult.isEquivalent 
                        ? '¡PRUEBA SUPERADA! EQUIVALENCIA DEL 100%' 
                        : `DIVERGENCIA DETECTADA (${equivalenceResult.mismatchesCount} diferencias)`}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {equivalenceResult.isEquivalent
                        ? 'Los datos capturados vía Encuesta y vía Excel producen un dataset idéntico.'
                        : 'Se encontraron discrepancias en la normalización o mapeo entre fuentes.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Comparisons Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] font-extrabold uppercase">
                      <th className="p-3">fieldKey</th>
                      <th className="p-3">Variable</th>
                      <th className="p-3">Normalizado Encuesta</th>
                      <th className="p-3">Normalizado Excel</th>
                      <th className="p-3 text-center">Estado Match</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {equivalenceResult.fieldComparisons.map(comp => (
                      <tr key={comp.fieldKey} className={comp.matches ? 'hover:bg-slate-50' : 'bg-amber-50/50'}>
                        <td className="p-3 font-mono font-bold text-indigo-600">{comp.fieldKey}</td>
                        <td className="p-3 font-medium text-slate-800">{comp.label}</td>
                        <td className="p-3 font-mono text-slate-700">{JSON.stringify(comp.surveyNormalized) ?? 'null'}</td>
                        <td className="p-3 font-mono text-slate-700">{JSON.stringify(comp.excelNormalized) ?? 'null'}</td>
                        <td className="p-3 text-center">
                          {comp.matches ? (
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Check className="w-3 h-3" /> MATCH
                            </span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> DIFERENTE
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
