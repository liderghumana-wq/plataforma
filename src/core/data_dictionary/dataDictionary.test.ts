import { DATA_DICTIONARY } from './dataDictionary';
import { 
  getDictionaryField, 
  normalizeFieldValue, 
  calculateDerivedFields, 
  parseSurveySubmission, 
  parseExcelRow, 
  testEquivalence, 
  getTraceabilityMap 
} from './dataDictionaryEngine';

export function runDataDictionaryTests() {
  console.log('====================================================');
  console.log('RUNNING DATA DICTIONARY & EQUIVALENCE TEST SUITE');
  console.log('====================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: Dictionary Catalog Completeness
  assert(DATA_DICTIONARY.length >= 30, 'DataDictionary should contain at least 30 core variables');

  const categories = new Set(DATA_DICTIONARY.map(f => f.category));
  assert(categories.has('SOCIODEMOGRAPHIC'), 'Catalog includes SOCIODEMOGRAPHIC category');
  assert(categories.has('LABOR'), 'Catalog includes LABOR category');
  assert(categories.has('HEALTH'), 'Catalog includes HEALTH category');
  assert(categories.has('ORGANIZATIONAL'), 'Catalog includes ORGANIZATIONAL category');

  // TEST 2: Lookup by fieldKey and Aliases
  const pesoByFieldKey = getDictionaryField('peso');
  assert(pesoByFieldKey !== undefined && pesoByFieldKey.fieldKey === 'peso', 'Lookup by exact fieldKey "peso" works');

  const pesoByAlias = getDictionaryField('Peso corporal');
  assert(pesoByAlias !== undefined && pesoByAlias.fieldKey === 'peso', 'Lookup by alias "Peso corporal" resolves to "peso"');

  // TEST 3: Sensitive Health Fields Tagging
  const saludFields = DATA_DICTIONARY.filter(f => f.category === 'HEALTH');
  const allHealthSensitive = saludFields.every(f => f.sensitive);
  assert(allHealthSensitive, 'All HEALTH category variables are flagged as sensitive');

  // TEST 4: Strict No-Fallback Normalization
  const weightDef = getDictionaryField('peso')!;
  const nullWeight = normalizeFieldValue(weightDef, null);
  assert(nullWeight.normalizedValue === null && nullWeight.status === 'MISSING', 'Null weight normalizes to null with status MISSING');

  const preferNotToAnswer = normalizeFieldValue(weightDef, 'Prefiero no responder');
  assert(preferNotToAnswer.normalizedValue === 'PREFER_NOT_TO_ANSWER' && preferNotToAnswer.status === 'PREFER_NOT_TO_ANSWER', 'Prefiero no responder normalizes explicitly to PREFER_NOT_TO_ANSWER');

  // TEST 5: Derived Fields Calculation (IMC, Edad, Antiguedad)
  const normPeso = normalizeFieldValue(weightDef, 70);
  const heightDef = getDictionaryField('estatura')!;
  const normEstatura = normalizeFieldValue(heightDef, 175);

  const derived = calculateDerivedFields({
    peso: normPeso,
    estatura: normEstatura
  });

  assert(derived['imc'].normalizedValue === 22.9, 'IMC calculated accurately for 70kg and 175cm (22.9)');

  // TEST 6: Incomplete IMC Calculation (Missing height)
  const incompleteDerived = calculateDerivedFields({
    peso: normPeso,
    estatura: normalizeFieldValue(heightDef, null)
  });
  assert(incompleteDerived['imc'].normalizedValue === null && incompleteDerived['imc'].status === 'NOT_CALCULABLE', 'IMC is null with status NOT_CALCULABLE when estatura is missing');

  // TEST 7: CRITICAL EQUIVALENCE TEST (Survey vs Excel row)
  const surveyRecord = {
    fechaNacimiento: "1990-08-25",
    genero: "Masculino",
    estadoCivil: "Soltero(a)",
    escolaridad: "Profesional / Pregrado",
    sede: "Sede Principal",
    area: "Tecnología",
    peso: 80,
    estatura: 180,
    actividadFisica: "Sí"
  };

  const excelRecord = {
    "Fecha Nacimiento": "1990-08-25",
    "Sexo": "Masculino",
    "Estado Civil": "Soltero(a)",
    "Nivel de Escolaridad": "Profesional / Pregrado",
    "Sede": "Sede Principal",
    "Área": "Tecnología",
    "Peso corporal": 80,
    "Estatura (cm)": 180,
    "¿Practicas algún deporte o actividad física de manera regular?": "Sí"
  };

  const equivResult = testEquivalence(surveyRecord, excelRecord);
  assert(equivResult.isEquivalent === true, 'Survey Record and Excel Record yield 100% equivalent normalized outputs');

  // TEST 8: Traceability Map Lookup
  const trace = getTraceabilityMap('peso', 80);
  assert(trace !== null && trace.fieldKey === 'peso' && trace.derivedIndicators.includes('IND_HEA_IMC_DISTRIBUCION'), 'Traceability map resolves fieldKey to question, indicators, and report sections');

  console.log('====================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  return { passed, failed };
}

// Run if invoked directly via tsx
if (import.meta.url.endsWith('dataDictionary.test.ts')) {
  runDataDictionaryTests();
}
