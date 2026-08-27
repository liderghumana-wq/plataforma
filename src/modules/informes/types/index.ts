// Tipos de datos para plantillas de informes y estado de descargas
export interface InformeMetaData {
  id: string;
  version: string;
  fechaCreacion: string;
  generadoPor: string;
  urlDescarga?: string;
}
