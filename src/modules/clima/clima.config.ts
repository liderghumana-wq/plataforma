import { ClimateDimension, ClimateQuestion } from './clima.types';

export const DEFAULT_CLIMA_DIMENSIONS: ClimateDimension[] = [
  {
    id: 'comunicacion',
    name: 'Comunicación Organizacional',
    description: 'Flujo de información, transparencia, canales internos de comunicación y libertad de opinión.',
    questions: ['com_1', 'com_2']
  },
  {
    id: 'liderazgo',
    name: 'Liderazgo y Dirección',
    description: 'Estilo de dirección, confianza en las decisiones de la gerencia y visión inspiradora.',
    questions: ['lid_1', 'lid_2']
  },
  {
    id: 'trabajo_equipo',
    name: 'Trabajo en Equipo y Colaboración',
    description: 'Cooperación, cohesión grupal, apoyo recíproco y sinergia entre áreas de la organización.',
    questions: ['eqp_1', 'eqp_2']
  },
  {
    id: 'reconocimiento',
    name: 'Reconocimiento y Compensación',
    description: 'Valoración del esfuerzo personal, recompensas por desempeño equitativo y salario emocional.',
    questions: ['rec_1', 'rec_2']
  },
  {
    id: 'bienestar',
    name: 'Bienestar Organizacional',
    description: 'Programas de salud, actividades lúdicas, cuidado preventivo del personal y calidad de vida.',
    questions: ['bie_1', 'bie_2']
  },
  {
    id: 'condiciones_trabajo',
    name: 'Condiciones de Trabajo y Recursos',
    description: 'Herramientas tecnológicas, idoneidad de suministros, espacio físico y ergonomía postural.',
    questions: ['con_1', 'con_2']
  },
  {
    id: 'desarrollo_profesional',
    name: 'Desarrollo Profesional y Capacitación',
    description: 'Capacitación constante, planes de formación y oportunidades de ascenso o plan de carrera.',
    questions: ['des_1', 'des_2']
  },
  {
    id: 'compromiso',
    name: 'Compromiso Organizacional',
    description: 'Alineación personal con la misión corporativa, sentido de pertenencia y disposición de esfuerzo adicional.',
    questions: ['cmp_1', 'cmp_2']
  },
  {
    id: 'motivacion',
    name: 'Motivación Laboral',
    description: 'Entusiasmo diario, nivel de inspiración por la labor y satisfacción intrínseca.',
    questions: ['mot_1', 'mot_2']
  },
  {
    id: 'relacion_jefe',
    name: 'Relación con el Jefe Inmediato',
    description: 'Trato respetuoso, empatía, retroalimentación formativa y apoyo continuo del supervisor.',
    questions: ['jef_1', 'jef_2']
  },
  {
    id: 'relacion_companeros',
    name: 'Relación con Compañeros',
    description: 'Clima de convivencia, compañerismo armónico, confianza, respeto mutuo y solidaridad colectiva.',
    questions: ['cop_1', 'cop_2']
  },
  {
    id: 'carga_laboral',
    name: 'Carga Laboral y Distribución',
    description: 'Distribución justa de actividades, volumen razonable de tareas y asignación de metas cumplibles.',
    questions: ['car_1', 'car_2']
  },
  {
    id: 'equilibrio_vida_trabajo',
    name: 'Equilibrio Vida-Trabajo',
    description: 'Respeto a horarios oficiales, descanso, no interferencia con compromisos familiares o personales.',
    questions: ['equ_1', 'equ_2']
  },
  {
    id: 'sentido_pertenencia',
    name: 'Sentido de Pertenencia',
    description: 'Orgullo de representar a la empresa, lealtad y recomendación laboral de la compañía.',
    questions: ['per_1', 'per_2']
  },
  {
    id: 'cultura_organizacional',
    name: 'Cultura Organizacional',
    description: 'Vivencia cotidiana de valores institucionales, diversidad, inclusión y ética corporativa.',
    questions: ['cul_1', 'cul_2']
  }
];

