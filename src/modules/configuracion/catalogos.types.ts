import { 
  Building2, 
  Layers, 
  GitBranch, 
  GitCommit, 
  Briefcase, 
  Megaphone, 
  UserCheck, 
  Building, 
  Laptop, 
  FileText, 
  Clock, 
  Calendar, 
  Award, 
  ShieldAlert, 
  HeartPulse, 
  PiggyBank, 
  Users, 
  MapPin, 
  Map, 
  Globe,
  GraduationCap,
  Home,
  Hash,
  User,
  CreditCard,
  ListPlus
} from 'lucide-react';

export interface CatalogoItem {
  id: string;
  companyId: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  orden: number;
  
  // Relaciones jerárquicas entre catálogos
  sedeId?: string;
  areaId?: string;
  procesoId?: string;
  subprocesoId?: string;
  proyectoId?: string;
  nivelJerarquicoId?: string;
  cliente?: string;
  ciudad?: string;
  departamento?: string;
  direccion?: string;

  // Auditoría y Trazabilidad
  fechaCreacion?: string;
  fechaActualizacion?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export type CatalogKey = 
  | 'sedes' 
  | 'areas' 
  | 'procesos'
  | 'subprocesos'
  | 'proyectos' 
  | 'campanas'
  | 'cargos' 
  | 'centrosTrabajo' 
  | 'modalidadesTrabajo' 
  | 'tiposContrato' 
  | 'jornadas'
  | 'turnos'
  | 'nivelesJerarquicos'
  | 'nivelesEducativos'
  | 'tiposVivienda'
  | 'estratos'
  | 'estadosCiviles'
  | 'sexos'
  | 'tiposIdentificacion'
  | 'riesgosARL'
  | 'eps'
  | 'afp'
  | 'cajasCompensacion'
  | 'ciudades' 
  | 'departamentos' 
  | 'paises'
  | string; // Para catálogos personalizados dinámicos

export type CompanyCatalogs = Record<string, CatalogoItem[]>;

export interface CustomCatalogDefinition {
  id: string;
  companyId: string;
  key: string;
  label: string;
  singularLabel: string;
  description?: string;
  iconName?: string;
  codePrefix: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CatalogAuditLog {
  id: string;
  companyId: string;
  catalogKey: string;
  catalogLabel: string;
  itemId: string;
  itemCode: string;
  itemName: string;
  action: 'CREATE' | 'UPDATE' | 'DEACTIVATE' | 'REACTIVATE' | 'IMPORT';
  modifiedBy: string;
  modifiedAt: string;
  previousValue?: Record<string, any>;
  newValue?: Record<string, any>;
  changesSummary: string;
}

export type CatalogPermission = 
  | 'CATALOG_VIEW' 
  | 'CATALOG_CREATE' 
  | 'CATALOG_EDIT' 
  | 'CATALOG_DEACTIVATE' 
  | 'CATALOG_IMPORT' 
  | 'CATALOG_EXPORT';

export interface CatalogMetadata {
  key: CatalogKey;
  label: string;
  singularLabel: string;
  description: string;
  iconName: string;
  placeholder: string;
  codePrefix: string;
  examples: string[];
  categoryGroup?: 'Estructura' | 'Condiciones' | 'Demografía' | 'Personalizados';
}

export const CATALOG_METADATA_LIST: CatalogMetadata[] = [
  // ESTRUCTURA ORGANIZACIONAL
  {
    key: 'sedes',
    label: 'Sedes',
    singularLabel: 'Sede',
    description: 'Sedes físicas, plantas u oficinas operativas de la organización.',
    iconName: 'Building2',
    placeholder: 'Ej. Sede Principal / Planta Operativa Norte',
    codePrefix: 'SED',
    categoryGroup: 'Estructura',
    examples: ['Sede Principal', 'Planta Operativa', 'Sede Norte', 'Oficinas Centro']
  },
  {
    key: 'areas',
    label: 'Áreas',
    singularLabel: 'Área',
    description: 'Departamentos, unidades de negocio o divisiones organizacionales.',
    iconName: 'Layers',
    placeholder: 'Ej. Operaciones, Capital Humano, Calidad',
    codePrefix: 'ARE',
    categoryGroup: 'Estructura',
    examples: ['Operaciones', 'Capital Humano', 'Calidad', 'Tecnología', 'Finanzas']
  },
  {
    key: 'procesos',
    label: 'Procesos',
    singularLabel: 'Proceso',
    description: 'Macroprocesos y procesos del mapa de procesos estratégico.',
    iconName: 'GitBranch',
    placeholder: 'Ej. Gestión Comercial, Prestación del Servicio, Talento Humano',
    codePrefix: 'PRC',
    categoryGroup: 'Estructura',
    examples: ['Estratégico - Dirección', 'Misionar - Operaciones', 'Apoyo - Gestión Humana']
  },
  {
    key: 'subprocesos',
    label: 'Subprocesos',
    singularLabel: 'Subproceso',
    description: 'Subprocesos operativos o de soporte específico.',
    iconName: 'GitCommit',
    placeholder: 'Ej. Selección y Contratación, Facturación, Mesa de Ayuda',
    codePrefix: 'SUB',
    categoryGroup: 'Estructura',
    examples: ['Selección y Contratación', 'Nómina', 'Mantenimiento', 'Atención al Cliente']
  },
  {
    key: 'proyectos',
    label: 'Proyectos',
    singularLabel: 'Proyecto',
    description: 'Proyectos estratégicos, contratos BPO o iniciativas temporales.',
    iconName: 'Briefcase',
    placeholder: 'Ej. Proyecto BPO Cliente X, Implementación ISO 45001',
    codePrefix: 'PRY',
    categoryGroup: 'Estructura',
    examples: ['Proyecto BPO Cliente X', 'Transformación Digital', 'Migración Cloud']
  },
  {
    key: 'campanas',
    label: 'Campañas',
    singularLabel: 'Campaña',
    description: 'Campañas comerciales, operativas o de servicio al cliente.',
    iconName: 'Megaphone',
    placeholder: 'Ej. Campaña Claro, Campaña Banco, Campaña Movistar',
    codePrefix: 'CMP',
    categoryGroup: 'Estructura',
    examples: ['Campaña Claro BPO', 'Campaña Movistar', 'Campaña Bancolombia']
  },
  {
    key: 'cargos',
    label: 'Cargos',
    singularLabel: 'Cargo',
    description: 'Puestos de trabajo y roles definidos en la estructura organigrama.',
    iconName: 'UserCheck',
    placeholder: 'Ej. Agente Operativo, Supervisor, Analista, Director',
    codePrefix: 'CRG',
    categoryGroup: 'Estructura',
    examples: ['Agente BPO', 'Supervisor', 'Coordinador', 'Analista', 'Director']
  },

  // CONDICIONES LABORALES
  {
    key: 'centrosTrabajo',
    label: 'Centros de Trabajo',
    singularLabel: 'Centro de Trabajo',
    description: 'Centros de trabajo clasificados según nivel de riesgo ARL.',
    iconName: 'Building',
    placeholder: 'Ej. Centro Administrativo Riesgo I, Planta Riesgo V',
    codePrefix: 'CTR',
    categoryGroup: 'Condiciones',
    examples: ['Centro Principal - Riesgo I', 'Planta Operativa - Riesgo IV', 'Oficinas Remotas']
  },
  {
    key: 'modalidadesTrabajo',
    label: 'Modalidad Laboral',
    singularLabel: 'Modalidad Laboral',
    description: 'Esquemas de trabajo (Presencial, Teletrabajo, Híbrido, Trabajo Remoto).',
    iconName: 'Laptop',
    placeholder: 'Ej. Presencial (Sede), Teletrabajo, Híbrido',
    codePrefix: 'MOD',
    categoryGroup: 'Condiciones',
    examples: ['Presencial (Sede)', 'Teletrabajo / Remoto', 'Híbrido']
  },
  {
    key: 'tiposContrato',
    label: 'Tipo de Contrato',
    singularLabel: 'Tipo de Contrato',
    description: 'Modalidades de vinculación laboral según normativa legal.',
    iconName: 'FileText',
    placeholder: 'Ej. Término Indefinido, Término Fijo, Obra o Labor',
    codePrefix: 'CON',
    categoryGroup: 'Condiciones',
    examples: ['Término Indefinido', 'Término Fijo', 'Obra o Labor', 'Prestación de Servicios', 'Aprendiz']
  },
  {
    key: 'jornadas',
    label: 'Jornadas',
    singularLabel: 'Jornada',
    description: 'Tipo de jornada de trabajo regulada (Completa, Medio Tiempo, Diurna, Nocturna).',
    iconName: 'Clock',
    placeholder: 'Ej. Tiempo Completo (44h), Medio Tiempo, Diurna Ordinaria',
    codePrefix: 'JOR',
    categoryGroup: 'Condiciones',
    examples: ['Tiempo Completo', 'Medio Tiempo', 'Jornada Diurna', 'Jornada Nocturna', 'Jornada Flexible']
  },
  {
    key: 'turnos',
    label: 'Turnos',
    singularLabel: 'Turno',
    description: 'Horarios o rotaciones de turno específicas.',
    iconName: 'Calendar',
    placeholder: 'Ej. Turno Mañana (06:00-14:00), Turno Tarde, Turno Rotativo',
    codePrefix: 'TUR',
    categoryGroup: 'Condiciones',
    examples: ['Turno 1 - Mañana', 'Turno 2 - Tarde', 'Turno 3 - Noche', 'Turno Rotativo']
  },
  {
    key: 'nivelesJerarquicos',
    label: 'Nivel Jerárquico',
    singularLabel: 'Nivel Jerárquico',
    description: 'Nivel del cargo en la pirámide organizacional.',
    iconName: 'Award',
    placeholder: 'Ej. Operativo, Asistencial, Profesional, Directivo',
    codePrefix: 'NVL',
    categoryGroup: 'Condiciones',
    examples: ['Directivo / Ejecutivo', 'Estratégico / Mandos Medios', 'Profesional / Técnico', 'Operativo / Asistencial']
  },

  // PERFIL DEMOGRÁFICO Y AFILIACIONES
  {
    key: 'nivelesEducativos',
    label: 'Nivel Educativo',
    singularLabel: 'Nivel Educativo',
    description: 'Nivel escolar o académico alcanzado por el colaborador.',
    iconName: 'GraduationCap',
    placeholder: 'Ej. Primaria, Bachillerato, Técnico, Tecnólogo, Profesional, Posgrado',
    codePrefix: 'EDU',
    categoryGroup: 'Demografía',
    examples: ['Primaria', 'Secundaria / Bachillerato', 'Técnico', 'Tecnólogo', 'Profesional', 'Especialización / Maestría']
  },
  {
    key: 'tiposVivienda',
    label: 'Tipo de Vivienda',
    singularLabel: 'Tipo de Vivienda',
    description: 'Tipo de tenencia o condición habitacional.',
    iconName: 'Home',
    placeholder: 'Ej. Propia, Arrendada, Familiar, Amortizando',
    codePrefix: 'VIV',
    categoryGroup: 'Demografía',
    examples: ['Propia', 'Arrendada', 'Familiar', 'Familiar con Hipoteca']
  },
  {
    key: 'estratos',
    label: 'Estrato Socioeconómico',
    singularLabel: 'Estrato',
    description: 'Clasificación socioeconómica de servicios públicos.',
    iconName: 'Hash',
    placeholder: 'Ej. Estrato 1, Estrato 2, Estrato 3, etc.',
    codePrefix: 'EST',
    categoryGroup: 'Demografía',
    examples: ['Estrato 1', 'Estrato 2', 'Estrato 3', 'Estrato 4', 'Estrato 5', 'Estrato 6']
  },
  {
    key: 'estadosCiviles',
    label: 'Estado Civil',
    singularLabel: 'Estado Civil',
    description: 'Estado conyugal o civil del trabajador.',
    iconName: 'User',
    placeholder: 'Ej. Soltero(a), Casado(a), Unión Libre, Divorciado(a)',
    codePrefix: 'ECV',
    categoryGroup: 'Demografía',
    examples: ['Soltero(a)', 'Casado(a)', 'Unión Libre', 'Divorciado(a)', 'Viudo(a)']
  },
  {
    key: 'sexos',
    label: 'Sexo / Género',
    singularLabel: 'Sexo',
    description: 'Clasificación de sexo biológico o género.',
    iconName: 'User',
    placeholder: 'Ej. Masculino, Femenino, Otro',
    codePrefix: 'SEX',
    categoryGroup: 'Demografía',
    examples: ['Masculino', 'Femenino', 'Otro / No Binario', 'Preferir no decir']
  },
  {
    key: 'tiposIdentificacion',
    label: 'Tipo de Identificación',
    singularLabel: 'Tipo de Documento',
    description: 'Documentos oficiales de identidad legal.',
    iconName: 'CreditCard',
    placeholder: 'Ej. Cédula de Ciudadanía, Cédula de Extranjería, Pasaporte',
    codePrefix: 'TID',
    categoryGroup: 'Demografía',
    examples: ['Cédula de Ciudadanía (CC)', 'Cédula de Extranjería (CE)', 'Pasaporte (PA)', 'Permiso de Protección Temporal (PPT)']
  },
  {
    key: 'riesgosARL',
    label: 'Riesgo ARL',
    singularLabel: 'Riesgo ARL',
    description: 'Clasificación oficial de riesgo de la ARL (I a V).',
    iconName: 'ShieldAlert',
    placeholder: 'Ej. Clase I (Mínimo), Clase IV (Alto), Clase V (Máximo)',
    codePrefix: 'ARL',
    categoryGroup: 'Demografía',
    examples: ['Clase I - Riesgo Mínimo', 'Clase II - Riesgo Bajo', 'Clase III - Riesgo Medio', 'Clase IV - Riesgo Alto', 'Clase V - Riesgo Máximo']
  },
  {
    key: 'eps',
    label: 'EPS',
    singularLabel: 'EPS',
    description: 'Entidades Promotoras de Salud registradas.',
    iconName: 'HeartPulse',
    placeholder: 'Ej. Sura EPS, Sanitas, Compensar, Nueva EPS',
    codePrefix: 'EPS',
    categoryGroup: 'Demografía',
    examples: ['Sura EPS', 'EPS Sanitas', 'Compensar EPS', 'Nueva EPS', 'Salud Total', 'Famisanar']
  },
  {
    key: 'afp',
    label: 'AFP',
    singularLabel: 'AFP',
    description: 'Administradoras de Fondos de Pensiones y Cesantías.',
    iconName: 'PiggyBank',
    placeholder: 'Ej. Porvenir, Proteccion, Colfondos, Skandia, Colpensiones',
    codePrefix: 'AFP',
    categoryGroup: 'Demografía',
    examples: ['Porvenir', 'Protección', 'Colfondos', 'Skandia', 'Colpensiones']
  },
  {
    key: 'cajasCompensacion',
    label: 'Caja de Compensación',
    singularLabel: 'Caja de Compensación',
    description: 'Cajas de Compensación Familiar territoriales.',
    iconName: 'Users',
    placeholder: 'Ej. Colsubsidio, Compensar, Cafam, Comfama, Comfenalco',
    codePrefix: 'CCF',
    categoryGroup: 'Demografía',
    examples: ['Compensar', 'Colsubsidio', 'Cafam', 'Comfama', 'Comfenalco Antioquia', 'Combarranquilla']
  },
  {
    key: 'ciudades',
    label: 'Ciudades / Municipios',
    singularLabel: 'Ciudad',
    description: 'Ciudades o municipios territoriales.',
    iconName: 'MapPin',
    placeholder: 'Ej. Bogotá D.C., Medellín, Cali',
    codePrefix: 'CIU',
    categoryGroup: 'Demografía',
    examples: ['Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga']
  },
  {
    key: 'departamentos',
    label: 'Departamentos',
    singularLabel: 'Departamento',
    description: 'Departamentos o provincias geográficas.',
    iconName: 'Map',
    placeholder: 'Ej. Cundinamarca, Antioquia, Valle del Cauca',
    codePrefix: 'DEP',
    categoryGroup: 'Demografía',
    examples: ['Cundinamarca', 'Antioquia', 'Valle del Cauca', 'Atlántico', 'Santander']
  },
  {
    key: 'paises',
    label: 'Países',
    singularLabel: 'País',
    description: 'Países de presencia o nacionalidades.',
    iconName: 'Globe',
    placeholder: 'Ej. Colombia, México, Perú',
    codePrefix: 'PAI',
    categoryGroup: 'Demografía',
    examples: ['Colombia', 'México', 'Perú', 'Chile', 'Ecuador', 'Estados Unidos']
  }
];

export function createDefaultCatalogItem(
  id: string, 
  nombre: string, 
  orden: number, 
  companyId: string = 'default-company',
  codigo?: string,
  extraProps?: Partial<CatalogoItem>
): CatalogoItem {
  const now = new Date().toISOString();
  return {
    id,
    companyId,
    nombre: nombre.trim(),
    codigo: codigo ? codigo.trim() : `CAT-${Math.floor(100 + Math.random() * 900)}`,
    activo: true,
    status: 'ACTIVE',
    orden,
    fechaCreacion: now,
    fechaActualizacion: now,
    createdAt: now,
    updatedAt: now,
    createdBy: extraProps?.createdBy || 'sistema@plataforma.com',
    updatedBy: extraProps?.updatedBy || 'sistema@plataforma.com',
    ...extraProps
  };
}

export function getDefaultCatalogs(companyId: string = 'default-company'): CompanyCatalogs {
  const now = new Date().toISOString();
  const buildItems = (prefix: string, items: string[], extraFn?: (idx: number) => Partial<CatalogoItem>): CatalogoItem[] =>
    items.map((nombre, index) => {
      const codeNumber = (index + 1).toString().padStart(3, '0');
      const extra = extraFn ? extraFn(index) : {};
      return {
        id: `cat-${prefix.toLowerCase()}-${Date.now()}-${index}`,
        companyId,
        nombre: nombre.trim(),
        codigo: `${prefix}-${codeNumber}`,
        activo: true,
        status: 'ACTIVE',
        orden: index + 1,
        fechaCreacion: now,
        fechaActualizacion: now,
        createdAt: now,
        updatedAt: now,
        createdBy: 'sistema@plataforma.com',
        updatedBy: 'sistema@plataforma.com',
        ...extra
      };
    });

  return {
    sedes: buildItems('SED', ['Sede Principal', 'Planta Operativa', 'Sede Norte', 'Sede Medellín', 'Sede Cali', 'Sede Barranquilla'], (idx) => ({
      ciudad: idx === 0 || idx === 1 || idx === 2 ? 'Bogotá D.C.' : idx === 3 ? 'Medellín' : idx === 4 ? 'Cali' : 'Barranquilla',
      departamento: idx === 0 || idx === 1 || idx === 2 ? 'Cundinamarca' : idx === 3 ? 'Antioquia' : idx === 4 ? 'Valle del Cauca' : 'Atlántico'
    })),
    areas: buildItems('ARE', ['Operaciones', 'Capital Humano', 'Calidad', 'Tecnología e Informática', 'Administrativa y Financiera', 'Logística y Distribución', 'Comercial y Ventas']),
    procesos: buildItems('PRC', ['Estratégico - Dirección y Planeación', 'Misionar - Prestación del Servicio', 'Apoyo - Gestión de Talento Humano', 'Apoyo - Infraestructura y TI', 'Evaluación - Auditoría Interna']),
    subprocesos: buildItems('SUB', ['Atracción y Selección', 'Contratación y Nómina', 'Capacitación y Formación', 'Mantenimiento Preventivo', 'Mesa de Ayuda Operativa']),
    proyectos: buildItems('PRY', ['Proyecto Transformación Digital', 'Implementación ISO 45001', 'Migración Cloud e IA', 'Rediseño de Operaciones']),
    campanas: buildItems('CMP', ['Campaña Claro BPO', 'Campaña Movistar Atención', 'Campaña Bancolombia Soporte', 'Campaña General Servicio']),
    cargos: buildItems('CRG', ['Agente BPO', 'Supervisor de Operaciones', 'Coordinador de Calidad', 'Analista de Talento Humano', 'Especialista en TI', 'Director Operativo']),
    centrosTrabajo: buildItems('CTR', ['Centro Principal - Riesgo I', 'Planta Operativa - Riesgo IV', 'Sede Administrativa', 'Operaciones Remotas']),
    modalidadesTrabajo: buildItems('MOD', ['Presencial (Sede)', 'Teletrabajo / Remoto', 'Híbrido']),
    tiposContrato: buildItems('CON', ['Término Indefinido', 'Término Fijo', 'Obra o Labor', 'Prestación de Servicios', 'Aprendiz / Practicante']),
    jornadas: buildItems('JOR', ['Tiempo Completo (44h)', 'Medio Tiempo (22h)', 'Jornada Diurna Ordinaria', 'Jornada Nocturna', 'Jornada Flexible']),
    turnos: buildItems('TUR', ['Turno 1 - Mañana (06:00 - 14:00)', 'Turno 2 - Tarde (14:00 - 22:00)', 'Turno 3 - Noche (22:00 - 06:00)', 'Turno Rotativo']),
    nivelesJerarquicos: buildItems('NVL', ['Directivo / Ejecutivo', 'Estratégico / Mandos Medios', 'Profesional / Técnico', 'Operativo / Asistencial']),
    nivelesEducativos: buildItems('EDU', ['Primaria', 'Secundaria / Bachillerato', 'Técnico', 'Tecnólogo', 'Profesional', 'Especialización / Maestría']),
    tiposVivienda: buildItems('VIV', ['Propia', 'Arrendada', 'Familiar', 'Familiar con Amortización']),
    estratos: buildItems('EST', ['Estrato 1', 'Estrato 2', 'Estrato 3', 'Estrato 4', 'Estrato 5', 'Estrato 6']),
    estadosCiviles: buildItems('ECV', ['Soltero(a)', 'Casado(a)', 'Unión Libre', 'Divorciado(a)', 'Viudo(a)']),
    sexos: buildItems('SEX', ['Masculino', 'Femenino', 'Otro / No Binario', 'Preferir no decir']),
    tiposIdentificacion: buildItems('TID', ['Cédula de Ciudadanía (CC)', 'Cédula de Extranjería (CE)', 'Pasaporte (PA)', 'Permiso de Protección Temporal (PPT)']),
    riesgosARL: buildItems('ARL', ['Clase I - Riesgo Mínimo', 'Clase II - Riesgo Bajo', 'Clase III - Riesgo Medio', 'Clase IV - Riesgo Alto', 'Clase V - Riesgo Máximo']),
    eps: buildItems('EPS', ['Sura EPS', 'EPS Sanitas', 'Compensar EPS', 'Nueva EPS', 'Salud Total', 'Famisanar']),
    afp: buildItems('AFP', ['Porvenir', 'Protección', 'Colfondos', 'Skandia', 'Colpensiones']),
    cajasCompensacion: buildItems('CCF', ['Compensar', 'Colsubsidio', 'Cafam', 'Comfama', 'Comfenalco Antioquia', 'Combarranquilla']),
    ciudades: buildItems('CIU', ['Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Cartagena', 'Pereira']),
    departamentos: buildItems('DEP', ['Cundinamarca', 'Antioquia', 'Valle del Cauca', 'Atlántico', 'Santander', 'Bolívar', 'Risaralda']),
    paises: buildItems('PAI', ['Colombia', 'México', 'Perú', 'Chile', 'Ecuador', 'Estados Unidos'])
  };
}
