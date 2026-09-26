import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from './services/api';
import Navbar from './components/Navbar';
import Notification from './components/Notification';
import LibrosList from './components/libros/LibrosList';
import AutoresList from './components/autores/AutoresList';
import UsuariosList from './components/usuarios/UsuariosList';
import PrestamosList from './components/prestamos/PrestamosList';
import ToolsView from './components/tools/ToolsView';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const { t } = useTranslation();
  const [currentTab, setCurrentTab] = useState('libros'); // 'libros' | 'autores' | 'usuarios' | 'prestamos' | 'herramientas'
  const [libros, setLibros] = useState([]);
  const [autores, setAutores] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [prestamos, setPrestamos] = useState([]);

  const [loadingLibros, setLoadingLibros] = useState(false);
  const [loadingAutores, setLoadingAutores] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingPrestamos, setLoadingPrestamos] = useState(false);

  const [notification, setNotification] = useState(null);
  const [backendOnline, setBackendOnline] = useState(true);

  // Modal detalles de autor
  const [selectedAutorDetalle, setSelectedAutorDetalle] = useState(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  // --- CARGAR DATOS ---
  const fetchAutores = async () => {
    try {
      setLoadingAutores(true);
      const res = await api.getAutores();
      if (res.success) {
        setAutores(res.data || []);
        setBackendOnline(true);
      }
    } catch (err) {
      console.error("Error al cargar autores:", err);
      setBackendOnline(false);
      showNotification(err.message || t('app.notification_backend_error'), 'error');
    } finally {
      setLoadingAutores(false);
    }
  };

  const fetchLibros = async (filters = {}) => {
    try {
      setLoadingLibros(true);
      const res = await api.getLibros(filters);
      if (res.success) {
        setLibros(res.data || []);
        setBackendOnline(true);
      }
    } catch (err) {
      console.error("Error al cargar libros:", err);
      setBackendOnline(false);
      showNotification(err.message || t('app.notification_backend_error'), 'error');
    } finally {
      setLoadingLibros(false);
    }
  };

  const fetchUsuarios = async (filters = {}) => {
    try {
      setLoadingUsuarios(true);
      const res = await api.getUsuarios(filters);
      if (res.success) {
        setUsuarios(res.data || []);
        setBackendOnline(true);
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
      showNotification(err.message || t('app.notification_users_error'), 'error');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const fetchPrestamos = async (filters = {}) => {
    try {
      setLoadingPrestamos(true);
      const res = await api.getPrestamos(filters);
      if (res.success) {
        setPrestamos(res.data || []);
        setBackendOnline(true);
      }
    } catch (err) {
      console.error("Error al cargar préstamos:", err);
      showNotification(err.message || t('app.notification_loans_error'), 'error');
    } finally {
      setLoadingPrestamos(false);
    }
  };

  useEffect(() => {
    fetchAutores();
    fetchLibros();
    fetchUsuarios();
    fetchPrestamos();
  }, []);

  // --- ACCIONES AUTORES ---
  const handleCrearAutor = async (data) => {
    try {
      const res = await api.createAutor(data);
      if (res.success) {
        showNotification(t('app.notification_author_created'));
        await fetchAutores();
      }
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const handleActualizarAutor = async (id, data) => {
    try {
      const res = await api.updateAutor(id, data);
      if (res.success) {
        showNotification(t('app.notification_author_updated'));
        await fetchAutores();
        await fetchLibros();
      }
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const handleEliminarAutor = async (id) => {
    try {
      const res = await api.deleteAutor(id);
      if (res.success) {
        showNotification(t('app.notification_author_deleted'));
        await fetchAutores();
        await fetchLibros();
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleVerLibrosAutor = async (autorId) => {
    try {
      const res = await api.getAutorById(autorId);
      if (res.success) {
        setSelectedAutorDetalle(res.data);
        setIsDetalleOpen(true);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // --- ACCIONES LIBROS ---
  const handleCrearLibro = async (data) => {
    try {
      const res = await api.createLibro(data);
      if (res.success) {
        showNotification(t('app.notification_book_created'));
        await fetchLibros();
        await fetchAutores();
      }
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const handleActualizarLibro = async (id, data) => {
    try {
      const res = await api.updateLibro(id, data);
      if (res.success) {
        showNotification(t('app.notification_book_updated'));
        await fetchLibros();
      }
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const handleEliminarLibro = async (id) => {
    try {
      const res = await api.deleteLibro(id);
      if (res.success) {
        showNotification(t('app.notification_book_deleted'));
        await fetchLibros();
        await fetchAutores();
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleImportarExcel = async (file) => {
    try {
      const res = await api.importExcel(file);
      if (res.success) {
        showNotification(res.message || t('app.notification_excel_success'));
        await fetchLibros();
        await fetchAutores();
      }
    } catch (err) {
      showNotification(err.message || t('app.notification_excel_error'), 'error');
    }
  };

  const handleToggleDisponibilidad = async (libro) => {
    try {
      const nuevoEstado = !libro.disponible;
      const res = await api.updateLibro(libro.id, { disponible: nuevoEstado });
      if (res.success) {
        showNotification(t('app.notification_book_marked', {
          status: nuevoEstado ? t('common.available') : t('common.borrowed')
        }));
        setLibros((prev) =>
          prev.map((l) => (l.id === libro.id ? { ...l, disponible: nuevoEstado } : l))
        );
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // --- ACCIONES USUARIOS (Stateful) ---
  const handleCrearUsuario = async (data) => {
    try {
      const res = await api.createUsuario(data);
      if (res.success) {
        showNotification(t('app.notification_user_created'));
        await fetchUsuarios();
      }
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const handleEliminarUsuario = async (id) => {
    try {
      const res = await api.deleteUsuario(id);
      if (res.success) {
        showNotification(t('app.notification_user_deleted'));
        await fetchUsuarios();
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // --- ACCIONES PRÉSTAMOS (Stateful) ---
  const handleCrearPrestamo = async (data) => {
    try {
      const res = await api.createPrestamo(data);
      if (res.success) {
        showNotification(t('app.notification_loan_created'));
        await fetchPrestamos();
        await fetchLibros(); // Actualizar estado disponible de libros
      }
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const handleDevolverPrestamo = async (id) => {
    try {
      const res = await api.devolverPrestamo(id);
      if (res.success) {
        showNotification(t('app.notification_return_created'));
        await fetchPrestamos();
        await fetchLibros(); // Restaurar estado disponible del libro
      }
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleRefreshAll = () => {
    fetchAutores();
    fetchLibros();
    fetchUsuarios();
    fetchPrestamos();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        booksCount={libros.length}
        authorsCount={autores.length}
        usersCount={usuarios.length}
        loansCount={prestamos.length}
      />

      {/* Backend connection alert if offline */}
      {!backendOnline && (
        <div className="bg-amber-500 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{t('app.offline_warning')}</span>
          <button
            onClick={handleRefreshAll}
            className="ml-2 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> {t('app.offline_retry')}
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grow">
        {currentTab === 'libros' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('app.books_title')}</h1>
                <p className="text-sm text-slate-500">{t('app.books_subtitle')}</p>
              </div>
            </div>

            <LibrosList
              libros={libros}
              autores={autores}
              loading={loadingLibros}
              onCrearLibro={handleCrearLibro}
              onActualizarLibro={handleActualizarLibro}
              onEliminarLibro={handleEliminarLibro}
              onToggleDisponibilidad={handleToggleDisponibilidad}
              onFiltrar={fetchLibros}
              onImportarExcel={handleImportarExcel}
            />
          </section>
        )}

        {currentTab === 'autores' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('app.authors_title')}</h1>
                <p className="text-sm text-slate-500">{t('app.authors_subtitle')}</p>
              </div>
            </div>

            <AutoresList
              autores={autores}
              loading={loadingAutores}
              onCrearAutor={handleCrearAutor}
              onActualizarAutor={handleActualizarAutor}
              onEliminarAutor={handleEliminarAutor}
              onVerLibrosAutor={handleVerLibrosAutor}
              selectedAutorDetalle={selectedAutorDetalle}
              isDetalleOpen={isDetalleOpen}
              setIsDetalleOpen={setIsDetalleOpen}
            />
          </section>
        )}

        {currentTab === 'usuarios' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('app.users_title')}</h1>
                <p className="text-sm text-slate-500">{t('app.users_subtitle')}</p>
              </div>
            </div>

            <UsuariosList
              usuarios={usuarios}
              loading={loadingUsuarios}
              onCrearUsuario={handleCrearUsuario}
              onEliminarUsuario={handleEliminarUsuario}
              onFiltrar={fetchUsuarios}
            />
          </section>
        )}

        {currentTab === 'prestamos' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('app.loans_title')}</h1>
                <p className="text-sm text-slate-500">{t('app.loans_subtitle')}</p>
              </div>
            </div>

            <PrestamosList
              prestamos={prestamos}
              libros={libros}
              usuarios={usuarios}
              loading={loadingPrestamos}
              onCrearPrestamo={handleCrearPrestamo}
              onDevolverPrestamo={handleDevolverPrestamo}
              onFiltrar={fetchPrestamos}
            />
          </section>
        )}

        {currentTab === 'herramientas' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t('app.tools_title')}</h1>
                <p className="text-sm text-slate-500">{t('app.tools_subtitle')}</p>
              </div>
            </div>

            <ToolsView showNotification={showNotification} />
          </section>
        )}
      </main>

      {/* Toast Notification */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}
