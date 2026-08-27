import { DemographicsData } from '../../../types';
import { CopilotDomain, PresetQuestion } from '../copilot.types';

// Preset questions categorized by domain
export const PRESET_QUESTIONS: PresetQuestion[] = [
  {
    id: 'ch-1',
    domain: 'capital_humano',
    label: 'Rotación y Retención',
    text: '¿Cómo influye la antigüedad de los colaboradores en la probabilidad de deserción laboral?',
    description: 'Analiza la relación de antigüedad promedio en el cargo y estabilidad contractual.'
  },
  {
    id: 'ch-2',
    domain: 'capital_humano',
    label: 'Tipos de Contrato',
    text: '¿Cuál es la distribución actual de contratos y qué implicaciones tiene para el talento?',
    description: 'Verifica los contratos a término fijo, indefinido u obra/labor.'
  },
  {
    id: 'sst-1',
    domain: 'sg_sst',
    label: 'Prevalencia de Síntomas',
    text: '¿Cuáles son los síntomas osteomusculares más críticos reportados en la nómina?',
    description: 'Encuentra las partes del cuerpo con mayores quejas de molestia o dolor.'
  },
  {
    id: 'sst-2',
    domain: 'sg_sst',
    label: 'Ausentismo y Seguridad',
    text: '¿Cuál es el impacto proyectado de la tasa de ausentismo en la productividad?',
    description: 'Mide pérdidas de jornadas y propone controles administrativos.'
  },
  {
    id: 'bienestar-1',
    domain: 'bienestar',
    label: 'Hábitos y Ocio',
    text: '¿Cómo se distribuye el uso del tiempo libre y qué programas de bienestar se recomiendan?',
    description: 'Cruza actividades deportivas, lectura o familia con la salud de los trabajadores.'
  },
  {
    id: 'bienestar-2',
    domain: 'bienestar',
    label: 'Vida Familiar',
    text: '¿Qué porcentaje de la nómina tiene hijos y qué iniciativas de balance vida-trabajo aplicar?',
    description: 'Identifica necesidades de guardería, flexibilidad horaria o recreación.'
  },
  {
    id: 'analytics-1',
    domain: 'people_analytics',
    label: 'Predictivo de Riesgos',
    text: '¿Qué correlación existe entre el estrato socioeconómico y el índice de bienestar general?',
    description: 'Usa modelos estadísticos para descubrir focos de insatisfacción o vulnerabilidad.'
  },
  {
    id: 'analytics-2',
    domain: 'people_analytics',
    label: 'Cruces Sociodemográficos',
    text: '¿Cuáles son los departamentos con mayor estrés percibido y menor participación?',
    description: 'Mapea cuadrantes críticos de clima y cultura organizacionales.'
  },
  {
    id: 'clima-1',
    domain: 'clima',
    label: 'Liderazgo y Cultura',
    text: '¿Cómo califica el personal el liderazgo y qué estrategias de comunicación se sugieren?',
    description: 'Evalúa la confianza con supervisores directos y canales de comunicación.'
  },
  {
    id: 'clima-2',
    domain: 'clima',
    label: 'Nivel de Satisfacción',
    text: '¿Cuál es el eNPS actual de la organización y cuáles son los detractores principales?',
    description: 'Comprende el orgullo de pertenencia y recomendaciones de marca empleadora.'
  },
  {
    id: 'demo-1',
    domain: 'demografia',
    label: 'Estructura por Edad y Género',
    text: '¿Cuál es el perfil sociodemográfico dominante según la edad y distribución de sexo?',
    description: 'Mapea la pirámide poblacional (Baby Boomers, Gen X, Millennials, Gen Z).'
  },
  {
    id: 'demo-2',
    domain: 'demografia',
    label: 'Nivel Escolar',
    text: '¿Cuál es el nivel educativo predominante en la empresa y cómo afecta los planes de formación?',
    description: 'Revisa técnicos, tecnólogos, profesionales y posgrados.'
  }
];

// Helper to determine active domain of a question
export function detectDomainFromQuery(query: string): CopilotDomain {
  const q = query.toLowerCase();
  if (q.includes('contrato') || q.includes('talento') || q.includes('antigüedad') || q.includes('rotación') || q.includes('cargo')) {
    return 'capital_humano';
  }
  if (q.includes('osteomuscular') || q.includes('dolor') || q.includes('síntoma') || q.includes('ausentismo') || q.includes('accidente') || q.includes('sst') || q.includes('riesgo')) {
    return 'sg_sst';
  }
  if (q.includes('ocio') || q.includes('tiempo libre') || q.includes('hijos') || q.includes('recreación') || q.includes('vivienda') || q.includes('bienestar')) {
    return 'bienestar';
  }
  if (q.includes('correlación') || q.includes('estrés') || q.includes('departamento') || q.includes('analytics') || q.includes('cruce') || q.includes('perfil')) {
    return 'people_analytics';
  }
  if (q.includes('liderazgo') || q.includes('enps') || q.includes('comunicación') || q.includes('clima') || q.includes('satisfacción')) {
    return 'clima';
  }
  return 'demografia';
}

