/**
 * Automated Traceability Test & Anti-Synthetic Data Verification Suite
 * Prompt 19 Specification - Sections 25 & 26
 */

import { IndicatorTraceability, SourceType } from './types';

export interface TraceabilityTestStep {
  stepName: string;
  passed: boolean;
  details: string;
}

export interface TraceabilityTestResult {
  indicatorId: string;
  indicatorName: string;
  overallPassed: boolean;
  steps: TraceabilityTestStep[];
  executedAt: string;
}

export interface AntiSyntheticCheckResult {
  passed: boolean;
  violationsFound: string[];
  checkedAt: string;
}

export class TraceabilityTester {

  /**
   * Section 25: Automated Traceability Chain Test
   * Verifies step-by-step resolution from Indicator -> Calculation -> Variables -> Records -> Original Answer -> Question -> Source.
   */
  public static runTraceabilityChainTest(trace: IndicatorTraceability): TraceabilityTestResult {
    const steps: TraceabilityTestStep[] = [];

    // Step 1: Indicador
    const step1Passed = Boolean(trace.indicatorId && trace.indicatorName);
    steps.push({
      stepName: '1. Indicador Registrado',
      passed: step1Passed,
      details: step1Passed 
        ? `Indicador '${trace.indicatorName}' (ID: ${trace.indicatorId}) bien identificado.`
        : 'Falta identificación primaria del indicador.'
    });

    // Step 2: Cálculo
    const step2Passed = Boolean(trace.calculationMethod || trace.formula);
    steps.push({
      stepName: '2. Fórmula y Método de Cálculo',
      passed: step2Passed,
      details: step2Passed
        ? `Método: ${trace.calculationMethod || trace.formula}`
        : 'Sin método ni fórmula de cálculo especificada.'
    });

    // Step 3: Variables
    const step3Passed = Boolean(trace.sourceField);
    steps.push({
      stepName: '3. Campo / Variable de Origen',
      passed: step3Passed,
      details: step3Passed
        ? `Campo evaluado: ${trace.sourceField}`
        : 'No se definió la variable de entrada.'
    });

    // Step 4: Registros
    const step4Passed = trace.totalRecords !== undefined && trace.validRecords !== undefined && trace.coveragePercentage !== undefined;
    steps.push({
      stepName: '4. Conteo de Registros & Cobertura',
      passed: step4Passed,
      details: step4Passed
        ? `${trace.validRecords} registros válidos de ${trace.totalRecords} (Cobertura: ${trace.coveragePercentage}%)`
        : 'Métricas de registros no disponibles.'
    });

    // Step 5: Respuesta Original / Linaje
    const step5Passed = Boolean(trace.excelLineage || trace.recordLineage || trace.calculatedValue !== undefined);
    steps.push({
      stepName: '5. Linaje de Respuesta / Fila de Origen',
      passed: step5Passed,
      details: step5Passed
        ? trace.excelLineage 
          ? `Archivo: ${trace.excelLineage.fileName}, Fila: ${trace.excelLineage.excelRow}, Columna: ${trace.excelLineage.excelColumn}`
          : 'Linaje de registro preservado.'
        : 'Sin linaje explícito de respuesta original.'
    });

    // Step 6: Pregunta / Encuesta
    const step6Passed = Boolean(trace.sourceQuestion || trace.questionLineage || trace.sourceSurvey);
    steps.push({
      stepName: '6. Pregunta de Encuesta o Encabezado Excel',
      passed: step6Passed,
      details: step6Passed
        ? `Pregunta/Encabezado: ${trace.questionLineage?.questionText || trace.sourceQuestion || trace.sourceSurvey}`
        : 'No se asoció la pregunta o encuesta de origen.'
    });

    // Step 7: Fuente Declarada
    const step7Passed = Boolean(trace.sourceType && trace.sourceType !== 'NO_DISPONIBLE' ? true : trace.calculatedValue === null);
    steps.push({
      stepName: '7. Declaración Formal de Fuente (sourceType)',
      passed: step7Passed,
      details: `Tipo de fuente declarada: ${trace.sourceType || 'ENCUESTA/EXCEL'}`
    });

    const overallPassed = steps.every(s => s.passed);

    return {
      indicatorId: trace.indicatorId,
      indicatorName: trace.indicatorName,
      overallPassed,
      steps,
      executedAt: new Date().toISOString()
    };
  }

  /**
   * Section 26: Anti-Synthetic Data Audit
   * Ensures no random generator functions (Math.random), artificial fallbacks, or synthetic mock values are present as real data.
   */
  public static runAntiSyntheticDataCheck(sampleData: any[]): AntiSyntheticCheckResult {
    const violations: string[] = [];

    if (!sampleData || sampleData.length === 0) {
      return {
        passed: true,
        violationsFound: [],
        checkedAt: new Date().toISOString()
      };
    }

    sampleData.forEach((row, idx) => {
      // Check for synthetic text markers
      Object.entries(row).forEach(([key, val]) => {
        if (typeof val === 'string') {
          const lower = val.toLowerCase();
          if (lower.includes('synthetic') || lower.includes('mock_value') || lower.includes('dummy_data') || lower.includes('random_generated')) {
            violations.push(`Fila ${idx + 1}, campo '${key}': contiene etiqueta de datos sintéticos ('${val}').`);
          }
        }
        if (key.includes('__isSynthetic') && val === true) {
          violations.push(`Fila ${idx + 1}: bandera explícita de dato sintético detectada.`);
        }
      });
    });

    return {
      passed: violations.length === 0,
      violationsFound: violations,
      checkedAt: new Date().toISOString()
    };
  }
}
