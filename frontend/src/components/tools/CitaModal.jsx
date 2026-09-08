import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Quote, Sparkles, BookOpen } from 'lucide-react';
import { api } from '../../services/api';

export default function CitaModal({ isOpen, onClose, libro }) {
  const [style, setStyle] = useState('apa');
  const [citationData, setCitationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && libro) {
      loadCitation(style);
    }
  }, [isOpen, libro, style]);

  const loadCitation = async (selectedStyle) => {
    try {
      setLoading(true);
      const res = await api.getCitation(libro, selectedStyle);
      if (res.success) {
        setCitationData(res.data);
      }
    } catch (err) {
      console.error("Error al generar cita:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (citationData?.citation) {
      navigator.clipboard.writeText(citationData.citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen || !libro) return null;

  const STYLES = [
    { id: 'apa', label: 'APA 7ma Edición' },
    { id: 'bibtex', label: 'BibTeX (LaTeX)' },
    { id: 'mla', label: 'MLA 9na Edición' },
    { id: 'chicago', label: 'Chicago Style' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Quote className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Generador de Cita Bibliográfica</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 uppercase tracking-wide">
                  Stateless
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-0.5 line-clamp-1">{libro.titulo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Style Selector Tabs */}
        <div className="px-6 pt-5 pb-2 bg-slate-50 border-b border-slate-200">
          <label className="text-xs font-semibold text-slate-500 mb-2 block uppercase tracking-wider">
            Selecciona el Formato:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {STYLES.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  style === s.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Citation Output Box */}
        <div className="p-6 space-y-4">
          <div className="relative">
            {loading ? (
              <div className="h-28 bg-slate-100 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-400">
                Generando cita en tiempo real...
              </div>
            ) : (
              <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl font-mono text-xs leading-relaxed border border-slate-800 shadow-inner break-words select-all whitespace-pre-wrap">
                {citationData?.citation || 'Cargando formato...'}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500 bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Esta función es <strong>Stateless</strong>: la referencia se formatea y calcula al vuelo bajo demanda sin guardar sesiones en el servidor.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <button
            onClick={handleCopy}
            disabled={loading || !citationData}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all cursor-pointer ${
              copied
                ? 'bg-emerald-600 shadow-emerald-200'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>¡Copiado al portapapeles!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Cita</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
