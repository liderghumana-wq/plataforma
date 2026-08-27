export interface GenderStat {
  name: string;
  value: number;
  percentage: number;
}

export interface AgeGroupStat {
  range: string;
  value: number;
  label: string;
}

export interface EducationStat {
  level: string;
  count: number;
}

export interface HousingStat {
  type: string;
  count: number;
  percentage: number;
}

export interface CityStat {
  name: string;
  count: number;
}

export interface MaritalStatusStat {
  status: string;
  count: number;
}

export interface DepartmentWellbeing {
  name: string;
  wellbeing: number;
  stress: number;
  agents: number;
}

export interface ChildrenStat {
  hasChildren: boolean;
  count: number;
  percentage: number;
}

export interface ContractStat {
  type: string;
  count: number;
  percentage: number;
}

export interface DemographicsData {
  totalEmployees: number;
  averageAge: number;
  averageSeniority: number; // Antigüedad promedio en años
  wellbeingIndex: number;
  absenteeismRate: number;
  activeParticipation: number;
  hasChildrenPercentage: number; // Porcentaje con hijos
  gender: GenderStat[];
  ageGroups: AgeGroupStat[];
  education: EducationStat[];
  housing: HousingStat[];
  city: CityStat[];
  maritalStatus: MaritalStatusStat[];
  departmentWellbeing: DepartmentWellbeing[];
  children: ChildrenStat[];
  contractType: ContractStat[];
  
  // -- NUEVOS CAMPOS DEL ANÁLISIS AMPLIADO --
  // Caracterización sociodemográfica ampliada
  ethnicGroups?: { name: string; count: number; percentage: number; }[];
  socioeconomicStrata?: { stratum: string; count: number; percentage: number; }[];
  projects?: { name: string; count: number; percentage: number; }[];
  workSites?: { site: string; count: number; percentage: number; }[];
  averageSeniorityRole?: number; // Antigüedad en el cargo
  disabilityCount?: number;
  disabilityPercentage?: number;
  disabilityStats?: { hasDisability: boolean; count: number; percentage: number; }[];

  // Bienestar
  freeTimeUsage?: { activity: string; count: number; percentage: number; }[];
  physicalActivityMode?: 'BOOLEAN' | 'FREQUENCY';
  physicalActivity?: { level: string; count: number; percentage: number; }[];
  companyActivitiesParticipation?: { participation: string; count: number; percentage: number; }[];
  pets?: { hasPets: boolean; count: number; percentage: number; }[];

  // Condiciones de salud
  averageWeight?: number; // kg
  averageHeight?: number; // m
  averageIMC?: number;
  imcClassification?: { category: string; count: number; percentage: number; }[];
  averageWaistPerimeter?: number; // cm
  allergies?: { allergy: string; count: number; percentage: number; }[];
  medications?: { medicated: string; count: number; percentage: number; }[];
  diseases?: { disease: string; count: number; percentage: number; }[];
  musculoskeletalPain?: { bodyPart: string; count: number; percentage: number; }[];
  bloodType?: { group: string; count: number; percentage: number; }[];
  
  // -- FAMILIA --
  averageHouseholdMembers?: number;
  peopleLivingAloneCount?: number;
  peopleLivingAlonePercentage?: number;
  rawEmployees?: any[];
  missingVariables?: string[];
  dataQuality?: DataQualityReport;
}

export interface DataQualityIssue {
  row: number;
  variable: string;
  value: string;
  observation: string;
}

export interface DataQualityReport {
  recordsRead: number;
  recognizedVariablesCount: number;
  totalVariablesCount: number;
  missingVariablesCount: number;
  incompleteRecordsCount: number;
  outOfRangeCount: number;
  duplicateRecordsCount: number;
  normalizedVariablesCount: number;
  qualityPercentage: number;
  qualityLevel: 'Excelente' | 'Buena' | 'Regular' | 'Deficiente';
  warnings: string[];
  details: DataQualityIssue[];
}

export interface AiConclusion {
  category: string;
  title: string;
  text: string;
  impact: string;
}

export interface Recommendation {
  id: string;
  category: string;
  title: string;
  desc: string;
  priority: 'Alta' | 'Media' | 'Baja';
  status: 'Planificada' | 'En Progreso' | 'Implementada';
  responsible: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ia';
  text: string;
  timestamp: string;
}
