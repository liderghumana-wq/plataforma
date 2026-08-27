import { DemographicsData, AiConclusion, Recommendation } from '../types';

export const INITIAL_DEMOGRAPHICS: DemographicsData = {
  totalEmployees: 1240,
  averageAge: 27.8,
  averageSeniority: 2.1, // Años promedio
  wellbeingIndex: 83.4,
  absenteeismRate: 2.3,
  activeParticipation: 89.5,
  hasChildrenPercentage: 42,
  gender: [
    { name: 'Femenino', value: 768, percentage: 62 },
    { name: 'Masculino', value: 459, percentage: 37 },
    { name: 'Otro / No especifica', value: 13, percentage: 1 }
  ],
  ageGroups: [
    { range: '18-25 años', value: 550, label: '550 emp.' },
    { range: '26-35 años', value: 430, label: '430 emp.' },
    { range: '36-45 años', value: 170, label: '170 emp.' },
    { range: '46-55 años', value: 65, label: '65 emp.' },
    { range: '56 años o más', value: 25, label: '25 emp.' }
  ],
  education: [
    { level: 'Bachiller', count: 150 },
    { level: 'Técnico', count: 350 },
    { level: 'Tecnólogo', count: 480 },
    { level: 'Universitario', count: 210 },
    { level: 'Postgrado / Especialista', count: 50 }
  ],
  housing: [
    { type: 'Arrendada', count: 744, percentage: 60 },
    { type: 'Propia', count: 273, percentage: 22 },
    { type: 'Familiar', count: 223, percentage: 18 }
  ],
  city: [
    { name: 'Bogotá', count: 650 },
    { name: 'Medellín', count: 320 },
    { name: 'Cali', count: 160 },
    { name: 'Barranquilla', count: 110 }
  ],
  maritalStatus: [
    { status: 'Soltero(a)', count: 830 },
    { status: 'Unión Libre', count: 240 },
    { status: 'Casado(a)', count: 140 },
    { status: 'Divorciado / Viudo / Otro', count: 30 }
  ],
  departmentWellbeing: [
    { name: 'Operaciones BPO', wellbeing: 80.5, stress: 46, agents: 920 },
    { name: 'Tecnología & QA', wellbeing: 88.2, stress: 28, agents: 120 },
    { name: 'Administración & RRHH', wellbeing: 91.4, stress: 22, agents: 100 },
    { name: 'Calidad & Formación', wellbeing: 85.0, stress: 34, agents: 100 }
  ],
  children: [
    { hasChildren: true, count: 521, percentage: 42 },
    { hasChildren: false, count: 719, percentage: 58 }
  ],
  contractType: [
    { type: 'Término Indefinido', count: 868, percentage: 70 },
    { type: 'Obra o Labor', count: 310, percentage: 25 },
    { type: 'Término Fijo', count: 62, percentage: 5 }
  ],
  ethnicGroups: [
    { name: 'Ninguno / No autoidentifica', count: 980, percentage: 79 },
    { name: 'Mestizo', count: 180, percentage: 15 },
    { name: 'Afrodescendiente', count: 55, percentage: 4 },
    { name: 'Indígena', count: 25, percentage: 2 }
  ],
  socioeconomicStrata: [
    { stratum: 'Estrato 1', count: 150, percentage: 12 },
    { stratum: 'Estrato 2', count: 590, percentage: 48 },
    { stratum: 'Estrato 3', count: 390, percentage: 31 },
    { stratum: 'Estrato 4', count: 85, percentage: 7 },
    { stratum: 'Estrato 5-6', count: 25, percentage: 2 }
  ],
  projects: [
    { name: 'Campamento Bancario', count: 420, percentage: 34 },
    { name: 'Soporte Telecomunicaciones', count: 380, percentage: 31 },
    { name: 'Ventas Seguros', count: 240, percentage: 19 },
    { name: 'Administrativo', count: 200, percentage: 16 }
  ],
  workSites: [
    { site: 'Presencial (Sede)', count: 780, percentage: 63 },
    { site: 'Teletrabajo (Casa)', count: 310, percentage: 25 },
    { site: 'Híbrido', count: 150, percentage: 12 }
  ],
  averageSeniorityRole: 1.1,
  freeTimeUsage: [
    { activity: 'Compartir en familia', count: 480, percentage: 39 },
    { activity: 'Ver series / Películas', count: 320, percentage: 26 },
    { activity: 'Estudiar / Cursos', count: 210, percentage: 17 },
    { activity: 'Actividad deportiva', count: 150, percentage: 12 },
    { activity: 'Otros hobbies', count: 80, percentage: 6 }
  ],
  physicalActivityMode: 'FREQUENCY',
  physicalActivity: [
    { level: 'Ninguna', count: 640, percentage: 52 },
    { level: 'Moderada (1-2 veces/sem)', count: 420, percentage: 34 },
    { level: 'Alta (3+ veces/sem)', count: 180, percentage: 14 }
  ],
  companyActivitiesParticipation: [
    { participation: 'Ocasional', count: 720, percentage: 58 },
    { participation: 'Alta', count: 310, percentage: 25 },
    { participation: 'Nunca / Baja', count: 210, percentage: 17 }
  ],
  pets: [
    { hasPets: true, count: 710, percentage: 57 },
    { hasPets: false, count: 530, percentage: 43 }
  ],
  averageWeight: 69.4,
  averageHeight: 1.67,
  averageIMC: 24.9,
  imcClassification: [
    { category: 'Bajo peso (< 18.5)', count: 60, percentage: 4.8 },
    { category: 'Normal (18.5 - 24.9)', count: 680, percentage: 54.8 },
    { category: 'Sobrepeso (25.0 - 29.9)', count: 390, percentage: 31.5 },
    { category: 'Obesidad I (30.0 - 34.9)', count: 80, percentage: 6.5 },
    { category: 'Obesidad II (35.0 - 39.9)', count: 20, percentage: 1.6 },
    { category: 'Obesidad III (>= 40.0)', count: 10, percentage: 0.8 }
  ],
  averageWaistPerimeter: 83.1,
  allergies: [
    { allergy: 'Ninguna', count: 1020, percentage: 82 },
    { allergy: 'Medicamentos / Alimentos', count: 120, percentage: 10 },
    { allergy: 'Respiratorias / Polvo', count: 100, percentage: 8 }
  ],
  medications: [
    { medicated: 'Ninguno', count: 980, percentage: 79 },
    { medicated: 'Analgésicos / Antiinflamatorios', count: 150, percentage: 12 },
    { medicated: 'Antihipertensivos / Hormonas', count: 110, percentage: 9 }
  ],
  diseases: [
    { disease: 'Ninguna / Sin patologías', count: 1050, percentage: 85 },
    { disease: 'Migraña recurrente', count: 95, percentage: 8 },
    { disease: 'Gastritis crónica', count: 65, percentage: 5 },
    { disease: 'Hipertensión arterial', count: 30, percentage: 2 }
  ],
  musculoskeletalPain: [
    { bodyPart: 'Cuello / Hombros', count: 480, percentage: 39 },
    { bodyPart: 'Espalda baja (Lumbar)', count: 390, percentage: 31 },
    { bodyPart: 'Ninguna', count: 210, percentage: 17 },
    { bodyPart: 'Muñecas / Manos', count: 160, percentage: 13 }
  ],
  bloodType: [
    { group: 'O+', count: 720, percentage: 58.1 },
    { group: 'A+', count: 310, percentage: 25.0 },
    { group: 'O-', count: 85, percentage: 6.9 },
    { group: 'B+', count: 65, percentage: 5.2 },
    { group: 'A-', count: 35, percentage: 2.8 },
    { group: 'AB+', count: 15, percentage: 1.2 },
    { group: 'B-', count: 8, percentage: 0.6 },
    { group: 'AB-', count: 2, percentage: 0.2 }
  ],
  averageHouseholdMembers: 3.2,
  peopleLivingAloneCount: 186,
  peopleLivingAlonePercentage: 15
};

