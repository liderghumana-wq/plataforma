import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

// Inicializar Express
const app = express();
const PORT = 3000;

app.use(express.json());

// Clientes e inicialización perezosa (lazy) de Gemini para evitar colapsos
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      try {
        aiClient = new GoogleGenAI({ apiKey: key });
      } catch (e) {
        console.error('Error inicializando GoogleGenAI:', e);
      }
    }
  }
  return aiClient;
}

// 1. Endpoint de Salud de la API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});
// 2. Endpoint del Asistente Happy IA (Llamada Real a Gemini o Fallback Inteligente)
app.post('/api/chat', async (req: Request, res: Response) => {
  const { prompt, demographics } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Falta el prompt en el cuerpo de la solicitud.' });
  }

  const cleanPrompt = prompt.trim();

  // Helper to extract statistics from uploaded demographics in real-time
  const total = demographics?.totalEmployees || 1240;
  const avgAge = demographics?.averageAge || 27.8;
  const avgSeniority = demographics?.averageSeniority || 2.1;
  const avgSeniorityRole = demographics?.averageSeniorityRole || 1.2;
  const wellbeing = demographics?.wellbeingIndex || 83.4;
  const absenteeism = demographics?.absenteeismRate || 2.3;
  const kidsPct = demographics?.hasChildrenPercentage || 42;

  // Gender
  const genders = demographics?.gender || [];
  const primaryGender = genders.length > 0 
    ? [...genders].sort((a: any, b: any) => b.percentage - a.percentage)[0] 
    : { name: 'Femenino', percentage: 62 };

  // City
  const cities = demographics?.city || [];
  const primaryCity = cities.length > 0 
    ? [...cities].sort((a: any, b: any) => b.count - a.count)[0] 
    : { name: 'Bogotá', count: 645 };

  // Education
  const education = demographics?.education || [];
  const primaryEdu = education.length > 0 
    ? [...education].sort((a: any, b: any) => b.count - a.count)[0] 
    : { level: 'Tecnólogo', count: 480 };

  // Marital Status
  const marital = demographics?.maritalStatus || [];
  const primaryMarital = marital.length > 0 
    ? [...marital].sort((a: any, b: any) => b.count - a.count)[0] 
    : { status: 'Soltero(a)', count: 720 };

  // Strata (Estrato)
  const strata = demographics?.socioeconomicStrata || [];
  const primaryStratum = strata.length > 0 
    ? [...strata].sort((a: any, b: any) => b.count - a.count)[0] 
    : { stratum: 'Estrato 2', percentage: 56 };

  // Housing
  const housing = demographics?.housing || [];
  const primaryHousing = housing.length > 0 
    ? [...housing].sort((a: any, b: any) => b.percentage - a.percentage)[0] 
    : { type: 'Arrendada', percentage: 61 };

  // Pain / Musculoskeletal
  const pain = demographics?.musculoskeletalPain || [];
  const primaryPain = pain.length > 0 
    ? [...pain].sort((a: any, b: any) => b.percentage - a.percentage)[0] 
    : { bodyPart: 'Cuello / Hombros', percentage: 39 };

  // Sedentary (physical activity)
  const physical = demographics?.physicalActivity || [];
  const sedentary = physical.find((p: any) => p.level === 'Ninguna')?.percentage || 52;

  // Diseases
  const diseases = demographics?.diseases || [];
  const topDisease = diseases.length > 0 
    ? [...diseases].filter((d: any) => d.disease !== 'Ninguna' && d.disease !== 'Ninguno' && d.disease !== 'Sano').sort((a: any, b: any) => b.percentage - a.percentage)[0] 
    : { disease: 'Ninguna reportada', percentage: 0 };

  // IMC classification
  const imcList = demographics?.imcClassification || [];
  const overweightPct = imcList.find((i: any) => i.category?.includes('Sobrepeso'))?.percentage || 31;
  const obesityPct = imcList.find((i: any) => i.category?.includes('Obesidad'))?.percentage || 9;
  const totalExcessWeight = Number(overweightPct) + Number(obesityPct);
  const avgImc = demographics?.averageIMC || 24.9;

  // Time free activity
  const freeTime = demographics?.freeTimeUsage || [];
  const primaryFreeTime = freeTime.length > 0 
    ? [...freeTime].sort((a: any, b: any) => b.count - a.count)[0] 
    : { activity: 'Compartir en familia', percentage: 35 };

  // Wellbeing participation
  const activeParticipationPct = demographics?.activeParticipation || 42;

  const client = getGeminiClient();
  
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Eres 'Happy Insight IA', el asistente virtual experto, analista inteligente en Seguridad y Salud en el Trabajo (SG-SST) para la empresa BPO Happy.
        
Tu rol es analizar con rigor técnico la información sociodemográfica de la encuesta y responder preguntas utilizando estrictamente los datos cargados. Utiliza lenguaje técnico formal de SG-SST (mencionando normativas colombianas como el Decreto 1072 de 2015, Resolución 2646 de 2008, etc. cuando corresponda).

Aquí tienes los datos sociodemográficos exactos y actualizados de la población analizada extraídos del archivo cargado (Usa ÚNICAMENTE estos datos y haz referencia a ellos):
- Total de Colaboradores: ${total}
- Edad Promedio: ${avgAge} años
- Antigüedad Promedio en la Empresa: ${avgSeniority} años
- Antigüedad Promedio en el Cargo: ${avgSeniorityRole} años
- Índice de Bienestar General: ${wellbeing}%
- Tasa de Ausentismo Médico: ${absenteeism}% mensual
- Porcentaje con Hijos: ${kidsPct}%
- Distribución de Sexo Predominante: ${primaryGender.name} (${primaryGender.percentage}%)
- Ciudad Principal de Operación: ${primaryCity.name} (${primaryCity.count} colaboradores)
- Nivel Educativo (Escolaridad) Mayoritario: ${primaryEdu.level} (${primaryEdu.count} colaboradores)
- Estado Civil Predominante: ${primaryMarital.status} (${primaryMarital.count} colaboradores)
- Nivel Socioeconómico (Estrato) Predominante: ${primaryStratum.stratum} (${primaryStratum.percentage}%)
- Tipo de Vivienda Mayoritaria: ${primaryHousing.type} (${primaryHousing.percentage}%)
- Molestia Osteomuscular Prevalente: Dolor en ${primaryPain.bodyPart} (${primaryPain.percentage}%)
- Nivel de Inactividad Física (Sedentarismo): ${sedentary}% reporta Ninguna actividad física semanal
- Enfermedad más común reportada: ${topDisease.disease} (${topDisease.percentage}%)
- Clasificación de Peso (Exceso de Peso - Sobrepeso + Obesidad): ${totalExcessWeight}% de la población (IMC Promedio: ${avgImc})
- Actividad favorita en tiempo libre: ${primaryFreeTime.activity}
- Participación Activa en Actividades de Bienestar: ${activeParticipationPct}%

Por favor, responde la consulta del usuario de manera profesional, estructurada en Markdown (usando títulos '### ', listas y negrita para enfatizar), con un tono corporativo, riguroso y orientado a la acción en Seguridad y Salud en el Trabajo. Basa tus respuestas únicamente en estos datos y haz hincapié en el perfil técnico del diagnóstico sociodemográfico.

Consulta del usuario: "${cleanPrompt}"

Respuesta técnica, concreta, sin introducciones vacías o felicitaciones. Ve directo al análisis solicitado:`,
        config: {
          temperature: 0.5,
        },
      });

      const replyText = response.text;
      return res.json({ text: replyText, source: 'gemini' });
    } catch (error: any) {
      console.error('Error llamando a Gemini API:', error);
    }
  }

  // --- FALLBACK HEURÍSTICO DE ALTÍSIMA FIDELIDAD TOTALMENTE DINÁMICO ---
  const cleanPromptLower = cleanPrompt.toLowerCase();
  let simulatedResponse = '';

  if (cleanPromptLower.includes('hallazgos') || cleanPromptLower.includes('principales')) {
    simulatedResponse = `### Informe de Hallazgos Sociodemográficos y Clínicos (SG-SST) 📊

Basado en el análisis estadístico de la encuesta caracterizada de **${total} colaboradores**, se consolidan los siguientes hallazgos críticos de orden sociodemográfico, clínico y de bienestar:

- **1. Perfil Demográfico Joven:** Edad promedio de **${avgAge} años** y antigüedad de **${avgSeniority} años** (con **${avgSeniorityRole} años** promedio en el cargo). Esta fuerza laboral es marcadamente joven (Generación Z/Millennial), concentrada en la ciudad de **${primaryCity.name}**, con nivel de escolaridad predominantemente **${primaryEdu.level}** y estado civil mayoritario **${primaryMarital.status}**. Esto exige metodologías de capacitación dinámicas e interactivas.
- **2. Alta Prevalencia Osteomuscular:** Un **${primaryPain.percentage}%** de los colaboradores reporta molestias en **${primaryPain.bodyPart}**. Esto se asocia directamente con posturas estáticas prolongadas y diseño ergonómico de puestos de trabajo, un factor de riesgo prioritario para el Sistema de Vigilancia Epidemiológica (SVE).
- **3. Alerta de Riesgo Cardiovascular (Sedentarismo y Nutrición):** Se identifica un nivel crítico de inactividad física, donde el **${sedentary}%** reporta **NULA** actividad física semanal. Adicionalmente, el **${totalExcessWeight}%** de la población presenta exceso de peso (sobrepeso u obesidad) con un IMC promedio de **${avgImc}**, incrementando el riesgo metabólico corporativo.
- **4. Responsabilidad Familiar y Entorno Habitacional:** El **${kidsPct}%** del personal tiene hijos. Además, el **${primaryHousing.percentage}%** vive en vivienda de tipo **${primaryHousing.type}** y la mayoría se ubica en el estrato **${primaryStratum.stratum}** (${primaryStratum.percentage}%). Estos determinantes sociales influyen en la fatiga extra-laboral y requieren estrategias de conciliación familiar.
- **5. Participación en Bienestar:** Actualmente se registra una participación activa del **${activeParticipationPct}%** en actividades de la empresa, lo cual representa una base de compromiso favorable para impulsar nuevos hábitos de vida saludable, aprovechando que el uso predilecto de tiempo libre es **"${primaryFreeTime.activity}"**.`;
  } else if (cleanPromptLower.includes('grupo') || cleanPromptLower.includes('intervención') || cleanPromptLower.includes('intervencion') || cleanPromptLower.includes('población') || cleanPromptLower.includes('poblacion')) {
    simulatedResponse = `### Diagnóstico de Población y Grupos Prioritarios para Intervención 🎯

Conforme a la matriz de correlación de variables sociodemográficas y de salud de la empresa, se definen los siguientes grupos prioritarios de atención bajo el marco de priorización del SG-SST:

1. **Población Expuesta a Riesgo Biomecánico (Ergonomía):**
   El grupo prioritario está conformado por el **${primaryPain.percentage}%** de colaboradores con molestias recurrentes en **${primaryPain.bodyPart}**. Este grupo requiere intervención ergonómica inmediata, incluyendo inspección de puestos, reconfiguración física (especialmente para el personal en teletrabajo o híbrido) y entrenamiento en higiene postural activa.
2. **Población con Riesgo Cardiovascular Acumulado:**
   Integrado por el **${sedentary}%** de colaboradores sedentarios y el **${totalExcessWeight}%** clasificado con sobrepeso u obesidad (IMC promedio de **${avgImc}**). Este segmento representa la mayor probabilidad de ausentismo por patologías crónicas no transmisibles.
3. **Población Joven con Baja Antigüedad (Retención y Clima):**
   Con una edad media de **${avgAge} años** y antigüedad de **${avgSeniority} años**, la población con perfil técnico o tecnólogo de **${primaryCity.name}** requiere programas integrales de bienestar emocional y salario emocional para contrarrestar la rotación temprana y mitigar el estrés operativo.
4. **Padres y Madres de Familia (Conciliación):**
   El **${kidsPct}%** de colaboradores con personas a cargo que requiere estructuración de redes de apoyo, escuela de padres y alineación de horarios flexibles de conformidad con las leyes de protección familiar.`;
  } else if (cleanPromptLower.includes('campaña') || cleanPromptLower.includes('recomienda') || cleanPromptLower.includes('campana') || cleanPromptLower.includes('campñas') || cleanPromptLower.includes('campañas')) {
    simulatedResponse = `### Recomendaciones de Campañas de Intervención Prioritarias 🚀

De acuerdo con los hallazgos cuantitativos de la base de datos sociodemográfica de **${total} colaboradores**, se propone el despliegue inmediato de las siguientes campañas estructuradas de Seguridad y Salud en el Trabajo:

- **1. Campaña "Ergo-Safe" (Prevención de dolencias osteomusculares):**
  - *Foco:* Atender la molestia del **${primaryPain.percentage}%** de dolor en **${primaryPain.bodyPart}**.
  - *Acciones:* Pausas activas guiadas de estiramiento compensatorio y fortalecimiento muscular de 5 a 10 minutos por turno, inspecciones de puestos de trabajo híbridos y distribución de instructivos gráficos de ergonomía laboral.
- **2. Campaña "Vitalidad Happy" (Cardioprotección y Estilo de Vida):**
  - *Foco:* Mitigar el **${sedentary}%** de sedentarismo y el **${totalExcessWeight}%** de exceso de peso.
  - *Acciones:* Retos corporativos de pasos diarios (gamificados), talleres virtuales de nutrición balanceada y tamizaje periódico de riesgo cardiovascular (perímetro de cintura e índice de masa corporal).
- **3. Campaña "Happy Family" (Equilibrio Vida-Trabajo):**
  - *Foco:* Soporte al **${kidsPct}%** de colaboradores con hijos.
  - *Acciones:* Actividades de escuela de crianza asertiva y redes de apoyo emocional, y la flexibilización de turnos para facilitar el cuidado familiar de los trabajadores.
- **4. Campaña "Descompresión Emocional" (Salud Mental):**
  - *Foco:* Apoyo confidencial de bienestar.
  - *Acciones:* Implementación de 3 minutos de descompresión mental guiada e integración de técnicas de mindfulness y respiración para atenuar el estrés percibido.`;
  } else if (cleanPromptLower.includes('acciones') || cleanPromptLower.includes('plan anual') || cleanPromptLower.includes('plan de acción') || cleanPromptLower.includes('plan de accion') || cleanPromptLower.includes('sst')) {
    simulatedResponse = `### Acciones Técnicas para Incorporar en el Plan Anual de SST 📋

Para dar cumplimiento formal al Decreto 1072 de 2015 y mitigar la tasa de ausentismo médico del **${absenteeism}%**, se deben incorporar las siguientes acciones dentro del Plan Anual de SST basadas en la caracterización sociodemográfica real:

1. **Vigilancia Epidemiológica Osteomuscular (SVE Biomecánico):**
   - Diseñar y ejecutar jornadas de tamizaje de postura e inspección técnica para el **${primaryPain.percentage}%** que reporta molestias en **${primaryPain.bodyPart}**.
   - Integrar pausas osteomusculares activas dirigidas con soporte de fisioterapeutas o líderes de bienestar.
2. **Promoción de Hábitos de Vida Saludables (Cardiometabólico):**
   - Implementar un plan de educación nutricional y desafíos lúdicos deportivos internos que respondan de manera contundente al **${sedentary}%** de sedentarismo y al **${totalExcessWeight}%** con exceso de peso.
   - Programar tamizajes de IMC (${avgImc} promedio) y perímetro de cintura trimestral.
3. **Mitigación de Riesgo Psicosocial y Estrés Operativo:**
   - Aplicar y analizar anualmente la **Batería de Riesgo Psicosocial** (Resolución 2646 de 2008) enfocando acciones en grupos con alta tensión.
   - Brindar talleres de manejo del tiempo, descompresión cognitiva y pautas de liderazgo empático.
4. **Subprograma de Bienestar y Redes de Apoyo Familiar:**
   - Ejecutar talleres de manejo del presupuesto del hogar y fomento a la adquisición de vivienda propia para atender el **${primaryHousing.percentage}%** que actualmente reside en vivienda **${primaryHousing.type}** (estrato mayoritario **${primaryStratum.stratum}**).
   - Talleres de recreación familiar dirigidos al **${kidsPct}%** de trabajadores con hijos.`;
  } else if (cleanPromptLower.includes('protectores') || cleanPromptLower.includes('protector')) {
    simulatedResponse = `### Factores Protectores Identificados en la Población (SG-SST) 🛡️

El análisis multidimensional de la encuesta sociodemográfica ha identificado importantes fortalezas y factores protectores internos que actúan como amortiguadores de riesgo ocupacional:

- **1. Alta Estabilidad Laboral:** El contrato a término indefinido (predominante en la empresa) aporta seguridad socioeconómica y disminuye el estrés financiero de la nómina.
- **2. Elevado Índice de Bienestar General:** La organización ostenta un sobresaliente índice de bienestar del **${wellbeing}%**, un indicador robusto de un clima laboral favorable y una fuerte cohesión corporativa.
- **3. Disposición a la Participación de Bienestar:** Se registra un **${activeParticipationPct}%** de participación en actividades de la empresa, lo que evidencia que la fuerza de trabajo es receptiva a iniciativas preventivas y capacitaciones de SST.
- **4. Redes de Apoyo Familiar y Mascotas:** La coexistencia en hogares con promedio de integrantes familiares estables representa redes efectivas de soporte social extra-laboral.
- **5. Nivel Educativo Cualificado:** El perfil educativo predominante **${primaryEdu.level}** facilita la asimilación ágil de instructivos digitales, lineamientos de autocuidado y tecnologías de prevención.`;
  } else if (cleanPromptLower.includes('riesgo') || cleanPromptLower.includes('riesgos')) {
    simulatedResponse = `### Factores de Riesgo Críticos Identificados (SG-SST) ⚠️

Del procesamiento de la encuesta del personal, se alertan los siguientes factores de riesgo prioritarios que deben ser monitoreados para evitar incrementos en la tasa de ausentismo médico (actualmente en **${absenteeism}%** mensual):

- **1. Inactividad Física Severa (Sedentarismo):** El **${sedentary}%** de los colaboradores admite **NULA** actividad física regular. Es el factor de riesgo cardiovascular número uno dentro de la población y amerita planes de acondicionamiento de inmediata ejecución.
- **2. Fatiga Ergónomica por Posturas Fijas:** Un alarmante **${primaryPain.percentage}%** de dolores recurrentes localizados en **${primaryPain.bodyPart}**. Indica posturas estáticas prolongadas ante videorreflectoras y laptops sin descompresión osteomuscular sistemática.
- **3. Exceso de Peso Corporal:** El **${totalExcessWeight}%** de los colaboradores se clasifica con sobrepeso u obesidad, con un IMC promedio global de **${avgImc}**. Esto representa un riesgo metabólico silencioso relevante.
- **4. Vulnerabilidad en Tenencia de Vivienda:** El **${primaryHousing.percentage}%** reside bajo modalidad de vivienda **${primaryHousing.type}** en el estrato socioeconómico **${primaryStratum.stratum}** (${primaryStratum.percentage}%), lo que se traduce en variables de presión financiera que influyen en el riesgo psicosocial extralaboral.
- **5. Presencia de Enfermedades Diagnosticadas:** El reporte clínico indica que la patología o dolencia más común es **${topDisease.disease}** (${topDisease.percentage}%), la cual debe vigilarse mediante subprogramas de medicina preventiva.`;
  } else {
    simulatedResponse = `### Análisis Sociodemográfico Profesional - Happy Insight IA 💻📊

Para atender a tu consulta personalizada: **"${cleanPrompt}"** sobre una fuerza de trabajo de **${total} colaboradores**, se consolida la siguiente ficha diagnóstica en lenguaje formal de SG-SST:

- **Estructura Demográfica:** Edad promedio de **${avgAge} años**, antigüedad promedio de **${avgSeniority} años** (y **${avgSeniorityRole} años** en el cargo), escolaridad mayoritaria de **${primaryEdu.level}** y estado civil predominante **${primaryMarital.status}**.
- **Condiciones de Salud y Hábitos:** Índice de Bienestar del **${wellbeing}%**, con un **${sedentary}%** de inactividad física, **${totalExcessWeight}%** con exceso de peso (IMC promedio: **${avgImc}**), y un **${primaryPain.percentage}%** que refiere dolor musculoesquelético localizado en **${primaryPain.bodyPart}**.
- **Recomendación Profesional:** Se aconseja articular comités COPASST específicos y diseñar programas de bienestar basados en retos saludables de steps y micro-pausas compensatorias de ergonomía activa. Las actividades corporativas deben alinearse con el uso preferido de tiempo libre de la nómina: **"${primaryFreeTime.activity}"**.`;
  }

  return res.json({ text: simulatedResponse, source: 'local-preset' });
});

// 3. Endpoint del Asistente IA para Clima Organizacional
app.post('/api/clima/chat', async (req: Request, res: Response) => {
  const { prompt, climateData } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Falta el prompt en el cuerpo de la solicitud.' });
  }

  const cleanPrompt = prompt.trim();
  const total = climateData?.totalParticipants || 0;
  const globalAvg = climateData?.globalAverage || 0;
  const globalFav = climateData?.globalFavorability || 0;
  const dimensions = climateData?.dimensions || [];

  // Sort dimensions by lowest favorability to find weak spots
  const weakDimensions = [...dimensions]
    .filter((d: any) => d.average > 0)
    .sort((a: any, b: any) => a.favorability - b.favorability)
    .slice(0, 3);

  const weakDimText = weakDimensions.map((d: any) => `- ${d.name}: ${d.favorability}% de favorabilidad (Promedio: ${d.average}/5)`).join('\n');

  const client = getGeminiClient();
  
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Eres 'Happy Clima IA', un consultor experto y analista de Clima Organizacional y Desarrollo Humano.
        
Tu rol es analizar con rigor técnico los resultados de la encuesta de Clima Organizacional y responder la consulta del usuario utilizando estrictamente los datos cargados. Usa un lenguaje técnico profesional de Recursos Humanos (mencionando metodologías de desarrollo organizacional, engagement, liderazgo situacional, etc.).

Aquí tienes los datos reales y consolidados de la encuesta de Clima Organizacional de la empresa:
- Total de Participantes: ${total} colaboradores
- Promedio Global de Clima: ${globalAvg} / 5
- Índice de Favorabilidad Global: ${globalFav}%
- Dimensiones con mayor urgencia de intervención (menor favorabilidad):
${weakDimText || 'Ninguna (Sin datos)'}

Todas las dimensiones evaluadas:
${dimensions.map((d: any) => `- ${d.name}: Promedio ${d.average}/5, Favorabilidad ${d.favorability}%`).join('\n')}

Por favor, responde la consulta de manera estructurada en Markdown (usando títulos '### ', listas y negrita para enfatizar), con un tono corporativo y orientado a la mejora continua y el bienestar del personal. Basa tus análisis estrictamente en estos datos.

Consulta del usuario: "${cleanPrompt}"

Respuesta técnica, concreta, sin introducciones vacías. Ve directo al análisis solicitado:`,
        config: {
          temperature: 0.5,
        },
      });

      const replyText = response.text;
      return res.json({ text: replyText, source: 'gemini' });
    } catch (error: any) {
      console.error('Error llamando a Gemini API para Clima:', error);
    }
  }

  // --- FALLBACK HEURÍSTICO LOCAL DE CLIMA ---
  const cleanPromptLower = cleanPrompt.toLowerCase();
  let simulatedResponse = '';

  if (cleanPromptLower.includes('diagnostico') || cleanPromptLower.includes('diagnóstico') || cleanPromptLower.includes('hallazgos') || cleanPromptLower.includes('resultados')) {
    simulatedResponse = `### Diagnóstico del Clima Organizacional 📈

A partir del análisis de la encuesta de clima respondida por **${total} colaboradores**, se consolida la siguiente ficha diagnóstica:

- **1. Desempeño Global:** Se registra un promedio global de **${globalAvg} de 5.0** con un índice de favorabilidad del **${globalFav}%**. Un clima en este rango indica un nivel de satisfacción y compromiso general moderado, con oportunidades claras de optimización.
- **2. Puntos Críticos de Intervención:** Las dimensiones que requieren atención inmediata debido a sus niveles de favorabilidad son:
${weakDimText || '- No hay datos de dimensiones disponibles.'}
- **3. Recomendaciones de Foco:** Se sugiere centrar el plan de acción anual en robustecer las competencias de liderazgo y asegurar un flujo continuo y transparente en la comunicación interna, alineando los objetivos estratégicos con la experiencia del colaborador.`;
  } else if (cleanPromptLower.includes('liderazgo') || cleanPromptLower.includes('jefe') || cleanPromptLower.includes('líderes')) {
    simulatedResponse = `### Análisis de Liderazgo y Estilo de Dirección 👥

El liderazgo es la piedra angular del clima laboral en la organización. Evaluando las respuestas de los **${total} participantes**:

- **Firmeza del canal de dirección:** La relación del personal con sus supervisores directos influye directamente en el ausentismo y la retención laboral.
- **Acción sugerida:** Fortalecer las habilidades de liderazgo situacional y retroalimentación empática. Se recomienda desplegar un programa de "Líderes Inspiradores" enfocado en comunicación asertiva, retroalimentación formativa de desempeño y confianza inter-funcional, mitigando la brecha de confianza jerárquica.`;
  } else if (cleanPromptLower.includes('plan') || cleanPromptLower.includes('acción') || cleanPromptLower.includes('accion') || cleanPromptLower.includes('recomendaciones')) {
    simulatedResponse = `### Plan de Acción Estratégico de Clima IA 📋

Para movilizar la favorabilidad global del clima, que actualmente se sitúa en **${globalFav}%**, se proponen tres campañas prioritarias:

1. **Campaña "Canales Abiertos" (Dimensión Comunicación):**
   - *Objetivo:* Mitigar barreras de información.
   - *Acción:* Establecer reuniones periódicas tipo "Town Hall" lideradas por la gerencia general y habilitar buzones digitales confidenciales de sugerencias para retroalimentación directa.
2. **Programa de Coaching de Gestión (Dimensión Liderazgo):**
   - *Objetivo:* Elevar la confianza y acompañamiento en los cargos de mandos medios.
   - *Acción:* Talleres interactivos mensuales sobre liderazgo ágil, reconocimiento oportuno y gestión emocional del cambio.
3. **Mesa de Equidad y Reconocimiento (Dimensión Compensación & Reconocimiento):**
   - *Objetivo:* Aumentar la satisfacción respecto al esfuerzo individual percibido.
   - *Acción:* Implementar el programa "Embajadores de Éxito" para felicitar y dar visibilidad pública periódica a logros individuales y de equipo.`;
  } else {
    simulatedResponse = `### Análisis de Clima Organizacional - Happy Clima IA 📈
    
Para atender a tu consulta personalizada: **"${cleanPrompt}"** sobre una muestra de **${total} colaboradores**, se consolida la siguiente ficha técnica:

- **Métricas Clave:** Promedio general de **${globalAvg} / 5.0** con favorabilidad del **${globalFav}%**.
- **Dimensiones Más Críticas:** 
${weakDimText || '- No hay dimensiones críticas registradas.'}
- **Enfoque Consultivo:** Se recomienda socializar estos resultados con los comités internos, garantizando transparencia en el proceso de diagnóstico y co-diseñando soluciones conjuntas a través de talleres "Focus Group" por departamento.`;
  }

  return res.json({ text: simulatedResponse, source: 'local-preset' });
});

