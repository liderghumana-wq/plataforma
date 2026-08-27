import React, { useState, useMemo } from 'react';
import { 
  Database, 
  Layers, 
  ShieldCheck, 
  Table as TableIcon, 
  Key, 
  FileCode, 
  Download, 
  CheckCircle2, 
  Building2, 
  Users, 
  Sliders, 
  BarChart2, 
  Globe, 
  Sparkles,
  RefreshCw,
  Search,
  Code2,
  Trash2,
  RotateCcw,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { masterDataModelService } from '../../core/master_data_model/service';
import { TableSchemaMetadata } from '../../core/master_data_model/schema';
import { BaseAuditEntity } from '../../core/master_data_model/types';

import { DataDictionaryManager } from '../../core/data_dictionary/components/DataDictionaryManager';

interface ArquitecturaDatosModuleProps {
  currentCompanyId?: string;
}

export function ArquitecturaDatosModule({ currentCompanyId = 'empresa_main_001' }: ArquitecturaDatosModuleProps) {
  const catalog = useMemo(() => masterDataModelService.getSchemaCatalog(), []);
  const [selectedTable, setSelectedTable] = useState<string>('EMPRESAS');
  const [activeTab, setActiveTab] = useState<'CONTRATO_DATOS' | 'EXPLORADOR' | 'ESQUEMA_3NF' | 'POWER_BI' | 'DDL_SQL'>('CONTRATO_DATOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const activeTableMeta = useMemo(() => {
    return catalog.find(t => t.tableName === selectedTable) || catalog[0];
  }, [catalog, selectedTable]);

  // Load live table records
  const tableRecords = useMemo(() => {
    return masterDataModelService.getTableData(selectedTable, currentCompanyId, includeDeleted);
  }, [selectedTable, currentCompanyId, includeDeleted, refreshTrigger]);

  const sqlScriptDDL = useMemo(() => masterDataModelService.getSQLScriptDDL(), []);
  const powerBiMeta = useMemo(() => masterDataModelService.getPowerBIMetadata(), []);

  const filteredCatalog = useMemo(() => {
    if (!searchTerm) return catalog;
    const term = searchTerm.toLowerCase();
    return catalog.filter(t => 
      t.tableName.toLowerCase().includes(term) || 
      t.description.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term)
    );
  }, [catalog, searchTerm]);

  const handleSoftDelete = (id: string) => {
    if (confirm(`¿Confirma aplicar borrado lógico (Soft Delete) al registro ID: ${id}?`)) {
      masterDataModelService.softDeleteEntity(selectedTable, id);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleRestore = (id: string) => {
    masterDataModelService.restoreEntity(selectedTable, id);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`¡${label} copiado al portapapeles con éxito!`);
  };

  return (
    <div className="space-y-6 text-slate-800 text-left">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-400/20 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-300" />
              <span>Arquitectura de Datos Enterprise</span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-2.5 py-1 rounded-full border border-emerald-400/20">
              Norma 3NF Verified
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Modelo de Datos Maestro (Master Data Model)
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Esquema relacional altamente escalable para múltiples empresas, encuestas y usuarios. Garantiza aislamiento multi-tenant, auditoría completa, borrado lógico (Soft Delete) y listo para Power BI/APIs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCopyToClipboard(sqlScriptDDL, 'Script SQL DDL')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileCode className="w-4 h-4" />
            <span>Copiar DDL SQL</span>
          </button>
        </div>
      </div>

      {/* Main Stats Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Entidades Totales</span>
          <span className="text-xl font-black text-indigo-600">{catalog.length} Tablas Maestras</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Nivel de Normalización</span>
          <span className="text-xl font-black text-emerald-600">3NF (Sin Redundancia)</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Auditoría Estándar</span>
          <span className="text-xl font-black text-slate-800">8 Campos Nativos</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">Soporte BI & APIs</span>
          <span className="text-xl font-black text-purple-600">Power BI / Rest OData</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-1">
        {[
          { id: 'CONTRATO_DATOS', label: '📖 Contrato Único de Datos', icon: ShieldCheck },
          { id: 'EXPLORADOR', label: '📊 Explorador de Datos Live', icon: TableIcon },
          { id: 'ESQUEMA_3NF', label: '📐 Metadatos de Tabla (3NF)', icon: Layers },
          { id: 'POWER_BI', label: '📈 Modelo de Datos Power BI', icon: BarChart2 },
          { id: 'DDL_SQL', label: '💻 Script PostgreSQL DDL', icon: Code2 }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50' 
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'CONTRATO_DATOS' ? (
        <DataDictionaryManager />
      ) : (
      /* Main Content Layout */
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Table Catalog Navigation */}
        <div className="md:col-span-1 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar entidad..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-1">
            Catálogo de Entidades ({filteredCatalog.length})
          </div>

          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {filteredCatalog.map(t => {
              const isSelected = selectedTable === t.tableName;
              return (
                <button
                  key={t.tableName}
                  onClick={() => setSelectedTable(t.tableName)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-indigo-600 text-white font-black shadow-xs'
                      : 'bg-slate-50/70 text-slate-700 hover:bg-slate-100 font-bold'
                  }`}
                >
                  <div className="truncate">
                    <span className="text-xs block truncate">{t.tableName}</span>
                    <span className={`text-[9px] block truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                      {t.description}
                    </span>
                  </div>
                  {t.tableName === 'EMPRESAS' && <Key className="w-3 h-3 text-amber-300 shrink-0 ml-1" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active View Content */}
        <div className="md:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
          
          {/* TAB 1: LIVE DATA EXPLORER */}
          {activeTab === 'EXPLORADOR' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <TableIcon className="w-5 h-5 text-indigo-600" />
                    <span>Registros de Tabla: {activeTableMeta.tableName}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {activeTableMeta.description}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeDeleted}
                      onChange={(e) => setIncludeDeleted(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span>Ver Soft-Deleted</span>
                  </label>

                  <span className="text-xs font-extrabold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                    {tableRecords.length} Registros
                  </span>
                </div>
              </div>

              {tableRecords.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <Database className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-500">No hay registros activos para esta empresa tenant.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-900 text-white font-extrabold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">ID / Acciones</th>
                        {activeTableMeta.columns.filter(c => !['id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'deletedAt'].includes(c.name)).map(c => (
                          <th key={c.name} className="p-3 whitespace-nowrap">{c.name}</th>
                        ))}
                        <th className="p-3">Audit (companyId / isActive)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {tableRecords.map((rec: any) => {
                        const isSoftDeleted = !rec.isActive || rec.deletedAt !== null;

                        return (
                          <tr key={rec.id} className={`hover:bg-slate-50/80 ${isSoftDeleted ? 'bg-rose-50/50 opacity-60' : ''}`}>
                            <td className="p-3 whitespace-nowrap font-mono text-[10px]">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-indigo-600">{rec.id}</span>
                                {isSoftDeleted ? (
                                  <button
                                    onClick={() => handleRestore(rec.id)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200 cursor-pointer"
                                    title="Restaurar Registro"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSoftDelete(rec.id)}
                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded border border-rose-200 cursor-pointer"
                                    title="Soft Delete (Borrado Lógico)"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>

                            {activeTableMeta.columns.filter(c => !['id', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'deletedAt'].includes(c.name)).map(c => (
                              <td key={c.name} className="p-3 whitespace-nowrap max-w-xs truncate">
                                {typeof rec[c.name] === 'object' ? JSON.stringify(rec[c.name]) : String(rec[c.name] ?? '-')}
                              </td>
                            ))}

                            <td className="p-3 whitespace-nowrap">
                              <span className="text-[10px] font-mono block">Tenant: {rec.companyId || 'GLOBAL'}</span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${rec.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                {rec.isActive ? 'ACTIVO' : 'DELETED'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 3NF SCHEMA & COLUMNS */}
          {activeTab === 'ESQUEMA_3NF' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Estructura Normalizada 3NF: {activeTableMeta.tableName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Definición de columnas, claves foráneas e índices relacionales sin duplicidad.
                  </p>
                </div>

                <span className="text-xs font-extrabold bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-200">
                  {activeTableMeta.category}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 font-extrabold text-slate-700">
                    <tr>
                      <th className="p-3">Columna</th>
                      <th className="p-3">Tipo de Dato</th>
                      <th className="p-3">Permite Nulos</th>
                      <th className="p-3">Claves & Relaciones FK</th>
                      <th className="p-3">Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {activeTableMeta.columns.map(col => (
                      <tr key={col.name} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {col.name}
                        </td>
                        <td className="p-3 font-mono text-indigo-600 font-bold">
                          {col.type}
                        </td>
                        <td className="p-3">
                          {col.nullable ? <span className="text-slate-400">Sí</span> : <span className="font-bold text-slate-800">No</span>}
                        </td>
                        <td className="p-3">
                          {col.isPrimaryKey && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded mr-1">PRIMARY KEY</span>
                          )}
                          {col.isForeignKey && col.referencesTable && (
                            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-extrabold rounded">
                              FK → {col.referencesTable}({col.referencesColumn})
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600 text-[11px]">
                          {col.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {activeTableMeta.indexes.length > 0 && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-xs font-bold text-slate-900 block">Índices de Rendimiento Definidos:</span>
                  <div className="flex flex-wrap gap-2">
                    {activeTableMeta.indexes.map(idx => (
                      <span key={idx} className="font-mono text-[10px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700">
                        {idx}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: POWER BI MODEL */}
          {activeTab === 'POWER_BI' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Modelo Tabular para Power BI & Analytics
                  </h3>
                  <p className="text-xs text-slate-500">
                    Esquema JSON listo para integración OData / DirectQuery en Power BI Desktop.
                  </p>
                </div>

                <button
                  onClick={() => handleCopyToClipboard(JSON.stringify(powerBiMeta, null, 2), 'Esquema Power BI')}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Copiar JSON BI</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-xs overflow-x-auto max-h-96">
                <pre>{JSON.stringify(powerBiMeta, null, 2)}</pre>
              </div>
            </div>
          )}

          {/* TAB 4: DDL SQL SCRIPT */}
          {activeTab === 'DDL_SQL' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Script DDL de Migración Database (PostgreSQL / Cloud SQL)
                  </h3>
                  <p className="text-xs text-slate-500">
                    DDL completo con claves foráneas, restricciones de unicidad e índices.
                  </p>
                </div>

                <button
                  onClick={() => handleCopyToClipboard(sqlScriptDDL, 'Script DDL SQL')}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Copiar Script</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto max-h-[450px]">
                <pre className="whitespace-pre">{sqlScriptDDL}</pre>
              </div>
            </div>
          )}

        </div>

      </div>
      )}

    </div>
  );
}
