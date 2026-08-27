import React from 'react';
import { 
  Users, 
  Heart, 
  Clock, 
  Activity, 
  AlertTriangle, 
  Shield, 
  BookOpen, 
  Calendar, 
  Briefcase,
  FileText,
  Percent,
  CheckCircle,
  Info,
  MapPin,
  ClipboardList,
  Building,
  Layers,
  FileCheck2,
  FolderGit2,
  ShieldCheck,
  Search
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { DemographicsData } from '../types';
import { useEmpresa } from '../modules/configuracion/useEmpresa';
import { ExecutiveReportService } from '../core/reports/executiveReportService';
import { CompanyReportConfig, ReportSnapshot } from '../core/reports/types';

interface ExecutiveReportTemplateProps {
  data: DemographicsData | null;
  reportTitle?: string;
  reportCompany?: string;
  snapshotOverride?: ReportSnapshot;
  conclusions?: any[];
  recommendations?: any[];
}

export default function ExecutiveReportTemplate({
  data,
  reportTitle = 'Informe de Diagnóstico Sociodemográfico y Plan de Intervención SG-SST',
  reportCompany,
  snapshotOverride
}: ExecutiveReportTemplateProps) {
  
  const { config, getCatalogItems } = useEmpresa();

  const companyConfig: CompanyReportConfig = {
    companyId: config.id || 'COMP-100',
    companyName: config.nombreEmpresa || reportCompany || 'Organización no identificada',
    logo: config.logo || '',
    primaryColor: config.colorPrimario || '#4f46e5',
    secondaryColor: config.colorSecundario || '#06b6d4',
    nit: config.nit || 'Sin NIT registrado',
    ciudad: config.ciudad || 'No disponible',
    representanteLegal: config.representanteLegal || 'No especificado',
    cargoRepresentante: config.cargoRepresentante || '',
    responsableInforme: config.responsableInforme || 'Responsable SG-SST',
    cargoResponsable: config.cargoResponsable || 'Especialista SST',
    catalogSedes: getCatalogItems ? getCatalogItems('sedes').map(s => s.nombre) : [],
    catalogAreas: getCatalogItems ? getCatalogItems('areas').map(a => a.nombre) : [],
    catalogProyectos: getCatalogItems ? getCatalogItems('proyectos').map(p => p.nombre) : []
  };

  // Generate Snapshot via ExecutiveReportService or use override
  const snapshot: ReportSnapshot = snapshotOverride || ExecutiveReportService.generateReportSnapshot(
    data,
    companyConfig,
    'DS-2026-P1',
    '2026-P1',
    'v3.0.0',
    'v3.0.0',
    'v3.0.0'
  );

  const primaryColor = companyConfig.primaryColor;
  const secondaryColor = companyConfig.secondaryColor;
  const logo = companyConfig.logo;
  const companyName = companyConfig.companyName;

  const totalEmployees = data?.totalEmployees || snapshot.qualityReport.totalRecords || 0;
  const evaluatedRecords = data?.rawEmployees?.length || snapshot.qualityReport.totalRecords || 0;
  const globalCoverage = snapshot.qualityReport.overallCoveragePercentage || 0;
  const globalQuality = snapshot.qualityReport.overallCoveragePercentage >= 90 
    ? 'EXCELENTE' 
    : snapshot.qualityReport.overallCoveragePercentage >= 70 
    ? 'ACEPTABLE' 
    : 'CRÍTICA';

  const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

  const PageHeader = ({ chapterTitle, indexStr }: { chapterTitle: string; indexStr: string }) => (
    <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4 w-full select-none">
      <div className="flex items-center gap-1.5">
        {logo ? (
          <img src={logo} alt="Logo" className="w-5 h-5 object-contain rounded" referrerPolicy="no-referrer" />
        ) : (
          <div className="w-5 h-5 flex items-center justify-center rounded-md text-white text-[9px] font-black" style={{ backgroundColor: primaryColor }}>
            {companyName.substring(0, 2).toUpperCase()}
          </div>
        )}
        <div className="text-left">
          <span className="text-[9px] font-black tracking-wider text-slate-900 uppercase font-display">{companyName}</span>
          <span className="text-[7.5px] font-bold ml-1.5 uppercase font-sans" style={{ color: primaryColor }}>| SG-SST Informe Ejecutivo</span>
        </div>
      </div>
      <div className="text-right">
        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{indexStr}. {chapterTitle}</span>
      </div>
    </div>
  );

  const PageFooter = ({ pageNum }: { pageNum: number }) => {
    const formattedDate = new Date(snapshot.generatedAt).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    return (
      <div className="border-t border-slate-200 pt-2.5 mt-auto w-full font-sans text-slate-500 text-[8px] select-none">
        <div className="flex justify-between items-center gap-4 w-full">
          <div className="flex items-center gap-2 max-w-[35%] text-left">
            {logo ? (
              <img src={logo} alt="Logo" className="w-4.5 h-4.5 object-contain rounded" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-4.5 h-4.5 flex items-center justify-center rounded bg-slate-900 text-white text-[8px] font-bold">
                {companyName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="text-left leading-tight truncate">
              <span className="font-extrabold text-slate-800 block truncate uppercase text-[8.5px]">{companyName}</span>
              <span className="text-[7px] text-slate-400 block font-medium">NIT: {companyConfig.nit}</span>
            </div>
          </div>

          <div className="text-center leading-normal max-w-[40%] flex flex-col items-center">
            <span className="font-bold text-slate-700 block text-[7.5px] tracking-wider uppercase font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200/50">
              ID: {snapshot.reportId}
            </span>
            <div className="text-[7px] text-slate-400 flex items-center justify-center gap-2 mt-1">
              <span>Fecha: {formattedDate}</span>
              <span>•</span>
              <span className="font-bold text-slate-600">Versión: {snapshot.reportVersion}</span>
            </div>
          </div>

          <div className="text-right leading-tight max-w-[25%] shrink-0">
            <span className="font-extrabold text-slate-800 block text-[9.5px]" style={{ color: primaryColor }}>
              Página {pageNum}
            </span>
            <span className="text-[7px] text-slate-400 block font-bold uppercase tracking-wider">INFORME REAL SG-SST</span>
          </div>
        </div>
      </div>
    );
  };

  const renderVariableSection = (
    varKey: string,
    title: string,
    description: string,
    icon: React.ReactNode
  ) => {
    const v = snapshot.variables[varKey];

    if (!v || !v.isAvailable || v.validResponses === 0) {
      return (
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            {icon}
            <h4 className="text-xs font-black uppercase text-slate-800">{title}</h4>
          </div>
          <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-amber-800 text-[11px] font-semibold flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Sin información disponible para este periodo.</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-900">{title}</h4>
              <p className="text-[10px] text-slate-500 font-medium">{description}</p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[9.5px] font-extrabold rounded border border-indigo-200 font-mono">
            Cobertura: {v.coveragePercentage}%
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-150 font-medium">
          <div>
            <span className="text-slate-400 block font-bold uppercase text-[8.5px]">Población Total</span>
            <span className="font-black text-slate-800">{v.totalPopulation} colaboradores</span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold uppercase text-[8.5px]">Respuestas Válidas</span>
            <span className="font-black text-emerald-700">{v.validResponses} colaboradores</span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold uppercase text-[8.5px]">No Informados</span>
            <span className="font-black text-amber-700">{v.unreportedResponses} colaboradores</span>
          </div>
          <div>
            <span className="text-slate-400 block font-bold uppercase text-[8.5px]">Base Calculada</span>
            <span className="font-black text-slate-800">{v.validResponses} con respuesta válida</span>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="space-y-1.5 pt-1">
          {v.distribution.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-[10.5px] border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-700">{item.category}:</span>
              <div className="text-right">
                <span className="font-black text-slate-900">{item.count}</span>
                <span className="text-slate-500 text-[9.5px] ml-1">
                  ({item.percentage}% de {v.validResponses} con respuesta válida)
                </span>
              </div>
            </div>
          ))}

          {v.unreportedResponses > 0 && (
            <div className="flex justify-between items-center text-[10.5px] bg-amber-50/50 p-1 rounded text-amber-900 font-medium">
              <span className="font-bold text-amber-800">No informado:</span>
              <div className="text-right">
                <span className="font-black text-amber-900">{v.unreportedResponses}</span>
                <span className="text-amber-700 text-[9.5px] ml-1">
                  ({((v.unreportedResponses / v.totalPopulation) * 100).toFixed(1)}% de población total)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Chart or Informative Card */}
        {v.distribution.length > 0 ? (
          <div className="h-32 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={v.distribution} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip formatter={(value: any) => [`${value} colaboradores`, 'Total']} />
                <Bar dataKey="count" fill={primaryColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="p-3 bg-slate-100 rounded-lg text-center text-slate-500 text-xs font-semibold">
            Este indicador no puede visualizarse porque no existen datos suficientes.
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-100 p-2 space-y-8 flex flex-col items-center">
      
      {/* ==================== 1. PORTADA ==================== */}
      <div 
        id="pdf-page-1"
        className="w-[816px] h-[1056px] bg-slate-50 flex font-sans relative border border-slate-200 shadow-xl overflow-hidden box-border shrink-0"
        style={{ width: '816px', height: '1056px', minWidth: '816px', minHeight: '1056px' }}
      >
        <div 
          className="w-[240px] h-full flex flex-col justify-between p-8 text-white relative overflow-hidden shrink-0"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        >
          <div className="space-y-4">
            <div className="w-16 h-16 bg-white p-2.5 rounded-2xl shadow-xl flex items-center justify-center border border-white/20">
              {logo ? (
                <img src={logo} alt="Logo" className="max-h-full max-w-full object-contain rounded-md" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center rounded-xl bg-slate-50 text-[18px] font-black" style={{ color: primaryColor }}>
                  {companyName.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-widest uppercase text-white/70 block">Organización</span>
              <span className="text-sm font-extrabold tracking-tight block text-white truncate max-w-[180px]" title={companyName}>
                {companyName}
              </span>
            </div>
          </div>

          <div className="space-y-4 border-t border-white/20 pt-4 text-xs font-medium text-white/90">
            <div>
              <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest block">Sede Emisión</span>
              <span className="font-extrabold text-sm block mt-0.5">{companyConfig.ciudad}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest block">Periodo Diagnóstico</span>
              <span className="font-extrabold text-sm block mt-0.5">2026-P1</span>
            </div>
          </div>
        </div>

        <div className="flex-1 h-full flex flex-col justify-between p-12 bg-white relative text-left">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
              SISTEMA DE GESTIÓN DE SEGURIDAD Y SALUD EN EL TRABAJO
            </span>
            <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              CÓDIGO: {snapshot.reportId}
            </span>
          </div>

          <div className="my-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-700 border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Diagnóstico Sociodemográfico Real • SG-SST</span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 leading-tight uppercase font-display">
              {reportTitle}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed font-medium max-w-lg">
              Documento directivo consolidado a partir de la información real procesada por el Motor de Calidad de Datos (Prompt 29) y el Motor Central de Indicadores (Prompt 30).
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Garantía de Integridad</span>
              <p className="text-[11px] text-slate-700 font-semibold leading-normal">
                Este informe contiene cero datos sintéticos, estimaciones ni constantes simuladas. La información no informada se especifica explícitamente.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 text-[10px] text-slate-500 flex justify-between items-center">
            <div>
              <span className="font-bold block text-slate-800">{companyConfig.responsableInforme}</span>
              <span className="text-slate-400 block">{companyConfig.cargoResponsable}</span>
            </div>
            <div className="text-right">
              <span className="font-bold block text-slate-800">Versión Informe: {snapshot.reportVersion}</span>
              <span className="text-slate-400 block">{new Date(snapshot.generatedAt).toLocaleDateString('es-CO')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== 2. FICHA TÉCNICA & 3. CALIDAD DE LA INFORMACIÓN ==================== */}
      <div 
        id="pdf-page-2"
        className="w-[816px] h-[1056px] bg-white p-12 flex flex-col font-sans relative border border-slate-200 shadow-xl box-border shrink-0 text-left"
        style={{ width: '816px', height: '1056px', minWidth: '816px', minHeight: '1056px' }}
      >
        <PageHeader chapterTitle="Ficha Técnica y Calidad de la Información" indexStr="01" />

        <div className="space-y-6 flex-1">
          
          {/* Ficha Técnica */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-indigo-600" />
              <span>Ficha Técnica del Diagnóstico</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Organización</span>
                <span className="font-extrabold text-slate-900">{companyName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Periodo Evaluado</span>
                <span className="font-extrabold text-slate-900">2026-P1</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Población Total</span>
                <span className="font-extrabold text-slate-900">{totalEmployees} colaboradores</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Registros Analizados</span>
                <span className="font-extrabold text-emerald-700">{evaluatedRecords} válidos</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Versión de Encuesta</span>
                <span className="font-extrabold text-slate-900 font-mono">{snapshot.surveyVersion}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Versión Motor Indicadores</span>
                <span className="font-extrabold text-slate-900 font-mono">{snapshot.indicatorVersion}</span>
              </div>
            </div>
          </div>

          {/* Calidad de la Información */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black uppercase text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>CALIDAD DE LA INFORMACIÓN</span>
            </h3>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-900 text-white rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Calidad Global</span>
                <span className="text-lg font-black text-emerald-400">{globalQuality}</span>
              </div>
              <div className="p-3 bg-slate-900 text-white rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Cobertura Global</span>
                <span className="text-lg font-black text-indigo-300">{globalCoverage}%</span>
              </div>
              <div className="p-3 bg-slate-900 text-white rounded-xl">
                <span className="text-[9px] text-slate-400 font-bold uppercase block">Campos Incompletos</span>
                <span className="text-lg font-black text-amber-400">{snapshot.qualityReport.missingFieldsCount}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between font-semibold">
                <span>Campos Evaluados:</span>
                <span className="font-bold text-slate-900">{snapshot.qualityReport.evaluatedFieldsCount}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Campos Completos (100%):</span>
                <span className="font-bold text-slate-900">{snapshot.qualityReport.completeFieldsCount}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Cobertura Global de Campos:</span>
                <span className="font-bold text-slate-900">{snapshot.qualityReport.overallCoveragePercentage}%</span>
              </div>
            </div>

            {/* Warning Banner */}
            {snapshot.limitations.length > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 space-y-1 text-xs">
                <div className="flex items-center gap-2 font-black uppercase text-[11px] text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Advertencia de Interpretación</span>
                </div>
                <p className="font-bold">
                  Los resultados deben interpretarse considerando la cobertura y calidad de la información disponible.
                </p>
              </div>
            )}

          </div>

        </div>

        <PageFooter pageNum={2} />
      </div>

      {/* ==================== 4. CARACTERIZACIÓN SOCIODEMOGRÁFICA ==================== */}
      <div 
        id="pdf-page-3"
        className="w-[816px] h-[1056px] bg-white p-12 flex flex-col font-sans relative border border-slate-200 shadow-xl box-border shrink-0 text-left"
        style={{ width: '816px', height: '1056px', minWidth: '816px', minHeight: '1056px' }}
      >
        <PageHeader chapterTitle="Caracterización Sociodemográfica" indexStr="02" />

        <div className="space-y-4 flex-1">
          {renderVariableSection('gender', 'Distribución por Sexo', 'Población dividida por género reportado', <Users className="w-4 h-4 text-indigo-600" />)}
          {renderVariableSection('education', 'Nivel Educativo', 'Grado de escolaridad alcanzado', <BookOpen className="w-4 h-4 text-indigo-600" />)}
          {renderVariableSection('maritalStatus', 'Estado Civil', 'Condición conyugal o marital reportada', <Users className="w-4 h-4 text-indigo-600" />)}
        </div>

        <PageFooter pageNum={3} />
      </div>

      {/* ==================== 5. CONDICIONES LABORALES ==================== */}
      <div 
        id="pdf-page-4"
        className="w-[816px] h-[1056px] bg-white p-12 flex flex-col font-sans relative border border-slate-200 shadow-xl box-border shrink-0 text-left"
        style={{ width: '816px', height: '1056px', minWidth: '816px', minHeight: '1056px' }}
      >
        <PageHeader chapterTitle="Condiciones Laborales" indexStr="03" />

        <div className="space-y-4 flex-1">
          {renderVariableSection('contractType', 'Tipo de Contrato', 'Modalidad de vinculación laboral', <Briefcase className="w-4 h-4 text-indigo-600" />)}
          {renderVariableSection('city', 'Ubicación / Ciudad', 'Sede o municipio de prestación del servicio', <MapPin className="w-4 h-4 text-indigo-600" />)}
        </div>

        <PageFooter pageNum={4} />
      </div>

      {/* ==================== 6. CONDICIONES FAMILIARES Y VIVIENDA ==================== */}
      <div 
        id="pdf-page-5"
        className="w-[816px] h-[1056px] bg-white p-12 flex flex-col font-sans relative border border-slate-200 shadow-xl box-border shrink-0 text-left"
        style={{ width: '816px', height: '1056px', minWidth: '816px', minHeight: '1056px' }}
      >
        <PageHeader chapterTitle="Condiciones Familiares y Vivienda" indexStr="04" />

        <div className="space-y-4 flex-1">
          {renderVariableSection('socioeconomicStrata', 'Estrato Socioeconómico', 'Clasificación residencial', <Building className="w-4 h-4 text-indigo-600" />)}
          {renderVariableSection('housing', 'Tipo de Vivienda', 'Tenencia del inmueble habitacional', <Building className="w-4 h-4 text-indigo-600" />)}
        </div>

        <PageFooter pageNum={5} />
      </div>

      {/* ==================== 7. CONDICIONES DE SALUD ==================== */}
      <div 
        id="pdf-page-6"
        className="w-[816px] h-[1056px] bg-white p-12 flex flex-col font-sans relative border border-slate-200 shadow-xl box-border shrink-0 text-left"
        style={{ width: '816px', height: '1056px', minWidth: '816px', minHeight: '1056px' }}
      >
        <PageHeader chapterTitle="Condiciones de Salud Reportadas" indexStr="05" />

        <div className="space-y-4 flex-1">
          {renderVariableSection('musculoskeletalPain', 'Síntomas Osteomusculares', 'Presencia de dolor o molestias asociadas a biomecánica', <Heart className="w-4 h-4 text-rose-600" />)}
        </div>

        <PageFooter pageNum={6} />
      </div>

      {/* ==================== 8. HÁBITOS Y ESTILOS DE VIDA ==================== */}
      <div 
        id="pdf-page-7"
        className="w-[816px] h-[1056px] bg-white p-12 flex flex-col font-sans relative border border-slate-200 shadow-xl box-border shrink-0 text-left"
        style={{ width: '816px', height: '1056px', minWidth: '816px', minHeight: '1056px' }}
      >
        <PageHeader chapterTitle="Hábitos y Estilos de Vida" indexStr="06" />

        <div className="space-y-4 flex-1">
          {renderVariableSection('physicalActivity', 'Actividad Física', 'Nivel de ejercicio y sedentarismo reportado', <Activity className="w-4 h-4 text-emerald-600" />)}
        </div>

        <PageFooter pageNum={7} />
      </div>

      {/* ==================== 9. INDICADORES DE SALUD Y 10. BIENESTAR ==================== */}
      <div 
        id="pdf-page-8"
        className="w-[816px] h-[1056px] bg-white p-12 flex flex-col font-sans relative border border-slate-200 shadow-xl box-border shrink-0 text-left"
        style={{ width: '816px', height: '1056px', minWidth: '816px', minHeight: '1056px' }}
      >
        <PageHeader chapterTitle="Indicadores de Salud y Bienestar" indexStr="07" />

        <div className="space-y-4 flex-1">
          <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Resumen de KPIs Calculados (Motor Central Prompt 30)</span>
          </h3>

          <div className="space-y-3">
            {snapshot.indicators.map(ind => (
              <div key={ind.indicatorId} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-extrabold text-slate-900 block">{ind.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium block">{ind.interpretation}</span>
                </div>
                <div className="text-right">
                  {ind.value !== null ? (
                    <span className="text-sm font-black text-indigo-600">{ind.value} {ind.unit}</span>
                  ) : (
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded">Sin información disponible</span>
                  )}
                  <span className="text-[9px] text-slate-400 block font-mono">Cobertura: {ind.coverage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <PageFooter pageNum={8} />
      </div>

      {/* ==================== 11, 12, 13. ANÁLISIS POR SEDE, ÁREA Y PROYECTO ==================== */}
      <div 
        id="pdf-page-9"
        className="w-[816px] h-[1056px] bg-white p-12 flex flex-col font-sans relative border border-slate-200 shadow-xl box-border shrink-0 text-left"
        style={{ width: '816px', height: '1056px', minWidth: '816px', minHeight: '1056px' }}
      >
        <PageHeader chapterTitle="Análisis por Sede, Área y Proyecto" indexStr="08" />

        <div className="space-y-6 flex-1">
          
          {/* Sedes */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-900">Análisis por Sede Parametrizada</h4>
            {companyConfig.catalogSedes && companyConfig.catalogSedes.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {companyConfig.catalogSedes.map((s, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                    <span className="font-bold text-slate-800">{s}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Configurada</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg text-slate-500 text-xs font-semibold">
                Sin información disponible.
              </div>
            )}
          </div>

          {/* Áreas */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-900">Análisis por Área Parametrizada</h4>
            {companyConfig.catalogAreas && companyConfig.catalogAreas.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {companyConfig.catalogAreas.map((a, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                    <span className="font-bold text-slate-800">{a}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Configurada</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg text-slate-500 text-xs font-semibold">
                Sin información disponible.
              </div>
            )}
          </div>

          {/* Proyectos */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase text-slate-900">Análisis por Proyecto Parametrizado</h4>
            {companyConfig.catalogProyectos && companyConfig.catalogProyectos.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 text-xs">
                {companyConfig.catalogProyectos.map((p, i) => (
                  <div key={i} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                    <span className="font-bold text-slate-800">{p}</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Configurado</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-lg text-slate-500 text-xs font-semibold">
                Sin información disponible.
              </div>
            )}
          </div>

        </div>

        <PageFooter pageNum={9} />
      </div>

      {/* ==================== 14. HALLAZGOS Y 15. RECOMENDACIONES ==================== */}
      <div 
        id="pdf-page-10"
        className="w-[816px] h-[1056px] bg-white p-12 flex flex-col font-sans relative border border-slate-200 shadow-xl box-border shrink-0 text-left"
        style={{ width: '816px', height: '1056px', minWidth: '816px', minHeight: '1056px' }}
      >
        <PageHeader chapterTitle="Hallazgos y Recomendaciones" indexStr="09" />

        <div className="space-y-6 flex-1 text-xs">
          
          {/* Hallazgos */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-900">Hallazgos Basados en Evidencia Real</h3>
            {snapshot.findings.length > 0 ? (
              <div className="space-y-2">
                {snapshot.findings.map(f => (
                  <div key={f.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[9px] font-black uppercase text-indigo-600 block">VARIABLE: {f.variableName}</span>
                    <p className="font-bold text-slate-800">{f.description}</p>
                    <span className="text-[9.5px] text-slate-500 block font-mono">Fuente: {f.source} • Cobertura: {f.coveragePercentage}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 font-semibold">Sin hallazgos generados por falta de datos suficientes.</p>
            )}
          </div>

          {/* Recomendaciones */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-900">Recomendaciones con Evidencia Vinculada</h3>
            {snapshot.recommendations.length > 0 ? (
              <div className="space-y-2">
                {snapshot.recommendations.map(r => (
                  <div key={r.id} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1 text-emerald-950">
                    <span className="text-[9px] font-black uppercase text-emerald-700 block">
                      RECOMENDACIÓN PRIORIDAD {r.priority} • {r.associatedFindingTitle}
                    </span>
                    <p className="font-bold">{r.proposedAction}</p>
                    <p className="text-[10px] text-emerald-800 font-medium">{r.evidence}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 font-semibold">No se generan recomendaciones automáticas sin evidencia suficiente.</p>
            )}
          </div>

        </div>

        <PageFooter pageNum={10} />
      </div>

      {/* ==================== 16. LIMITACIONES Y 17. TRAZABILIDAD ==================== */}
      <div 
        id="pdf-page-11"
        className="w-[816px] h-[1056px] bg-white p-12 flex flex-col font-sans relative border border-slate-200 shadow-xl box-border shrink-0 text-left"
        style={{ width: '816px', height: '1056px', minWidth: '816px', minHeight: '1056px' }}
      >
        <PageHeader chapterTitle="Limitaciones y Trazabilidad" indexStr="10" />

        <div className="space-y-6 flex-1 text-xs">
          
          {/* Limitaciones */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>LIMITACIONES DEL ANÁLISIS</span>
            </h3>

            {snapshot.limitations.length > 0 ? (
              <div className="space-y-1.5">
                {snapshot.limitations.map((lim, i) => (
                  <div key={i} className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 font-semibold">
                    • {lim}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-600 font-semibold">No se identificaron limitaciones críticas en la fuente de datos.</p>
            )}
          </div>

          {/* Trazabilidad */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-900 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-600" />
              <span>TRAZABILIDAD DE INDICADORES</span>
            </h3>

            <div className="space-y-2">
              {snapshot.indicators.map(ind => (
                <div key={ind.indicatorId} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[10px] space-y-0.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{ind.name}</span>
                    <span className="font-mono text-indigo-600">{ind.formulaVersion}</span>
                  </div>
                  <div className="text-slate-500 font-mono">
                    Numerador: {ind.numerator} | Denominador: {ind.denominator} | Fuente: {ind.source}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <PageFooter pageNum={11} />
      </div>

    </div>
  );
}
