/**
 * Core Data Integrity & Traceability Engine
 * SG-SST Information System Specification
 */

import {
  DataValueStatus,
  FieldQualityStatus,
  FieldQualityMetric,
  DataQualityReport,
  IndicatorTraceability,
  SafeCalculationResult
} from './types';

export class DataIntegrityEngine {

  /**
   * Checks if a value represents a missing datum (null, undefined, empty string, or explicit "Sin dato" text).
   * CRITICAL: The number `0` is a VALID measured value and is NOT considered missing.
   */
  public static isMissingValue(val: any): boolean {
    if (val === null || val === undefined) return true;
    if (typeof val === 'string') {
      const trimmed = val.trim().toLowerCase();
      if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return true;
      if (trimmed === 'sin dato' || trimmed === 'sin datos' || trimmed === 'n/a' || trimmed === 'no aplica' || trimmed === 'no registra') return true;
      if (trimmed === '0%' && val.includes('fallback')) return true;
    }
    if (typeof val === 'number' && isNaN(val)) return true;
    return false;
  }

  /**
   * Strict field value validator according to datatype and range.
   */
  public static validateValue(
    val: any, 
    options?: { 
      type?: 'string' | 'number' | 'date' | 'boolean'; 
      min?: number; 
      max?: number; 
      allowedValues?: string[];
    }
  ): { status: DataValueStatus; parsedValue: any; label: string } {
    if (this.isMissingValue(val)) {
      return { status: 'MISSING', parsedValue: null, label: 'Sin dato' };
    }

    const type = options?.type || 'string';

    if (type === 'number') {
      const num = Number(val);
      if (isNaN(num)) {
        return { status: 'INVALID', parsedValue: null, label: 'Valor numérico no válido' };
      }
      if (options?.min !== undefined && num < options.min) {
        return { status: 'OUT_OF_RANGE', parsedValue: num, label: `Por debajo del mínimo (${options.min})` };
      }
      if (options?.max !== undefined && num > options.max) {
        return { status: 'OUT_OF_RANGE', parsedValue: num, label: `Por encima del máximo (${options.max})` };
      }
      return { status: 'VALID', parsedValue: num, label: String(num) };
    }

    if (type === 'boolean') {
      if (val === true || val === 'true' || val === 1 || val === '1' || val === 'Sí' || val === 'SI') {
        return { status: 'VALID', parsedValue: true, label: 'Sí' };
      }
      if (val === false || val === 'false' || val === 0 || val === '0' || val === 'No' || val === 'NO') {
        return { status: 'VALID', parsedValue: false, label: 'No' };
      }
      return { status: 'INVALID', parsedValue: null, label: 'Booleano no válido' };
    }

    if (type === 'date') {
      const dateObj = new Date(val);
      if (isNaN(dateObj.getTime())) {
        return { status: 'INVALID', parsedValue: null, label: 'Fecha no válida' };
      }
      return { status: 'VALID', parsedValue: dateObj.toISOString().split('T')[0], label: dateObj.toISOString().split('T')[0] };
    }

    const strVal = String(val).trim();
    if (options?.allowedValues && options.allowedValues.length > 0) {
      const match = options.allowedValues.find(v => v.toLowerCase() === strVal.toLowerCase());
      if (!match) {
        return { status: 'INVALID', parsedValue: strVal, label: 'Opción no contenida en catálogo' };
      }
      return { status: 'VALID', parsedValue: match, label: match };
    }

    return { status: 'VALID', parsedValue: strVal, label: strVal };
  }

