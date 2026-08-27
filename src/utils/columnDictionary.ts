export const COLUMN_DICTIONARY: { [key: string]: string[] } = {
  age: [
    "edad",
    "edad (años)",
    "años",
    "age"
  ],
  gender: [
    "sexo",
    "género",
    "genero",
    "sexo biológico"
  ],
  birthDate: [
    "fecha de nacimiento",
    "nacimiento"
  ],
  maritalStatus: [
    "estado civil"
  ],
  ethnicity: [
    "grupo étnico",
    "grupo etnico",
    "etnia",
    "pertenencia étnica",
    "¿a que grupo étnico pertenece?"
  ],
  education: [
    "nivel de escolaridad",
    "escolaridad",
    "educación",
    "nivel educativo",
    "último título obtenido",
    "indique por favor el ultimo titulo obtenido"
  ],
  city: [
    "ciudad",
    "ciudad en la cual labora",
    "municipio"
  ],
  housing: [
    "tipo de vivienda",
    "vivienda"
  ],
  stratum: [
    "estrato",
    "nivel socioeconómico",
    "nivel socioeconomico"
  ],
  project: [
    "proyecto"
  ],
  workSite: [
    "sitio de trabajo",
    "sede",
    "centro de trabajo"
  ],
  companySeniority: [
    "antigüedad en la empresa",
    "antiguedad en la empresa",
    "tiempo en la empresa"
  ],
  roleSeniority: [
    "antigüedad en el cargo",
    "antiguedad en el cargo actual"
  ],
  children: [
    "¿cuántos hijos tienes?",
    "cantidad de hijos",
    "hijos"
  ],
  familyMembers: [
    "¿cuántas personas forman su núcleo familiar?",
    "núcleo familiar",
    "numero de personas en el hogar"
  ],
  freeTime: [
    "uso de tiempo libre"
  ],
  physicalActivity: [
    "¿practicas algún deporte o actividad física de manera regular?"
  ],
  sports: [
    "¿qué actividad física o deporte practicas?"
  ],
  pets: [
    "¿tienes alguna mascota?"
  ],
  petType: [
    "¿qué tipo(s) de mascota(s) tienes?"
  ],
  weight: [
    "peso",
    "peso en kg"
  ],
  height: [
    "estatura",
    "estatura en cm"
  ],
  waist: [
    "diámetro de cintura",
    "cintura",
    "diámetro de cintura en cm"
  ],
  allergies: [
    "¿sufre de alguna alergia?"
  ],
  medications: [
    "¿esta tomando algún medicamento actualmente?"
  ],
  disease: [
    "¿sufre de alguna enfermedad común o laboral?"
  ],
  bloodType: [
    "grupo sanguíneo",
    "grupo sanguineo",
    "tipo de sangre",
    "rh",
    "blood type"
  ]
};

/**
 * Normaliza una cadena de texto siguiendo las reglas del parser inteligente:
 * 1. Convierte a minúsculas y elimina espacios extras al inicio/final.
 * 2. Elimina acentos/tildes.
 * 3. Reemplaza múltiples espacios por un espacio simple (elimina espacios dobles).
 * 4. Elimina los signos de interrogación (¿ y ?).
 */
export function normalizeString(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // eliminar acentos
    .replace(/[¿?]/g, "") // eliminar signos de interrogación
    .replace(/\s+/g, " ") // colapsar múltiples espacios y espacios dobles
    .trim();
}

/**
 * Encuentra el índice de la columna en un arreglo de encabezados basándose en una clave del diccionario.
 * Realiza una comparación exacta tras aplicar normalización estricta sobre cada encabezado y los alias.
 * 
 * @param headers - Lista de cabeceras de la fila del Excel detectada.
 * @param key - Clave del diccionario (e.g., 'age', 'gender', etc.)
 * @returns El índice de la columna (número) o null si no se encuentra.
 */
export function findColumn(headers: any[], key: string): number | null {
  if (!headers || !Array.isArray(headers)) return null;

  const aliases = COLUMN_DICTIONARY[key];
  if (!aliases || !Array.isArray(aliases)) return null;

  // Normalizar todos los alias correspondientes a esta clave
  const normalizedAliases = aliases.map(alias => normalizeString(alias));

  for (let i = 0; i < headers.length; i++) {
    const headerVal = headers[i];
    if (headerVal === null || headerVal === undefined) continue;

    const normalizedHeader = normalizeString(headerVal.toString());
    if (!normalizedHeader) continue;

    // Comparación exacta contra los alias normalizados
    if (normalizedAliases.includes(normalizedHeader)) {
      return i;
    }
  }

  return null;
}
