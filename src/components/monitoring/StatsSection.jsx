// components/monitoring/StatsSection.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download,
  Users,
  Clock,
  Activity,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';

const StatsSection = ({ 
  connectionStatus, 
  loading, 
  setLoading,
  apiService 
}) => {
  const [statsData, setStatsData] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('users');

  useEffect(() => {
    if (connectionStatus.connected) {
      loadStatsData();
    }
  }, [connectionStatus.connected, timeRange]);

  const loadStatsData = async () => {
    setLoading(true);
    try {
      // En un caso real, esto vendría de la API
      const mockStats = generateMockStats(timeRange);
      setStatsData(mockStats);
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockStats = (range) => {
    const days = range === '24h' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const dataPoints = range === '24h' ? 24 : days;
    
    return {
      summary: {
        totalUsers: Math.floor(Math.random() * 1000) + 500,
        totalSessions: Math.floor(Math.random() * 5000) + 2000,
        totalTraffic: Math.floor(Math.random() * 500) + 200, // GB
        avgSessionTime: Math.floor(Math.random() * 120) + 30, // minutos
        peakUsers: Math.floor(Math.random() * 200) + 50,
        peakTime: '14:30'
      },
      userActivity: Array.from({ length: dataPoints }, (_, i) => ({
        time: range === '24h' 
          ? `${String(i).padStart(2, '0')}:00`
          : `Día ${i + 1}`,
        users: Math.floor(Math.random() * 100) + 10,
        sessions: Math.floor(Math.random() * 200) + 20,
        traffic: Math.floor(Math.random() * 50) + 5
      })),
      topUsers: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        username: `usuario${i + 1}`,
        sessions: Math.floor(Math.random() * 50) + 5,
        traffic: Math.floor(Math.random() * 10) + 1, // GB
        avgDuration: Math.floor(Math.random() * 180) + 30 // minutos
      })),
      deviceTypes: [
        { name: 'Móviles', value: 45, color: 'bg-blue-500' },
        { name: 'Laptops', value: 30, color: 'bg-green-500' },
        { name: 'Tablets', value: 15, color: 'bg-yellow-500' },
        { name: 'Otros', value: 10, color: 'bg-purple-500' }
      ],
      hourlyDistribution: Array.from({ length: 24 }, (_, i) => ({
        hour: `${String(i).padStart(2, '0')}:00`,
        users: Math.floor(Math.random() * 80) + 5
      }))
    };
  };

  const timeRanges = [
    { value: '24h', label: 'Últimas 24h' },
    { value: '7d', label: 'Últimos 7 días' },
    { value: '30d', label: 'Últimos 30 días' },
    { value: '90d', label: 'Últimos 90 días' }
  ];

  const metrics = [
    { value: 'users', label: 'Usuarios', icon: Users },
    { value: 'sessions', label: 'Sesiones', icon: Activity },
    { value: 'traffic', label: 'Tráfico', icon: Download }
  ];

  const formatBytes = (gb) => {
    return `${gb.toFixed(1)} GB`;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Estadísticas y Reportes</h2>
            <p className="text-gray-600">Análisis detallado del uso del HotSpot</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            <button
              onClick={loadStatsData}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {statsData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-900">{statsData.summary.totalUsers.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sesiones</p>
                  <p className="text-2xl font-bold text-gray-900">{statsData.summary.totalSessions.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Download className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tráfico Total</p>
                  <p className="text-2xl font-bold text-gray-900">{formatBytes(statsData.summary.totalTraffic)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Duración Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{formatDuration(statsData.summary.avgSessionTime)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Actividad por Período</h3>
              
              <div className="flex items-center space-x-2">
                {metrics.map((metric) => (
                  <button
                    key={metric.value}
                    onClick={() => setSelectedMetric(metric.value)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedMetric === metric.value
                        ? 'bg-slate-100 text-slate-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <metric.icon className="w-4 h-4" />
                    <span>{metric.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="space-y-3">
              {statsData.userActivity.slice(0, 10).map((item, index) => {
                const value = item[selectedMetric];
                const maxValue = Math.max(...statsData.userActivity.map(d => d[selectedMetric]));
                const percentage = (value / maxValue) * 100;

                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-gray-600 text-right">
                      {item.time}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-4">
                          <div 
                            className="bg-slate-600 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-12 text-right">
                          {selectedMetric === 'traffic' ? formatBytes(value) : value.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Users */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Usuarios</h3>
              
              <div className="space-y-3">
                {statsData.topUsers.slice(0, 8).map((user, index) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-600">{user.sessions} sesiones</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatBytes(user.traffic)}</p>
                      <p className="text-sm text-gray-600">{formatDuration(user.avgDuration)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Device Types */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Dispositivos</h3>
              
              <div className="space-y-4">
                {statsData.deviceTypes.map((device, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">{device.name}</span>
                      <span className="text-sm text-gray-600">{device.value}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${device.color}`}
                        style={{ width: `${device.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Peak Hours */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Pico de Actividad</h4>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Hora pico:</span>
                  <span className="font-medium">{statsData.summary.peakTime}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Usuarios máximos:</span>
                  <span className="font-medium">{statsData.summary.peakUsers}</span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-12">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando estadísticas...</h3>
            <p className="text-gray-600">Obteniendo datos del servidor</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsSection;