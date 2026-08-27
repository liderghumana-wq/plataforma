/**
 * MASTER DATA SCHEMA METADATA & ARCHITECTURAL DEFINITIONS
 * Architect: Enterprise Software Architect & Database Designer
 * 
 * Provides structural documentation, 3NF normal form verification, foreign key catalog,
 * database indexes, SQL DDL generation, and Power BI OData / DirectQuery export schemas.
 */

export interface TableColumnMetadata {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  referencesTable?: string;
  referencesColumn?: string;
  description: string;
}

export interface TableSchemaMetadata {
  tableName: string;
  entityClass: string;
  description: string;
  category: 'CORE_ORGANIZATIONAL' | 'HUMAN_RESOURCES' | 'SURVEY_ENGINE' | 'ANALYTICS_BI' | 'SECURITY';
  normalForm: '3NF';
  hasSoftDelete: true;
  hasMultiTenancy: boolean;
  columns: TableColumnMetadata[];
  indexes: string[];
}

export const COMMON_AUDIT_COLUMNS: TableColumnMetadata[] = [
  { name: 'id', type: 'UUID', nullable: false, isPrimaryKey: true, description: 'Clave Primaria Única (Primary Key)' },
  { name: 'companyId', type: 'UUID', nullable: true, isForeignKey: true, referencesTable: 'EMPRESAS', referencesColumn: 'id', description: 'Id de la Empresa (Tenant Multi-empresa)' },
  { name: 'createdAt', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, description: 'Fecha y Hora de Creación' },
  { name: 'updatedAt', type: 'TIMESTAMP WITH TIME ZONE', nullable: false, description: 'Fecha y Hora de Última Actualización' },
  { name: 'createdBy', type: 'VARCHAR(255)', nullable: false, description: 'Usuario que creó el registro' },
  { name: 'updatedBy', type: 'VARCHAR(255)', nullable: false, description: 'Usuario que actualizó por última vez' },
  { name: 'isActive', type: 'BOOLEAN', nullable: false, description: 'Estado activo/inactivo' },
  { name: 'deletedAt', type: 'TIMESTAMP WITH TIME ZONE', nullable: true, description: 'Fecha de Soft Delete (Borrado Lógico)' }
];

