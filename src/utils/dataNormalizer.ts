/**
 * Motor Inteligente de Normalización de Datos
 * normaliza automáticamente los valores provenientes del Excel, ignorando mayúsculas, tildes y espacios.
 */

/**
 * Normaliza y limpia una cadena de texto para facilitar comparaciones uniformes:
 * 1. Convierte a minúsculas.
 * 2. Elimina acentos/tildes usando descomposición NFD.
 * 3. Elimina TODOS los espacios para máxima tolerancia ante variaciones de espaciado.
 */
export function cleanString(text: any): string {
  if (text === null || text === undefined) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // eliminar tildes/acentos
    .replace(/\s+/g, "") // eliminar todos los espacios
    .trim();
}

/**
 * Normaliza el género a los valores estándar ("Mujer" o "Hombre").
 */
export function normalizeGender(value: any): string {
  const cleaned = cleanString(value);
  if (!cleaned) return '';
  
  if (cleaned === 'f' || cleaned.includes('female') || cleaned.includes('mujer') || cleaned.includes('femenino')) {
    return 'Mujer';
  }
  if (cleaned === 'm' || cleaned.includes('male') || cleaned.includes('hombre') || cleaned.includes('masculino')) {
    return 'Hombre';
  }
  return value?.toString().trim() || '';
}

/**
 * Normaliza cualquier respuesta de texto a una clasificación booleana semántica ('SI' | 'NO' | 'UNKNOWN').
 * Diseñada para un motor inteligente de parsing SG-SST capaz de interpretar variaciones del lenguaje natural
 * en encuestas sociodemográficas (e.g. "Sí, de vez en cuando", "Sí, varias veces a la semana", "No practico", "No, pero me gustaría").
 *
 * Reutilizable para:
 * - Actividad física
 * - Consumo de alcohol
 * - Tabaquismo
 * - Participación en actividades
 * - Mascotas
 * - Cualquier pregunta SI/NO del sistema
 *
 * @param value Valor bruto obtenido de la celda de Excel o formulario.
 * @returns 'SI' | 'NO' | 'UNKNOWN'
 */
export function normalizeBooleanAnswer(value: any): 'SI' | 'NO' | 'UNKNOWN' {
  if (value === null || value === undefined) return 'UNKNOWN';

  const str = value.toString().trim();
  if (!str) return 'UNKNOWN';

  // Normalización: pasar a minúsculas y descomponer NFD para ignorar tildes/acentos
  const cleaned = str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

  if (!cleaned) return 'UNKNOWN';

  // 1. Patrones Afirmativos ("SI")
  // Coincidencias exactas, prefijos semánticos afirmativos o palabras clave afirmativas
  const isYes =
    cleaned === '1' ||
    cleaned === 'x' ||
    cleaned === 's' ||
    cleaned === 'true' ||
    cleaned === 'yes' ||
    cleaned === 'si' ||
    cleaned === 'sip' ||
    /^(si|yes)\b/.test(cleaned) ||
    cleaned.startsWith('si,') ||
    cleaned.startsWith('si.') ||
    cleaned.startsWith('si ') ||
    cleaned.startsWith('si_') ||
    cleaned.startsWith('si-') ||
    cleaned.startsWith('practico') ||
    cleaned.startsWith('realizo') ||
    cleaned.startsWith('tengo') ||
    cleaned.includes('si practico') ||
    cleaned.includes('si realizo');

  // 2. Patrones Negativos ("NO")
  // Coincidencias exactas, prefijos semánticos negativos o palabras clave negativas
  const isNo =
    cleaned === '0' ||
    cleaned === 'n' ||
    cleaned === 'false' ||
    cleaned === 'no' ||
    /^(no)\b/.test(cleaned) ||
    cleaned.startsWith('no,') ||
    cleaned.startsWith('no.') ||
    cleaned.startsWith('no ') ||
    cleaned.startsWith('no_') ||
    cleaned.startsWith('no-') ||
    cleaned.startsWith('no practico') ||
    cleaned.startsWith('no realiza') ||
    cleaned.startsWith('no tengo') ||
    cleaned.startsWith('ningun');

  // Resolución de precedencia en caso de coincidencia
  if (isYes && !isNo) return 'SI';
  if (isNo && !isYes) return 'NO';
  if (isYes && isNo) {
    if (/^no\b/.test(cleaned) || cleaned.startsWith('no')) return 'NO';
    if (/^si\b/.test(cleaned) || cleaned.startsWith('si')) return 'SI';
  }

  return 'UNKNOWN';
}

/**
 * Normaliza valores booleanos o respuestas tipo Sí/No.
 */
export function normalizeBoolean(value: any): string {
  const norm = normalizeBooleanAnswer(value);
  return norm === 'SI' ? 'Sí' : 'No';
}

/**
 * Normaliza el estado civil a valores uniformes.
 */
export function normalizeMaritalStatus(value: any): string {
  const cleaned = cleanString(value);
  if (!cleaned) return '';
  
  if (cleaned.startsWith('sol')) {
    return 'Soltero(a)';
  }
  if (cleaned.startsWith('cas')) {
    return 'Casado(a)';
  }
  if (cleaned.includes('union') || cleaned.includes('libre') || cleaned.includes('cohab')) {
    return 'Unión Libre';
  }
  if (cleaned.startsWith('div') || cleaned.startsWith('sep')) {
    return 'Divorciado(a) / Separado(a)';
  }
  if (cleaned.startsWith('viu')) {
    return 'Viudo(a)';
  }
  return value?.toString().trim() || '';
}

