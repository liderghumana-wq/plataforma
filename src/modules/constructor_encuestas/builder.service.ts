import { 
  EncuestaMeta, 
  PreguntaConfig, 
  SeccionEncuesta, 
  ReglaDependencia, 
  RespuestaEncuestaRegistro, 
  EstadoEncuesta,
  VersionEncuestaRecord,
  AuditoriaVersionEncuesta
} from './types';
import { masterDataModelService } from '../../core/master_data_model/service';
import { MASTER_SOCIODEMOGRAFICA_ENCUESTA } from './masterSurveyTemplate';

const STORAGE_PREFIX_ENCUESTAS = 'builder_encuestas_';
const STORAGE_PREFIX_RESPUESTAS = 'builder_respuestas_';

// Initial pre-configured high-value templates for companies
export const INITIAL_ENCUESTA_TEMPLATES: EncuestaMeta[] = [
  MASTER_SOCIODEMOGRAFICA_ENCUESTA,
  {
    id: 'tpl-clima-satisfaccion',
    empresaId: 'default',
    titulo: 'Encuesta de Clima Organizacional y Satisfacción Laboral',
    codigo: 'ENC-CLIMA-002',
    descripcion: 'Medición de percepción de liderazgo, ambiente de trabajo, reconocimiento y desarrollo profesional.',
    categoria: 'Clima Laboral',
    estado: 'publicada',
    version: 1,
    autor: 'Gestión Humana',
    fechaCreacion: new Date().toISOString(),
    fechaActualizacion: new Date().toISOString(),
    tiempoEstimadoMinutos: 5,
    permitirAnonimo: true,
    tags: ['Clima', 'Satisfacción', 'NPS', 'Bienestar'],
    secciones: [
      {
        id: 'sec-clima-1',
        encuestaId: 'tpl-clima-satisfaccion',
        titulo: 'Evaluación del Ambiente y Reconocimiento',
        descripcion: 'Valore de 1 a 5 según su nivel de acuerdo',
        orden: 1,
        preguntas: [
          {
            id: 'preg-clima-likert-1',
            seccionId: 'sec-clima-1',
            tipo: 'escala_likert',
            titulo: 'Siento que mi jefe inmediato reconoce mis logros y aportes a la empresa',
            obligatoria: true,
            visible: true,
            editable: true,
            orden: 1,
            categoria: 'Liderazgo',
            variableSistema: false,
            variableEpidemiologica: false,
            variableIA: true,
            opciones: [
              { id: 'op-l1', label: 'Totalmente en desacuerdo', value: '1', puntaje: 1 },
              { id: 'op-l2', label: 'En desacuerdo', value: '2', puntaje: 2 },
              { id: 'op-l3', label: 'Neutral', value: '3', puntaje: 3 },
              { id: 'op-l4', label: 'De acuerdo', value: '4', puntaje: 4 },
              { id: 'op-l5', label: 'Totalmente de acuerdo', value: '5', puntaje: 5 }
            ],
            reglasDependencia: []
          },
          {
            id: 'preg-clima-nps',
            seccionId: 'sec-clima-1',
            tipo: 'nps',
            titulo: 'En una escala de 0 a 10, ¿Qué tan probable es que recomiende esta empresa como un gran lugar para trabajar?',
            textoAyuda: '0 es Nada probable y 10 es Extremadamente probable',
            obligatoria: true,
            visible: true,
            editable: true,
            orden: 2,
            categoria: 'eNPS',
            variableSistema: false,
            variableEpidemiologica: false,
            variableIA: true,
            reglasDependencia: []
          },
          {
            id: 'preg-clima-obs',
            seccionId: 'sec-clima-1',
            tipo: 'texto_largo',
            titulo: '¿Qué sugerencia concreta tiene para mejorar el clima laboral en su equipo?',
            placeholder: 'Escriba sus comentarios constructivos aquí...',
            obligatoria: false,
            visible: true,
            editable: true,
            orden: 3,
            categoria: 'Propuestas',
            variableSistema: false,
            variableEpidemiologica: false,
            variableIA: true,
            promptContextoIA: 'Analizar sentimiento e intenciones de sugerencia en respuesta abierta',
            reglasDependencia: []
          }
        ]
      }
    ]
  }
];

export class BuilderEncuestasService {