  /**
   * Calculates a safe mathematical average over ONLY valid non-null records.
   * If valid records count is 0, returns value = null and statusText = "Sin datos suficientes".
   */
  public static calculateSafeAverage(
    records: any[],
    getValueFn: (item: any) => number | null | undefined,
    indicatorMeta: {
      indicatorId: string;
      indicatorName: string;
      sourceField: string;
      sourceSurvey?: string;
      surveyVersion?: string;
      unit?: string;
    }
  ): SafeCalculationResult<number> {
    const totalRecords = records ? records.length : 0;
    
    if (totalRecords === 0) {
      const emptyTrace: IndicatorTraceability = {
        indicatorId: indicatorMeta.indicatorId,
        indicatorName: indicatorMeta.indicatorName,
        sourceField: indicatorMeta.sourceField,
        sourceSurvey: indicatorMeta.sourceSurvey || 'Master Database',
        surveyVersion: indicatorMeta.surveyVersion || 'v1.0',
        calculationMethod: `Promedio aritmético de ${indicatorMeta.sourceField} sobre registros válidos`,
        validRecords: 0,
        totalRecords: 0,
        coveragePercentage: 0,
        calculatedValue: null,
        unit: indicatorMeta.unit || '',
        statusText: 'Sin datos suficientes',
        calculatedAt: new Date().toISOString(),
        dataStatus: 'MISSING'
      };
      return {
        value: null,
        validRecords: 0,
        totalRecords: 0,
        coveragePercentage: 0,
        statusText: 'Sin datos suficientes',
        dataStatus: 'MISSING',
        traceability: emptyTrace
      };
    }

    let validCount = 0;
    let sum = 0;

    for (const record of records) {
      const rawVal = getValueFn(record);
      if (!this.isMissingValue(rawVal)) {
        const num = Number(rawVal);
        if (!isNaN(num)) {
          sum += num;
          validCount++;
        }
      }
    }

    const coveragePercentage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

    if (validCount === 0) {
      const trace: IndicatorTraceability = {
        indicatorId: indicatorMeta.indicatorId,
        indicatorName: indicatorMeta.indicatorName,
        sourceField: indicatorMeta.sourceField,
        sourceSurvey: indicatorMeta.sourceSurvey || 'Master Database',
        surveyVersion: indicatorMeta.surveyVersion || 'v1.0',
        calculationMethod: `Promedio aritmético de ${indicatorMeta.sourceField} sobre registros válidos`,
        validRecords: 0,
        totalRecords,
        coveragePercentage: 0,
        calculatedValue: null,
        unit: indicatorMeta.unit || '',
        statusText: 'Sin datos suficientes',
        calculatedAt: new Date().toISOString(),
        dataStatus: 'MISSING'
      };
      return {
        value: null,
        validRecords: 0,
        totalRecords,
        coveragePercentage: 0,
        statusText: 'Sin datos suficientes',
        dataStatus: 'MISSING',
        traceability: trace
      };
    }

    const avg = parseFloat((sum / validCount).toFixed(2));
    const statusText = `Registros válidos: ${validCount} / ${totalRecords} (${coveragePercentage}% Cobertura)`;

    const trace: IndicatorTraceability = {
      indicatorId: indicatorMeta.indicatorId,
      indicatorName: indicatorMeta.indicatorName,
      sourceField: indicatorMeta.sourceField,
      sourceSurvey: indicatorMeta.sourceSurvey || 'Master Database',
      surveyVersion: indicatorMeta.surveyVersion || 'v1.0',
      calculationMethod: `Promedio aritmético de ${indicatorMeta.sourceField} sobre ${validCount} registros válidos`,
      validRecords: validCount,
      totalRecords,
      coveragePercentage,
      calculatedValue: avg,
      unit: indicatorMeta.unit || '',
      statusText,
      calculatedAt: new Date().toISOString(),
      dataStatus: 'CALCULATED_FROM_VALID_DATA'
    };

    return {
      value: avg,
      validRecords: validCount,
      totalRecords,
      coveragePercentage,
      statusText,
      dataStatus: 'CALCULATED_FROM_VALID_DATA',
      traceability: trace
    };
  }

