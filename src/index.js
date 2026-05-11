import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// เชื่อมต่อโค้ด React เข้ากับ <div id="root"> ในไฟล์ index.html
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
