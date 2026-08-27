import { SurveySection } from './types';

export const SURVEY_SCHEMA: SurveySection[] = [
  // =========================================================================
  // SECCIÓN 1: IDENTIFICACIÓN Y VINCULACIÓN
  // =========================================================================
  {
    id: 1,
    title: '1. Identificación y Vinculación',
    shortTitle: 'Identificación',
    description: 'Datos básicos de identificación y vinculación organizacional.',
    iconName: 'Building',
    questions: [
      {
        id: 'tipoDocumento',
        fieldKey: 'tipoDocumento',
        label: 'Tipo de documento de identidad',
        type: 'select',
        required: true,
        category: 'Identificación',
        options: [
          { label: 'Cédula de Ciudadanía (CC)', value: 'CC' },
          { label: 'Cédula de Extranjería (CE)', value: 'CE' },
          { label: 'Pasaporte', value: 'Pasaporte' },
          { label: 'Permiso Especial de Permanencia (PEP)', value: 'PEP' },
          { label: 'Permiso por Protección Temporal (PPT)', value: 'PPT' }
        ]
      },
      {
        id: 'numeroDocumento',
        fieldKey: 'numeroDocumento',
        label: 'Número de documento de identidad',
        type: 'text',
        required: true,
        placeholder: 'Ej. 1018234567',
        category: 'Identificación'
      },
      {
        id: 'nombreCompleto',
        fieldKey: 'nombreCompleto',
        label: 'Nombre completo',
        type: 'text',
        required: true,
        placeholder: 'Nombres y apellidos completos',
        category: 'Identificación'
      },
      {
        id: 'fechaNacimiento',
        fieldKey: 'fechaNacimiento',
        label: 'Fecha de nacimiento',
        type: 'date',
        required: true,
        category: 'Demografía',
        validation: { minAge: 18 }
      },
      {
        id: 'sexo',
        fieldKey: 'sexo',
        label: 'Sexo',
        type: 'radio',
        required: true,
        category: 'Demografía',
        options: [
          { label: 'Femenino', value: 'Femenino' },
          { label: 'Masculino', value: 'Masculino' },
          { label: 'Intersex / Otro', value: 'Otro' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'sede',
        fieldKey: 'sede',
        label: 'Sede de trabajo',
        type: 'select',
        required: true,
        category: 'Estructura Organizacional',
        tooltip: 'Seleccione la sede correspondiente al catálogo de la empresa.'
      },
      {
        id: 'area',
        fieldKey: 'area',
        label: 'Área o Departamento',
        type: 'select',
        required: true,
        category: 'Estructura Organizacional',
        tooltip: 'Seleccione el área del catálogo de la empresa.'
      },
      {
        id: 'proyecto',
        fieldKey: 'proyecto',
        label: 'Proyecto o Campaña',
        type: 'select',
        required: false,
        category: 'Estructura Organizacional',
        helpText: 'Opcional. Si la empresa no maneja proyectos, deje este campo vacío.'
      },
      {
        id: 'cargo',
        fieldKey: 'cargo',
        label: 'Cargo actual',
        type: 'select',
        required: true,
        category: 'Estructura Organizacional'
      },
      {
        id: 'tipoContrato',
        fieldKey: 'tipoContrato',
        label: 'Tipo de contrato',
        type: 'select',
        required: true,
        category: 'Contratación'
      },
      {
        id: 'fechaIngreso',
        fieldKey: 'fechaIngreso',
        label: 'Fecha de ingreso a la empresa',
        type: 'date',
        required: true,
        category: 'Antigüedad'
      },
      {
        id: 'antiguedadCargo',
        fieldKey: 'antiguedadCargo',
        label: 'Antigüedad en el cargo actual (Años o meses)',
        type: 'text',
        required: false,
        placeholder: 'Ej. 2 años, 6 meses',
        category: 'Antigüedad'
      },
      {
        id: 'modalidadTrabajo',
        fieldKey: 'modalidadTrabajo',
        label: 'Modalidad de trabajo',
        type: 'select',
        required: true,
        category: 'Jornada'
      },
      {
        id: 'turno',
        fieldKey: 'turno',
        label: 'Turno de trabajo',
        type: 'select',
        required: false,
        category: 'Jornada'
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 2: INFORMACIÓN SOCIODEMOGRÁFICA
  // =========================================================================
  {
    id: 2,
    title: '2. Información Sociodemográfica',
    shortTitle: 'Sociodemográfico',
    description: 'Caracterización sociodemográfica, estado civil, escolaridad y ubicación.',
    iconName: 'Users',
    questions: [
      {
        id: 'estadoCivil',
        fieldKey: 'estadoCivil',
        label: 'Estado civil',
        type: 'select',
        required: true,
        category: 'Demografía',
        allowsOther: true,
        otherFieldKey: 'estadoCivilOtro',
        options: [
          { label: 'Soltero(a)', value: 'Soltero(a)' },
          { label: 'Casado(a)', value: 'Casado(a)' },
          { label: 'Unión Libre', value: 'Unión Libre' },
          { label: 'Divorciado(a) / Separado(a)', value: 'Divorciado(a)' },
          { label: 'Viudo(a)', value: 'Viudo(a)' },
          { label: 'Otro', value: 'Otro' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'estadoCivilOtro',
        fieldKey: 'estadoCivilOtro',
        label: '¿Cuál estado civil?',
        type: 'text',
        required: false,
        category: 'Demografía',
        dependsOn: { questionId: 'estadoCivil', value: 'Otro' }
      },
      {
        id: 'nivelEducativo',
        fieldKey: 'nivelEducativo',
        label: 'Nivel educativo alcanzado',
        type: 'select',
        required: true,
        category: 'Educación',
        allowsOther: true,
        otherFieldKey: 'nivelEducativoOtro',
        options: [
          { label: 'Primaria', value: 'Primaria' },
          { label: 'Bachillerato / Secundaria', value: 'Bachillerato' },
          { label: 'Técnico', value: 'Técnico' },
          { label: 'Tecnólogo', value: 'Tecnólogo' },
          { label: 'Profesional / Universitario', value: 'Profesional' },
          { label: 'Especialización / Posgrado', value: 'Especialización' },
          { label: 'Maestría / Doctorado', value: 'Maestría/Doctorado' },
          { label: 'Otro', value: 'Otro' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'nivelEducativoOtro',
        fieldKey: 'nivelEducativoOtro',
        label: '¿Cuál nivel educativo?',
        type: 'text',
        required: false,
        category: 'Educación',
        dependsOn: { questionId: 'nivelEducativo', value: 'Otro' }
      },
      {
        id: 'ciudadResidencia',
        fieldKey: 'ciudadResidencia',
        label: 'Ciudad o municipio de residencia',
        type: 'text',
        required: true,
        placeholder: 'Ej. Bogotá D.C., Medellín, Cali',
        category: 'Ubicación'
      },
      {
        id: 'estrato',
        fieldKey: 'estrato',
        label: 'Estrato socioeconómico',
        type: 'select',
        required: true,
        category: 'Hogar',
        options: [
          { label: 'Estrato 1', value: 'Estrato 1' },
          { label: 'Estrato 2', value: 'Estrato 2' },
          { label: 'Estrato 3', value: 'Estrato 3' },
          { label: 'Estrato 4', value: 'Estrato 4' },
          { label: 'Estrato 5', value: 'Estrato 5' },
          { label: 'Estrato 6', value: 'Estrato 6' },
          { label: 'Sin estrato / Zona rural', value: 'Sin estrato' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'grupoEtnico',
        fieldKey: 'grupoEtnico',
        label: 'Grupo étnico con el que se identifica',
        type: 'select',
        required: false,
        category: 'Diversidad',
        allowsOther: true,
        otherFieldKey: 'grupoEtnicoOtro',
        options: [
          { label: 'Indígena', value: 'Indígena' },
          { label: 'Afrocolombiano / Raizal / Palenquero', value: 'Afrocolombiano' },
          { label: 'ROM / Gitano', value: 'ROM' },
          { label: 'Ninguno', value: 'Ninguno' },
          { label: 'Otro', value: 'Otro' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'grupoEtnicoOtro',
        fieldKey: 'grupoEtnicoOtro',
        label: '¿Cuál grupo étnico?',
        type: 'text',
        required: false,
        category: 'Diversidad',
        dependsOn: { questionId: 'grupoEtnico', value: 'Otro' }
      },
      {
        id: 'poblacionEspecial',
        fieldKey: 'poblacionEspecial',
        label: 'Pertenencia a población especial (si aplica)',
        type: 'select',
        required: false,
        category: 'Diversidad',
        allowsOther: true,
        otherFieldKey: 'poblacionEspecialOtro',
        options: [
          { label: 'Víctima del conflicto armado', value: 'Víctima del conflicto' },
          { label: 'Cabeza de hogar', value: 'Cabeza de hogar' },
          { label: 'Madre / Padre comunitario', value: 'Madre/Padre comunitario' },
          { label: 'Ninguna', value: 'Ninguna' },
          { label: 'Otra', value: 'Otra' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'poblacionEspecialOtro',
        fieldKey: 'poblacionEspecialOtro',
        label: '¿Cuál población especial?',
        type: 'text',
        required: false,
        category: 'Diversidad',
        dependsOn: { questionId: 'poblacionEspecial', value: 'Otra' }
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 3: INFORMACIÓN FAMILIAR
  // =========================================================================
  {
    id: 3,
    title: '3. Información Familiar',
    shortTitle: 'Familia',
    description: 'Estructura familiar, personas a cargo e integrantes del hogar.',
    iconName: 'Home',
    questions: [
      {
        id: 'tieneHijos',
        fieldKey: 'tieneHijos',
        label: '¿Tiene hijos?',
        type: 'radio',
        required: true,
        category: 'Familia',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'numeroHijos',
        fieldKey: 'numeroHijos',
        label: 'Número de hijos',
        type: 'number',
        required: false,
        category: 'Familia',
        placeholder: 'Ej. 2',
        validation: { min: 0, max: 20 },
        dependsOn: { questionId: 'tieneHijos', value: 'Sí' }
      },
      {
        id: 'tienePersonasACargo',
        fieldKey: 'tienePersonasACargo',
        label: '¿Tiene personas a cargo?',
        type: 'radio',
        required: true,
        category: 'Familia',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'numeroPersonasACargo',
        fieldKey: 'numeroPersonasACargo',
        label: 'Número de personas a cargo',
        type: 'number',
        required: false,
        category: 'Familia',
        placeholder: 'Ej. 3',
        validation: { min: 0, max: 20 },
        dependsOn: { questionId: 'tienePersonasACargo', value: 'Sí' }
      },
      {
        id: 'personasHogar',
        fieldKey: 'personasHogar',
        label: 'Número de personas que integran su hogar (incluyéndose usted)',
        type: 'number',
        required: true,
        placeholder: 'Ej. 4',
        validation: { min: 1, max: 30, customErrorMsg: 'El número de integrantes debe ser al menos 1.' },
        category: 'Hogar',
        helpText: 'Respuesta directa suministrada por el usuario (no calculada automáticamente).'
      },
      {
        id: 'conQuienVive',
        fieldKey: 'conQuienVive',
        label: '¿Con quién vive actualmente?',
        type: 'multiselect',
        required: true,
        category: 'Hogar',
        allowsOther: true,
        otherFieldKey: 'conQuienViveOtro',
        options: [
          { label: 'Pareja / Cónyuge', value: 'Pareja' },
          { label: 'Hijos', value: 'Hijos' },
          { label: 'Padres / Suegros', value: 'Padres' },
          { label: 'Hermanos', value: 'Hermanos' },
          { label: 'Otros familiares', value: 'Otros familiares' },
          { label: 'Amigos / Compañeros de residencia', value: 'Amigos' },
          { label: 'Solo(a)', value: 'Solo' },
          { label: 'Otro', value: 'Otro' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'conQuienViveOtro',
        fieldKey: 'conQuienViveOtro',
        label: '¿Con quién más vive?',
        type: 'text',
        required: false,
        category: 'Hogar',
        dependsOn: { questionId: 'conQuienVive', value: 'Otro' }
      },
      {
        id: 'viveSolo',
        fieldKey: 'viveSolo',
        label: '¿Vive solo?',
        type: 'radio',
        required: true,
        category: 'Hogar',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'relacionConvivientes',
        fieldKey: 'relacionConvivientes',
        label: 'Relación o parentesco de las personas con quienes convive',
        type: 'text',
        required: false,
        placeholder: 'Ej. Esposo y dos hijos menores',
        category: 'Hogar'
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 4: VIVIENDA
  // =========================================================================
  {
    id: 4,
    title: '4. Vivienda',
    shortTitle: 'Vivienda',
    description: 'Condiciones de la vivienda y servicios públicos básicos.',
    iconName: 'Home',
    questions: [
      {
        id: 'tipoVivienda',
        fieldKey: 'tipoVivienda',
        label: 'Tipo de vivienda (tenencia)',
        type: 'select',
        required: true,
        category: 'Vivienda',
        allowsOther: true,
        otherFieldKey: 'tipoViviendaOtro',
        options: [
          { label: 'Propia', value: 'Propia' },
          { label: 'Arrendada', value: 'Arrendada' },
          { label: 'Familiar', value: 'Familiar' },
          { label: 'Otra', value: 'Otra' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'tipoViviendaOtro',
        fieldKey: 'tipoViviendaOtro',
        label: '¿Cuál tipo de vivienda?',
        type: 'text',
        required: false,
        category: 'Vivienda',
        dependsOn: { questionId: 'tipoVivienda', value: 'Otra' }
      },
      {
        id: 'serviciosPublicosBasicos',
        fieldKey: 'serviciosPublicosBasicos',
        label: '¿La vivienda cuenta con servicios públicos básicos?',
        type: 'radio',
        required: true,
        category: 'Vivienda',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'serviciosPublicosDetalle',
        fieldKey: 'serviciosPublicosDetalle',
        label: '¿Cuáles servicios públicos tiene la vivienda?',
        type: 'multiselect',
        required: false,
        category: 'Vivienda',
        allowsOther: true,
        otherFieldKey: 'serviciosPublicosDetalleOtro',
        dependsOn: { questionId: 'serviciosPublicosBasicos', value: 'Sí' },
        options: [
          { label: 'Agua potable / Acueducto', value: 'Agua potable' },
          { label: 'Alcantarillado', value: 'Alcantarillado' },
          { label: 'Energía eléctrica', value: 'Energía eléctrica' },
          { label: 'Gas natural / Pipeta', value: 'Gas natural' },
          { label: 'Internet de banda ancha', value: 'Internet' },
          { label: 'Otro', value: 'Otro' }
        ]
      },
      {
        id: 'serviciosPublicosDetalleOtro',
        fieldKey: 'serviciosPublicosDetalleOtro',
        label: '¿Cuál otro servicio público?',
        type: 'text',
        required: false,
        category: 'Vivienda',
        dependsOn: { questionId: 'serviciosPublicosDetalle', value: 'Otro' }
      },
      {
        id: 'personasHabitanVivienda',
        fieldKey: 'personasHabitanVivienda',
        label: 'Número total de personas que habitan en la misma vivienda',
        type: 'number',
        required: false,
        placeholder: 'Ej. 4',
        validation: { min: 1, max: 30 },
        category: 'Vivienda'
      },
      {
        id: 'condicionesVivienda',
        fieldKey: 'condicionesVivienda',
        label: 'Condiciones relevantes de la vivienda',
        type: 'multiselect',
        required: false,
        category: 'Vivienda',
        allowsOther: true,
        otherFieldKey: 'condicionesViviendaOtro',
        options: [
          { label: 'Ubicada en zona de alto riesgo geológico o ambiental', value: 'Zona de riesgo' },
          { label: 'Presenta humedad o problemas de ventilación', value: 'Humedad' },
          { label: 'Hacinamiento (más de 3 personas por habitación)', value: 'Hacinamiento' },
          { label: 'Ninguna condición de riesgo', value: 'Ninguna' },
          { label: 'Otra condición especial', value: 'Otra' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'condicionesViviendaOtro',
        fieldKey: 'condicionesViviendaOtro',
        label: '¿Cuál otra condición de vivienda?',
        type: 'text',
        required: false,
        category: 'Vivienda',
        dependsOn: { questionId: 'condicionesVivienda', value: 'Otra' }
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 5: CONDICIONES LABORALES
  // =========================================================================
  {
    id: 5,
    title: '5. Condiciones Laborales',
    shortTitle: 'Laboral',
    description: 'Relación con la estructura y parametrización de la empresa.',
    iconName: 'Briefcase',
    questions: [
      {
        id: 'antiguedadEmpresa',
        fieldKey: 'antiguedadEmpresa',
        label: 'Antigüedad total en la empresa (años/meses)',
        type: 'text',
        required: false,
        placeholder: 'Ej. 3 años y 2 meses',
        category: 'Antigüedad'
      },
      {
        id: 'centroCosto',
        fieldKey: 'centroCosto',
        label: 'Centro de costo asignado',
        type: 'select',
        required: false,
        category: 'Estructura Organizacional'
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 6: MODALIDAD Y CONDICIONES DE TRABAJO
  // =========================================================================
  {
    id: 6,
    title: '6. Modalidad y Condiciones de Trabajo',
    shortTitle: 'Modalidad',
    description: 'Esquema de trabajo (Presencial, Híbrido, Remoto) y requerimientos del puesto.',
    iconName: 'Monitor',
    questions: [
      {
        id: 'modalidadDetalle',
        fieldKey: 'modalidadDetalle',
        label: 'Modalidad de trabajo habitual',
        type: 'select',
        required: true,
        category: 'Jornada',
        allowsOther: true,
        otherFieldKey: 'modalidadTrabajoOtro',
        options: [
          { label: 'Presencial en sede', value: 'Presencial' },
          { label: 'Híbrido (días presenciales y remotos)', value: 'Híbrido' },
          { label: 'Teletrabajo (formalizado)', value: 'Teletrabajo' },
          { label: 'Trabajo remoto / Trabajo en casa', value: 'Trabajo remoto' },
          { label: 'Otra modalidad', value: 'Otra' }
        ]
      },
      {
        id: 'modalidadTrabajoOtro',
        fieldKey: 'modalidadTrabajoOtro',
        label: '¿Cuál otra modalidad de trabajo?',
        type: 'text',
        required: false,
        category: 'Jornada',
        dependsOn: { questionId: 'modalidadDetalle', value: 'Otra' }
      },
      {
        id: 'condicionesTrabajoEspeciales',
        fieldKey: 'condicionesTrabajoEspeciales',
        label: 'Requerimientos o condiciones especiales de su puesto de trabajo',
        type: 'textarea',
        required: false,
        placeholder: 'Ej. Silla ergonómica, pantalla secundaria, iluminación especial, etc.',
        category: 'Ergonomía'
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 7: CONDICIONES DE SALUD
  // =========================================================================
  {
    id: 7,
    title: '7. Condiciones de Salud',
    shortTitle: 'Salud',
    description: 'Percepción general del estado de salud y preservación confidencial SG-SST.',
    iconName: 'Activity',
    notice: 'Las siguientes preguntas tienen como finalidad apoyar la caracterización de las condiciones de salud de la población trabajadora y la gestión preventiva del SG-SST. Responda únicamente la información que corresponda.',
    questions: [
      {
        id: 'percepcionEstadoSalud',
        fieldKey: 'percepcionEstadoSalud',
        label: '¿Cómo considera actualmente su estado general de salud?',
        type: 'radio',
        required: true,
        sensitive: true,
        category: 'Percepción de Salud',
        options: [
          { label: 'Excelente', value: 'Excelente' },
          { label: 'Muy bueno', value: 'Muy bueno' },
          { label: 'Bueno', value: 'Bueno' },
          { label: 'Regular', value: 'Regular' },
          { label: 'Malo', value: 'Malo' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 8: ANTECEDENTES Y DIAGNÓSTICOS REPORTADOS
  // =========================================================================
  {
    id: 8,
    title: '8. Antecedentes y Diagnósticos Reportados',
    shortTitle: 'Antecedentes',
    description: 'Condiciones de salud diagnosticadas por profesionales, antecedentes y discapacidad.',
    iconName: 'Heart',
    notice: 'Información confidencial para la vigilancia epidemiológica SG-SST.',
    questions: [
      {
        id: 'presentaCondicionSaludDiagnosticada',
        fieldKey: 'presentaCondicionSaludDiagnosticada',
        label: '¿Actualmente presenta alguna condición de salud diagnosticada por un profesional de la salud?',
        type: 'radio',
        required: true,
        sensitive: true,
        category: 'Diagnósticos',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'condicionesSaludDiagnosticadas',
        fieldKey: 'condicionesSaludDiagnosticadas',
        label: '¿Cuál o cuáles condiciones diagnosticadas presenta?',
        type: 'multiselect',
        required: false,
        sensitive: true,
        category: 'Diagnósticos',
        allowsOther: true,
        otherFieldKey: 'condicionesSaludDiagnosticadasOtro',
        dependsOn: { questionId: 'presentaCondicionSaludDiagnosticada', value: 'Sí' },
        options: [
          { label: 'Cardiovascular (Hipertensión, Arritmia, etc.)', value: 'Cardiovascular' },
          { label: 'Metabólica / Endocrina (Diabetes, Tiroides)', value: 'Metabólica' },
          { label: 'Respiratoria (Asma, EPOC, Rinitis severa)', value: 'Respiratoria' },
          { label: 'Osteomuscular / Articular', value: 'Osteomuscular' },
          { label: 'Sensorial (Visual, Auditiva)', value: 'Sensorial' },
          { label: 'Salud Mental / Ansiedad / Depresión', value: 'Salud Mental' },
          { label: 'Digestiva / Gastrointestinal', value: 'Digestiva' },
          { label: 'Dermatológica / Piel', value: 'Dermatológica' },
          { label: 'Otra condición diagnosticada', value: 'Otra' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'condicionesSaludDiagnosticadasOtro',
        fieldKey: 'condicionesSaludDiagnosticadasOtro',
        label: '¿Cuál otra condición diagnosticada?',
        type: 'text',
        required: false,
        sensitive: true,
        category: 'Diagnósticos',
        dependsOn: { questionId: 'condicionesSaludDiagnosticadas', value: 'Otra' }
      },
      {
        id: 'tieneAntecedentesEnfermedades',
        fieldKey: 'tieneAntecedentesEnfermedades',
        label: '¿Tiene antecedentes de enfermedades de importancia clínica o quirúrgica?',
        type: 'radio',
        required: true,
        sensitive: true,
        category: 'Antecedentes',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'antecedentesEnfermedadesDetalle',
        fieldKey: 'antecedentesEnfermedadesDetalle',
        label: 'Describa brevemente los antecedentes relevantes que desee reportar',
        type: 'textarea',
        required: false,
        sensitive: true,
        category: 'Antecedentes',
        dependsOn: { questionId: 'tieneAntecedentesEnfermedades', value: 'Sí' }
      },
      {
        id: 'presentaDiscapacidad',
        fieldKey: 'presentaDiscapacidad',
        label: '¿Presenta alguna discapacidad o condición que requiera ajustes o apoyos en el entorno laboral?',
        type: 'radio',
        required: true,
        sensitive: true,
        category: 'Discapacidad e Inclusión',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'tipoDiscapacidad',
        fieldKey: 'tipoDiscapacidad',
        label: 'Tipo de discapacidad o condición',
        type: 'select',
        required: false,
        sensitive: true,
        category: 'Discapacidad e Inclusión',
        allowsOther: true,
        otherFieldKey: 'tipoDiscapacidadOtro',
        dependsOn: { questionId: 'presentaDiscapacidad', value: 'Sí' },
        options: [
          { label: 'Física / Motora', value: 'Física' },
          { label: 'Visual', value: 'Visual' },
          { label: 'Auditiva', value: 'Auditiva' },
          { label: 'Cognitiva / Intelectual', value: 'Cognitiva' },
          { label: 'Psicosocial', value: 'Psicosocial' },
          { label: 'Múltiple', value: 'Múltiple' },
          { label: 'Otra', value: 'Otra' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'tipoDiscapacidadOtro',
        fieldKey: 'tipoDiscapacidadOtro',
        label: '¿Cuál otro tipo de discapacidad?',
        type: 'text',
        required: false,
        sensitive: true,
        category: 'Discapacidad e Inclusión',
        dependsOn: { questionId: 'tipoDiscapacidad', value: 'Otra' }
      },
      {
        id: 'requiereAjusteLaboral',
        fieldKey: 'requiereAjusteLaboral',
        label: '¿Requiere algún ajuste, adaptación o apoyo en su puesto de trabajo?',
        type: 'radio',
        required: false,
        category: 'Discapacidad e Inclusión',
        dependsOn: { questionId: 'presentaDiscapacidad', value: 'Sí' },
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'ajusteLaboralDetalle',
        fieldKey: 'ajusteLaboralDetalle',
        label: 'Especifique el ajuste o apoyo requerido en el puesto de trabajo',
        type: 'textarea',
        required: false,
        category: 'Discapacidad e Inclusión',
        dependsOn: { questionId: 'requiereAjusteLaboral', value: 'Sí' }
      },
      {
        id: 'cuentaConRestriccionMedica',
        fieldKey: 'cuentaConRestriccionMedica',
        label: '¿Actualmente cuenta con alguna restricción, recomendación o condición médica que deba ser considerada en el trabajo?',
        type: 'radio',
        required: true,
        sensitive: true,
        category: 'Recomendaciones Médicas',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'restriccionMedicaDetalle',
        fieldKey: 'restriccionMedicaDetalle',
        label: 'Indique la restricción o recomendación médica reportada',
        type: 'textarea',
        required: false,
        sensitive: true,
        category: 'Recomendaciones Médicas',
        dependsOn: { questionId: 'cuentaConRestriccionMedica', value: 'Sí' }
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 9: MEDICAMENTOS Y ALERGIAS
  // =========================================================================
  {
    id: 9,
    title: '9. Medicamentos y Alergias',
    shortTitle: 'Medicamentos y Alergias',
    description: 'Consumo permanente de medicamentos y tipos de alergias conocidas.',
    iconName: 'Smile',
    questions: [
      {
        id: 'utilizaMedicamentosHabitual',
        fieldKey: 'utilizaMedicamentosHabitual',
        label: '¿Actualmente utiliza medicamentos de manera habitual o permanente?',
        type: 'radio',
        required: true,
        sensitive: true,
        category: 'Tratamiento',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'medicamentosDetalle',
        fieldKey: 'medicamentosDetalle',
        label: 'Indique el medicamento o grupo de medicamentos, si desea reportarlo',
        type: 'textarea',
        required: false,
        sensitive: true,
        category: 'Tratamiento',
        placeholder: 'Ej. Antihipertensivos, Insulina, Inhalador, etc.',
        dependsOn: { questionId: 'utilizaMedicamentosHabitual', value: 'Sí' }
      },
      {
        id: 'presentaAlergias',
        fieldKey: 'presentaAlergias',
        label: '¿Presenta alguna alergia conocida?',
        type: 'radio',
        required: true,
        sensitive: true,
        category: 'Alergias',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'tiposAlergia',
        fieldKey: 'tiposAlergia',
        label: 'Seleccione tipo(s) de alergia conocida',
        type: 'multiselect',
        required: false,
        sensitive: true,
        category: 'Alergias',
        allowsOther: true,
        otherFieldKey: 'tiposAlergiaOtro',
        dependsOn: { questionId: 'presentaAlergias', value: 'Sí' },
        options: [
          { label: 'Alimentos', value: 'Alimentos' },
          { label: 'Medicamentos', value: 'Medicamentos' },
          { label: 'Polvo / Ácaros', value: 'Polvo' },
          { label: 'Animales / Epitelio', value: 'Animales' },
          { label: 'Picaduras de insectos', value: 'Picaduras' },
          { label: 'Otra', value: 'Otra' }
        ]
      },
      {
        id: 'tiposAlergiaOtro',
        fieldKey: 'tiposAlergiaOtro',
        label: '¿Cuál otra alergia?',
        type: 'text',
        required: false,
        sensitive: true,
        category: 'Alergias',
        dependsOn: { questionId: 'tiposAlergia', value: 'Otra' }
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 10: CONDICIONES OSTEOMUSCULARES
  // =========================================================================
  {
    id: 10,
    title: '10. Condiciones Osteomusculares',
    shortTitle: 'Osteomuscular',
    description: 'Molestias articulares o musculares en los últimos 12 meses y lesiones laborales.',
    iconName: 'Activity',
    questions: [
      {
        id: 'zonasDolorOsteomuscular',
        fieldKey: 'zonasDolorOsteomuscular',
        label: 'Durante los últimos 12 meses, ¿ha presentado molestias o dolor en alguna de las siguientes zonas corporal?',
        type: 'multiselect',
        required: true,
        category: 'Ergonomía',
        allowsOther: true,
        otherFieldKey: 'zonasDolorOsteomuscularOtro',
        options: [
          { label: 'Cuello', value: 'Cuello' },
          { label: 'Hombros', value: 'Hombros' },
          { label: 'Espalda alta', value: 'Espalda alta' },
          { label: 'Espalda baja', value: 'Espalda baja' },
          { label: 'Codos', value: 'Codos' },
          { label: 'Antebrazos', value: 'Antebrazos' },
          { label: 'Muñecas', value: 'Muñecas' },
          { label: 'Manos', value: 'Manos' },
          { label: 'Caderas', value: 'Caderas' },
          { label: 'Rodillas', value: 'Rodillas' },
          { label: 'Tobillos', value: 'Tobillos' },
          { label: 'Pies', value: 'Pies' },
          { label: 'Ninguna', value: 'Ninguna' },
          { label: 'Otra', value: 'Otra' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'zonasDolorOsteomuscularOtro',
        fieldKey: 'zonasDolorOsteomuscularOtro',
        label: '¿Cuál otra zona corporal?',
        type: 'text',
        required: false,
        category: 'Ergonomía',
        dependsOn: { questionId: 'zonasDolorOsteomuscular', value: 'Otra' }
      },
      {
        id: 'frecuenciaDolorOsteomuscular',
        fieldKey: 'frecuenciaDolorOsteomuscular',
        label: '¿Con qué frecuencia presenta estas molestias osteomusculares?',
        type: 'select',
        required: false,
        category: 'Ergonomía',
        dependsOn: { questionId: 'zonasDolorOsteomuscular', value: ['Cuello', 'Hombros', 'Espalda alta', 'Espalda baja', 'Codos', 'Antebrazos', 'Muñecas', 'Manos', 'Caderas', 'Rodillas', 'Tobillos', 'Pies', 'Otra'] },
        options: [
          { label: 'Ocasionalmente', value: 'Ocasionalmente' },
          { label: 'Frecuentemente', value: 'Frecuentemente' },
          { label: 'Diariamente', value: 'Diariamente' },
          { label: 'Variable', value: 'Variable' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'impactoDolorOsteomuscular',
        fieldKey: 'impactoDolorOsteomuscular',
        label: '¿Estas molestias afectan sus actividades laborales o cotidianas?',
        type: 'radio',
        required: false,
        category: 'Ergonomía',
        dependsOn: { questionId: 'zonasDolorOsteomuscular', value: ['Cuello', 'Hombros', 'Espalda alta', 'Espalda baja', 'Codos', 'Antebrazos', 'Muñecas', 'Manos', 'Caderas', 'Rodillas', 'Tobillos', 'Pies', 'Otra'] },
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'A veces', value: 'A veces' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'sufridoAccidenteTrabajo',
        fieldKey: 'sufridoAccidenteTrabajo',
        label: '¿Ha sufrido algún accidente o lesión relacionada con el trabajo?',
        type: 'radio',
        required: true,
        sensitive: true,
        category: 'SST',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'accidenteAnio',
        fieldKey: 'accidenteAnio',
        label: 'Año del accidente o lesión laboral',
        type: 'number',
        required: false,
        category: 'SST',
        placeholder: 'Ej. 2023',
        validation: { min: 1980, max: 2026 },
        dependsOn: { questionId: 'sufridoAccidenteTrabajo', value: 'Sí' }
      },
      {
        id: 'accidenteTipoLesion',
        fieldKey: 'accidenteTipoLesion',
        label: 'Tipo de lesión sufrida',
        type: 'text',
        required: false,
        category: 'SST',
        placeholder: 'Ej. Esguince, Fractura, Quemadura, etc.',
        dependsOn: { questionId: 'sufridoAccidenteTrabajo', value: 'Sí' }
      },
      {
        id: 'accidenteParteCuerpo',
        fieldKey: 'accidenteParteCuerpo',
        label: 'Parte del cuerpo afectada',
        type: 'text',
        required: false,
        category: 'SST',
        placeholder: 'Ej. Muñeca derecha, Tobillo izquierdo',
        dependsOn: { questionId: 'sufridoAccidenteTrabajo', value: 'Sí' }
      },
      {
        id: 'accidenteIncapacidad',
        fieldKey: 'accidenteIncapacidad',
        label: '¿El accidente generó incapacidad médica?',
        type: 'radio',
        required: false,
        category: 'SST',
        dependsOn: { questionId: 'sufridoAccidenteTrabajo', value: 'Sí' },
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'diagnosticoEnfermedadLaboral',
        fieldKey: 'diagnosticoEnfermedadLaboral',
        label: '¿Cuenta o ha contado con un diagnóstico de enfermedad laboral calificada?',
        type: 'radio',
        required: true,
        sensitive: true,
        category: 'SST',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 11: HÁBITOS Y ESTILOS DE VIDA (ANTROPOMETRÍA)
  // =========================================================================
  {
    id: 11,
    title: '11. Hábitos y Estilos de Vida',
    shortTitle: 'Antropometría',
    description: 'Medidas corporales físicas y cálculo estricto de IMC.',
    iconName: 'Brain',
    questions: [
      {
        id: 'pesoKg',
        fieldKey: 'peso',
        label: '¿Cuál es su peso corporal aproximado? (en Kilogramos)',
        type: 'number',
        required: false,
        placeholder: 'Ej. 70 (Opcional)',
        step: 0.1,
        unit: 'Kg',
        validation: { min: 30, max: 250, customErrorMsg: 'El peso debe estar entre 30 y 250 kg.' },
        category: 'Antropometría',
        helpText: 'Dato original reportado. Si no se conoce o no se responde, se conservará como nulo (no se completa automáticamente).'
      },
      {
        id: 'estaturaCm',
        fieldKey: 'estatura',
        label: '¿Cuál es su estatura corporal? (en centímetros)',
        type: 'number',
        required: false,
        placeholder: 'Ej. 170 (Opcional)',
        step: 1,
        unit: 'cm',
        validation: { min: 100, max: 230, customErrorMsg: 'Rango de estatura recomendado: 100 a 230 cm.' },
        category: 'Antropometría',
        helpText: 'Dato original reportado en centímetros.'
      },
      {
        id: 'imcCalculado',
        fieldKey: 'imcCalculado',
        label: 'Índice de Masa Corporal (IMC autocalculado)',
        type: 'text',
        computed: true,
        category: 'Antropometría',
        helpText: 'Cálculo automático: IMC = peso / (estatura/100)². Si falta peso o estatura, resultará en NOT_CALCULABLE (sin inventar valores).'
      },
      {
        id: 'perimetroCintura',
        fieldKey: 'perimetroCintura',
        label: '¿Cuál es aproximadamente su perímetro de cintura? (en centímetros)',
        type: 'number',
        required: false,
        placeholder: 'Ej. 85 (Opcional)',
        step: 1,
        unit: 'cm',
        validation: { min: 40, max: 200, customErrorMsg: 'Rango permitido: 40 a 200 cm.' },
        category: 'Antropometría',
        helpText: 'Si no lo conoce, deje el campo en blanco para guardar como nulo.'
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 12: ACTIVIDAD FÍSICA
  // =========================================================================
  {
    id: 12,
    title: '12. Actividad Física',
    shortTitle: 'Actividad Física',
    description: 'Frecuencia y tipos de ejercicio o deporte habitual.',
    iconName: 'Smile',
    questions: [
      {
        id: 'realizaActividadFisica',
        fieldKey: 'realizaActividadFisica',
        label: '¿Realiza actividad física o ejercicio regularmente?',
        type: 'radio',
        required: true,
        category: 'Estilo de Vida',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'frecuenciaActividadFisica',
        fieldKey: 'frecuenciaActividadFisica',
        label: '¿Con qué frecuencia semanal realiza actividad física?',
        type: 'select',
        required: false,
        category: 'Estilo de Vida',
        allowsOther: true,
        otherFieldKey: 'frecuenciaActividadFisicaOtro',
        dependsOn: { questionId: 'realizaActividadFisica', value: 'Sí' },
        options: [
          { label: '1 día por semana', value: '1 día por semana' },
          { label: '2–3 días por semana', value: '2–3 días' },
          { label: '4–5 días por semana', value: '4–5 días' },
          { label: 'Más de 5 días por semana', value: 'Más de 5 días' },
          { label: 'Otra frecuencia', value: 'Otra' }
        ]
      },
      {
        id: 'frecuenciaActividadFisicaOtro',
        fieldKey: 'frecuenciaActividadFisicaOtro',
        label: '¿Cuál otra frecuencia?',
        type: 'text',
        required: false,
        category: 'Estilo de Vida',
        dependsOn: { questionId: 'frecuenciaActividadFisica', value: 'Otra' }
      },
      {
        id: 'tipoActividadFisica',
        fieldKey: 'tipoActividadFisica',
        label: 'Tipo de actividad física o deporte realizado',
        type: 'multiselect',
        required: false,
        category: 'Estilo de Vida',
        allowsOther: true,
        otherFieldKey: 'tipoActividadFisicaOtro',
        dependsOn: { questionId: 'realizaActividadFisica', value: 'Sí' },
        options: [
          { label: 'Caminar', value: 'Caminar' },
          { label: 'Correr / Trota', value: 'Correr' },
          { label: 'Gimnasio / Pesas / Fitness', value: 'Gimnasio' },
          { label: 'Ciclismo / Bicicleta', value: 'Ciclismo' },
          { label: 'Deporte colectivo (Fútbol, Baloncesto, etc.)', value: 'Deporte colectivo' },
          { label: 'Natación', value: 'Natación' },
          { label: 'Baile / Danza / Aeróbicos', value: 'Baile' },
          { label: 'Otra actividad física', value: 'Otra' }
        ]
      },
      {
        id: 'tipoActividadFisicaOtro',
        fieldKey: 'tipoActividadFisicaOtro',
        label: '¿Cuál otro tipo de actividad física?',
        type: 'text',
        required: false,
        category: 'Estilo de Vida',
        dependsOn: { questionId: 'tipoActividadFisica', value: 'Otra' }
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 13: BIENESTAR Y PARTICIPACIÓN
  // =========================================================================
  {
    id: 13,
    title: '13. Bienestar y Participación',
    shortTitle: 'Bienestar',
    description: 'Uso del tiempo libre, mascotas y participación en eventos de la empresa.',
    iconName: 'Home',
    questions: [
      {
        id: 'actividadesTiempoLibre',
        fieldKey: 'actividadesTiempoLibre',
        label: '¿Qué actividades realiza principalmente durante su tiempo libre?',
        type: 'multiselect',
        required: true,
        category: 'Ocio y Bienestar',
        allowsOther: true,
        otherFieldKey: 'actividadesTiempoLibreOtro',
        options: [
          { label: 'Compartir con la familia', value: 'Compartir con familia' },
          { label: 'Actividad física / Deporte', value: 'Actividad física' },
          { label: 'Estudiar / Formación personal', value: 'Estudiar' },
          { label: 'Leer libros / Artículos', value: 'Leer' },
          { label: 'Ver películas / Series', value: 'Ver películas/series' },
          { label: 'Videojuegos / Gaming', value: 'Videojuegos' },
          { label: 'Actividades sociales con amigos', value: 'Actividades sociales' },
          { label: 'Hobbies / Arte / Música', value: 'Hobbies' },
          { label: 'Otra actividad', value: 'Otra' }
        ]
      },
      {
        id: 'actividadesTiempoLibreOtro',
        fieldKey: 'actividadesTiempoLibreOtro',
        label: '¿Cuál otra actividad de tiempo libre?',
        type: 'text',
        required: false,
        category: 'Ocio y Bienestar',
        dependsOn: { questionId: 'actividadesTiempoLibre', value: 'Otra' }
      },
      {
        id: 'tieneMascotas',
        fieldKey: 'tieneMascotas',
        label: '¿Tiene animales de compañía (mascotas)?',
        type: 'radio',
        required: true,
        category: 'Hogar',
        options: [
          { label: 'Sí', value: 'Sí' },
          { label: 'No', value: 'No' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      },
      {
        id: 'numeroMascotas',
        fieldKey: 'numeroMascotas',
        label: '¿Cuántas mascotas tiene?',
        type: 'number',
        required: false,
        category: 'Hogar',
        placeholder: 'Ej. 2',
        validation: { min: 1, max: 20 },
        dependsOn: { questionId: 'tieneMascotas', value: 'Sí' }
      },
      {
        id: 'participacionActividadesEmpresa',
        fieldKey: 'participacionActividadesEmpresa',
        label: '¿Participa en actividades de bienestar o integración organizadas por la empresa?',
        type: 'radio',
        required: true,
        category: 'Bienestar Organizacional',
        options: [
          { label: 'Frecuentemente', value: 'Frecuentemente' },
          { label: 'Ocasionalmente', value: 'Ocasionalmente' },
          { label: 'Rara vez', value: 'Rara vez' },
          { label: 'Nunca', value: 'Nunca' },
          { label: 'Prefiero no responder', value: 'PREFER_NOT_TO_ANSWER' }
        ]
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 14: INFORMACIÓN ADICIONAL
  // =========================================================================
  {
    id: 14,
    title: '14. Información Adicional',
    shortTitle: 'Adicional',
    description: 'Comentarios u observaciones adicionales voluntarias del colaborador.',
    iconName: 'CheckCircle2',
    questions: [
      {
        id: 'observacionesAdicionales',
        fieldKey: 'observacionesAdicionales',
        label: 'Comentarios u observaciones adicionales (opcional)',
        type: 'textarea',
        required: false,
        placeholder: 'Escriba aquí cualquier aclaración o aspecto adicional que desee compartir con el área de Gestión Humana / SG-SST...',
        category: 'General'
      }
    ]
  },

  // =========================================================================
  // SECCIÓN 15: CONSENTIMIENTO Y CIERRE
  // =========================================================================
  {
    id: 15,
    title: '15. Consentimiento y Cierre',
    shortTitle: 'Consentimiento',
    description: 'Verificación legal y autorización de tratamiento de datos personales y de salud.',
    iconName: 'ShieldCheck',
    notice: 'La información recopilada está protegida por la Ley 1581 de 2012 de Habeas Data y el Decreto 1072 de 2015 del SG-SST.',
    questions: [
      {
        id: 'consentimientoInformado',
        fieldKey: 'consentimientoInformado',
        label: 'Autorización de Tratamiento de Datos Personales y de Salud (Ley 1581 de 2012 / SG-SST)',
        type: 'checkbox',
        required: true,
        category: 'Cierre',
        helpText: 'Manifiesto de manera libre, expresa e informada que la información suministrada es verídica y autorizo a la organización para su tratamiento confidencial exclusivo en la caracterización y programas preventivos de Seguridad y Salud en el Trabajo.'
      }
    ]
  }
];
