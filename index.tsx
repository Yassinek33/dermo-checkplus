
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './src/styles.css'; // Import Global Glassmorphism Styles
import App from './App';

import { LanguageProvider } from './context/LanguageContext';
import { SiteProvider } from './contexts/SiteContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <SiteProvider>
          <App />
        </SiteProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);