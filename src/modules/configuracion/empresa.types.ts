export interface EmpresaConfig {
  id: string; // Identificador único (companyId)
  nombreEmpresa: string;
  nit: string;
  logo: string;
  colorPrimario: string;
  colorSecundario: string;
  correo: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  departamento?: string;
  pais: string;
  sectorEconomico: string;
  codigoCIIU?: string;
  descripcionCIIU?: string;
  tamanoEmpresa?: string; // Microempresa, Pequeña, Mediana, Grande
  sitioWeb: string;
  personaContacto?: string;
  cargoContacto?: string;
  estado?: 'Activo' | 'Inactivo';

  // Additional operational & SG-SST fields
  numeroTrabajadores: number;
  nivelRiesgoARL: number;
  representanteLegal: string;
  cargoRepresentante: string;
  responsableInforme: string;
  cargoResponsable: string;
  eslogan: string;
  responsableSST?: string;
  claseRiesgo?: string;
  normativaAplicada?: string;
  riesgosPrioritarios?: string[];
  modulosActivados?: string[];
  fechaCreacion?: string;
  fechaActualizacion?: string;
}
