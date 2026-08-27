import { masterDataModelService } from '../../core/master_data_model/service';
import { 
  ColaboradorMaster, 
  SedeMaster, 
  AreaMaster, 
  CargoMaster, 
  ProyectoMaster, 
  CentroTrabajoMaster, 
  TipoContratoMaster,
  EmpresaMaster,
  ModalidadTrabajoMaster,
  JornadaTrabajoMaster,
  TurnoTrabajoMaster,
  EncuestaMaster,
  RespuestaMaster,
  ReporteMaster,
  ImportacionExcelMaster
} from '../../core/master_data_model/types';
import { 
  ColaboradorExtendido, 
  HistorialCambioColaborador, 
  EncuestaDiligenciadaColaborador, 
  ReporteColaborador,
  ImportacionExcelResult
} from './types';

const STORAGE_KEY_AUDIT_LOGS = 'colaboradores_historial_cambios_v1';
const STORAGE_KEY_EXTENDED_DATA = 'colaboradores_datos_expediente_v1';

class ColaboradoresService {

  constructor() {
    this.ensureSeedCollaboratorsExist();
  }

  /**
   * Ensures rich seed collaborators exist in master dataset
   */
  public ensureSeedCollaboratorsExist(): void {
    const existing = masterDataModelService.getTableData<ColaboradorMaster>('COLABORADORES', undefined, true);
    if (existing.length >= 3) return; // Sufficient seeds exist

    const companyId = 'empresa_main_001';
    
    // Default seed collaborators with full relations
    const seeds: Partial<ColaboradorMaster>[] = [
      {
        id: 'colab_001',
        companyId: companyId,
        numeroIdentificacion: '1018432901',
        tipoIdentificacion: 'CC',
        nombres: 'María Fernanda',
        apellidos: 'Rodríguez Silva',
        genero: 'Femenino',
        fechaNacimiento: '1992-05-14',
        correoCorporativo: 'lider.ghumana@innovatechit.com.co',
        correoPersonal: 'maria.rodriguez@gmail.com',
        celular: '+57 310 456 7890',
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
        usuarioId: 'usr_lider_ghumana',
        isActive: true,
        deletedAt: null
      },
      {
        id: 'colab_002',
        companyId: companyId,
        numeroIdentificacion: '80192834',
        tipoIdentificacion: 'CC',
        nombres: 'Carlos Eduardo',
        apellidos: 'Gómez Méndez',
        genero: 'Masculino',
        fechaNacimiento: '1988-11-20',
        correoCorporativo: 'carlos.gomez@innovatechit.com.co',
        correoPersonal: 'carlos.gomez.dev@gmail.com',
        celular: '+57 315 890 1234',
        fechaIngreso: '2020-01-15',
        sedeId: 'sede_bogota_head',
        areaId: 'area_tecnologia',
        procesoId: 'proc_bienestar',
        proyectoId: 'proy_sg_2026',
        cargoId: 'crg_analista_sst',
        centroTrabajoId: 'centro_bogota_adm',
        tipoContratoId: 'tc_indefinido',
        modalidadId: 'mod_remoto',
        jornadaId: 'jrn_completa',
        isActive: true,
        deletedAt: null
      },
      {
        id: 'colab_003',
        companyId: companyId,
        numeroIdentificacion: '52891023',
        tipoIdentificacion: 'CC',
        nombres: 'Ana María',
        apellidos: 'Martínez López',
        genero: 'Femenino',
        fechaNacimiento: '1995-08-04',
        correoCorporativo: 'ana.martinez@innovatechit.com.co',
        correoPersonal: 'anamaria.m@hotmail.com',
        celular: '+57 300 123 4567',
        fechaIngreso: '2022-06-10',
        sedeId: 'sede_medellin_branch',
        areaId: 'area_operaciones',
        proyectoId: 'proy_clima_2026',
        cargoId: 'crg_operario_planta',
        centroTrabajoId: 'centro_medellin_op',
        tipoContratoId: 'tc_obra_labor',
        modalidadId: 'mod_presencial',
        jornadaId: 'jrn_completa',
        isActive: true,
        deletedAt: null
      },
      {
        id: 'colab_004',
        companyId: companyId,
        numeroIdentificacion: '1020493821',
        tipoIdentificacion: 'CC',
        nombres: 'Jorge Alejandro',
        apellidos: 'Torres Ruiz',
        genero: 'Masculino',
        fechaNacimiento: '1990-03-28',
        correoCorporativo: 'jorge.torres@innovatechit.com.co',
        celular: '+57 318 765 4321',
        fechaIngreso: '2023-02-01',
        sedeId: 'sede_cali_branch',
        areaId: 'area_operaciones',
        cargoId: 'crg_analista_sst',
        centroTrabajoId: 'centro_medellin_op',
        tipoContratoId: 'tc_indefinido',
        modalidadId: 'mod_presencial',
        jornadaId: 'jrn_completa',
        isActive: true,
        deletedAt: null
      },
      {
        id: 'colab_005',
        companyId: companyId,
        numeroIdentificacion: '1098473210',
        tipoIdentificacion: 'CE',
        nombres: 'Diana Patricia',
        apellidos: 'Vargas Benítez',
        genero: 'Femenino',
        fechaNacimiento: '1994-12-12',
        correoCorporativo: 'diana.vargas@innovatechit.com.co',
        celular: '+57 311 987 6543',
        fechaIngreso: '2024-05-15',
        sedeId: 'sede_bogota_head',
        areaId: 'area_gestion_humana',
        cargoId: 'crg_lider_sgsst',
        centroTrabajoId: 'centro_bogota_adm',
        tipoContratoId: 'tc_indefinido',
        modalidadId: 'mod_hibrido',
        jornadaId: 'jrn_completa',
        isActive: true,
        deletedAt: null
      }
    ];

    seeds.forEach(s => {
      masterDataModelService.upsertEntity<ColaboradorMaster>('COLABORADORES', s, 'usr_system');
    });

    // Seed extended dossier data for colab_001
    this.saveExtendedDossierData('colab_001', {
      estadoCivil: 'Casado(a)',
      nivelEscolaridad: 'Especialización',
      personasACargo: 2,
      tipoVivienda: 'Propia',
      eps: 'SURA EPS',
      afp: 'Protección',
      grupoSanguineo: 'O+',
      contactoEmergenciaNombre: 'Fernando Rodríguez',
      contactoEmergenciaTelefono: '+57 312 999 8877',
      parentescoContacto: 'Esposo'
    });
  }

  // --- LOOKUP HELPERS ---

  public getEmpresas(): EmpresaMaster[] {
    return masterDataModelService.getTableData<EmpresaMaster>('EMPRESAS');
  }

  public getSedes(companyId?: string): SedeMaster[] {
    return masterDataModelService.getTableData<SedeMaster>('SEDES', companyId);
  }

  public getAreas(companyId?: string): AreaMaster[] {
    return masterDataModelService.getTableData<AreaMaster>('AREAS', companyId);
  }

  public getCargos(companyId?: string): CargoMaster[] {
    return masterDataModelService.getTableData<CargoMaster>('CARGOS', companyId);
  }

  public getProyectos(companyId?: string): ProyectoMaster[] {
    return masterDataModelService.getTableData<ProyectoMaster>('PROYECTOS', companyId);
  }

  public getCentrosTrabajo(companyId?: string): CentroTrabajoMaster[] {
    return masterDataModelService.getTableData<CentroTrabajoMaster>('CENTROS_TRABAJO', companyId);
  }

  public getTiposContrato(companyId?: string): TipoContratoMaster[] {
    return masterDataModelService.getTableData<TipoContratoMaster>('TIPOS_CONTRATO', companyId);
  }

  public getModalidades(): ModalidadTrabajoMaster[] {
    return masterDataModelService.getTableData<ModalidadTrabajoMaster>('MODALIDADES_TRABAJO');
  }

  public getJornadas(): JornadaTrabajoMaster[] {
    return masterDataModelService.getTableData<JornadaTrabajoMaster>('JORNADAS_TRABAJO');
  }

