import React, { useState, useEffect } from 'react';
import api from '../api';
import { FiPlus, FiTrash2, FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi';

const Transactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [transfers, setTransfers] = useState([]);
    const [wallets, setWallets] = useState([]);
    const [categories, setCategories] = useState([]);
    
    // Switch between Income/Expense or Transfer
    const [activeTab, setActiveTab] = useState('transaction');
    const [notification, setNotification] = useState({ type: '', text: '' });

    const showNotification = (text, type = 'error') => {
        setNotification({ type, text });
        setTimeout(() => {
            setNotification({ type: '', text: '' });
        }, 5000);
    };

    // Form state - Transaction
    const [walletId, setWalletId] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [type, setType] = useState('expense');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

    // Form state - Transfer
    const [fromWalletId, setFromWalletId] = useState('');
    const [toWalletId, setToWalletId] = useState('');
    const [transferAmount, setTransferAmount] = useState('');
    const [transferNote, setTransferNote] = useState('');
    const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchData = async () => {
        const [txRes, trRes, walletRes, catRes] = await Promise.all([
            api.get('/transactions'),
            api.get('/transfers'),
            api.get('/wallets'),
            api.get('/categories')
        ]);
        setTransactions(txRes.data);
        setTransfers(trRes.data);
        setWallets(walletRes.data);
        
        if (catRes.data.length === 0) {
            await api.post('/categories', { name: 'Lương', type: 'income', color: '#10b981' });
            await api.post('/categories', { name: 'Ăn uống', type: 'expense', color: '#ef4444' });
            const newCatRes = await api.get('/categories');
            setCategories(newCatRes.data);
        } else {
            setCategories(catRes.data);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateTransaction = async (e) => {
        e.preventDefault();
        try {
            await api.post('/transactions', {
                wallet_id: walletId,
                category_id: categoryId,
                type,
                amount,
                note,
                transaction_date: transactionDate
            });
            setAmount('');
            setNote('');
            fetchData();
            showNotification('Tạo giao dịch thành công!', 'success');
        } catch (error) {
            showNotification('Lỗi tạo giao dịch. Vui lòng kiểm tra lại!', 'error');
        }
    };

    const handleCreateTransfer = async (e) => {
        e.preventDefault();
        if (fromWalletId === toWalletId) {
            showNotification('Ví nguồn và ví đích không được trùng nhau!', 'error');
            return;
        }
        try {
            await api.post('/transfers', {
                from_wallet_id: fromWalletId,
                to_wallet_id: toWalletId,
                amount: transferAmount,
                note: transferNote,
                transfer_date: transferDate
            });
            setTransferAmount('');
            setTransferNote('');
            fetchData();
            showNotification('Chuyển tiền thành công!', 'success');
        } catch (error) {
            showNotification('Lỗi giao dịch chuyển tiền. Vui lòng kiểm tra lại số dư!', 'error');
            console.error(error);
        }
    };

    const handleDeleteTransaction = async (id) => {
        if(window.confirm('Xóa giao dịch này?')) {
            try {
                await api.delete(`/transactions/${id}`);
                fetchData();
                showNotification('Xóa giao dịch thành công!', 'success');
            } catch (error) {
                showNotification('Lỗi khi xóa giao dịch!', 'error');
                console.error(error);
            }
        }
    }

    const handleDeleteTransfer = async (id) => {
        if(window.confirm('Xóa giao dịch chuyển tiền này? (Số dư 2 ví sẽ được phục hồi)')) {
            try {
                await api.delete(`/transfers/${id}`);
                fetchData();
                showNotification('Xóa giao dịch chuyển tiền thành công!', 'success');
            } catch (error) {
                showNotification('Lỗi khi xóa giao dịch chuyển tiền!', 'error');
                console.error(error);
            }
        }
    }

    // Merge transactions and transfers to display in history
    const historyList = [
        ...transactions.map(t => ({ ...t, _type: 'transaction' })),
        ...transfers.map(t => ({ ...t, _type: 'transfer', transaction_date: t.transfer_date }))
    ].sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date));

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
            <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Ghi Chép Giao Dịch</h3>
                
                {notification.text && (
                    <div style={{
                        padding: '12px 16px',
                        marginBottom: '16px',
                        borderRadius: '8px',
                        background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: notification.type === 'success' ? '#34d399' : '#f87171',
                        border: `1px solid ${notification.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                        fontSize: '14px'
                    }}>
                        {notification.text}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <button 
                        onClick={() => setActiveTab('transaction')}
                        className="glass-button" 
                        style={{ flex: 1, padding: '8px', background: activeTab === 'transaction' ? 'rgba(59, 130, 246, 0.2)' : 'transparent', color: activeTab === 'transaction' ? '#60a5fa' : 'var(--text-secondary)' }}
                    >
                        Thu / Chi
                    </button>
                    <button 
                        onClick={() => setActiveTab('transfer')}
                        className="glass-button" 
                        style={{ flex: 1, padding: '8px', background: activeTab === 'transfer' ? 'rgba(168, 85, 247, 0.2)' : 'transparent', color: activeTab === 'transfer' ? '#c084fc' : 'var(--text-secondary)' }}
                    >
                        Chuyển Tiền
                    </button>
                </div>

                {activeTab === 'transaction' ? (
                    <form onSubmit={handleCreateTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="radio" checked={type === 'expense'} onChange={() => setType('expense')} /> Chi phí
                            </label>
                            <label style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input type="radio" checked={type === 'income'} onChange={() => setType('income')} /> Thu nhập
                            </label>
                        </div>

                        <select className="glass-input" value={walletId} onChange={e => setWalletId(e.target.value)} required>
                            <option value="" disabled>-- Chọn Ví --</option>
                            {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({parseFloat(w.balance).toLocaleString()})</option>)}
                        </select>

                        <select className="glass-input" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                            <option value="" disabled>-- Chọn Danh Mục --</option>
                            {categories.filter(c => c.type === type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>

                        <input type="number" className="glass-input" placeholder="Số tiền" value={amount} onChange={e => setAmount(e.target.value)} required />
                        <input type="text" className="glass-input" placeholder="Ghi chú" value={note} onChange={e => setNote(e.target.value)} />
                        <input type="date" className="glass-input" value={transactionDate} onChange={e => setTransactionDate(e.target.value)} required />

                        <button type="submit" className="glass-button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: type === 'income' ? 'var(--success-color)' : 'var(--danger-color)' }}>
                            <FiPlus /> Lưu Giao Dịch
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleCreateTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <select className="glass-input" value={fromWalletId} onChange={e => setFromWalletId(e.target.value)} required>
                            <option value="" disabled>-- Từ Ví (Trừ tiền) --</option>
                            {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({parseFloat(w.balance).toLocaleString()})</option>)}
                        </select>

                        <select className="glass-input" value={toWalletId} onChange={e => setToWalletId(e.target.value)} required>
                            <option value="" disabled>-- Đến Ví (Cộng tiền) --</option>
                            {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({parseFloat(w.balance).toLocaleString()})</option>)}
                        </select>

                        <input type="number" className="glass-input" placeholder="Số tiền chuyển" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} required min="0.01" step="0.01" />
                        <input type="text" className="glass-input" placeholder="Ghi chú (Ví dụ: Rút tiền ATM)" value={transferNote} onChange={e => setTransferNote(e.target.value)} />
                        <input type="date" className="glass-input" value={transferDate} onChange={e => setTransferDate(e.target.value)} required />

                        <button type="submit" className="glass-button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', background: 'rgba(168, 85, 247, 0.4)', color: 'white' }}>
                            <FiRefreshCw /> Thực Hiện Chuyển
                        </button>
                    </form>
                )}
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginTop: 0 }}>Lịch Sử Giao Dịch</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {historyList.length === 0 ? <p style={{ color: 'var(--text-secondary)' }}>Chưa có giao dịch nào.</p> : historyList.map(item => (
                        <div key={`${item._type}-${item.id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ 
                                    width: '48px', height: '48px', borderRadius: '50%', 
                                    background: item._type === 'transfer' ? 'rgba(168, 85, 247, 0.2)' : (item.type === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'), 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    color: item._type === 'transfer' ? '#c084fc' : (item.type === 'income' ? 'var(--success-color)' : 'var(--danger-color)') 
                                }}>
                                    {item._type === 'transfer' ? <FiRefreshCw size={24} /> : (item.type === 'income' ? <FiTrendingUp size={24} /> : <FiTrendingDown size={24} />)}
                                </div>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                                        {item._type === 'transfer' ? (item.note || 'Chuyển tiền nội bộ') : (item.note || item.category?.name)}
                                    </div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                        {item._type === 'transfer' 
                                            ? `Từ ${item.from_wallet?.name} sang ${item.to_wallet?.name}` 
                                            : `Ví: ${item.wallet?.name}`} • {new Date(item.transaction_date).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                                <div style={{ 
                                    fontWeight: 'bold', fontSize: '18px', 
                                    color: item._type === 'transfer' ? '#c084fc' : (item.type === 'income' ? 'var(--success-color)' : 'var(--text-primary)') 
                                }}>
                                    {item._type === 'transfer' ? '' : (item.type === 'income' ? '+' : '-')}
                                    {parseFloat(item.amount).toLocaleString()}
                                </div>
                                <button 
                                    onClick={() => item._type === 'transfer' ? handleDeleteTransfer(item.id) : handleDeleteTransaction(item.id)} 
                                    className="glass-button" style={{ background: 'transparent', color: 'var(--danger-color)', border: '1px solid var(--danger-color)', padding: '8px' }}
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Transactions;
