import React, { useRef } from 'react';
import { 
  Building2, Calendar, FileText, CheckCircle2, AlertTriangle, ShieldCheck, 
  Users, Heart, Activity, Briefcase, Home, Award, AlertCircle, Info,
  PieChart as PieChartIcon, BarChart3, ChevronRight, Lock, Eye, Download, Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { ReportSnapshotPrompt38, ReportVariableDataPrompt38 } from '../../../core/reports/prompt38ReportTypes';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

interface Prompt38ExecutiveReportProps {
  snapshot: ReportSnapshotPrompt38;
  onPrint?: () => void;
  onExportCSV?: () => void;
}

export default function Prompt38ExecutiveReport({
  snapshot,
  onPrint,
  onExportCSV
}: Prompt38ExecutiveReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const { metadata, technicalSheet, methodology, qualitySummary, variables, indicators, nonCalculableIndicators, findings, limitations, recommendations, qualityAnnex, traceability, validationChecklist } = snapshot;

  const renderDistributionChart = (v: ReportVariableDataPrompt38, title: string, chartType: 'bar' | 'pie' = 'bar') => {
    if (!v.isCalculable || !v.distribution || v.distribution.length === 0) {
      return (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-6 text-center my-3">
          <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-2" />
          <h5 className="text-xs font-bold text-amber-900 mb-1">{title}</h5>
          <p className="text-xs text-amber-700 font-medium">{v.messageIfNoData || 'No fue posible calcular este indicador debido a información insuficiente.'}</p>
          <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-lg">
            <span>Denominador: {v.validCount} de {v.totalPopulation} ({v.coveragePercentage}% cobertura)</span>
          </div>
        </div>
      );
    }

    const chartData = v.distribution.map(d => ({
      name: d.label,
      count: d.count,
      percentage: d.percentage
    }));

    return (
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
          <div>
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{title}</h4>
            <p className="text-[11px] text-slate-500 font-medium">
              Denominador: <strong className="text-slate-700">{v.validCount}</strong> colaboradores válidos ({v.coveragePercentage}% cobertura)
              {v.average !== null && v.average !== undefined && (
                <span className="ml-2 bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-md">
                  Promedio: {v.average} {v.unit || ''}
                </span>
              )}
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md self-start sm:self-center">
            {v.coveragePercentage >= 80 ? 'Cobertura Óptima' : 'Cobertura Parcial'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          {/* Chart Area */}
          <div className="lg:col-span-7 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'pie' ? (
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={35}
                    paddingAngle={3}
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: any, name: any, item: any) => [
                      `${val} colaboradores (${item.payload.percentage}%)`,
                      name
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10, fill: '#64748b' }} 
                    angle={-20} 
                    textAnchor="end" 
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    formatter={(val: any, _: any, item: any) => [
                      `${val} colaboradores (${item.payload.percentage}%)`,
                      'Frecuencia'
                    ]}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-bar-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Structured Data Table */}
          <div className="lg:col-span-5 overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold">
                  <th className="py-1.5 px-2">Categoría</th>
                  <th className="py-1.5 px-2 text-right">N</th>
                  <th className="py-1.5 px-2 text-right">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {chartData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-1 px-2 font-medium text-slate-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="truncate max-w-[140px]">{row.name}</span>
                    </td>
                    <td className="py-1 px-2 text-right font-mono text-slate-600 font-semibold">{row.count}</td>
                    <td className="py-1 px-2 text-right font-mono font-bold text-slate-900">{row.percentage}%</td>
                  </tr>
                ))}
                {v.missingCount > 0 && (
                  <tr className="bg-amber-50/40 text-amber-800 font-medium">
                    <td className="py-1 px-2 italic">Sin información / No reportado</td>
                    <td className="py-1 px-2 text-right font-mono">{v.missingCount}</td>
                    <td className="py-1 px-2 text-right font-mono">
                      {((v.missingCount / v.totalPopulation) * 100).toFixed(1)}% (Total)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto" ref={reportRef}>
      
      {/* SECCIÓN 1: PORTADA */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-sm text-center relative overflow-hidden space-y-8">
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-indigo-600 via-cyan-500 to-emerald-500" />
        
        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
          {metadata.logo ? (
            <img src={metadata.logo} alt="Logo Empresa" className="h-16 object-contain max-w-[200px]" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Building2 className="w-8 h-8" />
            </div>
          )}
          
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/80">
              Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight pt-2">
              {metadata.reportTitle}
            </h1>
            <p className="text-base font-extrabold text-slate-700">{metadata.companyName}</p>
            <p className="text-xs text-slate-500 font-mono">NIT: {metadata.nit}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left pt-4 border-t border-slate-100">
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Periodo</span>
            <span className="text-xs font-extrabold text-slate-800">{metadata.period}</span>
          </div>
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fecha Emisión</span>
            <span className="text-xs font-extrabold text-slate-800">
              {new Date(metadata.generatedAt).toLocaleDateString('es-CO')}
            </span>
          </div>
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Versión Informe</span>
            <span className="text-xs font-extrabold text-indigo-600 font-mono">{metadata.reportVersion}</span>
          </div>
          <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cobertura</span>
            <span className="text-xs font-extrabold text-emerald-600 font-mono">{qualitySummary.overallCoveragePercentage}%</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: FICHA TÉCNICA */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">2. Ficha Técnica del Estudio</h2>
            <p className="text-xs text-slate-500 font-medium">Parámetros institucionales y alcance de la recolección de datos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
            <div className="flex justify-between p-3 bg-slate-50/50">
              <span className="font-semibold text-slate-500">Razón Social:</span>
              <span className="font-bold text-slate-900">{technicalSheet.companyName}</span>
            </div>
            <div className="flex justify-between p-3">
              <span className="font-semibold text-slate-500">NIT:</span>
              <span className="font-bold text-slate-900 font-mono">{technicalSheet.nit}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50/50">
              <span className="font-semibold text-slate-500">Periodo Evaluado:</span>
              <span className="font-bold text-slate-900">{technicalSheet.period}</span>
            </div>
            <div className="flex justify-between p-3">
              <span className="font-semibold text-slate-500">Población Total Registrada:</span>
              <span className="font-bold text-slate-900 font-mono">{technicalSheet.totalRegisteredEmployees} colaboradores</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50/50">
              <span className="font-semibold text-slate-500">Registros Evaluados:</span>
              <span className="font-bold text-slate-900 font-mono">{technicalSheet.evaluatedEmployeesCount} registros</span>
            </div>
          </div>

          <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
            <div className="flex justify-between p-3 bg-slate-50/50">
              <span className="font-semibold text-slate-500">Fuente de Información:</span>
              <span className="font-bold text-slate-900">{technicalSheet.informationSource}</span>
            </div>
            <div className="flex justify-between p-3">
              <span className="font-semibold text-slate-500">Versión de Encuesta:</span>
              <span className="font-bold text-slate-900 font-mono">{technicalSheet.surveyVersion}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50/50">
              <span className="font-semibold text-slate-500">Cobertura General:</span>
              <span className="font-bold text-emerald-600 font-mono">{technicalSheet.overallCoveragePercentage}%</span>
            </div>
            <div className="flex justify-between p-3">
              <span className="font-semibold text-slate-500">Responsable SG-SST:</span>
              <span className="font-bold text-slate-900">{technicalSheet.responsibleOfficer}</span>
            </div>
            <div className="flex justify-between p-3 bg-slate-50/50">
              <span className="font-semibold text-slate-500">Licencia SST:</span>
              <span className="font-bold text-slate-900 font-mono">{technicalSheet.sstLicense}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: ALCANCE Y METODOLOGÍA */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">3. Alcance y Metodología</h2>
            <p className="text-xs text-slate-500 font-medium">Procesos de validación, criterios de cálculo y marco normativo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed text-slate-600">
          <div className="space-y-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Fuentes y Proceso de Validación</span>
            </h4>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 font-medium">
              {methodology.sources.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
            <p className="pt-1 text-[11px] text-slate-500">{methodology.calculationCriteria}</p>
          </div>

          <div className="space-y-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Tratamiento de Datos y Privacidad</span>
            </h4>
            <p className="text-slate-600 font-medium">{methodology.missingDataTreatment}</p>
            <p className="text-slate-600 font-medium">{methodology.invalidDataTreatment}</p>
            <p className="pt-1 text-[11px] text-indigo-700 bg-indigo-50/60 p-2 rounded-xl font-semibold border border-indigo-100/60">
              {methodology.privacyPolicy}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: CALIDAD Y COBERTURA DE LA INFORMACIÓN */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">4. Calidad y Cobertura de la Información</h2>
            <p className="text-xs text-slate-500 font-medium">Auditoría rigurosa de consistencia e integridad de datos</p>
          </div>
        </div>

        {qualitySummary.hasIncompleteWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold block mb-0.5">Alerta de Calidad de Información</strong>
              <p className="font-medium">{qualitySummary.warningMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Colaboradores</span>
            <span className="text-lg font-black text-slate-900 font-mono">{qualitySummary.totalEmployees}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Registros Válidos</span>
            <span className="text-lg font-black text-emerald-600 font-mono">{qualitySummary.validRecords}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Campos Faltantes</span>
            <span className="text-lg font-black text-amber-600 font-mono">{qualitySummary.missingFieldsCount}</span>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cobertura General</span>
            <span className="text-lg font-black text-indigo-600 font-mono">{qualitySummary.overallCoveragePercentage}%</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 5: CARACTERIZACIÓN SOCIODEMOGRÁFICA */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">5. Caracterización Sociodemográfica</h2>
            <p className="text-xs text-slate-500 font-medium">Edad, sexo biológico, estado civil y nivel educativo</p>
          </div>
        </div>

        <div className="space-y-6">
          {variables['edad'] && renderDistributionChart(variables['edad'], 'Distribución de Colaboradores por Grupos de Edad', 'bar')}
          {variables['sexo'] && renderDistributionChart(variables['sexo'], 'Distribución de Colaboradores por Sexo Biológico', 'pie')}
          {variables['estado_civil'] && renderDistributionChart(variables['estado_civil'], 'Distribución de Colaboradores por Estado Civil', 'bar')}
          {variables['nivel_educativo'] && renderDistributionChart(variables['nivel_educativo'], 'Distribución por Nivel Educativo', 'bar')}
        </div>
      </div>

      {/* SECCIÓN 6: CARACTERIZACIÓN FAMILIAR */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">6. Caracterización Familiar</h2>
            <p className="text-xs text-slate-500 font-medium">Composición del núcleo familiar y personas a cargo</p>
          </div>
        </div>

        {variables['composicion_familiar'] && renderDistributionChart(variables['composicion_familiar'], 'Distribución de Personas a Cargo y Convivencia', 'bar')}
      </div>

      {/* SECCIÓN 7: CARACTERIZACIÓN DE VIVIENDA */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">7. Caracterización de Vivienda</h2>
            <p className="text-xs text-slate-500 font-medium">Tipo de vivienda y estrato socioeconómico residencial</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variables['vivienda'] && renderDistributionChart(variables['vivienda'], 'Distribución por Tipo de Vivienda', 'pie')}
          {variables['estrato'] && renderDistributionChart(variables['estrato'], 'Distribución por Estrato Socioeconómico', 'bar')}
        </div>
      </div>

      {/* SECCIÓN 8: CARACTERIZACIÓN LABORAL */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">8. Caracterización Laboral</h2>
            <p className="text-xs text-slate-500 font-medium">Distribución por sede, área, proyecto, tipo de contrato y antigüedad</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variables['sede'] && renderDistributionChart(variables['sede'], 'Distribución de Colaboradores por Sede', 'bar')}
            {variables['area'] && renderDistributionChart(variables['area'], 'Distribución de Colaboradores por Área', 'bar')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variables['proyecto'] && renderDistributionChart(variables['proyecto'], 'Distribución de Colaboradores por Proyecto', 'bar')}
            {variables['tipo_contrato'] && renderDistributionChart(variables['tipo_contrato'], 'Distribución por Tipo de Contrato', 'pie')}
          </div>
          {variables['modalidad'] && renderDistributionChart(variables['modalidad'], 'Distribución por Modalidad de Trabajo', 'pie')}
          {variables['antiguedad'] && renderDistributionChart(variables['antiguedad'], 'Distribución de Antigüedad Laboral', 'bar')}
        </div>
      </div>

      {/* SECCIÓN 9: CONDICIONES DE SALUD REPORTADAS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">9. Condiciones de Salud Reportadas</h2>
            <p className="text-xs text-slate-500 font-medium">Percepción de salud, estado nutricional (IMC), medicamentos y alergias</p>
          </div>
        </div>

        <div className="space-y-6">
          {variables['imc'] && renderDistributionChart(variables['imc'], 'Clasificación Nutricional según IMC', 'bar')}
          {variables['percepcion_salud'] && renderDistributionChart(variables['percepcion_salud'], 'Percepción General del Estado de Salud', 'pie')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {variables['medicamentos'] && renderDistributionChart(variables['medicamentos'], 'Consumo de Medicamentos Permanente', 'pie')}
            {variables['alergias'] && renderDistributionChart(variables['alergias'], 'Alergias Conocidas Informadas', 'pie')}
          </div>
        </div>
      </div>

      {/* SECCIÓN 10: HÁBITOS Y ESTILOS DE VIDA */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">10. Hábitos y Estilos de Vida</h2>
            <p className="text-xs text-slate-500 font-medium">Actividad física regular y factores de bienestar personal</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variables['actividad_fisica'] && renderDistributionChart(variables['actividad_fisica'], 'Práctica Regular de Actividad Física', 'pie')}
          {variables['mascotas'] && renderDistributionChart(variables['mascotas'], 'Tenencia de Mascotas en el Hogar', 'pie')}
        </div>
      </div>

      {/* SECCIÓN 11: CONDICIONES OSTEOMUSCULARES */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">11. Condiciones Osteomusculares Reportadas</h2>
            <p className="text-xs text-slate-500 font-medium">Molestias musculoesqueléticas y segmentos corporales informados</p>
          </div>
        </div>

        {variables['osteomuscular'] && renderDistributionChart(variables['osteomuscular'], 'Zonas Anatómicas con Molestias Reportadas', 'bar')}
      </div>

      {/* SECCIÓN 12: MATRIZ DE INDICADORES RELEVANTES */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">12. Matriz de Indicadores Relevantes</h2>
            <p className="text-xs text-slate-500 font-medium">Calculados estrictamente por el Motor Central de Indicadores (PROMPT 37)</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="py-2.5 px-3">Código</th>
                <th className="py-2.5 px-3">Nombre del Indicador</th>
                <th className="py-2.5 px-3 text-right">Resultado</th>
                <th className="py-2.5 px-3 text-right">Numerador (N)</th>
                <th className="py-2.5 px-3 text-right">Denominador</th>
                <th className="py-2.5 px-3 text-right">Cobertura</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {indicators.map((ind) => (
                <tr key={ind.indicatorId} className="hover:bg-slate-50/60">
                  <td className="py-2 px-3 font-mono font-bold text-indigo-600">{ind.code}</td>
                  <td className="py-2 px-3 font-semibold text-slate-800">{ind.name}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                    {ind.value !== null ? `${ind.value} ${ind.unit}` : 'SIN DATOS'}
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">{ind.numerator}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600">{ind.denominator}</td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-slate-700">{ind.coverage}%</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      ind.status === 'CALCULATED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      ind.status === 'INSUFFICIENT_DATA' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {ind.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 13: INDICADORES NO CALCULABLES */}
      {nonCalculableIndicators.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4 text-left">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">13. Indicadores No Calculables por Disponibilidad</h2>
              <p className="text-xs text-slate-500 font-medium">Detalle técnico de variables faltantes o coberturas insuficientes</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3">Indicador</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Motivo Técnico</th>
                  <th className="py-2.5 px-3 text-right">Cobertura Actual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {nonCalculableIndicators.map((nc, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-semibold text-slate-800">
                      <span className="font-mono text-amber-700 mr-1.5">[{nc.indicatorCode}]</span>
                      {nc.indicatorName}
                    </td>
                    <td className="py-2 px-3 text-slate-600 font-medium">{nc.category}</td>
                    <td className="py-2 px-3 text-slate-700">{nc.reason}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-amber-600">{nc.coveragePercentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECCIÓN 14: HALLAZGOS AUTOMÁTICOS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">14. Hallazgos Basados en Reglas</h2>
            <p className="text-xs text-slate-500 font-medium">Síntesis objetiva y preventiva generada a partir de los indicadores calculados</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {findings.map((f) => (
            <div key={f.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase">
                  {f.category}
                </span>
                <span className="text-[10px] font-bold text-slate-500 font-mono">
                  Evidencia: {f.evidenceLevel} ({f.coveragePercentage}%)
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900">{f.title}</h4>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 15: LIMITACIONES DE LA INFORMACIÓN */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">15. Limitaciones de la Información</h2>
            <p className="text-xs text-slate-500 font-medium">Factores que condicionan la representatividad y alcance del informe</p>
          </div>
        </div>

        <ul className="space-y-2 text-xs text-slate-600 font-medium pl-2">
          {limitations.map((lim, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span>{lim}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* SECCIÓN 16: RECOMENDACIONES PREVENTIVAS */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">16. Recomendaciones Preventivas SG-SST</h2>
            <p className="text-xs text-slate-500 font-medium">Acciones orientadas a la promoción de la salud y prevención de riesgos</p>
          </div>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{rec.dimension}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  rec.priority === 'ALTA' ? 'bg-rose-50 text-rose-700' :
                  rec.priority === 'MEDIA' ? 'bg-amber-50 text-amber-700' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  Prioridad {rec.priority}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-bold">{rec.proposedAction}</p>
              <p className="text-[11px] text-slate-500 font-medium">Justificación: {rec.rationale}</p>
              <div className="flex flex-wrap gap-2 text-[10px] pt-1 text-slate-500 font-medium">
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Población: {rec.targetPopulation}</span>
                <span className="bg-white px-2 py-0.5 rounded border border-slate-200">Evidencia: {rec.indicatorEvidence}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 17: ANEXOS Y TRAZABILIDAD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-left">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">17. Anexos de Calidad y Trazabilidad</h2>
            <p className="text-xs text-slate-500 font-medium">Auditoría detallada por variable y trazabilidad de fórmulas</p>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Anexo A: Auditoría de Calidad por Variable</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="py-2 px-2.5">Variable</th>
                  <th className="py-2 px-2.5">Sección</th>
                  <th className="py-2 px-2.5 text-right">Total</th>
                  <th className="py-2 px-2.5 text-right">Válidos</th>
                  <th className="py-2 px-2.5 text-right">Faltantes</th>
                  <th className="py-2 px-2.5 text-right">Cobertura</th>
                  <th className="py-2 px-2.5 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {qualityAnnex.slice(0, 15).map((q, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-1.5 px-2.5 font-medium text-slate-800">{q.displayName}</td>
                    <td className="py-1.5 px-2.5 text-slate-500">{q.section}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono">{q.totalRecords}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono font-semibold text-emerald-600">{q.validRecords}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono text-amber-600">{q.missingRecords}</td>
                    <td className="py-1.5 px-2.5 text-right font-mono font-bold text-slate-700">{q.coveragePercentage}%</td>
                    <td className="py-1.5 px-2.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        q.status === 'OPTIMO' ? 'bg-emerald-50 text-emerald-700' :
                        q.status === 'ACEPTABLE' ? 'bg-indigo-50 text-indigo-700' :
                        q.status === 'CRITICO' ? 'bg-amber-50 text-amber-700' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {q.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FOOTER DEL INFORME */}
      <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-mono">
        <span>Report ID: {metadata.reportId}</span>
        <span>Generado por: {metadata.generatedBy} | {new Date(metadata.generatedAt).toLocaleString('es-CO')}</span>
        <span>Página 1 de 1 (Documento Consolidado)</span>
      </div>

    </div>
  );
}
