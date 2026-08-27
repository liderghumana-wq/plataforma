import { ColaboradorMaster, BaseAuditEntity } from '../../core/master_data_model/types';

export interface ColaboradorExtendido extends ColaboradorMaster {
  // Resolved relationship names for quick presentation & filtering
  empresaNombre?: string;
  sedeNombre?: string;
  areaNombre?: string;
  cargoNombre?: string;
  proyectoNombre?: string;
  centroTrabajoNombre?: string;
  tipoContratoNombre?: string;
  modalidadNombre?: string;
  jornadaNombre?: string;
  
  // Expediente Digital extra fields
  estadoCivil?: 'Soltero(a)' | 'Casado(a)' | 'Unión Libre' | 'Divorciado(a)' | 'Viudo(a)';
  nivelEscolaridad?: 'Primaria' | 'Bachillerato' | 'Técnico' | 'Tecnólogo' | 'Profesional' | 'Especialización' | 'Maestría' | 'Doctorado';
  personasACargo?: number;
  tipoVivienda?: 'Propia' | 'Arrendada' | 'Familiar';
  eps?: string;
  afp?: string;
  grupoSanguineo?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  parentescoContacto?: string;

  // Stats summary for digital dossier
  totalEncuestasDiligenciadas?: number;
  totalReportesAsociados?: number;
  ultimaEncuestaFecha?: string;
}

export interface HistorialCambioColaborador {
  id: string;
  colaboradorId: string;
  fecha: string;
  usuario: string;
  campoModificado: string;
  valorAnterior: string;
  valorNuevo: string;
  motivo?: string;
  origen: 'MANUAL' | 'EXCEL' | 'ENCUESTA_SYNC' | 'SISTEMA';
}

export interface EncuestaDiligenciadaColaborador {
  id: string;
  colaboradorId: string;
  encuestaId: string;
  tituloEncuesta: string;
  tipoEncuesta: 'Sociodemográfica' | 'Clima Organizacional' | 'Riesgo Psicosocial' | 'Personalizada';
  fechaRespuesta: string;
  estado: 'Completada' | 'En Progreso';
  respuestasCount: number;
  campañaNombre?: string;
  puntajeOIndice?: string;
}

export interface ReporteColaborador {
  id: string;
  colaboradorId: string;
  codigoReporte: string;
  titulo: string;
  tipoReporte: 'SOCIODEMOGRAFICO' | 'CLIMA' | 'PSICOSOCIAL' | 'AUDITORIA' | 'INDIVIDUAL' | 'PERSONALIZADO';
  fechaGeneracion: string;
  formato: 'PDF' | 'EXCEL' | 'POWER_BI' | 'JSON';
  generadoPor: string;
  urlDescarga?: string;
}

export interface ImportacionExcelResult {
  exitosos: number;
  fallidos: number;
  nuevos: number;
  actualizados: number;
  errores: { fila: number; campo: string; mensaje: string }[];
  registrosProcesados: number;
}
