import { useState, useEffect } from 'react';
import { rbacService } from './rbacService';
import { RoleDefinition, PermissionDefinition, UserAccount } from './types';

export function usePermissions(currentRoleId: string = 'rol_director_sst') {
  const [role, setRole] = useState<RoleDefinition | undefined>(() => rbacService.getRoleById(currentRoleId));
  const [permissions, setPermissions] = useState<PermissionDefinition[]>(() => rbacService.getPermissions());

  useEffect(() => {
    setRole(rbacService.getRoleById(currentRoleId));
    setPermissions(rbacService.getPermissions());
  }, [currentRoleId]);

  const can = (permissionCode: string): boolean => {
    return rbacService.hasPermission(currentRoleId, permissionCode);
  };

  const hasAny = (permissionCodes: string[]): boolean => {
    return permissionCodes.some(code => can(code));
  };

  const hasAll = (permissionCodes: string[]): boolean => {
    return permissionCodes.every(code => can(code));
  };

  return {
    role,
    permissions,
    can,
    hasAny,
    hasAll,
    isSuperAdmin: role?.code === 'SUPER_ADMIN',
    isAdmin: role?.code === 'ADMIN_EMPRESA' || role?.code === 'SUPER_ADMIN'
  };
}
