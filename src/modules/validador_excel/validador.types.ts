export type ValidationStatus = 'VALID' | 'WARNING' | 'ERROR' | 'NO_DATA';

export type EmptyValueType = 'SIN_RESPUESTA' | 'DATO_NO_DISPONIBLE';

export type UnrecognizedColumnAction = 'ignore' | 'map_manual' | 'create_field';

export interface UnrecognizedColumn {
  id: string;
  excelHeader: string;
  columnIndex: number;
  sampleValue?: string;
  action: UnrecognizedColumnAction;
  mappedFieldKey?: string;
  customFieldName?: string;
}

export interface SystemFieldDefinition {
  key: string;
  label: string;
  category: 'identificacion' | 'laboral' | 'sociodemografico' | 'salud' | 'antropometrico' | 'encuesta';
  isMandatory: boolean;
  aliases: string[];
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'enum';
  validValues?: string[];
  minVal?: number;
  maxVal?: number;
}

export interface FieldQualityMetric {
  fieldName: string;
  fieldLabel: string;
  category: string;
  isMandatory: boolean;
  excelHeaderMapped?: string;
  totalRecords: number;
  validRecords: number;
  emptyRecords: number;
  errorRecords: number;
  warningRecords: number;
  coveragePercentage: number;
}

export interface CellValidationIssue {
  columnKey: string;
  columnLabel: string;
  originalValue: any;
  status: ValidationStatus;
  issueType: 
    | 'VACIO' 
    | 'FORMATO_INVALIDO' 
    | 'FUERA_DE_RANGO' 
    | 'CATALOGO_INEXISTENTE' 
    | 'DUPLICADO' 
    | 'FECHA_IMPOSIBLE' 
    | 'UNIDAD_NORMALIZADA';
  description: string;
  suggestion?: string;
}

export interface RecordValidationDetail {
  rowNumber: number; // 1-indexed row number in Excel
  originalRowData: Record<string, any>; // header -> value
  parsedFields: Record<string, any>; // fieldKey -> normalized/parsed value
  status: ValidationStatus;
  reasons: string[];
  issues: CellValidationIssue[];
  isDuplicate?: boolean;
  duplicateOfRow?: number;
}

export interface ManualCorrectionEntry {
  rowNumber: number;
  fieldKey: string;
  fieldLabel: string;
  originalValue: any;
  correctedValue: any;
  userConfirmed: boolean;
}

export interface ErrorReportRow {
  originalRow: number;
  column: string;
  value: string;
  errorType: string;
  description: string;
  suggestion: string;
}

export interface ImportTraceabilityRecord {
  id: string;
  fileName: string;
  fileSize: string;
  fileHash?: string;
  uploadedBy: string;
  uploadDate: string;
  companyName: string;
  totalRecords: number;
  validRecordsCount: number;
  warningRecordsCount: number;
  errorRecordsCount: number;
  noDataRecordsCount: number;
  importedRecordsCount: number;
  rejectedRecordsCount: number;
  qualityPercentage: number;
  importMode: 'ALL' | 'ONLY_VALID';
}

export interface AIQualityDiagnosis {
  overallPercentage: number;
  qualityLevel: 'Excelente' | 'Buena' | 'Regular' | 'Deficiente';
  narrative: string;
  anthropometricCoverageText: string;
  laborCoverageText: string;
  recommendationsForSST: string[];
  disclaimer: string;
}

export interface ExcelValidationSummary {
  fileName: string;
  fileSize: string;
  totalRows: number;
  detectedColumnsCount: number;
  validRecordsCount: number;
  warningRecordsCount: number;
  errorRecordsCount: number;
  noDataRecordsCount: number;
  qualityPercentage: number;
  qualityLevel: 'Excelente' | 'Buena' | 'Regular' | 'Deficiente';
  
  // Mappings
  recognizedColumns: {
    excelHeader: string;
    systemFieldKey: string;
    systemFieldLabel: string;
    coveragePercentage: number;
  }[];
  unrecognizedColumns: UnrecognizedColumn[];
  missingMandatoryColumns: string[];

  // Detailed Metrics
  matrix: FieldQualityMetric[];
  records: RecordValidationDetail[];
  
  // AI diagnosis
  aiDiagnosis: AIQualityDiagnosis;
}
