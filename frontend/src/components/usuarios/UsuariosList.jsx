import React, { useState } from 'react';
import { UserCheck, Plus, Search, Trash2, Mail, Phone, GraduationCap, Briefcase, User, Calendar } from 'lucide-react';

export default function UsuariosList({ usuarios, loading, onCrearUsuario, onEliminarUsuario, onFiltrar }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    tipo_usuario: 'Estudiante',
    telefono: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    onFiltrar({ search: val, tipo: tipoFilter });
  };

  const handleTipoChange = (e) => {
    const val = e.target.value;
    setTipoFilter(val);
    onFiltrar({ search: searchTerm, tipo: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSubmitting(true);
      await onCrearUsuario(formData);
      setIsModalOpen(false);
      setFormData({ nombre: '', email: '', tipo_usuario: 'Estudiante', telefono: '' });
    } catch (err) {
      setError(err.message || 'Error al crear usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'Profesor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Briefcase className="w-3 h-3" /> Profesor
          </span>
        );
      case 'Estudiante':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <GraduationCap className="w-3 h-3" /> Estudiante
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <User className="w-3 h-3" /> General
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 w-full sm:w-auto grow">
          <div className="relative grow sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar usuario por nombre..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={tipoFilter}
            onChange={handleTipoChange}
            className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="">Todos los tipos</option>
            <option value="Estudiante">Estudiante</option>
            <option value="Profesor">Profesor</option>
            <option value="General">General</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Registrar Usuario
        </button>
      </div>

      {/* Users Grid / List */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">Cargando usuarios...</div>
      ) : usuarios.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
          <UserCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No se encontraron usuarios registrados.</p>
          <p className="text-xs text-slate-400 mt-1">Registra tu primer usuario para gestionar préstamos de libros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuarios.map((usuario) => (
            <div key={usuario.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-100">
                    {usuario.nombre.charAt(0).toUpperCase()}
                  </div>
                  {getTipoBadge(usuario.tipo_usuario)}
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">{usuario.nombre}</h3>
                
                <div className="space-y-1.5 text-xs text-slate-600 mt-3">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{usuario.email}</span>
                  </div>
                  {usuario.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{usuario.telefono}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Registro: {usuario.fecha_registro ? usuario.fecha_registro.split('T')[0] : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => onEliminarUsuario(usuario.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Eliminar usuario"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Registrar Nuevo Usuario</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ana María Martínez"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="ana.martinez@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tipo de Usuario *</label>
                <select
                  value={formData.tipo_usuario}
                  onChange={(e) => setFormData({ ...formData, tipo_usuario: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="Estudiante">Estudiante (Préstamo: 7 días)</option>
                  <option value="Profesor">Profesor (Préstamo: 14 días)</option>
                  <option value="General">General (Préstamo: 5 días)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej: 987654321"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
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
                  disabled={submitting}
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {submitting ? 'Guardando...' : 'Guardar Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

