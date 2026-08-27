import React, { useState, useRef } from 'react';
import { 
  X, 
  Layers, 
  Calendar, 
  User, 
  ShieldCheck, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Upload, 
  Trash2, 
  FileUp, 
  Award, 
  Check, 
  ExternalLink,
  History,
  Tag,
  ArrowRight,
  AlertTriangle,
  Download,
  FileCheck,
  HardDrive,
  Hash,
  Eye,
  Archive,
  RefreshCw,
  ShieldAlert,
  Link2
} from 'lucide-react';
import { 
  PlanAccionItem, 
  EstadoPlanAccion, 
  TipoEvidencia, 
  NuevaEvidenciaPayload, 
  VerificacionEficaciaPayload,
  UserSessionInfo,
  EvidenciaPlan
} from '../types/planesAccion.types';
import { VerificacionEficaciaPanel } from './VerificacionEficaciaPanel';
import { planesAccionService } from '../services/planesAccionService';
import { documentStorageService } from '../../../core/storage/documentStorageService';
import { rbacService } from '../../../core/rbac/rbacService';

interface ModalDetallePlanProps {
  isOpen: boolean;
  plan: PlanAccionItem | null;
  onClose: () => void;
  companyId: string;
  onRefresh: () => void;
  currentUser?: UserSessionInfo;
  indicadoresDisponibles: Array<{
    id: string;
    nombre: string;
    valorActual: number | string;
    unidad: string;
    fuente: 'CENTRAL_INDICATOR_ENGINE' | 'DATA_QUALITY_ENGINE' | 'CUMPLIMIENTO_NORMATIVO' | 'MANUAL';
  }>;
}

type TabDetalle = 'general' | 'ejecucion' | 'evidencias' | 'eficacia' | 'historial';