  // Helper to compute deterministic checksum hash of survey structure
  computeChecksum(enc: { titulo: string; descripcion: string; secciones: SeccionEncuesta[] }): string {
    const canonical = JSON.stringify({
      t: enc.titulo,
      d: enc.descripcion,
      s: (enc.secciones || []).map(sec => ({
        t: sec.titulo,
        p: (sec.preguntas || []).map(p => ({
          id: p.id,
          t: p.titulo,
          tp: p.tipo,
          o: p.obligatoria,
          opt: p.opciones?.map(o => o.value),
          r: p.reglasDependencia?.map(r => `${r.preguntaOrigenId}:${r.operador}:${r.valorTarget}`)
        }))
      }))
    });

    let hash = 0;
    for (let i = 0; i < canonical.length; i++) {
      const char = canonical.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `chk-${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }

  // Ensure every survey item has initialized version history and audit log
  private ensureVersionHistory(survey: EncuestaMeta): EncuestaMeta {
    const checksum = this.computeChecksum(survey);
    const totalP = survey.secciones.reduce((acc, s) => acc + s.preguntas.length, 0);

    if (!survey.checksum) {
      survey.checksum = checksum;
    }

    if (!survey.historialVersiones || survey.historialVersiones.length === 0) {
      const vNum = survey.version || 1;
      const initialRecord: VersionEncuestaRecord = {
        id: `ver-${survey.id}-v${vNum}`,
        encuestaId: survey.id,
        version: vNum,
        versionLabel: `v${vNum}.0`,
        titulo: survey.titulo,
        descripcion: survey.descripcion,
        categoria: survey.categoria,
        estado: survey.estado,
        fechaCreacion: survey.fechaCreacion || new Date().toISOString(),
        fechaPublicacion: survey.fechaPublicacion || (survey.estado === 'publicada' ? survey.fechaCreacion : undefined),
        autor: survey.autor || 'Administrador',
        notasVersion: 'Versión inicial de la encuesta',
        checksum,
        secciones: JSON.parse(JSON.stringify(survey.secciones || [])),
        totalPreguntas: totalP
      };
      survey.historialVersiones = [initialRecord];
    }

    if (!survey.auditoriaLog || survey.auditoriaLog.length === 0) {
      const vNum = survey.version || 1;
      survey.auditoriaLog = [
        {
          id: `aud-${Date.now()}-1`,
          encuestaId: survey.id,
          version: vNum,
          accion: survey.estado === 'publicada' ? 'PUBLICACION' : 'CREACION_BORRADOR',
          usuario: survey.autor || 'Administrador',
          fecha: survey.fechaCreacion || new Date().toISOString(),
          detalles: `Registro inicial de la encuesta "${survey.titulo}" (Versión v${vNum}.0)`,
          snapshotChecksum: checksum
        }
      ];
    }

    return survey;
  }

  // Get surveys for a specific company
  getEncuestas(empresaId: string): EncuestaMeta[] {
    try {
      const key = `${STORAGE_PREFIX_ENCUESTAS}${empresaId}`;
      const saved = localStorage.getItem(key);
      let list: EncuestaMeta[] = [];
      if (saved) {
        const parsed: EncuestaMeta[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
      
      if (list.length === 0) {
        // Seed with initial templates if empty
        list = INITIAL_ENCUESTA_TEMPLATES.map(tpl => ({
          ...tpl,
          empresaId
        }));
      }

      // Guarantee versioning metadata on all loaded surveys
      const normalized = list.map(item => this.ensureVersionHistory(item));
      this.saveAllEncuestas(empresaId, normalized);
      return normalized;
    } catch (e) {
      console.error('Error loading encuestas from storage:', e);
      return INITIAL_ENCUESTA_TEMPLATES.map(item => this.ensureVersionHistory({ ...item, empresaId }));
    }
  }

  // Save all surveys list for company
  private saveAllEncuestas(empresaId: string, encuestas: EncuestaMeta[]) {
    try {
      const key = `${STORAGE_PREFIX_ENCUESTAS}${empresaId}`;
      localStorage.setItem(key, JSON.stringify(encuestas));
    } catch (e) {
      console.error('Error saving encuestas:', e);
    }
  }

  // Save or Update a single survey
  saveEncuesta(
    empresaId: string, 
    encuesta: EncuestaMeta, 
    usuario = 'Administrador',
    notasCambio = 'Modificación de estructura'
  ): EncuestaMeta {
    const list = this.getEncuestas(empresaId);
    const existingIdx = list.findIndex(e => e.id === encuesta.id);
    const nowISO = new Date().toISOString();
    
    const checksum = this.computeChecksum(encuesta);

    let updatedEncuesta: EncuestaMeta = {
      ...encuesta,
      empresaId,
      checksum,
      fechaActualizacion: nowISO
    };

    updatedEncuesta = this.ensureVersionHistory(updatedEncuesta);

    // Audit log entry for structure update
    if (!updatedEncuesta.auditoriaLog) updatedEncuesta.auditoriaLog = [];
    updatedEncuesta.auditoriaLog.unshift({
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      encuestaId: updatedEncuesta.id,
      version: updatedEncuesta.version,
      accion: 'EDICION_ESTRUCTURA',
      usuario,
      fecha: nowISO,
      detalles: notasCambio,
      snapshotChecksum: checksum
    });

    if (existingIdx >= 0) {
      list[existingIdx] = updatedEncuesta;
    } else {
      list.unshift(updatedEncuesta);
    }

    this.saveAllEncuestas(empresaId, list);
    return updatedEncuesta;
  }

  // Publish a new survey version officially with changelog
  publicarNuevaVersion(
    empresaId: string, 
    encuestaId: string, 
    notasVersion = 'Publicación oficial de nueva versión', 
    autor = 'Administrador'
  ): EncuestaMeta | null {
    const list = this.getEncuestas(empresaId);
    const survey = list.find(e => e.id === encuestaId);
    if (!survey) return null;

    const nowISO = new Date().toISOString();
    
    // Increment integer version if previously published, or keep 1
    const targetVersionNumber = survey.estado === 'publicada' ? survey.version + 1 : (survey.version || 1);
    
    survey.version = targetVersionNumber;
    survey.estado = 'publicada';
    survey.fechaPublicacion = nowISO;
    survey.fechaActualizacion = nowISO;
    survey.notasVersion = notasVersion;
    
    const checksum = this.computeChecksum(survey);
    survey.checksum = checksum;
    const totalP = survey.secciones.reduce((acc, s) => acc + s.preguntas.length, 0);

    if (!survey.historialVersiones) survey.historialVersiones = [];

    // Mark previous published snapshots as 'archivada'
    survey.historialVersiones = survey.historialVersiones.map(v => {
      if (v.estado === 'publicada') {
        return { ...v, estado: 'archivada' as EstadoEncuesta };
      }
      return v;
    });

    const newVersionRecord: VersionEncuestaRecord = {
      id: `ver-${survey.id}-v${targetVersionNumber}-${Date.now()}`,
      encuestaId: survey.id,
      version: targetVersionNumber,
      versionLabel: `v${targetVersionNumber}.0`,
      titulo: survey.titulo,
      descripcion: survey.descripcion,
      categoria: survey.categoria,
      estado: 'publicada',
      fechaCreacion: survey.fechaCreacion,
      fechaPublicacion: nowISO,
      autor: autor || survey.autor,
      notasVersion,
      checksum,
      secciones: JSON.parse(JSON.stringify(survey.secciones)),
      totalPreguntas: totalP
    };

    survey.historialVersiones.unshift(newVersionRecord);

    if (!survey.auditoriaLog) survey.auditoriaLog = [];
    survey.auditoriaLog.unshift({
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      encuestaId: survey.id,
      version: targetVersionNumber,
      accion: 'PUBLICACION',
      usuario: autor || survey.autor,
      fecha: nowISO,
      detalles: `Publicación oficial de la versión v${targetVersionNumber}.0 - ${notasVersion}`,
      snapshotChecksum: checksum
    });

    this.saveAllEncuestas(empresaId, list);

    // Sync with MasterDataModelService for audit transparency
    try {
      masterDataModelService.upsertEntity('ENCUESTAS', {
        codigo: survey.codigo,
        titulo: survey.titulo,
        descripcion: survey.descripcion,
        tipoEncuesta: 'Personalizada',
        version: `v${targetVersionNumber}.0`,
        estado: 'Publicada',
        autorId: autor || survey.autor,
        empresaId
      } as any);
    } catch (e) {
      console.warn('Sync to Master Data Model:', e);
    }

    return survey;
  }

  // Duplicate a specific version (either as a new version vN+1 or as a separate new survey)
  duplicarVersion(
    empresaId: string, 
    encuestaId: string, 
    versionTargetNumber: number, 
    comoNuevaEncuesta = false, 
    autor = 'Administrador'
  ): EncuestaMeta | null {
    const list = this.getEncuestas(empresaId);
    const sourceSurvey = list.find(e => e.id === encuestaId);
    if (!sourceSurvey) return null;

    const targetSnapshot = sourceSurvey.historialVersiones?.find(v => v.version === versionTargetNumber);
    const sourceSections = targetSnapshot ? targetSnapshot.secciones : sourceSurvey.secciones;

    const nowISO = new Date().toISOString();

    if (comoNuevaEncuesta) {
      // Create new independent survey with version 1
      const newId = `enc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      const newSurvey: EncuestaMeta = {
        ...sourceSurvey,
        id: newId,
        titulo: `${sourceSurvey.titulo} (Clon v${versionTargetNumber})`,
        codigo: `${sourceSurvey.codigo}-CLON`,
        estado: 'borrador',
        version: 1,
        fechaCreacion: nowISO,
        fechaActualizacion: nowISO,
        fechaPublicacion: undefined,
        autor,
        secciones: sourceSections.map((sec, sIdx) => {
          const newSecId = `sec-dup-${sIdx}-${Date.now()}`;
          return {
            ...sec,
            id: newSecId,
            encuestaId: newId,
            preguntas: sec.preguntas.map((preg, pIdx) => ({
              ...preg,
              id: `preg-dup-${sIdx}-${pIdx}-${Date.now()}`,
              seccionId: newSecId
            }))
          };
        }),
        historialVersiones: [],
        auditoriaLog: []
      };

      const checksum = this.computeChecksum(newSurvey);
      newSurvey.checksum = checksum;

      const initialRecord: VersionEncuestaRecord = {
        id: `ver-${newId}-v1`,
        encuestaId: newId,
        version: 1,
        versionLabel: 'v1.0',
        titulo: newSurvey.titulo,
        descripcion: newSurvey.descripcion,
        categoria: newSurvey.categoria,
        estado: 'borrador',
        fechaCreacion: nowISO,
        autor,
        notasVersion: `Encuesta clonada desde versión v${versionTargetNumber} de "${sourceSurvey.titulo}"`,
        checksum,
        secciones: JSON.parse(JSON.stringify(newSurvey.secciones)),
        totalPreguntas: newSurvey.secciones.reduce((acc, s) => acc + s.preguntas.length, 0)
      };

      newSurvey.historialVersiones = [initialRecord];
      newSurvey.auditoriaLog = [{
        id: `aud-${Date.now()}-1`,
        encuestaId: newId,
        version: 1,
        accion: 'DUPLICADO_VERSION',
        usuario: autor,
        fecha: nowISO,
        detalles: `Creada como encuesta independiente clonando versión v${versionTargetNumber} de "${sourceSurvey.titulo}"`,
        snapshotChecksum: checksum
      }];

      list.unshift(newSurvey);
      this.saveAllEncuestas(empresaId, list);
      return newSurvey;

    } else {
      // Duplicate version into a new draft v(N+1) of the SAME survey
      const nextVersionNumber = (sourceSurvey.version || 1) + 1;

      sourceSurvey.version = nextVersionNumber;
      sourceSurvey.estado = 'borrador';
      sourceSurvey.fechaActualizacion = nowISO;
      sourceSurvey.secciones = JSON.parse(JSON.stringify(sourceSections));
      
      const checksum = this.computeChecksum(sourceSurvey);
      sourceSurvey.checksum = checksum;

      if (!sourceSurvey.auditoriaLog) sourceSurvey.auditoriaLog = [];
      sourceSurvey.auditoriaLog.unshift({
        id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        encuestaId: sourceSurvey.id,
        version: nextVersionNumber,
        accion: 'DUPLICADO_VERSION',
        usuario: autor,
        fecha: nowISO,
        detalles: `Duplicada estructura de la versión v${versionTargetNumber}.0 como nuevo borrador v${nextVersionNumber}.0`,
        snapshotChecksum: checksum
      });

      this.saveAllEncuestas(empresaId, list);
      return sourceSurvey;
    }
  }

