import {
  WizardState,
  SurveyQuestionConfig,
  CustomCatalogConfig,
  ExcelImportPreview,
  ColumnMappingResult,
  CompanyStatus
} from './newCompanyWizard.types';
import { companyAdminService } from './companyAdmin.service';
import { empresaService } from './empresa.service';
import { EmpresaConfig } from './empresa.types';

const WIZARD_DRAFT_KEY_PREFIX = 'happy_insight_company_wizard_draft_';

// Standard protected system quality states that CANNOT be modified
export const SYSTEM_QUALITY_STATUSES = [
  { code: 'VALID', label: 'Dato Válido (Completo y Verificado)', description: 'Satisface todas las reglas de negocio y rango.' },
  { code: 'MISSING', label: 'Dato Faltante / Omisión', description: 'Campo sin diligenciar o no reportado.' },
  { code: 'INVALID', label: 'Dato Inválido / Fuera de Rango', description: 'Formato incorrecto o valor lógicamente imposible.' },
  { code: 'NOT_CALCULABLE', label: 'No Calculable por Dependencia', description: 'Falta una variable primaria requerida para el cálculo.' }
];

// Base standard questions for sociodemographic & health characterization
export const BASE_STANDARD_QUESTIONS: SurveyQuestionConfig[] = [
  {
    id: 'q-doc',
    fieldKey: 'numeroDocumento',
    text: 'Número de documento de identidad',
    category: 'SOCIODEMOGRAFICO',
    type: 'SHORT_TEXT',
    required: true,
    active: true,
    sensitive: false
  },
  {
    id: 'q-nombre',
    fieldKey: 'nombreCompleto',
    text: 'Nombre completo del colaborador',
    category: 'SOCIODEMOGRAFICO',
    type: 'SHORT_TEXT',
    required: true,
    active: true,
    sensitive: false
  },
  {
    id: 'q-fnac',
    fieldKey: 'fechaNacimiento',
    text: 'Fecha de nacimiento',
    category: 'SOCIODEMOGRAFICO',
    type: 'DATE',
    required: true,
    active: true,
    sensitive: false
  },
  {
    id: 'q-genero',
    fieldKey: 'genero',
    text: 'Identidad de Género',
    category: 'SOCIODEMOGRAFICO',
    type: 'SINGLE_SELECT',
    options: ['Femenino', 'Masculino', 'No Binario', 'Otro'],
    required: true,
    active: true,
    allowOther: true,
    allowPreferNotToAnswer: true,
    sensitive: false
  },
  {
    id: 'q-ecivil',
    fieldKey: 'estadoCivil',
    text: 'Estado Civil',
    category: 'SOCIODEMOGRAFICO',
    type: 'SINGLE_SELECT',
    options: ['Soltero/a', 'Casado/a', 'Unión Libre', 'Divorciado/a', 'Viudo/a'],
    required: false,
    active: true,
    allowOther: false,
    allowPreferNotToAnswer: true,
    sensitive: false
  },
  {
    id: 'q-educ',
    fieldKey: 'nivelEducativo',
    text: 'Nivel Educativo alcanzado',
    category: 'SOCIODEMOGRAFICO',
    type: 'SINGLE_SELECT',
    options: ['Primaria', 'Bachillerato', 'Técnico', 'Tecnológico', 'Profesional', 'Especialización/Maestría', 'Doctorado'],
    required: false,
    active: true,
    allowPreferNotToAnswer: false,
    sensitive: false
  },
  {
    id: 'q-viv',
    fieldKey: 'tipoVivienda',
    text: 'Tipo de Vivienda',
    category: 'SOCIODEMOGRAFICO',
    type: 'SINGLE_SELECT',
    options: ['Propia', 'Arrendada', 'Familiar'],
    required: false,
    active: true,
    allowPreferNotToAnswer: false,
    sensitive: false
  },
  {
    id: 'q-estrato',
    fieldKey: 'estrato',
    text: 'Estrato Socioeconómico',
    category: 'SOCIODEMOGRAFICO',
    type: 'SINGLE_SELECT',
    options: ['Estrato 1', 'Estrato 2', 'Estrato 3', 'Estrato 4', 'Estrato 5', 'Estrato 6'],
    required: false,
    active: true,
    allowPreferNotToAnswer: false,
    sensitive: false
  },
  {
    id: 'q-peso',
    fieldKey: 'peso',
    text: 'Peso corporal actual (kilogramos)',
    category: 'SALUD',
    type: 'NUMBER',
    required: true,
    active: true,
    sensitive: true,
    criticalForIndicators: ['IND_IMC', 'IND_CLASIF_NUTRICIONAL']
  },
  {
    id: 'q-estatura',
    fieldKey: 'estatura',
    text: 'Estatura (centímetros o metros)',
    category: 'SALUD',
    type: 'NUMBER',
    required: true,
    active: true,
    sensitive: true,
    criticalForIndicators: ['IND_IMC', 'IND_CLASIF_NUTRICIONAL']
  },
  {
    id: 'q-cintura',
    fieldKey: 'perimetroCintura',
    text: 'Perímetro abdominal/cintura (cm)',
    category: 'SALUD',
    type: 'NUMBER',
    required: false,
    active: true,
    sensitive: true,
    criticalForIndicators: ['IND_RIESGO_CARDIOVASCULAR']
  },
  {
    id: 'q-afisica',
    fieldKey: 'actividadFisica',
    text: 'Nivel de Actividad Física habitual',
    category: 'SALUD',
    type: 'SINGLE_SELECT',
    options: ['Sedentario', 'Lieve (1-2 veces/sem)', 'Moderado (3-4 veces/sem)', 'Intenso (5+ veces/sem)'],
    required: false,
    active: true,
    sensitive: true
  },
  {
    id: 'q-fuma',
    fieldKey: 'fuma',
    text: '¿Consume cigarrillo o tabaco?',
    category: 'SALUD',
    type: 'YES_NO',
    required: false,
    active: true,
    sensitive: true
  }
];

