import React from 'react';
import { 
  Type, 
  AlignLeft, 
  Hash, 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  ToggleRight, 
  CircleDot, 
  ListFilter, 
  CheckSquare, 
  CheckCheck, 
  Sliders, 
  TrendingUp, 
  Award, 
  Upload, 
  Image as ImageIcon, 
  PenTool, 
  MapPin 
} from 'lucide-react';
import { TipoPregunta, LISTA_TIPOS_PREGUNTA, TipoPreguntaMetadata } from '../types';

interface QuestionTypeSelectorProps {
  selectedTipo: TipoPregunta;
  onSelectTipo: (tipo: TipoPregunta) => void;
}

export function QuestionTypeSelector({ selectedTipo, onSelectTipo }: QuestionTypeSelectorProps) {

  const renderIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case 'Type': return <Type className={className} />;
      case 'AlignLeft': return <AlignLeft className={className} />;
      case 'Hash': return <Hash className={className} />;
      case 'Calendar': return <Calendar className={className} />;
      case 'Clock': return <Clock className={className} />;
      case 'Mail': return <Mail className={className} />;
      case 'Phone': return <Phone className={className} />;
      case 'ToggleRight': return <ToggleRight className={className} />;
      case 'CircleDot': return <CircleDot className={className} />;
      case 'ListFilter': return <ListFilter className={className} />;
      case 'CheckSquare': return <CheckSquare className={className} />;
      case 'CheckCheck': return <CheckCheck className={className} />;
      case 'Sliders': return <Sliders className={className} />;
      case 'TrendingUp': return <TrendingUp className={className} />;
      case 'Award': return <Award className={className} />;
      case 'Upload': return <Upload className={className} />;
      case 'Image': return <ImageIcon className={className} />;
      case 'PenTool': return <PenTool className={className} />;
      case 'MapPin': return <MapPin className={className} />;
      default: return <Type className={className} />;
    }
  };

  const grupos = [
    { id: 'texto', label: 'Entradas de Texto y Números' },
    { id: 'seleccion', label: 'Opciones y Listas' },
    { id: 'escalas', label: 'Escalas y Evaluaciones' },
    { id: 'multimedia', label: 'Archivos y Firmas' },
    { id: 'especiales', label: 'Fechas y Geolocalización' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block">
          Tipo de Campo / Pregunta ({LISTA_TIPOS_PREGUNTA.length} soportados)
        </label>
        <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
          Totalmente Configurable
        </span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
        {grupos.map(grupo => {
          const items = LISTA_TIPOS_PREGUNTA.filter(i => i.grupo === grupo.id);
          if (items.length === 0) return null;

          return (
            <div key={grupo.id} className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-1">
                {grupo.label}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {items.map(meta => {
                  const isSelected = meta.tipo === selectedTipo;
                  return (
                    <button
                      key={meta.tipo}
                      type="button"
                      onClick={() => onSelectTipo(meta.tipo)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-300' 
                          : 'bg-slate-50/80 hover:bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'}`}>
                        {renderIcon(meta.iconoName, "w-4 h-4")}
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold block truncate leading-tight">
                          {meta.nombre}
                        </span>
                        <span className={`text-[10px] font-normal block truncate mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                          {meta.descripcion}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
