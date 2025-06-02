import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import Register from './Register';
import DashboardPage from './DashboardPage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  </React.StrictMode>
);