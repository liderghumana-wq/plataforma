/**
 * PROMPT 22 — HELPER UTILITIES FOR "OTRO" OPTIONS & SPECIFICATIONS ("¿Cuál?")
 * Provides standardized detection, storage formatting, validation, and display for "Otro" selections.
 */

export interface OtroResponseObject {
  option: string;
  otherValue: string;
}

/**
 * Checks whether an option label or value represents an "Otro" / "Otra" variant.
 */
export function isOtroOption(labelOrValue: string | undefined | null): boolean {
  if (!labelOrValue) return false;
  const normalized = String(labelOrValue).trim().toLowerCase();
  
  return (
    normalized === 'otro' ||
    normalized === 'otra' ||
    normalized === 'otro/a' ||
    normalized === 'otro, ¿cuál?' ||
    normalized === 'otra, ¿cuál?' ||
    normalized === 'otro, ¿cual?' ||
    normalized === 'otra, ¿cual?' ||
    normalized === 'otro (especifique)' ||
    normalized === 'otra (especifique)' ||
    normalized.startsWith('otro,') ||
    normalized.startsWith('otra,') ||
    normalized.startsWith('otro (') ||
    normalized.startsWith('otra (')
  );
}

/**
 * Parses any response value to extract if it's an "Otro" selection and its specification.
 */
export function parseOtroValue(value: any): {
  isOtro: boolean;
  option: string;
  otherValue: string;
} {
  if (value === null || value === undefined) {
    return { isOtro: false, option: '', otherValue: '' };
  }

  // Object format: { option: "OTRO", otherValue: "Cuidado de un familiar" }
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const opt = value.option ? String(value.option) : '';
    const oth = value.otherValue ? String(value.otherValue) : '';
    const isOtro = isOtroOption(opt);
    return { isOtro, option: opt || (isOtro ? 'OTRO' : ''), otherValue: oth };
  }

  // String format
  if (typeof value === 'string') {
    const isOtro = isOtroOption(value);
    return { isOtro, option: value, otherValue: '' };
  }

  return { isOtro: false, option: String(value), otherValue: '' };
}

/**
 * Validates if an "Otro" response is properly completed with its mandatory specification.
 */
export function validateOtroResponse(value: any): {
  isValid: boolean;
  error?: string;
} {
  const { isOtro, otherValue } = parseOtroValue(value);
  if (!isOtro) {
    return { isValid: true };
  }

  if (!otherValue || otherValue.trim() === '') {
    return {
      isValid: false,
      error: 'Debe diligenciar el campo obligatorio "¿Cuál?" al seleccionar "Otro".'
    };
  }

  return { isValid: true };
}

/**
 * Returns formatted display text for reports, dashboards, and tables.
 * Example: Shows "Cuidado de un familiar" instead of just "Otro".
 */
export function getOtroDisplayText(value: any): string {
  if (value === null || value === undefined || value === '') return 'N/A';

  const { isOtro, option, otherValue } = parseOtroValue(value);
  if (isOtro) {
    if (otherValue && otherValue.trim()) {
      return `Otro: ${otherValue.trim()}`;
    }
    return option || 'Otro (Sin especificar)';
  }

  if (typeof value === 'object') {
    return value.option || JSON.stringify(value);
  }

  return String(value);
}

/**
 * Gets exact key-value pairs for Excel exports as mandated by Prompt 22:
 * - respuesta: "OTRO"
 * - respuestaOtro: "Cuidado de un familiar"
 */
export function formatOtroForExcel(questionKey: string, value: any): Record<string, string> {
  const { isOtro, option, otherValue } = parseOtroValue(value);
  
  const result: Record<string, string> = {};
  if (isOtro) {
    result[questionKey] = option || 'OTRO';
    result[`${questionKey}Otro`] = otherValue || '';
  } else {
    result[questionKey] = typeof value === 'object' && value?.option ? value.option : String(value || '');
    result[`${questionKey}Otro`] = '';
  }

  return result;
}
