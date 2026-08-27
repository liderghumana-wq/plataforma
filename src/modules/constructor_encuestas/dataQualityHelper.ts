/**
 * PROMPT 24 — DATA QUALITY & RESPONSE STATUS HELPER MODULE
 * Enforces standardized response statuses (ANSWERED, NO, PREFER_NOT_TO_ANSWER,
 * NOT_APPLICABLE, OTHER, MISSING, NOT_ASKED), zero synthetic data conversion,
 * calculation bases for indicators, health data non-inference, consistency rules,
 * and executive report phrasing.
 */

import { ResponseStatus, DataQualityClassification, AnswerSource, StandardResponseItem } from './types';
import { parseOtroValue, isOtroOption } from './otroHelper';

export interface ConsistencyCheckResult {
  isConsistent: boolean;
  errors: string[];
  warnings: string[];
}

export interface MetricIndicatorResult {
  metricId: string;
  metricTitle: string;
  totalRespondents: number;
  validBaseCount: number;
  yesCount: number;
  noCount: number;
  preferNotToAnswerCount: number;
  notApplicableCount: number;
  otherCount: number;
  missingCount: number;
  notAskedCount: number;
  percentageOverValidBase: number | null; // Null if valid base == 0
  calculationBaseText: string;
  executiveReportSentence: string;
  hasSufficientData: boolean;
}

/**
 * Standardizes any question response into Prompt 24 standard structure.
 * Golden Rule: NEVER convert null to 'No', 'No aplica', '0', etc.
 */
export function buildStandardResponseItem(params: {
  questionId: string;
  rawValue: any;
  isAsked?: boolean;
  isApplicable?: boolean;
  source?: AnswerSource;
}): StandardResponseItem {
  const {
    questionId,
    rawValue,
    isAsked = true,
    isApplicable = true,
    source = 'SURVEY'
  } = params;

  const updatedAt = new Date().toISOString();

  // Rule 8: If question was not presented due to branch logic
  if (!isAsked) {
    return {
      questionId,
      value: null,
      responseStatus: 'NOT_ASKED',
      source,
      updatedAt
    };
  }

  // Rule 5: If explicitly not applicable
  if (!isApplicable) {
    return {
      questionId,
      value: null,
      responseStatus: 'NOT_APPLICABLE',
      source,
      updatedAt
    };
  }

  // Rule 6 & 9: Empty/null/undefined
  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return {
      questionId,
      value: null,
      responseStatus: 'MISSING',
      source,
      updatedAt
    };
  }

  // Rule 4: "Prefiero no responder"
  if (
    typeof rawValue === 'string' &&
    (rawValue.trim().toUpperCase() === 'PREFIERO NO RESPONDER' ||
     rawValue.trim().toUpperCase() === 'PREFIERO_NO_RESPONDER')
  ) {
    return {
      questionId,
      value: null,
      responseStatus: 'PREFER_NOT_TO_ANSWER',
      source,
      updatedAt
    };
  }

  // Rule 5: "No aplica" string selection
  if (
    typeof rawValue === 'string' &&
    (rawValue.trim().toUpperCase() === 'NO APLICA' ||
     rawValue.trim().toUpperCase() === 'NO_APLICA')
  ) {
    return {
      questionId,
      value: null,
      responseStatus: 'NOT_APPLICABLE',
      source,
      updatedAt
    };
  }

  // Rule 7: "Otro" option
  const parsedOtro = parseOtroValue(rawValue);
  if (parsedOtro.isOtro) {
    return {
      questionId,
      value: 'OTHER',
      otherValue: parsedOtro.otherValue || '',
      responseStatus: 'OTHER',
      source,
      updatedAt
    };
  }

  // Rule 3: Explicit "No"
  if (
    typeof rawValue === 'string' &&
    (rawValue.trim().toUpperCase() === 'NO' || rawValue.trim().toUpperCase() === 'FALSO')
  ) {
    return {
      questionId,
      value: 'NO',
      responseStatus: 'NO',
      source,
      updatedAt
    };
  }

  // Standard Answered (e.g. "Sí", "Bogotá", 30, ["Opción 1"])
  return {
    questionId,
    value: typeof rawValue === 'object' && rawValue !== null && rawValue.option ? rawValue.option : rawValue,
    responseStatus: 'ANSWERED',
    source,
    updatedAt
  };
}

