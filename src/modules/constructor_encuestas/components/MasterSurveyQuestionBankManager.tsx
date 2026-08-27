import React, { useState } from 'react';
import { 
  Database, Search, Filter, ShieldAlert, AlertCircle, CheckCircle, 
  Layers, Lock, Eye, Tag, HelpCircle
} from 'lucide-react';
import { QuestionBankService, QuestionBankQuestion, MASTER_MODULES } from '../questionBankService';

interface MasterSurveyQuestionBankManagerProps {
  companyId?: string;
}

export const MasterSurveyQuestionBankManager: React.FC<MasterSurveyQuestionBankManagerProps> = ({
  companyId = 'default'
}) => {
  const [selectedModule, setSelectedModule] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState<boolean>(false);
  const [filterSensitiveOnly, setFilterSensitiveOnly] = useState<boolean>(false);

  const questions = QuestionBankService.getQuestionBankForCompany(companyId);

  const filteredQuestions = questions.filter(q => {
    if (selectedModule !== 'ALL' && q.moduleId !== selectedModule) return false;
    if (filterCriticalOnly && !q.critical) return false;
    if (filterSensitiveOnly && !q.sensitive) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchText = (q.question + q.fieldKey + q.excelAliases.join(' ')).toLowerCase();
      if (!matchText.includes(query)) return false;
    }
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 space-y-6 shadow-2xl">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full uppercase tracking-wider">
              BANCO DE PREGUNTAS NORMATIVO (QUESTION BANK)
            </span>
            <span className="text-slate-400 text-xs font-mono">
              {questions.length} Preguntas Mapeadas
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Diccionario de Datos & Preguntas Estandarizadas (11 Módulos)
          </h2>
          <p className="text-xs text-slate-400">
            Define la estructura de captura para encuestas web e importación de archivos Excel con alias, tipos de datos y reglas de privacidad.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>fieldKeys Mapeados: <strong className="text-white">{questions.length}</strong></span>
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
        {/* SEARCH BAR */}
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por pregunta, fieldKey o alias Excel..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* MODULE SELECTOR */}
        <div>
          <select
            value={selectedModule}
            onChange={e => setSelectedModule(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Todos los Módulos (1 a 11)</option>
            {MASTER_MODULES.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {/* TOGGLE FLAGS */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
            className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
              filterCriticalOnly
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Críticas
          </button>
          <button
            type="button"
            onClick={() => setFilterSensitiveOnly(!filterSensitiveOnly)}
            className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
              filterSensitiveOnly
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Sensibles
          </button>
        </div>
      </div>

      {/* QUESTIONS TABLE */}
      <div className="bg-slate-950/40 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">ID / Módulo</th>
                <th className="p-3">Pregunta & Regla</th>
                <th className="p-3">fieldKey & Alias Excel</th>
                <th className="p-3">Tipo / Datos</th>
                <th className="p-3">Flags de Gobierno</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map(q => (
                  <tr key={q.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-3">
                      <div className="font-mono text-emerald-400 font-bold">{q.id}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-800 text-slate-300 text-[10px] rounded-md font-semibold">
                        Mód {q.moduleId}
                      </span>
                    </td>

                    <td className="p-3 max-w-xs">
                      <p className="font-bold text-white text-xs leading-snug">{q.question}</p>
                      {q.validationRules?.customErrorMessage && (
                        <p className="text-[10px] text-amber-400/90 mt-1 italic">
                          Regla: {q.validationRules.customErrorMessage}
                        </p>
                      )}
                    </td>

                    <td className="p-3">
                      <div className="font-mono text-xs font-bold text-teal-300 bg-slate-900 px-2 py-1 rounded border border-slate-800 inline-block mb-1">
                        {q.fieldKey}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {q.excelAliases.slice(0, 3).map(alias => (
                          <span key={alias} className="text-[9px] font-mono bg-slate-950 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                            {alias}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="capitalize text-slate-200 font-semibold">{q.type}</span>
                      <div className="text-[10px] text-slate-500 font-mono">{q.dataType}</div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {q.required && (
                          <span className="px-1.5 py-0.5 bg-sky-500/20 text-sky-300 border border-sky-500/30 text-[9px] font-bold rounded">
                            Requerida
                          </span>
                        )}
                        {q.critical && (
                          <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold rounded">
                            Crítica
                          </span>
                        )}
                        {q.sensitive && (
                          <span className="px-1.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-bold rounded flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" />
                            Sensible
                          </span>
                        )}
                        {q.allowPreferNotToAnswer && (
                          <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[9px] rounded">
                            Permite "Prefiero no responder"
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                    No se encontraron preguntas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
