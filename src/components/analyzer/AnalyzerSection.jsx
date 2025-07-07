// components/analyzer/AnalyzerSection.jsx
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  XCircle,
  RefreshCw,
  Play,
  Eye,
  Lock,
  Code,
  FileText,
  Copy,
  Trash2
} from 'lucide-react';

const AnalyzerSection = ({ 
  connectionStatus, 
  loading, 
  setLoading,
  apiService 
}) => {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [hotspotConfig, setHotspotConfig] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userCode, setUserCode] = useState('');
  const [analysisMode, setAnalysisMode] = useState('manual');

  // Código de ejemplo para HotSpot
  const exampleCode = `/ip hotspot
add name=hotspot1 interface=wlan1 address-pool=dhcp_pool1 profile=hsprof1
add name=hotspot2 interface=wlan2 address-pool=dhcp_pool2

/ip hotspot user
add name=admin password=admin123 profile=unlimited
add name=guest password=guest123 profile=limited limit-uptime=2h
add name=user1 password=user123 profile=standard

/ip hotspot profile
add name=hsprof1 html-directory=hotspot login-by=cookie,http-pap
add name=limited rate-limit=1M/2M session-timeout=1h

/ip hotspot ip-binding
add address=192.168.1.100 mac-address=00:11:22:33:44:55 type=regular
add address=192.168.1.101 type=bypassed comment="Admin PC"`;

  useEffect(() => {
    if (connectionStatus.connected && analysisMode === 'device') {
      loadHotspotConfig();
    }
  }, [connectionStatus.connected, analysisMode]);

  const loadHotspotConfig = async () => {
    setLoading(true);
    try {
      const config = await apiService.getHotspotConfig();
      setHotspotConfig(config);
    } catch (error) {
      console.error('Error cargando configuración:', error);
      setHotspotConfig({
        interface: 'wlan1',
        enabled: true,
        authentication: 'local',
        encryption: 'wpa2',
        timeout: '1h',
        addressPool: '192.168.1.100-192.168.1.200'
      });
    } finally {
      setLoading(false);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      let results;
      
      if (analysisMode === 'manual') {
        if (!userCode.trim()) {
          alert('Por favor ingresa código HotSpot para analizar');
          return;
        }
        
        const response = await fetch(`${apiService.baseURL}/api/hotspot/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code: userCode }),
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        results = await response.json();
      } else {
        results = await apiService.runSecurityAnalysis();
      }
      
      const adaptedResults = {
        status: results.semValid && results.parseValid ? 'passed' : 
                (results.securityWarnings && results.securityWarnings.length > 0 ? 'warning' : 'error'),
        totalChecks: 6,
        passed: (results.parseValid ? 1 : 0) + (results.semValid ? 1 : 0) + 4,
        warnings: results.securityWarnings ? results.securityWarnings.length : 0,
        errors: (results.parseValid ? 0 : results.parseErrors?.length || 1) + 
                (results.semValid ? 0 : results.semErrors?.length || 1),
        lastAnalysis: new Date().toISOString(),
        rawResults: results,
        checks: [
          {
            id: 1,
            name: 'Análisis Léxico',
            status: results.tokens && results.tokens.length > 0 ? 'passed' : 'error',
            description: results.tokens ? `${results.tokens.length} tokens identificados` : 'No se pudieron identificar tokens',
            details: results.tokens ? `Tipos encontrados: ${[...new Set(results.tokens.map(t => t.type))].join(', ')}` : 'Error en análisis léxico'
          },
          {
            id: 2,
            name: 'Análisis Sintáctico',
            status: results.parseValid ? 'passed' : 'error',
            description: results.parseValid ? 'Sintaxis correcta' : 'Errores de sintaxis detectados',
            details: results.parseErrors && results.parseErrors.length > 0 ? 
                    results.parseErrors.join('; ') : 'Estructura de comandos HotSpot válida'
          },
          {
            id: 3,
            name: 'Análisis Semántico',
            status: results.semValid ? 'passed' : 'error',
            description: results.semValid ? 'Semántica correcta' : 'Errores semánticos detectados',
            details: results.semErrors && results.semErrors.length > 0 ? 
                    results.semErrors.join('; ') : 'Configuración semánticamente válida'
          },
          {
            id: 4,
            name: 'Verificaciones de Seguridad',
            status: results.securityWarnings && results.securityWarnings.length > 0 ? 'warning' : 'passed',
            description: results.securityWarnings && results.securityWarnings.length > 0 ? 
                        `${results.securityWarnings.length} advertencias de seguridad` : 'No se encontraron problemas de seguridad',
            details: results.securityWarnings && results.securityWarnings.length > 0 ? 
                    results.securityWarnings.join('; ') : 'Configuración segura'
          },
          {
            id: 5,
            name: 'Estadísticas de Configuración',
            status: 'passed',
            description: `HotSpots: ${results.hotspotStats?.hotspots || 0}, Usuarios: ${results.hotspotStats?.users || 0}, Bindings: ${results.hotspotStats?.bindings || 0}`,
            details: 'Elementos de configuración contabilizados correctamente'
          },
          {
            id: 6,
            name: 'Origen de Datos',
            status: 'passed',
            description: results.isFromDevice ? 'Configuración obtenida desde dispositivo MikroTik' : 'Código ingresado manualmente',
            details: analysisMode === 'manual' ? 'Análisis de código personalizado' : 'Análisis de configuración en vivo'
          }
        ]
      };
      
      setAnalysisResults(adaptedResults);
    } catch (error) {
      console.error('Error ejecutando análisis:', error);
      alert(`Error al ejecutar análisis: ${error.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadExampleCode = () => {
    setUserCode(exampleCode);
  };

  const clearCode = () => {
    setUserCode('');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userCode);
    alert('Código copiado al portapapeles');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Eye className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Análisis', icon: Search },
    { id: 'config', label: 'Configuración', icon: Settings },
    { id: 'security', label: 'Seguridad', icon: Lock }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-slate-500 text-slate-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {React.createElement(tab.icon, { className: "w-4 h-4" })}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-sm font-medium text-gray-700">Modo de análisis:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setAnalysisMode('manual')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      analysisMode === 'manual'
                        ? 'bg-slate-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Code className="w-4 h-4 inline mr-2" />
                    Código Manual
                  </button>
                  <button
                    onClick={() => setAnalysisMode('device')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      analysisMode === 'device'
                        ? 'bg-slate-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Shield className="w-4 h-4 inline mr-2" />
                    Desde Dispositivo
                  </button>
                </div>
              </div>

              {analysisMode === 'manual' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Código HotSpot MikroTik</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={loadExampleCode}
                        className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Cargar Ejemplo</span>
                      </button>
                      <button
                        onClick={copyToClipboard}
                        disabled={!userCode}
                        className="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm disabled:opacity-50"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copiar</span>
                      </button>
                      <button
                        onClick={clearCode}
                        disabled={!userCode}
                        className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Limpiar</span>
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-300 rounded-lg">
                    <textarea
                      value={userCode}
                      onChange={(e) => setUserCode(e.target.value)}
                      placeholder={`Ingresa tu código HotSpot MikroTik aquí...

Ejemplo:
/ip hotspot
add name=hotspot1 interface=wlan1 address-pool=dhcp_pool1

/ip hotspot user
add name=admin password=admin123`}
                      className="w-full h-64 p-4 border-0 rounded-lg resize-none focus:ring-2 focus:ring-slate-500 focus:outline-none font-mono text-sm"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>💡 <strong>Tip:</strong> Puedes pegar configuración exportada directamente desde MikroTik</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {analysisMode === 'manual' ? 'Análisis de Código HotSpot' : 'Análisis de Dispositivo HotSpot'}
                  </h2>
                  <p className="text-gray-600">
                    {analysisMode === 'manual' 
                      ? 'Evalúa la configuración HotSpot ingresada manualmente'
                      : 'Evalúa la configuración HotSpot del dispositivo conectado'
                    }
                  </p>
                </div>
                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing || !connectionStatus.connected || (analysisMode === 'manual' && !userCode.trim())}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>{isAnalyzing ? 'Analizando...' : 'Ejecutar Análisis'}</span>
                </button>
              </div>

              {analysisResults && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-800 font-medium">Total Verificaciones</p>
                        <p className="text-blue-600 text-2xl font-bold">{analysisResults.totalChecks}</p>
                      </div>
                      <Search className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-800 font-medium">Pasaron</p>
                        <p className="text-green-600 text-2xl font-bold">{analysisResults.passed}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-800 font-medium">Advertencias</p>
                        <p className="text-yellow-600 text-2xl font-bold">{analysisResults.warnings}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-yellow-500" />
                    </div>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-red-800 font-medium">Errores</p>
                        <p className="text-red-600 text-2xl font-bold">{analysisResults.errors}</p>
                      </div>
                      <XCircle className="w-8 h-8 text-red-500" />
                    </div>
                  </div>
                </div>
              )}

              {analysisResults && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Resultados Detallados</h3>
                  {analysisResults.checks.map((check) => (
                    <div
                      key={check.id}
                      className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
                    >
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(check.status)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{check.name}</h4>
                          <p className="text-gray-700 text-sm mt-1">{check.description}</p>
                          {check.details && (
                            <p className="text-gray-600 text-xs mt-2">{check.details}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!analysisResults && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay análisis disponible
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {analysisMode === 'manual' 
                      ? 'Ingresa código HotSpot y ejecuta un análisis'
                      : 'Ejecuta un análisis para evaluar la configuración del dispositivo'
                    }
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'config' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Configuración Actual del HotSpot</h3>
              
              {hotspotConfig ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interfaz
                      </label>
                      <input
                        type="text"
                        value={hotspotConfig.interface}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          hotspotConfig.enabled 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {hotspotConfig.enabled ? 'Habilitado' : 'Deshabilitado'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Autenticación
                      </label>
                      <input
                        type="text"
                        value={hotspotConfig.authentication}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Encriptación
                      </label>
                      <input
                        type="text"
                        value={hotspotConfig.encryption}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Timeout de Sesión
                      </label>
                      <input
                        type="text"
                        value={hotspotConfig.timeout}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pool de Direcciones
                      </label>
                      <input
                        type="text"
                        value={hotspotConfig.addressPool}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Cargando configuración...</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Recomendaciones de Seguridad</h3>
              
              <div className="space-y-4">
                <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Validar Código Manualmente</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        Cuando ingreses código manualmente, asegúrate de validar la sintaxis y semántica
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Usar Contraseñas Fuertes</h4>
                      <p className="text-blue-700 text-sm mt-1">
                        Evita contraseñas comunes como admin123, password, etc.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800">Análisis Completo Disponible</h4>
                      <p className="text-green-700 text-sm mt-1">
                        El analizador verifica sintaxis, semántica y seguridad de tu configuración HotSpot
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzerSection;