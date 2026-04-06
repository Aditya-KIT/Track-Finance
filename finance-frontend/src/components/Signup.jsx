import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';

function Signup() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('viewer');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await api.post('/auth/signup', { 
                username, 
                email, 
                password, 
                role: [role] 
            });
            
            // New workflow! Don't let them log in, tell them to wait.
            setSuccess('Registration complete. Please wait for an Admin to approve your account before logging in.');
            setTimeout(() => navigate('/'), 4000); // Redirect to login after 4 seconds
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed! Username or Email might be taken.');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '400px', width: '100%', gap: '20px' }}>
                <div style={{ background: '#0f172a', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', fontFamily: 'Gagalin' }}>TRACK FINANCE</div>
                </div>
                <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', background: '#0f172a', color: '#ffffff' }}>
                    <h2 style={{ color: '#ffffff', paddingBottom: '5px' }}>Create New User</h2>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    {success && <p style={{ color: 'green', fontSize: '18px', fontWeight: 'bold' }}>{success}</p>}
                    
                    <form onSubmit={handleSignup}>
                        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ minWidth: '100px' }}>Username:</label>
                            <input type="text" value={username} onChange={e => setUsername(e.target.value)} required style={{ flex: 1, padding: '5px' }} />
                        </div>
                        
                        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ minWidth: '100px' }}>Email:</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ flex: 1, padding: '5px' }} />
                        </div>

                        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ minWidth: '100px' }}>Password:</label>
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength="6" required style={{ flex: 1, padding: '5px' }} />
                        </div>

                        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ minWidth: '100px' }}>Select Role:</label>
                            <select value={role} onChange={e => setRole(e.target.value)} style={{ flex: 1, padding: '5px' }}>
                                <option value="viewer">Viewer (Read Only)</option>
                                <option value="analyst">Analyst (Add Transactions)</option>
                                <option value="admin">Admin (Full Control)</option>
                            </select>
                        </div>
                        
                        <button type="submit" style={{ padding: '8px 16px', background: '#6765f1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Sign Up</button>
                    </form>

                    <p style={{ marginTop: '15px' }}>
                        <Link to="/" style={{ color: '#ffffff' }}>Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Signup;
