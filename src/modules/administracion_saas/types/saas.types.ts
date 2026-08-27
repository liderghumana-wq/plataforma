/**
 * SaaS ARCHITECTURE, MULTI-TENANT & ENTERPRISE SCALABILITY TYPES
 * Phase 7: Product Model, Licensing, Dynamic Modules & Capacity Control
 */

export type TenantStatus = 'ACTIVO' | 'INACTIVO' | 'SUSPENDIDO' | 'EN_CONFIGURACION';

export type PlanTier = 'BASICO' | 'PROFESIONAL' | 'EMPRESARIAL';

export type LicenseStatus = 'ACTIVA' | 'CERCA_DEL_LIMITE' | 'LIMITE_ALCANZADO' | 'VENCIDA' | 'SUSPENDIDA';

export type CapacityAlertLevel = 'NORMAL' | 'CERCA_DEL_LIMITE' | 'LIMITE_ALCANZADO' | 'EXCEDIDO';

export type ModuleOrigin = 'PLAN_BASE' | 'ADD_ON' | 'PROMOCIONAL';

export type ModuleStatus = 'ACTIVO' | 'INACTIVO' | 'PRUEBA';

export type DataTag = '[A] Real' | '[B] Supuesto' | '[C] Escenario' | '[D] Proyección';

export interface CompanyTenant {
  id: string;
  razonSocial: string;
  nombreComercial: string;
  nit: string;
  logo?: string;
  sector: string;
  ciudad: string;
  direccion?: string;
  telefono?: string;
  estado: TenantStatus;
  planId: PlanTier;
  fechaInicio: string;
  fechaVencimiento: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  colaboradoresCount: number;
  usuariosCount: number;
  sedesCount: number;
  contactoPrincipal: {
    nombre: string;
    email: string;
    telefono: string;
    cargo: string;
  };
  observaciones?: string;
}

export interface CommercialPlan {
  id: PlanTier;
  nombre: string;
  tag: string;
  descripcion: string;
  precioMensualCopEscenario: number; // [C] Escenario Editable
  precioAnualCopEscenario: number;
  descuentoAnualPorcentaje: number;
  maxColaboradores: number;
  maxUsuarios: number;
  maxEmpresas: number;
  maxSedes: number;
  modulosDisponibles: string[];
  soporte: string;
  incluyeIa: boolean;
  incluyeCopilot: boolean;
  incluyeGobernanzaIa: boolean;
  incluyeInformesPdf: boolean;
  incluyeIntegraciones: boolean;
  color: string;
  badgePopular?: boolean;
}

export interface ModuleCatalogItem {
  id: string;
  nombre: string;
  categoria: 'CORE' | 'IA_ESTRATEGIA' | 'ANALITICA' | 'GOBERNANZA_ADMIN';
  descripcion: string;
  icono: string;
  planesMinimos: PlanTier[];
  isAddon: boolean;
  precioAddonMensualCop?: number;
  requiereSupervisionHumana?: boolean;
}

export interface CompanyModuleAssignment {
  id: string;
  companyId: string;
  moduloId: string;
  estado: ModuleStatus;
  fechaActivacion: string;
  fechaDesactivacion?: string;
  origen: ModuleOrigin;
  activadoPor: string;
  notas?: string;
}

export interface License {
  id: string;
  companyId: string;
  planId: PlanTier;
  estado: LicenseStatus;
  fechaInicio: string;
  fechaFin: string;
  limiteColaboradores: number;
  limiteUsuarios: number;
  limiteSedes: number;
  modulosActivos: string[];
  fechaCreacion: string;
  fechaActualizacion: string;
  notas?: string;
}

export interface CapacityReport {
  companyId: string;
  colaboradoresActuales: number;
  colaboradoresLimite: number;
  colaboradoresPorcentaje: number;
  colaboradoresStatus: 'ACTIVO' | 'CERCA_DEL_LIMITE' | 'LIMITE_ALCANZADO';
  
  usuariosActuales: number;
  usuariosLimite: number;
  usuariosPorcentaje: number;
  usuariosStatus: 'ACTIVO' | 'CERCA_DEL_LIMITE' | 'LIMITE_ALCANZADO';
  
  sedesActuales: number;
  sedesLimite: number;
  sedesPorcentaje: number;
  sedesStatus: 'ACTIVO' | 'CERCA_DEL_LIMITE' | 'LIMITE_ALCANZADO';
  
  modulosActivosCount: number;
  modulosTotalCount: number;
  
  diasParaVencer: number;
  isVencido: boolean;
  estadoGeneral: LicenseStatus;
  alertas: string[];
}

export interface SaasUserAccount {
  id: string;
  companyId: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: 'Activo' | 'Inactivo' | 'Suspendido' | 'Pendiente';
  fechaCreacion: string;
  ultimoAcceso?: string;
  cargo?: string;
  telefono?: string;
  departamento?: string;
}

export interface SaasAuditLog {
  id: string;
  timestamp: string;
  usuario: string;
  rol: string;
  companyId: string;
  accion: 'CAMBIO_PLAN' | 'ACTIVAR_MODULO' | 'DESACTIVAR_MODULO' | 'MODIFICAR_LIMITES' | 'CREAR_EMPRESA' | 'EDITAR_EMPRESA' | 'SUSPENDER_EMPRESA' | 'CREAR_USUARIO' | 'EDITAR_USUARIO' | 'CAMBIO_ROL' | 'CAMBIO_ESTADO_USUARIO' | 'AJUSTE_PRECIO_ESCENARIO' | 'RENOVAR_LICENCIA';
  entidad: string;
  valorAnterior: string;
  valorNuevo: string;
  justificacion: string;
  modulo: string;
  tipoDato: DataTag;
}

export interface SaasAdminDashboardMetrics {
  totalEmpresas: number;
  empresasActivas: number;
  empresasSuspendidas: number;
  empresasEnConfiguracion: number;
  totalColaboradoresAlojados: number;
  totalUsuariosPlataforma: number;
  modulosTotalesDisponibles: number;
  empresasProximasVencer: number; // <= 30 días
  empresasCercaDelLimite: number;  // >= 85% de capacidad
  mrrEscenarioCop: number;         // [C] Escenario Mensual
  arrEscenarioCop: number;         // [C] Escenario Anual
  tasaUtilizacionGlobal: number;   // Porcentaje
}
