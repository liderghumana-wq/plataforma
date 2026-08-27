import { DemographicsData } from '../types';

export interface EmployeeRisk {
  id: string;
  edad: number;
  antiguedad: number;
  tipoContrato: string;
  jornada: string;
  nivelEducativo: string;
  hijos: string;
  discapacidad: string;
  ciudad: string;
  cargo: string;
  area: string;
  estadoCivil: string;
  score: number;
  level: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  factors: string[];
}

export interface RiskSummary {
  total: number;
  bajoCount: number;
  bajoPercentage: number;
  medioCount: number;
  medioPercentage: number;
  altoCount: number;
  altoPercentage: number;
  criticoCount: number;
  criticoPercentage: number;
  employees: EmployeeRisk[];
  executiveSummary: {
    findings: string[];
    riskPercentagesText: string;
    recommendations: string[];
  };
}

/**
 * Calculates risk score and level for a single employee based on the SG-SST rule matrix
 */
export function calculateEmployeeRisk(emp: {
  edad: number;
  antiguedad: number;
  tipoContrato: string;
  jornada?: string;
  nivelEducativo: string;
  hijos: string;
  discapacidad: string;
  ciudad: string;
  cargo: string;
  area: string;
  estadoCivil: string;
}, index: number = 0): EmployeeRisk {
  let score = 0;
  const factors: string[] = [];

  // 1. Edad
  const edad = emp.edad || 27;
  if (edad < 23) {
    score += 10;
    factors.push('Edad menor de 23 años (+10 pts)');
  } else if (edad >= 50) {
    score += 10;
    factors.push('Edad mayor o igual de 50 años (+10 pts)');
  } else if (edad < 28) {
    score += 5;
    factors.push('Edad joven 23-28 años (+5 pts)');
  }

  // 2. Antigüedad
  const antiguedad = emp.antiguedad !== undefined ? emp.antiguedad : 1.5;
  if (antiguedad < 0.5) { // menos de 6 meses
    score += 15;
    factors.push('Antigüedad menor a 6 meses (+15 pts)');
  } else if (antiguedad < 1.0) { // menos de 1 año
    score += 10;
    factors.push('Antigüedad de 6 a 12 meses (+10 pts)');
  } else if (antiguedad < 3.0) {
    score += 5;
    factors.push('Antigüedad en curva de adaptación 1-3 años (+5 pts)');
  }

  // 3. Tipo de contrato
  const tipoContrato = emp.tipoContrato || '';
  const cLower = tipoContrato.toLowerCase();
  const isTemporal = cLower.includes('temporal') || cLower.includes('obra') || cLower.includes('labor') || cLower.includes('fijo') || cLower.includes('fija') || cLower.includes('prestacion');
  if (isTemporal) {
    score += 15;
    factors.push('Contrato temporal / Obra-Labor / Término Fijo (+15 pts)');
  }

  // 4. Jornada
  const jornada = emp.jornada || '';
  const jLower = jornada.toLowerCase();
  const isNightOrRotative = jLower.includes('noche') || jLower.includes('nocturna') || jLower.includes('rotativo') || jLower.includes('rotativa') || jLower.includes('madrugada') || jLower.includes('mixta');
  if (isNightOrRotative) {
    score += 10;
    factors.push('Jornada Nocturna o Rotativa (+10 pts)');
  }

  // 5. Nivel educativo
  const nivelEducativo = emp.nivelEducativo || '';
  const eLower = nivelEducativo.toLowerCase();
  if (eLower.includes('bachiller') || eLower.includes('secundaria') || eLower.includes('primaria')) {
    score += 10;
    factors.push('Nivel educativo básico (Bachiller o inferior) (+10 pts)');
  } else if (eLower.includes('técnico') || eLower.includes('tecnico') || eLower.includes('tecnólogo') || eLower.includes('tecnologo')) {
    score += 5;
    factors.push('Nivel educativo Técnico / Tecnólogo (+5 pts)');
  }

  // 6. Personas con hijos
  const hijos = emp.hijos || '';
  const hLower = hijos.toLowerCase();
  const hasKids = hLower === 'si' || hLower === 'sí' || hLower === 'yes' || hLower.includes('con hijo') || hLower === 's';
  if (hasKids) {
    score += 5;
    factors.push('Tiene personas / hijos a cargo (+5 pts)');
  }

  // 7. Discapacidad
  const discapacidad = emp.discapacidad || '';
  const dLower = discapacidad.toLowerCase();
  const hasDisability = dLower === 'si' || dLower === 'sí' || dLower === 'yes' || dLower.includes('declarada') || dLower === 's';
  if (hasDisability) {
    score += 10;
    factors.push('Presenta discapacidad declarada (+10 pts)');
  }

  // 8. Ciudad
  const ciudad = emp.ciudad || '';
  const ciLower = ciudad.toLowerCase();
  if (ciLower.includes('bogota') || ciLower.includes('bogotá') || ciLower.includes('medellin') || ciLower.includes('medellín')) {
    score += 5;
    factors.push('Residencia en gran urbe (Bogotá/Medellín - Altos traslados) (+5 pts)');
  }

  // 9. Cargo
  const cargo = emp.cargo || '';
  const caLower = cargo.toLowerCase();
  const isCustomerService = caLower.includes('cliente') || caLower.includes('atención') || caLower.includes('atencion') || caLower.includes('agent') || caLower.includes('asesor') || caLower.includes('operador') || caLower.includes('soporte') || caLower.includes('telefónico') || caLower.includes('telefonico') || caLower.includes('analista');
  if (isCustomerService) {
    score += 15;
    factors.push('Cargo operativo de alta demanda o atención al cliente (+15 pts)');
  }

  // 10. Área
  const area = emp.area || 'Operaciones';
  const aLower = area.toLowerCase();
  const isOperativeArea = aLower.includes('operativa') || aLower.includes('operaciones') || aLower.includes('operacion') || aLower.includes('operativo') || aLower.includes('call') || aLower.includes('bpo') || aLower.includes('servicio');
  if (isOperativeArea) {
    score += 10;
    factors.push('Área de operaciones o call center (+10 pts)');
  }

  // 11. Estado Civil
  const estadoCivil = emp.estadoCivil || 'Soltero(a)';
  const esLower = estadoCivil.toLowerCase();
  if (esLower.includes('soltero') || esLower.includes('soltera') || esLower.includes('divorciado') || esLower.includes('divorciada') || esLower.includes('viudo') || esLower.includes('viuda') || esLower.includes('separado') || esLower.includes('separada')) {
    score += 5;
    factors.push('Estado civil monoparental o soltero (+5 pts)');
  }

  // Determine Level
  let level: 'Bajo' | 'Medio' | 'Alto' | 'Crítico' = 'Bajo';
  if (score <= 20) {
    level = 'Bajo';
  } else if (score <= 40) {
    level = 'Medio';
  } else if (score <= 60) {
    level = 'Alto';
  } else {
    level = 'Crítico';
  }

  return {
    id: `emp-${index}`,
    edad,
    antiguedad,
    tipoContrato,
    jornada,
    nivelEducativo,
    hijos: hasKids ? 'Sí' : 'No',
    discapacidad: hasDisability ? 'Sí' : 'No',
    ciudad,
    cargo,
    area,
    estadoCivil,
    score,
    level,
    factors
  };
}

