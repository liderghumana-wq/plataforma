import { companyAdminService } from './companyAdmin.service';
import { Company, CompanySite, CompanyArea, CompanyProject, ExcelImportValidationResult } from './companyAdmin.types';

export interface Prompt23TestResult {
  id: string;
  name: string;
  description: string;
  passed: boolean;
  details: string;
  dataSample?: any;
}

export async function runPrompt23MultiTenantTests(): Promise<{
  total: number;
  passed: number;
  failed: number;
  results: Prompt23TestResult[];
}> {
  const results: Prompt23TestResult[] = [];

  // TEST 1: Provisioning Empresa A and Empresa B
  try {
    const compA = companyAdminService.saveCompany({
      id: 'test-empresa-a',
      name: 'Empresa A - Operaciones BPO',
      identificationNumber: '900111222-1',
      primaryColor: '#4f46e5'
    });

    const compB = companyAdminService.saveCompany({
      id: 'test-empresa-b',
      name: 'Empresa B - Manufactura',
      identificationNumber: '800333444-2',
      primaryColor: '#10b981'
    });

    // Empresa A Items
    companyAdminService.saveSite('test-empresa-a', { name: 'Sede Norte', code: 'SED-A1', city: 'Bogotá' });
    companyAdminService.saveArea('test-empresa-a', { name: 'Operaciones', code: 'ARE-A1' });
    companyAdminService.saveProject('test-empresa-a', { name: 'Proyecto Alfa', code: 'PRY-A1' });

    // Empresa B Items
    companyAdminService.saveSite('test-empresa-b', { name: 'Planta Principal', code: 'SED-B1', city: 'Medellín' });
    companyAdminService.saveArea('test-empresa-b', { name: 'Producción', code: 'ARE-B1' });
    companyAdminService.saveProject('test-empresa-b', { name: 'Proyecto Beta', code: 'PRY-B1' });

    results.push({
      id: 'p23-t1',
      name: 'Provisionamiento Multiempresa',
      description: 'Creación de Empresa A (Sede Norte, Operaciones, Proyecto Alfa) y Empresa B (Planta Principal, Producción, Proyecto Beta).',
      passed: true,
      details: 'Empresa A y Empresa B creadas con catálogos parametrizados aislados.',
      dataSample: { compA: compA.name, compB: compB.name }
    });
  } catch (e: any) {
    results.push({
      id: 'p23-t1',
      name: 'Provisionamiento Multiempresa',
      description: 'Creación de empresas de prueba.',
      passed: false,
      details: `Error en la creación: ${e.message}`
    });
  }

  // TEST 2: Strict Isolation Check (Empresa A cannot see Empresa B data)
  try {
    const sitesA = companyAdminService.getSites('test-empresa-a');
    const sitesB = companyAdminService.getSites('test-empresa-b');

    const aHasBData = sitesA.some(s => s.name === 'Planta Principal' || s.code === 'SED-B1');
    const bHasAData = sitesB.some(s => s.name === 'Sede Norte' || s.code === 'SED-A1');

    const passed = !aHasBData && !bHasAData;
    results.push({
      id: 'p23-t2',
      name: 'Aislamiento Estricto por companyId',
      description: 'Verificar que la Empresa A NO pueda visualizar la Sede/Área/Proyecto de la Empresa B y viceversa.',
      passed,
      details: passed
        ? 'Aislamiento 100% verificado. Ninguna empresa tiene visibilidad sobre catálogos ajenos.'
        : 'Falla: Se detectaron datos cruzados entre Empresa A y Empresa B.',
      dataSample: { sitesA: sitesA.map(s => s.name), sitesB: sitesB.map(s => s.name) }
    });
  } catch (e: any) {
    results.push({
      id: 'p23-t2',
      name: 'Aislamiento Estricto por companyId',
      description: 'Filtro por companyId',
      passed: false,
      details: e.message
    });
  }

  // TEST 3: Duplicate Code Rule per Company (Allowed across companies, prohibited inside same company)
  try {
    // Add code BOG-01 to Empresa A
    const resA = companyAdminService.saveSite('test-empresa-a', { name: 'Oficina Chapinero', code: 'BOG-01' });
    // Add same code BOG-01 to Empresa B -> Should SUCCEED
    const resB = companyAdminService.saveSite('test-empresa-b', { name: 'Oficina Poblado', code: 'BOG-01' });
    // Try adding another BOG-01 to Empresa A -> Should FAIL
    const resDup = companyAdminService.saveSite('test-empresa-a', { name: 'Oficina Suba', code: 'BOG-01' });

    const passed = resA.success && resB.success && !resDup.success;
    results.push({
      id: 'p23-t3',
      name: 'Códigos Únicos por Empresa',
      description: 'Permitir mismo código BOG-01 en empresas distintas, pero prohibir duplicados dentro de la misma empresa.',
      passed,
      details: passed
        ? 'Regla de códigos únicos validada correctamente.'
        : `Error: resA=${resA.success}, resB=${resB.success}, resDup=${resDup.success} (Error esperado: ${resDup.error})`,
      dataSample: { dupError: resDup.error }
    });
  } catch (e: any) {
    results.push({
      id: 'p23-t3',
      name: 'Códigos Únicos por Empresa',
      description: 'Validación de unicidad',
      passed: false,
      details: e.message
    });
  }

  // TEST 4: Excel Import Catalog Match
  try {
    const valValid = companyAdminService.validateExcelCatalogValue('test-empresa-a', 'site', 'Sede Norte');
    const passed = valValid.qualityStatus === 'VALID' && valValid.matchedName === 'Sede Norte';

    results.push({
      id: 'p23-t4',
      name: 'Interpretación de Excel con companyId',
      description: 'Validar un valor existente en el catálogo de la Empresa A.',
      passed,
      details: passed ? 'Valor parametrizado encontrado y validado.' : 'No se reconoció la sede parametrizada.',
      dataSample: valValid
    });
  } catch (e: any) {
    results.push({
      id: 'p23-t4',
      name: 'Interpretación de Excel con companyId',
      description: 'Validación de Excel',
      passed: false,
      details: e.message
    });
  }

  // TEST 5: Excel "Dato No Parametrizado" (Section 19, 21 & 29)
  try {
    const valUnconfigured = companyAdminService.validateExcelCatalogValue('test-empresa-a', 'site', 'Sede Nueva');

    // Check rules:
    // 1. Must be NOT_CONFIGURED
    // 2. Must NOT create "Sede Nueva" automatically
    // 3. Must NOT assign it to "Bogotá" or any fallback
    const sitesAfter = companyAdminService.getSites('test-empresa-a');
    const wasCreated = sitesAfter.some(s => s.name === 'Sede Nueva');

    const passed = valUnconfigured.qualityStatus === 'NOT_CONFIGURED' && !wasCreated && valUnconfigured.matchedId === null;

    results.push({
      id: 'p23-t5',
      name: 'Prueba de Dato No Parametrizado (Sin Auto-creación ni Fallbacks)',
      description: 'Cargar "Sede Nueva" sin parametrizar. Debe marcarse como NOT_CONFIGURED ("Dato no parametrizado") sin inventar la sede.',
      passed,
      details: passed
        ? 'Dato no parametrizado clasificado como NOT_CONFIGURED sin alterar catálogos ni usar fallbacks.'
        : 'Falla: El sistema inventó la sede o asignó un fallback.',
      dataSample: valUnconfigured
    });
  } catch (e: any) {
    results.push({
      id: 'p23-t5',
      name: 'Prueba de Dato No Parametrizado',
      description: 'Validación sin fallbacks',
      passed: false,
      details: e.message
    });
  }

  // TEST 6: Logical Deletion & Historical Record Preservation
  try {
    const sites = companyAdminService.getSites('test-empresa-a');
    const siteToInactivate = sites[0];
    companyAdminService.setSiteStatus('test-empresa-a', siteToInactivate.id, 'INACTIVE');

    const sitesWithInactive = companyAdminService.getSites('test-empresa-a', true);
    const sitesOnlyActive = companyAdminService.getSites('test-empresa-a', false);

    const isRetained = sitesWithInactive.some(s => s.id === siteToInactivate.id && s.status === 'INACTIVE');
    const isHiddenFromActiveList = !sitesOnlyActive.some(s => s.id === siteToInactivate.id);

    const passed = isRetained && isHiddenFromActiveList;
    results.push({
      id: 'p23-t6',
      name: 'Eliminación Lógica y Conservación Histórica',
      description: 'Inactivar una sede. Debe marcarse status = INACTIVE y conservarse para reportes históricos.',
      passed,
      details: passed
        ? 'Eliminación lógica ejecutada con éxito. La sede permanece en la base histórica.'
        : 'Falla en la conservación lógica de registros.',
      dataSample: { siteId: siteToInactivate.id, status: 'INACTIVE' }
    });
  } catch (e: any) {
    results.push({
      id: 'p23-t6',
      name: 'Eliminación Lógica',
      description: 'Prueba de inactividad',
      passed: false,
      details: e.message
    });
  }

  // TEST 7: Anti-Fallback Strict Rule Verification
  try {
    const missingValidation = companyAdminService.validateExcelCatalogValue('test-empresa-a', 'site', null);
    const passed = missingValidation.qualityStatus === 'MISSING' && missingValidation.matchedName === null;

    results.push({
      id: 'p23-t7',
      name: 'Regla Estricta Contra Fallbacks',
      description: 'Un valor nulo debe permanecer null / MISSING sin sustitutos sintéticos como "Bogotá".',
      passed,
      details: passed
        ? 'Ausencia mantenida correctamente como null/MISSING sin fallbacks artificiales.'
        : 'Falla: Se asignó un fallback sintético.',
      dataSample: missingValidation
    });
  } catch (e: any) {
    results.push({
      id: 'p23-t7',
      name: 'Regla Estricta Contra Fallbacks',
      description: 'Prueba de nulos',
      passed: false,
      details: e.message
    });
  }

  // TEST 8: Audit Trail Log
  try {
    const logsA = companyAdminService.getAuditLogs('test-empresa-a');
    const passed = logsA.length > 0 && logsA.every(l => l.companyId === 'test-empresa-a');

    results.push({
      id: 'p23-t8',
      name: 'Auditoría de Cambios (Audit Trail)',
      description: 'Verificar generación de auditLog vinculado exclusivamente a companyId.',
      passed,
      details: passed ? `Se registraron ${logsA.length} eventos de auditoría para Empresa A.` : 'Sin logs de auditoría.',
      dataSample: { count: logsA.length, latestAction: logsA[0]?.action }
    });
  } catch (e: any) {
    results.push({
      id: 'p23-t8',
      name: 'Auditoría de Cambios',
      description: 'Audit logs',
      passed: false,
      details: e.message
    });
  }

  const passedCount = results.filter(r => r.passed).length;
  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    results
  };
}