  // Restore a previous version into a new active working draft (preserving past history)
  restaurarVersion(
    empresaId: string, 
    encuestaId: string, 
    versionTargetNumber: number, 
    autor = 'Administrador'
  ): EncuestaMeta | null {
    const list = this.getEncuestas(empresaId);
    const survey = list.find(e => e.id === encuestaId);
    if (!survey) return null;

    const targetSnapshot = survey.historialVersiones?.find(v => v.version === versionTargetNumber);
    if (!targetSnapshot) return null;

    const nextVersionNumber = (survey.version || 1) + 1;
    const nowISO = new Date().toISOString();

    survey.version = nextVersionNumber;
    survey.estado = 'borrador';
    survey.fechaActualizacion = nowISO;
    survey.titulo = targetSnapshot.titulo;
    survey.descripcion = targetSnapshot.descripcion;
    survey.categoria = targetSnapshot.categoria;
    survey.secciones = JSON.parse(JSON.stringify(targetSnapshot.secciones));

    const checksum = this.computeChecksum(survey);
    survey.checksum = checksum;

    if (!survey.auditoriaLog) survey.auditoriaLog = [];
    survey.auditoriaLog.unshift({
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      encuestaId: survey.id,
      version: nextVersionNumber,
      accion: 'RESTAURACION',
      usuario: autor,
      fecha: nowISO,
      detalles: `Restaurada estructura inmutable de versión v${versionTargetNumber}.0 para crear borrador v${nextVersionNumber}.0`,
      snapshotChecksum: checksum
    });

    this.saveAllEncuestas(empresaId, list);
    return survey;
  }

