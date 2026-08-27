import * as XLSX from 'xlsx';
import { 
  ClimateData, 
  ClimateDimensionScore, 
  ClimateQuestionScore, 
  ClimateSegmentScore,
  ClimateDataQualityReport,
  ClimateDataQualityIssue
} from './clima.types';
import { 
  DEFAULT_CLIMA_DIMENSIONS, 
  DEFAULT_CLIMA_QUESTIONS, 
  CLIMA_DEMO_ALIASES 
} from './clima.config';

interface ClimaParseResult {
  success: boolean;
  data?: ClimateData;
  missingColumns?: string[];
  error?: string;
}

// Normalize Likert response to 1-5 number
function normalizeLikertValue(val: any): number | null {
  if (val === null || val === undefined) return null;
  
  const num = Number(val);
  if (!isNaN(num) && num >= 1 && num <= 5) {
    return Math.round(num);
  }

  const str = String(val).toLowerCase().trim();
  
  // Strongly disagree / Disagree
  if (
    str.includes('totalmente en desacuerdo') || 
    str.includes('muy en desacuerdo') || 
    str === '1' || 
    str === 'muy malo' || 
    str === 'pésimo'
  ) {
    return 1;
  }
  if (
    str.includes('en desacuerdo') || 
    str === 'desacuerdo' || 
    str === '2' || 
    str === 'malo'
  ) {
    return 2;
  }
  
  // Neutral
  if (
    str.includes('neutral') || 
    str.includes('ni de acuerdo') || 
    str.includes('regular') || 
    str === 'ni de acuerdo ni en desacuerdo' || 
    str === '3' || 
    str === 'indiferente'
  ) {
    return 3;
  }
  
  // Agree / Strongly agree
  if (
    str.includes('totalmente de acuerdo') || 
    str.includes('muy de acuerdo') || 
    str === '5' || 
    str === 'excelente' || 
    str === 'muy bueno'
  ) {
    return 5;
  }
  if (
    str.includes('de acuerdo') || 
    str === 'de acuerdo' || 
    str === '4' || 
    str === 'bueno'
  ) {
    return 4;
  }

  return null;
}

// Find column index using smart matching
function findColumnIndex(headers: string[], targetKey: string, aliases: string[]): number | null {
  const normalizedHeaders = headers.map(h => String(h || '').toLowerCase().trim());
  const normalizedTarget = targetKey.toLowerCase().trim();

  // 1. Exact match
  let idx = normalizedHeaders.indexOf(normalizedTarget);
  if (idx !== -1) return idx;

  // 2. Alias match
  for (const alias of aliases) {
    const normalizedAlias = alias.toLowerCase().trim();
    
    // Check exact alias match
    idx = normalizedHeaders.indexOf(normalizedAlias);
    if (idx !== -1) return idx;

    // Check partial contains
    const foundIdx = normalizedHeaders.findIndex(h => h.includes(normalizedAlias) || normalizedAlias.includes(h));
    if (foundIdx !== -1) return foundIdx;
  }

  // 3. Last resort - check if header contains target key
  const fallbackIdx = normalizedHeaders.findIndex(h => h.includes(normalizedTarget));
  if (fallbackIdx !== -1) return fallbackIdx;

  return null;
}

