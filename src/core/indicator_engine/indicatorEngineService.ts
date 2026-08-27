/**
 * Core Indicator Calculation Engine
 * SG-SST Specification (PROMPT 15)
 * 
 * Guarantees zero synthetic data, zero default fallback values,
 * strict denominator calculation (valid records only), and full traceability.
 */

import { 
  IndicatorMetadata, 
  IndicatorFilterOptions, 
  IndicatorCategory, 
  DistributionItem, 
  IndicatorStatus 
} from './types';
import { DataIntegrityEngine } from '../data_integrity/engine';
import { masterDataModelService } from '../master_data_model/service';
import { catalogosService } from '../../modules/configuracion/catalogos.service';

export class IndicatorEngineService {

  /**
   * Calculates all SG-SST indicators for a specific company and set of filters.
   */
  public static calculateAllIndicators(filters: IndicatorFilterOptions): IndicatorMetadata[] {
    const companyId = filters.companyId;
    
    // 1. Fetch raw datasets from Master Database
    const rawColaboradores = masterDataModelService.getTableData('COLABORADORES')
      .filter((c: any) => !c.deletedAt && (!companyId || c.companyId === companyId || c.company_id === companyId));
    
    const rawRespuestas = masterDataModelService.getTableData('RESPUESTAS')
      .filter((r: any) => !companyId || r.companyId === companyId || r.company_id === companyId);

    const rawEncuestas = masterDataModelService.getTableData('ENCUESTAS')
      .filter((e: any) => !companyId || e.companyId === companyId || e.company_id === companyId);

    // 2. Fetch company catalogs to map IDs to real names
    const companyCatalogs: any = catalogosService.getCatalogsSync ? catalogosService.getCatalogsSync(companyId) : {};
    const catalogSedes = companyCatalogs.sedes || [];
    const catalogAreas = companyCatalogs.areas || [];
    const catalogCargos = companyCatalogs.cargos || [];
    const catalogProyectos = companyCatalogs.proyectos || [];


    // 3. Apply active filters to collaborators and survey responses
    const filteredColaboradores = this.filterColaboradores(rawColaboradores, filters);
    const filteredRespuestas = this.filterRespuestas(rawRespuestas, rawColaboradores, filters);

    const indicators: IndicatorMetadata[] = [];

    // ==========================================
    // 1. SOCIODEMOGRAPHIC INDICATORS
    // ==========================================
    indicators.push(...this.calculateSociodemographicIndicators(
      filteredColaboradores, 
      filteredRespuestas, 
      companyId,
      { catalogSedes, catalogAreas, catalogCargos, catalogProyectos }
    ));

    // ==========================================
    // 2. HEALTH CONDITIONS INDICATORS
    // ==========================================
    indicators.push(...this.calculateHealthConditionsIndicators(
      filteredRespuestas, 
      filteredColaboradores, 
      companyId
    ));

    // ==========================================
    // 3. ANTHROPOMETRY INDICATORS
    // ==========================================
    indicators.push(...this.calculateAnthropometryIndicators(
      filteredRespuestas, 
      filteredColaboradores, 
      companyId
    ));

    // ==========================================
    // 4. LIFESTYLE INDICATORS
    // ==========================================
    indicators.push(...this.calculateLifestyleIndicators(
      filteredRespuestas, 
      filteredColaboradores, 
      companyId
    ));

    // ==========================================
    // 5. SOCIOLABOR CONDITIONS INDICATORS
    // ==========================================
    indicators.push(...this.calculateSociolaborIndicators(
      filteredColaboradores, 
      companyId,
      { catalogSedes, catalogAreas, catalogCargos, catalogProyectos }
    ));

    return indicators;
  }

  // =========================================================================
  // FILTERING LOGIC
  // =========================================================================

