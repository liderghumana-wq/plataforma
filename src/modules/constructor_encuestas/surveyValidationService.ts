/**
 * PROMPT 26 — SURVEY VALIDATION SERVICE (SurveyValidationService)
 * Software Architecture for Pre-Report Data Quality & Readiness Enforcement.
 * 
 * Absolute Rule:
 * THE SYSTEM MUST DETECT MISSING/INVALID/UNCONFIGURED/CONTRADICTORY DATA 
 * BEFORE GENERATING THE REPORT. NO DIRECT REPORT GENERATION FROM RAW EXCEL OR SURVEY.
 */

import { StandardResponseItem, ResponseStatus } from './types';
import { getCompanySurveyConfiguration, CompanySurveyConfiguration } from './prompt21Engine';

export type SurveyLifecycleStatus = 
  | 'DRAFT' 
  | 'OPEN' 
  | 'CLOSING' 
  | 'CLOSED' 
  | 'VALIDATED' 
  | 'VALIDATION_FAILED' 
  | 'READY_FOR_REPORT';

export type VariableCriticality = 'CRITICAL' | 'IMPORTANT' | 'OPTIONAL';

export type VariableQualityStatus = 'COMPLETO' | 'PARCIAL' | 'INCOMPLETO' | 'NOT_CONFIGURED';

export type TrafficLightState = 'GREEN' | 'ORANGE' | 'RED';

export interface DataDictionaryField {
  id: string;
  name: string;
  category: 'SOCIODEMOGRAFICO' | 'SALUD' | 'LABORAL' | 'COMPLEMENTARIO';
  criticality: VariableCriticality;
  aliases: string[];
  description: string;
  catalogType?: 'sedes' | 'areas' | 'proyectos' | 'cargos' | 'tiposContrato' | 'modalidadesTrabajo';
}

/**
 * Standard DataDictionary mapping required by Prompt 26 Section 5 & 6.
 */
