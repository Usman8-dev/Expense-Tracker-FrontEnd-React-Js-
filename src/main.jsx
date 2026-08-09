import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { startWarmupScheduler } from './apis/warmup'

import "primereact/resources/themes/lara-light-cyan/theme.css"; // or your theme
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// Start backend warm-up scheduler to reduce cold start delays
startWarmupScheduler();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
