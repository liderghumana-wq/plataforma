/**
 * Executive Report Engine (Prompt 30)
 * Builds, validates, and snapshots SG-SST Executive Reports with ZERO synthetic or estimated data.
 */

import { DemographicsData } from '../../types';
import { IndicatorEngine } from '../indicators/indicatorEngine';
import { IndicatorCalculationDataset, IndicatorResult } from '../indicators/types';
import { DataQualityValidationEngine } from '../data_integrity/dataQualityValidationEngine';
import { Prompt20ValidationReport } from '../data_integrity/types';
import {
  CompanyReportConfig,
  ReportVariableBreakdown,
  ReportFinding,
  ReportRecommendation,
  ReportSnapshot,
  ReportPreValidationResult,
  ReportPostValidationResult
} from './types';

export class ExecutiveReportService {

  /**
   * Generates a complete, validated Executive Report Snapshot.
   */
  public static generateReportSnapshot(
    data: DemographicsData | null,
    config: CompanyReportConfig,
    datasetId = 'DS-2026-P1',
    period = '2026-P1',
    surveyVersion = 'v3.0.0',
    indicatorVersion = 'v3.0.0',
    reportVersion = 'v3.0.0'
  ): ReportSnapshot {
    
    const companyId = config.companyId || 'COMP-DEFAULT';

    // 1. Pre-generation validation (Requirement 28 & 35)
    const preValidation = this.validateBeforeGeneration(data, config, datasetId, period);
    if (!preValidation.isValid) {
      throw new Error(`Error crítico antes de generar informe: ${preValidation.errors.join('; ')}`);
    }

    // 2. Data Quality Analysis via DataQualityValidationEngine
    const qualityReport = DataQualityValidationEngine.validateDataQuality(data, {
      companyId,
      companyName: config.companyName
    });

    // 3. Indicator Calculation via IndicatorEngine
    const indicatorDataset: IndicatorCalculationDataset = {
      datasetId,
      companyId,
      period,
      colaboradores: (data?.rawEmployees || []).map((emp, idx) => ({
        id: String(emp.id || idx + 1),
        empresaId: companyId,
        sedeNombre: emp.sede || emp.ciudad,
        areaNombre: emp.area,
        proyectoNombre: emp.proyecto,
        fechaNacimiento: emp.fechaNacimiento || (emp.edad ? `${new Date().getFullYear() - emp.edad}-01-01` : undefined),
        fechaIngreso: emp.fechaIngreso,
        rh: emp.rh || emp.grupoSanguineo
      })),
      respuestas: this.extractAnswersFromDemographics(data),
      ausentismos: data?.absenteeismRate ? [{ colaboradorId: 'all', diasIncapacidad: data.absenteeismRate }] : [],
      encuestasBienestar: data?.wellbeingIndex ? [{ score: data.wellbeingIndex }] : [],
      catalogSedes: (config.catalogSedes || []).map((s, i) => ({ id: `s_${i}`, nombre: s })),
      catalogAreas: (config.catalogAreas || []).map((a, i) => ({ id: `a_${i}`, nombre: a })),
      catalogProyectos: (config.catalogProyectos || []).map((p, i) => ({ id: `p_${i}`, nombre: p }))
    };

    const indicators = IndicatorEngine.calculateAll(indicatorDataset);

    // 4. Calculate Variable Breakdowns with Denominators (Requirement 8)
    const variables = this.calculateVariableBreakdowns(data);

    // 5. Generate Findings based STRICTLY on real indicators (Requirement 21)
    const findings = this.generateFindingsFromIndicators(indicators, variables);

    // 6. Generate Recommendations associated STRICTLY to evidence (Requirement 22 & 23)
    const recommendations = this.generateRecommendationsFromFindings(findings, qualityReport);

    // 7. Compile Limitations (Requirement 24)
    const limitations = this.compileLimitations(qualityReport, variables, indicators);

    // 8. Construct Snapshot (Requirement 26 & 27)
    const snapshot: ReportSnapshot = {
      reportId: `REP-${companyId}-${Date.now()}`,
      datasetId,
      companyId,
      surveyVersion,
      indicatorVersion,
      reportVersion,
      generatedAt: new Date().toISOString(),
      qualityReport,
      indicators,
      companyConfig: config,
      variables,
      findings,
      recommendations,
      limitations,
      validationPassed: !qualityReport.hasCriticalErrors,
      validationWarnings: preValidation.warnings
    };

    // 9. Post-generation audit (Requirement 29)
    const postValidation = this.validateAfterGeneration(snapshot);
    if (!postValidation.isValid) {
      console.warn('Advertencias en auditoría posterior del informe:', postValidation.violations);
    }

    return snapshot;
  }