  private static filterColaboradores(list: any[], filters: IndicatorFilterOptions): any[] {
    return list.filter(c => {
      if (filters.sedeId && c.sedeId !== filters.sedeId) return false;
      if (filters.areaId && c.areaId !== filters.areaId) return false;
      if (filters.proyectoId && c.proyectoId !== filters.proyectoId) return false;
      if (filters.cargoId && c.cargoId !== filters.cargoId) return false;
      if (filters.sexo && c.genero !== filters.sexo) return false;
      if (filters.tipoContrato && c.tipoContratoId !== filters.tipoContrato) return false;
      if (filters.modalidad && c.modalidadId !== filters.modalidad) return false;
      if (filters.jornada && c.jornadaId !== filters.jornada) return false;
      return true;
    });
  }

  private static filterRespuestas(respuestas: any[], colaboradores: any[], filters: IndicatorFilterOptions): any[] {
    const validColabIds = new Set(colaboradores.map(c => c.id));
    return respuestas.filter(r => {
      if (r.colaboradorId && !validColabIds.has(r.colaboradorId)) return false;
      if (filters.surveyId && r.encuestaId !== filters.surveyId) return false;
      if (filters.surveyVersion && r.versionEncuesta !== filters.surveyVersion) return false;
      return true;
    });
  }

  // =========================================================================
  // 1. SOCIODEMOGRAPHIC INDICATORS
  // =========================================================================

