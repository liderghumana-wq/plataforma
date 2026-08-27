/**
 * PROMPT 24 TEST RUNNER — AUTOMATED UNIT & INTEGRATION TEST SUITE
 * Validates all 14 mandatory test cases for response statuses, data quality rules,
 * conditional questions, Excel imports, calculations, indicators, and reports.
 */

import { validateAndProcessSurveySubmission, mapExcelRowToSurveyResponse } from './prompt21Engine';
import { calculateIndicatorMetric, validateSurveyConsistency, buildStandardResponseItem } from './dataQualityHelper';

export interface Prompt24TestResult {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  details: string;
  observedOutput?: any;
}

export interface Prompt24TestSuiteSummary {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: Prompt24TestResult[];
}

export function runPrompt24TestSuite(): Prompt24TestSuiteSummary {
  const results: Prompt24TestResult[] = [];

  const baseAnswersP24 = {
    sede: 'Sede Principal (Bogotá)',
    area: 'Administrativa y Financiera',
    cargo: 'Analista Administrativo',
    tipoContrato: 'Término Indefinido',
    fechaIngreso: '2022-01-15',
    modalidadTrabajo: 'Presencial',
    edad: 32,
    sexo: 'Femenino',
    estadoCivil: 'Soltero(a)',
    ciudadResidencia: 'Bogotá',
    nivelEducativo: 'Profesional',
    estrato: '3',
    tipoVivienda: 'Arrendada',
    personasHogar: 2,
    viveSolo: 'No',
    tienePersonasACargo: 'No',
    tieneHijos: 'No',
    saludDiagnosticoRelevante: 'No',
    consumeMedicamentosFrecuente: 'No',
    presentaAlergias: 'No',
    molestiasOsteomusculares: 'No',
    presentaDiscapacidad: 'No',
    actividadFisicaRegular: 'No',
    nivelHabitualActividadFisica: 'Ligeramente activo',
    actividadTiempoLibre: 'Lectura o estudio'
  };

  // 1. TEST 1: Respuesta "Sí"
  try {
    const raw = { ...baseAnswersP24, tieneHijos: 'Sí', numeroHijos: 2 };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P24-TEST-EMP',
      surveyId: 'SURVEY-P24',
      periodId: '2026-P1',
      employeeId: 'EMP-P24-01',
      rawAnswers: raw
    });
    const item = res.response.responses['tieneHijos'];
    const passed = item?.responseStatus === 'ANSWERED' && (item?.value === 'Sí' || item?.value === 'SÍ');
    results.push({
      id: 'P24-T01',
      title: '1. Respuesta "Sí"',
      description: 'Verifica que seleccionar "Sí" genera responseStatus = ANSWERED.',
      passed,
      details: passed ? 'Status ANSWERED confirmado para respuesta "Sí".' : 'Status incorrecto para "Sí".',
      observedOutput: item
    });
  } catch (e: any) {
    results.push({ id: 'P24-T01', title: '1. Respuesta "Sí"', description: 'Exception', passed: false, details: e.message });
  }

  // 2. TEST 2: Respuesta "No" (Dato Válido, NO es missing!)
  try {
    const raw = { ...baseAnswersP24, tieneHijos: 'No' };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P24-TEST-EMP',
      surveyId: 'SURVEY-P24',
      periodId: '2026-P1',
      employeeId: 'EMP-P24-02',
      rawAnswers: raw
    });
    const item = res.response.responses['tieneHijos'];
    const passed = item?.responseStatus === 'NO' && item?.value === 'NO' && item?.answered === true;
    results.push({
      id: 'P24-T02',
      title: '2. Respuesta "No"',
      description: 'Verifica que responder "No" guarda responseStatus = NO y NUNCA se clasifica como missing.',
      passed,
      details: passed ? 'Status NO y answered=true confirmados para "No".' : 'Error en respuesta "No".',
      observedOutput: item
    });
  } catch (e: any) {
    results.push({ id: 'P24-T02', title: '2. Respuesta "No"', description: 'Exception', passed: false, details: e.message });
  }

  // 3. TEST 3: "Prefiero no responder" (NUNCA convertir a "No")
  try {
    const raw = { ...baseAnswersP24, tieneHijos: 'Prefiero no responder' };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P24-TEST-EMP',
      surveyId: 'SURVEY-P24',
      periodId: '2026-P1',
      employeeId: 'EMP-P24-03',
      rawAnswers: raw
    });
    const item = res.response.responses['tieneHijos'];
    const passed = item?.responseStatus === 'PREFER_NOT_TO_ANSWER' && item?.value === null;
    results.push({
      id: 'P24-T03',
      title: '3. Prefiero no responder',
      description: 'Verifica status PREFER_NOT_TO_ANSWER, value = null. Garantiza NUNCA convertirlo a "No".',
      passed,
      details: passed ? 'Confirmado: Prefiero no responder conserva value = null y status PREFER_NOT_TO_ANSWER.' : 'Error al procesar Prefiero no responder.',
      observedOutput: item
    });
  } catch (e: any) {
    results.push({ id: 'P24-T03', title: '3. Prefiero no responder', description: 'Exception', passed: false, details: e.message });
  }

  // 4. TEST 4: "No aplica"
  try {
    const raw = { ...baseAnswersP24, tieneHijos: 'No aplica' };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P24-TEST-EMP',
      surveyId: 'SURVEY-P24',
      periodId: '2026-P1',
      employeeId: 'EMP-P24-04',
      rawAnswers: raw
    });
    const item = res.response.responses['tieneHijos'];
    const passed = item?.responseStatus === 'NOT_APPLICABLE' && item?.value === null;
    results.push({
      id: 'P24-T04',
      title: '4. No aplica',
      description: 'Verifica status NOT_APPLICABLE, value = null.',
      passed,
      details: passed ? 'Status NOT_APPLICABLE confirmado para "No aplica".' : 'Error en "No aplica".',
      observedOutput: item
    });
  } catch (e: any) {
    results.push({ id: 'P24-T04', title: '4. No aplica', description: 'Exception', passed: false, details: e.message });
  }

  // 5. TEST 5: Opción "Otro" especificada
  try {
    const raw = { ...baseAnswersP24, actividadTiempoLibre: { option: 'OTRO', otherValue: 'Ajedrez competitivo' } };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P24-TEST-EMP',
      surveyId: 'SURVEY-P24',
      periodId: '2026-P1',
      employeeId: 'EMP-P24-05',
      rawAnswers: raw
    });
    const item = res.response.responses['actividadTiempoLibre'];
    const passed = item?.responseStatus === 'OTHER' && item?.value === 'OTHER' && item?.otherValue === 'Ajedrez competitivo';
    results.push({
      id: 'P24-T05',
      title: '5. Otro (Especificado)',
      description: 'Verifica status OTHER con value = "OTHER" y texto en otherValue.',
      passed,
      details: passed ? 'Respuesta "Otro" correctamente guardada con especificación.' : 'Error al guardar "Otro" especificado.',
      observedOutput: item
    });
  } catch (e: any) {
    results.push({ id: 'P24-T05', title: '5. Otro (Especificado)', description: 'Exception', passed: false, details: e.message });
  }

  // 6. TEST 6: Otro sin especificación (Obligatorio especificación)
  try {
    const raw = { ...baseAnswersP24, actividadTiempoLibre: { option: 'OTRO', otherValue: '' } };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P24-TEST-EMP',
      surveyId: 'SURVEY-P24',
      periodId: '2026-P1',
      employeeId: 'EMP-P24-06',
      rawAnswers: raw
    });
    const item = res.response.responses['actividadTiempoLibre'];
    const passed = item?.responseStatus === 'OTHER' && res.response.completionStatus === 'INCOMPLETE' && res.missingRequiredFields.includes('actividadTiempoLibre');
    results.push({
      id: 'P24-T06',
      title: '6. Otro sin especificación',
      description: 'Verifica que "Otro" sin texto en "¿Cuál?" marca la encuesta como INCOMPLETE y genera error.',
      passed,
      details: passed ? 'Encuesta marcada como INCOMPLETE por falta de especificación en "Otro".' : 'Error en validación de "Otro" sin especificación.',
      observedOutput: { item, completionStatus: res.response.completionStatus, errors: res.errors }
    });
  } catch (e: any) {
    results.push({ id: 'P24-T06', title: '6. Otro sin especificación', description: 'Exception', passed: false, details: e.message });
  }

  // 7. TEST 7: Pregunta vacía (Opcional MISSING, Obligatoria Error)
  try {
    const rawNoEdad = { ...baseAnswersP24, edad: '' }; // Required field
    const resInvalid = validateAndProcessSurveySubmission({
      companyId: 'P24-TEST-EMP',
      surveyId: 'SURVEY-P24',
      periodId: '2026-P1',
      employeeId: 'EMP-P24-07',
      rawAnswers: rawNoEdad
    });
    const itemEdad = resInvalid.response.responses['edad'];
    const passed = itemEdad?.responseStatus === 'MISSING' && itemEdad?.value === null && resInvalid.response.completionStatus === 'INCOMPLETE';
    results.push({
      id: 'P24-T07',
      title: '7. Pregunta vacía',
      description: 'Verifica que campo vacío guarda responseStatus = MISSING, value = null y bloquea finalización si es obligatorio.',
      passed,
      details: passed ? 'Pregunta vacía genera MISSING y value = null sin autocompletar.' : 'Error en pregunta vacía.',
      observedOutput: itemEdad
    });
  } catch (e: any) {
    results.push({ id: 'P24-T07', title: '7. Pregunta vacía', description: 'Exception', passed: false, details: e.message });
  }

  // 8. TEST 8: Pregunta condicional no mostrada (NOT_ASKED)
  try {
    const rawNoHijos = { ...baseAnswersP24, tieneHijos: 'No', numeroHijos: null };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P24-TEST-EMP',
      surveyId: 'SURVEY-P24',
      periodId: '2026-P1',
      employeeId: 'EMP-P24-08',
      rawAnswers: rawNoHijos
    });
    const itemNumeroHijos = res.response.responses['numeroHijos'];
    const passed = itemNumeroHijos?.responseStatus === 'NOT_ASKED' && itemNumeroHijos?.value === null && res.isValid;
    results.push({
      id: 'P24-T08',
      title: '8. Pregunta condicional no mostrada',
      description: 'Verifica que si tieneHijos = No, la pregunta numeroHijos recibe responseStatus = NOT_ASKED y NO se marca como MISSING.',
      passed,
      details: passed ? 'Pregunta no mostrada correctamente asignada como NOT_ASKED.' : 'Error en pregunta condicional no mostrada.',
      observedOutput: itemNumeroHijos
    });
  } catch (e: any) {
    results.push({ id: 'P24-T08', title: '8. Pregunta condicional no mostrada', description: 'Exception', passed: false, details: e.message });
  }

  // 9. TEST 9: Excel con celda vacía
  try {
    const excelRowEmpty = {
      cedula: '1098765432',
      sede: 'Sede Principal',
      pesoKg: '', // Empty cell
      tieneHijos: 'No'
    };
    const response = mapExcelRowToSurveyResponse(excelRowEmpty, 'P24-TEST-EMP');
    const itemPeso = response.responses['pesoKg'];
    const passed = itemPeso?.responseStatus === 'MISSING' && itemPeso?.value === null && itemPeso?.source === 'EXCEL';
    results.push({
      id: 'P24-T09',
      title: '9. Excel con celda vacía',
      description: 'Verifica que una celda vacía de Excel guarda responseStatus = MISSING, value = null, source = EXCEL.',
      passed,
      details: passed ? 'Celda vacía de Excel importada como MISSING sin asumir valor predeterminado.' : 'Error al importar celda vacía de Excel.',
      observedOutput: itemPeso
    });
  } catch (e: any) {
    results.push({ id: 'P24-T09', title: '9. Excel con celda vacía', description: 'Exception', passed: false, details: e.message });
  }

  // 10. TEST 10: Excel con "No"
  try {
    const excelRowNo = {
      cedula: '1098765433',
      tienehijos: 'No'
    };
    const response = mapExcelRowToSurveyResponse(excelRowNo, 'P24-TEST-EMP');
    const item = response.responses['tieneHijos'];
    const passed = item?.responseStatus === 'NO' && item?.value === 'NO' && item?.source === 'EXCEL';
    results.push({
      id: 'P24-T10',
      title: '10. Excel con "No"',
      description: 'Verifica que celda Excel con "No" asigna responseStatus = NO y source = EXCEL.',
      passed,
      details: passed ? 'Importación de "No" desde Excel verificada correctamente.' : 'Error en Excel con "No".',
      observedOutput: item
    });
  } catch (e: any) {
    results.push({ id: 'P24-T10', title: '10. Excel con "No"', description: 'Exception', passed: false, details: e.message });
  }

  // 11. TEST 11: Excel con "Sí"
  try {
    const excelRowSi = {
      cedula: '1098765434',
      tienehijos: 'Sí',
      numerohijos: '2'
    };
    const response = mapExcelRowToSurveyResponse(excelRowSi, 'P24-TEST-EMP');
    const item = response.responses['tieneHijos'];
    const passed = item?.responseStatus === 'ANSWERED' && (item?.value === 'Sí' || item?.value === 'SÍ') && item?.source === 'EXCEL';
    results.push({
      id: 'P24-T11',
      title: '11. Excel con "Sí"',
      description: 'Verifica que celda Excel con "Sí" asigna responseStatus = ANSWERED y source = EXCEL.',
      passed,
      details: passed ? 'Importación de "Sí" desde Excel verificada correctamente.' : 'Error en Excel con "Sí".',
      observedOutput: item
    });
  } catch (e: any) {
    results.push({ id: 'P24-T11', title: '11. Excel con "Sí"', description: 'Exception', passed: false, details: e.message });
  }

  // 12. TEST 12: Excel con "Prefiero no responder"
  try {
    const excelRowPref = {
      cedula: '1098765435',
      tienehijos: 'Prefiero no responder'
    };
    const response = mapExcelRowToSurveyResponse(excelRowPref, 'P24-TEST-EMP');
    const item = response.responses['tieneHijos'];
    const passed = item?.responseStatus === 'PREFER_NOT_TO_ANSWER' && item?.value === null && item?.source === 'EXCEL';
    results.push({
      id: 'P24-T12',
      title: '12. Excel con "Prefiero no responder"',
      description: 'Verifica importación de "Prefiero no responder" desde Excel sin convertir a "No".',
      passed,
      details: passed ? 'Excel "Prefiero no responder" asignado a PREFER_NOT_TO_ANSWER con value = null.' : 'Error en Excel con Prefiero no responder.',
      observedOutput: item
    });
  } catch (e: any) {
    results.push({ id: 'P24-T12', title: '12. Excel con "Prefiero no responder"', description: 'Exception', passed: false, details: e.message });
  }

  // 13. TEST 13: Cálculo con dato faltante (IMC con peso nulo)
  try {
    const rawFaltaPeso = { ...baseAnswersP24, pesoKg: '', estaturaCm: 170 };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P24-TEST-EMP',
      surveyId: 'SURVEY-P24',
      periodId: '2026-P1',
      employeeId: 'EMP-P24-13',
      rawAnswers: rawFaltaPeso
    });
    const itemIMC = res.response.responses['imcCalculado'];
    const passed = itemIMC?.value === null && itemIMC?.responseStatus === 'MISSING' && itemIMC?.source === 'CALCULATED';
    results.push({
      id: 'P24-T13',
      title: '13. Cálculo con dato faltante',
      description: 'Verifica que si falta el peso, IMC = null, responseStatus = MISSING, source = CALCULATED sin estimar.',
      passed,
      details: passed ? 'Cálculo de IMC con peso nulo produce IMC = null sin invención de estatura o peso.' : 'Error en cálculo con dato faltante.',
      observedOutput: itemIMC
    });
  } catch (e: any) {
    results.push({ id: 'P24-T13', title: '13. Cálculo con dato faltante', description: 'Exception', passed: false, details: e.message });
  }

  // 14. TEST 14: Indicador con información insuficiente
  try {
    const responsesInsuf: any[] = [
      { presentaDiscapacidad: buildStandardResponseItem({ questionId: 'presentaDiscapacidad', rawValue: 'Prefiero no responder' }) },
      { presentaDiscapacidad: buildStandardResponseItem({ questionId: 'presentaDiscapacidad', rawValue: '' }) },
      { presentaDiscapacidad: buildStandardResponseItem({ questionId: 'presentaDiscapacidad', rawValue: null }) },
      { presentaDiscapacidad: buildStandardResponseItem({ questionId: 'presentaDiscapacidad', rawValue: null, isAsked: false }) }
    ];

    const metricRes = calculateIndicatorMetric({
      metricId: 'discapacidad_porcentaje',
      metricTitle: 'Discapacidad',
      responsesList: responsesInsuf,
      questionId: 'presentaDiscapacidad',
      isPositiveResponse: (v) => v === 'Sí' || v === 'SÍ'
    });

    const passed = (
      metricRes.validBaseCount === 0 &&
      metricRes.percentageOverValidBase === null &&
      metricRes.hasSufficientData === false &&
      metricRes.executiveReportSentence.includes('No se dispone de información suficiente')
    );

    results.push({
      id: 'P24-T14',
      title: '14. Indicador con información insuficiente',
      description: 'Verifica que con 0 respuestas válidas, el sistema muestra "No se dispone de información suficiente" y NO reporta 0%.',
      passed,
      details: passed ? 'Reporte directivo emite frase explícita de información insuficiente sin asumir 0%.' : 'Error en indicador con información insuficiente.',
      observedOutput: metricRes
    });
  } catch (e: any) {
    results.push({ id: 'P24-T14', title: '14. Indicador con información insuficiente', description: 'Exception', passed: false, details: e.message });
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;
  const allPassed = failedCount === 0;

  return {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passedCount,
    failedCount,
    allPassed,
    results
  };
}
