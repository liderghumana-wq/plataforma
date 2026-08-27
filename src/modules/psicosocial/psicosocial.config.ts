import { PsicosocialDimension, RiskLevel } from './psicosocial.types';

export const PSICOSOCIAL_DIMENSIONS: PsicosocialDimension[] = [
  {
    id: 'liderazgo',
    name: 'Liderazgo y Relaciones en el Trabajo',
    description: 'Estilo de mando, retroalimentación del desempeño, comunicación y relaciones con colaboradores.',
    category: 'Intralaboral'
  },
  {
    id: 'control_trabajo',
    name: 'Control sobre el Trabajo',
    description: 'Autonomía, margen de decisión, participación en el cambio y claridad del rol.',
    category: 'Intralaboral'
  },
  {
    id: 'demandas_trabajo',
    name: 'Demandas del Trabajo',
    description: 'Esfuerzo mental, carga cuantitativa, exigencias emocionales y jornada laboral.',
    category: 'Intralaboral'
  },
  {
    id: 'recompensas',
    name: 'Recompensas',
    description: 'Reconocimiento, compensación del esfuerzo, estabilidad laboral e identificación con la organización.',
    category: 'Intralaboral'
  },
  {
    id: 'apoyo_social',
    name: 'Apoyo Social en el Trabajo',
    description: 'Relaciones de apoyo de compañeros, ayuda del supervisor e integración grupal.',
    category: 'Intralaboral'
  },
  {
    id: 'relaciones_laborales',
    name: 'Relaciones Laborales Interpersonales',
    description: 'Trato interpersonal en el equipo, resolución de conflictos y respeto mutuo.',
    category: 'Intralaboral'
  },
  {
    id: 'claridad_rol',
    name: 'Claridad del Rol',
    description: 'Definición precisa de funciones, límites de autoridad y expectativas claras de la gestión.',
    category: 'Intralaboral'
  },
  {
    id: 'capacitacion',
    name: 'Capacitación y Entrenamiento',
    description: 'Inducción, planes de formación y pertinencia técnica de las capacitaciones.',
    category: 'Intralaboral'
  },
  {
    id: 'reconocimiento',
    name: 'Reconocimiento del Desempeño',
    description: 'Valoración formal e informal de los logros por parte de la empresa y los líderes.',
    category: 'Intralaboral'
  },
  {
    id: 'jornada',
    name: 'Jornada y Tiempos de Trabajo',
    description: 'Extensión del horario de trabajo, horas extra y respeto por los tiempos de descanso.',
    category: 'Intralaboral'
  },
  {
    id: 'carga_mental',
    name: 'Carga Mental y Atención',
    description: 'Complejidad de las tareas, concentración sostenida y velocidad requerida de procesamiento.',
    category: 'Intralaboral'
  },
  {
    id: 'carga_emocional',
    name: 'Carga Emocional y Trato',
    description: 'Trato directo con público difícil, manejo de situaciones estresantes e impacto psicológico.',
    category: 'Intralaboral'
  },
  {
    id: 'responsabilidades_familiares',
    name: 'Responsabilidades Familiares',
    description: 'Conciliación del tiempo laboral con el cuidado de hijos, padres o dependientes.',
    category: 'Extralaboral'
  },
  {
    id: 'tiempo_fuera_trabajo',
    name: 'Tiempo Fuera del Trabajo',
    description: 'Disponibilidad de tiempo libre para el descanso, ocio, familia y crecimiento personal.',
    category: 'Extralaboral'
  },
  {
    id: 'vivienda_entorno',
    name: 'Características de la Vivienda y su Entorno',
    description: 'Condiciones de habitabilidad, acceso a servicios básicos, seguridad física y transporte.',
    category: 'Extralaboral'
  },
  {
    id: 'caracteristicas_economicas',
    name: 'Características Económicas',
    description: 'Suficiencia de ingresos familiares, estabilidad financiera y carga económica de dependientes.',
    category: 'Extralaboral'
  }
];

export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score < 20) return 'Muy Bajo';
  if (score < 40) return 'Bajo';
  if (score < 60) return 'Medio';
  if (score < 80) return 'Alto';
  return 'Muy Alto';
}

export function getRiskColorClass(level: RiskLevel): string {
  switch (level) {
    case 'Muy Bajo': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    case 'Bajo': return 'text-blue-600 bg-blue-50 border-blue-100';
    case 'Medio': return 'text-amber-600 bg-amber-50 border-amber-100';
    case 'Alto': return 'text-orange-600 bg-orange-50 border-orange-100';
    case 'Muy Alto': return 'text-red-600 bg-red-50 border-red-100';
  }
}

export function getRiskHexColor(level: RiskLevel): string {
  switch (level) {
    case 'Muy Bajo': return '#10b981'; // emerald-500
    case 'Bajo': return '#3b82f6'; // blue-500
    case 'Medio': return '#f59e0b'; // amber-500
    case 'Alto': return '#f97316'; // orange-500
    case 'Muy Alto': return '#ef4444'; // red-500
  }
}
