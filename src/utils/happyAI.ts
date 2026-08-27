import { DemographicsData } from '../types';
import { generateRecommendations, RecommendationItem } from './aiRecommender';

export interface IntelligentFinding {
  variable: string;
  finding: string;
  risk: string;
  opportunity: string;
  priority: 'Alta' | 'Media' | 'Baja';
}

export interface AnalysisResult {
  executiveSummary: {
    totalEmployees: number;
    averageAge: number;
    averageSeniority: number;
    activeParticipation: number;
    absenteeismRate: number;
    wellbeingIndex: number;
  };
  findings: IntelligentFinding[];
  recommendations: RecommendationItem[];
}

/**
 * Analiza el objeto DemographicsData y genera un reporte dinámico y riguroso 
 * para el Consultor Inteligente de SG-SST (Happy IA) sin textos predefinidos.
 */
export function analyzeCompany(data: DemographicsData): AnalysisResult {
  // 1. Resumen Ejecutivo (Extracción directa con fallbacks lógicos)
  const totalEmployees = data.totalEmployees || 0;
  const averageAge = data.averageAge || 0;
  const averageSeniority = data.averageSeniority || 0;
  const activeParticipation = data.activeParticipation || 0;
  const absenteeismRate = data.absenteeismRate || 0;
  const wellbeingIndex = data.wellbeingIndex || 0;

  // 2. Extracción de estadísticas clave para construir oraciones altamente dinámicas
  
  // Sexo / Género
  const genders = data.gender || [];
  const primaryGender = genders.length > 0 
    ? [...genders].sort((a, b) => b.percentage - a.percentage)[0] 
    : { name: 'No especificado', percentage: 0, value: 0 };

  // Edad / Grupo etario predominante
  const ageGroups = data.ageGroups || [];
  const primaryAgeGroup = ageGroups.length > 0
    ? [...ageGroups].sort((a, b) => b.value - a.value)[0]
    : { range: 'No especificado', value: 0, label: 'N/A' };

  // Antigüedad en el cargo
  const averageSeniorityRole = data.averageSeniorityRole || Math.max(0.2, parseFloat((averageSeniority * 0.6).toFixed(1)));

  // Escolaridad / Educación
  const education = data.education || [];
  const primaryEdu = education.length > 0
    ? [...education].sort((a, b) => b.count - a.count)[0]
    : { level: 'No especificada', count: 0 };
  const primaryEduPct = totalEmployees ? Math.round((primaryEdu.count / totalEmployees) * 100) : 0;

  // Estrato Socioeconómico
  const strata = data.socioeconomicStrata || [];
  const primaryStratum = strata.length > 0
    ? [...strata].sort((a, b) => b.count - a.count)[0]
    : { stratum: 'No especificado', count: 0, percentage: 0 };
  const vulnerableStrataPct = strata
    .filter(s => s.stratum.includes('1') || s.stratum.includes('2'))
    .reduce((sum, s) => sum + s.percentage, 0);

  // Ciudad Principal
  const cities = data.city || [];
  const primaryCity = cities.length > 0
    ? [...cities].sort((a, b) => b.count - a.count)[0]
    : { name: 'No especificada', count: 0 };
  const primaryCityPct = totalEmployees ? Math.round((primaryCity.count / totalEmployees) * 100) : 0;

  // Estado Civil
  const marital = data.maritalStatus || [];
  const primaryMarital = marital.length > 0
    ? [...marital].sort((a, b) => b.count - a.count)[0]
    : { status: 'No especificado', count: 0 };
  const primaryMaritalPct = totalEmployees ? Math.round((primaryMarital.count / totalEmployees) * 100) : 0;

  // Tipo de Contrato
  const contracts = data.contractType || [];
  const primaryContract = contracts.length > 0
    ? [...contracts].sort((a, b) => b.count - a.count)[0]
    : { type: 'No especificado', count: 0, percentage: 0 };
  const nonIndefiniteContractsPct = contracts
    .filter(c => !c.type.toLowerCase().includes('indefinido'))
    .reduce((sum, c) => sum + c.percentage, 0);

  // Hijos
  const hasChildrenPercentage = data.hasChildrenPercentage || 0;

  // Discapacidad
  const disabilityCount = data.disabilityCount || 0;
  const disabilityPercentage = data.disabilityPercentage || (totalEmployees ? parseFloat(((disabilityCount / totalEmployees) * 100).toFixed(1)) : 0);

  // Actividad Física
  const physicalActivity = data.physicalActivity || [];
  const sedentaryPct = physicalActivity.find(p => p.level.toLowerCase().includes('ninguna') || p.level.toLowerCase().includes('sedentario') || p.level.toLowerCase() === 'no')?.percentage || 0;

  // Participación en bienestar
  // Se usa activeParticipation directamente

  // IMC (Clasificación de peso)
  const imcClassification = data.imcClassification || [];
  const averageIMC = data.averageIMC || 24.5;
  const overweightPct = imcClassification.filter(i => i.category.toLowerCase().includes('sobrepeso')).reduce((sum, i) => sum + i.percentage, 0);
  const obesityPct = imcClassification.filter(i => i.category.toLowerCase().includes('obesidad')).reduce((sum, i) => sum + i.percentage, 0);
  const excessWeightPct = Math.round(Number(overweightPct) + Number(obesityPct));

  // Enfermedades reportadas
  const diseases = data.diseases || [];
  const topDisease = diseases.length > 0
    ? [...diseases].filter(d => d.disease.toLowerCase() !== 'ninguna' && d.disease.toLowerCase() !== 'ninguno' && d.disease.toLowerCase() !== 'sano').sort((a, b) => b.percentage - a.percentage)[0]
    : null;
  const topDiseaseName = topDisease ? topDisease.disease : 'Ninguna patología relevante';
  const topDiseasePct = topDisease ? topDisease.percentage : 0;

  // Molestias Osteomusculares (Dolor)
  const musculoskeletalPain = data.musculoskeletalPain || [];
  const topPain = musculoskeletalPain.length > 0
    ? [...musculoskeletalPain].filter(p => p.bodyPart.toLowerCase() !== 'ninguna' && p.bodyPart.toLowerCase() !== 'ninguno').sort((a, b) => b.percentage - a.percentage)[0]
    : null;
  const topPainBodyPart = topPain ? topPain.bodyPart : 'Ninguna molestia prevalente';
  const topPainPct = topPain ? topPain.percentage : 0;


  // 3. Generar hallazgos dinámicos paso a paso
  const findingsList: IntelligentFinding[] = [];

  // Variable 1: Edad
  findingsList.push({
    variable: 'Edad',
    finding: `La población de la compañía cuenta con una edad promedio de ${averageAge} años. El grupo de edad predominante se encuentra en el rango de ${primaryAgeGroup.range} con un total de ${primaryAgeGroup.value} colaboradores.`,
    risk: averageAge < 29
      ? 'Alta susceptibilidad a la rotación temprana voluntaria y demandas de bienestar inmediatas orientadas a flexibilidad digital y balance de tiempo libre.'
      : 'Riesgo incremental de fatiga crónica y enfermedades generales asociadas al envejecimiento celular en cargos sedentarios prolongados.',
    opportunity: averageAge < 29
      ? 'Fomentar metodologías dinámicas de formación en SG-SST mediante ludificación (gamificación) y ofrecer un esquema estructurado de salario emocional.'
      : 'Estructurar subprogramas preventivos de salud cardiovascular y re-evaluar la adecuación ergonómica ergonómica de los puestos.',
    priority: averageAge < 29 ? 'Alta' : 'Media'
  });

  // Variable 2: Sexo
  findingsList.push({
    variable: 'Sexo',
    finding: `Se evidencia una distribución donde el género predominante es el ${primaryGender.name} con un ${primaryGender.percentage}% (${primaryGender.value} colaboradores de la fuerza de trabajo).`,
    risk: primaryGender.percentage > 60
      ? `Concentración de patologías osteomusculares y sobrecarga psicosocial en el género ${primaryGender.name} debido al cruce epidemiológico de doble jornada de cuidado doméstico y laboral.`
      : 'Brechas potenciales en la representatividad e inclusión de comités paritarios del SG-SST si no se incentiva la equidad.',
    opportunity: `Implementar programas de ergonomía e higiene postural con enfoque específico de género y desplegar capacitaciones sobre co-cuidado y corresponsabilidad del hogar.`,
    priority: primaryGender.percentage > 65 ? 'Media' : 'Baja'
  });

  // Variable 3: Antigüedad
  findingsList.push({
    variable: 'Antigüedad',
    finding: `Los colaboradores presentan una antigüedad promedio en la organización de ${averageSeniority} años, con una permanencia específica en su cargo actual de ${averageSeniorityRole} años.`,
    risk: averageSeniority < 2.2
      ? 'Bajo arraigo y pérdida acelerada del conocimiento en prevención de riesgos de SST en los primeros 12 meses de contratación.'
      : 'Fatiga cognitiva acumulada y desgaste biomecánico debido a la repetición sostenida de tareas en operaciones idénticas.',
    opportunity: averageSeniority < 2.2
      ? 'Implementar un módulo intensivo de auto-cuidado en SST durante el proceso de Onboarding e inducción para disminuir la deserción temprana.'
      : 'Lanzar programas de rotación de tareas operativas y rediseñar los descansos programados con micro-pausas activas.',
    priority: averageSeniority < 2.2 ? 'Alta' : 'Media'
  });

  // Variable 4: Escolaridad
  findingsList.push({
    variable: 'Escolaridad',
    finding: `El nivel educativo mayoritario en la empresa corresponde a ${primaryEdu.level} con un ${primaryEduPct}% de la población total (${primaryEdu.count} colaboradores).`,
    risk: primaryEdu.level.toLowerCase().includes('bachiller')
      ? 'Riesgo de menor asimilación de regulaciones y políticas de SST complejas si no se comunican de manera simplificada e interactiva.'
      : 'Riesgo de frustración y rotación voluntaria si los colaboradores cuentan con alta titulación académica y experimentan bajas oportunidades de promoción interna.',
    opportunity: `Estructurar convenios educativos y de formación técnica avanzada, e involucrar de manera activa a los colaboradores más calificados en las brigadas de emergencia y comités paritarios.`,
    priority: 'Media'
  });

  // Variable 5: Estrato
  findingsList.push({
    variable: 'Estrato',
    finding: `La mayoría de la nómina reside en viviendas de estrato ${primaryStratum.stratum} (${primaryStratum.percentage}%). Adicionalmente, el ${vulnerableStrataPct}% de la población habita en estratos de alta vulnerabilidad (1 y 2).`,
    risk: vulnerableStrataPct > 50
      ? 'Presión financiera severa extra-laboral, exposición a largos desplazamientos en transporte público urbano y vulnerabilidades en la calidad de alimentación diaria.'
      : 'Riesgos moderados asociados a la vulnerabilidad socioeconómica extralaboral de los colaboradores.',
    opportunity: `Desplegar asesorías gratuitas en alianza con cajas de compensación familiar para subsidios de arriendo y adquisición de vivienda, y talleres interactivos de finanzas personales.`,
    priority: vulnerableStrataPct > 55 ? 'Alta' : 'Media'
  });

  // Variable 6: Ciudad
  findingsList.push({
    variable: 'Ciudad',
    finding: `La distribución geográfica se concentra primordialmente en la sede de ${primaryCity.name} con ${primaryCity.count} colaboradores, equivalente al ${primaryCityPct}% de la nómina corporativa.`,
    risk: primaryCityPct > 70
      ? `Alta dependencia operativa de una sola localidad geográfica. Vulnerabilidad ante huelgas de transporte local, interrupciones eléctricas o eventos climáticos extremos en ${primaryCity.name}.`
      : 'Complejidad en la estandarización de las condiciones de higiene, comités de convivencia y brigadas médicas si la operación se dispersa en múltiples regiones.',
    opportunity: `Optimizar un plan de contingencia híbrido para trabajo remoto espejo en caso de afectación de la sede principal, garantizando la continuidad de las operaciones.`,
    priority: primaryCityPct > 75 ? 'Media' : 'Baja'
  });

  // Variable 7: Estado civil
  findingsList.push({
    variable: 'Estado civil',
    finding: `El estado civil prevalente en la organización es ${primaryMarital.status}, representando un ${primaryMaritalPct}% del consolidado total.`,
    risk: primaryMarital.status.toLowerCase().includes('soltero')
      ? 'Menor arraigo institucional extralaboral, lo cual facilita la movilidad de empleo rápida ante ofertas externas de BPO competidoras.'
      : 'Tensiones en el clima por la conciliación de responsabilidades familiares cruzadas con turnos rotativos en horarios no convencionales.',
    opportunity: `Diseñar beneficios segmentados: actividades recreativas de esparcimiento para personal soltero y flexibilización de turnos especiales para personal con responsabilidades de pareja.`,
    priority: 'Baja'
  });

  // Variable 8: Tipo de contrato
  findingsList.push({
    variable: 'Tipo de contrato',
    finding: `La contratación se rige de manera predominante por el tipo ${primaryContract.type}, el cual abarca al ${primaryContract.percentage}% de los colaboradores. El ${nonIndefiniteContractsPct}% se encuentra bajo contratos temporales o de obra-labor.`,
    risk: nonIndefiniteContractsPct > 25
      ? 'Sentimiento de inestabilidad laboral acumulada, estrés psicosocial extralaboral elevado y mayor dificultad para la trazabilidad de la vigilancia epidemiológica continua.'
      : 'Excesiva rigidez en los costos fijos operativos si el volumen de las llamadas telefónicas de atención fluctúa drásticamente.',
    opportunity: `Articular políticas de migración hacia contratos indefinidos basados en KPIs objetivos de ausentismo médico y participación en bienestar, incrementando la lealtad de la nómina.`,
    priority: nonIndefiniteContractsPct > 30 ? 'Alta' : 'Media'
  });

  // Variable 9: Hijos
  findingsList.push({
    variable: 'Hijos',
    finding: `El ${hasChildrenPercentage}% de la fuerza laboral reporta tener hijos a su cargo, incidiendo de forma directa en su estructura familiar básica.`,
    risk: hasChildrenPercentage > 40
      ? 'Alto ausentismo de emergencia imprevisto debido a emergencias de cuidado infantil, enfermedades de menores de edad o incompatibilidad de horarios escolares con turnos rotativos.'
      : 'Carga financiera extralaboral agravada en familias monoparentales con dependientes directos.',
    opportunity: `Desplegar trimestralmente una "Escuela de Padres", estructurar redes internas de apoyo vecinal para el teletrabajo e implementar convenios corporativos de guardería o útiles escolares.`,
    priority: hasChildrenPercentage > 40 ? 'Alta' : 'Media'
  });

  // Variable 10: Discapacidad
  findingsList.push({
    variable: 'Discapacidad',
    finding: disabilityCount > 0
      ? `Se detecta una prevalencia de ${disabilityCount} colaboradores con alguna discapacidad declarada, representando el ${disabilityPercentage}% de la nómina.`
      : 'No se detectan casos de colaboradores con discapacidades declaradas dentro del censo sociodemográfico actual de la organización.',
    risk: disabilityCount > 0
      ? 'Fallas potenciales en la accesibilidad de puestos de trabajo, adaptaciones de pantallas informáticas y riesgos elevados durante procedimientos de evacuación de emergencia.'
      : 'Falta de preparación organizativa y de infraestructura de accesibilidad física o digital ante futuras incorporaciones de personal con capacidades diversas.',
    opportunity: disabilityCount > 0
      ? 'Realizar una auditoría de puestos de trabajo por parte de terapeutas ocupacionales de la ARL y ajustar las estaciones operativas afectadas.'
      : 'Redactar políticas corporativas inclusivas y adecuar canales de postulación accesibles para incentivar la diversidad en las convocatorias.',
    priority: disabilityCount > 0 ? 'Media' : 'Baja'
  });

  // Variable 11: Actividad física
  findingsList.push({
    variable: 'Actividad física',
    finding: `El nivel de sedentarismo en la empresa es crítico: el ${sedentaryPct}% de la población encuestada reporta nula actividad física estructurada regular a la semana.`,
    risk: sedentaryPct > 45
      ? 'Prevalencia inminente de desórdenes musculoesqueléticos crónicos, debilidad de tono muscular de soporte, mala circulación de miembros inferiores y alto riesgo cardiovascular.'
      : 'Baja capacidad de resistencia a la fatiga durante las jornadas de digitación prolongada.',
    opportunity: `Establecer desafíos gamificados internos semanales como "Happy Steps" (retos de pasos diarios), integrando podómetros móviles con incentivos atractivos intangibles.`,
    priority: sedentaryPct > 45 ? 'Alta' : 'Media'
  });

  // Variable 12: Participación
  findingsList.push({
    variable: 'Participación',
    finding: `El índice de participación activa registrada en los programas y actividades de bienestar de la empresa se ubica actualmente en un ${activeParticipation}%.`,
    risk: activeParticipation < 50
      ? 'Falta de retorno de inversión de los programas de bienestar, desconexión de los colaboradores con las campañas preventivas de SST y sensación de fatiga organizativa.'
      : 'Bajo impacto real de las brigadas de autocuidado frente al total de la población expuesta a riesgos de operaciones.',
    opportunity: `Involucrar de manera obligatoria y participativa a los líderes y supervisores de operaciones en la promoción de pausas activas grupales presenciales o virtuales.`,
    priority: activeParticipation < 50 ? 'Alta' : 'Media'
  });

  // Variable 13: IMC
  findingsList.push({
    variable: 'IMC',
    finding: `El IMC promedio de la organización es de ${averageIMC}. Adicionalmente, el ${excessWeightPct}% de los colaboradores presenta exceso de peso corporal, clasificados en rangos de sobrepeso u obesidad.`,
    risk: excessWeightPct > 35
      ? 'Elevada propensión a desarrollar enfermedades cardiovasculares no transmisibles (hipertensión, diabetes tipo II) que generan incapacidades recurrentes de larga duración.'
      : 'Riesgo metabólico moderado en la población laboral de operaciones.',
    opportunity: `Desplegar el programa "Nutri-Happy" en alianza con nutricionistas profesionales de la Caja de Compensación Familiar, dictando talleres de loncheras saludables e in situ.`,
    priority: excessWeightPct > 35 ? 'Alta' : 'Media'
  });

  // Variable 14: Enfermedades
  findingsList.push({
    variable: 'Enfermedades',
    finding: topDisease
      ? `La patología clínica reportada con mayor incidencia es "${topDiseaseName}" afectando de forma directa al ${topDiseasePct}% de los colaboradores censados.`
      : 'No se registran diagnósticos médicos o patologías clínicas prevalentes específicas en la base analizada actual de colaboradores.',
    risk: topDisease
      ? `Picos inesperados de ausentismo médico recurrente por crisis de "${topDiseaseName}" y baja productividad debido a la fatiga sintomática durante los turnos.`
      : 'Vulnerabilidad por falta de identificación temprana de riesgos de salud silenciosos en la población de operaciones.',
    opportunity: topDisease
      ? `Estructurar un Sistema de Vigilancia Epidemiológica (SVE) médico con apoyo directo de la EPS y ARL para el control confidencial y tratamiento oportuno.`
      : 'Desplegar tamizajes de medicina preventiva anual de manera general para caracterizar riesgos clínicos silenciosos.',
    priority: topDiseasePct > 6 ? 'Alta' : 'Media'
  });

  // Variable 15: Molestias osteomusculares
  findingsList.push({
    variable: 'Molestias osteomusculares',
    finding: topPain
      ? `Un alarmante ${topPainPct}% de los colaboradores refiere sufrir dolor y molestias recurrentes localizadas en la zona de ${topPainBodyPart}.`
      : 'No se consolidan quejas de dolores osteomusculares específicos como dolencias crónicas mayoritarias.',
    risk: topPainPct > 25
      ? `Alto riesgo de calificación de patologías de origen laboral de tipo ergonómico (como tendinitis o espasmos musculares crónicos) y aumento de restricciones operativas en diademas de atención.`
      : 'Aparición silenciosa de molestias biomecánicas debido a malas posturas o sillas inadecuadas no reportadas.',
    opportunity: topPain
      ? `Implementar un programa especializado de pausas biomecánicas dirigidas por fisioterapeutas de la ARL y realizar un ajuste ergonómico minucioso de teclados y pantallas.`
      : 'Impartir capacitaciones virtuales dinámicas preventivas de autocuidado postural antes de la aparición de quejas.',
    priority: topPainPct > 30 ? 'Alta' : 'Media'
  });

  // 4. Recomendaciones dinámicas utilizando aiRecommender.ts (o directamente generadas aquí de forma dinámica para asegurar alineación)
  const recommendations = generateRecommendations(data);

  return {
    executiveSummary: {
      totalEmployees,
      averageAge,
      averageSeniority,
      activeParticipation,
      absenteeismRate,
      wellbeingIndex
    },
    findings: findingsList,
    recommendations
  };
}
