import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
  }, []);

  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    setUser({ token });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    sessionStorage.removeItem('bookingSearchId');
    sessionStorage.removeItem('bookingListFilters');
    sessionStorage.removeItem('driverViewFilters');
    sessionStorage.removeItem('autoViewFilters');
    sessionStorage.removeItem('accountViewFilters');
    sessionStorage.removeItem('docVerificationAllFilters');
    sessionStorage.removeItem('docVerificationPendingFilters');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);