export type DictionaryCategory = 
  | 'SOCIODEMOGRAPHIC'
  | 'LABOR'
  | 'FAMILY'
  | 'HOUSING'
  | 'HEALTH'
  | 'LIFESTYLE'
  | 'ERGONOMIC'
  | 'WELLBEING'
  | 'EMERGENCY'
  | 'ORGANIZATIONAL';

export type DictionaryDataType = 
  | 'TEXT'
  | 'NUMBER'
  | 'DECIMAL'
  | 'INTEGER'
  | 'DATE'
  | 'BOOLEAN'
  | 'SINGLE_SELECT'
  | 'MULTI_SELECT'
  | 'PERCENTAGE'
  | 'CURRENCY'
  | 'LONG_TEXT';

export type DictionarySourceType = 'SURVEY' | 'EXCEL' | 'CALCULATED' | 'ORGANIZATIONAL';

export type DictionaryFieldStatus = 'ACTIVE' | 'DEPRECATED';

export type TechnicalDataStatus = 
  | 'VALID'
  | 'MISSING'
  | 'NO_DATA'
  | 'NOT_CALCULABLE'
  | 'NOT_APPLICABLE'
  | 'PREFER_NOT_TO_ANSWER'
  | 'COLUMN_NOT_FOUND';

export interface CalculationRule {
  calculatedField: string;
  dependsOn: string[];
  formulaDescription?: string;
}

export interface ValidationRules {
  min?: number;
  max?: number;
  pattern?: string;
  customValidator?: string;
  noFutureDate?: boolean;
}

export interface DataDictionaryDefinition {
  fieldKey: string;
  label: string;
  description: string;
  category: DictionaryCategory;
  dataType: DictionaryDataType;
  required: boolean;
  sensitive: boolean;
  critical: boolean;
  sourceType: DictionarySourceType;
  validationRules?: ValidationRules;
  allowedValues?: string[];
  unit?: string;
  calculationRule?: CalculationRule;
  reportVisibility: boolean;
  version: string;
  status: DictionaryFieldStatus;
  aliases: string[];
  linkedQuestions?: string[];
  linkedIndicators?: string[];
}

export interface SurveyQuestionBinding {
  questionId: string;
  fieldKey: string;
  surveyVersion: string;
  order: number;
  required: boolean;
  options?: string[];
  validationRules?: ValidationRules;
  otherValueKey?: string; // e.g. estadoCivilOtro when estadoCivil === 'Otro'
  allowsPreferNotToAnswer?: boolean;
}

export interface ExcelColumnMapping {
  excelHeader: string;
  fieldKey: string | null;
  status: 'MAPPED' | 'COLUMN_NOT_FOUND';
  dictionaryMatch?: DataDictionaryDefinition;
}

export interface TraceabilityNode {
  questionId?: string;
  fieldKey: string;
  label: string;
  value: any;
  status: TechnicalDataStatus;
  validationResult: { isValid: boolean; message?: string };
  derivedIndicators: string[];
  charts: string[];
  reportSections: string[];
}

export interface NormalizedRecordValue {
  fieldKey: string;
  rawValue: any;
  normalizedValue: any;
  status: TechnicalDataStatus;
  otherValue?: string;
  isValid: boolean;
  validationError?: string;
}

export interface EquivalenceTestResult {
  isEquivalent: boolean;
  surveyRecordFields: Record<string, NormalizedRecordValue>;
  excelRecordFields: Record<string, NormalizedRecordValue>;
  fieldComparisons: Array<{
    fieldKey: string;
    label: string;
    surveyNormalized: any;
    excelNormalized: any;
    surveyStatus: TechnicalDataStatus;
    excelStatus: TechnicalDataStatus;
    matches: boolean;
  }>;
  mismatchesCount: number;
}
