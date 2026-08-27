import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Activity, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  HeartHandshake, 
  Brain, 
  Database, 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  ChevronRight, 
  Layout, 
  Clock, 
  Lock,
  Globe,
  Quote,
  Zap,
  Building2,
  Cpu,
  Smile
} from 'lucide-react';

interface LandingPageProps {
  onEnterPlatform: () => void;
}

export default function LandingPage({ onEnterPlatform }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      
      {/* 1. FLOATING HEADER / NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/65 py-4 px-6 md:px-12 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-950 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/10">
            <Brain className="w-5.5 h-5.5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-950 font-display">
              People Insight <span className="text-indigo-600">IA</span>
            </span>
            <span className="block text-[8px] tracking-widest font-black uppercase text-slate-400">
              Talent & SG-SST OS
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <a href="#caracteristicas" className="hover:text-indigo-600 transition-colors">Características</a>
          <a href="#modulos" className="hover:text-indigo-600 transition-colors">Módulos</a>
          <a href="#beneficios" className="hover:text-indigo-600 transition-colors">Beneficios</a>
          <a href="#tecnologias" className="hover:text-indigo-600 transition-colors">Tecnología</a>
          <a href="#planes" className="hover:text-indigo-600 transition-colors">Planes</a>
          <a href="#testimonios" className="hover:text-indigo-600 transition-colors">Testimonios</a>
        </nav>

        {/* CTA Button */}
        <button 
          onClick={onEnterPlatform}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md shadow-indigo-600/15 hover:shadow-lg hover:shadow-indigo-600/20 active:scale-98 flex items-center gap-2 cursor-pointer group"
        >
          <span>Ingresar a la Plataforma</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-16 md:pt-28 pb-20 px-6 md:px-12 text-center max-w-7xl mx-auto">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] md:w-[40rem] md:h-[40rem] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <div className="space-y-6 max-w-4xl mx-auto text-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span>Versión 2.0 • Analítica Predictiva con IA</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-slate-950 leading-[1.1] text-center">
            People Insight <span className="bg-gradient-to-r from-indigo-600 to-indigo-950 bg-clip-text text-transparent">IA</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto text-center">
            Plataforma Inteligente para la Gestión del Talento Humano, Bienestar Organizacional y SG-SST mediante Inteligencia Artificial.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={onEnterPlatform}
              className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/25 active:scale-98 flex items-center justify-center gap-2 cursor-pointer group"
            >
              <span>Ingresar a la Plataforma</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#modulos" 
              className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-50 text-slate-800 text-sm font-bold rounded-2xl border border-slate-250 transition-all text-center flex items-center justify-center gap-1.5"
            >
              Explorar Soluciones
            </a>
          </div>

          {/* Trust indicator */}
          <p className="text-[11px] text-slate-400 font-mono font-bold pt-4">
            Diseño inspirado en la simplicidad de Notion, la agilidad de Monday y el poder de Power BI.
          </p>
        </div>

        {/* SaaS Dashboard Preview Image/Mockup */}
        <div className="mt-16 md:mt-24 bg-white p-4 rounded-[2.5rem] border border-slate-200/80 shadow-2xl relative">
          <div className="absolute top-4 left-4 flex gap-1.5 z-10">
            <div className="w-3 h-3 bg-rose-400 rounded-full" />
            <div className="w-3 h-3 bg-amber-400 rounded-full" />
            <div className="w-3 h-3 bg-emerald-400 rounded-full" />
          </div>
          
          <div className="bg-slate-900 rounded-[1.8rem] overflow-hidden p-3 md:p-6 text-white border border-slate-800">
            {/* Mockup Dashboard Body */}
            <div className="flex flex-col md:flex-row gap-5 text-left">
              
              {/* Sidebar Mockup */}
              <div className="w-full md:w-52 space-y-4 shrink-0 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                <div className="font-extrabold text-sm text-cyan-300 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>People Insight IA</span>
                </div>
                <div className="space-y-1.5">
                  <div className="h-6.5 bg-indigo-600/20 text-indigo-300 rounded-lg px-2.5 flex items-center text-[10px] font-black uppercase tracking-wider border border-indigo-500/10">🏠 Inicio</div>
                  <div className="h-6.5 text-slate-400 rounded-lg px-2.5 flex items-center text-[10px] font-bold">📊 Caracterización</div>
                  <div className="h-6.5 text-slate-400 rounded-lg px-2.5 flex items-center text-[10px] font-bold">📋 Evaluaciones</div>
                  <div className="h-6.5 text-slate-400 rounded-lg px-2.5 flex items-center text-[10px] font-bold">❤️ Bienestar</div>
                </div>
              </div>

              {/* Main Dashboard Content Mockup */}
              <div className="flex-1 space-y-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div>
                    <span className="text-[9px] uppercase tracking-widest font-black text-cyan-300 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">Centro Analítico de Control</span>
                    <h3 className="text-xl font-extrabold font-display text-white mt-1.5">Inicio - Centro de Control</h3>
                  </div>
                  <div className="bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl text-[10px] font-mono font-bold text-slate-300">
                    Último análisis: Completado hoy
                  </div>
                </div>

                {/* Dashboard grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white/5 border border-white/15 p-4 rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Módulos Activos</span>
                    <p className="text-2xl font-black text-cyan-300 font-mono mt-1">10</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Estructura expandida</p>
                  </div>
                  <div className="bg-white/5 border border-white/15 p-4 rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Indicador Favorable</span>
                    <p className="text-2xl font-black text-emerald-400 font-mono mt-1">84.2%</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Clima y satisfacción</p>
                  </div>
                  <div className="bg-white/5 border border-white/15 p-4 rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Riesgo Psicosocial</span>
                    <p className="text-2xl font-black text-amber-400 font-mono mt-1">Bajo / Medio</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">Semáforo normativo</p>
                  </div>
                </div>

                {/* Interactive bar placeholder */}
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                    <span>Monitoreo de Bienestar & SST</span>
                    <span className="text-indigo-400 font-mono">94% Meta</span>
                  </div>
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full" style={{ width: '91%' }} />
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. CARACTERÍSTICAS */}
      <section id="caracteristicas" className="py-20 md:py-28 bg-white border-y border-slate-200/80 px-6 md:px-12 text-left">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="max-w-3xl space-y-3.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Características Clave
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight text-slate-950">
              ¿Por qué elegir People Insight IA?
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
              Diseñamos una plataforma integral que elimina el papeleo, automatiza las mediciones y genera reportes ejecutivos de gerencia con un estándar normativo del 100%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="space-y-4 p-5 hover:bg-slate-50 rounded-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-xs">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-950 font-display">Análisis de Datos con IA</h3>
              <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
                Nuestros algoritmos integrados interpretan bases de datos demográficos y encuestas de clima para predecir niveles de estrés e identificar focos de intervención de manera inmediata.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-4 p-5 hover:bg-slate-50 rounded-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center border border-cyan-100 shadow-xs">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-950 font-display">Cumplimiento Legal y SST</h3>
              <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
                Diseñado bajo la normatividad colombiana y latinoamericana de SG-SST (Resolución 0312), garantizando que tus planes anuales de capacitación y bienestar estén totalmente en regla.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="space-y-4 p-5 hover:bg-slate-50 rounded-2xl transition-all duration-300">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center border border-rose-100 shadow-xs">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-950 font-display">Reportes en Segundos</h3>
              <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed">
                Olvídate de compilar infinitas hojas de cálculo de Excel. Genera informes de diagnóstico ejecutivo de alta calidad, listos para descargar en PDF y presentar a gerencia.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. MÓDULOS */}
      <section id="modulos" className="py-20 md:py-28 px-6 md:px-12 text-left max-w-7xl mx-auto">
        <div className="space-y-16">
          <div className="max-w-3xl space-y-3.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Módulos Inteligentes
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight text-slate-950">
              Ecosistema Integral de Gestión del Personal
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
              People Insight IA está estructurado modularmente para abarcar todas las facetas del bienestar laboral, permitiendo agregar nuevas herramientas sin comprometer la estabilidad del sistema.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Modulo 1 */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-3xl space-y-4 hover:shadow-md transition-all">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl w-fit">
                <Users className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-950 font-display">Caracterización Sociodemográfica</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Mapea la distribución de edad, escolaridad, responsabilidades familiares, y perfiles de salud de tus colaboradores para estructurar una base de datos demográfica limpia.
              </p>
            </div>

            {/* Modulo 2 */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-3xl space-y-4 hover:shadow-md transition-all">
              <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl w-fit">
                <Smile className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-950 font-display">Clima Organizacional e eNPS</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Mide de manera periódica el grado de satisfacción, pertenencia, liderazgo y efectividad de la comunicación interna en cada equipo o centro de trabajo.
              </p>
            </div>

            {/* Modulo 3 */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-3xl space-y-4 hover:shadow-md transition-all">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl w-fit">
                <HeartHandshake className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-950 font-display">Bienestar Organizacional</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Calcula e implementa planes de hábitos de vida saludable, pausas activas, programas de nutrición preventiva, salud visual y ergonomía laboral.
              </p>
            </div>

            {/* Modulo 4 */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-3xl space-y-4 hover:shadow-md transition-all">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl w-fit">
                <ShieldCheck className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-950 font-display">Riesgo Psicosocial</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Mapea el nivel de estrés intralaboral y extralaboral con semáforos de alerta temprana y predictivos para evitar incidentes y fatiga ocupacional.
              </p>
            </div>

            {/* Modulo 5 */}
            <div className="bg-white border border-slate-200/60 p-6 rounded-3xl space-y-4 hover:shadow-md transition-all">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
                <BarChart3 className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-950 font-display">Informes & Plan Anual SG-SST</h3>
              <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                Automatiza la generación del Plan Anual de Seguridad y Salud en el Trabajo y el Diagnóstico Ejecutivo listo para ser auditado o compartido con gerencia.
              </p>
            </div>

            {/* Modulo 6 */}
            <div className="bg-slate-950 text-white p-6 rounded-3xl flex flex-col justify-between border border-slate-800">
              <div className="space-y-2">
                <div className="inline-block px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] font-black uppercase tracking-widest rounded-full">
                  Arquitectura Abierta
                </div>
                <h3 className="text-sm font-extrabold font-display">¿Quieres agregar más?</h3>
                <p className="text-[11px] text-slate-300 font-semibold leading-relaxed">
                  People Insight IA cuenta con estructura modular para evaluaciones de Ausentismo, Accidentalidad, Desempeño, Capacitación y Entrevistas de Retiro sin alterar tu configuración actual.
                </p>
              </div>
              <button 
                onClick={onEnterPlatform}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Explorar Todos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 5. BENEFICIOS */}
      <section id="beneficios" className="py-20 md:py-28 bg-slate-900 text-white px-6 md:px-12 text-left relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative">
          
          <div className="space-y-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-400/20 w-fit block">
              Beneficios Medibles
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight text-white leading-tight">
              Impacto Estratégico en la Gestión del Talento
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              Nuestra plataforma no solo almacena información; transforma datos sociodemográficos y de salud en decisiones de alto nivel corporativo que impulsan la productividad.
            </p>

            <div className="space-y-4 pt-4">
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-white">Reducción de Tiempos en un 85%</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Genera reportes de diagnóstico y planes anuales de intervención en un solo clic.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-white">Cero Papeleo, 100% Digital</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Captura datos demográficos y respuestas de clima mediante encuestas web seguras y ecológicas.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-black text-white">Cumplimiento Normativo Garantizado</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Estructuras alineadas de punta a punta con la normatividad de SST y auditorías corporativas.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Showcase Mockup */}
          <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[2rem] space-y-6 backdrop-blur-md">
            <div className="text-center space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Indicador Clave de Rendimiento</span>
              <h3 className="text-sm font-bold text-slate-200">Retención de Talento & Bienestar</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-3xl font-black text-indigo-400 font-mono">92%</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Nivel de Bienestar</p>
              </div>
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-3xl font-black text-cyan-400 font-mono">-35%</p>
                <p className="text-[10px] text-slate-400 font-bold mt-1">Ausentismo Proyectado</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-300">
                <span>Progreso de Implementación de SST</span>
                <span>88% completado</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. TECNOLOGÍAS */}
      <section id="tecnologias" className="py-20 md:py-28 bg-white border-b border-slate-200/80 px-6 md:px-12 text-center">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-3xl mx-auto space-y-3.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Stack Tecnológico SaaS
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight text-slate-950">
              Desarrollado con Tecnología de Vanguardia
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
              Aseguramos un rendimiento sobresaliente, carga inmediata de datos en memoria y exportación dinámica de archivos mediante tecnologías modernas.
            </p>
          </div>

          <div className="flex flex-wrap gap-3.5 justify-center">
            <span className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
              React 18 & Hooks
            </span>
            <span className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
              Tailwind CSS v4
            </span>
            <span className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
              Vite Build System
            </span>
            <span className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
              D3.js & Recharts
            </span>
            <span className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
              Lucide Icons
            </span>
            <span className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
              Gemini AI Integration Ready
            </span>
          </div>
        </div>
      </section>

      {/* 7. PLANES (PRÓXIMAMENTE) */}
      <section id="planes" className="py-20 md:py-28 bg-slate-50 px-6 md:px-12 text-center max-w-7xl mx-auto">
        <div className="space-y-16">
          <div className="max-w-3xl mx-auto space-y-3.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Planes de Suscripción
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight text-slate-950">
              Planes Adaptados a Cada Tamaño de Empresa
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
              Ofrecemos esquemas flexibles para consultores independientes, PyMEs en crecimiento y corporaciones multinacionales con soporte prioritario.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            {/* Plan 1 */}
            <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl relative flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 w-fit block">
                  Próximamente
                </span>
                <h3 className="text-base font-extrabold text-slate-950 font-display">SST Profesional</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">Ideal para un único profesional de SST que gestiona su propio equipo interno.</p>
                <div className="text-2xl font-black text-slate-950 font-mono pt-2">$49 <span className="text-xs text-slate-400 font-medium">USD/mes</span></div>
              </div>
              <button disabled className="mt-6 w-full py-2.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl border border-slate-200 cursor-not-allowed text-center">
                Elegir Plan (Próximamente)
              </button>
            </div>

            {/* Plan 2 */}
            <div className="bg-white border-2 border-indigo-600 p-6 md:p-8 rounded-3xl relative flex flex-col justify-between shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-sm">
                Más Elegido
              </div>
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-extrabold text-slate-950 font-display">Multi-Empresa</h3>
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 w-fit">
                    Próximamente
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">Perfecto para consultores independientes de SST que atienden a múltiples empresas clientes.</p>
                <div className="text-2xl font-black text-slate-950 font-mono pt-2">$99 <span className="text-xs text-slate-400 font-medium">USD/mes</span></div>
              </div>
              <button disabled className="mt-6 w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl cursor-not-allowed text-center opacity-85">
                Elegir Plan (Próximamente)
              </button>
            </div>

            {/* Plan 3 */}
            <div className="bg-white border border-slate-200/80 p-6 md:p-8 rounded-3xl relative flex flex-col justify-between">
              <div className="space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 w-fit block">
                  Próximamente
                </span>
                <h3 className="text-base font-extrabold text-slate-950 font-display">Corporativo Enterprise</h3>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">Solución robusta para grandes empresas, con hosting dedicado y soporte API con IA.</p>
                <div className="text-2xl font-black text-slate-950 font-mono pt-2">Personalizado</div>
              </div>
              <button disabled className="mt-6 w-full py-2.5 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl border border-slate-200 cursor-not-allowed text-center">
                Contactar Ventas
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 8. TESTIMONIOS (ESTRUCTURA) */}
      <section id="testimonios" className="py-20 md:py-28 bg-white border-t border-slate-200/80 px-6 md:px-12 text-left max-w-7xl mx-auto">
        <div className="space-y-16">
          <div className="max-w-3xl space-y-3.5">
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Testimonios de Clientes
            </span>
            <h2 className="text-3xl md:text-4xl font-black font-display tracking-tight text-slate-950">
              ¿Qué dicen los expertos en Talento y SST?
            </h2>
            <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed">
              Descubre cómo directores de recursos humanos y consultores legales de Seguridad y Salud en el Trabajo han optimizado sus auditorías con nuestra plataforma.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Testimonio 1 */}
            <div className="bg-slate-50 border border-slate-200/60 p-6 md:p-8 rounded-3xl space-y-6 relative">
              <Quote className="w-10 h-10 text-indigo-100 absolute top-4 right-4" />
              <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed italic relative z-10">
                "La generación automática del Diagnóstico de Gerencia nos ahorró semanas de trabajo. La plataforma permite mapear la demografía completa de más de 300 colaboradores y presentarlo en un formato impecable de forma instantánea."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-black text-xs">
                  CP
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-950">Carlos Pérez</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Director de Gestión Humana — TechCorp</p>
                </div>
              </div>
            </div>

            {/* Testimonio 2 */}
            <div className="bg-slate-50 border border-slate-200/60 p-6 md:p-8 rounded-3xl space-y-6 relative">
              <Quote className="w-10 h-10 text-indigo-100 absolute top-4 right-4" />
              <p className="text-xs md:text-sm text-slate-600 font-semibold leading-relaxed italic relative z-10">
                "Como asesora externa de múltiples empresas, People Insight IA se convirtió en mi herramienta favorita. La facilidad para cambiar de identidad corporativa en el módulo de configuración y descargar los PDF personalizados cumple con todas las exigencias de ley colombiana."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-black text-xs">
                  MG
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-950">Marta Gómez</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consultora Senior de SG-SST</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. FINAL CTA CALL */}
      <section className="bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white py-16 md:py-24 px-6 md:px-12 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-indigo-600/10 rounded-full blur-[110px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <h2 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
            Toma el Control Inteligente del Talento Humano Hoy
          </h2>
          <p className="text-xs md:text-sm text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
            Únete a las organizaciones que ya utilizan Inteligencia Artificial para cuidar a su personal, mitigar riesgos de salud ocupacional e impulsar un clima organizacional favorable.
          </p>
          <div>
            <button 
              onClick={onEnterPlatform}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-indigo-600/20 hover:shadow-2xl hover:shadow-indigo-600/30 active:scale-98 inline-flex items-center gap-2 cursor-pointer group"
            >
              <span>Ingresar a la Plataforma</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-slate-950 text-slate-400 text-xs py-12 px-6 md:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
                PI
              </div>
              <span className="font-extrabold text-white text-sm tracking-tight">People Insight IA</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-500">
              SaaS de analítica predictiva y diagnóstico integral de clima, bienestar y SG-SST mediante Inteligencia Artificial.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Enlaces Rápidos</h4>
            <ul className="space-y-1.5 text-[11px] font-semibold">
              <li><a href="#caracteristicas" className="hover:text-white transition-colors">Características</a></li>
              <li><a href="#modulos" className="hover:text-white transition-colors">Módulos</a></li>
              <li><a href="#beneficios" className="hover:text-white transition-colors">Beneficios</a></li>
              <li><a href="#tecnologias" className="hover:text-white transition-colors">Stack Tecnológico</a></li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Módulos Clave</h4>
            <ul className="space-y-1.5 text-[11px] font-semibold text-slate-500">
              <li>Caracterización Sociodemográfica</li>
              <li>Clima Organizacional</li>
              <li>Riesgo Psicosocial & Estrés</li>
              <li>Plan de Bienestar e Intervención</li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Contacto & Soporte</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              ¿Tienes dudas o necesitas una demostración corporativa personalizada? Contáctanos de inmediato.
            </p>
            <p className="text-[11px] text-indigo-400 font-bold">soporte@peopleinsight.ia</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900 text-center text-[10px] text-slate-600 font-mono flex flex-col sm:flex-row justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} People Insight IA. Todos los derechos reservados.</span>
          <span>Desarrollado para la Gestión Inteligente del Talento & SG-SST</span>
        </div>
      </footer>

    </div>
  );
}