  // Compare two survey versions (Visual Structural Diff)
  compararVersiones(versionA: VersionEncuestaRecord | EncuestaMeta, versionB: VersionEncuestaRecord | EncuestaMeta) {
    const preguntasA = (versionA.secciones || []).flatMap(s => s.preguntas || []);
    const preguntasB = (versionB.secciones || []).flatMap(s => s.preguntas || []);

    const mapA = new Map(preguntasA.map(p => [p.id, p]));
    const mapB = new Map(preguntasB.map(p => [p.id, p]));

    const agregadas = preguntasB.filter(p => !mapA.has(p.id));
    const eliminadas = preguntasA.filter(p => !mapB.has(p.id));
    
    const modificadas: Array<{
      id: string;
      tituloAntes: string;
      tituloAhora: string;
      cambios: string[];
    }> = [];

    preguntasB.forEach(pB => {
      const pA = mapA.get(pB.id);
      if (pA) {
        const cambios: string[] = [];
        if (pA.titulo !== pB.titulo) cambios.push(`Título: "${pA.titulo}" ➔ "${pB.titulo}"`);
        if (pA.tipo !== pB.tipo) cambios.push(`Tipo: ${pA.tipo} ➔ ${pB.tipo}`);
        if (pA.obligatoria !== pB.obligatoria) cambios.push(`Obligatoria: ${pA.obligatoria ? 'Sí' : 'No'} ➔ ${pB.obligatoria ? 'Sí' : 'No'}`);
        if (pA.categoria !== pB.categoria) cambios.push(`Categoría: ${pA.categoria || 'N/A'} ➔ ${pB.categoria || 'N/A'}`);
        if ((pA.opciones?.length || 0) !== (pB.opciones?.length || 0)) {
          cambios.push(`Opciones de respuesta: ${pA.opciones?.length || 0} ➔ ${pB.opciones?.length || 0}`);
        }
        if ((pA.reglasDependencia?.length || 0) !== (pB.reglasDependencia?.length || 0)) {
          cambios.push(`Reglas de dependencia: ${pA.reglasDependencia?.length || 0} ➔ ${pB.reglasDependencia?.length || 0}`);
        }

        if (cambios.length > 0) {
          modificadas.push({
            id: pB.id,
            tituloAntes: pA.titulo,
            tituloAhora: pB.titulo,
            cambios
          });
        }
      }
    });

    return {
      versionA: {
        version: versionA.version,
        versionLabel: `v${versionA.version}.0`,
        fecha: (versionA as any).fechaPublicacion || versionA.fechaCreacion,
        autor: versionA.autor,
        totalPreguntas: preguntasA.length,
        totalSecciones: versionA.secciones?.length || 0,
        estado: versionA.estado
      },
      versionB: {
        version: versionB.version,
        versionLabel: `v${versionB.version}.0`,
        fecha: (versionB as any).fechaPublicacion || versionB.fechaCreacion,
        autor: versionB.autor,
        totalPreguntas: preguntasB.length,
        totalSecciones: versionB.secciones?.length || 0,
        estado: versionB.estado
      },
      metadatosCambiados: {
        titulo: versionA.titulo !== versionB.titulo ? { antes: versionA.titulo, ahora: versionB.titulo } : null,
        descripcion: versionA.descripcion !== versionB.descripcion ? { antes: versionA.descripcion, ahora: versionB.descripcion } : null,
        categoria: versionA.categoria !== versionB.categoria ? { antes: versionA.categoria, ahora: versionB.categoria } : null
      },
      preguntasAgregadas: agregadas,
      preguntasEliminadas: eliminadas,
      preguntasModificadas: modificadas
    };
  }

