import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const navigate = useNavigate();
    const { isAdmin, logout, isViewer } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const handleMenuToggle = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <>
            <nav style={{
                padding: '12px 20px',
                background: '#0f172a',
                display: 'flex',
                gap: '20px',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffffff', fontFamily: 'Gagalin' }}>TRACK FINANCE</div>
                
                {/* Desktop Menu */}
                <div style={{
                    display: 'flex',
                    gap: '20px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    '@media (max-width: 768px)': { display: 'none' }
                }} className="desktop-menu">
                    <Link to="/dashboard" className="nav-link" style={{ color: '#ffffff' }}>Dashboard</Link>
                    {!isViewer && <Link to="/transactions" className="nav-link" style={{ color: '#ffffff' }}>Transactions</Link>}
                    {isAdmin && <Link to="/manage-users" className="nav-link" style={{ color: '#818cf8', fontWeight: '700' }}>Manage Users</Link>}
                    <button onClick={handleLogout} className="nav-button" style={{ background: '#6765f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                </div>

                {/* Mobile Hamburger Menu */}
                <button 
                    onClick={handleMenuToggle}
                    style={{
                        display: 'none',
                        background: 'none',
                        border: 'none',
                        color: '#ffffff',
                        fontSize: '24px',
                        cursor: 'pointer',
                        '@media (max-width: 768px)': { display: 'block' }
                    }}
                    className="hamburger-menu"
                >
                    ☰
                </button>
            </nav>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div style={{
                    background: '#0f172a',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    padding: '15px 20px',
                    borderBottom: '1px solid #ddd'
                }} className="mobile-menu">
                    <Link to="/dashboard" className="nav-link" style={{ color: '#ffffff', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                    {!isViewer && <Link to="/transactions" className="nav-link" style={{ color: '#ffffff', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Transactions</Link>}
                    {isAdmin && <Link to="/manage-users" className="nav-link" style={{ color: '#818cf8', fontWeight: '700', textDecoration: 'none' }} onClick={() => setIsMenuOpen(false)}>Manage Users</Link>}
                    <button onClick={handleLogout} style={{ background: '#6765f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                </div>
            )}

            <style>{`
                @media (max-width: 768px) {
                    .desktop-menu {
                        display: none !important;
                    }
                    .hamburger-menu {
                        display: block !important;
                    }
                }
                @media (min-width: 769px) {
                    .hamburger-menu {
                        display: none !important;
                    }
                }
            `}</style>
        </>
    );
}

export default Navbar;
