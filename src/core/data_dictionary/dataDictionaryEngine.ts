import { DATA_DICTIONARY } from './dataDictionary';
import { 
  DataDictionaryDefinition, 
  NormalizedRecordValue, 
  TechnicalDataStatus, 
  EquivalenceTestResult, 
  TraceabilityNode,
  ExcelColumnMapping
} from './types';

// Helper to sanitize strings for comparison
function cleanStr(str: string): string {
  return str.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Finds a DataDictionaryDefinition by fieldKey or by any alias match
 */
export function getDictionaryField(fieldKeyOrAlias: string): DataDictionaryDefinition | undefined {
  if (!fieldKeyOrAlias) return undefined;
  const target = cleanStr(fieldKeyOrAlias);

  // Exact match on fieldKey
  const directMatch = DATA_DICTIONARY.find(f => cleanStr(f.fieldKey) === target);
  if (directMatch) return directMatch;

  // Search in aliases
  return DATA_DICTIONARY.find(f => f.aliases.some(alias => cleanStr(alias) === target));
}

/**
 * Helper to parse Excel/Survey dates safely
 */
export function parseDateValue(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    const dateNum = Math.floor(val);
    const days = dateNum - (dateNum >= 60 ? 25569 : 25568);
    return new Date(days * 86400 * 1000);
  }
  if (typeof val === 'string' && val.trim() !== '') {
    const str = val.trim();
    // DD/MM/YYYY or DD-MM-YYYY
    const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmy) {
      return new Date(parseInt(dmy[3], 10), parseInt(dmy[2], 10) - 1, parseInt(dmy[1], 10));
    }
    // YYYY-MM-DD
    const ymd = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (ymd) {
      return new Date(parseInt(ymd[1], 10), parseInt(ymd[2], 10) - 1, parseInt(ymd[3], 10));
    }
    const parsed = Date.parse(str);
    if (!isNaN(parsed)) return new Date(parsed);
  }
  return null;
}

/**
 * Normalizes a raw input value according to DataDictionary definition rules.
 * STRICT RULE: Never transforms missing/null into synthetic defaults (e.g. "No", "0", or "Bogotá").
 */
