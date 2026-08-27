/**
 * PROMPT 29 — CENTRAL DATA QUALITY VALIDATION ENGINE
 * Unified validation engine enforcing the mandatory flow:
 * SOURCE -> NORMALIZATION -> VALIDATION -> DATA QUALITY -> CLASSIFICATION -> INDICATORS -> DASHBOARD -> REPORT
 */

import {
  VariableDataStatus,
  BusinessModule,
  ALL_BUSINESS_MODULES,
  FieldValidationRecord,
  ModuleQualityScore,
  CompletenessThresholds,
  DuplicateRecordGroup,
  ExcelPreImportQuality,
  DataQualityDiagnostic
} from './types';

export interface FieldDefinition {
  fieldKey: string;
  variableName: string;
  moduleName: BusinessModule;
  isCritical: boolean;
  type: 'string' | 'number' | 'date' | 'boolean' | 'categorical';
  allowedValues?: string[];
  minNum?: number;
  maxNum?: number;
}

// Master list of system field definitions across 8 modules
export const MASTER_FIELD_DEFINITIONS: FieldDefinition[] = [
  // 1. Sociodemográfico
  { fieldKey: 'numeroIdentificacion', variableName: 'Número de Identificación / Cédula', moduleName: 'Sociodemográfico', isCritical: true, type: 'string' },
  { fieldKey: 'primerNombre', variableName: 'Primer Nombre', moduleName: 'Sociodemográfico', isCritical: true, type: 'string' },
  { fieldKey: 'primerApellido', variableName: 'Primer Apellido', moduleName: 'Sociodemográfico', isCritical: true, type: 'string' },
  { fieldKey: 'sexo', variableName: 'Sexo / Género', moduleName: 'Sociodemográfico', isCritical: true, type: 'categorical', allowedValues: ['Masculino', 'Femenino', 'Intersexual', 'Otro', 'Prefiero no responder'] },
  { fieldKey: 'fechaNacimiento', variableName: 'Fecha de Nacimiento', moduleName: 'Sociodemográfico', isCritical: true, type: 'date' },
  { fieldKey: 'edad', variableName: 'Edad Calculada', moduleName: 'Sociodemográfico', isCritical: true, type: 'number', minNum: 18, maxNum: 100 },
  { fieldKey: 'estadoCivil', variableName: 'Estado Civil', moduleName: 'Sociodemográfico', isCritical: false, type: 'categorical' },
  { fieldKey: 'nivelEducativo', variableName: 'Nivel Educativo', moduleName: 'Sociodemográfico', isCritical: false, type: 'categorical' },
  { fieldKey: 'estrato', variableName: 'Estrato Socioeconómico', moduleName: 'Sociodemográfico', isCritical: false, type: 'number', minNum: 1, maxNum: 6 },
  { fieldKey: 'ciudadResidencia', variableName: 'Ciudad de Residencia', moduleName: 'Sociodemográfico', isCritical: false, type: 'string' },

  // 2. Laboral
  { fieldKey: 'fechaIngreso', variableName: 'Fecha de Ingreso a la Empresa', moduleName: 'Laboral', isCritical: true, type: 'date' },
  { fieldKey: 'antiguedadAnios', variableName: 'Antigüedad (Años)', moduleName: 'Laboral', isCritical: false, type: 'number', minNum: 0, maxNum: 60 },
  { fieldKey: 'tipoContrato', variableName: 'Tipo de Contrato', moduleName: 'Laboral', isCritical: true, type: 'categorical' },
  { fieldKey: 'modalidadTrabajo', variableName: 'Modalidad de Trabajo', moduleName: 'Laboral', isCritical: true, type: 'categorical' },
  { fieldKey: 'sede', variableName: 'Sede de Trabajo', moduleName: 'Laboral', isCritical: true, type: 'categorical' },
  { fieldKey: 'area', variableName: 'Área / Departamento', moduleName: 'Laboral', isCritical: true, type: 'categorical' },
  { fieldKey: 'proyecto', variableName: 'Proyecto / Operación BPO', moduleName: 'Laboral', isCritical: true, type: 'categorical' },
  { fieldKey: 'cargo', variableName: 'Cargo del Colaborador', moduleName: 'Laboral', isCritical: false, type: 'categorical' },
  { fieldKey: 'turnoTrabajo', variableName: 'Turno de Trabajo', moduleName: 'Laboral', isCritical: false, type: 'categorical' },
  { fieldKey: 'centroCosto', variableName: 'Centro de Costos', moduleName: 'Laboral', isCritical: false, type: 'string' },

  // 3. Familiar
  { fieldKey: 'personasACargo', variableName: 'Número de Personas a Cargo', moduleName: 'Familiar', isCritical: false, type: 'number', minNum: 0, maxNum: 20 },
  { fieldKey: 'tieneHijos', variableName: 'Tiene Hijos', moduleName: 'Familiar', isCritical: false, type: 'boolean' },
  { fieldKey: 'numeroHijos', variableName: 'Número de Hijos', moduleName: 'Familiar', isCritical: false, type: 'number', minNum: 0, maxNum: 15 },
  { fieldKey: 'personasHogar', variableName: 'Número de Personas en el Hogar', moduleName: 'Familiar', isCritical: false, type: 'number', minNum: 1, maxNum: 25 },
  { fieldKey: 'viveSolo', variableName: 'Vive Solo(a)', moduleName: 'Familiar', isCritical: false, type: 'boolean' },

  // 4. Vivienda
  { fieldKey: 'tipoVivienda', variableName: 'Tipo de Vivienda', moduleName: 'Vivienda', isCritical: false, type: 'categorical' },
  { fieldKey: 'aguaPotable', variableName: 'Cuenta con Agua Potable', moduleName: 'Vivienda', isCritical: false, type: 'boolean' },
  { fieldKey: 'alcantarillado', variableName: 'Cuenta con Alcantarillado', moduleName: 'Vivienda', isCritical: false, type: 'boolean' },

  // 5. Salud
  { fieldKey: 'pesoKg', variableName: 'Peso Corporal (kg)', moduleName: 'Salud', isCritical: true, type: 'number', minNum: 35, maxNum: 180 },
  { fieldKey: 'estaturaMts', variableName: 'Estatura (metros)', moduleName: 'Salud', isCritical: true, type: 'number', minNum: 1.0, maxNum: 2.3 },
  { fieldKey: 'imc', variableName: 'Índice de Masa Corporal (IMC)', moduleName: 'Salud', isCritical: false, type: 'number', minNum: 12, maxNum: 60 },
  { fieldKey: 'perimetroCinturaCm', variableName: 'Perímetro de Cintura (cm)', moduleName: 'Salud', isCritical: false, type: 'number', minNum: 40, maxNum: 200 },
  { fieldKey: 'condicionesSalud', variableName: 'Condiciones de Salud Declaradas', moduleName: 'Salud', isCritical: true, type: 'categorical' },
  { fieldKey: 'diagnosticos', variableName: 'Diagnósticos Médicos Declarados', moduleName: 'Salud', isCritical: false, type: 'string' },
  { fieldKey: 'medicamentos', variableName: 'Medicamentos Habituales', moduleName: 'Salud', isCritical: false, type: 'string' },
  { fieldKey: 'alergias', variableName: 'Alergias Conocidas', moduleName: 'Salud', isCritical: false, type: 'string' },
  { fieldKey: 'discapacidad', variableName: 'Condición de Discapacidad', moduleName: 'Salud', isCritical: false, type: 'string' },
  { fieldKey: 'dolorMuscular', variableName: 'Sintomatología de Dolor', moduleName: 'Salud', isCritical: false, type: 'string' },

  // 6. Hábitos
  { fieldKey: 'actividadFisica', variableName: 'Realiza Actividad Física', moduleName: 'Hábitos', isCritical: false, type: 'boolean' },
  { fieldKey: 'frecuenciaEjercicioSemanal', variableName: 'Frecuencia de Ejercicio (Días/Semana)', moduleName: 'Hábitos', isCritical: false, type: 'number', minNum: 0, maxNum: 7 },
  { fieldKey: 'fuma', variableName: 'Consumo de Tabaco / Cigarrillo', moduleName: 'Hábitos', isCritical: false, type: 'boolean' },
  { fieldKey: 'consumeAlcohol', variableName: 'Consumo de Alcohol', moduleName: 'Hábitos', isCritical: false, type: 'boolean' },
  { fieldKey: 'medioTransportePrincipal', variableName: 'Medio de Transporte Principal', moduleName: 'Hábitos', isCritical: false, type: 'categorical' },

  // 7. Osteomuscular
  { fieldKey: 'molestiaOsteomuscular', variableName: 'Presenta Molestias Osteomusculares', moduleName: 'Osteomuscular', isCritical: false, type: 'boolean' },
  { fieldKey: 'zonaDolorPrincipal', variableName: 'Zona de Dolor Principal', moduleName: 'Osteomuscular', isCritical: false, type: 'categorical' },

  // 8. Bienestar
  { fieldKey: 'nivelEstresPercibido', variableName: 'Nivel de Estrés Percibido', moduleName: 'Bienestar', isCritical: false, type: 'categorical' },
  { fieldKey: 'satisfaccionLaboral', variableName: 'Nivel de Satisfacción Laboral', moduleName: 'Bienestar', isCritical: false, type: 'categorical' }
];

