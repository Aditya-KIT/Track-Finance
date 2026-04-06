import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Signup from './components/Signup';
import ManageUsers from './components/ManageUsers';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppInner() {
    const { isAuthenticated } = useAuth();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {isAuthenticated && <Navbar />}
            <div style={{ flex: 1 }}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/transactions" element={<Transactions />} />
                    <Route path="/manage-users" element={<ManageUsers />} />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </div>
            {isAuthenticated && <Footer />}
        </div>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppInner />
            </AuthProvider>
        </Router>
    );
}

export default App;
