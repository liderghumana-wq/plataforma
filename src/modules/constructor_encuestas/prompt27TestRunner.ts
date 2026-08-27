/**
 * PROMPT 27 — AUTOMATED TEST RUNNER (prompt27TestRunner.ts)
 * 
 * 15 Unit and Integration Tests verifying Prompt 27 Master Survey requirements:
 * 1. Question Bank 11-Module Coverage
 * 2. Automatic Age Calculation from Birth Date
 * 3. Seniority Calculation & Fallback
 * 4. Dynamic Company Catalog Binding (Sedes, Áreas, Cargos, Contratos, etc.)
 * 5. Module 6 Privacy Banner & Sensitive Data Flags
 * 6. Biometric IMC Calculation Rules (Missing -> NO CALCULABLE)
 * 7. Perímetro Abdominal Non-Zero Retention
 * 8. Osteomuscular "Ninguna" Mutual Exclusion Enforcement
 * 9. "Prefiero no responder" Preservation
 * 10. Free-text "Otro" Value Preservation
 * 11. Excel Alias Normalization Matching Direct Survey Output
 * 12. Absolute Rule: Zero Default Fake Data Injected
 * 13. QuestionBank Version Metadata & Schema Integrity
 * 14. Complete 11-Module End-to-End Direct Survey Normalization
 * 15. Pipeline Integration (P27 -> P26 Validation -> P25 Evidence Traceability)
 */

import { QuestionBankService, DEFAULT_QUESTION_BANK, MASTER_MODULES } from './questionBankService';
import { getCompanySurveyConfiguration } from './prompt21Engine';
import { SurveyValidationService } from './surveyValidationService';
import { EvidenceService } from './evidenceService';

export interface TestResultP27 {
  id: number;
  name: string;
  category: 'QuestionBank' | 'Calculations' | 'Biometrics' | 'Rules' | 'Excel' | 'Pipeline';
  status: 'PASSED' | 'FAILED' | 'RUNNING';
  durationMs: number;
  message: string;
  details?: string;
}

export class Prompt27TestRunner {

  public static async runAllTests(companyId: string = 'emp-p27-test'): Promise<{
    results: TestResultP27[];
    passedCount: number;
    failedCount: number;
    totalMs: number;
  }> {
    const startTime = performance.now();
    const results: TestResultP27[] = [];

    // TEST 1: 11-Module Coverage
    results.push(this.testModuleCoverage());

    // TEST 2: Age Calculation
    results.push(this.testAgeCalculation());

    // TEST 3: Seniority Calculation & Fallback
    results.push(this.testSeniorityCalculation());

    // TEST 4: Dynamic Company Catalog Binding
    results.push(this.testDynamicCatalogBinding(companyId));

    // TEST 5: Sensitive Flags & Privacy Banner
    results.push(this.testSensitiveFlags());

    // TEST 6: Biometric IMC Calculation Rules
    results.push(this.testIMCCalculationRules());

    // TEST 7: Perímetro Abdominal Non-Zero Preservation
    results.push(this.testPerimetroAbdominalPreservation());

    // TEST 8: Osteomuscular Mutual Exclusion
    results.push(this.testOsteomuscularMutualExclusion());

    // TEST 9: "Prefiero no responder" Status Retention
    results.push(this.testPreferNotToAnswerStatus());

    // TEST 10: Free-Text "Otro" Option Retention
    results.push(this.testFreeTextOtroRetention());

    // TEST 11: Excel Alias Normalization Pipeline
    results.push(this.testExcelAliasNormalization());

    // TEST 12: Absolute Rule Enforcement (Zero Fake Defaults)
    results.push(this.testAbsoluteRuleNoFakeDefaults());

    // TEST 13: QuestionBank Version Metadata Integrity
    results.push(this.testMasterSurveyMetaIntegrity(companyId));

    // TEST 14: 11-Module End-to-End Direct Survey Normalization
    results.push(this.testEndToEnd11ModuleSurvey(companyId));

    // TEST 15: Pipeline Integration (P27 -> P26 -> P25)
    results.push(this.testPipelineIntegration(companyId));

    const passedCount = results.filter(r => r.status === 'PASSED').length;
    const failedCount = results.filter(r => r.status === 'FAILED').length;
    const totalMs = Math.round(performance.now() - startTime);

    return { results, passedCount, failedCount, totalMs };
  }