/**
 * SECTION 17 — AUTOMATED CONSISTENCY CHECKS
 * Validates logical consistency across dependent questions.
 */
export function validateSurveyConsistency(responses: Record<string, StandardResponseItem | any>): ConsistencyCheckResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const getVal = (key: string): any => {
    const item = responses[key];
    if (!item) return null;
    return item.value !== undefined ? item.value : item.answer ?? item;
  };

  const getStatus = (key: string): ResponseStatus | null => {
    const item = responses[key];
    if (!item) return null;
    return item.responseStatus || null;
  };

  // 1. Children consistency check
  const tieneHijosVal = getVal('tieneHijos');
  const numHijosVal = getVal('numeroHijos');
  const numHijosStatus = getStatus('numeroHijos');

  if (tieneHijosVal === 'NO' || tieneHijosVal === 'No') {
    if (numHijosVal !== null && numHijosVal !== undefined && Number(numHijosVal) > 0) {
      errors.push("ERROR DE CONSISTENCIA: Indico 'No tiene hijos' pero reporta un número de hijos mayor a 0.");
    }
  } else if (tieneHijosVal === 'SÍ' || tieneHijosVal === 'Sí' || tieneHijosVal === 'SI') {
    if (numHijosVal === null || numHijosVal === undefined) {
      errors.push("INCOMPLETO: Indico 'Tiene hijos = Sí' pero el número de hijos está vacío.");
    }
  } else if (tieneHijosVal === 'PREFIERO_NO_RESPONDER' || getStatus('tieneHijos') === 'PREFER_NOT_TO_ANSWER') {
    if (numHijosStatus !== 'NOT_ASKED' && numHijosVal !== null) {
      warnings.push("Aviso: 'Prefiero no responder' en hijos debe mantener número de hijos como no consultado.");
    }
  }

  // 2. Physical activity consistency check
  const actFisVal = getVal('actividadFisicaRegular');
  const tipoActVal = getVal('tipoActividadFisica');
  if ((actFisVal === 'NO' || actFisVal === 'No') && tipoActVal !== null && tipoActVal !== undefined) {
    errors.push("ERROR DE CONSISTENCIA: Indico 'No realiza actividad física' pero tiene especificado un tipo de deporte.");
  }

  // 3. Disability consistency check
  const presDiscapVal = getVal('presentaDiscapacidad');
  const requiereAjusteVal = getVal('requiereAjusteLaboral');
  if ((presDiscapVal === 'NO' || presDiscapVal === 'No') && requiereAjusteVal !== null && requiereAjusteVal !== undefined) {
    errors.push("ERROR DE CONSISTENCIA: Indico 'No presenta discapacidad' pero reporta un ajuste laboral.");
  }

  return {
    isConsistent: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * SECTION 14 — DATA QUALITY CLASSIFICATION FOR ENTIRE SURVEY RESPONSE
 */
export function classifyDataQuality(
  responseMap: Record<string, StandardResponseItem | any>,
  requiredQuestionIds: string[] = []
): DataQualityClassification {
  let hasMissingRequired = false;
  let hasPreferNotToAnswer = false;
  let hasMissingOptional = false;
  let allNotApplicable = true;

  const items = Object.values(responseMap);

  if (items.length === 0) return 'INCOMPLETO';

  items.forEach(item => {
    const qId = item.questionId;
    const status: ResponseStatus = item.responseStatus || (item.answered ? 'ANSWERED' : 'MISSING');
    const isRequired = requiredQuestionIds.includes(qId);

    if (status !== 'NOT_APPLICABLE' && status !== 'NOT_ASKED') {
      allNotApplicable = false;
    }

    if (status === 'PREFER_NOT_TO_ANSWER') {
      hasPreferNotToAnswer = true;
    } else if (status === 'MISSING') {
      if (isRequired) {
        hasMissingRequired = true;
      } else {
        hasMissingOptional = true;
      }
    }
  });

  if (allNotApplicable) return 'NO APLICA';
  if (hasMissingRequired) return 'INCOMPLETO';
  if (hasPreferNotToAnswer) return 'PREFIERE NO RESPONDER';
  if (hasMissingOptional) return 'PARCIAL';
  return 'COMPLETO';
}

/**
 * SECTION 12, 13, 19 — INDICATORS WITH REAL CALCULATION BASE
 * Calculates indicator metrics strictly excluding missing / prefer_not_to_answer / not_asked from base.
 */
export function calculateIndicatorMetric(params: {
  metricId: string;
  metricTitle: string;
  responsesList: Array<Record<string, StandardResponseItem | any>>;
  questionId: string;
  isPositiveResponse: (val: any, item: StandardResponseItem) => boolean;
}): MetricIndicatorResult {
  const { metricId, metricTitle, responsesList, questionId, isPositiveResponse } = params;

  const totalRespondents = responsesList.length;
  let validBaseCount = 0;
  let yesCount = 0;
  let noCount = 0;
  let preferNotToAnswerCount = 0;
  let notApplicableCount = 0;
  let otherCount = 0;
  let missingCount = 0;
  let notAskedCount = 0;

  responsesList.forEach(rMap => {
    const rawItem = rMap[questionId] || rMap.responses?.[questionId];
    
    let stdItem: StandardResponseItem;
    if (rawItem && rawItem.responseStatus) {
      stdItem = rawItem as StandardResponseItem;
    } else {
      stdItem = buildStandardResponseItem({
        questionId,
        rawValue: rawItem?.answer ?? rawItem?.valor ?? rawItem
      });
    }

    switch (stdItem.responseStatus) {
      case 'PREFER_NOT_TO_ANSWER':
        preferNotToAnswerCount++;
        break;
      case 'NOT_APPLICABLE':
        notApplicableCount++;
        break;
      case 'MISSING':
        missingCount++;
        break;
      case 'NOT_ASKED':
        notAskedCount++;
        break;
      case 'NO':
        validBaseCount++;
        noCount++;
        break;
      case 'OTHER':
        validBaseCount++;
        otherCount++;
        if (isPositiveResponse(stdItem.value, stdItem)) {
          yesCount++;
        }
        break;
      case 'ANSWERED':
      default:
        validBaseCount++;
        if (isPositiveResponse(stdItem.value, stdItem)) {
          yesCount++;
        } else {
          noCount++;
        }
        break;
    }
  });

  const hasSufficientData = validBaseCount > 0;
  const percentageOverValidBase = hasSufficientData
    ? Math.round((yesCount / validBaseCount) * 1000) / 10
    : null;

  const calculationBaseText = `Base válida: ${validBaseCount} de ${totalRespondents} colaboradores`;

  // SECTION 15 & 16 — EXECUTIVE REPORT SENTENCE GENERATOR
  let executiveReportSentence = '';
  if (!hasSufficientData) {
    executiveReportSentence = `No se dispone de información suficiente para calcular el indicador de ${metricTitle.toLowerCase()}.`;
  } else {
    executiveReportSentence = `El ${percentageOverValidBase?.toLocaleString('es-CO')}% de los colaboradores que respondieron la pregunta reportó ${metricTitle.toLowerCase()} (${calculationBaseText}).`;
  }

  return {
    metricId,
    metricTitle,
    totalRespondents,
    validBaseCount,
    yesCount,
    noCount,
    preferNotToAnswerCount,
    notApplicableCount,
    otherCount,
    missingCount,
    notAskedCount,
    percentageOverValidBase,
    calculationBaseText,
    executiveReportSentence,
    hasSufficientData
  };
}

/**
 * SECTION 18 — EXCEL EXPORT FORMATTER PER RESPONSE ITEM
 * Exports exact keys: questionId, value, otherValue, responseStatus, source
 */
export function formatResponseForExcelAudit(
  questionId: string,
  rawItem: StandardResponseItem | any
): Record<string, string> {
  const stdItem = (rawItem && rawItem.responseStatus)
    ? (rawItem as StandardResponseItem)
    : buildStandardResponseItem({ questionId, rawValue: rawItem?.answer ?? rawItem?.valor ?? rawItem });

  return {
    [`${questionId}_value`]: stdItem.value === null ? '' : String(stdItem.value),
    [`${questionId}_otherValue`]: stdItem.otherValue || '',
    [`${questionId}_responseStatus`]: stdItem.responseStatus,
    [`${questionId}_source`]: stdItem.source
  };
}
