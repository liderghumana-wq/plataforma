import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  HelpCircle, 
  Bot, 
  User, 
  CheckCircle2, 
  Building2, 
  ArrowRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { onboardingService } from '../services/onboardingService';

interface OnboardingAssistantProps {
  activeCompanyId: string;
  onNavigateStep: (stepNumber: number) => void;
  onNavigateSection?: (sectionId: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  accionRecomendada?: string;
  moduloSugerido?: string;
  evidenciaReal?: string;
}

export const OnboardingAssistant: React.FC<OnboardingAssistantProps> = ({
  activeCompanyId,
  onNavigateStep,
  onNavigateSection
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: '¡Hola! Soy tu Asistente de Activación de Insight People IA. Puedo resolver dudas sobre la carga del censo, validaciones de calidad, cálculo del Health Score y configuración general de tu SG-SST. ¿En qué puedo orientarte hoy?',
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuestion, setInputQuestion] = useState('');

  const quickQuestions = [
    '¿Por qué me pide esta información corporativa?',
    '¿Cómo descargo y diligencio la plantilla Excel?',
    '¿Qué pasa si mis datos tienen errores en la validación?',
    '¿Cómo se calcula el Health Score de implementación?',
    '¿Qué indicadores se habilitan al cargar el censo?',
    '¿Cómo comparto la encuesta sociodemográfica?'
  ];

  const handleSend = (textToSend?: string) => {
    const q = textToSend || inputQuestion.trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    };

    const resp = onboardingService.getAssistantAnswer(q, activeCompanyId);

    const botMsg: ChatMessage = {
      id: `bot_${Date.now()}`,
      sender: 'assistant',
      text: resp.respuesta,
      accionRecomendada: resp.accionRecomendada,
      moduloSugerido: resp.moduloSugerido,
      evidenciaReal: resp.evidenciaReal,
      timestamp: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    if (!textToSend) setInputQuestion('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Asistente de Activación & Onboarding</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultas contextuales sobre datos, reglas de calidad y cumplimiento normativo SG-SST
            </p>
          </div>
        </div>

        <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">
          [A] Motor de Asistencia Integrado
        </span>
      </div>

      {/* Quick FAQ Pills */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Preguntas frecuentes sobre la puesta en marcha:
        </span>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((qq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qq)}
              className="px-3.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-all cursor-pointer text-left"
            >
              {qq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4 min-h-[380px] max-h-[500px] overflow-y-auto flex flex-col justify-between">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-50 text-slate-800 border border-slate-200 space-y-3'
              }`}>
                <p>{msg.text}</p>

                {msg.accionRecomendada && (
                  <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold text-slate-500">
                      💡 {msg.accionRecomendada}
                    </span>
                    {msg.moduloSugerido && (
                      <button
                        onClick={() => {
                          const stepMapping: Record<string, number> = {
                            onboarding: 1,
                            empresa: 2,
                            estructura: 3,
                            colaboradores: 4,
                            calidad_datos: 5,
                            encuesta: 6,
                            indicadores: 7
                          };
                          const targetStep = stepMapping[msg.moduloSugerido!];
                          if (targetStep) {
                            onNavigateStep(targetStep);
                          } else if (onNavigateSection) {
                            onNavigateSection(msg.moduloSugerido!);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        Ir al módulo
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}

                <div className={`text-[10px] text-right mt-1 ${msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0 font-bold text-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              placeholder="Haz una pregunta sobre el onboarding, carga de datos o indicadores..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputQuestion.trim()}
              className="p-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-2xl shadow-sm transition-colors cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
