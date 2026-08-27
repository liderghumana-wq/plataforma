import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Building2, 
  CheckCircle2, 
  Layers, 
  ListTodo, 
  Award, 
  Bot, 
  Compass, 
  Database,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { saasService } from '../administracion_saas/services/saasService';
import { CompanyTenant } from '../administracion_saas/types/saas.types';
import { WelcomeStep } from './components/WelcomeStep';
import { CompanySetupStep } from './components/CompanySetupStep';
import { OrgStructureStep } from './components/OrgStructureStep';
import { EmployeesSetupStep } from './components/EmployeesSetupStep';
import { DataQualityStep } from './components/DataQualityStep';
import { SurveyStep } from './components/SurveyStep';
import { IndicatorsStep } from './components/IndicatorsStep';
import { ActivationChecklist } from './components/ActivationChecklist';
import { HealthScoreView } from './components/HealthScoreView';
import { TasksCenterView } from './components/TasksCenterView';
import { ImplementationStagesView } from './components/ImplementationStagesView';
import { ActivationDashboardView } from './components/ActivationDashboardView';
import { OnboardingAssistant } from './components/OnboardingAssistant';
import { onboardingService } from './services/onboardingService';

interface OnboardingModuleProps {
  onNavigateSection?: (sectionId: string) => void;
  activeCompanyId?: string;
  onCompanyChange?: (companyId: string) => void;
}

type MainTab = 'dashboard' | 'flow' | 'checklist' | 'health' | 'tasks' | 'stages' | 'assistant';

