import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import WelcomeScreen from './components/WelcomeScreen';
import HomeDashboard from './components/HomeDashboard';
import CentroAnalitico from './components/CentroAnalitico';
import DashboardEjecutivo from './components/DashboardEjecutivo';
import Sidebar from './components/Sidebar';
import PanelGerencialTab from './components/PanelGerencialTab';
import AnalisisTab from './components/AnalisisTab';
import IndicadoresTab from './components/IndicadoresTab';
import PlanAccionInteligenteTab from './components/PlanAccionInteligenteTab';
import PlanBienestarTab from './components/PlanBienestarTab';
import InformeEjecutivoTab from './components/InformeEjecutivoTab';
import ConfiguracionTab from './components/ConfiguracionTab';
import RiskMapSection from './components/RiskMapSection';
import AnnualPlanSection from './components/AnnualPlanSection';
import PredictiveIntelligenceSection from './components/PredictiveIntelligenceSection';
import LoginPage from './components/LoginPage';
import AusentismoTab from './components/AusentismoTab';
import AyudaTab from './components/AyudaTab';

import { DemographicsData, Recommendation } from './types';
import { generateAiConclusions, generateRecommendations, AiConclusion } from './utils/aiRecommender';
import { downloadExcelTemplate } from './utils/excelTemplateGenerator';
import HappyIATab from './components/HappyIATab';
import { PeopleCopilot } from './modules/copilot';
import { BibliotecaInteligente } from './modules/biblioteca';
import { PlantillasInteligentes } from './modules/plantillas';
import { parseExcelFile } from './utils/excelParser';
import { ConfiguracionEmpresa } from './modules/empresa/components';
import { useCompanySettings } from './utils/companySettings';
import { useEmpresa } from './modules/configuracion/useEmpresa';
import SetupWizard from './components/SetupWizard';
import { PanelAdministracion } from './modules/administracion';
import { AdministracionEmpresasModule } from './modules/administracion_empresas';
import { CatalogosOrganizacionalesModule } from './modules/catalogos_organizacionales';
import SmartDataValidator from './components/SmartDataValidator';
import { auditDemographicsData } from './utils/dataValidator';
import DataQualityTab from './components/DataQualityTab';
import DataQualitySummaryCard from './components/DataQualitySummaryCard';
import { ValidadorExcelModule } from './modules/validador_excel';

// Clima Organizacional Imports
import ClimaExcelUpload from './modules/clima/components/ClimaExcelUpload';
import ClimaDashboard from './modules/clima/components/ClimaDashboard';
import ClimaIndicators from './modules/clima/components/ClimaIndicators';
import ClimaExecutiveReport from './modules/clima/components/ClimaExecutiveReport';
import ClimaRecomendaciones from './modules/clima/components/ClimaRecomendaciones';
import ClimaPlanAccion from './modules/clima/components/ClimaPlanAccion';
import { ClimateData, ClimateRecommendation } from './modules/clima/clima.types';

// Riesgo Psicosocial Imports
import PsicosocialModule from './modules/psicosocial/PsicosocialModule';

// Centro de Inteligencia Organizacional Import
import { CentroInteligenciaModule } from './modules/centro_inteligencia/CentroInteligenciaModule';

// Motor Universal de Encuestas Import
import UniversalSurveyAnalyzer from './modules/encuestas/components/UniversalSurveyAnalyzer';

// Dashboard Builder Import
import { DashboardBuilderInteractive } from './modules/dashboard/components';

// Central AI Engine Import
import { AIEngineShowcase } from './modules/ia/components';

// Central Organizational Indicators Import
import { IndicatorCenter } from './modules/indicadores';

// Regulatory Compliance Center Import
import { ComplianceCenter } from './modules/cumplimiento';

// Encuesta Sociodemográfica Import
import { EncuestaSociodemograficaModule } from './modules/encuesta_sociodemografica';

// Constructor de Encuestas Import
import { ConstructorEncuestasModule } from './modules/constructor_encuestas';

// Arquitectura de Datos Maestro Import
import { ArquitecturaDatosModule } from './modules/arquitectura_datos/ArquitecturaDatosModule';

// Administración de Usuarios & Permisos Import
import { AdministracionUsuariosModule } from './modules/administracion_usuarios';

// Maestro de Colaboradores Import
import { ColaboradoresModule } from './modules/colaboradores';

// Gobernanza & Estrategia de IA Import
import { IAGovernanceModule, IAStrategyModule } from './modules/ia/components';

// Viabilidad del Negocio Import
import { ViabilidadNegocioModule } from './modules/viabilidad_negocio';

// IA vs Power BI Import
import { IaVsPowerBiModule } from './modules/ia_vs_powerbi';

// SaaS Administration Import
import { CentroAdministracionModule } from './modules/administracion_saas';

// Onboarding & Activación Empresarial Import
import { OnboardingModule } from './modules/onboarding/OnboardingModule';

// Centro Ejecutivo 360 & Experiencia SaaS Import
import { CentroEjecutivoModule } from './modules/centro_ejecutivo';

// Gestión de Acciones, Planes de Mejora y Seguimiento (Fase 10) Import
import { PlanesAccionModule } from './modules/planes_accion';


import { 
  Users, 
  Activity, 
  Layers, 
  Sparkles, 
  HeartHandshake, 
  FileText, 
  Settings,
  Smile,
  RefreshCw,
  Home,
  UploadCloud,
  AlertCircle,
  Info,
  FileSpreadsheet,
  TrendingUp,
  ShieldAlert,
  ClipboardList,
  Brain,
  Building,
  ShieldCheck,
  LayoutDashboard,
  Cpu,
  Target,
  Compass
} from 'lucide-react';

