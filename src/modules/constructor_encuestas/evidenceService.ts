/**
 * PROMPT 25 — MOTOR DE CALIDAD, TRAZABILIDAD Y CONFIABILIDAD DEL INFORME (EvidenceService)
 * Absolute Rule: THE SYSTEM MUST NEVER INVENT, ESTIMATE OR COMPLETE MISSING INFORMATION.
 * Guarantees 100% data traceability from raw response to executive report statement.
 */

export type IndicatorSourceType = 'EXCEL' | 'SURVEY' | 'CALCULATED' | 'CONFIGURATION';
export type IndicatorQualityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';

export interface CoverageThresholds {
  high: number;        // Default >= 90%
  medium: number;      // Default >= 70%
  low: number;         // Default >= 50%
  insufficient: number; // Default < 50%
}

export const DEFAULT_COVERAGE_THRESHOLDS: CoverageThresholds = {
  high: 90,
  medium: 70,
  low: 50,
  insufficient: 50
};

let currentThresholds: CoverageThresholds = { ...DEFAULT_COVERAGE_THRESHOLDS };

export function configureQualityThresholds(newThresholds: Partial<CoverageThresholds>): CoverageThresholds {
  currentThresholds = { ...currentThresholds, ...newThresholds };
  return currentThresholds;
}

export function getQualityThresholds(): CoverageThresholds {
  return { ...currentThresholds };
}

export interface IndicatorTrace {
  indicatorId: string;
  indicatorName: string;
  companyId: string;
  periodId: string;
  sourceType: IndicatorSourceType; // NEVER 'SIMULATED' | 'ESTIMATED' | 'DEFAULT'
  sourceQuestionId?: string;
  sourceColumn?: string;
  totalRecords: number;
  applicableRecords: number;
  validRecords: number;
  missingRecords: number;
  notApplicableRecords: number;
  preferNotAnswerRecords: number;
  notAskedRecords: number;
  coveragePercentage: number; // (validRecords / applicableRecords) * 100
  calculationFormula?: string;
  result: any;
  dataQuality: IndicatorQualityLevel;
  generatedAt: string;
  explanationSentence: string;
  hasSufficientData: boolean;
  alertLevel: 'GREEN' | 'ORANGE' | 'RED';
}

export interface EvidenceResult {
  supported: boolean;
  confidence: IndicatorQualityLevel;
  source: IndicatorSourceType;
  questionId?: string;
  validResponses: number;
  totalRecords: number;
  coveragePercentage: number;
  result: any;
  formula?: string;
  statement: string;
  calculationBaseText: string;
  rejectionReason?: string;
}

export interface ExcelQualityReport {
  fileName: string;
  importedAt: string;
  companyId: string;
  periodId: string;
  totalRecords: number;
  expectedVariables: number;
  foundVariables: number;
  missingVariables: number;
  completeRecords: number;
  incompleteRecords: number;
  formatErrors: number;
  unparameterizedData: number;
  availableIndicators: number;
  unavailableIndicators: number;
  qualityLevel: IndicatorQualityLevel;
  details: string[];
}

export interface ReportAuditLog {
  reportId: string;
  companyId: string;
  periodId: string;
  generatedAt: string;
  generatedBy: string;
  dataVersion: string;
  indicatorTraces: IndicatorTrace[];
}

export class EvidenceService {
  private static auditLogs: ReportAuditLog[] = [];

  /**
   * Calculates coverage percentage and quality level based on valid vs applicable records.
   */
  public static validateCoverage(
    validRecords: number,
    applicableRecords: number,
    thresholds: CoverageThresholds = currentThresholds
  ): { coveragePercentage: number; quality: IndicatorQualityLevel; alertLevel: 'GREEN' | 'ORANGE' | 'RED' } {
    if (!applicableRecords || applicableRecords <= 0 || validRecords < 0) {
      return { coveragePercentage: 0, quality: 'INSUFFICIENT', alertLevel: 'RED' };
    }

    const coveragePercentage = Math.round((validRecords / applicableRecords) * 1000) / 10;

    if (validRecords === 0 || coveragePercentage < thresholds.insufficient) {
      return { coveragePercentage, quality: 'INSUFFICIENT', alertLevel: 'RED' };
    }
    if (coveragePercentage >= thresholds.high) {
      return { coveragePercentage, quality: 'HIGH', alertLevel: 'GREEN' };
    }
    if (coveragePercentage >= thresholds.medium) {
      return { coveragePercentage, quality: 'MEDIUM', alertLevel: 'ORANGE' };
    }
    return { coveragePercentage, quality: 'LOW', alertLevel: 'ORANGE' };
  }

