export interface RelevantArticle {
  articleNumber: string;
  title: string;
  description: string;
}

export interface RegulatoryNorm {
  id: string;
  name: string;
  number: string;
  year: number;
  description: string;
  category: 'SG-SST' | 'Capital Humano' | 'Bienestar' | 'Riesgo Psicosocial' | 'Ergonomía' | 'Emergencias' | 'COPASST' | 'Comité de Convivencia' | 'Auditorías' | string;
  relevantArticles: RelevantArticle[];
  obligations: string[];
  requiredEvidences: string[];
  relatedDocuments: string[];
  responsible?: string;
}
