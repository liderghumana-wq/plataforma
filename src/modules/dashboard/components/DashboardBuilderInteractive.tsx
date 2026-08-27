import React, { useState, useMemo } from 'react';
import { 
  Sparkles, Plus, Trash2, Code, Eye, RefreshCw, LayoutGrid, Check, Settings, Copy, Download, Upload, ClipboardCheck, ArrowUpRight
} from 'lucide-react';
import { DashboardConfig, DashboardWidget, WidgetType } from '../dashboardBuilder.types';
import DashboardRenderer from './DashboardRenderer';

// Predefined Module templates that demonstrate the builder's universal multi-module applicability
const MODULE_TEMPLATES: Record<string, DashboardConfig> = {
  clima_liderazgo: {
    id: 'dashboard_clima_standard',
    title: 'Dashboard de Clima y Cultura Organizacional',
    description: 'Indicadores agregados de la encuesta anual de clima, liderazgo y comunicación directiva.',
    themeColor: 'indigo',
    filters: [
      { id: 'area', label: 'Área / Departamento', type: 'select', options: ['Tecnología', 'Operaciones', 'Ventas', 'Recursos Humanos', 'Finanzas'] },
      { id: 'sede', label: 'Sede Física', type: 'select', options: ['Bogotá', 'Medellín', 'Cali', 'Remoto'] }
    ],
    widgets: [
      {
        id: 'kpi_clima_global',
        title: 'Favorabilidad Clima Global',
        description: 'Porcentaje de respuestas de acuerdo o muy de acuerdo.',
        type: 'kpi',
        layout: { colSpan: 1 },
        data: 74,
        config: {
          kpi: { valueSuffix: '%', trendValue: 4.2, trendDirection: 'up', colorTheme: 'indigo', subtext: 'Meta corporativa: > 75%' }
        }
      },
      {
        id: 'kpi_participacion',
        title: 'Tasa de Participación',
        description: 'Porcentaje total de colaboradores encuestados.',
        type: 'kpi',
        layout: { colSpan: 1 },
        data: 89,
        config: {
          kpi: { valueSuffix: '%', trendValue: 12.5, trendDirection: 'up', colorTheme: 'emerald', subtext: 'Histórico anterior: 76.5%' }
        }
      },
      {
        id: 'indicator_alerta_psic',
        title: 'Seguridad Psicológica',
        description: 'Métrica de confianza y libertad de expresión.',
        type: 'indicator',
        layout: { colSpan: 1 },
        data: 81,
        config: {
          indicator: { min: 0, max: 100, thresholds: { warning: 60, success: 75 }, indicatorType: 'gauge', label: 'Estatus del indicador' }
        }
      },
      {
        id: 'indicator_alerta_equilibrio',
        title: 'Equilibrio de Vida',
        description: 'Work-life balance y carga operativa.',
        type: 'indicator',
        layout: { colSpan: 1 },
        data: 58,
        config: {
          indicator: { min: 0, max: 100, thresholds: { warning: 60, success: 75 }, indicatorType: 'progress_bar', label: 'Riesgo de Burnout' }
        }
      },
      {
        id: 'chart_fav_dimensiones',
        title: 'Favorabilidad por Dimensión',
        description: 'Desglose porcentual acumulado de favorabilidad táctica.',
        type: 'bar',
        layout: { colSpan: 2 },
        data: [
          { name: 'Liderazgo', Favorabilidad: 78, Desfavorable: 12, Neutro: 10 },
          { name: 'Comunicación', Favorabilidad: 62, Desfavorable: 24, Neutro: 14 },
          { name: 'Compensación', Favorabilidad: 55, Desfavorable: 32, Neutro: 13 },
          { name: 'Desarrollo Profesional', Favorabilidad: 81, Desfavorable: 9, Neutro: 10 },
          { name: 'Ambiente Físico', Favorabilidad: 90, Desfavorable: 4, Neutro: 6 }
        ],
        config: {
          chart: {
            xAxisKey: 'name',
            dataKeys: ['Favorabilidad', 'Neutro', 'Desfavorable'],
            colors: ['#10b981', '#f59e0b', '#ef4444'],
            legend: true,
            grid: true
          }
        }
      },
      {
        id: 'chart_evolucion_clima',
        title: 'Evolución Histórica de Bienestar',
        description: 'Tasa de favorabilidad comparativa semestral.',
        type: 'line',
        layout: { colSpan: 2 },
        data: [
          { name: '2024-S1', Liderazgo: 70, Comunicacion: 58, Bienestar: 65 },
          { name: '2024-S2', Liderazgo: 72, Comunicacion: 60, Bienestar: 68 },
          { name: '2025-S1', Liderazgo: 75, Comunicacion: 62, Bienestar: 72 },
          { name: '2025-S2', Liderazgo: 78, Comunicacion: 62, Bienestar: 74 }
        ],
        config: {
          chart: {
            xAxisKey: 'name',
            dataKeys: ['Liderazgo', 'Comunicacion', 'Bienestar'],
            colors: ['#6366f1', '#10b981', '#ec4899'],
            legend: true,
            grid: true
          }
        }
      },
      {
        id: 'heatmap_departamentos',
        title: 'Mapa de Calor de Clima por Departamento',
        description: 'Porcentaje de favorabilidad desglosado por variables.',
        type: 'heatmap',
        layout: { colSpan: 2 },
        data: [
          { x: 'Tecnología', y: 'Liderazgo', value: 85 },
          { x: 'Tecnología', y: 'Comunicación', value: 72 },
          { x: 'Tecnología', y: 'Compensación', value: 68 },
          { x: 'Ventas', y: 'Liderazgo', value: 74 },
          { x: 'Ventas', y: 'Comunicación', value: 58 },
          { x: 'Ventas', y: 'Compensación', value: 52 },
          { x: 'Operaciones', y: 'Liderazgo', value: 62 },
          { x: 'Operaciones', y: 'Comunicación', value: 50 },
          { x: 'Operaciones', y: 'Compensación', value: 45 },
          { x: 'RH', y: 'Liderazgo', value: 91 },
          { x: 'RH', y: 'Comunicación', value: 88 },
          { x: 'RH', y: 'Compensación', value: 60 }
        ],
        config: {
          heatmap: {
            xCategories: ['Tecnología', 'Ventas', 'Operaciones', 'RH'],
            yCategories: ['Liderazgo', 'Comunicación', 'Compensación'],
            colorScale: 'blues',
            minValue: 40,
            maxValue: 100
          }
        }
      },
      {
        id: 'table_colaboradores_riesgo',
        title: 'Alertas Operativas por Área',
        description: 'Focos de desconexión pasiva identificados en el censo.',
        type: 'table',
        layout: { colSpan: 2 },
        data: [
          { area: 'Operaciones de Planta', lider: 'Carlos Gómez', nivel: 'Crítico', participacion: 48, alerta: 'Bajo Reconocimiento' },
          { area: 'Soporte y Mesa de Ayuda', lider: 'Ana Martínez', nivel: 'Crítico', participacion: 55, alerta: 'Burnout / Sobrecarga' },
          { area: 'Comercial Regional', lider: 'Felipe Restrepo', nivel: 'Regular', participacion: 72, alerta: 'Falta Claridad de Metas' },
          { area: 'Ingeniería de Software', lider: 'Laura Bernal', nivel: 'Estable', participacion: 95, alerta: 'Estable' },
          { area: 'Finanzas y Administración', lider: 'Marta Pérez', nivel: 'Estable', participacion: 88, alerta: 'Estable' }
        ],
        config: {
          table: {
            columns: [
              { key: 'area', header: 'Área de Negocio', type: 'text' },
              { key: 'lider', header: 'Líder / Supervisor', type: 'text' },
              { key: 'nivel', header: 'Estatus Clima', type: 'badge', badgeColors: { 'Crítico': 'bg-red-50 text-red-800 border-red-100', 'Regular': 'bg-amber-50 text-amber-800 border-amber-100', 'Estable': 'bg-emerald-50 text-emerald-800 border-emerald-100' } },
              { key: 'participacion', header: 'Tasa Part.', type: 'progress' },
              { key: 'alerta', header: 'Observación Crítica', type: 'text' }
            ],
            enableSearch: true,
            enableSort: true,
            pageSize: 5
          }
        }
      }
    ]
  },
  compensacion_beneficios: {
    id: 'dashboard_compensacion_benefits',
    title: 'Dashboard de Equidad Salarial y Beneficios',
    description: 'Auditoría interna sobre brecha salarial, bonificaciones y competitividad en el mercado.',
    themeColor: 'emerald',
    widgets: [
      {
        id: 'kpi_gasto_total',
        title: 'Presupuesto Anual Nómina',
        description: 'Monto acumulado gastado en talento.',
        type: 'kpi',
        layout: { colSpan: 1 },
        data: '1,450,000',
        config: {
          kpi: { valuePrefix: '$', trendValue: 8.5, trendDirection: 'up', colorTheme: 'emerald', subtext: 'Proyección cierre año fiscal' }
        }
      },
      {
        id: 'kpi_compara_mercado',
        title: 'Índice de Competitividad',
        description: 'Relación promedio vs mercado local.',
        type: 'kpi',
        layout: { colSpan: 1 },
        data: '1.08',
        config: {
          kpi: { trendValue: 1.2, trendDirection: 'up', colorTheme: 'indigo', subtext: 'Por encima del promedio local (1.0)' }
        }
      },
      {
        id: 'donut_presupuesto_tipo',
        title: 'Distribución de Costo de Compensación',
        description: 'Categorización de incentivos de capital.',
        type: 'donut',
        layout: { colSpan: 2 },
        data: [
          { name: 'Salario Base', value: 720000 },
          { name: 'Seguros y Salud', value: 280000 },
          { name: 'Bonos de Desempeño', value: 250000 },
          { name: 'Capacitación', value: 120000 },
          { name: 'Incentivos de Bienestar', value: 80000 }
        ],
        config: {
          chart: {
            xAxisKey: 'name',
            dataKeys: ['value'],
            colors: ['#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'],
            legend: true
          }
        }
      }
    ]
  },
  desempeno_feedback: {
    id: 'dashboard_desempeno_feedback',
    title: 'Dashboard de Rendimiento y Evaluación 360',
    description: 'Consolidado dinámico de autoevaluaciones, feedback de pares y calibraciones de líderes.',
    themeColor: 'amber',
    widgets: [
      {
        id: 'kpi_prom_desempeno',
        title: 'Promedio Calibración General',
        description: 'Calificación promedio en escala de 1 a 5.',
        type: 'kpi',
        layout: { colSpan: 1 },
        data: '4.12',
        config: {
          kpi: { valueSuffix: ' / 5', trendValue: 3.8, trendDirection: 'up', colorTheme: 'amber', subtext: 'Meta corporativa: > 4.0' }
        }
      },
      {
        id: 'radar_competencias_global',
        title: 'Matriz Global de Competencias',
        description: 'Evaluación agregada por pilar organizacional.',
        type: 'radar',
        layout: { colSpan: 3 },
        data: [
          { name: 'Trabajo en Equipo', Autoevaluacion: 85, Supervisor: 78, Pares: 82 },
          { name: 'Orientación a Resultados', Autoevaluacion: 90, Supervisor: 88, Pares: 84 },
          { name: 'Adaptabilidad', Autoevaluacion: 72, Supervisor: 75, Pares: 78 },
          { name: 'Innovación', Autoevaluacion: 80, Supervisor: 72, Pares: 74 },
          { name: 'Liderazgo Influencia', Autoevaluacion: 75, Supervisor: 81, Pares: 79 }
        ],
        config: {
          chart: {
            xAxisKey: 'name',
            dataKeys: ['Supervisor', 'Pares', 'Autoevaluacion'],
            colors: ['#f59e0b', '#3b82f6', '#10b981'],
            legend: true
          }
        }
      }
    ]
  }
};

