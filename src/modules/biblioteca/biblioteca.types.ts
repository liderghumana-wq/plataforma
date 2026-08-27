// Tipos para el módulo Biblioteca Inteligente

export type RecursoCategoria =
  | 'sg_sst'
  | 'capital_humano'
  | 'clima'
  | 'bienestar'
  | 'riesgo_psicosocial'
  | 'iso_45001'
  | 'iso_9001'
  | 'iso_14001'
  | 'normatividad_co';

export type RecursoTipo =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'video'
  | 'enlace'
  | 'imagen'
  | 'otra';

export interface Recurso {
  id: string;
  titulo: string;
  categoria: RecursoCategoria;
  descripcion: string;
  tipo: RecursoTipo;
  archivo: string; // Nombre del archivo o link simulado
  archivoSize?: string; // Tamaño en KB o MB, si aplica
  etiquetas: string[];
  fechaCarga: string;
  descargas: number;
  esDestacado?: boolean;
}

export interface CategoriaConfig {
  id: RecursoCategoria;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}
