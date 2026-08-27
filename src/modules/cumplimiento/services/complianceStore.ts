import { RegulatoryNorm } from '../types';

const STORAGE_KEY = 'colombian_compliance_norms';

const COLOMBIAN_DEFAULT_NORMS: RegulatoryNorm[] = [
  {
    id: 'norm_decreto_1072',
    name: 'Decreto Único Reglamentario del Sector Trabajo',
    number: 'Decreto 1072',
    year: 2015,
    description: 'Establece las directrices de obligatorio cumplimiento para implementar el Sistema de Gestión de la Seguridad y Salud en el Trabajo (SG-SST) en todas las empresas del territorio nacional.',
    category: 'SG-SST',
    relevantArticles: [
      {
        articleNumber: 'Artículo 2.2.4.6.8',
        title: 'Obligaciones de los Empleadores',
        description: 'Definir, firmar y divulgar la política de SST, asignar recursos, y garantizar la participación de los trabajadores.'
      },
      {
        articleNumber: 'Artículo 2.2.4.6.15',
        title: 'Identificación de Peligros y Valoración de Riesgos',
        description: 'El empleador debe aplicar una metodología sistemática para identificar peligros y evaluar riesgos anualmente.'
      }
    ],
    obligations: [
      'Diseñar e implementar el SG-SST.',
      'Asignar presupuesto y recurso humano idóneo (Licencia SST) para su gestión.',
      'Realizar la autoevaluación de estándares mínimos anualmente.'
    ],
    requiredEvidences: [
      'Documento de la Política de SST firmado por el Representante Legal.',
      'Matriz de Identificación de Peligros, Evaluación y Valoración de Riesgos (MIPEVR).',
      'Plan de Trabajo Anual en SST firmado con cronograma.'
    ],
    relatedDocuments: [
      'Manual del SG-SST',
      'Matriz de Riesgos GTC 45',
      'Actas de Socialización de la Política'
    ]
  },
  {
    id: 'norm_resolucion_2646',
    name: 'Evaluación y Gestión de Factores de Riesgo Psicosocial',
    number: 'Resolución 2646',
    year: 2008,
    description: 'Define las responsabilidades para la identificación, evaluación, prevención, intervención y monitoreo permanente de la exposición a factores de riesgo psicosocial en el trabajo.',
    category: 'Riesgo Psicosocial',
    relevantArticles: [
      {
        articleNumber: 'Artículo 5',
        title: 'Factores de Riesgo Psicosocial Intra laboral',
        description: 'Establece dimensiones como liderazgo, demandas del trabajo, control, recompensa y comunicación interna.'
      },
      {
        articleNumber: 'Artículo 13',
        title: 'Criterios para la Intervención Psicosocial',
        description: 'Las intervenciones deben basarse en los resultados de la batería estandarizada, enfocándose en la raíz del riesgo.'
      }
    ],
    obligations: [
      'Aplicar la batería oficial de riesgo psicosocial anualmente.',
      'Custodiar de forma estricta las historias clínicas ocupacionales que resulten de las evaluaciones.',
      'Diseñar Programas de Vigilancia Epidemiológica (PVE) de origen psicosocial si hay niveles de riesgo alto o muy alto.'
    ],
    requiredEvidences: [
      'Informe de resultados de la Batería de Riesgo Psicosocial firmado por psicólogo especialista en SST.',
      'Diseño y ejecución del Plan de Intervención Psicosocial.',
      'Actas de talleres de liderazgo o mitigación del desgaste laboral.'
    ],
    relatedDocuments: [
      'Batería de Instrumentos del Ministerio del Trabajo',
      'Protocolos de Intervención Sectorial Psicosocial',
      'Programa de Vigilancia Epidemiológica Psicosocial (PVE)'
    ]
  },
  {
    id: 'norm_resolucion_2764',
    name: 'Actualización y Protocolos de Factores de Riesgo Psicosocial',
    number: 'Resolución 2764',
    year: 2022,
    description: 'Adopta la batería de instrumentos de evaluación de factores de riesgo psicosocial y establece la obligatoriedad de los protocolos de intervención psicosocial para la contención del estrés y acoso.',
    category: 'Riesgo Psicosocial',
    relevantArticles: [
      {
        articleNumber: 'Artículo 3',
        title: 'Periodicidad de la Evaluación',
        description: 'Las empresas con riesgo medio o alto deben realizar la medición de forma anual; aquellas con riesgo bajo de forma bienal (cada dos años).'
      }
    ],
    obligations: [
      'Utilizar únicamente los instrumentos validados por el Ministerio de Trabajo.',
      'Desplegar protocolos específicos de intervención para situaciones de estrés agudo, acoso o duelo.'
    ],
    requiredEvidences: [
      'Certificación de vigencia y licencia del psicólogo especialista.',
      'Evidencia física/digital de la aplicación de la batería.',
      'Seguimiento a planes de acción y remisiones a ARL.'
    ],
    relatedDocuments: [
      'Guía técnica para la evaluación de riesgo psicosocial',
      'Licencia vigente del profesional evaluador'
    ]
  },
  {
    id: 'norm_cst',
    name: 'Código Sustantivo del Trabajo de Colombia',
    number: 'CST',
    year: 1950,
    description: 'Regula las relaciones de derecho individual y colectivo del trabajo en Colombia, garantizando la equidad y la justicia entre empleadores y trabajadores.',
    category: 'Capital Humano',
    relevantArticles: [
      {
        articleNumber: 'Artículo 57',
        title: 'Obligaciones Especiales del Patrono',
        description: 'Procurar a los trabajadores locales apropiados y elementos adecuados de protección contra accidentes y enfermedades profesionales.'
      },
      {
        articleNumber: 'Artículo 104',
        title: 'Reglamento Interno de Trabajo',
        description: 'Obligatoriedad de contar con un reglamento interno aprobado y publicado que defina las condiciones del servicio.'
      }
    ],
    obligations: [
      'Garantizar el pago puntual de salarios, prestaciones sociales y aportes a seguridad social integral.',
      'Suministrar dotación de vestuario y calzado de labor cada cuatro meses a trabajadores con salario de hasta dos salarios mínimos.'
    ],
    requiredEvidences: [
      'Reglamento Interno de Trabajo (RIT) expuesto en lugares visibles.',
      'Planillas de pago PILA de aportes a salud, pensión, ARL y Caja de Compensación.',
      'Firmas de entrega de dotaciones a empleados aptos.'
    ],
    relatedDocuments: [
      'Reglamento Interno de Trabajo (RIT)',
      'Contratos de Trabajo debidamente firmados',
      'Formatos de entrega de dotación'
    ]
  },
  {
    id: 'norm_ley_50',
    name: 'Fomento a la Recreación, Cultura y Deporte Laboral',
    number: 'Ley 50 (Art. 21)',
    year: 1990,
    description: 'Establece que en empresas con más de 50 trabajadores que laboren 48 horas semanales (actualmente en ajuste progresivo), los trabajadores tienen derecho a dos horas semanales dedicadas exclusivamente a actividades recreativas, culturales, deportivas o de capacitación.',
    category: 'Bienestar',
    relevantArticles: [
      {
        articleNumber: 'Artículo 21',
        title: 'Jornada dedicada a actividades de esparcimiento',
        description: 'El tiempo de las dos horas destinadas a actividades recreativas, culturales o deportivas se computará como parte de la jornada laboral ordinaria.'
      }
    ],
    obligations: [
      'Garantizar el espacio y tiempo para la integración, aprendizaje y salud física del equipo.',
      'Coordinar las actividades internamente o en convenio con la Caja de Compensación Familiar.'
    ],
    requiredEvidences: [
      'Programa anual de bienestar, capacitación y recreación.',
      'Listados de asistencia firmados y registros fotográficos de las actividades de integración y capacitación.'
    ],
    relatedDocuments: [
      'Plan de Bienestar de la Empresa',
      'Convenio con Caja de Compensación (Compensar, Colsubsidio, Cafam, etc.)'
    ]
  },
  {
    id: 'norm_resolucion_2400',
    name: 'Estatuto de Seguridad Industrial e Higiene',
    number: 'Resolución 2400',
    year: 1979,
    description: 'Establece disposiciones detalladas sobre vivienda, higiene y seguridad en los establecimientos de trabajo, definiendo límites de carga física y lineamientos ergonómicos.',
    category: 'Ergonomía',
    relevantArticles: [
      {
        articleNumber: 'Artículo 392',
        title: 'Límites de Carga Física para Hombres',
        description: 'Establece que el peso máximo que un trabajador varón puede levantar de forma manual y continua es de 25 kg.'
      },
      {
        articleNumber: 'Artículo 393',
        title: 'Límites de Carga Física para Mujeres',
        description: 'Establece que el peso máximo que una trabajadora mujer puede levantar de forma manual y continua es de 12.5 kg.'
      }
    ],
    obligations: [
      'Asegurar puestos de trabajo ergonómicos que no pongan en riesgo el sistema osteomuscular de los colaboradores.',
      'Implementar pausas activas sistemáticas durante la jornada laboral.'
    ],
    requiredEvidences: [
      'Estudio de Ergonomía y Biomecánica de los puestos de trabajo críticos.',
      'Soportes de capacitación en higiene postural y levantamiento de cargas.',
      'Registros de implementación de pausas activas guiadas.'
    ],
    relatedDocuments: [
      'Diseño Ergonómico de Puestos de Trabajo',
      'Guía de Pausas Activas',
      'Profesiogramas Ocupacionales'
    ]
  },
  {
    id: 'norm_ley_1523',
    name: 'Política Nacional de Gestión del Riesgo de Desastres',
    number: 'Ley 1523',
    year: 2012,
    description: 'Regula la planeación y ejecución de estrategias corporativas de prevención de emergencias, obligando a las empresas a contar con planes de contingencia estructurados.',
    category: 'Emergencias',
    relevantArticles: [
      {
        articleNumber: 'Artículo 42',
        title: 'Análisis de vulnerabilidad corporativa',
        description: 'Las empresas públicas y privadas deben realizar estudios de análisis de riesgo de desastres y vulnerabilidad en sus instalaciones.'
      }
    ],
    obligations: [
      'Conformar, dotar y entrenar brigadas de emergencia (Primeros Auxilios, Evacuación, Incendios).',
      'Realizar al menos un simulacro de evacuación corporativo al año.'
    ],
    requiredEvidences: [
      'Plan de Prevención, Preparación y Respuesta ante Emergencias aprobado.',
      'Actas de conformación y entrenamiento de la Brigada de Emergencias.',
      'Informe ejecutivo del Simulacro de Evacuación Anual con registro de tiempos.'
    ],
    relatedDocuments: [
      'Plan de Emergencias Corporativo',
      'Análisis de Vulnerabilidad por Colores',
      'Fichas de Inspección de Extintores y Botiquines'
    ]
  },
  {
    id: 'norm_resolucion_2013',
    name: 'Funcionamiento del COPASST',
    number: 'Resolución 2013',
    year: 1986,
    description: 'Regula la organización y funcionamiento de los Comités Paritarios de Seguridad y Salud en el Trabajo (COPASST), garantizando la representación equitativa de empleador y trabajadores en la mesa de salud.',
    category: 'COPASST',
    relevantArticles: [
      {
        articleNumber: 'Artículo 2',
        title: 'Composición paritaria del comité',
        description: 'La conformación del comité depende del número de trabajadores (ej. de 10 a 49 trabajadores: 1 representante por cada parte; de 50 a 499: 2 representantes, etc.).'
      },
      {
        articleNumber: 'Artículo 11',
        title: 'Funciones del Comité',
        description: 'Proponer medidas preventivas, realizar inspecciones periódicas a puestos de trabajo y participar en la investigación de accidentes laborales.'
      }
    ],
    obligations: [
      'Garantizar la conformación del COPASST o Vigía de SST (si hay menos de 10 trabajadores).',
      'Permitir un mínimo de 4 horas semanales de la jornada laboral de cada miembro para actividades del comité.'
    ],
    requiredEvidences: [
      'Acta de Constitución del COPASST inscrita en el Ministerio del Trabajo.',
      'Actas de reunión mensual diligenciadas y firmadas por todos los miembros.',
      'Evidencia de las inspecciones de seguridad programadas por el COPASST.'
    ],
    relatedDocuments: [
      'Acta de Escrutinio y Elección de Representantes de los Trabajadores',
      'Carta de designación de representantes del empleador',
      'Cronograma Anual del COPASST'
    ]
  },
  {
    id: 'norm_resolucion_652',
    name: 'Funcionamiento del Comité de Convivencia Laboral',
    number: 'Resolución 652',
    year: 2012,
    description: 'Establece la conformación y el funcionamiento de los Comités de Convivencia Laboral en entidades públicas y empresas privadas, como medida preventiva ante el acoso laboral.',
    category: 'Comité de Convivencia',
    relevantArticles: [
      {
        articleNumber: 'Artículo 3',
        title: 'Conformación del Comité de Convivencia',
        description: 'El comité se compondrá de representantes de los trabajadores y empleadores de forma paritaria, elegidos democráticamente.'
      },
      {
        articleNumber: 'Artículo 6',
        title: 'Funciones del Comité',
        description: 'Recibir y dar trámite a quejas de posible acoso laboral, promover espacios de diálogo confidencial y proponer planes de mejora de la convivencia.'
      }
    ],
    obligations: [
      'Constituir formalmente el Comité de Convivencia Laboral de la empresa.',
      'Garantizar la confidencialidad absoluta de todas las actas y quejas recibidas en las mesas.',
      'Efectuar sesiones ordinarias trimestralmente.'
    ],
    requiredEvidences: [
      'Acta de Elección Democrática y Acta de Constitución del Comité de Convivencia.',
      'Actas de Reunión Trimestral debidamente archivadas bajo parámetros de confidencialidad.',
      'Informes anuales de gestión y estadísticas de casos reportados sin revelar identidades.'
    ],
    relatedDocuments: [
      'Reglamento de Funcionamiento del Comité',
      'Formato de Recepción de Quejas de Acoso Laboral'
    ]
  },
  {
    id: 'norm_auditorias_sst',
    name: 'Auditoría Obligatoria y Revisión por la Alta Dirección',
    number: 'Decreto 1072 (Sección 6)',
    year: 2015,
    description: 'Establece la obligación legal de auditar de forma sistemática e independiente el cumplimiento integral de los estándares mínimos y la efectividad de las medidas preventivas del SG-SST.',
    category: 'Auditorías',
    relevantArticles: [
      {
        articleNumber: 'Artículo 2.2.4.6.29',
        title: 'Auditoría anual del SG-SST',
        description: 'El empleador debe realizar una auditoría anual la cual debe ser planificada con la participación del comité paritario.'
      },
      {
        articleNumber: 'Artículo 2.2.4.6.31',
        title: 'Revisión por la alta dirección',
        description: 'La alta dirección debe revisar el sistema de gestión una vez al año para determinar si se cumplen los objetivos estratégicos de salud ocupacional.'
      }
    ],
    obligations: [
      'Programar y ejecutar auditorías del SG-SST con auditores independientes o idóneos.',
      'Generar los informes con planes de acción correctivos derivados de los hallazgos de auditoría.'
    ],
    requiredEvidences: [
      'Programa de Auditoría firmado.',
      'Informe detallado de resultados de la Auditoría Anual con firmas del auditor licenciado.',
      'Actas de Revisión por la Alta Dirección de los resultados consolidados de SST.'
    ],
    relatedDocuments: [
      'Plan de Auditoría Interna',
      'Formatos de No Conformidades / Acciones Preventivas y Correctivas'
    ]
  }
];

