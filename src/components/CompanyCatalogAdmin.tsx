import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  Building,
  Briefcase,
  Layers,
  Laptop,
  Save,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import {
  getCompanySurveyConfiguration,
  saveCompanySurveyConfiguration,
  CompanySurveyConfiguration,
  CatalogItemOption
} from '../modules/constructor_encuestas/prompt21Engine';

interface CompanyCatalogAdminProps {
  companyId: string;
  companyName: string;
  onConfigurationSaved?: (config: CompanySurveyConfiguration) => void;
}

export function CompanyCatalogAdmin({ companyId, companyName, onConfigurationSaved }: CompanyCatalogAdminProps) {
  const [config, setConfig] = useState<CompanySurveyConfiguration>(() =>
    getCompanySurveyConfiguration(companyId, companyName)
  );

  const [activeTab, setActiveTab] = useState<'sedes' | 'areas' | 'proyectos' | 'cargos' | 'tiposContrato' | 'modalidadesTrabajo'>('sedes');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [newItemCode, setNewItemCode] = useState('');
  const [isSavedToast, setIsSavedToast] = useState(false);

  const catalogLabels: Record<string, string> = {
    sedes: 'Sedes',
    areas: 'Áreas',
    proyectos: 'Proyectos / Campañas',
    cargos: 'Cargos',
    tiposContrato: 'Tipos de Contrato',
    modalidadesTrabajo: 'Modalidades de Trabajo'
  };

  const currentList: CatalogItemOption[] = config.catalogs[activeTab] || [];

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemLabel.trim()) return;

    const newItem: CatalogItemOption = {
      id: `${activeTab.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      label: newItemLabel.trim(),
      code: newItemCode.trim().toUpperCase() || undefined,
      active: true
    };

    const updatedConfig: CompanySurveyConfiguration = {
      ...config,
      catalogs: {
        ...config.catalogs,
        [activeTab]: [...currentList, newItem]
      }
    };

    setConfig(updatedConfig);
    setNewItemLabel('');
    setNewItemCode('');
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedList = currentList.filter(item => item.id !== itemId);
    const updatedConfig: CompanySurveyConfiguration = {
      ...config,
      catalogs: {
        ...config.catalogs,
        [activeTab]: updatedList
      }
    };
    setConfig(updatedConfig);
  };

  const handleToggleItemActive = (itemId: string) => {
    const updatedList = currentList.map(item =>
      item.id === itemId ? { ...item, active: !item.active } : item
    );
    const updatedConfig: CompanySurveyConfiguration = {
      ...config,
      catalogs: {
        ...config.catalogs,
        [activeTab]: updatedList
      }
    };
    setConfig(updatedConfig);
  };

  const handleSaveAll = () => {
    saveCompanySurveyConfiguration(config);
    if (onConfigurationSaved) onConfigurationSaved(config);
    setIsSavedToast(true);
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-2xs space-y-6 text-left select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Building2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Parametrización Empresarial</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 font-display flex items-center gap-2">
            <span>Administrador de Catálogos Exclusivos</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Configure las sedes, áreas, proyectos, cargos y tipos de contrato para <strong className="text-slate-800">{companyName}</strong>. La encuesta y los dashboards usarán únicamente estas opciones parametrizadas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isSavedToast && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Configuración Guardada</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveAll}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/20 hover:shadow-emerald-500/30 transition-all cursor-pointer flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </div>

      {/* Catalog Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100">
        {(['sedes', 'areas', 'proyectos', 'cargos', 'tiposContrato', 'modalidadesTrabajo'] as const).map((tab) => {
          const isActive = activeTab === tab;
          const count = (config.catalogs[tab] || []).length;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{catalogLabels[tab]}</span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Info notice */}
      <div className="p-3.5 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-start gap-3 text-xs text-indigo-900 font-medium">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Las opciones configuradas aquí para <strong>{catalogLabels[activeTab]}</strong> aparecerán inmediatamente en la encuesta sociodemográfica de la empresa. No hay listas fijas hardcodeadas en la plataforma.
        </p>
      </div>

      {/* Add New Item Form */}
      <form onSubmit={handleAddItem} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder={`Nombre de la opción (ej. Sede ${catalogLabels[activeTab]} 1)`}
            value={newItemLabel}
            onChange={(e) => setNewItemLabel(e.target.value)}
            className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          />
        </div>
        <div className="w-full md:w-36">
          <input
            type="text"
            placeholder="Código (opcional)"
            value={newItemCode}
            onChange={(e) => setNewItemCode(e.target.value)}
            className="w-full bg-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold uppercase"
          />
        </div>
        <button
          type="submit"
          className="w-full md:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Opciones</span>
        </button>
      </form>

      {/* Current Items List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 px-2">
          <span>Opciones Registradas para {catalogLabels[activeTab]}</span>
          <span>Estado / Acción</span>
        </div>

        {currentList.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            No hay opciones registradas en este catálogo. Agregue la primera opción arriba.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {currentList.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                  <div className="truncate">
                    <span className="text-xs font-extrabold text-slate-800 block truncate">{item.label}</span>
                    {item.code && (
                      <span className="text-[10px] font-mono text-slate-400 font-bold bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {item.code}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleItemActive(item.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer transition-all ${
                      item.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.active ? 'ACTIVO' : 'INACTIVO'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    title="Eliminar opción"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
