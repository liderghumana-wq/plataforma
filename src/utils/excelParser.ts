import * as XLSX from 'xlsx';
import { 
  DemographicsData, 
  GenderStat, 
  AgeGroupStat, 
  EducationStat, 
  HousingStat, 
  CityStat, 
  MaritalStatusStat, 
  DepartmentWellbeing, 
  ChildrenStat, 
  ContractStat,
  DataQualityReport,
  DataQualityIssue
 } from '../types';
import { findColumn as findColumnSmart } from './columnDictionary';
import {
  normalizeGender,
  normalizeEducation,
  normalizeMaritalStatus,
  normalizeHousing,
  normalizePhysicalActivity,
  normalizePets,
  normalizeEthnicity,
  normalizeDisease,
  normalizeBoolean,
  normalizeBooleanAnswer
} from './dataNormalizer';

export { normalizeBooleanAnswer };

interface ParseResult {
  success: boolean;
  data?: DemographicsData;
  missingColumns?: string[];
  error?: string;
}

// Helper to validate if a cell value matches any of the aliases of a dictionary key
function matchesKey(cellValue: any, dictKey: string): boolean {
  if (cellValue === null || cellValue === undefined) return false;
  return findColumnSmart([cellValue], dictKey) !== null;
}

// Helper to parse Excel dates (serials or strings) safely and uniformly
function parseExcelDate(val: any): Date | null {
  if (val instanceof Date) return val;
  if (typeof val === 'number') {
    // Excel dates are stored as number of days since 1900-01-01.
    // 25569 is the number of days between 1900-01-01 and 1970-01-01.
    const dateNum = Math.floor(val);
    const days = dateNum - (dateNum >= 60 ? 25569 : 25568);
    return new Date(days * 86400 * 1000);
  }
  if (typeof val === 'string' && val.trim() !== '') {
    const cleanStr = val.trim();
    
    // Try format DD/MM/YYYY or DD-MM-YYYY
    const dmy = cleanStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmy) {
      const day = parseInt(dmy[1], 10);
      const month = parseInt(dmy[2], 10) - 1; // 0-indexed month
      const year = parseInt(dmy[3], 10);
      return new Date(year, month, day);
    }
    
    // Try format YYYY-MM-DD or YYYY/MM/DD
    const ymd = cleanStr.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    if (ymd) {
      const year = parseInt(ymd[1], 10);
      const month = parseInt(ymd[2], 10) - 1;
      const day = parseInt(ymd[3], 10);
      return new Date(year, month, day);
    }

    // Try standard Date parsing
    const parsed = Date.parse(cleanStr);
    if (!isNaN(parsed)) {
      return new Date(parsed);
    }
  }
  return null;
}

