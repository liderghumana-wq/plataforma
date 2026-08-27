import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Copy, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  BarChart3, 
  Sparkles, 
  FileText, 
  Layers, 
  FolderPlus, 
  Download, 
  Upload, 
  Tag, 
  Clock, 
  Building2, 
  Search, 
  ShieldCheck, 
  Sliders, 
  GitBranch, 
  Info,
  Play,
  FileSpreadsheet,
  Check,
  Building,
  Settings,
  HelpCircle,
  Activity,
  Calendar,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEmpresa } from '../configuracion/useEmpresa';
import { EncuestaMeta, EstadoEncuesta } from './types';
import { builderEncuestasService } from './builder.service';
import { SurveyEditor } from './components/SurveyEditor';
import { SurveyPreview } from './components/SurveyPreview';
import { SurveyAnalytics } from './components/SurveyAnalytics';
import { CompanyCatalogAdmin } from '../../components/CompanyCatalogAdmin';
import { Prompt22TestRunnerPanel } from './components/Prompt22TestRunnerPanel';
import { Prompt24TestRunnerPanel } from './components/Prompt24TestRunnerPanel';
import { Prompt25TestRunnerPanel } from './components/Prompt25TestRunnerPanel';
import { Prompt26TestRunnerPanel } from './components/Prompt26TestRunnerPanel';
import { MasterSurveyForm } from './components/MasterSurveyForm';
import { MasterSurveyQuestionBankManager } from './components/MasterSurveyQuestionBankManager';
import { Prompt27TestRunnerPanel } from './components/Prompt27TestRunnerPanel';
import { CompanyAdminPanel } from './components/CompanyAdminPanel';
import { Prompt28TestRunnerPanel } from './components/Prompt28TestRunnerPanel';
import { Prompt29DataQualityPanel } from './components/Prompt29DataQualityPanel';
import { Prompt29TestRunnerPanel } from './components/Prompt29TestRunnerPanel';
import { Prompt30IndicatorPanel } from './components/Prompt30IndicatorPanel';
import { Prompt30TestRunnerPanel } from './components/Prompt30TestRunnerPanel';
import { IndicatorEngine } from '../../core/indicators/indicatorEngine';
import { SurveyValidationPanel } from './components/SurveyValidationPanel';
import { IndicatorTraceabilityPanel } from './components/IndicatorTraceabilityPanel';
import { EvidenceService, IndicatorTrace } from './evidenceService';
import { SurveyDataQuality } from './components/SurveyDataQuality';

