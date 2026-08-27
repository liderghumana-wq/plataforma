import React, { useState, useMemo } from 'react';
import { 
  Filter, HelpCircle, FileSpreadsheet, RefreshCw, BarChart4, PieChart as PieIcon, LineChart as LineIcon, Grid, ListCollapse, Settings
} from 'lucide-react';
import { DashboardConfig, DashboardWidget } from '../dashboardBuilder.types';
import { 
  KPICard, 
  ReusableBarChart, 
  ReusableDonutChart, 
  ReusableLineChart, 
  ReusableRadarChart, 
  ReusableHeatmap, 
  ReusableTable, 
  ReusableIndicator 
} from './ReusableCharts';

interface DashboardRendererProps {
  config: DashboardConfig;
  onFilterChange?: (filterId: string, value: string) => void;
}

export default function DashboardRenderer({ config, onFilterChange }: DashboardRendererProps) {
  // Store state for selected filters
  const [filterValues, setFilterValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    config.filters?.forEach(f => {
      if (f.defaultValue) initial[f.id] = f.defaultValue;
    });
    return initial;
  });

  const handleFilterSelect = (filterId: string, val: string) => {
    setFilterValues(prev => ({ ...prev, [filterId]: val }));
    if (onFilterChange) {
      onFilterChange(filterId, val);
    }
  };

  const getColSpanClass = (span: 1 | 2 | 3 | 4) => {
    const mapping = {
      1: 'lg:col-span-3 md:col-span-6 col-span-12',
      2: 'lg:col-span-6 md:col-span-12 col-span-12',
      3: 'lg:col-span-9 md:col-span-12 col-span-12',
      4: 'lg:col-span-12 md:col-span-12 col-span-12',
    };
    return mapping[span] || 'lg:col-span-4 md:col-span-6 col-span-12';
  };

  // Helper to render individual widgets based on their schema type
  const renderWidgetContent = (widget: DashboardWidget) => {
    switch (widget.type) {
      case 'kpi':
        return (
          <KPICard
            title={widget.title}
            description={widget.description}
            value={widget.data}
            config={widget.config?.kpi}
          />
        );
      case 'bar':
        return (
          <ReusableBarChart
            title={widget.title}
            data={widget.data}
            config={widget.config?.chart}
          />
        );
      case 'donut':
        return (
          <ReusableDonutChart
            title={widget.title}
            data={widget.data}
            config={widget.config?.chart}
          />
        );
      case 'line':
        return (
          <ReusableLineChart
            title={widget.title}
            data={widget.data}
            config={widget.config?.chart}
          />
        );
      case 'radar':
        return (
          <ReusableRadarChart
            title={widget.title}
            data={widget.data}
            config={widget.config?.chart}
          />
        );
      case 'heatmap':
        return (
          <ReusableHeatmap
            title={widget.title}
            data={widget.data}
            config={widget.config?.heatmap}
          />
        );
      case 'table':
        return (
          <ReusableTable
            title={widget.title}
            data={widget.data}
            config={widget.config?.table}
          />
        );
      case 'indicator':
        return (
          <ReusableIndicator
            title={widget.title}
            value={Number(widget.data) || 0}
            config={widget.config?.indicator}
          />
        );
      default:
        return (
          <div className="p-6 text-center text-xs text-red-500 font-bold border border-red-100 rounded-2xl bg-red-50">
            Módulo de visualización "{widget.type}" desconocido o incompleto.
          </div>
        );
    }
  };

  const getWidgetIcon = (type: string) => {
    switch (type) {
      case 'kpi': return Settings;
      case 'bar': return BarChart4;
      case 'donut': return PieIcon;
      case 'line': return LineIcon;
      case 'heatmap': return Grid;
      case 'table': return ListCollapse;
      default: return Filter;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Dashboard Heading & Optional Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="space-y-1 text-left">
          <h2 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
            <span>{config.title}</span>
            <span className="text-[10px] bg-slate-900 text-white font-black px-2 py-0.5 rounded border border-slate-700 uppercase tracking-widest">
              Renderizado por Config
            </span>
          </h2>
          {config.description && (
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">{config.description}</p>
          )}
        </div>

        {/* Dynamic Filters Section */}
        {config.filters && config.filters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Filtros:</span>
            </div>
            
            {config.filters.map(filter => (
              <div key={filter.id} className="flex flex-col gap-0.5">
                <select
                  value={filterValues[filter.id] || ''}
                  onChange={e => handleFilterSelect(filter.id, e.target.value)}
                  className="px-3.5 py-1.5 bg-slate-50 border border-slate-150 text-slate-700 text-xs font-black rounded-xl cursor-pointer hover:bg-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                >
                  <option value="">{filter.label} (Todos)</option>
                  {filter.options?.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid of configurable widgets */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {config.widgets.map(widget => {
          // If the widget is a KPI card, we don't need a wrapper with additional headers
          // since KPI Cards look best completely clean and self-contained
          const isKpi = widget.type === 'kpi';
          
          if (isKpi) {
            return (
              <div key={widget.id} className={getColSpanClass(widget.layout.colSpan)}>
                {renderWidgetContent(widget)}
              </div>
            );
          }

          const WidgetIcon = getWidgetIcon(widget.type);

          return (
            <div 
              key={widget.id} 
              className={`${getColSpanClass(widget.layout.colSpan)} bg-white rounded-3xl border border-slate-100 shadow-3xs p-6 flex flex-col justify-between hover:shadow-xs transition-shadow duration-300 text-left`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3 mb-4 gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-xs font-black text-slate-800 font-display uppercase tracking-wider flex items-center gap-1.5">
                    <WidgetIcon className="w-4 h-4 text-slate-400" />
                    <span>{widget.title}</span>
                  </h3>
                  {widget.description && (
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                      {widget.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Widget Visual Content */}
              <div className="flex-1">
                {renderWidgetContent(widget)}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
