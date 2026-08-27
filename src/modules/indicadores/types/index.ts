export interface IndicatorThresholds {
  critical: number; // Values below this are critical (red)
  warning: number;  // Values between critical and warning are amber, above warning are success (green)
  success: number;  // Goal or optimal zone
}

export interface OrganizationalIndicator {
  id: string;
  name: string;
  description: string;
  formula: string;
  frequency: 'Mensual' | 'Bimestral' | 'Trimestral' | 'Semestral' | 'Anual' | string;
  unit: '%' | 'Puntos' | 'COP' | 'Días' | 'Ratio' | string;
  target: number;
  thresholds: IndicatorThresholds;
  responsible: string;
  regulations: string; // Associated regulations (e.g., Resolución 2646 de 2008, Decreto 1072, ISO 45001)
  dataSource: string;  // Data source (e.g., Encuesta de Clima, Reportes de SST, HRIS)
  currentValue: number;
  previousValue?: number;
  dimension: string;  // e.g., "Liderazgo", "Bienestar", "Compensación", "SST"
  isCustom?: boolean; // To identify user-added indicators
}
