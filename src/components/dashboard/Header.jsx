import React from 'react';
import { LogOut, User, Wifi, WifiOff } from 'lucide-react';

const Header = ({ user, onLogout, activeSection, menuItems, connectionStatus }) => {
  const currentSection = menuItems.find(item => item.id === activeSection);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Section Title */}
        <div className="flex items-center space-x-3">
          {currentSection && (
            <>
              {/* FIX: Asignar el icono a una variable con mayúscula */}
              {React.createElement(currentSection.icon, { 
                className: "w-6 h-6 text-slate-600" 
              })}
              <h1 className="text-xl font-semibold text-gray-900">
                {currentSection.label}
              </h1>
            </>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {connectionStatus.checking ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-slate-600"></div>
            ) : connectionStatus.connected ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${
              connectionStatus.connected ? 'text-green-600' : 'text-red-600'
            }`}>
              {connectionStatus.checking ? 'Verificando...' : 
               connectionStatus.connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {user?.username || 'Usuario'}
              </span>
            </div>
            
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;