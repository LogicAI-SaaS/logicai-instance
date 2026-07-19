/**
 * LanguageSelector — compact dropdown to switch the UI language.
 * Reads/writes via i18next; persists choice in localStorage (logicai_lang).
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, Search } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../i18n';

interface LanguageSelectorProps {
  /** 'compact' shows only the flag + current code; 'full' shows flag + label */
  variant?: 'compact' | 'full';
}

export function LanguageSelector({ variant = 'compact' }: LanguageSelectorProps) {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language)
    ?? SUPPORTED_LANGUAGES.find((l) => i18n.language.startsWith(l.code))
    ?? SUPPORTED_LANGUAGES[0];

  const filtered = SUPPORTED_LANGUAGES.filter((l) => {
    const q = search.toLowerCase();
    return l.label.toLowerCase().includes(q) || l.code.toLowerCase().includes(q);
  });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setSearch('');
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    setOpen(false);
    setSearch('');
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        title={t('language.label')}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-sm"
      >
        {variant === 'compact' ? (
          <>
            <Globe className="w-4 h-4 shrink-0" />
            <span className="font-medium uppercase text-[11px]">{current.code}</span>
          </>
        ) : (
          <>
            <span className="text-base leading-none">{current.flag}</span>
            <span className="font-medium">{current.label}</span>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-56 bg-[#111] border border-white/10 rounded-xl shadow-2xl z-[9999] overflow-hidden py-1">
          <p className="px-3 py-1.5 text-[10px] text-gray-600 uppercase tracking-wider font-medium">
            {t('language.label')}
          </p>

          {/* Search input */}
          <div className="px-2 pb-1">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg border border-white/10">
              <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('language.search')}
                className="bg-transparent text-sm text-white placeholder-gray-600 outline-none w-full"
              />
            </div>
          </div>

          {/* Language list */}
          <div className="max-h-60 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-sm text-gray-600 text-center">{t('language.noResult', 'Aucun résultat')}</p>
            ) : (
              filtered.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left hover:bg-white/5 ${
                    current.code === lang.code ? 'text-orange-400' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <span className="text-base leading-none w-5 shrink-0">{lang.flag}</span>
                  <span className="flex-1">{lang.label}</span>
                  {current.code === lang.code && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
