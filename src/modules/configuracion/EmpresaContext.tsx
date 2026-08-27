import { createContext } from 'react';
import { EmpresaConfig } from './empresa.types';
import { 
  CatalogKey, 
  CatalogoItem, 
  CompanyCatalogs, 
  CustomCatalogDefinition, 
  CatalogAuditLog,
  CatalogPermission 
} from './catalogos.types';
import { ExcelImportValidationResult } from './catalogos.service';

export interface EmpresaContextProps {
  config: EmpresaConfig;
  loading: boolean;
  updateConfig: (newConfig: EmpresaConfig) => Promise<void>;
  refreshConfig: () => Promise<void>;
  
  // Multiempresa
  activeCompanyId: string;
  companies: EmpresaConfig[];
  switchCompany: (companyId: string) => Promise<void>;
  createCompany: (nombre: string, nit: string, extra?: Partial<EmpresaConfig>) => Promise<string>;
  saveCompany: (companyData: EmpresaConfig) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;

  // Catálogos Multiempresa Avanzados
  catalogs: CompanyCatalogs;
  customDefinitions: CustomCatalogDefinition[];
  auditLogs: CatalogAuditLog[];
  getCatalogItems: (key: CatalogKey, onlyActive?: boolean) => CatalogoItem[];
  addCatalogItem: (key: CatalogKey, data: string | Partial<CatalogoItem>) => Promise<void>;
  updateCatalogItem: (key: CatalogKey, item: CatalogoItem) => Promise<void>;
  deactivateCatalogItem: (key: CatalogKey, id: string) => Promise<void>;
  deleteCatalogItem: (key: CatalogKey, id: string) => Promise<void>;
  toggleCatalogItem: (key: CatalogKey, id: string) => Promise<void>;
  importCatalogsFromExcelData: (importedData: Partial<Record<string, any[]>>) => Promise<void>;
  
  // Catálogos Personalizados
  createCustomCatalog: (def: Omit<CustomCatalogDefinition, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  
  // Importación con pre-validación Excel
  validateExcelImport: (importedRawData: Partial<Record<string, any[]>>) => Promise<ExcelImportValidationResult>;
  executeValidatedImport: (validatedData: Partial<Record<string, CatalogoItem[]>>) => Promise<void>;
  
  // Permisos y Seguridad
  hasCatalogPermission: (permission: CatalogPermission) => boolean;
  userPermissions: CatalogPermission[];
}

export const EmpresaContext = createContext<EmpresaContextProps | undefined>(undefined);
export default EmpresaContext;
