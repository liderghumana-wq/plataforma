// src/core/storage/documentStorage.types.ts
/**
 * Capa de Abstracción para Gestión y Almacenamiento Documental SG-SST
 * Diseñada para soportar desacoplamiento total entre metadatos y almacenamiento binario.
 * Preparada para migración transparente a AWS S3, Google Cloud Storage o Azure Blob Storage.
 */

export type StorageProviderType = 'LOCAL_INDEXED_DB' | 'S3_COMPLIANT' | 'GCS_COMPLIANT' | 'AZURE_BLOB';

export type TipoDocumentoEvidencia = 
  | 'ACTA'
  | 'INFORME'
  | 'CERTIFICADO'
  | 'REGISTRO_FOTOGRAFICO'
  | 'MATRIZ_ACTUALIZADA'
  | 'PROCEDIMIENTO'
  | 'CAPACITACION'
  | 'INSPECCION'
  | 'EVALUACION_MEDICA'
  | 'OTRO';

export interface DocumentMetadata {
  id: string;
  companyId: string;
  planAccionId: string;
  nombreArchivo: string;
  tipoDocumento: TipoDocumentoEvidencia;
  mimeType: string;
  pesoBytes: number;
  storageProvider: StorageProviderType;
  storageKey: string;
  urlOData?: string;
  fechaCarga: string; // ISO 8601
  cargadoPor: string; // Nombre o email
  usuarioId?: string;
  hashIntegridad?: string;
  estado: 'ACTIVO' | 'ELIMINADO_LOGICO';
  eliminado: boolean;
  fechaEliminacion?: string;
  eliminadoPor?: string;
  motivoEliminacion?: string;
  version: number;
}

export interface DocumentUploadParams {
  companyId: string;
  planAccionId: string;
  file: File | Blob;
  nombreArchivo: string;
  tipoDocumento: TipoDocumentoEvidencia;
  descripcion?: string;
  cargadoPor: string;
  usuarioId?: string;
}

export interface DocumentUploadResult {
  success: boolean;
  metadata: DocumentMetadata;
  error?: string;
}

export interface DocumentDownloadResult {
  success: boolean;
  blob?: Blob;
  url?: string;
  nombreArchivo?: string;
  mimeType?: string;
  error?: string;
}

export interface DocumentStorageProvider {
  readonly providerType: StorageProviderType;
  
  /**
   * Carga un archivo físico al almacenamiento desacoplado y retorna su metadata
   */
  upload(params: DocumentUploadParams): Promise<DocumentUploadResult>;
  
  /**
   * Recupera el contenido binario/blob del archivo mediante su clave de almacenamiento y companyId
   */
  download(companyId: string, storageKey: string): Promise<DocumentDownloadResult>;
  
  /**
   * Realiza la eliminación física o lógica de un documento
   */
  delete(companyId: string, storageKey: string, motivo?: string, eliminadoPor?: string): Promise<boolean>;
  
  /**
   * Recupera la metadata asociada a un archivo
   */
  getMetadata(companyId: string, storageKey: string): Promise<DocumentMetadata | null>;
  
  /**
   * Lista todos los documentos activos pertenecientes a un plan de acción y tenant específico
   */
  listByPlan(companyId: string, planAccionId: string, incluirEliminados?: boolean): Promise<DocumentMetadata[]>;
}
