import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  UserPlus, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft,
  Users,
  ShieldCheck,
  RefreshCw,
  Plus
} from 'lucide-react';
import { downloadExcelTemplate } from '../../../utils/excelTemplateGenerator';
import { ValidadorExcelModule } from '../../validador_excel';
import { onboardingService } from '../services/onboardingService';
import { masterDataModelService } from '../../../core/master_data_model/service';
import { ColaboradorMaster } from '../../../core/master_data_model/types';

interface EmployeesSetupStepProps {
  onNext: () => void;
  onPrev: () => void;
  activeCompanyId: string;
}

export const EmployeesSetupStep: React.FC<EmployeesSetupStepProps> = ({ onNext, onPrev, activeCompanyId }) => {
  const [activeTab, setActiveTab] = useState<'excel' | 'manual'>('excel');
  const colaboradores = onboardingService.getCompanyColaboradores(activeCompanyId);

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    numeroIdentificacion: '',
    tipoIdentificacion: 'CC',
    nombres: '',
    apellidos: '',
    genero: 'Femenino',
    fechaNacimiento: '',
    correoCorporativo: '',
    celular: '',
    fechaIngreso: '',
    sede: 'Sede Bogotá Principal',
    area: 'Operaciones',
    cargo: 'Analista'
  });

  const [manualSuccess, setManualSuccess] = useState<string | null>(null);
  const [manualError, setManualError] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.numeroIdentificacion.trim() || !manualForm.nombres.trim() || !manualForm.apellidos.trim()) {
      setManualError('Cédula, Nombres y Apellidos son campos obligatorios.');
      return;
    }

    try {
      const newColab: Partial<ColaboradorMaster> = {
        id: `colab_${Date.now()}`,
        companyId: activeCompanyId,
        numeroIdentificacion: manualForm.numeroIdentificacion.trim(),
        tipoIdentificacion: manualForm.tipoIdentificacion as any,
        nombres: manualForm.nombres.trim(),
        apellidos: manualForm.apellidos.trim(),
        genero: manualForm.genero as any,
        fechaNacimiento: manualForm.fechaNacimiento || undefined,
        correoCorporativo: manualForm.correoCorporativo.trim() || undefined,
        celular: manualForm.celular.trim() || undefined,
        fechaIngreso: manualForm.fechaIngreso || undefined,
        isActive: true,
        deletedAt: null
      };

      masterDataModelService.upsertEntity<ColaboradorMaster>('COLABORADORES', newColab, 'usr_onboarding');
      setManualSuccess(`Colaborador ${manualForm.nombres} ${manualForm.apellidos} registrado exitosamente.`);
      setManualError(null);
      setManualForm({
        numeroIdentificacion: '',
        tipoIdentificacion: 'CC',
        nombres: '',
        apellidos: '',
        genero: 'Femenino',
        fechaNacimiento: '',
        correoCorporativo: '',
        celular: '',
        fechaIngreso: '',
        sede: 'Sede Bogotá Principal',
        area: 'Operaciones',
        cargo: 'Analista'
      });
      setTimeout(() => setManualSuccess(null), 4000);
    } catch (err) {
      console.error('Error saving individual collaborator:', err);
      setManualError('Error al guardar el colaborador en la base de datos.');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Paso 4 de 7 • Censo Poblacional
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Configuración de Colaboradores</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Carga el censo de trabajadores mediante la plantilla oficial en Excel o registra colaboradores individualmente.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
            <Users className="w-3.5 h-3.5" />
            {colaboradores.length} Registrados
          </span>
          <span className="inline-flex items-center px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
            [A] Real
          </span>
        </div>
      </div>

      {/* Alternative Selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('excel')}
          className={`flex-1 p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-4 ${
            activeTab === 'excel'
              ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
            activeTab === 'excel' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Opción A: Cargar Plantilla Excel</h4>
            <p className="text-xs text-slate-500 mt-0.5">Importación masiva con validación automática de tipos y duplicados.</p>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-4 ${
            activeTab === 'manual'
              ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
            activeTab === 'manual' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Opción B: Registro Manual Controlado</h4>
            <p className="text-xs text-slate-500 mt-0.5">Alta individual de colaboradores para pruebas o plantas reducidas.</p>
          </div>
        </button>
      </div>

      {/* Option A: Excel Upload & Validation */}
      {activeTab === 'excel' && (
        <div className="space-y-6">
          {/* Download Template Banner */}
          <div className="p-4 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-950">Descargar Plantilla Oficial de Colaboradores</h4>
                <p className="text-xs text-emerald-700">Formato preconfigurado con validación de columnas y formatos requeridos.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => downloadExcelTemplate()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              Descargar .XLSX
            </button>
          </div>

          {/* Embedded Validator Module Engine (Sin modificar lógica existente) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Validador de Archivo Excel</h3>
            <p className="text-xs text-slate-500">
              Arrastra tu archivo Excel. El motor evaluará columnas reconocidas, cédulas duplicadas, rangos atípicos y campos obligatorios.
            </p>
            <ValidadorExcelModule />
          </div>
        </div>
      )}

      {/* Option B: Manual Individual Form */}
      {activeTab === 'manual' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Formulario de Registro Individual</h3>
            <p className="text-xs text-slate-500 mt-0.5">Ingresa los datos del colaborador para agregarlo al censo maestro.</p>
          </div>

          {manualError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{manualError}</span>
            </div>
          )}

          {manualSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{manualSuccess}</span>
            </div>
          )}

          <form onSubmit={handleManualSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tipo de Identificación
              </label>
              <select
                value={manualForm.tipoIdentificacion}
                onChange={(e) => setManualForm({ ...manualForm, tipoIdentificacion: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="PEP">Permiso Especial de Permanencia (PEP)</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Número de Cédula / Documento <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={manualForm.numeroIdentificacion}
                onChange={(e) => setManualForm({ ...manualForm, numeroIdentificacion: e.target.value })}
                placeholder="Ej. 1018432901"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Nombres <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={manualForm.nombres}
                onChange={(e) => setManualForm({ ...manualForm, nombres: e.target.value })}
                placeholder="Ej. Carlos Eduardo"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Apellidos <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={manualForm.apellidos}
                onChange={(e) => setManualForm({ ...manualForm, apellidos: e.target.value })}
                placeholder="Ej. Gómez Méndez"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Sexo / Género
              </label>
              <select
                value={manualForm.genero}
                onChange={(e) => setManualForm({ ...manualForm, genero: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no responder">Prefiero no responder</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={manualForm.fechaNacimiento}
                onChange={(e) => setManualForm({ ...manualForm, fechaNacimiento: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Correo Corporativo
              </label>
              <input
                type="email"
                value={manualForm.correoCorporativo}
                onChange={(e) => setManualForm({ ...manualForm, correoCorporativo: e.target.value })}
                placeholder="colaborador@empresa.com"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Fecha de Ingreso
              </label>
              <input
                type="date"
                value={manualForm.fechaIngreso}
                onChange={(e) => setManualForm({ ...manualForm, fechaIngreso: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Registrar Colaborador en Maestro
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Estructura
        </button>

        <button
          type="button"
          onClick={onNext}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          Siguiente: Calidad de Datos
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
