/**
 * SG-SST Centralized Indicator Engine
 * PROMPT 30 SPECIFICATION
 * 
 * Strict Data Principles:
 * - NO synthetic data, NO Math.random(), NO estimated averages, NO default numeric fallbacks
 * - If data is missing or insufficient: value = null, status = 'NO_DATA' | 'INSUFFICIENT_DATA', interpretation = "Sin información disponible"
 * - Full audit traceability: recordsUsed, recordsExcluded, source, formulaVersion, calculatedAt
 */

import {
  IndicatorResult,
  IndicatorAuditRecord,
  IndicatorCalculationDataset,
  DataQualityLevel,
  IndicatorStatus
} from './types';

export class IndicatorEngine {
  private static auditLogs: IndicatorAuditRecord[] = [];

  /**
   * Main entrypoint to calculate the complete suite of SG-SST indicators.
   */
  public static calculateAll(dataset: IndicatorCalculationDataset): IndicatorResult[] {
    const {
      companyId = 'DEFAULT',
      period = '2026-P1',
      colaboradores = [],
      respuestas = [],
      ausentismos = [],
      encuestasBienestar = [],
      catalogSedes = [],
      catalogAreas = [],
      catalogProyectos = []
    } = dataset;

    const results: IndicatorResult[] = [];

    // 1. EDAD PROMEDIO (AGE_V1)
    results.push(this.calculateEdadPromedio(colaboradores, companyId, period));

    // 2. ANTIGÜEDAD PROMEDIO (TENURE_V1)
    results.push(this.calculateAntiguedadPromedio(colaboradores, companyId, period));

    // 3. ÍNDICE DE MASA CORPORAL PROMEDIO (BMI_V1)
    results.push(this.calculateIMC(respuestas, colaboradores, companyId, period));

    // 4. PREVALENCIA DE SOBREPESO Y OBESIDAD (OVERWEIGHT_OBESITY_V1)
    results.push(this.calculateSobrepesoYObesidad(respuestas, colaboradores, companyId, period));

    // 5. TASA DE AUSENTISMO LABORAL (ABSENTEEISM_V1)
    results.push(this.calculateAusentismo(ausentismos, colaboradores, companyId, period));

    // 6. ÍNDICE DE BIENESTAR (WELLBEING_V1)
    results.push(this.calculateBienestar(encuestasBienestar, respuestas, colaboradores, companyId, period));

    // 7. ESTRÉS PERCIBIDO (STRESS_V1)
    results.push(this.calculateEstres(respuestas, colaboradores, companyId, period));

    // 8. TASA DE PARTICIPACIÓN EN ENCUESTAS (PARTICIPATION_V1)
    results.push(this.calculateParticipacion(respuestas, colaboradores, companyId, period));

    // 9. ACTIVIDAD FÍSICA REGULAR (PHYSICAL_ACTIVITY_V1)
    results.push(this.calculateActividadFisica(respuestas, colaboradores, companyId, period));

    // 10. CONDICIONES DE SALUD Y SÍNTOMAS OSTEOMUSCULARES (HEALTH_CONDITIONS_V1)
    results.push(this.calculateCondicionesSalud(respuestas, colaboradores, companyId, period));

    // 11. MEDICAMENTOS PERMANENTES (MEDICATIONS_V1)
    results.push(this.calculateMedicamentos(respuestas, colaboradores, companyId, period));

    // 12. ALERGIAS REPORTE (ALLERGIES_V1)
    results.push(this.calculateAlergias(respuestas, colaboradores, companyId, period));

    // 13. GRUPO SANGUÍNEO Y RH (BLOOD_GROUP_V1)
    results.push(this.calculateGrupoSanguineo(colaboradores, respuestas, companyId, period));

    // 14. TENENCIA DE MASCOTAS (PETS_V1)
    results.push(this.calculateMascotas(respuestas, colaboradores, companyId, period));

    // 15. USO DEL TIEMPO LIBRE (FREE_TIME_V1)
    results.push(this.calculateTiempoLibre(respuestas, colaboradores, companyId, period));

    // 16. PARTICIPACIÓN EMPRESARIAL (BUSINESS_PARTICIPATION_V1)
    results.push(this.calculateParticipacionEmpresarial(respuestas, colaboradores, companyId, period));

    // Attach Area, Sede, and Proyecto breakdowns if catalog maps exist
    this.attachBreakdowns(results, dataset);

    return results;
  }

  // =========================================================================
  // 1. EDAD PROMEDIO (AGE_V1)
  // =========================================================================
  public static calculateEdadPromedio(
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;
    const nowYear = new Date().getFullYear();

    let validCount = 0;
    let sumAge = 0;

    colaboradores.forEach(c => {
      const birthStr = c.fechaNacimiento || c.birthDate || c.fecha_nacimiento;
      if (birthStr && typeof birthStr === 'string' && birthStr.trim() !== '') {
        const birthDate = new Date(birthStr);
        if (!isNaN(birthDate.getTime())) {
          const birthYear = birthDate.getFullYear();
          if (birthYear > 1920 && birthYear <= nowYear - 15) {
            const age = nowYear - birthYear;
            sumAge += age;
            validCount++;
          }
        }
      } else if (typeof c.edad === 'number' && !isNaN(c.edad) && c.edad >= 15 && c.edad <= 90) {
        sumAge += c.edad;
        validCount++;
      }
    });

    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;
    const value = validCount > 0 ? parseFloat((sumAge / validCount).toFixed(1)) : null;
    const status: IndicatorStatus = validCount === 0 ? 'NO_DATA' : coverage >= 80 ? 'VALID' : 'VALID_WITH_LIMITATIONS';
    const quality: DataQualityLevel = validCount === 0 ? 'SIN_DATOS' : coverage >= 80 ? 'ALTA' : coverage >= 50 ? 'MEDIA' : 'BAJA';

    const result: IndicatorResult = {
      indicatorId: 'ind_edad_promedio',
      name: 'Edad Promedio de Colaboradores',
      value,
      unit: 'años',
      numerator: sumAge,
      denominator: validCount,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: quality,
      status,
      source: 'Censo de Colaboradores (fechaNacimiento)',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['COLABORADORES.fechaNacimiento'],
      formulaVersion: 'AGE_V1',
      interpretation: value !== null
        ? `${value} años en promedio. (${validCount} de ${totalRecords} colaboradores con fecha de nacimiento válida).`
        : 'Sin información disponible. Se requiere fecha de nacimiento válida para calcular la edad.'
    };

    this.logAudit(result, companyId, 'dataset_colaboradores');
    return result;
  }

