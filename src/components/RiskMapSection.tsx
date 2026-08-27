import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Shield, 
  AlertTriangle, 
  Search, 
  Filter, 
  Users, 
  Sparkles,
  ClipboardList, 
  CheckCircle2, 
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  Flame
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { DemographicsData } from '../types';
import { analyzeRiskMap, EmployeeRisk } from '../utils/riskPredictor';

interface RiskMapSectionProps {
  data: DemographicsData;
}

export default function RiskMapSection({ data }: RiskMapSectionProps) {
  const [filterLevel, setFilterLevel] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(null);

  // Calculate risk statistics
  const riskSummary = useMemo(() => {
    return analyzeRiskMap(data);
  }, [data]);

  const {
    total,
    bajoCount,
    bajoPercentage,
    medioCount,
    medioPercentage,
    altoCount,
    altoPercentage,
    criticoCount,
    criticoPercentage,
    employees,
    executiveSummary
  } = riskSummary;

  // Chart data
  const chartData = [
    { name: 'Riesgo Bajo', value: bajoCount, percentage: bajoPercentage, color: '#10b981' }, // emerald-500
    { name: 'Riesgo Medio', value: medioCount, percentage: medioPercentage, color: '#f59e0b' }, // amber-500
    { name: 'Riesgo Alto', value: altoCount, percentage: altoPercentage, color: '#f97316' }, // orange-500
    { name: 'Riesgo Crítico', value: criticoCount, percentage: criticoPercentage, color: '#ef4444' } // red-500
  ].filter(item => item.value > 0);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      // Level filter
      if (filterLevel !== 'todos') {
        if (filterLevel === 'bajo' && emp.level !== 'Bajo') return false;
        if (filterLevel === 'medio' && emp.level !== 'Medio') return false;
        if (filterLevel === 'alto' && emp.level !== 'Alto') return false;
        if (filterLevel === 'critico' && emp.level !== 'Crítico') return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          emp.cargo.toLowerCase().includes(query) ||
          emp.area.toLowerCase().includes(query) ||
          emp.ciudad.toLowerCase().includes(query) ||
          emp.tipoContrato.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [employees, filterLevel, searchQuery]);

  // Toggle expand employee details
  const toggleExpandEmployee = (id: string) => {
    setExpandedEmployeeId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* 1. Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-[30%] h-[100%] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/20">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Motor Predictivo SG-SST</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight leading-tight">
            Mapa Inteligente de Riesgos Sociodemográficos
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Algoritmo predictivo que evalúa 11 variables críticas del personal (edad, antigüedad, contrato, cargo, área y más) para determinar el nivel de vulnerabilidad laboral.
          </p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-2xl px-5 py-4 text-center shrink-0 self-start md:self-center">
          <div className="text-2xl font-black text-indigo-400 font-mono">{total}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Colaboradores Evaluados</div>
        </div>
      </div>

      {/* 2. Color-Coded Risk Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Riesgo Bajo */}
        <div className="bg-white border-l-4 border-emerald-500 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Riesgo Bajo</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{bajoCount}</span>
              <span className="text-xs font-semibold text-emerald-600">({bajoPercentage}%)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Población estable y adaptada</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Riesgo Medio */}
        <div className="bg-white border-l-4 border-amber-500 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Riesgo Medio</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{medioCount}</span>
              <span className="text-xs font-semibold text-amber-600">({medioPercentage}%)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Alertas leves / curva de adaptación</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        {/* Riesgo Alto */}
        <div className="bg-white border-l-4 border-orange-500 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Riesgo Alto</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{altoCount}</span>
              <span className="text-xs font-semibold text-orange-600">({altoPercentage}%)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Requieren intervención SST focalizada</p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Riesgo Crítico */}
        <div className="bg-white border-l-4 border-red-500 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Riesgo Crítico</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 font-mono">{criticoCount}</span>
              <span className="text-xs font-semibold text-red-600">({criticoPercentage}%)</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Vulnerabilidad extrema acumulada</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 3. Main Dashboard: Donut Chart & Executive Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Donut Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm font-display mb-1 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-indigo-500" />
              <span>Distribución General de Riesgo</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold mb-6">Colaboradores consolidados por nivel de riesgo.</p>
          </div>

          <div className="h-64 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} colaboradores (${props.payload.percentage}%)`, name]}
                  contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'Inter' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Inner text overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">{total}</span>
              <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">Total S.</span>
            </div>
          </div>

          {/* Simple legends */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50 mt-4">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <div>
                  <div className="text-[11px] font-extrabold text-slate-800">{item.name}</div>
                  <div className="text-[10px] font-semibold text-slate-500 font-mono">{item.value} emp. ({item.percentage}%)</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Executive Summary */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm font-display mb-1 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Diagnóstico Ejecutivo Automatizado</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">Análisis en base a la matriz de reglas y variables demográficas.</p>
            </div>

            {/* Findings List */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
                <span>🔍 Hallazgos Principales Detectados</span>
              </h4>
              <div className="space-y-2">
                {executiveSummary.findings.map((finding, index) => (
                  <div key={index} className="flex items-start gap-2.5 bg-slate-50 border border-slate-100 p-3 rounded-xl">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">{finding}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚡ Plan de Acción & Recomendaciones SG-SST</span>
              </h4>
              <div className="space-y-2">
                {executiveSummary.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2.5 bg-emerald-50/40 border border-emerald-100/50 p-3 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-emerald-800 font-medium leading-relaxed">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400 font-semibold">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Actualizado dinámicamente según archivo cargado.</span>
          </div>
        </div>

      </div>

      {/* 4. Interactive Detail: Employees List with Filter & Search */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xs overflow-hidden">
        
        {/* Filter and Search Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm font-display mb-1 flex items-center gap-2">
              <Users className="w-4.5 h-4.5 text-indigo-500" />
              <span>Buscador y Detalle de Colaboradores</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-semibold">Explora cada colaborador, su puntaje de riesgo y los factores desencadenantes.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por cargo, área, ciudad..."
                className="w-full sm:w-60 pl-8.5 pr-4 py-2 bg-white border border-slate-200 text-xs rounded-xl focus:border-indigo-500 focus:outline-hidden font-medium shadow-2xs"
              />
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-2 rounded-xl shadow-2xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="todos">Todos los niveles</option>
                <option value="bajo">🟢 Riesgo Bajo</option>
                <option value="medio">🟡 Riesgo Medio</option>
                <option value="alto">🟠 Riesgo Alto</option>
                <option value="critico">🔴 Riesgo Crítico</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table/List Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100">
                <th className="py-3 px-6">ID</th>
                <th className="py-3 px-6">Cargo / Área</th>
                <th className="py-3 px-6">Ciudad</th>
                <th className="py-3 px-6">Contrato</th>
                <th className="py-3 px-6">Edad / Antigüedad</th>
                <th className="py-3 px-6 text-center">Puntaje</th>
                <th className="py-3 px-6 text-center">Riesgo</th>
                <th className="py-3 px-6 text-right">Factores</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    No se encontraron colaboradores que coincidan con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredEmployees.slice(0, 15).map((emp) => {
                  const isExpanded = expandedEmployeeId === emp.id;
                  
                  // Color helpers
                  let badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-100";
                  if (emp.level === 'Medio') badgeColor = "bg-amber-50 text-amber-700 border-amber-100";
                  if (emp.level === 'Alto') badgeColor = "bg-orange-50 text-orange-700 border-orange-100";
                  if (emp.level === 'Crítico') badgeColor = "bg-red-50 text-red-700 border-red-100";

                  return (
                    <React.Fragment key={emp.id}>
                      <tr 
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${isExpanded ? 'bg-indigo-50/10' : ''}`}
                        onClick={() => toggleExpandEmployee(emp.id)}
                      >
                        <td className="py-3.5 px-6 font-mono text-slate-400 font-semibold">#{emp.id.replace('emp-', '')}</td>
                        <td className="py-3.5 px-6">
                          <div className="font-extrabold text-slate-800">{emp.cargo}</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{emp.area}</div>
                        </td>
                        <td className="py-3.5 px-6 text-slate-600">{emp.ciudad}</td>
                        <td className="py-3.5 px-6 text-slate-600">{emp.tipoContrato}</td>
                        <td className="py-3.5 px-6 text-slate-600">
                          <div>{emp.edad} años</div>
                          <div className="text-[10px] text-slate-400 font-semibold">{emp.antiguedad} años ant.</div>
                        </td>
                        <td className="py-3.5 px-6 text-center font-mono font-black text-slate-700">{emp.score} pts</td>
                        <td className="py-3.5 px-6 text-center">
                          <span className={`inline-flex px-2.5 py-1 text-[10px] font-black uppercase tracking-wider border rounded-full ${badgeColor}`}>
                            {emp.level}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button className="text-slate-400 hover:text-indigo-600 p-1 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expandable row for factors */}
                      <AnimatePresence>
                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="p-0 bg-slate-50/60">
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="px-8 py-5 border-t border-b border-indigo-100/10 space-y-4 text-xs"
                              >
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Factors list */}
                                  <div className="space-y-2.5">
                                    <div className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                                      Factores de Riesgo Acumulados
                                    </div>
                                    <div className="space-y-1.5">
                                      {emp.factors.length === 0 ? (
                                        <p className="text-slate-400 italic">No se identificaron factores de riesgo de relevancia.</p>
                                      ) : (
                                        emp.factors.map((fact, fIdx) => (
                                          <div key={fIdx} className="flex items-center gap-2 text-slate-700 font-semibold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                                            <span>{fact}</span>
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  </div>

                                  {/* Other fields view */}
                                  <div className="space-y-2.5">
                                    <div className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-wider">
                                      Información Sociodemográfica Ampliada
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-semibold text-slate-600">
                                      <div>Estado Civil: <span className="text-slate-900 font-bold">{emp.estadoCivil}</span></div>
                                      <div>Nivel Educativo: <span className="text-slate-900 font-bold">{emp.nivelEducativo}</span></div>
                                      <div>¿Tiene Hijos?: <span className="text-slate-900 font-bold">{emp.hijos}</span></div>
                                      <div>¿Discapacidad?: <span className="text-slate-900 font-bold">{emp.discapacidad}</span></div>
                                      <div>Jornada laboral: <span className="text-slate-900 font-bold">{emp.jornada}</span></div>
                                      <div>Puesto / Modalidad: <span className="text-slate-900 font-bold">Asignado</span></div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Show notice for top 15 */}
        {filteredEmployees.length > 15 && (
          <div className="p-4 bg-slate-50 text-center text-[11px] text-slate-400 font-semibold border-t border-slate-100">
            Mostrando los 15 colaboradores con mayor vulnerabilidad. Filtra para segmentar mejor la lista.
          </div>
        )}
      </div>

    </div>
  );
}
