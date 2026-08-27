import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Brain, 
  LayoutDashboard, 
  ShieldAlert, 
  Users, 
  FileText, 
  CheckCircle2, 
  Printer, 
  Download, 
  RefreshCw, 
  Sliders, 
  Search, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Calendar, 
  Award, 
  ArrowUpRight, 
  MapPin, 
  Layers, 
  Flame,
  Check,
  ChevronDown,
  Compass,
  Target,
  Plus,
  Trash2,
  X,
  Filter,
  Edit3,
  DollarSign
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
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
  LineChart,
  Line
} from 'recharts';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { useEmpresa } from '../configuracion/useEmpresa';
import { DemographicsData } from '../../types';
import { ClimateData } from '../clima/clima.types';
import { PsicosocialData } from '../psicosocial/psicosocial.types';
import { INITIAL_DEMOGRAPHICS } from '../../data/mockData';
import { 
  ComposedChart, 
  Scatter, 
  ZAxis 
} from 'recharts';
import {
  CORRELATABLE_VARIABLES,
  generateDeterministicDataset,
  calculatePearsonCorrelation,
  CorrelationResult,
  EmployeeDataPoint
} from './utils/correlationEngine';
import {
  calculateExecutiveRadar,
  RadarTheme
} from './utils/radarEngine';
import {
  calculateMasterPlan,
  MasterPlanActivity,
  MASTER_PLAN_GROUPS
} from './utils/masterPlanEngine';

// Realistic Fallback Datasets for the CIO
const FALLBACK_CLIMATE_DATA: ClimateData = {
  totalParticipants: 1240,
  globalAverage: 3.7,
  globalFavorability: 74,
  dimensions: [
    { dimensionId: 'liderazgo', name: 'Liderazgo', description: 'Estilo de mando, retroalimentación', average: 3.1, favorability: 62, questionScores: [] },
    { dimensionId: 'comunicacion', name: 'Comunicación', description: 'Flujo de información y canales', average: 3.3, favorability: 66, questionScores: [] },
    { dimensionId: 'trabajo_equipo', name: 'Trabajo en Equipo', description: 'Cohesión y apoyo interpersonal', average: 3.9, favorability: 78, questionScores: [] },
    { dimensionId: 'reconocimiento', name: 'Reconocimiento', description: 'Valoración formal y salario emocional', average: 3.4, favorability: 68, questionScores: [] },
    { dimensionId: 'desarrollo', name: 'Desarrollo Profesional', description: 'Oportunidades de carrera', average: 4.0, favorability: 80, questionScores: [] },
    { dimensionId: 'ambiente', name: 'Ambiente Físico y Clima', description: 'Ergonomía, recursos', average: 4.2, favorability: 84, questionScores: [] }
  ],
  byCity: [],
  byDepartment: [],
  byGender: [],
  bySeniority: []
};

const FALLBACK_PSICOSOCIAL_DATA: PsicosocialData = {
  totalParticipants: 120,
  globalScore: 52,
  globalRiskLevel: 'Medio',
  batteryType: 'Resultados Consolidados',
  dimensions: [
    { dimensionId: 'liderazgo', name: 'Liderazgo y Relaciones', category: 'Intralaboral', score: 58, riskLevel: 'Medio', description: '' },
    { dimensionId: 'control_trabajo', name: 'Control sobre el Trabajo', category: 'Intralaboral', score: 48, riskLevel: 'Medio', description: '' },
    { dimensionId: 'demandas_trabajo', name: 'Demandas del Trabajo', category: 'Intralaboral', score: 72, riskLevel: 'Alto', description: '' },
    { dimensionId: 'recompensas', name: 'Recompensas', category: 'Intralaboral', score: 38, riskLevel: 'Bajo', description: '' },
    { dimensionId: 'apoyo_social', name: 'Apoyo Social', category: 'Intralaboral', score: 42, riskLevel: 'Medio', description: '' },
    { dimensionId: 'jornada', name: 'Jornada de Trabajo', category: 'Intralaboral', score: 68, riskLevel: 'Alto', description: '' },
    { dimensionId: 'carga_mental', name: 'Carga Mental y Atención', category: 'Intralaboral', score: 75, riskLevel: 'Alto', description: '' },
    { dimensionId: 'responsabilidades_familiares', name: 'Responsabilidades Familiares', category: 'Extralaboral', score: 46, riskLevel: 'Medio', description: '' },
    { dimensionId: 'tiempo_fuera_trabajo', name: 'Tiempo Fuera del Trabajo', category: 'Extralaboral', score: 52, riskLevel: 'Medio', description: '' }
  ],
  employees: [],
  rankings: { areas: [], sedes: [], proyectos: [], cargos: [] },
  distribution: { muyBajo: 12, bajo: 24, medio: 48, alto: 26, muyAlto: 10 },
  matrix: []
};

// Types for local state
interface AlertItem {
  id: string;
  sourceModule: string;
  title: string;
  description: string;
  severity: 'Critica' | 'Alta' | 'Media' | 'Baja';
  date: string;
  suggestedAction: string;
  status: 'Abierta' | 'En Mitigación' | 'Resuelta';
  showDetail?: boolean;
}

interface ExecutiveAnalysis {
  situation: string;
  findings: string[];
  strengths: string[];
  risks: string[];
  opportunities: string[];
  conclusions: string[];
  priorities: string[];
}

interface CentroInteligenciaModuleProps {
  analysisData?: DemographicsData | null;
  climateData?: ClimateData | null;
}

