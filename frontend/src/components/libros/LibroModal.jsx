import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, BookPlus, Save, Loader2 } from 'lucide-react';

export default function LibroModal({ isOpen, onClose, onSave, libroToEdit, autores = [] }) {
  const { t } = useTranslation();
  const [titulo, setTitulo] = useState('');
  const [autorId, setAutorId] = useState('');
  const [genero, setGenero] = useState('');
  const [anioPublicacion, setAnioPublicacion] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (libroToEdit) {
      setTitulo(libroToEdit.titulo || '');
      setAutorId(libroToEdit.autor_id ? String(libroToEdit.autor_id) : '');
      setGenero(libroToEdit.genero || '');
      setAnioPublicacion(libroToEdit.anio_publicacion ? String(libroToEdit.anio_publicacion) : '');
      setDisponible(libroToEdit.disponible !== undefined ? libroToEdit.disponible : true);
    } else {
      setTitulo('');
      setAutorId(autores.length > 0 ? String(autores[0].id) : '');
      setGenero('');
      setAnioPublicacion('');
      setDisponible(true);
    }
    setError('');
  }, [libroToEdit, isOpen, autores]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      setError(t('books.modal.err_title_required'));
      return;
    }
    if (!autorId) {
      setError(t('books.modal.err_author_required'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      await onSave({
        titulo: titulo.trim(),
        autor_id: parseInt(autorId, 10),
        genero: genero.trim() || null,
        anio_publicacion: anioPublicacion ? parseInt(anioPublicacion, 10) : null,
        disponible: Boolean(disponible),
      });
      onClose();
    } catch (err) {
      setError(err.message || t('books.modal.err_save'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              {libroToEdit ? <Save className="w-4 h-4" /> : <BookPlus className="w-4 h-4" />}
            </div>
            <h3 className="text-base font-semibold text-slate-800">
              {libroToEdit ? t('books.modal.edit_title') : t('books.modal.new_title')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              {t('books.modal.title_label')} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder={t('books.modal.title_placeholder')}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
              {t('books.modal.author_label')} <span className="text-rose-500">*</span>
            </label>
            {autores.length === 0 ? (
              <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                {t('books.modal.no_authors_warning')}
              </p>
            ) : (
              <select
                value={autorId}
                onChange={(e) => setAutorId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              >
                <option value="" disabled>{t('books.modal.select_author')}</option>
                {autores.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre} {a.nacionalidad ? `(${a.nacionalidad})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                {t('books.modal.genre_label')}
              </label>
              <input
                type="text"
                placeholder={t('books.modal.genre_placeholder')}
                value={genero}
                onChange={(e) => setGenero(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                {t('books.modal.year_label')}
              </label>
              <input
                type="number"
                placeholder={t('books.modal.year_placeholder')}
                value={anioPublicacion}
                onChange={(e) => setAnioPublicacion(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Availability Switch */}
          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={disponible}
                onChange={(e) => setDisponible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
              <span className="text-sm font-medium text-slate-700">
                {disponible ? t('books.modal.available_label') : t('books.modal.borrowed_label')}
              </span>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || autores.length === 0}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t('common.saving')}</span>
                </>
              ) : (
                <span>{libroToEdit ? t('books.modal.btn_update') : t('books.modal.btn_create')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
