import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { UserCheck, Plus, Search, Trash2, Mail, Phone, GraduationCap, Briefcase, User, Calendar } from 'lucide-react';
import UsuarioModal from './UsuarioModal';

/**
 * Componente principal para el listado, filtrado y gestión de usuarios.
 * Refactorizado y simplificado: el formulario modal se extrajo a UsuarioModal.
 */
export default function UsuariosList({ usuarios, loading, onCrearUsuario, onEliminarUsuario, onFiltrar }) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'Profesor':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <Briefcase className="w-3 h-3" /> {t('users.type_professor')}
          </span>
        );
      case 'Estudiante':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <GraduationCap className="w-3 h-3" /> {t('users.type_student')}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <User className="w-3 h-3" /> {t('users.type_general')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Barra de Filtros y Acción */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3 w-full sm:w-auto grow">
          <div className="relative grow sm:max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder={t('users.search_placeholder')}
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={tipoFilter}
            onChange={handleTipoChange}
            className="py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-700 cursor-pointer"
          >
            <option value="">{t('users.all_types')}</option>
            <option value="Estudiante">{t('users.type_student')}</option>
            <option value="Profesor">{t('users.type_professor')}</option>
            <option value="General">{t('users.type_general')}</option>
          </select>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> {t('users.register_user')}
        </button>
      </div>

      {/* Grid de Usuarios */}
      {loading ? (
        <div className="py-12 text-center text-slate-500">{t('users.loading')}</div>
      ) : usuarios.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-xl border border-slate-200">
          <UserCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">{t('users.empty_title')}</p>
          <p className="text-xs text-slate-400 mt-1">{t('users.empty_desc')}</p>
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
                    <span>{t('users.registered')} {usuario.fecha_registro ? usuario.fecha_registro.split('T')[0] : 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => onEliminarUsuario(usuario.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title={t('users.delete_tooltip')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Registro con Validación Regex */}
      <UsuarioModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onCrearUsuario}
      />
    </div>
  );
}
