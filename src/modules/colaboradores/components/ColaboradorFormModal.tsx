import React, { useState, useEffect } from 'react';
import { X, UserCheck, Building2, MapPin, Briefcase, FolderGit2, FileText, Shield, Heart, Phone, Mail, Calendar, User } from 'lucide-react';
import { motion } from 'motion/react';
import { colaboradoresService } from '../colaboradoresService';
import { ColaboradorExtendido } from '../types';

interface ColaboradorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  collaboratorToEdit?: ColaboradorExtendido | null;
  onSuccess: () => void;
  currentCompanyId?: string;
}

export function ColaboradorFormModal({
  isOpen,
  onClose,
  collaboratorToEdit,
  onSuccess,
  currentCompanyId = 'empresa_main_001'
}: ColaboradorFormModalProps) {
  
  // Relations options
  const empresas = colaboradoresService.getEmpresas();
  const sedes = colaboradoresService.getSedes(currentCompanyId);
  const areas = colaboradoresService.getAreas(currentCompanyId);
  const cargos = colaboradoresService.getCargos(currentCompanyId);
  const proyectos = colaboradoresService.getProyectos(currentCompanyId);
  const centrosTrabajo = colaboradoresService.getCentrosTrabajo(currentCompanyId);
  const tiposContrato = colaboradoresService.getTiposContrato(currentCompanyId);
  const modalidades = colaboradoresService.getModalidades();
  const jornadas = colaboradoresService.getJornadas();

  // Form State
  const [formData, setFormData] = useState<Partial<ColaboradorExtendido>>({
    companyId: currentCompanyId,
    tipoIdentificacion: 'CC',
    numeroIdentificacion: '',
    nombres: '',
    apellidos: '',
    genero: 'Masculino',
    fechaNacimiento: '1992-05-14',
    fechaIngreso: new Date().toISOString().split('T')[0],
    correoCorporativo: '',
    correoPersonal: '',
    celular: '',
    sedeId: sedes[0]?.id || '',
    areaId: areas[0]?.id || '',
    cargoId: cargos[0]?.id || '',
    proyectoId: proyectos[0]?.id || '',
    centroTrabajoId: centrosTrabajo[0]?.id || '',
    tipoContratoId: tiposContrato[0]?.id || '',
    modalidadId: modalidades[0]?.id || '',
    jornadaId: jornadas[0]?.id || '',
    
    // Extended fields (unselected by default)
    estadoCivil: undefined,
    nivelEscolaridad: undefined,
    personasACargo: undefined,
    tipoVivienda: undefined,
    eps: '',
    afp: '',
    grupoSanguineo: '',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    parentescoContacto: ''
  });

  const [activeFormTab, setActiveFormTab] = useState<'BASIC' | 'RELATIONS' | 'HEALTH'>('BASIC');

  useEffect(() => {
    if (collaboratorToEdit) {
      setFormData({ ...collaboratorToEdit });
    } else {
      setFormData({
        companyId: currentCompanyId,
        tipoIdentificacion: 'CC',
        numeroIdentificacion: '',
        nombres: '',
        apellidos: '',
        genero: undefined,
        fechaNacimiento: '',
        fechaIngreso: new Date().toISOString().split('T')[0],
        correoCorporativo: '',
        correoPersonal: '',
        celular: '',
        sedeId: sedes[0]?.id || '',
        areaId: areas[0]?.id || '',
        cargoId: cargos[0]?.id || '',
        proyectoId: proyectos[0]?.id || '',
        centroTrabajoId: centrosTrabajo[0]?.id || '',
        tipoContratoId: tiposContrato[0]?.id || '',
        modalidadId: modalidades[0]?.id || '',
        jornadaId: jornadas[0]?.id || '',
        estadoCivil: undefined,
        nivelEscolaridad: undefined,
        personasACargo: undefined,
        tipoVivienda: undefined,
        eps: '',
        afp: '',
        grupoSanguineo: '',
        contactoEmergenciaNombre: '',
        contactoEmergenciaTelefono: '',
        parentescoContacto: ''
      });
    }
  }, [collaboratorToEdit, currentCompanyId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.numeroIdentificacion || !formData.nombres || !formData.apellidos) {
      alert('Por favor complete los campos obligatorios: Identificación, Nombres y Apellidos.');
      return;
    }

    colaboradoresService.upsertColaborador(
      formData,
      {
        estadoCivil: formData.estadoCivil,
        nivelEscolaridad: formData.nivelEscolaridad,
        personasACargo: formData.personasACargo,
        tipoVivienda: formData.tipoVivienda,
        eps: formData.eps,
        afp: formData.afp,
        grupoSanguineo: formData.grupoSanguineo,
        contactoEmergenciaNombre: formData.contactoEmergenciaNombre,
        contactoEmergenciaTelefono: formData.contactoEmergenciaTelefono,
        parentescoContacto: formData.parentescoContacto
      },
      'usr_lider_ghumana',
      'MANUAL'
    );

    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-indigo-400" />
              <span>{collaboratorToEdit ? 'Editar Expediente de Colaborador' : 'Registrar Nuevo Colaborador'}</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Formulario maestro con vinculación relacional a Empresa, Sede, Área, Cargo, Proyecto y Contrato.
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-3 text-xs font-bold text-slate-600 shrink-0">
          <button
            type="button"
            onClick={() => setActiveFormTab('BASIC')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFormTab === 'BASIC' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Datos Personales & Contacto</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('RELATIONS')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFormTab === 'RELATIONS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>2. Relaciones Organizacionales</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab('HEALTH')}
            className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeFormTab === 'HEALTH' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>3. Expediente Digital & Emergencia</span>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs font-bold text-slate-700 flex-1">
          
          {/* TAB 1: BASIC DETAILS */}
          {activeFormTab === 'BASIC' && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Tipo Identificación *</label>
                  <select
                    value={formData.tipoIdentificacion || 'CC'}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipoIdentificacion: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="PEP">PEP</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-700 mb-1">Número de Identificación Único *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 1018432901"
                    value={formData.numeroIdentificacion || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, numeroIdentificacion: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Nombres *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. María Fernanda"
                    value={formData.nombres || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombres: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Rodríguez Silva"
                    value={formData.apellidos || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, apellidos: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Género</label>
                  <select
                    value={formData.genero || 'Masculino'}
                    onChange={(e) => setFormData(prev => ({ ...prev, genero: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="No Binario">No Binario</option>
                    <option value="Prefiero No Decir">Prefiero No Decir</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Fecha de Ingreso</label>
                  <input
                    type="date"
                    value={formData.fechaIngreso || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, fechaIngreso: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Correo Corporativo</label>
                  <input
                    type="email"
                    placeholder="usuario@innovatechit.com.co"
                    value={formData.correoCorporativo || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, correoCorporativo: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Correo Personal</label>
                  <input
                    type="email"
                    placeholder="usuario@gmail.com"
                    value={formData.correoPersonal || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, correoPersonal: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-mono text-[11px]"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Teléfono / Celular</label>
                  <input
                    type="text"
                    placeholder="+57 310 123 4567"
                    value={formData.celular || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, celular: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ORGANIZATIONAL RELATIONS */}
          {activeFormTab === 'RELATIONS' && (
            <div className="space-y-4">
              
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-[11px] text-indigo-900 flex items-center gap-2 font-bold">
                <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Vinculación automática de 7 dimensiones organizacionales (3NF Maestro de Datos)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">1. Empresa Asignada *</label>
                  <select
                    value={formData.companyId || currentCompanyId}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {empresas.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.razonSocial} ({emp.nit})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">2. Sede Operativa *</label>
                  <select
                    value={formData.sedeId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, sedeId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {sedes.map(s => (
                      <option key={s.id} value={s.id}>{s.nombre} ({s.codigo})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">3. Área Organizacional *</label>
                  <select
                    value={formData.areaId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, areaId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {areas.map(a => (
                      <option key={a.id} value={a.id}>{a.nombre} ({a.codigo})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">4. Cargo / Puesto de Trabajo *</label>
                  <select
                    value={formData.cargoId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, cargoId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {cargos.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} ({c.codigo})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">5. Proyecto Asignado</label>
                  <select
                    value={formData.proyectoId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, proyectoId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Sin Proyecto Específico</option>
                    {proyectos.map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">6. Centro de Trabajo SG-SST *</label>
                  <select
                    value={formData.centroTrabajoId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, centroTrabajoId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {centrosTrabajo.map(ct => (
                      <option key={ct.id} value={ct.id}>{ct.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">7. Tipo de Contrato *</label>
                  <select
                    value={formData.tipoContratoId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipoContratoId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {tiposContrato.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Modalidad de Trabajo</label>
                  <select
                    value={formData.modalidadId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, modalidadId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {modalidades.map(m => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Jornada Laboral</label>
                  <select
                    value={formData.jornadaId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, jornadaId: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20"
                  >
                    {jornadas.map(j => (
                      <option key={j.id} value={j.id}>{j.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: HEALTH & DOSSIER EXTRA */}
          {activeFormTab === 'HEALTH' && (
            <div className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Estado Civil</label>
                  <select
                    value={formData.estadoCivil || 'Soltero(a)'}
                    onChange={(e) => setFormData(prev => ({ ...prev, estadoCivil: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Soltero(a)">Soltero(a)</option>
                    <option value="Casado(a)">Casado(a)</option>
                    <option value="Unión Libre">Unión Libre</option>
                    <option value="Divorciado(a)">Divorciado(a)</option>
                    <option value="Viudo(a)">Viudo(a)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Nivel Escolaridad</label>
                  <select
                    value={formData.nivelEscolaridad || 'Profesional'}
                    onChange={(e) => setFormData(prev => ({ ...prev, nivelEscolaridad: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Primaria">Primaria</option>
                    <option value="Bachillerato">Bachillerato</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Tecnólogo">Tecnólogo</option>
                    <option value="Profesional">Profesional</option>
                    <option value="Especialización">Especialización</option>
                    <option value="Maestría">Maestría</option>
                    <option value="Doctorado">Doctorado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Personas a Cargo</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.personasACargo || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, personasACargo: parseInt(e.target.value) || 0 }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">EPS Afiliada</label>
                  <input
                    type="text"
                    placeholder="Ej. SURA EPS, Sanitas"
                    value={formData.eps || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, eps: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Fondo de Pensiones (AFP)</label>
                  <input
                    type="text"
                    placeholder="Ej. Protección, Porvenir"
                    value={formData.afp || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, afp: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Grupo Sanguíneo (RH)</label>
                  <select
                    value={formData.grupoSanguineo || 'O+'}
                    onChange={(e) => setFormData(prev => ({ ...prev, grupoSanguineo: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  >
                    <option value="O+">O Positivo (O+)</option>
                    <option value="O-">O Negativo (O-)</option>
                    <option value="A+">A Positivo (A+)</option>
                    <option value="A-">A Negativo (A-)</option>
                    <option value="B+">B Positivo (B+)</option>
                    <option value="B-">B Negativo (B-)</option>
                    <option value="AB+">AB Positivo (AB+)</option>
                    <option value="AB-">AB Negativo (AB-)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="font-extrabold text-slate-900 text-xs block">Contacto en Caso de Emergencia</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      placeholder="Ej. Fernando Rodríguez"
                      value={formData.contactoEmergenciaNombre || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactoEmergenciaNombre: e.target.value }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Teléfono Móvil</label>
                    <input
                      type="text"
                      placeholder="+57 312 999 8877"
                      value={formData.contactoEmergenciaTelefono || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactoEmergenciaTelefono: e.target.value }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1">Parentesco</label>
                    <input
                      type="text"
                      placeholder="Esposo, Madre, Hermano"
                      value={formData.parentescoContacto || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, parentescoContacto: e.target.value }))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Buttons Footer */}
          <div className="pt-4 border-t border-slate-150 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {activeFormTab !== 'BASIC' && (
                <button
                  type="button"
                  onClick={() => setActiveFormTab(prev => prev === 'HEALTH' ? 'RELATIONS' : 'BASIC')}
                  className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold transition-all cursor-pointer"
                >
                  ← Anterior
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-all"
              >
                Cancelar
              </button>

              {activeFormTab !== 'HEALTH' ? (
                <button
                  type="button"
                  onClick={() => setActiveFormTab(prev => prev === 'BASIC' ? 'RELATIONS' : 'HEALTH')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer shadow-md transition-all"
                >
                  Siguiente Step →
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold cursor-pointer shadow-md transition-all flex items-center gap-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Guardar Expediente</span>
                </button>
              )}
            </div>
          </div>

        </form>
      </motion.div>
    </div>
  );
}