// 4. Endpoint para Generar Recomendaciones Estructuradas de Clima IA
app.post('/api/clima/generate-recs', async (req: Request, res: Response) => {
  const { climateData } = req.body;

  if (!climateData) {
    return res.status(400).json({ error: 'Falta la información de clima organizacional.' });
  }

  const total = climateData.totalParticipants || 0;
  const globalAvg = climateData.globalAverage || 0;
  const globalFav = climateData.globalFavorability || 0;
  const dimensions = climateData.dimensions || [];

  const client = getGeminiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analiza los siguientes resultados de una encuesta de Clima Organizacional de una empresa y genera una lista de exactamente 4 recomendaciones prioritarias en formato JSON estructurado.

Resultados de la empresa:
- Colaboradores evaluados: ${total}
- Promedio Global de Clima: ${globalAvg}/5
- Índice de Favorabilidad Global: ${globalFav}%

Resultados detallados por dimensión:
${dimensions.map((d: any) => `- ID: "${d.dimensionId}", Nombre: "${d.name}", Promedio: ${d.average}/5, Favorabilidad: ${d.favorability}%`).join('\n')}

El formato de respuesta DEBE SER EXCLUSIVAMENTE un bloque de código JSON válido que corresponda a un arreglo de objetos con esta estructura (sin texto introductorio, sin caracteres markdown adicionales fuera de las comillas):
[
  {
    "id": "clima-rec-1",
    "dimensionId": "id_de_la_dimension",
    "dimensionName": "Nombre de la dimensión correspondiente",
    "title": "Título corto y directo de la recomendación",
    "description": "Explicación detallada de la propuesta técnica y justificación según los puntajes de la dimensión",
    "priority": "Alta" | "Media" | "Baja",
    "actionSteps": ["Paso de acción 1", "Paso de acción 2", "Paso de acción 3"],
    "status": "Planificada",
    "responsible": "Director de Gestión Humana" | "COPASST" | "Líderes de Área"
  }
]

Ordena las recomendaciones priorizando las dimensiones con MENOR favorabilidad. Devuelve únicamente el JSON válido:`,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        },
      });

      try {
        const text = response.text || '[]';
        // Remove markdown backticks if any
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const recs = JSON.parse(cleanJson);
        if (Array.isArray(recs)) {
          return res.json({ recommendations: recs, source: 'gemini' });
        }
      } catch (parseErr) {
        console.error('Error parseando JSON de Gemini para recomendaciones de clima:', parseErr);
      }
    } catch (apiErr) {
      console.error('Error llamando a Gemini para recomendaciones de clima:', apiErr);
    }
  }

  // --- FALLBACK HEURÍSTICO LOCAL DE ALTA FIDELIDAD ---
  // Seleccionar las 4 dimensiones más bajas y generar recomendaciones realistas de Recursos Humanos
  const activeDims = dimensions.filter((d: any) => d.average > 0);
  const sortedDims = [...activeDims].sort((a: any, b: any) => a.favorability - b.favorability);
  
  // Si no hay dimensiones con datos, usar las por defecto de clima.config
  const fallbackDims = sortedDims.length >= 4 
    ? sortedDims.slice(0, 4) 
    : dimensions.slice(0, 4);

  const localRecommendations = fallbackDims.map((dim: any, index: number) => {
    let title = '';
    let description = '';
    let actionSteps: string[] = [];
    let priority: 'Alta' | 'Media' | 'Baja' = 'Alta';
    let responsible = 'Director de Gestión Humana';

    if (index === 0) priority = 'Alta';
    else if (index === 1) priority = 'Alta';
    else if (index === 2) priority = 'Media';
    else priority = 'Baja';

    switch (dim.dimensionId) {
      case 'liderazgo':
        title = 'Programa de Liderazgo Empático y Co-Creación';
        description = `Dado que la dimensión de ${dim.name} presenta una favorabilidad de ${dim.favorability}%, es prioritario capacitar a los mandos medios en estilos de dirección democráticos y retroalimentación activa.`;
        actionSteps = [
          'Realizar talleres interactivos trimestrales en liderazgo situacional y retroalimentación empática.',
          'Habilitar espacios quincenales obligatorios de alineación uno a uno (1on1) jefes-colaboradores.',
          'Diseñar e implementar una encuesta de feedback ascendente de 180 grados.'
        ];
        responsible = 'Gestión Humana y Líderes';
        break;
      case 'comunicacion':
        title = 'Despliegue de Canales Transparentes de Información';
        description = `El índice de ${dim.favorability}% de favorabilidad en la dimensión ${dim.name} expone la necesidad de descentralizar la información operativa y abrir canales horizontales bilaterales.`;
        actionSteps = [
          'Establecer reuniones informativas mensuales tipo Town Hall lideradas por el Comité Ejecutivo.',
          'Lanzar un boletín informativo semanal digital corto con noticias, logros y metas.',
          'Habilitar un canal digital anónimo de sugerencias con respuesta corporativa semanal pública.'
        ];
        responsible = 'Comunicaciones Internas';
        break;
      case 'trabajo_equipo':
        title = 'Mesas de Sinergia y Alineación de Equipos';
        description = `La dimensión de ${dim.name} (Favorabilidad: ${dim.favorability}%) requiere fortalecer la confianza y cohesión interpersonal entre los miembros de los departamentos operativos.`;
        actionSteps = [
          'Implementar talleres lúdicos (teambuilding) semestrales de resolución constructiva de conflictos.',
          'Crear células interdepartamentales para proyectos especiales de optimización.',
          'Lanzar un tablero digital de reconocimientos inter-equipos de acceso general.'
        ];
        responsible = 'Líderes de Área';
        break;
      case 'reconocimiento':
        title = 'Plan de Reconocimiento al Esfuerzo e Incentivos No Monetarios';
        description = `Con un puntaje de ${dim.average}/5, el reconocimiento y la equidad laboral percibida en ${dim.name} constituyen una variable de alta retención. Se sugiere estructurar el salario emocional.`;
        actionSteps = [
          'Institucionalizar el galardón mensual "Colaborador Destacado" en base a valores corporativos.',
          'Ofrecer días flexibles libres por metas de desempeño extraordinarias cumplidas.',
          'Ejecutar una auditoría interna de equidad salarial por roles equivalentes.'
        ];
        responsible = 'Compensación y Bienestar';
        break;
      case 'desarrollo':
        title = 'Alineación de Planes de Carrera y Semilleros de Talento';
        description = `La favorabilidad de ${dim.favorability}% en ${dim.name} muestra que los colaboradores desean claridad sobre sus trayectorias profesionales de largo plazo dentro de la compañía.`;
        actionSteps = [
          'Publicar de forma transparente las vacantes internas antes de realizar reclutamiento externo.',
          'Establecer programas de mentoría interna con directivos y profesionales senior.',
          'Ofrecer becas parciales de capacitación o convenios académicos prioritarios.'
        ];
        responsible = 'Desarrollo Organizacional';
        break;
      case 'ambiente':
        title = 'Optimización Ergonómica e Integración Vida-Trabajo';
        description = `La dimensión de ${dim.name} (Promedio: ${dim.average}/5) denota oportunidades para re-equilibrar cargas operativas de trabajo y adecuar recursos tecnológicos.`;
        actionSteps = [
          'Efectuar una auditoría de ergonomía postural y estado de herramientas físicas/tecnológicas.',
          'Establecer la política de "Desconexión Laboral" después del horario oficial de trabajo.',
          'Diseñar horarios escalonados o días híbridos para disminuir el tiempo de desplazamiento de los equipos.'
        ];
        responsible = 'COPASST / Seguridad y Salud';
        break;
      default:
        title = `Fortalecimiento de la Dimensión ${dim.name}`;
        description = `Intervención estratégica diseñada para movilizar positivamente los indicadores de la dimensión ${dim.name} (favorabilidad actual de ${dim.favorability}%).`;
        actionSteps = [
          'Desarrollar mesas de trabajo conjuntas para identificar las causas del puntaje de clima.',
          'Definir un plan de seguimiento bimensual con los líderes de área.',
          'Establecer KPIs específicos vinculados a la experiencia del trabajador.'
        ];
        responsible = 'Director de Gestión Humana';
    }

    return {
      id: `clima-rec-${index + 1}`,
      dimensionId: dim.dimensionId,
      dimensionName: dim.name,
      title,
      description,
      priority,
      actionSteps,
      status: 'Planificada',
      responsible
    };
  });

  return res.json({ recommendations: localRecommendations, source: 'local-preset' });
});

// ==========================================
// ENDPOINTS DE RIESGO PSICOSOCIAL
// ==========================================

app.post('/api/psicosocial/analyze', async (req: Request, res: Response) => {
  const { psicosocialData } = req.body;
  if (!psicosocialData) {
    return res.status(400).json({ error: 'Falta la información de riesgo psicosocial.' });
  }

  const client = getGeminiClient();
  const total = psicosocialData.totalParticipants || 0;
  const globalScore = psicosocialData.globalScore || 0;
  const globalRiskLevel = psicosocialData.globalRiskLevel || 'Medio';
  const batteryType = psicosocialData.batteryType || 'Resultados Consolidados';
  const dimensions = psicosocialData.dimensions || [];
  const rankings = psicosocialData.rankings || { areas: [], sedes: [], proyectos: [], cargos: [] };

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analiza los siguientes resultados de la Batería de Riesgo Psicosocial aplicada en una organización y genera un informe de análisis estratégico de IA en formato JSON estructurado.

Información general:
- Total colaboradores evaluados: ${total}
- Puntaje de riesgo global (0-100): ${globalScore} (Nivel de Riesgo General: ${globalRiskLevel})
- Tipo de batería analizada: ${batteryType}

Resultados de las 16 dimensiones psicosociales (Puntajes de 0 a 100, donde puntajes más altos indican mayor nivel de riesgo):
${dimensions.map((d: any) => `- ID: ${d.dimensionId}, Dimensión: ${d.name}, Categoría: ${d.category}, Puntaje: ${d.score}, Nivel de Riesgo: ${d.riskLevel}`).join('\n')}

Rankings de riesgo por segmentos (los segmentos se muestran ordenados de mayor a menor riesgo):
- Por Áreas: ${rankings.areas.map((r: any) => `${r.name} (Puntaje: ${r.score}, Riesgo: ${r.riskLevel})`).join(', ')}
- Por Sedes: ${rankings.sedes.map((r: any) => `${r.name} (Puntaje: ${r.score}, Riesgo: ${r.riskLevel})`).join(', ')}
- Por Proyectos: ${rankings.proyectos.map((r: any) => `${r.name} (Puntaje: ${r.score}, Riesgo: ${r.riskLevel})`).join(', ')}
- Por Cargos: ${rankings.cargos.map((r: any) => `${r.name} (Puntaje: ${r.score}, Riesgo: ${r.riskLevel})`).join(', ')}

El formato de respuesta DEBE SER EXCLUSIVAMENTE un bloque de código JSON válido que corresponda a un objeto con la siguiente estructura exacta (sin textos explicativos adicionales o formato de markdown excepto las llaves JSON):
{
  "executiveSummary": "Resumen ejecutivo formal y directivo de los resultados generales de riesgo psicosocial en la empresa.",
  "riskInterpretation": "Interpretación técnica detallada de la distribución del riesgo en base a los datos analizados.",
  "protectiveFactors": ["Factor protector 1 con justificación técnica", "Factor protector 2 con justificación técnica"],
  "criticalFactors": ["Factor crítico 1 con justificación técnica", "Factor crítico 2 con justificación técnica"],
  "priorityFactors": ["Factor prioritario de intervención inmediata 1", "Factor prioritario 2"],
  "alerts": [
    {
      "id": "alert-1",
      "type": "area",
      "title": "Área de Alto Riesgo Psicosocial Detectada",
      "description": "Explicación detallada de la alerta incluyendo los datos del segmento.",
      "severity": "Alta",
      "target": "Nombre del segmento o factor afectado"
    }
  ],
  "findings": ["Hallazgo relevante 1 analizado en los datos", "Hallazgo relevante 2"],
  "conclusions": ["Conclusión del diagnóstico 1", "Conclusión del diagnóstico 2"],
  "recommendations": ["Recomendación técnica orientada a la mitigación 1", "Recomendación 2"],
  "plan": [
    {
      "id": "item-1",
      "factor": "Factor de riesgo abordado",
      "objective": "Objetivo de la intervención",
      "activity": "Actividad específica a desarrollar",
      "responsible": "Cargo o departamento responsable",
      "date": "Plazo estimado (ej: Q3 2026, Octubre 2026)",
      "indicator": "Indicador de éxito de la actividad",
      "cost": 1500000,
      "priority": "Alta",
      "status": "Planificada"
    }
  ]
}

Genera exactamente de 3 a 5 alertas reales basadas en los datos críticos, de 3 a 5 hallazgos, y al menos 4 acciones para el plan de intervención basadas en las dimensiones con mayores puntajes de riesgo. Devuelve únicamente el JSON válido:`,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        },
      });

      try {
        const text = response.text || '{}';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanJson);
        return res.json({ analysis, source: 'gemini' });
      } catch (parseErr) {
        console.error('Error parseando JSON de Gemini para análisis psicosocial:', parseErr);
      }
    } catch (apiErr) {
      console.error('Error llamando a Gemini para análisis psicosocial:', apiErr);
    }
  }

  // --- FALLBACK HEURÍSTICO LOCAL DE RIESGO PSICOSOCIAL ---
  const sortedDims = [...dimensions].sort((a: any, b: any) => b.score - a.score);
  const criticalDims = sortedDims.slice(0, 3);
  const protectiveDims = sortedDims.slice(-3).reverse();

  const criticalDimNames = criticalDims.map((d: any) => d.name);
  const protectiveDimNames = protectiveDims.map((d: any) => d.name);

  const criticalAreas = rankings.areas.filter((a: any) => a.score >= 50).slice(0, 2);
  const criticalSedes = rankings.sedes.filter((s: any) => s.score >= 50).slice(0, 2);

  const localAlerts: any[] = [];
  criticalAreas.forEach((area: any, idx: number) => {
    localAlerts.push({
      id: `alert-area-${idx}`,
      type: 'area',
      title: `Área Crítica: ${area.name}`,
      description: `El departamento ${area.name} registra un nivel de riesgo psicosocial de ${area.score}/100 (${area.riskLevel}). Requiere priorización inmediata.`,
      severity: area.score >= 70 ? 'Alta' : 'Media',
      target: area.name
    });
  });

  criticalSedes.forEach((sede: any, idx: number) => {
    localAlerts.push({
      id: `alert-sede-${idx}`,
      type: 'sede',
      title: `Sede de Alerta: ${sede.name}`,
      description: `La sede ${sede.name} muestra un índice consolidado de vulnerabilidad psicosocial de ${sede.score}/100 (${sede.riskLevel}).`,
      severity: 'Media',
      target: sede.name
    });
  });

  const averageStress = dimensions.find((d: any) => d.dimensionId === 'estres')?.score || 45;
  if (averageStress >= 50) {
    localAlerts.push({
      id: 'alert-stress',
      type: 'stress',
      title: 'Incremento del Estrés General',
      description: `La sintomatología consolidada de estrés alcanza un promedio de ${averageStress}/100. Se deben activar actividades preventivas de salud mental.`,
      severity: 'Alta',
      target: 'Sintomatología de Estrés'
    });
  }

  const demandsScore = dimensions.find((d: any) => d.dimensionId === 'demandas_trabajo')?.score || 50;
  if (demandsScore >= 55) {
    localAlerts.push({
      id: 'alert-workload',
      type: 'workload',
      title: 'Sobrecarga laboral detectada',
      description: `La dimensión 'Demandas del Trabajo' presenta un nivel de riesgo de ${demandsScore}/100. Se requiere revisar distribución de tareas.`,
      severity: 'Alta',
      target: 'Demandas del Trabajo'
    });
  }

  const localPlan: any[] = criticalDims.map((dim: any, idx: number) => {
    let objective = '';
    let activity = '';
    let indicator = '';
    let cost = 1200000;

    switch (dim.dimensionId) {
      case 'liderazgo':
        objective = 'Capacitar a los líderes de área en comunicación asertiva y liderazgo empático.';
        activity = 'Taller formativo quincenal: "Liderazgo Inspirador y Salud Laboral".';
        indicator = 'Porcentaje de jefes formados / Encuesta de feedback de liderazgo.';
        cost = 3500000;
        break;
      case 'control_trabajo':
        objective = 'Aumentar la autonomía y participación en la toma de decisiones operativas.';
        activity = 'Mesas de co-creación y círculos de calidad para mejoras en procesos del área.';
        indicator = 'Proyectos de mejora implementados / Índice de participación.';
        cost = 800000;
        break;
      case 'demandas_trabajo':
        objective = 'Regularizar los tiempos y volumen de trabajo para disminuir la sobrecarga.';
        activity = 'Estudio de cargas laborales y rediseño de flujos de trabajo en áreas críticas.';
        indicator = 'Horas extra registradas / Tasa de cumplimiento de metas.';
        cost = 4500000;
        break;
      case 'recompensas':
        objective = 'Mejorar el reconocimiento del desempeño e incentivos no monetarios.';
        activity = 'Lanzamiento del programa de salario emocional y reconocimiento al esfuerzo.';
        indicator = 'Índice de retención / Puntaje de favorabilidad en recompensas.';
        cost = 2000000;
        break;
      case 'jornada':
        objective = 'Establecer lineamientos claros de desconexión laboral y balance vida-trabajo.';
        activity = 'Políticas y capacitación en optimización de reuniones y desconexión digital.';
        indicator = 'Horario promedio de salida / Encuesta de satisfacción de jornada.';
        cost = 500000;
        break;
      default:
        objective = `Mitigar los factores desencadenantes del riesgo en la dimensión ${dim.name}.`;
        activity = `Campañas de sensibilización y talleres prácticos enfocados en ${dim.name}.`;
        indicator = `Puntaje promedio en próximas evaluaciones para ${dim.name}.`;
        cost = 1000000;
    }

    return {
      id: `plan-item-${idx + 1}`,
      factor: dim.name,
      objective,
      activity,
      responsible: 'Gestión Humana / Seguridad y Salud en el Trabajo',
      date: 'Plazo Q4 2026',
      indicator,
      cost,
      priority: dim.score >= 60 ? 'Alta' : 'Media',
      status: 'Planificada'
    };
  });

  const localAnalysis = {
    executiveSummary: `A partir del análisis de la Batería aplicada a ${total} colaboradores, la organización registra un Puntaje de Riesgo Global de ${globalScore}/100, clasificándose bajo un nivel de riesgo consolidado '${globalRiskLevel}'. Se observa una distribución asimétrica del riesgo con concentración importante en áreas operativas y técnicas, por lo que es indispensable implementar el plan de intervención priorizando los factores de demandas y relaciones en el trabajo.`,
    riskInterpretation: `El diagnóstico muestra que el ${psicosocialData.distribution?.muyAlto || 0} de los colaboradores se encuentra en nivel de Riesgo Muy Alto, y un ${psicosocialData.distribution?.alto || 0} en Riesgo Alto. Los segmentos con mayor vulnerabilidad corresponden al cargo de '${rankings.cargos[0]?.name || 'Operativo'}' en la sede '${rankings.sedes[0]?.name || 'N/D'}'. Se recomienda intervenir focalizadamente los procesos que presentan mayor carga mental y volumen cuantitativo de metas.`,
    protectiveFactors: protectiveDimNames.map(name => `Bajo riesgo percibido en '${name}', lo que constituye un excelente soporte organizacional y actúa como factor de amortiguación frente al estrés.`),
    criticalFactors: criticalDimNames.map(name => `Alto riesgo identificado en la dimensión '${name}' con un puntaje de riesgo consolidado elevado que exige rediseño preventivo.`),
    priorityFactors: criticalDimNames.slice(0, 2).map(name => `Intervenir de forma inmediata el factor de riesgo '${name}' para detener el desgaste laboral.`),
    alerts: localAlerts,
    findings: [
      `La dimensión de mayor impacto negativo es '${criticalDims[0]?.name || 'N/D'}' registrando un nivel de riesgo de ${criticalDims[0]?.score || 0}/100.`,
      `El área con el mayor índice acumulado de riesgo psicosocial es '${rankings.areas[0]?.name || 'N/D'}' (${rankings.areas[0]?.score || 0}/100).`,
      `Se detecta una correlación directa entre las demandas de trabajo y la presencia de sintomatología de estrés en los equipos técnicos.`
    ],
    conclusions: [
      `El nivel general de riesgo psicosocial '${globalRiskLevel}' requiere reportes preventivos al COPASST y gerencia general.`,
      `Los factores extralaborales (familiares, económicos) actúan como co-variables de presión sobre el desempeño cotidiano del personal.`,
      `Es indispensable fortalecer el estilo de liderazgo y las recompensas no salariales en los segmentos operativos.`
    ],
    recommendations: [
      `Desplegar un programa estructurado de salud mental y manejo del estrés liderado por psicología especializada.`,
      `Realizar mesas de trabajo conjuntas con los jefes de las áreas críticas para rediseñar las metas y jornadas.`,
      `Implementar un canal formal de reconocimientos que visibilice el esfuerzo y los logros individuales.`
    ],
    plan: localPlan
  };

  return res.json({ analysis: localAnalysis, source: 'local-preset' });
});