export const UPDATED_DEMOGRAPHICS_EXCEL: DemographicsData = {
  totalEmployees: 1450,
  averageAge: 26.5,
  averageSeniority: 1.8,
  wellbeingIndex: 85.2,
  absenteeismRate: 1.9,
  activeParticipation: 92.1,
  hasChildrenPercentage: 38,
  gender: [
    { name: 'Femenino', value: 928, percentage: 64 },
    { name: 'Masculino', value: 508, percentage: 35 },
    { name: 'Otro / No especifica', value: 14, percentage: 1 }
  ],
  ageGroups: [
    { range: '18-25 años', value: 720, label: '720 emp.' },
    { range: '26-35 años', value: 440, label: '440 emp.' },
    { range: '36-45 años', value: 190, label: '190 emp.' },
    { range: '46-55 años', value: 75, label: '75 emp.' },
    { range: '56 años o más', value: 25, label: '25 emp.' }
  ],
  education: [
    { level: 'Bachiller', count: 210 },
    { level: 'Técnico', count: 420 },
    { level: 'Tecnólogo', count: 550 },
    { level: 'Universitario', count: 220 },
    { level: 'Postgrado / Especialista', count: 50 }
  ],
  housing: [
    { type: 'Arrendada', count: 914, percentage: 63 },
    { type: 'Propia', count: 290, percentage: 20 },
    { type: 'Familiar', count: 246, percentage: 17 }
  ],
  city: [
    { name: 'Bogotá', count: 810 },
    { name: 'Medellín', count: 340 },
    { name: 'Cali', count: 180 },
    { name: 'Barranquilla', count: 120 }
  ],
  maritalStatus: [
    { status: 'Soltero(a)', count: 1030 },
    { status: 'Unión Libre', count: 250 },
    { status: 'Casado(a)', count: 140 },
    { status: 'Divorciado / Viudo / Otro', count: 30 }
  ],
  departmentWellbeing: [
    { name: 'Operaciones BPO', wellbeing: 82.1, stress: 42, agents: 1110 },
    { name: 'Tecnología & QA', wellbeing: 89.0, stress: 27, agents: 130 },
    { name: 'Administración & RRHH', wellbeing: 92.5, stress: 20, agents: 110 },
    { name: 'Calidad & Formación', wellbeing: 86.2, stress: 31, agents: 100 }
  ],
  children: [
    { hasChildren: true, count: 551, percentage: 38 },
    { hasChildren: false, count: 899, percentage: 62 }
  ],
  contractType: [
    { type: 'Término Indefinido', count: 943, percentage: 65 },
    { type: 'Obra o Labor', count: 450, percentage: 31 },
    { type: 'Término Fijo', count: 57, percentage: 4 }
  ],
  ethnicGroups: [
    { name: 'Ninguno / No autoidentifica', count: 1110, percentage: 77 },
    { name: 'Mestizo', count: 220, percentage: 15 },
    { name: 'Afrodescendiente', count: 85, percentage: 6 },
    { name: 'Indígena', count: 35, percentage: 2 }
  ],
  socioeconomicStrata: [
    { stratum: 'Estrato 1', count: 180, percentage: 12 },
    { stratum: 'Estrato 2', count: 680, percentage: 47 },
    { stratum: 'Estrato 3', count: 450, percentage: 31 },
    { stratum: 'Estrato 4', count: 105, percentage: 7 },
    { stratum: 'Estrato 5-6', count: 35, percentage: 3 }
  ],
  projects: [
    { name: 'Campamento Bancario', count: 510, percentage: 35 },
    { name: 'Soporte Telecomunicaciones', count: 440, percentage: 30 },
    { name: 'Ventas Seguros', count: 280, percentage: 19 },
    { name: 'Administrativo', count: 220, percentage: 15 }
  ],
  workSites: [
    { site: 'Presencial (Sede)', count: 880, percentage: 61 },
    { site: 'Teletrabajo (Casa)', count: 390, percentage: 27 },
    { site: 'Híbrido', count: 180, percentage: 12 }
  ],
  averageSeniorityRole: 0.9,
  freeTimeUsage: [
    { activity: 'Compartir en familia', count: 580, percentage: 40 },
    { activity: 'Ver series / Películas', count: 390, percentage: 27 },
    { activity: 'Estudiar / Cursos', count: 220, percentage: 15 },
    { activity: 'Actividad deportiva', count: 190, percentage: 13 },
    { activity: 'Otros hobbies', count: 70, percentage: 5 }
  ],
  physicalActivityMode: 'FREQUENCY',
  physicalActivity: [
    { level: 'Ninguna', count: 780, percentage: 54 },
    { level: 'Moderada (1-2 veces/sem)', count: 480, percentage: 33 },
    { level: 'Alta (3+ veces/sem)', count: 190, percentage: 13 }
  ],
  companyActivitiesParticipation: [
    { participation: 'Ocasional', count: 840, percentage: 58 },
    { participation: 'Alta', count: 390, percentage: 27 },
    { participation: 'Nunca / Baja', count: 220, percentage: 15 }
  ],
  pets: [
    { hasPets: true, count: 880, percentage: 61 },
    { hasPets: false, count: 570, percentage: 39 }
  ],
  averageWeight: 68.9,
  averageHeight: 1.66,
  averageIMC: 25.0,
  imcClassification: [
    { category: 'Bajo peso (< 18.5)', count: 80, percentage: 5.5 },
    { category: 'Normal (18.5 - 24.9)', count: 770, percentage: 53.1 },
    { category: 'Sobrepeso (25.0 - 29.9)', count: 460, percentage: 31.7 },
    { category: 'Obesidad I (30.0 - 34.9)', count: 100, percentage: 6.9 },
    { category: 'Obesidad II (35.0 - 39.9)', count: 30, percentage: 2.1 },
    { category: 'Obesidad III (>= 40.0)', count: 10, percentage: 0.7 }
  ],
  averageWaistPerimeter: 83.9,
  allergies: [
    { allergy: 'Ninguna', count: 1210, percentage: 83 },
    { allergy: 'Medicamentos / Alimentos', count: 130, percentage: 9 },
    { allergy: 'Respiratorias / Polvo', count: 110, percentage: 8 }
  ],
  medications: [
    { medicated: 'Ninguno', count: 1150, percentage: 79 },
    { medicated: 'Analgésicos / Antiinflamatorios', count: 180, percentage: 12 },
    { medicated: 'Antihipertensivos / Hormonas', count: 120, percentage: 8 }
  ],
  diseases: [
    { disease: 'Ninguna / Sin patologías', count: 1230, percentage: 85 },
    { disease: 'Migraña recurrente', count: 110, percentage: 8 },
    { disease: 'Gastritis crónica', count: 75, percentage: 5 },
    { disease: 'Hipertensión arterial', count: 35, percentage: 2 }
  ],
  musculoskeletalPain: [
    { bodyPart: 'Cuello / Hombros', count: 580, percentage: 40 },
    { bodyPart: 'Espalda baja (Lumbar)', count: 430, percentage: 30 },
    { bodyPart: 'Ninguna', count: 260, percentage: 18 },
    { bodyPart: 'Muñecas / Manos', count: 180, percentage: 12 }
  ],
  bloodType: [
    { group: 'O+', count: 841, percentage: 58.0 },
    { group: 'A+', count: 363, percentage: 25.0 },
    { group: 'O-', count: 102, percentage: 7.0 },
    { group: 'B+', count: 73, percentage: 5.0 },
    { group: 'A-', count: 41, percentage: 2.8 },
    { group: 'AB+', count: 17, percentage: 1.2 },
    { group: 'B-', count: 9, percentage: 0.6 },
    { group: 'AB-', count: 4, percentage: 0.3 }
  ],
  averageHouseholdMembers: 2.9,
  peopleLivingAloneCount: 261,
  peopleLivingAlonePercentage: 18
};

