import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, AlertCircle, CheckCircle2, Play, RefreshCw, Send, Brain, Bot, User, CheckSquare, Square, HeartHandshake, Layers
} from 'lucide-react';
import { ClimateData, ClimateRecommendation } from '../clima.types';
import { useEmpresa } from '../../configuracion/useEmpresa';

interface ClimaRecomendacionesProps {
  climateData: ClimateData;
  onAddToPlanAction: (rec: ClimateRecommendation) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ia';
  text: string;
  timestamp: string;
}

export default function ClimaRecomendaciones({ climateData, onAddToPlanAction }: ClimaRecomendacionesProps) {
  const { activeCompanyId } = useEmpresa();
  
  // Scoped state for local persistence
  const recsStorageKey = `happyclima_recs_${activeCompanyId}`;
  const chatStorageKey = `happyclima_chat_${activeCompanyId}`;

  const [recommendations, setRecommendations] = useState<ClimateRecommendation[]>([]);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [recsError, setRecsError] = useState<string | null>(null);

  // Chatbot states
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Completed sub-tasks mapping: Record<recId, Record<subTaskIdx, boolean>>
  const [completedSteps, setCompletedSteps] = useState<Record<string, Record<number, boolean>>>(() => {
    const saved = localStorage.getItem(`happyclima_steps_${activeCompanyId}`);
    return saved ? JSON.parse(saved) : {};
  });

  // Load from localStorage on mount/activeCompanyId change
  useEffect(() => {
    const savedRecs = localStorage.getItem(recsStorageKey);
    if (savedRecs) {
      setRecommendations(JSON.parse(savedRecs));
    } else {
      setRecommendations([]);
    }

    const savedChat = localStorage.getItem(chatStorageKey);
    if (savedChat) {
      setChatMessages(JSON.parse(savedChat));
    } else {
      setChatMessages([
        {
          id: 'welcome-msg',
          sender: 'ia',
          text: `¡Hola! Soy **Happy Clima IA**, tu consultor de Desarrollo Organizacional. 
          
Puedo ayudarte a interpretar los resultados del clima, explicar las causas de los puntajes bajos de tus dimensiones o idear campañas de intervención. Puedes preguntarme cosas como:
- *¿Cuáles son los principales hallazgos de mi clima?*
- *¿Cómo podemos mejorar la favorabilidad en Liderazgo?*
- *Dame un plan de acción estratégico para mejorar la comunicación.*`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [activeCompanyId]);

  // Sync completed steps
  useEffect(() => {
    localStorage.setItem(`happyclima_steps_${activeCompanyId}`, JSON.stringify(completedSteps));
  }, [completedSteps, activeCompanyId]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleGenerateRecommendations = async () => {
    setIsLoadingRecs(true);
    setRecsError(null);

    try {
      const response = await fetch('/api/clima/generate-recs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ climateData })
      });

      if (!response.ok) {
        throw new Error('Error en la comunicación con el motor de recomendaciones.');
      }

      const result = await response.json();
      if (result.recommendations) {
        setRecommendations(result.recommendations);
        localStorage.setItem(recsStorageKey, JSON.stringify(result.recommendations));
      } else {
        throw new Error('No se generaron recomendaciones válidas.');
      }
    } catch (err: any) {
      setRecsError(err.message || 'Error procesando recomendaciones de IA.');
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleToggleStep = (recId: string, stepIdx: number) => {
    setCompletedSteps(prev => {
      const recSteps = prev[recId] ? { ...prev[recId] } : {};
      recSteps[stepIdx] = !recSteps[stepIdx];
      return {
        ...prev,
        [recId]: recSteps
      };
    });
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/clima/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.text, climateData })
      });

      if (!response.ok) {
        throw new Error('Ocurrió un error consultando a la IA.');
      }

      const result = await response.json();
      const iaMsg: ChatMessage = {
        id: `ia-${Date.now()}`,
        sender: 'ia',
        text: result.text || 'No pude procesar la solicitud.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedChat = [...chatMessages, userMsg, iaMsg];
      setChatMessages(updatedChat);
      localStorage.setItem(chatStorageKey, JSON.stringify(updatedChat));
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ia-err-${Date.now()}`,
        sender: 'ia',
        text: `⚠️ **Error de conexión:** No se pudo procesar la consulta por: ${err.message || err}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleClearChat = () => {
    const cleared = [
      {
        id: 'welcome-msg',
        sender: 'ia',
        text: 'Historial reiniciado. Pregúntame lo que necesites sobre el clima de tu empresa.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
    setChatMessages(cleared);
    localStorage.removeItem(chatStorageKey);
  };

  // UI prioritization mapping
  const getPriorityBadge = (prio: string) => {
    switch (prio) {
      case 'Alta': return 'bg-rose-50 text-rose-600 border border-rose-100';
      case 'Media': return 'bg-amber-50 text-amber-600 border border-amber-100';
      default: return 'bg-blue-50 text-blue-600 border border-blue-100';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
      
      {/* 1. MÓDULO RECOMENDACIONES DE PLAN DE ACCION IA (col-span-7) */}
      <div className="lg:col-span-7 space-y-6">
        
        {/* Disparador de Recomendaciones */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-black text-slate-800 font-display uppercase tracking-wider flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600 animate-pulse" />
                <span>Plan de Acción Inteligente IA</span>
              </h2>
              <p className="text-xs text-slate-500 font-semibold">Toma los scores de clima y diseña un plan táctico de intervención por prioridad.</p>
            </div>
            
            <button
              onClick={handleGenerateRecommendations}
              disabled={isLoadingRecs}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoadingRecs ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analizando con IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>Generar Acciones IA</span>
                </>
              )}
            </button>
          </div>

          {recsError && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 text-red-800 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{recsError}</span>
            </div>
          )}
        </div>

        {/* Listado de Recomendaciones */}
        {recommendations.length > 0 ? (
          <div className="space-y-5">
            {recommendations.map((rec) => {
              const totalSteps = rec.actionSteps.length;
              const completedCount = Object.values(completedSteps[rec.id] || {}).filter(Boolean).length;
              const percentCompleted = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

              return (
                <div key={rec.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs space-y-4">
                  {/* Card Header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                        Dimensión: {rec.dimensionName}
                      </span>
                      <h3 className="text-sm font-black text-slate-800 font-display leading-tight">{rec.title}</h3>
                    </div>
                    
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${getPriorityBadge(rec.priority)}`}>
                      Prioridad {rec.priority}
                    </span>
                  </div>

                  {/* Card Body */}
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{rec.description}</p>

                  {/* Progress Line */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-50">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>PLAN DE TRABAJO TÁCTICO</span>
                      <span className="font-mono text-indigo-600">{completedCount} / {totalSteps} Pasos ({percentCompleted}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300" 
                        style={{ width: `${percentCompleted}%` }} 
                      />
                    </div>
                  </div>

                  {/* Action Steps */}
                  <div className="space-y-2.5 pt-2">
                    {rec.actionSteps.map((step, idx) => {
                      const isDone = !!completedSteps[rec.id]?.[idx];
                      return (
                        <div 
                          key={idx} 
                          onClick={() => handleToggleStep(rec.id, idx)}
                          className={`p-3 rounded-xl border flex items-center gap-3 text-xs font-semibold cursor-pointer transition-all ${
                            isDone 
                              ? 'bg-slate-50/50 border-slate-200 text-slate-400 line-through' 
                              : 'bg-white hover:bg-slate-50/30 border-slate-100 text-slate-700 shadow-3xs'
                          }`}
                        >
                          {isDone ? (
                            <CheckSquare className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-4.5 h-4.5 text-slate-300 shrink-0" />
                          )}
                          <span className="flex-1 leading-snug">{step}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Card Footer */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-bold">
                    <span>RESPONSABLE: <span className="text-slate-600">{rec.responsible || 'Director de Gestión Humana'}</span></span>
                    
                    <button
                      onClick={() => onAddToPlanAction(rec)}
                      className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 rounded-xl font-bold flex items-center justify-center gap-1.5 self-end sm:self-center cursor-pointer transition-all"
                    >
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Sincronizar a Plan Operativo</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-10 rounded-3xl border border-slate-100 shadow-2xs text-center">
            <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3 animate-pulse" />
            <h3 className="font-extrabold text-slate-800 text-sm">Plan de Acción IA Vacío</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">Haz clic en "Generar Acciones IA" para analizar las dimensiones críticas de tu clima y construir las campañas de intervención.</p>
          </div>
        )}

      </div>

      {/* 2. CHATBOT CONSULTOR DE CLIMA (col-span-5) */}
      <div className="lg:col-span-5">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-2xs flex flex-col h-[650px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="bg-slate-950 p-4 border-b border-slate-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-500 text-white rounded-lg">
                <Bot className="w-4 h-4" />
              </div>
              <div className="text-left">
                <h3 className="text-xs font-black tracking-tight font-display">Happy Clima IA</h3>
                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">Consultor Organizacional</p>
              </div>
            </div>
            
            <button
              onClick={handleClearChat}
              className="text-[9px] text-slate-400 hover:text-white font-black uppercase tracking-wider hover:underline cursor-pointer"
            >
              Reiniciar
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {chatMessages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                    isUser ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  
                  <div className={`max-w-[80%] p-3 rounded-2xl text-left shadow-3xs leading-relaxed space-y-1.5 ${
                    isUser 
                      ? 'bg-indigo-600 text-white rounded-tr-xs' 
                      : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-xs'
                  }`}>
                    {/* Simplified markdown parsing for bold text */}
                    <div className="whitespace-pre-wrap font-semibold">
                      {msg.text.split('\n').map((line, lIdx) => {
                        let parsedLine = line;
                        // Replace markdown bold tags (**text**) with bold jsx elements
                        const parts = parsedLine.split(/\*\*(.*?)\*\*/g);
                        return (
                          <p key={lIdx}>
                            {parts.map((part, pIdx) => pIdx % 2 === 1 ? <strong key={pIdx} className={isUser ? 'text-white' : 'text-slate-900 font-black'}>{part}</strong> : part)}
                          </p>
                        );
                      })}
                    </div>
                    <span className={`block text-[8px] text-right font-bold uppercase tracking-wider ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {isSendingChat && (
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg shrink-0">
                  <Bot className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-slate-50 text-slate-500 border border-slate-100 p-3 rounded-2xl rounded-tl-xs text-left max-w-[80%] flex items-center gap-1.5 font-bold">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span>IA redactando respuesta...</span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Pregúntale a Happy Clima..."
              disabled={isSendingChat}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-800 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isSendingChat || !chatInput.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all shadow-3xs cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
