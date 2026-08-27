import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Brain, 
  AlertTriangle, 
  HelpCircle, 
  ChevronRight, 
  CheckCircle2, 
  ShieldCheck, 
  RefreshCw, 
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { PsicosocialData, PsicosocialAIAnalysis, PsicosocialAlert } from '../psicosocial.types';

interface PsicosocialAnalysisProps {
  data: PsicosocialData;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

export const PsicosocialAnalysis: React.FC<PsicosocialAnalysisProps> = ({ data }) => {
  const [analysis, setAnalysis] = useState<PsicosocialAIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Suggested questions
  const chatSuggestions = [
    '¿Cuál es el diagnóstico general de riesgo psicosocial?',
    '¿Cuáles son las áreas con mayor riesgo y prioridad?',
    'Sugiéreme un plan de intervención para mitigar el estrés'
  ];

  // Fetch AI Analysis from server or fallback on mount or data change
  const triggerAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/psicosocial/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ psicosocialData: data })
      });

      if (response.ok) {
        const resJson = await response.json();
        setAnalysis(resJson.analysis);
      } else {
        throw new Error('No se pudo generar el análisis de IA de forma óptima.');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión con el motor de IA.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    triggerAnalysis();
    // Initialize chat with greeting
    setChatMessages([
      {
        id: 'greet-1',
        sender: 'assistant',
        text: `¡Hola! Soy **Happy Psicosocial IA**, tu consultor de bienestar corporativo y SST. He procesado con éxito los resultados de la Batería de Riesgo Psicosocial (${data.totalParticipants} evaluados). \n\n¿En qué dimensión o segmento demográfico te gustaría profundizar hoy? Puedo proponerte ideas para tu Plan de Intervención.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [data]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // Handle chatbot query
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text) return;

    if (!textToSend) setChatInput('');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMessage]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/psicosocial/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, psicosocialData: data })
      });

      if (response.ok) {
        const reply = await response.json();
        setChatMessages(prev => [...prev, {
          id: `reply-${Date.now()}`,
          sender: 'assistant',
          text: reply.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error('Error recuperando la respuesta.');
      }
    } catch (err: any) {
      setChatMessages(prev => [...prev, {
        id: `reply-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Lo siento, experimenté una interrupción de conexión con el motor de IA. Por favor, inténtalo de nuevo.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div id="psicosocial-analysis-container" className="grid grid-cols-1 xl:grid-cols-12 gap-8">
      {/* Columna Izquierda: Informe y Diagnóstico IA (8/12 cols) */}
      <div id="psicosocial-ai-doc" className="xl:col-span-8 space-y-8">
        
        {/* Loader de Análisis */}
        {isLoading && (
          <div id="analysis-loader" className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <Brain className="w-12 h-12 text-indigo-600 animate-pulse mb-4" />
            <h3 className="text-lg font-bold text-slate-800 mb-2">Generando Diagnóstico Estratégico</h3>
            <p className="text-sm text-slate-500 max-w-md">Gemini está analizando los sesgos de riesgo intralaboral, extralaboral, niveles de estrés y priorizando las áreas críticas organizacionales...</p>
          </div>
        )}

        {/* Mostrar Contenido del Análisis */}
        {!isLoading && analysis && (
          <div id="analysis-content" className="space-y-8">
            
            {/* Resumen Ejecutivo y Diagnóstico */}
            <div id="summary-section" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 rounded-full translate-x-8 -translate-y-8" />
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Interpretación Inteligente</h3>
                  <p className="text-xs text-slate-500">Evaluación consolidada del riesgo de la fuerza de trabajo</p>
                </div>
              </div>

              <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Resumen Ejecutivo</h4>
                  <p className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50">{analysis.executiveSummary}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Interpretación del Riesgo</h4>
                  <p>{analysis.riskInterpretation}</p>
                </div>
              </div>
            </div>

            {/* Factores Protectores, Críticos y Prioritarios */}
            <div id="factors-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Factores Protectores */}
              <div id="card-protectores" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Factores Protectores
                </h4>
                <ul className="space-y-3">
                  {analysis.protectiveFactors.map((f, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Factores Críticos */}
              <div id="card-criticos" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                  Factores Críticos
                </h4>
                <ul className="space-y-3">
                  {analysis.criticalFactors.map((f, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-2">
                      <span className="text-red-500 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Factores Prioritarios */}
              <div id="card-prioritarios" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Factores Prioritarios
                </h4>
                <ul className="space-y-3">
                  {analysis.priorityFactors.map((f, i) => (
                    <li key={i} className="text-xs text-slate-600 flex gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Hallazgos, Conclusiones y Recomendaciones */}
            <div id="findings-section" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-500" />
                Hallazgos y Recomendaciones Clínicas/Técnicas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hallazgos y Conclusiones */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Hallazgos Principales</h4>
                    <ul className="space-y-3">
                      {analysis.findings.map((finding, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex gap-3 p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                          <span className="text-indigo-600 font-bold font-mono">#{idx+1}</span>
                          <span>{finding}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">Conclusiones del Diagnóstico</h4>
                    <ul className="space-y-3">
                      {analysis.conclusions.map((concl, idx) => (
                        <li key={idx} className="text-xs text-slate-600 flex gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>{concl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recomendaciones */}
                <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-indigo-950 mb-3 uppercase tracking-wider">Recomendaciones de Intervención</h4>
                    <ul className="space-y-4">
                      {analysis.recommendations.map((recom, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex gap-3 leading-relaxed">
                          <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0" />
                          <span>{recom}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-6 border-t border-indigo-100/50 flex items-center gap-3 text-xs text-indigo-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Conforme a la normatividad de SST, estos resultados deben ser presentados al COPASST.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Alertas Críticas de Seguridad */}
            <div id="alerts-section" className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Alertas Críticas Automatizadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.alerts.map((alert: PsicosocialAlert) => (
                  <div
                    key={alert.id}
                    id={`alert-${alert.id}`}
                    className={`p-4 rounded-2xl border flex gap-3 items-start ${
                      alert.severity === 'Alta'
                        ? 'bg-red-50 border-red-100 text-red-800'
                        : 'bg-amber-50 border-amber-100 text-amber-800'
                    }`}
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-sm leading-none">{alert.title}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          alert.severity === 'Alta' ? 'bg-red-200 text-red-900' : 'bg-amber-200 text-amber-900'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-xs opacity-90 leading-relaxed">{alert.description}</p>
                      <span className="text-[10px] mt-2 block font-semibold underline">Foco: {alert.target}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Columna Derecha: Asistente Chatbot Happy Psicosocial IA (4/12 cols) */}
      <div id="psicosocial-chatbot" className="xl:col-span-4 h-[calc(100vh-200px)] min-h-[550px] sticky top-24 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col justify-between overflow-hidden">
        {/* Cabecera Chat */}
        <div id="chat-header" className="p-4 border-b border-slate-50 bg-indigo-50/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Happy Psicosocial IA</h3>
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Consultor SST Inteligente
            </p>
          </div>
        </div>

        {/* Mensajes Chat */}
        <div id="chat-messages-area" className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1 font-mono">{msg.time}</span>
            </div>
          ))}

          {isChatLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-400 p-2 bg-slate-50 rounded-xl max-w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>Happy está estructurando el análisis...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input y Sugerencias */}
        <div id="chat-footer-area" className="p-4 border-t border-slate-50 space-y-3 bg-white">
          {/* Sugerencias de consulta rápida */}
          <div className="flex flex-wrap gap-1.5 pb-2">
            {chatSuggestions.map((sug, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(sug)}
                className="text-[10px] font-medium text-indigo-700 bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100/40 rounded-full px-2.5 py-1 text-left transition-colors"
                disabled={isChatLoading}
              >
                {sug}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Pregúntame sobre dimensiones, cargos..."
              className="flex-1 px-4 py-2.5 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs"
              disabled={isChatLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-colors shrink-0"
              disabled={isChatLoading}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