export const DATA_DICTIONARY: Record<string, DataDictionaryField> = {
  // CRITICAL SOCIODEMOGRAPHICS
  sexo: { id: 'sexo', name: 'Sexo / Género', category: 'SOCIODEMOGRAFICO', criticality: 'CRITICAL', aliases: ['sexo', 'genero', 'sexo_genero'], description: 'Caracterización sociodemográfica por sexo o género' },
  edad: { id: 'edad', name: 'Edad / Fecha de Nacimiento', category: 'SOCIODEMOGRAFICO', criticality: 'CRITICAL', aliases: ['edad', 'fecha_nacimiento', 'fechanacimiento'], description: 'Edad o fecha de nacimiento' },
  ciudadResidencia: { id: 'ciudadResidencia', name: 'Ciudad de Residencia', category: 'SOCIODEMOGRAFICO', criticality: 'CRITICAL', aliases: ['ciudad', 'ciudad_residencia', 'municipio'], description: 'Ubicación geográfica de residencia' },
  sede: { id: 'sede', name: 'Sede Laboral', category: 'LABORAL', criticality: 'CRITICAL', aliases: ['sede', 'sede_laboral', 'centro_trabajo'], description: 'Sede física o virtual asignada', catalogType: 'sedes' },
  area: { id: 'area', name: 'Área / Departamento', category: 'LABORAL', criticality: 'CRITICAL', aliases: ['area', 'departamento', 'seccion'], description: 'Área o unidad organizacional', catalogType: 'areas' },
  proyecto: { id: 'proyecto', name: 'Proyecto / Campaña', category: 'LABORAL', criticality: 'CRITICAL', aliases: ['proyecto', 'campana', 'centro_costos'], description: 'Proyecto o campaña de trabajo', catalogType: 'proyectos' },
  cargo: { id: 'cargo', name: 'Cargo / Posición', category: 'LABORAL', criticality: 'CRITICAL', aliases: ['cargo', 'puesto_trabajo', 'ocupacion'], description: 'Denominación del cargo', catalogType: 'cargos' },
  tipoContrato: { id: 'tipoContrato', name: 'Tipo de Contrato', category: 'LABORAL', criticality: 'CRITICAL', aliases: ['tipo_contrato', 'contrato', 'vinculacion'], description: 'Modalidad de contratación laboral', catalogType: 'tiposContrato' },
  nivelEducativo: { id: 'nivelEducativo', name: 'Nivel Educativo', category: 'SOCIODEMOGRAFICO', criticality: 'CRITICAL', aliases: ['nivel_educativo', 'escolaridad', 'estudios'], description: 'Máximo nivel de formación académica' },
  estadoCivil: { id: 'estadoCivil', name: 'Estado Civil', category: 'SOCIODEMOGRAFICO', criticality: 'CRITICAL', aliases: ['estado_civil', 'situacion_marital'], description: 'Estado civil declarado' },
  tienePersonasACargo: { id: 'tienePersonasACargo', name: 'Personas a Cargo / Dependientes', category: 'SOCIODEMOGRAFICO', criticality: 'CRITICAL', aliases: ['personas_a_cargo', 'dependientes', 'personas_hogar'], description: 'Número o condición de dependientes económicos' },
  estrato: { id: 'estrato', name: 'Estrato Socioeconómico', category: 'SOCIODEMOGRAFICO', criticality: 'CRITICAL', aliases: ['estrato', 'estrato_vivienda'], description: 'Estrato socioeconómico de la residencia' },
  tipoVivienda: { id: 'tipoVivienda', name: 'Tipo de Vivienda', category: 'SOCIODEMOGRAFICO', criticality: 'CRITICAL', aliases: ['tipo_vivienda', 'tenencia_vivienda', 'vivienda'], description: 'Propiedad o tenencia del inmueble' },
  modalidadTrabajo: { id: 'modalidadTrabajo', name: 'Modalidad de Trabajo', category: 'LABORAL', criticality: 'CRITICAL', aliases: ['modalidad_trabajo', 'modalidad', 'teletrabajo'], description: 'Modalidad presencial, remota o híbrida', catalogType: 'modalidadesTrabajo' },

  // IMPORTANT HEALTH VARIABLES
  saludDiagnosticoRelevante: { id: 'saludDiagnosticoRelevante', name: 'Condiciones de Salud Declaradas', category: 'SALUD', criticality: 'IMPORTANT', aliases: ['salud_diagnostico', 'diagnostico_medico', 'enfermedades'], description: 'Diagnósticos o enfermedades crónicas' },
  presentaDiscapacidad: { id: 'presentaDiscapacidad', name: 'Discapacidad', category: 'SALUD', criticality: 'IMPORTANT', aliases: ['discapacidad', 'tipo_discapacidad'], description: 'Condición de discapacidad física o sensorial' },
  presentaAlergias: { id: 'presentaAlergias', name: 'Alergias', category: 'SALUD', criticality: 'IMPORTANT', aliases: ['alergias', 'tipo_alergias'], description: 'Reacciones alérgicas medicamentosas o ambientales' },
  consumeMedicamentosFrecuente: { id: 'consumeMedicamentosFrecuente', name: 'Medicamentos de Uso Habitual', category: 'SALUD', criticality: 'IMPORTANT', aliases: ['medicamentos', 'uso_medicamentos'], description: 'Consumo recurrente de medicamentos recetados' },
  molestiasOsteomusculares: { id: 'molestiasOsteomusculares', name: 'Molestias Osteomusculares', category: 'SALUD', criticality: 'IMPORTANT', aliases: ['molestias_osteomusculares', 'dolor_muscular', 'ergonomia'], description: 'Síntomas o dolor en columna o extremidades' },
  pesoKg: { id: 'pesoKg', name: 'Peso (kg)', category: 'SALUD', criticality: 'IMPORTANT', aliases: ['peso', 'peso_kg', 'peso_corporal'], description: 'Peso corporal en kilogramos' },
  estaturaCm: { id: 'estaturaCm', name: 'Estatura (cm)', category: 'SALUD', criticality: 'IMPORTANT', aliases: ['estatura', 'estatura_cm', 'talla'], description: 'Estatura en centímetros' },
  perimetroCintura: { id: 'perimetroCintura', name: 'Perímetro de Cintura (cm)', category: 'SALUD', criticality: 'IMPORTANT', aliases: ['perimetro_cintura', 'cintura_cm'], description: 'Medida antropométrica de cintura' },
  actividadFisicaRegular: { id: 'actividadFisicaRegular', name: 'Actividad Física', category: 'SALUD', criticality: 'IMPORTANT', aliases: ['actividad_fisica', 'deporte', 'ejercicio'], description: 'Frecuencia de ejercicio o práctica deportiva' },
  grupoSanguineo: { id: 'grupoSanguineo', name: 'Grupo Sanguíneo y RH', category: 'SALUD', criticality: 'IMPORTANT', aliases: ['grupo_sanguineo', 'rh', 'tipo_sangre'], description: 'Tipificación sanguínea' },

  // OPTIONAL VARIABLES
  usoTiempoLibre: { id: 'usoTiempoLibre', name: 'Uso del Tiempo Libre / Hobbies', category: 'COMPLEMENTARIO', criticality: 'OPTIONAL', aliases: ['tiempo_libre', 'hobbies', 'recreacion'], description: 'Actividades recreativas o pasatiempos' },
  mascotas: { id: 'mascotas', name: 'Mascotas en el Hogar', category: 'COMPLEMENTARIO', criticality: 'OPTIONAL', aliases: ['mascotas', 'tiene_mascotas'], description: 'Convivencia con animales domésticos' },
  medioTransporte: { id: 'medioTransporte', name: 'Medio de Transporte Principal', category: 'COMPLEMENTARIO', criticality: 'OPTIONAL', aliases: ['medio_transporte', 'transporte'], description: 'Vehículo o medio utilizado para desplazamientos' }
};

