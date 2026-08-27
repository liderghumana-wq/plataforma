import React, { useState } from 'react';
import { X, RefreshCw, ClipboardList, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { colaboradoresService } from '../colaboradoresService';

interface ActualizarDesdeEncuestaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentCompanyId?: string;
}

export function ActualizarDesdeEncuestaModal({
  isOpen,
  onClose,
  onSuccess,
  currentCompanyId = 'empresa_main_001'
}: ActualizarDesdeEncuestaModalProps) {

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);
  const [actualizadosCount, setActualizadosCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleRunSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const result = colaboradoresService.actualizarColaboradoresDesdeEncuestas(currentCompanyId);
      setSyncLogs(result.log);
      setActualizadosCount(result.actualizados);
      setIsSyncing(false);
      onSuccess();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] text-left text-slate-800"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-lg flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-purple-400" />
              <span>Sincronizar y Actualizar desde Encuestas</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Actualiza automáticamente los expedientes de colaboradores a partir de las respuestas registradas en encuestas sociodemográficas.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-bold text-slate-700 flex-1">
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-2 text-purple-950">
            <span className="font-black text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Sincronizador Inteligente SG-SST</span>
            </span>
            <p className="text-[11px] font-medium text-purple-900 leading-relaxed">
              Esta función escanea las encuestas diligenciadas por los empleados (Sociodemográfica, Clima, Riesgo Psicosocial) y homologa cambios recientes en género, estado civil, teléfono, correo o hábitos de salud en la Ficha Maestro del Colaborador.
            </p>
          </div>

          <div className="text-center py-4 space-y-3">
            <button
              onClick={handleRunSync}
              disabled={isSyncing}
              className={`px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-black text-xs shadow-md inline-flex items-center gap-2 transition-all cursor-pointer ${
                isSyncing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Analizando Encuestas...' : 'Iniciar Sincronización de Expedientes'}</span>
            </button>
          </div>

          {actualizadosCount !== null && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-950">
                <span className="font-extrabold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Proceso Completado con Éxito</span>
                </span>
                <span className="font-mono text-xs font-black">{actualizadosCount} Expedientes Actualizados</span>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 font-mono text-[11px]">
                <span className="font-extrabold text-slate-800 block text-[10px] uppercase font-sans">Registro de Ejecución:</span>
                {syncLogs.map((log, idx) => (
                  <p key={idx} className="text-slate-600">{log}</p>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-bold">
          <span className="text-[11px] text-slate-400">Master Data Service Auto-Association</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </motion.div>
    </div>
  );
}
