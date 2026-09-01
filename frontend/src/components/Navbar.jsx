import React from 'react';
import { BookOpen, Users, UserCheck, BookmarkCheck, Wrench, Library } from 'lucide-react';

export default function Navbar({ currentTab, setCurrentTab, booksCount, authorsCount, usersCount, loansCount }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center h-auto sm:h-16 py-2 sm:py-0 gap-3">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100">
              <Library className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-violet-700 bg-clip-text text-transparent">
                  miBiblioteca
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">Gestión de libros, préstamos y utilidades stateless</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex flex-wrap items-center gap-1 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/70">
            <button
              onClick={() => setCurrentTab('libros')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                currentTab === 'libros'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Libros</span>
              {booksCount !== undefined && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  currentTab === 'libros' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {booksCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('autores')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                currentTab === 'autores'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Autores</span>
              {authorsCount !== undefined && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  currentTab === 'autores' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {authorsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('usuarios')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                currentTab === 'usuarios'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Usuarios</span>
              {usersCount !== undefined && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  currentTab === 'usuarios' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {usersCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('prestamos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                currentTab === 'prestamos'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <BookmarkCheck className="w-4 h-4 text-blue-600" />
              <span>Préstamos</span>
              {loansCount !== undefined && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded-full ${
                  currentTab === 'prestamos' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/70 text-slate-600'
                }`}>
                  {loansCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('herramientas')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer ${
                currentTab === 'herramientas'
                  ? 'bg-white text-indigo-700 shadow-sm shadow-slate-200 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-500" />
              <span>Herramientas</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-700 font-semibold">
                Stateless
              </span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
