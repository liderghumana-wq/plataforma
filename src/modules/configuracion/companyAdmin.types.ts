export type CompanyStatus = 'ACTIVE' | 'INACTIVE';
export type SurveyPeriodStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
export type CatalogItemStatus = 'ACTIVE' | 'INACTIVE';
export type DataQualityStatus = 'VALID' | 'INVALID' | 'MISSING' | 'NOT_CONFIGURED';

export type CatalogPermission =
  | 'COMPANY_VIEW'
  | 'COMPANY_EDIT'
  | 'CATALOG_VIEW'
  | 'CATALOG_EDIT'
  | 'SURVEY_VIEW'
  | 'SURVEY_EDIT'
  | 'DATA_VIEW'
  | 'DATA_EXPORT'
  | 'HEALTH_DATA_VIEW';

export interface Company {
  id: string;
  name: string;
  identificationNumber: string; // NIT / Tax ID
  status: CompanyStatus;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyConfiguration {
  companyId: string;
  tradeName: string; // Nombre comercial
  identification: string;
  logo?: string;
  corporateColors: {
    primary: string;
    secondary: string;
  };
  timeZone: string; // e.g. "America/Bogota"
  language: string; // e.g. "es-CO"
  privacyConfig: {
    dataRetentionYears: number;
    requireHealthConsent: boolean;
    privacyPolicyUrl?: string;
  };
  surveyConfig: {
    allowAnonymous: boolean;
    maxAttemptsPerEmployee: number;
    autoSaveDraft: boolean;
  };
  indicatorConfig: {
    autoRecalculateOnSurveyCompletion: boolean;
    showIndividualHealthMetricsToAdmins: boolean;
  };
}

export interface CompanySite {
  id: string;
  companyId: string;
  name: string;
  code: string;
  city?: string;
  address?: string;
  status: CatalogItemStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CompanyArea {
  id: string;
  companyId: string;
  name: string;
  code: string;
  status: CatalogItemStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CompanyProject {
  id: string;
  companyId: string;
  name: string;
  code: string;
  siteId?: string;
  areaId?: string;
  status: CatalogItemStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CompanyPosition {
  id: string;
  companyId: string;
  name: string;
  code: string;
  areaId?: string;
  status: CatalogItemStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CompanyContractType {
  id: string;
  companyId: string;
  name: string;
  code: string;
  status: CatalogItemStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CompanyWorkModality {
  id: string;
  companyId: string;
  name: string;
  code: string;
  status: CatalogItemStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CompanyShift {
  id: string;
  companyId: string;
  name: string;
  code: string;
  startTime?: string;
  endTime?: string;
  status: CatalogItemStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CompanyCostCenter {
  id: string;
  companyId: string;
  name: string;
  code: string;
  status: CatalogItemStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CompanyCustomField {
  id: string;
  companyId: string;
  fieldKey: string;
  label: string;
  description?: string;
  category: 'ORGANIZACIONAL' | 'SOCIODEMOGRAFICO' | 'SALUD' | 'PERSONALIZADO';
  dataType: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'SELECT' | 'MULTISELECT' | 'DATE';
  options?: string[];
  required: boolean;
  status: CatalogItemStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface SurveyPeriod {
  id: string;
  companyId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: SurveyPeriodStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'INACTIVATE' | 'ACTIVATE' | 'DELETE_ATTEMPT_DENIED';
  entity: 'Company' | 'CompanySite' | 'CompanyArea' | 'CompanyProject' | 'CompanyPosition' | 'CompanyContractType' | 'CompanyWorkModality' | 'CompanyShift' | 'CompanyCostCenter' | 'CompanyCustomField' | 'SurveyPeriod' | 'CompanyConfiguration';
  entityId: string;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  timestamp: string;
}

export interface ExcelImportValidationResult {
  companyId: string;
  entityType: string;
  rawValue: string | null | undefined;
  matchedId: string | null;
  matchedName: string | null;
  qualityStatus: DataQualityStatus;
  errorMessage?: string;
}