  // Duplicate a survey (Legacy helper compatibility)
  duplicateEncuesta(empresaId: string, encuestaId: string): EncuestaMeta | null {
    return this.duplicarVersion(empresaId, encuestaId, 1, true, 'Administrador');
  }

  // Delete survey
  deleteEncuesta(empresaId: string, encuestaId: string): boolean {
    const list = this.getEncuestas(empresaId);
    const filtered = list.filter(e => e.id !== encuestaId);
    if (filtered.length === list.length) return false;

    this.saveAllEncuestas(empresaId, filtered);
    return true;
  }

  // Change survey status (publicar, desactivar, etc.)
  changeEstadoEncuesta(empresaId: string, encuestaId: string, nuevoEstado: EstadoEncuesta): EncuestaMeta | null {
    const list = this.getEncuestas(empresaId);
    const item = list.find(e => e.id === encuestaId);
    if (!item) return null;

    if (nuevoEstado === 'publicada') {
      return this.publicarNuevaVersion(empresaId, encuestaId, 'Cambio de estado a Publicada');
    }

    item.estado = nuevoEstado;
    item.fechaActualizacion = new Date().toISOString();

    if (!item.auditoriaLog) item.auditoriaLog = [];
    item.auditoriaLog.unshift({
      id: `aud-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      encuestaId: item.id,
      version: item.version,
      accion: nuevoEstado === 'archivada' ? 'ARCHIVADO' : 'EDICION_ESTRUCTURA',
      usuario: 'Administrador',
      fecha: new Date().toISOString(),
      detalles: `Cambio de estado a ${nuevoEstado.toUpperCase()}`,
      snapshotChecksum: item.checksum
    });

    this.saveAllEncuestas(empresaId, list);
    return item;
  }

  // Save response submission with strict version binding (NEVER mutates past responses)
  saveRespuesta(empresaId: string, registro: Omit<RespuestaEncuestaRegistro, 'id' | 'fechaRespuesta'>): RespuestaEncuestaRegistro {
    const key = `${STORAGE_PREFIX_RESPUESTAS}${empresaId}_${registro.encuestaId}`;
    const existingRaw = localStorage.getItem(key);
    let responses: RespuestaEncuestaRegistro[] = existingRaw ? JSON.parse(existingRaw) : [];

    const vNum = registro.versionEncuesta || 1;

    const newRecord: RespuestaEncuestaRegistro = {
      ...registro,
      id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      versionEncuesta: vNum,
      versionLabel: `v${vNum}.0`,
      empresaId,
      fechaRespuesta: new Date().toISOString()
    };

    responses.unshift(newRecord);
    localStorage.setItem(key, JSON.stringify(responses));
    return newRecord;
  }

  // Get stored responses for a survey
  getRespuestas(empresaId: string, encuestaId: string): RespuestaEncuestaRegistro[] {
    try {
      const key = `${STORAGE_PREFIX_RESPUESTAS}${empresaId}_${encuestaId}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading responses:', e);
      return [];
    }
  }

  // Auto-save survey draft progress
  saveBorrador(empresaId: string, encuestaId: string, data: { respuestas: Record<string, any>; currentSectionIdx: number; lastSaved: string }): void {
    try {
      const key = `builder_borrador_${empresaId}_${encuestaId}`;
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving survey draft:', e);
    }
  }

  // Retrieve survey draft progress
  getBorrador(empresaId: string, encuestaId: string): { respuestas: Record<string, any>; currentSectionIdx: number; lastSaved: string } | null {
    try {
      const key = `builder_borrador_${empresaId}_${encuestaId}`;
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error reading survey draft:', e);
      return null;
    }
  }

  // Clear survey draft progress upon submission
  clearBorrador(empresaId: string, encuestaId: string): void {
    try {
      const key = `builder_borrador_${empresaId}_${encuestaId}`;
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error clearing survey draft:', e);
    }
  }

  // Rule Evaluator Engine
  // Checks if a question should be shown/hidden/required based on current form values
  evaluarReglasPregunta(
    pregunta: PreguntaConfig, 
    respuestasActuales: Record<string, any>
  ): { visible: boolean; obligatoria: boolean; habilitada: boolean } {
    let resultVisible = pregunta.visible;
    let resultObligatoria = pregunta.obligatoria;
    let resultHabilitada = pregunta.editable;

    if (!pregunta.reglasDependencia || pregunta.reglasDependencia.length === 0) {
      return { visible: resultVisible, obligatoria: resultObligatoria, habilitada: resultHabilitada };
    }

    // Process all rules for this question
    for (const regla of pregunta.reglasDependencia) {
      const valorOrigen = respuestasActuales[regla.preguntaOrigenId];
      const cumpleCondicion = this.evaluarCondicionRegla(regla, valorOrigen);

      if (cumpleCondicion) {
        switch (regla.accion) {
          case 'mostrar':
            resultVisible = true;
            break;
          case 'ocultar':
            resultVisible = false;
            break;
          case 'requerir':
            resultObligatoria = true;
            break;
          case 'deshabilitar':
            resultHabilitada = false;
            break;
        }
      } else {
        // Inverse behavior if rule condition is not met for display rules
        if (regla.accion === 'mostrar') {
          resultVisible = false;
        } else if (regla.accion === 'ocultar') {
          resultVisible = true;
        }
      }
    }

    return { visible: resultVisible, obligatoria: resultObligatoria, habilitada: resultHabilitada };
  }

  // Helper to evaluate single rule operator
  private evaluarCondicionRegla(regla: ReglaDependencia, valorActual: any): boolean {
    if (valorActual === undefined || valorActual === null) {
      return regla.operador === 'no_respondida';
    }

    const valStr = String(valorActual).trim().toLowerCase();
    const targetStr = String(regla.valorTarget || '').trim().toLowerCase();

    switch (regla.operador) {
      case 'igual_a':
        return valStr === targetStr;
      case 'diferente_de':
        return valStr !== targetStr;
      case 'contiene':
        if (Array.isArray(valorActual)) {
          return valorActual.some(v => String(v).toLowerCase().includes(targetStr));
        }
        return valStr.includes(targetStr);
      case 'mayor_que': {
        const numA = parseFloat(valStr);
        const numB = parseFloat(targetStr);
        return !isNaN(numA) && !isNaN(numB) && numA > numB;
      }
      case 'menor_que': {
        const numA = parseFloat(valStr);
        const numB = parseFloat(targetStr);
        return !isNaN(numA) && !isNaN(numB) && numA < numB;
      }
      case 'en_lista': {
        const targets = targetStr.split(',').map(s => s.trim());
        return targets.includes(valStr);
      }
      case 'respondida':
        return valStr !== '';
      case 'no_respondida':
        return valStr === '';
      default:
        return false;
    }
  }

  // Export JSON
  exportJSON(encuesta: EncuestaMeta): string {
    return JSON.stringify(encuesta, null, 2);
  }

  // Import JSON
  importJSON(empresaId: string, jsonText: string): EncuestaMeta {
    const parsed = JSON.parse(jsonText);
    if (!parsed.titulo || !Array.isArray(parsed.secciones)) {
      throw new Error('El formato del archivo JSON no corresponde a una encuesta válida.');
    }

    const imported: EncuestaMeta = {
      ...parsed,
      id: `enc-imp-${Date.now()}`,
      empresaId,
      estado: 'borrador',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString()
    };

    return this.saveEncuesta(empresaId, imported);
  }
}

export const builderEncuestasService = new BuilderEncuestasService();
