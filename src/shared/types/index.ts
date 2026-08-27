// Tipos globales compartidos para el Tenant y usuarios de la plataforma SaaS SG-SST
export interface SaaSUser {
  id: string;
  email: string;
  role: 'admin' | 'professional' | 'viewer';
  empresaId: string;
}

export interface TenantConfig {
  theme: 'light' | 'dark' | 'custom';
  primaryColor: string;
  featuresEnabled: string[];
}
