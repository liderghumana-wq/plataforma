export interface CIIUActivity {
  codigo: string;
  actividad: string;
  claseRiesgo: string;
  sector: string;
  descripcionOficial: string;
  normativa: string;
  riesgosPrioritarios: string[];
  modulosActivados: string[];
  keywords: string[];
}

export const CIIU_DATABASE: CIIUActivity[] = [
  {
    codigo: '8220',
    actividad: 'Actividades de Centros de Llamadas (Call Center / BPO)',
    claseRiesgo: 'I',
    sector: 'Servicios',
    descripcionOficial: 'Comprende las actividades de centros de llamadas entrantes y salientes, respondiendo a llamadas de clientes, atención de reclamos, soporte técnico básico, telemercadeo, cobranzas y procesos de externalización de negocios (BPO).',
    normativa: 'Decreto 768 de 2022',
    riesgosPrioritarios: [
      'Riesgo Psicosocial (Estrés por atención telefónica, carga mental, turnos)',
      'Riesgo Biomecánico (Posturas sedentarias prolongadas, movimientos repetitivos)',
      'Riesgo Ergonómico (Disposición del puesto de trabajo, altura de pantalla)',
      'Fatiga Visual (Exposición a pantallas de visualización de datos, brillo)',
      'Riesgo Vocal (Disfonía por uso prolongado de la voz, tensión laríngea)',
      'Sedentarismo (Bajo gasto calórico, riesgos cardiovasculares asociados)'
    ],
    modulosActivados: [
      'SG-SST',
      'Bienestar',
      'Clima Organizacional',
      'Indicadores',
      'Recomendaciones IA',
      'Vigilancia Epidemiológica',
      'Dashboard Ejecutivo'
    ],
    keywords: ['call center', 'centro de llamadas', 'bpo', 'telemarketing', 'cobranzas', 'servicio al cliente', '8220', 'customer service', 'externalizacion']
  },
  {
    codigo: '6201',
    actividad: 'Desarrollo de Sistemas Informáticos (Software y Consultoría TI)',
    claseRiesgo: 'I',
    sector: 'Servicios de Tecnología',
    descripcionOficial: 'Incluye el desarrollo, diseño de estructura y contenido de software, bases de datos, páginas web, sistemas operativos, programación de aplicaciones informáticas y consultoría en infraestructura tecnológica.',
    normativa: 'Decreto 768 de 2022',
    riesgosPrioritarios: [
      'Riesgo Psicosocial (Sobrecarga de trabajo por entregas, fatiga mental)',
      'Riesgo Biomecánico (Lesión por esfuerzo repetitivo, síndrome de túnel carpiano)',
      'Riesgo Ergonómico (Alineación de columna y brazos en digitación)',
      'Fatiga Visual (Exposición continua a pantallas, resequedad ocular)',
      'Sedentarismo (Falta de movilidad física durante jornadas extensas)'
    ],
    modulosActivados: [
      'SG-SST',
      'Bienestar',
      'Clima Organizacional',
      'Indicadores',
      'Recomendaciones IA',
      'Dashboard Ejecutivo'
    ],
    keywords: ['software', 'tecnologia', 'desarrollo', 'programacion', 'sistemas', 'consultoria ti', '6201', 'it', 'desarrollador', 'computadores']
  },
  {
    codigo: '8544',
    actividad: 'Educación Superior y Formación Profesional',
    claseRiesgo: 'I',
    sector: 'Educación',
    descripcionOficial: 'Actividades de universidades, escuelas de formación técnica, tecnológica y profesional que otorgan títulos académicos oficiales. Incluye docencia, investigación y actividades administrativas de soporte.',
    normativa: 'Decreto 768 de 2022',
    riesgosPrioritarios: [
      'Riesgo Vocal (Disfonía, nódulos vocales por proyección de la voz en aula)',
      'Riesgo Psicosocial (Burnout docente, manejo de grupos, exigencia emocional)',
      'Riesgo Ergonómico (Bipedestación prolongada, posturas de pie en laboratorios)',
      'Riesgo Biológico (Transmisión de agentes patógenos por alta densidad de personas)'
    ],
    modulosActivados: [
      'SG-SST',
      'Bienestar',
      'Clima Organizacional',
      'Recomendaciones IA',
      'Dashboard Ejecutivo'
    ],
    keywords: ['educacion', 'universidad', 'profesor', 'docente', 'academia', 'estudiante', 'colegio', 'escuela', '8544', 'clases', 'enseñanza']
  },
  {
    codigo: '8610',
    actividad: 'Actividades de Hospitales, Clínicas e IPS (Sector Salud)',
    claseRiesgo: 'III',
    sector: 'Salud',
    descripcionOficial: 'Comprende servicios médicos, quirúrgicos y de hospitalización, diagnóstico clínico, laboratorios y atención de urgencias prestados por hospitales generales, clínicas especializadas, sanatorios e instituciones prestadoras de salud (IPS).',
    normativa: 'Decreto 768 de 2022',
    riesgosPrioritarios: [
      'Riesgo Biológico (Exposición a virus, bacterias, fluidos corporales, pinchazos)',
      'Riesgo Psicosocial (Estrés postraumático, turnos nocturnos, sobrecarga, duelo)',
      'Riesgo Biomecánico (Cargas por transferencia de pacientes, sobreesfuerzo)',
      'Riesgo Químico (Manipulación de medicamentos de alta peligrosidad, gases)',
      'Riesgo Físico (Exposición a radiaciones ionizantes de rayos X)'
    ],
    modulosActivados: [
      'SG-SST',
      'Vigilancia Epidemiológica',
      'Indicadores',
      'Planes de Acción',
      'Dashboard Ejecutivo'
    ],
    keywords: ['hospital', 'clinica', 'ips', 'salud', 'medico', 'enfermera', 'paciente', 'urgencias', 'odontologia', '8610', 'cirugia', 'laboratorio']
  },
  {
    codigo: '4711',
    actividad: 'Comercio al por Menor en Establecimientos No Especializados (Retail / Supermercados)',
    claseRiesgo: 'II',
    sector: 'Comercio',
    descripcionOficial: 'Venta al detal de una gran variedad de productos alimenticios, bebidas, tabaco, artículos de uso doméstico, vestuario y aseo, donde predominan las ventas tipo autoservicio o supermercados.',
    normativa: 'Decreto 768 de 2022',
    riesgosPrioritarios: [
      'Riesgo Biomecánico (Manipulación manual de cargas, estanterías, arrastre)',
      'Riesgo Ergonómico (Bipedestación prolongada en cajeros, posturas forzadas)',
      'Riesgo Psicosocial (Estrés por atención al público, manejo de valores)',
      'Riesgo de Accidentes (Caídas de objetos desde altura, resbalones)'
    ],
    modulosActivados: [
      'SG-SST',
      'Bienestar',
      'Indicadores',
      'Planes de Acción',
      'Dashboard Ejecutivo'
    ],
    keywords: ['comercio', 'supermercado', 'retail', 'tienda', 'almacen', 'ventas', 'cajero', 'surtidor', '4711', 'gondola', 'detal']
  },
  {
    codigo: '4111',
    actividad: 'Construcción de Edificaciones Residenciales y Proyectos Civiles',
    claseRiesgo: 'V',
    sector: 'Construcción',
    descripcionOficial: 'Construcción de edificaciones residenciales (casas, apartamentos) e industriales. Incluye obras de remodelación, excavaciones, cimentación y preparación de terrenos bajo estrictas normas de seguridad industrial.',
    normativa: 'Decreto 768 de 2022',
    riesgosPrioritarios: [
      'Riesgo de Trabajo en Alturas (Caídas a diferente nivel, arneses, andamios)',
      'Riesgo Físico (Exposición a ruido industrial, vibraciones de herramientas, sol)',
      'Riesgo Biomecánico (Levantamiento de sacos, mezclas, manipulación pesada)',
      'Riesgo Químico (Inhalación de material particulado, cemento, sílice, polvos)',
      'Riesgo de Accidentes Graves (Atrapamientos, golpes por objetos en movimiento)'
    ],
    modulosActivados: [
      'SG-SST',
      'Vigilancia Epidemiológica',
      'Indicadores',
      'Planes de Acción',
      'Dashboard Ejecutivo'
    ],
    keywords: ['construccion', 'obra', 'edificio', 'ingenieria', 'cemento', 'albañil', 'andamio', 'alturas', 'proyecto civil', '4111', 'excavacion']
  },
  {
    codigo: '4923',
    actividad: 'Transporte de Carga por Carretera',
    claseRiesgo: 'IV',
    sector: 'Transporte',
    descripcionOficial: 'Transporte terrestre nacional, departamental o municipal de mercancías, contenedores, materiales de construcción, líquidos, maquinaria pesada y productos refrigerados en vehículos automotores de carga.',
    normativa: 'Decreto 768 de 2022',
    riesgosPrioritarios: [
      'Riesgo de Accidentes de Tránsito (Colisiones, volcamientos, seguridad vial)',
      'Riesgo Biomecánico (Posturas estáticas en conducción por horas continuas)',
      'Riesgo Psicosocial (Fatiga por jornadas extensas, conducción nocturna, presión)',
      'Riesgo Físico (Exposición a ruido del motor, vibraciones de cuerpo entero)'
    ],
    modulosActivados: [
      'SG-SST',
      'Vigilancia Epidemiológica',
      'Indicadores',
      'Planes de Acción',
      'Dashboard Ejecutivo'
    ],
    keywords: ['transporte', 'carga', 'carretera', 'camion', 'conductor', 'mula', 'flete', 'logistica', '4923', 'conducir', 'distribucion']
  },
  {
    codigo: '1011',
    actividad: 'Procesamiento y Conservación de Alimentos y Productos Cárnicos',
    claseRiesgo: 'III',
    sector: 'Manufactura',
    descripcionOficial: 'Operación de mataderos, plantas de beneficio animal, deshuese, conservación por refrigeración o congelación, empaque al vacío y preparación de embutidos u otros derivados de origen cárnico.',
    normativa: 'Decreto 768 de 2022',
    riesgosPrioritarios: [
      'Riesgo Mecánico (Cortes, amputaciones por cuchillos, sierras, molinos)',
      'Riesgo Físico (Temperaturas frías extremas en cuartos de congelación)',
      'Riesgo Ergonómico (Movimientos repetitivos rápidos, posturas de pie)',
      'Riesgo Biológico (Zoonosis, contacto con agentes infecciosos animales)'
    ],
    modulosActivados: [
      'SG-SST',
      'Vigilancia Epidemiológica',
      'Indicadores',
      'Planes de Acción',
      'Dashboard Ejecutivo'
    ],
    keywords: ['alimentos', 'carne', 'carnico', 'procesamiento', 'embutidos', 'matadero', 'planta', 'frio', 'congelacion', '1011', 'deshuese']
  },
  {
    codigo: '8010',
    actividad: 'Actividades de Seguridad Privada, Vigilancia y Escoltas',
    claseRiesgo: 'IV',
    sector: 'Servicios de Seguridad',
    descripcionOficial: 'Prestación de servicios de protección física, patrullaje, escolta de personas o mercancías valiosas, monitoreo de centrales de alarmas, control de accesos e instalación de sistemas de seguridad.',
    normativa: 'Decreto 768 de 2022',
    riesgosPrioritarios: [
      'Riesgo de Agresión Física (Armas de fuego, hurtos, violencia social, orden público)',
      'Riesgo Psicosocial (Estrés crónico, estado de alerta constante, turnos de 12 horas)',
      'Riesgo Ergonómico / Biomecánico (Bipedestación o sedestación fija prolongada)',
      'Riesgo Físico (Exposición al clima nocturno, frío, lluvia, calor del día)'
    ],
    modulosActivados: [
      'SG-SST',
      'Bienestar',
      'Vigilancia Epidemiológica',
      'Indicadores',
      'Dashboard Ejecutivo'
    ],
    keywords: ['seguridad', 'vigilancia', 'guarda', 'vigilante', 'celador', 'escolta', 'monitoreo', 'alarma', '8010', 'ronda', 'patrulla']
  },
  {
    codigo: '0111',
    actividad: 'Cultivo de Cereales, Legumbres y Semillas Oleaginosas',
    claseRiesgo: 'III',
    sector: 'Agricultura',
    descripcionOficial: 'Producción de granos, trigo, cebada, arroz, leguminosas secas, soya, girasol y otros cultivos que se realizan en suelos preparados para la agricultura comercial o de subsistencia.',
    normativa: 'Decreto 768 de 2022',
    riesgosPrioritarios: [
      'Riesgo Químico (Exposición e intoxicación por plaguicidas, herbicidas)',
      'Riesgo Biológico (Mordeduras de serpientes, picaduras de insectos, hongos)',
      'Riesgo Biomecánico (Levantamiento de cargas pesadas, posturas forzadas)',
      'Riesgo Físico/Ambiental (Insolación extrema, choque de temperatura, deshidratación)'
    ],
    modulosActivados: [
      'SG-SST',
      'Vigilancia Epidemiológica',
      'Planes de Acción',
      'Dashboard Ejecutivo'
    ],
    keywords: ['cultivo', 'agricultura', 'agricola', 'siembra', 'cosecha', 'trigo', 'arroz', 'finca', 'campo', '0111', 'campesino']
  }
];

export function searchCIIU(query: string): CIIUActivity[] {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return [];

  // Exact code match
  const exactCode = CIIU_DATABASE.find(item => item.codigo === cleanQuery);
  if (exactCode) return [exactCode];

  // Scoring results based on relevance
  const scored = CIIU_DATABASE.map(item => {
    let score = 0;

    // Check code match
    if (item.codigo.includes(cleanQuery)) {
      score += 100;
    }

    // Check keyword matches
    const keywordMatches = item.keywords.filter(keyword => keyword.includes(cleanQuery));
    score += keywordMatches.length * 15;

    // Check title match
    if (item.actividad.toLowerCase().includes(cleanQuery)) {
      score += 30;
    }

    // Check description match
    if (item.descripcionOficial.toLowerCase().includes(cleanQuery)) {
      score += 5;
    }

    // Check sector match
    if (item.sector.toLowerCase().includes(cleanQuery)) {
      score += 5;
    }

    return { item, score };
  });

  return scored
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(res => res.item);
}
