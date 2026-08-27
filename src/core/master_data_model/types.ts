/**
 * MASTER DATA MODEL (MODELO DE DATOS MAESTRO)
 * Plataforma Enterprise Multi-Empresa, Multi-Encuesta, Multi-Usuario
 * 
 * Normalizado a Tercera Forma Normal (3NF).
 * Incluye auditoría obligatoria y soporte para Soft Delete en todas las entidades.
 */

// Contract audit fields required across all entities
export interface BaseAuditEntity {
  id: string;
  companyId: string | null; // Nullable only for global platform entities (e.g. system permissions)
  createdAt: string;       // ISO 8601 Timestamp
  updatedAt: string;       // ISO 8601 Timestamp
  createdBy: string;       // User ID or System Principal
  updatedBy: string;       // User ID or System Principal
  isActive: boolean;       // Status flag
  deletedAt: string | null; // Soft delete timestamp (null if active)
}

// 1. EMPRESAS
export interface EmpresaMaster extends BaseAuditEntity {
  nit: string;
  razonSocial: string;
  nombreComercial: string;
  direccion: string;
  telefono: string;
  emailCorporativo: string;
  sectorEconomico: string;
  arl: string;
  nivelRiesgoSgSst: string;
  logoUrl?: string;
  sitioWeb?: string;
}

// 2. USUARIOS
export interface UsuarioMaster extends BaseAuditEntity {
  email: string;
  nombres: string;
  apellidos: string;
  documentoIdentidad: string;
  tipoDocumento: 'CC' | 'CE' | 'PASAPORTE' | 'PEP';
  telefono?: string;
  rolId: string; // Foreign Key -> ROLES
  ultimoAccesoAt?: string;
  avatarUrl?: string;
}

// 3. ROLES
export interface RolMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string;
  descripcion: string;
  esSistema: boolean; // Flag to protect system default roles
}

// 4. PERMISOS
export interface PermisoMaster extends BaseAuditEntity {
  codigo: string;
  modulo: string;
  accion: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'EXPORT' | 'ADMIN';
  descripcion: string;
}

// Relación Rol-Permiso (3NF Join Entity)
export interface RolPermisoMaster extends BaseAuditEntity {
  rolId: string;     // Foreign Key -> ROLES
  permisoId: string; // Foreign Key -> PERMISOS
}

// 5. SEDES
export interface SedeMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string;
  direccion: string;
  departamento: string;
  ciudad: string;
  responsableNombre?: string;
  responsableTelefono?: string;
}

// 6. ÁREAS
export interface AreaMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string;
  sedeId: string; // Foreign Key -> SEDES
  responsableNombre?: string;
  areaPadreId?: string; // Hierarchical Self Reference for nested area trees
}

// 7. PROCESOS
export interface ProcesoMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string;
  areaId: string; // Foreign Key -> ÁREAS
  tipoProceso: 'Estratégico' | 'Misional' | 'Apoyo' | 'Evaluación';
  liderProceso?: string;
}

// 8. SUBPROCESOS
export interface SubprocesoMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string;
  procesoId: string; // Foreign Key -> PROCESOS
  descripcion?: string;
}

// 9. PROYECTOS
export interface ProyectoMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string;
  subprocesoId?: string; // Foreign Key -> SUBPROCESOS
  areaId?: string;       // Foreign Key -> ÁREAS
  fechaInicio: string;
  fechaFinEstimada?: string;
  estado: 'Planificación' | 'En Ejecución' | 'Suspendido' | 'Finalizado';
}

// 10. CAMPAÑAS
export interface CampañaMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string;
  objetivo: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'Borrador' | 'Activa' | 'Cerrada' | 'Archivada';
  metaRespuestas?: number;
}

// 11. CARGOS
export interface CargoMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string;
  nivelJerarquico: 'Directivo' | 'Gerencial' | 'Jefatura' | 'Profesional' | 'Técnico' | 'Operativo';
  descripcion?: string;
  salarioBaseRef?: number;
}

// 12. CENTROS DE TRABAJO
export interface CentroTrabajoMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string;
  sedeId: string; // Foreign Key -> SEDES
  claseRiesgoArl: 'I' | 'II' | 'III' | 'IV' | 'V';
  actividadEconomicaEspecifica?: string;
}

// 13. TIPOS DE CONTRATO
export interface TipoContratoMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string; // Fijo, Indefinido, Aprendizaje, Prestación de Servicios, Obra o Labor
  descripcion?: string;
}

// 14. MODALIDADES
export interface ModalidadTrabajoMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string; // Presencial, Teletrabajo, Trabajo en Casa, Remoto, Híbrido
  descripcion?: string;
}

// 15. JORNADAS
export interface JornadaTrabajoMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string; // Diurna, Nocturna, Mixta, Por Turnos
  horasSemanales: number;
}

// 16. TURNOS
export interface TurnoTrabajoMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string;
  horaInicio: string; // HH:mm
  horaFin: string;    // HH:mm
  esNocturno: boolean;
  jornadaId: string;  // Foreign Key -> JORNADAS
}

// 17. ENCUESTAS
export interface EncuestaMaster extends BaseAuditEntity {
  codigo: string;
  titulo: string;
  descripcion: string;
  tipoEncuesta: 'Sociodemográfica' | 'Clima Organizacional' | 'Riesgo Psicosocial' | 'Personalizada';
  version: string;
  estado: 'Borrador' | 'Publicada' | 'Cerrada' | 'Archivada';
  autorId: string;     // Foreign Key -> USUARIOS
  campañaId?: string;  // Foreign Key -> CAMPAÑAS
}

// 18. SECCIONES
export interface SeccionMaster extends BaseAuditEntity {
  encuestaId: string; // Foreign Key -> ENCUESTAS
  orden: number;
  titulo: string;
  descripcion?: string;
}

