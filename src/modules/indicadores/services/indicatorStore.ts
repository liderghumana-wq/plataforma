import { OrganizationalIndicator } from '../types';

const STORAGE_KEY = 'organizational_indicators_center';

const DEFAULT_INDICATORS: OrganizationalIndicator[] = [
  {
    id: 'ind_clima_global',
    name: 'Índice de Favorabilidad de Clima Global',
    description: 'Porcentaje general de respuestas con valoración positiva (De acuerdo o Muy de acuerdo) en la encuesta anual de clima corporativo.',
    formula: '(Suma de Respuestas Favorables / Total de Respuestas de Clima) * 100',
    frequency: 'Anual',
    unit: '%',
    target: 80,
    thresholds: {
      critical: 65,
      warning: 75,
      success: 80
    },
    responsible: 'Gerencia de Gestión Humana',
    regulations: 'Resolución 2646 de 2008 (Evaluación de Factores de Riesgo Psicosocial)',
    dataSource: 'Encuesta Anual de Clima y Cultura',
    currentValue: 74,
    previousValue: 69,
    dimension: 'Clima General'
  },
  {
    id: 'ind_seguridad_psic',
    name: 'Índice de Seguridad Psicológica',
    description: 'Nivel de confianza percibido por los colaboradores para expresar ideas, reportar errores o asumir riesgos sin temor a represalias.',
    formula: '(Respuestas de alta confianza en seguridad psicológica / Total de respuestas de seguridad psicológica) * 100',
    frequency: 'Trimestral',
    unit: '%',
    target: 85,
    thresholds: {
      critical: 70,
      warning: 80,
      success: 85
    },
    responsible: 'Coordinador de Desarrollo Organizacional',
    regulations: 'Guía Técnica del Ministerio del Trabajo para Riesgo Psicosocial',
    dataSource: 'Pulso de Confianza Trimestral',
    currentValue: 81,
    previousValue: 78,
    dimension: 'Cultura'
  },
  {
    id: 'ind_eficacia_liderazgo',
    name: 'Eficacia del Liderazgo de Mandos Medios',
    description: 'Nivel de competencia y apoyo emocional percibido en los supervisores inmediatos de cada equipo de trabajo.',
    formula: '(Suma de calificaciones favorables de líderes / Número de evaluaciones de líderes recibidas) * 100',
    frequency: 'Semestral',
    unit: '%',
    target: 78,
    thresholds: {
      critical: 60,
      warning: 72,
      success: 78
    },
    responsible: 'Dirección de Desarrollo y Aprendizaje',
    regulations: 'Resolución 2646 de 2008 (Liderazgo y Relaciones Sociales en el Trabajo)',
    dataSource: 'Evaluación de Liderazgo 360°',
    currentValue: 62,
    previousValue: 65,
    dimension: 'Liderazgo'
  },
  {
    id: 'ind_ausentismo',
    name: 'Tasa de Ausentismo Laboral (Incapacidades)',
    description: 'Porcentaje de días perdidos por incapacidades de origen común o profesional sobre los días laborables totales planificados.',
    formula: '(Número de días de ausencia médica autorizada / Total de días hombres programados) * 100',
    frequency: 'Mensual',
    unit: '%',
    target: 2.5,
    // Note: for absenteeism, lower values are better!
    // We handle the color thresholds in the UI by checking if lower is better.
    thresholds: {
      critical: 5.0,
      warning: 3.5,
      success: 2.5
    },
    responsible: 'Líder de Seguridad y Salud en el Trabajo (SST)',
    regulations: 'Decreto 1072 de 2015 (Reglamento del Sector Trabajo para SG-SST)',
    dataSource: 'Reportes Mensuales de Incapacidades y Ausencias',
    currentValue: 3.2,
    previousValue: 4.1,
    dimension: 'Bienestar'
  },
  {
    id: 'ind_rotacion_personal',
    name: 'Tasa de Rotación Voluntaria de Personal',
    description: 'Porcentaje de renuncias voluntarias de talento sobre el promedio de la planta laboral en un periodo de tiempo.',
    formula: '(Número de retiros voluntarios en el mes / Promedio total de colaboradores en el mes) * 100',
    frequency: 'Mensual',
    unit: '%',
    target: 1.0,
    // For turnover, lower is better.
    thresholds: {
      critical: 2.5,
      warning: 1.8,
      success: 1.0
    },
    responsible: 'Coordinación de Atracción y Retención de Talento',
    regulations: 'Norma Internacional de Métricas de Talento Humano ISO 30414',
    dataSource: 'Registro de Retiros y Entrevistas de Salida',
    currentValue: 1.5,
    previousValue: 2.1,
    dimension: 'Retención'
  },
  {
    id: 'ind_claridad_rol',
    name: 'Índice de Claridad de Rol y Expectativas',
    description: 'Entendimiento que tiene el colaborador de sus responsabilidades, metas diarias y cómo su labor impacta la estrategia global.',
    formula: '(Respuestas de total acuerdo en claridad de metas / Total respuestas analizadas) * 100',
    frequency: 'Semestral',
    unit: '%',
    target: 90,
    thresholds: {
      critical: 75,
      warning: 85,
      success: 90
    },
    responsible: 'Gerencias de Operaciones y Líderes de Área',
    regulations: 'Guía de Claridad de Rol y Definición de Funciones',
    dataSource: 'Evaluación del Desempeño y Clima',
    currentValue: 88,
    previousValue: 85,
    dimension: 'Operaciones'
  }
];

export class IndicatorStore {
  /**
   * Retrieves all organizational indicators from localStorage or loads defaults if empty
   */
  public static getAll(): OrganizationalIndicator[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error al cargar indicadores de localStorage:', e);
    }
    
    // Default fallback, save to storage for persistence
    this.save(DEFAULT_INDICATORS);
    return DEFAULT_INDICATORS;
  }

  /**
   * Adds a brand-new dynamic indicator to the system without changing code
   */
  public static add(indicator: Omit<OrganizationalIndicator, 'id' | 'isCustom'>): OrganizationalIndicator {
    const current = this.getAll();
    const newIndicator: OrganizationalIndicator = {
      ...indicator,
      id: `ind_custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      isCustom: true
    };
    
    const updated = [...current, newIndicator];
    this.save(updated);
    return newIndicator;
  }

  /**
   * Updates an existing indicator's fields or live values
   */
  public static update(id: string, updates: Partial<OrganizationalIndicator>): OrganizationalIndicator | null {
    const current = this.getAll();
    const index = current.findIndex(ind => ind.id === id);
    if (index === -1) return null;

    const updatedIndicator = {
      ...current[index],
      ...updates
    };

    current[index] = updatedIndicator;
    this.save(current);
    return updatedIndicator;
  }

  /**
   * Deletes a custom indicator from the database
   */
  public static delete(id: string): boolean {
    const current = this.getAll();
    const filtered = current.filter(ind => ind.id !== id);
    if (filtered.length === current.length) return false;
    
    this.save(filtered);
    return true;
  }

  /**
   * Resets the entire store back to standard corporate default templates
   */
  public static resetToDefaults(): OrganizationalIndicator[] {
    this.save(DEFAULT_INDICATORS);
    return DEFAULT_INDICATORS;
  }

  /**
   * Helper to write to local storage
   */
  private static save(indicators: OrganizationalIndicator[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(indicators));
    } catch (e) {
      console.error('Error al guardar indicadores en localStorage:', e);
    }
  }
}