export const DEFAULT_CUSTOM_CATALOGS: CustomCatalogConfig[] = [
  {
    id: 'cat-sys-quality',
    name: 'Estados de Calidad de Datos (Protegido por el Sistema)',
    code: 'ESTADOS_CALIDAD',
    description: 'Estados nativos del motor de calidad de datos. No modificables.',
    status: 'ACTIVE',
    order: 1,
    isSystemProtected: true,
    items: SYSTEM_QUALITY_STATUSES.map(s => ({ id: s.code, code: s.code, label: s.label, active: true }))
  },
  {
    id: 'cat-operacion',
    name: 'Tipo de Operación / Línea de Negocio',
    code: 'TIPO_OPERACION',
    description: 'Clasificación operativa personalizada de proyectos o servicios',
    status: 'ACTIVE',
    order: 2,
    isSystemProtected: false,
    items: [
      { id: 'op-1', code: 'INBOUND', label: 'Inbound / Recepción', active: true },
      { id: 'op-2', code: 'OUTBOUND', label: 'Outbound / Emisión', active: true },
      { id: 'op-3', code: 'BACKOFFICE', label: 'Backoffice / Soporte', active: true }
    ]
  }
];

export class NewCompanyWizardService {
  /**
   * Crea un estado inicial para el wizard de una nueva empresa
   */
  public createInitialState(companyId?: string): WizardState {
    const id = companyId || `comp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    return {
      companyId: id,
      step: 1,
      configurationVersion: 1,
      surveyVersion: 1,
      info: {
        nombreComercial: '',
        razonSocial: '',
        nit: '',
        logo: '',
        correoAdmin: '',
        telefono: '',
        estado: 'DRAFT',
        periodoInicial: `${new Date().getFullYear()}-01`,
        sectorEconomico: 'Servicios',
        codigoCIIU: '8220',
        ciudad: 'Bogotá D.C.',
        direccion: ''
      },
      orgStructure: {
        skipSites: false,
        skipProjects: false,
        skipCostCenters: false,
        sites: [],
        areas: [],
        projects: [],
        positions: [
          {
            id: `pos-${id}-1`,
            companyId: id,
            name: 'Analista de Operaciones',
            code: 'CARG-001',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        contractTypes: [
          {
            id: `ct-${id}-1`,
            companyId: id,
            name: 'Indefinido',
            code: 'CONT-IND',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `ct-${id}-2`,
            companyId: id,
            name: 'Fijo',
            code: 'CONT-FIJ',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        workModalities: [
          {
            id: `wm-${id}-1`,
            companyId: id,
            name: 'Presencial',
            code: 'MOD-PRE',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `wm-${id}-2`,
            companyId: id,
            name: 'Remoto / Teletrabajo',
            code: 'MOD-REM',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `wm-${id}-3`,
            companyId: id,
            name: 'Híbrido',
            code: 'MOD-HIB',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        shifts: [
          {
            id: `sh-${id}-1`,
            companyId: id,
            name: 'Turno Mañana (06:00 - 14:00)',
            code: 'TUR-MAN',
            startTime: '06:00',
            endTime: '14:00',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: `sh-${id}-2`,
            companyId: id,
            name: 'Turno Tarde (14:00 - 22:00)',
            code: 'TUR-TAR',
            startTime: '14:00',
            endTime: '22:00',
            status: 'ACTIVE',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        costCenters: []
      },
      customCatalogs: JSON.parse(JSON.stringify(DEFAULT_CUSTOM_CATALOGS)),
      survey: {
        mode: 'STANDARD',
        versionName: 'Versión Estándar Caracterización v1.0',
        questions: JSON.parse(JSON.stringify(BASE_STANDARD_QUESTIONS))
      },
      dataSource: {
        mode: 'BOTH',
        digitalSurveyUrl: `${window.location.origin}/survey/portal?companyId=${id}&version=1`,
        allowedExcelColumns: []
      },
      users: [
        {
          id: `usr-${id}-admin`,
          name: 'Administrador Empresa',
          email: 'admin@empresa.com',
          role: 'COMPANY_ADMIN',
          status: 'ACTIVE'
        }
      ],
      lastSavedAt: new Date().toISOString()
    };
  }

  /**
   * Guarda borrador del avance del wizard en localStorage
   */
  public saveDraft(state: WizardState): void {
    try {
      const updated = {
        ...state,
        lastSavedAt: new Date().toISOString()
      };
      localStorage.setItem(`${WIZARD_DRAFT_KEY_PREFIX}${state.companyId}`, JSON.stringify(updated));
      localStorage.setItem(`${WIZARD_DRAFT_KEY_PREFIX}latest`, state.companyId);
    } catch (e) {
      console.warn('Error al guardar borrador del wizard:', e);
    }
  }

  /**
   * Carga borrador del wizard
   */
  public loadDraft(companyId?: string): WizardState | null {
    try {
      const targetId = companyId || localStorage.getItem(`${WIZARD_DRAFT_KEY_PREFIX}latest`);
      if (!targetId) return null;
      const raw = localStorage.getItem(`${WIZARD_DRAFT_KEY_PREFIX}${targetId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Error al cargar borrador del wizard:', e);
    }
    return null;
  }