export class DataQualityEnginePrompt29 {

  /**
   * Default threshold configuration: 90% Green, 70% Yellow, <70% Red
   */
  public static defaultThresholds: CompletenessThresholds = {
    greenMin: 90,
    yellowMin: 70
  };

  /**
   * 11. Normalizes Height (estatura): converts cm to meters if needed.
   * e.g., 165 -> 1.65, 1.65 -> 1.65
   */
  public static normalizeHeight(val: any): { normalized: number | null; raw: any } {
    if (val === null || val === undefined || val === '') return { normalized: null, raw: val };
    const num = Number(val);
    if (isNaN(num)) return { normalized: null, raw: val };

    // If height is entered in cm (> 30), divide by 100
    if (num > 30) {
      return { normalized: Number((num / 100).toFixed(2)), raw: val };
    }
    return { normalized: Number(num.toFixed(2)), raw: val };
  }

  /**
   * 9. Calculates Tenure (Antigüedad) from hire date without inventing.
   * If hire date is missing -> returns null with status 'NOT_PROVIDED'
   */
  public static calculateTenureYears(fechaIngresoStr: any): { tenureYears: number | null; status: VariableDataStatus } {
    if (!fechaIngresoStr || typeof fechaIngresoStr !== 'string') {
      return { tenureYears: null, status: 'NOT_PROVIDED' };
    }

    const hireDate = new Date(fechaIngresoStr);
    const now = new Date();

    if (isNaN(hireDate.getTime()) || hireDate > now) {
      return { tenureYears: null, status: 'INVALID' };
    }

    const diffMs = now.getTime() - hireDate.getTime();
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    return { tenureYears: Number(years.toFixed(1)), status: 'VALID' };
  }

