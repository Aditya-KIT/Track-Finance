import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/dashboard/stats');
            setStats(response.data);
        } catch (err) {
            console.error('Failed to load dashboard stats', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const fmt = (val) =>
        val !== undefined && val !== null
            ? Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '—';

    return (
        <div style={s.page}>
            <div style={s.pageHeader}>
                <h2 style={s.pageTitle}>📊 Dashboard</h2>
            </div>

            {/* ── KPI CARDS ── */}
            {loading ? (
                <div style={s.loader}>Loading stats…</div>
            ) : (
                <>
                    <div style={s.kpiRow}>
                        <KpiCard label="Total Income" value={`₹${fmt(stats?.totalIncome)}`} color="#34d399" icon="▲" />
                        <KpiCard label="Total Expense" value={`₹${fmt(stats?.totalExpense)}`} color="#f87171" icon="▼" />
                        <KpiCard
                            label="Net Balance"
                            value={`₹${fmt(stats?.netBalance)}`}
                            color={Number(stats?.netBalance) >= 0 ? '#38bdf8' : '#fb923c'}
                            icon="≈"
                        />
                    </div>
                </>
            )}
        </div>
    );
}

function KpiCard({ label, value, color, icon }) {
    return (
        <div className="hover-card" style={{
            background: '#f8fafc',
            border: `1px solid ${color}33`,
            borderRadius: '12px',
            padding: '24px',
            flex: 1,
            minWidth: '200px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
            <div className="icon-text" style={{ fontSize: '28px', marginBottom: '8px', color }}>{icon}</div>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                {label}
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color, fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
                {value}
            </div>
        </div>
    );
}

const s = {
    page: {
        minHeight: '100vh',
        background: '#ffffff',
        padding: '32px 24px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        color: '#1e293b',
    },
    pageHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        marginBottom: '28px',
    },
    pageTitle: {
        fontSize: '24px',
        fontWeight: 700,
        margin: 0,
        color: '#0f172a',
    },
    loader: {
        color: '#64748b',
        fontSize: '16px',
        padding: '40px 0',
    },
    kpiRow: {
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        marginBottom: '32px',
    },
};

export default Dashboard;