export const DEFAULT_CLIMA_QUESTIONS: ClimateQuestion[] = [
  // 1. Comunicación Organizacional
  {
    id: 'com_1',
    dimensionId: 'comunicacion',
    text: 'La información relevante para mi trabajo es compartida de manera clara y oportuna.',
    aliases: ['informacion clara', 'oportunidad informacion', 'comunicacion oportuna', 'com1', 'pregunta com 1']
  },
  {
    id: 'com_2',
    dimensionId: 'comunicacion',
    text: 'La empresa fomenta canales de comunicación bilaterales donde se escucha genuinamente mi opinión.',
    aliases: ['canales bilaterales', 'escucha opinion', 'comunicacion bidireccional', 'com2', 'pregunta com 2', 'canales de escucha']
  },

  // 2. Liderazgo y Dirección
  {
    id: 'lid_1',
    dimensionId: 'liderazgo',
    text: 'Confío en las decisiones y dirección estratégica tomadas por los líderes de la compañía.',
    aliases: ['confianza lideres', 'direccion de lideres', 'liderazgo estrategico', 'lid1', 'pregunta lid 1', 'alta gerencia']
  },
  {
    id: 'lid_2',
    dimensionId: 'liderazgo',
    text: 'Los líderes de la organización guían con el ejemplo y transmiten confianza e inspiración a los equipos.',
    aliases: ['lideran ejemplo', 'ejemplo lideres', 'liderazgo inspirador', 'lid2', 'pregunta lid 2']
  },

  // 3. Trabajo en Equipo y Colaboración
  {
    id: 'eqp_1',
    dimensionId: 'trabajo_equipo',
    text: 'En mi área colaboramos de manera coordinada para cumplir los objetivos compartidos.',
    aliases: ['colaboracion equipo', 'trabajo equipo', 'cooperacion area', 'eqp1', 'pregunta eqp 1', 'trabajo en equipo']
  },
  {
    id: 'eqp_2',
    dimensionId: 'trabajo_equipo',
    text: 'Los conflictos dentro de mi equipo se abordan y resuelven de forma madura y constructiva.',
    aliases: ['conflictos equipo', 'resolucion conflictos', 'manejo diferencias', 'eqp2', 'pregunta eqp 2', 'solucion conflictos']
  },

  // 4. Reconocimiento y Compensación
  {
    id: 'rec_1',
    dimensionId: 'reconocimiento',
    text: 'Se reconoce y valora de manera oportuna mi esfuerzo y aportes individuales en mi puesto.',
    aliases: ['reconocimiento esfuerzo', 'valoracion aportes', 'reconoce logros', 'rec1', 'pregunta rec 1', 'reconocimiento']
  },
  {
    id: 'rec_2',
    dimensionId: 'reconocimiento',
    text: 'Considero que existe un sistema de incentivos y salario emocional adecuado que destaca el desempeño.',
    aliases: ['sistema incentivos', 'salario emocional', 'incentivos desempeño', 'rec2', 'pregunta rec 2', 'incentivos justos']
  },

  // 5. Bienestar Organizacional
  {
    id: 'bie_1',
    dimensionId: 'bienestar',
    text: 'Los programas de salud, recreación y deporte organizados por la empresa mejoran mi bienestar integral.',
    aliases: ['programas bienestar', 'actividades recreativas', 'bienestar integral', 'bie1', 'pregunta bie 1', 'bienestar']
  },
  {
    id: 'bie_2',
    dimensionId: 'bienestar',
    text: 'La empresa demuestra una preocupación genuina por el bienestar físico y la salud mental de los colaboradores.',
    aliases: ['preocupacion salud', 'salud mental bienestar', 'cuidado personal', 'bie2', 'pregunta bie 2']
  },

  // 6. Condiciones de Trabajo y Recursos
  {
    id: 'con_1',
    dimensionId: 'condiciones_trabajo',
    text: 'Dispongo de las herramientas, insumos y recursos tecnológicos requeridos para ejecutar eficientemente mi labor.',
    aliases: ['herramientas adecuadas', 'recursos trabajo', 'insumos cargo', 'con1', 'pregunta con 1', 'condiciones de trabajo']
  },
  {
    id: 'con_2',
    dimensionId: 'condiciones_trabajo',
    text: 'Las condiciones de ergonomía, iluminación y espacio físico donde trabajo son cómodas y adecuadas.',
    aliases: ['instalaciones fisicas', 'ergonomia oficina', 'espacio de trabajo', 'con2', 'pregunta con 2', 'entorno fisico']
  },

  // 7. Desarrollo Profesional y Capacitación
  {
    id: 'des_1',
    dimensionId: 'desarrollo_profesional',
    text: 'Tengo oportunidades reales de adquirir nuevos conocimientos y desarrollarme profesionalmente.',
    aliases: ['capacitacion desarrollo', 'oportunidad crecimiento', 'crecimiento profesional', 'des1', 'pregunta des 1', 'desarrollo profesional']
  },
  {
    id: 'des_2',
    dimensionId: 'desarrollo_profesional',
    text: 'Existe claridad en los planes de carrera de la empresa y la posibilidad de promoverme internamente.',
    aliases: ['plan de carrera', 'claridad ascensos', 'promociones internas', 'des2', 'pregunta des 2']
  },

  // 8. Compromiso Organizacional
  {
    id: 'cmp_1',
    dimensionId: 'compromiso',
    text: 'Me siento altamente comprometido con el logro de la visión, misión y metas de la organización.',
    aliases: ['compromiso metas', 'comprometido empresa', 'alineacion vision', 'cmp1', 'pregunta cmp 1', 'compromiso']
  },
  {
    id: 'cmp_2',
    dimensionId: 'compromiso',
    text: 'Estoy dispuesto a realizar un esfuerzo adicional (dar la milla extra) cuando la empresa lo necesita.',
    aliases: ['esfuerzo adicional', 'dar milla extra', 'esfuerzo extra', 'cmp2', 'pregunta cmp 2']
  },

  // 9. Motivación Laboral
  {
    id: 'mot_1',
    dimensionId: 'motivacion',
    text: 'Siento entusiasmo e inspiración cada día antes de iniciar mis labores asignadas.',
    aliases: ['entusiasmo trabajo', 'motivacion diaria', 'inspiracion laboral', 'mot1', 'pregunta mot 1', 'motivación']
  },
  {
    id: 'mot_2',
    dimensionId: 'motivacion',
    text: 'Mi rol actual me ofrece desafíos interesantes y gratificación personal continua.',
    aliases: ['trabajo retador', 'gratificacion laboral', 'interes puesto', 'mot2', 'pregunta mot 2']
  },

  // 10. Relación con el Jefe Inmediato
  {
    id: 'jef_1',
    dimensionId: 'relacion_jefe',
    text: 'Mi jefe inmediato me brinda orientación técnica clara y me trata con absoluto respeto y equidad.',
    aliases: ['respeto jefe', 'trato jefe', 'orientacion jefe', 'jef1', 'pregunta jef 1', 'relación con jefe']
  },
  {
    id: 'jef_2',
    dimensionId: 'relacion_jefe',
    text: 'Mi jefe inmediato realiza retroalimentaciones constructivas periódicas sobre mi desempeño laboral.',
    aliases: ['retroalimentacion jefe', 'feedback jefe', 'evaluacion constructiva', 'jef2', 'pregunta jef 2']
  },

  // 11. Relación con Compañeros
  {
    id: 'cop_1',
    dimensionId: 'relacion_companeros',
    text: 'En mi equipo inmediato prevalece un ambiente de compañerismo, respeto mutuo y alta confianza.',
    aliases: ['ambiente compañerismo', 'relacion colegas', 'confianza compañeros', 'cop1', 'pregunta cop 1', 'relación con compañeros']
  },
  {
    id: 'cop_2',
    dimensionId: 'relacion_companeros',
    text: 'Puedo apoyarme de forma solidaria en mis compañeros cuando se presentan retos laborales complejos.',
    aliases: ['solidaridad compañeros', 'apoyo colegas', 'ayuda compañeros', 'cop2', 'pregunta cop 2']
  },

  // 12. Carga Laboral y Distribución
  {
    id: 'car_1',
    dimensionId: 'carga_laboral',
    text: 'La cantidad de tareas y metas asignadas a mi puesto son razonables para mi jornada laboral.',
    aliases: ['carga laboral razonable', 'volumen trabajo', 'carga de trabajo', 'car1', 'pregunta car 1', 'carga laboral']
  },
  {
    id: 'car_2',
    dimensionId: 'carga_laboral',
    text: 'La asignación de responsabilidades en mi departamento está bien distribuida y evita sobrecargas.',
    aliases: ['distribucion tareas', 'reparto equitativo', 'evita sobrecarga', 'car2', 'pregunta car 2']
  },

  // 13. Equilibrio Vida-Trabajo
  {
    id: 'equ_1',
    dimensionId: 'equilibrio_vida_trabajo',
    text: 'La empresa respeta firmemente mis tiempos de descanso fuera de la jornada oficial de trabajo.',
    aliases: ['tiempos de descanso', 'desconexion laboral', 'respeto descanso', 'equ1', 'pregunta equ 1', 'equilibrio vida trabajo']
  },
  {
    id: 'equ_2',
    dimensionId: 'equilibrio_vida_trabajo',
    text: 'Las políticas laborales facilitan un sano equilibrio entre mi vida profesional y mis compromisos personales o familiares.',
    aliases: ['equilibrio familiar', 'atencion familia', 'vida personal', 'equ2', 'pregunta equ 2']
  },

  // 14. Sentido de Pertenencia
  {
    id: 'per_1',
    dimensionId: 'sentido_pertenencia',
    text: 'Siento un profundo orgullo de pertenecer y contribuir activamente a esta organización.',
    aliases: ['orgullo empresa', 'orgullo pertenecer', 'identidad corporativa', 'per1', 'pregunta per 1', 'sentido de pertenencia']
  },
  {
    id: 'per_2',
    dimensionId: 'sentido_pertenencia',
    text: 'Recomendaría plenamente a esta empresa como un excelente empleador y lugar para desarrollarse.',
    aliases: ['recomendar empresa', 'recomendar empleador', 'lugar excelente', 'per2', 'pregunta per 2']
  },

  // 15. Cultura Organizacional
  {
    id: 'cul_1',
    dimensionId: 'cultura_organizacional',
    text: 'Los valores éticos y principios declarados por la compañía son vividos cotidianamente por sus miembros.',
    aliases: ['valores corporativos', 'etica empresa', 'vivencia valores', 'cul1', 'pregunta cul 1', 'cultura organizacional']
  },
  {
    id: 'cul_2',
    dimensionId: 'cultura_organizacional',
    text: 'La empresa promueve activamente un clima laboral incluyente, diverso y respetuoso.',
    aliases: ['cultura innovacion', 'respeto diversidad', 'clima incluyente', 'cul2', 'pregunta cul 2']
  }
];

export const CLIMA_DEMO_ALIASES: Record<string, string[]> = {
  ciudad: ['ciudad', 'sede', 'ubicacion', 'municipio', 'sucursal'],
  departamento: ['departamento', 'area', 'proceso', 'gerencia', 'division', 'equipo'],
  genero: ['genero', 'sexo', 'identidad de genero'],
  antiguedad: ['antiguedad', 'años empresa', 'tiempo empresa', 'antiguedad empresa', 'tiempo de servicio']
};
