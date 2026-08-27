import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Flame, 
  Eye, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  HelpCircle,
  FileCheck2
} from 'lucide-react';
import { CentroEjecutivoTab } from '../types/centroEjecutivo.types';

interface RiesgosPrioritariosTabProps {
  activeCompanyId: string;
  onNavigateTab: (tab: CentroEjecutivoTab) => void;
}

export const RiesgosPrioritariosTab: React.FC<RiesgosPrioritariosTabProps> = ({
  activeCompanyId,
  onNavigateTab
}) => {
  const riesgos = [
    {
      id: 'rsk_01',
      categoria: 'BIOMECANICO_ERGONOMICO',
      nivel: 'ALTO',
      titulo: 'Riesgo Biomecánico por Postura Sedente Prolongada & Trabajo en Pantalla',
      poblacionExpuesta: '85% del censo (Personal administrativo y de operaciones)',
      origenEvidencia: 'Actividad económica CIIU (Servicios de TI & Consultoría) y perfil laboral.',
      impacto: 'Incidencia potencial en desórdenes musculoesqueléticos y ausentismo no programado.',
      medidaPreventiva: 'Programa de pausas activas digitalizadas e inspecciones ergonómicas de puestos de trabajo.',
      norma: 'GTC 45 / Resolución 2400 de 1979'
    },
    {
      id: 'rsk_02',
      categoria: 'PSICOSOCIAL',
      nivel: 'MEDIO_ALTO',
      titulo: 'Exposición a Factores Psicosociales Intralaborales (Carga Mental)',
      poblacionExpuesta: 'Colaboradores con alta demanda cognitiva y cumplimiento de SLAs',
      origenEvidencia: 'Caracterización de turnos y responsabilidades técnicas.',
      impacto: 'Estrés laboral y fatiga en períodos de cierre de proyectos.',
      medidaPreventiva: 'Aplicación de la Batería de Riesgo Psicosocial por especialista con licencia vigente.',
      norma: 'Resolución 2764 de 2022'
    },
    {
      id: 'rsk_03',
      categoria: 'CALIDAD_INFORMACION',
      nivel: 'MEDIO',
      titulo: 'Incompletitud en Variables de Centro de Costos & Modalidad de Trabajo',
      poblacionExpuesta: 'Registros de nómina con campos opcionales sin diligenciar',
      origenEvidencia: 'Diagnóstico del DataQualityEngine en el censo maestro.',
      impacto: 'Dificultad para segmentar ausentismos por sede o proyecto específico.',
      medidaPreventiva: 'Carga masiva estandarizada vía Validador de Datos Excel.',
      norma: 'Decreto 1072 de 2015 Art. 2.2.4.6.12'
    },
    {
      id: 'rsk_04',
      categoria: 'REGULATORIO',
      nivel: 'BAJO_CONTROL',
      titulo: 'Vigencia de Estándares Mínimos del SG-SST (Tabla de Valores)',
      poblacionExpuesta: 'Toda la organización',
      origenEvidencia: 'Checklist de activación y parametrización empresarial.',
      impacto: 'Riesgo de sanción administrativa por entes de control en caso de auditoría.',
      medidaPreventiva: 'Monitoreo mensual de evidencias en la Consola Ejecutiva 360.',
      norma: 'Resolución 0312 de 2019'
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            Matriz de Riesgos Prioritarios
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
            Mapeo de Amenazas & Factores de Riesgo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Identificación de peligros basada en la actividad económica real, el perfil de cargos y la calidad de datos.
          </p>
        </div>

        <span className="px-3.5 py-1.5 bg-rose-50 text-rose-700 rounded-full text-xs font-bold border border-rose-200 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-rose-600" />
          4 Ejes Priorizados
        </span>
      </div>

      {/* Risks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {riesgos.map((r) => (
          <div 
            key={r.id}
            className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {r.categoria}
                </span>
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                  r.nivel === 'ALTO'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : r.nivel === 'MEDIO_ALTO' || r.nivel === 'MEDIO'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}>
                  Nivel {r.nivel}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {r.titulo}
              </h3>

              <div className="space-y-2 text-xs">
                <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Población Expuesta:</span>
                  <p className="font-semibold text-slate-800">{r.poblacionExpuesta}</p>
                </div>

                <div className="text-slate-600 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Evidencia de Origen:</span>
                  <p>{r.origenEvidencia}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-xs text-indigo-900 bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
                <span className="text-[10px] font-bold text-indigo-700 uppercase block mb-0.5">Medida Preventiva:</span>
                <p className="font-semibold">{r.medidaPreventiva}</p>
              </div>

              <div className="text-[11px] text-slate-400 font-medium">
                Marco: {r.norma}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
