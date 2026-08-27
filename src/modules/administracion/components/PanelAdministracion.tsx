import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building, 
  Building2,
  Users, 
  ShieldCheck, 
  Key, 
  Database, 
  Upload, 
  Download, 
  RefreshCw, 
  AlertTriangle, 
  CreditCard, 
  CheckCircle, 
  Calendar, 
  Mail, 
  Search, 
  Plus, 
  Trash2, 
  Edit, 
  Activity, 
  FileText, 
  Check, 
  X,
  Lock,
  UserCheck,
  Server,
  CloudLightning,
  Clock,
  ShieldAlert,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEmpresa } from '../../configuracion/useEmpresa';
import { ConfiguracionEmpresa } from '../../empresa/components';
import { AdministracionEmpresasModule } from '../../administracion_empresas';
import { CatalogosOrganizacionalesModule } from '../../catalogos_organizacionales';
import { AdministracionUsuariosModule } from '../../administracion_usuarios';

// TS interfaces for our administration module
export interface UsuarioAdmin {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  estado: 'Activo' | 'Inactivo';
  fechaCreado: string;
  departamento: string;
}

export interface RolAdmin {
  id: string;
  nombre: string;
  descripcion: string;
  permisos: string[];
  nivelAcceso: 'Total' | 'Intermedio' | 'Restringido';
}

export interface BackupItem {
  id: string;
  nombre: string;
  fecha: string;
  tamano: string;
  tipo: 'Manual' | 'Programado';
  estado: 'Completado' | 'Error';
}

