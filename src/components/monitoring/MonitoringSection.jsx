// components/monitoring/MonitoringSection.jsx
import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  Wifi, 
  HardDrive,
  Cpu,
  MemoryStick,
  RefreshCw,
  Clock,
  Download,
  Upload,
  Eye,
  AlertCircle
} from 'lucide-react';

const MonitoringSection = ({ 
  connectionStatus, 
  loading, 
  setLoading,
  apiService 
}) => {
  const [metrics, setMetrics] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [systemLogs, setSystemLogs] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (connectionStatus.connected) {
      loadMonitoringData();
    }
  }, [connectionStatus.connected]);

  useEffect(() => {
    if (!autoRefresh || !connectionStatus.connected) return;

    const interval = setInterval(() => {
      loadMonitoringData();
    }, 5000); // Actualizar cada 5 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, connectionStatus.connected]);

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      const [metricsData, usersData, logsData] = await Promise.all([
        apiService.getMonitoringMetrics(),
        apiService.getActiveUsers(),
        apiService.getSystemLogs(20)
      ]);

      setMetrics(metricsData);
      setActiveUsers(usersData);
      setSystemLogs(logsData);
    } catch (error) {
      console.error('Error cargando datos de monitoreo:', error);
      // Datos mock para demostración
      setMetrics({
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        disk: Math.floor(Math.random() * 100),
        network: {
          rx: Math.floor(Math.random() * 1000),
          tx: Math.floor(Math.random() * 1000)
        },
        uptime: '2d 14h 32m',
        temperature: Math.floor(Math.random() * 20) + 30
      });

      setActiveUsers([
        { id: 1, username: 'usuario1', ip: '192.168.1.101', mac: '00:11:22:33:44:55', connected: '10:30', traffic: '45.2 MB' },
        { id: 2, username: 'usuario2', ip: '192.168.1.102', mac: '00:11:22:33:44:56', connected: '09:15', traffic: '128.7 MB' },
        { id: 3, username: 'guest123', ip: '192.168.1.103', mac: '00:11:22:33:44:57', connected: '11:45', traffic: '15.8 MB' }
      ]);

      setSystemLogs([
        { id: 1, timestamp: new Date().toISOString(), level: 'info', message: 'Usuario usuario1 conectado desde 192.168.1.101' },
        { id: 2, timestamp: new Date(Date.now() - 300000).toISOString(), level: 'warning', message: 'Límite de ancho de banda alcanzado para usuario2' },
        { id: 3, timestamp: new Date(Date.now() - 600000).toISOString(), level: 'info', message: 'Configuración de firewall actualizada' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 60) return 'bg-green-500';
    if (percentage < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLogLevelIcon = (level) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Eye className="w-4 h-4 text-blue-500" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Monitoreo en Tiempo Real</h2>
            <p className="text-gray-600">Estado actual del sistema y usuarios activos</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-slate-600 focus:ring-slate-500"
              />
              <span className="text-sm text-gray-700">Auto-actualizar</span>
            </label>
            
            <button
              onClick={loadMonitoringData}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Métricas del Sistema</h3>
        
        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* CPU Usage */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-900">CPU</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uso</span>
                  <span className="font-medium">{metrics.cpu}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metrics.cpu)}`}
                    style={{ width: `${metrics.cpu}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MemoryStick className="w-5 h-5 text-green-500" />
                <span className="font-medium text-gray-900">Memoria</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uso</span>
                  <span className="font-medium">{metrics.memory}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metrics.memory)}`}
                    style={{ width: `${metrics.memory}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Disk Usage */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-purple-500" />
                <span className="font-medium text-gray-900">Disco</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uso</span>
                  <span className="font-medium">{metrics.disk}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metrics.disk)}`}
                    style={{ width: `${metrics.disk}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Network Activity */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-gray-900">Red</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Download className="w-3 h-3 text-green-600" />
                    <span>RX</span>
                  </div>
                  <span className="font-medium">{metrics.network.rx} KB/s</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1">
                    <Upload className="w-3 h-3 text-blue-600" />
                    <span>TX</span>
                  </div>
                  <span className="font-medium">{metrics.network.tx} KB/s</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-slate-600"></div>
          </div>
        )}

        {/* Additional System Info */}
        {metrics && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Uptime:</span>
                <span className="font-medium">{metrics.uptime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Temperatura:</span>
                <span className="font-medium">{metrics.temperature}°C</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Usuarios activos:</span>
                <span className="font-medium">{activeUsers.length}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Users */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Usuarios Activos</h3>
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {activeUsers.length} conectados
          </span>
        </div>

        {activeUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MAC Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conectado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tráfico
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activeUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm font-medium text-gray-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.ip}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                      {user.mac}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.connected}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {user.traffic}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Wifi className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay usuarios conectados actualmente</p>
          </div>
        )}
      </div>

      {/* System Logs */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Logs del Sistema</h3>

        {systemLogs.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {systemLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                {getLogLevelIcon(log.level)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-900 truncate">{log.message}</p>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay logs disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringSection;