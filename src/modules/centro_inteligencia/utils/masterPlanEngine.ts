import { DemographicsData } from '../../../types';
import { ClimateData } from '../../clima/clima.types';
import { PsicosocialData } from '../../psicosocial/psicosocial.types';

export interface MasterPlanActivity {
  id: string;
  objetivo: string;
  descripcion: string;
  responsable: string;
  fecha: string;
  costo: number;
  indicador: string;
  estado: 'No Iniciada' | 'En Progreso' | 'Completada' | 'Cancelada';
  normatividad: string;
  moduloOrigen: 'Clima Organizacional' | 'Riesgo Psicosocial' | 'Bienestar & Salud' | 'Fisiología y Ergonomía' | 'Centro de Inteligencia (IA)' | 'General';
  prioridad: 'Alta' | 'Media' | 'Baja';
  grupo: string;
}

// Map of categories/groups for grouping similar activities
export const MASTER_PLAN_GROUPS = {
  LIDERAZGO: 'Desarrollo de Liderazgo y Comunicación',
  SALUD_MENTAL: 'Salud Mental, Bienestar y Soporte Psicosocial',
  ERGONOMIA: 'Ergonomía, Entorno Físico e Higiene',
  RECONOCIMIENTO: 'Reconocimiento, Salario Emocional y Desarrollo',
  CARGA: 'Optimización de Carga Laboral y Tiempos de Descanso'
};

/**
 * Consolidates, deduplicates, groups, and classifies recommendations into structured activities.
 */
