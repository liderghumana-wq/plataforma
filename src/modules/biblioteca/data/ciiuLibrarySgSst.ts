export interface SgSstPrograma {
  nombre: string;
  desc: string;
  foco: string;
}

export interface SgSstIndicador {
  nombre: string;
  formula: string;
  meta: string;
  frecuencia: string;
}

export interface SgSstCapacitacion {
  tema: string;
  desc: string;
  frecuencia: string;
}

export interface SgSstPeligro {
  descripcion: string;
  clasificacion: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
}

export interface SgSstNorma {
  norma: string;
  descripcion: string;
  entidad: string;
  articuloClave: string;
}

export interface SgSstCiiuRelation {
  codigo: string;
  nombreOficial: string;
  sectorEconomico: string;
  claseRiesgo: string;
  descripcion: string;
  riesgosPrioritarios: string[];
  programasSugeridos: SgSstPrograma[];
  indicadoresRecomendados: SgSstIndicador[];
  capacitacionesRecomendadas: SgSstCapacitacion[];
  peligrosGtc45: SgSstPeligro[];
  normatividad: SgSstNorma[];
}

export const BIBLIOTECA_CIIU_SG_SST: SgSstCiiuRelation[] = [
  {
    codigo: '8220',
    nombreOficial: 'Actividades de Centros de Llamadas (Call Center)',
    sectorEconomico: 'Servicios de Apoyo Empresarial',
    claseRiesgo: 'I',
    descripcion: 'Comprende las actividades de centros de llamadas entrantes y salientes, atención telefónica, telemercadeo, soporte técnico básico, cobranzas y soporte en atención al usuario.',
    riesgosPrioritarios: [
      'Psicosocial (Estrés laboral, sobrecarga mental, síndrome de Burnout)',
      'Biomecánico (Movimientos repetitivos en digitación, posturas estáticas prolongadas)',
      'Ergonómico (Diseño y dimensiones de estaciones de trabajo, sillas inapropiadas)',
      'Fatiga Visual (Exposición constante a pantallas de datos, brillos, mala iluminación)',
      'Riesgo Vocal (Disfonía funcional, tensión laríngea, sequedad vocal)',
      'Sedentarismo (Bajo consumo calórico, riesgo cardiovascular, venas várices)'
    ],
    programasSugeridos: [
      { nombre: 'Programa de Riesgo Psicosocial', desc: 'Evaluación anual de factores de estrés laboral intralaboral y extralaboral, talleres de resiliencia y contención emocional.', foco: 'Disminuir el ausentismo psicosomático' },
      { nombre: 'Programa de Ergonomía', desc: 'Inspecciones técnicas de puestos, ajustes en ángulos de confort e iluminación de las pantallas.', foco: 'Prevenir patologías cervicales y dorsales' },
      { nombre: 'Programa de Pausas Activas', desc: 'Ejercicios de estiramiento compensatorio y estiramiento de extremidades cada 3 horas.', foco: 'Reducir la fatiga física muscular' },
      { nombre: 'Programa de Conservación de la Voz', desc: 'Técnicas de modulación de la voz, hidratación y calentamiento vocal antes de la jornada.', foco: 'Prevenir la afonía y disfonía' },
      { nombre: 'Programa de Promoción y Prevención', desc: 'Chequeos de salud cardiovascular preventiva, pausas guiadas e higiene del sueño.', foco: 'Prevenir enfermedades comunes de tipo crónico' },
      { nombre: 'Programa de Estilos de Vida Saludables', desc: 'Asesoría de nutrición preventiva, campañas antitabaco y retos deportivos virtuales.', foco: 'Bajar los índices de sobrepeso' },
      { nombre: 'Programa de Vigilancia Osteomuscular', desc: 'Seguimiento preventivo a reportes de dolores músculo-esqueléticos de cuello, hombros y manos.', foco: 'Mitigar el túnel carpiano' }
    ],
    indicadoresRecomendados: [
      { nombre: 'Ausentismo', formula: '(Nro de días de ausencia en el mes / Nro de días de trabajo programados) x 100', meta: '< 2.5%', frecuencia: 'Mensual' },
      { nombre: 'Rotación', formula: '(Nro de desvinculaciones / Promedio de trabajadores activos) x 100', meta: '< 5.0%', frecuencia: 'Mensual' },
      { nombre: 'Accidentalidad', formula: '(Nro de accidentes de trabajo en el año / Nro de trabajadores) x 100', meta: '0%', frecuencia: 'Anual' },
      { nombre: 'Frecuencia de Accidentes', formula: '(Nro de accidentes en el mes / Nro de horas hombre trabajadas) x 240.000', meta: '< 1.5', frecuencia: 'Mensual' },
      { nombre: 'Severidad de Accidentes', formula: '(Nro de días de incapacidad + días cargados / Nro de horas hombre) x 240.000', meta: '< 10.0', frecuencia: 'Mensual' },
      { nombre: 'Capacitación', formula: '(Nro de trabajadores capacitados / Nro de trabajadores programados) x 100', meta: '> 90%', frecuencia: 'Mensual' },
      { nombre: 'Clima Organizacional', formula: '(Suma de respuestas favorables / Total de respuestas evaluadas) x 100', meta: '> 80%', frecuencia: 'Anual' },
      { nombre: 'Riesgo Psicosocial', formula: 'Proporción de personal en nivel de riesgo Alto o Muy Alto', meta: '< 20%', frecuencia: 'Anual' },
      { nombre: 'Participación en SST', formula: '(Nro de colaboradores inscritos en actividades de SST / Total de nómina) x 100', meta: '> 70%', frecuencia: 'Trimestral' }
    ],
    capacitacionesRecomendadas: [
      { tema: 'Manejo del Estrés y Ansiedad', desc: 'Taller de autorregulación emocional, técnicas de respiración y desconexión laboral saludable.', frecuencia: 'Semestral' },
      { tema: 'Pausas Activas y Compensación', desc: 'Alineación corporal, ejercicios lúdicos y automasaje para prevenir tensión cervical.', frecuencia: 'Trimestral' },
      { tema: 'Ergonomía de Oficina y Teletrabajo', desc: 'Configuración ideal de sillas, mesas, teclados y pantallas de visualización.', frecuencia: 'Anual' },
      { tema: 'Salud Mental y Autocuidado', desc: 'Hábitos diarios de desconexión garantizada y fortalecimiento de redes de apoyo.', frecuencia: 'Anual' },
      { tema: 'Servicio al Cliente y Manejo de Clientes Difíciles', desc: 'Comunicación asertiva telefónica, empatía verbal y prevención del desgaste emocional.', frecuencia: 'Semestral' },
      { tema: 'Comunicación Asertiva y Clima', desc: 'Retroalimentación constructiva, asertividad grupal y canales de confianza.', frecuencia: 'Anual' },
      { tema: 'Prevención del Acoso Laboral', desc: 'Marco legal, lineamientos del Comité de Convivencia y canales de denuncia confidencial.', frecuencia: 'Anual' },
      { tema: 'Cuidado y Técnica de la Voz', desc: 'Fisiología vocal, respiración costo-diafragmática y hábitos de hidratación.', frecuencia: 'Semestral' }
    ],
    peligrosGtc45: [
      { descripcion: 'Posturas prolongadas sentadas (sedestación prolongada) durante toda la jornada laboral.', clasificacion: 'Biomecánico', prioridad: 'Alta' },
      { descripcion: 'Movimientos repetitivos de miembros superiores en digitación continua de llamadas y datos.', clasificacion: 'Biomecánico', prioridad: 'Alta' },
      { descripcion: 'Sobrecarga de trabajo de atención, presión de tiempo (AHT), metas y atención de usuarios conflictivos.', clasificacion: 'Psicosocial', prioridad: 'Alta' },
      { descripcion: 'Exposición a radiaciones no ionizantes de pantallas de visualización de datos (computadores).', clasificacion: 'Físico', prioridad: 'Media' },
      { descripcion: 'Uso constante de la voz con proyección inadecuada y falta de pausas de reposo vocal.', clasificacion: 'Fisiológico / Biomecánico', prioridad: 'Alta' },
      { descripcion: 'Condición locativa por deficientes de cableado o caídas al mismo nivel en pasillos de diademas.', clasificacion: 'Condiciones de Seguridad', prioridad: 'Baja' }
    ],
    normatividad: [
      { norma: 'Ley 1562 de 2012', descripcion: 'Modifica el Sistema de Riesgos Laborales y dicta disposiciones en salud ocupacional en Colombia.', entidad: 'Congreso de Colombia', articuloClave: 'Artículo 2 (Afiliación obligatoria al sistema)' },
      { norma: 'Decreto 1072 de 2015', descripcion: 'Decreto Único Reglamentario del Sector Trabajo, establece el SG-SST obligatorio.', entidad: 'Ministerio de Trabajo', articuloClave: 'Libro 2, Parte 2, Título 4, Capítulo 6 (SG-SST)' },
      { norma: 'Resolución 0312 de 2019', descripcion: 'Establece los Estándares Mínimos del SG-SST para personas naturales y jurídicas.', entidad: 'Ministerio de Trabajo', articuloClave: 'Estándares aplicables según nro de empleados y nivel de riesgo' },
      { norma: 'Resolución 2646 de 2008', descripcion: 'Establece disposiciones para la identificación, evaluación y prevención de factores de riesgo psicosocial.', entidad: 'Ministerio de la Protección Social', articuloClave: 'Evaluación y monitoreo permanente de factores intralaborales y extralaborales' },
      { norma: 'Resolución 2404 de 2019', descripcion: 'Adopta el referente técnico de la batería de instrumentos de riesgo psicosocial en el país.', entidad: 'Ministerio de Trabajo', articuloClave: 'Obligatoriedad de uso de guías de intervención psicosocial sectorial' },
      { norma: 'Ley 1010 de 2006', descripcion: 'Establece medidas para prevenir, corregir y sancionar el acoso laboral en empresas.', entidad: 'Congreso de Colombia', articuloClave: 'Mecanismos de prevención y conformación de Comités de Convivencia' },
      { norma: 'Ley 2191 de 2022', descripcion: 'Regula el derecho a la desconexión laboral de los trabajadores en Colombia.', entidad: 'Congreso de Colombia', articuloClave: 'Artículo 3 (Garantizar la desconexión digital post-jornada)' },
      { norma: 'Ley 1581 de 2012', descripcion: 'Ley de Protección de Datos Personales (Habeas Data) aplicable en encuestas sociodemográficas.', entidad: 'Congreso de Colombia', articuloClave: 'Tratamiento de datos sensibles de salud ocupacional' },
      { norma: 'Resolución 652 de 2012', descripcion: 'Establece la conformación y funcionamiento del Comité de Convivencia Laboral.', entidad: 'Ministerio de Trabajo', articuloClave: 'Comités de Convivencia en entidades públicas y privadas' },
      { norma: 'Resolución 1356 de 2012', descripcion: 'Modifica parcialmente la Resolución 652 de 2012 sobre conformación del Comité.', entidad: 'Ministerio de Trabajo', articuloClave: 'Ajuste del número de miembros según tamaño de planta laboral' }
    ]
  },
  {
    codigo: '6201',
    nombreOficial: 'Desarrollo de Sistemas Informáticos (Software y Consultoría TI)',
    sectorEconomico: 'Tecnología de la Información y las Comunicaciones',
    claseRiesgo: 'I',
    descripcion: 'Diseño de la estructura, código, programación de aplicaciones, bases de datos, consultoría e integración de redes informáticas de datos corporativos.',
    riesgosPrioritarios: [
      'Riesgo Psicosocial (Carga mental por cronogramas ajustados, exigencia lógica)',
      'Biomecánico (Síndrome de túnel carpiano por digitación prolongada, posturas dorsales)',
      'Ergonomía (Mal diseño de sillas, altura del monitor incorrecta)',
      'Fatiga Visual (Luz azul de monitores, resequedad ocular, acomodación visual)',
      'Sedentarismo (Falta de movilidad física, sedentarismo prolongado de escritorio)'
    ],
    programasSugeridos: [
      { nombre: 'Programa de Riesgo Psicosocial', desc: 'Talleres preventivos de manejo de ansiedad por fechas de entrega, burnout informático y equilibrio vida-trabajo.', foco: 'Estabilizar salud mental en equipos ágiles' },
      { nombre: 'Programa de Ergonomía', desc: 'Asesoría en periféricos ergonómicos, soportes para portátiles y sillas de alto confort postural.', foco: 'Evitar lesiones de columna y túnel carpiano' },
      { nombre: 'Programa de Pausas Activas', desc: 'Rutinas de desconexión visual y estiramiento de muñecas y manos.', foco: 'Disminuir resequedad ocular y adormecimiento de manos' },
      { nombre: 'Programa de Vigilancia Osteomuscular', desc: 'Encuestas sintomáticas rápidas y seguimiento a colaboradores en teletrabajo.', foco: 'Mitigar la tasa de incapacidades médicas' }
    ],
    indicadoresRecomendados: [
      { nombre: 'Ausentismo', formula: '(Nro días de ausencia / Total días programados) x 100', meta: '< 2.0%', frecuencia: 'Mensual' },
      { nombre: 'Rotación de Personal', formula: '(Nro desvinculaciones / Personal activo promedio) x 100', meta: '< 4.0%', frecuencia: 'Mensual' },
      { nombre: 'Capacitación en SST', formula: '(Participantes / Programados) x 100', meta: '> 85%', frecuencia: 'Trimestral' }
    ],
    capacitacionesRecomendadas: [
      { tema: 'Prevención de Lesiones de Túnel Carpiano', desc: 'Ejercicios de estiramiento de flexores y extensores de dedos, uso correcto del mouse.', frecuencia: 'Semestral' },
      { tema: 'Higiene Postural en Teletrabajo', desc: 'Configuración de oficina en casa, pausas de desconexión y luz natural recomendada.', frecuencia: 'Anual' },
      { tema: 'Manejo del Burnout Técnico', desc: 'Gestión eficaz de tareas, metodología ágil sostenible y desconexión digital.', frecuencia: 'Semestral' }
    ],
    peligrosGtc45: [
      { descripcion: 'Digitación prolongada con flexo-extensión repetitiva de muñeca.', clasificacion: 'Biomecánico', prioridad: 'Alta' },
      { descripcion: 'Jornadas sentadas estáticas continuas superiores a 6 horas.', clasificacion: 'Biomecánico', prioridad: 'Alta' },
      { descripcion: 'Carga mental intensa por desarrollo de algoritmos lógicos complejos y entregas ajustadas.', clasificacion: 'Psicosocial', prioridad: 'Media' }
    ],
    normatividad: [
      { norma: 'Decreto 1072 de 2015', descripcion: 'Sistema de Gestión de Seguridad y Salud en el Trabajo obligatorio.', entidad: 'Ministerio de Trabajo', articuloClave: 'Implementación del SG-SST' },
      { norma: 'Ley 2191 de 2022', descripcion: 'Ley de Desconexión Laboral para garantizar tiempo de ocio fuera de la jornada.', entidad: 'Congreso de Colombia', articuloClave: 'Derecho a la desconexión total fuera del horario pactado' },
      { norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos de SST aplicables.', entidad: 'Ministerio de Trabajo', articuloClave: 'Estándares de ley' }
    ]
  },
  {
    codigo: '8544',
    nombreOficial: 'Educación Superior y Formación Profesional',
    sectorEconomico: 'Educación',
    claseRiesgo: 'I',
    descripcion: 'Actividades de universidades, institutos técnicos y tecnológicos autorizados por el Ministerio de Educación que imparten docencia, investigación y soporte académico.',
    riesgosPrioritarios: [
      'Riesgo Vocal (Disfonías, fatiga laríngea por dictado de clases presenciales)',
      'Riesgo Psicosocial (Estrés por manejo de grupos de estudiantes, burnout docente)',
      'Biomecánico / Ergonómico (Bipedestación prolongada frente al tablero, mala postura)',
      'Riesgo Biológico (Agentes infecciosos respiratorios por alta concentración de personas)'
    ],
    programasSugeridos: [
      { nombre: 'Programa de Conservación de la Voz', desc: 'Talleres prácticos de impostación de la voz, hidratación continua y uso de amplificadores de sonido.', foco: 'Prevenir patologías laríngeas en docentes' },
      { nombre: 'Programa de Riesgo Psicosocial', desc: 'Soporte y resiliencia para docentes ante el agotamiento institucional y manejo de conflictos.', foco: 'Estabilizar el clima académico' },
      { nombre: 'Programa de Pausas Activas', desc: 'Rutinas de estiramiento compensatorio de espalda y piernas entre bloques académicos.', foco: 'Prevenir lumbalgias por bipedestación' }
    ],
    indicadoresRecomendados: [
      { nombre: 'Incapacidad por Enfermedad Vocal', formula: '(Nro de docentes incapacitados por voz / Total de docentes) x 100', meta: '< 1.0%', frecuencia: 'Semestral' },
      { nombre: 'Ausentismo Docente', formula: '(Horas perdidas / Horas lectivas programadas) x 100', meta: '< 3.0%', frecuencia: 'Mensual' }
    ],
    capacitacionesRecomendadas: [
      { tema: 'Técnica Vocal e Impostación de la Voz', desc: 'Manejo de la respiración diafragmática y protección laríngea en el aula.', frecuencia: 'Semestral' },
      { tema: 'Manejo de Conflictos y Comunicación en el Aula', desc: 'Mediación asertiva de tensiones con estudiantes y manejo del estrés social.', frecuencia: 'Anual' }
    ],
    peligrosGtc45: [
      { descripcion: 'Uso repetitivo y prolongado de las cuerdas vocales sin amplificación ni descanso.', clasificacion: 'Fisiológico / Vocal', prioridad: 'Alta' },
      { descripcion: 'Postura de pie prolongada (bipedestación) durante clases continuas de 2 a 4 horas.', clasificacion: 'Biomecánico', prioridad: 'Media' },
      { descripcion: 'Exposición a virus respiratorios en aulas con alta afluencia y ventilación insuficiente.', clasificacion: 'Biológico', prioridad: 'Media' }
    ],
    normatividad: [
      { norma: 'Decreto 1072 de 2015', descripcion: 'Sistema de Gestión de SST obligatorio para centros de educación.', entidad: 'Ministerio de Trabajo', articuloClave: 'Seguridad en ambientes de trabajo escolar' },
      { norma: 'Resolución 2646 de 2008', descripcion: 'Evaluación del riesgo psicosocial en personal docente.', entidad: 'Ministerio de Protección Social', articuloClave: 'Factores de exigencia emocional docente' }
    ]
  },
  {
    codigo: '8610',
    nombreOficial: 'Actividades de Hospitales, Clínicas e IPS (Sector Salud)',
    sectorEconomico: 'Salud Humana y Asistencia Social',
    claseRiesgo: 'III',
    descripcion: 'Servicios de internación hospitalaria, atención médica especializada, urgencias, cirugías, diagnósticos de laboratorio y terapias de rehabilitación clínica.',
    riesgosPrioritarios: [
      'Riesgo Biológico (Infección por virus, bacterias, fluidos, cortes accidentales, agujas)',
      'Riesgo Psicosocial (Burnout severo, síndrome de fatiga por turnos, manejo de pacientes en estado crítico)',
      'Riesgo Biomecánico (Manipulación y traslado manual de pacientes con sobreesfuerzo muscular)',
      'Riesgo Químico (Manipulación de sustancias desinfectantes, esterilizantes y gases medicinales)',
      'Riesgo Físico (Exposición pasiva a radiaciones ionizantes en laboratorios o rayos X)'
    ],
    programasSugeridos: [
      { nombre: 'Programa de Vigilancia Epidemiológica para Riesgo Biológico', desc: 'Vacunación completa, protocolos estandarizados ante accidentes biológicos con aguja y dotación de EPP.', foco: 'Eliminar el contagio de patógenos por fluidos' },
      { nombre: 'Programa de Riesgo Psicosocial (Salud Mental)', desc: 'Espacios de contención psicológica por estrés postraumático, turnos balanceados de enfermería.', foco: 'Evitar el colapso emocional de personal de guardia' },
      { nombre: 'Programa de Higiene de Columna', desc: 'Talleres de movilización mecánica segura de pacientes con técnicas de esfuerzo compartido.', foco: 'Disminuir hernias lumbares en auxiliares de enfermería' }
    ],
    indicadoresRecomendados: [
      { nombre: 'Incidencia de Accidentes Biológicos', formula: '(Nro pinchazos reportados / Total de personal médico expuesto) x 100', meta: '0%', frecuencia: 'Mensual' },
      { nombre: 'Frecuencia de Ausentismo por Lumbalgia', formula: '(Nro de incapacidades por lumbalgia / Total de incapacidades del mes) x 100', meta: '< 5%', frecuencia: 'Mensual' }
    ],
    capacitacionesRecomendadas: [
      { tema: 'Protocolo ante Accidentes de Riesgo Biológico', desc: 'Ruta de lavado inmediato, reporte a ARL e inicio oportuno de profilaxis.', frecuencia: 'Semestral' },
      { tema: 'Movilización Segura de Pacientes y Ergonomía', desc: 'Uso correcto de grúas, sábanas deslizantes y posturas correctas para el traslado de personas postradas.', frecuencia: 'Semestral' },
      { tema: 'Gestión de Crisis Emocionales y Duelo', desc: 'Técnicas de primeros auxilios psicológicos y manejo ante el fallecimiento de pacientes.', frecuencia: 'Anual' }
    ],
    peligrosGtc45: [
      { descripcion: 'Contacto directo con fluidos corporales infectocontagiosos por pinchazos con agujas o instrumental quirúrgico.', clasificacion: 'Biológico', prioridad: 'Alta' },
      { descripcion: 'Traslado manual de pacientes obesos o con movilidad nula sin el uso de equipos mecánicos auxiliares.', clasificacion: 'Biomecánico', prioridad: 'Alta' },
      { descripcion: 'Jornadas de trabajo nocturnas prolongadas (turnos de 12 a 24 horas) con privación de sueño regular.', clasificacion: 'Psicosocial', prioridad: 'Alta' }
    ],
    normatividad: [
      { norma: 'Decreto 1072 de 2015', descripcion: 'Establece obligaciones de reportes médicos específicos en salud ocupacional.', entidad: 'Ministerio de Trabajo', articuloClave: 'Vigilancia de la salud colectiva médica' },
      { norma: 'Resolución 0312 de 2019', descripcion: 'Define los estándares mínimos requeridos para empresas de clase de riesgo III.', entidad: 'Ministerio de Trabajo', articuloClave: 'Estándares estrictos de seguridad industrial' },
      { norma: 'Decreto 768 de 2022', descripcion: 'Actualiza la tabla de clasificación de actividades económicas de riesgos laborales en Colombia.', entidad: 'Ministerio de Trabajo', articuloClave: 'Mapeo del nivel de riesgo sector salud' }
    ]
  },
  {
    codigo: '4111',
    nombreOficial: 'Construcción de Edificaciones Residenciales y Proyectos Civiles',
    sectorEconomico: 'Construcción',
    claseRiesgo: 'V',
    descripcion: 'Obras de edificación de viviendas de interés social y residenciales de altura, cimentaciones, excavaciones, mampostería y acabados de ingeniería civil.',
    riesgosPrioritarios: [
      'Trabajo en Alturas (Caídas de personal a diferente nivel en andamios y cubiertas)',
      'Físico (Exposición a ruidos elevados de taladros, vibraciones en extremidades, radiación solar)',
      'Biomecánico (Sobreesfuerzos en levantamiento de sacos de cemento, varillas, ladrillos)',
      'Químico (Inhalación de polvos, material particulado, sílice cristalina por mezclas secas)',
      'Accidentes Graves (Atrapamientos por derrumbes de tierra, caída de objetos pesados)'
    ],
    programasSugeridos: [
      { nombre: 'Programa de Protección Contra Caídas en Alturas', desc: 'Inspección pre-uso de arneses y líneas de vida, andamios certificados, permisos de trabajo diario.', foco: 'Cero caídas graves' },
      { nombre: 'Programa de Higiene Industrial por Ruido y Sílice', desc: 'Dosimetría de ruido, tamizajes de espirometrías periódicas y uso obligatorio de respiradores N95/N100.', foco: 'Prevenir la silicosis e hipoacusia' },
      { nombre: 'Programa de Manipulación Manual de Cargas', desc: 'Ayudas mecánicas para sacos pesados, carretillas adecuadas y límites estrictos de peso de ley.', foco: 'Prevenir lumbalgias agudas' }
    ],
    indicadoresRecomendados: [
      { nombre: 'Frecuencia de Accidentes en Alturas', formula: '(Nro de accidentes en alturas / Total de accidentes del período) x 100', meta: '0%', frecuencia: 'Mensual' },
      { nombre: 'Severidad por Días Perdidos', formula: '(Días perdidos / Horas totales de trabajo) x 240.000', meta: '< 20', frecuencia: 'Mensual' }
    ],
    capacitacionesRecomendadas: [
      { tema: 'Curso de Trabajo Seguro en Alturas (Coordinador y Avanzado)', desc: 'Normas obligatorias nacionales, anclajes seguros, rescate básico en alturas.', frecuencia: 'Anual' },
      { tema: 'Uso Correcto de EPP y Protección Respiratoria para Polvo', desc: 'Ajuste del respirador para sílice, cuidado del arnés de protección.', frecuencia: 'Semestral' },
      { tema: 'Manejo Manual de Cargas en Obra', desc: 'Técnica de flexión de rodillas y levantamiento biomecánico seguro.', frecuencia: 'Semestral' }
    ],
    peligrosGtc45: [
      { descripcion: 'Labores en andamios colgantes o perfiles estructurales a alturas superiores a 2 metros.', clasificacion: 'Trabajo en Alturas', prioridad: 'Alta' },
      { descripcion: 'Levantamiento de sacos de cemento superiores a 25 kg de forma manual.', clasificacion: 'Biomecánico', prioridad: 'Alta' },
      { descripcion: 'Inhalación de polvo fino de cemento, sílice, concreto seco en mezclas continuas.', clasificacion: 'Químico', prioridad: 'Alta' }
    ],
    normatividad: [
      { norma: 'Decreto 1072 de 2015', descripcion: 'Sistema de Gestión aplicable con alto énfasis en subcontratistas y control de proveedores.', entidad: 'Ministerio de Trabajo', articuloClave: 'Responsabilidad solidaria con contratistas en SST' },
      { norma: 'Resolución 4272 de 2021', descripcion: 'Establece los requisitos mínimos de seguridad para trabajo en alturas en Colombia.', entidad: 'Ministerio de Trabajo', articuloClave: 'Obligatoriedad de sistemas certificados contra caídas' },
      { norma: 'Resolución 0312 de 2019', descripcion: 'Estándares para empresas de Clase de Riesgo V.', entidad: 'Ministerio de Trabajo', articuloClave: 'Cumplimiento exhaustivo de 60 estándares' }
    ]
  },
  {
    codigo: '4923',
    nombreOficial: 'Transporte de Carga por Carretera',
    sectorEconomico: 'Logística y Transporte',
    claseRiesgo: 'IV',
    descripcion: 'Transporte de mercancías generales, fletes nacionales, contenedores aduaneros, maquinaria pesada y productos industriales por la red de carreteras nacionales colombianas.',
    riesgosPrioritarios: [
      'Accidentes de Tránsito (Colisiones, volcamientos por micro-sueño, fallas mecánicas)',
      'Biomecánico (Postura sedentaria forzada frente al volante por más de 8 horas continuas)',
      'Psicosocial (Turnos irregulares de conducción, fatiga severa, presión en los tiempos de entrega)',
      'Físico (Exposición al ruido de motor, vibraciones de chasis de cuerpo entero)'
    ],
    programasSugeridos: [
      { nombre: 'Plan Estratégico de Seguridad Vial (PESV)', desc: 'Inspecciones pre-operacionales de vehículos, capacitación en conducción defensiva, control de fatiga.', foco: 'Reducir la siniestralidad vial en carreteras' },
      { nombre: 'Programa de Vigilancia de Riesgo Cardiovascular', desc: 'Tamizajes preventivos de glucosa, colesterol, presión arterial y peso para transportadores.', foco: 'Prevenir infartos o síncopes en ruta' },
      { nombre: 'Programa de Pausas Activas de Conducción', desc: 'Rutinas de estiramiento muscular en paradas de peajes o parqueaderos de carretera.', foco: 'Mitigar el dolor de espalda baja' }
    ],
    indicadoresRecomendados: [
      { nombre: 'Siniestros Viales', formula: 'Total de accidentes de tránsito reportados en el mes', meta: '0', frecuencia: 'Mensual' },
      { nombre: 'Frecuencia de Siniestralidad Vial', formula: '(Nro de accidentes viales / Kilómetros totales recorridos) x 1.000.000', meta: '< 0.5', frecuencia: 'Mensual' }
    ],
    capacitacionesRecomendadas: [
      { tema: 'Conducción Defensiva y Seguridad Vial', desc: 'Control de fatiga, micro-sueño en ruta, respeto a señales y distancias de frenado.', frecuencia: 'Semestral' },
      { tema: 'Manejo de Fatiga y Hábitos de Sueño', desc: 'Tácticas de descanso reparador, nutrición en ruta y detección de alertas de somnolencia.', frecuencia: 'Semestral' }
    ],
    peligrosGtc45: [
      { descripcion: 'Operación continua de vehículos en autopistas con exposición a choques y volcamientos.', clasificacion: 'Tránsito / Vial', prioridad: 'Alta' },
      { descripcion: 'Conducción estática prolongada con vibración continua transmitida por el chasis del motor.', clasificacion: 'Biomecánico / Físico', prioridad: 'Alta' },
      { descripcion: 'Carga mental por cumplimiento estricto de horarios logísticos y asaltos en carreteras.', clasificacion: 'Psicosocial / Seguridad', prioridad: 'Media' }
    ],
    normatividad: [
      { norma: 'Ley 1503 de 2011', descripcion: 'Promueve la educación en seguridad vial y el diseño del PESV en Colombia.', entidad: 'Ministerio de Transporte', articuloClave: 'Artículo 12 (Diseño e implementación de planes viales)' },
      { norma: 'Resolución 20223040040595 de 2022', descripcion: 'Adopta la metodología de diseño, implementación del Plan Estratégico de Seguridad Vial (PESV).', entidad: 'Ministerio de Transporte', articuloClave: 'Articulación obligatoria del PESV con el SG-SST' },
      { norma: 'Decreto 1072 de 2015', descripcion: 'Evaluación y control del SG-SST de transportadores.', entidad: 'Ministerio de Trabajo', articuloClave: 'Exámenes de ingreso especializados para conductores' }
    ]
  },
  {
    codigo: '1011',
    nombreOficial: 'Procesamiento y Conservación de Alimentos y Cárnicos',
    sectorEconomico: 'Manufactura y Alimentos',
    claseRiesgo: 'III',
    descripcion: 'Operación de plantas de beneficio animal, deshuese de productos cárnicos, almacenamiento frío y congelación de derivados cárnicos.',
    riesgosPrioritarios: [
      'Riesgo Mecánico (Cortes severos con cuchillos, sierras de banda o desarmadores)',
      'Riesgo Físico (Estrés térmico por frío extremo en cuartos de congelación rápida)',
      'Riesgo Ergonómico / Biomecánico (Movimientos muy rápidos repetitivos, postura de pie prolongada)',
      'Riesgo Biológico (Zoonosis, contaminación cruzada, bacterias patógenas animales)'
    ],
    programasSugeridos: [
      { nombre: 'Programa de Prevención de Accidentes por Herramientas de Corte', desc: 'Uso obligatorio de guantes de cota de malla de acero inoxidable, mantenimiento de sierras mecánicas.', foco: 'Cero cortes' },
      { nombre: 'Programa de Vigilancia de Riesgo Térmico por Frío', desc: 'Dotación de ropa térmica de alto aislamiento, tiempos de pausa para recuperación térmica.', foco: 'Evitar hipotermia y entumecimiento articular' },
      { nombre: 'Programa de Vigilancia Osteomuscular de Mano-Muñeca', desc: 'Rotación periódica entre estaciones de corte de carne, pausas de flexión de dedos.', foco: 'Disminuir la tendinitis' }
    ],
    indicadoresRecomendados: [
      { nombre: 'Frecuencia de Accidentes por Corte', formula: '(Nro accidentes por cortes / Horas hombre trabajadas) x 240.000', meta: '< 1.0', frecuencia: 'Mensual' },
      { nombre: 'Prevalencia de Enfermedades Osteomusculares', formula: '(Casos DME confirmados / Total personal de corte) x 100', meta: '< 3.5%', frecuencia: 'Semestral' }
    ],
    capacitacionesRecomendadas: [
      { tema: 'Uso Seguro de Cuchillos y Cota de Malla', desc: 'Técnica adecuada de afilado, manipulación de carnes en sentido contrario al cuerpo.', frecuencia: 'Trimestral' },
      { tema: 'Hábitos Térmicos y Autocuidado', desc: 'Uso óptimo de la ropa protectora en cavas de congelamiento e ingreso gradual a temperaturas.', frecuencia: 'Semestral' }
    ],
    peligrosGtc45: [
      { descripcion: 'Uso manual de cuchillos de alto filo en operaciones de deshuese y separación de piezas.', clasificacion: 'Mecánico', prioridad: 'Alta' },
      { descripcion: 'Ingreso rutinario a cuartos de congelamiento con temperaturas inferiores a -18°C.', clasificacion: 'Físico / Térmico', prioridad: 'Alta' },
      { descripcion: 'Posturas prolongadas de pie (bipedestación de pie) en líneas transportadoras.', clasificacion: 'Biomecánico', prioridad: 'Media' }
    ],
    normatividad: [
      { norma: 'Decreto 1072 de 2015', descripcion: 'Sistema de Gestión de SST obligatorio para plantas de producción cárnica.', entidad: 'Ministerio de Trabajo', articuloClave: 'Dotación y EPP certificados' },
      { norma: 'Resolución 0312 de 2019', descripcion: 'Estándares mínimos de SST aplicados al sector industrial.', entidad: 'Ministerio de Trabajo', articuloClave: 'Estándares mínimos clase de riesgo III' }
    ]
  },
  {
    codigo: '8010',
    nombreOficial: 'Actividades de Seguridad Privada, Vigilancia y Escoltas',
    sectorEconomico: 'Servicios de Seguridad Privada',
    claseRiesgo: 'IV',
    descripcion: 'Servicios de patrullaje de instalaciones corporativas, custodia de valores, escolta de mercancías, control de accesos e instalación de centrales de alarmas remotas.',
    riesgosPrioritarios: [
      'Riesgo de Orden Público (Ataques físicos, hurtos, agresión por armas de fuego o cortopunzantes)',
      'Riesgo Psicosocial (Estrés crónico por alerta defensiva prolongada, turnos nocturnos rotativos de 12 horas)',
      'Biomecánico / Ergonómico (Postura estática prolongada de pie o sentada en garita de control)',
      'Riesgo Físico (Exposición a inclemencias climáticas de frío, lluvia o sol directo en rondas)'
    ],
    programasSugeridos: [
      { nombre: 'Programa de Prevención de la Violencia Ocupacional', desc: 'Protocolos de comunicación de emergencia, manejo de armas reglamentarias autorizadas por la Superintendencia.', foco: 'Mitigar la letalidad por incidentes de agresión' },
      { nombre: 'Programa de Salud Mental y Control de Fatiga Nocturna', desc: 'Estudios de calidad de sueño para turnos rotativos, pausas de activación mental durante la noche.', foco: 'Prevenir incidentes de sueño en puestos de vigilancia' },
      { nombre: 'Programa de Cuidado Musculoesquelético para Rondas', desc: 'Dotación de calzado ergonómico, rondas con estiramientos preventivos y descansos planificados.', foco: 'Prevenir lumbalgias de guardia' }
    ],
    indicadoresRecomendados: [
      { nombre: 'Incidentes por Agresión Física', formula: 'Total de agresiones recibidas por el personal en el mes', meta: '0', frecuencia: 'Mensual' },
      { nombre: 'Incapacidad por Trastorno del Sueño', formula: '(Nro guardias con incapacidad por insomnio/fatiga / Total de guardias) x 100', meta: '< 2.0%', frecuencia: 'Semestral' }
    ],
    capacitacionesRecomendadas: [
      { tema: 'Procedimiento de Emergencia ante Asaltos o Agresiones', desc: 'Ruta de protección personal, llamados de auxilio, no confrontación física.', frecuencia: 'Semestral' },
      { tema: 'Higiene del Sueño y Alimentación para Turnos Nocturnos', desc: 'Cómo dormir con luz de día, nutrición nocturna ligera y recuperación física.', frecuencia: 'Semestral' }
    ],
    peligrosGtc45: [
      { descripcion: 'Agresión por terceros en zonas críticas con uso eventual de armas cortopunzantes o de fuego.', clasificacion: 'Seguridad / Orden Público', prioridad: 'Alta' },
      { descripcion: 'Guardias sentados o de pie en garitas por turnos rotativos fijos de 12 horas continuas.', clasificacion: 'Biomecánico', prioridad: 'Alta' },
      { descripcion: 'Rondas exteriores expuestas a bajas temperaturas nocturnas o lluvias prolongadas.', clasificacion: 'Físico / Clima', prioridad: 'Media' }
    ],
    normatividad: [
      { norma: 'Decreto 356 de 1994', descripcion: 'Estatuto de Vigilancia y Seguridad Privada en Colombia, regula armamento y entrenamiento.', entidad: 'Superintendencia de Vigilancia', articuloClave: 'Artículo 8 (Capacitación obligatoria en academias autorizadas)' },
      { norma: 'Decreto 1072 of 2015', descripcion: 'Sistema de Gestión de SST aplicable con exámenes específicos de aptitud mental de armas.', entidad: 'Ministerio de Trabajo', articuloClave: 'Certificado de idoneidad psicológica para porte de armas' },
      { norma: 'Resolución 2646 de 2008', descripcion: 'Medición de estrés psicosocial de alta relevancia por la naturaleza armada.', entidad: 'Ministerio de Protección Social', articuloClave: 'Evaluación psicosocial del personal expuesto a tensión armada' }
    ]
  },
  {
    codigo: '0111',
    nombreOficial: 'Cultivo de Cereales, Legumbres y Semillas Oleaginosas',
    sectorEconomico: 'Agricultura y Campo',
    claseRiesgo: 'III',
    descripcion: 'Preparación de terrenos rurales, siembra comercial de granos, trigo, arroz, fumigaciones controladas, recolección y trilla manual/mecánica de semillas.',
    riesgosPrioritarios: [
      'Riesgo Químico (Intoxicaciones agudas por aspersión manual de plaguicidas, herbicidas y abonos químicos)',
      'Riesgo Biológico (Mordeduras de serpientes, picaduras de arañas, abejas, contacto con esporas u hongos agrícolas)',
      'Biomecánico (Sobreesfuerzos severos en carga manual de sacos de cosecha, bipedestación con inclinación lumbar)',
      'Físico / Ambiental (Insolación extrema, deshidratación, fatiga muscular bajo sol directo)'
    ],
    programasSugeridos: [
      { nombre: 'Programa de Manejo Seguro de Plaguicidas (Agroquímicos)', desc: 'EPP especializado (traje Tyvek, máscaras de doble filtro de carbón activo), duchas de descontaminación in situ.', foco: 'Prevenir la toxicología crónica ocupacional' },
      { nombre: 'Programa de Control de Accidentes Ofídicos y Picaduras', desc: 'Dotación de botas de caucho de caña alta, suero antiofídico de emergencia en botiquín de campo.', foco: 'Evitar muertes por picadura o mordedura en campo' },
      { nombre: 'Programa de Prevención de Estrés Térmico por Sol', desc: 'Puntos fijos de hidratación con sueros orales, uso de sombreros de ala ancha y mangas protectoras.', foco: 'Prevenir desmayos y choque de calor' }
    ],
    indicadoresRecomendados: [
      { nombre: 'Intoxicaciones de Campo', formula: 'Número de trabajadores con síntomas de intoxicación química en el año', meta: '0', frecuencia: 'Mensual' },
      { nombre: 'Reportes por Mordeduras de Animales', formula: 'Total de incidentes ofídicos o biológicos en el período', meta: '0', frecuencia: 'Mensual' }
    ],
    capacitacionesRecomendadas: [
      { tema: 'Fumigación Segura y Mezcla de Agroquímicos', desc: 'Rotulado de sustancias, lavado del envase de plaguicidas, uso correcto del respirador químico.', frecuencia: 'Semestral' },
      { tema: 'Primeros Auxilios ante Picaduras y Mordeduras Ofídicas', desc: 'Qué no hacer ante una mordedura de serpiente, inmovilización básica y evacuación de ruta.', frecuencia: 'Semestral' }
    ],
    peligrosGtc45: [
      { descripcion: 'Aspersión de agroquímicos de alta toxicidad (glifosato, insecticidas organofosforados) sin EPP completo.', clasificacion: 'Químico', prioridad: 'Alta' },
      { descripcion: 'Presencia de serpientes, arañas y mosquitos vectores de fiebre o virus en zonas de matorral.', clasificacion: 'Biológico', prioridad: 'Alta' },
      { descripcion: 'Labores de recolección de cosecha encorvado bajo sol directo por periodos superiores a 4 horas.', clasificacion: 'Biomecánico / Físico', prioridad: 'Alta' }
    ],
    normatividad: [
      { norma: 'Decreto 1072 de 2015', descripcion: 'Sistema de Gestión de SST obligatorio adaptado al sector agropecuario rural.', entidad: 'Ministerio de Trabajo', articuloClave: 'Salud en el trabajo rural' },
      { norma: 'Resolución 0312 de 2019', descripcion: 'Define estándares mínimos aplicables para unidades de producción agropecuaria.', entidad: 'Ministerio de Trabajo', articuloClave: 'Estándares simplificados para pequeños productores del agro' }
    ]
  }
];

export function lookupCiiuSgSst(code: string): SgSstCiiuRelation | undefined {
  return BIBLIOTECA_CIIU_SG_SST.find(item => item.codigo === code);
}
