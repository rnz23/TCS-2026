import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import Navbar from './components/Navbar';
import Notification from './components/Notification';
import LibrosList from './components/libros/LibrosList';
import AutoresList from './components/autores/AutoresList';
import { BookOpen, Users, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState('libros'); // 'libros' | 'autores'
  const [libros, setLibros] = useState([]);
  const [autores, setAutores] = useState([]);
  const [loadingLibros, setLoadingLibros] = useState(false);
  const [loadingAutores, setLoadingAutores] = useState(false);
  const [notification, setNotification] = useState(null);
  const [backendOnline, setBackendOnline] = useState(true);

  // Author details modal state
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

  useEffect(() => {
    fetchAutores();
    fetchLibros();
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
        await fetchLibros(); // Refrescar por si cambió el nombre del autor en los libros
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
        await fetchAutores(); // Actualizar conteo de libros
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

  const handleRefreshAll = () => {
    fetchAutores();
    fetchLibros();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        booksCount={libros.length}
        authorsCount={autores.length}
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
        {currentTab === 'libros' ? (
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
        ) : (
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
      </main>

      {/* Toast Notification */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );
}

