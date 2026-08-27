import * as XLSX from 'xlsx';

export function downloadPsicosocialTemplate() {
  const headers = [
    'Ciudad',
    'Departamento',
    'Proyecto',
    'Cargo',
    'Tipo de Bateria',
    'Liderazgo',
    'Control del trabajo',
    'Demandas del trabajo',
    'Recompensas',
    'Apoyo social',
    'Relaciones laborales',
    'Claridad del rol',
    'Capacitacion',
    'Reconocimiento',
    'Jornada',
    'Carga mental',
    'Carga emocional',
    'Responsabilidades familiares',
    'Tiempo fuera del trabajo',
    'Caracteristicas de vivienda',
    'Caracteristicas de economia',
    'Puntaje Estres'
  ];

  // Realistic sample rows representing different battery types and departments
  const rows = [
    [
      'Bogotá', 'Tecnología', 'Software Core', 'Desarrollador Senior', 'Intralaboral A',
      35, 45, 65, 55, 40, 30, 25, 50, 45, 70, 75, 60, 45, 55, 30, 40, 50
    ],
    [
      'Medellín', 'Operaciones', 'Infraestructura', 'Operario de Planta', 'Intralaboral B',
      55, 60, 75, 40, 65, 50, 40, 30, 35, 80, 85, 70, 55, 65, 45, 50, 65
    ],
    [
      'Cali', 'Recursos Humanos', 'Bienestar', 'Analista de Selección', 'Extralaboral',
      25, 30, 40, 65, 35, 20, 15, 60, 70, 45, 35, 30, 55, 40, 20, 30, 25
    ],
    [
      'Barranquilla', 'Ventas', 'Retail Norte', 'Asesor Comercial', 'Estrés',
      60, 50, 80, 55, 45, 40, 35, 40, 50, 75, 70, 75, 50, 60, 35, 45, 80
    ],
    [
      'Bogotá', 'Operaciones', 'Logística Express', 'Auxiliar de Bodega', 'Intralaboral B',
      50, 55, 70, 35, 50, 45, 30, 25, 30, 75, 65, 55, 60, 70, 50, 55, 55
    ],
    [
      'Medellín', 'Tecnología', 'Soporte TI', 'Líder de Soporte', 'Intralaboral A',
      40, 35, 55, 60, 45, 35, 20, 55, 65, 50, 60, 50, 40, 45, 25, 35, 40
    ],
    [
      'Bogotá', 'Finanzas', 'Contabilidad', 'Coordinador de Impuestos', 'Resultados Consolidados',
      45, 50, 60, 50, 40, 35, 30, 45, 50, 65, 70, 65, 50, 55, 30, 35, 45
    ],
    [
      'Cali', 'Operaciones', 'Logística Express', 'Conductor de Reparto', 'Intralaboral B',
      65, 70, 85, 30, 60, 55, 45, 20, 25, 90, 80, 85, 70, 75, 55, 60, 75
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Set column widths to make it easy to read
  const colWidths = headers.map((h, i) => {
    if (i < 5) return { wch: 18 };
    return { wch: 25 }; // Wide columns for long dimension headings
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bateria Psicosocial");
  
  XLSX.writeFile(wb, "Plantilla_Bateria_Riesgo_Psicosocial.xlsx");
}
