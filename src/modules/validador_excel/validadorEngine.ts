import * as XLSX from 'xlsx';
import {
  ValidationStatus,
  UnrecognizedColumn,
  SystemFieldDefinition,
  FieldQualityMetric,
  CellValidationIssue,
  RecordValidationDetail,
  ExcelValidationSummary,
  AIQualityDiagnosis,
  ErrorReportRow,
  ImportTraceabilityRecord
} from './validador.types';
import { findColumn as findColumnSmart } from '../../utils/columnDictionary';
import { cleanString, normalizeGender, normalizeEducation, normalizeMaritalStatus, normalizeHousing } from '../../utils/dataNormalizer';

// Catalog definitions for validation
export interface CompanyCatalogContext {
  sedes?: string[];
  areas?: string[];
  procesos?: string[];
  proyectos?: string[];
  cargos?: string[];
  tiposContrato?: string[];
  modalidades?: string[];
  jornadas?: string[];
}

// System fields definition
export const SYSTEM_FIELDS: SystemFieldDefinition[] = [
  { key: 'cedula', label: 'Identificador / Cédula', category: 'identificacion', isMandatory: true, aliases: ['cedula', 'id', 'identificacion', 'documento', 'cc', 'nit'], dataType: 'string' },
  { key: 'empresa', label: 'Empresa', category: 'laboral', isMandatory: true, aliases: ['empresa', 'razon social', 'company'], dataType: 'string' },
  { key: 'sede', label: 'Sede', category: 'laboral', isMandatory: true, aliases: ['sede', 'sitio de trabajo', 'ubicacion', 'sucursal'], dataType: 'string' },
  { key: 'area', label: 'Área', category: 'laboral', isMandatory: true, aliases: ['area', 'departamento', 'seccion', 'division'], dataType: 'string' },
  { key: 'cargo', label: 'Cargo', category: 'laboral', isMandatory: true, aliases: ['cargo', 'puesto', 'rol', 'ocupacion'], dataType: 'string' },
  { key: 'nombre', label: 'Nombre Completo', category: 'identificacion', isMandatory: false, aliases: ['nombre', 'nombres', 'colaborador', 'empleado', 'nombre completo'], dataType: 'string' },
  { key: 'correo', label: 'Correo Electrónico', category: 'identificacion', isMandatory: false, aliases: ['correo', 'email', 'mail', 'correo electronico'], dataType: 'string' },
  { key: 'tipoContrato', label: 'Tipo de Contrato', category: 'laboral', isMandatory: false, aliases: ['tipo de contrato', 'contrato', 'vinculacion', 'modalidad contractual'], dataType: 'string' },
  { key: 'proyecto', label: 'Proyecto', category: 'laboral', isMandatory: false, aliases: ['proyecto', 'campaña', 'cuenta'], dataType: 'string' },
  { key: 'proceso', label: 'Proceso', category: 'laboral', isMandatory: false, aliases: ['proceso', 'macroproceso'], dataType: 'string' },
  { key: 'jornada', label: 'Jornada Laboral', category: 'laboral', isMandatory: false, aliases: ['jornada', 'turno', 'horario'], dataType: 'string' },
  
  // Sociodemográficos
  { key: 'edad', label: 'Edad', category: 'sociodemografico', isMandatory: false, aliases: ['edad', 'años'], dataType: 'number', minVal: 15, maxVal: 100 },
  { key: 'sexo', label: 'Sexo / Género', category: 'sociodemografico', isMandatory: false, aliases: ['sexo', 'genero'], dataType: 'string' },
  { key: 'estadoCivil', label: 'Estado Civil', category: 'sociodemografico', isMandatory: false, aliases: ['estado civil', 'marital'], dataType: 'string' },
  { key: 'ciudad', label: 'Ciudad', category: 'sociodemografico', isMandatory: false, aliases: ['ciudad', 'municipio', 'ciudad de residencia', 'ciudad labora'], dataType: 'string' },
  { key: 'departamentoRes', label: 'Departamento Residencia', category: 'sociodemografico', isMandatory: false, aliases: ['departamento', 'dpto'], dataType: 'string' },
  { key: 'estrato', label: 'Estrato Socioeconómico', category: 'sociodemografico', isMandatory: false, aliases: ['estrato', 'nivel socioeconomico'], dataType: 'string' },
  { key: 'nivelEducativo', label: 'Nivel Educativo', category: 'sociodemografico', isMandatory: false, aliases: ['nivel educativo', 'escolaridad', 'estudios', 'grado academico'], dataType: 'string' },
  { key: 'tipoVivienda', label: 'Tipo de Vivienda', category: 'sociodemografico', isMandatory: false, aliases: ['vivienda', 'tipo de vivienda', 'tenencia vivienda'], dataType: 'string' },
  { key: 'hijos', label: 'Número de Hijos', category: 'sociodemografico', isMandatory: false, aliases: ['hijos', 'numero de hijos', 'tiene hijos'], dataType: 'string' },
  { key: 'personasACargo', label: 'Personas a Cargo', category: 'sociodemografico', isMandatory: false, aliases: ['personas a cargo', 'dependientes', 'personas a su cargo'], dataType: 'number', minVal: 0, maxVal: 20 },

  // Salud y Antropometría
  { key: 'peso', label: 'Peso (kg)', category: 'antropometrico', isMandatory: false, aliases: ['peso', 'peso kg', 'peso en kg'], dataType: 'number', minVal: 35, maxVal: 180 },
  { key: 'estatura', label: 'Estatura (m/cm)', category: 'antropometrico', isMandatory: false, aliases: ['estatura', 'talla', 'estatura cm', 'estatura m', 'altura'], dataType: 'number', minVal: 1.0, maxVal: 2.3 },
  { key: 'perimetroCintura', label: 'Perímetro Abdominal (cm)', category: 'antropometrico', isMandatory: false, aliases: ['perimetro cintura', 'cintura', 'perimetro abdominal', 'diametro cintura'], dataType: 'number', minVal: 40, maxVal: 180 },
  { key: 'alergias', label: 'Alergias', category: 'salud', isMandatory: false, aliases: ['alergias', 'alergia'], dataType: 'string' },
  { key: 'medicamentos', label: 'Medicamentos', category: 'salud', isMandatory: false, aliases: ['medicamentos', 'medicina', 'medicamento'], dataType: 'string' },
  { key: 'enfermedades', label: 'Enfermedades / Diagnósticos', category: 'salud', isMandatory: false, aliases: ['enfermedades', 'diagnosticos', 'condiciones de salud'], dataType: 'string' },
  { key: 'discapacidad', label: 'Discapacidad', category: 'salud', isMandatory: false, aliases: ['discapacidad', 'limitacion'], dataType: 'string' },
  { key: 'actividadFisica', label: 'Actividad Física', category: 'salud', isMandatory: false, aliases: ['actividad fisica', 'deporte', 'ejercicio'], dataType: 'string' },
  { key: 'molestias', label: 'Molestias Musculoesqueléticas', category: 'salud', isMandatory: false, aliases: ['molestias', 'dolor', 'molestias osteomusculares'], dataType: 'string' }
];

