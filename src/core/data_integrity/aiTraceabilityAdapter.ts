/**
 * AI Traceability Adapter & Recommendation Formatter
 * Prompt 19 Specification - Sections 16, 17, 18
 */

import { IndicatorTraceability, RecommendationTraceability, SourceType } from './types';

export interface AITraceableContextItem {
  indicator: string;
  value: number | string | null;
  validRecords: number;
  totalRecords: number;
  coverage: number;
  source: SourceType;
  period?: string;
  variablesUsed: string[];
}

export class AITraceabilityAdapter {

  /**
   * Section 16: Prepares safe, fully traceable prompt context for AI models.
   * Guarantees AI receives complete indicator metadata (value, validRecords, totalRecords, coverage, source).
   */
  public static buildTraceableAIContext(indicators: IndicatorTraceability[]): {
    indicatorsContext: AITraceableContextItem[];
    aiPromptInstructions: string;
  } {
    const contextItems: AITraceableContextItem[] = indicators.map(ind => ({
      indicator: ind.indicatorName,
      value: ind.calculatedValue,
      validRecords: ind.validRecords,
      totalRecords: ind.totalRecords,
      coverage: ind.coveragePercentage || 0,
      source: ind.sourceType || 'ENCUESTA',
      period: ind.period || '2026',
      variablesUsed: [ind.sourceField]
    }));


    const aiPromptInstructions = `
REGLAS STRICTAS DE INTERPRETACIÓN DE IA (SG-SST PROMPT 19):
1. DIFERENCIACIÓN OBLIGATORIA: Distinga explícitamente entre:
   - DATO: Valor directo medido.
   - CÁLCULO: Operación matemática derivada.
   - INTERPRETACIÓN: Diagnóstico cualitativo basado en el dato.
   - RECOMENDACIÓN: Medida preventiva/correctiva sugerida.

2. PROHIBICIÓN DE SALTOS INFERENCIALES: No transforme un dato en otro sin medición explícita.
   Ejemplo: Un "55.8% con personas a cargo" NUNCA debe ser interpretado como "55.8% con conflicto familia-trabajo" a menos que exista una pregunta explícita sobre conflicto laboral.

3. DATOS SIN COBERTURA / NO DISPONIBLES:
   Si un indicador tiene valor NULL o cobertura < 70%, explicite que la muestra es insuficiente antes de emitir recomendaciones.

4. CERO SINTÉTICOS: Trabaje únicamente con los datos proporcionados en la lista.
    `;

    return {
      indicatorsContext: contextItems,
      aiPromptInstructions
    };
  }

  /**
   * Section 18: Formats AI recommendations to preserve traceability metadata.
   */
  public static createTraceableRecommendation(params: {
    recommendationId: string;
    indicatorId: string;
    indicatorName: string;
    reason: string;
    value: number | string | null;
    coveragePercentage: number;
    sourceType: SourceType;
    sampleCount: number;
    confidence: number;
    type: 'PREVENTIVA' | 'CORRECTIVA' | 'MEJORA' | 'SEGUIMIENTO';
  }): RecommendationTraceability {
    return {
      recommendationId: params.recommendationId,
      indicatorId: params.indicatorId,
      reason: params.reason,
      sourceData: {
        value: params.value,
        coveragePercentage: params.coveragePercentage,
        sourceType: params.sourceType,
        sampleCount: params.sampleCount
      },
      confidence: Math.min(100, Math.max(0, params.confidence)),
      type: params.type,
      aiInterpretationOnly: true
    };
  }
}
