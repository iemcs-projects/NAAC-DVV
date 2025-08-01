import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './auth/authProvider.jsx';
import { AppContextProvider } from './contextprovider/appContext.jsx';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </AppContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);
