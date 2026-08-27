import { EncuestaMeta } from './types';

export const MASTER_SOCIODEMOGRAFICA_ENCUESTA: EncuestaMeta = {
  id: 'tpl-sociodemografica-sgsst',
  empresaId: 'default',
  titulo: 'Encuesta Sociodemográfica y de Condiciones de Salud SG-SST',
  codigo: 'ENC-SOCIO-MASTER',
  descripcion: 'Diagnóstico sociodemográfico integral y perfil epidemiológico de condiciones de salud según Decreto 1072 de 2015 y Resolución 1016 de 1989.',
  categoria: 'Sociodemográfica y Salud',
  estado: 'publicada',
  version: 1,
  autor: 'Dirección SG-SST & Salud Ocupacional',
  fechaCreacion: new Date().toISOString(),
  fechaActualizacion: new Date().toISOString(),
  tiempoEstimadoMinutos: 12,
  permitirAnonimo: false,
  tags: ['SG-SST', 'Sociodemográfica', 'Condiciones de Salud', 'Epidemiología', 'Estilos de Vida'],
  secciones: [
    {
      id: 'sec-1-identificacion',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 1: Identificación del Colaborador',
      descripcion: 'Datos básicos de identificación del colaborador (Aplica en encuestas identificadas).',
      orden: 1,
      preguntas: [
        {
          id: 'preg-id-tipo-doc',
          seccionId: 'sec-1-identificacion',
          tipo: 'lista',
          titulo: 'Tipo de Documento de Identificación',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Identificación',
          variableSistema: true,
          nombreVariableSistema: 'tipo_documento',
          opciones: [
            { id: 'opt-cc', label: 'Cédula de Ciudadanía (CC)', value: 'CC' },
            { id: 'opt-ce', label: 'Cédula de Extranjería (CE)', value: 'CE' },
            { id: 'opt-pas', label: 'Pasaporte', value: 'Pasaporte' },
            { id: 'opt-pep', label: 'Permiso Especial de Permanencia (PEP)', value: 'PEP' },
            { id: 'opt-ppt', label: 'Permiso por Protección Temporal (PPT)', value: 'PPT' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-id-doc',
          seccionId: 'sec-1-identificacion',
          tipo: 'texto',
          titulo: 'Número de Documento de Identidad',
          placeholder: 'Ej. 1018234567',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Identificación',
          variableSistema: true,
          nombreVariableSistema: 'cedula',
          reglasDependencia: []
        },
        {
          id: 'preg-id-nombre',
          seccionId: 'sec-1-identificacion',
          tipo: 'texto',
          titulo: 'Nombres Completo',
          placeholder: 'Ej. Juan Carlos',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 3,
          categoria: 'Identificación',
          variableSistema: true,
          nombreVariableSistema: 'nombre_empleado',
          reglasDependencia: []
        },
        {
          id: 'preg-id-apellidos',
          seccionId: 'sec-1-identificacion',
          tipo: 'texto',
          titulo: 'Apellidos Completo',
          placeholder: 'Ej. Pérez Rodríguez',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 4,
          categoria: 'Identificación',
          variableSistema: true,
          nombreVariableSistema: 'apellidos_empleado',
          reglasDependencia: []
        },
        {
          id: 'preg-id-correo',
          seccionId: 'sec-1-identificacion',
          tipo: 'correo',
          titulo: 'Correo Electrónico de Contacto',
          placeholder: 'colaborador@empresa.com',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 5,
          categoria: 'Identificación',
          variableSistema: true,
          nombreVariableSistema: 'correo_empleado',
          reglasDependencia: []
        },
        {
          id: 'preg-id-telefono',
          seccionId: 'sec-1-identificacion',
          tipo: 'telefono',
          titulo: 'Teléfono / Celular de Contacto',
          placeholder: 'Ej. 3001234567',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 6,
          categoria: 'Identificación',
          variableSistema: true,
          nombreVariableSistema: 'telefono_empleado',
          reglasDependencia: []
        }
      ]
    },
    {
      id: 'sec-2-sociodemografica',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 2: Información Sociodemográfica',
      descripcion: 'Características personales y demográficas generales del colaborador.',
      orden: 2,
      preguntas: [
        {
          id: 'preg-soc-fecha-nac',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'fecha',
          titulo: 'Fecha de Nacimiento',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Sociodemográfico',
          variableSistema: true,
          nombreVariableSistema: 'fecha_nacimiento',
          variableEpidemiologica: true,
          factorEpidemiologico: 'edad_poblacional',
          reglasDependencia: []
        },
        {
          id: 'preg-soc-sexo',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'radio',
          titulo: 'Sexo Biológico',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Sociodemográfico',
          variableSistema: true,
          nombreVariableSistema: 'sexo',
          variableEpidemiologica: true,
          factorEpidemiologico: 'distribucion_sexo',
          opciones: [
            { id: 'opt-m', label: 'Masculino', value: 'Masculino' },
            { id: 'opt-f', label: 'Femenino', value: 'Femenino' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-soc-identidad-genero',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'lista',
          titulo: 'Identidad de Género (Opcional)',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 3,
          categoria: 'Sociodemográfico',
          opciones: [
            { id: 'opt-hc', label: 'Hombre Cisgénero', value: 'Hombre Cisgénero' },
            { id: 'opt-mc', label: 'Mujer Cisgénero', value: 'Mujer Cisgénero' },
            { id: 'opt-ht', label: 'Hombre Trans', value: 'Hombre Trans' },
            { id: 'opt-mt', label: 'Mujer Trans', value: 'Mujer Trans' },
            { id: 'opt-nb', label: 'No Binario', value: 'No Binario' },
            { id: 'opt-pnr', label: 'Prefiero no responder', value: 'Prefiero no responder' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-soc-estado-civil',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'lista',
          titulo: 'Estado Civil',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 4,
          categoria: 'Sociodemográfico',
          variableSistema: true,
          nombreVariableSistema: 'estado_civil',
          opciones: [
            { id: 'opt-ec1', label: 'Soltero(a)', value: 'Soltero(a)' },
            { id: 'opt-ec2', label: 'Casado(a)', value: 'Casado(a)' },
            { id: 'opt-ec3', label: 'Unión Libre', value: 'Unión Libre' },
            { id: 'opt-ec4', label: 'Separado(a) / Divorciado(a)', value: 'Separado(a) / Divorciado(a)' },
            { id: 'opt-ec5', label: 'Viudo(a)', value: 'Viudo(a)' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-soc-num-hijos',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'numero',
          titulo: 'Número de Hijos',
          valorMinimo: 0,
          valorMaximo: 20,
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 5,
          categoria: 'Sociodemográfico',
          reglasDependencia: []
        },
        {
          id: 'preg-soc-personas-cargo',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'numero',
          titulo: 'Número de Personas a Cargo',
          valorMinimo: 0,
          valorMaximo: 20,
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 6,
          categoria: 'Sociodemográfico',
          reglasDependencia: []
        },
        {
          id: 'preg-soc-personas-hogar',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'numero',
          titulo: 'Número de Personas que Conforman el Hogar',
          valorMinimo: 1,
          valorMaximo: 25,
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 7,
          categoria: 'Sociodemográfico',
          reglasDependencia: []
        },
        {
          id: 'preg-soc-vive-solo',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'sino',
          titulo: '¿Vive usted solo(a)?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 8,
          categoria: 'Sociodemográfico',
          reglasDependencia: []
        },
        {
          id: 'preg-soc-depto',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'lista',
          titulo: 'Departamento de Residencia',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 9,
          categoria: 'Sociodemográfico',
          variableSistema: true,
          nombreVariableSistema: 'departamento',
          reglasDependencia: []
        },
        {
          id: 'preg-soc-ciudad',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'lista',
          titulo: 'Ciudad / Municipio de Residencia',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 10,
          categoria: 'Sociodemográfico',
          variableSistema: true,
          nombreVariableSistema: 'ciudad',
          reglasDependencia: []
        },
        {
          id: 'preg-soc-estrato',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'lista',
          titulo: 'Estrato Socioeconómico de la Vivienda',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 11,
          categoria: 'Sociodemográfico',
          opciones: [
            { id: 'opt-e1', label: 'Estrato 1', value: 'Estrato 1' },
            { id: 'opt-e2', label: 'Estrato 2', value: 'Estrato 2' },
            { id: 'opt-e3', label: 'Estrato 3', value: 'Estrato 3' },
            { id: 'opt-e4', label: 'Estrato 4', value: 'Estrato 4' },
            { id: 'opt-e5', label: 'Estrato 5', value: 'Estrato 5' },
            { id: 'opt-e6', label: 'Estrato 6', value: 'Estrato 6' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-soc-tipo-vivienda',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'lista',
          titulo: 'Tipo y Tenencia de Vivienda',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 12,
          categoria: 'Sociodemográfico',
          opciones: [
            { id: 'opt-tv1', label: 'Propia (Pagada totalmente)', value: 'Propia pagada' },
            { id: 'opt-tv2', label: 'Propia (Pagando crédito)', value: 'Propia pagando' },
            { id: 'opt-tv3', label: 'Arrendada', value: 'Arrendada' },
            { id: 'opt-tv4', label: 'Familiar', value: 'Familiar' },
            { id: 'opt-tv5', label: 'Otra', value: 'Otra' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-soc-nivel-educativo',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'lista',
          titulo: 'Último Nivel Educativo Alcanzado',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 13,
          categoria: 'Sociodemográfico',
          opciones: [
            { id: 'opt-ne1', label: 'Primaria Incompleta / Completa', value: 'Primaria' },
            { id: 'opt-ne2', label: 'Bachillerato / Secundario', value: 'Bachillerato' },
            { id: 'opt-ne3', label: 'Técnico', value: 'Técnico' },
            { id: 'opt-ne4', label: 'Tecnólogo', value: 'Tecnólogo' },
            { id: 'opt-ne5', label: 'Profesional / Pregrado', value: 'Profesional' },
            { id: 'opt-ne6', label: 'Especialización', value: 'Especialización' },
            { id: 'opt-ne7', label: 'Maestría', value: 'Maestría' },
            { id: 'opt-ne8', label: 'Doctorado', value: 'Doctorado' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-soc-profesion',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'texto',
          titulo: 'Profesión / Título Académico',
          placeholder: 'Ej. Administrador de Empresas, Contador, etc.',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 14,
          categoria: 'Sociodemográfico',
          reglasDependencia: []
        },
        {
          id: 'preg-soc-grupo-poblacional',
          seccionId: 'sec-2-sociodemografica',
          tipo: 'lista',
          titulo: 'Grupo Poblacional Especial (Enfoque Diferencial)',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 15,
          categoria: 'Sociodemográfico',
          opciones: [
            { id: 'opt-gp1', label: 'Ninguno', value: 'Ninguno' },
            { id: 'opt-gp2', label: 'Comunidad Indígena', value: 'Indígena' },
            { id: 'opt-gp3', label: 'Afrodescendiente / NARR / Palenquero', value: 'Afrodescendiente' },
            { id: 'opt-gp4', label: 'Raizal del Archipiélago', value: 'Raizal' },
            { id: 'opt-gp5', label: 'Comunidad ROM / Gitano', value: 'ROM' },
            { id: 'opt-gp6', label: 'Víctima del Conflicto Armado', value: 'Víctima Conflicto' },
            { id: 'opt-gp7', label: 'Madrante / Padrante Cabeza de Familia', value: 'Cabeza de Familia' },
            { id: 'opt-gp8', label: 'Persona con Discapacidad', value: 'Discapacidad' }
          ],
          reglasDependencia: []
        }
      ]
    },
    {
      id: 'sec-3-laboral',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 3: Información Laboral (Catálogos de la Empresa)',
      descripcion: 'Vinculación laboral sincronizada con los catálogos oficiales parametrizados por la empresa.',
      orden: 3,
      preguntas: [
        {
          id: 'preg-lab-sede',
          seccionId: 'sec-3-laboral',
          tipo: 'lista',
          titulo: 'Sede de Trabajo',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Laboral',
          variableSistema: true,
          nombreVariableSistema: 'sede',
          reglasDependencia: []
        },
        {
          id: 'preg-lab-area',
          seccionId: 'sec-3-laboral',
          tipo: 'lista',
          titulo: 'Área / Departamento',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Laboral',
          variableSistema: true,
          nombreVariableSistema: 'area',
          reglasDependencia: []
        },
        {
          id: 'preg-lab-proceso',
          seccionId: 'sec-3-laboral',
          tipo: 'lista',
          titulo: 'Proceso Organizacional',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 3,
          categoria: 'Laboral',
          variableSistema: true,
          nombreVariableSistema: 'proceso',
          reglasDependencia: []
        },
        {
          id: 'preg-lab-subproceso',
          seccionId: 'sec-3-laboral',
          tipo: 'lista',
          titulo: 'Subproceso',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 4,
          categoria: 'Laboral',
          variableSistema: true,
          nombreVariableSistema: 'subproceso',
          reglasDependencia: []
        },
        {
          id: 'preg-lab-proyecto',
          seccionId: 'sec-3-laboral',
          tipo: 'lista',
          titulo: 'Proyecto / Campaña',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 5,
          categoria: 'Laboral',
          variableSistema: true,
          nombreVariableSistema: 'proyecto',
          reglasDependencia: []
        },
        {
          id: 'preg-lab-cargo',
          seccionId: 'sec-3-laboral',
          tipo: 'lista',
          titulo: 'Cargo Actual',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 6,
          categoria: 'Laboral',
          variableSistema: true,
          nombreVariableSistema: 'cargo',
          reglasDependencia: []
        },
        {
          id: 'preg-lab-tipo-contrato',
          seccionId: 'sec-3-laboral',
          tipo: 'lista',
          titulo: 'Tipo de Contrato',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 7,
          categoria: 'Laboral',
          variableSistema: true,
          nombreVariableSistema: 'tipo_contrato',
          reglasDependencia: []
        },
        {
          id: 'preg-lab-modalidad',
          seccionId: 'sec-3-laboral',
          tipo: 'lista',
          titulo: 'Modalidad de Trabajo',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 8,
          categoria: 'Laboral',
          variableSistema: true,
          nombreVariableSistema: 'modalidad',
          reglasDependencia: []
        },
        {
          id: 'preg-lab-jornada',
          seccionId: 'sec-3-laboral',
          tipo: 'lista',
          titulo: 'Jornada Laboral',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 9,
          categoria: 'Laboral',
          variableSistema: true,
          nombreVariableSistema: 'jornada',
          reglasDependencia: []
        },
        {
          id: 'preg-lab-turno',
          seccionId: 'sec-3-laboral',
          tipo: 'lista',
          titulo: 'Turno de Trabajo',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 10,
          categoria: 'Laboral',
          variableSistema: true,
          nombreVariableSistema: 'turno',
          reglasDependencia: []
        },
        {
          id: 'preg-lab-fecha-ingreso',
          seccionId: 'sec-3-laboral',
          tipo: 'fecha',
          titulo: 'Fecha de Ingreso a la Empresa',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 11,
          categoria: 'Laboral',
          variableSistema: true,
          nombreVariableSistema: 'fecha_ingreso',
          reglasDependencia: []
        },
        {
          id: 'preg-lab-antiguedad-empresa',
          seccionId: 'sec-3-laboral',
          tipo: 'lista',
          titulo: 'Antigüedad en la Empresa',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 12,
          categoria: 'Laboral',
          opciones: [
            { id: 'opt-ant1', label: 'Menos de 1 año', value: 'Menos de 1 año' },
            { id: 'opt-ant2', label: '1 a 3 años', value: '1 a 3 años' },
            { id: 'opt-ant3', label: '3 a 5 años', value: '3 a 5 años' },
            { id: 'opt-ant4', label: '5 a 10 años', value: '5 a 10 años' },
            { id: 'opt-ant5', label: 'Más de 10 años', value: 'Más de 10 años' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-lab-antiguedad-cargo',
          seccionId: 'sec-3-laboral',
          tipo: 'lista',
          titulo: 'Antigüedad en el Cargo Actual',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 13,
          categoria: 'Laboral',
          opciones: [
            { id: 'opt-ac1', label: 'Menos de 1 año', value: 'Menos de 1 año' },
            { id: 'opt-ac2', label: '1 a 3 años', value: '1 a 3 años' },
            { id: 'opt-ac3', label: '3 a 5 años', value: '3 a 5 años' },
            { id: 'opt-ac4', label: 'Más de 5 años', value: 'Más de 5 años' }
          ],
          reglasDependencia: []
        }
      ]
    },
    {
      id: 'sec-4-salud',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 4: Condiciones de Salud',
      descripcion: 'Información sobre diagnósticos y condiciones de salud expresadas por el colaborador.',
      orden: 4,
      preguntas: [
        {
          id: 'preg-salud-condicion-diagnos',
          seccionId: 'sec-4-salud',
          tipo: 'lista',
          titulo: '¿Actualmente presenta alguna condición de salud diagnosticada por médico?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Salud',
          variableEpidemiologica: true,
          factorEpidemiologico: 'salud_diagnostico',
          opciones: [
            { id: 'opt-sd1', label: 'Sí', value: 'Sí' },
            { id: 'opt-sd2', label: 'No', value: 'No' },
            { id: 'opt-sd3', label: 'Prefiero no responder', value: 'Prefiero no responder' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-salud-tipo-condicion',
          seccionId: 'sec-4-salud',
          tipo: 'multiple_seleccion',
          titulo: 'Indique los sistemas o tipos de condición diagnosticada',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Salud',
          variableEpidemiologica: true,
          factorEpidemiologico: 'sistemas_afectados',
          opciones: [
            { id: 'opt-sc1', label: 'Cardiovascular', value: 'Cardiovascular' },
            { id: 'opt-sc2', label: 'Respiratoria', value: 'Respiratoria' },
            { id: 'opt-sc3', label: 'Osteomuscular / Articular', value: 'Osteomuscular' },
            { id: 'opt-sc4', label: 'Metabólica / Endocrina', value: 'Metabólica' },
            { id: 'opt-sc5', label: 'Neurológica', value: 'Neurológica' },
            { id: 'opt-sc6', label: 'Visual', value: 'Visual' },
            { id: 'opt-sc7', label: 'Auditiva', value: 'Auditiva' },
            { id: 'opt-sc8', label: 'Salud Mental / Psicológica', value: 'Salud Mental' },
            { id: 'opt-sc9', label: 'Dermatológica', value: 'Dermatológica' },
            { id: 'opt-sc10', label: 'Otra', value: 'Otra' }
          ],
          reglasDependencia: [
            {
              id: 'rule-salud-si',
              preguntaOrigenId: 'preg-salud-condicion-diagnos',
              operador: 'igual_a',
              valorTarget: 'Sí',
              accion: 'mostrar'
            }
          ]
        },
        {
          id: 'preg-salud-cronica',
          seccionId: 'sec-4-salud',
          tipo: 'lista',
          titulo: '¿Presenta alguna enfermedad crónica diagnosticada?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 3,
          categoria: 'Salud',
          variableEpidemiologica: true,
          factorEpidemiologico: 'enfermedad_cronica',
          opciones: [
            { id: 'opt-ecr1', label: 'Sí', value: 'Sí' },
            { id: 'opt-ecr2', label: 'No', value: 'No' },
            { id: 'opt-ecr3', label: 'Prefiero no responder', value: 'Prefiero no responder' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-salud-tipo-cronica',
          seccionId: 'sec-4-salud',
          tipo: 'multiple_seleccion',
          titulo: 'Seleccione la(s) enfermedad(es) crónica(s) diagnosticadas',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 4,
          categoria: 'Salud',
          opciones: [
            { id: 'opt-tc1', label: 'Hipertensión Arterial', value: 'Hipertensión' },
            { id: 'opt-tc2', label: 'Diabetes', value: 'Diabetes' },
            { id: 'opt-tc3', label: 'Asma / EPOC', value: 'Asma' },
            { id: 'opt-tc4', label: 'Enfermedad Cardiovascular', value: 'Enfermedad Cardiovascular' },
            { id: 'opt-tc5', label: 'Enfermedad Osteomuscular Crónica', value: 'Enfermedad Osteomuscular' },
            { id: 'opt-tc6', label: 'Migraña Crónica', value: 'Migraña' },
            { id: 'opt-tc7', label: 'Otra', value: 'Otra' }
          ],
          reglasDependencia: [
            {
              id: 'rule-cronica-si',
              preguntaOrigenId: 'preg-salud-cronica',
              operador: 'igual_a',
              valorTarget: 'Sí',
              accion: 'mostrar'
            }
          ]
        }
      ]
    },
    {
      id: 'sec-5-medicamentos',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 5: Medicamentos',
      descripcion: 'Uso permanente de medicamentos.',
      orden: 5,
      preguntas: [
        {
          id: 'preg-med-consume',
          seccionId: 'sec-5-medicamentos',
          tipo: 'lista',
          titulo: '¿Consume usted medicamentos de manera permanente o formulada?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Medicamentos',
          opciones: [
            { id: 'opt-med1', label: 'Sí', value: 'Sí' },
            { id: 'opt-med2', label: 'No', value: 'No' },
            { id: 'opt-med3', label: 'Prefiero no responder', value: 'Prefiero no responder' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-med-nombre',
          seccionId: 'sec-5-medicamentos',
          tipo: 'texto',
          titulo: 'Indique el o los medicamentos que consume',
          placeholder: 'Ej. Losartán 50mg, Metformina, etc.',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Medicamentos',
          reglasDependencia: [
            {
              id: 'rule-med-si',
              preguntaOrigenId: 'preg-med-consume',
              operador: 'igual_a',
              valorTarget: 'Sí',
              accion: 'mostrar'
            }
          ]
        }
      ]
    },
    {
      id: 'sec-6-alergias',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 6: Alergias',
      descripcion: 'Identificación de reacciones alérgicas conocidas.',
      orden: 6,
      preguntas: [
        {
          id: 'preg-alergia-presenta',
          seccionId: 'sec-6-alergias',
          tipo: 'lista',
          titulo: '¿Presenta alergias conocidas a alimentos, medicamentos o sustancias?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Alergias',
          opciones: [
            { id: 'opt-al1', label: 'Sí', value: 'Sí' },
            { id: 'opt-al2', label: 'No', value: 'No' },
            { id: 'opt-al3', label: 'Prefiero no responder', value: 'Prefiero no responder' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-alergia-tipo',
          seccionId: 'sec-6-alergias',
          tipo: 'multiple_seleccion',
          titulo: 'Seleccione los tipos de alergia presentados',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Alergias',
          opciones: [
            { id: 'opt-tal1', label: 'Respiratorias / Polen / Polvo', value: 'Respiratorias' },
            { id: 'opt-tal2', label: 'Alimentarias', value: 'Alimentarias' },
            { id: 'opt-tal3', label: 'Medicamentos (Ej. Penicilina)', value: 'Medicamentos' },
            { id: 'opt-tal4', label: 'Ambientales / Productos Químicos', value: 'Ambientales' },
            { id: 'opt-tal5', label: 'Otra', value: 'Otra' }
          ],
          reglasDependencia: [
            {
              id: 'rule-alergia-si',
              preguntaOrigenId: 'preg-alergia-presenta',
              operador: 'igual_a',
              valorTarget: 'Sí',
              accion: 'mostrar'
            }
          ]
        }
      ]
    },
    {
      id: 'sec-7-antecedentes',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 7: Antecedentes de Salud y Ocupacionales',
      descripcion: 'Historial de quirúrgicos, accidentes laborales e incapacidades.',
      orden: 7,
      preguntas: [
        {
          id: 'preg-ant-quirurgicos',
          seccionId: 'sec-7-antecedentes',
          tipo: 'sino',
          titulo: '¿Tiene antecedentes de procedimientos quirúrgicos?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Antecedentes',
          reglasDependencia: []
        },
        {
          id: 'preg-ant-acc-trabajo',
          seccionId: 'sec-7-antecedentes',
          tipo: 'sino',
          titulo: '¿Ha sufrido accidentes de trabajo en esta o en empresas anteriores?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Antecedentes',
          reglasDependencia: []
        },
        {
          id: 'preg-ant-enfermedad-lab',
          seccionId: 'sec-7-antecedentes',
          tipo: 'sino',
          titulo: '¿Tiene alguna enfermedad laboral calificada oficialmente?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 3,
          categoria: 'Antecedentes',
          reglasDependencia: []
        },
        {
          id: 'preg-ant-incapacidades',
          seccionId: 'sec-7-antecedentes',
          tipo: 'sino',
          titulo: '¿Ha presentado incapacidades médicas en los últimos 12 meses?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 4,
          categoria: 'Antecedentes',
          reglasDependencia: []
        }
      ]
    },
    {
      id: 'sec-8-osteomuscular',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 8: Condiciones Osteomusculares',
      descripcion: 'Sintomatología musculoesquelética durante los últimos 12 meses.',
      orden: 8,
      preguntas: [
        {
          id: 'preg-osteo-zonas',
          seccionId: 'sec-8-osteomuscular',
          tipo: 'multiple_seleccion',
          titulo: 'Durante los últimos 12 meses, ¿ha presentado molestias o dolor en alguna de las siguientes zonas corporal?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Osteomuscular',
          variableEpidemiologica: true,
          factorEpidemiologico: 'dolor_osteomuscular',
          opciones: [
            { id: 'opt-z1', label: 'Cuello', value: 'Cuello' },
            { id: 'opt-z2', label: 'Hombros', value: 'Hombros' },
            { id: 'opt-z3', label: 'Brazos / Codos / Antebrazos', value: 'Codos/Brazos' },
            { id: 'opt-z4', label: 'Muñecas / Manos', value: 'Muñecas/Manos' },
            { id: 'opt-z5', label: 'Espalda Alta / Cervical', value: 'Espalda alta' },
            { id: 'opt-z6', label: 'Espalda Media / Dorsal', value: 'Espalda media' },
            { id: 'opt-z7', label: 'Espalda Baja / Lumbar', value: 'Espalda baja/lumbar' },
            { id: 'opt-z8', label: 'Caderas / Rodillas / Pies', value: 'Extremidades inferiores' },
            { id: 'opt-z9', label: 'Ninguna zona', value: 'Ninguna' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-osteo-frecuencia',
          seccionId: 'sec-8-osteomuscular',
          tipo: 'lista',
          titulo: 'Frecuencia habitual de la molestia o dolor',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Osteomuscular',
          opciones: [
            { id: 'opt-of1', label: 'Ocasional (Pocas veces al mes)', value: 'Ocasional' },
            { id: 'opt-of2', label: 'Frecuente (Varias veces por semana)', value: 'Frecuente' },
            { id: 'opt-of3', label: 'Permanente (Diario)', value: 'Permanente' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-osteo-intensidad',
          seccionId: 'sec-8-osteomuscular',
          tipo: 'escala_numerica',
          titulo: 'Intensidad del dolor en escala de 0 (Sin dolor) a 10 (Dolor insoportable)',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 3,
          categoria: 'Osteomuscular',
          reglasDependencia: []
        }
      ]
    },
    {
      id: 'sec-9-visual',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 9: Salud Visual',
      descripcion: 'Uso de corrección óptica y molestias visuales laborales.',
      orden: 9,
      preguntas: [
        {
          id: 'preg-vis-gafas',
          seccionId: 'sec-9-visual',
          tipo: 'sino',
          titulo: '¿Utiliza gafas o lentes de contacto para trabajar o leer?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Salud Visual',
          reglasDependencia: []
        },
        {
          id: 'preg-vis-molestias',
          seccionId: 'sec-9-visual',
          tipo: 'sino',
          titulo: '¿Presenta molestias visuales durante la jornada laboral?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Salud Visual',
          reglasDependencia: []
        },
        {
          id: 'preg-vis-tipo-molestias',
          seccionId: 'sec-9-visual',
          tipo: 'multiple_seleccion',
          titulo: 'Seleccione las molestias visuales presentadas',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 3,
          categoria: 'Salud Visual',
          opciones: [
            { id: 'opt-tv1', label: 'Fatiga visual / Ojos cansados', value: 'Fatiga visual' },
            { id: 'opt-tv2', label: 'Visión borrosa', value: 'Visión borrosa' },
            { id: 'opt-tv3', label: 'Dolor de cabeza relacionado', value: 'Dolor de cabeza' },
            { id: 'opt-tv4', label: 'Ardor o lagrimeo', value: 'Ardor' },
            { id: 'opt-tv5', label: 'Sequedad ocular', value: 'Sequedad ocular' }
          ],
          reglasDependencia: [
            {
              id: 'rule-visual-si',
              preguntaOrigenId: 'preg-vis-molestias',
              operador: 'igual_a',
              valorTarget: 'Sí',
              accion: 'mostrar'
            }
          ]
        }
      ]
    },
    {
      id: 'sec-10-auditiva',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 10: Salud Auditiva',
      descripcion: 'Molestias auditivas y exposición perceptiva a ruido.',
      orden: 10,
      preguntas: [
        {
          id: 'preg-aud-molestias',
          seccionId: 'sec-10-auditiva',
          tipo: 'lista',
          titulo: '¿Presenta molestias auditivas o dificultad para escuchar?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Salud Auditiva',
          opciones: [
            { id: 'opt-am1', label: 'Sí', value: 'Sí' },
            { id: 'opt-am2', label: 'No', value: 'No' },
            { id: 'opt-am3', label: 'Prefiero no responder', value: 'Prefiero no responder' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-aud-tipo-molestias',
          seccionId: 'sec-10-auditiva',
          tipo: 'multiple_seleccion',
          titulo: 'Indique las molestias auditivas presentadas',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Salud Auditiva',
          opciones: [
            { id: 'opt-tam1', label: 'Zumbidos / Pitos en los oídos (Tinnitus)', value: 'Zumbidos' },
            { id: 'opt-tam2', label: 'Disminución de la audición', value: 'Disminución auditiva' },
            { id: 'opt-tam3', label: 'Sensación de oído tapado', value: 'Sensación de oído tapado' },
            { id: 'opt-tam4', label: 'Dolor de oído', value: 'Dolor de oído' }
          ],
          reglasDependencia: [
            {
              id: 'rule-aud-si',
              preguntaOrigenId: 'preg-aud-molestias',
              operador: 'igual_a',
              valorTarget: 'Sí',
              accion: 'mostrar'
            }
          ]
        }
      ]
    },
    {
      id: 'sec-11-sueno',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 11: Sueño y Recuperación',
      descripcion: 'Calidad de descanso y patrones de sueño.',
      orden: 11,
      preguntas: [
        {
          id: 'preg-sue-horas',
          seccionId: 'sec-11-sueno',
          tipo: 'lista',
          titulo: '¿Cuántas horas duerme normalmente por noche?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Sueño',
          opciones: [
            { id: 'opt-sh1', label: 'Menos de 5 horas', value: '<5h' },
            { id: 'opt-sh2', label: 'Entre 5 y 6 horas', value: '5-6h' },
            { id: 'opt-sh3', label: 'Entre 7 y 8 horas', value: '7-8h' },
            { id: 'opt-sh4', label: 'Más de 8 horas', value: '>8h' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-sue-reparador',
          seccionId: 'sec-11-sueno',
          tipo: 'lista',
          titulo: '¿Considera que su sueño es reparador y le permite descansar?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Sueño',
          opciones: [
            { id: 'opt-sr1', label: 'Sí', value: 'Sí' },
            { id: 'opt-sr2', label: 'No', value: 'No' },
            { id: 'opt-sr3', label: 'Algunas veces', value: 'Algunas veces' }
          ],
          reglasDependencia: []
        }
      ]
    },
    {
      id: 'sec-12-actividad-fisica',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 12: Actividad Física',
      descripcion: 'Práctica de ejercicio y nivel de sedentarismo.',
      orden: 12,
      preguntas: [
        {
          id: 'preg-act-realiza',
          seccionId: 'sec-12-actividad-fisica',
          tipo: 'sino',
          titulo: '¿Realiza usted actividad física o deporte de manera regular?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Actividad Física',
          variableEpidemiologica: true,
          factorEpidemiologico: 'sedentarismo',
          reglasDependencia: []
        },
        {
          id: 'preg-act-frecuencia',
          seccionId: 'sec-12-actividad-fisica',
          tipo: 'lista',
          titulo: 'Frecuencia semanal de la actividad física',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Actividad Física',
          opciones: [
            { id: 'opt-af1', label: '1 día por semana', value: '1 día' },
            { id: 'opt-af2', label: '2 días por semana', value: '2 días' },
            { id: 'opt-af3', label: '3 días por semana', value: '3 días' },
            { id: 'opt-af4', label: '4 días por semana', value: '4 días' },
            { id: 'opt-af5', label: '5 o más días por semana', value: '5+ días' }
          ],
          reglasDependencia: [
            {
              id: 'rule-act-si',
              preguntaOrigenId: 'preg-act-realiza',
              operador: 'igual_a',
              valorTarget: 'Sí',
              accion: 'mostrar'
            }
          ]
        },
        {
          id: 'preg-act-duracion',
          seccionId: 'sec-12-actividad-fisica',
          tipo: 'lista',
          titulo: 'Duración aproximada por sesión de ejercicio',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 3,
          categoria: 'Actividad Física',
          opciones: [
            { id: 'opt-ad1', label: 'Menos de 30 minutos', value: '<30 min' },
            { id: 'opt-ad2', label: 'Entre 30 y 60 minutos', value: '30-60 min' },
            { id: 'opt-ad3', label: 'Más de 60 minutos', value: '>60 min' }
          ],
          reglasDependencia: [
            {
              id: 'rule-act-si2',
              preguntaOrigenId: 'preg-act-realiza',
              operador: 'igual_a',
              valorTarget: 'Sí',
              accion: 'mostrar'
            }
          ]
        }
      ]
    },
    {
      id: 'sec-13-habitos',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 13: Hábitos y Estilos de Vida',
      descripcion: 'Consumo de sustancias y hábitos alimenticios.',
      orden: 13,
      preguntas: [
        {
          id: 'preg-hab-fuma',
          seccionId: 'sec-13-habitos',
          tipo: 'lista',
          titulo: '¿Consume usted productos de tabaco o cigarrillos?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Hábitos',
          variableEpidemiologica: true,
          factorEpidemiologico: 'consumo_tabaco',
          opciones: [
            { id: 'opt-hf1', label: 'Sí', value: 'Sí' },
            { id: 'opt-hf2', label: 'No', value: 'No' },
            { id: 'opt-hf3', label: 'Prefiero no responder', value: 'Prefiero no responder' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-hab-alcohol',
          seccionId: 'sec-13-habitos',
          tipo: 'lista',
          titulo: '¿Con qué frecuencia consume bebidas alcohólicas?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Hábitos',
          opciones: [
            { id: 'opt-ha1', label: 'Nunca / Abstemio', value: 'Nunca' },
            { id: 'opt-ha2', label: 'Ocasionalmente / Social', value: 'Ocasional' },
            { id: 'opt-ha3', label: 'Frecuente (Semanal)', value: 'Frecuente' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-hab-alimentacion',
          seccionId: 'sec-13-habitos',
          tipo: 'lista',
          titulo: '¿Cómo califica la calidad general de sus hábitos de alimentación?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 3,
          categoria: 'Hábitos',
          opciones: [
            { id: 'opt-hali1', label: 'Saludable y balanceada', value: 'Saludable' },
            { id: 'opt-hali2', label: 'Aceptable', value: 'Aceptable' },
            { id: 'opt-hali3', label: 'Poco saludable / Desordenada', value: 'Poco saludable' }
          ],
          reglasDependencia: []
        }
      ]
    },
    {
      id: 'sec-14-vivienda',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 14: Información de Vivienda y Entorno',
      descripcion: 'Servicios básicos y condiciones de habitabilidad.',
      orden: 14,
      preguntas: [
        {
          id: 'preg-viv-tenencia',
          seccionId: 'sec-14-vivienda',
          tipo: 'lista',
          titulo: 'Tenencia y modalidad de la vivienda',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Vivienda',
          opciones: [
            { id: 'opt-vt1', label: 'Propia', value: 'Propia' },
            { id: 'opt-vt2', label: 'Arrendada', value: 'Arrendada' },
            { id: 'opt-vt3', label: 'Familiar', value: 'Familiar' },
            { id: 'opt-vt4', label: 'Otra', value: 'Otra' }
          ],
          reglasDependencia: []
        },
        {
          id: 'preg-viv-servicios',
          seccionId: 'sec-14-vivienda',
          tipo: 'sino',
          titulo: '¿Cuenta la vivienda con servicios públicos básicos completos (Agua, Energía, Gas, Alcantarillado)?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Vivienda',
          reglasDependencia: []
        }
      ]
    },
    {
      id: 'sec-15-teletrabajo',
      encuestaId: 'tpl-sociodemografica-sgsst',
      titulo: 'Sección 15: Información para Teletrabajo / Trabajo en Casa',
      descripcion: 'Evaluación de condiciones ergonómicas en puestos de trabajo remotos.',
      orden: 15,
      preguntas: [
        {
          id: 'preg-tele-aplica',
          seccionId: 'sec-15-teletrabajo',
          tipo: 'sino',
          titulo: '¿Labora usted en modalidad Teletrabajo, Trabajo en Casa o Híbrido?',
          obligatoria: true,
          visible: true,
          editable: true,
          orden: 1,
          categoria: 'Teletrabajo',
          reglasDependencia: []
        },
        {
          id: 'preg-tele-espacio',
          seccionId: 'sec-15-teletrabajo',
          tipo: 'lista',
          titulo: 'Tipo de espacio destinado para trabajar en casa',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 2,
          categoria: 'Teletrabajo',
          opciones: [
            { id: 'opt-te1', label: 'Habitación o estudio independiente', value: 'Independiente' },
            { id: 'opt-te2', label: 'Espacio compartido / Sala', value: 'Compartido' },
            { id: 'opt-te3', label: 'Comedor / Mesa auxiliar', value: 'Comedor' }
          ],
          reglasDependencia: [
            {
              id: 'rule-tele-si1',
              preguntaOrigenId: 'preg-tele-aplica',
              operador: 'igual_a',
              valorTarget: 'Sí',
              accion: 'mostrar'
            }
          ]
        },
        {
          id: 'preg-tele-silla',
          seccionId: 'sec-15-teletrabajo',
          tipo: 'lista',
          titulo: 'Tipo de silla utilizada en el puesto de trabajo en casa',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 3,
          categoria: 'Teletrabajo',
          opciones: [
            { id: 'opt-ts1', label: 'Silla ergonómica de oficina ajustable', value: 'Ergonómica' },
            { id: 'opt-ts2', label: 'Silla convencional de comedor o cocina', value: 'Convencional' },
            { id: 'opt-ts3', label: 'Banqueta o silla auxiliar', value: 'Auxiliar' }
          ],
          reglasDependencia: [
            {
              id: 'rule-tele-si2',
              preguntaOrigenId: 'preg-tele-aplica',
              operador: 'igual_a',
              valorTarget: 'Sí',
              accion: 'mostrar'
            }
          ]
        },
        {
          id: 'preg-tele-pausas',
          seccionId: 'sec-15-teletrabajo',
          tipo: 'lista',
          titulo: '¿Realiza pausas activas durante la jornada remota?',
          obligatoria: false,
          visible: true,
          editable: true,
          orden: 4,
          categoria: 'Teletrabajo',
          opciones: [
            { id: 'opt-tp1', label: 'Sí, frecuentemente', value: 'Sí frecuentemente' },
            { id: 'opt-tp2', label: 'Ocasionalmente', value: 'Ocasionalmente' },
            { id: 'opt-tp3', label: 'No realizo pausas activas', value: 'No realizo' }
          ],
          reglasDependencia: [
            {
              id: 'rule-tele-si3',
              preguntaOrigenId: 'preg-tele-aplica',
              operador: 'igual_a',
              valorTarget: 'Sí',
              accion: 'mostrar'
            }
          ]
        }
      ]
    }
  ]
};
