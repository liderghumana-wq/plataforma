import * as XLSX from 'xlsx';
import { DEFAULT_CLIMA_QUESTIONS } from './clima.config';

export function downloadClimaExcelTemplate() {
  const headers = [
    'Ciudad',
    'Departamento',
    'Genero',
    'Antiguedad',
    ...DEFAULT_CLIMA_QUESTIONS.map(q => q.text)
  ];

  // Helper to generate a random rating between min and max
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

  const rows = [
    [
      'Bogotá', 'Operaciones', 'Femenino', '2 años',
      ...Array.from({ length: 30 }, () => rand(4, 5))
    ],
    [
      'Medellín', 'Tecnología', 'Masculino', '1 año',
      ...Array.from({ length: 30 }, () => rand(3, 5))
    ],
    [
      'Cali', 'Recursos Humanos', 'Femenino', '5 años',
      ...Array.from({ length: 30 }, () => rand(4, 5))
    ],
    [
      'Bogotá', 'Operaciones', 'Masculino', '3 meses',
      ...Array.from({ length: 30 }, () => rand(2, 4))
    ],
    [
      'Barranquilla', 'Ventas', 'Femenino', '4 años',
      ...Array.from({ length: 30 }, () => rand(3, 5))
    ],
    [
      'Bogotá', 'Servicio al Cliente', 'Femenino', '1 año',
      ...Array.from({ length: 30 }, () => rand(4, 5))
    ],
    [
      'Cali', 'Operaciones', 'Masculino', '3 años',
      ...Array.from({ length: 30 }, () => rand(3, 4))
    ],
    [
      'Medellín', 'Ventas', 'Masculino', '6 meses',
      ...Array.from({ length: 30 }, () => rand(2, 4))
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  
  // Set column widths to be readable
  const colWidths = headers.map((h, i) => {
    if (i < 4) return { wch: 15 };
    return { wch: 45 }; // Wide columns for long question texts
  });
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Encuesta de Clima");
  
  XLSX.writeFile(wb, "Plantilla_Encuesta_Clima_Organizacional.xlsx");
}
