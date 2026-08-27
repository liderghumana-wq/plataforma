import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  LayoutDashboard, 
  Brain, 
  ListTodo, 
  Scale, 
  FileText, 
  ShieldAlert, 
  Users 
} from 'lucide-react';
import { PsicosocialData } from './psicosocial.types';
import { PsicosocialUpload } from './components/PsicosocialUpload';
import { PsicosocialDashboard } from './components/PsicosocialDashboard';
import { PsicosocialAnalysis } from './components/PsicosocialAnalysis';
import { PsicosocialIntervention } from './components/PsicosocialIntervention';
import { PsicosocialCompare } from './components/PsicosocialCompare';
import { PsicosocialReport } from './components/PsicosocialReport';

// A realistic default dataset representing an actual corporate psychosocial risk survey of 120 employees
const INITIAL_REALISTIC_DATA: PsicosocialData = {
  totalParticipants: 120,
  globalScore: 52, // Medio
  globalRiskLevel: 'Medio',
  batteryType: 'Resultados Consolidados',
  dimensions: [
    { dimensionId: 'liderazgo', name: 'Liderazgo y Relaciones en el Trabajo', category: 'Intralaboral', score: 58, riskLevel: 'Medio', description: 'Estilo de mando, retroalimentación del desempeño, comunicación y relaciones.' },
    { dimensionId: 'control_trabajo', name: 'Control sobre el Trabajo', category: 'Intralaboral', score: 48, riskLevel: 'Medio', description: 'Autonomía, margen de decisión, participación en el cambio y claridad.' },
    { dimensionId: 'demandas_trabajo', name: 'Demandas del Trabajo', category: 'Intralaboral', score: 72, riskLevel: 'Alto', description: 'Esfuerzo mental, carga cuantitativa, exigencias emocionales.' },
    { dimensionId: 'recompensas', name: 'Recompensas', category: 'Intralaboral', score: 38, riskLevel: 'Bajo', description: 'Reconocimiento, compensación del esfuerzo, estabilidad laboral.' },
    { dimensionId: 'apoyo_social', name: 'Apoyo Social en el Trabajo', category: 'Intralaboral', score: 42, riskLevel: 'Medio', description: 'Relaciones de apoyo de compañeros, ayuda del supervisor.' },
    { dimensionId: 'relaciones_laborales', name: 'Relaciones Laborales Interpersonales', category: 'Intralaboral', score: 50, riskLevel: 'Medio', description: 'Trato interpersonal en el equipo, resolución de conflictos.' },
    { dimensionId: 'claridad_rol', name: 'Claridad del Rol', category: 'Intralaboral', score: 32, riskLevel: 'Bajo', description: 'Definición precisa de funciones y expectativas claras.' },
    { dimensionId: 'capacitacion', name: 'Capacitación y Entrenamiento', category: 'Intralaboral', score: 35, riskLevel: 'Bajo', description: 'Inducción, planes de formación y pertinencia técnica.' },
    { dimensionId: 'reconocimiento', name: 'Reconocimiento del Desempeño', category: 'Intralaboral', score: 44, riskLevel: 'Medio', description: 'Valoración formal e informal de los logros por la empresa.' },
    { dimensionId: 'jornada', name: 'Jornada y Tiempos de Trabajo', category: 'Intralaboral', score: 68, riskLevel: 'Alto', description: 'Extensión del horario de trabajo y horas extra.' },
    { dimensionId: 'carga_mental', name: 'Carga Mental y Atención', category: 'Intralaboral', score: 75, riskLevel: 'Alto', description: 'Complejidad de las tareas, concentración sostenida.' },
    { dimensionId: 'carga_emocional', name: 'Carga Emocional y Trato', category: 'Intralaboral', score: 55, riskLevel: 'Medio', description: 'Trato directo con público difícil e impacto psicológico.' },
    { dimensionId: 'responsabilidades_familiares', name: 'Responsabilidades Familiares', category: 'Extralaboral', score: 46, riskLevel: 'Medio', description: 'Conciliación del tiempo laboral con el cuidado familiar.' },
    { dimensionId: 'tiempo_fuera_trabajo', name: 'Tiempo Fuera del Trabajo', category: 'Extralaboral', score: 52, riskLevel: 'Medio', description: 'Disponibilidad de tiempo libre para descanso y ocio.' },
    { dimensionId: 'vivienda_entorno', name: 'Características de la Vivienda y su Entorno', category: 'Extralaboral', score: 28, riskLevel: 'Bajo', description: 'Condiciones de habitabilidad y transporte.' },
    { dimensionId: 'caracteristicas_economicas', name: 'Características Económicas', category: 'Extralaboral', score: 40, riskLevel: 'Bajo', description: 'Suficiencia de ingresos familiares y carga económica.' }
  ],
  employees: [], // Will be lazily generated below if needed for comparator
  rankings: {
    areas: [
      { name: 'Operaciones', score: 64, riskLevel: 'Alto', count: 48 },
      { name: 'Tecnología', score: 54, riskLevel: 'Medio', count: 32 },
      { name: 'Ventas', score: 48, riskLevel: 'Medio', count: 24 },
      { name: 'Recursos Humanos', score: 36, riskLevel: 'Bajo', count: 16 }
    ],
    sedes: [
      { name: 'Bogotá', score: 55, riskLevel: 'Medio', count: 60 },
      { name: 'Medellín', score: 51, riskLevel: 'Medio', count: 35 },
      { name: 'Cali', score: 46, riskLevel: 'Medio', count: 25 }
    ],
    proyectos: [
      { name: 'Proyecto Core', score: 58, riskLevel: 'Medio', count: 50 },
      { name: 'Mantenimiento Express', score: 49, riskLevel: 'Medio', count: 40 },
      { name: 'Soporte Clientes', score: 44, riskLevel: 'Medio', count: 30 }
    ],
    cargos: [
      { name: 'Operario de Planta', score: 66, riskLevel: 'Alto', count: 30 },
      { name: 'Desarrollador', score: 53, riskLevel: 'Medio', count: 42 },
      { name: 'Analista de Selección', score: 45, riskLevel: 'Medio', count: 28 },
      { name: 'Gerente de Cuenta', score: 38, riskLevel: 'Bajo', count: 20 }
    ]
  },
  distribution: {
    muyBajo: 12,
    bajo: 24,
    medio: 48,
    alto: 26,
    muyAlto: 10
  },
  matrix: [
    { x: 'Muy Bajo', y: 'Muy Bajo', value: 5, level: 'Muy Bajo' },
    { x: 'Bajo', y: 'Bajo', value: 15, level: 'Bajo' },
    { x: 'Medio', y: 'Medio', value: 40, level: 'Medio' },
    { x: 'Alto', y: 'Alto', value: 25, level: 'Alto' },
    { x: 'Muy Alto', y: 'Muy Alto', value: 15, level: 'Muy Alto' }
  ]
};