export const OnboardingModule: React.FC<OnboardingModuleProps> = ({
  onNavigateSection,
  activeCompanyId: initialCompanyId,
  onCompanyChange
}) => {
  const [tenants, setTenants] = useState<CompanyTenant[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    initialCompanyId || 'demo-company'
  );
  const [activeTab, setActiveTab] = useState<MainTab>('dashboard');
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Load tenants
  useEffect(() => {
    const list = saasService.getTenants();
    setTenants(list);
    if (!initialCompanyId && list.length > 0) {
      setSelectedCompanyId(list[0].id);
    }
  }, [initialCompanyId]);

  const activeTenant = tenants.find(t => t.id === selectedCompanyId) || tenants[0];
  const companyName = activeTenant ? (activeTenant.razonSocial || activeTenant.nombreComercial) : 'Empresa Principal';

  const handleCompanySelect = (newId: string) => {
    setSelectedCompanyId(newId);
    if (onCompanyChange) onCompanyChange(newId);
  };

  const handleNavigateStep = (stepNumber: number) => {
    setCurrentStep(stepNumber);
    setActiveTab('flow');
  };

  const healthScore = onboardingService.getHealthScore(selectedCompanyId);

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Header & Tenant Selector */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Experiencia de Cliente & Onboarding
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Centro de Activación Empresarial
          </h1>
          <p className="text-sm text-slate-500">
            Puesta en marcha asistida, calidad de censo y preparación analítica para SG-SST
          </p>
        </div>

        {/* Tenant Picker & Storage Notice */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCompanyId}
              onChange={(e) => handleCompanySelect(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
            >
              {tenants.map(t => (
                <option key={t.id} value={t.id}>
                  {t.razonSocial || t.nombreComercial} ({t.id})
                </option>
              ))}
              {tenants.length === 0 && (
                <option value="demo-company">InnovaTech S.A.S. (demo-company)</option>
              )}
            </select>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold border border-slate-200 shrink-0">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Almacenamiento: Local</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Dashboard de Activación
        </button>

        <button
          onClick={() => setActiveTab('flow')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'flow'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" />
          Paso a Paso Guiado (Paso {currentStep}/7)
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'checklist'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          Checklist
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'health'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          Health Score ({healthScore.scoreTotal}/100)
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          Centro de Tareas
        </button>

        <button
          onClick={() => setActiveTab('stages')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'stages'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          9 Etapas de Implementación
        </button>

        <button
          onClick={() => setActiveTab('assistant')}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'assistant'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 bg-white border border-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          Asistente de Activación
        </button>
      </div>

      {/* Main Content Areas */}
      {activeTab === 'dashboard' && (
        <ActivationDashboardView
          activeCompanyId={selectedCompanyId}
          onNavigateStep={handleNavigateStep}
          onNavigateTab={(tab) => setActiveTab(tab as MainTab)}
          onNavigateSection={onNavigateSection}
        />
      )}

      {activeTab === 'checklist' && (
        <ActivationChecklist
          activeCompanyId={selectedCompanyId}
          onNavigateStep={handleNavigateStep}
          onNavigateSection={onNavigateSection}
        />
      )}

      {activeTab === 'health' && (
        <HealthScoreView
          activeCompanyId={selectedCompanyId}
          onNavigateStep={handleNavigateStep}
          onNavigateSection={onNavigateSection}
        />
      )}

      {activeTab === 'tasks' && (
        <TasksCenterView
          activeCompanyId={selectedCompanyId}
          onNavigateStep={handleNavigateStep}
          onNavigateSection={onNavigateSection}
        />
      )}

      {activeTab === 'stages' && (
        <ImplementationStagesView
          activeCompanyId={selectedCompanyId}
          onNavigateStep={handleNavigateStep}
          onNavigateSection={onNavigateSection}
        />
      )}

      {activeTab === 'assistant' && (
        <OnboardingAssistant
          activeCompanyId={selectedCompanyId}
          onNavigateStep={handleNavigateStep}
          onNavigateSection={onNavigateSection}
        />
      )}

      {activeTab === 'flow' && (
        <div className="space-y-6">
          {/* Steps Progress Indicator */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-3">
              <span>Ruta de Configuración Paso a Paso</span>
              <span className="text-indigo-600">Paso {currentStep} de 7</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {[
                { step: 1, title: 'Bienvenida' },
                { step: 2, title: 'Empresa' },
                { step: 3, title: 'Estructura' },
                { step: 4, title: 'Colaboradores' },
                { step: 5, title: 'Calidad' },
                { step: 6, title: 'Encuesta' },
                { step: 7, title: 'Indicadores' },
              ].map((s) => (
                <button
                  key={s.step}
                  onClick={() => setCurrentStep(s.step)}
                  className={`p-2 rounded-xl text-center transition-all cursor-pointer ${
                    currentStep === s.step
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : currentStep > s.step
                      ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[11px] truncate">{s.step}. {s.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Render Active Step */}
          {currentStep === 1 && (
            <WelcomeStep
              companyName={companyName}
              onStart={() => setCurrentStep(2)}
              onGoToDashboard={() => setActiveTab('dashboard')}
            />
          )}

          {currentStep === 2 && (
            <CompanySetupStep
              activeCompanyId={selectedCompanyId}
              onNext={() => setCurrentStep(3)}
              onPrev={() => setCurrentStep(1)}
            />
          )}

          {currentStep === 3 && (
            <OrgStructureStep
              activeCompanyId={selectedCompanyId}
              onNext={() => setCurrentStep(4)}
              onPrev={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 4 && (
            <EmployeesSetupStep
              activeCompanyId={selectedCompanyId}
              onNext={() => setCurrentStep(5)}
              onPrev={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 5 && (
            <DataQualityStep
              activeCompanyId={selectedCompanyId}
              onNext={() => setCurrentStep(6)}
              onPrev={() => setCurrentStep(4)}
            />
          )}

          {currentStep === 6 && (
            <SurveyStep
              activeCompanyId={selectedCompanyId}
              onNext={() => setCurrentStep(7)}
              onPrev={() => setCurrentStep(5)}
              onNavigateToSurvey={() => {
                if (onNavigateSection) onNavigateSection('encuesta');
              }}
            />
          )}

          {currentStep === 7 && (
            <IndicatorsStep
              activeCompanyId={selectedCompanyId}
              onPrev={() => setCurrentStep(6)}
              onGoToDashboard={() => setActiveTab('dashboard')}
              onNavigateToIndicators={() => {
                if (onNavigateSection) onNavigateSection('indicadores');
              }}
            />
          )}
        </div>
      )}

      {/* Future Architecture Notice Footer */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-slate-400" />
          <span>
            <strong>Arquitectura de Datos:</strong> Aislamiento por Tenant en almacenamiento local.
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          [ARQUITECTURA FUTURA]: Conectores nativos a Cloud SQL PostgreSQL y sincronización en tiempo real.
        </span>
      </div>
    </div>
  );
};
