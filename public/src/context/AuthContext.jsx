// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  useEffect(() => {
    // Sempre que o token mudar, salvar no localStorage
    localStorage.setItem('token', token);
  }, [token]);

  const login = (newToken) => setToken(newToken);
  const logout = () => setToken('');

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