// Generate dummy employees for initial state comparator so there is no blank screen
const dummyEmployees = [];
const cities = ['Bogotá', 'Medellín', 'Cali'];
const depts = ['Operaciones', 'Tecnología', 'Ventas', 'Recursos Humanos'];
const projs = ['Proyecto Core', 'Mantenimiento Express', 'Soporte Clientes'];
const roles = ['Operario de Planta', 'Desarrollador', 'Analista de Selección', 'Gerente de Cuenta'];

for (let i = 0; i < 120; i++) {
  const city = cities[i % cities.length];
  const dept = depts[i % depts.length];
  const proj = projs[i % projs.length];
  const role = roles[i % roles.length];
  const score = 20 + ((i * 13) % 75);

  const dimScores: Record<string, number> = {};
  INITIAL_REALISTIC_DATA.dimensions.forEach(d => {
    dimScores[d.dimensionId] = Math.max(0, Math.min(100, d.score + (-10 + ((i * d.name.length) % 21))));
  });

  dummyEmployees.push({
    id: `emp-dummy-${i}`,
    area: dept,
    sede: city,
    proyecto: proj,
    cargo: role,
    score,
    riskLevel: score < 20 ? 'Muy Bajo' : score < 40 ? 'Bajo' : score < 60 ? 'Medio' : score < 80 ? 'Alto' : 'Muy Alto',
    batteryType: 'Resultados Consolidados' as const,
    dimensionScores: dimScores
  });
}
INITIAL_REALISTIC_DATA.employees = dummyEmployees;

export const PsicosocialModule: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'cargar' | 'dashboard' | 'analisis' | 'intervencion' | 'comparador' | 'informe'>('dashboard');
  const [psicosocialData, setPsicosocialData] = useState<PsicosocialData>(INITIAL_REALISTIC_DATA);

  const handleDataLoaded = (data: PsicosocialData) => {
    setPsicosocialData(data);
    setActiveSubTab('dashboard'); // Auto-switch to dashboard on successful load
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard General', icon: LayoutDashboard },
    { id: 'cargar', label: 'Cargar Batería', icon: FileSpreadsheet },
    { id: 'analisis', label: 'Diagnóstico IA', icon: Brain },
    { id: 'intervencion', label: 'Plan de Intervención', icon: ListTodo },
    { id: 'comparador', label: 'Comparador', icon: Scale },
    { id: 'informe', label: 'Informe y Exportar', icon: FileText }
  ];

  return (
    <div id="psicosocial-module-container" className="space-y-6">
      {/* Cabecera del Módulo */}
      <div id="module-header" className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-8 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-x-20 -translate-y-20 blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              SST & Salud Ocupacional
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Riesgo Psicosocial</h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Análisis experto de la Batería de Riesgo Psicosocial. Diagnóstico de factores intralaborales, extralaborales y estrés mediante Inteligencia Artificial y métricas reglamentarias.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl px-5 py-3 shrink-0 flex items-center gap-3">
            <Users className="w-5 h-5 text-indigo-300" />
            <div>
              <span className="text-[10px] text-indigo-200 block font-bold uppercase leading-none">Muestra Actual</span>
              <span className="text-xl font-bold font-mono">{psicosocialData.totalParticipants}</span>
              <span className="text-[10px] text-slate-300 block font-semibold">{psicosocialData.batteryType}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación Sub-Tabs */}
      <div id="sub-navigation" className="flex border-b border-slate-100 overflow-x-auto pb-px scrollbar-none">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              id={`tab-psicosocial-${item.id}`}
              onClick={() => setActiveSubTab(item.id as any)}
              className={`flex items-center gap-2 px-5 py-4 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Contenedor de Vistas */}
      <div id="sub-tab-view-container" className="animate-fade-in">
        {activeSubTab === 'dashboard' && (
          <PsicosocialDashboard data={psicosocialData} />
        )}
        {activeSubTab === 'cargar' && (
          <PsicosocialUpload onDataLoaded={handleDataLoaded} currentData={psicosocialData} />
        )}
        {activeSubTab === 'analisis' && (
          <PsicosocialAnalysis data={psicosocialData} />
        )}
        {activeSubTab === 'intervencion' && (
          <PsicosocialIntervention data={psicosocialData} />
        )}
        {activeSubTab === 'comparador' && (
          <PsicosocialCompare data={psicosocialData} />
        )}
        {activeSubTab === 'informe' && (
          <PsicosocialReport data={psicosocialData} />
        )}
      </div>
    </div>
  );
};
export default PsicosocialModule;
