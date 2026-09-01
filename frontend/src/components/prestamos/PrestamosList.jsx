import React, { useState } from 'react';
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
      setError('Por favor selecciona un libro y un usuario.');
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
      setError(err.message || 'Error al registrar préstamo.');
    } finally {
      setSubmitting(false);
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'DEVUELTO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            <CheckCircle className="w-3 h-3 text-emerald-500" /> Devuelto
          </span>
        );
      case 'VENCIDO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <AlertTriangle className="w-3 h-3" /> Vencido
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3" /> En Préstamo
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
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>Ver solo préstamos activos/vencidos</span>
          </label>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Registrar Préstamo
        </button>
      </div>

      {/* Table / List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Cargando préstamos...</div>
      ) : prestamos.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
          <BookmarkCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No hay registros de préstamos disponibles.</p>
          <p className="text-xs text-slate-400 mt-1">Registra un nuevo préstamo para prestar un libro a un lector.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-700 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Libro Prestado</th>
                <th className="px-4 py-3">Usuario / Lector</th>
                <th className="px-4 py-3">Fecha Préstamo</th>
                <th className="px-4 py-3">Devolución Esperada</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {prestamos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-500">#{p.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span>{p.libro_titulo || `Libro #${p.libro_id}`}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800 block">{p.usuario_nombre || `Usuario #${p.usuario_id}`}</span>
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
                        Marcar Devolución
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Completado</span>
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
            <h2 className="text-lg font-bold text-slate-900 mb-4">Registrar Préstamo de Libro</h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seleccionar Libro Disponible *</label>
                <select
                  required
                  value={formData.libro_id}
                  onChange={(e) => setFormData({ ...formData, libro_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Elige un libro --</option>
                  {librosDisponibles.map((libro) => (
                    <option key={libro.id} value={libro.id}>
                      {libro.titulo} ({libro.autor_nombre || 'Sin Autor'})
                    </option>
                  ))}
                </select>
                {librosDisponibles.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">No hay libros marcados como disponibles en este momento.</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Seleccionar Usuario Lector *</label>
                <select
                  required
                  value={formData.usuario_id}
                  onChange={(e) => setFormData({ ...formData, usuario_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">-- Elige un usuario --</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {usuario.nombre} ({usuario.tipo_usuario}) - {usuario.email}
                    </option>
                  ))}
                </select>
                {usuarios.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">Debes registrar usuarios primero en la pestaña "Usuarios".</p>
                )}
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-800 space-y-1">
                <p className="font-semibold">Reglas de devolución por perfil:</p>
                <ul className="list-disc list-inside text-[11px] space-y-0.5">
                  <li><strong>Estudiante:</strong> 7 días límite</li>
                  <li><strong>Profesor:</strong> 14 días límite</li>
                  <li><strong>General:</strong> 5 días límite</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || librosDisponibles.length === 0 || usuarios.length === 0}
                  className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {submitting ? 'Procesando...' : 'Confirmar Préstamo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

