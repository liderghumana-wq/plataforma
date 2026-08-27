import { DemographicsData } from '../types';

export interface SimulationVariables {
  aumentoPersonal: number;       // -50 a +100 (%)
  disminucionRotacion: number;   // -50 a 0 (%)
  incrementoAntiguedad: number;  // 0 a 5 (años)
  porcentajeTeletrabajo: number; // 0 a 100 (%)
  contratacionJoven: number;     // 0 a 100 (%) (menores de 24)
  contratacionMayores50: number; // 0 a 100 (%)
  aumentoHijos: number;          // 0 a 100 (%) (porcentaje con hijos)
  nivelEducativo: 'básico' | 'profesional';
  nuevasSedes: 'grandes' | 'intermedias';
}

export interface PredictionMetrics {
  riesgoPsicosocial: { current: number; simulated: number; diff: number; text: string };
  bienestar: { current: number; simulated: number; diff: number; text: string };
  estabilidadLaboral: { current: number; simulated: number; diff: number; text: string };
  ausentismo: { current: number; simulated: number; diff: number; text: string };
  accidentalidad: { current: number; simulated: number; diff: number; text: string };
  climaLaboral: { current: number; simulated: number; diff: number; text: string };
}

export interface ImpactMatrixItem {
  scenarioName: string;
  probabilidad: 'Alta' | 'Media' | 'Baja';
  impacto: 'Alta' | 'Media' | 'Baja';
  riskScore: number; // 0-100
  color: string;
  description: string;
}

export interface StrategicRecommendations {
  fortalecer: string[];
  eliminar: string[];
  invertirRecursos: string[];
  vigilarIndicadores: string[];
  riesgosAumentaran: string[];
  beneficiosObtenidos: string[];
}

export interface FinancialImpact {
  ahorroEstimado: number; // en COP
  retornoEsperado: number; // ROI (e.g. 2.4)
  nivelImpacto: 'Alto' | 'Medio' | 'Bajo';
  prioridad: 'Crítica' | 'Alta' | 'Media' | 'Baja';
  tiempoImplementacion: string; // e.g. "3-6 meses"
}

export interface PredictionResult {
  totalEmployeesCurrent: number;
  totalEmployeesSimulated: number;
  metrics: PredictionMetrics;
  matrix: ImpactMatrixItem[];
  recommendations: StrategicRecommendations;
  financial: FinancialImpact;
}

/**
 * Executes predictive simulations based on user variables and Excel dataset
 */