  private static calculateSociodemographicIndicators(
    colabs: any[], 
    respuestas: any[], 
    companyId: string,
    catalogs: { catalogSedes: any[]; catalogAreas: any[]; catalogCargos: any[]; catalogProyectos: any[] }
  ): IndicatorMetadata[] {
    const list: IndicatorMetadata[] = [];
    const total = colabs.length;

    // 1.1 Total Colaboradores
    list.push(this.buildMetadata({
      indicatorId: 'ind_demo_total_colaboradores',
      category: 'SOCIODEMOGRAPHIC',
      name: 'Total Colaboradores',
      description: 'Población activa censada en la empresa',
      companyId,
      sourceField: 'COLABORADORES.id',
      calculationMethod: 'COUNT',
      unit: 'Personas',
      totalRecords: total,
      validRecords: total,
      value: total,
      status: total > 0 ? 'COMPLETE' : 'NO_DATA'
    }));

    // Helper for categorical distributions
    const buildDistribution = (
      id: string, 
      name: string, 
      desc: string, 
      sourceField: string, 
      extractFn: (c: any) => string | null | undefined,
      catalogMap?: Map<string, string>
    ) => {
      let validCount = 0;
      const counts: Record<string, number> = {};

      colabs.forEach(c => {
        let val = extractFn(c);
        if (!DataIntegrityEngine.isMissingValue(val)) {
          let strVal = String(val).trim();
          if (catalogMap && catalogMap.has(strVal)) {
            strVal = catalogMap.get(strVal)!;
          }
          counts[strVal] = (counts[strVal] || 0) + 1;
          validCount++;
        }
      });

      const dist: DistributionItem[] = Object.entries(counts).map(([label, count]) => ({
        label,
        count,
        percentage: validCount > 0 ? parseFloat(((count / validCount) * 100).toFixed(1)) : 0
      }));

      const coverage = total > 0 ? parseFloat(((validCount / total) * 100).toFixed(1)) : 0;
      const status: IndicatorStatus = coverage === 100 ? 'COMPLETE' : coverage > 0 ? 'PARTIAL' : 'NO_DATA';

      list.push(this.buildMetadata({
        indicatorId: id,
        category: 'SOCIODEMOGRAPHIC',
        name,
        description: desc,
        companyId,
        sourceField,
        calculationMethod: 'DISTRIBUTION',
        unit: '%',
        totalRecords: total,
        validRecords: validCount,
        value: validCount > 0 ? `${validCount} clasificados (${coverage}%)` : null,
        distribution: dist,
        status
      }));
    };

    // Catalog maps
    const mapSedes = new Map(catalogs.catalogSedes.map(s => [s.id, s.nombre]));
    const mapAreas = new Map(catalogs.catalogAreas.map(a => [a.id, a.nombre]));
    const mapCargos = new Map(catalogs.catalogCargos.map(c => [c.id, c.nombre]));
    const mapProyectos = new Map(catalogs.catalogProyectos.map(p => [p.id, p.nombre]));

    // 1.2 Sexo
    buildDistribution('ind_demo_sexo', 'Distribución por Sexo', 'Composición por género reportado', 'COLABORADORES.genero', c => c.genero);

    // 1.3 Estado Civil
    buildDistribution('ind_demo_estado_civil', 'Estado Civil', 'Distribución por estado civil', 'COLABORADORES.estadoCivil', c => c.estadoCivil);

    // 1.4 Sede
    buildDistribution('ind_demo_sede', 'Distribución por Sede', 'Población asignada a sedes parametrizadas', 'COLABORADORES.sedeId', c => c.sedeId, mapSedes);

    // 1.5 Área
    buildDistribution('ind_demo_area', 'Distribución por Área', 'Población por área organizacional', 'COLABORADORES.areaId', c => c.areaId, mapAreas);

    // 1.6 Cargo
    buildDistribution('ind_demo_cargo', 'Distribución por Cargo', 'Población por cargo estructurado', 'COLABORADORES.cargoId', c => c.cargoId, mapCargos);

    // 1.7 Nivel Educativo
    buildDistribution('ind_demo_nivel_educativo', 'Nivel Educativo', 'Máximo nivel de escolaridad alcanzado', 'COLABORADORES.nivelEscolaridad', c => c.nivelEscolaridad);

    // 1.8 Tipo de Vivienda
    buildDistribution('ind_demo_tipo_vivienda', 'Tipo de Vivienda', 'Condición de tenencia de vivienda', 'COLABORADORES.tipoVivienda', c => c.tipoVivienda);

    // 1.9 Tipo de Contrato
    buildDistribution('ind_demo_tipo_contrato', 'Tipo de Contrato', 'Modalidad de vinculación laboral', 'COLABORADORES.tipoContratoId', c => c.tipoContratoId);

    // 1.10 Modalidad de Trabajo
    buildDistribution('ind_demo_modalidad', 'Modalidad de Trabajo', 'Trabajo presencial, remoto o híbrido', 'COLABORADORES.modalidadId', c => c.modalidadId);

    // 1.11 Rangos de Edad (Calculated safely from fechaNacimiento)
    let validAgeCount = 0;
    const ageBins: Record<string, number> = { '< 25 años': 0, '25 - 34 años': 0, '35 - 44 años': 0, '45 - 54 años': 0, '55+ años': 0 };

    colabs.forEach(c => {
      if (!DataIntegrityEngine.isMissingValue(c.fechaNacimiento)) {
        const birthYear = new Date(c.fechaNacimiento).getFullYear();
        const currentYear = new Date().getFullYear();
        if (!isNaN(birthYear) && birthYear > 1930 && birthYear <= currentYear) {
          const age = currentYear - birthYear;
          validAgeCount++;
          if (age < 25) ageBins['< 25 años']++;
          else if (age <= 34) ageBins['25 - 34 años']++;
          else if (age <= 44) ageBins['35 - 44 años']++;
          else if (age <= 54) ageBins['45 - 54 años']++;
          else ageBins['55+ años']++;
        }
      }
    });

    const ageDist: DistributionItem[] = Object.entries(ageBins).map(([label, count]) => ({
      label,
      count,
      percentage: validAgeCount > 0 ? parseFloat(((count / validAgeCount) * 100).toFixed(1)) : 0
    }));

    const ageCoverage = total > 0 ? parseFloat(((validAgeCount / total) * 100).toFixed(1)) : 0;

    list.push(this.buildMetadata({
      indicatorId: 'ind_demo_rangos_edad',
      category: 'SOCIODEMOGRAPHIC',
      name: 'Rangos de Edad',
      description: 'Distribución etaria de los colaboradores',
      companyId,
      sourceField: 'COLABORADORES.fechaNacimiento',
      calculationMethod: 'DISTRIBUTION',
      unit: '%',
      totalRecords: total,
      validRecords: validAgeCount,
      value: validAgeCount > 0 ? `${validAgeCount} evaluados (${ageCoverage}%)` : null,
      distribution: ageDist,
      status: ageCoverage === 100 ? 'COMPLETE' : ageCoverage > 0 ? 'PARTIAL' : 'NO_DATA'
    }));

    return list;
  }

