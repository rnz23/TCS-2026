import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { validarCampo, validarFormularioUsuario } from '../../utils/validators';

/**
 * Modal para el registro de nuevos usuarios con validación
 * mediante Expresiones Regulares (Regex) en tiempo real.
 */
export default function UsuarioModal({ isOpen, onClose, onSave }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    tipo_usuario: 'Estudiante',
    telefono: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  if (!isOpen) return null;

  // Validación en tiempo real al escribir o salir del campo
  const handleChange = (campo, valor) => {
    setFormData((prev) => ({ ...prev, [campo]: valor }));

    // Si el usuario ya interactuó con el campo, revalidar inmediatamente
    if (touched[campo]) {
      const isValid = validarCampo(campo, valor);
      setErrors((prev) => {
        const next = { ...prev };
        if (isValid || (campo === 'telefono' && !valor)) {
          delete next[campo];
        } else {
          next[campo] = valor.trim() === '' ? 'required' : 'invalid';
        }
        return next;
      });
    }
  };

  const handleBlur = (campo) => {
    setTouched((prev) => ({ ...prev, [campo]: true }));
    const valor = formData[campo];

    if (!valor && campo !== 'telefono') {
      setErrors((prev) => ({ ...prev, [campo]: 'required' }));
    } else if (valor && !validarCampo(campo, valor)) {
      setErrors((prev) => ({ ...prev, [campo]: 'invalid' }));
    } else {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[campo];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Validación general con Regex antes del envío
    const { isValid, errors: validationErrors } = validarFormularioUsuario(formData);

    if (!isValid) {
      setErrors(validationErrors);
      setTouched({ nombre: true, email: true, telefono: true });
      return;
    }

    try {
      setSubmitting(true);
      await onSave(formData);
      onClose();
      setFormData({ nombre: '', email: '', tipo_usuario: 'Estudiante', telefono: '' });
      setErrors({});
      setTouched({});
    } catch (err) {
      setServerError(err.message || t('users.modal.err_create'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">{t('users.modal.title')}</h2>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            {t('users.modal.regex_badge')}
          </span>
        </div>

        {serverError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          
          {/* Campo: Nombre Completo (Regex) */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-semibold text-slate-700">{t('users.modal.name_label')}</label>
              <span className="text-[10px] text-slate-400">Regex: /^[a-zA-Záéíóú...]{'{3,50}'}$/</span>
            </div>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              onBlur={() => handleBlur('nombre')}
              placeholder={t('users.modal.name_placeholder')}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-hidden focus:ring-2 ${
                errors.nombre
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-emerald-500'
              }`}
            />
            {errors.nombre && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.nombre === 'required' ? t('users.modal.err_name_required') : t('users.modal.err_name_invalid')}
              </p>
            )}
          </div>

          {/* Campo: Correo Electrónico (Regex) */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-semibold text-slate-700">{t('users.modal.email_label')}</label>
              <span className="text-[10px] text-slate-400">Regex: /^.+@.+\..+$/</span>
            </div>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              placeholder={t('users.modal.email_placeholder')}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-hidden focus:ring-2 ${
                errors.email
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-emerald-500'
              }`}
            />
            {errors.email && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {errors.email === 'required' ? t('users.modal.err_email_required') : t('users.modal.err_email_invalid')}
              </p>
            )}
          </div>

          {/* Campo: Tipo de Usuario */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">{t('users.modal.type_label')}</label>
            <select
              value={formData.tipo_usuario}
              onChange={(e) => setFormData({ ...formData, tipo_usuario: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
            >
              <option value="Estudiante">{t('users.modal.opt_student')}</option>
              <option value="Profesor">{t('users.modal.opt_professor')}</option>
              <option value="General">{t('users.modal.opt_general')}</option>
            </select>
          </div>

          {/* Campo: Teléfono (Regex Opcional) */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <label className="text-xs font-semibold text-slate-700">{t('users.modal.phone_label')}</label>
              <span className="text-[10px] text-slate-400">Regex: /^\+?[0-9]{'{7,15}'}$/</span>
            </div>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => handleChange('telefono', e.target.value)}
              onBlur={() => handleBlur('telefono')}
              placeholder={t('users.modal.phone_placeholder')}
              className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-hidden focus:ring-2 ${
                errors.telefono
                  ? 'border-red-400 bg-red-50/30 focus:ring-red-500'
                  : 'border-slate-300 focus:ring-emerald-500'
              }`}
            />
            {errors.telefono && (
              <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {t('users.modal.err_phone_invalid')}
              </p>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? t('common.saving') : t('users.modal.btn_save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

