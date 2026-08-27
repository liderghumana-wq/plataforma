import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  FolderTree, 
  Briefcase, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  ArrowRight, 
  ArrowLeft,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { catalogosService } from '../../configuracion/catalogos.service';

interface OrgStructureStepProps {
  onNext: () => void;
  onPrev: () => void;
  activeCompanyId: string;
}

type TabType = 'sedes' | 'areas' | 'centros' | 'proyectos';

export const OrgStructureStep: React.FC<OrgStructureStepProps> = ({ onNext, onPrev, activeCompanyId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('sedes');
  const [catalogs, setCatalogs] = useState<{
    sedes: string[];
    areas: string[];
    centros: string[];
    proyectos: string[];
  }>({
    sedes: [],
    areas: [],
    centros: [],
    proyectos: []
  });

  const [newItemName, setNewItemName] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadCatalogs = () => {
    const data = catalogosService.getCatalogsSync(activeCompanyId);
    const extractNames = (list: any[]): string[] => {
      if (!Array.isArray(list)) return [];
      return list.map(item => (typeof item === 'string' ? item : item?.nombre || '')).filter(Boolean);
    };

    setCatalogs({
      sedes: extractNames(data.sedes).length > 0 ? extractNames(data.sedes) : ['Sede Bogotá Principal', 'Sede Medellín', 'Sede Cali'],
      areas: extractNames(data.areas).length > 0 ? extractNames(data.areas) : ['Tecnología', 'Operaciones', 'Gestión Humana', 'Comercial'],
      centros: extractNames(data.centrosTrabajo).length > 0 ? extractNames(data.centrosTrabajo) : ['Centro Administrativo', 'Centro Operativo'],
      proyectos: extractNames(data.proyectos).length > 0 ? extractNames(data.proyectos) : ['SG-SST Corporativo', 'Operación BPO 2026']
    });
  };

  useEffect(() => {
    loadCatalogs();
  }, [activeCompanyId]);

  const getCurrentList = (): string[] => {
    return catalogs[activeTab] || [];
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newItemName.trim();
    if (!cleanName) return;

    const currentList = getCurrentList();
    if (currentList.some(item => item.toLowerCase() === cleanName.toLowerCase())) {
      setErrorMsg(`El elemento "${cleanName}" ya existe en el catálogo.`);
      return;
    }

    const updatedList = [...currentList, cleanName];
    saveUpdatedList(updatedList);
    setNewItemName('');
    setErrorMsg(null);
    setSuccessMsg(`"${cleanName}" agregado con éxito.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleDeleteItem = (index: number) => {
    const currentList = getCurrentList();
    const itemToDelete = currentList[index];
    const updatedList = currentList.filter((_, i) => i !== index);
    saveUpdatedList(updatedList);
    setSuccessMsg(`"${itemToDelete}" eliminado.`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleStartEdit = (index: number, val: string) => {
    setEditingIndex(index);
    setEditingValue(val);
    setErrorMsg(null);
  };

  const handleSaveEdit = (index: number) => {
    const cleanVal = editingValue.trim();
    if (!cleanVal) return;

    const currentList = getCurrentList();
    if (currentList.some((item, i) => i !== index && item.toLowerCase() === cleanVal.toLowerCase())) {
      setErrorMsg(`Ya existe otro elemento con el nombre "${cleanVal}".`);
      return;
    }

    const updatedList = [...currentList];
    updatedList[index] = cleanVal;
    saveUpdatedList(updatedList);
    setEditingIndex(null);
    setEditingValue('');
    setErrorMsg(null);
  };

  const saveUpdatedList = (newList: string[]) => {
    const updated = { ...catalogs, [activeTab]: newList };
    setCatalogs(updated);

    const currentAll = catalogosService.getCatalogsSync(activeCompanyId);
    const toCatalogoItems = (names: string[], prefix: string) => {
      return names.map((name, idx) => ({
        id: `cat_${prefix.toLowerCase()}_${idx + 1}`,
        codigo: `${prefix}-${(idx + 1).toString().padStart(3, '0')}`,
        nombre: name,
        descripcion: name,
        orden: idx + 1,
        activo: true,
        companyId: activeCompanyId,
        esPersonalizado: true,
        fechaCreacion: new Date().toISOString()
      }));
    };

    const updatedFullCatalogs = {
      ...currentAll,
      sedes: activeTab === 'sedes' ? toCatalogoItems(newList, 'SED') : currentAll.sedes,
      areas: activeTab === 'areas' ? toCatalogoItems(newList, 'ARE') : currentAll.areas,
      centrosTrabajo: activeTab === 'centros' ? toCatalogoItems(newList, 'CTR') : currentAll.centrosTrabajo,
      proyectos: activeTab === 'proyectos' ? toCatalogoItems(newList, 'PRY') : currentAll.proyectos
    };

    catalogosService.saveCatalogs(activeCompanyId, updatedFullCatalogs);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Paso 3 de 7 • Catálogos Organizacionales
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Estructura Organizacional</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Configura las sedes, áreas y centros de trabajo para clasificar a los colaboradores sin errores ortográficos.
          </p>
        </div>

        <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
          [A] Catálogos Reales
        </span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => { setActiveTab('sedes'); setEditingIndex(null); setErrorMsg(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'sedes' 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Sedes ({catalogs.sedes.length})
        </button>

        <button
          onClick={() => { setActiveTab('areas'); setEditingIndex(null); setErrorMsg(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'areas' 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          Áreas / Deptos ({catalogs.areas.length})
        </button>

        <button
          onClick={() => { setActiveTab('centros'); setEditingIndex(null); setErrorMsg(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'centros' 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Centros de Trabajo ({catalogs.centros.length})
        </button>

        <button
          onClick={() => { setActiveTab('proyectos'); setEditingIndex(null); setErrorMsg(null); }}
          className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
            activeTab === 'proyectos' 
              ? 'bg-indigo-600 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          Proyectos / Cuentas ({catalogs.proyectos.length})
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {/* Add Input Form */}
        <form onSubmit={handleAddItem} className="flex gap-3">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder={`Nombre del nuevo registro para ${activeTab}...`}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!newItemName.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Agregar
          </button>
        </form>

        {/* List of Items */}
        <div className="space-y-2">
          {getCurrentList().length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
              No hay elementos registrados en esta categoría. Agrega al menos uno para habilitar la clasificación.
            </div>
          ) : (
            getCurrentList().map((item, idx) => (
              <div 
                key={`${item}-${idx}`} 
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 transition-colors"
              >
                {editingIndex === idx ? (
                  <div className="flex items-center gap-2 flex-1 mr-3">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-white border border-indigo-400 rounded-lg text-sm text-slate-900 focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(idx)}
                      className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 cursor-pointer"
                      title="Guardar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingIndex(null)}
                      className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 cursor-pointer"
                      title="Cancelar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{item}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(idx, item)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Navigation Footer */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Empresa
          </button>

          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Siguiente: Colaboradores
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
