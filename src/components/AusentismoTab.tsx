import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  Users, 
  ShieldAlert, 
  Calendar,
  DollarSign,
  Plus,
  Filter,
  Download,
  AlertCircle,
  Stethoscope,
  Heart
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { useEmpresa } from '../modules/configuracion/useEmpresa';

export default function AusentismoTab() {
  const { config } = useEmpresa();
  const companyName = config.nombreEmpresa || 'Mi Empresa';

  const [departmentFilter, setDepartmentFilter] = useState('Todos');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Absenteeism mock stats
  const metrics = useMemo(() => {
    let multiplier = 1.0;
    if (departmentFilter === 'Operaciones') multiplier = 1.25;
    if (departmentFilter === 'Tecnología') multiplier = 0.8;
    if (departmentFilter === 'Administración') multiplier = 0.55;

    return {
      totalDaysLost: Math.round(184 * multiplier),
      totalHoursLost: Math.round(1472 * multiplier),
      frequencyRate: parseFloat((2.1 * multiplier).toFixed(2)), // Tasa de frecuencia (I.F.)
      severityRate: parseFloat((0.85 * multiplier).toFixed(2)), // Tasa de severidad (I.S.)
      absenteeismCost: Math.round(23500000 * multiplier), // COP
      employeeCount: Math.round(12 * multiplier),
      reasonsDistribution: [
        { name: 'Incapacidad Médica (Enfermedad General)', value: Math.round(65 * multiplier), color: '#3b82f6' },
        { name: 'Accidente de Trabajo', value: Math.round(12 * multiplier), color: '#ef4444' },
        { name: 'Licencias / Calamidad Doméstica', value: Math.round(15 * multiplier), color: '#f59e0b' },
        { name: 'Permisos Personales sin Remuneración', value: Math.round(8 * multiplier), color: '#10b981' }
      ],
      monthlyTrend: [
        { month: 'Ene', horas: Math.round(120 * multiplier) },
        { month: 'Feb', horas: Math.round(110 * multiplier) },
        { month: 'Mar', horas: Math.round(150 * multiplier) },
        { month: 'Abr', horas: Math.round(135 * multiplier) },
        { month: 'May', horas: Math.round(160 * multiplier) },
        { month: 'Jun', horas: Math.round(140 * multiplier) }
      ],
      departamentBreakdown: [
        { name: 'Operaciones', dias: 94, tasa: 3.2, color: '#f43f5e' },
        { name: 'Tecnología', dias: 45, tasa: 1.8, color: '#3b82f6' },
        { name: 'Administración', dias: 25, tasa: 0.9, color: '#10b981' },
        { name: 'Ventas', dias: 20, tasa: 1.5, color: '#ec4899' }
      ]
    };
  }, [departmentFilter]);

  return (
    <div className="space-y-6 animate-fade-in text-left">
      
      {/* Slicers Panel */}
      <div className="bg-white border border-slate-200/60 p-4 rounded-3xl shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800">Filtros de Ausentismo</span>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {/* Dept Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black text-slate-400">Departamento:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="Todos">Todos</option>
              <option value="Operaciones">Operaciones</option>
              <option value="Tecnología">Tecnología</option>
              <option value="Administración">Administración</option>
            </select>
          </div>

          {/* Year Selector */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black text-slate-400">Año:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <button className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer" title="Exportar Reporte">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Days Lost */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-black tracking-wider">Días Perdidos</span>
            <Calendar className="w-4.5 h-4.5 text-rose-500" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-black text-slate-900 font-mono leading-none">{metrics.totalDaysLost}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5">{metrics.totalHoursLost} Horas Totales</p>
          </div>
        </div>

        {/* Cost */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-black tracking-wider">Costo Estimado</span>
            <DollarSign className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-black text-slate-900 font-mono leading-none">
              ${(metrics.absenteeismCost / 1000000).toFixed(1)}M
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5">COP (Productividad Perdida)</p>
          </div>
        </div>

        {/* Frequency Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-black tracking-wider">Índice Frecuencia (I.F.)</span>
            <Activity className="w-4.5 h-4.5 text-indigo-500" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-black text-slate-900 font-mono leading-none">{metrics.frequencyRate}%</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1.5">Dentro del estándar ARL</p>
          </div>
        </div>

        {/* Employees Absent */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col justify-between min-h-[120px]">
          <div className="flex justify-between items-start text-slate-400">
            <span className="text-[10px] uppercase font-black tracking-wider">Colaboradores Afectados</span>
            <Users className="w-4.5 h-4.5 text-cyan-500" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-black text-slate-900 font-mono leading-none">{metrics.employeeCount}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5">En el periodo seleccionado</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Trend Chart */}
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-2xs p-5 lg:col-span-7">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-extrabold text-sm text-slate-900">Histórico de Ausentismo Mensual</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total horas perdidas por mes</p>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Line type="monotone" dataKey="horas" name="Horas Perdidas" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reasons Pie Chart */}
        <div className="bg-white border border-slate-200/60 rounded-3xl shadow-2xs p-5 lg:col-span-5">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h3 className="font-extrabold text-sm text-slate-900">Distribución de Causas</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tipos de incapacidad y permisos</p>
          </div>
          <div className="h-[200px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.reasonsDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.reasonsDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <Stethoscope className="w-6 h-6 text-indigo-500 mx-auto" />
              <span className="text-[10px] uppercase font-black text-slate-400 block mt-0.5">SST Colombia</span>
            </div>
          </div>
          <div className="space-y-1.5 mt-2">
            {metrics.reasonsDistribution.map((entry, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate">{entry.name}</span>
                </div>
                <span className="font-mono text-slate-800">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Normative Reference card */}
      <div className="bg-slate-900 text-slate-200 rounded-3xl border border-slate-800 p-5 flex gap-4 items-start">
        <AlertCircle className="w-6 h-6 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-extrabold text-sm text-white">Lineamiento Normativo de Ausentismo (Decreto 1072)</h4>
          <p className="text-xs text-slate-300 font-medium leading-relaxed">
            El registro y análisis de ausentismo por causas médicas es una obligación obligatoria dentro del SG-SST en Colombia. Este módulo permite estructurar los indicadores de frecuencia, severidad y causas de ausentismo para la presentación ante la ARL y el Comité COPASST.
          </p>
        </div>
      </div>

    </div>
  );
}
