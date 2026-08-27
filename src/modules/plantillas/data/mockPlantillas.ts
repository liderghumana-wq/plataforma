import { Plantilla, PlantillaCategoria, PlantillaTipo } from '../plantillas.types';

export const CATEGORIAS_PLANTILLAS: { id: PlantillaCategoria; label: string; bg: string; text: string; border: string; desc: string }[] = [
  {
    id: 'capital_humano',
    label: 'Capital Humano',
    bg: 'bg-indigo-50/70',
    text: 'text-indigo-700',
    border: 'border-indigo-100',
    desc: 'Formatos, encuestas y planes para desarrollo del talento, onboarding y clima laboral.'
  },
  {
    id: 'sg_sst',
    label: 'SG-SST',
    bg: 'bg-rose-50/70',
    text: 'text-rose-700',
    border: 'border-rose-100',
    desc: 'Procedimientos, matrices de peligro, cronogramas y reportes del Sistema de Gestión.'
  },
  {
    id: 'calidad',
    label: 'Calidad (ISO 9001)',
    bg: 'bg-cyan-50/70',
    text: 'text-cyan-700',
    border: 'border-cyan-100',
    desc: 'Documentación de procesos, auditorías internas, formatos de no conformidad y mejora.'
  },
  {
    id: 'ambiental',
    label: 'Ambiental (ISO 14001)',
    bg: 'bg-emerald-50/70',
    text: 'text-emerald-700',
    border: 'border-emerald-100',
    desc: 'Planes de manejo de residuos, matrices de aspectos ambientales y consumos corporativos.'
  },
  {
    id: 'legal',
    label: 'Legal y Normatividad',
    bg: 'bg-slate-50/70',
    text: 'text-slate-700',
    border: 'border-slate-150',
    desc: 'Políticas corporativas, códigos de ética y formatos de cumplimiento normativo colombiano.'
  }
];

export const TIPOS_PLANTILLAS: { id: PlantillaTipo; label: string; bg: string; text: string; desc: string }[] = [
  { id: 'encuesta', label: 'Encuestas', bg: 'bg-violet-50', text: 'text-violet-700', desc: 'Evaluaciones y encuestas de percepción.' },
  { id: 'formato', label: 'Formatos', bg: 'bg-blue-50', text: 'text-blue-700', desc: 'Plantillas de recolección de datos y registros.' },
  { id: 'matriz', label: 'Matrices', bg: 'bg-amber-50', text: 'text-amber-700', desc: 'Estructuras de análisis y evaluación.' },
  { id: 'procedimiento', label: 'Procedimientos', bg: 'bg-emerald-50', text: 'text-emerald-700', desc: 'Instrucciones de trabajo y guías de paso a paso.' },
  { id: 'politica', label: 'Políticas', bg: 'bg-purple-50', text: 'text-purple-700', desc: 'Lineamientos y normatividad de obligatorio cumplimiento.' },
  { id: 'plan_accion', label: 'Planes de Acción', bg: 'bg-pink-50', text: 'text-pink-700', desc: 'Formulaciones tácticas de mejora y metas.' },
  { id: 'cronograma', label: 'Cronogramas', bg: 'bg-teal-50', text: 'text-teal-700', desc: 'Planeación de tiempos y entregas de actividades.' },
  { id: 'informe', label: 'Informes', bg: 'bg-rose-50', text: 'text-rose-700', desc: 'Reportes, resúmenes analíticos y KPIs.' }
];