export function ConstructorEncuestasModule() {
  const { config, activeCompanyId } = useEmpresa();
  const empresaId = activeCompanyId || 'default';

  // Prompt 22, 24, 25, 26, 27, 28, 29 & 30 Sub-tabs
  type TabType = 'activas' | 'crear' | 'configuracion' | 'indicadoresP30' | 'pruebas30' | 'calidadP29' | 'pruebas29' | 'adminP28' | 'respuestas' | 'calidad' | 'resultados' | 'trazabilidad' | 'validacionP26' | 'encuestaMaestra' | 'bancoPreguntasP27' | 'pruebas' | 'pruebas24' | 'pruebas25' | 'pruebas26' | 'pruebas27' | 'pruebas28' | 'editor' | 'preview';
  const [activeTab, setActiveTab] = useState<TabType>('activas');

  const [encuestas, setEncuestas] = useState<EncuestaMeta[]>([]);
  const [selectedEncuesta, setSelectedEncuesta] = useState<EncuestaMeta | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string>('todos');

  // "Crear Encuesta" Modal / Form State
  const [newSurveyName, setNewSurveyName] = useState('Caracterización Sociodemográfica y Condiciones de Salud 2026');
  const [newSurveyPeriod, setNewSurveyPeriod] = useState('2026-I');
  const [newSurveyStartDate, setNewSurveyStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [newSurveyEndDate, setNewSurveyEndDate] = useState('2026-12-31');
  const [newSurveyDesc, setNewSurveyDesc] = useState('Encuesta general de caracterización sociodemográfica y condiciones de salud de la población trabajadora.');
  const [newSurveyStatus, setNewSurveyStatus] = useState<EstadoEncuesta>('borrador');

  // Load surveys on mount or company change
  useEffect(() => {
    loadEncuestas();
  }, [empresaId]);

  const loadEncuestas = () => {
    const list = builderEncuestasService.getEncuestas(empresaId);
    setEncuestas(list);
  };

  // Submit new survey creation form
  const handleCreateNewSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurveyName.trim()) return;

    const newEncuesta: EncuestaMeta = {
      id: `enc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      empresaId,
      titulo: newSurveyName.trim(),
      codigo: `ENC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      descripcion: newSurveyDesc.trim(),
      categoria: 'Sociodemográfica y Salud',
      estado: newSurveyStatus,
      version: 1,
      autor: config.responsableInforme || 'Administrador SG-SST',
      fechaCreacion: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      tiempoEstimadoMinutos: 15,
      permitirAnonimo: false,
      tags: [newSurveyPeriod, 'Salud', 'SST'],
      secciones: [
        {
          id: `sec-${Date.now()}-1`,
          encuestaId: '',
          titulo: '01. Información laboral',
          descripcion: 'Datos de vinculación laboral, sede, área y cargo.',
          orden: 1,
          preguntas: []
        }
      ]
    };

    const saved = builderEncuestasService.saveEncuesta(empresaId, newEncuesta);
    setSelectedEncuesta(saved);
    loadEncuestas();
    setActiveTab('editor');
  };

  // Edit Survey
  const handleEditSurvey = (enc: EncuestaMeta) => {
    setSelectedEncuesta(enc);
    setActiveTab('editor');
  };

  // Duplicate Survey
  const handleDuplicateSurvey = (encId: string) => {
    const duplicated = builderEncuestasService.duplicateEncuesta(empresaId, encId);
    if (duplicated) {
      loadEncuestas();
      alert(`¡Encuesta "${duplicated.titulo}" duplicada con éxito!`);
    }
  };

  // Delete Survey
  const handleDeleteSurvey = (encId: string) => {
    if (confirm('¿Está seguro de eliminar esta encuesta? Se perderán su estructura y reglas de dependencia.')) {
      builderEncuestasService.deleteEncuesta(empresaId, encId);
      loadEncuestas();
    }
  };

  // Change Status (Publicar / Desactivar / Cerrar)
  const handleChangeStatus = (encId: string, newStatus: EstadoEncuesta) => {
    builderEncuestasService.changeEstadoEncuesta(empresaId, encId, newStatus);
    loadEncuestas();
  };

  // Close Survey ("Cerrar Encuesta")
  const handleCloseSurvey = (encId: string) => {
    if (confirm('¿Desea cerrar esta encuesta? Al cerrarla no se permitirán nuevas respuestas de los colaboradores.')) {
      builderEncuestasService.changeEstadoEncuesta(empresaId, encId, 'archivada');
      loadEncuestas();
      alert('La encuesta ha sido cerrada exitosamente.');
    }
  };

  // Preview / Test Fill Mode
  const handlePreviewSurvey = (enc: EncuestaMeta) => {
    setSelectedEncuesta(enc);
    setActiveTab('preview');
  };

  // Analytics View
  const handleAnalyticsSurvey = (enc: EncuestaMeta) => {
    setSelectedEncuesta(enc);
    setActiveTab('resultados');
  };

  // Save survey from editor
  const handleSaveFromEditor = (updated: EncuestaMeta) => {
    const saved = builderEncuestasService.saveEncuesta(empresaId, updated);
    setSelectedEncuesta(saved);
    loadEncuestas();
    alert('¡Encuesta guardada correctamente!');
  };

  // Export JSON
  const handleExportJSON = (enc: EncuestaMeta) => {
    const jsonStr = builderEncuestasService.exportJSON(enc);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `encuesta_${enc.codigo}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const imported = builderEncuestasService.importJSON(empresaId, text);
        loadEncuestas();
        alert(`¡Encuesta "${imported.titulo}" importada con éxito!`);
      } catch (err: any) {
        alert(err.message || 'Error al importar el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Export All Responses to Excel (Standardized columns as per PROMPT 22 Section 28 & 29)
  const handleExportExcelResponses = () => {
    const allResponses: any[] = [];
    encuestas.forEach(enc => {
      const resList = builderEncuestasService.getRespuestas(empresaId, enc.id);
      resList.forEach(r => {
        allResponses.push({
          companyId: empresaId,
          surveyId: enc.id,
          periodId: '2026-I',
          employeeId: r.usuarioIdentificacion || 'N/A',
          usuarioNombre: r.usuarioNombre || 'N/A',
          fechaRespuesta: r.fechaRespuesta,
          versionEncuesta: r.versionLabel || 'v1.0',
          ...Object.fromEntries(
            Object.entries(r.respuestas || {}).map(([key, item]: [string, any]) => [key, item.valor])
          )
        });
      });
    });

    if (allResponses.length === 0) {
      alert('No hay respuestas registradas para exportar.');
      return;
    }

    // Convert to CSV / Download
    const headers = Object.keys(allResponses[0]);
    const csvRows = [
      headers.join(','),
      ...allResponses.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respuestas_encuestas_${empresaId}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered surveys list
  const filteredEncuestas = encuestas.filter(e => {
    const matchesSearch = e.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          e.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategoria === 'todos' || e.categoria === filterCategoria;
    return matchesSearch && matchesCategory;
  });

  const categoriasDisponibles = Array.from(new Set(encuestas.map(e => e.categoria)));

  return (
    <div className="space-y-6 text-slate-800 text-left select-none">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Gestión Integral de Encuestas Sociodemográficas & Salud (Prompt 22)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Módulo de Encuestas
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1.5 leading-relaxed">
              Motor dinámico para la creación, diligenciamiento, validación de calidad y análisis de la Encuesta General de Caracterización Sociodemográfica y Condiciones de Salud.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/10 transition-all cursor-pointer">
              <Upload className="w-4 h-4 text-cyan-300" />
              <span>Importar JSON</span>
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>

            <button
              onClick={() => setActiveTab('crear')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Crear Encuesta</span>
            </button>
          </div>
        </div>
      </div>

      {/* PROMPT 22 MAIN NAVIGATION SUB-TABS */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs flex gap-1.5 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('activas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'activas'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Encuestas Activas ({encuestas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('crear')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'crear'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Crear Encuesta</span>
        </button>

        <button
          onClick={() => setActiveTab('indicadoresP30')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'indicadoresP30'
              ? 'bg-indigo-700 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-cyan-300" />
          <span>Motor Indicadores (P30)</span>
        </button>

        <button
          onClick={() => setActiveTab('pruebas30')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pruebas30'
              ? 'bg-slate-900 text-indigo-300 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Suite 13 Pruebas (P30)</span>
        </button>

        <button
          onClick={() => setActiveTab('calidadP29')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'calidadP29'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Motor de Calidad (P29)</span>
        </button>

        <button
          onClick={() => setActiveTab('pruebas29')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pruebas29'
              ? 'bg-slate-900 text-emerald-300 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Suite 17 Pruebas (P29)</span>
        </button>

        <button
          onClick={() => setActiveTab('adminP28')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'adminP28'
              ? 'bg-sky-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-400" />
          <span>Administración Multiempresa (P28)</span>
        </button>

        <button
          onClick={() => setActiveTab('pruebas28')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pruebas28'
              ? 'bg-slate-900 text-sky-300 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>Suite 15 Pruebas (P28)</span>
        </button>

        <button
          onClick={() => setActiveTab('configuracion')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'configuracion'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Configuración (Catálogos)</span>
        </button>

        <button
          onClick={() => setActiveTab('respuestas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'respuestas'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Respuestas</span>
        </button>

        <button
          onClick={() => setActiveTab('calidad')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'calidad'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Calidad de Datos</span>
        </button>

        <button
          onClick={() => setActiveTab('resultados')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'resultados'
              ? 'bg-indigo-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Resultados</span>
        </button>

        <button
          onClick={() => setActiveTab('trazabilidad')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'trazabilidad'
              ? 'bg-slate-900 text-purple-300 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>Trazabilidad (P25)</span>
        </button>

        <button
          onClick={() => setActiveTab('encuestaMaestra')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'encuestaMaestra'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Encuesta Maestra (Formulario P27)</span>
        </button>

        <button
          onClick={() => setActiveTab('bancoPreguntasP27')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'bancoPreguntasP27'
              ? 'bg-slate-900 text-emerald-300 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Banco Preguntas (P27)</span>
        </button>

        <button
          onClick={() => setActiveTab('pruebas27')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pruebas27'
              ? 'bg-slate-900 text-emerald-300 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Suite 15 Pruebas (P27)</span>
        </button>

        <button
          onClick={() => setActiveTab('validacionP26')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'validacionP26'
              ? 'bg-emerald-600 text-white shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-300" />
          <span>Validación de Datos (P26)</span>
        </button>

        <button
          onClick={() => setActiveTab('pruebas26')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pruebas26'
              ? 'bg-slate-900 text-emerald-300 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Suite 15 Pruebas (P26)</span>
        </button>

        <button
          onClick={() => setActiveTab('pruebas')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pruebas'
              ? 'bg-slate-900 text-cyan-300 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-cyan-500" />
          <span>Suite 17 Pruebas (P22)</span>
        </button>

        <button
          onClick={() => setActiveTab('pruebas24')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pruebas24'
              ? 'bg-slate-900 text-emerald-300 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Suite 14 Pruebas (Prompt 24)</span>
        </button>

        <button
          onClick={() => setActiveTab('pruebas25')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pruebas25'
              ? 'bg-slate-900 text-indigo-300 shadow-xs font-black'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Suite 18 Pruebas (Prompt 25)</span>
        </button>

        {selectedEncuesta && activeTab === 'editor' && (
          <button
            onClick={() => setActiveTab('editor')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs font-black flex items-center gap-2 whitespace-nowrap"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editor: {selectedEncuesta.titulo.substring(0, 20)}...</span>
          </button>
        )}

        {selectedEncuesta && activeTab === 'preview' && (
          <button
            onClick={() => setActiveTab('preview')}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white shadow-xs font-black flex items-center gap-2 whitespace-nowrap"
          >
            <Eye className="w-4 h-4" />
            <span>Prueba: {selectedEncuesta.titulo.substring(0, 20)}...</span>
          </button>
        )}
      </div>

      {/* VIEW CONTENTS */}

      {/* 1. ENCUESTAS ACTIVAS */}
      {activeTab === 'activas' && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título o código..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">Categoría:</span>
              <select
                value={filterCategoria}
                onChange={(e) => setFilterCategoria(e.target.value)}
                className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="todos">Todas las categorías</option>
                {categoriasDisponibles.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Survey Cards Grid */}
          {filteredEncuestas.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-4">
              <FolderPlus className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-sm font-extrabold text-slate-800">No hay encuestas registradas</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Cree una nueva encuesta sociodemográfica o utilice una plantilla existente.
              </p>
              <button
                onClick={() => setActiveTab('crear')}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Primera Encuesta</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEncuestas.map((enc) => {
                const totalPreguntas = enc.secciones.reduce((acc, s) => acc + s.preguntas.length, 0);
                const responses = builderEncuestasService.getRespuestas(empresaId, enc.id);
                const isPublished = enc.estado === 'publicada';
                const isClosed = enc.estado === 'archivada';

                return (
                  <motion.div
                    key={enc.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : isClosed
                            ? 'bg-slate-100 text-slate-600 border-slate-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {isPublished ? '● Activa' : isClosed ? '✕ Cerrada' : '○ Borrador'}
                        </span>

                        <span className="text-[11px] font-mono font-bold text-slate-400">
                          {enc.codigo}
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <div>
                        <h3 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                          {enc.titulo}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {enc.descripcion}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center text-slate-600">
                        <div>
                          <span className="text-xs font-black text-slate-900 block">{enc.secciones.length}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">Secciones</span>
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block">{totalPreguntas}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">Preguntas</span>
                        </div>
                        <div>
                          <span className="text-xs font-black text-indigo-600 block">{responses.length}</span>
                          <span className="text-[10px] text-slate-400 block font-semibold">Respuestas</span>
                        </div>
                      </div>

                    </div>

                    {/* Action Bar */}
                    <div className="space-y-2 pt-2">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleEditSurvey(enc)}
                          className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Editar</span>
                        </button>

                        <button
                          onClick={() => handlePreviewSurvey(enc)}
                          className="px-3 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Probar</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => handleAnalyticsSurvey(enc)}
                          className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Resultados ({responses.length})</span>
                        </button>

                        <div className="flex items-center gap-1">
                          {isPublished ? (
                            <button
                              onClick={() => handleCloseSurvey(enc.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                              title="Cerrar Encuesta (Desactivar recepción de respuestas)"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleChangeStatus(enc.id, 'publicada')}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg cursor-pointer"
                              title="Publicar Encuesta"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDuplicateSurvey(enc.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg cursor-pointer"
                            title="Duplicar Encuesta"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleExportJSON(enc)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg cursor-pointer"
                            title="Exportar archivo JSON"
                          >
                            <Download className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteSurvey(enc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="Eliminar Encuesta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 2. CREAR ENCUESTA (FORMULARIO DE CONFIGURACIÓN DE METADATOS) */}
      {activeTab === 'crear' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 max-w-2xl mx-auto">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900">
              Crear Nueva Encuesta Sociodemográfica
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure los metadatos principales de la encuesta antes de construir sus secciones y preguntas.
            </p>
          </div>

          <form onSubmit={handleCreateNewSurveySubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nombre de la Encuesta *</label>
              <input
                type="text"
                required
                value={newSurveyName}
                onChange={(e) => setNewSurveyName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Empresa</label>
                <input
                  type="text"
                  disabled
                  value={`ID: ${empresaId}`}
                  className="w-full px-3.5 py-2.5 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Periodo *</label>
                <input
                  type="text"
                  required
                  value={newSurveyPeriod}
                  onChange={(e) => setNewSurveyPeriod(e.target.value)}
                  placeholder="Ej. 2026-I"
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fecha de Inicio *</label>
                <input
                  type="date"
                  required
                  value={newSurveyStartDate}
                  onChange={(e) => setNewSurveyStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Fecha de Cierre *</label>
                <input
                  type="date"
                  required
                  value={newSurveyEndDate}
                  onChange={(e) => setNewSurveyEndDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Descripción General</label>
              <textarea
                rows={3}
                value={newSurveyDesc}
                onChange={(e) => setNewSurveyDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Estado Inicial</label>
              <select
                value={newSurveyStatus}
                onChange={(e) => setNewSurveyStatus(e.target.value as EstadoEncuesta)}
                className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                <option value="borrador">Borrador (Construcción inicial)</option>
                <option value="publicada">Activa / Publicada (Lista para diligenciar)</option>
                <option value="archivada">Cerrada / Archivada</option>
              </select>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('activas')}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Crear y Diseñar Estructura</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. CONFIGURACIÓN (CATÁLOGOS EMPRESARIALES) */}
      {activeTab === 'configuracion' && (
        <CompanyCatalogAdmin companyId={empresaId} companyName="Empresa Seleccionada" />
      )}

      {/* 4. RESPUESTAS */}
      {activeTab === 'respuestas' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Consolidado de Respuestas Registradas
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Visualice y exporte el listado completo de respuestas recibidas en las encuestas publicadas.
              </p>
            </div>

            <button
              onClick={handleExportExcelResponses}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md cursor-pointer shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel (Estandarizado)</span>
            </button>
          </div>

          <div className="space-y-4">
            {encuestas.map(enc => {
              const responses = builderEncuestasService.getRespuestas(empresaId, enc.id);

              return (
                <div key={enc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-slate-400">{enc.codigo}</span>
                      <h4 className="text-xs font-extrabold text-slate-900">{enc.titulo}</h4>
                    </div>

                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-full border border-indigo-100">
                      {responses.length} respuestas
                    </span>
                  </div>

                  {responses.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">Sin respuestas registradas para esta encuesta.</p>
                  ) : (
                    <div className="space-y-2">
                      {responses.map((resp: any, idx: number) => (
                        <div key={resp.id || idx} className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900">{resp.usuarioNombre || 'Colaborador'}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              Doc: {resp.usuarioIdentificacion || 'N/A'} | Versión: {resp.versionLabel || 'v1.0'} | {resp.fechaRespuesta}
                            </span>
                          </div>

                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            ✓ Guardado
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. CALIDAD DE DATOS */}
      {activeTab === 'calidad' && (
        <SurveyDataQuality empresaId={empresaId} encuestas={encuestas} />
      )}

      {/* 5B. MOTOR DE CALIDAD DE DATOS PROMPT 29 */}
      {activeTab === 'calidadP29' && (
        <Prompt29DataQualityPanel />
      )}

      {/* 5C. SUITE DE PRUEBAS AUTOMATIZADAS PROMPT 29 */}
      {activeTab === 'pruebas29' && (
        <Prompt29TestRunnerPanel />
      )}

      {/* 5D. MOTOR CENTRAL DE INDICADORES PROMPT 30 */}
      {activeTab === 'indicadoresP30' && (
        <Prompt30IndicatorPanel
          companyName={empresaId}
          period="2026-P1"
          indicators={IndicatorEngine.calculateAll({
            companyId: empresaId,
            period: '2026-P1'
          })}
        />
      )}

      {/* 5E. SUITE DE 13 PRUEBAS AUTOMATIZADAS PROMPT 30 */}
      {activeTab === 'pruebas30' && (
        <Prompt30TestRunnerPanel />
      )}

      {/* 6. RESULTADOS & ANALYTICS */}
      {activeTab === 'resultados' && selectedEncuesta && (
        <SurveyAnalytics
          encuesta={selectedEncuesta}
          empresaId={empresaId}
          onBack={() => setActiveTab('activas')}
        />
      )}
      {activeTab === 'resultados' && !selectedEncuesta && (
        <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 space-y-3">
          <BarChart3 className="w-10 h-10 text-indigo-400 mx-auto" />
          <h3 className="text-xs font-bold text-slate-800">Seleccione una encuesta</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Vaya a la pestaña "Encuestas Activas" y presione "Resultados" en la encuesta que desee analizar.
          </p>
        </div>
      )}

      {/* 7. SUITE DE PRUEBAS AUTOMATIZADAS PROMPT 22 */}
      {activeTab === 'pruebas' && (
        <Prompt22TestRunnerPanel />
      )}

      {/* 7B. SUITE DE PRUEBAS AUTOMATIZADAS PROMPT 24 */}
      {activeTab === 'pruebas24' && (
        <Prompt24TestRunnerPanel />
      )}

      {/* 7C. SUITE DE PRUEBAS AUTOMATIZADAS PROMPT 25 */}
      {activeTab === 'pruebas25' && (
        <Prompt25TestRunnerPanel />
      )}

      {/* 7G. FORMULARIO ENCUESTA MAESTRA PROMPT 27 */}
      {activeTab === 'encuestaMaestra' && (
        <MasterSurveyForm companyId={empresaId} />
      )}

      {/* 7H. BANCO DE PREGUNTAS Y DICCIONARIO PROMPT 27 */}
      {activeTab === 'bancoPreguntasP27' && (
        <MasterSurveyQuestionBankManager companyId={empresaId} />
      )}

      {/* 7J. ADMINISTRACIÓN MULTIEMPRESA PROMPT 28 */}
      {activeTab === 'adminP28' && (
        <CompanyAdminPanel
          currentCompanyId={empresaId}
        />
      )}

      {/* 7K. SUITE DE PRUEBAS AUTOMATIZADAS PROMPT 28 */}
      {activeTab === 'pruebas28' && (
        <Prompt28TestRunnerPanel />
      )}

      {/* 7I. SUITE DE PRUEBAS AUTOMATIZADAS PROMPT 27 */}
      {activeTab === 'pruebas27' && (
        <Prompt27TestRunnerPanel />
      )}

      {/* 7E. PANEL DE VALIDACIÓN DE DATOS PROMPT 26 */}
      {activeTab === 'validacionP26' && (
        <SurveyValidationPanel
          companyId={empresaId}
          periodId="2026-P1"
          onGenerateOfficialReport={(validatedRes) => {
            alert(`¡Informe Oficial Generado Exitosamente! Estado: ${validatedRes.surveyStatus}. Código de Validación: ${validatedRes.validationId}`);
          }}
          onGeneratePreliminaryReport={(validatedRes) => {
            alert(`¡Informe Preliminar Generado! Marca de agua aplicada: ${validatedRes.reportReadiness.watermarkText}`);
          }}
          onOpenCatalogAdmin={() => {
            setActiveTab('configuracion');
          }}
        />
      )}

      {/* 7F. SUITE DE PRUEBAS AUTOMATIZADAS PROMPT 26 */}
      {activeTab === 'pruebas26' && (
        <Prompt26TestRunnerPanel />
      )}

      {/* 7D. PANEL DE TRAZABILIDAD Y EVIDENCIA PROMPT 25 */}
      {activeTab === 'trazabilidad' && (
        <IndicatorTraceabilityPanel
          companyId={empresaId}
          periodId="2026-P1"
          traces={[
            EvidenceService.buildIndicatorTrace({
              indicatorId: 'IND-HIJOS-01',
              indicatorName: 'Proporción de Colaboradores con Hijos',
              companyId: empresaId,
              periodId: '2026-P1',
              sourceType: 'SURVEY',
              sourceQuestionId: 'tieneHijos',
              responsesList: [
                { responses: { tieneHijos: { value: 'Sí', responseStatus: 'ANSWERED' } } },
                { responses: { tieneHijos: { value: 'Sí', responseStatus: 'ANSWERED' } } },
                { responses: { tieneHijos: { value: 'No', responseStatus: 'NO' } } },
                { responses: { tieneHijos: { value: 'No', responseStatus: 'NO' } } },
                { responses: { tieneHijos: { value: null, responseStatus: 'PREFER_NOT_TO_ANSWER' } } }
              ],
              isPositiveValue: (v) => v === 'Sí'
            }),
            EvidenceService.calculateIMC(70, 172).trace,
            EvidenceService.buildIndicatorTrace({
              indicatorId: 'IND-ALERGIAS-02',
              indicatorName: 'Prevalencia de Afecciones Alérgicas',
              companyId: empresaId,
              periodId: '2026-P1',
              sourceType: 'SURVEY',
              sourceQuestionId: 'presentaAlergias',
              responsesList: [
                { responses: { presentaAlergias: { value: 'No', responseStatus: 'NO' } } },
                { responses: { presentaAlergias: { value: 'No', responseStatus: 'NO' } } },
                { responses: { presentaAlergias: { value: 'Sí', responseStatus: 'ANSWERED' } } }
              ],
              isPositiveValue: (v) => v === 'Sí'
            }),
            EvidenceService.buildIndicatorTrace({
              indicatorId: 'IND-DISCAPACIDAD-03',
              indicatorName: 'Proporción de Colaboradores con Discapacidad',
              companyId: empresaId,
              periodId: '2026-P1',
              sourceType: 'SURVEY',
              sourceQuestionId: 'presentaDiscapacidad',
              responsesList: []
            })
          ]}
        />
      )}

      {/* 8. SURVEY EDITOR VIEW */}
      {activeTab === 'editor' && selectedEncuesta && (
        <SurveyEditor
          encuesta={selectedEncuesta}
          onSave={handleSaveFromEditor}
          onCancel={() => setActiveTab('activas')}
          onPreview={(enc) => {
            setSelectedEncuesta(enc);
            setActiveTab('preview');
          }}
        />
      )}

      {/* 9. SURVEY PREVIEW / TEST EXECUTION VIEW */}
      {activeTab === 'preview' && selectedEncuesta && (
        <SurveyPreview
          encuesta={selectedEncuesta}
          empresaId={empresaId}
          onBack={() => setActiveTab('activas')}
          isTestMode={true}
        />
      )}

    </div>
  );
}