/**
 * Main analysis runner. Generates risks list and executive summary
 */
export function analyzeRiskMap(data: DemographicsData): RiskSummary {
  let rawList = data.rawEmployees || [];
  
  // If no raw employees are available (e.g. using default mock data), generate clean synthetic list matching aggregates
  if (rawList.length === 0) {
    rawList = generateSyntheticEmployees(data);
  }

  const employees: EmployeeRisk[] = rawList.map((emp, idx) => calculateEmployeeRisk(emp, idx));
  const total = employees.length || 1;

  const bajoCount = employees.filter(e => e.level === 'Bajo').length;
  const medioCount = employees.filter(e => e.level === 'Medio').length;
  const altoCount = employees.filter(e => e.level === 'Alto').length;
  const criticoCount = employees.filter(e => e.level === 'Crítico').length;

  const bajoPercentage = Math.round((bajoCount / total) * 100);
  const medioPercentage = Math.round((medioCount / total) * 100);
  const altoPercentage = Math.round((altoCount / total) * 100);
  const criticoPercentage = 100 - bajoPercentage - medioPercentage - altoPercentage;

  // Generate dynamic executive summary
  const findings: string[] = [];
  
  // High youth density
  const youthCount = rawList.filter(e => e.edad < 23).length;
  const youthPct = Math.round((youthCount / total) * 100);
  if (youthPct > 20) {
    findings.push(`Alta concentración de personal muy joven: El ${youthPct}% (${youthCount} colaboradores) tiene menos de 23 años, lo que incide en alta rotación y demanda esquemas lúdicos de SG-SST.`);
  }

  // Short tenure
  const juniorCount = rawList.filter(e => e.antiguedad < 0.5).length;
  const juniorPct = Math.round((juniorCount / total) * 100);
  if (juniorPct > 20) {
    findings.push(`Curva crítica de adaptación inicial: El ${juniorPct}% (${juniorCount} colaboradores) lleva menos de 6 meses de antigüedad en la empresa.`);
  }

  // Contract vulnerability
  const tempCount = rawList.filter(e => {
    const c = (e.tipoContrato || '').toLowerCase();
    return c.includes('obra') || c.includes('labor') || c.includes('temporal') || c.includes('fijo') || c.includes('fija');
  }).length;
  const tempPct = Math.round((tempCount / total) * 100);
  if (tempPct > 25) {
    findings.push(`Incertidumbre contractual: El ${tempPct}% de la nómina opera bajo contratos temporales o por obra-labor, elevando el estrés psicosocial extralaboral.`);
  }

  // Operative roles
  const opCount = rawList.filter(e => {
    const c = (e.cargo || '').toLowerCase();
    const a = (e.area || '').toLowerCase();
    return c.includes('cliente') || c.includes('atención') || c.includes('atencion') || c.includes('agent') || a.includes('operacion') || a.includes('operaciones');
  }).length;
  const opPct = Math.round((opCount / total) * 100);
  if (opPct > 50) {
    findings.push(`Predominio de cargos de alta demanda operativa: El ${opPct}% del personal realiza funciones de call center o de cara al cliente con alta fatiga mental asociada.`);
  }

  // Disabilities
  const discCount = rawList.filter(e => {
    const d = (e.discapacidad || '').toLowerCase();
    return d === 'si' || d === 'sí' || d === 's';
  }).length;
  if (discCount > 0) {
    findings.push(`Personal con discapacidad: Se identifican ${discCount} colaboradores con alguna discapacidad, requiriendo puestos ergonómicos adaptados.`);
  }

  // Default findings if the data is very homogeneous
  if (findings.length === 0) {
    findings.push("Distribución laboral estable. Se identifican focos moderados en áreas operativas y rotativas.");
    findings.push("La antigüedad promedio indica un nivel de retención de talento adecuado, con retos específicos en onboarding.");
  }

  const riskPercentagesText = `El análisis arrojó un ${bajoPercentage}% en Riesgo Bajo, ${medioPercentage}% en Riesgo Medio, ${altoPercentage}% en Riesgo Alto, y un ${criticoPercentage}% en Riesgo Crítico.`;

  // General recommendations based on risk scores
  const recommendations: string[] = [];
  if (criticoPercentage > 5 || altoPercentage > 20) {
    recommendations.push("Prioridad 1: Activar de inmediato el Programa de Onboarding y Acompañamiento Psicosocial para personal de antigüedad <6 meses en áreas operativas.");
    recommendations.push("Prioridad 2: Implementar rotación de puestos y micro-pausas cognitivas obligatorias de 3 minutos cada 2 horas para agentes de atención al cliente.");
    recommendations.push("Prioridad 3: Gestionar mesas de revisión de contratos de obra-labor con desempeño sobresaliente para migrar a término indefinido, reduciendo estrés extralaboral.");
  } else {
    recommendations.push("Fomentar actividades periódicas de tamizaje cardiovascular y pausas de descompresión física voluntarias.");
    recommendations.push("Estandarizar las inducciones de SST con un enfoque dinámico para asegurar la retención de pautas de autocuidado.");
  }
  recommendations.push("Establecer un canal de atención psicológica confidencial 24/7 y promover la cultura de reporte temprano de dolores musculares.");

  return {
    total,
    bajoCount,
    bajoPercentage,
    medioCount,
    medioPercentage,
    altoCount,
    altoPercentage,
    criticoCount,
    criticoPercentage,
    employees,
    executiveSummary: {
      findings,
      riskPercentagesText,
      recommendations
    }
  };
}

