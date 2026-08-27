import React from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  Users, 
  Building2, 
  Key, 
  CheckCircle2, 
  Calendar, 
  ArrowRight
} from 'lucide-react';
import { licenseService } from '../../administracion_saas/services/licenseService';
import { CentroEjecutivoTab } from '../types/centroEjecutivo.types';

interface LicenciamientoCapacidadTabProps {
  activeCompanyId: string;
  onNavigateTab: (tab: CentroEjecutivoTab) => void;
}

export const LicenciamientoCapacidadTab: React.FC<LicenciamientoCapacidadTabProps> = ({
  activeCompanyId,
  onNavigateTab
}) => {
  const capacity = licenseService.validateCapacity(activeCompanyId, 482, 8, 3);
  const license = licenseService.getCompanyLicense(activeCompanyId);
  const catalog = licenseService.getModuleCatalog();
  const assignments = licenseService.getCompanyModuleAssignments(activeCompanyId, license?.planId || 'EMPRESARIAL');

  const modulesWithDetails = catalog.map(cat => {
    const assign = assignments.find(a => a.moduloId === cat.id);
    const isActive = assign?.estado === 'ACTIVO';
    return {
      id: cat.id,
      nombre: cat.nombre,
      categoria: cat.categoria,
      activo: isActive,
      estado: assign?.estado || 'INACTIVO'
    };
  });

  return (
    <div className="space-y-6">
      {/* Plan Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Cpu className="w-3.5 h-3.5" />
              <span>Suscripción Empresarial SaaS</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
              Plan {license?.planId || 'EMPRESARIAL'}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              Licencia multiempresa con procesamiento en tiempo real, motor centralizado de indicadores SG-SST, auditoría inmutable y módulos de Inteligencia Artificial.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0 space-y-1 text-center md:text-right">
            <span className="text-[10px] font-bold text-slate-300 uppercase block">Vigencia del Servicio</span>
            <div className="text-lg font-black text-white flex items-center justify-center md:justify-end gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-300" />
              <span>{capacity.diasParaVencer} días restantes</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-bold block">
              Estado: {license?.estado || 'ACTIVA'}
            </span>
          </div>
        </div>
      </div>

      {/* Capacity Usage Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Colaboradores */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900">
              {capacity.colaboradoresPorcentaje}%
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">Cupo de Colaboradores</h3>
            <span className="text-xs text-slate-500">
              {capacity.colaboradoresActuales} registrados de {capacity.colaboradoresLimite} contratados
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full ${
                capacity.colaboradoresPorcentaje >= 90 ? 'bg-rose-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${Math.min(100, capacity.colaboradoresPorcentaje)}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500 pt-1">
            Disponible: <strong>{capacity.colaboradoresLimite - capacity.colaboradoresActuales} cupos</strong>
          </div>
        </div>

        {/* Usuarios del Sistema */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900">
              {capacity.usuariosPorcentaje}%
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">Usuarios con Acceso</h3>
            <span className="text-xs text-slate-500">
              {capacity.usuariosActuales} activos de {capacity.usuariosLimite} permitidos
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="h-full rounded-full bg-emerald-600"
              style={{ width: `${Math.min(100, capacity.usuariosPorcentaje)}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500 pt-1">
            Disponible: <strong>{capacity.usuariosLimite - capacity.usuariosActuales} cuentas</strong>
          </div>
        </div>

        {/* Sedes / Centros de Trabajo */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-slate-900">
              {capacity.sedesPorcentaje}%
            </span>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900">Sedes & Centros</h3>
            <span className="text-xs text-slate-500">
              {capacity.sedesActuales} configuradas de {capacity.sedesLimite} habilitadas
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div 
              className="h-full rounded-full bg-purple-600"
              style={{ width: `${Math.min(100, capacity.sedesPorcentaje)}%` }}
            />
          </div>

          <div className="text-[11px] text-slate-500 pt-1">
            Disponible: <strong>{capacity.sedesLimite - capacity.sedesActuales} sedes</strong>
          </div>
        </div>
      </div>

      {/* Active Modules Matrix */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600" />
          Módulos Autorizados en la Licencia
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {modulesWithDetails.map((mod) => (
            <div 
              key={mod.id}
              className={`p-3 rounded-2xl border flex items-center justify-between text-xs font-bold ${
                mod.activo
                  ? 'bg-slate-50 border-slate-200 text-slate-800'
                  : 'bg-slate-50/40 border-slate-100 text-slate-400 opacity-60'
              }`}
            >
              <span className="truncate mr-2">{mod.nombre}</span>
              {mod.activo ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <span className="text-[10px] text-slate-400 font-semibold shrink-0">Inactivo</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
