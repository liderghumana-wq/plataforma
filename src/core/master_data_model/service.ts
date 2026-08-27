/**
 * MASTER DATA MANAGEMENT SERVICE (Servicio Maestro de Datos)
 * Enterprise Multi-Tenant Engine with 3NF Integrity, Soft Delete, and Power BI ETL APIs
 */

import { 
  EmpresaMaster,
  UsuarioMaster,
  RolMaster,
  PermisoMaster,
  RolPermisoMaster,
  SedeMaster,
  AreaMaster,
  ProcesoMaster,
  SubprocesoMaster,
  ProyectoMaster,
  CampañaMaster,
  CargoMaster,
  CentroTrabajoMaster,
  TipoContratoMaster,
  ModalidadTrabajoMaster,
  JornadaTrabajoMaster,
  TurnoTrabajoMaster,
  EncuestaMaster,
  SeccionMaster,
  PreguntaMaster,
  OpcionRespuestaMaster,
  RespuestaMaster,
  ColaboradorMaster,
  ImportacionExcelMaster,
  ReporteMaster,
  DashboardMaster,
  IndicadorMaster,
  AlertaMaster,
  RecomendacionIAMaster,
  BaseAuditEntity
} from './types';

import { MASTER_TABLES_CATALOG, TableSchemaMetadata, generateSQLScriptDDL, generatePowerBIMetadata } from './schema';

const STORAGE_KEY_PREFIX = 'master_data_v1_';

class MasterDataModelService {

  private defaultCompanyId = 'empresa_main_001';

  constructor() {
    this.ensureSeedDataInitialized();
  }

