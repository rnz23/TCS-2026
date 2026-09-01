import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Notification({ notification, onClose }) {
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification, onClose]);

  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isError = notification.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl transition-all duration-300 transform translate-y-0 border backdrop-blur-md bg-white/95 text-slate-800 border-slate-200">
      {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
      {isError && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
      {!isSuccess && !isError && <Info className="w-5 h-5 text-sky-500 shrink-0" />}
      
      <p className="text-sm font-medium pr-2">{notification.message}</p>
      
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1"
        aria-label="Cerrar notificacion"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
