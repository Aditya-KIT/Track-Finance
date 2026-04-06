import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(
        () => !!localStorage.getItem('token')
    );
    const [isAdmin, setIsAdmin] = useState(
        () => JSON.parse(localStorage.getItem('roles') || '[]').includes('ROLE_ADMIN')
    );

    const login = (token, roles = []) => {
        localStorage.setItem('token', token);
        localStorage.setItem('roles', JSON.stringify(roles));
        setIsAuthenticated(true);
        setIsAdmin(roles.includes('ROLE_ADMIN'));
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('roles');
        setIsAuthenticated(false);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isViewer = roles.includes('ROLE_VIEWER') && !roles.includes('ROLE_ADMIN') && !roles.includes('ROLE_ANALYST');
    return { ...context, isViewer, roles };
}
