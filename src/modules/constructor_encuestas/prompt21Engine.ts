/**
 * PROMPT 21 — CONSTRUCTOR DE ENCUESTA SOCIODEMOGRÁFICA Y CONDICIONES DE SALUD
 * Engine, Models, Company Catalogs & Golden Rules Engine.
 *
 * REGLA PRINCIPAL:
 * La plataforma NO debe inventar, estimar ni completar respuestas.
 * Si una persona no proporciona un dato permitido como opcional: null.
 * Si una pregunta es obligatoria: se impide finalizar la encuesta.
 */

import { parseOtroValue, isOtroOption } from './otroHelper';
import { buildStandardResponseItem, validateSurveyConsistency } from './dataQualityHelper';
import { ResponseStatus } from './types';

export type AnswerSource = 'SURVEY' | 'EXCEL' | 'MANUAL' | 'CALCULATED';
export type CompletionStatus = 'COMPLETED' | 'INCOMPLETE';

export interface SurveyResponseItem {
  questionId: string;
  answer: any; // value or null
  value: any;
  otherValue?: string;
  responseStatus: ResponseStatus;
  answered: boolean;
  required: boolean;
  source: AnswerSource;
  timestamp: string;
}

export interface EmployeeSurveyResponse {
  id: string;
  companyId: string;
  surveyId: string;
  periodId: string;
  employeeId: string;
  fechaRespuesta: string;
  responses: Record<string, SurveyResponseItem>;
  completionStatus: CompletionStatus;
  completionPercentage: number;
  source: AnswerSource;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CatalogItemOption {
  id: string;
  label: string;
  code?: string;
  active: boolean;
}

export interface CompanyCatalogOptions {
  sedes: CatalogItemOption[];
  areas: CatalogItemOption[];
  proyectos: CatalogItemOption[];
  cargos: CatalogItemOption[];
  tiposContrato: CatalogItemOption[];
  modalidadesTrabajo: CatalogItemOption[];
}

export interface CompanyValidationRules {
  minAge: number; // default 18
  maxAge: number; // default 100
  minWeightKg: number; // default 30
  maxWeightKg: number; // default 250
  minHeightCm: number; // default 100
  maxHeightCm: number; // default 230
  minHouseholdMembers: number; // default 1
  allowOptionalWeightHeight: boolean; // default true
}

export interface CompanySurveyConfiguration {
  companyId: string;
  companyName: string;
  sections: string[];
  questions: Record<string, any>;
  requiredFields: string[];
  catalogs: CompanyCatalogOptions;
  validationRules: CompanyValidationRules;
  minimumCoverage: number; // e.g. 70
  enabledIndicators: string[];
}

// Default Company Catalogs generator (Parametrizable by company)
export function getDefaultCompanyCatalog(companyId: string, companyName?: string): CompanyCatalogOptions {
  if (companyId === 'EMP-002' || companyName?.includes('Innovatech')) {
    return {
      sedes: [
        { id: 'S-INO-01', label: 'Sede Principal Innovatech (Bogotá)', code: 'BOG-INO', active: true },
        { id: 'S-INO-02', label: 'Sede Innovación (Medellín)', code: 'MDE-INO', active: true },
        { id: 'S-INO-03', label: 'Hub Tecnológico (Cali)', code: 'CLO-INO', active: true }
      ],
      areas: [
        { id: 'A-INO-01', label: 'Desarrollo de Software y Cloud', code: 'DEV', active: true },
        { id: 'A-INO-02', label: 'Inteligencia Artificial y Analítica', code: 'IA', active: true },
        { id: 'A-INO-03', label: 'Seguridad Digital y SG-SST', code: 'SST', active: true },
        { id: 'A-INO-04', label: 'Operaciones BPO & Soporte', code: 'BPO', active: true }
      ],
      proyectos: [
        { id: 'P-INO-01', label: 'Proyecto Transformación Digital 2026', code: 'PTD', active: true },
        { id: 'P-INO-02', label: 'Campaña SG-SST Inteligente', code: 'CSST', active: true },
        { id: 'P-INO-03', label: 'Infraestructura Cloud Multi-tenant', code: 'ICM', active: true }
      ],
      cargos: [
        { id: 'C-01', label: 'Arquitecto de Software', code: 'ARQ', active: true },
        { id: 'C-02', label: 'Ingeniero de Datos / ML', code: 'DAT', active: true },
        { id: 'C-03', label: 'Especialista SG-SST', code: 'SST', active: true },
        { id: 'C-04', label: 'Analista de Operaciones', code: 'OPS', active: true }
      ],
      tiposContrato: [
        { id: 'TC-01', label: 'Término Indefinido', code: 'IND', active: true },
        { id: 'TC-02', label: 'Término Fijo', code: 'FIJ', active: true },
        { id: 'TC-03', label: 'Obra o Labor', code: 'OBL', active: true },
        { id: 'TC-04', label: 'Prestación de Servicios', code: 'PS', active: true }
      ],
      modalidadesTrabajo: [
        { id: 'MT-01', label: 'Presencial', code: 'PRE', active: true },
        { id: 'MT-02', label: 'Teletrabajo / Trabajo en Casa (Remoto)', code: 'REM', active: true },
        { id: 'MT-03', label: 'Híbrido', code: 'HIB', active: true }
      ]
    };
  }

  // Default base company catalog
  return {
    sedes: [
      { id: 'S-01', label: 'Sede Principal (Bogotá)', code: 'BOG', active: true },
      { id: 'S-02', label: 'Sede Regional Norte (Barranquilla)', code: 'BAQ', active: true },
      { id: 'S-03', label: 'Planta Operativa Occidente', code: 'OCC', active: true }
    ],
    areas: [
      { id: 'A-01', label: 'Administrativa y Financiera', code: 'ADM', active: true },
      { id: 'A-02', label: 'Operaciones y Producción', code: 'OPS', active: true },
      { id: 'A-03', label: 'Talento Humano y SG-SST', code: 'SST', active: true },
      { id: 'A-04', label: 'Comercial y Servicio al Cliente', code: 'COM', active: true }
    ],
    proyectos: [
      { id: 'P-01', label: 'Operación Base General', code: 'BASE', active: true },
      { id: 'P-02', label: 'Proyecto Expansión 2026', code: 'EXP', active: true }
    ],
    cargos: [
      { id: 'C-01', label: 'Coordinador SG-SST', code: 'CSST', active: true },
      { id: 'C-02', label: 'Auxiliar Operativo', code: 'AUX', active: true },
      { id: 'C-03', label: 'Analista Administrativo', code: 'ANA', active: true },
      { id: 'C-04', label: 'Supervisora de Planta', code: 'SUP', active: true }
    ],
    tiposContrato: [
      { id: 'TC-01', label: 'Término Indefinido', code: 'IND', active: true },
      { id: 'TC-02', label: 'Término Fijo', code: 'FIJ', active: true },
      { id: 'TC-03', label: 'Aprendiz Sena', code: 'SEN', active: true }
    ],
    modalidadesTrabajo: [
      { id: 'MT-01', label: 'Presencial', code: 'PRE', active: true },
      { id: 'MT-02', label: 'Trabajo Remoto', code: 'REM', active: true },
      { id: 'MT-03', label: 'Híbrido', code: 'HIB', active: true }
    ]
  };
}

// Storage helpers for company survey config
const SURVEY_CONFIG_STORAGE_KEY = 'sgsst_company_survey_configs_v1';
const SURVEY_RESPONSES_STORAGE_KEY = 'sgsst_employee_survey_responses_v1';

export function getCompanySurveyConfiguration(companyId: string, companyName?: string): CompanySurveyConfiguration {
  try {
    const raw = localStorage.getItem(`${SURVEY_CONFIG_STORAGE_KEY}_${companyId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading survey config:', e);
  }

  const catalogs = getDefaultCompanyCatalog(companyId, companyName);
  const defaultConfig: CompanySurveyConfiguration = {
    companyId,
    companyName: companyName || 'Empresa Registrada',
    sections: [
      'identificacion',
      'laboral',
      'sociodemografico',
      'familiar',
      'salud',
      'medicamentos',
      'alergias',
      'osteomuscular',
      'antropometria',
      'discapacidad',
      'actividadFisica',
      'habitosVida',
      'tiempoLibre',
      'mascotas'
    ],
    questions: {},
    requiredFields: [
      'sede',
      'area',
      'cargo',
      'tipoContrato',
      'fechaIngreso',
      'modalidadTrabajo',
      'edad',
      'sexo',
      'estadoCivil',
      'ciudadResidencia',
      'nivelEducativo',
      'estrato',
      'tipoVivienda',
      'personasHogar',
      'viveSolo',
      'tienePersonasACargo',
      'tieneHijos',
      'saludDiagnosticoRelevante',
      'consumeMedicamentosFrecuente',
      'presentaAlergias',
      'molestiasOsteomusculares',
      'presentaDiscapacidad',
      'actividadFisicaRegular',
      'nivelHabitualActividadFisica',
      'actividadTiempoLibre'
    ],
    catalogs,
    validationRules: {
      minAge: 18,
      maxAge: 100,
      minWeightKg: 30,
      maxWeightKg: 250,
      minHeightCm: 100,
      maxHeightCm: 230,
      minHouseholdMembers: 1,
      allowOptionalWeightHeight: true
    },
    minimumCoverage: 70,
    enabledIndicators: [
      'distribucion_edad',
      'genero_porcentaje',
      'distribucion_sede',
      'distribucion_area',
      'tipo_contrato',
      'imc_promedio',
      'prevalencia_osteomuscular',
      'cobertura_encuesta'
    ]
  };

  saveCompanySurveyConfiguration(defaultConfig);
  return defaultConfig;
}

export function saveCompanySurveyConfiguration(config: CompanySurveyConfiguration): void {
  try {
    localStorage.setItem(`${SURVEY_CONFIG_STORAGE_KEY}_${config.companyId}`, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving survey config:', e);
  }
}

/**
 * CORE VALIDATOR & RESPONSES PROCESSOR (PROMPT 21)
 * Enforces zero synthetic data, optional weight/height nulls, conditional validations,
 * category preservation for "PREFIERO_NO_RESPONDER", and source tracking.
 */
export function validateAndProcessSurveySubmission(params: {
  companyId: string;
  surveyId: string;
  periodId: string;
  employeeId: string;
  fechaRespuesta?: string;
  rawAnswers: Record<string, any>;
  source?: AnswerSource;
  config?: CompanySurveyConfiguration;
}): {
  response: EmployeeSurveyResponse;
  isValid: boolean;
  errors: Record<string, string>;
  missingRequiredFields: string[];
} {
  const {
    companyId,
    surveyId,
    periodId,
    employeeId,
    fechaRespuesta = new Date().toISOString().split('T')[0],
    rawAnswers,
    source = 'SURVEY',
    config = getCompanySurveyConfiguration(companyId)
  } = params;

  const rules = config.validationRules;
  const requiredFields = new Set(config.requiredFields);

  const processedResponses: Record<string, SurveyResponseItem> = {};
  const errors: Record<string, string> = {};
  const missingRequiredFields: string[] = [];

  const nowIso = new Date().toISOString();

  // Helper to store response item with metadata conforming to Prompt 24
  const recordResponse = (
    qId: string,
    value: any,
    isReq: boolean,
    customSource?: AnswerSource,
    isAsked: boolean = true,
    isApplicable: boolean = true
  ) => {
    const stdItem = buildStandardResponseItem({
      questionId: qId,
      rawValue: value,
      isAsked,
      isApplicable,
      source: customSource || source
    });

    let isOtroWithoutSpec = false;
    if (stdItem.responseStatus === 'OTHER') {
      if (!stdItem.otherValue || stdItem.otherValue.trim() === '') {
        isOtroWithoutSpec = true;
      }
    }

    const answered = (
      stdItem.responseStatus === 'ANSWERED' ||
      stdItem.responseStatus === 'NO' ||
      (stdItem.responseStatus === 'OTHER' && !isOtroWithoutSpec)
    );

    processedResponses[qId] = {
      questionId: qId,
      answer: stdItem.value,
      value: stdItem.value,
      otherValue: stdItem.otherValue,
      responseStatus: stdItem.responseStatus,
      answered,
      required: isReq,
      source: stdItem.source,
      timestamp: stdItem.updatedAt
    };

    if (isOtroWithoutSpec) {
      missingRequiredFields.push(qId);
      errors[qId] = 'La opción "Otro" requiere especificar la respuesta en el campo "¿Cuál?".';
    } else if (isReq && !answered && stdItem.responseStatus !== 'NOT_ASKED' && stdItem.responseStatus !== 'NOT_APPLICABLE') {
      missingRequiredFields.push(qId);
      errors[qId] = 'Este campo es obligatorio para finalizar la encuesta.';
    }
  };

  // --- 1. IDENTIFICACIÓN DE LA ENCUESTA ---
  recordResponse('companyId', companyId, true);
  recordResponse('surveyId', surveyId, true);
  recordResponse('periodId', periodId, true);
  recordResponse('employeeId', employeeId, true);
  recordResponse('fechaRespuesta', fechaRespuesta, true);

  // --- 2. INFORMACIÓN LABORAL ---
  recordResponse('sede', rawAnswers['sede'], requiredFields.has('sede'));
  recordResponse('area', rawAnswers['area'], requiredFields.has('area'));
  recordResponse('proyecto', rawAnswers['proyecto'], false);
  recordResponse('cargo', rawAnswers['cargo'], requiredFields.has('cargo'));
  recordResponse('tipoContrato', rawAnswers['tipoContrato'], requiredFields.has('tipoContrato'));
  recordResponse('fechaIngreso', rawAnswers['fechaIngreso'], requiredFields.has('fechaIngreso'));
  recordResponse('modalidadTrabajo', rawAnswers['modalidadTrabajo'], requiredFields.has('modalidadTrabajo'));

  // --- 3. DATOS SOCIODEMOGRÁFICOS ---
  // Edad Validation (18-100)
  const rawEdad = rawAnswers['edad'];
  if (rawEdad !== undefined && rawEdad !== null && rawEdad !== '') {
    const numEdad = Number(rawEdad);
    if (isNaN(numEdad) || numEdad < rules.minAge || numEdad > rules.maxAge) {
      errors['edad'] = `La edad debe estar entre ${rules.minAge} y ${rules.maxAge} años.`;
    }
    recordResponse('edad', isNaN(numEdad) ? null : numEdad, requiredFields.has('edad'));
  } else {
    recordResponse('edad', null, requiredFields.has('edad'));
  }

  recordResponse('sexo', rawAnswers['sexo'], requiredFields.has('sexo'));
  recordResponse('estadoCivil', rawAnswers['estadoCivil'], requiredFields.has('estadoCivil'));
  recordResponse('ciudadResidencia', rawAnswers['ciudadResidencia'], requiredFields.has('ciudadResidencia'));
  recordResponse('nivelEducativo', rawAnswers['nivelEducativo'], requiredFields.has('nivelEducativo'));
  recordResponse('estrato', rawAnswers['estrato'], requiredFields.has('estrato'));
  recordResponse('tipoVivienda', rawAnswers['tipoVivienda'], requiredFields.has('tipoVivienda'));

  // Personas que conforman el hogar (>=1)
  const rawHogar = rawAnswers['personasHogar'];
  if (rawHogar !== undefined && rawHogar !== null && rawHogar !== '') {
    const numHogar = Number(rawHogar);
    if (isNaN(numHogar) || numHogar < rules.minHouseholdMembers) {
      errors['personasHogar'] = `El número de personas en el hogar debe ser al menos ${rules.minHouseholdMembers}.`;
    }
    recordResponse('personasHogar', isNaN(numHogar) ? null : numHogar, requiredFields.has('personasHogar'));
  } else {
    recordResponse('personasHogar', null, requiredFields.has('personasHogar'));
  }

  recordResponse('viveSolo', rawAnswers['viveSolo'], requiredFields.has('viveSolo'));

  // --- 4. CARACTERÍSTICAS FAMILIARES ---
  const tienePersonasACargo = rawAnswers['tienePersonasACargo'];
  recordResponse('tienePersonasACargo', tienePersonasACargo, requiredFields.has('tienePersonasACargo'));

  if (tienePersonasACargo === 'Sí' || tienePersonasACargo === 'SI' || tienePersonasACargo === 'SÍ') {
    const rawACargo = rawAnswers['numeroPersonasACargo'];
    const numACargo = rawACargo !== undefined && rawACargo !== null && rawACargo !== '' ? Number(rawACargo) : null;
    if (numACargo !== null && numACargo < 0) errors['numeroPersonasACargo'] = 'El número de personas a cargo no puede ser negativo.';
    recordResponse('numeroPersonasACargo', numACargo, true, undefined, true, true);
  } else {
    // If NO, PREFER_NOT_TO_ANSWER, or NULL -> child question NOT ASKED
    recordResponse('numeroPersonasACargo', null, false, undefined, false, false);
  }

  const tieneHijos = rawAnswers['tieneHijos'];
  recordResponse('tieneHijos', tieneHijos, requiredFields.has('tieneHijos'));

  if (tieneHijos === 'Sí' || tieneHijos === 'SI' || tieneHijos === 'SÍ') {
    const rawHijos = rawAnswers['numeroHijos'];
    const numHijos = rawHijos !== undefined && rawHijos !== null && rawHijos !== '' ? Number(rawHijos) : null;
    if (numHijos !== null && numHijos < 0) errors['numeroHijos'] = 'El número de hijos no puede ser negativo.';
    recordResponse('numeroHijos', numHijos, true, undefined, true, true);
  } else {
    // If NO, PREFER_NOT_TO_ANSWER, or NULL -> child question NOT ASKED (Prompt 24 Section 8)
    recordResponse('numeroHijos', null, false, undefined, false, false);
  }

  recordResponse('adultosMayoresACargo', rawAnswers['adultosMayoresACargo'], false);
  recordResponse('personasDiscapacidadACargo', rawAnswers['personasDiscapacidadACargo'], false);
  recordResponse('cuidadorPrincipal', rawAnswers['cuidadorPrincipal'], false);

  // --- 5. CONDICIONES DE SALUD ---
  const saludDiag = rawAnswers['saludDiagnosticoRelevante'];
  recordResponse('saludDiagnosticoRelevante', saludDiag, requiredFields.has('saludDiagnosticoRelevante'));

  if (saludDiag === 'Sí' || saludDiag === 'SI' || saludDiag === 'SÍ') {
    recordResponse('saludTipoDiagnostico', rawAnswers['saludTipoDiagnostico'], true, undefined, true, true);
  } else {
    recordResponse('saludTipoDiagnostico', null, false, undefined, false, false);
  }

  // --- 6. MEDICAMENTOS ---
  const consumeMed = rawAnswers['consumeMedicamentosFrecuente'];
  recordResponse('consumeMedicamentosFrecuente', consumeMed, requiredFields.has('consumeMedicamentosFrecuente'));

  if (consumeMed === 'Sí' || consumeMed === 'SI' || consumeMed === 'SÍ') {
    recordResponse('medicamentosAfectanLaboral', rawAnswers['medicamentosAfectanLaboral'], true, undefined, true, true);
  } else {
    recordResponse('medicamentosAfectanLaboral', null, false, undefined, false, false);
  }

  // --- 7. ALERGIAS ---
  const presAlergias = rawAnswers['presentaAlergias'];
  recordResponse('presentaAlergias', presAlergias, requiredFields.has('presentaAlergias'));

  if (presAlergias === 'Sí' || presAlergias === 'SI' || presAlergias === 'SÍ') {
    recordResponse('tiposAlergia', rawAnswers['tiposAlergia'], true, undefined, true, true);
    recordResponse('alergiasEspecificacion', rawAnswers['alergiasEspecificacion'], false, undefined, true, true);
  } else {
    recordResponse('tiposAlergia', null, false, undefined, false, false);
    recordResponse('alergiasEspecificacion', null, false, undefined, false, false);
  }

  // --- 8. CONDICIONES OSTEOMUSCULARES ---
  const molestiaOsteo = rawAnswers['molestiasOsteomusculares'];
  recordResponse('molestiasOsteomusculares', molestiaOsteo, requiredFields.has('molestiasOsteomusculares'));

  if (molestiaOsteo === 'Sí' || molestiaOsteo === 'SI' || molestiaOsteo === 'SÍ') {
    recordResponse('zonasOsteomusculares', rawAnswers['zonasOsteomusculares'], true, undefined, true, true);
    recordResponse('osteomuscularAfectoLaboral', rawAnswers['osteomuscularAfectoLaboral'], true, undefined, true, true);
  } else {
    recordResponse('zonasOsteomusculares', null, false, undefined, false, false);
    recordResponse('osteomuscularAfectoLaboral', null, false, undefined, false, false);
  }

  // --- 9. PESO Y ESTATURA (REGLA CRÍTICA: SI FALTA UNO O AMBOS -> NULL. NUNCA ARTIFICIAL) ---
  const rawPeso = rawAnswers['pesoKg'];
  const rawEstatura = rawAnswers['estaturaCm'];

  let finalPeso: number | null = null;
  let finalEstatura: number | null = null;
  let finalIMC: number | null = null;

  if (rawPeso !== undefined && rawPeso !== null && rawPeso !== '') {
    const numP = Number(rawPeso);
    if (!isNaN(numP) && numP >= rules.minWeightKg && numP <= rules.maxWeightKg) {
      finalPeso = numP;
    } else {
      errors['pesoKg'] = `El peso debe estar entre ${rules.minWeightKg} y ${rules.maxWeightKg} kg.`;
    }
  }

  if (rawEstatura !== undefined && rawEstatura !== null && rawEstatura !== '') {
    const numE = Number(rawEstatura);
    if (!isNaN(numE) && numE >= rules.minHeightCm && numE <= rules.maxHeightCm) {
      finalEstatura = numE;
    } else {
      errors['estaturaCm'] = `La estatura debe estar entre ${rules.minHeightCm} y ${rules.maxHeightCm} cm.`;
    }
  }

  // Weight and height are strictly OPTIONAL unless configured otherwise.
  // Prompt 24 Section 10: If either weight or height is missing, IMC = null, responseStatus = MISSING, source = CALCULATED. No estimated weight/height.
  if (finalPeso !== null && finalEstatura !== null) {
    const estaturaM = finalEstatura / 100;
    finalIMC = Math.round((finalPeso / (estaturaM * estaturaM)) * 10) / 10;
  }

  recordResponse('pesoKg', finalPeso, false, 'SURVEY');
  recordResponse('estaturaCm', finalEstatura, false, 'SURVEY');
  recordResponse('imcCalculado', finalIMC, false, 'CALCULATED');

  // --- 10. DISCAPACIDAD O LIMITACIÓN ---
  const presDiscap = rawAnswers['presentaDiscapacidad'];
  recordResponse('presentaDiscapacidad', presDiscap, requiredFields.has('presentaDiscapacidad'));

  if (presDiscap === 'Sí' || presDiscap === 'SI' || presDiscap === 'SÍ') {
    recordResponse('requiereAjusteLaboral', rawAnswers['requiereAjusteLaboral'], true, undefined, true, true);
  } else {
    recordResponse('requiereAjusteLaboral', null, false, undefined, false, false);
  }

  // --- 11. ACTIVIDAD FÍSICA ---
  const actFis = rawAnswers['actividadFisicaRegular'];
  recordResponse('actividadFisicaRegular', actFis, requiredFields.has('actividadFisicaRegular'));

  if (actFis === 'Sí' || actFis === 'SI' || actFis === 'SÍ') {
    recordResponse('frecuenciaActividadFisica', rawAnswers['frecuenciaActividadFisica'], true, undefined, true, true);
    recordResponse('tipoActividadFisica', rawAnswers['tipoActividadFisica'], true, undefined, true, true);
  } else {
    recordResponse('frecuenciaActividadFisica', null, false, undefined, false, false);
    recordResponse('tipoActividadFisica', null, false, undefined, false, false);
  }

  // --- 12. HÁBITOS DE VIDA ---
  recordResponse('nivelHabitualActividadFisica', rawAnswers['nivelHabitualActividadFisica'], requiredFields.has('nivelHabitualActividadFisica'));

  // --- 13. TIEMPO LIBRE ---
  recordResponse('actividadTiempoLibre', rawAnswers['actividadTiempoLibre'], requiredFields.has('actividadTiempoLibre'));

  // --- 14. MASCOTAS ---
  recordResponse('tieneMascotas', rawAnswers['tieneMascotas'], false);

  // SECTION 17 — AUTOMATED CONSISTENCY CHECK
  const consistencyResult = validateSurveyConsistency(processedResponses);
  if (!consistencyResult.isConsistent) {
    consistencyResult.errors.forEach((errMsg, i) => {
      errors[`consistency_${i}`] = errMsg;
    });
  }

  // Completion stats
  const totalTrackedQuestions = Object.keys(processedResponses).length;
  const answeredCount = Object.values(processedResponses).filter(r => r.answered).length;
  const completionPercentage = Math.round((answeredCount / totalTrackedQuestions) * 100);

  const isValid = missingRequiredFields.length === 0 && Object.keys(errors).length === 0;
  const completionStatus: CompletionStatus = isValid ? 'COMPLETED' : 'INCOMPLETE';

  const responseRecord: EmployeeSurveyResponse = {
    id: `RESP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    companyId,
    surveyId,
    periodId,
    employeeId,
    fechaRespuesta,
    responses: processedResponses,
    completionStatus,
    completionPercentage,
    source,
    createdAt: nowIso,
    updatedAt: nowIso,
    completedAt: completionStatus === 'COMPLETED' ? nowIso : undefined
  };

  return {
    response: responseRecord,
    isValid,
    errors,
    missingRequiredFields
  };
}

/**
 * EXCEL COLUMNS MAPPER (PROMPT 21 SECTION 23)
 * Maps Excel row key-value objects directly into the exact same survey data model format.
 */
export function mapExcelRowToSurveyResponse(excelRow: Record<string, any>, companyId: string, periodId = '2026-Q1'): EmployeeSurveyResponse {
  const normKey = (k: string) => k.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const rowMap: Record<string, any> = {};
  Object.keys(excelRow).forEach(key => {
    rowMap[normKey(key)] = excelRow[key];
  });

  const getVal = (...keys: string[]) => {
    for (const k of keys) {
      const nk = normKey(k);
      if (rowMap[nk] !== undefined && rowMap[nk] !== null && rowMap[nk] !== '') {
        return rowMap[nk];
      }
    }
    return null;
  };

  const getSelectionVal = (mainKey: string, ...aliases: string[]) => {
    const mainVal = getVal(mainKey, ...aliases);
    if (!mainVal) return null;
    if (isOtroOption(mainVal)) {
      const otroSpec = getVal(`${mainKey}otro`, `${mainKey}_otro`, `${aliases[0] || mainKey}otro`, 'respuestaotro', 'otroespecificacion');
      return { option: 'OTRO', otherValue: otroSpec || '' };
    }
    return mainVal;
  };

  const rawAnswers: Record<string, any> = {
    sede: getVal('sede', 'ubicacion', 'plantasede'),
    area: getVal('area', 'departamento', 'unidad'),
    proyecto: getVal('proyecto', 'campana', 'centrodecosto'),
    cargo: getVal('cargo', 'puesto', 'rol'),
    tipoContrato: getVal('tipocontrato', 'vinculacion', 'contrato'),
    fechaIngreso: getVal('fechaingreso', 'fechadeingreso', 'ingreso'),
    modalidadTrabajo: getVal('modalidadtrabajo', 'modalidad', 'teletrabajo'),

    edad: getVal('edad', 'años'),
    sexo: getVal('sexo', 'genero'),
    estadoCivil: getVal('estadocivil', 'civil'),
    ciudadResidencia: getVal('ciudadresidencia', 'ciudad', 'municipio'),
    nivelEducativo: getVal('niveleducativo', 'escolaridad', 'estudios'),
    estrato: getVal('estrato', 'estratosocioeconomico'),
    tipoVivienda: getVal('tipovivienda', 'vivienda'),
    personasHogar: getVal('personashogar', 'integranteshogar', 'personasquegconforman'),
    viveSolo: getVal('vivesolo', 'solosolo'),

    tienePersonasACargo: getVal('tienepersonasacargo', 'personasacargo'),
    numeroPersonasACargo: getVal('numeropersonasacargo', 'cantidadacargo'),
    tieneHijos: getVal('tienehijos', 'hijos'),
    numeroHijos: getVal('numerohijos', 'cantidadhijos'),
    adultosMayoresACargo: getVal('adultosmayoresacargo', 'cuidadoadultomayor'),
    personasDiscapacidadACargo: getVal('personasdiscapacidadacargo', 'discapacidadacargo'),
    cuidadorPrincipal: getVal('cuidadorprincipal', 'cuidadorfamiliar'),

    saludDiagnosticoRelevante: getVal('saluddiagnosticorelevante', 'diagnosticoenfermedad'),
    saludTipoDiagnostico: getVal('saludtipodiagnostico', 'patologia'),

    consumeMedicamentosFrecuente: getVal('consumemedicamentosfrecuente', 'medicamentos'),
    medicamentosAfectanLaboral: getVal('medicamentosafectanlaboral', 'medicamentosafectan'),

    presentaAlergias: getVal('presentaalergias', 'alergia'),
    tiposAlergia: getVal('tiposalergia', 'tipoalergia'),
    alergiasEspecificacion: getVal('alergiasespecificacion', 'alergiaespecifica'),

    molestiasOsteomusculares: getVal('molestiasosteomusculares', 'dolormuscular'),
    zonasOsteomusculares: getVal('zonasosteomusculares', 'ubicaciondolor'),
    osteomuscularAfectoLaboral: getVal('osteomuscularafectolaboral', 'dolorafectalaboral'),

    pesoKg: getVal('pesokg', 'peso', 'pesocorporal'),
    estaturaCm: getVal('estaturacm', 'estatura', 'talla'),

    presentaDiscapacidad: getVal('presentadiscapacidad', 'discapacidad'),
    requiereAjusteLaboral: getVal('requiereajustelaboral', 'ajustePuesto'),

    actividadFisicaRegular: getVal('actividadfisicaregular', 'ejercicio'),
    frecuenciaActividadFisica: getVal('frecuenciaactividadfisica', 'frecuenciaejercicio'),
    tipoActividadFisica: getSelectionVal('tipoactividadfisica', 'tipodeporte'),

    nivelHabitualActividadFisica: getSelectionVal('nivelhabitualactividadfisica', 'nivelactividad'),
    actividadTiempoLibre: getSelectionVal('actividadtiempolibre', 'tiempolibre'),
    tieneMascotas: getVal('tienemascotas', 'mascotas')
  };

  const employeeId = getVal('employeeid', 'cedula', 'documento', 'id') || `EXCEL-EMP-${Math.floor(Math.random() * 10000)}`;

  const processed = validateAndProcessSurveySubmission({
    companyId,
    surveyId: 'SURVEY-SOCIODEMO-EXCEL',
    periodId,
    employeeId,
    rawAnswers,
    source: 'EXCEL'
  });

  return processed.response;
}
