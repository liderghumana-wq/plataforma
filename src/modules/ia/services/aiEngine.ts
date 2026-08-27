import { IAIndicator, AIEngineResponse, AIActionStep } from '../types/aiEngine.types';
import { ComplianceStore } from '../../cumplimiento/services/complianceStore';

export class AIEngine {
  /**
   * Evaluates any set of custom indicators and returns a comprehensive, 
   * structured, and deeply professional executive diagnostic and action plan.
   * 
   * @param indicators List of metrics to evaluate
   * @param metadata Optional context information about the company or division
   */
  public static analyze(indicators: IAIndicator[], metadata?: { companyName?: string; segment?: string }): AIEngineResponse {
    const timestamp = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
    const company = metadata?.companyName || 'la organización';
    const segmentText = metadata?.segment ? ` para el segmento de ${metadata.segment}` : '';

    if (!indicators || indicators.length === 0) {
      return this.generateEmptyResponse(timestamp);
    }

    // Filter out missing/null indicators to guarantee data integrity
    const validIndicators = indicators.filter(ind => ind.value !== null && ind.value !== undefined && !isNaN(Number(ind.value)));

    if (validIndicators.length === 0) {
      return {
        resumenEjecutivo: "No se dispone de datos suficientes ni indicadores válidos cargados en el sistema para realizar un diagnóstico de IA. Todos los registros figuran como sin información.",
        hallazgos: ["No hay indicadores con cobertura suficiente en el periodo seleccionado."],
        riesgos: ["Imposibilidad de realizar seguimiento epidemiológico o de clima por falta de datos originarios."],
        fortalezas: ["Sistema configurado bajo política de estricta integridad de datos (sin invención de valores)."],
        tendencias: ["Línea base pendiente de captura de encuestas u observaciones reales."],
        recomendaciones: ["Cargar o diligenciar encuestas de origen para activar diagnósticos."],
        prioridades: ["Captura y validación de cobertura de datos originarios."],
        planDeAccion: [],
        timestamp
      };
    }

    // Sort valid indicators to find lowest and highest
    const sorted = [...validIndicators].sort((a, b) => a.value - b.value);
    const criticals = sorted.filter(ind => ind.value < 65);
    const warnings = sorted.filter(ind => ind.value >= 65 && ind.value < 75);
    const strengthsList = sorted.filter(ind => ind.value >= 75);

    // Compute average score over valid indicators ONLY
    const totalScore = validIndicators.reduce((acc, curr) => acc + curr.value, 0);
    const averageScore = Math.round((totalScore / validIndicators.length) * 10) / 10;

    // 1. Executive Summary Generator
    const statusText = 
      averageScore >= 80 ? 'Excelente / Saludable' :
      averageScore >= 70 ? 'Moderado / Estable con focos de atención' :
      'Crítico / Foco urgente de intervención';

    const weakestDimension = criticals[0]?.dimension || sorted[0]?.dimension || 'Clima General';
    const strongestDimension = [...strengthsList].reverse()[0]?.dimension || 'Clima General';

    // Query Colombian legal norms matching the weakest dimension to support executive review
    const weakNorms = ComplianceStore.queryByCategoryOrDimension(weakestDimension);
    const primaryNormText = weakNorms.length > 0 
      ? ` bajo la lupa de cumplimiento normativo de la norma **${weakNorms[0].number} de ${weakNorms[0].year}** (${weakNorms[0].name})` 
      : '';

    const resumenEjecutivo = `El diagnóstico consolidado${segmentText} presenta una favorabilidad promedio de **${averageScore}%**, lo cual sitúa la salud del clima corporativo en un rango de nivel **${statusText}**. Se observa que el área de oportunidad más apremiante se concentra en la dimensión de **"${weakestDimension}"** (liderado por indicadores críticos como ${sorted[0]?.name || 'N/A'} con ${sorted[0]?.value}%)${primaryNormText}. Por otro lado, la principal fortaleza de la cultura corporativa radica en **"${strongestDimension}"**, impulsado por el indicador favorable de ${[...sorted].reverse()[0]?.name || 'N/A'} con ${[...sorted].reverse()[0]?.value}%. Se sugiere desplegar de inmediato el plan de acción estructurado a continuación para contener el desgaste y robustecer la retención de talento.`;

    // 2. Hallazgos (Findings)
    const hallazgos: string[] = [];
    hallazgos.push(`Promedio general ponderado de favorabilidad se sitúa en ${averageScore}%, reflejando un ambiente de trabajo ${averageScore >= 75 ? 'favorable y alineado' : 'con asimetrías tácticas significativas'}.`);
    
    if (criticals.length > 0) {
      hallazgos.push(`Se han identificado ${criticals.length} indicador(es) en zona crítica (< 65%): ${criticals.map(c => `${c.name} (${c.value}%)`).join(', ')}.`);
    } else {
      hallazgos.push('No se detectaron indicadores en zona de riesgo crítico inmediato, denotando una línea base operativa estable.');
    }

    if (warnings.length > 0) {
      hallazgos.push(`Existen ${warnings.length} indicador(es) en zona de atención intermedia/alerta (65% - 74%): ${warnings.map(w => `${w.name} (${w.value}%)`).join(', ')}.`);
    }

    // Auto-query Colombian regulations related to active indicators to enrich findings
    const allMatchingNorms = new Set<string>();
    indicators.forEach(ind => {
      const norms = ComplianceStore.queryByCategoryOrDimension(ind.dimension || ind.name);
      norms.slice(0, 1).forEach(n => {
        allMatchingNorms.add(`${n.number} (${n.category})`);
      });
    });

    if (allMatchingNorms.size > 0) {
      hallazgos.push(`Marco normativo colombiano correlacionado de forma activa: ${Array.from(allMatchingNorms).join(', ')}.`);
    }

    // 3. Riesgos (Risks)
    const riesgos: string[] = [];
    if (criticals.length > 0) {
      criticals.forEach(c => {
        riesgos.push(`Fuga silenciosa de talento clave y desvinculación activa debido a los bajos niveles en "${c.name}" (${c.value}%).`);
        // Add specific legal/compliance penalty risks
        const relatedNorms = ComplianceStore.queryByCategoryOrDimension(c.dimension || c.name);
        if (relatedNorms.length > 0) {
          riesgos.push(`Sanciones del Ministerio de Trabajo o multas por posible incumplimiento de las obligaciones en ${relatedNorms[0].number} de ${relatedNorms[0].year} relacionadas con "${c.name}".`);
        }
      });
    } else {
      riesgos.push('Estancamiento de la participación futura si no se visibilizan cambios concretos basados en los resultados actuales.');
    }
    riesgos.push('Desgaste y potencial fatiga laboral (burnout) si no se equilibran las cargas de trabajo asociadas a las dimensiones más bajas.');

    // 4. Fortalezas (Strengths)
    const fortalezas: string[] = [];
    if (strengthsList.length > 0) {
      strengthsList.slice(-3).reverse().forEach(s => {
        fortalezas.push(`Alto compromiso emocional y sentido de pertenencia reflejado en "${s.name}" (${s.value}%).`);
      });
    } else {
      fortalezas.push('Flexibilidad y adaptabilidad del equipo para responder a las necesidades cambiantes de la operación.');
    }

    // 5. Tendencias (Trends)
    const tendencias: string[] = [];
    let positiveTrendCount = 0;
    let negativeTrendCount = 0;

    indicators.forEach(ind => {
      if (ind.previousValue !== undefined) {
        const diff = ind.value - ind.previousValue;
        if (diff > 2) {
          tendencias.push(`Tendencia positiva en "${ind.name}": subió de ${ind.previousValue}% a ${ind.value}% (+${diff.toFixed(1)} puntos).`);
          positiveTrendCount++;
        } else if (diff < -2) {
          tendencias.push(`Alerta de retroceso en "${ind.name}": bajó de ${ind.previousValue}% a ${ind.value}% (${diff.toFixed(1)} puntos).`);
          negativeTrendCount++;
        }
      }
    });

    if (tendencias.length === 0) {
      tendencias.push('Estabilidad horizontal en comparación con mediciones previas; no se registran desviaciones estadísticas de alta volatilidad.');
      tendencias.push(`Foco en estabilización: El indicador "${sorted[0]?.name}" requiere monitoreo quincenal continuo por encontrarse en su nivel mínimo.`);
    } else {
      tendencias.push(`Dinámica evolutiva: Se registran ${positiveTrendCount} indicadores con tracción de mejora frente a ${negativeTrendCount} indicadores con contracción.`);
    }

    // 6. Recomendaciones (Recommendations)
    const recomendaciones: string[] = [];
    if (criticals.length > 0) {
      recomendaciones.push(`Diseñar un programa de acompañamiento y feedback seguro para líderes del área de ${weakestDimension}, centrado en seguridad psicológica.`);
      recomendaciones.push('Establecer células quincenales de comunicación activa donde se socialicen los avances de clima para evitar escepticismo.');
    }
    
    // Inject legal recommendations dynamically based on queried compliance databases
    const matchedNorms = ComplianceStore.queryByCategoryOrDimension(weakestDimension);
    if (matchedNorms.length > 0) {
      matchedNorms.forEach(norm => {
        if (norm.obligations.length > 0) {
          recomendaciones.push(`[Cumplimiento Legal] Asegurar la ejecución de la obligación: "${norm.obligations[0]}" establecida en ${norm.number}.`);
        }
        if (norm.requiredEvidences.length > 0) {
          recomendaciones.push(`[Evidencia Requerida] Recopilar y archivar urgentemente: "${norm.requiredEvidences[0]}" para mitigar riesgos de auditoría.`);
        }
      });
    }

    recomendaciones.push('Institucionalizar un canal transparente para la resolución de dudas sobre compensación o desarrollo profesional.');
    recomendaciones.push('Apalancar los facilitadores internos del área con mejor clima para replicar buenas prácticas en los equipos críticos.');

    // 7. Prioridades (Priorities)
    const prioridades: string[] = [];
    if (criticals.length > 0) {
      prioridades.push(`[CRÍTICO] Contener el desgaste en "${sorted[0]?.name}" mediante intervención uno-a-uno.`);
      prioridades.push(`[MEDIO] Alinear expectativas de desarrollo y planes de carrera vinculados a "${weakestDimension}".`);
    } else {
      prioridades.push('[ESTANDAR] Mantener el ritmo de los comités de escucha activa bimestrales.');
    }

    // Inject legal priorities dynamically
    if (matchedNorms.length > 0) {
      prioridades.push(`[NORMATIVO] Revisar el cumplimiento de la normatividad asociada: ${matchedNorms.map(m => m.number).join(', ')}.`);
    }

    prioridades.push('[SOPORTE] Capacitar a mandos medios en metodologías de reconocimiento no monetario.');

    // 8. Plan de acción (Action Plan)
    const planDeAccion: AIActionStep[] = [];
    
    // Create specific task based on worst indicator
    if (sorted[0]) {
      planDeAccion.push({
        task: `Intervención de emergencia para mitigar factores de descontento en "${sorted[0].name}"`,
        responsible: 'Gestión Humana & Gerente de Área',
        timeframe: 'Corto Plazo (15 días)',
        priority: 'Alta'
      });
    }

    // Dynamic legal tasks matching compliance database
    if (matchedNorms.length > 0) {
      matchedNorms.slice(0, 2).forEach(norm => {
        planDeAccion.push({
          task: `Auditoría interna y preparación de evidencias para "${norm.name} (${norm.number})"`,
          responsible: norm.responsible || 'Responsable de Cumplimiento / SST',
          timeframe: 'Corto Plazo (30 días)',
          priority: 'Alta'
        });
      });
    }

    // Create task based on weakest dimension
    planDeAccion.push({
      task: `Talleres de co-creación y feedback seguro para el liderazgo de la dimensión "${weakestDimension}"`,
      responsible: 'Consultor de Cultura / Coach de Liderazgo',
      timeframe: 'Corto Plazo (30 días)',
      priority: 'Alta'
    });

    // General continuous tasks
    planDeAccion.push({
      task: 'Estructuración de matriz de competencias y visibilidad del plan de carrera interno',
      responsible: 'Comité de Desarrollo Organizacional',
      timeframe: 'Mediano Plazo (60 días)',
      priority: 'Media'
    });

    planDeAccion.push({
      task: 'Diseño e implementación de política corporativa de balance vida-trabajo y desconexión laboral',
      responsible: 'Dirección de Operaciones & RRHH',
      timeframe: 'Largo Plazo (90 días)',
      priority: 'Baja'
    });

    return {
      resumenEjecutivo,
      hallazgos,
      riesgos,
      fortalezas,
      tendencias,
      recomendaciones,
      prioridades,
      planDeAccion,
      timestamp
    };
  }

  private static generateEmptyResponse(timestamp: string): AIEngineResponse {
    return {
      resumenEjecutivo: 'No se han ingresado indicadores válidos para proceder con el diagnóstico centralizado de Inteligencia Artificial.',
      hallazgos: ['Ninguno detectado por falta de insumos de datos.'],
      riesgos: ['Sin riesgos calculables.'],
      fortalezas: ['Sin fortalezas calculables.'],
      tendencias: ['Sin series históricas disponibles.'],
      recomendaciones: ['Cargar indicadores cuantitativos en el motor.'],
      prioridades: ['Establecer indicadores base.'],
      planDeAccion: [],
      timestamp
    };
  }
}
