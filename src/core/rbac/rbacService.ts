/**
 * RBAC SERVICE & AUTHORIZATION ENGINE
 * Manages Roles, Permissions, Users, Matrix Grants, and System Auditing
 */

import { PermissionDefinition, RoleDefinition, UserAccount, RbacAuditLog } from './types';
import { masterDataModelService } from '../master_data_model/service';

const RBAC_ROLES_KEY = 'rbac_roles_catalog_v2';
const RBAC_PERMISSIONS_KEY = 'rbac_permissions_catalog_v2';
const RBAC_USERS_KEY = 'rbac_users_catalog_v2';
const RBAC_AUDIT_KEY = 'rbac_audit_logs_v2';

// DEFAULT SYSTEM PERMISSIONS (Includes all user requested examples)
export const DEFAULT_PERMISSIONS: PermissionDefinition[] = [
  // Dashboard
  { id: 'perm_dashboard_view', code: 'DASHBOARD_VIEW', name: 'Ver Dashboard', category: 'DASHBOARD', description: 'Visualizar tableros generales de mando y métricas ejecutivas' },
  { id: 'perm_dashboard_kpi', code: 'DASHBOARD_KPI_EDIT', name: 'Editar Metas de KPIs', category: 'DASHBOARD', description: 'Configurar metas y umbrales de alerta en indicadores' },

  // Encuestas
  { id: 'perm_survey_view', code: 'SURVEY_VIEW', name: 'Ver Encuestas', category: 'ENCUESTAS', description: 'Acceder a formularios de recolección de información' },
  { id: 'perm_survey_edit', code: 'SURVEY_EDIT', name: 'Editar Encuestas', category: 'ENCUESTAS', description: 'Modificar preguntas, secciones y parámetros del constructor' },
  { id: 'perm_survey_create', code: 'SURVEY_CREATE', name: 'Crear Encuestas', category: 'ENCUESTAS', description: 'Diseñar y publicar nuevas encuestas sociodemográficas o de clima' },
  { id: 'perm_survey_delete', code: 'SURVEY_DELETE', name: 'Eliminar Encuestas', category: 'ENCUESTAS', description: 'Archivar o eliminar instrumentos de evaluación' },

  // Empresas
  { id: 'perm_company_view', code: 'COMPANY_VIEW', name: 'Ver Empresas y Tenants', category: 'EMPRESAS', description: 'Consultar listado de empresas, información corporativa y sedes' },
  { id: 'perm_company_create', code: 'COMPANY_CREATE', name: 'Crear Empresas', category: 'EMPRESAS', description: 'Dar de alta nuevas empresas y sedes en la plataforma multi-tenant' },
  { id: 'perm_company_edit', code: 'COMPANY_EDIT', name: 'Editar Configuración de Empresa', category: 'EMPRESAS', description: 'Modificar datos corporativos, logos y representantes' },

  // SaaS & Licenciamiento
  { id: 'perm_saas_view', code: 'SAAS_ADMIN_VIEW', name: 'Ver Centro de Administración SaaS', category: 'SAAS_ADMIN', description: 'Consultar dashboard multi-tenant, métricas de capacidad y suscripciones' },
  { id: 'perm_saas_edit', code: 'SAAS_ADMIN_EDIT', name: 'Gestionar Plataforma SaaS', category: 'SAAS_ADMIN', description: 'Administrar planes, cuotas, límites de capacidad y provisionar tenants' },
  { id: 'perm_license_view', code: 'LICENSE_VIEW', name: 'Ver Licenciamiento y Planes', category: 'SAAS_ADMIN', description: 'Consultar estado de licencia, límites de colaboradores y vencimiento' },
  { id: 'perm_license_edit', code: 'LICENSE_EDIT', name: 'Editar Licenciamiento y Planes', category: 'SAAS_ADMIN', description: 'Modificar planes asignados, vigencias y cupos de colaboradores' },
  { id: 'perm_module_view', code: 'MODULE_VIEW', name: 'Ver Catálogo de Módulos', category: 'SAAS_ADMIN', description: 'Consultar módulos habilitados y características del sistema' },
  { id: 'perm_module_edit', code: 'MODULE_EDIT', name: 'Activar / Desactivar Módulos', category: 'SAAS_ADMIN', description: 'Habilitar o restringir módulos específicos por tenant' },

  // Excel
  { id: 'perm_excel_import', code: 'EXCEL_IMPORT', name: 'Importar Excel', category: 'EXCEL', description: 'Cargar masivamente colaboradores y estructuras organizacionales' },
  { id: 'perm_excel_export', code: 'EXCEL_EXPORT', name: 'Exportar a Excel / CSV', category: 'EXCEL', description: 'Descargar datos crudos y consolidados en hojas de cálculo' },

  // Reportes
  { id: 'perm_reports_view', code: 'REPORTS_VIEW', name: 'Ver Reportes', category: 'REPORTES', description: 'Consultar informes ejecutivos, gráficos y diagnósticos' },
  { id: 'perm_reports_create', code: 'REPORTS_CREATE', name: 'Generar Informes Especializados', category: 'REPORTES', description: 'Construir reportes analíticos personalizados' },

  // PDF
  { id: 'perm_pdf_export', code: 'PDF_EXPORT', name: 'Exportar PDF', category: 'PDF', description: 'Descargar informes consolidados y certificados en formato PDF' },

  // Usuarios
  { id: 'perm_user_view', code: 'USER_VIEW', name: 'Ver Usuarios', category: 'USUARIOS', description: 'Consultar directorio de usuarios del tenant' },
  { id: 'perm_user_edit', code: 'USER_EDIT', name: 'Editar Usuarios', category: 'USUARIOS', description: 'Crear, editar, activar y desactivar cuentas de usuarios' },
  { id: 'perm_role_view', code: 'ROLE_VIEW', name: 'Ver Roles y Permisos', category: 'USUARIOS', description: 'Consultar matriz de roles y privilegios asignados' },
  { id: 'perm_role_edit', code: 'ROLE_EDIT', name: 'Editar Roles y Permisos', category: 'USUARIOS', description: 'Modificar matriz de accesos y crear roles personalizados' },
  { id: 'perm_users_admin', code: 'USERS_ADMIN', name: 'Administrar Usuarios', category: 'USUARIOS', description: 'Crear, editar, bloquear usuarios y asignar perfiles de acceso' },
  { id: 'perm_roles_admin', code: 'ROLES_ADMIN', name: 'Administrar Roles y Permisos', category: 'USUARIOS', description: 'Gestionar matriz gráfica de accesos y crear roles personalizados' },

  // IA
  { id: 'perm_ai_admin', code: 'AI_ADMIN', name: 'Administrar IA', category: 'IA', description: 'Configurar parámetros de Gemini, prompts de análisis y recomendaciones' },
  { id: 'perm_ai_use', code: 'AI_USE', name: 'Consultar Asistente IA / Copilot', category: 'IA', description: 'Interactuar con el agente conversacional de SG-SST' },
  { id: 'perm_ai_governance_view', code: 'AI_GOVERNANCE_VIEW', name: 'Ver Gobernanza de IA', category: 'IA', description: 'Consultar principios éticos, inventario de modelos y matriz de riesgos de IA' },
  { id: 'perm_ai_governance_audit', code: 'AI_GOVERNANCE_AUDIT', name: 'Auditar Dictámenes de IA', category: 'IA', description: 'Validar, rechazar o aprobar dictámenes de supervisión humana (Human-in-the-loop)' },
  { id: 'perm_ai_strategy_view', code: 'AI_STRATEGY_VIEW', name: 'Ver Estrategia de IA', category: 'IA', description: 'Consultar pilares estratégicos, matriz de casos de uso, mapa de valor y nivel de madurez' },

  // Viabilidad de Negocio & Finanzas
  { id: 'perm_biz_viability_view', code: 'BUSINESS_VIABILITY_VIEW', name: 'Ver Viabilidad del Negocio', category: 'ESTRATEGIA', description: 'Consultar modelo de negocio, Business Canvas y ventaja competitiva' },
  { id: 'perm_biz_viability_edit', code: 'BUSINESS_VIABILITY_EDIT', name: 'Editar Supuestos de Viabilidad', category: 'ESTRATEGIA', description: 'Modificar supuestos de mercado, segmentos y matrices de viabilidad' },
  { id: 'perm_biz_fin_view', code: 'BUSINESS_FINANCIAL_VIEW', name: 'Ver Simulador Financiero', category: 'ESTRATEGIA', description: 'Consultar proyecciones de ingresos, costos, punto de equilibrio y ROI' },
  { id: 'perm_biz_fin_edit', code: 'BUSINESS_FINANCIAL_EDIT', name: 'Editar Parámetros Financieros', category: 'ESTRATEGIA', description: 'Modificar variables del simulador, tarifas de planes y costos operativos' },

  // Comparativa IA vs Power BI
  { id: 'perm_ai_powerbi_view', code: 'AI_POWERBI_COMPARISON_VIEW', name: 'Ver Análisis IA vs. Power BI', category: 'ESTRATEGIA', description: 'Consultar matrices comparativas, diferenciales, complementariedad y escenarios de uso' },
  { id: 'perm_ai_powerbi_edit', code: 'AI_POWERBI_COMPARISON_EDIT', name: 'Editar Análisis IA vs. Power BI', category: 'ESTRATEGIA', description: 'Modificar ponderaciones de la matriz de decisión y conclusiones académicas' },

  // Catálogos
  { id: 'perm_catalogs_admin', code: 'CATALOGS_ADMIN', name: 'Administrar Catálogos', category: 'CATALOGOS', description: 'Gestionar sedes, áreas, cargos, procesos y centros de trabajo' },

  // Salud Ocupacional & Especialistas
  { id: 'perm_health_view', code: 'HEALTH_VIEW', name: 'Ver Diagnósticos Clínicos y Médicos', category: 'SST_SALUD', description: 'Acceso a historias ocupacionales y diagnósticos del Médico Laboral' },
  { id: 'perm_psico_view', code: 'PSICO_VIEW', name: 'Ver Evaluaciones Psicosociales', category: 'SST_SALUD', description: 'Acceso reservado a baterías y dominios de riesgo por el Psicólogo' },

  // Sistema & Auditoría
  { id: 'perm_audit_view', code: 'AUDIT_VIEW', name: 'Ver Registros de Auditoría', category: 'SISTEMA', description: 'Consultar logs de acceso y modificaciones de seguridad' },
  { id: 'perm_datamodel_view', code: 'DATAMODEL_VIEW', name: 'Ver Modelo de Datos Maestro', category: 'SISTEMA', description: 'Explorar arquitectura 3NF y esquemas para Power BI' },

  // Planes de Acción, Mejora y Eficacia SST (Fase 10)
  { id: 'perm_actions_view', code: 'ACTIONS_VIEW', name: 'Ver Planes de Acción', category: 'PLANES_ACCION', description: 'Consultar matriz, tableros Kanban y reportes de planes de acción SG-SST' },
  { id: 'perm_actions_create', code: 'ACTIONS_CREATE', name: 'Crear Planes de Acción', category: 'PLANES_ACCION', description: 'Registrar nuevos planes de acción preventivos, correctivos o de mejora' },
  { id: 'perm_actions_edit', code: 'ACTIONS_EDIT', name: 'Editar Planes de Acción', category: 'PLANES_ACCION', description: 'Modificar actividades, porcentajes de avance y cargar evidencias' },
  { id: 'perm_actions_approve', code: 'ACTIONS_APPROVE', name: 'Aprobar Planes de Acción', category: 'PLANES_ACCION', description: 'Aprobar propuestas de planes de acción en estado de revisión' },
  { id: 'perm_actions_close', code: 'ACTIONS_CLOSE', name: 'Cerrar Planes de Acción', category: 'PLANES_ACCION', description: 'Finalizar y archivar formalmente planes con dictamen de eficacia' },
  { id: 'perm_actions_effectiveness', code: 'ACTIONS_EFFECTIVENESS', name: 'Dictaminar Eficacia SST', category: 'PLANES_ACCION', description: 'Emitir dictamen técnico de eficacia contrastando indicadores y evidencias (HITL)' },
  { id: 'perm_actions_audit', code: 'ACTIONS_AUDIT', name: 'Auditar Planes y Trazabilidad', category: 'PLANES_ACCION', description: 'Consultar la bitácora inmutable de cambios y evidencias de cada plan' },

  // Gestión Documental y Evidencias (Fase 11)
  { id: 'perm_documents_view', code: 'DOCUMENTS_VIEW', name: 'Ver y Descargar Evidencias', category: 'PLANES_ACCION', description: 'Consultar y descargar archivos de evidencia documental asociados a planes' },
  { id: 'perm_documents_upload', code: 'DOCUMENTS_UPLOAD', name: 'Cargar Evidencias Documentales', category: 'PLANES_ACCION', description: 'Adjuntar nuevos documentos y registros probatorios a los planes de acción' },
  { id: 'perm_documents_delete', code: 'DOCUMENTS_DELETE', name: 'Eliminar Evidencias Documentales', category: 'PLANES_ACCION', description: 'Eliminación lógica y controlada de archivos probatorios (exclusivo directivos SST)' },
  { id: 'perm_documents_audit', code: 'DOCUMENTS_AUDIT', name: 'Auditar Trazabilidad Documental', category: 'PLANES_ACCION', description: 'Consultar historial de descargas, cargas y borrados de evidencias' }
];

