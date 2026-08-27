import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Search, Plus, Trash2, Sliders, RotateCcw, AlertCircle, FileText, CheckCircle2, AlertTriangle, ShieldAlert, 
  Layers, Users, Shield, Database, Activity, RefreshCw, PlusCircle, Bookmark, Copy, ClipboardCheck, ArrowUpRight, Check,
  Play
} from 'lucide-react';
import { OrganizationalIndicator } from '../types';
import { IndicatorStore } from '../services/indicatorStore';
import { AIEngine } from '../../ia/services/aiEngine';
import { AIEngineResponse } from '../../ia/types/aiEngine.types';

import { DynamicIndicatorDashboard } from './DynamicIndicatorDashboard';
import Prompt37IndicatorPanel from '../../../components/Prompt37IndicatorPanel';

export default function IndicatorCenter() {
  const [activeSubTab, setActiveSubTab] = useState<'MOTOR_P37' | 'MOTOR' | 'MATRIZ'>('MOTOR_P37');
  const [indicators, setIndicators] = useState<OrganizationalIndicator[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDimension, setSelectedDimension] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);

  // Form State for creating new indicator without code edits
  const [newInd, setNewInd] = useState({
    name: '',
    description: '',
    formula: '',
    frequency: 'Mensual',
    unit: '%',
    target: 80,
    criticalThreshold: 65,
    warningThreshold: 75,
    successThreshold: 80,
    responsible: '',
    regulations: '',
    dataSource: '',
    currentValue: 70,
    previousValue: 65,
    dimension: 'Clima'
  });

  // AI Diagnostic State
  const [aiReport, setAiReport] = useState<AIEngineResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load indicators on mount
  useEffect(() => {
    loadIndicators();
  }, []);

  const loadIndicators = () => {
    setIndicators(IndicatorStore.getAll());
  };

  // Unique list of dimensions for filters
  const dimensions = useMemo(() => {
    const list = indicators.map(ind => ind.dimension);
    return ['all', ...Array.from(new Set(list))];
  }, [indicators]);

  // Traffic Light status helper
  const getStatus = (ind: OrganizationalIndicator): 'critical' | 'warning' | 'success' => {
    const val = ind.currentValue;
    const { critical, warning, success } = ind.thresholds;

    // Detect if lower values are better (e.g. absenteeism where critical=5, success=2.5)
    const isLowerBetter = critical > success;

    if (isLowerBetter) {
      if (val <= success) return 'success';
      if (val > success && val <= warning) return 'warning';
      return 'critical';
    } else {
      if (val >= success) return 'success';
      if (val >= warning && val < success) return 'warning';
      return 'critical';
    }
  };

  // Reset indicator store to defaults
  const handleResetToDefaults = () => {
    if (confirm('¿Está seguro de que desea restablecer la base de indicadores corporativos a los valores de fábrica? Se perderán los creados por el usuario.')) {
      const defaults = IndicatorStore.resetToDefaults();
      setIndicators(defaults);
      setAiReport(null);
    }
  };

  // Adjust indicator value via slider
  const handleValueSliderChange = (id: string, val: number) => {
    const updated = IndicatorStore.update(id, { currentValue: val });
    if (updated) {
      setIndicators(prev => prev.map(ind => ind.id === id ? updated : ind));
    }
  };

  // Adjust previous value via inputs
  const handlePreviousValueChange = (id: string, val: number) => {
    const updated = IndicatorStore.update(id, { previousValue: val });
    if (updated) {
      setIndicators(prev => prev.map(ind => ind.id === id ? updated : ind));
    }
  };

  // Delete indicator
  const handleDeleteIndicator = (id: string) => {
    if (confirm('¿Desea eliminar de forma permanente este indicador organizacional del centro de control?')) {
      IndicatorStore.delete(id);
      loadIndicators();
    }
  };

  // Form submission to dynamically insert a new indicator
  const handleAddIndicatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInd.name || !newInd.formula || !newInd.responsible) {
      alert('Por favor complete los campos obligatorios: Nombre, Fórmula y Responsable.');
      return;
    }

    const payload = {
      name: newInd.name,
      description: newInd.description,
      formula: newInd.formula,
      frequency: newInd.frequency,
      unit: newInd.unit,
      target: Number(newInd.target),
      thresholds: {
        critical: Number(newInd.criticalThreshold),
        warning: Number(newInd.warningThreshold),
        success: Number(newInd.successThreshold)
      },
      responsible: newInd.responsible,
      regulations: newInd.regulations || 'N/A / Prácticas Internas',
      dataSource: newInd.dataSource || 'Registros del Sistema',
      currentValue: Number(newInd.currentValue),
      previousValue: newInd.previousValue ? Number(newInd.previousValue) : undefined,
      dimension: newInd.dimension
    };

    IndicatorStore.add(payload);
    loadIndicators();
    setShowAddModal(false);
    
    // Reset form
    setNewInd({
      name: '',
      description: '',
      formula: '',
      frequency: 'Mensual',
      unit: '%',
      target: 80,
      criticalThreshold: 65,
      warningThreshold: 75,
      successThreshold: 80,
      responsible: '',
      regulations: '',
      dataSource: '',
      currentValue: 70,
      previousValue: 65,
      dimension: 'Clima'
    });
  };

  // Filter indicators
  const filteredIndicators = useMemo(() => {
    return indicators.filter(ind => {
      // Search matching name, description, formula, responsible
      const matchesSearch = 
        ind.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ind.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ind.responsible.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ind.regulations.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDimension = selectedDimension === 'all' || ind.dimension === selectedDimension;
      
      const status = getStatus(ind);
      const matchesStatus = selectedStatus === 'all' || status === selectedStatus;

      return matchesSearch && matchesDimension && matchesStatus;
    });
  }, [indicators, searchQuery, selectedDimension, selectedStatus]);

  // Run central AIEngine over the filtered or all indicators
  const handleRunAiAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      // Map indicators to generic IAIndicator input required by AIEngine
      const iaInputs = filteredIndicators.map(ind => ({
        id: ind.id,
        name: ind.name,
        value: ind.currentValue,
        dimension: ind.dimension,
        description: ind.description,
        previousValue: ind.previousValue
      }));

      const report = AIEngine.analyze(iaInputs, { 
        companyName: 'Organización Consolidada', 
        segment: selectedDimension !== 'all' ? `Dimensión ${selectedDimension}` : 'Centro Global' 
      });

      setAiReport(report);
      setIsAnalyzing(false);
    }, 700);
  };

  const handleCopyValue = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(id);
    setTimeout(() => setIsCopied(null), 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner de Bienvenida y Header */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-2 text-left z-10 max-w-3xl">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Bookmark className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
              CENTRO DE CONTROL CORPORATIVO
            </span>
          </div>
          <h1 className="text-xl md:text-3xl font-black font-display tracking-tight">Centro de Indicadores SG-SST</h1>
          <p className="text-xs text-slate-300 font-semibold leading-relaxed">
            Consola centralizada de analítica sociodemográfica, condiciones de salud y matriz de indicadores normativos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 z-10 shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm text-white cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Indicador</span>
          </button>
          
          <button
            onClick={handleResetToDefaults}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-sm text-slate-200 cursor-pointer"
            title="Restaurar indicadores estándar"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restablecer</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('MOTOR_P37')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'MOTOR_P37'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Motor Central de Indicadores (PROMPT 37)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('MOTOR')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'MOTOR'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Motor Dinámico (PROMPT 15)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('MATRIZ')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'MATRIZ'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matriz & Umbrales Normativos</span>
        </button>
      </div>

      {activeSubTab === 'MOTOR_P37' ? (
        <Prompt37IndicatorPanel />
      ) : activeSubTab === 'MOTOR' ? (
        <DynamicIndicatorDashboard />
      ) : (
        <>
        {/* Control Panel: Filters, Search, Statistics */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-2xs text-left grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          {/* Search */}
          <div className="space-y-1.5 text-left md:col-span-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Buscador Inteligente</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre, fórmula, responsable, norma..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold focus:bg-white"
              />
            </div>
          </div>

          {/* Dimension Filter */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filtrar por Dimensión</label>
            <select
              value={selectedDimension}
              onChange={e => setSelectedDimension(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold focus:bg-white text-slate-700"
            >
              <option value="all">Todas las Dimensiones ({indicators.length})</option>
              {dimensions.filter(d => d !== 'all').map(dim => (
                <option key={dim} value={dim}>{dim}</option>
              ))}
            </select>
          </div>

          {/* Traffic Light Filter */}
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estado del Semáforo</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold focus:bg-white text-slate-700"
            >
              <option value="all">Cualquier Estado</option>
              <option value="success">Saludable / Verde</option>
              <option value="warning">En Alerta / Amarillo</option>
              <option value="critical">Crítico / Rojo</option>
            </select>
          </div>

        </div>


      {/* Grid of Indicators and AI trigger section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: INDICATOR LISTING */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>Mostrando {filteredIndicators.length} de {indicators.length} indicadores</span>
            {filteredIndicators.length > 0 && (
              <button 
                onClick={handleRunAiAnalysis}
                disabled={isAnalyzing}
                className="text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-150 transition-all font-black text-[11px]"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analizando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                    <span>Ejecutar Diagnóstico IA del Centro ({filteredIndicators.length})</span>
                  </>
                )}
              </button>
            )}
          </div>

          {filteredIndicators.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200 text-slate-400 space-y-2">
              <AlertCircle className="w-10 h-10 mx-auto text-slate-300" />
              <h3 className="font-bold text-slate-700 text-sm">Ningún indicador coincide</h3>
              <p className="text-xs max-w-sm mx-auto">Pruebe limpiando los filtros o creando un nuevo indicador personalizado para ampliar la base.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredIndicators.map(ind => {
                const status = getStatus(ind);
                const isLowerBetter = ind.thresholds.critical > ind.thresholds.success;
                
                return (
                  <div 
                    key={ind.id} 
                    className="bg-white rounded-3xl border border-slate-100 shadow-2xs p-5 hover:border-slate-300 transition-all text-left flex flex-col justify-between space-y-4 relative"
                  >
                    {/* Header: Name, Custom Badge & Status Dot */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                          {ind.dimension}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {ind.isCustom && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded">
                              Personalizado
                            </span>
                          )}

                          {/* Traffic Light (Semáforo Indicator) */}
                          <span className={`w-3.5 h-3.5 rounded-full border shadow-3xs flex items-center justify-center ${
                            status === 'success' ? 'bg-emerald-500 border-emerald-600 animate-pulse' :
                            status === 'warning' ? 'bg-amber-500 border-amber-600' :
                            'bg-rose-500 border-rose-600 animate-bounce'
                          }`} title={`Semáforo: ${status === 'success' ? 'Saludable' : status === 'warning' ? 'Alerta' : 'Crítico'}`} />

                          {ind.isCustom && (
                            <button
                              onClick={() => handleDeleteIndicator(ind.id)}
                              className="text-slate-300 hover:text-rose-600 transition-all p-0.5"
                              title="Eliminar este indicador"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-800 text-[13px] tracking-tight leading-tight pt-1">
                        {ind.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                        {ind.description}
                      </p>
                    </div>

                    {/* Formula Field with Monospace style */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Fórmula Estándar</span>
                        <button 
                          onClick={() => handleCopyValue(ind.formula, ind.id)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {isCopied === ind.id ? (
                            <span className="text-[9px] text-emerald-600 font-bold">¡Copiado!</span>
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <code className="text-[10px] font-mono text-indigo-950 font-semibold block leading-tight break-all">
                        {ind.formula}
                      </code>
                    </div>

                    {/* Key-Value Metadata Grid (Frecuencia, Unidad, Meta, etc.) */}
                    <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10px] font-semibold border-t border-b border-slate-100 py-3">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Activity className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Frecuencia: <strong className="text-slate-800">{ind.frequency}</strong></span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Unidad: <strong className="text-slate-800">{ind.unit}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Meta: <strong className="text-indigo-600">&ge; {ind.target}{ind.unit}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600" title={ind.responsible}>
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Responsable: <strong className="text-slate-800">{ind.responsible}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600 md:col-span-2" title={ind.regulations}>
                        <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Norma: <strong className="text-slate-800">{ind.regulations}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600 md:col-span-2" title={ind.dataSource}>
                        <Database className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">Fuente: <strong className="text-slate-800">{ind.dataSource}</strong></span>
                      </div>
                    </div>

                    {/* Values Adjustment Slider (Tuning) */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500">Valor Actual</span>
                        <div className="space-x-2">
                          {ind.previousValue !== undefined && (
                            <span className="text-slate-400">Histórico: {ind.previousValue}{ind.unit}</span>
                          )}
                          <span className={`font-mono font-black ${
                            status === 'success' ? 'text-emerald-600' :
                            status === 'warning' ? 'text-amber-600' :
                            'text-rose-600'
                          }`}>
                            {ind.currentValue}{ind.unit}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max={ind.unit === '%' ? 100 : 200}
                          step={ind.unit === '%' ? 1 : 0.1}
                          value={ind.currentValue}
                          onChange={e => handleValueSliderChange(ind.id, Number(e.target.value))}
                          className="w-full h-1 bg-slate-150 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>

                      {/* Manual previous value setter */}
                      <div className="flex justify-between items-center pt-1 text-[9px] font-semibold">
                        <span className="text-slate-400">Modificar anterior:</span>
                        <input
                          type="number"
                          value={ind.previousValue || ''}
                          placeholder="Ninguno"
                          onChange={e => handlePreviousValueChange(ind.id, Number(e.target.value))}
                          className="w-16 px-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 text-[9px] font-mono text-right"
                        />
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: AI LIVE REPORT CARD */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-1.5 text-indigo-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Diagnóstico Central Inteligente</span>
            </div>

            <p className="text-[10px] text-slate-300 font-semibold leading-relaxed">
              El motor de inteligencia lee en tiempo real el conjunto actual de {filteredIndicators.length} indicadores mostrados a la izquierda para estructurar un informe clínico.
            </p>

            <button
              onClick={handleRunAiAnalysis}
              disabled={isAnalyzing || filteredIndicators.length === 0}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer text-white"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analizando Indicadores...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Generar Informe Diagnóstico</span>
                </>
              )}
            </button>
          </div>

          {aiReport ? (
            <div className="space-y-4">
              
              {/* Executive Summary Accordion */}
              <div className="bg-white p-5 rounded-3xl border border-indigo-100 shadow-3xs space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-indigo-50">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>Resumen Ejecutivo</span>
                  </span>
                  <span className="text-[8px] font-mono font-bold text-slate-400">CENTRAL_IA</span>
                </div>
                <p className="text-xs font-semibold text-slate-700 leading-relaxed bg-indigo-50/10 p-3 rounded-xl border border-indigo-50/20">
                  {aiReport.resumenEjecutivo}
                </p>
              </div>

              {/* Strengths & Risks */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs space-y-3">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block pb-1">
                  Puntos de Atención
                </span>

                <div className="space-y-3">
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Fortalezas Activas</span>
                    </span>
                    <ul className="space-y-1 text-slate-600 font-semibold list-disc pl-4 text-[11px]">
                      {aiReport.fortalezas.map((f, i) => <li key={i}>{f}</li>)}
                    </ul>
                  </div>

                  <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                    <span className="text-[10px] text-rose-700 font-bold uppercase flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                      <span>Riesgos de Fuga / Desgaste</span>
                    </span>
                    <ul className="space-y-1 text-slate-600 font-semibold list-disc pl-4 text-[11px]">
                      {aiReport.riesgos.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Priorities */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs space-y-3">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block pb-1">
                  Prioridades Estratégicas
                </span>
                <div className="space-y-2 text-xs font-semibold">
                  {aiReport.prioridades.map((p, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-150 rounded-xl flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      <span className="text-slate-700 font-bold text-[11px]">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Plan */}
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-3xs space-y-3">
                <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest block pb-1">
                  Plan de Acción Recomendado
                </span>
                <div className="space-y-2">
                  {aiReport.planDeAccion.map((step, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 text-left text-xs font-semibold">
                      <div className="flex justify-between items-start gap-2">
                        <span className="font-bold text-slate-800 text-[11px]">{step.task}</span>
                        <span className="text-[8px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 px-1 rounded">
                          {step.priority}
                        </span>
                      </div>
                      <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                        <span>Resp: {step.responsible}</span>
                        <span>Plazo: {step.timeframe}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white p-8 text-center rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs font-semibold">
              <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <span>Haga clic en el botón de arriba para compilar el informe AI.</span>
            </div>
          )}

        </div>

      </div>

      {/* ADD INDICATOR MODAL (DYNAMICS SETUP) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-slate-100 space-y-4 text-left max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h2 className="text-base font-black text-slate-800 font-display flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-indigo-500" />
                <span>Agregar Nuevo Indicador Organizacional</span>
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-black p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddIndicatorSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              
              {/* Row 1: Name and Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Nombre del Indicador *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Índice de Clima de Trabajo"
                    value={newInd.name}
                    onChange={e => setNewInd({ ...newInd, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dimensión / Categoría</label>
                  <input
                    type="text"
                    placeholder="Ej. Clima, Liderazgo, SST"
                    value={newInd.dimension}
                    onChange={e => setNewInd({ ...newInd, dimension: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Descripción de Métrica</label>
                <textarea
                  rows={2}
                  placeholder="Defina qué evalúa este indicador..."
                  value={newInd.description}
                  onChange={e => setNewInd({ ...newInd, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                />
              </div>

              {/* Formula and Responsible */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fórmula de Cálculo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. (A/B)*100"
                    value={newInd.formula}
                    onChange={e => setNewInd({ ...newInd, formula: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Responsable del Indicador *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Gerente de Talento"
                    value={newInd.responsible}
                    onChange={e => setNewInd({ ...newInd, responsible: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Frequency, Unit and Target */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Frecuencia</label>
                  <select
                    value={newInd.frequency}
                    onChange={e => setNewInd({ ...newInd, frequency: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none text-xs"
                  >
                    <option value="Mensual">Mensual</option>
                    <option value="Bimestral">Bimestral</option>
                    <option value="Trimestral">Trimestral</option>
                    <option value="Semestral">Semestral</option>
                    <option value="Anual">Anual</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unidad</label>
                  <input
                    type="text"
                    placeholder="%"
                    value={newInd.unit}
                    onChange={e => setNewInd({ ...newInd, unit: e.target.value })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Meta</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newInd.target}
                    onChange={e => setNewInd({ ...newInd, target: Number(e.target.value) })}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Regulations and Source */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Normatividad Asociada</label>
                  <input
                    type="text"
                    placeholder="Ej. Decreto 1072, ISO 45001"
                    value={newInd.regulations}
                    onChange={e => setNewInd({ ...newInd, regulations: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fuente de Datos</label>
                  <input
                    type="text"
                    placeholder="Ej. Sistema de Nómina, Encuestas"
                    value={newInd.dataSource}
                    onChange={e => setNewInd({ ...newInd, dataSource: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white"
                  />
                </div>
              </div>

              {/* Traffic Light Thresholds */}
              <div className="p-3 bg-indigo-50/10 border border-indigo-50 rounded-2xl space-y-2">
                <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest block">
                  Límites del Semáforo (Rango 0 - 100)
                </span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-rose-600 uppercase block">Crítico (Rojo) &lt;</label>
                    <input
                      type="number"
                      value={newInd.criticalThreshold}
                      onChange={e => setNewInd({ ...newInd, criticalThreshold: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-150 rounded-xl text-center font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-amber-600 uppercase block">Alerta (Amarillo) &ge;</label>
                    <input
                      type="number"
                      value={newInd.warningThreshold}
                      onChange={e => setNewInd({ ...newInd, warningThreshold: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-150 rounded-xl text-center font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-emerald-600 uppercase block">Saludable (Verde) &ge;</label>
                    <input
                      type="number"
                      value={newInd.successThreshold}
                      onChange={e => setNewInd({ ...newInd, successThreshold: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-slate-150 rounded-xl text-center font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Values setup */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valor Inicial Actual</label>
                  <input
                    type="number"
                    value={newInd.currentValue}
                    onChange={e => setNewInd({ ...newInd, currentValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Valor Anterior Histórico</label>
                  <input
                    type="number"
                    value={newInd.previousValue}
                    onChange={e => setNewInd({ ...newInd, previousValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold cursor-pointer transition-colors text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black cursor-pointer transition-colors shadow-3xs"
                >
                  Guardar Indicador
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

        </>
      )}

    </div>
  );
}