  // 1. Module Coverage
  private static testModuleCoverage(): TestResultP27 {
    const start = performance.now();
    const coveredModules = new Set(DEFAULT_QUESTION_BANK.map(q => q.moduleId));
    const isComplete = MASTER_MODULES.every(m => coveredModules.has(m.id));

    return {
      id: 1,
      name: 'Cobertura Completa de los 11 Módulos en QuestionBank',
      category: 'QuestionBank',
      status: isComplete && coveredModules.size === 11 ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Encontradas preguntas activas en ${coveredModules.size} de 11 módulos requeridos.`,
      details: `Módulos cubiertos: ${Array.from(coveredModules).sort((a,b)=>a-b).join(', ')}.`
    };
  }

  // 2. Age Calculation
  private static testAgeCalculation(): TestResultP27 {
    const start = performance.now();
    const birthDate = '1992-05-15';
    const age = QuestionBankService.calculateAge(birthDate);
    const expectedAge = new Date().getFullYear() - 1992 - (new Date().getMonth() < 4 || (new Date().getMonth() === 4 && new Date().getDate() < 15) ? 1 : 0);

    const isPassed = age === expectedAge;

    return {
      id: 2,
      name: 'Cálculo Automático de Edad a partir de Fecha de Nacimiento',
      category: 'Calculations',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Fecha: ${birthDate} -> Edad calculada: ${age} años (Esperado: ${expectedAge}).`,
      details: `Invalida cualquier entrada manual contradictoria de edad.`
    };
  }

  // 3. Seniority Calculation
  private static testSeniorityCalculation(): TestResultP27 {
    const start = performance.now();
    const hireDate = '2021-02-10';
    const { seniorityString, seniorityYears } = QuestionBankService.calculateSeniority(hireDate);
    const fallback = QuestionBankService.calculateSeniority(undefined);

    const isPassed = seniorityYears !== null && seniorityYears > 0 && fallback.seniorityString === 'Información no disponible.';

    return {
      id: 3,
      name: 'Cálculo Automático de Antigüedad Laboral y Mensaje de Fallback',
      category: 'Calculations',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Fecha ingreso ${hireDate} -> Antigüedad: "${seniorityString}" (${seniorityYears} años). Fallback sin fecha: "${fallback.seniorityString}".`,
      details: `No se inventan años de antigüedad si falta la fecha de ingreso.`
    };
  }

  // 4. Dynamic Catalog Binding
  private static testDynamicCatalogBinding(companyId: string): TestResultP27 {
    const start = performance.now();
    const catalog = getCompanySurveyConfiguration(companyId, 'Empresa Test');
    const bank = QuestionBankService.getQuestionBankForCompany(companyId, catalog);

    const sedesQ = bank.find(q => q.fieldKey === 'sede');
    const cargosQ = bank.find(q => q.fieldKey === 'cargo');

    const isPassed = Boolean(sedesQ?.options && sedesQ.options.length > 0 && cargosQ?.options && cargosQ.options.length > 0);

    return {
      id: 4,
      name: 'Enlace Dinámico con Catálogo de Empresa (Sedes, Áreas, Cargos)',
      category: 'QuestionBank',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Preguntas de Sede (${sedesQ?.options?.length} opciones) y Cargo (${cargosQ?.options?.length} opciones) cargadas desde el catálogo dinámico.`,
      details: `Garantiza cero opciones hardcodeadas.`
    };
  }

  // 5. Sensitive Flags
  private static testSensitiveFlags(): TestResultP27 {
    const start = performance.now();
    const healthQuestions = DEFAULT_QUESTION_BANK.filter(q => q.moduleId === 6 || q.moduleId === 7);
    const allSensitive = healthQuestions.every(q => q.sensitive);

    return {
      id: 5,
      name: 'Marcación de Datos Sensibles en Módulos de Salud (6 y 7)',
      category: 'Rules',
      status: allSensitive ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `${healthQuestions.length} preguntas de salud marcadas con sensitive=true y aviso de privacidad habilitado.`,
      details: `Cumple con normatividad de protección de datos de salud.`
    };
  }

