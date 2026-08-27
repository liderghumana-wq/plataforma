import { Recurso, RecursoCategoria } from '../biblioteca.types';

export const CATEGORIAS_LIB: { id: RecursoCategoria; label: string; bg: string; text: string; border: string; desc: string }[] = [
  {
    id: 'sg_sst',
    label: 'SG-SST',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-100',
    desc: 'Sistema de Gestión de la Seguridad y Salud en el Trabajo.'
  },
  {
    id: 'capital_humano',
    label: 'Capital Humano',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-100',
    desc: 'Gestión del talento, estabilidad, contratación y desarrollo.'
  },
  {
    id: 'clima',
    label: 'Clima Organizacional',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-100',
    desc: 'Medición de la satisfacción, liderazgo y cultura interna.'
  },
  {
    id: 'bienestar',
    label: 'Bienestar',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-100',
    desc: 'Calidad de vida, hábitos saludables y balance vida-trabajo.'
  },
  {
    id: 'riesgo_psicosocial',
    label: 'Riesgo Psicosocial',
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-100',
    desc: 'Identificación, evaluación y monitoreo de factores intra y extralaborales.'
  },
  {
    id: 'iso_45001',
    label: 'ISO 45001',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-100',
    desc: 'Norma internacional para sistemas de gestión de seguridad y salud en el trabajo.'
  },
  {
    id: 'iso_9001',
    label: 'ISO 9001',
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-100',
    desc: 'Norma internacional para sistemas de gestión de la calidad.'
  },
  {
    id: 'iso_14001',
    label: 'ISO 14001',
    bg: 'bg-teal-50',
    text: 'text-teal-700',
    border: 'border-teal-100',
    desc: 'Norma internacional para sistemas de gestión ambiental.'
  },
  {
    id: 'normatividad_co',
    label: 'Normatividad CO',
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-150',
    desc: 'Leyes, decretos y resoluciones aplicables en el ámbito laboral de Colombia.'
  }
];