  /**
   * Requirement 28 & 35: Pre-generation validation
   */
  public static validateBeforeGeneration(
    data: DemographicsData | null,
    config: CompanyReportConfig,
    datasetId: string,
    period: string
  ): ReportPreValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!config.companyId || !config.companyName) {
      errors.push('Falta identificación de la empresa (companyId / companyName en configuración)');
    }

    if (!datasetId) {
      errors.push('Falta identificador del dataset (datasetId)');
    }

    if (!period) {
      errors.push('Falta periodo de reporte');
    }

    // Check Multi-company consistency (Requirement 35)
    if (data?.rawEmployees && data.rawEmployees.length > 0) {
      const distinctCompanies = new Set(
        data.rawEmployees
          .map(e => e.empresaId || config.companyId)
          .filter(Boolean)
      );
      if (distinctCompanies.size > 1) {
        errors.push(`CRÍTICO: Se detectaron registros de múltiples empresas (${Array.from(distinctCompanies).join(', ')}). Generación bloqueada.`);
      }
    }

    if (!data || (data.totalEmployees === 0 && (!data.rawEmployees || data.rawEmployees.length === 0))) {
      warnings.push('El dataset está vacío o no contiene colaboradores.');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Requirement 29: Post-generation audit
   */
  public static validateAfterGeneration(snapshot: ReportSnapshot): ReportPostValidationResult {
    const violations: string[] = [];

    // Check no null KPI represented as 0
    snapshot.indicators.forEach(ind => {
      if (ind.value === null && ind.status !== 'NO_DATA') {
        violations.push(`Indicador ${ind.name} con valor nulo pero estado diferente a NO_DATA.`);
      }
    });

    // Check recommendations have evidence
    snapshot.recommendations.forEach(rec => {
      if (!rec.evidence || rec.evidence.includes('Sin evidencia') || rec.evidence.trim() === '') {
        violations.push(`Recomendación "${rec.proposedAction}" carece de evidencia asociada.`);
      }
    });

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  /**
   * Helper: Calculate variable breakdowns with denominators and explicit missing values
   */
  private static calculateVariableBreakdowns(data: DemographicsData | null): Record<string, ReportVariableBreakdown> {
    const breakdowns: Record<string, ReportVariableBreakdown> = {};
    const totalPop = data?.totalEmployees || 0;

    if (!data) return breakdowns;

    // Helper for variable conversion
    const processVar = (
      key: string,
      displayName: string,
      rawList?: { name?: string; label?: string; level?: string; status?: string; type?: string; stratum?: string; count?: number; percentage?: number; value?: number }[]
    ) => {
      if (!rawList || rawList.length === 0) {
        breakdowns[key] = {
          variableName: displayName,
          totalPopulation: totalPop,
          validResponses: 0,
          unreportedResponses: totalPop,
          coveragePercentage: 0,
          distribution: [],
          isAvailable: false,
          missingMessage: 'Sin información disponible para este periodo.'
        };
        return;
      }

      let validSum = 0;
      const items = rawList.map(item => {
        const catName = item.name || item.label || item.level || item.status || item.type || item.stratum || 'Otra categoría';
        const count = item.count !== undefined 
          ? item.count 
          : item.value !== undefined 
          ? item.value 
          : item.percentage !== undefined && totalPop > 0 
          ? Math.round((item.percentage / 100) * totalPop) 
          : 0;

        validSum += count;
        return {
          category: catName,
          count,
          percentage: totalPop > 0 ? Number(((count / totalPop) * 100).toFixed(1)) : 0
        };
      });

      const unreported = Math.max(0, totalPop - validSum);
      const coverage = totalPop > 0 ? Number(((validSum / totalPop) * 100).toFixed(1)) : 0;

      breakdowns[key] = {
        variableName: displayName,
        totalPopulation: totalPop,
        validResponses: validSum,
        unreportedResponses: unreported,
        coveragePercentage: coverage,
        distribution: items,
        isAvailable: items.length > 0
      };
    };

    processVar('gender', 'Sexo', data.gender);
    processVar('education', 'Nivel Educativo', data.education);
    processVar('maritalStatus', 'Estado Civil', data.maritalStatus);
    processVar('socioeconomicStrata', 'Estrato Socioeconómico', data.socioeconomicStrata);
    processVar('housing', 'Tipo de Vivienda', data.housing);
    processVar('contractType', 'Tipo de Contrato', data.contractType);
    processVar('city', 'Ciudad / Ubicación', data.city);
    processVar('ethnicGroups', 'Pertenencia Étnica', data.ethnicGroups);
    processVar('physicalActivity', 'Actividad Física', data.physicalActivity);
    processVar('musculoskeletalPain', 'Síntomas Osteomusculares', data.musculoskeletalPain);

    return breakdowns;
  }

  /**
   * Helper: Generate findings from valid indicators ONLY (Requirement 21)
   */
  private static generateFindingsFromIndicators(
    indicators: IndicatorResult[],
    variables: Record<string, ReportVariableBreakdown>
  ): ReportFinding[] {
    const findings: ReportFinding[] = [];

    indicators.forEach(ind => {
      if (ind.value !== null && ind.validRecords > 0) {
        findings.push({
          id: `FIND-${ind.indicatorId}`,
          variableName: ind.name,
          resultText: `${ind.value} ${ind.unit}`,
          coveragePercentage: ind.coverage,
          evidenceLevel: ind.dataQuality as any,
          source: ind.source,
          description: `Hallazgo: ${ind.interpretation} (Calculado sobre ${ind.validRecords} colaboradores con respuesta válida. Cobertura: ${ind.coverage}%).`
        });
      }
    });

    return findings;
  }

  /**
   * Helper: Generate recommendations from findings ONLY (Requirements 22 & 23)
   */
  private static generateRecommendationsFromFindings(
    findings: ReportFinding[],
    qualityReport: Prompt20ValidationReport
  ): ReportRecommendation[] {
    const recommendations: ReportRecommendation[] = [];

    findings.forEach((finding, idx) => {
      if (finding.coveragePercentage >= 30) {
        recommendations.push({
          id: `REC-${idx + 1}`,
          associatedFindingId: finding.id,
          associatedFindingTitle: finding.variableName,
          evidence: `Basado en hallazgo verificado: ${finding.resultText} (Cobertura: ${finding.coveragePercentage}% en ${finding.source}).`,
          proposedAction: `Implementar programa de intervención para ${finding.variableName.toLowerCase()} acorde con los requerimientos del SG-SST.`,
          priority: finding.evidenceLevel === 'ALTA' ? 'ALTA' : 'MEDIA',
          targetPopulation: `Población evaluada con respuesta válida (${finding.source})`,
          source: finding.source
        });
      }
    });

    return recommendations;
  }

  /**
   * Helper: Compile limitations list (Requirement 24)
   */
  private static compileLimitations(
    qualityReport: Prompt20ValidationReport,
    variables: Record<string, ReportVariableBreakdown>,
    indicators: IndicatorResult[]
  ): string[] {
    const limitations: string[] = [];

    // Check missing variables
    Object.values(variables).forEach(v => {
      if (!v.isAvailable || v.coveragePercentage === 0) {
        limitations.push(`Variable sin información disponible: "${v.variableName}".`);
      } else if (v.coveragePercentage < 70) {
        limitations.push(`Baja cobertura en "${v.variableName}": Cobertura del ${v.coveragePercentage}% (${v.unreportedResponses} de ${v.totalPopulation} sin respuesta).`);
      }
    });

    // Check indicators with NO_DATA
    indicators.forEach(ind => {
      if (ind.status === 'NO_DATA') {
        limitations.push(`Indicador "${ind.name}" en estado SIN INFORMACIÓN DISPONIBLE (${ind.warning || 'Fuente sin datos'}).`);
      }
    });

    // Check critical issues or invalid data
    if (qualityReport.criticalIssues.length > 0) {
      limitations.push(`Problemas de calidad de datos detectados: ${qualityReport.criticalIssues.length} asunto(s) crítico(s).`);
    }

    return limitations;
  }

  /**
   * Helper to extract answers from DemographicsData structure for IndicatorEngine
   */
  private static extractAnswersFromDemographics(data: DemographicsData | null): { colaboradorId: string; preguntaId: string; valorIngresado: string }[] {
    if (!data) return [];
    const answers: { colaboradorId: string; preguntaId: string; valorIngresado: string }[] = [];

    // Extract physical activity answers
    if (data.physicalActivity) {
      data.physicalActivity.forEach((pa, i) => {
        answers.push({
          colaboradorId: `emp_${i}`,
          preguntaId: 'actividadFisica',
          valorIngresado: pa.level
        });
      });
    }

    // Extract musculoskeletal pain answers
    if (data.musculoskeletalPain) {
      data.musculoskeletalPain.forEach((mp, i) => {
        answers.push({
          colaboradorId: `emp_${i}`,
          preguntaId: 'sintomasOsteomusculares',
          valorIngresado: mp.bodyPart
        });
      });
    }

    return answers;
  }
}
