import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

/**
 * Menú desplegable para la selección e internacionalización (i18n) de idioma.
 * Permite cambiar entre Español e Inglés en tiempo real.
 */
export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'es';

  const handleChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="relative inline-flex items-center">
      <Globe className="w-3.5 h-3.5 absolute left-2.5 text-indigo-600 pointer-events-none" />
      <select
        value={currentLang}
        onChange={handleChange}
        aria-label={t('common.select_language')}
        title={t('common.select_language')}
        className="appearance-none bg-slate-100 hover:bg-slate-200/90 text-slate-700 font-semibold text-xs rounded-lg pl-8 pr-7 py-1.5 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors shadow-2xs"
      >
        <option value="es">Español (ES)</option>
        <option value="en">English (EN)</option>
      </select>
      <ChevronDown className="w-3 h-3 absolute right-2 text-slate-400 pointer-events-none" />
    </div>
  );
}