export const MOCK_RECURSOS: Recurso[] = [
  // SG-SST
  {
    id: 'rec-1',
    titulo: 'Manual de Estándares Mínimos SG-SST',
    categoria: 'sg_sst',
    descripcion: 'Guía detallada de implementación para el cumplimiento de los Estándares Mínimos del Sistema de Gestión de Seguridad y Salud en el Trabajo.',
    tipo: 'pdf',
    archivo: 'manual_estandares_minimos_sgsst.pdf',
    archivoSize: '2.4 MB',
    etiquetas: ['Estándares Mínimos', 'Resolución 0312', 'Cumplimiento', 'Salud Laboral'],
    fechaCarga: '10/01/2026',
    descargas: 142,
    esDestacado: true
  },
  {
    id: 'rec-2',
    titulo: 'Plantilla de Reporte de Actos e Condiciones Inseguras',
    categoria: 'sg_sst',
    descripcion: 'Formato descargable en Excel para que los supervisores y colaboradores reporten condiciones subestándar en las diferentes áreas de la empresa.',
    tipo: 'excel',
    archivo: 'formato_reporte_actos_condiciones_inseguras.xlsx',
    archivoSize: '185 KB',
    etiquetas: ['Autoreporte', 'Prevención', 'Inspección', 'COPASST'],
    fechaCarga: '15/02/2026',
    descargas: 89
  },
  
  // Capital Humano
  {
    id: 'rec-3',
    titulo: 'Protocolo de Onboarding y Acogida de Nuevos Talentos',
    categoria: 'capital_humano',
    descripcion: 'Documento estructurado con el paso a paso del proceso de inducción y socialización para retener talento en su primer año crítico.',
    tipo: 'pdf',
    archivo: 'protocolo_onboarding_happyinsight.pdf',
    archivoSize: '1.1 MB',
    etiquetas: ['Onboarding', 'Retención', 'Inducción', 'Cultura'],
    fechaCarga: '20/01/2026',
    descargas: 67,
    esDestacado: true
  },
  {
    id: 'rec-4',
    titulo: 'Plantilla de Plan Individual de Desarrollo Profesional (PIP)',
    categoria: 'capital_humano',
    descripcion: 'Estructura metodológica para acordar planes de crecimiento, capacitación y metas con colaboradores de alto potencial.',
    tipo: 'word',
    archivo: 'plan_individual_desarrollo.docx',
    archivoSize: '320 KB',
    etiquetas: ['Desarrollo', 'Capacitación', 'Desempeño', 'Fidelización'],
    fechaCarga: '11/03/2026',
    descargas: 53
  },

  // Clima Organizacional
  {
    id: 'rec-5',
    titulo: 'Metodología de Medición eNPS (Employee Net Promoter Score)',
    categoria: 'clima',
    descripcion: 'Guía técnica para interpretar los resultados de orgullo de pertenencia e identificar los principales detractores de la marca empleadora.',
    tipo: 'pdf',
    archivo: 'guia_tecnica_enps_organizacional.pdf',
    archivoSize: '850 KB',
    etiquetas: ['eNPS', 'Orgullo', 'Satisfacción', 'Lealtad'],
    fechaCarga: '05/02/2026',
    descargas: 120
  },

  // Bienestar
  {
    id: 'rec-6',
    titulo: 'Cartilla de Pausas Activas y Gimnasia Laboral',
    categoria: 'bienestar',
    descripcion: 'Ejercicios prácticos ilustrados para realizar en la oficina o teletrabajo enfocados en mitigar dolores osteomusculares lumbares y cervicales.',
    tipo: 'pdf',
    archivo: 'cartilla_pausas_activas_ergonómicas.pdf',
    archivoSize: '4.8 MB',
    etiquetas: ['Pausas Activas', 'Ergonomía', 'Salud Física', 'SST'],
    fechaCarga: '22/01/2026',
    descargas: 215,
    esDestacado: true
  },

  // Riesgo Psicosocial
  {
    id: 'rec-7',
    titulo: 'Batería de Instrumentos para Evaluación de Riesgo Psicosocial',
    categoria: 'riesgo_psicosocial',
    descripcion: 'Manual de aplicación de la batería del Ministerio de Trabajo de Colombia para evaluar factores intralaborales, extralaborales y estrés.',
    tipo: 'pdf',
    archivo: 'bateria_riesgo_psicosocial_mintrabajo.pdf',
    archivoSize: '5.2 MB',
    etiquetas: ['Psicosocial', 'Estrés', 'Ministerio de Trabajo', 'Salud Mental'],
    fechaCarga: '03/01/2026',
    descargas: 310,
    esDestacado: true
  },
  {
    id: 'rec-8',
    titulo: 'Protocolo de Prevención de Acoso Laboral y Comité de Convivencia',
    categoria: 'riesgo_psicosocial',
    descripcion: 'Directrices institucionales para la constitución y funcionamiento del Comité de Convivencia Laboral conforme a la Ley 1010 de 2006.',
    tipo: 'word',
    archivo: 'protocolo_comite_convivencia_laboral.docx',
    archivoSize: '410 KB',
    etiquetas: ['Convivencia', 'Ley 1010', 'Acoso Laboral', 'Comité'],
    fechaCarga: '14/02/2026',
    descargas: 78
  },

  // ISO 45001
  {
    id: 'rec-9',
    titulo: 'Matriz de Identificación de Peligros y Valoración de Riesgos (ISO 45001)',
    categoria: 'iso_45001',
    descripcion: 'Estructura conceptual y práctica para mapear riesgos basada en los requisitos de la norma ISO 45001:2018.',
    tipo: 'excel',
    archivo: 'matriz_peligros_valoracion_riesgos_iso45001.xlsx',
    archivoSize: '710 KB',
    etiquetas: ['ISO 45001', 'Matriz de Peligros', 'SST', 'Mejora Continua'],
    fechaCarga: '18/02/2026',
    descargas: 184,
    esDestacado: true
  },

  // ISO 9001
  {
    id: 'rec-10',
    titulo: 'Guía de Auditoría Interna del Sistema de Gestión de Calidad (ISO 9001)',
    categoria: 'iso_9001',
    descripcion: 'Lista de chequeo y pautas metodológicas para evaluar la conformidad de los procesos clave bajo la norma ISO 9001:2015.',
    tipo: 'pdf',
    archivo: 'guia_auditoria_interna_calidad.pdf',
    archivoSize: '1.5 MB',
    etiquetas: ['ISO 9001', 'Calidad', 'Auditoría', 'Procesos'],
    fechaCarga: '25/02/2026',
    descargas: 93
  },

  // ISO 14001
  {
    id: 'rec-11',
    titulo: 'Plan de Manejo Ambiental y Residuos Corporativos (ISO 14001)',
    categoria: 'iso_14001',
    descripcion: 'Manual de segregación en la fuente, ahorro de energía, agua y reducción de huella de carbono de conformidad con la ISO 14001:2015.',
    tipo: 'pdf',
    archivo: 'plan_manejo_ambiental_iso14001.pdf',
    archivoSize: '1.9 MB',
    etiquetas: ['ISO 14001', 'Ambiental', 'Residuos', 'Sostenibilidad'],
    fechaCarga: '04/03/2026',
    descargas: 64
  },

  // Normatividad Colombiana
  {
    id: 'rec-12',
    titulo: 'Decreto Único Reglamentario del Sector Trabajo (Decreto 1072 de 2015)',
    categoria: 'normatividad_co',
    descripcion: 'Compilado completo de las normas laborales y del Sistema de Gestión de la Seguridad y Salud en el Trabajo obligatorio en Colombia.',
    tipo: 'pdf',
    archivo: 'decreto_1072_de_2015_colombia.pdf',
    archivoSize: '8.4 MB',
    etiquetas: ['Decreto 1072', 'Normatividad Obligatoria', 'Colombia', 'Legal'],
    fechaCarga: '02/01/2026',
    descargas: 420,
    esDestacado: true
  },
  {
    id: 'rec-13',
    titulo: 'Resolución 0312 de 2019 - Estándares Mínimos del SG-SST',
    categoria: 'normatividad_co',
    descripcion: 'Resolución nacional que define las fases, plazos y estándares mínimos aplicables según el número de trabajadores y clase de riesgo de la empresa.',
    tipo: 'pdf',
    archivo: 'resolucion_0312_de_2019.pdf',
    archivoSize: '1.8 MB',
    etiquetas: ['Resolución 0312', 'Estándares Mínimos', 'Fases de Implementación', 'Cumplimiento'],
    fechaCarga: '09/01/2026',
    descargas: 355
  }
];
