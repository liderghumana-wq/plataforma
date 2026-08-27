/**
 * PROMPT 29 — RELIABLE METRIC & DENOMINATOR CALCULATOR
 * Enforces strict denominator calculations, coverage metrics, and executive phrasing.
 * Eliminates synthetic metrics or false 0% defaults when data is missing.
 */

import { ReliableMetric, MetricQualityLevel, MetricValidityStatus } from './types';

export interface ComputeMetricParams {
  metricId: string;
  title: string;
  numerator: number;
  denominator: number;
  totalTargetPopulation: number;
  minCoverageRequiredPct?: number; // default 30%
  source?: string;
  period?: string;
}

export class MetricCalculatorP29 {

  /**
   * Section 28 & 29: Computes a reliable metric with numerator, denominator, and coverage.
   */
  public static computeMetric(params: ComputeMetricParams): ReliableMetric {
    const {
      metricId,
      title,
      numerator,
      denominator,
      totalTargetPopulation,
      minCoverageRequiredPct = 30,
      source = 'Censo Sociodemográfico & SG-SST',
      period = '2026-Q1'
    } = params;

    // Coverage = (denominator / totalTargetPopulation) * 100
    const coveragePct = totalTargetPopulation > 0
      ? Number(((denominator / totalTargetPopulation) * 100).toFixed(1))
      : 0;

    // Check if data is sufficient
    if (denominator === 0 || coveragePct < minCoverageRequiredPct) {
      return {
        metricId,
        title,
        value: null,
        numerator,
        denominator,
        coveragePct,
        dataQuality: 'SIN_DATOS',
        status: denominator === 0 ? 'NO_DATA' : 'INSUFFICIENT_DATA',
        displayText: 'Sin información disponible',
        executiveSummary: `Métrica "${title}": Sin información disponible (cobertura del ${coveragePct}% insuficiente frente al mínimo requerido del ${minCoverageRequiredPct}%).`,
        metadata: {
          source,
          period,
          analyzedPopulation: denominator,
          totalTargetPopulation,
          updateDate: new Date().toISOString().split('T')[0]
        }
      };
    }

    // Value percentage over denominator
    const rawVal = (numerator / denominator) * 100;
    const value = Number(rawVal.toFixed(1));

    let dataQuality: MetricQualityLevel = 'BAJA';
    let status: MetricValidityStatus = 'VALID_WITH_LIMITATIONS';

    if (coveragePct >= 85) {
      dataQuality = 'ALTA';
      status = 'VALID';
    } else if (coveragePct >= 50) {
      dataQuality = 'MEDIA';
      status = 'VALID_WITH_LIMITATIONS';
    }

    // Section 30: "52% entre quienes respondieron (Cobertura: 32%)"
    const displayText = `${value}% entre quienes respondieron (${numerator}/${denominator} colaboradores, Cobertura: ${coveragePct}%)`;
    const executiveSummary = `En el periodo ${period}, el ${value}% de la población analizada (${numerator} de ${denominator} con respuesta válida, cobertura del ${coveragePct}%) presenta ${title.toLowerCase()}. Calidad del dato: ${dataQuality}.`;

    return {
      metricId,
      title,
      value,
      numerator,
      denominator,
      coveragePct,
      dataQuality,
      status,
      displayText,
      executiveSummary,
      metadata: {
        source,
        period,
        analyzedPopulation: denominator,
        totalTargetPopulation,
        updateDate: new Date().toISOString().split('T')[0]
      }
    };
  }

  /**
   * Section 26: Formats warning banner for executive reports generated with partial data
   */
  public static buildQualityWarningBanner(coveragePct: number, qualityScore: number): string {
    return `Advertencia de Calidad de Datos: La información disponible presenta una completitud/cobertura del ${coveragePct}% y un puntaje global de calidad de ${qualityScore}%. Los indicadores relacionados con variables con información insuficiente deben interpretarse con precaución y no representan a la totalidad de la población laboral.`;
  }
}
