import { EmpresaConfig } from './empresa.types';

const LOCAL_STORAGE_KEY = 'happy_insight_empresa_config';
const OLD_LOCAL_STORAGE_KEY = 'happy_insight_company_settings';
const COMPANIES_LIST_KEY = 'happy_insight_companies_list';
const ACTIVE_COMPANY_ID_KEY = 'happy_insight_active_company_id';

export const DEFAULT_EMPRESA_CONFIG: EmpresaConfig = {
  id: 'default-company',
  nombreEmpresa: '',
  nit: '',
  logo: '',
  colorPrimario: '#4f46e5',
  colorSecundario: '#06b6d4',
  correo: '',
  telefono: '',
  direccion: '',
  ciudad: '',
  departamento: '',
  pais: 'Colombia',
  sectorEconomico: 'Servicios',
  codigoCIIU: '',
  descripcionCIIU: '',
  tamanoEmpresa: 'Mediana (51-200)',
  sitioWeb: '',
  personaContacto: '',
  cargoContacto: '',
  estado: 'Activo',
  numeroTrabajadores: 0,
  nivelRiesgoARL: 1,
  representanteLegal: '',
  cargoRepresentante: '',
  responsableInforme: '',
  cargoResponsable: '',
  eslogan: '',
  responsableSST: '',
  claseRiesgo: '',
  normativaAplicada: '',
  riesgosPrioritarios: [],
  modulosActivados: [],
  fechaCreacion: new Date().toISOString().split('T')[0],
  fechaActualizacion: new Date().toISOString().split('T')[0]
};

// Map old local storage format to the new EmpresaConfig format
function mapOldToNew(old: any): EmpresaConfig {
  return {
    ...DEFAULT_EMPRESA_CONFIG,
    nombreEmpresa: old.nombre?.trim() || '',
    nit: old.nit?.trim() || '',
    logo: old.logoUrl || '',
    colorPrimario: old.colorPrimario || '',
    colorSecundario: old.colorSecundario || '',
    correo: old.correoElectronico || '',
    ciudad: old.ciudad || '',
    pais: old.pais || '',
    sectorEconomico: old.sectorEconomico || '',
    numeroTrabajadores: old.colaboradoresCount || 0,
    nivelRiesgoARL: old.nivelRiesgoArl || 1,
    responsableInforme: old.responsableInforme || '',
    cargoResponsable: old.cargoResponsable || '',
  };
}

// Map new EmpresaConfig format to the old local storage format
function mapNewToOld(config: EmpresaConfig) {
  return {
    nombre: config.nombreEmpresa,
    nit: config.nit,
    logoUrl: config.logo,
    colorPrimario: config.colorPrimario,
    colorSecundario: config.colorSecundario,
    correoElectronico: config.correo,
    ciudad: config.ciudad,
    pais: config.pais,
    sectorEconomico: config.sectorEconomico,
    colaboradoresCount: config.numeroTrabajadores,
    nivelRiesgoArl: config.nivelRiesgoARL,
    responsableInforme: config.responsableInforme,
    cargoResponsable: config.cargoResponsable
  };
}