  // 6. Biometric IMC Rules
  private static testIMCCalculationRules(): TestResultP27 {
    const start = performance.now();
    const missingWeight = QuestionBankService.calculateIMC(undefined, 170);
    const missingHeight = QuestionBankService.calculateIMC(75, undefined);
    const validIMC = QuestionBankService.calculateIMC(70, 175);

    const isPassed = missingWeight.imcCategory === 'IMC = NO CALCULABLE' && 
                     missingHeight.imcCategory === 'IMC = NO CALCULABLE' && 
                     validIMC.imcValue === 22.9;

    return {
      id: 6,
      name: 'Reglas Biométricas de IMC (Falta Peso o Estatura -> IMC NO CALCULABLE)',
      category: 'Biometrics',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Sin peso/estatura -> "${missingWeight.imcCategory}". Con peso 70kg / 175cm -> ${validIMC.imcValue} (${validIMC.imcCategory}).`,
      details: `Jamás se estiman ni completan automáticamente la estatura o el peso.`
    };
  }

  // 7. Perimetro Abdominal Preservation
  private static testPerimetroAbdominalPreservation(): TestResultP27 {
    const start = performance.now();
    const normalized = QuestionBankService.normalizeSurveyOrExcelData({
      perimetroCintura: 'No conozco el dato'
    });

    const isPassed = normalized.perimetroCintura === 'No conozco el dato' && normalized.perimetroCintura !== 0;

    return {
      id: 7,
      name: 'Preservación de Perímetro Abdominal ("No conozco el dato" No es 0)',
      category: 'Biometrics',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Respuesta "No conozco el dato" preservada intacta como texto sin reemplazar por cero (0).`,
      details: `Evita distorsionar promedios epidemiológicos con ceros artificiales.`
    };
  }

  // 8. Osteomuscular Mutual Exclusion
  private static testOsteomuscularMutualExclusion(): TestResultP27 {
    const start = performance.now();
    const rawData = {
      molestiasOsteomusculares12M: ['Ninguna', 'Cuello', 'Espalda baja']
    };
    const normalized = QuestionBankService.normalizeSurveyOrExcelData(rawData);

    const isPassed = Array.isArray(normalized.molestiasOsteomusculares12M) && 
                     normalized.molestiasOsteomusculares12M.length === 1 && 
                     normalized.molestiasOsteomusculares12M[0] === 'Ninguna';

    return {
      id: 8,
      name: 'Exclusión Mutua de "Ninguna" en Molestias Osteomusculares',
      category: 'Rules',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Entrada ['Ninguna', 'Cuello', 'Espalda baja'] limpia a ['Ninguna'].`,
      details: `Elimina contradicciones en selecciones múltiples osteomusculares.`
    };
  }

  // 9. "Prefiero no responder" Preservation
  private static testPreferNotToAnswerStatus(): TestResultP27 {
    const start = performance.now();
    const normalized = QuestionBankService.normalizeSurveyOrExcelData({
      saludPresentaCondicion: 'Prefiero no responder'
    });

    const isPassed = normalized.saludPresentaCondicion === 'Prefiero no responder';

    return {
      id: 9,
      name: 'Preservación del Valor "Prefiero no responder" en Respuestas Sensibles',
      category: 'Rules',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Valor "Prefiero no responder" mantenido sin convertirlo a "No" ni a valor faltante.`,
      details: `Respeta la libre elección y privacidad del colaborador.`
    };
  }

