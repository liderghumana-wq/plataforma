export type SurveyResponseType = 'Likert5' | 'Boolean' | 'Scale10' | 'Numeric';

export interface SurveyResponseOption {
  value: number;
  label: string;
  aliases: string[]; // Variations for smart matching
}

export interface SurveyFormula {
  id: string;
  name: string;
  expression: 'AVERAGE' | 'SUM' | 'FAVORABILITY_PCT' | 'THRESHOLD_COUNT';
  targetQuestionIds?: string[];
  targetDimensionIds?: string[];
  thresholdValue?: number; // E.g., >= 4 is favorable
}

export interface SurveyChartConfig {
  id: string;
  title: string;
  type: 'BAR' | 'PIE' | 'LINE' | 'RADAR' | 'STOCKED_BAR';
  dataSource: 'DIMENSIONS' | 'QUESTIONS' | 'SEGMENTS';
  dimensionIds?: string[];
}

export interface SurveyInterpretationRule {
  id: string;
  metricId: string; // ID of formula or dimension
  minVal: number;
  maxVal: number;
  title: string;
  text: string;
  level: 'Saludable' | 'Regular' | 'Crítico';
}

export interface SurveyQuestionConfig {
  id: string;
  text: string;
  dimensionId: string;
  aliases: string[]; // Variations of column headers in Excel
  inverted?: boolean; // If true, 1 becomes 5, 5 becomes 1
}

export interface SurveyDimensionConfig {
  id: string;
  name: string;
  description: string;
}

export interface SurveyConfig {
  id: string;
  name: string;
  description: string;
  responseType: SurveyResponseType;
  options: SurveyResponseOption[];
  dimensions: SurveyDimensionConfig[];
  questions: SurveyQuestionConfig[];
  formulas: SurveyFormula[];
  charts: SurveyChartConfig[];
  interpretations: SurveyInterpretationRule[];
}

// Outputs from the generic calculation engine
export interface DimensionResult {
  dimensionId: string;
  name: string;
  description: string;
  average: number;
  favorability: number;
}

export interface QuestionResult {
  questionId: string;
  text: string;
  average: number;
  favorability: number;
  totalResponses: number;
}

export interface FormulaResult {
  formulaId: string;
  name: string;
  value: number;
}

export interface ChartDataset {
  label: string;
  value: number;
  color?: string;
}

export interface ChartResult {
  chartId: string;
  title: string;
  type: 'BAR' | 'PIE' | 'LINE' | 'RADAR' | 'STOCKED_BAR';
  data: ChartDataset[];
}

export interface InterpretationResult {
  ruleId: string;
  title: string;
  text: string;
  level: 'Saludable' | 'Regular' | 'Crítico';
  currentValue: number;
}

export interface UniversalSurveyAnalysis {
  surveyId: string;
  surveyName: string;
  totalRecords: number;
  dimensions: DimensionResult[];
  questions: QuestionResult[];
  formulas: FormulaResult[];
  charts: ChartResult[];
  interpretations: InterpretationResult[];
}