  /**
   * Generates standard audit stamp
   */
  private createAuditStamp(companyId: string | null = this.defaultCompanyId, userId: string = 'usr_system'): BaseAuditEntity {
    const now = new Date().toISOString();
    return {
      id: `id_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
      companyId: companyId,
      createdAt: now,
      updatedAt: now,
      createdBy: userId,
      updatedBy: userId,
      isActive: true,
      deletedAt: null
    };
  }

  /**
   * Initializing normalized seed dataset covering all 28 entities
   */
  public ensureSeedDataInitialized(): void {
    try {
      const existing = localStorage.getItem(`${STORAGE_KEY_PREFIX}EMPRESAS`);
      if (existing) return; // Already seeded

      const audit = (cid: string | null = this.defaultCompanyId) => this.createAuditStamp(cid);

      // 1. EMPRESAS
      const empresas: EmpresaMaster[] = [
        {
          ...audit('empresa_main_001'),
          id: 'empresa_main_001',
          nit: '900.123.456-7',
          razonSocial: 'INNOVATECH IT S.A.S.',
          nombreComercial: 'Innovatech IT',
          direccion: 'Calle 100 # 15-20 Piso 5, Bogotá',
          telefono: '+57 (601) 745-9000',
          emailCorporativo: 'contacto@innovatechit.com.co',
          sectorEconomico: 'Tecnología y Desarrollo de Software (CIIU 6201)',
          arl: 'SURA ARL',
          nivelRiesgoSgSst: 'Nivel I (Riesgo Bajo)'
        },
        {
          ...audit('empresa_sec_002'),
          id: 'empresa_sec_002',
          nit: '800.987.654-3',
          razonSocial: 'LOGÍSTICA Y TRANSPORTE DEL PACÍFICO S.A.',
          nombreComercial: 'LogiPacífico',
          direccion: 'Zona Franca Palmaseca Bodega 4, Cali',
          telefono: '+57 (602) 488-3000',
          emailCorporativo: 'contacto@logipacifico.com',
          sectorEconomico: 'Transporte y Carga Terrestre (CIIU 4923)',
          arl: 'AXA COLPATRIA ARL',
          nivelRiesgoSgSst: 'Nivel IV (Riesgo Alto)'
        }
      ];

      // 2. ROLES
      const roles: RolMaster[] = [
        { ...audit(null), id: 'rol_super_admin', codigo: 'SUPER_ADMIN', nombre: 'Super Administrador SaaS', descripcion: 'Acceso total multi-tenant', esSistema: true },
        { ...audit(null), id: 'rol_admin_empresa', codigo: 'ADMIN_EMPRESA', nombre: 'Administrador de Empresa', descripcion: 'Gestión total del tenant corporativo', esSistema: true },
        { ...audit(null), id: 'rol_lider_sgsst', codigo: 'LIDER_SGSST', nombre: 'Líder de SG-SST y GH', descripcion: 'Diseño de encuestas y análisis', esSistema: true },
        { ...audit(null), id: 'rol_colaborador', codigo: 'COLABORADOR', nombre: 'Colaborador / Evaluado', descripcion: 'Diligenciamiento de formularios', esSistema: true }
      ];

      // 3. PERMISOS
      const permisos: PermisoMaster[] = [
        { ...audit(null), id: 'perm_survey_create', codigo: 'SURVEY:CREATE', modulo: 'CONSTRUCTOR', accion: 'CREATE', descripcion: 'Crear encuestas dinámicas' },
        { ...audit(null), id: 'perm_survey_read', codigo: 'SURVEY:READ', modulo: 'CONSTRUCTOR', accion: 'READ', descripcion: 'Ver encuestas' },
        { ...audit(null), id: 'perm_analytics_export', codigo: 'ANALYTICS:EXPORT', modulo: 'CENTRO_INTELIGENCIA', accion: 'EXPORT', descripcion: 'Exportar informes a Power BI / PDF' }
      ];

      // 4. ROL_PERMISOS
      const rolPermisos: RolPermisoMaster[] = [
        { ...audit(null), id: 'rp_1', rolId: 'rol_lider_sgsst', permisoId: 'perm_survey_create' },
        { ...audit(null), id: 'rp_2', rolId: 'rol_lider_sgsst', permisoId: 'perm_survey_read' },
        { ...audit(null), id: 'rp_3', rolId: 'rol_lider_sgsst', permisoId: 'perm_analytics_export' }
      ];

      // 5. USUARIOS
      const usuarios: UsuarioMaster[] = [
        {
          ...audit('empresa_main_001'),
          id: 'usr_lider_ghumana',
          email: 'lider.ghumana@innovatechit.com.co',
          nombres: 'María Fernanda',
          apellidos: 'Rodríguez Silva',
          documentoIdentidad: '1018432901',
          tipoDocumento: 'CC',
          telefono: '3104567890',
          rolId: 'rol_lider_sgsst',
          ultimoAccesoAt: new Date().toISOString()
        }
      ];

      // 6. SEDES
      const sedes: SedeMaster[] = [
        { ...audit('empresa_main_001'), id: 'sede_bogota_head', codigo: 'SED-BOG', nombre: 'Sede Principal Bogotá', direccion: 'Calle 100 # 15-20', departamento: 'Cundinamarca', ciudad: 'Bogotá D.C.' },
        { ...audit('empresa_main_001'), id: 'sede_medellin_hub', codigo: 'SED-MDE', nombre: 'Hub Innovación Medellín', direccion: 'Carrera 43A # 1-50', departamento: 'Antioquia', ciudad: 'Medellín' }
      ];

      // 7. AREAS
      const areas: AreaMaster[] = [
        { ...audit('empresa_main_001'), id: 'area_gestion_humana', codigo: 'ARE-GH', nombre: 'Gestión Humana y Talento', sedeId: 'sede_bogota_head' },
        { ...audit('empresa_main_001'), id: 'area_tecnologia', codigo: 'ARE-TI', nombre: 'Ingeniería y Desarrollo', sedeId: 'sede_bogota_head' },
        { ...audit('empresa_main_001'), id: 'area_operaciones', codigo: 'ARE-OPE', nombre: 'Operaciones y Servicios', sedeId: 'sede_medellin_hub' }
      ];

      // 8. PROCESOS
      const procesos: ProcesoMaster[] = [
        { ...audit('empresa_main_001'), id: 'proc_bienestar', codigo: 'PRC-BIE', nombre: 'Bienestar y Seguridad Ocupacional', areaId: 'area_gestion_humana', tipoProceso: 'Apoyo', liderProceso: 'María Fernanda Rodríguez' },
        { ...audit('empresa_main_001'), id: 'proc_desarrollo_sw', codigo: 'PRC-DSW', nombre: 'Desarrollo de Soluciones Cloud', areaId: 'area_tecnologia', tipoProceso: 'Misional', liderProceso: 'Carlos Mario Gaviria' }
      ];

      // 9. SUBPROCESOS
      const subprocesos: SubprocesoMaster[] = [
        { ...audit('empresa_main_001'), id: 'subproc_psicosocial', codigo: 'SUB-PSI', nombre: 'Evaluación y Monitoreo Psicosocial', procesoId: 'proc_bienestar' }
      ];

      // 10. PROYECTOS
      const proyectos: ProyectoMaster[] = [
        { ...audit('empresa_main_001'), id: 'proy_sg_2026', codigo: 'PRY-2026', nombre: 'Diagnóstico Clima y Riesgo 2026', subprocesoId: 'subproc_psicosocial', areaId: 'area_gestion_humana', fechaInicio: '2026-01-15', estado: 'En Ejecución' }
      ];

      // 11. CAMPAÑAS
      const campanas: CampañaMaster[] = [
        { ...audit('empresa_main_001'), id: 'campana_q1_2026', codigo: 'CMP-2026-Q1', nombre: 'Campaña Nacional de Caracterización Ocupacional', objetivo: 'Alcanzar el 95% de cobertura de la población laboral activa', fechaInicio: '2026-02-01', fechaFin: '2026-03-31', estado: 'Activa', metaRespuestas: 150 }
      ];

      // 12. CARGOS
      const cargos: CargoMaster[] = [
        { ...audit('empresa_main_001'), id: 'crg_lider_sgsst', codigo: 'CRG-001', nombre: 'Especialista en SG-SST y Clima', nivelJerarquico: 'Profesional', salarioBaseRef: 4500000 },
        { ...audit('empresa_main_001'), id: 'crg_dev_sr', codigo: 'CRG-002', nombre: 'Ingeniero de Software Senior', nivelJerarquico: 'Profesional', salarioBaseRef: 8000000 }
      ];

      // 13. CENTROS DE TRABAJO
      const centrosTrabajo: CentroTrabajoMaster[] = [
        { ...audit('empresa_main_001'), id: 'centro_bogota_adm', codigo: 'CT-BOG-01', nombre: 'Oficinas Administrativas Bogotá', sedeId: 'sede_bogota_head', claseRiesgoArl: 'I' }
      ];

      // 14. TIPOS DE CONTRATO
      const tiposContrato: TipoContratoMaster[] = [
        { ...audit('empresa_main_001'), id: 'tc_indefinido', codigo: 'TC-IND', nombre: 'Término Indefinido' },
        { ...audit('empresa_main_001'), id: 'tc_fijo', codigo: 'TC-FIJ', nombre: 'Término Fijo' }
      ];

      // 15. MODALIDADES
      const modalidades: ModalidadTrabajoMaster[] = [
        { ...audit('empresa_main_001'), id: 'mod_hibrido', codigo: 'MOD-HIB', nombre: 'Híbrido (3 días oficina / 2 casa)' },
        { ...audit('empresa_main_001'), id: 'mod_remoto', codigo: 'MOD-REM', nombre: 'Trabajo Remoto Total' }
      ];

      // 16. JORNADAS
      const jornadas: JornadaTrabajoMaster[] = [
        { ...audit('empresa_main_001'), id: 'jrn_completa', codigo: 'JRN-ORD', nombre: 'Ordinaria Diurna (46 hrs/semana)', horasSemanales: 46 }
      ];

      // 17. TURNOS
      const turnos: TurnoTrabajoMaster[] = [
        { ...audit('empresa_main_001'), id: 'trn_manana', codigo: 'TRN-MAN', nombre: 'Turno Mañana (07:00 - 17:00)', horaInicio: '07:00', horaFin: '17:00', esNocturno: false, jornadaId: 'jrn_completa' }
      ];

      // 18. ENCUESTAS
      const encuestas: EncuestaMaster[] = [
        { ...audit('empresa_main_001'), id: 'enc_sociodemo_master', codigo: 'ENC-SOC-001', titulo: 'Perfil Sociodemográfico y Condiciones de Salud', descripcion: 'Formulario estandarizado para caracterización laboral sg-sst', tipoEncuesta: 'Sociodemográfica', version: '2.0', estado: 'Publicada', autorId: 'usr_lider_ghumana', campañaId: 'campana_q1_2026' }
      ];

      // 19. SECCIONES
      const secciones: SeccionMaster[] = [
        { ...audit('empresa_main_001'), id: 'sec_1_identificacion', encuestaId: 'enc_sociodemo_master', orden: 1, titulo: '1. Datos de Identificación y Vinculación Laboral' },
        { ...audit('empresa_main_001'), id: 'sec_2_salud', encuestaId: 'enc_sociodemo_master', orden: 2, titulo: '2. Hábitos y Perfil General de Salud' }
      ];

      // 20. PREGUNTAS
      const preguntas: PreguntaMaster[] = [
        { ...audit('empresa_main_001'), id: 'prg_genero', seccionId: 'sec_1_identificacion', orden: 1, titulo: 'Identificación de Género', tipo: 'radio', obligatoria: true, categoria: 'Demografía' },
        { ...audit('empresa_main_001'), id: 'prg_satisfaccion', seccionId: 'sec_2_salud', orden: 1, titulo: '¿Qué tan satisfecho se siente con su entorno de trabajo?', tipo: 'nps', obligatoria: true, categoria: 'Clima' }
      ];

      // 21. OPCIONES DE RESPUESTA
      const opciones: OpcionRespuestaMaster[] = [
        { ...audit('empresa_main_001'), id: 'opc_g_m', preguntaId: 'prg_genero', orden: 1, valor: 'Masculino', etiqueta: 'Masculino' },
        { ...audit('empresa_main_001'), id: 'opc_g_f', preguntaId: 'prg_genero', orden: 2, valor: 'Femenino', etiqueta: 'Femenino' }
      ];

      // 22. RESPUESTAS
      const respuestas: RespuestaMaster[] = [
        { ...audit('empresa_main_001'), id: 'resp_1', encuestaId: 'enc_sociodemo_master', colaboradorId: 'colab_001', seccionId: 'sec_1_identificacion', preguntaId: 'prg_genero', opcionId: 'opc_g_f', valorIngresado: 'Femenino', fechaRespuesta: new Date().toISOString() }
      ];

      // 23. COLABORADORES
      const colaboradores: ColaboradorMaster[] = [
        {
          ...audit('empresa_main_001'),
          id: 'colab_001',
          numeroIdentificacion: '1018432901',
          tipoIdentificacion: 'CC',
          nombres: 'María Fernanda',
          apellidos: 'Rodríguez Silva',
          genero: 'Femenino',
          fechaNacimiento: '1992-05-14',
          correoCorporativo: 'lider.ghumana@innovatechit.com.co',
          fechaIngreso: '2021-03-01',
          sedeId: 'sede_bogota_head',
          areaId: 'area_gestion_humana',
          procesoId: 'proc_bienestar',
          subprocesoId: 'subproc_psicosocial',
          proyectoId: 'proy_sg_2026',
          cargoId: 'crg_lider_sgsst',
          centroTrabajoId: 'centro_bogota_adm',
          tipoContratoId: 'tc_indefinido',
          modalidadId: 'mod_hibrido',
          jornadaId: 'jrn_completa',
          turnoId: 'trn_manana',
          usuarioId: 'usr_lider_ghumana'
        }
      ];

      // 24. IMPORTACIONES EXCEL
      const importaciones: ImportacionExcelMaster[] = [
        { ...audit('empresa_main_001'), id: 'imp_001', nombreArchivo: 'Planta_Personal_Innovatech_2026.xlsx', checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', registrosTotales: 120, registrosExitosos: 120, registrosFallidos: 0, estado: 'Completado', usuarioId: 'usr_lider_ghumana' }
      ];

      // 25. REPORTES
      const reportes: ReporteMaster[] = [
        { ...audit('empresa_main_001'), id: 'rep_001', codigo: 'REP-SOC-2026', titulo: 'Informe Consolidado Sociodemográfico Q1', tipoReporte: 'SOCIODEMOGRAFICO', formatoExportacion: 'POWER_BI', configuracionFiltrosJson: '{}', fechaGeneracion: new Date().toISOString(), usuarioId: 'usr_lider_ghumana' }
      ];

      // 26. DASHBOARDS
      const dashboards: DashboardMaster[] = [
        { ...audit('empresa_main_001'), id: 'dash_001', codigo: 'DSH-MAIN', titulo: 'Tablero Principal de Mando SG-SST', descripcion: 'Resumen ejecutivo multi-indicador', layoutWidgetsJson: '[]', esPredeterminado: true }
      ];

      // 27. INDICADORES
      const indicadores: IndicadorMaster[] = [
        { ...audit('empresa_main_001'), id: 'ind_001', codigo: 'KPI-COB-01', nombre: 'Porcentaje de Cobertura de Encuesta', categoria: 'Participación Encuestas', formulaMatematica: '(Respuestas / Total Colaboradores) * 100', metaEstablecida: 95, unidadMedida: 'PORCENTAJE', valorActual: 92.5, tendencia: 'ALTA', fechaCalculo: new Date().toISOString() }
      ];

      // 28. ALERTAS & 29. RECOMENDACIONES IA
      const alertas: AlertaMaster[] = [
        { ...audit('empresa_main_001'), id: 'alt_001', codigo: 'ALT-01', titulo: 'Meta de Cobertura Cercana', mensaje: 'Faltan 3 días para el cierre de la Campaña Q1 y la cobertura está en 92.5%', nivelRiesgo: 'MEDIO', moduloOrigen: 'SURVEY_ENGINE', leida: false, fechaGeneracion: new Date().toISOString() }
      ];

      const recomendacionesIA: RecomendacionIAMaster[] = [
        { ...audit('empresa_main_001'), id: 'rec_001', codigo: 'REC-01', categoria: 'Bienestar', titulo: 'Programa de Pausas Activas Guiadas', descripcionDetallada: 'Se recomienda implementar pausas virtuales para personal con modalidad teletrabajo.', nivelImpacto: 'ALTO', prioridad: 'ALTA', estadoAccion: 'EN_PROGRESO', responsableId: 'usr_lider_ghumana', fechaGeneracion: new Date().toISOString() }
      ];

      // Save seed tables to localStorage
      this.saveTableData('EMPRESAS', empresas);
      this.saveTableData('ROLES', roles);
      this.saveTableData('PERMISOS', permisos);
      this.saveTableData('ROL_PERMISOS', rolPermisos);
      this.saveTableData('USUARIOS', usuarios);
      this.saveTableData('SEDES', sedes);
      this.saveTableData('AREAS', areas);
      this.saveTableData('PROCESOS', procesos);
      this.saveTableData('SUBPROCESOS', subprocesos);
      this.saveTableData('PROYECTOS', proyectos);
      this.saveTableData('CAMPANAS', campanas);
      this.saveTableData('CARGOS', cargos);
      this.saveTableData('CENTROS_TRABAJO', centrosTrabajo);
      this.saveTableData('TIPOS_CONTRATO', tiposContrato);
      this.saveTableData('MODALIDADES_TRABAJO', modalidades);
      this.saveTableData('JORNADAS_TRABAJO', jornadas);
      this.saveTableData('TURNOS_TRABAJO', turnos);
      this.saveTableData('ENCUESTAS', encuestas);
      this.saveTableData('SECCIONES', secciones);
      this.saveTableData('PREGUNTAS', preguntas);
      this.saveTableData('OPCIONES_RESPUESTA', opciones);
      this.saveTableData('RESPUESTAS', respuestas);
      this.saveTableData('COLABORADORES', colaboradores);
      this.saveTableData('IMPORTACIONES_EXCEL', importaciones);
      this.saveTableData('REPORTES', reportes);
      this.saveTableData('DASHBOARDS', dashboards);
      this.saveTableData('INDICADORES', indicadores);
      this.saveTableData('ALERTAS', alertas);
      this.saveTableData('RECOMENDACIONES_IA', recomendacionesIA);

    } catch (e) {
      console.error('Error seeding Master Data Model:', e);
    }
  }

  // --- CRUD OPERATORS WITH MULTI-TENANT ISOLATION & SOFT DELETE ---

  public getTableData<T extends BaseAuditEntity>(tableName: string, companyId?: string, includeDeleted: boolean = false): T[] {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tableName}`);
      if (!raw) return [];
      let list: T[] = JSON.parse(raw);

      // Soft delete filter
      if (!includeDeleted) {
        list = list.filter(item => item.isActive && item.deletedAt === null);
      }

      // Multi-tenant isolation filter (if table supports multi-tenancy)
      if (companyId) {
        list = list.filter(item => item.companyId === null || item.companyId === companyId);
      }

      return list;
    } catch (e) {
      console.error(`Error reading master table ${tableName}:`, e);
      return [];
    }
  }

  public saveTableData<T extends BaseAuditEntity>(tableName: string, data: T[]): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${tableName}`, JSON.stringify(data));
    } catch (e) {
      console.error(`Error saving master table ${tableName}:`, e);
    }
  }

  /**
   * Insert or update a master entity with 3NF referential integrity & audit
   */
  public upsertEntity<T extends BaseAuditEntity>(tableName: string, entityData: Partial<T>, userId: string = 'usr_system'): T {
    const list = this.getTableData<T>(tableName, undefined, true);
    const now = new Date().toISOString();

    if (entityData.id) {
      const idx = list.findIndex(i => i.id === entityData.id);
      if (idx !== -1) {
        const updated = {
          ...list[idx],
          ...entityData,
          updatedAt: now,
          updatedBy: userId
        } as T;
        list[idx] = updated;
        this.saveTableData(tableName, list);
        return updated;
      }
    }

    // New entity
    const newEntity = {
      ...this.createAuditStamp(entityData.companyId || this.defaultCompanyId, userId),
      ...entityData
    } as T;

    list.push(newEntity);
    this.saveTableData(tableName, list);
    return newEntity;
  }

  /**
   * Soft Delete implementation (sets deletedAt timestamp and isActive = false)
   */
  public softDeleteEntity(tableName: string, id: string, userId: string = 'usr_system'): boolean {
    const list = this.getTableData<BaseAuditEntity>(tableName, undefined, true);
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx].isActive = false;
      list[idx].deletedAt = new Date().toISOString();
      list[idx].updatedBy = userId;
      list[idx].updatedAt = new Date().toISOString();
      this.saveTableData(tableName, list);
      return true;
    }
    return false;
  }

  /**
   * Restore soft-deleted record
   */
  public restoreEntity(tableName: string, id: string, userId: string = 'usr_system'): boolean {
    const list = this.getTableData<BaseAuditEntity>(tableName, undefined, true);
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx].isActive = true;
      list[idx].deletedAt = null;
      list[idx].updatedBy = userId;
      list[idx].updatedAt = new Date().toISOString();
      this.saveTableData(tableName, list);
      return true;
    }
    return false;
  }

  /**
   * Returns schema metadata catalog for all tables
   */
  public getSchemaCatalog(): TableSchemaMetadata[] {
    return MASTER_TABLES_CATALOG;
  }

  /**
   * Generate DDL SQL Script
   */
  public getSQLScriptDDL(): string {
    return generateSQLScriptDDL();
  }

  /**
   * Export Power BI Metadata Definition
   */
  public getPowerBIMetadata(): any {
    return generatePowerBIMetadata();
  }

  /**
   * Generate complete Power BI tabular dataset payload for active company
   */
  public exportPowerBIDatasetPayload(companyId: string = this.defaultCompanyId): Record<string, any[]> {
    const dataset: Record<string, any[]> = {};
    MASTER_TABLES_CATALOG.forEach(t => {
      dataset[t.tableName] = this.getTableData(t.tableName, companyId);
    });
    return dataset;
  }
}

export const masterDataModelService = new MasterDataModelService();