// DEFAULT 12 REQUIRED ROLES
export const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'rol_super_admin',
    code: 'SUPER_ADMIN',
    name: 'Super Administrador',
    description: 'Acceso total y sin restricciones a todos los módulos, empresas tenants e infraestructura.',
    category: 'Estratégico',
    isSystem: true,
    color: 'bg-purple-600 text-white border-purple-700',
    updatedAt: new Date().toISOString(),
    permissions: DEFAULT_PERMISSIONS.map(p => p.code) // All permissions
  },
  {
    id: 'rol_admin_empresa',
    code: 'ADMIN_EMPRESA',
    name: 'Administrador de Empresa',
    description: 'Gestión total dentro del tenant corporativo assigned, usuarios, catálogos y reportes.',
    category: 'Estratégico',
    isSystem: true,
    color: 'bg-indigo-600 text-white border-indigo-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW', 'DASHBOARD_KPI_EDIT', 'SURVEY_VIEW', 'SURVEY_EDIT', 'SURVEY_CREATE', 
      'COMPANY_VIEW', 'COMPANY_EDIT', 'USER_VIEW', 'USER_EDIT', 'ROLE_VIEW', 'ROLE_EDIT',
      'MODULE_VIEW', 'MODULE_EDIT', 'LICENSE_VIEW', 'LICENSE_EDIT', 'SAAS_ADMIN_VIEW',
      'EXCEL_IMPORT', 'EXCEL_EXPORT', 'REPORTS_VIEW', 'REPORTS_CREATE', 
      'PDF_EXPORT', 'USERS_ADMIN', 'ROLES_ADMIN', 'AI_ADMIN', 'AI_USE', 'AI_GOVERNANCE_VIEW', 'AI_STRATEGY_VIEW',
      'BUSINESS_VIABILITY_VIEW', 'BUSINESS_VIABILITY_EDIT', 'BUSINESS_FINANCIAL_VIEW', 'BUSINESS_FINANCIAL_EDIT',
      'AI_POWERBI_COMPARISON_VIEW', 'AI_POWERBI_COMPARISON_EDIT',
      'CATALOGS_ADMIN', 'HEALTH_VIEW', 'PSICO_VIEW', 'AUDIT_VIEW', 'DATAMODEL_VIEW',
      'ACTIONS_VIEW', 'ACTIONS_CREATE', 'ACTIONS_EDIT', 'ACTIONS_APPROVE', 'ACTIONS_CLOSE', 'ACTIONS_EFFECTIVENESS', 'ACTIONS_AUDIT',
      'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD', 'DOCUMENTS_DELETE', 'DOCUMENTS_AUDIT'
    ]
  },
  {
    id: 'rol_gestion_humana',
    code: 'GESTION_HUMANA',
    name: 'Gestión Humana / Talento',
    description: 'Gestión de colaboradores, clima laboral, encuestas sociodemográficas y bienestar organizacional.',
    category: 'Estratégico',
    isSystem: true,
    color: 'bg-emerald-600 text-white border-emerald-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW', 'SURVEY_VIEW', 'SURVEY_EDIT', 'SURVEY_CREATE', 'EXCEL_IMPORT', 'EXCEL_EXPORT',
      'REPORTS_VIEW', 'PDF_EXPORT', 'USER_VIEW', 'CATALOGS_ADMIN', 'AI_USE', 'AUDIT_VIEW',
      'ACTIONS_VIEW', 'ACTIONS_CREATE', 'ACTIONS_EDIT',
      'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD'
    ]
  },
  {
    id: 'rol_consultor',
    code: 'CONSULTOR',
    name: 'Consultor Externo SG-SST',
    description: 'Asesor técnico especializado para diseño de planes de acción, auditorías y diagnósticos.',
    category: 'Especialista',
    isSystem: true,
    color: 'bg-amber-600 text-white border-amber-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW', 'SURVEY_VIEW', 'REPORTS_VIEW', 'REPORTS_CREATE', 'PDF_EXPORT', 'EXCEL_EXPORT',
      'AI_USE', 'AI_GOVERNANCE_VIEW', 'AI_STRATEGY_VIEW', 'BUSINESS_VIABILITY_VIEW', 'AUDIT_VIEW',
      'ACTIONS_VIEW', 'ACTIONS_CREATE', 'ACTIONS_EDIT', 'ACTIONS_EFFECTIVENESS', 'ACTIONS_AUDIT',
      'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD', 'DOCUMENTS_AUDIT'
    ]
  },
  {
    id: 'rol_usuario',
    code: 'USUARIO',
    name: 'Usuario Estándar',
    description: 'Acceso básico para consulta de métricas de su área y diligenciamiento de instrumentos.',
    category: 'Operativo',
    isSystem: true,
    color: 'bg-slate-600 text-white border-slate-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW', 'SURVEY_VIEW', 'REPORTS_VIEW', 'ACTIONS_VIEW', 'DOCUMENTS_VIEW'
    ]
  },
  {
    id: 'rol_director_sst',
    code: 'DIRECTOR_SST',
    name: 'Director de SST',
    description: 'Dirección estratégica del sistema de gestión de seguridad y salud en el trabajo.',
    category: 'Estratégico',
    isSystem: true,
    color: 'bg-blue-600 text-white border-blue-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW', 'DASHBOARD_KPI_EDIT', 'SURVEY_VIEW', 'SURVEY_EDIT', 'SURVEY_CREATE',
      'EXCEL_IMPORT', 'EXCEL_EXPORT', 'REPORTS_VIEW', 'REPORTS_CREATE', 'PDF_EXPORT', 
      'USERS_ADMIN', 'AI_USE', 'AI_GOVERNANCE_VIEW', 'AI_STRATEGY_VIEW',
      'BUSINESS_VIABILITY_VIEW', 'BUSINESS_FINANCIAL_VIEW',
      'AI_POWERBI_COMPARISON_VIEW',
      'CATALOGS_ADMIN', 'HEALTH_VIEW', 'PSICO_VIEW',
      'ACTIONS_VIEW', 'ACTIONS_CREATE', 'ACTIONS_EDIT', 'ACTIONS_APPROVE', 'ACTIONS_CLOSE', 'ACTIONS_EFFECTIVENESS', 'ACTIONS_AUDIT',
      'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD', 'DOCUMENTS_DELETE', 'DOCUMENTS_AUDIT'
    ]
  },
  {
    id: 'rol_medico_laboral',
    code: 'MEDICO_LABORAL',
    name: 'Médico Laboral',
    description: 'Especialista responsable de salud ocupacional, exámenes médicos y ausentismo.',
    category: 'Especialista',
    isSystem: true,
    color: 'bg-teal-600 text-white border-teal-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW', 'SURVEY_VIEW', 'EXCEL_EXPORT', 'REPORTS_VIEW', 'PDF_EXPORT', 
      'HEALTH_VIEW', 'AI_USE'
    ]
  },
  {
    id: 'rol_psicologo',
    code: 'PSICOLOGO',
    name: 'Psicólogo',
    description: 'Especialista en evaluación y diagnóstico de Factores de Riesgo Psicosocial.',
    category: 'Especialista',
    isSystem: true,
    color: 'bg-pink-600 text-white border-pink-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW', 'SURVEY_VIEW', 'SURVEY_EDIT', 'EXCEL_EXPORT', 'REPORTS_VIEW', 
      'PDF_EXPORT', 'PSICO_VIEW', 'AI_USE'
    ]
  },
  {
    id: 'rol_analista_sst',
    code: 'ANALISTA_SST',
    name: 'Analista SST',
    description: 'Análisis de datos sociodemográficos, generación de métricas y seguimiento.',
    category: 'Operativo',
    isSystem: true,
    color: 'bg-cyan-600 text-white border-cyan-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW', 'SURVEY_VIEW', 'EXCEL_IMPORT', 'EXCEL_EXPORT', 'REPORTS_VIEW', 
      'PDF_EXPORT', 'AI_USE', 'ACTIONS_VIEW', 'ACTIONS_EDIT', 'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD'
    ]
  },
  {
    id: 'rol_coordinador_sst',
    code: 'COORDINADOR_SST',
    name: 'Coordinador SST',
    description: 'Coordinación operativa de campañas, ejecución de encuestas y seguimiento a sedes.',
    category: 'Operativo',
    isSystem: true,
    color: 'bg-sky-600 text-white border-sky-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW', 'SURVEY_VIEW', 'SURVEY_EDIT', 'EXCEL_IMPORT', 'EXCEL_EXPORT', 
      'REPORTS_VIEW', 'PDF_EXPORT', 'CATALOGS_ADMIN', 'AI_USE',
      'ACTIONS_VIEW', 'ACTIONS_CREATE', 'ACTIONS_EDIT', 'DOCUMENTS_VIEW', 'DOCUMENTS_UPLOAD'
    ]
  },
  {
    id: 'rol_jefe_area',
    code: 'JEFE_AREA',
    name: 'Jefe de Área',
    description: 'Supervisión de indicadores de clima y participación de colaboradores en su área.',
    category: 'Operativo',
    isSystem: true,
    color: 'bg-emerald-600 text-white border-emerald-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW', 'SURVEY_VIEW', 'REPORTS_VIEW', 'PDF_EXPORT'
    ]
  },
  {
    id: 'rol_lider',
    code: 'LIDER',
    name: 'Líder',
    description: 'Líder de equipo con visibilidad de avances de participación de su personal.',
    category: 'Operativo',
    isSystem: true,
    color: 'bg-amber-600 text-white border-amber-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW', 'SURVEY_VIEW', 'REPORTS_VIEW'
    ]
  },
  {
    id: 'rol_colaborador',
    code: 'COLABORADOR',
    name: 'Colaborador',
    description: 'Empleado o contratista enfocado en diligenciamiento de encuestas y auto-reportes.',
    category: 'Operativo',
    isSystem: true,
    color: 'bg-slate-600 text-white border-slate-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'SURVEY_VIEW'
    ]
  },
  {
    id: 'rol_auditor',
    code: 'AUDITOR',
    name: 'Auditor',
    description: 'Acceso en modo lectura para auditorías de cumplimiento SG-SST e ISO 45001.',
    category: 'Auditoría',
    isSystem: true,
    color: 'bg-violet-600 text-white border-violet-700',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW', 'SURVEY_VIEW', 'REPORTS_VIEW', 'PDF_EXPORT', 'EXCEL_EXPORT', 
      'AI_GOVERNANCE_VIEW', 'AI_STRATEGY_VIEW', 'BUSINESS_VIABILITY_VIEW', 'BUSINESS_FINANCIAL_VIEW',
      'AI_POWERBI_COMPARISON_VIEW', 'AUDIT_VIEW', 'DATAMODEL_VIEW'
    ]
  },
  {
    id: 'rol_invitado',
    code: 'INVITADO',
    name: 'Invitado',
    description: 'Perfil restringido temporal para demostración o revisión ejecutiva limitada.',
    category: 'Invitado',
    isSystem: true,
    color: 'bg-slate-400 text-white border-slate-500',
    updatedAt: new Date().toISOString(),
    permissions: [
      'DASHBOARD_VIEW'
    ]
  }
];