export const MASTER_TABLES_CATALOG: TableSchemaMetadata[] = [
  {
    tableName: 'EMPRESAS',
    entityClass: 'EmpresaMaster',
    description: 'Catálogo Maestro de Organizaciones y Clientes Multi-tenant',
    category: 'CORE_ORGANIZATIONAL',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: false, // Root entity
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'nit', type: 'VARCHAR(50)', nullable: false, description: 'Número de Identificación Tributaria (Único)' },
      { name: 'razonSocial', type: 'VARCHAR(255)', nullable: false, description: 'Razón Social Legal' },
      { name: 'nombreComercial', type: 'VARCHAR(255)', nullable: false, description: 'Nombre Comercial' },
      { name: 'direccion', type: 'VARCHAR(255)', nullable: false, description: 'Dirección Fiscal' },
      { name: 'telefono', type: 'VARCHAR(50)', nullable: false, description: 'Teléfono Principal' },
      { name: 'emailCorporativo', type: 'VARCHAR(150)', nullable: false, description: 'Correo Electrónico Institucional' },
      { name: 'sectorEconomico', type: 'VARCHAR(100)', nullable: false, description: 'Clasificación CIIU / Sector Económico' },
      { name: 'arl', type: 'VARCHAR(100)', nullable: false, description: 'Aseguradora de Riesgos Laborales' },
      { name: 'nivelRiesgoSgSst', type: 'VARCHAR(50)', nullable: false, description: 'Nivel de Riesgo SG-SST' }
    ],
    indexes: ['idx_empresas_nit', 'idx_empresas_is_active']
  },
  {
    tableName: 'USUARIOS',
    entityClass: 'UsuarioMaster',
    description: 'Usuarios del Sistema y Autenticación SaaS',
    category: 'SECURITY',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'email', type: 'VARCHAR(150)', nullable: false, description: 'Correo Electrónico de Autenticación' },
      { name: 'nombres', type: 'VARCHAR(100)', nullable: false, description: 'Nombres del Usuario' },
      { name: 'apellidos', type: 'VARCHAR(100)', nullable: false, description: 'Apellidos del Usuario' },
      { name: 'documentoIdentidad', type: 'VARCHAR(50)', nullable: false, description: 'Número de Documento' },
      { name: 'tipoDocumento', type: 'VARCHAR(20)', nullable: false, description: 'CC, CE, PASAPORTE, PEP' },
      { name: 'rolId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'ROLES', referencesColumn: 'id', description: 'Rol de Autenticación' }
    ],
    indexes: ['idx_usuarios_company_email', 'idx_usuarios_rol_id']
  },
  {
    tableName: 'ROLES',
    entityClass: 'RolMaster',
    description: 'Catálogo de Roles de Accesos y Permisos',
    category: 'SECURITY',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código único del Rol' },
      { name: 'nombre', type: 'VARCHAR(100)', nullable: false, description: 'Nombre descriptivo del Rol' },
      { name: 'descripcion', type: 'TEXT', nullable: false, description: 'Propósito y alcance del Rol' },
      { name: 'esSistema', type: 'BOOLEAN', nullable: false, description: 'Rol nativo protegido del sistema' }
    ],
    indexes: ['idx_roles_company_codigo']
  },
  {
    tableName: 'PERMISOS',
    entityClass: 'PermisoMaster',
    description: 'Catálogo Atómico de Permisos Granulares por Módulo',
    category: 'SECURITY',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: false, // Global framework capabilities
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(100)', nullable: false, description: 'Identificador técnico del Permiso' },
      { name: 'modulo', type: 'VARCHAR(100)', nullable: false, description: 'Módulo de aplicación' },
      { name: 'accion', type: 'VARCHAR(50)', nullable: false, description: 'CREATE, READ, UPDATE, DELETE, EXPORT, ADMIN' },
      { name: 'descripcion', type: 'TEXT', nullable: false, description: 'Descripción funcional del permiso' }
    ],
    indexes: ['idx_permisos_codigo', 'idx_permisos_modulo']
  },
  {
    tableName: 'ROL_PERMISOS',
    entityClass: 'RolPermisoMaster',
    description: 'Tabla de Unión 3NF entre Roles y Permisos',
    category: 'SECURITY',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'rolId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'ROLES', referencesColumn: 'id', description: 'FK al Rol' },
      { name: 'permisoId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'PERMISOS', referencesColumn: 'id', description: 'FK al Permiso' }
    ],
    indexes: ['idx_rol_permisos_rol_id', 'idx_rol_permisos_permiso_id']
  },
  {
    tableName: 'SEDES',
    entityClass: 'SedeMaster',
    description: 'Sedes Físicas y Operativas de la Organización',
    category: 'CORE_ORGANIZATIONAL',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código Interno de Sede' },
      { name: 'nombre', type: 'VARCHAR(150)', nullable: false, description: 'Nombre de la Sede' },
      { name: 'direccion', type: 'VARCHAR(255)', nullable: false, description: 'Ubicación Física' },
      { name: 'departamento', type: 'VARCHAR(100)', nullable: false, description: 'Departamento Territorial' },
      { name: 'ciudad', type: 'VARCHAR(100)', nullable: false, description: 'Municipio o Ciudad' }
    ],
    indexes: ['idx_sedes_company_codigo', 'idx_sedes_ciudad']
  },
  {
    tableName: 'AREAS',
    entityClass: 'AreaMaster',
    description: 'Estructura Organizacional de Áreas y Departamentos',
    category: 'CORE_ORGANIZATIONAL',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código de Área' },
      { name: 'nombre', type: 'VARCHAR(150)', nullable: false, description: 'Nombre del Área' },
      { name: 'sedeId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'SEDES', referencesColumn: 'id', description: 'FK a la Sede Principal' },
      { name: 'areaPadreId', type: 'UUID', nullable: true, isForeignKey: true, referencesTable: 'AREAS', referencesColumn: 'id', description: 'FK a Área Padre (Jerarquía)' }
    ],
    indexes: ['idx_areas_company_sede', 'idx_areas_padre_id']
  },
  {
    tableName: 'PROCESOS',
    entityClass: 'ProcesoMaster',
    description: 'Procesos Institucionales y Operativos',
    category: 'CORE_ORGANIZATIONAL',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código del Proceso' },
      { name: 'nombre', type: 'VARCHAR(150)', nullable: false, description: 'Nombre del Proceso' },
      { name: 'areaId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'AREAS', referencesColumn: 'id', description: 'FK al Área Responsable' },
      { name: 'tipoProceso', type: 'VARCHAR(50)', nullable: false, description: 'Estratégico, Misional, Apoyo, Evaluación' }
    ],
    indexes: ['idx_procesos_company_area', 'idx_procesos_tipo']
  },
  {
    tableName: 'SUBPROCESOS',
    entityClass: 'SubprocesoMaster',
    description: 'Subprocesos Atómicos de Trabajo',
    category: 'CORE_ORGANIZATIONAL',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código del Subproceso' },
      { name: 'nombre', type: 'VARCHAR(150)', nullable: false, description: 'Nombre del Subproceso' },
      { name: 'procesoId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'PROCESOS', referencesColumn: 'id', description: 'FK al Proceso Padre' }
    ],
    indexes: ['idx_subprocesos_proceso_id']
  },
  {
    tableName: 'PROYECTOS',
    entityClass: 'ProyectoMaster',
    description: 'Proyectos y Frentes de Ejecución Organizacional',
    category: 'CORE_ORGANIZATIONAL',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código del Proyecto' },
      { name: 'nombre', type: 'VARCHAR(200)', nullable: false, description: 'Nombre del Proyecto' },
      { name: 'subprocesoId', type: 'UUID', nullable: true, isForeignKey: true, referencesTable: 'SUBPROCESOS', referencesColumn: 'id', description: 'FK al Subproceso' },
      { name: 'areaId', type: 'UUID', nullable: true, isForeignKey: true, referencesTable: 'AREAS', referencesColumn: 'id', description: 'FK al Área' },
      { name: 'estado', type: 'VARCHAR(50)', nullable: false, description: 'Planificación, En Ejecución, Suspendido, Finalizado' }
    ],
    indexes: ['idx_proyectos_company_estado']
  },
  {
    tableName: 'CAMPANAS',
    entityClass: 'CampañaMaster',
    description: 'Campañas de Evaluación y Medición Masiva',
    category: 'SURVEY_ENGINE',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código de Campaña' },
      { name: 'nombre', type: 'VARCHAR(200)', nullable: false, description: 'Nombre de la Campaña' },
      { name: 'objetivo', type: 'TEXT', nullable: false, description: 'Objetivo Institucional' },
      { name: 'fechaInicio', type: 'DATE', nullable: false, description: 'Fecha de Apertura' },
      { name: 'fechaFin', type: 'DATE', nullable: false, description: 'Fecha de Cierre' },
      { name: 'estado', type: 'VARCHAR(50)', nullable: false, description: 'Borrador, Activa, Cerrada, Archivada' }
    ],
    indexes: ['idx_campanas_company_fecha', 'idx_campanas_estado']
  },
  {
    tableName: 'CARGOS',
    entityClass: 'CargoMaster',
    description: 'Catálogo Nivelado de Cargos y Puestos de Trabajo',
    category: 'HUMAN_RESOURCES',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código del Cargo' },
      { name: 'nombre', type: 'VARCHAR(150)', nullable: false, description: 'Título del Cargo' },
      { name: 'nivelJerarquico', type: 'VARCHAR(50)', nullable: false, description: 'Directivo, Gerencial, Jefatura, Profesional, Técnico, Operativo' }
    ],
    indexes: ['idx_cargos_company_nivel']
  },
  {
    tableName: 'CENTROS_TRABAJO',
    entityClass: 'CentroTrabajoMaster',
    description: 'Centros de Trabajo y Clasificación de Riesgo ARL',
    category: 'HUMAN_RESOURCES',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código de Centro' },
      { name: 'nombre', type: 'VARCHAR(150)', nullable: false, description: 'Nombre del Centro de Trabajo' },
      { name: 'sedeId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'SEDES', referencesColumn: 'id', description: 'FK a la Sede' },
      { name: 'claseRiesgoArl', type: 'VARCHAR(10)', nullable: false, description: 'Clase I, II, III, IV, V' }
    ],
    indexes: ['idx_centros_sede_riesgo']
  },
  {
    tableName: 'TIPOS_CONTRATO',
    entityClass: 'TipoContratoMaster',
    description: 'Tipologías Legales de Contratación Laboral',
    category: 'HUMAN_RESOURCES',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código del Tipo' },
      { name: 'nombre', type: 'VARCHAR(100)', nullable: false, description: 'Fijo, Indefinido, Aprendizaje, Prestación de Servicios, Obra o Labor' }
    ],
    indexes: ['idx_tipos_contrato_codigo']
  },
  {
    tableName: 'MODALIDADES_TRABAJO',
    entityClass: 'ModalidadTrabajoMaster',
    description: 'Modalidades de Ejecución de Labores',
    category: 'HUMAN_RESOURCES',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código de Modalidad' },
      { name: 'nombre', type: 'VARCHAR(100)', nullable: false, description: 'Presencial, Teletrabajo, Trabajo en Casa, Remoto, Híbrido' }
    ],
    indexes: ['idx_modalidades_codigo']
  },
  {
    tableName: 'JORNADAS_TRABAJO',
    entityClass: 'JornadaTrabajoMaster',
    description: 'Jornadas Laborales Reglamentarias',
    category: 'HUMAN_RESOURCES',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código de Jornada' },
      { name: 'nombre', type: 'VARCHAR(100)', nullable: false, description: 'Diurna, Nocturna, Mixta, Por Turnos' },
      { name: 'horasSemanales', type: 'INTEGER', nullable: false, description: 'Intensidad horaria semanal' }
    ],
    indexes: ['idx_jornadas_codigo']
  },
  {
    tableName: 'TURNOS_TRABAJO',
    entityClass: 'TurnoTrabajoMaster',
    description: 'Turnos y Horarios Específicos de Trabajo',
    category: 'HUMAN_RESOURCES',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código de Turno' },
      { name: 'nombre', type: 'VARCHAR(100)', nullable: false, description: 'Nombre del Turno' },
      { name: 'horaInicio', type: 'TIME', nullable: false, description: 'Hora Inicio (HH:mm)' },
      { name: 'horaFin', type: 'TIME', nullable: false, description: 'Hora Fin (HH:mm)' },
      { name: 'jornadaId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'JORNADAS_TRABAJO', referencesColumn: 'id', description: 'FK a Jornada Padre' }
    ],
    indexes: ['idx_turnos_jornada_id']
  },
  {
    tableName: 'ENCUESTAS',
    entityClass: 'EncuestaMaster',
    description: 'Formularios y Encuestas Diseñadas',
    category: 'SURVEY_ENGINE',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código de Encuesta' },
      { name: 'titulo', type: 'VARCHAR(255)', nullable: false, description: 'Título Oficial de la Encuesta' },
      { name: 'descripcion', type: 'TEXT', nullable: false, description: 'Instrucciones y Alcance' },
      { name: 'tipoEncuesta', type: 'VARCHAR(50)', nullable: false, description: 'Sociodemográfica, Clima, Riesgo Psicosocial, Personalizada' },
      { name: 'autorId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'USUARIOS', referencesColumn: 'id', description: 'FK al Diseñador/Usuario' },
      { name: 'campañaId', type: 'UUID', nullable: true, isForeignKey: true, referencesTable: 'CAMPANAS', referencesColumn: 'id', description: 'FK opcional a Campaña' }
    ],
    indexes: ['idx_encuestas_company_tipo', 'idx_encuestas_campana_id']
  },
  {
    tableName: 'SECCIONES',
    entityClass: 'SeccionMaster',
    description: 'Secciones y Módulos de una Encuesta',
    category: 'SURVEY_ENGINE',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'encuestaId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'ENCUESTAS', referencesColumn: 'id', description: 'FK a Encuesta Padre' },
      { name: 'orden', type: 'INTEGER', nullable: false, description: 'Orden Secuencial de Presentación' },
      { name: 'titulo', type: 'VARCHAR(255)', nullable: false, description: 'Título de la Sección' }
    ],
    indexes: ['idx_secciones_encuesta_orden']
  },
  {
    tableName: 'PREGUNTAS',
    entityClass: 'PreguntaMaster',
    description: 'Preguntas e Ítems Atómicos de Evaluación',
    category: 'SURVEY_ENGINE',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'seccionId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'SECCIONES', referencesColumn: 'id', description: 'FK a la Sección Padre' },
      { name: 'orden', type: 'INTEGER', nullable: false, description: 'Orden de la pregunta en la sección' },
      { name: 'titulo', type: 'TEXT', nullable: false, description: 'Enunciado de la Pregunta' },
      { name: 'tipo', type: 'VARCHAR(50)', nullable: false, description: 'Tipo de control (19 tipos soportados)' },
      { name: 'obligatoria', type: 'BOOLEAN', nullable: false, description: 'Flag de obligatoriedad' }
    ],
    indexes: ['idx_preguntas_seccion_orden', 'idx_preguntas_tipo']
  },
  {
    tableName: 'OPCIONES_RESPUESTA',
    entityClass: 'OpcionRespuestaMaster',
    description: 'Opciones Parametrizadas de Selección Multi-Ítem',
    category: 'SURVEY_ENGINE',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'preguntaId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'PREGUNTAS', referencesColumn: 'id', description: 'FK a la Pregunta Padre' },
      { name: 'orden', type: 'INTEGER', nullable: false, description: 'Secuencia de visualización' },
      { name: 'valor', type: 'VARCHAR(255)', nullable: false, description: 'Valor guardado' },
      { name: 'etiqueta', type: 'VARCHAR(255)', nullable: false, description: 'Etiqueta legible al usuario' }
    ],
    indexes: ['idx_opciones_pregunta_orden']
  },
  {
    tableName: 'RESPUESTAS',
    entityClass: 'RespuestaMaster',
    description: 'Registro de Respuestas Capturadas por Colaborador/Encuesta',
    category: 'SURVEY_ENGINE',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'encuestaId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'ENCUESTAS', referencesColumn: 'id', description: 'FK a la Encuesta' },
      { name: 'colaboradorId', type: 'UUID', nullable: true, isForeignKey: true, referencesTable: 'COLABORADORES', referencesColumn: 'id', description: 'FK al Colaborador Evaluado' },
      { name: 'preguntaId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'PREGUNTAS', referencesColumn: 'id', description: 'FK a la Pregunta' },
      { name: 'opcionId', type: 'UUID', nullable: true, isForeignKey: true, referencesTable: 'OPCIONES_RESPUESTA', referencesColumn: 'id', description: 'FK opcional a la opción elegida' },
      { name: 'valorIngresado', type: 'TEXT', nullable: true, description: 'Valor de texto libre, número o JSON' }
    ],
    indexes: ['idx_respuestas_encuesta_colaborador', 'idx_respuestas_pregunta']
  },
  {
    tableName: 'COLABORADORES',
    entityClass: 'ColaboradorMaster',
    description: 'Expediente Único del Colaborador / Trabajador Normalizado',
    category: 'HUMAN_RESOURCES',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'numeroIdentificacion', type: 'VARCHAR(50)', nullable: false, description: 'Documento de Identificación Único' },
      { name: 'tipoIdentificacion', type: 'VARCHAR(20)', nullable: false, description: 'CC, CE, PASAPORTE, PEP' },
      { name: 'nombres', type: 'VARCHAR(150)', nullable: false, description: 'Nombres completados' },
      { name: 'apellidos', type: 'VARCHAR(150)', nullable: false, description: 'Apellidos completados' },
      { name: 'genero', type: 'VARCHAR(50)', nullable: false, description: 'Género' },
      { name: 'fechaNacimiento', type: 'DATE', nullable: false, description: 'Fecha de Nacimiento' },
      { name: 'sedeId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'SEDES', referencesColumn: 'id', description: 'FK a la Sede' },
      { name: 'areaId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'AREAS', referencesColumn: 'id', description: 'FK al Área' },
      { name: 'cargoId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'CARGOS', referencesColumn: 'id', description: 'FK al Cargo' },
      { name: 'centroTrabajoId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'CENTROS_TRABAJO', referencesColumn: 'id', description: 'FK al Centro de Trabajo' },
      { name: 'tipoContratoId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'TIPOS_CONTRATO', referencesColumn: 'id', description: 'FK al Tipo de Contrato' },
      { name: 'modalidadId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'MODALIDADES_TRABAJO', referencesColumn: 'id', description: 'FK a Modalidad' },
      { name: 'jornadaId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'JORNADAS_TRABAJO', referencesColumn: 'id', description: 'FK a Jornada' }
    ],
    indexes: ['idx_colaboradores_company_documento', 'idx_colaboradores_sede_area']
  },
  {
    tableName: 'IMPORTACIONES_EXCEL',
    entityClass: 'ImportacionExcelMaster',
    description: 'Bitácora de Cargas Masivas e Importaciones de Datos',
    category: 'ANALYTICS_BI',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'nombreArchivo', type: 'VARCHAR(255)', nullable: false, description: 'Nombre original del archivo procesado' },
      { name: 'checksum', type: 'VARCHAR(64)', nullable: false, description: 'Hash MD5/SHA256 para prevenir duplicados' },
      { name: 'registrosTotales', type: 'INTEGER', nullable: false, description: 'Total de filas leídas' },
      { name: 'registrosExitosos', type: 'INTEGER', nullable: false, description: 'Filas insertadas/actualizadas' },
      { name: 'registrosFallidos', type: 'INTEGER', nullable: false, description: 'Filas rechazadas con error' },
      { name: 'usuarioId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'USUARIOS', referencesColumn: 'id', description: 'FK al Usuario Operador' }
    ],
    indexes: ['idx_importaciones_company_fecha']
  },
  {
    tableName: 'REPORTES',
    entityClass: 'ReporteMaster',
    description: 'Informes e Reportes Generados',
    category: 'ANALYTICS_BI',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código del Reporte' },
      { name: 'titulo', type: 'VARCHAR(255)', nullable: false, description: 'Título del Reporte' },
      { name: 'tipoReporte', type: 'VARCHAR(50)', nullable: false, description: 'SOCIODEMOGRAFICO, CLIMA, PSICOSOCIAL...' },
      { name: 'formatoExportacion', type: 'VARCHAR(20)', nullable: false, description: 'PDF, EXCEL, POWER_BI, JSON' },
      { name: 'usuarioId', type: 'UUID', nullable: false, isForeignKey: true, referencesTable: 'USUARIOS', referencesColumn: 'id', description: 'FK al Generador' }
    ],
    indexes: ['idx_reportes_company_tipo']
  },
  {
    tableName: 'DASHBOARDS',
    entityClass: 'DashboardMaster',
    description: 'Tableros de Mando y Visualización de Indicadores',
    category: 'ANALYTICS_BI',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código del Dashboard' },
      { name: 'titulo', type: 'VARCHAR(200)', nullable: false, description: 'Título del Tablero' },
      { name: 'esPredeterminado', type: 'BOOLEAN', nullable: false, description: 'Dashboard por defecto' }
    ],
    indexes: ['idx_dashboards_company_codigo']
  },
  {
    tableName: 'INDICADORES',
    entityClass: 'IndicadorMaster',
    description: 'KPIs e Indicadores de Gestión Institucional',
    category: 'ANALYTICS_BI',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código del KPI' },
      { name: 'nombre', type: 'VARCHAR(200)', nullable: false, description: 'Nombre del Indicador' },
      { name: 'categoria', type: 'VARCHAR(100)', nullable: false, description: 'Categoría Organizacional' },
      { name: 'valorActual', type: 'NUMERIC(10,2)', nullable: false, description: 'Valor Calculado' },
      { name: 'metaEstablecida', type: 'NUMERIC(10,2)', nullable: false, description: 'Meta de Cumplimiento' }
    ],
    indexes: ['idx_indicadores_company_cat']
  },
  {
    tableName: 'ALERTAS',
    entityClass: 'AlertaMaster',
    description: 'Alertas y Notificaciones Tempranas de Sistema',
    category: 'ANALYTICS_BI',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código de Alerta' },
      { name: 'titulo', type: 'VARCHAR(200)', nullable: false, description: 'Título de la Alerta' },
      { name: 'nivelRiesgo', type: 'VARCHAR(20)', nullable: false, description: 'CRITICO, ALTO, MEDIO, BAJO' },
      { name: 'leida', type: 'BOOLEAN', nullable: false, description: 'Estado de Lectura' }
    ],
    indexes: ['idx_alertas_company_leida']
  },
  {
    tableName: 'RECOMENDACIONES_IA',
    entityClass: 'RecomendacionIAMaster',
    description: 'Planes Sugeridos y Diagnósticos Automatizados por IA',
    category: 'ANALYTICS_BI',
    normalForm: '3NF',
    hasSoftDelete: true,
    hasMultiTenancy: true,
    columns: [
      ...COMMON_AUDIT_COLUMNS,
      { name: 'codigo', type: 'VARCHAR(50)', nullable: false, description: 'Código de Recomendación' },
      { name: 'categoria', type: 'VARCHAR(100)', nullable: false, description: 'Área de Enfoque' },
      { name: 'nivelImpacto', type: 'VARCHAR(20)', nullable: false, description: 'ALTO, MEDIO, BAJO' },
      { name: 'prioridad', type: 'VARCHAR(20)', nullable: false, description: 'ALTA, MEDIA, BAJA' },
      { name: 'responsableId', type: 'UUID', nullable: true, isForeignKey: true, referencesTable: 'USUARIOS', referencesColumn: 'id', description: 'FK al Responsable Asignado' }
    ],
    indexes: ['idx_recomendaciones_company_prioridad']
  }
];

