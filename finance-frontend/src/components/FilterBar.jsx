import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

/**
 * FilterBar — shared filter UI used by Dashboard and Transactions pages.
 *
 * Props:
 *  onApply(filters)  — called when Apply is clicked; filters = { dateFrom, dateTo, username, minAmount, maxAmount }
 *  onReset()         — called when Reset is clicked
 */
function FilterBar({ onApply, onReset }) {
    const [dateFrom, setDateFrom]     = useState('');
    const [dateTo, setDateTo]         = useState('');
    const [month, setMonth]           = useState('');   // "YYYY-MM" quick picker
    const [username, setUsername]     = useState('');
    const [minAmount, setMinAmount]   = useState('');
    const [maxAmount, setMaxAmount]   = useState('');
    const [users, setUsers]           = useState([]);
    const [expanded, setExpanded]     = useState(false);

    // Load distinct creators from backend
    useEffect(() => {
        api.get('/transactions/users')
            .then(r => setUsers(r.data || []))
            .catch(() => {});
    }, []);

    // When month picker changes, derive dateFrom/dateTo from it
    const handleMonthChange = (value) => {
        setMonth(value);
        if (value) {
            const [y, m] = value.split('-');
            const from = `${y}-${m}-01`;
            const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate();
            const to   = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
            setDateFrom(from);
            setDateTo(to);
        } else {
            setDateFrom('');
            setDateTo('');
        }
    };

    const handleDateFromChange = (v) => { setDateFrom(v); setMonth(''); };
    const handleDateToChange   = (v) => { setDateTo(v);   setMonth(''); };

    const handleApply = () => {
        onApply({
            dateFrom:  dateFrom  || null,
            dateTo:    dateTo    || null,
            username:  username  || null,
            minAmount: minAmount || null,
            maxAmount: maxAmount || null,
        });
    };

    const handleReset = () => {
        setDateFrom(''); setDateTo(''); setMonth('');
        setUsername(''); setMinAmount(''); setMaxAmount('');
        onReset();
    };

    const activeCount = [dateFrom, dateTo, username, minAmount, maxAmount].filter(Boolean).length;

    return (
        <div style={s.wrapper}>
            {/* Header row — always visible */}
            <div style={s.headerRow} onClick={() => setExpanded(e => !e)}>
                <div style={s.headerLeft}>
                    <span style={s.filterIcon}>⚙</span>
                    <span style={s.headerTitle}>Filters</span>
                    {activeCount > 0 && (
                        <span style={s.activeBadge}>{activeCount} active</span>
                    )}
                </div>
                <span style={{ color: '#64748b', fontSize: '18px', userSelect: 'none' }}>
                    {expanded ? '▲' : '▼'}
                </span>
            </div>

            {/* Collapsible filter fields */}
            {expanded && (
                <div style={s.body}>
                    <div style={s.grid}>
                        {/* Month picker (quick) */}
                        <div style={s.field}>
                            <label style={s.label}>Quick Month</label>
                            <input
                                type="month"
                                value={month}
                                onChange={e => handleMonthChange(e.target.value)}
                                style={s.input}
                            />
                        </div>

                        {/* Date From */}
                        <div style={s.field}>
                            <label style={s.label}>Date From</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={e => handleDateFromChange(e.target.value)}
                                style={s.input}
                            />
                        </div>

                        {/* Date To */}
                        <div style={s.field}>
                            <label style={s.label}>Date To</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={e => handleDateToChange(e.target.value)}
                                style={s.input}
                            />
                        </div>

                        {/* Added By (username) */}
                        <div style={s.field}>
                            <label style={s.label}>Added By</label>
                            <select
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                style={s.input}
                            >
                                <option value="">— All Users —</option>
                                {users.map(u => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>

                        {/* Min Amount */}
                        <div style={s.field}>
                            <label style={s.label}>Min Amount (₹)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={minAmount}
                                onChange={e => setMinAmount(e.target.value)}
                                placeholder="0.00"
                                style={s.input}
                            />
                        </div>

                        {/* Max Amount */}
                        <div style={s.field}>
                            <label style={s.label}>Max Amount (₹)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={maxAmount}
                                onChange={e => setMaxAmount(e.target.value)}
                                placeholder="∞"
                                style={s.input}
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div style={s.actions}>
                        <button style={{ ...s.btn, ...s.btnApply }} onClick={handleApply}>
                            Apply Filters
                        </button>
                        <button style={{ ...s.btn, ...s.btnReset }} onClick={handleReset}>
                            ✕ Reset
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

const s = {
    wrapper: {
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        marginBottom: '24px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    },
    headerRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        cursor: 'pointer',
        userSelect: 'none',
        background: '#f8fafc',
        transition: 'background 0.15s',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    filterIcon: {
        fontSize: '16px',
        color: '#38bdf8',
    },
    headerTitle: {
        fontWeight: 600,
        fontSize: '15px',
        color: '#1e293b',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    activeBadge: {
        background: '#0ea5e9',
        color: '#fff',
        fontSize: '11px',
        fontWeight: 700,
        borderRadius: '9999px',
        padding: '2px 9px',
    },
    body: {
        padding: '0 20px 20px',
        borderTop: '1px solid #e2e8f0',
        background: '#ffffff',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px',
        marginTop: '16px',
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '11px',
        fontWeight: 600,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    input: {
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '7px',
        padding: '8px 10px',
        color: '#1e293b',
        fontSize: '13px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
    },
    actions: {
        display: 'flex',
        gap: '10px',
        marginTop: '18px',
        flexWrap: 'wrap',
    },
    btn: {
        padding: '9px 20px',
        borderRadius: '7px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 700,
        fontSize: '13px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        transition: 'opacity 0.15s',
    },
    btnApply: {
        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
        color: '#fff',
    },
    btnReset: {
        background: '#f1f5f9',
        color: '#64748b',
        border: '1px solid #e2e8f0',
    },
};

export default FilterBar;
