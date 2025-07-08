import React, { useState, createContext, useContext, useEffect } from 'react';

// Context para autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

// Provider de autenticación mejorado
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Verificar si hay usuario guardado al cargar
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedUser = localStorage.getItem('mikrotik_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          // Verificar que el token no haya expirado (opcional)
          if (userData.tokenExpiry && Date.now() > userData.tokenExpiry) {
            localStorage.removeItem('mikrotik_user');
          } else {
            setUser(userData);
          }
        }

    
        const users = JSON.parse(localStorage.getItem('mikrotik_users') || '[]');
        if (users.length === 0) {
          const demoUsers = [
            {
              id: 1,
              username: 'admin',
              email: 'admin@mikrotik.com',
              password: 'admin123',
              role: 'admin',
              createdAt: new Date().toISOString(),
              lastLogin: null,
              isActive: true
            },
            {
              id: 2,
              username: 'user',
              email: 'user@mikrotik.com',
              password: 'user123',
              role: 'user',
              createdAt: new Date().toISOString(),
              lastLogin: null,
              isActive: true
            },
            {
              id: 3,
              username: 'guest',
              email: 'guest@mikrotik.com',
              password: 'guest123',
              role: 'guest',
              createdAt: new Date().toISOString(),
              lastLogin: null,
              isActive: true
            }
          ];
          localStorage.setItem('mikrotik_users', JSON.stringify(demoUsers));
        }
      } catch (error) {
        console.error('Error inicializando autenticación:', error);
        localStorage.removeItem('mikrotik_user');
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Validar credenciales con más seguridad
  const validateCredentials = (credentials) => {
    const errors = [];
    
    if (!credentials.username || credentials.username.trim().length < 3) {
      errors.push('El usuario debe tener al menos 3 caracteres');
    }
    
    if (!credentials.password || credentials.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    // Verificar caracteres especiales peligrosos
    const dangerousChars = /[<>'"&]/;
    if (dangerousChars.test(credentials.username) || dangerousChars.test(credentials.password)) {
      errors.push('Caracteres no permitidos detectados');
    }
    
    return errors;
  };

  // Función de login mejorada
  const login = async (credentials) => {
    setLoading(true);
    try {
      // Validar entrada
      const validationErrors = validateCredentials(credentials);
      if (validationErrors.length > 0) {
        return { success: false, error: validationErrors.join(', ') };
      }

      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Verificar credenciales
      const users = JSON.parse(localStorage.getItem('mikrotik_users') || '[]');
      const foundUser = users.find(u =>
        u.username === credentials.username && 
        u.password === credentials.password &&
        u.isActive
      );

      if (foundUser) {
        // Actualizar último login
        const updatedUsers = users.map(u => 
          u.id === foundUser.id 
            ? { ...u, lastLogin: new Date().toISOString() }
            : u
        );
        localStorage.setItem('mikrotik_users', JSON.stringify(updatedUsers));

        // Crear sesión con token temporal
        const userData = {
          id: foundUser.id,
          username: foundUser.username,
          email: foundUser.email,
          role: foundUser.role || 'user',
          lastLogin: new Date().toISOString(),
          tokenExpiry: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        setUser(userData);
        localStorage.setItem('mikrotik_user', JSON.stringify(userData));
        
        return { success: true, user: userData };
      } else {
        // Registrar intento fallido (opcional)
        const attempts = JSON.parse(localStorage.getItem('failed_login_attempts') || '{}');
        const userAttempts = attempts[credentials.username] || { count: 0, lastAttempt: null };
        userAttempts.count += 1;
        userAttempts.lastAttempt = new Date().toISOString();
        attempts[credentials.username] = userAttempts;
        localStorage.setItem('failed_login_attempts', JSON.stringify(attempts));

        return { success: false, error: 'Credenciales incorrectas' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error de conexión al servidor' };
    } finally {
      setLoading(false);
    }
  };

  // Función de registro mejorada
  const register = async (userData) => {
    setLoading(true);
    try {
      // Validar datos de entrada
      const validationErrors = validateUserData(userData);
      if (validationErrors.length > 0) {
        return { success: false, error: validationErrors.join(', ') };
      }

      await new Promise(resolve => setTimeout(resolve, 1200));

      const users = JSON.parse(localStorage.getItem('mikrotik_users') || '[]');

      // Verificar si el usuario ya existe
      const existingUser = users.find(u => 
        u.username.toLowerCase() === userData.username.toLowerCase() || 
        u.email.toLowerCase() === userData.email.toLowerCase()
      );

      if (existingUser) {
        return { success: false, error: 'Usuario o email ya existe' };
      }

      // Crear nuevo usuario
      const newUser = {
        id: Date.now(),
        username: userData.username.trim(),
        email: userData.email.trim().toLowerCase(),
        password: userData.password, // En producción, esto debería estar hasheado
        firstName: userData.firstName?.trim() || '',
        lastName: userData.lastName?.trim() || '',
        role: 'user',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        isActive: true,
        emailVerified: false
      };

      users.push(newUser);
      localStorage.setItem('mikrotik_users', JSON.stringify(users));

      // Crear sesión automática
      const userSession = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        lastLogin: new Date().toISOString(),
        tokenExpiry: Date.now() + (24 * 60 * 60 * 1000),
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      setUser(userSession);
      localStorage.setItem('mikrotik_user', JSON.stringify(userSession));

      return { success: true, user: userSession };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: 'Error al crear cuenta' };
    } finally {
      setLoading(false);
    }
  };

  // Validar datos del usuario
  const validateUserData = (userData) => {
    const errors = [];
    
    if (!userData.username || userData.username.trim().length < 3) {
      errors.push('El usuario debe tener al menos 3 caracteres');
    }
    
    if (!userData.email || !isValidEmail(userData.email)) {
      errors.push('Email inválido');
    }
    
    if (!userData.password || userData.password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (userData.password && userData.confirmPassword && userData.password !== userData.confirmPassword) {
      errors.push('Las contraseñas no coinciden');
    }
    
    return errors;
  };

  // Validar email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const logout = () => {
    try {
      setUser(null);
      localStorage.removeItem('mikrotik_user');
      
      // Limpiar datos sensibles adicionales si existen
      localStorage.removeItem('user_preferences');
      localStorage.removeItem('analysis_cache');
      
      // En producción, aquí se haría una llamada al servidor para invalidar el token
    } catch (error) {
      console.error('Error durante logout:', error);
    }
  };

  // Verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return user !== null && user.tokenExpiry && Date.now() < user.tokenExpiry;
  };

  // Obtener información del usuario actual
  const getCurrentUser = () => {
    return user;
  };

  // Cambiar contraseña
  const changePassword = async (currentPassword, newPassword) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };
    
    setLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('mikrotik_users') || '[]');
      const userIndex = users.findIndex(u => u.id === user.id);
      
      if (userIndex === -1) {
        return { success: false, error: 'Usuario no encontrado' };
      }
      
      if (users[userIndex].password !== currentPassword) {
        return { success: false, error: 'Contraseña actual incorrecta' };
      }
      
      if (newPassword.length < 6) {
        return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' };
      }
      
      users[userIndex].password = newPassword;
      users[userIndex].passwordChangedAt = new Date().toISOString();
      localStorage.setItem('mikrotik_users', JSON.stringify(users));
      
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Error al cambiar contraseña' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    initialized,
    login,
    register,
    logout,
    isAuthenticated,
    getCurrentUser,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;