/**
 * Helper to generate synthetic employee raw list matching aggregate statistics if none uploaded
 */
function generateSyntheticEmployees(data: DemographicsData): any[] {
  const total = data.totalEmployees || 1240;
  const list: any[] = [];

  // Age ranges list helper
  const ageGroups = data.ageGroups || [
    { range: '18-25 años', value: 550 },
    { range: '26-35 años', value: 430 },
    { range: '36-45 años', value: 170 },
    { range: '46-55 años', value: 65 },
    { range: '56 años o más', value: 25 }
  ];

  // Marital statuses
  const maritalStatuses = data.maritalStatus || [
    { status: 'Soltero(a)', count: 830 },
    { status: 'Unión Libre', count: 240 },
    { status: 'Casado(a)', count: 140 },
    { status: 'Divorciado / Viudo / Otro', count: 30 }
  ];

  // Cities
  const cities = data.city || [
    { name: 'Bogotá', count: 650 },
    { name: 'Medellín', count: 320 },
    { name: 'Cali', count: 160 },
    { name: 'Barranquilla', count: 110 }
  ];

  // Education
  const education = data.education || [
    { level: 'Bachiller', count: 150 },
    { level: 'Técnico', count: 350 },
    { level: 'Tecnólogo', count: 480 },
    { level: 'Universitario', count: 210 }
  ];

  // Contracts
  const contracts = data.contractType || [
    { type: 'Término Indefinido', count: 868 },
    { type: 'Obra o Labor', count: 310 },
    { type: 'Término Fijo', count: 62 }
  ];

  // Departments
  const depts = data.departmentWellbeing || [
    { name: 'Operaciones BPO', agents: 920 },
    { name: 'Tecnología & QA', agents: 120 },
    { name: 'Administración & RRHH', agents: 100 },
    { name: 'Calidad & Formación', agents: 100 }
  ];

  for (let i = 0; i < total; i++) {
    // Determine age based on distribution
    let age = 27;
    let rAge = i % 10;
    if (rAge < 4) { // 40% 18-25
      age = 18 + (i % 8);
    } else if (rAge < 7) { // 30% 26-35
      age = 26 + (i % 10);
    } else if (rAge < 9) { // 20% 36-45
      age = 36 + (i % 10);
    } else { // 10% senior
      age = 46 + (i % 15);
    }

    // Determine seniority
    let seniority = 1.5;
    if (i % 5 === 0) {
      seniority = 0.1 + (i % 4) / 10; // < 6 months
    } else if (i % 4 === 0) {
      seniority = 0.5 + (i % 5) / 10; // 6-12 months
    } else {
      seniority = 1.0 + (i % 8) / 2;
    }

    // Determine children
    const hasChildren = (i % 10) < 4 ? 'Sí' : 'No';

    // Determine disability
    const hasDisability = i % 100 === 0 ? 'Sí' : 'No'; // 1%

    // Pick marital status
    const msIdx = i % maritalStatuses.length;
    const marital = maritalStatuses[msIdx]?.status || 'Soltero(a)';

    // Pick city
    const cityIdx = i % cities.length;
    const city = cities[cityIdx]?.name || 'Bogotá';

    // Pick education
    const eduIdx = i % education.length;
    const edu = education[eduIdx]?.level || 'Tecnólogo';

    // Pick contract
    const contractIdx = i % contracts.length;
    const contract = contracts[contractIdx]?.type || 'Término Indefinido';

    // Pick department and assign cargo
    const deptIdx = i % depts.length;
    const dept = depts[deptIdx]?.name || 'Operaciones BPO';
    let cargo = 'Agente BPO';
    if (dept.includes('Tecnología')) {
      cargo = i % 2 === 0 ? 'Desarrollador' : 'Analista QA';
    } else if (dept.includes('Administración')) {
      cargo = 'Coordinador';
    } else if (dept.includes('Calidad')) {
      cargo = 'Analista de Calidad';
    } else {
      cargo = i % 3 === 0 ? 'Asesor de Servicio' : 'Agente de Soporte';
    }

    // Assign Jornada
    const jornada = (dept.includes('Operaciones') && i % 3 === 0) ? 'Nocturna' : 'Diurna';

    list.push({
      edad: age,
      antiguedad: seniority,
      tipoContrato: contract,
      jornada,
      nivelEducativo: edu,
      hijos: hasChildren,
      discapacidad: hasDisability,
      ciudad: city,
      cargo,
      area: dept,
      estadoCivil: marital
    });
  }

  return list;
}
