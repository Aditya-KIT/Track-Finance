import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/auth/signin', { username, password });
            login(response.data.token, response.data.roles || []);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '500px', width: '100%', gap: '20px' }}>
                <div style={{ background: '#0f172a', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', fontFamily: 'Gagalin' }}>TRACK FINANCE</div>
                </div>
                <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', background: '#0f172a', color: '#ffffff' }}>
                    <h2 style={{ color: '#ffffff', paddingBottom: '5px' }}>Login</h2>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                        <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <label style={{ textAlign: 'center' }}>Username:</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ maxWidth: '200px', padding: '5px', textAlign: 'center' }} />
                        </div>
                        <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <label style={{ textAlign: 'center' }}>Password:</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ maxWidth: '200px', padding: '5px', textAlign: 'center' }} />
                        </div>
                        <button type="submit" style={{ background: '#6765f1', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Sign In</button>
                    </form>
                    <p style={{ marginTop: '15px' }}>
                        <Link to="/signup" style={{ color: '#ffffff' }}>Don't have an account? Create one here (with roles!)</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login;