export default function PanelAdministracion() {
  const { 
    config, 
    updateConfig, 
    activeCompanyId, 
    companies, 
    createCompany, 
    deleteCompany, 
    switchCompany 
  } = useEmpresa();
  
  // Set default state for sub-tabs inside Administration
  const [adminTab, setAdminTab] = useState<'resumen' | 'empresas' | 'empresa' | 'catalogos' | 'usuarios' | 'roles' | 'licencia' | 'respaldos' | 'import_export' | 'reset'>('resumen');
  
  // ------------------------------------------
  // STATE DEFINITIONS backed by localStorage
  // ------------------------------------------
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [roles, setRoles] = useState<RolAdmin[]>([]);
  const [respaldos, setRespaldos] = useState<BackupItem[]>([]);
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseInfo, setLicenseInfo] = useState({
    tipo: 'Enterprise Corporativa Premium',
    estado: 'Activa',
    expira: '2028-12-31',
    organizacion: config?.nombreEmpresa || 'Innovatech IT',
    nit: config?.nit || '901.432.556-2',
    limiteUsuarios: 50,
    usuariosActivos: 5,
    firmaDigitalValida: true,
    diasRestantes: 896
  });

  // UI state managers
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [selectedRoleForView, setSelectedRoleForView] = useState<string>('admin');

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<UsuarioAdmin | null>(null);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');

  // Form states for adding/editing users
  const [userForm, setUserForm] = useState({
    nombre: '',
    correo: '',
    rol: 'Coordinador SG-SST',
    departamento: 'Seguridad y Salud',
    estado: 'Activo' as 'Activo' | 'Inactivo'
  });

  // Form states for adding roles
  const [roleForm, setRoleForm] = useState({
    nombre: '',
    descripcion: '',
    nivelAcceso: 'Intermedio' as 'Total' | 'Intermedio' | 'Restringido',
    permisos: [] as string[]
  });

  // Backup animation states
  const [isGeneratingBackup, setIsGeneratingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  // License activation states
  const [licenseSuccessMsg, setLicenseSuccessMsg] = useState<string | null>(null);
  const [licenseErrorMsg, setLicenseErrorMsg] = useState<string | null>(null);

  // General Toast message
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // ------------------------------------------
  // INITIALIZERS AND STORAGE SYNCS
  // ------------------------------------------
  useEffect(() => {
    if (!activeCompanyId) return;

    // Load users scoped by activeCompanyId
    const savedUsers = localStorage.getItem(`happy_insight_admin_users_${activeCompanyId}`);
    if (savedUsers) {
      try {
        setUsuarios(JSON.parse(savedUsers));
      } catch (e) {
        console.error('Error loading admin users:', e);
      }
    } else {
      const initialUsers: UsuarioAdmin[] = [
        { id: 'usr-1', nombre: 'Líder Humano', correo: 'lider.ghumana@innovatechit.com.co', rol: 'Administrador', estado: 'Activo', fechaCreado: '2026-01-15', departamento: 'Gestión Humana' },
        { id: 'usr-2', nombre: 'Carlos Mendoza', correo: 'carlos.mendoza@innovatechit.com.co', rol: 'Coordinador SG-SST', estado: 'Activo', fechaCreado: '2026-02-10', departamento: 'Seguridad y Salud' },
        { id: 'usr-3', nombre: 'Doris Pinzón', correo: 'doris.pinzon@innovatechit.com.co', rol: 'Auditor Externo', estado: 'Activo', fechaCreado: '2026-03-22', departamento: 'Calidad & Cumplimiento' },
        { id: 'usr-4', nombre: 'Andrés Felipe Gómez', correo: 'andres.gomez@innovatechit.com.co', rol: 'Consultor SST', estado: 'Activo', fechaCreado: '2026-05-18', departamento: 'Operaciones' },
        { id: 'usr-5', nombre: 'María Camila Restrepo', correo: 'camilia.restrepo@innovatechit.com.co', rol: 'Lector / Supervisor', estado: 'Inactivo', fechaCreado: '2026-06-01', departamento: 'Recursos Humanos' }
      ];
      setUsuarios(initialUsers);
      localStorage.setItem(`happy_insight_admin_users_${activeCompanyId}`, JSON.stringify(initialUsers));
    }

    // Load roles scoped by activeCompanyId
    const savedRoles = localStorage.getItem(`happy_insight_admin_roles_${activeCompanyId}`);
    if (savedRoles) {
      try {
        setRoles(JSON.parse(savedRoles));
      } catch (e) {
        console.error('Error loading admin roles:', e);
      }
    } else {
      const initialRoles: RolAdmin[] = [
        { id: 'admin', nombre: 'Administrador', descripcion: 'Acceso total y sin restricciones a todos los módulos, configuraciones, gestión de usuarios, auditorías de logs y restablecimiento del sistema.', permisos: ['ver_dashboard', 'gestionar_usuarios', 'config_empresa', 'cargar_datos', 'ver_reportes', 'descargar_pdf', 'ejecutar_backups', 'reset_sistema'], nivelAcceso: 'Total' },
        { id: 'sgsst', nombre: 'Coordinador SG-SST', descripcion: 'Diseñado para el responsable del SG-SST de la empresa. Permite cargar bases de datos, gestionar planes anuales, planes de acción y visualizar informes.', permisos: ['ver_dashboard', 'config_empresa', 'cargar_datos', 'ver_reportes', 'descargar_pdf', 'ejecutar_backups'], nivelAcceso: 'Intermedio' },
        { id: 'auditor', nombre: 'Auditor Externo', descripcion: 'Visualización y auditoría de informes de cumplimiento, planes anuales y mapas de riesgos. Permiso de descarga restringido sin alterar la configuración global.', permisos: ['ver_dashboard', 'ver_reportes', 'descargar_pdf'], nivelAcceso: 'Restringido' },
        { id: 'consultor', nombre: 'Consultor SST', descripcion: 'Visualización de indicadores, realización de simulaciones demográficas e inteligencia predictiva. No posee derechos de administración sobre la empresa o usuarios.', permisos: ['ver_dashboard', 'ver_reportes', 'cargar_datos', 'descargar_pdf'], nivelAcceso: 'Intermedio' },
        { id: 'lector', nombre: 'Lector / Supervisor', descripcion: 'Acceso básico y seguro únicamente de lectura a los dashboards sociodemográficos. Diseñado para la gerencia operativa o líderes de hub.', permisos: ['ver_dashboard'], nivelAcceso: 'Restringido' }
      ];
      setRoles(initialRoles);
      localStorage.setItem(`happy_insight_admin_roles_${activeCompanyId}`, JSON.stringify(initialRoles));
    }

    // Load backups scoped by activeCompanyId
    const savedBackups = localStorage.getItem(`happy_insight_admin_backups_${activeCompanyId}`);
    if (savedBackups) {
      try {
        setRespaldos(JSON.parse(savedBackups));
      } catch (e) {
        console.error('Error loading backups list:', e);
      }
    } else {
      const initialBackups: BackupItem[] = [
        { id: 'bk-1', nombre: 'sg_sst_backup_automatico_semanal.json', fecha: '2026-07-10 23:00:00', tamano: '43.2 KB', tipo: 'Programado', estado: 'Completado' },
        { id: 'bk-2', nombre: 'sg_sst_backup_manual_pre_carga_julio.json', fecha: '2026-07-06 08:42:15', tamano: '41.8 KB', tipo: 'Manual', estado: 'Completado' },
        { id: 'bk-3', nombre: 'sg_sst_backup_programado_mensual.json', fecha: '2026-06-30 00:00:01', tamano: '38.5 KB', tipo: 'Programado', estado: 'Completado' }
      ];
      setRespaldos(initialBackups);
      localStorage.setItem(`happy_insight_admin_backups_${activeCompanyId}`, JSON.stringify(initialBackups));
    }
  }, [activeCompanyId]);

  // Show Toast Helper
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync users count with license display
  useEffect(() => {
    const activeCount = usuarios.filter(u => u.estado === 'Activo').length;
    setLicenseInfo(prev => ({
      ...prev,
      usuariosActivos: activeCount,
      organizacion: config?.nombreEmpresa || prev.organizacion,
      nit: config?.nit || prev.nit
    }));
  }, [usuarios, config]);

  // All available permissions in the platform
  const TODOS_LOS_PERMISOS = [
    { key: 'ver_dashboard', label: 'Ver Dashboards', desc: 'Permite visualizar gráficos e indicadores sociodemográficos generales.' },
    { key: 'cargar_datos', label: 'Cargar Bases Sociodemográficas', desc: 'Permite subir archivos Excel para recalcular la nómina completa en tiempo real.' },
    { key: 'config_empresa', label: 'Configurar Datos de Empresa', desc: 'Permite modificar el NIT, nombre, logos, eslogan y responsables.' },
    { key: 'gestionar_usuarios', label: 'Gestionar Usuarios', desc: 'Permite crear, editar, inactivar y asignar roles a los colaboradores administrativos.' },
    { key: 'ver_reportes', label: 'Acceso a Reportes Críticos', desc: 'Permite la lectura de planes anuales, mapas de riesgo e informes gerenciales.' },
    { key: 'descargar_pdf', label: 'Exportación de Reportes PDF', desc: 'Habilita la descarga de informes PDF listos para junta directiva.' },
    { key: 'ejecutar_backups', label: 'Gestionar Respaldos', desc: 'Permite realizar copias de seguridad de toda la base de datos de configuración y descargarlas.' },
    { key: 'reset_sistema', label: 'Restablecimiento del Sistema', desc: 'Habilita la opción destructiva de borrar el total del software y reiniciar variables.' }
  ];

  // ------------------------------------------
  // USER ACTIONS (CRUD)
  // ------------------------------------------
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.nombre.trim() || !userForm.correo.trim()) {
      showToast('Por favor diligencie todos los campos requeridos', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userForm.correo)) {
      showToast('Formato de correo electrónico no válido', 'error');
      return;
    }

    const newUser: UsuarioAdmin = {
      id: `usr-${Date.now()}`,
      nombre: userForm.nombre,
      correo: userForm.correo,
      rol: userForm.rol,
      estado: userForm.estado,
      fechaCreado: new Date().toISOString().split('T')[0],
      departamento: userForm.departamento
    };

    const updated = [newUser, ...usuarios];
    setUsuarios(updated);
    localStorage.setItem('happy_insight_admin_users', JSON.stringify(updated));
    
    // Reset form and close
    setUserForm({
      nombre: '',
      correo: '',
      rol: 'Coordinador SG-SST',
      departamento: 'Seguridad y Salud',
      estado: 'Activo'
    });
    setShowAddUserModal(false);
    showToast(`Usuario ${newUser.nombre} creado correctamente.`);
  };

  const handleEditUserClick = (usr: UsuarioAdmin) => {
    setCurrentUser(usr);
    setUserForm({
      nombre: usr.nombre,
      correo: usr.correo,
      rol: usr.rol,
      departamento: usr.departamento,
      estado: usr.estado
    });
    setShowEditUserModal(true);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!userForm.nombre.trim() || !userForm.correo.trim()) {
      showToast('Diligencie todos los campos requeridos', 'error');
      return;
    }

    const updated = usuarios.map(u => {
      if (u.id === currentUser.id) {
        return {
          ...u,
          nombre: userForm.nombre,
          correo: userForm.correo,
          rol: userForm.rol,
          departamento: userForm.departamento,
          estado: userForm.estado
        };
      }
      return u;
    });

    setUsuarios(updated);
    localStorage.setItem('happy_insight_admin_users', JSON.stringify(updated));
    
    setShowEditUserModal(false);
    setCurrentUser(null);
    showToast('Los cambios del usuario se han guardado con éxito.');
  };

  const handleToggleUserStatus = (id: string) => {
    const updated = usuarios.map(u => {
      if (u.id === id) {
        const newStatus: 'Activo' | 'Inactivo' = u.estado === 'Activo' ? 'Inactivo' : 'Activo';
        showToast(`Usuario ${u.nombre} ahora está ${newStatus === 'Activo' ? 'Activado' : 'Inactivado'}.`);
        return { ...u, estado: newStatus };
      }
      return u;
    });
    setUsuarios(updated);
    localStorage.setItem('happy_insight_admin_users', JSON.stringify(updated));
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (confirm(`¿Está seguro que desea eliminar definitivamente al usuario administrative "${name}"?`)) {
      const updated = usuarios.filter(u => u.id !== id);
      setUsuarios(updated);
      localStorage.setItem('happy_insight_admin_users', JSON.stringify(updated));
      showToast(`Usuario ${name} eliminado.`);
    }
  };

  // ------------------------------------------
  // ROLE & PERMISSION ACTIONS
  // ------------------------------------------
  const handleTogglePermission = (roleId: string, permissionKey: string) => {
    const updated = roles.map(r => {
      if (r.id === roleId) {
        const hasPermission = r.permisos.includes(permissionKey);
        let newPerms;
        if (hasPermission) {
          newPerms = r.permisos.filter(pk => pk !== permissionKey);
        } else {
          newPerms = [...r.permisos, permissionKey];
        }
        return { ...r, permisos: newPerms };
      }
      return r;
    });
    setRoles(updated);
    localStorage.setItem('happy_insight_admin_roles', JSON.stringify(updated));
    showToast('Permisos de rol actualizados en tiempo real.');
  };

  const handleAddRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.nombre.trim() || !roleForm.descripcion.trim()) {
      showToast('Por favor diligencie todos los campos para el nuevo rol', 'error');
      return;
    }

    const newRol: RolAdmin = {
      id: `rol-custom-${Date.now()}`,
      nombre: roleForm.nombre,
      descripcion: roleForm.descripcion,
      permisos: roleForm.permisos,
      nivelAcceso: roleForm.nivelAcceso
    };

    const updated = [...roles, newRol];
    setRoles(updated);
    localStorage.setItem('happy_insight_admin_roles', JSON.stringify(updated));
    
    setRoleForm({
      nombre: '',
      descripcion: '',
      nivelAcceso: 'Intermedio',
      permisos: []
    });
    setShowAddRoleModal(false);
    showToast(`El rol personalizado "${newRol.nombre}" ha sido registrado.`);
  };

  const handleToggleRoleFormPermission = (key: string) => {
    setRoleForm(prev => {
      const exists = prev.permisos.includes(key);
      const updatedPerms = exists 
        ? prev.permisos.filter(p => p !== key) 
        : [...prev.permisos, key];
      return { ...prev, permisos: updatedPerms };
    });
  };

  // ------------------------------------------
  // BACKUP OPERATIONS (DATA BACKUP)
  // ------------------------------------------
  const handleCreateBackup = () => {
    if (isGeneratingBackup) return;
    
    setIsGeneratingBackup(true);
    setBackupProgress(0);

    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGeneratingBackup(false);
            
            // Actually generate the backup record
            const backupDate = new Date();
            const timestamp = backupDate.toLocaleString('es-CO');
            const fileDate = backupDate.toISOString().slice(0,10).replace(/-/g,'_');
            const fileTime = backupDate.toTimeString().slice(0,8).replace(/:/g,'');
            const filename = `sg_sst_backup_manual_${fileDate}_${fileTime}.json`;

            const newBackup: BackupItem = {
              id: `bk-${Date.now()}`,
              nombre: filename,
              fecha: timestamp,
              tamano: `${(Math.random() * 5 + 38).toFixed(1)} KB`,
              tipo: 'Manual',
              estado: 'Completado'
            };

            const updated = [newBackup, ...respaldos];
            setRespaldos(updated);
            localStorage.setItem('happy_insight_admin_backups', JSON.stringify(updated));
            showToast(`Copia de seguridad "${filename}" generada correctamente.`);
          }, 300);
          return 100;
        }
        return prev + 20; // 5 steps
      });
    }, 150);
  };

  const handleDownloadBackup = (bk: BackupItem) => {
    // Generate simulated export data including config, users, and roles
    const exportData = {
      backupId: bk.id,
      tipo: bk.tipo,
      fechaCreacion: bk.fecha,
      generador: 'People Insight IA',
      companySettings: config,
      users: usuarios,
      roles: roles,
      systemMetrics: {
        totalTrabajadoresEncuesta: config?.numeroTrabajadores || 0,
        licencia: licenseInfo.tipo,
        estadoSST: 'Optimizada'
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", bk.nombre);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Archivo ${bk.nombre} descargado exitosamente.`);
  };

  const handleDeleteBackup = (id: string, name: string) => {
    if (confirm(`¿Confirma que desea eliminar el archivo de respaldo "${name}"?`)) {
      const updated = respaldos.filter(b => b.id !== id);
      setRespaldos(updated);
      localStorage.setItem('happy_insight_admin_backups', JSON.stringify(updated));
      showToast('Copia de seguridad eliminada del almacenamiento local.');
    }
  };

  // ------------------------------------------
  // SYSTEM IMPORT / EXPORT
  // ------------------------------------------
  const handleExportSystemConfig = () => {
    const systemConfig = {
      exportVersion: '1.0.0',
      exportDate: new Date().toISOString(),
      companyConfig: config,
      users: usuarios,
      roles: roles,
      activeLicense: licenseInfo
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(systemConfig, null, 2));
    const downloadAnchor = document.createElement('a');
    const companySlug = (config?.nombreEmpresa || 'empresa').toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `happy_insight_config_${companySlug}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Configuración del sistema exportada con éxito como JSON.');
  };

  const handleImportSystemConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      showToast('Por favor cargue únicamente archivos en formato JSON (.json)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Validation check
        if (!json.companyConfig || !json.users || !json.roles) {
          showToast('El archivo cargado no contiene un formato de configuración válido de People Insight', 'error');
          return;
        }

        // Apply Configurations
        await updateConfig(json.companyConfig);
        setUsuarios(json.users);
        setRoles(json.roles);
        localStorage.setItem('happy_insight_admin_users', JSON.stringify(json.users));
        localStorage.setItem('happy_insight_admin_roles', JSON.stringify(json.roles));
        
        if (json.activeLicense) {
          setLicenseInfo(json.activeLicense);
        }

        showToast('¡Configuración importada exitosamente! Se han restablecido los datos corporativos, usuarios y roles.');
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (err) {
        console.error('Error parsing imported config:', err);
        showToast('Error al leer el archivo. Asegúrese de que sea un JSON válido.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // ------------------------------------------
  // LICENSE ACTIVATION
  // ------------------------------------------
  const handleActivateLicense = (e: React.FormEvent) => {
    e.preventDefault();
    setLicenseErrorMsg(null);
    setLicenseSuccessMsg(null);

    if (!licenseKey.trim()) {
      setLicenseErrorMsg('Por favor ingrese una clave de activación.');
      return;
    }

    // Standard pattern format simulation (e.g., PI-XXXX-XXXX-XXXX-XXXX)
    const keyPattern = /^PI-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
    if (!keyPattern.test(licenseKey.trim().toUpperCase())) {
      setLicenseErrorMsg('Formato de clave de licencia inválido. Debe seguir el formato PI-XXXX-XXXX-XXXX-XXXX');
      return;
    }

    // Success simulation
    setLicenseSuccessMsg('¡Clave de licencia validada correctamente en servidores de People Insight IA! Su suscripción Enterprise Corporativa ha sido renovada por 365 días adicionales.');
    setLicenseInfo(prev => ({
      ...prev,
      tipo: 'Enterprise Corporativa Premium (Renovada)',
      estado: 'Activa',
      expira: '2029-12-31',
      diasRestantes: 1261,
      limiteUsuarios: 100
    }));
    setLicenseKey('');
    showToast('Licencia corporativa actualizada correctamente.');
  };

  // ------------------------------------------
  // DESTRUCTIVE RESET SYSTEM
  // ------------------------------------------
  const handleResetSystem = () => {
    if (resetConfirmText.trim().toUpperCase() !== 'RESTABLECER') {
      showToast('Texto de confirmación incorrecto', 'error');
      return;
    }

    // Clear all localStorage keys related to the app
    localStorage.removeItem('happy_insight_company_settings');
    localStorage.removeItem('happy_insight_admin_users');
    localStorage.removeItem('happy_insight_admin_roles');
    localStorage.removeItem('happy_insight_admin_backups');
    localStorage.removeItem('happy_insight_pdf_config');
    
    showToast('Restableciendo el sistema completo...', 'info');
    setShowResetConfirmModal(false);

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  // Filtered users computed value
  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch = u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.correo.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.departamento.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'Todos' || u.rol === roleFilter;
    const matchesStatus = statusFilter === 'Todos' || u.estado === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Toast notifications rendering */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-xs font-bold text-white ${
              toastMessage.type === 'error' ? 'bg-red-600' : toastMessage.type === 'info' ? 'bg-indigo-600' : 'bg-slate-900 border border-emerald-500/30'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertTriangle className="w-4 h-4 text-red-200" />
            ) : toastMessage.type === 'info' ? (
              <Clock className="w-4 h-4 text-indigo-200 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Callout */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/15 text-emerald-300 border border-emerald-400/20">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Módulo de Control Autorizado</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight">
            Panel de Control y Administración
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl font-medium">
            Administre la seguridad de la plataforma, configure parámetros corporativos de {config?.nombreEmpresa || 'la empresa'}, 
            monitoree la licencia activa, establezca respaldos e importe/exporte toda la estructura.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0 bg-slate-950/40 p-1.5 rounded-2xl border border-slate-800">
          <div className="px-4 py-2 text-center border-r border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Usuarios</span>
            <span className="text-base font-black text-white">{usuarios.length}</span>
          </div>
          <div className="px-4 py-2 text-center border-r border-slate-800">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">Licencia</span>
            <span className="text-xs font-black text-cyan-400 block mt-0.5 uppercase">Premium</span>
          </div>
          <div className="px-4 py-2 text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase">SST Logs</span>
            <span className="text-xs font-black text-emerald-400 block mt-0.5 uppercase">OK</span>
          </div>
        </div>
      </div>

      {/* Admin Tabs Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Menu vertical de control (tipo Sidebar administrativo) */}
        <div className="w-full lg:w-72 shrink-0 space-y-2">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/65 shadow-sm space-y-1">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase px-3 py-1 tracking-wider">Menú del Panel</p>
            
            <button
              onClick={() => setAdminTab('resumen')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                adminTab === 'resumen' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Resumen Ejecutivo</span>
            </button>

            <button
              onClick={() => setAdminTab('empresas')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                adminTab === 'empresas' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4" />
                <span>Gestión Multiempresa</span>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-black px-2 py-0.5 rounded-full">{companies.length}</span>
            </button>

            <button
              onClick={() => setAdminTab('empresa')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                adminTab === 'empresa' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Configuración Empresa</span>
            </button>

            <button
              onClick={() => setAdminTab('catalogos')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                adminTab === 'catalogos' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4" />
                <span>Catálogos Organizacionales</span>
              </div>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-black px-2 py-0.5 rounded-full">17+</span>
            </button>

            <button
              onClick={() => setAdminTab('usuarios')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                adminTab === 'usuarios' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Usuarios (Estructura)</span>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-black px-2 py-0.5 rounded-full">{usuarios.length}</span>
            </button>

            <button
              onClick={() => setAdminTab('roles')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                adminTab === 'roles' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Roles y Permisos</span>
            </button>

            <button
              onClick={() => setAdminTab('licencia')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                adminTab === 'licencia' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-4 h-4" />
                <span>Licencia Activa</span>
              </div>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 font-extrabold px-1.5 py-0.5 rounded border border-emerald-200/50">OK</span>
            </button>

            <button
              onClick={() => setAdminTab('respaldos')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                adminTab === 'respaldos' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4" />
                <span>Respaldo de Información</span>
              </div>
              <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black px-2 py-0.5 rounded-full">{respaldos.length}</span>
            </button>

            <button
              onClick={() => setAdminTab('import_export')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                adminTab === 'import_export' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Importar / Exportar</span>
            </button>

            <div className="border-t border-slate-100 my-2 pt-2">
              <button
                onClick={() => setAdminTab('reset')}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
                  adminTab === 'reset' 
                    ? 'bg-red-550 text-white shadow-sm' 
                    : 'text-red-500 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Restablecer Sistema</span>
              </button>
            </div>

          </div>

          {/* Infrastructure Health Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/65 shadow-sm space-y-3.5">
            <h4 className="text-[10px] text-slate-400 font-extrabold uppercase px-1 tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-500" />
              <span>Salud del Servidor</span>
            </h4>
            <div className="space-y-2.5 text-[11px] font-medium text-slate-600 px-1">
              <div className="flex justify-between">
                <span>Base de Datos</span>
                <span className="text-emerald-600 font-black flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Conectado
                </span>
              </div>
              <div className="flex justify-between">
                <span>Almacenamiento</span>
                <span className="font-extrabold text-slate-800">4.1 MB / 100 MB</span>
              </div>
              <div className="flex justify-between">
                <span>Latencia de IA</span>
                <span className="text-slate-500 font-mono">112 ms</span>
              </div>
              <div className="flex justify-between">
                <span>Versión Software</span>
                <span className="text-slate-500 font-mono">v1.4.2-PRO</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic content rendering column */}
        <div className="flex-1 min-w-0">

          {/* TAB 0: MULTIEMPRESA MANAGEMENT */}
          {adminTab === 'empresas' && (
            <AdministracionEmpresasModule />
          )}

          {/* TAB 0.5: CATALOGOS ORGANIZACIONALES */}
          {adminTab === 'catalogos' && (
            <CatalogosOrganizacionalesModule />
          )}
          
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {adminTab === 'resumen' && (
            <div className="space-y-6">
              
              {/* Quick Status Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <UserCheck className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Usuarios Autorizados</span>
                    <span className="text-xl font-black text-slate-900 block">{usuarios.length} activos</span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">Límite de la licencia: {licenseInfo.limiteUsuarios}</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                    <Key className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Vencimiento Suscripción</span>
                    <span className="text-lg font-black text-slate-900 block truncate">{licenseInfo.expira}</span>
                    <span className="text-[9.5px] text-emerald-600 font-semibold block mt-0.5">{licenseInfo.diasRestantes} días vigentes</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4">
                  <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl shrink-0">
                    <Database className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Copias de Respaldo</span>
                    <span className="text-xl font-black text-slate-900 block">{respaldos.length} guardadas</span>
                    <span className="text-[9.5px] text-slate-400 block mt-0.5">Última: {respaldos[0]?.fecha || 'Nunca'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-sm font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                  <span>Acciones de Administración Rápidas</span>
                </h3>
                <p className="text-xs text-slate-500">Atajos de control directo para los procesos comunes de la plataforma.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button 
                    onClick={() => setAdminTab('usuarios')} 
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl text-left cursor-pointer transition-colors"
                  >
                    <Users className="w-4.5 h-4.5 text-indigo-600 mb-2" />
                    <span className="font-bold text-xs text-slate-900 block">Crear Usuario</span>
                    <span className="text-[10px] text-slate-400 font-medium block">Añadir analista o auditor</span>
                  </button>

                  <button 
                    onClick={handleCreateBackup} 
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl text-left cursor-pointer transition-colors"
                  >
                    <Database className="w-4.5 h-4.5 text-emerald-600 mb-2" />
                    <span className="font-bold text-xs text-slate-900 block">Crear Copia Local</span>
                    <span className="text-[10px] text-slate-400 font-medium block">Respaldo instantáneo local</span>
                  </button>

                  <button 
                    onClick={() => setAdminTab('import_export')} 
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl text-left cursor-pointer transition-colors"
                  >
                    <Download className="w-4.5 h-4.5 text-cyan-600 mb-2" />
                    <span className="font-bold text-xs text-slate-900 block">Exportar Config</span>
                    <span className="text-[10px] text-slate-400 font-medium block">Descargar JSON completo</span>
                  </button>

                  <button 
                    onClick={() => setAdminTab('empresa')} 
                    className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 rounded-xl text-left cursor-pointer transition-colors"
                  >
                    <Building className="w-4.5 h-4.5 text-amber-500 mb-2" />
                    <span className="font-bold text-xs text-slate-900 block">Perfil Empresa</span>
                    <span className="text-[10px] text-slate-400 font-medium block">Cambiar datos, firmas o logo</span>
                  </button>
                </div>
              </div>

              {/* Audit logs summary */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm font-display">Registros de Seguridad (Audit Trail)</h3>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded">Autorizado</span>
                </div>
                
                <div className="space-y-3.5">
                  <div className="flex gap-3 text-xs">
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 w-28">Hoy 06:44:51</span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">Acceso al módulo de Administración</p>
                      <p className="text-[11px] text-slate-500 font-medium">Líder Humano (lider.ghumana@innovatechit.com.co) - IP 192.168.1.45</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs">
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 w-28">Ayer 15:20:10</span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">Copia de seguridad semanal automática</p>
                      <p className="text-[11px] text-slate-500 font-medium">Sistema Programador - Completado con éxito (43.2 KB)</p>
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs">
                    <span className="text-[10px] font-mono text-slate-400 shrink-0 w-28">15/07/2026 11:05:32</span>
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">Modificación de Configuración Empresa</p>
                      <p className="text-[11px] text-slate-500 font-medium">Actualización de NIT y logotipo oficial - Carlos Mendoza</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: COMPANY CONFIGURATION (EMBEDED SYSTEM) */}
          {adminTab === 'empresa' && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm font-display">Perfil Corporativo y SG-SST</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Esta configuración alimenta la cabecera, logotipos, colores y responsables de todos los informes ejecutivos de la plataforma.</p>
                </div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black px-2 py-0.5 rounded border border-indigo-100">Modulo Empresa</span>
              </div>
              <div className="p-2 sm:p-6">
                <ConfiguracionEmpresa />
              </div>
            </div>
          )}

          {/* TAB 3: USERS STRUCTURE & DIRECTORY */}
          {adminTab === 'usuarios' && (
            <AdministracionUsuariosModule initialTab="USUARIOS" />
          )}

          {/* TAB 4: ROLES AND PERMISSIONS GRAPHICAL MATRIX */}
          {adminTab === 'roles' && (
            <AdministracionUsuariosModule initialTab="MATRIZ" />
          )}

          {/* TAB 5: SUSCRIPTION & LICENSE */}
          {adminTab === 'licencia' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
              
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-sm font-display">Suscripción y Licencia Corporativa</h3>
                <p className="text-[11px] text-slate-500 font-medium">Controle los parámetros de licenciamiento oficial del software, límites de cómputo y vigencia del SG-SST de {config?.nombreEmpresa || 'su compañía'}.</p>
              </div>

              {/* Subscription details card */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg relative overflow-hidden space-y-5">
                <div className="absolute top-0 right-0 w-[30%] h-[100%] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] bg-indigo-500/25 text-indigo-300 font-extrabold px-2 py-0.5 rounded border border-indigo-400/20 uppercase tracking-widest">Suscripción Activa</span>
                    <h4 className="font-black text-lg md:text-xl font-display text-white">{licenseInfo.tipo}</h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Estado</span>
                    <span className="text-emerald-400 font-black text-sm uppercase flex items-center gap-1.5 justify-end">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Activo / Verificado
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-semibold">
                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Organización</span>
                    <span className="text-white font-extrabold block truncate">{licenseInfo.organizacion}</span>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">NIT Titular</span>
                    <span className="text-white font-extrabold block truncate">{licenseInfo.nit}</span>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Fecha de Vencimiento</span>
                    <span className="text-white font-extrabold block">{licenseInfo.expira}</span>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Uso de Usuarios Administrativos</span>
                    <span className="text-white font-extrabold block">{licenseInfo.usuariosActivos} / {licenseInfo.limiteUsuarios} cuentas</span>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Firma Digital SG-SST</span>
                    <span className="text-emerald-400 font-black block flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" /> Habilitada y Válida
                    </span>
                  </div>

                  <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Tiempo Restante de Soporte</span>
                    <span className="text-cyan-400 font-extrabold block">{licenseInfo.diasRestantes} días calendario</span>
                  </div>
                </div>
              </div>

              {/* License renewal form */}
              <div className="p-5 border border-slate-200/60 rounded-2xl bg-slate-50 space-y-4">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-indigo-500" />
                    <span>Activar / Renovar Licencia</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">Ingrese la nueva clave de licencia de People Insight IA proveída por su consultor comercial para extender su período o ampliar la cantidad de usuarios permitidos.</p>
                </div>

                <form onSubmit={handleActivateLicense} className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="PI-XXXX-XXXX-XXXX-XXXX"
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-250 focus:border-indigo-500 rounded-xl text-xs font-mono uppercase focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-slate-900 text-white px-5 py-2.5 text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    >
                      Verificar Licencia
                    </button>
                  </div>

                  {licenseErrorMsg && (
                    <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-xl border border-red-100 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{licenseErrorMsg}</span>
                    </div>
                  )}

                  {licenseSuccessMsg && (
                    <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-3 rounded-xl border border-emerald-100 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{licenseSuccessMsg}</span>
                    </div>
                  )}
                </form>
              </div>

            </div>
          )}

          {/* TAB 6: DATABASE & SYSTEM BACKUP */}
          {adminTab === 'respaldos' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm font-display">Respaldo y Copias de Seguridad</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Mantenga a salvo toda la información y parámetros guardados en la plataforma realizando copias de seguridad de forma local en su navegador.</p>
                </div>
                <button
                  onClick={handleCreateBackup}
                  disabled={isGeneratingBackup}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0"
                >
                  <Database className="w-4 h-4" />
                  <span>{isGeneratingBackup ? 'Generando...' : 'Crear Copia Manual'}</span>
                </button>
              </div>

              {/* Progress Bar of backup */}
              {isGeneratingBackup && (
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-2.5">
                  <div className="flex justify-between items-center text-xs font-bold text-indigo-900">
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                      Empaquetando datos del SG-SST y nóminas...
                    </span>
                    <span>{backupProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-150" 
                      style={{ width: `${backupProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Backups list */}
              <div className="space-y-4">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Historial de Copias de Seguridad</p>
                
                <div className="space-y-2.5">
                  {respaldos.length > 0 ? (
                    respaldos.map(bk => (
                      <div key={bk.id} className="p-4 border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                        
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl mt-0.5">
                            <Database className="w-5 h-5 text-indigo-600" />
                          </div>
                          <div className="space-y-1 text-xs">
                            <span className="font-extrabold text-slate-900 block truncate max-w-sm sm:max-w-md">{bk.nombre}</span>
                            <div className="text-[10.5px] text-slate-400 font-medium flex flex-wrap items-center gap-x-2.5 gap-y-1">
                              <span>Tamaño: {bk.tamano}</span>
                              <span>•</span>
                              <span>Fecha: {bk.fecha}</span>
                              <span>•</span>
                              <span className={`px-1.5 py-0.2 rounded font-black text-[8px] uppercase ${
                                bk.tipo === 'Manual' ? 'bg-amber-100 text-amber-700' : 'bg-slate-150 text-slate-600'
                              }`}>{bk.tipo}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            onClick={() => handleDownloadBackup(bk)}
                            className="bg-white hover:bg-slate-100 text-slate-700 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-250 transition-colors cursor-pointer flex items-center gap-1"
                            title="Descargar respaldo local"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteBackup(bk.id, bk.nombre)}
                            className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Borrar copia de seguridad"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-slate-400 font-bold border border-dashed border-slate-200 rounded-2xl">
                      No hay copias de seguridad registradas en el servidor.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 7: IMPORT / EXPORT */}
          {adminTab === 'import_export' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm space-y-8">
              
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-extrabold text-slate-900 text-sm font-display">Exportación e Importación de Configuración</h3>
                <p className="text-[11px] text-slate-500 font-medium">Intercambie datos completos del sistema (ajustes corporativos, usuarios, matriz de roles y licencias) mediante un archivo físico estructurado en JSON.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* EXPORT SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Download className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Exportar Configuración</h4>
                      <p className="text-[10.5px] text-slate-400 font-semibold">Descargue un archivo de respaldo estructurado para transferirlo.</p>
                    </div>
                  </div>

                  <div className="p-5 border border-slate-200/60 bg-slate-50/50 rounded-2xl text-xs space-y-4 leading-relaxed">
                    <p className="text-slate-600 font-medium">Al exportar, generamos un archivo <strong className="text-slate-800">happy_insight_config_backup.json</strong> que almacena de forma íntegra:</p>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-500 font-medium">
                      <li>Datos completos de empresa (NIT, firmas, logos, colores)</li>
                      <li>La matriz de usuarios completa</li>
                      <li>La matriz de roles de acceso y permisos habilitados</li>
                      <li>Parámetros de licenciamiento actuales</li>
                    </ul>
                    <button
                      onClick={handleExportSystemConfig}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-xs flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar Todo como JSON</span>
                    </button>
                  </div>
                </div>

                {/* IMPORT SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                      <Upload className="w-5 h-5 text-cyan-600" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Importar Configuración</h4>
                      <p className="text-[10.5px] text-slate-400 font-semibold">Restaure configuraciones desde un archivo JSON local.</p>
                    </div>
                  </div>

                  <div className="p-5 border border-dashed border-slate-250 hover:border-indigo-400/85 transition-colors rounded-2xl flex flex-col items-center justify-center text-center space-y-3.5 min-h-[210px] bg-slate-50/30">
                    <CloudLightning className="w-8 h-8 text-slate-350" />
                    <div className="space-y-1 text-xs">
                      <span className="font-bold text-slate-900 block">Seleccione el archivo JSON de configuración</span>
                      <span className="text-[10.5px] text-slate-400 font-medium block">Soporta respaldos exportados previamente de Happy Insight</span>
                    </div>
                    
                    <label className="bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer shadow-sm">
                      <span>Buscar Archivo</span>
                      <input 
                        type="file" 
                        accept=".json" 
                        className="hidden" 
                        onChange={handleImportSystemConfig} 
                      />
                    </label>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 8: SYSTEM DESTRUCTIVE RESET */}
          {adminTab === 'reset' && (
            <div className="bg-red-50 p-6 rounded-2xl border border-red-150 shadow-sm space-y-6">
              
              <div className="border-b border-red-100 pb-4">
                <h3 className="font-black text-red-800 text-sm font-display flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span>Zona de Peligro: Restablecimiento del Sistema</span>
                </h3>
                <p className="text-[11px] text-red-700 font-semibold">Esta acción es irreversible y destructiva. Eliminará todos los datos almacenados en el software y regresará la plataforma a su estado inicial de instalación.</p>
              </div>

              <div className="p-5 bg-white border border-red-150 rounded-2xl text-xs space-y-4 leading-relaxed">
                <p className="font-bold text-slate-900">Al ejecutar el restablecimiento, sucederá lo siguiente:</p>
                <ul className="list-disc pl-4 space-y-2 text-slate-600 font-medium">
                  <li>Se borrarán todos los datos corporativos, NIT, firmas, logotipos cargados de su empresa.</li>
                  <li>Se eliminará toda la matriz de usuarios adicionales registrados administrativamente.</li>
                  <li>Se borrará la lista completa de copias de seguridad locales y configuración de PDFs.</li>
                  <li>Se desconectará la encuesta sociodemográfica activa de la nómina de colaboradores.</li>
                  <li>La plataforma regresará al asistente de instalación inicial (Setup Wizard) para configurarla desde cero.</li>
                </ul>

                <button
                  onClick={() => {
                    setResetConfirmText('');
                    setShowResetConfirmModal(true);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-5 rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-2 self-start"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Proceder con el Restablecimiento</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ------------------------------------------
          MODAL 1: ADD USER
         ------------------------------------------ */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-extrabold text-sm font-display">Registrar Nuevo Usuario Administrativo</h3>
              <button 
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-600 block">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Juan Carlos Pérez"
                  value={userForm.nombre}
                  onChange={(e) => setUserForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 block">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="Ej. juan.perez@empresa.com"
                  value={userForm.correo}
                  onChange={(e) => setUserForm(prev => ({ ...prev, correo: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-600 block">Área / Depto</label>
                  <input
                    type="text"
                    placeholder="Ej. Gestión Humana"
                    value={userForm.departamento}
                    onChange={(e) => setUserForm(prev => ({ ...prev, departamento: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 block">Rol Autorizado</label>
                  <select
                    value={userForm.rol}
                    onChange={(e) => setUserForm(prev => ({ ...prev, rol: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl focus:outline-none"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.nombre}>{r.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 block">Estado Inicial</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="user_status"
                      checked={userForm.estado === 'Activo'}
                      onChange={() => setUserForm(prev => ({ ...prev, estado: 'Activo' }))}
                      className="accent-indigo-600"
                    />
                    <span>Activo</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="user_status"
                      checked={userForm.estado === 'Inactivo'}
                      onChange={() => setUserForm(prev => ({ ...prev, estado: 'Inactivo' }))}
                      className="accent-indigo-600"
                    />
                    <span>Inactivo</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ------------------------------------------
          MODAL 2: EDIT USER
         ------------------------------------------ */}
      {showEditUserModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-extrabold text-sm font-display">Editar Usuario Administrativo</h3>
              <button 
                onClick={() => setShowEditUserModal(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditUserSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-600 block">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  value={userForm.nombre}
                  onChange={(e) => setUserForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 block">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  value={userForm.correo}
                  onChange={(e) => setUserForm(prev => ({ ...prev, correo: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-600 block">Área / Depto</label>
                  <input
                    type="text"
                    value={userForm.departamento}
                    onChange={(e) => setUserForm(prev => ({ ...prev, departamento: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 block">Rol Autorizado</label>
                  <select
                    value={userForm.rol}
                    onChange={(e) => setUserForm(prev => ({ ...prev, rol: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl focus:outline-none"
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.nombre}>{r.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 block">Estado Administrativo</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="user_status"
                      checked={userForm.estado === 'Activo'}
                      onChange={() => setUserForm(prev => ({ ...prev, estado: 'Activo' }))}
                      className="accent-indigo-600"
                    />
                    <span>Activo</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer text-slate-700">
                    <input
                      type="radio"
                      name="user_status"
                      checked={userForm.estado === 'Inactivo'}
                      onChange={() => setUserForm(prev => ({ ...prev, estado: 'Inactivo' }))}
                      className="accent-indigo-600"
                    />
                    <span>Inactivo</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ------------------------------------------
          MODAL 3: CREATE NEW ROLE
         ------------------------------------------ */}
      {showAddRoleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden"
          >
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-extrabold text-sm font-display">Registrar Nuevo Rol Personalizado</h3>
              <button 
                onClick={() => setShowAddRoleModal(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRoleSubmit} className="p-6 space-y-4 text-xs font-semibold">
              <div className="space-y-1.5">
                <label className="text-slate-600 block">Nombre del Rol *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Líder Regional SST"
                  value={roleForm.nombre}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, nombre: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 block">Descripción del Rol *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describa el objetivo de este rol y sus responsabilidades organizativas."
                  value={roleForm.descripcion}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl focus:outline-none resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-600 block">Nivel de Acceso Global</label>
                <select
                  value={roleForm.nivelAcceso}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, nivelAcceso: e.target.value as any }))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl focus:outline-none"
                >
                  <option value="Total">Total (Administrativo supremo)</option>
                  <option value="Intermedio">Intermedio (Carga y visualización de datos)</option>
                  <option value="Restringido">Restringido (Sólo lectura e informes)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-slate-600 block">Permisos Iniciales Habilitados</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto border border-slate-100 p-2.5 rounded-xl bg-slate-50/50">
                  {TODOS_LOS_PERMISOS.map(p => {
                    const isGranted = roleForm.permisos.includes(p.key);
                    return (
                      <div 
                        key={p.key}
                        onClick={() => handleToggleRoleFormPermission(p.key)}
                        className={`p-2 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
                          isGranted ? 'bg-indigo-50/80 border-indigo-200' : 'bg-white border-slate-100 hover:bg-slate-50'
                        }`}
                      >
                        <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                          isGranted ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                        }`}>
                          {isGranted && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                        <span className="text-[10.5px] text-slate-800 font-extrabold truncate">{p.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddRoleModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
                >
                  Crear Rol
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* ------------------------------------------
          MODAL 4: SYSTEM RESET CONFIRMATION
         ------------------------------------------ */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl border border-red-200 shadow-2xl max-w-md w-full overflow-hidden"
          >
            <div className="bg-red-650 text-white p-5 flex items-center justify-between">
              <h3 className="font-black text-sm font-display flex items-center gap-2">
                <AlertTriangle className="w-4.5 h-4.5 text-white" />
                <span>¿Confirma Restablecer Todo el Sistema?</span>
              </h3>
              <button 
                onClick={() => setShowResetConfirmModal(false)}
                className="text-red-200 hover:text-white p-1 hover:bg-red-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-semibold">
              <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 leading-relaxed font-medium">
                Esta acción borrará de forma permanente todos los cambios de empresa, NIT, logos, firmas, bases de datos subidas y usuarios registrados en su navegador.
              </div>

              <div className="space-y-2">
                <label className="text-slate-600 block leading-normal">
                  Para confirmar esta acción irreversible, por favor escriba la palabra <strong className="text-red-600">RESTABLECER</strong> en mayúsculas a continuación:
                </label>
                <input
                  type="text"
                  placeholder="ESCRIBA 'RESTABLECER' AQUÍ"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-250 focus:border-red-500 rounded-xl text-center font-black focus:outline-none"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowResetConfirmModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={resetConfirmText.trim().toUpperCase() !== 'RESTABLECER'}
                  onClick={handleResetSystem}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-xl transition-all font-black cursor-pointer"
                >
                  Confirmar Destrucción de Datos
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