export const CentroInteligenciaModule: React.FC<CentroInteligenciaModuleProps> = ({ 
  analysisData, 
  climateData: propClimateData 
}) => {
  const { activeCompanyId, config } = useEmpresa();
  const companyName = config?.nombreEmpresa || 'Mi Empresa';

  // State Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ia_summary' | 'alerts' | 'risks' | 'heatmap' | 'correlations' | 'executive_radar' | 'master_plan'>('dashboard');

  // Master Plan State
  const [masterPlanActivities, setMasterPlanActivities] = useState<MasterPlanActivity[]>([]);
  const [masterPlanSearch, setMasterPlanSearch] = useState<string>('');
  const [masterPlanPriorityFilter, setMasterPlanPriorityFilter] = useState<string>('todas');
  const [masterPlanStatusFilter, setMasterPlanStatusFilter] = useState<string>('todas');
  const [masterPlanOriginFilter, setMasterPlanOriginFilter] = useState<string>('todas');
  const [masterPlanGroupFilter, setMasterPlanGroupFilter] = useState<string>('todas');

  const [selectedActivity, setSelectedActivity] = useState<MasterPlanActivity | null>(null);
  const [isEditingActivity, setIsEditingActivity] = useState<boolean>(false);
  const [isAddingActivity, setIsAddingActivity] = useState<boolean>(false);

  // Form states for new/edited activities
  const [formObjetivo, setFormObjetivo] = useState<string>('');
  const [formDescripcion, setFormDescripcion] = useState<string>('');
  const [formResponsable, setFormResponsable] = useState<string>('');
  const [formFecha, setFormFecha] = useState<string>('');
  const [formCosto, setFormCosto] = useState<number>(0);
  const [formIndicador, setFormIndicador] = useState<string>('');
  const [formEstado, setFormEstado] = useState<'No Iniciada' | 'En Progreso' | 'Completada' | 'Cancelada'>('No Iniciada');
  const [formNormatividad, setFormNormatividad] = useState<string>('');
  const [formModuloOrigen, setFormModuloOrigen] = useState<MasterPlanActivity['moduloOrigen']>('General');
  const [formPrioridad, setFormPrioridad] = useState<'Alta' | 'Media' | 'Baja'>('Media');
  const [formGrupo, setFormGrupo] = useState<string>('');

  // Executive Radar State
  const [selectedRadarThemeId, setSelectedRadarThemeId] = useState<string>('liderazgo');
  const [isInterpretingRadar, setIsInterpretingRadar] = useState<boolean>(false);
  const [radarCustomInterpretations, setRadarCustomInterpretations] = useState<Record<string, { interpretation: string; recommendation: string }>>({});

  // Multi-module consolidated datasets
  const demographics = useMemo(() => analysisData || INITIAL_DEMOGRAPHICS, [analysisData]);
  const climateData = useMemo(() => propClimateData || FALLBACK_CLIMATE_DATA, [propClimateData]);
  const [psicosocialData, setPsicosocialData] = useState<PsicosocialData>(FALLBACK_PSICOSOCIAL_DATA);

  // Consolidated AI summary state
  const [analysis, setAnalysis] = useState<ExecutiveAnalysis | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Heatmap View state filters
  const [selectedArea, setSelectedArea] = useState<string>('todos');
  const [selectedSede, setSelectedSede] = useState<string>('todos');
  const [selectedProyecto, setSelectedProyecto] = useState<string>('todos');
  const [selectedRole, setSelectedRole] = useState<string>('todos');
  const [selectedGender, setSelectedGender] = useState<string>('todos');
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>('todos');
  const [selectedTenure, setSelectedTenure] = useState<string>('todos');

  // Intelligent Correlation Engine State
  const [selectedVarX, setSelectedVarX] = useState<string>('estres');
  const [selectedVarY, setSelectedVarY] = useState<string>('ausentismo');
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);
  const [customInterpretations, setCustomInterpretations] = useState<Record<string, { interpretation: string; recommendation: string }>>({});

  // Alerts filters
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('todas');
  const [alertStatusFilter, setAlertStatusFilter] = useState<string>('todas');

  // Load and consolidate data from all modules on mount/company change
  useEffect(() => {
    if (!activeCompanyId) return;

    try {
      // 3. Riesgo Psicosocial
      const storedPsico = localStorage.getItem(`happy_psicosocial_data_${activeCompanyId}`);
      if (storedPsico) {
        setPsicosocialData(JSON.parse(storedPsico));
      } else {
        setPsicosocialData(FALLBACK_PSICOSOCIAL_DATA);
      }

      setIsLoaded(true);
    } catch (e) {
      console.error("Error al cargar datos consolidados en CIO:", e);
    }
  }, [activeCompanyId]);

  // Load master plan from localStorage on mount or company change
  useEffect(() => {
    if (!activeCompanyId) return;

    const storedPlan = localStorage.getItem(`happysst_master_plan_${activeCompanyId}`);
    if (storedPlan) {
      try {
        setMasterPlanActivities(JSON.parse(storedPlan));
      } catch (e) {
        console.error("Error decodificando plan maestro:", e);
        const computed = calculateMasterPlan(demographics, climateData, psicosocialData, alerts);
        setMasterPlanActivities(computed);
        localStorage.setItem(`happysst_master_plan_${activeCompanyId}`, JSON.stringify(computed));
      }
    } else {
      // Calculate from scratch if no plan exists in localStorage
      const computed = calculateMasterPlan(demographics, climateData, psicosocialData, alerts);
      setMasterPlanActivities(computed);
      localStorage.setItem(`happysst_master_plan_${activeCompanyId}`, JSON.stringify(computed));
    }
  }, [activeCompanyId, demographics, climateData, psicosocialData, alerts]);

  // Save master plan to localStorage helper
  const savePlan = (updatedActivities: MasterPlanActivity[]) => {
    setMasterPlanActivities(updatedActivities);
    if (activeCompanyId) {
      localStorage.setItem(`happysst_master_plan_${activeCompanyId}`, JSON.stringify(updatedActivities));
    }
  };

  // Generación de set de datos deterministas individuales alineados con los reales cargados
  const employeeDataset = useMemo(() => {
    if (!activeCompanyId) return [];
    return generateDeterministicDataset(demographics, climateData, psicosocialData, activeCompanyId);
  }, [demographics, climateData, psicosocialData, activeCompanyId]);

  // Cálculo matemático continuo de correlación Pearson
  const correlationResult = useMemo(() => {
    if (employeeDataset.length === 0) return null;
    return calculatePearsonCorrelation(employeeDataset, selectedVarX, selectedVarY);
  }, [employeeDataset, selectedVarX, selectedVarY]);

  // Solicitar interpretación avanzada de IA a Gemini
  const handleRequestGeminiInterpretation = async () => {
    if (!correlationResult) return;
    setIsInterpreting(true);
    try {
      const response = await fetch('/api/correlations/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          varX: correlationResult.varX,
          varY: correlationResult.varY,
          r: correlationResult.r,
          r2: correlationResult.r2,
          pValue: correlationResult.pValue,
          n: correlationResult.n,
          confidence: correlationResult.confidence
        })
      });

      const data = await response.json();
      if (data.interpretation && data.recommendation) {
        setCustomInterpretations(prev => ({
          ...prev,
          [`${selectedVarX}_vs_${selectedVarY}`]: {
            interpretation: data.interpretation,
            recommendation: data.recommendation
          }
        }));
      }
    } catch (err) {
      console.error('Error al solicitar interpretación de IA:', err);
    } finally {
      setIsInterpreting(false);
    }
  };

  // Preparar puntos de datos con la línea de tendencia integrada de forma lineal recta
  const chartData = useMemo(() => {
    if (!correlationResult) return [];
    const { dataPoints, trendSlope, trendIntercept } = correlationResult;
    const sortedPoints = [...dataPoints].sort((a, b) => a.x - b.x);
    return sortedPoints.map(p => ({
      ...p,
      trendY: Number((trendSlope * p.x + trendIntercept).toFixed(2))
    }));
  }, [correlationResult]);

  // Calcular el Radar Ejecutivo dinámicamente según los datos de la empresa actual
  const executiveRadarData = useMemo(() => {
    return calculateExecutiveRadar(demographics, climateData, psicosocialData, activeCompanyId || 'default_company');
  }, [demographics, climateData, psicosocialData, activeCompanyId]);

  // Obtener la temática seleccionada actualmente en el radar
  const selectedRadarTheme = useMemo(() => {
    return executiveRadarData.find(t => t.id === selectedRadarThemeId) || executiveRadarData[0];
  }, [executiveRadarData, selectedRadarThemeId]);

  // Manejar solicitud de interpretación experta de radar con Gemini bocado a bocado
  const handleRequestRadarInterpretation = async () => {
    if (!selectedRadarTheme) return;
    setIsInterpretingRadar(true);
    try {
      const response = await fetch('/api/radar/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: selectedRadarTheme })
      });

      const data = await response.json();
      if (data.interpretation && data.recommendation) {
        setRadarCustomInterpretations(prev => ({
          ...prev,
          [selectedRadarTheme.id]: {
            interpretation: data.interpretation,
            recommendation: data.recommendation
          }
        }));
      }
    } catch (err) {
      console.error('Error al solicitar interpretación de radar con IA:', err);
    } finally {
      setIsInterpretingRadar(false);
    }
  };

  // Handle triggering dynamic full-stack AI analysis
  const handleGenerateAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/centro-inteligencia/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          demographics,
          climateData,
          psicosocialData
        })
      });

      const resData = await response.json();
      if (resData.analysis) {
        setAnalysis(resData.analysis.executiveSummary);
        
        // Map alerts from API and add standard status key
        const formattedAlerts = resData.analysis.alerts.map((a: any) => ({
          ...a,
          status: 'Abierta' as const,
          showDetail: false
        }));
        setAlerts(formattedAlerts);
      }
    } catch (e) {
      console.error("Error llamando al análisis del CIO:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Master Plan Memoized Filtered List
  const filteredActivities = useMemo(() => {
    return masterPlanActivities.filter(act => {
      const matchSearch = 
        act.objetivo.toLowerCase().includes(masterPlanSearch.toLowerCase()) ||
        act.descripcion.toLowerCase().includes(masterPlanSearch.toLowerCase()) ||
        act.responsable.toLowerCase().includes(masterPlanSearch.toLowerCase()) ||
        act.normatividad.toLowerCase().includes(masterPlanSearch.toLowerCase()) ||
        act.indicador.toLowerCase().includes(masterPlanSearch.toLowerCase());

      const matchPriority = masterPlanPriorityFilter === 'todas' || act.prioridad === masterPlanPriorityFilter;
      const matchStatus = masterPlanStatusFilter === 'todas' || act.estado === masterPlanStatusFilter;
      const matchOrigin = masterPlanOriginFilter === 'todas' || act.moduloOrigen === masterPlanOriginFilter;
      const matchGroup = masterPlanGroupFilter === 'todas' || act.grupo === masterPlanGroupFilter;

      return matchSearch && matchPriority && matchStatus && matchOrigin && matchGroup;
    });
  }, [masterPlanActivities, masterPlanSearch, masterPlanPriorityFilter, masterPlanStatusFilter, masterPlanOriginFilter, masterPlanGroupFilter]);

  // CRUD Actions for Master Plan
  const handleDeleteActivity = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta actividad del Plan Maestro?')) {
      const updated = masterPlanActivities.filter(a => a.id !== id);
      savePlan(updated);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: MasterPlanActivity['estado']) => {
    const updated = masterPlanActivities.map(a => {
      if (a.id === id) {
        return { ...a, estado: newStatus };
      }
      return a;
    });
    savePlan(updated);
  };

  const openAddModal = () => {
    setFormObjetivo('');
    setFormDescripcion('');
    setFormResponsable('Coordinador SST');
    setFormFecha(new Date().toISOString().split('T')[0]);
    setFormCosto(1500000);
    setFormIndicador('Porcentaje de cumplimiento de la actividad');
    setFormEstado('No Iniciada');
    setFormNormatividad('Decreto 1072 de 2015');
    setFormModuloOrigen('General');
    setFormPrioridad('Media');
    setFormGrupo(MASTER_PLAN_GROUPS.SALUD_MENTAL);
    setSelectedActivity(null);
    setIsAddingActivity(true);
  };

  const openEditModal = (activity: MasterPlanActivity) => {
    setSelectedActivity(activity);
    setFormObjetivo(activity.objetivo);
    setFormDescripcion(activity.descripcion);
    setFormResponsable(activity.responsable);
    setFormFecha(activity.fecha);
    setFormCosto(activity.costo);
    setFormIndicador(activity.indicador);
    setFormEstado(activity.estado);
    setFormNormatividad(activity.normatividad);
    setFormModuloOrigen(activity.moduloOrigen);
    setFormPrioridad(activity.prioridad);
    setFormGrupo(activity.grupo);
    setIsEditingActivity(true);
  };

  const handleSaveActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formObjetivo.trim() || !formDescripcion.trim()) {
      alert('Por favor complete los campos requeridos (Objetivo y Descripción)');
      return;
    }

    if (isAddingActivity) {
      const newActivity: MasterPlanActivity = {
        id: `custom_${Date.now()}`,
        objetivo: formObjetivo,
        descripcion: formDescripcion,
        responsable: formResponsable || 'Líder de SST',
        fecha: formFecha || new Date().toISOString().split('T')[0],
        costo: Number(formCosto) || 0,
        indicador: formIndicador || 'Cumplimiento de actividad',
        estado: formEstado,
        normatividad: formNormatividad || 'SG-SST General',
        moduloOrigen: formModuloOrigen,
        prioridad: formPrioridad,
        grupo: formGrupo || MASTER_PLAN_GROUPS.SALUD_MENTAL
      };
      savePlan([...masterPlanActivities, newActivity]);
      setIsAddingActivity(false);
    } else if (isEditingActivity && selectedActivity) {
      const updated = masterPlanActivities.map(a => {
        if (a.id === selectedActivity.id) {
          return {
            ...a,
            objetivo: formObjetivo,
            descripcion: formDescripcion,
            responsable: formResponsable,
            fecha: formFecha,
            costo: Number(formCosto),
            indicador: formIndicador,
            estado: formEstado,
            normatividad: formNormatividad,
            moduloOrigen: formModuloOrigen,
            prioridad: formPrioridad,
            grupo: formGrupo
          };
        }
        return a;
      });
      savePlan(updated);
      setIsEditingActivity(false);
      setSelectedActivity(null);
    }
  };

  const handleReconsolidate = () => {
    if (confirm('¿Deseas volver a consolidar las recomendaciones de todos los módulos? Esto regenerará la lista eliminando duplicados y re-agrupándolas. Las actividades creadas manualmente se conservarán.')) {
      const computed = calculateMasterPlan(demographics, climateData, psicosocialData, alerts);
      const customActs = masterPlanActivities.filter(a => a.id.startsWith('custom_'));
      const combined = [...computed, ...customActs];
      savePlan(combined);
    }
  };

  // Export to Excel
  const handleExportToExcel = () => {
    const dataToExport = filteredActivities.map(a => ({
      'Módulo de Origen': a.moduloOrigen,
      'Grupo/Temática': a.grupo,
      'Prioridad': a.prioridad,
      'Objetivo': a.objetivo,
      'Descripción': a.descripcion,
      'Responsable': a.responsable,
      'Fecha Límite': a.fecha,
      'Costo Estimado (COP)': a.costo,
      'Indicador de Éxito': a.indicador,
      'Estado Actual': a.estado,
      'Normatividad SST Relacionada': a.normatividad
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Plan Maestro SST');
    
    // Autowidth columns
    const maxLens = Object.keys(dataToExport[0] || {}).map(key => {
      return Math.max(
        key.length,
        ...dataToExport.map(row => String(row[key as keyof typeof row] || '').length)
      );
    });
    worksheet['!cols'] = maxLens.map(len => ({ wch: Math.min(Math.max(len + 3, 10), 55) }));

    XLSX.writeFile(workbook, `Plan_Maestro_SST_${companyName.replace(/\s+/g, '_')}.xlsx`);
  };

  // Export to PDF
  const handleExportToPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Styled Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('PLAN MAESTRO DE INTERVENCIÓN ORGANIZACIONAL (SST)', 15, 16);
    
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(226, 232, 240); // slate-200
    doc.text(`Empresa: ${companyName} | Fecha de Emisión: ${new Date().toLocaleDateString()}`, 15, 25);
    doc.text(`Consolidación inteligente y automatizada de Clima Laboral, Riesgo Psicosocial y Alertas CIO`, 15, 30);

    // Table Headers
    const startY = 48;
    const headers = ['Módulo', 'Prioridad', 'Actividad / Objetivo', 'Responsable', 'Fecha', 'Costo', 'Estado'];
    const colWidths = [35, 18, 104, 38, 22, 30, 25]; // total 272 (fits landscape A4)
    
    let currentY = startY;

    // Draw headers
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(12, currentY, 273, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    
    let currentX = 14;
    headers.forEach((h, idx) => {
      doc.text(h, currentX, currentY + 5.5);
      currentX += colWidths[idx];
    });

    currentY += 8;
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);

    filteredActivities.forEach((act, idx) => {
      // Page break if near bottom
      if (currentY > 182) {
        doc.addPage();
        // Draw header on new page
        doc.setFillColor(79, 70, 229);
        doc.rect(12, 15, 273, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('Helvetica', 'bold');
        currentX = 14;
        headers.forEach((h, idx) => {
          doc.text(h, currentX, 20.5);
          currentX += colWidths[idx];
        });
        currentY = 23;
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
      }

      // Draw alternating background row
      if (idx % 2 === 0) {
        doc.setFillColor(248, 250, 252); // slate-50
        doc.rect(12, currentY, 273, 13, 'F');
      } else {
        doc.setFillColor(255, 255, 255);
        doc.rect(12, currentY, 273, 13, 'F');
      }

      // Border line
      doc.setDrawColor(241, 245, 249);
      doc.line(12, currentY + 13, 285, currentY + 13);

      doc.setTextColor(51, 65, 85);
      
      // Origin Module
      doc.setFont('Helvetica', 'bold');
      doc.text(act.moduloOrigen, 14, currentY + 7);
      
      // Priority with color
      if (act.prioridad === 'Alta') doc.setTextColor(220, 38, 38);
      else if (act.prioridad === 'Media') doc.setTextColor(217, 119, 6);
      else doc.setTextColor(37, 99, 235);
      doc.text(act.prioridad, 14 + colWidths[0], currentY + 7);
      
      doc.setTextColor(51, 65, 85);
      doc.setFont('Helvetica', 'normal');

      // Wrap Objetivo text safely so it does not overflow
      const splitObj = doc.splitTextToSize(act.objetivo, colWidths[2] - 4);
      doc.text(splitObj, 14 + colWidths[0] + colWidths[1], currentY + 4.5);

      // Responsable
      doc.text(act.responsable, 14 + colWidths[0] + colWidths[1] + colWidths[2], currentY + 7);

      // Fecha
      doc.text(act.fecha, 14 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3], currentY + 7);

      // Costo
      const formattedCost = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(act.costo);
      doc.text(formattedCost, 14 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4], currentY + 7);

      // Estado
      doc.text(act.estado, 14 + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5], currentY + 7);

      currentY += 13;
    });

    // Footer page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(7.5);
      doc.text(`Página ${i} de ${pageCount}`, 262, 202);
      doc.text(`Consultor Corporativo Happy SST IA - Generado de acuerdo a la Resolución 0312 de 2019`, 12, 202);
    }

    doc.save(`Plan_Maestro_SST_${companyName.replace(/\s+/g, '_')}.pdf`);
  };

  // Generate initial analysis automatically once loaded
  useEffect(() => {
    if (isLoaded) {
      handleGenerateAnalysis();
    }
  }, [isLoaded, activeCompanyId]);

  // Calculations for consolidated state
  const aggregatedMetrics = useMemo(() => {
    const totalEmp = demographics?.totalEmployees || 1240;
    const wellbeing = demographics?.wellbeingIndex || 83.4;
    const absenteeism = demographics?.absenteeismRate || 2.3;
    const climateFav = climateData?.globalFavorability || 74;
    const riskScore = psicosocialData?.globalScore || 52;

    // Estado General: Higher wellbeing & climate is good; higher psychosocial risk is bad
    // Score out of 100
    const organizationalHealth = Math.round((wellbeing + climateFav + (100 - riskScore)) / 3);
    const engagementIndex = Math.round((climateFav * 0.6) + (wellbeing * 0.4));

    let generalStateLabel = 'Excelente/Saludable';
    let generalStateColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (organizationalHealth < 60) {
      generalStateLabel = 'Riesgo Crítico';
      generalStateColor = 'text-rose-600 bg-rose-50 border-rose-200';
    } else if (organizationalHealth < 75) {
      generalStateLabel = 'Alerta / Moderado';
      generalStateColor = 'text-amber-600 bg-amber-50 border-amber-200';
    }

    let maturityLevel = 'Nivel 3 - Gestionado';
    if (organizationalHealth >= 82) {
      maturityLevel = 'Nivel 4 - Avanzado / Optimizado';
    } else if (organizationalHealth < 65) {
      maturityLevel = 'Nivel 2 - Reactivo';
    }

    return {
      totalEmployees: totalEmp,
      organizationalHealth,
      wellbeing,
      riskScore,
      riskLevel: psicosocialData?.globalRiskLevel || 'Medio',
      climateFav,
      engagementIndex,
      absenteeism,
      generalStateLabel,
      generalStateColor,
      maturityLevel
    };
  }, [demographics, climateData, psicosocialData]);

  // Dimension mapping for radar/bar charts
  const consolidatedDimensionsData = useMemo(() => {
    // Merge climate favorability with psychosocial risk (converted to favorable scale: 100 - riskScore)
    const climateDims = climateData?.dimensions || [];
    const psicoDims = psicosocialData?.dimensions || [];

    const data: any[] = [];
    
    // Add climate dimensions
    climateDims.forEach(d => {
      data.push({
        subject: d.name,
        Clima: d.favorability,
        Riesgo: null,
        fullMark: 100
      });
    });

    // Add key psychosocial dimensions (converted to favorable scale for visual alignment)
    psicoDims.slice(0, 6).forEach(d => {
      data.push({
        subject: d.name,
        Clima: null,
        Riesgo: 100 - d.score, // higher is better (low risk)
        fullMark: 100
      });
    });

    return data;
  }, [climateData, psicosocialData]);

  // Interactive Heatmap dataset & filters
  const filteredHeatmapSegments = useMemo(() => {
    // Generate simulated company breakdown based on filters
    const areasList = ['Operaciones', 'Tecnología', 'Ventas', 'Recursos Humanos', 'Administración'];
    const sedesList = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla'];
    const projectsList = ['Proyecto Core', 'Soporte Clientes', 'Ventas Seguros', 'Campamento Bancario'];

    const segments: any[] = [];

    areasList.forEach(area => {
      sedesList.forEach(sede => {
        projectsList.forEach(proj => {
          // Apply filters
          if (selectedArea !== 'todos' && selectedArea !== area) return;
          if (selectedSede !== 'todos' && selectedSede !== sede) return;
          if (selectedProyecto !== 'todos' && selectedProyecto !== proj) return;

          // Compute a pseudorandom but stable health score for this specific intersection
          const stringSeed = `${area}-${sede}-${proj}-${activeCompanyId}`;
          let hash = 0;
          for (let i = 0; i < stringSeed.length; i++) {
            hash = stringSeed.charCodeAt(i) + ((hash << 5) - hash);
          }
          const baseScore = 60 + (Math.abs(hash) % 36); // Score between 60 and 95
          
          // Modify based on demographic selections if selected
          let finalScore = baseScore;
          if (selectedGender === 'Femenino') finalScore += 2;
          if (selectedGender === 'Masculino') finalScore -= 1;
          if (selectedAgeRange === '18-25') finalScore -= 4; // Young stress
          if (selectedAgeRange === '46-55') finalScore += 3;
          if (selectedTenure === 'menos_1_ano') finalScore -= 6; // Onboarding risk
          if (selectedTenure === 'mas_5_anos') finalScore += 4;

          finalScore = Math.max(40, Math.min(100, finalScore));

          let color = 'bg-emerald-500 hover:bg-emerald-600';
          let border = 'border-emerald-600';
          let textColor = 'text-emerald-100';
          let state = 'Saludable';

          if (finalScore < 60) {
            color = 'bg-rose-500 hover:bg-rose-600';
            border = 'border-rose-600';
            textColor = 'text-rose-100';
            state = 'Crítico';
          } else if (finalScore < 75) {
            color = 'bg-amber-500 hover:bg-amber-600';
            border = 'border-amber-600';
            textColor = 'text-amber-100';
            state = 'Alerta';
          }

          segments.push({
            area,
            sede,
            project: proj,
            score: Math.round(finalScore),
            color,
            border,
            textColor,
            state
          });
        });
      });
    });

    return segments.slice(0, 24); // Limit grid size for beautiful UI
  }, [selectedArea, selectedSede, selectedProyecto, selectedGender, selectedAgeRange, selectedTenure, activeCompanyId]);

  // Actions for alerts
  const handleToggleAlertDetail = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, showDetail: !a.showDetail } : a));
  };

  const handleUpdateAlertStatus = (id: string, newStatus: 'Abierta' | 'En Mitigación' | 'Resuelta') => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  // Filtered alerts
  const filteredAlertsList = useMemo(() => {
    return alerts.filter(a => {
      const matchSeverity = alertSeverityFilter === 'todas' || 
        (alertSeverityFilter === 'critica' && a.severity === 'Critica') ||
        (alertSeverityFilter === 'alta' && a.severity === 'Alta') ||
        (alertSeverityFilter === 'media' && a.severity === 'Media') ||
        (alertSeverityFilter === 'baja' && a.severity === 'Baja');

      const matchStatus = alertStatusFilter === 'todas' || a.status === alertStatusFilter;

      return matchSeverity && matchStatus;
    });
  }, [alerts, alertSeverityFilter, alertStatusFilter]);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div id="cio-module-container" className="space-y-6">
      
      {/* 1. Cabecera Ejecutiva Principal */}
      <div id="cio-main-header" className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-1.5">
            <span className="text-xs font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              SALA ESTRATÉGICA DE CONTROL
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight">Centro de Inteligencia Organizacional</h1>
            <p className="text-slate-300 text-sm max-w-2xl font-medium leading-relaxed">
              Consolidación inteligente y análisis cruzado en tiempo real de Clima Laboral, Batería Psicosocial y Caracterización de Salud de <strong>{companyName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button 
              onClick={handleGenerateAnalysis}
              disabled={isAnalyzing}
              className="px-4 py-3 bg-white/10 hover:bg-white/15 border border-white/15 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              Actualizar Diagnóstico IA
            </button>
            <button 
              onClick={handlePrintReport}
              className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4" />
              Imprimir Informe CIO
            </button>
          </div>
        </div>
      </div>

      {/* 2. Barra de Navegación de Sub-Módulos */}
      <div id="cio-sub-nav" className="flex border-b border-slate-200 overflow-x-auto pb-px no-print">
        {[
          { id: 'dashboard', label: 'Dashboard Consolidado', icon: LayoutDashboard },
          { id: 'ia_summary', label: 'Resumen Ejecutivo IA', icon: Brain },
          { id: 'executive_radar', label: 'Radar Ejecutivo', icon: Target },
          { id: 'master_plan', label: 'Plan Maestro', icon: FileText },
          { id: 'correlations', label: 'Correlaciones Inteligentes', icon: Sparkles },
          { id: 'alerts', label: `Centro de Alertas (${alerts.filter(a => a.status !== 'Resuelta').length})`, icon: ShieldAlert },
          { id: 'risks', label: 'Panel de Riesgos', icon: AlertTriangle },
          { id: 'heatmap', label: 'Mapa Organizacional', icon: Layers }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-4 border-b-2 text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 3. Renderizado de Sub-Vistas */}
      <div id="cio-tab-view-container">

        {/* VISTA 1: DASHBOARD CONSOLIDADO */}
        {activeTab === 'dashboard' && (
          <div id="cio-dashboard-view" className="space-y-6 animate-fade-in">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Card 1: Estado General */}
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-3.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Salud Organizacional</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-slate-800">{aggregatedMetrics.organizationalHealth}%</span>
                    <span className="text-xs font-semibold text-slate-400">favorabilidad</span>
                  </div>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${aggregatedMetrics.generalStateColor}`}>
                    {aggregatedMetrics.generalStateLabel}
                  </span>
                </div>
              </div>

              {/* Card 2: Clima Laboral */}
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-3.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clima Organizacional</span>
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-slate-800">{aggregatedMetrics.climateFav}%</span>
                    <span className="text-xs font-semibold text-slate-400">Favorabilidad Global</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-2">Muestra: {climateData?.totalParticipants || 1240} participantes</p>
                </div>
              </div>

              {/* Card 3: Riesgo Psicosocial */}
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-3.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Riesgo Psicosocial</span>
                  <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-slate-800">{aggregatedMetrics.riskScore}/100</span>
                    <span className="text-xs font-semibold text-slate-400">Puntaje Riesgo</span>
                  </div>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                    aggregatedMetrics.riskLevel === 'Alto' || aggregatedMetrics.riskLevel === 'Muy Alto'
                      ? 'text-rose-600 bg-rose-50 border-rose-200'
                      : 'text-amber-600 bg-amber-50 border-amber-200'
                  }`}>
                    Nivel: {aggregatedMetrics.riskLevel}
                  </span>
                </div>
              </div>

              {/* Card 4: Madurez & Compromiso */}
              <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-3.5 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Índice de Compromiso</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-slate-800">{aggregatedMetrics.engagementIndex}%</span>
                    <span className="text-xs font-semibold text-slate-400">compromiso</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold mt-2">{aggregatedMetrics.maturityLevel}</p>
                </div>
              </div>

            </div>

            {/* Visualizer Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart 1: Radial Health Map (Radar) */}
              <div className="lg:col-span-2 bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs text-left">
                <div className="mb-4">
                  <h3 className="text-sm font-extrabold text-slate-800">Mapa de Salud y Cohesión Laboral</h3>
                  <p className="text-xs text-slate-500">Representación integrada del clima y la seguridad del personal (porcentaje favorable).</p>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" data={consolidatedDimensionsData}>
                      <PolarGrid stroke="#cbd5e1" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 9, fontWeight: 'bold' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Clima Organizacional" dataKey="Clima" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                      <Radar name="Seguridad Psicosocial (100 - Riesgo)" dataKey="Riesgo" stroke="#e11d48" fill="#e11d48" fillOpacity={0.2} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Vital Health Indicators (Bar / Pie mix) */}
              <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs text-left flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-800">Indicadores Vitales de Bienestar</h3>
                  <p className="text-xs text-slate-500 mb-4">Relación cruzada de ausentismo, participación y retención.</p>
                </div>
                <div className="h-60 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Bienestar', valor: aggregatedMetrics.wellbeing, fill: '#4f46e5' },
                        { name: 'Participación', valor: demographics?.activeParticipation || 89.5, fill: '#06b6d4' },
                        { name: 'Compromiso', valor: aggregatedMetrics.engagementIndex, fill: '#10b981' },
                        { name: 'Ausentismo (x10)', valor: aggregatedMetrics.absenteeism * 10, fill: '#f43f5e' }
                      ]}
                      margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                      <Tooltip formatter={(value, name, props) => props.payload.name === 'Ausentismo (x10)' ? `${(Number(value) / 10).toFixed(1)}%` : `${value}%`} />
                      <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                        {
                          [
                            { fill: '#4f46e5' },
                            { fill: '#06b6d4' },
                            { fill: '#10b981' },
                            { fill: '#f43f5e' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))
                        }
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-[10px] text-slate-500 font-medium text-center border-t border-slate-100 pt-3">
                  💡 <span className="font-bold">Ausentismo (x10)</span> se multiplica por 10 en el gráfico para facilitar la comparación visual.
                </div>
              </div>

            </div>

            {/* Sub-Módulos Consolidados Status Table */}
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs text-left">
              <div className="mb-4">
                <h3 className="text-sm font-extrabold text-slate-800">Estado de Integración de Módulos Organizacionales</h3>
                <p className="text-xs text-slate-500">Consolidado general de carga de información de los 9 pilares estratégicos de talento.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs font-medium">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                      <th className="pb-3 text-left">Módulo Pilar</th>
                      <th className="pb-3 text-left">Estado Datos</th>
                      <th className="pb-3 text-left">Puntaje / Indicador Clave</th>
                      <th className="pb-3 text-left">Grado de Alerta</th>
                      <th className="pb-3 text-left">Último Procesamiento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {[
                      { name: 'Caracterización Sociodemográfica', status: demographics ? 'Cargado' : 'Pendiente', val: `${demographics?.totalEmployees || 1240} Empleados`, alert: 'Baja', date: 'Julio 2026' },
                      { name: 'Clima Organizacional', status: climateData ? 'Cargado' : 'Pendiente', val: `${aggregatedMetrics.climateFav}% Favorabilidad`, alert: climateData?.globalFavorability && climateData.globalFavorability < 70 ? 'Alta' : 'Baja', date: 'Julio 2026' },
                      { name: 'Riesgo Psicosocial', status: psicosocialData ? 'Cargado' : 'Pendiente', val: `${aggregatedMetrics.riskScore}/100 Riesgo (${aggregatedMetrics.riskLevel})`, alert: aggregatedMetrics.riskScore > 60 ? 'Critica' : 'Media', date: 'Julio 2026' },
                      { name: 'Ausentismo', status: 'Sincronizado', val: `${aggregatedMetrics.absenteeism}% mensual`, alert: aggregatedMetrics.absenteeism > 3.0 ? 'Alta' : 'Media', date: 'Mensual' },
                      { name: 'Accidentes de Trabajo', status: 'Sincronizado', val: '1.2% Accidentalidad', alert: 'Baja', date: 'Mensual' },
                      { name: 'Bienestar Corporativo', status: 'Sincronizado', val: `${aggregatedMetrics.wellbeing}% Satisfacción`, alert: 'Baja', date: 'Julio 2026' },
                      { name: 'Capacitación y Entrenamiento', status: 'Sincronizado', val: '84% Eficacia', alert: 'Baja', date: 'Semestral' },
                      { name: 'Evaluación de Desempeño', status: 'Sincronizado', val: '82.5% Promedio Desempeño', alert: 'Baja', date: 'Anual' },
                      { name: 'Rotación de Personal', status: 'Sincronizado', val: '1.5% Rotación Voluntaria', alert: 'Media', date: 'Mensual' }
                    ].map((mod, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-bold text-slate-800 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                          {mod.name}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            mod.status === 'Cargado' || mod.status === 'Sincronizado' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {mod.status}
                          </span>
                        </td>
                        <td className="py-3 font-mono font-bold text-slate-600">{mod.val}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            mod.alert === 'Critica' 
                              ? 'bg-rose-100 text-rose-700' 
                              : mod.alert === 'Alta' 
                                ? 'bg-orange-100 text-orange-700'
                                : mod.alert === 'Media'
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {mod.alert}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400 font-mono text-[10px]">{mod.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* VISTA 2: RESUMEN EJECUTIVO IA */}
        {activeTab === 'ia_summary' && (
          <div id="cio-ia-summary" className="space-y-6 animate-fade-in print:bg-white print:p-0">
            {isAnalyzing ? (
              <div className="bg-white border border-slate-150 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                <Brain className="w-12 h-12 text-indigo-600 mx-auto animate-spin" />
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Procesando Inteligencia Organizacional</h3>
                  <p className="text-xs text-slate-500 mt-1">Nuestra IA está consolidando clima, riesgos y variables demográficas...</p>
                </div>
              </div>
            ) : analysis ? (
              <div id="cio-executive-report" className="bg-white border border-slate-150 rounded-3xl p-8 shadow-sm space-y-8 text-left">
                
                {/* PDF Header (Only shows in print) */}
                <div className="hidden print:block border-b border-slate-200 pb-5 mb-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest block">INSIGHT PEOPLE IA</span>
                      <h2 className="text-xl font-extrabold text-slate-800">Informe Ejecutivo de Salud Organizacional</h2>
                      <p className="text-xs text-slate-400">Generado de forma automática por el Centro de Inteligencia Organizacional (CIO)</p>
                    </div>
                    <div className="text-right font-mono text-[9px] text-slate-400">
                      <p>Empresa: {companyName}</p>
                      <p>Fecha: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Section 1: Situation */}
                <div className="space-y-3">
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Activity className="w-4 h-4 text-indigo-600" />
                    Situación General Consolidada
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {analysis.situation}
                  </p>
                </div>

                {/* Section 2: Grid of Strengths & Risks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Strengths */}
                  <div className="bg-emerald-50/30 border border-emerald-100 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Fortalezas Identificadas
                    </h4>
                    <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                      {analysis.strengths.map((str, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Risks */}
                  <div className="bg-rose-50/30 border border-rose-100 rounded-2xl p-5 space-y-3">
                    <h4 className="text-xs font-black text-rose-800 uppercase tracking-widest flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      Riesgos y Vulnerabilidades
                    </h4>
                    <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                      {analysis.risks.map((risk, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start">
                          <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Section 3: Key Findings */}
                <div className="space-y-3">
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Brain className="w-4 h-4 text-indigo-600" />
                    Hallazgos Principales
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {analysis.findings.map((fin, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-150 rounded-xl p-4 text-xs font-medium text-slate-600 leading-relaxed relative">
                        <span className="absolute top-3 right-3 text-[10px] font-black text-slate-300">#0{idx + 1}</span>
                        {fin}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Opportunities & Priorities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Opportunities */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      Oportunidades Estratégicas
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-600 font-medium">
                      {analysis.opportunities.map((opp, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span>{opp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Priorities */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                      <Award className="w-4 h-4 text-indigo-600" />
                      Prioridades de Acción Inmediata
                    </h3>
                    <ul className="space-y-2 text-xs text-slate-600 font-medium">
                      {analysis.priorities.map((prio, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                          <span>{prio}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>

                {/* Section 5: Conclusions */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
                    Conclusiones Organizacionales Consolidadas
                  </h4>
                  <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                    {analysis.conclusions.map((conc, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{conc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-slate-150 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                <Brain className="w-12 h-12 text-slate-300 mx-auto" />
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">No se pudo procesar la IA</h3>
                  <p className="text-xs text-slate-500 mt-1">Intente hacer clic en "Actualizar Diagnóstico" para forzar el recálculo.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VISTA 3: CENTRO DE ALERTAS */}
        {activeTab === 'alerts' && (
          <div id="cio-alerts-view" className="space-y-6 animate-fade-in no-print text-left">
            
            {/* Header and filters */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Canal de Alertas Organizacionales</h3>
                <p className="text-xs text-slate-500">Alertas sistémicas generadas por desviaciones críticas de clima o picos de riesgo psicosocial.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                
                {/* Filter Severity */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Severidad:</span>
                  <select 
                    value={alertSeverityFilter}
                    onChange={(e) => setAlertSeverityFilter(e.target.value)}
                    className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value="todas">Todas</option>
                    <option value="critica">⚠️ Crítica</option>
                    <option value="alta">🔴 Alta</option>
                    <option value="media">🟡 Media</option>
                    <option value="baja">🔵 Baja</option>
                  </select>
                </div>

                {/* Filter Status */}
                <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Estado:</span>
                  <select 
                    value={alertStatusFilter}
                    onChange={(e) => setAlertStatusFilter(e.target.value)}
                    className="text-xs font-bold text-slate-700 bg-transparent border-none focus:outline-none cursor-pointer"
                  >
                    <option value="todas">Todos</option>
                    <option value="Abierta">Abiertas</option>
                    <option value="En Mitigación">En Mitigación</option>
                    <option value="Resuelta">Resueltas</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Grid of Alerts */}
            {filteredAlertsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredAlertsList.map((alert) => {
                  let severityStyle = 'border-l-indigo-500 text-indigo-600 bg-indigo-50/20';
                  if (alert.severity === 'Critica') severityStyle = 'border-l-rose-600 text-rose-600 bg-rose-50/20';
                  else if (alert.severity === 'Alta') severityStyle = 'border-l-orange-500 text-orange-600 bg-orange-50/20';
                  else if (alert.severity === 'Media') severityStyle = 'border-l-amber-500 text-amber-600 bg-amber-50/20';

                  return (
                    <div 
                      key={alert.id}
                      className={`bg-white border border-slate-150 border-l-4 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4 transition-all ${severityStyle}`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                            {alert.sourceModule}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            alert.status === 'Resuelta'
                              ? 'bg-emerald-100 text-emerald-700'
                              : alert.status === 'En Mitigación'
                                ? 'bg-indigo-100 text-indigo-700 animate-pulse'
                                : 'bg-rose-100 text-rose-700'
                          }`}>
                            {alert.status}
                          </span>
                        </div>

                        <h4 className="text-sm font-black text-slate-800 mt-2.5">{alert.title}</h4>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5">{alert.description}</p>
                      </div>

                      <div className="pt-3.5 border-t border-slate-100 flex flex-col gap-2.5">
                        <div className="text-xs text-slate-600 font-semibold bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <span className="font-extrabold block text-[9px] text-slate-400 uppercase">Solución Sugerida:</span>
                          {alert.suggestedAction}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400 font-mono font-bold">{alert.date}</span>
                          <div className="flex gap-2">
                            {alert.status !== 'Resuelta' && (
                              <button
                                onClick={() => handleUpdateAlertStatus(alert.id, 'Resuelta')}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer transition-colors"
                              >
                                Marcar Resuelta
                              </button>
                            )}
                            {alert.status === 'Abierta' && (
                              <button
                                onClick={() => handleUpdateAlertStatus(alert.id, 'En Mitigación')}
                                className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-black uppercase cursor-pointer transition-colors"
                              >
                                Mitigar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white border border-slate-150 rounded-3xl p-16 text-center space-y-4 shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <div>
                  <h3 className="font-extrabold text-slate-800 text-sm">Todo en Orden</h3>
                  <p className="text-xs text-slate-500 mt-1">No hay alertas activas de severidad seleccionada en la empresa.</p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* VISTA 4: PANEL DE RIESGOS */}
        {activeTab === 'risks' && (
          <div id="cio-risks-view" className="space-y-6 animate-fade-in text-left no-print">
            
            <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Panel de Gestión y Desglose de Factores Críticos</h3>
                <p className="text-xs text-slate-500">Mapeo sistemático de los factores con mayor riesgo a nivel de Área, Sede, Proyecto y Cargo.</p>
              </div>

              {/* Grid of dimensions and categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1: Intralaboral Tension Factors */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-rose-800 uppercase tracking-wider border-b border-rose-100 pb-2">
                    🔴 Mayor Tensión Intralaboral (SST)
                  </h4>
                  <div className="space-y-3.5">
                    {[
                      { factor: 'Demandas de Carga Mental', score: 75, category: 'Operaciones BPO', alert: 'Crítico' },
                      { factor: 'Demandas Cuantitativas (Volumen)', score: 72, category: 'Operaciones BPO', alert: 'Crítico' },
                      { factor: 'Extensión de la Jornada Laboral', score: 68, category: 'Ventas Seguros', alert: 'Alto' },
                      { factor: 'Retroalimentación del Desempeño', score: 58, category: 'Tecnología', alert: 'Medio' }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-800">{item.factor}</h5>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Área Foco: {item.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs font-black text-slate-700 block">{item.score}/100</span>
                          <span className={`inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                            item.alert === 'Crítico' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>{item.alert}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Extralaboral Tension Factors */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-indigo-800 uppercase tracking-wider border-b border-indigo-100 pb-2">
                    🔵 Mayor Tensión Extralaboral & Entorno
                  </h4>
                  <div className="space-y-3.5">
                    {[
                      { factor: 'Tiempo Fuera del Trabajo', score: 52, category: 'Bogotá (Sede)', alert: 'Alto' },
                      { factor: 'Responsabilidades de Cuidado Familiar', score: 46, category: 'Cali (Sede)', alert: 'Medio' },
                      { factor: 'Desplazamiento y Transporte Urbano', score: 42, category: 'Medellín (Sede)', alert: 'Medio' },
                      { factor: 'Características Económicas del Hogar', score: 40, category: 'Bogotá (Sede)', alert: 'Medio' }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-150 rounded-xl p-4 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-slate-800">{item.factor}</h5>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Sede Foco: {item.category}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-xs font-black text-slate-700 block">{item.score}/100</span>
                          <span className="inline-block text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">{item.alert}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* VISTA 5: MAPA ORGANIZACIONAL (HEATMAP) */}
        {activeTab === 'heatmap' && (
          <div id="cio-heatmap-view" className="space-y-6 animate-fade-in text-left no-print">
            
            {/* Filters Bar */}
            <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800">Mapa Organizacional de Calor Interactivo</h3>
                <p className="text-xs text-slate-500">Ajusta los filtros demográficos para diagnosticar el estado de salud o riesgo por intersecciones.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                
                {/* Area filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 block">Área</label>
                  <select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value="todos">Todos</option>
                    <option value="Operaciones">Operaciones</option>
                    <option value="Tecnología">Tecnología</option>
                    <option value="Ventas">Ventas</option>
                    <option value="Recursos Humanos">RRHH</option>
                  </select>
                </div>

                {/* Sede filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 block">Sede</label>
                  <select
                    value={selectedSede}
                    onChange={(e) => setSelectedSede(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value="todos">Todos</option>
                    <option value="Bogotá">Bogotá</option>
                    <option value="Medellín">Medellín</option>
                    <option value="Cali">Cali</option>
                  </select>
                </div>

                {/* Proyecto filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 block">Proyecto</label>
                  <select
                    value={selectedProyecto}
                    onChange={(e) => setSelectedProyecto(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value="todos">Todos</option>
                    <option value="Proyecto Core">Proyecto Core</option>
                    <option value="Soporte Clientes">Soporte Clientes</option>
                    <option value="Ventas Seguros">Ventas Seguros</option>
                  </select>
                </div>

                {/* Sex filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 block">Género</label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value="todos">Todos</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                  </select>
                </div>

                {/* Age filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 block">Rango Edad</label>
                  <select
                    value={selectedAgeRange}
                    onChange={(e) => setSelectedAgeRange(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value="todos">Todos</option>
                    <option value="18-25">18-25 años</option>
                    <option value="26-35">26-35 años</option>
                    <option value="36-45">36-45 años</option>
                    <option value="46-55">46-55 años</option>
                    <option value="56_o_mas">56 años o más</option>
                  </select>
                </div>

                {/* Tenure filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black text-slate-400 block">Antigüedad</label>
                  <select
                    value={selectedTenure}
                    onChange={(e) => setSelectedTenure(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 cursor-pointer focus:outline-none"
                  >
                    <option value="todos">Todos</option>
                    <option value="menos_1_ano">Menos de 1 año</option>
                    <option value="1_3_anos">1 - 3 años</option>
                    <option value="mas_5_anos">Más de 5 años</option>
                  </select>
                </div>

                {/* Clear filters Button */}
                <button
                  onClick={() => {
                    setSelectedArea('todos');
                    setSelectedSede('todos');
                    setSelectedProyecto('todos');
                    setSelectedRole('todos');
                    setSelectedGender('todos');
                    setSelectedAgeRange('todos');
                    setSelectedTenure('todos');
                  }}
                  className="px-2.5 py-1.5 mt-auto bg-slate-100 hover:bg-slate-250 border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-500 cursor-pointer transition-colors block text-center"
                >
                  Limpiar
                </button>

              </div>
            </div>

            {/* Grid display of Heatmap segments */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Heat Grid Blocks */}
              <div className="md:col-span-2 bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-xs font-extrabold text-slate-800">Células Colectoras de Estrés & Clima ({filteredHeatmapSegments.length})</span>
                  <div className="flex gap-4 text-[9px] font-black uppercase">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Saludable (75-100)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Alerta (60-74)</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Crítico (0-59)</span>
                  </div>
                </div>

                {filteredHeatmapSegments.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredHeatmapSegments.map((segment, idx) => (
                      <div 
                        key={idx}
                        className={`border rounded-xl p-4 text-left transition-all relative overflow-hidden flex flex-col justify-between min-h-[100px] shadow-3xs hover:scale-[1.02] ${segment.color} ${segment.border}`}
                      >
                        <div>
                          <span className={`text-[8px] font-black uppercase block ${segment.textColor}`}>{segment.sede} • {segment.area}</span>
                          <h4 className="text-xs font-black text-white mt-1 truncate">{segment.project}</h4>
                        </div>
                        <div className="flex justify-between items-baseline mt-4 border-t border-white/10 pt-2">
                          <span className="text-[10px] text-white/80 font-semibold">{segment.state}</span>
                          <span className="text-xl font-black font-mono text-white">{segment.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400 text-xs font-medium">
                    No hay segmentos que cumplan con la combinación seleccionada de filtros demográficos.
                  </div>
                )}
              </div>

              {/* Explanatory notes & Recommendations side bar */}
              <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex flex-col justify-between text-left">
                <div className="space-y-4">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">Interpretación de Segmentos</h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Este mapa de calor cruza las variables demográficas con los puntajes de favorabilidad ponderados del Clima y la salud intralaboral. Ayuda a identificar silos de desgaste.
                    </p>
                  </div>

                  <div className="space-y-2.5 border-t border-slate-100 pt-4 text-xs font-medium text-slate-600 leading-relaxed">
                    <p>🎯 <span className="font-bold text-slate-700">Filtro Temprano:</span> Las células críticas suelen tener menor antigüedad en la organización (menos de 1 año).</p>
                    <p>🏢 <span className="font-bold text-slate-700">Comportamiento por Sedes:</span> Se reporta mayor sobrecarga acumulada en la sede central de Bogotá en comparación con Cali.</p>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4">
                  <button 
                    onClick={() => {
                      setSelectedArea('todos');
                      setSelectedSede('todos');
                      setSelectedProyecto('todos');
                      setSelectedGender('todos');
                      setSelectedAgeRange('todos');
                      setSelectedTenure('todos');
                    }}
                    className="w-full text-center py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-black transition-colors cursor-pointer"
                  >
                    Restablecer Filtros
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* VISTA 6: MOTOR DE CORRELACIONES INTELIGENTES */}
        {activeTab === 'correlations' && correlationResult && (() => {
          const currentKey = `${selectedVarX}_vs_${selectedVarY}`;
          const geminiInterpretation = customInterpretations[currentKey];
          const finalInterpretation = geminiInterpretation?.interpretation || correlationResult.interpretation;
          const finalRecommendation = geminiInterpretation?.recommendation || correlationResult.recommendation;
          const isUsingGemini = !!geminiInterpretation;
          
          return (
            <div id="cio-correlations-view" className="space-y-6 animate-fade-in text-left">
              
              {/* Cabecera Interna de Correlaciones */}
              <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-150">
                      MÓDULO DE ANALÍTICA AVANZADA
                    </span>
                    <h2 className="text-xl font-black text-slate-800">Motor de Correlaciones Inteligentes</h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                      Descubre relaciones de causa-efecto reales cruzando variables sociodemográficas, indicadores de clima organizacional y niveles de riesgo psicosocial de forma transparente.
                    </p>
                  </div>
                </div>
              </div>

              {/* Presets Rápidos de Correlación */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <h3 className="text-xs font-black text-slate-700 mb-2.5 uppercase tracking-wider">
                  💡 Correlaciones Críticas Soportadas (Ejemplos Reales)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => {
                      setSelectedVarX('estres');
                      setSelectedVarY('ausentismo');
                    }}
                    className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedVarX === 'estres' && selectedVarY === 'ausentismo'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md font-bold'
                        : 'bg-white border-slate-150 hover:border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`text-[8px] font-black uppercase ${selectedVarX === 'estres' && selectedVarY === 'ausentismo' ? 'text-indigo-200' : 'text-slate-400'}`}>Salud Ocupacional</span>
                    <span className="text-xs font-bold mt-1">Estrés ➔ Ausentismo</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedVarX('liderazgo');
                      setSelectedVarY('clima_global');
                    }}
                    className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedVarX === 'liderazgo' && selectedVarY === 'clima_global'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md font-bold'
                        : 'bg-white border-slate-150 hover:border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`text-[8px] font-black uppercase ${selectedVarX === 'liderazgo' && selectedVarY === 'clima_global' ? 'text-indigo-200' : 'text-slate-400'}`}>Desarrollo Humano</span>
                    <span className="text-xs font-bold mt-1">Liderazgo ➔ Clima Laboral</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedVarX('antiguedad');
                      setSelectedVarY('riesgo_rotacion');
                    }}
                    className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedVarX === 'antiguedad' && selectedVarY === 'riesgo_rotacion'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md font-bold'
                        : 'bg-white border-slate-150 hover:border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`text-[8px] font-black uppercase ${selectedVarX === 'antiguedad' && selectedVarY === 'riesgo_rotacion' ? 'text-indigo-200' : 'text-slate-400'}`}>Retención de Talento</span>
                    <span className="text-xs font-bold mt-1">Antigüedad ➔ Rotación</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedVarX('actividad_fisica');
                      setSelectedVarY('dolor_musculo');
                    }}
                    className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      selectedVarX === 'actividad_fisica' && selectedVarY === 'dolor_musculo'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md font-bold'
                        : 'bg-white border-slate-150 hover:border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`text-[8px] font-black uppercase ${selectedVarX === 'actividad_fisica' && selectedVarY === 'dolor_musculo' ? 'text-indigo-200' : 'text-slate-400'}`}>Medicina Preventiva</span>
                    <span className="text-xs font-bold mt-1">Actividad Física ➔ Dolor</span>
                  </button>
                </div>
              </div>

              {/* Selector de Duplas y Parámetros */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
                
                {/* Controles de Selección */}
                <div className="lg:col-span-1 bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-slate-100">
                    <Sliders className="w-3.5 h-3.5 text-slate-500" /> Configuración de Variables
                  </h4>

                  {/* Variable X */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700">Variable X (Independiente)</label>
                    <div className="relative">
                      <select
                        value={selectedVarX}
                        onChange={(e) => setSelectedVarX(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 appearance-none pr-8 cursor-pointer"
                      >
                        {CORRELATABLE_VARIABLES.map(v => (
                          <option key={v.id} value={v.id} disabled={v.id === selectedVarY}>
                            {v.name} ({v.module})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                      {CORRELATABLE_VARIABLES.find(v => v.id === selectedVarX)?.description}
                    </p>
                  </div>

                  {/* Variable Y */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-700">Variable Y (Dependiente)</label>
                    <div className="relative">
                      <select
                        value={selectedVarY}
                        onChange={(e) => setSelectedVarY(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-500 appearance-none pr-8 cursor-pointer"
                      >
                        {CORRELATABLE_VARIABLES.map(v => (
                          <option key={v.id} value={v.id} disabled={v.id === selectedVarX}>
                            {v.name} ({v.module})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                    </div>
                    <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                      {CORRELATABLE_VARIABLES.find(v => v.id === selectedVarY)?.description}
                    </p>
                  </div>

                  {/* Resumen Estadístico Rápido */}
                  <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 space-y-3 pt-3.5">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-slate-200 pb-1.5">
                      Métricas de Ajuste
                    </span>
                    
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-slate-500">Muestra (N):</span>
                      <span className="text-xs font-mono font-bold text-slate-700">{correlationResult.n} colab.</span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-slate-500">Grados de Libertad:</span>
                      <span className="text-xs font-mono font-bold text-slate-700">{correlationResult.n - 2} (df)</span>
                    </div>

                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-semibold text-slate-500">Valor p (Significancia):</span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {correlationResult.pValue < 0.001 ? '< 0.001' : correlationResult.pValue.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Panel de Estadísticas y Resultados */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Coeficiente r */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pearson r</span>
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-mono text-xs font-bold">
                        r
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black font-mono text-slate-800">
                          {correlationResult.r > 0 ? '+' : ''}{correlationResult.r.toFixed(2)}
                        </span>
                      </div>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        Math.abs(correlationResult.r) >= 0.7 
                          ? 'bg-rose-50 text-rose-700 border-rose-150' 
                          : Math.abs(correlationResult.r) >= 0.4
                          ? 'bg-amber-50 text-amber-700 border-amber-150'
                          : 'bg-slate-50 text-slate-500 border-slate-150'
                      }`}>
                        {Math.abs(correlationResult.r) >= 0.7 
                          ? 'Relación Fuerte' 
                          : Math.abs(correlationResult.r) >= 0.4
                          ? 'Relación Moderada'
                          : 'Relación Débil'}
                      </span>
                    </div>
                  </div>

                  {/* Coeficiente R2 */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Determinación (R²)</span>
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-mono text-xs font-bold">
                        R²
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black font-mono text-slate-800">
                          {(correlationResult.r2 * 100).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2 font-semibold leading-relaxed">
                        de la variabilidad de Y es explicada por X.
                      </p>
                    </div>
                  </div>

                  {/* Nivel de Confianza */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nivel de Confianza</span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black font-mono text-slate-800">
                          {correlationResult.confidencePercentage}%
                        </span>
                      </div>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                        correlationResult.confidence === 'Muy Alta' || correlationResult.confidence === 'Alta'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                          : correlationResult.confidence === 'Moderada'
                          ? 'bg-amber-50 text-amber-700 border-amber-150'
                          : 'bg-rose-50 text-rose-700 border-rose-150'
                      }`}>
                        Confianza: {correlationResult.confidence}
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Gráfico de Dispersión y Línea de Tendencia */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Gráfico Recharts Composed */}
                <div className="lg:col-span-2 bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Visualizador Científico</span>
                      <h4 className="text-sm font-black text-slate-800">
                        Gráfico de Dispersión (Scatter Plot) y Línea de Regresión
                      </h4>
                    </div>
                    <span className="text-[9px] font-black uppercase bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-1 rounded font-mono">
                      Y = {correlationResult.trendSlope.toFixed(2)}X {correlationResult.trendIntercept >= 0 ? '+' : ''}{correlationResult.trendIntercept.toFixed(2)}
                    </span>
                  </div>

                  <div className="h-80 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart
                        margin={{ top: 10, right: 10, bottom: 20, left: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          type="number" 
                          dataKey="x" 
                          name={correlationResult.varX.name} 
                          domain={['auto', 'auto']}
                          tick={{ fill: '#64748b', fontSize: 10 }}
                          label={{ value: correlationResult.varX.name, position: 'insideBottom', offset: -10, fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                        />
                        <YAxis 
                          type="number" 
                          dataKey="y" 
                          name={correlationResult.varY.name} 
                          domain={['auto', 'auto']}
                          tick={{ fill: '#64748b', fontSize: 10 }}
                          label={{ value: correlationResult.varY.name, angle: -90, position: 'insideLeft', offset: 0, fill: '#475569', fontSize: 10, fontWeight: 'bold' }}
                        />
                        <ZAxis type="category" dataKey="area" name="Área" />
                        <Tooltip 
                          cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-950/95 backdrop-blur-md text-white px-3 py-2.5 rounded-xl border border-slate-800 text-xs shadow-xl space-y-1 text-left min-w-[180px]">
                                  <div className="border-b border-white/10 pb-1.5 mb-1.5 flex justify-between items-center">
                                    <span className="font-black text-[10px] text-cyan-400">{data.label}</span>
                                    <span className="text-[8px] font-bold text-white/60 uppercase">{data.area}</span>
                                  </div>
                                  <p className="text-[10px] text-white/80">
                                    <span className="font-semibold text-slate-400">{correlationResult.varX.name}:</span>{' '}
                                    <span className="font-mono font-bold text-white">{data.x}</span>
                                  </p>
                                  <p className="text-[10px] text-white/80">
                                    <span className="font-semibold text-slate-400">{correlationResult.varY.name}:</span>{' '}
                                    <span className="font-mono font-bold text-white">{data.y}</span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        
                        {/* Original Scatter Points */}
                        <Scatter 
                          name="Colaboradores" 
                          data={correlationResult.dataPoints} 
                          fill="#4f46e5" 
                          fillOpacity={0.65}
                        />

                        {/* Regresión Lineal Straight Trend Line */}
                        <Line
                          name="Tendencia"
                          data={chartData}
                          dataKey="trendY"
                          stroke="#f43f5e"
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={false}
                          legendType="line"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Panel de Interpretación y Recomendación IA */}
                <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-6">
                  
                  {/* Bloque Interpretación */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-pink-500 animate-pulse" />
                        Interpretación IA
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        isUsingGemini
                          ? 'bg-purple-50 text-purple-700 border-purple-150'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {isUsingGemini ? 'Gemini 3.5' : 'Heurística Local'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {finalInterpretation}
                    </p>
                  </div>

                  {/* Bloque Recomendación */}
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Recomendación Táctica
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {finalRecommendation}
                    </p>
                  </div>

                  {/* Acción de Solicitar Gemini */}
                  <div className="border-t border-slate-100 pt-4 mt-auto">
                    <button
                      onClick={handleRequestGeminiInterpretation}
                      disabled={isInterpreting}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-indigo-400 disabled:to-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Sparkles className={`w-4 h-4 ${isInterpreting ? 'animate-spin' : 'animate-pulse'}`} />
                      {isInterpreting ? 'Generando Informe Gemini...' : 'Solicitar Análisis Experto IA'}
                    </button>
                    <p className="text-[9px] text-slate-400 text-center mt-2 font-medium">
                      Happy IA utiliza Gemini 3.5-Flash para redactar análisis de SST corporativo de primer nivel.
                    </p>
                  </div>

                </div>

              </div>

              {/* Sección de Futuros Modelos Estadísticos y Arquitectura */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-3xl">
                    <span className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Activity className="w-4 h-4" /> ARQUITECTURA PREPARADA PARA EXPANSIÓN ESTADÍSTICA
                    </span>
                    <h4 className="text-lg font-black">Plan de Ruta de Analítica Avanzada Cruzada</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      El set de datos unificado en memoria (<code className="bg-white/10 px-1 py-0.5 rounded font-mono text-[10px]">employeeDataset</code>) conserva datos atómicos de {correlationResult.n} colaboradores. La estructura modular del motor permite habilitar técnicas adicionales de forma directa:
                    </p>
                    
                    {/* Grid de Futuras Técnicas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 text-xs">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5">
                        <span className="font-extrabold text-cyan-300 block">1. Regresión Multivariada</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Predecir el índice de ausentismo ponderando simultáneamente sobrecarga laboral, edad y clima.
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5">
                        <span className="font-extrabold text-cyan-300 block">2. Clustering K-Means</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Segmentación automática de colaboradores en arquetipos de riesgo psicofísico según hábitos.
                        </p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1.5">
                        <span className="font-extrabold text-cyan-300 block">3. Árboles de Decisión</span>
                        <p className="text-[10px] text-slate-400 leading-relaxed">
                          Mapeo visual de rutas lógicas que conducen a la fuga de talento voluntaria temprana.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          );
        })()}

        {/* VISTA 7: RADAR EJECUTIVO */}
        {activeTab === 'executive_radar' && (() => {
          // Find stats for summary
          const highestPriorityTheme = [...executiveRadarData].sort((a, b) => b.prioridad - a.prioridad)[0];
          const lowestLevelTheme = [...executiveRadarData].sort((a, b) => a.nivel - b.nivel)[0];
          const avgPriority = Math.round(executiveRadarData.reduce((acc, t) => acc + t.prioridad, 0) / executiveRadarData.length);

          const globalRadarData = executiveRadarData.map(t => ({
            subject: t.name,
            Nivel: t.nivel,
            Prioridad: t.prioridad,
            fullMark: 100
          }));

          const customInterpret = radarCustomInterpretations[selectedRadarThemeId];
          const finalInterpretation = customInterpret?.interpretation || selectedRadarTheme.interpretation;
          const finalRecommendation = customInterpret?.recommendation || selectedRadarTheme.recommendation;
          const isUsingGemini = !!customInterpret;

          const detailRadarData = [
            { subject: 'Nivel', value: selectedRadarTheme.nivel },
            { subject: 'Prioridad', value: selectedRadarTheme.prioridad },
            { subject: 'Impacto', value: selectedRadarTheme.impacto },
            { subject: 'Urgencia', value: selectedRadarTheme.urgencia },
            { subject: 'Esfuerzo', value: selectedRadarTheme.esfuerzo }
          ];

          return (
            <div id="cio-radar-view" className="space-y-6 animate-fade-in text-left">
              {/* Cabecera Interna del Radar Ejecutivo */}
              <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-150">
                      MÓDULO DE PRIORIZACIÓN ESTRATÉGICA
                    </span>
                    <h2 className="text-xl font-black text-slate-800">Radar Ejecutivo de Intervención Organizacional</h2>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-3xl">
                      Visualiza de un vistazo la criticidad, el nivel de desempeño y el esfuerzo requerido para las 8 temáticas clave de bienestar laboral. Nuestro motor calcula prioridades automatizadas para guiar la toma de decisiones presupuestales y operativas en SST.
                    </p>
                  </div>
                </div>
              </div>

              {/* KPIs de Priorización */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Prioridad Crítica Directa</span>
                    <h4 className="text-base font-black text-slate-800 mt-0.5">{highestPriorityTheme.name}</h4>
                    <p className="text-[10px] text-rose-600 font-extrabold mt-0.5">Prioridad: {highestPriorityTheme.prioridad}% • Nivel: {highestPriorityTheme.nivel}%</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 shrink-0">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mayor Rezago Operativo</span>
                    <h4 className="text-base font-black text-slate-800 mt-0.5">{lowestLevelTheme.name}</h4>
                    <p className="text-[10px] text-amber-600 font-extrabold mt-0.5">Nivel más bajo detectado: {lowestLevelTheme.nivel}%</p>
                  </div>
                </div>

                <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
                    <Sliders className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Índice Medio de Prioridad</span>
                    <h4 className="text-base font-black text-slate-800 mt-0.5">{avgPriority}% de Urgencia Promedio</h4>
                    <p className="text-[10px] text-indigo-600 font-extrabold mt-0.5">De 8 áreas transversales auditadas</p>
                  </div>
                </div>
              </div>

              {/* Grid Principal Radar y Selector */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Panel Izquierdo: Lista de Temáticas (Selector) */}
                <div className="lg:col-span-1 bg-white border border-slate-150 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      📋 Prioridad Calculada por Temática
                    </h3>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Selecciona una temática para abrir el análisis dimensional de 5 factores.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                    {executiveRadarData.map(theme => {
                      const isSelected = theme.id === selectedRadarThemeId;
                      const isCritical = theme.nivel < 65;
                      const isHealthy = theme.nivel >= 80;

                      return (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedRadarThemeId(theme.id)}
                          className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm font-bold scale-[1.01]'
                              : 'bg-slate-50 border-slate-150 hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="space-y-1 text-left">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black">{theme.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : isCritical
                                  ? 'bg-rose-50 text-rose-700 border border-rose-150'
                                  : isHealthy
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                                  : 'bg-amber-50 text-amber-700 border border-amber-150'
                              }`}>
                                {isCritical ? 'Crítico' : isHealthy ? 'Estable' : 'Alerta'}
                              </span>
                            </div>
                            <p className={`text-[10px] max-w-[180px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400 font-medium'}`}>
                              {theme.description}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className={`text-[10px] font-bold block uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                              Prioridad
                            </span>
                            <span className="text-sm font-mono font-black">
                              {theme.prioridad}%
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Panel Central: Gráfico de Comparación Global (Radar Chart 1) */}
                <div className="lg:col-span-2 bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Foco Corporativo</span>
                    <h3 className="text-sm font-black text-slate-800">
                      Mapa General de Intervención (Nivel vs Prioridad)
                    </h3>
                  </div>

                  <div className="h-80 w-full flex items-center justify-center my-4 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={globalRadarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#334155', fontSize: 11, fontWeight: 'bold' }} 
                        />
                        <PolarRadiusAxis 
                          angle={30} 
                          domain={[0, 100]} 
                          tick={{ fill: '#64748b', fontSize: 9 }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-950/95 backdrop-blur-md text-white px-3 py-2 rounded-xl border border-slate-800 text-xs shadow-xl space-y-1 text-left min-w-[160px]">
                                  <p className="font-black text-[10px] text-indigo-400 border-b border-white/10 pb-1 mb-1">
                                    {data.subject}
                                  </p>
                                  <p className="text-[10px] text-white/80">
                                    <span className="font-semibold text-slate-400">Nivel de Desempeño:</span>{' '}
                                    <span className="font-mono font-bold text-white">{data.Nivel}%</span>
                                  </p>
                                  <p className="text-[10px] text-white/80">
                                    <span className="font-semibold text-slate-400">Prioridad:</span>{' '}
                                    <span className="font-mono font-bold text-rose-400">{data.Prioridad}%</span>
                                  </p>
                                  <p className="text-[8px] text-slate-400 italic">
                                    Clic en la temática a la izquierda para ver el desglose completo.
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Radar 
                          name="Desempeño actual" 
                          dataKey="Nivel" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.25} 
                        />
                        <Radar 
                          name="Prioridad de acción" 
                          dataKey="Prioridad" 
                          stroke="#ef4444" 
                          fill="#ef4444" 
                          fillOpacity={0.15} 
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-[10px] text-slate-500 leading-relaxed text-center">
                    💡 <strong>Interpretación Ejecutiva:</strong> Las temáticas con una **Prioridad** superior al **Nivel** de desempeño requieren planes de mitigación urgentes (generalmente indicadas por la brecha del polígono rojo sobresaliendo del azul).
                  </div>
                </div>

              </div>

              {/* Sección de Detalle de Temática Seleccionada (Bento Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Sub-Gráfico: Radar de 5 Factores (Nivel, Prioridad, Impacto, Urgencia, Esfuerzo) */}
                <div className="lg:col-span-1 bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Desglose Técnico</span>
                    <h3 className="text-sm font-black text-slate-800">
                      Radar de 5 Dimensiones: {selectedRadarTheme.name}
                    </h3>
                  </div>

                  <div className="h-64 w-full flex items-center justify-center my-4 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={detailRadarData}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#475569', fontSize: 10, fontWeight: 'extrabold' }} 
                        />
                        <PolarRadiusAxis 
                          angle={90} 
                          domain={[0, 100]} 
                          tick={{ fill: '#64748b', fontSize: 8 }}
                        />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-950/95 backdrop-blur-md text-white px-2.5 py-1.5 rounded-lg border border-slate-800 text-[10px] shadow-xl text-left">
                                  <p className="font-bold text-white">
                                    {data.subject}: <span className="font-mono text-cyan-400 font-black">{data.value}%</span>
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Radar 
                          name={selectedRadarTheme.name} 
                          dataKey="value" 
                          stroke="#6366f1" 
                          fill="#6366f1" 
                          fillOpacity={0.3} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Tabla / Indicadores de las 5 Dimensiones */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    {[
                      { label: 'Nivel', value: selectedRadarTheme.nivel, color: 'bg-indigo-600', text: 'Desempeño general de este indicador en la empresa.' },
                      { label: 'Prioridad', value: selectedRadarTheme.prioridad, color: 'bg-rose-500', text: 'Nivel de urgencia ponderado para intervención inmediata.' },
                      { label: 'Impacto', value: selectedRadarTheme.impacto, color: 'bg-amber-500', text: 'Importancia para la retención y clima organizacional.' },
                      { label: 'Urgencia', value: selectedRadarTheme.urgencia, color: 'bg-red-500', text: 'Criticidad resultante del rezago del indicador.' },
                      { label: 'Esfuerzo', value: selectedRadarTheme.esfuerzo, color: 'bg-blue-500', text: 'Inversión y recursos exigidos para mitigar.' }
                    ].map(dim => (
                      <div key={dim.label} className="space-y-1">
                        <div className="flex justify-between items-baseline text-[11px]">
                          <span className="font-extrabold text-slate-700">{dim.label}</span>
                          <span className="font-mono font-black text-slate-800">{dim.value}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full ${dim.color}`} style={{ width: `${dim.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel de Análisis e Interpretación IA de la Temática */}
                <div className="lg:col-span-2 bg-white border border-slate-150 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-6">
                  
                  {/* Categoría y Título de Detalle */}
                  <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                        {selectedRadarTheme.category}
                      </span>
                      <h3 className="text-base font-black text-slate-800 mt-1">
                        Análisis Dimensional: {selectedRadarTheme.name}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-black bg-indigo-50 border border-indigo-150 text-indigo-700 px-3 py-1 rounded-xl">
                      Prioridad: {selectedRadarTheme.prioridad}%
                    </span>
                  </div>

                  {/* Bloque de Interpretación */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1.5">
                        <Brain className="w-4 h-4 text-pink-500 animate-pulse" />
                        Diagnóstico Analítico
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                        isUsingGemini
                          ? 'bg-purple-50 text-purple-700 border-purple-150'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {isUsingGemini ? 'Gemini 3.5' : 'Heurística Local'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {finalInterpretation}
                    </p>
                  </div>

                  {/* Bloque de Recomendación */}
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Plan de Intervención Prioritario
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {finalRecommendation}
                    </p>
                  </div>

                  {/* Botón de Consulta a Gemini */}
                  <div className="border-t border-slate-100 pt-4 mt-auto">
                    <button
                      onClick={handleRequestRadarInterpretation}
                      disabled={isInterpretingRadar}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-indigo-400 disabled:to-indigo-500 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Sparkles className={`w-4 h-4 ${isInterpretingRadar ? 'animate-spin' : 'animate-pulse'}`} />
                      {isInterpretingRadar ? 'Consultando a Gemini...' : `Solicitar Análisis Experto de ${selectedRadarTheme.name} con IA`}
                    </button>
                    <p className="text-[9px] text-slate-400 text-center mt-2 font-medium">
                      El Consultor Happy IA procesará la matriz de 5 dimensiones con LLMs de Google para sugerir un plan estratégico adaptado.
                    </p>
                  </div>

                </div>

              </div>

            </div>
          );
        })()}

        {/* VISTA 8: PLAN MAESTRO ORGANIZACIONAL */}
        {activeTab === 'master_plan' && (() => {
          // Calculations for stats
          const totalCount = filteredActivities.length;
          const completedCount = filteredActivities.filter(a => a.estado === 'Completada').length;
          const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
          const totalCost = filteredActivities.reduce((sum, act) => sum + act.costo, 0);
          
          return (
            <div id="cio-master-plan-view" className="space-y-6">
              
              {/* Resumen Ejecutivo del Plan */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Tarjeta 1: Progreso */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Avance del Plan</span>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-2xl">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black tracking-tight text-slate-850">{completedCount}</span>
                      <span className="text-xs font-bold text-slate-400">/ {totalCount} Actividades</span>
                    </div>
                    {/* Barra de Progreso */}
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-[10px] font-black text-slate-500">
                        <span>Progreso General</span>
                        <span>{progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tarjeta 2: Presupuesto Requerido */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Inversión Estimada</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-2xl">
                      <DollarSign className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-3xl font-black tracking-tight text-slate-850">
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(totalCost)}
                    </span>
                    <p className="text-[10px] font-bold text-slate-400 mt-1">
                      Costo consolidado de las actividades filtradas
                    </p>
                    <div className="mt-4 flex gap-1.5">
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                        Presupuesto Viable
                      </span>
                      <span className="text-[10px] font-black text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl">
                        SST Seguro
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tarjeta 3: Distribución por Prioridad */}
                <div className="bg-white rounded-3xl border border-slate-150 p-6 flex flex-col justify-between shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Actividades por Prioridad</span>
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-2xl">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-rose-50/50 rounded-2xl border border-rose-100">
                        <span className="block text-xs font-black text-rose-600">Alta</span>
                        <span className="text-lg font-bold text-slate-800">
                          {filteredActivities.filter(a => a.prioridad === 'Alta').length}
                        </span>
                      </div>
                      <div className="p-2 bg-amber-50/50 rounded-2xl border border-amber-100">
                        <span className="block text-xs font-black text-amber-600">Media</span>
                        <span className="text-lg font-bold text-slate-800">
                          {filteredActivities.filter(a => a.prioridad === 'Media').length}
                        </span>
                      </div>
                      <div className="p-2 bg-blue-50/50 rounded-2xl border border-blue-100">
                        <span className="block text-xs font-black text-blue-600">Baja</span>
                        <span className="text-lg font-bold text-slate-800">
                          {filteredActivities.filter(a => a.prioridad === 'Baja').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Controles, Buscador y Botones de Exportación */}
              <div className="bg-white rounded-3xl border border-slate-150 p-6 space-y-4 shadow-xs">
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      Plan Maestro SST Consolidado
                    </h2>
                    <p className="text-xs font-semibold text-slate-500">
                      Consolidación estratégica libre de duplicados con estados modificables y exportación legal.
                    </p>
                  </div>

                  {/* Acciones del Plan */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleReconsolidate}
                      className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Vuelve a calcular todas las recomendaciones desde cero sin borrar tus actividades manuales"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Re-consolidar de Módulos
                    </button>
                    <button
                      onClick={openAddModal}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Nueva Actividad
                    </button>
                    <button
                      onClick={handleExportToExcel}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Exportar Excel
                    </button>
                    <button
                      onClick={handleExportToPDF}
                      className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Exportar PDF
                    </button>
                  </div>
                </div>

                {/* Barra de Filtros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 border-t border-slate-100 pt-4">
                  {/* Buscador */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar actividad..."
                      value={masterPlanSearch}
                      onChange={e => setMasterPlanSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden font-semibold"
                    />
                  </div>

                  {/* Filtro Prioridad */}
                  <div>
                    <select
                      value={masterPlanPriorityFilter}
                      onChange={e => setMasterPlanPriorityFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden font-bold text-slate-600"
                    >
                      <option value="todas">Prioridad: Todas</option>
                      <option value="Alta">Prioridad: Alta</option>
                      <option value="Media">Prioridad: Media</option>
                      <option value="Baja">Prioridad: Baja</option>
                    </select>
                  </div>

                  {/* Filtro Estado */}
                  <div>
                    <select
                      value={masterPlanStatusFilter}
                      onChange={e => setMasterPlanStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden font-bold text-slate-600"
                    >
                      <option value="todas">Estado: Todos</option>
                      <option value="No Iniciada">No Iniciada</option>
                      <option value="En Progreso">En Progreso</option>
                      <option value="Completada">Completada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>

                  {/* Filtro Módulo de Origen */}
                  <div>
                    <select
                      value={masterPlanOriginFilter}
                      onChange={e => setMasterPlanOriginFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden font-bold text-slate-600"
                    >
                      <option value="todas">Módulo de Origen: Todos</option>
                      <option value="Clima Organizacional">Clima Organizacional</option>
                      <option value="Riesgo Psicosocial">Riesgo Psicosocial</option>
                      <option value="Bienestar & Salud">Bienestar & Salud</option>
                      <option value="Fisiología y Ergonomía">Fisiología y Ergonomía</option>
                      <option value="Centro de Inteligencia (IA)">Centro de Inteligencia (IA)</option>
                      <option value="General">General / SG-SST</option>
                    </select>
                  </div>

                  {/* Filtro Temática */}
                  <div>
                    <select
                      value={masterPlanGroupFilter}
                      onChange={e => setMasterPlanGroupFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-hidden font-bold text-slate-600"
                    >
                      <option value="todas">Temática: Todas</option>
                      <option value={MASTER_PLAN_GROUPS.LIDERAZGO}>{MASTER_PLAN_GROUPS.LIDERAZGO}</option>
                      <option value={MASTER_PLAN_GROUPS.SALUD_MENTAL}>{MASTER_PLAN_GROUPS.SALUD_MENTAL}</option>
                      <option value={MASTER_PLAN_GROUPS.ERGONOMIA}>{MASTER_PLAN_GROUPS.ERGONOMIA}</option>
                      <option value={MASTER_PLAN_GROUPS.RECONOCIMIENTO}>{MASTER_PLAN_GROUPS.RECONOCIMIENTO}</option>
                      <option value={MASTER_PLAN_GROUPS.CARGA}>{MASTER_PLAN_GROUPS.CARGA}</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Listado de Actividades / Tabla */}
              <div className="bg-white rounded-3xl border border-slate-150 overflow-hidden shadow-xs">
                {filteredActivities.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <Filter className="w-5 h-5 text-slate-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-500">
                      No se encontraron actividades con los filtros actuales.
                    </p>
                    <button
                      onClick={() => {
                        setMasterPlanSearch('');
                        setMasterPlanPriorityFilter('todas');
                        setMasterPlanStatusFilter('todas');
                        setMasterPlanOriginFilter('todas');
                        setMasterPlanGroupFilter('todas');
                      }}
                      className="text-xs font-black text-indigo-600 hover:underline cursor-pointer"
                    >
                      Limpiar todos los filtros
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-600 font-black uppercase tracking-wider border-b border-slate-150">
                          <th className="px-5 py-4">Módulo / Temática</th>
                          <th className="px-5 py-4">Prioridad</th>
                          <th className="px-5 py-4 w-96">Actividad y Objetivo</th>
                          <th className="px-5 py-4">Responsable / Fecha</th>
                          <th className="px-5 py-4">Costo Estimado</th>
                          <th className="px-5 py-4">Indicador / Norma</th>
                          <th className="px-5 py-4">Estado</th>
                          <th className="px-5 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredActivities.map(act => {
                          return (
                            <tr key={act.id} className="hover:bg-slate-50/55 transition-colors">
                              {/* Módulo / Temática */}
                              <td className="px-5 py-4">
                                <span className="block font-black text-slate-800">{act.moduloOrigen}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{act.grupo}</span>
                              </td>

                              {/* Prioridad */}
                              <td className="px-5 py-4">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                  act.prioridad === 'Alta'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-150'
                                    : act.prioridad === 'Media'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-150'
                                    : 'bg-blue-50 text-blue-700 border border-blue-150'
                                }`}>
                                  {act.prioridad}
                                </span>
                              </td>

                              {/* Objetivo */}
                              <td className="px-5 py-4 max-w-xs space-y-1">
                                <p className="font-extrabold text-slate-800 leading-snug">{act.objetivo}</p>
                                <p className="text-[11px] leading-relaxed text-slate-500 font-medium">{act.descripcion}</p>
                              </td>

                              {/* Responsable / Fecha */}
                              <td className="px-5 py-4">
                                <span className="block font-bold text-slate-800">{act.responsable}</span>
                                <span className="text-[10px] text-slate-400 font-mono block">{act.fecha}</span>
                              </td>

                              {/* Costo */}
                              <td className="px-5 py-4 font-mono font-bold text-slate-800">
                                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(act.costo)}
                              </td>

                              {/* Indicador / Norma */}
                              <td className="px-5 py-4 max-w-xs space-y-1">
                                <span className="block text-slate-600 font-bold leading-tight">KPI: {act.indicador}</span>
                                <span className="text-[10px] text-slate-400 block font-semibold leading-tight">Norma: {act.normatividad}</span>
                              </td>

                              {/* Estado Dropdown */}
                              <td className="px-5 py-4">
                                <select
                                  value={act.estado}
                                  onChange={e => handleUpdateStatus(act.id, e.target.value as any)}
                                  className={`px-2 py-1 rounded text-[11px] font-extrabold outline-hidden cursor-pointer border ${
                                    act.estado === 'Completada'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-150'
                                      : act.estado === 'En Progreso'
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-150'
                                      : act.estado === 'Cancelada'
                                      ? 'bg-slate-100 text-slate-500 border-slate-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-150'
                                  }`}
                                >
                                  <option value="No Iniciada">No Iniciada</option>
                                  <option value="En Progreso">En Progreso</option>
                                  <option value="Completada">Completada</option>
                                  <option value="Cancelada">Cancelada</option>
                                </select>
                              </td>

                              {/* Acciones */}
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openEditModal(act)}
                                    className="p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
                                    title="Editar actividad"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteActivity(act.id)}
                                    className="p-1.5 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-150 rounded-lg text-slate-500 hover:text-rose-600 transition-all cursor-pointer"
                                    title="Eliminar actividad"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
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
        })()}

        {/* MODAL PARA AGREGAR O EDITAR ACTIVIDAD */}
        {(isAddingActivity || isEditingActivity) && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-150 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-lg font-black text-slate-800">
                  {isAddingActivity ? 'Agregar Nueva Actividad al Plan Maestro' : 'Editar Actividad del Plan Maestro'}
                </h3>
                <button
                  onClick={() => {
                    setIsAddingActivity(false);
                    setIsEditingActivity(false);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveActivity} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Objetivo */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Objetivo de la Actividad *</label>
                    <input
                      type="text"
                      required
                      value={formObjetivo}
                      onChange={e => setFormObjetivo(e.target.value)}
                      placeholder="Ej. Capacitar al 100% de líderes en habilidades blandas"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden font-bold"
                    />
                  </div>

                  {/* Descripción */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Descripción Detallada *</label>
                    <textarea
                      required
                      rows={3}
                      value={formDescripcion}
                      onChange={e => setFormDescripcion(e.target.value)}
                      placeholder="Detalles sobre la metodología, público objetivo y alcance de la actividad..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden leading-relaxed"
                    />
                  </div>

                  {/* Responsable */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Responsable *</label>
                    <input
                      type="text"
                      required
                      value={formResponsable}
                      onChange={e => setFormResponsable(e.target.value)}
                      placeholder="Ej. Especialista SST / RRHH"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                    />
                  </div>

                  {/* Fecha Límite */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Fecha Límite *</label>
                    <input
                      type="date"
                      required
                      value={formFecha}
                      onChange={e => setFormFecha(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                    />
                  </div>

                  {/* Costo Estimado */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Costo Estimado (COP) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formCosto}
                      onChange={e => setFormCosto(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden font-mono"
                    />
                  </div>

                  {/* Indicador de Éxito */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Indicador de Éxito *</label>
                    <input
                      type="text"
                      required
                      value={formIndicador}
                      onChange={e => setFormIndicador(e.target.value)}
                      placeholder="Ej. Porcentaje de asistencia, reducción de quejas"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                    />
                  </div>

                  {/* Módulo de origen */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Módulo de Origen</label>
                    <select
                      value={formModuloOrigen}
                      onChange={e => setFormModuloOrigen(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden font-bold"
                    >
                      <option value="Clima Organizacional">Clima Organizacional</option>
                      <option value="Riesgo Psicosocial">Riesgo Psicosocial</option>
                      <option value="Bienestar & Salud">Bienestar & Salud</option>
                      <option value="Fisiología y Ergonomía">Fisiología y Ergonomía</option>
                      <option value="Centro de Inteligencia (IA)">Centro de Inteligencia (IA)</option>
                      <option value="General">General / SG-SST</option>
                    </select>
                  </div>

                  {/* Prioridad */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Prioridad</label>
                    <select
                      value={formPrioridad}
                      onChange={e => setFormPrioridad(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden font-bold text-slate-700"
                    >
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>

                  {/* Temática / Grupo */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Temática Asociada</label>
                    <select
                      value={formGrupo}
                      onChange={e => setFormGrupo(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden font-bold text-slate-700"
                    >
                      <option value={MASTER_PLAN_GROUPS.LIDERAZGO}>{MASTER_PLAN_GROUPS.LIDERAZGO}</option>
                      <option value={MASTER_PLAN_GROUPS.SALUD_MENTAL}>{MASTER_PLAN_GROUPS.SALUD_MENTAL}</option>
                      <option value={MASTER_PLAN_GROUPS.ERGONOMIA}>{MASTER_PLAN_GROUPS.ERGONOMIA}</option>
                      <option value={MASTER_PLAN_GROUPS.RECONOCIMIENTO}>{MASTER_PLAN_GROUPS.RECONOCIMIENTO}</option>
                      <option value={MASTER_PLAN_GROUPS.CARGA}>{MASTER_PLAN_GROUPS.CARGA}</option>
                    </select>
                  </div>

                  {/* Estado */}
                  <div className="space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Estado Inicial</label>
                    <select
                      value={formEstado}
                      onChange={e => setFormEstado(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden font-bold text-slate-700"
                    >
                      <option value="No Iniciada">No Iniciada</option>
                      <option value="En Progreso">En Progreso</option>
                      <option value="Completada">Completada</option>
                      <option value="Cancelada">Cancelada</option>
                    </select>
                  </div>

                  {/* Normatividad relacionada */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-black text-slate-600 block">Normatividad Relacionada (SST)</label>
                    <input
                      type="text"
                      value={formNormatividad}
                      onChange={e => setFormNormatividad(e.target.value)}
                      placeholder="Ej. Resolución 0312 de 2019 • Ley 2191 de 2022"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingActivity(false);
                      setIsEditingActivity(false);
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    {isAddingActivity ? 'Crear Actividad' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};

export default CentroInteligenciaModule;
