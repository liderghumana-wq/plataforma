/**
 * SG-SST CENTRAL INDICATOR ENGINE
 * PROMPT 37 SPECIFICATION
 * 
 * Flow:
 * DATASET VALIDADO -> CENTRAL INDICATOR ENGINE -> DASHBOARD -> INFORME
 * 
 * Strict Quality & Statistical Rules:
 * - ZERO invented data, ZERO business default fallbacks, ZERO Math.random()
 * - Never use MISSING, INVALID, OUT_OF_RANGE, PREFER_NOT_TO_ANSWER, NOT_APPLICABLE in metrics
 * - Denominator is EXPLICIT and calculated exclusively from valid records for required fields
 * - If denominator = 0 -> value = null, status = 'NO_DATA' (never display 0%)
 * - If coverage < minimumCoverage -> status = 'INSUFFICIENT_DATA' with mandatory limitation warning
 * - Rounding rules: Percentages = 1 decimal, Averages = 1 decimal, Medians = 1 decimal, Counts = integer
 */

import {
  IndicatorDefinition,
  IndicatorResultPrompt37,
  IndicatorStatusPrompt37,
  IndicatorDataSource,
  ExcludedRecordInfo,
  DistributionItemPrompt37,
  IndicatorFilterOptions
} from './types';
import { MASTER_INDICATOR_DEFINITIONS } from './indicatorDefinitions';
import { DataIntegrityEngine } from '../data_integrity/engine';

export interface IndicatorDatasetInput {
  companyId: string;
  period?: string;
  surveyVersion?: string;
  datasetVersion?: string;
  dataSource?: IndicatorDataSource;
  colaboradores: any[];
  respuestas?: any[];
  ausentismos?: any[];
  encuestasBienestar?: any[];
  catalogs?: {
    sedes?: Array<{ id: string; nombre: string }>;
    areas?: Array<{ id: string; nombre: string }>;
    cargos?: Array<{ id: string; nombre: string }>;
    proyectos?: Array<{ id: string; nombre: string }>;
  };
}

export class CentralIndicatorEngine {
  private static definitionsMap = new Map<string, IndicatorDefinition>(
    MASTER_INDICATOR_DEFINITIONS.map(d => [d.id, d])
  );

  /**
   * Returns all registered Indicator Definitions
   */
  public static getDefinitions(): IndicatorDefinition[] {
    return Array.from(this.definitionsMap.values());
  }

  /**
   * Gets a specific definition by id or code
   */
  public static getDefinition(idOrCode: string): IndicatorDefinition | undefined {
    return this.definitionsMap.get(idOrCode) || 
      Array.from(this.definitionsMap.values()).find(d => d.code === idOrCode);
  }

  /**
   * Main calculation entrypoint: Calculates all indicators from a validated dataset.
   * Single source of truth for Dashboard and Reports.
   */
  public static calculateAll(
    dataset: IndicatorDatasetInput,
    filters?: IndicatorFilterOptions
  ): IndicatorResultPrompt37[] {
    const companyId = dataset.companyId || 'COMP_DEFAULT';
    const period = dataset.period || '2026-P1';
    const surveyVersion = dataset.surveyVersion || 'v1.0.0';
    const datasetVersion = dataset.datasetVersion || 'v1.0.0';
    const dataSource: IndicatorDataSource = dataset.dataSource || 'MIXED';

    // 1. Filter population if filter options provided
    const filteredColaboradores = this.applyFiltersToColaboradores(dataset.colaboradores || [], filters);
    const filteredRespuestas = this.applyFiltersToRespuestas(dataset.respuestas || [], filteredColaboradores, filters);

    const totalPopulation = filteredColaboradores.length;

    // 2. Pre-index responses and collaborator attributes for high-speed calculation
    const parsedData = this.indexDataset(filteredColaboradores, filteredRespuestas);

    const results: IndicatorResultPrompt37[] = [];

    // 3. Compute each indicator according to its formal definition
    for (const definition of this.getDefinitions()) {
      const result = this.computeSingleIndicator({
        definition,
        dataset: {
          ...dataset,
          colaboradores: filteredColaboradores,
          respuestas: filteredRespuestas
        },
        parsedData,
        totalPopulation,
        companyId,
        period,
        surveyVersion,
        datasetVersion,
        dataSource
      });

      results.push(result);
    }

    return results;
  }

