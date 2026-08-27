import { 
  SurveyConfig, 
  UniversalSurveyAnalysis, 
  DimensionResult, 
  QuestionResult, 
  FormulaResult, 
  ChartResult, 
  InterpretationResult,
  ChartDataset
} from './encuestas.types';

/**
 * Smart matching helper to find column indices by case-insensitive name or aliases
 */
function findHeaderColumn(headers: string[], aliases: string[]): string | null {
  const normAliases = aliases.map(a => a.toLowerCase().trim());
  for (const header of headers) {
    const normHeader = header.toLowerCase().trim();
    if (normAliases.some(alias => normHeader.includes(alias) || alias.includes(normHeader))) {
      return header;
    }
  }
  return null;
}

/**
 * Normalizes a cell value based on configuration options
 */
function normalizeCellValue(val: any, config: SurveyConfig, inverted?: boolean): number | null {
  if (val === undefined || val === null) return null;
  
  // If already a number
  let num = Number(val);
  if (!isNaN(num) && num >= 1 && num <= 10) {
    if (inverted && config.responseType === 'Likert5') {
      return 6 - num;
    }
    return num;
  }

  // If string, match against aliases in options
  const strVal = String(val).toLowerCase().trim();
  for (const opt of config.options) {
    const matched = opt.label.toLowerCase() === strVal || 
                    opt.aliases.some(alias => strVal.includes(alias.toLowerCase()));
    if (matched) {
      if (inverted && config.responseType === 'Likert5') {
        return 6 - opt.value;
      }
      return opt.value;
    }
  }

  // Try to parse direct digits inside the string
  const digits = strVal.match(/\d+/);
  if (digits) {
    const parsedNum = Number(digits[0]);
    if (inverted && config.responseType === 'Likert5') {
      return 6 - parsedNum;
    }
    return parsedNum;
  }

  return null;
}

/**
 * Main mathematical analyzer of the Universal Survey Engine
 */
