import { 
  CatalogKey, 
  CatalogoItem, 
  CompanyCatalogs, 
  getDefaultCatalogs, 
  createDefaultCatalogItem,
  CATALOG_METADATA_LIST,
  CustomCatalogDefinition,
  CatalogAuditLog,
  CatalogMetadata
} from './catalogos.types';
import * as XLSX from 'xlsx';

const CATALOGS_PREFIX = 'happy_insight_catalogs_';
const CUSTOM_CATALOGS_PREFIX = 'happy_insight_custom_catalogs_';
const AUDIT_LOGS_PREFIX = 'happy_insight_catalog_audit_';

export interface ExcelImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: { row: number; catalogKey: string; field: string; message: string; rowData?: any }[];
  validData: Partial<Record<string, CatalogoItem[]>>;
}

export const catalogosService = {
  /**
   * Obtiene síncronamente todos los catálogos para la empresa dada.
   */
  getCatalogsSync(companyId: string): CompanyCatalogs {
    const cid = companyId || 'default-company';
    const key = `${CATALOGS_PREFIX}${cid}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error al leer catálogos síncronos:', e);
    }
    return getDefaultCatalogs(cid);
  },

  /**
   * Obtiene todos los catálogos para la empresa dada.
   * Garantiza aislamiento por companyId.
   */
  async getCatalogs(companyId: string): Promise<CompanyCatalogs> {
    const cid = companyId || 'default-company';
    const key = `${CATALOGS_PREFIX}${cid}`;

    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed: CompanyCatalogs = JSON.parse(saved);
        const defaults = getDefaultCatalogs(cid);
        
        const allStandardKeys = CATALOG_METADATA_LIST.map(m => m.key);
        let modified = false;

        allStandardKeys.forEach(k => {
          if (!parsed[k] || !Array.isArray(parsed[k])) {
            parsed[k] = defaults[k] || [];
            modified = true;
          } else {
            const meta = CATALOG_METADATA_LIST.find(m => m.key === k);
            const prefix = meta?.codePrefix || 'CAT';

            parsed[k] = parsed[k].map((item: any, idx: number) => {
              let itemModified = false;
              const newItem = { ...item };

              if (newItem.companyId !== cid) {
                newItem.companyId = cid;
                itemModified = true;
              }
              if (!newItem.codigo) {
                newItem.codigo = `${prefix}-${(idx + 1).toString().padStart(3, '0')}`;
                itemModified = true;
              }
              if (newItem.activo === undefined) {
                newItem.activo = true;
                newItem.status = 'ACTIVE';
                itemModified = true;
              }

              if (itemModified) modified = true;
              return newItem;
            });
          }
        });

        if (modified) {
          localStorage.setItem(key, JSON.stringify(parsed));
        }
        return parsed;
      }
    } catch (e) {
      console.error('Error al cargar catálogos de empresa:', e);
    }

    // Default initialization for company
    const defaults = getDefaultCatalogs(cid);
    try {
      localStorage.setItem(key, JSON.stringify(defaults));
    } catch (e) {
      console.error('Error al guardar catálogos por defecto:', e);
    }
    return defaults;
  },

  /**
   * Guarda los catálogos para una empresa.
   */
  async saveCatalogs(companyId: string, catalogs: CompanyCatalogs): Promise<void> {
    try {
      const cid = companyId || 'default-company';
      const key = `${CATALOGS_PREFIX}${cid}`;
      localStorage.setItem(key, JSON.stringify(catalogs));
      window.dispatchEvent(new Event('empresa_catalogs_updated'));
    } catch (e) {
      console.error('Error al guardar catálogos:', e);
      throw e;
    }
  },

  // ==========================================
  // AUDITORÍA E HISTORIAL
  // ==========================================

  async getAuditLogs(companyId: string): Promise<CatalogAuditLog[]> {
    const cid = companyId || 'default-company';
    const key = `${AUDIT_LOGS_PREFIX}${cid}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error al leer historial de auditoría de catálogos:', e);
    }
    return [];
  },

  async recordAuditLog(
    companyId: string,
    catalogKey: string,
    itemId: string,
    itemCode: string,
    itemName: string,
    action: CatalogAuditLog['action'],
    modifiedBy: string = 'admin@empresa.com',
    previousValue?: Record<string, any>,
    newValue?: Record<string, any>,
    changesSummary: string = ''
  ): Promise<void> {
    const cid = companyId || 'default-company';
    const key = `${AUDIT_LOGS_PREFIX}${cid}`;
    const logs = await this.getAuditLogs(cid);

    const meta = CATALOG_METADATA_LIST.find(m => m.key === catalogKey);
    const catalogLabel = meta?.label || catalogKey;

    const newLog: CatalogAuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      companyId: cid,
      catalogKey,
      catalogLabel,
      itemId,
      itemCode,
      itemName,
      action,
      modifiedBy,
      modifiedAt: new Date().toISOString(),
      previousValue,
      newValue,
      changesSummary: changesSummary || `${action} en ${catalogLabel}: ${itemName} (${itemCode})`
    };

    logs.unshift(newLog); // latest first
    try {
      localStorage.setItem(key, JSON.stringify(logs.slice(0, 500))); // Keep last 500 audit records
    } catch (e) {
      console.error('Error al guardar auditoría de catálogos:', e);
    }
  },

  // ==========================================
  // CATÁLOGOS PERSONALIZADOS
  // ==========================================

  async getCustomCatalogDefinitions(companyId: string): Promise<CustomCatalogDefinition[]> {
    const cid = companyId || 'default-company';
    const key = `${CUSTOM_CATALOGS_PREFIX}${cid}`;
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error al leer catálogos personalizados:', e);
    }
    return [];
  },

  async createCustomCatalogDefinition(
    companyId: string,
    def: Omit<CustomCatalogDefinition, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>,
    userEmail: string = 'admin@empresa.com'
  ): Promise<CustomCatalogDefinition[]> {
    const cid = companyId || 'default-company';
    const key = `${CUSTOM_CATALOGS_PREFIX}${cid}`;
    const defs = await this.getCustomCatalogDefinitions(cid);

    const catalogKey = def.key.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
    
    // Check duplicate key
    if (defs.some(d => d.key === catalogKey) || CATALOG_METADATA_LIST.some(m => m.key === catalogKey)) {
      throw new Error(`El identificador de catálogo "${catalogKey}" ya existe.`);
    }

    const now = new Date().toISOString();
    const newDef: CustomCatalogDefinition = {
      id: `custom-cat-${Date.now()}`,
      companyId: cid,
      key: catalogKey,
      label: def.label.trim(),
      singularLabel: def.singularLabel.trim(),
      description: def.description?.trim(),
      iconName: def.iconName || 'ListPlus',
      codePrefix: (def.codePrefix || 'CST').toUpperCase(),
      activo: true,
      createdAt: now,
      updatedAt: now,
      createdBy: userEmail
    };

    defs.push(newDef);
    localStorage.setItem(key, JSON.stringify(defs));

    // Initialize empty array in CompanyCatalogs
    const catalogs = await this.getCatalogs(cid);
    if (!catalogs[catalogKey]) {
      catalogs[catalogKey] = [];
      await this.saveCatalogs(cid, catalogs);
    }

    await this.recordAuditLog(
      cid,
      catalogKey,
      newDef.id,
      newDef.codePrefix,
      newDef.label,
      'CREATE',
      userEmail,
      undefined,
      newDef,
      `Creado nuevo catálogo personalizado: ${newDef.label}`
    );

    return defs;
  },

  // ==========================================
  // OPERACIONES CRUD DE ÍTEMS DE CATÁLOGO
  // ==========================================

  /**
   * Agrega un nuevo ítem a un catálogo.
   * Valida unicidad de CÓDIGO dentro de la empresa.
   */
  async addItem(
    companyId: string, 
    catalogKey: CatalogKey, 
    data: string | Partial<CatalogoItem>,
    userEmail: string = 'admin@empresa.com'
  ): Promise<CompanyCatalogs> {
    const cid = companyId || 'default-company';
    const catalogs = await this.getCatalogs(cid);
    const list = catalogs[catalogKey] || [];

    const itemProps: Partial<CatalogoItem> = typeof data === 'string' ? { nombre: data } : data;
    const nombre = (itemProps.nombre || '').trim();
    if (!nombre) throw new Error('El nombre no puede estar vacío.');

    const meta = CATALOG_METADATA_LIST.find(m => m.key === catalogKey);
    const prefix = meta?.codePrefix || 'CAT';
    const autoCode = `${prefix}-${(list.length + 1).toString().padStart(3, '0')}`;
    const codigo = (itemProps.codigo || autoCode).trim().toUpperCase();

    // Regla 13: Validación de Duplicados de Código
    if (list.some(item => (item.codigo || '').toUpperCase() === codigo)) {
      throw new Error(`El código "${codigo}" ya existe en este catálogo para la empresa actual.`);
    }

    const newId = `cat-${catalogKey}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const maxOrden = list.reduce((max, item) => Math.max(max, item.orden || 0), 0);

    const newItem: CatalogoItem = createDefaultCatalogItem(
      newId,
      nombre,
      itemProps.orden ?? (maxOrden + 1),
      cid,
      codigo,
      {
        ...itemProps,
        companyId: cid,
        createdBy: userEmail,
        updatedBy: userEmail
      }
    );

    catalogs[catalogKey] = [...list, newItem];
    await this.saveCatalogs(cid, catalogs);

    await this.recordAuditLog(
      cid,
      catalogKey,
      newItem.id,
      newItem.codigo,
      newItem.nombre,
      'CREATE',
      userEmail,
      undefined,
      newItem,
      `Creado elemento ${newItem.nombre} (${newItem.codigo})`
    );

    return catalogs;
  },

  /**
   * Actualiza un ítem existente.
   * Valida que no duplique código con otro registro.
   */
  async updateItem(
    companyId: string, 
    catalogKey: CatalogKey, 
    updatedItem: CatalogoItem,
    userEmail: string = 'admin@empresa.com'
  ): Promise<CompanyCatalogs> {
    const cid = companyId || 'default-company';
    const catalogs = await this.getCatalogs(cid);
    const list = catalogs[catalogKey] || [];

    const existingIndex = list.findIndex(i => i.id === updatedItem.id);
    if (existingIndex === -1) throw new Error('El registro no fue encontrado.');

    const previousValue = { ...list[existingIndex] };
    const newCode = (updatedItem.codigo || previousValue.codigo || '').trim().toUpperCase();

    // Duplicate code check
    if (list.some(item => item.id !== updatedItem.id && (item.codigo || '').toUpperCase() === newCode)) {
      throw new Error(`El código "${newCode}" ya está registrado para otro elemento en este catálogo.`);
    }

    const now = new Date().toISOString();
    const finalItem: CatalogoItem = {
      ...previousValue,
      ...updatedItem,
      companyId: cid,
      codigo: newCode,
      nombre: updatedItem.nombre.trim(),
      fechaActualizacion: now,
      updatedAt: now,
      updatedBy: userEmail
    };

    catalogs[catalogKey][existingIndex] = finalItem;
    await this.saveCatalogs(cid, catalogs);

    await this.recordAuditLog(
      cid,
      catalogKey,
      finalItem.id,
      finalItem.codigo,
      finalItem.nombre,
      'UPDATE',
      userEmail,
      previousValue,
      finalItem,
      `Actualizado elemento ${finalItem.nombre} (${finalItem.codigo})`
    );

    return catalogs;
  },

  /**
   * Desactiva un elemento (NO eliminación física si tiene datos históricos).
   * Status = INACTIVE / activo = false.
   */
  async deactivateItem(
    companyId: string,
    catalogKey: CatalogKey,
    itemId: string,
    userEmail: string = 'admin@empresa.com'
  ): Promise<CompanyCatalogs> {
    const cid = companyId || 'default-company';
    const catalogs = await this.getCatalogs(cid);
    const list = catalogs[catalogKey] || [];

    const item = list.find(i => i.id === itemId);
    if (!item) throw new Error('Elemento no encontrado.');

    const now = new Date().toISOString();
    const updatedItem: CatalogoItem = {
      ...item,
      activo: false,
      status: 'INACTIVE',
      fechaActualizacion: now,
      updatedAt: now,
      updatedBy: userEmail
    };

    catalogs[catalogKey] = list.map(i => i.id === itemId ? updatedItem : i);
    await this.saveCatalogs(cid, catalogs);

    await this.recordAuditLog(
      cid,
      catalogKey,
      item.id,
      item.codigo,
      item.nombre,
      'DEACTIVATE',
      userEmail,
      item,
      updatedItem,
      `Desactivado elemento por conservación histórica: ${item.nombre} (${item.codigo})`
    );

    return catalogs;
  },

  /**
   * Alterna estado Activo/Inactivo.
   */
  async toggleActiveItem(
    companyId: string, 
    catalogKey: CatalogKey, 
    itemId: string,
    userEmail: string = 'admin@empresa.com'
  ): Promise<CompanyCatalogs> {
    const cid = companyId || 'default-company';
    const catalogs = await this.getCatalogs(cid);
    const list = catalogs[catalogKey] || [];
    const item = list.find(i => i.id === itemId);
    if (!item) throw new Error('Elemento no encontrado.');

    const newActiveState = !item.activo;
    const action = newActiveState ? 'REACTIVATE' : 'DEACTIVATE';

    const now = new Date().toISOString();
    const updatedItem: CatalogoItem = {
      ...item,
      activo: newActiveState,
      status: newActiveState ? 'ACTIVE' : 'INACTIVE',
      fechaActualizacion: now,
      updatedAt: now,
      updatedBy: userEmail
    };

    catalogs[catalogKey] = list.map(i => i.id === itemId ? updatedItem : i);
    await this.saveCatalogs(cid, catalogs);

    await this.recordAuditLog(
      cid,
      catalogKey,
      item.id,
      item.codigo,
      item.nombre,
      action,
      userEmail,
      item,
      updatedItem,
      `${newActiveState ? 'Reactivado' : 'Desactivado'} elemento: ${item.nombre} (${item.codigo})`
    );

    return catalogs;
  },

  // ==========================================
  // CONSULAS FILTRADAS POR RELACIONES JERÁRQUICAS
  // ==========================================

  getAreasBySede(companyId: string, sedeId?: string): CatalogoItem[] {
    const catalogs = this.getCatalogsSync(companyId);
    const areas = (catalogs.areas || []).filter(a => a.activo);
    if (!sedeId) return areas;
    return areas.filter(a => !a.sedeId || a.sedeId === sedeId);
  },

  getProcesosByArea(companyId: string, areaId?: string): CatalogoItem[] {
    const catalogs = this.getCatalogsSync(companyId);
    const procesos = (catalogs.procesos || []).filter(p => p.activo);
    if (!areaId) return procesos;
    return procesos.filter(p => !p.areaId || p.areaId === areaId);
  },

  getSubprocesosByProceso(companyId: string, procesoId?: string): CatalogoItem[] {
    const catalogs = this.getCatalogsSync(companyId);
    const subprocesos = (catalogs.subprocesos || []).filter(s => s.activo);
    if (!procesoId) return subprocesos;
    return subprocesos.filter(s => !s.procesoId || s.procesoId === procesoId);
  },

  getProyectosByFilters(companyId: string, filters?: { sedeId?: string; areaId?: string; procesoId?: string }): CatalogoItem[] {
    const catalogs = this.getCatalogsSync(companyId);
    let proyectos = (catalogs.proyectos || []).filter(p => p.activo);

    if (filters?.sedeId) {
      proyectos = proyectos.filter(p => !p.sedeId || p.sedeId === filters.sedeId);
    }
    if (filters?.areaId) {
      proyectos = proyectos.filter(p => !p.areaId || p.areaId === filters.areaId);
    }
    if (filters?.procesoId) {
      proyectos = proyectos.filter(p => !p.procesoId || p.procesoId === filters.procesoId);
    }
    return proyectos;
  },

  getCargosByFilters(companyId: string, filters?: { areaId?: string; procesoId?: string; proyectoId?: string; nivelJerarquicoId?: string }): CatalogoItem[] {
    const catalogs = this.getCatalogsSync(companyId);
    let cargos = (catalogs.cargos || []).filter(c => c.activo);

    if (filters?.areaId) {
      cargos = cargos.filter(c => !c.areaId || c.areaId === filters.areaId);
    }
    if (filters?.procesoId) {
      cargos = cargos.filter(c => !c.procesoId || c.procesoId === filters.procesoId);
    }
    if (filters?.proyectoId) {
      cargos = cargos.filter(c => !c.proyectoId || c.proyectoId === filters.proyectoId);
    }
    if (filters?.nivelJerarquicoId) {
      cargos = cargos.filter(c => !c.nivelJerarquicoId || c.nivelJerarquicoId === filters.nivelJerarquicoId);
    }
    return cargos;
  },

  // ==========================================
  // VALIDACIÓN E IMPORTACIÓN MASIVA DESDE EXCEL
  // ==========================================

  /**
   * Valida un conjunto de datos cargados de Excel antes de importar.
   * Regla 12 & 13: Valida duplicados, campos obligatorios y relaciones.
   * NO importa registros inválidos.
   */
  async validateExcelImport(
    companyId: string,
    importedRawData: Partial<Record<string, any[]>>
  ): Promise<ExcelImportValidationResult> {
    const cid = companyId || 'default-company';
    const existingCatalogs = await this.getCatalogs(cid);
    
    const errors: ExcelImportValidationResult['errors'] = [];
    const validData: Partial<Record<string, CatalogoItem[]>> = {};

    let totalRows = 0;
    let validRowsCount = 0;
    let invalidRowsCount = 0;

    const catalogKeys = Object.keys(importedRawData);

    for (const catKey of catalogKeys) {
      const rows = importedRawData[catKey] || [];
      const currentList = existingCatalogs[catKey] || [];
      const codeSet = new Set(currentList.map(item => (item.codigo || '').toUpperCase()));
      const validItemsForCat: CatalogoItem[] = [];

      rows.forEach((row, index) => {
        totalRows++;
        const rowNum = index + 2; // Row offset assuming headers at row 1

        const nombre = typeof row === 'string' ? row.trim() : String(row.nombre || row.Nombre || row['Descripción'] || row['Descripcion'] || '').trim();
        const codigo = typeof row === 'object' ? String(row.codigo || row['Código'] || row['Codigo'] || '').trim().toUpperCase() : '';
        const descripcion = typeof row === 'object' ? String(row.descripcion || row['Descripción'] || '').trim() : '';

        // Check required fields
        if (!nombre) {
          errors.push({
            row: rowNum,
            catalogKey: catKey,
            field: 'nombre',
            message: 'El campo Nombre / Descripción es obligatorio.',
            rowData: row
          });
          invalidRowsCount++;
          return;
        }

        // Generate auto code if absent
        const meta = CATALOG_METADATA_LIST.find(m => m.key === catKey);
        const prefix = meta?.codePrefix || 'CAT';
        const finalCode = codigo || `${prefix}-${(currentList.length + validItemsForCat.length + 1).toString().padStart(3, '0')}`;

        // Check duplicate code
        if (codeSet.has(finalCode)) {
          errors.push({
            row: rowNum,
            catalogKey: catKey,
            field: 'codigo',
            message: `El código "${finalCode}" ya existe o está duplicado en el catálogo.`,
            rowData: row
          });
          invalidRowsCount++;
          return;
        }

        // Validate relationship code if provided
        let parentSedeId: string | undefined = undefined;
        if (row.codigoSede || row['Código Sede']) {
          const sedeCode = String(row.codigoSede || row['Código Sede']).trim().toUpperCase();
          const foundSede = (existingCatalogs.sedes || []).find(s => (s.codigo || '').toUpperCase() === sedeCode);
          if (!foundSede) {
            errors.push({
              row: rowNum,
              catalogKey: catKey,
              field: 'codigoSede',
              message: `Sede con código "${sedeCode}" no encontrada en el catálogo de Sedes de la empresa.`,
              rowData: row
            });
            invalidRowsCount++;
            return;
          }
          parentSedeId = foundSede.id;
        }

        let parentAreaId: string | undefined = undefined;
        if (row.codigoArea || row['Código Área']) {
          const areaCode = String(row.codigoArea || row['Código Área']).trim().toUpperCase();
          const foundArea = (existingCatalogs.areas || []).find(a => (a.codigo || '').toUpperCase() === areaCode);
          if (!foundArea) {
            errors.push({
              row: rowNum,
              catalogKey: catKey,
              field: 'codigoArea',
              message: `Área con código "${areaCode}" no encontrada en el catálogo de Áreas de la empresa.`,
              rowData: row
            });
            invalidRowsCount++;
            return;
          }
          parentAreaId = foundArea.id;
        }

        // Add to valid items
        codeSet.add(finalCode);
        validRowsCount++;

        const now = new Date().toISOString();
        validItemsForCat.push({
          id: `cat-${catKey}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          companyId: cid,
          codigo: finalCode,
          nombre,
          descripcion: descripcion || undefined,
          activo: true,
          status: 'ACTIVE',
          orden: currentList.length + validItemsForCat.length + 1,
          sedeId: parentSedeId,
          areaId: parentAreaId,
          fechaCreacion: now,
          fechaActualizacion: now,
          createdAt: now,
          updatedAt: now,
          createdBy: 'importador_excel@empresa.com',
          updatedBy: 'importador_excel@empresa.com'
        });
      });

      if (validItemsForCat.length > 0) {
        validData[catKey] = validItemsForCat;
      }
    }

    return {
      valid: errors.length === 0,
      totalRows,
      validRows: validRowsCount,
      invalidRows: invalidRowsCount,
      errors,
      validData
    };
  },

  /**
   * Ejecuta la importación de datos previamente validados.
   */
  async executeValidatedImport(
    companyId: string,
    validatedData: Partial<Record<string, CatalogoItem[]>>,
    userEmail: string = 'admin@empresa.com'
  ): Promise<CompanyCatalogs> {
    const cid = companyId || 'default-company';
    const catalogs = await this.getCatalogs(cid);

    for (const key of Object.keys(validatedData)) {
      const newItems = validatedData[key] || [];
      const current = catalogs[key] || [];
      catalogs[key] = [...current, ...newItems];

      for (const item of newItems) {
        await this.recordAuditLog(
          cid,
          key,
          item.id,
          item.codigo,
          item.nombre,
          'IMPORT',
          userEmail,
          undefined,
          item,
          `Importado vía Excel: ${item.nombre} (${item.codigo})`
        );
      }
    }

    await this.saveCatalogs(cid, catalogs);
    return catalogs;
  },

  /**
   * Exportación completa a Excel.
   */
  exportCatalogsToExcel(companyId: string, catalogs: CompanyCatalogs, selectedCatalogKey?: string): void {
    const wb = XLSX.utils.book_new();
    const cid = companyId || 'default-company';

    const keysToExport = selectedCatalogKey 
      ? [selectedCatalogKey] 
      : Object.keys(catalogs);

    keysToExport.forEach(key => {
      const items = catalogs[key] || [];
      const meta = CATALOG_METADATA_LIST.find(m => m.key === key);
      const sheetName = (meta?.label || key).substring(0, 30);

      const rows = items.map(item => ({
        'ID': item.id,
        'EmpresaID': item.companyId || cid,
        'Código': item.codigo || 'N/A',
        'Nombre': item.nombre,
        'Descripción': item.descripcion || '',
        'Estado': item.activo ? 'Activo' : 'Inactivo',
        'Orden': item.orden || 1,
        'ID Sede Padre': item.sedeId || '',
        'ID Área Padre': item.areaId || '',
        'ID Proceso Padre': item.procesoId || '',
        'Fecha Creación': item.fechaCreacion || item.createdAt || '',
        'Última Modificación': item.fechaActualizacion || item.updatedAt || '',
        'Creado Por': item.createdBy || 'Sistema'
      }));

      const ws = XLSX.utils.json_to_sheet(rows.length > 0 ? rows : [{
        'ID': 'N/A', 'EmpresaID': cid, 'Código': 'EJ-001', 'Nombre': 'Sin registros', 'Descripción': '', 'Estado': 'Activo', 'Orden': 1, 'ID Sede Padre': '', 'ID Área Padre': '', 'ID Proceso Padre': '', 'Fecha Creación': '', 'Última Modificación': '', 'Creado Por': ''
      }]);

      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    const fileName = selectedCatalogKey
      ? `Catalogo_${selectedCatalogKey}_${cid}_${new Date().toISOString().split('T')[0]}.xlsx`
      : `Catalogos_Empresariales_${cid}_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(wb, fileName);
  },

  /**
   * Lee un archivo Excel subido y extrae sus hojas como diccionario de arreglos.
   */
  async parseExcelFile(file: File): Promise<Record<string, any[]>> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const result: Record<string, any[]> = {};

          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            if (json && json.length > 0) {
              const matchedMeta = CATALOG_METADATA_LIST.find(
                m => m.label.toLowerCase() === sheetName.toLowerCase() || m.key.toLowerCase() === sheetName.toLowerCase()
              );
              const key = matchedMeta ? matchedMeta.key : sheetName.toLowerCase().replace(/[^a-z0-9]/g, '_');
              result[key] = json;
            }
          });

          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Plantilla descargable oficial para importación de catálogos.
   */
  downloadCatalogTemplate(): void {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen
    const headers = CATALOG_METADATA_LIST.map(m => m.label);
    const sampleRow1 = CATALOG_METADATA_LIST.map(m => m.examples[0] || 'Ejemplo 1');
    const sampleRow2 = CATALOG_METADATA_LIST.map(m => m.examples[1] || 'Ejemplo 2');

    const wsSummary = XLSX.utils.aoa_to_sheet([headers, sampleRow1, sampleRow2]);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Catálogos Consolidados');

    // Hojas por catálogo
    CATALOG_METADATA_LIST.forEach(m => {
      const sheetData = [
        ['Código', 'Nombre', 'Descripción', 'Código Sede', 'Código Área'],
        ...m.examples.map((ex, idx) => [
          `${m.codePrefix}-${(idx + 1).toString().padStart(3, '0')}`,
          ex,
          `Registro de prueba de ${m.singularLabel.toLowerCase()}`,
          m.key === 'areas' ? 'SED-001' : '',
          m.key === 'procesos' ? 'ARE-001' : ''
        ])
      ];
      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      XLSX.utils.book_append_sheet(wb, ws, m.label.substring(0, 30));
    });

    XLSX.writeFile(wb, 'Plantilla_Catalogos_Empresariales_Oficial.xlsx');
  }
};