export const ModalDetallePlan: React.FC<ModalDetallePlanProps> = ({
  isOpen,
  plan,
  onClose,
  companyId,
  onRefresh,
  currentUser = { nombre: 'Líder SG-SST', rol: 'Líder SG-SST' },
  indicadoresDisponibles
}) => {
  if (!isOpen || !plan) return null;

  const [activeTab, setActiveTab] = useState<TabDetalle>('general');
  const [nuevoAvance, setNuevoAvance] = useState<number>(plan.porcentajeAvance);
  const [justificacionAvance, setJustificacionAvance] = useState('');
  
  // Evidencias Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tipoDocumento, setTipoDocumento] = useState<TipoEvidencia>('ACTA');
  const [descripcionEvidencia, setDescripcionEvidencia] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDeletedEvidences, setShowDeletedEvidences] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Evidencias Deletion Modal State
  const [evidenceToDelete, setEvidenceToDelete] = useState<EvidenciaPlan | null>(null);
  const [motivoEliminacion, setMotivoEliminacion] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // General Notification State
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // RBAC Permission Checks (Estricto sin bypasses)
  const userRoles = rbacService.getRoles();
  const currentRoleDef = userRoles.find(r => r.name.toLowerCase() === currentUser.rol.toLowerCase() || r.code.toLowerCase() === currentUser.rol.toLowerCase());
  const userPermissions = currentRoleDef?.permissions || [];
  
  const canViewDocs = userPermissions.includes('DOCUMENTS_VIEW');
  const canUploadDocs = userPermissions.includes('DOCUMENTS_UPLOAD');
  const canDeleteDocs = userPermissions.includes('DOCUMENTS_DELETE');
  const canAuditDocs = userPermissions.includes('DOCUMENTS_AUDIT');

  const formatFileSize = (bytes?: number): string => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
      setUploadError(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadError(null);
    }
  };

  const handleUpdateAvance = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);

    planesAccionService.actualizarPlan(
      companyId,
      plan.id,
      { porcentajeAvance: nuevoAvance },
      currentUser,
      justificacionAvance || `Actualización de avance a ${nuevoAvance}%`
    );

    const evidenciasActivas = (plan.evidencias || []).filter(
      ev => !ev.eliminado && (Boolean(ev.storageKey) || Boolean(ev.urlOData))
    );

    if (nuevoAvance === 100 && plan.estado === 'EN_EJECUCION' && evidenciasActivas.length > 0) {
      planesAccionService.cambiarEstadoPlan(
        companyId,
        plan.id,
        'EN_VERIFICACION',
        currentUser,
        'Avance físico completado al 100% con evidencias documentales válidas. Transición automática a EN_VERIFICACION.'
      );
    }

    setActionSuccess('Avance actualizado correctamente.');
    onRefresh();
  };

  const handleCambiarEstado = (nuevoEstado: EstadoPlanAccion, comentario?: string) => {
    setActionError(null);
    setActionSuccess(null);

    const res = planesAccionService.cambiarEstadoPlan(
      companyId,
      plan.id,
      nuevoEstado,
      currentUser,
      comentario
    );

    if (!res.success) {
      setActionError(res.error || 'Error al cambiar estado.');
    } else {
      setActionSuccess(`Estado cambiado exitosamente a: ${nuevoEstado}`);
      onRefresh();
    }
  };

  const handleSubirEvidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);

    if (!canUploadDocs) {
      setUploadError('Operación denegada por control de acceso (RBAC): Su rol no posee el permiso DOCUMENTS_UPLOAD para adjuntar archivos.');
      return;
    }

    if (!selectedFile) {
      setUploadError('Debe seleccionar un archivo físico para adjuntar como evidencia documental.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Guardar archivo en el almacenamiento desacoplado (IndexedDB + Storage Provider)
      const uploadRes = await documentStorageService.upload({
        companyId,
        planAccionId: plan.id,
        file: selectedFile,
        nombreArchivo: selectedFile.name,
        tipoDocumento,
        cargadoPor: currentUser.nombre
      });

      if (!uploadRes.success) {
        throw new Error(uploadRes.error || 'Error al almacenar el archivo');
      }

      // 2. Adjuntar la evidencia al plan de acción
      planesAccionService.adjuntarEvidencia(
        companyId,
        plan.id,
        {
          nombreArchivo: uploadRes.metadata.nombreArchivo,
          tipoDocumento,
          descripcion: descripcionEvidencia.trim() || undefined,
          urlOData: uploadRes.metadata.storageKey,
          pesoBytes: uploadRes.metadata.pesoBytes,
          storageKey: uploadRes.metadata.storageKey,
          storageProvider: uploadRes.metadata.storageProvider,
          mimeType: uploadRes.metadata.mimeType,
          hashIntegridad: uploadRes.metadata.hashIntegridad
        },
        currentUser
      );

      // Limpiar formulario
      setSelectedFile(null);
      setDescripcionEvidencia('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setActionSuccess('Evidencia documental almacenada e indexada exitosamente con integridad criptográfica.');
      onRefresh();
    } catch (err: any) {
      setUploadError(err.message || 'Error al procesar y almacenar el archivo.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDescargarEvidencia = async (evi: EvidenciaPlan) => {
    if (!canViewDocs) {
      setActionError('Operación denegada por control de acceso (RBAC): Requiere el permiso DOCUMENTS_VIEW para descargar o consultar evidencias.');
      return;
    }

    try {
      const storageKey = evi.storageKey || evi.urlOData;
      if (storageKey && storageKey !== '#') {
        const dlResult = await documentStorageService.download(companyId, storageKey);
        if (dlResult.success && dlResult.blob) {
          const url = URL.createObjectURL(dlResult.blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = evi.nombreArchivo;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          return;
        } else if (!dlResult.success) {
          setActionError(dlResult.error || 'Error al validar integridad del documento.');
          return;
        }
      }
      
      // Fallback si es una URL externa
      if (evi.urlOData && evi.urlOData.startsWith('http')) {
        window.open(evi.urlOData, '_blank');
      } else {
        setActionError('El archivo no está disponible físicamente en el almacenamiento local.');
      }
    } catch (err: any) {
      setActionError(`Error al descargar evidencia: ${err.message || 'Error desconocido'}`);
    }
  };

  const confirmarEliminarEvidencia = () => {
    if (!canDeleteDocs) {
      setActionError('Operación denegada por control de acceso (RBAC): Requiere el permiso DOCUMENTS_DELETE para eliminar evidencias documentales.');
      return;
    }

    if (!evidenceToDelete) return;
    if (!motivoEliminacion.trim() || motivoEliminacion.trim().length < 5) {
      setActionError('Debe ingresar un motivo válido para la eliminación lógica (mínimo 5 caracteres).');
      return;
    }

    setIsDeleting(true);
    try {
      planesAccionService.eliminarEvidencia(
        companyId, 
        plan.id, 
        evidenceToDelete.id, 
        currentUser,
        motivoEliminacion.trim()
      );

      setEvidenceToDelete(null);
      setMotivoEliminacion('');
      setActionSuccess('Evidencia eliminada lógicamente conservando la trazabilidad de auditoría.');
      onRefresh();
    } catch (err: any) {
      setActionError(`Error al eliminar evidencia: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGuardarVerificacion = (payload: VerificacionEficaciaPayload) => {
    setActionError(null);
    setActionSuccess(null);

    const res = planesAccionService.registrarVerificacionEficacia(
      companyId,
      plan.id,
      payload,
      currentUser
    );

    if (!res.success) {
      setActionError(res.error || 'Error al registrar verificación.');
    } else {
      setActionSuccess(`Dictamen de eficacia registrado: ${payload.resultado}`);
      onRefresh();
    }
  };

  const getStatusBadge = (estado: EstadoPlanAccion) => {
    switch (estado) {
      case 'BORRADOR':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'PENDIENTE_APROBACION':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'APROBADA':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'EN_EJECUCION':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      case 'EN_VERIFICACION':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'EFICAZ':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'NO_EFICAZ':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'CERRADA':
        return 'bg-teal-100 text-teal-800 border-teal-300';
      case 'VENCIDA':
        return 'bg-rose-900 text-white border-rose-950';
      case 'CANCELADA':
        return 'bg-slate-300 text-slate-700 border-slate-400';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const activeEvidences = (plan.evidencias || []).filter(e => !e.eliminado);
  const deletedEvidences = (plan.evidencias || []).filter(e => e.eliminado);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header con Código, Título y Badges */}
        <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div className="space-y-1 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-mono font-bold rounded-lg">
                {plan.codigo}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-black rounded-lg border ${getStatusBadge(plan.estado)}`}>
                {plan.estado}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                {plan.categoria} • Prioridad: {plan.prioridad}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold font-display leading-snug text-white">
              {plan.titulo}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shrink-0 self-end sm:self-center"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notificaciones y Alertas Temporales */}
        {actionError && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{actionError}</span>
            </div>
            <button onClick={() => setActionError(null)} className="text-rose-600 hover:text-rose-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {actionSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{actionSuccess}</span>
            </div>
            <button onClick={() => setActionSuccess(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div className="px-6 pt-3 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'general'
                ? 'bg-white text-slate-900 border-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. General & Hallazgo</span>
          </button>

          <button
            onClick={() => setActiveTab('ejecucion')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'ejecucion'
                ? 'bg-white text-slate-900 border-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 border-transparent'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>2. Ejecución ({plan.porcentajeAvance}%)</span>
          </button>

          <button
            onClick={() => setActiveTab('evidencias')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'evidencias'
                ? 'bg-white text-slate-900 border-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 border-transparent'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>3. Evidencias ({activeEvidences.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('eficacia')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'eficacia'
                ? 'bg-white text-slate-900 border-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 border-transparent'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>4. Eficacia {plan.verificacionEficacia ? `(${plan.verificacionEficacia.resultado})` : ''}</span>
          </button>

          <button
            onClick={() => setActiveTab('historial')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 flex items-center gap-2 ${
              activeTab === 'historial'
                ? 'bg-white text-slate-900 border-indigo-600 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 border-transparent'
            }`}
          >
            <History className="w-4 h-4" />
            <span>5. Bitácora</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              
              {/* Sugerencia IA banner si aplica */}
              {plan.sugeridoPorIa && (
                <div className="p-4 bg-indigo-50/80 border border-indigo-200 rounded-2xl text-xs text-indigo-900 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-indigo-950 block">🤖 SUGERENCIA IA - REQUIERE VALIDACIÓN HUMANA</span>
                    <span className="text-[11px] text-indigo-700 block mt-0.5">
                      {plan.justificacionIa || 'Plan generado con asistencia del modelo predictivo SST.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Grid de Datos Generales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-500 block">Detalle del Hallazgo</span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {plan.hallazgoDetalle}
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-500 block">Causa Raíz Identificada</span>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {plan.causaRaiz || 'No registrada en el diagnóstico inicial.'}
                  </p>
                </div>
              </div>

              {/* Acciones Propuestas */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Acciones Concretas a Ejecutar</span>
                <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                  {plan.descripcion}
                </p>
              </div>

              {/* Fila Metadatos */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Origen</span>
                  <span className="text-xs font-bold text-slate-800">{plan.origen}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Responsable</span>
                  <span className="text-xs font-bold text-slate-800">{plan.responsableNombre}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Fecha Inicio</span>
                  <span className="text-xs font-mono font-bold text-slate-800">{plan.fechaInicio}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Fecha Objetivo</span>
                  <span className="text-xs font-mono font-bold text-indigo-600">{plan.fechaObjetivo}</span>
                </div>
              </div>

              {/* Vinculación Estructurada y Estado de Sincronización (Fase 12.1) */}
              {(plan.origenId || plan.hallazgoId || plan.estadoSincronizacionOrigen) && (
                <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      <Link2 className="w-3.5 h-3.5 text-indigo-600" />
                      Vinculación Estructurada de Origen
                    </span>
                    {plan.estadoSincronizacionOrigen && (
                      <span className={`px-2.5 py-0.5 text-[11px] font-bold rounded-lg border ${
                        plan.estadoSincronizacionOrigen === 'SINCRONIZADO'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : plan.estadoSincronizacionOrigen === 'PENDIENTE'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : plan.estadoSincronizacionOrigen === 'RECHAZADO_ORIGEN_CERRADO'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : plan.estadoSincronizacionOrigen === 'ERROR'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}>
                        Sincronización: {plan.estadoSincronizacionOrigen}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Identificador de Origen</span>
                      <span className="font-mono text-slate-700 font-semibold">{plan.hallazgoId || plan.origenId || 'No estructurado'}</span>
                    </div>
                    {plan.ultimaSincronizacionOrigen && (
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-400 block">Última Sincronización</span>
                        <span className="font-mono text-slate-700 font-semibold">{new Date(plan.ultimaSincronizacionOrigen).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  {plan.detalleSincronizacionOrigen && (
                    <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                      {plan.detalleSincronizacionOrigen}
                    </p>
                  )}
                </div>
              )}

              {/* Botonera de Transición Rápida de Estado */}
              <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold text-slate-700">Flujo de Estados:</span>
                
                <div className="flex flex-wrap items-center gap-2">
                  {plan.estado === 'BORRADOR' && (
                    <button
                      onClick={() => handleCambiarEstado('PENDIENTE_APROBACION', 'Enviado a aprobación por Líder SG-SST.')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Enviar a Aprobación
                    </button>
                  )}

                  {plan.estado === 'PENDIENTE_APROBACION' && (
                    <button
                      onClick={() => handleCambiarEstado('APROBADA', 'Plan aprobado formalmente.')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Aprobar Plan
                    </button>
                  )}

                  {plan.estado === 'APROBADA' && (
                    <button
                      onClick={() => handleCambiarEstado('EN_EJECUCION', 'Inicio formal de actividades.')}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Iniciar Ejecución
                    </button>
                  )}

                  {plan.estado === 'EFICAZ' && (
                    <button
                      onClick={() => handleCambiarEstado('CERRADA', 'Cierre final del plan con eficacia comprobada.')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Cerrar Plan Definitivamente
                    </button>
                  )}

                  {plan.estado === 'NO_EFICAZ' && (
                    <button
                      onClick={() => handleCambiarEstado('EN_EJECUCION', 'Reapertura para reajuste y replanificación.')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Replanificar (Volver a Ejecución)
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EJECUCION & AVANCE */}
          {activeTab === 'ejecucion' && (
            <div className="space-y-6">
              
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200/80 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Seguimiento al Avance Físico</h3>
                    <p className="text-xs text-slate-500">Ajuste el porcentaje real de las tareas ejecutadas.</p>
                  </div>
                  <span className="text-3xl font-black font-display text-indigo-600">
                    {nuevoAvance}%
                  </span>
                </div>

                {/* Slider */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={nuevoAvance}
                  onChange={(e) => setNuevoAvance(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />

                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>0% (Sin Iniciar)</span>
                  <span>50% (En Gestión)</span>
                  <span>100% (Completado)</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Comentario de Seguimiento / Justificación del Avance
                  </label>
                  <textarea
                    rows={2}
                    value={justificacionAvance}
                    onChange={(e) => setJustificacionAvance(e.target.value)}
                    placeholder="Detalle las actividades realizadas durante este periodo..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleUpdateAvance}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                  >
                    Guardar Avance
                  </button>
                </div>
              </div>

              {/* Advertencia si llega a 100% */}
              {nuevoAvance === 100 && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">100% de Avance Físico Alcanzado</span>
                    <span className="text-[11px] text-emerald-800 block mt-0.5">
                      Para dar por cerrada la acción con rigor normativo, adjunte las evidencias en la pestaña 3 y registre el dictamen en la pestaña 4 (Eficacia).
                    </span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: EVIDENCIAS DOCUMENTALES REALES (FASE 11) */}
          {activeTab === 'evidencias' && (
            <div className="space-y-6">
              
              {/* Restricción RBAC de Carga */}
              {!canUploadDocs && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Modo Consulta (RBAC):</strong> Su rol actual ({currentUser.rol}) no dispone del permiso <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">DOCUMENTS_UPLOAD</code> para adjuntar evidencias documentales.
                  </span>
                </div>
              )}

              {/* Formulario de Carga con Dropzone Real */}
              {canUploadDocs && (
                <form onSubmit={handleSubirEvidencia} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                      <FileUp className="w-4 h-4 text-indigo-600" />
                      <span>Adjuntar Nueva Evidencia Documental Real</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Almacenamiento Seguro Aislado (Tenant: {companyId})
                    </span>
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{uploadError}</span>
                    </div>
                  )}

                  {/* Dropzone Container */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragOver 
                        ? 'border-indigo-500 bg-indigo-50/50' 
                        : selectedFile
                          ? 'border-emerald-500 bg-emerald-50/30'
                          : 'border-slate-300 hover:border-indigo-400 bg-white'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip"
                    />

                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <FileCheck className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {formatFileSize(selectedFile.size)} • Tipo: {selectedFile.type || 'Documento binario'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = '';
                          }}
                          className="ml-4 p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Quitar archivo"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <Upload className="w-8 h-8 mx-auto text-slate-400" />
                        <p className="text-xs font-bold text-slate-700">
                          Arrastre el archivo aquí o <span className="text-indigo-600 underline">haga clic para explorar</span>
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Formatos admitidos: PDF, Word, Excel, Imágenes, ZIP (Máx. 50 MB por evidencia).
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Tipo de Soporte Documental
                      </label>
                      <select
                        value={tipoDocumento}
                        onChange={(e) => setTipoDocumento(e.target.value as TipoEvidencia)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="ACTA">Acta de Reunión / Comité</option>
                        <option value="INFORME">Informe Técnico / Peritaje</option>
                        <option value="CERTIFICADO">Certificado / Constancia</option>
                        <option value="REGISTRO_FOTOGRAFICO">Registro Fotográfico</option>
                        <option value="MATRIZ_ACTUALIZADA">Matriz Legal / IPEVR Actualizada</option>
                        <option value="OTRO">Otro Documento de Soporte</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                        Descripción del Contenido (Opcional)
                      </label>
                      <input
                        type="text"
                        value={descripcionEvidencia}
                        onChange={(e) => setDescripcionEvidencia(e.target.value)}
                        placeholder="Ej: Registro firmado de la capacitación con 42 asistentes..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={!selectedFile || isUploading}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Indexando y Criptocifrando...</span>
                        </>
                      ) : (
                        <>
                          <FileUp className="w-4 h-4" />
                          <span>Guardar Evidencia Documental</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Controles de Vista de Evidencias */}
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black uppercase text-slate-700">
                    Evidencias Registradas ({activeEvidences.length})
                  </h4>
                  {deletedEvidences.length > 0 && canAuditDocs && (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-bold border border-rose-200">
                      {deletedEvidences.length} eliminadas
                    </span>
                  )}
                </div>

                {deletedEvidences.length > 0 && canAuditDocs && (
                  <button
                    onClick={() => setShowDeletedEvidences(!showDeletedEvidences)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>{showDeletedEvidences ? 'Ocultar Histórico Eliminadas' : 'Ver Histórico Eliminadas'}</span>
                  </button>
                )}
              </div>

              {/* Lista de Evidencias Activas */}
              {activeEvidences.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400 space-y-1">
                  <Upload className="w-6 h-6 mx-auto text-slate-300 mb-1" />
                  <p className="font-bold text-slate-600">No se han cargado evidencias documentales activas.</p>
                  <p>Adjunte las actas, informes o registros físicos para habilitar la verificación de eficacia.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeEvidences.map((evi) => (
                    <div
                      key={evi.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {evi.nombreArchivo}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-extrabold border border-indigo-100">
                              {evi.tipoDocumento}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">
                              {formatFileSize(evi.pesoBytes)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500">
                            Cargado por: <strong className="text-slate-700">{evi.cargadoPor}</strong> • {new Date(evi.fechaCarga).toLocaleString()}
                          </p>

                          {evi.descripcion && (
                            <p className="text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                              "{evi.descripcion}"
                            </p>
                          )}

                          {evi.hashIntegridad && (
                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                              <Hash className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-xs" title={`Firma SHA-256 completa: ${evi.hashIntegridad}`}>
                                SHA-256: {evi.hashIntegridad.substring(0, 16)}...
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => handleDescargarEvidencia(evi)}
                          disabled={!canViewDocs}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            canViewDocs 
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
                          }`}
                          title={canViewDocs ? 'Descargar y validar integridad del archivo físico' : 'Requiere permiso DOCUMENTS_VIEW'}
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar</span>
                        </button>

                        {canDeleteDocs && (
                          <button
                            onClick={() => setEvidenceToDelete(evi)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Eliminación lógica de evidencia"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Lista de Evidencias Eliminadas (Histórico y Auditoría) */}
              {showDeletedEvidences && deletedEvidences.length > 0 && canAuditDocs && (
                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <h4 className="text-xs font-black uppercase text-rose-800 flex items-center gap-1.5">
                    <Archive className="w-4 h-4 text-rose-600" />
                    <span>Registro de Evidencias Eliminadas Lógicamente (Inmutable)</span>
                  </h4>

                  <div className="space-y-2">
                    {deletedEvidences.map((evi) => (
                      <div
                        key={evi.id}
                        className="p-3.5 bg-rose-50/50 border border-rose-200/70 rounded-2xl flex items-start justify-between gap-3 text-xs opacity-85"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold line-through text-slate-600">{evi.nombreArchivo}</span>
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-black rounded">
                              ELIMINADO
                            </span>
                          </div>
                          <p className="text-[11px] text-rose-900">
                            Eliminado por: <strong>{evi.eliminadoPor}</strong> el {evi.fechaEliminacion ? new Date(evi.fechaEliminacion).toLocaleString() : 'N/A'}
                          </p>
                          <p className="text-[11px] text-slate-700 italic bg-white/70 p-1.5 rounded-lg border border-rose-100">
                            Motivo: "{evi.motivoEliminacion || 'Sin motivo registrado'}"
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: VERIFICACION DE EFICACIA */}
          {activeTab === 'eficacia' && (
            <div>
              <VerificacionEficaciaPanel
                plan={plan}
                indicadoresDisponibles={indicadoresDisponibles}
                onGuardarVerificacion={handleGuardarVerificacion}
                currentUser={currentUser}
              />
            </div>
          )}

          {/* TAB 5: BITÁCORA E HISTORIAL */}
          {activeTab === 'historial' && (
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-700">
                Trazabilidad & Auditoría Inmutable
              </h4>

              <div className="space-y-3">
                {plan.historialCambios.map((hist, idx) => (
                  <div 
                    key={hist.id || idx}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{hist.accion}</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {new Date(hist.fecha).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Usuario: <strong>{hist.usuario}</strong> ({hist.rol})
                    </p>
                    {hist.comentario && (
                      <p className="text-slate-700 italic text-[11px] bg-white p-2 rounded-lg border border-slate-100 mt-1">
                        "{hist.comentario}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Modal Confirmación de Eliminación Lógica */}
      {evidenceToDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-md w-full space-y-4 animate-scale-in">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Eliminación Lógica de Evidencia</h3>
                <p className="text-xs text-slate-500">Se conservará en la pista de auditoría.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700">
              Está a punto de desvincular el archivo: <strong>{evidenceToDelete.nombreArchivo}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Motivo / Justificación obligatoria de la eliminación:
              </label>
              <textarea
                rows={3}
                value={motivoEliminacion}
                onChange={(e) => setMotivoEliminacion(e.target.value)}
                placeholder="Indique por qué se elimina este soporte documental..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEvidenceToDelete(null);
                  setMotivoEliminacion('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeleting || !motivoEliminacion.trim() || motivoEliminacion.trim().length < 5}
                onClick={confirmarEliminarEvidencia}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                {isDeleting ? 'Procesando...' : 'Confirmar Eliminación'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
