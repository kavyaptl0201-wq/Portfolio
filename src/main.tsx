import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
// Imported for its side effect: sets up the audio unlock-on-first-gesture listeners
import './audio/soundEngine';
import '@fontsource-variable/inter';
import '@fontsource-variable/roboto-flex/wdth.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
