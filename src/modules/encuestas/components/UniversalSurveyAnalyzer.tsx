import React, { useState, useEffect } from 'react';
import { 
  Settings, FileSpreadsheet, Play, Activity, HelpCircle, Layers, ClipboardCheck, AlertTriangle, CheckCircle, Flame, Sparkles
} from 'lucide-react';
import { analyzeUniversalSurvey } from '../surveyEngine';
import { SurveyConfig, UniversalSurveyAnalysis } from '../encuestas.types';
import climaConfig from '../examples/climaSurveyConfig.json';
import engagementConfig from '../examples/engagementSurveyConfig.json';
import { masterDataModelService } from '../../../core/master_data_model/service';
import { RespuestaMaster } from '../../../core/master_data_model/types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';

export default function UniversalSurveyAnalyzer() {
  const [configsList, setConfigsList] = useState<SurveyConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>('clima_organizacional_standard');
  const [config, setConfig] = useState<SurveyConfig>(climaConfig as SurveyConfig);
  const [analysis, setAnalysis] = useState<UniversalSurveyAnalysis | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load default configs and any custom configs saved in localStorage
  useEffect(() => {
    const defaultConfigs: SurveyConfig[] = [
      climaConfig as SurveyConfig,
      engagementConfig as SurveyConfig
    ];
    try {
      const saved = localStorage.getItem('happyinsight_custom_survey_configs');
      if (saved) {
        const parsed = JSON.parse(saved) as SurveyConfig[];
        setConfigsList([...defaultConfigs, ...parsed]);
      } else {
        setConfigsList(defaultConfigs);
      }
    } catch (e) {
      console.error("Error cargando configuraciones personalizadas:", e);
      setConfigsList(defaultConfigs);
    }
  }, []);

  // Sync config when selection or list changes
  useEffect(() => {
    if (configsList.length > 0) {
      const found = configsList.find(c => c.id === selectedConfigId);
      if (found) {
        setConfig(found);
      }
    }
    setAnalysis(null);
    setUploadError(null);
  }, [selectedConfigId, configsList]);

  // Handle uploading of a custom JSON configuration file
  const handleConfigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const newConfig = JSON.parse(text) as SurveyConfig;
        
        // Strict Validation of essential keys
        const requiredFields = ['id', 'name', 'dimensions', 'questions', 'responseType'];
        const missing = requiredFields.filter(f => !(f in newConfig));
        if (missing.length > 0) {
          throw new Error(`Faltan campos obligatorios: ${missing.join(', ')}`);
        }

        setConfigsList(prev => {
          const filtered = prev.filter(c => c.id !== newConfig.id);
          const updated = [...filtered, newConfig];
          
          const defaultIds = ['clima_organizacional_standard', 'compromiso_engagement_q12'];
          const customOnly = updated.filter(c => !defaultIds.includes(c.id));
          localStorage.setItem('happyinsight_custom_survey_configs', JSON.stringify(customOnly));
          
          return updated;
        });

        setSelectedConfigId(newConfig.id);
        alert(`¡Configuración de encuesta "${newConfig.name}" cargada con éxito!`);
      } catch (err: any) {
        setUploadError(`Error cargando configuración JSON: ${err.message || err}`);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(climaConfig, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "plantilla_config_encuesta.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Loads actual stored responses from the system database
  const handleLoadDemoData = () => {
    setIsProcessing(true);
    setUploadError(null);

    setTimeout(() => {
      try {
        const respuestas = masterDataModelService.getTableData<RespuestaMaster>('RESPUESTAS');
        const rowsByCollaborator: Record<string, Record<string, any>> = {};

        respuestas.forEach(r => {
          if (r.colaboradorId || r.usuarioId) {
            const key = r.colaboradorId || r.usuarioId;
            if (!rowsByCollaborator[key]) rowsByCollaborator[key] = {};
            if (r.preguntaId) {
              const matchedQ = config.questions.find(q => q.id === r.preguntaId || q.text.includes(r.preguntaId));
              if (matchedQ) {
                rowsByCollaborator[key][matchedQ.text] = Number(r.valorIngresado) || r.valorIngresado;
              }
            }
          }
        });

        const actualRows = Object.values(rowsByCollaborator);

        if (actualRows.length === 0) {
          setUploadError('No se encontraron respuestas registradas en el sistema para esta encuesta.');
          setAnalysis(null);
        } else {
          const result = analyzeUniversalSurvey(config, actualRows);
          setAnalysis(result);
        }
      } catch (err: any) {
        setUploadError(`Error calculando métricas: ${err.message || err}`);
      } finally {
        setIsProcessing(false);
      }
    }, 400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setIsProcessing(true);
    setUploadError(null);

    // Let's create an elegant FileReader to parse custom CSV or JSON list
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        let parsedRows: any[] = [];
        
        if (file.name.endsWith('.json')) {
          parsedRows = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          // Quick standard CSV to JSON parser
          const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
          if (lines.length < 2) throw new Error("El archivo CSV no contiene suficientes renglones.");
          const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
          
          for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(',');
            const row: Record<string, any> = {};
            headers.forEach((h, idx) => {
              row[h] = currentLine[idx]?.replace(/^"|"$/g, '').trim();
            });
            parsedRows.push(row);
          }
        } else {
          throw new Error("El motor universal soporta cargas en formato CSV o JSON para compatibilidad multiplataforma instantánea.");
        }

        const result = analyzeUniversalSurvey(config, parsedRows);
        setAnalysis(result);
      } catch (err: any) {
        setUploadError(`Error de procesamiento: ${err.message || err}`);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-2xs text-left space-y-6">
      
      {/* 1. Cabezote */}
      <div className="border-b border-slate-100 pb-5 space-y-1">
        <div className="flex items-center gap-2 text-indigo-600">
          <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-black uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
            ARQUITECTURA DE MOTOR UNIVERSAL DE ENCUESTAS
          </span>
        </div>
        <h2 className="text-lg font-black text-slate-900 font-display">Motor de Encuestas Parametrizable</h2>
        <p className="text-xs text-slate-500 font-medium">Sube cualquier configuración JSON de encuesta y analiza respuestas de forma dinámica sin modificar el código.</p>
      </div>

      {/* 2. Selectores de Configuración */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Selector Izquierdo */}
        <div className="md:col-span-1 space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Seleccionar Configuración</label>
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto pr-1">
            {configsList.map((cfg) => (
              <button
                key={cfg.id}
                onClick={() => setSelectedConfigId(cfg.id)}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer text-slate-800 ${
                  selectedConfigId === cfg.id
                    ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900'
                    : 'border-slate-150 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex justify-between items-start gap-1">
                  <h4 className="text-xs font-black">{cfg.name}</h4>
                  {['clima_organizacional_standard', 'compromiso_engagement_q12'].includes(cfg.id) ? (
                    <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">Estándar</span>
                  ) : (
                    <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded font-bold uppercase tracking-wider shrink-0">Custom</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">
                  {cfg.responseType} • {cfg.dimensions?.length || 0} Dim • {cfg.questions?.length || 0} Preg.
                </p>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-3xs border border-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Cargar Nueva Config JSON</span>
              <input type="file" accept=".json" onChange={handleConfigUpload} className="hidden" />
            </label>
            <button
              onClick={handleDownloadTemplate}
              className="w-full px-3 py-2 bg-white hover:bg-slate-50 text-slate-500 rounded-xl text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Descargar Plantilla JSON</span>
            </button>
          </div>
        </div>

        {/* Detalle de Configuración Derecha */}
        <div className="md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-4">
          <div className="space-y-1">
            <h3 className="text-xs font-black text-slate-800 font-display uppercase tracking-wider">{config.name}</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{config.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Dimensiones */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Dimensiones JSON</span>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {config.dimensions.map(d => (
                  <div key={d.id} className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/60 font-semibold text-slate-700 text-[11px]">
                    <strong>{d.name}:</strong> <span className="text-slate-400 font-normal">{d.description.substring(0, 50)}...</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preguntas */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Preguntas JSON</span>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {config.questions.map(q => (
                  <div key={q.id} className="bg-white px-2.5 py-1.5 rounded-xl border border-slate-200/60 font-semibold text-slate-700 text-[11px] truncate">
                    <span className="text-indigo-600 font-mono font-bold mr-1">{q.id.toUpperCase()}:</span> {q.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. Cargador de Archivo de Respuestas */}
      <div className="bg-indigo-50/10 border border-indigo-100 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="text-xs font-black text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-indigo-500" />
            <span>Ejecutar Análisis del Motor</span>
          </h4>
          <p className="text-[10px] text-slate-400 font-semibold">Carga resultados en formato JSON o CSV, o ejecuta la simulación con datos reales de demostración.</p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-center">
          <label className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs">
            <span>Subir CSV / JSON</span>
            <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
          </label>
          
          <button
            onClick={handleLoadDemoData}
            disabled={isProcessing}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? 'Procesando...' : 'Cargar Demo Real'}
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-150 p-4 rounded-xl text-xs text-red-800 font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* 4. RESULTADO DEL ANALISIS AUTOMÁTICO */}
      {analysis && (
        <div className="space-y-6 pt-4 border-t border-slate-100 animate-fade-in">
          
          <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-2xl">
            <div className="space-y-0.5">
              <span className="text-[9px] text-indigo-400 font-black uppercase tracking-wider">RESULTADOS DEL MOTOR UNIVERSAL</span>
              <h3 className="text-sm font-black font-display">{analysis.surveyName}</h3>
            </div>
            <div className="text-right text-xs">
              <span className="text-slate-400">Renglones Procesados:</span> <strong className="font-mono text-cyan-300 font-black">{analysis.totalRecords}</strong>
            </div>
          </div>

          {/* Gráfico y Dimensiones de forma dinámica */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Dimensiones Calculadas */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Resultados por Dimensión</span>
              <div className="space-y-3">
                {analysis.dimensions.map((dim, idx) => (
                  <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/60 space-y-1.5 font-semibold text-xs">
                    <div className="flex justify-between text-slate-800">
                      <span>{dim.name}</span>
                      <span className="font-mono font-bold text-slate-900">Prom: {dim.average} (Fav: {dim.favorability}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${dim.favorability}%`,
                          backgroundColor: dim.favorability >= 75 ? '#10b981' : dim.favorability >= 60 ? '#f59e0b' : '#f43f5e'
                        }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Gráfico Configurado Dinámicamente */}
            {analysis.charts.length > 0 && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Gráfico Configurado: {analysis.charts[0].title}</span>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.charts[0].data} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="label" tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} stroke="#cbd5e1" />
                      <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" domain={[0, 100]} />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '10px' }} />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                        {analysis.charts[0].data.map((entry, index) => {
                          const val = entry.value;
                          const color = val >= 75 ? '#10b981' : val >= 60 ? '#f59e0b' : '#f43f5e';
                          return <Cell key={`cell-${index}`} fill={color} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>

          {/* Interpretación Automática / Reglas Activadas */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-150 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Interpretaciones y Diagnósticos de Reglas</span>
            <div className="space-y-3">
              {analysis.interpretations.map((inter, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-xl border flex gap-3 text-xs leading-relaxed font-semibold text-left ${
                    inter.level === 'Saludable' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                    inter.level === 'Regular' ? 'bg-amber-50 border-amber-100 text-amber-800' :
                    'bg-rose-50 border-rose-100 text-rose-800'
                  }`}
                >
                  {inter.level === 'Saludable' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : inter.level === 'Regular' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <Flame className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <h4 className={`font-extrabold text-sm ${
                      inter.level === 'Saludable' ? 'text-emerald-950' :
                      inter.level === 'Regular' ? 'text-amber-950' :
                      'text-rose-950'
                    }`}>{inter.title}</h4>
                    <p>{inter.text}</p>
                    <span className="block text-[10px] font-mono font-bold mt-1.5 opacity-80">
                      Métrica de disparo: [ {inter.ruleId} ] Valor Actual: {inter.currentValue}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
