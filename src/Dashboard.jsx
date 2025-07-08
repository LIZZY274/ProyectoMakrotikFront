// Dashboard.jsx - Dashboard principal con tus rutas específicas
import React, { useState, useEffect } from 'react';
import { Shield, Home, BarChart3, Activity } from 'lucide-react';

// Importar componentes con TUS rutas exactas
import Header from './components/dashboard/Header.jsx';
import Sidebar from './components/dashboard/Sidebar.jsx';
import DashboardHome from './components/dashboard/DashboardHome.jsx';
import AnalyzerSection from './components/analyzer/AnalyzerSection.jsx';
import MonitoringSection from './components/monitoring/MonitoringSection.jsx';
import StatsSection from './components/monitoring/StatsSection.jsx';
import apiService from './services/api.js';

const MikrotikHotspotDashboard = ({ user, onLogout }) => {
  // ============ ESTADO GLOBAL ============
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState({ 
    connected: false, 
    checking: true 
  });
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // ============ CONFIGURACIÓN DE MENÚ ============
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'analyzer', label: 'Análisis HotSpot', icon: Shield },
    { id: 'monitoring', label: 'Monitoreo', icon: Activity },
    { id: 'stats', label: 'Estadísticas', icon: BarChart3 },
  ];

  // ============ EFECTOS ============
  useEffect(() => {
    checkBackendConnection();
    if (activeSection === 'dashboard') {
      loadSystemStats();
    }
  }, [activeSection]);

  // Auto-refresh para la sección activa
  useEffect(() => {
    if (!connectionStatus.connected) return;

    const intervals = {
      dashboard: 30000,    // 30 segundos
      monitoring: 5000,    // 5 segundos
      stats: 60000,        // 1 minuto
    };

    const interval = intervals[activeSection];
    if (!interval) return;

    const timer = setInterval(() => {
      if (activeSection === 'dashboard') {
        loadSystemStats();
      }
    }, interval);

    return () => clearInterval(timer);
  }, [activeSection, connectionStatus.connected]);

  // ============ FUNCIONES GLOBALES ============
  const checkBackendConnection = async () => {
    setConnectionStatus({ connected: false, checking: true });
    try {
      const status = await apiService.checkConnection();
      setConnectionStatus({
        connected: status.connected,
        checking: false,
        error: status.error
      });
    } catch (error) {
      setConnectionStatus({
        connected: false,
        checking: false,
        error: apiService.handleApiError(error)
      });
    }
  };

  const loadSystemStats = async () => {
    if (!connectionStatus.connected) return;
    
    setLoading(true);
    try {
      const stats = await apiService.getHotspotStats();
      setSystemStats(stats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      // Mantener estadísticas anteriores en caso de error
    } finally {
      setLoading(false);
    }
  };

  // ============ RENDERIZADO DE CONTENIDO ============
  const renderContent = () => {
    const commonProps = {
      connectionStatus,
      systemStats,
      loading,
      setLoading,
      checkBackendConnection,
      loadSystemStats,
      setActiveSection,
      apiService
    };

    switch (activeSection) {
      case 'dashboard':
        return <DashboardHome {...commonProps} />;
      case 'analyzer':
        return <AnalyzerSection {...commonProps} />;
      case 'monitoring':
        return <MonitoringSection {...commonProps} />;
      case 'stats':
        return <StatsSection {...commonProps} />;
      default:
        return <DashboardHome {...commonProps} />;
    }
  };

  // ============ RENDER PRINCIPAL ============
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        menuItems={menuItems}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          user={user}
          onLogout={onLogout}
          activeSection={activeSection}
          menuItems={menuItems}
          connectionStatus={connectionStatus}
        />

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MikrotikHotspotDashboard;