  /**
   * Ensures sourceType is an official supported type.
   * Prohibits 'SIMULATED', 'ESTIMATED', 'DEFAULT'.
   */
  public static validateSource(sourceType: string): boolean {
    const forbidden = ['SIMULATED', 'ESTIMATED', 'DEFAULT', 'SYNTHETIC', 'IMPUTED'];
    if (forbidden.includes(sourceType?.toUpperCase())) {
      return false;
    }
    return ['EXCEL', 'SURVEY', 'CALCULATED', 'CONFIGURATION'].includes(sourceType?.toUpperCase());
  }

  /**
   * Generates a fully compliant IndicatorTrace from a set of employee survey responses.
   */
  public static buildIndicatorTrace(params: {
    indicatorId: string;
    indicatorName: string;
    companyId: string;
    periodId: string;
    sourceType: IndicatorSourceType;
    sourceQuestionId?: string;
    sourceColumn?: string;
    responsesList: any[]; // List of survey response records
    questionId?: string;
    isPositiveValue?: (val: any) => boolean;
    calculationFormula?: string;
    customResultComputer?: (validResponsesList: any[]) => any;
  }): IndicatorTrace {
    const {
      indicatorId,
      indicatorName,
      companyId,
      periodId,
      sourceType,
      sourceQuestionId,
      sourceColumn,
      responsesList = [],
      questionId = sourceQuestionId,
      isPositiveValue,
      calculationFormula,
      customResultComputer
    } = params;

    // Reject non-official sources
    if (!this.validateSource(sourceType)) {
      throw new Error(`Fuente prohibida "${sourceType}" en la generación del indicador "${indicatorName}".`);
    }

    const totalRecords = responsesList.length;
    let validRecords = 0;
    let missingRecords = 0;
    let notApplicableRecords = 0;
    let preferNotAnswerRecords = 0;
    let notAskedRecords = 0;
    let positiveCount = 0;

    const validValuesList: any[] = [];

    responsesList.forEach(respRecord => {
      // Get standard response item for this question
      const item = respRecord.responses?.[questionId || ''] || respRecord[questionId || ''];
      
      if (!item) {
        missingRecords++;
        return;
      }

      const status = item.responseStatus || (item.value === null ? 'MISSING' : 'ANSWERED');

      switch (status) {
        case 'ANSWERED':
        case 'NO':
        case 'OTHER':
          validRecords++;
          validValuesList.push(item.value === 'OTHER' ? (item.otherValue || 'Otro') : item.value);
          if (isPositiveValue && isPositiveValue(item.value)) {
            positiveCount++;
          }
          break;
        case 'PREFER_NOT_TO_ANSWER':
          preferNotAnswerRecords++;
          break;
        case 'NOT_APPLICABLE':
          notApplicableRecords++;
          break;
        case 'NOT_ASKED':
          notAskedRecords++;
          break;
        case 'MISSING':
        default:
          missingRecords++;
          break;
      }
    });

    const applicableRecords = totalRecords - notApplicableRecords - notAskedRecords;
    const { coveragePercentage, quality, alertLevel } = this.validateCoverage(validRecords, applicableRecords);

    let result: any = null;
    let explanationSentence = '';
    const hasSufficientData = quality !== 'INSUFFICIENT' && validRecords > 0;

    if (!hasSufficientData) {
      result = null;
      explanationSentence = 'Información no disponible. No se dispone de información suficiente para calcular este indicador.';
    } else if (customResultComputer) {
      result = customResultComputer(validValuesList);
      explanationSentence = `El indicador ${indicatorName} presenta un resultado de ${result}. (Base de respuestas válidas: ${validRecords} de ${applicableRecords} colaboradores aplicables).`;
    } else {
      const positivePct = Math.round((positiveCount / validRecords) * 1000) / 10;
      result = positivePct;
      explanationSentence = `El ${positivePct}% de los colaboradores que respondieron la pregunta reportó este criterio. (Base válida: ${validRecords} colaboradores).`;
    }

    return {
      indicatorId,
      indicatorName,
      companyId,
      periodId,
      sourceType,
      sourceQuestionId: questionId,
      sourceColumn,
      totalRecords,
      applicableRecords,
      validRecords,
      missingRecords,
      notApplicableRecords,
      preferNotAnswerRecords,
      notAskedRecords,
      coveragePercentage,
      calculationFormula: calculationFormula || (customResultComputer ? 'Custom Function' : `(validPositiveCount / validResponses) * 100`),
      result,
      dataQuality: quality,
      generatedAt: new Date().toISOString(),
      explanationSentence,
      hasSufficientData,
      alertLevel
    };
  }