// INITIAL USERS SEED
export const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'usr_001',
    companyId: 'empresa_main_001',
    names: 'María Fernanda',
    surnames: 'Rodríguez Silva',
    email: 'lider.ghumana@innovatechit.com.co',
    documentType: 'CC',
    documentNumber: '1018432901',
    phone: '+57 310 456 7890',
    department: 'Gestión Humana y Talento',
    position: 'Directora de SG-SST',
    roleId: 'rol_director_sst',
    status: 'Activo',
    lastAccess: new Date().toISOString(),
    createdAt: '2026-01-10T08:00:00.000Z',
    notes: 'Usuario principal configurado'
  },
  {
    id: 'usr_002',
    companyId: 'empresa_main_001',
    names: 'Carlos Eduardo',
    surnames: 'Gómez Morales',
    email: 'admin@innovatechit.com.co',
    documentType: 'CC',
    documentNumber: '80123456',
    phone: '+57 315 987 6543',
    department: 'Gerencia General',
    position: 'Administrador Corporativo',
    roleId: 'rol_admin_empresa',
    status: 'Activo',
    lastAccess: new Date(Date.now() - 3600000 * 2).toISOString(),
    createdAt: '2026-01-05T08:00:00.000Z'
  },
  {
    id: 'usr_003',
    companyId: 'empresa_main_001',
    names: 'Dr. Alejandro',
    surnames: 'Restrepo Valencia',
    email: 'medico.laboral@innovatechit.com.co',
    documentType: 'CC',
    documentNumber: '71982345',
    phone: '+57 300 111 2233',
    department: 'Salud Ocupacional',
    position: 'Médico Laboral Especialista',
    roleId: 'rol_medico_laboral',
    status: 'Activo',
    lastAccess: new Date(Date.now() - 3600000 * 24).toISOString(),
    createdAt: '2026-01-15T08:00:00.000Z'
  },
  {
    id: 'usr_004',
    companyId: 'empresa_main_001',
    names: 'Dra. Laura Vanessa',
    surnames: 'Ospina Bermúdez',
    email: 'psicologia@innovatechit.com.co',
    documentType: 'CC',
    documentNumber: '1020456123',
    phone: '+57 318 444 5566',
    department: 'Bienestar y Salud Mental',
    position: 'Psicóloga Especialista en Riesgo Psicosocial',
    roleId: 'rol_psicologo',
    status: 'Activo',
    lastAccess: new Date(Date.now() - 3600000 * 5).toISOString(),
    createdAt: '2026-01-20T08:00:00.000Z'
  },
  {
    id: 'usr_005',
    companyId: 'empresa_main_001',
    names: 'SuperAdmin',
    surnames: 'SaaS Platform',
    email: 'superadmin@plataforma-sgsst.com',
    documentType: 'CE',
    documentNumber: '9900123',
    phone: '+57 601 700 0000',
    department: 'Sistemas SaaS',
    position: 'Super Administrador Global',
    roleId: 'rol_super_admin',
    status: 'Activo',
    lastAccess: new Date().toISOString(),
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'usr_006',
    companyId: 'empresa_main_001',
    names: 'Ing. Mateo',
    surnames: 'Suárez Cárdenas',
    email: 'analista.sst@innovatechit.com.co',
    documentType: 'CC',
    documentNumber: '1019345678',
    department: 'Seguridad Industrial',
    position: 'Analista de Datos SST',
    roleId: 'rol_analista_sst',
    status: 'Activo',
    lastAccess: new Date(Date.now() - 3600000 * 48).toISOString(),
    createdAt: '2026-02-01T08:00:00.000Z'
  },
  {
    id: 'usr_007',
    companyId: 'empresa_sec_002',
    names: 'Luz Marina',
    surnames: 'Pérez Quintero',
    email: 'auditoria@logipacifico.com',
    documentType: 'CC',
    documentNumber: '52890123',
    department: 'Control Interno',
    position: 'Auditora ISO 45001',
    roleId: 'rol_auditor',
    status: 'Activo',
    lastAccess: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: '2026-02-05T08:00:00.000Z'
  }
];