// Helper to check empty cells according to Section 8
export function isValueEmpty(val: any): boolean {
  if (val === null || val === undefined) return true;
  const str = val.toString().trim();
  if (str === '') return true;
  
  const lower = str.toLowerCase();
  const emptyLiterals = [
    'null', 'undefined', 'na', 'n/a', 'n.a.', 'n/a.', 
    'no registra', 'no responde', 'sin dato', 'sin informacion', 
    'ninguno', 'ninguna', 'no aplica', 'no informa', '-'
  ];
  return emptyLiterals.includes(lower);
}

// Find closest match in a catalog list for suggestion
export function findCatalogSuggestion(val: string, catalog: string[]): string | undefined {
  if (!catalog || catalog.length === 0 || !val) return undefined;
  const cleanVal = cleanString(val);
  
  for (const item of catalog) {
    const cleanItem = cleanString(item);
    if (cleanItem === cleanVal) return item;
    if (cleanItem.includes(cleanVal) || cleanVal.includes(cleanItem)) return item;
  }
  return catalog[0];
}

export function validateExcelBuffer(
  arrayBuffer: ArrayBuffer,
  fileName: string,
  catalogContext: CompanyCatalogContext = {}
): ExcelValidationSummary {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });

  if (!rawRows || rawRows.length < 2) {
    throw new Error('El archivo Excel está vacío o no contiene filas suficientes con datos.');
  }

  // Header detection: inspect top 15 rows
  let headerRowIdx = 0;
  let maxMatches = -1;

  for (let r = 0; r < Math.min(15, rawRows.length); r++) {
    const row = rawRows[r];
    if (!Array.isArray(row)) continue;
    let matches = 0;
    SYSTEM_FIELDS.forEach(sf => {
      const found = sf.aliases.some(alias => 
        row.some(cell => cell && cleanString(cell) === cleanString(alias))
      );
      if (found) matches++;
    });
    if (matches > maxMatches) {
      maxMatches = matches;
      headerRowIdx = r;
    }
  }

  const rawHeaders: string[] = (rawRows[headerRowIdx] || []).map(cell => cell ? cell.toString().trim() : '');
  
  // Mapping columns
  const mappedIndices: Record<string, number> = {}; // systemKey -> colIndex
  const recognizedColumns: { excelHeader: string; systemFieldKey: string; systemFieldLabel: string; coveragePercentage: number }[] = [];
  const unrecognizedColumns: UnrecognizedColumn[] = [];
  const usedColIndices = new Set<number>();

  SYSTEM_FIELDS.forEach(sf => {
    let foundIndex = -1;
    for (let c = 0; c < rawHeaders.length; c++) {
      const headerText = rawHeaders[c];
      if (!headerText) continue;
      const cleanHeader = cleanString(headerText);
      const isAliasMatch = sf.aliases.some(alias => cleanString(alias) === cleanHeader);
      
      if (isAliasMatch) {
        foundIndex = c;
        break;
      }
    }

    if (foundIndex !== -1) {
      mappedIndices[sf.key] = foundIndex;
      usedColIndices.add(foundIndex);
    }
  });

  // Identify unrecognized columns
  rawHeaders.forEach((headerText, cIndex) => {
    if (!headerText) return;
    if (!usedColIndices.has(cIndex)) {
      // Pick a sample value from row 1
      const sampleRow = rawRows[headerRowIdx + 1];
      const sampleValue = sampleRow && sampleRow[cIndex] ? sampleRow[cIndex].toString() : '';
      
      unrecognizedColumns.push({
        id: `unrec-${cIndex}`,
        excelHeader: headerText,
        columnIndex: cIndex,
        sampleValue,
        action: 'ignore'
      });
    }
  });

  // Missing mandatory columns check
  const missingMandatoryColumns: string[] = [];
  SYSTEM_FIELDS.filter(sf => sf.isMandatory).forEach(sf => {
    if (mappedIndices[sf.key] === undefined) {
      missingMandatoryColumns.push(sf.label);
    }
  });

  // Rows processing
  const dataRows = rawRows.slice(headerRowIdx + 1).filter(r => 
    Array.isArray(r) && r.some(cell => cell !== undefined && cell !== null && cell.toString().trim() !== '')
  );

  const totalRows = dataRows.length;
  const records: RecordValidationDetail[] = [];
  const seenCedulas = new Map<string, number>(); // cedula -> firstExcelRowNumber
  const seenRowHashes = new Map<string, number>(); // hash -> firstExcelRowNumber

  let totalValidRecords = 0;
  let totalWarningRecords = 0;
  let totalErrorRecords = 0;
  let totalNoDataRecords = 0;

  // Track per-field counts
  const fieldMetricsMap: Record<string, FieldQualityMetric> = {};
  SYSTEM_FIELDS.forEach(sf => {
    fieldMetricsMap[sf.key] = {
      fieldName: sf.key,
      fieldLabel: sf.label,
      category: sf.category,
      isMandatory: sf.isMandatory,
      excelHeaderMapped: mappedIndices[sf.key] !== undefined ? rawHeaders[mappedIndices[sf.key]] : undefined,
      totalRecords: totalRows,
      validRecords: 0,
      emptyRecords: 0,
      errorRecords: 0,
      warningRecords: 0,
      coveragePercentage: 0
    };
  });

  // Process each row
  dataRows.forEach((rowArray, rIdx) => {
    const excelRowNumber = headerRowIdx + rIdx + 2;
    const originalRowData: Record<string, any> = {};
    rawHeaders.forEach((hdr, cIdx) => {
      if (hdr) originalRowData[hdr] = rowArray[cIdx];
    });

    const parsedFields: Record<string, any> = {};
    const issues: CellValidationIssue[] = [];
    const reasons: string[] = [];

    let rowHasError = false;
    let rowHasWarning = false;
    let rowHasNoData = false;

    // Check duplicate full row
    const rowSerialized = rowArray.map(c => c === undefined || c === null ? '' : c.toString().trim()).join('|');
    if (seenRowHashes.has(rowSerialized)) {
      const prevRow = seenRowHashes.get(rowSerialized)!;
      rowHasWarning = true;
      reasons.push(`Fila con datos duplicados respecto a la fila ${prevRow}`);
      issues.push({
        columnKey: 'registro',
        columnLabel: 'Registro Completo',
        originalValue: 'Registro repetido',
        status: 'WARNING',
        issueType: 'DUPLICADO',
        description: `Este registro tiene exactamente la misma información que el registro de la fila ${prevRow}.`
      });
    } else {
      seenRowHashes.set(rowSerialized, excelRowNumber);
    }

    // Validate each field
    SYSTEM_FIELDS.forEach(sf => {
      const colIdx = mappedIndices[sf.key];
      const metric = fieldMetricsMap[sf.key];
      
      if (colIdx === undefined) {
        // Field column doesn't exist in Excel
        if (sf.isMandatory) {
          rowHasError = true;
          reasons.push(`Falta columna obligatoria: ${sf.label}`);
          metric.errorRecords++;
        } else {
          metric.emptyRecords++;
        }
        parsedFields[sf.key] = null;
        return;
      }

      const rawCellVal = rowArray[colIdx];
      
      if (isValueEmpty(rawCellVal)) {
        metric.emptyRecords++;
        parsedFields[sf.key] = null;
        
        if (sf.isMandatory) {
          rowHasError = true;
          reasons.push(`Campo obligatorio '${sf.label}' está vacío`);
          issues.push({
            columnKey: sf.key,
            columnLabel: sf.label,
            originalValue: rawCellVal,
            status: 'ERROR',
            issueType: 'VACIO',
            description: `El campo obligatorio '${sf.label}' no contiene información.`
          });
          metric.errorRecords++;
        } else {
          rowHasNoData = true;
        }
        return;
      }

      // Non-empty value validation according to field type
      const rawStr = rawCellVal.toString().trim();

      // 1. Cédula / Identificador
      if (sf.key === 'cedula') {
        parsedFields[sf.key] = rawStr;
        if (seenCedulas.has(rawStr)) {
          const prevRow = seenCedulas.get(rawStr)!;
          rowHasError = true;
          reasons.push(`Identificador Cédula '${rawStr}' duplicado con fila ${prevRow}`);
          issues.push({
            columnKey: sf.key,
            columnLabel: sf.label,
            originalValue: rawStr,
            status: 'ERROR',
            issueType: 'DUPLICADO',
            description: `La cédula '${rawStr}' ya existe en el registro de la fila ${prevRow}.`
          });
          metric.errorRecords++;
        } else {
          seenCedulas.set(rawStr, excelRowNumber);
          metric.validRecords++;
        }
      }

      // 2. Edad
      else if (sf.key === 'edad') {
        const numAge = parseFloat(rawStr);
        if (isNaN(numAge) || numAge <= 0 || numAge > 100) {
          rowHasError = true;
          reasons.push(`Edad '${rawStr}' fuera de rango lógico (15-100)`);
          issues.push({
            columnKey: sf.key,
            columnLabel: sf.label,
            originalValue: rawStr,
            status: 'ERROR',
            issueType: 'FUERA_DE_RANGO',
            description: `Edad (${rawStr}) no es un valor biológicamente válido.`,
            suggestion: 'Revisar fecha de nacimiento o corregir número'
          });
          parsedFields[sf.key] = rawStr; // CONSERVAR VALOR ORIGINAL (REGLA 26)
          metric.errorRecords++;
        } else if (numAge < 18) {
          rowHasWarning = true;
          reasons.push(`Empleado menor de edad (${numAge} años)`);
          issues.push({
            columnKey: sf.key,
            columnLabel: sf.label,
            originalValue: rawStr,
            status: 'WARNING',
            issueType: 'FUERA_DE_RANGO',
            description: `El colaborador figura con ${numAge} años (menor de edad).`
          });
          parsedFields[sf.key] = numAge;
          metric.warningRecords++;
          metric.validRecords++;
        } else {
          parsedFields[sf.key] = numAge;
          metric.validRecords++;
        }
      }

      // 3. Estatura (Anthropometric Normalization RULE 12)
      else if (sf.key === 'estatura') {
        const cleanedStr = rawStr.replace(',', '.');
        const numVal = parseFloat(cleanedStr);

        if (isNaN(numVal) || numVal <= 0) {
          rowHasError = true;
          reasons.push(`Estatura '${rawStr}' no es un valor numérico válido`);
          issues.push({
            columnKey: sf.key,
            columnLabel: sf.label,
            originalValue: rawStr,
            status: 'ERROR',
            issueType: 'FORMATO_INVALIDO',
            description: `La estatura '${rawStr}' contiene caracteres no numéricos o un valor menor o igual a cero.`,
            suggestion: 'Ingrese la estatura en metros (ej. 1.72) o en centímetros (ej. 172)'
          });
          parsedFields[sf.key] = rawStr; // Preserve original
          metric.errorRecords++;
        } else {
          // Detect unit: centimeters vs meters
          let heightInMeters = numVal;
          let unitNormalizedNotice = false;

          if (numVal >= 100 && numVal <= 230) {
            heightInMeters = numVal / 100;
            unitNormalizedNotice = true;
          } else if (numVal >= 1.0 && numVal <= 2.3) {
            heightInMeters = numVal;
          } else {
            rowHasError = true;
            reasons.push(`Estatura '${rawStr}' fuera de rango antropométrico válido (1.00m - 2.30m)`);
            issues.push({
              columnKey: sf.key,
              columnLabel: sf.label,
              originalValue: rawStr,
              status: 'ERROR',
              issueType: 'FUERA_DE_RANGO',
              description: `Estatura fuera de rango coherente.`
            });
            parsedFields[sf.key] = rawStr;
            metric.errorRecords++;
            return;
          }

          parsedFields[sf.key] = Number(heightInMeters.toFixed(2));
          metric.validRecords++;

          if (unitNormalizedNotice) {
            issues.push({
              columnKey: sf.key,
              columnLabel: sf.label,
              originalValue: rawStr,
              status: 'VALID',
              issueType: 'UNIDAD_NORMALIZADA',
              description: `Estatura en centímetros (${rawStr} cm) normalizada a unidad estándar (${heightInMeters.toFixed(2)} m) conservando el valor original.`
            });
          }
        }
      }

      // 4. Peso (Anthropometric Validation RULE 12)
      else if (sf.key === 'peso') {
        const numVal = parseFloat(rawStr.replace(',', '.'));
        if (isNaN(numVal) || numVal <= 0) {
          rowHasError = true;
          reasons.push(`Peso '${rawStr}' es inválido`);
          issues.push({
            columnKey: sf.key,
            columnLabel: sf.label,
            originalValue: rawStr,
            status: 'ERROR',
            issueType: 'FORMATO_INVALIDO',
            description: `Valor de peso inválido.`
          });
          parsedFields[sf.key] = rawStr;
          metric.errorRecords++;
        } else if (numVal < 35 || numVal > 180) {
          rowHasWarning = true;
          reasons.push(`Peso '${numVal} kg' fuera de rango común (35 - 180 kg)`);
          issues.push({
            columnKey: sf.key,
            columnLabel: sf.label,
            originalValue: rawStr,
            status: 'WARNING',
            issueType: 'FUERA_DE_RANGO',
            description: `El peso especificado (${numVal} kg) es inusualmente alto o bajo.`
          });
          parsedFields[sf.key] = numVal;
          metric.warningRecords++;
          metric.validRecords++;
        } else {
          parsedFields[sf.key] = numVal;
          metric.validRecords++;
        }
      }

      // 5. Catalog Validations (Laboral: Sede, Área, Proyecto, Cargo, TipoContrato, etc. RULE 10)
      else if (['sede', 'area', 'proyecto', 'proceso', 'cargo', 'tipoContrato'].includes(sf.key)) {
        parsedFields[sf.key] = rawStr;

        // Check catalog if active in catalogContext
        let catalogList: string[] | undefined;
        if (sf.key === 'sede') catalogList = catalogContext.sedes;
        else if (sf.key === 'area') catalogList = catalogContext.areas;
        else if (sf.key === 'proceso') catalogList = catalogContext.procesos;
        else if (sf.key === 'proyecto') catalogList = catalogContext.proyectos;
        else if (sf.key === 'cargo') catalogList = catalogContext.cargos;
        else if (sf.key === 'tipoContrato') catalogList = catalogContext.tiposContrato;

        if (catalogList && catalogList.length > 0) {
          const match = catalogList.some(item => cleanString(item) === cleanString(rawStr));
          if (!match) {
            rowHasError = true;
            const sugg = findCatalogSuggestion(rawStr, catalogList);
            reasons.push(`${sf.label} '${rawStr}' no existe en el catálogo registrado de la empresa`);
            issues.push({
              columnKey: sf.key,
              columnLabel: sf.label,
              originalValue: rawStr,
              status: 'ERROR',
              issueType: 'CATALOGO_INEXISTENTE',
              description: `El valor '${rawStr}' no está registrado en el catálogo oficial de ${sf.label.toLowerCase()}s de la compañía.`,
              suggestion: sugg ? `Sugerencia: "${sugg}"` : undefined
            });
            metric.errorRecords++;
          } else {
            metric.validRecords++;
          }
        } else {
          metric.validRecords++;
        }
      }

      // Default string/other fields
      else {
        parsedFields[sf.key] = rawStr;
        metric.validRecords++;
      }
    });

    // 6. IMC Calculation RULE 13: Calculated ONLY IF Peso and Estatura are valid
    const pesoVal = parsedFields['peso'];
    const estaturaVal = parsedFields['estatura'];

    if (typeof pesoVal === 'number' && typeof estaturaVal === 'number' && pesoVal > 0 && estaturaVal > 0) {
      const imc = pesoVal / (estaturaVal * estaturaVal);
      parsedFields['imc'] = Number(imc.toFixed(1));
    } else {
      parsedFields['imc'] = null; // RULE 13: Never use estimated weight or height!
    }

    // Record Classification (VALID, WARNING, ERROR, NO_DATA)
    let finalRowStatus: ValidationStatus = 'VALID';

    if (rowHasError) {
      finalRowStatus = 'ERROR';
      totalErrorRecords++;
    } else if (rowHasWarning) {
      finalRowStatus = 'WARNING';
      totalWarningRecords++;
    } else if (rowHasNoData) {
      finalRowStatus = 'NO_DATA';
      totalNoDataRecords++;
    } else {
      finalRowStatus = 'VALID';
      totalValidRecords++;
    }

    records.push({
      rowNumber: excelRowNumber,
      originalRowData,
      parsedFields,
      status: finalRowStatus,
      reasons,
      issues
    });
  });

  // Calculate Field Coverage percentages
  const matrix: FieldQualityMetric[] = Object.values(fieldMetricsMap).map(m => {
    const filled = m.totalRecords - m.emptyRecords;
    const cov = m.totalRecords > 0 ? (filled / m.totalRecords) * 100 : 0;
    return {
      ...m,
      coveragePercentage: Number(cov.toFixed(1))
    };
  });

  // Recognized columns mapping detail
  SYSTEM_FIELDS.forEach(sf => {
    if (mappedIndices[sf.key] !== undefined) {
      const metric = fieldMetricsMap[sf.key];
      recognizedColumns.push({
        excelHeader: rawHeaders[mappedIndices[sf.key]],
        systemFieldKey: sf.key,
        systemFieldLabel: sf.label,
        coveragePercentage: metric ? metric.coveragePercentage : 100
      });
    }
  });

  // Calculate overall Quality Percentage according to formula
  // qualityPercentage = 100 - (1 * incomplete) - (2 * errors) - (5 * missingMandatory)
  const missingMandatoryCount = missingMandatoryColumns.length;
  let rawQuality = 100 
    - (0.3 * (totalNoDataRecords / Math.max(1, totalRows)) * 100) 
    - (2 * (totalErrorRecords / Math.max(1, totalRows)) * 100) 
    - (10 * missingMandatoryCount);
  
  const qualityPercentage = Math.max(0, Math.min(100, Math.round(rawQuality)));

  let qualityLevel: 'Excelente' | 'Buena' | 'Regular' | 'Deficiente' = 'Excelente';
  if (qualityPercentage >= 95) qualityLevel = 'Excelente';
  else if (qualityPercentage >= 80) qualityLevel = 'Buena';
  else if (qualityPercentage >= 50) qualityLevel = 'Regular';
  else qualityLevel = 'Deficiente';

  // Section 28: AI Quality Diagnosis
  const weightMetric = fieldMetricsMap['peso'];
  const heightMetric = fieldMetricsMap['estatura'];
  const anthroCoverage = weightMetric && heightMetric 
    ? Math.round((weightMetric.coveragePercentage + heightMetric.coveragePercentage) / 2)
    : 0;

  const validAnthroCount = Math.min(weightMetric?.validRecords || 0, heightMetric?.validRecords || 0);

  const aiDiagnosis: AIQualityDiagnosis = {
    overallPercentage: qualityPercentage,
    qualityLevel,
    narrative: `El archivo "${fileName}" contiene ${totalRows} registros analizados. Presenta un índice de calidad global del ${qualityPercentage}% (${qualityLevel}). Se identificaron ${totalValidRecords} registros 100% válidos, ${totalWarningRecords} con advertencias y ${totalErrorRecords} con errores de catálogo o tipo de datos.`,
    anthropometricCoverageText: `El archivo presenta una cobertura del ${anthroCoverage}% en información antropométrica. Los indicadores de IMC deberán interpretarse únicamente sobre los ${validAnthroCount} registros con peso y estatura válidos.`,
    laborCoverageText: missingMandatoryColumns.length === 0 
      ? 'La estructura contiene el 100% de los campos obligatorios de identificación y estructura laboral requeridos por el sistema.' 
      : `Faltan las siguientes columnas obligatorias para caracterización laboral: ${missingMandatoryColumns.join(', ')}.`,
    recommendationsForSST: [
      `Verificar los ${totalErrorRecords} registros con errores de catálogo para asegurar alineación con la estructura organizacional de la empresa.`,
      `Descargar el 'Reporte de Errores Excel' para corregir los registros rechazados directamente en la planilla de origen.`,
      `Proceder a importar únicamente registros válidos para garantizar la veracidad de los indicadores gerenciales.`
    ],
    disclaimer: 'REGLA ABSOLUTA ACTIVA: La IA y el sistema NO han creado información sintética ni rellenado celdas vacías. Todos los registros conservan estrictamente la información original ingresada por el usuario.'
  };

  return {
    fileName,
    fileSize: `${(arrayBuffer.byteLength / 1024).toFixed(1)} KB`,
    totalRows,
    detectedColumnsCount: rawHeaders.filter(h => h.trim() !== '').length,
    validRecordsCount: totalValidRecords,
    warningRecordsCount: totalWarningRecords,
    errorRecordsCount: totalErrorRecords,
    noDataRecordsCount: totalNoDataRecords,
    qualityPercentage,
    qualityLevel,
    recognizedColumns,
    unrecognizedColumns,
    missingMandatoryColumns,
    matrix,
    records,
    aiDiagnosis
  };
}

// Generate Error Report Excel (.xlsx buffer) for download Section 23
export function generateErrorReportExcel(summary: ExcelValidationSummary): Uint8Array {
  const errorRows: ErrorReportRow[] = [];

  summary.records.forEach(rec => {
    if (rec.issues && rec.issues.length > 0) {
      rec.issues.forEach(issue => {
        errorRows.push({
          originalRow: rec.rowNumber,
          column: issue.columnLabel,
          value: issue.originalValue !== undefined && issue.originalValue !== null ? String(issue.originalValue) : '(Vacío)',
          errorType: issue.issueType,
          description: issue.description,
          suggestion: issue.suggestion || 'Revisar datos de origen'
        });
      });
    }
  });

  const wsData = [
    ['Fila Original', 'Columna / Campo', 'Valor Leído', 'Tipo de Error', 'Descripción del Hallazgo', 'Sugerencia de Corrección'],
    ...errorRows.map(r => [
      r.originalRow,
      r.column,
      r.value,
      r.errorType,
      r.description,
      r.suggestion
    ])
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte de Errores SG-SST');

  const excelBuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(excelBuf);
}
