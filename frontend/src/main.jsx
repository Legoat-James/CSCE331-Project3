import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router"
import './index.css'
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import App from './App';

// IF THIS IS EVER SET TO TRUE ON THE SERVER SIDE I WILL MAKE YOU FARM QUESTS FOR AWS CREDITS
// FOR TESTING ONLY!!!!!!!!!!!
const isDevelopmentRotation = false; //set to true to rotate the app. FOR TESTING ONLY!!!!!!!!!!!
// FOR TESTING ONLY!!!!!!!!!!!
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <div className={isDevelopmentRotation ? "kiosk-mode-rotation" : ""}>
        <App />
      </div>
    </BrowserRouter>
  </StrictMode>,
)