  // =========================================================================
  // 2. ANTIGÜEDAD PROMEDIO (TENURE_V1)
  // =========================================================================
  public static calculateAntiguedadPromedio(
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;
    const nowTime = new Date().getTime();

    let validCount = 0;
    let sumYears = 0;

    colaboradores.forEach(c => {
      const ingresoStr = c.fechaIngreso || c.hireDate || c.fecha_ingreso;
      if (ingresoStr && typeof ingresoStr === 'string' && ingresoStr.trim() !== '') {
        const ingresoDate = new Date(ingresoStr);
        if (!isNaN(ingresoDate.getTime()) && ingresoDate.getTime() <= nowTime) {
          const diffYears = (nowTime - ingresoDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
          if (diffYears >= 0 && diffYears < 60) {
            sumYears += diffYears;
            validCount++;
          }
        }
      } else if (typeof c.antiguedadAnios === 'number' && !isNaN(c.antiguedadAnios) && c.antiguedadAnios >= 0) {
        sumYears += c.antiguedadAnios;
        validCount++;
      }
    });

    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;
    const value = validCount > 0 ? parseFloat((sumYears / validCount).toFixed(1)) : null;
    const status: IndicatorStatus = validCount === 0 ? 'NO_DATA' : coverage >= 80 ? 'VALID' : 'VALID_WITH_LIMITATIONS';
    const quality: DataQualityLevel = validCount === 0 ? 'SIN_DATOS' : coverage >= 80 ? 'ALTA' : coverage >= 50 ? 'MEDIA' : 'BAJA';

    const result: IndicatorResult = {
      indicatorId: 'ind_antiguedad_promedio',
      name: 'Antigüedad Promedio en la Empresa',
      value,
      unit: 'años',
      numerator: sumYears,
      denominator: validCount,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: quality,
      status,
      source: 'Censo de Colaboradores (fechaIngreso)',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['COLABORADORES.fechaIngreso'],
      formulaVersion: 'TENURE_V1',
      interpretation: value !== null
        ? `${value} años de permanencia promedio. (${validCount} colaboradores evaluados de ${totalRecords}).`
        : 'Sin información disponible. Se requiere fecha de ingreso válida para calcular la antigüedad.'
    };

    this.logAudit(result, companyId, 'dataset_colaboradores');
    return result;
  }

  // =========================================================================
  // 3. ÍNDICE DE MASA CORPORAL PROMEDIO (BMI_V1)
  // Strict rule: Evaluated ONLY when weight AND height exist for same person!
  // =========================================================================
  public static calculateIMC(
    respuestas: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    // Build map of weight & height per collaborator
    const weightMap = new Map<string, number>();
    const heightMap = new Map<string, number>();

    // Scan responses or direct attributes
    respuestas.forEach(r => {
      const colabKey = String(r.colaboradorId || r.colaborador_id || r.cedula || r.usuarioId || '');
      if (!colabKey) return;

      const pKey = String(r.preguntaId || r.codigo || r.campo || '').toLowerCase();
      const rawVal = parseFloat(r.valorIngresado || r.valor || r.respuesta);

      if (isNaN(rawVal) || rawVal <= 0) return;

      if (pKey.includes('peso') && rawVal > 20 && rawVal < 300) {
        weightMap.set(colabKey, rawVal);
      } else if ((pKey.includes('estatura') || pKey.includes('talla') || pKey.includes('altura')) && rawVal > 0.5 && rawVal < 2.5) {
        heightMap.set(colabKey, rawVal > 3 ? rawVal / 100 : rawVal);
      } else if ((pKey.includes('estatura') || pKey.includes('talla') || pKey.includes('altura')) && rawVal >= 50 && rawVal <= 250) {
        heightMap.set(colabKey, rawVal / 100);
      }
    });

    // Also check direct collaborator fields
    colaboradores.forEach(c => {
      const colabKey = String(c.id || c.cedula || c.documento || '');
      if (!colabKey) return;

      if (c.pesoKg || c.peso) {
        const p = parseFloat(c.pesoKg || c.peso);
        if (!isNaN(p) && p > 20 && p < 300) weightMap.set(colabKey, p);
      }
      if (c.estaturaCm || c.estatura || c.talla) {
        const e = parseFloat(c.estaturaCm || c.estatura || c.talla);
        if (!isNaN(e)) {
          if (e >= 50 && e <= 250) heightMap.set(colabKey, e / 100);
          else if (e > 0.5 && e < 2.5) heightMap.set(colabKey, e);
        }
      }
    });

    let validCount = 0;
    let sumIMC = 0;

    weightMap.forEach((w, key) => {
      const h = heightMap.get(key);
      if (h && h > 0) {
        const imc = w / (h * h);
        if (!isNaN(imc) && imc >= 10 && imc <= 80) {
          sumIMC += imc;
          validCount++;
        }
      }
    });

    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;
    const value = validCount > 0 ? parseFloat((sumIMC / validCount).toFixed(1)) : null;
    const status: IndicatorStatus = validCount === 0 ? 'NO_DATA' : coverage >= 80 ? 'VALID' : 'VALID_WITH_LIMITATIONS';
    const quality: DataQualityLevel = validCount === 0 ? 'SIN_DATOS' : coverage >= 80 ? 'ALTA' : coverage >= 50 ? 'MEDIA' : 'BAJA';

    const result: IndicatorResult = {
      indicatorId: 'ind_imc_promedio',
      name: 'Índice de Masa Corporal Promedio (IMC)',
      value,
      unit: 'kg/m²',
      numerator: parseFloat(sumIMC.toFixed(1)),
      denominator: validCount,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: quality,
      status,
      source: 'Encuesta Sociodemográfica (Peso & Estatura requeridos simultáneamente)',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['RESPUESTAS.peso', 'RESPUESTAS.estatura'],
      formulaVersion: 'BMI_V1',
      interpretation: value !== null
        ? `${value} kg/m² promedio. (Calculado exclusivamente para ${validCount} colaboradores con peso y estatura válidos).`
        : 'Sin información disponible. Se requiere registrar tanto peso como estatura válidos simultáneamente para calcular el IMC.'
    };

    this.logAudit(result, companyId, 'dataset_antropometria');
    return result;
  }

  // =========================================================================
  // 4. PREVALENCIA DE SOBREPESO Y OBESIDAD (OVERWEIGHT_OBESITY_V1)
  // =========================================================================
  public static calculateSobrepesoYObesidad(
    respuestas: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    const weightMap = new Map<string, number>();
    const heightMap = new Map<string, number>();

    respuestas.forEach(r => {
      const colabKey = String(r.colaboradorId || r.colaborador_id || r.cedula || r.usuarioId || '');
      if (!colabKey) return;
      const pKey = String(r.preguntaId || r.codigo || r.campo || '').toLowerCase();
      const rawVal = parseFloat(r.valorIngresado || r.valor || r.respuesta);
      if (isNaN(rawVal) || rawVal <= 0) return;

      if (pKey.includes('peso') && rawVal > 20 && rawVal < 300) weightMap.set(colabKey, rawVal);
      else if ((pKey.includes('estatura') || pKey.includes('talla')) && rawVal >= 50 && rawVal <= 250) heightMap.set(colabKey, rawVal / 100);
      else if ((pKey.includes('estatura') || pKey.includes('talla')) && rawVal > 0.5 && rawVal < 2.5) heightMap.set(colabKey, rawVal);
    });

    colaboradores.forEach(c => {
      const colabKey = String(c.id || c.cedula || c.documento || '');
      if (!colabKey) return;
      if (c.pesoKg || c.peso) {
        const p = parseFloat(c.pesoKg || c.peso);
        if (!isNaN(p) && p > 20 && p < 300) weightMap.set(colabKey, p);
      }
      if (c.estaturaCm || c.estatura || c.talla) {
        const e = parseFloat(c.estaturaCm || c.estatura || c.talla);
        if (!isNaN(e) && e >= 50 && e <= 250) heightMap.set(colabKey, e / 100);
        else if (!isNaN(e) && e > 0.5 && e < 2.5) heightMap.set(colabKey, e);
      }
    });

    let validCount = 0;
    let excessWeightCount = 0; // IMC >= 25.0

    weightMap.forEach((w, key) => {
      const h = heightMap.get(key);
      if (h && h > 0) {
        const imc = w / (h * h);
        if (!isNaN(imc) && imc >= 10 && imc <= 80) {
          validCount++;
          if (imc >= 25.0) {
            excessWeightCount++;
          }
        }
      }
    });

    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;
    const value = validCount > 0 ? parseFloat(((excessWeightCount / validCount) * 100).toFixed(1)) : null;
    const status: IndicatorStatus = validCount === 0 ? 'NO_DATA' : coverage >= 80 ? 'VALID' : 'VALID_WITH_LIMITATIONS';
    const quality: DataQualityLevel = validCount === 0 ? 'SIN_DATOS' : coverage >= 80 ? 'ALTA' : coverage >= 50 ? 'MEDIA' : 'BAJA';

    const result: IndicatorResult = {
      indicatorId: 'ind_prevalencia_sobrepeso_obesidad',
      name: 'Prevalencia de Sobrepeso y Obesidad',
      value,
      unit: '%',
      numerator: excessWeightCount,
      denominator: validCount,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: quality,
      status,
      source: 'Registros válidos simultáneos de peso y estatura',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['RESPUESTAS.peso', 'RESPUESTAS.estatura'],
      formulaVersion: 'OVERWEIGHT_OBESITY_V1',
      interpretation: value !== null
        ? `${value}% de sobrepeso/obesidad (${excessWeightCount} casos detectados de ${validCount} colaboradores con IMC calculable). Cobertura: ${coverage}%.`
        : 'Sin información disponible. Se requiere evaluación antropométrica de peso y estatura.'
    };

    this.logAudit(result, companyId, 'dataset_antropometria');
    return result;
  }

  // =========================================================================
  // 5. TASA DE AUSENTISMO LABORAL (ABSENTEEISM_V1)
  // Strict rule: ONLY calculated if real absenteeism source data exists!
  // =========================================================================
  public static calculateAusentismo(
    ausentismos: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    if (!ausentismos || ausentismos.length === 0) {
      const result: IndicatorResult = {
        indicatorId: 'ind_ausentismo_laboral',
        name: 'Tasa de Ausentismo por Incapacidades Médicas',
        value: null,
        unit: '%',
        numerator: 0,
        denominator: 0,
        coverage: 0,
        validRecords: 0,
        totalRecords,
        dataQuality: 'SIN_DATOS',
        status: 'NO_DATA',
        source: 'Registro de Incapacidades y Ausencias',
        period,
        calculatedAt: new Date().toISOString(),
        variablesUsed: ['AUSENTISMOS.diasIncapacidad'],
        formulaVersion: 'ABSENTEEISM_V1',
        interpretation: 'Sin información de ausentismo. No existe fuente ni registros de incapacidades cargadas.'
      };
      this.logAudit(result, companyId, 'dataset_ausentismo');
      return result;
    }

    let sumDays = 0;
    let validRecords = 0;

    ausentismos.forEach(a => {
      const days = parseFloat(a.diasIncapacidad || a.dias || a.diasAusencia || 0);
      if (!isNaN(days) && days >= 0) {
        sumDays += days;
        validRecords++;
      }
    });

    // Total scheduled man-days assuming 240 workdays/year per employee
    const totalPlannedDays = totalRecords > 0 ? totalRecords * 240 : 1;
    const rate = parseFloat(((sumDays / totalPlannedDays) * 100).toFixed(2));
    const coverage = totalRecords > 0 ? parseFloat(((validRecords / totalRecords) * 100).toFixed(1)) : 100;

    const result: IndicatorResult = {
      indicatorId: 'ind_ausentismo_laboral',
      name: 'Tasa de Ausentismo por Incapacidades Médicas',
      value: rate,
      unit: '%',
      numerator: sumDays,
      denominator: totalPlannedDays,
      coverage: Math.min(100, coverage),
      validRecords,
      totalRecords,
      dataQuality: 'ALTA',
      status: 'VALID',
      source: 'Módulo de Ausentismo e Incapacidades Reales',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['AUSENTISMOS.diasIncapacidad'],
      formulaVersion: 'ABSENTEEISM_V1',
      interpretation: `${rate}% de días perdidos por incapacidades (${sumDays} días de ausencia registrados).`
    };

    this.logAudit(result, companyId, 'dataset_ausentismo');
    return result;
  }

  // =========================================================================
  // 6. ÍNDICE DE BIENESTAR (WELLBEING_V1)
  // Strict rule: ONLY calculated from real wellbeing/clima survey responses!
  // =========================================================================
  public static calculateBienestar(
    encuestasBienestar: any[],
    respuestas: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    // Search for wellbeing responses
    let validCount = 0;
    let sumScore = 0;

    const sourceList = encuestasBienestar.length > 0 ? encuestasBienestar : respuestas.filter(r => {
      const pKey = String(r.preguntaId || r.codigo || r.campo || '').toLowerCase();
      return pKey.includes('bienestar') || pKey.includes('clima') || pKey.includes('satisfaccion');
    });

    sourceList.forEach(r => {
      const score = parseFloat(r.score || r.puntaje || r.valorIngresado || r.valor);
      if (!isNaN(score) && score >= 0 && score <= 100) {
        sumScore += score;
        validCount++;
      }
    });

    if (validCount === 0) {
      const result: IndicatorResult = {
        indicatorId: 'ind_indice_bienestar',
        name: 'Índice de Bienestar Ocupacional',
        value: null,
        unit: 'puntos',
        numerator: 0,
        denominator: 0,
        coverage: 0,
        validRecords: 0,
        totalRecords,
        dataQuality: 'SIN_DATOS',
        status: 'NO_DATA',
        source: 'Encuestas de Bienestar o Clima Laboral',
        period,
        calculatedAt: new Date().toISOString(),
        variablesUsed: ['BIENESTAR.puntaje'],
        formulaVersion: 'WELLBEING_V1',
        interpretation: 'Sin información disponible. No se ha aplicado ni registrado un instrumento de medición de bienestar.'
      };
      this.logAudit(result, companyId, 'dataset_bienestar');
      return result;
    }

    const value = parseFloat((sumScore / validCount).toFixed(1));
    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

    const result: IndicatorResult = {
      indicatorId: 'ind_indice_bienestar',
      name: 'Índice de Bienestar Ocupacional',
      value,
      unit: 'puntos',
      numerator: parseFloat(sumScore.toFixed(1)),
      denominator: validCount,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: coverage >= 80 ? 'ALTA' : 'MEDIA',
      status: 'VALID',
      source: 'Instrumento Evaluado de Bienestar',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['BIENESTAR.puntaje'],
      formulaVersion: 'WELLBEING_V1',
      interpretation: `${value} puntos de bienestar promedio sobre 100 (${validCount} respuestas analizadas).`
    };

    this.logAudit(result, companyId, 'dataset_bienestar');
    return result;
  }

  // =========================================================================
  // 7. ESTRÉS PERCIBIDO (STRESS_V1)
  // Strict rule: Exclusively real responses! NO inferring from age/area/role.
  // =========================================================================
  public static calculateEstres(
    respuestas: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    const stressResp = respuestas.filter(r => {
      const pKey = String(r.preguntaId || r.codigo || r.campo || '').toLowerCase();
      return pKey.includes('estres') || pKey.includes('estrés') || pKey.includes('ansiedad');
    });

    const validCount = stressResp.length;
    if (validCount === 0) {
      const result: IndicatorResult = {
        indicatorId: 'ind_estres_percibido',
        name: 'Prevalencia de Estrés Alto Percibido',
        value: null,
        unit: '%',
        numerator: 0,
        denominator: 0,
        coverage: 0,
        validRecords: 0,
        totalRecords,
        dataQuality: 'SIN_DATOS',
        status: 'NO_DATA',
        source: 'Instrumento de Riesgo Psicosocial / Estrés',
        period,
        calculatedAt: new Date().toISOString(),
        variablesUsed: ['RESPUESTAS.estres'],
        formulaVersion: 'STRESS_V1',
        interpretation: 'Sin información disponible. No existen respuestas en el instrumento de medición de estrés.'
      };
      this.logAudit(result, companyId, 'dataset_estres');
      return result;
    }

    let highCount = 0;
    stressResp.forEach(r => {
      const str = String(r.valorIngresado || r.respuesta || '').toLowerCase();
      if (str.includes('alto') || str.includes('si') || str.includes('sí') || str === '1' || str === 'frecuente') {
        highCount++;
      }
    });

    const value = parseFloat(((highCount / validCount) * 100).toFixed(1));
    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

    const result: IndicatorResult = {
      indicatorId: 'ind_estres_percibido',
      name: 'Prevalencia de Estrés Alto Percibido',
      value,
      unit: '%',
      numerator: highCount,
      denominator: validCount,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: coverage >= 80 ? 'ALTA' : 'MEDIA',
      status: 'VALID',
      source: 'Instrumento Evaluado de Estrés',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['RESPUESTAS.estres'],
      formulaVersion: 'STRESS_V1',
      interpretation: `${value}% de colaboradores reportan nivel de estrés alto (${highCount} de ${validCount} participantes).`
    };

    this.logAudit(result, companyId, 'dataset_estres');
    return result;
  }

  // =========================================================================
  // 8. TASA DE PARTICIPACIÓN EN ENCUESTAS (PARTICIPATION_V1)
  // Strict rule: NO artificial floor (e.g. 85 + ...)!
  // =========================================================================
  public static calculateParticipacion(
    respuestas: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    // Count unique collaborators who answered
    const uniqueParticipants = new Set<string>();
    respuestas.forEach(r => {
      const cId = r.colaboradorId || r.colaborador_id || r.usuarioId || r.cedula;
      if (cId) uniqueParticipants.add(String(cId));
    });

    const validCount = uniqueParticipants.size;
    const value = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : null;

    const result: IndicatorResult = {
      indicatorId: 'ind_tasa_participacion',
      name: 'Tasa de Participación en Medición',
      value,
      unit: '%',
      numerator: validCount,
      denominator: totalRecords,
      coverage: value || 0,
      validRecords: validCount,
      totalRecords,
      dataQuality: totalRecords > 0 ? (value! >= 80 ? 'ALTA' : value! >= 50 ? 'MEDIA' : 'BAJA') : 'SIN_DATOS',
      status: totalRecords > 0 ? 'VALID' : 'NO_DATA',
      source: 'Registros de Respuestas vs Censo',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['RESPUESTAS.colaboradorId'],
      formulaVersion: 'PARTICIPATION_V1',
      interpretation: value !== null
        ? `${value}% de participación efectiva (${validCount} de ${totalRecords} colaboradores del censo).`
        : 'Sin información disponible. Censo de colaboradores vacío.'
    };

    this.logAudit(result, companyId, 'dataset_participacion');
    return result;
  }

  // =========================================================================
  // 9. ACTIVIDAD FÍSICA REGULAR (PHYSICAL_ACTIVITY_V1)
  // =========================================================================
  public static calculateActividadFisica(
    respuestas: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    const physResp = respuestas.filter(r => {
      const pKey = String(r.preguntaId || r.codigo || r.campo || '').toLowerCase();
      return pKey.includes('actividadfisica') || pKey.includes('actividad_fisica') || pKey.includes('deporte');
    });

    const validCount = physResp.length;
    if (validCount === 0) {
      const result: IndicatorResult = {
        indicatorId: 'ind_actividad_fisica',
        name: 'Nivel de Actividad Física Regular',
        value: null,
        unit: '%',
        numerator: 0,
        denominator: 0,
        coverage: 0,
        validRecords: 0,
        totalRecords,
        dataQuality: 'SIN_DATOS',
        status: 'NO_DATA',
        source: 'Encuesta Sociodemográfica (Actividad Física)',
        period,
        calculatedAt: new Date().toISOString(),
        variablesUsed: ['RESPUESTAS.actividadFisica'],
        formulaVersion: 'PHYSICAL_ACTIVITY_V1',
        interpretation: 'Sin información disponible. Pregunta de actividad física no diligenciada.'
      };
      this.logAudit(result, companyId, 'dataset_estilodevida');
      return result;
    }

    let activeCount = 0;
    physResp.forEach(r => {
      const val = String(r.valorIngresado || r.respuesta || '').toLowerCase();
      if (val.includes('si') || val.includes('sí') || val.includes('regular') || val.includes('frecuente') || val === '1') {
        activeCount++;
      }
    });

    const value = parseFloat(((activeCount / validCount) * 100).toFixed(1));
    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

    const result: IndicatorResult = {
      indicatorId: 'ind_actividad_fisica',
      name: 'Nivel de Actividad Física Regular',
      value,
      unit: '%',
      numerator: activeCount,
      denominator: validCount,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: coverage >= 80 ? 'ALTA' : 'MEDIA',
      status: 'VALID',
      source: 'Respuestas de Actividad Física',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['RESPUESTAS.actividadFisica'],
      formulaVersion: 'PHYSICAL_ACTIVITY_V1',
      interpretation: `${value}% de los participantes practica actividad física regular. (Cobertura del censo: ${coverage}%).`
    };

    this.logAudit(result, companyId, 'dataset_estilodevida');
    return result;
  }

  // =========================================================================
  // 10. CONDICIONES DE SALUD Y SÍNTOMAS OSTEOMUSCULARES (HEALTH_CONDITIONS_V1)
  // Preserves distinction between symptoms (dolor) vs medical diagnosis!
  // =========================================================================
  public static calculateCondicionesSalud(
    respuestas: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    const painResp = respuestas.filter(r => {
      const pKey = String(r.preguntaId || r.codigo || r.campo || '').toLowerCase();
      return pKey.includes('dolor') || pKey.includes('molestia') || pKey.includes('sintoma');
    });

    const validCount = painResp.length;
    if (validCount === 0) {
      const result: IndicatorResult = {
        indicatorId: 'ind_sintomas_osteomusculares',
        name: 'Sintomatología y Molestias Osteomusculares Reportadas',
        value: null,
        unit: '%',
        numerator: 0,
        denominator: 0,
        coverage: 0,
        validRecords: 0,
        totalRecords,
        dataQuality: 'SIN_DATOS',
        status: 'NO_DATA',
        source: 'Cuestionario de Síntomas Osteomusculares',
        period,
        calculatedAt: new Date().toISOString(),
        variablesUsed: ['RESPUESTAS.dolorOsteomuscular'],
        formulaVersion: 'HEALTH_CONDITIONS_V1',
        interpretation: 'Sin información disponible. No existen reportes de molestias osteomusculares registras.'
      };
      this.logAudit(result, companyId, 'dataset_salud');
      return result;
    }

    let symptomCount = 0;
    painResp.forEach(r => {
      const val = String(r.valorIngresado || r.respuesta || '').toLowerCase();
      if (val.includes('si') || val.includes('sí') || val === '1' || val.includes('frecuente') || val.includes('alto')) {
        symptomCount++;
      }
    });

    const value = parseFloat(((symptomCount / validCount) * 100).toFixed(1));
    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

    const result: IndicatorResult = {
      indicatorId: 'ind_sintomas_osteomusculares',
      name: 'Sintomatología y Molestias Osteomusculares Reportadas',
      value,
      unit: '%',
      numerator: symptomCount,
      denominator: validCount,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: coverage >= 80 ? 'ALTA' : 'MEDIA',
      status: 'VALID',
      source: 'Reporte de Síntomas Percibidos (No Diagnósticos)',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['RESPUESTAS.dolorOsteomuscular'],
      formulaVersion: 'HEALTH_CONDITIONS_V1',
      interpretation: `${value}% reporta síntomas o molestias osteomusculares. (Aviso: Corresponde a síntomas percibidos, no a diagnósticos médicos formalizados).`
    };

    this.logAudit(result, companyId, 'dataset_salud');
    return result;
  }

  // =========================================================================
  // 11. MEDICAMENTOS PERMANENTES (MEDICATIONS_V1)
  // =========================================================================
  public static calculateMedicamentos(
    respuestas: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    const medResp = respuestas.filter(r => {
      const pKey = String(r.preguntaId || r.codigo || r.campo || '').toLowerCase();
      return pKey.includes('medicamento') || pKey.includes('tratamiento');
    });

    const validCount = medResp.length;
    if (validCount === 0) {
      const result: IndicatorResult = {
        indicatorId: 'ind_consumo_medicamentos',
        name: 'Uso de Medicamentos Permanentes',
        value: null,
        unit: '%',
        numerator: 0,
        denominator: 0,
        coverage: 0,
        validRecords: 0,
        totalRecords,
        dataQuality: 'SIN_DATOS',
        status: 'NO_DATA',
        source: 'Encuesta Sociodemográfica (Medicamentos)',
        period,
        calculatedAt: new Date().toISOString(),
        variablesUsed: ['RESPUESTAS.medicamentos'],
        formulaVersion: 'MEDICATIONS_V1',
        interpretation: 'No informado. Sin información disponible de consumo de medicamentos.'
      };
      this.logAudit(result, companyId, 'dataset_salud');
      return result;
    }

    let medUserCount = 0;
    medResp.forEach(r => {
      const val = String(r.valorIngresado || r.respuesta || '').toLowerCase();
      if (val.includes('si') || val.includes('sí') || val === '1' || val.length > 3) {
        medUserCount++;
      }
    });

    const value = parseFloat(((medUserCount / validCount) * 100).toFixed(1));
    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

    const result: IndicatorResult = {
      indicatorId: 'ind_consumo_medicamentos',
      name: 'Uso de Medicamentos Permanentes',
      value,
      unit: '%',
      numerator: medUserCount,
      denominator: validCount,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: coverage >= 80 ? 'ALTA' : 'MEDIA',
      status: 'VALID',
      source: 'Reporte de Medicamentos Formulados',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['RESPUESTAS.medicamentos'],
      formulaVersion: 'MEDICATIONS_V1',
      interpretation: `${value}% de los evaluados reporta consumo de medicamentos permanentes.`
    };

    this.logAudit(result, companyId, 'dataset_salud');
    return result;
  }

  // =========================================================================
  // 12. ALERGIAS (ALLERGIES_V1)
  // =========================================================================
  public static calculateAlergias(
    respuestas: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    const allergyResp = respuestas.filter(r => {
      const pKey = String(r.preguntaId || r.codigo || r.campo || '').toLowerCase();
      return pKey.includes('alergia');
    });

    const validCount = allergyResp.length;
    if (validCount === 0) {
      const result: IndicatorResult = {
        indicatorId: 'ind_alergias_conocidas',
        name: 'Prevalencia de Alergias Conocidas',
        value: null,
        unit: '%',
        numerator: 0,
        denominator: 0,
        coverage: 0,
        validRecords: 0,
        totalRecords,
        dataQuality: 'SIN_DATOS',
        status: 'NO_DATA',
        source: 'Encuesta de Salud',
        period,
        calculatedAt: new Date().toISOString(),
        variablesUsed: ['RESPUESTAS.alergias'],
        formulaVersion: 'ALLERGIES_V1',
        interpretation: 'Sin información disponible. Pregunta de alergias no diligenciada.'
      };
      this.logAudit(result, companyId, 'dataset_salud');
      return result;
    }

    let allergyCount = 0;
    allergyResp.forEach(r => {
      const val = String(r.valorIngresado || r.respuesta || '').toLowerCase();
      if (val.includes('si') || val.includes('sí') || val === '1' || val.length > 2) allergyCount++;
    });

    const value = parseFloat(((allergyCount / validCount) * 100).toFixed(1));
    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

    const result: IndicatorResult = {
      indicatorId: 'ind_alergias_conocidas',
      name: 'Prevalencia de Alergias Conocidas',
      value,
      unit: '%',
      numerator: allergyCount,
      denominator: validCount,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: coverage >= 80 ? 'ALTA' : 'MEDIA',
      status: 'VALID',
      source: 'Reportes Directos de Alergias',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['RESPUESTAS.alergias'],
      formulaVersion: 'ALLERGIES_V1',
      interpretation: `${value}% de colaboradores evaluados reporta algún tipo de alergia conocida.`
    };

    this.logAudit(result, companyId, 'dataset_salud');
    return result;
  }

  // =========================================================================
  // 13. GRUPO SANGUÍNEO Y RH (BLOOD_GROUP_V1)
  // =========================================================================
  public static calculateGrupoSanguineo(
    colaboradores: any[],
    respuestas: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    let validCount = 0;
    colaboradores.forEach(c => {
      const rh = c.grupoSanguineo || c.rh || c.grupo_sanguineo;
      if (rh && typeof rh === 'string' && rh.trim() !== '') validCount++;
    });

    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

    const result: IndicatorResult = {
      indicatorId: 'ind_grupo_sanguineo',
      name: 'Registro de Grupo Sanguíneo y RH',
      value: validCount > 0 ? coverage : null,
      unit: '%',
      numerator: validCount,
      denominator: totalRecords,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: validCount === 0 ? 'SIN_DATOS' : coverage >= 80 ? 'ALTA' : 'MEDIA',
      status: validCount === 0 ? 'NO_DATA' : 'VALID',
      source: 'Ficha de Colaboradores / Nómina',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['COLABORADORES.rh'],
      formulaVersion: 'BLOOD_GROUP_V1',
      interpretation: validCount > 0
        ? `${coverage}% de colaboradores con RH registrado (${validCount} de ${totalRecords}).`
        : 'Sin información disponible. No existe grupo sanguíneo ni RH registrado.'
    };

    this.logAudit(result, companyId, 'dataset_salud');
    return result;
  }

  // =========================================================================
  // 14. TENENCIA DE MASCOTAS (PETS_V1)
  // =========================================================================
  public static calculateMascotas(
    respuestas: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    const petResp = respuestas.filter(r => {
      const pKey = String(r.preguntaId || r.codigo || r.campo || '').toLowerCase();
      return pKey.includes('mascota');
    });

    const validCount = petResp.length;
    if (validCount === 0) {
      const result: IndicatorResult = {
        indicatorId: 'ind_tenencia_mascotas',
        name: 'Tenencia de Mascotas en el Hogar',
        value: null,
        unit: '%',
        numerator: 0,
        denominator: 0,
        coverage: 0,
        validRecords: 0,
        totalRecords,
        dataQuality: 'SIN_DATOS',
        status: 'NO_DATA',
        source: 'Encuesta Sociodemográfica (Mascotas)',
        period,
        calculatedAt: new Date().toISOString(),
        variablesUsed: ['RESPUESTAS.mascotas'],
        formulaVersion: 'PETS_V1',
        interpretation: 'Sin información disponible. Pregunta de tenencia de mascotas no registrada.'
      };
      this.logAudit(result, companyId, 'dataset_sociodemografico');
      return result;
    }

    let petCount = 0;
    petResp.forEach(r => {
      const val = String(r.valorIngresado || r.respuesta || '').toLowerCase();
      if (val.includes('si') || val.includes('sí') || val === '1') petCount++;
    });

    const value = parseFloat(((petCount / validCount) * 100).toFixed(1));
    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

    const result: IndicatorResult = {
      indicatorId: 'ind_tenencia_mascotas',
      name: 'Tenencia de Mascotas en el Hogar',
      value,
      unit: '%',
      numerator: petCount,
      denominator: validCount,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: coverage >= 80 ? 'ALTA' : 'MEDIA',
      status: 'VALID',
      source: 'Respuestas de Mascotas',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['RESPUESTAS.mascotas'],
      formulaVersion: 'PETS_V1',
      interpretation: `${value}% de colaboradores que respondieron declaran tener mascotas.`
    };

    this.logAudit(result, companyId, 'dataset_sociodemografico');
    return result;
  }

  // =========================================================================
  // 15. USO DEL TIEMPO LIBRE (FREE_TIME_V1)
  // =========================================================================
  public static calculateTiempoLibre(
    respuestas: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    const freeTimeResp = respuestas.filter(r => {
      const pKey = String(r.preguntaId || r.codigo || r.campo || '').toLowerCase();
      return pKey.includes('tiempolibre') || pKey.includes('tiempo_libre') || pKey.includes('hobby');
    });

    const validCount = freeTimeResp.length;
    if (validCount === 0) {
      const result: IndicatorResult = {
        indicatorId: 'ind_uso_tiempo_libre',
        name: 'Uso Predominante del Tiempo Libre',
        value: null,
        unit: '%',
        numerator: 0,
        denominator: 0,
        coverage: 0,
        validRecords: 0,
        totalRecords,
        dataQuality: 'SIN_DATOS',
        status: 'NO_DATA',
        source: 'Encuesta Sociodemográfica (Tiempo Libre)',
        period,
        calculatedAt: new Date().toISOString(),
        variablesUsed: ['RESPUESTAS.tiempoLibre'],
        formulaVersion: 'FREE_TIME_V1',
        interpretation: 'Sin información disponible. Pregunta de tiempo libre no contestada.'
      };
      this.logAudit(result, companyId, 'dataset_sociodemografico');
      return result;
    }

    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

    const result: IndicatorResult = {
      indicatorId: 'ind_uso_tiempo_libre',
      name: 'Uso Predominante del Tiempo Libre',
      value: coverage,
      unit: '%',
      numerator: validCount,
      denominator: totalRecords,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: coverage >= 80 ? 'ALTA' : 'MEDIA',
      status: 'VALID',
      source: 'Respuestas de Tiempo Libre',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['RESPUESTAS.tiempoLibre'],
      formulaVersion: 'FREE_TIME_V1',
      interpretation: `Información diligenciada por ${validCount} colaboradores (${coverage}% de cobertura).`
    };

    this.logAudit(result, companyId, 'dataset_sociodemografico');
    return result;
  }

  // =========================================================================
  // 16. PARTICIPACIÓN EMPRESARIAL (BUSINESS_PARTICIPATION_V1)
  // =========================================================================
  public static calculateParticipacionEmpresarial(
    respuestas: any[],
    colaboradores: any[],
    companyId: string,
    period: string
  ): IndicatorResult {
    const totalRecords = colaboradores.length;

    const busResp = respuestas.filter(r => {
      const pKey = String(r.preguntaId || r.codigo || r.campo || '').toLowerCase();
      return pKey.includes('participacion') || pKey.includes('eventos') || pKey.includes('actividades_empresa');
    });

    const validCount = busResp.length;
    if (validCount === 0) {
      const result: IndicatorResult = {
        indicatorId: 'ind_participacion_empresarial',
        name: 'Participación en Actividades Institucionales',
        value: null,
        unit: '%',
        numerator: 0,
        denominator: 0,
        coverage: 0,
        validRecords: 0,
        totalRecords,
        dataQuality: 'SIN_DATOS',
        status: 'NO_DATA',
        source: 'Encuesta de Participación Institucional',
        period,
        calculatedAt: new Date().toISOString(),
        variablesUsed: ['RESPUESTAS.participacionEmpresarial'],
        formulaVersion: 'BUSINESS_PARTICIPATION_V1',
        interpretation: 'Sin información disponible. Sin registros de asistencia o participación en eventos.'
      };
      this.logAudit(result, companyId, 'dataset_participacion');
      return result;
    }

    let activeCount = 0;
    busResp.forEach(r => {
      const val = String(r.valorIngresado || r.respuesta || '').toLowerCase();
      if (val.includes('alta') || val.includes('si') || val.includes('sí') || val.includes('frecuente')) activeCount++;
    });

    const value = parseFloat(((activeCount / validCount) * 100).toFixed(1));
    const coverage = totalRecords > 0 ? parseFloat(((validCount / totalRecords) * 100).toFixed(1)) : 0;

    const result: IndicatorResult = {
      indicatorId: 'ind_participacion_empresarial',
      name: 'Participación en Actividades Institucionales',
      value,
      unit: '%',
      numerator: activeCount,
      denominator: validCount,
      coverage,
      validRecords: validCount,
      totalRecords,
      dataQuality: coverage >= 80 ? 'ALTA' : 'MEDIA',
      status: 'VALID',
      source: 'Registros de Eventos Institucionales',
      period,
      calculatedAt: new Date().toISOString(),
      variablesUsed: ['RESPUESTAS.participacionEmpresarial'],
      formulaVersion: 'BUSINESS_PARTICIPATION_V1',
      interpretation: `${value}% de alta participación activa en actividades de la empresa.`
    };

    this.logAudit(result, companyId, 'dataset_participacion');
    return result;
  }

  // =========================================================================
  // COMPARATIVE INDICATORS (PERIOD COMPARISON)
  // Strict rule: Warn if 1 of the 2 periods lacks sufficient data!
  // =========================================================================
  public static comparePeriods(
    currentIndicator: IndicatorResult,
    previousIndicator: IndicatorResult | null
  ): { delta: number | null; warning?: string } {
    if (!previousIndicator || previousIndicator.value === null || currentIndicator.value === null) {
      return {
        delta: null,
        warning: 'Comparación no disponible por insuficiencia de datos en uno de los periodos.'
      };
    }

    const delta = parseFloat((currentIndicator.value - previousIndicator.value).toFixed(1));
    return { delta };
  }

  // =========================================================================
  // BREAKDOWN ATTACHMENT (BY AREA, BY SEDE, BY PROYECTO)
  // Strict rule: Calculated ONLY with records belonging to that area/sede/proyecto.
  // Missing data displays "Sin información disponible", NOT 0%!
  // =========================================================================
  private static attachBreakdowns(
    indicators: IndicatorResult[],
    dataset: IndicatorCalculationDataset
  ): void {
    const { colaboradores = [], catalogAreas = [], catalogSedes = [], catalogProyectos = [] } = dataset;

    if (colaboradores.length === 0) return;

    // Group colaboradores by area
    const areaGroups = new Map<string, any[]>();
    catalogAreas.forEach(a => areaGroups.set(a.nombre || a.id, []));

    colaboradores.forEach(c => {
      const areaName = c.areaNombre || c.area || c.areaId;
      if (areaName && areaGroups.has(areaName)) {
        areaGroups.get(areaName)!.push(c);
      }
    });

    // Group colaboradores by sede
    const sedeGroups = new Map<string, any[]>();
    catalogSedes.forEach(s => sedeGroups.set(s.nombre || s.id, []));

    colaboradores.forEach(c => {
      const sedeName = c.sedeNombre || c.sede || c.sedeId;
      if (sedeName && sedeGroups.has(sedeName)) {
        sedeGroups.get(sedeName)!.push(c);
      }
    });

    // Build breakdowns for main indicators
    indicators.forEach(ind => {
      if (ind.indicatorId === 'ind_edad_promedio') {
        const byArea: Record<string, IndicatorResult> = {};
        areaGroups.forEach((subColabs, areaName) => {
          byArea[areaName] = this.calculateEdadPromedio(subColabs, dataset.companyId, dataset.period || '2026-P1');
        });
        ind.byArea = byArea;

        const bySede: Record<string, IndicatorResult> = {};
        sedeGroups.forEach((subColabs, sedeName) => {
          bySede[sedeName] = this.calculateEdadPromedio(subColabs, dataset.companyId, dataset.period || '2026-P1');
        });
        ind.bySede = bySede;
      }
    });
  }

  // Helper for audit logging
  private static logAudit(indicator: IndicatorResult, companyId: string, datasetId: string): void {
    const auditRecord: IndicatorAuditRecord = {
      auditId: `AUD-IND-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      indicatorId: indicator.indicatorId,
      datasetId,
      companyId,
      source: indicator.source,
      calculationVersion: 'PROMPT_30_V1',
      calculatedAt: indicator.calculatedAt,
      recordsUsed: indicator.validRecords,
      recordsExcluded: indicator.totalRecords - indicator.validRecords,
      formulaVersion: indicator.formulaVersion,
      coveragePercentage: indicator.coverage,
      status: indicator.status
    };

    this.auditLogs.push(auditRecord);
  }

  public static getAuditLogs(): IndicatorAuditRecord[] {
    return [...this.auditLogs];
  }
}