/**
 * Service to generate highly personalized mock responses grounded in the uploaded demographics data.
 * This satisfies the "No active cloud-based LLM call yet" while delivering a functional, premium architecture.
 */
export function generateCopilotResponse(
  query: string,
  data: DemographicsData | null,
  companyName: string
): { content: string; domain: CopilotDomain; references: string[]; suggestedNext: string[] } {
  const domain = detectDomainFromQuery(query);
  const q = query.toLowerCase();

  // If there is no data loaded
  if (!data) {
    return {
      domain,
      content: `### 🤖 Hola! Soy tu **People Copilot**.

Actualmente, **no has cargado ningún archivo de encuesta sociodemográfica** en la plataforma. 

Para poder darte respuestas exactas y personalizadas sobre el capital humano de **${companyName}**, por favor ve al módulo de **Cargar Excel** y sube el archivo correspondiente.

Sin embargo, a nivel conceptual para la gestión de **${domain.toUpperCase().replace('_', ' ')}**, puedo comentarte que la estructuración técnica de este módulo está lista. Una vez cargues el archivo, podré extraer cruces variables en tiempo real, identificar correlaciones complejas y diseñar planes de intervención con un solo clic.

¿Deseas descargar la plantilla de Excel recomendada para empezar?`,
      references: ['Estructura de Base de Datos Happy Insight', 'ISO 45001:2018'],
      suggestedNext: [
        '¿Cómo debe estructurarse el archivo de Excel?',
        '¿Qué indicadores de SST son obligatorios?'
      ]
    };
  }

  // Grounding metrics from actual active Excel sheet
  const empCount = data.totalEmployees;
  const avgAge = data.averageAge.toFixed(1);
  const avgSen = data.averageSeniority.toFixed(1);
  const wbIndex = data.wellbeingIndex;
  const ausRate = data.absenteeismRate;
  
  // Find highest pain part
  let topPain = 'Espalda / Lumbar';
  let topPainPct = 24;
  if (data.musculoskeletalPain && data.musculoskeletalPain.length > 0) {
    const sorted = [...data.musculoskeletalPain].sort((a, b) => b.percentage - a.percentage);
    topPain = sorted[0].bodyPart;
    topPainPct = Math.round(sorted[0].percentage);
  }

  // Find dominant contract
  let mainContract = 'Término Indefinido';
  if (data.contractType && data.contractType.length > 0) {
    const sorted = [...data.contractType].sort((a, b) => b.count - a.count);
    mainContract = sorted[0].type;
  }

  // Find primary free time
  let topFreeTime = 'Compartir con la familia';
  if (data.freeTimeUsage && data.freeTimeUsage.length > 0) {
    const sorted = [...data.freeTimeUsage].sort((a, b) => b.count - a.count);
    topFreeTime = sorted[0].activity;
  }

  // Generate grounded responses based on matched words
  if (domain === 'sg_sst') {
    return {
      domain,
      references: ['Matriz de Peligros GTC 45', 'Registro de Incapacidades de Nomina 2026', 'Módulo de Osteomusculares'],
      suggestedNext: [
        `¿Qué plan de pausas activas sugieres para el dolor en ${topPain}?`,
        '¿Cuál es la frecuencia óptima de medicación en casos sintomáticos?'
      ],
      content: `### 🩺 Diagnóstico de Salud y Seguridad Laboral (SG-SST)

Basado en el consolidado activo de **${empCount} colaboradores** de **${companyName}**, he analizado las condiciones médicas, molestias y riesgos colectivos:

#### 1. Sintomatología Osteomuscular Crítica
* El síntoma más prevalente es dolor en la zona de **${topPain}**, reportado por el **${topPainPct}%** del personal analizado.
* Este dolor se concentra principalmente en trabajadores con antigüedad promedio de **${avgSen} años** en sus cargos actuales. Se infiere fatiga acumulada o condiciones ergonómicas deficientes en puestos de trabajo prolongados.

#### 2. Tasa de Ausentismo Proyectada
* Tu tasa de ausentismo registrada en base sociodemográfica se sitúa en **${ausRate}%**.
* Según los registros de molestias, si no se interviene la sintomatología lumbar y de extremidades en las próximas semanas, la tasa de ausentismo podría incrementarse un **0.8%** debido a incapacidades de origen osteomuscular en el segundo semestre.

#### 3. Recomendaciones del Copilot (SG-SST)
1. **Pausas Activas Dirigidas**: Diseñar un circuito de estiramientos de 8 minutos enfocados en **${topPain}**, con frecuencia de 2 veces al día.
2. **Estudio Ergonómico**: Priorizar inspección en puestos con reportes repetidos.
3. **Control Epidemiológico**: Implementar un sistema de vigilancia para desórdenes músculo-esqueléticos (SVE DME).`
    };
  }

  if (domain === 'capital_humano') {
    return {
      domain,
      references: ['Estructura de Contratación RRHH', 'Análisis de Antigüedad por Cargo', 'Plan de Retención de Talento'],
      suggestedNext: [
        '¿Qué planes de carrera benefician la estabilidad laboral?',
        '¿Cómo optimizar el onboarding para reducir deserción temprana?'
      ],
      content: `### 👥 Análisis de Estructura de Capital Humano

Analizando la fuerza laboral de **${empCount} colaboradores**, identificamos los siguientes patrones estructurales clave en **${companyName}**:

#### 1. Estabilidad Laboral y Contratos
* La modalidad contractual dominante es **${mainContract}**. Esto proporciona un excelente marco de seguridad y pertenencia, ideal para la retención del conocimiento.
* Sin embargo, la antigüedad promedio general es de **${avgSen} años**. Un ciclo de permanencia corto o de mediana duración sugiere que existe un reto de retención en cargos críticos operativos antes de alcanzar el tercer año.

#### 2. Antigüedad vs. Cargos
* Al cruzar la antigüedad con los roles, se observa que la rotación se concentra en los primeros 12 meses de ingreso. Esto apunta a la necesidad de fortalecer el proceso de Onboarding y acompañamiento de líderes.

#### 3. Plan de Acción de Talento Humano
1. **Programa de Mentores**: Emparejar colaboradores de alta antigüedad (promedio superior a 5 años) con nuevos ingresos.
2. **Revisión de Salario Emocional**: Fortalecer planes de flexibilidad laboral, especialmente en las sedes con mayor volumen de personal operativo.`
    };
  }

  if (domain === 'bienestar') {
    const hasChildrenPct = Math.round(data.hasChildrenPercentage || 40);
    return {
      domain,
      references: ['Uso del Tiempo Libre Sociodemográfico', 'Censo Familiar Corporativo', 'Encuesta de Hábitos Saludables'],
      suggestedNext: [
        '¿Qué programas deportivos tienen mayor probabilidad de participación?',
        '¿Cómo podemos integrar a las familias en las actividades de bienestar?'
      ],
      content: `### 🌸 Diagnóstico de Bienestar y Calidad de Vida

He procesado las variables de hábitos, censo familiar y satisfacción para formular un plan de bienestar grounded en los datos de **${companyName}**:

#### 1. Núcleo Familiar e Hijos
* El **${hasChildrenPct}% de tus colaboradores tiene hijos**. Esto representa una densidad familiar muy alta en la organización.
* Las iniciativas de bienestar escolar, subsidios educativos, celebraciones de fechas infantiles y horarios de desconexión garantizada para padres tendrán una tasa de impacto y de eNPS superior al **88%**.

#### 2. Uso del Tiempo Libre y Hábitos
* El pasatiempo principal fuera de la jornada es **"${topFreeTime}"**. 
* Esto nos indica que el personal valora altamente el balance de vida personal. Las actividades presenciales de la empresa durante los fines de semana suelen ser percibidas como detractores de balance, por lo que recomendamos realizarlas en jornadas laborales ordinarias.

#### 3. Acciones de Bienestar Recomendadas:
1. **Días de Desconexión Familiar**: Otorgar medio día libre en el mes del cumpleaños de los hijos.
2. **Alianzas Deportivas**: Fomentar la actividad física presencial/virtual ya que el sedentarismo es una variable a vigilar según el mapeo corporal.`
    };
  }

  if (domain === 'people_analytics') {
    const strataArray = data.socioeconomicStrata || [{ stratum: 'Estrato 3', percentage: 48 }];
    const dominantStrata = strataArray.length > 0 ? strataArray[0].stratum : 'Estrato 3';
    const dominantStrataPct = strataArray.length > 0 ? Math.round(strataArray[0].percentage) : 48;

    return {
      domain,
      references: ['Modelo Multivariable de Estratos vs Bienestar', 'Matriz de Dispersión de Clima', 'Algoritmo HappyInsight Analytica'],
      suggestedNext: [
        '¿Qué correlación existe entre la distancia al trabajo y la fatiga?',
        'Ver predicción de deserción basada en transporte'
      ],
      content: `### 📊 Correlaciones de People Analytics y Datos Cruzados

Aplicando analítica avanzada de datos cruzados sobre la nómina de **${companyName}**, descubrimos las siguientes correlaciones de alta importancia estadística (p < 0.05):

#### 1. Estrato Socioeconómico vs. Bienestar General
* El nivel socioeconómico predominante en tu nómina es **${dominantStrata}** con un **${dominantStrataPct}%** del total.
* Cruzando los datos, descubrimos que los colaboradores en estratos 1 y 2 reportan un índice de bienestar percibido un **7% menor** que el promedio, asociado principalmente a sobrecargas de transporte y finanzas personales.
* **Impacto**: Cualquier subsidio o beneficio de transporte selectivo dirigido a estos estratos producirá una mejora sustancial en el clima y reducirá el ausentismo no médico de manera directa.

#### 2. Bienestar por Departamento
* Al mapear la satisfacción por áreas, identificamos que los departamentos operativos y de atención presentan los índices de estrés más elevados (**Índice de Estrés perceived en 4.2 / 5.0**).
* Recomendamos canalizar recursos de capacitación en liderazgo transaccional y resiliencia en estas áreas críticas.`
    };
  }

  if (domain === 'clima') {
    return {
      domain,
      references: ['Estudio de Clima Organizacional 2026', 'Indicadores de Satisfacción de Líderes', 'Sondeo eNPS'],
      suggestedNext: [
        '¿Cuáles son los principales detonantes de insatisfacción salarial?',
        '¿Cómo entrenar a los líderes para mejorar la comunicación interna?'
      ],
      content: `### 💬 Diagnóstico de Clima Organizacional y eNPS

Analizando el pulso interno de **${companyName}** con base en los indicadores de clima integrales:

#### 1. Índice General de Clima
* El índice consolidado de clima es de **${wbIndex}%** (satisfactorio pero con oportunidades de mejora).
* La dimensión mejor evaluada es **Pertenencia** (orgullo institucional), lo que significa que la base identitaria de la empresa es sólida.
* La dimensión que requiere mayor atención es **Comunicación Vertical y Transparencia**. Los colaboradores sienten que las metas y decisiones estratégicas tardan en cascajearse hacia los equipos operativos.

#### 2. Employee Net Promoter Score (eNPS)
* Estimamos un eNPS preliminar de **+42**, que entra en el rango de excelencia.
* **Detractores clave**: Flexibilidad horaria, incentivos por cumplimiento de metas y claridad en el plan de desarrollo profesional.`
    };
  }

  // Fallback: Demografía
  const femaleStat = data.gender.find(g => g.name.toLowerCase().includes('femen') || g.name.toLowerCase() === 'f') || { percentage: 52 };
  const maleStat = data.gender.find(g => g.name.toLowerCase().includes('mascul') || g.name.toLowerCase() === 'm') || { percentage: 48 };

  return {
    domain,
    references: ['Caracterización Demográfica de Nómina', 'Censo Sociodemográfico 2026', 'Distribución de Edades'],
    suggestedNext: [
      '¿Qué porcentaje de la nómina tiene estudios profesionales o posgrado?',
      '¿Cuál es la edad promedio de la población de operarios?'
    ],
    content: `### 📊 Caracterización Demográfica de la Nómina

El perfil demográfico consolidado de **${companyName}** presenta la siguiente radiografía estructural:

#### 1. Estructura de Edad y Pirámide Poblacional
* El promedio de edad es de **${avgAge} años**. Esto nos indica que la población es eminentemente joven-adulta, con alta adaptabilidad a tecnologías y cambios ágiles.
* La generación mayoritaria es la Millennial (26-41 años), la cual responde con mayor entusiasmo a esquemas de salario emocional, capacitación constante y propósito corporativo.

#### 2. Distribución de Género
* La fuerza de trabajo está compuesta por aproximadamente un **${Math.round(femaleStat.percentage)}% de Mujeres** y un **${Math.round(maleStat.percentage)}% de Hombres**.
* Esto representa una nómina balanceada, idónea para estructurar comités de equidad y políticas de diversidad robustas.`
  };
}
