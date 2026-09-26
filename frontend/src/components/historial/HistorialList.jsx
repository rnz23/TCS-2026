import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  History, Clock, Filter, BookPlus, RotateCcw, 
  HandHelping, Edit, Trash, FileSpreadsheet, Activity, RefreshCw 
} from 'lucide-react';

export default function HistorialList({ historial, loading, onRefresh }) {
  const { t } = useTranslation();
  const [filterTipo, setFilterTipo] = useState('');

  const filteredHistorial = useMemo(() => {
    if (!filterTipo) return historial;
    return historial.filter((h) => h.tipo_accion === filterTipo);
  }, [historial, filterTipo]);

  const getActionBadge = (tipo) => {
    switch (tipo) {
      case 'PRESTAMO':
        return {
          icon: <HandHelping className="w-3.5 h-3.5" />,
          label: t('history.badge_loan'),
          className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'DEVOLUCION':
        return {
          icon: <RotateCcw className="w-3.5 h-3.5" />,
          label: t('history.badge_return'),
          className: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'CREACION_LIBRO':
        return {
          icon: <BookPlus className="w-3.5 h-3.5" />,
          label: t('history.badge_new_book'),
          className: 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'IMPORTACION_EXCEL':
        return {
          icon: <FileSpreadsheet className="w-3.5 h-3.5" />,
          label: t('history.badge_import'),
          className: 'bg-teal-50 text-teal-700 border-teal-200',
        };
      case 'ELIMINACION_LIBRO':
        return {
          icon: <Trash className="w-3.5 h-3.5" />,
          label: t('history.badge_deleted'),
          className: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      default:
        return {
          icon: <Activity className="w-3.5 h-3.5" />,
          label: tipo || t('history.badge_movement'),
          className: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-semibold flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> {t('history.filter_label')}
          </span>
          {[
            { id: '', label: t('history.all') },
            { id: 'PRESTAMO', label: t('history.loans') },
            { id: 'DEVOLUCION', label: t('history.returns') },
            { id: 'CREACION_LIBRO', label: t('history.creations') },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterTipo(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                filterTipo === f.id
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={onRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer ml-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t('history.refresh')}</span>
        </button>
      </div>

      {/* Timeline List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mx-auto mb-4" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-12 bg-slate-100 rounded-lg w-full" />
            ))}
          </div>
        </div>
      ) : filteredHistorial.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-2xl p-8">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">{t('history.empty_title')}</h3>
          <p className="text-sm text-slate-500 mt-1">
            {t('history.empty_desc')}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredHistorial.map((mov) => {
            const badge = getActionBadge(mov.tipo_accion);
            const fecha = mov.fecha_creacion ? new Date(mov.fecha_creacion) : null;

            return (
              <div key={mov.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors flex items-start gap-3.5">
                <div className={`p-2 rounded-xl border shrink-0 ${badge.className}`}>
                  {badge.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border uppercase tracking-wider ${badge.className}`}>
                        {badge.label}
                      </span>
                      <h4 className="font-semibold text-slate-800 text-sm truncate">
                        {mov.descripcion}
                      </h4>
                    </div>

                    {fecha && (
                      <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{fecha.toLocaleDateString()} {fecha.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </span>
                    )}
                  </div>

                  {mov.detalles && (
                    <p className="text-xs text-slate-500 font-mono bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 inline-block mt-1">
                      {mov.detalles}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
