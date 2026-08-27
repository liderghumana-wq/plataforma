import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  LifeBuoy, 
  MessageSquare, 
  FileText, 
  Download, 
  Send, 
  CheckCircle, 
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Brain
} from 'lucide-react';
import { downloadExcelTemplate } from '../utils/excelTemplateGenerator';

interface AyudaTabProps {
  onRestoreData: () => void;
  uploadedFile: any;
}

export default function AyudaTab({ onRestoreData, uploadedFile }: AyudaTabProps) {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketSuccess, setTicketSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: '¿Cómo puedo estructurar el archivo Excel para que el sistema lo lea?',
      a: 'Para garantizar la compatibilidad del motor, te recomendamos descargar la plantilla sociodemográfica (.xlsx) desde el inicio o el cargador. El archivo contiene 17 columnas estandarizadas como Edad, Sexo, Estado Civil, Nivel Escolar, Sede y Riesgos de Salud.'
    },
    {
      q: '¿Qué es el "AIEngine" de la plataforma?',
      a: 'AIEngine es el motor central de Inteligencia Artificial de Insight People IA. Analiza las tendencias y vacíos del SG-SST y el Clima de tu organización de forma automática para arrojar hallazgos, fortalezas, nivel de riesgo y redactar prioridades y un plan de acción ejecutivo.'
    },
    {
      q: '¿Cómo se procesa la información de Clima Organizacional?',
      a: 'El módulo de Clima cuenta con su propio motor analítico. Puedes subir el consolidado de tu encuesta de clima en la opción "Clima Organizacional" -> "Cargar Base Clima", y el sistema recalculará los puntajes por dimensiones (Liderazgo, Compensación, etc.) e indicará el eNPS corporativo.'
    },
    {
      q: '¿Cómo descargo los informes para presentarlos a Gerencia o Ministerio?',
      a: 'Dirígete al módulo de "Informes" y selecciona "Informe Ejecutivo para Gerencia". La vista está formateada con estilos profesionales listos para imprimir en PDF (Ctrl + P) conservando los gráficos y tablas de indicadores sin desconfigurarse.'
    }
  ];

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMsg) return;
    setTicketSuccess(true);
    setTimeout(() => {
      setTicketSubject('');
      setTicketMsg('');
      setTicketSuccess(false);
    }, 3000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="space-y-8 animate-fade-in text-left max-w-5xl mx-auto py-2">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 rounded-3xl border border-slate-800 shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-cyan-500/30 text-cyan-200 border border-cyan-400/20">
            <LifeBuoy className="w-3.5 h-3.5 text-cyan-300" />
            <span>Centro de Ayuda & Soporte Técnico</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-white leading-tight">
            ¿Cómo podemos apoyarte hoy?
          </h2>
          <p className="text-xs text-slate-300 font-medium">
            Accede a documentación de referencia, soporte directo, plantillas de cumplimiento y herramientas de mantenimiento rápido del sistema.
          </p>
        </div>
        
        {/* Restore Demo button */}
        <div className="shrink-0">
          <button
            onClick={() => {
              onRestoreData();
              alert('Se han restaurado los datos de demostración de la empresa.');
            }}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-md text-white"
          >
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Restaurar Base Demo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: FAQs & Downloads (7/12) */}
        <div className="space-y-6 md:col-span-7">
          
          {/* FAQs section */}
          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <HelpCircle className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Preguntas Frecuentes</h3>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="border border-slate-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-3.5 text-left bg-slate-50/50 hover:bg-slate-50 flex items-center justify-between text-xs font-black text-slate-800 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-white text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Downloads Section */}
          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <BookOpen className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Plantillas y Recursos SG-SST</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Template 1 */}
              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg w-fit">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900">Plantilla de Carga Sociodemográfica</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Estructura oficial para la nómina de colaboradores.</p>
                </div>
                <button
                  onClick={downloadExcelTemplate}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Descargar Plantilla</span>
                </button>
              </div>

              {/* Template 2 */}
              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="p-1.5 bg-cyan-50 text-cyan-600 rounded-lg w-fit">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-xs text-slate-900">Guía de Cumplimiento Resol. 0312</h4>
                  <p className="text-[10px] text-slate-500 font-medium">Estándares mínimos de SST de acuerdo al tamaño de empresa.</p>
                </div>
                <a
                  href="https://www.mintrabajo.gov.co/documents/20147/59995826/Resolucion+0312+de+2019+Estandares+Minimos+SST.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-slate-950 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Ver Guía PDF</span>
                </a>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column: Support Ticket Form (5/12) */}
        <div className="md:col-span-5">
          <div className="bg-white border border-slate-200/60 rounded-3xl shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <MessageSquare className="w-4.5 h-4.5 text-indigo-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Enviar Solicitud / Ticket</h3>
            </div>

            {ticketSuccess ? (
              <div className="p-6 text-center space-y-3.5 bg-emerald-50 border border-emerald-100 rounded-2xl animate-scale-up">
                <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                <div>
                  <h4 className="font-extrabold text-slate-900 text-xs">¡Solicitud Enviada!</h4>
                  <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed">
                    Hemos registrado tu ticket de soporte técnico. Un asesor de Insight People IA te responderá al correo corporativo registrado.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendTicket} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Asunto del Requerimiento</label>
                  <input
                    type="text"
                    value={ticketSubject}
                    onChange={(e) => setTicketSubject(e.target.value)}
                    placeholder="Ej: Ayuda para estructurar Excel Clima"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-black text-slate-400">Descripción detallada</label>
                  <textarea
                    rows={4}
                    value={ticketMsg}
                    onChange={(e) => setTicketMsg(e.target.value)}
                    placeholder="Escribe tu mensaje o problema aquí..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Enviar Ticket</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            <div className="p-3.5 bg-slate-50 rounded-2xl flex gap-2.5 text-[10px] text-slate-500 leading-relaxed font-semibold">
              <Info className="w-4.5 h-4.5 text-indigo-600 shrink-0 mt-0.5" />
              <span>Soporte prioritario habilitado para clientes SaaS Platino. Tiempo medio de respuesta: &lt; 2 horas hábiles.</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