  // =========================================================================
  // 2. HEALTH CONDITIONS INDICATORS
  // =========================================================================

  private static calculateHealthConditionsIndicators(
    respuestas: any[], 
    colabs: any[], 
    companyId: string
  ): IndicatorMetadata[] {
    const list: IndicatorMetadata[] = [];
    const total = colabs.length;

    // List of standard health condition variables
    const healthVariables = [
      { id: 'ind_health_discapacidad', name: 'Discapacidad', keys: ['discapacidad', 'poseeDiscapacidad'] },
      { id: 'ind_health_cond_diagnostica', name: 'Condiciones de Salud Diagnosticadas', keys: ['diagnosticos', 'condicionSalud'] },
      { id: 'ind_health_enfermedades_cronicas', name: 'Enfermedades Crónicas', keys: ['enfermedadCronica', 'cronicas'] },
      { id: 'ind_health_medicamentos', name: 'Medicamentos Permanentes', keys: ['medicamentos', 'tomaMedicamentos'] },
      { id: 'ind_health_alergias', name: 'Alergias Conocidas', keys: ['alergias', 'poseeAlergias'] },
      { id: 'ind_health_antecedentes_med', name: 'Antecedentes Médicos', keys: ['antecedentesMedicos'] },
      { id: 'ind_health_antecedentes_quir', name: 'Antecedentes Quirúrgicos', keys: ['antecedentesQuirurgicos'] },
      { id: 'ind_health_accidentes_lab', name: 'Accidentes Laborales Previos', keys: ['accidentesLaborales', 'accidentesTrabajo'] },
      { id: 'ind_health_incapacidades', name: 'Incapacidades en el último año', keys: ['incapacidades', 'diasIncapacidad'] },
      { id: 'ind_health_dolor_cuello', name: 'Molestia / Dolor de Cuello', keys: ['dolorCuello', 'cuello'] },
      { id: 'ind_health_dolor_espalda', name: 'Molestia / Dolor de Espalda o Lumbar', keys: ['dolorEspalda', 'dolorLumbar', 'lumbar'] },
      { id: 'ind_health_dolor_manos', name: 'Molestia / Dolor en Muñecas o Manos', keys: ['dolorMuneca', 'dolorManos', 'manos'] },
      { id: 'ind_health_alteraciones_sueno', name: 'Alteraciones del Sueño', keys: ['alteracionesSueno', 'insomnio'] },
      { id: 'ind_health_estres', name: 'Estrés Percibido Nivel Alto', keys: ['estres', 'nivelEstres'] },
      { id: 'ind_health_salud_visual', name: 'Alteración Salud Visual', keys: ['saludVisual', 'vision'] },
      { id: 'ind_health_salud_auditiva', name: 'Alteración Salud Auditiva', keys: ['saludAuditiva', 'audicion'] }
    ];

    healthVariables.forEach(hVar => {
      let matchedResponses: any[] = [];
      
      // Search in respuestas table or collaborator medical attributes
      respuestas.forEach(r => {
        const pKey = (r.preguntaId || '').toLowerCase();
        const matches = hVar.keys.some(k => pKey.includes(k.toLowerCase()));
        if (matches && !DataIntegrityEngine.isMissingValue(r.valorIngresado)) {
          matchedResponses.push(r);
        }
      });

      const validCount = matchedResponses.length;

      if (validCount === 0) {
        // PROMPT 15 SPECIFICATION: If question was NOT asked -> Display "No evaluado"
        list.push(this.buildMetadata({
          indicatorId: hVar.id,
          category: 'HEALTH',
          name: hVar.name,
          description: 'Evaluación de condición de salud según encuesta sociodemográfica',
          companyId,
          sourceField: `RESPUESTAS.${hVar.keys[0]}`,
          calculationMethod: 'PERCENTAGE',
          unit: '%',
          totalRecords: total,
          validRecords: 0,
          value: null,
          distribution: [
            { label: 'No evaluado', count: total, percentage: 100, status: 'No evaluado' }
          ],
          status: 'NO_DATA'
        }));
      } else {
        // Count Yes vs No answers
        let yesCount = 0;
        let noCount = 0;

        matchedResponses.forEach(r => {
          const str = String(r.valorIngresado).toLowerCase().trim();
          if (str === 'sí' || str === 'si' || str === '1' || str === 'true' || str === 'frecuente' || str === 'alto') {
            yesCount++;
          } else {
            noCount++;
          }
        });

        // Denominator MUST be validCount ONLY!
        const yesPct = parseFloat(((yesCount / validCount) * 100).toFixed(1));
        const noPct = parseFloat(((noCount / validCount) * 100).toFixed(1));

        const coverage = total > 0 ? parseFloat(((validCount / total) * 100).toFixed(1)) : 0;

        list.push(this.buildMetadata({
          indicatorId: hVar.id,
          category: 'HEALTH',
          name: hVar.name,
          description: 'Prevalencia de condición reportada sobre registros evaluados',
          companyId,
          sourceField: `RESPUESTAS.${hVar.keys[0]}`,
          calculationMethod: 'PERCENTAGE',
          unit: '%',
          totalRecords: total,
          validRecords: validCount,
          value: yesPct,
          distribution: [
            { label: 'Sí', count: yesCount, percentage: yesPct },
            { label: 'No', count: noCount, percentage: noPct }
          ],
          status: coverage === 100 ? 'COMPLETE' : 'PARTIAL'
        }));
      }
    });

    return list;
  }

