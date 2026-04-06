import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const ROLES = ['ROLE_ADMIN', 'ROLE_ANALYST', 'ROLE_VIEWER'];

const ROLE_COLORS = {
    ROLE_ADMIN: '#ef4444',
    ROLE_ANALYST: '#3b82f6',
    ROLE_VIEWER: '#8b5cf6',
};

const ROLE_LABELS = {
    ROLE_ADMIN: 'Admin',
    ROLE_ANALYST: 'Analyst',
    ROLE_VIEWER: 'Viewer',
};

function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [pendingRoles, setPendingRoles] = useState({});
    const [loadingActions, setLoadingActions] = useState({});
    const [toast, setToast] = useState(null);

    const isAdmin = JSON.parse(localStorage.getItem('roles') || '[]').includes('ROLE_ADMIN');

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            const initialRoles = {};
            response.data.forEach(u => {
                const primaryRole = u.roles?.[0]?.name || 'ROLE_VIEWER';
                initialRoles[u.id] = primaryRole;
            });
            setPendingRoles(initialRoles);
        } catch (err) {
            setError('Failed to load users. Are you sure you are an Admin?');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const setLoading = (id, action, val) =>
        setLoadingActions(prev => ({ ...prev, [`${id}_${action}`]: val }));

    const handleApprove = async (id) => {
        setLoading(id, 'approve', true);
        try {
            await api.put(`/users/${id}/approve`);
            showToast('User approved successfully.');
            fetchUsers();
        } catch {
            showToast('Failed to approve user.', 'error');
        } finally {
            setLoading(id, 'approve', false);
        }
    };

    const handleDelete = async (id, username) => {
        if (!window.confirm(`Remove "${username}" permanently? This cannot be undone.`)) return;
        setLoading(id, 'delete', true);
        try {
            await api.delete(`/users/${id}`);
            showToast(`User "${username}" removed.`);
            fetchUsers();
        } catch {
            showToast('Failed to remove user.', 'error');
        } finally {
            setLoading(id, 'delete', false);
        }
    };

    const handleChangeRole = async (id) => {
        const newRole = pendingRoles[id];
        setLoading(id, 'role', true);
        try {
            await api.put(`/users/${id}/role`, newRole, {
                headers: { 'Content-Type': 'text/plain' },
            });
            showToast(`Role updated to ${ROLE_LABELS[newRole] || newRole}.`);
            fetchUsers();
        } catch {
            showToast('Failed to change role.', 'error');
        } finally {
            setLoading(id, 'role', false);
        }
    };

    const getUserRole = (u) => {
        if (!u.roles || u.roles.length === 0) return null;
        return u.roles[0].name;
    };

    if (!isAdmin) {
        return (
            <div style={styles.accessDenied}>
                <span style={styles.lockIcon}>🔒</span>
                <h2 style={{ color: '#ef4444', margin: '16px 0 8px' }}>Access Denied</h2>
                <p style={{ color: '#9ca3af' }}>This page is only accessible to Admins.</p>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            {toast && (
                <div style={{ ...styles.toast, background: toast.type === 'error' ? '#ef4444' : '#10b981' }}>
                    {toast.message}
                </div>
            )}

            <div style={styles.header}>
                <h2 style={styles.title}>
                    <span style={styles.shield}>🛡️</span> Manage Users
                </h2>
                <span style={styles.adminBadge}>Admin Panel</span>
            </div>

            {error && <div style={styles.errorBanner}>{error}</div>}

            <div style={styles.tableWrapper}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            {['ID', 'Username', 'Email', 'Status', 'Role', 'Actions'].map(h => (
                                <th key={h} style={styles.th}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#6b7280' }}>
                                    No users found.
                                </td>
                            </tr>
                        ) : users.map(u => {
                            const currentRole = getUserRole(u);
                            const roleColor = ROLE_COLORS[currentRole] || '#6b7280';
                            return (
                                <tr key={u.id} style={styles.tr}>
                                    <td style={styles.td}>{u.id}</td>
                                    <td style={{ ...styles.td, fontWeight: 600 }}>{u.username}</td>
                                    <td style={{ ...styles.td, color: '#9ca3af' }}>{u.email}</td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.statusBadge,
                                            background: u.active ? '#064e3b' : '#431407',
                                            color: u.active ? '#34d399' : '#fb923c',
                                            border: `1px solid ${u.active ? '#059669' : '#ea580c'}`,
                                        }}>
                                            {u.active ? '✓ Approved' : '⏳ Pending'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>
                                        <span style={{
                                            ...styles.roleBadge,
                                            background: `${roleColor}22`,
                                            color: roleColor,
                                            border: `1px solid ${roleColor}55`,
                                        }}>
                                            {ROLE_LABELS[currentRole] || currentRole || '—'}
                                        </span>
                                    </td>
                                    <td style={{ ...styles.td, minWidth: '320px' }}>
                                        <div style={styles.actionsRow}>
                                            {/* Approve button — only if not yet active */}
                                            {!u.active && (
                                                <button
                                                    style={{ ...styles.btn, ...styles.btnApprove }}
                                                    onClick={() => handleApprove(u.id)}
                                                    disabled={loadingActions[`${u.id}_approve`]}
                                                >
                                                    {loadingActions[`${u.id}_approve`] ? '...' : '✓ Approve'}
                                                </button>
                                            )}

                                            {/* Change role section */}
                                            <select
                                                value={pendingRoles[u.id] || currentRole || 'ROLE_VIEWER'}
                                                onChange={e => setPendingRoles(prev => ({ ...prev, [u.id]: e.target.value }))}
                                                style={styles.select}
                                            >
                                                {ROLES.map(r => (
                                                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                                                ))}
                                            </select>
                                            <button
                                                style={{ ...styles.btn, ...styles.btnRole }}
                                                onClick={() => handleChangeRole(u.id)}
                                                disabled={loadingActions[`${u.id}_role`]}
                                            >
                                                {loadingActions[`${u.id}_role`] ? '...' : '↻ Apply'}
                                            </button>

                                            {/* Remove user */}
                                            <button
                                                style={{ ...styles.btn, ...styles.btnDelete }}
                                                onClick={() => handleDelete(u.id, u.username)}
                                                disabled={loadingActions[`${u.id}_delete`]}
                                            >
                                                {loadingActions[`${u.id}_delete`] ? '...' : '✕ Remove'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: '100vh',
        background: '#ffffff',
        padding: '32px 24px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: '#1e293b',
        position: 'relative',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
    },
    title: {
        fontSize: '24px',
        fontWeight: 700,
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    shield: {
        fontSize: '22px',
    },
    adminBadge: {
        background: '#1e293b',
        color: '#ef4444',
        border: '1px solid #ef444455',
        borderRadius: '9999px',
        padding: '4px 14px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.05em',
    },
    errorBanner: {
        background: '#450a0a',
        border: '1px solid #ef4444',
        color: '#fca5a5',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        fontSize: '14px',
    },
    tableWrapper: {
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflowX: 'auto',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        padding: '14px 16px',
        textAlign: 'left',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#64748b',
        borderBottom: '1px solid #e2e8f0',
        background: '#f8fafc',
    },
    tr: {
        borderBottom: '1px solid #f1f5f9',
        transition: 'background 0.15s',
    },
    td: {
        padding: '14px 16px',
        fontSize: '14px',
        verticalAlign: 'middle',
    },
    statusBadge: {
        display: 'inline-block',
        borderRadius: '9999px',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: 600,
    },
    roleBadge: {
        display: 'inline-block',
        borderRadius: '6px',
        padding: '3px 10px',
        fontSize: '12px',
        fontWeight: 600,
    },
    actionsRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
    },
    btn: {
        padding: '6px 12px',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: 600,
        transition: 'opacity 0.15s, transform 0.1s',
        whiteSpace: 'nowrap',
    },
    btnApprove: {
        background: '#059669',
        color: '#fff',
    },
    btnRole: {
        background: '#2563eb',
        color: '#fff',
    },
    btnDelete: {
        background: '#dc2626',
        color: '#fff',
    },
    select: {
        background: '#ffffff',
        color: '#1e293b',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        padding: '6px 10px',
        fontSize: '13px',
        cursor: 'pointer',
        outline: 'none',
    },
    toast: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: 600,
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        animation: 'slideIn 0.3s ease',
    },
    accessDenied: {
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    lockIcon: {
        fontSize: '48px',
    },
};

export default ManageUsers;
