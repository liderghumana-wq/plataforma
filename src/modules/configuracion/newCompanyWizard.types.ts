import {
  CompanySite,
  CompanyArea,
  CompanyProject,
  CompanyPosition,
  CompanyContractType,
  CompanyWorkModality,
  CompanyShift,
  CompanyCostCenter,
  CatalogItemStatus
} from './companyAdmin.types';

export type CompanyStatus = 'DRAFT' | 'CONFIGURING' | 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';

export type UserRole = 
  | 'SUPER_ADMIN'
  | 'COMPANY_ADMIN'
  | 'HR_ADMIN'
  | 'SST_ADMIN'
  | 'ANALYST'
  | 'VIEWER';

export type QuestionType =
  | 'SHORT_TEXT'
  | 'LONG_TEXT'
  | 'NUMBER'
  | 'DATE'
  | 'YES_NO'
  | 'SINGLE_SELECT'
  | 'MULTI_SELECT'
  | 'SCALE'
  | 'PERCENTAGE';

export interface SurveyQuestionConfig {
  id: string;
  fieldKey: string;
  text: string;
  category: 'SOCIODEMOGRAFICO' | 'SALUD' | 'LABORAL' | 'PERSONALIZADO';
  type: QuestionType;
  options?: string[];
  required: boolean;
  active: boolean;
  allowOther?: boolean;
  allowPreferNotToAnswer?: boolean;
  sensitive?: boolean;
  criticalForIndicators?: string[];
  isCustom?: boolean;
}

export interface CustomCatalogItem {
  id: string;
  code: string;
  label: string;
  active: boolean;
}

export interface CustomCatalogConfig {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: CatalogItemStatus;
  order: number;
  items: CustomCatalogItem[];
  isSystemProtected?: boolean;
}

export interface OrgStructureConfig {
  skipSites: boolean;
  skipProjects: boolean;
  skipCostCenters: boolean;
  sites: CompanySite[];
  areas: CompanyArea[];
  projects: CompanyProject[];
  positions: CompanyPosition[];
  contractTypes: CompanyContractType[];
  workModalities: CompanyWorkModality[];
  shifts: CompanyShift[];
  costCenters: CompanyCostCenter[];
}

export interface DataSourceConfig {
  mode: 'DIGITAL_SURVEY' | 'EXCEL_UPLOAD' | 'BOTH';
  digitalSurveyUrl: string;
  allowedExcelColumns: string[];
}

export interface WizardUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CompanyInfoConfig {
  nombreComercial: string;
  razonSocial: string;
  nit: string;
  logo: string;
  correoAdmin: string;
  telefono: string;
  estado: CompanyStatus;
  periodoInicial: string;
  sectorEconomico: string;
  codigoCIIU: string;
  ciudad: string;
  direccion: string;
}

export interface WizardState {
  companyId: string;
  step: number;
  configurationVersion: number;
  surveyVersion: number;
  info: CompanyInfoConfig;
  orgStructure: OrgStructureConfig;
  customCatalogs: CustomCatalogConfig[];
  survey: {
    mode: 'STANDARD' | 'CUSTOM' | 'NEW_VERSION';
    versionName: string;
    questions: SurveyQuestionConfig[];
  };
  dataSource: DataSourceConfig;
  users: WizardUser[];
  lastSavedAt: string;
}

export interface ExcelImportPreview {
  sites: Partial<CompanySite>[];
  areas: Partial<CompanyArea>[];
  projects: Partial<CompanyProject>[];
  errors: {
    sheet: string;
    row: number;
    code?: string;
    message: string;
    severity: 'ERROR' | 'WARNING';
  }[];
  isValid: boolean;
}

export interface ColumnMappingResult {
  excelHeader: string;
  mappedFieldKey?: string;
  mappedFieldLabel?: string;
  confidence: 'HIGH' | 'MEDIUM' | 'NONE';
  status: 'MATCHED' | 'UNMATCHED';
}
