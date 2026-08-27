import React, { useState } from 'react';
import { 
  AlertTriangle, 
  X, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Filter, 
  History, 
  ExternalLink,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { ExecutiveAlert, AlertStatus, AlertSeverity, AlertCategory } from '../types/centroEjecutivo.types';
import { alertasService } from '../services/alertasService';

interface AlertasPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeCompanyId: string;
}

export const AlertasPanel: React.FC<AlertasPanelProps> = ({
  isOpen,
  onClose,
  activeCompanyId
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [alertas, setAlertas] = useState<ExecutiveAlert[]>(() => alertasService.getAlertas(activeCompanyId));
  const [selectedAlert, setSelectedAlert] = useState<ExecutiveAlert | null>(null);
  const [justification, setJustification] = useState('');

  if (!isOpen) return null;

  const refreshAlerts = () => {
    setAlertas(alertasService.getAlertas(activeCompanyId));
  };

  const handleUpdateStatus = (alerta: ExecutiveAlert, newStatus: AlertStatus) => {
    alertasService.cambiarEstadoAlerta(
      activeCompanyId,
      alerta.id,
      newStatus,
      'Responsable de Dirección',
      justification || undefined
    );
    setJustification('');
    refreshAlerts();
    setSelectedAlert(null);
  };

  const filtered = alertas.filter(a => {
    if (selectedSeverity !== 'ALL' && a.severidad !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && a.estado !== selectedStatus) return false;
    return true;
  });

  const metricas = alertasService.getMetricasAlertas(activeCompanyId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Sistema Central de Alertas Ejecutivas
              </h2>
              <p className="text-xs text-slate-500">
                Monitoreo continuo de desvíos, riesgos normativos y calidad de información
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Severity Counters & Filters */}
        <div className="px-6 py-3 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedSeverity('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSeverity === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Todas ({metricas.total})
            </button>
            <button
              onClick={() => setSelectedSeverity('CRITICA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSeverity === 'CRITICA' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700'
              }`}
            >
              Críticas ({metricas.criticas})
            </button>
            <button
              onClick={() => setSelectedSeverity('ALTA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSeverity === 'ALTA' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700'
              }`}
            >
              Altas ({metricas.altas})
            </button>
            <button
              onClick={() => setSelectedSeverity('MEDIA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSeverity === 'MEDIA' ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700'
              }`}
            >
              Medias ({metricas.medias})
            </button>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400">Estado:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-700 focus:outline-none"
            >
              <option value="ALL">Todos los Estados</option>
              <option value="NUEVA">Nuevas</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="EN_GESTION">En Gestión</option>
              <option value="CERRADA">Cerradas</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No hay alertas activas en esta categoría.
            </div>
          ) : (
            filtered.map((alerta) => (
              <div 
                key={alerta.id}
                className="pt-4 first:pt-0 space-y-3"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                      alerta.severidad === 'CRITICA' ? 'bg-rose-100 text-rose-800' :
                      alerta.severidad === 'ALTA' ? 'bg-amber-100 text-amber-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {alerta.severidad}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {alerta.categoria}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Origen: {alerta.moduloOrigen}
                    </span>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    alerta.estado === 'CERRADA' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                    alerta.estado === 'EN_GESTION' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    Estado: {alerta.estado}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{alerta.titulo}</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alerta.descripcion}</p>
                </div>

                {/* Real Evidence */}
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs text-slate-700 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Evidencia Matemática:</span>
                  <p className="font-semibold text-slate-800">{alerta.evidencia}</p>
                </div>

                {/* Recommended Action & Action Trigger */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-indigo-700 font-semibold">
                    💡 Acción: {alerta.accionRecomendada}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setSelectedAlert(alerta)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Gestionar Estado
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal for state transition and justification */}
        {selectedAlert && (
          <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Cambiar Estado de Alerta
              </h3>
              <p className="text-xs text-slate-500">
                {selectedAlert.titulo}
              </p>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Nuevo Estado:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['NUEVA', 'EN_REVISION', 'EN_GESTION', 'CERRADA'] as AlertStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedAlert, st)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedAlert.estado === st ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Justificación (Auditoría):</label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explique el motivo del cambio..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-16"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