  /**
   * Elimina borrador tras activación
   */
  public clearDraft(companyId: string): void {
    try {
      localStorage.removeItem(`${WIZARD_DRAFT_KEY_PREFIX}${companyId}`);
      if (localStorage.getItem(`${WIZARD_DRAFT_KEY_PREFIX}latest`) === companyId) {
        localStorage.removeItem(`${WIZARD_DRAFT_KEY_PREFIX}latest`);
      }
    } catch (e) {
      console.warn('Error al limpiar borrador:', e);
    }
  }

  /**
   * Parsea e inspecciona datos de importación masiva de Excel para la estructura organizacional
   */
  public parseAndValidateOrgExcel(
    sitesData: Array<{ code: string; name: string; city?: string; address?: string }>,
    areasData: Array<{ code: string; name: string; siteCode?: string }>,
    projectsData: Array<{ code: string; name: string; client?: string; siteCode?: string; areaCode?: string }>
  ): ExcelImportPreview {
    const errors: ExcelImportPreview['errors'] = [];
    const validSites: any[] = [];
    const validAreas: any[] = [];
    const validProjects: any[] = [];

    const siteCodesSet = new Set<string>();
    const areaCodesSet = new Set<string>();
    const projectCodesSet = new Set<string>();

    // 1. Validar Sedes
    sitesData.forEach((row, idx) => {
      const line = idx + 2; // header line offset
      if (!row.code || !row.code.trim()) {
        errors.push({ sheet: 'Sedes', row: line, message: 'El código de la sede es obligatorio.', severity: 'ERROR' });
        return;
      }
      if (!row.name || !row.name.trim()) {
        errors.push({ sheet: 'Sedes', row: line, code: row.code, message: 'El nombre de la sede es obligatorio.', severity: 'ERROR' });
        return;
      }

      const cleanCode = row.code.trim().toUpperCase();
      if (siteCodesSet.has(cleanCode)) {
        errors.push({ sheet: 'Sedes', row: line, code: cleanCode, message: `Código de sede duplicado "${cleanCode}".`, severity: 'ERROR' });
      } else {
        siteCodesSet.add(cleanCode);
        validSites.push({
          code: cleanCode,
          name: row.name.trim(),
          city: row.city?.trim() || 'Bogotá D.C.',
          address: row.address?.trim() || ''
        });
      }
    });

    // 2. Validar Áreas
    areasData.forEach((row, idx) => {
      const line = idx + 2;
      if (!row.code || !row.code.trim()) {
        errors.push({ sheet: 'Áreas', row: line, message: 'El código del área es obligatorio.', severity: 'ERROR' });
        return;
      }
      if (!row.name || !row.name.trim()) {
        errors.push({ sheet: 'Áreas', row: line, code: row.code, message: 'El nombre del área es obligatorio.', severity: 'ERROR' });
        return;
      }

      const cleanCode = row.code.trim().toUpperCase();
      if (areaCodesSet.has(cleanCode)) {
        errors.push({ sheet: 'Áreas', row: line, code: cleanCode, message: `Código de área duplicado "${cleanCode}".`, severity: 'ERROR' });
      } else {
        areaCodesSet.add(cleanCode);
      }

      // Validar relación con sede si se proveyó siteCode
      let referencedSiteId = '';
      if (row.siteCode && row.siteCode.trim()) {
        const cleanSiteRef = row.siteCode.trim().toUpperCase();
        if (!siteCodesSet.has(cleanSiteRef)) {
          errors.push({
            sheet: 'Áreas',
            row: line,
            code: cleanCode,
            message: `Referencia a sede inexistente "${cleanSiteRef}".`,
            severity: 'ERROR'
          });
        }
      }

      validAreas.push({
        code: cleanCode,
        name: row.name.trim(),
        siteCode: row.siteCode?.trim().toUpperCase() || ''
      });
    });

    // 3. Validar Proyectos
    projectsData.forEach((row, idx) => {
      const line = idx + 2;
      if (!row.code || !row.code.trim()) {
        errors.push({ sheet: 'Proyectos', row: line, message: 'El código del proyecto es obligatorio.', severity: 'ERROR' });
        return;
      }
      if (!row.name || !row.name.trim()) {
        errors.push({ sheet: 'Proyectos', row: line, code: row.code, message: 'El nombre del proyecto es obligatorio.', severity: 'ERROR' });
        return;
      }

      const cleanCode = row.code.trim().toUpperCase();
      if (projectCodesSet.has(cleanCode)) {
        errors.push({ sheet: 'Proyectos', row: line, code: cleanCode, message: `Código de proyecto duplicado "${cleanCode}".`, severity: 'ERROR' });
      } else {
        projectCodesSet.add(cleanCode);
      }

      if (row.siteCode && row.siteCode.trim()) {
        const sRef = row.siteCode.trim().toUpperCase();
        if (!siteCodesSet.has(sRef)) {
          errors.push({ sheet: 'Proyectos', row: line, code: cleanCode, message: `Referencia a sede inexistente "${sRef}".`, severity: 'ERROR' });
        }
      }

      if (row.areaCode && row.areaCode.trim()) {
        const aRef = row.areaCode.trim().toUpperCase();
        if (!areaCodesSet.has(aRef)) {
          errors.push({ sheet: 'Proyectos', row: line, code: cleanCode, message: `Referencia a área inexistente "${aRef}".`, severity: 'ERROR' });
        }
      }

      validProjects.push({
        code: cleanCode,
        name: row.name.trim(),
        client: row.client?.trim() || '',
        siteCode: row.siteCode?.trim().toUpperCase() || '',
        areaCode: row.areaCode?.trim().toUpperCase() || ''
      });
    });

    const hasFatalErrors = errors.some(e => e.severity === 'ERROR');

    return {
      sites: validSites,
      areas: validAreas,
      projects: validProjects,
      errors,
      isValid: !hasFatalErrors
    };
  }