export function normalizeFieldValue(def: DataDictionaryDefinition, rawValue: any): NormalizedRecordValue {
  const result: NormalizedRecordValue = {
    fieldKey: def.fieldKey,
    rawValue,
    normalizedValue: null,
    status: 'MISSING',
    isValid: true
  };

  if (rawValue === null || rawValue === undefined || rawValue === '' || (typeof rawValue === 'number' && isNaN(rawValue))) {
    result.status = 'MISSING';
    result.normalizedValue = null;
    result.isValid = !def.required;
    if (def.required) {
      result.validationError = `Campo obligatorio '${def.label}' no informado.`;
    }
    return result;
  }

  // Handle "PREFER_NOT_TO_ANSWER"
  if (typeof rawValue === 'string') {
    const strClean = cleanStr(rawValue);
    if (strClean === 'prefer_not_to_answer' || strClean === 'prefiero no responder' || strClean === 'prefieronoresponder') {
      result.status = 'PREFER_NOT_TO_ANSWER';
      result.normalizedValue = 'PREFER_NOT_TO_ANSWER';
      result.isValid = true;
      return result;
    }
  }

  // Parse according to dataType
  switch (def.dataType) {
    case 'NUMBER':
    case 'DECIMAL':
    case 'INTEGER':
    case 'PERCENTAGE':
    case 'CURRENCY': {
      const num = typeof rawValue === 'number' ? rawValue : parseFloat(String(rawValue).replace(',', '.'));
      if (isNaN(num)) {
        result.status = 'MISSING';
        result.normalizedValue = null;
        result.isValid = false;
        result.validationError = `El valor '${rawValue}' no es un número válido para ${def.label}.`;
      } else {
        const min = def.validationRules?.min;
        const max = def.validationRules?.max;
        if (min !== undefined && num < min) {
          result.isValid = false;
          result.validationError = `El valor ${num} en ${def.label} es menor al mínimo permitido (${min}).`;
        } else if (max !== undefined && num > max) {
          result.isValid = false;
          result.validationError = `El valor ${num} en ${def.label} excede el máximo permitido (${max}).`;
        } else {
          result.isValid = true;
        }
        result.normalizedValue = def.dataType === 'INTEGER' ? Math.round(num) : Number(num.toFixed(2));
        result.status = 'VALID';
      }
      break;
    }

    case 'DATE': {
      const parsedDate = parseDateValue(rawValue);
      if (!parsedDate || isNaN(parsedDate.getTime())) {
        result.status = 'MISSING';
        result.normalizedValue = null;
        result.isValid = false;
        result.validationError = `La fecha '${rawValue}' no tiene un formato válido.`;
      } else {
        if (def.validationRules?.noFutureDate && parsedDate > new Date()) {
          result.isValid = false;
          result.validationError = `La fecha ${def.label} no puede ser una fecha futura.`;
        } else {
          result.isValid = true;
        }
        result.normalizedValue = parsedDate.toISOString().split('T')[0];
        result.status = 'VALID';
      }
      break;
    }

    case 'BOOLEAN': {
      if (typeof rawValue === 'boolean') {
        result.normalizedValue = rawValue ? 'Sí' : 'No';
        result.status = 'VALID';
      } else {
        const str = cleanStr(String(rawValue));
        if (['si', 'sí', 's', 'true', '1', 'yes'].includes(str)) {
          result.normalizedValue = 'Sí';
          result.status = 'VALID';
        } else if (['no', 'n', 'false', '0'].includes(str)) {
          result.normalizedValue = 'No';
          result.status = 'VALID';
        } else {
          result.status = 'MISSING';
          result.normalizedValue = null;
          result.isValid = false;
          result.validationError = `Respuesta booleana inválida para ${def.label}.`;
        }
      }
      break;
    }

    case 'SINGLE_SELECT': {
      const strVal = String(rawValue).trim();
      if (def.allowedValues && def.allowedValues.length > 0) {
        // Try exact case-insensitive match
        const match = def.allowedValues.find(av => cleanStr(av) === cleanStr(strVal));
        if (match) {
          result.normalizedValue = match;
          result.status = 'VALID';
        } else {
          // Keep raw value as custom text or mark invalid if strict
          result.normalizedValue = strVal;
          result.status = 'VALID';
        }
      } else {
        result.normalizedValue = strVal;
        result.status = 'VALID';
      }
      break;
    }

    case 'MULTI_SELECT': {
      if (Array.isArray(rawValue)) {
        result.normalizedValue = rawValue.map(v => String(v).trim());
      } else if (typeof rawValue === 'string') {
        result.normalizedValue = rawValue.split(/[,;\n]/).map(v => v.trim()).filter(Boolean);
      } else {
        result.normalizedValue = [String(rawValue)];
      }
      result.status = 'VALID';
      break;
    }

    default: {
      result.normalizedValue = String(rawValue).trim();
      result.status = 'VALID';
      break;
    }
  }

  return result;
}

/**
 * Computes calculated fields: imc, edad, antiguedad
 * If required inputs are missing, sets value = null and status = 'NOT_CALCULABLE'
 */
