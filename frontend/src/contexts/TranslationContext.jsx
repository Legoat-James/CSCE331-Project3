import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

// Google Translate uses slightly different codes for a few locales
const LANG_CODE_MAP = {
  zh: 'zh-CN',
};

const STORAGE_KEY_LANG = 'i18n-lang';
// v2 prefix invalidates MyMemory cache entries; Google Translate results are stored here
const STORAGE_PREFIX = 'tl_v2_';

function loadStoredTranslations(lang) {
  try {
    return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}${lang}`) || '{}');
  } catch {
    return {};
  }
}

function persistTranslation(lang, original, translated) {
  try {
    const stored = loadStoredTranslations(lang);
    stored[original] = translated;
    localStorage.setItem(`${STORAGE_PREFIX}${lang}`, JSON.stringify(stored));
  } catch {
    // localStorage unavailable — silently skip persistence
  }
}

const TranslationContext = createContext(null);

export function TranslationProvider({ children }) {
  const [language, setLanguageState] = useState(
    () => localStorage.getItem(STORAGE_KEY_LANG) || 'en'
  );

  // In-memory cache: { "lang:original": "translated" }
  const [translations, setTranslations] = useState({});

  // Track in-flight API requests to avoid duplicate fetches
  const pendingRef = useRef(new Set());

  // When language changes, pre-load any previously cached translations
  useEffect(() => {
    if (language === 'en') return;
    const stored = loadStoredTranslations(language);
    const entries = Object.entries(stored);
    if (entries.length === 0) return;

    setTranslations(prev => {
      const next = { ...prev };
      entries.forEach(([original, translated]) => {
        next[`${language}:${original}`] = translated;
      });
      return next;
    });
  }, [language]);

  const setLanguage = useCallback((lang) => {
    localStorage.setItem(STORAGE_KEY_LANG, lang);
    setLanguageState(lang);
  }, []);

  /**
   * translate(text) — synchronous, non-blocking.
   * Returns the cached translation if available, otherwise returns the
   * original text and fires a background API request.  The component
   * will re-render automatically once the translation arrives.
   */
  const translate = useCallback((text) => {
    if (!text || language === 'en') return text;

    const cacheKey = `${language}:${text}`;
    if (translations[cacheKey]) return translations[cacheKey];

    // Kick off async fetch if nothing is already in-flight
    if (!pendingRef.current.has(cacheKey)) {
      pendingRef.current.add(cacheKey);
      const target = LANG_CODE_MAP[language] || language;

      fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target }),
      })
        .then(r => r.json())
        .then(data => {
          const translated = data?.translated;
          if (!translated || translated === text) {
            console.warn('[translate] no translation returned:', data);
            pendingRef.current.delete(cacheKey);
            return;
          }
          persistTranslation(language, text, translated);
          setTranslations(prev => ({ ...prev, [cacheKey]: translated }));
          pendingRef.current.delete(cacheKey);
        })
        .catch((err) => {
          console.error('[translate] fetch error:', err);
          pendingRef.current.delete(cacheKey);
        });
    }

    // Return original while the translation is loading
    return text;
  }, [language, translations]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </TranslationContext.Provider>
  );
}

/**
 * useTranslate() — returns { language, setLanguage, translate }
 * Must be used inside a <TranslationProvider>.
 */
export function useTranslate() {
  const ctx = useContext(TranslationContext);
  if (!ctx) throw new Error('useTranslate must be used within a TranslationProvider');
  return ctx;
}
