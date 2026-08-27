import { DemographicsData } from '../types';

export interface ComplianceAnalysis {
  question: string;
  answer: string;
  normativeReferences: {
    norm: string;
    section: string;
    relationship: string;
  }[];
  actionsToTake: string[];
  evidencesToPrepare: string[];
  programsToUpdate: string[];
}

/**
 * Genera una respuesta altamente dinámica y contextualizada para el Consultor Inteligente de SG-SST,
 * relacionando los estándares (ISO 45001, Decreto 1072 de 2015, Resolución 0312 de 2019)
 * con los datos reales extraídos del Excel.
 */
export function getComplianceResponse(data: DemographicsData, question: string): ComplianceAnalysis {
  // 1. Extraer métricas clave para la inyección dinámica
  const totalEmployees = data.totalEmployees || 0;
  const averageAge = data.averageAge || 0;
  const absenteeismRate = data.absenteeismRate || 0;
  const activeParticipation = data.activeParticipation || 0;
  const wellbeingIndex = data.wellbeingIndex || 0;

  // Sedentarismo
  const physicalActivity = data.physicalActivity || [];
  const sedentaryPct = Math.round(physicalActivity.find(p => p.level.toLowerCase().includes('ninguna') || p.level.toLowerCase().includes('sedentario') || p.level.toLowerCase() === 'no')?.percentage || 0);

  // IMC y Exceso de Peso
  const imcClassification = data.imcClassification || [];
  const averageIMC = data.averageIMC || 24.5;
  const overweightPct = imcClassification.find(i => i.category.toLowerCase().includes('sobrepeso'))?.percentage || 0;
  const obesityPct = imcClassification.find(i => i.category.toLowerCase().includes('obesidad'))?.percentage || 0;
  const excessWeightPct = Math.round(Number(overweightPct) + Number(obesityPct));

  // Dolor Osteomuscular
  const musculoskeletalPain = data.musculoskeletalPain || [];
  const topPain = musculoskeletalPain.length > 0
    ? [...musculoskeletalPain].filter(p => p.bodyPart.toLowerCase() !== 'ninguna' && p.bodyPart.toLowerCase() !== 'ninguno').sort((a, b) => b.percentage - a.percentage)[0]
    : null;
  const topPainBodyPart = topPain ? topPain.bodyPart : 'espalda / zona lumbar';
  const topPainPct = topPain ? Math.round(topPain.percentage) : 25;

  // Enfermedades
  const diseases = data.diseases || [];
  const topDisease = diseases.length > 0
    ? [...diseases].filter(d => d.disease.toLowerCase() !== 'ninguna' && d.disease.toLowerCase() !== 'ninguno').sort((a, b) => b.percentage - a.percentage)[0]
    : null;
  const topDiseaseName = topDisease ? topDisease.disease : 'Fatiga visual o estrés';
  const topDiseasePct = topDisease ? Math.round(topDisease.percentage) : 8;

  // Contratos Temporales
  const contracts = data.contractType || [];
  const nonIndefiniteContractsPct = Math.round(contracts
    .filter(c => !c.type.toLowerCase().includes('indefinido'))
    .reduce((sum, c) => sum + c.percentage, 0));

  // Determinar número de estándares mínimos de Resolución 0312 aplicables dinámicamente por tamaño
  let standardsRequired = 62;
  let standardsCategory = "Empresa de más de 50 trabajadores (Clase de riesgo I, II, III)";
  if (totalEmployees <= 10) {
    standardsRequired = 7;
    standardsCategory = "Microempresa (<=10 trabajadores) con riesgo I, II, III";
  } else if (totalEmployees <= 50) {
    standardsRequired = 21;
    standardsCategory = "Pequeña empresa (11 a 50 trabajadores) con riesgo I, II, III";
  }

  // Normalizar la pregunta para detectar intención
  const cleanQ = question.toLowerCase();

  let answer = "";
  let normativeReferences: { norm: string; section: string; relationship: string; }[] = [];
  let actionsToTake: string[] = [];
  let evidencesToPrepare: string[] = [];
  let programsToUpdate: string[] = [];

  // Clasificación de la pregunta y generación dinámica de la respuesta
  if (cleanQ.includes('iso 45001') || cleanQ.includes('exige') || cleanQ.includes('requisito')) {
    answer = `Para el censo actual de ${totalEmployees} colaboradores, ISO 45001:2018 exige un enfoque preventivo riguroso centrado en el liderazgo, la participación y el control operativo. En su caso específico, el alarmante ${topPainPct}% de dolor reportado en ${topPainBodyPart} y el ${sedentaryPct}% de sedentarismo representan peligros latentes que deben gestionarse bajo la cláusula 8.1.3 de Eliminación de peligros y reducción de riesgos. Así mismo, la tasa de ausentismo de ${absenteeismRate}% requiere una evaluación sistemática del desempeño de la SST bajo la cláusula 9.1 para medir la eficacia de los controles de salud y ergonomía implantados en la organización.`;

    normativeReferences = [
      {
        norm: "ISO 45001:2018",
        section: "Cláusula 6.1.2 - Identificación de peligros y evaluación de riesgos",
        relationship: `Exige mapear sistemáticamente la correlación entre el sedentarismo del ${sedentaryPct}% y la aparición de dolor de ${topPainBodyPart} (${topPainPct}% de prevalencia) como riesgos ergonómicos prioritarios.`
      },
      {
        norm: "ISO 45001:2018",
        section: "Cláusula 5.4 - Consulta y participación de los trabajadores",
        relationship: `Requiere diseñar mecanismos para que los ${totalEmployees} colaboradores, especialmente aquellos con contratos de tipo temporal (${nonIndefiniteContractsPct}%), participen activamente en la definición de pausas activas para mitigar el dolor corporal.`
      },
      {
        norm: "ISO 45001:2018",
        section: "Cláusula 8.1.3 - Eliminar peligros y reducir riesgos de SST",
        relationship: `Obliga a rediseñar los puestos de trabajo para mitigar el dolor en ${topPainBodyPart} e implementar controles administrativos frente a la inactividad física.`
      }
    ];

    actionsToTake = [
      `Establecer un cronograma sistemático de inspecciones ergonómicas dirigidas al ${topPainPct}% de la población que reporta molestias de ${topPainBodyPart}.`,
      `Involucrar activamente a la alta dirección para destinar recursos a un plan contra el ${sedentaryPct}% de sedentarismo.`,
      `Implementar un canal formal de reporte temprano de sintomatología musculoesquelética.`
    ];

    evidencesToPrepare = [
      `Matriz de Identificación de Peligros y Valoración de Riesgos (MIPVR) donde conste el riesgo biomecánico de ${topPainBodyPart} con su respectiva valoración de probabilidad.`,
      `Registros firmados de capacitaciones sobre higiene postural por el personal afectado.`,
      `Actas de reuniones del Copasst analizando las estadísticas de ausentismo del ${absenteeismRate}% y sus planes de acción preventivos.`
    ];

    programsToUpdate = [
      "Sistema de Vigilancia Epidemiológica (SVE) Biomecánico u Osteomuscular",
      "Programa de Estilos de Vida y Entornos de Trabajo Saludables",
      "Plan de Inducción y Capacitación en Autocuidado y Ergonomía"
    ];

  } else if (cleanQ.includes('numeral') || cleanQ.includes('fortalecer') || cleanQ.includes('debilidad')) {
    answer = `El análisis de los datos demográficos revela que el numeral prioritario a fortalecer es el de **Medicina Preventiva y del Trabajo** (estándares de la Resolución 0312 de 2019) y la **Cláusula 8.1.3 de ISO 45001**, debido a que el ${excessWeightPct}% del personal presenta sobrepeso u obesidad y un ${topDiseasePct}% padece de "${topDiseaseName}". En el marco de la legislación nacional (Decreto 1072, Artículo 2.2.4.6.15), es urgente fortalecer la identificación de peligros biológicos y biomecánicos para evitar que este censo sociodemográfico desemboque en un incremento del ausentismo laboral, que hoy se sitúa en un ${absenteeismRate}%.`;

    normativeReferences = [
      {
        norm: "Resolución 0312 de 2019",
        section: "Estándar 3.1.1 - Perfil Sociodemográfico y Diagnóstico de Salud",
        relationship: `Exige la actualización anual de este censo para los ${totalEmployees} empleados, correlacionando el IMC (${averageIMC} promedio) con las patologías de "${topDiseaseName}".`
      },
      {
        norm: "Decreto 1072 de 2015",
        section: "Artículo 2.2.4.6.15 - Identificación de peligros y valoración de riesgos",
        relationship: `Obliga a re-evaluar la exposición ergonómica dada la alta tasa de molestias en ${topPainBodyPart} (${topPainPct}%) identificadas en la encuesta.`
      },
      {
        norm: "ISO 45001:2018",
        section: "Cláusula 9.1.1 - Seguimiento, medición, análisis y evaluación",
        relationship: `Demanda el seguimiento de métricas duras como la tasa de ausentismo del ${absenteeismRate}% para validar si las intervenciones en salud realmente reducen la pérdida de jornadas de trabajo.`
      }
    ];

    actionsToTake = [
      `Fortalecer las evaluaciones médicas periódicas con énfasis musculoesquelético para el ${topPainPct}% con dolor recurrente.`,
      `Establecer un indicador mensual de efectividad del programa de prevención cardiovascular para los colaboradores con exceso de peso (${excessWeightPct}%).`,
      `Actualizar el Plan de Trabajo Anual del SG-SST incluyendo metas de participación para superar el actual ${activeParticipation}%.`
    ];

    evidencesToPrepare = [
      `Documento oficial del Diagnóstico de Condiciones de Salud firmado por el médico especialista en salud ocupacional, reflejando el ${excessWeightPct}% de exceso de peso y las patologías de "${topDiseaseName}".`,
      `Registros de asistencia a pausas activas dirigidas para los colaboradores con molestia de ${topPainBodyPart}.`,
      `Informe trimestral de comportamiento y causas del ${absenteeismRate}% de ausentismo de la empresa.`
    ];

    programsToUpdate = [
      "Programa de Vigilancia Epidemiológica de Riesgo Cardiovascular y Metabólico",
      "Programa de Ergonomía Aplicada y Diseño de Puestos de Trabajo",
      "Programa de Prevención de la Fatiga Laboral"
    ];

  } else if (cleanQ.includes('evidencia') || cleanQ.includes('presentar') || cleanQ.includes('soportes') || cleanQ.includes('auditor')) {
    answer = `Frente a una auditoría del Ministerio de Trabajo bajo el Decreto 1072 de 2015 o de certificación ISO 45001, la organización debe presentar evidencias tangibles que demuestren que está actuando sobre su realidad sociodemográfica. Con una nómina de ${totalEmployees} colaboradores, donde el ${sedentaryPct}% es sedentario y el ${topPainPct}% reporta dolor en ${topPainBodyPart}, el auditor exigirá evidencias del Sistema de Vigilancia Epidemiológica (SVE). No bastará con mostrar un documento teórico; deberá presentar registros de asistencia a pausas biomecánicas dirigidas y planes de readaptación de puestos para los casos más agudos.`;

    normativeReferences = [
      {
        norm: "Decreto 1072 de 2015",
        section: "Artículo 2.2.4.6.12 - Conservación de los documentos (numeral 2)",
        relationship: `Establece la obligatoriedad de conservar por 20 años el diagnóstico sociodemográfico detallado que respalda el índice de bienestar del ${wellbeingIndex}% de estos colaboradores.`
      },
      {
        norm: "Resolución 0312 de 2019",
        section: "Estándar 3.1.5 - Custodia de las evaluaciones médicas ocupacionales",
        relationship: `Exige presentar el certificado de aptitud médica ocupacional y las recomendaciones de control ergonómico para el ${topPainPct}% de colaboradores con dolor osteomuscular.`
      },
      {
        norm: "Decreto 1072 de 2015",
        section: "Artículo 2.2.4.6.31 - Registro y análisis estadístico de accidentes y ausentismo",
        relationship: `Obliga a demostrar que el ${absenteeismRate}% de ausentismo cuenta con análisis de causas basándose en incapacidades expedidas por EPS.`
      }
    ];

    actionsToTake = [
      `Consolidar los reportes de aptitud con recomendaciones de medicina del trabajo, cruzando los casos de dolor osteomuscular con restricciones físicas activas.`,
      `Generar registros fotográficos y planillas de asistencia que evidencien la participación del personal en las actividades de bienestar que actualmente registran un ${activeParticipation}% de afluencia.`,
      `Recopilar los certificados de calibración de las sillas ergonómicas o informes de inspección ergonómica realizados.`
    ];

    evidencesToPrepare = [
      `Certificados de Aptitud Médica Ocupacional (con énfasis osteomuscular) de los colaboradores.`,
      `Planillas de asistencia digitalizada a las actividades físicas orientadas a contrarrestar el ${sedentaryPct}% de inactividad física.`,
      `Indicadores consolidados y analizados de estructura, proceso y resultado del ausentismo (${absenteeismRate}%) y participación (${activeParticipation}%).`
    ];

    programsToUpdate = [
      "Procedimiento de Exámenes Médicos Ocupacionales y Custodia de Historias Clínicas",
      "Programa de Inspecciones Planeadas de Seguridad y Ergonomía",
      "Manual de Funciones y Responsabilidades en SST (con firmas de aceptación del personal)"
    ];

  } else if (cleanQ.includes('programa') || cleanQ.includes('actualizar') || cleanQ.includes('intervención') || cleanQ.includes('plan')) {
    answer = `El censo arroja de manera clara que el **Programa de Vigilancia Epidemiológica (SVE) Biomecánico** y el **Programa de Estilos de Vida Saludables** son los documentos metodológicos prioritarios que deben actualizarse inmediatamente. Un programa estático no responde a un ${sedentaryPct}% de sedentarismo ni a un ${excessWeightPct}% de sobrepeso en la fuerza de trabajo. Adicionalmente, el ${nonIndefiniteContractsPct}% de personal bajo contratación no indefinida obliga a que actualice el alcance del programa de capacitación y re-inducción para asegurar cobertura homogénea ante la rotación y el ausentismo recurrente de ${absenteeismRate}%.`;

    normativeReferences = [
      {
        norm: "Decreto 1072 de 2015",
        section: "Artículo 2.2.4.6.26 - Medidas de prevención y de control",
        relationship: `Exige la actualización del programa de control biomecánico para proveer ajustes de puestos de trabajo a la población con dolor en ${topPainBodyPart} (${topPainPct}%).`
      },
      {
        norm: "Resolución 0312 de 2019",
        section: "Estándar 3.2.1 - Programas de Promoción y Prevención en Salud",
        relationship: `Exige planes concretos de nutrición activa y pausas dinámicas dado el ${excessWeightPct}% de exceso de peso y ${sedentaryPct}% de inactividad física registrados.`
      },
      {
        norm: "Decreto 1072 de 2015",
        section: "Artículo 2.2.4.6.11 - Capacitación en SST",
        relationship: `Obliga a extender las inducciones de auto-cuidado al 100% de los temporales que representan el ${nonIndefiniteContractsPct}% de la compañía.`
      }
    ];

    actionsToTake = [
      `Incorporar un capítulo específico de nutrición y riesgo metabólico en el Programa de Estilos de Vida Saludables debido al ${excessWeightPct}% de exceso de peso corporal.`,
      `Actualizar el alcance de las pausas activas agregando estiramientos cervicales y lumbares específicos para reducir el ${topPainPct}% de molestia de ${topPainBodyPart}.`,
      `Establecer un sistema de alertas tempranas integrado con Gestión Humana para hacer seguimiento al ${absenteeismRate}% de ausentismo médico.`
    ];

    evidencesToPrepare = [
      `Documento del Programa de Vigilancia Epidemiológica (SVE) Biomecánico actualizado a la fecha de hoy, firmado por el responsable del SG-SST de la empresa.`,
      `Plan de capacitación anual actualizado detallando los talleres de prevención cardiovascular contra el ${sedentaryPct}% de sedentarismo.`,
      `Análisis técnico de puestos de trabajo críticos seleccionados.`
    ];

    programsToUpdate = [
      "Programa de Estilos de Vida y Nutrición Corporativa 'Nutrición Dinámica'",
      "Programa de Autocuidado Biomecánico y Ergonomía del BPO",
      "Programa de Vigilancia Epidemiológica de Salud Mental y Estrés Laboral (SVE Psicosocial)"
    ];

  } else {
    // Respuesta general / flexible ante cualquier otra pregunta de SST, manteniendo la relación directa con el Excel
    answer = `Al evaluar los requisitos legales de la legislación colombiana (Decreto 1072 de 2015, Resolución 0312 de 2019) e internacionales (ISO 45001) para su nómina de ${totalEmployees} colaboradores, resalta la necesidad de actuar con base en sus cifras reales. El diagnóstico arrojó un promedio de edad de ${averageAge} años, un índice de bienestar del ${wellbeingIndex}%, un ${absenteeismRate}% de ausentismo y un persistente ${topPainPct}% de molestias musculoesqueléticas focalizadas en la zona de ${topPainBodyPart}. Estos datos configuran la hoja de ruta de cumplimiento, requiriendo intervenciones directas amparadas bajo los estándares mínimos de la Resolución 0312 (Estándar 3.1.1 de diagnóstico sociodemográfico y perfil de salud).`;

    normativeReferences = [
      {
        norm: "Resolución 0312 de 2019",
        section: "Estándar 3.1.1 - Perfil Sociodemográfico y de Salud",
        relationship: `Requiere mantener actualizado este censo de ${totalEmployees} empleados, integrando el diagnóstico del ${excessWeightPct}% de exceso de peso y las dolencias del ${topPainPct}% de molestias físicas.`
      },
      {
        norm: "Decreto 1072 de 2015",
        section: "Artículo 2.2.4.6.15 - Identificación de peligros y valoración de riesgos",
        relationship: `Exige que los peligros asociados al sedentarismo del ${sedentaryPct}% y molestias en ${topPainBodyPart} (${topPainPct}%) sean catalogados dentro de la Matriz de Riesgos institucional.`
      },
      {
        norm: "ISO 45001:2018",
        section: "Cláusula 8.1.3 - Eliminación de peligros y reducción de riesgos",
        relationship: `Demanda el diseño de controles operacionales e higiénicos para mitigar las patologías diagnosticadas en el personal como "${topDiseaseName}" (${topDiseasePct}%).`
      }
    ];

    actionsToTake = [
      `Realizar seguimiento periódico a las recomendaciones médicas ocupacionales vigentes.`,
      `Actualizar el Plan de Trabajo Anual del SG-SST integrando objetivos específicos para contrarrestar el ${sedentaryPct}% de inactividad física.`,
      `Establecer un plan de contingencia de seguridad laboral enfocado en el ausentismo del ${absenteeismRate}%.`
    ];

    evidencesToPrepare = [
      `Fichas del perfil sociodemográfico consolidado basado en el Excel analizado.`,
      `Planillas de asistencia a los talleres de hábitos saludables.`,
      `Análisis trimestral de accidentalidad y ausentismo laboral de los colaboradores.`
    ];

    programsToUpdate = [
      "Programa de Vigilancia Epidemiológica Biomecánica",
      "Programa de Estilos de Vida Saludables",
      "Plan de Capacitación Anual en Seguridad y Salud en el Trabajo"
    ];
  }

  return {
    question,
    answer,
    normativeReferences,
    actionsToTake,
    evidencesToPrepare,
    programsToUpdate
  };
}