  /**
   * Genera el contenido de la plantilla dinámica de Excel basada en variables activas y catálogos
   */
  public generateDynamicExcelTemplateColumns(state: WizardState): string[] {
    const defaultHeaders = [
      'Documento',
      'NombreCompleto',
      'CorreoCorporativo',
      'Sede',
      'Area',
      'Cargo',
      'TipoContrato',
      'ModalidadLaboral',
      'Turno'
    ];

    if (!state.orgStructure.skipProjects) {
      defaultHeaders.push('Proyecto');
    }
    if (!state.orgStructure.skipCostCenters) {
      defaultHeaders.push('CentroCosto');
    }

    // Agregar preguntas activas de la encuesta
    const activeSurveyQuestions = state.survey.questions
      .filter(q => q.active)
      .map(q => {
        // Mapear fieldKey a nombre oficial de columna
        const keyMap: Record<string, string> = {
          fechaNacimiento: 'FechaNacimiento',
          genero: 'Genero',
          estadoCivil: 'EstadoCivil',
          nivelEducativo: 'NivelEducativo',
          tipoVivienda: 'TipoVivienda',
          estrato: 'Estrato',
          peso: 'Peso',
          estatura: 'Estatura',
          perimetroCintura: 'PerimetroCintura',
          actividadFisica: 'ActividadFisica',
          fuma: 'ConsumoTabaco'
        };
        return keyMap[q.fieldKey] || q.fieldKey.charAt(0).toUpperCase() + q.fieldKey.slice(1);
      });

    // Unificar evitando duplicados exactos
    const uniqueHeaders = Array.from(new Set([...defaultHeaders, ...activeSurveyQuestions]));
    return uniqueHeaders;
  }

