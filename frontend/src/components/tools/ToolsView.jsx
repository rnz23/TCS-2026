import React, { useState } from 'react';
import { Wrench, Quote, Calculator, Copy, Check, Sparkles, Clock, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function ToolsView({ showNotification }) {
  const [activeSubTab, setActiveSubTab] = useState('citas'); // 'citas' | 'calculadora'

  // --- Citas State ---
  const [citaData, setCitaData] = useState({
    titulo: 'Cien años de soledad',
    autor: 'Gabriel García Márquez',
    anio: '1967',
    genero: 'Novela',
    formato: 'APA7'
  });
  const [citaResultado, setCitaResultado] = useState(null);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // --- Calculadora State ---
  const [calcData, setCalcData] = useState({
    tipo_usuario: 'Estudiante',
    dias_retraso: 3
  });
  const [calcResultado, setCalcResultado] = useState(null);
  const [loadingCalc, setLoadingCalc] = useState(false);

  // Generar cita
  const handleGenerarCita = async (e) => {
    e.preventDefault();
    try {
      setLoadingCitas(true);
      const res = await api.generarCita(citaData);
      if (res.success) {
        setCitaResultado(res.data);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoadingCitas(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showNotification('Cita copiada al portapapeles.');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Calcular multa
  const handleCalcularMulta = async (e) => {
    e.preventDefault();
    try {
      setLoadingCalc(true);
      const res = await api.calcularMulta(calcData);
      if (res.success) {
        setCalcResultado(res.data);
      }
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoadingCalc(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stateless Info Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 text-slate-800">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-sm font-bold text-amber-950">Módulo de Herramientas Stateless (Sin Estado)</h2>
          <p className="text-xs text-amber-900/80 mt-0.5">
            Estas herramientas ejecutan algoritmos puros en tiempo de respuesta. Procesan la entrada inmediatamente y calculan la salida <strong>sin consultar ni guardar nada en la base de datos MySQL</strong>.
          </p>
        </div>
      </div>

      {/* Subtabs Selector */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('citas')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'citas'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Quote className="w-4 h-4" /> Formateador de Citas Bibliográficas
        </button>

        <button
          onClick={() => setActiveSubTab('calculadora')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer ${
            activeSubTab === 'calculadora'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" /> Calculadora de Multas y Límite de Fechas
        </button>
      </div>

      {/* 1. CITAS BIBLIOGRÁFICAS (STATELESS) */}
      {activeSubTab === 'citas' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Quote className="w-5 h-5 text-amber-500" /> Datos de la Obra
            </h3>

            <form onSubmit={handleGenerarCita} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título de la Obra *</label>
                <input
                  type="text"
                  required
                  value={citaData.titulo}
                  onChange={(e) => setCitaData({ ...citaData, titulo: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre del Autor *</label>
                <input
                  type="text"
                  required
                  value={citaData.autor}
                  onChange={(e) => setCitaData({ ...citaData, autor: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Año de Publicación</label>
                  <input
                    type="text"
                    value={citaData.anio}
                    onChange={(e) => setCitaData({ ...citaData, anio: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Género / Categoría</label>
                  <input
                    type="text"
                    value={citaData.genero}
                    onChange={(e) => setCitaData({ ...citaData, genero: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Formato Académico Principal</label>
                <select
                  value={citaData.formato}
                  onChange={(e) => setCitaData({ ...citaData, formato: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="APA7">APA 7ª Edición</option>
                  <option value="IEEE">IEEE</option>
                  <option value="MLA">MLA 9ª Edición</option>
                  <option value="CHICAGO">Chicago Manual of Style</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loadingCitas}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {loadingCitas ? 'Procesando algoritmo...' : 'Generar Citas Bibliográficas'}
              </button>
            </form>
          </div>

          {/* Resultado Citas */}
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Resultado Formateado
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Stateless Response
                </span>
              </div>

              {citaResultado ? (
                <div className="space-y-4">
                  {Object.entries(citaResultado.todas_las_citas).map(([formatoKey, textoCita]) => (
                    <div key={formatoKey} className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 space-y-1">
                      <div className="flex justify-between items-center text-xs text-amber-300 font-mono font-bold">
                        <span>{formatoKey}</span>
                        <button
                          onClick={() => copyToClipboard(textoCita, formatoKey)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedKey === formatoKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === formatoKey ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                      <p className="text-sm text-slate-200 font-serif italic">{textoCita}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  Ingresa los datos de la obra y haz clic en "Generar Citas Bibliográficas" para ver las citas generadas al vuelo.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. CALCULADORA DE MULTAS Y FECHAS (STATELESS) */}
      {activeSubTab === 'calculadora' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulario */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-500" /> Parámetros del Cálculo
            </h3>

            <form onSubmit={handleCalcularMulta} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Perfil del Lector *</label>
                <select
                  value={calcData.tipo_usuario}
                  onChange={(e) => setCalcData({ ...calcData, tipo_usuario: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="Estudiante">Estudiante (7 días máx | Multa $1.50/día)</option>
                  <option value="Profesor">Profesor (14 días máx | Multa $1.00/día)</option>
                  <option value="General">General (5 días máx | Multa $2.00/día)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Días de Retraso Transcurridos</label>
                <input
                  type="number"
                  min="0"
                  value={calcData.dias_retraso}
                  onChange={(e) => setCalcData({ ...calcData, dias_retraso: parseInt(e.target.value, 10) || 0 })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loadingCalc}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                {loadingCalc ? 'Calculando...' : 'Ejecutar Cálculo Stateless'}
              </button>
            </form>
          </div>

          {/* Resultado Calculadora */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Clock className="w-5 h-5 text-indigo-600" /> Resultado del Algoritmo
              </h3>

              {calcResultado ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">Días Permitidos:</span>
                      <span className="text-base font-bold text-slate-800">{calcResultado.dias_permitidos} días</span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-slate-500 block">Fecha Límite Estimada:</span>
                      <span className="text-base font-bold text-indigo-700">{calcResultado.fecha_limite_devolucion}</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Tarifa de Multa Diaria:</span>
                      <span className="font-semibold text-slate-800">{calcResultado.tarifa_diaria_multa}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Días en Retraso:</span>
                      <span className="font-semibold text-slate-800">{calcResultado.dias_retraso} días</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-slate-900">Monto Total Multa:</span>
                      <span className={`text-xl font-extrabold ${calcResultado.es_moroso ? 'text-red-600' : 'text-emerald-600'}`}>
                        {calcResultado.monto_total_multa}
                      </span>
                    </div>
                  </div>

                  {calcResultado.es_moroso ? (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700 font-semibold">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>El usuario presenta morosidad por retraso en la devolución.</span>
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-700 font-semibold">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>El usuario no presenta multas ni mora.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  Selecciona el perfil de usuario y presiona "Ejecutar Cálculo Stateless" para obtener los resultados.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

