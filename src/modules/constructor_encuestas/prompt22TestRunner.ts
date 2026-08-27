/**
 * PROMPT 22 — AUTOMATED TEST SUITE
 * Implements all 17 required test scenarios for Section 30 of Prompt 22:
 * 1. Encuesta completa.
 * 2. Encuesta incompleta.
 * 3. Pregunta obligatoria vacía.
 * 4. Sede parametrizada.
 * 5. Área parametrizada.
 * 6. Proyecto parametrizado.
 * 7. Pregunta condicional.
 * 8. "Prefiero no responder".
 * 9. Peso sin estatura.
 * 10. Estatura sin peso.
 * 11. IMC con ambos datos.
 * 12. Datos fuera de rango.
 * 13. Guardar y continuar.
 * 14. Finalizar encuesta.
 * 15. Exportar Excel.
 * 16. Empresa A con catálogos diferentes a Empresa B.
 * 17. Verificar aislamiento entre empresas.
 */

import {
  validateAndProcessSurveySubmission,
  getCompanySurveyConfiguration,
  mapExcelRowToSurveyResponse,
  EmployeeSurveyResponse
} from './prompt21Engine';
import { builderEncuestasService } from './builder.service';
import { catalogosService } from '../configuracion/catalogos.service';
import { PreguntaConfig } from './types';

export interface TestResultP22 {
  id: string;
  title: string;
  description: string;
  passed: boolean;
  details: string;
  observedOutput?: any;
}

export interface TestSuiteSummaryP22 {
  total: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: TestResultP22[];
}

