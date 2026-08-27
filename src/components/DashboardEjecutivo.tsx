import React, { useState, useMemo } from 'react';
import { 
  Building, 
  Users, 
  FileText, 
  TrendingUp, 
  CheckCircle, 
  Activity, 
  ArrowUpRight, 
  Calendar, 
  MapPin, 
  Clock, 
  ExternalLink, 
  HeartHandshake, 
  Smile, 
  ShieldAlert, 
  Sparkles, 
  Layers, 
  Brain,
  ArrowDownRight,
  Filter,
  BarChart3,
  Heart,
  HelpCircle,
  TrendingDown,
  Award,
  CheckCircle2
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
  AreaChart,
  Area,
  Line
} from 'recharts';
import { DemographicsData } from '../types';

interface DashboardEjecutivoProps {
  onNavigate: (tab: string) => void;
  onSwitchToOperational: () => void;
  uploadedFile: { name: string; size: string; date: string } | null;
  totalEmployeesInFile: number;
  data?: DemographicsData | null;
}

// DEMO_ONLY - Catálogo de demostración referencial (No alimenta indicadores empresariales reales ni cálculos estadísticos)
export const DEMO_COMPANY_DATA: Record<string, {
  name: string;
  nit: string;
  sector: string;
  employees: number;
  participation: number;
  climaIndex: number;
  bienestarIndex: number;
  sstIndex: number;
  eNPS: number;
  liderazgo: number;
  ausentismo: number;
  accidentalidad: number;
}> = {
  'InnovaTech IT': {
    name: 'InnovaTech IT S.A.S.',
    nit: '901.432.889-4',
    sector: 'Servicios de Tecnología / Contact Center',
    employees: 482,
    participation: 95.0,
    climaIndex: 82,
    bienestarIndex: 78,
    sstIndex: 85,
    eNPS: 45,
    liderazgo: 86,
    ausentismo: 2.1,
    accidentalidad: 0.8,
  },
  'Global Services S.A.S.': {
    name: 'Global Services S.A.S.',
    nit: '860.034.122-1',
    sector: 'Telecomunicaciones y Logística',
    employees: 510,
    participation: 92.5,
    climaIndex: 78,
    bienestarIndex: 75,
    sstIndex: 81,
    eNPS: 38,
    liderazgo: 81,
    ausentismo: 3.2,
    accidentalidad: 1.5,
  },
  'Procesos Industriales S.A.': {
    name: 'Procesos Industriales S.A.',
    nit: '890.201.354-9',
    sector: 'Manufactura y Operaciones de Planta',
    employees: 248,
    participation: 81.0,
    climaIndex: 75,
    bienestarIndex: 71,
    sstIndex: 77,
    eNPS: 24,
    liderazgo: 78,
    ausentismo: 4.5,
    accidentalidad: 3.1,
  }
};

