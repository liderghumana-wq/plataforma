import React, { useState, useMemo } from 'react';
import { 
  ArrowUpRight, ArrowDownRight, Minus, Search, ArrowUpDown, ChevronLeft, ChevronRight, FileSpreadsheet, Percent, ShieldCheck
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  KPIWidgetConfig, 
  ChartWidgetConfig, 
  HeatmapCell, 
  HeatmapWidgetConfig, 
  TableWidgetColumn, 
  TableWidgetConfig, 
  IndicatorWidgetConfig 
} from '../dashboardBuilder.types';

// ==========================================
// 1. KPI CARD COMPONENT
// ==========================================
interface KPICardProps {
  title: string;
  description?: string;
  value: string | number;
  config?: KPIWidgetConfig;
}

export function KPICard({ title, description, value, config = {} }: KPICardProps) {
  const {
    valuePrefix = '',
    valueSuffix = '',
    trendValue,
    trendDirection = 'neutral',
    colorTheme = 'indigo',
    subtext
  } = config;

  const themeClasses = {
    indigo: 'border-indigo-100 bg-indigo-50/10 text-indigo-600',
    emerald: 'border-emerald-100 bg-emerald-50/10 text-emerald-600',
    amber: 'border-amber-100 bg-amber-50/10 text-amber-600',
    rose: 'border-rose-100 bg-rose-50/10 text-rose-600',
    slate: 'border-slate-100 bg-slate-50/10 text-slate-600',
    cyan: 'border-cyan-100 bg-cyan-50/10 text-cyan-600',
  };

  const trendColorClass = 
    trendDirection === 'up' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
    trendDirection === 'down' ? 'text-rose-600 bg-rose-50 border-rose-100' :
    'text-slate-500 bg-slate-50 border-slate-100';

  const TrendIcon = 
    trendDirection === 'up' ? ArrowUpRight :
    trendDirection === 'down' ? ArrowDownRight :
    Minus;

  return (
    <div className={`p-6 rounded-3xl border bg-white shadow-3xs flex flex-col justify-between h-full hover:shadow-xs transition-shadow duration-300`}>
      <div className="space-y-1">
        <div className="flex justify-between items-start gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{title}</span>
          {trendValue !== undefined && (
            <div className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full border text-[10px] font-extrabold ${trendColorClass}`}>
              <TrendIcon className="w-3 h-3 stroke-[3]" />
              <span>{trendValue}%</span>
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-1 mt-2">
          {valuePrefix && <span className="text-lg font-bold text-slate-400 font-display">{valuePrefix}</span>}
          <span className="text-2xl font-black text-slate-800 font-display leading-none">
            {value}
          </span>
          {valueSuffix && <span className="text-sm font-bold text-slate-500">{valueSuffix}</span>}
        </div>
      </div>

      {(subtext || description) && (
        <p className="text-[10px] text-slate-400 font-semibold mt-4 border-t border-slate-100/60 pt-3">
          {subtext || description}
        </p>
      )}
    </div>
  );
}

// ==========================================
// 2. REUSABLE BAR CHART
// ==========================================
interface BarChartProps {
  title: string;
  data: any[];
  config?: ChartWidgetConfig;
}

export function ReusableBarChart({ title, data, config = { dataKeys: [] } }: BarChartProps) {
  const {
    xAxisKey = 'name',
    dataKeys = [],
    colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
    stacked = false,
    legend = true,
    grid = true
  } = config;

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            {grid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />}
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} stroke="#e2e8f0" />
            <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#e2e8f0" />
            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }} />
            {legend && <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />}
            {dataKeys.map((key, i) => (
              <Bar 
                key={key} 
                dataKey={key} 
                fill={colors[i % colors.length]} 
                stackId={stacked ? 'stack' : undefined}
                radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ==========================================
// 3. REUSABLE DONUT CHART
// ==========================================
interface DonutChartProps {
  title: string;
  data: any[];
  config?: ChartWidgetConfig;
}

export function ReusableDonutChart({ title, data, config = { dataKeys: [] } }: DonutChartProps) {
  const {
    xAxisKey = 'name',
    dataKeys = ['value'],
    colors = ['#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'],
    donutRadius = 60,
    legend = true
  } = config;

  // Compute total for center display
  const totalValue = useMemo(() => {
    const key = dataKeys[0] || 'value';
    return data.reduce((sum, item) => sum + (Number(item[key]) || 0), 0);
  }, [data, dataKeys]);

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="h-64 relative mt-2 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={donutRadius}
              outerRadius={donutRadius + 22}
              paddingAngle={3}
              dataKey={dataKeys[0] || 'value'}
              nameKey={xAxisKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0' }} />
            {legend && <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '10px', pt: 4 }} />}
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Total overlay */}
        <div className="absolute text-center flex flex-col items-center justify-center pointer-events-none pb-4">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
          <span className="text-xl font-black text-slate-800 font-display leading-none mt-0.5">
            {totalValue >= 1000 ? totalValue.toLocaleString() : totalValue}
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. REUSABLE LINE CHART
// ==========================================
interface LineChartProps {
  title: string;
  data: any[];
  config?: ChartWidgetConfig;
}

export function ReusableLineChart({ title, data, config = { dataKeys: [] } }: LineChartProps) {
  const {
    xAxisKey = 'name',
    dataKeys = [],
    colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
    legend = true,
    grid = true
  } = config;

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            {grid && <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />}
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 'bold' }} stroke="#e2e8f0" />
            <YAxis tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#e2e8f0" />
            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0' }} />
            {legend && <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />}
            {dataKeys.map((key, i) => (
              <Line 
                key={key} 
                type="monotone" 
                dataKey={key} 
                stroke={colors[i % colors.length]} 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ==========================================
// 5. REUSABLE RADAR CHART
// ==========================================
interface RadarChartProps {
  title: string;
  data: any[];
  config?: ChartWidgetConfig;
}

export function ReusableRadarChart({ title, data, config = { dataKeys: [] } }: RadarChartProps) {
  const {
    xAxisKey = 'name',
    dataKeys = [],
    colors = ['#6366f1', '#10b981', '#f59e0b'],
    legend = true
  } = config;

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="h-64 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis dataKey={xAxisKey} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
            {dataKeys.map((key, i) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={colors[i % colors.length]}
                fill={colors[i % colors.length]}
                fillOpacity={0.25}
              />
            ))}
            <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
            {legend && <Legend wrapperStyle={{ fontSize: '10px', pt: 2 }} />}
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ==========================================
// 6. DYNAMIC AND POLISHED HEATMAP
// ==========================================
interface HeatmapProps {
  title: string;
  data: HeatmapCell[];
  config?: HeatmapWidgetConfig;
}

export function ReusableHeatmap({ title, data, config }: HeatmapProps) {
  const {
    xCategories = [],
    yCategories = [],
    colorScale = 'blues',
    minValue = 0,
    maxValue = 100
  } = config || {};

  // Group cells into a matrix representation for rapid lookup
  const cellLookup = useMemo(() => {
    const lookup: Record<string, Record<string, number>> = {};
    data.forEach(cell => {
      if (!lookup[cell.x]) lookup[cell.x] = {};
      lookup[cell.x][cell.y] = cell.value;
    });
    return lookup;
  }, [data]);

  // Dynamic Tailwind background colors based on score %
  const getCellColorClass = (val: number | undefined) => {
    if (val === undefined) return 'bg-slate-50 text-slate-300';
    
    const pct = maxValue > minValue ? (val - minValue) / (maxValue - minValue) : val / 100;
    
    if (colorScale === 'greens') {
      if (pct >= 0.8) return 'bg-emerald-600 text-white';
      if (pct >= 0.6) return 'bg-emerald-400 text-emerald-950';
      if (pct >= 0.4) return 'bg-emerald-200 text-emerald-900';
      if (pct >= 0.2) return 'bg-emerald-100 text-emerald-800';
      return 'bg-emerald-50 text-emerald-700';
    }
    
    if (colorScale === 'warm') {
      if (pct >= 0.8) return 'bg-orange-600 text-white';
      if (pct >= 0.6) return 'bg-orange-400 text-orange-950';
      if (pct >= 0.4) return 'bg-amber-300 text-amber-950';
      if (pct >= 0.2) return 'bg-amber-100 text-amber-800';
      return 'bg-rose-50 text-rose-700';
    }

    if (colorScale === 'purples') {
      if (pct >= 0.8) return 'bg-violet-600 text-white';
      if (pct >= 0.6) return 'bg-violet-400 text-violet-950';
      if (pct >= 0.4) return 'bg-violet-200 text-violet-900';
      if (pct >= 0.2) return 'bg-violet-100 text-violet-800';
      return 'bg-violet-50 text-violet-700';
    }

    // Default: Blues
    if (pct >= 0.8) return 'bg-indigo-600 text-white';
    if (pct >= 0.6) return 'bg-indigo-400 text-indigo-950';
    if (pct >= 0.4) return 'bg-indigo-200 text-indigo-900';
    if (pct >= 0.2) return 'bg-indigo-100 text-indigo-800';
    return 'bg-indigo-50/50 text-indigo-700';
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-x-auto">
      <div className="min-w-[480px] p-2 space-y-4">
        {/* Heatmap Grid */}
        <div className="grid gap-2" style={{ gridTemplateColumns: `100px repeat(${xCategories.length}, minmax(0, 1fr))` }}>
          
          {/* Header Row corner */}
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center">
            Matriz
          </div>
          
          {/* Header row items (X axis) */}
          {xCategories.map(x => (
            <div key={x} className="text-center text-[10px] font-black text-slate-500 uppercase tracking-wider py-1 truncate" title={x}>
              {x}
            </div>
          ))}

          {/* Rows (Y axis items) */}
          {yCategories.map(y => (
            <React.Fragment key={y}>
              {/* Row title label */}
              <div className="text-[10px] font-black text-slate-600 flex items-center pr-2 py-2 truncate" title={y}>
                {y}
              </div>

              {/* Data tiles */}
              {xCategories.map(x => {
                const val = cellLookup[x]?.[y];
                return (
                  <div
                    key={`${x}-${y}`}
                    className={`rounded-xl p-2.5 text-center transition-all hover:scale-105 hover:shadow-2xs duration-200 flex flex-col items-center justify-center font-mono font-bold text-xs border border-white/40 ${getCellColorClass(val)}`}
                    title={`${y} @ ${x}: ${val !== undefined ? val : 'N/A'}`}
                  >
                    <span>{val !== undefined ? val : '-'}</span>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        {/* Legend Scale footer */}
        <div className="flex items-center justify-end gap-3 text-[10px] font-bold text-slate-400 border-t border-slate-100 pt-3">
          <span>Menor intensidad</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(step => {
              const dummyVal = minValue + (maxValue - minValue) * (step - 1) / 4;
              return (
                <div 
                  key={step} 
                  className={`w-6 h-3 rounded ${getCellColorClass(dummyVal)}`}
                />
              );
            })}
          </div>
          <span>Mayor intensidad</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. POLISHED DYNAMIC TABLE
// ==========================================
interface TableProps {
  title: string;
  data: any[];
  config?: TableWidgetConfig;
}

export function ReusableTable({ title, data, config }: TableProps) {
  const {
    columns = [],
    enableSearch = true,
    enableSort = true,
    pageSize = 5
  } = config || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter Rows by Search
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const lowerQuery = searchQuery.toLowerCase().trim();
    return data.filter(row => {
      return Object.values(row).some(cellVal => 
        String(cellVal).toLowerCase().includes(lowerQuery)
      );
    });
  }, [data, searchQuery]);

  // Sort Rows
  const sortedData = useMemo(() => {
    if (!sortKey || !enableSort) return filteredData;
    
    const sorted = [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      return sortDirection === 'asc' 
        ? String(valA).localeCompare(String(valB)) 
        : String(valB).localeCompare(String(valA));
    });
    return sorted;
  }, [filteredData, sortKey, sortDirection, enableSort]);

  // Paginate Rows
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;

  const handleSort = (key: string) => {
    if (!enableSort) return;
    if (sortKey === key) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const exportCSV = () => {
    try {
      const csvHeaders = columns.map(c => `"${c.header}"`).join(',');
      const csvRows = sortedData.map(row => 
        columns.map(c => {
          const val = row[c.key];
          return `"${String(val !== undefined && val !== null ? val : '').replace(/"/g, '""')}"`;
        }).join(',')
      );
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [csvHeaders, ...csvRows].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '_')}_export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      {/* Table search & Actions */}
      {enableSearch && (
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar registros..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all"
            />
          </div>
          
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-[11px] font-bold border border-slate-200 shadow-3xs flex items-center gap-1 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Exportar CSV ({sortedData.length})</span>
          </button>
        </div>
      )}

      {/* Actual Data Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-150">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-150">
              {columns.map((col: TableWidgetColumn) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`p-3 font-black text-slate-500 uppercase tracking-wider text-[10px] select-none ${
                    enableSort ? 'cursor-pointer hover:bg-slate-100 hover:text-slate-700' : ''
                  } text-${col.align || 'left'}`}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {enableSort && sortKey === col.key && (
                      <ArrowUpDown className="w-3 h-3 text-indigo-500 shrink-0" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-slate-400 font-semibold text-xs">
                  No se encontraron registros correspondientes.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-indigo-50/10 transition-colors">
                  {columns.map((col: TableWidgetColumn) => {
                    const rawVal = row[col.key];
                    
                    return (
                      <td key={col.key} className={`p-3 text-${col.align || 'left'}`}>
                        {col.type === 'badge' ? (
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            col.badgeColors?.[rawVal] || 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            {rawVal}
                          </span>
                        ) : col.type === 'progress' ? (
                          <div className="flex items-center gap-2 min-w-[100px]">
                            <span className="font-mono text-[10px] w-8 text-right font-black">{rawVal}%</span>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full bg-indigo-500" 
                                style={{ width: `${Number(rawVal) || 0}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-800 text-[11px]">{rawVal}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 pt-2">
          <span>
            Mostrando {Math.min(sortedData.length, (currentPage - 1) * pageSize + 1)} - {Math.min(sortedData.length, currentPage * pageSize)} de {sortedData.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700">
              Pág. {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 8. GAUGES AND VISUAL STATUS METERS
// ==========================================
interface IndicatorProps {
  title: string;
  value: number;
  config?: IndicatorWidgetConfig;
}

export function ReusableIndicator({ title, value, config }: IndicatorProps) {
  const {
    min = 0,
    max = 100,
    thresholds = { warning: 60, success: 75 },
    indicatorType = 'gauge',
    label = ''
  } = config || {};

  // Standard percentage normalization
  const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const status = 
    value >= thresholds.success ? 'healthy' :
    value >= thresholds.warning ? 'warning' : 'critical';

  const statusColor = 
    status === 'healthy' ? '#10b981' : // Emerald
    status === 'warning' ? '#f59e0b' : // Amber
    '#ef4444'; // Rose

  const statusBg = 
    status === 'healthy' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
    status === 'warning' ? 'bg-amber-50 text-amber-800 border-amber-100' :
    'bg-rose-50 text-rose-800 border-rose-100';

  const statusLabel = 
    status === 'healthy' ? 'Saludable' :
    status === 'warning' ? 'Precaución' : 'Foco Crítico';

  if (indicatorType === 'gauge') {
    // Pure SVG Semi-circle gauge (radius 50)
    const strokeDash = 157; // semi-circle stroke length
    const offset = strokeDash - (pct / 100) * strokeDash;

    return (
      <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
        <div className="relative w-40 h-24">
          <svg className="w-full h-full" viewBox="0 0 120 70">
            {/* Background Arc */}
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke="#f1f5f9"
              strokeWidth="10"
              strokeLinecap="round"
            />
            {/* Filled status Arc */}
            <path
              d="M 10 60 A 50 50 0 0 1 110 60"
              fill="none"
              stroke={statusColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={strokeDash}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Numeric Value Overlay */}
          <div className="absolute inset-x-0 bottom-1 text-center flex flex-col justify-end">
            <span className="text-2xl font-black font-display text-slate-800">{value}</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{label || `${min} - ${max}`}</span>
          </div>
        </div>

        {/* Badge details */}
        <div className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider ${statusBg}`}>
          {statusLabel}: {value}%
        </div>
      </div>
    );
  }

  // Fallback / standard Bullet graph indicator
  return (
    <div className="space-y-3 p-2">
      <div className="flex justify-between items-baseline text-xs font-semibold">
        <span className="text-slate-400">{label || 'Valor actual'}</span>
        <span className="font-mono text-sm font-black text-slate-800">{value}%</span>
      </div>

      <div className="relative w-full h-5 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/50">
        {/* Warning threshold divider */}
        <div className="absolute top-0 bottom-0 border-r border-dashed border-slate-300 z-10" style={{ left: `${thresholds.warning}%` }} title="Umbral Precaución" />
        {/* Success threshold divider */}
        <div className="absolute top-0 bottom-0 border-r border-dashed border-slate-400 z-10" style={{ left: `${thresholds.success}%` }} title="Umbral Saludable" />
        
        {/* Filled indicator bar */}
        <div 
          className="h-full rounded-l-lg transition-all duration-1000 ease-out"
          style={{ 
            width: `${pct}%`,
            backgroundColor: statusColor
          }}
        />
      </div>

      <div className="flex justify-between text-[9px] text-slate-400 font-bold">
        <span>{min}</span>
        <span>Warn ({thresholds.warning})</span>
        <span>Suf ({thresholds.success})</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