export default function DashboardBuilderInteractive() {
  const [activeTemplateKey, setActiveTemplateKey] = useState<string>('clima_liderazgo');
  const [builderConfig, setBuilderConfig] = useState<DashboardConfig>(JSON.parse(JSON.stringify(MODULE_TEMPLATES.clima_liderazgo)));
  
  // Custom states for editing widgets
  const [selectedWidgetId, setSelectedWidgetId] = useState<string | null>(builderConfig.widgets[0]?.id || null);
  const [activeViewMode, setActiveViewMode] = useState<'preview' | 'schema'>('preview');
  const [isCopied, setIsCopied] = useState(false);

  // Sync builder layout state when shifting templates
  const handleTemplateShift = (key: string) => {
    setActiveTemplateKey(key);
    const deepCopied = JSON.parse(JSON.stringify(MODULE_TEMPLATES[key]));
    setBuilderConfig(deepCopied);
    setSelectedWidgetId(deepCopied.widgets[0]?.id || null);
  };

  // Find currently active editing widget
  const activeEditingWidget = useMemo(() => {
    return builderConfig.widgets.find(w => w.id === selectedWidgetId) || null;
  }, [builderConfig.widgets, selectedWidgetId]);

  // Update a widget value dynamically
  const updateWidgetField = (widgetId: string, field: keyof DashboardWidget, value: any) => {
    setBuilderConfig(prev => {
      const updatedWidgets = prev.widgets.map(w => {
        if (w.id === widgetId) {
          return { ...w, [field]: value };
        }
        return w;
      });
      return { ...prev, widgets: updatedWidgets };
    });
  };

  // Update widget layout width
  const updateWidgetSpan = (widgetId: string, colSpan: 1 | 2 | 3 | 4) => {
    setBuilderConfig(prev => {
      const updatedWidgets = prev.widgets.map(w => {
        if (w.id === widgetId) {
          return { ...w, layout: { ...w.layout, colSpan } };
        }
        return w;
      });
      return { ...prev, widgets: updatedWidgets };
    });
  };

  // Add a new empty widget
  const handleAddWidget = () => {
    const newId = `widget_${Date.now().toString().slice(-6)}`;
    const newWidget: DashboardWidget = {
      id: newId,
      title: 'Nuevo Widget Personalizado',
      description: 'Haz clic aquí para editar la configuración de esta tarjeta.',
      type: 'kpi',
      layout: { colSpan: 1 },
      data: 100,
      config: {
        kpi: { valueSuffix: '%', trendValue: 5, trendDirection: 'up', colorTheme: 'indigo', subtext: 'Nuevo indicador' }
      }
    };

    setBuilderConfig(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
    setSelectedWidgetId(newId);
  };

  // Delete widget
  const handleDeleteWidget = (widgetId: string) => {
    setBuilderConfig(prev => {
      const filtered = prev.widgets.filter(w => w.id !== widgetId);
      return { ...prev, widgets: filtered };
    });
    setSelectedWidgetId(prevId => prevId === widgetId ? null : prevId);
  };

  // Copy Schema JSON
  const handleCopySchema = () => {
    try {
      navigator.clipboard.writeText(JSON.stringify(builderConfig, null, 2));
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  // Download Config JSON
  const handleDownloadSchema = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(builderConfig, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `dashboard_builder_config_${activeTemplateKey}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error(err);
    }
  };

  // Upload custom config schema
  const handleUploadSchema = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const uploaded = JSON.parse(text) as DashboardConfig;
        if (!uploaded.id || !uploaded.widgets) {
          throw new Error("Formato inválido. Falta ID o Widgets.");
        }
        setBuilderConfig(uploaded);
        setSelectedWidgetId(uploaded.widgets[0]?.id || null);
        alert("¡Configuración de dashboard cargada con éxito!");
      } catch (err: any) {
        alert(`Error al cargar el archivo: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      
      {/* Introduction Cabezote */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border border-slate-800 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="space-y-1.5 text-left z-10 max-w-2xl">
          <div className="flex items-center gap-1.5 text-indigo-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800/60">
              MÓDULO UNIVERSAL EN ACCIÓN
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black font-display tracking-tight">Creador & Constructor Universal de Dashboards</h1>
          <p className="text-xs text-slate-300 font-semibold leading-relaxed">
            Estructura cualquier dashboard mediante parámetros JSON de forma 100% interactiva. Ideal para incorporar dashboards en módulos de Clima, Compensación, Desempeño u Operaciones de forma unificada.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0 z-10">
          <label className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-3xs text-slate-100">
            <Upload className="w-4 h-4 text-slate-300" />
            <span>Cargar JSON</span>
            <input type="file" accept=".json" onChange={handleUploadSchema} className="hidden" />
          </label>
          <button
            onClick={handleDownloadSchema}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Config</span>
          </button>
        </div>
      </div>

      {/* Module Presets Tab selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
        <div className="flex flex-wrap gap-1.5">
          {[
            { key: 'clima_liderazgo', label: 'Estructura Clima & Liderazgo', theme: 'indigo' },
            { key: 'compensacion_beneficios', label: 'Estructura Equidad Salarial', theme: 'emerald' },
            { key: 'desempeno_feedback', label: 'Estructura Feedback 360', theme: 'amber' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => handleTemplateShift(item.key)}
              className={`px-4 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                activeTemplateKey === item.key
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-3xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-150'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveViewMode('preview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
              activeViewMode === 'preview' 
                ? 'bg-slate-100 text-slate-800 font-extrabold' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Vista Previa</span>
          </button>
          <button
            onClick={() => setActiveViewMode('schema')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${
              activeViewMode === 'schema' 
                ? 'bg-slate-100 text-slate-800 font-extrabold' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Ver Configuración JSON</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW SCHEMA JSON MODE */}
      {activeViewMode === 'schema' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-left relative overflow-hidden animate-fade-in">
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={handleCopySchema}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all flex items-center gap-1.5 text-xs font-black border border-slate-700 cursor-pointer"
            >
              {isCopied ? (
                <>
                  <ClipboardCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar JSON</span>
                </>
              )}
            </button>
          </div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
            Parámetros Declarativos de Configuración Dashboard: {builderConfig.title}
          </h3>
          <pre className="font-mono text-xs text-cyan-300 bg-slate-950/80 p-5 rounded-2xl max-h-120 overflow-y-auto leading-relaxed border border-slate-800/80">
            {JSON.stringify(builderConfig, null, 2)}
          </pre>
        </div>
      ) : (
        /* TWO COLUMN EDITING & PREVIEW */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDE: CONFIGURATOR CONTROL PANEL */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-2xs p-5 space-y-6 text-left max-h-180 overflow-y-auto">
            
            {/* Form Info General */}
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-700 font-display uppercase tracking-wider flex items-center gap-1.5">
                  <LayoutGrid className="w-4 h-4 text-indigo-500" />
                  <span>Configuración General</span>
                </h3>
                <button
                  onClick={handleAddWidget}
                  className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black border border-indigo-100 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Añadir Tarjeta</span>
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-1">Título del Dashboard</label>
                  <input
                    type="text"
                    value={builderConfig.title}
                    onChange={e => setBuilderConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-1">Descripción</label>
                  <textarea
                    value={builderConfig.description || ''}
                    rows={2}
                    onChange={e => setBuilderConfig(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-150 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* List of Widgets to Edit */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-700 font-display uppercase tracking-wider pb-2 border-b border-slate-100">
                Tarjetas y Módulos ({builderConfig.widgets.length})
              </h3>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {builderConfig.widgets.map((widget) => (
                  <div
                    key={widget.id}
                    onClick={() => setSelectedWidgetId(widget.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center gap-2 ${
                      selectedWidgetId === widget.id
                        ? 'border-indigo-600 bg-indigo-50/10'
                        : 'border-slate-150 hover:border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">{widget.title}</h4>
                      <div className="flex gap-1.5 items-center">
                        <span className="text-[8px] px-1.5 py-0.5 rounded font-black bg-slate-200 text-slate-600 uppercase tracking-widest font-mono">
                          {widget.type}
                        </span>
                        <span className="text-[9px] text-slate-400">Ancho: {widget.layout.colSpan}/4</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWidget(widget.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar widget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Editing Details of Selected Widget */}
            {activeEditingWidget && (
              <div className="space-y-4 p-4 rounded-2xl bg-slate-50 border border-slate-150 animate-fade-in">
                <div className="flex items-center gap-1.5 text-slate-500 pb-1.5 border-b border-slate-200">
                  <Settings className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Editar Tarjeta Seleccionada</span>
                </div>

                <div className="space-y-3 text-xs font-semibold">
                  <div>
                    <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-1">Título de Tarjeta</label>
                    <input
                      type="text"
                      value={activeEditingWidget.title}
                      onChange={e => updateWidgetField(activeEditingWidget.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-1">Descripción corta</label>
                    <input
                      type="text"
                      value={activeEditingWidget.description || ''}
                      onChange={e => updateWidgetField(activeEditingWidget.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-1">Tipo de Widget</label>
                      <select
                        value={activeEditingWidget.type}
                        onChange={e => updateWidgetField(activeEditingWidget.id, 'type', e.target.value as WidgetType)}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        <option value="kpi">KPI Numérico</option>
                        <option value="bar">Gráfico de Barras</option>
                        <option value="donut">Gráfico de Dona</option>
                        <option value="line">Gráfico de Líneas</option>
                        <option value="radar">Gráfico de Radar</option>
                        <option value="heatmap">Mapa de Calor</option>
                        <option value="table">Tabla Dinámica</option>
                        <option value="indicator">Indicador / Gauge</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-1">Ancho Col-Span</label>
                      <select
                        value={activeEditingWidget.layout.colSpan}
                        onChange={e => updateWidgetSpan(activeEditingWidget.id, Number(e.target.value) as 1 | 2 | 3 | 4)}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                      >
                        <option value="1">1 col (Pequeño)</option>
                        <option value="2">2 col (Medio)</option>
                        <option value="3">3 col (Grande)</option>
                        <option value="4">4 col (Completo)</option>
                      </select>
                    </div>
                  </div>

                  {/* Contextual values dependent on WidgetType */}
                  {activeEditingWidget.type === 'kpi' && (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-1">Valor Actual</label>
                          <input
                            type="text"
                            value={String(activeEditingWidget.data)}
                            onChange={e => updateWidgetField(activeEditingWidget.id, 'data', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-1">Prefijo / Sufijo</label>
                          <input
                            type="text"
                            placeholder="Ej: % o $"
                            value={activeEditingWidget.config?.kpi?.valueSuffix || ''}
                            onChange={e => {
                              const existing = activeEditingWidget.config || {};
                              updateWidgetField(activeEditingWidget.id, 'config', {
                                ...existing,
                                kpi: { ...(existing.kpi || {}), valueSuffix: e.target.value }
                              });
                            }}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEditingWidget.type === 'indicator' && (
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-1">Valor (0 - 100)</label>
                          <input
                            type="number"
                            value={Number(activeEditingWidget.data) || 0}
                            onChange={e => updateWidgetField(activeEditingWidget.id, 'data', Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block mb-1">Formato</label>
                          <select
                            value={activeEditingWidget.config?.indicator?.indicatorType || 'gauge'}
                            onChange={e => {
                              const existing = activeEditingWidget.config || {};
                              updateWidgetField(activeEditingWidget.id, 'config', {
                                ...existing,
                                indicator: { ...(existing.indicator || {}), indicatorType: e.target.value as 'gauge' | 'progress_bar' }
                              });
                            }}
                            className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                          >
                            <option value="gauge">Semicírculo Gauge</option>
                            <option value="progress_bar">Barra de Progreso</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDE: LIVE RENDER PREVIEW PANEL */}
          <div className="lg:col-span-8 space-y-6">
            <DashboardRenderer config={builderConfig} />
          </div>

        </div>
      )}

    </div>
  );
}
