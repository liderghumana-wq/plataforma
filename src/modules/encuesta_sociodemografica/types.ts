export type QuestionType =
  | 'text'
  | 'number'
  | 'date'
  | 'email'
  | 'phone'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'multiselect'
  | 'textarea'
  | 'slider';

export interface ValidationRule {
  min?: number;
  max?: number;
  pattern?: string;
  customErrorMsg?: string;
  minAge?: number;
}

export interface QuestionOption {
  label: string;
  value: string;
}

export interface QuestionDependency {
  questionId: string;
  value: any; // Value or array of values that trigger this question, e.g. 'Sí' or ['Sí', 'Ocasionalmente']
}

export interface QuestionSchema {
  id: string; // Acts as fieldKey
  fieldKey?: string;
  label: string;
  type: QuestionType;
  required?: boolean;
  options?: QuestionOption[];
  placeholder?: string;
  validation?: ValidationRule;
  category?: string;
  tooltip?: string;
  helpText?: string;
  unit?: string;
  defaultValue?: any;
  computed?: boolean;
  readonly?: boolean;
  min?: number;
  max?: number;
  step?: number;
  sensitive?: boolean;
  dependsOn?: QuestionDependency;
  allowsOther?: boolean;
  otherFieldKey?: string;
  allowsPreferNotToAnswer?: boolean;
}

export interface SurveySection {
  id: number;
  title: string;
  shortTitle: string;
  description: string;
  iconName: string;
  notice?: string; // Optional disclaimer or warning banner
  questions: QuestionSchema[];
}

export type SurveyAnswers = Record<string, any>;
export type SurveyErrors = Record<string, string>;