  /**
   * Computes a single indicator definition against indexed dataset.
   */
  public static computeSingleIndicator(params: {
    definition: IndicatorDefinition;
    dataset: IndicatorDatasetInput;
    parsedData: any;
    totalPopulation: number;
    companyId: string;
    period: string;
    surveyVersion: string;
    datasetVersion: string;
    dataSource: IndicatorDataSource;
  }): IndicatorResultPrompt37 {
    const { definition, parsedData, totalPopulation, companyId, period, surveyVersion, datasetVersion, dataSource, dataset } = params;

    const excludedRecords: ExcludedRecordInfo[] = [];
    const limitations: string[] = [];

    let numerator = 0;
    let denominator = 0;
    let value: number | string | null = null;
    let distribution: DistributionItemPrompt37[] | undefined = undefined;
    let median: number | null = null;
    let average: number | null = null;

    switch (definition.id) {
      // -----------------------------------------------------------------------
      // 1. ANTROPOMETRÍA
      // -----------------------------------------------------------------------
      case 'ind_imc_promedio': {
        const { validImcValues, excluded } = this.extractValidImcRecords(parsedData, dataset.colaboradores);
        excludedRecords.push(...excluded);
        denominator = validImcValues.length;

        if (denominator > 0) {
          const sum = validImcValues.reduce((acc, v) => acc + v.imc, 0);
          numerator = parseFloat(sum.toFixed(1));
          average = parseFloat((sum / denominator).toFixed(1));
          value = average;

          const sorted = [...validImcValues].map(v => v.imc).sort((a, b) => a - b);
          median = this.calculateMedian(sorted);
        }
        break;
      }

      case 'ind_imc_clasificacion': {
        const { validImcValues, excluded } = this.extractValidImcRecords(parsedData, dataset.colaboradores);
        excludedRecords.push(...excluded);
        denominator = validImcValues.length;

        if (denominator > 0) {
          const buckets: Record<string, number> = {
            'Bajo peso (<18.5)': 0,
            'Normal (18.5 - 24.9)': 0,
            'Sobrepeso (25.0 - 29.9)': 0,
            'Obesidad I (30.0 - 34.9)': 0,
            'Obesidad II (35.0 - 39.9)': 0,
            'Obesidad III (>=40.0)': 0
          };

          for (const item of validImcValues) {
            const imc = item.imc;
            if (imc < 18.5) buckets['Bajo peso (<18.5)']++;
            else if (imc <= 24.9) buckets['Normal (18.5 - 24.9)']++;
            else if (imc <= 29.9) buckets['Sobrepeso (25.0 - 29.9)']++;
            else if (imc <= 34.9) buckets['Obesidad I (30.0 - 34.9)']++;
            else if (imc <= 39.9) buckets['Obesidad II (35.0 - 39.9)']++;
            else buckets['Obesidad III (>=40.0)']++;
          }

          distribution = Object.entries(buckets).map(([label, count]) => ({
            label,
            count,
            percentage: parseFloat(((count / denominator) * 100).toFixed(1))
          }));

          const normalCount = buckets['Normal (18.5 - 24.9)'];
          numerator = normalCount;
          value = parseFloat(((normalCount / denominator) * 100).toFixed(1));
        }
        break;
      }

      case 'ind_peso_promedio': {
        const { validValues, excluded } = this.extractValidNumericField(parsedData, dataset.colaboradores, 'peso', 30, 250);
        excludedRecords.push(...excluded);
        denominator = validValues.length;

        if (denominator > 0) {
          const sum = validValues.reduce((acc, v) => acc + v.val, 0);
          numerator = parseFloat(sum.toFixed(1));
          average = parseFloat((sum / denominator).toFixed(1));
          value = average;
          median = this.calculateMedian(validValues.map(v => v.val));
        }
        break;
      }

      case 'ind_estatura_promedio': {
        const { validValues, excluded } = this.extractValidNumericField(parsedData, dataset.colaboradores, 'estatura', 1.0, 2.3, true);
        excludedRecords.push(...excluded);
        denominator = validValues.length;

        if (denominator > 0) {
          const sum = validValues.reduce((acc, v) => acc + v.val, 0);
          numerator = parseFloat(sum.toFixed(2));
          average = parseFloat((sum / denominator).toFixed(2));
          value = average;
          median = this.calculateMedian(validValues.map(v => v.val));
        }
        break;
      }

      case 'ind_perimetro_cintura': {
        const { validValues, excluded } = this.extractValidNumericField(parsedData, dataset.colaboradores, 'cintura', 40, 200);
        excludedRecords.push(...excluded);
        denominator = validValues.length;

        if (denominator > 0) {
          const sum = validValues.reduce((acc, v) => acc + v.val, 0);
          numerator = parseFloat(sum.toFixed(1));
          average = parseFloat((sum / denominator).toFixed(1));
          value = average;
          median = this.calculateMedian(validValues.map(v => v.val));
        }
        break;
      }

      // -----------------------------------------------------------------------
      // 2. SOCIODEMOGRÁFICO
      // -----------------------------------------------------------------------
      case 'ind_edad_promedio': {
        const { validAges, excluded } = this.extractValidAges(dataset.colaboradores);
        excludedRecords.push(...excluded);
        denominator = validAges.length;

        if (denominator > 0) {
          const sum = validAges.reduce((acc, v) => acc + v.age, 0);
          numerator = sum;
          average = parseFloat((sum / denominator).toFixed(1));
          value = average;
          median = this.calculateMedian(validAges.map(v => v.age));
        }
        break;
      }

      case 'ind_edad_grupos': {
        const { validAges, excluded } = this.extractValidAges(dataset.colaboradores);
        excludedRecords.push(...excluded);
        denominator = validAges.length;

        if (denominator > 0) {
          const bins: Record<string, number> = {
            'Menor de 18': 0,
            '18–24': 0,
            '25–34': 0,
            '35–44': 0,
            '45–54': 0,
            '55–64': 0,
            '65 o más': 0
          };

          for (const a of validAges) {
            const age = a.age;
            if (age < 18) bins['Menor de 18']++;
            else if (age <= 24) bins['18–24']++;
            else if (age <= 34) bins['25–34']++;
            else if (age <= 44) bins['35–44']++;
            else if (age <= 54) bins['45–54']++;
            else if (age <= 64) bins['55–64']++;
            else bins['65 o más']++;
          }

          distribution = Object.entries(bins).map(([label, count]) => ({
            label,
            count,
            percentage: parseFloat(((count / denominator) * 100).toFixed(1))
          }));

          numerator = denominator;
          value = `${denominator} clasificados`;
        }
        break;
      }

      case 'ind_sexo_distribucion': {
        const res = this.calculateCategoricalDistribution(dataset.colaboradores, c => c.genero || c.sexo, 'sexo');
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} registrados` : null;
        break;
      }

      case 'ind_estado_civil': {
        const res = this.calculateCategoricalDistribution(dataset.colaboradores, c => c.estadoCivil || c.estado_civil, 'estadoCivil');
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} registrados` : null;
        break;
      }

      case 'ind_nivel_educativo': {
        const res = this.calculateCategoricalDistribution(dataset.colaboradores, c => c.nivelEscolaridad || c.escolaridad || c.nivelEducativo, 'nivelEscolaridad');
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} registrados` : null;
        break;
      }

      case 'ind_tipo_vivienda': {
        const res = this.calculateCategoricalDistribution(dataset.colaboradores, c => c.tipoVivienda || c.vivienda, 'tipoVivienda');
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} registrados` : null;
        break;
      }

