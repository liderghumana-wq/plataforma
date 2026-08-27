import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Clock, 
  Download, 
  ArrowLeft, 
  FileText, 
  PieChart, 
  TrendingUp, 
  CheckCircle2, 
  Award,
  Search,
  Filter,
  Upload,
  ShieldCheck,
  Eye,
  Lock
} from 'lucide-react';
import { EncuestaMeta, RespuestaEncuestaRegistro, RespuestaEncuestaItem } from '../types';
import { builderEncuestasService } from '../builder.service';
import { ExcelSurveyImporter } from './ExcelSurveyImporter';
import { formatOtroForExcel, getOtroDisplayText, parseOtroValue } from '../otroHelper';

interface SurveyAnalyticsProps {
  encuesta: EncuestaMeta;
  empresaId: string;
  onBack: () => void;
}

export function SurveyAnalytics({ encuesta, empresaId, onBack }: SurveyAnalyticsProps) {
  const [respuestas, setRespuestas] = useState<RespuestaEncuestaRegistro[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showImporter, setShowImporter] = useState(false);
  const [modoPrivacidad, setModoPrivacidad] = useState<'agregada' | 'salud_sensible'>('agregada');

  const reloadRespuestas = () => {
    const list = builderEncuestasService.getRespuestas(empresaId, encuesta.id);
    setRespuestas(list);
  };

  useEffect(() => {
    reloadRespuestas();
  }, [encuesta, empresaId]);

  const totalRespuestas = respuestas.length;
  const tiempoPromedioSegundos = totalRespuestas > 0 
    ? Math.round(respuestas.reduce((acc, r) => acc + (r.tiempoCompletadoSegundos || 0), 0) / totalRespuestas)
    : 0;

  const filteredRespuestas = respuestas.filter(r => 
    (r.usuarioNombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.usuarioIdentificacion || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export CSV
  const handleExportCSV = () => {
    if (respuestas.length === 0) {
      alert('No hay respuestas registradas para exportar.');
      return;
    }

    const questions = encuesta.secciones.flatMap(s => s.preguntas);
    const headers = ['ID Respuesta', 'Fecha', 'Trabajador', 'Identificación'];
    
    questions.forEach(q => {
      headers.push(`"${q.titulo.replace(/"/g, '""')}"`);
      headers.push(`"${q.titulo.replace(/"/g, '""')} (Especificación Otro)"`);
    });

    const rows = respuestas.map(resp => {
      const rowVals = [
        resp.id,
        new Date(resp.fechaRespuesta).toLocaleString('es-CO'),
        resp.usuarioNombre || 'Anónimo',
        resp.usuarioIdentificacion || 'N/A'
      ];

      questions.forEach(q => {
        const item = resp.respuestas[q.id];
        const formatted = formatOtroForExcel(q.id, item?.valor);
        const respMain = formatted[q.id] || '';
        const respOtro = formatted[`${q.id}Otro`] || '';
        rowVals.push(`"${String(respMain).replace(/"/g, '""')}"`);
        rowVals.push(`"${String(respOtro).replace(/"/g, '""')}"`);
      });

      return rowVals.join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `respuestas_${encuesta.codigo}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Group "Otro" responses by question and specified value
  const otroAnalytics: Array<{ questionTitle: string; otherValue: string; count: number }> = [];
  if (respuestas.length > 0) {
    const countsMap: Record<string, { questionTitle: string; otherValue: string; count: number }> = {};
    respuestas.forEach(r => {
      Object.entries(r.respuestas).forEach(([qId, item]: [string, any]) => {
        if (!item || item.valor === undefined) return;
        const checkVals = Array.isArray(item.valor) ? item.valor : [item.valor];
        checkVals.forEach(val => {
          const { isOtro, otherValue } = parseOtroValue(val);
          if (isOtro && otherValue && otherValue.trim() !== '') {
            const normalizedSpec = otherValue.trim();
            const key = `${qId}___${normalizedSpec.toLowerCase()}`;
            if (!countsMap[key]) {
              countsMap[key] = {
                questionTitle: item.preguntaTitulo || qId,
                otherValue: normalizedSpec,
                count: 0
              };
            }
            countsMap[key].count += 1;
          }
        });
      });
    });
    otroAnalytics.push(...Object.values(countsMap).sort((a, b) => b.count - a.count));
  }

  return (
    <div className="space-y-6 text-left text-slate-800">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                Analítica de Respuestas
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">{encuesta.codigo}</span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              {encuesta.titulo}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Privacy Toggle */}
          <button
            onClick={() => setModoPrivacidad(prev => prev === 'agregada' ? 'salud_sensible' : 'agregada')}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
              modoPrivacidad === 'salud_sensible'
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
            title="Cambiar nivel de confidencialidad de datos médicos"
          >
            {modoPrivacidad === 'salud_sensible' ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Vista Médica SG-SST</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
                <span>Vista Agregada (Anónima)</span>
              </>
            )}
          </button>

          {/* Import Excel */}
          <button
            onClick={() => setShowImporter(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar Excel</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            disabled={respuestas.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              respuestas.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Excel Importer Modal */}
      {showImporter && (
        <ExcelSurveyImporter
          encuesta={encuesta}
          empresaId={empresaId}
          onClose={() => setShowImporter(false)}
          onImportSuccess={() => {
            reloadRespuestas();
          }}
        />
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">{totalRespuestas}</span>
            <span className="text-xs font-bold text-slate-500 block mt-1">Total de Encuestas Completadas</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {Math.floor(tiempoPromedioSegundos / 60)}m {tiempoPromedioSegundos % 60}s
            </span>
            <span className="text-xs font-bold text-slate-500 block mt-1">Tiempo Promedio de Diligenciamiento</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              v{encuesta.version}
            </span>
            <span className="text-xs font-bold text-slate-500 block mt-1">
              Estado: <strong className="capitalize text-slate-800">{encuesta.estado}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Aggregated "Otro" Specification Analysis */}
      {otroAnalytics.length > 0 && (
        <div className="bg-amber-50/70 p-6 rounded-3xl border border-amber-200/80 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-3">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-700" />
              <div>
                <h3 className="text-sm font-extrabold text-amber-950">
                  Análisis de Opciones "Otro" y Nuevas Categorías Recurrentes
                </h3>
                <p className="text-[11px] text-amber-800">
                  Consolidado de especificaciones escritas por usuarios en el campo obligatorio "¿Cuál?". Utiles para parametrizar nuevas opciones fijas.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-amber-200/60 text-amber-900 rounded-full font-mono">
              {otroAnalytics.length} Especificaciones
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {otroAnalytics.map((item, idx) => (
              <div key={idx} className="p-3 bg-white rounded-2xl border border-amber-200 flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 block uppercase tracking-wider">{item.questionTitle}</span>
                  <span className="text-xs font-extrabold text-slate-900 block mt-0.5">"{item.otherValue}"</span>
                </div>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-extrabold text-xs rounded-xl shrink-0">
                  {item.count} {item.count === 1 ? 'respuesta' : 'respuestas'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <h3 className="text-sm font-extrabold text-slate-900">
            Registros Individuales de Respuesta ({filteredRespuestas.length})
          </h3>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por trabajador o cédula..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {filteredRespuestas.length === 0 ? (
          <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600">No hay respuestas registradas aún para esta encuesta.</p>
            <p className="text-[11px] text-slate-400 mt-1">Pruebe el diligenciamiento usando el botón "Vista Previa / Probar".</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Trabajador</th>
                  <th className="py-3 px-3">Identificación</th>
                  <th className="py-3 px-3">Duración</th>
                  <th className="py-3 px-3">Respuestas Clave</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRespuestas.map((r) => {
                  const keyAnswers: RespuestaEncuestaItem[] = Object.values(r.respuestas).slice(0, 3) as RespuestaEncuestaItem[];

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono text-slate-500 font-bold whitespace-nowrap">
                        {new Date(r.fechaRespuesta).toLocaleDateString('es-CO', {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900 whitespace-nowrap">
                        {r.usuarioNombre || 'Anónimo'}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-600 font-semibold">
                        {r.usuarioIdentificacion || 'N/A'}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-700">
                        {r.tiempoCompletadoSegundos}s
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-wrap gap-1">
                          {keyAnswers.map((item, idx) => (
                            <span key={idx} className="text-[10px] bg-indigo-50 text-indigo-800 font-bold px-2 py-0.5 rounded-md border border-indigo-100">
                              {item.preguntaTitulo.substring(0, 15)}...: {typeof item.valor === 'object' ? 'Adjunto/GPS' : String(item.valor)}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