export const DEFAULT_AI_CONCLUSIONS: AiConclusion[] = [
  {
    category: 'Demográfica',
    title: 'Población Extremadamente Joven y Dinámica (Gen Z y Millennials)',
    text: 'El 75% de los colaboradores tiene menos de 30 años (edad promedio: 27.8 años). Esta alta concentración juvenil denota una fuerza de trabajo dinámica, adaptada a la tecnología y de rápido aprendizaje, pero con altas expectativas de crecimiento y propensa a una rotación temprana si no se cubren sus motivadores extrínsecos e intrínsecos (salario emocional).',
    impact: 'Necesidad de estructurar planes de carrera ágiles y gamificación en operaciones.'
  },
  {
    category: 'Bienestar y Familias',
    title: 'Alto Porcentaje de Madres Cabezas de Hogar y Colaboradores con Hijos',
    text: 'El 42% de la población tiene hijos a cargo y la distribución de sexo es marcadamente femenina (62%). Muchas de ellas reportan ser el único sustento del hogar. Esto resalta la importancia de flexibilidad horaria, convenios de guardería o apoyo escolar y el fortalecimiento de programas de apoyo familiar en el SG-SST.',
    impact: 'La estabilidad laboral se asocia directamente a la flexibilidad horaria y teletrabajo.'
  },
  {
    category: 'Riesgo Psicosocial',
    title: 'Nivel de Estrés Elevado en Operaciones de Voz BPO',
    text: 'El personal de Operaciones BPO (920 agentes) reporta un índice de estrés percibido del 46% y un bienestar del 80.5%, sensiblemente inferior a las áreas administrativas (bienestar de 91.4%). La fatiga mental está correlacionada con metas estrictas de servicio (AHT) y el contacto reiterado con clientes hostiles.',
    impact: 'Responsable directo del 85% de las solicitudes de ausentismo médico por migrañas o tensión.'
  },
  {
    category: 'Vivienda y Transporte',
    title: 'Alta Dependencia de Vivienda Arrendada y Largos Traslados',
    text: 'El 60% de los colaboradores habita en vivienda arrendada y reporta tiempos de traslado de más de 65 minutos diarios en transporte masivo. Esto influye negativamente en la fatiga acumulada pre-turno, afectando directamente la puntualidad y la salud osteomuscular.',
    impact: 'Recomendación de potenciar esquemas híbridos o rutas de acercamiento corporativo.'
  }
];

