// Tipos para el módulo Plantillas Inteligentes

export type PlantillaTipo =
  | 'encuesta'
  | 'formato'
  | 'matriz'
  | 'procedimiento'
  | 'politica'
  | 'plan_accion'
  | 'cronograma'
  | 'informe';

export type PlantillaCategoria =
  | 'capital_humano'
  | 'sg_sst'
  | 'calidad'
  | 'ambiental'
  | 'legal';

export interface Plantilla {
  id: string;
  titulo: string;
  tipo: PlantillaTipo;
  categoria: PlantillaCategoria;
  descripcion: string;
  extension: 'xlsx' | 'docx' | 'pdf' | 'pptx' | 'zip';
  tamano: string;
  descargas: number;
  etiquetas: string[];
  fechaActualizacion: string;
  version: string;
  esObligatorio?: boolean;
}

export interface PlantillaTipoConfig {
  id: PlantillaTipo;
  label: string;
  iconName: string;
  descripcion: string;
}

export interface PlantillaCategoriaConfig {
  id: PlantillaCategoria;
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}