export function parseClimaExcelFile(file: File): Promise<ClimaParseResult> {
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

        // Find header row (the row that has the most non-empty string headers or matches with questions)
        let headerRowIdx = 0;
        let maxMatches = -1;
        
        for (let r = 0; r < Math.min(10, rawRows.length); r++) {
          const row = rawRows[r];
          if (!Array.isArray(row)) continue;
          let matches = 0;
          
          row.forEach((cell: any) => {
            const cellStr = String(cell || '').toLowerCase();
            // Check if matches any question text or aliases
            const matchesQuestion = DEFAULT_CLIMA_QUESTIONS.some(q => 
              cellStr.includes(q.text.toLowerCase()) || 
              q.aliases.some(alias => cellStr.includes(alias.toLowerCase()))
            );
            // Check if matches demographics
            const matchesDemo = Object.values(CLIMA_DEMO_ALIASES).flat().some(alias => 
              cellStr.includes(alias.toLowerCase())
            );
            
            if (matchesQuestion || matchesDemo) {
              matches++;
            }
          });

          if (matches > maxMatches) {
            maxMatches = matches;
            headerRowIdx = r;
          }
        }

        const headers: string[] = (rawRows[headerRowIdx] as string[]).map(h => String(h || '').trim());
        
        // Map demographic columns
        const demoIndices: Record<string, number | null> = {};
        Object.entries(CLIMA_DEMO_ALIASES).forEach(([key, aliases]) => {
          demoIndices[key] = findColumnIndex(headers, key, aliases);
        });

        // Map question columns
        const questionIndices: Record<string, number | null> = {};
        DEFAULT_CLIMA_QUESTIONS.forEach(q => {
          questionIndices[q.id] = findColumnIndex(headers, q.id, [q.text, ...q.aliases]);
        });

        // Validation: Verify if we have at least SOME questions mapped
        const mappedQuestionsCount = Object.values(questionIndices).filter(idx => idx !== null).length;
        if (mappedQuestionsCount === 0) {
          resolve({ 
            success: false, 
            error: 'No se detectaron preguntas de clima organizacional en las columnas del archivo. Verifique los encabezados.',
            missingColumns: DEFAULT_CLIMA_QUESTIONS.map(q => q.text)
          });
          return;
        }

        // Parse data rows
        const dataRows = rawRows.slice(headerRowIdx + 1).filter((r: any) => {
          if (!r || !Array.isArray(r) || r.length === 0) return false;
          return r.some((cell: any) => cell !== undefined && cell !== null && cell.toString().trim() !== '');
        });

        const totalParticipants = dataRows.length;
        if (totalParticipants === 0) {
          resolve({ success: false, error: 'No se encontraron filas con respuestas válidas para procesar.' });
          return;
        }

        // Initialize question collectors
        const questionData: Record<string, { ratings: number[], count: number, unfavCount: number, neutCount: number, favCount: number }> = {};
        DEFAULT_CLIMA_QUESTIONS.forEach(q => {
          questionData[q.id] = { ratings: [], count: 0, unfavCount: 0, neutCount: 0, favCount: 0 };
        });

        // Initialize demographic segmentation collectors
        const segmentCollectors: Record<string, Record<string, number[]>> = {
          ciudad: {},
          departamento: {},
          genero: {},
          antiguedad: {}
        };

        const qualityIssues: ClimateDataQualityIssue[] = [];
        let incompleteRecords = 0;

        // Process rows
        dataRows.forEach((row, rowIdx) => {
          const excelRowNumber = headerRowIdx + rowIdx + 2;
          let hasMissingValue = false;

          // Process demographics
          const rowDemos: Record<string, string> = {};
          Object.keys(CLIMA_DEMO_ALIASES).forEach(demoKey => {
            const colIdx = demoIndices[demoKey];
            let val = 'No Especificado';
            if (colIdx !== null && colIdx !== undefined && row[colIdx] !== undefined) {
              val = String(row[colIdx]).trim();
              if (!val) {
                val = 'No Especificado';
                hasMissingValue = true;
              }
            } else {
              hasMissingValue = true;
            }
            rowDemos[demoKey] = val;
          });

          // Process questions
          let rowRatingsCount = 0;
          let rowRatingsSum = 0;

          DEFAULT_CLIMA_QUESTIONS.forEach(q => {
            const colIdx = questionIndices[q.id];
            if (colIdx !== null && colIdx !== undefined && row[colIdx] !== undefined) {
              const rawVal = row[colIdx];
              const parsedVal = normalizeLikertValue(rawVal);
              
              if (parsedVal !== null) {
                questionData[q.id].ratings.push(parsedVal);
                questionData[q.id].count++;
                rowRatingsCount++;
                rowRatingsSum += parsedVal;

                if (parsedVal <= 2) {
                  questionData[q.id].unfavCount++;
                } else if (parsedVal === 3) {
                  questionData[q.id].neutCount++;
                } else {
                  questionData[q.id].favCount++;
                }
              } else {
                hasMissingValue = true;
                qualityIssues.push({
                  row: excelRowNumber,
                  variable: q.text,
                  value: String(rawVal || ''),
                  observation: 'Respuesta inválida o en blanco.'
                });
              }
            } else {
              hasMissingValue = true;
            }
          });

          if (hasMissingValue) {
            incompleteRecords++;
          }

          // Accumulate segment rating averages (only if row has ratings)
          if (rowRatingsCount > 0) {
            const rowAverage = rowRatingsSum / rowRatingsCount;
            
            Object.entries(rowDemos).forEach(([demoKey, demoVal]) => {
              if (!segmentCollectors[demoKey][demoVal]) {
                segmentCollectors[demoKey][demoVal] = [];
              }
              segmentCollectors[demoKey][demoVal].push(rowAverage);
            });
          }
        });

        // 1. Calculate Question Scores
        const questionScoresMap: Record<string, ClimateQuestionScore> = {};
        DEFAULT_CLIMA_QUESTIONS.forEach(q => {
          const stats = questionData[q.id];
          const total = stats.count;
          
          if (total > 0) {
            const sum = stats.ratings.reduce((a, b) => a + b, 0);
            questionScoresMap[q.id] = {
              questionId: q.id,
              text: q.text,
              average: Number((sum / total).toFixed(2)),
              favorability: Number(((stats.favCount / total) * 100).toFixed(1)),
              neutral: Number(((stats.neutCount / total) * 100).toFixed(1)),
              unfavorability: Number(((stats.unfavCount / total) * 100).toFixed(1)),
              count: total
            };
          } else {
            questionScoresMap[q.id] = {
              questionId: q.id,
              text: q.text,
              average: 0,
              favorability: 0,
              neutral: 0,
              unfavorability: 0,
              count: 0
            };
          }
        });

        // 2. Calculate Dimension Scores
        let globalSumOfAverages = 0;
        let globalSumOfFav = 0;
        let activeDimensionsCount = 0;

        const dimensionScores: ClimateDimensionScore[] = DEFAULT_CLIMA_DIMENSIONS.map(dim => {
          const qScores = dim.questions
            .map(qId => questionScoresMap[qId])
            .filter(score => score && score.count > 0);

          if (qScores.length > 0) {
            const sumAvg = qScores.reduce((sum, q) => sum + q.average, 0);
            const sumFav = qScores.reduce((sum, q) => sum + q.favorability, 0);
            const dimensionAverage = Number((sumAvg / qScores.length).toFixed(2));
            const dimensionFavorability = Number((sumFav / qScores.length).toFixed(1));

            globalSumOfAverages += dimensionAverage;
            globalSumOfFav += dimensionFavorability;
            activeDimensionsCount++;

            return {
              dimensionId: dim.id,
              name: dim.name,
              description: dim.description,
              average: dimensionAverage,
              favorability: dimensionFavorability,
              questionScores: dim.questions.map(qId => questionScoresMap[qId]).filter(Boolean)
            };
          }

          return {
            dimensionId: dim.id,
            name: dim.name,
            description: dim.description,
            average: 0,
            favorability: 0,
            questionScores: []
          };
        });

        const globalAverage = activeDimensionsCount > 0 
          ? Number((globalSumOfAverages / activeDimensionsCount).toFixed(2)) 
          : 0;
          
        const globalFavorability = activeDimensionsCount > 0 
          ? Number((globalSumOfFav / activeDimensionsCount).toFixed(1)) 
          : 0;

        // 3. Process Segmentations
        const processSegments = (demoKey: string): ClimateSegmentScore[] => {
          const segments = segmentCollectors[demoKey];
          return Object.entries(segments).map(([name, ratings]) => {
            if (ratings.length === 0) return { segmentName: name, average: 0, favorability: 0 };
            
            const sum = ratings.reduce((a, b) => a + b, 0);
            const avg = Number((sum / ratings.length).toFixed(2));
            
            // Standardizing favorability estimation for segments: 
            // Percentage of participant averages that are >= 3.8
            const favCount = ratings.filter(r => r >= 3.8).length;
            const fav = Number(((favCount / ratings.length) * 100).toFixed(1));
            
            return {
              segmentName: name,
              average: avg,
              favorability: fav
            };
          }).sort((a, b) => b.favorability - a.favorability);
        };

        const byCity = processSegments('ciudad');
        const byDepartment = processSegments('departamento');
        const byGender = processSegments('genero');
        const bySeniority = processSegments('antiguedad');

        // 4. Quality Report
        const totalPossibleVariables = Object.keys(CLIMA_DEMO_ALIASES).length + DEFAULT_CLIMA_QUESTIONS.length;
        const recognizedVariablesCount = Object.values(demoIndices).filter(idx => idx !== null).length + mappedQuestionsCount;
        const missingVariablesCount = totalPossibleVariables - recognizedVariablesCount;

        const qualityPercentage = Math.max(0, Math.min(100, Math.round(
          ((recognizedVariablesCount / totalPossibleVariables) * 50) +
          (((totalParticipants - incompleteRecords) / totalParticipants) * 50)
        )));

        let qualityLevel: 'Excelente' | 'Buena' | 'Regular' | 'Deficiente' = 'Deficiente';
        if (qualityPercentage >= 90) qualityLevel = 'Excelente';
        else if (qualityPercentage >= 75) qualityLevel = 'Buena';
        else if (qualityPercentage >= 50) qualityLevel = 'Regular';

        const warnings: string[] = [];
        if (missingVariablesCount > 0) {
          warnings.push(`Faltan ${missingVariablesCount} variables demográficas u opcionales para complementar los reportes.`);
        }
        if (incompleteRecords > (totalParticipants * 0.15)) {
          warnings.push(`Más del 15% de los registros (${incompleteRecords} filas) tienen datos incompletos o respuestas inválidas.`);
        }

        const dataQuality: ClimateDataQualityReport = {
          recordsRead: totalParticipants,
          recognizedVariablesCount,
          totalVariablesCount: totalPossibleVariables,
          missingVariablesCount,
          incompleteRecordsCount: incompleteRecords,
          qualityPercentage,
          qualityLevel,
          warnings,
          details: qualityIssues.slice(0, 50) // limit to first 50 logs to avoid overpopulation
        };

        // Complete ClimateData object
        const climateData: ClimateData = {
          totalParticipants,
          globalAverage,
          globalFavorability,
          dimensions: dimensionScores,
          byCity,
          byDepartment,
          byGender,
          bySeniority,
          rawEmployees: dataRows, // optional backup
          dataQuality
        };

        resolve({
          success: true,
          data: climateData
        });

      } catch (err: any) {
        resolve({ success: false, error: `Error procesando el archivo: ${err.message || err}` });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: 'Ocurrió un error al cargar el archivo de Excel.' });
    };

    reader.readAsArrayBuffer(file);
  });
}