export const empresaService = {
  /**
   * Obtiene la lista de todas las empresas.
   */
  async getCompanies(): Promise<EmpresaConfig[]> {
    try {
      const listSaved = localStorage.getItem(COMPANIES_LIST_KEY);
      if (listSaved) {
        return JSON.parse(listSaved);
      }

      // Si no existe, migrar del formato single-company
      const singleConfig = await this.getLegacyEmpresaConfig();
      const initialCompany: EmpresaConfig = {
        ...singleConfig,
        id: 'default-company',
        nombreEmpresa: singleConfig.nombreEmpresa || 'Mi Empresa Principal'
      };

      const list = [initialCompany];
      localStorage.setItem(COMPANIES_LIST_KEY, JSON.stringify(list));
      // También guardar su config individual
      localStorage.setItem(`happy_insight_empresa_config_default-company`, JSON.stringify(initialCompany));
      return list;
    } catch (e) {
      console.error('Error al leer la lista de empresas:', e);
      return [DEFAULT_EMPRESA_CONFIG];
    }
  },

  /**
   * Obtiene la configuración de una empresa específica.
   */
  async getEmpresaConfig(companyId?: string): Promise<EmpresaConfig> {
    const id = companyId || await this.getActiveCompanyId();
    try {
      const companySaved = localStorage.getItem(`happy_insight_empresa_config_${id}`);
      if (companySaved) {
        return JSON.parse(companySaved);
      }

      // Fallback para default-company si no existe su llave específica
      if (id === 'default-company') {
        const legacy = await this.getLegacyEmpresaConfig();
        const configWithId = { ...legacy, id: 'default-company' };
        localStorage.setItem(`happy_insight_empresa_config_default-company`, JSON.stringify(configWithId));
        return configWithId;
      }

      // Crear una nueva config vacía
      const newConfig: EmpresaConfig = {
        ...DEFAULT_EMPRESA_CONFIG,
        id,
        nombreEmpresa: `Empresa ${id.substring(0, 8)}`
      };
      localStorage.setItem(`happy_insight_empresa_config_${id}`, JSON.stringify(newConfig));
      return newConfig;
    } catch (e) {
      console.error(`Error al leer EmpresaConfig para ${id}:`, e);
      return { ...DEFAULT_EMPRESA_CONFIG, id };
    }
  },

  /**
   * Obtiene el ID de la empresa activa actual.
   */
  async getActiveCompanyId(): Promise<string> {
    try {
      const activeId = localStorage.getItem(ACTIVE_COMPANY_ID_KEY);
      if (activeId) {
        return activeId;
      }
    } catch (e) {
      console.error('Error al obtener activeCompanyId:', e);
    }
    return 'default-company';
  },

  /**
   * Cambia la empresa activa actual.
   */
  async setActiveCompanyId(companyId: string): Promise<void> {
    try {
      localStorage.setItem(ACTIVE_COMPANY_ID_KEY, companyId);
      
      // Sincronizar las llaves legadas/globales con la configuración de la nueva empresa activa
      const activeConfig = await this.getEmpresaConfig(companyId);
      
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activeConfig));
      const oldFormat = mapNewToOld(activeConfig);
      localStorage.setItem(OLD_LOCAL_STORAGE_KEY, JSON.stringify(oldFormat));

      // Emitir eventos para componentes reactivos que escuchen cambios
      window.dispatchEvent(new Event('company_settings_updated'));
      window.dispatchEvent(new Event('empresa_config_updated'));
      window.dispatchEvent(new Event('active_company_changed'));
    } catch (e) {
      console.error('Error al establecer activeCompanyId:', e);
    }
  },

  /**
   * Guarda la configuración de una empresa específica.
   */
  async saveEmpresaConfig(config: EmpresaConfig, companyId?: string): Promise<void> {
    const targetId = companyId || config.id || await this.getActiveCompanyId();
    try {
      const securedConfig = {
        ...config,
        id: targetId,
        nombreEmpresa: config.nombreEmpresa?.trim() || ''
      };
      
      // Guardar configuración específica
      localStorage.setItem(`happy_insight_empresa_config_${targetId}`, JSON.stringify(securedConfig));

      // Actualizar en la lista de empresas
      const companies = await this.getCompanies();
      const updatedCompanies = companies.map(c => c.id === targetId ? securedConfig : c);
      localStorage.setItem(COMPANIES_LIST_KEY, JSON.stringify(updatedCompanies));

      // Si es la activa, sincronizar llaves legadas
      const activeId = await this.getActiveCompanyId();
      if (targetId === activeId) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(securedConfig));
        const oldFormat = mapNewToOld(securedConfig);
        localStorage.setItem(OLD_LOCAL_STORAGE_KEY, JSON.stringify(oldFormat));
      }

      // Emitir eventos para componentes reactivos
      window.dispatchEvent(new Event('company_settings_updated'));
      window.dispatchEvent(new Event('empresa_config_updated'));
    } catch (e) {
      console.error('Error al guardar EmpresaConfig:', e);
      throw e;
    }
  },

  /**
   * Crea una nueva empresa y la agrega a la lista.
   */
  async createCompany(nombreEmpresa: string, nit: string, extra?: Partial<EmpresaConfig>): Promise<string> {
    try {
      const newId = `company-${Date.now()}`;
      const newConfig: EmpresaConfig = {
        ...DEFAULT_EMPRESA_CONFIG,
        ...extra,
        id: newId,
        nombreEmpresa: nombreEmpresa.trim(),
        nit: nit.trim()
      };

      // Guardar config específica
      localStorage.setItem(`happy_insight_empresa_config_${newId}`, JSON.stringify(newConfig));

      // Agregar a la lista
      const companies = await this.getCompanies();
      companies.push(newConfig);
      localStorage.setItem(COMPANIES_LIST_KEY, JSON.stringify(companies));

      return newId;
    } catch (e) {
      console.error('Error al crear nueva empresa:', e);
      throw e;
    }
  },

  /**
   * Elimina una empresa, su configuración y todos sus datos relacionados.
   */
  async deleteCompany(companyId: string): Promise<void> {
    try {
      if (companyId === 'default-company') {
        throw new Error('La empresa principal por defecto no puede ser eliminada.');
      }

      // Remover de la lista
      const companies = await this.getCompanies();
      const updatedCompanies = companies.filter(c => c.id !== companyId);
      localStorage.setItem(COMPANIES_LIST_KEY, JSON.stringify(updatedCompanies));

      // Remover keys de configuración
      localStorage.removeItem(`happy_insight_empresa_config_${companyId}`);

      // Remover bases de datos e informes independientes de esta empresa
      localStorage.removeItem(`happy_insight_demographics_${companyId}`);
      localStorage.removeItem(`happy_insight_recommendations_${companyId}`);
      localStorage.removeItem(`happy_insight_ai_conclusions_${companyId}`);
      localStorage.removeItem(`happy_insight_uploaded_file_${companyId}`);
      localStorage.removeItem(`happy_insight_pdf_config_${companyId}`);
      localStorage.removeItem(`happy_insight_admin_users_${companyId}`);
      localStorage.removeItem(`happy_insight_admin_roles_${companyId}`);
      localStorage.removeItem(`happy_insight_admin_backups_${companyId}`);
      localStorage.removeItem(`happy_insight_biblioteca_v1_${companyId}`);
      localStorage.removeItem(`happy_insight_plantillas_v1_${companyId}`);

      // Si era la empresa activa, cambiar a 'default-company'
      const activeId = await this.getActiveCompanyId();
      if (activeId === companyId) {
        await this.setActiveCompanyId('default-company');
      } else {
        window.dispatchEvent(new Event('company_settings_updated'));
        window.dispatchEvent(new Event('empresa_config_updated'));
      }
    } catch (e) {
      console.error(`Error al eliminar empresa ${companyId}:`, e);
      throw e;
    }
  },

  /**
   * Helper privado para cargar configuración única legada.
   */
  async getLegacyEmpresaConfig(): Promise<EmpresaConfig> {
    try {
      const newSaved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (newSaved) {
        const parsed = JSON.parse(newSaved);
        return {
          ...DEFAULT_EMPRESA_CONFIG,
          ...parsed,
          nombreEmpresa: parsed.nombreEmpresa?.trim() || ''
        };
      }

      const oldSaved = localStorage.getItem(OLD_LOCAL_STORAGE_KEY);
      if (oldSaved) {
        const oldParsed = JSON.parse(oldSaved);
        return mapOldToNew(oldParsed);
      }
    } catch (e) {
      console.error('Error al leer legacy config:', e);
    }
    return DEFAULT_EMPRESA_CONFIG;
  },

  /**
   * Restablece la configuración de la empresa (vacía todo el sistema multiempresa).
   */
  async resetEmpresaConfig(): Promise<void> {
    try {
      const companies = await this.getCompanies();
      for (const c of companies) {
        localStorage.removeItem(`happy_insight_empresa_config_${c.id}`);
        localStorage.removeItem(`happy_insight_demographics_${c.id}`);
        localStorage.removeItem(`happy_insight_recommendations_${c.id}`);
        localStorage.removeItem(`happy_insight_ai_conclusions_${c.id}`);
        localStorage.removeItem(`happy_insight_uploaded_file_${c.id}`);
        localStorage.removeItem(`happy_insight_pdf_config_${c.id}`);
        localStorage.removeItem(`happy_insight_admin_users_${c.id}`);
        localStorage.removeItem(`happy_insight_admin_roles_${c.id}`);
        localStorage.removeItem(`happy_insight_admin_backups_${c.id}`);
        localStorage.removeItem(`happy_insight_biblioteca_v1_${c.id}`);
        localStorage.removeItem(`happy_insight_plantillas_v1_${c.id}`);
      }
      
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.removeItem(OLD_LOCAL_STORAGE_KEY);
      localStorage.removeItem(COMPANIES_LIST_KEY);
      localStorage.removeItem(ACTIVE_COMPANY_ID_KEY);
      
      window.dispatchEvent(new Event('company_settings_updated'));
      window.dispatchEvent(new Event('empresa_config_updated'));
      window.dispatchEvent(new Event('active_company_changed'));
    } catch (e) {
      console.error('Error al restablecer EmpresaConfig:', e);
      throw e;
    }
  }
};