  /**
   * Calculates a safe percentage over ONLY valid non-null records matching a condition.
   */
  public static calculateSafePercentage(
    records: any[],
    conditionFn: (item: any) => boolean | null | undefined,
    indicatorMeta: {
      indicatorId: string;
      indicatorName: string;
      sourceField: string;
      sourceSurvey?: string;
      surveyVersion?: string;
    }
  ): SafeCalculationResult<number> {
    const totalRecords = records ? records.length : 0;

    if (totalRecords === 0) {
      const trace: IndicatorTraceability = {
        indicatorId: indicatorMeta.indicatorId,
        indicatorName: indicatorMeta.indicatorName,
        sourceField: indicatorMeta.sourceField,
        sourceSurvey: indicatorMeta.sourceSurvey || 'Master Database',
        surveyVersion: indicatorMeta.surveyVersion || 'v1.0',
        calculationMethod: `Porcentaje de cumplimiento en ${indicatorMeta.sourceField}`,
        validRecords: 0,
        totalRecords: 0,
        coveragePercentage: 0,
        calculatedValue: null,
        unit: '%',
        statusText: 'Sin datos suficientes',
        calculatedAt: new Date().toISOString(),
        dataStatus: 'MISSING'
      };
      return {
        value: null,
        validRecords: 0,
        totalRecords: 0,
        coveragePercentage: 0,
        statusText: 'Sin datos suficientes',
        dataStatus: 'MISSING',
        traceability: trace
      };
    }

    let validCount = 0;
    let matchCount = 0;

    for (const record of records) {
      const res = conditionFn(record);
      if (res !== null && res !== undefined) {
        validCount++;
        if (res === true) matchCount++;
      }
    }

    const coveragePercentage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

    if (validCount === 0) {
      const trace: IndicatorTraceability = {
        indicatorId: indicatorMeta.indicatorId,
        indicatorName: indicatorMeta.indicatorName,
        sourceField: indicatorMeta.sourceField,
        sourceSurvey: indicatorMeta.sourceSurvey || 'Master Database',
        surveyVersion: indicatorMeta.surveyVersion || 'v1.0',
        calculationMethod: `Porcentaje de cumplimiento en ${indicatorMeta.sourceField}`,
        validRecords: 0,
        totalRecords,
        coveragePercentage: 0,
        calculatedValue: null,
        unit: '%',
        statusText: 'Sin datos suficientes',
        calculatedAt: new Date().toISOString(),
        dataStatus: 'MISSING'
      };
      return {
        value: null,
        validRecords: 0,
        totalRecords,
        coveragePercentage: 0,
        statusText: 'Sin datos suficientes',
        dataStatus: 'MISSING',
        traceability: trace
      };
    }

    const pct = parseFloat(((matchCount / validCount) * 100).toFixed(1));
    const statusText = `Registros válidos: ${validCount} / ${totalRecords} (${coveragePercentage}% Cobertura)`;

    const trace: IndicatorTraceability = {
      indicatorId: indicatorMeta.indicatorId,
      indicatorName: indicatorMeta.indicatorName,
      sourceField: indicatorMeta.sourceField,
      sourceSurvey: indicatorMeta.sourceSurvey || 'Master Database',
      surveyVersion: indicatorMeta.surveyVersion || 'v1.0',
      calculationMethod: `(${matchCount} positivos / ${validCount} registros válidos con información) * 100`,
      validRecords: validCount,
      totalRecords,
      coveragePercentage,
      calculatedValue: pct,
      unit: '%',
      statusText,
      calculatedAt: new Date().toISOString(),
      dataStatus: 'CALCULATED_FROM_VALID_DATA'
    };

    return {
      value: pct,
      validRecords: validCount,
      totalRecords,
      coveragePercentage,
      statusText,
      dataStatus: 'CALCULATED_FROM_VALID_DATA',
      traceability: trace
    };
  }

