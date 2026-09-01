import React, { useState, useEffect } from 'react';
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
      showNotification(err.message || 'No se pudo conectar con el servidor backend.', 'error');
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
      showNotification(err.message || 'No se pudo conectar con el servidor backend.', 'error');
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
      showNotification(err.message || 'Error al cargar usuarios.', 'error');
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
      showNotification(err.message || 'Error al cargar préstamos.', 'error');
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
        showNotification('Autor registrado exitosamente.');
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
        showNotification('Autor actualizado correctamente.');
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
        showNotification('Autor y sus libros eliminados exitosamente.');
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
        showNotification('Libro creado exitosamente.');
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
        showNotification('Libro actualizado exitosamente.');
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
        showNotification('Libro eliminado correctamente.');
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
        showNotification(res.message || 'Importación completada con éxito.');
        await fetchLibros();
        await fetchAutores();
      }
    } catch (err) {
      showNotification(err.message || 'Error al importar archivo Excel.', 'error');
    }
  };

  const handleToggleDisponibilidad = async (libro) => {
    try {
      const nuevoEstado = !libro.disponible;
      const res = await api.updateLibro(libro.id, { disponible: nuevoEstado });
      if (res.success) {
        showNotification(`Libro marcado como ${nuevoEstado ? 'Disponible' : 'Prestado'}.`);
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
        showNotification('Usuario registrado exitosamente.');
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
        showNotification('Usuario eliminado correctamente.');
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
        showNotification('Préstamo registrado exitosamente.');
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
        showNotification('Devolución registrada correctamente.');
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
          <span>No se puede conectar con el backend Flask (http://127.0.0.1:5000). Asegúrate de tenerlo encendido con `python run.py`.</span>
          <button
            onClick={handleRefreshAll}
            className="ml-2 px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Reintentar
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grow">
        {currentTab === 'libros' && (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventario de Libros</h1>
                <p className="text-sm text-slate-500">Explora, busca y administra los libros de la biblioteca.</p>
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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Directorio de Autores</h1>
                <p className="text-sm text-slate-500">Gestiona los autores registrados y sus obras asociadas.</p>
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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registro de Usuarios (Stateful)</h1>
                <p className="text-sm text-slate-500">Gestiona los lectores registrados en la base de datos (Estudiantes, Profesores, General).</p>
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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Control de Préstamos (Stateful)</h1>
                <p className="text-sm text-slate-500">Presta libros a los usuarios registrados y gestiona el historial de devoluciones.</p>
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
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Herramientas Utilitarias (Stateless)</h1>
                <p className="text-sm text-slate-500">Cita libros en normas académicas o calcula multas y plazos en tiempo real sin guardar en BD.</p>
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