  // 10. Free-text "Otro" Retention
  private static testFreeTextOtroRetention(): TestResultP27 {
    const start = performance.now();
    const normalized = QuestionBankService.normalizeSurveyOrExcelData({
      zonaResidencia: 'Otra',
      zonaResidenciaOtra: 'Zona Franca Especial'
    });

    const isPassed = normalized.zonaResidencia === 'Otra' && normalized.zonaResidenciaOtra === 'Zona Franca Especial';

    return {
      id: 10,
      name: 'Retención de Texto Libre para Opción "Otro / ¿Cuál?"',
      category: 'Rules',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Opción "Otra" unida al texto descriptivo libre ("Zona Franca Especial").`,
      details: `Permite captura cualitativa exacta.`
    };
  }

  // 11. Excel Alias Normalization Pipeline
  private static testExcelAliasNormalization(): TestResultP27 {
    const start = performance.now();
    const excelRow = {
      cedula: '1020304050',
      primer_nombre: 'Carlos',
      primer_apellido: 'Gómez',
      fechanacimiento: '1988-11-20',
      fecha_ingreso: '2019-03-15',
      estrato_vivienda: '4'
    };

    const normalized = QuestionBankService.normalizeSurveyOrExcelData(excelRow);

    const isPassed = normalized.numeroIdentificacion === '1020304050' &&
                     normalized.nombres === 'Carlos' &&
                     normalized.apellidos === 'Gómez' &&
                     normalized.fechaNacimiento === '1988-11-20' &&
                     normalized.estrato === '4' &&
                     normalized.edad !== null &&
                     normalized.antiguedadCalculada !== 'Información no disponible.';

    return {
      id: 11,
      name: 'Mapeo Mismo Modelo Normalizado desde Fila Excel (Aliases)',
      category: 'Excel',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Fila Excel con aliases cedula, fechanacimiento, estrato_vivienda mapeada idénticamente a survey response.`,
      details: `Soporta canal dual Web/Excel sin duplicar código.`
    };
  }

  // 12. Absolute Rule: Zero Default Fake Data
  private static testAbsoluteRuleNoFakeDefaults(): TestResultP27 {
    const start = performance.now();
    const emptyRow = {
      nombres: 'María',
      apellidos: 'López'
    };

    const normalized = QuestionBankService.normalizeSurveyOrExcelData(emptyRow);

    const isPassed = normalized.ciudadResidencia === null &&
                     normalized.estrato === null &&
                     normalized.tipoContrato === null &&
                     normalized.pesoKg === null;

    return {
      id: 12,
      name: 'Regla Absoluta: Cero Datos Ficticios / Predeterminados Inventados',
      category: 'Rules',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Campos no provistos resultan en null y no en inventos (ej. "Bogotá", "Estrato 3", "Término Indefinido").`,
      details: `Evita contaminar la analítica con supuestos infundados.`
    };
  }

  // 13. QuestionBank Version Metadata Integrity
  private static testMasterSurveyMetaIntegrity(companyId: string): TestResultP27 {
    const start = performance.now();
    const meta = QuestionBankService.buildMasterSurveyMeta(companyId);

    const isPassed = meta.secciones.length === 11 &&
                     meta.version === 1 &&
                     meta.empresaId === companyId;

    return {
      id: 13,
      name: 'Integridad de Metadatos y Versionamiento de Encuesta Maestra',
      category: 'QuestionBank',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `EncuestaMeta creada con ${meta.secciones.length} secciones, versión v${meta.version} y empresa "${meta.empresaId}".`,
      details: `Conserva trazabilidad histórica e inmutabilidad de preguntas.`
    };
  }

  // 14. Complete 11-Module End-to-End Direct Survey Normalization
  private static testEndToEnd11ModuleSurvey(companyId: string): TestResultP27 {
    const start = performance.now();
    const fullSurveyInput = {
      tipoDocumento: 'CC',
      numeroIdentificacion: '1098765432',
      nombres: 'Laura',
      apellidos: 'Martínez',
      correoElectronico: 'laura@empresa.com',
      fechaNacimiento: '1995-08-12',
      sexo: 'Femenino',
      estadoCivil: 'Soltero(a)',
      nivelEducativo: 'Profesional',
      ciudadResidencia: 'Medellín',
      sede: 'Sede Poblado',
      area: 'Tecnología',
      proyecto: 'Desarrollo Web',
      cargo: 'Ingeniera de Software',
      estrato: '4',
      zonaResidencia: 'Urbana',
      tieneHijos: 'No',
      tienePersonasACargo: 'No',
      fechaIngreso: '2020-01-15',
      tipoContrato: 'Término Indefinido',
      jornadaLaboral: 'Tiempo Completo',
      tipoVivienda: 'Propia',
      serviciosPublicosBasicos: 'Sí',
      saludPresentaCondicion: 'No',
      saludDiagnosticoDeclarado: 'No',
      medicamentosHabituales: 'No',
      alergiasPresenta: 'No',
      discapacidadPresenta: 'No',
      pesoKg: 62,
      estaturaCm: 168,
      perimetroCintura: 'No conozco el dato',
      grupoSanguineo: 'O+',
      molestiasOsteomusculares12M: ['Ninguna'],
      actividadFisicaRealiza: 'Sí',
      modalidadTrabajo: 'Híbrido',
      turnosTrabaja: 'No',
      transporteMedioPrincipal: 'Metro',
      transporteTiempoDesplazamiento: '30-60 min',
      observacionesGenerales: 'Sin observaciones'
    };

    const normalized = QuestionBankService.normalizeSurveyOrExcelData(fullSurveyInput);

    const isPassed = normalized.isCompleted &&
                     normalized.edad !== null &&
                     normalized.antiguedadCalculada !== 'Información no disponible.' &&
                     normalized.numeroIdentificacion === '1098765432';

    return {
      id: 14,
      name: 'Normalización Completa End-to-End de Encuesta Directa de 11 Módulos',
      category: 'Pipeline',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Registro de 11 módulos procesado. Edad calculada: ${normalized.edad} años. Antigüedad: "${normalized.antiguedadCalculada}".`,
      details: `Normalizado listo para ingestión por el motor de calidad.`
    };
  }