app.post('/api/psicosocial/chat', async (req: Request, res: Response) => {
  const { prompt, psicosocialData } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Falta el prompt en el cuerpo de la solicitud.' });
  }

  const cleanPrompt = prompt.trim();
  const total = psicosocialData?.totalParticipants || 0;
  const globalScore = psicosocialData?.globalScore || 0;
  const globalRiskLevel = psicosocialData?.globalRiskLevel || 'Bajo';
  const dimensions = psicosocialData?.dimensions || [];

  const topCriticalDims = [...dimensions]
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 3);

  const criticalDimText = topCriticalDims.map((d: any) => `- ${d.name}: Puntaje de Riesgo ${d.score}/100 (Riesgo: ${d.riskLevel})`).join('\n');

  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Eres 'Happy Psicosocial IA', un consultor experto y psicólogo analista de Riesgo Psicosocial, SST y Salud Ocupacional.
        
Tu rol es analizar con rigor técnico los resultados de la Batería de Riesgo Psicosocial y responder la consulta del usuario utilizando estrictamente los datos consolidados. Usa un lenguaje profesional de psicología organizacional y del trabajo.

Aquí tienes los datos reales y consolidados de la organización:
- Total de Participantes: ${total} colaboradores
- Puntaje General de Riesgo: ${globalScore} / 100
- Nivel de Riesgo Consolidado: ${globalRiskLevel}
- Factores de Mayor Riesgo Detectados:
${criticalDimText || 'Ninguno (Sin datos)'}