class RbacService {
  constructor() {
    this.ensureInitialized();
  }

  public ensureInitialized(): void {
    try {
      if (!localStorage.getItem(RBAC_PERMISSIONS_KEY)) {
        localStorage.setItem(RBAC_PERMISSIONS_KEY, JSON.stringify(DEFAULT_PERMISSIONS));
      } else {
        // Merge missing permissions dynamically
        const existing: PermissionDefinition[] = JSON.parse(localStorage.getItem(RBAC_PERMISSIONS_KEY) || '[]');
        const existingCodes = new Set(existing.map(p => p.code));
        let updated = false;
        DEFAULT_PERMISSIONS.forEach(dp => {
          if (!existingCodes.has(dp.code)) {
            existing.push(dp);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(RBAC_PERMISSIONS_KEY, JSON.stringify(existing));
        }
      }

      if (!localStorage.getItem(RBAC_ROLES_KEY)) {
        localStorage.setItem(RBAC_ROLES_KEY, JSON.stringify(DEFAULT_ROLES));
      } else {
        // Ensure all 12 default roles exist
        const existingRoles: RoleDefinition[] = JSON.parse(localStorage.getItem(RBAC_ROLES_KEY) || '[]');
        const existingRoleCodes = new Set(existingRoles.map(r => r.code));
        let updated = false;
        DEFAULT_ROLES.forEach(dr => {
          if (!existingRoleCodes.has(dr.code)) {
            existingRoles.push(dr);
            updated = true;
          }
        });
        if (updated) {
          localStorage.setItem(RBAC_ROLES_KEY, JSON.stringify(existingRoles));
        }
      }

      if (!localStorage.getItem(RBAC_USERS_KEY)) {
        localStorage.setItem(RBAC_USERS_KEY, JSON.stringify(DEFAULT_USERS));
      }
    } catch (e) {
      console.error('Error initializing RBAC service:', e);
    }
  }

  // --- PERMISSIONS ---
  public getPermissions(): PermissionDefinition[] {
    try {
      const raw = localStorage.getItem(RBAC_PERMISSIONS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_PERMISSIONS;
    } catch {
      return DEFAULT_PERMISSIONS;
    }
  }

  public addCustomPermission(permission: Omit<PermissionDefinition, 'id'>, userId: string = 'usr_system'): PermissionDefinition {
    const list = this.getPermissions();
    const newPerm: PermissionDefinition = {
      ...permission,
      id: `perm_custom_${Math.random().toString(36).substring(2, 9)}`,
      code: permission.code.toUpperCase().replace(/\s+/g, '_')
    };
    list.push(newPerm);
    localStorage.setItem(RBAC_PERMISSIONS_KEY, JSON.stringify(list));
    this.logAudit(userId, 'CREATE_PERMISSION', newPerm.code, `Permiso creado: ${newPerm.name}`);
    return newPerm;
  }

  // --- ROLES ---
  public getRoles(): RoleDefinition[] {
    try {
      const raw = localStorage.getItem(RBAC_ROLES_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_ROLES;
    } catch {
      return DEFAULT_ROLES;
    }
  }

  public getRoleById(roleId: string): RoleDefinition | undefined {
    return this.getRoles().find(r => r.id === roleId || r.code === roleId);
  }

  public toggleRolePermission(roleId: string, permissionCode: string, userId: string = 'usr_system'): RoleDefinition | null {
    const roles = this.getRoles();
    const idx = roles.findIndex(r => r.id === roleId || r.code === roleId);
    if (idx === -1) return null;

    const role = { ...roles[idx] };
    const hasPerm = role.permissions.includes(permissionCode);

    if (hasPerm) {
      role.permissions = role.permissions.filter(p => p !== permissionCode);
    } else {
      role.permissions = [...role.permissions, permissionCode];
    }

    role.updatedAt = new Date().toISOString();
    roles[idx] = role;
    localStorage.setItem(RBAC_ROLES_KEY, JSON.stringify(roles));

    this.logAudit(
      userId, 
      'UPDATE_ROLE_PERMISSIONS', 
      role.name, 
      `${hasPerm ? 'Revocado' : 'Otorgado'} permiso [${permissionCode}] al rol [${role.name}]`
    );

    return role;
  }

  public setRolePermissions(roleId: string, permissionCodes: string[], userId: string = 'usr_system'): RoleDefinition | null {
    const roles = this.getRoles();
    const idx = roles.findIndex(r => r.id === roleId || r.code === roleId);
    if (idx === -1) return null;

    roles[idx].permissions = permissionCodes;
    roles[idx].updatedAt = new Date().toISOString();
    localStorage.setItem(RBAC_ROLES_KEY, JSON.stringify(roles));

    this.logAudit(
      userId, 
      'UPDATE_ROLE_PERMISSIONS', 
      roles[idx].name, 
      `Actualización masiva de permisos (${permissionCodes.length} activos)`
    );

    return roles[idx];
  }

  public createRole(newRole: Omit<RoleDefinition, 'id' | 'updatedAt'>, userId: string = 'usr_system'): RoleDefinition {
    const roles = this.getRoles();
    const created: RoleDefinition = {
      ...newRole,
      id: `rol_${Math.random().toString(36).substring(2, 9)}`,
      code: newRole.code.toUpperCase().replace(/\s+/g, '_'),
      updatedAt: new Date().toISOString()
    };
    roles.push(created);
    localStorage.setItem(RBAC_ROLES_KEY, JSON.stringify(roles));

    this.logAudit(userId, 'CREATE_ROLE', created.name, `Rol creado exitosamente: ${created.name}`);
    return created;
  }

  public deleteRole(roleId: string, userId: string = 'usr_system'): boolean {
    let roles = this.getRoles();
    const target = roles.find(r => r.id === roleId);
    if (!target || target.isSystem) return false;

    roles = roles.filter(r => r.id !== roleId);
    localStorage.setItem(RBAC_ROLES_KEY, JSON.stringify(roles));

    this.logAudit(userId, 'DELETE_ROLE', target.name, `Rol eliminado: ${target.name}`);
    return true;
  }

  // --- USERS ---
  public getUsers(companyId?: string): UserAccount[] {
    try {
      const raw = localStorage.getItem(RBAC_USERS_KEY);
      let list: UserAccount[] = raw ? JSON.parse(raw) : DEFAULT_USERS;
      if (companyId) {
        list = list.filter(u => !u.companyId || u.companyId === companyId);
      }
      return list;
    } catch {
      return DEFAULT_USERS;
    }
  }

  public upsertUser(userData: Partial<UserAccount>, userId: string = 'usr_system'): UserAccount {
    const users = this.getUsers();
    const now = new Date().toISOString();

    if (userData.id) {
      const idx = users.findIndex(u => u.id === userData.id);
      if (idx !== -1) {
        const updated = { ...users[idx], ...userData };
        users[idx] = updated;
        localStorage.setItem(RBAC_USERS_KEY, JSON.stringify(users));
        this.logAudit(userId, 'UPDATE_USER_ROLE', `${updated.names} ${updated.surnames}`, `Usuario actualizado`);
        return updated;
      }
    }

    const newUser: UserAccount = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      companyId: userData.companyId || 'empresa_main_001',
      names: userData.names || 'Nuevo',
      surnames: userData.surnames || 'Usuario',
      email: userData.email || 'usuario@empresa.com',
      documentType: userData.documentType || 'CC',
      documentNumber: userData.documentNumber || '00000000',
      phone: userData.phone || '',
      department: userData.department || 'General',
      position: userData.position || 'Colaborador',
      roleId: userData.roleId || 'rol_colaborador',
      status: userData.status || 'Activo',
      createdAt: now,
      lastAccess: undefined
    };

    users.push(newUser);
    localStorage.setItem(RBAC_USERS_KEY, JSON.stringify(users));
    this.logAudit(userId, 'CREATE_USER', `${newUser.names} ${newUser.surnames}`, `Nuevo usuario creado: ${newUser.email}`);
    return newUser;
  }

  public toggleUserStatus(userId: string, currentActor: string = 'usr_system'): UserAccount | null {
    const users = this.getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;

    users[idx].status = users[idx].status === 'Activo' ? 'Inactivo' : 'Activo';
    localStorage.setItem(RBAC_USERS_KEY, JSON.stringify(users));

    this.logAudit(
      currentActor, 
      'TOGGLE_USER_STATUS', 
      `${users[idx].names} ${users[idx].surnames}`, 
      `Estado cambiado a ${users[idx].status}`
    );

    return users[idx];
  }

  // --- AUTHORIZATION EVALUATOR ---
  public hasPermission(roleIdOrCode: string, permissionCode: string): boolean {
    const role = this.getRoleById(roleIdOrCode);
    if (!role) return false;
    if (role.code === 'SUPER_ADMIN') return true; // Super admin always passes
    return role.permissions.includes(permissionCode);
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): RbacAuditLog[] {
    try {
      const raw = localStorage.getItem(RBAC_AUDIT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private logAudit(performedBy: string, action: RbacAuditLog['action'], targetRoleOrUser: string, details: string, companyId: string = 'empresa_main_001') {
    const logs = this.getAuditLogs();
    const newLog: RbacAuditLog = {
      id: `audit_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      performedBy,
      action,
      targetRoleOrUser,
      details,
      companyId
    };
    logs.unshift(newLog);
    // Keep last 100 entries
    localStorage.setItem(RBAC_AUDIT_KEY, JSON.stringify(logs.slice(0, 100)));
  }
}

export const rbacService = new RbacService();