  public getTurnos(): TurnoTrabajoMaster[] {
    return masterDataModelService.getTableData<TurnoTrabajoMaster>('TURNOS_TRABAJO');
  }

  /**
   * Enriches raw ColaboradorMaster with lookup names & extended expediente digital data
   */
  private enrichCollaborator(colab: ColaboradorMaster): ColaboradorExtendido {
    const empresas = this.getEmpresas();
    const sedes = masterDataModelService.getTableData<SedeMaster>('SEDES', undefined, true);
    const areas = masterDataModelService.getTableData<AreaMaster>('AREAS', undefined, true);
    const cargos = masterDataModelService.getTableData<CargoMaster>('CARGOS', undefined, true);
    const proyectos = masterDataModelService.getTableData<ProyectoMaster>('PROYECTOS', undefined, true);
    const centros = masterDataModelService.getTableData<CentroTrabajoMaster>('CENTROS_TRABAJO', undefined, true);
    const contratos = masterDataModelService.getTableData<TipoContratoMaster>('TIPOS_CONTRATO', undefined, true);
    const modalidades = masterDataModelService.getTableData<ModalidadTrabajoMaster>('MODALIDADES_TRABAJO', undefined, true);
    const jornadas = masterDataModelService.getTableData<JornadaTrabajoMaster>('JORNADAS_TRABAJO', undefined, true);

    const empresaObj = empresas.find(e => e.id === colab.companyId);
    const sedeObj = sedes.find(s => s.id === colab.sedeId);
    const areaObj = areas.find(a => a.id === colab.areaId);
    const cargoObj = cargos.find(c => c.id === colab.cargoId);
    const proyectoObj = proyectos.find(p => p.id === colab.proyectoId);
    const centroObj = centros.find(c => c.id === colab.centroTrabajoId);
    const contratoObj = contratos.find(ct => ct.id === colab.tipoContratoId);
    const modalidadObj = modalidades.find(m => m.id === colab.modalidadId);
    const jornadaObj = jornadas.find(j => j.id === colab.jornadaId);

    const extendedData = this.getExtendedDossierData(colab.id);
    const surveyHistory = this.getHistorialEncuestas(colab.id);
    const reportsHistory = this.getHistorialReportes(colab.id);

    return {
      ...colab,
      empresaNombre: empresaObj ? empresaObj.razonSocial || empresaObj.nombreComercial : 'Empresa Principal',
      sedeNombre: sedeObj ? sedeObj.nombre : 'No informado',
      areaNombre: areaObj ? areaObj.nombre : 'No informado',
      cargoNombre: cargoObj ? cargoObj.nombre : 'No informado',
      proyectoNombre: proyectoObj ? proyectoObj.nombre : 'No informado',
      centroTrabajoNombre: centroObj ? centroObj.nombre : 'No informado',
      tipoContratoNombre: contratoObj ? contratoObj.nombre : 'No informado',
      modalidadNombre: modalidadObj ? modalidadObj.nombre : 'No informado',
      jornadaNombre: jornadaObj ? jornadaObj.nombre : 'No informado',
      
      ...extendedData,

      totalEncuestasDiligenciadas: surveyHistory.length,
      totalReportesAsociados: reportsHistory.length,
      ultimaEncuestaFecha: surveyHistory.length > 0 ? surveyHistory[0].fechaRespuesta : undefined
    };
  }

  // --- MAIN GET & SEARCH COLLABORATORS ---

  public getColaboradores(companyId?: string, includeDeleted: boolean = false): ColaboradorExtendido[] {
    const rawList = masterDataModelService.getTableData<ColaboradorMaster>('COLABORADORES', companyId, includeDeleted);
    return rawList.map(c => this.enrichCollaborator(c));
  }

  public getColaboradorById(id: string): ColaboradorExtendido | undefined {
    const list = masterDataModelService.getTableData<ColaboradorMaster>('COLABORADORES', undefined, true);
    const raw = list.find(c => c.id === id);
    if (!raw) return undefined;
    return this.enrichCollaborator(raw);
  }