Todas las dimensiones evaluadas:
${dimensions.map((d: any) => `- ${d.name}: Puntaje ${d.score}/100, Nivel: ${d.riskLevel}`).join('\n')}

Por favor, responde la consulta de manera estructurada en Markdown, con un tono analítico, empático y orientado al bienestar y cumplimiento de normatividad de salud ocupacional. Basa tus análisis estrictamente en estos datos.

Consulta del usuario: "${cleanPrompt}"

Respuesta técnica, concreta, sin introducciones vacías. Ve directo al análisis solicitado:`,
        config: {
          temperature: 0.5,
        },
      });

      const replyText = response.text;
      return res.json({ text: replyText, source: 'gemini' });
    } catch (error: any) {
      console.error('Error llamando a Gemini API para Chat Psicosocial:', error);
    }
  }

  // --- FALLBACK HEURÍSTICO CHAT PSICOSOCIAL ---
  const cleanPromptLower = cleanPrompt.toLowerCase();
  let simulatedResponse = '';

  if (cleanPromptLower.includes('diagnostico') || cleanPromptLower.includes('diagnóstico') || cleanPromptLower.includes('hallazgos') || cleanPromptLower.includes('resultados')) {
    simulatedResponse = `### Diagnóstico de Riesgo Psicosocial 📊
    
