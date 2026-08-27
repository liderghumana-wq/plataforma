import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Mail, 
  Lock, 
  Building, 
  Plus, 
  ArrowRight, 
  Smile, 
  CheckCircle2, 
  Globe, 
  ShieldCheck,
  Building2,
  ChevronRight,
  Info
} from 'lucide-react';
import { useEmpresa } from '../modules/configuracion/useEmpresa';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { companies, switchCompany, createCompany } = useEmpresa();
  const [email, setEmail] = useState('lider.ghumana@innovatechit.com.co');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || 'default-company');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Company form states
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyNit, setNewCompanyNit] = useState('');
  const [newCompanyCity, setNewCompanyCity] = useState('');
  const [newCompanyCountry, setNewCompanyCountry] = useState('Colombia');
  const [newCompanyResponsable, setNewCompanyResponsable] = useState('');
  const [newCompanySlogan, setNewCompanySlogan] = useState('');
  const [newCompanyEmail, setNewCompanyEmail] = useState('');
  const [newCompanyPhone, setNewCompanyPhone] = useState('');
  const [newCompanyWebsite, setNewCompanyWebsite] = useState('');
  const [newCompanyLogo, setNewCompanyLogo] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Por favor, ingrese un correo electrónico.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Switch to the selected company
      await switchCompany(selectedCompanyId);
      // Simulate network request
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess();
      }, 600);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Error al iniciar sesión.');
    }
  };

  const handleRegisterCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName || !newCompanyNit) {
      setError('Por favor, complete el Nombre de Empresa y NIT.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Create the new company config
      const newId = await createCompany(newCompanyName, newCompanyNit, {
        ciudad: newCompanyCity || 'Bogotá D.C.',
        pais: newCompanyCountry || 'Colombia',
        responsableInforme: newCompanyResponsable || 'Responsable SG-SST',
        eslogan: newCompanySlogan || 'Seguridad y Bienestar Inteligente',
        correo: newCompanyEmail || email,
        telefono: newCompanyPhone || '(601) 555-0100',
        sitioWeb: newCompanyWebsite || 'www.empresa.com',
        logo: newCompanyLogo || '',
        colorPrimario: '#4f46e5',
        colorSecundario: '#06b6d4'
      });
      
      // Select and switch to the newly created company
      await switchCompany(newId);
      
      setLoading(false);
      setIsRegistering(false);
      onLoginSuccess();
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Error al registrar la empresa.');
    }
  };

  const loadDemoLogo = (gender: 'tech' | 'health' | 'industry') => {
    const urls = {
      tech: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=60',
      health: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=120&auto=format&fit=crop&q=60',
      industry: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&auto=format&fit=crop&q=60'
    };
    setNewCompanyLogo(urls[gender]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-indigo-500 selection:text-white">
      {/* LEFT PANEL: Ambient / Pitch / Stats */}
      <div className="md:w-[45%] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
        <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Brain className="w-5.5 h-5.5 text-white animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="font-black text-base tracking-tight text-white leading-none">Insight People IA</h1>
            <span className="text-[9px] tracking-widest font-bold uppercase text-indigo-300 block mt-1">
              Plataforma Inteligente de Personas y SG-SST
            </span>
          </div>
        </div>

        {/* Pitch content */}
        <div className="my-12 space-y-6 relative z-10 max-w-md text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>Multi-Empresa SaaS v3.0</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-white font-display">
            Decisiones de Personas respaldadas por <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">Inteligencia Artificial</span>
          </h2>
          
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Acceda a diagnósticos instantáneos de clima, análisis sociodemográfico predictivo, gestión de riesgos de salud, y planes de acción automatizados que cumplen con los estándares normativos.
          </p>

          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Cumplimiento Normativo SG-SST Colombia</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-300 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Aislamiento seguro de bases de datos por Empresa</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-slate-500 font-medium relative z-10 text-left pt-6 border-t border-slate-900">
          <span>Insight People IA es una plataforma profesional tipo ERP diseñada para la toma de decisiones basada en datos.</span>
        </div>
      </div>

      {/* RIGHT PANEL: Dynamic Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-slate-950">
        <div className="w-full max-w-md space-y-8 animate-fade-in text-left">
          
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white font-display">
              {isRegistering ? 'Registrar Nueva Empresa' : 'Iniciar Sesión'}
            </h2>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              {isRegistering 
                ? 'Ingrese los parámetros corporativos para crear un espacio de trabajo inteligente.' 
                : 'Seleccione su empresa e ingrese sus credenciales corporativas autorizadas.'}
            </p>
          </div>

          {error && (
            <div className="bg-red-950/40 border border-red-800/60 text-red-200 p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isRegistering ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Select Company */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Espacio de Trabajo / Empresa</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer appearance-none hover:bg-slate-850 transition-all"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id} className="bg-slate-900 text-slate-100">
                        🏢 {c.nombreEmpresa || `Empresa (${c.id.substring(0, 6)})`}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* Corporate Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Correo Electrónico</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@empresa.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Contraseña</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-3 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  required
                />
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <span>Cargando Entorno...</span>
                  ) : (
                    <>
                      <span>Ingresar al Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-xs">
                  <span className="text-slate-500 font-medium">¿Nueva empresa cliente?</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(true);
                      setError(null);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-extrabold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Crear Espacio</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* REGISTER NEW COMPANY FORM */
            <form onSubmit={handleRegisterCompany} className="space-y-4 max-h-[65vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Razón Social *</label>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Ej: InnovaTech Solutions S.A.S."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* NIT */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">NIT *</label>
                <input
                  type="text"
                  value={newCompanyNit}
                  onChange={(e) => setNewCompanyNit(e.target.value)}
                  placeholder="Ej: 900.123.456-7"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* City and Country */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Ciudad Sede</label>
                  <input
                    type="text"
                    value={newCompanyCity}
                    onChange={(e) => setNewCompanyCity(e.target.value)}
                    placeholder="Bogotá D.C."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">País</label>
                  <input
                    type="text"
                    value={newCompanyCountry}
                    onChange={(e) => setNewCompanyCountry(e.target.value)}
                    placeholder="Colombia"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Responsable SG-SST */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Responsable SG-SST</label>
                <input
                  type="text"
                  value={newCompanyResponsable}
                  onChange={(e) => setNewCompanyResponsable(e.target.value)}
                  placeholder="Ej: Ing. Diana Torres"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Slogan */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Eslogan</label>
                <input
                  type="text"
                  value={newCompanySlogan}
                  onChange={(e) => setNewCompanySlogan(e.target.value)}
                  placeholder="Ej: Liderando el Bienestar"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Correo</label>
                  <input
                    type="email"
                    value={newCompanyEmail}
                    onChange={(e) => setNewCompanyEmail(e.target.value)}
                    placeholder="contacto@empresa.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">Teléfono</label>
                  <input
                    type="text"
                    value={newCompanyPhone}
                    onChange={(e) => setNewCompanyPhone(e.target.value)}
                    placeholder="(601) 555-0100"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Logo Predefinido / Unsplash para testeo rápido */}
              <div className="space-y-1.5">
                <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Logotipo Rápido IA</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => loadDemoLogo('tech')}
                    className={`flex-1 py-1.5 border rounded-lg text-[9px] font-bold text-center cursor-pointer transition-all ${newCompanyLogo.includes('photo-151632') ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-slate-800 text-slate-400'}`}
                  >
                    Tech Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => loadDemoLogo('health')}
                    className={`flex-1 py-1.5 border rounded-lg text-[9px] font-bold text-center cursor-pointer transition-all ${newCompanyLogo.includes('photo-150575') ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-slate-800 text-slate-400'}`}
                  >
                    Health Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => loadDemoLogo('industry')}
                    className={`flex-1 py-1.5 border rounded-lg text-[9px] font-bold text-center cursor-pointer transition-all ${newCompanyLogo.includes('photo-158109') ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-slate-800 text-slate-400'}`}
                  >
                    Industry Logo
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? 'Creando...' : 'Crear Espacio e Ingresar'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(false);
                    setError(null);
                  }}
                  className="w-full py-2 bg-transparent text-slate-400 hover:text-white font-bold text-xs text-center cursor-pointer transition-all"
                >
                  Regresar al Inicio de Sesión
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
