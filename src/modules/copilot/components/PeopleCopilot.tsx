import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Trash2, 
  Plus, 
  MessageSquare, 
  Database, 
  Brain, 
  Activity, 
  ShieldAlert, 
  HeartHandshake, 
  Users, 
  Smile, 
  ArrowRight, 
  Copy, 
  FileDown, 
  Mic, 
  Paperclip,
  CheckCircle2,
  Info,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { DemographicsData } from '../../../types';
import { useCopilot } from '../hooks/useCopilot';
import { PRESET_QUESTIONS } from '../services/copilot.service';
import { CopilotDomain } from '../copilot.types';

// Domain config with icons and styling colors
const DOMAINS_CONFIG: Record<CopilotDomain, {
  name: string;
  icon: React.ComponentType<any>;
  bg: string;
  text: string;
  border: string;
  accent: string;
}> = {
  capital_humano: {
    name: 'Capital Humano',
    icon: Users,
    bg: 'bg-indigo-50/70',
    text: 'text-indigo-700',
    border: 'border-indigo-100',
    accent: 'bg-indigo-600'
  },
  sg_sst: {
    name: 'SG-SST',
    icon: ShieldAlert,
    bg: 'bg-rose-50/70',
    text: 'text-rose-700',
    border: 'border-rose-100',
    accent: 'bg-rose-600'
  },
  bienestar: {
    name: 'Bienestar',
    icon: HeartHandshake,
    bg: 'bg-emerald-50/70',
    text: 'text-emerald-700',
    border: 'border-emerald-100',
    accent: 'bg-emerald-600'
  },
  people_analytics: {
    name: 'People Analytics',
    icon: Brain,
    bg: 'bg-cyan-50/70',
    text: 'text-cyan-700',
    border: 'border-cyan-100',
    accent: 'bg-cyan-600'
  },
  clima: {
    name: 'Clima Organizacional',
    icon: Smile,
    bg: 'bg-amber-50/70',
    text: 'text-amber-700',
    border: 'border-amber-100',
    accent: 'bg-amber-500'
  },
  demografia: {
    name: 'Sociodemográfico',
    icon: Activity,
    bg: 'bg-slate-50/70',
    text: 'text-slate-700',
    border: 'border-slate-100',
    accent: 'bg-slate-600'
  }
};

interface PeopleCopilotProps {
  data: DemographicsData | null;
  companyName?: string;
}

