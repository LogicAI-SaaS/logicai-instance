import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import it from './locales/it.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import ar from './locales/ar.json';
import zh from './locales/zh.json';
import zhTW from './locales/zh-TW.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import ru from './locales/ru.json';
import pl from './locales/pl.json';
import nl from './locales/nl.json';
import tr from './locales/tr.json';
import sv from './locales/sv.json';
import no from './locales/no.json';
import da from './locales/da.json';
import fi from './locales/fi.json';
import cs from './locales/cs.json';
import ro from './locales/ro.json';
import hu from './locales/hu.json';
import el from './locales/el.json';
import uk from './locales/uk.json';
import hi from './locales/hi.json';
import id from './locales/id.json';
import th from './locales/th.json';
import vi from './locales/vi.json';
import he from './locales/he.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'fr',    label: 'Français',          flag: '🇫🇷' },
  { code: 'en',    label: 'English',           flag: '🇬🇧' },
  { code: 'es',    label: 'Español',           flag: '🇪🇸' },
  { code: 'it',    label: 'Italiano',          flag: '🇮🇹' },
  { code: 'de',    label: 'Deutsch',           flag: '🇩🇪' },
  { code: 'pt',    label: 'Português',         flag: '🇵🇹' },
  { code: 'ar',    label: 'العربية',           flag: '🇸🇦' },
  { code: 'zh',    label: '中文(简体)',         flag: '🇨🇳' },
  { code: 'zh-TW', label: '中文(繁體)',         flag: '🇹🇼' },
  { code: 'ja',    label: '日本語',            flag: '🇯🇵' },
  { code: 'ko',    label: '한국어',            flag: '🇰🇷' },
  { code: 'ru',    label: 'Русский',           flag: '🇷🇺' },
  { code: 'pl',    label: 'Polski',            flag: '🇵🇱' },
  { code: 'nl',    label: 'Nederlands',        flag: '🇳🇱' },
  { code: 'tr',    label: 'Türkçe',            flag: '🇹🇷' },
  { code: 'sv',    label: 'Svenska',           flag: '🇸🇪' },
  { code: 'no',    label: 'Norsk',             flag: '🇳🇴' },
  { code: 'da',    label: 'Dansk',             flag: '🇩🇰' },
  { code: 'fi',    label: 'Suomi',             flag: '🇫🇮' },
  { code: 'cs',    label: 'Čeština',           flag: '🇨🇿' },
  { code: 'ro',    label: 'Română',            flag: '🇷🇴' },
  { code: 'hu',    label: 'Magyar',            flag: '🇭🇺' },
  { code: 'el',    label: 'Ελληνικά',          flag: '🇬🇷' },
  { code: 'uk',    label: 'Українська',        flag: '🇺🇦' },
  { code: 'hi',    label: 'हिन्दी',           flag: '🇮🇳' },
  { code: 'id',    label: 'Bahasa Indonesia',  flag: '🇮🇩' },
  { code: 'th',    label: 'ภาษาไทย',          flag: '🇹🇭' },
  { code: 'vi',    label: 'Tiếng Việt',        flag: '🇻🇳' },
  { code: 'he',    label: 'עברית',             flag: '🇮🇱' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr:    { translation: fr },
      en:    { translation: en },
      es:    { translation: es },
      it:    { translation: it },
      de:    { translation: de },
      pt:    { translation: pt },
      ar:    { translation: ar },
      zh:    { translation: zh },
      'zh-TW': { translation: zhTW },
      ja:    { translation: ja },
      ko:    { translation: ko },
      ru:    { translation: ru },
      pl:    { translation: pl },
      nl:    { translation: nl },
      tr:    { translation: tr },
      sv:    { translation: sv },
      no:    { translation: no },
      da:    { translation: da },
      fi:    { translation: fi },
      cs:    { translation: cs },
      ro:    { translation: ro },
      hu:    { translation: hu },
      el:    { translation: el },
      uk:    { translation: uk },
      hi:    { translation: hi },
      id:    { translation: id },
      th:    { translation: th },
      vi:    { translation: vi },
      he:    { translation: he },
    },
    fallbackLng: 'fr',
    supportedLngs: ['fr','en','es','it','de','pt','ar','zh','zh-TW','ja','ko','ru','pl','nl','tr','sv','no','da','fi','cs','ro','hu','el','uk','hi','id','th','vi','he'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'logicai_lang',
      caches: ['localStorage'],
    },
  });

export default i18n;