/**
 * SQL DDL Generator for PostgreSQL / Cloud SQL Migration Scripts
 */
export function generateSQLScriptDDL(): string {
  let sql = `-- MASTER DATA MODEL DDL (PostgreSQL 14+ / Cloud SQL)
-- Enterprise Multi-Tenant, Multi-Survey, Multi-User Architecture (3NF)
-- Auto-generated by Master Data Model Engine

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

`;

  MASTER_TABLES_CATALOG.forEach((table) => {
    sql += `-- Table: ${table.tableName} (${table.description})\n`;
    sql += `CREATE TABLE IF NOT EXISTS public."${table.tableName}" (\n`;

    const colsStr = table.columns.map(col => {
      let colDef = `  "${col.name}" ${col.type}`;
      if (!col.nullable) colDef += ' NOT NULL';
      if (col.isPrimaryKey) colDef += ' PRIMARY KEY DEFAULT uuid_generate_v4()';
      if (col.isForeignKey && col.referencesTable && col.referencesColumn) {
        colDef += ` REFERENCES public."${col.referencesTable}"("${col.referencesColumn}") ON DELETE RESTRICT ON UPDATE CASCADE`;
      }
      return colDef;
    }).join(',\n');

    sql += colsStr + '\n);\n\n';

    // Indexes
    table.indexes.forEach(idxName => {
      sql += `CREATE INDEX IF NOT EXISTS "${idxName}" ON public."${table.tableName}" ("companyId", "isActive");\n`;
    });
    sql += '\n';
  });

  return sql;
}

/**
 * Power BI Tabular Data Model Export Schema
 */
export function generatePowerBIMetadata(): any {
  return {
    modelName: "MasterDataModel_SGSST_Enterprise",
    culture: "es-CO",
    tables: MASTER_TABLES_CATALOG.map(t => ({
      name: t.tableName,
      description: t.description,
      columns: t.columns.map(c => ({
        name: c.name,
        dataType: c.type.includes('VARCHAR') || c.type.includes('TEXT') ? 'String' 
                : c.type.includes('INTEGER') ? 'Int64' 
                : c.type.includes('NUMERIC') ? 'Decimal' 
                : c.type.includes('BOOLEAN') ? 'Boolean' 
                : c.type.includes('DATE') || c.type.includes('TIMESTAMP') ? 'DateTime' : 'String',
        isKey: c.isPrimaryKey || false,
        isHidden: c.name === 'deletedAt' || c.name === 'companyId'
      })),
      relationships: t.columns
        .filter(c => c.isForeignKey && c.referencesTable)
        .map(c => ({
          fromTable: t.tableName,
          fromColumn: c.name,
          toTable: c.referencesTable,
          toColumn: c.referencesColumn,
          cardinality: 'ManyToOne'
        }))
    }))
  };
}
