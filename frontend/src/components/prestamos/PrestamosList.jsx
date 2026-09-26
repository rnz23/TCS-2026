import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BookmarkCheck, Plus, CheckCircle, Clock, BookOpen, User, Calendar, AlertTriangle } from 'lucide-react';

export default function PrestamosList({
  prestamos,
  libros,
  usuarios,
  loading,
  onCrearPrestamo,
  onDevolverPrestamo,
  onFiltrar
}) {
  const { t } = useTranslation();
  const [activosFilter, setActivosFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ libro_id: '', usuario_id: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Filtrar libros disponibles únicamente para el selector del nuevo préstamo
  const librosDisponibles = libros.filter((l) => l.disponible);

  const handleActivosFilterToggle = () => {
    const nextVal = !activosFilter;
    setActivosFilter(nextVal);
    onFiltrar({ activos: nextVal });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.libro_id || !formData.usuario_id) {
      setError(t('loans.modal.err_select_both'));
      return;
    }
    try {
      setSubmitting(true);
      await onCrearPrestamo({
        libro_id: parseInt(formData.libro_id, 10),
        usuario_id: parseInt(formData.usuario_id, 10)
      });
      setIsModalOpen(false);
      setFormData({ libro_id: '', usuario_id: '' });
    } catch (err) {
      setError(err.message || t('loans.modal.err_create'));
    } finally {
      setSubmitting(false);
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'DEVUELTO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> {t('loans.status_returned')}
          </span>
        );
      case 'VENCIDO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3" /> {t('loans.status_overdue')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" /> {t('loans.status_active')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={activosFilter}
              onChange={handleActivosFilterToggle}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
            />
            <span>{t('loans.filter_active')}</span>
          </label>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t('loans.register_loan')}
        </button>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">{t('loans.loading')}</div>
      ) : prestamos.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
          <BookmarkCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">{t('loans.empty_title')}</p>
          <p className="text-xs text-slate-400 mt-1">{t('loans.empty_desc')}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">{t('loans.col_id')}</th>
                <th className="px-4 py-3">{t('loans.col_book')}</th>
                <th className="px-4 py-3">{t('loans.col_user')}</th>
                <th className="px-4 py-3">{t('loans.col_loan_date')}</th>
                <th className="px-4 py-3">{t('loans.col_expected_return')}</th>
                <th className="px-4 py-3">{t('loans.col_status')}</th>
                <th className="px-4 py-3 text-right">{t('loans.col_action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prestamos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-500">#{p.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{p.libro_titulo || `${t('loans.col_book')} #${p.libro_id}`}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 block">{p.usuario_nombre || `${t('loans.col_user')} #${p.usuario_id}`}</span>
                        {p.usuario_tipo && (
                          <span className="text-[11px] text-slate-400 block">{p.usuario_tipo}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {p.fecha_prestamo ? p.fecha_prestamo.split('T')[0] : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-800">
                    {p.fecha_devolucion_esperada ? p.fecha_devolucion_esperada.split('T')[0] : 'N/A'}
                  </td>
                  <td className="px-4 py-3">{getEstadoBadge(p.estado)}</td>
                  <td className="px-4 py-3 text-right">
                    {p.estado !== 'DEVUELTO' ? (
                      <button
                        onClick={() => onDevolverPrestamo(p.id)}
                        className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-lg transition-colors border border-emerald-200 cursor-pointer"
                      >
                        {t('loans.btn_mark_return')}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">{t('loans.status_completed')}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nuevo Préstamo */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">{t('loans.modal.title')}</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('loans.modal.select_book_label')}</label>
                <select
                  required
                  value={formData.libro_id}
                  onChange={(e) => setFormData({ ...formData, libro_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="">{t('loans.modal.choose_book')}</option>
                  {librosDisponibles.map((libro) => (
                    <option key={libro.id} value={libro.id}>
                      {libro.titulo} ({libro.autor_nombre || t('common.anonymous')})
                    </option>
                  ))}
                </select>
                {librosDisponibles.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">{t('loans.modal.no_books_alert')}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">{t('loans.modal.select_user_label')}</label>
                <select
                  required
                  value={formData.usuario_id}
                  onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
                >
                  <option value="">{t('loans.modal.choose_user')}</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} ({usuario.tipo_usuario}) - {usuario.email}
                    </option>
                  ))}
                </select>
                {usuarios.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">{t('loans.modal.no_users_alert')}</p>
                )}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 space-y-1">
                <p className="font-semibold">{t('loans.modal.rules_title')}</p>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  <li>{t('loans.modal.rule_student')}</li>
                  <li>{t('loans.modal.rule_professor')}</li>
                  <li>{t('loans.modal.rule_general')}</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting || librosDisponibles.length === 0 || usuarios.length === 0}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {submitting ? t('loans.modal.btn_processing') : t('loans.modal.btn_confirm')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