  /**
   * Realiza el mapeo automático de columnas de un archivo Excel cargado contra variables activas
   */
  public autoMapExcelColumns(uploadedHeaders: string[], activeQuestions: SurveyQuestionConfig[]): ColumnMappingResult[] {
    const aliasMap: Record<string, string> = {
      'documento': 'numeroDocumento',
      'cedula': 'numeroDocumento',
      'nit': 'numeroDocumento',
      'nombre': 'nombreCompleto',
      'nombre completo': 'nombreCompleto',
      'colaborador': 'nombreCompleto',
      'fecha nacimiento': 'fechaNacimiento',
      'fechanacimiento': 'fechaNacimiento',
      'nacimiento': 'fechaNacimiento',
      'genero': 'genero',
      'sexo': 'genero',
      'peso': 'peso',
      'peso (kg)': 'peso',
      'peso kg': 'peso',
      'estatura': 'estatura',
      'estatura (cm)': 'estatura',
      'altura': 'estatura',
      'cintura': 'perimetroCintura',
      'perimetro cintura': 'perimetroCintura',
      'estado civil': 'estadoCivil',
      'nivel educativo': 'nivelEducativo',
      'estrato': 'estrato'
    };

    return uploadedHeaders.map(header => {
      const normalizedHeader = header.trim().toLowerCase();
      
      // Coincidencia directa por alias
      const matchedKey = aliasMap[normalizedHeader];
      if (matchedKey) {
        const question = activeQuestions.find(q => q.fieldKey === matchedKey);
        return {
          excelHeader: header,
          mappedFieldKey: matchedKey,
          mappedFieldLabel: question ? question.text : matchedKey,
          confidence: 'HIGH',
          status: 'MATCHED'
        };
      }

      // Coincidencia parcial (MEDIUM)
      const partialQuestion = activeQuestions.find(q => 
        q.text.toLowerCase().includes(normalizedHeader) || 
        q.fieldKey.toLowerCase().includes(normalizedHeader)
      );

      if (partialQuestion) {
        return {
          excelHeader: header,
          mappedFieldKey: partialQuestion.fieldKey,
          mappedFieldLabel: partialQuestion.text,
          confidence: 'MEDIUM',
          status: 'MATCHED'
        };
      }

      return {
        excelHeader: header,
        confidence: 'NONE',
        status: 'UNMATCHED'
      };
    });
  }

