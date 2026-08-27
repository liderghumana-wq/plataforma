import { useState, useEffect } from 'react';

export interface CompanySettings {
  logoUrl: string;
  nombre: string;
  nit: string;
  ciudad: string;
  pais: string;
  sectorEconomico: string;
  colaboradoresCount: number;
  nivelRiesgoArl: number;
  colorPrimario: string;
  colorSecundario: string;
  responsableInforme: string;
  cargoResponsable: string;
  correoElectronico: string;
}

const DEFAULT_SETTINGS: CompanySettings = {
  logoUrl: '',
  nombre: '',
  nit: '',
  ciudad: '',
  pais: '',
  sectorEconomico: '',
  colaboradoresCount: 0,
  nivelRiesgoArl: 1,
  colorPrimario: '',
  colorSecundario: '',
  responsableInforme: '',
  cargoResponsable: '',
  correoElectronico: ''
};

export function getCompanySettings(): CompanySettings {
  try {
    const saved = localStorage.getItem('happy_insight_company_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        nombre: parsed.nombre?.trim() || ''
      };
    }
  } catch (e) {
    console.error("Error reading company settings:", e);
  }
  return DEFAULT_SETTINGS;
}

export function useCompanySettings() {
  const [settings, setSettings] = useState<CompanySettings>(getCompanySettings());

  useEffect(() => {
    const handleUpdate = () => {
      setSettings(getCompanySettings());
    };

    window.addEventListener('company_settings_updated', handleUpdate);
    return () => {
      window.removeEventListener('company_settings_updated', handleUpdate);
    };
  }, []);

  return settings;
}