export const INITIAL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'rec-1',
    category: 'Salud Mental & Psicosocial',
    title: 'Pausas Activas Cognitivas y de Descompresión Mental',
    desc: 'Instaurar un protocolo de pausas activas enfocadas en salud mental (técnicas de respiración diafragmática, mindfulness de 3 minutos) integradas en el flujo de diademas telefónicas de los agentes cada 3 horas.',
    priority: 'Alta',
    status: 'En Progreso',
    responsible: 'Psicóloga de Bienestar & SST'
  },
  {
    id: 'rec-2',
    category: 'Estilo de Vida y Familia',
    title: 'Flexibilidad de Horarios para Padres y Madres Cabeza de Familia',
    desc: 'Establecer turnos rotativos preferenciales y días de teletrabajo estructurados para el 42% de la población con hijos, facilitando el balance vida-trabajo y disminuyendo el ausentismo imprevisto.',
    priority: 'Alta',
    status: 'Planificada',
    responsible: 'Gestión Humana & Operaciones'
  },
  {
    id: 'rec-3',
    category: 'Ergonomía y Teletrabajo',
    title: 'Kit de Ergonomía "Happy Home" para Teletrabajo',
    desc: 'Suministrar soportes ergonómicos para laptop, diademas con cancelación de ruido y apoyos lumbares a los agentes que operan en modelo híbrido desde casa con evaluaciones de puesto deficientes.',
    priority: 'Media',
    status: 'Planificada',
    responsible: 'Coordinador SG-SST'
  },
  {
    id: 'rec-4',
    category: 'Formación y Bienestar',
    title: 'Taller de Inteligencia Emocional y Gestión del Estrés con Clientes',
    desc: 'Implementar un plan de formación continuo para agentes de servicio al cliente sobre técnicas de despersonalización de agresiones verbales, manejo de respiración y modulación vocal durante llamadas críticas.',
    priority: 'Alta',
    status: 'Implementada',
    responsible: 'Formación Operativa & SST'
  },
  {
    id: 'rec-5',
    category: 'Promoción de la Salud',
    title: 'Alianzas Educativas y de Crecimiento para Técnicos/Tecnólogos',
    desc: 'Firmar convenios de descuento y flexibilidad horaria con instituciones de educación superior para el 67% de la población que cuenta con niveles técnicos/tecnólogos y aspira a profesionalización.',
    priority: 'Media',
    status: 'En Progreso',
    responsible: 'Bienestar Laboral'
  }
];

