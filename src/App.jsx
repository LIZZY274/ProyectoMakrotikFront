// App.jsx - Archivo principal con autenticación
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import { LoginForm, RegisterForm } from './components/auth/AuthForms';
import MikrotikHotspotDashboard from './Dashboard';

// Componente interno que maneja la autenticación
const AppContent = () => {
  const { user, logout, loading, initialized } = useAuth();
  const [authMode, setAuthMode] = useState('login'); // 'login' o 'register'

  // Mostrar loading mientras se inicializa
  if (!initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white">Inicializando aplicación...</p>
        </div>
      </div>
    );
  }

  // Si hay usuario logueado, mostrar dashboard
  if (user) {
    return (
      <MikrotikHotspotDashboard 
        user={user} 
        onLogout={logout}
      />
    );
  }

  // Si no hay usuario, mostrar formularios de autenticación
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {authMode === 'login' ? (
        <LoginForm 
          onSwitchToRegister={() => setAuthMode('register')}
        />
      ) : (
        <RegisterForm 
          onSwitchToLogin={() => setAuthMode('login')}
        />
      )}
    </div>
  );
};

// Componente principal con el Provider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;