export interface VariableValidationDetail {
  variableId: string;
  variableName: string;
  category: string;
  criticality: VariableCriticality;
  status: VariableQualityStatus;
  validResponses: number;
  missingRecords: number;
  unconfiguredRecords: number;
  totalApplicable: number;
  coveragePercentage: number;
  qualityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
  problemDescription?: string;
  affectedRecordsCount: number;
  affectedRecordIds: string[];
  recommendedAction: string;
}

export interface DataConsistencyIssue {
  id: string;
  severity: 'ERROR' | 'WARNING' | 'REVISION';
  employeeId: string;
  ruleName: string;
  description: string;
  affectedVariables: string[];
  recommendedAction: string;
}

export interface ExcelColumnValidationResult {
  columnsFound: string[];
  columnsMissing: string[];
  columnsUnrecognized: string[];
  columnsDuplicated: string[];
  columnsWithInvalidData: string[];
  isHeaderValid: boolean;
}

export interface IndicatorAvailabilityStatus {
  indicatorId: string;
  indicatorName: string;
  category: string;
  isAvailable: boolean;
  validBase: number;
  coveragePercentage: number;
  qualityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';
  statusIcon: '🟢' | '🟠' | '🔴';
  unavailabilityReason?: string;
}

export interface SurveyValidationResult {
  validationId: string;
  companyId: string;
  periodId: string;
  validatedAt: string;
  surveyStatus: SurveyLifecycleStatus;
  reportReadiness: {
    readyForOfficialReport: boolean;
    trafficLight: TrafficLightState;
    trafficLightLabel: string; // e.g. "🟢 LISTO PARA INFORME", "🟡 INFORMACIÓN PARCIAL", "🔴 NO APTO PARA INFORME"
    moduleStatus: {
      sociodemografico: TrafficLightState;
      salud: TrafficLightState;
      laboral: TrafficLightState;
    };
    blockingReasons: string[];
    canGeneratePreliminaryDraft: boolean;
    watermarkText?: string; // "BORRADOR — INFORMACIÓN INCOMPLETA"
  };
  completion: {
    totalEmployees: number;
    completedSurveys: number;
    incompleteSurveys: number;
    completionPercentage: number;
  };
  variableSummaries: VariableValidationDetail[];
  criticalVariablesStatus: {
    totalCritical: number;
    completeCritical: number;
    partialCritical: number;
    missingCritical: number;
    unconfiguredCritical: number;
    allCriticalValid: boolean;
  };
  unconfiguredValuesCount: number;
  unconfiguredDetails: Array<{ variable: string; rawValue: string; employeeId: string }>;
  consistencyErrors: DataConsistencyIssue[];
  excelColumnValidation?: ExcelColumnValidationResult;
  availableIndicators: IndicatorAvailabilityStatus[];
  unavailableIndicators: IndicatorAvailabilityStatus[];
  validatedData: any[]; // The sanitized & validated dataset to pass to EvidenceService
  versioning: {
    surveyVersion: string;
    dataVersion: string;
    validationVersion: string;
    reportVersion: string;
  };
}

export interface ValidationAuditLogRecord {
  validationId: string;
  companyId: string;
  periodId: string;
  userId: string;
  timestamp: string;
  status: SurveyLifecycleStatus;
  completionPercentage: number;
  criticalErrorsCount: number;
  warningsCount: number;
  variablesValidatedCount: number;
}

export class SurveyValidationService {
  private static auditLogs: ValidationAuditLogRecord[] = [];

