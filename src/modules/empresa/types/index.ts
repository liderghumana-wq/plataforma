// Interfaces y tipos del módulo de Empresa
export interface EmpresaInfo {
  id: string;
  nit: string;
  razonSocial: string;
  actividadEconomica: string;
  claseRiesgo: 1 | 2 | 3 | 4 | 5;
  representanteLegal: string;
  sedesCount: number;
}
