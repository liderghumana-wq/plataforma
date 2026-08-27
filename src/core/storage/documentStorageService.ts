// src/core/storage/documentStorageService.ts
/**
 * Servicio de Almacenamiento Documental Desacoplado
 * Implementa DocumentStorageProvider utilizando IndexedDB para los binarios y
 * metadata segregada por tenant (localStorage).
 * NO almacena Base64 ni blobs pesados dentro de localStorage.
 */

import {
  DocumentStorageProvider,
  DocumentMetadata,
  DocumentUploadParams,
  DocumentUploadResult,
  DocumentDownloadResult,
  StorageProviderType
} from './documentStorage.types';
import { alertasService } from '../../modules/centro_ejecutivo/services/alertasService';

const DB_NAME = 'InsightDocStorage_v1';
const DB_VERSION = 1;
const STORE_NAME = 'document_blobs';

interface BlobRecord {
  key: string; // Composite key: `${companyId}::${storageKey}`
  companyId: string;
  storageKey: string;
  blob: Blob;
  mimeType: string;
  nombreArchivo: string;
  updatedAt: string;
}

class IndexedDBStorageProvider implements DocumentStorageProvider {
  readonly providerType: StorageProviderType = 'LOCAL_INDEXED_DB';
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryBlobFallback: Map<string, BlobRecord> = new Map();

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('IndexedDB no está disponible en este entorno. Se utilizará fallback en memoria.');
      return Promise.reject(new Error('IndexedDB no disponible'));
    }

    this.dbPromise = new Promise((resolve, reject) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            store.createIndex('companyId', 'companyId', { unique: false });
            store.createIndex('storageKey', 'storageKey', { unique: false });
          }
        };

        request.onsuccess = (event) => {
          resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
          console.error('Error al inicializar IndexedDB:', (event.target as IDBOpenDBRequest).error);
          reject((event.target as IDBOpenDBRequest).error);
        };
      } catch (err) {
        console.error('Excepción al abrir IndexedDB:', err);
        reject(err);
      }
    });

    return this.dbPromise;
  }

  private getMetadataStorageKey(companyId: string): string {
    return `insight_documentos_metadata_v1_${companyId}`;
  }

  private loadAllMetadata(companyId: string): DocumentMetadata[] {
    try {
      const raw = localStorage.getItem(this.getMetadataStorageKey(companyId));
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error al leer metadata documental:', e);
      return [];
    }
  }

  private saveAllMetadata(companyId: string, docs: DocumentMetadata[]): void {
    try {
      localStorage.setItem(this.getMetadataStorageKey(companyId), JSON.stringify(docs));
    } catch (e) {
      console.error('Error al guardar metadata documental:', e);
    }
  }

  private generateStorageKey(planAccionId: string, nombreArchivo: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const sanitizedName = nombreArchivo.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `evidencia_${planAccionId}_${timestamp}_${random}_${sanitizedName}`;
  }

  private async calculateHash(blob: Blob): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        const buffer = await blob.arrayBuffer();
        const digest = await window.crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(digest));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }
    } catch {
      // Fallback hash simple
    }
    return `h_${Date.now()}_${blob.size}`;
  }

  async upload(params: DocumentUploadParams): Promise<DocumentUploadResult> {
    const { companyId, planAccionId, file, nombreArchivo, tipoDocumento, cargadoPor, usuarioId } = params;

    if (!companyId || !planAccionId || !file) {
      return { success: false, metadata: {} as any, error: 'Parámetros obligatorios faltantes' };
    }

    try {
      const storageKey = this.generateStorageKey(planAccionId, nombreArchivo);
      const compositeKey = `${companyId}::${storageKey}`;
      const hashIntegridad = await this.calculateHash(file);
      const now = new Date().toISOString();

      const blobRecord: BlobRecord = {
        key: compositeKey,
        companyId,
        storageKey,
        blob: file,
        mimeType: file.type || 'application/octet-stream',
        nombreArchivo,
        updatedAt: now
      };

      // Guardar binario en IndexedDB
      try {
        const db = await this.initDB();
        await new Promise<void>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(blobRecord);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } catch (idbErr) {
        console.warn('Fallback a almacenamiento en memoria para el blob:', idbErr);
        this.memoryBlobFallback.set(compositeKey, blobRecord);
      }

      // Guardar metadata en localStorage (NUNCA el blob)
      const metadata: DocumentMetadata = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        companyId,
        planAccionId,
        nombreArchivo,
        tipoDocumento,
        mimeType: file.type || 'application/octet-stream',
        pesoBytes: file.size,
        storageProvider: this.providerType,
        storageKey,
        fechaCarga: now,
        cargadoPor,
        usuarioId,
        hashIntegridad,
        estado: 'ACTIVO',
        eliminado: false,
        version: 1
      };

      const allDocs = this.loadAllMetadata(companyId);
      allDocs.push(metadata);
      this.saveAllMetadata(companyId, allDocs);

      return {
        success: true,
        metadata
      };
    } catch (err: any) {
      console.error('Error durante la carga de evidencia física:', err);
      return {
        success: false,
        metadata: {} as any,
        error: err?.message || 'Error al persistir el archivo físico'
      };
    }
  }

  async download(companyId: string, storageKey: string): Promise<DocumentDownloadResult> {
    if (!companyId || !storageKey) {
      return { success: false, error: 'Identificadores de descarga inválidos' };
    }

    const compositeKey = `${companyId}::${storageKey}`;

    try {
      // 1. Verificar metadata para validar tenancy y estado
      const allDocs = this.loadAllMetadata(companyId);
      const meta = allDocs.find(d => d.storageKey === storageKey);
      if (!meta) {
        return { success: false, error: 'Documento no encontrado o pertenece a otro tenant' };
      }
      if (meta.eliminado) {
        return { success: false, error: 'El documento fue eliminado lógicamente' };
      }

      // 2. Recuperar blob de IndexedDB
      let blobRecord: BlobRecord | undefined;

      try {
        const db = await this.initDB();
        blobRecord = await new Promise<BlobRecord | undefined>((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(compositeKey);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
      } catch (idbErr) {
        console.warn('Recuperando desde fallback en memoria:', idbErr);
        blobRecord = this.memoryBlobFallback.get(compositeKey);
      }

      if (!blobRecord || !blobRecord.blob) {
        return {
          success: false,
          error: `Archivo físico no encontrado en el almacenamiento local del tenant (${companyId})`
        };
      }

      // 3. Verificación criptográfica estricta de integridad (SHA-256) antes de permitir descarga
      const computedHash = await this.calculateHash(blobRecord.blob);
      const isIntegrityValid = 
        !meta.hashIntegridad || 
        meta.hashIntegridad === computedHash || 
        // Compatibilidad hacia atrás con hashes legacy truncados de 16 caracteres
        (meta.hashIntegridad.length === 16 && computedHash.startsWith(meta.hashIntegridad));

      if (!isIntegrityValid) {
        alertasService.registrarAuditLog(companyId, {
          id: `aud_sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          companyId,
          fecha: new Date().toISOString(),
          usuario: 'Sistema de Integridad Documental',
          rol: 'SECURITY_AUDITOR',
          accion: 'CORRUPCION_INTEGRIDAD_DETECTADA',
          valorAnterior: meta.hashIntegridad,
          valorNuevo: computedHash,
          justificacion: `Descarga bloqueada: Discrepancia criptográfica SHA-256 en evidencia '${meta.nombreArchivo}' (Clave: ${storageKey}).`
        });

        return {
          success: false,
          error: `Inconsistencia de integridad criptográfica: el hash SHA-256 del archivo físico no coincide con la firma registrada (${meta.hashIntegridad.substring(0, 12)}... vs ${computedHash.substring(0, 12)}...). Descarga bloqueada.`
        };
      }

      const url = URL.createObjectURL(blobRecord.blob);
      return {
        success: true,
        blob: blobRecord.blob,
        url,
        nombreArchivo: meta.nombreArchivo,
        mimeType: meta.mimeType
      };
    } catch (err: any) {
      console.error('Error al descargar documento:', err);
      return {
        success: false,
        error: err?.message || 'Error al recuperar el archivo'
      };
    }
  }

  async delete(companyId: string, storageKey: string, motivo?: string, eliminadoPor?: string): Promise<boolean> {
    if (!companyId || !storageKey) return false;

    try {
      const allDocs = this.loadAllMetadata(companyId);
      const index = allDocs.findIndex(d => d.storageKey === storageKey && d.companyId === companyId);
      if (index === -1) return false;

      // Eliminación lógica de metadata
      allDocs[index].eliminado = true;
      allDocs[index].estado = 'ELIMINADO_LOGICO';
      allDocs[index].fechaEliminacion = new Date().toISOString();
      allDocs[index].motivoEliminacion = motivo || 'Eliminación manual';
      allDocs[index].eliminadoPor = eliminadoPor || 'Usuario';

      this.saveAllMetadata(companyId, allDocs);
      return true;
    } catch (e) {
      console.error('Error al marcar eliminación lógica de documento:', e);
      return false;
    }
  }

  async getMetadata(companyId: string, storageKey: string): Promise<DocumentMetadata | null> {
    const allDocs = this.loadAllMetadata(companyId);
    return allDocs.find(d => d.storageKey === storageKey && d.companyId === companyId) || null;
  }

  async listByPlan(companyId: string, planAccionId: string, incluirEliminados: boolean = false): Promise<DocumentMetadata[]> {
    const allDocs = this.loadAllMetadata(companyId);
    return allDocs.filter(d => 
      d.companyId === companyId && 
      d.planAccionId === planAccionId && 
      (incluirEliminados || !d.eliminado)
    );
  }
}

// Instancia singleton desacoplada del proveedor de almacenamiento
export const documentStorageService: DocumentStorageProvider = new IndexedDBStorageProvider();