export default function PeopleCopilot({ data, companyName = 'Mi Empresa' }: PeopleCopilotProps) {
  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    isTyping,
    currentDomain,
    setCurrentDomain,
    clearChat,
    createNewSession,
    submitQuery
  } = useCopilot(data, companyName);

  const [inputVal, setInputVal] = useState('');
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<CopilotDomain | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isTyping]);

  const handleSend = () => {
    if (!inputVal.trim() || isTyping) return;
    submitQuery(inputVal.trim());
    setInputVal('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyText = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter preset questions based on selected domain
  const filteredPresets = selectedDomainFilter === 'all'
    ? PRESET_QUESTIONS.slice(0, 4) // Show 4 default ones if "all"
    : PRESET_QUESTIONS.filter(p => p.domain === selectedDomainFilter);

  // Custom renderer for markdown-like text blocks (headings, bold, lists)
  const renderFormattedContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-black text-slate-950 font-display mt-4 mb-2 first:mt-0 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
            {line.replace('### ', '')}
          </h3>
        );
      }
      // Heading 4
      if (line.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-sm font-extrabold text-slate-850 font-display mt-3 mb-1">
            {line.replace('#### ', '')}
          </h4>
        );
      }
      // Bullet list item
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const cleanLine = line.substring(2);
        return (
          <div key={idx} className="pl-4 py-0.5 flex items-start gap-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <span className="text-indigo-500 font-bold mt-0.5">•</span>
            <span>{parseBold(cleanLine)}</span>
          </div>
        );
      }
      // Numbered list item
      if (/^\d+\.\s/.test(line)) {
        const number = line.match(/^\d+/)![0];
        const cleanLine = line.replace(/^\d+\.\s/, '');
        return (
          <div key={idx} className="pl-4 py-0.5 flex items-start gap-2 text-xs md:text-sm text-slate-700 leading-relaxed">
            <span className="text-indigo-600 font-mono font-bold text-xs mt-0.5">{number}.</span>
            <span>{parseBold(cleanLine)}</span>
          </div>
        );
      }
      // Normal paragraph
      if (line.trim() === '') return <div key={idx} className="h-2" />;
      return (
        <p key={idx} className="text-xs md:text-sm text-slate-700 leading-relaxed mb-1.5">
          {parseBold(line)}
        </p>
      );
    });
  };

  // Helper to highlight text wrapped in **bold**
  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-extrabold text-slate-950">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-10rem)] min-h-[500px] animate-fade-in relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-lg border border-slate-800 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT COLUMN: Chat Hub History & Data Grounding Status */}
      <div className="w-full xl:w-72 shrink-0 flex flex-col gap-4">
        
        {/* Grounding Context Panel */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 text-white flex flex-col justify-between relative overflow-hidden shrink-0 shadow-sm">
          <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-indigo-500/15 rounded-full blur-[40px] pointer-events-none" />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-cyan-400" />
                <span>Contexto de Datos</span>
              </span>
              <span className={`w-2 h-2 rounded-full ${data ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Empresa:</span>
                <span className="font-bold truncate max-w-[130px]">{companyName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Población:</span>
                {data ? (
                  <span className="font-black text-white">{data.totalEmployees} colaboradores</span>
                ) : (
                  <span className="text-rose-400 font-bold text-[11px]">No cargada</span>
                )}
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold">Índice Bienestar:</span>
                {data ? (
                  <span className="font-bold text-emerald-400">{data.wellbeingIndex}%</span>
                ) : (
                  <span className="text-slate-500">—</span>
                )}
              </div>
            </div>

            {data ? (
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-2.5 text-[10px] text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-200 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Sincronización Activa</span>
                </p>
                Respuestas personalizadas fundamentadas con el consolidado Excel actual.
              </div>
            ) : (
              <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-2.5 text-[10px] text-rose-300 leading-relaxed">
                Se ejecutan respuestas conceptuales por defecto hasta que cargues el Excel.
              </div>
            )}
          </div>
        </div>

        {/* Sessions Sidebar Card */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-4 flex-1 flex flex-col gap-3 min-h-[220px] shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
            <span className="text-xs font-black text-slate-900 font-display uppercase tracking-widest">
              Sesiones de Consulta
            </span>
            <button 
              onClick={createNewSession}
              className="p-1.5 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-xl transition-all cursor-pointer"
              title="Nueva Consulta"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
            {sessions.map((session) => {
              const isActive = session.id === activeSessionId;
              return (
                <button
                  key={session.id}
                  onClick={() => setActiveSessionId(session.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-center gap-2.5 cursor-pointer group ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-xs border border-indigo-600' 
                      : 'bg-slate-50/60 hover:bg-slate-100/80 text-slate-700 border border-slate-100'
                  }`}
                >
                  <MessageSquare className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
                  <div className="overflow-hidden flex-1">
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                      {session.title}
                    </p>
                    <p className={`text-[9px] mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {session.createdAt}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Clear Session Button */}
          <button
            onClick={clearChat}
            className="w-full py-2 border border-slate-150 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reiniciar Consulta</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Copilot Active Workspace */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200/60 flex flex-col overflow-hidden shadow-2xs">
        
        {/* Workspace Header Panel */}
        <div className="bg-slate-50/60 p-4 border-b border-slate-100 shrink-0 space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-5.5 h-5.5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm md:text-base font-black text-slate-900 font-display leading-none">People Copilot IA</h2>
                  <span className="bg-cyan-50 text-cyan-700 font-black text-[9px] px-2 py-0.5 rounded-md border border-cyan-200 tracking-wider uppercase">Arquitectura Prototipo</span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Especialista de IA en Capital Humano, SST, Clima, Bienestar y Analytics.
                </p>
              </div>
            </div>

            {/* Quick Actions / Download */}
            <div className="flex gap-2">
              <button
                onClick={() => showToast('Descarga estará habilitada en integración productiva.')}
                className="p-2 text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-3xs"
                title="Exportar Reporte"
              >
                <FileDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 6 Specialized Domain Selectors */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[9px] uppercase font-black text-slate-400 tracking-wider block">Áreas de Especialidad:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedDomainFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedDomainFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
                }`}
              >
                <span>Mostrar Todas</span>
              </button>
              
              {Object.entries(DOMAINS_CONFIG).map(([key, value]) => {
                const Icon = value.icon;
                const isSelected = selectedDomainFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedDomainFilter(key as CopilotDomain)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? `${value.accent} text-white border-transparent shadow-xs`
                        : `${value.bg} ${value.text} ${value.border} hover:opacity-85`
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{value.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Conversational Viewport */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin">
          {activeSession?.messages.map((message) => {
            const isBot = message.role === 'assistant';
            const domainInfo = message.domain ? DOMAINS_CONFIG[message.domain] : null;
            return (
              <div 
                key={message.id} 
                className={`flex gap-3 md:gap-4 max-w-3xl ${isBot ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div className={`w-8.5 h-8.5 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-3xs ${
                  isBot 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {isBot ? <Sparkles className="w-4 h-4" /> : 'HR'}
                </div>

                {/* Content Box */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  {/* Sender Metadata */}
                  <div className={`flex items-center gap-2 text-[10px] ${isBot ? 'justify-start' : 'justify-end'}`}>
                    <span className="font-extrabold text-slate-800">
                      {isBot ? 'People Copilot IA' : 'Tú'}
                    </span>
                    <span className="text-slate-400 font-medium">{message.timestamp}</span>
                    
                    {isBot && domainInfo && (
                      <span className={`px-2 py-0.5 rounded font-black uppercase text-[8px] border ${domainInfo.bg} ${domainInfo.text} ${domainInfo.border}`}>
                        {domainInfo.name}
                      </span>
                    )}
                  </div>

                  {/* Message Balloon */}
                  <div className={`p-4 md:p-5 rounded-2xl text-slate-700 transition-all text-left ${
                    isBot 
                      ? 'bg-slate-50 border border-slate-100 shadow-3xs rounded-tl-xs' 
                      : 'bg-indigo-50 text-slate-800 border border-indigo-100 rounded-tr-xs'
                  }`}>
                    {isBot ? (
                      <div className="space-y-3">
                        {renderFormattedContent(message.content)}
                      </div>
                    ) : (
                      <p className="text-xs md:text-sm font-semibold whitespace-pre-wrap">{message.content}</p>
                    )}

                    {/* Grounding references inside bot response */}
                    {isBot && message.references && message.references.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-slate-100">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-2 flex items-center gap-1">
                          <Database className="w-3.5 h-3.5" />
                          <span>Fuentes de Validación de Datos ({message.references.length})</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {message.references.map((ref, rIdx) => (
                            <span 
                              key={rIdx} 
                              className="inline-flex items-center gap-1 bg-white text-slate-600 text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-slate-150 shadow-3xs"
                            >
                              <span className="w-1 h-1 rounded-full bg-indigo-500" />
                              <span>{ref}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Actions */}
                  {isBot && !message.isStreaming && (
                    <div className="flex gap-2 justify-start pl-1">
                      <button 
                        onClick={() => handleCopyText(message.content, message.id)}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 p-1 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        <span>{copiedId === message.id ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Loading Indicator */}
          {isTyping && (
            <div className="flex gap-3 max-w-lg mr-auto">
              <div className="w-8.5 h-8.5 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs shadow-3xs">
                <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <div className="space-y-1 text-left">
                <div className="text-[10px] font-extrabold text-slate-800">People Copilot IA</div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-xs p-4 flex items-center gap-1.5 shadow-3xs">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[11px] font-bold text-indigo-600 ml-1.5">Cruzando variables sociodemográficas...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Prompts Row */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-100 shrink-0">
          <p className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-2 text-left flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Preguntas Sugeridas ({filteredPresets.length}):</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {filteredPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => submitQuery(preset.text)}
                disabled={isTyping}
                className="text-left p-2.5 bg-white hover:bg-indigo-50/40 border border-slate-150 hover:border-indigo-100 rounded-2xl transition-all cursor-pointer flex gap-2 items-start disabled:opacity-50 disabled:pointer-events-none group shadow-3xs"
              >
                <div className="p-1 rounded-lg bg-indigo-50 text-indigo-600 mt-0.5 group-hover:bg-indigo-100 transition-colors">
                  <ArrowRight className="w-3 h-3" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold text-slate-800 line-clamp-1 group-hover:text-slate-900">
                    {preset.text}
                  </p>
                  <p className="text-[9px] text-slate-450 truncate mt-0.5 font-medium">
                    {preset.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input Text Form Area */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-1.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-600/15 focus-within:border-indigo-600 transition-all shadow-3xs">
            <button 
              onClick={() => showToast('Carga de documentos locales requiere integración API activa.')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/55 rounded-xl transition-all cursor-pointer"
              title="Adjuntar Documento"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <textarea
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                data 
                  ? "Pregúntale al Copilot sobre la nómina, SST o clima..." 
                  : "Carga un Excel de nómina o haz una consulta conceptual..."
              }
              rows={1}
              className="flex-1 bg-transparent border-0 outline-none focus:ring-0 text-xs md:text-sm text-slate-800 resize-none py-1.5 px-1 font-semibold placeholder:font-medium placeholder:text-slate-400 scrollbar-none"
            />

            <button 
              onClick={() => showToast('Entrada de voz requiere integración productiva.')}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/55 rounded-xl transition-all cursor-pointer"
              title="Entrada de Voz"
            >
              <Mic className="w-4 h-4" />
            </button>

            <button
              onClick={handleSend}
              disabled={!inputVal.trim() || isTyping}
              className={`p-2 rounded-xl transition-all font-bold flex items-center justify-center shrink-0 shadow-3xs cursor-pointer ${
                inputVal.trim() && !isTyping
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-150 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 px-1 font-medium">
            <p className="flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Grounded en la base de datos de {companyName}.</span>
            </p>
            <p>Model: gemini-3.5-flash (Prepared for integration)</p>
          </div>
        </div>

      </div>

    </div>
  );
}
