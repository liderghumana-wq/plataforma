import React from 'react';
import { Smile, Sparkles, ArrowRight, Activity, ShieldAlert, FileSpreadsheet, HeartHandshake, FileText } from 'lucide-react';
import { DemographicsData } from '../types';
import { useCompanySettings } from '../utils/companySettings';

interface WelcomeScreenProps {
  onStartAnalysis: () => void;
  data: DemographicsData | null;
}

export default function WelcomeScreen({ onStartAnalysis, data }: WelcomeScreenProps) {
  const settings = useCompanySettings();
  const companyName = settings.nombre || 'Mi Empresa';
  const logoUrl = settings.logoUrl;

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white font-sans">
      {/* Decorative blurred backgrounds */}
      <div className="absolute top-0 right-0 w-[45%] h-[45%] bg-indigo-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-5 md:px-12 flex justify-between items-center border-b border-white/5 bg-slate-950/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Brand Logo or Icon */}
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-xl shadow-lg border border-white/10" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center bg-cyan-400 rounded-xl shadow-lg shadow-cyan-400/20">
              <Smile className="w-6 h-6 text-slate-950" />
            </div>
          )}
          <div>
            <span className="text-lg font-black tracking-tight font-display text-white">{companyName}</span>
            <p className="text-[9px] text-cyan-300 font-bold tracking-wider -mt-1 uppercase">Sistema de Gestión SG-SST</p>
          </div>
        </div>
        <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white/10 text-cyan-300 border border-white/10 tracking-wider">
          MÓDULO SG-SST
        </span>
      </header>

      {/* Main Grid Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-6 py-12 md:px-12 max-w-7xl mx-auto gap-12 w-full z-10">
        {/* Left Side: Copy and call-to-actions */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Sistema Inteligente de Caracterización</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight font-display text-white">
            HAPPY INSIGHT <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">IA</span>
          </h1>

          <p className="text-xl md:text-2xl font-medium text-slate-300">
            Plataforma Inteligente para la Gestión Sociodemográfica y Bienestar Laboral.
          </p>

          <p className="text-slate-400 max-w-xl text-sm md:text-base leading-relaxed mx-auto lg:mx-0 font-medium">
            Diseñada especialmente para el área de **Seguridad y Salud en el Trabajo (SG-SST)** de {companyName}. Automatiza el diagnóstico sociodemográfico, explora indicadores de clima, y genera planes de bienestar y recomendaciones de intervención personalizadas con Inteligencia Artificial.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              id="btn-welcome-enter"
              onClick={onStartAnalysis}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 text-slate-950 text-base font-extrabold rounded-xl shadow-xl shadow-cyan-400/10 hover:shadow-cyan-400/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>Iniciar Análisis</span>
              <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="text-slate-400 text-xs flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Conexión Segura Gemini Engine</span>
            </div>
          </div>
        </div>

        {/* Right Side: Logotipo visual o logo cargado */}
        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
          <div className="relative p-8 bg-slate-900/60 rounded-3xl border border-white/10 backdrop-blur-md shadow-2xl w-full">
            
            {logoUrl ? (
              <div className="flex flex-col items-center justify-center bg-slate-950/40 p-6 rounded-2xl border border-white/5 mb-6">
                <img src={logoUrl} alt="Logo Corporativo" className="max-h-48 max-w-full object-contain rounded-xl shadow-2xl" referrerPolicy="no-referrer" />
              </div>
            ) : (
              /* Logo grid representation using the real brand color blocks from the uploaded asset */
              <div className="grid grid-cols-3 gap-2 bg-slate-950/40 p-5 rounded-2xl relative overflow-hidden mb-6">
                {/* Row 1 */}
                <div className="aspect-square bg-indigo-600 rounded-xl flex flex-col items-center justify-center text-[10px] font-black text-white shadow-md">
                  <span>BPO</span>
                </div>
                <div className="aspect-square bg-purple-600 rounded-xl flex flex-col items-center justify-center text-[10px] font-black text-white shadow-md">
                  <span>HAPP</span>
                </div>
                <div className="aspect-square bg-purple-400 rounded-xl flex flex-col items-center justify-center text-[10px] font-black text-white shadow-md">
                  <span>IFY®</span>
                </div>

                {/* Row 2 (With the smile conector) */}
                <div className="aspect-square bg-blue-700 rounded-xl flex items-center justify-center shadow-md relative">
                  <div className="absolute w-3.5 h-3.5 bg-white rounded-full left-4 bottom-4" />
                </div>
                <div className="aspect-square bg-blue-500 rounded-xl flex items-center justify-center shadow-md relative">
                  {/* Curved smile line */}
                  <div className="absolute bottom-0 left-0 right-0 h-5 bg-transparent border-b-4 border-white rounded-b-full mx-1.5 mb-2" />
                </div>
                <div className="aspect-square bg-slate-100 rounded-xl flex items-center justify-center shadow-md relative">
                  <div className="absolute w-3.5 h-3.5 bg-slate-800 rounded-full right-4 bottom-4" />
                </div>

                {/* Row 3 */}
                <div className="aspect-square bg-teal-600 rounded-xl flex flex-col items-center justify-center text-[10px] font-black text-white shadow-md">
                  <span>SG</span>
                </div>
                <div className="aspect-square bg-cyan-600 rounded-xl flex flex-col items-center justify-center text-[10px] font-black text-white shadow-md">
                  <span>SST</span>
                </div>
                <div className="aspect-square bg-cyan-400 rounded-xl flex flex-col items-center justify-center text-[10px] font-black text-slate-950 shadow-md">
                  <span>BIENESTAR</span>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm font-black tracking-widest text-cyan-400 uppercase">"{logoUrl ? companyName : "Respondemos con una sonrisa"}"</p>
              <p className="text-slate-400 text-[10px] mt-1">Plataforma Tecnológica de Diagnóstico Sociodemográfico</p>
            </div>

            {data ? (
              <div className="mt-6 border-t border-white/5 pt-4 flex justify-between text-center text-xs text-slate-400 animate-fade-in">
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-sm">{data.totalEmployees}</span>
                  <span className="text-[10px]">Colaboradores</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-sm">{data.averageAge} años</span>
                  <span className="text-[10px]">Edad Promedio</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col">
                  <span className="font-extrabold text-white text-sm">{data.wellbeingIndex || 83.4}%</span>
                  <span className="text-[10px]">Índice Bienestar</span>
                </div>
              </div>
            ) : (
              <div className="mt-6 border-t border-white/5 pt-4 grid grid-cols-3 gap-1.5 text-center text-[10px] text-slate-400">
                <div className="flex flex-col bg-slate-950/30 p-2 rounded-lg border border-white/5">
                  <FileSpreadsheet className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
                  <span className="font-black text-white">100% Dinámico</span>
                  <span className="text-[8px] mt-0.5 text-slate-500">Carga Excel</span>
                </div>
                <div className="flex flex-col bg-slate-950/30 p-2 rounded-lg border border-white/5">
                  <HeartHandshake className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
                  <span className="font-black text-white">Recomendaciones</span>
                  <span className="text-[8px] mt-0.5 text-slate-500">Motor de IA</span>
                </div>
                <div className="flex flex-col bg-slate-950/30 p-2 rounded-lg border border-white/5">
                  <FileText className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
                  <span className="font-black text-white">Planes SST</span>
                  <span className="text-[8px] mt-0.5 text-slate-500">Plan de Acción</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center border-t border-white/5 bg-slate-950/40 text-slate-500 text-xs">
        <p>© 2026 {companyName} - Área de Seguridad y Salud en el Trabajo. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
