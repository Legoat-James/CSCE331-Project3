import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router"
import './index.css'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from './App';

const isDevelopmentRotation = false;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className={isDevelopmentRotation ? "kiosk-mode-rotation" : ""}>
        <App />
      </div>
    </BrowserRouter>
  </StrictMode>,
)