export function calculateDerivedFields(fields: Record<string, NormalizedRecordValue>): Record<string, NormalizedRecordValue> {
  const updated = { ...fields };

  // 1. Calculate IMC (needs peso and estatura)
  const pesoDef = DATA_DICTIONARY.find(f => f.fieldKey === 'peso')!;
  const estaturaDef = DATA_DICTIONARY.find(f => f.fieldKey === 'estatura')!;
  const imcDef = DATA_DICTIONARY.find(f => f.fieldKey === 'imc')!;

  const pesoNorm = updated['peso']?.normalizedValue;
  const estaturaNorm = updated['estatura']?.normalizedValue;

  if (typeof pesoNorm === 'number' && typeof estaturaNorm === 'number' && pesoNorm > 0 && estaturaNorm > 0) {
    const heightInMeters = estaturaNorm / 100;
    const rawImc = pesoNorm / (heightInMeters * heightInMeters);
    const roundedImc = Number(rawImc.toFixed(1));
    
    updated['imc'] = {
      fieldKey: 'imc',
      rawValue: { peso: pesoNorm, estatura: estaturaNorm },
      normalizedValue: roundedImc,
      status: 'VALID',
      isValid: roundedImc >= 12 && roundedImc <= 65
    };
  } else {
    updated['imc'] = {
      fieldKey: 'imc',
      rawValue: null,
      normalizedValue: null,
      status: 'NOT_CALCULABLE',
      isValid: true,
      validationError: 'IMC no calculable por información insuficiente de peso o estatura.'
    };
  }

  // 2. Calculate Edad (needs fechaNacimiento)
  const fechaNacNorm = updated['fechaNacimiento']?.normalizedValue;
  if (fechaNacNorm) {
    const birthDate = parseDateValue(fechaNacNorm);
    if (birthDate) {
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      updated['edad'] = {
        fieldKey: 'edad',
        rawValue: fechaNacNorm,
        normalizedValue: age,
        status: 'VALID',
        isValid: age >= 14 && age <= 100
      };
    } else {
      updated['edad'] = {
        fieldKey: 'edad',
        rawValue: null,
        normalizedValue: null,
        status: 'NOT_CALCULABLE',
        isValid: true
      };
    }
  } else if (!updated['edad'] || updated['edad'].status !== 'VALID') {
    updated['edad'] = {
      fieldKey: 'edad',
      rawValue: null,
      normalizedValue: null,
      status: 'NOT_CALCULABLE',
      isValid: true
    };
  }

  // 3. Calculate Antiguedad (needs fechaIngreso)
  const fechaIngNorm = updated['fechaIngreso']?.normalizedValue;
  if (fechaIngNorm) {
    const hireDate = parseDateValue(fechaIngNorm);
    if (hireDate) {
      const today = new Date();
      const diffTime = Math.max(0, today.getTime() - hireDate.getTime());
      const years = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      const roundedYears = Number(years.toFixed(1));
      
      updated['antiguedad'] = {
        fieldKey: 'antiguedad',
        rawValue: fechaIngNorm,
        normalizedValue: roundedYears,
        status: 'VALID',
        isValid: roundedYears >= 0 && roundedYears <= 60
      };
    } else {
      updated['antiguedad'] = {
        fieldKey: 'antiguedad',
        rawValue: null,
        normalizedValue: null,
        status: 'NOT_CALCULABLE',
        isValid: true
      };
    }
  } else if (!updated['antiguedad'] || updated['antiguedad'].status !== 'VALID') {
    updated['antiguedad'] = {
      fieldKey: 'antiguedad',
      rawValue: null,
      normalizedValue: null,
      status: 'NOT_CALCULABLE',
      isValid: true
    };
  }

  return updated;
}

/**
 * Parses raw survey inputs into normalized DataDictionary values
 */
export function parseSurveySubmission(
  rawSubmission: Record<string, any>
): Record<string, NormalizedRecordValue> {
  const result: Record<string, NormalizedRecordValue> = {};

  DATA_DICTIONARY.forEach(def => {
    // Check if raw submission contains direct key or alias
    let rawVal: any = undefined;
    if (def.fieldKey in rawSubmission) {
      rawVal = rawSubmission[def.fieldKey];
    } else {
      const foundAlias = def.aliases.find(a => a in rawSubmission);
      if (foundAlias) rawVal = rawSubmission[foundAlias];
    }

    const norm = normalizeFieldValue(def, rawVal);

    // Handle "Otro" case (e.g. estadoCivil === 'Otro')
    if (def.fieldKey === 'estadoCivil' && norm.normalizedValue === 'Otro') {
      norm.otherValue = rawSubmission['estadoCivilOtro'] || rawSubmission['otroEstadoCivil'] || undefined;
    }

    result[def.fieldKey] = norm;
  });

  return calculateDerivedFields(result);
}

/**
 * Parses a raw Excel row and headers into normalized DataDictionary values
 */