  /**
   * 12. Calculates BMI (IMC) strictly when weight and height are valid.
   * If either is missing -> returns null and calculable = false
   */
  public static calculateIMC(pesoKg: number | null, estaturaMts: number | null): { imc: number | null; isCalculable: boolean } {
    if (pesoKg === null || estaturaMts === null || pesoKg <= 0 || estaturaMts <= 0) {
      return { imc: null, isCalculable: false };
    }
    const imcVal = pesoKg / (estaturaMts * estaturaMts);
    return { imc: Number(imcVal.toFixed(1)), isCalculable: true };
  }

  /**
   * Evaluates a single cell value for a defined field rule
   */
  public static validateCell(def: FieldDefinition, rawValue: any, rowContext: Record<string, any> = {}): FieldValidationRecord {
    const isOther = String(rawValue).trim().toLowerCase() === 'otro';
    let otherValue: string | undefined = undefined;

    if (isOther && rowContext[`${def.fieldKey}Otro`]) {
      otherValue = String(rowContext[`${def.fieldKey}Otro`]);
    }

    // 17. Explicit "Prefiero no responder"
    if (
      typeof rawValue === 'string' &&
      (rawValue.trim().toUpperCase() === 'PREFIERO NO RESPONDER' ||
       rawValue.trim().toUpperCase() === 'PREFIERO_NO_RESPONDER')
    ) {
      return {
        rowNumber: rowContext.rowNumber || 1,
        recordId: rowContext.id || rowContext.numeroIdentificacion,
        fieldKey: def.fieldKey,
        variableName: def.variableName,
        moduleName: def.moduleName,
        originalValue: rawValue,
        normalizedValue: null,
        status: 'PREFER_NOT_TO_ANSWER',
        isCritical: def.isCritical,
        isOther: false,
        reason: 'El colaborador eligió explícitamente no responder.'
      };
    }

    // Missing check
    if (rawValue === null || rawValue === undefined || String(rawValue).trim() === '') {
      return {
        rowNumber: rowContext.rowNumber || 1,
        recordId: rowContext.id || rowContext.numeroIdentificacion,
        fieldKey: def.fieldKey,
        variableName: def.variableName,
        moduleName: def.moduleName,
        originalValue: rawValue,
        normalizedValue: null,
        status: def.fieldKey === 'fechaIngreso' || def.fieldKey === 'antiguedadAnios' ? 'NOT_PROVIDED' : 'MISSING',
        isCritical: def.isCritical,
        isOther: false,
        reason: 'Valor no suministrado o celda vacía.'
      };
    }

    // 8. Date checks
    if (def.type === 'date') {
      const dateVal = new Date(rawValue);
      const now = new Date();

      if (isNaN(dateVal.getTime()) || dateVal > now) {
        return {
          rowNumber: rowContext.rowNumber || 1,
          recordId: rowContext.id,
          fieldKey: def.fieldKey,
          variableName: def.variableName,
          moduleName: def.moduleName,
          originalValue: rawValue,
          normalizedValue: null,
          status: 'INVALID',
          isCritical: def.isCritical,
          isOther: false,
          reason: dateVal > now ? 'Fecha futura imposible' : 'Estructura de fecha inválida'
        };
      }

      return {
        rowNumber: rowContext.rowNumber || 1,
        recordId: rowContext.id,
        fieldKey: def.fieldKey,
        variableName: def.variableName,
        moduleName: def.moduleName,
        originalValue: rawValue,
        normalizedValue: dateVal.toISOString().split('T')[0],
        status: 'VALID',
        isCritical: def.isCritical,
        isOther: false
      };
    }

    // 10 & 11. Height & Weight Range Normalization & Checks
    if (def.fieldKey === 'estaturaMts') {
      const normHeight = this.normalizeHeight(rawValue);
      if (normHeight.normalized === null) {
        return {
          rowNumber: rowContext.rowNumber || 1,
          fieldKey: def.fieldKey,
          variableName: def.variableName,
          moduleName: def.moduleName,
          originalValue: rawValue,
          normalizedValue: null,
          status: 'INVALID',
          isCritical: true,
          isOther: false,
          reason: 'Valor de estatura no numérico.'
        };
      }

      if (normHeight.normalized < 1.0 || normHeight.normalized > 2.3) {
        return {
          rowNumber: rowContext.rowNumber || 1,
          fieldKey: def.fieldKey,
          variableName: def.variableName,
          moduleName: def.moduleName,
          originalValue: rawValue,
          normalizedValue: normHeight.normalized,
          status: 'OUT_OF_RANGE',
          isCritical: true,
          isOther: false,
          reason: `Estatura de ${normHeight.normalized} m está fuera del rango normal (1.00m - 2.30m). Preservado para revisión.`
        };
      }

      return {
        rowNumber: rowContext.rowNumber || 1,
        fieldKey: def.fieldKey,
        variableName: def.variableName,
        moduleName: def.moduleName,
        originalValue: rawValue,
        normalizedValue: normHeight.normalized,
        status: 'VALID',
        isCritical: true,
        isOther: false
      };
    }

    if (def.fieldKey === 'pesoKg') {
      const weightNum = Number(rawValue);
      if (isNaN(weightNum)) {
        return {
          rowNumber: rowContext.rowNumber || 1,
          fieldKey: def.fieldKey,
          variableName: def.variableName,
          moduleName: def.moduleName,
          originalValue: rawValue,
          normalizedValue: null,
          status: 'INVALID',
          isCritical: true,
          isOther: false,
          reason: 'Valor de peso no numérico.'
        };
      }

      if (weightNum < 35 || weightNum > 180) {
        return {
          rowNumber: rowContext.rowNumber || 1,
          fieldKey: def.fieldKey,
          variableName: def.variableName,
          moduleName: def.moduleName,
          originalValue: rawValue,
          normalizedValue: weightNum,
          status: 'OUT_OF_RANGE',
          isCritical: true,
          isOther: false,
          reason: `Peso de ${weightNum} kg fuera del rango fisiológico razonable (35kg - 180kg). Preservado para revisión.`
        };
      }

      return {
        rowNumber: rowContext.rowNumber || 1,
        fieldKey: def.fieldKey,
        variableName: def.variableName,
        moduleName: def.moduleName,
        originalValue: rawValue,
        normalizedValue: weightNum,
        status: 'VALID',
        isCritical: true,
        isOther: false
      };
    }

    // Number Range Checks
    if (def.type === 'number') {
      const numVal = Number(rawValue);
      if (isNaN(numVal)) {
        return {
          rowNumber: rowContext.rowNumber || 1,
          fieldKey: def.fieldKey,
          variableName: def.variableName,
          moduleName: def.moduleName,
          originalValue: rawValue,
          normalizedValue: null,
          status: 'INVALID',
          isCritical: def.isCritical,
          isOther: false,
          reason: 'Valor no numérico en campo esperado numérico.'
        };
      }

      if ((def.minNum !== undefined && numVal < def.minNum) || (def.maxNum !== undefined && numVal > def.maxNum)) {
        return {
          rowNumber: rowContext.rowNumber || 1,
          fieldKey: def.fieldKey,
          variableName: def.variableName,
          moduleName: def.moduleName,
          originalValue: rawValue,
          normalizedValue: numVal,
          status: 'OUT_OF_RANGE',
          isCritical: def.isCritical,
          isOther: false,
          reason: `Valor ${numVal} fuera de límites permitidos [${def.minNum} - ${def.maxNum}].`
        };
      }

      return {
        rowNumber: rowContext.rowNumber || 1,
        fieldKey: def.fieldKey,
        variableName: def.variableName,
        moduleName: def.moduleName,
        originalValue: rawValue,
        normalizedValue: numVal,
        status: 'VALID',
        isCritical: def.isCritical,
        isOther: false
      };
    }

    // Boolean Checks
    if (def.type === 'boolean') {
      const strVal = String(rawValue).trim().toLowerCase();
      if (['si', 'sí', 'true', '1', 'yes'].includes(strVal)) {
        return {
          rowNumber: rowContext.rowNumber || 1,
          fieldKey: def.fieldKey,
          variableName: def.variableName,
          moduleName: def.moduleName,
          originalValue: rawValue,
          normalizedValue: true,
          status: 'VALID',
          isCritical: def.isCritical,
          isOther: false
        };
      }
      if (['no', 'false', '0'].includes(strVal)) {
        return {
          rowNumber: rowContext.rowNumber || 1,
          fieldKey: def.fieldKey,
          variableName: def.variableName,
          moduleName: def.moduleName,
          originalValue: rawValue,
          normalizedValue: false,
          status: 'VALID',
          isCritical: def.isCritical,
          isOther: false
        };
      }
    }

    // Categorical checks
    if (def.type === 'categorical' && def.allowedValues && def.allowedValues.length > 0) {
      const match = def.allowedValues.find(v => v.toLowerCase() === String(rawValue).trim().toLowerCase());
      if (match) {
        return {
          rowNumber: rowContext.rowNumber || 1,
          fieldKey: def.fieldKey,
          variableName: def.variableName,
          moduleName: def.moduleName,
          originalValue: rawValue,
          normalizedValue: match,
          status: 'VALID',
          isCritical: def.isCritical,
          isOther,
          otherValue
        };
      }
    }

    // Default valid string / categorical
    return {
      rowNumber: rowContext.rowNumber || 1,
      fieldKey: def.fieldKey,
      variableName: def.variableName,
      moduleName: def.moduleName,
      originalValue: rawValue,
      normalizedValue: String(rawValue).trim(),
      status: 'VALID',
      isCritical: def.isCritical,
      isOther,
      otherValue
    };
  }

