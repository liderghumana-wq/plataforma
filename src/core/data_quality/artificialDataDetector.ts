/**
 * PROMPT 36 — ARTIFICIAL DATA DETECTOR
 * Detects suspicious fallbacks or default values assigned without an original response in source.
 */

export interface ArtificialDataWarning {
  fieldKey: string;
  variableName: string;
  detectedValue: any;
  reason: string;
  affectedRowsCount: number;
  sampleRows: number[];
  recommendation: string;
}

export class ArtificialDataDetector {
  /**
   * Scans a dataset for signs of artificial defaults or unbacked fallbacks.
   */
  public static detectArtificialData(records: Record<string, any>[]): ArtificialDataWarning[] {
    const warnings: ArtificialDataWarning[] = [];
    if (!records || records.length === 0) return warnings;

    // Check 1: Suspicious uniformity in categorical fields
    const checkFields = [
      { key: 'tipoContrato', name: 'Tipo de Contrato', suspiciousValues: ['término indefinido', 'indefinido'] },
      { key: 'ciudad', name: 'Ciudad de Labor', suspiciousValues: ['bogotá', 'bogota'] },
      { key: 'area', name: 'Área / Departamento', suspiciousValues: ['operaciones'] },
      { key: 'estadoCivil', name: 'Estado Civil', suspiciousValues: ['soltero', 'soltero(a)'] }
    ];

    for (const field of checkFields) {
      const values = records.map(r => r[field.key]).filter(v => v !== undefined && v !== null && String(v).trim() !== '');
      if (values.length > 0) {
        const suspiciousCount = values.filter(v => 
          field.suspiciousValues.some(s => String(v).trim().toLowerCase() === s)
        ).length;

        // If 100% of non-empty records have the exact same default suspicious value and dataset > 4
        if (suspiciousCount === records.length && records.length >= 4) {
          warnings.push({
            fieldKey: field.key,
            variableName: field.name,
            detectedValue: values[0],
            reason: `El 100% de los registros (${suspiciousCount}/${records.length}) contiene el valor predeterminado '${values[0]}'. Verifique si fue asignado automáticamente sin respuesta en la encuesta o Excel fuente.`,
            affectedRowsCount: suspiciousCount,
            sampleRows: [1, 2, 3, 4, 5],
            recommendation: 'Verifique si este dato proviene de la fuente o si fue completado como fallback por un script.'
          });
        }
      }
    }

    // Check 2: Suspicious hardcoded average numeric defaults (e.g. weight=72.5, height=1.68)
    const exactHeightMatches: number[] = [];
    const exactWeightMatches: number[] = [];

    records.forEach((r, idx) => {
      if (r.estatura === 1.68 || r.estaturaMts === 1.68 || r.estatura === 168) {
        exactHeightMatches.push(idx + 1);
      }
      if (r.peso === 72.5 || r.pesoKg === 72.5) {
        exactWeightMatches.push(idx + 1);
      }
    });

    if (exactHeightMatches.length >= 3) {
      warnings.push({
        fieldKey: 'estatura',
        variableName: 'Estatura',
        detectedValue: 1.68,
        reason: `Se detectaron ${exactHeightMatches.length} registros con la estatura exacta de 1.68m (posible fallback artificial).`,
        affectedRowsCount: exactHeightMatches.length,
        sampleRows: exactHeightMatches.slice(0, 5),
        recommendation: 'Eliminar el fallback artificial de estatura y clasificar los registros vacíos como MISSING.'
      });
    }

    if (exactWeightMatches.length >= 3) {
      warnings.push({
        fieldKey: 'peso',
        variableName: 'Peso',
        detectedValue: 72.5,
        reason: `Se detectaron ${exactWeightMatches.length} registros con el peso exacto de 72.5kg (posible fallback artificial).`,
        affectedRowsCount: exactWeightMatches.length,
        sampleRows: exactWeightMatches.slice(0, 5),
        recommendation: 'Eliminar el fallback artificial de peso y clasificar los registros vacíos como MISSING.'
      });
    }

    return warnings;
  }
}