export function calculateMasterPlan(
  demographics: DemographicsData,
  climate: ClimateData,
  psicosocial: PsicosocialData,
  alerts: any[] = []
): MasterPlanActivity[] {
  const activities: MasterPlanActivity[] = [];

  // 1. Analyze Climate Data
  if (climate && climate.dimensions) {
    climate.dimensions.forEach(dim => {
      const favorability = dim.favorability;
      const isLow = favorability < 70;

      if (dim.dimensionId === 'liderazgo') {
        activities.push({
          id: 'cli_liderazgo_1',
          objetivo: 'Capacitar al 100% de líderes de equipo en metodologías de liderazgo transformacional, empático y comunicación asertiva.',
          descripcion: 'Ciclo de talleres de Liderazgo Inspirador con sesiones prácticas sobre retroalimentación oportuna, reconocimiento de logros y manejo constructivo de conflictos interpersonales.',
          responsable: 'Gerencia de Gestión Humana / Director SST',
          fecha: '2026-09-30',
          costo: isLow ? 3500000 : 1500000,
          indicador: 'Porcentaje de líderes formados • Evaluación de eficacia del entrenamiento',
          estado: 'No Iniciada',
          normatividad: 'Decreto 1072 de 2015 (SG-SST) • Resolución 0312 de 2019',
          moduloOrigen: 'Clima Organizacional',
          prioridad: isLow ? 'Alta' : 'Media',
          grupo: MASTER_PLAN_GROUPS.LIDERAZGO
        });
      }

      if (dim.dimensionId === 'comunicacion') {
        activities.push({
          id: 'cli_comunicacion_1',
          objetivo: 'Establecer canales de comunicación interna formales, transparentes y bidireccionales en toda la compañía.',
          descripcion: 'Diseño e implementación de boletines semanales, plataforma corporativa de preguntas frecuentes (FAQ) y reuniones periódicas de diálogo abierto "Town Hall" con la gerencia.',
          responsable: 'Líder de Comunicaciones Internas',
          fecha: '2026-10-15',
          costo: 800000,
          indicador: 'Índice de efectividad percibida de la comunicación (Encuesta de Clima)',
          estado: 'En Progreso',
          normatividad: 'Decreto 1072 de 2015 (Capítulo 6 - SG-SST)',
          moduloOrigen: 'Clima Organizacional',
          prioridad: isLow ? 'Alta' : 'Media',
          grupo: MASTER_PLAN_GROUPS.LIDERAZGO
        });
      }

      if (dim.dimensionId === 'reconocimiento') {
        activities.push({
          id: 'cli_reconocimiento_1',
          objetivo: 'Estructurar una política formal de reconocimiento no monetario y salario emocional alineada con los valores corporativos.',
          descripcion: 'Creación del programa "Estrellas del Mes" y habilitación de cupones de tiempo libre (tardes de cumpleaños, días de bienestar familiar) para premiar el desempeño sobresaliente.',
          responsable: 'Gerente de Compensación y Desarrollo',
          fecha: '2026-11-30',
          costo: 1200000,
          indicador: 'Satisfacción con el Reconocimiento Corporativo (+15% en Clima)',
          estado: 'No Iniciada',
          normatividad: 'Resolución 0312 de 2019 • Buenas prácticas de retención de talento',
          moduloOrigen: 'Clima Organizacional',
          prioridad: isLow ? 'Alta' : 'Media',
          grupo: MASTER_PLAN_GROUPS.RECONOCIMIENTO
        });
      }

      if (dim.dimensionId === 'ambiente') {
        activities.push({
          id: 'cli_ambiente_1',
          objetivo: 'Garantizar puestos de trabajo adaptados ergonómicamente para prevenir desórdenes musculoesqueléticos.',
          descripcion: 'Realización de inspecciones ergonómicas a puestos administrativos y operativos, y reemplazo paulatino de silletería u optimización de sistemas de iluminación.',
          responsable: 'Especialista en SST / Higienista',
          fecha: '2026-12-15',
          costo: isLow ? 8000000 : 3000000,
          indicador: 'Porcentaje de puestos de trabajo inspeccionados e intervenidos',
          estado: 'No Iniciada',
          normatividad: 'Resolución 2400 de 1979 (Higiene Industrial) • Ley 9 de 1979',
          moduloOrigen: 'Fisiología y Ergonomía',
          prioridad: isLow ? 'Alta' : 'Baja',
          grupo: MASTER_PLAN_GROUPS.ERGONOMIA
        });
      }
    });
  }

  // 2. Analyze Psicosocial Data
  if (psicosocial && psicosocial.dimensions) {
    psicosocial.dimensions.forEach(dim => {
      const risk = dim.riskLevel;
      const isHigh = risk === 'Alto' || risk === 'Muy Alto';

      if (dim.dimensionId === 'demandas_trabajo') {
        activities.push({
          id: 'psi_demandas_1',
          objetivo: 'Definir con precisión el 100% de perfiles de cargo y reajustar los procesos de distribución de cargas operativas.',
          descripcion: 'Auditoría de cargas laborales y actualización detallada de manuales de funciones por departamento, eliminando solapamientos y cuellos de botella.',
          responsable: 'Director de Operaciones / Jefe de Gestión Humana',
          fecha: '2026-08-31',
          costo: 2000000,
          indicador: 'Cumplimiento del manual de cargos • Reducción en horas extra reportadas',
          estado: 'En Progreso',
          normatividad: 'Resolución 2646 de 2008 (Mitigación del Estrés Laboral)',
          moduloOrigen: 'Riesgo Psicosocial',
          prioridad: isHigh ? 'Alta' : 'Media',
          grupo: MASTER_PLAN_GROUPS.CARGA
        });
      }

      if (dim.dimensionId === 'jornada') {
        activities.push({
          id: 'psi_jornada_1',
          objetivo: 'Institucionalizar el protocolo de Desconexión Laboral y promover el balance de vida personal y familiar.',
          descripcion: 'Redacción y firma de la política oficial de desconexión laboral, restringiendo correos, llamadas y chats corporativos fuera del horario oficial de trabajo.',
          responsable: 'Gerente General / Comité de Convivencia Laboral',
          fecha: '2026-09-15',
          costo: 500000,
          indicador: 'Índice de quejas en Comité de Convivencia • Encuestas breves de desconexión',
          estado: 'En Progreso',
          normatividad: 'Ley 2191 de 2022 (Ley de Desconexión Laboral en Colombia)',
          moduloOrigen: 'Riesgo Psicosocial',
          prioridad: isHigh ? 'Alta' : 'Media',
          grupo: MASTER_PLAN_GROUPS.CARGA
        });
      }

      if (dim.dimensionId === 'carga_mental') {
        activities.push({
          id: 'psi_carga_mental_1',
          objetivo: 'Brindar herramientas prácticas individuales y colectivas para la regulación del estrés y la carga cognitiva.',
          descripcion: 'Implementación del programa de pausas cognitivas activas (mindfulness, estiramiento neurofisiológico) guiadas por psicólogos especialistas 2 veces por semana.',
          responsable: 'Psicólogo de la ARL / Líder de SST',
          fecha: '2026-10-30',
          costo: 1800000,
          indicador: 'Porcentaje de participación activa • Reporte subjetivo de bienestar inmediato',
          estado: 'No Iniciada',
          normatividad: 'Resolución 2764 de 2022 (Protocolo de Prevención de Efectos del Estrés)',
          moduloOrigen: 'Riesgo Psicosocial',
          prioridad: isHigh ? 'Alta' : 'Media',
          grupo: MASTER_PLAN_GROUPS.SALUD_MENTAL
        });
      }

      if (dim.dimensionId === 'responsabilidades_familiares' || dim.dimensionId === 'tiempo_fuera_trabajo') {
        activities.push({
          id: 'psi_extralaboral_1',
          objetivo: 'Fortalecer el apoyo institucional extralaboral mediante alianzas estratégicas de bienestar familiar.',
          descripcion: 'Convenios con Cajas de Compensación Familiar para recreación, subsidios educativos y acceso a programas deportivos en fines de semana.',
          responsable: 'Trabajadora Social / Gestión Humana',
          fecha: '2026-11-15',
          costo: 3000000,
          indicador: 'Tasa de afiliación y uso de convenios por parte de las familias de empleados',
          estado: 'No Iniciada',
          normatividad: 'Resolución 2646 de 2008 (Factores Extralaborales)',
          moduloOrigen: 'Riesgo Psicosocial',
          prioridad: isHigh ? 'Alta' : 'Baja',
          grupo: MASTER_PLAN_GROUPS.SALUD_MENTAL
        });
      }
    });
  }

  // 3. Add General / Intelligence alerts as high priority actions
  if (alerts && alerts.length > 0) {
    alerts.forEach((alert, index) => {
      if (alert.status !== 'Resuelta') {
        activities.push({
          id: `alert_action_${alert.id || index}`,
          objetivo: `Mitigar de forma inmediata la alerta sobre: ${alert.title}.`,
          descripcion: `Ejecución rápida del plan recomendado: ${alert.suggestedAction || alert.description}. Incluye mesas de trabajo con los líderes involucrados.`,
          responsable: 'Comité de Dirección / Líder de SST',
          fecha: '2026-08-20', // urgent action
          costo: alert.severity === 'Critica' ? 2500000 : 1000000,
          indicador: 'Cierre formal de la alerta en el panel estratégico',
          estado: alert.status === 'En Mitigación' ? 'En Progreso' : 'No Iniciada',
          normatividad: 'Decreto 1072 de 2015 • Resolución 0312 de 2019',
          moduloOrigen: 'Centro de Inteligencia (IA)',
          prioridad: alert.severity === 'Critica' || alert.severity === 'Alta' ? 'Alta' : 'Media',
          grupo: MASTER_PLAN_GROUPS.SALUD_MENTAL
        });
      }
    });
  }

  // 4. Grouping & Deduplication (Group by exact description/objective or standard tags)
  // Our array starts with multiple items which might target identical fields or duplicates.
  // We will deduplicate them based on a composite key: `objetivo` (first 50 characters).
  const seenKeys = new Set<string>();
  const consolidatedList: MasterPlanActivity[] = [];

  activities.forEach(activity => {
    // Basic deduplication key
    const key = activity.objetivo.substring(0, 50).toLowerCase();
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      consolidatedList.push(activity);
    }
  });

  // Sort by priority (Alta -> Media -> Baja)
  const priorityWeight = { Alta: 3, Media: 2, Baja: 1 };
  consolidatedList.sort((a, b) => priorityWeight[b.prioridad] - priorityWeight[a.prioridad]);

  return consolidatedList;
}
