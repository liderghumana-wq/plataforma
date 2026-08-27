import { DemographicsData } from '../types';
import { BIBLIOTECA_CIIU_SG_SST } from '../modules/biblioteca/data/ciiuLibrarySgSst';

// Helper to look up CIIU relation
function getCiiuRelation(codigoCIIU?: string) {
  if (!codigoCIIU) return null;
  const codeStr = String(codigoCIIU).trim();
  return BIBLIOTECA_CIIU_SG_SST.find(item => String(item.codigo).trim() === codeStr) || null;
}

export interface ExecutiveFinding {
  title: string;
  metric: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export interface RecommendationItem {
  category: string;
  title: string;
  desc: string;
  justification: string;
  priority: 'Alta' | 'Media' | 'Baja';
  benefit: string;
}

export interface PlanActionItem {
  category: string;
  objective: string;
  activity: string;
  responsible: string;
  timeline: string;
  indicator: string;
}

const round1 = (val?: number) => Number(Number(val || 0).toFixed(1));

// Helper to extract clean statistics from demographics
export function extractStats(data: DemographicsData) {
  const total = data.totalEmployees || 0;
  const avgAge = data.averageAge || 0;
  const avgSeniority = data.averageSeniority || 0;
  const avgSeniorityRole = data.averageSeniorityRole || 0;
  const wellbeing = round1(data.wellbeingIndex || 0);
  const absenteeism = round1(data.absenteeismRate || 0);
  const kidsPct = round1(data.hasChildrenPercentage || 0);
  const activeParticipationPct = round1(data.activeParticipation || 0);

  // Gender
  const genders = data.gender || [];
  const primaryGenderRaw = genders.length > 0 
    ? [...genders].sort((a, b) => b.percentage - a.percentage)[0] 
    : { name: 'Sin información', percentage: 0 };
  const primaryGender = { ...primaryGenderRaw, percentage: round1(primaryGenderRaw.percentage) };

  // City
  const cities = data.city || [];
  const primaryCity = cities.length > 0 
    ? [...cities].sort((a, b) => b.count - a.count)[0] 
    : { name: 'Sin información', count: 0 };

  // Education
  const education = data.education || [];
  const primaryEdu = education.length > 0 
    ? [...education].sort((a, b) => b.count - a.count)[0] 
    : { level: 'Sin información', count: 0 };

  // Marital Status
  const marital = data.maritalStatus || [];
  const primaryMarital = marital.length > 0 
    ? [...marital].sort((a, b) => b.count - a.count)[0] 
    : { status: 'Sin información', count: 0 };

  // Strata (Estrato)
  const strata = data.socioeconomicStrata || [];
  const primaryStratumRaw = strata.length > 0 
    ? [...strata].sort((a, b) => b.count - a.count)[0] 
    : { stratum: 'Sin información', percentage: 0 };
  const primaryStratum = { ...primaryStratumRaw, percentage: round1(primaryStratumRaw.percentage) };

  // Housing
  const housing = data.housing || [];
  const primaryHousingRaw = housing.length > 0 
    ? [...housing].sort((a, b) => b.percentage - a.percentage)[0] 
    : { type: 'Sin información', percentage: 0 };
  const primaryHousing = { ...primaryHousingRaw, percentage: round1(primaryHousingRaw.percentage) };

  // Pain / Musculoskeletal
  const pain = data.musculoskeletalPain || [];
  const primaryPainRaw = pain.length > 0 
    ? [...pain].sort((a, b) => b.percentage - a.percentage)[0] 
    : { bodyPart: 'Sin información', percentage: 0 };
  const primaryPain = { ...primaryPainRaw, percentage: round1(primaryPainRaw.percentage) };

  // Sedentary (physical activity)
  const physical = data.physicalActivity || [];
  const sedentary = round1(physical.find(p => p.level === 'Ninguna' || p.level === 'No')?.percentage || 0);

  // Diseases
  const diseases = data.diseases || [];
  const topDiseaseRaw = diseases.length > 0 
    ? [...diseases].filter(d => d.disease !== 'Ninguna' && d.disease !== 'Ninguno' && d.disease !== 'Sano').sort((a, b) => b.percentage - a.percentage)[0] 
    : null;
  const topDisease = topDiseaseRaw ? { ...topDiseaseRaw, percentage: round1(topDiseaseRaw.percentage) } : { disease: 'Sin información', percentage: 0 };

  // IMC classification
  const imcList = data.imcClassification || [];
  const overweightPct = imcList
    .filter(i => i.category?.toLowerCase().includes('sobrepeso'))
    .reduce((sum, i) => sum + (i.percentage || 0), 0);
  const obesityPct = imcList
    .filter(i => i.category?.toLowerCase().includes('obesidad'))
    .reduce((sum, i) => sum + (i.percentage || 0), 0);
  const totalExcessWeight = round1(Number(overweightPct) + Number(obesityPct));
  const avgImc = round1(data.averageIMC || 0);


  // Time free activity
  const freeTime = data.freeTimeUsage || [];
  const primaryFreeTimeRaw = freeTime.length > 0 
    ? [...freeTime].sort((a, b) => b.count - a.count)[0] 
    : { activity: 'Compartir en familia', percentage: 39 };
  const primaryFreeTime = { ...primaryFreeTimeRaw, percentage: round1(primaryFreeTimeRaw.percentage) };

  return {
    total,
    avgAge,
    avgSeniority,
    avgSeniorityRole,
    wellbeing,
    absenteeism,
    kidsPct,
    activeParticipationPct,
    primaryGender,
    primaryCity,
    primaryEdu,
    primaryMarital,
    primaryStratum,
    primaryHousing,
    primaryPain,
    sedentary,
    topDisease,
    totalExcessWeight,
    avgImc,
    primaryFreeTime
  };
}

// Generate executive findings
export function generateExecutiveFindings(data: DemographicsData, codigoCIIU?: string): ExecutiveFinding[] {
  const stats = extractStats(data);
  const findings: ExecutiveFinding[] = [];

  const ciiuRel = getCiiuRelation(codigoCIIU);
  if (ciiuRel) {
    // Sectorial Profile
    findings.push({
      title: `Perfil Sectorial: ${ciiuRel.nombreOficial}`,
      metric: `Riesgo Clase ${ciiuRel.claseRiesgo}`,
      description: `La empresa está clasificada bajo la actividad económica CIIU ${ciiuRel.codigo} (${ciiuRel.sectorEconomico}). Esto implica un nivel de riesgo Clase ${ciiuRel.claseRiesgo} según la normativa colombiana de riesgos laborales. ${ciiuRel.descripcion}`,
      severity: ciiuRel.claseRiesgo === 'I' || ciiuRel.claseRiesgo === 'II' ? 'low' : ciiuRel.claseRiesgo === 'III' ? 'medium' : 'high'
    });

    // Predictive Alerts and Hazards
    findings.push({
      title: 'Alertas Predictivas y Peligros Prioritarios',
      metric: `${ciiuRel.riesgosPrioritarios.length} Riesgos Críticos`,
      description: `Según la caracterización inteligente, su actividad económica presenta una alta exposición a los siguientes Peligros: ${ciiuRel.peligrosGtc45.map(p => p.descripcion).join(', ')}. Riesgos prioritarios determinados: ${ciiuRel.riesgosPrioritarios.join(', ')}.`,
      severity: 'high'
    });
  }

  // Finding 1: Biomechanical risks
  findings.push({
    title: 'Prevalencia de Molestias Osteomusculares',
    metric: `${stats.primaryPain.percentage}% de afectación`,
    description: `El personal reporta dolor predominante en la zona de ${stats.primaryPain.bodyPart}. Este es un factor de alerta clave debido a las posturas repetitivas y prolongadas inherentes a las operaciones corporativas.`,
    severity: stats.primaryPain.percentage > 35 ? 'high' : 'medium'
  });

  // Finding 2: Sedentarism and cardiac risk
  findings.push({
    title: 'Factor de Riesgo por Sedentarismo',
    metric: `${stats.sedentary}% sin actividad física`,
    description: `Un alto porcentaje de la nómina admite nula actividad deportiva semanal. Combinado con un ${stats.totalExcessWeight}% de colaboradores con sobrepeso u obesidad (IMC: ${stats.avgImc}), eleva el riesgo cardiometabólico.`,
    severity: stats.sedentary > 45 ? 'high' : 'medium'
  });

  // Finding 3: Psychosocial & Family Demographics
  findings.push({
    title: 'Estructura Familiar y Vivienda',
    metric: `${stats.kidsPct}% de personal con hijos`,
    description: `La coexistencia de un alto índice de padres/madres de familia con un ${stats.primaryHousing.percentage}% que habita en vivienda ${stats.primaryHousing.type} (mayormente estrato ${stats.primaryStratum.stratum}) resalta presiones económicas de transporte y cuidado.`,
    severity: 'medium'
  });

  // Finding 4: Youth and turnover risk
  findings.push({
    title: 'Fuerza Laboral Joven y Estabilidad',
    metric: `${stats.avgAge} años de edad promedio`,
    description: `La nómina es marcadamente joven con una antigüedad en la empresa de ${stats.avgSeniority} años y en el cargo de ${stats.avgSeniorityRole} años. Se requieren planes dinámicos de salario emocional y retención de talento.`,
    severity: stats.wellbeing < 85 ? 'high' : 'low'
  });

  return findings;
}

// Generate the 9 mandated categories of recommendations
export function generateRecommendations(data: DemographicsData, codigoCIIU?: string): RecommendationItem[] {
  const stats = extractStats(data);
  const ciiuRel = getCiiuRelation(codigoCIIU);

  const recs: RecommendationItem[] = [
    {
      category: 'Salud Mental',
      title: 'Programa de Descompresión Emocional y Regulación de Ansiedad',
      desc: 'Implementar micro-pausas cognitivas virtuales y ejercicios interactivos de respiración diafragmática al inicio y cierre de cada turno de operaciones.',
      justification: `La población cuenta con un Índice de Bienestar del ${stats.wellbeing}% y una edad promedio de ${stats.avgAge} años, expuesta a tensiones de atención al cliente telefónico (AHT).`,
      priority: stats.wellbeing < 85 ? 'Alta' : 'Media',
      benefit: 'Disminución de los niveles reportados de estrés diario de los agentes y mitigación de fatiga mental acumulada.'
    },
    {
      category: 'Riesgo Psicosocial',
      title: 'Sistema de Vigilancia Psicosocial y Estructuración de Turnos Flexibles',
      desc: 'Desplegar la aplicación anual de la Batería de Riesgo Psicosocial de conformidad con la Resolución 2646 de 2008 de Colombia, priorizando flexibilización horaria para personal híbrido.',
      justification: `El ${stats.kidsPct}% de los colaboradores cuenta con hijos o personas a cargo, lo que genera una alta vulnerabilidad en el cruce de vida familiar y turnos rotativos.`,
      priority: 'Alta',
      benefit: 'Mitigación de factores de riesgo intralaboral y extralaboral, cumplimiento regulatorio legal y reducción del estrés familiar.'
    },
    {
      category: 'Ergonomía',
      title: 'Programa de Higiene Postural y Ergonomía Activa "Pausas de Impacto"',
      desc: 'Establecer rutinas de estiramiento compensatorio de 7 minutos enfocados en cuello, hombros y túnel carpiano cada 3 horas, coordinados por líderes de operaciones.',
      justification: `Un ${stats.primaryPain.percentage}% de la población laboral reporta molestias recurrentes localizadas en la zona de ${stats.primaryPain.bodyPart}.`,
      priority: stats.primaryPain.percentage > 35 ? 'Alta' : 'Media',
      benefit: 'Reducción en la incidencia de molestias osteomusculares, y fomento del autocuidado tanto en oficina como en teletrabajo.'
    },
    {
      category: 'Actividad Física',
      title: 'Desafío Gamificado Corporativo "Pasos Activos" y Pausas Deportivas',
      desc: 'Organizar retos virtuales semanales basados en recuento de pasos móviles y actividades deportivas recreativas vinculando a la ARL.',
      justification: `El ${stats.sedentary}% de los colaboradores reporta nula actividad física semanal, representando un severo factor de riesgo de inactividad física en la organización.`,
      priority: stats.sedentary > 45 ? 'Alta' : 'Media',
      benefit: 'Activación del personal sedentario, mejora del tono muscular y fortalecimiento de hábitos cardiovasculares saludables.'
    },
    {
      category: 'Bienestar',
      title: 'Iniciativas de Salario Emocional y Tiempo Libre de Valor',
      desc: 'Crear programas de integración, voluntariado y recreación familiar alineados a las pasiones y hobbies del personal joven de BPO.',
      justification: `La participación activa actual en actividades organizacionales es del ${stats.activeParticipationPct}% y la actividad preferente del personal en tiempo libre es "${stats.primaryFreeTime.activity}".`,
      priority: 'Media',
      benefit: 'Incrementar la motivación y el compromiso de participación en el bienestar corporativo a niveles superiores al 90%.'
    },
    {
      category: 'Escuela de Padres',
      title: 'Talleres de Crianza Positiva y Co-cuidado Familiar',
      desc: 'Implementar conferencias trimestrales y círculos de apoyo sobre manejo de berrinches, límites asertivos, pautas de educación y redes de cuidado infantil.',
      justification: `El ${stats.kidsPct}% de la población encuestada posee hijos, requiriendo apoyo en la conciliación del cuidado del hogar y sus metas laborales.`,
      priority: stats.kidsPct > 40 ? 'Alta' : 'Media',
      benefit: 'Soporte directo a las redes familiares de los agentes, reduciendo el ausentismo y aumentando la estabilidad en su cargo.'
    },
    {
      category: 'Prevención del Consumo de Sustancias',
      title: 'Programa Educativo de Hábitos Seguros y Prevención de Adicciones',
      desc: 'Desarrollar campañas informativas y talleres de desmitificación sobre el consumo de alcohol, vapeadores, tabaco y SPA, integrados con manejo saludable de la ansiedad.',
      justification: `Dado que el perfil poblacional es mayoritariamente joven (${stats.avgAge} años en promedio), se asocia epidemiológicamente a mayor exposición social.`,
      priority: 'Media',
      benefit: 'Generación de entornos de trabajo seguros, disminución de riesgos asociados y fomento de salud psíquica libre de dependencias.'
    },
    {
      category: 'Liderazgo',
      title: 'Escuela de Liderazgo Empático y Gestión de Equipos de Alto Rendimiento',
      desc: 'Entrenar a coordinadores de operaciones, supervisores y jefes de campaña en liderazgo humano, manejo del conflicto intralaboral y retroalimentación constructiva.',
      justification: `La antigüedad promedio en la empresa es de ${stats.avgSeniority} años y en el cargo es de ${stats.avgSeniorityRole} años, lo que evidencia mandos medios jóvenes en desarrollo de competencias directivas.`,
      priority: 'Alta',
      benefit: 'Reducción de incidentes por acoso percibido, mejora sustancial del clima laboral en diademas de atención y optimización de productividad.'
    },
    {
      category: 'Nutrición',
      title: 'Programa Nutricional Corporativo "Nutrición Dinámica" y Hábitos Alimenticios',
      desc: 'Establecer jornadas de tamizaje del perímetro de cintura, consulta de nutricionista in situ y talleres interactivos sobre preparación de loncheras saludables.',
      justification: `La prevalencia de exceso de peso corporal (sobrepeso + obesidad) alcanza al ${stats.totalExcessWeight}% de los colaboradores, con un IMC promedio global de ${stats.avgImc}.`,
      priority: stats.totalExcessWeight > 35 ? 'Alta' : 'Media',
      benefit: 'Disminución progresiva del IMC general de la nómina y prevención activa de patologías crónicas no transmisibles.'
    }
  ];

  if (ciiuRel) {
    recs.unshift({
      category: 'Vigilancia Epidemiológica',
      title: `PVE Recomendado (${ciiuRel.sectorEconomico})`,
      desc: `Implementar y mantener activos los Programas de Vigilancia Epidemiológica obligatorios para su sector: ${ciiuRel.programasSugeridos.map(p => p.nombre).join(', ')}.`,
      justification: `La clasificación CIIU ${ciiuRel.codigo} asocia de manera estrecha la exposición laboral con estos programas específicos de control médico.`,
      priority: 'Alta',
      benefit: 'Detección temprana de patologías laborales y control sistemático del ausentismo.'
    });
    recs.unshift({
      category: 'Indicadores de Desempeño',
      title: 'Monitoreo de Indicadores de Siniestralidad Recomendados',
      desc: `Medir mensualmente de forma cruzada con la ARL los siguientes indicadores: ${ciiuRel.indicadoresRecomendados.map(i => i.nombre).join(', ')}.`,
      justification: `La clase de riesgo ${ciiuRel.claseRiesgo} de su actividad requiere el control exacto de estos KPIs sectoriales de salud en el trabajo.`,
      priority: 'Alta',
      benefit: 'Medibilidad objetiva del impacto de sus políticas de prevención y reducción de primas ARL.'
    });
  }

  return recs;
}

// Generate Plan of Action
export function generatePlanAction(data: DemographicsData, codigoCIIU?: string): PlanActionItem[] {
  const stats = extractStats(data);
  const ciiuRel = getCiiuRelation(codigoCIIU);

  const plan: PlanActionItem[] = [
    {
      category: 'Salud Mental',
      objective: 'Disminuir la percepción de fatiga cognitiva en agentes de voz.',
      activity: 'Sesiones diarias de 3 minutos de mindfulness guiado post-llamada.',
      responsible: 'Líder de Bienestar & Salud Mental / COPASST',
      timeline: 'Mensual (Ejecución Continua)',
      indicator: 'Índice de Clima y Bienestar General (Meta: >85%)'
    },
    {
      category: 'Riesgo Psicosocial',
      objective: 'Identificar, evaluar y controlar factores de riesgo psicosocial regulados.',
      activity: 'Aplicación formal presencial/virtual de la Batería del Ministerio de Trabajo.',
      responsible: 'Psicólogo Especialista en SST Externo',
      timeline: 'Semestral (Plan de choque)',
      indicator: '% de Cobertura en la aplicación (Meta: >90% de la nómina)'
    },
    {
      category: 'Ergonomía',
      objective: `Reducir molestias osteomusculares de ${stats.primaryPain.bodyPart} en personal de operaciones.`,
      activity: 'Fisioterapia in situ, pausas activas dirigidas e inspección técnica de puestos.',
      responsible: 'Fisioterapeuta Especialista en SST de ARL',
      timeline: 'Bimensual (Campañas focalizadas)',
      indicator: '% de reducción de quejas y dolores (Meta: 20% menos dolor)'
    },
    {
      category: 'Actividad Física',
      objective: 'Incrementar la actividad física semanal y disminuir el sedentarismo corporativo.',
      activity: 'Reto de Pasos "Pasos Activos" con incentivos de días libres por equipo.',
      responsible: 'Área de Bienestar y Recreación',
      timeline: 'Trimestral (Campañas trimestrales)',
      indicator: '% de colaboradores registrados activos (Meta: >50% de la nómina)'
    },
    {
      category: 'Bienestar',
      objective: 'Elevar la satisfacción interna de los colaboradores mediante planes lúdicos.',
      activity: `Jornadas de integración familiar los fines de semana enfocadas en "${stats.primaryFreeTime.activity}".`,
      responsible: 'Dirección de Talento Humano / Gestión Social',
      timeline: 'Trimestral (Eventos corporativos)',
      indicator: '% de participación registrada (Meta: >85% de asistencia)'
    },
    {
      category: 'Escuela de Padres',
      objective: 'Apoyar el balance de las familias BPO con herramientas de cuidado infantil.',
      activity: 'Talleres virtuales interactivos mensuales de pautas de crianza positiva.',
      responsible: 'Área de Trabajo Social / Caja de Compensación Familiar',
      timeline: 'Mensual (Tarde de padres)',
      indicator: 'Asistencia de padres de familia (Meta: >250 padres por evento)'
    },
    {
      category: 'Prevención del Consumo de Sustancias',
      objective: 'Fomentar entornos de trabajo libres de adicciones y tabaco.',
      activity: 'Feria de Salud y talleres interactivos sobre vapeo y autocuidado.',
      responsible: 'Comité de Convivencia Laboral y COPASST',
      timeline: 'Anual (Semana de la Salud)',
      indicator: 'Número de charlas e impactos registrados (Meta: >800 agentes capacitados)'
    },
    {
      category: 'Liderazgo',
      objective: 'Capacitar a mandos medios en destrezas de comunicación empática.',
      activity: 'Programa de formación teórica-práctica de 20 horas con talleres prácticos.',
      responsible: 'Coordinación de Formación / Consultoría de Liderazgo',
      timeline: 'Semestral (2 cohortes de líderes)',
      indicator: 'Índice de Favorabilidad del Supervisor en Encuestas de Clima (Meta: >80%)'
    },
    {
      category: 'Nutrición',
      objective: 'Reducir el exceso de peso corporal y prevenir enfermedades cardiometabólicas.',
      activity: 'Talleres de preparación de alimentación saludable y consulta con nutricionista.',
      responsible: 'Nutricionista de la Caja de Compensación / ARL',
      timeline: 'Trimestral (Seguimiento metabólico)',
      indicator: 'Variación de IMC general de la cohorte intervenida (Meta: Reducción del 5%)'
    }
  ];

  if (ciiuRel) {
    ciiuRel.capacitacionesRecomendadas.forEach((cap, idx) => {
      plan.unshift({
        category: 'Capacitación Sectorial',
        objective: `Entrenar al personal en: ${cap.tema}`,
        activity: `${cap.desc} (Frecuencia sugerida: ${cap.frecuencia}).`,
        responsible: 'Asesor SST / ARL',
        timeline: `Mes ${idx + 1} (Cronograma Anual)`,
        indicator: `% Cobertura Capacitación (Meta: 100% del personal expuesto)`
      });
    });
  }

  return plan;
}

export interface AiConclusion {
  category: string;
  title: string;
  text: string;
  impact: string;
}

export function generateAiConclusions(data: DemographicsData): AiConclusion[] {
  const stats = extractStats(data);
  return [
    {
      category: 'Riesgo Psicosocial',
      title: 'Nivel de Estrés y Fatiga Mental en Operaciones',
      text: `El personal operativo reporta un índice de estrés medio-alto con un Índice Global de Bienestar general del ${stats.wellbeing}%. Las exigencias de atención, metas de tiempo medio de operación (AHT) y el contacto continuo explican el cansancio mental acumulado.`,
      impact: `Representa el factor de mayor incidencia en el índice del ${stats.absenteeism}% de ausentismo médico.`
    },
    {
      category: 'Riesgo Biomecánico',
      title: `Alta Prevalencia de Molestias en ${stats.primaryPain.bodyPart}`,
      text: `El ${stats.primaryPain.percentage}% de la nómina caracterizada reporta molestias musculoesqueléticas recurrentes en la zona de ${stats.primaryPain.bodyPart}. El sedentarismo prolongado ante terminales agrava la sintomatología postural.`,
      impact: 'Foco obligatorio para inspecciones de puesto de trabajo (SST) y pausas activas dirigidas.'
    },
    {
      category: 'Hábitos y Nutrición',
      title: 'Elevado Sedentarismo y Clasificación del IMC',
      text: `El ${stats.sedentary}% de los colaboradores admite nula actividad física regular. El ${stats.totalExcessWeight}% de la nómina presenta exceso de peso (sobrepeso u obesidad) con un IMC promedio de ${stats.avgImc}.`,
      impact: 'Aumenta el riesgo de morbilidad cardiometabólica y fatiga neuromuscular pre-turno.'
    }
  ];
}