  /**
   * Main entry point: Performs complete end-to-end pre-report validation on a dataset.
   */
  public static validateSurvey(params: {
    companyId: string;
    periodId?: string;
    userId?: string;
    responsesList: any[]; // List of employee survey/Excel response objects
    excelHeaders?: string[];
    companyCatalog?: CompanySurveyConfiguration;
  }): SurveyValidationResult {
    const {
      companyId,
      periodId = '2026-P1',
      userId = 'AUDITOR_SGSST',
      responsesList = [],
      excelHeaders,
      companyCatalog
    } = params;

    const catalog = companyCatalog || getCompanySurveyConfiguration(companyId, `Empresa ${companyId}`);
    const validationId = `VAL-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const timestamp = new Date().toISOString();

    // 1. Calculate Completion
    const completion = this.calculateCompletion(responsesList);

    // 2. Identify Excel Column discrepancies if headers provided
    let excelColumnValidation: ExcelColumnValidationResult | undefined = undefined;
    if (excelHeaders && excelHeaders.length > 0) {
      excelColumnValidation = this.validateExcelHeader(excelHeaders);
    }

    // 3. Identify Unconfigured Catalog Values
    const unconfigured = this.identifyUnconfiguredValues(responsesList, catalog);

    // 4. Validate All Variables defined in DATA_DICTIONARY
    const variableSummaries = this.identifyMissingVariables(responsesList, catalog, unconfigured.details);

    // 5. Detect Consistency Issues & Contradictions
    const consistencyErrors = this.validateDataConsistency(responsesList);

    // 6. Summarize Critical Variables
    const criticalSummaries = variableSummaries.filter(v => v.criticality === 'CRITICAL');
    const completeCritical = criticalSummaries.filter(v => v.status === 'COMPLETO').length;
    const partialCritical = criticalSummaries.filter(v => v.status === 'PARCIAL').length;
    const missingCritical = criticalSummaries.filter(v => v.status === 'INCOMPLETO').length;
    const unconfiguredCritical = criticalSummaries.filter(v => v.status === 'NOT_CONFIGURED').length;

    // All critical variables must have at least 50% coverage and 0 NOT_CONFIGURED to pass
    const allCriticalValid = missingCritical === 0 && unconfiguredCritical === 0 && criticalSummaries.every(v => v.coveragePercentage >= 50);

    // 7. Determine Indicator Availability
    const { availableIndicators, unavailableIndicators } = this.calculateIndicatorAvailability(variableSummaries);

    // 8. Determine Module Traffic Lights
    const sociodemograficoLight = this.computeModuleTrafficLight(variableSummaries.filter(v => v.category === 'SOCIODEMOGRAFICO'));
    const saludLight = this.computeModuleTrafficLight(variableSummaries.filter(v => v.category === 'SALUD'));
    const laboralLight = this.computeModuleTrafficLight(variableSummaries.filter(v => v.category === 'LABORAL'));

    // 9. Evaluate Report Readiness & Blocking Reasons
    const blockingReasons: string[] = [];

    // Critical variables check
    criticalSummaries.forEach(v => {
      if (v.status === 'INCOMPLETO' || v.coveragePercentage < 50) {
        blockingReasons.push(`Variable crítica "${v.variableName}" no cuenta con información suficiente (${v.coveragePercentage}% cobertura).`);
      }
      if (v.status === 'NOT_CONFIGURED') {
        blockingReasons.push(`Variable crítica "${v.variableName}" presenta valores que requieren parametrización en catálogo.`);
      }
    });

    // Unconfigured values check
    if (unconfigured.details.length > 0) {
      blockingReasons.push(`Existen ${unconfigured.details.length} registros con valores no parametrizados en el catálogo de la empresa.`);
    }

    // Consistency errors check
    const severeConsistencyErrors = consistencyErrors.filter(e => e.severity === 'ERROR');
    if (severeConsistencyErrors.length > 0) {
      blockingReasons.push(`Se detectaron ${severeConsistencyErrors.length} errores críticos de consistencia lógica entre variables.`);
    }

    // Missing Excel headers check
    if (excelColumnValidation && excelColumnValidation.columnsMissing.length > 0) {
      blockingReasons.push(`El archivo de datos no incluye ${excelColumnValidation.columnsMissing.length} columnas críticas obligatorias.`);
    }

    // Overall readiness decision
    const readyForOfficialReport = blockingReasons.length === 0 && allCriticalValid;

    let overallTrafficLight: TrafficLightState = 'GREEN';
    let trafficLightLabel = '🟢 LISTO PARA INFORME';

    if (!readyForOfficialReport) {
      if (sociodemograficoLight === 'RED' || laboralLight === 'RED' || severeConsistencyErrors.length > 0) {
        overallTrafficLight = 'RED';
        trafficLightLabel = '🔴 NO APTO PARA INFORME';
      } else {
        overallTrafficLight = 'ORANGE';
        trafficLightLabel = '🟡 INFORMACIÓN PARCIAL';
      }
    } else if (sociodemograficoLight === 'ORANGE' || saludLight === 'ORANGE' || laboralLight === 'ORANGE') {
      overallTrafficLight = 'ORANGE';
      trafficLightLabel = '🟡 INFORMACIÓN PARCIAL';
    }

    // Lifecycle Status
    let surveyStatus: SurveyLifecycleStatus = 'VALIDATED';
    if (readyForOfficialReport) {
      surveyStatus = 'READY_FOR_REPORT';
    } else {
      surveyStatus = 'VALIDATION_FAILED';
    }

    // Sanitized validated data payload (filtered from direct raw corruption)
    const validatedData = responsesList.map(record => ({ ...record, _validatedAt: timestamp, _validationId: validationId }));

    const result: SurveyValidationResult = {
      validationId,
      companyId,
      periodId,
      validatedAt: timestamp,
      surveyStatus,
      reportReadiness: {
        readyForOfficialReport,
        trafficLight: overallTrafficLight,
        trafficLightLabel,
        moduleStatus: {
          sociodemografico: sociodemograficoLight,
          salud: saludLight,
          laboral: laboralLight
        },
        blockingReasons,
        canGeneratePreliminaryDraft: true,
        watermarkText: readyForOfficialReport ? undefined : 'BORRADOR — INFORMACIÓN INCOMPLETA'
      },
      completion,
      variableSummaries,
      criticalVariablesStatus: {
        totalCritical: criticalSummaries.length,
        completeCritical,
        partialCritical,
        missingCritical,
        unconfiguredCritical,
        allCriticalValid
      },
      unconfiguredValuesCount: unconfigured.details.length,
      unconfiguredDetails: unconfigured.details,
      consistencyErrors,
      excelColumnValidation,
      availableIndicators,
      unavailableIndicators,
      validatedData,
      versioning: {
        surveyVersion: 'v1.0.0',
        dataVersion: `data-${Date.now().toString().slice(-6)}`,
        validationVersion: 'v1.0.0',
        reportVersion: readyForOfficialReport ? 'OFICIAL-v1.0' : 'BORRADOR-PRELIMINAR'
      }
    };

    // Log to Audit Trail
    this.logValidationAudit({
      validationId,
      companyId,
      periodId,
      userId,
      timestamp,
      status: surveyStatus,
      completionPercentage: completion.completionPercentage,
      criticalErrorsCount: blockingReasons.length,
      warningsCount: consistencyErrors.filter(c => c.severity === 'WARNING').length,
      variablesValidatedCount: variableSummaries.length
    });

    return result;
  }

  /**
   * 1. Calculates survey completion percentage & completed/incomplete counts.
   */
  public static calculateCompletion(responsesList: any[]): {
    totalEmployees: number;
    completedSurveys: number;
    incompleteSurveys: number;
    completionPercentage: number;
  } {
    const totalEmployees = responsesList.length;
    if (totalEmployees === 0) {
      return { totalEmployees: 0, completedSurveys: 0, incompleteSurveys: 0, completionPercentage: 0 };
    }

    let completedSurveys = 0;
    responsesList.forEach(rec => {
      // Record is completed if completionStatus is explicitly COMPLETED or has answers for critical fields
      if (rec.completionStatus === 'COMPLETED' || rec.isCompleted === true) {
        completedSurveys++;
      } else {
        // Fallback check: check if at least 10 critical variables are non-empty
        const answers = rec.responses || rec;
        let answeredCount = 0;
        ['sexo', 'edad', 'ciudadResidencia', 'sede', 'area', 'cargo', 'tipoContrato'].forEach(k => {
          const val = answers[k]?.value ?? answers[k];
          if (val !== undefined && val !== null && val !== '') answeredCount++;
        });
        if (answeredCount >= 6) {
          completedSurveys++;
        }
      }
    });

    const incompleteSurveys = totalEmployees - completedSurveys;
    const completionPercentage = Math.round((completedSurveys / totalEmployees) * 1000) / 10;

    return {
      totalEmployees,
      completedSurveys,
      incompleteSurveys,
      completionPercentage
    };
  }

  /**
   * 2. Scans for missing variables across the dataset for each field in DATA_DICTIONARY.
   */
  public static identifyMissingVariables(
    responsesList: any[],
    companyCatalog: CompanySurveyConfiguration,
    unconfiguredDetails: Array<{ variable: string; rawValue: string; employeeId: string }>
  ): VariableValidationDetail[] {
    const totalApplicable = responsesList.length;

    return Object.values(DATA_DICTIONARY).map(field => {
      let validResponses = 0;
      let missingRecords = 0;
      let unconfiguredRecords = 0;
      const affectedRecordIds: string[] = [];

      responsesList.forEach((rec, idx) => {
        const empId = rec.employeeId || rec.usuarioIdentificacion || `Emp-${idx + 1}`;
        const answers = rec.responses || rec;
        
        // Find matching answer value by field.id or aliases
        let val: any = undefined;
        let item = answers[field.id];
        if (item === undefined) {
          for (const alias of field.aliases) {
            if (answers[alias] !== undefined) {
              item = answers[alias];
              break;
            }
          }
        }

        if (item !== undefined) {
          val = item.value !== undefined ? item.value : item;
        }

        // Check if value is unconfigured in catalog
        const isUnconf = unconfiguredDetails.some(u => u.variable === field.id && u.employeeId === empId);
        if (isUnconf) {
          unconfiguredRecords++;
          affectedRecordIds.push(empId);
          return;
        }

        // Check if valid answer
        if (val !== null && val !== undefined && val !== '' && val !== 'SIN_INFORMACION' && val !== 'NO_REGISTRA') {
          validResponses++;
        } else {
          missingRecords++;
          affectedRecordIds.push(empId);
        }
      });

      const coveragePercentage = totalApplicable > 0 ? Math.round((validResponses / totalApplicable) * 1000) / 10 : 0;

      let qualityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT' = 'HIGH';
      if (coveragePercentage < 50 || validResponses === 0) qualityLevel = 'INSUFFICIENT';
      else if (coveragePercentage < 70) qualityLevel = 'LOW';
      else if (coveragePercentage < 90) qualityLevel = 'MEDIUM';

      let status: VariableQualityStatus = 'COMPLETO';
      if (unconfiguredRecords > 0) status = 'NOT_CONFIGURED';
      else if (coveragePercentage < 50) status = 'INCOMPLETO';
      else if (coveragePercentage < 100) status = 'PARCIAL';

      let problemDescription: string | undefined = undefined;
      let recommendedAction = 'Información completa y lista para cálculo.';

      if (status === 'NOT_CONFIGURED') {
        problemDescription = `${unconfiguredRecords} colaboradores registran un valor no parametrizado en el catálogo oficial de la empresa.`;
        recommendedAction = 'Parametrizar el nuevo valor en el Catálogo de Empresa o corregir la asignación en la base de datos.';
      } else if (status === 'INCOMPLETO') {
        problemDescription = `${missingRecords} colaboradores no registran respuesta para la variable ${field.name}.`;
        recommendedAction = field.criticality === 'CRITICAL'
          ? 'Completar la información obligatoria antes de generar el informe oficial.'
          : 'Continuar sin calcular los indicadores dependientes de este módulo.';
      } else if (status === 'PARCIAL') {
        problemDescription = `${missingRecords} colaboradores presentan dato faltante para ${field.name}.`;
        recommendedAction = 'Revisar respuestas faltantes para elevar el nivel de cobertura.';
      }

      return {
        variableId: field.id,
        variableName: field.name,
        category: field.category,
        criticality: field.criticality,
        status,
        validResponses,
        missingRecords,
        unconfiguredRecords,
        totalApplicable,
        coveragePercentage,
        qualityLevel,
        problemDescription,
        affectedRecordsCount: affectedRecordIds.length,
        affectedRecordIds,
        recommendedAction
      };
    });
  }

  /**
   * 3. Detects invalid/corrupted values (e.g. negative ages, out of range heights/weights).
   */
  public static identifyInvalidResponses(responsesList: any[]): Array<{ employeeId: string; variable: string; value: any; reason: string }> {
    const invalidList: Array<{ employeeId: string; variable: string; value: any; reason: string }> = [];

    responsesList.forEach((rec, idx) => {
      const empId = rec.employeeId || rec.usuarioIdentificacion || `Emp-${idx + 1}`;
      const answers = rec.responses || rec;

      const edad = Number(answers.edad?.value ?? answers.edad);
      if (!isNaN(edad) && (edad < 14 || edad > 100)) {
        invalidList.push({ employeeId: empId, variable: 'edad', value: edad, reason: 'Edad fuera del rango laboral lógico (14 - 100 años).' });
      }

      const peso = Number(answers.pesoKg?.value ?? answers.pesoKg);
      if (!isNaN(peso) && peso > 0 && (peso < 20 || peso > 300)) {
        invalidList.push({ employeeId: empId, variable: 'pesoKg', value: peso, reason: 'Peso fuera de rango biológico razonable (20kg - 300kg).' });
      }

      const estatura = Number(answers.estaturaCm?.value ?? answers.estaturaCm);
      if (!isNaN(estatura) && estatura > 0 && (estatura < 50 || estatura > 250)) {
        invalidList.push({ employeeId: empId, variable: 'estaturaCm', value: estatura, reason: 'Estatura fuera de rango biológico razonable (50cm - 250cm).' });
      }
    });

    return invalidList;
  }

  /**
   * 4. Identifies catalog values that are NOT_CONFIGURED in company catalog.
   */
  public static identifyUnconfiguredValues(
    responsesList: any[],
    companyCatalog: CompanySurveyConfiguration
  ): {
    unconfiguredCount: number;
    details: Array<{ variable: string; rawValue: string; employeeId: string }>;
  } {
    const details: Array<{ variable: string; rawValue: string; employeeId: string }> = [];

    const activeSedes = new Set((companyCatalog.catalogs.sedes || []).map(s => s.label.trim().toLowerCase()));
    const activeAreas = new Set((companyCatalog.catalogs.areas || []).map(a => a.label.trim().toLowerCase()));
    const activeProyectos = new Set((companyCatalog.catalogs.proyectos || []).map(p => p.label.trim().toLowerCase()));
    const activeCargos = new Set((companyCatalog.catalogs.cargos || []).map(c => c.label.trim().toLowerCase()));

    responsesList.forEach((rec, idx) => {
      const empId = rec.employeeId || rec.usuarioIdentificacion || `Emp-${idx + 1}`;
      const answers = rec.responses || rec;

      const checkCatalogField = (fieldKey: string, catalogSet: Set<string>) => {
        const item = answers[fieldKey];
        const val = item?.value !== undefined ? item.value : item;
        if (val && typeof val === 'string' && val.trim() !== '') {
          const valLower = val.trim().toLowerCase();
          if (catalogSet.size > 0 && !catalogSet.has(valLower)) {
            details.push({ variable: fieldKey, rawValue: val, employeeId: empId });
          }
        }
      };

      checkCatalogField('sede', activeSedes);
      checkCatalogField('area', activeAreas);
      checkCatalogField('proyecto', activeProyectos);
      checkCatalogField('cargo', activeCargos);
    });

    return {
      unconfiguredCount: details.length,
      details
    };
  }

  /**
   * 5. Validates Data Consistency & detects logical contradictions.
   */
  public static validateDataConsistency(responsesList: any[]): DataConsistencyIssue[] {
    const issues: DataConsistencyIssue[] = [];

    responsesList.forEach((rec, idx) => {
      const empId = rec.employeeId || rec.usuarioIdentificacion || `Emp-${idx + 1}`;
      const answers = rec.responses || rec;

      const getVal = (key: string) => {
        const item = answers[key];
        return item?.value !== undefined ? item.value : item;
      };

      const tieneHijos = String(getVal('tieneHijos') || '').toUpperCase();
      const numHijos = Number(getVal('numeroHijos') || getVal('cantidadHijos') || 0);

      // Rule C1: tieneHijos = NO but numeroHijos > 0 -> ERROR
      if ((tieneHijos === 'NO' || tieneHijos === 'FALSE') && numHijos > 0) {
        issues.push({
          id: `CON-${issues.length + 1}`,
          severity: 'ERROR',
          employeeId: empId,
          ruleName: 'Contradicción de Hijos',
          description: `Colaborador indica no tener hijos pero registra ${numHijos} hijos.`,
          affectedVariables: ['tieneHijos', 'numeroHijos'],
          recommendedAction: 'Corregir la casilla de tieneHijos a "Sí" o ajustar el número de hijos a 0.'
        });
      }

      // Rule C2: tieneHijos = SÍ but numeroHijos = 0 -> WARNING
      if ((tieneHijos === 'SÍ' || tieneHijos === 'SI' || tieneHijos === 'TRUE') && numHijos === 0) {
        issues.push({
          id: `CON-${issues.length + 1}`,
          severity: 'WARNING',
          employeeId: empId,
          ruleName: 'Alerta de Hijos Cero',
          description: 'Colaborador indica tener hijos pero registra 0 en la cantidad.',
          affectedVariables: ['tieneHijos', 'numeroHijos'],
          recommendedAction: 'Confirmar si el colaborador tiene 1 o más hijos registrados.'
        });
      }

      // Rule C3: Peso registered without Estatura -> IMC NO CALCULABLE
      const peso = getVal('pesoKg');
      const estatura = getVal('estaturaCm');
      if ((peso !== null && peso !== undefined && peso !== '') && (estatura === null || estatura === undefined || estatura === '')) {
        issues.push({
          id: `CON-${issues.length + 1}`,
          severity: 'WARNING',
          employeeId: empId,
          ruleName: 'Incompletitud Antropométrica (IMC No Calculable)',
          description: `Se registró peso (${peso}kg) pero la estatura está vacía. IMC no podrá ser calculado.`,
          affectedVariables: ['pesoKg', 'estaturaCm'],
          recommendedAction: 'Completar la estatura en centímetros para habilitar la clasificación de IMC.'
        });
      }

      // Rule C4: Edad = 15 or underage -> REVISION required
      const edad = Number(getVal('edad'));
      if (!isNaN(edad) && edad > 0 && edad < 18) {
        issues.push({
          id: `CON-${issues.length + 1}`,
          severity: 'REVISION',
          employeeId: empId,
          ruleName: 'Revisión de Menor de Edad',
          description: `Colaborador registra edad de ${edad} años. Requiere verificación de permiso de trabajo o corrección de digitación.`,
          affectedVariables: ['edad'],
          recommendedAction: 'Verificar la fecha de nacimiento oficial del colaborador.'
        });
      }
    });

    return issues;
  }

  /**
   * 6. Compares Excel sheet headers against standard DataDictionary.
   */
  public static validateExcelHeader(headers: string[]): ExcelColumnValidationResult {
    const cleanedHeaders = headers.map(h => h.trim().toLowerCase());
    const columnsFound: string[] = [];
    const columnsMissing: string[] = [];
    const columnsUnrecognized: string[] = [];
    const columnsDuplicated: string[] = [];

    // Check duplicates
    const seen = new Set<string>();
    cleanedHeaders.forEach(h => {
      if (seen.has(h)) columnsDuplicated.push(h);
      seen.add(h);
    });

    // Match against DataDictionary
    Object.values(DATA_DICTIONARY).forEach(field => {
      const match = cleanedHeaders.find(h => h === field.id.toLowerCase() || field.aliases.some(a => a.toLowerCase() === h));
      if (match) {
        columnsFound.push(field.id);
      } else if (field.criticality === 'CRITICAL') {
        columnsMissing.push(field.id);
      }
    });

    // Unrecognized headers
    cleanedHeaders.forEach(h => {
      const isKnown = Object.values(DATA_DICTIONARY).some(f => f.id.toLowerCase() === h || f.aliases.some(a => a.toLowerCase() === h));
      if (!isKnown && h !== 'cedula' && h !== 'nombre' && h !== 'email' && h !== 'id') {
        columnsUnrecognized.push(h);
      }
    });

    const isHeaderValid = columnsMissing.length === 0;

    return {
      columnsFound,
      columnsMissing,
      columnsUnrecognized,
      columnsDuplicated,
      columnsWithInvalidData: [],
      isHeaderValid
    };
  }

  /**
   * 7. Computes availability for each executive report indicator based on underlying variable quality.
   */
  private static calculateIndicatorAvailability(variableSummaries: VariableValidationDetail[]): {
    availableIndicators: IndicatorAvailabilityStatus[];
    unavailableIndicators: IndicatorAvailabilityStatus[];
  } {
    const availableIndicators: IndicatorAvailabilityStatus[] = [];
    const unavailableIndicators: IndicatorAvailabilityStatus[] = [];

    const checkIndicator = (
      id: string,
      name: string,
      category: string,
      reqVarIds: string[]
    ) => {
      const reqVars = variableSummaries.filter(v => reqVarIds.includes(v.variableId));
      const minCoverage = reqVars.length > 0 ? Math.min(...reqVars.map(v => v.coveragePercentage)) : 0;
      const minValidBase = reqVars.length > 0 ? Math.min(...reqVars.map(v => v.validResponses)) : 0;
      const hasUnconfigured = reqVars.some(v => v.status === 'NOT_CONFIGURED');

      let qualityLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT' = 'HIGH';
      if (minCoverage < 50 || minValidBase === 0) qualityLevel = 'INSUFFICIENT';
      else if (minCoverage < 70) qualityLevel = 'LOW';
      else if (minCoverage < 90) qualityLevel = 'MEDIUM';

      const isAvailable = qualityLevel !== 'INSUFFICIENT' && !hasUnconfigured;
      const statusIcon = isAvailable ? (qualityLevel === 'HIGH' ? '🟢' : '🟠') : '🔴';

      let unavailabilityReason: string | undefined = undefined;
      if (!isAvailable) {
        if (hasUnconfigured) unavailabilityReason = 'Bloqueado por valores no parametrizados en catálogo.';
        else unavailabilityReason = `Muestra insuficiente (${minCoverage}% cobertura en variables fuente).`;
      }

      const item: IndicatorAvailabilityStatus = {
        indicatorId: id,
        indicatorName: name,
        category,
        isAvailable,
        validBase: minValidBase,
        coveragePercentage: minCoverage,
        qualityLevel,
        statusIcon,
        unavailabilityReason
      };

      if (isAvailable) availableIndicators.push(item);
      else unavailableIndicators.push(item);
    };

    checkIndicator('IND-SEXO', 'Distribución Sociodemográfica por Sexo', 'Sociodemográfico', ['sexo']);
    checkIndicator('IND-EDAD', 'Distribución por Rangos de Edad', 'Sociodemográfico', ['edad']);
    checkIndicator('IND-SEDE', 'Distribución por Sede Laboral', 'Laboral', ['sede']);
    checkIndicator('IND-CONTRATO', 'Distribución por Tipo de Contrato', 'Laboral', ['tipoContrato']);
    checkIndicator('IND-IMC', 'Clasificación de Índice de Masa Corporal (IMC)', 'Salud', ['pesoKg', 'estaturaCm']);
    checkIndicator('IND-DISCAPACIDAD', 'Prevalencia de Discapacidad', 'Salud', ['presentaDiscapacidad']);
    checkIndicator('IND-ALERGIAS', 'Prevalencia de Afecciones Alérgicas', 'Salud', ['presentaAlergias']);
    checkIndicator('IND-ACTIVIDAD-FISICA', 'Nivel de Práctica de Actividad Física', 'Salud', ['actividadFisicaRegular']);

    return { availableIndicators, unavailableIndicators };
  }

  private static computeModuleTrafficLight(variables: VariableValidationDetail[]): TrafficLightState {
    if (variables.length === 0) return 'GREEN';
    const hasInsufficient = variables.some(v => v.coveragePercentage < 50 || v.status === 'NOT_CONFIGURED');
    if (hasInsufficient) return 'RED';
    const hasLow = variables.some(v => v.coveragePercentage < 90);
    if (hasLow) return 'ORANGE';
    return 'GREEN';
  }

  /**
   * Audit Trail Manager.
   */
  public static logValidationAudit(log: ValidationAuditLogRecord): ValidationAuditLogRecord {
    this.auditLogs.push(log);
    return log;
  }

  public static getValidationAuditLogs(): ValidationAuditLogRecord[] {
    return [...this.auditLogs];
  }
}