A partir de las respuestas analizadas de **${total} colaboradores**, se consolida la siguiente ficha diagnóstica de riesgo psicosocial:

- **1. Riesgo Global:** Se registra un puntaje de riesgo de **${globalScore} sobre 100**, lo que cataloga a la empresa en un nivel consolidado de **'${globalRiskLevel}'**.
- **2. Puntos Críticos Prioritarios:** Los factores de riesgo que presentan mayor urgencia de intervención debido a sus altos niveles de vulnerabilidad son:
${criticalDimText || '- No hay dimensiones de riesgo evaluadas.'}
- **3. Recomendaciones:** Se sugiere desplegar un Plan de Intervención Psicosocial inmediato enfocado en mitigar las sobrecargas, fortalecer el liderazgo formativo y proveer soporte psicológico continuo.`;
  } else if (cleanPromptLower.includes('liderazgo') || cleanPromptLower.includes('jefe') || cleanPromptLower.includes('lideres')) {
    simulatedResponse = `### Análisis de Liderazgo y Relaciones Interpersonales 👥
    
El factor de Liderazgo es crucial en la Batería. Para los **${total} participantes**:

- **Impacto del Supervisor:** La relación jefe-colaborador actúa directamente como un modulador del nivel de estrés y el bienestar psicosocial.
- **Acción Sugerida:** Establecer un programa de formación en "Liderazgo Resonante" y capacitar en resolución asertiva de conflictos para amortiguar tensiones cotidianas y mejorar el soporte social percibido.`;
  } else if (cleanPromptLower.includes('plan') || cleanPromptLower.includes('intervención') || cleanPromptLower.includes('intervencion') || cleanPromptLower.includes('actividades')) {
    simulatedResponse = `### Propuesta de Plan de Intervención Psicosocial 📋
    
