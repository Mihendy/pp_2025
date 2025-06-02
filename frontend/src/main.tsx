import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Register from './Register'; // ✅ Импортируем Register

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        {/* Главная страница */}
        <Route path="/" element={<App />} />

        {/* Страница регистрации */}
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  </React.StrictMode>
);