import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import FilterBar from './FilterBar';
import { useAuth } from '../context/AuthContext';

function Transactions() {
    const navigate = useNavigate();
    const { isViewer } = useAuth();

    useEffect(() => {
        if (isViewer) {
            navigate('/dashboard');
        }
    }, [isViewer, navigate]);

    const [transactions, setTransactions] = useState([]);
    const [activeFilters, setActiveFilters] = useState({});

    // Form state for adding a new transaction
    const [amount, setAmount]           = useState('');
    const [type, setType]               = useState('INCOME');
    const [category, setCategory]       = useState('');
    const [date, setDate]               = useState('');
    const [description, setDescription] = useState('');
    const [formOpen, setFormOpen]       = useState(false);
    const [submitting, setSubmitting]   = useState(false);
    const [toast, setToast]             = useState(null);

    // Form state for editing a transaction
    const [editingId, setEditingId]           = useState(null);
    const [editAmount, setEditAmount]         = useState('');
    const [editType, setEditType]             = useState('INCOME');
    const [editCategory, setEditCategory]     = useState('');
    const [editDate, setEditDate]             = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editFormOpen, setEditFormOpen]     = useState(false);
    const [editSubmitting, setEditSubmitting] = useState(false);

    // State for delete confirmation
    const [deleteConfirm, setDeleteConfirm]   = useState(null);
    const [deleting, setDeleting]             = useState(false);

    // State for sorting
    const [sortBy, setSortBy] = useState(null); // 'date' or 'amount'
    const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

    // State for pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 20;

    const roles = JSON.parse(localStorage.getItem('roles') || '[]');
    const isAdmin = roles.some(r => r === 'ROLE_ADMIN');

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const buildParams = (filters = activeFilters) => {
        const p = { size: 50 };
        if (filters.dateFrom)  p.dateFrom  = filters.dateFrom;
        if (filters.dateTo)    p.dateTo    = filters.dateTo;
        if (filters.username)  p.username  = filters.username;
        if (filters.minAmount) p.minAmount = filters.minAmount;
        if (filters.maxAmount) p.maxAmount = filters.maxAmount;
        return p;
    };

    const fetchTransactions = async (filters) => {
        try {
            const response = await api.get('/transactions', { params: buildParams(filters) });
            setTransactions(response.data.content || []);
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        }
    };

    useEffect(() => {
        fetchTransactions({});
    }, []);

    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
        setCurrentPage(1);
        fetchTransactions(filters);
    };

    const handleResetFilters = () => {
        setActiveFilters({});
        setCurrentPage(1);
        fetchTransactions({});
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/transactions', { amount, type, category, date, description });
            setAmount(''); setType('INCOME'); setCategory('');
            setDate(''); setDescription('');
            setFormOpen(false);
            setCurrentPage(1);
            showToast('Transaction added successfully.');
            fetchTransactions(activeFilters);
        } catch {
            showToast('Failed to create transaction.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditClick = (transaction) => {
        setEditingId(transaction.id);
        setEditAmount(transaction.amount.toString());
        setEditType(transaction.type);
        setEditCategory(transaction.category);
        setEditDate(transaction.date);
        setEditDescription(transaction.description || '');
        setEditFormOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setEditSubmitting(true);
        try {
            await api.put(`/transactions/${editingId}`, { 
                amount: editAmount, 
                type: editType, 
                category: editCategory, 
                date: editDate, 
                description: editDescription 
            });
            setEditingId(null);
            setEditFormOpen(false);
            setCurrentPage(1);
            showToast('Transaction updated successfully.');
            fetchTransactions(activeFilters);
        } catch {
            showToast('Failed to update transaction.', 'error');
        } finally {
            setEditSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormOpen(false);
        setEditAmount(''); setEditType('INCOME'); setEditCategory('');
        setEditDate(''); setEditDescription('');
    };

    const handleDeleteClick = (transaction) => {
        setDeleteConfirm({
            id: transaction.id,
            category: transaction.category,
            amount: transaction.amount,
            type: transaction.type,
        });
    };

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            await api.delete(`/transactions/${deleteConfirm.id}`);
            setDeleteConfirm(null);
            setCurrentPage(1);
            showToast('Transaction deleted successfully.');
            fetchTransactions(activeFilters);
        } catch {
            showToast('Failed to delete transaction.', 'error');
        } finally {
            setDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirm(null);
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            // Toggle direction if clicking the same column
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            // Set new column and reset to ascending
            setSortBy(column);
            setSortDirection('asc');
        }
    };

    const getSortedTransactions = () => {
        if (!sortBy) return transactions;

        const sorted = [...transactions];
        sorted.sort((a, b) => {
            let aVal, bVal;
            
            if (sortBy === 'date') {
                aVal = new Date(a.date);
                bVal = new Date(b.date);
            } else if (sortBy === 'amount') {
                aVal = a.amount;
                bVal = b.amount;
            }

            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return sorted;
    };

    const getPaginatedTransactions = () => {
        const sorted = getSortedTransactions();
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return sorted.slice(startIndex, endIndex);
    };

    const getTotalPages = () => {
        const sorted = getSortedTransactions();
        return Math.ceil(sorted.length / ITEMS_PER_PAGE);
    };

    return (
        <div style={s.page}>
            {toast && (
                <div style={{ ...s.toast, background: toast.type === 'error' ? '#ef4444' : '#10b981' }}>
                    {toast.msg}
                </div>
            )}

            <div style={s.pageHeader}>
                <h2 style={s.pageTitle}>💳 Transactions</h2>
            </div>

            {/* ── FILTER BAR (above Add New) ── */}
            <FilterBar onApply={handleApplyFilters} onReset={handleResetFilters} />

            {/* ── ADD NEW TRANSACTION ── */}
            {isAdmin && (
                <div style={s.addSection}>
                    <button
                        style={s.toggleFormBtn}
                        onClick={() => setFormOpen(o => !o)}
                    >
                        {formOpen ? '✕ Cancel' : '＋ Add New Transaction'}
                    </button>

                    {formOpen && (
                        <form onSubmit={handleCreate} style={s.form}>
                            <h3 style={s.formTitle}>New Transaction</h3>
                            <div style={s.formGrid}>
                                <div style={s.field}>
                                    <label style={s.label}>Amount (₹)</label>
                                    <input
                                        type="number" step="0.01" min="0.01"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        style={s.input}
                                    />
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>Type</label>
                                    <select value={type} onChange={e => setType(e.target.value)} style={s.input}>
                                        <option value="INCOME">Income</option>
                                        <option value="EXPENSE">Expense</option>
                                    </select>
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>Category</label>
                                    <input
                                        type="text" value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        placeholder="e.g. Rent, Salary"
                                        required style={s.input}
                                    />
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>Date</label>
                                    <input
                                        type="date" value={date}
                                        onChange={e => setDate(e.target.value)}
                                        required style={s.input}
                                    />
                                </div>
                                <div style={{ ...s.field, gridColumn: '1 / -1' }}>
                                    <label style={s.label}>Description</label>
                                    <input
                                        type="text" value={description}
                                        onChange={e => setDescription(e.target.value)}
                                        placeholder="Optional note"
                                        maxLength="40"
                                        style={s.input}
                                    />
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} style={s.submitBtn}>
                                {submitting ? 'Saving…' : 'Save Transaction'}
                            </button>
                        </form>
                    )}
                </div>
            )}

            {/* ── TRANSACTIONS TABLE ── */}
            <div style={s.tableWrapper}>
                <table style={s.table}>
                    <thead>
                        <tr>
                            <th key="date" style={{ ...s.th, cursor: 'pointer' }} onClick={() => handleSort('date')}>
                                Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th key="type" style={s.th}>Type</th>
                            <th key="category" style={s.th}>Category</th>
                            <th key="amount" style={{ ...s.th, cursor: 'pointer' }} onClick={() => handleSort('amount')}>
                                Amount {sortBy === 'amount' && (sortDirection === 'asc' ? '↑' : '↓')}
                            </th>
                            <th key="description" style={s.th}>Description</th>
                            {isAdmin && <th style={s.th}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={isAdmin ? 6 : 5} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                                    No transactions found.
                                </td>
                            </tr>
                        ) : getPaginatedTransactions().map(t => (
                            <tr key={t.id} style={s.tr}>
                                <td style={s.td}>{t.date}</td>
                                <td style={s.td}>
                                    <span style={{
                                        ...s.typeBadge,
                                        background: t.type === 'INCOME' ? '#064e3b' : '#450a0a',
                                        color: t.type === 'INCOME' ? '#34d399' : '#f87171',
                                        border: `1px solid ${t.type === 'INCOME' ? '#059669' : '#dc2626'}`,
                                    }}>
                                        {t.type === 'INCOME' ? '▲' : '▼'} {t.type}
                                    </span>
                                </td>
                                <td style={s.td}>{t.category}</td>
                                <td style={{
                                    ...s.td,
                                    fontWeight: 700,
                                    color: t.type === 'INCOME' ? '#34d399' : '#f87171',
                                }}>
                                    ₹{Number(t.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </td>
                                <td style={{ ...s.td, color: '#64748b', fontStyle: 'italic' }}>
                                    {t.description || '—'}
                                </td>
                                {isAdmin && (
                                    <td style={s.td}>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <button
                                                onClick={() => handleEditClick(t)}
                                                style={s.editBtn}
                                            >
                                                ✎ Edit
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteClick(t)}
                                                    style={s.deleteBtn}
                                                >
                                                    🗑 Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── PAGINATION ── */}
            {getSortedTransactions().length > ITEMS_PER_PAGE && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', padding: '20px', alignItems: 'center' }}>
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        style={{
                            padding: '8px 16px',
                            background: currentPage === 1 ? '#cbd5e1' : '#6765f1',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentPage === 1 ? 'default' : 'pointer'
                        }}
                    >
                        ← Previous
                    </button>
                    
                    <span style={{ color: '#64748b', fontWeight: '600' }}>
                        Page {currentPage} of {getTotalPages()}
                    </span>
                    
                    <button
                        onClick={() => setCurrentPage(Math.min(getTotalPages(), currentPage + 1))}
                        disabled={currentPage === getTotalPages()}
                        style={{
                            padding: '8px 16px',
                            background: currentPage === getTotalPages() ? '#cbd5e1' : '#6765f1',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: currentPage === getTotalPages() ? 'default' : 'pointer'
                        }}
                    >
                        Next →
                    </button>
                </div>
            )}

            {/* ── EDIT TRANSACTION MODAL ── */}
            {editFormOpen && (
                <div style={s.modalOverlay} onClick={handleCancelEdit}>
                    <div style={s.modal} onClick={(e) => e.stopPropagation()}>
                        <form onSubmit={handleUpdate}>
                            <h3 style={s.formTitle}>Edit Transaction</h3>
                            <div style={s.formGrid}>
                                <div style={s.field}>
                                    <label style={s.label}>Amount (₹)</label>
                                    <input
                                        type="number" step="0.01" min="0.01"
                                        value={editAmount}
                                        onChange={e => setEditAmount(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        style={s.input}
                                    />
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>Type</label>
                                    <select value={editType} onChange={e => setEditType(e.target.value)} style={s.input}>
                                        <option value="INCOME">Income</option>
                                        <option value="EXPENSE">Expense</option>
                                    </select>
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>Category</label>
                                    <input
                                        type="text" value={editCategory}
                                        onChange={e => setEditCategory(e.target.value)}
                                        placeholder="e.g. Rent, Salary"
                                        required style={s.input}
                                    />
                                </div>
                                <div style={s.field}>
                                    <label style={s.label}>Date</label>
                                    <input
                                        type="date" value={editDate}
                                        onChange={e => setEditDate(e.target.value)}
                                        required style={s.input}
                                    />
                                </div>
                                <div style={{ ...s.field, gridColumn: '1 / -1' }}>
                                    <label style={s.label}>Description</label>
                                    <input
                                        type="text" value={editDescription}
                                        onChange={e => setEditDescription(e.target.value)}
                                        placeholder="Optional note"
                                        maxLength="40"
                                        style={s.input}
                                    />
                                </div>
                            </div>
                            <div style={s.modalButtonGroup}>
                                <button type="submit" disabled={editSubmitting} style={s.submitBtn}>
                                    {editSubmitting ? 'Saving…' : 'Update Transaction'}
                                </button>
                                <button type="button" onClick={handleCancelEdit} style={s.cancelBtn}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ── DELETE CONFIRMATION MODAL ── */}
            {deleteConfirm && (
                <div style={s.modalOverlay} onClick={handleCancelDelete}>
                    <div style={s.modal} onClick={(e) => e.stopPropagation()}>
                        <h3 style={s.formTitle}>Confirm Delete</h3>
                        <p style={s.deleteConfirmText}>
                            Are you sure you want to delete this transaction?
                        </p>
                        <div style={s.deleteDetails}>
                            <p><strong>Category:</strong> {deleteConfirm.category}</p>
                            <p><strong>Amount:</strong> ₹{Number(deleteConfirm.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            <p><strong>Type:</strong> {deleteConfirm.type}</p>
                        </div>
                        <p style={{ ...s.deleteConfirmText, color: '#ef4444', fontSize: '12px', marginTop: '16px' }}>
                            ⚠️ This action cannot be undone.
                        </p>
                        <div style={s.modalButtonGroup}>
                            <button 
                                onClick={handleConfirmDelete} 
                                disabled={deleting}
                                style={s.deleteConfirmBtn}
                            >
                                {deleting ? 'Deleting…' : 'Delete Transaction'}
                            </button>
                            <button 
                                type="button" 
                                onClick={handleCancelDelete} 
                                style={s.cancelBtn}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
        position: 'relative',
    },
    pageHeader: {
        marginBottom: '24px',
    },
    pageTitle: {
        fontSize: '24px',
        fontWeight: 700,
        margin: 0,
    },
    addSection: {
        marginBottom: '24px',
    },
    toggleFormBtn: {
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        fontWeight: 700,
        fontSize: '14px',
        cursor: 'pointer',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    form: {
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '14px',
    },
    formTitle: {
        fontSize: '16px',
        fontWeight: 700,
        margin: '0 0 18px',
        color: '#0f172a',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '18px',
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
    },
    input: {
        background: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '7px',
        padding: '8px 10px',
        color: '#1e293b',
        fontSize: '13px',
        outline: 'none',
        width: '100%',
        boxSizing: 'border-box',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    submitBtn: {
        background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 24px',
        fontWeight: 700,
        fontSize: '14px',
        cursor: 'pointer',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
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
        textAlign: 'center',
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
    },
    td: {
        padding: '13px 16px',
        fontSize: '14px',
        verticalAlign: 'middle',
    },
    typeBadge: {
        display: 'inline-block',
        borderRadius: '9999px',
        padding: '3px 10px',
        fontSize: '11px',
        fontWeight: 700,
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
    },
    editBtn: {
        background: '#6765f1',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 12px',
        fontWeight: 600,
        fontSize: '12px',
        cursor: 'pointer',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        transition: 'transform 0.2s ease',
    },
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
    },
    modal: {
        background: '#ffffff',
        borderRadius: '12px',
        padding: '32px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '85vh',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
    },
    modalButtonGroup: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '24px',
    },
    cancelBtn: {
        background: '#e2e8f0',
        color: '#475569',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 24px',
        fontWeight: 700,
        fontSize: '14px',
        cursor: 'pointer',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        transition: 'background 0.2s ease',
    },
    deleteBtn: {
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '6px 12px',
        fontWeight: 600,
        fontSize: '12px',
        cursor: 'pointer',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        transition: 'transform 0.2s ease',
    },
    deleteConfirmText: {
        fontSize: '14px',
        color: '#475569',
        margin: '16px 0',
        lineHeight: '1.5',
    },
    deleteDetails: {
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px 16px',
        margin: '12px 0',
        fontSize: '13px',
        color: '#475569',
    },
    deleteConfirmBtn: {
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px 24px',
        fontWeight: 700,
        fontSize: '14px',
        cursor: 'pointer',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
};

export default Transactions;
