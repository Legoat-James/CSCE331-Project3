import { useState, useContext, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useTranslate } from '../../contexts/TranslationContext';
import { SUPPORTED_LANGUAGES } from '../../contexts/languages';
import { ThemeContext } from '../../contexts/ThemeContext';
import './AccessibilityWidget.css';
import 'regenerator-runtime/runtime';

function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('menu'); // 'menu' | 'language' | 'dictation'
  const [backgroundDictationEnabled, setBackgroundDictationEnabled] = useState(true);
  const { language, setLanguage, translate } = useTranslate();
  const { theme, setTheme, textSize, setTextSize, magnifyScreen, setMagnifyScreen } = useContext(ThemeContext);
  const triggerCheckoutFromVoice = () => {
    const clickable = [
      ...document.querySelectorAll('button'),
      ...document.querySelectorAll('input[type="submit"], input[type="button"]'),
    ];

    const checkoutTarget = clickable.find((element) => {
      const text = (
        element.tagName.toLowerCase() === 'input'
          ? element.value
          : element.textContent
      )
        ?.toLowerCase()
        .trim();

      return text?.includes('finish order') || text?.includes('checkout');
    });

    if (checkoutTarget) {
      checkoutTarget.click();
    }
  };

  const voiceCommands = [
    {
      command: ['end dictation', 'and dictation'],
      callback: () => {
        SpeechRecognition.abortListening();
        SpeechRecognition.stopListening();
        resetTranscript();
      },
    },
    {
      command: ['enter message', 'send message'],
      callback: () => {
        window.dispatchEvent(new CustomEvent('a11y-chatbot-send'));
        resetTranscript();
      },
    },
    {
      command: ['clear message', 'clear the message'],
      callback: () => {
        window.dispatchEvent(new CustomEvent('a11y-chatbot-clear'));
        resetTranscript();
      },
    },
    {
      command: ['checkout order', 'check out order', 'finish order'],
      callback: () => {
        window.dispatchEvent(new CustomEvent('a11y-checkout-order'));
        triggerCheckoutFromVoice();
        resetTranscript();
      },
    },
    {
      command: ['customer name *', 'set customer name *', 'customer name is *'],
      callback: (nameValue) => {
        const resolvedName = String(nameValue || '').trim();
        if (!resolvedName) {
          resetTranscript();
          return;
        }

        window.dispatchEvent(
          new CustomEvent('a11y-customer-name', {
            detail: { name: resolvedName },
          })
        );
        resetTranscript();
      },
    },
  ];

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    listening,
  } = useSpeechRecognition({ commands: voiceCommands });

  useEffect(() => {
    const canProcessTranscript = view === 'dictation' || backgroundDictationEnabled;
    if (!canProcessTranscript) {
      return;
    }

    const rawTranscript = String(transcript || '');
    const shouldEndDictation = /\b(end dictation|and dictation)\b/i.test(rawTranscript);
    const shouldEnterMessage = /\b(enter message|send message)\b/i.test(rawTranscript);
    const shouldClearMessage = /\b(clear message|clear the message)\b/i.test(rawTranscript);
    const shouldCheckoutOrder = /\b(checkout order|check out order|finish order)\b/i.test(rawTranscript);
    const customerNameMatch = rawTranscript.match(/(?:^|\b)(?:set\s+)?customer\s+name(?:\s+is)?\s+(.+)$/i);

    if (listening && shouldEndDictation) {
      SpeechRecognition.abortListening();
      SpeechRecognition.stopListening();
      resetTranscript();
      return;
    }

    if (shouldClearMessage) {
      window.dispatchEvent(new CustomEvent('a11y-chatbot-clear'));
      resetTranscript();
      return;
    }

    if (shouldEnterMessage) {
      window.dispatchEvent(new CustomEvent('a11y-chatbot-send'));
      resetTranscript();
      return;
    }

    if (shouldCheckoutOrder) {
      window.dispatchEvent(new CustomEvent('a11y-checkout-order'));
      triggerCheckoutFromVoice();
      resetTranscript();
      return;
    }

    if (customerNameMatch?.[1]) {
      const resolvedName = String(customerNameMatch[1]).trim();
      if (resolvedName) {
        window.dispatchEvent(
          new CustomEvent('a11y-customer-name', {
            detail: { name: resolvedName },
          })
        );
      }
      resetTranscript();
      return;
    }

    const cleanedTranscript = rawTranscript
      .replace(/\b(end dictation|and dictation|enter message|send message|clear message|clear the message|checkout order|check out order|finish order|customer name|customer name is|set customer name)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (cleanedTranscript) {
      window.dispatchEvent(
        new CustomEvent('a11y-chatbot-input', {
          detail: { text: cleanedTranscript },
        })
      );
    }
  }, [transcript, view, listening, backgroundDictationEnabled]);

  const handleToggle = () => {
    if (isOpen) {
      if (!backgroundDictationEnabled) {
        SpeechRecognition.stopListening();
      }
      setView('menu');
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
    setView('menu');
  };

  const handleClose = () => {
    if (!backgroundDictationEnabled) {
      SpeechRecognition.stopListening();
    }
    setIsOpen(false);
    setView('menu');
  };

  const handleOpenDictation = () => {
    resetTranscript();
    setView('dictation');

    if (browserSupportsSpeechRecognition) {
      SpeechRecognition.startListening({ continuous: true, interimResults: true, language: 'en-US' });
    }
  };

  const handleBackToMenu = () => {
    if (!backgroundDictationEnabled) {
      SpeechRecognition.stopListening();
    }
    setView('menu');
  };

  function toggleMagnify(){
    setMagnifyScreen((prev)=>!prev);
  }

  const handleDictationToggle = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      return;
    }

    SpeechRecognition.startListening({ continuous: true, interimResults: true, language: 'en-US' });
  };

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
          style={view === 'dictation' ? { width: '280px' } : undefined}
          role="dialog"
          aria-modal="false"
          aria-label={translate('Accessibility')}
        >
          <div className="a11y-panel-header">
            <span>{translate('Accessibility')}</span>
            <button
              type="button"
              className="a11y-panel-close"
              onClick={handleClose}
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
              <button
                type="button"
                className="a11y-option-btn"
                onClick={handleOpenDictation}
                aria-label="Open dictation test window"
              >
                Dictation
              </button>
              <button
                type="button"
                className="a11y-option-btn"
                onClick={() => setBackgroundDictationEnabled((prev) => !prev)}
                aria-label="Toggle background dictation"
              >
                Background Dictation: {backgroundDictationEnabled ? 'On' : 'Off'}
              </button>
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

            {view === 'dictation' && (
              <>
                <button
                  type="button"
                  className="a11y-back-btn"
                  onClick={handleBackToMenu}
                >
                  ← {translate('Back')}
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--tea-wood-dark)' }}>
                    Dictation Test
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--tea-wood-dark)' }}>
                    Status: {listening ? 'Listening' : 'Idle'}
                  </div>

                  <div style={{ fontSize: '0.74rem', color: 'var(--tea-wood-dark)' }}>
                    Background Mode: {backgroundDictationEnabled ? 'On (commands still work when closed)' : 'Off'}
                  </div>

                  {!browserSupportsSpeechRecognition ? (
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--tea-wood-dark)' }}>
                      Speech recognition is not supported in this browser.
                    </p>
                  ) : isMicrophoneAvailable === false ? (
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--tea-wood-dark)' }}>
                      Microphone access is needed for dictation.
                    </p>
                  ) : (
                    <>
                      <div
                        aria-live="polite"
                        style={{
                          minHeight: '88px',
                          padding: '0.55rem',
                          borderRadius: '10px',
                          border: '1px solid var(--tea-border)',
                          background: '#fff8ef',
                          color: 'var(--tea-wood-dark)',
                          fontSize: '0.82rem',
                          lineHeight: 1.35,
                          overflowY: 'auto',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {transcript || 'Speak here and your words will appear in this box.'}
                      </div>

                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button
                          type="button"
                          className="a11y-option-btn"
                          onClick={() => {
                            handleDictationToggle();
                          }}
                          aria-label={listening ? 'Stop dictation' : 'Start dictation'}
                          style={{ justifyContent: 'center', flex: '1 1 0' }}
                        >
                          {listening ? 'Stop' : 'Start'}
                        </button>
                        <button
                          type="button"
                          className="a11y-option-btn"
                          onClick={resetTranscript}
                          aria-label="Clear dictation transcript"
                          style={{ justifyContent: 'center', flex: '1 1 0' }}
                        >
                          Clear
                        </button>
                      </div>

                      <div
                        style={{
                          marginTop: '0.2rem',
                          padding: '0.55rem',
                          borderRadius: '10px',
                          border: '1px solid var(--tea-border)',
                          background: '#fff8ef',
                          color: 'var(--tea-wood-dark)',
                        }}
                      >
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                          Voice Commands
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.76rem', lineHeight: 1.35 }}>
                          <li>"Enter message" or "Send message": sends the current dictated text to chat.</li>
                          <li>"Clear message": clears the chat input text.</li>
                          <li>"Checkout order" or "Finish order": attempts to submit the current order.</li>
                          <li>"Customer name [name]": sets the customer name.</li>
                          <li>"End dictation": stops the microphone and clears this transcript box.</li>
                        </ul>
                      </div>
                    </>
                  )}
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
      {listening && !isOpen && (
        <div className="a11y-mic-indicator" aria-live="polite">
          Mic On
        </div>
      )}
    </div>
  );
}

export default AccessibilityWidget;
