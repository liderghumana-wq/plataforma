import { DemographicsData } from '../types';

export interface InconsistencyIssue {
  indicator: string;       // Indicador afectado (e.g. "Sexo", "Mascotas", etc.)
  expectedCount: string | number; // Cantidad esperada
  foundCount: string | number;    // Cantidad encontrada
  origin: string;          // Origen del problema
  affectedRecords: number; // Cantidad de registros afectados
  cause: string;           // Explicación detallada de la discrepancia
  severity: 'critical' | 'warning';
}

export interface ValidationReport {
  isConsistent: boolean;
  qualityPercentage: number;
  qualityLevel: 'Excelente' | 'Buena' | 'Regular' | 'Deficiente';
  issues: InconsistencyIssue[];
}

/**
 * Runs a rigorous automatic consistency audit on DemographicsData.
 * Checks matches for: Total employees, Sexo, Edad, Estado civil, Escolaridad, Ciudad,
 * Estrato, Vivienda, IMC, Antigüedad, Hijos, Mascotas, Grupo étnico, Grupo sanguíneo,
 * Porcentajes y Todos los gráficos.
 * Sums must be 100% exact.
 */
export function auditDemographicsData(data: DemographicsData | null): ValidationReport {
  if (!data) {
    return {
      isConsistent: false,
      qualityPercentage: 0,
      qualityLevel: 'Deficiente',
      issues: [
        {
          indicator: 'Base de Datos',
          expectedCount: 'Base de Datos cargada',
          foundCount: 'No hay datos',
          origin: 'Archivo de Entrada / LocalStorage',
          affectedRecords: 0,
          cause: 'No se ha cargado ninguna base de datos activa.',
          severity: 'critical',
        },
      ],
    };
  }

  const issues: InconsistencyIssue[] = [];
  const N = data.totalEmployees || 0;

  // 1. Total de colaboradores
  if (N <= 0) {
    issues.push({
      indicator: 'Total de colaboradores',
      expectedCount: 'Nómina > 0',
      foundCount: N,
      origin: 'KPI Principal de Nómina',
      affectedRecords: 0,
      cause: 'El total de colaboradores de la nómina es cero o un valor negativo.',
      severity: 'critical',
    });
  }

  // Helper to check sum of categorical counts against totalEmployees
  const checkCategoricalSumExact = (
    array: any[] | undefined,
    countProp: string,
    indicatorName: string,
    originName: string
  ) => {
    if (!array || array.length === 0) {
      issues.push({
        indicator: indicatorName,
        expectedCount: N,
        foundCount: 0,
        origin: originName,
        affectedRecords: N,
        cause: `Faltan los registros de categorización de ${indicatorName.toLowerCase()}. El arreglo está vacío o no existe.`,
        severity: 'critical',
      });
      return;
    }

    const sum = array.reduce((acc, curr) => {
      if (curr[countProp] !== undefined) return acc + curr[countProp];
      if (curr.value !== undefined) return acc + curr.value;
      if (curr.count !== undefined) return acc + curr.count;
      return acc + (curr.agents || 0);
    }, 0);

    if (sum !== N) {
      const diff = Math.abs(sum - N);
      issues.push({
        indicator: indicatorName,
        expectedCount: N,
        foundCount: sum,
        origin: originName,
        affectedRecords: diff,
        cause: `La sumatoria de colaboradores en ${originName.toLowerCase()} (${sum}) no coincide exactamente con el total general de nómina (${N}).`,
        severity: 'critical',
      });
    }
  };

  // 2. Sexo
  checkCategoricalSumExact(data.gender, 'value', 'Sexo', 'Distribución por Sexo');

  // 3. Edad
  checkCategoricalSumExact(data.ageGroups, 'value', 'Edad', 'Grupos de Edad');
  if (data.averageAge < 18 || data.averageAge > 80) {
    issues.push({
      indicator: 'Edad',
      expectedCount: 'Entre 18 y 80 años',
      foundCount: `${data.averageAge} años`,
      origin: 'Edad promedio',
      affectedRecords: N,
      cause: `La edad promedio reportada (${data.averageAge} años) está fuera del límite biológico laboral razonable (18-80).`,
      severity: 'critical',
    });
  }

  // 4. Estado civil
  checkCategoricalSumExact(data.maritalStatus, 'count', 'Estado civil', 'Distribución de Estado Civil');

  // 5. Escolaridad
  checkCategoricalSumExact(data.education, 'count', 'Escolaridad', 'Nivel de Escolaridad');

  // 6. Ciudad
  checkCategoricalSumExact(data.city, 'count', 'Ciudad', 'Distribución de Ciudades de Labor');

  // 7. Estrato
  checkCategoricalSumExact(data.socioeconomicStrata, 'count', 'Estrato', 'Nivel Socioeconómico (Estrato)');

  // 8. Vivienda
  checkCategoricalSumExact(data.housing, 'count', 'Vivienda', 'Tipo de Vivienda');

  // 9. IMC
  checkCategoricalSumExact(data.imcClassification, 'count', 'IMC', 'Clasificación de IMC');
  const height = data.averageHeight || 0;
  const weight = data.averageWeight || 0;
  const imc = data.averageIMC || 0;
  if (height > 0 && weight > 0) {
    if (height < 1.0 || height > 2.5) {
      issues.push({
        indicator: 'IMC',
        expectedCount: '1.0m - 2.5m',
        foundCount: `${height}m`,
        origin: 'Estatura promedio',
        affectedRecords: N,
        cause: `La estatura promedio reportada (${height} m) es irreal o está mal escalada.`,
        severity: 'critical',
      });
    }
    if (weight < 30 || weight > 250) {
      issues.push({
        indicator: 'IMC',
        expectedCount: '30kg - 250kg',
        foundCount: `${weight}kg`,
        origin: 'Peso promedio',
        affectedRecords: N,
        cause: `El peso promedio reportado (${weight} kg) está fuera de rangos normales de distribución.`,
        severity: 'critical',
      });
    }
    if (imc <= 10 || imc >= 60) {
      issues.push({
        indicator: 'IMC',
        expectedCount: '15.0 - 45.0',
        foundCount: imc.toFixed(1),
        origin: 'Cálculo Teórico de IMC',
        affectedRecords: N,
        cause: `El IMC promedio reportado (${imc}) se encuentra fuera de rangos biológicamente admisibles.`,
        severity: 'critical',
      });
    }
  }

  // 10. Antigüedad
  const roleSeniority = data.averageSeniorityRole || 0;
  if (data.averageSeniority < 0 || roleSeniority < 0) {
    issues.push({
      indicator: 'Antigüedad',
      expectedCount: '>= 0 años',
      foundCount: `Compañía: ${data.averageSeniority}, Cargo: ${roleSeniority}`,
      origin: 'Años de Antigüedad',
      affectedRecords: N,
      cause: 'Se reportan años de antigüedad negativos en el perfil de colaboradores.',
      severity: 'critical',
    });
  }
  if (roleSeniority > data.averageSeniority) {
    issues.push({
      indicator: 'Antigüedad',
      expectedCount: `<= ${data.averageSeniority} años (Antigüedad Compañía)`,
      foundCount: `${roleSeniority} años`,
      origin: 'Antigüedad en el Cargo',
      affectedRecords: N,
      cause: `La antigüedad promedio en el cargo actual (${roleSeniority} años) es mayor que la antigüedad general en la compañía (${data.averageSeniority} años).`,
      severity: 'critical',
    });
  }
  if (data.averageSeniority >= data.averageAge - 15) {
    issues.push({
      indicator: 'Antigüedad',
      expectedCount: `< ${Number((data.averageAge - 15).toFixed(1))} años (Edad - 15 años de edad laboral)`,
      foundCount: `${data.averageSeniority} años`,
      origin: 'Antigüedad vs Edad',
      affectedRecords: N,
      cause: `La antigüedad promedio (${data.averageSeniority} años) es biológicamente inconsistente con la edad promedio (${data.averageAge} años).`,
      severity: 'critical',
    });
  }

  // 11. Hijos
  checkCategoricalSumExact(data.children, 'count', 'Hijos', 'Distribución de Hijos');

  // 12. Mascotas
  checkCategoricalSumExact(data.pets, 'count', 'Mascotas', 'Tenencia de Mascotas');

  // 13. Grupo étnico
  checkCategoricalSumExact(data.ethnicGroups, 'count', 'Grupo étnico', 'Pertenencia a Grupo Étnico');

  // 14. Grupo sanguíneo
  checkCategoricalSumExact(data.bloodType, 'count', 'Grupo sanguíneo', 'Distribución de Grupo Sanguíneo (RH)');

  // 15. Porcentajes
  const checkPercentageSumExact = (
    array: any[] | undefined,
    categoryName: string,
    indicatorName: string,
    originName: string
  ) => {
    if (!array || array.length === 0) return;
    const sum = array.reduce((acc, curr) => acc + (curr.percentage || 0), 0);
    if (Math.abs(sum - 100) > 0.1) {
      issues.push({
        indicator: indicatorName,
        expectedCount: '100.0%',
        foundCount: `${sum.toFixed(1)}%`,
        origin: originName,
        affectedRecords: N,
        cause: `Los porcentajes en la categoría '${categoryName}' suman ${sum.toFixed(1)}% (debería ser exactamente 100.0%).`,
        severity: 'critical',
      });
    }
  };

  checkPercentageSumExact(data.gender, 'Sexo', 'Porcentajes', 'Porcentajes de Sexo');
  checkPercentageSumExact(data.housing, 'Vivienda', 'Porcentajes', 'Porcentajes de Vivienda');
  checkPercentageSumExact(data.children, 'Hijos', 'Porcentajes', 'Porcentajes de Hijos');
  checkPercentageSumExact(data.contractType, 'Tipo de contrato', 'Porcentajes', 'Porcentajes de Contrato');
  checkPercentageSumExact(data.socioeconomicStrata, 'Estrato', 'Porcentajes', 'Porcentajes de Estrato');
  checkPercentageSumExact(data.ethnicGroups, 'Grupo Étnico', 'Porcentajes', 'Porcentajes de Grupo Étnico');
  checkPercentageSumExact(data.imcClassification, 'Clasificación de IMC', 'Porcentajes', 'Porcentajes de IMC');
  checkPercentageSumExact(data.pets, 'Mascotas', 'Porcentajes', 'Porcentajes de Mascotas');
  checkPercentageSumExact(data.bloodType, 'Grupo Sanguíneo', 'Porcentajes', 'Porcentajes de Grupo Sanguíneo');

  // 16. Todos los gráficos
  if (data.departmentWellbeing && data.departmentWellbeing.length > 0) {
    const hasNegativeOrEmpty = data.departmentWellbeing.some(
      d => d.wellbeing < 0 || d.wellbeing > 100 || d.stress < 0 || d.stress > 100 || d.name.trim() === ''
    );
    if (hasNegativeOrEmpty) {
      issues.push({
        indicator: 'Todos los gráficos',
        expectedCount: 'Rango [0, 100] y nombres no vacíos',
        foundCount: 'Valores fuera de rango o vacíos',
        origin: 'Bienestar por Departamento (Gráfico de barras)',
        affectedRecords: data.departmentWellbeing.length,
        cause: 'La serie de datos para el gráfico de bienestar por departamento contiene valores de bienestar/estrés negativos, superiores a 100, o nombres vacíos.',
        severity: 'critical',
      });
    }

    const deptAgentsSum = data.departmentWellbeing.reduce((acc, curr) => acc + (curr.agents || 0), 0);
    if (deptAgentsSum !== N) {
      issues.push({
        indicator: 'Todos los gráficos',
        expectedCount: N,
        foundCount: deptAgentsSum,
        origin: 'Colaboradores por Departamento (Gráfico de distribución)',
        affectedRecords: Math.abs(deptAgentsSum - N),
        cause: `La sumatoria de colaboradores en los departamentos (${deptAgentsSum}) no coincide exactamente con el total de nómina (${N}).`,
        severity: 'critical',
      });
    }
  }

  // Contract types, projects and workSites graphs
  checkCategoricalSumExact(data.contractType, 'count', 'Todos los gráficos', 'Distribución de Contrato (Gráfico circular)');
  checkCategoricalSumExact(data.projects, 'count', 'Todos los gráficos', 'Proyectos activos (Gráfico de barras)');
  checkCategoricalSumExact(data.workSites, 'count', 'Todos los gráficos', 'Sitio de trabajo (Gráfico circular)');

  // Score calculations
  let score = 100;
  issues.forEach(issue => {
    if (issue.severity === 'critical') {
      score -= 8;
    } else {
      score -= 2;
    }
  });

  const qualityPercentage = Math.max(0, Math.min(100, score));

  let qualityLevel: 'Excelente' | 'Buena' | 'Regular' | 'Deficiente';
  if (qualityPercentage >= 95) {
    qualityLevel = 'Excelente';
  } else if (qualityPercentage >= 80) {
    qualityLevel = 'Buena';
  } else if (qualityPercentage >= 50) {
    qualityLevel = 'Regular';
  } else {
    qualityLevel = 'Deficiente';
  }

  const isConsistent = !issues.some(issue => issue.severity === 'critical');

  return {
    isConsistent,
    qualityPercentage,
    qualityLevel,
    issues,
  };
}

