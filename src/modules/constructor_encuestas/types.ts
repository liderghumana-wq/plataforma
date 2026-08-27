export type TipoPregunta = 
  | 'texto'
  | 'numero'
  | 'fecha'
  | 'hora'
  | 'correo'
  | 'telefono'
  | 'lista'
  | 'radio'
  | 'checkbox'
  | 'sino'
  | 'multiple_seleccion'
  | 'texto_largo'
  | 'escala_likert'
  | 'escala_numerica'
  | 'nps'
  | 'archivo'
  | 'imagen'
  | 'firma'
  | 'ubicacion_gps';

export type OperadorRegla = 
  | 'igual_a' 
  | 'diferente_de' 
  | 'contiene' 
  | 'mayor_que' 
  | 'menor_que' 
  | 'en_lista'
  | 'respondida'
  | 'no_respondida';

export type AccionRegla = 
  | 'mostrar' 
  | 'ocultar' 
  | 'requerir' 
  | 'deshabilitar';

export interface ReglaDependencia {
  id: string;
  preguntaOrigenId: string; // ID de la pregunta de la cual depende
  operador: OperadorRegla;
  valorTarget: string; // Valor de comparación (ej: "Sí")
  accion: AccionRegla; // Qué hacer con la pregunta actual si se cumple la condición
}

export interface OpcionPregunta {
  id: string;
  label: string;
  value: string;
  codigo?: string;
  puntaje?: number;
}

export interface PreguntaConfig {
  id: string;
  seccionId: string;
  tipo: TipoPregunta;
  titulo: string;
  descripcion?: string;
  opciones?: OpcionPregunta[]; // Para lista, radio, checkbox, multiple_seleccion, likert
  
  // Configuraciones solicitadas
  obligatoria: boolean;
  visible: boolean;
  editable: boolean;
  valorPorDefecto?: string;
  placeholder?: string;
  tooltip?: string;
  textoAyuda?: string;
  expresionValidacion?: string; // Regex o expresion de validacion
  mensajeValidacionError?: string;
  patronRegex?: string;
  mensajeErrorRegex?: string;
  
  valorMinimo?: number;
  valorMaximo?: number;
  longitudMinima?: number;
  longitudMaxima?: number;
  limiteCaracteresOtro?: number;
  orden: number;
  categoria?: string; // Ej: "Sociodemográfico", "Estilo de Vida", "Ergonomía", etc.
  
  // Mapeos y Flags avanzados
  variableSistema?: boolean;
  nombreVariableSistema?: string; // Ej: "cedula", "sede_id", "cargo_id", "empresa_nit"
  
  variableEpidemiologica?: boolean;
  factorEpidemiologico?: string; // Ej: "fuma", "sedentarismo", "hipertension", "estres", "tamizaje_ergonomico"
  
  variableIA?: boolean;
  promptContextoIA?: string; // Instruccion o metadata para analisis por IA
  
  // Reglas de dependencia dinámica
  reglasDependencia: ReglaDependencia[];
}

export interface SeccionEncuesta {
  id: string;
  encuestaId: string;
  titulo: string;
  descripcion?: string;
  orden: number;
  icono?: string;
  preguntas: PreguntaConfig[];
}

export type EstadoEncuesta = 'borrador' | 'publicada' | 'desactivada' | 'archivada';

export interface VersionEncuestaRecord {
  id: string; // ID único de la versión p.ej. ver-enc1-v1
  encuestaId: string; // ID de la encuesta principal
  version: number; // Número de versión entero p.ej. 1, 2, 3
  versionLabel: string; // p.ej. "v1.0"
  titulo: string;
  descripcion: string;
  categoria: string;
  estado: EstadoEncuesta;
  fechaCreacion: string;
  fechaPublicacion?: string;
  autor: string;
  notasVersion?: string; // Changelog u observaciones del cambio
  checksum: string; // Hash SHA/MD5 sintético de integridad del snapshot
  secciones: SeccionEncuesta[]; // Snapshot inmutable de las preguntas y secciones
  totalPreguntas: number;
}

export interface AuditoriaVersionEncuesta {
  id: string;
  encuestaId: string;
  version: number;
  accion: 
    | 'CREACION_BORRADOR' 
    | 'PUBLICACION' 
    | 'DUPLICADO_VERSION' 
    | 'RESTAURACION' 
    | 'ARCHIVADO' 
    | 'EDICION_ESTRUCTURA';
  usuario: string;
  fecha: string;
  detalles: string;
  snapshotChecksum?: string;
}

export interface EncuestaMeta {
  id: string;
  empresaId: string;
  titulo: string;
  codigo: string;
  descripcion: string;
  categoria: string; // Ej: "Sociodemográfica", "Clima", "Riesgo Psicosocial", "Tamizaje SG-SST", "Custom"
  estado: EstadoEncuesta;
  version: number;
  fechaPublicacion?: string;
  notasVersion?: string;
  checksum?: string;
  autor: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  tiempoEstimadoMinutos: number;
  permitirAnonimo: boolean;
  secciones: SeccionEncuesta[];
  tags: string[];
  historialVersiones?: VersionEncuestaRecord[];
  auditoriaLog?: AuditoriaVersionEncuesta[];
}

export type ResponseStatus = 
  | 'ANSWERED'
  | 'NO'
  | 'PREFER_NOT_TO_ANSWER'
  | 'NOT_APPLICABLE'
  | 'OTHER'
  | 'MISSING'
  | 'NOT_ASKED';