export default function App() {
  const { config, activeCompanyId } = useEmpresa();
  const companyName = config?.nombreEmpresa || 'Mi Empresa';
  const isCompanyConfigured = config && config.nombreEmpresa && config.nombreEmpresa.trim() !== '';
  const isCiiuConfigured = config && config.codigoCIIU && config.codigoCIIU.trim() !== '';

  const renderCiiuGuard = (moduleName: string) => (
    <div className="bg-white p-10 rounded-3xl border border-slate-250/50 shadow-2xs text-center space-y-6 max-w-xl mx-auto my-12 animate-scale-up">
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-3xs">
        <Cpu className="w-8 h-8 animate-pulse text-indigo-600" />
      </div>
      <div className="space-y-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-full text-[10px] font-black uppercase tracking-wider">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Parametrización Requerida</span>
        </span>
        <h3 className="font-black text-slate-900 text-sm font-display tracking-tight leading-snug">
          Configuración Inteligente Obligatoria
        </h3>
        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          De acuerdo con el Decreto 768 de 2022 y Decreto 1072 de 2015 del SG-SST de Colombia, para acceder al módulo de <strong className="text-slate-800 font-black">{moduleName}</strong> es obligatorio parametrizar la empresa.
        </p>
        <p className="text-xs text-indigo-600 font-bold leading-relaxed">
          Esto asocia su código CIIU, determina la clase de riesgo ARL, mapea los riesgos laborales prioritarios de ley y activa los perfiles sectoriales que configuran la consola de forma parametrizada.
        </p>
      </div>
      <button 
        type="button"
        onClick={() => {
          setActiveTab('configuracion');
          setActiveConfigSubTab('config_empresa');
        }}
        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-indigo-600/10 cursor-pointer transition-all hover:scale-[1.01]"
      >
        Completar Configuración Inteligente Ahora
      </button>
    </div>
  );

  // Estado de Autenticación SaaS
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Estado de Tab Activo (11 opciones principales de la barra lateral)
  const [activeTab, setActiveTab] = useState<string>('inicio');
  
  // Estado de sub-tabs internos para cada sección
  const [activeClimaSubTab, setActiveClimaSubTab] = useState<string>('clima_dashboard');
  const [activeIndicadoresSubTab, setActiveIndicadoresSubTab] = useState<string>('centro_indicadores');
  const [activeIaSubTab, setActiveIaSubTab] = useState<string>('people_copilot_ia');
  const [activePlanesSubTab, setActivePlanesSubTab] = useState<string>('recomendaciones');
  const [activeInformesSubTab, setActiveInformesSubTab] = useState<string>('informe');
  const [activeConfigSubTab, setActiveConfigSubTab] = useState<string>('config_empresa');
  
  // Estado de vista del home (Ejecutivo vs Operativo)
  const [homeView, setHomeView] = useState<'ejecutivo' | 'operativo'>('ejecutivo');
  
  // Datos modificables de Demografía, Conclusiones y Recomendaciones
  const [analysisData, setAnalysisData] = useState<DemographicsData | null>(null);
  const [aiConclusions, setAiConclusions] = useState<AiConclusion[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  
  // Estado de Clima Organizacional
  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [climateFileName, setClimateFileName] = useState<string | null>(null);
  const [syncClimateRecs, setSyncClimateRecs] = useState<ClimateRecommendation[]>([]);
  
  // Archivo Excel cargado
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; date: string } | null>(null);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // Estados para el cargador central
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // EFECTOS PARA MULTIEMPRESA (PERSISTENCIA INDEPENDIENTE DE DATOS)
  useEffect(() => {
    if (!activeCompanyId) return;
    try {
      const savedDemo = localStorage.getItem(`happy_insight_demographics_${activeCompanyId}`);
      const savedFile = localStorage.getItem(`happy_insight_uploaded_file_${activeCompanyId}`);
      const savedRecs = localStorage.getItem(`happy_insight_recommendations_${activeCompanyId}`);
      const savedConclusions = localStorage.getItem(`happy_insight_ai_conclusions_${activeCompanyId}`);

      setAnalysisData(savedDemo ? JSON.parse(savedDemo) : null);
      setUploadedFile(savedFile ? JSON.parse(savedFile) : null);
      setRecommendations(savedRecs ? JSON.parse(savedRecs) : []);
      setAiConclusions(savedConclusions ? JSON.parse(savedConclusions) : []);
      
      // Cargar Clima
      const savedClimateData = localStorage.getItem(`happyclima_data_${activeCompanyId}`);
      const savedClimateFile = localStorage.getItem(`happyclima_filename_${activeCompanyId}`);
      setClimateData(savedClimateData ? JSON.parse(savedClimateData) : null);
      setClimateFileName(savedClimateFile ? JSON.parse(savedClimateFile) : null);
      
      setParseError(null);
      setMissingColumns([]);
      setUploadSuccessMessage(null);
    } catch (e) {
      console.error("Error al cargar datos específicos de empresa:", e);
    }
  }, [activeCompanyId]);

  // Persistencia de Clima
  useEffect(() => {
    if (!activeCompanyId) return;
    try {
      if (climateData) {
        localStorage.setItem(`happyclima_data_${activeCompanyId}`, JSON.stringify(climateData));
      } else {
        localStorage.removeItem(`happyclima_data_${activeCompanyId}`);
      }
    } catch (e) {
      console.error("Error al persistir climateData:", e);
    }
  }, [climateData, activeCompanyId]);

  useEffect(() => {
    if (!activeCompanyId) return;
    try {
      if (climateFileName) {
        localStorage.setItem(`happyclima_filename_${activeCompanyId}`, JSON.stringify(climateFileName));
      } else {
        localStorage.removeItem(`happyclima_filename_${activeCompanyId}`);
      }
    } catch (e) {
      console.error("Error al persistir climateFileName:", e);
    }
  }, [climateFileName, activeCompanyId]);

  useEffect(() => {
    if (!activeCompanyId) return;
    try {
      if (analysisData) {
        localStorage.setItem(`happy_insight_demographics_${activeCompanyId}`, JSON.stringify(analysisData));
      } else {
        localStorage.removeItem(`happy_insight_demographics_${activeCompanyId}`);
      }
    } catch (e) {
      console.error("Error al persistir analysisData:", e);
    }
  }, [analysisData, activeCompanyId]);

  useEffect(() => {
    if (!activeCompanyId) return;
    try {
      if (uploadedFile) {
        localStorage.setItem(`happy_insight_uploaded_file_${activeCompanyId}`, JSON.stringify(uploadedFile));
      } else {
        localStorage.removeItem(`happy_insight_uploaded_file_${activeCompanyId}`);
      }
    } catch (e) {
      console.error("Error al persistir uploadedFile:", e);
    }
  }, [uploadedFile, activeCompanyId]);

  useEffect(() => {
    if (!activeCompanyId) return;
    try {
      if (recommendations && recommendations.length > 0) {
        localStorage.setItem(`happy_insight_recommendations_${activeCompanyId}`, JSON.stringify(recommendations));
      } else {
        localStorage.removeItem(`happy_insight_recommendations_${activeCompanyId}`);
      }
    } catch (e) {
      console.error("Error al persistir recommendations:", e);
    }
  }, [recommendations, activeCompanyId]);

  useEffect(() => {
    if (!activeCompanyId) return;
    try {
      if (aiConclusions && aiConclusions.length > 0) {
        localStorage.setItem(`happy_insight_ai_conclusions_${activeCompanyId}`, JSON.stringify(aiConclusions));
      } else {
        localStorage.removeItem(`happy_insight_ai_conclusions_${activeCompanyId}`);
      }
    } catch (e) {
      console.error("Error al persistir aiConclusions:", e);
    }
  }, [aiConclusions, activeCompanyId]);

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
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setParseError('Por favor selecciona un archivo Excel válido (.xlsx o .xls).');
      return;
    }

    setIsParsing(true);
    setParseProgress(20);
    setParseError(null);
    setMissingColumns([]);

    const interval = setInterval(() => {
      setParseProgress(prev => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 15;
      });
    }, 120);

    parseExcelFile(file)
      .then(result => {
        clearInterval(interval);
        if (result.success && result.data) {
          setParseProgress(100);
          setTimeout(() => {
            setIsParsing(false);
            const missing = result.missingColumns || [];
            setMissingColumns(missing);
            handleRealUpload(result.data!, file.name, `${(file.size / 1024).toFixed(1)} KB`, missing);
          }, 500);
        } else {
          setIsParsing(false);
          setParseError(result.error || 'Error al procesar el archivo Excel. Por favor verifica que no esté protegido o dañado.');
        }
      })
      .catch(err => {
        clearInterval(interval);
        setIsParsing(false);
        setParseError(err?.message || 'Error al procesar el archivo Excel.');
      });
  };

  // Función para manejar la carga real del Excel y actualización
  const handleRealUpload = (data: DemographicsData, fileName: string, fileSize: string, missing: string[] = []) => {
    setUploadedFile({
      name: fileName,
      size: fileSize,
      date: new Date().toLocaleDateString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      })
    });
    setAnalysisData(data);
    
    if (missing.length > 0) {
      setUploadSuccessMessage(`El archivo "${fileName}" (${fileSize}) se ha procesado con advertencias. Las siguientes variables no estaban presentes y se registraron como "No disponible": ${missing.join(', ')}. Las gráficas e indicadores se han adaptado automáticamente.`);
    } else {
      setUploadSuccessMessage(`El archivo "${fileName}" (${fileSize}) se ha procesado correctamente. Se identificaron las 17 dimensiones sociodemográficas requeridas y se recalcularon ${data.totalEmployees} registros en tiempo real.`);
    }

    // Generar conclusiones y diagnósticos de forma dinámica
    const dynamicConclusions = generateAiConclusions(data);
    setAiConclusions(dynamicConclusions);

    // Generar recomendaciones de forma dinámica
    const dynamicRecs = generateRecommendations(data).map((r, idx) => ({
      id: `rec-dyn-${idx}-${Date.now()}`,
      category: r.category,
      title: r.title,
      desc: r.desc,
      priority: r.priority,
      status: 'Planificada' as const,
      responsible: 'Coordinador SG-SST'
    }));
    setRecommendations(dynamicRecs);
  };

  // Restaurar a datos iniciales (vaciar para forzar uploader)
  const handleRestoreData = () => {
    setUploadedFile(null);
    setAnalysisData(null);
    setRecommendations([]);
    setAiConclusions([]);
    setParseError(null);
    setMissingColumns([]);
    setUploadSuccessMessage(null);
  };

  // Actualización manual de parámetros (en Configuración)
  const handleUpdateData = (newData: Partial<DemographicsData>) => {
    if (!analysisData) return;
    setAnalysisData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...newData
      };
    });
  };

  // Toggle de estado de las recomendaciones (en Plan de Bienestar)
  const handleToggleStatus = (id: string, newStatus: any) => {
    setRecommendations(prev => prev.map(rec => {
      if (rec.id === id) {
        return { ...rec, status: newStatus };
      }
      return rec;
    }));
  };

  // Añadir una nueva recomendación creada por el usuario
  const handleAddRecommendation = (rec: Omit<Recommendation, 'id'>) => {
    const newRec: Recommendation = {
      ...rec,
      id: `rec-${Date.now()}`
    };
    setRecommendations(prev => [newRec, ...prev]);
  };

  // Si no está autenticado, renderizar la pantalla de Login
  if (!isAuthenticated) {
    return (
      <LoginPage 
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setActiveTab('inicio');
          setHomeView('ejecutivo');
        }} 
      />
    );
  }

  // Si el tab seleccionado es "inicio", mostramos el Home Dashboard profesional
  const handleTabChange = (tab: any) => {
    if (tab === 'inicio') {
      setActiveTab('inicio');
      setHomeView('ejecutivo');
    } else if (tab === 'cargar_excel') {
      handleRestoreData();
      setActiveTab('dashboard');
    } else if (tab === 'graficos') {
      setActiveTab('dashboard');
      setTimeout(() => {
        const el = document.getElementById('dashboard-charts-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 150);
    } else if (tab === 'asistente_ia') {
      setActiveTab('asistente_ia');
    } else {
      setActiveTab(tab);
    }
  };

  // Las inconsistencias no bloquean la visualización del Dashboard o Informe (100% de colaboradores siempre disponibles)
  const isDemoInconsistent = false;

  const renderInconsistencyBlocker = () => {
    return (
      <div className="max-w-4xl mx-auto space-y-6 text-left animate-fade-in py-4">
        <div className="bg-rose-50 border border-rose-200 p-5 rounded-3xl flex items-start gap-4 shadow-xs">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-2xl shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-xs space-y-1">
            <h4 className="font-extrabold text-rose-950 text-sm">Visualización Restringida por Inconsistencia de Datos</h4>
            <p className="text-rose-700 font-semibold leading-relaxed">
              El Sistema de Gestión de SST de Happy Insight ha detectado inconsistencias lógicas en el archivo cargado o en la configuración activa. Para evitar que la alta gerencia reciba reportes cruzados distorsionados, se ha suspendido el acceso al Dashboard y al Informe Ejecutivo hasta que la base de datos sea declarada consistente.
            </p>
          </div>
        </div>
        <SmartDataValidator 
          data={analysisData} 
          onCorrectData={(corrected) => {
            setAnalysisData(corrected);
            // Regenerate AI components on the fly
            const dynamicConclusions = generateAiConclusions(corrected);
            setAiConclusions(dynamicConclusions);
            const rawRecs = generateRecommendations(corrected);
            const dynamicRecs = rawRecs.map((r, i) => ({
              id: `rec-${Date.now()}-${i}`,
              category: r.category,
              title: r.title,
              desc: r.desc,
              priority: r.priority,
              status: 'Planificada' as const,
              responsible: 'Coordinador SG-SST'
            }));
            setRecommendations(dynamicRecs);
          }} 
        />
      </div>
    );
  };

  // Obtener íconos y títulos correspondientes para el cabezote de cada sección
  const getTabHeaderDetails = () => {
    switch (activeTab) {
      case 'inicio':
        return { title: 'Inicio - Centro de Control', desc: `Bienvenido al Home Dashboard de ${companyName}.`, icon: Home };
      case 'encuesta_sociodemografica':
        return { title: 'Encuesta Sociodemográfica Organizacional', desc: 'Formulario de recolección directa de información sociodemográfica.', icon: ClipboardList };
      case 'evaluaciones':
        return { title: 'Evaluaciones Organizacionales', desc: 'Diagnóstico y monitoreo inteligente de la experiencia y salud del personal.', icon: ClipboardList };
      case 'panel_gerencial':
        return { title: 'Panel Gerencial', desc: 'Consolidado estratégico de indicadores, semáforo de riesgos y prioridades del SG-SST.', icon: TrendingUp };
      case 'analisis':
        return { title: 'Análisis Sociodemográfico', desc: 'Sube bases Excel y visualiza correlaciones demográficas complejas.', icon: Users };
      case 'calidad_datos':
        return { title: 'Calidad de Datos', desc: 'Auditoría heurística, gobernanza, consistencia demográfica e integridad de la información.', icon: ShieldCheck };
      case 'validador_excel':
        return { title: 'Validador Inteligente de Archivos Excel', desc: 'Auditoría de integridad antes de importar. Garantía de cero información sintética o inventada.', icon: ShieldCheck };
      case 'mapa_riesgos':
        return { title: 'Mapa Inteligente de Riesgos', desc: 'Identificación y segmentación de niveles de riesgo del personal en base a variables demográficas clave.', icon: ShieldAlert };
      case 'plan_anual':
        return { title: 'Plan Anual SG-SST', desc: 'Plan anual estratégico de Seguridad y Salud en el Trabajo automatizado a partir del análisis sociodemográfico.', icon: ClipboardList };
      case 'inteligencia_predictiva':
        return { title: 'Inteligencia Predictiva', desc: 'Simula escenarios sociodemográficos avanzados, recalcula impactos financieros y clasifica riesgos.', icon: Brain };
      case 'dashboard':
        return { title: 'Dashboard de Control SG-SST', desc: `Panel principal de KPIs e indicadores del personal de ${companyName}.`, icon: Activity };
      case 'indicadores':
        return { title: 'Indicadores Detallados', desc: 'Filtra y segmenta por sedes, hubs y departamentos de operaciones.', icon: Layers };
      case 'ia':
        return { title: 'Módulos de Inteligencia Artificial', desc: 'Asistente consultivo, simulador predictivo y motor analítico SG-SST.', icon: Sparkles };
      case 'gobernanza_ia':
        return { title: 'Gobernanza de Inteligencia Artificial', desc: 'Principios éticos, inventario de modelos, matriz de riesgos y control de recomendaciones auditables.', icon: ShieldCheck };
      case 'estrategia_ia':
        return { title: 'Estrategia de Inteligencia Artificial', desc: 'Marco estratégico, pilares de valor, matriz de casos de uso y madurez de IA.', icon: Target };
      case 'asistente_ia':
        return { title: 'Asistente Happy IA', desc: 'Consultor inteligente de SG-SST con diagnósticos avanzados y recomendaciones dinámicas.', icon: Sparkles };
      case 'recomendaciones':
        return { title: 'Plan de Acción Inteligente', desc: 'Construcción y clasificación automática del plan de intervención por programas basándose en la encuesta sociodemográfica.', icon: HeartHandshake };
      case 'plan':
        return { title: 'Plan de Bienestar & Intervención', desc: 'Gestiona campañas prioritarias y asignaciones de responsabilidades.', icon: HeartHandshake };
      case 'informe':
        return { title: 'Informe Ejecutivo para Gerencia', desc: 'Estructura un resumen de gerencia formal optimizado para impresión.', icon: FileText };
      case 'config':
        return { title: 'Configuración y Simulación', desc: 'Modifica variables sociodemográficas para evaluar hipótesis de bienestar.', icon: Settings };
      case 'config_empresa':
        return { title: 'Configuración de Empresa', desc: 'Personaliza los datos corporativos, NIT, logotipo y responsables del informe.', icon: Building };
      case 'administracion':
        return { title: 'Administración y Control', desc: 'Consola administrativa central de la plataforma, licencias, usuarios, roles e integridad del sistema.', icon: ShieldCheck };
      case 'colaboradores':
        return { title: 'Maestro de Colaboradores', desc: 'Directorio maestro de empleados, expedientes digitales y trazabilidad relacional.', icon: Users };
      default:
        return { title: 'Dashboard de Control SG-SST', desc: `Métricas sociodemográficas de ${companyName}.`, icon: Activity };
    }
  };

  const headerDetails = getTabHeaderDetails();
  const HeaderIcon = headerDetails.icon;

  // Dynamic date generation in Spanish
  const systemDateSpanish = new Date().toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col font-sans text-slate-800">
      
      {/* 1. BARRA SUPERIOR EXECUTIVA PERMANENTE (SAAS HIGH CONTRAST) */}
      <header className="bg-slate-950 border-b border-slate-800 text-white h-16 px-6 flex items-center justify-between shrink-0 no-print z-10 select-none">
        {/* Left section: Logo, Company & Platform Name */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            {config.logo ? (
              <img 
                src={config.logo} 
                alt="Logo Empresa" 
                className="w-8 h-8 object-contain rounded-lg bg-white/10 p-1 border border-white/10"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-lg shadow-md shrink-0">
                <Building className="w-4.5 h-4.5 text-white" />
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xs tracking-tight text-white uppercase font-display leading-none">
                {companyName}
              </span>
              <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
                Empresa Activa
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-slate-800" />

          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm tracking-tight text-white font-display">Insight People IA</span>
              <span className="bg-cyan-400/10 text-cyan-300 text-[8px] px-1 py-0.5 rounded font-black tracking-widest border border-cyan-400/20 uppercase">
                SaaS
              </span>
            </div>
            <span className="text-[8px] text-slate-500 font-bold block leading-none">
              Plataforma Inteligente para Gestión de Personas, SG-SST y Bienestar
            </span>
          </div>
        </div>

        {/* Central & Right section: DB status, Employees, User, Date */}
        <div className="flex items-center gap-6 text-xs">
          
          {/* DB Connection Status Indicator */}
          <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-left text-[9px] font-bold">
              <span className="text-slate-400 block uppercase font-black leading-none">Estado de Conexión</span>
              <span className="text-emerald-400 truncate max-w-[150px] block mt-0.5">
                Conectado a la BD de "{companyName}"
              </span>
            </div>
          </div>

          {/* Quantity of Employees processed */}
          <div className="hidden md:flex items-center gap-2 bg-indigo-950/40 border border-indigo-900/30 px-3 py-1.5 rounded-xl">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <div className="text-left text-[9px] font-bold">
              <span className="text-slate-400 block uppercase font-black leading-none">Base Procesada</span>
              <span className="text-slate-200 block mt-0.5">
                {analysisData ? analysisData.totalEmployees : 482} Colaboradores
              </span>
            </div>
          </div>

          {/* User info & Date */}
          <div className="flex items-center gap-4 border-l border-slate-800 pl-6">
            <div className="hidden md:flex flex-col text-right">
              <p className="text-[10px] text-slate-400 font-bold capitalize leading-none mb-1">
                {systemDateSpanish}
              </p>
              <p className="font-extrabold text-slate-200 text-xs">
                {config.correo || 'lider.ghumana@innovatechit.com.co'}
              </p>
            </div>

            <button
              onClick={() => {
                setActiveTab('configuracion');
                setActiveConfigSubTab('config');
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                activeTab === 'configuracion' && activeConfigSubTab === 'config'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
              title="Ajustes de Plataforma"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-slate-50">
        
        {/* 2. MENU LATERAL / SIDEBAR (11 STRICT MENUS) */}
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onLogout={() => setIsAuthenticated(false)}
          uploadedFile={uploadedFile}
          totalEmployees={analysisData ? analysisData.totalEmployees : 482}
        />

        {/* Contenido Principal */}
        <main className="flex-1 flex flex-col overflow-hidden">
          
          {/* Cabezote del Sistema (no-print) */}
          <header className="bg-white px-6 py-4 md:px-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 no-print">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <HeaderIcon className="w-4.5 h-4.5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-sm font-black tracking-tight text-slate-900 font-display">
                  {headerDetails.title}
                </h1>
                <p className="text-xs text-slate-500 font-medium">{headerDetails.desc}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              {uploadedFile && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Base Activa: {uploadedFile.name}</span>
                </span>
              )}
              
              <button
                onClick={handleRestoreData}
                disabled={!uploadedFile}
                className="text-xs font-bold text-slate-600 hover:text-red-500 px-3 py-2 border border-slate-200/60 hover:border-red-100 bg-white hover:bg-red-50 disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-slate-200 disabled:hover:text-slate-600 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                title="Limpiar base de datos activa"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Remover Archivo</span>
              </button>
            </div>
          </header>

          {/* Zona Dinámica de Pantallas */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            
            {activeTab === 'config_empresa' ? (
              <ConfiguracionEmpresa />
            ) : activeTab === 'administracion' ? (
              <PanelAdministracion />
            ) : activeTab === 'centro_ejecutivo' ? (
              <CentroEjecutivoModule 
                activeCompanyId={activeCompanyId} 
                onNavigateSection={handleTabChange}
              />
            ) : activeTab === 'onboarding' ? (
              <OnboardingModule />
            ) : activeTab === 'constructor_encuestas' ? (
              <ConstructorEncuestasModule />
            ) : activeTab === 'inicio' ? (
              homeView === 'ejecutivo' ? (
                <DashboardEjecutivo
                  data={analysisData}
                  onNavigate={handleTabChange}
                  onSwitchToOperational={() => setHomeView('operativo')}
                  uploadedFile={uploadedFile}
                  totalEmployeesInFile={analysisData ? analysisData.totalEmployees : 0}
                />
              ) : (
                <HomeDashboard 
                  data={analysisData}
                  onNavigate={handleTabChange}
                  uploadedFile={uploadedFile}
                  onSwitchToExecutive={() => setHomeView('ejecutivo')}
                />
              )
            ) : activeTab === 'encuesta_sociodemografica' ? (
              <EncuestaSociodemograficaModule />
            ) : activeTab === 'centro_analitico' ? (
              <CentroAnalitico 
                onNavigate={handleTabChange}
                uploadedFile={uploadedFile}
              />
            ) : (!analysisData && ['analisis', 'indicadores', 'asistente_ia', 'recomendaciones', 'plan', 'informe', 'config', 'plan_anual', 'inteligencia_predictiva'].includes(activeTab)) ? (
              <div className="max-w-4xl mx-auto space-y-8 animate-fade-in py-6">
                
                {/* Brand Hero Callout */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 md:p-10 rounded-3xl border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[40%] h-[100%] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-cyan-500/15 text-cyan-300 border border-cyan-400/20">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                    <span>Módulo Analista Inteligente de SG-SST</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black font-display tracking-tight leading-tight">
                    Bienvenido a Happy Insight IA
                  </h2>
                  <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-3xl">
                    Este sistema está diseñado para actuar como un analista inteligente de Seguridad y Salud en el Trabajo. 
                    Para iniciar con el cálculo dinámico de indicadores, análisis cruzados y generación de planes de intervención, 
                    por favor carga el archivo de la encuesta sociodemográfica. No se utilizan datos simulados o de ejemplo.
                  </p>
                </div>

                {/* Central Upload Card */}
                <div className="bg-white p-8 rounded-3xl border border-slate-200/60 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base font-display">
                          Cargar Encuesta Sociodemográfica (.xlsx)
                        </h3>
                        <p className="text-xs text-slate-500 font-semibold">Arrastra o selecciona el consolidado sociodemográfico de tu nómina.</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={downloadExcelTemplate}
                      className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50/70 hover:bg-indigo-50 border border-indigo-100/80 hover:border-indigo-200 px-4 py-2.5 rounded-xl transition-all cursor-pointer self-start sm:self-center shrink-0 shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
                      <span>Descargar Plantilla (.xlsx)</span>
                    </button>
                  </div>

                  {isParsing ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-6 max-w-md mx-auto text-center">
                      <div className="relative w-20 h-20 flex items-center justify-center">
                        <div className="absolute inset-0 border-4 border-slate-100 rounded-full" />
                        <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
                        <FileSpreadsheet className="w-8 h-8 text-indigo-600 animate-bounce" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-extrabold text-slate-900 text-sm font-display">Procesando y Calculando Indicadores...</h4>
                        <p className="text-xs text-slate-500 font-medium">Leyendo celdas de Excel, normalizando variables sociodemográficas y estructurando análisis de SST.</p>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${parseProgress}%` }} />
                      </div>
                      <span className="text-xs font-mono font-bold text-indigo-600">{parseProgress}%</span>
                    </div>
                  ) : (
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${
                        dragActive
                          ? 'border-indigo-500 bg-indigo-50/40 shadow-inner'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <UploadCloud className={`w-12 h-12 mb-4 transition-transform ${dragActive ? 'scale-110 text-indigo-500' : 'text-slate-400'}`} />
                      <p className="text-sm font-extrabold text-slate-800 mb-1">
                        Arrastra tu archivo aquí, o <label htmlFor="central-file-input" className="text-indigo-600 hover:text-indigo-700 underline cursor-pointer font-black">explora en tu equipo</label>
                      </p>
                      <p className="text-xs text-slate-500 font-medium mb-4">Soporta formatos de Excel (.xlsx, .xls) con pestañas sociodemográficas standard.</p>
                      <input
                        type="file"
                        id="central-file-input"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  )}

                  {parseError && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 text-red-800 text-xs font-medium">
                      <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="space-y-1.5 flex-1 text-left">
                        <p className="font-extrabold text-red-900">{parseError}</p>
                        {missingColumns.length > 0 && (
                          <div>
                            <p className="font-bold text-red-800 mb-1">Las siguientes columnas obligatorias no fueron detectadas:</p>
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {missingColumns.map((col, idx) => (
                                <span key={idx} className="bg-red-100 text-red-700 font-mono font-bold px-2 py-0.5 rounded-md text-[10px] border border-red-200">
                                  {col}
                                </span>
                              ))}
                            </div>
                            <p className="text-slate-500 text-[10px] mt-2 leading-relaxed">
                              Tip: Asegúrate de que los encabezados de tu Excel coincidan o sean sinónimos de estas columnas (por ejemplo, tener 'Edad', 'Género' o 'Sexo', 'Estrato', 'Ciudad', 'Uso del tiempo libre', etc.). Puedes descargar nuestra plantilla optimizada para asegurar la compatibilidad.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Checklist of what to include */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100/80 space-y-3.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-slate-400" />
                      <span>Estructura de Datos de la Encuesta Sociodemográfica (SST)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold text-left">
                      Para realizar cálculos automatizados exactos de todos los indicadores requeridos por el SG-SST, el motor analiza dinámicamente las siguientes variables:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-left">
                      <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-2xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        <span>Edad y Sexo</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-2xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        <span>Estado civil / Hijos</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-2xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        <span>Escolaridad / Estrato</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-2xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        <span>Ciudad / Tipo de Vivienda</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-2xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        <span>Antigüedad Empresa & Cargo</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-2xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        <span>Actividad Física / Ocio</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-2xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        <span>Peso / Estatura / Perímetro</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-2xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        <span>Enfermedades / Alergias</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-2xs font-semibold">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                        <span>Molestias osteomusculares</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* 1. Dashboard (inicio) */}
                {activeTab === 'inicio' && (
                  isDemoInconsistent ? (
                    renderInconsistencyBlocker()
                  ) : (
                    <div className="space-y-6">
                      {/* Tarjeta de Calidad de Datos antes del Dashboard */}
                      <DataQualitySummaryCard 
                        data={analysisData}
                        onNavigateToQualityTab={() => handleTabChange('calidad_datos')}
                      />

                      {/* Switch View Controls */}
                      <div className="bg-white p-3 rounded-2xl border border-slate-200/60 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <LayoutDashboard className="w-4.5 h-4.5 text-indigo-600" />
                          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-800">Modalidad de Inicio</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setHomeView('ejecutivo')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                              homeView === 'ejecutivo'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            Dashboard Ejecutivo
                          </button>
                          <button
                            onClick={() => setHomeView('operativo')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                              homeView === 'operativo'
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            Consola Operativa
                          </button>
                        </div>
                      </div>

                      {homeView === 'ejecutivo' ? (
                        <DashboardEjecutivo 
                          data={analysisData}
                          onNavigate={setActiveTab} 
                          onSwitchToOperational={() => setHomeView('operativo')}
                          uploadedFile={uploadedFile}
                          totalEmployeesInFile={analysisData ? analysisData.totalEmployees : 0}
                        />
                      ) : (
                        <HomeDashboard 
                          data={analysisData}
                          onNavigate={setActiveTab}
                          uploadedFile={uploadedFile}
                          onSwitchToExecutive={() => setHomeView('ejecutivo')}
                        />
                      )}
                    </div>
                  )
                )}

                {/* 2. Caracterización Sociodemográfica */}
                {activeTab === 'analisis' && (
                  isDemoInconsistent ? (
                    renderInconsistencyBlocker()
                  ) : (
                    !isCiiuConfigured ? (
                      renderCiiuGuard('Caracterización Sociodemográfica')
                    ) : (
                      <AnalisisTab 
                        data={analysisData}
                        uploadedFile={uploadedFile}
                        onSimulateUpload={() => {}}
                        onRealUpload={handleRealUpload}
                        onRestoreData={handleRestoreData}
                      />
                    )
                  )
                )}

                {/* Módulo de Calidad de Datos */}
                {activeTab === 'calidad_datos' && (
                  <DataQualityTab 
                    data={analysisData}
                    onCorrectData={(corrected) => {
                      setAnalysisData(corrected);
                      // Regenerate AI components on the fly
                      const dynamicConclusions = generateAiConclusions(corrected);
                      setAiConclusions(dynamicConclusions);
                      const rawRecs = generateRecommendations(corrected);
                      const dynamicRecs = rawRecs.map((r, i) => ({
                        id: `rec-${Date.now()}-${i}`,
                        category: r.category,
                        title: r.title,
                        desc: r.desc,
                        priority: r.priority,
                        status: 'Planificada' as const,
                        responsible: 'Coordinador SG-SST'
                      }));
                      setRecommendations(dynamicRecs);
                    }}
                  />
                )}

                {/* Módulo Validador de Datos Excel */}
                {activeTab === 'validador_excel' && (
                  <ValidadorExcelModule 
                    onImportConfirmed={(validOnly, summary) => {
                      alert(`Importación confirmada (${validOnly ? 'Solo registros válidos' : 'Todos los registros'}). Registros procesados: ${validOnly ? summary.validRecordsCount : summary.totalRows}`);
                      setActiveTab('analisis');
                    }}
                  />
                )}

                {/* 3. Clima Organizacional (With top sub-navigation) */}
                {activeTab === 'clima_dashboard' && (
                  !isCiiuConfigured ? (
                    renderCiiuGuard('Clima Organizacional')
                  ) : (
                    <div className="space-y-6 text-left">
                    <div className="bg-white p-2 rounded-2xl border border-slate-200/60 shadow-2xs flex flex-wrap gap-1.5 overflow-x-auto">
                      {[
                        { id: 'clima_dashboard', label: 'Dashboard Clima' },
                        { id: 'clima_cargar', label: 'Cargar Base Clima' },
                        { id: 'clima_indicators', label: 'Indicadores Detallados' },
                        { id: 'clima_recomendaciones', label: 'Happy Clima IA' },
                        { id: 'clima_plan', label: 'Plan de Acción Clima' },
                        { id: 'clima_informe', label: 'Informe Ejecutivo Clima' }
                      ].map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveClimaSubTab(sub.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                            activeClimaSubTab === sub.id
                              ? 'bg-indigo-600 text-white font-black'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>

                    {/* Sub-tab views routing */}
                    {activeClimaSubTab === 'clima_cargar' && (
                      <ClimaExcelUpload 
                        onUploadSuccess={(data, filename) => {
                          setClimateData(data);
                          setClimateFileName(filename);
                          setActiveClimaSubTab('clima_dashboard');
                        }}
                        savedFileName={climateFileName}
                        onClearData={() => {
                          setClimateData(null);
                          setClimateFileName(null);
                        }}
                      />
                    )}

                    {activeClimaSubTab === 'clima_dashboard' && (
                      !climateData ? (
                        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-2xs text-center space-y-4 max-w-md mx-auto my-12">
                          <FileSpreadsheet className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm">Carga el Excel de Clima Primero</h3>
                            <p className="text-xs text-slate-500 mt-1">Para explorar el Dashboard de Clima, primero debes subir la base de datos de tu encuesta.</p>
                          </div>
                          <button 
                            onClick={() => setActiveClimaSubTab('clima_cargar')}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-3xs cursor-pointer"
                          >
                            Ir a Cargar Excel
                          </button>
                        </div>
                      ) : (
                        <ClimaDashboard data={climateData} onNavigate={setActiveClimaSubTab} />
                      )
                    )}

                    {activeClimaSubTab === 'clima_indicators' && (
                      !climateData ? (
                        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-2xs text-center space-y-4 max-w-md mx-auto my-12">
                          <FileSpreadsheet className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm">Carga el Excel de Clima Primero</h3>
                            <p className="text-xs text-slate-500 mt-1">Para desglosar e interactuar con los Indicadores de Clima, primero debes subir los datos.</p>
                          </div>
                          <button 
                            onClick={() => setActiveClimaSubTab('clima_cargar')}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-3xs cursor-pointer"
                          >
                            Ir a Cargar Excel
                          </button>
                        </div>
                      ) : (
                        <ClimaIndicators data={climateData} />
                      )
                    )}

                    {activeClimaSubTab === 'clima_recomendaciones' && (
                      !climateData ? (
                        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-2xs text-center space-y-4 max-w-md mx-auto my-12">
                          <FileSpreadsheet className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm">Carga el Excel de Clima Primero</h3>
                            <p className="text-xs text-slate-500 mt-1">Para generar planes tácticos e interactuar con Happy Clima IA, debes subir la base de datos.</p>
                          </div>
                          <button 
                            onClick={() => setActiveClimaSubTab('clima_cargar')}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-3xs cursor-pointer"
                          >
                            Ir a Cargar Excel
                          </button>
                        </div>
                      ) : (
                        <ClimaRecomendaciones 
                          climateData={climateData} 
                          onAddToPlanAction={(rec) => {
                            setSyncClimateRecs(prev => [...prev, rec]);
                            alert(`¡Recomendación "${rec.title}" agregada al Plan de Acción Clima!`);
                          }}
                        />
                      )
                    )}

                    {activeClimaSubTab === 'clima_plan' && (
                      <ClimaPlanAccion 
                        synchronizedRecommendations={syncClimateRecs}
                        onRemoveSyncRec={(id) => {
                          setSyncClimateRecs(prev => prev.filter(r => r.id !== id));
                        }}
                      />
                    )}

                    {activeClimaSubTab === 'clima_informe' && (
                      !climateData ? (
                        <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-2xs text-center space-y-4 max-w-md mx-auto my-12">
                          <FileSpreadsheet className="w-12 h-12 text-indigo-400 mx-auto animate-pulse" />
                          <div>
                            <h3 className="font-extrabold text-slate-800 text-sm">Carga el Excel de Clima Primero</h3>
                            <p className="text-xs text-slate-500 mt-1">Para imprimir o guardar tu Informe de Clima en PDF, debes subir los datos.</p>
                          </div>
                          <button 
                            onClick={() => setActiveClimaSubTab('clima_cargar')}
                            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-3xs cursor-pointer"
                          >
                            Ir a Cargar Excel
                          </button>
                        </div>
                      ) : (
                        <ClimaExecutiveReport data={climateData} />
                      )
                    )}
                  </div>
                )
              )}

                {/* Centro Ejecutivo 360 & Experiencia SaaS */}
                {activeTab === 'centro_ejecutivo' && (
                  <CentroEjecutivoModule 
                    activeCompanyId={activeCompanyId}
                    onNavigateSection={setActiveTab}
                  />
                )}

                {/* Onboarding & Activación Empresarial */}
                {activeTab === 'onboarding' && (
                  <OnboardingModule 
                    onNavigateSection={setActiveTab} 
                    activeCompanyId={activeCompanyId}
                  />
                )}

                {/* Encuesta Sociodemográfica */}
                {activeTab === 'encuesta_sociodemografica' && (
                  <EncuestaSociodemograficaModule />
                )}

                {/* Constructor de Encuestas */}
                {activeTab === 'constructor_encuestas' && (
                  <ConstructorEncuestasModule />
                )}

                {/* Centro de Inteligencia Organizacional */}
                {activeTab === 'centro_inteligencia' && (
                  <CentroInteligenciaModule 
                    analysisData={analysisData}
                    climateData={climateData}
                  />
                )}

                {/* 4. Riesgo Psicosocial */}
                {activeTab === 'mapa_riesgos' && (
                  <PsicosocialModule />
                )}

                {/* 5. Ausentismo */}
                {activeTab === 'ausentismo' && (
                  <AusentismoTab />
                )}

                {/* 6. Indicadores (3 sub-tabs) */}
                {activeTab === 'indicadores' && (
                  isDemoInconsistent ? (
                    renderInconsistencyBlocker()
                  ) : (
                    <div className="space-y-6 text-left">
                      <div className="bg-white p-2 rounded-2xl border border-slate-200/60 shadow-2xs flex gap-1.5 overflow-x-auto">
                        {[
                          { id: 'centro_indicadores', label: 'Centro de Indicadores' },
                          { id: 'indicadores_detallados', label: 'Indicadores Detallados' },
                          { id: 'builder_dashboards', label: 'Constructor de Dashboards' }
                        ].map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => setActiveIndicadoresSubTab(sub.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                              activeIndicadoresSubTab === sub.id
                                ? 'bg-indigo-600 text-white font-black'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>

                      {activeIndicadoresSubTab === 'centro_indicadores' && (
                        <IndicatorCenter />
                      )}

                      {activeIndicadoresSubTab === 'indicadores_detallados' && (
                        <IndicadoresTab data={analysisData} />
                      )}

                      {activeIndicadoresSubTab === 'builder_dashboards' && (
                        <DashboardBuilderInteractive />
                      )}
                    </div>
                  )
                )}

                {/* 7. IA (4 sub-tabs) */}
                {activeTab === 'ia' && (
                  isDemoInconsistent ? (
                    renderInconsistencyBlocker()
                  ) : (
                    <div className="space-y-6 text-left">
                      <div className="bg-white p-2 rounded-2xl border border-slate-200/60 shadow-2xs flex gap-1.5 overflow-x-auto">
                        {[
                          { id: 'people_copilot_ia', label: 'People Copilot IA' },
                          { id: 'ai_engine_showcase', label: 'Motor Universal (AIEngine)' },
                          { id: 'asistente_ia', label: 'Analista de Hallazgos' },
                          { id: 'inteligencia_predictiva', label: 'Inteligencia Predictiva' },
                          { id: 'motor_universal', label: 'Analizador Multiuso' }
                        ].map(sub => (
                          <button
                            key={sub.id}
                            onClick={() => setActiveIaSubTab(sub.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                              activeIaSubTab === sub.id
                                ? 'bg-indigo-600 text-white font-black'
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>

                      {activeIaSubTab === 'people_copilot_ia' && (
                        <PeopleCopilot data={analysisData} companyName={companyName} />
                      )}

                      {activeIaSubTab === 'ai_engine_showcase' && (
                        <AIEngineShowcase />
                      )}

                      {activeIaSubTab === 'asistente_ia' && (
                        <HappyIATab data={analysisData} />
                      )}

                      {activeIaSubTab === 'inteligencia_predictiva' && (
                        <PredictiveIntelligenceSection data={analysisData!} />
                      )}

                      {activeIaSubTab === 'motor_universal' && (
                        <UniversalSurveyAnalyzer />
                      )}
                    </div>
                  )
                )}

                {/* Módulo de Gobernanza de Inteligencia Artificial */}
                {activeTab === 'gobernanza_ia' && (
                  <IAGovernanceModule />
                )}

                {/* Módulo de Estrategia de Inteligencia Artificial */}
                {activeTab === 'estrategia_ia' && (
                  <IAStrategyModule />
                )}

                {/* Módulo de Viabilidad del Negocio & Monetización */}
                {activeTab === 'viabilidad_negocio' && (
                  <ViabilidadNegocioModule />
                )}

                {/* Módulo de IA vs Power BI (Comparativa y Sinergia) */}
                {activeTab === 'ia_vs_powerbi' && (
                  <IaVsPowerBiModule />
                )}

                {/* Módulo de Centro de Administración SaaS */}
                {activeTab === 'administracion_saas' && (
                  <CentroAdministracionModule />
                )}

                {/* 8. Planes de Acción, Mejora y Seguimiento de Eficacia (Fase 10) */}
                {activeTab === 'planes_accion' && (
                  isDemoInconsistent ? (
                    renderInconsistencyBlocker()
                  ) : (
                    <PlanesAccionModule 
                      onNavigateSection={setActiveTab}
                      activeCompanyId={activeCompanyId}
                      analysisData={analysisData}
                      recommendations={recommendations}
                      onToggleStatus={handleToggleStatus}
                      onAddRecommendation={handleAddRecommendation}
                    />
                  )
                )}

                {/* 9. Informes (4 sub-tabs) */}
                {activeTab === 'informes' && (
                  <div className="space-y-6 text-left">
                    <div className="bg-white p-2 rounded-2xl border border-slate-200/60 shadow-2xs flex gap-1.5 overflow-x-auto">
                      {[
                        { id: 'informe', label: 'Informe Ejecutivo' },
                        { id: 'biblioteca', label: 'Biblioteca Inteligente' },
                        { id: 'plantillas', label: 'Plantillas Corporativas' },
                        { id: 'centro_cumplimiento', label: 'Centro de Cumplimiento' }
                      ].map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveInformesSubTab(sub.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                            activeInformesSubTab === sub.id
                              ? 'bg-indigo-600 text-white font-black'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>

                    {activeInformesSubTab === 'informe' && (
                      isDemoInconsistent ? (
                        renderInconsistencyBlocker()
                      ) : (
                        <InformeEjecutivoTab 
                          data={analysisData}
                          conclusions={aiConclusions}
                          recommendations={recommendations}
                        />
                      )
                    )}

                    {activeInformesSubTab === 'biblioteca' && (
                      <BibliotecaInteligente />
                    )}

                    {activeInformesSubTab === 'plantillas' && (
                      <PlantillasInteligentes />
                    )}

                    {activeInformesSubTab === 'centro_cumplimiento' && (
                      <ComplianceCenter />
                    )}
                  </div>
                )}

                {/* Módulo de Administración de Empresas */}
                {activeTab === 'admin_empresas' && (
                  <AdministracionEmpresasModule />
                )}

                {/* Módulo Maestro de Colaboradores */}
                {activeTab === 'colaboradores' && (
                  <ColaboradoresModule currentCompanyId={activeCompanyId} />
                )}

                {/* Módulo de Administración de Usuarios & Permisos */}
                {(activeTab === 'admin_usuarios' || activeTab === 'usuarios') && (
                  <AdministracionUsuariosModule currentCompanyId={activeCompanyId} />
                )}

                {/* Módulo de Arquitectura de Datos Maestro */}
                {activeTab === 'arquitectura_datos' && (
                  <ArquitecturaDatosModule currentCompanyId={activeCompanyId} />
                )}

                {/* Módulo de Catálogos Organizacionales */}
                {(activeTab === 'catalogos_organizacionales' || activeTab === 'catalogos_org') && (
                  <CatalogosOrganizacionalesModule />
                )}

                {/* 10. Configuración (5 sub-tabs) */}
                {activeTab === 'configuracion' && (
                  <div className="space-y-6 text-left">
                    <div className="bg-white p-2 rounded-2xl border border-slate-200/60 shadow-2xs flex gap-1.5 overflow-x-auto">
                      {[
                        { id: 'config_empresa', label: 'Configuración Empresa' },
                        { id: 'catalogos_org', label: 'Catálogos Organizacionales' },
                        { id: 'admin_empresas', label: 'Administración Multiempresa' },
                        { id: 'config_sistema', label: 'Ajustes del Sistema' },
                        { id: 'administracion', label: 'Administración SaaS' }
                      ].map(sub => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveConfigSubTab(sub.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                            activeConfigSubTab === sub.id
                              ? 'bg-indigo-600 text-white font-black'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>

                    {activeConfigSubTab === 'config_empresa' && (
                      <ConfiguracionEmpresa />
                    )}

                    {activeConfigSubTab === 'catalogos_org' && (
                      <CatalogosOrganizacionalesModule />
                    )}

                    {activeConfigSubTab === 'admin_empresas' && (
                      <AdministracionEmpresasModule />
                    )}

                    {activeConfigSubTab === 'config_sistema' && (
                      <ConfiguracionTab 
                        data={analysisData}
                        onUpdateData={handleUpdateData}
                        onRestoreData={handleRestoreData}
                      />
                    )}

                    {activeConfigSubTab === 'administracion' && (
                      <PanelAdministracion />
                    )}
                  </div>
                )}

                {/* 11. Ayuda */}
                {activeTab === 'ayuda' && (
                  <AyudaTab 
                    uploadedFile={uploadedFile}
                    onRestoreData={handleRestoreData}
                  />
                )}
              </>
            )}

          </div>

        </main>

      </div>

      {isAuthenticated && !isCompanyConfigured && (
        <SetupWizard />
      )}
    </div>
  );
}