  // =========================================================================
  // 3. ANTHROPOMETRY INDICATORS
  // =========================================================================

  private static calculateAnthropometryIndicators(
    respuestas: any[], 
    colabs: any[], 
    companyId: string
  ): IndicatorMetadata[] {
    const list: IndicatorMetadata[] = [];
    const total = colabs.length;

    // Search for weight and height in responses
    const weightMap = new Map<string, number>();
    const heightMap = new Map<string, number>();

    respuestas.forEach(r => {
      const pKey = (r.preguntaId || '').toLowerCase();
      const colabKey = r.colaboradorId || r.usuarioId;
      if (!colabKey) return;

      const val = parseFloat(r.valorIngresado);
      if (isNaN(val) || val <= 0) return;

      if (pKey.includes('peso')) {
        weightMap.set(colabKey, val);
      } else if (pKey.includes('estatura') || pKey.includes('talla') || pKey.includes('altura')) {
        // Convert cm to meters if needed
        const heightMeters = val > 3 ? val / 100 : val;
        heightMap.set(colabKey, heightMeters);
      }
    });

    // Calculate IMC ONLY when BOTH weight and height exist simultaneously for the same person
    let validImcCount = 0;
    const imcCategoryCounts: Record<string, number> = {
      'Bajo peso (<18.5)': 0,
      'Normal (18.5 - 24.9)': 0,
      'Sobrepeso (25.0 - 29.9)': 0,
      'Obesidad Grado I (30.0 - 34.9)': 0,
      'Obesidad Grado II (35.0 - 39.9)': 0,
      'Obesidad Grado III (>= 40)': 0
    };

    weightMap.forEach((weight, colabKey) => {
      const height = heightMap.get(colabKey);
      if (height && height > 0) {
        const imc = weight / (height * height);
        if (!isNaN(imc) && imc > 10 && imc < 80) {
          validImcCount++;
          if (imc < 18.5) imcCategoryCounts['Bajo peso (<18.5)']++;
          else if (imc <= 24.9) imcCategoryCounts['Normal (18.5 - 24.9)']++;
          else if (imc <= 29.9) imcCategoryCounts['Sobrepeso (25.0 - 29.9)']++;
          else if (imc <= 34.9) imcCategoryCounts['Obesidad Grado I (30.0 - 34.9)']++;
          else if (imc <= 39.9) imcCategoryCounts['Obesidad Grado II (35.0 - 39.9)']++;
          else imcCategoryCounts['Obesidad Grado III (>= 40)']++;
        }
      }
    });

    const imcDist: DistributionItem[] = Object.entries(imcCategoryCounts).map(([label, count]) => ({
      label,
      count,
      percentage: validImcCount > 0 ? parseFloat(((count / validImcCount) * 100).toFixed(1)) : 0
    }));

    const imcCoverage = total > 0 ? parseFloat(((validImcCount / total) * 100).toFixed(1)) : 0;

    list.push(this.buildMetadata({
      indicatorId: 'ind_antropo_imc',
      category: 'ANTHROPOMETRY',
      name: 'Índice de Masa Corporal (IMC)',
      description: 'Clasificación nutricional calculada exclusivamente cuando existen simultáneamente peso y estatura válidos',
      companyId,
      sourceField: 'RESPUESTAS.peso & RESPUESTAS.estatura',
      calculationMethod: 'CALCULATED',
      unit: '%',
      totalRecords: total,
      validRecords: validImcCount,
      value: validImcCount > 0 ? `${validImcCount} evaluables (${imcCoverage}%)` : null,
      distribution: imcDist,
      status: imcCoverage === 100 ? 'COMPLETE' : imcCoverage > 0 ? 'PARTIAL' : 'NO_DATA'
    }));

    return list;
  }