export const MOCK_PLANTILLAS: Plantilla[] = [
  // Encuestas
  {
    id: 'plt-1',
    titulo: 'Encuesta de Clima Organizacional Completa',
    tipo: 'encuesta',
    categoria: 'capital_humano',
    descripcion: 'Instrumento de 45 preguntas para medir liderazgo, comunicación, remuneración, desarrollo profesional y balance vida-trabajo.',
    extension: 'xlsx',
    tamano: '340 KB',
    descargas: 142,
    etiquetas: ['Clima Organizacional', 'Encuesta', 'eNPS', 'Liderazgo'],
    fechaActualizacion: '12/03/2026',
    version: '2.1',
    esObligatorio: true
  },
  {
    id: 'plt-2',
    titulo: 'Evaluación de Satisfacción de Capacitaciones',
    tipo: 'encuesta',
    categoria: 'capital_humano',
    descripcion: 'Formato ágil para aplicar después de cada sesión de formación interna o externa, evaluando conferencista, contenido y aplicabilidad.',
    extension: 'docx',
    tamano: '125 KB',
    descargas: 65,
    etiquetas: ['Feedback', 'Capacitación', 'Evaluación', 'Inducción'],
    fechaActualizacion: '20/01/2026',
    version: '1.0'
  },

  // Formatos
  {
    id: 'plt-3',
    titulo: 'Formato de Inspección Planeada de Seguridad',
    tipo: 'formato',
    categoria: 'sg_sst',
    descripcion: 'Registro físico o digital para que los líderes de COPASST realicen la revisión mensual de extintores, rutas de evacuación y botiquines.',
    extension: 'xlsx',
    tamano: '210 KB',
    descargas: 112,
    etiquetas: ['Inspección', 'EPI', 'COPASST', 'Seguridad'],
    fechaActualizacion: '15/02/2026',
    version: '3.0',
    esObligatorio: true
  },
  {
    id: 'plt-4',
    titulo: 'Formato de Registro de Entrega de EPP (Elementos de Protección Personal)',
    tipo: 'formato',
    categoria: 'sg_sst',
    descripcion: 'Firma de recibido por parte de los trabajadores, cumpliendo con los requerimientos de la normatividad colombiana y firmas de responsabilidad.',
    extension: 'pdf',
    tamano: '480 KB',
    descargas: 195,
    etiquetas: ['EPP', 'Firmas', 'Entrega', 'Legal'],
    fechaActualizacion: '10/01/2026',
    version: '1.5',
    esObligatorio: true
  },
  {
    id: 'plt-5',
    titulo: 'Formato de Reporte de Hallazgos y No Conformidades',
    tipo: 'formato',
    categoria: 'calidad',
    descripcion: 'Registro oficial para detallar una no conformidad evidenciada en procesos, especificando causa raíz y corrección inmediata.',
    extension: 'docx',
    tamano: '95 KB',
    descargas: 78,
    etiquetas: ['No Conformidad', 'ISO 9001', 'Mejora Continua', 'Auditoría'],
    fechaActualizacion: '01/04/2026',
    version: '2.0'
  },

  // Matrices
  {
    id: 'plt-6',
    titulo: 'Matriz de Identificación de Peligros, Evaluación y Valoración de Riesgos (GTC 45)',
    tipo: 'matriz',
    categoria: 'sg_sst',
    descripcion: 'Estructura parametrizada en Excel basada en la guía GTC 45 para cuantificar riesgos biológicos, físicos, químicos, ergonómicos y mecánicos.',
    extension: 'xlsx',
    tamano: '1.2 MB',
    descargas: 345,
    etiquetas: ['GTC 45', 'Riesgos', 'Matriz de Peligros', 'SST'],
    fechaActualizacion: '18/02/2026',
    version: '4.2',
    esObligatorio: true
  },
  {
    id: 'plt-7',
    titulo: 'Matriz de Identificación de Aspectos e Impactos Ambientales',
    tipo: 'matriz',
    categoria: 'ambiental',
    descripcion: 'Plantilla de evaluación cuantitativa del impacto de la organización en emisiones, consumo de agua, energía, papel y vertimientos.',
    extension: 'xlsx',
    tamano: '850 KB',
    descargas: 98,
    etiquetas: ['Aspectos Ambientales', 'Impacto', 'ISO 14001', 'Sostenibilidad'],
    fechaActualizacion: '28/02/2026',
    version: '1.2'
  },
  {
    id: 'plt-8',
    titulo: 'Matriz de Requisitos Legales Vigentes en Colombia',
    tipo: 'matriz',
    categoria: 'legal',
    descripcion: 'Estructura para registrar las normas, decretos y leyes aplicables a la empresa, evaluando el nivel de cumplimiento actual.',
    extension: 'xlsx',
    tamano: '980 KB',
    descargas: 220,
    etiquetas: ['Requisitos Legales', 'Matriz Legal', 'Decreto 1072', 'Cumplimiento'],
    fechaActualizacion: '05/01/2026',
    version: '2026.1',
    esObligatorio: true
  },

  // Procedimientos
  {
    id: 'plt-9',
    titulo: 'Procedimiento para Trabajo Seguro en Alturas',
    tipo: 'procedimiento',
    categoria: 'sg_sst',
    descripcion: 'Manual operativo de seguridad obligatorio que especifica los permisos de altura, líneas de vida autorizadas y sistemas de anclaje.',
    extension: 'pdf',
    tamano: '1.4 MB',
    descargas: 154,
    etiquetas: ['Alturas', 'Trabajo Seguro', 'Permiso', 'SST'],
    fechaActualizacion: '14/03/2026',
    version: '3.1',
    esObligatorio: true
  },
  {
    id: 'plt-10',
    titulo: 'Procedimiento de Inducción y Reinducción de Personal',
    tipo: 'procedimiento',
    categoria: 'capital_humano',
    descripcion: 'Protocolo de bienvenida, inducción general y técnica que deben pasar todos los trabajadores contratados al iniciar labores.',
    extension: 'docx',
    tamano: '280 KB',
    descargas: 83,
    etiquetas: ['Inducción', 'Onboarding', 'Talento Humano', 'Capacitación'],
    fechaActualizacion: '22/01/2026',
    version: '2.0'
  },

  // Políticas
  {
    id: 'plt-11',
    titulo: 'Política de Seguridad y Salud en el Trabajo (SST)',
    tipo: 'politica',
    categoria: 'sg_sst',
    descripcion: 'Declaración oficial firmada por la gerencia general comprometiéndose con la prevención de incidentes, lesiones y mejora del sistema.',
    extension: 'docx',
    tamano: '110 KB',
    descargas: 175,
    etiquetas: ['Política SST', 'Firmada', 'Gerencia', 'Compromiso'],
    fechaActualizacion: '02/01/2026',
    version: '5.0',
    esObligatorio: true
  },
  {
    id: 'plt-12',
    titulo: 'Código de Conducta Ética y Convivencia Laboral',
    tipo: 'politica',
    categoria: 'legal',
    descripcion: 'Valores corporativos, prohibición de sobornos, conflictos de interés, pautas de respeto mutuo y canales oficiales de denuncia confidencial.',
    extension: 'pdf',
    tamano: '680 KB',
    descargas: 110,
    etiquetas: ['Ética', 'Código de Conducta', 'Canal de Denuncias', 'Gobierno Corporativo'],
    fechaActualizacion: '10/01/2026',
    version: '2.0',
    esObligatorio: true
  },

  // Planes de Acción
  {
    id: 'plt-13',
    titulo: 'Plan de Acción y Acciones Correctivas / Preventivas (CAPA)',
    tipo: 'plan_accion',
    categoria: 'calidad',
    descripcion: 'Plantilla de planeación para desplegar acciones ante auditorías fallidas, quejas de clientes o incidentes internos.',
    extension: 'xlsx',
    tamano: '180 KB',
    descargas: 124,
    etiquetas: ['Plan de Acción', 'CAPA', 'Acción Correctiva', 'Mejora'],
    fechaActualizacion: '05/03/2026',
    version: '1.4'
  },
  {
    id: 'plt-14',
    titulo: 'Plan de Preparación y Respuesta ante Emergencias',
    tipo: 'plan_accion',
    categoria: 'sg_sst',
    descripcion: 'Formato estructurado para la conformación de brigadas de emergencia, protocolos ante sismos, incendios y primeros auxilios.',
    extension: 'docx',
    tamano: '1.1 MB',
    descargas: 162,
    etiquetas: ['Emergencias', 'Simulacro', 'Brigadas', 'Primeros Auxilios'],
    fechaActualizacion: '20/02/2026',
    version: '3.0',
    esObligatorio: true
  },

  // Cronogramas
  {
    id: 'plt-15',
    titulo: 'Cronograma y Plan de Trabajo Anual SG-SST',
    tipo: 'cronograma',
    categoria: 'sg_sst',
    descripcion: 'Gantt anual detallado con las actividades de capacitación, simulacros, exámenes médicos, auditorías e inspecciones obligatorias.',
    extension: 'xlsx',
    tamano: '750 KB',
    descargas: 285,
    etiquetas: ['Cronograma Anual', 'Gantt', 'Plan de Trabajo', 'Hitos'],
    fechaActualizacion: '02/01/2026',
    version: '2026.1',
    esObligatorio: true
  },
  {
    id: 'plt-16',
    titulo: 'Plan de Capacitación y Formación Corporativa Anual',
    tipo: 'cronograma',
    categoria: 'capital_humano',
    descripcion: 'Organizador mensual de capacitaciones obligatorias y de crecimiento para certificar horas requeridas de los trabajadores.',
    extension: 'xlsx',
    tamano: '310 KB',
    descargas: 92,
    etiquetas: ['Capacitación', 'Entrenamiento', 'Cronograma', 'Indicador'],
    fechaActualizacion: '15/01/2026',
    version: '2.0'
  },

  // Informes
  {
    id: 'plt-17',
    titulo: 'Informe de Revisión por la Alta Dirección',
    tipo: 'informe',
    categoria: 'calidad',
    descripcion: 'Estructura formal para presentar a la gerencia el balance de auditorías, objetivos cumplidos, estado de no conformidades e inversiones.',
    extension: 'docx',
    tamano: '450 KB',
    descargas: 138,
    etiquetas: ['Informe Dirección', 'Alta Dirección', 'Revisión Anual', 'Resultados'],
    fechaActualizacion: '10/03/2026',
    version: '3.0'
  },
  {
    id: 'plt-18',
    titulo: 'Informe de Rendición de Cuentas del SG-SST',
    tipo: 'informe',
    categoria: 'sg_sst',
    descripcion: 'Reporte para documentar el desempeño individual y grupal en las responsabilidades del sistema de gestión ante las autoridades.',
    extension: 'docx',
    tamano: '290 KB',
    descargas: 154,
    etiquetas: ['Rendición de Cuentas', 'SST', 'Legal', 'Responsabilidades'],
    fechaActualizacion: '20/01/2026',
    version: '1.2',
    esObligatorio: true
  }
];
