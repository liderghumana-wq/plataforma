// Tipos del módulo People Copilot IA
export type CopilotDomain =
  | 'capital_humano'
  | 'sg_sst'
  | 'bienestar'
  | 'people_analytics'
  | 'clima'
  | 'demografia';

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  domain?: CopilotDomain;
  isStreaming?: boolean;
  references?: string[];
  suggestedNext?: string[];
}

export interface CopilotSession {
  id: string;
  title: string;
  messages: CopilotMessage[];
  createdAt: string;
  activeDomain?: CopilotDomain;
}

export interface PresetQuestion {
  id: string;
  text: string;
  domain: CopilotDomain;
  label: string;
  description: string;
}

export interface GroundingContext {
  companyName: string;
  totalEmployees: number;
  averageAge: number;
  wellbeingIndex: number;
  absenteeismRate: number;
  criticalPainPart?: string;
  highRiskPercentage?: number;
}
