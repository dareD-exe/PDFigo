import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, useNavigate } from 'react-router-dom';
import App from './App.jsx'; // Changed import from Root to App
import './index.css';

// Wrapper component to provide navigate prop to App
function AppWithRouter() {
  const navigate = useNavigate();
  return <App navigate={navigate} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AppWithRouter />
    </Router>
  </React.StrictMode>
);