// Helper to calculate age using date of birth and the current date (consistent with local time)
function calculateAgeFromBirthDate(birthDateVal: any): number | null {
  const birthDate = parseExcelDate(birthDateVal);
  if (!birthDate || isNaN(birthDate.getTime())) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

const smartMappings = [
  { dictKey: 'age', parserKey: 'edad', label: 'Edad' },
  { dictKey: 'gender', parserKey: 'sexo', label: 'Genero' },
  { dictKey: 'maritalStatus', parserKey: 'estadoCivil', label: 'Estado Civil' },
  { dictKey: 'ethnicity', parserKey: 'grupoEtnico', label: '¿A que grupo étnico pertenece?' },
  { dictKey: 'familyMembers', parserKey: 'integrantesHogar', label: '¿Cuántas personas forman su núcleo familiar?' },
  { dictKey: 'children', parserKey: 'hijos', label: '¿Cuántos hijos tienes?' },
  { dictKey: 'housing', parserKey: 'vivienda', label: 'Tipo de Vivienda' },
  { dictKey: 'stratum', parserKey: 'estrato', label: 'Nivel Socioeconómico' },
  { dictKey: 'city', parserKey: 'ciudad', label: 'Ciudad en la Cual Labora' },
  { dictKey: 'education', parserKey: 'nivelEducativo', label: 'Nivel de Escolaridad' },
  { dictKey: 'project', parserKey: 'proyecto', label: 'Proyecto' },
  { dictKey: 'workSite', parserKey: 'sitioTrabajo', label: 'Sitio de Trabajo' },
  { dictKey: 'companySeniority', parserKey: 'antiguedad', label: 'Antigüedad en la empresa' },
  { dictKey: 'roleSeniority', parserKey: 'antiguedadCargo', label: 'Antigüedad en el cargo actual' },
  { dictKey: 'freeTime', parserKey: 'tiempoLibre', label: 'Uso de Tiempo Libre' },
  { dictKey: 'physicalActivity', parserKey: 'actividadFisica', label: '¿Practicas algún deporte o actividad física de manera regular?' },
  { dictKey: 'weight', parserKey: 'peso', label: 'Peso en kg' },
  { dictKey: 'height', parserKey: 'estatura', label: 'Estatura en cm' },
  { dictKey: 'waist', parserKey: 'perimetroCintura', label: 'Diámetro de cintura en cm' },
  
  // Additional/Optional dictionary keys:
  { dictKey: 'birthDate', parserKey: 'fechaNacimiento', label: 'Fecha de Nacimiento' },
  { dictKey: 'sports', parserKey: 'deportes', label: 'Deporte' },
  { dictKey: 'pets', parserKey: 'mascotas', label: 'Mascotas' },
  { dictKey: 'petType', parserKey: 'tipoMascotas', label: 'Tipo de Mascotas' },
  { dictKey: 'allergies', parserKey: 'alergias', label: 'Alergias' },
  { dictKey: 'medications', parserKey: 'medicamentos', label: 'Medicamentos' },
  { dictKey: 'disease', parserKey: 'enfermedades', label: 'Enfermedades' },
  { dictKey: 'bloodType', parserKey: 'grupoSanguineo', label: 'Grupo Sanguíneo' },
  { dictKey: 'wellbeing', parserKey: 'bienestar', label: 'Bienestar' },
  { dictKey: 'stress', parserKey: 'estres', label: 'Estrés' },
  { dictKey: 'absenteeism', parserKey: 'ausentismo', label: 'Ausentismo' },
  { dictKey: 'participation', parserKey: 'participacion', label: 'Participación' }
];

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ success: false, error: 'No se pudieron leer los datos del archivo.' });
          return;
        }

        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert sheet to JSON array
        const rawRows = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
        if (rawRows.length < 2) {
          resolve({ success: false, error: 'El archivo está vacío o no contiene suficientes filas.' });
          return;
        }

        // Detect the header row by checking which row has the most matches with our mappings
        let headerRowIdx = 0;
        let maxMatches = -1;
        
        for (let r = 0; r < Math.min(15, rawRows.length); r++) {
          const row = rawRows[r];
          if (!Array.isArray(row)) continue;
          let matches = 0;
          smartMappings.forEach((mapping) => {
            const hasMatch = row.some((cell: any) => matchesKey(cell, mapping.dictKey));
            if (hasMatch) {
              matches++;
            }
          });
          if (matches > maxMatches) {
            maxMatches = matches;
            headerRowIdx = r;
          }
        }

        const headers: string[] = rawRows[headerRowIdx] as string[];
        const matchedIndices: { [key: string]: number } = {};
        const missingColumns: string[] = [];

        // Reemplazar la búsqueda manual de columnas por el uso del nuevo findColumn del diccionario inteligente
        smartMappings.forEach((mapping) => {
          const foundIdx = findColumnSmart(headers, mapping.dictKey);

          if (foundIdx !== null) {
            matchedIndices[mapping.parserKey] = foundIdx;
          } else {
            // Solo alertamos sobre las columnas requeridas que no se encontraron
            const isOptional = ['birthDate', 'sports', 'petType', 'pets', 'allergies', 'medications', 'disease'].includes(mapping.dictKey);
            if (!isOptional) {
              missingColumns.push(mapping.label);
            }
          }
        });

        console.log("Columna actividad física:", matchedIndices["actividadFisica"]);

        // Utilizar Proyecto como Área
        if (matchedIndices['proyecto'] !== undefined) {
          matchedIndices['area'] = matchedIndices['proyecto'];
          // Remove "Área" from missingColumns if it was added
          const areaLabelIdx = missingColumns.indexOf('Área');
          if (areaLabelIdx !== -1) {
            missingColumns.splice(areaLabelIdx, 1);
          }
        }

        // Parse actual rows (skipping header) - check if the row contains some non-empty elements
        const rows = rawRows.slice(headerRowIdx + 1).filter((r: any) => {
          if (!r || !Array.isArray(r) || r.length === 0) return false;
          return r.some((cell: any) => cell !== undefined && cell !== null && cell.toString().trim() !== '');
        });

        if (rows.length === 0) {
          resolve({ success: false, error: 'No se encontraron registros válidos para procesar.' });
          return;
        }

        // Initialize structures to track duplicates and log them for the Data Quality report
        const uniqueRows: { row: any; idx: number; excelRowNumber: number }[] = [];
        const seenRowsSet = new Set<string>();
        let duplicateRecordsCount = 0;
        const dataQualityDetails: DataQualityIssue[] = [];

        rows.forEach((row: any, idx: number) => {
          const excelRowNumber = headerRowIdx + idx + 2;
          const rowSerialized = row.map((cell: any) => cell === undefined || cell === null ? '' : cell.toString().trim()).join('|');
          if (rowSerialized !== '') {
            if (seenRowsSet.has(rowSerialized)) {
              duplicateRecordsCount++;
              dataQualityDetails.push({
                row: excelRowNumber,
                variable: 'Registro Completo',
                value: 'Fila duplicada',
                observation: 'Este registro tiene exactamente los mismos valores que otro registro anterior (registrado en Calidad de Datos).'
              });
            } else {
              seenRowsSet.add(rowSerialized);
            }
          }
          // Incluir el 100% de las filas cargadas en la población analizada por el Dashboard y PDF
          uniqueRows.push({ row, idx, excelRowNumber });
        });

        const totalEmployees = uniqueRows.length;

        if (totalEmployees === 0) {
          resolve({ success: false, error: 'No se encontraron registros únicos para procesar.' });
          return;
        }

        // Initialize accumulators
        let sumAge = 0;
        let countAge = 0;
        let sumSeniority = 0;
        let countSeniority = 0;
        let sumSeniorityRole = 0;
        let countSeniorityRole = 0;
        let countWithChildren = 0;
        let countDisability = 0;
        
        let sumWeight = 0;
        let countWeight = 0;
        let sumHeight = 0;
        let countHeight = 0;
        let sumIMC = 0;
        let countIMC = 0;
        const bmiValues: number[] = [];
        let sumWaist = 0;
        let countWaist = 0;
        let countHouseholdMembers = 0;

        const genderCounts: { [key: string]: number } = {};
        const ageGroupCounts = {
          '18-25 años': 0,
          '26-35 años': 0,
          '36-45 años': 0,
          '46-55 años': 0,
          '56 años o más': 0
        };

        const educationCounts: { [key: string]: number } = {};
        const maritalCounts: { [key: string]: number } = {};
        const stratumCounts: { [key: string]: number } = {};
        const ethnicCounts: { [key: string]: number } = {};
        const cityCounts: { [key: string]: number } = {};
        const deptCounts: { [key: string]: number } = {};
        const contractCounts: { [key: string]: number } = {};
        
        const projectCounts: { [key: string]: number } = {};
        const workSiteCounts: { [key: string]: number } = {};

        // Bienestar counts
        const freeTimeCounts: { [key: string]: number } = {};
        
        // Detección automática del modo de Actividad Física (BOOLEAN vs FREQUENCY)
        // Utilizando el Motor Inteligente de Normalización Semántica SG-SST
        let physicalActivityMode: 'BOOLEAN' | 'FREQUENCY' = 'FREQUENCY';

        if (matchedIndices['actividadFisica'] !== undefined) {
          const rawValues: string[] = [];
          for (let r = 1; r < rows.length; r++) {
            const row = rows[r];
            if (!row) continue;
            const rawVal = row[matchedIndices['actividadFisica']];
            if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
              const cleanVal = rawVal.toString().trim();
              if (cleanVal) {
                rawValues.push(cleanVal);
              }
            }
          }

          if (rawValues.length > 0) {
            let siCount = 0;
            let noCount = 0;
            let unknownCount = 0;

            for (const val of rawValues) {
              const norm = normalizeBooleanAnswer(val);
              if (norm === 'SI') {
                siCount++;
              } else if (norm === 'NO') {
                noCount++;
              } else {
                unknownCount++;
              }
            }

            const totalRespuestas = rawValues.length;
            const booleanRatio = totalRespuestas > 0 ? (siCount + noCount) / totalRespuestas : 0;

            // Regla Semántica SG-SST: Si el 80% o más de las respuestas se pueden clasificar
            // semánticamente como SI o NO, el modo asignado es 'BOOLEAN'. En caso contrario, 'FREQUENCY'.
            if (booleanRatio >= 0.8) {
              physicalActivityMode = 'BOOLEAN';
            } else {
              physicalActivityMode = 'FREQUENCY';
            }

            console.log("===== DETECCIÓN DE ACTIVIDAD FÍSICA (MOTOR SG-SST) =====");
            console.log(`Totales -> SI: ${siCount} | NO: ${noCount} | UNKNOWN: ${unknownCount}`);
            console.log(`Clasificación Booleana: ${(booleanRatio * 100).toFixed(1)}% (Umbral >= 80%)`);
            console.log(`Modo Final Asignado: ${physicalActivityMode}`);
          }
        }

        const physicalActivityCounts: { [key: string]: number } = physicalActivityMode === 'BOOLEAN'
          ? { 'Sí': 0, 'No': 0 }
          : {
              'Ninguna': 0,
              'Moderada (1-2 veces/sem)': 0,
              'Alta (3+ veces/sem)': 0
            };
        const companyActivitiesCounts: { [key: string]: number } = {
          'Alta': 0,
          'Frecuente': 0,
          'Ocasional': 0,
          'Nunca / Baja': 0
        };
        let countWithPets = 0;

        // Condiciones de salud
        const imcCounts = {
          'Bajo peso (< 18.5)': 0,
          'Normal (18.5 - 24.9)': 0,
          'Sobrepeso (25.0 - 29.9)': 0,
          'Obesidad I (30.0 - 34.9)': 0,
          'Obesidad II (35.0 - 39.9)': 0,
          'Obesidad III (>= 40.0)': 0
        };
        const allergyCounts: { [key: string]: number } = {};
        const medicationCounts: { [key: string]: number } = {};
        const diseaseCounts: { [key: string]: number } = {};
        const musculoskeletalCounts: { [key: string]: number } = {};
        const bloodTypeCounts: { [key: string]: number } = {};

        const housingCounts: { [key: string]: number } = {};
        let sumHouseholdMembers = 0;
        let countLivingAlone = 0;

        // Data quality module tracking
        let incompleteRecordsCount = 0;
        let normalizedVariablesCount = 0;
        let outOfRangeCount = 0;

        let negativeAgeCount = 0;
        let minorAgeCount = 0;
        let negativeSeniorityCount = 0;
        let seniorityExceedsAgeCount = 0;
        let roleExceedsCompanySeniorityCount = 0;
        let extremeWeightCount = 0;
        let extremeHeightCount = 0;

        const checkAndCountNormalization = (raw: any, norm: any) => {
          if (raw === undefined || raw === null) return;
          const rawStr = raw.toString().trim();
          const normStr = norm ? norm.toString().trim() : '';
          if (rawStr !== '' && rawStr.toLowerCase() !== normStr.toLowerCase()) {
            normalizedVariablesCount++;
          }
        };

        // Populate and parse (using pre-filtered uniqueRows)
        uniqueRows.forEach(({ row, idx, excelRowNumber }) => {
          // --- Data Quality Completeness Check ---
          let rowIsIncomplete = false;
          Object.entries(matchedIndices).forEach(([parserKey, colIdx]) => {
            const cellVal = row[colIdx];
            if (cellVal === undefined || cellVal === null || cellVal.toString().trim() === '') {
              rowIsIncomplete = true;
              const mapping = smartMappings.find(m => m.parserKey === parserKey);
              const label = mapping ? mapping.label : parserKey;
              dataQualityDetails.push({
                row: excelRowNumber,
                variable: label,
                value: 'Vacío',
                observation: 'Celda vacía en el archivo Excel.'
              });
            }
          });
          if (rowIsIncomplete) {
            incompleteRecordsCount++;
          }

          // --- 1. Edad ---
          let age: number | null = null;
          let computedFromBirthDate = false;

          if (matchedIndices['fechaNacimiento'] !== undefined && row[matchedIndices['fechaNacimiento']] !== undefined && row[matchedIndices['fechaNacimiento']] !== null && row[matchedIndices['fechaNacimiento']].toString().trim() !== '') {
            const calculatedAge = calculateAgeFromBirthDate(row[matchedIndices['fechaNacimiento']]);
            if (calculatedAge !== null && calculatedAge >= 15 && calculatedAge <= 100) {
              age = calculatedAge;
              computedFromBirthDate = true;
            }
          }

          if (!computedFromBirthDate) {
            const parsedAge = matchedIndices['edad'] !== undefined && row[matchedIndices['edad']] !== undefined && row[matchedIndices['edad']] !== null ? parseFloat(row[matchedIndices['edad']]) : NaN;
            age = !isNaN(parsedAge) && parsedAge > 0 ? parsedAge : null;
          }

          if (age !== null) {
            sumAge += age;
            countAge++;

            // Categorización de grupos de edad de forma continua y exhaustiva, sin superposiciones ni omisiones
            if (age <= 25) {
              ageGroupCounts['18-25 años']++;
            } else if (age >= 26 && age <= 35) {
              ageGroupCounts['26-35 años']++;
            } else if (age >= 36 && age <= 45) {
              ageGroupCounts['36-45 años']++;
            } else if (age >= 46 && age <= 55) {
              ageGroupCounts['46-55 años']++;
            } else {
              ageGroupCounts['56 años o más']++;
            }
          }

          // --- 2. Género ---
          const rawSex = matchedIndices['sexo'] !== undefined && row[matchedIndices['sexo']] !== undefined && row[matchedIndices['sexo']] !== null ? row[matchedIndices['sexo']].toString().trim() : '';
          let normalizedG = '';
          if (rawSex !== '') {
            normalizedG = normalizeGender(rawSex);
            genderCounts[normalizedG] = (genderCounts[normalizedG] || 0) + 1;
          }

          // --- 3. Estado Civil ---
          const rawMarital = matchedIndices['estadoCivil'] !== undefined && row[matchedIndices['estadoCivil']] !== undefined && row[matchedIndices['estadoCivil']] !== null ? row[matchedIndices['estadoCivil']].toString().trim() : '';
          const normMarital = rawMarital !== '' ? normalizeMaritalStatus(rawMarital) : '';
          if (normMarital !== '') {
            maritalCounts[normMarital] = (maritalCounts[normMarital] || 0) + 1;
          }

          // --- 4. Grupo Étnico ---
          const rawEthnic = matchedIndices['grupoEtnico'] !== undefined && row[matchedIndices['grupoEtnico']] !== undefined && row[matchedIndices['grupoEtnico']] !== null ? row[matchedIndices['grupoEtnico']].toString().trim() : '';
          let ethnicVal = '';
          if (rawEthnic !== '') {
            ethnicVal = normalizeEthnicity(rawEthnic);
            ethnicCounts[ethnicVal] = (ethnicCounts[ethnicVal] || 0) + 1;
          }

          // --- 5. Nivel Socioeconómico (Estrato) ---
          const rawStratum = matchedIndices['estrato'] !== undefined && row[matchedIndices['estrato']] !== undefined && row[matchedIndices['estrato']] !== null ? row[matchedIndices['estrato']].toString().trim() : '';
          let stratumVal = rawStratum;
          if (stratumVal !== '') {
            if (!stratumVal.toLowerCase().includes('estrato')) {
              stratumVal = `Estrato ${stratumVal}`;
            }
            stratumCounts[stratumVal] = (stratumCounts[stratumVal] || 0) + 1;
          }

          // --- 6. Ciudad ---
          const rawCity = matchedIndices['ciudad'] !== undefined && row[matchedIndices['ciudad']] !== undefined && row[matchedIndices['ciudad']] !== null ? row[matchedIndices['ciudad']].toString().trim() : '';
          const normCity = rawCity !== '' ? rawCity.charAt(0).toUpperCase() + rawCity.slice(1).toLowerCase() : '';
          if (normCity !== '') {
            cityCounts[normCity] = (cityCounts[normCity] || 0) + 1;
          }

          // --- 7. Escolaridad ---
          const rawEdu = matchedIndices['nivelEducativo'] !== undefined && row[matchedIndices['nivelEducativo']] !== undefined && row[matchedIndices['nivelEducativo']] !== null ? row[matchedIndices['nivelEducativo']].toString().trim() : '';
          const normEdu = rawEdu !== '' ? normalizeEducation(rawEdu) : '';
          if (normEdu !== '') {
            educationCounts[normEdu] = (educationCounts[normEdu] || 0) + 1;
          }

          // --- 8. Departamento / Campaña ---
          const deptIdx = matchedIndices['departamento'] !== undefined 
            ? matchedIndices['departamento'] 
            : (matchedIndices['area'] !== undefined ? matchedIndices['area'] : undefined);
          const rawDept = deptIdx !== undefined && row[deptIdx] !== undefined && row[deptIdx] !== null
            ? row[deptIdx].toString().trim()
            : '';
          if (rawDept !== '') {
            deptCounts[rawDept] = (deptCounts[rawDept] || 0) + 1;
          }

          // --- 9. Tipo de Contrato ---
          const rawContract = matchedIndices['tipoContrato'] !== undefined && row[matchedIndices['tipoContrato']] !== undefined && row[matchedIndices['tipoContrato']] !== null ? row[matchedIndices['tipoContrato']].toString().trim() : '';
          if (rawContract !== '') {
            contractCounts[rawContract] = (contractCounts[rawContract] || 0) + 1;
          }

          // --- 10. Antigüedad en la empresa ---
          const rawSen = matchedIndices['antiguedad'] !== undefined && row[matchedIndices['antiguedad']] !== undefined && row[matchedIndices['antiguedad']] !== null ? parseFloat(row[matchedIndices['antiguedad']]) : NaN;
          const seniority: number | null = !isNaN(rawSen) && rawSen >= 0 ? rawSen : null;
          if (seniority !== null) {
            sumSeniority += seniority;
            countSeniority++;
          }

          // --- 11. Hijos (Personas con hijos) ---
          let hasKids = false;
          if (matchedIndices['hijos'] !== undefined) {
            const rawKids = (row[matchedIndices['hijos']] || '').toString();
            hasKids = normalizeBoolean(rawKids) === 'Sí' || rawKids.toLowerCase().includes('hijo') || parseInt(rawKids) > 0;
          }
          if (hasKids) {
            countWithChildren++;
          }

          // --- 12. Discapacidad (Personas con discapacidad) ---
          let hasDisability = false;
          if (matchedIndices['discapacidad'] !== undefined) {
            const rawDisc = (row[matchedIndices['discapacidad']] || '').toString();
            hasDisability = normalizeBoolean(rawDisc) === 'Sí' || rawDisc.toLowerCase().includes('discapacidad') || rawDisc.toLowerCase().includes('limitacion') || rawDisc.toLowerCase().includes('discapacitado');
            if (rawDisc.toLowerCase().trim() === 'no' || rawDisc.toLowerCase().trim() === 'ninguna' || rawDisc.toLowerCase().trim() === 'ninguno') {
              hasDisability = false;
            }
          }
          if (hasDisability) {
            countDisability++;
          }

          // --- 13. Vivienda (Tipo de vivienda) ---
          const rawHousing = matchedIndices['vivienda'] !== undefined && row[matchedIndices['vivienda']] !== undefined && row[matchedIndices['vivienda']] !== null ? row[matchedIndices['vivienda']].toString().trim() : '';
          const housingVal = rawHousing !== '' ? normalizeHousing(rawHousing) : '';
          if (housingVal !== '') {
            housingCounts[housingVal] = (housingCounts[housingVal] || 0) + 1;
          }

          // --- Optional health and lifestyle metrics ---
          // Proyecto / Campaña
          const rawProject = matchedIndices['proyecto'] !== undefined && row[matchedIndices['proyecto']] !== undefined && row[matchedIndices['proyecto']] !== null
            ? row[matchedIndices['proyecto']].toString().trim() 
            : '';
          if (rawProject !== '') {
            projectCounts[rawProject] = (projectCounts[rawProject] || 0) + 1;
          }

          // Sitio de Trabajo
          const rawSite = matchedIndices['sitioTrabajo'] !== undefined && row[matchedIndices['sitioTrabajo']] !== undefined && row[matchedIndices['sitioTrabajo']] !== null
            ? row[matchedIndices['sitioTrabajo']].toString().trim() 
            : '';
          if (rawSite !== '') {
            let siteVal = rawSite;
            if (rawSite.toLowerCase().includes('casa') || rawSite.toLowerCase().includes('tele') || rawSite.toLowerCase().includes('home') || rawSite.toLowerCase().includes('remot')) {
              siteVal = 'Teletrabajo (Casa)';
            } else if (rawSite.toLowerCase().includes('hib') || rawSite.toLowerCase().includes('mixt')) {
              siteVal = 'Híbrido';
            } else if (rawSite.toLowerCase().includes('presenc') || rawSite.toLowerCase().includes('sede') || rawSite.toLowerCase().includes('ofi')) {
              siteVal = 'Presencial (Sede)';
            }
            workSiteCounts[siteVal] = (workSiteCounts[siteVal] || 0) + 1;
          }

          // Antigüedad en el cargo
          const rawSenCargo = matchedIndices['antiguedadCargo'] !== undefined && row[matchedIndices['antiguedadCargo']] !== undefined && row[matchedIndices['antiguedadCargo']] !== null ? parseFloat(row[matchedIndices['antiguedadCargo']]) : NaN;
          const seniorityCargo: number | null = !isNaN(rawSenCargo) && rawSenCargo >= 0 ? rawSenCargo : null;
          if (seniorityCargo !== null) {
            sumSeniorityRole += seniorityCargo;
            countSeniorityRole++;
          }

          // Uso del tiempo libre
          const rawTimeFree = matchedIndices['tiempoLibre'] !== undefined && row[matchedIndices['tiempoLibre']] !== undefined && row[matchedIndices['tiempoLibre']] !== null
            ? row[matchedIndices['tiempoLibre']].toString().trim()
            : '';
          if (rawTimeFree !== '') {
            freeTimeCounts[rawTimeFree] = (freeTimeCounts[rawTimeFree] || 0) + 1;
          }

          // Actividad física
          const rawActivity = matchedIndices['actividadFisica'] !== undefined && row[matchedIndices['actividadFisica']] !== undefined && row[matchedIndices['actividadFisica']] !== null
            ? row[matchedIndices['actividadFisica']].toString().trim()
            : '';
          let activityVal = '';
          if (rawActivity !== '') {
            activityVal = normalizePhysicalActivity(rawActivity, physicalActivityMode);
            if (physicalActivityCounts[activityVal] !== undefined) {
              physicalActivityCounts[activityVal]++;
            } else {
              physicalActivityCounts[activityVal] = 1;
            }
          }

          // Participación en actividades de la empresa
          const rawCompanyAct = matchedIndices['actividadesEmpresa'] !== undefined && row[matchedIndices['actividadesEmpresa']] !== undefined && row[matchedIndices['actividadesEmpresa']] !== null
            ? row[matchedIndices['actividadesEmpresa']].toString().trim()
            : '';
          if (rawCompanyAct !== '') {
            const rawCompanyActLower = rawCompanyAct.toLowerCase();
            let companyActVal = '';
            if (rawCompanyActLower.includes('alt') || rawCompanyActLower.includes('siempre') || rawCompanyActLower.includes('frecuente')) {
              companyActVal = 'Alta';
            } else if (rawCompanyActLower.includes('nunca') || rawCompanyActLower.includes('no') || rawCompanyActLower.includes('baja')) {
              companyActVal = 'Nunca / Baja';
            } else if (rawCompanyActLower.includes('ocasi') || rawCompanyActLower.includes('algun')) {
              companyActVal = 'Ocasional';
            }
            if (companyActVal !== '') {
              companyActivitiesCounts[companyActVal] = (companyActivitiesCounts[companyActVal] || 0) + 1;
            }
          }

          // Mascotas
          const rawPets = matchedIndices['mascotas'] !== undefined && row[matchedIndices['mascotas']] !== undefined && row[matchedIndices['mascotas']] !== null
            ? row[matchedIndices['mascotas']].toString().trim()
            : '';
          let hasPets = false;
          if (rawPets !== '') {
            hasPets = normalizePets(rawPets) === 'Sí';
            if (hasPets) {
              countWithPets++;
            }
          }

          // Peso, Estatura, IMC
          const rawWeightVal = matchedIndices['peso'] !== undefined && row[matchedIndices['peso']] !== undefined && row[matchedIndices['peso']] !== null
            ? parseFloat(row[matchedIndices['peso']])
            : NaN;
          const weight: number | null = !isNaN(rawWeightVal) && rawWeightVal > 0 ? rawWeightVal : null;

          if (weight !== null) {
            sumWeight += weight;
            countWeight++;
          }

          const rawExcelHeight = matchedIndices['estatura'] !== undefined ? row[matchedIndices['estatura']] : undefined;
          const rawHeightText = String(rawExcelHeight ?? '')
            .trim()
            .replace(',', '.');
          const rawHeight = rawHeightText !== '' ? Number(rawHeightText) : NaN;

          let estaturaMetros: number | null = null;
          if (!isNaN(rawHeight) && rawHeight > 0) {
            // Convertir de cm a metros si viene en cm (ej: 153 -> 1.53)
            estaturaMetros = rawHeight > 3 ? rawHeight / 100 : rawHeight;
            sumHeight += estaturaMetros;
            countHeight++;
          }

          // Recalcular el IMC individual de cada colaborador usando:
          // imc = peso / (altura * altura)
          // El IMC únicamente debe calcularse cuando existan simultáneamente peso y estatura válidos.
          let imcIndividual: number | null = null;
          if (weight !== null && estaturaMetros !== null) {
            imcIndividual = weight / (estaturaMetros * estaturaMetros);

            sumIMC += imcIndividual;
            countIMC++;
            bmiValues.push(imcIndividual);

            const imcClassVal = Number(imcIndividual.toFixed(1));

            // Clasificar según OMS:
            // <18.5 Bajo peso | 18.5-24.9 Normal | 25-29.9 Sobrepeso | 30-34.9 Obesidad I | 35-39.9 Obesidad II | >=40 Obesidad III
            if (imcClassVal < 18.5) {
              imcCounts['Bajo peso (< 18.5)']++;
            } else if (imcClassVal >= 18.5 && imcClassVal < 25.0) {
              imcCounts['Normal (18.5 - 24.9)']++;
            } else if (imcClassVal >= 25.0 && imcClassVal < 30.0) {
              imcCounts['Sobrepeso (25.0 - 29.9)']++;
            } else if (imcClassVal >= 30.0 && imcClassVal < 35.0) {
              imcCounts['Obesidad I (30.0 - 34.9)']++;
            } else if (imcClassVal >= 35.0 && imcClassVal < 40.0) {
              imcCounts['Obesidad II (35.0 - 39.9)']++;
            } else {
              imcCounts['Obesidad III (>= 40.0)']++;
            }
          }

          // Perímetro de cintura
          const rawWaistVal = matchedIndices['perimetroCintura'] !== undefined && row[matchedIndices['perimetroCintura']] !== undefined && row[matchedIndices['perimetroCintura']] !== null
            ? parseFloat(row[matchedIndices['perimetroCintura']])
            : NaN;
          const waist: number | null = !isNaN(rawWaistVal) && rawWaistVal > 0 ? rawWaistVal : null;
          if (waist !== null) {
            sumWaist += waist;
            countWaist++;
          }

          // Alergias
          const rawAllergy = matchedIndices['alergias'] !== undefined && row[matchedIndices['alergias']] !== undefined && row[matchedIndices['alergias']] !== null
            ? row[matchedIndices['alergias']].toString().trim()
            : '';
          if (rawAllergy !== '') {
            allergyCounts[rawAllergy] = (allergyCounts[rawAllergy] || 0) + 1;
          }

          // Medicamentos
          const rawMedication = matchedIndices['medicamentos'] !== undefined && row[matchedIndices['medicamentos']] !== undefined && row[matchedIndices['medicamentos']] !== null
            ? row[matchedIndices['medicamentos']].toString().trim()
            : '';
          if (rawMedication !== '') {
            medicationCounts[rawMedication] = (medicationCounts[rawMedication] || 0) + 1;
          }

          // Enfermedades
          const rawDisease = matchedIndices['enfermedades'] !== undefined && row[matchedIndices['enfermedades']] !== undefined && row[matchedIndices['enfermedades']] !== null
            ? row[matchedIndices['enfermedades']].toString().trim()
            : '';
          if (rawDisease !== '') {
            const diseaseVal = normalizeDisease(rawDisease);
            diseaseCounts[diseaseVal] = (diseaseCounts[diseaseVal] || 0) + 1;
          }

          // Molestias
          const rawPain = matchedIndices['molestias'] !== undefined && row[matchedIndices['molestias']] !== undefined && row[matchedIndices['molestias']] !== null
            ? row[matchedIndices['molestias']].toString().trim()
            : '';
          if (rawPain !== '') {
            musculoskeletalCounts[rawPain] = (musculoskeletalCounts[rawPain] || 0) + 1;
          }

          // Grupo Sanguíneo
          const rawBlood = matchedIndices['grupoSanguineo'] !== undefined && row[matchedIndices['grupoSanguineo']] !== undefined && row[matchedIndices['grupoSanguineo']] !== null
            ? row[matchedIndices['grupoSanguineo']].toString().trim().toUpperCase()
            : '';
          if (rawBlood !== '') {
            bloodTypeCounts[rawBlood] = (bloodTypeCounts[rawBlood] || 0) + 1;
          }

          // Integrantes Hogar
          let members: number | null = null;
          if (matchedIndices['integrantesHogar'] !== undefined && row[matchedIndices['integrantesHogar']] !== undefined && row[matchedIndices['integrantesHogar']] !== null) {
            const rawMembers = parseInt(row[matchedIndices['integrantesHogar']]);
            if (!isNaN(rawMembers) && rawMembers > 0) {
              members = rawMembers;
              sumHouseholdMembers += members;
              countHouseholdMembers++;
            }
          }

          // Viven Solas
          let livesAlone = false;
          if (matchedIndices['vivenSolas'] !== undefined && row[matchedIndices['vivenSolas']] !== undefined && row[matchedIndices['vivenSolas']] !== null) {
            const rawLivesAlone = row[matchedIndices['vivenSolas']].toString();
            livesAlone = normalizeBoolean(rawLivesAlone) === 'Sí';
            if (livesAlone) {
              countLivingAlone++;
            }
          } else if (members === 1) {
            livesAlone = true;
            countLivingAlone++;
          }

          // --- Quality checks & normalizations ---
          if (age !== null) {
            if (age <= 0 || age > 100) {
              negativeAgeCount++;
              outOfRangeCount++;
              dataQualityDetails.push({
                row: excelRowNumber,
                variable: 'Edad',
                value: age.toString(),
                observation: 'Edad fuera de rango lógico (menor o igual a 0, o mayor a 100 años).'
              });
            } else if (age < 18) {
              minorAgeCount++;
              outOfRangeCount++;
              dataQualityDetails.push({
                row: excelRowNumber,
                variable: 'Edad',
                value: age.toString(),
                observation: 'El empleado figura como menor de edad (menos de 18 años).'
              });
            }
          }
          if (matchedIndices['sexo'] !== undefined) checkAndCountNormalization(row[matchedIndices['sexo']], normalizedG);
          if (matchedIndices['estadoCivil'] !== undefined) checkAndCountNormalization(row[matchedIndices['estadoCivil']], normMarital);
          if (matchedIndices['grupoEtnico'] !== undefined) checkAndCountNormalization(row[matchedIndices['grupoEtnico']], ethnicVal);
          if (matchedIndices['estrato'] !== undefined) checkAndCountNormalization(row[matchedIndices['estrato']], stratumVal);
          if (matchedIndices['nivelEducativo'] !== undefined) checkAndCountNormalization(row[matchedIndices['nivelEducativo']], normEdu);
          if (matchedIndices['vivienda'] !== undefined) checkAndCountNormalization(row[matchedIndices['vivienda']], housingVal);
          if (matchedIndices['actividadFisica'] !== undefined) checkAndCountNormalization(row[matchedIndices['actividadFisica']], activityVal);
          if (matchedIndices['mascotas'] !== undefined) checkAndCountNormalization(row[matchedIndices['mascotas']], hasPets ? 'Sí' : 'No');
          
          if (matchedIndices['antiguedad'] !== undefined && row[matchedIndices['antiguedad']] !== undefined && row[matchedIndices['antiguedad']] !== null) {
            const rawAnt = parseFloat(row[matchedIndices['antiguedad']]);
            if (!isNaN(rawAnt)) {
              if (rawAnt < 0) {
                negativeSeniorityCount++;
                outOfRangeCount++;
                dataQualityDetails.push({
                  row: excelRowNumber,
                  variable: 'Antigüedad empresa',
                  value: rawAnt.toString(),
                  observation: 'La antigüedad total en la empresa no puede ser un valor negativo.'
                });
              }
              if (age !== null && rawAnt > age - 15) {
                seniorityExceedsAgeCount++;
                outOfRangeCount++;
                dataQualityDetails.push({
                  row: excelRowNumber,
                  variable: 'Antigüedad empresa',
                  value: rawAnt.toString(),
                  observation: `Antigüedad en la empresa es inconsistente con la edad actual del empleado (${age} años).`
                });
              }
            }
          }
          if (matchedIndices['antiguedadCargo'] !== undefined && row[matchedIndices['antiguedadCargo']] !== undefined && row[matchedIndices['antiguedadCargo']] !== null) {
            const rawAntCargo = parseFloat(row[matchedIndices['antiguedadCargo']]);
            if (!isNaN(rawAntCargo) && matchedIndices['antiguedad'] !== undefined && row[matchedIndices['antiguedad']] !== undefined && row[matchedIndices['antiguedad']] !== null) {
              const rawAnt = parseFloat(row[matchedIndices['antiguedad']]);
              if (!isNaN(rawAnt) && rawAntCargo > rawAnt) {
                roleExceedsCompanySeniorityCount++;
                outOfRangeCount++;
                dataQualityDetails.push({
                  row: excelRowNumber,
                  variable: 'Antigüedad cargo',
                  value: `Cargo: ${rawAntCargo} vs Empresa: ${rawAnt}`,
                  observation: 'La antigüedad en el cargo no puede superar la antigüedad total en la empresa.'
                });
              }
            }
          }
          if (weight !== null && (weight < 35 || weight > 180)) {
            extremeWeightCount++;
            outOfRangeCount++;
            dataQualityDetails.push({
              row: excelRowNumber,
              variable: 'Peso',
              value: `${weight} kg`,
              observation:  'Peso del empleado fuera de rango lógico común esperado (menor a 35 kg o mayor a 180 kg).'
            });
          }
          if (estaturaMetros !== null) {
            const heightValToCheck = estaturaMetros * 100;
            if (heightValToCheck < 100 || heightValToCheck > 230) {
              extremeHeightCount++;
              outOfRangeCount++;
              dataQualityDetails.push({
                row: excelRowNumber,
                variable: 'Estatura',
                value: `${estaturaMetros} m`,
                observation: 'Estatura del empleado fuera de rango lógico o inconsistente (menor a 100 cm o mayor a 230 cm).'
              });
            }
          }
        });

        // Compute averages and indicators
        const averageAge = countAge > 0 ? Number((sumAge / countAge).toFixed(1)) : 0;
        const averageSeniority = countSeniority > 0 ? Number((sumSeniority / countSeniority).toFixed(1)) : 0;
        const averageSeniorityRole = countSeniorityRole > 0 ? Number((sumSeniorityRole / countSeniorityRole).toFixed(1)) : 0;
        
        const pesoPromedio = countWeight > 0 ? Number((sumWeight / countWeight).toFixed(1)) : 0;
        const estaturaPromedio = countHeight > 0 ? Number((sumHeight / countHeight).toFixed(2)) : 0;
        const cantidadIMC = countIMC;
        const sumatoriaIMC = sumIMC;
        const promedioIMC = cantidadIMC > 0 ? Number((sumatoriaIMC / cantidadIMC).toFixed(1)) : 0;

        const averageWeight = pesoPromedio;
        const averageHeight = estaturaPromedio;
        const averageBMI = promedioIMC;

        console.log("Peso promedio:", averageWeight);
        console.log("Estatura promedio:", averageHeight);
        console.log("IMC promedio:", averageBMI);
        console.log("Cantidad IMC:", bmiValues.length);
        console.log("Primeros 10 IMC:", bmiValues.slice(0, 10));
        console.log("Promedio calculado:", bmiValues.length > 0 ? bmiValues.reduce((a, b) => a + b, 0) / bmiValues.length : 0);

        console.table({
          pesoPromedio,
          estaturaPromedio,
          cantidadIMC: bmiValues.length,
          sumatoriaIMC: Number(sumatoriaIMC.toFixed(2)),
          promedioIMC
        });

        const averageIMC = averageBMI;
        const averageWaistPerimeter = countWaist > 0 ? Number((sumWaist / countWaist).toFixed(1)) : 0;

        const hasChildrenPercentage = (countWithChildren / totalEmployees) * 100;
        const disabilityPercentage = (countDisability / totalEmployees) * 100;

        // Generate final statistics arrays matching types.ts
        const genderStats: GenderStat[] = Object.keys(genderCounts).map(name => ({
          name,
          value: genderCounts[name],
          percentage: (genderCounts[name] / totalEmployees) * 100
        })).sort((a,b) => b.value - a.value);

        const ageGroupStats: AgeGroupStat[] = Object.keys(ageGroupCounts).map(range => ({
          range,
          value: ageGroupCounts[range as keyof typeof ageGroupCounts],
          label: `${ageGroupCounts[range as keyof typeof ageGroupCounts]} emp.`
        }));

        const educationStats: EducationStat[] = Object.keys(educationCounts).map(level => ({
          level,
          count: educationCounts[level]
        })).sort((a,b) => b.count - a.count);

        const maritalStatusStats: MaritalStatusStat[] = Object.keys(maritalCounts).map(status => ({
          status,
          count: maritalCounts[status]
        })).sort((a,b) => b.count - a.count);

        const cityStats: CityStat[] = Object.keys(cityCounts).map(name => ({
          name,
          count: cityCounts[name]
        })).sort((a,b) => b.count - a.count);

        const contractStats: ContractStat[] = Object.keys(contractCounts).map(type => ({
          type,
          count: contractCounts[type],
          percentage: (contractCounts[type] / totalEmployees) * 100
        })).sort((a,b) => b.count - a.count);

        const housingStats: HousingStat[] = Object.keys(housingCounts).map(type => ({
          type,
          count: housingCounts[type],
          percentage: (housingCounts[type] / totalEmployees) * 100
        })).sort((a,b) => b.count - a.count);

        const ethnicGroupStats = Object.keys(ethnicCounts).map(name => ({
          name,
          count: ethnicCounts[name],
          percentage: (ethnicCounts[name] / totalEmployees) * 100
        })).sort((a,b) => b.count - a.count);

        const socioeconomicStrataStats = Object.keys(stratumCounts).map(stratum => ({
          stratum,
          count: stratumCounts[stratum],
          percentage: (stratumCounts[stratum] / totalEmployees) * 100
        })).sort((a,b) => a.stratum.localeCompare(b.stratum));

        const projectStats = Object.keys(projectCounts).map(name => ({
          name,
          count: projectCounts[name],
          percentage: (projectCounts[name] / totalEmployees) * 100
        })).sort((a,b) => b.count - a.count).slice(0, 5);

        const workSiteStats = Object.keys(workSiteCounts).map(site => ({
          site,
          count: workSiteCounts[site],
          percentage: (workSiteCounts[site] / totalEmployees) * 100
        })).sort((a,b) => b.count - a.count);

        const freeTimeUsageStats = Object.keys(freeTimeCounts).map(activity => ({
          activity,
          count: freeTimeCounts[activity],
          percentage: (freeTimeCounts[activity] / totalEmployees) * 100
        })).sort((a,b) => b.count - a.count).slice(0, 5);

        console.table(physicalActivityCounts);

        const physicalActivityStats = Object.keys(physicalActivityCounts).map(level => ({
          level,
          count: physicalActivityCounts[level],
          percentage: (physicalActivityCounts[level] / totalEmployees) * 100
        }));

        const companyActivitiesParticipationStats = Object.keys(companyActivitiesCounts).map(participation => ({
          participation,
          count: companyActivitiesCounts[participation],
          percentage: (companyActivitiesCounts[participation] / totalEmployees) * 100
        }));

        const petsStats = [
          { hasPets: true, count: countWithPets, percentage: (countWithPets / totalEmployees) * 100 },
          { hasPets: false, count: totalEmployees - countWithPets, percentage: ((totalEmployees - countWithPets) / totalEmployees) * 100 }
        ];

        const imcClassificationStats = Object.keys(imcCounts).map(category => ({
          category,
          count: imcCounts[category as keyof typeof imcCounts],
          percentage: (imcCounts[category as keyof typeof imcCounts] / totalEmployees) * 100
        }));

        const allergyStats = Object.keys(allergyCounts).map(allergy => ({
          allergy,
          count: allergyCounts[allergy],
          percentage: (allergyCounts[allergy] / totalEmployees) * 100
        })).sort((a,b) => b.count - a.count).slice(0, 5);

        const medicationStats = Object.keys(medicationCounts).map(medicated => ({
          medicated,
          count: medicationCounts[medicated],
          percentage: (medicationCounts[medicated] / totalEmployees) * 100
        })).sort((a,b) => b.count - a.count).slice(0, 5);

        const diseaseStats = Object.keys(diseaseCounts).map(disease => ({
          disease,
          count: diseaseCounts[disease],
          percentage: (diseaseCounts[disease] / totalEmployees) * 100
        })).sort((a,b) => b.count - a.count).slice(0, 5);

        const musculoskeletalPainStats = Object.keys(musculoskeletalCounts).map(bodyPart => ({
          bodyPart,
          count: musculoskeletalCounts[bodyPart],
          percentage: (musculoskeletalCounts[bodyPart] / totalEmployees) * 100
        })).sort((a,b) => b.count - a.count).slice(0, 5);

        const bloodTypeStats = Object.keys(bloodTypeCounts).map(group => ({
          group,
          count: bloodTypeCounts[group],
          percentage: (bloodTypeCounts[group] / totalEmployees) * 100
        })).sort((a,b) => b.count - a.count);

        // Generate department wellbeing dynamically based on actual department list
        const departmentWellbeingStats: DepartmentWellbeing[] = Object.keys(deptCounts).map((dept, idx) => {
          const count = deptCounts[dept];
          
          const dIdx = matchedIndices['departamento'] !== undefined 
            ? matchedIndices['departamento'] 
            : (matchedIndices['area'] !== undefined ? matchedIndices['area'] : undefined);

          // Compute metrics specifically for employees of this department
          const deptEmployees = rows.filter(r => {
            const d = dIdx !== undefined && r[dIdx] !== undefined && r[dIdx] !== null
              ? r[dIdx].toString().trim()
              : '';
            return d === dept;
          });
          
          let wellbeingScore: number | null = null;
          let stressScore: number | null = null;
          
          if (deptEmployees.length > 0) {
            const wIdx = matchedIndices['bienestar'];
            if (wIdx !== undefined) {
              let sumW = 0;
              let countW = 0;
              deptEmployees.forEach(r => {
                const val = parseFloat(r[wIdx]);
                if (!isNaN(val)) {
                  sumW += val;
                  countW++;
                }
              });
              if (countW > 0) {
                wellbeingScore = Number((sumW / countW).toFixed(1));
              }
            }

            const sIdx = matchedIndices['estres'];
            if (sIdx !== undefined) {
              let sumS = 0;
              let countS = 0;
              deptEmployees.forEach(r => {
                const val = parseFloat(r[sIdx]);
                if (!isNaN(val)) {
                  sumS += val;
                  countS++;
                }
              });
              if (countS > 0) {
                stressScore = Number((sumS / countS).toFixed(1));
              }
            }
          }
          
          return {
            name: dept,
            wellbeing: wellbeingScore !== null ? Math.min(100, Math.max(0, wellbeingScore)) : (null as any),
            stress: stressScore !== null ? Math.min(100, Math.max(0, stressScore)) : (null as any),
            agents: count
          };
        }).sort((a,b) => b.agents - a.agents);

        const childrenStats: ChildrenStat[] = [
          { hasChildren: true, count: countWithChildren, percentage: (countWithChildren / totalEmployees) * 100 },
          { hasChildren: false, count: totalEmployees - countWithChildren, percentage: ((totalEmployees - countWithChildren) / totalEmployees) * 100 }
        ];

        const disabilityStatsArray = [
          { hasDisability: true, count: countDisability, percentage: (countDisability / totalEmployees) * 100 },
          { hasDisability: false, count: totalEmployees - countDisability, percentage: ((totalEmployees - countDisability) / totalEmployees) * 100 }
        ];

        // Overall KPIs computed dynamically if corresponding columns exist, otherwise null
        let calculatedAbsenteeism: number | null = null;
        if (matchedIndices['ausentismo'] !== undefined) {
          let sumAbs = 0;
          let countAbs = 0;
          rows.forEach(r => {
            if (!r) return;
            const val = parseFloat(r[matchedIndices['ausentismo']]);
            if (!isNaN(val)) {
              sumAbs += val;
              countAbs++;
            }
          });
          if (countAbs > 0) {
            calculatedAbsenteeism = Number((sumAbs / countAbs).toFixed(1));
          }
        }

        let calculatedWellbeing: number | null = null;
        if (matchedIndices['bienestar'] !== undefined) {
          let sumW = 0;
          let countW = 0;
          rows.forEach(r => {
            if (!r) return;
            const val = parseFloat(r[matchedIndices['bienestar']]);
            if (!isNaN(val)) {
              sumW += val;
              countW++;
            }
          });
          if (countW > 0) {
            calculatedWellbeing = Number((sumW / countW).toFixed(1));
          }
        }

        let calculatedParticipation: number | null = null;
        if (matchedIndices['participacion'] !== undefined) {
          let countP = 0;
          let totalValid = 0;
          rows.forEach(r => {
            if (!r) return;
            const val = r[matchedIndices['participacion']];
            if (val !== undefined && val !== null && val.toString().trim() !== '') {
              totalValid++;
              const strVal = val.toString().toLowerCase().trim();
              if (strVal === 'si' || strVal === 'sí' || strVal === 'yes' || strVal === 'true' || strVal === '1' || strVal === 'alta' || strVal === 'frecuente' || strVal === 'ocasional') {
                countP++;
              }
            }
          });
          if (totalValid > 0) {
            calculatedParticipation = Number(((countP / totalValid) * 100).toFixed(1));
          }
        } else if (matchedIndices['actividadesEmpresa'] !== undefined) {
          let countAct = 0;
          let totalValid = 0;
          rows.forEach(r => {
            if (!r) return;
            const val = r[matchedIndices['actividadesEmpresa']];
            if (val !== undefined && val !== null && val.toString().trim() !== '') {
              totalValid++;
              const strVal = val.toString().toLowerCase().trim();
              if (strVal.includes('alt') || strVal.includes('siempre') || strVal.includes('frecuente') || strVal.includes('ocasi') || strVal.includes('algun') || strVal === 'si' || strVal === 'sí') {
                countAct++;
              }
            }
          });
          if (totalValid > 0) {
            calculatedParticipation = Number(((countAct / totalValid) * 100).toFixed(1));
          }
        }

        const averageHouseholdMembers = countHouseholdMembers > 0 ? Number((sumHouseholdMembers / countHouseholdMembers).toFixed(1)) : 0;
        const peopleLivingAloneCount = countLivingAlone;
        const peopleLivingAlonePercentage = totalEmployees > 0 ? (countLivingAlone / totalEmployees) * 100 : 0;

        // Map raw employees clean object array (from uniqueRows to avoid duplicates and ensure sums match)
        const rawEmployeesList = uniqueRows.map(({ row }) => {
          let ageVal: number | null = null;
          let computed = false;
          if (matchedIndices['fechaNacimiento'] !== undefined && row[matchedIndices['fechaNacimiento']] !== undefined && row[matchedIndices['fechaNacimiento']] !== null && row[matchedIndices['fechaNacimiento']].toString().trim() !== '') {
            const calculatedAge = calculateAgeFromBirthDate(row[matchedIndices['fechaNacimiento']]);
            if (calculatedAge !== null && calculatedAge >= 15 && calculatedAge <= 100) {
              ageVal = calculatedAge;
              computed = true;
            }
          }
          if (!computed) {
            const empEdad = matchedIndices['edad'] !== undefined && row[matchedIndices['edad']] !== undefined && row[matchedIndices['edad']] !== null ? parseFloat(row[matchedIndices['edad']]) : NaN;
            ageVal = !isNaN(empEdad) && empEdad > 0 ? empEdad : null;
          }

          const empSexo = matchedIndices['sexo'] !== undefined && row[matchedIndices['sexo']] !== undefined && row[matchedIndices['sexo']] !== null ? row[matchedIndices['sexo']].toString().trim() : '';
          const empCiudad = matchedIndices['ciudad'] !== undefined && row[matchedIndices['ciudad']] !== undefined && row[matchedIndices['ciudad']] !== null ? row[matchedIndices['ciudad']].toString().trim() : '';
          const empEstadoCivil = matchedIndices['estadoCivil'] !== undefined && row[matchedIndices['estadoCivil']] !== undefined && row[matchedIndices['estadoCivil']] !== null ? row[matchedIndices['estadoCivil']].toString().trim() : '';
          const empNivelEducativo = matchedIndices['nivelEducativo'] !== undefined && row[matchedIndices['nivelEducativo']] !== undefined && row[matchedIndices['nivelEducativo']] !== null ? row[matchedIndices['nivelEducativo']].toString().trim() : '';
          const empAntiguedadRaw = matchedIndices['antiguedad'] !== undefined && row[matchedIndices['antiguedad']] !== undefined && row[matchedIndices['antiguedad']] !== null ? parseFloat(row[matchedIndices['antiguedad']]) : NaN;
          const empAntiguedad = !isNaN(empAntiguedadRaw) && empAntiguedadRaw >= 0 ? empAntiguedadRaw : null;
          const empTipoContrato = matchedIndices['tipoContrato'] !== undefined && row[matchedIndices['tipoContrato']] !== undefined && row[matchedIndices['tipoContrato']] !== null ? row[matchedIndices['tipoContrato']].toString().trim() : '';
          const empHijosStr = matchedIndices['hijos'] !== undefined && row[matchedIndices['hijos']] !== undefined && row[matchedIndices['hijos']] !== null ? row[matchedIndices['hijos']].toString().trim() : '';
          const empVivienda = matchedIndices['vivienda'] !== undefined && row[matchedIndices['vivienda']] !== undefined && row[matchedIndices['vivienda']] !== null ? row[matchedIndices['vivienda']].toString().trim() : '';
          const empEstrato = matchedIndices['estrato'] !== undefined && row[matchedIndices['estrato']] !== undefined && row[matchedIndices['estrato']] !== null ? row[matchedIndices['estrato']].toString().trim() : '';
          const empArea = matchedIndices['area'] !== undefined && row[matchedIndices['area']] !== undefined && row[matchedIndices['area']] !== null ? row[matchedIndices['area']].toString().trim() : '';
          const empDepartamento = matchedIndices['departamento'] !== undefined && row[matchedIndices['departamento']] !== undefined && row[matchedIndices['departamento']] !== null
            ? row[matchedIndices['departamento']].toString().trim() 
            : '';
          const empCargo = matchedIndices['cargo'] !== undefined && row[matchedIndices['cargo']] !== undefined && row[matchedIndices['cargo']] !== null ? row[matchedIndices['cargo']].toString().trim() : '';
          const empPersonasACargoRaw = matchedIndices['personasACargo'] !== undefined && row[matchedIndices['personasACargo']] !== undefined && row[matchedIndices['personasACargo']] !== null ? parseInt(row[matchedIndices['personasACargo']]) : NaN;
          const empPersonasACargo = !isNaN(empPersonasACargoRaw) ? empPersonasACargoRaw : null;
          const empIngresoRaw = matchedIndices['ingreso'] !== undefined && row[matchedIndices['ingreso']] !== undefined && row[matchedIndices['ingreso']] !== null ? parseFloat(row[matchedIndices['ingreso']]) : NaN;
          const empIngreso = !isNaN(empIngresoRaw) ? empIngresoRaw : null;
          const empDiscapacidadStr = matchedIndices['discapacidad'] !== undefined && row[matchedIndices['discapacidad']] !== undefined && row[matchedIndices['discapacidad']] !== null ? row[matchedIndices['discapacidad']].toString().trim() : '';
          const empGrupoEtnico = matchedIndices['grupoEtnico'] !== undefined && row[matchedIndices['grupoEtnico']] !== undefined && row[matchedIndices['grupoEtnico']] !== null ? row[matchedIndices['grupoEtnico']].toString().trim() : '';

          const rawW = matchedIndices['peso'] !== undefined && row[matchedIndices['peso']] !== undefined && row[matchedIndices['peso']] !== null ? parseFloat(row[matchedIndices['peso']]) : NaN;
          const empPeso: number | null = !isNaN(rawW) && rawW > 0 ? rawW : null;

          const rawH = matchedIndices['estatura'] !== undefined && row[matchedIndices['estatura']] !== undefined && row[matchedIndices['estatura']] !== null ? parseFloat(row[matchedIndices['estatura']]) : NaN;
          let empEstatura: number | null = null;
          if (!isNaN(rawH) && rawH > 0) {
            empEstatura = rawH > 3 ? rawH / 100 : rawH;
          }

          const empImc: number | null = (empPeso !== null && empEstatura !== null) ? Number((empPeso / (empEstatura * empEstatura)).toFixed(1)) : null;

          return {
            edad: ageVal,
            sexo: empSexo !== '' ? normalizeGender(empSexo) : '',
            ciudad: empCiudad,
            estadoCivil: empEstadoCivil !== '' ? normalizeMaritalStatus(empEstadoCivil) : '',
            nivelEducativo: empNivelEducativo !== '' ? normalizeEducation(empNivelEducativo) : '',
            antiguedad: empAntiguedad,
            tipoContrato: empTipoContrato,
            area: empArea,
            cargo: empCargo,
            personasACargo: empPersonasACargo,
            hijos: empHijosStr !== '' ? normalizeBoolean(empHijosStr) : '',
            vivienda: empVivienda !== '' ? normalizeHousing(empVivienda) : '',
            estrato: empEstrato,
            departamento: empDepartamento,
            ingreso: empIngreso,
            discapacidad: empDiscapacidadStr !== '' ? normalizeBoolean(empDiscapacidadStr) : '',
            grupoEtnico: empGrupoEtnico !== '' ? normalizeEthnicity(empGrupoEtnico) : '',
            peso: empPeso,
            estatura: empEstatura,
            imc: empImc
          };
        });

        // --- Compile warnings ---
        const warnings: string[] = [];
        if (negativeAgeCount > 0) {
          warnings.push(`Se detectaron ${negativeAgeCount} registros con edades inválidas o fuera de rango lógico (menores de 0 o mayores de 100 años).`);
        }
        if (minorAgeCount > 0) {
          warnings.push(`Se detectaron ${minorAgeCount} registros de empleados que figuran como menores de edad (menos de 18 años).`);
        }
        if (negativeSeniorityCount > 0) {
          warnings.push(`Se detectaron ${negativeSeniorityCount} registros con valores de antigüedad en la empresa negativos.`);
        }
        if (seniorityExceedsAgeCount > 0) {
          warnings.push(`Inconsistencia en ${seniorityExceedsAgeCount} registros: la antigüedad en la empresa supera la edad laboral lógica del empleado.`);
        }
        if (roleExceedsCompanySeniorityCount > 0) {
          warnings.push(`Inconsistencia en ${roleExceedsCompanySeniorityCount} registros: la antigüedad en el cargo actual supera la antigüedad total en la empresa.`);
        }
        if (extremeWeightCount > 0) {
          warnings.push(`Se detectaron ${extremeWeightCount} registros con peso extremo o fuera de rango común (menor a 35 kg o mayor a 180 kg).`);
        }
        if (extremeHeightCount > 0) {
          warnings.push(`Se detectaron ${extremeHeightCount} registros con estatura fuera de rango lógico o en formato inconsistente (menor a 100 cm o mayor a 230 cm).`);
        }
        if (duplicateRecordsCount > 0) {
          warnings.push(`Se detectaron ${duplicateRecordsCount} registros completamente duplicados en el archivo.`);
        }
        if (missingColumns.length > 0) {
          warnings.push(`Faltan ${missingColumns.length} variables requeridas en la estructura del archivo Excel: ${missingColumns.join(', ')}.`);
        }
        if (incompleteRecordsCount > 0) {
          warnings.push(`Se identificaron ${incompleteRecordsCount} registros incompletos (con celdas vacías).`);
        }

        // --- Calculate Quality Level & Percentage ---
        const missingCount = missingColumns.length;
        let qualityPercentage = 100 - (1 * incompleteRecordsCount) - (2 * outOfRangeCount) - (5 * missingCount);
        qualityPercentage = Math.max(0, Math.min(100, qualityPercentage));

        let qualityLevel: 'Excelente' | 'Buena' | 'Regular' | 'Deficiente' = 'Excelente';
        if (qualityPercentage >= 95) {
          qualityLevel = 'Excelente';
        } else if (qualityPercentage >= 80) {
          qualityLevel = 'Buena';
        } else if (qualityPercentage >= 50) {
          qualityLevel = 'Regular';
        } else {
          qualityLevel = 'Deficiente';
        }

        // --- Recognized Variables Counts ---
        const totalVariablesCount = headers.filter(h => h !== undefined && h !== null && h.toString().trim() !== '').length;
        const recognizedVariablesCount = new Set(Object.values(matchedIndices)).size;

        const dataQuality: DataQualityReport = {
          recordsRead: totalEmployees,
          recognizedVariablesCount,
          totalVariablesCount: Math.max(totalVariablesCount, recognizedVariablesCount),
          missingVariablesCount: missingCount,
          incompleteRecordsCount,
          outOfRangeCount,
          duplicateRecordsCount,
          normalizedVariablesCount,
          qualityPercentage,
          qualityLevel,
          warnings,
          details: dataQualityDetails
        };

        const dataResult: DemographicsData = {
          totalEmployees,
          averageAge,
          averageSeniority,
          wellbeingIndex: calculatedWellbeing,
          absenteeismRate: calculatedAbsenteeism,
          activeParticipation: calculatedParticipation,
          hasChildrenPercentage,
          gender: genderStats,
          ageGroups: ageGroupStats,
          education: educationStats,
          housing: housingStats,
          city: cityStats,
          maritalStatus: maritalStatusStats,
          departmentWellbeing: departmentWellbeingStats,
          children: childrenStats,
          contractType: contractStats,
          
          // Ampliados
          ethnicGroups: ethnicGroupStats,
          socioeconomicStrata: socioeconomicStrataStats,
          projects: projectStats,
          workSites: workSiteStats,
          averageSeniorityRole,
          disabilityCount: countDisability,
          disabilityPercentage,
          disabilityStats: disabilityStatsArray,
 
          // Bienestar
          freeTimeUsage: freeTimeUsageStats,
          physicalActivityMode,
          physicalActivity: physicalActivityStats,
          companyActivitiesParticipation: companyActivitiesParticipationStats,
          pets: petsStats,
 
          // Salud
          averageWeight,
          averageHeight,
          averageIMC,
          imcClassification: imcClassificationStats,
          averageWaistPerimeter,
          allergies: allergyStats,
          medications: medicationStats,
          diseases: diseaseStats,
          musculoskeletalPain: musculoskeletalPainStats,
          bloodType: bloodTypeStats,
          
          // Familia
          averageHouseholdMembers,
          peopleLivingAloneCount,
          peopleLivingAlonePercentage,
          rawEmployees: rawEmployeesList,
          missingVariables: missingColumns,
          dataQuality
        };

        const demographics = dataResult;
        console.log("===== PHYSICAL ACTIVITY =====");
        console.log("physicalActivityMode:", physicalActivityMode);
        console.table(physicalActivityStats);

        console.log("Objeto completo:");
        console.log({
          physicalActivityMode,
          physicalActivity: physicalActivityStats
        });

        console.log("===== DEMOGRAPHICS DATA =====");
        console.log({
          totalEmployees: demographics.totalEmployees,
          averageWeight: demographics.averageWeight,
          averageHeight: demographics.averageHeight,
          averageIMC: demographics.averageIMC
        });

        resolve({ success: true, data: dataResult, missingColumns });
      } catch (err: any) {
        console.error('Error parsing excel:', err);
        resolve({ success: false, error: `Error durante el procesamiento: ${err.message || err}` });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Ocurrió un error al leer el archivo en el navegador.' });
    };

    reader.readAsArrayBuffer(file);
  });
}
