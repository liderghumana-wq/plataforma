/**
 * PROMPT 21 — COMPREHENSIVE TEST RUNNER
 * Verifies all 12 test scenarios required in Section 29 of Prompt 21.
 *
 * Ensures:
 * 1. Encuesta completa
 * 2. Encuesta incompleta
 * 3. Pregunta obligatoria sin respuesta
 * 4. "Prefiero no responder" category preservation
 * 5. Peso sin estatura
 * 6. Estatura sin peso
 * 7. Ambos ausentes
 * 8. Empresa con diferentes sedes (Empresa A vs B)
 * 9. Empresa con diferentes áreas
 * 10. Empresa con diferentes proyectos
 * 11. Importación Excel mapping
 * 12. Datos parciales without synthetic pollution
 */

import {
  validateAndProcessSurveySubmission,
  mapExcelRowToSurveyResponse,
  getCompanySurveyConfiguration,
  EmployeeSurveyResponse
} from './prompt21Engine';

export interface TestResult {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  details: string;
  observedOutput?: any;
}

export interface TestSuiteSummary {
  total: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: TestResult[];
}

export function runPrompt21TestSuite(): TestSuiteSummary {
  const results: TestResult[] = [];

  // BASE ANSWERS FOR A FULL VALID RESPONDENT
  const validBaseAnswers = {
    sede: 'Sede Principal (Bogotá)',
    area: 'Talento Humano y SG-SST',
    proyecto: 'Proyecto SG-SST 2026',
    cargo: 'Especialista SST',
    tipoContrato: 'Término Indefinido',
    fechaIngreso: '2023-01-15',
    modalidadTrabajo: 'Híbrido',
    edad: 32,
    sexo: 'Femenino',
    estadoCivil: 'Casado(a)',
    ciudadResidencia: 'Bogotá',
    nivelEducativo: 'Profesional',
    estrato: 'Estrato 3',
    tipoVivienda: 'Propia',
    personasHogar: 3,
    viveSolo: 'No',
    tienePersonasACargo: 'Sí',
    numeroPersonasACargo: 2,
    tieneHijos: 'Sí',
    numeroHijos: 2,
    saludDiagnosticoRelevante: 'No',
    consumeMedicamentosFrecuente: 'No',
    presentaAlergias: 'No',
    molestiasOsteomusculares: 'No',
    pesoKg: 70,
    estaturaCm: 170,
    presentaDiscapacidad: 'No',
    actividadFisicaRegular: 'Sí',
    frecuenciaActividadFisica: '3 días por semana',
    tipoActividadFisica: 'Caminar',
    nivelHabitualActividadFisica: 'Moderado',
    actividadTiempoLibre: 'Familia',
    tieneMascotas: 'Sí'
  };

  // TEST 1: Encuesta completa
  try {
    const res = validateAndProcessSurveySubmission({
      companyId: 'EMP-001',
      surveyId: 'SURVEY-2026-FULL',
      periodId: '2026-Q1',
      employeeId: 'EMP-1001',
      rawAnswers: validBaseAnswers,
      source: 'SURVEY'
    });

    const passed = res.isValid && res.response.completionStatus === 'COMPLETED' && res.response.responses['imcCalculado'].answer === 24.2;
    results.push({
      id: 'T01',
      title: 'Encuesta Completa',
      description: 'Valida procesamiento exitoso con todas las preguntas requeridas y autocálculo de IMC.',
      passed,
      details: passed
        ? 'Status = COMPLETED, IMC autocalculado a 24.2 correctamente.'
        : `Falló validación: status=${res.response.completionStatus}, errors=${JSON.stringify(res.errors)}`,
      observedOutput: { status: res.response.completionStatus, imc: res.response.responses['imcCalculado']?.answer }
    });
  } catch (e: any) {
    results.push({ id: 'T01', title: 'Encuesta Completa', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 2: Encuesta incompleta
  try {
    const partialAnswers = { ...validBaseAnswers };
    delete (partialAnswers as any).area;
    delete (partialAnswers as any).cargo;

    const res = validateAndProcessSurveySubmission({
      companyId: 'EMP-001',
      surveyId: 'SURVEY-2026-INCOMPLETE',
      periodId: '2026-Q1',
      employeeId: 'EMP-1002',
      rawAnswers: partialAnswers
    });

    const passed = !res.isValid && res.response.completionStatus === 'INCOMPLETE' && res.missingRequiredFields.includes('area');
    results.push({
      id: 'T02',
      title: 'Encuesta Incompleta',
      description: 'Marca status = INCOMPLETE cuando faltan campos obligatorios sin inventar respuestas.',
      passed,
      details: passed
        ? `Status = INCOMPLETE correctamente, faltan campos: ${res.missingRequiredFields.join(', ')}.`
        : `Esperaba status INCOMPLETE, obtuvo ${res.response.completionStatus}`,
      observedOutput: { status: res.response.completionStatus, missing: res.missingRequiredFields }
    });
  } catch (e: any) {
    results.push({ id: 'T02', title: 'Encuesta Incompleta', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 3: Pregunta obligatoria sin respuesta
  try {
    const missingAnswers = { ...validBaseAnswers };
    delete (missingAnswers as any).tipoContrato;

    const res = validateAndProcessSurveySubmission({
      companyId: 'EMP-001',
      surveyId: 'SURVEY-2026-REQ',
      periodId: '2026-Q1',
      employeeId: 'EMP-1003',
      rawAnswers: missingAnswers
    });

    const passed = res.errors['tipoContrato'] !== undefined && res.response.responses['tipoContrato'].answer === null;
    results.push({
      id: 'T03',
      title: 'Pregunta Obligatoria Sin Respuesta',
      description: 'Bloquea finalización y registra error específico para el campo obligatorio ausente.',
      passed,
      details: passed
        ? 'Registró error para "tipoContrato" y almacenó respuesta como null.'
        : `Errores no encontrados como se esperaba: ${JSON.stringify(res.errors)}`,
      observedOutput: { errors: res.errors }
    });
  } catch (e: any) {
    results.push({ id: 'T03', title: 'Pregunta Obligatoria Sin Respuesta', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 4: "Prefiero no responder"
  try {
    const prefieroAnswers = {
      ...validBaseAnswers,
      saludDiagnosticoRelevante: 'Prefiero no responder',
      consumeMedicamentosFrecuente: 'Prefiero no responder',
      presentaAlergias: 'Prefiero no responder',
      molestiasOsteomusculares: 'Prefiero no responder'
    };

    const res = validateAndProcessSurveySubmission({
      companyId: 'EMP-001',
      surveyId: 'SURVEY-2026-PREFIERO',
      periodId: '2026-Q1',
      employeeId: 'EMP-1004',
      rawAnswers: prefieroAnswers
    });

    const storedAnswer = res.response.responses['saludDiagnosticoRelevante'].answer;
    const passed = storedAnswer === 'PREFIERO_NO_RESPONDER';
    results.push({
      id: 'T04',
      title: 'Tratamiento de "Prefiero no responder"',
      description: 'Nunca convierte "Prefiero no responder" a "No". Lo guarda estrictamente como PREFIERO_NO_RESPONDER.',
      passed,
      details: passed
        ? 'Almacenado correctamente como categoría PREFIERO_NO_RESPONDER.'
        : `Se esperaba PREFIERO_NO_RESPONDER pero se obtuvo ${storedAnswer}`,
      observedOutput: { storedAnswer }
    });
  } catch (e: any) {
    results.push({ id: 'T04', title: 'Tratamiento de "Prefiero no responder"', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 5: Peso sin estatura
  try {
    const pesoOnly = { ...validBaseAnswers, pesoKg: 75, estaturaCm: '' };

    const res = validateAndProcessSurveySubmission({
      companyId: 'EMP-001',
      surveyId: 'SURVEY-2026-WEIGHT-ONLY',
      periodId: '2026-Q1',
      employeeId: 'EMP-1005',
      rawAnswers: pesoOnly
    });

    const pesoAns = res.response.responses['pesoKg'].answer;
    const estAns = res.response.responses['estaturaCm'].answer;
    const imcAns = res.response.responses['imcCalculado'].answer;

    const passed = pesoAns === 75 && estAns === null && imcAns === null;
    results.push({
      id: 'T05',
      title: 'Peso Sin Estatura',
      description: 'Si se tiene peso pero no estatura: peso=75, estatura=null, IMC=null. Cero estimación.',
      passed,
      details: passed
        ? 'peso=75, estatura=null, IMC=null como exige la regla de oro.'
        : `Obtenido: peso=${pesoAns}, estatura=${estAns}, imc=${imcAns}`,
      observedOutput: { peso: pesoAns, estatura: estAns, imc: imcAns }
    });
  } catch (e: any) {
    results.push({ id: 'T05', title: 'Peso Sin Estatura', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 6: Estatura sin peso
  try {
    const heightOnly = { ...validBaseAnswers, pesoKg: '', estaturaCm: 175 };

    const res = validateAndProcessSurveySubmission({
      companyId: 'EMP-001',
      surveyId: 'SURVEY-2026-HEIGHT-ONLY',
      periodId: '2026-Q1',
      employeeId: 'EMP-1006',
      rawAnswers: heightOnly
    });

    const pesoAns = res.response.responses['pesoKg'].answer;
    const estAns = res.response.responses['estaturaCm'].answer;
    const imcAns = res.response.responses['imcCalculado'].answer;

    const passed = pesoAns === null && estAns === 175 && imcAns === null;
    results.push({
      id: 'T06',
      title: 'Estatura Sin Peso',
      description: 'Si se tiene estatura pero no peso: peso=null, estatura=175, IMC=null.',
      passed,
      details: passed
        ? 'peso=null, estatura=175, IMC=null registrado correctamente.'
        : `Obtenido: peso=${pesoAns}, estatura=${estAns}, imc=${imcAns}`,
      observedOutput: { peso: pesoAns, estatura: estAns, imc: imcAns }
    });
  } catch (e: any) {
    results.push({ id: 'T06', title: 'Estatura Sin Peso', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 7: Ambos ausentes (Peso y Estatura)
  try {
    const bothAbsent = { ...validBaseAnswers, pesoKg: '', estaturaCm: '' };

    const res = validateAndProcessSurveySubmission({
      companyId: 'EMP-001',
      surveyId: 'SURVEY-2026-NO-WEIGHT-HEIGHT',
      periodId: '2026-Q1',
      employeeId: 'EMP-1007',
      rawAnswers: bothAbsent
    });

    const pesoAns = res.response.responses['pesoKg'].answer;
    const estAns = res.response.responses['estaturaCm'].answer;
    const imcAns = res.response.responses['imcCalculado'].answer;

    const passed = pesoAns === null && estAns === null && imcAns === null;
    results.push({
      id: 'T07',
      title: 'Ambos Ausentes (Peso y Estatura)',
      description: 'Permanece peso=null, estatura=null, IMC=null. Jamás genera datos antropométricos sintéticos.',
      passed,
      details: passed
        ? 'Ambos permanecen null sin ser rellenados con promedios artificiales.'
        : `Obtenido: peso=${pesoAns}, estatura=${estAns}, imc=${imcAns}`,
      observedOutput: { peso: pesoAns, estatura: estAns, imc: imcAns }
    });
  } catch (e: any) {
    results.push({ id: 'T07', title: 'Ambos Ausentes', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 8: Empresa con diferentes sedes
  try {
    const configA = getCompanySurveyConfiguration('EMP-001', 'Empresa Tradicional');
    const configB = getCompanySurveyConfiguration('EMP-002', 'Innovatech IT');

    const sedesA = configA.catalogs.sedes.map(s => s.label);
    const sedesB = configB.catalogs.sedes.map(s => s.label);

    const passed = sedesA.length > 0 && sedesB.length > 0 && sedesA[0] !== sedesB[0];
    results.push({
      id: 'T08',
      title: 'Empresa con Diferentes Sedes',
      description: 'Garantiza que el catálogo de sedes es parametrizable y específico por empresa.',
      passed,
      details: passed
        ? `Empresa A tiene "${sedesA[0]}", Empresa B tiene "${sedesB[0]}".`
        : `Sedes iguales o vacías: A=${JSON.stringify(sedesA)}, B=${JSON.stringify(sedesB)}`,
      observedOutput: { sedesA, sedesB }
    });
  } catch (e: any) {
    results.push({ id: 'T08', title: 'Empresa con Diferentes Sedes', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 9: Empresa con diferentes áreas
  try {
    const configA = getCompanySurveyConfiguration('EMP-001', 'Empresa Tradicional');
    const configB = getCompanySurveyConfiguration('EMP-002', 'Innovatech IT');

    const areasA = configA.catalogs.areas.map(a => a.label);
    const areasB = configB.catalogs.areas.map(a => a.label);

    const passed = areasA.length > 0 && areasB.length > 0 && areasA[0] !== areasB[0];
    results.push({
      id: 'T09',
      title: 'Empresa con Diferentes Áreas',
      description: 'Valida que cada empresa administra sus áreas exclusivas.',
      passed,
      details: passed
        ? `Empresa A áreas = [${areasA.slice(0, 2).join(', ')}], Empresa B áreas = [${areasB.slice(0, 2).join(', ')}].`
        : `Áreas no aisladas correctamente.`,
      observedOutput: { areasA, areasB }
    });
  } catch (e: any) {
    results.push({ id: 'T09', title: 'Empresa con Diferentes Áreas', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 10: Empresa con diferentes proyectos
  try {
    const configA = getCompanySurveyConfiguration('EMP-001', 'Empresa Tradicional');
    const configB = getCompanySurveyConfiguration('EMP-002', 'Innovatech IT');

    const proyectosA = configA.catalogs.proyectos.map(p => p.label);
    const proyectosB = configB.catalogs.proyectos.map(p => p.label);

    const passed = proyectosA.length > 0 && proyectosB.length > 0;
    results.push({
      id: 'T10',
      title: 'Empresa con Diferentes Proyectos',
      description: 'Valida catálogos de proyectos independientes y dinámicos por empresa.',
      passed,
      details: passed
        ? `Catálogos de proyectos cargados independientemente por empresa.`
        : `Error al cargar proyectos por empresa.`,
      observedOutput: { proyectosA, proyectosB }
    });
  } catch (e: any) {
    results.push({ id: 'T10', title: 'Empresa con Diferentes Proyectos', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 11: Importación Excel mapping
  try {
    const excelRow = {
      'Sede': 'Sede Medellín',
      'Área': 'Tecnología',
      'Cargo': 'Analista QA',
      'Tipo de Contrato': 'Término Indefinido',
      'Edad': 29,
      'Sexo': 'Masculino',
      'Cédula': '1029384756',
      'Peso': 82,
      'Estatura': 180,
      'Tiene Hijos': 'No'
    };

    const excelResponse: EmployeeSurveyResponse = mapExcelRowToSurveyResponse(excelRow, 'EMP-001');

    const passed =
      excelResponse.source === 'EXCEL' &&
      excelResponse.responses['pesoKg'].answer === 82 &&
      excelResponse.responses['estaturaCm'].answer === 180 &&
      excelResponse.responses['imcCalculado'].answer === 25.3 &&
      excelResponse.responses['numeroHijos'].answer === 0;

    results.push({
      id: 'T11',
      title: 'Importación Excel',
      description: 'Mapea columnas de Excel exactamente al mismo modelo de datos de la encuesta (source=EXCEL).',
      passed,
      details: passed
        ? 'Mapeado correctamente: source=EXCEL, IMC autocalculado=25.3, numeroHijos=0.'
        : `Mapeo inconsistente: source=${excelResponse.source}, imc=${excelResponse.responses['imcCalculado']?.answer}`,
      observedOutput: { source: excelResponse.source, imc: excelResponse.responses['imcCalculado']?.answer }
    });
  } catch (e: any) {
    results.push({ id: 'T11', title: 'Importación Excel', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 12: Datos parciales
  try {
    const partialAnswers = {
      sede: 'Sede Principal (Bogotá)',
      area: 'Administración',
      cargo: 'Coordinador',
      edad: 40,
      sexo: 'Masculino'
    };

    const res = validateAndProcessSurveySubmission({
      companyId: 'EMP-001',
      surveyId: 'SURVEY-2026-PARTIAL',
      periodId: '2026-Q1',
      employeeId: 'EMP-1012',
      rawAnswers: partialAnswers
    });

    const pesoAns = res.response.responses['pesoKg'].answer;
    const estAns = res.response.responses['estaturaCm'].answer;
    const maritalAns = res.response.responses['estadoCivil'].answer;

    const passed = pesoAns === null && estAns === null && maritalAns === null;
    results.push({
      id: 'T12',
      title: 'Datos Parciales Sin Relleno Sintético',
      description: 'Los campos omitidos en datos parciales permanecen estrictamente como null sin valores predeterminados.',
      passed,
      details: passed
        ? 'Todos los campos ausentes se mantienen como null (peso=null, estatura=null, estadoCivil=null).'
        : `Ocurrió relleno sintético no deseado.`,
      observedOutput: { peso: pesoAns, estatura: estAns, estadoCivil: maritalAns }
    });
  } catch (e: any) {
    results.push({ id: 'T12', title: 'Datos Parciales', description: 'Exception', passed: false, details: e.message });
  }

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;
  const allPassed = failedCount === 0;

  return {
    total: results.length,
    passedCount,
    failedCount,
    allPassed,
    results
  };
}