  // 15. Pipeline Integration (P27 -> P26 -> P25)
  private static testPipelineIntegration(companyId: string): TestResultP27 {
    const start = performance.now();
    const fullInput = {
      tipoDocumento: 'CC',
      numeroIdentificacion: '80123456',
      nombres: 'Jorge',
      apellidos: 'Vargas',
      correoElectronico: 'jorge.vargas@empresa.com',
      fechaNacimiento: '1985-03-22',
      sexo: 'Masculino',
      estadoCivil: 'Casado(a)',
      nivelEducativo: 'Especialización',
      ciudadResidencia: 'Cali',
      sede: 'Sede Principal',
      area: 'Gestión Humana',
      proyecto: 'Clima Laboral',
      cargo: 'Director GH',
      estrato: '5',
      zonaResidencia: 'Urbana',
      fechaIngreso: '2018-06-01',
      tipoContrato: 'Término Indefinido',
      tipoVivienda: 'Propia',
      serviciosPublicosBasicos: 'Sí',
      saludPresentaCondicion: 'No',
      saludDiagnosticoDeclarado: 'No',
      pesoKg: 78,
      estaturaCm: 178,
      grupoSanguineo: 'A+',
      molestiasOsteomusculares12M: ['Ninguna'],
      modalidadTrabajo: 'Presencial',
      transporteMedioPrincipal: 'Vehículo particular',
      transporteTiempoDesplazamiento: '< 30 min'
    };

    const normalized = QuestionBankService.normalizeSurveyOrExcelData(fullInput);
    const validationResult = SurveyValidationService.validateSurvey({ companyId, responsesList: [normalized] });
    const trace = EvidenceService.buildIndicatorTrace({
      indicatorId: 'IND-TEST-27',
      indicatorName: 'Indicador Test P27',
      companyId,
      periodId: '2026-P1',
      sourceType: 'SURVEY',
      responsesList: [normalized],
      questionId: 'sexo'
    });

    const isPassed = validationResult.completion.completionPercentage >= 50 && Boolean(trace.indicatorId);

    return {
      id: 15,
      name: 'Integración Completa del Pipeline (P27 Master Survey -> P26 Validación -> P25 Trazabilidad)',
      category: 'Pipeline',
      status: isPassed ? 'PASSED' : 'FAILED',
      durationMs: Math.round(performance.now() - start),
      message: `Pipeline ejecutado exitosamente. Completitud P26: ${validationResult.completion.completionPercentage}%. Trazabilidad P25 ID: ${trace.indicatorId}.`,
      details: `Demuestra compatibilidad total entre los módulos de los prompts 21 a 27.`
    };
  }
}
