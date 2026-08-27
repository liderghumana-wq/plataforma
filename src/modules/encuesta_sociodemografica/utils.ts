import { QuestionSchema, SurveyAnswers, SurveyErrors, SurveySection } from './types';

export const SURVEY_STORAGE_KEY = 'encuesta_sociodemografica_answers_v2';
export const SURVEY_STEP_STORAGE_KEY = 'encuesta_sociodemografica_step_v2';

/**
 * Save answers to localStorage
 */
export function saveAnswersToStorage(answers: SurveyAnswers, stepIndex: number): void {
  try {
    localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(answers));
    localStorage.setItem(SURVEY_STEP_STORAGE_KEY, stepIndex.toString());
  } catch (err) {
    console.warn('Could not save survey to localStorage:', err);
  }
}

/**
 * Load answers from localStorage
 */
export function loadAnswersFromStorage(): { answers: SurveyAnswers; stepIndex: number } {
  try {
    const rawAnswers = localStorage.getItem(SURVEY_STORAGE_KEY);
    const rawStep = localStorage.getItem(SURVEY_STEP_STORAGE_KEY);

    const answers = rawAnswers ? JSON.parse(rawAnswers) : {};
    const stepIndex = rawStep ? parseInt(rawStep, 10) : 0;

    return {
      answers,
      stepIndex: isNaN(stepIndex) ? 0 : stepIndex
    };
  } catch (err) {
    console.warn('Could not load survey from localStorage:', err);
    return { answers: {}, stepIndex: 0 };
  }
}

/**
 * Clear saved storage
 */
export function clearSurveyStorage(): void {
  try {
    localStorage.removeItem(SURVEY_STORAGE_KEY);
    localStorage.removeItem(SURVEY_STEP_STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear survey storage:', err);
  }
}

/**
 * Calculate IMC (Índice de Masa Corporal) from weight (kg) and height (cm)
 */
export function calculateIMC(weightKg?: number, heightCm?: number): { imc: number | null; label: string; color: string } {
  if (!weightKg || !heightCm || weightKg < 30 || weightKg > 250 || heightCm < 100 || heightCm > 230) {
    return { imc: null, label: 'Pendiente de datos válidos', color: 'text-slate-400' };
  }

  const heightM = heightCm / 100;
  const imcRaw = weightKg / (heightM * heightM);
  const imc = parseFloat(imcRaw.toFixed(1));

  if (imc < 18.5) {
    return { imc, label: `${imc} - Bajo Peso`, color: 'text-amber-600 bg-amber-50 border-amber-200' };
  } else if (imc <= 24.9) {
    return { imc, label: `${imc} - Peso Normal (Saludable)`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  } else if (imc <= 29.9) {
    return { imc, label: `${imc} - Sobrepeso`, color: 'text-amber-700 bg-amber-50 border-amber-200' };
  } else {
    return { imc, label: `${imc} - Obesidad`, color: 'text-rose-700 bg-rose-50 border-rose-200' };
  }
}

/**
 * Sanitize text input to prevent invalid characters / injection
 */
export function sanitizeInput(value: string): string {
  if (typeof value !== 'string') return '';
  return value.replace(/[<>{}"]/g, '').trim();
}

/**
 * Validate a single question field
 */
export function validateQuestion(question: QuestionSchema, value: any, allAnswers: SurveyAnswers = {}): string | null {
  // If field is computed (e.g. IMC), no manual validation needed
  if (question.computed) return null;

  // 1. Required Check
  if (question.required) {
    if (value === undefined || value === null || value === '') {
      return `El campo "${question.label}" es obligatorio.`;
    }
    if (Array.isArray(value) && value.length === 0) {
      return `Debe seleccionar al menos una opción en "${question.label}".`;
    }
    if (question.type === 'checkbox' && value !== true && value !== 'true') {
      return `Debe aceptar "${question.label}" para continuar.`;
    }
  }

  // If value is empty and not required, skip further checks
  if (value === undefined || value === null || value === '') {
    return null;
  }

  // 2. Email format validation
  if (question.type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) {
      return 'Ingrese una dirección de correo electrónico válida (ejemplo@dominio.com).';
    }
  }

  // 3. Phone format validation
  if (question.type === 'phone') {
    const phoneRegex = /^[0-9]{7,12}$/;
    if (!phoneRegex.test(String(value).replace(/[\s-]/g, ''))) {
      return 'El número de teléfono debe contener entre 7 y 12 dígitos numéricos.';
    }
  }

  // 4. Number range validation
  if (question.type === 'number') {
    const num = Number(value);
    if (isNaN(num)) {
      return 'Ingrese un valor numérico válido.';
    }

    if (question.validation?.min !== undefined && num < question.validation.min) {
      return question.validation.customErrorMsg || `El valor mínimo permitido es ${question.validation.min}.`;
    }

    if (question.validation?.max !== undefined && num > question.validation.max) {
      return question.validation.customErrorMsg || `El valor máximo permitido es ${question.validation.max}.`;
    }
  }

  // 5. Date & Min Age Validation
  if (question.type === 'date') {
    if (question.validation?.minAge) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < question.validation.minAge) {
        return `El colaborador debe ser mayor de ${question.validation.minAge} años.`;
      }
    }
  }

  // 6. Pattern Regex Validation
  if (question.validation?.pattern) {
    const regex = new RegExp(question.validation.pattern);
    if (!regex.test(String(value))) {
      return question.validation.customErrorMsg || 'El formato ingresado no es válido.';
    }
  }

  return null;
}

/**
 * Validate all questions in a given section
 */
export function validateSection(section: SurveySection, answers: SurveyAnswers): SurveyErrors {
  const errors: SurveyErrors = {};

  section.questions.forEach(q => {
    const errorMsg = validateQuestion(q, answers[q.id], answers);
    if (errorMsg) {
      errors[q.id] = errorMsg;
    }
  });

  return errors;
}

/**
 * Calculate total completion progress percentage across all questions
 */
export function calculateTotalProgress(sections: SurveySection[], answers: SurveyAnswers): { completedCount: number; totalCount: number; percentage: number } {
  let totalCount = 0;
  let completedCount = 0;

  sections.forEach(sec => {
    sec.questions.forEach(q => {
      if (q.computed) return; // Skip computed fields from total question count
      totalCount++;
      const val = answers[q.id];
      if (val !== undefined && val !== null && val !== '' && !(Array.isArray(val) && val.length === 0)) {
        completedCount++;
      }
    });
  });

  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return { completedCount, totalCount, percentage };
}