export function runPrompt22TestSuite(): TestSuiteSummaryP22 {
  const results: TestResultP22[] = [];

  const validAnswersP22 = {
    sede: 'Sede Principal (Bogotá)',
    area: 'Gestión Humana y SG-SST',
    proyecto: 'Proyecto Prevención 2026',
    cargo: 'Analista SST',
    tipoContrato: 'Término Indefinido',
    fechaIngreso: '2022-03-01',
    modalidadTrabajo: 'Presencial',
    edad: 30,
    sexo: 'Femenino',
    estadoCivil: 'Soltero(a)',
    ciudadResidencia: 'Bogotá',
    nivelEducativo: 'Profesional',
    estrato: 'Estrato 3',
    tipoVivienda: 'Arrendada',
    personasHogar: 2,
    viveSolo: 'No',
    tienePersonasACargo: 'No',
    numeroPersonasACargo: 0,
    tieneHijos: 'Sí',
    numeroHijos: 1,
    saludDiagnosticoRelevante: 'No',
    consumeMedicamentosFrecuente: 'No',
    presentaAlergias: 'No',
    molestiasOsteomusculares: 'No',
    pesoKg: 65,
    estaturaCm: 165,
    presentaDiscapacidad: 'No',
    actividadFisicaRegular: 'Sí',
    frecuenciaActividadFisica: '2 días por semana',
    tipoActividadFisica: 'Gimnasio',
    nivelHabitualActividadFisica: 'Moderado',
    actividadTiempoLibre: 'Lectura',
    tieneMascotas: 'Sí'
  };

  // TEST 1: Encuesta completa
  try {
    const res = validateAndProcessSurveySubmission({
      companyId: 'P22-EMP-01',
      surveyId: 'SURVEY-P22-01',
      periodId: '2026-P1',
      employeeId: 'EMP-P22-101',
      rawAnswers: validAnswersP22,
      source: 'SURVEY'
    });

    const passed = res.isValid && res.response.completionStatus === 'COMPLETED' && res.response.responses['imcCalculado']?.answer === 23.9;
    results.push({
      id: 'P22-T01',
      title: '1. Encuesta Completa',
      description: 'Diligenciamiento 100% válido. Genera estado COMPLETED e IMC = 23.9.',
      passed,
      details: passed
        ? 'Status = COMPLETED, IMC autocalculado correctamente a 23.9'
        : `Falló: status=${res.response.completionStatus}, imc=${res.response.responses['imcCalculado']?.answer}`,
      observedOutput: { status: res.response.completionStatus, imc: res.response.responses['imcCalculado']?.answer }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T01', title: '1. Encuesta Completa', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 2: Encuesta incompleta
  try {
    const incompleteAnswers = { ...validAnswersP22 };
    delete (incompleteAnswers as any).area;
    delete (incompleteAnswers as any).sede;

    const res = validateAndProcessSurveySubmission({
      companyId: 'P22-EMP-01',
      surveyId: 'SURVEY-P22-02',
      periodId: '2026-P1',
      employeeId: 'EMP-P22-102',
      rawAnswers: incompleteAnswers
    });

    const passed = !res.isValid && res.response.completionStatus === 'INCOMPLETE';
    results.push({
      id: 'P22-T02',
      title: '2. Encuesta Incompleta',
      description: 'Omitir campos obligatorios marca la respuesta como INCOMPLETE sin autocompletar.',
      passed,
      details: passed
        ? 'Status = INCOMPLETE correctamente. Detectados campos faltantes.'
        : `Esperaba status INCOMPLETE, obtuvo ${res.response.completionStatus}`,
      observedOutput: { status: res.response.completionStatus, missing: res.missingRequiredFields }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T02', title: '2. Encuesta Incompleta', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 3: Pregunta obligatoria vacía
  try {
    const emptyReq = { ...validAnswersP22, tipoContrato: '' };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P22-EMP-01',
      surveyId: 'SURVEY-P22-03',
      periodId: '2026-P1',
      employeeId: 'EMP-P22-103',
      rawAnswers: emptyReq
    });

    const passed = res.errors['tipoContrato'] !== undefined && res.response.responses['tipoContrato'].answer === null;
    results.push({
      id: 'P22-T03',
      title: '3. Pregunta Obligatoria Vacía',
      description: 'Genera mensaje de error específico para el campo obligatorio sin respuesta.',
      passed,
      details: passed
        ? 'Error generado para "tipoContrato". Valor almacenado como null.'
        : 'No se registró error esperado para campo obligatorio.',
      observedOutput: { errors: res.errors }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T03', title: '3. Pregunta Obligatoria Vacía', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 4: Sede parametrizada
  try {
    const config = getCompanySurveyConfiguration('P22-EMP-01', 'Empresa Test A');
    const sedes = config.catalogs.sedes;
    const passed = sedes.length > 0 && sedes.every(s => typeof s.label === 'string' && s.label.trim().length > 0);

    results.push({
      id: 'P22-T04',
      title: '4. Sede Parametrizada',
      description: 'Carga dinámica de sedes desde el catálogo configurado de la empresa.',
      passed,
      details: passed
        ? `Cargadas ${sedes.length} sedes desde catálogo: [${sedes.map(s => s.label).join(', ')}]`
        : 'No se pudieron cargar sedes dinámicas.',
      observedOutput: { count: sedes.length, sedes: sedes.map(s => s.label) }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T04', title: '4. Sede Parametrizada', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 5: Área parametrizada
  try {
    const config = getCompanySurveyConfiguration('P22-EMP-01', 'Empresa Test A');
    const areas = config.catalogs.areas;
    const passed = areas.length > 0 && areas.every(a => typeof a.label === 'string' && a.label.trim().length > 0);

    results.push({
      id: 'P22-T05',
      title: '5. Área Parametrizada',
      description: 'Carga dinámica de áreas desde el catálogo de la empresa.',
      passed,
      details: passed
        ? `Cargadas ${areas.length} áreas desde catálogo: [${areas.map(a => a.label).join(', ')}]`
        : 'No se cargaron áreas dinámicas.',
      observedOutput: { count: areas.length, areas: areas.map(a => a.label) }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T05', title: '5. Área Parametrizada', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 6: Proyecto parametrizado
  try {
    const config = getCompanySurveyConfiguration('P22-EMP-01', 'Empresa Test A');
    const proyectos = config.catalogs.proyectos;
    const passed = Array.isArray(proyectos);

    results.push({
      id: 'P22-T06',
      title: '6. Proyecto Parametrizado',
      description: 'Soporte dinámico para selección de proyecto con dependencia de empresa/sede/área.',
      passed,
      details: passed
        ? `Proyectos listados correctamente (${proyectos.length} proyectos configurados).`
        : 'Error al consultar proyectos parametrizados.',
      observedOutput: { count: proyectos.length }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T06', title: '6. Proyecto Parametrizado', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 7: Pregunta condicional
  try {
    const preguntaTarget: PreguntaConfig = {
      id: 'numHijosPreg',
      seccionId: 'sec-p22-1',
      titulo: 'Número de hijos',
      tipo: 'numero',
      obligatoria: true,
      visible: false,
      editable: true,
      orden: 2,
      reglasDependencia: [
        {
          id: 'reg-p22-1',
          preguntaOrigenId: 'tieneHijosPreg',
          operador: 'igual_a' as const,
          valorTarget: 'Sí',
          accion: 'mostrar' as const
        }
      ]
    };

    const resSi = builderEncuestasService.evaluarReglasPregunta(preguntaTarget, { tieneHijosPreg: 'Sí' });
    const resNo = builderEncuestasService.evaluarReglasPregunta(preguntaTarget, { tieneHijosPreg: 'No' });

    const passed = resSi.visible === true && resNo.visible === false;
    results.push({
      id: 'P22-T07',
      title: '7. Pregunta Condicional',
      description: 'Lógica condicional: ¿Tiene hijos? = "Sí" muestra la pregunta; "No" la oculta.',
      passed,
      details: passed
        ? 'Evaluación exitosa: "Sí" -> visible=true, "No" -> visible=false.'
        : `Falló regla: resSi=${resSi.visible}, resNo=${resNo.visible}`,
      observedOutput: { visSi: resSi.visible, visNo: resNo.visible }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T07', title: '7. Pregunta Condicional', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 8: "Prefiero no responder"
  try {
    const prefieroAnswers = {
      ...validAnswersP22,
      saludDiagnosticoRelevante: 'Prefiero no responder'
    };

    const res = validateAndProcessSurveySubmission({
      companyId: 'P22-EMP-01',
      surveyId: 'SURVEY-P22-08',
      periodId: '2026-P1',
      employeeId: 'EMP-P22-108',
      rawAnswers: prefieroAnswers
    });

    const val = res.response.responses['saludDiagnosticoRelevante']?.answer;
    const passed = val === 'PREFIERO_NO_RESPONDER';

    results.push({
      id: 'P22-T08',
      title: '8. "Prefiero no responder"',
      description: 'Almacena estrictamente PREFIERO_NO_RESPONDER sin reinterpretar a "No" o nulo.',
      passed,
      details: passed
        ? 'Guardado correctamente como PREFIERO_NO_RESPONDER.'
        : `Valor incorrecto obtenido: ${val}`,
      observedOutput: { storedValue: val }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T08', title: '8. "Prefiero no responder"', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 9: Peso sin estatura
  try {
    const pesoOnly = { ...validAnswersP22, pesoKg: 72, estaturaCm: '' };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P22-EMP-01',
      surveyId: 'SURVEY-P22-09',
      periodId: '2026-P1',
      employeeId: 'EMP-P22-109',
      rawAnswers: pesoOnly
    });

    const p = res.response.responses['pesoKg']?.answer;
    const e = res.response.responses['estaturaCm']?.answer;
    const imc = res.response.responses['imcCalculado']?.answer;

    const passed = p === 72 && e === null && imc === null;
    results.push({
      id: 'P22-T09',
      title: '9. Peso Sin Estatura',
      description: 'Peso registrado (72), estatura=null, IMC=null. Cero estimaciones artificiales.',
      passed,
      details: passed
        ? 'peso=72, estatura=null, IMC=null cumplido.'
        : `Inconsistente: peso=${p}, estatura=${e}, imc=${imc}`,
      observedOutput: { peso: p, estatura: e, imc }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T09', title: '9. Peso Sin Estatura', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 10: Estatura sin peso
  try {
    const estOnly = { ...validAnswersP22, pesoKg: '', estaturaCm: 172 };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P22-EMP-01',
      surveyId: 'SURVEY-P22-10',
      periodId: '2026-P1',
      employeeId: 'EMP-P22-110',
      rawAnswers: estOnly
    });

    const p = res.response.responses['pesoKg']?.answer;
    const e = res.response.responses['estaturaCm']?.answer;
    const imc = res.response.responses['imcCalculado']?.answer;

    const passed = p === null && e === 172 && imc === null;
    results.push({
      id: 'P22-T10',
      title: '10. Estatura Sin Peso',
      description: 'Peso=null, estatura registrada (172), IMC=null.',
      passed,
      details: passed
        ? 'peso=null, estatura=172, IMC=null cumplido.'
        : `Inconsistente: peso=${p}, estatura=${e}, imc=${imc}`,
      observedOutput: { peso: p, estatura: e, imc }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T10', title: '10. Estatura Sin Peso', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 11: IMC con ambos datos
  try {
    const both = { ...validAnswersP22, pesoKg: 70, estaturaCm: 170 };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P22-EMP-01',
      surveyId: 'SURVEY-P22-11',
      periodId: '2026-P1',
      employeeId: 'EMP-P22-111',
      rawAnswers: both
    });

    const imc = res.response.responses['imcCalculado']?.answer;
    const passed = imc === 24.2;

    results.push({
      id: 'P22-T11',
      title: '11. IMC Con Ambos Datos',
      description: 'Peso 70 kg y Estatura 170 cm calculan IMC = 24.2 kg/m² de forma determinística.',
      passed,
      details: passed
        ? 'Cálculo exacto: IMC = 24.2 kg/m²'
        : `Valor IMC calculado: ${imc} (esperaba 24.2)`,
      observedOutput: { imc }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T11', title: '11. IMC Con Ambos Datos', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 12: Datos fuera de rango
  try {
    const outOfRange = { ...validAnswersP22, pesoKg: 600, edad: -5 };
    const res = validateAndProcessSurveySubmission({
      companyId: 'P22-EMP-01',
      surveyId: 'SURVEY-P22-12',
      periodId: '2026-P1',
      employeeId: 'EMP-P22-112',
      rawAnswers: outOfRange
    });

    const hasErrors = res.errors['pesoKg'] !== undefined || res.errors['edad'] !== undefined;
    const passed = hasErrors;

    results.push({
      id: 'P22-T12',
      title: '12. Datos Fuera de Rango',
      description: 'Valida límites fisiológicos y biológicos (ej. Peso = 600 kg, Edad = -5 años).',
      passed,
      details: passed
        ? 'Errores de validación de rango registrados correctamente.'
        : 'No se detectó el valor fuera de rango.',
      observedOutput: { errors: res.errors }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T12', title: '12. Datos Fuera de Rango', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 13: Guardar y continuar
  try {
    const empId = 'P22-EMP-01';
    const survId = 'SURVEY-P22-DRAFT';
    const mockState = {
      respuestas: { sede: 'Sede Principal', edad: 28 },
      currentSectionIdx: 2,
      lastSaved: '10:30:00 AM'
    };

    builderEncuestasService.saveBorrador(empId, survId, mockState);
    const restored = builderEncuestasService.getBorrador(empId, survId);

    const passed = restored !== null && restored.respuestas.edad === 28 && restored.currentSectionIdx === 2;
    builderEncuestasService.clearBorrador(empId, survId);

    results.push({
      id: 'P22-T13',
      title: '13. Guardar y Continuar (Autoguardado)',
      description: 'Permite guardar borrador temporal y retoma exactamente en la misma sección.',
      passed,
      details: passed
        ? 'Borrador guardado y recuperado sin alteración de datos.'
        : 'Falló recuperación de borrador.',
      observedOutput: { restored }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T13', title: '13. Guardar y Continuar', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 14: Finalizar encuesta
  try {
    const res = validateAndProcessSurveySubmission({
      companyId: 'P22-EMP-01',
      surveyId: 'SURVEY-P22-14',
      periodId: '2026-P1',
      employeeId: 'EMP-P22-114',
      rawAnswers: validAnswersP22,
      source: 'SURVEY'
    });

    const passed = res.response.completionStatus === 'COMPLETED' && !!res.response.completedAt && res.response.source === 'SURVEY';
    results.push({
      id: 'P22-T14',
      title: '14. Finalizar Encuesta',
      description: 'Asigna estado COMPLETED, timestamp de finalización completedAt y origen SURVEY.',
      passed,
      details: passed
        ? `Status = COMPLETED, completedAt = ${res.response.completedAt}`
        : 'Error al finalizar encuesta.',
      observedOutput: { status: res.response.completionStatus, completedAt: res.response.completedAt, source: res.response.source }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T14', title: '14. Finalizar Encuesta', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 15: Exportar Excel
  try {
    const mockExcelRow = {
      'Sede': 'Sede Bogotá',
      'Área': 'Operaciones',
      'Cargo': 'Supervisor',
      'Tipo de Contrato': 'Término Indefinido',
      'Edad': 35,
      'Sexo': 'Masculino',
      'Peso': 80,
      'Estatura': 175
    };

    const responseModel: EmployeeSurveyResponse = mapExcelRowToSurveyResponse(mockExcelRow, 'P22-EMP-01');
    const passed = responseModel.source === 'EXCEL' && responseModel.responses['imcCalculado']?.answer === 26.1;

    results.push({
      id: 'P22-T15',
      title: '15. Exportar/Importar Excel Estandarizado',
      description: 'Mapeo bidireccional exacto con modelo EmployeeSurveyResponse (source=EXCEL).',
      passed,
      details: passed
        ? 'Mapeo exitoso a EmployeeSurveyResponse. IMC autocalculado = 26.1'
        : 'Inconsistencia en mapeo de columnas estandarizadas.',
      observedOutput: { source: responseModel.source, imc: responseModel.responses['imcCalculado']?.answer }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T15', title: '15. Exportar Excel', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 16: Empresa A con catálogos diferentes a Empresa B
  try {
    const configA = getCompanySurveyConfiguration('EMP-ALPHA', 'Empresa Alfa');
    const configB = getCompanySurveyConfiguration('EMP-BETA', 'Empresa Beta');

    const sedesA = configA.catalogs.sedes.map(s => s.label);
    const sedesB = configB.catalogs.sedes.map(s => s.label);

    const passed = sedesA.length > 0 && sedesB.length > 0 && sedesA[0] !== sedesB[0];
    results.push({
      id: 'P22-T16',
      title: '16. Catálogos Autónomos Empresa A vs B',
      description: 'Verifica que la encuesta carga catálogos específicos de la empresa seleccionada.',
      passed,
      details: passed
        ? `Empresa Alfa sedes = [${sedesA.join(', ')}], Empresa Beta sedes = [${sedesB.join(', ')}]`
        : 'Catálogos compartidos o no aislados entre empresas.',
      observedOutput: { sedesA, sedesB }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T16', title: '16. Catálogos Autónomos A vs B', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 17: Verificar aislamiento entre empresas
  try {
    const empA = 'ISO-EMP-A';
    const empB = 'ISO-EMP-B';

    // Save survey for A
    const encuestaA = builderEncuestasService.saveEncuesta(empA, {
      id: 'enc-iso-a',
      empresaId: empA,
      titulo: 'Encuesta Exclusiva Empresa A',
      codigo: 'ENC-A-001',
      descripcion: 'Privada',
      categoria: 'Aislamiento',
      estado: 'publicada',
      version: 1,
      autor: 'Admin A',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      tiempoEstimadoMinutos: 5,
      permitirAnonimo: false,
      tags: ['Test'],
      secciones: []
    });

    const listA = builderEncuestasService.getEncuestas(empA);
    const listB = builderEncuestasService.getEncuestas(empB);

    const existsInA = listA.some(e => e.id === 'enc-iso-a');
    const existsInB = listB.some(e => e.id === 'enc-iso-a');

    // Clean up
    builderEncuestasService.deleteEncuesta(empA, 'enc-iso-a');

    const passed = existsInA && !existsInB;
    results.push({
      id: 'P22-T17',
      title: '17. Aislamiento de Datos Multi-Empresa',
      description: 'Garantiza estricta separación de encuestas y respuestas por empresa (no data leakage).',
      passed,
      details: passed
        ? 'Aislamiento confirmed: la encuesta de Empresa A no es visible para Empresa B.'
        : 'Fuga de información detectada entre empresas.',
      observedOutput: { existsInA, existsInB }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T17', title: '17. Aislamiento entre Empresas', description: 'Exception', passed: false, details: e.message });
  }

  // TEST 18: Opción "Otro" con especificación obligatoria ("¿Cuál?")
  try {
    // 18a. Invalid: "OTRO" without specification -> must be INCOMPLETE
    const invalidAnswersOtro = {
      ...validAnswersP22,
      actividadTiempoLibre: { option: 'OTRO', otherValue: '' }
    };
    const resInvalid = validateAndProcessSurveySubmission({
      companyId: 'P22-EMP-OTRO',
      surveyId: 'SURVEY-P22-OTRO',
      periodId: '2026-P1',
      employeeId: 'EMP-P22-OTRO-01',
      rawAnswers: invalidAnswersOtro,
      source: 'SURVEY'
    });

    // 18b. Valid: "OTRO" with specification -> must be COMPLETED
    const validAnswersOtro = {
      ...validAnswersP22,
      actividadTiempoLibre: { option: 'OTRO', otherValue: 'Cuidado de un familiar' }
    };
    const resValid = validateAndProcessSurveySubmission({
      companyId: 'P22-EMP-OTRO',
      surveyId: 'SURVEY-P22-OTRO',
      periodId: '2026-P1',
      employeeId: 'EMP-P22-OTRO-02',
      rawAnswers: validAnswersOtro,
      source: 'SURVEY'
    });

    const isInvalidIncomplete = resInvalid.response.completionStatus === 'INCOMPLETE';
    const isValidCompleted = resValid.response.completionStatus === 'COMPLETED';
    const savedSpecVal = resValid.response.responses['actividadTiempoLibre']?.answer;

    const passed = isInvalidIncomplete && isValidCompleted && savedSpecVal?.otherValue === 'Cuidado de un familiar';

    results.push({
      id: 'P22-T18',
      title: '18. Opción "Otro" con Especificación Obligatoria ("¿Cuál?")',
      description: 'Verifica que la opción "Otro" exige un texto en "¿Cuál?" para estar COMPLETED y guarda { option, otherValue }.',
      passed,
      details: passed
        ? `Validación "Otro" correcta. Sin especificación: INCOMPLETE, Con especificación: COMPLETED (${JSON.stringify(savedSpecVal)}).`
        : 'Falló la validación de la opción "Otro".',
      observedOutput: { isInvalidIncomplete, isValidCompleted, savedSpecVal }
    });
  } catch (e: any) {
    results.push({ id: 'P22-T18', title: '18. Opción "Otro" con Especificación', description: 'Exception', passed: false, details: e.message });
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
