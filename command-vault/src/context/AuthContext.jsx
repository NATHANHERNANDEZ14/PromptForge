import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, tokenStorage } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cv_currentUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    // Check if stored token is still valid on boot
    const verifySession = async () => {
      const token = tokenStorage.get();
      if (token && currentUser) {
        try {
          const freshUser = await authApi.me();
          setCurrentUser(prev => ({ ...prev, ...freshUser }));
          localStorage.setItem('cv_currentUser', JSON.stringify({ ...currentUser, ...freshUser }));
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message);
          tokenStorage.remove();
          localStorage.removeItem('cv_currentUser');
          setCurrentUser(null);
        }
      }
      setLoadingAuth(false);
    };

    verifySession();

    // Listen for global unauthorized events (e.g. 401 response from backend)
    const handleUnauthorized = () => {
      setCurrentUser(null);
      tokenStorage.remove();
      localStorage.removeItem('cv_currentUser');
    };

    window.addEventListener('cv:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('cv:unauthorized', handleUnauthorized);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await authApi.login(username, password);
      
      if (data && data.token) {
        tokenStorage.set(data.token);
        const { token, ...userData } = data;
        const userWithToken = { ...userData, token };
        setCurrentUser(userWithToken);
        localStorage.setItem('cv_currentUser', JSON.stringify(userWithToken));
        return { success: true };
      }
      return { success: false, error: 'Respuesta inválida del servidor.' };
    } catch (error) {
      return { success: false, error: error.message || 'Error al iniciar sesión.' };
    }
  };

  const logout = () => {
    tokenStorage.remove();
    localStorage.removeItem('cv_currentUser');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loadingAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
