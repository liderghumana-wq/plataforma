import React, { useState, useEffect } from 'react';
import { 
  UserCheck, Users, HeartHandshake, Briefcase, Home, Activity, 
  Stethoscope, ShieldAlert, Smile, Brain, FileText, CheckCircle2, 
  ChevronRight, ChevronLeft, Shield, AlertTriangle, Info, Save, RotateCcw
} from 'lucide-react';
import { QuestionBankService, MASTER_MODULES } from '../questionBankService';
import { CompanySurveyConfiguration, getCompanySurveyConfiguration } from '../prompt21Engine';

interface MasterSurveyFormProps {
  companyId: string;
  onSubmitResponse?: (response: Record<string, any>) => void;
}

export const MasterSurveyForm: React.FC<MasterSurveyFormProps> = ({
  companyId,
  onSubmitResponse
}) => {
  const [activeModule, setActiveModule] = useState<number>(1);
  const [catalog, setCatalog] = useState<CompanySurveyConfiguration>(() => 
    getCompanySurveyConfiguration(companyId, `Empresa ${companyId}`)
  );

  useEffect(() => {
    setCatalog(getCompanySurveyConfiguration(companyId, `Empresa ${companyId}`));
  }, [companyId]);

  // FORM STATE
  const [formData, setFormData] = useState<Record<string, any>>({
    // Módulo 1
    tipoDocumento: 'CC',
    numeroIdentificacion: '',
    nombres: '',
    apellidos: '',
    correoElectronico: '',
    telefono: '',
    fechaNacimiento: '',
    sexo: 'Femenino',

    // Módulo 2
    estadoCivil: 'Soltero(a)',
    nivelEducativo: 'Profesional',
    ciudadResidencia: '',
    departamentoResidencia: '',
    sede: catalog.catalogs.sedes[0]?.label || 'Sede Principal',
    area: catalog.catalogs.areas[0]?.label || 'Operaciones',
    proyecto: catalog.catalogs.proyectos[0]?.label || 'Proyecto General',
    cargo: catalog.catalogs.cargos[0]?.label || 'Analista',
    estrato: '3',
    tiempoResidenciaCiudad: '1-5 años',
    zonaResidencia: 'Urbana',
    zonaResidenciaOtra: '',

    // Módulo 3
    tieneHijos: 'No',
    numeroHijos: '',
    tienePersonasACargo: 'No',
    numeroPersonasACargo: '',
    relacionPersonasACargo: [],
    relacionPersonasACargoOtra: '',

    // Módulo 4
    fechaIngreso: '',
    tipoContrato: catalog.catalogs.tiposContrato[0]?.label || 'Término Indefinido',
    jornadaLaboral: 'Tiempo Completo',
    horasTrabajoHabituales: 44,

    // Módulo 5
    tipoVivienda: 'Arrendada',
    tipoViviendaOtra: '',
    serviciosPublicosBasicos: 'Sí',
    detalleServiciosPublicos: ['Agua', 'Energía', 'Gas', 'Internet', 'Alcantarillado'],

    // Módulo 6
    saludPresentaCondicion: 'No',
    saludCualCondicion: [],
    saludCualCondicionOtra: '',

    // Módulo 7
    saludDiagnosticoDeclarado: 'No',
    saludTipoDiagnostico: [],
    saludTipoDiagnosticoOtra: '',

    // Módulo 8
    medicamentosHabituales: 'No',
    medicamentosTratamientoOpcional: '',
    alergiasPresenta: 'No',
    alergiasTipo: [],
    alergiasTipoOtra: '',
    discapacidadPresenta: 'No',
    discapacidadTipo: [],
    discapacidadTipoOtra: '',
    discapacidadRequiereAjuste: 'No',
    discapacidadDescripcionAjuste: '',
    pesoKg: '',
    estaturaCm: '',
    perimetroCintura: 'No conozco el dato',
    grupoSanguineo: 'O+',

    // Módulo 9
    molestiasOsteomusculares12M: ['Ninguna'],
    molestiasOsteomuscularesOtra: '',
    molestiasAfectoLaboral: 'No',
    molestiasAtencionMedica: 'No',
    molestiasIncapacidad: 'No',
    actividadFisicaRealiza: 'No',
    actividadFisicaFrecuencia: '1 día',
    actividadFisicaTipo: [],
    actividadFisicaTipoOtra: '',
    tiempoLibreActividades: ['Compartir con familia'],
    tiempoLibreActividadesOtra: '',
    mascotasTiene: 'No',
    mascotasCantidad: '',

    // Módulo 10
    modalidadTrabajo: catalog.catalogs.modalidadesTrabajo[0]?.label || 'Presencial',
    turnosTrabaja: 'No',
    turnosTipo: 'Diurno',
    transporteMedioPrincipal: 'Transporte público',
    transporteMedioPrincipalOtro: '',
    transporteTiempoDesplazamiento: '30-60 min',
    saludMentalBienestarGeneral: 4,
    saludMentalEquilibrioVidaTrabajo: 4,
    saludMentalCargaLaboral: 3,
    saludMentalDescanso: 4,

    // Módulo 11
    observacionesGenerales: ''
  });

  const [submitted, setSubmitted] = useState<boolean>(false);
  const [lastNormalized, setLastNormalized] = useState<Record<string, any> | null>(null);

  // Computed Age
  const calculatedAge = QuestionBankService.calculateAge(formData.fechaNacimiento);

  // Computed Seniority
  const { seniorityString } = QuestionBankService.calculateSeniority(formData.fechaIngreso);

  // Computed IMC
  const weightNum = parseFloat(formData.pesoKg);
  const heightNum = parseFloat(formData.estaturaCm);
  const { imcValue, imcCategory } = QuestionBankService.calculateIMC(weightNum, heightNum);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelectChange = (field: string, optionValue: string) => {
    setFormData(prev => {
      const currentArr: string[] = prev[field] || [];
      if (currentArr.includes(optionValue)) {
        return { ...prev, [field]: currentArr.filter(v => v !== optionValue) };
      } else {
        return { ...prev, [field]: [...currentArr, optionValue] };
      }
    });
  };

  const handleOsteomuscularChange = (optionValue: string) => {
    setFormData(prev => {
      const currentArr: string[] = prev.molestiasOsteomusculares12M || [];
      if (optionValue === 'Ninguna') {
        return { ...prev, molestiasOsteomusculares12M: ['Ninguna'] };
      }
      const withoutNinguna = currentArr.filter(v => v !== 'Ninguna');
      if (withoutNinguna.includes(optionValue)) {
        const nextArr = withoutNinguna.filter(v => v !== optionValue);
        return { ...prev, molestiasOsteomusculares12M: nextArr.length === 0 ? ['Ninguna'] : nextArr };
      } else {
        return { ...prev, molestiasOsteomusculares12M: [...withoutNinguna, optionValue] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = QuestionBankService.normalizeSurveyOrExcelData(formData, catalog);
    setLastNormalized(normalized);
    setSubmitted(true);
    if (onSubmitResponse) {
      onSubmitResponse(normalized);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setLastNormalized(null);
    setActiveModule(1);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-6 shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full uppercase tracking-wider">
              PROMPT 27 — ENCUESTA MAESTRA NORMATIVA
            </span>
            <span className="text-slate-400 text-xs font-mono">
              Version 1.0 (11 Módulos)
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Caracterización Sociodemográfica, Laboral y de Salud SG-SST
          </h2>
          <p className="text-xs text-slate-400">
            Formulario estandarizado en tiempo real. Alimenta el motor de validación, calidad de datos y trazabilidad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {submitted && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Diligenciar Nueva Encuesta</span>
            </button>
          )}
        </div>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEPPER BAR */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 overflow-x-auto scrollbar-thin">
            <div className="flex items-center gap-2 min-w-max">
              {MASTER_MODULES.map(mod => {
                const isActive = activeModule === mod.id;
                const isCompleted = activeModule > mod.id;
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setActiveModule(mod.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-lg font-black scale-105'
                        : isCompleted
                        ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? 'bg-white text-emerald-900' : isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {mod.id}
                    </span>
                    <span>{mod.shortName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* MODULE 1: IDENTIFICACIÓN Y DATOS GENERALES */}
          {activeModule === 1 && (
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <UserCheck className="w-5 h-5" />
                <span>Módulo 1: Identificación y Datos Generales</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Documento *</label>
                  <select
                    value={formData.tipoDocumento}
                    onChange={e => handleInputChange('tipoDocumento', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="Pasaporte">Pasaporte</option>
                    <option value="PEP">Permiso Especial de Permanencia (PEP)</option>
                    <option value="PPT">Permiso por Protección Temporal (PPT)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Número de Documento *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1018234567"
                    value={formData.numeroIdentificacion}
                    onChange={e => handleInputChange('numeroIdentificacion', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Ana María"
                    value={formData.nombres}
                    onChange={e => handleInputChange('nombres', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rodríguez Pérez"
                    value={formData.apellidos}
                    onChange={e => handleInputChange('apellidos', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="colaborador@empresa.com"
                    value={formData.correoElectronico}
                    onChange={e => handleInputChange('correoElectronico', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono de Contacto</label>
                  <input
                    type="text"
                    placeholder="Ej. 3001234567"
                    value={formData.telefono}
                    onChange={e => handleInputChange('telefono', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Fecha de Nacimiento *</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaNacimiento}
                    onChange={e => handleInputChange('fechaNacimiento', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Edad (Calculada Automáticamente)</label>
                  <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 flex items-center justify-between">
                    <span>{calculatedAge !== null ? `${calculatedAge} años` : 'Requiere Fecha de Nacimiento válida'}</span>
                    <Info className="w-4 h-4 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Sexo / Género *</label>
                  <select
                    value={formData.sexo}
                    onChange={e => handleInputChange('sexo', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">No Binario / Otro</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 2: INFORMACIÓN SOCIODEMOGRÁFICA */}
          {activeModule === 2 && (
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <Users className="w-5 h-5" />
                <span>Módulo 2: Información Sociodemográfica</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Estado Civil *</label>
                  <select
                    value={formData.estadoCivil}
                    onChange={e => handleInputChange('estadoCivil', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Soltero(a)">Soltero(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Unión Libre">Unión Libre</option>
                    <option value="Separado(a)">Divorciado(a) / Separado(a)</option>
                    <option value="Viudo(a)">Viudo(a)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Nivel Educativo *</label>
                  <select
                    value={formData.nivelEducativo}
                    onChange={e => handleInputChange('nivelEducativo', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Primaria">Primaria Incompleta / Completa</option>
                    <option value="Secundaria">Bachillerato / Secundaria</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Tecnólogo">Tecnólogo</option>
                    <option value="Profesional">Profesional / Pregrado</option>
                    <option value="Posgrado">Especialización / Maestría / Doctorado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Ciudad de Residencia *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Bogotá D.C."
                    value={formData.ciudadResidencia}
                    onChange={e => handleInputChange('ciudadResidencia', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Departamento de Residencia</label>
                  <input
                    type="text"
                    placeholder="Ej. Cundinamarca"
                    value={formData.departamentoResidencia}
                    onChange={e => handleInputChange('departamentoResidencia', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Sede (Parametrizada por Empresa) *</label>
                  <select
                    value={formData.sede}
                    onChange={e => handleInputChange('sede', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {catalog.catalogs.sedes.map(s => (
                      <option key={s.id} value={s.label}>{s.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Área (Parametrizada por Empresa) *</label>
                  <select
                    value={formData.area}
                    onChange={e => handleInputChange('area', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {catalog.catalogs.areas.map(a => (
                      <option key={a.id} value={a.label}>{a.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Proyecto (Parametrizado por Empresa) *</label>
                  <select
                    value={formData.proyecto}
                    onChange={e => handleInputChange('proyecto', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {catalog.catalogs.proyectos.map(p => (
                      <option key={p.id} value={p.label}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cargo (Parametrizado por Empresa) *</label>
                  <select
                    value={formData.cargo}
                    onChange={e => handleInputChange('cargo', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {catalog.catalogs.cargos.map(c => (
                      <option key={c.id} value={c.label}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Estrato Socioeconómico *</label>
                  <select
                    value={formData.estrato}
                    onChange={e => handleInputChange('estrato', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="1">Estrato 1</option>
                    <option value="2">Estrato 2</option>
                    <option value="3">Estrato 3</option>
                    <option value="4">Estrato 4</option>
                    <option value="5">Estrato 5</option>
                    <option value="6">Estrato 6</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Zona de Residencia *</label>
                  <div className="flex items-center gap-4 py-2">
                    {['Urbana', 'Rural', 'Otra'].map(z => (
                      <label key={z} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="zonaResidencia"
                          value={z}
                          checked={formData.zonaResidencia === z}
                          onChange={() => handleInputChange('zonaResidencia', z)}
                          className="accent-emerald-500"
                        />
                        <span>{z}</span>
                      </label>
                    ))}
                  </div>
                  {formData.zonaResidencia === 'Otra' && (
                    <input
                      type="text"
                      placeholder="Especifique cuál zona..."
                      value={formData.zonaResidenciaOtra}
                      onChange={e => handleInputChange('zonaResidenciaOtra', e.target.value)}
                      className="mt-2 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* MODULE 3: INFORMACIÓN FAMILIAR */}
          {activeModule === 3 && (
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <HeartHandshake className="w-5 h-5" />
                <span>Módulo 3: Información Familiar y Personas a Cargo</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">¿Tiene Hijos? *</label>
                  <div className="flex items-center gap-4">
                    {['Sí', 'No', 'Prefiero no responder'].map(opt => (
                      <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="tieneHijos"
                          value={opt}
                          checked={formData.tieneHijos === opt}
                          onChange={() => handleInputChange('tieneHijos', opt)}
                          className="accent-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.tieneHijos === 'Sí' && (
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                    <label className="block text-xs font-bold text-slate-300 mb-1">¿Cuántos hijos tiene?</label>
                    <input
                      type="number"
                      min="0"
                      max="15"
                      placeholder="Ej. 2"
                      value={formData.numeroHijos}
                      onChange={e => handleInputChange('numeroHijos', e.target.value)}
                      className="w-full md:w-48 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">¿Tiene Personas a Cargo? *</label>
                  <div className="flex items-center gap-4">
                    {['Sí', 'No', 'Prefiero no responder'].map(opt => (
                      <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="tienePersonasACargo"
                          value={opt}
                          checked={formData.tienePersonasACargo === opt}
                          onChange={() => handleInputChange('tienePersonasACargo', opt)}
                          className="accent-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.tienePersonasACargo === 'Sí' && (
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">¿Cuántas personas tiene a cargo?</label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        placeholder="Ej. 1"
                        value={formData.numeroPersonasACargo}
                        onChange={e => handleInputChange('numeroPersonasACargo', e.target.value)}
                        className="w-full md:w-48 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Parentesco de las Personas a Cargo (Selección Múltiple)</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['Hijos', 'Padres', 'Pareja', 'Otros familiares'].map(rel => (
                          <label key={rel} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg text-xs text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(formData.relacionPersonasACargo || []).includes(rel)}
                              onChange={() => handleMultiSelectChange('relacionPersonasACargo', rel)}
                              className="accent-emerald-500 rounded"
                            />
                            <span>{rel}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODULE 4: INFORMACIÓN LABORAL */}
          {activeModule === 4 && (
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <Briefcase className="w-5 h-5" />
                <span>Módulo 4: Información Laboral</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Fecha de Ingreso a la Empresa *</label>
                  <input
                    type="date"
                    required
                    value={formData.fechaIngreso}
                    onChange={e => handleInputChange('fechaIngreso', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Antigüedad Calculada Automáticamente</label>
                  <div className="w-full bg-slate-900/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 flex items-center justify-between">
                    <span>{seniorityString}</span>
                    <Info className="w-4 h-4 text-slate-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tipo de Contrato (Parametrizado por Empresa) *</label>
                  <select
                    value={formData.tipoContrato}
                    onChange={e => handleInputChange('tipoContrato', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {catalog.catalogs.tiposContrato.map(tc => (
                      <option key={tc.id} value={tc.label}>{tc.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Jornada Laboral Habitual *</label>
                  <select
                    value={formData.jornadaLaboral}
                    onChange={e => handleInputChange('jornadaLaboral', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Tiempo Completo">Tiempo Completo</option>
                    <option value="Medio Tiempo">Medio Tiempo</option>
                    <option value="Por Horas">Por Horas / Parcial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Horas de Trabajo Habituales por Semana</label>
                  <input
                    type="number"
                    value={formData.horasTrabajoHabituales}
                    onChange={e => handleInputChange('horasTrabajoHabituales', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* MODULE 5: VIVIENDA */}
          {activeModule === 5 && (
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <Home className="w-5 h-5" />
                <span>Módulo 5: Vivienda y Condiciones Socioeconómicas</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Tipo de Tenencia de Vivienda *</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {['Propia', 'Arrendada', 'Familiar', 'Otra'].map(tv => (
                      <label key={tv} className="flex items-center gap-2 p-2.5 bg-slate-900 rounded-xl text-xs text-slate-300 cursor-pointer border border-slate-800">
                        <input
                          type="radio"
                          name="tipoVivienda"
                          value={tv}
                          checked={formData.tipoVivienda === tv}
                          onChange={() => handleInputChange('tipoVivienda', tv)}
                          className="accent-emerald-500"
                        />
                        <span>{tv}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">¿Cuenta con Servicios Públicos Básicos Completo? *</label>
                  <div className="flex items-center gap-4">
                    {['Sí', 'No', 'Prefiero no responder'].map(opt => (
                      <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="serviciosPublicosBasicos"
                          value={opt}
                          checked={formData.serviciosPublicosBasicos === opt}
                          onChange={() => handleInputChange('serviciosPublicosBasicos', opt)}
                          className="accent-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">Detalle de Servicios Públicos Disponibles</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {['Agua', 'Energía', 'Gas', 'Internet', 'Alcantarillado'].map(sp => (
                      <label key={sp} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg text-xs text-slate-300 cursor-pointer border border-slate-800">
                        <input
                          type="checkbox"
                          checked={(formData.detalleServiciosPublicos || []).includes(sp)}
                          onChange={() => handleMultiSelectChange('detalleServiciosPublicos', sp)}
                          className="accent-emerald-500 rounded"
                        />
                        <span>{sp}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 6: CONDICIONES DE SALUD */}
          {activeModule === 6 && (
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <Activity className="w-5 h-5" />
                <span>Módulo 6: Condiciones de Salud</span>
              </div>

              {/* PRIVACY WARNING BANNER */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <span className="font-bold text-amber-300">AVISO DE PRIVACIDAD SOBRE DATOS SENSIBLES:</span> La información de salud es información sensible y será utilizada exclusivamente para los fines autorizados de caracterización, prevención y gestión del SG-SST, de acuerdo con las políticas de tratamiento de datos aplicables.
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    ¿Actualmente presenta alguna condición de salud que considere relevante para su bienestar o trabajo? *
                  </label>
                  <div className="flex items-center gap-4">
                    {['Sí', 'No', 'Prefiero no responder'].map(opt => (
                      <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="saludPresentaCondicion"
                          value={opt}
                          checked={formData.saludPresentaCondicion === opt}
                          onChange={() => handleInputChange('saludPresentaCondicion', opt)}
                          className="accent-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.saludPresentaCondicion === 'Sí' && (
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-300">¿Cuál o cuáles condiciones presenta?</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {['Hipertensión', 'Diabetes', 'Asma', 'Dolor Columna', 'Estrés'].map(cond => (
                        <label key={cond} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.saludCualCondicion || []).includes(cond)}
                            onChange={() => handleMultiSelectChange('saludCualCondicion', cond)}
                            className="accent-emerald-500 rounded"
                          />
                          <span>{cond}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODULE 7: DIAGNÓSTICOS DECLARADOS */}
          {activeModule === 7 && (
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <Stethoscope className="w-5 h-5" />
                <span>Módulo 7: Diagnósticos o Enfermedades Declaradas</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    ¿Tiene algún diagnóstico o enfermedad que desee declarar para efectos de caracterización de salud? *
                  </label>
                  <div className="flex items-center gap-4">
                    {['Sí', 'No', 'Prefiero no responder'].map(opt => (
                      <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="saludDiagnosticoDeclarado"
                          value={opt}
                          checked={formData.saludDiagnosticoDeclarado === opt}
                          onChange={() => handleInputChange('saludDiagnosticoDeclarado', opt)}
                          className="accent-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.saludDiagnosticoDeclarado === 'Sí' && (
                  <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                    <label className="block text-xs font-bold text-slate-300">Seleccione las categorías correspondientes:</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {['Respiratoria', 'Cardiovascular', 'Metabólica', 'Musculoesquelética', 'Digestiva', 'Neurológica', 'Visual', 'Auditiva', 'Dermatológica'].map(catDiag => (
                        <label key={catDiag} className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg text-xs text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(formData.saludTipoDiagnostico || []).includes(catDiag)}
                            onChange={() => handleMultiSelectChange('saludTipoDiagnostico', catDiag)}
                            className="accent-emerald-500 rounded"
                          />
                          <span>{catDiag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MODULE 8: MEDICAMENTOS, ALERGIAS, DISCAPACIDAD Y BIOMETRÍA */}
          {activeModule === 8 && (
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <ShieldAlert className="w-5 h-5" />
                <span>Módulo 8: Medicamentos, Alergias, Discapacidad y Biometría</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">¿Consume Medicamentos Habituales? *</label>
                  <select
                    value={formData.medicamentosHabituales}
                    onChange={e => handleInputChange('medicamentosHabituales', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                    <option value="Prefiero no responder">Prefiero no responder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">¿Tiene Alergias Conocidas? *</label>
                  <select
                    value={formData.alergiasPresenta}
                    onChange={e => handleInputChange('alergiasPresenta', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                    <option value="Prefiero no responder">Prefiero no responder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">¿Presenta Discapacidad / Limitación? *</label>
                  <select
                    value={formData.discapacidadPresenta}
                    onChange={e => handleInputChange('discapacidadPresenta', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Sí">Sí</option>
                    <option value="No">No</option>
                    <option value="Prefiero no responder">Prefiero no responder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Grupo Sanguíneo y RH *</label>
                  <select
                    value={formData.grupoSanguineo}
                    onChange={e => handleInputChange('grupoSanguineo', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'No sé', 'Prefiero no responder'].map(rh => (
                      <option key={rh} value={rh}>{rh}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Peso Aproximado (kg)</label>
                  <input
                    type="number"
                    placeholder="Ej. 70"
                    value={formData.pesoKg}
                    onChange={e => handleInputChange('pesoKg', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Estatura Aproximada (cm)</label>
                  <input
                    type="number"
                    placeholder="Ej. 170"
                    value={formData.estraturaCm || formData.estaturaCm}
                    onChange={e => handleInputChange('estaturaCm', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="md:col-span-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-bold">Estado Índice de Masa Corporal (IMC):</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {imcValue !== null ? `${imcValue} (${imcCategory})` : imcCategory}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 9: MOLESTIAS OSTEOMUSCULARES Y ESTILOS DE VIDA */}
          {activeModule === 9 && (
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <Smile className="w-5 h-5" />
                <span>Módulo 9: Condiciones Osteomusculares y Estilos de Vida</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">
                    Durante los últimos 12 meses, ¿ha presentado molestias o dolor en alguna zona? (Selección Múltiple) *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      'Ninguna', 'Cuello', 'Hombros', 'Espalda alta', 'Espalda baja', 
                      'Codos', 'Muñecas', 'Manos', 'Caderas', 'Rodillas', 'Tobillos', 'Pies', 'Prefiero no responder'
                    ].map(zona => (
                      <label key={zona} className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border ${
                        (formData.molestiasOsteomusculares12M || []).includes(zona) 
                          ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300 font-bold' 
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}>
                        <input
                          type="checkbox"
                          checked={(formData.molestiasOsteomusculares12M || []).includes(zona)}
                          onChange={() => handleOsteomuscularChange(zona)}
                          className="accent-emerald-500 rounded"
                        />
                        <span>{zona}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">¿Realiza Actividad Física o Ejercicio? *</label>
                  <div className="flex items-center gap-4">
                    {['Sí', 'No', 'Prefiero no responder'].map(opt => (
                      <label key={opt} className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                        <input
                          type="radio"
                          name="actividadFisicaRealiza"
                          value={opt}
                          checked={formData.actividadFisicaRealiza === opt}
                          onChange={() => handleInputChange('actividadFisicaRealiza', opt)}
                          className="accent-emerald-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 10: TRABAJO, MODALIDAD Y SALUD MENTAL */}
          {activeModule === 10 && (
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <Brain className="w-5 h-5" />
                <span>Módulo 10: Trabajo, Modalidad y Percepción de Bienestar</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Modalidad de Trabajo (Empresa) *</label>
                  <select
                    value={formData.modalidadTrabajo}
                    onChange={e => handleInputChange('modalidadTrabajo', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {catalog.catalogs.modalidadesTrabajo.map(m => (
                      <option key={m.id} value={m.label}>{m.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Medio de Transporte Principal *</label>
                  <select
                    value={formData.transporteMedioPrincipal}
                    onChange={e => handleInputChange('transporteMedioPrincipal', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Transporte público">Transporte público</option>
                    <option value="Vehículo particular">Vehículo particular</option>
                    <option value="Motocicleta">Motocicleta</option>
                    <option value="Bicicleta">Bicicleta</option>
                    <option value="Caminando">Caminando</option>
                    <option value="Transporte empresa">Transporte suministrado por empresa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Tiempo de Desplazamiento *</label>
                  <select
                    value={formData.transporteTiempoDesplazamiento}
                    onChange={e => handleInputChange('transporteTiempoDesplazamiento', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="< 30 min">Menos de 30 minutos</option>
                    <option value="30-60 min">30–60 minutos</option>
                    <option value="1-2 horas">1–2 horas</option>
                    <option value="> 2 horas">Más de 2 horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Percepción General de Bienestar (1 a 5)</label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.saludMentalBienestarGeneral}
                    onChange={e => handleInputChange('saludMentalBienestarGeneral', parseInt(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>1 (Bajo)</span>
                    <span className="text-emerald-400 font-bold">{formData.saludMentalBienestarGeneral}</span>
                    <span>5 (Excelente)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 11: OBSERVACIONES */}
          {activeModule === 11 && (
            <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800 space-y-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm border-b border-slate-800 pb-2">
                <FileText className="w-5 h-5" />
                <span>Módulo 11: Observaciones Adicionales</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Comentarios, Sugerencias o Aclaraciones</label>
                <textarea
                  rows={4}
                  placeholder="Escriba aquí cualquier observación adicional sobre su estado de salud, condiciones de trabajo o entorno..."
                  value={formData.observacionesGenerales}
                  onChange={e => handleInputChange('observacionesGenerales', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* NAVIGATION FOOTER */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-5">
            <button
              type="button"
              disabled={activeModule === 1}
              onClick={() => setActiveModule(prev => Math.max(1, prev - 1))}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Anterior</span>
            </button>

            <span className="text-xs text-slate-400 font-mono">
              Módulo <span className="text-emerald-400 font-bold">{activeModule}</span> de 11
            </span>

            {activeModule < 11 ? (
              <button
                type="button"
                onClick={() => setActiveModule(prev => Math.min(11, prev + 1))}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer shadow-xl"
              >
                <Save className="w-4 h-4" />
                <span>Finalizar y Normalizar Registro</span>
              </button>
            )}
          </div>
        </form>
      ) : (
        /* CONFIRMATION / NORMALIZED RESULTS DISPLAY */
        <div className="bg-slate-950/60 p-6 rounded-2xl border border-emerald-500/30 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">¡Encuesta Normalizada e Integrada con Éxito!</h3>
              <p className="text-xs text-slate-400">
                El registro fue procesado a través del pipeline unificado de Normalización (P27) y está listo para Validación (P26).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Empleado</span>
              <p className="text-sm font-bold text-white mt-0.5">
                {lastNormalized?.nombres} {lastNormalized?.apellidos}
              </p>
              <p className="text-xs text-slate-400">{lastNormalized?.tipoDocumento} {lastNormalized?.numeroIdentificacion}</p>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Edad / Antigüedad</span>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">
                {lastNormalized?.edad ? `${lastNormalized.edad} años` : 'N/D'}
              </p>
              <p className="text-xs text-slate-400">{lastNormalized?.antiguedadCalculada}</p>
            </div>

            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-mono">Organización</span>
              <p className="text-xs font-bold text-slate-200 mt-0.5">{lastNormalized?.cargo}</p>
              <p className="text-xs text-slate-400">{lastNormalized?.area} | {lastNormalized?.sede}</p>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 mb-2">Vista Previa de Campos Normalizados (Modelo DataDictionary):</h4>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto max-h-60 scrollbar-thin">
              <pre>{JSON.stringify(lastNormalized, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
