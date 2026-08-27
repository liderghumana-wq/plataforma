import { useState, useCallback, useEffect } from 'react';
import { DemographicsData } from '../../../types';
import { CopilotMessage, CopilotSession, CopilotDomain } from '../copilot.types';
import { generateCopilotResponse, detectDomainFromQuery } from '../services/copilot.service';

const INITIAL_WELCOME = (companyName: string): string => `### 🤖 ¡Bienvenido al **People Copilot IA** de **${companyName}**!

Soy tu asesor de IA de nivel directivo y operativo, especializado en la gestión integral del talento y bienestar organizacional. 

Estoy plenamente sincronizado con la información de tu **Encuesta Sociodemográfica** y base de datos activa. Puedes preguntarme acerca de cualquiera de mis 6 áreas de especialidad:

1. **Capital Humano 👥** (Estabilidad, contratos, rotación)
2. **SG-SST 🩺** (Síntomas corporativos, ausentismo, riesgos)
3. **Bienestar 🌸** (Uso del tiempo libre, familia, recreación)
4. **People Analytics 📊** (Correlaciones avanzadas, análisis cruzado de datos)
5. **Clima Organizacional 💬** (Satisfacción, liderazgo, eNPS)
6. **Caracterización Sociodemográfica 🌏** (Radiografía poblacional de nómina)

*¿En qué puedo asistirte hoy para potenciar las decisiones de tu empresa? Selecciona una de las categorías superiores o escribe tu propia pregunta abajo.*`;

export function useCopilot(demographicsData: DemographicsData | null, companyName: string = 'Mi Empresa') {
  const [sessions, setSessions] = useState<CopilotSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [currentDomain, setCurrentDomain] = useState<CopilotDomain | undefined>(undefined);

  // Initialize first session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      const defaultSessionId = 'session-' + Date.now();
      const defaultSession: CopilotSession = {
        id: defaultSessionId,
        title: 'Consulta General',
        createdAt: new Date().toLocaleDateString(),
        messages: [
          {
            id: 'welcome-msg',
            role: 'assistant',
            content: INITIAL_WELCOME(companyName),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]
      };
      setSessions([defaultSession]);
      setActiveSessionId(defaultSessionId);
    }
  }, [sessions, companyName]);

  // Retrieve active session
  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Clear current session
  const clearChat = useCallback(() => {
    if (!activeSessionId) return;
    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [
              {
                id: 'welcome-msg-' + Date.now(),
                role: 'assistant',
                content: INITIAL_WELCOME(companyName),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ],
            activeDomain: undefined
          };
        }
        return s;
      })
    );
    setCurrentDomain(undefined);
  }, [activeSessionId, companyName]);

  // Create new session
  const createNewSession = useCallback(() => {
    const newId = 'session-' + Date.now();
    const newSession: CopilotSession = {
      id: newId,
      title: `Consulta #${sessions.length + 1}`,
      createdAt: new Date().toLocaleDateString(),
      messages: [
        {
          id: 'welcome-msg-' + Date.now(),
          role: 'assistant',
          content: INITIAL_WELCOME(companyName),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };
    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newId);
    setCurrentDomain(undefined);
  }, [sessions, companyName]);

  // Submit query to Copilot with simulated typing streaming effect
  const submitQuery = useCallback(async (text: string) => {
    if (!text.trim() || !activeSessionId || isTyping) return;

    const detected = detectDomainFromQuery(text);
    setCurrentDomain(detected);

    const userMessage: CopilotMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      domain: detected
    };

    // Add user message to state
    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          // Auto rename title if it was default
          const title = s.title === 'Consulta General' || s.title.startsWith('Consulta #')
            ? text.substring(0, 24) + (text.length > 24 ? '...' : '')
            : s.title;
          return {
            ...s,
            title,
            messages: [...s.messages, userMessage],
            activeDomain: detected
          };
        }
        return s;
      })
    );

    setIsTyping(true);

    // Get the prepared structural response grounded in Excel
    const responsePayload = generateCopilotResponse(text, demographicsData, companyName);

    // Simulate Streaming typing effect
    const responseText = responsePayload.content;
    let index = 0;
    const assistantMsgId = 'assistant-' + Date.now();
    
    // Add an empty assistant message
    const emptyAssistantMessage: CopilotMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      domain: responsePayload.domain,
      isStreaming: true,
      references: responsePayload.references,
      suggestedNext: responsePayload.suggestedNext
    };

    setSessions(prev =>
      prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, emptyAssistantMessage]
          };
        }
        return s;
      })
    );

    // Stream characters
    const speed = 15; // ms per chunk
    const interval = setInterval(() => {
      index += 6; // chunk multiple chars for fluid simulation
      const slice = responseText.substring(0, index);
      const isDone = index >= responseText.length;

      setSessions(prev =>
        prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.map(m => {
                if (m.id === assistantMsgId) {
                  return {
                    ...m,
                    content: isDone ? responseText : slice,
                    isStreaming: !isDone
                  };
                }
                return m;
              })
            };
          }
          return s;
        })
      );

      if (isDone) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, speed);

  }, [activeSessionId, demographicsData, companyName, isTyping]);

  return {
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
  };
}
