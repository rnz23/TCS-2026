import React, { useState, useMemo } from 'react';
import { 
  Users, UserPlus, Search, Edit2, Trash2, BookOpen, 
  Globe, Calendar, ArrowUpDown, ArrowUpAZ, ArrowDownAZ, 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X 
} from 'lucide-react';
import AutorModal from './AutorModal';
import AutorDetalle from './AutorDetalle';

export default function AutoresList({
  autores,
  loading,
  onCrearAutor,
  onActualizarAutor,
  onEliminarAutor,
  onVerLibrosAutor,
  selectedAutorDetalle,
  isDetalleOpen,
  setIsDetalleOpen,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('az'); // 'az' | 'za' | 'reciente'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autorToEdit, setAutorToEdit] = useState(null);

  // Filtrado y ordenamiento en memoria ultra rápido
  const filteredAndSortedAutores = useMemo(() => {
    let result = [...autores];

    // 1. Busqueda
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((a) =>
        (a.nombre && a.nombre.toLowerCase().includes(q)) ||
        (a.nacionalidad && a.nacionalidad.toLowerCase().includes(q))
      );
    }

    // 2. Ordenamiento
    if (sortBy === 'az') {
      result.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' }));
    } else if (sortBy === 'za') {
      result.sort((a, b) => (b.nombre || '').localeCompare(a.nombre || '', 'es', { sensitivity: 'base' }));
    } else if (sortBy === 'reciente') {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [autores, searchTerm, sortBy]);

  // Paginación
  const totalItems = filteredAndSortedAutores.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAutores = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return filteredAndSortedAutores.slice(start, start + itemsPerPage);
  }, [filteredAndSortedAutores, validCurrentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenCreate = () => {
    setAutorToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (autor) => {
    setAutorToEdit(autor);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    if (autorToEdit) {
      await onActualizarAutor(autorToEdit.id, data);
    } else {
      await onCrearAutor(data);
    }
  };

  const handleDelete = (autor) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al autor "${autor.nombre}"? Sus libros asociados también serán eliminados.`)) {
      onEliminarAutor(autor.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar: Search & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar autor por nombre o nacionalidad..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setCurrentPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* New Author Button */}
          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Nuevo Autor</span>
          </button>
        </div>

        {/* Sorting & Counter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold text-slate-600 mr-1">Orden:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="az">Nombre (A - Z)</option>
                <option value="za">Nombre (Z - A)</option>
                <option value="reciente">Más Recientes (ID)</option>
              </select>
            </div>

            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setSortBy('az'); setCurrentPage(1); }}
                className="text-slate-500 hover:text-rose-600 underline cursor-pointer ml-1 font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Limpiar búsqueda
              </button>
            )}
          </div>

          {/* Records Counter & Page Size */}
          <div className="flex items-center gap-2 text-slate-500 ml-auto">
            <span>
              Mostrando <strong className="text-slate-700">{totalItems > 0 ? (validCurrentPage - 1) * itemsPerPage + 1 : 0}</strong>-
              <strong className="text-slate-700">{Math.min(validCurrentPage * itemsPerPage, totalItems)}</strong> de <strong className="text-slate-700">{totalItems}</strong>
            </span>
            <span className="text-slate-300">|</span>
            <select
              value={itemsPerPage}
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-700 cursor-pointer"
            >
              <option value={15}>15 por pág.</option>
              <option value={25}>25 por pág.</option>
              <option value={50}>50 por pág.</option>
              <option value={100}>100 por pág.</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mx-auto mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-10 bg-slate-100 rounded-lg w-full" />
            ))}
          </div>
        </div>
      ) : paginatedAutores.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No se encontraron autores</h3>
          <p className="text-sm text-slate-500 mt-1">
            {searchTerm ? 'Prueba con otro término de búsqueda.' : 'Agrega o importa autores para comenzar.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">#</th>
                  <th className="py-3 px-4 min-w-[220px]">
                    <button
                      onClick={() => setSortBy(sortBy === 'az' ? 'za' : 'az')}
                      className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer group"
                      title="Alternar orden A-Z / Z-A"
                    >
                      <span>Nombre del Autor</span>
                      {sortBy === 'az' ? (
                        <ArrowUpAZ className="w-3.5 h-3.5 text-indigo-600" />
                      ) : sortBy === 'za' ? (
                        <ArrowDownAZ className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 min-w-[140px]">Nacionalidad</th>
                  <th className="py-3 px-4 text-center min-w-[150px]">Obras</th>
                  <th className="py-3 px-4 text-center">Fecha Registro</th>
                  <th className="py-3 px-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedAutores.map((autor, idx) => (
                  <tr 
                    key={autor.id}
                    className="hover:bg-indigo-50/40 transition-colors group"
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">
                      {(validCurrentPage - 1) * itemsPerPage + idx + 1}
                    </td>

                    {/* Name with initial avatar */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-100">
                          {autor.nombre.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-800 group-hover:text-indigo-700">
                          {autor.nombre}
                        </span>
                      </div>
                    </td>

                    {/* Nationality */}
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {autor.nacionalidad ? (
                        <span className="inline-flex items-center gap-1">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{autor.nacionalidad}</span>
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Books view button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onVerLibrosAutor(autor.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                        title="Ver listado de libros de este autor"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Ver Libros</span>
                      </button>
                    </td>

                    {/* Registration Date */}
                    <td className="py-3 px-4 text-center text-xs text-slate-500">
                      {autor.fecha_creacion ? new Date(autor.fecha_creacion).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(autor)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar autor"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(autor)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar autor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 bg-slate-50/70 border-t border-slate-200 text-xs text-slate-600">
              <div>
                Página <strong className="text-slate-800">{validCurrentPage}</strong> de <strong className="text-slate-800">{totalPages}</strong>
              </div>

              <div className="flex items-center gap-1">
                {/* First Page */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={validCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Primera página"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </button>

                {/* Prev Page */}
                <button
                  onClick={() => handlePageChange(validCurrentPage - 1)}
                  disabled={validCurrentPage === 1}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>

                {/* Quick Page Jump Buttons */}
                <div className="flex items-center gap-1 px-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (validCurrentPage <= 3) {
                      pageNum = i + 1;
                    } else if (validCurrentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = validCurrentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-7 h-7 rounded-lg font-semibold text-xs transition-colors ${
                          validCurrentPage === pageNum
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Page */}
                <button
                  onClick={() => handlePageChange(validCurrentPage + 1)}
                  disabled={validCurrentPage === totalPages}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Last Page */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={validCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Última página"
                >
                  <ChevronsRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AutorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        autorToEdit={autorToEdit}
      />

      {/* View Author Details & Books Modal */}
      <AutorDetalle
        autor={selectedAutorDetalle}
        isOpen={isDetalleOpen}
        onClose={() => setIsDetalleOpen(false)}
      />
    </div>
  );
}

