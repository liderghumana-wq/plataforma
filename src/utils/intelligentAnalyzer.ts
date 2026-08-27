import { DemographicsData } from '../types';

export interface AnalysisCard {
  id: string;
  variableName: string;
  categoryName: string;
  finding: string;
  risk: string;
  intervention: string;
  priority: 'Alta' | 'Media' | 'Baja';
  riskLevel: 'Alto' | 'Medio' | 'Bajo';
  details: { label: string; value: string | number }[];
}

export function analyzeDemographics(data: DemographicsData): AnalysisCard[] {
  const total = data.totalEmployees || 0;
  const raw = data.rawEmployees || [];
  const hasRaw = raw.length > 0;

  const cards: AnalysisCard[] = [];

  // ==========================================
  // 1. EDAD
  // ==========================================
  let agePredominant = 'N/A';
  let youngPct = 0;
  let youngCount = 0;
  let seniorPct = 0;
  let seniorCount = 0;

  if (data.ageGroups && data.ageGroups.length > 0) {
    const sortedGroups = [...data.ageGroups].sort((a, b) => b.value - a.value);
    agePredominant = sortedGroups[0]?.range || 'N/A';
  }

  if (hasRaw) {
    youngCount = raw.filter(e => e.edad < 28).length;
    youngPct = Math.round((youngCount / total) * 100);
    seniorCount = raw.filter(e => e.edad >= 56).length;
    seniorPct = Math.round((seniorCount / total) * 100);
  } else {
    // Estimación desde ageGroups
    const grp18_25 = data.ageGroups?.find(g => g.range.includes('18-25') || g.range.includes('18-24'))?.value || 0;
    const grp26_35 = data.ageGroups?.find(g => g.range.includes('26-35') || g.range.includes('25-30'))?.value || 0;
    // estimamos <28 como 18-25 + ~20% de 26-35
    youngCount = grp18_25 + Math.round(grp26_35 * 0.2);
    youngPct = total ? Math.round((youngCount / total) * 100) : 42;
    
    const grpSenior = data.ageGroups?.find(g => g.range.includes('56') || g.range.includes('más') || g.range.includes('50') || g.range.includes('51'))?.value || 0;
    seniorCount = grpSenior;
    seniorPct = total ? Math.round((seniorCount / total) * 100) : 2;
  }

  let edadRiskLevel: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
  let edadPriority: 'Alta' | 'Media' | 'Baja' = 'Baja';
  let edadFinding = `El grupo de edad predominante es de ${agePredominant}. `;
  let edadRisk = '';
  let edadIntervention = '';

  if (youngPct > 45) {
    edadRiskLevel = 'Alto';
    edadPriority = 'Alta';
    edadFinding += `Se detecta una altísima concentración de población joven (<28 años) que representa el ${youngPct}% (${youngCount} colaboradores) de la nómina.`;
    edadRisk = 'Riesgo inminente de alta rotación temprana, baja adaptabilidad a la disciplina corporativa rígida y mayor susceptibilidad a factores psicosociales intralaborales.';
    edadIntervention = 'Diseñar planes de carrera acelerados, programas de mentoría, flexibilización de turnos y esquemas de retención basados en gamificación y salario emocional.';
  } else if (youngPct > 30) {
    edadRiskLevel = 'Medio';
    edadPriority = 'Media';
    edadFinding += `Existe una presencia importante de colaboradores jóvenes (<28 años) con un ${youngPct}% (${youngCount} personas).`;
    edadRisk = 'Nivel intermedio de rotación. Brechas motivacionales entre las expectativas del personal junior y los incentivos actuales.';
    edadIntervention = 'Establecer canales activos de retroalimentación, inducciones lúdicas de SST y actividades de team-building enfocadas en su perfil generacional.';
  } else {
    edadFinding += `La población joven (<28 años) representa el ${youngPct}% (${youngCount} personas), mientras que la población mayor de 50 años representa el ${seniorPct}% (${seniorCount} personas).`;
    edadRisk = 'Vulnerabilidad moderada ante enfermedades crónicas no transmisibles asociadas a la edad en el segmento mayor.';
    edadIntervention = 'Focalizar tamizajes cardiovasculares periódicos, pausas activas dirigidas de bajo impacto y preparación para la jubilación activa.';
  }

  cards.push({
    id: 'analisis-edad',
    variableName: 'Edad',
    categoryName: '1. Edad',
    finding: edadFinding,
    risk: edadRisk,
    intervention: edadIntervention,
    priority: edadPriority,
    riskLevel: edadRiskLevel,
    details: [
      { label: 'Grupo Predominante', value: agePredominant },
      { label: 'Población Joven (<28 años)', value: `${youngPct}% (${youngCount})` },
      { label: 'Población >50 años', value: `${seniorPct}% (${seniorCount})` }
    ]
  });

  // ==========================================
  // 2. GÉNERO
  // ==========================================
  const genderList = data.gender || [];
  const sortedGender = [...genderList].sort((a, b) => b.percentage - a.percentage);
  const primaryGen = sortedGender[0]?.name || 'N/A';
  const primaryGenPct = sortedGender[0]?.percentage || 0;
  const secondaryGen = sortedGender[1]?.name || 'N/A';
  const secondaryGenPct = sortedGender[1]?.percentage || 0;

  let genRiskLevel: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
  let genPriority: 'Alta' | 'Media' | 'Baja' = 'Baja';
  let genFinding = `Distribución de género predominantemente ${primaryGen} con el ${primaryGenPct}%. `;
  let genRisk = '';
  let genIntervention = '';

  if (genderList.length > 0) {
    const detailString = genderList.map(g => `${g.name}: ${g.percentage}%`).join(' | ');
    genFinding += `Distribución detallada: ${detailString}.`;
  }

  if (primaryGenPct > 65) {
    genRiskLevel = 'Medio';
    genPriority = 'Media';
    genRisk = `La alta concentración de género ${primaryGen} puede exacerbar patologías o riesgos ocupacionales con enfoque de género (por ejemplo, síndrome de túnel carpiano, fatiga por doble jornada laboral doméstica y estrés psicosocial de cuidado familiar).`;
    genIntervention = `Implementar un Programa de Ergonomía con Enfoque de Género, campañas para la equidad en el hogar, y flexibilidad horaria para cabezas de hogar monoparentales.`;
  } else {
    genRisk = 'Bajo riesgo por asimetría de género. Desafíos estándar asociados a la inclusión y bienestar de toda la nómina.';
    genIntervention = 'Fomentar la cultura de equidad, comités paritarios inclusivos y pautas de comunicación no sexistas en el entorno de operaciones.';
  }

  cards.push({
    id: 'analisis-genero',
    variableName: 'Género',
    categoryName: '2. Género',
    finding: genFinding,
    risk: genRisk,
    intervention: genIntervention,
    priority: genPriority,
    riskLevel: genRiskLevel,
    details: genderList.map(g => ({ label: g.name, value: `${g.percentage}% (${g.value || Math.round(total * (g.percentage/100))})` }))
  });

  // ==========================================
  // 3. ANTIGÜEDAD
  // ==========================================
  let antLess1 = 0;
  let ant1to5 = 0;
  let antMore5 = 0;

  if (hasRaw) {
    antLess1 = raw.filter(e => e.antiguedad < 1).length;
    ant1to5 = raw.filter(e => e.antiguedad >= 1 && e.antiguedad <= 5).length;
    antMore5 = raw.filter(e => e.antiguedad > 5).length;
  } else {
    // Estimaciones según promedio
    const avgS = data.averageSeniority || 2.1;
    if (avgS < 2) {
      antLess1 = Math.round(total * 0.48);
      ant1to5 = Math.round(total * 0.45);
      antMore5 = total - antLess1 - ant1to5;
    } else {
      antLess1 = Math.round(total * 0.35);
      ant1to5 = Math.round(total * 0.53);
      antMore5 = total - antLess1 - ant1to5;
    }
  }

  const pctLess1 = total ? Math.round((antLess1 / total) * 100) : 0;
  const pct1to5 = total ? Math.round((ant1to5 / total) * 100) : 0;
  const pctMore5 = total ? Math.round((antMore5 / total) * 100) : 0;

  let antRiskLevel: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
  let antPriority: 'Alta' | 'Media' | 'Baja' = 'Baja';
  let antFinding = `La antigüedad promedio es de ${data.averageSeniority || 2.1} años. El ${pctLess1}% (${antLess1} personas) lleva menos de 1 año en la empresa.`;
  let antRisk = '';
  let antIntervention = '';

  if (pctLess1 > 40) {
    antRiskLevel = 'Alto';
    antPriority = 'Alta';
    antRisk = 'La alta concentración de personal con antigüedad menor a 1 año indica fuga de talento recurrente, alta fatiga adaptativa y costos elevados de re-entrenamiento.';
    antIntervention = 'Fortalecer el programa de Onboarding (inducción asistida en SST), implementar incentivos por antigüedad y realizar entrevistas de retiro detalladas.';
  } else if (pctLess1 > 25) {
    antRiskLevel = 'Medio';
    antPriority = 'Media';
    antRisk = 'Tasa de rotación anual moderada. Riesgo de estancamiento en mandos medios y desmotivación en la curva de aprendizaje inicial.';
    antIntervention = 'Establecer bonos de permanencia para agentes sénior, re-entrenamientos ergonómicos post-inducción y planes de desarrollo enfocados.';
  } else {
    antRisk = 'Curva de estabilidad laboral adecuada. El riesgo principal radica en la fatiga acumulada del personal con más de 5 años.';
    antIntervention = 'Desplegar programas de rotación de tareas para mitigar el desgaste, reconocimientos públicos de lealtad y re-evaluaciones posturales especializadas.';
  }

  cards.push({
    id: 'analisis-antiguedad',
    variableName: 'Antigüedad',
    categoryName: '3. Antigüedad',
    finding: antFinding,
    risk: antRisk,
    intervention: antIntervention,
    priority: antPriority,
    riskLevel: antRiskLevel,
    details: [
      { label: 'Menos de 1 año', value: `${pctLess1}% (${antLess1})` },
      { label: 'Entre 1 y 5 años', value: `${pct1to5}% (${ant1to5})` },
      { label: 'Más de 5 años', value: `${pctMore5}% (${antMore5})` }
    ]
  });

  // ==========================================
  // 4. NIVEL EDUCATIVO
  // ==========================================
  const eduList = data.education || [];
  const sortedEdu = [...eduList].sort((a, b) => b.count - a.count);
  const mainEduLevel = sortedEdu[0]?.level || 'N/A';
  const mainEduCount = sortedEdu[0]?.count || 0;
  const mainEduPct = total ? Math.round((mainEduCount / total) * 100) : 0;

  let eduRiskLevel: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
  let eduPriority: 'Alta' | 'Media' | 'Baja' = 'Baja';
  let eduFinding = `El nivel educativo predominante es ${mainEduLevel} con el ${mainEduPct}% (${mainEduCount} colaboradores). `;
  let eduRisk = '';
  let eduIntervention = '';

  const detailsEdu = eduList.map(e => {
    const pct = total ? Math.round((e.count / total) * 100) : 0;
    return { label: e.level, value: `${pct}% (${e.count})` };
  });

  if (mainEduLevel.toLowerCase().includes('bachiller') && mainEduPct > 40) {
    eduRiskLevel = 'Medio';
    eduPriority = 'Media';
    eduRisk = 'La alta concentración de nivel de bachillerato puede requerir metodologías de capacitación en SST muy visuales e interactivas, y representa un riesgo de baja retención si los agentes buscan continuar sus estudios universitarios alternando horarios.';
    eduIntervention = 'Facilitar convenios educativos con instituciones técnicas, horarios flexibles para estudio de pregrado y capacitaciones micro-lúdicas dinámicas.';
  } else {
    eduRisk = 'Bajo riesgo académico. La nómina posee una capacidad de asimilación cognitiva alta para asimilar directrices técnicas y de seguridad complejas.';
    eduIntervention = 'Vincular a los profesionales y tecnólogos en el diseño e implementación del COPASST, y crear semilleros de auditores internos en seguridad.';
  }

  cards.push({
    id: 'analisis-educativo',
    variableName: 'Nivel Educativo',
    categoryName: '4. Nivel Educativo',
    finding: eduFinding,
    risk: eduRisk,
    intervention: eduIntervention,
    priority: eduPriority,
    riskLevel: eduRiskLevel,
    details: detailsEdu
  });

  // ==========================================
  // 5. ESTADO CIVIL
  // ==========================================
  const maritalList = data.maritalStatus || [];
  const sortedMarital = [...maritalList].sort((a, b) => b.count - a.count);
  const mainMaritalStatus = sortedMarital[0]?.status || 'N/A';
  const mainMaritalCount = sortedMarital[0]?.count || 0;
  const mainMaritalPct = total ? Math.round((mainMaritalCount / total) * 100) : 0;

  let maritalRiskLevel: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
  let maritalPriority: 'Alta' | 'Media' | 'Baja' = 'Baja';
  let maritalFinding = `Predominio de estado civil ${mainMaritalStatus} representando el ${mainMaritalPct}% (${mainMaritalCount} personas).`;
  let maritalRisk = '';
  let maritalIntervention = '';

  if (mainMaritalStatus.toLowerCase().includes('soltero')) {
    maritalRiskLevel = 'Bajo';
    maritalRisk = 'Los colaboradores solteros suelen requerir una fuerte motivación extrínseca e incentivos de crecimiento personal para no migrar rápidamente de empleo.';
    maritalIntervention = 'Ofrecer planes de esparcimiento nocturno, espacios de coworking atractivos, subsidios para gimnasios y proyectos de voluntariado corporativo.';
  } else {
    maritalRiskLevel = 'Medio';
    maritalPriority = 'Media';
    maritalRisk = 'Riesgo medio de conflicto trabajo-familia derivado del cuidado de dependientes, en especial bajo esquemas de turnos rotativos BPO.';
    maritalIntervention = 'Habilitar programas de desconexión laboral efectiva, turnos estables predecibles y capacitaciones de manejo de finanzas familiares.';
  }

  cards.push({
    id: 'analisis-estado-civil',
    variableName: 'Estado Civil',
    categoryName: '5. Estado Civil',
    finding: maritalFinding,
    risk: maritalRisk,
    intervention: maritalIntervention,
    priority: maritalPriority,
    riskLevel: maritalRiskLevel,
    details: maritalList.map(m => {
      const pct = total ? Math.round((m.count / total) * 100) : 0;
      return { label: m.status, value: `${pct}% (${m.count})` };
    })
  });

  // ==========================================
  // 6. TIPO DE CONTRATO
  // ==========================================
  const contractList = data.contractType || [];
  const sortedContract = [...contractList].sort((a, b) => b.count - a.count);
  const mainContract = sortedContract[0]?.type || 'N/A';
  const mainContractCount = sortedContract[0]?.count || 0;
  const mainContractPct = total ? Math.round((mainContractCount / total) * 100) : 0;

  let contractRiskLevel: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
  let contractPriority: 'Alta' | 'Media' | 'Baja' = 'Baja';
  let contractFinding = `El tipo de vinculación mayoritario es ${mainContract} con el ${mainContractPct}% (${mainContractCount} personas).`;
  let contractRisk = '';
  let contractIntervention = '';

  const tempContractPct = contractList
    .filter(c => c.type.toLowerCase().includes('obra') || c.type.toLowerCase().includes('fijo') || c.type.toLowerCase().includes('temporal'))
    .reduce((acc, curr) => acc + curr.percentage, 0);

  if (tempContractPct > 35) {
    contractRiskLevel = 'Alto';
    contractPriority = 'Alta';
    contractRisk = `Un ${tempContractPct}% de contratos temporales o por obra-labor debilita el sentido de pertenencia, aumenta la rotación voluntaria y dificulta el seguimiento epidemiológico continuo en el SG-SST.`;
    contractIntervention = 'Estructurar políticas claras de migración a contrato a término indefinido por cumplimiento de KPI de ausentismo y desempeño, reforzando la estabilidad laboral.';
  } else if (tempContractPct > 15) {
    contractRiskLevel = 'Medio';
    contractPriority = 'Media';
    contractRisk = 'Incertidumbre laboral moderada en segmentos específicos que puede incidir negativamente en los niveles de estrés percibido y clima general.';
    contractIntervention = 'Socializar cronogramas de evaluación de desempeño claros y otorgar los mismos beneficios extralegales a contratos de obra/labor.';
  } else {
    contractRisk = 'Bajo riesgo contractual. El predominio del término indefinido fomenta estabilidad y lealtad con el sistema de salud organizacional.';
    contractIntervention = 'Aprovechar la estabilidad para certificar líderes de brigadas y copasst con capacitaciones de largo aliento avaladas por el Sena o ARL.';
  }

  cards.push({
    id: 'analisis-contrato',
    variableName: 'Tipo de Contrato',
    categoryName: '6. Tipo de Contrato',
    finding: contractFinding,
    risk: contractRisk,
    intervention: contractIntervention,
    priority: contractPriority,
    riskLevel: contractRiskLevel,
    details: contractList.map(c => ({ label: c.type, value: `${c.percentage}% (${c.count})` }))
  });

  // ==========================================
  // 7. PERSONAS CON HIJOS
  // ==========================================
  const childrenPct = data.hasChildrenPercentage || 0;
  const withKidsCount = Math.round(total * (childrenPct / 100));
  const noKidsCount = total - withKidsCount;

  let kidsRiskLevel: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
  let kidsPriority: 'Alta' | 'Media' | 'Baja' = 'Baja';
  let kidsFinding = `El ${childrenPct}% (${withKidsCount} colaboradores) tiene hijos a cargo, mientras que el ${100 - childrenPct}% (${noKidsCount}) no posee hijos.`;
  let kidsRisk = '';
  let kidsIntervention = '';

  if (childrenPct > 45) {
    kidsRiskLevel = 'Medio';
    kidsPriority = 'Media';
    kidsRisk = 'Riesgo de ausentismo imprevisto por emergencias médicas infantiles, dificultades de cuidado en vacaciones escolares y alto gasto de ingresos en canasta familiar.';
    kidsIntervention = 'Establecer convenios con jardines infantiles de horario extendido, celebrar el día de la familia con actividades integradoras y dar apoyo escolar en útiles.';
  } else {
    kidsRisk = 'Menor vulnerabilidad por ausentismo asociado a calamidades domésticas infantiles directas.';
    kidsIntervention = 'Implementar programas de balance vida-trabajo y de ocio que atraigan tanto al segmento monoparental como al segmento joven sin hijos (pet-friendly, etc.).';
  }

  cards.push({
    id: 'analisis-hijos',
    variableName: 'Personas con Hijos',
    categoryName: '7. Personas con Hijos',
    finding: kidsFinding,
    risk: kidsRisk,
    intervention: kidsIntervention,
    priority: kidsPriority,
    riskLevel: kidsRiskLevel,
    details: [
      { label: 'Tienen Hijos', value: `${childrenPct}% (${withKidsCount})` },
      { label: 'No Tienen Hijos', value: `${100 - childrenPct}% (${noKidsCount})` }
    ]
  });

  // ==========================================
  // 8. PERSONAS CON DISCAPACIDAD
  // ==========================================
  const discCount = data.disabilityCount || 0;
  const discPct = data.disabilityPercentage || (total ? parseFloat(((discCount / total) * 100).toFixed(1)) : 0);

  let discRiskLevel: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
  let discPriority: 'Alta' | 'Media' | 'Baja' = 'Baja';
  let discFinding = '';
  let discRisk = '';
  let discIntervention = '';

  if (discCount > 0) {
    discFinding = `Se registran ${discCount} colaboradores con alguna discapacidad declarada, lo que equivale al ${discPct}% de la nómina.`;
    if (discPct > 4) {
      discRiskLevel = 'Medio';
      discPriority = 'Media';
      discRisk = 'Riesgo de fallas de accesibilidad arquitectónica, barreras en canales digitales de comunicación y falta de puestos adaptados ergonómicamente.';
      discIntervention = 'Auditar accesibilidad física de los puestos BPO, capacitar a supervisores en inclusión laboral y estructurar planes de emergencia inclusivos.';
    } else {
      discRisk = 'El riesgo de accidentabilidad o exclusión es moderado-bajo pero requiere vigilancia ergonómica del puesto de trabajo.';
      discIntervention = 'Asegurar la debida caracterización de la discapacidad en los exámenes de medicina ocupacional y garantizar adaptaciones razonables de hardware.';
    }
  } else {
    discFinding = 'No se registran casos de personas con discapacidad en la base sociodemográfica analizada.';
    discRisk = 'Riesgo muy bajo relacionado. El principal desafío es la ausencia de políticas activas de inclusión que puedan beneficiar a la reputación corporativa.';
    discIntervention = 'Crear un plan o política formal de inclusión laboral y evaluar la adaptabilidad física y tecnológica de la sede ante futuras postulaciones.';
  }

  cards.push({
    id: 'analisis-discapacidad',
    variableName: 'Personas con Discapacidad',
    categoryName: '8. Personas con Discapacidad',
    finding: discFinding,
    risk: discRisk,
    intervention: discIntervention,
    priority: discPriority,
    riskLevel: discRiskLevel,
    details: [
      { label: 'Personas con Discapacidad', value: `${discPct}% (${discCount})` },
      { label: 'Sin Discapacidad', value: `${total ? parseFloat((100 - discPct).toFixed(1)) : 100}% (${total - discCount})` }
    ]
  });

  // ==========================================
  // 9. GRUPO ÉTNICO
  // ==========================================
  const ethnicList = data.ethnicGroups || [];
  const sortedEthnic = [...ethnicList].sort((a, b) => b.count - a.count);
  const mainEthnic = sortedEthnic[0]?.name || 'Ninguno / No autoidentifica';
  const mainEthnicCount = sortedEthnic[0]?.count || 0;
  const mainEthnicPct = total ? Math.round((mainEthnicCount / total) * 100) : 0;

  let ethnicRiskLevel: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
  let ethnicFinding = `Autoidentificación étnica mayoritaria: ${mainEthnic} con el ${mainEthnicPct}% (${mainEthnicCount} colaboradores).`;
  let ethnicRisk = '';
  let ethnicIntervention = '';

  const minorityCount = ethnicList
    .filter(e => !e.name.toLowerCase().includes('ninguno') && !e.name.toLowerCase().includes('no auto'))
    .reduce((acc, curr) => acc + curr.count, 0);
  const minorityPct = total ? Math.round((minorityCount / total) * 100) : 0;

  if (minorityPct > 15) {
    ethnicFinding += ` Diversidad étnica de minorías representa el ${minorityPct}% (${minorityCount} colaboradores).`;
    ethnicRisk = 'Posibles roces culturales o barreras psicosociales asociadas a sesgos inconscientes en mandos medios u operaciones si no se fomenta la diversidad.';
    ethnicIntervention = 'Establecer talleres de concientización cultural, celebrar días de la diversidad étnica y fortalecer canales de denuncia anónima.';
  } else {
    ethnicRisk = 'Bajo riesgo de tensión intercultural. Se requiere mantener el respeto mutuo e inclusión estándar.';
    ethnicIntervention = 'Mantener la política de cero tolerancia al racismo o discriminación en la inducción de talento humano.';
  }

  cards.push({
    id: 'analisis-etnico',
    variableName: 'Grupo Étnico',
    categoryName: '9. Grupo Étnico',
    finding: ethnicFinding,
    risk: ethnicRisk,
    intervention: ethnicIntervention,
    priority: 'Baja',
    riskLevel: ethnicRiskLevel,
    details: ethnicList.map(e => ({ label: e.name, value: `${e.percentage}% (${e.count})` }))
  });

  // ==========================================
  // 10. TIPO DE VIVIENDA
  // ==========================================
  const housingList = data.housing || [];
  const sortedHousing = [...housingList].sort((a, b) => b.count - a.count);
  const mainHousing = sortedHousing[0]?.type || 'N/A';
  const mainHousingCount = sortedHousing[0]?.count || 0;
  const mainHousingPct = total ? Math.round((mainHousingCount / total) * 100) : 0;

  const rentPct = housingList.find(h => h.type.toLowerCase().includes('arrendada') || h.type.toLowerCase().includes('arriendo'))?.percentage || 0;
  const rentCount = housingList.find(h => h.type.toLowerCase().includes('arrendada') || h.type.toLowerCase().includes('arriendo'))?.count || 0;

  let housingRiskLevel: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
  let housingPriority: 'Alta' | 'Media' | 'Baja' = 'Baja';
  let housingFinding = `El ${mainHousingPct}% (${mainHousingCount} personas) vive en vivienda ${mainHousing}. `;
  let housingRisk = '';
  let housingIntervention = '';

  if (rentPct > 55) {
    housingRiskLevel = 'Alto';
    housingPriority = 'Alta';
    housingFinding += `Se detecta una vulnerabilidad habitacional preocupante: el ${rentPct}% (${rentCount} colaboradores) paga arriendo mensual.`;
    housingRisk = 'Alta carga de estrés financiero de arriendo, inestabilidad de ubicación geográfica que influye en tiempos excesivos de desplazamiento y riesgo de mudanza recurrente.';
    housingIntervention = 'Gestionar ferias de vivienda con cajas de compensación familiar en las instalaciones, facilitar créditos de libranza de bajo costo para abono de cuota inicial y promover el teletrabajo.';
  } else if (rentPct > 35) {
    housingRiskLevel = 'Medio';
    housingPriority = 'Media';
    housingFinding += `Un porcentaje moderado del ${rentPct}% (${rentCount} colaboradores) reside en vivienda arrendada.`;
    housingRisk = 'Presión financiera habitual sobre los ingresos, lo cual es un factor extralaboral de insatisfacción.';
    housingIntervention = 'Capacitar en subsidios de caja de compensación para adquisición de vivienda de interés social (VIS).';
  } else {
    housingRisk = 'Sólido factor protector. Una gran parte de la nómina reside en vivienda propia o familiar, promoviendo arraigo y bienestar socioeconómico.';
    housingIntervention = 'Otorgar auxilios para mejoras de vivienda para colaboradores con casa propia, reforzando sus factores de protección familiar.';
  }

  cards.push({
    id: 'analisis-vivienda',
    variableName: 'Tipo de Vivienda',
    categoryName: '10. Tipo de Vivienda',
    finding: housingFinding,
    risk: housingRisk,
    intervention: housingIntervention,
    priority: housingPriority,
    riskLevel: housingRiskLevel,
    details: housingList.map(h => ({ label: h.type, value: `${h.percentage}% (${h.count})` }))
  });

  // ==========================================
  // 11. ESTRATO SOCIOECONÓMICO
  // ==========================================
  const strataList = data.socioeconomicStrata || [];
  const countStratum1_2 = strataList
    .filter(s => s.stratum.includes('1') || s.stratum.includes('2'))
    .reduce((acc, curr) => acc + curr.count, 0);
  const pctStratum1_2 = total ? Math.round((countStratum1_2 / total) * 100) : 0;

  let strataRiskLevel: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
  let strataPriority: 'Alta' | 'Media' | 'Baja' = 'Baja';
  let strataFinding = '';
  let strataRisk = '';
  let strataIntervention = '';

  if (strataList.length > 0) {
    const sortedStrata = [...strataList].sort((a, b) => b.count - a.count);
    const mainStratum = sortedStrata[0]?.stratum || 'N/A';
    const mainStratumPct = sortedStrata[0]?.percentage || 0;
    strataFinding = `El estrato socioeconómico predominante es ${mainStratum} con el ${mainStratumPct}%. `;
  }

  if (pctStratum1_2 > 55) {
    strataRiskLevel = 'Alto';
    strataPriority = 'Alta';
    strataFinding += `El ${pctStratum1_2}% (${countStratum1_2} colaboradores) reside en estratos de alta vulnerabilidad (1 y 2).`;
    strataRisk = 'Presencia crítica de estresores extralaborales: inseguridad barrial, servicios públicos costosos, alta dependencia del transporte público y vulnerabilidad nutricional.';
    strataIntervention = 'Implementar subsidios de transporte extralegales, otorgar refrigerios corporativos saludables balanceados, y capacitar en educación financiera para mitigación de deudas.';
  } else if (pctStratum1_2 > 35) {
    strataRiskLevel = 'Medio';
    strataPriority = 'Media';
    strataFinding += `El ${pctStratum1_2}% (${countStratum1_2} colaboradores) reside en estratos 1 y 2.`;
    strataRisk = 'Vulnerabilidad socioeconómica moderada. Sensibilidad a costos de vida urbanos y tiempos de traslado.';
    strataIntervention = 'Organizar programas de becas corporativas o convenios de transporte con rutas internas hacia puntos nodales de la ciudad.';
  } else {
    strataRisk = 'Distribución socioeconómica balanceada. Menores presiones de vulnerabilidad barrial directa.';
    strataIntervention = 'Mantener monitoreo de ingresos contra IPC para conservar el poder adquisitivo real de los agentes.';
  }

  cards.push({
    id: 'analisis-estrato',
    variableName: 'Estrato Socioeconómico',
    categoryName: '11. Estrato Socioeconómico',
    finding: strataFinding,
    risk: strataRisk,
    intervention: strataIntervention,
    priority: strataPriority,
    riskLevel: strataRiskLevel,
    details: strataList.map(s => ({ label: s.stratum, value: `${s.percentage}% (${s.count})` }))
  });

  // ==========================================
  // 12. DEPARTAMENTO Y CIUDAD
  // ==========================================
  const cityList = data.city || [];
  const sortedCities = [...cityList].sort((a, b) => b.count - a.count);
  const mainCity = sortedCities[0]?.name || 'N/A';
  const mainCityCount = sortedCities[0]?.count || 0;
  const mainCityPct = total ? Math.round((mainCityCount / total) * 100) : 0;

  const deptList = data.departmentWellbeing || [];
  const sortedDepts = [...deptList].sort((a, b) => b.agents - a.agents);
  const mainDept = sortedDepts[0]?.name || 'N/A';
  const mainDeptCount = sortedDepts[0]?.agents || 0;
  const mainDeptPct = total ? Math.round((mainDeptCount / total) * 100) : 0;

  let geoRiskLevel: 'Alto' | 'Medio' | 'Bajo' = 'Bajo';
  let geoPriority: 'Alta' | 'Media' | 'Baja' = 'Baja';
  let geoFinding = `La concentración geográfica principal está en ${mainCity} (${mainCityPct}% / ${mainCityCount} personas), y el área con mayor número de colaboradores es ${mainDept} (${mainDeptPct}% / ${mainDeptCount} agentes).`;
  let geoRisk = '';
  let geoIntervention = '';

  if (mainCityPct > 70 || mainDeptPct > 70) {
    geoRiskLevel = 'Medio';
    geoPriority = 'Media';
    geoRisk = `La alta dependencia operativa de la ciudad de ${mainCity} o del departamento ${mainDept} concentra los riesgos de ausentismo masivo ante huelgas de transporte local, epidemias zonales o fallas tecnológicas de conectividad.`;
    geoIntervention = `Establecer un plan de contingencia tecnológico bimodal (teletrabajo espejo), diversificar geográficamente nuevos hubs de contratación y rotar personal clave.`;
  } else {
    geoRisk = 'Distribución geográfica y departamental estable con baja concentración de riesgo sistémico localizado.';
    geoIntervention = 'Adaptar el plan de capacitaciones en SST y brigadas de evacuación de forma descentralizada por sedes y departamentos.';
  }

  const detailsGeo = [
    ...sortedCities.slice(0, 3).map(c => {
      const pct = total ? Math.round((c.count / total) * 100) : 0;
      return { label: `Sede: ${c.name}`, value: `${pct}% (${c.count})` };
    }),
    ...sortedDepts.slice(0, 2).map(d => {
      const pct = total ? Math.round((d.agents / total) * 100) : 0;
      return { label: `Área: ${d.name}`, value: `${pct}% (${d.agents})` };
    })
  ];

  cards.push({
    id: 'analisis-geografico',
    variableName: 'Departamento y Ciudad',
    categoryName: '12. Departamento y Ciudad',
    finding: geoFinding,
    risk: geoRisk,
    intervention: geoIntervention,
    priority: geoPriority,
    riskLevel: geoRiskLevel,
    details: detailsGeo
  });

  return cards;
}
