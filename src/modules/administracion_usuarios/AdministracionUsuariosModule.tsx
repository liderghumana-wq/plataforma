import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  ShieldCheck, 
  Key, 
  Lock, 
  UserCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  Sparkles, 
  RefreshCw, 
  Building2, 
  FileText, 
  FileCode, 
  Download, 
  Trash2, 
  Edit3, 
  Shield, 
  ShieldAlert, 
  Eye, 
  Check, 
  X,
  Filter,
  Info,
  Clock,
  Layers,
  Activity,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { rbacService } from '../../core/rbac/rbacService';
import { RoleDefinition, PermissionDefinition, UserAccount, RbacAuditLog } from '../../core/rbac/types';

interface AdministracionUsuariosModuleProps {
  currentCompanyId?: string;
  initialTab?: 'MATRIZ' | 'USUARIOS' | 'ROLES' | 'SIMULADOR' | 'AUDITORIA';
}

export function AdministracionUsuariosModule({ 
  currentCompanyId = 'empresa_main_001',
  initialTab = 'MATRIZ' 
}: AdministracionUsuariosModuleProps) {
  
  const [activeTab, setActiveTab] = useState<'MATRIZ' | 'USUARIOS' | 'ROLES' | 'SIMULADOR' | 'AUDITORIA'>(initialTab);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // State
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [permissions, setPermissions] = useState<PermissionDefinition[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [auditLogs, setAuditLogs] = useState<RbacAuditLog[]>([]);

  // Search & Filters
  const [permissionSearch, setPermissionSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('TODOS');
  const [userStatusFilter, setUserStatusFilter] = useState<string>('TODOS');

  // Modals
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRoleData, setNewRoleData] = useState({
    code: '',
    name: '',
    description: '',
    category: 'Operativo' as RoleDefinition['category'],
    color: 'bg-indigo-600 text-white border-indigo-700'
  });

  const [showPermModal, setShowPermModal] = useState(false);
  const [newPermData, setNewPermData] = useState({
    code: '',
    name: '',
    category: 'DASHBOARD' as PermissionDefinition['category'],
    description: ''
  });

  // Simulator state
  const [simulatedRoleId, setSimulatedRoleId] = useState<string>('rol_director_sst');

  // User Form State
  const [userForm, setUserForm] = useState<Partial<UserAccount>>({
    names: '',
    surnames: '',
    email: '',
    documentType: 'CC',
    documentNumber: '',
    department: 'Gestión Humana',
    position: 'Especialista',
    roleId: 'rol_colaborador',
    status: 'Activo'
  });

  // Load live data
  useEffect(() => {
    setRoles(rbacService.getRoles());
    setPermissions(rbacService.getPermissions());
    setUsers(rbacService.getUsers(currentCompanyId));
    setAuditLogs(rbacService.getAuditLogs());
  }, [currentCompanyId, refreshTrigger]);

  // Categories list
  const categories = useMemo(() => {
    const cats = Array.from(new Set(permissions.map(p => p.category)));
    return ['TODAS', ...cats];
  }, [permissions]);

  // Filtered Permissions for Matrix
  const filteredPermissions = useMemo(() => {
    return permissions.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(permissionSearch.toLowerCase()) || 
                          p.code.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                          p.description.toLowerCase().includes(permissionSearch.toLowerCase());
      const matchCategory = selectedCategory === 'TODAS' || p.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [permissions, permissionSearch, selectedCategory]);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const full = `${u.names} ${u.surnames} ${u.email} ${u.documentNumber}`.toLowerCase();
      const matchSearch = full.includes(userSearch.toLowerCase());
      const matchRole = userRoleFilter === 'TODOS' || u.roleId === userRoleFilter;
      const matchStatus = userStatusFilter === 'TODOS' || u.status === userStatusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  // Handlers for Matrix
  const handleTogglePermission = (roleId: string, permCode: string) => {
    rbacService.toggleRolePermission(roleId, permCode, 'usr_current_admin');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleGrantAllToRole = (roleId: string) => {
    const allCodes = permissions.map(p => p.code);
    rbacService.setRolePermissions(roleId, allCodes, 'usr_current_admin');
    setRefreshTrigger(prev => prev + 1);
  };

  const handleRevokeAllFromRole = (roleId: string) => {
    rbacService.setRolePermissions(roleId, [], 'usr_current_admin');
    setRefreshTrigger(prev => prev + 1);
  };

  // Handlers for User Upsert
  const handleOpenUserModal = (user?: UserAccount) => {
    if (user) {
      setEditingUser(user);
      setUserForm({ ...user });
    } else {
      setEditingUser(null);
      setUserForm({
        names: '',
        surnames: '',
        email: '',
        documentType: 'CC',
        documentNumber: '',
        department: 'Gestión Humana y SST',
        position: 'Analista',
        roleId: 'rol_analista_sst',
        status: 'Activo',
        companyId: currentCompanyId
      });
    }
    setShowUserModal(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    rbacService.upsertUser(userForm, 'usr_current_admin');
    setShowUserModal(false);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleToggleUserStatus = (userId: string) => {
    rbacService.toggleUserStatus(userId, 'usr_current_admin');
    setRefreshTrigger(prev => prev + 1);
  };

  // Handlers for Custom Role
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    rbacService.createRole({
      code: newRoleData.code,
      name: newRoleData.name,
      description: newRoleData.description,
      category: newRoleData.category,
      color: newRoleData.color,
      isSystem: false,
      permissions: ['DASHBOARD_VIEW']
    }, 'usr_current_admin');

    setShowRoleModal(false);
    setNewRoleData({
      code: '',
      name: '',
      description: '',
      category: 'Operativo',
      color: 'bg-indigo-600 text-white border-indigo-700'
    });
    setRefreshTrigger(prev => prev + 1);
  };

  const handleDeleteRole = (roleId: string) => {
    if (confirm('¿Está seguro de eliminar este rol personalizado?')) {
      rbacService.deleteRole(roleId, 'usr_current_admin');
      setRefreshTrigger(prev => prev + 1);
    }
  };

  // Handlers for Custom Permission
  const handleCreatePermission = (e: React.FormEvent) => {
    e.preventDefault();
    rbacService.addCustomPermission(newPermData, 'usr_current_admin');
    setShowPermModal(false);
    setNewPermData({ code: '', name: '', category: 'DASHBOARD', description: '' });
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6 text-slate-800 text-left">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-400/20 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-300" />
              <span>Gestión de Seguridad & RBAC Enterprise</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-400/20">
              {roles.length} Perfiles Configurados
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Administración de Usuarios, Roles y Permisos
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Módulo gráfico interactivo para la gestión de control de acceso basado en roles (RBAC). Configure matriz de permisos por perfil sin necesidad de modificar código fuente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleOpenUserModal()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>+ Nuevo Usuario</span>
          </button>

          <button
            onClick={() => setShowRoleModal(true)}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4 text-purple-400" />
            <span>+ Crear Rol</span>
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Usuarios Totales</span>
          <span className="text-xl font-black text-indigo-600">{users.length} Registrados</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Perfiles de Rol</span>
          <span className="text-xl font-black text-purple-600">{roles.length} Roles Activos</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Matriz de Permisos</span>
          <span className="text-xl font-black text-emerald-600">{permissions.length} Acciones Granulares</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Auditorías de Seguridad</span>
          <span className="text-xl font-black text-amber-600">{auditLogs.length} Registros</span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'MATRIZ', label: '🎛️ Matriz Gráfica de Permisos', icon: Sliders },
          { id: 'USUARIOS', label: '👥 Directorio de Usuarios', icon: Users },
          { id: 'ROLES', label: '🛡️ Catálogo de Roles & Perfiles', icon: Shield },
          { id: 'SIMULADOR', label: '🔍 Simulador & Tester de Accesos', icon: Eye },
          { id: 'AUDITORIA', label: '📜 Log de Auditoría RBAC', icon: Clock }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE GRAPHICAL RBAC MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'MATRIZ' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <span>Matriz Gráfica de Asignación de Permisos sin Código</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Haga clic en los interruptores para activar o desactivar permisos en tiempo real. Los cambios se aplican inmediatamente.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowPermModal(true)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Crear Permiso</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar permiso por nombre, código o descripción..."
                value={permissionSearch}
                onChange={(e) => setPermissionSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-extrabold text-slate-600 shrink-0">Categoría:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* MATRIX TABLE */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-900 text-white font-extrabold text-[11px] uppercase">
                <tr>
                  <th className="p-3.5 min-w-[260px] sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                    Permiso / Acción Granular
                  </th>
                  {roles.map(role => (
                    <th key={role.id} className="p-3 text-center min-w-[120px] max-w-[150px] border-r border-slate-800">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black truncate max-w-full ${role.color}`}>
                          {role.name}
                        </span>
                        <div className="flex items-center justify-center gap-1 text-[9px] text-slate-400 font-mono">
                          <span>{role.permissions.length} perms</span>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredPermissions.map(perm => (
                  <tr key={perm.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Permission Title & Description */}
                    <td className="p-3 sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-200 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{perm.name}</span>
                        <span className="text-[9px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 font-extrabold">
                          {perm.code}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{perm.description}</p>
                    </td>

                    {/* Checkboxes for each Role */}
                    {roles.map(role => {
                      const isGranted = role.code === 'SUPER_ADMIN' || role.permissions.includes(perm.code);
                      const isSuperAdmin = role.code === 'SUPER_ADMIN';

                      return (
                        <td key={role.id} className="p-3 text-center border-r border-slate-100">
                          <button
                            disabled={isSuperAdmin}
                            onClick={() => handleTogglePermission(role.id, perm.code)}
                            className={`w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer ${
                              isGranted 
                                ? 'bg-emerald-500 text-white shadow-xs hover:bg-emerald-600' 
                                : 'bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500'
                            } ${isSuperAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                            title={isGranted ? `Permiso activo para ${role.name}` : `Permiso inactivo para ${role.name}`}
                          >
                            {isGranted ? <Check className="w-4 h-4 stroke-[3]" /> : <X className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      );
                    })}

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Sugerencia: El perfil Super Administrador siempre hereda todos los permisos globales del sistema.</span>
            </span>
            <span className="font-mono text-slate-400">
              Mostrando {filteredPermissions.length} de {permissions.length} permisos
            </span>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: USER DIRECTORY */}
      {/* ========================================================================= */}
      {activeTab === 'USUARIOS' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Directorio de Usuarios y Asignación de Perfiles</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Administre las cuentas de colaboradores, médicos, psicólogos y directivos en la plataforma.
              </p>
            </div>

            <button
              onClick={() => handleOpenUserModal()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>+ Nuevo Usuario</span>
            </button>
          </div>

          {/* Search & Role Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, correo o documento..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="TODOS">Todos los Perfiles de Rol</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="Activo">Solo Activos</option>
                <option value="Inactivo">Solo Inactivos</option>
              </select>
            </div>
          </div>

          {/* USERS TABLE */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-900 text-white font-extrabold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Usuario / Colaborador</th>
                  <th className="p-3">Identificación</th>
                  <th className="p-3">Área / Cargo</th>
                  <th className="p-3">Perfil de Rol Asignado</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map(user => {
                  const assignedRole = roles.find(r => r.id === user.roleId || r.code === user.roleId);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      
                      {/* Avatar & Names */}
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs shrink-0 border border-indigo-200">
                            {user.names.charAt(0)}{user.surnames.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block">{user.names} {user.surnames}</span>
                            <span className="text-[11px] text-slate-500 block font-mono">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Doc */}
                      <td className="p-3 font-mono text-[11px] text-slate-700 font-bold">
                        {user.documentType} {user.documentNumber}
                      </td>

                      {/* Area & Cargo */}
                      <td className="p-3 space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">{user.position}</span>
                        <span className="text-[10px] text-slate-400 block">{user.department}</span>
                      </td>

                      {/* Role Badge */}
                      <td className="p-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black border ${assignedRole?.color || 'bg-slate-200 text-slate-800'}`}>
                          {assignedRole?.name || 'Sin Rol'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                          user.status === 'Activo' 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Activo' ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                          <span>{user.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenUserModal(user)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg border border-indigo-200 cursor-pointer"
                            title="Editar usuario"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`p-1.5 rounded-lg border cursor-pointer ${
                              user.status === 'Activo' 
                                ? 'text-amber-600 hover:bg-amber-50 border-amber-200' 
                                : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200'
                            }`}
                            title={user.status === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
                          >
                            {user.status === 'Activo' ? <Lock className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ROLES CATALOG & CARDS */}
      {/* ========================================================================= */}
      {activeTab === 'ROLES' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span>Catálogo de Perfiles de Rol Configurados ({roles.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Visualice las atribuciones y alcance de cada perfil por defecto o cree un rol personalizado.
              </p>
            </div>

            <button
              onClick={() => setShowRoleModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Crear Nuevo Rol</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map(role => {
              const assignedUsersCount = users.filter(u => u.roleId === role.id || u.roleId === role.code).length;
              const permPercentage = Math.round((role.permissions.length / permissions.length) * 100);

              return (
                <div key={role.id} className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-5 space-y-3 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${role.color}`}>
                        {role.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {role.category}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {role.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200/70 space-y-2">
                    <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
                      <span>Permisos Asignados:</span>
                      <span className="font-mono text-indigo-600">{role.permissions.length} / {permissions.length} ({permPercentage}%)</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${permPercentage}%` }}></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{assignedUsersCount} usuarios asignados</span>
                      </span>

                      {!role.isSystem && (
                        <button
                          onClick={() => handleDeleteRole(role.id)}
                          className="text-rose-600 hover:text-rose-800 font-bold cursor-pointer text-[10px] flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Eliminar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ROLE SIMULATOR & TESTER */}
      {/* ========================================================================= */}
      {activeTab === 'SIMULADOR' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          
          <div className="pb-4 border-b border-slate-100 space-y-1">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-600" />
              <span>Simulador de Experiencia y Verificación de Permisos</span>
            </h3>
            <p className="text-xs text-slate-500">
              Seleccione un perfil de rol para comprobar qué acciones están permitidas o denegadas según la matriz.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <span className="text-xs font-black text-slate-800 shrink-0">Simular Rol:</span>
            <select
              value={simulatedRoleId}
              onChange={(e) => setSimulatedRoleId(e.target.value)}
              className="w-full sm:w-80 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {permissions.map(perm => {
              const simRole = roles.find(r => r.id === simulatedRoleId || r.code === simulatedRoleId);
              const isAllowed = simRole?.code === 'SUPER_ADMIN' || simRole?.permissions.includes(perm.code);

              return (
                <div 
                  key={perm.id} 
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    isAllowed 
                      ? 'bg-emerald-50/50 border-emerald-200/80 text-emerald-950' 
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-75'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs">{perm.name}</span>
                    </div>
                    <p className="text-[10px] text-slate-500">{perm.description}</p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                    isAllowed ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}>
                    {isAllowed ? 'PERMITIDO' : 'DENEGADO'}
                  </span>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'AUDITORIA' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Registro de Modificaciones y Auditoría RBAC</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Trazabilidad en tiempo real de todos los cambios aplicados en roles, usuarios e interruptores de permisos.
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Aún no hay registros de cambios de seguridad auditados.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-900 text-white font-extrabold text-[10px] uppercase">
                  <tr>
                    <th className="p-3">Fecha y Hora</th>
                    <th className="p-3">Acción Auditada</th>
                    <th className="p-3">Rol / Usuario Afectado</th>
                    <th className="p-3">Detalles de Modificación</th>
                    <th className="p-3">Ejecutado Por</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-extrabold text-indigo-600 text-[11px]">
                        {log.action}
                      </td>
                      <td className="p-3 font-bold text-slate-800">
                        {log.targetRoleOrUser}
                      </td>
                      <td className="p-3 text-slate-600 text-xs">
                        {log.details}
                      </td>
                      <td className="p-3 font-mono text-[10px] text-slate-400">
                        {log.performedBy}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT USER */}
      {/* ========================================================================= */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-base flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-indigo-400" />
                <span>{editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</span>
              </h3>
              <button 
                onClick={() => setShowUserModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={userForm.names || ''}
                    onChange={(e) => setUserForm(prev => ({ ...prev, names: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={userForm.surnames || ''}
                    onChange={(e) => setUserForm(prev => ({ ...prev, surnames: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block">Correo Electrónico Corporativo *</label>
                <input
                  type="email"
                  required
                  value={userForm.email || ''}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block">Tipo Doc.</label>
                  <select
                    value={userForm.documentType || 'CC'}
                    onChange={(e) => setUserForm(prev => ({ ...prev, documentType: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="CC">CC</option>
                    <option value="CE">CE</option>
                    <option value="PASAPORTE">PASAPORTE</option>
                    <option value="PEP">PEP</option>
                  </select>
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="block">Número de Documento *</label>
                  <input
                    type="text"
                    required
                    value={userForm.documentNumber || ''}
                    onChange={(e) => setUserForm(prev => ({ ...prev, documentNumber: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block">Departamento / Área</label>
                  <input
                    type="text"
                    value={userForm.department || ''}
                    onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block">Cargo</label>
                  <input
                    type="text"
                    value={userForm.position || ''}
                    onChange={(e) => setUserForm(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-indigo-700 font-black">Asignar Perfil de Rol *</label>
                <select
                  value={userForm.roleId || 'rol_colaborador'}
                  onChange={(e) => setUserForm(prev => ({ ...prev, roleId: e.target.value }))}
                  className="w-full p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl font-bold text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.category})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer shadow-md"
                >
                  Guardar Usuario
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE CUSTOM ROLE */}
      {/* ========================================================================= */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-xs font-bold text-slate-700"
          >
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-base flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                <span>Crear Rol Personalizado</span>
              </h3>
              <button onClick={() => setShowRoleModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-6 space-y-4">
              <div className="space-y-1">
                <label>Nombre del Rol *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Auditor de Seguridad Externa"
                  value={newRoleData.name}
                  onChange={(e) => setNewRoleData(prev => ({ ...prev, name: e.target.value, code: e.target.value.toUpperCase().replace(/\s+/g, '_') }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-1">
                <label>Código del Rol (Sistemas)</label>
                <input
                  type="text"
                  readOnly
                  value={newRoleData.code}
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-500"
                />
              </div>

              <div className="space-y-1">
                <label>Categoría</label>
                <select
                  value={newRoleData.category}
                  onChange={(e) => setNewRoleData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Estratégico">Estratégico</option>
                  <option value="Especialista">Especialista</option>
                  <option value="Operativo">Operativo</option>
                  <option value="Auditoría">Auditoría</option>
                  <option value="Invitado">Invitado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label>Descripción del Alcance</label>
                <textarea
                  rows={3}
                  value={newRoleData.description}
                  onChange={(e) => setNewRoleData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Detalle de funciones y responsabilidades..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl cursor-pointer shadow-md font-bold"
                >
                  Crear Rol
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE CUSTOM PERMISSION */}
      {/* ========================================================================= */}
      {showPermModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-200 text-xs font-bold text-slate-700"
          >
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-black text-base flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <span>Agregar Permiso Granular</span>
              </h3>
              <button onClick={() => setShowPermModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePermission} className="p-6 space-y-4">
              <div className="space-y-1">
                <label>Nombre del Permiso *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Aprobar Planes de Acción Ocupacionales"
                  value={newPermData.name}
                  onChange={(e) => setNewPermData(prev => ({ ...prev, name: e.target.value, code: e.target.value.toUpperCase().replace(/\s+/g, '_') }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label>Categoría / Módulo</label>
                <select
                  value={newPermData.category}
                  onChange={(e) => setNewPermData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="DASHBOARD">DASHBOARD</option>
                  <option value="ENCUESTAS">ENCUESTAS</option>
                  <option value="EMPRESAS">EMPRESAS</option>
                  <option value="EXCEL">EXCEL</option>
                  <option value="REPORTES">REPORTES</option>
                  <option value="PDF">PDF</option>
                  <option value="USUARIOS">USUARIOS</option>
                  <option value="IA">IA</option>
                  <option value="CATALOGOS">CATALOGOS</option>
                  <option value="SST_SALUD">SST_SALUD</option>
                  <option value="SISTEMA">SISTEMA</option>
                </select>
              </div>

              <div className="space-y-1">
                <label>Descripción</label>
                <textarea
                  rows={3}
                  value={newPermData.description}
                  onChange={(e) => setNewPermData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Descripción detallada de la acción permitida..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPermModal(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl cursor-pointer shadow-md font-bold"
                >
                  Guardar Permiso
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