export function runSimulation(data: DemographicsData, v: SimulationVariables): PredictionResult {
  const currentTotal = data.totalEmployees || 1240;
  const simulatedTotal = Math.round(currentTotal * (1 + v.aumentoPersonal / 100));

  // 1. Establish base values derived from Excel analytics
  // Calculated dynamically as the weighted average stress from department wellbeing stats in the Excel
  const baseRiesgoPsicosocial = data.departmentWellbeing && data.departmentWellbeing.length > 0
    ? parseFloat((data.departmentWellbeing.reduce((sum, d) => sum + d.stress * d.agents, 0) / currentTotal).toFixed(1))
    : 64.5;

  const baseBienestar = data.wellbeingIndex || 78;
  const baseEstabilidad = 100 - (data.absenteeismRate * 8); // Proxy for retention stability
  const baseAusentismo = data.absenteeismRate || 4.2;

  // Calculate base accidentalidad based on musculoskeletal pain percentage from the Excel data
  const painPct = data.musculoskeletalPain
    ? data.musculoskeletalPain
        .filter(p => p.bodyPart.toLowerCase() !== 'ninguna' && p.bodyPart.toLowerCase() !== 'ninguno')
        .reduce((sum, p) => sum + p.percentage, 0)
    : 25;
  const baseAccidentalidad = parseFloat((0.5 + (painPct * 0.05)).toFixed(1)) || 1.8;

  // Calculate base clima based on wellbeingIndex and activeParticipation from the Excel data
  const baseClima = parseFloat((40 + ((data.wellbeingIndex || 78) * 0.3) + ((data.activeParticipation || 85) * 0.2)).toFixed(1)) || 81.2;

  // 2. Perform delta modifications based on sliders and selections
  
  // A. Riesgo Psicosocial simulation
  let simRiesgoPsicosocial = baseRiesgoPsicosocial;
  // High young hires increases adaptative stress (+1% per 10% young over 30%)
  if (v.contratacionJoven > 30) {
    simRiesgoPsicosocial += (v.contratacionJoven - 30) * 0.15;
  } else {
    simRiesgoPsicosocial -= (30 - v.contratacionJoven) * 0.1;
  }
  // Elder hires reduces risk slight maturity factor
  simRiesgoPsicosocial -= v.contratacionMayores50 * 0.08;
  // Teletrabajo reduces psychosocial commute/stress (-1.2% per 15% increase up to 80%)
  simRiesgoPsicosocial -= (v.porcentajeTeletrabajo * 0.15);
  // Experience / Seniority reduces adaptation stress (-3% per year of seniority)
  simRiesgoPsicosocial -= (v.incrementoAntiguedad * 3);
  // Cities: Intermediate reduces commuting strain by -4%
  if (v.nuevasSedes === 'intermedias') {
    simRiesgoPsicosocial -= 4.5;
  }
  // Education: Professionalizing provides cognitive coping tools (-3%)
  if (v.nivelEducativo === 'profesional') {
    simRiesgoPsicosocial -= 3.0;
  }
  // Rotation reduction decreases stress
  simRiesgoPsicosocial += (v.disminucionRotacion * 0.2); // v.disminucionRotacion is negative (e.g. -30), so it substracts
  // Clamp boundaries
  simRiesgoPsicosocial = Math.min(Math.max(parseFloat(simRiesgoPsicosocial.toFixed(1)), 25), 95);

  // B. Bienestar Index simulation
  let simBienestar = baseBienestar;
  simBienestar += (v.porcentajeTeletrabajo * 0.12);
  simBienestar -= (v.disminucionRotacion * 0.15); // Less rotation = more stability and better bonds (+0.15 per % reduction)
  simBienestar += (v.incrementoAntiguedad * 2.5);
  if (v.nuevasSedes === 'intermedias') simBienestar += 3.5;
  if (v.nivelEducativo === 'profesional') simBienestar += 2.0;
  // Young hires reduction slightly improves wellbeing stability
  simBienestar -= (v.contratacionJoven * 0.05);
  // Having kids + Teletrabajo balance is positive
  if (v.porcentajeTeletrabajo > 40 && v.aumentoHijos > 40) {
    simBienestar += 3.0;
  }
  simBienestar = Math.min(Math.max(parseFloat(simBienestar.toFixed(1)), 40), 98);

  // C. Estabilidad Laboral
  let simEstabilidad = baseEstabilidad;
  simEstabilidad -= (v.disminucionRotacion * 0.8); // Direct relationship with rotation reductions
  simEstabilidad += (v.incrementoAntiguedad * 4);
  simEstabilidad += (v.porcentajeTeletrabajo * 0.1);
  simEstabilidad -= (v.contratacionJoven * 0.12); // Youth typically transitions quicker
  simEstabilidad += (v.contratacionMayores50 * 0.15); // Older demographics offer higher retention rates
  simEstabilidad = Math.min(Math.max(parseFloat(simEstabilidad.toFixed(1)), 35), 96);

  // D. Ausentismo (Absenteeism rate)
  let simAusentismo = baseAusentismo;
  simAusentismo -= (v.porcentajeTeletrabajo * 0.02); // Teletrabajo significantly reduces light absenteeism
  simAusentismo += (v.disminucionRotacion * 0.03); // e.g. -30 * 0.03 = -0.9% decrease in absenteeism
  simAusentismo -= (v.incrementoAntiguedad * 0.25);
  // High psychosocial risk increases absenteeism
  const riskDelta = simRiesgoPsicosocial - baseRiesgoPsicosocial;
  simAusentismo += (riskDelta * 0.04);
  simAusentismo = Math.min(Math.max(parseFloat(simAusentismo.toFixed(1)), 1.2), 12.0);

  // E. Accidentalidad
  let simAccidentalidad = baseAccidentalidad;
  simAccidentalidad -= (v.porcentajeTeletrabajo * 0.015); // Fewer commutes = fewer in-itinere accidents
  simAccidentalidad += (v.contratacionJoven * 0.01); // Inexperience slightly raises incidents
  simAccidentalidad -= (v.incrementoAntiguedad * 0.12);
  simAccidentalidad = Math.min(Math.max(parseFloat(simAccidentalidad.toFixed(1)), 0.4), 6.5);

  // F. Clima Laboral
  let simClima = baseClima;
  simClima -= (v.disminucionRotacion * 0.25);
  simClima += (v.porcentajeTeletrabajo * 0.08);
  if (v.nivelEducativo === 'profesional') simClima += 3.0;
  if (v.nuevasSedes === 'intermedias') simClima += 2.0;
  simClima -= (riskDelta * 0.3); // High psychosocial stress decays climate
  simClima = Math.min(Math.max(parseFloat(simClima.toFixed(1)), 45), 98);

  // 3. Format Metrics Object
  const metrics: PredictionMetrics = {
    riesgoPsicosocial: {
      current: baseRiesgoPsicosocial,
      simulated: simRiesgoPsicosocial,
      diff: parseFloat((simRiesgoPsicosocial - baseRiesgoPsicosocial).toFixed(1)),
      text: simRiesgoPsicosocial < baseRiesgoPsicosocial ? 'Reducción en riesgo psicosocial.' : 'Incremento de estrés intralaboral.'
    },
    bienestar: {
      current: baseBienestar,
      simulated: simBienestar,
      diff: parseFloat((simBienestar - baseBienestar).toFixed(1)),
      text: simBienestar > baseBienestar ? 'Mejora en el índice general de bienestar.' : 'Disminución de bienestar percibido.'
    },
    estabilidadLaboral: {
      current: baseEstabilidad,
      simulated: simEstabilidad,
      diff: parseFloat((simEstabilidad - baseEstabilidad).toFixed(1)),
      text: simEstabilidad > baseEstabilidad ? 'Mayor retención y fidelización de talento.' : 'Aumento de vulnerabilidad en rotación.'
    },
    ausentismo: {
      current: baseAusentismo,
      simulated: simAusentismo,
      diff: parseFloat((simAusentismo - baseAusentismo).toFixed(1)),
      text: simAusentismo < baseAusentismo ? 'Disminución de pérdidas por incapacidades.' : 'Incremento de ausencias imprevistas.'
    },
    accidentalidad: {
      current: baseAccidentalidad,
      simulated: simAccidentalidad,
      diff: parseFloat((simAccidentalidad - baseAccidentalidad).toFixed(1)),
      text: simAccidentalidad < baseAccidentalidad ? 'Línea de incidentes laborales segura.' : 'Aumento de riesgos operacionales/viaje.'
    },
    climaLaboral: {
      current: baseClima,
      simulated: simClima,
      diff: parseFloat((simClima - baseClima).toFixed(1)),
      text: simClima > baseClima ? 'Fortalecimiento de la cohesión del equipo.' : 'Posibles roces y desmotivación en pasillos.'
    }
  };

  // 4. Generate Impact Matrix Items based on active variables
  const matrix: ImpactMatrixItem[] = [];
  
  // Scenario 1: Teletrabajo masivo
  if (v.porcentajeTeletrabajo > 50) {
    matrix.push({
      scenarioName: 'Teletrabajo Masivo',
      probabilidad: 'Alta',
      impacto: 'Alta',
      riskScore: 85,
      color: 'emerald',
      description: 'Reducción drástica del estrés de traslados urbanos y ausentismo. Requiere control de pausas virtuales.'
    });
  } else {
    matrix.push({
      scenarioName: 'Presencialidad Absoluta',
      probabilidad: 'Media',
      impacto: 'Alta',
      riskScore: 70,
      color: 'rose',
      description: 'Aumento de fatiga física y accidentalidad in-itinere. Alta cohesión de equipos físicos.'
    });
  }

  // Scenario 2: Relevo Demográfico / Contratación de Jóvenes
  if (v.contratacionJoven > 45) {
    matrix.push({
      scenarioName: 'Fuerza Laboral Centenial',
      probabilidad: 'Alta',
      impacto: 'Alta',
      riskScore: 80,
      color: 'amber',
      description: 'Gran dinamismo digital pero alta vulnerabilidad a la frustración. Mayor rotación y ausencias cortas.'
    });
  }

  // Scenario 3: Deslocalización a Ciudades Intermedias
  if (v.nuevasSedes === 'intermedias') {
    matrix.push({
      scenarioName: 'Deslocalización Territorial',
      probabilidad: 'Alta',
      impacto: 'Media',
      riskScore: 60,
      color: 'indigo',
      description: 'Acceso a costos de vida menores y traslados cortos. Estabiliza el clima laboral y reduce estrés.'
    });
  }

  // Scenario 4: Retención y Maduración de Curva
  if (v.incrementoAntiguedad > 1.5 || v.disminucionRotacion < -25) {
    matrix.push({
      scenarioName: 'Madurez del Talento',
      probabilidad: 'Alta',
      impacto: 'Alta',
      riskScore: 90,
      color: 'teal',
      description: 'Curva de aprendizaje consolidada. Clima corporativo estable, reduciendo costos de entrenamiento.'
    });
  }

  // Guarantee at least two items for visual layout
  if (matrix.length < 2) {
    matrix.push({
      scenarioName: 'Onboarding Corto',
      probabilidad: 'Media',
      impacto: 'Media',
      riskScore: 50,
      color: 'slate',
      description: 'Presión inicial en jefaturas operativas durante la curva de adaptación técnica.'
    });
  }

  // 5. Strategic Recommendations
  const fortalecer: string[] = [];
  const eliminar: string[] = [];
  const invertirRecursos: string[] = [];
  const vigilarIndicadores: string[] = [];
  const riesgosAumentaran: string[] = [];
  const beneficiosObtenidos: string[] = [];

  // Logic to build tailored recommendations
  if (v.porcentajeTeletrabajo > 50) {
    fortalecer.push('Programa de desconexión laboral digital, ergonomía en casa e inspección virtual de puestos.');
    invertirRecursos.push('Subsidios de conectividad, sillas ergonómicas hogareñas y licencias de software de salud mental.');
    vigilarIndicadores.push('Índice de sedentarismo en teletrabajo, fatiga visual y reportes de desconexión.');
    beneficiosObtenidos.push('Reducción drástica de accidentalidad vial e incremento de lealtad en padres de familia.');
  } else {
    fortalecer.push('Pausas activas dirigidas presenciales, tamizaje cardiovascular continuo en sede y acondicionamiento físico.');
    invertirRecursos.push('Mejoras de iluminación, dispensadores de agua fresca en pasillos y zonas de descompresión física.');
    vigilarIndicadores.push('Accidentes de trayecto (in-itinere), dolores musculoesqueléticos y clima laboral de pasillo.');
    beneficiosObtenidos.push('Mayor sentido de pertenencia directa, comunicación ágil de COPASST y supervisión de autocuidado inmediata.');
  }

  if (v.contratacionJoven > 40) {
    fortalecer.push('Escuela de liderazgo joven, metodologías de Gamificación en SG-SST y Onboarding lúdico.');
    riesgosAumentaran.push('Aumento de rotación voluntaria temprana en la curva de adaptación (<6 meses) y demandas de equilibrio vida-trabajo.');
    vigilarIndicadores.push('Rotación de personal menor a 24 años, ausentismo por causas psicosociales.');
  }

  if (v.incrementoAntiguedad > 1.0 || v.disminucionRotacion < -20) {
    fortalecer.push('Plan de carrera ligado a competencias de autocuidado y brigadistas expertos.');
    eliminar.push('Campañas hiper-básicas repetitivas de inducción de SST para personal antiguo.');
    beneficiosObtenidos.push('Ahorro sustancial en costos de reclutamiento y re-entrenamiento operacional.');
  } else {
    fortalecer.push('Micro-inducciones de seguridad semanales, padrinazgo de brigadistas y capacitaciones rápidas.');
    riesgosAumentaran.push('Errores operacionales por inexperiencia y omisión involuntaria de normas de seguridad básica.');
  }

  if (v.nivelEducativo === 'profesional') {
    fortalecer.push('Apoyos para posgrados y diplomados en liderazgo e investigación interna.');
    eliminar.push('Esquemas punitivos de control de tiempos estrictos que desgastan la confianza profesional.');
    beneficiosObtenidos.push('Autonomía laboral madura, mayor aporte en comités de convivencia y COPASST.');
  } else {
    fortalecer.push('Escuela de formación técnica interna y alianzas con entidades de capacitación técnica (e.g. SENA).');
  }

  // Default fallbacks to guarantee 3 items per bullet
  if (fortalecer.length < 3) fortalecer.push('Programa de pausas cognitivas obligatorias en turnos rotativos.');
  if (fortalecer.length < 3) fortalecer.push('Capacitaciones ágiles en primeros auxilios psicológicos para mandos medios.');
  
  if (eliminar.length < 2) eliminar.push('Campañas de folletos impresos masivos que no generan engagement real.');
  if (eliminar.length < 2) eliminar.push('Formatos engorrosos físicos para reporte de actos inseguros; migrar a QR.');

  if (invertirRecursos.length < 2) invertirRecursos.push('Garantizar botiquines avanzados con desfibrilador externo automático (DEA) en sedes.');
  if (invertirRecursos.length < 2) invertirRecursos.push('Plataforma gamificada para monitorear retos deportivos y de nutrición.');

  if (vigilarIndicadores.length < 2) vigilarIndicadores.push('Tasa de ausentismo general de la cuenta de operaciones.');
  if (vigilarIndicadores.length < 2) vigilarIndicadores.push('Frecuencia de dolores de espalda o cuello en reportes semestrales.');

  if (riesgosAumentaran.length < 2) riesgosAumentaran.push('Fatiga mental por alta exposición acumulada frente a pantallas.');
  if (riesgosAumentaran.length < 2) riesgosAumentaran.push('Sedentarismo agudo debido a turnos sentados de más de 6 horas.');

  if (beneficiosObtenidos.length < 2) beneficiosObtenidos.push('Consolidación de una marca empleadora (Employer Branding) enfocada en bienestar.');
  if (beneficiosObtenidos.length < 2) beneficiosObtenidos.push('Disminución de primas de cotización ante la ARL por reducción de incidentes.');

  // 6. Financial Executive Panel Calculations
  // Let's make this highly logical:
  // Rotation costs approx $3,500,000 COP per employee in a BPO (onboarding, recruitment, lost productivity)
  // Absenteeism cost is approx $120,000 COP per day.
  // Reducing rotation from baseline saves serious money.
  const baseRotationEmployeesPerYear = Math.round(currentTotal * 0.40); // 40% annual rotation typical BPO
  const simulatedRotationRate = Math.max(0.40 * (1 + v.disminucionRotacion / 100), 0.15);
  const simulatedRotationEmployeesPerYear = Math.round(simulatedTotal * simulatedRotationRate);
  
  const savedEmployeesRotationCount = Math.max(0, (currentTotal * 0.40) - (simulatedTotal * simulatedRotationRate));
  const rotationSavings = savedEmployeesRotationCount * 3800000; // $3.8M COP per employee saved
  
  const currentAbsenteeismDays = currentTotal * baseAusentismo * 12; // average days per year
  const simAbsenteeismDays = simulatedTotal * simAusentismo * 12;
  const savedAbsenteeismDays = Math.max(0, currentAbsenteeismDays - simAbsenteeismDays);
  const absenteeismSavings = savedAbsenteeismDays * 135000; // $135K COP per day saved
  
  const ahorroEstimado = Math.round(rotationSavings + absenteeismSavings);
  
  // Calculate ROI (usually higher savings equals higher return)
  // Estimated implementation cost: e.g. $15M COP to $40M COP depending on headcount and telework
  const estimatedCost = Math.max(25000000, simulatedTotal * 25000); // 25k COP per employee
  const retornoEsperado = parseFloat((ahorroEstimado / estimatedCost).toFixed(1));

  // Determine Impact Level
  let nivelImpacto: 'Alto' | 'Medio' | 'Bajo' = 'Medio';
  if (ahorroEstimado > 120000000) {
    nivelImpacto = 'Alto';
  } else if (ahorroEstimado < 30000000) {
    nivelImpacto = 'Bajo';
  }

  // Priority
  let prioridad: 'Crítica' | 'Alta' | 'Media' | 'Baja' = 'Media';
  if (simRiesgoPsicosocial > 75 || simAusentismo > 6.0) {
    prioridad = 'Crítica';
  } else if (simRiesgoPsicosocial > 60 || simAusentismo > 4.5) {
    prioridad = 'Alta';
  } else if (simRiesgoPsicosocial < 45) {
    prioridad = 'Baja';
  }

  // Implementation time estimation
  let tiempoImplementacion = "3-4 meses";
  if (v.porcentajeTeletrabajo > 60 || v.nuevasSedes === 'intermedias' || v.aumentoPersonal > 30) {
    tiempoImplementacion = "6-12 meses";
  } else if (v.incrementoAntiguedad > 2) {
    tiempoImplementacion = "12-24 meses";
  }

  return {
    totalEmployeesCurrent: currentTotal,
    totalEmployeesSimulated: simulatedTotal,
    metrics,
    matrix,
    recommendations: {
      fortalecer,
      eliminar,
      invertirRecursos,
      vigilarIndicadores,
      riesgosAumentaran,
      beneficiosObtenidos
    },
    financial: {
      ahorroEstimado,
      retornoEsperado: Math.max(1.1, retornoEsperado),
      nivelImpacto,
      prioridad,
      tiempoImplementacion
    }
  };
}
