// Interfaces y tipos de configuración del Tenant, roles y licencias
export interface SaaSPlanConfig {
  planName: 'Basic' | 'Professional' | 'Enterprise';
  maxEmployees: number;
  aiFeaturesEnabled: boolean;
  supportLevel: 'standard' | 'priority' | 'dedicated';
}
