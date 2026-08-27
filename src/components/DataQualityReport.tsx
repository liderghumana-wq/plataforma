import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  FileCheck, 
  XOctagon, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  CheckCircle2, 
  Info,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock
} from 'lucide-react';
import { DataQualityReport as DataQualityReportType, DataQualityIssue } from '../types';

interface Props {
  report: DataQualityReportType;
}

export const DataQualityReport: React.FC<Props> = ({ report }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const {
    recordsRead,
    recognizedVariablesCount,
    totalVariablesCount,
    missingVariablesCount,
    incompleteRecordsCount,
    outOfRangeCount,
    duplicateRecordsCount,
    normalizedVariablesCount,
    qualityPercentage,
    qualityLevel,
    warnings,
    details = []
  } = report;

  // Filter issues based on search term (row, variable, or observation)
  const filteredDetails = details.filter(issue => {
    const searchLower = searchTerm.toLowerCase();
    return (
      issue.row.toString().includes(searchLower) ||
      issue.variable.toLowerCase().includes(searchLower) ||
      (issue.value ? issue.value.toLowerCase().includes(searchLower) : '') ||
      issue.observation.toLowerCase().includes(searchLower)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDetails.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIssues = filteredDetails.slice(indexOfFirstItem, indexOfLastItem);

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Color config depending on level
  const levelConfig = {
    Excelente: {
      bg: 'bg-emerald-50 border-emerald-100 text-emerald-800',
      badge: 'bg-emerald-500 text-white',
      ring: 'text-emerald-500',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />,
      text: 'Excelente',
      dot: 'bg-emerald-500'
    },
    Buena: {
      bg: 'bg-teal-50 border-teal-100 text-teal-800',
      badge: 'bg-teal-500 text-white',
      ring: 'text-teal-500',
      icon: <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />,
      text: 'Buena',
      dot: 'bg-teal-500'
    },
    Regular: {
      bg: 'bg-amber-50 border-amber-100 text-amber-800',
      badge: 'bg-amber-500 text-white',
      ring: 'text-amber-500',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      text: 'Regular',
      dot: 'bg-amber-500'
    },
    Deficiente: {
      bg: 'bg-rose-50 border-rose-100 text-rose-800',
      badge: 'bg-rose-500 text-white',
      ring: 'text-rose-500',
      icon: <XOctagon className="w-5 h-5 text-rose-600 shrink-0" />,
      text: 'Deficiente',
      dot: 'bg-rose-500'
    }
  }[qualityLevel] || {
    bg: 'bg-slate-50 border-slate-100 text-slate-800',
    badge: 'bg-slate-500 text-white',
    ring: 'text-slate-500',
    icon: <Info className="w-5 h-5 text-slate-600 shrink-0" />,
    text: 'Revisar',
    dot: 'bg-slate-500'
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/50 p-6 space-y-6 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-100/60" id="data-quality-card">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Módulo Profesional de Calidad de Datos
              </h3>
              <p className="text-xs text-slate-500 font-medium leading-normal">
                Análisis heurístico, auditoría de rangos lógicos e identificación de inconsistencias.
              </p>
            </div>
          </div>
        </div>

        {/* Quality level pill */}
        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${levelConfig.bg} self-start sm:self-center transition-all duration-200 hover:scale-102`}>
          <span className="text-xs font-bold">Diagnóstico:</span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-white shadow-xs">
            <span className={`w-2 h-2 rounded-full ${levelConfig.dot} animate-pulse`}></span>
            <span>{levelConfig.text}</span>
          </span>
        </div>
      </div>

      {/* Main Stats layout: circular score + grid cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Quality ring percentage (left 4 cols on md) */}
        <div className="md:col-span-4 bg-slate-50/60 rounded-2xl border border-slate-100/60 p-5 flex flex-col items-center justify-center text-center space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Calidad del Archivo</span>
          
          <div className="relative flex items-center justify-center w-36 h-36">
            {/* SVG circle ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="72"
                cy="72"
                r="62"
                className="stroke-slate-100"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r="62"
                className={`transition-all duration-1000 ease-out ${
                  qualityPercentage >= 95 ? 'stroke-emerald-500' :
                  qualityPercentage >= 80 ? 'stroke-teal-500' :
                  qualityPercentage >= 50 ? 'stroke-amber-500' : 'stroke-rose-500'
                }`}
                strokeWidth="12"
                strokeDasharray={389.5} // 2 * pi * r (62) = 389.55
                strokeDashoffset={389.5 - (389.5 * qualityPercentage) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-800 tracking-tighter">
                {qualityPercentage}%
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Índice Gral</span>
            </div>
          </div>
          
          <div className="text-xs font-semibold text-slate-500 max-w-[200px]">
            {qualityPercentage >= 95 ? 'Base de datos íntegra con excelente nivel de consistencia.' :
             qualityPercentage >= 80 ? 'Base de datos confiable con leves sugerencias de normalización.' :
             qualityPercentage >= 50 ? 'Se requiere atención a registros con valores atípicos o celdas vacías.' :
             'Inconsistencias críticas detectadas. Es prioritario depurar el archivo original.'}
          </div>
        </div>

        {/* Dashboard grid cards (right 8 cols on md) */}
        <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Analizados</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800">{recordsRead}</span>
              <span className="text-xs text-slate-400 font-semibold">filas</span>
            </div>
          </div>

          <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variables Reconocidas</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-black text-slate-800">{recognizedVariablesCount}</span>
              <span className="text-xs text-slate-400 font-semibold">de {totalVariablesCount}</span>
            </div>
          </div>

          <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Variables Faltantes</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black ${missingVariablesCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {missingVariablesCount}
              </span>
              <span className="text-xs text-slate-400 font-semibold">obligatorias</span>
            </div>
          </div>

          <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registros Incompletos</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black ${incompleteRecordsCount > 0 ? 'text-amber-600 font-extrabold' : 'text-slate-800'}`}>
                {incompleteRecordsCount}
              </span>
              <span className="text-xs text-slate-400 font-semibold">con vacíos</span>
            </div>
          </div>

          <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valores Fuera Rango</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black ${outOfRangeCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
                {outOfRangeCount}
              </span>
              <span className="text-xs text-slate-400 font-semibold">extremos</span>
            </div>
          </div>

          <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-100 flex flex-col justify-between hover:bg-slate-50 transition-colors">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Duplicados</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-2xl font-black ${duplicateRecordsCount > 0 ? 'text-red-500' : 'text-slate-800'}`}>
                {duplicateRecordsCount}
              </span>
              <span className="text-xs text-slate-400 font-semibold">filas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Warnings compilation alert panel (if any warnings) */}
      {warnings.length > 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4.5 space-y-3">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <ShieldAlert className="w-4.5 h-4.5 text-indigo-500 shrink-0" />
            <span>Resumen de Alertas y Ajustes ({warnings.length})</span>
          </h4>
          <ul className="text-xs text-slate-600 space-y-2 list-disc pl-5">
            {warnings.map((warning, idx) => (
              <li key={idx} className="font-semibold leading-relaxed">
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accordion / Table Details trigger */}
      <div className="pt-2">
        <button
          onClick={() => {
            setShowDetails(!showDetails);
            setCurrentPage(1); // reset to first page when opening
          }}
          className="w-full flex items-center justify-between py-3 px-5 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 rounded-2xl text-indigo-700 text-xs font-black transition-all cursor-pointer shadow-xs select-none hover:shadow-md hover:scale-101 duration-200"
          id="btn-view-quality-details"
        >
          <span className="flex items-center gap-2">
            <Layers className="w-4.5 h-4.5" />
            <span>
              {showDetails ? 'Ocultar Detalle Diagnóstico' : 'Ver Detalle Diagnóstico (Tabla de Inconsistencias)'}
            </span>
            <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              {details.length} incidencias
            </span>
          </span>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {/* Collapsible content block */}
        {showDetails && (
          <div className="mt-4 border border-slate-100 rounded-2xl p-4 space-y-4 bg-slate-50/20">
            {/* Search filter row */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar por variable, observación o fila (ej: 'Edad', 'Vacío', '24')..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset page on filter
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div className="text-[11px] text-slate-400 font-semibold shrink-0">
                Mostrando {filteredDetails.length} de {details.length} incidencias
              </div>
            </div>

            {/* Inconsistencies Table */}
            {filteredDetails.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                No se encontraron incidencias que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Fila</th>
                      <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Variable</th>
                      <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Valor reportado</th>
                      <th className="py-3 px-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Observación diagnóstica</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {currentIssues.map((issue, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4 font-extrabold text-indigo-600">
                          #{issue.row}
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-700">
                          {issue.variable}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            issue.value === 'Vacío' 
                              ? 'bg-amber-50 text-amber-700' 
                              : issue.value === 'Fila duplicada'
                              ? 'bg-rose-50 text-rose-700 font-bold'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {issue.value}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium leading-normal">
                          {issue.observation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <div className="text-slate-400 font-bold">
                  Página {currentPage} de {totalPages}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