export type DataQualityClassification =
  | 'COMPLETO'
  | 'PARCIAL'
  | 'INCOMPLETO'
  | 'NO APLICA'
  | 'PREFIERE NO RESPONDER';

export type AnswerSource = 'SURVEY' | 'EXCEL' | 'MANUAL' | 'CALCULATED';

export interface StandardResponseItem {
  questionId: string;
  value: any;
  otherValue?: string;
  responseStatus: ResponseStatus;
  source: AnswerSource;
  updatedAt: string;
  preguntaTitulo?: string;
  tipo?: TipoPregunta;
  categoria?: string;
  factorEpidemiologico?: string;
}

export interface RespuestaEncuestaItem {
  preguntaId: string;
  preguntaTitulo: string;
  tipo: TipoPregunta;
  valor: any; // Texto, array, numero, dataUrl (firma/imagen), objeto GPS {lat, lng, address}
  otherValue?: string;
  responseStatus?: ResponseStatus;
  source?: AnswerSource;
  updatedAt?: string;
  categoria?: string;
  factorEpidemiologico?: string;
}

export interface RespuestaEncuestaRegistro {
  id: string;
  encuestaId: string;
  versionEncuesta: number; // Versión exacta con la cual fue contestada
  versionLabel?: string; // Label descriptivo v1.0, v2.0
  empresaId: string;
  fechaRespuesta: string;
  usuarioIdentificacion?: string;
  usuarioNombre?: string;
  tiempoCompletadoSegundos: number;
  respuestas: Record<string, RespuestaEncuestaItem>; // Key: preguntaId
}

export interface TipoPreguntaMetadata {
  tipo: TipoPregunta;
  nombre: string;
  descripcion: string;
  grupo: 'texto' | 'seleccion' | 'escalas' | 'multimedia' | 'especiales';
  iconoName: string;
}

export const LISTA_TIPOS_PREGUNTA: TipoPreguntaMetadata[] = [
  { tipo: 'texto', nombre: 'Texto Corto', descripcion: 'Entrada de texto simple de una línea', grupo: 'texto', iconoName: 'Type' },
  { tipo: 'texto_largo', nombre: 'Texto Largo / Párrafo', descripcion: 'Área de texto de múltiples líneas para observaciones', grupo: 'texto', iconoName: 'AlignLeft' },
  { tipo: 'numero', nombre: 'Número', descripcion: 'Campo numérico entero o decimal con rangos opcionales', grupo: 'texto', iconoName: 'Hash' },
  { tipo: 'fecha', nombre: 'Fecha', descripcion: 'Selección de fecha con selector de calendario', grupo: 'especiales', iconoName: 'Calendar' },
  { tipo: 'hora', nombre: 'Hora', descripcion: 'Campo para registro de hora', grupo: 'especiales', iconoName: 'Clock' },
  { tipo: 'correo', nombre: 'Correo Electrónico', descripcion: 'Dirección de e-mail validada automáticamente', grupo: 'texto', iconoName: 'Mail' },
  { tipo: 'telefono', nombre: 'Teléfono', descripcion: 'Número telefónico o celular', grupo: 'texto', iconoName: 'Phone' },
  
  { tipo: 'sino', nombre: 'Sí / No', descripcion: 'Selección binaria rápida Sí o No', grupo: 'seleccion', iconoName: 'ToggleRight' },
  { tipo: 'radio', nombre: 'Opción Única (Radio)', descripcion: 'Selecciona una sola opción entre varias visibles', grupo: 'seleccion', iconoName: 'CircleDot' },
  { tipo: 'lista', nombre: 'Lista Desplegable (Select)', descripcion: 'Menú desplegable para seleccionar una opción', grupo: 'seleccion', iconoName: 'ListFilter' },
  { tipo: 'checkbox', nombre: 'Casilla Única / Términos', descripcion: 'Casilla de verificación de confirmación', grupo: 'seleccion', iconoName: 'CheckSquare' },
  { tipo: 'multiple_seleccion', nombre: 'Múltiple Selección', descripcion: 'Permite marcar una o más opciones simultáneamente', grupo: 'seleccion', iconoName: 'CheckCheck' },
  
  { tipo: 'escala_likert', nombre: 'Escala Likert (1-5 / 1-7)', descripcion: 'Escala de satisfacción o acuerdo tradicional', grupo: 'escalas', iconoName: 'Sliders' },
  { tipo: 'escala_numerica', nombre: 'Escala Numérica (0-10)', descripcion: 'Rango numérico para evaluar niveles de intensidad o riesgo', grupo: 'escalas', iconoName: 'TrendingUp' },
  { tipo: 'nps', nombre: 'Net Promoter Score (NPS 0-10)', descripcion: 'Escala estandarizada NPS (Detractores, Pasivos, Promotores)', grupo: 'escalas', iconoName: 'Award' },
  
  { tipo: 'archivo', nombre: 'Carga de Archivo', descripcion: 'Permite adjuntar documentos (PDF, Word, Excel, ZIP)', grupo: 'multimedia', iconoName: 'Upload' },
  { tipo: 'imagen', nombre: 'Captura de Imagen', descripcion: 'Adjuntar o tomar foto desde la cámara/galería', grupo: 'multimedia', iconoName: 'Image' },
  { tipo: 'firma', nombre: 'Firma Digital', descripcion: 'Lienzo interactivo de firma táctil o con mouse', grupo: 'multimedia', iconoName: 'PenTool' },
  { tipo: 'ubicacion_gps', nombre: 'Ubicación GPS', descripcion: 'Captura automatizada de coordenadas de geolocalización', grupo: 'especiales', iconoName: 'MapPin' },
];
