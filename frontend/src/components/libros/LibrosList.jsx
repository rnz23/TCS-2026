import React, { useState, useMemo, useRef } from 'react';
import { 
  BookOpen, BookPlus, Search, Filter, Edit2, Trash2, 
  CheckCircle2, Clock, User, Calendar, Tag, FileSpreadsheet, 
  ArrowUpDown, ArrowUpAZ, ArrowDownAZ, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, X
} from 'lucide-react';
import LibroModal from './LibroModal';

export default function LibrosList({
  libros,
  autores,
  loading,
  onCrearLibro,
  onActualizarLibro,
  onEliminarLibro,
  onToggleDisponibilidad,
  onImportarExcel,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAutorId, setSelectedAutorId] = useState('');
  const [selectedDisponible, setSelectedDisponible] = useState('');
  const [sortBy, setSortBy] = useState('az'); // 'az' | 'za' | 'reciente' | 'autor'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [libroToEdit, setLibroToEdit] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  // Filtrado y ordenamiento en memoria ultra rápido
  const filteredAndSortedLibros = useMemo(() => {
    let result = [...libros];

    // 1. Busqueda por texto
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((l) => 
        (l.titulo && l.titulo.toLowerCase().includes(q)) ||
        (l.autor_nombre && l.autor_nombre.toLowerCase().includes(q)) ||
        (l.genero && l.genero.toLowerCase().includes(q))
      );
    }

    // 2. Filtro por autor
    if (selectedAutorId) {
      result = result.filter((l) => String(l.autor_id) === String(selectedAutorId));
    }

    // 3. Filtro por disponibilidad
    if (selectedDisponible !== '') {
      const isDisp = selectedDisponible === 'true';
      result = result.filter((l) => Boolean(l.disponible) === isDisp);
    }

    // 4. Ordenamiento
    if (sortBy === 'az') {
      result.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || '', 'es', { sensitivity: 'base' }));
    } else if (sortBy === 'za') {
      result.sort((a, b) => (b.titulo || '').localeCompare(a.titulo || '', 'es', { sensitivity: 'base' }));
    } else if (sortBy === 'autor') {
      result.sort((a, b) => (a.autor_nombre || '').localeCompare(b.autor_nombre || '', 'es', { sensitivity: 'base' }));
    } else if (sortBy === 'reciente') {
      result.sort((a, b) => b.id - a.id);
    }

    return result;
  }, [libros, searchTerm, selectedAutorId, selectedDisponible, sortBy]);

  // Paginación
  const totalItems = filteredAndSortedLibros.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  
  const paginatedLibros = useMemo(() => {
    const start = (validCurrentPage - 1) * itemsPerPage;
    return filteredAndSortedLibros.slice(start, start + itemsPerPage);
  }, [filteredAndSortedLibros, validCurrentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImporting(true);
      await onImportarExcel(file);
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedAutorId('');
    setSelectedDisponible('');
    setSortBy('az');
    setCurrentPage(1);
  };

  const handleOpenCreate = () => {
    setLibroToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (libro) => {
    setLibroToEdit(libro);
    setIsModalOpen(true);
  };

  const handleSave = async (data) => {
    if (libroToEdit) {
      await onActualizarLibro(libroToEdit.id, data);
    } else {
      await onCrearLibro(data);
    }
  };

  const handleDelete = (libro) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el libro "${libro.titulo}"?`)) {
      onEliminarLibro(libro.id);
    }
  };

  const hasFilters = searchTerm || selectedAutorId || selectedDisponible || sortBy !== 'az';

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* Control Bar: Search, Filters & Actions */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, autor o género..."
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

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm font-semibold rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Importar archivo Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{importing ? 'Importando...' : 'Importar Excel'}</span>
            </button>

            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-100 transition-all cursor-pointer"
            >
              <BookPlus className="w-4 h-4" />
              <span>Nuevo Libro</span>
            </button>
          </div>
        </div>

        {/* Filters & Sorting Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold text-slate-600 mr-1">Orden:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer"
              >
                <option value="az">Alfabético (A - Z)</option>
                <option value="za">Alfabético (Z - A)</option>
                <option value="autor">Por Autor (A - Z)</option>
                <option value="reciente">Más Recientes (ID)</option>
              </select>
            </div>

            {/* Author Filter */}
            <select
              value={selectedAutorId}
              onChange={(e) => { setSelectedAutorId(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer max-w-[200px] truncate"
            >
              <option value="">Todos los autores ({autores.length})</option>
              {autores.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre}</option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={selectedDisponible}
              onChange={(e) => { setSelectedDisponible(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
            >
              <option value="">Todos los estados</option>
              <option value="true">Solo disponibles</option>
              <option value="false">Solo prestados</option>
            </select>

            {hasFilters && (
              <button
                onClick={handleClearFilters}
                className="text-slate-500 hover:text-rose-600 underline cursor-pointer ml-1 font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Limpiar filtros
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
      ) : paginatedLibros.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No se encontraron libros</h3>
          <p className="text-sm text-slate-500 mt-1">
            {hasFilters ? 'Intenta modificar tus criterios de búsqueda o filtros.' : 'Comienza registrando o importando libros.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4 w-16 text-center">#</th>
                  <th className="py-3 px-4 min-w-[240px]">
                    <button 
                      onClick={() => setSortBy(sortBy === 'az' ? 'za' : 'az')}
                      className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer group"
                      title="Alternar orden A-Z / Z-A"
                    >
                      <span>Título de la Obra</span>
                      {sortBy === 'az' ? (
                        <ArrowUpAZ className="w-3.5 h-3.5 text-indigo-600" />
                      ) : sortBy === 'za' ? (
                        <ArrowDownAZ className="w-3.5 h-3.5 text-indigo-600" />
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-4 min-w-[180px]">
                    <button
                      onClick={() => setSortBy('autor')}
                      className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer"
                    >
                      <span>Autor</span>
                      {sortBy === 'autor' && <ArrowUpAZ className="w-3.5 h-3.5 text-indigo-600" />}
                    </button>
                  </th>
                  <th className="py-3 px-4">Género</th>
                  <th className="py-3 px-4 text-center">Año</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right pr-6">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLibros.map((libro, idx) => (
                  <tr 
                    key={libro.id}
                    className="hover:bg-indigo-50/40 transition-colors group"
                  >
                    {/* ID / Index */}
                    <td className="py-3 px-4 text-center text-xs text-slate-400 font-mono">
                      {(validCurrentPage - 1) * itemsPerPage + idx + 1}
                    </td>

                    {/* Title */}
                    <td className="py-3 px-4 font-semibold text-slate-800 group-hover:text-indigo-700">
                      {libro.titulo}
                    </td>

                    {/* Author */}
                    <td className="py-3 px-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {libro.autor_nombre || `Autor #${libro.autor_id}`}
                        </span>
                      </span>
                    </td>

                    {/* Genre */}
                    <td className="py-3 px-4">
                      {libro.genero ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          {libro.genero}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-xs">—</span>
                      )}
                    </td>

                    {/* Year */}
                    <td className="py-3 px-4 text-center text-xs text-slate-500">
                      {libro.anio_publicacion || '—'}
                    </td>

                    {/* Availability Interactive Badge */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleDisponibilidad(libro)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          libro.disponible
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Clic para cambiar estado"
                      >
                        {libro.disponible ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Disponible</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Prestado</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(libro)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Editar libro"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(libro)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar libro"
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

      {/* Book Modal */}
      <LibroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        libroToEdit={libroToEdit}
        autores={autores}
      />
    </div>
  );
}