  /**
   * Validates if a report statement is backed by true evidence.
   * Prohibits unsupported qualitative claims (e.g., "personal idóneo", "excelente clima laboral").
   */
  public static validateReportStatement(statementKey: string, trace?: IndicatorTrace): EvidenceResult {
    // List of forbidden subjective/unsupported qualitative phrases
    const forbiddenPhrases = [
      'PERSONAL IDÓNEO',
      'PERSONAL ALTAMENTE COMPROMETIDO',
      'EXCELENTE CLIMA LABORAL',
      'BAJO NIVEL DE ESTRÉS',
      'CONCENTRADO PRINCIPALMENTE EN CIUDADES PRINCIPALES',
      'ALTA SATISFACCIÓN',
      'DESEMPENHO PERFECTO',
      'CERO RIESGO'
    ];

    const keyUpper = statementKey.toUpperCase();
    for (const phrase of forbiddenPhrases) {
      if (keyUpper.includes(phrase)) {
        return {
          supported: false,
          confidence: 'INSUFFICIENT',
          source: trace?.sourceType || 'CONFIGURATION',
          validResponses: 0,
          totalRecords: trace?.totalRecords || 0,
          coveragePercentage: 0,
          result: null,
          statement: 'No se dispone de información suficiente para esta afirmación.',
          calculationBaseText: 'Sin evidencia empírica directa',
          rejectionReason: `Afirmación cualitativa prohibida "${phrase}" por carecer de respaldo directo en las variables de la encuesta.`
        };
      }
    }

    if (!trace || !trace.hasSufficientData) {
      return {
        supported: false,
        confidence: 'INSUFFICIENT',
        source: trace?.sourceType || 'SURVEY',
        questionId: trace?.sourceQuestionId,
        validResponses: trace?.validRecords || 0,
        totalRecords: trace?.totalRecords || 0,
        coveragePercentage: trace?.coveragePercentage || 0,
        result: null,
        statement: 'Información no disponible.',
        calculationBaseText: `Base de respuestas insuficientes (${trace?.validRecords || 0} respuestas válidas)`,
        rejectionReason: 'Falta de información suficiente en la muestra (cobertura < 50% o 0 respuestas válidas).'
      };
    }

    return {
      supported: true,
      confidence: trace.dataQuality,
      source: trace.sourceType,
      questionId: trace.sourceQuestionId,
      validResponses: trace.validRecords,
      totalRecords: trace.totalRecords,
      coveragePercentage: trace.coveragePercentage,
      result: trace.result,
      formula: trace.calculationFormula,
      statement: trace.explanationSentence,
      calculationBaseText: `Base válida: ${trace.validRecords} de ${trace.applicableRecords} colaboradores (${trace.coveragePercentage}% cobertura)`
    };
  }