  /**
   * 18. Evaluates logical consistency for a single record row
   * Detects contradictions (e.g. tieneHijos=false & numeroHijos=2)
   */
  public static evaluateRowConsistency(row: Record<string, any>, rowIdx: number): FieldValidationRecord[] {
    const inconsistencies: FieldValidationRecord[] = [];

    // Rule 1: tieneHijos = false BUT numeroHijos > 0
    const tieneHijos = row.tieneHijos === false || String(row.tieneHijos).toLowerCase() === 'no';
    const numHijos = Number(row.numeroHijos);

    if (tieneHijos && !isNaN(numHijos) && numHijos > 0) {
      inconsistencies.push({
        rowNumber: rowIdx + 1,
        fieldKey: 'numeroHijos',
        variableName: 'Número de Hijos',
        moduleName: 'Familiar',
        originalValue: row.numeroHijos,
        normalizedValue: row.numeroHijos,
        status: 'INCONSISTENT',
        isCritical: false,
        isOther: false,
        reason: `Contradicción: reporta no tener hijos pero indica ${numHijos} hijos.`
      });
    }

    // Rule 2: viveSolo = true BUT personasHogar > 1
    const viveSolo = row.viveSolo === true || String(row.viveSolo).toLowerCase() === 'sí' || String(row.viveSolo).toLowerCase() === 'si';
    const personasHogar = Number(row.personasHogar);

    if (viveSolo && !isNaN(personasHogar) && personasHogar > 1) {
      inconsistencies.push({
        rowNumber: rowIdx + 1,
        fieldKey: 'personasHogar',
        variableName: 'Número de Personas en el Hogar',
        moduleName: 'Familiar',
        originalValue: row.personasHogar,
        normalizedValue: row.personasHogar,
        status: 'INCONSISTENT',
        isCritical: false,
        isOther: false,
        reason: `Contradicción: declara vivir solo(a) pero indica ${personasHogar} personas en el hogar.`
      });
    }

    // Rule 3: actividadFisica = false BUT frecuenciaEjercicioSemanal > 0
    const actFisica = row.actividadFisica === false || String(row.actividadFisica).toLowerCase() === 'no';
    const freqEjercicio = Number(row.frecuenciaEjercicioSemanal);

    if (actFisica && !isNaN(freqEjercicio) && freqEjercicio > 0) {
      inconsistencies.push({
        rowNumber: rowIdx + 1,
        fieldKey: 'frecuenciaEjercicioSemanal',
        variableName: 'Frecuencia de Ejercicio Semanal',
        moduleName: 'Hábitos',
        originalValue: row.frecuenciaEjercicioSemanal,
        normalizedValue: row.frecuenciaEjercicioSemanal,
        status: 'INCONSISTENT',
        isCritical: false,
        isOther: false,
        reason: `Contradicción: declara no hacer actividad física pero reporta ${freqEjercicio} días a la semana.`
      });
    }

    return inconsistencies;
  }