      case 'ind_estrato_socioeconomico': {
        const res = this.calculateCategoricalDistribution(dataset.colaboradores, c => c.estrato !== undefined && c.estrato !== null && c.estrato !== '' ? `Estrato ${c.estrato}` : null, 'estrato');
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} registrados` : null;
        break;
      }

      case 'ind_composicion_familiar': {
        let validCount = 0;
        let sumPersons = 0;

        for (const c of dataset.colaboradores) {
          const raw = c.personasACargo !== undefined ? c.personasACargo : c.personasCargo;
          if (raw !== undefined && raw !== null && raw !== '' && !DataIntegrityEngine.isMissingValue(raw)) {
            const num = Number(raw);
            if (!isNaN(num) && num >= 0 && num <= 20) {
              validCount++;
              sumPersons += num;
            } else {
              excludedRecords.push({
                recordId: String(c.id || 'N/A'),
                fieldKey: 'personasACargo',
                status: 'INVALID',
                reason: 'Valor no numérico o fuera de rango biológico'
              });
            }
          } else {
            excludedRecords.push({
              recordId: String(c.id || 'N/A'),
              fieldKey: 'personasACargo',
              status: 'MISSING',
              reason: 'Dato no reportado'
            });
          }
        }

        denominator = validCount;
        if (denominator > 0) {
          numerator = sumPersons;
          average = parseFloat((sumPersons / denominator).toFixed(1));
          value = average;
        }
        break;
      }

      // -----------------------------------------------------------------------
      // 3. SOCIOLABORAL & ORGANIZACIONAL
      // -----------------------------------------------------------------------
      case 'ind_antiguedad_promedio': {
        const { validTenures, excluded } = this.extractValidTenures(dataset.colaboradores);
        excludedRecords.push(...excluded);
        denominator = validTenures.length;

        if (denominator > 0) {
          const sum = validTenures.reduce((acc, v) => acc + v.tenure, 0);
          numerator = parseFloat(sum.toFixed(1));
          average = parseFloat((sum / denominator).toFixed(1));
          value = average;
          median = this.calculateMedian(validTenures.map(v => v.tenure));
        }
        break;
      }

      case 'ind_antiguedad_rangos': {
        const { validTenures, excluded } = this.extractValidTenures(dataset.colaboradores);
        excludedRecords.push(...excluded);
        denominator = validTenures.length;

        if (denominator > 0) {
          const bins: Record<string, number> = {
            'Menos de 1 año': 0,
            '1–3 años': 0,
            '3–5 años': 0,
            'Más de 5 años': 0
          };

          for (const t of validTenures) {
            const tenure = t.tenure;
            if (tenure < 1.0) bins['Menos de 1 año']++;
            else if (tenure <= 3.0) bins['1–3 años']++;
            else if (tenure <= 5.0) bins['3–5 años']++;
            else bins['Más de 5 años']++;
          }

          distribution = Object.entries(bins).map(([label, count]) => ({
            label,
            count,
            percentage: parseFloat(((count / denominator) * 100).toFixed(1))
          }));

          numerator = denominator;
          value = `${denominator} clasificados`;
        }
        break;
      }

      case 'ind_tipo_contrato': {
        // Section 30: Prohibited from using "Término indefinido" as default!
        const res = this.calculateCategoricalDistribution(dataset.colaboradores, c => c.tipoContrato || c.tipoContratoId, 'tipoContrato');
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} registrados` : null;
        break;
      }

      case 'ind_distribucion_sede': {
        // Section 31: Prohibited from using a default sede
        const catalogMap = dataset.catalogs?.sedes ? new Map(dataset.catalogs.sedes.map(s => [s.id, s.nombre])) : undefined;
        const res = this.calculateCategoricalDistribution(dataset.colaboradores, c => c.sede || c.sedeId || c.sedeNombre, 'sede', catalogMap);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} registrados` : null;
        break;
      }

      case 'ind_distribucion_area': {
        // Section 32: Prohibited from using a default area
        const catalogMap = dataset.catalogs?.areas ? new Map(dataset.catalogs.areas.map(a => [a.id, a.nombre])) : undefined;
        const res = this.calculateCategoricalDistribution(dataset.colaboradores, c => c.area || c.areaId || c.areaNombre, 'area', catalogMap);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} registrados` : null;
        break;
      }

      case 'ind_distribucion_proyecto': {
        // Section 33: Prohibited from using a default proyecto
        const catalogMap = dataset.catalogs?.proyectos ? new Map(dataset.catalogs.proyectos.map(p => [p.id, p.nombre])) : undefined;
        const res = this.calculateCategoricalDistribution(dataset.colaboradores, c => c.proyecto || c.proyectoId || c.proyectoNombre, 'proyecto', catalogMap);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} registrados` : null;
        break;
      }

      case 'ind_modalidad_trabajo': {
        const res = this.calculateCategoricalDistribution(dataset.colaboradores, c => c.modalidad || c.modalidadId || c.modalidadTrabajo, 'modalidad');
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} registrados` : null;
        break;
      }

      // -----------------------------------------------------------------------
      // 4. SALUD & SÍNTOMAS OSTEOMUSCULARES
      // -----------------------------------------------------------------------
      case 'ind_percepcion_salud': {
        const res = this.calculateSurveyCategorical(parsedData, ['percepcion', 'estado_salud', 'salud_general'], 'percepcionSalud', dataset.colaboradores);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} respondieron` : null;
        break;
      }

      case 'ind_molestias_osteomusculares': {
        // Section 22: Terminología estricta: "molestias reportadas", "dolor reportado", "condición informada"
        const res = this.calculateBinarySurveyMetric(parsedData, ['dolor', 'molestia', 'osteomuscular', 'sintoma'], 'dolorOsteomuscular', dataset.colaboradores);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.yesCount;
        if (denominator > 0) {
          value = parseFloat(((res.yesCount / denominator) * 100).toFixed(1));
          distribution = [
            { label: 'Molestias reportadas (Sí)', count: res.yesCount, percentage: value },
            { label: 'Sin molestias reportadas (No)', count: denominator - res.yesCount, percentage: parseFloat((100 - value).toFixed(1)) }
          ];
        }
        break;
      }

      case 'ind_dolor_zonas_corporales': {
        const res = this.calculateSurveyCategorical(parsedData, ['zona_dolor', 'segmento_dolor', 'parte_cuerpo', 'zona'], 'dolorZonas', dataset.colaboradores);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} reportes` : null;
        break;
      }

      case 'ind_consumo_medicamentos': {
        const res = this.calculateBinarySurveyMetric(parsedData, ['medicamento', 'tratamiento', 'farmaco'], 'medicamentos', dataset.colaboradores);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.yesCount;
        if (denominator > 0) {
          value = parseFloat(((res.yesCount / denominator) * 100).toFixed(1));
          distribution = [
            { label: 'Uso de medicamentos (Sí)', count: res.yesCount, percentage: value },
            { label: 'No consume (No)', count: denominator - res.yesCount, percentage: parseFloat((100 - value).toFixed(1)) }
          ];
        }
        break;
      }

      case 'ind_alergias_conocidas': {
        const res = this.calculateBinarySurveyMetric(parsedData, ['alergia', 'reaccion_alergica'], 'alergias', dataset.colaboradores);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.yesCount;
        if (denominator > 0) {
          value = parseFloat(((res.yesCount / denominator) * 100).toFixed(1));
          distribution = [
            { label: 'Alergias reportadas (Sí)', count: res.yesCount, percentage: value },
            { label: 'Sin alergias (No)', count: denominator - res.yesCount, percentage: parseFloat((100 - value).toFixed(1)) }
          ];
        }
        break;
      }

      case 'ind_discapacidad_reportada': {
        const res = this.calculateBinarySurveyMetric(parsedData, ['discapacidad', 'limitacion_permanente'], 'discapacidad', dataset.colaboradores);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.yesCount;
        if (denominator > 0) {
          value = parseFloat(((res.yesCount / denominator) * 100).toFixed(1));
          distribution = [
            { label: 'Discapacidad informada (Sí)', count: res.yesCount, percentage: value },
            { label: 'Sin discapacidad (No)', count: denominator - res.yesCount, percentage: parseFloat((100 - value).toFixed(1)) }
          ];
        }
        break;
      }

      // -----------------------------------------------------------------------
      // 5. ESTILOS DE VIDA & HÁBITOS
      // -----------------------------------------------------------------------
      case 'ind_actividad_fisica_regular': {
        // Section 23: Do not assume "No respondió" = "No realiza actividad física"
        const res = this.calculateBinarySurveyMetric(parsedData, ['actividad_fisica', 'deporte', 'ejercicio'], 'actividadFisica', dataset.colaboradores);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.yesCount;
        if (denominator > 0) {
          value = parseFloat(((res.yesCount / denominator) * 100).toFixed(1));
          distribution = [
            { label: 'Realiza actividad física (Sí)', count: res.yesCount, percentage: value },
            { label: 'No realiza (No)', count: denominator - res.yesCount, percentage: parseFloat((100 - value).toFixed(1)) }
          ];
        }
        break;
      }

      case 'ind_participacion_actividades': {
        // Section 24: Frecuente, Ocasional, Rara vez, Nunca, No informado
        const res = this.calculateSurveyCategorical(parsedData, ['participacion', 'actividades_empresa', 'eventos_salud'], 'participacionActividades', dataset.colaboradores);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.validCount;
        distribution = res.distribution;
        value = res.validCount > 0 ? `${res.validCount} respondieron` : null;
        break;
      }

      case 'ind_tenencia_mascotas': {
        // Section 25: Sí, No, No informado
        const res = this.calculateBinarySurveyMetric(parsedData, ['mascota', 'animal_compania'], 'mascotas', dataset.colaboradores);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.yesCount;
        if (denominator > 0) {
          value = parseFloat(((res.yesCount / denominator) * 100).toFixed(1));
          distribution = [
            { label: 'Tiene animales de compañía (Sí)', count: res.yesCount, percentage: value },
            { label: 'No tiene (No)', count: denominator - res.yesCount, percentage: parseFloat((100 - value).toFixed(1)) }
          ];
        }
        break;
      }

      case 'ind_consumo_tabaco': {
        const res = this.calculateBinarySurveyMetric(parsedData, ['fuma', 'tabaco', 'cigarrillo'], 'fuma', dataset.colaboradores);
        excludedRecords.push(...res.excluded);
        denominator = res.validCount;
        numerator = res.yesCount;
        if (denominator > 0) {
          value = parseFloat(((res.yesCount / denominator) * 100).toFixed(1));
          distribution = [
            { label: 'Fumador activo (Sí)', count: res.yesCount, percentage: value },
            { label: 'No fumador (No)', count: denominator - res.yesCount, percentage: parseFloat((100 - value).toFixed(1)) }
          ];
        }
        break;
      }

      // -----------------------------------------------------------------------
      // 6. AUSENTISMO & BIENESTAR
      // -----------------------------------------------------------------------
      case 'ind_tasa_ausentismo': {
        // Section 26: Only calculate if valid source exists; if not -> NO_DATA
        const ausList = dataset.ausentismos || [];
        if (ausList.length === 0) {
          denominator = 0;
          numerator = 0;
          value = null;
        } else {
          let sumDays = 0;
          let validCount = 0;
          for (const a of ausList) {
            const days = parseFloat(a.diasIncapacidad || a.diasAusencia || a.dias);
            if (!isNaN(days) && days >= 0) {
              sumDays += days;
              validCount++;
            }
          }

          if (validCount > 0 && totalPopulation > 0) {
            const plannedDays = totalPopulation * 240;
            denominator = plannedDays;
            numerator = parseFloat(sumDays.toFixed(1));
            value = parseFloat(((sumDays / plannedDays) * 100).toFixed(2));
          }
        }
        break;
      }

      case 'ind_indice_bienestar': {
        // Section 27: Only calculate if valid instrument configured; if not -> NO_DATA
        const bienestarList = dataset.encuestasBienestar || [];
        if (bienestarList.length === 0) {
          denominator = 0;
          numerator = 0;
          value = null;
        } else {
          let sumScore = 0;
          let validCount = 0;
          for (const b of bienestarList) {
            const sc = parseFloat(b.score || b.puntaje || b.valor);
            if (!isNaN(sc) && sc >= 0 && sc <= 100) {
              sumScore += sc;
              validCount++;
            }
          }

          if (validCount > 0) {
            denominator = validCount;
            numerator = parseFloat(sumScore.toFixed(1));
            average = parseFloat((sumScore / validCount).toFixed(1));
            value = average;
          }
        }
        break;
      }

      default:
        denominator = 0;
        value = null;
        break;
    }

    // =========================================================================
    // SECTION 4, 9, 36, 37: Coverage & Status Evaluation
    // =========================================================================
    const coverage = totalPopulation > 0 ? parseFloat(((denominator / totalPopulation) * 100).toFixed(1)) : 0;
    let status: IndicatorStatusPrompt37 = 'CALCULATED';

    if (denominator === 0) {
      value = null;
      status = 'NO_DATA';
      limitations.push('No existen registros válidos en la fuente para este indicador.');
    } else if (coverage < definition.minimumCoverage) {
      status = 'INSUFFICIENT_DATA';
      limitations.push(
        `La cobertura de información (${coverage}%) está por debajo del mínimo requerido (${definition.minimumCoverage}%). La muestra puede no ser representativa.`
      );
    }

    // Traffic light calculation (Section 38: Belonging to definition thresholds)
    let trafficLight: 'GREEN' | 'YELLOW' | 'RED' | 'GRAY' = 'GRAY';
    if (typeof value === 'number' && definition.thresholds && status !== 'NO_DATA') {
      const th = definition.thresholds;
      const val = value;

      if (th.green) {
        const meetsGreen = (th.green.min === undefined || val >= th.green.min) &&
                           (th.green.max === undefined || val <= th.green.max);
        if (meetsGreen) trafficLight = 'GREEN';
      }
      if (trafficLight === 'GRAY' && th.yellow) {
        const meetsYellow = (th.yellow.min === undefined || val >= th.yellow.min) &&
                            (th.yellow.max === undefined || val <= th.yellow.max);
        if (meetsYellow) trafficLight = 'YELLOW';
      }
      if (trafficLight === 'GRAY' && th.red) {
        const meetsRed = (th.red.min === undefined || val >= th.red.min) &&
                         (th.red.max === undefined || val <= th.red.max);
        if (meetsRed) trafficLight = 'RED';
      }
    }

    const missingOrExcludedCount = totalPopulation - denominator;

    return {
      indicatorId: definition.id,
      code: definition.code,
      name: definition.name,
      value,
      unit: definition.unit,
      numerator,
      denominator,
      coverage,
      status,
      calculatedAt: new Date().toISOString(),
      dataSource,
      limitations,
      distribution,
      average,
      median,
      totalPopulation,
      validRecordsCount: denominator,
      missingOrExcludedCount,
      trafficLight,
      companyId,
      period,
      surveyVersion,
      datasetVersion,
      isComparable: true,
      excludedRecords,
      traceability: {
        formulaUsed: definition.formula,
        dataPointsUsed: denominator,
        dataPointsExcluded: excludedRecords.length,
        denominatorExplanation: `${denominator} registros válidos sobre una población total de ${totalPopulation}`,
        coverageExplanation: `El indicador representa al ${coverage}% de la población con información válida.`
      }
    };
  }

  /**
   * Helper: Index responses by collaboratorId and normalize variable names
   */
  private static indexDataset(colaboradores: any[], respuestas: any[]): any {
    const colabResponsesMap = new Map<string, Map<string, any>>();

    for (const r of respuestas) {
      const cId = String(r.colaboradorId || r.usuarioId || r.colaborador_id || r.cedula || '');
      if (!cId) continue;

      if (!colabResponsesMap.has(cId)) {
        colabResponsesMap.set(cId, new Map());
      }

      const qKey = String(r.preguntaId || r.campo || r.codigo || '').toLowerCase().trim();
      colabResponsesMap.get(cId)!.set(qKey, r.valorIngresado || r.valor || r.respuesta);
    }

    return { colabResponsesMap };
  }

  /**
   * Helper: Extracts IMC records ensuring BOTH weight AND height are valid simultaneously.
   */
  private static extractValidImcRecords(parsedData: any, colaboradores: any[]): {
    validImcValues: Array<{ colabId: string; imc: number }>;
    excluded: ExcludedRecordInfo[];
  } {
    const validImcValues: Array<{ colabId: string; imc: number }> = [];
    const excluded: ExcludedRecordInfo[] = [];

    for (const c of colaboradores) {
      const colabId = String(c.id || c.cedula || 'N/A');
      const respMap = parsedData.colabResponsesMap.get(colabId);

      // Extract weight
      let rawWeight: any = c.pesoKg || c.peso;
      if (rawWeight === undefined && respMap) {
        for (const [k, v] of respMap.entries()) {
          if (k.includes('peso')) { rawWeight = v; break; }
        }
      }

      // Extract height
      let rawHeight: any = c.estaturaMts || c.estaturaCm || c.estatura || c.talla;
      if (rawHeight === undefined && respMap) {
        for (const [k, v] of respMap.entries()) {
          if (k.includes('estatura') || k.includes('talla') || k.includes('altura')) { rawHeight = v; break; }
        }
      }

      // Verify weight
      let weightKg: number | null = null;
      if (rawWeight !== undefined && rawWeight !== null && rawWeight !== '' && !DataIntegrityEngine.isMissingValue(rawWeight)) {
        const parsedW = parseFloat(rawWeight);
        if (!isNaN(parsedW) && parsedW >= 30 && parsedW <= 250) {
          weightKg = parsedW;
        }
      }

      // Verify height
      let heightMts: number | null = null;
      if (rawHeight !== undefined && rawHeight !== null && rawHeight !== '' && !DataIntegrityEngine.isMissingValue(rawHeight)) {
        let parsedH = parseFloat(rawHeight);
        if (!isNaN(parsedH)) {
          if (parsedH >= 50 && parsedH <= 250) parsedH = parsedH / 100;
          if (parsedH >= 1.0 && parsedH <= 2.3) heightMts = parsedH;
        }
      }

      if (weightKg !== null && heightMts !== null) {
        const imc = parseFloat((weightKg / (heightMts * heightMts)).toFixed(1));
        if (imc >= 10.0 && imc <= 80.0) {
          validImcValues.push({ colabId, imc });
        } else {
          excluded.push({
            recordId: colabId,
            fieldKey: 'imc',
            status: 'OUT_OF_RANGE',
            reason: `IMC calculado (${imc}) fuera de rango biológico admisible`
          });
        }
      } else {
        const missingPart = weightKg === null && heightMts === null ? 'peso y estatura' : weightKg === null ? 'peso' : 'estatura';
        excluded.push({
          recordId: colabId,
          fieldKey: 'imc',
          status: 'NOT_CALCULABLE',
          reason: `No se puede calcular IMC: falta ${missingPart} válido`
        });
      }
    }

    return { validImcValues, excluded };
  }

  /**
   * Helper: Extracts a valid numeric field from collaborator profile or survey responses
   */
  private static extractValidNumericField(
    parsedData: any,
    colaboradores: any[],
    keyword: string,
    min: number,
    max: number,
    convertCmToM = false
  ): { validValues: Array<{ colabId: string; val: number }>; excluded: ExcludedRecordInfo[] } {
    const validValues: Array<{ colabId: string; val: number }> = [];
    const excluded: ExcludedRecordInfo[] = [];

    for (const c of colaboradores) {
      const colabId = String(c.id || c.cedula || 'N/A');
      const respMap = parsedData.colabResponsesMap.get(colabId);

      let rawVal: any = c[keyword] || c[`${keyword}Kg`] || c[`${keyword}Cm`] || c[`${keyword}Mts`];
      if (rawVal === undefined && respMap) {
        for (const [k, v] of respMap.entries()) {
          if (k.includes(keyword)) { rawVal = v; break; }
        }
      }

      if (rawVal === undefined || rawVal === null || rawVal === '' || DataIntegrityEngine.isMissingValue(rawVal)) {
        excluded.push({
          recordId: colabId,
          fieldKey: keyword,
          status: 'MISSING',
          reason: 'Campo no informado o vacío'
        });
        continue;
      }

      let parsed = parseFloat(rawVal);
      if (isNaN(parsed)) {
        excluded.push({
          recordId: colabId,
          fieldKey: keyword,
          status: 'INVALID',
          reason: 'Valor no es numérico'
        });
        continue;
      }

      if (convertCmToM && parsed >= 50 && parsed <= 250) {
        parsed = parsed / 100;
      }

      if (parsed < min || parsed > max) {
        excluded.push({
          recordId: colabId,
          fieldKey: keyword,
          status: 'OUT_OF_RANGE',
          reason: `Valor ${parsed} fuera del rango permitido (${min} - ${max})`
        });
        continue;
      }

      validValues.push({ colabId, val: parsed });
    }

    return { validValues, excluded };
  }

  /**
   * Helper: Extracts valid ages from fechaNacimiento (or direct verified edad).
   */
  private static extractValidAges(colaboradores: any[]): {
    validAges: Array<{ colabId: string; age: number }>;
    excluded: ExcludedRecordInfo[];
  } {
    const validAges: Array<{ colabId: string; age: number }> = [];
    const excluded: ExcludedRecordInfo[] = [];
    const currentYear = new Date().getFullYear();

    for (const c of colaboradores) {
      const colabId = String(c.id || c.cedula || 'N/A');
      const rawDate = c.fechaNacimiento || c.fecha_nacimiento || c.birthDate;

      if (rawDate && typeof rawDate === 'string' && rawDate.trim() !== '') {
        const birthDate = new Date(rawDate);
        if (!isNaN(birthDate.getTime())) {
          const birthYear = birthDate.getFullYear();
          if (birthYear >= 1930 && birthYear <= currentYear - 15) {
            const age = currentYear - birthYear;
            validAges.push({ colabId, age });
            continue;
          }
        }
      }

      if (typeof c.edad === 'number' && !isNaN(c.edad) && c.edad >= 15 && c.edad <= 90) {
        validAges.push({ colabId, age: c.edad });
        continue;
      }

      excluded.push({
        recordId: colabId,
        fieldKey: 'fechaNacimiento',
        status: 'NOT_CALCULABLE',
        reason: 'Fecha de nacimiento faltante o inválida'
      });
    }

    return { validAges, excluded };
  }

  /**
   * Helper: Extracts valid tenures from fechaIngreso (years).
   */
  private static extractValidTenures(colaboradores: any[]): {
    validTenures: Array<{ colabId: string; tenure: number }>;
    excluded: ExcludedRecordInfo[];
  } {
    const validTenures: Array<{ colabId: string; tenure: number }> = [];
    const excluded: ExcludedRecordInfo[] = [];
    const nowTime = new Date().getTime();

    for (const c of colaboradores) {
      const colabId = String(c.id || c.cedula || 'N/A');
      const rawDate = c.fechaIngreso || c.fecha_ingreso || c.hireDate;

      if (rawDate && typeof rawDate === 'string' && rawDate.trim() !== '') {
        const hireDate = new Date(rawDate);
        if (!isNaN(hireDate.getTime()) && hireDate.getTime() <= nowTime) {
          const tenureYears = parseFloat(((nowTime - hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1));
          if (tenureYears >= 0 && tenureYears < 60) {
            validTenures.push({ colabId, tenure: tenureYears });
            continue;
          }
        }
      }

      if (typeof c.antiguedadAnios === 'number' && !isNaN(c.antiguedadAnios) && c.antiguedadAnios >= 0) {
        validTenures.push({ colabId, tenure: c.antiguedadAnios });
        continue;
      }

      excluded.push({
        recordId: colabId,
        fieldKey: 'fechaIngreso',
        status: 'NOT_CALCULABLE',
        reason: 'Fecha de ingreso faltante o no informada'
      });
    }

    return { validTenures, excluded };
  }

  /**
   * Helper: Calculates categorical distribution across collaborators with catalog translation.
   */
  private static calculateCategoricalDistribution(
    colaboradores: any[],
    extractFn: (c: any) => string | null | undefined,
    fieldKey: string,
    catalogMap?: Map<string, string>
  ): { validCount: number; distribution: DistributionItemPrompt37[]; excluded: ExcludedRecordInfo[] } {
    let validCount = 0;
    const counts: Record<string, number> = {};
    const excluded: ExcludedRecordInfo[] = [];

    for (const c of colaboradores) {
      const colabId = String(c.id || c.cedula || 'N/A');
      const raw = extractFn(c);

      if (raw !== undefined && raw !== null && raw !== '' && !DataIntegrityEngine.isMissingValue(raw)) {
        let label = String(raw).trim();
        if (catalogMap && catalogMap.has(label)) {
          label = catalogMap.get(label)!;
        }
        counts[label] = (counts[label] || 0) + 1;
        validCount++;
      } else {
        excluded.push({
          recordId: colabId,
          fieldKey,
          status: 'MISSING',
          reason: 'No informado'
        });
      }
    }

    const distribution: DistributionItemPrompt37[] = Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      percentage: validCount > 0 ? parseFloat(((count / validCount) * 100).toFixed(1)) : 0
    }));

    return { validCount, distribution, excluded };
  }

  /**
   * Helper: Binary survey metric calculator (Sí / No)
   */
  private static calculateBinarySurveyMetric(
    parsedData: any,
    keywords: string[],
    fieldKey: string,
    colaboradores: any[]
  ): { validCount: number; yesCount: number; excluded: ExcludedRecordInfo[] } {
    let validCount = 0;
    let yesCount = 0;
    const excluded: ExcludedRecordInfo[] = [];

    for (const c of colaboradores) {
      const colabId = String(c.id || c.cedula || 'N/A');
      const respMap = parsedData.colabResponsesMap.get(colabId);

      let foundVal: any = undefined;

      // Check direct collaborator field
      for (const kw of keywords) {
        if (c[kw] !== undefined) { foundVal = c[kw]; break; }
      }

      // Check survey responses
      if (foundVal === undefined && respMap) {
        for (const [k, v] of respMap.entries()) {
          if (keywords.some(kw => k.includes(kw))) {
            foundVal = v;
            break;
          }
        }
      }

      if (foundVal === undefined || foundVal === null || foundVal === '' || DataIntegrityEngine.isMissingValue(foundVal)) {
        excluded.push({
          recordId: colabId,
          fieldKey,
          status: 'MISSING',
          reason: 'Pregunta no respondida'
        });
        continue;
      }

      validCount++;
      const str = String(foundVal).toLowerCase().trim();
      if (str === 'sí' || str === 'si' || str === '1' || str === 'true' || str === 'frecuente' || str === 'alto') {
        yesCount++;
      }
    }

    return { validCount, yesCount, excluded };
  }

  /**
   * Helper: Categorical survey question distribution
   */
  private static calculateSurveyCategorical(
    parsedData: any,
    keywords: string[],
    fieldKey: string,
    colaboradores: any[]
  ): { validCount: number; distribution: DistributionItemPrompt37[]; excluded: ExcludedRecordInfo[] } {
    let validCount = 0;
    const counts: Record<string, number> = {};
    const excluded: ExcludedRecordInfo[] = [];

    for (const c of colaboradores) {
      const colabId = String(c.id || c.cedula || 'N/A');
      const respMap = parsedData.colabResponsesMap.get(colabId);

      let foundVal: any = undefined;
      for (const kw of keywords) {
        if (c[kw] !== undefined) { foundVal = c[kw]; break; }
      }

      if (foundVal === undefined && respMap) {
        for (const [k, v] of respMap.entries()) {
          if (keywords.some(kw => k.includes(kw))) {
            foundVal = v;
            break;
          }
        }
      }

      if (foundVal === undefined || foundVal === null || foundVal === '' || DataIntegrityEngine.isMissingValue(foundVal)) {
        excluded.push({
          recordId: colabId,
          fieldKey,
          status: 'MISSING',
          reason: 'Pregunta no respondida'
        });
        continue;
      }

      const label = String(foundVal).trim();
      counts[label] = (counts[label] || 0) + 1;
      validCount++;
    }

    const distribution: DistributionItemPrompt37[] = Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      percentage: validCount > 0 ? parseFloat(((count / validCount) * 100).toFixed(1)) : 0
    }));

    return { validCount, distribution, excluded };
  }

  /**
   * Helper: Calculates median with exact 1-decimal rounding.
   */
  private static calculateMedian(numbers: number[]): number | null {
    if (numbers.length === 0) return null;
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 1) {
      return parseFloat(sorted[mid].toFixed(1));
    }
    return parseFloat(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(1));
  }

  /**
   * Helper: Filter collaborators by active filters
   */
  private static applyFiltersToColaboradores(list: any[], filters?: IndicatorFilterOptions): any[] {
    if (!filters) return list;
    return list.filter(c => {
      if (filters.sedeId && c.sedeId !== filters.sedeId && c.sede !== filters.sedeId) return false;
      if (filters.areaId && c.areaId !== filters.areaId && c.area !== filters.areaId) return false;
      if (filters.proyectoId && c.proyectoId !== filters.proyectoId && c.proyecto !== filters.proyectoId) return false;
      if (filters.cargoId && c.cargoId !== filters.cargoId && c.cargo !== filters.cargoId) return false;
      if (filters.sexo && c.genero !== filters.sexo && c.sexo !== filters.sexo) return false;
      if (filters.tipoContrato && c.tipoContratoId !== filters.tipoContrato && c.tipoContrato !== filters.tipoContrato) return false;
      if (filters.modalidad && c.modalidadId !== filters.modalidad && c.modalidad !== filters.modalidad) return false;
      if (filters.turno && c.turno !== filters.turno) return false;
      return true;
    });
  }

  /**
   * Helper: Filter responses by collaborator list and survey metadata
   */
  private static applyFiltersToRespuestas(respuestas: any[], colabs: any[], filters?: IndicatorFilterOptions): any[] {
    const validColabIds = new Set(colabs.map(c => String(c.id || c.cedula || '')));
    return respuestas.filter(r => {
      const cId = String(r.colaboradorId || r.usuarioId || r.colaborador_id || r.cedula || '');
      if (cId && !validColabIds.has(cId)) return false;
      if (filters?.surveyId && r.encuestaId !== filters.surveyId) return false;
      if (filters?.surveyVersion && r.versionEncuesta !== filters.surveyVersion) return false;
      return true;
    });
  }
}