  /**
   * Calculates Body Mass Index (IMC) strictly enforcing Prompt 25 Section 9 & 10:
   * Requires BOTH valid peso AND valid estatura.
   * If missing either -> IMC = null, no estimations, no averages.
   */
  public static calculateIMC(pesoKg: any, estaturaCm: any): { imc: number | null; trace: IndicatorTrace } {
    const rawPeso = pesoKg !== undefined && pesoKg !== null && pesoKg !== '' ? Number(pesoKg) : null;
    const rawEstatura = estaturaCm !== undefined && estaturaCm !== null && estaturaCm !== '' ? Number(estaturaCm) : null;

    const isValidPeso = rawPeso !== null && !isNaN(rawPeso) && rawPeso > 20 && rawPeso < 300;
    const isValidEstatura = rawEstatura !== null && !isNaN(rawEstatura) && rawEstatura > 50 && rawEstatura < 250;

    let imc: number | null = null;
    let quality: IndicatorQualityLevel = 'INSUFFICIENT';

    if (isValidPeso && isValidEstatura) {
      const estM = rawEstatura / 100;
      imc = Math.round((rawPeso / (estM * estM)) * 10) / 10;
      quality = 'HIGH';
    }

    const trace: IndicatorTrace = {
      indicatorId: 'imcCalculado',
      indicatorName: 'Índice de Masa Corporal (IMC)',
      companyId: 'CURRENT',
      periodId: 'CURRENT',
      sourceType: 'CALCULATED',
      sourceQuestionId: 'pesoKg / estaturaCm',
      totalRecords: 1,
      applicableRecords: 1,
      validRecords: imc !== null ? 1 : 0,
      missingRecords: imc !== null ? 0 : 1,
      notApplicableRecords: 0,
      preferNotAnswerRecords: 0,
      notAskedRecords: 0,
      coveragePercentage: imc !== null ? 100 : 0,
      calculationFormula: 'pesoKg / (estaturaCm / 100)^2',
      result: imc,
      dataQuality: quality,
      generatedAt: new Date().toISOString(),
      explanationSentence: imc !== null
        ? `IMC calculado de ${imc} kg/m² basado en peso (${rawPeso} kg) y estatura (${rawEstatura} cm).`
        : 'Información no disponible. Se requiere registrar tanto peso como estatura válidos para calcular el IMC.',
      hasSufficientData: imc !== null,
      alertLevel: imc !== null ? 'GREEN' : 'RED'
    };

    return { imc, trace };
  }

  /**
   * Generates a Data Quality Summary Report after importing an Excel file.
   */
  public static generateExcelQualityReport(params: {
    fileName: string;
    companyId: string;
    periodId: string;
    totalRecords: number;
    expectedVariables: number;
    foundVariables: number;
    completeRecords: number;
    incompleteRecords: number;
    formatErrors: number;
    unparameterizedData: number;
    availableIndicators: number;
    unavailableIndicators: number;
    details?: string[];
  }): ExcelQualityReport {
    const missingVariables = Math.max(0, params.expectedVariables - params.foundVariables);
    const coverage = params.totalRecords > 0 ? (params.completeRecords / params.totalRecords) * 100 : 0;

    let qualityLevel: IndicatorQualityLevel = 'HIGH';
    if (coverage < 50 || missingVariables > 5) qualityLevel = 'INSUFFICIENT';
    else if (coverage < 70) qualityLevel = 'LOW';
    else if (coverage < 90) qualityLevel = 'MEDIUM';

    return {
      fileName: params.fileName,
      importedAt: new Date().toISOString(),
      companyId: params.companyId,
      periodId: params.periodId,
      totalRecords: params.totalRecords,
      expectedVariables: params.expectedVariables,
      foundVariables: params.foundVariables,
      missingVariables,
      completeRecords: params.completeRecords,
      incompleteRecords: params.incompleteRecords,
      formatErrors: params.formatErrors,
      unparameterizedData: params.unparameterizedData,
      availableIndicators: params.availableIndicators,
      unavailableIndicators: params.unavailableIndicators,
      qualityLevel,
      details: params.details || [
        `Carga completada el ${new Date().toLocaleDateString('es-CO')}.`,
        `Cobertura de registros completos: ${Math.round(coverage)}%.`,
        `Variables esperadas encontradas: ${params.foundVariables} de ${params.expectedVariables}.`
      ]
    };
  }

  /**
   * Registers a report generation in the audit log.
   */
  public static logReportAudit(
    reportId: string,
    companyId: string,
    periodId: string,
    generatedBy: string,
    traces: IndicatorTrace[]
  ): ReportAuditLog {
    const log: ReportAuditLog = {
      reportId,
      companyId,
      periodId,
      generatedAt: new Date().toISOString(),
      generatedBy,
      dataVersion: `v${Date.now()}`,
      indicatorTraces: traces
    };

    this.auditLogs.push(log);
    return log;
  }

  public static getAuditLogs(): ReportAuditLog[] {
    return [...this.auditLogs];
  }
}
