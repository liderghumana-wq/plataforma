// Tipos e interfaces de datos para los indicadores del Dashboard SaaS
export interface DashboardKPI {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}