/**
 * Normaliza el nivel educativo o escolaridad.
 */
export function normalizeEducation(value: any): string {
  const cleaned = cleanString(value);
  if (!cleaned) return '';
  
  if (cleaned.startsWith('bach') || cleaned.includes('secun')) {
    return 'Bachiller';
  }
  if (cleaned.startsWith('tecnic')) {
    return 'Técnico';
  }
  if (cleaned.startsWith('tecnol')) {
    return 'Tecnólogo';
  }
  if (cleaned.startsWith('uni') || cleaned.includes('prof') || cleaned.includes('pregr')) {
    return 'Universitario';
  }
  if (cleaned.startsWith('post') || cleaned.startsWith('pos') || cleaned.includes('esp') || cleaned.includes('maes') || cleaned.includes('doc')) {
    return 'Postgrado / Especialista';
  }
  return value?.toString().trim() || '';
}

/**
 * Normaliza el tipo de vivienda.
 */
export function normalizeHousing(value: any): string {
  const cleaned = cleanString(value);
  if (!cleaned) return '';
  
  if (cleaned.includes('prop') || cleaned.includes('own')) {
    return 'Propia';
  }
  if (cleaned.includes('fam') || cleaned.includes('padre') || cleaned.includes('relat') || cleaned.includes('compart')) {
    return 'Familiar';
  }
  if (cleaned.includes('arren') || cleaned.includes('rent')) {
    return 'Arrendada';
  }
  return value?.toString().trim() || '';
}

/**
 * Normaliza el nivel de actividad física regular (soporta modo BOOLEAN y FREQUENCY).
 */
export function normalizePhysicalActivity(value: any, mode: 'BOOLEAN' | 'FREQUENCY' = 'FREQUENCY'): string {
  if (mode === 'BOOLEAN') {
    const norm = normalizeBooleanAnswer(value);
    if (norm === 'SI') return 'Sí';
    if (norm === 'NO') return 'No';
    return '';
  }

  // Modo FREQUENCY
  const cleaned = cleanString(value);
  if (!cleaned) return '';
  if (cleaned.includes('alta') || cleaned.includes('3') || cleaned.includes('4') || cleaned.includes('5') || cleaned.includes('diario') || cleaned.includes('frecuente') || cleaned.includes('3+')) {
    return 'Alta (3+ veces/sem)';
  }
  if (cleaned.includes('mod') || cleaned.includes('1') || cleaned.includes('2') || cleaned.includes('semanal') || cleaned.includes('aveces') || cleaned.includes('regular') || cleaned.includes('ocasional')) {
    return 'Moderada (1-2 veces/sem)';
  }
  if (cleaned.includes('ningun') || cleaned.includes('no') || cleaned.includes('cero') || cleaned === '0') {
    return 'Ninguna';
  }
  return value?.toString().trim() || '';
}

/**
 * Normaliza si tiene mascotas.
 */
export function normalizePets(value: any): string {
  const cleaned = cleanString(value);
  if (!cleaned) return '';
  
  if (cleaned === 'si' || cleaned === 'yes' || cleaned === 's' || cleaned.includes('perro') || cleaned.includes('gato') || cleaned.includes('tengo') || cleaned === 'true' || cleaned === '1') {
    return 'Sí';
  }
  if (cleaned === 'no' || cleaned === 'false' || cleaned === '0' || cleaned.includes('ningun')) {
    return 'No';
  }
  return value?.toString().trim() || '';
}

/**
 * Normaliza la pertenencia o grupo étnico.
 */
export function normalizeEthnicity(value: any): string {
  const cleaned = cleanString(value);
  if (!cleaned) return '';
  
  if (cleaned.includes('mestiz')) {
    return 'Mestizo';
  }
  if (cleaned.includes('afro') || cleaned.includes('negro') || cleaned.includes('mulat')) {
    return 'Afrodescendiente';
  }
  if (cleaned.includes('indig') || cleaned.includes('nativ')) {
    return 'Indígena';
  }
  if (cleaned.includes('blanc')) {
    return 'Blanco';
  }
  if (cleaned.includes('ningun') || cleaned.includes('noauto') || cleaned.includes('noidentifica')) {
    return 'Ninguno / No autoidentifica';
  }
  return value?.toString().trim() || '';
}

/**
 * Normaliza las respuestas sobre enfermedades o patologías.
 */
export function normalizeDisease(value: any): string {
  const cleaned = cleanString(value);
  if (!cleaned) return '';
  
  if (cleaned.includes('ningun') || cleaned.includes('sano') || cleaned.includes('sinpato') || cleaned.includes('nopato')) {
    return 'Ninguna / Sin patologías';
  }
  if (cleaned.includes('migran')) {
    return 'Migraña recurrente';
  }
  if (cleaned.includes('espasmo') || cleaned.includes('muscul')) {
    return 'Espasmos musculares';
  }
  return value?.toString().trim() || '';
}