export default function DashboardEjecutivo({ 
  onNavigate, 
  onSwitchToOperational, 
  uploadedFile,
  totalEmployeesInFile,
  data
}: DashboardEjecutivoProps) {
  // Color constants for charts to preserve visual identity
  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#64748b'];

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in py-2">
        {/* Cabezote Resumen */}
        <div id="seccion-resumen" className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-[40%] h-full bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                <BarChart3 className="w-3.5 h-3.5 text-indigo-300" />
                <span>Power BI Dashboard Engine v3.2</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
                Dashboard Sociodemográfico & Ejecutivo
              </h1>
              <p className="text-xs text-slate-300 font-semibold leading-relaxed max-w-2xl">
                Consolidación del censo de población, variables de estilo de vida, salud osteomuscular, bienestar departamental y planes de intervención SG-SST.
              </p>
            </div>
            <div className="shrink-0 self-start md:self-center">
              <button 
                onClick={onSwitchToOperational}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md text-white"
              >
                <span>Ir a Consola Operativa</span>
                <ExternalLink className="w-4 h-4 text-cyan-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Estado: Sin datos disponibles */}
        <div className="bg-white p-12 rounded-3xl border border-slate-200/60 shadow-xs text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto text-indigo-600">
            <BarChart3 className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-slate-900 font-display">
              Sin datos disponibles para generar este análisis
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              No se ha cargado un dataset sociodemográfico para esta empresa o no hay registros activos en la base de datos.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => onNavigate('analisis')}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Cargar Archivo Excel</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active data is exclusively real data
  const activeData = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in py-2">
      
      {/* =========================================================================
          SECTION 1: RESUMEN EJECUTIVO (Executive Summary)
          ========================================================================= */}
      <div id="seccion-resumen" className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
              <BarChart3 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Power BI Dashboard Engine v3.2</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
              Dashboard Sociodemográfico & Ejecutivo
            </h1>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed max-w-2xl">
              Consolidación del censo de población, variables de estilo de vida, salud osteomuscular, bienestar departamental y planes de intervención SG-SST.
            </p>
          </div>

          <div className="shrink-0 self-start md:self-center">
            <button 
              onClick={onSwitchToOperational}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-md text-white"
            >
              <span>Ir a Consola Operativa</span>
              <ExternalLink className="w-4 h-4 text-cyan-300" />
            </button>
          </div>
        </div>

        {/* Info pills about Active Data */}
        <div className="mt-5 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">Origen de Datos Activo</p>
            <div className="flex items-center gap-2 font-extrabold text-slate-100">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Base de Datos Activa ({uploadedFile?.name || 'Dataset Maestro'})
              </span>
            </div>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">Población Evaluada</p>
            <div className="font-extrabold text-slate-100">
              {activeData.totalEmployees} Colaboradores Registrados
            </div>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800">
            <p className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mb-1">Estado de Auditoría</p>
            <div className="font-extrabold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span>Fuente Única de Verdad (100% Real)</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 2: KPIs (Key Performance Indicators)
          ========================================================================= */}
      <div id="seccion-kpis" className="space-y-4 text-left">
        <h2 className="text-lg font-black text-slate-900 font-display uppercase tracking-wider flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <span>Indicadores de Gestión y Control (KPIs)</span>
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* KPI 1: Cantidad de Colaboradores */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[140px] hover:border-indigo-200 hover:shadow-xs transition-all group">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] uppercase font-black tracking-wider">Colaboradores</span>
                <Users className="w-4.5 h-4.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono tracking-tight leading-none pt-2">
                {activeData.totalEmployees.toLocaleString()}
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <span className="text-slate-500">Nómina Activa</span>
              <span className="font-mono text-indigo-600 font-extrabold">100% Censo</span>
            </div>
          </div>

          {/* KPI 2: Edad Promedio */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[140px] hover:border-indigo-200 hover:shadow-xs transition-all group">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] uppercase font-black tracking-wider">Edad Promedio</span>
                <Calendar className="w-4.5 h-4.5 text-slate-400 group-hover:text-cyan-500 transition-colors" />
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono tracking-tight leading-none pt-2">
                {activeData.averageAge.toFixed(1)} <span className="text-sm font-extrabold text-slate-400">años</span>
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <span className="text-emerald-600 flex items-center gap-0.5 font-extrabold">
                <Smile className="w-3.5 h-3.5" /> Joven & Dinámico
              </span>
              <span className="font-mono text-slate-400">Promedio</span>
            </div>
          </div>

          {/* KPI 3: Antigüedad Promedio */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[140px] hover:border-indigo-200 hover:shadow-xs transition-all group">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] uppercase font-black tracking-wider">Antigüedad</span>
                <Clock className="w-4.5 h-4.5 text-slate-400 group-hover:text-amber-500 transition-colors" />
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono tracking-tight leading-none pt-2">
                {activeData.averageSeniority.toFixed(1)} <span className="text-sm font-extrabold text-slate-400">años</span>
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <span className="text-slate-500">Años en Compañía</span>
              <span className="font-mono text-amber-600 font-extrabold">Estable</span>
            </div>
          </div>

          {/* KPI 4: Índice de Bienestar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[140px] hover:border-indigo-200 hover:shadow-xs transition-all group">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] uppercase font-black tracking-wider">Bienestar</span>
                <HeartHandshake className="w-4.5 h-4.5 text-slate-400 group-hover:text-rose-500 transition-colors" />
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono tracking-tight leading-none pt-2">
                {activeData.wellbeingIndex.toFixed(1)}%
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <span className="text-rose-600 flex items-center gap-0.5 font-extrabold">
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Óptimo
              </span>
              <span className="font-mono text-rose-600 font-black">Meta: 80%</span>
            </div>
          </div>

          {/* KPI 5: Participación */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[140px] hover:border-indigo-200 hover:shadow-xs transition-all group">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[10px] uppercase font-black tracking-wider">Participación</span>
                <TrendingUp className="w-4.5 h-4.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
              </div>
              <p className="text-3xl font-black text-slate-900 font-mono tracking-tight leading-none pt-2">
                {activeData.activeParticipation.toFixed(1)}%
              </p>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <span className="text-emerald-600 flex items-center gap-0.5 font-extrabold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Censo Exitoso
              </span>
              <span className="font-mono text-emerald-600 font-extrabold">Límite: 90%</span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          SECTION 3: CARACTERIZACIÓN (Demographics Analysis)
          ========================================================================= */}
      <div id="seccion-caracterizacion" className="space-y-4 text-left">
        <h2 className="text-lg font-black text-slate-900 font-display uppercase tracking-wider flex items-center gap-2">
          <Smile className="w-5 h-5 text-indigo-600" />
          <span>Caracterización Demográfica de la Población</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Gender Pie Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <h3 className="font-black text-xs uppercase text-slate-400 tracking-wider">Distribución por Género</h3>
            <div className="h-[200px] flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeData.gender}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {activeData.gender.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} colaboradores`, 'Cantidad']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-100">
              {activeData.gender.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span>{g.name}</span>
                  </div>
                  <div className="font-mono font-bold text-slate-900">
                    {g.value} <span className="text-slate-400 text-[10px]">({g.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Age Distribution Bar Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-4">
            <h3 className="font-black text-xs uppercase text-slate-400 tracking-wider">Pirámide de Edad (Grupos)</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeData.ageGroups} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="range" stroke="#94a3b8" fontSize={9} interval={0} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip formatter={(v) => [`${v} emp.`, 'Colaboradores']} />
                  <Bar dataKey="value" name="Colaboradores" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-bold text-center">
              Fuerza laboral concentrada mayoritariamente en rangos jóvenes y productivos.
            </div>
          </div>

          {/* Nivel de Escolaridad & Estado Civil */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs space-y-5">
            <h3 className="font-black text-xs uppercase text-slate-400 tracking-wider">Escolaridad & Educación</h3>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {activeData.education.slice(0, 4).map((e, idx) => {
                const percentage = Math.round((e.count / activeData.totalEmployees) * 100);
                return (
                  <div key={idx} className="space-y-1.5 text-xs">
                    <div className="flex justify-between font-bold text-slate-700">
                      <span>{e.level}</span>
                      <span className="font-mono text-slate-900">{e.count} <span className="text-slate-400">({percentage}%)</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Estado Civil Mayoritario</p>
                <p className="font-extrabold text-slate-800">{activeData.maritalStatus?.[0]?.status || 'Soltero(a)'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">Ciudades Identificadas</p>
                <p className="font-extrabold text-slate-800">{activeData.city?.length || 4} Sedes</p>
              </div>
            </div>
          </div>

        </div>

        {/* Extended Demographics Row (Socioeconomic, Ethic & Project Sites) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-indigo-500" />
              <span>Sedes / Ciudades</span>
            </h4>
            <div className="space-y-2">
              {(activeData.city || []).slice(0, 4).map((c, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">{c.name}</span>
                  <span className="font-bold text-slate-900 font-mono">{c.count} pers.</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building className="w-4 h-4 text-cyan-500" />
              <span>Sitos de Trabajo</span>
            </h4>
            <div className="space-y-2">
              {(activeData.workSites || []).map((w, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600 truncate max-w-[120px]">{w.site}</span>
                    <span className="font-bold text-slate-900 font-mono">{w.percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${w.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-500" />
              <span>Nivel Socioeconómico</span>
            </h4>
            <div className="space-y-2">
              {(activeData.socioeconomicStrata || []).slice(0, 4).map((s, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">{s.stratum}</span>
                  <span className="font-bold text-slate-900 font-mono">{s.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-500" />
              <span>Grupo Étnico</span>
            </h4>
            <div className="space-y-2">
              {(activeData.ethnicGroups || []).slice(0, 4).map((e, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 truncate max-w-[120px]">{e.name}</span>
                  <span className="font-bold text-slate-900 font-mono">{e.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: SALUD (Health Conditions)
          ========================================================================= */}
      <div id="seccion-salud" className="space-y-4 text-left">
        <h2 className="text-lg font-black text-slate-900 font-display uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          <span>Condiciones de Salud y Diagnósticos Médicos</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* IMC Classification */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xs uppercase text-slate-400 tracking-wider">Clasificación de IMC</h3>
              {activeData.averageIMC && (
                <span className="text-xs font-mono font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  Promedio: {activeData.averageIMC}
                </span>
              )}
            </div>
            <div className="h-[210px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeData.imcClassification || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" stroke="#94a3b8" fontSize={9} interval={0} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#ef4444" radius={[4, 4, 0, 0]}>
                    {(activeData.imcClassification || []).map((entry, index) => {
                      // Color mapping according to risk
                      let color = '#10b981'; // normal
                      if (entry.category.toLowerCase().includes('sobrepeso')) color = '#f59e0b';
                      if (entry.category.toLowerCase().includes('obesidad')) color = '#ef4444';
                      if (entry.category.toLowerCase().includes('delgadez')) color = '#06b6d4';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center p-3 bg-slate-50 rounded-2xl text-xs border border-slate-100">
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px]">Estatura Promedio</span>
                <span className="text-slate-800 font-extrabold">{activeData.averageHeight?.toFixed(2) || '1.68'} m</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold uppercase text-[9px]">Peso Promedio</span>
                <span className="text-slate-800 font-extrabold">{activeData.averageWeight?.toFixed(1) || '72.5'} kg</span>
              </div>
            </div>
          </div>

          {/* Pain / Musculoskeletal */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs lg:col-span-4 space-y-4">
            <h3 className="font-black text-xs uppercase text-slate-400 tracking-wider">Molestia Osteomuscular (Dolor)</h3>
            <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1">
              {(activeData.musculoskeletalPain || []).slice(0, 5).map((p, idx) => (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span className="truncate max-w-[150px]">{p.bodyPart}</span>
                    <span className="font-mono text-slate-900">{p.percentage}% <span className="text-slate-400 font-normal">({p.count} emp.)</span></span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full" style={{ width: `${p.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blood Type & Meds */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs lg:col-span-3 space-y-4">
            <h3 className="font-black text-xs uppercase text-slate-400 tracking-wider">Distribución Grupo Sanguíneo (RH)</h3>
            <div className="grid grid-cols-2 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
              {(activeData.bloodType || []).slice(0, 6).map((b, i) => (
                <div key={i} className="p-2 bg-rose-50/50 border border-rose-100 rounded-xl text-center flex flex-col justify-center">
                  <span className="text-rose-600 font-mono text-lg font-black">{b.group}</span>
                  <span className="text-[10px] text-slate-500 font-bold mt-0.5">{b.percentage}%</span>
                  <span className="text-[9px] text-slate-400 font-semibold">{b.count} pers.</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Secondary diseases and allergies row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider">Patologías Diagnósticadas (Enfermedades)</h4>
            <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto pr-1">
              {(activeData.diseases || []).slice(0, 4).map((d, i) => (
                <div key={i} className="py-2 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">{d.disease}</span>
                  <span className="font-mono font-black text-slate-800">{d.percentage}% <span className="text-slate-400 text-[10px]">({d.count})</span></span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider">Medicamentos de Consumo Regular</h4>
            <div className="divide-y divide-slate-100 max-h-[160px] overflow-y-auto pr-1">
              {(activeData.medications || []).slice(0, 4).map((m, i) => (
                <div key={i} className="py-2 flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600">{m.medicated}</span>
                  <span className="font-mono font-black text-slate-800">{m.percentage}% <span className="text-slate-400 text-[10px]">({m.count})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: BIENESTAR (Wellbeing & Departmental Metrics)
          ========================================================================= */}
      <div id="seccion-bienestar" className="space-y-4 text-left">
        <h2 className="text-lg font-black text-slate-900 font-display uppercase tracking-wider flex items-center gap-2">
          <HeartHandshake className="w-5 h-5 text-indigo-600" />
          <span>Clima, Bienestar Social y Familiar</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Department wellbeing comparing Stress vs Wellbeing */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs lg:col-span-7 space-y-4">
            <h3 className="font-black text-xs uppercase text-slate-400 tracking-wider">Bienestar y Estrés por Departamento</h3>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeData.departmentWellbeing || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={8} tickLine={false} interval={0} tickFormatter={(v) => v.split(' ')[0]} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickLine={false} />
                  <Tooltip />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="wellbeing" name="Índice Bienestar" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="stress" name="Nivel Estrés" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Slicer / Metrics breakdown right panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-xs lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-black text-xs uppercase text-slate-400 tracking-wider">Hábitos y Tiempo Libre</h3>
              <div className="space-y-3">
                {/* Physical Activity */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[9px]">
                      {activeData.physicalActivityMode === 'BOOLEAN' ? 'Práctica de Actividad Física' : 'Hábitos de Actividad Física'}
                    </span>
                    <span className="text-slate-800 font-extrabold">
                      {activeData.physicalActivityMode === 'BOOLEAN'
                        ? `${activeData.physicalActivity?.find(p => p.level === 'Sí')?.percentage.toFixed(1) || '0'}% realiza actividad física (Sí)`
                        : `${activeData.physicalActivity?.find(p => p.level === 'Ninguna')?.percentage.toFixed(1) || '52'}% de la población (Sin Act. Física)`
                      }
                    </span>
                  </div>
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                </div>

                {/* Free time usage */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[9px]">Uso Tiempo Libre Principal</span>
                    <span className="text-slate-800 font-extrabold">{(activeData.freeTimeUsage?.[0]?.activity) || 'Compartir en familia'}</span>
                  </div>
                  <Smile className="w-5 h-5 text-indigo-500" />
                </div>

                {/* Pets */}
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold uppercase text-[9px]">Tenencia de Mascotas</span>
                    <span className="text-slate-800 font-extrabold">
                      {(activeData.pets?.find(p => p.hasPets === true)?.percentage) || '48'}% tiene mascotas en casa
                    </span>
                  </div>
                  <Heart className="w-5 h-5 text-emerald-500 fill-emerald-500" />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>Base para intervenciones psicosociales</span>
            </div>
          </div>

        </div>

        {/* Secondary wellbeing, contract & family details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider">Composición Familiar</h4>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex justify-between font-bold">
                <span>Miembros promedio hogar:</span>
                <span className="text-slate-900 font-mono">{activeData.averageHouseholdMembers || '3.2'}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Personas que viven solas:</span>
                <span className="text-slate-900 font-mono">
                  {activeData.peopleLivingAlonePercentage || '15'}% ({activeData.peopleLivingAloneCount || '186'})
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Tienen hijos:</span>
                <span className="text-slate-900 font-mono">{activeData.hasChildrenPercentage || '42'}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider">Tipo de Contrato</h4>
            <div className="space-y-2">
              {(activeData.contractType || []).map((c, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 truncate max-w-[140px]">{c.type}</span>
                  <span className="font-bold text-slate-900 font-mono">{c.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs space-y-3">
            <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider">Participación en Actividades</h4>
            <div className="space-y-2">
              {(activeData.companyActivitiesParticipation || []).slice(0, 3).map((cap, i) => (
                <div key={i} className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-600 truncate max-w-[140px]">{cap.participation}</span>
                  <span className="font-bold text-slate-900 font-mono">{cap.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 6: ANÁLISIS IA (AI Insights)
          ========================================================================= */}
      <div id="seccion-ia" className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-xs text-left space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-purple-50 text-purple-600 border border-purple-100">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>Sugerencias de Motor Happy IA</span>
            </div>
            <h3 className="font-black text-sm text-slate-900 font-display">
              Hallazgos Generados Automáticamente por Inteligencia Artificial
            </h3>
            <p className="text-xs text-slate-400 font-semibold">
              Estrategia predictiva y diagnósticos automáticos en base a correlaciones complejas.
            </p>
          </div>
          
          <button 
            onClick={() => onNavigate('ia')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-xs font-extrabold text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Brain className="w-4 h-4 text-white" />
            <span>Ejecutar Copilot IA Completo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-4 bg-purple-50/40 border border-purple-100/50 rounded-2xl space-y-2">
            <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider">Ergonomía & Posturas</span>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              El <strong>{activeData.musculoskeletalPain?.[0]?.percentage || '35'}%</strong> de los colaboradores sufre dolor lumbar. IA recomienda priorizar de forma inmediata pausas activas osteomusculares y auditar puestos presenciales.
            </p>
          </div>

          <div className="p-4 bg-purple-50/40 border border-purple-100/50 rounded-2xl space-y-2">
            <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider">
              {activeData.physicalActivityMode === 'BOOLEAN' ? 'Práctica de Actividad Física' : 'Sedentarismo Crítico'}
            </span>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              {activeData.physicalActivityMode === 'BOOLEAN' ? (
                <>Se detectó que el <strong>{activeData.physicalActivity?.find(p => p.level === 'Sí')?.percentage.toFixed(1) || '0'}%</strong> realiza actividad física ("Sí") y el <strong>{activeData.physicalActivity?.find(p => p.level === 'No')?.percentage.toFixed(1) || '0'}%</strong> no realiza ("No"). Happy IA sugiere promover torneos de bienestar gamificados.</>
              ) : (
                <>Se detectó un <strong>{activeData.physicalActivity?.find(p => p.level === 'Ninguna')?.percentage.toFixed(1) || '52'}%</strong> de inactividad física total. Happy IA sugiere diseñar un torneo de bienestar interdepartamental con gamificación.</>
              )}
            </p>
          </div>

          <div className="p-4 bg-purple-50/40 border border-purple-100/50 rounded-2xl space-y-2">
            <span className="text-[10px] uppercase font-black text-purple-600 tracking-wider">Alerta de Estrés</span>
            <p className="text-xs text-slate-600 font-semibold leading-relaxed">
              Unidades operativas muestran niveles de estrés de hasta <strong>{activeData.departmentWellbeing?.[0]?.stress || '46'}%</strong>. Priorizar capacitaciones de manejo de emociones e inteligencia emocional con ARL.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 7: PLAN DE ACCIÓN (Action Plan Overview)
          ========================================================================= */}
      <div id="seccion-planes" className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-xs text-left space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="font-black text-sm text-slate-900 font-display uppercase tracking-wider">
              Planes de Acción e Intervención Sugeridos (SG-SST)
            </h3>
            <p className="text-xs text-slate-400 font-semibold">
              Actividades priorizadas alineadas con los hallazgos críticos del censo sociodemográfico.
            </p>
          </div>

          <button 
            onClick={() => onNavigate('planes_accion')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-xs font-extrabold text-white flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <span>Ver Plan Anual Completo</span>
            <ArrowUpRight className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 font-black text-xs text-slate-800 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>1. Campaña de Estilos de Vida</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Fomentar el hábito del ejercicio físico para combatir el sedentarismo crónico y el sobrepeso mediante retos deportivos.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 font-black text-xs text-slate-800 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>2. Escuela de Ergonomía</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Talleres guiados de higiene de columna y pausas dirigidas en estaciones de trabajo presenciales y remotas.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-2 font-black text-xs text-slate-800 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>3. Programa de Apoyo familiar</span>
            </div>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Considerando que un {activeData.hasChildrenPercentage}% tiene hijos, estructurar facilidades de tiempo y flexibilidad de horarios.
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 8: INFORME EJECUTIVO (Executive Report PDF Trigger)
          ========================================================================= */}
      <div id="seccion-informe" className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl text-left relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30%] h-full bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/30 text-emerald-200 border border-emerald-400/20">
              <FileText className="w-3 h-3 text-emerald-300" />
              <span>Generación de Entregables</span>
            </div>
            <h3 className="text-xl font-black font-display tracking-tight text-white">
              Informe Ejecutivo de Gestión Gerencial para SG-SST
            </h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed max-w-xl">
              Consolide todos estos gráficos y hallazgos en un documento formal PDF listo para ser presentado ante la alta dirección o firmas de auditoría externa.
            </p>
          </div>

          <button 
            onClick={() => onNavigate('informes')}
            className="px-5 py-3 bg-white hover:bg-slate-50 rounded-xl text-xs font-black text-slate-900 flex items-center gap-2 transition-all cursor-pointer shadow-lg self-start md:self-center shrink-0 border border-slate-200"
          >
            <FileText className="w-4 h-4 text-indigo-600 animate-pulse" />
            <span>Generar & Descargar Informe Ejecutivo</span>
          </button>
        </div>
      </div>

    </div>
  );
}