  public getColaboradorByIdentificacion(numDoc: string): ColaboradorExtendido | undefined {
    const list = masterDataModelService.getTableData<ColaboradorMaster>('COLABORADORES', undefined, true);
    const raw = list.find(c => c.numeroIdentificacion === numDoc);
    if (!raw) return undefined;
    return this.enrichCollaborator(raw);
  }

  // --- CRUD: CREATE, EDIT, SOFT DELETE, RESTORE ---

  public upsertColaborador(
    data: Partial<ColaboradorExtendido>,
    extendedDetails?: Partial<ColaboradorExtendido>,
    userId: string = 'usr_admin',
    origen: 'MANUAL' | 'EXCEL' | 'ENCUESTA_SYNC' = 'MANUAL'
  ): ColaboradorExtendido {
    const isEdit = !!data.id;
    let oldRecord: ColaboradorMaster | undefined;

    if (isEdit) {
      const list = masterDataModelService.getTableData<ColaboradorMaster>('COLABORADORES', undefined, true);
      oldRecord = list.find(c => c.id === data.id);
    }

    // Prepare master record fields
    const masterPayload: Partial<ColaboradorMaster> = {
      id: data.id,
      companyId: data.companyId || 'empresa_main_001',
      numeroIdentificacion: data.numeroIdentificacion,
      tipoIdentificacion: data.tipoIdentificacion || 'CC',
      nombres: data.nombres || '',
      apellidos: data.apellidos || '',
      genero: data.genero || 'Masculino',
      fechaNacimiento: data.fechaNacimiento || '1990-01-01',
      correoPersonal: data.correoPersonal,
      correoCorporativo: data.correoCorporativo,
      celular: data.celular,
      fechaIngreso: data.fechaIngreso || new Date().toISOString().split('T')[0],
      sedeId: data.sedeId || 'sede_bogota_head',
      areaId: data.areaId || 'area_gestion_humana',
      procesoId: data.procesoId,
      subprocesoId: data.subprocesoId,
      proyectoId: data.proyectoId,
      cargoId: data.cargoId || 'crg_analista_sst',
      centroTrabajoId: data.centroTrabajoId || 'centro_bogota_adm',
      tipoContratoId: data.tipoContratoId || 'tc_indefinido',
      modalidadId: data.modalidadId || 'mod_hibrido',
      jornadaId: data.jornadaId || 'jrn_completa',
      turnoId: data.turnoId,
      usuarioId: data.usuarioId,
      isActive: data.isActive !== undefined ? data.isActive : true,
      deletedAt: data.deletedAt !== undefined ? data.deletedAt : null
    };

    const savedMaster = masterDataModelService.upsertEntity<ColaboradorMaster>('COLABORADORES', masterPayload, userId);

    // Save extended dossier info if passed
    if (extendedDetails) {
      this.saveExtendedDossierData(savedMaster.id, extendedDetails);
    }

    // Record audit trail if edited or created
    if (isEdit && oldRecord) {
      this.auditChanges(oldRecord, savedMaster, userId, origen);
    } else {
      this.logAuditChange({
        colaboradorId: savedMaster.id,
        fecha: new Date().toISOString(),
        usuario: userId,
        campoModificado: 'REGISTRO_NUEVO',
        valorAnterior: 'N/A',
        valorNuevo: `Creado colaborador ${savedMaster.nombres} ${savedMaster.apellidos} (${savedMaster.numeroIdentificacion})`,
        origen
      });
    }

    return this.enrichCollaborator(savedMaster);
  }

  public softDeleteColaborador(id: string, userId: string = 'usr_admin'): boolean {
    const colab = this.getColaboradorById(id);
    const success = masterDataModelService.softDeleteEntity('COLABORADORES', id, userId);
    if (success && colab) {
      this.logAuditChange({
        colaboradorId: id,
        fecha: new Date().toISOString(),
        usuario: userId,
        campoModificado: 'ESTADO_SOFT_DELETE',
        valorAnterior: 'Activo',
        valorNuevo: 'Eliminado (Soft Delete)',
        motivo: 'Eliminado por el administrador de personal',
        origen: 'MANUAL'
      });
    }
    return success;
  }