  // =========================================================================
  // 4. LIFESTYLE INDICATORS
  // =========================================================================

  private static calculateLifestyleIndicators(
    respuestas: any[], 
    colabs: any[], 
    companyId: string
  ): IndicatorMetadata[] {
    const list: IndicatorMetadata[] = [];
    const total = colabs.length;

    const lifestyleVars = [
      { id: 'ind_lifestyle_actividad_fisica', name: 'Actividad Física Regular', key: 'actividadFisica' },
      { id: 'ind_lifestyle_tabaco', name: 'Consumo de Tabaco / Cigarrillo', key: 'fuma' },
      { id: 'ind_lifestyle_alcohol', name: 'Consumo de Alcohol', key: 'alcohol' },
      { id: 'ind_lifestyle_mascotas', name: 'Tenencia de Mascotas', key: 'mascotas' }
    ];

    lifestyleVars.forEach(lVar => {
      const validResp = respuestas.filter(r => 
        (r.preguntaId || '').toLowerCase().includes(lVar.key.toLowerCase()) && 
        !DataIntegrityEngine.isMissingValue(r.valorIngresado)
      );

      const validCount = validResp.length;
      if (validCount === 0) {
        list.push(this.buildMetadata({
          indicatorId: lVar.id,
          category: 'LIFESTYLE',
          name: lVar.name,
          description: 'Hábito de estilo de vida reportado en encuestas',
          companyId,
          sourceField: `RESPUESTAS.${lVar.key}`,
          calculationMethod: 'PERCENTAGE',
          unit: '%',
          totalRecords: total,
          validRecords: 0,
          value: null,
          distribution: [{ label: 'No evaluado', count: total, percentage: 100 }],
          status: 'NO_DATA'
        }));
      } else {
        let yesCount = 0;
        validResp.forEach(r => {
          const str = String(r.valorIngresado).toLowerCase();
          if (str.includes('si') || str.includes('sí') || str === '1' || str === 'true') yesCount++;
        });

        const pct = parseFloat(((yesCount / validCount) * 100).toFixed(1));
        const coverage = total > 0 ? parseFloat(((validCount / total) * 100).toFixed(1)) : 0;

        list.push(this.buildMetadata({
          indicatorId: lVar.id,
          category: 'LIFESTYLE',
          name: lVar.name,
          description: 'Hábito reportado sobre personas que respondieron la encuesta',
          companyId,
          sourceField: `RESPUESTAS.${lVar.key}`,
          calculationMethod: 'PERCENTAGE',
          unit: '%',
          totalRecords: total,
          validRecords: validCount,
          value: pct,
          distribution: [
            { label: 'Sí', count: yesCount, percentage: pct },
            { label: 'No', count: validCount - yesCount, percentage: parseFloat((100 - pct).toFixed(1)) }
          ],
          status: coverage === 100 ? 'COMPLETE' : 'PARTIAL'
        }));
      }
    });

    return list;
  }