// Heurísticas de preguntas del Asistente Happy IA
export const ASSISTANT_PRESET_ANSWERS: Record<string, string> = {
  '¿Cuáles son los principales hallazgos?': `### Principales Hallazgos Sociodemográficos - BPO Happy

Al procesar la base de datos sociodemográfica actual, la Inteligencia Artificial de **Happy Insight IA** ha identificado los siguientes puntos críticos para la gestión del SG-SST:

1. **Juventud Predominante (Bajo Promedio de Edad):** El promedio de edad es de **27.8 años**, con un **75% de la población por debajo de los 30 años**. Esto requiere campañas de comunicación visuales, lúdicas e interactivas. El salario emocional es clave.
2. **Alta Población Femenina y con Hijos:** El **62% de la fuerza laboral es femenina** y el **42% tiene hijos a cargo**, de las cuales un gran porcentaje son madres cabeza de hogar. El balance vida-trabajo es el factor número uno de fidelización.
3. **Alto Estrés en Operaciones:** El área de **Operaciones BPO** presenta un índice de estrés percibido de **46%**, lo cual contrasta fuertemente con el **22%** de las áreas administrativas. Esto impacta de forma directa en las incapacidades médicas y de ausentismo.
4. **Vivienda Arrendada y Desplazamiento:** El **60% de los trabajadores vive en arriendo** y recorren en promedio más de una hora de trayecto para llegar a las oficinas físicas, aumentando la fatiga muscular y mental antes de iniciar labores.`,

  '¿Qué población requiere mayor intervención?': `### Población Prioritaria para Intervención en el SG-SST

Basado en el cruce de variables sociodemográficas, ausentismo e índices de bienestar, las poblaciones críticas que requieren intervención inmediata son:

1. **Agentes de Operación de Voz en Bogotá y Medellín:**
   - **Razón:** Presentan los picos más altos de estrés auto-reportado (46%) y fatiga auditiva.
   - **Ruta de Intervención:** Implementar pausas activas cognitivas de 3 a 5 minutos, rotaciones temporales de campañas de voz a canales de chat (no-voz) y auditorías periódicas de diademas y volumen.

2. **Madres Cabeza de Hogar en Campañas Nocturnas:**
   - **Razón:** El 42% del personal tiene hijos, y las que operan en horarios rotativos o nocturnos sufren mayor riesgo de fatiga de higiene del sueño y estrés psicosocial por la conciliación de responsabilidades familiares.
   - **Ruta de Intervención:** Programa "Higiene de Sueño" corporativo y darles prioridad absoluta en asignación de horarios diurnos o modalidad Work-At-Home.

3. **Colaboradores de Primer Empleo (18 a 24 años):**
   - **Razón:** Representan el grupo con mayor tasa de deserción temprana (rotación a los 3-6 meses).
   - **Ruta de Intervención:** Programas de mentoría, beneficios flexibles (gimnasio, convenios recreativos) y formación en resiliencia laboral.`,

  '¿Qué campañas recomienda la IA?': `### Campañas Recomendadas por Happy Insight IA para SG-SST

Para el año de gestión actual, la IA recomienda enfocar los recursos en las siguientes 4 megacampañas corporativas:

1. **Campaña "Smile & Breathe" (Salud Mental):**
   - **Foco:** Disminuir el estrés del 46% en Operaciones.
   - **Ejecución:** Ejercicios interactivos guiados de respiración diafragmática en la pantalla de los agentes cada 3 horas, y tele-apoyo psicológico confidencial 24/7.

2. **Campaña "Ergo-Safe Home" (Ergonomía e Híbrido):**
   - **Foco:** Prevenir lesiones osteomusculares.
   - **Ejecución:** Autoevaluaciones ergonómicas rápidas por foto y entrega focalizada de kits ergonómicos (apoyalumbares, mouse vertical y soporte de pantalla) financiados por la empresa.

3. **Campaña "Happy Family" (Salud y Bienestar Familiar):**
   - **Foco:** Brindar estabilidad al 42% de padres/madres cabeza de hogar.
   - **Ejecución:** Flexibilización de turnos para entrega de boletines escolares, torneos lúdicos infantiles online, y bonos canjeables por útiles escolares o citas de pediatría médica.

4. **Campaña "Higiene del Sueño BPO" (Medicina Preventiva):**
   - **Foco:** Mitigar fatiga en personal nocturno.
   - **Ejecución:** Talleres prácticos sobre adecuación de habitación oscura, alimentación saludable para turnos nocturnos (evitar picos de azúcar) y pausas de estiramientos neuromusculares a las 2:00 AM.`,

  '¿Qué acciones debo incluir en el Plan Anual de SST?': `### Acciones Clave Recomendadas para el Plan Anual de SST (SG-SST)

Para garantizar un plan de Seguridad y Salud alineado con la realidad sociodemográfica de **BPO Happy**, debe incluir las siguientes acciones con presupuesto asignado:

1. **Evaluación de Riesgo Psicosocial Automatizada (Batería de Riesgo):**
   - **Acción:** Aplicar la batería oficial de riesgo psicosocial de forma digitalizada, priorizando el área operativa.
   - **Meta:** Cobertura del 95% del personal de operaciones de voz.

2. **Estructura de Micro-pausas Activas Gamificadas:**
   - **Acción:** Integrar en el software operativo de telefonía un recordatorio interactivo para realizar estiramientos de dedos, manos y cuello de 3 minutos tras bloques intensos de llamadas.
   - **Meta:** Reducir en un 15% el reporte de síndrome de túnel carpiano y tendinitis.

3. **Monitoreo Médico Ocupacional Continuo en Sede y Teletrabajo:**
   - **Acción:** Realizar valoraciones médicas ocupacionales con énfasis osteomuscular y auditivo.
   - **Meta:** Diagnóstico temprano de hipoacusia inducida por ruido en el 100% de agentes con antigüedad de >1 año.

4. **Taller de Resiliencia y Manejo de Clientes Críticos:**
   - **Acción:** Capacitar en técnicas de contención emocional, asertividad y descompresión emocional post-llamada conflictiva.
   - **Meta:** Disminución del agotamiento percibido (Burnout) en un 20% en las encuestas semestrales.`
};
