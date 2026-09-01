import React from 'react';
import { X, Book, User, Globe, Calendar, CheckCircle, Clock } from 'lucide-react';

export default function AutorDetalle({ autor, isOpen, onClose, onSelectLibro }) {
  if (!isOpen || !autor) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-lg">
              {autor.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">{autor.nombre}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {autor.nacionalidad && (
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {autor.nacionalidad}
                  </span>
                )}
                {autor.fecha_creacion && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Registrado:{' '}
                    {new Date(autor.fecha_creacion).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content: List of books */}
        <div className="p-6 overflow-y-auto space-y-4 grow">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Book className="w-4 h-4 text-indigo-500" />
              Libros Publicados ({autor.libros ? autor.libros.length : 0})
            </h4>
          </div>

          {(!autor.libros || autor.libros.length === 0) ? (
            <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Book className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No hay libros registrados para este autor.</p>
              <p className="text-xs text-slate-400 mt-1">Crea un libro y asígnalo a este autor en la pestaña de Libros.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {autor.libros.map((libro) => (
                <div
                  key={libro.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 rounded-xl transition-all"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">{libro.titulo}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {libro.genero && (
                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                          {libro.genero}
                        </span>
                      )}
                      {libro.anio_publicacion && <span>Año: {libro.anio_publicacion}</span>}
                    </div>
                  </div>

                  <div>
                    {libro.disponible ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3" /> Disponible
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3 h-3" /> Prestado
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
