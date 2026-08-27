import { DemographicsData } from '../types';

export interface PlanProgram {
  name: string;
  justification: string;
  objective: string;
  activities: string[];
  responsible: string;
  frequency: string;
  indicator: string;
  goal: string;
  priority: 'Alta' | 'Media' | 'Baja';
  color: string;
}

export interface AnnualPlan {
  diagnosticoGeneral: string;
  objetivoGeneral: string;
  objetivosEspecificos: string[];
  programs: PlanProgram[];
}

export function generateAnnualPlan(data: DemographicsData): AnnualPlan {
  const total = data.totalEmployees || 0;
  const raw = data.rawEmployees || [];
  const hasRaw = raw.length > 0;

  // Gather stats for dynamic justification and goals
  // 1. Youth
  let youngCount = 0;
  if (hasRaw) {
    youngCount = raw.filter(e => e.edad < 28).length;
  } else {
    const grp18_25 = data.ageGroups?.find(g => g.range.includes('18-25') || g.range.includes('18-24'))?.value || 0;
    const grp26_35 = data.ageGroups?.find(g => g.range.includes('26-35') || g.range.includes('25-30'))?.value || 0;
    youngCount = grp18_25 + Math.round(grp26_35 * 0.2);
  }
  const youngPct = total ? Math.round((youngCount / total) * 100) : 42;

  // 2. Gender
  const genderList = data.gender || [];
  const sortedGender = [...genderList].sort((a, b) => b.percentage - a.percentage);
  const primaryGen = sortedGender[0]?.name || 'Femenino';
  const primaryGenPct = sortedGender[0]?.percentage || 50;

  // 3. Children
  const childrenPct = data.hasChildrenPercentage || 38;
  const withKidsCount = Math.round(total * (childrenPct / 100));

  // 4. Disability
  const discCount = data.disabilityCount || 0;
  const discPct = data.disabilityPercentage || (total ? parseFloat(((discCount / total) * 100).toFixed(1)) : 0);

  // 5. Housing / Strata
  const strataList = data.socioeconomicStrata || [];
  const countStratum1_2 = strataList
    .filter(s => s.stratum.includes('1') || s.stratum.includes('2'))
    .reduce((acc, curr) => acc + curr.count, 0);
  const pctStratum1_2 = total ? Math.round((countStratum1_2 / total) * 100) : 45;

  const housingList = data.housing || [];
  const rentPct = housingList.find(h => h.type.toLowerCase().includes('arrendada') || h.type.toLowerCase().includes('arriendo'))?.percentage || 0;

  // 6. Seniority < 1 year
  let antLess1 = 0;
  if (hasRaw) {
    antLess1 = raw.filter(e => e.antiguedad < 1).length;
  } else {
    antLess1 = Math.round(total * 0.35);
  }
  const pctLess1 = total ? Math.round((antLess1 / total) * 100) : 35;

  // Build General Diagnosis
  const diagnosticoGeneral = `Con base en el análisis sociodemográfico consolidado de ${total} colaboradores, se evidencia una población predominantemente ${primaryGen.toLowerCase()} (${primaryGenPct}%), con una edad promedio de ${data.averageAge || 29} años y un alto volumen de colaboradores jóvenes menores de 28 años (${youngPct}%). Asimismo, se resalta que el ${childrenPct}% de los colaboradores cuenta con hijos a cargo y el ${pctStratum1_2}% habita en estratos socioeconómicos 1 y 2, sumado a un ${rentPct || 55}% de residencia bajo modalidad de arriendo. En términos de estabilidad laboral, el ${pctLess1}% posee una antigüedad menor a un año, sugiriendo desafíos en retención y alta demanda adaptativa en el SG-SST. Se registran además ${discCount} personas con discapacidad declarada (${discPct}%), demandando inclusión activa y ergonomía aplicada.`;

  const objetivoGeneral = `Establecer e implementar el Plan Anual de Seguridad y Salud en el Trabajo para responder a las necesidades críticas del personal de BPO, reduciendo el ausentismo laboral derivado de riesgos ergonómicos y psicosociales, promoviendo el bienestar integral, entornos protectores y la cultura de autocuidado.`;

  const objetivosEspecificos = [
    `Intervenir el riesgo psicosocial y de salud mental del personal mediante micro-pausas activas cognitivas y soporte terapéutico confidencial, apuntando a mitigar la fatiga en el ${youngPct}% de población junior expuesta.`,
    `Asegurar adaptaciones ergonómicas e inspecciones de puesto para mitigar el síndrome de túnel carpiano y dolores osteomusculares, priorizando el género predominante (${primaryGen}) y los ${discCount} colaboradores con discapacidad.`,
    `Desplegar programas enfocados en entornos familiares, estilos de vida saludables y escuela de padres, impactando favorablemente al ${childrenPct}% de colaboradores que reportan tener hijos.`,
    `Establecer un programa robusto de inducción (onboarding) en SST y liderazgo seguro para el ${pctLess1}% de nuevos colaboradores con menos de 1 año de antigüedad, previniendo incidentes operacionales tempranos.`
  ];

  const programs: PlanProgram[] = [
    {
      name: 'Riesgo Psicosocial',
      justification: `El ${youngPct}% de la nómina es personal joven (<28 años) y el ${pctLess1}% tiene una antigüedad menor a un año, lo que incrementa la susceptibilidad al estrés por adaptación y a las demandas emocionales de la atención telefónica en operaciones BPO.`,
      objective: 'Evaluar, monitorear y mitigar los factores de riesgo psicosocial intralaboral y extralaboral en la población operativa.',
      activities: [
        'Aplicación anual de la Batería de Riesgo Psicosocial (Ministerio de Trabajo).',
        'Talleres presenciales de manejo de la frustración y control del estrés.',
        'Sesiones de retroalimentación constructiva para líderes operativos.',
        'Implementación de pausas activas cognitivas de 3 minutos dirigidas.'
      ],
      responsible: 'Psicólogo Especialista SST / RRHH',
      frequency: 'Semestral / Anual',
      indicator: 'Porcentaje de colaboradores con riesgo psicosocial alto intervenidos',
      goal: '90%',
      priority: 'Alta',
      color: 'rose'
    },
    {
      name: 'Salud Mental',
      justification: `Las presiones de cumplimiento de métricas de servicio al cliente unidas al estrés financiero derivado de habitar en estratos 1-2 (${pctStratum1_2}%) o arriendo (${rentPct || 55}%) representan estresores continuos para la estabilidad mental de los agentes.`,
      objective: 'Fomentar la salud mental de los colaboradores mediante el autoconocimiento, apoyo profesional y desconexión laboral efectiva.',
      activities: [
        'Lanzamiento de la línea confidencial 24/7 "Línea de Apoyo y Escucha".',
        'Charlas de prevención de ansiedad, depresión y síndrome de Burnout.',
        'Campañas digitales sobre la importancia del sueño y hábitos de desconexión digital.',
        'Grupos de apoyo y primeros auxilios psicológicos para supervisores.'
      ],
      responsible: 'Médico Ocupacional / Psicólogo Clínico',
      frequency: 'Mensual',
      indicator: 'Número de atenciones y asesorías psicológicas exitosas / Solicitadas',
      goal: '100%',
      priority: 'Alta',
      color: 'indigo'
    },
    {
      name: 'Medicina Preventiva',
      justification: `Vigilancia epidemiológica continua para la detección temprana de patologías ocupacionales y crónicas, adaptando tamizajes preventivos a la demografía de ${total} colaboradores.`,
      objective: 'Promover la salud general del trabajador, previniendo enfermedades de origen común y profesional.',
      activities: [
        'Exámenes médicos ocupacionales periódicos (ingreso, periódicos, egreso).',
        'Jornadas de tamizaje cardiovascular (toma de tensión, glucometría, perfil lipídico).',
        'Campañas de vacunación anual contra la Influenza estacional.',
        'Seguimiento a casos sospechosos de patologías de voz o auditivas.'
      ],
      responsible: 'Médico Especialista en SST',
      frequency: 'Anual',
      indicator: 'Cobertura de exámenes médicos ocupacionales periódicos realizados',
      goal: '95%',
      priority: 'Media',
      color: 'emerald'
    },
    {
      name: 'Ergonomía',
      justification: `Predominio del género ${primaryGen} (${primaryGenPct}%) que presenta mayor incidencia histórica en desórdenes de extremidades superiores, además de contar con ${discCount} colaboradores con discapacidad que necesitan puestos de trabajo adaptados.`,
      objective: 'Adecuar las condiciones de los puestos de trabajo para prevenir desórdenes musculoesqueléticos asociados al sedentarismo y digitación continua.',
      activities: [
        'Inspecciones ergonómicas y antropométricas de puestos de trabajo.',
        'Capacitaciones prácticas en higiene postural y ajuste de sillas ergonómicas.',
        'Talleres de pausas activas osteomusculares cada 2 horas.',
        'Adaptación física de puestos para el personal con discapacidad registrada.'
      ],
      responsible: 'Fisioterapeuta / Ergonónomo',
      frequency: 'Trimestral',
      indicator: 'Porcentaje de puestos de trabajo inspeccionados y ajustados ergonómicamente',
      goal: '100%',
      priority: 'Alta',
      color: 'amber'
    },
    {
      name: 'Estilos de Vida Saludable',
      justification: `Mitigar los riesgos de sedentarismo e hipertensión en la población expuesta a largas jornadas sentadas de digitación y monitoreo visual.`,
      objective: 'Incentivar la adopción de hábitos de alimentación balanceada y actividad física regular dentro y fuera de la empresa.',
      activities: [
        'Talleres de nutrición saludable "Lonchera Operativa Inteligente".',
        'Retos de actividad física (contadores de pasos diarios utilizando tecnología).',
        'Distribución semanal de fruta fresca como snack corporativo en áreas comunes.',
        'Alianzas o convenios con centros deportivos / gimnasios.'
      ],
      responsible: 'Nutricionista / Profesional de Bienestar',
      frequency: 'Mensual',
      indicator: 'Porcentaje de participación activa en los retos saludables de la empresa',
      goal: '65%',
      priority: 'Baja',
      color: 'teal'
    },
    {
      name: 'Escuela de Padres',
      justification: `El ${childrenPct}% de los colaboradores (${withKidsCount} personas) tiene hijos a cargo, afrontando el desafío de equilibrar turnos rotativos BPO con la crianza y el cuidado familiar.`,
      objective: 'Brindar herramientas de crianza amorosa, pautas de crianza positiva y balance entre vida laboral y familiar.',
      activities: [
        'Webinars sobre límites respetuosos y comunicación con hijos adolescentes.',
        'Sesiones de asesoría en prevención del ciberacoso y uso seguro de internet.',
        'Celebración interactiva del Día de la Familia con talleres de manualidades.',
        'Orientación en finanzas del hogar y ahorro para estudios de los hijos.'
      ],
      responsible: 'Psicólogo Familiar / Trabajadora Social',
      frequency: 'Bimestral',
      indicator: 'Número de familias impactadas por talleres de escuela de padres',
      goal: '80%',
      priority: 'Media',
      color: 'cyan'
    },
    {
      name: 'Prevención del Consumo de Sustancias',
      justification: `Proteger a la nómina del impacto del consumo de tabaco, alcohol y otras sustancias, mitigando los estresores y fatigas que puedan incidir en conductas de riesgo.`,
      objective: 'Garantizar un entorno laboral seguro y saludable mediante la prevención y mitigación del consumo de sustancias psicoactivas.',
      activities: [
        'Socialización y firma anual de la Política de no alcohol, tabaco y drogas.',
        'Pruebas aleatorias de alcoholemia en turnos de alta criticidad.',
        'Charlas de sensibilización sobre los efectos del tabaco y vapeadores.',
        'Asesoría de desintoxicación confidencial a través de la EPS o ARL.'
      ],
      responsible: 'Coordinador SST / ARL',
      frequency: 'Trimestral',
      indicator: 'Porcentaje de cumplimiento de la política de cero sustancias',
      goal: '100%',
      priority: 'Media',
      color: 'violet'
    },
    {
      name: 'Capacitación SST',
      justification: `El ingreso constante de colaboradores representados en un ${pctLess1}% con antigüedad menor a un año demanda un ciclo continuo de entrenamiento para afianzar pautas de seguridad corporativas de forma rápida.`,
      objective: 'Fortalecer el conocimiento técnico y de SST en el 100% de los colaboradores de la organización.',
      activities: [
        'Inducción y re-inducción lúdica de SST al personal nuevo.',
        'Capacitación en reporte de actos y condiciones inseguras.',
        'Entrenamiento específico sobre fatiga visual y cuidado de la voz.',
        'Formación del Comité Paritario de SST (COPASST).'
      ],
      responsible: 'Líder SST / ARL',
      frequency: 'Mensual',
      indicator: 'Cobertura del plan anual de capacitación en SST acumulada',
      goal: '95%',
      priority: 'Alta',
      color: 'orange'
    },
    {
      name: 'Gestión del Riesgo',
      justification: `Soporte ante eventualidades operacionales, emergencias, conatos de incendio o evacuación de la sede de operaciones.`,
      objective: 'Identificar, valorar y controlar de forma continua las condiciones de peligro en las sedes físicas y operativas.',
      activities: [
        'Actualización de la Matriz de Peligros, Evaluación y Control de Riesgos (GTC 45).',
        'Simulacro de evacuación anual de las instalaciones físicas.',
        'Inspecciones planeadas de botiquines, extintores y señalización de emergencia.',
        'Conformación, capacitación y dotación de la Brigada de Emergencia.'
      ],
      responsible: 'Coordinador SST / Brigadistas',
      frequency: 'Trimestral',
      indicator: 'Porcentaje de peligros identificados controlados oportunamente',
      goal: '100%',
      priority: 'Media',
      color: 'slate'
    },
    {
      name: 'Liderazgo Seguro',
      justification: `El comportamiento y la cultura preventiva dependen de los supervisores y mandos medios que lideran los equipos diarios de operaciones de BPO.`,
      objective: 'Capacitar a los líderes de operaciones en cultura de autocuidado, retroalimentación positiva y cuidado del equipo.',
      activities: [
        'Taller de liderazgo empático y preventivo "Líderes con Sentido".',
        'Instauración del sistema de reconocimiento "Supervisor Estrella en Autocuidado".',
        'Reuniones mensuales de revisión de ausentismo con directores de cuenta.',
        'Capacitación de comités de convivencia laboral.'
      ],
      responsible: 'Director SST / Coach de Liderazgo',
      frequency: 'Bimestral',
      indicator: 'Satisfacción y adherencia del liderazgo en pautas preventivas',
      goal: '90%',
      priority: 'Media',
      color: 'sky'
    },
    {
      name: 'Diversidad e Inclusión',
      justification: `La caracterización reporta ${discCount} personas con discapacidad, diversidad de minorías étnicas y distribución de género. Una política inclusiva robustece el clima laboral y la reputación.`,
      objective: 'Garantizar la equidad de oportunidades, un trato digno y la integración efectiva de todas las poblaciones de la empresa.',
      activities: [
        'Talleres de sesgos inconscientes en selección de personal y supervisión.',
        'Adecuación de comunicaciones internas a formatos accesibles (lectores de pantalla, etc.).',
        'Campaña "Semana de la Diversidad Cultural y Étnica" (reconocimiento de saberes).',
        'Monitoreo semestral del clima laboral en minorías y personal vulnerable.'
      ],
      responsible: 'Comité de Inclusión / RRHH / SST',
      frequency: 'Semestral',
      indicator: 'Porcentaje de inclusión y clima favorable en poblaciones diversas',
      goal: '95%',
      priority: 'Baja',
      color: 'fuchsia'
    }
  ];

  return {
    diagnosticoGeneral,
    objetivoGeneral,
    objetivosEspecificos,
    programs
  };
}
