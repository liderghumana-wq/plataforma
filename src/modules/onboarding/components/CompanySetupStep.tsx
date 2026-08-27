import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft,
  Mail,
  Phone,
  User,
  MapPin,
  Briefcase,
  Image
} from 'lucide-react';
import { saasService } from '../../administracion_saas/services/saasService';
import { CompanyTenant } from '../../administracion_saas/types/saas.types';
import { useEmpresa } from '../../configuracion/useEmpresa';

interface CompanySetupStepProps {
  onNext: () => void;
  onPrev: () => void;
  activeCompanyId: string;
}

export const CompanySetupStep: React.FC<CompanySetupStepProps> = ({ onNext, onPrev, activeCompanyId }) => {
  const { config, updateConfig } = useEmpresa();
  const [tenant, setTenant] = useState<CompanyTenant | null>(null);

  const [formData, setFormData] = useState({
    razonSocial: '',
    nombreComercial: '',
    nit: '',
    sector: '',
    ciudad: '',
    direccion: '',
    responsable: '',
    correo: '',
    telefono: '',
    cargoResponsable: '',
    logo: ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const t = saasService.getTenantById(activeCompanyId);
    if (t) {
      setTenant(t);
      setFormData({
        razonSocial: t.razonSocial || config.nombreEmpresa || '',
        nombreComercial: t.nombreComercial || '',
        nit: t.nit || config.nit || '',
        sector: t.sector || config.sectorEconomico || '',
        ciudad: t.ciudad || config.ciudad || '',
        direccion: t.direccion || config.direccion || '',
        responsable: t.contactoPrincipal?.nombre || config.responsableInforme || '',
        correo: t.contactoPrincipal?.email || config.correo || '',
        telefono: t.contactoPrincipal?.telefono || config.telefono || '',
        cargoResponsable: t.contactoPrincipal?.cargo || 'Responsable SG-SST',
        logo: t.logo || config.logo || ''
      });
    } else {
      setFormData({
        razonSocial: config.nombreEmpresa || '',
        nombreComercial: '',
        nit: config.nit || '',
        sector: config.sectorEconomico || '',
        ciudad: config.ciudad || '',
        direccion: config.direccion || '',
        responsable: config.responsableInforme || '',
        correo: config.correo || '',
        telefono: config.telefono || '',
        cargoResponsable: 'Responsable SG-SST',
        logo: config.logo || ''
      });
    }
  }, [activeCompanyId, config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSavedSuccess(false);
    setErrorMsg(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.razonSocial.trim()) {
      setErrorMsg('La Razón Social es obligatoria.');
      return;
    }
    if (!formData.nit.trim()) {
      setErrorMsg('El NIT es obligatorio para la identificación de la empresa.');
      return;
    }

    try {
      // 1. Update SaaS Tenant
      if (tenant) {
        const updatedTenant: CompanyTenant = {
          ...tenant,
          razonSocial: formData.razonSocial.trim(),
          nombreComercial: formData.nombreComercial.trim() || formData.razonSocial.trim(),
          nit: formData.nit.trim(),
          sector: formData.sector.trim(),
          ciudad: formData.ciudad.trim(),
          direccion: formData.direccion.trim(),
          logo: formData.logo.trim(),
          contactoPrincipal: {
            nombre: formData.responsable.trim(),
            email: formData.correo.trim(),
            telefono: formData.telefono.trim(),
            cargo: formData.cargoResponsable.trim()
          },
          fechaActualizacion: new Date().toISOString()
        };

        saasService.updateTenant(updatedTenant, formData.correo || 'admin@sistema', 'ADMIN_EMPRESA', 'Actualización desde Onboarding Paso 2');
      }

      // 2. Update Global Company Context
      await updateConfig({
        ...config,
        nombreEmpresa: formData.razonSocial.trim(),
        nit: formData.nit.trim(),
        sectorEconomico: formData.sector.trim(),
        ciudad: formData.ciudad.trim(),
        direccion: formData.direccion.trim(),
        responsableInforme: formData.responsable.trim(),
        correo: formData.correo.trim(),
        telefono: formData.telefono.trim(),
        logo: formData.logo.trim()
      });

      setSavedSuccess(true);
      setErrorMsg(null);
    } catch (err) {
      console.error('Error saving company config:', err);
      setErrorMsg('Ocurrió un error al guardar la configuración.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Paso 2 de 7 • Identidad Empresarial
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Configuración de la Empresa</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Registra los datos oficiales de la organización para los encabezados de reportes e informes legales.
          </p>
        </div>

        <span className="inline-flex items-center px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium border border-slate-200">
          [A] Datos Reales de Organización
        </span>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Información de la empresa guardada y sincronizada correctamente.</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Razón Social */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Razón Social Oficial <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="razonSocial"
                value={formData.razonSocial}
                onChange={handleChange}
                placeholder="Ej. InnovaTech IT Solutions S.A.S."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Nombre Comercial */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Nombre Comercial
            </label>
            <input
              type="text"
              name="nombreComercial"
              value={formData.nombreComercial}
              onChange={handleChange}
              placeholder="Ej. InnovaTech"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* NIT */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              NIT / Identificación Tributaria <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="nit"
              value={formData.nit}
              onChange={handleChange}
              placeholder="Ej. 901.458.789-2"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Sector / Actividad */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Sector Económico
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="sector"
                value={formData.sector}
                onChange={handleChange}
                placeholder="Ej. Tecnología, BPO, Manufactura, Salud..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Ciudad */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Ciudad Principal
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                placeholder="Ej. Bogotá D.C."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Dirección */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Dirección de Sede Principal
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              placeholder="Ej. Cra 15 # 93-47 Oficina 602"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Responsable SG-SST */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Responsable del SG-SST / Líder
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                name="responsable"
                value={formData.responsable}
                onChange={handleChange}
                placeholder="Ej. María Fernanda Rodríguez"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Cargo del Responsable */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Cargo del Responsable
            </label>
            <input
              type="text"
              name="cargoResponsable"
              value={formData.cargoResponsable}
              onChange={handleChange}
              placeholder="Ej. Directora de Gestión Humana & SG-SST"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Correo Corporativo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Correo Corporativo
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                placeholder="lider.ghumana@innovatechit.com.co"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Teléfono de Contacto
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+57 310 456 7890"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* URL de Logo */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              URL del Logo Corporativo (Opcional)
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="url"
                name="logo"
                value={formData.logo}
                onChange={handleChange}
                placeholder="https://... (URL pública de imagen PNG/JPG/SVG)"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {formData.logo && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 inline-flex items-center gap-3">
                <span className="text-xs text-slate-500">Vista previa de logo:</span>
                <img src={formData.logo} alt="Logo" className="h-8 max-w-[120px] object-contain rounded" />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Bienvenida
          </button>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Guardar Datos
            </button>

            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Siguiente: Estructura
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
