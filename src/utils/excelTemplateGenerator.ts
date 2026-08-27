import * as XLSX from 'xlsx';

export function downloadExcelTemplate() {
  const headers = [
    'Edad',
    'Genero',
    'Grupo sanguíneo (Rh)',
    'Estado Civil',
    '¿A que grupo étnico pertenece?',
    '¿Cuántas personas forman su núcleo familiar?',
    '¿Cuántos hijos tienes?',
    'Tipo de Vivienda',
    'Nivel Socioeconómico',
    'Ciudad en la Cual Labora',
    'Nivel de Escolaridad',
    'Proyecto',
    'Sitio de Trabajo',
    'Antigüedad en la empresa',
    'Antigüedad en el cargo actual',
    'Uso de Tiempo Libre',
    '¿Practicas algún deporte o actividad física de manera regular?',
    'Peso en kg',
    'Estatura en cm',
    'Diámetro de cintura en cm'
  ];

  const rows = [
    [
      24, 'Femenino', 'O+', 'Soltero(a)', 'Ninguno / No autoidentifica', 
      3, 0, 'Arrendada', 'Estrato 2', 'Bogotá', 
      'Técnico', 'Operaciones BPO', 'Presencial (Sede)', 1.5, 1.0, 
      'Compartir en familia', 'Moderada (1-2 veces/sem)', 58, 162, 74
    ],
    [
      32, 'Masculino', 'A+', 'Casado(a)', 'Mestizo', 
      4, 2, 'Propia', 'Estrato 3', 'Medellín', 
      'Universitario', 'Tecnología & QA', 'Híbrido', 4.0, 2.5, 
      'Actividad deportiva', 'Alta (3+ veces/sem)', 78, 176, 88
    ],
    [
      28, 'Femenino', 'O-', 'Unión Libre', 'Ninguno / No autoidentifica', 
      1, 0, 'Arrendada', 'Estrato 1', 'Cali', 
      'Tecnólogo', 'Calidad & Formación', 'Teletrabajo (Casa)', 2.0, 1.8, 
      'Ver series / Películas', 'Ninguna', 64, 165, 82
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Encuesta Sociodemográfica");
  
  // Save/writeFile
  XLSX.writeFile(wb, "Plantilla_Encuesta_Sociodemografica.xlsx");
}
