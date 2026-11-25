import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { startWarmupScheduler } from './apis/warmup'
import { registerSW } from 'virtual:pwa-register'

import "primereact/resources/themes/lara-light-cyan/theme.css"; // or your theme
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

// Register the service worker silently. A new build is activated in the
// background and used on the next manual refresh, without an update banner
// and without reloading the page while the user is working.
registerSW({
  immediate: true,
  onNeedReload() {
    // Intentionally do nothing: no forced reload.
  },
});

// Start backend warm-up scheduler to reduce cold start delays
startWarmupScheduler();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
