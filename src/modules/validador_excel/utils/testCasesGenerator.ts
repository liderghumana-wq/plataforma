import * as XLSX from 'xlsx';

export function generateMandatoryTestExcel(scenarioIndex: number): { buffer: ArrayBuffer; name: string } {
  let sheetData: any[][] = [];
  let scenarioName = `Prueba_Escenario_${scenarioIndex + 1}.xlsx`;

  // Standard Header Row
  const standardHeaders = [
    'Identificación', 'Nombre Completo', 'Empresa', 'Sede', 'Área', 'Cargo', 
    'Sexo', 'Edad', 'Estado Civil', 'Ciudad', 'Estrato', 'Nivel Educativo', 
    'Tipo Contrato', 'Jornada', 'Peso (kg)', 'Estatura (m)', 'Alergias', 'Actividad Física'
  ];

  switch (scenarioIndex) {
    case 0: // 1. Excel completo
      scenarioName = '01_Excel_Completo_Valido.xlsx';
      sheetData = [
        standardHeaders,
        ['1010101', 'Juan Pérez', 'Empresa Demo', 'Sede Principal', 'Operaciones', 'Agente BPO', 'Masculino', 28, 'Soltero(a)', 'Bogotá', '3', 'Tecnólogo', 'Término Indefinido', 'Diurna', 72, 1.75, 'Ninguna', '2 veces por semana'],
        ['1010102', 'Maria Gómez', 'Empresa Demo', 'Sede Principal', 'Tecnología', 'Desarrollador', 'Femenino', 32, 'Casado(a)', 'Bogotá', '4', 'Profesional', 'Término Indefinido', 'Diurna', 60, 1.62, 'Penicilina', 'No realiza']
      ];
      break;

    case 1: // 2. Excel parcialmente diligenciado
      scenarioName = '02_Excel_Parcialmente_Diligenciado.xlsx';
      sheetData = [
        standardHeaders,
        ['1010103', 'Carlos Ruiz', 'Empresa Demo', 'Sede Principal', 'Operaciones', 'Agente BPO', 'Masculino', 25, '', 'Bogotá', '2', 'Bachiller', 'Término Fijo', 'Diurna', '', '', '', ''],
        ['1010104', 'Ana Lopez', 'Empresa Demo', 'Sede Principal', 'Servicios', 'Auxiliar', 'Femenino', 29, 'Soltero(a)', 'Medellín', '3', 'Técnico', '', 'Nocturna', 55, 1.60, '', '']
      ];
      break;

    case 2: // 3. Excel sin columnas de salud
      scenarioName = '03_Excel_Sin_Columnas_Salud.xlsx';
      sheetData = [
        ['Identificación', 'Nombre Completo', 'Empresa', 'Sede', 'Área', 'Cargo', 'Sexo', 'Edad', 'Tipo Contrato'],
        ['1010105', 'Pedro Martinez', 'Empresa Demo', 'Sede Norte', 'Operaciones', 'Coordinador', 'Masculino', 40, 'Término Indefinido'],
        ['1010106', 'Laura Torres', 'Empresa Demo', 'Sede Norte', 'Administración', 'Analista', 'Femenino', 35, 'Término Indefinido']
      ];
      break;

    case 3: // 4. Excel con columnas adicionales
      scenarioName = '04_Excel_Con_Columnas_Adicionales.xlsx';
      sheetData = [
        [...standardHeaders, 'Pregunta Nueva 7', 'Preferencia Almuerzo', 'Código Proyecto X'],
        ['1010107', 'Sofia Ramirez', 'Empresa Demo', 'Sede Principal', 'Calidad', 'Auditor', 'Femenino', 27, 'Soltero(a)', 'Bogotá', '3', 'Profesional', 'Término Indefinido', 'Diurna', 58, 1.65, 'Ninguna', 'Ocasional', 'Respuesta A', 'Opción Vegetariana', 'PRJ-99']
      ];
      break;

    case 4: // 5. Excel con valores inválidos
      scenarioName = '05_Excel_Con_Valores_Invalidos.xlsx';
      sheetData = [
        standardHeaders,
        ['1010108', 'Diego Diaz', 'Empresa Demo', 'Sede Principal', 'Operaciones', 'Agente BPO', 'Masculino', 250, 'Desconocido', 'Bogotá', '8', 'Doctorado', 'Inexistente', 'Diurna', -50, 'Cero metros', 'Ninguna', 'No']
      ];
      break;

    case 5: // 6. Excel con duplicados
      scenarioName = '06_Excel_Con_Duplicados.xlsx';
      sheetData = [
        standardHeaders,
        ['1010109', 'Elena Castro', 'Empresa Demo', 'Sede Principal', 'Operaciones', 'Agente BPO', 'Femenino', 26, 'Soltero(a)', 'Bogotá', '3', 'Tecnólogo', 'Término Indefinido', 'Diurna', 62, 1.68, 'Ninguna', '3 veces por semana'],
        ['1010109', 'Elena Castro', 'Empresa Demo', 'Sede Principal', 'Operaciones', 'Agente BPO', 'Femenino', 26, 'Soltero(a)', 'Bogotá', '3', 'Tecnólogo', 'Término Indefinido', 'Diurna', 62, 1.68, 'Ninguna', '3 veces por semana']
      ];
      break;

    case 6: // 7. Excel con sedes inexistentes
      scenarioName = '07_Sedes_Inexistentes.xlsx';
      sheetData = [
        standardHeaders,
        ['1010110', 'Gabriel Vega', 'Empresa Demo', 'Sede Marte Alpha 9', 'Operaciones', 'Agente BPO', 'Masculino', 30, 'Soltero(a)', 'Bogotá', '3', 'Tecnólogo', 'Término Indefinido', 'Diurna', 70, 1.72, 'Ninguna', 'Sí']
      ];
      break;

    case 7: // 8. Excel con áreas inexistentes
      scenarioName = '08_Areas_Inexistentes.xlsx';
      sheetData = [
        standardHeaders,
        ['1010111', 'Hugo Silva', 'Empresa Demo', 'Sede Principal', 'Departamento Fantasma 5000', 'Agente BPO', 'Masculino', 31, 'Soltero(a)', 'Bogotá', '3', 'Tecnólogo', 'Término Indefinido', 'Diurna', 75, 1.78, 'Ninguna', 'Sí']
      ];
      break;

    case 8: // 9. Excel con proyectos inexistentes
      scenarioName = '09_Proyectos_Inexistentes.xlsx';
      sheetData = [
        [...standardHeaders, 'Proyecto'],
        ['1010112', 'Irene Morales', 'Empresa Demo', 'Sede Principal', 'Operaciones', 'Agente BPO', 'Femenino', 24, 'Soltero(a)', 'Bogotá', '2', 'Tecnólogo', 'Término Indefinido', 'Diurna', 54, 1.60, 'Ninguna', 'Sí', 'Proyecto Inexistente XYZ']
      ];
      break;

    case 9: // 10. Excel con pesos vacíos
      scenarioName = '10_Pesos_Vacios.xlsx';
      sheetData = [
        standardHeaders,
        ['1010113', 'Jorge Parra', 'Empresa Demo', 'Sede Principal', 'Operaciones', 'Agente BPO', 'Masculino', 29, 'Soltero(a)', 'Bogotá', '3', 'Tecnólogo', 'Término Indefinido', 'Diurna', '', 1.74, 'Ninguna', 'Sí'],
        ['1010114', 'Karen Rios', 'Empresa Demo', 'Sede Principal', 'Tecnología', 'Desarrollador', 'Femenino', 33, 'Soltero(a)', 'Bogotá', '4', 'Profesional', 'Término Indefinido', 'Diurna', 'NA', 1.65, 'Ninguna', 'No']
      ];
      break;

    case 10: // 11. Excel con estaturas vacías
      scenarioName = '11_Estaturas_Vacias.xlsx';
      sheetData = [
        standardHeaders,
        ['1010115', 'Luis Ortiz', 'Empresa Demo', 'Sede Principal', 'Operaciones', 'Agente BPO', 'Masculino', 28, 'Soltero(a)', 'Bogotá', '3', 'Tecnólogo', 'Término Indefinido', 'Diurna', 80, '', 'Ninguna', 'Sí'],
        ['1010116', 'Monica Duarte', 'Empresa Demo', 'Sede Principal', 'Operaciones', 'Agente BPO', 'Femenino', 27, 'Soltero(a)', 'Bogotá', '3', 'Tecnólogo', 'Término Indefinido', 'Diurna', 65, 'No registra', 'Ninguna', 'No']
      ];
      break;

    case 11: // 12. Excel sin actividad física
      scenarioName = '12_Sin_Actividad_Fisica.xlsx';
      sheetData = [
        standardHeaders,
        ['1010117', 'Nestor Gil', 'Empresa Demo', 'Sede Principal', 'Operaciones', 'Agente BPO', 'Masculino', 34, 'Soltero(a)', 'Bogotá', '3', 'Tecnólogo', 'Término Indefinido', 'Diurna', 78, 1.76, 'Ninguna', '']
      ];
      break;

    case 12: // 13. Excel sin tipo de contrato
      scenarioName = '13_Sin_Tipo_Contrato.xlsx';
      sheetData = [
        standardHeaders,
        ['1010118', 'Olga Mendoza', 'Empresa Demo', 'Sede Principal', 'Operaciones', 'Agente BPO', 'Femenino', 30, 'Soltero(a)', 'Bogotá', '3', 'Tecnólogo', '', 'Diurna', 62, 1.64, 'Ninguna', 'Ocasional']
      ];
      break;

    default: // 14. Excel con datos de dos empresas
      scenarioName = '14_Datos_Dos_Empresas.xlsx';
      sheetData = [
        standardHeaders,
        ['1010119', 'Pablo Rivas', 'Empresa Alpha SAS', 'Sede Principal', 'Operaciones', 'Agente BPO', 'Masculino', 28, 'Soltero(a)', 'Bogotá', '3', 'Tecnólogo', 'Término Indefinido', 'Diurna', 71, 1.73, 'Ninguna', 'Sí'],
        ['1010120', 'Rita Vargas', 'Empresa Beta Ltda', 'Sede Sur', 'Contabilidad', 'Contador', 'Femenino', 38, 'Casado(a)', 'Medellín', '4', 'Profesional', 'Término Indefinido', 'Diurna', 59, 1.61, 'Polvo', 'No']
      ];
      break;
  }

  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Datos');

  const excelBuf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return {
    buffer: excelBuf,
    name: scenarioName
  };
}
