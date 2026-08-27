import React, { useState, useEffect, useCallback } from 'react';
import { EmpresaContext } from './EmpresaContext';
import { EmpresaConfig } from './empresa.types';
import { empresaService, DEFAULT_EMPRESA_CONFIG } from './empresa.service';
import { catalogosService, ExcelImportValidationResult } from './catalogos.service';
import { 
  CatalogKey, 
  CatalogoItem, 
  CompanyCatalogs, 
  getDefaultCatalogs, 
  CustomCatalogDefinition, 
  CatalogAuditLog, 
  CatalogPermission 
} from './catalogos.types';

export const EmpresaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<EmpresaConfig>(DEFAULT_EMPRESA_CONFIG);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeCompanyId, setActiveCompanyId] = useState<string>('default-company');
  const [companies, setCompanies] = useState<EmpresaConfig[]>([]);
  const [catalogs, setCatalogs] = useState<CompanyCatalogs>(getDefaultCatalogs());
  const [customDefinitions, setCustomDefinitions] = useState<CustomCatalogDefinition[]>([]);
  const [auditLogs, setAuditLogs] = useState<CatalogAuditLog[]>([]);

  // Default permissions for catalog administration
  const userPermissions: CatalogPermission[] = [
    'CATALOG_VIEW',
    'CATALOG_CREATE',
    'CATALOG_EDIT',
    'CATALOG_DEACTIVATE',
    'CATALOG_IMPORT',
    'CATALOG_EXPORT'
  ];

  const hasCatalogPermission = useCallback((permission: CatalogPermission): boolean => {
    return userPermissions.includes(permission);
  }, [userPermissions]);

  const refreshConfig = useCallback(async () => {
    try {
      setLoading(true);
      const activeId = await empresaService.getActiveCompanyId();
      const list = await empresaService.getCompanies();
      const data = await empresaService.getEmpresaConfig(activeId);
      const cats = await catalogosService.getCatalogs(activeId);
      const customDefs = await catalogosService.getCustomCatalogDefinitions(activeId);
      const logs = await catalogosService.getAuditLogs(activeId);
      
      setActiveCompanyId(activeId);
      setCompanies(list);
      setConfig(data);
      setCatalogs(cats);
      setCustomDefinitions(customDefs);
      setAuditLogs(logs);
    } catch (e) {
      console.error('Error al cargar la configuración de empresa multiempresa:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig]);

  const updateConfig = useCallback(async (newConfig: EmpresaConfig) => {
    try {
      setLoading(true);
      const activeId = await empresaService.getActiveCompanyId();
      await empresaService.saveEmpresaConfig(newConfig, activeId);
      setConfig(newConfig);
      
      const list = await empresaService.getCompanies();
      setCompanies(list);
    } catch (e) {
      console.error('Error al actualizar la configuración de empresa:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const switchCompany = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      await empresaService.setActiveCompanyId(companyId);
      const data = await empresaService.getEmpresaConfig(companyId);
      const cats = await catalogosService.getCatalogs(companyId);
      const customDefs = await catalogosService.getCustomCatalogDefinitions(companyId);
      const logs = await catalogosService.getAuditLogs(companyId);
      
      setActiveCompanyId(companyId);
      setConfig(data);
      setCatalogs(cats);
      setCustomDefinitions(customDefs);
      setAuditLogs(logs);
    } catch (e) {
      console.error('Error al cambiar de empresa:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCompany = useCallback(async (nombre: string, nit: string, extra?: Partial<EmpresaConfig>) => {
    try {
      setLoading(true);
      const newId = await empresaService.createCompany(nombre, nit, extra);
      const list = await empresaService.getCompanies();
      setCompanies(list);
      return newId;
    } catch (e) {
      console.error('Error al crear empresa:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveCompany = useCallback(async (companyData: EmpresaConfig) => {
    try {
      setLoading(true);
      await empresaService.saveEmpresaConfig(companyData, companyData.id);
      const list = await empresaService.getCompanies();
      setCompanies(list);
      const activeId = await empresaService.getActiveCompanyId();
      if (companyData.id === activeId) {
        setConfig(companyData);
      }
    } catch (e) {
      console.error('Error al guardar empresa:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCompany = useCallback(async (companyId: string) => {
    try {
      setLoading(true);
      await empresaService.deleteCompany(companyId);
      await refreshConfig();
    } catch (e) {
      console.error('Error al eliminar empresa:', e);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [refreshConfig]);

  // Catálogos Multiempresa
  const getCatalogItems = useCallback((key: CatalogKey, onlyActive: boolean = true): CatalogoItem[] => {
    const list = catalogs[key] || [];
    const filtered = onlyActive ? list.filter(item => item.activo) : list;
    return [...filtered].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  }, [catalogs]);

  const addCatalogItem = useCallback(async (key: CatalogKey, data: string | Partial<CatalogoItem>) => {
    const updated = await catalogosService.addItem(activeCompanyId, key, data);
    setCatalogs(updated);
    const logs = await catalogosService.getAuditLogs(activeCompanyId);
    setAuditLogs(logs);
  }, [activeCompanyId]);

  const updateCatalogItem = useCallback(async (key: CatalogKey, item: CatalogoItem) => {
    const updated = await catalogosService.updateItem(activeCompanyId, key, item);
    setCatalogs(updated);
    const logs = await catalogosService.getAuditLogs(activeCompanyId);
    setAuditLogs(logs);
  }, [activeCompanyId]);

  const deactivateCatalogItem = useCallback(async (key: CatalogKey, id: string) => {
    const updated = await catalogosService.deactivateItem(activeCompanyId, key, id);
    setCatalogs(updated);
    const logs = await catalogosService.getAuditLogs(activeCompanyId);
    setAuditLogs(logs);
  }, [activeCompanyId]);

  const deleteCatalogItem = useCallback(async (key: CatalogKey, id: string) => {
    await deactivateCatalogItem(key, id);
  }, [deactivateCatalogItem]);

  const toggleCatalogItem = useCallback(async (key: CatalogKey, id: string) => {
    const updated = await catalogosService.toggleActiveItem(activeCompanyId, key, id);
    setCatalogs(updated);
    const logs = await catalogosService.getAuditLogs(activeCompanyId);
    setAuditLogs(logs);
  }, [activeCompanyId]);

  const importCatalogsFromExcelData = useCallback(async (importedData: Partial<Record<string, any[]>>) => {
    const valRes = await catalogosService.validateExcelImport(activeCompanyId, importedData);
    if (valRes.validData) {
      const updated = await catalogosService.executeValidatedImport(activeCompanyId, valRes.validData);
      setCatalogs(updated);
      const logs = await catalogosService.getAuditLogs(activeCompanyId);
      setAuditLogs(logs);
    }
  }, [activeCompanyId]);

  const createCustomCatalog = useCallback(async (def: Omit<CustomCatalogDefinition, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>) => {
    const updatedDefs = await catalogosService.createCustomCatalogDefinition(activeCompanyId, def);
    setCustomDefinitions(updatedDefs);
    const cats = await catalogosService.getCatalogs(activeCompanyId);
    setCatalogs(cats);
    const logs = await catalogosService.getAuditLogs(activeCompanyId);
    setAuditLogs(logs);
  }, [activeCompanyId]);

  const validateExcelImport = useCallback(async (importedRawData: Partial<Record<string, any[]>>): Promise<ExcelImportValidationResult> => {
    return catalogosService.validateExcelImport(activeCompanyId, importedRawData);
  }, [activeCompanyId]);

  const executeValidatedImport = useCallback(async (validatedData: Partial<Record<string, CatalogoItem[]>>) => {
    const updated = await catalogosService.executeValidatedImport(activeCompanyId, validatedData);
    setCatalogs(updated);
    const logs = await catalogosService.getAuditLogs(activeCompanyId);
    setAuditLogs(logs);
  }, [activeCompanyId]);

  return (
    <EmpresaContext.Provider
      value={{
        config,
        loading,
        updateConfig,
        refreshConfig,
        activeCompanyId,
        companies,
        switchCompany,
        createCompany,
        saveCompany,
        deleteCompany,
        catalogs,
        customDefinitions,
        auditLogs,
        getCatalogItems,
        addCatalogItem,
        updateCatalogItem,
        deactivateCatalogItem,
        deleteCatalogItem,
        toggleCatalogItem,
        importCatalogsFromExcelData,
        createCustomCatalog,
        validateExcelImport,
        executeValidatedImport,
        hasCatalogPermission,
        userPermissions
      }}
    >
      {children}
    </EmpresaContext.Provider>
  );
};
