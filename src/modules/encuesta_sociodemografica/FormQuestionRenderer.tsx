import React, { useMemo } from 'react';
import { QuestionSchema, SurveyAnswers } from './types';
import { calculateIMC } from './utils';
import { HelpCircle, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import { useEmpresa } from '../configuracion/useEmpresa';
import { CatalogKey } from '../configuracion/catalogos.types';

interface FormQuestionRendererProps {
  question: QuestionSchema;
  answers: SurveyAnswers;
  error?: string;
  onChange: (questionId: string, value: any) => void;
}

export const FormQuestionRenderer: React.FC<FormQuestionRendererProps> = ({
  question,
  answers,
  error,
  onChange
}) => {
  const { companies, getCatalogItems } = useEmpresa();
  const rawValue = answers[question.id];
  const value = rawValue !== undefined && rawValue !== null ? rawValue : (question.defaultValue ?? '');

  // 1. Dependency Check (Conditional Logic)
  if (question.dependsOn) {
    const parentVal = answers[question.dependsOn.questionId];
    if (parentVal === undefined || parentVal === null || parentVal === '') {
      return null;
    }

    const targetVal = question.dependsOn.value;
    if (Array.isArray(targetVal)) {
      if (Array.isArray(parentVal)) {
        const hasOverlap = parentVal.some(v => targetVal.includes(v));
        if (!hasOverlap) return null;
      } else {
        if (!targetVal.includes(parentVal)) return null;
      }
    } else {
      if (Array.isArray(parentVal)) {
        if (!parentVal.includes(targetVal)) return null;
      } else {
        if (parentVal !== targetVal) return null;
      }
    }
  }

  // 2. Dynamic Options Resolution from Company Catalogs
  const resolvedOptions = useMemo(() => {
    // Special handle for 'empresa'
    if (question.id === 'empresa' || question.fieldKey === 'empresa') {
      if (companies && companies.length > 0) {
        return companies.map(c => ({
          label: c.nombreEmpresa || `Empresa ${c.id.substring(0, 6)}`,
          value: c.nombreEmpresa || c.id
        }));
      }
    }

    // Map question IDs / fieldKeys to Catalog Keys
    const catalogKeyMap: Record<string, CatalogKey> = {
      sede: 'sedes',
      area: 'areas',
      areaOProceso: 'areas',
      proyectos: 'proyectos',
      proyecto: 'proyectos',
      cargo: 'cargos',
      centroTrabajo: 'centrosTrabajo',
      centroCosto: 'centrosCosto',
      tipoContrato: 'tiposContrato',
      modalidadTrabajo: 'modalidadesTrabajo',
      modalidadDetalle: 'modalidadesTrabajo',
      turno: 'turnos',
      ciudad: 'ciudades',
      ciudadResidencia: 'ciudades'
    };

    const key = catalogKeyMap[question.id] || catalogKeyMap[question.fieldKey || ''];
    if (key) {
      const items = getCatalogItems(key, true);
      if (items && items.length > 0) {
        return items.map(item => ({
          label: item.nombre,
          value: item.nombre
        }));
      }
    }

    // Fallback to static schema options if catalog is not available
    return question.options || [];
  }, [question.id, question.fieldKey, question.options, companies, getCatalogItems]);

  // 3. Special computed field: IMC
  if (question.computed || question.id === 'imcCalculado') {
    const weight = answers['pesoKg'] !== undefined && answers['pesoKg'] !== '' ? Number(answers['pesoKg']) : (answers['peso'] !== undefined && answers['peso'] !== '' ? Number(answers['peso']) : undefined);
    const height = answers['estaturaCm'] !== undefined && answers['estaturaCm'] !== '' ? Number(answers['estaturaCm']) : (answers['estatura'] !== undefined && answers['estatura'] !== '' ? Number(answers['estatura']) : undefined);

    const imcResult = calculateIMC(weight, height);

    return (
      <div className="space-y-2 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-150 my-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800 flex items-center gap-2">
            <span>{question.label}</span>
            {question.tooltip && (
              <span className="text-slate-400 cursor-help" title={question.tooltip}>
                <Info className="w-3.5 h-3.5" />
              </span>
            )}
          </label>
          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-full">
            Fórmula Estricta IMC
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-indigo-200 shadow-2xs">
          <div>
            <span className="text-xs font-bold text-slate-500 block">Estatus de Cálculo:</span>
            <span className="text-xs font-black text-slate-900 block mt-0.5">
              {imcResult.imc !== null ? `IMC = ${imcResult.imc} kg/m²` : 'Información no disponible (NOT_CALCULABLE)'}
            </span>
          </div>

          <div className={`px-3 py-1.5 rounded-xl text-xs font-black border ${imcResult.color}`}>
            {imcResult.label}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
          {question.helpText || 'Cálculo estricto: IMC = peso / (estatura/100)². Si falta peso o estatura, resultará en NOT_CALCULABLE.'}
        </p>
      </div>
    );
  }

  // 4. Height / Weight Out-of-Range Warnings
  const showHeightWarning = (question.id === 'estaturaCm' || question.id === 'estatura') && value !== '' && (Number(value) < 100 || Number(value) > 230);
  const showWeightWarning = (question.id === 'pesoKg' || question.id === 'peso') && value !== '' && (Number(value) < 30 || Number(value) > 250);

  return (
    <div className="space-y-2 text-left my-1">
      {/* Label, Category, and Sensitivity Badge */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5 flex-wrap">
          <span>{question.label}</span>
          {question.required && <span className="text-rose-500 font-bold">*</span>}
          {question.sensitive && (
            <span className="inline-flex items-center gap-1 text-[9.5px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md border border-amber-200">
              <ShieldAlert className="w-3 h-3 text-amber-600 shrink-0" />
              <span>Dato Sensible SG-SST</span>
            </span>
          )}
          {question.tooltip && (
            <span className="text-slate-400 hover:text-indigo-600 cursor-help transition-colors" title={question.tooltip}>
              <HelpCircle className="w-3.5 h-3.5" />
            </span>
          )}
        </label>

        {question.category && (
          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
            {question.category}
          </span>
        )}
      </div>

      {/* Input Field Types */}
      {question.type === 'text' && (
        <input
          type="text"
          value={value}
          readOnly={question.readonly}
          disabled={question.readonly}
          onChange={(e) => {
            if (question.readonly) return;
            onChange(question.id, e.target.value);
          }}
          placeholder={question.placeholder}
          className={`w-full px-4 py-3 border rounded-xl text-xs font-medium transition-all ${
            question.readonly
              ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
              : error
              ? 'bg-white border-rose-400 focus:ring-rose-200 focus:outline-none focus:ring-2'
              : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-100 focus:outline-none focus:ring-2'
          }`}
        />
      )}

      {question.type === 'number' && (
        <div className="relative flex items-center">
          <input
            type="number"
            value={value}
            readOnly={question.readonly}
            disabled={question.readonly}
            step={question.step || 'any'}
            min={question.validation?.min}
            max={question.validation?.max}
            onChange={(e) => onChange(question.id, e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={question.placeholder}
            className={`w-full px-4 py-3 border rounded-xl text-xs font-medium transition-all ${
              question.unit ? 'pr-12' : ''
            } ${
              question.readonly
                ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                : error || showHeightWarning || showWeightWarning
                ? 'bg-white border-rose-400 focus:ring-rose-200 focus:outline-none focus:ring-2'
                : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-100 focus:outline-none focus:ring-2'
            }`}
          />
          {question.unit && (
            <span className="absolute right-3.5 text-xs font-black text-slate-400 select-none">
              {question.unit}
            </span>
          )}
        </div>
      )}

      {question.type === 'date' && (
        <input
          type="date"
          value={value}
          readOnly={question.readonly}
          disabled={question.readonly}
          onChange={(e) => {
            if (!question.readonly) onChange(question.id, e.target.value);
          }}
          className={`w-full px-4 py-3 border rounded-xl text-xs font-medium transition-all ${
            question.readonly
              ? 'bg-slate-100 text-slate-700 font-semibold border-slate-200 cursor-not-allowed'
              : error
              ? 'bg-white border-rose-400 focus:ring-rose-200 focus:outline-none focus:ring-2'
              : 'bg-white border-slate-200 text-slate-800 focus:border-indigo-500 focus:ring-indigo-100 focus:outline-none focus:ring-2'
          }`}
        />
      )}

      {question.type === 'select' && (
        <select
          value={value}
          onChange={(e) => onChange(question.id, e.target.value)}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 transition-all cursor-pointer ${
            error
              ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
          }`}
        >
          <option value="">-- Seleccionar opción --</option>
          {resolvedOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}

      {question.type === 'radio' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {resolvedOptions.map((opt) => {
            const isChecked = value === opt.value;
            return (
              <label
                key={opt.value}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                  isChecked
                    ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-2xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name={question.id}
                  value={opt.value}
                  checked={isChecked}
                  onChange={() => onChange(question.id, opt.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      )}

      {question.type === 'checkbox' && (
        <label className={`flex items-start gap-3 p-3.5 bg-white border rounded-xl text-xs font-medium text-slate-700 transition-all cursor-pointer ${
          error ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200 hover:border-slate-300'
        }`}>
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(question.id, e.target.checked)}
            className="w-4 h-4 mt-0.5 text-indigo-600 focus:ring-indigo-500 rounded accent-indigo-600 cursor-pointer"
          />
          <span className="leading-relaxed">{question.helpText || question.label}</span>
        </label>
      )}

      {question.type === 'multiselect' && (
        <div className="space-y-2 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {resolvedOptions.map((opt) => {
              const currentList: string[] = Array.isArray(value) ? value : [];
              const isSelected = currentList.includes(opt.value);

              const handleToggle = () => {
                if (isSelected) {
                  onChange(question.id, currentList.filter(v => v !== opt.value));
                } else {
                  onChange(question.id, [...currentList, opt.value]);
                }
              };

              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={handleToggle}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 rounded accent-indigo-600 cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {question.type === 'textarea' && (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(question.id, e.target.value)}
          placeholder={question.placeholder}
          className={`w-full px-4 py-3 bg-white border rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all resize-y ${
            error
              ? 'border-rose-400 focus:ring-rose-200 bg-rose-50/20'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
          }`}
        />
      )}

      {/* Warnings & Help Text */}
      {showHeightWarning && (
        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] font-bold">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Advertencia: La estatura ingresada ({value} cm) se encuentra fuera del rango habitual (100–230 cm). Se conservará el dato original reportado sin modificar.</span>
        </div>
      )}

      {showWeightWarning && (
        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[11px] font-bold">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Advertencia: El peso ingresado ({value} kg) se encuentra fuera del rango habitual (30–250 kg). Se conservará el dato original reportado sin modificar.</span>
        </div>
      )}

      {question.helpText && question.type !== 'checkbox' && (
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{question.helpText}</p>
      )}

      {/* Error Message Display */}
      {error && (
        <div className="flex items-center gap-1.5 text-rose-600 text-[11px] font-bold pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
