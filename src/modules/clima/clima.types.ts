export interface ClimateDimension {
  id: string;
  name: string;
  description: string;
  questions: string[]; // IDs de preguntas correspondientes
}

export interface ClimateQuestion {
  id: string;
  dimensionId: string;
  text: string;
  aliases: string[]; // Nombres alternativos de columnas en Excel
}

export interface ClimateQuestionScore {
  questionId: string;
  text: string;
  average: number; // Promedio de la pregunta (1-5)
  favorability: number; // Porcentaje de respuestas favorable (4 y 5) en % (0-100)
  neutral: number; // Porcentaje de respuestas neutras (3) en %
  unfavorability: number; // Porcentaje de respuestas desfavorables (1 y 2) en %
  count: number;
}

export interface ClimateDimensionScore {
  dimensionId: string;
  name: string;
  description: string;
  average: number; // Promedio general de la dimensión (1-5)
  favorability: number; // Favorabilidad promedio en % (0-100)
  questionScores: ClimateQuestionScore[];
}

export interface ClimateSegmentScore {
  segmentName: string; // ej: "Bogotá", "Operaciones"
  average: number;
  favorability: number;
}

export interface ClimateData {
  totalParticipants: number;
  globalAverage: number; // Escala 1-5
  globalFavorability: number; // Escala 0-100%
  dimensions: ClimateDimensionScore[];
  
  // Segmentaciones
  byCity: ClimateSegmentScore[];
  byDepartment: ClimateSegmentScore[];
  byGender: ClimateSegmentScore[];
  bySeniority: ClimateSegmentScore[];

  // Metadatos
  rawEmployees?: any[];
  dataQuality?: ClimateDataQualityReport;
}

export interface ClimateDataQualityIssue {
  row: number;
  variable: string;
  value: string;
  observation: string;
}

export interface ClimateDataQualityReport {
  recordsRead: number;
  recognizedVariablesCount: number;
  totalVariablesCount: number;
  missingVariablesCount: number;
  incompleteRecordsCount: number;
  qualityPercentage: number;
  qualityLevel: 'Excelente' | 'Buena' | 'Regular' | 'Deficiente';
  warnings: string[];
  details: ClimateDataQualityIssue[];
}

export interface ClimateRecommendation {
  id: string;
  dimensionId: string;
  dimensionName: string;
  title: string;
  description: string;
  priority: 'Alta' | 'Media' | 'Baja';
  actionSteps: string[];
  status: 'Planificada' | 'En Progreso' | 'Completada';
  responsible: string;
}