/**
 * Automatically corrects all logical discrepancies in DemographicsData.
 * Forcefully redistributes counts to sum exactly to totalEmployees, recalculates percentages
 * to sum exactly to 100.0%, and clamps any invalid bounds.
 */
export function autoCorrectDemographicsData(data: DemographicsData): DemographicsData {
  const corrected = JSON.parse(JSON.stringify(data)) as DemographicsData;
  const N = corrected.totalEmployees || 100;

  if (N <= 0) {
    corrected.totalEmployees = 100;
  }

  // Bound main KPIs
  corrected.wellbeingIndex = Math.max(0, Math.min(100, corrected.wellbeingIndex || 80));
  corrected.absenteeismRate = Math.max(0, Math.min(100, corrected.absenteeismRate || 2.5));
  corrected.activeParticipation = Math.max(0, Math.min(100, corrected.activeParticipation || 90));

  // Age sanity - preserve valid values, do not assign artificial 35.5
  if (corrected.averageAge && (corrected.averageAge < 18 || corrected.averageAge > 80)) {
    // Keep as is or mark uncalculable
  }

  // Seniority sanity
  if (corrected.averageSeniority < 0) corrected.averageSeniority = 0;
  if (!corrected.averageSeniorityRole || corrected.averageSeniorityRole < 0) {
    corrected.averageSeniorityRole = 0;
  }
  if (corrected.averageSeniorityRole > corrected.averageSeniority) {
    corrected.averageSeniorityRole = corrected.averageSeniority;
  }
  if (corrected.averageSeniority >= corrected.averageAge - 15) {
    corrected.averageSeniority = Number((corrected.averageAge - 18).toFixed(1));
    if (corrected.averageSeniority < 0) corrected.averageSeniority = 0.5;
    corrected.averageSeniorityRole = Number((corrected.averageSeniority * 0.7).toFixed(1));
  }

  // Helper to adjust counts & percentages to sum to exactly totalEmployees and exactly 100.0%
  const adjustListExact = (
    list: any[] | undefined,
    countProp: string
  ): any[] | undefined => {
    if (!list || list.length === 0) return list;

    // Adjust counts/values to sum up to exactly N
    const sum = list.reduce((acc, curr) => acc + (curr[countProp] !== undefined ? curr[countProp] : (curr.value !== undefined ? curr.value : (curr.count || 0))), 0);
    
    if (sum !== N) {
      let tempSum = 0;
      list.forEach((item: any, idx) => {
        if (idx === list.length - 1) {
          const val = Math.max(0, N - tempSum);
          if (item[countProp] !== undefined) item[countProp] = val;
          else if (item.value !== undefined) item.value = val;
          else if (item.count !== undefined) item.count = val;
          else if (item.agents !== undefined) item.agents = val;
        } else {
          const orig = item[countProp] !== undefined ? item[countProp] : (item.value !== undefined ? item.value : (item.count || 0));
          const val = Math.round(((orig || 1) / (sum || 1)) * N);
          if (item[countProp] !== undefined) item[countProp] = val;
          else if (item.value !== undefined) item.value = val;
          else if (item.count !== undefined) item.count = val;
          else if (item.agents !== undefined) item.agents = val;
          tempSum += val;
        }
      });
    }

    // Adjust percentages to sum up to exactly 100.0%
    let pctSum = 0;
    list.forEach((item: any, idx) => {
      const currentCount = item[countProp] !== undefined ? item[countProp] : (item.value !== undefined ? item.value : (item.count !== undefined ? item.count : (item.agents || 0)));
      if (idx === list.length - 1) {
        item.percentage = Number((100 - pctSum).toFixed(1));
      } else {
        const val = Number(((currentCount / N) * 100).toFixed(1));
        item.percentage = val;
        pctSum += val;
      }
    });

    return list;
  };

  if (corrected.gender) corrected.gender = adjustListExact(corrected.gender, 'value');
  if (corrected.ageGroups) corrected.ageGroups = adjustListExact(corrected.ageGroups, 'value');
  if (corrected.maritalStatus) corrected.maritalStatus = adjustListExact(corrected.maritalStatus, 'count');
  if (corrected.education) corrected.education = adjustListExact(corrected.education, 'count');
  if (corrected.city) corrected.city = adjustListExact(corrected.city, 'count');
  if (corrected.socioeconomicStrata) corrected.socioeconomicStrata = adjustListExact(corrected.socioeconomicStrata, 'count');
  if (corrected.housing) corrected.housing = adjustListExact(corrected.housing, 'count');
  if (corrected.imcClassification) corrected.imcClassification = adjustListExact(corrected.imcClassification, 'count');
  if (corrected.children) corrected.children = adjustListExact(corrected.children, 'count');
  if (corrected.pets) corrected.pets = adjustListExact(corrected.pets, 'count');
  if (corrected.ethnicGroups) corrected.ethnicGroups = adjustListExact(corrected.ethnicGroups, 'count');
  if (corrected.bloodType) corrected.bloodType = adjustListExact(corrected.bloodType, 'count');
  if (corrected.contractType) corrected.contractType = adjustListExact(corrected.contractType, 'count');
  if (corrected.projects) corrected.projects = adjustListExact(corrected.projects, 'count');
  if (corrected.workSites) corrected.workSites = adjustListExact(corrected.workSites, 'count');

  if (corrected.departmentWellbeing) {
    corrected.departmentWellbeing = adjustListExact(corrected.departmentWellbeing, 'agents');
    corrected.departmentWellbeing.forEach(d => {
      d.wellbeing = Math.max(0, Math.min(100, d.wellbeing || 80));
      d.stress = Math.max(0, Math.min(100, d.stress || 30));
    });
  }

  // Weight, Height and averageIMC recalculation (no artificial fallbacks)

  if (corrected.rawEmployees && Array.isArray(corrected.rawEmployees) && corrected.rawEmployees.length > 0) {
    let sumIndividualIMC = 0;
    let countIMC = 0;
    corrected.rawEmployees.forEach((emp: any) => {
      const w = emp.peso || 0;
      let h = emp.estatura || 0;
      if (h > 3) h = h / 100;
      if (w > 0 && h > 0) {
        const individualImc = w / (h * h);
        sumIndividualIMC += individualImc;
        countIMC++;
        emp.imc = Number(individualImc.toFixed(1));
      }
    });

    if (countIMC > 0) {
      const pesoPromedio = corrected.averageWeight || 0;
      const estaturaPromedio = corrected.averageHeight || 0;
      const cantidadIMC = countIMC;
      const sumatoriaIMC = sumIndividualIMC;
      const promedioIMC = Number((sumatoriaIMC / cantidadIMC).toFixed(1));

      corrected.averageIMC = promedioIMC;

      const averageWeight = pesoPromedio;
      const averageHeight = estaturaPromedio;
      const averageBMI = promedioIMC;
      const bmiValues = corrected.rawEmployees
        .map((emp: any) => {
          const w = emp.peso || 0;
          let h = emp.estatura || 0;
          if (h > 3) h = h / 100;
          return (w > 0 && h > 0) ? w / (h * h) : null;
        })
        .filter((val: any) => val !== null) as number[];

      console.log("Peso promedio:", averageWeight);
      console.log("Estatura promedio:", averageHeight);
      console.log("IMC promedio:", averageBMI);
      console.log("Cantidad IMC:", bmiValues.length);
      console.log("Primeros 10 IMC:", bmiValues.slice(0, 10));
      console.log("Promedio calculado:", bmiValues.length > 0 ? bmiValues.reduce((a, b) => a + b, 0) / bmiValues.length : 0);

      console.table({
        pesoPromedio,
        estaturaPromedio,
        cantidadIMC,
        sumatoriaIMC: Number(sumatoriaIMC.toFixed(2)),
        promedioIMC
      });
    }
  }

  return corrected;
}