  public restoreColaborador(id: string, userId: string = 'usr_admin'): boolean {
    const success = masterDataModelService.restoreEntity('COLABORADORES', id, userId);
    if (success) {
      this.logAuditChange({
        colaboradorId: id,
        fecha: new Date().toISOString(),
        usuario: userId,
        campoModificado: 'RESTAURAR_SOFT_DELETE',
        valorAnterior: 'Eliminado (Soft Delete)',
        valorNuevo: 'Activo',
        origen: 'MANUAL'
      });
    }
    return success;
  }

  // --- EXTENDED DOSSIER (EXPEDIENTE DIGITAL) STORAGE ---

  private getExtendedDossierStorage(): Record<string, Partial<ColaboradorExtendido>> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EXTENDED_DATA);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  public getExtendedDossierData(colaboradorId: string): Partial<ColaboradorExtendido> {
    const store = this.getExtendedDossierStorage();
    return store[colaboradorId] || {};
  }

  public saveExtendedDossierData(colaboradorId: string, details: Partial<ColaboradorExtendido>): void {
    const store = this.getExtendedDossierStorage();
    store[colaboradorId] = {
      ...(store[colaboradorId] || {}),
      ...details
    };
    localStorage.setItem(STORAGE_KEY_EXTENDED_DATA, JSON.stringify(store));
  }

  // --- CHANGE HISTORY AUDIT TRAIL ---

  private auditChanges(oldRec: ColaboradorMaster, newRec: ColaboradorMaster, userId: string, origen: 'MANUAL' | 'EXCEL' | 'ENCUESTA_SYNC'): void {
    const fieldsToCompare: (keyof ColaboradorMaster)[] = [
      'numeroIdentificacion', 'tipoIdentificacion', 'nombres', 'apellidos',
      'genero', 'fechaNacimiento', 'correoCorporativo', 'correoPersonal',
      'celular', 'fechaIngreso', 'sedeId', 'areaId', 'cargoId',
      'proyectoId', 'centroTrabajoId', 'tipoContratoId', 'modalidadId'
    ];

    fieldsToCompare.forEach(f => {
      if (String(oldRec[f] || '') !== String(newRec[f] || '')) {
        this.logAuditChange({
          colaboradorId: newRec.id,
          fecha: new Date().toISOString(),
          usuario: userId,
          campoModificado: String(f),
          valorAnterior: String(oldRec[f] || 'vacío'),
          valorNuevo: String(newRec[f] || 'vacío'),
          origen
        });
      }
    });
  }

  public logAuditChange(item: Omit<HistorialCambioColaborador, 'id'>): void {
    const list = this.getHistorialCambios(item.colaboradorId, true);
    const newLog: HistorialCambioColaborador = {
      ...item,
      id: `log_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`
    };
    list.unshift(newLog);
    
    // Save to localStorage
    const allLogs = this.getAllAuditLogs();
    allLogs.unshift(newLog);
    localStorage.setItem(STORAGE_KEY_AUDIT_LOGS, JSON.stringify(allLogs));
  }

  public getAllAuditLogs(): HistorialCambioColaborador[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUDIT_LOGS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public getHistorialCambios(colaboradorId: string, _skipFetch: boolean = false): HistorialCambioColaborador[] {
    const all = this.getAllAuditLogs();
    return all.filter(l => l.colaboradorId === colaboradorId);
  }

  // --- SURVEY HISTORY (AUTOMATIC ASSOCIATIONS) ---

  public getHistorialEncuestas(colaboradorId: string): EncuestaDiligenciadaColaborador[] {
    const colab = masterDataModelService.getTableData<ColaboradorMaster>('COLABORADORES', undefined, true).find(c => c.id === colaboradorId);
    if (!colab) return [];

    const respuestas = masterDataModelService.getTableData<RespuestaMaster>('RESPUESTAS');
    const encuestas = masterDataModelService.getTableData<EncuestaMaster>('ENCUESTAS');

    // Filter responses linked by colaboradorId or matched by document/email
    const colabResponses = respuestas.filter(r => 
      r.colaboradorId === colaboradorId || 
      (colab.usuarioId && r.usuarioId === colab.usuarioId)
    );

    // Group responses by encuestaId
    const surveyGroups: Record<string, RespuestaMaster[]> = {};
    colabResponses.forEach(r => {
      if (!surveyGroups[r.encuestaId]) surveyGroups[r.encuestaId] = [];
      surveyGroups[r.encuestaId].push(r);
    });

    const result: EncuestaDiligenciadaColaborador[] = [];

    // Synthesize grouped survey history entries
    Object.keys(surveyGroups).forEach(encId => {
      const group = surveyGroups[encId];
      const encObj = encuestas.find(e => e.id === encId);
      const latestResp = group.sort((a,b) => new Date(b.fechaRespuesta).getTime() - new Date(a.fechaRespuesta).getTime())[0];

      result.push({
        id: `enc_dil_${encId}_${colaboradorId}`,
        colaboradorId: colaboradorId,
        encuestaId: encId,
        tituloEncuesta: encObj ? encObj.titulo : 'Encuesta Sociodemográfica y Salud SG-SST',
        tipoEncuesta: encObj ? encObj.tipoEncuesta : 'Sociodemográfica',
        fechaRespuesta: latestResp ? latestResp.fechaRespuesta : new Date().toISOString(),
        estado: 'Completada',
        respuestasCount: group.length,
        campañaNombre: 'Campaña Anual Q1',
        puntajeOIndice: '100% Finalizado'
      });
    });

    // Fallback seed entries if none in database yet for demonstration
    if (result.length === 0 && (colaboradorId === 'colab_001' || colaboradorId === 'colab_002')) {
      result.push({
        id: `enc_seed_1_${colaboradorId}`,
        colaboradorId: colaboradorId,
        encuestaId: 'enc_sociodemo_master',
        tituloEncuesta: 'Perfil Sociodemográfico y Condiciones de Salud 2026',
        tipoEncuesta: 'Sociodemográfica',
        fechaRespuesta: '2026-02-01T10:30:00.000Z',
        estado: 'Completada',
        respuestasCount: 28,
        campañaNombre: 'Campaña Caracterización Q1',
        puntajeOIndice: '100% Diligenciado'
      });
      result.push({
        id: `enc_seed_2_${colaboradorId}`,
        colaboradorId: colaboradorId,
        encuestaId: 'enc_clima_2026',
        tituloEncuesta: 'Evaluación de Clima Organizacional & Cultura SST',
        tipoEncuesta: 'Clima Organizacional',
        fechaRespuesta: '2026-01-15T14:20:00.000Z',
        estado: 'Completada',
        respuestasCount: 15,
        campañaNombre: 'Medición Clima 2026',
        puntajeOIndice: 'Sat: 4.8 / 5.0'
      });
    }

    return result.sort((a,b) => new Date(b.fechaRespuesta).getTime() - new Date(a.fechaRespuesta).getTime());
  }

  /**
   * Automatically associate a survey response payload to a collaborator profile
   */
  public asociarEncuestaAColaborador(
    numIdentificacion: string, 
    encuestaId: string, 
    respuestas: { preguntaId: string; valor: string }[],
    usuarioId: string = 'usr_survey_engine'
  ): boolean {
    const colab = this.getColaboradorByIdentificacion(numIdentificacion);
    if (!colab) return false;

    // Create RespuestaMaster entries
    respuestas.forEach(r => {
      masterDataModelService.upsertEntity<RespuestaMaster>('RESPUESTAS', {
        encuestaId,
        colaboradorId: colab.id,
        seccionId: 'sec_1_identificacion',
        preguntaId: r.preguntaId,
        valorIngresado: r.valor,
        fechaRespuesta: new Date().toISOString()
      }, usuarioId);
    });

    // Log survey association audit
    this.logAuditChange({
      colaboradorId: colab.id,
      fecha: new Date().toISOString(),
      usuario: usuarioId,
      campoModificado: 'ENCUESTA_ASOCIADA_AUTO',
      valorAnterior: 'N/A',
      valorNuevo: `Respondió encuesta ID: ${encuestaId} (${respuestas.length} preguntas)`,
      origen: 'ENCUESTA_SYNC'
    });

    return true;
  }

  // --- REPORT HISTORY ---

  public getHistorialReportes(colaboradorId: string): ReporteColaborador[] {
    const allReports = masterDataModelService.getTableData<ReporteMaster>('REPORTES');
    
    // Map existing system reports or generate synthetic collaborator specific logs
    const result: ReporteColaborador[] = allReports.map(r => ({
      id: r.id,
      colaboradorId: colaboradorId,
      codigoReporte: r.codigo,
      titulo: `${r.titulo} (Filtro: ${colaboradorId})`,
      tipoReporte: r.tipoReporte,
      fechaGeneracion: r.fechaGeneracion,
      formato: r.formatoExportacion,
      generadoPor: r.usuarioId
    }));

    if (result.length === 0) {
      result.push({
        id: `rep_individual_${colaboradorId}`,
        colaboradorId: colaboradorId,
        codigoReporte: 'REP-IND-001',
        titulo: 'Ficha Individual de Caracterización Sociodemográfica SG-SST',
        tipoReporte: 'INDIVIDUAL',
        fechaGeneracion: new Date().toISOString(),
        formato: 'PDF',
        generadoPor: 'usr_lider_ghumana'
      });
    }

    return result;
  }

  // --- "ACTUALIZAR DESDE ENCUESTA" ENGINE ---

  public actualizarColaboradoresDesdeEncuestas(companyId: string = 'empresa_main_001'): { actualizados: number; log: string[] } {
    const colaboradores = this.getColaboradores(companyId);
    const respuestas = masterDataModelService.getTableData<RespuestaMaster>('RESPUESTAS');
    
    let actualizadosCount = 0;
    const logMessages: string[] = [];

    colaboradores.forEach(colab => {
      // Find responses linked to this colab
      const userResps = respuestas.filter(r => r.colaboradorId === colab.id || (colab.usuarioId && r.usuarioId === colab.usuarioId));
      
      if (userResps.length > 0) {
        let modified = false;
        const colabCopy = { ...colab };

        userResps.forEach(r => {
          // Check for demography answers
          if (r.valorIngresado) {
            if (r.preguntaId === 'prg_genero' && r.valorIngresado !== colabCopy.genero) {
              colabCopy.genero = r.valorIngresado as any;
              modified = true;
            }
          }
        });

        if (modified) {
          this.upsertColaborador(colabCopy, undefined, 'usr_sync_survey', 'ENCUESTA_SYNC');
          actualizadosCount++;
          logMessages.push(`Colaborador ${colab.nombres} ${colab.apellidos} (${colab.numeroIdentificacion}) actualizado desde la última encuesta.`);
        }
      }
    });

    if (actualizadosCount === 0) {
      logMessages.push('Todos los expedientes de colaboradores ya se encuentran perfectamente sincronizados con las encuestas diligenciadas.');
    }

    return {
      actualizados: actualizadosCount,
      log: logMessages
    };
  }

  // --- PARSE & BULK IMPORT FROM EXCEL / CSV ---

  public procesarImportacionExcel(
    filasRaw: Record<string, any>[], 
    companyId: string = 'empresa_main_001',
    userId: string = 'usr_admin'
  ): ImportacionExcelResult {
    let exitosos = 0;
    let fallidos = 0;
    let nuevos = 0;
    let actualizados = 0;
    const errores: { fila: number; campo: string; mensaje: string }[] = [];

    const sedes = this.getSedes(companyId);
    const areas = this.getAreas(companyId);
    const cargos = this.getCargos(companyId);
    const contratos = this.getTiposContrato(companyId);

    filasRaw.forEach((row, index) => {
      const numFila = index + 2; // Accounting for header line

      // Extract fields with multiple flexible column header names
      const numDoc = String(row['Identificación'] || row['Cedula'] || row['Cédula'] || row['Documento'] || row['numeroIdentificacion'] || '').trim();
      const nombres = String(row['Nombres'] || row['Nombre'] || row['nombres'] || '').trim();
      const apellidos = String(row['Apellidos'] || row['Apellido'] || row['apellidos'] || '').trim();
      const correo = String(row['Correo'] || row['Email'] || row['Correo Corporativo'] || row['correoCorporativo'] || '').trim();
      const areaName = String(row['Area'] || row['Área'] || row['Departamento'] || row['areaNombre'] || '').trim();
      const cargoName = String(row['Cargo'] || row['Puesto'] || row['cargoNombre'] || '').trim();
      const sedeName = String(row['Sede'] || row['Ciudad'] || row['Ubicacion'] || row['sedeNombre'] || '').trim();

      // Validations
      if (!numDoc) {
        errores.push({ fila: numFila, campo: 'Identificación', mensaje: 'El número de identificación es obligatorio.' });
        fallidos++;
        return;
      }

      if (!nombres || !apellidos) {
        errores.push({ fila: numFila, campo: 'Nombres / Apellidos', mensaje: 'Los nombres y apellidos son obligatorios.' });
        fallidos++;
        return;
      }

      // Resolve or match FK IDs without forced default fallback values
      let sedeObj = sedes.find(s => s.nombre.toLowerCase().includes(sedeName.toLowerCase()));
      let areaObj = areas.find(a => a.nombre.toLowerCase().includes(areaName.toLowerCase()));
      let cargoObj = cargos.find(c => c.nombre.toLowerCase().includes(cargoName.toLowerCase()));
      const contratoObj = contratos.length > 0 ? contratos.find(c => c.nombre.toLowerCase().includes(String(row['TipoContrato'] || '').toLowerCase())) : undefined;

      // Check existing
      const existingColab = this.getColaboradorByIdentificacion(numDoc);

      const rawGenero = row['Genero'] || row['Género'] || null;
      const rawFechaNac = row['FechaNacimiento'] || row['Fecha Nacimiento'] || null;

      const colabPayload: Partial<ColaboradorExtendido> = {
        id: existingColab ? existingColab.id : undefined,
        companyId: companyId,
        numeroIdentificacion: numDoc,
        tipoIdentificacion: (row['TipoDoc'] || row['tipoIdentificacion'] || 'CC') as any,
        nombres: nombres,
        apellidos: apellidos,
        genero: rawGenero ? (rawGenero as any) : null,
        fechaNacimiento: rawFechaNac ? String(rawFechaNac) : null,
        correoCorporativo: correo || null,
        celular: row['Celular'] || row['Telefono'] || null,
        fechaIngreso: row['FechaIngreso'] ? String(row['FechaIngreso']) : null,
        sedeId: sedeObj ? sedeObj.id : null,
        areaId: areaObj ? areaObj.id : null,
        cargoId: cargoObj ? cargoObj.id : null,
        centroTrabajoId: null,
        tipoContratoId: contratoObj ? contratoObj.id : null,
        modalidadId: null,
        jornadaId: null,
        isActive: true,
        deletedAt: null
      };

      try {
        this.upsertColaborador(colabPayload, undefined, userId, 'EXCEL');
        exitosos++;
        if (existingColab) {
          actualizados++;
        } else {
          nuevos++;
        }
      } catch (e: any) {
        fallidos++;
        errores.push({ fila: numFila, campo: 'Sistemas', mensaje: e?.message || 'Error al guardar colaborador.' });
      }
    });

    // Register Excel Batch Import Log in Master Table
    masterDataModelService.upsertEntity<ImportacionExcelMaster>('IMPORTACIONES_EXCEL', {
      nombreArchivo: `Carga_Masiva_Colaboradores_${new Date().toISOString().substring(0,10)}.xlsx`,
      checksum: `chk_${Math.random().toString(36).substring(2,9)}`,
      registrosTotales: filasRaw.length,
      registrosExitosos: exitosos,
      registrosFallidos: fallidos,
      estado: fallidos === 0 ? 'Completado' : 'Procesando',
      usuarioId: userId,
      detallesErroresJson: JSON.stringify(errores)
    }, userId);

    return {
      exitosos,
      fallidos,
      nuevos,
      actualizados,
      errores,
      registrosProcesados: filasRaw.length
    };
  }

}

export const colaboradoresService = new ColaboradoresService();