  /**
   * 19. Detects Duplicate Records by Cedula or Email
   */
  public static detectDuplicates(records: Record<string, any>[]): DuplicateRecordGroup[] {
    const idMap: Record<string, number[]> = {};

    records.forEach((rec, idx) => {
      const idKey = String(rec.numeroIdentificacion || rec.cedula || rec.id || '').trim();
      if (idKey && idKey.length >= 4) {
        if (!idMap[idKey]) idMap[idKey] = [];
        idMap[idKey].push(idx + 1);
      }
    });

    const duplicateGroups: DuplicateRecordGroup[] = [];
    Object.entries(idMap).forEach(([idVal, rows]) => {
      if (rows.length > 1) {
        duplicateGroups.push({
          id: `DUP-${idVal}`,
          identifierKey: `Cédula/ID: ${idVal}`,
          rows,
          recordsCount: rows.length,
          duplicateField: 'numeroIdentificacion'
        });
      }
    });

    return duplicateGroups;
  }

  /**
   * MAIN ENTRYPOINT: Evaluates an entire dataset and produces the DataQualityDiagnostic
   */
  public static runDiagnostic(
    records: Record<string, any>[] | null,
    columnHeaders?: string[],
    thresholds: CompletenessThresholds = this.defaultThresholds
  ): DataQualityDiagnostic {
    if (!records || records.length === 0) {
      // Empty dataset
      const emptyModuleScores: Record<BusinessModule, ModuleQualityScore> = {} as any;
      ALL_BUSINESS_MODULES.forEach(m => {
        emptyModuleScores[m] = {
          moduleName: m,
          totalPossibleFields: 0,
          totalFilledFields: 0,
          totalValidFields: 0,
          completenessPct: 0,
          validityPct: 0,
          alertLevel: 'RED',
          criticalMissingCount: 0
        };
      });

      return {
        overallQualityScore: null,
        completenessPct: null,
        validityPct: null,
        consistencyPct: null,
        rangeAdherencePct: null,
        duplicatesCount: 0,
        missingCriticalFieldsCount: MASTER_FIELD_DEFINITIONS.filter(f => f.isCritical).length,
        totalCheckedRecords: 0,
        totalCheckedColumns: columnHeaders ? columnHeaders.length : 0,
        moduleScores: emptyModuleScores,
        problematicFields: [],
        duplicateGroups: [],
        missingCriticalFieldsList: MASTER_FIELD_DEFINITIONS.filter(f => f.isCritical).map(f => f.variableName),
        hasCriticalBlockers: true,
        canGenerateReport: false,
        diagnosticSummaryMessage: 'Sin información disponible en la base de datos.',
        evaluatedAt: new Date().toISOString()
      };
    }

    const totalRecords = records.length;
    const problematicFields: FieldValidationRecord[] = [];
    
    // Module stats counters
    const moduleTotalPossible: Record<BusinessModule, number> = {} as any;
    const moduleFilled: Record<BusinessModule, number> = {} as any;
    const moduleValid: Record<BusinessModule, number> = {} as any;
    const moduleCriticalMissing: Record<BusinessModule, number> = {} as any;

    ALL_BUSINESS_MODULES.forEach(m => {
      moduleTotalPossible[m] = 0;
      moduleFilled[m] = 0;
      moduleValid[m] = 0;
      moduleCriticalMissing[m] = 0;
    });

    let totalCellsEvaluated = 0;
    let totalValidCells = 0;
    let totalFilledCells = 0;
    let totalInconsistentCells = 0;
    let totalOutOfRangeCells = 0;

    // Scan each record row
    records.forEach((row, rowIdx) => {
      // Validate defined master fields
      MASTER_FIELD_DEFINITIONS.forEach(def => {
        const cellRec = this.validateCell(def, row[def.fieldKey], { ...row, rowNumber: rowIdx + 1 });
        
        moduleTotalPossible[def.moduleName]++;
        totalCellsEvaluated++;

        if (cellRec.status === 'VALID') {
          moduleFilled[def.moduleName]++;
          moduleValid[def.moduleName]++;
          totalFilledCells++;
          totalValidCells++;
        } else if (cellRec.status === 'PREFER_NOT_TO_ANSWER' || cellRec.status === 'NOT_APPLICABLE') {
          moduleFilled[def.moduleName]++;
          totalFilledCells++;
        } else {
          // Problematic cell
          problematicFields.push(cellRec);
          if (cellRec.status === 'OUT_OF_RANGE') totalOutOfRangeCells++;
          if (cellRec.isCritical) {
            moduleCriticalMissing[def.moduleName]++;
          }
        }
      });

      // Check logical consistency rules
      const consistencyIssues = this.evaluateRowConsistency(row, rowIdx);
      consistencyIssues.forEach(issue => {
        problematicFields.push(issue);
        totalInconsistentCells++;
      });
    });

    // Detect Duplicates
    const duplicateGroups = this.detectDuplicates(records);
    const totalDuplicates = duplicateGroups.reduce((acc, g) => acc + (g.recordsCount - 1), 0);

    // Calculate module scores
    const moduleScores: Record<BusinessModule, ModuleQualityScore> = {} as any;
    ALL_BUSINESS_MODULES.forEach(m => {
      const possible = moduleTotalPossible[m] || 1;
      const filled = moduleFilled[m];
      const valid = moduleValid[m];
      const compPct = Number(((filled / possible) * 100).toFixed(1));
      const valPct = Number(((valid / possible) * 100).toFixed(1));

      let alertLevel: 'GREEN' | 'YELLOW' | 'RED' = 'RED';
      if (compPct >= thresholds.greenMin) alertLevel = 'GREEN';
      else if (compPct >= thresholds.yellowMin) alertLevel = 'YELLOW';

      moduleScores[m] = {
        moduleName: m,
        totalPossibleFields: possible,
        totalFilledFields: filled,
        totalValidFields: valid,
        completenessPct: compPct,
        validityPct: valPct,
        alertLevel,
        criticalMissingCount: moduleCriticalMissing[m]
      };
    });

    // Global Mathematical Scores (Section 6 - NO artificial constants)
    const overallCompleteness = Number(((totalFilledCells / totalCellsEvaluated) * 100).toFixed(1));
    const overallValidity = Number(((totalValidCells / totalCellsEvaluated) * 100).toFixed(1));
    const overallConsistency = Number((Math.max(0, 100 - (totalInconsistentCells / totalRecords) * 100)).toFixed(1));
    const overallRangeAdherence = Number((Math.max(0, 100 - (totalOutOfRangeCells / totalRecords) * 100)).toFixed(1));

    // Duplicate & Critical Fields Penalties
    const duplicatePenalty = Math.min(20, totalDuplicates * 5);
    const missingCriticalCount = problematicFields.filter(p => p.isCritical).length;
    const criticalPenalty = Math.min(30, missingCriticalCount * 2);

    const rawQualityScore = (
      overallCompleteness * 0.30 +
      overallValidity * 0.30 +
      overallConsistency * 0.20 +
      overallRangeAdherence * 0.20
    ) - duplicatePenalty - criticalPenalty;

    const overallQualityScore = Number(Math.max(0, Math.min(100, rawQualityScore)).toFixed(1));

    // Missing Critical Fields Names
    const missingCriticalFieldsList = Array.from(
      new Set(problematicFields.filter(p => p.isCritical).map(p => p.variableName))
    );

    const hasCriticalBlockers = missingCriticalCount > 0 || totalDuplicates > 3 || overallQualityScore < 70;
    const canGenerateReport = overallQualityScore >= 50;

    let summaryMsg = 'Base de datos con excelente nivel de integridad e información completa.';
    if (overallQualityScore < 70) {
      summaryMsg = 'El conjunto de datos presenta serias deficiencias y requiere revisión antes de generar el informe.';
    } else if (overallQualityScore < 90) {
      summaryMsg = 'Base de datos con calidad regular. Se recomienda revisar valores faltantes y fuera de rango.';
    }

    return {
      overallQualityScore,
      completenessPct: overallCompleteness,
      validityPct: overallValidity,
      consistencyPct: overallConsistency,
      rangeAdherencePct: overallRangeAdherence,
      duplicatesCount: totalDuplicates,
      missingCriticalFieldsCount: missingCriticalFieldsList.length,
      totalCheckedRecords: totalRecords,
      totalCheckedColumns: columnHeaders ? columnHeaders.length : MASTER_FIELD_DEFINITIONS.length,
      moduleScores,
      problematicFields,
      duplicateGroups,
      missingCriticalFieldsList,
      hasCriticalBlockers,
      canGenerateReport,
      diagnosticSummaryMessage: summaryMsg,
      evaluatedAt: new Date().toISOString()
    };
  }
}
