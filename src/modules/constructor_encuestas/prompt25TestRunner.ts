/**
 * PROMPT 25 TEST RUNNER — AUTOMATED UNIT & INTEGRATION TEST SUITE (18 TESTS)
 * Verifies end-to-end data quality, traceability, EvidenceService, IMC calculation,
 * report statement validation, and company data isolation.
 */

import { EvidenceService, IndicatorTrace, IndicatorQualityLevel, configureQualityThresholds } from './evidenceService';
import { validateAndProcessSurveySubmission, mapExcelRowToSurveyResponse } from './prompt21Engine';
import { buildStandardResponseItem } from './dataQualityHelper';

export interface Prompt25TestResult {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  details: string;
  observedOutput?: any;
}

export interface Prompt25TestSuiteSummary {
  timestamp: string;
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: Prompt25TestResult[];
}

export function runPrompt25TestSuite(): Prompt25TestSuiteSummary {
  const results: Prompt25TestResult[] = [];

  const baseAnswersP25 = {
    sede: 'Sede Principal (Bogotá)',
    area: 'Administrativa',
    cargo: 'Analista',
    tipoContrato: 'Término Indefinido',
    fechaIngreso: '2022-01-15',
    modalidadTrabajo: 'Presencial',
    edad: 30,
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
    actividadFisicaRegular: 'No'
  };

  // 1. Excel completo
  try {
    const recordsExcel = Array.from({ length: 10 }).map((_, i) => ({
      responses: {
        tieneHijos: buildStandardResponseItem({ questionId: 'tieneHijos', rawValue: i < 6 ? 'Sí' : 'No', source: 'EXCEL' })
      }
    }));
    const trace = EvidenceService.buildIndicatorTrace({
      indicatorId: 'IND-EXCEL-01',
      indicatorName: 'Tiene Hijos (Excel)',
      companyId: 'EMP-P25',
      periodId: '2026-P1',
      sourceType: 'EXCEL',
      sourceQuestionId: 'tieneHijos',
      responsesList: recordsExcel,
      isPositiveValue: (v) => v === 'Sí' || v === 'SÍ'
    });
    const passed = trace.validRecords === 10 && trace.dataQuality === 'HIGH' && trace.result === 60;
    results.push({
      id: 'P25-T01',
      title: '1. Excel completo',
      description: 'Verifica traza de calidad ALTA (HIGH) con 100% registros válidos importados.',
      passed,
      details: passed ? 'Traza de Excel completo validada correctamente (100% cobertura, calidad HIGH).' : 'Error en traza de Excel completo.',
      observedOutput: trace
    });
  } catch (e: any) {
    results.push({ id: 'P25-T01', title: '1. Excel completo', description: 'Exception', passed: false, details: e.message });
  }

  // 2. Excel parcialmente diligenciado
  try {
    const recordsParcial = [
      ...Array.from({ length: 6 }).map(() => ({ responses: { tieneHijos: buildStandardResponseItem({ questionId: 'tieneHijos', rawValue: 'Sí', source: 'EXCEL' }) } })),
      ...Array.from({ length: 4 }).map(() => ({ responses: { tieneHijos: buildStandardResponseItem({ questionId: 'tieneHijos', rawValue: '', source: 'EXCEL' }) } }))
    ];
    const trace = EvidenceService.buildIndicatorTrace({
      indicatorId: 'IND-EXCEL-PARCIAL',
      indicatorName: 'Tiene Hijos (Excel Parcial)',
      companyId: 'EMP-P25',
      periodId: '2026-P1',
      sourceType: 'EXCEL',
      sourceQuestionId: 'tieneHijos',
      responsesList: recordsParcial,
      isPositiveValue: (v) => v === 'Sí'
    });
    const passed = trace.validRecords === 6 && trace.missingRecords === 4 && trace.coveragePercentage === 60 && trace.dataQuality === 'LOW';
    results.push({
      id: 'P25-T02',
      title: '2. Excel parcialmente diligenciado',
      description: 'Verifica cálculo exacto de cobertura (60%) y clasificación LOW para archivo parcial.',
      passed,
      details: passed ? 'Cálculo de muestra parcial y cobertura 60% confirmado sin imputación.' : 'Error en Excel parcial.',
      observedOutput: trace
    });
  } catch (e: any) {
    results.push({ id: 'P25-T02', title: '2. Excel parcialmente diligenciado', description: 'Exception', passed: false, details: e.message });
  }

  // 3. Excel sin columna
  try {
    const recordsSinCol = Array.from({ length: 5 }).map(() => ({ responses: {} }));
    const trace = EvidenceService.buildIndicatorTrace({
      indicatorId: 'IND-SIN-COL',
      indicatorName: 'Columna Ausente',
      companyId: 'EMP-P25',
      periodId: '2026-P1',
      sourceType: 'EXCEL',
      sourceQuestionId: 'colInexistente',
      responsesList: recordsSinCol
    });
    const passed = trace.validRecords === 0 && trace.dataQuality === 'INSUFFICIENT' && trace.result === null;
    results.push({
      id: 'P25-T03',
      title: '3. Excel sin columna',
      description: 'Verifica que columna faltante genera result = null y dataQuality = INSUFFICIENT.',
      passed,
      details: passed ? 'Columna no encontrada procesada como INSUFFICIENT con result = null.' : 'Error en columna ausente.',
      observedOutput: trace
    });
  } catch (e: any) {
    results.push({ id: 'P25-T03', title: '3. Excel sin columna', description: 'Exception', passed: false, details: e.message });
  }

  // 4. Encuesta completa
  try {
    const submission = validateAndProcessSurveySubmission({
      companyId: 'EMP-P25',
      surveyId: 'SURVEY-P25',
      periodId: '2026-P1',
      employeeId: 'EMP-P25-04',
      rawAnswers: baseAnswersP25
    });
    const passed = submission.isValid && submission.response.completionStatus === 'COMPLETED';
    results.push({
      id: 'P25-T04',
      title: '4. Encuesta completa',
      description: 'Verifica que encuesta con todos los campos obligatorios es COMPLETED.',
      passed,
      details: passed ? 'Encuesta completa marcada como COMPLETED exitosamente.' : 'Error en encuesta completa.',
      observedOutput: submission.response
    });
  } catch (e: any) {
    results.push({ id: 'P25-T04', title: '4. Encuesta completa', description: 'Exception', passed: false, details: e.message });
  }

  // 5. Encuesta incompleta
  try {
    const rawIncomplete = { ...baseAnswersP25, edad: '' };
    const submission = validateAndProcessSurveySubmission({
      companyId: 'EMP-P25',
      surveyId: 'SURVEY-P25',
      periodId: '2026-P1',
      employeeId: 'EMP-P25-05',
      rawAnswers: rawIncomplete
    });
    const passed = !submission.isValid && submission.response.completionStatus === 'INCOMPLETE';
    results.push({
      id: 'P25-T05',
      title: '5. Encuesta incompleta',
      description: 'Verifica que la falta de edad bloquea la encuesta como INCOMPLETE.',
      passed,
      details: passed ? 'Encuesta incompleta detectada correctamente.' : 'Error en encuesta incompleta.',
      observedOutput: submission.response
    });
  } catch (e: any) {
    results.push({ id: 'P25-T05', title: '5. Encuesta incompleta', description: 'Exception', passed: false, details: e.message });
  }

  // 6. Pregunta "Prefiero no responder"
  try {
    const item = buildStandardResponseItem({ questionId: 'qPref', rawValue: 'Prefiero no responder' });
    const passed = item.responseStatus === 'PREFER_NOT_TO_ANSWER' && item.value === null;
    results.push({
      id: 'P25-T06',
      title: '6. Pregunta "Prefiero no responder"',
      description: 'Verifica responseStatus = PREFER_NOT_TO_ANSWER y value = null sin convertir a "No".',
      passed,
      details: passed ? 'Prefiero no responder preserva valor nulo y estatus oficial.' : 'Error en prefiero no responder.',
      observedOutput: item
    });
  } catch (e: any) {
    results.push({ id: 'P25-T06', title: '6. Pregunta "Prefiero no responder"', description: 'Exception', passed: false, details: e.message });
  }

  // 7. Pregunta "No aplica"
  try {
    const item = buildStandardResponseItem({ questionId: 'qNA', rawValue: 'No aplica' });
    const passed = item.responseStatus === 'NOT_APPLICABLE' && item.value === null;
    results.push({
      id: 'P25-T07',
      title: '7. Pregunta "No aplica"',
      description: 'Verifica responseStatus = NOT_APPLICABLE y value = null.',
      passed,
      details: passed ? 'No aplica asignado como NOT_APPLICABLE sin contar como "No".' : 'Error en No aplica.',
      observedOutput: item
    });
  } catch (e: any) {
    results.push({ id: 'P25-T07', title: '7. Pregunta "No aplica"', description: 'Exception', passed: false, details: e.message });
  }

  // 8. Opción "Otro"
  try {
    const item = buildStandardResponseItem({
      questionId: 'qOtro',
      rawValue: { option: 'OTRO', otherValue: 'Alergia al polen' }
    });
    const passed = item.responseStatus === 'OTHER' && item.value === 'OTHER' && item.otherValue === 'Alergia al polen';
    results.push({
      id: 'P25-T08',
      title: '8. Opción "Otro"',
      description: 'Verifica responseStatus = OTHER con especificación preserved.',
      passed,
      details: passed ? 'Opción Otro correctamente parseada con texto libre.' : 'Error en opción Otro.',
      observedOutput: item
    });
  } catch (e: any) {
    results.push({ id: 'P25-T08', title: '8. Opción "Otro"', description: 'Exception', passed: false, details: e.message });
  }

  // 9. Variable médica inexistente
  try {
    const item = buildStandardResponseItem({ questionId: 'grupoSanguineo', rawValue: null });
    const passed = item.responseStatus === 'MISSING' && item.value === null;
    results.push({
      id: 'P25-T09',
      title: '9. Variable médica inexistente',
      description: 'Verifica que la ausencia de dato médico guarda MISSING y NO realiza imputaciones.',
      passed,
      details: passed ? 'Variable médica vacía guardada como MISSING sin invención de grupo sanguíneo o afección.' : 'Error en variable médica.',
      observedOutput: item
    });
  } catch (e: any) {
    results.push({ id: 'P25-T09', title: '9. Variable médica inexistente', description: 'Exception', passed: false, details: e.message });
  }

  // 10. Peso sin estatura
  try {
    const { imc, trace } = EvidenceService.calculateIMC(72, null);
    const passed = imc === null && trace.dataQuality === 'INSUFFICIENT' && trace.explanationSentence.includes('Información no disponible');
    results.push({
      id: 'P25-T10',
      title: '10. Peso sin estatura',
      description: 'Verifica que sin estatura, IMC = null y dataQuality = INSUFFICIENT sin estimar estatura.',
      passed,
      details: passed ? 'Peso sin estatura produce IMC = null sin promedios ni estatura sintética.' : 'Error en peso sin estatura.',
      observedOutput: trace
    });
  } catch (e: any) {
    results.push({ id: 'P25-T10', title: '10. Peso sin estatura', description: 'Exception', passed: false, details: e.message });
  }

  // 11. Estatura sin peso
  try {
    const { imc, trace } = EvidenceService.calculateIMC(null, 175);
    const passed = imc === null && trace.dataQuality === 'INSUFFICIENT';
    results.push({
      id: 'P25-T11',
      title: '11. Estatura sin peso',
      description: 'Verifica que sin peso, IMC = null y dataQuality = INSUFFICIENT sin estimar peso.',
      passed,
      details: passed ? 'Estatura sin peso produce IMC = null sin peso sintético.' : 'Error en estatura sin peso.',
      observedOutput: trace
    });
  } catch (e: any) {
    results.push({ id: 'P25-T11', title: '11. Estatura sin peso', description: 'Exception', passed: false, details: e.message });
  }

  // 12. Indicador sin datos
  try {
    const trace = EvidenceService.buildIndicatorTrace({
      indicatorId: 'IND-VACIO',
      indicatorName: 'Discapacidad Inexistente',
      companyId: 'EMP-P25',
      periodId: '2026-P1',
      sourceType: 'SURVEY',
      responsesList: []
    });
    const passed = trace.result === null && trace.dataQuality === 'INSUFFICIENT' && trace.explanationSentence.startsWith('Información no disponible.');
    results.push({
      id: 'P25-T12',
      title: '12. Indicador sin datos',
      description: 'Verifica que con 0 respuestas la frase es "Información no disponible." y NUNCA reporta 0%.',
      passed,
      details: passed ? 'Indicador sin datos produce "Información no disponible." sin emitir 0% artificial.' : 'Error en indicador sin datos.',
      observedOutput: trace
    });
  } catch (e: any) {
    results.push({ id: 'P25-T12', title: '12. Indicador sin datos', description: 'Exception', passed: false, details: e.message });
  }

  // 13. Indicador con datos parciales
  try {
    const recordsParciales = [
      ...Array.from({ length: 8 }).map(() => ({ responses: { tieneHijos: buildStandardResponseItem({ questionId: 'tieneHijos', rawValue: 'Sí' }) } })),
      ...Array.from({ length: 2 }).map(() => ({ responses: { tieneHijos: buildStandardResponseItem({ questionId: 'tieneHijos', rawValue: 'No' }) } }))
    ];
    const trace = EvidenceService.buildIndicatorTrace({
      indicatorId: 'IND-PARCIAL-EXPLICITO',
      indicatorName: 'Tiene Hijos (Parcial)',
      companyId: 'EMP-P25',
      periodId: '2026-P1',
      sourceType: 'SURVEY',
      sourceQuestionId: 'tieneHijos',
      responsesList: recordsParciales,
      isPositiveValue: (v) => v === 'Sí' || v === 'SÍ'
    });
    const passed = trace.result === 80 && trace.explanationSentence.includes('El 80% de los colaboradores que respondieron') && trace.explanationSentence.includes('Base válida: 10 colaboradores');
    results.push({
      id: 'P25-T13',
      title: '13. Indicador con datos parciales',
      description: 'Verifica redacción "X% de los colaboradores que respondieron..." con mención explícita de la base válida.',
      passed,
      details: passed ? 'Frase de datos parciales correctamente redactada con base explícita.' : 'Error en indicador parcial.',
      observedOutput: trace
    });
  } catch (e: any) {
    results.push({ id: 'P25-T13', title: '13. Indicador con datos parciales', description: 'Exception', passed: false, details: e.message });
  }

  // 14. Indicador con cobertura suficiente (HIGH)
  try {
    const recordsHigh = Array.from({ length: 10 }).map(() => ({
      responses: { tieneHijos: buildStandardResponseItem({ questionId: 'tieneHijos', rawValue: 'No' }) }
    }));
    const trace = EvidenceService.buildIndicatorTrace({
      indicatorId: 'IND-HIGH',
      indicatorName: 'Tiene Hijos (100% Cobertura)',
      companyId: 'EMP-P25',
      periodId: '2026-P1',
      sourceType: 'SURVEY',
      sourceQuestionId: 'tieneHijos',
      responsesList: recordsHigh
    });
    const passed = trace.coveragePercentage === 100 && trace.dataQuality === 'HIGH' && trace.alertLevel === 'GREEN';
    results.push({
      id: 'P25-T14',
      title: '14. Cobertura suficiente (HIGH)',
      description: 'Verifica clasificación HIGH y alerta VERDE para 100% de cobertura.',
      passed,
      details: passed ? 'Calidad ALTA y alerta VERDE confirmadas.' : 'Error en cobertura suficiente.',
      observedOutput: trace
    });
  } catch (e: any) {
    results.push({ id: 'P25-T14', title: '14. Cobertura suficiente (HIGH)', description: 'Exception', passed: false, details: e.message });
  }

  // 15. Aislamiento Empresa A y Empresa B
  try {
    const recordsEmpA = Array.from({ length: 3 }).map(() => ({ responses: { sexo: buildStandardResponseItem({ questionId: 'sexo', rawValue: 'Femenino' }) } }));
    const recordsEmpB = Array.from({ length: 5 }).map(() => ({ responses: { sexo: buildStandardResponseItem({ questionId: 'sexo', rawValue: 'Masculino' }) } }));

    const traceA = EvidenceService.buildIndicatorTrace({
      indicatorId: 'IND-SEXO-A',
      indicatorName: 'Sexo Empresa A',
      companyId: 'EMPRESA_A',
      periodId: '2026-P1',
      sourceType: 'SURVEY',
      sourceQuestionId: 'sexo',
      responsesList: recordsEmpA
    });

    const traceB = EvidenceService.buildIndicatorTrace({
      indicatorId: 'IND-SEXO-B',
      indicatorName: 'Sexo Empresa B',
      companyId: 'EMPRESA_B',
      periodId: '2026-P1',
      sourceType: 'SURVEY',
      sourceQuestionId: 'sexo',
      responsesList: recordsEmpB
    });

    const passed = traceA.totalRecords === 3 && traceB.totalRecords === 5 && traceA.companyId === 'EMPRESA_A' && traceB.companyId === 'EMPRESA_B';
    results.push({
      id: 'P25-T15',
      title: '15. Aislamiento Empresa A y B',
      description: 'Verifica aislamiento estricto de registros y trazas por empresa.',
      passed,
      details: passed ? 'Aislamiento multicompañía verificado correctamente.' : 'Error en aislamiento multicompañía.',
      observedOutput: { traceA, traceB }
    });
  } catch (e: any) {
    results.push({ id: 'P25-T15', title: '15. Aislamiento Empresa A y B', description: 'Exception', passed: false, details: e.message });
  }

  // 16. Generación de traza para informe PDF
  try {
    const tracePDF = EvidenceService.buildIndicatorTrace({
      indicatorId: 'IND-PDF-01',
      indicatorName: 'Clima Laboral PDF',
      companyId: 'EMP-P25',
      periodId: '2026-P1',
      sourceType: 'SURVEY',
      responsesList: Array.from({ length: 10 }).map(() => ({ responses: { clima: buildStandardResponseItem({ questionId: 'clima', rawValue: 'Alto' }) } }))
    });
    const ev = EvidenceService.validateReportStatement('Evaluación Clima', tracePDF);
    const passed = ev.supported && ev.calculationBaseText.includes('Base válida: 10');
    results.push({
      id: 'P25-T16',
      title: '16. Generación de traza para informe PDF',
      description: 'Verifica que la evidencia del informe PDF adjunta base de respuestas y cobertura.',
      passed,
      details: passed ? 'Ficha de trazabilidad para PDF generada con base válida.' : 'Error en traza PDF.',
      observedOutput: ev
    });
  } catch (e: any) {
    results.push({ id: 'P25-T16', title: '16. Generación de traza para informe PDF', description: 'Exception', passed: false, details: e.message });
  }

  // 17. Generación de traza para dashboard
  try {
    const traceDash = EvidenceService.buildIndicatorTrace({
      indicatorId: 'IND-DASH-01',
      indicatorName: 'Nivel de Riesgo Dashboard',
      companyId: 'EMP-P25',
      periodId: '2026-P1',
      sourceType: 'SURVEY',
      responsesList: Array.from({ length: 10 }).map(() => ({ responses: { riesgo: buildStandardResponseItem({ questionId: 'riesgo', rawValue: 'Bajo' }) } }))
    });
    const passed = traceDash.dataQuality === 'HIGH' && traceDash.alertLevel === 'GREEN';
    results.push({
      id: 'P25-T17',
      title: '17. Generación de traza para dashboard',
      description: 'Verifica que las métricas del dashboard contienen traza de calidad alta.',
      passed,
      details: passed ? 'Traza de dashboard validada exitosamente.' : 'Error en traza dashboard.',
      observedOutput: traceDash
    });
  } catch (e: any) {
    results.push({ id: 'P25-T17', title: '17. Generación de traza para dashboard', description: 'Exception', passed: false, details: e.message });
  }

  // 18. Trazabilidad en exportación Excel
  try {
    const excelReport = EvidenceService.generateExcelQualityReport({
      fileName: 'respuestas_sociodemograficas_2026.xlsx',
      companyId: 'EMP-P25',
      periodId: '2026-P1',
      totalRecords: 50,
      expectedVariables: 25,
      foundVariables: 25,
      completeRecords: 48,
      incompleteRecords: 2,
      formatErrors: 0,
      unparameterizedData: 0,
      availableIndicators: 20,
      unavailableIndicators: 0
    });
    const passed = excelReport.qualityLevel === 'HIGH' && excelReport.foundVariables === 25;
    results.push({
      id: 'P25-T18',
      title: '18. Trazabilidad en exportación Excel',
      description: 'Verifica resumen de calidad de datos automático post-importación de Excel.',
      passed,
      details: passed ? 'Resumen de calidad de Excel generado correctamente.' : 'Error en resumen de Excel.',
      observedOutput: excelReport
    });
  } catch (e: any) {
    results.push({ id: 'P25-T18', title: '18. Trazabilidad en exportación Excel', description: 'Exception', passed: false, details: e.message });
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