Para mitigar el nivel de riesgo global actual de **${globalScore}/100** (${globalRiskLevel}), se sugieren las siguientes acciones preventivas prioritarias:

1. **Estudio de Cargas y Rediseño de Tareas (Dimensión Demandas):**
   - *Objetivo:* Mitigar el desgaste mental cuantitativo.
   - *Acción:* Revisar la distribución de tareas y optimizar procesos de entrega con metas realistas.
2. **Capacitación en Habilidades Blandas (Dimensión Liderazgo):**
   - *Objetivo:* Mejorar el soporte del supervisor.
   - *Acción:* Talleres interactivos mensuales sobre retroalimentación constructiva y empatía.
3. **Programa de Salario Emocional (Dimensión Recompensas):**
   - *Objetivo:* Incrementar el sentido de pertenencia y compensación percibida.
   - *Acción:* Campaña formal de reconocimientos, flexibilidades de horario para diligencias personales y planes de bienestar.`;
  } else {
    simulatedResponse = `### Consulta Psicosocial IA - Resultados Consolidados 🧠
    
Para atender a tu consulta personalizada: **"${cleanPrompt}"** sobre una fuerza de trabajo de **${total} colaboradores**, se genera la siguiente respuesta técnica:

- **Métricas Consolidadas:** Riesgo general de **${globalScore}/100** clasificado como **${globalRiskLevel}**.
- **Dimensiones Más Críticas:**
${criticalDimText || '- No hay dimensiones críticas con alto riesgo.'}
- **Recomendación General:** Te sugerimos activar el comité COPASST para socializar estos resultados con los colaboradores, garantizando total confidencialidad, y estructurando grupos de enfoque para proponer soluciones colaborativas.`;
  }

  return res.json({ text: simulatedResponse, source: 'local-preset' });
});

// 5. Endpoint de Análisis Consolidado para el Centro de Inteligencia Organizacional (CIO)
app.post('/api/centro-inteligencia/analyze', async (req: Request, res: Response) => {
  const { demographics, climateData, psicosocialData } = req.body;

  const totalEmployees = demographics?.totalEmployees || 1240;
  const wellbeingIndex = demographics?.wellbeingIndex || 83.4;
  const absenteeismRate = demographics?.absenteeismRate || 2.3;
  const climateFav = climateData?.globalFavorability || 74;
  const psicosocialRisk = psicosocialData?.globalScore || 52;
  const psicosocialLevel = psicosocialData?.globalRiskLevel || 'Medio';

  const client = getGeminiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Analiza de forma cruzada e integral la salud organizacional de una empresa consolidando los datos de tres fuentes distintas: Caracterización Sociodemográfica, Clima Organizacional y Riesgo Psicosocial.
        
Métricas Clave consolidadas:
- Total de Colaboradores: ${totalEmployees}
- Índice de Bienestar General: ${wellbeingIndex}%
- Tasa de Ausentismo Médico: ${absenteeismRate}% mensual
- Favorabilidad de Clima Organizacional: ${climateFav}%
- Puntaje de Riesgo Psicosocial: ${psicosocialRisk}/100 (Nivel: ${psicosocialLevel})

Genera un reporte ejecutivo estructurado en formato JSON válido. No devuelvas ningún texto explicativo o de introducción, únicamente el bloque de código JSON que cumpla exactamente con el siguiente esquema:
{
  "executiveSummary": {
    "situation": "Texto descriptivo detallado sobre la situación actual integrada de la organización, cruzando el bienestar, el clima y los riesgos psicosociales.",
    "findings": [
      "Hallazgo 1: Correlación o impacto identificado cruzando datos sociodemográficos y clima (ej: impacto de la sobrecarga en el ausentismo).",
      "Hallazgo 2: Relación entre variables del entorno y los resultados de favorabilidad o de riesgo."
    ],
    "strengths": [
      "Fortaleza 1: Factor protector destacado o aspecto positivo generalizado.",
      "Fortaleza 2: Ventaja competitiva a nivel de cultura y clima."
    ],
    "risks": [
      "Riesgo de Salud u Operativo 1: Factor sistémico que compromete el bienestar del talento.",
      "Riesgo de Salud u Operativo 2: Amenaza latente identificada en clima o factores psicosociales."
    ],
    "opportunities": [
      "Oportunidad Estratégica 1: Área de mejora prioritaria que generará un retorno inmediato de bienestar.",
      "Oportunidad Estratégica 2: Recomendación táctica de integración de procesos."
    ],
    "conclusions": [
      "Conclusión integrada de la salud organizacional.",
      "Conclusión técnica de conformidad y estándares de clima/riesgo."
    ],
    "priorities": [
      "Acción de prioridad crítica 1 con responsable lógico.",
      "Acción de prioridad crítica 2 con impacto transversal."
    ]
  },
  "alerts": [
    {
      "id": "cio-alert-1",
      "sourceModule": "Riesgo Psicosocial",
      "title": "Título corto y directo de la alerta crítica",
      "description": "Explicación detallada de la desviación identificada con datos exactos.",
      "severity": "Critica" | "Alta" | "Media" | "Baja",
      "date": "Fecha actual (ej: Julio 2026)",
      "suggestedAction": "Acción específica inmediata para resolver la alerta."
    }
  ]
}

Genera exactamente 5 alertas basadas en riesgos de clima bajo, riesgo psicosocial alto o ausentismo elevado. Devuelve únicamente el JSON válido:`,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        },
      });

      try {
        const text = response.text || '{}';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(cleanJson);
        return res.json({ analysis, source: 'gemini' });
      } catch (parseErr) {
        console.error('Error parseando JSON de Gemini para CIO:', parseErr);
      }
    } catch (apiErr) {
      console.error('Error llamando a Gemini para CIO:', apiErr);
    }
  }

  // Fallback heurístico inteligente consolidado
  const lowestClimateDim = climateData?.dimensions?.sort((a: any, b: any) => a.favorability - b.favorability)[0]?.name || 'Comunicación Interna';
  const highestPsicoDim = psicosocialData?.dimensions?.sort((a: any, b: any) => b.score - a.score)[0]?.name || 'Demandas de Trabajo';

  const localAnalysis = {
    executiveSummary: {
      situation: `La organización cuenta con un contingente activo de ${totalEmployees} colaboradores, registrando un Índice de Bienestar General del ${wellbeingIndex}% y una favorabilidad de Clima Organizacional del ${climateFav}%. Sin embargo, el Puntaje General de Riesgo Psicosocial se ubica en un nivel ${psicosocialLevel} (${psicosocialRisk}/100). Esto revela que, aunque existe un apego favorable hacia la cultura interna, las presiones y cargas laborales (particularmente en ${highestPsicoDim}) están actuando como catalizadores de desgaste físico y mental, comprometiendo la sostenibilidad a largo plazo.`,
      findings: [
        `Brecha de Desgaste Silencioso: Mientras la favorabilidad climática se encuentra en un aceptable ${climateFav}%, el riesgo psicosocial en '${highestPsicoDim}' es el factor de mayor tensión ocupacional, impactando la percepción del bienestar.`,
        `Presión de Ausentismo: Se identifica que la tasa de ausentismo médico del ${absenteeismRate}% mensual está estrechamente correlacionada con los picos de sobrecarga de trabajo y dolencias biomecánicas.`,
        `Sensibilidad en Liderazgo: Se denota que una baja favorabilidad en '${lowestClimateDim}' repercute de forma directa en los puntajes de riesgo intralaboral.`
      ],
      strengths: [
        `Sólida Cohesión Institucional: El índice de bienestar corporativo del ${wellbeingIndex}% refleja una cultura receptiva, participativa y con un alto sentido de pertenencia.`,
        `Bajo riesgo relativo en factores de recompensa y estabilidad de contrato, aportando seguridad socioeconómica.`
      ],
      risks: [
        `Desgaste Mental Crónico: Las demandas cuantitativas del trabajo y la complejidad de las tareas amenazan con incrementar el agotamiento o síndrome de Burnout.`,
        `Incremento potencial de incapacidades de origen común motivadas por dolencias osteomusculares asociadas al estrés continuo.`
      ],
      opportunities: [
        `Consolidación de Programas: Articular los planes de bienestar con los hallazgos de SST para lanzar campañas integradas de salud mental y hábitos cardiovasculares de alto impacto.`,
        `Optimización de Métodos de Trabajo: Rediseñar flujos de trabajo e introducir metodologías ágiles en áreas con elevados índices de ausentismo.`
      ],
      conclusions: [
        `La salud organizacional general se encuentra en estado 'Estable con Áreas de Alerta', donde el principal reto radica en la equilibración de cargas laborales y comunicación jerárquica.`,
        `El cumplimiento normativo del SG-SST se fortalece integrando el análisis demográfico y psicosocial bajo un único centro estratégico de control.`
      ],
      priorities: [
        `Desplegar inspecciones ergonómicas y programas de pausas activas preventivas para mitigar dolencias biomecánicas.`,
        `Iniciar capacitaciones en Liderazgo Resonante y estilos de comunicación abierta dirigidas a supervisores y jefes de área.`
      ]
    },
    alerts: [
      {
        id: 'cio-alert-1',
        sourceModule: 'Riesgo Psicosocial',
        title: `Riesgo Psicosocial Crítico en '${highestPsicoDim}'`,
        description: `El factor de riesgo '${highestPsicoDim}' registra un puntaje de tensión acumulado que supera el umbral tolerable, representando un factor de fatiga constante para los equipos.`,
        severity: psicosocialRisk >= 60 ? 'Critica' : 'Alta',
        date: 'Julio 2026',
        suggestedAction: 'Efectuar un estudio técnico de cargas laborales y optimizar plazos de entrega de entregables.'
      },
      {
        id: 'cio-alert-2',
        sourceModule: 'Clima Organizacional',
        title: `Debilidad de Favorabilidad en '${lowestClimateDim}'`,
        description: `La dimensión de Clima '${lowestClimateDim}' registra el puntaje más bajo de favorabilidad en el último pulso, denotando desalineación de expectativas.`,
        severity: climateFav <= 65 ? 'Critica' : 'Alta',
        date: 'Julio 2026',
        suggestedAction: 'Habilitar mesas de co-creación y círculos de retroalimentación directos liderados por RRHH.'
      },
      {
        id: 'cio-alert-3',
        sourceModule: 'Ausentismo',
        title: 'Tasa de Ausentismo Superior al Objetivo Corporativo',
        description: `Se reporta una pérdida constante de días programados equivalente a una tasa del ${absenteeismRate}%, impulsada por incapacidades comunes.`,
        severity: 'Media',
        date: 'Julio 2026',
        suggestedAction: 'Implementar el programa SVE de vigilancia biomecánica y medicina preventiva.'
      },
      {
        id: 'cio-alert-4',
        sourceModule: 'Bienestar',
        title: 'Sedentarismo Generalizado Identificado',
        description: 'La caracterización sociodemográfica alerta que más de la mitad del personal reporta nula actividad física durante la semana.',
        severity: 'Media',
        date: 'Julio 2026',
        suggestedAction: 'Lanzar un desafío corporativo gamificado de pasos diarios con incentivos saludables.'
      },
      {
        id: 'cio-alert-5',
        sourceModule: 'Rotación',
        title: 'Tasa de Rotación en Período de Prueba',
        description: 'Se observa deserción de talento con baja antigüedad debido a desajustes en el período de inducción y claridad de funciones.',
        severity: 'Baja',
        date: 'Julio 2026',
        suggestedAction: 'Robustecer el programa de Onboarding digital y el plan padrino institucional.'
      }
    ]
  };

  return res.json({ analysis: localAnalysis, source: 'local-preset' });
});