// 19. PREGUNTAS
export interface PreguntaMaster extends BaseAuditEntity {
  seccionId: string; // Foreign Key -> SECCIONES
  orden: number;
  titulo: string;
  descripcion?: string;
  tipo: 
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
  obligatoria: boolean;
  categoria?: string;
  factorEpidemiologico?: string;
  expresionValidacion?: string;
  mensajeValidacionError?: string;
  valorMinimo?: number;
  valorMaximo?: number;
}

// 20. OPCIONES DE RESPUESTA
export interface OpcionRespuestaMaster extends BaseAuditEntity {
  preguntaId: string; // Foreign Key -> PREGUNTAS
  orden: number;
  valor: string;
  etiqueta: string;
  pesoScore?: number;
}

// 21. RESPUESTAS
export interface RespuestaMaster extends BaseAuditEntity {
  encuestaId: string;      // Foreign Key -> ENCUESTAS
  colaboradorId?: string;  // Foreign Key -> COLABORADORES (null if anonymous)
  usuarioId?: string;      // Foreign Key -> USUARIOS (null if external response)
  seccionId: string;       // Foreign Key -> SECCIONES
  preguntaId: string;      // Foreign Key -> PREGUNTAS
  opcionId?: string;       // Foreign Key -> OPCIONES DE RESPUESTA
  valorIngresado?: string; // Captured text, number, date, JSON string, or GPS object
  fechaRespuesta: string;
  duracionSegundos?: number;
}

// 22. COLABORADORES
export interface ColaboradorMaster extends BaseAuditEntity {
  numeroIdentificacion: string;
  tipoIdentificacion: 'CC' | 'CE' | 'PASAPORTE' | 'PEP';
  nombres: string;
  apellidos: string;
  genero: 'Masculino' | 'Femenino' | 'No Binario' | 'Prefiero No Decir';
  fechaNacimiento: string;
  correoPersonal?: string;
  correoCorporativo?: string;
  celular?: string;
  fechaIngreso: string;
  
  // Normalized Structural Foreign Keys
  sedeId: string;            // Foreign Key -> SEDES
  areaId: string;            // Foreign Key -> ÁREAS
  procesoId?: string;        // Foreign Key -> PROCESOS
  subprocesoId?: string;     // Foreign Key -> SUBPROCESOS
  proyectoId?: string;       // Foreign Key -> PROYECTOS
  cargoId: string;           // Foreign Key -> CARGOS
  centroTrabajoId: string;   // Foreign Key -> CENTROS DE TRABAJO
  tipoContratoId: string;    // Foreign Key -> TIPOS DE CONTRATO
  modalidadId: string;       // Foreign Key -> MODALIDADES
  jornadaId: string;         // Foreign Key -> JORNADAS
  turnoId?: string;          // Foreign Key -> TURNOS
  usuarioId?: string;        // Foreign Key -> USUARIOS (if has platform login)
}

// 23. IMPORTACIONES EXCEL
export interface ImportacionExcelMaster extends BaseAuditEntity {
  nombreArchivo: string;
  checksum: string;
  registrosTotales: number;
  registrosExitosos: number;
  registrosFallidos: number;
  estado: 'Pendiente' | 'Procesando' | 'Completado' | 'Error';
  usuarioId: string;        // Foreign Key -> USUARIOS
  detallesErroresJson?: string;
}

// 24. REPORTES
export interface ReporteMaster extends BaseAuditEntity {
  codigo: string;
  titulo: string;
  tipoReporte: 'SOCIODEMOGRAFICO' | 'CLIMA' | 'PSICOSOCIAL' | 'AUDITORIA' | 'PERSONALIZADO';
  formatoExportacion: 'PDF' | 'EXCEL' | 'POWER_BI' | 'JSON';
  configuracionFiltrosJson: string;
  fechaGeneracion: string;
  usuarioId: string;        // Foreign Key -> USUARIOS
}

// 25. DASHBOARDS
export interface DashboardMaster extends BaseAuditEntity {
  codigo: string;
  titulo: string;
  descripcion: string;
  layoutWidgetsJson: string;
  esPredeterminado: boolean;
}

// 26. INDICADORES
export interface IndicadorMaster extends BaseAuditEntity {
  codigo: string;
  nombre: string;
  categoria: 'Salud Ocupacional' | 'Clima Laboral' | 'Ausentismo' | 'Participación Encuestas' | 'Riesgo Psicosocial';
  formulaMatematica: string;
  metaEstablecida: number;
  unidadMedida: 'PORCENTAJE' | 'NUMERO' | 'DIAS' | 'PUNTOS';
  valorActual: number;
  tendencia: 'ALTA' | 'ESTABLE' | 'BAJA';
  fechaCalculo: string;
}

// 27. ALERTAS
export interface AlertaMaster extends BaseAuditEntity {
  codigo: string;
  titulo: string;
  mensaje: string;
  nivelRiesgo: 'CRITICO' | 'ALTO' | 'MEDIO' | 'BAJO';
  moduloOrigen: string;
  leida: boolean;
  fechaGeneracion: string;
}

// 28. RECOMENDACIONES IA
export interface RecomendacionIAMaster extends BaseAuditEntity {
  codigo: string;
  categoria: string;
  titulo: string;
  descripcionDetallada: string;
  nivelImpacto: 'ALTO' | 'MEDIO' | 'BAJO';
  prioridad: 'ALTA' | 'MEDIA' | 'BAJA';
  estadoAccion: 'PLANIFICADA' | 'EN_PROGRESO' | 'COMPLETADA' | 'RECHAZADA';
  responsableId?: string;    // Foreign Key -> USUARIOS
  fechaGeneracion: string;
}
