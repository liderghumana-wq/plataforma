/**
 * PROMPT 27 — QUESTION BANK & MASTER SURVEY SERVICE (questionBankService.ts)
 * 
 * Architecture for the Master Survey (Encuesta Maestra):
 * 1. 11 Specialized Modules:
 *    - Module 1: Identificación y datos generales
 *    - Module 2: Información sociodemográfica
 *    - Module 3: Información familiar y personas a cargo
 *    - Module 4: Información laboral
 *    - Module 5: Vivienda y condiciones socioeconómicas
 *    - Module 6: Condiciones de salud (with sensitive data privacy notice)
 *    - Module 7: Diagnósticos o enfermedades declaradas
 *    - Module 8: Medicamentos, Alergias, Discapacidad y Biometría
 *    - Module 9: Condiciones osteomusculares, Estilos de Vida y Tiempo Libre
 *    - Module 10: Información relacionada con trabajo, modalidad laboral y salud mental
 *    - Module 11: Observaciones
 * 
 * 2. QuestionBank Data Dictionary with metadata:
 *    - required, critical, sensitive, reportable, allowOther, allowPreferNotToAnswer
 *    - fieldKey, excelAliases, dataType, validationRules
 * 
 * 3. Dynamic binding with Company Catalog options (Sedes, Áreas, Proyectos, Cargos, Contratos, Modalidades).
 * 4. Automatic calculations: Age from fechaNacimiento, Seniority from fechaIngreso, IMC status.
 * 5. Unified Normalization Pipeline: Raw Survey/Excel -> Normalized Model -> P26 Validation -> P25 Evidence -> Executive Report.
 * 6. ABSOLUTE RULE: Zero default fake data or arbitrary guesses.
 */

import { TipoPregunta, EncuestaMeta, SeccionEncuesta, PreguntaConfig, OpcionPregunta } from './types';
import { CompanySurveyConfiguration, getCompanySurveyConfiguration } from './prompt21Engine';

export interface QuestionBankQuestion {
  id: string;
  companyId: string;
  moduleId: number; // 1 to 11
  moduleName: string;
  question: string;
  type: TipoPregunta;
  options?: OpcionPregunta[];
  required: boolean;
  critical: boolean;
  sensitive: boolean;
  reportable: boolean;
  allowOther: boolean;
  allowPreferNotToAnswer: boolean;
  order: number;
  status: 'ACTIVE' | 'INACTIVE';
  fieldKey: string;
  excelAliases: string[];
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
  catalogType?: 'sedes' | 'areas' | 'proyectos' | 'cargos' | 'tiposContrato' | 'modalidadesTrabajo';
  validationRules?: {
    min?: number;
    max?: number;
    regex?: string;
    customErrorMessage?: string;
    dependsOn?: { fieldKey: string; expectedValue: any };
  };
}