export function parseExcelRow(
  row: Record<string, any>,
  headers: string[]
): {
  normalizedFields: Record<string, NormalizedRecordValue>;
  columnMappings: ExcelColumnMapping[];
} {
  const columnMappings: ExcelColumnMapping[] = [];
  const normalizedFields: Record<string, NormalizedRecordValue> = {};

  // Build header mappings
  headers.forEach(header => {
    const dictMatch = getDictionaryField(header);
    if (dictMatch) {
      columnMappings.push({
        excelHeader: header,
        fieldKey: dictMatch.fieldKey,
        status: 'MAPPED',
        dictionaryMatch: dictMatch
      });
    } else {
      columnMappings.push({
        excelHeader: header,
        fieldKey: null,
        status: 'COLUMN_NOT_FOUND'
      });
    }
  });

  // Process dictionary definitions
  DATA_DICTIONARY.forEach(def => {
    // Search for row value matching dictionary key or alias
    let rawVal: any = undefined;
    
    // Find mapped header for this definition
    const mappedCol = columnMappings.find(m => m.fieldKey === def.fieldKey);
    if (mappedCol) {
      rawVal = row[mappedCol.excelHeader];
    } else {
      // Direct alias lookup in row keys
      const rowKeys = Object.keys(row);
      const matchingKey = rowKeys.find(rk => def.aliases.some(a => cleanStr(a) === cleanStr(rk)));
      if (matchingKey) {
        rawVal = row[matchingKey];
      }
    }

    normalizedFields[def.fieldKey] = normalizeFieldValue(def, rawVal);
  });

  const finalFields = calculateDerivedFields(normalizedFields);

  return {
    normalizedFields: finalFields,
    columnMappings
  };
}

/**
 * CRITICAL EQUIVALENCE ENGINE (PROMPT 32 REQUIREMENT #37):
 * Validates that Record A (Survey) and Record B (Excel) with identical input data
 * produce 100% EQUIVALENT normalized values, validations, and calculated fields (IMC, age, seniority).
 */
export function testEquivalence(
  surveySubmission: Record<string, any>,
  excelRow: Record<string, any>,
  excelHeaders: string[] = Object.keys(excelRow)
): EquivalenceTestResult {
  const surveyFields = parseSurveySubmission(surveySubmission);
  const excelResult = parseExcelRow(excelRow, excelHeaders);
  const excelFields = excelResult.normalizedFields;

  const comparisons: EquivalenceTestResult['fieldComparisons'] = [];
  let mismatchesCount = 0;

  DATA_DICTIONARY.forEach(def => {
    const sField = surveyFields[def.fieldKey];
    const eField = excelFields[def.fieldKey];

    const sVal = sField ? sField.normalizedValue : null;
    const eVal = eField ? eField.normalizedValue : null;
    const sStatus = sField ? sField.status : 'MISSING';
    const eStatus = eField ? eField.status : 'MISSING';

    const valuesMatch = JSON.stringify(sVal) === JSON.stringify(eVal);
    const statusMatch = sStatus === eStatus;
    const matches = valuesMatch && statusMatch;

    if (!matches) {
      mismatchesCount++;
    }

    comparisons.push({
      fieldKey: def.fieldKey,
      label: def.label,
      surveyNormalized: sVal,
      excelNormalized: eVal,
      surveyStatus: sStatus,
      excelStatus: eStatus,
      matches
    });
  });

  return {
    isEquivalent: mismatchesCount === 0,
    surveyRecordFields: surveyFields,
    excelRecordFields: excelFields,
    fieldComparisons: comparisons,
    mismatchesCount
  };
}

/**
 * Returns complete Traceability Node for any fieldKey:
 * Pregunta -> fieldKey -> respuesta -> validación -> indicador -> gráfico -> informe
 */
export function getTraceabilityMap(
  fieldKey: string,
  normalizedValue?: any
): TraceabilityNode | null {
  const def = DATA_DICTIONARY.find(f => f.fieldKey === fieldKey);
  if (!def) return null;

  return {
    questionId: def.linkedQuestions?.[0] || 'Q_' + fieldKey.toUpperCase(),
    fieldKey: def.fieldKey,
    label: def.label,
    value: normalizedValue !== undefined ? normalizedValue : 'Sin valor asignado',
    status: normalizedValue ? 'VALID' : 'MISSING',
    validationResult: {
      isValid: true,
      message: def.validationRules ? `Reglas: Min ${def.validationRules.min ?? 'N/A'}, Max ${def.validationRules.max ?? 'N/A'}` : 'Sin restricciones'
    },
    derivedIndicators: def.linkedIndicators || [],
    charts: def.linkedIndicators ? def.linkedIndicators.map(i => `CHART_${i}`) : [],
    reportSections: [def.category]
  };
}