  /**
   * Generates a complete Data Quality Report object for an entire dataset.
   */
  public static buildDataQualityReport(
    datasetName: string,
    records: any[],
    fieldConfigs: {
      key: string;
      label: string;
      type?: 'string' | 'number' | 'date' | 'boolean';
      min?: number;
      max?: number;
      allowedValues?: string[];
      required?: boolean;
    }[],
    columnsFoundInHeader: string[] = []
  ): DataQualityReport {
    const totalRecords = records ? records.length : 0;
    const fieldMetrics: Record<string, FieldQualityMetric> = {};
    const fieldsWithMissingData: string[] = [];
    const fieldsWithInvalidData: string[] = [];
    let totalValidFields = 0;
    let totalExpectedFields = totalRecords * fieldConfigs.length;

    const columnsMissing = fieldConfigs
      .filter(f => !columnsFoundInHeader.some(c => c.toLowerCase().trim() === f.key.toLowerCase().trim() || c.toLowerCase().trim() === f.label.toLowerCase().trim()))
      .map(f => f.label);

    fieldConfigs.forEach(field => {
      let validCount = 0;
      let missingCount = 0;
      let invalidCount = 0;
      let outOfRangeCount = 0;
      let sampleValidValue: any = null;

      if (totalRecords === 0) {
        missingCount = 0;
      } else {
        records.forEach(rec => {
          const rawVal = rec[field.key] !== undefined ? rec[field.key] : rec[field.label];
          const valRes = this.validateValue(rawVal, {
            type: field.type,
            min: field.min,
            max: field.max,
            allowedValues: field.allowedValues
          });

          if (valRes.status === 'MISSING') {
            missingCount++;
          } else if (valRes.status === 'INVALID') {
            invalidCount++;
          } else if (valRes.status === 'OUT_OF_RANGE') {
            outOfRangeCount++;
          } else {
            validCount++;
            if (!sampleValidValue) sampleValidValue = valRes.parsedValue;
          }
        });
      }

      totalValidFields += validCount;

      const coveragePercentage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

      let status: FieldQualityStatus = 'COMPLETE';
      if (coveragePercentage === 0) {
        status = 'MISSING';
      } else if (invalidCount > 0) {
        status = 'INVALID';
      } else if (coveragePercentage < 100) {
        status = 'PARTIAL';
      }

      if (missingCount > 0) fieldsWithMissingData.push(field.label);
      if (invalidCount > 0 || outOfRangeCount > 0) fieldsWithInvalidData.push(field.label);

      fieldMetrics[field.key] = {
        fieldName: field.key,
        fieldLabel: field.label,
        totalRecords,
        validRecords: validCount,
        missingRecords: missingCount,
        invalidRecords: invalidCount,
        outOfRangeRecords: outOfRangeCount,
        coveragePercentage,
        status,
        sampleValidValue
      };
    });

    const globalCoverage = totalExpectedFields > 0 ? parseFloat(((totalValidFields / totalExpectedFields) * 100).toFixed(1)) : 0;

    return {
      datasetName,
      totalRecords,
      validRecords: totalRecords, // valid records rows
      missingRecords: fieldsWithMissingData.length,
      invalidRecords: fieldsWithInvalidData.length,
      outOfRangeRecords: 0,
      duplicatedRecords: 0,
      coveragePercentage: globalCoverage,
      fieldsWithMissingData,
      fieldsWithInvalidData,
      fieldMetrics,
      columnsFound: columnsFoundInHeader,
      columnsMissing,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Generates a safe narrative statement for reports.
   * If coverage is insufficient, guarantees narrative non-assumptive statement.
   */
  public static buildSafeReportStatement(
    variableLabel: string,
    validRecords: number,
    totalRecords: number,
    statementGenerator: () => string,
    insufficientCoverageFallback?: string
  ): string {
    if (totalRecords === 0 || validRecords === 0) {
      if (insufficientCoverageFallback) return insufficientCoverageFallback;
      return `No se dispone de información suficiente sobre ${variableLabel.toLowerCase()}.`;
    }

    const coverage = (validRecords / totalRecords) * 100;
    if (coverage < 15) {
      if (insufficientCoverageFallback) return insufficientCoverageFallback;
      return `La información sobre ${variableLabel.toLowerCase()} tiene una cobertura insuficiente (${coverage.toFixed(1)}%) para emitir conclusiones representativas.`;
    }

    return statementGenerator();
  }

  /**
   * Cleans AI input dataset to guarantee ONLY valid or calculated data is passed to AI prompt,
   * explicitly preventing AI from treating null as zero or converting missing data into facts.
   */
  public static sanitizeDataForAI(data: Record<string, any>): Record<string, any> {
    const clean: Record<string, any> = {};

    Object.entries(data).forEach(([key, val]) => {
      if (this.isMissingValue(val)) {
        clean[key] = "Dato no disponible / Sin registrar";
      } else if (typeof val === 'object' && val !== null && 'value' in val) {
        if (val.value === null) {
          clean[key] = `Sin datos suficientes (Cobertura: ${val.coveragePercentage || 0}%)`;
        } else {
          clean[key] = `${val.value} ${val.unit || ''} (Registros válidos: ${val.validRecords}/${val.totalRecords}, Cobertura: ${val.coveragePercentage}%)`;
        }
      } else {
        clean[key] = val;
      }
    });

    clean['_AI_DATA_INTEGRITY_POLICY'] = "REGLA: Si un dato aparece como 'Dato no disponible' o 'Sin datos suficientes', NO asuma 0%, no invente valores ni emita conclusiones afirmativas sobre dicha variable.";

    return clean;
  }

}
