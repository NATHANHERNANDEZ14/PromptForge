import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cv_currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cv_currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cv_currentUser');
    }
  }, [currentUser]);

  const login = async (username, password) => {
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if(res.ok) {
        setCurrentUser(data);
        return { success: true };
      }
      return { success: false, error: data.error || 'Error al iniciar sesión' };
    } catch (error) {
      return { success: false, error: 'Error de conexión con el servidor' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
