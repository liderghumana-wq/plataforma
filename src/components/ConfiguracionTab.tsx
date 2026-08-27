import React, { useState } from 'react';
import { 
  Settings, 
  RefreshCw, 
  Sliders, 
  Database, 
  Check, 
  User, 
  Clock, 
  Percent,
  Smile
} from 'lucide-react';
import { DemographicsData } from '../types';

interface ConfiguracionTabProps {
  data: DemographicsData | null;
  onUpdateData: (newData: Partial<DemographicsData>) => void;
  onRestoreData: () => void;
}

export default function ConfiguracionTab({ 
  data, 
  onUpdateData, 
  onRestoreData 
}: ConfiguracionTabProps) {
  
  const [employees, setEmployees] = useState(data?.totalEmployees || 0);
  const [age, setAge] = useState(data?.averageAge || 0);
  const [seniority, setSeniority] = useState(data?.averageSeniority || 0);
  const [children, setChildren] = useState(data?.hasChildrenPercentage || 0);
  const [absenteeism, setAbsenteeism] = useState(data?.absenteeismRate || 0);
  const [wellbeing, setWellbeing] = useState(data?.wellbeingIndex || 0);
  
  const [showSaved, setShowSaved] = useState(false);

  React.useEffect(() => {
    if (data) {
      setEmployees(data.totalEmployees);
      setAge(data.averageAge);
      setSeniority(data.averageSeniority);
      setChildren(data.hasChildrenPercentage);
      setAbsenteeism(data.absenteeismRate);
      setWellbeing(data.wellbeingIndex);
    }
  }, [data]);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-3xl border border-slate-200">
        <Settings className="w-12 h-12 text-slate-400 mb-4 animate-bounce" />
        <h3 className="text-lg font-black text-slate-900 font-display">Esperando base de datos</h3>
        <p className="text-xs text-slate-500 font-semibold max-w-sm mt-1">Por favor, carga el archivo Excel sociodemográfico para ajustar sus parámetros.</p>
      </div>
    );
  }

  const handleSave = () => {
    onUpdateData({
      totalEmployees: Number(employees),
      averageAge: Number(age),
      averageSeniority: Number(seniority),
      hasChildrenPercentage: Number(children),
      absenteeismRate: Number(absenteeism),
      wellbeingIndex: Number(wellbeing)
    });
    
    setShowSaved(true);
    setTimeout(() => {
      setShowSaved(false);
    }, 2500);
  };

  const handleReset = () => {
    onRestoreData();
    // Actualizar estados locales de sliders
    setTimeout(() => {
      setEmployees(1240);
      setAge(27.8);
      setSeniority(2.1);
      setChildren(42);
      setAbsenteeism(2.3);
      setWellbeing(83.4);
    }, 100);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Toast Guardado */}
      {showSaved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 shadow-md animate-fade-in">
          <Check className="w-5 h-5 font-black shrink-0" />
          <div className="text-xs">
            <span className="font-bold">¡Parámetros del Sistema Guardados!</span> Los dashboards y los motores de IA reflejarán este nuevo perfil sociodemográfico inmediatamente.
          </div>
        </div>
      )}

      {/* Panel de Configuración General */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Simulador y Configuración Sociodemográfica</h3>
              <p className="text-xs text-slate-500">Modifica los parámetros para simular diferentes escenarios demográficos y de riesgo.</p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="text-xs font-bold text-red-500 hover:text-red-600 px-3 py-2 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Restaurar Valores por Defecto</span>
          </button>
        </div>

        {/* Sliders de Simulación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Total Colaboradores */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Nómina Activa (Total Colaboradores)</span>
              </span>
              <span className="text-indigo-600 font-black">{employees} emp.</span>
            </div>
            <input 
              type="range" 
              min={100} 
              max={3000} 
              step={50}
              value={employees} 
              onChange={(e) => setEmployees(Number(e.target.value))}
              className="w-full accent-indigo-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Edad Promedio */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-purple-600" />
                <span>Edad Promedio</span>
              </span>
              <span className="text-purple-600 font-black">{age} años</span>
            </div>
            <input 
              type="range" 
              min={18} 
              max={55} 
              step={0.5}
              value={age} 
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full accent-purple-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Antigüedad Promedio */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-cyan-600" />
                <span>Antigüedad Promedio</span>
              </span>
              <span className="text-cyan-600 font-black">{seniority} años</span>
            </div>
            <input 
              type="range" 
              min={0.5} 
              max={15} 
              step={0.1}
              value={seniority} 
              onChange={(e) => setSeniority(Number(e.target.value))}
              className="w-full accent-cyan-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Personas con Hijos */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-rose-500" />
                <span>Porcentaje de Colaboradores con Hijos</span>
              </span>
              <span className="text-rose-500 font-black">{children}%</span>
            </div>
            <input 
              type="range" 
              min={5} 
              max={95} 
              step={1}
              value={children} 
              onChange={(e) => setChildren(Number(e.target.value))}
              className="w-full accent-rose-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Ausentismo Rate */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-amber-500" />
                <span>Tasa de Ausentismo Médico</span>
              </span>
              <span className="text-amber-500 font-black">{absenteeism}%</span>
            </div>
            <input 
              type="range" 
              min={0.5} 
              max={10} 
              step={0.1}
              value={absenteeism} 
              onChange={(e) => setAbsenteeism(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Índice de Bienestar */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-700 flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-emerald-500" />
                <span>Índice de Bienestar Laboral</span>
              </span>
              <span className="text-emerald-500 font-black">{wellbeing}%</span>
            </div>
            <input 
              type="range" 
              min={40} 
              max={100} 
              step={0.5}
              value={wellbeing} 
              onChange={(e) => setWellbeing(Number(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

        </div>

        {/* Botón Guardar */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Database className="w-4 h-4" />
            <span>Aplicar Cambios Demográficos</span>
          </button>
        </div>

      </div>

    </div>
  );
}