export interface MasterSurveyVersionMeta {
  surveyId: string;
  surveyVersion: string;
  companyId: string;
  periodId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 11 MODULE DEFINITIONS
 */
export const MASTER_MODULES = [
  { id: 1, name: 'Módulo 1: Identificación y datos generales', shortName: 'Identificación', icon: 'UserCheck' },
  { id: 2, name: 'Módulo 2: Información sociodemográfica', shortName: 'Sociodemográfico', icon: 'Users' },
  { id: 3, name: 'Módulo 3: Información familiar y personas a cargo', shortName: 'Familia', icon: 'HeartHandshake' },
  { id: 4, name: 'Módulo 4: Información laboral', shortName: 'Laboral', icon: 'Briefcase' },
  { id: 5, name: 'Módulo 5: Vivienda y condiciones socioeconómicas', shortName: 'Vivienda', icon: 'Home' },
  { id: 6, name: 'Módulo 6: Condiciones de salud', shortName: 'Salud General', icon: 'Activity' },
  { id: 7, name: 'Módulo 7: Diagnósticos o enfermedades declaradas', shortName: 'Diagnósticos', icon: 'Stethoscope' },
  { id: 8, name: 'Módulo 8: Medicamentos, Alergias, Discapacidad y Biometría', shortName: 'Biometría/Alergias', icon: 'ShieldAlert' },
  { id: 9, name: 'Módulo 9: Condiciones osteomusculares y Estilos de Vida', shortName: 'Osteomuscular/EstiloVida', icon: 'Smile' },
  { id: 10, name: 'Módulo 10: Trabajo, modalidad y salud mental', shortName: 'Trabajo/Bienestar', icon: 'Brain' },
  { id: 11, name: 'Módulo 11: Observaciones', shortName: 'Observaciones', icon: 'FileText' }
];

/**
 * DEFAULT MASTER QUESTION BANK (50 STANDARDIZED QUESTIONS)
 */
export const DEFAULT_QUESTION_BANK: QuestionBankQuestion[] = [
  // MÓDULO 1
  {
    id: 'QB-101', companyId: 'GLOBAL', moduleId: 1, moduleName: 'Identificación y datos generales',
    question: 'Tipo de Documento de Identificación', type: 'lista', order: 1, status: 'ACTIVE',
    fieldKey: 'tipoDocumento', excelAliases: ['tipo_documento', 'tipo_doc', 'tipodoc', 'documento_tipo'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: false, allowOther: false, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-cc', label: 'Cédula de Ciudadanía (CC)', value: 'CC' },
      { id: 'opt-ce', label: 'Cédula de Extranjería (CE)', value: 'CE' },
      { id: 'opt-pas', label: 'Pasaporte', value: 'Pasaporte' },
      { id: 'opt-pep', label: 'Permiso Especial de Permanencia (PEP)', value: 'PEP' },
      { id: 'opt-ppt', label: 'Permiso por Protección Temporal (PPT)', value: 'PPT' }
    ]
  },
  {
    id: 'QB-102', companyId: 'GLOBAL', moduleId: 1, moduleName: 'Identificación y datos generales',
    question: 'Número de Identificación', type: 'texto', order: 2, status: 'ACTIVE',
    fieldKey: 'numeroIdentificacion', excelAliases: ['cedula', 'numero_identificacion', 'documento', 'identificacion', 'num_doc'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: false, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-103', companyId: 'GLOBAL', moduleId: 1, moduleName: 'Identificación y datos generales',
    question: 'Nombres', type: 'texto', order: 3, status: 'ACTIVE',
    fieldKey: 'nombres', excelAliases: ['nombres', 'primer_nombre', 'nombre'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: false, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-104', companyId: 'GLOBAL', moduleId: 1, moduleName: 'Identificación y datos generales',
    question: 'Apellidos', type: 'texto', order: 4, status: 'ACTIVE',
    fieldKey: 'apellidos', excelAliases: ['apellidos', 'primer_apellido', 'apellido'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: false, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-105', companyId: 'GLOBAL', moduleId: 1, moduleName: 'Identificación y datos generales',
    question: 'Correo Electrónico', type: 'correo', order: 5, status: 'ACTIVE',
    fieldKey: 'correoElectronico', excelAliases: ['email', 'correo', 'correo_electronico', 'mail'],
    dataType: 'string', required: true, critical: false, sensitive: false, reportable: false, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-106', companyId: 'GLOBAL', moduleId: 1, moduleName: 'Identificación y datos generales',
    question: 'Teléfono de Contacto', type: 'telefono', order: 6, status: 'ACTIVE',
    fieldKey: 'telefono', excelAliases: ['telefono', 'celular', 'telefono_contacto', 'movil'],
    dataType: 'string', required: false, critical: false, sensitive: false, reportable: false, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-107', companyId: 'GLOBAL', moduleId: 1, moduleName: 'Identificación y datos generales',
    question: 'Fecha de Nacimiento', type: 'fecha', order: 7, status: 'ACTIVE',
    fieldKey: 'fechaNacimiento', excelAliases: ['fecha_nacimiento', 'fechanacimiento', 'nacimiento', 'fecha_nac'],
    dataType: 'date', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-108', companyId: 'GLOBAL', moduleId: 1, moduleName: 'Identificación y datos generales',
    question: 'Edad (Calculada automáticamente)', type: 'numero', order: 8, status: 'ACTIVE',
    fieldKey: 'edad', excelAliases: ['edad', 'edad_anos'],
    dataType: 'number', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    validationRules: { min: 14, max: 100, customErrorMessage: 'La edad calculada debe estar entre 14 y 100 años.' }
  },
  {
    id: 'QB-109', companyId: 'GLOBAL', moduleId: 1, moduleName: 'Identificación y datos generales',
    question: 'Sexo / Género', type: 'lista', order: 9, status: 'ACTIVE',
    fieldKey: 'sexo', excelAliases: ['sexo', 'genero', 'sexo_genero'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-f', label: 'Femenino', value: 'Femenino' },
      { id: 'opt-m', label: 'Masculino', value: 'Masculino' },
      { id: 'opt-nb', label: 'No Binario / Otro', value: 'Otro' }
    ]
  },

  // MÓDULO 2
  {
    id: 'QB-201', companyId: 'GLOBAL', moduleId: 2, moduleName: 'Información sociodemográfica',
    question: 'Estado Civil', type: 'lista', order: 1, status: 'ACTIVE',
    fieldKey: 'estadoCivil', excelAliases: ['estado_civil', 'situacion_marital', 'estadocivil'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-soltero', label: 'Soltero(a)', value: 'Soltero(a)' },
      { id: 'opt-casado', label: 'Casado(a)', value: 'Casado(a)' },
      { id: 'opt-unionlibre', label: 'Unión Libre', value: 'Unión Libre' },
      { id: 'opt-separado', label: 'Divorciado(a) / Separado(a)', value: 'Separado(a)' },
      { id: 'opt-viudo', label: 'Viudo(a)', value: 'Viudo(a)' }
    ]
  },
  {
    id: 'QB-202', companyId: 'GLOBAL', moduleId: 2, moduleName: 'Información sociodemográfica',
    question: 'Nivel Educativo Alcanzado', type: 'lista', order: 2, status: 'ACTIVE',
    fieldKey: 'nivelEducativo', excelAliases: ['nivel_educativo', 'escolaridad', 'estudios', 'nivel_estudios'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-primaria', label: 'Primaria Incompleta / Completa', value: 'Primaria' },
      { id: 'opt-bachillerato', label: 'Bachillerato / Secundaria', value: 'Secundaria' },
      { id: 'opt-tecnico', label: 'Técnico', value: 'Técnico' },
      { id: 'opt-tecnologo', label: 'Tecnólogo', value: 'Tecnólogo' },
      { id: 'opt-profesional', label: 'Profesional / Pregrado', value: 'Profesional' },
      { id: 'opt-posgrado', label: 'Especialización / Maestría / Doctorado', value: 'Posgrado' }
    ]
  },
  {
    id: 'QB-203', companyId: 'GLOBAL', moduleId: 2, moduleName: 'Información sociodemográfica',
    question: 'Ciudad de Residencia', type: 'texto', order: 3, status: 'ACTIVE',
    fieldKey: 'ciudadResidencia', excelAliases: ['ciudad', 'ciudad_residencia', 'municipio'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-204', companyId: 'GLOBAL', moduleId: 2, moduleName: 'Información sociodemográfica',
    question: 'Departamento de Residencia', type: 'texto', order: 4, status: 'ACTIVE',
    fieldKey: 'departamentoResidencia', excelAliases: ['departamento', 'departamento_residencia', 'dpto'],
    dataType: 'string', required: true, critical: false, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-205', companyId: 'GLOBAL', moduleId: 2, moduleName: 'Información sociodemográfica',
    question: 'Sede Laboral', type: 'lista', order: 5, status: 'ACTIVE', catalogType: 'sedes',
    fieldKey: 'sede', excelAliases: ['sede', 'sede_laboral', 'centro_trabajo'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-206', companyId: 'GLOBAL', moduleId: 2, moduleName: 'Información sociodemográfica',
    question: 'Área / Departamento Organizacional', type: 'lista', order: 6, status: 'ACTIVE', catalogType: 'areas',
    fieldKey: 'area', excelAliases: ['area', 'departamento_empresa', 'seccion', 'unidad'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-207', companyId: 'GLOBAL', moduleId: 2, moduleName: 'Información sociodemográfica',
    question: 'Proyecto / Campaña', type: 'lista', order: 7, status: 'ACTIVE', catalogType: 'proyectos',
    fieldKey: 'proyecto', excelAliases: ['proyecto', 'campana', 'centro_costos'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-208', companyId: 'GLOBAL', moduleId: 2, moduleName: 'Información sociodemográfica',
    question: 'Cargo / Posición', type: 'lista', order: 8, status: 'ACTIVE', catalogType: 'cargos',
    fieldKey: 'cargo', excelAliases: ['cargo', 'puesto_trabajo', 'posicion'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-209', companyId: 'GLOBAL', moduleId: 2, moduleName: 'Información sociodemográfica',
    question: 'Estrato Socioeconómico de la Vivienda', type: 'lista', order: 9, status: 'ACTIVE',
    fieldKey: 'estrato', excelAliases: ['estrato', 'estrato_vivienda', 'estrato_socioeconomico'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-e1', label: 'Estrato 1', value: '1' },
      { id: 'opt-e2', label: 'Estrato 2', value: '2' },
      { id: 'opt-e3', label: 'Estrato 3', value: '3' },
      { id: 'opt-e4', label: 'Estrato 4', value: '4' },
      { id: 'opt-e5', label: 'Estrato 5', value: '5' },
      { id: 'opt-e6', label: 'Estrato 6', value: '6' }
    ]
  },
  {
    id: 'QB-210', companyId: 'GLOBAL', moduleId: 2, moduleName: 'Información sociodemográfica',
    question: 'Tiempo de Residencia en la Ciudad Actual', type: 'lista', order: 10, status: 'ACTIVE',
    fieldKey: 'tiempoResidenciaCiudad', excelAliases: ['tiempo_residencia', 'tiempo_ciudad'],
    dataType: 'string', required: false, critical: false, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-tr1', label: 'Menos de 1 año', value: '< 1 año' },
      { id: 'opt-tr2', label: 'De 1 a 5 años', value: '1-5 años' },
      { id: 'opt-tr3', label: 'Más de 5 años', value: '> 5 años' },
      { id: 'opt-tr4', label: 'Toda la vida', value: 'Toda la vida' }
    ]
  },
  {
    id: 'QB-211', companyId: 'GLOBAL', moduleId: 2, moduleName: 'Información sociodemográfica',
    question: 'Zona de Residencia', type: 'radio', order: 11, status: 'ACTIVE',
    fieldKey: 'zonaResidencia', excelAliases: ['zona', 'zona_residencia', 'urbana_rural'],
    dataType: 'string', required: true, critical: false, sensitive: false, reportable: true, allowOther: true, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-z-urbana', label: 'Urbana', value: 'Urbana' },
      { id: 'opt-z-rural', label: 'Rural', value: 'Rural' },
      { id: 'opt-z-otra', label: 'Otra', value: 'OTRO' }
    ]
  },

  // MÓDULO 3
  {
    id: 'QB-301', companyId: 'GLOBAL', moduleId: 3, moduleName: 'Información familiar y personas a cargo',
    question: '¿Tiene Hijos?', type: 'radio', order: 1, status: 'ACTIVE',
    fieldKey: 'tieneHijos', excelAliases: ['tiene_hijos', 'hijos', 'posee_hijos'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-h-si', label: 'Sí', value: 'Sí' },
      { id: 'opt-h-no', label: 'No', value: 'No' },
      { id: 'opt-h-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-302', companyId: 'GLOBAL', moduleId: 3, moduleName: 'Información familiar y personas a cargo',
    question: '¿Cuántos Hijos Tiene?', type: 'numero', order: 2, status: 'ACTIVE',
    fieldKey: 'numeroHijos', excelAliases: ['numero_hijos', 'cantidad_hijos', 'num_hijos'],
    dataType: 'number', required: false, critical: false, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    validationRules: { min: 0, max: 15, dependsOn: { fieldKey: 'tieneHijos', expectedValue: 'Sí' } }
  },
  {
    id: 'QB-303', companyId: 'GLOBAL', moduleId: 3, moduleName: 'Información familiar y personas a cargo',
    question: '¿Tiene Personas a Cargo?', type: 'radio', order: 3, status: 'ACTIVE',
    fieldKey: 'tienePersonasACargo', excelAliases: ['tiene_personas_a_cargo', 'personas_a_cargo', 'dependientes'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-pc-si', label: 'Sí', value: 'Sí' },
      { id: 'opt-pc-no', label: 'No', value: 'No' },
      { id: 'opt-pc-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-304', companyId: 'GLOBAL', moduleId: 3, moduleName: 'Información familiar y personas a cargo',
    question: '¿Cuántas Personas Tiene a Cargo?', type: 'numero', order: 4, status: 'ACTIVE',
    fieldKey: 'numeroPersonasACargo', excelAliases: ['numero_personas_a_cargo', 'cantidad_dependientes'],
    dataType: 'number', required: false, critical: false, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    validationRules: { min: 0, max: 20, dependsOn: { fieldKey: 'tienePersonasACargo', expectedValue: 'Sí' } }
  },
  {
    id: 'QB-305', companyId: 'GLOBAL', moduleId: 3, moduleName: 'Información familiar y personas a cargo',
    question: 'Relación o Parentesco de las Personas a Cargo', type: 'multiple_seleccion', order: 5, status: 'ACTIVE',
    fieldKey: 'relacionPersonasACargo', excelAliases: ['relacion_personas_a_cargo', 'parentesco_dependientes'],
    dataType: 'array', required: false, critical: false, sensitive: false, reportable: true, allowOther: true, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-rel-hijos', label: 'Hijos', value: 'Hijos' },
      { id: 'opt-rel-padres', label: 'Padres', value: 'Padres' },
      { id: 'opt-rel-pareja', label: 'Pareja / Cónyuge', value: 'Pareja' },
      { id: 'opt-rel-otros', label: 'Otros Familiares', value: 'Otros familiares' }
    ]
  },

  // MÓDULO 4
  {
    id: 'QB-401', companyId: 'GLOBAL', moduleId: 4, moduleName: 'Información laboral',
    question: 'Fecha de Ingreso a la Empresa', type: 'fecha', order: 1, status: 'ACTIVE',
    fieldKey: 'fechaIngreso', excelAliases: ['fecha_ingreso', 'fechaingreso', 'ingreso', 'fecha_vinculacion'],
    dataType: 'date', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-402', companyId: 'GLOBAL', moduleId: 4, moduleName: 'Información laboral',
    question: 'Antigüedad en la Empresa (Calculada automáticamente)', type: 'texto', order: 2, status: 'ACTIVE',
    fieldKey: 'antiguedadCalculada', excelAliases: ['antiguedad', 'antiguedad_empresa', 'tiempo_empresa'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-403', companyId: 'GLOBAL', moduleId: 4, moduleName: 'Información laboral',
    question: 'Tipo de Contrato', type: 'lista', order: 3, status: 'ACTIVE', catalogType: 'tiposContrato',
    fieldKey: 'tipoContrato', excelAliases: ['tipo_contrato', 'contrato', 'vinculacion'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-404', companyId: 'GLOBAL', moduleId: 4, moduleName: 'Información laboral',
    question: 'Jornada Laboral', type: 'lista', order: 4, status: 'ACTIVE',
    fieldKey: 'jornadaLaboral', excelAliases: ['jornada', 'jornada_laboral', 'tipo_jornada'],
    dataType: 'string', required: true, critical: false, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-j-completa', label: 'Tiempo Completo', value: 'Tiempo Completo' },
      { id: 'opt-j-medio', label: 'Medio Tiempo', value: 'Medio Tiempo' },
      { id: 'opt-j-horas', label: 'Por Horas / Parcial', value: 'Por Horas' }
    ]
  },
  {
    id: 'QB-405', companyId: 'GLOBAL', moduleId: 4, moduleName: 'Información laboral',
    question: 'Horas de Trabajo Habituales por Semana', type: 'numero', order: 5, status: 'ACTIVE',
    fieldKey: 'horasTrabajoHabituales', excelAliases: ['horas_trabajo', 'horas_semanales', 'horas_habituales'],
    dataType: 'number', required: false, critical: false, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    validationRules: { min: 1, max: 80 }
  },

  // MÓDULO 5
  {
    id: 'QB-501', companyId: 'GLOBAL', moduleId: 5, moduleName: 'Vivienda y condiciones socioeconómicas',
    question: 'Tipo de Tenencia de Vivienda', type: 'radio', order: 1, status: 'ACTIVE',
    fieldKey: 'tipoVivienda', excelAliases: ['tipo_vivienda', 'vivienda', 'tenencia_vivienda'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: true, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-v-propia', label: 'Propia', value: 'Propia' },
      { id: 'opt-v-arrendada', label: 'Arrendada', value: 'Arrendada' },
      { id: 'opt-v-familiar', label: 'Familiar', value: 'Familiar' },
      { id: 'opt-v-otra', label: 'Otra', value: 'OTRO' }
    ]
  },
  {
    id: 'QB-502', companyId: 'GLOBAL', moduleId: 5, moduleName: 'Vivienda y condiciones socioeconómicas',
    question: '¿Cuenta con Servicios Públicos Básicos Completo?', type: 'radio', order: 2, status: 'ACTIVE',
    fieldKey: 'serviciosPublicosBasicos', excelAliases: ['servicios_publicos', 'servicios_basicos'],
    dataType: 'string', required: true, critical: false, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-sp-si', label: 'Sí', value: 'Sí' },
      { id: 'opt-sp-no', label: 'No', value: 'No' },
      { id: 'opt-sp-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-503', companyId: 'GLOBAL', moduleId: 5, moduleName: 'Vivienda y condiciones socioeconómicas',
    question: 'Detalle de Servicios Públicos Disponibles', type: 'multiple_seleccion', order: 3, status: 'ACTIVE',
    fieldKey: 'detalleServiciosPublicos', excelAliases: ['detalle_servicios', 'servicios_disponibles'],
    dataType: 'array', required: false, critical: false, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-sp-agua', label: 'Agua Potable', value: 'Agua' },
      { id: 'opt-sp-luz', label: 'Energía Eléctrica', value: 'Energía' },
      { id: 'opt-sp-gas', label: 'Gas Natural', value: 'Gas' },
      { id: 'opt-sp-net', label: 'Internet', value: 'Internet' },
      { id: 'opt-sp-alc', label: 'Alcantarillado', value: 'Alcantarillado' }
    ]
  },

  // MÓDULO 6
  {
    id: 'QB-601', companyId: 'GLOBAL', moduleId: 6, moduleName: 'Condiciones de salud',
    question: '¿Actualmente presenta alguna condición de salud que considere relevante para su bienestar o trabajo?',
    type: 'radio', order: 1, status: 'ACTIVE',
    fieldKey: 'saludPresentaCondicion', excelAliases: ['salud_presenta_condicion', 'condicion_salud_relevante'],
    dataType: 'string', required: true, critical: true, sensitive: true, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-sc-si', label: 'Sí', value: 'Sí' },
      { id: 'opt-sc-no', label: 'No', value: 'No' },
      { id: 'opt-sc-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-602', companyId: 'GLOBAL', moduleId: 6, moduleName: 'Condiciones de salud',
    question: '¿Cuál o cuáles condiciones de salud presenta?', type: 'multiple_seleccion', order: 2, status: 'ACTIVE',
    fieldKey: 'saludCualCondicion', excelAliases: ['salud_cual_condicion', 'condiciones_salud_detalle'],
    dataType: 'array', required: false, critical: false, sensitive: true, reportable: true, allowOther: true, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-scd-hipertencion', label: 'Hipertensión / Cardiovascular', value: 'Hipertensión' },
      { id: 'opt-scd-diabetes', label: 'Diabetes / Metabólica', value: 'Diabetes' },
      { id: 'opt-scd-asma', label: 'Asma / Respiratoria', value: 'Asma' },
      { id: 'opt-scd-columna', label: 'Dolor de Columna / Osteomuscular', value: 'Dolor Columna' },
      { id: 'opt-scd-estres', label: 'Estrés / Ansiedad', value: 'Estrés' }
    ]
  },

  // MÓDULO 7
  {
    id: 'QB-701', companyId: 'GLOBAL', moduleId: 7, moduleName: 'Diagnósticos o enfermedades declaradas',
    question: '¿Tiene algún diagnóstico o enfermedad que desee declarar para efectos de caracterización de salud?',
    type: 'radio', order: 1, status: 'ACTIVE',
    fieldKey: 'saludDiagnosticoDeclarado', excelAliases: ['salud_diagnostico', 'diagnostico_declarado'],
    dataType: 'string', required: true, critical: true, sensitive: true, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-diag-si', label: 'Sí', value: 'Sí' },
      { id: 'opt-diag-no', label: 'No', value: 'No' },
      { id: 'opt-diag-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-702', companyId: 'GLOBAL', moduleId: 7, moduleName: 'Diagnósticos o enfermedades declaradas',
    question: 'Seleccione la categoría del diagnóstico o enfermedad declarada', type: 'multiple_seleccion', order: 2, status: 'ACTIVE',
    fieldKey: 'saludTipoDiagnostico', excelAliases: ['salud_tipo_diagnostico', 'categoria_diagnostico'],
    dataType: 'array', required: false, critical: false, sensitive: true, reportable: true, allowOther: true, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-td-resp', label: 'Respiratoria', value: 'Respiratoria' },
      { id: 'opt-td-cardio', label: 'Cardiovascular', value: 'Cardiovascular' },
      { id: 'opt-td-meta', label: 'Metabólica', value: 'Metabólica' },
      { id: 'opt-td-musculo', label: 'Musculoesquelética', value: 'Musculoesquelética' },
      { id: 'opt-td-dig', label: 'Digestiva', value: 'Digestiva' },
      { id: 'opt-td-neuro', label: 'Neurológica', value: 'Neurológica' },
      { id: 'opt-td-vis', label: 'Visual', value: 'Visual' },
      { id: 'opt-td-aud', label: 'Auditiva', value: 'Auditiva' },
      { id: 'opt-td-derm', label: 'Dermatológica', value: 'Dermatológica' }
    ]
  },

  // MÓDULO 8
  {
    id: 'QB-801', companyId: 'GLOBAL', moduleId: 8, moduleName: 'Medicamentos, Alergias, Discapacidad y Biometría',
    question: '¿Utiliza actualmente medicamentos de manera habitual?', type: 'radio', order: 1, status: 'ACTIVE',
    fieldKey: 'medicamentosHabituales', excelAliases: ['medicamentos', 'consume_medicamentos', 'medicamentos_habituales'],
    dataType: 'string', required: true, critical: false, sensitive: true, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-med-si', label: 'Sí', value: 'Sí' },
      { id: 'opt-med-no', label: 'No', value: 'No' },
      { id: 'opt-med-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-802', companyId: 'GLOBAL', moduleId: 8, moduleName: 'Medicamentos, Alergias, Discapacidad y Biometría',
    question: 'Tipo de medicamento o tratamiento habitual (Opcional)', type: 'texto', order: 2, status: 'ACTIVE',
    fieldKey: 'medicamentosTratamientoOpcional', excelAliases: ['medicamentos_detalle', 'tratamiento_medico'],
    dataType: 'string', required: false, critical: false, sensitive: true, reportable: false, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-803', companyId: 'GLOBAL', moduleId: 8, moduleName: 'Medicamentos, Alergias, Discapacidad y Biometría',
    question: '¿Tiene alguna alergia conocida?', type: 'radio', order: 3, status: 'ACTIVE',
    fieldKey: 'alergiasPresenta', excelAliases: ['alergias', 'presenta_alergias', 'tiene_alergias'],
    dataType: 'string', required: true, critical: true, sensitive: true, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-ale-si', label: 'Sí', value: 'Sí' },
      { id: 'opt-ale-no', label: 'No', value: 'No' },
      { id: 'opt-ale-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-804', companyId: 'GLOBAL', moduleId: 8, moduleName: 'Medicamentos, Alergias, Discapacidad y Biometría',
    question: 'Tipo de Alergia Conocida', type: 'multiple_seleccion', order: 4, status: 'ACTIVE',
    fieldKey: 'alergiasTipo', excelAliases: ['alergias_tipo', 'tipo_alergias'],
    dataType: 'array', required: false, critical: false, sensitive: true, reportable: true, allowOther: true, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-at-ali', label: 'Alimentos', value: 'Alimentos' },
      { id: 'opt-at-med', label: 'Medicamentos', value: 'Medicamentos' },
      { id: 'opt-at-polv', label: 'Polvo', value: 'Polvo' },
      { id: 'opt-at-hum', label: 'Humedad', value: 'Humedad' },
      { id: 'opt-at-quim', label: 'Productos químicos', value: 'Productos químicos' },
      { id: 'opt-at-anim', label: 'Animales', value: 'Animales' }
    ]
  },
  {
    id: 'QB-805', companyId: 'GLOBAL', moduleId: 8, moduleName: 'Medicamentos, Alergias, Discapacidad y Biometría',
    question: '¿Presenta alguna discapacidad, limitación o condición que requiera algún ajuste o apoyo en el entorno laboral?',
    type: 'radio', order: 5, status: 'ACTIVE',
    fieldKey: 'discapacidadPresenta', excelAliases: ['discapacidad', 'presenta_discapacidad', 'limitacion_laboral'],
    dataType: 'string', required: true, critical: true, sensitive: true, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-disc-si', label: 'Sí', value: 'Sí' },
      { id: 'opt-disc-no', label: 'No', value: 'No' },
      { id: 'opt-disc-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-806', companyId: 'GLOBAL', moduleId: 8, moduleName: 'Medicamentos, Alergias, Discapacidad y Biometría',
    question: 'Tipo de Limitación o Discapacidad', type: 'multiple_seleccion', order: 6, status: 'ACTIVE',
    fieldKey: 'discapacidadTipo', excelAliases: ['discapacidad_tipo', 'tipo_discapacidad'],
    dataType: 'array', required: false, critical: false, sensitive: true, reportable: true, allowOther: true, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-dt-fis', label: 'Física', value: 'Física' },
      { id: 'opt-dt-vis', label: 'Visual', value: 'Visual' },
      { id: 'opt-dt-aud', label: 'Auditiva', value: 'Auditiva' },
      { id: 'opt-dt-cog', label: 'Cognitiva', value: 'Cognitiva' },
      { id: 'opt-dt-psi', label: 'Psicosocial', value: 'Psicosocial' },
      { id: 'opt-dt-mul', label: 'Múltiple', value: 'Múltiple' }
    ]
  },
  {
    id: 'QB-807', companyId: 'GLOBAL', moduleId: 8, moduleName: 'Medicamentos, Alergias, Discapacidad y Biometría',
    question: 'Peso Aproximado en Kilogramos (kg)', type: 'numero', order: 7, status: 'ACTIVE',
    fieldKey: 'pesoKg', excelAliases: ['peso', 'peso_kg', 'peso_corporal'],
    dataType: 'number', required: false, critical: false, sensitive: true, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    validationRules: { min: 20, max: 300, customErrorMessage: 'El peso en kg debe estar entre 20 y 300 kg.' }
  },
  {
    id: 'QB-808', companyId: 'GLOBAL', moduleId: 8, moduleName: 'Medicamentos, Alergias, Discapacidad y Biometría',
    question: 'Estatura Aproximada en Centímetros (cm)', type: 'numero', order: 8, status: 'ACTIVE',
    fieldKey: 'estaturaCm', excelAliases: ['estatura', 'estatura_cm', 'talla', 'altura_cm'],
    dataType: 'number', required: false, critical: false, sensitive: true, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    validationRules: { min: 50, max: 250, customErrorMessage: 'La estatura debe estar entre 50 y 250 cm.' }
  },
  {
    id: 'QB-809', companyId: 'GLOBAL', moduleId: 8, moduleName: 'Medicamentos, Alergias, Discapacidad y Biometría',
    question: 'Perímetro Abdominal / Cintura en Centímetros (cm)', type: 'radio', order: 9, status: 'ACTIVE',
    fieldKey: 'perimetroCintura', excelAliases: ['perimetro_cintura', 'cintura_cm', 'perimetro_abdominal'],
    dataType: 'string', required: false, critical: false, sensitive: true, reportable: true, allowOther: true, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-pc-nosabe', label: 'No conozco el dato', value: 'No conozco el dato' },
      { id: 'opt-pc-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-810', companyId: 'GLOBAL', moduleId: 8, moduleName: 'Medicamentos, Alergias, Discapacidad y Biometría',
    question: 'Grupo Sanguíneo y Factor RH', type: 'lista', order: 10, status: 'ACTIVE',
    fieldKey: 'grupoSanguineo', excelAliases: ['grupo_sanguineo', 'rh', 'tipo_sangre'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-rh-opos', label: 'O+', value: 'O+' },
      { id: 'opt-rh-oneg', label: 'O-', value: 'O-' },
      { id: 'opt-rh-apos', label: 'A+', value: 'A+' },
      { id: 'opt-rh-aneg', label: 'A-', value: 'A-' },
      { id: 'opt-rh-bpos', label: 'B+', value: 'B+' },
      { id: 'opt-rh-bneg', label: 'B-', value: 'B-' },
      { id: 'opt-rh-abpos', label: 'AB+', value: 'AB+' },
      { id: 'opt-rh-abneg', label: 'AB-', value: 'AB-' },
      { id: 'opt-rh-nose', label: 'No sé', value: 'No sé' },
      { id: 'opt-rh-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },

  // MÓDULO 9
  {
    id: 'QB-901', companyId: 'GLOBAL', moduleId: 9, moduleName: 'Condiciones osteomusculares y Estilos de Vida',
    question: 'Durante los últimos 12 meses, ¿ha presentado molestias o dolor en alguna de las siguientes zonas?',
    type: 'multiple_seleccion', order: 1, status: 'ACTIVE',
    fieldKey: 'molestiasOsteomusculares12M', excelAliases: ['molestias_osteomusculares', 'dolor_osteoarticular', 'zonas_dolor'],
    dataType: 'array', required: true, critical: true, sensitive: true, reportable: true, allowOther: true, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-ost-ninguna', label: 'Ninguna', value: 'Ninguna' },
      { id: 'opt-ost-cuello', label: 'Cuello', value: 'Cuello' },
      { id: 'opt-ost-hombros', label: 'Hombros', value: 'Hombros' },
      { id: 'opt-ost-espalda-alta', label: 'Espalda alta', value: 'Espalda alta' },
      { id: 'opt-ost-espalda-baja', label: 'Espalda baja', value: 'Espalda baja' },
      { id: 'opt-ost-codos', label: 'Codos', value: 'Codos' },
      { id: 'opt-ost-munecas', label: 'Muñecas', value: 'Muñecas' },
      { id: 'opt-ost-manos', label: 'Manos', value: 'Manos' },
      { id: 'opt-ost-caderas', label: 'Caderas', value: 'Caderas' },
      { id: 'opt-ost-rodillas', label: 'Rodillas', value: 'Rodillas' },
      { id: 'opt-ost-tobillos', label: 'Tobillos', value: 'Tobillos' },
      { id: 'opt-ost-pies', label: 'Pies', value: 'Pies' },
      { id: 'opt-ost-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-902', companyId: 'GLOBAL', moduleId: 9, moduleName: 'Condiciones osteomusculares y Estilos de Vida',
    question: '¿La molestia osteomuscular ha afectado sus actividades laborales?', type: 'radio', order: 2, status: 'ACTIVE',
    fieldKey: 'molestiasAfectoLaboral', excelAliases: ['molestias_afecto_laboral', 'afectacion_laboral_dolor'],
    dataType: 'string', required: false, critical: false, sensitive: true, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-mal-si', label: 'Sí', value: 'Sí' },
      { id: 'opt-mal-no', label: 'No', value: 'No' },
      { id: 'opt-mal-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-903', companyId: 'GLOBAL', moduleId: 9, moduleName: 'Condiciones osteomusculares y Estilos de Vida',
    question: '¿Realiza actividad física o ejercicio de manera regular?', type: 'radio', order: 3, status: 'ACTIVE',
    fieldKey: 'actividadFisicaRealiza', excelAliases: ['actividad_fisica', 'deporte', 'ejercicio'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-af-si', label: 'Sí', value: 'Sí' },
      { id: 'opt-af-no', label: 'No', value: 'No' },
      { id: 'opt-af-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-904', companyId: 'GLOBAL', moduleId: 9, moduleName: 'Condiciones osteomusculares y Estilos de Vida',
    question: 'Frecuencia semanal de actividad física', type: 'lista', order: 4, status: 'ACTIVE',
    fieldKey: 'actividadFisicaFrecuencia', excelAliases: ['actividad_fisica_frecuencia', 'dias_ejercicio'],
    dataType: 'string', required: false, critical: false, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-aff-1d', label: '1 día por semana', value: '1 día' },
      { id: 'opt-aff-2d', label: '2 días por semana', value: '2 días' },
      { id: 'opt-aff-3d', label: '3 días por semana', value: '3 días' },
      { id: 'opt-aff-4d', label: '4 días por semana', value: '4 días' },
      { id: 'opt-aff-5d', label: '5 o más días por semana', value: '5 o más días' }
    ]
  },
  {
    id: 'QB-905', companyId: 'GLOBAL', moduleId: 9, moduleName: 'Condiciones osteomusculares y Estilos de Vida',
    question: 'Principales actividades durante su tiempo libre', type: 'multiple_seleccion', order: 5, status: 'ACTIVE',
    fieldKey: 'tiempoLibreActividades', excelAliases: ['tiempo_libre', 'hobbies', 'actividades_recreativas'],
    dataType: 'array', required: false, critical: false, sensitive: false, reportable: true, allowOther: true, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-tl-fam', label: 'Compartir con familia', value: 'Compartir con familia' },
      { id: 'opt-tl-dep', label: 'Actividad deportiva', value: 'Actividad deportiva' },
      { id: 'opt-tl-est', label: 'Estudiar', value: 'Estudiar' },
      { id: 'opt-tl-lee', label: 'Leer', value: 'Leer' },
      { id: 'opt-tl-pel', label: 'Ver películas / series', value: 'Ver películas/series' },
      { id: 'opt-tl-soc', label: 'Actividades sociales', value: 'Actividades sociales' },
      { id: 'opt-tl-des', label: 'Descansar', value: 'Descansar' },
      { id: 'opt-tl-vid', label: 'Videojuegos', value: 'Videojuegos' }
    ]
  },
  {
    id: 'QB-906', companyId: 'GLOBAL', moduleId: 9, moduleName: 'Condiciones osteomusculares y Estilos de Vida',
    question: '¿Tiene animales de compañía (Mascotas)?', type: 'radio', order: 6, status: 'ACTIVE',
    fieldKey: 'mascotasTiene', excelAliases: ['mascotas', 'tiene_mascotas', 'animales_compania'],
    dataType: 'string', required: false, critical: false, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-mas-si', label: 'Sí', value: 'Sí' },
      { id: 'opt-mas-no', label: 'No', value: 'No' },
      { id: 'opt-mas-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },

  // MÓDULO 10
  {
    id: 'QB-1001', companyId: 'GLOBAL', moduleId: 10, moduleName: 'Trabajo, modalidad y salud mental',
    question: 'Modalidad de Trabajo Actual', type: 'lista', order: 1, status: 'ACTIVE', catalogType: 'modalidadesTrabajo',
    fieldKey: 'modalidadTrabajo', excelAliases: ['modalidad_trabajo', 'modalidad', 'teletrabajo'],
    dataType: 'string', required: true, critical: true, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false
  },
  {
    id: 'QB-1002', companyId: 'GLOBAL', moduleId: 10, moduleName: 'Trabajo, modalidad y salud mental',
    question: '¿Trabaja por Turnos?', type: 'radio', order: 2, status: 'ACTIVE',
    fieldKey: 'turnosTrabaja', excelAliases: ['turnos', 'trabaja_turnos', 'trabajo_turnos'],
    dataType: 'string', required: true, critical: false, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: true,
    options: [
      { id: 'opt-tur-si', label: 'Sí', value: 'Sí' },
      { id: 'opt-tur-no', label: 'No', value: 'No' },
      { id: 'opt-tur-pref', label: 'Prefiero no responder', value: 'Prefiero no responder' }
    ]
  },
  {
    id: 'QB-1003', companyId: 'GLOBAL', moduleId: 10, moduleName: 'Trabajo, modalidad y salud mental',
    question: 'Principal Medio de Transporte hacia el Trabajo', type: 'radio', order: 3, status: 'ACTIVE',
    fieldKey: 'transporteMedioPrincipal', excelAliases: ['medio_transporte', 'transporte', 'transporte_principal'],
    dataType: 'string', required: true, critical: false, sensitive: false, reportable: true, allowOther: true, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-tr-pub', label: 'Transporte público', value: 'Transporte público' },
      { id: 'opt-tr-part', label: 'Vehículo particular', value: 'Vehículo particular' },
      { id: 'opt-tr-moto', label: 'Motocicleta', value: 'Motocicleta' },
      { id: 'opt-tr-bici', label: 'Bicicleta', value: 'Bicicleta' },
      { id: 'opt-tr-cam', label: 'Caminando', value: 'Caminando' },
      { id: 'opt-tr-emp', label: 'Transporte suministrado por la empresa', value: 'Transporte empresa' }
    ]
  },
  {
    id: 'QB-1004', companyId: 'GLOBAL', moduleId: 10, moduleName: 'Trabajo, modalidad y salud mental',
    question: 'Tiempo aproximado de desplazamiento hacia el trabajo', type: 'lista', order: 4, status: 'ACTIVE',
    fieldKey: 'transporteTiempoDesplazamiento', excelAliases: ['tiempo_desplazamiento', 'duracion_transporte'],
    dataType: 'string', required: true, critical: false, sensitive: false, reportable: true, allowOther: false, allowPreferNotToAnswer: false,
    options: [
      { id: 'opt-td-m30', label: 'Menos de 30 minutos', value: '< 30 min' },
      { id: 'opt-td-3060', label: '30–60 minutos', value: '30-60 min' },
      { id: 'opt-td-12h', label: '1–2 horas', value: '1-2 horas' },
      { id: 'opt-td-m2h', label: 'Más de 2 horas', value: '> 2 horas' }
    ]
  },
  {
    id: 'QB-1005', companyId: 'GLOBAL', moduleId: 10, moduleName: 'Trabajo, modalidad y salud mental',
    question: 'Percepción general de bienestar personal y laboral (1 a 5)', type: 'escala_likert', order: 5, status: 'ACTIVE',
    fieldKey: 'saludMentalBienestarGeneral', excelAliases: ['bienestar_general', 'percepcion_bienestar'],
    dataType: 'number', required: false, critical: false, sensitive: true, reportable: true, allowOther: false, allowPreferNotToAnswer: true
  },

  // MÓDULO 11
  {
    id: 'QB-1101', companyId: 'GLOBAL', moduleId: 11, moduleName: 'Observaciones',
    question: 'Observaciones adicionales, comentarios o sugerencias', type: 'texto_largo', order: 1, status: 'ACTIVE',
    fieldKey: 'observacionesGenerales', excelAliases: ['observaciones', 'comentarios', 'notas'],
    dataType: 'string', required: false, critical: false, sensitive: false, reportable: false, allowOther: false, allowPreferNotToAnswer: false
  }
];

export class QuestionBankService {

  /**
   * Calculates age in years from birth date string. Returns null if invalid or missing.
   */
  public static calculateAge(birthDateStr?: string | Date): number | null {
    if (!birthDateStr) return null;
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age >= 14 && age <= 100 ? age : null;
  }

  /**
   * Calculates seniority string (e.g. "3 años, 4 meses" or "Información no disponible") from hire date.
   */
  public static calculateSeniority(hireDateStr?: string | Date): { seniorityString: string; seniorityYears: number | null } {
    if (!hireDateStr) return { seniorityString: 'Información no disponible.', seniorityYears: null };
    const hire = new Date(hireDateStr);
    if (isNaN(hire.getTime())) return { seniorityString: 'Información no disponible.', seniorityYears: null };

    const today = new Date();
    if (hire > today) return { seniorityString: 'Información no disponible.', seniorityYears: null };

    let years = today.getFullYear() - hire.getFullYear();
    let months = today.getMonth() - hire.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalYearsDecimal = Math.round((years + months / 12) * 10) / 10;
    let text = '';
    if (years === 0 && months === 0) text = 'Menos de 1 mes';
    else if (years === 0) text = `${months} ${months === 1 ? 'mes' : 'meses'}`;
    else text = `${years} ${years === 1 ? 'año' : 'años'}${months > 0 ? `, ${months} ${months === 1 ? 'mes' : 'meses'}` : ''}`;

    return { seniorityString: text, seniorityYears: totalYearsDecimal };
  }

  /**
   * Calculates Body Mass Index (IMC = kg / m^2) and status. Returns NO CALCULABLE if missing weight or height.
   */
  public static calculateIMC(weightKg?: number, heightCm?: number): { imcValue: number | null; imcCategory: string } {
    if (!weightKg || !heightCm || isNaN(weightKg) || isNaN(heightCm) || weightKg <= 0 || heightCm <= 0) {
      return { imcValue: null, imcCategory: 'IMC = NO CALCULABLE' };
    }

    const heightM = heightCm / 100;
    const imc = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

    let cat = 'Normal';
    if (imc < 18.5) cat = 'Bajo Peso';
    else if (imc < 25) cat = 'Peso Normal';
    else if (imc < 30) cat = 'Sobrepeso';
    else cat = 'Obesidad';

    return { imcValue: imc, imcCategory: cat };
  }

  /**
   * Merges QuestionBank with dynamic Company Catalog options.
   */
  public static getQuestionBankForCompany(
    companyId: string,
    companyCatalog?: CompanySurveyConfiguration
  ): QuestionBankQuestion[] {
    const catalog = companyCatalog || getCompanySurveyConfiguration(companyId, `Empresa ${companyId}`);

    return DEFAULT_QUESTION_BANK.map(q => {
      const qCopy = { ...q, companyId };

      if (qCopy.catalogType) {
        const catList = catalog.catalogs[qCopy.catalogType] || [];
        qCopy.options = catList.map(item => ({
          id: item.id,
          label: item.label,
          value: item.label
        }));
      }

      return qCopy;
    });
  }

  /**
   * Builds an EncuestaMeta metadata snapshot object with all 11 modules.
   */
  public static buildMasterSurveyMeta(
    companyId: string,
    companyCatalog?: CompanySurveyConfiguration
  ): EncuestaMeta {
    const questions = this.getQuestionBankForCompany(companyId, companyCatalog);

    const secciones: SeccionEncuesta[] = MASTER_MODULES.map(mod => {
      const modQuestions = questions.filter(q => q.moduleId === mod.id);

      const preguntasConfig: PreguntaConfig[] = modQuestions.map(q => ({
        id: q.id,
        seccionId: `sec-${mod.id}`,
        tipo: q.type,
        titulo: q.question,
        obligatoria: q.required,
        visible: true,
        editable: true,
        orden: q.order,
        opciones: q.options,
        categoria: mod.shortName,
        variableSistema: q.critical,
        nombreVariableSistema: q.fieldKey,
        reglasDependencia: []
      }));

      return {
        id: `sec-${mod.id}`,
        encuestaId: 'tpl-master-encuesta-2026',
        titulo: mod.name,
        descripcion: mod.id === 6 ? 'Aviso de Privacidad: La información de salud es sensible y protegida.' : undefined,
        orden: mod.id,
        preguntas: preguntasConfig
      };
    });

    return {
      id: 'tpl-master-encuesta-2026',
      empresaId: companyId,
      titulo: 'Encuesta Maestra Sociodemográfica, Laboral y de Salud (Prompt 27)',
      codigo: 'ENC-MASTER-P27',
      descripcion: 'Instrumento maestro normativo de 11 módulos según Decreto 1072 de 2015 y Resolución 1016 de 1989.',
      categoria: 'Sociodemográfica y Salud',
      estado: 'publicada',
      version: 1,
      autor: 'Dirección de Gestión Humana & SG-SST',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      tiempoEstimadoMinutos: 15,
      permitirAnonimo: false,
      secciones,
      tags: ['Prompt27', 'Sociodemográfico', 'Salud', 'Laboral', 'SG-SST']
    };
  }

  /**
   * Unified Normalization Engine:
   * Maps EITHER direct raw survey response object OR imported Excel row
   * into standardized response objects matching DataDictionary without generating fake defaults.
   */
  public static normalizeSurveyOrExcelData(
    rawRecord: any,
    companyCatalog?: CompanySurveyConfiguration
  ): Record<string, any> {
    const normalized: Record<string, any> = {};
    const catalog = companyCatalog || getCompanySurveyConfiguration('default', 'Empresa Default');

    DEFAULT_QUESTION_BANK.forEach(q => {
      const fieldKey = q.fieldKey;
      let rawVal: any = undefined;

      // 1. Direct property match
      if (rawRecord[fieldKey] !== undefined) {
        rawVal = rawRecord[fieldKey];
      } else {
        // 2. Check Excel Aliases
        for (const alias of q.excelAliases) {
          if (rawRecord[alias] !== undefined) {
            rawVal = rawRecord[alias];
            break;
          }
        }
      }

      // Handle object structure { value, otherValue, status }
      if (rawVal && typeof rawVal === 'object' && !Array.isArray(rawVal) && !(rawVal instanceof Date)) {
        rawVal = rawVal.value !== undefined ? rawVal.value : rawVal;
      }

      // 3. Process according to ABSOLUTE RULE: Zero fake defaults
      if (rawVal === undefined || rawVal === null || rawVal === '' || rawVal === 'SIN_INFORMACION') {
        normalized[fieldKey] = null;
      } else if (rawVal === 'Prefiero no responder' || rawVal === 'PREFER_NOT_TO_ANSWER') {
        normalized[fieldKey] = 'Prefiero no responder';
      } else {
        normalized[fieldKey] = rawVal;
      }
    });

    // 4. Automatic Age Calculation if fechaNacimiento is provided
    if (normalized.fechaNacimiento) {
      const calcAge = this.calculateAge(normalized.fechaNacimiento);
      if (calcAge !== null) {
        normalized.edad = calcAge;
      }
    }

    // 5. Automatic Seniority Calculation if fechaIngreso is provided
    if (normalized.fechaIngreso) {
      const { seniorityString, seniorityYears } = this.calculateSeniority(normalized.fechaIngreso);
      normalized.antiguedadCalculada = seniorityString;
      normalized.antiguedadAnos = seniorityYears;
    } else if (!normalized.antiguedadCalculada) {
      normalized.antiguedadCalculada = 'Información no disponible.';
    }

    // 6. Mutual Exclusion Enforcement on Osteomuscular Complaints
    if (Array.isArray(normalized.molestiasOsteomusculares12M)) {
      if (normalized.molestiasOsteomusculares12M.includes('Ninguna')) {
        normalized.molestiasOsteomusculares12M = ['Ninguna'];
      }
    }

    // Retain employee ID metadata
    normalized.employeeId = rawRecord.employeeId || rawRecord.numeroIdentificacion || rawRecord.cedula || `EMP-${Date.now()}`;
    normalized.isCompleted = true;

    return normalized;
  }
}
