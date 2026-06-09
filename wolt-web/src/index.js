import React, { StrictMode } from 'react'; // תיקון ל-StrictMode באות גדולה
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

// תיקון שגיאת הכתיב בקריאה ל-createRoot
const root = createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);