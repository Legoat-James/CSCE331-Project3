import { useState, useContext } from 'react';
import { useTranslate } from '../../contexts/TranslationContext';
import { SUPPORTED_LANGUAGES } from '../../contexts/languages';
import { ThemeContext } from '../../contexts/ThemeContext';
import './AccessibilityWidget.css';

function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('menu'); // 'menu' | 'language'
  const { language, setLanguage, translate } = useTranslate();
  const { theme, setTheme, textSize, setTextSize, magnifyScreen, setMagnifyScreen } = useContext(ThemeContext);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
    setView('menu');
  };

  function toggleMagnify(){
    setMagnifyScreen((prev)=>!prev);
  }

  const handleSelectLanguage = (code) => {
    setLanguage(code);
    setIsOpen(false);
    setView('menu');
  };

  function swapTextSize(){
    if(textSize === "normal"){
      setTextSize("large");
    }else if(textSize === "large"){
      setTextSize("xlarge");
    }else{
      setTextSize("normal");
    }
  }

  function displayTextSizeOption(){
     if(textSize === "normal"){
      return "Normal";
    }else if(textSize === "large"){
      return "Large"
    }else{
      return "X-Large"
    }
  }

  return (
    <div className="a11y-container">
      {isOpen && (
        <div
          className="a11y-panel"
          role="dialog"
          aria-modal="false"
          aria-label={translate('Accessibility')}
        >
          <div className="a11y-panel-header">
            <span>{translate('Accessibility')}</span>
            <button
              type="button"
              className="a11y-panel-close"
              onClick={() => setIsOpen(false)}
              aria-label={translate('Close accessibility menu')}
            >
              ×
            </button>
          </div>

          <div className="a11y-panel-body">
            {view === 'menu' && (
              <>
              <button
                type="button"
                className="a11y-option-btn"
                onClick={() => setView('language')
                }
                aria-label='Set Language Button'
              >
                {/* Globe icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="2"/>
                  <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2"/>
                  <line x1="4.93" y1="6" x2="19.07" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="4.93" y1="18" x2="19.07" y2="18" stroke="currentColor" strokeWidth="2"/>
                </svg>
                {translate('Language')}
              </button>
              <button
                type="button"
                className="a11y-option-btn"
                onClick={() => setTheme(prevTheme => prevTheme === 'standard' ? 'high-contrast' : 'standard')}
                aria-label='Toggle High Contrast Button'
              >{theme === "standard" ? "High Contrast" : "Normal Contrast"}</button>

              <button
                type="button"
                className="a11y-option-btn"
                onClick={swapTextSize}
                aria-label='Toggle Through Text Sizes'
              >Font Size: {displayTextSizeOption()}</button>
              <button
                type="button"
                className="a11y-option-btn"
                onClick={toggleMagnify}
                aria-label='Toggle Screen Magnification'
              >Zoom {!magnifyScreen ? "In" : "Out"}</button>
              </>
            )}

            {view === 'language' && (
              <>
                <button
                  type="button"
                  className="a11y-back-btn"
                  onClick={() => setView('menu')}
                >
                  ← {translate('Back')}
                </button>

                <p className="a11y-lang-heading">{translate('Select Language')}</p>

                <div className="a11y-lang-grid">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      className={`a11y-lang-btn ${language === lang.code ? 'is-active' : ''}`}
                      onClick={() => handleSelectLanguage(lang.code)}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className="a11y-trigger-btn"
        onClick={handleToggle}
        aria-label={translate('Open accessibility menu')}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
      >
        {/* Universal Access icon (SVG for cross-platform consistency) */}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
          <path d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm8 5H4a1 1 0 0 0 0 2h3.5l-1 5.5-2 5a1 1 0 1 0 1.86.74L8 16.5h8l1.64 3.74a1 1 0 0 0 1.86-.74l-2-5-1-5.5H20a1 1 0 0 0 0-2z"/>
        </svg>
      </button>
    </div>
  );
}

export default AccessibilityWidget;
