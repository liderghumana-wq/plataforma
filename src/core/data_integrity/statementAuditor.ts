/**
 * Qualitative Statement & Report Audit Engine
 * Prompt 19 Specification - Section 15 (AFIRMACIÓN SIN TRAZABILIDAD)
 */

import { StatementAuditResult } from './types';

export class StatementAuditor {
  private static QUALITATIVE_TERMS = [
    'la mayoría',
    'principalmente',
    'predomina',
    'alto',
    'bajo',
    'significativo',
    'crítico',
    'mayormente',
    'frecuentemente',
    'elevado',
    'masivo'
  ];

  /**
   * Audits a text statement against available indicator data.
   * Marks "AFIRMACIÓN SIN TRAZABILIDAD" if qualitative terms are used without backed indicator data.
   */
  public static auditStatement(
    statementId: string,
    text: string,
    backedIndicatorId?: string,
    indicatorValue?: number | string | null,
    coveragePercentage?: number
  ): StatementAuditResult {
    const lowerText = text.toLowerCase();
    const detectedTerms = this.QUALITATIVE_TERMS.filter(term => lowerText.includes(term));
    const containsQualitativeTerm = detectedTerms.length > 0;

    const isBackedByData = Boolean(
      backedIndicatorId && 
      indicatorValue !== undefined && 
      indicatorValue !== null && 
      (coveragePercentage === undefined || coveragePercentage > 0)
    );

    // If qualitative terms are present but NOT backed by an indicator, mark as UNBACKED
    const status = (containsQualitativeTerm && !isBackedByData) 
      ? 'AFIRMACIÓN SIN TRAZABILIDAD' 
      : 'TRAZABLE';

    return {
      statementId,
      originalText: text,
      indicatorId: backedIndicatorId,
      isBackedByData,
      containsQualitativeTerm,
      detectedTerms,
      status,
      backedValue: indicatorValue !== null ? indicatorValue : undefined,
      coveragePercentage
    };
  }

  /**
   * Scans a full executive text/report paragraph and extracts audit statuses for all detected qualitative assertions.
   */
  public static auditFullText(
    text: string, 
    backedIndicatorsMap: Record<string, { value: any; coveragePercentage: number }> = {}
  ): StatementAuditResult[] {
    const sentences = text.split(/(?<=[.!?])\s+/);
    
    return sentences.map((sentence, idx) => {
      // Check if sentence references an indicator
      let matchedIndicatorId: string | undefined = undefined;
      let matchedData: { value: any; coveragePercentage: number } | undefined = undefined;

      for (const [indId, data] of Object.entries(backedIndicatorsMap)) {
        if (sentence.toLowerCase().includes(indId.toLowerCase())) {
          matchedIndicatorId = indId;
          matchedData = data;
          break;
        }
      }

      return this.auditStatement(
        `STMT-${idx + 1}`,
        sentence,
        matchedIndicatorId,
        matchedData?.value,
        matchedData?.coveragePercentage
      );
    });
  }
}
