// components/dashboard/DashboardHome.jsx
import React from 'react';
import { 
  Users, 
  Shield, 
  Activity, 
  BarChart3, 
  RefreshCw,
  AlertTriangle 
} from 'lucide-react';

const DashboardHome = ({ 
  connectionStatus, 
  systemStats, 
  loading, 
  checkBackendConnection,
  loadSystemStats,
  setActiveSection 
}) => {
  const handleRefresh = () => {
    checkBackendConnection();
    loadSystemStats();
  };

  const quickActions = [
    {
      id: 'analyzer',
      title: 'Análisis HotSpot',
      description: 'Configurar y analizar HotSpot',
      icon: Shield,
      color: 'bg-blue-500'
    },
    {
      id: 'monitoring',
      title: 'Monitoreo',
      description: 'Ver actividad en tiempo real',
      icon: Activity,
      color: 'bg-green-500'
    },
    {
      id: 'stats',
      title: 'Estadísticas',
      description: 'Reportes y gráficos',
      icon: BarChart3,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Estado del Sistema
          </h2>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Actualizar</span>
          </button>
        </div>

        {!connectionStatus.connected ? (
          <div className="flex items-center space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <div>
              <p className="text-red-800 font-medium">Sin conexión al backend</p>
              <p className="text-red-600 text-sm">
                {connectionStatus.error || 'Verificar configuración del servidor'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <Users className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-green-800 font-medium">Usuarios Activos</p>
                  <p className="text-green-600 text-lg font-bold">
                    {systemStats?.activeUsers || '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="text-blue-800 font-medium">Tráfico (MB)</p>
                  <p className="text-blue-600 text-lg font-bold">
                    {systemStats?.totalTraffic || '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="text-purple-800 font-medium">Estado HotSpot</p>
                  <p className="text-purple-600 text-lg font-bold">
                    {systemStats?.hotspotStatus || 'Desconocido'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => setActiveSection(action.id)}
              className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all text-left"
            >
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{action.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{action.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-3">
          {systemStats?.recentActivity?.length > 0 ? (
            systemStats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Activity className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay actividad reciente disponible
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;