// 6. Endpoint de Interpretación de Correlaciones con IA para el CIO
app.post('/api/correlations/interpret', async (req: Request, res: Response) => {
  const { varX, varY, r, r2, pValue, n, confidence } = req.body;

  if (!varX || !varY) {
    return res.status(400).json({ error: 'Falta información de las variables correlacionadas.' });
  }

  const client = getGeminiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Actúa como un Consultor Senior de Analítica de Talento, Estadística Organizacional y Seguridad y Salud en el Trabajo (SST).
He calculado la correlación de Pearson entre estas dos variables de mi organización:

Variable X: ${varX.name} (${varX.description}). Unidad: ${varX.unit}.
Variable Y: ${varY.name} (${varY.description}). Unidad: ${varY.unit}.

Resultados de la Correlación:
- Coeficiente de correlación de Pearson (r): ${r}
- Coeficiente de determinación (R²): ${r2}
- Valor p (p-value): ${pValue}
- Tamaño de muestra (n): ${n} colaboradores
- Nivel de Confianza Estadística: ${confidence}

Genera un informe analítico ultra-profesional estructurado en formato JSON válido. No devuelvas ningún texto introductorio, únicamente el bloque de código JSON con este esquema exacto:
{
  "interpretation": "Texto que explique de forma técnica pero accesible la relación estadística encontrada. Detalla qué significa que r sea ${r} en términos del impacto de X sobre Y. Cruza esto con conceptos de recursos humanos y salud ocupacional.",
  "recommendation": "Acción corporativa, preventiva o correctiva prioritaria basada en este hallazgo para el área de Talento Humano y SST. Debe incluir una propuesta táctica clara, con posibles indicadores de seguimiento."
}

Devuelve exclusivamente el JSON válido:`,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      });

      try {
        const text = response.text || '{}';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const interpretationData = JSON.parse(cleanJson);
        return res.json({ 
          interpretation: interpretationData.interpretation,
          recommendation: interpretationData.recommendation,
          source: 'gemini'
        });
      } catch (parseErr) {
        console.error('Error parseando respuesta de Gemini para interpretación de correlaciones:', parseErr);
      }
    } catch (apiErr) {
      console.error('Error de API de Gemini para interpretación de correlaciones:', apiErr);
    }
  }

  // Fallback local heurístico si Gemini no está configurado o falla
  return res.json({
    interpretation: null, // El cliente usará su propia interpretación local heurística avanzada
    recommendation: null,
    source: 'local-preset'
  });
});

// 7. Endpoint de Interpretación de Radar Ejecutivo con IA para el CIO
app.post('/api/radar/interpret', async (req: Request, res: Response) => {
  const { theme } = req.body;

  if (!theme) {
    return res.status(400).json({ error: 'Falta información de la temática del radar.' });
  }

  const client = getGeminiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Actúa como un Consultor Organizacional de Nivel Ejecutivo y Experto en Seguridad, Salud en el Trabajo (SST) y Clima Laboral.
Analiza la siguiente temática del Radar Ejecutivo para nuestra organización:

Temática: ${theme.name} (${theme.category})
Descripción: ${theme.description}

Indicadores Clave de esta Temática (escala 0-100%):
- Nivel de desempeño actual: ${theme.nivel}%
- Impacto Organizacional Estimado: ${theme.impacto}%
- Urgencia de Intervención: ${theme.urgencia}%
- Esfuerzo de Implementación: ${theme.esfuerzo}%
- Prioridad Calculada: ${theme.prioridad}% (calculada cruzando Urgencia, Impacto y Facilidad de Ejecución)

Genera un informe analítico ejecutivo ultra-profesional estructurado en formato JSON válido. No devuelvas ningún texto introductorio o Markdown adicional, únicamente el bloque de código JSON con este esquema exacto:
{
  "interpretation": "Explicación ejecutiva de los factores que impulsan la prioridad de ${theme.prioridad}% para la temática ${theme.name}. Analiza de manera cuantitativa y cualitativa qué significan estos indicadores en el día a día operativo y los riesgos asociados si no se interviene.",
  "recommendation": "Acción corporativa concreta con un plan táctico viable, especificando un indicador de éxito (KPI) sugerido y un período estimado de implementación (ej. Corto o Mediano plazo) para el CIO y la dirección general."
}

Devuelve exclusivamente el JSON válido:`,
        config: {
          temperature: 0.3,
          responseMimeType: 'application/json'
        }
      });

      try {
        const text = response.text || '{}';
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const interpretationData = JSON.parse(cleanJson);
        return res.json({ 
          interpretation: interpretationData.interpretation,
          recommendation: interpretationData.recommendation,
          source: 'gemini'
        });
      } catch (parseErr) {
        console.error('Error parseando respuesta de Gemini para interpretación de radar:', parseErr);
      }
    } catch (apiErr) {
      console.error('Error de API de Gemini para interpretación de radar:', apiErr);
    }
  }

  // Fallback local heurístico
  return res.json({
    interpretation: null,
    recommendation: null,
    source: 'local-preset'
  });
});

// Inicialización de la aplicación según el entorno
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Importar dinámicamente Vite para desarrollo
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Servir estáticos en producción
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HAPPY INSIGHT IA] Servidor corriendo en http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error iniciando el servidor:', err);
});