export function analyzeUniversalSurvey(
  config: SurveyConfig, 
  rawRows: Record<string, any>[]
): UniversalSurveyAnalysis {
  if (!rawRows || rawRows.length === 0) {
    throw new Error("No hay registros para analizar.");
  }

  const headers = Object.keys(rawRows[0]);
  const totalRecords = rawRows.length;

  // 1. Map columns to question configurations
  const columnMapping: Record<string, string> = {}; // questionId -> excelHeader
  config.questions.forEach(q => {
    const matchedHeader = findHeaderColumn(headers, [q.text, ...q.aliases]);
    if (matchedHeader) {
      columnMapping[q.id] = matchedHeader;
    }
  });

  // 2. Aggregate scores per question and dimension
  const questionScores: Record<string, number[]> = {};
  config.questions.forEach(q => { questionScores[q.id] = []; });

  rawRows.forEach(row => {
    config.questions.forEach(q => {
      const colHeader = columnMapping[q.id];
      if (colHeader) {
        const rawVal = row[colHeader];
        const normalized = normalizeCellValue(rawVal, config, q.inverted);
        if (normalized !== null) {
          questionScores[q.id].push(normalized);
        }
      }
    });
  });

  // 3. Calculate Question Results
  const questionsResults: QuestionResult[] = config.questions.map(q => {
    const scores = questionScores[q.id] || [];
    const count = scores.length;
    
    if (count === 0) {
      return { questionId: q.id, text: q.text, average: 0, favorability: 0, totalResponses: 0 };
    }

    const sum = scores.reduce((a, b) => a + b, 0);
    const average = Math.round((sum / count) * 100) / 100;

    // Calculate favorability: scores >= 4 for Likert5, or top 50% for others
    let favorableCount = 0;
    if (config.responseType === 'Likert5') {
      favorableCount = scores.filter(s => s >= 4).length;
    } else {
      favorableCount = scores.filter(s => s >= 3.5).length; // General threshold
    }
    const favorability = Math.round((favorableCount / count) * 100);

    return {
      questionId: q.id,
      text: q.text,
      average,
      favorability,
      totalResponses: count
    };
  });

  // 4. Calculate Dimension Results
  const dimensionsResults: DimensionResult[] = config.dimensions.map(d => {
    const dimQuestions = questionsResults.filter(q => {
      const qConfig = config.questions.find(qc => qc.id === q.questionId);
      return qConfig?.dimensionId === d.id;
    });

    const activeQuestions = dimQuestions.filter(q => q.totalResponses > 0);
    if (activeQuestions.length === 0) {
      return { dimensionId: d.id, name: d.name, description: d.description, average: 0, favorability: 0 };
    }

    const avgSum = activeQuestions.reduce((a, b) => a + b.average, 0);
    const favSum = activeQuestions.reduce((a, b) => a + b.favorability, 0);

    return {
      dimensionId: d.id,
      name: d.name,
      description: d.description,
      average: Math.round((avgSum / activeQuestions.length) * 100) / 100,
      favorability: Math.round(favSum / activeQuestions.length)
    };
  });

  // 5. Calculate Formulas
  const formulasResults: FormulaResult[] = config.formulas.map(form => {
    let value = 0;
    if (form.expression === 'AVERAGE') {
      if (form.targetDimensionIds && form.targetDimensionIds.length > 0) {
        const targets = dimensionsResults.filter(d => form.targetDimensionIds?.includes(d.dimensionId));
        const sum = targets.reduce((a, b) => a + b.average, 0);
        value = targets.length > 0 ? Math.round((sum / targets.length) * 100) / 100 : 0;
      } else if (form.targetQuestionIds && form.targetQuestionIds.length > 0) {
        const targets = questionsResults.filter(q => form.targetQuestionIds?.includes(q.questionId));
        const sum = targets.reduce((a, b) => a + b.average, 0);
        value = targets.length > 0 ? Math.round((sum / targets.length) * 100) / 100 : 0;
      }
    } else if (form.expression === 'FAVORABILITY_PCT') {
      if (form.targetDimensionIds && form.targetDimensionIds.length > 0) {
        const targets = dimensionsResults.filter(d => form.targetDimensionIds?.includes(d.dimensionId));
        const sum = targets.reduce((a, b) => a + b.favorability, 0);
        value = targets.length > 0 ? Math.round(sum / targets.length) : 0;
      }
    }
    return { formulaId: form.id, name: form.name, value };
  });

  // 6. Generate Charts
  const chartsResults: ChartResult[] = config.charts.map(c => {
    let dataset: ChartDataset[] = [];
    if (c.dataSource === 'DIMENSIONS') {
      dataset = dimensionsResults.map(d => ({
        label: d.name,
        value: d.favorability
      }));
    } else if (c.dataSource === 'QUESTIONS' && c.dimensionIds) {
      // Find questions in specified dimensions
      const targetQuestionIds = config.questions
        .filter(q => c.dimensionIds?.includes(q.dimensionId))
        .map(q => q.id);
      dataset = questionsResults
        .filter(q => targetQuestionIds.includes(q.questionId))
        .map(q => ({
          label: q.text.substring(0, 30) + '...',
          value: q.favorability
        }));
    }

    return {
      chartId: c.id,
      title: c.title,
      type: c.type,
      data: dataset
    };
  });

  // 7. Fire Threshold-Based Interpretations
  const interpretationsResults: InterpretationResult[] = [];
  config.interpretations.forEach(rule => {
    // Check if rule metric targets a dimension or formula
    const dimMatch = dimensionsResults.find(d => d.dimensionId === rule.metricId);
    const formMatch = formulasResults.find(f => f.formulaId === rule.metricId);

    const val = dimMatch ? dimMatch.favorability : (formMatch ? formMatch.value : null);

    if (val !== null && val >= rule.minVal && val <= rule.maxVal) {
      interpretationsResults.push({
        ruleId: rule.id,
        title: rule.title,
        text: rule.text,
        level: rule.level,
        currentValue: val
      });
    }
  });

  return {
    surveyId: config.id,
    surveyName: config.name,
    totalRecords,
    dimensions: dimensionsResults,
    questions: questionsResults,
    formulas: formulasResults,
    charts: chartsResults,
    interpretations: interpretationsResults
  };
}
