import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  UserCheck, 
  Building2, 
  MapPin, 
  Briefcase, 
  FolderGit2, 
  Calendar, 
  Phone, 
  Mail, 
  Clock, 
  ClipboardList, 
  ShieldCheck, 
  Printer, 
  Award, 
  Activity, 
  Heart, 
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Sparkles,
  Layers,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { colaboradoresService } from '../colaboradoresService';
import { ColaboradorExtendido, HistorialCambioColaborador, EncuestaDiligenciadaColaborador, ReporteColaborador } from '../types';

interface ExpedienteDigitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaboratorId: string | null;
}

export function ExpedienteDigitalModal({
  isOpen,
  onClose,
  collaboratorId
}: ExpedienteDigitalModalProps) {

  const [collaborator, setCollaborator] = useState<ColaboradorExtendido | null>(null);
  const [activeTab, setActiveTab] = useState<'FICHA' | 'ENCUESTAS' | 'HISTORIAL' | 'REPORTES' | 'CARNET'>('FICHA');

  const [surveyHistory, setSurveyHistory] = useState<EncuestaDiligenciadaColaborador[]>([]);
  const [changeHistory, setChangeHistory] = useState<HistorialCambioColaborador[]>([]);
  const [reportHistory, setReportHistory] = useState<ReporteColaborador[]>([]);

  useEffect(() => {
    if (collaboratorId) {
      const colab = colaboradoresService.getColaboradorById(collaboratorId);
      if (colab) {
        setCollaborator(colab);
        setSurveyHistory(colaboradoresService.getHistorialEncuestas(colab.id));
        setChangeHistory(colaboradoresService.getHistorialCambios(colab.id));
        setReportHistory(colaboradoresService.getHistorialReportes(colab.id));
      }
    }
  }, [collaboratorId, isOpen]);

  if (!isOpen || !collaborator) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-left text-slate-800"
      >
        
        {/* TOP HEADER DOSSIER BANNER */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-6 text-white shrink-0 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
            <Award className="w-64 h-64 text-white" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            
            <div className="flex items-center gap-4">
              {/* Avatar circle */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
                {collaborator.nombres.charAt(0)}{collaborator.apellidos.charAt(0)}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {collaborator.nombres} {collaborator.apellidos}
                  </h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                    collaborator.isActive && !collaborator.deletedAt
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                  }`}>
                    {collaborator.isActive && !collaborator.deletedAt ? 'Expediente Activo' : 'Soft Deleted'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-medium">
                  <span className="flex items-center gap-1 font-mono font-bold text-amber-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{collaborator.tipoIdentificacion}: {collaborator.numeroIdentificacion}</span>
                  </span>
                  <span>•</span>
                  <span className="text-indigo-200 font-bold">{collaborator.cargoNombre}</span>
                  <span>•</span>
                  <span>{collaborator.areaNombre}</span>
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Ficha</span>
              </button>
              
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white rounded-xl cursor-pointer transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* TABS HEADER */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2 gap-2 overflow-x-auto text-xs font-bold shrink-0">
          {[
            { id: 'FICHA', label: '🗂️ Ficha & Estructura 3NF', count: null },
            { id: 'ENCUESTAS', label: '📋 Encuestas Diligenciadas', count: surveyHistory.length },
            { id: 'HISTORIAL', label: '📜 Historial de Cambios (Audit)', count: changeHistory.length },
            { id: 'REPORTES', label: '📊 Reportes Asociados', count: reportHistory.length },
            { id: 'CARNET', label: '🎴 Carnet & Ficha Técnica', count: null }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3.5 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isActive 
                    ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-xl font-black shadow-2xs' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                    isActive ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* MODAL MAIN BODY CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ========================================================================= */}
          {/* TAB 1: FICHA Y ESTRUCTURA ORGANIZACIONAL */}
          {/* ========================================================================= */}
          {activeTab === 'FICHA' && (
            <div className="space-y-6">
              
              {/* Relaciones 7 dimensiones */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span>Relaciones Organizacionales Principales (Normalización 3NF)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">ID Ref: {collaborator.id}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Empresa</span>
                    <span className="text-xs font-bold text-slate-900 block">{collaborator.empresaNombre}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Sede Operativa</span>
                    <span className="text-xs font-bold text-slate-900 block">{collaborator.sedeNombre}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Área Organizacional</span>
                    <span className="text-xs font-bold text-slate-900 block">{collaborator.areaNombre}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Cargo Asignado</span>
                    <span className="text-xs font-bold text-slate-900 block">{collaborator.cargoNombre}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Proyecto</span>
                    <span className="text-xs font-bold text-indigo-600 block">{collaborator.proyectoNombre || 'Sin asignar'}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Centro de Trabajo</span>
                    <span className="text-xs font-bold text-slate-900 block">{collaborator.centroTrabajoNombre}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Tipo de Contrato</span>
                    <span className="text-xs font-bold text-emerald-700 block">{collaborator.tipoContratoNombre}</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Modalidad & Jornada</span>
                    <span className="text-xs font-bold text-slate-900 block">{collaborator.modalidadNombre} ({collaborator.jornadaNombre})</span>
                  </div>
                </div>
              </div>

              {/* Personal Info & Contact details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-purple-600" />
                    <span>Información de Contacto y Fechas</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500 font-bold">Correo Corporativo:</span>
                      <span className="font-mono font-bold text-slate-800">{collaborator.correoCorporativo || 'No registrado'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500 font-bold">Correo Personal:</span>
                      <span className="font-mono font-bold text-slate-800">{collaborator.correoPersonal || 'No registrado'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500 font-bold">Celular / Móvil:</span>
                      <span className="font-mono font-bold text-slate-800">{collaborator.celular || 'No registrado'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500 font-bold">Fecha de Ingreso:</span>
                      <span className="font-mono font-bold text-indigo-600">{collaborator.fechaIngreso}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Fecha de Nacimiento:</span>
                      <span className="font-mono font-bold text-slate-800">{collaborator.fechaNacimiento}</span>
                    </div>
                  </div>
                </div>

                {/* Health & Emergency Details */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-4">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-600" />
                    <span>Expediente de Salud, EPS & Emergencia</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500 font-bold">EPS Afiliada:</span>
                      <span className="font-bold text-slate-800">{collaborator.eps || 'SURA EPS'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500 font-bold">Fondo de Pensiones (AFP):</span>
                      <span className="font-bold text-slate-800">{collaborator.afp || 'Protección'}</span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500 font-bold">Grupo Sanguíneo (RH):</span>
                      <span className="font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {collaborator.grupoSanguineo || 'O+'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <span className="text-slate-500 font-bold">Contacto Emergencia:</span>
                      <span className="font-bold text-slate-800">{collaborator.contactoEmergenciaNombre || 'Familia'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-bold">Teléfono Emergencia:</span>
                      <span className="font-mono font-bold text-slate-800">{collaborator.contactoEmergenciaTelefono || 'N/A'}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: HISTORIAL DE ENCUESTAS DILIGENCIADAS */}
          {/* ========================================================================= */}
          {activeTab === 'ENCUESTAS' && (
            <div className="space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-indigo-600" />
                    <span>Historial de Encuestas Diligenciadas por el Colaborador ({surveyHistory.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Toda encuesta diligenciada se vincula automáticamente al expediente digital con marca de tiempo.
                  </p>
                </div>

                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  100% Sincronización Automática
                </span>
              </div>

              {surveyHistory.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">No hay encuestas registradas para este colaborador.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {surveyHistory.map(survey => (
                    <div key={survey.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-xs">{survey.tituloEncuesta}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-indigo-100 text-indigo-700 border border-indigo-200">
                            {survey.tipoEncuesta}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{new Date(survey.fechaRespuesta).toLocaleString()}</span>
                          </span>
                          <span>•</span>
                          <span>{survey.respuestasCount} respuestas capturadas</span>
                          {survey.campañaNombre && (
                            <>
                              <span>•</span>
                              <span className="text-indigo-600 font-bold">{survey.campañaNombre}</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-3 py-1 bg-emerald-600 text-white rounded-xl text-[10px] font-black shadow-2xs flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{survey.estado}</span>
                        </span>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: HISTORIAL DE CAMBIOS (AUDIT TRAIL) */}
          {/* ========================================================================= */}
          {activeTab === 'HISTORIAL' && (
            <div className="space-y-4">
              
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600" />
                  <span>Historial Auditado de Cambios en la Ficha del Colaborador ({changeHistory.length})</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Trazabilidad histórica de modificaciones hechas en el maestro de empleados o sincronizaciones automáticas.
                </p>
              </div>

              {changeHistory.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-500">Sin historial de cambios registrado.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-900 text-white font-extrabold text-[10px] uppercase">
                      <tr>
                        <th className="p-3">Fecha y Hora</th>
                        <th className="p-3">Campo Modificado</th>
                        <th className="p-3">Valor Anterior</th>
                        <th className="p-3">Valor Nuevo</th>
                        <th className="p-3">Origen</th>
                        <th className="p-3">Usuario</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {changeHistory.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                            {new Date(log.fecha).toLocaleString()}
                          </td>
                          <td className="p-3 font-extrabold text-indigo-700 font-mono">
                            {log.campoModificado}
                          </td>
                          <td className="p-3 text-rose-600 bg-rose-50/50 rounded font-mono text-[11px]">
                            {log.valorAnterior}
                          </td>
                          <td className="p-3 text-emerald-700 bg-emerald-50/50 rounded font-mono text-[11px]">
                            {log.valorNuevo}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                              log.origen === 'EXCEL' ? 'bg-amber-100 text-amber-800' :
                              log.origen === 'ENCUESTA_SYNC' ? 'bg-purple-100 text-purple-800' :
                              'bg-slate-100 text-slate-800'
                            }`}>
                              {log.origen}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[10px] text-slate-400">
                            {log.usuario}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: HISTORIAL DE REPORTES */}
          {/* ========================================================================= */}
          {activeTab === 'REPORTES' && (
            <div className="space-y-4">
              
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Historial de Reportes e Informes Asociados</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Archivos de caracterización sociodemográfica, clima y riesgo psicosocial generados para este colaborador.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {reportHistory.map(rep => (
                  <div key={rep.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="font-bold text-slate-900 text-xs block">{rep.titulo}</span>
                      <span className="text-[10px] font-mono text-slate-400 block">{rep.codigoReporte} • {new Date(rep.fechaGeneracion).toLocaleDateString()}</span>
                    </div>

                    <button
                      onClick={() => alert(`Descargando reporte ${rep.codigoReporte} en formato ${rep.formato}...`)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-300" />
                      <span>{rep.formato}</span>
                    </button>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: CARNET DIGITAL & FICHA PRINTABLE */}
          {/* ========================================================================= */}
          {activeTab === 'CARNET' && (
            <div className="space-y-6 max-w-xl mx-auto py-4">
              
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border-2 border-indigo-500/30 space-y-6 relative overflow-hidden">
                
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-indigo-400" />
                    <span className="font-extrabold text-sm text-white tracking-wider uppercase font-mono">
                      {collaborator.empresaNombre}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black border border-emerald-400/30">
                    EXPEDIENTE VERIFICADO SG-SST
                  </span>
                </div>

                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-black text-3xl flex items-center justify-center border-2 border-white/20 shadow-md">
                    {collaborator.nombres.charAt(0)}{collaborator.apellidos.charAt(0)}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">{collaborator.nombres} {collaborator.apellidos}</h3>
                    <p className="text-xs text-indigo-200 font-bold">{collaborator.cargoNombre}</p>
                    <p className="text-[11px] text-slate-300">{collaborator.areaNombre}</p>
                    <p className="text-xs font-mono font-bold text-amber-300">{collaborator.tipoIdentificacion}: {collaborator.numeroIdentificacion}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Sede</span>
                    <span className="font-bold text-white block truncate">{collaborator.sedeNombre}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Centro de Trabajo</span>
                    <span className="font-bold text-white block truncate">{collaborator.centroTrabajoNombre}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Tipo Contrato</span>
                    <span className="font-bold text-emerald-400 block truncate">{collaborator.tipoContratoNombre}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Modalidad</span>
                    <span className="font-bold text-white block truncate">{collaborator.modalidadNombre}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-white/10">
                  <span>ID: {collaborator.id}</span>
                  <span>Generado: {new Date().toLocaleDateString()}</span>
                </div>

              </div>

              <div className="text-center">
                <button
                  onClick={handlePrint}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Carnet de Seguridad</span>
                </button>
              </div>

            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0 font-bold">
          <span className="text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Maestro de Colaboradores Enterprise • Integridad 3NF</span>
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer transition-all"
          >
            Cerrar Expediente
          </button>
        </div>

      </motion.div>
    </div>
  );
}