  // =========================================================================
  // 5. SOCIOLABOR CONDITIONS INDICATORS
  // =========================================================================

  private static calculateSociolaborIndicators(
    colabs: any[], 
    companyId: string,
    catalogs: { catalogSedes: any[]; catalogAreas: any[]; catalogCargos: any[]; catalogProyectos: any[] }
  ): IndicatorMetadata[] {
    const list: IndicatorMetadata[] = [];
    const total = colabs.length;

    // Calculate Antigüedad Promedio (Tenure in years from fechaIngreso)
    let validTenureCount = 0;
    let sumTenureYears = 0;

    colabs.forEach(c => {
      if (!DataIntegrityEngine.isMissingValue(c.fechaIngreso)) {
        const ingresoDate = new Date(c.fechaIngreso);
        if (!isNaN(ingresoDate.getTime())) {
          const diffYears = (new Date().getTime() - ingresoDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
          if (diffYears >= 0 && diffYears < 60) {
            sumTenureYears += diffYears;
            validTenureCount++;
          }
        }
      }
    });

    const avgTenure = validTenureCount > 0 ? parseFloat((sumTenureYears / validTenureCount).toFixed(1)) : null;
    const tenureCoverage = total > 0 ? parseFloat(((validTenureCount / total) * 100).toFixed(1)) : 0;

    list.push(this.buildMetadata({
      indicatorId: 'ind_labor_antiguedad_promedio',
      category: 'SOCIOLABOR',
      name: 'Antigüedad Promedio Global',
      description: 'Años promedio de permanencia en la organización',
      companyId,
      sourceField: 'COLABORADORES.fechaIngreso',
      calculationMethod: 'AVERAGE',
      unit: 'Años',
      totalRecords: total,
      validRecords: validTenureCount,
      value: avgTenure,
      status: tenureCoverage === 100 ? 'COMPLETE' : tenureCoverage > 0 ? 'PARTIAL' : 'NO_DATA'
    }));

    return list;
  }

  // Helper to attach metadata and strict warnings
  private static buildMetadata(params: {
    indicatorId: string;
    category: IndicatorCategory;
    name: string;
    description: string;
    companyId: string;
    sourceField: string;
    calculationMethod: any;
    unit: string;
    totalRecords: number;
    validRecords: number;
    value: number | string | null;
    distribution?: DistributionItem[];
    status: IndicatorStatus;
  }): IndicatorMetadata {
    const missing = params.totalRecords - params.validRecords;
    const coverage = params.totalRecords > 0 ? parseFloat(((params.validRecords / params.totalRecords) * 100).toFixed(1)) : 0;
    
    let warning: string | undefined = undefined;
    if (coverage < 80 && coverage > 0) {
      warning = 'Interpretar con precaución: cobertura limitada.';
    }

    return {
      indicatorId: params.indicatorId,
      category: params.category,
      name: params.name,
      description: params.description,
      companyId: params.companyId,
      sourceField: params.sourceField,
      calculationMethod: params.calculationMethod,
      unit: params.unit,
      totalRecords: params.totalRecords,
      validRecords: params.validRecords,
      missingRecords: missing,
      coveragePercentage: coverage,
      value: params.value,
      distribution: params.distribution,
      status: params.status,
      calculatedAt: new Date().toISOString(),
      warning
    };
  }

}
