import { 
  Users, 
  Smile, 
  ShieldAlert, 
  HeartHandshake, 
  CalendarX, 
  AlertTriangle, 
  GraduationCap, 
  TrendingUp, 
  LogOut,
  Brain,
  LucideIcon
} from 'lucide-react';

export interface AnaliticoModule {
  id: string;
  name: string;
  description: string;
  iconName: 'Users' | 'Smile' | 'ShieldAlert' | 'HeartHandshake' | 'CalendarX' | 'AlertTriangle' | 'GraduationCap' | 'TrendingUp' | 'LogOut' | 'Brain';
  status: 'Disponible' | 'Próximamente' | 'En Desarrollo';
  tabLink: string;
  category: 'SG-SST' | 'Clima y Bienestar' | 'Talento Humano' | 'Analítica Avanzada';
}

export const ANALITICO_MODULES_INITIAL: AnaliticoModule[] = [
  {
    id: 'caracterizacion',
    name: 'Caracterización Sociodemográfica',
    description: 'Análisis detallado de variables demográficas, perfil socioeconómico, estructura familiar y condiciones de salud de los colaboradores.',
    iconName: 'Users',
    status: 'Disponible',
    tabLink: 'dashboard',
    category: 'SG-SST'
  },
  {
    id: 'clima',
    name: 'Clima Organizacional',
    description: 'Medición multidimensional de la percepción interna, eNPS, sentido de pertenencia, liderazgo y relaciones interpersonales.',
    iconName: 'Smile',
    status: 'Disponible',
    tabLink: 'inicio',
    category: 'Clima y Bienestar'
  },
  {
    id: 'psicosocial',
    name: 'Riesgo Psicosocial',
    description: 'Evaluación de factores intralaborales, extralaborales y de salud frente al estrés, con base en normativas vigentes.',
    iconName: 'ShieldAlert',
    status: 'Disponible',
    tabLink: 'mapa_riesgos',
    category: 'SG-SST'
  },
  {
    id: 'bienestar',
    name: 'Bienestar',
    description: 'Seguimiento de programas de hábitos saludables, participación en actividades corporativas e índices de satisfacción de vida.',
    iconName: 'HeartHandshake',
    status: 'Disponible',
    tabLink: 'plan',
    category: 'Clima y Bienestar'
  },
  {
    id: 'ausentismo',
    name: 'Ausentismo',
    description: 'Control de incapacidades, ausencias justificadas e injustificadas, análisis de causas recurrentes e impacto de productividad.',
    iconName: 'CalendarX',
    status: 'Próximamente',
    tabLink: 'inicio',
    category: 'SG-SST'
  },
  {
    id: 'accidentalidad',
    name: 'Accidentalidad',
    description: 'Reporte, categorización e índices de frecuencia, severidad y causalidad de accidentes o incidentes laborales.',
    iconName: 'AlertTriangle',
    status: 'Próximamente',
    tabLink: 'inicio',
    category: 'SG-SST'
  },
  {
    id: 'capacitacion',
    name: 'Capacitación',
    description: 'Plan integrado de formaciones, cumplimiento de horas requeridas, nivel de cobertura y evaluación del retorno de inversión.',
    iconName: 'GraduationCap',
    status: 'Próximamente',
    tabLink: 'inicio',
    category: 'Talento Humano'
  },
  {
    id: 'desempeno',
    name: 'Evaluación de Desempeño',
    description: 'Valoración sistemática del cumplimiento de objetivos individuales (OKRs) y competencias clave por niveles.',
    iconName: 'TrendingUp',
    status: 'Próximamente',
    tabLink: 'inicio',
    category: 'Talento Humano'
  },
  {
    id: 'retiro',
    name: 'Entrevista de Retiro',
    description: 'Recolección estructurada de causales de desvinculación, retroalimentación del clima en áreas específicas y recomendaciones.',
    iconName: 'LogOut',
    status: 'Próximamente',
    tabLink: 'inicio',
    category: 'Talento Humano'
  },
  {
    id: 'people_analytics',
    name: 'People Analytics',
    description: 'Modelado analítico predictivo para rotación de personal, fuga de talento, análisis de redes organizacionales (ONA) y correlaciones avanzadas.',
    iconName: 'Brain',
    status: 'En Desarrollo',
    tabLink: 'inteligencia_predictiva',
    category: 'Analítica Avanzada'
  }
];

export const iconMap: Record<string, LucideIcon> = {
  Users,
  Smile,
  ShieldAlert,
  HeartHandshake,
  CalendarX,
  AlertTriangle,
  GraduationCap,
  TrendingUp,
  LogOut,
  Brain
};
