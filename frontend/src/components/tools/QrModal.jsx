import React, { useState, useEffect } from 'react';
import { X, QrCode, Download, Printer, Sparkles, Tag, User } from 'lucide-react';
import { api } from '../../services/api';

export default function QrModal({ isOpen, onClose, libro }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && libro) {
      loadQr();
    }
  }, [isOpen, libro]);

  const loadQr = async () => {
    try {
      setLoading(true);
      const res = await api.getQrCode(libro);
      if (res.success) {
        setQrData(res.data);
      }
    } catch (err) {
      console.error("Error al generar código QR:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrData?.qr_base64) {
      const a = document.createElement('a');
      a.href = qrData.qr_base64;
      a.download = `QR_Libro_${libro.id}_${libro.titulo.slice(0, 20)}.png`;
      a.click();
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=450,height=550');
    if (printWindow && qrData) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Etiqueta QR - Libro #${libro.id}</title>
            <style>
              body { font-family: sans-serif; text-align: center; padding: 20px; }
              .card { border: 2px dashed #333; border-radius: 12px; padding: 16px; max-width: 320px; margin: 0 auto; }
              img { width: 180px; height: 180px; margin: 10px 0; }
              h2 { font-size: 16px; margin: 5px 0; color: #1e1b4b; }
              p { font-size: 12px; margin: 3px 0; color: #4b5563; }
              .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="card">
              <span class="badge">BIBLIOTECA - ID #${libro.id}</span>
              <h2>${libro.titulo}</h2>
              <p><strong>Autor:</strong> ${libro.autor_nombre || 'Anónimo'}</p>
              <img src="${qrData.qr_base64}" />
              <p style="font-size: 10px; color: #9ca3af;">Escanear para consultar disponibilidad y ficha</p>
            </div>
            <script>window.print(); setTimeout(() => window.close(), 500);</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  if (!isOpen || !libro) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-violet-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <QrCode className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">Ficha / Código QR</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-amber-950 uppercase tracking-wide">
                  Stateless
                </span>
              </div>
              <p className="text-xs text-violet-200 mt-0.5 line-clamp-1">{libro.titulo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-violet-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-4">
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
            {loading ? (
              <div className="w-48 h-48 bg-slate-200 rounded-2xl animate-pulse flex items-center justify-center text-xs text-slate-400">
                Generando QR en memoria...
              </div>
            ) : qrData ? (
              <div className="space-y-3">
                <img
                  src={qrData.qr_base64}
                  alt={`Código QR para ${libro.titulo}`}
                  className="w-44 h-44 mx-auto rounded-xl border-4 border-white shadow-md"
                />
                <div className="text-xs text-slate-600">
                  <span className="inline-block px-2.5 py-0.5 bg-indigo-100 text-indigo-800 rounded-md font-bold mb-1">
                    ID #{libro.id}
                  </span>
                  <p className="font-semibold text-slate-800 line-clamp-1">{libro.titulo}</p>
                  <p className="text-slate-500">{libro.autor_nombre || 'Anónimo'}</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="text-xs text-slate-500 bg-violet-50/70 border border-violet-100 rounded-xl p-3 text-left flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
            <p>
              El código QR se renderiza como imagen <strong>Base64 puramente en memoria (Stateless)</strong>, ideal para imprimir etiquetas físicas sin crear archivos residuales en el servidor.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              disabled={loading || !qrData}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
              title="Descargar imagen PNG"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>

            <button
              onClick={handlePrint}
              disabled={loading || !qrData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all cursor-pointer"
              title="Imprimir etiqueta física"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Etiqueta</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
