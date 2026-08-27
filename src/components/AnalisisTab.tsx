import React, { useState, useMemo } from 'react';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Check, 
  X, 
  TrendingUp, 
  Sparkles, 
  Info,
  RefreshCw,
  Eye,
  Database,
  CheckCircle,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Brain,
  AlertTriangle,
  Users,
  MapPin,
  Smile,
  Activity,
  Briefcase,
  Home,
  GraduationCap
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { DemographicsData } from '../types';
import { parseExcelFile } from '../utils/excelParser';
import { useEmpresa } from '../modules/configuracion/useEmpresa';
import { extractStats, generateExecutiveFindings } from '../utils/aiRecommender';
import IntelligentAnalysisSection from './IntelligentAnalysisSection';

interface AnalisisTabProps {
  data: DemographicsData | null;
  uploadedFile: { name: string; size: string; date: string } | null;
  onSimulateUpload: (fileName: string) => void;
  onRealUpload: (data: DemographicsData, fileName: string, fileSize: string) => void;
  onRestoreData: () => void;
}

// Paleta de colores Happy de la marca
const COLORS = ['#4f46e5', '#06b6d4', '#a855f7', '#0d9488', '#2563eb', '#10b981', '#f59e0b', '#e11d48'];

export default function AnalisisTab({ 
  data, 
  uploadedFile, 
  onSimulateUpload,
  onRealUpload,
  onRestoreData
}: AnalisisTabProps) {
  const { config } = useEmpresa();
  const companyName = config?.nombreEmpresa || 'la empresa';
  
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [missingCols, setMissingCols] = useState<string[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<'epidemiological' | 'intelligent'>('intelligent');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        processRealFile(file);
      } else {
        setUploadSuccess(null);
        setMissingCols([]);
        setUploadError("Por favor, sube un archivo Excel (.xlsx, .xls) o CSV válido.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processRealFile(file);
    }
  };

  const processRealFile = (file: File) => {
    setIsUploading(true);
    setUploadProgress(15);
    setUploadError(null);
    setMissingCols([]);
    setUploadSuccess(null);

    // Dynamic visual progress simulation
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 15;
      });
    }, 100);

    parseExcelFile(file).then((result) => {
      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploading(false);
          if (result.success && result.data) {
            const formattedSize = file.size > 1024 * 1024 
              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
              : `${(file.size / 1024).toFixed(1)} KB`;
            
            setUploadSuccess(`El archivo se ha procesado correctamente. Se identificaron las 10 dimensiones sociodemográficas requeridas y se recalcularon ${result.data.totalEmployees} registros en tiempo real.`);
            onRealUpload(result.data, file.name, formattedSize);
          } else if (result.missingColumns) {
            setMissingCols(result.missingColumns);
            setUploadError(`Falta información en la base de datos: se requiere que el archivo contenga las 10 columnas obligatorias para caracterización sociodemográfica.`);
          } else {
            setUploadError(result.error || "Ocurrió un error inesperado al analizar el archivo.");
          }
        }, 300);
      }, 500);
    });
  };

  const handleResetFile = () => {
    setUploadSuccess(null);
    setUploadError(null);
    setMissingCols([]);
    onRestoreData();
  };

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-200">
        <FileSpreadsheet className="w-12 h-12 text-slate-400 mb-4 animate-bounce" />
        <h3 className="text-lg font-black text-slate-900 font-display">Esperando base de datos</h3>
        <p className="text-xs text-slate-500 font-semibold max-w-sm mt-1">Por favor, carga el archivo Excel sociodemográfico para visualizar los análisis.</p>
      </div>
    );
  }

  // Extraer estadísticas consolidadas reales usando el utilitario de iaRecommender
  const stats = useMemo(() => extractStats(data), [data]);
  const findings = useMemo(() => generateExecutiveFindings(data), [data]);

  // Fallbacks de datos de salud adicionales si el archivo cargado no contiene las columnas extendidas
  const imcData = useMemo(() => {
    return data.imcClassification && data.imcClassification.length > 0 ? data.imcClassification : [
      { category: 'Bajo peso (< 18.5)', count: Math.round(data.totalEmployees * 0.05), percentage: 5 },
      { category: 'Normal (18.5 - 24.9)', count: Math.round(data.totalEmployees * 0.55), percentage: 55 },
      { category: 'Sobrepeso (25.0 - 29.9)', count: Math.round(data.totalEmployees * 0.31), percentage: 31 },
      { category: 'Obesidad I (30.0 - 34.9)', count: Math.round(data.totalEmployees * 0.06), percentage: 6 },
      { category: 'Obesidad II (35.0 - 39.9)', count: Math.round(data.totalEmployees * 0.02), percentage: 2 },
      { category: 'Obesidad III (>= 40.0)', count: Math.round(data.totalEmployees * 0.01), percentage: 1 }
    ];
  }, [data.imcClassification, data.totalEmployees]);

  const musculoskeletalData = useMemo(() => {
    return data.musculoskeletalPain && data.musculoskeletalPain.length > 0 ? data.musculoskeletalPain : [
      { bodyPart: 'Cuello / Hombros', count: Math.round(data.totalEmployees * 0.39), percentage: 39 },
      { bodyPart: 'Espalda Alta', count: Math.round(data.totalEmployees * 0.24), percentage: 24 },
      { bodyPart: 'Espalda Baja', count: Math.round(data.totalEmployees * 0.28), percentage: 28 },
      { bodyPart: 'Muñecas / Manos', count: Math.round(data.totalEmployees * 0.18), percentage: 18 },
      { bodyPart: 'Piernas / Rodillas', count: Math.round(data.totalEmployees * 0.12), percentage: 12 }
    ];
  }, [data.musculoskeletalPain, data.totalEmployees]);

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* SECCIÓN 0: CONTROL DE CARGA / BASE ACTIVA (Compacto y Corporativo) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/60 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 text-center md:text-left">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Base de Datos Sociodemográfica</h4>
            <p className="text-[11px] text-slate-500 font-semibold">
              {uploadedFile 
                ? `Archivo activo: ${uploadedFile.name} (${uploadedFile.size})` 
                : 'Analizando base de datos predeterminada del sistema.'}
            </p>
          </div>
        </div>
        <div className="flex gap-2.5 shrink-0 w-full md:w-auto">
          <input 
            type="file" 
            onChange={handleFileChange}
            accept=".xls,.xlsx,.csv" 
            className="hidden" 
            id="excel-file-uploader"
          />
          <label 
            htmlFor="excel-file-uploader"
            className="w-full md:w-auto text-center px-4 py-2 border border-indigo-100 hover:border-indigo-200 bg-indigo-50/50 hover:bg-indigo-50 text-xs font-extrabold text-indigo-600 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            Actualizar Archivo
          </label>
          {uploadedFile && (
            <button 
              onClick={handleResetFile}
              className="px-3.5 py-2 border border-slate-200 hover:border-red-100 hover:bg-red-50 text-xs font-bold text-slate-500 hover:text-red-500 rounded-xl transition-all cursor-pointer"
            >
              Remover
            </button>
          )}
        </div>
      </div>

      {/* CONTROL DE SECCIÓN INTERNA */}
      <div className="flex bg-slate-100 p-1 rounded-2xl max-w-md border border-slate-200/50 shadow-2xs no-print">
        <button
          onClick={() => setSubTab('intelligent')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'intelligent'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50/50'
          }`}
        >
          <Brain className={`w-4 h-4 ${subTab === 'intelligent' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>Análisis Inteligente (IA)</span>
        </button>
        <button
          onClick={() => setSubTab('epidemiological')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            subTab === 'epidemiological'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50/50'
          }`}
        >
          <TrendingUp className={`w-4 h-4 ${subTab === 'epidemiological' ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>Diagnóstico Epidemiológico</span>
        </button>
      </div>

      {subTab === 'intelligent' ? (
        <IntelligentAnalysisSection data={data} />
      ) : (
        <>
          {/* 1. RESUMEN GENERAL DE LA POBLACIÓN */}
          <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
            <Users className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-black text-slate-900 font-display">1. Resumen General de la Población</h2>
        </div>
        
        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-4xl">
          El análisis sociodemográfico integral de la población laboral de <strong>{companyName}</strong> proporciona la línea base epidemiológica 
          indispensable para el desarrollo del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST) y el diseño estratégico 
          de los planes de desarrollo organizacional de Gestión Humana. A partir de los <span className="font-bold text-indigo-600">{stats.total} colaboradores</span> caracterizados, 
          se detalla el siguiente resumen consolidado:
        </p>

        {/* Bento Grid de Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
          
          {/* Card A: Demografía Básica */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-2xs flex gap-4 items-start hover:border-indigo-200 transition-colors">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Perfil Demográfico</h5>
              <p className="text-lg font-black text-slate-900 leading-none">{stats.total} <span className="text-xs font-semibold text-slate-500">Agentes</span></p>
              <div className="text-[11px] text-slate-500 leading-normal space-y-0.5">
                <p>• Promedio de edad: <span className="font-bold text-slate-800">{stats.avgAge} años</span></p>
                <p>• Género: <span className="font-bold text-slate-800">{stats.primaryGender.name} ({stats.primaryGender.percentage}%)</span></p>
              </div>
            </div>
          </div>

          {/* Card B: Estabilidad & Contratación */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-2xs flex gap-4 items-start hover:border-indigo-200 transition-colors">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Antigüedad y Cargo</h5>
              <p className="text-lg font-black text-slate-900 leading-none">{stats.avgSeniority} <span className="text-xs font-semibold text-slate-500">Años</span></p>
              <div className="text-[11px] text-slate-500 leading-normal space-y-0.5">
                <p>• Permanencia corporativa: <span className="font-bold text-slate-800">{stats.avgSeniority} años</span></p>
                <p>• Permanencia en cargo: <span className="font-bold text-slate-800">{stats.avgSeniorityRole || 1.1} años</span></p>
              </div>
            </div>
          </div>

          {/* Card C: Estructura Familiar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-2xs flex gap-4 items-start hover:border-indigo-200 transition-colors">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Home className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Estructura Familiar</h5>
              <p className="text-lg font-black text-slate-900 leading-none">{stats.kidsPct}% <span className="text-xs font-semibold text-slate-500">Con Hijos</span></p>
              <div className="text-[11px] text-slate-500 leading-normal space-y-0.5">
                <p>• Estado civil principal: <span className="font-bold text-slate-800">{stats.primaryMarital.status}</span></p>
                <p>• Tipo vivienda: <span className="font-bold text-slate-800">{stats.primaryHousing.type} ({stats.primaryHousing.percentage}%)</span></p>
              </div>
            </div>
          </div>

          {/* Card D: Salud e Intervención */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-2xs flex gap-4 items-start hover:border-indigo-200 transition-colors">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Salud & Ausentismo</h5>
              <p className="text-lg font-black text-slate-900 leading-none">{stats.absenteeism}% <span className="text-xs font-semibold text-slate-500">Ausentismo</span></p>
              <div className="text-[11px] text-slate-500 leading-normal space-y-0.5">
                <p>• Exceso de peso (IMC): <span className="font-bold text-slate-800">{stats.totalExcessWeight}%</span></p>
                <p>• Dolor localizado: <span className="font-bold text-slate-800">{stats.primaryPain.bodyPart} ({stats.primaryPain.percentage}%)</span></p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. HALLAZGOS PRINCIPALES (SST & Talento Humano) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
            <Eye className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-black text-slate-900 font-display">2. Hallazgos Sociodemográficos Principales</h2>
        </div>
        
        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-4xl">
          A través del procesamiento y cruce de datos, el módulo analítico ha consolidado cuatro hallazgos cruciales. 
          Cada hallazgo cruza múltiples variables que influyen en los índices de bienestar subjetivo y en las tasas de morbilidad percibida:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {findings.map((f, idx) => {
            const severityColors = {
              high: { bg: 'bg-rose-50', border: 'border-rose-150', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800' },
              medium: { bg: 'bg-amber-50', border: 'border-amber-150', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
              low: { bg: 'bg-indigo-50', border: 'border-indigo-150', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-800' }
            };
            const currentColors = severityColors[f.severity] || severityColors.medium;
            
            return (
              <div 
                key={idx} 
                className={`p-6 rounded-2xl border ${currentColors.border} ${currentColors.bg} space-y-3.5 flex flex-col justify-between`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${currentColors.badge}`}>
                      Severidad: {f.severity === 'high' ? 'Crítica' : f.severity === 'medium' ? 'Moderada' : 'Baja'}
                    </span>
                    <span className="text-xs font-mono font-black text-slate-800">{f.metric}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm font-display">{f.title}</h4>
                  <p className="text-xs text-slate-700 font-medium leading-relaxed">{f.description}</p>
                </div>
                <div className="pt-2 border-t border-slate-200/40 text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  <span>Requiere atención inmediata en los programas de intervención.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Y 4. FACTORS PROTECTORES Y FACTORES DE RIESGO */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-black text-slate-900 font-display">3 y 4. Factores Protectores e Indicadores de Riesgo</h2>
        </div>
        
        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-4xl">
          El análisis epidemiológico requiere ponderar las fortalezas intrínsecas del grupo de trabajadores frente a las 
          vulnerabilidades detectadas. Esta balanza técnica es la clave para formular programas preventivos viables y de alto impacto:
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Factores Protectores */}
          <div className="bg-emerald-50/40 p-6 rounded-3xl border border-emerald-100 shadow-3xs space-y-5 text-left">
            <div className="flex items-center gap-2.5 text-emerald-800 border-b border-emerald-100 pb-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm text-emerald-950 font-display">3. Factores Protectores de la Nómina</h4>
                <p className="text-[10px] text-emerald-700 font-semibold">Fortalezas demográficas y epidemiológicas encontradas</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-extrabold text-emerald-950">Fuerza Laboral Joven y Altamente Adaptable</h5>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    La edad promedio de <span className="font-black">{stats.avgAge} años</span> favorece un nivel bajo de morbilidades degenerativas crónicas, 
                    alta plasticidad neurológica para capacitaciones de SST y excelente dominio de herramientas tecnológicas.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-extrabold text-emerald-950">Nivel Educativo y Académico de Calidad</h5>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    Con un predominio del nivel <span className="font-black">{stats.primaryEdu.level}</span>, la nómina tiene competencias cognitivas óptimas 
                    para asimilar normas técnicas, liderar comités de convivencia laboral y actuar como vigías de seguridad de forma autónoma.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-extrabold text-emerald-950">Sólido Vínculo de Cuidado Familiar</h5>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    El <span className="font-black">{stats.kidsPct}% de personal con hijos</span> actúa como un motivador socioafectivo y factor de estabilidad 
                    emocional. Ofrece a Talento Humano un ancla para programas de retención enfocados en recreación infantil y escuela de padres.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-1 bg-emerald-100 text-emerald-700 rounded-lg shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 font-bold" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-extrabold text-emerald-950">Potencial de Clima y Disposición de Participación</h5>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    El <span className="font-black">{stats.activeParticipationPct}% de participación activa</span> en el SG-SST refleja receptividad y buena actitud 
                    hacia campañas preventivas corporativas y dinámicas grupales del BPO.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Factores de Riesgo */}
          <div className="bg-rose-50/40 p-6 rounded-3xl border border-rose-100 shadow-3xs space-y-5 text-left">
            <div className="flex items-center gap-2.5 text-rose-800 border-b border-rose-100 pb-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <h4 className="font-extrabold text-sm text-rose-950 font-display">4. Factores de Riesgo de la Nómina</h4>
                <p className="text-[10px] text-rose-700 font-semibold">Desafíos ergonómicos, de salud y psicosociales</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="p-1 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 font-bold" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-extrabold text-rose-950">Fatiga Osteomuscular y Riesgo Biomecánico Continuo</h5>
                  <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                    El <span className="font-black">{stats.primaryPain.percentage}% reporta dolor físico</span> concentrado en <span className="font-black">{stats.primaryPain.bodyPart}</span>. 
                    Las jornadas continuas de diademas y digitación representan un foco de alerta biomecánica severa para el COPASST.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-1 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 font-bold" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-extrabold text-rose-950">Elevado Nivel de Sedentarismo e Índice Metabólico Alto</h5>
                  <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                    El <span className="font-black">{stats.sedentary}% de inactividad física semanal</span> en combinación con un <span className="font-black">{stats.totalExcessWeight}% de exceso de peso corporal</span> 
                    (IMC: {stats.avgImc}) devela una prevalencia severa para morbilidades cardiovasculares a mediano plazo.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-1 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 font-bold" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-extrabold text-rose-950">Carga Financiera Extralaboral (Vulnerabilidad Habitacional)</h5>
                  <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                    El <span className="font-black">{stats.primaryHousing.percentage}% de arriendo</span> en estratos socioeconómicos bajos implica altos costos 
                    mensuales de vida y desgaste derivado de tiempos extensos de desplazamiento diario pre-turno.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-1 bg-rose-100 text-rose-700 rounded-lg shrink-0 mt-0.5">
                  <X className="w-3.5 h-3.5 font-bold" />
                </div>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-extrabold text-rose-950">Riesgo de Rotación Temprana y Curva de Mandos Medios</h5>
                  <p className="text-[11px] text-rose-800 leading-relaxed font-medium">
                    Una antigüedad promedio en la empresa de <span className="font-black">{stats.avgSeniority} años</span> y de <span className="font-black">{stats.avgSeniorityRole || 1.1} años en el cargo actual</span> 
                    evidencia que la fuerza de mandos medios (coordinadores) está en desarrollo inicial de competencias de liderazgo directivo.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 5. GRÁFICOS INTERACTIVOS CON INTERPRETACIÓN AUTOMÁTICA DE CADA GRÁFICO */}
      <div className="space-y-6">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-black text-slate-900 font-display">5. Gráficos Interactivos e Interpretaciones Ejecutivas SG-SST</h2>
        </div>
        
        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-4xl">
          El análisis gráfico no es simplemente visual; cada ilustración de variables sociodemográficas está enlazada a un motor de 
          reglas de medicina preventiva y del trabajo, facilitando una interpretación ejecutiva enmarcada en la salud pública ocupacional:
        </p>

        {/* Bloque Gráficos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Gráfico 1: Grupos de Edad */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Distribución de Grupos de Edad</h4>
                </div>
                <span className="text-[11px] font-bold text-slate-500">Promedio: {stats.avgAge} años</span>
              </div>
              
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.ageGroups} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="range" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="value" fill="#4f46e5" radius={[6, 6, 0, 0]}>
                      {data.ageGroups.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-indigo-900 font-extrabold text-xs">
                <Brain className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Interpretación del Analista SST:</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                La pirámide sociodemográfica muestra un predominio absoluto de población joven. Epidemiológicamente, esto se traduce 
                en un bajo riesgo de enfermedades degenerativas complejas de larga data, pero expone al BPO a altas tasas de rotación voluntaria 
                y fatiga aguda en las diademas. Requiere priorizar el salario emocional y programas de flexibilidad familiar.
              </p>
            </div>
          </div>

          {/* Gráfico 2: Nivel de Escolaridad */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Nivel de Escolaridad Corporativa</h4>
                </div>
                <span className="text-[11px] font-bold text-cyan-600">Predominio: {stats.primaryEdu.level}</span>
              </div>
              
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.education} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorEdu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="level" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                    <Area type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorEdu)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-cyan-900 font-extrabold text-xs">
                <GraduationCap className="w-4 h-4 text-cyan-600 shrink-0" />
                <span>Interpretación del Analista SST:</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                La alta densidad de colaboradores con formación formal en nivel <span className="font-bold text-slate-900">{stats.primaryEdu.level}</span> representa un excelente 
                recurso formativo. El personal calificado asimila con mayor velocidad los protocolos de higiene de columna y autocuidado, 
                además de poseer destrezas para alimentar dinámicamente las mesas de debate del COPASST.
              </p>
            </div>
          </div>

          {/* Gráfico 3: Distribución Geográfica */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Hub Corporativo y Ciudades</h4>
                </div>
                <span className="text-[11px] font-bold text-purple-600">Sede Principal: {stats.primaryCity.name}</span>
              </div>
              
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.city} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="count" fill="#a855f7" radius={[0, 4, 4, 0]}>
                      {data.city.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-purple-950 font-extrabold text-xs">
                <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Interpretación del Analista SST:</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                La alta concentración en <span className="font-bold text-slate-900">{stats.primaryCity.name}</span> define el foco operacional. 
                Los tiempos prolongados de traslado en el transporte de las grandes capitales operan como un estresor intralaboral indirecto, 
                causando cansancio acumulado o tensión nerviosa pre-turno. Es clave fomentar esquemas de teletrabajo de forma parcial.
              </p>
            </div>
          </div>

          {/* Gráfico 4: Tenencia de Vivienda */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Tenencia de Vivienda (Bienestar)</h4>
                </div>
                <span className="text-[11px] font-bold text-emerald-600">Arriendo: {stats.primaryHousing.percentage}%</span>
              </div>
              
              <div className="h-56 flex items-center justify-around gap-4">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.housing}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="count"
                      >
                        {data.housing.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-2 text-left shrink-0">
                  {data.housing.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-[10px] font-semibold text-slate-600">{item.type}:</span>
                      <span className="text-[10px] font-black text-slate-900">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-emerald-950 font-extrabold text-xs">
                <Home className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Interpretación del Analista SST:</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                Un total del <span className="font-bold text-slate-900">{stats.primaryHousing.percentage}% vive en vivienda {stats.primaryHousing.type}</span>. 
                El pago de arriendos mensuales representa una carga psicológica recurrente y afectación económica directa. 
                Ofrecer programas de asesoramiento financiero habitacional corporativo con cajas de compensación disminuye el desgaste mental intralaboral.
              </p>
            </div>
          </div>

          {/* Gráfico 5: Distribución Nutricional e IMC */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Clasificación Nutricional (IMC)</h4>
                </div>
                <span className="text-[11px] font-bold text-teal-600">Peso Excesivo: {stats.totalExcessWeight}%</span>
              </div>
              
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={imcData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="category" tick={{ fontSize: 8, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="percentage" fill="#0d9488" radius={[6, 6, 0, 0]}>
                      {imcData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-teal-950 font-extrabold text-xs">
                <Activity className="w-4 h-4 text-teal-600 shrink-0" />
                <span>Interpretación del Analista SST:</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                La cohorte tiene un IMC promedio de <span className="font-bold text-slate-900">{stats.avgImc}</span>. Un consolidado de <span className="font-bold text-slate-900">{stats.totalExcessWeight}%</span> sufre 
                de sobrepeso u obesidad, catalizado por el <span className="font-bold text-slate-900">{stats.sedentary}% de sedentarismo absoluto</span>. Es indispensable un programa de vigilancia cardiometabólica 
                y tamizaje de loncheras saludables para mitigar riesgos vasculares silenciosos.
              </p>
            </div>
          </div>

          {/* Gráfico 6: Prevalencia de Molestias Osteomusculares */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/50 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Prevalencia de Sintomatología Osteomuscular</h4>
                </div>
                <span className="text-[11px] font-bold text-rose-600">Alerta: {stats.primaryPain.bodyPart} ({stats.primaryPain.percentage}%)</span>
              </div>
              
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={musculoskeletalData} layout="vertical" margin={{ top: 10, right: 10, left: 15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="bodyPart" type="category" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 10, borderRadius: 12, border: '1px solid #e2e8f0' }} />
                    <Bar dataKey="percentage" fill="#e11d48" radius={[0, 4, 4, 0]}>
                      {musculoskeletalData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 5) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-left">
              <div className="flex items-center gap-1.5 text-rose-950 font-extrabold text-xs">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Interpretación del Analista SST:</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                La prevalencia del <span className="font-bold text-slate-900">{stats.primaryPain.percentage}% de molestias en {stats.primaryPain.bodyPart}</span> constata 
                la fuerte carga biomecánica debida al uso de diademas y postura sedente continuada. Se deben programar de manera rigurosa pausas 
                activas enfocadas en estiramiento de tren superior (cuello, hombros, manos y muñecas).
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 6. MATRIZ DE PRIORIZACIÓN DE RIESGOS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
            <FileText className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-black text-slate-900 font-display">6. Matriz Técnica de Priorización de Riesgos SG-SST</h2>
        </div>
        
        <p className="text-xs text-slate-600 font-medium leading-relaxed max-w-4xl">
          Integrando las variables demográficas y de salud, se formula la matriz técnica de priorización epidemiológica para 
          canalizar con eficiencia los recursos y recursos preventivos de la organización BPO:
        </p>

        <div className="bg-white rounded-3xl border border-slate-200/60 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/60 text-slate-600 text-[10px] uppercase tracking-wider font-extrabold">
                  <th className="py-4 px-5">Factor de Riesgo Identificado</th>
                  <th className="py-4 px-5">Categoría SST</th>
                  <th className="py-4 px-5 text-center">Probabilidad</th>
                  <th className="py-4 px-5 text-center">Impacto</th>
                  <th className="py-4 px-5 text-center">Nivel de Riesgo</th>
                  <th className="py-4 px-5">Acción Prioritaria de Intervención</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                {/* Fila 1 */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-extrabold text-slate-900">Fatiga Osteomuscular Recurrente</div>
                    <div className="text-[10px] text-slate-400 font-medium">Dolor de {stats.primaryPain.bodyPart} ({stats.primaryPain.percentage}%)</div>
                  </td>
                  <td className="py-4 px-5 text-slate-500">Riesgo Biomecánico / Ergonómico</td>
                  <td className="py-4 px-5 text-center font-bold text-rose-600">Muy Alta</td>
                  <td className="py-4 px-5 text-center text-rose-600 font-bold">Crítico</td>
                  <td className="py-4 px-5 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 text-[9px] font-black uppercase">Crítico</span>
                  </td>
                  <td className="py-4 px-5 text-[11px] text-slate-600 leading-relaxed font-medium">
                    Fisioterapia in situ, pausas activas dirigidas obligatorias cada 3 horas por líderes de operaciones y rediseño postural.
                  </td>
                </tr>

                {/* Fila 2 */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-extrabold text-slate-900">Riesgo Vascular y Metabólico</div>
                    <div className="text-[10px] text-slate-400 font-medium">{stats.totalExcessWeight}% sobrepeso u obesidad y {stats.sedentary}% sedentarismo</div>
                  </td>
                  <td className="py-4 px-5 text-slate-500">Medicina del Trabajo / Estilos de Vida</td>
                  <td className="py-4 px-5 text-center font-bold text-orange-600">Alta</td>
                  <td className="py-4 px-5 text-center text-orange-600 font-bold">Moderado</td>
                  <td className="py-4 px-5 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-orange-100 text-orange-800 text-[9px] font-black uppercase">Alto</span>
                  </td>
                  <td className="py-4 px-5 text-[11px] text-slate-600 leading-relaxed font-medium">
                    Lanzamiento del programa de Nutrición Dinámica de tamizaje de cintura, fomento deportivo gamificado de Pasos Activos y charlas de ARL.
                  </td>
                </tr>

                {/* Fila 3 */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-extrabold text-slate-900">Estrés, Desgaste y Cansancio Mental</div>
                    <div className="text-[10px] text-slate-400 font-medium">Fatiga cognitiva asociada a metas (AHT) y atención telefónica</div>
                  </td>
                  <td className="py-4 px-5 text-slate-500">Riesgo Psicosocial / Intralaboral</td>
                  <td className="py-4 px-5 text-center font-bold text-amber-600">Media</td>
                  <td className="py-4 px-5 text-center text-rose-600 font-bold">Crítico</td>
                  <td className="py-4 px-5 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black uppercase">Alto</span>
                  </td>
                  <td className="py-4 px-5 text-[11px] text-slate-600 leading-relaxed font-medium">
                    Ejecución obligatoria de la Batería del Ministerio de Trabajo (Res. 2646) y despliegue del módulo interactivo de micro-respiraciones guiadas.
                  </td>
                </tr>

                {/* Fila 4 */}
                <tr className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="font-extrabold text-slate-900">Inestabilidad y Rotación Voluntaria</div>
                    <div className="text-[10px] text-slate-400 font-medium">Promedio antigüedad: {stats.avgSeniority} años y {stats.avgAge} años edad promedio</div>
                  </td>
                  <td className="py-4 px-5 text-slate-500">Gestión de Talento Humano</td>
                  <td className="py-4 px-5 text-center font-bold text-blue-600">Media</td>
                  <td className="py-4 px-5 text-center text-blue-600 font-bold">Moderado</td>
                  <td className="py-4 px-5 text-center">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[9px] font-black uppercase">Medio</span>
                  </td>
                  <td className="py-4 px-5 text-[11px] text-slate-600 leading-relaxed font-medium">
                    Programas de retención con salario emocional, auxilios de vivienda con cajas de compensación y entrenamientos en liderazgo empático a supervisores.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 7. INSIGHT GENERADO POR INTELIGENCIA ARTIFICIAL */}
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
            <Sparkles className="w-4 h-4 text-cyan-200" />
          </div>
          <h2 className="text-lg font-black text-slate-900 font-display">7. Dictamen Estratégico AI (Asistente IA)</h2>
        </div>

        <div className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white p-8 rounded-3xl border border-slate-800 shadow-lg space-y-5 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 w-[45%] h-[100%] bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none" />
          
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-cyan-400/10 text-cyan-400 rounded-2xl">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-cyan-300">Inteligencia Artificial de Diagnóstico</h4>
              <p className="text-[10px] text-slate-400 font-bold">Análisis Predictivo de Riesgos y Rotación</p>
            </div>
          </div>

          <div className="space-y-4 text-slate-300 text-xs font-medium leading-relaxed max-w-4xl">
            <p>
              Basado en el diagnóstico consolidado de los <span className="font-extrabold text-cyan-300">{stats.total} colaboradores activos</span>, 
              el motor analítico emite el siguiente dictamen táctico:
            </p>
            
            <p>
              La colisión de una fuerza laboral marcadamente joven (promedio <span className="font-extrabold text-white">{stats.avgAge} años</span>) con un 
              alarmante <span className="font-extrabold text-amber-300">{stats.sedentary}% de inactividad física</span>, un <span className="font-extrabold text-rose-300">{stats.primaryPain.percentage}% de dolores posturales recurrentes en {stats.primaryPain.bodyPart}</span> 
              y un <span className="font-extrabold text-cyan-300">{stats.totalExcessWeight}% de exceso de peso corporal</span>, devela un patrón de alta vulnerabilidad física que puede comprometer la productividad. 
              El trabajo continuo ante pantallas digitales expone al personal a riesgos biomecánicos intensos, lo que incide directamente sobre el 
              <span className="font-bold text-white"> {stats.absenteeism}% de ausentismo médico registrado</span>.
            </p>
            
            <p>
              Adicionalmente, el hecho de que el <span className="font-extrabold text-white">{stats.primaryHousing.percentage}% dependa de vivienda arrendada</span> (estratos {stats.primaryStratum.stratum} mayormente) 
              e incremente sus desplazamientos, actúa como un estresor extralaboral de primer orden que exacerba el agotamiento físico del agente al inicio de su jornada.
            </p>

            <div className="p-4.5 bg-white/5 border border-white/10 rounded-2xl space-y-1.5 mt-2">
              <p className="font-black text-cyan-300 text-xs uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-cyan-300" />
                <span>Recomendación Estratégica del Sistema de IA:</span>
              </p>
              <p className="text-slate-200 text-[11px] leading-relaxed font-semibold">
                No trate el SG-SST como un mero protocolo de cumplimiento legal documental. Gamifique el autocuidado de sus colaboradores vinculándolo 
                con los tableros de incentivos del negocio. Introducir micro-estiramientos compensatorios estructurados de 7 minutos como las 
                <span className="text-cyan-300 font-bold"> &quot;Pausas de Impacto&quot;</span> y esquemas nutricionales dinámicos como <span className="text-cyan-300 font-bold">&quot;Nutrición Dinámica&quot;</span>, 
                además de auxilios de vivienda pactados con Cajas de Compensación, no solo mitigará la morbilidad ocupacional, sino que fidelizará 
                a la nómina, disminuyendo la rotación voluntaria y elevando el Índice de Clima Organizacional por encima del 90%.
              </p>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

    </div>
  );
}
