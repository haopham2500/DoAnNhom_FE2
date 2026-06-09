import React, { useState, useEffect } from 'react';
import api from '../api';
import { FiPlus, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Budgets = () => {
    const [budgets, setBudgets] = useState([]);
    const [categories, setCategories] = useState([]);
    const [transactions, setTransactions] = useState([]);
    
    // Form state
    const [categoryId, setCategoryId] = useState('');
    const [amount, setAmount] = useState('');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [notification, setNotification] = useState({ type: '', text: '' });

    const showNotification = (text, type = 'error') => {
        setNotification({ type, text });
        setTimeout(() => {
            setNotification({ type: '', text: '' });
        }, 5000);
    };

    const fetchData = async () => {
        const [budgetsRes, catRes, txRes] = await Promise.all([
            api.get('/budgets'),
            api.get('/categories'),
            api.get('/transactions')
        ]);
        setBudgets(budgetsRes.data);
        setCategories(catRes.data.filter(c => c.type === 'expense'));
        setTransactions(txRes.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (parseFloat(amount) < 0) {
            showNotification('Yêu cầu nhập số dương!', 'error');
            return;
        }
        try {
            await api.post('/budgets', {
                category_id: categoryId,
                amount,
                month,
                year
            });
            setAmount('');
            fetchData();
            showNotification('Tạo ngân sách thành công!', 'success');
        } catch (error) {
            showNotification('Lỗi tạo ngân sách. Vui lòng thử lại!', 'error');
        }
    };

    // Calculate budget progress
    const getBudgetProgress = (budget) => {
        const spent = transactions
            .filter(tx => 
                tx.category_id === budget.category_id && 
                new Date(tx.transaction_date).getMonth() + 1 === parseInt(budget.month) &&
                new Date(tx.transaction_date).getFullYear() === parseInt(budget.year)
            )
            .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);
        
        const limit = parseFloat(budget.amount);
        const percent = Math.min((spent / limit) * 100, 100);
        const isExceeded = spent > limit;

        return { spent, limit, percent, isExceeded };
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}
        >
            <div className="glass-panel" style={{ padding: '24px', height: 'fit-content' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Thiết Lập Ngân Sách</h3>
                
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

                <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <select className="glass-input" value={month} onChange={e => setMonth(e.target.value)} required>
                            {[...Array(12).keys()].map(m => <option key={m+1} value={m+1}>Tháng {m+1}</option>)}
                        </select>
                        <input type="number" className="glass-input" value={year} onChange={e => setYear(e.target.value)} required />
                    </div>

                    <select className="glass-input" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
                        <option value="" disabled>-- Chọn Danh Mục Chi Tiêu --</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>

                    <input 
                        type="number"
                        min="0"
                        className="glass-input" 
                        placeholder="Số tiền giới hạn" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        required 
                    />

                    <button type="submit" className="glass-button" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        <FiPlus /> Lưu Ngân Sách
                    </button>
                </form>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '24px' }}>Theo Dõi Ngân Sách</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <AnimatePresence>
                        {budgets.length === 0 ? (
                            <p style={{ color: 'var(--text-secondary)' }}>Chưa có ngân sách nào được thiết lập.</p>
                        ) : budgets.map((budget, index) => {
                            const { spent, limit, percent, isExceeded } = getBudgetProgress(budget);
                            return (
                                <motion.div 
                                    key={budget.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.4 }}
                                    className={isExceeded ? "glass-panel budget-card budget-exceeded-pulse" : "glass-panel budget-card"}
                                    style={{ 
                                        padding: '16px', 
                                        background: 'rgba(255,255,255,0.01)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        transition: 'all 0.3s ease',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{budget.category?.name}</span>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '12px', marginLeft: '8px' }}>
                                                (T{budget.month}/{budget.year})
                                            </span>
                                        </div>
                                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: isExceeded ? 'var(--danger-color)' : 'var(--text-primary)' }}>
                                            {spent.toLocaleString()} <span style={{ fontWeight: 'normal', fontSize: '12px', color: 'var(--text-secondary)' }}>/ {limit.toLocaleString()} VNĐ</span>
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${percent}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            style={{ 
                                                height: '100%', 
                                                background: isExceeded 
                                                    ? 'linear-gradient(90deg, #ef4444, #b91c1c)' 
                                                    : (percent > 80 
                                                        ? 'linear-gradient(90deg, #f59e0b, #d97706)' 
                                                        : 'linear-gradient(90deg, var(--primary-color), #818cf8)'),
                                                borderRadius: '4px',
                                                boxShadow: isExceeded 
                                                    ? '0 0 8px rgba(239, 68, 68, 0.4)' 
                                                    : (percent > 80 ? '0 0 8px rgba(245, 158, 11, 0.4)' : '0 0 8px rgba(79, 70, 229, 0.4)')
                                            }}
                                        ></motion.div>
                                    </div>
                                    {isExceeded ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--danger-color)', fontSize: '12px', marginTop: '10px', fontWeight: '500' }}>
                                            <FiAlertCircle style={{ animation: 'shake 0.5s ease infinite alternate' }} /> Đã vượt ngân sách! (Hao hụt {(spent - limit).toLocaleString()} VNĐ)
                                        </div>
                                    ) : (
                                        <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '10px' }}>
                                            Còn lại {(limit - spent).toLocaleString()} VNĐ có thể sử dụng
                                        </div>
                                    )}
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default Budgets;
