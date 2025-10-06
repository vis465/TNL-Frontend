import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            const token = response.data.token;
            
            // Store in localStorage instead of sessionStorage
            localStorage.setItem('token', token);
            localStorage.setItem('isAdmin', response.data.isAdmin);
            
            setUser({
                token,
                isAdmin: response.data.isAdmin
            });
            
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        setUser(null);
    };

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        
        if (token) {
            setUser({
                token,
                isAdmin
            });
            return true;
        }
        return false;
    };

    // Add useEffect to check auth on app load
  
    return (
        <AuthContext.Provider value={{ user, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { AuthProvider, useAuth }; 