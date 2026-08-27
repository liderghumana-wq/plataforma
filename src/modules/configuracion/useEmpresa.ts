import { useContext } from 'react';
import { EmpresaContext, EmpresaContextProps } from './EmpresaContext';
import { DEFAULT_EMPRESA_CONFIG } from './empresa.service';
import { getDefaultCatalogs } from './catalogos.types';

const SAFE_FALLBACK_VALUE: EmpresaContextProps = {
  config: DEFAULT_EMPRESA_CONFIG,
  loading: false,
  updateConfig: async () => {},
  refreshConfig: async () => {},
  activeCompanyId: 'default-company',
  companies: [DEFAULT_EMPRESA_CONFIG],
  switchCompany: async () => {},
  createCompany: async () => 'default-company',
  saveCompany: async () => {},
  deleteCompany: async () => {},

  catalogs: getDefaultCatalogs(),
  customDefinitions: [],
  auditLogs: [],
  getCatalogItems: () => [],
  addCatalogItem: async () => {},
  updateCatalogItem: async () => {},
  deactivateCatalogItem: async () => {},
  deleteCatalogItem: async () => {},
  toggleCatalogItem: async () => {},
  importCatalogsFromExcelData: async () => {},
  createCustomCatalog: async () => {},
  validateExcelImport: async () => ({
    valid: true,
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
    errors: [],
    validData: {}
  }),
  executeValidatedImport: async () => {},
  hasCatalogPermission: () => true,
  userPermissions: ['CATALOG_VIEW', 'CATALOG_CREATE', 'CATALOG_EDIT', 'CATALOG_DEACTIVATE', 'CATALOG_IMPORT', 'CATALOG_EXPORT']
};

export function useEmpresa(): EmpresaContextProps {
  const context = useContext(EmpresaContext);
  if (context === undefined) {
    return SAFE_FALLBACK_VALUE;
  }
  return context;
}

export default useEmpresa;
