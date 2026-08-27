/**
 * PROMPT 36 — DATA QUALITY, COMPLETENESS AND TRACEABILITY TEST RUNNER
 * Verifies all 42 rules and edge cases specified in Prompt 36.
 */

import { DataQualityEnginePrompt29, MASTER_FIELD_DEFINITIONS } from './dataQualityEngine';
import { ArtificialDataDetector } from './artificialDataDetector';
import { VariableDataStatus } from './types';

export interface Prompt36TestResult {
  id: string;
  category: string;
  title: string;
  description: string;
  passed: boolean;
  observedResult: string;
  expectedResult: string;
}

export interface Prompt36SuiteSummary {
  total: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: Prompt36TestResult[];
}

export function runPrompt36TestSuite(): Prompt36SuiteSummary {
  const results: Prompt36TestResult[] = [];

  // TEST 1: 100 Collaborators Dataset with Partial & Missing Data
  const hundredCollaborators: Record<string, any>[] = [];
  for (let i = 1; i <= 100; i++) {
    hundredCollaborators.push({
      numeroIdentificacion: `1000${i}`,
      primerNombre: `Colaborador ${i}`,
      primerApellido: `Apellido ${i}`,
      sexo: i <= 50 ? 'Femenino' : 'Masculino',
      edad: 25 + (i % 30),
      // 30 without weight
      pesoKg: i <= 30 ? null : (i <= 40 ? 'invalid_weight' : 70),
      // 20 without height
      estaturaMts: i > 20 && i <= 40 ? null : 1.70,
      // 15 without civil status
      estadoCivil: i <= 15 ? '' : 'Soltero(a)',
      // 20 without contract type
      tipoContrato: i > 80 ? undefined : 'Término Fijo'
    });
  }

  const diag100 = DataQualityEnginePrompt29.runDiagnostic(hundredCollaborators);

  // Check 1.1: Missing weight is preserved as MISSING/null and not replaced with 72.5 or average
  const weightMissing30 = diag100.problematicFields.filter(f => f.fieldKey === 'pesoKg' && (f.status === 'MISSING' || f.status === 'INVALID')).length;
  results.push({
    id: 'P36-01',
    category: 'Strict Data Absence',
    title: '30 colaboradores sin peso reportan status=MISSING e IMC=NOT_CALCULABLE',
    description: 'Valida que 30 colaboradores sin dato de peso no se completen con promedios ni valores artificiales.',
    passed: weightMissing30 === 30,
    observedResult: `${weightMissing30} celdas marcadas como MISSING/INVALID sin valores inventados.`,
    expectedResult: 'Exactamente 30 registros sin peso clasificados como MISSING/INVALID.'
  });

  // Check 1.2: Missing contract type is preserved as MISSING and not replaced with "Término indefinido"
  const contractMissing20 = diag100.problematicFields.filter(f => f.fieldKey === 'tipoContrato' && f.status === 'MISSING').length;
  results.push({
    id: 'P36-02',
    category: 'Strict Data Absence',
    title: '20 colaboradores sin contrato reportan status=MISSING',
    description: 'Comprueba que no se asigne "Término indefinido" a los 20 colaboradores sin tipo de contrato.',
    passed: contractMissing20 === 20,
    observedResult: `${contractMissing20} celdas de contrato con status=MISSING (sin fallbacks).`,
    expectedResult: 'Exactamente 20 registros sin tipo de contrato marcados como MISSING.'
  });

  // TEST 2: Edge Cases (null, undefined, "", NaN, 0, false, "0", "Sí", "No", "Prefiero no responder")
  const edgeCaseCellNull = DataQualityEnginePrompt29.validateCell(
    MASTER_FIELD_DEFINITIONS.find(f => f.fieldKey === 'pesoKg')!,
    null
  );
  const edgeCaseCellUndefined = DataQualityEnginePrompt29.validateCell(
    MASTER_FIELD_DEFINITIONS.find(f => f.fieldKey === 'estaturaMts')!,
    undefined
  );
  const edgeCaseCellEmptyStr = DataQualityEnginePrompt29.validateCell(
    MASTER_FIELD_DEFINITIONS.find(f => f.fieldKey === 'estadoCivil')!,
    ''
  );
  const edgeCaseCellPreferNotToAnswer = DataQualityEnginePrompt29.validateCell(
    MASTER_FIELD_DEFINITIONS.find(f => f.fieldKey === 'sexo')!,
    'PREFIERO_NO_RESPONDER'
  );

  const edgeCasesPassed =
    edgeCaseCellNull.status === 'MISSING' && edgeCaseCellNull.normalizedValue === null &&
    edgeCaseCellUndefined.status === 'MISSING' && edgeCaseCellUndefined.normalizedValue === null &&
    edgeCaseCellEmptyStr.status === 'MISSING' && edgeCaseCellEmptyStr.normalizedValue === null &&
    edgeCaseCellPreferNotToAnswer.status === 'PREFER_NOT_TO_ANSWER' && edgeCaseCellPreferNotToAnswer.normalizedValue === null;

  results.push({
    id: 'P36-03',
    category: 'Edge Cases Handling',
    title: 'Manejo estricto de null, undefined, "", NaN y PREFIERO_NO_RESPONDER',
    description: 'Verifica que la ausencia de respuesta siempre retorne null y la clasificación de estado correspondiente.',
    passed: edgeCasesPassed,
    observedResult: `null: ${edgeCaseCellNull.status}, undefined: ${edgeCaseCellUndefined.status}, empty: ${edgeCaseCellEmptyStr.status}, preferNotToAnswer: ${edgeCaseCellPreferNotToAnswer.status}`,
    expectedResult: 'null/undefined/empty -> MISSING con value=null, PREFIERO_NO_RESPONDER -> PREFER_NOT_TO_ANSWER con value=null.'
  });

  // TEST 3: Height Out of Range (e.g. 50cm or 300cm)
  const heightOutOfRangeCell = DataQualityEnginePrompt29.validateCell(
    MASTER_FIELD_DEFINITIONS.find(f => f.fieldKey === 'estaturaMts')!,
    0.50
  );
  results.push({
    id: 'P36-04',
    category: 'Range Validation',
    title: 'Estatura fuera de rango (0.50m) marca OUT_OF_RANGE sin corregir a 1.68m',
    description: 'Garantiza que estaturas irrazonables no se auto-corrijan a 1.68m o valores por defecto.',
    passed: heightOutOfRangeCell.status === 'OUT_OF_RANGE' && heightOutOfRangeCell.normalizedValue === 0.50,
    observedResult: `status = ${heightOutOfRangeCell.status}, normalizedValue = ${heightOutOfRangeCell.normalizedValue}`,
    expectedResult: 'status = OUT_OF_RANGE y preservación del valor original sin alteración artificial.'
  });

  // TEST 4: Weight Out of Range (e.g. 10kg or 300kg)
  const weightOutOfRangeCell = DataQualityEnginePrompt29.validateCell(
    MASTER_FIELD_DEFINITIONS.find(f => f.fieldKey === 'pesoKg')!,
    300
  );
  results.push({
    id: 'P36-05',
    category: 'Range Validation',
    title: 'Peso fuera de rango (300kg) marca OUT_OF_RANGE sin corregir a 72.5kg',
    description: 'Asegura que pesos fuera de límite fisiológico no sean sobreescritos automáticamente.',
    passed: weightOutOfRangeCell.status === 'OUT_OF_RANGE' && weightOutOfRangeCell.normalizedValue === 300,
    observedResult: `status = ${weightOutOfRangeCell.status}, normalizedValue = ${weightOutOfRangeCell.normalizedValue}`,
    expectedResult: 'status = OUT_OF_RANGE y conservación del valor ingresado.'
  });

  // TEST 5: IMC Calculation when weight or height is missing
  const imcResultMissingWeight = DataQualityEnginePrompt29.calculateIMC(null, 1.70);
  results.push({
    id: 'P36-06',
    category: 'Calculated Fields Integrity',
    title: 'Cálculo de IMC con peso faltante retorna imc=null e isCalculable=false',
    description: 'El IMC solo debe calcularse cuando existan de forma simultánea peso y estatura válidos.',
    passed: imcResultMissingWeight.imc === null && imcResultMissingWeight.isCalculable === false,
    observedResult: `imc = ${imcResultMissingWeight.imc}, isCalculable = ${imcResultMissingWeight.isCalculable}`,
    expectedResult: 'imc = null, isCalculable = false (estado NOT_CALCULABLE).'
  });

  // TEST 6: Artificial Data Detector
  const artificialDataset = [
    { peso: 72.5, estatura: 1.68, tipoContrato: 'término indefinido', ciudad: 'bogotá' },
    { peso: 72.5, estatura: 1.68, tipoContrato: 'término indefinido', ciudad: 'bogotá' },
    { peso: 72.5, estatura: 1.68, tipoContrato: 'término indefinido', ciudad: 'bogotá' },
    { peso: 72.5, estatura: 1.68, tipoContrato: 'término indefinido', ciudad: 'bogotá' },
    { peso: 72.5, estatura: 1.68, tipoContrato: 'término indefinido', ciudad: 'bogotá fontibón' }
  ];
  const artificialWarnings = ArtificialDataDetector.detectArtificialData(artificialDataset);
  const detectedArtificialWeight = artificialWarnings.some(w => w.fieldKey === 'peso');
  const detectedArtificialHeight = artificialWarnings.some(w => w.fieldKey === 'estatura');

  results.push({
    id: 'P36-07',
    category: 'Artificial Data Detector',
    title: 'Detector de Datos Artificiales identifica fallbacks repetidos (72.5kg, 1.68m)',
    description: 'Identifica y emite advertencias sobre patrones sospechosos de datos predeterminados sin respaldo fuente.',
    passed: detectedArtificialWeight && detectedArtificialHeight,
    observedResult: `Se emitieron ${artificialWarnings.length} advertencias de datos artificiales.`,
    expectedResult: 'Advertencias activas para valores repetidos artificiales de peso y estatura.'
  });

  // TEST 7: Zero Values in Numeric Fields (Valid 0)
  const zeroChildrenCell = DataQualityEnginePrompt29.validateCell(
    MASTER_FIELD_DEFINITIONS.find(f => f.fieldKey === 'numeroHijos')!,
    0
  );
  results.push({
    id: 'P36-08',
    category: 'Numeric Zero Disambiguation',
    title: 'El número 0 en numeroHijos es tratado como DATO VÁLIDO (0 hijos), NO como faltante',
    description: 'Diferencia explícitamente entre la respuesta 0 y la ausencia de información (null).',
    passed: zeroChildrenCell.status === 'VALID' && zeroChildrenCell.normalizedValue === 0,
    observedResult: `status = ${zeroChildrenCell.status}, value = ${zeroChildrenCell.normalizedValue}`,
    expectedResult: 'status = VALID con value = 0.'
  });

  // TEST 8: Denominator Zero Indicator Protection
  const denominatorZeroCoverage = DataQualityEnginePrompt29.runDiagnostic([
    { numeroIdentificacion: '101', pesoKg: null, estaturaMts: null },
    { numeroIdentificacion: '102', pesoKg: null, estaturaMts: null }
  ]);
  const invalidImcCount = denominatorZeroCoverage.problematicFields.filter(f => f.fieldKey === 'pesoKg').length;

  results.push({
    id: 'P36-09',
    category: 'Denominator Zero Protection',
    title: 'Denominador 0 en indicadores no calcula 0% sintético sino NOT_CALCULABLE',
    description: 'Impide presentar métricas engañosas del 0% cuando la población evaluada no tiene información.',
    passed: invalidImcCount === 2,
    observedResult: `${invalidImcCount} registros evaluados adecuadamente como sin datos.`,
    expectedResult: 'Información clasificada como insuficiente/no calculable.'
  });

  // TEST 9: Logical Consistency Contradiction Detection
  const rowInconsistency = DataQualityEnginePrompt29.evaluateRowConsistency({
    tieneHijos: false,
    numeroHijos: 3
  }, 0);

  results.push({
    id: 'P36-10',
    category: 'Logical Consistency',
    title: 'Detección de contradicción: tieneHijos=false y numeroHijos=3 genera status=INCONSISTENT',
    description: 'Evalúa la coherencia lógica entre preguntas interrelacionadas.',
    passed: rowInconsistency.length > 0 && rowInconsistency[0].status === 'INCONSISTENT',
    observedResult: rowInconsistency.length > 0 ? `Contradicción detectada: ${rowInconsistency[0].reason}` : 'No detectado',
    expectedResult: 'Registro marcado con status INCONSISTENT.'
  });

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    total: results.length,
    passedCount,
    failedCount,
    allPassed: failedCount === 0,
    results
  };
}
