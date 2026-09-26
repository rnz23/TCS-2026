import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, HandHelping, User, Calendar, BookOpen, AlertCircle, Phone, Mail, FileText } from 'lucide-react';

export default function PrestamoModal({ isOpen, onClose, onSave, preselectedLibro, librosDisponibles }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    libro_id: '',
    lector_nombre: '',
    lector_email: '',
    lector_telefono: '',
    dias_prestamo: 14,
    notas: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        libro_id: preselectedLibro ? preselectedLibro.id : (librosDisponibles?.[0]?.id || ''),
        lector_nombre: '',
        lector_email: '',
        lector_telefono: '',
        dias_prestamo: 14,
        notas: '',
      });
      setErrors({});
    }
  }, [isOpen, preselectedLibro, librosDisponibles]);

  const validate = () => {
    const errs = {};
    if (!formData.libro_id) errs.libro_id = t('loans.modal.err_select_both');
    if (!formData.lector_nombre.trim()) errs.lector_nombre = t('users.modal.name_label');
    if (formData.dias_prestamo < 1 || formData.dias_prestamo > 90) {
      errs.dias_prestamo = '1-90';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      await onSave({
        ...formData,
        libro_id: Number(formData.libro_id),
        dias_prestamo: Number(formData.dias_prestamo),
      });
      onClose();
    } catch (err) {
      setErrors((prev) => ({ ...prev, submit: err.message }));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <HandHelping className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{t('loans.modal.title')}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 uppercase tracking-wide">
                  Stateful
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">{t('app.loans_subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.submit && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errors.submit}</span>
            </div>
          )}

          {/* Libro Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Libro a Prestar *</span>
            </label>
            {preselectedLibro ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium">
                <strong>#{preselectedLibro.id}</strong> - {preselectedLibro.titulo} ({preselectedLibro.autor_nombre || 'Anónimo'})
              </div>
            ) : (
              <select
                value={formData.libro_id}
                onChange={(e) => setFormData({ ...formData, libro_id: e.target.value })}
                className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all ${
                  errors.libro_id ? 'border-rose-400' : 'border-slate-200'
                }`}
              >
                <option value="">Selecciona un libro disponible...</option>
                {librosDisponibles?.map((l) => (
                  <option key={l.id} value={l.id}>
                    #{l.id} - {l.titulo} ({l.autor_nombre || 'Anónimo'})
                  </option>
                ))}
              </select>
            )}
            {errors.libro_id && <p className="text-[11px] text-rose-500 mt-1">{errors.libro_id}</p>}
          </div>

          {/* Lector Nombre */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-indigo-500" />
              <span>Nombre Completo del Lector *</span>
            </label>
            <input
              type="text"
              placeholder="Ej. Juan Pérez Gómez"
              value={formData.lector_nombre}
              onChange={(e) => setFormData({ ...formData, lector_nombre: e.target.value })}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all ${
                errors.lector_nombre ? 'border-rose-400' : 'border-slate-200'
              }`}
            />
            {errors.lector_nombre && <p className="text-[11px] text-rose-500 mt-1">{errors.lector_nombre}</p>}
          </div>

          {/* Contact Information (Email & Telefono) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Correo Electrónico</span>
              </label>
              <input
                type="email"
                placeholder="juan@correo.com"
                value={formData.lector_email}
                onChange={(e) => setFormData({ ...formData, lector_email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>Teléfono / WhatsApp</span>
              </label>
              <input
                type="tel"
                placeholder="+51 987 654 321"
                value={formData.lector_telefono}
                onChange={(e) => setFormData({ ...formData, lector_telefono: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Días de Préstamo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Plazo de Préstamo</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[7, 14, 21, 30].map((dias) => (
                <button
                  key={dias}
                  type="button"
                  onClick={() => setFormData({ ...formData, dias_prestamo: dias })}
                  className={`py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    formData.dias_prestamo === dias
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {dias} días
                </button>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Notas o Estado de Entrega (Opcional)</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ej. Tapa ligeramente desgastada, incluye marca páginas..."
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 transition-all cursor-pointer disabled:opacity-50"
            >
              <HandHelping className="w-4 h-4" />
              <span>{loading ? t('loans.modal.btn_processing') : t('loans.modal.btn_confirm')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