export class ComplianceStore {
  /**
   * Returns all stored legislation norms
   */
  public static getAll(): RegulatoryNorm[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading compliance norms from localStorage:', e);
    }

    // Default fallback
    this.save(COLOMBIAN_DEFAULT_NORMS);
    return COLOMBIAN_DEFAULT_NORMS;
  }

  /**
   * Adds a new regulatory norm dynamically
   */
  public static add(norm: Omit<RegulatoryNorm, 'id'>): RegulatoryNorm {
    const current = this.getAll();
    const newNorm: RegulatoryNorm = {
      ...norm,
      id: `norm_custom_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    };

    const updated = [...current, newNorm];
    this.save(updated);
    return newNorm;
  }

  /**
   * Updates an existing regulatory norm
   */
  public static update(id: string, updates: Partial<RegulatoryNorm>): RegulatoryNorm | null {
    const current = this.getAll();
    const index = current.findIndex(n => n.id === id);
    if (index === -1) return null;

    const updatedNorm = {
      ...current[index],
      ...updates
    };

    current[index] = updatedNorm;
    this.save(current);
    return updatedNorm;
  }

  /**
   * Deletes a regulation from local storage database
   */
  public static delete(id: string): boolean {
    const current = this.getAll();
    const filtered = current.filter(n => n.id !== id);
    if (filtered.length === current.length) return false;

    this.save(filtered);
    return true;
  }

  /**
   * Restores original default Colombian legal norms catalog
   */
  public static resetToDefaults(): RegulatoryNorm[] {
    this.save(COLOMBIAN_DEFAULT_NORMS);
    return COLOMBIAN_DEFAULT_NORMS;
  }

  /**
   * Query matching norms by categories or related tags.
   * This is the API designed for the AI Engine to search Colombian legislation.
   */
  public static queryByCategoryOrDimension(keyword: string): RegulatoryNorm[] {
    const all = this.getAll();
    const lowerKeyword = keyword.toLowerCase();

    return all.filter(norm => {
      // Direct category match
      const categoryMatch = norm.category.toLowerCase().includes(lowerKeyword);
      
      // Indirect dimension correlation
      const isPsychosocial = (lowerKeyword.includes('psico') || lowerKeyword.includes('clima') || lowerKeyword.includes('lider') || lowerKeyword.includes('cultur') || lowerKeyword.includes('liderazgo')) && norm.category === 'Riesgo Psicosocial';
      const isSST = (lowerKeyword.includes('sst') || lowerKeyword.includes('seguridad') || lowerKeyword.includes('salud') || lowerKeyword.includes('ausentismo')) && norm.category === 'SG-SST';
      const isBienestar = (lowerKeyword.includes('bienestar') || lowerKeyword.includes('recre') || lowerKeyword.includes('deport') || lowerKeyword.includes('capacit')) && norm.category === 'Bienestar';
      const isErgo = (lowerKeyword.includes('ergo') || lowerKeyword.includes('biomec') || lowerKeyword.includes('carga') || lowerKeyword.includes('postur')) && norm.category === 'Ergonomía';
      const isEmergencias = (lowerKeyword.includes('emerg') || lowerKeyword.includes('conting') || lowerKeyword.includes('evac') || lowerKeyword.includes('brigad')) && norm.category === 'Emergencias';
      const isCopasst = (lowerKeyword.includes('copasst') || lowerKeyword.includes('inspecc') || lowerKeyword.includes('paritar')) && norm.category === 'COPASST';
      const isComite = (lowerKeyword.includes('conviv') || lowerKeyword.includes('acoso') || lowerKeyword.includes('comite')) && norm.category === 'Comité de Convivencia';
      const isAuditorias = (lowerKeyword.includes('audit') || lowerKeyword.includes('revis') || lowerKeyword.includes('cumplimiento')) && norm.category === 'Auditorías';
      const isHR = (lowerKeyword.includes('human') || lowerKeyword.includes('talent') || lowerKeyword.includes('rotac') || lowerKeyword.includes('contrat') || lowerKeyword.includes('compens')) && norm.category === 'Capital Humano';

      return categoryMatch || isPsychosocial || isSST || isBienestar || isErgo || isEmergencias || isCopasst || isComite || isAuditorias || isHR;
    });
  }

  private static save(norms: RegulatoryNorm[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(norms));
    } catch (e) {
      console.error('Error saving compliance norms to localStorage:', e);
    }
  }
}