  /**
   * Valida integralmente la configuración del Wizard antes de permitir la activación (Paso 7 & Paso 8)
   */
  public validateCompanyForActivation(state: WizardState): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    criticalVariableWarnings: string[];
    checklist: { label: string; ok: boolean; note?: string }[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const criticalVariableWarnings: string[] = [];

    // 1. Validaciones Paso 1: Info básica
    if (!state.info.nombreComercial.trim()) {
      errors.push('El Nombre Comercial de la empresa es obligatorio.');
    }
    if (!state.info.razonSocial.trim()) {
      errors.push('La Razón Social de la empresa es obligatoria.');
    }
    if (!state.info.nit.trim()) {
      errors.push('El NIT de la empresa es obligatorio.');
    }
    if (!state.info.correoAdmin.trim()) {
      errors.push('El Correo Administrativo de contacto es obligatorio.');
    }

    // 2. Validaciones Paso 2: Estructura Organizacional
    if (!state.orgStructure.skipSites && state.orgStructure.sites.length === 0) {
      warnings.push('La empresa no tiene Sedes configuradas (si opera en sede única, puede agregar una o marcar omitir).');
    }
    if (state.orgStructure.areas.length === 0) {
      warnings.push('No hay Áreas configuradas en la estructura organizacional.');
    }
    if (state.orgStructure.positions.length === 0) {
      errors.push('Debe existir al menos un Cargo configurado.');
    }

    // 3. Validaciones Paso 4: Encuesta & Variables Críticas para Indicadores
    const activeFieldKeys = new Set(state.survey.questions.filter(q => q.active).map(q => q.fieldKey));
    
    const pesoActive = activeFieldKeys.has('peso');
    const estaturaActive = activeFieldKeys.has('estatura');

    if (!pesoActive || !estaturaActive) {
      criticalVariableWarnings.push(
        `El indicador de Índice de Masa Corporal (IMC) y Clasificación Nutricional requiere Peso y Estatura. ${
          !pesoActive ? 'Falta Peso. ' : ''
        }${!estaturaActive ? 'Falta Estatura. ' : ''}Estos indicadores no se podrán calcular.`
      );
    }

    // 4. Validaciones Paso 6: Usuarios
    if (state.users.length === 0) {
      errors.push('Debe haber al menos un Usuario registrado con rol de administración.');
    }

    const hasAdmin = state.users.some(u => u.role === 'SUPER_ADMIN' || u.role === 'COMPANY_ADMIN');
    if (!hasAdmin) {
      errors.push('Se requiere al menos un usuario con rol COMPANY_ADMIN o SUPER_ADMIN.');
    }

    // Construir Checklist
    const checklist = [
      {
        label: 'Información Empresarial',
        ok: Boolean(state.info.nombreComercial && state.info.nit && state.info.correoAdmin),
        note: `${state.info.nombreComercial || 'Sin nombre'} (${state.info.nit || 'Sin NIT'})`
      },
      {
        label: 'Estructura Organizacional',
        ok: state.orgStructure.positions.length > 0 && (state.orgStructure.skipSites || state.orgStructure.sites.length > 0),
        note: `${state.orgStructure.sites.length} Sedes, ${state.orgStructure.areas.length} Áreas, ${state.orgStructure.positions.length} Cargos`
      },
      {
        label: 'Catálogos Personalizados & Sistema',
        ok: state.customCatalogs.length > 0,
        note: `${state.customCatalogs.length} Catálogos configurados`
      },
      {
        label: 'Encuesta & Variables Activas',
        ok: activeFieldKeys.size > 0,
        note: `${activeFieldKeys.size} Preguntas/variables activas`
      },
      {
        label: 'Fuentes de Datos',
        ok: Boolean(state.dataSource.mode),
        note: state.dataSource.mode === 'BOTH' ? 'Encuesta Digital + Carga Excel' : state.dataSource.mode
      },
      {
        label: 'Usuarios y Permisos',
        ok: hasAdmin,
        note: `${state.users.length} Usuarios registrados`
      }
    ];

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      criticalVariableWarnings,
      checklist
    };
  }

  /**
   * Activa finalmente la empresa, guarda la configuración en la capa de persistencia y versiona
   */
  public async activateCompany(state: WizardState): Promise<{ success: boolean; error?: string; companyConfig?: EmpresaConfig }> {
    try {
      const validation = this.validateCompanyForActivation(state);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(' | ') };
      }

      const activeState: WizardState = {
        ...state,
        info: {
          ...state.info,
          estado: 'ACTIVE'
        },
        lastSavedAt: new Date().toISOString()
      };

      // 1. Mapear a EmpresaConfig
      const companyConfig: EmpresaConfig = {
        id: activeState.companyId,
        nombreEmpresa: activeState.info.nombreComercial,
        nit: activeState.info.nit,
        logo: activeState.info.logo || '',
        colorPrimario: '#4f46e5',
        colorSecundario: '#06b6d4',
        correo: activeState.info.correoAdmin,
        telefono: activeState.info.telefono,
        direccion: activeState.info.direccion,
        ciudad: activeState.info.ciudad,
        departamento: 'Cundinamarca',
        pais: 'Colombia',
        sectorEconomico: activeState.info.sectorEconomico,
        codigoCIIU: activeState.info.codigoCIIU,
        descripcionCIIU: 'Actividades de Centros de Llamadas',
        tamanoEmpresa: 'Mediana (51-200)',
        sitioWeb: '',
        personaContacto: activeState.info.nombreComercial,
        cargoContacto: 'Administrador Principal',
        estado: 'Activo',
        numeroTrabajadores: 100,
        nivelRiesgoARL: 1,
        representanteLegal: activeState.info.razonSocial,
        cargoRepresentante: 'Gerente General',
        responsableInforme: activeState.info.correoAdmin,
        cargoResponsable: 'Director SG-SST',
        eslogan: 'Empresa Configurada',
        fechaCreacion: new Date().toISOString().split('T')[0],
        fechaActualizacion: new Date().toISOString().split('T')[0]
      };

      // 2. Guardar en EmpresaService
      await empresaService.saveEmpresaConfig(companyConfig);
      await empresaService.setActiveCompanyId(activeState.companyId);

      // 3. Guardar Estructura en CompanyAdminService
      activeState.orgStructure.sites.forEach(site => {
        companyAdminService.saveSite(activeState.companyId, site);
      });
      activeState.orgStructure.areas.forEach(area => {
        companyAdminService.saveArea(activeState.companyId, area);
      });
      activeState.orgStructure.projects.forEach(project => {
        companyAdminService.saveProject(activeState.companyId, project);
      });
      activeState.orgStructure.positions.forEach(pos => {
        companyAdminService.savePosition(activeState.companyId, pos);
      });
      activeState.orgStructure.contractTypes.forEach(ct => {
        companyAdminService.saveContractType(activeState.companyId, ct);
      });
      activeState.orgStructure.workModalities.forEach(wm => {
        companyAdminService.saveWorkModality(activeState.companyId, wm);
      });
      activeState.orgStructure.shifts.forEach(sh => {
        companyAdminService.saveShift(activeState.companyId, sh);
      });
      activeState.orgStructure.costCenters.forEach(cc => {
        companyAdminService.saveCostCenter(activeState.companyId, cc);
      });

      // 4. Guardar Log de Auditoría y Versionamiento de Configuración (PROMPT 33 Section 37)
      companyAdminService.logAudit({
        companyId: activeState.companyId,
        userId: 'admin-wizard',
        action: 'CREATE',
        entity: 'Company',
        entityId: activeState.companyId,
        newValue: {
          configurationVersion: activeState.configurationVersion,
          surveyVersion: activeState.surveyVersion,
          status: 'ACTIVE',
          activatedAt: new Date().toISOString()
        }
      });

      // 5. Limpiar borrador
      this.clearDraft(activeState.companyId);

      return { success: true, companyConfig };
    } catch (e: any) {
      console.error('Error al activar empresa:', e);
      return { success: false, error: e.message || 'Error inesperado al activar la empresa.' };
    }
  }
}

export const newCompanyWizardService = new NewCompanyWizardService();
