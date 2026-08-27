/**
 * ROLE-BASED ACCESS CONTROL (RBAC) & USER MANAGEMENT TYPES
 */

export interface PermissionDefinition {
  id: string;
  code: string;
  name: string;
  category: 'DASHBOARD' | 'ENCUESTAS' | 'EMPRESAS' | 'EXCEL' | 'REPORTES' | 'PDF' | 'USUARIOS' | 'IA' | 'CATALOGOS' | 'SST_SALUD' | 'SISTEMA' | 'ESTRATEGIA' | 'SAAS_ADMIN' | 'PLANES_ACCION';
  description: string;
  isSystem?: boolean;
}

export interface RoleDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'Estratégico' | 'Operativo' | 'Especialista' | 'Auditoría' | 'Invitado';
  isSystem: boolean; // Protect default roles from accidental deletion
  permissions: string[]; // List of permission codes
  updatedAt: string;
  color: string;
}

export interface UserAccount {
  id: string;
  companyId: string;
  names: string;
  surnames: string;
  email: string;
  documentType: 'CC' | 'CE' | 'PASAPORTE' | 'PEP';
  documentNumber: string;
  phone?: string;
  department: string;
  position: string;
  roleId: string; // Foreign Key to RoleDefinition.id
  status: 'Activo' | 'Inactivo' | 'Suspendido' | 'Pendiente';
  lastAccess?: string;
  createdAt: string;
  avatarUrl?: string;
  notes?: string;
}

export interface PermissionGroup {
  category: string;
  label: string;
  iconName: string;
  permissions: PermissionDefinition[];
}

export interface RbacAuditLog {
  id: string;
  timestamp: string;
  performedBy: string;
  action: 'UPDATE_ROLE_PERMISSIONS' | 'CREATE_ROLE' | 'DELETE_ROLE' | 'CREATE_USER' | 'UPDATE_USER_ROLE' | 'TOGGLE_USER_STATUS' | 'CREATE_PERMISSION';
  targetRoleOrUser: string;
  details: string;
  companyId: string;
}
